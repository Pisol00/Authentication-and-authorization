// One shared PostgreSQL connection pool for the whole app.
import pg from 'pg';
import { DATABASE_URL } from '../config/env.js';

export const pool = new pg.Pool({ connectionString: DATABASE_URL });
