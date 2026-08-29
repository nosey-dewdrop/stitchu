// Cloudflare Worker - Anthropic proxy for Stitchu garment analysis.
// The app never holds the Anthropic key; it calls this Worker with a shared
// app token. The real key lives as a Cloudflare secret (see DEPLOY.md).
//
// Deploy:  npx wrangler deploy
// Secrets: npx wrangler secret put CLAUDE_API_KEY   (your sk-ant- key)
//          npx wrangler secret put APP_TOKEN         (any long random string)

import { handleDraft, handleGrade } from './draft.js';
// G1 (KOSU-v8) — the wallet fuse. Kept in a WASM-free module so the whole
// guard is drivable from plain node; see guard.js for what was measured and
// why the Origin check alone would not have closed the leak.
import {
  originAllowed, turnstilePassed, spendBudgetExhausted, withCors,
} from './guard.js';

const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';
// Vision-capable current model (default teacher).
const MODEL = 'claude-opus-4-8';
// Internal-only model override whitelist. Our own mining/anchor tool may ask for
// a cheaper teacher (e.g. Sonnet) via the x-sb-model header, but ONLY on the
// authenticated bench-bypass path (see handleAnalyze) — a public caller can
// never pick the model. Whitelist keeps it to known vision-capable ids.
const MODEL_WHITELIST = new Set(['claude-opus-4-8', 'claude-sonnet-4-6', 'claude-haiku-4-5']);
const RATE_LIMIT_PER_MIN = 20;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }), request, env);
    }
    // Every answer leaves through withCors, so the reflected Access-Control
    // header is decided in exactly ONE place and can never drift back to '*'.
    return withCors(await route(request, env), request, env);
  },
};

