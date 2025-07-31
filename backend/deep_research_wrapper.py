"""
Deep Research Agent Wrapper that properly handles imports
"""
import os
import sys

# Load environment variables first
from dotenv import load_dotenv
load_dotenv()

print(f"[DEBUG] GOOGLE_APPLICATION_CREDENTIALS: {os.getenv('GOOGLE_APPLICATION_CREDENTIALS')}")
print(f"[DEBUG] GOOGLE_API_KEY: {os.getenv('GOOGLE_API_KEY')}")
print(f"[DEBUG] GEMINI_API_KEY: {os.getenv('GEMINI_API_KEY')}")

# Add the agent path to sys.path
agent_path = os.path.join(os.path.dirname(__file__), 'agent-starter-pack/agents/gemini-fullstack/app')
if agent_path not in sys.path:
    sys.path.append(agent_path)

# Import the deep research agent from the standalone file
try:
    from deep_research_agent import root_agent as deep_research_root_agent
    print("[SUCCESS] Deep Research Agent imported successfully from deep_research_agent.py!")
    DEEP_RESEARCH_AVAILABLE = True
except ImportError as e:
    print(f"[ERROR] Failed to import from deep_research_agent.py: {e}")
    # Try the ADK package import
    try:
        from agent import root_agent as deep_research_root_agent  
        print("[SUCCESS] Deep Research Agent imported successfully from agent.py!")
        DEEP_RESEARCH_AVAILABLE = True
    except ImportError as e2:
        print(f"[ERROR] Failed to import from agent.py: {e2}")
        deep_research_root_agent = None
        DEEP_RESEARCH_AVAILABLE = False

__all__ = ['deep_research_root_agent', 'DEEP_RESEARCH_AVAILABLE']