/**
 * Cloudflare Worker & Pages Service: _worker.js
 * Comprehensive User Database & Authentication System (Best Practices Rework)
 * Primary Key: pkid (e.g., usr_email_sanitized)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-guest-id, x-pkid',
  'Content-Type': 'application/json',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PEPPER = 'PITRACK_PEPPER_2026';

/**
 * Hash password securely using Web Crypto API SHA-256 + Pepper
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + PEPPER);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate deterministic Primary Key ID (pkid)
 */
function generatePkid(email: string): string {
  const sanitized = email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `usr_${sanitized}`;
}

export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1. CORS Preflight Handling
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS, status: 204 });
    }

    // 2. User Registration Handler: /api/auth/register
    if (pathname === '/api/auth/register') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS_HEADERS });
      }

      try {
        const body: any = await request.json();
        const cleanEmail = (body.email || '').trim().toLowerCase();
        const password = body.password || '';
        const name = (body.name || '').trim() || cleanEmail.split('@')[0];

        if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
          return new Response(JSON.stringify({ error: 'Please enter a valid email address' }), { status: 400, headers: CORS_HEADERS });
        }

        if (!password || password.length < 6) {
          return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), { status: 400, headers: CORS_HEADERS });
        }

        const pkid = generatePkid(cleanEmail);
        const passwordHash = await hashPassword(password);
        const now = Date.now();

        const userRecord = {
          pkid,
          accountId: pkid, // Backwards compatibility alias
          email: cleanEmail,
          passwordHash,
          name,
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
        };

        if (env?.TRACKER_DB) {
          const existing = await env.TRACKER_DB.get(`user:${cleanEmail}`);
          if (existing) {
            return new Response(JSON.stringify({ error: 'Account already exists. Please log in.' }), { status: 400, headers: CORS_HEADERS });
          }
          // Store primary key mappings
          await env.TRACKER_DB.put(`user:${cleanEmail}`, JSON.stringify(userRecord));
          await env.TRACKER_DB.put(`pkid:${pkid}`, JSON.stringify(userRecord));
          await env.TRACKER_DB.put(`account:${pkid}`, JSON.stringify(userRecord));
        }

        return new Response(
          JSON.stringify({
            success: true,
            user: { pkid, accountId: pkid, email: cleanEmail, name, createdAt: now },
          }),
          { status: 200, headers: CORS_HEADERS }
        );
      } catch (e: any) {
        return new Response(JSON.stringify({ error: 'Registration failed: ' + e.message }), { status: 500, headers: CORS_HEADERS });
      }
    }

    // 3. User Login Handler: /api/auth/login
    if (pathname === '/api/auth/login') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS_HEADERS });
      }

      try {
        const body: any = await request.json();
        const cleanEmail = (body.email || '').trim().toLowerCase();
        const password = body.password || '';

        if (!cleanEmail || !password) {
          return new Response(JSON.stringify({ error: 'Email and password are required' }), { status: 400, headers: CORS_HEADERS });
        }

        const pkid = generatePkid(cleanEmail);

        if (env?.TRACKER_DB) {
          const userRaw = await env.TRACKER_DB.get(`user:${cleanEmail}`);
          if (!userRaw) {
            return new Response(JSON.stringify({ error: 'Account not found. Please click Sign Up below.' }), { status: 401, headers: CORS_HEADERS });
          }

          const userRecord = JSON.parse(userRaw);
          const inputHash = await hashPassword(password);

          const isValidPassword = userRecord.passwordHash
            ? userRecord.passwordHash === inputHash
            : userRecord.password === password;

          if (!isValidPassword) {
            return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401, headers: CORS_HEADERS });
          }

          // Update last login timestamp
          userRecord.lastLoginAt = Date.now();
          await env.TRACKER_DB.put(`user:${cleanEmail}`, JSON.stringify(userRecord));

          const activePkid = userRecord.pkid || pkid;
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
            { status: 200, headers: CORS_HEADERS }
          );
        }

        return new Response(JSON.stringify({ error: 'Database service not configured' }), { status: 503, headers: CORS_HEADERS });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: 'Login failed: ' + e.message }), { status: 500, headers: CORS_HEADERS });
      }
    }

    // 4. Data Backup & Sync Handler: /api/sync
    if (pathname === '/api/sync') {
      if (request.method === 'GET') {
        const pkid = url.searchParams.get('pkid') || url.searchParams.get('accountId') || '';
        if (!pkid) {
          return new Response(JSON.stringify({ error: 'pkid parameter is required' }), { status: 400, headers: CORS_HEADERS });
        }

        if (env?.TRACKER_DB) {
          const dataRaw = await env.TRACKER_DB.get(`sync:${pkid}`);
          if (dataRaw) {
            return new Response(dataRaw, { status: 200, headers: CORS_HEADERS });
          }
        }

        return new Response(
          JSON.stringify({ expenses: [], reminders: [], trips: [], targets: null, goals: null, cycleHistory: [] }),
          { status: 200, headers: CORS_HEADERS }
        );
      }

      if (request.method === 'POST') {
        const body: any = await request.json();
        const pkid = body.pkid || body.accountId;

        if (!pkid) {
          return new Response(JSON.stringify({ error: 'pkid parameter is required' }), { status: 400, headers: CORS_HEADERS });
        }

        const dataToStore = {
          pkid,
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
          { status: 200, headers: CORS_HEADERS }
        );
      }

      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS_HEADERS });
    }

    // 5. Fallback: Static Asset Delivery
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
