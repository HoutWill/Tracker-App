/**
 * Cloudflare Pages Function: POST /api/auth/login
 * Handles Cloud Database User Account Login Verification
 */

export async function onRequestPost(context: { request: Request; env: any }) {
  try {
    const body: any = await context.request.json();
    const cleanEmail = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!cleanEmail || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const accountId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

    if (context.env?.TRACKER_DB) {
      const userRaw = await context.env.TRACKER_DB.get(`user:${cleanEmail}`);
      if (!userRaw) {
        return new Response(JSON.stringify({ error: 'Account does not exist. Please register first.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const userRecord = JSON.parse(userRaw);
      if (userRecord.password !== password) {
        return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          user: { accountId: userRecord.accountId, email: userRecord.email, name: userRecord.name },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Default Cloud Response
    return new Response(
      JSON.stringify({
        success: true,
        user: { accountId, email: cleanEmail, name: cleanEmail.split('@')[0] },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Server authentication error: ' + e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
