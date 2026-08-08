/**
 * Cloudflare Pages Function: /api/sync
 * GET  /api/sync?accountId=usr_... → fetch full account backup
 * POST /api/sync → save account data to KV (flat body, no payload wrapper)
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-guest-id',
  'Content-Type': 'application/json',
};

export async function onRequest(context: { request: Request; env: any }) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders, status: 204 });
    }

    if (request.method === 'GET') {
      const accountId = url.searchParams.get('accountId') || '';
      if (!accountId) {
        return new Response(JSON.stringify({ error: 'accountId required' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      if (env?.TRACKER_DB) {
        const dataRaw = await env.TRACKER_DB.get(`sync:${accountId}`);
        if (dataRaw) {
          return new Response(dataRaw, {
            status: 200,
            headers: corsHeaders,
          });
        }
      }

      // No data found yet — return empty structure
      return new Response(
        JSON.stringify({ expenses: [], reminders: [], trips: [], targets: null, goals: null, cycleHistory: [] }),
        { status: 200, headers: corsHeaders }
      );
    }

    if (request.method === 'POST') {
      const body: any = await request.json();
      const accountId = body.accountId;

      if (!accountId) {
        return new Response(JSON.stringify({ error: 'accountId required' }), {
          status: 400,
          headers: corsHeaders,
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
        { status: 200, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Sync error: ' + e.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}


