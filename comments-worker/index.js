/**
 * Cloudflare Worker for Comments API
 * Handles GET (list) and POST (create) for blog comments
 * Bound to D1 database: hanyiask-blog-comments
 */

// CORS headers
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Only allow /api/comments
    if (!url.pathname.startsWith('/api/comments')) {
      return new Response('Not Found', { status: 404 });
    }

    // GET /api/comments?slug=xxx&page=1&limit=20
    if (request.method === 'GET') {
      const slug = url.searchParams.get('slug') || 'home';
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
      const offset = (page - 1) * limit;

      try {
        const results = await env.DB.prepare(`
          SELECT id, nickname, email, content, created_at, slug
          FROM comments
          WHERE slug = ?
          ORDER BY created_at DESC
          LIMIT ? OFFSET ?
        `).bind(slug, limit, offset).all();

        const totalResult = await env.DB.prepare(`
          SELECT COUNT(*) as count FROM comments WHERE slug = ?
        `).bind(slug).first();

        return new Response(JSON.stringify({
          comments: results.results,
          total: totalResult.count,
          page,
          limit,
          pages: Math.ceil(totalResult.count / limit),
        }), {
          headers: { 'Content-Type': 'application/json', ...CORS }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Database error', details: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...CORS }
        });
      }
    }

    // POST /api/comments
    if (request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS }
        });
      }

      const { slug = 'home', nickname, email, content } = body;

      if (!nickname?.trim()) {
        return new Response(JSON.stringify({ error: 'Nickname is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS }
        });
      }
      if (!content?.trim()) {
        return new Response(JSON.stringify({ error: 'Content is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS }
        });
      }
      if (nickname.trim().length > 50) {
        return new Response(JSON.stringify({ error: 'Nickname too long (max 50 chars)' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS }
        });
      }
      if (content.trim().length > 2000) {
        return new Response(JSON.stringify({ error: 'Content too long (max 2000 chars)' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS }
        });
      }
      if (/(https?:\/\/|www\.)/i.test(content)) {
        return new Response(JSON.stringify({ error: 'Links not allowed in comments' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS }
        });
      }

      try {
        const result = await env.DB.prepare(`
          INSERT INTO comments (slug, nickname, email, content, created_at)
          VALUES (?, ?, ?, ?, datetime('now'))
        `).bind(
          slug.substring(0, 200),
          nickname.trim().substring(0, 50),
          email ? email.trim().substring(0, 100) : '',
          content.trim().substring(0, 2000)
        ).run();

        const newComment = await env.DB.prepare(`
          SELECT id, nickname, email, content, created_at, slug
          FROM comments WHERE id = ?
        `).bind(result.meta.last_row_id).first();

        return new Response(JSON.stringify({ success: true, comment: newComment }), {
          status: 201,
          headers: { 'Content-Type': 'application/json', ...CORS }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Database error', details: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...CORS }
        });
      }
    }

    // OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    return new Response('Method Not Allowed', { status: 405 });
  }
};
