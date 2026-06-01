import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './middleware/logger.js';
import errorHandler from './middleware/error.js';
import notFound from './middleware/notFound.js';
import postsRouter from './api/posts/posts.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(logger);

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/posts', postsRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
