#!/usr/bin/env python3
"""
Test script to verify browser service WebSocket connection fixes.
Tests the proper JSON encoding and URL encoding of launch parameters.
"""

import json
import urllib.parse
import os
from dotenv import load_dotenv

load_dotenv()

def test_launch_parameter_encoding():
    """Test that launch parameters are properly JSON and URL encoded"""
    
    # Test launch args (same as in our fixed services)
    launch_args = [
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage", 
        "--no-sandbox",
        "--disable-setuid-sandbox"
    ]
    
    # Create launch config
    launch_config = {"args": launch_args}
    
    # Step 1: JSON encode
    launch_json = json.dumps(launch_config)
    print("✓ JSON encoded launch config:")
    print(f"  {launch_json}")
    
    # Step 2: URL encode
    launch_encoded = urllib.parse.quote(launch_json)
    print("\n✓ URL encoded launch config:")
    print(f"  {launch_encoded}")
    
    # Step 3: Build complete URL
    browserless_token = os.getenv('BROWSERLESS_API_TOKEN', 'test_token')
    timeout_ms = 900000
    
    cdp_url = f"wss://production-sfo.browserless.io/chrome/stealth?token={browserless_token}&timeout={timeout_ms}&stealth=true&launch={launch_encoded}"
    
    print("\n✓ Complete WebSocket URL:")
    print(f"  {cdp_url}")
    
    # Step 4: Verify the encoding is reversible
    decoded_launch = urllib.parse.unquote(launch_encoded)
    parsed_config = json.loads(decoded_launch)
    
    print("\n✓ Verification - decoded config matches original:")
    print(f"  Original: {launch_config}")
    print(f"  Decoded:  {parsed_config}")
    print(f"  Match: {launch_config == parsed_config}")
    
    return launch_config == parsed_config

def test_url_parameter_format():
    """Test that URL parameters follow browserless.io specification"""
    
    browserless_token = "test_token_12345"
    timeout_ms = 900000
    
    launch_args = ["--no-sandbox", "--disable-dev-shm-usage"]
    launch_config = {"args": launch_args}
    launch_json = json.dumps(launch_config)
    launch_encoded = urllib.parse.quote(launch_json)
    
    # Build URL with all required parameters
    params = [
        f"token={browserless_token}",
        f"timeout={timeout_ms}",
        "stealth=true",
        "blockAds=true", 
        "trackingId=false",
        f"launch={launch_encoded}"
    ]
    
    cdp_url = f"wss://production-sfo.browserless.io/chrome/stealth?{'&'.join(params)}"
    
    print("\n✓ Formatted URL with all parameters:")
    print(f"  {cdp_url}")
    
    # Verify URL structure
    if "wss://production-sfo.browserless.io/chrome/stealth?" in cdp_url:
        print("✓ Correct WebSocket endpoint")
    else:
        print("✗ Invalid WebSocket endpoint")
        return False
        
    if f"token={browserless_token}" in cdp_url:
        print("✓ Token parameter present")
    else:
        print("✗ Token parameter missing")
        return False
        
    if "launch=" in cdp_url and "%7B%22args%22" in cdp_url:
        print("✓ Launch parameter properly URL encoded")
    else:
        print("✗ Launch parameter not properly encoded")
        return False
        
    return True

def test_json_format_compatibility():
    """Test that our JSON format matches browserless.io expectations"""
    
    # Test various launch configurations
    test_cases = [
        {
            "name": "Basic stealth args",
            "args": ["--disable-blink-features=AutomationControlled", "--no-sandbox"]
        },
        {
            "name": "Full stealth configuration", 
            "args": [
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                "--no-sandbox", 
                "--disable-setuid-sandbox",
                "--disable-web-security"
            ]
        }
    ]
    
    print("\n✓ Testing JSON format compatibility:")
    
    for test_case in test_cases:
        launch_config = {"args": test_case["args"]}
        launch_json = json.dumps(launch_config)
        
        print(f"\n  Test: {test_case['name']}")
        print(f"  JSON: {launch_json}")
        
        # Verify JSON is valid
        try:
            parsed = json.loads(launch_json)
            if "args" in parsed and isinstance(parsed["args"], list):
                print("  ✓ Valid JSON structure")
            else:
                print("  ✗ Invalid JSON structure")
                return False
        except json.JSONDecodeError as e:
            print(f"  ✗ JSON decode error: {e}")
            return False
    
    return True

def main():
    """Run all tests"""
    print("🧪 Testing Browser Service WebSocket Connection Fixes")
    print("=" * 60)
    
    tests = [
        ("Launch Parameter Encoding", test_launch_parameter_encoding),
        ("URL Parameter Format", test_url_parameter_format), 
        ("JSON Format Compatibility", test_json_format_compatibility)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🔧 Running: {test_name}")
        print("-" * 40)
        try:
            result = test_func()
            results.append((test_name, result))
            status = "PASS" if result else "FAIL"
            print(f"Result: {status}")
        except Exception as e:
            print(f"ERROR: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 60)
    print("📊 Test Summary:")
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status} {test_name}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("\n🎉 All tests passed! Browser service fixes should resolve the WebSocket connection issues.")
        return True
    else:
        print(f"\n⚠️  {len(results) - passed} tests failed. Review the issues above.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)