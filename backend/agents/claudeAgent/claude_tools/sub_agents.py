"""
Preconfigured and dynamic Subagents for the main Claude agent.

Provides:
- list_subagents(): enumerate available subagents (core + custom)
- run_subagent(): run a single named subagent on a task
- run_subagents(): run a team of subagents in parallel and aggregate results
- register_subagent(): create a new custom subagent at runtime
- update_subagent(): modify an existing custom subagent
- delete_subagent(): remove a custom subagent

Implementation notes:
- Uses the existing ClaudeCompletions streaming path so tool use is handled
  automatically via the local tool executor in this codebase.
- Each subagent has a focused system prompt and an allowed tool list.
- Subagents are asked to return compact JSON to simplify aggregation.
"""

from __future__ import annotations

import asyncio
import json
from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional
from pathlib import Path
import os

# Import moved inside functions to avoid circular dependency


@dataclass
class SubAgentConfig:
    name: str
    description: str
    role_goal: str
    allowed_tools: List[str]
    instruction_suffix: str = (
        "Return ONLY valid JSON with keys: role, findings, actions, next_steps, "
        "estimated_savings (number or null), risks, sources. No extra prose."
    )

    def build_system_prompt(self) -> str:
        return (
            f"You are a specialized subagent named {self.name}.\n"
            f"Role: {self.description}.\n"
            f"Primary goal: {self.role_goal}.\n\n"
            "Guidelines:\n"
            "- Be precise and actionable.\n"
            "- Use tools when they significantly improve accuracy or speed.\n"
            "- Prefer official and reputable sources.\n"
            "- Keep HIPAA and safety constraints in mind.\n\n"
            f"{self.instruction_suffix}"
        )


def _catalog() -> Dict[str, SubAgentConfig]:
    """Blank-slate catalog (no preconfigured subagents)."""
    return {}


# -------------------------
# Dynamic registry handling
# -------------------------

REGISTRY_PATH = Path(os.path.dirname(__file__)) / "sub_agents_registry.json"


def _ensure_registry_dir():
    try:
        REGISTRY_PATH.parent.mkdir(parents=True, exist_ok=True)
    except Exception:
        pass


def _load_registry() -> Dict[str, SubAgentConfig]:
    """Load custom subagents from JSON registry file."""
    if not REGISTRY_PATH.exists():
        return {}
    try:
        import json as _json
        with REGISTRY_PATH.open("r", encoding="utf-8") as f:
            data = _json.load(f)
        result: Dict[str, SubAgentConfig] = {}
        for name, cfg in (data or {}).items():
            # Basic validation
            if not isinstance(cfg, dict):
                continue
            result[name] = SubAgentConfig(
                name=cfg.get("name", name),
                description=cfg.get("description", ""),
                role_goal=cfg.get("role_goal", ""),
                allowed_tools=list(cfg.get("allowed_tools", [])),
                instruction_suffix=cfg.get("instruction_suffix")
                or (
                    "Return ONLY valid JSON with keys: role, findings, actions, next_steps, "
                    "estimated_savings (number or null), risks, sources. No extra prose."
                ),
            )
        return result
    except Exception:
        return {}


def _save_registry(registry: Dict[str, SubAgentConfig]) -> None:
    """Persist custom subagents atomically to JSON registry file."""
    _ensure_registry_dir()
    import json as _json
    tmp_path = REGISTRY_PATH.with_suffix(".json.tmp")
    serializable = {name: asdict(cfg) for name, cfg in registry.items()}
    with tmp_path.open("w", encoding="utf-8") as f:
        _json.dump(serializable, f, ensure_ascii=False, indent=2)
    tmp_path.replace(REGISTRY_PATH)


def _all_tool_names() -> List[str]:
    # Lazy import to avoid circular dependency
    from backend.agents.claudeAgent.claude_tools.tools import get_tool_definitions_for_claude
    defs = get_tool_definitions_for_claude()
    return [d.get("name") for d in defs]


def _combined_catalog() -> Dict[str, SubAgentConfig]:
    """Merge core catalog with custom registry; disallow name collisions with core."""
    core = _catalog()
    custom = _load_registry()
    # Disallow overwriting core names
    for name in list(custom.keys()):
        if name in core:
            # Skip conflicting custom
            custom.pop(name, None)
    return {**core, **custom}


def _select_tools(allowed_names: List[str]) -> List[Dict[str, Any]]:
    """Filter global tool definitions down to those allowed for a subagent."""
    # Lazy import to avoid circular dependency
    from backend.agents.claudeAgent.claude_tools.tools import get_tool_definitions_for_claude
    all_defs = get_tool_definitions_for_claude()
    allowed = {n for n in allowed_names}
    return [d for d in all_defs if d.get("name") in allowed]


def list_subagents() -> Dict[str, Any]:
    """Return the available subagents and their descriptions."""
    catalog = _combined_catalog()
    return {
        "success": True,
        "count": len(catalog),
        "agents": [
            {
                "name": cfg.name,
                "description": cfg.description,
                "role_goal": cfg.role_goal,
                "allowed_tools": cfg.allowed_tools,
            }
            for cfg in catalog.values()
        ],
    }


