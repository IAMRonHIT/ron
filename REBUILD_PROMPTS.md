# Ron AI Rebuild Prompts

## Prompt 1: Core Backend API with DynamoDB & Auth

```
Create a FastAPI backend for Ron AI Healthcare Copilot with DynamoDB and JWT authentication:

Database Setup:
- Use existing DynamoDB tables from current project
- Add new table: ron-ai-auth-tokens for session management
- Keep existing table schemas unchanged

Authentication:
- JWT tokens with PyJWT
- Bcrypt for password hashing
- Simple email/password auth (no OAuth)
- 24-hour token expiry

Core Endpoints:
- POST /auth/register - Create user in DynamoDB
- POST /auth/login - Return JWT token
- POST /auth/logout - Invalidate token
- GET /auth/me - Get current user
- POST /chat - Protected endpoint with SSE streaming

Chat Implementation:
- Require valid JWT for /chat
- Generate session_id with user_id prefix
- Store messages in DynamoDB
- Direct Anthropic SDK integration
- Support streaming with proper error handling

Environment Variables:
- ANTHROPIC_API_KEY
- JWT_SECRET_KEY
- AWS_REGION (for DynamoDB)

Keep it simple - no complex middleware, just auth + chat.
```

## Prompt 2: Smart Tool Loading System

```
Implement context-aware tool loading for Claude:

Tool Categories:
1. CORE_TOOLS (5-10 tools for main Claude):
   - agent_factory
   - browser_use  
   - claude_code_sdk
   - web_search
   - text_editor

2. MEDICAL_TOOLS (subagents only):
   - clinical_operations
   - All pubmed_* tools
   - All FDA drug label tools

3. RESEARCH_TOOLS (subagents only):
   - perplexity_sonar_pro
   - perplexity_reasoning_pro
   - perplexity_deep_research

Implementation:
- Create ToolSelector class
- analyze_message(text) -> returns needed tool categories
- get_tools_for_role(role) -> returns tool list
- Main Claude: CORE_TOOLS only
- Medical subagent: CORE + MEDICAL_TOOLS
- Research subagent: CORE + RESEARCH_TOOLS

No tool modifications - just smart loading.
```

## Prompt 3: Clean Agent Factory

```
Implement agent_factory tool for subagent orchestration:

Core Functions:
- spawn_agent(agent_id, role, task, tools) -> Creates subagent
- execute_agent(agent_id) -> Runs and returns results

Subagent Roles:
- medical: Clinical research with medical tools
- research: Web research with Perplexity tools  
- general: Basic tasks with core tools only

Key Settings:
- Same Claude model for all agents
- disable_mcp=True for subagents
- thinking_budget=8000 for complex reasoning
- Stream results back to main Claude

Keep it simple - no complex state, just spawn/execute/cleanup.
```

## Prompt 4: Browser-Use Integration

```
Integrate browser-use for web automation:

Core Implementation:
- Single function: create_browser_session(url) -> LiveURL
- Use browser-use library with Browserless
- Environment: BROWSERLESS_API_TOKEN

Session Management:
- One active session per user
- 5-minute timeout
- Auto-cleanup on completion
- Return LiveURL for iframe embedding

Simple CDP URL:
wss://chrome.browserless.io?token={token}&timeout=300000

No complex configs - Browserless handles browser setup.
```

## Prompt 5: Native Tools Setup

```
Implement native tool support:

Tools to Implement:
1. web_search:
   - Use Brave Search API
   - Parallel search with built-in Anthropic web search
   - Return combined results

2. text_editor:
   - Map to Claude's str_replace_editor type
   - Handle file paths properly

3. code_execution:
   - Run in Docker container
   - Mount workspace at /app
   - 30-second timeout
   - Capture stdout/stderr

Docker Setup:
- Python 3.11 base image
- Limited resources (1 CPU, 512MB RAM)
- No network except localhost
- Auto-cleanup after execution
```

## Prompt 6: Minimal Frontend with Auth

```
Add authentication to existing Next.js frontend:

Auth Pages:
- /login - Email/password form
- /register - Registration with email validation
- Use existing UI components (shadcn)

Auth Integration:
- Store JWT in localStorage
- Add auth headers to all API calls
- Redirect to /login if 401 response
- Show user email in header

Protected Routes:
- Wrap existing chat pages with auth check
- Keep ALL existing UI unchanged
- Just add auth layer on top

API Client Updates:
- Update claudeAPI class to include auth headers
- Handle token refresh on 401
- Keep existing streaming logic

DO NOT change any UI components or chat interface.
```

## Prompt 7: Docker Compose Setup

```
Create docker-compose.yml for local development:

Services:
1. backend:
   - FastAPI on port 8000
   - Environment variables from .env
   - Volume mount for hot reload

2. frontend:
   - Next.js on port 3000
   - Environment variables
   - Volume mount for hot reload

3. localstack:
   - DynamoDB local for development
   - Auto-create tables on startup

Networks:
- ron-ai-network for service communication

Volumes:
- ./backend:/app/backend
- ./src:/app/src

Include health checks and restart policies.
```

## Build Order:
1. Backend API with auth (Prompt 1)
2. Tool loading system (Prompt 2)
3. Agent factory (Prompt 3)
4. Browser-use (Prompt 4)
5. Native tools (Prompt 5)
6. Frontend auth (Prompt 6)
7. Docker setup (Prompt 7)

Each prompt builds on the previous one. Execute in order for best results.