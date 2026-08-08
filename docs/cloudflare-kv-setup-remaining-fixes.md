# Cloudflare KV Setup & Remaining Fixes

## Status

These items were NOT yet applied to the codebase and need to be done when you're ready.

---

## Step 1 — Create Cloudflare KV Namespace

1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **KV**
2. Click **Create namespace** → name it `TRACKER_DB`
3. Copy the **Namespace ID** shown after creation

---

## Step 2 — Update `wrangler.toml`

Replace the current `wrangler.toml` with this (swap in your real KV namespace ID):

```toml
name = "tracker-app"
compatibility_date = "2026-08-05"

[assets]
directory = "./dist"
not_found_handling = "single-page-application"

[[kv_namespaces]]
binding = "TRACKER_DB"
id = "PASTE_YOUR_KV_NAMESPACE_ID_HERE"
```

---

## Step 3 — Add Binding in Cloudflare Dashboard

1. Go to **Pages** → your project → **Settings** → **Functions**
2. Under **KV namespace bindings** → **Add binding**
3. Variable name: `TRACKER_DB`
4. Select the namespace you just created

---

## Step 4 — Fix `functions/api/sync.ts` (Body Mismatch Bug)

**The bug:** `sync.ts` expects `{ accountId, payload: {...} }` but `storageService.ts` sends data flat:
`{ accountId, expenses, reminders, trips, targets, goals, cycleHistory }` with no `payload` wrapper.

**Fix — replace `functions/api/sync.ts` with this:**

```ts
/**
 * Cloudflare Pages Function: /api/sync
 * GET  /api/sync?accountId=usr_... → fetch full account backup
 * POST /api/sync → save account data to KV (flat body, no payload wrapper)
 */

export async function onRequest(context: { request: Request; env: any }) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);

    if (request.method === 'GET') {
      const accountId = url.searchParams.get('accountId') || '';
      if (!accountId) {
        return new Response(JSON.stringify({ error: 'accountId required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (env?.TRACKER_DB) {
        const dataRaw = await env.TRACKER_DB.get(`sync:${accountId}`);
        if (dataRaw) {
          return new Response(dataRaw, {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      // No data found yet — return empty structure
      return new Response(
        JSON.stringify({ expenses: [], reminders: [], trips: [], targets: null, goals: null, cycleHistory: [] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (request.method === 'POST') {
      const body: any = await request.json();
      const accountId = body.accountId;

      if (!accountId) {
        return new Response(JSON.stringify({ error: 'accountId required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Accept flat body (expenses, reminders, trips, etc.) — no payload wrapper needed
      const dataToStore = {
        expenses: body.expenses || [],
        reminders: body.reminders || [],
        trips: body.trips || [],
        targets: body.targets || null,
        goals: body.goals || null,
        cycleHistory: body.cycleHistory || [],
        updatedAt: Date.now(),
      };

      if (env?.TRACKER_DB) {
        await env.TRACKER_DB.put(`sync:${accountId}`, JSON.stringify(dataToStore));
      }

      return new Response(
        JSON.stringify({ success: true, timestamp: dataToStore.updatedAt }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Sync error: ' + e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

---

## Step 5 — Security Note: Plain Text Passwords

`functions/api/auth/register.ts` stores passwords in plain text in KV.
For production, hash the password before storing. Use a Web Crypto API approach since Cloudflare Workers don't have Node.js `crypto`:

```ts
// Hash password in Cloudflare Worker (Web Crypto API)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'PITRACK_PEPPER_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// On register:
const passwordHash = await hashPassword(password);
const userRecord = { accountId, email: cleanEmail, passwordHash, name };

// On login:
const inputHash = await hashPassword(inputPassword);
if (userRecord.passwordHash !== inputHash) { /* wrong password */ }
```

---

## Checklist

- [ ] Create KV namespace `TRACKER_DB` in Cloudflare Dashboard
- [ ] Update `wrangler.toml` with KV binding and real namespace ID
- [ ] Add KV binding in Pages → Settings → Functions
- [ ] Fix `functions/api/sync.ts` body mismatch (Step 4 above)
- [ ] (Optional) Hash passwords in register.ts / login.ts (Step 5)
- [ ] Run `npm run build` and push to GitHub → Cloudflare auto-deploys