async def _run_via_streaming(
    system_prompt: str,
    user_prompt: str,
    custom_tools: Optional[List[Dict[str, Any]]] = None,
    disable_mcp: bool = True,
) -> Dict[str, Any]:
    """
    Drive a single assistant turn via streaming, executing tools as needed,
    and return the final assistant text plus a log of tool calls.
    """
    # Lazy import to avoid circular dependency
    from backend.agents.claudeAgent.claude_completions import ClaudeCompletions
    claude = ClaudeCompletions()
    messages: List[Dict[str, Any]] = [
        {"role": "user", "content": user_prompt},
    ]

    collected_text: List[str] = []
    used_tools: List[Dict[str, Any]] = []

    async for event in claude.stream_complete(
        messages=messages,
        max_tokens=4000,
        temperature=0.7,
        enable_thinking=True,
        thinking_budget=5000,
        custom_tools=custom_tools or [],
        system_prompt=system_prompt,
        enable_computer_use=False,  # subagents shouldn't open desktops implicitly
        disable_mcp=disable_mcp,
    ):
        etype = event.get("type")
        if etype == "content_block_delta":
            delta = event.get("delta", {})
            if delta.get("type") == "text_delta":
                text = delta.get("text", "")
                if text:
                    collected_text.append(text)
        elif etype == "tool_result":
            used_tools.append(
                {
                    "tool_name": event.get("tool_name"),
                    "result": event.get("result"),
                }
            )
        elif etype == "error":
            return {"success": False, "error": event.get("error", "Unknown error")}
        elif etype == "message_stop":
            break

    final_text = "".join(collected_text).strip()

    # Try to parse JSON output
    parsed: Optional[Dict[str, Any]] = None
    if final_text:
        try:
            parsed = json.loads(final_text)
        except Exception:
            # Try to locate a JSON object
            import re

            m = re.search(r"\{[\s\S]*\}", final_text)
            if m:
                try:
                    parsed = json.loads(m.group(0))
                except Exception:
                    parsed = None

    return {
        "success": True,
        "text": final_text,
        "json": parsed,
        "used_tools": used_tools,
    }


async def run_subagent(
    name: str,
    task: str,
    context: Optional[Dict[str, Any]] = None,
    allowed_tools_override: Optional[List[str]] = None,
    disable_mcp: bool = True,
) -> Dict[str, Any]:
    """Run a single named subagent on the provided task."""
    catalog = _combined_catalog()
    if name not in catalog:
        return {"success": False, "error": f"Unknown subagent: {name}"}

    cfg = catalog[name]
    tool_names = allowed_tools_override if allowed_tools_override is not None else cfg.allowed_tools
    tools_for_agent = _select_tools(tool_names)

    # Build compact user prompt
    ctx_json = json.dumps(context or {}, ensure_ascii=False)
    user_prompt = (
        f"Task: {task}\n\n"
        f"Context (JSON): {ctx_json}\n\n"
        "Respond with JSON only as specified in the system prompt."
    )

    result = await _run_via_streaming(
        system_prompt=cfg.build_system_prompt(),
        user_prompt=user_prompt,
        custom_tools=tools_for_agent,
        disable_mcp=disable_mcp,
    )

    return {
        "success": result.get("success", False),
        "agent": cfg.name,
        "text": result.get("text"),
        "json": result.get("json"),
        "used_tools": result.get("used_tools", []),
    }


