// Data access for the users table. The only place that contains user SQL.
import { pool } from '../db/pool.js';
import type { Role, User } from '../types/user.js';

// Columns are snake_case in SQL, camelCase in TypeScript — alias them once here.
const COLUMNS = `id, name, email, password_hash AS "passwordHash", role, created_at AS "createdAt"`;
const PG_UNIQUE_VIOLATION = '23505';

// IDs are always UUIDs. Anything else can't match a row, so skip the query instead of
// letting Postgres throw "invalid input syntax for type uuid".
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (value: string) => UUID_RE.test(value);

export class EmailTakenError extends Error {
  constructor() {
    super('Email already registered');
  }
}

interface NewUser {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

export const userRepository = {
  async findByEmail(email: string): Promise<User | undefined> {
    const { rows } = await pool.query<User>(`SELECT ${COLUMNS} FROM users WHERE email = $1`, [email.toLowerCase()]);
    return rows[0];
  },

  async findById(id: string): Promise<User | undefined> {
    if (!isUuid(id)) return undefined;
    const { rows } = await pool.query<User>(`SELECT ${COLUMNS} FROM users WHERE id = $1`, [id]);
    return rows[0];
  },

  async findAll(): Promise<User[]> {
    const { rows } = await pool.query<User>(`SELECT ${COLUMNS} FROM users ORDER BY created_at`);
    return rows;
  },

  // Throws EmailTakenError when the email exists — the UNIQUE constraint is the real guard,
  // so this is safe even when two sign-ups with the same email arrive at the same time.
  async create({ name, email, passwordHash, role }: NewUser): Promise<User> {
    try {
      const { rows } = await pool.query<User>(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
        [name, email.toLowerCase(), passwordHash, role],
      );
      return rows[0]!;
    } catch (err) {
      if ((err as { code?: string }).code === PG_UNIQUE_VIOLATION) throw new EmailTakenError();
      throw err;
    }
  },

  async updateRole(id: string, role: Role): Promise<User | undefined> {
    if (!isUuid(id)) return undefined;
    const { rows } = await pool.query<User>(`UPDATE users SET role = $2 WHERE id = $1 RETURNING ${COLUMNS}`, [id, role]);
    return rows[0];
  },
};
