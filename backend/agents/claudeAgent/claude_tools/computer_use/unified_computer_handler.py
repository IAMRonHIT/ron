"""
Unified Computer Use Handler that combines:
1. AWS EC2 VM instance for compute
2. Anthropic's Computer Use native capability 
3. Browserless CDP/LiveURL for browser control on EC2

This creates a complete computer use solution where:
- EC2 provides the virtual desktop environment
- Browserless runs on EC2 for browser automation via CDP
- Claude's native computer_use capability controls both desktop and browser
"""

import base64
import logging
import os
import asyncio
import aiohttp
import json
import subprocess
from typing import Dict, Any, Optional, Tuple
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

class UnifiedComputerHandler:
    """
    Unified handler that bridges Claude's computer_use actions to:
    - Desktop actions on EC2 VM via SSH/xdotool
    - Browser actions through Browserless CDP running on same EC2
    """
    
    def __init__(self):
        # AWS EC2 Configuration
        self.ec2_host = os.getenv('COMPUTER_USE_EC2_HOST', '')
        self.ec2_user = os.getenv('COMPUTER_USE_EC2_USER', 'ubuntu')
        self.ec2_key_path = os.getenv('COMPUTER_USE_EC2_KEY_PATH', '')
        
        # Auto-detect SSH key if not set
        if not self.ec2_key_path:
            ssh_dir = Path.home() / '.ssh'
            key_files = list(ssh_dir.glob('claude-computer-use-*.pem'))
            if key_files:
                self.ec2_key_path = str(key_files[0])
                logger.info(f"Using SSH key: {self.ec2_key_path}")
        
        # Browserless Configuration (running on EC2)
        # If browserless is on EC2, construct URL from EC2 host
        browserless_port = os.getenv('BROWSERLESS_PORT', '3000')
        if self.ec2_host:
            # Browserless running on EC2
            self.browserless_url = f"http://{self.ec2_host}:{browserless_port}"
        else:
            # Fallback to env variable
            self.browserless_url = os.getenv('BROWSERLESS_URL', 'http://localhost:3000')
        
        self.browserless_token = os.getenv('BROWSERLESS_API_TOKEN', '')
        
        # Clean up browserless URL
        if '?' in self.browserless_url:
            self.browserless_url = self.browserless_url.split('?')[0]
        
        # Display configuration
        self.display = ':1'  # Virtual display on EC2
        self.display_width = 1280
        self.display_height = 800
        
        # Browser CDP session management
        self.cdp_url: Optional[str] = None
        self.browser_session_id: Optional[str] = None
        self.browser_active = False
        
        # Track current context (desktop vs browser)
        self.current_context = "desktop"  # Can be "desktop" or "browser"
        
        logger.info(f"UnifiedComputerHandler initialized:")
        logger.info(f"  EC2: {self.ec2_host or 'Not configured'}")
        logger.info(f"  Browserless: {self.browserless_url}")
    
    async def execute_action(self, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main entry point for Claude's computer_use actions.
        Routes actions to appropriate handler based on context.
        """
        try:
            # Determine context and route action
            if action == "screenshot":
                # Screenshot can be from desktop or browser
                if self.browser_active and self.current_context == "browser":
                    return await self._browser_screenshot()
                else:
                    return await self._desktop_screenshot()
            
            elif action == "open_browser" or (action == "navigate" and params.get("url")):
                # Switch to browser context
                self.current_context = "browser"
                url = params.get("url", "about:blank")
                return await self._open_browser(url)
            
            elif action == "close_browser":
                # Close browser and return to desktop
                return await self._close_browser()
            
            elif self.browser_active and self.current_context == "browser":
                # Browser-specific actions via CDP
                return await self._browser_action(action, params)
            
            else:
                # Desktop actions via SSH/xdotool on EC2
                return await self._desktop_action(action, params)
                
        except Exception as e:
            logger.error(f"Error executing action {action}: {e}")
            return {"error": str(e)}
    
    # ============== EC2 Desktop Actions ==============
    
    async def _run_ec2_command(self, command: str) -> Dict[str, Any]:
        """Execute command on EC2 instance via SSH"""
        if not self.ec2_host:
            return {"error": "EC2 host not configured. Set COMPUTER_USE_EC2_HOST"}
        
        if not self.ec2_key_path or not Path(self.ec2_key_path).exists():
            return {"error": "EC2 SSH key not found. Set COMPUTER_USE_EC2_KEY_PATH"}
        
        ssh_cmd = [
            'ssh',
            '-i', self.ec2_key_path,
            '-o', 'StrictHostKeyChecking=no',
            '-o', 'UserKnownHostsFile=/dev/null',
            '-o', 'ConnectTimeout=5',
            f'{self.ec2_user}@{self.ec2_host}',
            f'DISPLAY={self.display} {command}'
        ]
        
        try:
            result = await asyncio.create_subprocess_exec(
                *ssh_cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await result.communicate()
            
            if result.returncode != 0:
                error_msg = stderr.decode('utf-8') if stderr else 'Command failed'
                logger.error(f"EC2 command failed: {error_msg}")
                return {"error": error_msg}
            
            return {"success": True, "output": stdout.decode('utf-8') if stdout else ''}
        except Exception as e:
            logger.error(f"SSH command failed: {e}")
            return {"error": str(e)}
    
    async def _desktop_screenshot(self) -> Dict[str, Any]:
        """Take screenshot of EC2 desktop"""
        try:
            temp_file = f'/tmp/screenshot_{os.getpid()}.png'
            
            # Take screenshot using scrot or import
            screenshot_cmd = f'scrot -z {temp_file} 2>/dev/null || import -window root {temp_file}'
            result = await self._run_ec2_command(screenshot_cmd)
            
            if 'error' in result:
                return result
            
            # Transfer screenshot from EC2
            scp_cmd = [
                'scp',
                '-i', self.ec2_key_path,
                '-o', 'StrictHostKeyChecking=no',
                '-o', 'UserKnownHostsFile=/dev/null',
                f'{self.ec2_user}@{self.ec2_host}:{temp_file}',
                temp_file
            ]
            
            scp_result = await asyncio.create_subprocess_exec(
                *scp_cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            await scp_result.communicate()
            
            # Read and encode screenshot
            if Path(temp_file).exists():
                with open(temp_file, 'rb') as f:
                    image_data = base64.b64encode(f.read()).decode('utf-8')
                
                # Cleanup
                Path(temp_file).unlink(missing_ok=True)
                await self._run_ec2_command(f'rm -f {temp_file}')
                
                return {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_data
                    }
                }
            else:
                return {"error": "Failed to transfer screenshot"}
                
        except Exception as e:
            logger.error(f"Desktop screenshot failed: {e}")
            return {"error": str(e)}
    
    async def _desktop_action(self, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute desktop action on EC2 via xdotool"""
        try:
            if action == "left_click":
                x, y = params.get("coordinate", [0, 0])
                cmd = f'xdotool mousemove {x} {y} click 1'
                
            elif action == "right_click":
                x, y = params.get("coordinate", [0, 0])
                cmd = f'xdotool mousemove {x} {y} click 3'
                
            elif action == "double_click":
                x, y = params.get("coordinate", [0, 0])
                cmd = f'xdotool mousemove {x} {y} click --repeat 2 1'
                
            elif action == "type":
                text = params.get("text", "")
                escaped = text.replace('"', '\\"').replace('$', '\\$').replace('`', '\\`')
                cmd = f'xdotool type "{escaped}"'
                
            elif action == "key":
                key = params.get("key", "")
                cmd = f'xdotool key {key}'
                
            elif action == "mouse_move":
                x, y = params.get("coordinate", [0, 0])
                cmd = f'xdotool mousemove {x} {y}'
                
            elif action == "scroll":
                x, y = params.get("coordinate", [0, 0])
                direction = params.get("direction", "down")
                amount = params.get("amount", 3)
                button = '5' if direction == 'down' else '4'
                cmd = f'xdotool mousemove {x} {y} && '
                cmd += f'for i in $(seq 1 {amount}); do xdotool click {button}; done'
                
            elif action == "drag":
                start_x, start_y = params.get("start_coordinate", [0, 0])
                end_x, end_y = params.get("end_coordinate", [0, 0])
                cmd = f'xdotool mousemove {start_x} {start_y} mousedown 1 '
                cmd += f'mousemove {end_x} {end_y} mouseup 1'
                
            else:
                return {"error": f"Unknown desktop action: {action}"}
            
            result = await self._run_ec2_command(cmd)
            
            if 'error' in result:
                return result
            
            logger.info(f"Desktop action executed: {action}")
            return {"success": True, "action": action, "context": "desktop"}
            
        except Exception as e:
            return {"error": f"Desktop action failed: {e}"}
    
    # ============== Browser Actions via CDP ==============
    
    async def _open_browser(self, url: str = "about:blank") -> Dict[str, Any]:
        """Open browser on EC2 using browserless CDP"""
        try:
            # First ensure browserless is running on EC2
            check_cmd = f'pgrep -f chromium || pgrep -f chrome'
            check_result = await self._run_ec2_command(check_cmd)
            
            if 'error' in check_result or not check_result.get('output'):
                # Start browserless on EC2 if not running
                start_cmd = 'nohup npx @browserless/chrome --port 3000 > /tmp/browserless.log 2>&1 &'
                await self._run_ec2_command(start_cmd)
                await asyncio.sleep(2)  # Wait for startup
            
            # Connect to browserless CDP
            headers = {}
            if self.browserless_token:
                headers['X-Token'] = self.browserless_token
            
            connect_payload = {
                "headless": False,
                "args": [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    f"--window-size={self.display_width},{self.display_height}",
                    "--display=:1"  # Use EC2's virtual display
                ],
                "devtools": True,
                "ignoreHTTPSErrors": True
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.browserless_url}/chromium/content",
                    json=connect_payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        return {"error": f"Failed to open browser: {error_text}"}
                    
                    result = await response.json()
                    
                    # Extract CDP WebSocket URL
                    if 'webSocketDebuggerUrl' in result:
                        self.cdp_url = result['webSocketDebuggerUrl']
                    elif 'ws' in result:
                        self.cdp_url = result['ws']
                    
                    self.browser_session_id = result.get('id', datetime.now().isoformat())
                    self.browser_active = True
                    self.current_context = "browser"
                    
                    # Navigate to URL
                    if url and url != "about:blank":
                        await self._send_cdp_command("Page.navigate", {"url": url})
                    
                    logger.info(f"Browser opened on EC2 with session: {self.browser_session_id}")
                    return {
                        "success": True,
                        "action": "open_browser",
                        "url": url,
                        "session_id": self.browser_session_id,
                        "context": "browser"
                    }
                    
        except Exception as e:
            logger.error(f"Failed to open browser: {e}")
            return {"error": str(e)}
    
    async def _close_browser(self) -> Dict[str, Any]:
        """Close browser and return to desktop context"""
        if self.cdp_url:
            try:
                await self._send_cdp_command("Browser.close")
            except:
                pass
        
        self.cdp_url = None
        self.browser_session_id = None
        self.browser_active = False
        self.current_context = "desktop"
        
        logger.info("Browser closed, returned to desktop context")
        return {"success": True, "action": "close_browser", "context": "desktop"}
    
    async def _browser_action(self, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute browser action via CDP"""
        if not self.cdp_url:
            return {"error": "No browser session active"}
        
        try:
            if action == "left_click":
                return await self._cdp_click(params.get("coordinate", [0, 0]))
            elif action == "type":
                return await self._cdp_type(params.get("text", ""))
            elif action == "key":
                return await self._cdp_key(params.get("key", ""))
            elif action == "scroll":
                return await self._cdp_scroll(
                    params.get("coordinate", [0, 0]),
                    params.get("direction", "down"),
                    params.get("amount", 3)
                )
            elif action == "navigate":
                return await self._cdp_navigate(params.get("url", ""))
            else:
                # Fallback to desktop action for unsupported browser actions
                return await self._desktop_action(action, params)
                
        except Exception as e:
            return {"error": f"Browser action failed: {e}"}
    
    async def _send_cdp_command(self, method: str, params: Dict = None) -> Dict[str, Any]:
        """Send command to Chrome via CDP WebSocket"""
        if not self.cdp_url:
            return {"error": "No CDP session"}
        
        try:
            import websockets
            import uuid
            
            command_id = str(uuid.uuid4())[:8]
            command = {
                "id": command_id,
                "method": method,
                "params": params or {}
            }
            
            async with websockets.connect(self.cdp_url) as ws:
                await ws.send(json.dumps(command))
                
                while True:
                    response = await ws.recv()
                    data = json.loads(response)
                    
                    if data.get("id") == command_id:
                        if "error" in data:
                            return {"error": data["error"]}
                        return data.get("result", {})
                        
        except Exception as e:
            logger.error(f"CDP command failed: {e}")
            return {"error": str(e)}
    
    async def _browser_screenshot(self) -> Dict[str, Any]:
        """Take browser screenshot via CDP"""
        result = await self._send_cdp_command(
            "Page.captureScreenshot",
            {"format": "png"}
        )
        
        if "error" in result:
            return result
        
        image_data = result.get("data", "")
        if not image_data:
            return {"error": "No screenshot data"}
        
        return {
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": "image/png",
                "data": image_data
            }
        }
    
    async def _cdp_click(self, coordinate: list) -> Dict[str, Any]:
        """Click in browser via CDP"""
        x, y = coordinate
        
        await self._send_cdp_command(
            "Input.dispatchMouseEvent",
            {"type": "mouseMoved", "x": x, "y": y}
        )
        
        await self._send_cdp_command(
            "Input.dispatchMouseEvent",
            {"type": "mousePressed", "x": x, "y": y, "button": "left", "clickCount": 1}
        )
        
        await self._send_cdp_command(
            "Input.dispatchMouseEvent",
            {"type": "mouseReleased", "x": x, "y": y, "button": "left", "clickCount": 1}
        )
        
        return {"success": True, "action": "click", "coordinate": [x, y], "context": "browser"}
    
    async def _cdp_type(self, text: str) -> Dict[str, Any]:
        """Type in browser via CDP"""
        result = await self._send_cdp_command("Input.insertText", {"text": text})
        
        if "error" in result:
            # Fallback to char-by-char
            for char in text:
                await self._send_cdp_command(
                    "Input.dispatchKeyEvent",
                    {"type": "char", "text": char}
                )
        
        return {"success": True, "action": "type", "text": text, "context": "browser"}
    
    async def _cdp_key(self, key: str) -> Dict[str, Any]:
        """Press key in browser via CDP"""
        key_map = {
            "Return": "Enter", "Enter": "Enter", "Tab": "Tab",
            "Escape": "Escape", "Backspace": "Backspace"
        }
        
        cdp_key = key_map.get(key, key)
        
        await self._send_cdp_command(
            "Input.dispatchKeyEvent",
            {"type": "keyDown", "key": cdp_key}
        )
        
        await self._send_cdp_command(
            "Input.dispatchKeyEvent",
            {"type": "keyUp", "key": cdp_key}
        )
        
        return {"success": True, "action": "key", "key": key, "context": "browser"}
    
    async def _cdp_scroll(self, coordinate: list, direction: str, amount: int) -> Dict[str, Any]:
        """Scroll in browser via CDP"""
        x, y = coordinate
        delta_y = -120 * amount if direction == "up" else 120 * amount
        
        await self._send_cdp_command(
            "Input.dispatchMouseEvent",
            {"type": "mouseWheel", "x": x, "y": y, "deltaX": 0, "deltaY": delta_y}
        )
        
        return {"success": True, "action": "scroll", "direction": direction, "context": "browser"}
    
    async def _cdp_navigate(self, url: str) -> Dict[str, Any]:
        """Navigate browser to URL via CDP"""
        result = await self._send_cdp_command("Page.navigate", {"url": url})
        
        if "error" in result:
            return result
        
        return {"success": True, "action": "navigate", "url": url, "context": "browser"}
    
    async def get_live_url(self) -> Dict[str, Any]:
        """Get LiveURL for browser session sharing"""
        if not self.browser_session_id:
            return {"error": "No browser session active"}
        
        try:
            headers = {}
            if self.browserless_token:
                headers['X-Token'] = self.browserless_token
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.browserless_url}/sessions/{self.browser_session_id}/live",
                    headers=headers
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        return {"error": f"Failed to get LiveURL: {error_text}"}
                    
                    result = await response.json()
                    live_url = result.get("url", "")
                    
                    return {
                        "success": True,
                        "live_url": live_url,
                        "session_id": self.browser_session_id
                    }
                    
        except Exception as e:
            return {"error": str(e)}

# Global handler instance
computer_handler = UnifiedComputerHandler()