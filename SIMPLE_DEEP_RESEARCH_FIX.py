# Simple Deep Research Agent - Fixed Version
# This is the COMPLETE implementation - no hidden complexity

from google.adk.agents import Agent, SequentialAgent
from google.adk.tools import google_search

# Import existing tools (these are already well-implemented)
from research_tools import pubmed_search, perplexity_sonar
from browser_scraping_tool import browser_scrape
from fda_drug_tool import get_fda_drug_summary

# That's it for imports - no complex wrappers or fallbacks

# 1. ONE Research Agent (not 7+)
researcher = Agent(
    name="researcher",
    model="gemini-2.5-pro",
    instruction="""
    Research the user's query using appropriate tools:
    - Google Search for general topics
    - PubMed for medical/scientific research  
    - Perplexity for current events and deep analysis
    - Browser scraping for specific websites
    - FDA tool for drug information
    
    Be thorough but efficient. Cite your sources naturally in the text.
    """,
    tools=[google_search, pubmed_search, perplexity_sonar, browser_scrape, get_fda_drug_summary],
    output_key="research_findings"
)

# 2. ONE Report Writer (not 3)
writer = Agent(
    name="writer",
    model="gemini-2.5-pro", 
    instruction="""
    Write a comprehensive report from the research findings.
    Include an executive summary, main sections, and conclusion.
    Format citations as [Source Name](url) inline.
    Target 2000-4000 words based on topic complexity.
    """,
    output_key="final_report"
)

# 3. SIMPLE Pipeline (not 10 stages)
pipeline = SequentialAgent(
    name="research_pipeline",
    sub_agents=[researcher, writer]
)

# 4. Root agent for interaction
root_agent = Agent(
    name="deep_research",
    model="gemini-2.5-pro",
    instruction="""
    You help users with in-depth research. When they ask a question:
    1. Acknowledge their request
    2. Use the research_pipeline to investigate and create a report
    3. Present the final report
    
    Keep it simple and direct.
    """,
    sub_agents=[pipeline]
)

# That's the ENTIRE implementation - ~50 lines vs 800+