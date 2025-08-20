#!/usr/bin/env python3
"""
Test script to verify the unified conversation flow in Ron AI
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime

async def test_conversation_flow():
    """Test the unified conversation flow by sending messages that trigger tools"""
    
    base_url = "http://localhost:8001"
    
    # Test cases that should trigger different types of tool usage
    test_cases = [
        {
            "name": "Single Tool - Web Search",
            "message": "Search for information about diabetes treatment options",
            "expected_tools": ["web_search"]
        },
        {
            "name": "Multiple Tools - Parallel Search",
            "message": "Search for diabetes information and also look up heart disease prevention",
            "expected_tools": ["web_search"]  # May trigger multiple parallel calls
        },
        {
            "name": "Healthcare Tool",
            "message": "Can you help me find information about metformin drug interactions?",
            "expected_tools": ["searchDrugLabel", "getDrugInteractions"]
        },
        {
            "name": "Browser Tool",
            "message": "Create a browser session to navigate to WebMD and look up diabetes symptoms",
            "expected_tools": ["create_browser_session", "browser_use"]
        }
    ]
    
    async with aiohttp.ClientSession() as session:
        for i, test_case in enumerate(test_cases):
            print(f"\n{'='*60}")
            print(f"TEST {i+1}: {test_case['name']}")
            print(f"Message: {test_case['message']}")
            print(f"Expected tools: {test_case['expected_tools']}")
            print(f"{'='*60}")
            
            try:
                # Send chat request
                async with session.post(
                    f"{base_url}/chat",
                    json={
                        "messages": [
                            {"role": "user", "content": test_case['message']}
                        ],
                        "enable_thinking": True,
                        "stream": False
                    },
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        
                        # Analyze the response structure
                        print(f"✅ Response Status: {response.status}")
                        print(f"📊 Response Keys: {list(result.keys())}")
                        
                        if 'conversation_events' in result:
                            events = result['conversation_events']
                            print(f"🔍 Total Events: {len(events)}")
                            
                            # Analyze event types and chronological order
                            for idx, event in enumerate(events):
                                event_type = event.get('type', 'unknown')
                                timestamp = event.get('timestamp', 'no-timestamp')
                                status = event.get('status', 'no-status')
                                
                                print(f"  [{idx+1}] {event_type} - {status} - {timestamp}")
                                
                                # Show tool details for tool events
                                if event_type in ['tool_call', 'tool_result']:
                                    tool_name = event.get('data', {}).get('toolName', 'unknown')
                                    print(f"      Tool: {tool_name}")
                                
                                # Show thinking content if present
                                if event_type == 'thinking':
                                    reasoning = event.get('data', {}).get('reasoning', '')
                                    token_count = event.get('data', {}).get('reasoningTokens', 0)
                                    print(f"      Reasoning: {reasoning[:100]}... ({token_count} tokens)")
                            
                            # Check if expected tools were called
                            called_tools = []
                            for event in events:
                                if event.get('type') == 'tool_call':
                                    tool_name = event.get('data', {}).get('toolName')
                                    if tool_name:
                                        called_tools.append(tool_name)
                            
                            print(f"🔧 Tools Called: {called_tools}")
                            
                            # Verify chronological ordering
                            timestamps = []
                            for event in events:
                                if 'timestamp' in event:
                                    timestamps.append(datetime.fromisoformat(event['timestamp'].replace('Z', '+00:00')))
                            
                            is_chronological = all(timestamps[i] <= timestamps[i+1] for i in range(len(timestamps)-1))
                            print(f"⏰ Chronological Order: {'✅' if is_chronological else '❌'}")
                        
                        print(f"💬 Final Response: {result.get('response', 'No response')[:200]}...")
                        
                    else:
                        print(f"❌ Response Status: {response.status}")
                        error_text = await response.text()
                        print(f"Error: {error_text}")
                        
            except Exception as e:
                print(f"❌ Test failed with error: {e}")
            
            # Wait between tests
            if i < len(test_cases) - 1:
                print("\nWaiting 3 seconds before next test...")
                await asyncio.sleep(3)

if __name__ == "__main__":
    asyncio.run(test_conversation_flow())