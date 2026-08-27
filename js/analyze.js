// Photo -> garment spec via the Worker (Claude vision behind our proxy).
// Downscales client-side so no full-resolution photo ever leaves the device.
import { BACKEND_URL } from './config.js?v=141';

export const photoAvailable = () => Boolean(BACKEND_URL);

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
  const res = await fetch(BACKEND_URL + '/api/analyze', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ image, mediaType: 'image/jpeg' }),
  });
  if (res.status === 403) throw new Error('Photo analysis opens at launch, pick the garment below for now.');
  if (res.status === 429) throw new Error('Too many photos right now, try again in a minute.');
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
