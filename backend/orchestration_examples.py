"""
Example showing how the main Claude agent can use the multi-agent orchestration tools
to delegate tasks in the style of Anthropic's Deep Research system.
"""

# Example 1: Simple Agent Delegation
# When main Claude decides it needs specialized help:

"""
Main Claude's internal reasoning:
"The user is asking about prior authorization for a complex cardiac procedure. 
This requires both insurance expertise and clinical evidence. 
I should spawn specialized agents to handle this comprehensively."
"""

# Step 1: Main Claude calls spawn_healthcare_agent
spawn_result = await spawn_healthcare_agent(
    agent_id="insurance_expert_1",
    specialty="insurance_researcher",
    task="Research Aetna's prior authorization requirements for cardiac catheterization (CPT 93458) including required documentation, typical approval timeframes, and common denial reasons",
    allowed_tools=["web_search", "perplexity_sonar_pro", "browser_use"],
    context={
        "procedure": "cardiac catheterization",
        "cpt_code": "93458", 
        "payer": "Aetna",
        "urgency": "non-emergent"
    }
)

# Step 2: Spawn clinical evidence agent
clinical_spawn = await spawn_healthcare_agent(
    agent_id="clinical_expert_1", 
    specialty="clinical_researcher",
    task="Find clinical guidelines and evidence supporting medical necessity for cardiac catheterization in this clinical scenario",
    allowed_tools=["pubmed_search", "pubmed_fetch_abstracts", "clinical_operations"],
    context={
        "patient_scenario": "65-year-old male with stable CAD, recent stress test showing ischemia",
        "procedure": "cardiac catheterization"
    }
)

# Step 3: Execute both agents in parallel (Anthropic's pattern)
team_result = await execute_agent_team([
    "insurance_expert_1", 
    "clinical_expert_1"
])

# Main Claude then synthesizes the results
"""
Now I have comprehensive information from both perspectives:
- Insurance requirements from the insurance expert
- Clinical evidence from the clinical researcher
I can provide a complete answer with both administrative and clinical guidance.
"""


# Example 2: High-Level Orchestration
# For complex tasks, main Claude can use the orchestrate_healthcare_task tool:

orchestration_result = await orchestrate_healthcare_task(
    task="Help patient access Humira for rheumatoid arthritis with minimal cost and maximum coverage",
    specialties=[
        "insurance_researcher",    # Will research coverage requirements
        "pharmacy_specialist",     # Will find cost-saving programs
        "patient_advocate",        # Will identify support resources
        "appeals_specialist"       # Will prepare for potential appeals
    ],
    context={
        "medication": "Humira (adalimumab)",
        "indication": "rheumatoid arthritis", 
        "patient_demographics": {
            "age": 45,
            "insurance": "Blue Cross Blue Shield",
            "state": "Utah"
        },
        "clinical_status": "moderate disease activity, methotrexate inadequate response"
    },
    parallel=True  # Execute all agents concurrently
)

# The orchestration tool handles:
# 1. Spawning all 4 specialized agents with appropriate system prompts
# 2. Executing them in parallel with separate context windows
# 3. Aggregating their JSON outputs
# 4. Cleaning up agents after completion
# 5. Returning comprehensive results to main Claude


# Example 3: Dynamic Agent Creation During Conversation
# Main Claude can adapt and create agents based on conversation flow:

"""
User: "I need help getting my diabetes medication approved by insurance, 
but I'm also worried about side effects and want to find a good endocrinologist."

Main Claude thinks: "This requires multiple types of expertise:
1. Insurance navigation for medication approval
2. Clinical safety information about the medication
3. Provider search for specialists
Let me delegate to appropriate agents."
"""

# Claude dynamically decides which agents to spawn:
agents_needed = [
    {
        "id": "insurance_helper_1",
        "specialty": "insurance_researcher", 
        "task": "Research prior auth requirements for diabetes medication",
        "tools": ["web_search", "browser_use"]
    },
    {
        "id": "drug_safety_expert_1",
        "specialty": "pharmacy_specialist",
        "task": "Research side effects and safety profile of the diabetes medication",
        "tools": ["searchDrugLabel", "getAdverseReactions", "pubmed_search"]
    },
    {
        "id": "provider_finder_1", 
        "specialty": "patient_advocate",
        "task": "Find highly-rated endocrinologists in the patient's area",
        "tools": ["provider_search", "web_search"]
    }
]

# Spawn all agents
for agent_config in agents_needed:
    await spawn_healthcare_agent(
        agent_id=agent_config["id"],
        specialty=agent_config["specialty"], 
        task=agent_config["task"],
        allowed_tools=agent_config["tools"],
        context={"medication": "metformin XR", "location": "Salt Lake City, UT"}
    )

# Execute all in parallel
agent_ids = [config["id"] for config in agents_needed]
results = await execute_agent_team(agent_ids)

# Main Claude synthesizes and presents integrated response


# Example 4: Error Handling and Fallbacks
# Main Claude can handle agent failures gracefully:

try:
    # Attempt parallel execution
    result = await orchestrate_healthcare_task(
        task="Complex multi-step prior authorization research",
        specialties=["insurance_researcher", "clinical_researcher"],
        parallel=True
    )
    
    if result.get("success"):
        # Use multi-agent results
        comprehensive_response = "Based on specialized research from my insurance and clinical teams..."
    else:
        # Fall back to existing tools if orchestration fails
        fallback_result = await run_subagents(
            task="Complex multi-step prior authorization research",
            team=["InsuranceNavigator", "ClinicalResearcher"]  # Existing subagents
        )
        basic_response = "Using my standard research capabilities..."

except Exception as e:
    # Final fallback to direct tool use
    web_result = await web_search("prior authorization requirements research")
    manual_response = "Let me search for this information directly..."


# Integration with Existing System
"""
The orchestration tools integrate seamlessly with your existing:

1. SubAgentConfig system - Uses the same configuration patterns
2. Tool registry - All tools are available to spawned agents  
3. Streaming system - Maintains the same user experience
4. JSON output format - Compatible with existing aggregation
5. Error handling - Graceful fallbacks to existing subagents

Main Claude can now:
- Delegate specific tasks to specialized agents
- Run multiple agents in parallel with separate context windows
- Aggregate results from different perspectives
- Scale from 1 to many agents based on task complexity
- Maintain state across agent lifecycles
"""


# Example System Prompt Update for Main Claude
"""
You now have access to advanced multi-agent orchestration capabilities:

- spawn_healthcare_agent: Create specialized agents with custom prompts and tools
- execute_spawned_agent: Run an agent in its own context window
- execute_agent_team: Run multiple agents in parallel (Anthropic's pattern)  
- orchestrate_healthcare_task: High-level orchestration with automatic spawning

Use these when you need:
- Multiple perspectives on complex healthcare problems
- Parallel research across different domains (insurance + clinical + pharmacy)
- Specialized expertise beyond your general capabilities
- Tasks that benefit from divide-and-conquer approaches

Each spawned agent runs in a separate context window with its own tools,
enabling true parallel processing like Anthropic's Deep Research system.
"""
