# Deployment

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Bun](https://bun.sh/) >= 1.3.10
- An OpenAI API key
- (Cloud deployment) A GCP project with Cloud Run enabled

## Environment Variables

### Gateway (`deploy/.env`)

Copy the example file and fill in your values:

```bash
cp deploy/.env.example deploy/.env
```

| Variable | Required | Description | Default |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | Yes | OpenAI API key used by the gateway to authenticate upstream requests | - |

This variable is injected into the gateway container via `env_file` in `docker-compose.yml` and referenced in `gateway/config.yml` as `$OPENAI_API_KEY`. The model is configured from the frontend.

### Webapp (`webapp/.env.template`)

Copy the template for local development:

```bash
cp webapp/.env.template webapp/.env
```

| Variable | Required | Description | Default |
| --- | --- | --- | --- |
| `VITE_SHOW_DEV_TOOLS` | No | Show developer tools in the UI | `true` |
| `VITE_API_URL` | No | URL the webapp uses to reach the gateway API | `http://localhost:33000/v1` |

When running via Docker Compose, the webapp receives `GATEWAY_URL=http://gateway:3000` automatically — you do not need to set it manually.

### CI / Cloud Run (`.github/workflows/deploy-gateway.yml`)

The GitHub Actions workflow for deploying the gateway to GCP Cloud Run requires these **GitHub repository variables** (`vars.*`):

| Variable | Description |
| --- | --- |
| `GCP_PROJECT_ID` | Google Cloud project ID |
| `GCP_REGION` | GCP region (e.g. `europe-west1`) |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Workload Identity Federation provider resource name |
| `GCP_SERVICE_ACCOUNT` | Service account email for the deploy job |

The workflow also expects these **GCP Secret Manager secrets**, which are mounted into the Cloud Run service at runtime:

| Secret name | Description |
| --- | --- |
| `OPENAI_API_KEY` | Same OpenAI key used locally |

## Running Locally with Docker Compose

```bash
docker compose -f deploy/docker-compose.yml up --build
```

| Service | URL |
| --- | --- |
| Gateway API | `http://localhost:3737` (proxies to OpenAI at `/openai/v1`) |
| Gateway Admin | `http://localhost:15000` |
| Gateway Readiness | `http://localhost:15021` |
| Webapp | `http://localhost:5199` |

To run only the gateway:

```bash
docker compose -f deploy/docker-compose.yml up gateway --build
```

To run the webapp outside Docker for faster iteration:

```bash
bun run --cwd webapp dev
```

## Deploying to Cloud Run

The gateway deploys automatically on push to `main` when files under `gateway/` change. You can also trigger a deploy manually via `workflow_dispatch` in the GitHub Actions UI.

The workflow:

1. Authenticates to GCP via Workload Identity Federation
2. Builds `gateway/Dockerfile.gw` and pushes to Artifact Registry
3. Deploys the image to Cloud Run with secrets mounted from Secret Manager
