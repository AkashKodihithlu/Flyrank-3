# Flyrank-3

## Task API (Assignment 1)

A small in-memory CRUD API for managing tasks, built with Node.js and Express. Includes interactive API documentation via Swagger UI.

This is a learning project built stage by stage: read endpoints, create with validation, full CRUD, and interactive docs.

### Install & Run

```bash
npm install
node app.js
```

The server starts on `http://localhost:3000`.
Interactive API docs (Swagger UI) are available at `http://localhost:3000/docs`.

### Endpoints

| Method | Path | Description | Success | Error |
|--------|------|-------------|---------|-------|
| `GET` | `/` | API info | 200 | — |
| `GET` | `/health` | Health check | 200 | — |
| `GET` | `/tasks` | List all tasks | 200 | — |
| `GET` | `/tasks/:id` | Get a single task by id | 200 | 404 if not found |
| `POST` | `/tasks` | Create a new task (`{ "title": "..." }`) | 201 | 400 if title missing/empty |
| `PUT` | `/tasks/:id` | Update a task's title and/or done | 200 | 400 invalid body, 404 not found |
| `DELETE` | `/tasks/:id` | Delete a task | 204 | 404 if not found |

### Tech Stack
- Node.js & Express
- In-memory data store (resets on server restart)
- OpenAPI 3.0 spec + Swagger UI (`swagger-ui-express`)
