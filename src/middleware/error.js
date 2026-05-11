/**
 * GLOBAL ERROR HANDLER — src/middleware/error.js
 *
 * This is the application's centralised error-handling middleware.
 * It is the last resort for any error passed to next(error) anywhere in the
 * pipeline — from route handlers, controllers, or other middleware.
 *
 * HOW ERROR MIDDLEWARE DIFFERS FROM REGULAR MIDDLEWARE
 * -------------------------------------------
 * Regular middleware:  (req, res, next) => void          — 3 parameters
 * Error middleware:    (err, req, res, next) => void     — 4 parameters
 *
 * Express identifies error-handling middleware specifically by the 4-parameter
 * signature. When next(error) is called anywhere in the pipeline, Express skips
 * all regular middleware and jumps directly to the first function with 4 parameters.
 *
 * IMPORTANT: The 4-argument signature is not optional. If you remove any parameter
 * (even `next` which isn't used), Express will no longer recognise this as an error
 * handler and errors will be swallowed or produce the default HTML error page.
 *
 * WHY CENTRALISE ERROR HANDLING?
 * -------------------------------------------
 * Without a central handler, every controller would need its own try/catch block
 * and its own res.status().json() call for each possible error condition. That leads to:
 *
 *   - Duplicated formatting logic across many files
 *   - Inconsistent error response shapes (some return { error }, others { msg }…)
 *   - A single formatting change requiring updates in many places
 *
 * With this pattern, controllers only call next(error). All decisions about what
 * the client sees live here — one file, one format, one place to maintain.
 *
 * THE CUSTOM STATUS PROPERTY CONVENTION
 * -------------------------------------------
 * JavaScript's built-in Error object has a `message` property but no `status`.
 * Controllers attach a custom `.status` property to signal which HTTP code to use:
 *
 *   const error = new Error('Not Found');
 *   error.status = 404;
 *   next(error);
 *
 * If `.status` is missing (an unexpected runtime error, a bug), we assume server
 * fault and return 500 Internal Server Error — telling the client "this is our
 * problem, not yours."
 *
 * WHERE IS THIS REGISTERED?
 * -------------------------------------------
 * As the very last app.use() call in src/app.js — after all routes. It must be
 * last so it can catch errors forwarded from any handler above it.
 */

const errorHandler = (err, req, res, next) => {
  if (err.status) {
    // A known, intentional error (404 Not Found, 400 Bad Request, etc.).
    // The controller that created the error already set the correct status code.
    res.status(err.status).json({ msg: err.message });
  } else {
    // An unexpected error — likely a bug or an unhandled runtime exception.
    // 500 Internal Server Error is the appropriate code when we have no better information.
    res.status(500).json({ msg: err.message });
  }
};

export default errorHandler;
