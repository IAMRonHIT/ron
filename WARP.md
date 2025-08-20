# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Repository overview
- Monorepo with a FastAPI backend and a Next.js frontend.
- Primary entry points: backend/api and the Next.js app; orchestration via npm scripts for local development.

Common commands
- Install dependencies
  - Python (backend):
    - python3 -m venv venv && source venv/bin/activate
    - pip install -r requirements.txt && pip install -r backend/requirements.txt
  - Node (frontend):
    - npm install
- Run locally (development)
  - Frontend (Next.js):
    - npm run dev
  - Backend (FastAPI via Uvicorn):
    - source venv/bin/activate && PYTHONPATH=$PWD:$PWD/backend uvicorn backend.api:app --host 0.0.0.0 --port 8000 --reload
  - Run both concurrently (no Docker):
    - npm run dev:all
  - Backend-only helper (uses port 8001 per script):
    - npm run dev:backend
- Build
  - Frontend: npm run build
- Lint/format
  - Frontend: npm run lint
  - Backend lint: flake8 .
  - Backend format: black .
- Tests (backend)
  - All: pytest
  - Single test file: pytest path/to/test_file.py
  - Single test by name: pytest -k "test_name_substring"

Environment and setup
- Prereqs: Python >= 3.8, Node.js >= 18, npm, Anthropic API key.
- Setup scripts:
  - ./setup.sh creates venv, installs backend/frontend deps, scaffolds .env
  - ./start.sh launches the app (frontend on 3000, backend on 8000)
- Common environment variables (see README for usage):
  - ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY, GOOGLE_MAPS_API_KEY, VAPI_BACKEND_API_KEY, VAPI_FRONTEND_API_KEY, PUBMED_API_KEY, FDA_API_KEY, PERPLEXITY_API_KEY, BRAVE_API_KEY, NOVA_ACT_API_KEY
  - Browser automation options: BROWSERLESS_API_TOKEN, BROWSERLESS_ENDPOINT, BROWSERLESS_URL, USE_BROWSERLESS, BROWSERLESS_USE_RESIDENTIAL_PROXY, BROWSERLESS_TIMEOUT

High-level architecture
- Frontend (Next.js)
  - Location: src/ron-ai (per README). Next.js 15; TypeScript; Tailwind; Radix UI components; AI UI via @ai-sdk/react and related libs.
  - Talks to backend via NEXT_PUBLIC_API_URL (default for local dev is http://localhost:8000 unless overridden).
- Backend (FastAPI)
  - Entry: backend/api.py (ASGI app)
  - Core agents/integrations include:
    - claude_sonnet_4_agent.py integrating Claude Sonnet 4 with tools (web search, code exec, text editing, computer-use, bash)
    - healthcare_agent_integration.py for provider search, medication tasks, appointment scheduling, deep research
    - claude_browser_integration.py for browser automation
  - Endpoints (per README):
    - POST /chat (Claude chat)
    - POST /healthcare/task, POST /healthcare/browser
    - POST /code/execute, POST /search
    - POST /files/upload, POST /files/analyze
    - POST /api/run_sse (deep research streaming)
    - GET /health (health check)
  - Python path should include repo root and backend (e.g., PYTHONPATH=$PWD:$PWD/backend during local dev).

Notes from repository rules/docs
- README: Contains ports, setup, and directory overview; follow its service URLs and API list when wiring the UI and tests.
- CLAUDE.md: “You are required to at minimum do two relevant tool calls regarding the api implementation before writing any code.” Maintain this workflow requirement when implementing or modifying API-related logic.

Troubleshooting essentials
- Port conflicts: lsof -i :8000 or :3000 and kill the conflicting PID.
- Frontend cache/node_modules issues: npm cache clean --force && rm -rf node_modules && npm install
- Backend venv/import issues: ensure venv is active and reinstall deps.
- API base: verify NEXT_PUBLIC_API_URL and backend availability.

