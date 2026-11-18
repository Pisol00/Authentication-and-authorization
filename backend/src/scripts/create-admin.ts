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

// A problem with the user's input: printed as "Error: <message>" (no stack trace).
class CliError extends Error {}

function readFlags(): { email?: string; name?: string; help?: boolean } {
  try {
    const { values } = parseArgs({
      options: {
        email: { type: 'string' },
        name: { type: 'string' },
        help: { type: 'boolean', short: 'h' },
      },
    });
    return values;
  } catch (parseError) {
    throw new CliError(`${(parseError as Error).message}\n\n${USAGE}`); // e.g. an unknown flag
  }
}

// Reads a line without echoing it (for passwords). Needs a real terminal.
// Resolves undefined when the user presses Ctrl+C.
function askHidden(question: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let value = '';
    const done = (result: string | undefined) => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.off('data', onData);
      stdout.write('\n');
      resolve(result);
    };
    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n') return done(value);
        if (ch === '\u0003') return done(undefined); // Ctrl+C
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
  if (!hidden) return ask(`${label}: `);
  const answer = await askHidden(`${label}: `);
  if (answer === undefined) throw new CliError('Cancelled');
  return answer;
}

// Returns the message to print on success.
async function main(): Promise<string> {
  const flags = readFlags();
  if (flags.help) return USAGE;

  // 1. Email first: it decides whether we create or promote. Validate before touching the DB.
  const email = await valueOrAsk(flags.email, 'Email');
  const emailCheck = registerSchema.shape.email.safeParse(email);
  if (!emailCheck.success) throw new CliError(emailCheck.error.issues[0]!.message);

  await initDb(); // the table may not exist yet if the API has never been started

  // 2. Existing account → promote (password is left unchanged).
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    if (existing.role === 'admin') return `${existing.email} is already an admin. Nothing to do.`;
    await userRepository.updateRole(existing.id, 'admin');
    return `Promoted ${existing.email} (${existing.name}) to admin.`;
  }

  // 3. New account → name + password, validated with the same rules as public sign-up.
  const name = await valueOrAsk(flags.name, 'Name');
  let password = process.env.ADMIN_PASSWORD;
  if (password === undefined) {
    password = await valueOrAsk(undefined, 'Password (min 6 characters)', true);
    const confirm = await valueOrAsk(undefined, 'Confirm password', true);
    if (password !== confirm) throw new CliError('Passwords do not match');
  }
  const input = registerSchema.safeParse({ name, email, password });
  if (!input.success) throw new CliError(input.error.issues[0]!.message);

  const created = await userRepository.create({
    name: input.data.name,
    email: input.data.email,
    passwordHash: await hashPassword(input.data.password),
    role: 'admin',
  });
  // Someone registered this email while we were asking for the password.
  if (!created) throw new CliError('Email already registered. Run the command again to promote it.');
  return `Created admin ${created.email} (${created.name}).`;
}

try {
  console.log(await main());
} catch (error) {
  process.exitCode = 1;
  // Input problems get a short message; anything else (e.g. database down) gets the full error.
  console.error(error instanceof CliError ? `Error: ${error.message}` : error);
} finally {
  await pool.end(); // let the process exit
}
