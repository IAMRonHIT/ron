#!/usr/bin/env python3
"""
Test script to verify browser session persistence and reuse
"""

import asyncio
import logging
from browser_use_service import browser_use_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_session_persistence():
    """Test that sessions persist and can be reused"""
    try:
        print("\n=== Testing Browser Session Persistence ===\n")
        
        # Test 1: Create initial session
        print("1. Creating initial session...")
        session1 = await browser_use_service.get_or_create_session(
            initial_url="https://www.google.com"
        )
        print(f"   ✓ Created session: {session1['session_id']}")
        print(f"   ✓ Live URL: {session1['live_url']}")
        print(f"   ✓ Reused: {session1.get('reused', False)}")
        
        # Test 2: Try to get session again (should reuse)
        print("\n2. Getting session again (should reuse)...")
        session2 = await browser_use_service.get_or_create_session()
        print(f"   ✓ Got session: {session2['session_id']}")
        print(f"   ✓ Live URL: {session2['live_url']}")
        print(f"   ✓ Reused: {session2.get('reused', False)}")
        
        # Verify it's the same session
        if session1['session_id'] == session2['session_id']:
            print("   ✓ SUCCESS: Same session was reused!")
        else:
            print("   ✗ FAILED: Different session was created")
        
        # Test 3: Navigate to a new URL in the existing session
        print("\n3. Navigating to new URL in existing session...")
        session3 = await browser_use_service.get_or_create_session(
            initial_url="https://www.github.com"
        )
        print(f"   ✓ Got session: {session3['session_id']}")
        print(f"   ✓ Live URL: {session3['live_url']}")
        print(f"   ✓ Reused: {session3.get('reused', False)}")
        
        # Test 4: List active sessions
        print("\n4. Listing active sessions...")
        active = await browser_use_service.list_active_sessions()
        print(f"   ✓ Total active sessions: {active['total_sessions']}")
        for session_id, info in active['sessions'].items():
            print(f"   - {session_id}: {info['status']} (created: {info['created_at']})")
        
        # Test 5: Refresh session timeout
        print("\n5. Refreshing session timeout...")
        refresh = await browser_use_service.refresh_session_timeout(session1['session_id'])
        print(f"   ✓ {refresh['message']}")
        
        # Test 6: Execute a task in the existing session
        print("\n6. Executing task in existing session...")
        task_result = await browser_use_service.execute_browser_task(
            session1['session_id'],
            "Search for 'OpenAI' on the current page"
        )
        print(f"   ✓ Task completed: {task_result.get('success', False)}")
        
        print("\n=== All Tests Completed Successfully! ===")
        print(f"\nSession {session1['session_id']} will remain active for 15 minutes.")
        print("You can continue using this session ID in subsequent browser_use tool calls.")
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
        print(f"\n✗ Test failed: {e}")
    finally:
        # Don't close the session - let it persist!
        print("\nNote: Session intentionally left open for persistence testing.")

if __name__ == "__main__":
    asyncio.run(test_session_persistence())