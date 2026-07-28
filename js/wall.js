// Stitch wall: communal embroidery + guestbook seam.
// Backend present -> shared wall via Worker KV. Backend absent/unreachable ->
// honest local-only mode (stitches stay on this device, UI says so).
import { BACKEND_URL, THREADS } from './config.js?v=132';
import { applyStatic, mountLangToggle, t } from './i18n.js?v=132';
import { drawRun, makeSewable } from './stitch.js?v=132';

applyStatic();
mountLangToggle();

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
  countEl.textContent = stitchCount === 1 ? t('wall.count1') : t('wall.count', { n: stitchCount });
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
    statusEl.textContent = t('wall.localmode');
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
    statusEl.textContent = t('wall.unreachable');
  }
}

// stitch style picker (running / zigzag / hearts)
let currentKind = 'run';
for (const button of document.querySelectorAll('.wall-meta .kind')) {
  button.addEventListener('click', () => {
    currentKind = button.dataset.kind;
    for (const b of document.querySelectorAll('.wall-meta .kind')) {
      b.setAttribute('aria-pressed', String(b === button));
    }
  });
}

makeSewable(wall, yourThread, async (run) => {
  stitchCount += 1;
  setCount();
  if (!online) return;
  try {
    await api('/api/wall/stitch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ color: yourThread, kind: run.kind, points: run.points }),
    });
  } catch { /* stitch stays local; next visitor load just won't include it */ }
}, () => currentKind);

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
      statusEl.textContent = err.message === 'Keep it kind' ? t('wall.keepkind') : t('wall.notefail');
      return;
    }
  }
  notesEl.prepend(noteRow({ color: yourThread, text }));
  input.value = '';
});

load();
setCount();