async function route(request, env) {
  {
    const url = new URL(request.url);
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';

    // Our own benchmark tool holds the BENCH_BYPASS secret and calls from a
    // terminal, so it has no Origin and no app token. It is authenticated by
    // the secret itself, which is stronger than either, and it still pays the
    // daily spend cap like everyone else.
    const bypass = !!env.BENCH_BYPASS && matchesSecret(
      request.headers.get('x-sb-bench') || '', env.BENCH_BYPASS);

    try {
      // G1: the public tier is the web app's tier. A caller with no app token
      // asking for a public endpoint must come from one of our own pages. This
      // is the cheap filter, not the fuse — see the ALLOWED_ORIGINS comment.
      if (!request.headers.get('x-app-token') && !bypass &&
          url.pathname.startsWith('/api/') &&
          !originAllowed(request, env)) {
        return withCors(jsonResponse({ error: 'forbidden_origin' }, 403), request, env);
      }
      // ---- Public stitch wall: no app token — a public web page cannot keep
      // a secret. Guarded by strict rate limits + validation. The landing
      // dropped the wall (party trick later), so the endpoints sleep behind
      // PUBLIC_WALL until a client actually uses them — no client, no public
      // write surface.
      if (url.pathname.startsWith('/api/wall') && env.PUBLIC_WALL !== 'on') {
        return jsonResponse({ error: 'The wall is asleep' }, 403);
      }
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

      // ---- API waitlist: a real, throttled email capture for the B2B API.
      // Public (a browser can't hold a secret), hard rate-limited, stored in KV
      // as an append-only JSON list capped so it can't grow unbounded.
      if (url.pathname === '/api/waitlist' && request.method === 'POST') {
        if (await rateLimited(env, `wait:${ip}`, 3)) {
          return jsonResponse({ error: 'rate_limited' }, 429);
        }
        return handleWaitlist(request, env);
      }

      // ---- Pattern draft: the OWN-engine API core. No LLM cost, so it can be
      // public and generous. The web app (a browser that cannot keep a secret)
      // hits it without a token, throttled per IP; a paying API customer sends
      // their app token for the higher, un-throttled tier. Same handler, same
      // engine — only the rate limit differs by who is calling.
      if (url.pathname === '/api/draft' && request.method === 'POST' &&
          !request.headers.get('x-app-token')) {
        if (env.PUBLIC_DRAFT !== 'on') {
          return jsonResponse({ error: 'draft_closed', detail: 'The public draft API is not open yet' }, 403);
        }
        // Fail closed if the rate-limit KV is missing: the ONLY reason the public
        // tier is open is that it is throttled, so an un-throttled public tier is
        // never intended. (A configured deploy always has RATE_LIMIT bound.)
        if (!env.RATE_LIMIT) {
          return jsonResponse({ error: 'draft_closed', detail: 'The public draft API is temporarily unavailable' }, 503);
        }
        if (await rateLimited(env, `pubdraft:${ip}`, 20) ||
            await rateLimitedDaily(env, `pubdraftday:${ip}`, 200)) {
          return jsonResponse({ error: 'rate_limited', detail: 'Rate limit exceeded. Please wait.' }, 429);
        }
        // handleDraft re-checks the real body size; this header check is a cheap
        // early reject only.
        const { status, payload } = await handleDraft(request);
        return jsonResponse(payload, status);
      }

      // ---- Grade: one design across a size run. Same zero-LLM engine as draft,
      // but one call fans out to up to 10 drafts, so it is throttled harder on
      // the public tier and gated by the same PUBLIC_DRAFT switch.
      if (url.pathname === '/api/grade' && request.method === 'POST' &&
          !request.headers.get('x-app-token')) {
        if (env.PUBLIC_DRAFT !== 'on') {
          return jsonResponse({ error: 'draft_closed', detail: 'The public draft API is not open yet' }, 403);
        }
        if (!env.RATE_LIMIT) {
          return jsonResponse({ error: 'draft_closed', detail: 'The public draft API is temporarily unavailable' }, 503);
        }
        if (await rateLimited(env, `pubgrade:${ip}`, 6) ||
            await rateLimitedDaily(env, `pubgradeday:${ip}`, 60)) {
          return jsonResponse({ error: 'rate_limited', detail: 'Rate limit exceeded. Please wait.' }, 429);
        }
        const { status, payload } = await handleGrade(request);
        return jsonResponse(payload, status);
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
        // `bypass` is the run-wide check made at the top of route(): our own
        // benchmark tool (engine/tools/benchmark-58.mjs) proves itself with the
        // BENCH_BYPASS secret, which lives only as a wrangler secret and in a
        // gitignored local file. It skips the per-IP fuse and Turnstile — it is
        // not a browser and cannot solve a challenge — but NOT the spend cap.
        if (!bypass &&
            (await rateLimited(env, `puban:${ip}`, 3) ||
             await rateLimitedDaily(env, `pubanday:${ip}`, 15))) {
          return jsonResponse({ error: 'Rate limit exceeded. Please wait.' }, 429);
        }
        const length = parseInt(request.headers.get('content-length') || '0');
        if (length > 2_800_000) {
          return jsonResponse({ error: 'Image too large' }, 413);
        }
        // The body is parsed HERE, once, because the Turnstile token rides in it
        // and a Request body can only be read a single time. handleAnalyze takes
        // the parsed object rather than re-reading the stream.
        let body;
        try { body = await request.json(); } catch {
          return jsonResponse({ error: 'Invalid request' }, 400);
        }
        // G1 layer 2 — the one curl cannot forge. Checked BEFORE the spend cap
        // is decremented so a flood of unverified callers cannot burn the day's
        // budget just by being refused.
        if (!bypass && !(await turnstilePassed(body?.turnstileToken, env, ip))) {
          return jsonResponse({
            error: 'verification_failed',
            detail: 'Could not verify this request came from a browser.',
          }, 403);
        }
        // G1 layer 3 — the wallet. Counted for the bench tool too.
        if (await spendBudgetExhausted(env)) {
          return jsonResponse({
            error: 'analysis_paused',
            detail: "Photo analysis has hit today's limit. Pick the garment below instead.",
          }, 429);
        }
        // A model override is honoured ONLY when the bench bypass proved this is
        // our own internal tool (never for a public user). Falls back to MODEL.
        const overrideModel = bypass ? pickModel(request.headers.get('x-sb-model')) : null;
        return handleAnalyze(request, env, overrideModel, body);
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
        // The app token proves WHO is calling; it does not make the call free.
        // The wallet fuse is deliberately tier-blind — see spendBudgetExhausted.
        if (await spendBudgetExhausted(env)) {
          return jsonResponse({ error: 'analysis_paused' }, 429);
        }
        return handleAnalyze(request, env, pickModel(request.headers.get('x-sb-model')));
      }
      if (url.pathname === '/api/draft' && request.method === 'POST') {
        const { status, payload } = await handleDraft(request);
        return jsonResponse(payload, status);
      }
      if (url.pathname === '/api/grade' && request.method === 'POST') {
        const { status, payload } = await handleGrade(request);
        return jsonResponse(payload, status);
      }

      return jsonResponse({ error: 'Not found' }, 404);
    } catch (err) {
      return jsonResponse({ error: 'Internal error' }, 500);
    }
  }
}

