# Express.js REST API — Personal Learning Reference

A minimal REST API for managing blog posts, built with **Express.js** and **Node.js**.  
This project is a personal educational reference, structured to demonstrate the core patterns of a well-organised Express application.

---

## Overview

The API exposes a set of endpoints for creating, reading, updating, and deleting (CRUD) posts. Data is stored in memory (a plain JavaScript array), which keeps the focus on Express concepts without the added complexity of a real database.

A small HTML/JavaScript frontend in the `/public` directory demonstrates how a browser-based client can consume the API using the `fetch` API.

---

## Project Structure

```
ExpressJS/
├── server.js                         # Entry point — starts the HTTP server
├── .env                              # Local environment variables (not committed to git)
├── public/                           # Static files served directly to the browser
│   ├── index.html                    # Frontend UI (fetch posts, add post form)
│   ├── about.html
│   └── js/
│       └── main.js                   # Client-side JS (calls the API via fetch)
└── src/
    ├── app.js                        # Express app factory — middleware + routes configured here
    ├── config/
    │   └── env.js                    # Single source of truth for environment variables
    ├── api/
    │   └── posts/                    # Posts domain — route definitions and business logic co-located
    │       ├── posts.routes.js       # URL-to-handler mapping
    │       └── posts.controller.js   # Request handlers (CRUD logic)
    └── middleware/
        ├── logger.js                 # Logs every request to the terminal
        ├── notFound.js               # Catches unmatched routes → produces a 404 error
        └── error.js                  # Central error handler — formats all errors as JSON
```

---

## Getting Started

**Prerequisites:** Node.js v18 or higher (for native `--env-file` support).

```bash
# Install dependencies
npm install

# Start in development mode (auto-restarts on file changes)
npm run dev

# Start in production mode
npm start
```

The server will be available at `http://localhost:8000`.

---

## API Endpoints

Base URL: `http://localhost:8000/api/posts`

| Method | Path       | Description                                   | Request Body         |
|--------|------------|-----------------------------------------------|----------------------|
| GET    | `/`        | Retrieve all posts (optional `?limit=N`)      | —                    |
| GET    | `/:id`     | Retrieve a single post by ID                  | —                    |
| POST   | `/`        | Create a new post                             | `{ "title": "..." }` |
| PUT    | `/:id`     | Update the title of an existing post          | `{ "title": "..." }` |
| DELETE | `/:id`     | Delete a post                                 | —                    |

### Example Requests

```bash
# Get all posts
curl http://localhost:8000/api/posts

# Get first 2 posts
curl http://localhost:8000/api/posts?limit=2

# Get post with ID 1
curl http://localhost:8000/api/posts/1

# Create a new post
curl -X POST http://localhost:8000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "My New Post"}'

# Update post with ID 1
curl -X PUT http://localhost:8000/api/posts/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'

# Delete post with ID 2
curl -X DELETE http://localhost:8000/api/posts/2
```

---

## How It Works

### The Request Lifecycle

Every HTTP request travels through a pipeline of functions before a response is sent. Here is what happens when a client calls `POST /api/posts`:

```
Client (browser / curl / Postman)
        │
        │  POST /api/posts  { "title": "Hello" }
        ▼
┌─────────────────────────────────────────┐
│              server.js                  │
│  app.listen() — accepts the connection  │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│               src/app.js               │
│                                         │
│  1. express.json()       parse body     │
│  2. express.urlencoded() parse forms    │
│  3. logger               log to console │
│  4. express.static()     not a file →   │
│  5. postsRouter ─────────────────────── │──┐
│  6. notFound             (skipped)      │  │
│  7. errorHandler         (skipped)      │  │
└─────────────────────────────────────────┘  │
                                             │
                     ┌───────────────────────┘
                     ▼
┌─────────────────────────────────────────┐
│         src/api/posts/posts.routes.js   │
│                                         │
│  POST /  →  createPost                  │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│     src/api/posts/posts.controller.js   │
│                                         │
│  createPost:                            │
│    - reads title from req.body          │
│    - validates it is not empty          │
│    - pushes new post to the array       │
│    - sends 201 + updated array as JSON  │
└────────────────────┬────────────────────┘
                     │
                     ▼
        Client receives JSON response
        HTTP 201 Created
        [{ id: 1, ... }, { id: 4, title: "Hello" }]
```

### Error Flow

