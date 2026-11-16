// Builds the Express app (no network, no database) — keeps it easy to test.
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { CLIENT_URL } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';

export const app = express();

app.use(cors({ origin: CLIENT_URL, credentials: true })); // credentials: allow the auth cookie cross-origin
app.use(express.json());
app.use(cookieParser());

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);
