#!/usr/bin/env python3
"""Test all three Perplexity tools to ensure they're working correctly."""

import asyncio
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from tools import perplexity_deep_research, perplexity_reasoning_pro, perplexity_sonar_pro

async def test_all_tools():
    print("Testing Perplexity Tools Connection...\n")
    
    # Test 1: Sonar Pro - Quick search
    print("1. Testing Perplexity Sonar Pro (quick search)...")
    try:
        result = await perplexity_sonar_pro("healthcare providers in Salmon, Idaho")
        if 'error' in result:
            print(f"❌ Sonar Pro Error: {result['error']}\n")
        else:
            print(f"✅ Sonar Pro Success!")
            print(f"   Model: {result.get('model', 'Unknown')}")
            print(f"   Content length: {len(result.get('content', ''))}")
            if result.get('content'):
                print(f"   Response preview: {result['content'][:200]}...\n")
    except Exception as e:
        print(f"❌ Sonar Pro Exception: {type(e).__name__}: {str(e)}\n")
    
    # Test 2: Deep Research - Comprehensive analysis
    print("2. Testing Perplexity Deep Research...")
    try:
        result = await perplexity_deep_research("comprehensive analysis of diabetes treatment options")
        print(f"✅ Deep Research Success: {result['status']}")
        print(f"   Response preview: {result['content'][:200]}...\n")
    except Exception as e:
        print(f"❌ Deep Research Failed: {str(e)}\n")
    
    # Test 3: Reasoning Pro - Complex reasoning
    print("3. Testing Perplexity Reasoning Pro...")
    try:
        result = await perplexity_reasoning_pro("compare Medicare Advantage vs Original Medicare pros and cons")
        print(f"✅ Reasoning Pro Success: {result['status']}")
        print(f"   Response preview: {result['content'][:200]}...\n")
    except Exception as e:
        print(f"❌ Reasoning Pro Failed: {str(e)}\n")
    
    print("\nChecking environment variables:")
    print(f"PERPLEXITY_API_KEY exists: {'PERPLEXITY_API_KEY' in os.environ}")
    print(f"PERPLEXITY_API_KEY length: {len(os.environ.get('PERPLEXITY_API_KEY', ''))}")

if __name__ == "__main__":
    asyncio.run(test_all_tools())