// CLI: create an admin account, or promote an existing user to admin.
//
//   npm run create-admin                                   # asks for everything
//   npm run create-admin -- --email you@example.com --name "Your Name"
//   ADMIN_PASSWORD=... npm run create-admin -- --email ... --name ...   # non-interactive
//
// There is no --password flag on purpose: it would end up in your shell history.
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { pool } from '../db/pool.js';
import { initDb } from '../db/schema.js';
import { userRepository } from '../repositories/user.repository.js';
import { hashPassword } from '../services/auth.service.js';
import { registerSchema } from '../validations/auth.validation.js';

const USAGE = `Usage: npm run create-admin -- [--email <email>] [--name <name>]

Creates an admin account. If the email already belongs to a user, that user is promoted to admin.
Missing values are asked for interactively. The password is read from ADMIN_PASSWORD, or asked for.`;

class CliError extends Error {}

// Reads a line without echoing it (for passwords). Needs a real terminal.
function askHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let value = '';
    const done = (fn: () => void) => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.off('data', onData);
      stdout.write('\n');
      fn();
    };
    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n') return done(() => resolve(value));
        if (ch === '\u0003') return done(() => reject(new CliError('Cancelled'))); // Ctrl+C
        if (ch === '\u007f' || ch === '\b') value = value.slice(0, -1); // Backspace
        else value += ch;
      }
    };
    stdin.on('data', onData);
  });
}

async function ask(question: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close(); // close before askHidden takes over stdin
  }
}

// Use the flag/env value if given; otherwise ask (only possible in a terminal).
async function valueOrAsk(value: string | undefined, label: string, hidden = false): Promise<string> {
  if (value !== undefined) return value;
  if (!stdin.isTTY) throw new CliError(`Missing ${label}. Pass it as a flag/env var when not running in a terminal.\n\n${USAGE}`);
  return hidden ? askHidden(`${label}: `) : ask(`${label}: `);
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      email: { type: 'string' },
      name: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help) {
    console.log(USAGE);
    return;
  }

  // 1. Email first: it decides whether we create or promote. Validate before touching the DB.
  const email = await valueOrAsk(values.email, 'Email');
  const emailCheck = registerSchema.shape.email.safeParse(email);
  if (!emailCheck.success) throw new CliError(emailCheck.error.issues[0]!.message);

  await initDb(); // the table may not exist yet if the API has never been started

  // 2. Existing account → promote (password is left unchanged).
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    if (existing.role === 'admin') {
      console.log(`${existing.email} is already an admin. Nothing to do.`);
      return;
    }
    await userRepository.updateRole(existing.id, 'admin');
    console.log(`Promoted ${existing.email} (${existing.name}) to admin.`);
    return;
  }

  // 3. New account → name + password, validated with the same rules as public sign-up.
  const name = await valueOrAsk(values.name, 'Name');
  let password = process.env.ADMIN_PASSWORD;
  if (password === undefined) {
    password = await valueOrAsk(undefined, 'Password (min 6 characters)', true);
    const confirm = await valueOrAsk(undefined, 'Confirm password', true);
    if (password !== confirm) throw new CliError('Passwords do not match');
  }
  const input = registerSchema.safeParse({ name, email, password });
  if (!input.success) throw new CliError(input.error.issues[0]!.message);

  const user = await userRepository.create({
    name: input.data.name,
    email: input.data.email,
    passwordHash: await hashPassword(input.data.password),
    role: 'admin',
  });
  console.log(`Created admin ${user.email} (${user.name}).`);
}

try {
  await main();
} catch (err) {
  process.exitCode = 1;
  console.error(err instanceof CliError || (err as { code?: string }).code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION'
    ? `Error: ${(err as Error).message}`
    : err);
} finally {
  await pool.end(); // let the process exit
}
