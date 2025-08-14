"""
Computer use action handler for Claude's native computer-use capability.
Connects to AWS EC2 VM via SSH to execute actions remotely.
"""

import base64
import subprocess
import logging
import os
import asyncio
from typing import Dict, Any, Optional
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)

class ComputerUseHandler:
    """Handles computer actions on remote AWS EC2 instance"""
    
    def __init__(self, display_width: int = 1280, display_height: int = 800):
        self.display_width = display_width
        self.display_height = display_height
        
        # AWS EC2 connection details from environment
        self.ec2_host = os.getenv('COMPUTER_USE_EC2_HOST', '')
        self.ec2_user = os.getenv('COMPUTER_USE_EC2_USER', 'ubuntu')
        self.ec2_key_path = os.getenv('COMPUTER_USE_EC2_KEY_PATH', '')
        
        # Find SSH key if not explicitly set
        if not self.ec2_key_path:
            ssh_dir = Path.home() / '.ssh'
            key_files = list(ssh_dir.glob('claude-computer-use-*.pem'))
            if key_files:
                self.ec2_key_path = str(key_files[0])
                logger.info(f"Using SSH key: {self.ec2_key_path}")
        
        # Display configuration for remote X11
        self.display = ':1'  # Virtual display on EC2
        
    async def execute_action(self, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a computer action requested by Claude.
        This is called when Claude uses the computer_use tool.
        """
        try:
            if action == "screenshot":
                return await self.take_screenshot()
            elif action == "left_click":
                return await self.click(params.get("coordinate", [0, 0]))
            elif action == "type":
                return await self.type_text(params.get("text", ""))
            elif action == "key":
                return await self.press_key(params.get("key", ""))
            elif action == "mouse_move":
                return await self.move_mouse(params.get("coordinate", [0, 0]))
            elif action == "scroll":
                return await self.scroll(
                    params.get("coordinate", [0, 0]),
                    params.get("scroll_direction", "down"),
                    params.get("scroll_amount", 3)
                )
            else:
                return {"error": f"Unknown action: {action}"}
                
        except Exception as e:
            logger.error(f"Error executing computer action {action}: {e}")
            return {"error": str(e)}
    
    async def _run_remote_command(self, command: str) -> Dict[str, Any]:
        """Execute command on remote EC2 instance via SSH"""
        if not self.ec2_host:
            return {"error": "EC2 host not configured. Set COMPUTER_USE_EC2_HOST environment variable."}
        
        if not self.ec2_key_path or not Path(self.ec2_key_path).exists():
            return {"error": "EC2 SSH key not found. Set COMPUTER_USE_EC2_KEY_PATH or run start-computer-use-aws.sh"}
        
        ssh_cmd = [
            'ssh',
            '-i', self.ec2_key_path,
            '-o', 'StrictHostKeyChecking=no',
            '-o', 'UserKnownHostsFile=/dev/null',
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
                logger.error(f"Remote command failed: {error_msg}")
                return {"error": error_msg}
            
            return {"success": True, "output": stdout.decode('utf-8') if stdout else ''}
        except Exception as e:
            logger.error(f"SSH command failed: {e}")
            return {"error": str(e)}
    
    async def take_screenshot(self) -> Dict[str, Any]:
        """Take a screenshot from remote EC2 and return as base64"""
        try:
            # Use scrot to capture screenshot on remote machine
            temp_file = f'/tmp/screenshot_{os.getpid()}.png'
            
            # Take screenshot on remote
            screenshot_cmd = f'scrot -z {temp_file}'
            result = await self._run_remote_command(screenshot_cmd)
            
            if 'error' in result:
                # Fallback to ImageMagick import
                screenshot_cmd = f'import -window root {temp_file}'
                result = await self._run_remote_command(screenshot_cmd)
                if 'error' in result:
                    return result
            
            # Transfer screenshot to local
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
            
            # Read and encode the screenshot
            if Path(temp_file).exists():
                with open(temp_file, 'rb') as f:
                    image_data = base64.b64encode(f.read()).decode('utf-8')
                
                # Clean up local file
                Path(temp_file).unlink(missing_ok=True)
                
                # Clean up remote file
                await self._run_remote_command(f'rm -f {temp_file}')
                
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
            logger.error(f"Screenshot failed: {e}")
            return {"error": f"Screenshot failed: {e}"}
    
    async def click(self, coordinate: list) -> Dict[str, Any]:
        """Click at the specified coordinates on remote EC2"""
        x, y = coordinate
        try:
            # Use xdotool on remote machine
            click_cmd = f'xdotool mousemove {x} {y} click 1'
            result = await self._run_remote_command(click_cmd)
            
            if 'error' in result:
                return result
            
            logger.info(f"Clicked at ({x}, {y}) on remote EC2")
            return {"success": True, "action": "click", "coordinate": [x, y]}
        except Exception as e:
            return {"error": f"Click failed: {e}"}
    
    async def type_text(self, text: str) -> Dict[str, Any]:
        """Type the specified text on remote EC2"""
        try:
            # Escape special characters for shell
            escaped_text = text.replace('"', '\\"').replace('$', '\\$').replace('`', '\\`')
            
            # Use xdotool to type on remote machine
            type_cmd = f'xdotool type "{escaped_text}"'
            result = await self._run_remote_command(type_cmd)
            
            if 'error' in result:
                return result
            
            logger.info(f"Typed on remote EC2: {text}")
            return {"success": True, "action": "type", "text": text}
        except Exception as e:
            return {"error": f"Type failed: {e}"}
    
    async def press_key(self, key: str) -> Dict[str, Any]:
        """Press a key or key combination on remote EC2"""
        try:
            # Use xdotool key on remote machine
            key_cmd = f'xdotool key {key}'
            result = await self._run_remote_command(key_cmd)
            
            if 'error' in result:
                return result
            
            logger.info(f"Pressed key on remote EC2: {key}")
            return {"success": True, "action": "key", "key": key}
        except Exception as e:
            return {"error": f"Key press failed: {e}"}
    
    async def move_mouse(self, coordinate: list) -> Dict[str, Any]:
        """Move mouse to specified coordinates on remote EC2"""
        x, y = coordinate
        try:
            # Use xdotool on remote machine
            move_cmd = f'xdotool mousemove {x} {y}'
            result = await self._run_remote_command(move_cmd)
            
            if 'error' in result:
                return result
            
            logger.info(f"Moved mouse to ({x}, {y}) on remote EC2")
            return {"success": True, "action": "mouse_move", "coordinate": [x, y]}
        except Exception as e:
            return {"error": f"Mouse move failed: {e}"}
    
    async def scroll(self, coordinate: list, direction: str, amount: int) -> Dict[str, Any]:
        """Scroll at the specified location on remote EC2"""
        x, y = coordinate
        try:
            # Move mouse first, then scroll
            await self.move_mouse(coordinate)
            
            # Convert direction to xdotool button (4=up, 5=down)
            button = '5' if direction == 'down' else '4'
            
            # Scroll multiple times for the amount
            for _ in range(amount):
                scroll_cmd = f'xdotool click {button}'
                result = await self._run_remote_command(scroll_cmd)
                if 'error' in result:
                    return result
            
            logger.info(f"Scrolled {direction} by {amount} at ({x}, {y}) on remote EC2")
            return {"success": True, "action": "scroll", "direction": direction, "amount": amount}
        except Exception as e:
            return {"error": f"Scroll failed: {e}"}

# Global handler instance
computer_handler = ComputerUseHandler()