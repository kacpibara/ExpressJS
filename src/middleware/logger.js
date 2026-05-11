/**
 * REQUEST LOGGER MIDDLEWARE — src/middleware/logger.js
 *
 * Prints a colour-coded line to the terminal for every incoming HTTP request:
 *
 *   GET    → green
 *   POST   → blue
 *   PUT    → yellow
 *   DELETE → red
 *
 * Example output:
 *   GET http://localhost:8000/api/posts?limit=2
 *
 * WHAT IS MIDDLEWARE?
 * -------------------------------------------
 * In Express, middleware is any function with this exact signature:
 *
 *   (req, res, next) => void
 *
 * When Express receives a request it runs all registered middleware functions
 * in the order they were added with app.use(). Each function must either:
 *
 *   a) Send a response — ending the request-response cycle, OR
 *   b) Call next() — passing control to the following middleware
 *
 * A middleware that does neither will leave the request hanging indefinitely —
 * the client will wait for a response that never arrives.
 *
 * Middleware can:
 *   - Execute any code
 *   - Read or modify req and res
 *   - End the cycle by sending a response
 *   - Call next() to continue the pipeline
 *   - Call next(error) to skip to the error handler
 *
 * WHY is logging a separate middleware function?
 * -------------------------------------------
 * Logging is a "cross-cutting concern" — it applies to every request regardless
 * of which route is matched. Extracting it into its own file keeps app.js clean,
 * makes the logger independently testable, and makes it trivial to enable or
 * disable by simply adding or removing one app.use(logger) line.
 *
 * REAL-WORLD ALTERNATIVE:
 * -------------------------------------------
 * Production apps typically use the `morgan` npm package, which provides
 * configurable, production-grade HTTP logging out of the box. Building our own
 * here is an excellent way to understand how middleware works internally.
 */

import colors from 'colors';

const logger = (req, res, next) => {
  const methodColors = {
    GET: 'green',
    POST: 'blue',
    PUT: 'yellow',
    DELETE: 'red',
  };

  // Look up the colour name for this HTTP method.
  // Falls back to 'white' for less common methods (OPTIONS, HEAD, PATCH…).
  const color = methodColors[req.method] || 'white';

  // The `colors` package extends String.prototype, so you can apply a colour
  // by accessing the string with the colour name as a bracket-notation property:
  //   "some text"['green']  →  returns the same string wrapped in ANSI colour codes
  //
  // req.protocol    → "http" or "https"
  // req.get('host') → "localhost:8000"  (reads the Host header)
  // req.originalUrl → full path + query string, e.g. "/api/posts?limit=2"
  console.log(
    `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`[
      color
    ]
  );

  // Always call next() so the request continues through the rest of the pipeline.
  // This logger only observes the request — it never sends a response itself.
  next();
};

export default logger;
