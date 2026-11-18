# AuthSystem

Full-stack authentication and role-based authorization example.

- **Backend:** Express 5, TypeScript, PostgreSQL, JWT, bcrypt, zod
- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui, motion, axios

## Screenshots

<p align="center">
  <img src="docs/screenshots/login.png" width="48%" alt="Login">
  <img src="docs/screenshots/account-menu.png" width="48%" alt="Dashboard with the account menu open">
</p>
<p align="center">
  <img src="docs/screenshots/users.png" width="59%" alt="Users page (admin)">
  <img src="docs/screenshots/mobile-login.png" width="17%" alt="Login on mobile">
  <img src="docs/screenshots/mobile-users.png" width="17%" alt="Users page on mobile">
</p>

## Quick start

**Docker** (PostgreSQL + API + web app, hot reload):

```bash
docker compose up --build -d                       # web http://localhost:5173, API :4000
docker compose exec backend npm run create-admin   # first admin
```

**Local** (needs Node.js 22.12+ and PostgreSQL with a database named `authsystem`), each in its own terminal:

```bash
cd backend && cp .env.example .env && npm install && npm run dev    # API  http://localhost:4000
cd frontend && cp .env.example .env && npm install && npm run dev   # web  http://localhost:5173
cd backend && npm run create-admin                                   # first admin
```

Sign-ups always get the `user` role. `create-admin` creates an admin, or promotes an existing account.

## Environment

| Variable | Default | |
|---|---|---|
| `DATABASE_URL` | `postgres://postgres:1234@localhost:5432/authsystem` | backend |
| `JWT_SECRET` | `dev-secret-change-me` | backend, **change it** |
| `JWT_EXPIRES_IN` | `3600` | backend, seconds |
| `CLIENT_URL` | `http://localhost:5173` | backend, CORS origin |
| `NODE_ENV` | `development` | backend, `production` adds `Secure` to the cookie |
| `VITE_API_URL` | `http://localhost:4000/api` | frontend |

## API

| Method | Path | Access |
|---|---|---|
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| POST | `/api/auth/logout` | public |
| GET | `/api/auth/me` | logged in |
| GET | `/api/users` | admin |
| PATCH | `/api/users/:id/role` | admin |

Errors are `{ "message": "..." }`:

| Status | When |
|---|---|
| `400` | the body isn't valid JSON |
| `401` | not logged in, session expired, or wrong email/password |
| `403` | wrong role, or an admin changing their own role |
| `404` | no such route or user |
| `409` | email already registered |
| `422` | input fails validation (message says which field) |
| `500` | something unexpected, e.g. the database is down |

## How it works

- **Login** sets a JWT in an `HttpOnly; SameSite=Lax` cookie. JavaScript never sees the token.
- **`requireAuth()`** verifies the cookie and loads the user from the database. **`requireAuth('admin')`** also checks the role (401 not logged in → 403 wrong role).
- **Frontend** calls `/auth/me` once per page load to restore the session; a `401` from any other API logs the user out.
- **IDs** are UUIDs. Emails are unique and stored in lowercase.
- **Validation** rules live in `backend/src/validations/` and are copied in `frontend/src/lib/validation.ts`. Change both together. Controllers check their input first with `schema.safeParse(req.body)`.
- **Services return data, controllers pick the status.** A service returns the user or `undefined`; the controller turns that into a response with `respond.notFound(...)`, `respond.conflict(...)` and so on (`utils/respond.ts`, one function per status). Every controller has a `try/catch` that answers 500 for anything unexpected.

## Structure

```
backend/src/
  routes → middlewares → controllers → services → repositories → db
  scripts/create-admin.ts
frontend/src/
  pages/            Login, Register, Dashboard, Admin, Forbidden, Logout
  components/ui/    shadcn components (our code, edit freely)
  context/          AuthContext
  api/              axios client and API calls
```

## Limitations

- Logout clears the cookie but does not revoke the token; it stays valid until it expires.
- Frontend and API must be on the same site (e.g. `app.example.com` + `api.example.com`) for the cookie to work.
- No rate limiting on login and no database migrations tool.
