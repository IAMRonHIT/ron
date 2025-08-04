#!/usr/bin/env python3
"""Quick test to verify Claude can use the computer use tool"""

import asyncio
import os
import sys
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add backend to path
sys.path.append('backend')

from agents.claudeAgent.claude_completions import ClaudeCompletions

async def test_computer_use():
    """Test if Claude can use the computer use tool"""
    
    print("=== Testing Claude's Access to Computer Use Tool ===\n")
    
    # Initialize Claude
    claude = ClaudeCompletions()
    
    # Test message asking Claude to use computer use
    messages = [{
        "role": "user",
        "content": "Use the computer_use tool to install Claude Code CLI with npm, then create a medication cost optimization dashboard."
    }]
    
    # Get available tools
    from agents.claudeAgent.claude_tools.tools import get_tool_definitions_for_claude
    tools = get_tool_definitions_for_claude()
    
    # Check if computer_use is in tools
    computer_use_tool = [t for t in tools if t['name'] == 'computer_use']
    if computer_use_tool:
        print("✅ Computer use tool is registered in the system")
        print(f"   Description: {computer_use_tool[0]['description'][:80]}...")
    else:
        print("❌ Computer use tool NOT found in tool definitions!")
        return
    
    # Now ask Claude
    print("\nAsking Claude about computer use tool access...")
    
    try:
        # Use the complete method with tools
        response = await claude.complete(
            messages=messages,
            max_tokens=1000,
            custom_tools=tools,
            enable_thinking=True
        )
        
        print("\nClaude's response:")
        if response.get('success') and response.get('response'):
            # Extract content from the response object
            response_obj = response['response']
            
            if hasattr(response_obj, 'content'):
                tool_used = False
                for block in response_obj.content:
                    if hasattr(block, 'type'):
                        if block.type == 'text':
                            print(f"Text: {block.text}")
                        elif block.type == 'tool_use':
                            tool_used = True
                            print(f"\n✅ Claude tried to use tool: {block.name}")
                            print(f"   Tool input: {json.dumps(block.input, indent=2)}")
                
                if not tool_used:
                    print("\n❓ Claude didn't attempt to use any tools")
            else:
                print("No content in response")
        else:
            print(f"Error or no response: {response}")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_computer_use())