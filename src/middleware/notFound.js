/**
 * 404 NOT FOUND HANDLER — src/middleware/notFound.js
 *
 * This middleware acts as a catch-all for requests that didn't match any route.
 * It is registered in app.js *after* all route definitions, so Express only
 * reaches this function when nothing earlier in the pipeline handled the request.
 *
 * HOW DOES EXPRESS KNOW THIS IS A 404?
 * -------------------------------------------
 * Express doesn't automatically send a 404 for unmatched routes. Instead, it
 * just continues down the middleware chain. By placing this function at the end
 * of the chain (but before the error handler), we intercept any request that
 * "fell through" without a response — which by definition means it wasn't found.
 *
 * WHY NOT RESPOND DIRECTLY?
 * -------------------------------------------
 * We could simply write:
 *   res.status(404).json({ msg: 'Not Found' })
 *
 * But instead we create an Error object, attach a `.status`, and call next(error).
 * This routes the 404 through the same central errorHandler as all other errors,
 * ensuring the response format is always consistent:
 *   { msg: "..." }
 *
 * It also means if we ever change how errors look (add a code, a docs link, etc.)
 * we only update errorHandler — not every place that can produce a 404.
 *
 * MIDDLEWARE ORDER IN app.js:
 * -------------------------------------------
 *   app.use('/api/posts', postsRouter);  ← all real routes are registered first
 *   app.use(notFound);                   ← catches anything that wasn't matched above
 *   app.use(errorHandler);               ← receives and formats the error notFound created
 */

const notFound = (req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error); // Passes the 404 error object to errorHandler
};

export default notFound;
