#!/usr/bin/env python3
"""Test computer_use tool through the UI"""

import asyncio
import aiohttp
import json

async def test_computer_use():
    url = "http://localhost:8000/api/chat"
    
    # Test message that should trigger computer_use
    message = "Use the computer_use tool to take a screenshot and show me what's on the desktop"
    
    payload = {
        "messages": [
            {"role": "user", "content": message}
        ],
        "temperature": 1.0,
        "max_tokens": 32000,
        "stream": True,
        "tools": ["computer_use"],
        "enable_thinking": True,
        "thinking_budget": 20000
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as response:
            print(f"Status: {response.status}")
            
            if response.status == 200:
                # Read streaming response
                async for line in response.content:
                    if line:
                        line_str = line.decode('utf-8').strip()
                        if line_str.startswith('data: '):
                            data = line_str[6:]
                            if data and data != '[DONE]':
                                try:
                                    event = json.loads(data)
                                    
                                    # Log specific events we care about
                                    if event.get('type') == 'tool_result' and event.get('tool_name') == 'computer_use':
                                        print(f"\n🖥️ Computer Use Result: {json.dumps(event.get('result', {}), indent=2)}")
                                    elif event.get('type') == 'computer_screenshot':
                                        print(f"\n📸 Screenshot {event.get('index', 0) + 1}/{event.get('total', 1)} received")
                                        if event.get('screenshot'):
                                            print(f"   Screenshot data length: {len(event.get('screenshot', ''))} chars")
                                    elif event.get('type') == 'computer_actions':
                                        print(f"\n⚡ Computer Actions: {event.get('actions', [])}")
                                    elif event.get('type') == 'computer_thinking':
                                        print(f"\n💭 Computer Thinking: {event.get('thought', '')[:100]}...")
                                    elif event.get('type') == 'content_block_start' and event.get('content_block', {}).get('name') == 'computer_use':
                                        print(f"\n🚀 Computer Use Tool Started")
                                    elif event.get('type') == 'content_block_delta' and event.get('delta', {}).get('type') == 'text_delta':
                                        text = event.get('delta', {}).get('text', '')
                                        if text:
                                            print(text, end='', flush=True)
                                            
                                except json.JSONDecodeError:
                                    pass
            else:
                error_text = await response.text()
                print(f"Error: {error_text}")

if __name__ == "__main__":
    asyncio.run(test_computer_use())