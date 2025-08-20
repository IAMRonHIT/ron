#!/usr/bin/env python3
"""
Claude Code SDK Browser Runner
Simple script that Claude Code SDK can execute via Bash tool to use browserless functionality.
"""

import asyncio
import json
import sys
import os
import argparse

# Add the project root to Python path so we can import our modules
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../../..'))

from backend.agents.claudeAgent.claude_tools.claude_code_sdk.claude_sdk_browserless import (
    create_browser_for_claude_sdk,
    navigate_localhost_for_claude_sdk,
    browser_task_for_claude_sdk,
    claude_sdk_browserless
)

async def main():
    parser = argparse.ArgumentParser(description='Claude Code SDK Browser Runner')
    parser.add_argument('action', choices=['create', 'navigate', 'task', 'close'], 
                       help='Action to perform')
    parser.add_argument('--url', help='Initial URL for create action')
    parser.add_argument('--port', type=int, help='Localhost port for navigate action')
    parser.add_argument('--path', default='', help='Path for navigate action')
    parser.add_argument('--task', help='Browser task description')
    parser.add_argument('--session-id', help='Session ID to use')
    
    args = parser.parse_args()
    
    try:
        if args.action == 'create':
            result = await create_browser_for_claude_sdk(args.url or "about:blank")
            
        elif args.action == 'navigate':
            if not args.port:
                print(json.dumps({"success": False, "error": "Port required for navigate action"}))
                return
            result = await navigate_localhost_for_claude_sdk(args.port, args.path, args.session_id)
            
        elif args.action == 'task':
            if not args.task:
                print(json.dumps({"success": False, "error": "Task description required"}))
                return
            result = await browser_task_for_claude_sdk(args.task, args.session_id)
            
        elif args.action == 'close':
            result = await claude_sdk_browserless.close_claude_sdk_session(args.session_id)
            
        else:
            result = {"success": False, "error": f"Unknown action: {args.action}"}
            
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": f"Script error: {str(e)}",
            "action": args.action
        }))

if __name__ == "__main__":
    asyncio.run(main())
