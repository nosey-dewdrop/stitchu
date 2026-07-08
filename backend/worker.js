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

    try {
      // Shared-secret app authentication on every call.
      const appToken = request.headers.get('x-app-token');
      if (!env.APP_TOKEN || appToken !== env.APP_TOKEN) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }

      // Rate limiting by IP (best-effort; no-op if KV not bound).
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';
      const rateLimitKey = `rate:${ip}:${Math.floor(Date.now() / 60000)}`;
      const current = await env.RATE_LIMIT?.get(rateLimitKey);
      const count = current ? parseInt(current) : 0;
      if (count >= RATE_LIMIT_PER_MIN) {
        return jsonResponse({ error: 'Rate limit exceeded. Please wait.' }, 429);
      }
      await env.RATE_LIMIT?.put(rateLimitKey, String(count + 1), { expirationTtl: 120 });

      if (url.pathname === '/api/analyze' && request.method === 'POST') {
        return handleAnalyze(request, env);
      }

      return jsonResponse({ error: 'Not found' }, 404);
    } catch (err) {
      return jsonResponse({ error: 'Internal error' }, 500);
    }
  },
};

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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-app-token',
  };
}
