# Repository Guidelines

## Project Structure & Modules
- `src/`: Next.js 15 app (`app/`), UI (`components/`), utilities (`lib/`), assets (`public/`).
- `backend/`: FastAPI service (`api.py`), Claude agent tools under `agents/claudeAgent/claude_tools/`, orchestration and integrations.
- `brave-search-mcp-server/` and `telnyx-mcp-server/`: external MCP servers (Dockerized).
- `scripts/`: local helpers (port killer, cloud/dev setup). Tests live at repo root (`test_*.py`, `test-*.js`).

## Quickstart (Local Dev)
- Prereqs: Node 18+, Python 3.12+, Docker, Playwright deps.
- Env: `cp .env.example .env` and replace placeholders. Do NOT commit secrets.
- Install:
  - Node: `npm ci`
  - Python: `python3 -m venv venv && source venv/bin/activate && pip install -r backend/requirements.txt`
  - Playwright (python): `python -m playwright install --with-deps`
- Start MCP (Brave): `docker-compose -f docker-compose.brave.yml up -d`
- Run all: `npm run dev:all` (Next at `http://localhost:3000`, API at `http://localhost:8001`).

## Build, Test, Run
- Frontend dev: `npm run dev`; build/serve: `npm run build && npm start`.
- Backend dev: `npm run dev:backend` or `python3 -m uvicorn backend.api:app --host 0.0.0.0 --port 8001 --reload`.
- Smoke tests: `python3 test_conversation_flow.py`, `python3 test_frontend_flow.py`, `node test-brave-mcp.js` (ensure API on 8001).

## Coding Style & Conventions
- Frontend: TypeScript + React; component files kebab-case (e.g., `agent-orchestration.tsx`), components PascalCase. Lint: `npm run lint`. Tailwind for styling.
- Backend: Python (PEP 8, 4-space indent). Prefer `APIRouter`; co-locate tool logic under `backend/agents/.../claude_tools/`. Format/lint: `black backend`, `flake8 backend`.

## Testing Guidelines
- Keep tests script-style and fast; name Python as `test_*.py`, Node as `test-*.js`.
- For SSE/stream checks, hit `/chat` (non-stream and stream). Start backend first.

## Commit & PR Guidelines
- Commits: imperative and scoped, e.g., `backend: fix /chat SSE`, `frontend: agent UI state`.
- PRs: include summary, testing steps, linked issues, and screenshots/GIFs for UI. Keep diffs focused; call out env or Docker needs.

## Agent-Specific Notes
- Add/modify tools in `backend/agents/claudeAgent/claude_tools/` (see `tools.py`). Expose via `get_tool_definitions_for_claude` and handle in `execute_tool`.
- UI for orchestration lives in `src/components/agent-orchestration.tsx` and streams events from `/chat`.

## Security & Config
- `.env` keys commonly used: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `BRAVE_API_KEY`, `TELNYX_MCP_URL`, `TELNYX_MCP_MODE`, `CLAUDE_BACKEND_PORT`. Never commit real keys.
