// Photo -> garment spec via the Worker (Claude vision behind our proxy).
// Downscales client-side so no full-resolution photo ever leaves the device.
import { BACKEND_URL, TURNSTILE_SITE_KEY } from './config.js?v=152';

// Both halves must be configured. Without a Turnstile site key the Worker will
// refuse the call anyway (G1), so offering the button would be a lie — the
// garment pickers below are the honest path until the key is set.
export const photoAvailable = () => Boolean(BACKEND_URL) && Boolean(TURNSTILE_SITE_KEY);

// ---- G1 layer 2: prove a browser is asking ---------------------------------
//
// An invisible Turnstile widget, rendered once, executed per analysis. Tokens
// are single-use and expire in ~300s, so a fresh one is minted for every photo
// rather than cached. If anything here fails we throw rather than calling the
// Worker without a token: a refusal the user can read beats a 403 they cannot.
//
// ⚠ THE ONE THING ABOUT CLOUDFLARE'S API THAT COST US THE WHOLE PHOTO PATH
// (measured 2026-09-04 in real Chrome against the always-pass test sitekey;
// the gate that now holds it is engine/tests/foto_yolu_check.mjs):
//
//   `turnstile.execute()` RETURNS NOTHING. Not a promise — `undefined`.
//   Read it in their own minified api.js: every branch of `execute:function`
//   ends in a bare `return;`. The old code here did `.execute(...).then(...)`,
//   so the FIRST thing every photo upload did was throw
//   "Cannot read properties of undefined (reading 'then')" — a raw stack
//   fragment on the buyer's screen, and zero requests to /api/analyze.
//   The token arrives through the `callback` option of render(), nowhere else.
//
// So: render once WITH callbacks, and route each execute() into the deferred
// that is waiting for it.
//
// (The host is parked offscreen rather than display:none. An early probe said
// a hidden host never solves; a mutation of the gate DISPROVED that — with the
// callback wiring it solves either way. Offscreen is kept because it costs
// nothing, but it is not load-bearing and no gate asserts it.)
let turnstileWidget = null;
let turnstilePending = null; // { resolve, reject } of the execute() in flight

function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve();
  const existing = document.querySelector('script[data-turnstile]');
  if (existing) return existing._loading;
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.async = true;
  script.defer = true;
  script.dataset.turnstile = '1';
  script._loading = new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = () => reject(new Error('Verification could not load, pick the garment below instead.'));
  });
  document.head.appendChild(script);
  return script._loading;
}

// Every exit from the widget lands here, so a late callback after a timeout
// cannot resolve a promise the caller already gave up on.
function settleTurnstile(err, token) {
  const pending = turnstilePending;
  turnstilePending = null;
  if (!pending) return;
  clearTimeout(pending.timer);
  if (err) pending.reject(err);
  else pending.resolve(token);
}

const VERIFY_FAILED = () => new Error('Verification failed, pick the garment below instead.');

async function turnstileToken() {
  await loadTurnstileScript();
  if (!window.turnstile || typeof window.turnstile.render !== 'function') {
    throw new Error('Verification could not load, pick the garment below instead.');
  }
  if (turnstileWidget === null) {
    const host = document.createElement('div');
    // NOT display:none — see the note above; a hidden widget never solves.
    host.style.cssText = 'position:absolute;left:-9999px;top:0;width:300px;height:65px;';
    host.setAttribute('aria-hidden', 'true');
    document.body.appendChild(host);
    const id = window.turnstile.render(host, {
      sitekey: TURNSTILE_SITE_KEY,
      size: 'invisible',
      callback: (token) => settleTurnstile(null, token),
      'error-callback': () => { settleTurnstile(VERIFY_FAILED()); return true; },
      'expired-callback': () => settleTurnstile(VERIFY_FAILED()),
      'timeout-callback': () => settleTurnstile(
        new Error('Verification timed out, pick the garment below instead.'),
      ),
    });
    // render() returns undefined when it refuses (bad sitekey, wrong hostname,
    // blocked frame). Leaving turnstileWidget null makes the NEXT photo retry
    // the render instead of executing a widget that does not exist.
    if (id === undefined || id === null) {
      host.remove();
      throw new Error('Verification could not start here, pick the garment below instead.');
    }
    turnstileWidget = id;
  } else {
    // A widget holds one token at a time; reset before asking for the next.
    window.turnstile.reset(turnstileWidget);
  }
  if (turnstilePending) settleTurnstile(VERIFY_FAILED());
  return new Promise((resolve, reject) => {
    turnstilePending = {
      resolve,
      reject,
      timer: setTimeout(
        () => settleTurnstile(new Error('Verification timed out, pick the garment below instead.')),
        20000,
      ),
    };
    try {
      window.turnstile.execute(turnstileWidget, { size: 'invisible' });
    } catch {
      settleTurnstile(VERIFY_FAILED());
    }
  });
}

