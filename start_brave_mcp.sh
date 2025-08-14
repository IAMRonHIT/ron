#!/bin/bash

# Stop and remove any existing brave-mcp container
docker stop brave-mcp >/dev/null 2>&1 && docker rm brave-mcp >/dev/null 2>&1

# Run the Brave MCP server using the mcp_servers.json file
docker mcp gateway run --config mcp_servers.json --servers=brave
