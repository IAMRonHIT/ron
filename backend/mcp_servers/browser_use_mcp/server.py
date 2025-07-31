#!/usr/bin/env python3
"""
MCP Server wrapper for browser-use functionality.
Exposes browser automation capabilities as MCP tools for ADK integration.
"""

import asyncio
import json
import logging
import sys
from typing import Dict, Any, Optional
from pathlib import Path

# Add parent directory to path to import browser_use_service
sys.path.append(str(Path(__file__).parent.parent.parent))

from browser_use_service import browser_use_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BrowserUseMCPServer:
    """MCP Server that exposes browser-use functionality as tools"""
    
    def __init__(self):
        self.service = browser_use_service
        self.tools = self._define_tools()
        
    def _define_tools(self) -> Dict[str, Dict[str, Any]]:
        """Define the MCP tools exposed by this server"""
        return {
            "browser_create_session": {
                "name": "browser_create_session",
                "description": "Create a new browser session with LiveURL for real-time viewing",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "timeout_ms": {
                            "type": "integer",
                            "description": "Session timeout in milliseconds (default: 900000 for 15 minutes)",
                            "default": 900000
                        },
                        "interactive": {
                            "type": "boolean",
                            "description": "Whether to create an interactive session",
                            "default": False
                        }
                    }
                }
            },
            "browser_navigate": {
                "name": "browser_navigate",
                "description": "Navigate to a URL in an existing browser session",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "Browser session ID"
                        },
                        "url": {
                            "type": "string",
                            "description": "URL to navigate to"
                        }
                    },
                    "required": ["session_id", "url"]
                }
            },
            "browser_execute_task": {
                "name": "browser_execute_task",
                "description": "Execute a browser automation task using AI agent",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "Browser session ID"
                        },
                        "task": {
                            "type": "string",
                            "description": "Task description for the browser agent to execute"
                        }
                    },
                    "required": ["session_id", "task"]
                }
            },
            "browser_get_session_info": {
                "name": "browser_get_session_info",
                "description": "Get information about a browser session",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "Browser session ID"
                        }
                    },
                    "required": ["session_id"]
                }
            },
            "browser_list_sessions": {
                "name": "browser_list_sessions",
                "description": "List all active browser sessions",
                "input_schema": {
                    "type": "object",
                    "properties": {}
                }
            },
            "browser_close_session": {
                "name": "browser_close_session",
                "description": "Close a browser session",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "Browser session ID"
                        }
                    },
                    "required": ["session_id"]
                }
            },
            "browser_enable_user_control": {
                "name": "browser_enable_user_control",
                "description": "Enable user interaction with the browser (take control from agent)",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "Browser session ID"
                        }
                    },
                    "required": ["session_id"]
                }
            },
            "browser_relinquish_user_control": {
                "name": "browser_relinquish_user_control",
                "description": "Return control to the agent",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "Browser session ID"
                        }
                    },
                    "required": ["session_id"]
                }
            }
        }
    
    async def handle_initialize(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle MCP initialize request"""
        return {
            "protocolVersion": "2024-11-05",
            "capabilities": {
                "tools": {},
                "resources": {},
                "prompts": {}
            },
            "serverInfo": {
                "name": "browser-use-mcp",
                "version": "1.0.0"
            }
        }
    
    async def handle_list_tools(self) -> Dict[str, Any]:
        """Handle MCP list tools request"""
        return {
            "tools": list(self.tools.values())
        }
    
    async def handle_call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Handle MCP tool call request"""
        try:
            # Log the tool call with thought-like output
            logger.info(f"[BROWSER AGENT THOUGHT] Executing {tool_name} with params: {json.dumps(arguments, indent=2)}")
            
            if tool_name == "browser_create_session":
                timeout_ms = arguments.get("timeout_ms", 900000)
                interactive = arguments.get("interactive", False)
                result = await self.service.create_live_url_session(timeout_ms=timeout_ms, interactive=interactive)
                logger.info(f"[BROWSER AGENT THOUGHT] Created session {result['session_id']} with LiveURL: {result['live_url']}")
                return {"content": [{"type": "text", "text": json.dumps(result, indent=2)}]}
                
            elif tool_name == "browser_navigate":
                session_id = arguments["session_id"]
                url = arguments["url"]
                logger.info(f"[BROWSER AGENT THOUGHT] Navigating to {url} in session {session_id}")
                result = await self.service.navigate_and_get_live_url(session_id, url)
                logger.info(f"[BROWSER AGENT THOUGHT] Successfully navigated to {url}")
                return {"content": [{"type": "text", "text": json.dumps(result, indent=2)}]}
                
            elif tool_name == "browser_execute_task":
                session_id = arguments["session_id"]
                task = arguments["task"]
                logger.info(f"[BROWSER AGENT THOUGHT] Starting task execution: {task}")
                
                # This is where the browser-use agent will execute the task
                # The agent's thoughts should be captured and streamed
                result = await self.service.execute_browser_task(session_id, task)
                
                logger.info(f"[BROWSER AGENT THOUGHT] Task completed successfully")
                return {"content": [{"type": "text", "text": json.dumps(result, indent=2)}]}
                
            elif tool_name == "browser_get_session_info":
                session_id = arguments["session_id"]
                result = await self.service.get_session_info(session_id)
                return {"content": [{"type": "text", "text": json.dumps(result, indent=2)}]}
                
            elif tool_name == "browser_list_sessions":
                result = await self.service.list_active_sessions()
                return {"content": [{"type": "text", "text": json.dumps(result, indent=2)}]}
                
            elif tool_name == "browser_close_session":
                session_id = arguments["session_id"]
                logger.info(f"[BROWSER AGENT THOUGHT] Closing session {session_id}")
                result = await self.service.close_session(session_id)
                return {"content": [{"type": "text", "text": json.dumps(result, indent=2)}]}
                
            elif tool_name == "browser_enable_user_control":
                session_id = arguments["session_id"]
                result = await self.service.enable_user_control(session_id)
                return {"content": [{"type": "text", "text": json.dumps(result, indent=2)}]}
                
            elif tool_name == "browser_relinquish_user_control":
                session_id = arguments["session_id"]
                result = await self.service.relinquish_user_control(session_id)
                return {"content": [{"type": "text", "text": json.dumps(result, indent=2)}]}
                
            else:
                return {"error": {"code": "unknown_tool", "message": f"Unknown tool: {tool_name}"}}
                
        except Exception as e:
            logger.error(f"[BROWSER AGENT ERROR] {str(e)}")
            return {"error": {"code": "tool_execution_error", "message": str(e)}}
    
    async def handle_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Handle incoming MCP request"""
        method = request.get("method")
        params = request.get("params", {})
        request_id = request.get("id")
        
        try:
            if method == "initialize":
                result = await self.handle_initialize(params)
            elif method == "tools/list":
                result = await self.handle_list_tools()
            elif method == "tools/call":
                tool_name = params.get("name")
                arguments = params.get("arguments", {})
                result = await self.handle_call_tool(tool_name, arguments)
            else:
                result = {"error": {"code": "method_not_found", "message": f"Unknown method: {method}"}}
            
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "result": result
            }
        except Exception as e:
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {
                    "code": "internal_error",
                    "message": str(e)
                }
            }
    
    async def run_stdio(self):
        """Run the MCP server using stdio transport"""
        logger.info("Starting browser-use MCP server on stdio")
        
        # Read from stdin and write to stdout
        reader = asyncio.StreamReader()
        protocol = asyncio.StreamReaderProtocol(reader)
        await asyncio.get_event_loop().connect_read_pipe(lambda: protocol, sys.stdin)
        
        while True:
            try:
                # Read a line from stdin
                line = await reader.readline()
                if not line:
                    break
                    
                # Parse JSON-RPC request
                request = json.loads(line.decode())
                logger.debug(f"Received request: {request}")
                
                # Handle request
                response = await self.handle_request(request)
                
                # Write response to stdout
                response_line = json.dumps(response) + "\n"
                sys.stdout.write(response_line)
                sys.stdout.flush()
                
            except Exception as e:
                logger.error(f"Error processing request: {e}")
                error_response = {
                    "jsonrpc": "2.0",
                    "id": None,
                    "error": {
                        "code": "parse_error",
                        "message": str(e)
                    }
                }
                sys.stdout.write(json.dumps(error_response) + "\n")
                sys.stdout.flush()

async def main():
    """Main entry point"""
    server = BrowserUseMCPServer()
    await server.run_stdio()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server shutdown requested")
    except Exception as e:
        logger.error(f"Server error: {e}")
        sys.exit(1)