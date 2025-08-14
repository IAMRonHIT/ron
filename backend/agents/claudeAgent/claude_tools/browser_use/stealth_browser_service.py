"""
Enhanced Stealth Browser Service with Anti-Bot Detection
Based on Browserless documentation best practices
"""

import os
import asyncio
import logging
import random
from typing import Dict, Any, Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

from browser_use import BrowserSession, BrowserProfile, Agent
from browser_use.llm import ChatOpenAI


class StealthBrowserService:
    """Enhanced browser service with anti-bot detection measures"""
    
    def __init__(self):
        self.active_sessions: Dict[str, BrowserSession] = {}
        self.session_metadata: Dict[str, Dict[str, Any]] = {}
        
    async def create_stealth_session(
        self, 
        timeout_ms: int = 900000,
        use_residential_proxy: bool = True
    ) -> Dict[str, Any]:
        """
        Create a browser session with enhanced anti-detection measures.
        Based on Browserless best practices:
        - Use residential proxies
        - Add random delays
        - Use stealth endpoint
        - Proper viewport and user agent
        """
        
        browserless_token = os.getenv('BROWSERLESS_API_TOKEN')
        if not browserless_token:
            raise ValueError("BROWSERLESS_API_TOKEN environment variable is required")
            
        session_id = f"stealth_session_{datetime.now().timestamp()}"
        
        try:
            logger.info(f"Creating stealth browser session {session_id}")
            
            # Enhanced browser profile with anti-detection
            browser_profile = BrowserProfile(
                headless=False,  # Headless browsers are easier to detect
                viewport={"width": 1920, "height": 1080},  # Standard desktop size
                wait_between_actions=random.uniform(1.0, 3.0),  # Random human-like delays
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                locale="en-US",
                timezone_id="America/New_York",
                geolocation=None,  # Don't fake geolocation unless needed
                permissions=[],
                color_scheme="light",
                reduced_motion=False,
                forced_colors=False
            )
            
            # Build CDP URL with all anti-detection parameters
            cdp_params = [
                f"token={browserless_token}",
                f"timeout={timeout_ms}",
                "stealth=true",  # Enable stealth mode
                "blockAds=true",  # Block ads to reduce fingerprinting
                "trackingId=false",  # Disable tracking
            ]
            
            # Properly JSON encode launch parameters
            import json
            import urllib.parse
            launch_args = [
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-web-security",
                "--disable-features=IsolateOrigins,site-per-process"
            ]
            launch_config = {"args": launch_args}
            launch_json = json.dumps(launch_config)
            launch_encoded = urllib.parse.quote(launch_json)
            cdp_params.append(f"launch={launch_encoded}")
            
            # Add residential proxy if enabled
            if use_residential_proxy and os.getenv('BROWSERLESS_USE_RESIDENTIAL_PROXY') == 'true':
                cdp_params.append("proxy=residential")
                
            cdp_url = f"wss://production-sfo.browserless.io/chrome/stealth?{'&'.join(cdp_params)}"
            
            # Create browser session
            browser_session = BrowserSession(
                cdp_url=cdp_url,
                browser_profile=browser_profile,
                keep_alive=True
            )
            
            # Start session
            await browser_session.start()
            
            # Get browser components
            browser = browser_session.browser
            context = browser_session.browser_context
            playwright = browser_session.playwright
            page = await browser_session.get_current_page()
            
            # Additional anti-detection: Override navigator properties
            await page.add_init_script("""
                // Override navigator.webdriver
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });
                
                // Override navigator.plugins
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5]
                });
                
                // Override navigator.languages
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en']
                });
                
                // Override chrome runtime
                window.chrome = {
                    runtime: {},
                };
                
                // Override permissions
                const originalQuery = window.navigator.permissions.query;
                window.navigator.permissions.query = (parameters) => (
                    parameters.name === 'notifications' ?
                        Promise.resolve({ state: Notification.permission }) :
                        originalQuery(parameters)
                );
            """)
            
            # Let the browser-use agent decide where to navigate
            
            # Create CDP session for LiveURL
            cdp = await context.new_cdp_session(page)
            
            # Generate LiveURL
            response = await cdp.send('Browserless.liveURL', {
                "timeout": timeout_ms,
                "interactive": True
            })
            
            live_url = response["liveURL"]
            live_url_id = response.get("liveURLId")
            
            # Store session
            self.active_sessions[session_id] = browser_session
            self.session_metadata[session_id] = {
                'session_id': session_id,
                'live_url': live_url,
                'live_url_id': live_url_id,
                'timeout_ms': timeout_ms,
                'created_at': datetime.now().isoformat(),
                'cdp_session': cdp,
                'playwright': playwright,
                'browser': browser,
                'context': context,
                'stealth_enabled': True,
                'residential_proxy': use_residential_proxy
            }
            
            logger.info(f"Stealth session created successfully: {session_id}")
            
            return {
                'success': True,
                'session_id': session_id,
                'live_url': live_url,
                'stealth_features': {
                    'stealth_mode': True,
                    'residential_proxy': use_residential_proxy,
                    'random_delays': True,
                    'navigator_overrides': True,
                    'standard_viewport': True,
                    'non_headless': True
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to create stealth session: {str(e)}")
            raise
            
    async def execute_stealth_task(self, session_id: str, task: str) -> Dict[str, Any]:
        """Execute task with stealth browser and human-like behavior"""
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found")
            
        browser_session = self.active_sessions[session_id]
        
        # Add random delay before starting task (human-like)
        await asyncio.sleep(random.uniform(2.0, 5.0))
        
        # Create agent with OpenAI
        openai_api_key = os.getenv('OPENAI_API_KEY')
        if not openai_api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
            
        llm = ChatOpenAI(
            model="gpt-4o",
            api_key=openai_api_key
        )
        
        # Enhanced agent settings for stealth
        agent = Agent(
            task=task,
            llm=llm,
            browser_session=browser_session
        )
        
        # Execute with careful timing
        result = await agent.run(max_steps=50)  # Reduced steps to avoid detection
        
        return {
            'success': True,
            'result': str(result),
            'session_id': session_id
        }


# Global stealth service instance
stealth_browser_service = StealthBrowserService()