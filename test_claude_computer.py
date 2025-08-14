#!/usr/bin/env python3
"""
Test Claude with computer use tool
"""

import httpx
import asyncio
import json

BASE_URL = "http://localhost:8001"

async def test_claude_computer_use():
    """Test Claude using the computer tool"""
    
    print("=" * 60)
    print("Testing Claude with Computer Use Tool")
    print("=" * 60)
    
    # Simple request asking Claude to take a screenshot
    chat_request = {
        "messages": [
            {
                "role": "user",
                "content": "Please take a screenshot of the current display to see what's on screen."
            }
        ],
        "enable_thinking": False,  # Disable thinking for simpler output
        "max_tokens": 4000,
        "tools": []  # Empty tools list - computer_use is added automatically
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("\nSending request to Claude to take a screenshot...")
        print(f"Request: {json.dumps(chat_request, indent=2)}")
        
        try:
            response = await client.post(
                f"{BASE_URL}/chat",
                json=chat_request
            )
            
            if response.status_code == 200:
                print("\n✅ Response received:")
                print(f"Raw response: {response.text[:500]}...")  # Print first 500 chars
                try:
                    data = response.json()
                except json.JSONDecodeError:
                    print("Response is not JSON, might be streaming")
                    data = {"response": response.text}
                
                # Pretty print the response
                if 'response' in data:
                    print(f"\nClaude's response: {data['response']}")
                
                if 'tool_calls' in data:
                    print(f"\nTool calls made: {len(data.get('tool_calls', []))}")
                    for tool in data.get('tool_calls', []):
                        print(f"  - {tool.get('name', 'unknown')}: {tool.get('action', 'unknown')}")
                
            else:
                print(f"\n❌ Failed with status {response.status_code}")
                print(f"Response: {response.text}")
                
        except httpx.TimeoutException:
            print("\n⏱️ Request timed out (30s)")
        except Exception as e:
            print(f"\n❌ Error: {e}")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    asyncio.run(test_claude_computer_use())