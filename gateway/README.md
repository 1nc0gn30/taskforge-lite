# 🛡️ TaskForge Gateway

API gateway service for routing traffic to Users, Tasks, and Comments microservices.

## Routes

| Method | Path           | Description            |
|--------|----------------|------------------------|
| GET    | /api/health    | Health check           |
| GET    | /api/users     | Proxy to user service  |
| GET    | /api/tasks     | Proxy to task service  |
| GET    | /api/comments  | Proxy to comment svc   |

## Setup

```bash
npm install
npm run dev



Configure .env with URLs for each service.


---

You're all set to run:
```bash
npm run dev