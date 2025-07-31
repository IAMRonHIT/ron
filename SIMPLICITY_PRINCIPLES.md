# How to Fix Without Adding Complexity: Core Principles

## The Three Rules of Simplicity

### 1. **No Abstraction Without Repetition**
Don't create wrappers, specialized agents, or abstractions until you've repeated something 3+ times.

**❌ BAD (Current):**
```python
# 3 different Perplexity agents doing almost the same thing
sonar_pro_researcher = LlmAgent(mode="standard"...)
sonar_reasoning_researcher = LlmAgent(mode="reasoning"...)  
sonar_deep_research_agent = LlmAgent(mode="deep-research"...)
```

**✅ GOOD (Fixed):**
```python
# One agent that passes different parameters to the same tool
perplexity_sonar(query, mode="reasoning")  # Agent chooses mode
```

### 2. **Trust the LLM, Don't Micromanage**
Let the agent decide HOW to accomplish tasks, just tell it WHAT to accomplish.

**❌ BAD (Current):**
```python
instruction="""
**MANDATORY RESEARCH PROTOCOL:**
For EACH SECTION you MUST delegate to ALL SIX specialized agents:
1. medical_researcher - MUST search even for non-medical topics
2. sonar_pro_researcher - MUST use for general research
[... 300 more lines of prescriptive instructions ...]
"""
```

**✅ GOOD (Fixed):**
```python
instruction="""
Research the user's query using appropriate tools.
Be thorough but efficient. Cite your sources.
"""
```

### 3. **Linear Over Nested**
Keep flows simple and linear. Avoid nested loops and complex state management.

**❌ BAD (Current):**
```python
SequentialAgent([
    browser_initial_researcher,
    section_planner,
    enhanced_section_researcher,  # delegates to 7 agents!
    LoopAgent([                  # nested loop with 3 more agents
        research_evaluator,
        EscalationChecker,
        enhanced_search_executor
    ]),
    section_expander,
    report_composer_early,
    report_composer_late,
    report_merger
])
```

**✅ GOOD (Fixed):**
```python
SequentialAgent([
    researcher,    # Does all research
    writer        # Writes complete report
])
```

## Scalability Through Simplicity

### 1. **Easy to Add New Tools**
```python
# Just add to the tools list - that's it!
tools=[google_search, pubmed_search, perplexity_sonar, 
       browser_scrape, get_fda_drug_summary,
       new_tool]  # ← One line addition
```

### 2. **Easy to Modify Behavior**
```python
# Just update the instruction - no code changes
instruction="""
Research the user's query using appropriate tools.
Focus on peer-reviewed sources when available.  # ← New requirement
Be thorough but efficient. Cite your sources.
"""
```

### 3. **Easy to Debug**
```text
Current: Error → Which of 7 agents? → Which of 10 stages? → Which callback?
Fixed:   Error → Either researcher or writer → Check that agent's output
```

## No Hidden Complexity

### State Management
**Before:** Complex callbacks, regex replacements, custom citation IDs
**After:** Agent outputs markdown with citations → Done

### Error Handling  
**Before:** Errors cascade through 10 stages
**After:** Two clear failure points with clear outputs

### Testing
**Before:** Test 7 agents × 10 stages = 70 integration points
**After:** Test 2 agents = 2 clear contracts

## The "Do Nothing" Principle

The best code is no code. Before adding ANY feature, ask:

1. **Will the LLM handle this naturally?** 
   - Citation formatting? LLMs know markdown
   - Section organization? LLMs structure text well
   - Tool selection? LLMs understand context

2. **Is this complexity earning its keep?**
   - Split report writing saves 0 seconds but adds complexity
   - 7 specialized agents vs 1 general agent provides no benefit
   - Complex state tracking duplicates what's in the text

3. **Can we delete instead of add?**
   - Remove the report merger → Just write once
   - Remove citation callbacks → Use markdown
   - Remove specialized agents → Use one with all tools

## Real Example: Adding a New Research Source

### Current System (Complex):
1. Create new specialized agent (50-100 lines)
2. Add to enhanced_section_researcher's sub_agents
3. Update mandatory protocol instructions
4. Add new state management for that agent
5. Test integration with all other agents

### Fixed System (Simple):
```python
# 1. Import the tool
from new_source import search_tool

# 2. Add to researcher's tools
tools=[google_search, pubmed_search, perplexity_sonar, 
       browser_scrape, get_fda_drug_summary,
       search_tool]  # ← That's it!
```

## The Bottom Line

**Complexity doesn't scale. Simplicity does.**

- **Fewer moving parts** = Fewer things to break
- **Clear responsibilities** = Easy to understand and modify  
- **Trust the LLM** = Less code to maintain
- **Direct solutions** = Faster execution

The fixed version isn't just simpler - it's more powerful because it lets the LLM do what it does best: understand context and make intelligent decisions.