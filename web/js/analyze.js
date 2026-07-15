// Photo -> garment spec via the Worker (Claude vision behind our proxy).
// Downscales client-side so no full-resolution photo ever leaves the device.
import { BACKEND_URL } from './config.js?v=41';

export const photoAvailable = () => Boolean(BACKEND_URL);

// Returns a data-URL-free base64 JPEG, longest edge capped at 1024 px.
async function downscale(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
  return dataUrl.slice(dataUrl.indexOf(',') + 1);
}

// Returns {spec fields..., details} or throws with a user-safe message.
export async function analyzePhoto(file) {
  const image = await downscale(file);
  const res = await fetch(BACKEND_URL + '/api/analyze', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ image, mediaType: 'image/jpeg' }),
  });
  if (res.status === 403) throw new Error('Photo analysis opens at launch — pick the garment below for now.');
  if (res.status === 429) throw new Error('Too many photos right now — try again in a minute.');
  if (!res.ok) throw new Error('The photo could not be analyzed — pick the garment below instead.');

  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('The photo could not be analyzed — pick the garment below instead.');
  let parsed;
  try {
    parsed = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
  } catch {
    throw new Error('The photo could not be analyzed — pick the garment below instead.');
  }
  if (!['skirt', 'dress', 'top'].includes(parsed.garment)) {
    throw new Error("That looks like something I can't draft yet (I do skirts, dresses and tops) — pick below.");
  }
  return parsed;
}
