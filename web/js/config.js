// Public frontend config. The Worker URL is not a secret (the wall endpoints
// are public and the app token never ships to the browser). Empty backend =
// local-only mode: the wall still works on this device and says so honestly.
export const BACKEND_URL = 'https://stitchu-api.damummyphus.workers.dev'; // e.g. 'https://stitchu-proxy.<account>.workers.dev' after wrangler deploy

// Cloudflare Turnstile site key. PUBLIC by design — the secret half lives only
// as a wrangler secret on the Worker. This is G1 layer 2: photo analysis spends
// Anthropic money on every call, and before 27 Aug 2026 any curl in the world
// could spend it (measured: POST /api/analyze answered the body validator to a
// request with no Origin header at all). Origin alone cannot fix that, because
// curl forges Origin in one line; a Turnstile token it cannot forge.
//
// EMPTY = photo analysis is OFF in the UI. That is deliberate and it is the
// safe direction: an unconfigured key hides the feature instead of shipping an
// unprotected wallet. The Worker refuses too, independently.
//
// To turn it on: Cloudflare dashboard -> Turnstile -> Add widget (Invisible),
// paste the site key here and `npx wrangler secret put TURNSTILE_SECRET`.
// Cloudflare's always-passes TEST pair, for gate runs only:
//   site 1x00000000000000000000AA / secret 1x0000000000000000000000000000000AA
export const TURNSTILE_SITE_KEY = '';

export const THREADS = ['#3EB8AF', '#C4767B', '#B8963E', '#7A8450', '#3E5C76', '#7E5A75'];
