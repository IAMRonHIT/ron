#!/usr/bin/env python3
"""
Test script to verify Claude Code SDK is working properly
Based on Context7 documentation patterns
"""

import asyncio
import os
from dotenv import load_dotenv

# Load environment
load_dotenv()

async def test_claude_code_sdk():
    """Test the Claude Code SDK with proper imports"""
    try:
        # Import with proper types as documented
        from claude_code_sdk import query, ClaudeCodeOptions, AssistantMessage, TextBlock
        
        print("✅ Claude Code SDK imports successful")
        print(f"✅ ANTHROPIC_API_KEY: {'Set' if os.getenv('ANTHROPIC_API_KEY') else 'Missing'}")
        
        # Test basic query as documented
        options = ClaudeCodeOptions(
            max_turns=1,
            system_prompt="You are a helpful assistant."
        )
        
        print("\n🔄 Testing basic query...")
        
        message_count = 0
        async for message in query(prompt="Say hello and the current time", options=options):
            message_count += 1
            print(f"📨 Message {message_count}: {type(message).__name__}")
            
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        print(f"💬 Text: {block.text[:100]}...")
                    else:
                        print(f"🔧 Block type: {type(block).__name__}")
            
            # Limit test to avoid long output
            if message_count >= 3:
                break
        
        print(f"\n✅ SDK test completed successfully! Processed {message_count} messages")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ SDK error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Claude Code SDK Integration")
    print("=" * 50)
    
    result = asyncio.run(test_claude_code_sdk())
    
    if result:
        print("\n🎉 Claude Code SDK is working properly!")
        print("The 'simulated' behavior should now be fixed.")
    else:
        print("\n💥 SDK test failed - please check the error messages above")
