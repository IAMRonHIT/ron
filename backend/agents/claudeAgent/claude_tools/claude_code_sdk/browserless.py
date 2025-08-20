#!/usr/bin/env python3
"""
Browserless script for Claude Code SDK - EXACT COPY from tools.py
DO NOT MODIFY OR OVERWRITE THIS FILE
"""

import asyncio
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

async def create_browser_session(initial_url: str = "about:blank") -> Dict[str, Any]:
    """
    Create a persistent browser session with keep_alive=True and return LiveURL immediately.
    This session will persist after agent tasks complete, allowing for reuse.
    """
    try:
        from browser_use import BrowserProfile
        from backend.agents.claudeAgent.claude_tools.browser_use.browser_use_service import browser_use_service
        
        logger.info("Creating persistent browser session with keep_alive=True")
        
        # Create optimized browser profile
        browser_profile = BrowserProfile(
            headless=False,  # Required for LiveURL viewing
            viewport={"width": 1280, "height": 900},
            wait_between_actions=0.1  # Fast actions
        )
        
        # Create session with keep_alive=True for persistence
        session_result = await browser_use_service.create_live_url_session(
            timeout_ms=900000,  # 15 minutes
            browser_profile=browser_profile,
            interactive=True  # Allow user interaction with browser
        )
        
        logger.info(f"✅ Browser session created with LiveURL: {session_result['live_url']}")
        logger.info(f"Session ID: {session_result['session_id']}")
        
        # Small delay to ensure session is fully registered
        await asyncio.sleep(0.5)  # 500ms for session registration
        logger.info(f"Session {session_result['session_id']} fully registered and ready")
        
        # Navigate to initial URL if specified
        if initial_url and initial_url != "about:blank":
            try:
                logger.info(f"Navigating to initial URL: {initial_url}")
                nav_result = await browser_use_service.navigate_and_get_live_url(
                    session_result['session_id'], 
                    initial_url
                )
                logger.info(f"Successfully navigated to {initial_url}")
            except Exception as e:
                logger.warning(f"Failed to navigate to {initial_url}: {e}")
        
        return {
            "success": True,
            "session_id": session_result['session_id'],
            "live_url": session_result['live_url'],
            "session_number": session_result.get('session_number', 1),
            "display_name": session_result.get('display_name', 'Browser Session'),
            "message": f"✅ Browser session created successfully! The browser panel should be open. Session ID: {session_result['session_id']}",
            "instructions": "Use browser_use with this session_id to perform tasks"
        }
        
    except Exception as e:
        logger.error(f"Failed to create browser session: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": f"❌ Failed to create browser session: {str(e)}"
        }

if __name__ == "__main__":
    # Run the browserless session
    result = asyncio.run(create_browser_session())
    print(result)
