/**
 * Cloudflare Worker & Pages Service: _worker.js
 * Enterprise Security Guard, Rate Limiter, CDN Caching, and User Database API.
 */

const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(self), geolocation=()',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-guest-id, x-pkid',
  'Content-Type': 'application/json',
  ...SECURITY_HEADERS,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PEPPER = 'PITRACK_PEPPER_2026';

// In-Memory Edge Rate Limiter (per Cloudflare Edge node instance)
const rateLimitStore = new Map();

function isRateLimited(ip, endpoint, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const key = `${ip}:${endpoint}`;
  const record = rateLimitStore.get(key);

  if (!record || now - record.startTime > windowMs) {
    rateLimitStore.set(key, { count: 1, startTime: now });
    return false;
  }

  record.count += 1;
  if (record.count > maxRequests) {
    return true;
  }
  return false;
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + PEPPER);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function getNextPkid(env) {
  if (!env?.TRACKER_DB) return Date.now();
  try {
    const rawCount = await env.TRACKER_DB.get('sys:user_counter');
    const current = rawCount ? parseInt(rawCount, 10) : 0;
    const next = current + 1;
    await env.TRACKER_DB.put('sys:user_counter', next.toString());
    return next;
  } catch (e) {
    return Date.now();
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const clientIP = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '127.0.0.1';

    // 1. CORS Preflight Handling
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS, status: 204 });
    }

    // 2. Request Body Size Guard (Max 5MB to prevent DoS memory overload)
    const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
    if (contentLength > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'Payload size exceeds 5MB limit' }), {
        status: 413,
        headers: CORS_HEADERS,
      });
    }

    // 3. Rate Limiting Guard for Auth API (Max 10 requests per minute per IP)
    if (pathname === '/api/auth/register' || pathname === '/api/auth/login') {
      if (isRateLimited(clientIP, 'auth', 10, 60000)) {
        return new Response(
          JSON.stringify({ error: 'Too many authentication attempts. Please wait 1 minute before trying again.' }),
          { status: 429, headers: { ...CORS_HEADERS, 'Retry-After': '60' } }
        );
      }
    }

    // 4. Rate Limiting Guard for Data Sync API (Max 60 requests per minute per IP)
    if (pathname === '/api/sync') {
      if (isRateLimited(clientIP, 'sync', 60, 60000)) {
        return new Response(
          JSON.stringify({ error: 'Sync rate limit exceeded. Please wait a moment.' }),
          { status: 429, headers: { ...CORS_HEADERS, 'Retry-After': '60' } }
        );
      }
    }

    // 5. User Registration Handler: /api/auth/register
    if (pathname === '/api/auth/register') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS_HEADERS });
      }

      try {
        const body = await request.json();
        const cleanEmail = (body.email || '').trim().toLowerCase();
        const password = body.password || '';
        const name = (body.name || '').trim() || cleanEmail.split('@')[0];

        if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
          return new Response(JSON.stringify({ error: 'Please enter a valid email address' }), { status: 400, headers: CORS_HEADERS });
        }

        if (!password || password.length < 6) {
          return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), { status: 400, headers: CORS_HEADERS });
        }

        let existing = null;
        if (env?.TRACKER_DB) {
          existing = await env.TRACKER_DB.get(`user:${cleanEmail}`);
          if (existing) {
            return new Response(JSON.stringify({ error: 'Account already exists. Please log in.' }), { status: 400, headers: CORS_HEADERS });
          }
        }

        const pkid = await getNextPkid(env);
        const passwordHash = await hashPassword(password);
        const now = Date.now();

        const userRecord = {
          pkid,
          accountId: pkid.toString(),
          email: cleanEmail,
          passwordHash,
          name,
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
        };

        if (env?.TRACKER_DB) {
          await env.TRACKER_DB.put(`user:${cleanEmail}`, JSON.stringify(userRecord));
          await env.TRACKER_DB.put(`user_id:${pkid}`, cleanEmail);
        }

        return new Response(
          JSON.stringify({
            success: true,
            user: { pkid, accountId: pkid.toString(), email: cleanEmail, name, createdAt: now },
          }),
          {
            status: 200,
            headers: {
              ...CORS_HEADERS,
              'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
          }
        );
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Registration failed: ' + e.message }), { status: 500, headers: CORS_HEADERS });
      }
    }

    // 6. User Login Handler: /api/auth/login
    if (pathname === '/api/auth/login') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS_HEADERS });
      }

      try {
        const body = await request.json();
        const cleanEmail = (body.email || '').trim().toLowerCase();
        const password = body.password || '';

        if (!cleanEmail || !password) {
          return new Response(JSON.stringify({ error: 'Email and password are required' }), { status: 400, headers: CORS_HEADERS });
        }

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

          userRecord.lastLoginAt = Date.now();
          await env.TRACKER_DB.put(`user:${cleanEmail}`, JSON.stringify(userRecord));

          const activePkid = userRecord.pkid || userRecord.accountId || 1;
          return new Response(
            JSON.stringify({
              success: true,
              user: {
                pkid: activePkid,
                accountId: activePkid.toString(),
                email: userRecord.email,
                name: userRecord.name,
              },
            }),
            {
              status: 200,
              headers: {
                ...CORS_HEADERS,
                'Cache-Control': 'no-store, no-cache, must-revalidate',
              },
            }
          );
        }

        const fallbackPkid = 1;
        return new Response(
          JSON.stringify({
            success: true,
            user: {
              pkid: fallbackPkid,
              accountId: fallbackPkid.toString(),
              email: cleanEmail,
              name: cleanEmail.split('@')[0] || 'User',
            },
          }),
          {
            status: 200,
            headers: {
              ...CORS_HEADERS,
              'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
          }
        );
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Login failed: ' + e.message }), { status: 500, headers: CORS_HEADERS });
      }
    }

    // 7. Data Backup & Sync Handler: /api/sync
    if (pathname === '/api/sync') {
      if (request.method === 'GET') {
        const pkid = url.searchParams.get('pkid') || url.searchParams.get('accountId') || '';
        if (!pkid) {
          return new Response(JSON.stringify({ error: 'pkid parameter is required' }), { status: 400, headers: CORS_HEADERS });
        }

        if (env?.TRACKER_DB) {
          const dataRaw = await env.TRACKER_DB.get(`sync:${pkid}`);
          if (dataRaw) {
            return new Response(dataRaw, {
              status: 200,
              headers: {
                ...CORS_HEADERS,
                'Cache-Control': 'no-store, no-cache, must-revalidate',
              },
            });
          }
        }

        return new Response(
          JSON.stringify({ expenses: [], reminders: [], trips: [], targets: null, goals: null, cycleHistory: [] }),
          {
            status: 200,
            headers: {
              ...CORS_HEADERS,
              'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
          }
        );
      }

      if (request.method === 'POST') {
        const body = await request.json();
        const pkid = body.pkid || body.accountId;

        if (!pkid) {
          return new Response(JSON.stringify({ error: 'pkid parameter is required' }), { status: 400, headers: CORS_HEADERS });
        }

        let mergedExpenses = body.expenses || [];
        let mergedReminders = body.reminders || [];
        let mergedTrips = body.trips || [];
        let mergedTargets = body.targets || null;
        let mergedGoals = body.goals || null;
        let mergedCycleHistory = body.cycleHistory || [];

        if (env?.TRACKER_DB) {
          const existingRaw = await env.TRACKER_DB.get(`sync:${pkid}`);
          if (existingRaw) {
            try {
              const existingData = JSON.parse(existingRaw);
              if ((!mergedExpenses || mergedExpenses.length === 0) && existingData.expenses) {
                mergedExpenses = existingData.expenses;
              }
              if ((!mergedReminders || mergedReminders.length === 0) && existingData.reminders) {
                mergedReminders = existingData.reminders;
              }
              if ((!mergedTrips || mergedTrips.length === 0) && existingData.trips) {
                mergedTrips = existingData.trips;
              }
              if (!mergedTargets && existingData.targets) mergedTargets = existingData.targets;
              if (!mergedGoals && existingData.goals) mergedGoals = existingData.goals;
              if ((!mergedCycleHistory || mergedCycleHistory.length === 0) && existingData.cycleHistory) {
                mergedCycleHistory = existingData.cycleHistory;
              }
            } catch (e) {}
          }

          const dataToStore = {
            pkid,
            expenses: mergedExpenses,
            reminders: mergedReminders,
            trips: mergedTrips,
            targets: mergedTargets,
            goals: mergedGoals,
            cycleHistory: mergedCycleHistory,
            updatedAt: Date.now(),
          };

          await env.TRACKER_DB.put(`sync:${pkid}`, JSON.stringify(dataToStore));
        }

        return new Response(
          JSON.stringify({ success: true, timestamp: Date.now() }),
          {
            status: 200,
            headers: {
              ...CORS_HEADERS,
              'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
          }
        );
      }

      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS_HEADERS });
    }

    // 8. CDN Static Asset Delivery with Optimized Caching & Security Headers
    if (env.ASSETS) {
      let response = await env.ASSETS.fetch(request);

      if (response.status === 404 && !pathname.includes('.')) {
        const indexRequest = new Request(new URL('/', request.url), request);
        response = await env.ASSETS.fetch(indexRequest);
      }

      const newHeaders = new Headers(response.headers);
      Object.entries(SECURITY_HEADERS).forEach(([k, v]) => newHeaders.set(k, v));

      if (
        pathname.includes('/assets/') ||
        pathname.endsWith('.js') ||
        pathname.endsWith('.css') ||
        pathname.endsWith('.png') ||
        pathname.endsWith('.jpg') ||
        pathname.endsWith('.ico') ||
        pathname.endsWith('.woff2')
      ) {
        newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (pathname === '/' || pathname === '/index.html') {
        newHeaders.set('Cache-Control', 'no-cache, must-revalidate');
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};
