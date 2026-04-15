/**
 * 访客统计 API
 * Cloudflare Pages Function
 * 读取/增加访客计数
 */

interface Env {
  VISITORS: KVNamespace;
}

export async function onRequest(context: { request: Request; env: Env; params: Record<string, string> }) {
  const { env } = context;

  if (!env.VISITORS) {
    return new Response(JSON.stringify({ error: 'KV not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(context.request.url);
  const path = url.pathname.replace('/api/visits', '') || '/';

  if (context.request.method === 'GET') {
    const count = (await env.VISITORS.get(path, 'number')) || 0;
    const total = (await env.VISITORS.get('total', 'number')) || 0;
    return new Response(JSON.stringify({ path, count, total }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  if (context.request.method === 'POST') {
    // 增加计数
    const current = (await env.VISITORS.get(path, 'number')) || 0;
    const total = (await env.VISITORS.get('total', 'number')) || 0;
    await env.VISITORS.put(path, String(current + 1));
    await env.VISITORS.put('total', String(total + 1));
    return new Response(JSON.stringify({ path, count: current + 1, total: total + 1 }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