When something goes wrong (e.g. requesting a post that doesn't exist), the error path is:

```
getPost controller
  → creates Error("post not found"), sets error.status = 404
  → calls next(error)
        │
        ▼
  notFound middleware — skipped (already have an error)
        │
        ▼
  errorHandler middleware (4-argument signature)
  → res.status(404).json({ msg: "A post with the id of 99 was not found" })
        │
        ▼
  Client receives HTTP 404 + JSON error body
```

---

## Concepts Learned

### 1. The Express Middleware Pipeline

Middleware is the central concept in Express. Every middleware function has the signature `(req, res, next)`. Express calls them in registration order. Each function must either send a response or call `next()` — otherwise the request hangs.

```js
// A simple custom middleware
const myMiddleware = (req, res, next) => {
  console.log('Request received!');
  next(); // Pass control to the next function in the chain
};

app.use(myMiddleware);
```

Middleware can:
- Parse request bodies (`express.json()`)
- Log requests (`logger.js`)
- Serve static files (`express.static()`)
- Authenticate users
- Handle errors

**Order matters.** Middleware registered first runs first. Error handlers must be last.

---

### 2. REST API Design

REST (Representational State Transfer) is an architectural style that uses standard HTTP vocabulary to express intent. Resources are nouns (posts, users), and HTTP methods are verbs:

| HTTP Method | Meaning               | Typical Status Code |
|-------------|-----------------------|---------------------|
| GET         | Read — retrieve data  | 200 OK              |
| POST        | Create a new resource | 201 Created         |
| PUT         | Update a resource     | 200 OK              |
| DELETE      | Remove a resource     | 200 OK / 204        |

URL structure follows a predictable pattern:
- `/api/posts`     → the collection
- `/api/posts/:id` → a specific resource within the collection

---

### 3. Express Router

`express.Router()` creates a mini-application that handles a subset of routes. In this project the posts router is mounted at `/api/posts` in app.js. The router then only deals with the *remainder* of the path (`/` and `/:id`).

```js
// app.js
app.use('/api/posts', postsRouter); // prefix: /api/posts

// posts.routes.js (the router)
router.get('/', getPosts);          // handles GET /api/posts
router.get('/:id', getPost);        // handles GET /api/posts/1
```

This keeps route files focused and prevents every route from having to repeat the full prefix.

---

### 4. Route Parameters and Query Strings

**Route parameters** (`:id`) are named wildcards in the URL path. Express captures the actual value and makes it available as `req.params.id`.

```
URL: /api/posts/42
req.params.id  →  "42"  (always a string — parseInt if you need a number)
```

**Query strings** (`?limit=2`) are key-value pairs after the `?`. Express parses them automatically into `req.query`.

```
URL: /api/posts?limit=2
req.query.limit  →  "2"  (always a string)
```

---

### 5. req and res Objects

`req` (request) contains everything Express parsed from the incoming HTTP request:

| Property        | Contains                                              |
|-----------------|-------------------------------------------------------|
| `req.body`      | Parsed request body (JSON or form data)               |
| `req.params`    | Route parameter values (`{ id: "42" }`)               |
| `req.query`     | Query string values (`{ limit: "2" }`)                |
| `req.method`    | HTTP method string (`"GET"`, `"POST"`, etc.)          |
| `req.protocol`  | `"http"` or `"https"`                                 |
| `req.originalUrl` | Full URL path + query string                        |

`res` (response) provides methods to send data back to the client:

| Method              | What it does                                        |
|---------------------|-----------------------------------------------------|
| `res.json(data)`    | Sends JSON, sets Content-Type: application/json     |
| `res.status(code)`  | Sets the HTTP status code (chainable)               |
| `res.send(text)`    | Sends a plain text or HTML response                 |

---

### 6. Centralised Error Handling

Express has a special convention for error-handling middleware: a function with **4 parameters** `(err, req, res, next)`. Express only calls it when `next(error)` is invoked.

```js
// Any controller can forward an error like this:
const error = new Error('Not found');
error.status = 404;
next(error); // → jumps to errorHandler, skipping all other middleware

// The errorHandler receives it:
const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({ msg: err.message });
};
```

This pattern keeps error formatting in one place. Adding a request ID, a timestamp, or a documentation link to every error response is a one-line change.

---

### 7. Separation of Concerns

The project deliberately splits responsibilities across files:

| File              | Single Responsibility                              |
|-------------------|----------------------------------------------------|
| `server.js`       | Start the HTTP server                              |
| `src/app.js`      | Configure middleware and mount routes              |
| `src/config/env.js` | Read and export environment variables            |
| `posts.routes.js` | Map URLs to controller functions                   |
| `posts.controller.js` | Implement request-handling logic              |
| `middleware/*.js` | Cross-cutting concerns (logging, error handling)   |

This structure means each file has one reason to change. It also allows the app to be tested without starting a server (import `app` from `src/app.js` directly).

---

### 8. Environment Variables

Environment variables allow configuration to change between environments (development, staging, production) without modifying code.

```
# .env (development only — never commit to git)
PORT=8000
```

```js
// Accessed in Node.js via process.env
const port = process.env.PORT || 8000;
```

In this project, the `--env-file=.env` flag in the `npm run dev` script loads `.env` automatically (requires Node.js v18+). In production, the hosting platform injects values directly into `process.env`.

---

### 9. ES Modules

This project uses the modern JavaScript module system (`import`/`export`) rather than CommonJS (`require`/`module.exports`). ES modules are enabled by setting `"type": "module"` in `package.json`.

```js
// ES module syntax
import express from 'express';
export const getPosts = (req, res) => { ... };
export default app;
```

One practical difference: ES modules do not provide `__filename` and `__dirname` as globals. The shim in `src/app.js` reconstructs them:

```js
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

---

### 10. Static File Serving

`express.static('public')` is middleware that checks every incoming request against the files in the `/public` directory. If a match is found, the file is sent directly — no route handler involved. A request to `/` automatically serves `index.html`.

```js
app.use(express.static(path.join(__dirname, '..', 'public')));
```

This is how the HTML frontend in this project is delivered to the browser without any explicit route for it.
