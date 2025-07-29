#!/usr/bin/env python3
"""Test script for browser-use functionality"""

import asyncio
import aiohttp
import json
import sys

async def test_browser_use():
    base_url = "http://localhost:8000"
    
    async with aiohttp.ClientSession() as session:
        # Test 1: Create a browser session
        print("1. Testing browser-use session creation...")
        try:
            async with session.post(
                f"{base_url}/browser-use/session/create",
                json={"timeout_ms": 120000}  # 2 minute timeout for testing
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print(f"✓ Session created successfully!")
                    print(f"  Session ID: {data.get('session_id')}")
                    print(f"  Live URL: {data.get('live_url')}")
                    
                    # Extract session_id for further tests
                    session_id = data.get('session_id')
                    live_url = data.get('live_url')
                    
                    if not session_id or not live_url:
                        print("✗ Missing session_id or live_url in response")
                        return
                        
                    # Test 2: Navigate to a URL
                    print("\n2. Testing navigation...")
                    async with session.post(
                        f"{base_url}/browser-use/session/{session_id}/navigate",
                        json={"url": "https://www.google.com"}
                    ) as nav_resp:
                        if nav_resp.status == 200:
                            nav_data = await nav_resp.json()
                            print(f"✓ Navigation successful!")
                            print(f"  Current URL: {nav_data.get('current_url')}")
                        else:
                            print(f"✗ Navigation failed: {nav_resp.status}")
                            error_text = await nav_resp.text()
                            print(f"  Error: {error_text}")
                    
                    # Test 3: Execute a task
                    print("\n3. Testing task execution...")
                    async with session.post(
                        f"{base_url}/browser-use/session/{session_id}/task",
                        json={"task": "Search for 'OpenAI' and click on the first result"}
                    ) as task_resp:
                        if task_resp.status == 200:
                            task_data = await task_resp.json()
                            print(f"✓ Task executed successfully!")
                            print(f"  Result: {task_data.get('result', {}).get('result', 'No result')}")
                        else:
                            print(f"✗ Task execution failed: {task_resp.status}")
                            error_text = await task_resp.text()
                            print(f"  Error: {error_text}")
                    
                    # Test 4: List sessions
                    print("\n4. Testing session listing...")
                    async with session.get(f"{base_url}/browser-use/sessions") as list_resp:
                        if list_resp.status == 200:
                            list_data = await list_resp.json()
                            print(f"✓ Sessions listed successfully!")
                            print(f"  Total sessions: {list_data.get('total_sessions')}")
                        else:
                            print(f"✗ Session listing failed: {list_resp.status}")
                    
                    # Test 5: Close the session
                    print("\n5. Testing session closure...")
                    async with session.delete(
                        f"{base_url}/browser-use/session/{session_id}/close"
                    ) as close_resp:
                        if close_resp.status == 200:
                            close_data = await close_resp.json()
                            print(f"✓ Session closed successfully!")
                        else:
                            print(f"✗ Session closure failed: {close_resp.status}")
                            
                else:
                    print(f"✗ Session creation failed: {resp.status}")
                    error_text = await resp.text()
                    print(f"  Error: {error_text}")
                    
        except aiohttp.ClientConnectorError as e:
            print(f"✗ Could not connect to API server: {e}")
            print("  Make sure the backend API is running on port 8000")
        except Exception as e:
            print(f"✗ Unexpected error: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()

async def main():
    print("Testing Browser-Use Integration")
    print("=" * 50)
    await test_browser_use()
    print("\n" + "=" * 50)
    print("Testing complete!")

if __name__ == "__main__":
    asyncio.run(main())