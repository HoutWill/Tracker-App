/**
 * Cloudflare Pages Function: /api/auth/register
 * Handles Cloud Database User Account Registration with full CORS support
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
    const name = (body.name || '').trim() || cleanEmail.split('@')[0];

    if (!cleanEmail || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const accountId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
    const passwordHash = await hashPassword(password);
    const userRecord = { accountId, email: cleanEmail, passwordHash, name };

    // If Cloudflare KV storage is configured
    if (env?.TRACKER_DB) {
      const existing = await env.TRACKER_DB.get(`user:${cleanEmail}`);
      if (existing) {
        return new Response(JSON.stringify({ error: 'Account already exists. Please log in.' }), {
          status: 400,
          headers: corsHeaders,
        });
      }
      await env.TRACKER_DB.put(`user:${cleanEmail}`, JSON.stringify(userRecord));
      await env.TRACKER_DB.put(`account:${accountId}`, JSON.stringify(userRecord));
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: { accountId, email: cleanEmail, name },
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Server registration error: ' + e.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}


