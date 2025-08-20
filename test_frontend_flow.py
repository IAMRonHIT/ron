#!/usr/bin/env python3
"""
Test the frontend conversation flow using browser automation
"""

import asyncio
import aiohttp
import json
import time

async def test_frontend_conversation_flow():
    """Test the frontend conversation flow by making API calls and analyzing responses"""
    
    base_url = "http://localhost:8001"
    
    # Test case that should trigger tools and verify the conversation event structure
    test_message = "Search for information about diabetes treatment options"
    
    print("🧪 Testing Unified Conversation Flow")
    print("=" * 60)
    print(f"Message: {test_message}")
    print("=" * 60)
    
    async with aiohttp.ClientSession() as session:
        try:
            # Send the chat request
            async with session.post(
                f"{base_url}/chat",
                json={
                    "messages": [{"role": "user", "content": test_message}],
                    "enable_thinking": True,
                    "stream": False
                },
                headers={"Content-Type": "application/json"},
                timeout=aiohttp.ClientTimeout(total=120)
            ) as response:
                
                if response.status == 200:
                    # Handle streaming response
                    if 'text/event-stream' in response.headers.get('content-type', ''):
                        print("📡 Streaming response detected")
                        events_collected = []
                        final_response = ""
                        
                        async for line in response.content:
                            line_text = line.decode('utf-8').strip()
                            if line_text.startswith('data: '):
                                data_json = line_text[6:]  # Remove 'data: ' prefix
                                if data_json == '[DONE]':
                                    break
                                try:
                                    event_data = json.loads(data_json)
                                    if 'conversation_events' in event_data:
                                        events_collected.extend(event_data['conversation_events'])
                                    if 'response' in event_data:
                                        final_response = event_data['response']
                                except json.JSONDecodeError:
                                    continue
                        
                        # Create result object similar to non-streaming
                        result = {
                            'conversation_events': events_collected,
                            'response': final_response
                        }
                    else:
                        result = await response.json()
                    
                    print("✅ API Response received successfully")
                    print(f"📊 Response Keys: {list(result.keys())}")
                    
                    # Check for conversation_events
                    if 'conversation_events' in result:
                        events = result['conversation_events']
                        print(f"\n🔍 Conversation Events Analysis:")
                        print(f"Total Events: {len(events)}")
                        print("-" * 40)
                        
                        # Analyze each event in detail
                        tool_calls = []
                        tool_results = []
                        thinking_events = []
                        messages = []
                        
                        for i, event in enumerate(events):
                            event_type = event.get('type', 'unknown')
                            status = event.get('status', 'no-status')
                            timestamp = event.get('timestamp', 'no-timestamp')
                            
                            print(f"[{i+1:2d}] {event_type:15} | {status:10} | {timestamp}")
                            
                            # Categorize events
                            if event_type == 'tool_call':
                                tool_name = event.get('data', {}).get('toolName', 'unknown')
                                tool_input = event.get('data', {}).get('toolInput', '')
                                tool_calls.append({
                                    'tool': tool_name,
                                    'input': tool_input[:100] + '...' if len(tool_input) > 100 else tool_input,
                                    'status': status,
                                    'timestamp': timestamp
                                })
                                print(f"     Tool: {tool_name}")
                                print(f"     Input: {tool_input[:100]}...")
                                
                            elif event_type == 'tool_result':
                                tool_name = event.get('data', {}).get('toolName', 'unknown')
                                tool_output = event.get('data', {}).get('toolOutput', '')
                                tool_results.append({
                                    'tool': tool_name,
                                    'output': tool_output[:100] + '...' if len(tool_output) > 100 else tool_output,
                                    'status': status,
                                    'timestamp': timestamp
                                })
                                print(f"     Tool: {tool_name}")
                                print(f"     Output: {tool_output[:100]}...")
                                
                            elif event_type == 'thinking':
                                reasoning = event.get('data', {}).get('reasoning', '')
                                token_count = event.get('data', {}).get('reasoningTokens', 0)
                                thinking_events.append({
                                    'reasoning': reasoning[:100] + '...' if len(reasoning) > 100 else reasoning,
                                    'tokens': token_count,
                                    'timestamp': timestamp
                                })
                                print(f"     Reasoning: {reasoning[:100]}...")
                                print(f"     Tokens: {token_count}")
                                
                            elif event_type in ['user_message', 'assistant_message']:
                                content = event.get('data', {}).get('content', '')
                                role = event.get('data', {}).get('role', 'unknown')
                                messages.append({
                                    'role': role,
                                    'content': content[:100] + '...' if len(content) > 100 else content,
                                    'timestamp': timestamp
                                })
                                print(f"     Role: {role}")
                                print(f"     Content: {content[:100]}...")
                        
                        # Verify chronological flow
                        print("\n⏰ Chronological Flow Analysis:")
                        print("-" * 40)
                        
                        expected_flow = [
                            "User sends message",
                            "System starts thinking (optional)", 
                            "Tool calls appear immediately with 'executing' status",
                            "Tool results update in place when complete",
                            "Assistant message with final response"
                        ]
                        
                        # Check if we have the expected flow
                        has_user_message = any(e.get('type') == 'user_message' for e in events)
                        has_thinking = any(e.get('type') == 'thinking' for e in events)
                        has_tool_calls = any(e.get('type') == 'tool_call' for e in events)
                        has_tool_results = any(e.get('type') == 'tool_result' for e in events)
                        has_assistant_message = any(e.get('type') == 'assistant_message' for e in events)
                        
                        print(f"✅ User message: {has_user_message}")
                        print(f"{'✅' if has_thinking else '⚠️ '} Thinking: {has_thinking}")
                        print(f"✅ Tool calls: {has_tool_calls}")
                        print(f"✅ Tool results: {has_tool_results}")
                        print(f"✅ Assistant message: {has_assistant_message}")
                        
                        # Check tool call/result pairing
                        print(f"\n🔧 Tool Analysis:")
                        print("-" * 40)
                        print(f"Tool calls found: {len(tool_calls)}")
                        print(f"Tool results found: {len(tool_results)}")
                        
                        for call in tool_calls:
                            print(f"  Call: {call['tool']} ({call['status']})")
                        
                        for result in tool_results:
                            print(f"  Result: {result['tool']} ({result['status']})")
                        
                        # Verify tool call/result pairing
                        tool_pairs = {}
                        for call in tool_calls:
                            tool_pairs[call['tool']] = {'call': call, 'result': None}
                        
                        for result in tool_results:
                            if result['tool'] in tool_pairs:
                                tool_pairs[result['tool']]['result'] = result
                        
                        print(f"\n🔗 Tool Call/Result Pairing:")
                        print("-" * 40)
                        for tool_name, pair in tool_pairs.items():
                            has_both = pair['call'] is not None and pair['result'] is not None
                            print(f"  {tool_name}: {'✅' if has_both else '❌'} {'Paired' if has_both else 'Incomplete'}")
                        
                        # Summary
                        print(f"\n📈 Summary:")
                        print("-" * 40)
                        print(f"Events processed: {len(events)}")
                        print(f"Thinking events: {len(thinking_events)}")
                        print(f"Tool operations: {len(tool_calls)} calls, {len(tool_results)} results")
                        print(f"Messages: {len(messages)}")
                        print(f"Flow completeness: {'✅ Complete' if all([has_user_message, has_tool_calls, has_tool_results, has_assistant_message]) else '⚠️  Incomplete'}")
                        
                        # Check final response
                        final_response = result.get('response', '')
                        print(f"Final response length: {len(final_response)} characters")
                        print(f"Final response preview: {final_response[:200]}...")
                        
                    else:
                        print("❌ No conversation_events found in response")
                        print(f"Available keys: {list(result.keys())}")
                
                else:
                    print(f"❌ API Error: {response.status}")
                    error_text = await response.text()
                    print(f"Error details: {error_text}")
                    
        except asyncio.TimeoutError:
            print("❌ Request timed out")
        except Exception as e:
            print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_frontend_conversation_flow())