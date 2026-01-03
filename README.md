# Pharmacy AI Agent

This project is a Node.js + TypeScript backend that powers a real-time, conversational pharmacy assistant. It streams responses over Server-Sent Events (SSE), keeps a local SQLite database for demo data, and exposes a simple HTTP API.

## Architecture Overview

The system is built as a stateless Node.js service that exposes a streaming chat API.

At a high level, the architecture consists of:
- **HTTP API (Express)** – Receives user messages and streams agent responses using Server-Sent Events (SSE).
- **Agent Loop** – Orchestrates interaction with the OpenAI Responses API, including tool invocation and multi-step reasoning.
- **Tools Layer** – A set of deterministic functions that the agent can call to access backend data.
- **Database Layer** – A local SQLite database initialized with synthetic users, medications, and prescriptions for demonstration purposes.
- **UI** – A simple static front-end served by the backend to interact with the agent and visualize tool calls.

## How to run with Docker

Build the image:
```bash
docker build -t pharmacy-ai-agent .
```

Run it (set your OpenAI key at runtime):
```bash
docker run --rm -p 3000:3000 \
  -e OPENAI_API_KEY="your-key" \
  -e PORT=3000 \
  pharmacy-ai-agent
```

## Key environment variables
- `OPENAI_API_KEY` (required): your OpenAI API key.
- `PORT` (optional): server port (default: `3000`).
- `LOG_LEVEL` (optional): logging verbosity.

## Endpoints

- `GET /health` — simple health check.
- `POST /api/chat` — SSE endpoint that streams chat responses.