// Downscales once; the SAME canvas feeds both consumers: the base64 JPEG for
// the label read (Worker) and the raw RGBA pixels for the deterministic ratio
// measurement (measure.js, oran kablosu 2026-07-27). Longest edge 1024 px.
async function downscale(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
  return { image: dataUrl.slice(dataUrl.indexOf(',') + 1), pixels };
}

// Returns { reading: {spec fields..., details}, pixels: ImageData } or throws
// with a user-safe message. `pixels` is the exact canvas the Worker saw, so
// the caller can measure ratios from the same image the labels came from.
export async function analyzePhoto(file) {
  const { image, pixels } = await downscale(file);
  const token = await turnstileToken();
  const res = await fetch(BACKEND_URL + '/api/analyze', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ image, mediaType: 'image/jpeg', turnstileToken: token }),
  });
  if (res.status === 403) throw new Error('Photo analysis opens at launch, pick the garment below for now.');
  // 429 is now two different sentences: the per-IP fuse ("slow down") and the
  // global daily spend cap ("the wallet is closed until tomorrow"). Telling the
  // visitor to retry in a minute when the cap is what fired would be a lie.
  if (res.status === 429) {
    let paused = false;
    try { paused = (await res.clone().json())?.error === 'analysis_paused'; } catch { /* body not JSON */ }
    throw new Error(paused
      ? 'Photo reading is closed for today, pick the garment below instead.'
      : 'Too many photos right now, try again in a minute.');
  }
  if (!res.ok) throw new Error('The photo could not be analyzed, pick the garment below instead.');

  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('The photo could not be analyzed, pick the garment below instead.');
  let parsed;
  try {
    parsed = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
  } catch {
    throw new Error('The photo could not be analyzed, pick the garment below instead.');
  }
  if (!['skirt', 'dress', 'top'].includes(parsed.garment)) {
    throw new Error("That looks like something I can't draft yet (I do skirts, dresses and tops), pick below.");
  }
  return { reading: parsed, pixels };
}

// ---- AL DENE: A BANKED PHOTO (GECE7 / F8, §3.9) ---------------------------
//
// The "al dene" page walks a stranger through ten REAL photographs without
// spending a cent. It can do that because the expensive half of the pipeline —
// the vision LABELS — was paid for once and banked in vision/eval (the same
// fixture engine/tests/hedef_kosu.mjs runs the ratchet against), while the other
// half is not expensive at all.
//
// ⭐ AND THE OTHER HALF STILL RUNS FOR REAL. This function does the identical
// downscale the paid path does and returns the identical `pixels`, so
// measure.js measures the visitor's actual canvas rather than replaying a
// number. What is replayed is exactly what was bought: the labels.
//
// ⚠ SO THE HONEST DESCRIPTION OF THE PAGE IS NOT "a live demo" and it is not
// "screenshots" either: the drafting, the flat, the guide, the cut plan, the
// notches, the DXF and both PDFs are all computed in front of the visitor from
// the photograph's own measured proportions. Only the sentence "this garment is
// a sleeveless A-line dress with a keyhole" is a recording.
export async function analyzeBankedPhoto(url, banked) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('That example image could not be loaded.');
  const blob = await res.blob();
  const { pixels } = await downscale(blob);
  if (!banked || !['skirt', 'dress', 'top'].includes(banked.garment)) {
    throw new Error('That example is not one this engine drafts.');
  }
  // A COPY. The caller mutates the reading (applyMeasuredRatios writes into it),
  // and the banked record is shared across a page that may draft twice.
  return { reading: JSON.parse(JSON.stringify(banked)), pixels };
}