async def run_subagents(
    task: str,
    team: Optional[List[str]] = None,
    context: Optional[Dict[str, Any]] = None,
    parallel: bool = True,
    aggregation: str = "consensus",
    disable_mcp: bool = True,
) -> Dict[str, Any]:
    """Run a team of subagents and aggregate their outputs."""
    catalog = _combined_catalog()
    default_team: List[str] = []
    selected = team or default_team

    if not selected:
        return {"success": False, "error": "No subagents selected. Register custom subagents and pass team explicitly."}

    unknown = [n for n in selected if n not in catalog]
    if unknown:
        return {"success": False, "error": f"Unknown subagents: {', '.join(unknown)}"}

    async def run_one(name: str) -> Dict[str, Any]:
        return await run_subagent(name=name, task=task, context=context, disable_mcp=disable_mcp)

    if parallel:
        results = await asyncio.gather(*[run_one(n) for n in selected], return_exceptions=False)
    else:
        results = []
        for n in selected:
            results.append(await run_one(n))

    # Aggregate
    aggregated: Dict[str, Any] = {
        "findings": [],
        "actions": [],
        "next_steps": [],
        "sources": [],
        "estimated_savings_total": 0.0,
        "risks": [],
    }

    for r in results:
        data = r.get("json") or {}
        if isinstance(data, dict):
            if data.get("findings"):
                aggregated["findings"].extend(data.get("findings", []))
            if data.get("actions"):
                aggregated["actions"].extend(data.get("actions", []))
            if data.get("next_steps"):
                aggregated["next_steps"].extend(data.get("next_steps", []))
            if data.get("sources"):
                aggregated["sources"].extend(data.get("sources", []))
            if data.get("risks"):
                aggregated["risks"].extend(data.get("risks", []))
            est = data.get("estimated_savings")
            try:
                if est is not None:
                    aggregated["estimated_savings_total"] += float(est)
            except Exception:
                pass

    # Deduplicate simple lists
    def _dedup(seq: List[Any]) -> List[Any]:
        seen = set()
        out = []
        for item in seq:
            key = json.dumps(item, sort_keys=True) if isinstance(item, (dict, list)) else str(item)
            if key not in seen:
                seen.add(key)
                out.append(item)
        return out

    aggregated["findings"] = _dedup(aggregated["findings"])
    aggregated["actions"] = _dedup(aggregated["actions"])
    aggregated["next_steps"] = _dedup(aggregated["next_steps"])
    aggregated["sources"] = _dedup(aggregated["sources"])
    aggregated["risks"] = _dedup(aggregated["risks"])

    # Choose a brief recommendation strategy
    if aggregation == "best_savings":
        recommendation = (
            "Prioritize the pathway yielding the highest estimated savings; "
            "verify eligibility and proceed with enrollment and pharmacy fulfillment."
        )
    elif aggregation == "speed":
        recommendation = (
            "Prioritize actions that can be completed immediately (no PA), then "
            "queue longer tasks like PA or foundation applications."
        )
    else:
        recommendation = (
            "Combine savings programs with in-network optimization; if PA applies, "
            "prepare documentation concurrently while securing interim discounts."
        )

    return {
        "success": True,
        "task": task,
        "team": selected,
        "results": results,
        "aggregate": aggregated,
        "recommendation": recommendation,
    }


# -------------------------------
# Runtime subagent CRUD operations
# -------------------------------

def register_subagent(
    name: str,
    description: str,
    role_goal: str,
    allowed_tools: List[str],
    instruction_suffix: Optional[str] = None,
) -> Dict[str, Any]:
    """Register a new custom subagent. Persisted to registry.

    Returns success flag and the stored configuration.
    """
    name = (name or "").strip()
    if not name:
        return {"success": False, "error": "name is required"}

    core = _catalog()
    if name in core:
        return {"success": False, "error": f"'{name}' is reserved (core subagent). Choose a different name."}

    # Validate allowed tools against current definitions
    available = set(_all_tool_names())
    missing = [t for t in (allowed_tools or []) if t not in available]
    if missing:
        return {"success": False, "error": f"Unknown tool(s): {', '.join(missing)}"}

    registry = _load_registry()
    if name in registry:
        return {"success": False, "error": f"Subagent '{name}' already exists. Use update_subagent."}

    cfg = SubAgentConfig(
        name=name,
        description=description,
        role_goal=role_goal,
        allowed_tools=list(allowed_tools or []),
        instruction_suffix=instruction_suffix
        or (
            "Return ONLY valid JSON with keys: role, findings, actions, next_steps, "
            "estimated_savings (number or null), risks, sources. No extra prose."
        ),
    )
    registry[name] = cfg
    _save_registry(registry)
    return {"success": True, "agent": asdict(cfg)}


def update_subagent(
    name: str,
    description: Optional[str] = None,
    role_goal: Optional[str] = None,
    allowed_tools: Optional[List[str]] = None,
    instruction_suffix: Optional[str] = None,
) -> Dict[str, Any]:
    """Update an existing custom subagent in the registry."""
    name = (name or "").strip()
    if not name:
        return {"success": False, "error": "name is required"}

    if name in _catalog():
        return {"success": False, "error": f"'{name}' is a core subagent and cannot be updated."}

    registry = _load_registry()
    if name not in registry:
        return {"success": False, "error": f"Subagent '{name}' not found."}

    cfg = registry[name]
    if description is not None:
        cfg.description = description
    if role_goal is not None:
        cfg.role_goal = role_goal
    if allowed_tools is not None:
        available = set(_all_tool_names())
        missing = [t for t in (allowed_tools or []) if t not in available]
        if missing:
            return {"success": False, "error": f"Unknown tool(s): {', '.join(missing)}"}
        cfg.allowed_tools = list(allowed_tools)
    if instruction_suffix is not None:
        cfg.instruction_suffix = instruction_suffix

    registry[name] = cfg
    _save_registry(registry)
    return {"success": True, "agent": asdict(cfg)}


def delete_subagent(name: str) -> Dict[str, Any]:
    """Delete a custom subagent from the registry."""
    name = (name or "").strip()
    if not name:
        return {"success": False, "error": "name is required"}
    if name in _catalog():
        return {"success": False, "error": f"'{name}' is a core subagent and cannot be deleted."}
    registry = _load_registry()
    if name not in registry:
        return {"success": False, "error": f"Subagent '{name}' not found."}
    registry.pop(name, None)
    _save_registry(registry)
    return {"success": True, "deleted": name}


