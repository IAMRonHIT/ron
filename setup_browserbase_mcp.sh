#!/bin/bash
# ============================================================================
# Browserbase MCP Setup Script for Ron AI
# This script sets up the Browserbase MCP integration
# ============================================================================

set -e  # Exit on error

echo "================================================"
echo "Browserbase MCP Setup for Ron AI"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/api.py" ]; then
    echo "❌ Error: Please run this script from the ron-ai project root directory"
    exit 1
fi

# Step 1: Install NPM package globally (for local server option)
echo "📦 Step 1: Installing Browserbase MCP Server package..."
npm list -g @browserbasehq/mcp-server-browserbase &>/dev/null || {
    echo "Installing @browserbasehq/mcp-server-browserbase globally..."
    npm install -g @browserbasehq/mcp-server-browserbase
}
echo "✅ NPM package installed"
echo ""

# Step 2: Check for required environment variables
echo "🔍 Step 2: Checking environment configuration..."
source .env 2>/dev/null || true
if [ -z "$BROWSERBASE_API_KEY" ] || [ -z "$BROWSERBASE_PROJECT_ID" ]; then
    echo "⚠️  Missing Browserbase credentials in .env file"
    echo ""
    echo "Please add the following to your .env file:"
    echo "----------------------------------------"
    echo "BROWSERBASE_API_KEY=your_api_key_here"
    echo "BROWSERBASE_PROJECT_ID=your_project_id_here"
    echo ""
    echo "Get your credentials from: https://browserbase.com"
    echo ""
    
    read -p "Would you like to add them now? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your Browserbase API Key: " api_key
        read -p "Enter your Browserbase Project ID: " project_id
        
        # Add to .env file
        echo "" >> .env
        echo "# Browserbase MCP Configuration" >> .env
        echo "BROWSERBASE_API_KEY=$api_key" >> .env
        echo "BROWSERBASE_PROJECT_ID=$project_id" >> .env
        echo "✅ Credentials added to .env file"
    fi
else
    echo "✅ Browserbase credentials found"
fi

# Step 3: Choose transport methodecho ""
echo "🚀 Step 3: Choose transport method..."
echo "1) Remote Server via Smithery (Recommended)"
echo "2) Local Server via npx"
echo ""
read -p "Select option (1 or 2): " -n 1 -r transport_choice
echo ""

if [[ $transport_choice == "1" ]]; then
    echo ""
    echo "📡 Setting up remote server via Smithery..."
    echo ""
    echo "Please visit: https://smithery.ai/server/@browserbasehq/mcp-server-browserbase"
    echo "1. Enter your Browserbase API Key and Project ID"
    echo "2. Copy the generated URL"
    echo ""
    read -p "Enter your Smithery URL: " smithery_url
    
    if [ ! -z "$smithery_url" ]; then
        # Check if BROWSERBASE_MCP_URL exists in .env
        if grep -q "BROWSERBASE_MCP_URL=" .env; then
            # Update existing
            sed -i.bak "s|BROWSERBASE_MCP_URL=.*|BROWSERBASE_MCP_URL=$smithery_url|" .env
        else
            # Add new
            echo "BROWSERBASE_MCP_URL=$smithery_url" >> .env
        fi
        echo "✅ Smithery URL configured"
    fi
else
    echo "✅ Local server mode selected (no URL needed)"
fi

# Step 4: Test the integration
echo ""
echo "🧪 Step 4: Testing Browserbase MCP integration..."
cd backend/integrations
python3 browserbase_mcp.py 2>/dev/null || {
    echo "⚠️  Test failed. Installing required Python packages..."
    pip install dataclasses enum typing
    python3 browserbase_mcp.py
}
cd ../..

echo ""
echo "================================================"
echo "✅ Browserbase MCP Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Restart the Ron AI backend: ./start_backend_fixed.sh"
echo "2. The Browserbase MCP tools will be available to Claude"
echo ""
echo "Available tools:"
echo "  - multi_browserbase_stagehand_session_create"
echo "  - multi_browserbase_stagehand_navigate_session"
echo "  - multi_browserbase_stagehand_act_session"
echo "  - multi_browserbase_stagehand_extract_session"
echo "  - browserbase_stagehand_debug_session"
echo "  ... and more!"
echo ""
echo "Documentation: https://docs.browserbase.com/integrations/mcp/introduction"
echo "================================================"