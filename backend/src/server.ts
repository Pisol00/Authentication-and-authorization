// Entry point: make sure the table exists, then start listening.
// Admins are created with `npm run create-admin` (see src/scripts/create-admin.ts).
import { app } from './app.js';
import { PORT } from './config/env.js';
import { initDb } from './db/schema.js';

await initDb();
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
