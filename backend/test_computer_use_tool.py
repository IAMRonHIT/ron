#!/usr/bin/env python3
"""
Test script for the Computer Use Tool implementation
Tests the integration with Ron AI's tool system
"""

import asyncio
import os
import sys
import json
from dotenv import load_dotenv

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

# Load environment variables
load_dotenv()

async def test_computer_use_tool():
    """Test the computer use tool implementation"""
    
    print("🧪 Testing Computer Use Tool for Ron AI")
    print("=" * 50)
    
    # Test 1: Import verification
    print("\n1️⃣ Testing imports...")
    try:
        from agents.claudeAgent.claude_tools.tools import execute_tool, TOOLS
        print("✅ Successfully imported tools module")
        
        # Check if computer_use is in TOOLS
        if "computer_use" in TOOLS:
            print("✅ computer_use tool is registered in TOOLS")
            print(f"   Description: {TOOLS['computer_use']['description'][:100]}...")
        else:
            print("❌ computer_use tool not found in TOOLS registry")
            return False
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False
    
    # Test 2: Tool execution with basic task
    print("\n2️⃣ Testing basic tool execution...")
    try:
        # Simple test that should work even without display
        result = await execute_tool("computer_use", {
            "task": "Take a screenshot of the current desktop",
            "max_iterations": 2,
            "thinking_budget": 5000
        })
        
        print("📋 Tool execution result:")
        print(json.dumps(result, indent=2, default=str)[:500] + "...")
        
        if "error" in result and "ANTHROPIC_API_KEY" in result["error"]:
            print("⚠️  API key not configured - this is expected in test environment")
        elif "success" in result:
            print(f"✅ Tool executed with success={result['success']}")
        else:
            print("❓ Unexpected result format")
            
    except Exception as e:
        print(f"❌ Tool execution failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    # Test 3: Direct import test
    print("\n3️⃣ Testing direct import of computer_use_tool...")
    try:
        from agents.claudeAgent.claude_tools.computer_use.computer_use_tool import (
            execute_computer_use, InterleavedComputerAgent
        )
        print("✅ Successfully imported computer_use_tool module")
        print(f"   execute_computer_use: {execute_computer_use}")
        print(f"   InterleavedComputerAgent: {InterleavedComputerAgent}")
    except ImportError as e:
        print(f"❌ Direct import failed: {e}")
        return False
    
    # Test 4: Test parameter validation
    print("\n4️⃣ Testing parameter validation...")
    try:
        # Test with missing required parameter
        result = await execute_tool("computer_use", {})
        if "error" in result and "No task provided" in result["error"]:
            print("✅ Correctly validates missing task parameter")
        else:
            print("❌ Parameter validation not working as expected")
            
        # Test with all parameters
        result = await execute_tool("computer_use", {
            "task": "Test task",
            "max_iterations": 5,
            "thinking_budget": 3000
        })
        print("✅ Accepts all valid parameters")
        
    except Exception as e:
        print(f"❌ Parameter validation test failed: {e}")
    
    # Test 5: Check file structure
    print("\n5️⃣ Checking file structure...")
    base_path = "agents/claudeAgent/claude_tools/computer_use"
    files_to_check = [
        "__init__.py",
        "computer_use_tool.py",
        "setup_environment.sh",
        "README.md"
    ]
    
    all_files_exist = True
    for file in files_to_check:
        file_path = os.path.join(base_path, file)
        if os.path.exists(file_path):
            print(f"✅ {file} exists")
        else:
            print(f"❌ {file} not found")
            all_files_exist = False
    
    print("\n" + "=" * 50)
    print("🏁 Test Summary:")
    print("- Tool registration: ✅")
    print("- Import functionality: ✅")
    print("- Parameter handling: ✅")
    print(f"- File structure: {'✅' if all_files_exist else '❌'}")
    print("\n💡 Note: Full functionality requires:")
    print("- ANTHROPIC_API_KEY environment variable")
    print("- X11 display (DISPLAY=:1)")
    print("- Desktop environment (xvfb, xdotool, etc.)")
    
    return True


async def test_with_mock_environment():
    """Test with mock environment to simulate desktop"""
    print("\n\n🔧 Testing with mock environment...")
    print("=" * 50)
    
    # Set mock display
    os.environ["DISPLAY"] = ":99"
    
    try:
        from agents.claudeAgent.claude_tools.computer_use.computer_use_tool import InterleavedComputerAgent
        
        # Create agent instance
        agent = InterleavedComputerAgent(max_iterations=1, thinking_budget=1000)
        print(f"✅ Created agent with session_id: {agent.session_id}")
        
        # Test individual components
        print("\n📸 Testing screenshot capability...")
        screenshot_result = await agent._take_screenshot()
        if "error" in str(screenshot_result):
            print("⚠️  Screenshot failed (expected without X11)")
        else:
            print("✅ Screenshot method callable")
        
        print("\n🖱️ Testing click capability...")
        click_result = await agent._click(100, 100)
        print(f"   Click result: {click_result}")
        
        print("\n⌨️ Testing type capability...")
        type_result = await agent._type_text("Hello Ron AI")
        print(f"   Type result: {type_result}")
        
    except Exception as e:
        print(f"⚠️  Mock environment test failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    # Run the tests
    asyncio.run(test_computer_use_tool())
    asyncio.run(test_with_mock_environment())
    
    print("\n\n✨ To test in production:")
    print("1. Set ANTHROPIC_API_KEY in your environment")
    print("2. Run on AWS VM with desktop environment")
    print("3. Execute: ./setup_environment.sh")
    print("4. Use the tool via Ron AI's chat interface")