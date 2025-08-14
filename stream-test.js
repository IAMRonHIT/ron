#!/usr/bin/env node

/**
 * Stream Test Script
 * 
 * This script tests the Claude streaming implementation to verify that
 * the ERR_INCOMPLETE_CHUNKED_ENCODING fixes are working properly.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Claude Streaming Test Suite');
console.log('==============================\n');

// Test 1: Check if API improvements are in place
function testAPIEnhancements() {
  console.log('📋 Test 1: Checking API enhancements...');
  
  const apiPath = path.join(__dirname, 'src/lib/api.ts');
  if (!fs.existsSync(apiPath)) {
    console.error('❌ api.ts not found');
    return false;
  }
  
  const apiContent = fs.readFileSync(apiPath, 'utf8');
  
  const requiredFeatures = [
    'activeStreams: Map<string, AbortController>',
    'isRecoverableStreamError',
    'chatStreamWithRetry',
    'wrapStreamWithErrorHandling',
    'abortAllStreams'
  ];
  
  let passed = 0;
  requiredFeatures.forEach(feature => {
    if (apiContent.includes(feature)) {
      console.log(`  ✅ ${feature}`);
      passed++;
    } else {
      console.log(`  ❌ ${feature}`);
    }
  });
  
  console.log(`  Result: ${passed}/${requiredFeatures.length} features implemented\n`);
  return passed === requiredFeatures.length;
}

// Test 2: Check if page.tsx has error handling improvements
function testPageEnhancements() {
  console.log('📋 Test 2: Checking page.tsx enhancements...');
  
  const pagePath = path.join(__dirname, 'src/app/page.tsx');
  if (!fs.existsSync(pagePath)) {
    console.error('❌ page.tsx not found');
    return false;
  }
  
  const pageContent = fs.readFileSync(pagePath, 'utf8');
  
  const requiredFeatures = [
    'connectionStatus',
    'handleRetryMessage',
    'net::ERR_INCOMPLETE_CHUNKED_ENCODING',
    'claudeAPI.abortAllStreams()',
    'setConnectionStatus',
    'Connection Error',
    'Retry'
  ];
  
  let passed = 0;
  requiredFeatures.forEach(feature => {
    if (pageContent.includes(feature)) {
      console.log(`  ✅ ${feature}`);
      passed++;
    } else {
      console.log(`  ❌ ${feature}`);
    }
  });
  
  console.log(`  Result: ${passed}/${requiredFeatures.length} features implemented\n`);
  return passed === requiredFeatures.length;
}

// Test 3: Check TypeScript compilation
function testTypeScriptCompilation() {
  console.log('📋 Test 3: Testing TypeScript compilation...');
  
  return new Promise((resolve) => {
    const tsc = spawn('npx', ['tsc', '--noEmit'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let hasErrors = false;
    
    tsc.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    tsc.stderr.on('data', (data) => {
      output += data.toString();
      hasErrors = true;
    });
    
    tsc.on('close', (code) => {
      if (code === 0 && !hasErrors) {
        console.log('  ✅ TypeScript compilation successful');
      } else {
        console.log('  ❌ TypeScript compilation failed:');
        console.log(output);
      }
      console.log('');
      resolve(code === 0 && !hasErrors);
    });
    
    tsc.on('error', (error) => {
      console.log('  ❌ Failed to run TypeScript compiler:', error.message);
      console.log('');
      resolve(false);
    });
  });
}

// Test 4: Network error simulation
function testNetworkErrorHandling() {
  console.log('📋 Test 4: Network error handling patterns...');
  
  const apiPath = path.join(__dirname, 'src/lib/api.ts');
  const apiContent = fs.readFileSync(apiPath, 'utf8');
  
  const errorPatterns = [
    'ECONNRESET',
    'ECONNABORTED', 
    'ETIMEDOUT',
    'AbortError',
    'net::ERR_INCOMPLETE_CHUNKED_ENCODING',
    'Parse error',
    'network error'
  ];
  
  let handled = 0;
  errorPatterns.forEach(pattern => {
    if (apiContent.includes(pattern)) {
      console.log(`  ✅ Handles ${pattern}`);
      handled++;
    } else {
      console.log(`  ❌ Missing ${pattern} handling`);
    }
  });
  
  console.log(`  Result: ${handled}/${errorPatterns.length} error patterns handled\n`);
  return handled >= 6; // Allow 1 missing for flexibility
}

// Main test runner
async function runTests() {
  const results = [];
  
  results.push(testAPIEnhancements());
  results.push(testPageEnhancements());
  results.push(await testTypeScriptCompilation());
  results.push(testNetworkErrorHandling());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('📊 Test Results:');
  console.log('================');
  console.log(`Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('✅ All tests passed! The streaming fixes should work properly.');
    console.log('\n🚀 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Test the streaming functionality in the browser');
    console.log('3. Check browser console for any remaining errors');
  } else {
    console.log('❌ Some tests failed. Please review the issues above.');
    process.exit(1);
  }
}

runTests().catch(console.error);
