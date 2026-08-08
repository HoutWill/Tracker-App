/**
 * Cloudflare Worker Entrypoint: _worker.js
 * Handles /api/auth/register, /api/auth/login, and /api/sync with TRACKER_DB KV.
 * Serves static assets via env.ASSETS for all other routes.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-guest-id',
  'Content-Type': 'application/json',
};

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'PITRACK_PEPPER_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1. Handle CORS Preflight OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders, status: 204 });
    }

    // 2. Handle /api/auth/register
    if (pathname === '/api/auth/register') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
      }
      try {
        const body = await request.json();
        const cleanEmail = (body.email || '').trim().toLowerCase();
        const password = body.password || '';
        const name = (body.name || '').trim() || cleanEmail.split('@')[0];

        if (!cleanEmail || !password) {
          return new Response(JSON.stringify({ error: 'Email and password are required' }), { status: 400, headers: corsHeaders });
        }

        const pkid = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
        const passwordHash = await hashPassword(password);
        const userRecord = { pkid, accountId: pkid, email: cleanEmail, passwordHash, name };

        if (env?.TRACKER_DB) {
          const existing = await env.TRACKER_DB.get(`user:${cleanEmail}`);
          if (existing) {
            return new Response(JSON.stringify({ error: 'Account already exists. Please log in.' }), { status: 400, headers: corsHeaders });
          }
          await env.TRACKER_DB.put(`user:${cleanEmail}`, JSON.stringify(userRecord));
          await env.TRACKER_DB.put(`account:${pkid}`, JSON.stringify(userRecord));
          await env.TRACKER_DB.put(`pkid:${pkid}`, JSON.stringify(userRecord));
        }

        return new Response(
          JSON.stringify({ success: true, user: { pkid, accountId: pkid, email: cleanEmail, name } }),
          { status: 200, headers: corsHeaders }
        );
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Registration error: ' + e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 3. Handle /api/auth/login
    if (pathname === '/api/auth/login') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
      }
      try {
        const body = await request.json();
        const cleanEmail = (body.email || '').trim().toLowerCase();
        const password = body.password || '';

        if (!cleanEmail || !password) {
          return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400, headers: corsHeaders });
        }

        const pkid = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

        if (env?.TRACKER_DB) {
          const userRaw = await env.TRACKER_DB.get(`user:${cleanEmail}`);
          if (!userRaw) {
            return new Response(JSON.stringify({ error: 'Account not found. Please click Sign Up to create your account.' }), { status: 401, headers: corsHeaders });
          }

          const userRecord = JSON.parse(userRaw);
          const inputHash = await hashPassword(password);

          const isValidPassword = userRecord.passwordHash
            ? userRecord.passwordHash === inputHash
            : userRecord.password === password;

          if (!isValidPassword) {
            return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401, headers: corsHeaders });
          }

          const activePkid = userRecord.pkid || userRecord.accountId || pkid;
          return new Response(
            JSON.stringify({
              success: true,
              user: {
                pkid: activePkid,
                accountId: activePkid,
                email: userRecord.email,
                name: userRecord.name,
              },
            }),
            { status: 200, headers: corsHeaders }
          );
        }

        return new Response(JSON.stringify({ error: 'Database service not configured' }), { status: 503, headers: corsHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Login error: ' + e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 4. Handle /api/sync
    if (pathname === '/api/sync') {
      if (request.method === 'GET') {
        const pkid = url.searchParams.get('pkid') || url.searchParams.get('accountId') || '';
        if (!pkid) {
          return new Response(JSON.stringify({ error: 'pkid required' }), { status: 400, headers: corsHeaders });
        }

        if (env?.TRACKER_DB) {
          const dataRaw = await env.TRACKER_DB.get(`sync:${pkid}`);
          if (dataRaw) {
            return new Response(dataRaw, { status: 200, headers: corsHeaders });
          }
        }

        return new Response(
          JSON.stringify({ expenses: [], reminders: [], trips: [], targets: null, goals: null, cycleHistory: [] }),
          { status: 200, headers: corsHeaders }
        );
      }

      if (request.method === 'POST') {
        const body = await request.json();
        const pkid = body.pkid || body.accountId;

        if (!pkid) {
          return new Response(JSON.stringify({ error: 'pkid required' }), { status: 400, headers: corsHeaders });
        }

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
          await env.TRACKER_DB.put(`sync:${pkid}`, JSON.stringify(dataToStore));
        }

        return new Response(
          JSON.stringify({ success: true, timestamp: dataToStore.updatedAt }),
          { status: 200, headers: corsHeaders }
        );
      }

      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
    }

    // 5. Fallback to static assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
