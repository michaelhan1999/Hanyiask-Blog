export async function onRequestGet(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const slug = url.searchParams.get('slug') || 'home';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  let results;
  try {
    results = await env.DB.prepare(`
      SELECT id, nickname, email, content, created_at, slug
      FROM comments
      WHERE slug = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(slug, limit, offset).all();

    const total = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM comments WHERE slug = ?
    `).bind(slug).first();

    return new Response(JSON.stringify({
      comments: results.results,
      total: total.count,
      page,
      limit,
      pages: Math.ceil(total.count / limit),
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Database error', details: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  const { env } = context;
  const { request } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { slug = 'home', nickname, email, content } = body;

  if (!nickname || !nickname.trim()) {
    return new Response(JSON.stringify({ error: 'Nickname is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  if (!content || !content.trim()) {
    return new Response(JSON.stringify({ error: 'Content is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  if (nickname.trim().length > 50) {
    return new Response(JSON.stringify({ error: 'Nickname too long (max 50 chars)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  if (content.trim().length > 2000) {
    return new Response(JSON.stringify({ error: 'Content too long (max 2000 chars)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Simple spam check: no URLs in content
  if (/(https?:\/\/|www\.)/i.test(content)) {
    return new Response(JSON.stringify({ error: 'Links not allowed in comments' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
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
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Database error', details: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
