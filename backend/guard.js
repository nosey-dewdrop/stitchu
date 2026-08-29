// guard.js — G1 (KOSU-v8): the three layers that stand between a stranger and
// Damla's Anthropic bill. PURE: no WASM import, no Worker globals beyond fetch,
// so the whole fuse is drivable from plain node. That is the same split
// spec-core.js already uses, and it exists for the same reason — a guard that
// cannot be tested is a guard nobody has checked.
//
// ---- WHAT WAS MEASURED, 27 Aug 2026, on the live Worker, before this file ---
//
//   POST /api/analyze  Origin: https://evil.example.com   -> 400 "Invalid request"
//   POST /api/analyze  Origin: https://stitchu.nosey...   -> 400 "Invalid request"
//   POST /api/analyze  (no Origin header at all, curl)    -> 400 "Invalid request"
//   OPTIONS /api/analyze                                  -> access-control-allow-origin: *
//
// 400 is the BODY validator in handleAnalyze. Reaching it means the request had
// already passed every gate that existed. There was no origin logic anywhere in
// worker.js. PUBLIC_ANALYZE was "on" and committed. The only brake was 3/min +
// 15/day per IP, so a rotating IP spent without limit, and nothing counted the
// total. KOSU-v8 § G1 described this as "the Worker returns 400 to the site's
// Origin, i.e. it accepts and validates the request"; the truth was broader —
// there was no Origin logic to describe.
//
// ---- WHY THREE LAYERS AND NOT ONE ------------------------------------------
//
// KOSU-v8 § G1 prescribed "turn the Origin check into a rejection". That alone
// would NOT have closed the leak, and shipping it as a green gate would have
// repeated the exact v7 failure v8 was written to end. Origin is a header the
// browser is trusted to set; `curl -H 'Origin: https://stitchu...'` forges it in
// one line. The traffic that can drain the wallet today is not a browser.
//
//   1. originAllowed        stops another SITE's page. Not curl. Cheap filter.
//   2. turnstilePassed      stops curl. This is the layer that actually closes
//                           the leak. Fails closed with no secret bound.
//   3. spendBudgetExhausted stops EVERYTHING, including a defeat of 1 and 2.
//                           One global counter, tier-blind, bounds the bill.
//
// Layer 3 is the only one whose guarantee does not depend on the caller being
// honest about who they are. It is the number that lets Damla sleep.

// The site is live from TWO addresses: the Vercel/custom domain and the GitHub
// Pages origin, which was measured HTTP 200 on 17 Aug serving the same bytes
// (CLAUDE.md § CANLI + DEPLOY). Dropping either 403s real visitors.
export const ALLOWED_ORIGINS = new Set([
  'https://stitchu.noseydewdrop.com',
  'https://nosey-dewdrop.github.io',
]);

// A bill ceiling, not a usage target. Opus vision on a ~1024px JPEG is not
// cheap. Raise deliberately for a benchmark run:
//   npx wrangler deploy --var DAILY_ANALYZE_CAP:1000
export const DEFAULT_DAILY_CAP = 300;

const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Layer 1. No Origin header at all is a REFUSAL on the public tier, not a pass:
// the public tier exists for our own web page and nothing else. A paying API
// customer sends x-app-token and never reaches this check.
export function originAllowed(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  // Local development only, opt-in per deploy, never set in production.
  return Boolean(env.DEV_ORIGIN) && origin === env.DEV_ORIGIN;
}

// Layer 2. Returns true ONLY on an affirmative verdict from Cloudflare. A
// missing secret, a network failure, a non-200, a malformed answer and a
// missing token are all refusals — every unknown resolves toward the closed
// door, because the alternative is an open wallet.
export async function turnstilePassed(token, env, ip, fetchImpl = fetch) {
  if (!env.TURNSTILE_SECRET) return false;
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) return false;
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET);
  form.append('response', token);
  if (ip && ip !== 'unknown') form.append('remoteip', ip);
  try {
    const res = await fetchImpl(TURNSTILE_VERIFY, { method: 'POST', body: form });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.success === true;
  } catch {
    return false;
  }
}

// Layer 3, the wallet. ONE counter, incremented immediately before every call
// that reaches api.anthropic.com, whatever tier asked for it — a benchmark run
// spends the same money a stranger's upload does, so it is counted the same.
// Fails CLOSED when the KV store is missing: an UNCOUNTED spend is the bug this
// file exists to end, so "I cannot count" must mean "you cannot spend".
export async function spendBudgetExhausted(env, now = Date.now()) {
  if (!env.RATE_LIMIT) return true;
  const cap = parseInt(env.DAILY_ANALYZE_CAP || '', 10) || DEFAULT_DAILY_CAP;
  const key = `spend:${Math.floor(now / 86400000)}`;
  const current = await env.RATE_LIMIT.get(key);
  const count = current ? parseInt(current, 10) : 0;
  if (count >= cap) return true;
  await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: 172800 });
  return false;
}

// The single exit for every response. Reflects the caller's Origin only when it
// is one of ours; an unrecognised origin gets NO Access-Control-Allow-Origin
// header at all, so the browser refuses to hand the body to the calling page.
// Deciding this in exactly one place is what keeps it from drifting back to '*'.
export function withCors(response, request, env) {
  const origin = request.headers.get('Origin');
  const headers = new Headers(response.headers);
  if (origin && (ALLOWED_ORIGINS.has(origin) || (env.DEV_ORIGIN && origin === env.DEV_ORIGIN))) {
    headers.set('Access-Control-Allow-Origin', origin);
  }
  headers.set('Vary', 'Origin');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, x-app-token, x-sb-bench');
  return new Response(response.body, { status: response.status, headers });
}
