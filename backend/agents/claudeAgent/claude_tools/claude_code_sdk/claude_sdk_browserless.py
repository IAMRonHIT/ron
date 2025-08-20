#!/usr/bin/env python3
"""
Claude Code SDK Independent Browserless Integration
Direct copy of create_browser_session functionality from tools.py for Claude Code SDK to use independently.
Allows Claude Code SDK to create browsers that can access localhost servers it creates.
"""

import asyncio
import logging
import json
import os
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class ClaudeSDKBrowserless:
    """
    Independent browserless functionality for Claude Code SDK.
    Direct copy from tools.py create_browser_session function.
    """
    
    def __init__(self):
        self.active_sessions = {}
        self.logger = logging.getLogger(__name__)
    
    async def create_browser_session(self, initial_url: str = "about:blank") -> Dict[str, Any]:
        """
        Create a persistent browser session with keep_alive=True and return LiveURL immediately.
        This session will persist after agent tasks complete, allowing for reuse.
        EXACT COPY from tools.py create_browser_session function.
        """
        try:
            from browser_use import BrowserProfile
            from backend.agents.claudeAgent.claude_tools.browser_use.browser_use_service import browser_use_service
            
            logger.info("Creating persistent browser session with keep_alive=True for Claude Code SDK")
            
            # Create optimized browser profile - EXACT COPY from tools.py
            browser_profile = BrowserProfile(
                headless=False,  # Required for LiveURL viewing
                viewport={"width": 1280, "height": 900},
                wait_between_actions=0.1  # Fast actions
            )
            
            # Create session with keep_alive=True for persistence - EXACT COPY from tools.py
            session_result = await browser_use_service.create_live_url_session(
                timeout_ms=900000,  # 15 minutes
                browser_profile=browser_profile,
                interactive=True  # Allow user interaction with browser
            )
            
            logger.info(f"✅ Claude SDK Browser session created with LiveURL: {session_result['live_url']}")
            logger.info(f"Claude SDK Session ID: {session_result['session_id']}")
            
            # Small delay to ensure session is fully registered - EXACT COPY from tools.py
            await asyncio.sleep(0.5)  # 500ms for session registration
            logger.info(f"Claude SDK Session {session_result['session_id']} fully registered and ready")
            
            # Navigate to initial URL if specified - EXACT COPY from tools.py
            if initial_url and initial_url != "about:blank":
                try:
                    logger.info(f"Claude SDK navigating to initial URL: {initial_url}")
                    nav_result = await browser_use_service.navigate_and_get_live_url(
                        session_result['session_id'], 
                        initial_url
                    )
                    logger.info(f"Claude SDK successfully navigated to {initial_url}")
                except Exception as e:
                    logger.warning(f"Claude SDK failed to navigate to {initial_url}: {e}")
            
            # Store session info for Claude SDK
            self.active_sessions[session_result['session_id']] = {
                'live_url': session_result['live_url'],
                'created_for': 'claude_code_sdk',
                'initial_url': initial_url
            }
            
            return {
                "success": True,
                "session_id": session_result['session_id'],
                "live_url": session_result['live_url'],
                "session_number": session_result.get('session_number', 1),
                "display_name": session_result.get('display_name', 'Claude SDK Browser Session'),
                "message": f"✅ Claude SDK Browser session created successfully! Session ID: {session_result['session_id']}",
                "instructions": "Claude Code SDK can now use this session_id to perform browser tasks"
            }
            
        except Exception as e:
            logger.error(f"Claude SDK failed to create browser session: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": f"❌ Claude SDK failed to create browser session: {str(e)}"
            }
    
    async def browser_use_for_claude_sdk(self, task: str, session_id: str = None) -> Dict[str, Any]:
        """
        Perform browser automation task for Claude Code SDK.
        Uses the same browser_use_service but specifically for Claude SDK.
        """
        try:
            from backend.agents.claudeAgent.claude_tools.browser_use.browser_use_service import browser_use_service
            
            logger.info(f"Claude SDK starting browser task: {task}")
            
            # Check if we have an existing Claude SDK session to reuse
            if not session_id and self.active_sessions:
                session_id = list(self.active_sessions.keys())[0]
                logger.info(f"Claude SDK using available session: {session_id}")
            
            if session_id:
                # Use existing session with retry logic (same as tools.py)
                logger.info(f"Claude SDK using session: {session_id} for task: {task}")
                result = await self._browser_use_with_retry(session_id, task)
                
                # Add session_id to result if not present
                if 'session_id' not in result:
                    result['session_id'] = session_id
                    
                return result
            else:
                # No valid session found
                logger.error(f"Claude SDK browser_use called but no session found")
                return {
                    "success": False,
                    "error": "No Claude SDK browser session found. Claude Code SDK must create a session first.",
                    "instruction": "Claude Code SDK should call create_browser_session first"
                }
                
        except Exception as e:
            logger.error(f"Claude SDK browser task error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "task": task
            }
    
    async def _browser_use_with_retry(self, session_id: str, task: str, max_retries: int = 3, delay: float = 1.0) -> Dict[str, Any]:
        """
        Execute browser task with retry logic for session registration race conditions.
        EXACT COPY from tools.py helper function.
        """
        from backend.agents.claudeAgent.claude_tools.browser_use.browser_use_service import browser_use_service
        
        for attempt in range(max_retries):
            try:
                # Add a small delay on retries to ensure session is fully registered
                if attempt > 0:
                    logger.info(f"Claude SDK retry attempt {attempt + 1} for session {session_id}")
                    await asyncio.sleep(delay)
                
                # Try to execute the task
                result = await browser_use_service.execute_browser_task(session_id, task)
                
                # Success - return result
                return result
                
            except Exception as e:
                error_msg = str(e)
                if ("not found" in error_msg.lower() or "expired" in error_msg.lower()) and attempt < max_retries - 1:
                    logger.warning(f"Claude SDK session {session_id} not ready, retrying in {delay}s... (attempt {attempt + 1}/{max_retries})")
                    continue
                else:
                    # Final attempt failed or different error
                    raise
    
    async def navigate_to_localhost(self, port: int, path: str = "", session_id: str = None) -> Dict[str, Any]:
        """
        Navigate to a localhost server created by Claude Code SDK.
        This allows Claude Code SDK to access its own localhost servers.
        """
        localhost_url = f"http://localhost:{port}/{path.lstrip('/')}"
        
        if not session_id and self.active_sessions:
            session_id = list(self.active_sessions.keys())[0]
        
        if not session_id:
            # Create a session first
            session_result = await self.create_browser_session(localhost_url)
            if not session_result["success"]:
                return session_result
            session_id = session_result["session_id"]
        
        # Use browser_use to navigate
        navigate_task = f"Navigate to {localhost_url} and wait for the page to load completely"
        return await self.browser_use_for_claude_sdk(navigate_task, session_id)
    
    async def close_claude_sdk_session(self, session_id: str = None) -> Dict[str, Any]:
        """
        Close Claude SDK browser session(s).
        """
        try:
            from backend.agents.claudeAgent.claude_tools.browser_use.browser_use_service import browser_use_service
            
            if session_id:
                # Close specific session
                result = await browser_use_service.close_session(session_id)
                if session_id in self.active_sessions:
                    del self.active_sessions[session_id]
                return {
                    "success": True,
                    "session_id": session_id,
                    "message": f"✅ Claude SDK browser session {session_id} closed successfully"
                }
            else:
                # Close all Claude SDK sessions
                closed_sessions = []
                for sid in list(self.active_sessions.keys()):
                    try:
                        await browser_use_service.close_session(sid)
                        closed_sessions.append(sid)
                        del self.active_sessions[sid]
                    except Exception as e:
                        logger.warning(f"Failed to close Claude SDK session {sid}: {e}")
                
                return {
                    "success": True,
                    "closed_sessions": closed_sessions,
                    "total_closed": len(closed_sessions),
                    "message": f"✅ Closed {len(closed_sessions)} Claude SDK browser session(s)"
                }
                
        except Exception as e:
            logger.error(f"Claude SDK failed to close browser session(s): {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": f"❌ Claude SDK failed to close browser session(s): {str(e)}"
            }

