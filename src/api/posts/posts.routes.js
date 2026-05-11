/**
 * POSTS ROUTER — src/api/posts/posts.routes.js
 *
 * This file declares the URL structure of the Posts API resource.
 * It maps each HTTP method + path combination to the controller function
 * responsible for handling it.
 *
 * WHY use express.Router() instead of defining routes directly on app?
 * -------------------------------------------
 * express.Router() creates a self-contained "mini-application" with its own
 * middleware stack and route table. This provides several benefits:
 *
 *  1. MODULARITY — Each API resource (posts, users, comments…) gets its own
 *     router file. The main app.js has a single clean import per resource.
 *
 *  2. PREFIX INHERITANCE — The router is mounted at "/api/posts" in app.js,
 *     so every route defined here is automatically prefixed. We write "/" and
 *     "/:id" instead of "/api/posts" and "/api/posts/:id" everywhere.
 *
 *  3. SEPARATION OF CONCERNS — This file answers only one question:
 *     "Which function handles which URL?" The actual logic lives in the controller.
 *
 * REST CONVENTIONS — mapping HTTP methods to CRUD operations:
 * -------------------------------------------
 *  REST (Representational State Transfer) is an architectural style for APIs.
 *  It uses standard HTTP methods to express intent:
 *
 *   HTTP Method   Path    What it means         Controller function
 *   ───────────   ──────  ──────────────────    ───────────────────
 *   GET           /       Retrieve all posts    getPosts
 *   GET           /:id    Retrieve one post     getPost
 *   POST          /       Create a new post     createPost
 *   PUT           /:id    Replace/update post   updatePost
 *   DELETE        /:id    Remove a post         deletePost
 *
 * WHAT is /:id?
 * -------------------------------------------
 * The colon prefix marks a route parameter — a named wildcard that matches any
 * value in that URL segment. For a request to /api/posts/42, Express captures
 * "42" and makes it available inside the controller as req.params.id.
 */

import express from 'express';
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} from './posts.controller.js';

const router = express.Router();

// GET /api/posts          → return all posts (supports ?limit= query parameter)
router.get('/', getPosts);

// GET /api/posts/:id      → return a single post by its numeric ID
router.get('/:id', getPost);

// POST /api/posts         → create a new post (expects JSON body: { title })
router.post('/', createPost);

// PUT /api/posts/:id      → update the title of an existing post
router.put('/:id', updatePost);

// DELETE /api/posts/:id   → permanently remove a post
router.delete('/:id', deletePost);

export default router;
