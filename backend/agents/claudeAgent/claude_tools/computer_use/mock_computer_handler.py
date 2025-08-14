"""
Mock Computer Handler for testing without VNC tools.
Provides simulated responses for Claude's computer-use tool.
"""

import base64
import logging
import os
import asyncio
from typing import Dict, Any
from datetime import datetime
import random

logger = logging.getLogger(__name__)

class MockComputerHandler:
    """
    Mock handler for computer actions when VNC tools aren't available.
    Returns simulated responses for testing and development.
    """
    
    def __init__(self):
        self.session_id = f"mock_session_{datetime.now().isoformat()}"
        self.display_width = 1280
        self.display_height = 800
        self.mouse_position = [640, 400]  # Center of screen
        
        # Mock URL that shows a placeholder
        self.mock_url = "data:text/html,<html><body style='background:%23f0f0f0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif'><div style='text-align:center'><h2>Computer Use Mock Display</h2><p>VNC tools not installed</p><p>Actions are simulated</p></div></body></html>"
        
        logger.info("MockComputerHandler initialized (VNC tools not available)")
    
    async def initialize_session(self) -> Dict[str, Any]:
        """Initialize mock session"""
        return {
            "success": True,
            "vnc_url": self.mock_url,
            "display": {
                "width": self.display_width,
                "height": self.display_height
            },
            "message": "Mock session initialized (VNC tools not installed)"
        }
    
    async def execute_action(self, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute mock computer action.
        Returns simulated responses for testing.
        """
        logger.info(f"Mock executing action: {action} with params: {params}")
        
        try:
            if action == "screenshot":
                return await self.mock_screenshot()
            
            elif action in ["left_click", "right_click", "middle_click"]:
                coordinate = params.get("coordinate", [0, 0])
                return self.mock_click(coordinate, action)
            
            elif action == "double_click":
                coordinate = params.get("coordinate", [0, 0])
                return self.mock_click(coordinate, "double_click")
            
            elif action == "type":
                text = params.get("text", "")
                return self.mock_type(text)
            
            elif action == "key":
                key = params.get("key", "")
                return self.mock_key(key)
            
            elif action == "mouse_move":
                coordinate = params.get("coordinate", [0, 0])
                return self.mock_move(coordinate)
            
            elif action == "scroll":
                return self.mock_scroll(params)
            
            elif action == "drag":
                start = params.get("start_coordinate", [0, 0])
                end = params.get("end_coordinate", [0, 0])
                return self.mock_drag(start, end)
            
            elif action == "wait":
                duration = params.get("duration", 1000)
                await asyncio.sleep(duration / 1000)
                return {"success": True, "action": "wait", "duration": duration}
            
            else:
                return {"error": f"Unknown action: {action}"}
                
        except Exception as e:
            logger.error(f"Error in mock action {action}: {e}")
            return {"error": str(e)}
    
    async def mock_screenshot(self) -> Dict[str, Any]:
        """Generate a mock screenshot"""
        # Create a simple 1x1 pixel gray image as base64
        # This is a minimal PNG: 89504e47... (PNG header) with gray pixel
        mock_png_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        
        return {
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": "image/png",
                "data": mock_png_base64
            },
            "_mock": True,
            "_message": "Mock screenshot (VNC tools not installed)"
        }
    
    def mock_click(self, coordinate: list, click_type: str) -> Dict[str, Any]:
        """Simulate a click action"""
        x, y = coordinate
        self.mouse_position = [x, y]
        
        return {
            "success": True,
            "action": click_type,
            "coordinate": [x, y],
            "_mock": True,
            "_message": f"Mock {click_type} at ({x}, {y})"
        }
    
    def mock_type(self, text: str) -> Dict[str, Any]:
        """Simulate typing text"""
        return {
            "success": True,
            "action": "type",
            "text": text,
            "_mock": True,
            "_message": f"Mock typed: '{text}'"
        }
    
    def mock_key(self, key: str) -> Dict[str, Any]:
        """Simulate key press"""
        return {
            "success": True,
            "action": "key",
            "key": key,
            "_mock": True,
            "_message": f"Mock pressed key: {key}"
        }
    
    def mock_move(self, coordinate: list) -> Dict[str, Any]:
        """Simulate mouse movement"""
        x, y = coordinate
        self.mouse_position = [x, y]
        
        return {
            "success": True,
            "action": "mouse_move",
            "coordinate": [x, y],
            "_mock": True,
            "_message": f"Mock moved mouse to ({x}, {y})"
        }
    
    def mock_scroll(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate scrolling"""
        coordinate = params.get("coordinate", self.mouse_position)
        direction = params.get("direction", "down")
        amount = params.get("amount", 3)
        
        return {
            "success": True,
            "action": "scroll",
            "coordinate": coordinate,
            "direction": direction,
            "amount": amount,
            "_mock": True,
            "_message": f"Mock scrolled {direction} by {amount}"
        }
    
    def mock_drag(self, start: list, end: list) -> Dict[str, Any]:
        """Simulate drag action"""
        self.mouse_position = end
        
        return {
            "success": True,
            "action": "drag",
            "start": start,
            "end": end,
            "_mock": True,
            "_message": f"Mock dragged from {start} to {end}"
        }
    
    def get_vnc_url(self) -> str:
        """Get the mock display URL"""
        return self.mock_url
    
    async def close_session(self) -> Dict[str, Any]:
        """Close mock session"""
        return {
            "success": True,
            "message": "Mock session closed"
        }

# Global handler instance
computer_handler = MockComputerHandler()