import anthropic
import os
from typing import List, Dict, Any, Optional, AsyncGenerator
import json
import logging

logger = logging.getLogger(__name__)

class ClaudeCompletions:
    """
    Claude Completions handler with streaming support and tool integration.
    """
    
    def __init__(self):
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is required")
            
        self.client = anthropic.AsyncAnthropic(
            api_key=api_key,
            default_headers={
                "anthropic-beta": "interleaved-thinking-2025-05-14"
            }
        )
        self.model = "claude-sonnet-4-20250514"
        self.default_system_prompt = """You are **Ron of Ron AI**, a specialized healthcare AI assistant dedicated to helping patients access their prescribed medications at the lowest possible cost while ensuring safety, quality, and proper medical adherence.

**BROWSER SESSION LIMIT: You MUST use ONLY ONE browser session at a time. NEVER create multiple browser sessions. The system enforces a strict single session limit. If a browser session exists, reuse it.**

---

## Tools

* **Browser-Use Tool**
  An automated, headless browser agent that can:

  * Navigate patient-facing portals (insurer sites, pharmacy sites, manufacturer sites)
  * Fill and submit enrollment or renewal forms on behalf of the patient
  * Scrape confirmation numbers, coverage details, and pricing tables in real time
  
  **CRITICAL: You MUST use ONLY ONE browser session at a time. NEVER create multiple browser sessions. The system enforces single session limits. Always use the existing session if available.**

* **Perplexity Deep Research Tool** (`perplexity_deep_research`)
  For comprehensive, multi-source research when you need:
  * In-depth analysis of medical conditions, treatments, or procedures
  * Detailed medication information including costs, side effects, and alternatives
  * Thorough investigation of insurance policies and coverage details
  * Academic and clinical research findings

* **Perplexity Reasoning Pro Tool** (`perplexity_reasoning_pro`)
  For complex reasoning tasks when you need:
  * Analysis of insurance eligibility criteria and requirements
  * Comparison of multiple medication options with reasoning
  * Understanding complex prior authorization requirements
  * Logical deduction about coverage gaps and solutions

* **Perplexity Sonar Pro Tool** (`perplexity_sonar_pro`)
  For quick, accurate searches when you need:
  * Current medication prices and availability
  * Recent insurance policy updates
  * Contact information for providers and pharmacies
  * Quick fact-checking about medications or conditions

---

## Your Mission

1. **Minimize patient out-of-pocket costs** - Your #1 priority is finding the most affordable way for the patient to get their prescribed medication.

2. **Navigate complex systems on their behalf** - Use your browser automation capabilities to check prices, fill forms, and complete enrollments the patient would otherwise have to do manually.

3. **Provide comprehensive support** - Research insurance coverage, manufacturer programs, patient assistance programs, discount cards, and alternative medications when appropriate.

4. **Ensure safety and compliance** - Never compromise on medication safety or medical appropriateness in pursuit of cost savings.

5. **Be proactive** - Don't just answer questions; actively search for savings opportunities the patient might not know about.

---

## Response Guidelines

* Be warm, empathetic, and professional - patients are often stressed about medication costs
* Explain complex insurance/pharmacy terms in simple language
* Provide specific, actionable steps with clear instructions
* When using browser automation, narrate what you're doing so the patient can follow along
* Always verify critical information (prices, coverage, etc.) from official sources
* If you find significant savings, celebrate with the patient - this can be life-changing

---

## Safety & Compliance

* Only work with FDA-approved medications from legitimate sources
* Never recommend purchasing from unverified online pharmacies
* Respect HIPAA and patient privacy at all times
* Don't make medical recommendations - focus on access and affordability
* Always encourage patients to consult their healthcare provider for medical decisions

---

## Success Metrics

Your effectiveness is measured by:
* Dollar amount saved for patients
* Time saved through automation
* Successful enrollment in assistance programs
* Accuracy of insurance/coverage information
* Patient satisfaction and reduced medication access stress

Remember: Every dollar saved and every barrier removed helps a real person access the healthcare they need. Your work directly impacts lives."""
    
    async def stream_complete(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 32000,
        temperature: float = 1.0,
        enable_thinking: bool = True,
        thinking_budget: int = 20000,
        tools: Optional[List[Any]] = None,
        custom_tools: Optional[List[Dict]] = None,
        system_prompt: Optional[str] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream completion with tool support - SIMPLIFIED per Anthropic docs.
        """
        try:
            # Prepare the request
            request_params = {
                "model": self.model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            }
            
            # Add system prompt
            if system_prompt:
                request_params["system"] = system_prompt
            else:
                request_params["system"] = self.default_system_prompt
            
            # Add thinking if enabled
            if enable_thinking:
                request_params["thinking"] = {
                    "type": "enabled",
                    "budget_tokens": thinking_budget
                }
            
            # Handle tools
            if tools or custom_tools:
                tool_list = []
                
                if tools:
                    for tool in tools:
                        if isinstance(tool, str):
                            # Native tool
                            if tool == "bash":
                                tool_list.append({"type": "bash_20250124", "name": "bash"})
                            elif tool == "text_editor":
                                tool_list.append({"type": "text_editor_20250728", "name": "str_replace_based_edit_tool"})
                        elif isinstance(tool, dict):
                            # Custom tool
                            tool_list.append(tool)
                
                # Add custom tools if provided
                if custom_tools:
                    tool_list.extend(custom_tools)
                
                if tool_list:
                    request_params["tools"] = tool_list
                    logger.info(f"Sending tools to Claude: {json.dumps(tool_list, indent=2)}")
            
            # Use the streaming context manager - it handles everything!
            async with self.client.messages.stream(**request_params) as stream:
                # Process events as they come
                async for event in stream:
                    if hasattr(event, 'type'):
                        if event.type == 'message_start':
                            yield {
                                'type': 'message_start',
                                'message': {
                                    'id': getattr(event.message, 'id', ''),
                                    'role': getattr(event.message, 'role', 'assistant'),
                                    'model': getattr(event.message, 'model', self.model)
                                }
                            }
                        elif event.type == 'content_block_start':
                            content_block_type = getattr(event.content_block, 'type', 'text')
                            yield {
                                'type': 'content_block_start',
                                'index': getattr(event, 'index', 0),
                                'content_block': {
                                    'type': content_block_type,
                                    'text': getattr(event.content_block, 'text', ''),
                                    'id': getattr(event.content_block, 'id', ''),
                                    'name': getattr(event.content_block, 'name', '')
                                }
                            }
                        elif event.type == 'content_block_delta':
                            delta_type = getattr(event.delta, 'type', 'text_delta')
                            delta_obj = {'type': delta_type}
                            
                            if delta_type == 'text_delta':
                                delta_obj['text'] = getattr(event.delta, 'text', '')
                            elif delta_type == 'thinking_delta':
                                delta_obj['thinking'] = getattr(event.delta, 'thinking', '')
                            elif delta_type == 'signature_delta':
                                delta_obj['signature'] = getattr(event.delta, 'signature', '')
                            elif delta_type == 'input_json_delta':
                                delta_obj['partial_json'] = getattr(event.delta, 'partial_json', '')
                            
                            yield {
                                'type': 'content_block_delta',
                                'index': getattr(event, 'index', 0),
                                'delta': delta_obj
                            }
                        elif event.type == 'content_block_stop':
                            block_index = getattr(event, 'index', 0)
                            
                            # Check if this was a tool use block
                            if hasattr(event, 'content_block') and event.content_block.type == 'tool_use':
                                try:
                                    from tools import execute_tool
                                    
                                    tool_name = event.content_block.name
                                    tool_input = event.content_block.input
                                    tool_id = event.content_block.id
                                    
                                    logger.info(f"Executing tool {tool_name} with input: {tool_input}")
                                    
                                    # Execute the tool
                                    tool_result = await execute_tool(tool_name, tool_input)
                                    logger.info(f"Tool {tool_name} executed successfully")
                                    
                                    # Yield tool result event
                                    yield {
                                        'type': 'tool_result',
                                        'tool_use_id': tool_id,
                                        'tool_name': tool_name,
                                        'result': tool_result
                                    }
                                    
                                except Exception as e:
                                    logger.error(f"Error executing tool {tool_name}: {str(e)}")
                                    yield {
                                        'type': 'tool_error',
                                        'tool_use_id': tool_id,
                                        'tool_name': tool_name,
                                        'error': str(e)
                                    }
                            
                            yield {
                                'type': 'content_block_stop',
                                'index': block_index
                            }
                        elif event.type == 'message_delta':
                            delta_dict = {}
                            if hasattr(event.delta, 'stop_reason'):
                                delta_dict['stop_reason'] = event.delta.stop_reason
                            if hasattr(event.delta, 'stop_sequence'):
                                delta_dict['stop_sequence'] = event.delta.stop_sequence
                            
                            usage_dict = {}
                            if hasattr(event, 'usage'):
                                if hasattr(event.usage, 'output_tokens'):
                                    usage_dict['output_tokens'] = event.usage.output_tokens
                                if hasattr(event.usage, 'input_tokens'):
                                    usage_dict['input_tokens'] = event.usage.input_tokens
                                    
                            yield {
                                'type': 'message_delta',
                                'delta': delta_dict,
                                'usage': usage_dict
                            }
                        elif event.type == 'message_stop':
                            yield {
                                'type': 'message_stop'
                            }
                        # Handle tool result events that the SDK provides
                        elif event.type == 'tool_result':
                            # The SDK automatically handles tool execution and continues
                            # We just pass through the event
                            yield {
                                'type': 'tool_result_from_sdk',
                                'content': getattr(event, 'content', '')
                            }
                        else:
                            # Pass through any other events
                            logger.debug(f"Unknown event type: {event.type}")
                            
        except Exception as e:
            logger.error(f"Error in stream_complete: {str(e)}")
            yield {
                'type': 'error',
                'error': str(e)
            }
    
    async def complete(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 32000,
        temperature: float = 1.0,
        enable_thinking: bool = True,
        thinking_budget: int = 20000,
        tools: Optional[List[Any]] = None,
        custom_tools: Optional[List[Dict]] = None,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Non-streaming completion.
        """
        try:
            # Prepare the request
            request_params = {
                "model": self.model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            }
            
            # Add system prompt
            if system_prompt:
                request_params["system"] = system_prompt
            else:
                request_params["system"] = self.default_system_prompt
            
            # Add thinking if enabled
            if enable_thinking:
                request_params["thinking"] = {
                    "type": "enabled",
                    "budget_tokens": thinking_budget
                }
            
            # Handle tools
            if tools or custom_tools:
                tool_list = []
                
                if tools:
                    for tool in tools:
                        if isinstance(tool, str):
                            # Native tool
                            if tool == "bash":
                                tool_list.append({"type": "bash_20250124", "name": "bash"})
                            elif tool == "text_editor":
                                tool_list.append({"type": "text_editor_20250728", "name": "str_replace_based_edit_tool"})
                        elif isinstance(tool, dict):
                            # Custom tool
                            tool_list.append(tool)
                
                # Add custom tools if provided
                if custom_tools:
                    tool_list.extend(custom_tools)
                
                if tool_list:
                    request_params["tools"] = tool_list
            
            # Make the request
            response = await self.client.messages.create(**request_params)
            
            return {
                "success": True,
                "response": response
            }
            
        except Exception as e:
            logger.error(f"Error in complete: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }