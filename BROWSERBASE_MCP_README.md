# Browserbase MCP Integration for Ron AI

## Overview

This integration connects Ron AI with Browserbase's cloud browser automation platform through the Model Context Protocol (MCP). It enables Claude to control browsers, navigate websites, interact with web elements, and extract data using natural language commands.

## ✅ Verified Implementation

This implementation follows the **Zero-Assumption Protocol**, with all tool names and parameters verified against:
- **NPM Package**: `@browserbasehq/mcp-server-browserbase` (v2.0.0)
- **GitHub**: [browserbase/mcp-server-browserbase](https://github.com/browserbase/mcp-server-browserbase)
- **Official Docs**: [Browserbase MCP Documentation](https://docs.browserbase.com/integrations/mcp/introduction)

## 🚀 Quick Start

### 1. Get Browserbase Credentials

1. Sign up at [browserbase.com](https://browserbase.com)
2. Navigate to your dashboard
3. Copy your API Key and Project ID

### 2. Configure Environment

Add to your `.env` file:
```bash
# Required
BROWSERBASE_API_KEY=your_api_key_here
BROWSERBASE_PROJECT_ID=your_project_id_here

# Option 1: Remote Server (Recommended)
BROWSERBASE_MCP_URL=https://your-smithery-url.smithery.ai/mcp

# Option 2: Local Server (leave MCP_URL empty)
# The integration will run: npx @browserbasehq/mcp-server-browserbase
```

### 3. Set Up Remote Server (Recommended)

1. Visit [Smithery Browserbase Server](https://smithery.ai/server/@browserbasehq/mcp-server-browserbase)
2. Enter your Browserbase API Key and Project ID
3. Copy the generated URL
4. Add it as `BROWSERBASE_MCP_URL` in your `.env`

### 4. Install Dependencies

```bash
# For local server option
npm install -g @browserbasehq/mcp-server-browserbase

# Python integration is already included
```

### 5. Restart Backend

```bash
./start_backend_fixed.sh
```

## 📋 Available Tools

All tool names are verified from the official Browserbase MCP repository:

### Multi-Session Management
- `multi_browserbase_stagehand_session_create` - Create a new browser session
- `multi_browserbase_stagehand_session_list` - List all active sessions
- `multi_browserbase_stagehand_session_close` - Close a specific session

### Browser Automation
- `multi_browserbase_stagehand_navigate_session` - Navigate to URL in session
- `multi_browserbase_stagehand_act_session` - Perform natural language actions
- `multi_browserbase_stagehand_extract_session` - Extract data from pages
- `multi_browserbase_stagehand_screenshot_session` - Take screenshots

### Debugging & Live View
- `browserbase_stagehand_debug_session` - Get debug info and Live View URLs
- `browserbase_cookies_add` - Add cookies to browser session

## 🎯 Usage Examples

### Basic Browser Automation

```python
# Claude can now use these commands naturally:
"Create a browser session and navigate to example.com"
"Click the login button and fill in the form"
"Extract all product prices from the page"
"Take a screenshot of the checkout process"
```

### Multi-Session Responsive Testing

```python
# Test across different viewports simultaneously
"Create mobile and desktop sessions"
"Test the checkout flow on both mobile and desktop"
"Compare the layout differences between viewports"
```

### Live View Integration

```python
# Get real-time browser views
"Show me the live view of the current browser session"
"Create an embedded view of the automation process"
```

## 🔧 Advanced Configuration

### Model Selection

By default, Browserbase uses Gemini 2.0 Flash for Stagehand AI. You can change this:

```bash
# Use Claude for Stagehand
BROWSERBASE_MODEL_NAME=anthropic/claude-3-5-sonnet-latest
ANTHROPIC_API_KEY=your_anthropic_key

# Use GPT-4o for Stagehand
BROWSERBASE_MODEL_NAME=openai/gpt-4o
OPENAI_API_KEY=your_openai_key
```

### Proxy and Stealth Options

```bash
BROWSERBASE_PROXIES=true           # Enable proxy support
BROWSERBASE_ADVANCED_STEALTH=true  # Enable advanced stealth mode
BROWSERBASE_CONTEXT_ID=xxx         # Persistent session context
```

### Viewport Configuration

```bash
BROWSERBASE_WIDTH=1920   # Default browser width
BROWSERBASE_HEIGHT=1080  # Default browser height
```

## 🏗️ Architecture

```
Ron AI Backend
    ↓
ClaudeCompletions
    ↓
BrowserbaseMCPIntegration (Python)
    ↓
[Remote Smithery URL]  OR  [Local NPX Server]
    ↓
Browserbase Cloud Infrastructure
    ↓
Stagehand AI (Natural Language Automation)
```

## 🔍 How It Works

1. **Environment Detection**: The integration checks for Browserbase credentials in environment variables
2. **Transport Selection**: 
   - If `BROWSERBASE_MCP_URL` is set → Use remote Smithery server
   - Otherwise → Start local npx server
3. **MCP Registration**: The Browserbase server is added to Claude's MCP servers list
4. **Tool Availability**: Claude can now use all Browserbase tools via the MCP protocol
5. **Natural Language Processing**: Stagehand AI interprets commands and controls browsers

## 🐛 Troubleshooting

### Integration Not Working

1. Check environment variables:
```bash
echo $BROWSERBASE_API_KEY
echo $BROWSERBASE_PROJECT_ID
```

2. Test the integration:
```bash
cd backend/integrations
python3 browserbase_mcp.py
```

3. Check backend logs:
```bash
tail -f backend/api.log
```

### Tools Not Appearing

1. Ensure the backend was restarted after configuration
2. Check that `BROWSERBASE_MCP_URL` is correctly set (for remote)
3. Verify npx is installed (for local): `npx --version`

### Connection Issues

1. For Smithery: Verify the URL is accessible
2. For local: Check if port 8931 is available
3. Ensure firewall isn't blocking connections

## 📚 Resources

- [Browserbase Documentation](https://docs.browserbase.com)
- [MCP Specification](https://modelcontextprotocol.io)
- [Stagehand AI](https://github.com/browserbase/stagehand)
- [Smithery Platform](https://smithery.ai)

## 🔒 Security Notes

- API keys are never sent to the frontend
- All browser sessions are isolated in Browserbase cloud
- Sessions auto-terminate after timeout
- Supports advanced stealth and proxy options

## 🤝 Support

- **Browserbase Support**: support@browserbase.com
- **Ron AI Issues**: Create an issue in the project repository
- **MCP Questions**: [Model Context Protocol Discord](https://discord.gg/mcp)