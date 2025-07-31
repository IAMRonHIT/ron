"""
Fixed browser_use tool implementation
"""

from typing import Any, Dict
import logging
import asyncio
import os

logger = logging.getLogger(__name__)

# Browser automation tool using browser-use
async def browser_use(task: str) -> Dict[str, Any]:
    """
    Perform a browser automation task using browser-use Agent.
    Automatically reuses existing session if available.
    """
    try:
        from browser_use_service_fixed import browser_service
        
        logger.info(f"Starting browser task: {task}")
        
        # Execute task - service handles session reuse automatically
        result = await browser_service.execute_task_in_session(task)
        
        logger.info(f"Browser task completed. Reused session: {result['reused']}")
        
        return {
            "success": True,
            "result": result['result'],
            "live_url": result['live_url'],
            "task": task,
            "session_reused": result['reused']
        }
        
    except Exception as e:
        logger.error(f"Browser task error: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "task": task
        }