# DashRx deployment & login troubleshooting

## Why login works on one device but not another

| Where you open the app | Where accounts live | What you need |
|------------------------|---------------------|---------------|
| **Your PC** (`npm run dev` + `npm run server`) | SQLite file on your PC (`server/database.sqlite`) | Both commands running |
| **Vercel URL** (production) | PostgreSQL in the cloud | `POSTGRES_URL` set in Vercel |

Accounts created locally are **not** on Vercel until you sign up again on the live site (or migrate data).

---

## Fix “database connection” error on Vercel

1. Open [Vercel Dashboard](https://vercel.com) → your DashRx project → **Settings** → **Environment Variables**.
2. Add these Supabase variables (from Supabase → Settings → Database):
   - **`POSTGRES_URL`** — pooled, port **6543**, `?pgbouncer=true`
   - **`POSTGRES_URL_NON_POOLING`** — direct, host **`db.xxx.supabase.co`**, port **5432**
3. Enable them for **Production** (and Preview if you use preview URLs).

   **Minimum required on Vercel:**

   | Variable | Which string in Supabase |
   |----------|--------------------------|
   | `POSTGRES_URL` | **Transaction pooler**, port **6543**, includes `pgbouncer=true` |
   | `POSTGRES_URL_NON_POOLING` | **Direct**, host `db….supabase.co`, port **5432** |

   Do **not** rely on `POSTGRES_HOST` + `POSTGRES_USER` alone — the pooler username must be `postgres.[project-ref]`.

4. **Redeploy** the project (Deployments → … → Redeploy).

Check the API:

```text
https://YOUR-APP.vercel.app/api/health
```

- `"database": "connected"` → OK  
- `"database": "not_configured"` → add `POSTGRES_URL`  
- `"database": "unreachable"` → wrong URL, firewall, or DB paused  

5. **Sign up again** on the live site (production DB is separate from local SQLite).

---

## Local dev from another device on the same Wi‑Fi

1. On the dev machine:
   ```bash
   npm run server
   npm run dev
   ```
2. Note the **Network** URL Vite prints (e.g. `http://192.168.1.10:5173`).
3. On the other device, open that URL (not `localhost`).
4. Do **not** set `VITE_API_URL` to `localhost` — the proxy must stay on the dev machine.

---

## Commands

| Command | Purpose |
|---------|---------|
| `npm run server` | SQLite API on port 5000 (local dev) |
| `npm run dev` | Frontend with `/api` proxy |
| `npm run server:postgres` | Postgres API locally (needs `.env.local` with `POSTGRES_URL`) |
