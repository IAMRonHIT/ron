"""
Test script for the multi-agent orchestration system.
Verifies that the Anthropic-style agent spawning and execution works correctly.
"""

import asyncio
import json
import sys
import os

# Add the backend path to sys.path
sys.path.append('/Users/timhunter/ron-ai/backend')

from agents.claudeAgent.claude_tools.orchestrator_tools import orchestrator
from agents.claudeAgent.claude_tools.tools import execute_tool


async def test_basic_agent_orchestration():
    """Test the basic agent orchestration workflow."""
    
    print("🧪 Testing Multi-Agent Orchestration System")
    print("=" * 50)
    
    # Test 1: Spawn a healthcare agent
    print("\n1️⃣ Testing Agent Spawning...")
    
    spawn_result = await execute_tool(
        tool_name="spawn_healthcare_agent",
        tool_input={
            "agent_id": "test_insurance_agent_1",
            "specialty": "insurance_researcher", 
            "task": "Research prior authorization requirements for a cardiac catheterization procedure for a patient with Aetna insurance",
            "allowed_tools": ["web_search", "perplexity_sonar_pro"],
            "context": {
                "patient_info": "65-year-old male with CAD",
                "procedure_code": "93458",
                "payer": "Aetna"
            }
        }
    )
    
    print(f"Spawn Result: {json.dumps(spawn_result, indent=2)}")
    
    if not spawn_result.get("success"):
        print("❌ Agent spawning failed!")
        return False
    
    agent_id = spawn_result.get("agent_id")
    print(f"✅ Successfully spawned agent: {agent_id}")
    
    # Test 2: Check agent status
    print("\n2️⃣ Testing Agent Status Check...")
    
    status_result = await execute_tool(
        tool_name="check_agent_status",
        tool_input={"agent_id": agent_id}
    )
    
    print(f"Status Result: {json.dumps(status_result, indent=2)}")
    
    # Test 3: Execute the agent
    print("\n3️⃣ Testing Agent Execution...")
    
    execute_result = await execute_tool(
        tool_name="execute_spawned_agent",
        tool_input={"agent_id": agent_id}
    )
    
    print(f"Execute Result: {json.dumps(execute_result, indent=2)}")
    
    if not execute_result.get("success"):
        print("❌ Agent execution failed!")
        return False
    
    print(f"✅ Agent executed successfully!")
    print(f"Agent Output: {execute_result.get('text', 'No text output')}")
    
    # Test 4: Clean up
    print("\n4️⃣ Testing Agent Cleanup...")
    
    cleanup_result = await execute_tool(
        tool_name="cleanup_completed_agent",
        tool_input={"agent_id": agent_id}
    )
    
    print(f"Cleanup Result: {json.dumps(cleanup_result, indent=2)}")
    
    return True


async def test_parallel_orchestration():
    """Test the high-level orchestration with multiple agents."""
    
    print("\n🚀 Testing High-Level Orchestration")
    print("=" * 50)
    
    orchestration_result = await execute_tool(
        tool_name="orchestrate_healthcare_task",
        tool_input={
            "task": "Help a patient access their prescribed medication Humira for rheumatoid arthritis while minimizing cost",
            "specialties": ["insurance_researcher", "pharmacy_specialist"],
            "context": {
                "medication": "Humira (adalimumab)",
                "condition": "Rheumatoid arthritis",
                "patient_age": 45,
                "insurance": "Blue Cross Blue Shield"
            },
            "parallel": True
        }
    )
    
    print(f"Orchestration Result: {json.dumps(orchestration_result, indent=2)}")
    
    if orchestration_result.get("success"):
        print("✅ High-level orchestration completed successfully!")
        agents_used = orchestration_result.get("agents_used", 0)
        print(f"📊 Used {agents_used} specialized agents")
        
        # Show aggregated results
        aggregated = orchestration_result.get("aggregated_results", {})
        print(f"🔍 Found {len(aggregated.get('findings', []))} findings")
        print(f"⚡ Identified {len(aggregated.get('actions', []))} actions")
        
        return True
    else:
        print("❌ High-level orchestration failed!")
        return False


async def main():
    """Run all tests."""
    
    print("🎯 Multi-Agent Orchestration Test Suite")
    print("Testing Anthropic-style agent spawning and execution")
    print("=" * 60)
    
    try:
        # Test basic orchestration
        basic_success = await test_basic_agent_orchestration()
        
        if basic_success:
            # Test parallel orchestration
            parallel_success = await test_parallel_orchestration()
            
            if parallel_success:
                print("\n🎉 ALL TESTS PASSED!")
                print("✅ Multi-agent orchestration system is working correctly")
                print("✅ Ready for integration with main Claude agent")
            else:
                print("\n⚠️  Basic tests passed, but parallel orchestration failed")
        else:
            print("\n❌ Basic orchestration tests failed")
    
    except Exception as e:
        print(f"\n💥 Test suite failed with error: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    # Run the test suite
    asyncio.run(main())
