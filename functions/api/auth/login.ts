/**
 * Cloudflare Pages Function: /api/auth/login
 * Deterministic accountId: usr_<email_cleaned>
 * Same email = same accountId on any device, any server, forever.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-guest-id',
  'Content-Type': 'application/json',
};

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'PITRACK_PEPPER_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequest(context: { request: Request; env: any }) {
  const { request, env } = context;

  // Handle CORS preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const body: any = await request.json();
    const cleanEmail = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!cleanEmail || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Deterministic accountId: same email always maps to same ID on any device/server
    const accountId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

    if (env?.TRACKER_DB) {
      const userRaw = await env.TRACKER_DB.get(`user:${cleanEmail}`);
      if (!userRaw) {
        return new Response(JSON.stringify({ error: 'Account not found. Please register first.' }), {
          status: 401,
          headers: corsHeaders,
        });
      }

      const userRecord = JSON.parse(userRaw);
      const inputHash = await hashPassword(password);

      const isValidPassword = userRecord.passwordHash
        ? userRecord.passwordHash === inputHash
        : userRecord.password === password;

      if (!isValidPassword) {
        return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
          status: 401,
          headers: corsHeaders,
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            accountId: userRecord.accountId || accountId,
            email: userRecord.email,
            name: userRecord.name,
          },
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // KV not configured — return error
    return new Response(
      JSON.stringify({ error: 'Authentication service not configured. Contact support.' }),
      { status: 503, headers: corsHeaders }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Server authentication error: ' + e.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}



