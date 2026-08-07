# Sapper

Sapper is an open-source platform for building, managing, and running AI agents with knowledge bases, custom tools, plugin workflows, and a web workspace. The repository contains a React front end, a management backend, and a runtime service for Sapper Chain and Sapper RAG capabilities.

## Features

- Agent workspace for creating, configuring, publishing, and running AI agents.
- Knowledge-base management with text collections, graph collections, file ingestion, and retrieval APIs.
- Sapper Chain runtime for SPL generation, chain execution, tool invocation, answer generation, avatar generation, and conversation naming.
- Plugin-oriented backend modules for agents, custom plugins, publishing, files, LLM providers, OAuth2, notices, dictionaries, and system configuration.
- FastAPI-based APIs with OpenAPI documentation, JWT authentication, RBAC-oriented admin modules, Redis support, and MySQL persistence.
- React, TypeScript, Vite, Ant Design, Redux, and Tailwind-based web interface.

## Repository Layout

```text
.
├── sapper_web/       # React + TypeScript web application
├── sapper_backend/   # Management API, admin modules, plugins, auth, tasks
├── sapper_server/    # Sapper Chain, Sapper RAG, custom plugin runtime APIs
├── scripts/          # Convenience scripts for starting/stopping all services
├── ssl/              # Local TLS certificates, ignored by git
├── logs/             # Runtime logs, ignored by git
└── embed_model/      # Local embedding models, ignored by git
```

## Tech Stack

- Front end: React 18, TypeScript, Vite, Ant Design, Redux Toolkit, Tailwind CSS.
- Backend: Python 3.10+, FastAPI, SQLAlchemy async, Alembic, Redis, Celery.
- Runtime: FastAPI, Sapper Chain, Sapper RAG, OpenAI-compatible model APIs, document processing utilities.
- Storage: MySQL, Redis, optional object storage for uploaded files.

## Prerequisites

- Python 3.10 or later.
- Node.js and `pnpm`.
- MySQL.
- Redis.
- Optional: RabbitMQ/Celery if you use async task workers.
- Optional: `wkhtmltopdf` and `wkhtmltoimage` if you use HTML/PDF/image conversion features.
- Optional: TLS certificates if you run the bundled HTTPS commands.

## Configuration

Create local environment files from the templates:

```bash
cp sapper_backend/.env.example sapper_backend/.env
cp sapper_server/.env.template sapper_server/.env
```

Then update database, Redis, model provider, object storage, and service URL settings. Do not commit real API keys, database passwords, object-storage credentials, or TLS private keys.

For the front end, copy the provided template and configure the management, runtime, and published-agent API URLs:

```bash
cp sapper_web/.env.example sapper_web/.env.development
```

## Local Development

Install backend dependencies:

```bash
cd sapper_backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8007 --reload
```

Install runtime service dependencies:

```bash
cd sapper_server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8006 --reload
```

Install and run the web app:

```bash
cd sapper_web
pnpm install
pnpm dev --host 0.0.0.0 --port 8008
```

Useful URLs:

- Web app: `http://localhost:8008`
- Backend API docs: `http://localhost:8007/docs`
- Runtime API docs: `http://localhost:8006/server/api/v1/docs`

## Production-Style Startup

The helper scripts start all three services in `screen` sessions and write logs under `logs/`.

```bash
./scripts/start_all.sh
./scripts/stop_all.sh
```

Default service ports:

| Service | Directory | Port | Purpose |
| --- | --- | ---: | --- |
| `sapper_server` | `sapper_server/` | 8006 | Sapper Chain, Sapper RAG, custom plugin runtime |
| `sapper_backend` | `sapper_backend/` | 8007 | Management API, auth, admin, agent and knowledge modules |
| `sapper_web` | `sapper_web/` | 8008 | Web application |

The scripts expect Conda environments named `sapper_server` and `sapper_backend`, `pnpm` in `PATH`, and TLS files at:

```text
ssl/sapperapi/fullchain.pem
ssl/sapperapi/privkey.key
```

If you do not use Conda or local HTTPS, run the services manually with the local development commands instead.

## Common Commands

Front end:

```bash
cd sapper_web
pnpm lint
pnpm type-check
pnpm build
pnpm preview
```

Backend:

```bash
cd sapper_backend
alembic upgrade head
pytest
```

Runtime service:

```bash
cd sapper_server
pytest
```

## API Overview

- Backend API prefix: `/api/v1`
- Runtime API prefix: `/server/api/v1`
- Runtime modules:
  - `/server/api/v1/health`
  - `/server/api/v1/sapperchain`
  - `/server/api/v1/sapperrag`
  - `/server/api/v1/custom-plugin`

FastAPI generates interactive documentation through the `/docs` endpoints when enabled.

## Security Notes

Before publishing or deploying your fork:

- Rotate any keys that may have existed in local `.env` files.
- Keep `.env`, `ssl/`, `logs/`, uploaded files, generated files, and local models out of git.
- Replace example secrets in templates with your own local values.
- Review object-storage bucket names, public URLs, callback URLs, and CORS origins for your environment.

## Contributing

Contributions are welcome. Please keep changes focused, include tests for behavior changes when practical, and run the relevant checks before opening a pull request.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run linting, type checks, and tests for the affected service.
5. Open a pull request with a clear description of the change.

## License

No license file is currently included. Add a license such as MIT, Apache-2.0, or AGPL-3.0 before distributing the project publicly.
