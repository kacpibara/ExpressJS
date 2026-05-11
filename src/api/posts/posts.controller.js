/**
 * POSTS CONTROLLER — src/api/posts/posts.controller.js
 *
 * A controller's job is to handle one HTTP request and produce one HTTP response.
 * It sits between the router (which decides *which* function runs) and the data
 * layer (which stores and retrieves data).
 *
 * HANDLER SIGNATURE
 * -------------------------------------------
 * Every exported function follows Express's standard handler signature:
 *
 *   (req, res, next) => void
 *
 *   req  — the incoming HTTP Request object. Contains everything Express parsed
 *          from the raw HTTP request: URL, headers, body, route params, query string…
 *
 *   res  — the outgoing HTTP Response object. Provides methods for sending data
 *          back to the client (res.json, res.status, res.send…).
 *
 *   next — a function. Calling next() passes control to the next middleware in
 *          the pipeline. Calling next(error) skips all regular middleware and
 *          jumps straight to the error handler.
 *
 * DATA STORAGE — why in-memory?
 * -------------------------------------------
 * Posts are stored in a plain JavaScript array. This is intentional for learning:
 * it keeps the focus on Express concepts without the complexity of a database.
 * The trade-off is that all data resets whenever the server restarts.
 *
 * In a production application, this array would be replaced by database calls —
 * for example, Mongoose for MongoDB or Prisma for PostgreSQL.
 *
 * ERROR HANDLING PATTERN
 * -------------------------------------------
 * When something goes wrong (post not found, missing field), controllers do NOT
 * send an error response directly. Instead they:
 *
 *   1. Create a standard JavaScript Error object
 *   2. Attach a custom `.status` property with the appropriate HTTP code
 *   3. Call next(error) to hand it off to the central errorHandler middleware
 *
 * This keeps all error formatting in one place (middleware/error.js) and ensures
 * a consistent response shape across the entire API.
 */

// `let` is used (not `const`) because deletePost reassigns the variable to a
// new filtered array. With `const` that reassignment would throw a TypeError.
let posts = [
  { id: 1, title: 'Post One' },
  { id: 2, title: 'Post Two' },
  { id: 3, title: 'Post Three' },
];

// ─── GET /api/posts ───────────────────────────────────────────────────────────
// Returns the full list of posts, or a limited slice if ?limit=N is provided.
//
// QUERY PARAMETERS:
//   The URL /api/posts?limit=2 contains a "query string" after the ?.
//   Express parses it automatically and exposes it as req.query (an object).
//   req.query.limit would be the string "2" — always a string, hence parseInt.
//
// GUARD CONDITIONS:
//   parseInt("abc") → NaN
//   parseInt("-5")  → -5
//   Both produce nonsensical results with .slice(), so we validate before using.
export const getPosts = (req, res, next) => {
  const limit = parseInt(req.query.limit);

  if (!isNaN(limit) && limit > 0) {
    // Array.slice(0, n) returns a new array with the first n elements.
    return res.status(200).json(posts.slice(0, limit));
  }

  res.status(200).json(posts);
};

// ─── GET /api/posts/:id ───────────────────────────────────────────────────────
// Returns a single post matched by its ID.
//
// ROUTE PARAMETERS:
//   The router defines "/:id". Express captures the actual value from the URL
//   (e.g. "42" in /api/posts/42) and exposes it as req.params.id — always a string.
//   We parseInt it so strict equality (===) works against our numeric IDs.
//
// Array.find() returns the first element satisfying the callback, or undefined if
// nothing matches — our 404 case.
export const getPost = (req, res, next) => {
  const id = parseInt(req.params.id);
  const post = posts.find((post) => post.id === id);

  if (!post) {
    const error = new Error(`A post with the id of ${id} was not found`);
    error.status = 404; // HTTP 404 Not Found
    return next(error); // Jump to errorHandler in middleware/error.js
  }

  res.status(200).json(post);
};

// ─── POST /api/posts ──────────────────────────────────────────────────────────
// Creates a new post from data sent in the request body.
//
// REQUEST BODY:
//   The client sends a JSON payload: { "title": "My New Post" }
//   express.json() middleware (registered in app.js) parses that payload and
//   attaches the resulting object to req.body before this function runs.
//
// ID GENERATION:
//   posts.length + 1 is a simple auto-increment strategy. It works fine for
//   in-memory data but would be unreliable in a real database (gaps after deletes,
//   race conditions under concurrent requests). Real databases handle ID generation
//   automatically (AUTO_INCREMENT, serial, ObjectId, UUID, etc.).
//
// HTTP 201 Created:
//   Using 201 instead of 200 signals that a new resource was created — an important
//   distinction for API clients and automated tooling that inspect status codes.
export const createPost = (req, res, next) => {
  const newPost = {
    id: posts.length + 1,
    title: req.body.title,
  };

  if (!newPost.title) {
    const error = new Error(`Please include a title`);
    error.status = 400; // HTTP 400 Bad Request — the client sent invalid or incomplete data
    return next(error);
  }

  posts.push(newPost);
  res.status(201).json(posts);
};

// ─── PUT /api/posts/:id ───────────────────────────────────────────────────────
// Updates the title of an existing post identified by its ID.
//
// PUT vs PATCH:
//   By REST convention, PUT replaces the *entire* resource representation.
//   PATCH applies a partial update (only the fields provided).
//   Because posts only have one editable field (title), the practical difference
//   is minimal here — but on a richer resource, use PATCH to avoid accidentally
//   blanking out fields you didn't intend to touch.
//
// WHY Array.find() and direct mutation?
//   find() returns a reference to the actual object inside the array.
//   Mutating post.title directly updates the array in-place — no extra lookup or
//   splice needed. This works because objects in JavaScript are passed by reference.
export const updatePost = (req, res, next) => {
  const id = parseInt(req.params.id);
  const post = posts.find((post) => post.id === id);

  if (!post) {
    const error = new Error(`A post with the id of ${id} was not found`);
    error.status = 404;
    return next(error);
  }

  post.title = req.body.title;
  res.status(200).json(posts);
};

// ─── DELETE /api/posts/:id ────────────────────────────────────────────────────
// Removes a post from the in-memory array by its ID.
//
// WHY Array.filter() instead of splice()?
//   filter() creates a brand-new array containing every element that passes the
//   test (every post whose id is NOT the one being deleted). It is a non-destructive,
//   functional approach — the original array is never mutated.
//
//   splice() would mutate the array in-place. While both approaches work here,
//   filter() is safer when the same array might be referenced from multiple places,
//   and it reads more clearly as "keep everything except this id".
//
//   The trade-off: we must use `let posts` at the top (not `const`) because
//   filter() returns a new array and we reassign the variable.
export const deletePost = (req, res, next) => {
  const id = parseInt(req.params.id);
  const post = posts.find((post) => post.id === id);

  if (!post) {
    const error = new Error(`A post with the id of ${id} was not found`);
    error.status = 404;
    return next(error);
  }

  posts = posts.filter((post) => post.id !== id);
  res.status(200).json(posts);
};
