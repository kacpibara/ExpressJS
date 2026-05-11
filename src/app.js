/**
 * EXPRESS APPLICATION FACTORY — src/app.js
 *
 * This file creates and configures the Express application instance.
 * It is intentionally separate from server.js (which starts the HTTP server)
 * so the configured `app` can be imported by tests without binding a real port.
 *
 * THE EXPRESS REQUEST PIPELINE
 * -------------------------------------------
 * When a request arrives, Express passes it through a chain of middleware
 * functions in the exact order they are registered with app.use(). Each function:
 *
 *   - Receives the request (req) and response (res) objects
 *   - Can read or modify either object
 *   - Must either SEND a response (ending the cycle) or call next() to continue
 *
 * Visualising the pipeline for a POST /api/posts request:
 *
 *   Incoming request
 *       │
 *       ▼
 *   express.json()         ← parse the JSON body into req.body
 *       │
 *       ▼
 *   express.urlencoded()   ← parse form-encoded bodies (not used here, but registered)
 *       │
 *       ▼
 *   logger                 ← print the request to the terminal
 *       │
 *       ▼
 *   express.static()       ← if the URL matches a file in /public, serve it and stop
 *       │  (no match — continues)
 *       ▼
 *   postsRouter            ← matched /api/posts → hands off to posts.routes.js
 *       │
 *       ▼
 *   notFound               ← only reached if no route matched (produces a 404 error)
 *       │
 *       ▼
 *   errorHandler           ← formats and sends all errors as JSON responses
 *       │
 *       ▼
 *   Response sent to client
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './middleware/logger.js';
import errorHandler from './middleware/error.js';
import notFound from './middleware/notFound.js';
import postsRouter from './api/posts/posts.routes.js';

// ─── ES Module path shim ─────────────────────────────────────────────────────
// Node's older CommonJS module system provides __filename and __dirname as
// built-in globals. ES modules (the modern "import/export" syntax) do not.
// These two lines reconstruct equivalent values from the module's own URL so we
// can build an absolute filesystem path to the /public directory below.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Body-parsing middleware ──────────────────────────────────────────────────
// HTTP requests carry their payload as a raw byte stream. These middleware
// functions decode that stream and attach a ready-to-use JavaScript object
// to req.body so controllers can access request data directly.
//
//   express.json()
//     Handles requests with Content-Type: application/json.
//     Example: a fetch() call sending JSON.stringify({ title: "New Post" }).
//
//   express.urlencoded({ extended: false })
//     Handles HTML form submissions (Content-Type: application/x-www-form-urlencoded).
//     `extended: false` uses Node's built-in querystring parser — sufficient for
//     simple flat data (no nested objects).
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Request logger ───────────────────────────────────────────────────────────
// Registered early so every request — including 404s and errors — is logged to
// the terminal before anything else runs. See src/middleware/logger.js.
app.use(logger);

// ─── Static file serving ──────────────────────────────────────────────────────
// express.static serves files from the /public directory exactly as they are on
// disk, without passing through any route handler. A request for "/" automatically
// serves /public/index.html.
//
// path.join(__dirname, '..', 'public') resolves to the project root's /public
// folder. The '..' is needed because __dirname here is the src/ directory —
// one level below the root where /public lives.
app.use(express.static(path.join(__dirname, '..', 'public')));

// ─── API routes ───────────────────────────────────────────────────────────────
// Mounts the posts router under the /api/posts path prefix.
// Any request whose URL begins with /api/posts is forwarded to postsRouter.
// The prefix is stripped before the router receives the request, so the router
// only sees the remaining path: /api/posts/3 arrives at the router as just /3.
app.use('/api/posts', postsRouter);

// ─── Fallback error handlers (must be registered last) ───────────────────────
// notFound catches every request that didn't match any route above and creates
// a 404 error object, passing it to the next handler.
//
// errorHandler is Express's 4-argument error-handling middleware — it only runs
// when next(error) has been called somewhere in the pipeline.
//
// ORDER IS CRITICAL: both must come after all routes. If registered before a route,
// they would intercept legitimate requests before the route gets a chance to handle them.
app.use(notFound);
app.use(errorHandler);

export default app;
