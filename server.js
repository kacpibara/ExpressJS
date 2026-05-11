/**
 * ENTRY POINT — server.js
 *
 * This is the first file Node.js runs (set in package.json's "start" script).
 * Its only responsibility is to start the HTTP server by telling Express to
 * begin listening for incoming connections on a specific port.
 *
 * WHY is it separated from src/app.js?
 * -------------------------------------------
 * Keeping server startup here and Express configuration in src/app.js is a
 * deliberate separation of concerns:
 *
 *  1. TESTABILITY — Test files can import `app` directly without accidentally
 *     binding a real network port. If both were merged into one file, every
 *     test that imported the app would also start a live server, causing
 *     port conflicts and a slower test suite.
 *
 *  2. CLARITY — The entry point becomes a single meaningful statement:
 *     "start the configured app on this port." All the interesting setup
 *     lives in its own dedicated file.
 *
 * HOW app.listen() works:
 * -------------------------------------------
 * `app` is a configured Express application (from src/app.js). It already
 * knows about all middleware and routes. Calling `app.listen(PORT, callback)`
 * wraps it in Node's built-in HTTP server and begins accepting connections.
 * The callback fires once the server is ready.
 *
 * WHERE PORT comes from:
 * -------------------------------------------
 * PORT is exported from src/config/env.js, which reads `process.env.PORT`.
 * In development the .env file supplies it via the --env-file flag (see the
 * "dev" script in package.json). In production the hosting environment injects
 * it directly — no .env file is needed or committed to version control.
 */

import app from './src/app.js';
import { PORT } from './src/config/env.js';

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
