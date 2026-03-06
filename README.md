# Multi-Mind

A multi-agent AI application with an [AgentGateway](https://github.com/agentgateway/agentgateway) proxy and a React webapp.

## Requirements

- [Bun](https://bun.sh/) >= 1.3.10
- [Docker](https://www.docker.com/) and Docker Compose (for running the gateway)
- An OpenAI API key

## Project Structure

```
gateway/       # AgentGateway config and Dockerfile
webapp/        # React frontend (Vite + Chakra UI)
packages/      # Shared workspace packages
deploy/        # Docker Compose setup and env config
```

## Setup

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment variables

```bash
cp deploy/.env.example deploy/.env
```

Edit `deploy/.env` and set your values:

| Variable         | Description              | Default  |
| ---------------- | ------------------------ | -------- |
| `OPENAI_API_KEY` | Your OpenAI API key      | -        |

## Running

### With Docker Compose (recommended)

This starts both the gateway and the webapp:

```bash
docker compose -f deploy/docker-compose.yml up --build
```

- Gateway: `http://localhost:3000` (proxies to OpenAI at `/openai/v1`)
- Gateway Admin: `http://localhost:15000`
- Webapp: `http://localhost:5173`

### Running the webapp locally (development)

If you prefer to run the webapp outside Docker for faster iteration:

```bash
bun run --cwd webapp dev
```

The webapp dev server starts on `http://localhost:5173`. By default it expects the gateway at `http://localhost:3000`.

### Running only the gateway

```bash
docker compose -f deploy/docker-compose.yml up gateway --build
```

## Development Commands

```bash
bun run format     # Format code (Biome)
bun run lint       # Lint all packages
bun run build      # Build all packages
bun run test       # Run all tests
```
