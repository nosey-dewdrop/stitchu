// Cloudflare Worker - Anthropic proxy for Stitchu garment analysis.
// The app never holds the Anthropic key; it calls this Worker with a shared
// app token. The real key lives as a Cloudflare secret (see DEPLOY.md).
//
// Deploy:  npx wrangler deploy
// Secrets: npx wrangler secret put CLAUDE_API_KEY   (your sk-ant- key)
//          npx wrangler secret put APP_TOKEN         (any long random string)

const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';
// Vision-capable current model.
const MODEL = 'claude-opus-4-8';
const RATE_LIMIT_PER_MIN = 20;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';

    try {
      // ---- Public stitch wall (landing page): no app token — a public web
      // page cannot keep a secret. Guarded by strict rate limits + validation.
      if (url.pathname === '/api/wall' && request.method === 'GET') {
        return handleWallGet(env);
      }
      if (url.pathname === '/api/wall/stitch' && request.method === 'POST') {
        if (await rateLimited(env, `wallstitch:${ip}`, 30)) {
          return jsonResponse({ error: 'Rate limit exceeded. Please wait.' }, 429);
        }
        return handleWallStitch(request, env);
      }
      if (url.pathname === '/api/wall/note' && request.method === 'POST') {
        if (await rateLimited(env, `wallnote:${ip}`, 2)) {
          return jsonResponse({ error: 'Rate limit exceeded. Please wait.' }, 429);
        }
        return handleWallNote(request, env);
      }

      // Public photo analysis for the web app (a browser cannot keep the app
      // token secret). OFF unless the PUBLIC_ANALYZE var is set to "on" at
      // deploy — every call costs Claude vision money, so it ships throttled:
      // 3/min and 15/day per IP, ~2 MB image cap.
      if (url.pathname === '/api/analyze' && request.method === 'POST' &&
          !request.headers.get('x-app-token')) {
        if (env.PUBLIC_ANALYZE !== 'on') {
          return jsonResponse({ error: 'Photo analysis is not open yet' }, 403);
        }
        if (await rateLimited(env, `puban:${ip}`, 3) ||
            await rateLimitedDaily(env, `pubanday:${ip}`, 15)) {
          return jsonResponse({ error: 'Rate limit exceeded. Please wait.' }, 429);
        }
        const length = parseInt(request.headers.get('content-length') || '0');
        if (length > 2_800_000) {
          return jsonResponse({ error: 'Image too large' }, 413);
        }
        return handleAnalyze(request, env);
      }

      // ---- Authenticated app endpoints (shared-secret app token).
      const appToken = request.headers.get('x-app-token');
      if (!env.APP_TOKEN || appToken !== env.APP_TOKEN) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }

      if (await rateLimited(env, `rate:${ip}`, RATE_LIMIT_PER_MIN)) {
        return jsonResponse({ error: 'Rate limit exceeded. Please wait.' }, 429);
      }

      if (url.pathname === '/api/analyze' && request.method === 'POST') {
        return handleAnalyze(request, env);
      }

      return jsonResponse({ error: 'Not found' }, 404);
    } catch (err) {
      return jsonResponse({ error: 'Internal error' }, 500);
    }
  },
};

// Best-effort per-IP-per-minute rate limit; no-op if KV is not bound.
async function rateLimited(env, keyBase, perMinute) {
  const key = `${keyBase}:${Math.floor(Date.now() / 60000)}`;
  const current = await env.RATE_LIMIT?.get(key);
  const count = current ? parseInt(current) : 0;
  if (count >= perMinute) return true;
  await env.RATE_LIMIT?.put(key, String(count + 1), { expirationTtl: 120 });
  return false;
}

// Per-IP-per-day cap (UTC day) — the cost fuse for public vision calls.
async function rateLimitedDaily(env, keyBase, perDay) {
  const key = `${keyBase}:${Math.floor(Date.now() / 86400000)}`;
  const current = await env.RATE_LIMIT?.get(key);
  const count = current ? parseInt(current) : 0;
  if (count >= perDay) return true;
  await env.RATE_LIMIT?.put(key, String(count + 1), { expirationTtl: 90000 });
  return false;
}

// ---- Stitch wall ----------------------------------------------------------
// Storage: two KV JSON arrays, newest last, capped. KV read-modify-write has
// a small race window under simultaneous writes; at wall scale losing one
// stitch to a race is acceptable and invisible.

const WALL_STITCH_CAP = 2000;
const WALL_NOTE_CAP = 300;
const WALL_COLORS = ['#3EB8AF', '#C4767B', '#B8963E', '#7A8450', '#3E5C76', '#7E5A75'];
// Minimal TR/EN profanity screen for the public guestbook (normalized match).
const BANNED = ['amk', 'aq', 'orospu', 'sik', 'piç', 'pic', 'yarrak', 'göt', 'got',
  'amcik', 'amcık', 'fuck', 'shit', 'bitch', 'cunt', 'dick', 'porn', 'nazi', 'hitler'];

