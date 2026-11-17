# AuthSystem

A small full-stack example of **authentication** (who are you?) and **role-based authorization** (what are you allowed to do?).

- **Backend:** Node.js, Express 5, TypeScript, JWT (`jsonwebtoken`) in an **httpOnly cookie**, `bcryptjs` password hashing, **PostgreSQL** via `pg` (node-postgres), request validation with `zod`
- **Frontend:** React 19, TypeScript, Vite, axios, react-router, Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com) (Radix, `nova` preset), lucide icons

## Features

- Register (with confirm password), log in, log out
- Session kept in an httpOnly cookie, so JavaScript cannot read the token
- Two roles: `user` and `admin`, checked by the backend on every protected request
- Admin page that lists users and changes their role
- Protected routes on the frontend (redirect to `/login` or `/forbidden`)
- Show/hide toggle on password fields
- Minimal UI built on design tokens, works on mobile

## Getting started

Requires **Node.js 22.12+** (developed on Node 26) and **PostgreSQL**. The easiest way to get PostgreSQL is the `db` service from Docker Compose:

```bash
docker compose up -d db   # PostgreSQL on localhost:5432 (user postgres, password 1234, database "authsystem")
```

Or use your own PostgreSQL and set `DATABASE_URL` in `backend/.env`. Then:

```bash
# Terminal 1: API on http://localhost:4000
cd backend
cp .env.example .env   # set JWT_SECRET
npm install
npm run dev

# Terminal 2: web app on http://localhost:5173
cd frontend
cp .env.example .env
npm install
npm run dev
```

On start the backend creates the `users` table if it does not exist.

### Create an admin

Accounts created through the register page always get the `user` role, and no admin exists until you create one:

```bash
cd backend
npm run create-admin
```

The script asks for email, name and password (the password is not shown while you type). If the email already belongs to an account, that account is promoted to admin and its password is left unchanged.

Non-interactive use, for example in CI:

```bash
ADMIN_PASSWORD='a-strong-password' npm run create-admin -- --email admin@example.com --name "Admin"
```

There is no `--password` flag, so the password does not end up in your shell history. After `npm run build` the script is also compiled, so it runs without `tsx`: `node --env-file-if-exists=.env dist/scripts/create-admin.js`. With Docker, run it inside the backend container: `docker compose exec backend npm run create-admin`.

### With Docker

Starts PostgreSQL and both apps with hot reload in one command. Requires Docker with Compose v2.

```bash
docker compose up --build   # first run, or after changing package.json
docker compose up           # later runs
docker compose down         # stop (database data is kept)
docker compose down -v      # stop and delete the database
```

- Web app: http://localhost:5173, API: http://localhost:4000/api, PostgreSQL: `localhost:5432`
- The backend waits until PostgreSQL is healthy before it starts.
- Source folders are bind-mounted, so edits on your machine reload inside the containers.
- `node_modules` is installed inside each container (Linux binaries) and is not shared with your machine.
- After adding or removing a package, rebuild with fresh volumes: `docker compose up --build -V`.
- `backend/.env` is optional; defaults are used when it is missing. Inside Docker, `DATABASE_URL` points to the `db` service and overrides the value in `.env`.
- Database data is stored in the `pgdata` Docker volume.
- Stop any local `npm run dev` or local PostgreSQL first, otherwise ports 4000, 5173 or 5432 are already taken.
- If file changes are not picked up, enable polling: add `CHOKIDAR_USEPOLLING: "true"` to the service's `environment`, or set `server.watch.usePolling: true` in `vite.config.ts`.

### Environment variables

**backend/.env**

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | API port |
| `JWT_SECRET` | `dev-secret-change-me` | Secret for signing JWTs. **Change it.** |
| `JWT_EXPIRES_IN` | `3600` | Lifetime of the token and the cookie, in **seconds** |
| `DATABASE_URL` | `postgres://postgres:1234@localhost:5432/authsystem` | PostgreSQL connection string |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin (the frontend URL) |
| `NODE_ENV` | `development` | Set to `production` to add the `Secure` flag to the cookie |

**frontend/.env**

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000/api` | Base URL of the API |

### Scripts

| | Backend | Frontend |
|---|---|---|
| `npm run dev` | Start with reload (`tsx watch`) | Vite dev server |
| `npm run build` | Compile to `dist/` | Type-check and build to `dist/` |
| `npm start` / `npm run preview` | Run the compiled server | Serve the built app |
| `npm run typecheck` | `tsc --noEmit` | `tsc --noEmit` |
| `npm run create-admin` | Create an admin, or promote a user ([details](#create-an-admin)) | |

## Project structure

```
docker-compose.yml       one-command dev environment (db, backend, frontend)

