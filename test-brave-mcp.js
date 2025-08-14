#!/usr/bin/env node

const { spawn } = require('child_process');

// Test configuration
const testQuery = {
  method: 'tools/call',
  params: {
    name: 'brave_web_search',
    arguments: {
      query: 'healthcare costs',
      goggles: ['https://gist.githubusercontent.com/RonsDad/669383264435c45be4a76da5158a5d05/raw']
    }
  }
};

// Start the MCP server
const server = spawn('docker', [
  'run',
  '-i',
  '--rm',
  '-e',
  `BRAVE_API_KEY=${process.env.BRAVE_API_KEY || 'BSAUwAT8CsLqYBpCoXJ9W39YNMxJQWgD'}`,
  'mcp/brave-search'
]);

// Send test query
server.stdin.write(JSON.stringify(testQuery) + '\n');

// Handle output
server.stdout.on('data', (data) => {
  console.log('Response:', data.toString());
});

server.stderr.on('data', (data) => {
  console.error('Error:', data.toString());
});

// Clean exit after 5 seconds
setTimeout(() => {
  server.kill();
  process.exit(0);
}, 5000);