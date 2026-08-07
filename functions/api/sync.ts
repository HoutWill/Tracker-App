/**
 * Cloudflare Pages Function: /api/sync
 * Cloud Data Backup & Recovery API for User Accounts
 * GET /api/sync?accountId=usr_... -> Fetches full cloud backup of expenses, savings, trips, and reminders
 * POST /api/sync -> Saves user account data payload to cloud database
 */

export async function onRequest(context: { request: Request; env: any }) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);

    if (request.method === 'GET') {
      const accountId = url.searchParams.get('accountId') || '';
      if (!accountId) {
        return new Response(JSON.stringify({ error: 'accountId parameter is required' }), {
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

      return new Response(JSON.stringify({ success: true, data: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'POST') {
      const body: any = await request.json();
      const accountId = body.accountId;
      const payload = body.payload;

      if (!accountId || !payload) {
        return new Response(JSON.stringify({ error: 'accountId and payload are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (env?.TRACKER_DB) {
        await env.TRACKER_DB.put(`sync:${accountId}`, JSON.stringify(payload));
      }

      return new Response(JSON.stringify({ success: true, timestamp: Date.now() }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Sync server error: ' + e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