backend/
  src/
    server.ts                    entry point: init database, listen
    app.ts                       Express app: CORS, JSON, cookies, /api routes, error handling
    config/env.ts                env vars and cookie options
    db/
      pool.ts                    PostgreSQL connection pool
      schema.ts                  CREATE TABLE (runs on startup)
    routes/                      URL → middlewares → controller
      index.ts                   mounts /health, /auth, /users
      auth.routes.ts
      user.routes.ts
    controllers/                 HTTP only: read req, set cookies, send res
      auth.controller.ts
      user.controller.ts
    services/                    business rules, no HTTP
      auth.service.ts            register, login, password hashing
      user.service.ts            list users, change role
    repositories/
      user.repository.ts         all user SQL, UUID check
    middlewares/
      auth.middleware.ts         authenticate(), authorize(...roles)
      validate.middleware.ts     validate({ body, params }) with zod
      error.middleware.ts        404 + central error handler
    validations/                 zod schemas for request bodies and params
    types/                       User, Role, PublicUser, req.user typing
    utils/                       HttpError, JWT sign/verify
    scripts/
      create-admin.ts            CLI: create an admin or promote a user
  Dockerfile                     development image

frontend/
  Dockerfile             development image
  vite.config.ts         @ alias, vendor chunks (react / ui / zod)
  src/
    App.tsx              routes; every page is lazy-loaded (code splitting)
    api/client.ts        axios instance (withCredentials) and 401 handling
    api/auth.ts          typed API calls
    context/AuthContext.tsx  current user, login/register/logout
    components/
      ui/                shadcn components (added by the CLI; edit freely, they are our code)
      ProtectedRoute.tsx route guard (login and roles)
      Navbar.tsx
      AuthLayout.tsx     card layout for login and register
      PasswordInput.tsx  InputGroup + show/hide eye button
      FormField.tsx      label + input + inline error (shadcn Field)
      UserAvatar.tsx, LogoMark.tsx, PageSpinner.tsx, Motion.tsx
    lib/utils.ts         cn() helper for merging class names
    lib/validation.ts    zod form schemas (same rules as the backend)
    pages/               Login, Register, Logout, Dashboard, Admin, Forbidden
    index.css            Tailwind + shadcn theme (CSS variables)
  components.json        shadcn CLI config
```

## Database

One table, created on startup by [backend/src/db/schema.ts](backend/src/db/schema.ts):

```sql
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- **IDs are always UUIDs**, generated by PostgreSQL. Route params are validated as UUIDs (`400 Invalid user id`), and the repository checks the format again before querying, so a bad id never reaches PostgreSQL.
- **Emails are stored in lowercase.** The `UNIQUE` constraint blocks duplicates, even when two sign-ups arrive at the same time; the API answers `409`.
- All SQL lives in [backend/src/repositories/user.repository.ts](backend/src/repositories/user.repository.ts). Queries use parameters (`$1`, `$2`), never string concatenation.

## API

All responses are JSON. Errors have the shape `{ "message": "..." }`.

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | public | Body `{ name, email, password }`. Creates a `user` and sets the cookie. `201 { user }` |
| POST | `/api/auth/login` | public | Body `{ email, password }`. Sets the cookie. `200 { user }` |
| POST | `/api/auth/logout` | public | Clears the cookie. `204` |
| GET | `/api/auth/me` | logged in | Returns the current user. `200 { user }` |
| GET | `/api/users` | admin | Lists all users. `200 { users }` |
| PATCH | `/api/users/:id/role` | admin | Body `{ role: "user" \| "admin" }`. Admins cannot change their own role. `200 { user }` |
| GET | `/api/health` | public | `200 { ok: true }` |

Status codes: `400` invalid input (validated with zod; the message is the first problem found), `401` not logged in or session expired, `403` wrong role, `404` user not found, `409` email already registered.

The token is never in the response body; it only travels in the `token` cookie.

### Validation rules

| Field | Rule |
|---|---|
| `name` | Required, trimmed, at most 100 characters |
| `email` | Required, trimmed, valid email format, at most 254 characters |
| `password` (register, create-admin) | 6 characters to 72 **bytes** (bcrypt ignores everything after 72 bytes; a Thai character is 3 bytes) |
| `password` (login) | Required |
| `role` | `user` or `admin` |
| `:id` in URLs | UUID |

The backend checks every request with zod ([backend/src/validations/](backend/src/validations/)). The frontend runs the same rules ([frontend/src/lib/validation.ts](frontend/src/lib/validation.ts)) before sending, and shows the message under each field. The two files are separate copies, so **change both together**. The backend check is the one that counts.

## How it works

### Request flow

The backend follows the usual Express layering. Each layer only calls the one below it:

```
request → route → middlewares → controller → service → repository → PostgreSQL
```

| Layer | Job | Example |
|---|---|---|
| route | Maps a URL to middlewares and a controller | `router.post('/login', validate({ body: loginSchema }), authController.login)` |
| middleware | Runs before the controller; can reject the request | `authenticate`, `authorize('admin')`, `validate(...)` |
| controller | Reads `req`, calls a service, sets cookies, sends `res` | `authController.login` |
| service | Business rules; throws `HttpError` | "wrong password → 401", "cannot change your own role" |
| repository | SQL only | `userRepository.findByEmail` |