# Global instance for Claude Code SDK to use
claude_sdk_browserless = ClaudeSDKBrowserless()

# Standalone functions that Claude Code SDK can call via Bash tool
async def create_browser_for_claude_sdk(initial_url: str = "about:blank"):
    """
    Main function that Claude Code SDK can call via Bash tool.
    Creates browser session and returns session info.
    """
    result = await claude_sdk_browserless.create_browser_session(initial_url)
    return result

async def navigate_localhost_for_claude_sdk(port: int, path: str = "", session_id: str = None):
    """
    Navigate to localhost - specifically for Claude Code SDK's own servers
    """
    result = await claude_sdk_browserless.navigate_to_localhost(port, path, session_id)
    return result

async def browser_task_for_claude_sdk(task: str, session_id: str = None):
    """
    Execute browser task for Claude Code SDK
    """
    result = await claude_sdk_browserless.browser_use_for_claude_sdk(task, session_id)
    return result

if __name__ == "__main__":
    # Test script for Claude Code SDK
    import asyncio
    
    async def test_claude_sdk_browser():
        print("Testing Claude Code SDK browserless functionality...")
        
        # Test 1: Create browser session
        print("\n1. Creating browser session...")
        session_result = await create_browser_for_claude_sdk()
        print(json.dumps(session_result, indent=2))
        
        if session_result["success"]:
            session_id = session_result["session_id"]
            
            # Test 2: Navigate to localhost (example)
            print(f"\n2. Testing localhost navigation...")
            nav_result = await navigate_localhost_for_claude_sdk(3000, "", session_id)
            print(json.dumps(nav_result, indent=2))
            
            # Test 3: Browser task
            print(f"\n3. Testing browser task...")
            task_result = await browser_task_for_claude_sdk(
                "Take a screenshot of the current page",
                session_id
            )
            print(json.dumps(task_result, indent=2))
            
            # Test 4: Close session
            print(f"\n4. Closing session...")
            close_result = await claude_sdk_browserless.close_claude_sdk_session(session_id)
            print(json.dumps(close_result, indent=2))
        
        print("\nClaude Code SDK browserless test complete!")
    
    # Run the test
    asyncio.run(test_claude_sdk_browser())
