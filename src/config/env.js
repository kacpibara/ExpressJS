/**
 * ENVIRONMENT CONFIGURATION — src/config/env.js
 *
 * This file is the single source of truth for all environment-derived settings.
 * Rather than reading `process.env.SOMETHING` scattered across many files, we
 * centralise that logic here and export named constants.
 *
 * WHY centralise environment variables?
 * -------------------------------------------
 *  1. DISCOVERABILITY — Any developer can open this one file and immediately see
 *     every environment variable the application depends on. No need to grep
 *     the entire codebase for process.env calls.
 *
 *  2. DEFAULT VALUES — The `|| 8000` fallback means the app still runs without
 *     a .env file, which is useful in CI pipelines or when teammates clone the
 *     repo for the first time.
 *
 *  3. VALIDATION POINT — If a variable is required with no sensible default, you
 *     can throw an error here so the app fails loudly at startup rather than
 *     producing a cryptic error deep in the application later:
 *
 *       if (!process.env.DB_URL) {
 *         throw new Error('DB_URL environment variable is not set');
 *       }
 *
 * WHAT is process.env?
 * -------------------------------------------
 * Node.js exposes the host machine's environment variables as properties of the
 * global `process.env` object. Values are always strings (or undefined), which
 * is why numeric settings often need `parseInt()` or a numeric fallback like `|| 8000`.
 *
 * HOW values get into process.env:
 * -------------------------------------------
 *  - Development: the --env-file=.env flag in package.json's "dev" script loads
 *    the .env file into process.env before the app starts.
 *  - Production: the hosting platform (e.g. Heroku, Railway, Render) injects
 *    environment variables directly — no .env file is used or needed.
 */

export const PORT = process.env.PORT || 8000;
