# Node Enrollment Wizard

A full-stack application for enrolling and managing machines from a [Tailscale](https://tailscale.com/) network into a control plane. The wizard walks operators through discovering a machine, reviewing its details, configuring permissions, generating a bootstrap command, and verifying the node is ready.

## Features

- **6-step enrollment wizard** – Select Machine → Review Details → Set Permissions → Bootstrap Command → Verify → Complete
- **Tailscale device discovery** – fetches machines from your tailnet; falls back to mock data when unconfigured
- **Node management** – list, inspect, update, and delete registered nodes via a REST API
- **Enrollment tokens** – generate short-lived tokens and a ready-to-paste bootstrap `curl` command
- **Verification checklist** – tracks each enrollment step (discovered, token created, bootstrap generated, agent registered, node ready)
- **OpenAPI docs** – auto-generated Swagger UI and Scalar API reference served by the backend

## Technologies

**Backend:**

- [Bun](https://bun.sh/)
- [Hono](https://hono.dev/) + [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)

**Frontend:**

- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [MUI](https://mui.com/)
- [React Query](https://tanstack.com/query)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Framer Motion](https://www.framer.com/motion/)

## Quickstart

### Run both servers with one command

```bash
cd frontend && pnpm install && pnpm dev:all
```

### Or run each separately

```bash
# Backend
cd backend && bun install && bun dev

# Frontend
cd frontend && pnpm install && pnpm dev
```

## Environment Variables

**Backend** (`backend/.env`):

| Variable | Description |
|---|---|
| `TAILSCALE_API_KEY` | Tailscale API key for device discovery (optional – uses mock data if unset) |
| `TAILSCALE_TAILNET` | Your tailnet name (e.g. `example.com`) (optional) |
| `MASTER_API_KEY` | Optional bearer token for global API auth |

**Frontend** (`frontend/.env`):

| Variable | Description |
|---|---|
| `VITE_DEV_HOSTNAME` | Backend base URL in dev (default: `http://localhost:5001`) |
| `VITE_HOSTNAME` | Backend base URL in production |
| `VITE_MASTER_API_KEY` | Forwarded as `Authorization: Bearer` when set |

## API Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/nodes` | List registered nodes |
| `POST` | `/api/v1/nodes` | Register a new node |
| `GET` | `/api/v1/nodes/discover` | Discover machines from Tailscale |
| `GET` | `/api/v1/nodes/:id` | Get a single node |
| `PATCH` | `/api/v1/nodes/:id` | Update a node |
| `DELETE` | `/api/v1/nodes/:id` | Delete a node |
| `POST` | `/api/v1/nodes/:id/heartbeat` | Record a node heartbeat |
| `POST` | `/api/v1/enrollment/tokens` | Generate an enrollment token |
| `GET` | `/api/v1/enrollment/tokens/:nodeId` | List active tokens for a node |
| `POST` | `/api/v1/enrollment/verify/:nodeId` | Run verification checks |
| `GET` | `/api/v1/enrollment/status/:nodeId` | Get verification status |

Interactive API docs are served at `http://localhost:5001/docs` (Swagger UI) and `http://localhost:5001/reference` (Scalar) when the backend is running.

## Tests

- Frontend: `cd frontend && pnpm lint && pnpm test && pnpm build`
- Backend: `cd backend && bun test`

## Docs

- `Agents.md`
- `frontend/APP_MAP.md`
- `backend/APP_MAP.md`
- `docs/CONTRACTS.md`

## DevOps

- [GitHub](https://github.com/)
- [Docker](https://www.docker.com/)
