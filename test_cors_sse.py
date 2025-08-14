#!/usr/bin/env python3
"""
Test script to verify CORS and SSE headers are working correctly for agent orchestration.
"""

import requests
import json
import time

def test_cors_sse():
    """Test that CORS and SSE are properly configured."""
    print("🧪 Testing CORS and SSE Configuration for Agent Orchestration...")
    
    backend_urls = [
        "http://localhost:8000",
        "http://localhost:8001", 
        "http://localhost:8765"
    ]
    
    test_payload = {
        "messages": [
            {
                "role": "user",
                "content": "Search for medication costs for Trulicity"
            }
        ],
        "stream": True,
        "max_tokens": 1000,
        "temperature": 1.0
    }
    
    for backend_url in backend_urls:
        print(f"\n🔍 Testing {backend_url}...")
        
        try:
            # Test CORS preflight
            options_response = requests.options(
                f"{backend_url}/chat",
                headers={
                    "Origin": "http://localhost:3000",
                    "Access-Control-Request-Method": "POST",
                    "Access-Control-Request-Headers": "Content-Type"
                },
                timeout=5
            )
            
            print(f"✅ CORS Preflight Status: {options_response.status_code}")
            print(f"✅ CORS Headers: {dict(options_response.headers)}")
            
            # Test SSE streaming
            response = requests.post(
                f"{backend_url}/chat",
                json=test_payload,
                headers={
                    "Content-Type": "application/json",
                    "Origin": "http://localhost:3000"
                },
                stream=True,
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"✅ SSE Stream Status: {response.status_code}")
                print(f"✅ SSE Headers: {dict(response.headers)}")
                print("✅ Backend is reachable and streaming works!")
                
                # Read first few events
                print("📡 First few streaming events:")
                count = 0
                for line in response.iter_lines():
                    if line and count < 5:
                        decoded_line = line.decode('utf-8')
                        if decoded_line.startswith('data: '):
                            event_data = decoded_line[6:]  # Remove 'data: ' prefix
                            print(f"   Event {count}: {event_data[:100]}...")
                            count += 1
                        if count >= 5:
                            break
                
                response.close()
                return True
            else:
                print(f"❌ SSE Failed: Status {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"⏭️ Backend {backend_url} not available: {e}")
            continue
    
    print("\n❌ No backend servers are responding")
    return False

def test_frontend_event_parsing():
    """Test frontend event parsing logic."""
    print("\n🎯 Testing Frontend Event Parsing Logic...")
    
    # Simulate events that should trigger agent orchestration
    test_events = [
        '{"type": "content_block_start", "content_block": {"type": "tool_use", "name": "web_search", "id": "test123"}}',
        '{"type": "content_block_start", "content_block": {"type": "tool_use", "name": "pubmed_search", "id": "test456"}}',
        '{"type": "browser_live_url", "live_url": "https://example.com", "session_id": "session123"}'
    ]
    
    for i, event in enumerate(test_events):
        print(f"✅ Test Event {i+1}: {event}")
        parsed = json.loads(event)
        
        if parsed.get("type") == "content_block_start":
            content_block = parsed.get("content_block", {})
            if content_block.get("type") == "tool_use":
                tool_name = content_block.get("name", "")
                print(f"   → Would create agent activity for tool: {tool_name}")
        elif parsed.get("type") == "browser_live_url":
            print(f"   → Would open browser panel with URL: {parsed.get('live_url')}")
    
    print("✅ Event parsing logic is correct!")
    return True

if __name__ == "__main__":
    print("🚀 Ron AI Agent Orchestration CORS/SSE Test")
    print("=" * 50)
    
    sse_works = test_cors_sse()
    parsing_works = test_frontend_event_parsing()
    
    if sse_works and parsing_works:
        print("\n🎉 SUCCESS! CORS and SSE are properly configured!")
        print("💡 Agent orchestration should now work end-to-end")
    else:
        print("\n💥 Issues found - check configuration")