Errors are thrown, not returned. `HttpError(status, message)` from any layer ends up in [error.middleware.ts](backend/src/middlewares/error.middleware.ts), which sends `{ message }` with that status. Express 5 also forwards errors from `async` handlers, so no `try/catch` is needed in controllers. Anything unexpected becomes `500`.

### Login and the cookie

1. The client sends `POST /api/auth/login` with email and password.
2. The server checks the password against the bcrypt hash.
3. The server signs a JWT with `{ sub: userId, role }`, valid for `JWT_EXPIRES_IN` seconds.
4. The server sets the JWT as a cookie:

   ```
   Set-Cookie: token=<jwt>; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600   (+ Secure in production)
   ```

   - `HttpOnly`: page JavaScript cannot read the token, so an XSS bug cannot steal it.
   - `SameSite=Lax`: the browser does not send the cookie on cross-site POST/PATCH requests, which protects against CSRF.

### Authentication and authorization

- `authenticate` ([backend/src/middlewares/auth.middleware.ts](backend/src/middlewares/auth.middleware.ts)) reads the cookie, verifies the JWT and loads the user from the database. The role is taken from the database, not from the token, so a role change applies on the next request.
- `authorize('admin')` returns `403` when the user's role is not in the allowed list.

```ts
// user.routes.ts — every /users route needs a logged-in admin
router.use(authenticate, authorize('admin'));
```

### Logout

JavaScript cannot delete an httpOnly cookie, so `POST /api/auth/logout` clears it with `res.clearCookie()`.

JWTs are stateless: the server does not keep a list of issued tokens. A token copied before logout stays valid until it expires.

### Frontend

- axios uses `withCredentials: true` ([frontend/src/api/client.ts](frontend/src/api/client.ts)), so the browser sends the cookie on every request.
- On page load, `AuthContext` ([frontend/src/context/AuthContext.tsx](frontend/src/context/AuthContext.tsx)) calls `GET /api/auth/me` once to find out whether a session exists. This is the only way, because the cookie is unreadable from JavaScript. It is not called again when moving between pages inside the app.
- Login and register pages show the form right away instead of waiting for `/auth/me`; protected pages wait for it. Spinners appear only if loading takes longer than 300 ms.
- A `401` from any non-`/auth/*` endpoint clears the session in the app, and the route guard sends the user to `/login`.
- `<ProtectedRoute roles={['admin']}>` hides pages the user cannot access. This is only for UX; the backend enforces access.

| Route | Access |
|---|---|
| `/login`, `/register` | public (logged-in users are redirected to `/dashboard`) |
| `/logout` | calls the logout API, then redirects to `/login` |
| `/dashboard` | logged in |
| `/admin` | admin; other users are redirected to `/forbidden` |

## UI and theme (shadcn/ui)

The frontend uses [shadcn/ui](https://ui.shadcn.com). The CLI copies each component's source into `frontend/src/components/ui/`; it is not a package you import from `node_modules`, so the files can be edited like any other code.

Add a component:

```bash
cd frontend
npx shadcn@latest add dialog
```

Import it with the `@/` alias (maps to `frontend/src/`):

```tsx
import { Button } from '@/components/ui/button';
```

**Theme.** Colors and radius are CSS variables in [frontend/src/index.css](frontend/src/index.css): `:root` for light, `.dark` for dark. Components use only theme utilities (`bg-primary`, `text-muted-foreground`, `border-border`), never raw palette classes (`bg-zinc-900`).

| Variable | Example utility | Used for |
|---|---|---|
| `background`, `foreground` | `bg-background`, `text-foreground` | Page and default text |
| `card`, `popover` (+ `-foreground`) | `bg-card` | Cards, dropdown menus |
| `primary`, `primary-foreground` | `bg-primary` | Primary buttons, admin badge, logo |
| `secondary`, `muted`, `accent` (+ `-foreground`) | `bg-muted`, `text-muted-foreground` | Secondary surfaces, hover, captions |
| `destructive` | `text-destructive` | Errors |
| `border`, `input`, `ring` | `border-border`, `ring-ring` | Borders, inputs, focus ring |
| `radius` | `rounded-lg` (= `--radius`) | Corner radius; the other sizes are derived from it |

Dark mode is already defined in `.dark`; adding `class="dark"` to `<html>` turns it on. There is no toggle in the UI yet.

## Limitations

This project is kept simple on purpose. Before using it in production, address the following:

- **Deployment:** the frontend and the API must be on the same site (for example `app.example.com` and `api.example.com`). On different domains the cookie becomes third-party and browsers block it.
- **CSRF:** protection relies only on `SameSite=Lax`. If you need `SameSite=None`, add a CSRF token.
- **No token revocation:** logout only clears the cookie. For immediate revocation, use short-lived access tokens with refresh tokens stored in a database.
- **Migrations:** the schema is created with `CREATE TABLE IF NOT EXISTS` on startup. Changing an existing column needs a migration tool (for example `node-pg-migrate`).
- **No rate limiting** on `/api/auth/login`.
- **Password rules:** the only check is a minimum length of 6 characters.