// Constant-length, constant-time-ish secret compare. Returns false immediately
// on a length mismatch (length is not secret), otherwise XORs every byte so the
// loop runs the full width regardless of where a mismatch is — no early-out that
// could leak position via timing. Never logs either value.
function matchesSecret(given, expected) {
  if (typeof given !== 'string' || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

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
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Resolve a requested model header to a whitelisted id, else null (use default).
function pickModel(requested) {
  return requested && MODEL_WHITELIST.has(requested) ? requested : null;
}

// `preParsed` is supplied by the public path, which had to read the body itself
// to reach the Turnstile token (a Request body reads once). The authenticated
// path passes nothing and this reads the stream as before.
async function handleAnalyze(request, env, overrideModel = null, preParsed = null) {
  let body = preParsed;
  if (!body) {
    try { body = await request.json(); } catch {
      return jsonResponse({ error: 'Invalid request' }, 400);
    }
  }
  const imageBase64 = body.image;
  const mediaType = IMAGE_TYPES.includes(body.mediaType) ? body.mediaType : 'image/jpeg';
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return jsonResponse({ error: 'Invalid request' }, 400);
  }

  const prompt = `You are a couture pattern-cutter reading a garment for sewing-pattern drafting. The photo is often a RUNWAY or EDITORIAL shot — a model in a dramatic pose, strong styling, theatrical lighting, a busy background, accessories, a train or a cape. Read only the GARMENT's construction; ignore the pose, the model, the lighting, the background, the hair/jewellery, and any styling drama. A cape, train, veil, gloves or overlay is STYLING, not the base garment — draft the dress/top/skirt underneath. Respond with ONLY a JSON object, no prose:
{"garment": "skirt" | "dress" | "top" | "trousers" | "other",
 "neckline": "crew" | "scoop" | "vNeck" | "square" | "boat" | "sweetheart" | "halter" | "cowl" | "pussyBow" | null (sweetheart = heart-shaped decollete: a notch/dip at center front with rounded lobes arcing over the bust; halter = straps rise from the front and wrap/tie behind the NECK, shoulders fully bare — a halter is always sleeveless, report sleeveStyle "none"; cowl = a soft, wide, DRAPED front neck where the fabric falls in loose horizontal folds across the chest — a cowl, not a crisp cut edge; pussyBow = a high neck band with a long fabric tie knotted into a BOW at the throat, report the bow),
 "sleeveStyle": "none" | "straight" | "balloon" | null (balloon covers puff/bishop/gathered sleeves),
 "sleeveLength": "short" | "elbow" | "long" | null,
 "skirtStyle": "aLine" | "straight" | "gathered" | "halfCircle" | "pleated" | null (halfCircle covers full/flared circle skirts; pleated covers knife/box pleats),
 "length": "mini" | "midi" | "maxi" | null (hem length relative to the BODY: mini = above the knee, midi = knee to mid-calf, maxi = ankle or floor; evening gowns, bridal gowns and any floor-sweeping dress are ALWAYS maxi),
 "topLength": "cropped" | "hip" | "tunic" | null (only for tops),
 "shaping": "princess" | "dart" | null (princess = vertical seams running over the bust or down the skirt panels; dart = visible stitched darts at waist/bust with no vertical panel seams; null if the waist shaping is not visible),
 "waistline": "natural" | "empire" | null (empire = the waist seam sits right under the bust, e.g. babydoll dresses; natural = seam at the natural waist; null if no waist seam is visible),
 "fabric": "woven" | "knit" | null (knit = visibly stretchy jersey/rib knit; woven = crisp non-stretch like poplin, denim, satin; null if unclear),
 "hemRuffle": "none" | "single" | "tiered" | null (single = ONE gathered ruffle/flounce strip at the hem; tiered = the skirt cascades in TWO OR MORE stacked gathered layers, each tier fuller than the one above — layered ruffle gowns count; none = plain hem),
 "keyhole": true | false | null (true = an enclosed teardrop/round CUT-OUT opening in the fabric below the front neckline, its edges fully closed; a plunge or open V that reaches the neckline edge is NOT a keyhole),
 "fabricName": "cotton poplin" | "linen" | "viscose" | "satin" | "jersey" | "chiffon" | "denim" | "wool" | "lace" | "tulle" | "brocade" | "leather" | "other" | null (best guess of the MAIN fashion fabric),
 "closure": {"type": "buttons" | "placket" | "zipper" | "ties" | "lace-up" | "hookEye" | "none", "location": "centerFront" | "centerBack" | "sideSeam" | "shoulder" | "neck" | "waist" | null} | null (how the garment opens/fastens; "placket" = a buttoned strip/band, usually center front like a shirt; "ties" = fabric ties or a bow that knot closed, e.g. a back waist bow, a front drawstring, a neck bow; "lace-up" = a corset-style laced opening through eyelets/loops; report null if no closure is visible),
 "collar": {"type": "none" | "stand" | "shirt" | "peterPan" | "mandarin" | "notched" | "sailor" | "other", "name": "one short label, e.g. 'pointed shirt collar' or 'rounded peter pan'"} | null (a SEWN collar band/piece around the neckline, distinct from the neckline shape itself; null or type "none" if there is no collar),
 "straps": {"type": "none" | "shoulder" | "spaghetti" | "wide" | "halter" | "ruffled" | "oneShoulder" | "offShoulder", "count": 1 | 2 | null} | null (shoulder straps on a sleeveless bodice; "ruffled" = a strap made of a gathered frill — do NOT mistake a ruffled strap for a sleeve; "count" 1 for one-shoulder/halter, 2 for a normal pair),
 "cupSeams": true | false | null (true = the bust is shaped by SEPARATE cup pieces joined with a curved seam under/around each breast, as in a bra-cup bodice, corset or bustier; false = darts/princess only; null if not visible),
 "sleeveHead": "plain" | "gathered" | "puffed" | "capped" | null (the top of the sleeve where it meets the shoulder: "gathered"/"puffed" = fabric gathered into the armhole to stand up; "capped" = a very short cap sleeve just covering the shoulder; "plain" = a smooth set-in sleeve head; null if sleeveless),
 "yoke": {"type": "none" | "shoulderYoke" | "shirring" | "smocking", "location": "frontBodice" | "backBodice" | "shoulder" | "waist" | null} | null (a "yoke" = a separate top panel the rest gathers into; "shirring"/"smocking" = rows of elastic/gathered stitching creating a stretchy textured panel, common on a bust or back; null if none),
 "backDetail": "none" | "openBack" | "keyholeBack" | "vBack" | "tieBack" | "lacedBack" | "buttonBack" | null (a notable feature on the BACK: "openBack" = a bare cut-out back, "tieBack" = fabric ties/bow closing the back, "buttonBack" = a back button placket; null or "none" if the back is plain),
 "ratios": {"hemToWaistWidth": number | null, "lengthToWidth": number | null, "neckDepthToLength": number | null, "neckWidthToShoulder": number | null, "sleeveLenToGarment": number | null, "waistYToLength": number | null, "strapWidthToShoulder": number | null} (MEASURED proportions of the GARMENT itself — see the RATIOS rule below; every value is one garment measurement divided by another garment measurement, so flat-lay and worn photos read the same; null for any part that is not visible),
 "outOfVocab": ["short noun phrases for EVERY construction element you SEE that none of the fields above capture — e.g. 'peplum', 'patch pockets', 'box pleats at waist', 'asymmetric hem', 'cape overlay', 'ruffled sleeve cuff', 'drawstring waist', 'bust gathering panel'. This is the honesty channel: name what the pattern would need but the fields cannot express. Empty array [] if the structured fields already cover everything."],
 "details": "one sentence: any remaining notable construction not captured above (fabric guess, drape, finish)"}
Mapping rules — READ CAREFULLY, "garment" is the most important field:
- ALWAYS map to the closest of skirt / dress / top. If ANYTHING covers the torso and hangs from the shoulders (a gown, a robe, a kaftan, a qipao/cheongsam, a wrap dress, a tunic, a jumpsuit's top half, a draped or asymmetric one-piece), it is a "dress" (or a "top" if it clearly ends at/above the hip). If it covers the lower body only, it is a "skirt".
- "garment" must NEVER be null. Use "other" ONLY for things a dress/skirt/top pattern truly cannot start from: trousers/pants, shorts, structured tailored coats/blazers, swimwear, and accessories. When unsure between "other" and "dress", ALWAYS choose "dress" — a wearer can adjust a close silhouette, but "other" gives them nothing.
- NO GARMENT AT ALL: you STILL answer with ONLY the JSON object — never prose. If the image contains no garment (an app/UI screenshot, a document, a person with no readable clothing, an object), return garment "other" with every other field null and say what the image is in "details". A sheet of PATTERN PIECES laid out (individual cut shapes with grainlines/notches/seam allowances) or a hand-drawn instruction/tool doodle sheet is NOT a wearable garment photo — that is also garment "other"; a technical fashion FLAT of a whole garment (front/back drawing) DOES count as a garment and is read normally.
- If the garment is MORE complex than these fields allow (couture, layered, corseted, heavily draped, a wedding gown), do NOT give up — return the CLOSEST base silhouette and say exactly what you approximated in "details". Couture silhouette map: ball gown / princess gown -> dress + princess + natural + gathered or halfCircle + maxi; mermaid / fishtail / column / sheath gown -> dress + princess + natural + straight + maxi; A-line gown -> dress + aLine + maxi; fit-and-flare -> dress + natural + aLine; peplum or corseted bodice -> the bodice's shaping + the closest skirt. A strapless bodice with no visible neckline detail -> neckline null. A one-shoulder or asymmetric neck -> pick the closest of the seven and note it in "details".
- SLEEVE vs STRAP — do not confuse them. A SLEEVE wraps around and covers the upper arm (a tube of fabric the arm passes through). A STRAP is a narrow band over the shoulder on a SLEEVELESS bodice; the arm is bare. A gathered or FRILLED band over the shoulder with the arm bare is a RUFFLED STRAP, not a sleeve: set sleeveStyle "none", straps.type "ruffled", and add "ruffled straps" to outOfVocab. Only report a balloon/puff sleeve when fabric actually encircles the upper arm.
- BOAT vs SQUARE neckline — a BOAT (bateau) neckline is a WIDE, shallow, gently curved or nearly straight line running high across the collarbones from shoulder to shoulder, near the base of the neck. A SQUARE neckline drops LOWER with two sharp right-angle corners and a straight horizontal base well below the collarbone. If the line is high, wide and skims the shoulders, it is BOAT, not square.
- COLLAR vs NECKLINE — the neckline is the shape of the fabric EDGE at the neck; a collar is a SEPARATE band/piece sewn ON to that edge that stands up or folds over. Report both independently: a shirt with a pointed collar over a round opening is neckline "crew" AND collar.type "shirt".
- NECKLINE — decide it from the FRONT of the garment, and commit to ONE answer. The photo may be a BACK view, a worn/side/three-quarter shot, or a flat-lay; a single garment has ONE neckline, so do not let a back or worn photo invent a different neckline than the garment's front would show.
  * BACK / WORN VIEW: if the photo shows the garment from the BACK (you can see the back panel, a back opening, a bow at the nape, a back cut-out, or the model's back), you are NOT looking at the front neckline. A bow, tie, cut-out or opening at the NAPE is a BACK detail (report it in backDetail / closure / outOfVocab), NOT a halter and NOT a vNeck. Do not read the front neckline "square"/"vNeck"/"halter" off the back of a garment. If the front neckline is not actually visible, infer the most likely FRONT shape from the front collarbone/shoulder line, or return null — never guess an exotic neckline from back-only evidence.
  * HALTER is rare and specific: report "halter" ONLY when a band or strap clearly rises from the front bodice and wraps/ties AROUND the NECK with both shoulders fully bare (a halter is always sleeveless). A back bow, a back tie, or a keyhole/cut-out at the back is NOT a halter. When in doubt, it is NOT a halter.
  * DEFAULT TO THE COMMON SHAPE: most everyday dresses and tops are boat, crew or scoop. When the neckline is a plain, close, unremarkable curve or straight line across the top of the chest and you are not certain it is one of the dramatic shapes (square / vNeck / sweetheart / halter), choose the closest of {boat, crew, scoop} rather than reaching for a dramatic shape. Only report square/vNeck/sweetheart/halter when that shape is clearly and unambiguously visible from the FRONT.
  * Examples (words, not photos): a wide shallow line skimming the collarbones from shoulder to shoulder = boat. A plain rounded opening at the base of the neck = crew. A rounded opening dropping lower onto the chest = scoop. A back photo of a boat-neck dress with a bow at the nape = neckline "boat" (front shape) + the bow noted in backDetail/closure — NOT halter. A back cut-out with straps meeting at the neck seen from behind = still read the FRONT neckline (boat/crew/scoop or null), not "halter", and note the open back in backDetail.
- RATIOS — you are a pattern-cutter with a ruler on the photo: MEASURE, do not classify. Each ratio is one garment measurement divided by another garment measurement (never the model's body), so the numbers survive flat-lay, hanger and worn shots alike. Report what your eyes measure to two decimals — do NOT snap to the calibration anchors below, they only tell you the scale of each axis. If a measurement's endpoints are hidden (cropped hem, arms behind the back), return null for that ratio instead of guessing.
  * hemToWaistWidth = garment width at the HEM edge / garment width at the waist (or the narrowest point of the bodice-skirt join). Anchors: pencil/column ~1.0, gentle A-line ~1.4, full gathered or circle skirt 2.0-3.5.
  * lengthToWidth = total garment length (highest shoulder point to hem) / garment width at the bust line. Anchors: cropped top ~0.7, hip top ~1.1, mini dress ~1.6, midi ~2.2, maxi ~2.8+.
  * neckDepthToLength = vertical drop of the FRONT neckline (from the shoulder line to the neckline's lowest front point) / total garment length. Anchors: crew ~0.04, scoop ~0.09, deep V or plunge 0.15+.
  * neckWidthToShoulder = neck opening width / shoulder-to-shoulder width of the garment. Anchors: narrow crew ~0.35, scoop ~0.5, wide boat/bardot 0.75+.
  * sleeveLenToGarment = sleeve length along the arm / total garment length. Anchors: sleeveless 0, cap ~0.08, short ~0.2, elbow ~0.35, full ~0.55. Sleeveless garments report 0, not null.
  * waistYToLength = distance from the highest shoulder point down to the WAIST SEAM / total garment length. Anchors: empire ~0.22, natural ~0.35, dropped ~0.48. null if no waist seam is visible.
  * strapWidthToShoulder = width of one shoulder strap / shoulder-to-shoulder width. Anchors: spaghetti ~0.03, standard ~0.08, wide ~0.15. null when sleeved or strapless.`;

  const anthropicBody = {
    model: overrideModel || MODEL,
    max_tokens: 1100,
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

// Append-only API waitlist. Validates the email shape, caps the list, dedupes.
const WAITLIST_CAP = 5000;
async function handleWaitlist(request, env) {
  let body;
  try { body = await request.json(); } catch { return jsonResponse({ error: 'invalid_json' }, 400); }
  const email = (body && typeof body.email === 'string') ? body.email.trim().toLowerCase() : '';
  // Minimal but real email shape check.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return jsonResponse({ error: 'invalid_email' }, 422);
  }
  const note = (body && typeof body.note === 'string') ? body.note.slice(0, 40) : '';
  if (!env.RATE_LIMIT) return jsonResponse({ error: 'unavailable' }, 503); // KV is the store
  let list = [];
  const raw = await env.RATE_LIMIT.get('waitlist');
  if (raw) { try { list = JSON.parse(raw); } catch { list = []; } }
  if (!list.some((e) => e.email === email)) {
    list.push({ email, note, day: Math.floor(Date.now() / 86400000) });
    if (list.length > WAITLIST_CAP) list = list.slice(-WAITLIST_CAP);
    await env.RATE_LIMIT.put('waitlist', JSON.stringify(list));
  }
  return jsonResponse({ ok: true }, 200);
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

