/**
 * Cloudflare Pages Function: POST /api/auth/register
 * Handles Cloud Database User Account Registration
 */

export async function onRequestPost(context: { request: Request; env: any }) {
  try {
    const body: any = await context.request.json();
    const cleanEmail = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    const name = (body.name || '').trim() || cleanEmail.split('@')[0];

    if (!cleanEmail || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const accountId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
    const userRecord = { accountId, email: cleanEmail, password, name };

    // If Cloudflare KV storage is configured
    if (context.env?.TRACKER_DB) {
      const existing = await context.env.TRACKER_DB.get(`user:${cleanEmail}`);
      if (existing) {
        return new Response(JSON.stringify({ error: 'Account already exists. Please log in.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      await context.env.TRACKER_DB.put(`user:${cleanEmail}`, JSON.stringify(userRecord));
      await context.env.TRACKER_DB.put(`account:${accountId}`, JSON.stringify(userRecord));
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: { accountId, email: cleanEmail, name },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Server registration error: ' + e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
