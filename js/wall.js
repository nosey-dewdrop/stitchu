// Stitch wall: communal embroidery + guestbook seam.
// Backend present -> shared wall via Worker KV. Backend absent/unreachable ->
// honest local-only mode (stitches stay on this device, UI says so).
import { BACKEND_URL, THREADS } from './config.js';
import { drawRun, makeSewable } from './stitch.js';

const yourThread = THREADS[Math.floor(Math.random() * THREADS.length)];
let online = false;
let stitchCount = 0;

const wall = document.getElementById('wall-canvas');
const countEl = document.getElementById('stitch-count');
const notesEl = document.getElementById('notes');
const form = document.getElementById('note-form');
const input = document.getElementById('note-input');
const statusEl = document.getElementById('wall-status');

document.getElementById('your-thread-line').setAttribute('stroke', yourThread);

function setCount() {
  countEl.textContent = stitchCount === 1
    ? '1 stitch sewn by visitors'
    : `${stitchCount} stitches sewn by visitors`;
}

function noteRow(note) {
  const div = document.createElement('div');
  div.className = 'note';
  const mark = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  mark.setAttribute('width', '26');
  mark.setAttribute('height', '4');
  mark.innerHTML = `<line x1="0" y1="2" x2="26" y2="2" stroke="${note.color}" stroke-width="2" stroke-dasharray="6 4"/>`;
  div.appendChild(mark);
  const span = document.createElement('span');
  span.textContent = note.text; // textContent: user content never becomes HTML
  div.appendChild(span);
  return div;
}

async function api(path, options) {
  const res = await fetch(BACKEND_URL + path, options);
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'request failed');
  return res.json();
}

async function load() {
  const { width, height } = wall.getBoundingClientRect();
  if (!BACKEND_URL) {
    statusEl.textContent = 'the shared wall wakes up at launch — until then your stitches stay on this device';
    return;
  }
  try {
    const data = await api('/api/wall');
    for (const run of data.stitches) drawRun(wall, run, width, height);
    stitchCount = data.stitches.length;
    for (const note of data.notes.slice().reverse()) notesEl.appendChild(noteRow(note));
    online = true;
    setCount();
  } catch {
    statusEl.textContent = 'the wall is unreachable right now — your stitches stay on this device';
  }
}

makeSewable(wall, yourThread, async (points) => {
  stitchCount += 1;
  setCount();
  if (!online) return;
  try {
    await api('/api/wall/stitch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ color: yourThread, points }),
    });
  } catch { /* stitch stays local; next visitor load just won't include it */ }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  if (online) {
    try {
      await api('/api/wall/note', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ color: yourThread, text }),
      });
    } catch (err) {
      statusEl.textContent = err.message === 'Keep it kind' ? 'keep it kind' : 'could not stitch the note, try later';
      return;
    }
  }
  notesEl.prepend(noteRow({ color: yourThread, text }));
  input.value = '';
});

load();
setCount();
