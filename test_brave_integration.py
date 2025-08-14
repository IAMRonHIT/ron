#!/usr/bin/env python3
"""
Test script to verify Brave Search MCP integration with Claude Agent
"""

import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.agents.claudeAgent.claude_tools.brave_search import brave_web_search, brave_news_search

async def test_brave_search():
    """Test Brave Search with Ron AI goggles"""
    print("Testing Brave Search MCP Integration...")
    print("=" * 50)
    
    # Test web search with healthcare query
    print("\n1. Testing brave_web_search with healthcare query...")
    result = await brave_web_search(
        query="diabetes medication costs",
        count=3,
        summary=True
    )
    
    if result.get("success"):
        print("✓ Web search successful!")
        print(f"  Results returned: {len(result.get('data', {}).get('web', {}).get('results', []))}")
        if result.get('data', {}).get('summary_key'):
            print(f"  Summary key generated: {result['data']['summary_key'][:50]}...")
    else:
        print(f"✗ Web search failed: {result.get('error')}")
    
    # Test news search with healthcare query
    print("\n2. Testing brave_news_search with healthcare query...")
    result = await brave_news_search(
        query="FDA drug approvals",
        count=3,
        freshness="pd"
    )
    
    if result.get("success"):
        print("✓ News search successful!")
        print(f"  Results returned: {len(result.get('data', {}).get('results', []))}")
    else:
        print(f"✗ News search failed: {result.get('error')}")
    
    print("\n" + "=" * 50)
    print("Test complete!")

if __name__ == "__main__":
    asyncio.run(test_brave_search())