function normalizeForFilter(text) {
  return text.toLowerCase()
    .replaceAll('ı', 'i').replaceAll('ğ', 'g').replaceAll('ü', 'u')
    .replaceAll('ş', 's').replaceAll('ö', 'o').replaceAll('ç', 'c')
    .replace(/[^a-z0-9]/g, ' ');
}

function containsBanned(text) {
  const words = normalizeForFilter(text).split(/\s+/);
  return BANNED.some((bad) => words.includes(bad));
}

async function readWall(env, key, fallback) {
  const raw = await env.RATE_LIMIT?.get(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

async function handleWallGet(env) {
  const stitches = await readWall(env, 'wall:stitches', []);
  const notes = await readWall(env, 'wall:notes', []);
  return jsonResponse({ stitches, notes });
}

const WALL_KINDS = ['run', 'zigzag', 'heart', 'curly'];

// Body: { color, kind, points: [[x,y], ...] } — coords normalized 0..1 so the
// wall renders at any canvas size.
async function handleWallStitch(request, env) {
  const body = await request.json();
  if (!WALL_COLORS.includes(body.color)) return jsonResponse({ error: 'Invalid color' }, 400);
  const kind = body.kind || 'run';
  if (!WALL_KINDS.includes(kind)) return jsonResponse({ error: 'Invalid stitch kind' }, 400);
  const points = body.points;
  if (!Array.isArray(points) || points.length < 2 || points.length > 80) {
    return jsonResponse({ error: 'Invalid stitch' }, 400);
  }
  for (const p of points) {
    if (!Array.isArray(p) || p.length !== 2 ||
        typeof p[0] !== 'number' || typeof p[1] !== 'number' ||
        p[0] < 0 || p[0] > 1 || p[1] < 0 || p[1] > 1) {
      return jsonResponse({ error: 'Invalid stitch' }, 400);
    }
  }
  const stitches = await readWall(env, 'wall:stitches', []);
  stitches.push({
    color: body.color,
    kind,
    points: points.map(([x, y]) => [Number(x.toFixed(4)), Number(y.toFixed(4))]),
    at: Date.now(),
  });
  while (stitches.length > WALL_STITCH_CAP) stitches.shift();
  await env.RATE_LIMIT?.put('wall:stitches', JSON.stringify(stitches));
  return jsonResponse({ ok: true, count: stitches.length });
}

// Body: { color, text } — anonymous, 80 chars, filtered.
async function handleWallNote(request, env) {
  const body = await request.json();
  if (!WALL_COLORS.includes(body.color)) return jsonResponse({ error: 'Invalid color' }, 400);
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (!text || text.length > 80) return jsonResponse({ error: 'Note must be 1-80 characters' }, 400);
  if (containsBanned(text)) return jsonResponse({ error: 'Keep it kind' }, 400);
  const notes = await readWall(env, 'wall:notes', []);
  notes.push({ color: body.color, text, at: Date.now() });
  while (notes.length > WALL_NOTE_CAP) notes.shift();
  await env.RATE_LIMIT?.put('wall:notes', JSON.stringify(notes));
  return jsonResponse({ ok: true });
}

// Garment photo analysis. The app sends a base64 JPEG; we prompt Claude and
// return the raw Anthropic response so the app parses it exactly as before.
async function handleAnalyze(request, env) {
  const body = await request.json();
  const imageBase64 = body.image;
  const mediaType = body.mediaType || 'image/jpeg';
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return jsonResponse({ error: 'Invalid request' }, 400);
  }

  const prompt = `Analyze the garment in this photo for sewing pattern drafting. Respond with ONLY a JSON object, no prose:
{"garment": "skirt" | "dress" | "top" | "trousers" | "other",
 "neckline": "crew" | "scoop" | "vNeck" | "square" | "boat" | null,
 "sleeveStyle": "none" | "straight" | "balloon" | null (balloon covers puff/bishop/gathered sleeves),
 "sleeveLength": "short" | "elbow" | "long" | null,
 "skirtStyle": "aLine" | "straight" | "gathered" | "halfCircle" | null (halfCircle covers full/flared circle skirts),
 "length": "mini" | "midi" | "maxi" | null (skirt/dress hem length),
 "topLength": "cropped" | "hip" | "tunic" | null (only for tops),
 "details": "one sentence: notable construction details (zipper, darts, pleats, waistband, fabric guess)"}`;

  const anthropicBody = {
    model: MODEL,
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
          { type: 'text', text: prompt },
        ],
      },
    ],
  };

  const response = await fetch(CLAUDE_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(anthropicBody),
  });
  const data = await response.json();
  return jsonResponse(data, response.status);
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-app-token',
  };
}
