// Database schema. Runs on startup; IF NOT EXISTS makes it safe to run every time.
import { pool } from './pool.js';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT        NOT NULL,
    email         TEXT        NOT NULL UNIQUE,      -- stored lowercase; UNIQUE blocks duplicates
    password_hash TEXT        NOT NULL,
    role          TEXT        NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`;

export async function initDb(): Promise<void> {
  await pool.query(SCHEMA);
}
