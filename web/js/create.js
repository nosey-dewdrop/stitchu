// Create flow: measurements (one per screen) -> garment spec -> WASM draft ->
// result. Photo -> AI analysis joins this flow when the Worker URL is live;
// until then the spec picker IS the flow (same manual path the iOS app had).
import { analyzePhoto, photoAvailable } from './analyze.js';
import { draft } from './engine.js';
import { printPattern } from './print.js';
import { renderResult } from './render.js';
import {
  MEASUREMENTS, loadMeasurements, saveMeasurements, saveToCloset,
} from './store.js';

const screen = document.getElementById('screen');
const saved = loadMeasurements();
const values = { ...(saved || {}) };

const SPEC_GROUPS = [
  { key: 'garment', label: 'garment', options: [['skirt', 'skirt'], ['dress', 'dress'], ['top', 'top']], for: () => true },
  { key: 'neckline', label: 'neckline', options: [['crew', 'crew'], ['scoop', 'scoop'], ['vNeck', 'v-neck'], ['square', 'square'], ['boat', 'boat']], for: (s) => s.garment !== 'skirt' },
  { key: 'sleeveStyle', label: 'sleeves', options: [['none', 'sleeveless'], ['straight', 'straight'], ['balloon', 'balloon']], for: (s) => s.garment !== 'skirt' },
  { key: 'sleeveLength', label: 'sleeve length', options: [['short', 'short'], ['elbow', 'elbow'], ['long', 'long']], for: (s) => s.garment !== 'skirt' && s.sleeveStyle !== 'none' },
  { key: 'skirtStyle', label: 'skirt style', options: [['aLine', 'A-line'], ['straight', 'straight'], ['gathered', 'gathered'], ['halfCircle', 'half circle']], for: (s) => s.garment !== 'top' },
  { key: 'skirtLength', label: 'length', options: [['mini', 'mini'], ['midi', 'midi'], ['maxi', 'maxi']], for: (s) => s.garment !== 'top' },
  { key: 'topLength', label: 'top length', options: [['cropped', 'cropped'], ['hip', 'hip'], ['tunic', 'tunic']], for: (s) => s.garment === 'top' },
];
const spec = {
  garment: 'dress', neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short',
  skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function progressSeam(done, total) {
  const wrap = el('div', 'stepline');
  wrap.appendChild(el('span', 'hint', `${done} / ${total}`));
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 200 4');
  svg.setAttribute('preserveAspectRatio', 'none');
  const sewn = Math.round((done / total) * 200);
  svg.innerHTML =
    `<line x1="0" y1="2" x2="${sewn}" y2="2" stroke="#3EB8AF" stroke-width="2.4" stroke-dasharray="12 8" stroke-linecap="round"/>` +
    `<line x1="${sewn + 4}" y1="2" x2="200" y2="2" stroke="#d9d9d9" stroke-width="1.5" stroke-dasharray="6 6"/>`;
  wrap.appendChild(svg);
  return wrap;
}

// Measuring tape with the current value under the stitch marker (brand rule:
// sewing objects, never human figures).
function tapeSVG(value, min, max) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'tape');
  svg.setAttribute('viewBox', '0 0 340 110');
  const lo = Math.max(min, Math.floor(value) - 4);
  let inner = '<rect x="10" y="30" width="304" height="46" fill="none" stroke="#111" stroke-width="1.8"/>' +
              '<rect x="314" y="26" width="10" height="54" fill="none" stroke="#111" stroke-width="1.8"/>';
  for (let i = 0; i <= 8; i++) {
    const x = 26 + i * 36;
    const cm = lo + i;
    if (cm > max) break;
    const tall = cm % 2 === 0;
    inner += `<line x1="${x}" y1="30" x2="${x}" y2="${tall ? 56 : 48}" stroke="#111" stroke-width="1.4"/>`;
    if (tall) inner += `<text x="${x}" y="70" font-family="Helvetica" font-size="12" fill="#8a8a8a" text-anchor="middle">${cm}</text>`;
  }
  const mx = 26 + (value - lo) * 36;
  if (mx >= 10 && mx <= 324) {
    inner += `<line x1="${mx}" y1="12" x2="${mx}" y2="94" stroke="#3EB8AF" stroke-width="3" stroke-dasharray="9 6" stroke-linecap="round"/>`;
  }
  svg.innerHTML = inner;
  return svg;
}

function showMeasurement(index) {
  const m = MEASUREMENTS[index];
  screen.textContent = '';
  screen.appendChild(el('h1', 'screen-title', 'Your measurements'));
  screen.appendChild(el('p', 'screen-sub', 'Seven measurements, once — saved on this device only.'));
  screen.appendChild(progressSeam(index + 1, MEASUREMENTS.length));

  const block = el('div', 'measure-block');
  block.appendChild(el('div', 'measure-label', m.label));
  block.appendChild(el('div', 'measure-help', m.help));

  const initial = values[m.key] ?? '';
  let tape = tapeSVG(Number(initial) || m.min, m.min, m.max);
  block.appendChild(tape);

  const row = el('div', 'measure-row');
  const input = document.createElement('input');
  input.inputMode = 'decimal';
  input.value = initial;
  input.setAttribute('aria-label', `${m.label} in centimeters`);
  row.appendChild(input);
  row.appendChild(el('span', 'unit', 'cm'));
  block.appendChild(row);
  const error = el('div', 'field-error', '');
  block.appendChild(error);
  block.appendChild(el('p', 'privacy-note', 'Stored in this browser only. Nothing is uploaded.'));

  input.addEventListener('input', () => {
    const v = parseFloat(input.value.replace(',', '.'));
    if (!Number.isNaN(v)) {
      const fresh = tapeSVG(v, m.min, m.max);
      tape.replaceWith(fresh);
      tape = fresh;
    }
  });

  const nav = el('div', 'step-nav');
  if (index > 0) {
    const back = el('button', 'btn', 'Back');
    back.addEventListener('click', () => showMeasurement(index - 1));
    nav.appendChild(back);
  }
  const nextLabel = index === MEASUREMENTS.length - 1 ? 'Done — pick your garment' : `Next — ${MEASUREMENTS[index + 1].label.toLowerCase()}`;
  const next = el('button', 'btn primary', nextLabel);
  next.addEventListener('click', () => {
    const v = parseFloat(input.value.replace(',', '.'));
    if (Number.isNaN(v)) { error.textContent = 'Enter a number in centimeters.'; return; }
    if (v < m.min || v > m.max) {
      error.textContent = `That doesn't look like a ${m.label.toLowerCase()} in cm (expected ${m.min}–${m.max}).`;
      return;
    }
    values[m.key] = v;
    if (index === MEASUREMENTS.length - 1) {
      saveMeasurements(values);
      showSpec();
    } else {
      showMeasurement(index + 1);
    }
  });
  nav.appendChild(next);
  block.appendChild(nav);
  screen.appendChild(block);
  input.focus();
}

function showSpec() {
  screen.textContent = '';
  screen.appendChild(el('h1', 'screen-title', 'What are we sewing?'));
  const sub = el('p', 'screen-sub', 'Pick the garment; the pattern is drafted to your saved measurements. ');
  const edit = el('a', '', 'Edit measurements');
  edit.href = '#';
  edit.style.color = 'inherit';
  edit.addEventListener('click', (e) => { e.preventDefault(); showMeasurement(0); });
  sub.appendChild(edit);
  screen.appendChild(sub);

  // Photo path: upload -> AI reads the garment -> picks below get prefilled,
  // user confirms or fixes. Hidden entirely until the Worker is live.
  if (photoAvailable()) {
    const photoBlock = el('div', 'spec-group');
    photoBlock.style.marginTop = '30px';
    photoBlock.appendChild(el('div', 'group-label', 'or start from a photo'));
    const row = el('div', 'choice-row');
    const pick = el('button', 'choice', 'Upload a garment photo');
    const status = el('div', 'field-error', '');
    status.style.color = 'var(--gray)';
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*';
    file.style.display = 'none';
    pick.addEventListener('click', () => file.click());
    file.addEventListener('change', async () => {
      if (!file.files[0]) return;
      pick.disabled = true;
      status.textContent = 'Reading the garment…';
      try {
        const seen = await analyzePhoto(file.files[0]);
        spec.garment = seen.garment;
        if (seen.neckline) spec.neckline = seen.neckline;
        if (seen.sleeveStyle) spec.sleeveStyle = seen.sleeveStyle;
        if (seen.sleeveLength) spec.sleeveLength = seen.sleeveLength;
        if (seen.skirtStyle) spec.skirtStyle = seen.skirtStyle;
        if (seen.length) spec.skirtLength = seen.length;
        if (seen.topLength) spec.topLength = seen.topLength;
        status.textContent = (seen.details ? seen.details + ' — ' : '') + 'Check the picks below, fix anything I got wrong.';
        rebuild();
      } catch (err) {
        status.textContent = err.message;
      }
      pick.disabled = false;
    });
    row.appendChild(pick);
    photoBlock.appendChild(row);
    photoBlock.appendChild(file);
    photoBlock.appendChild(status);
    screen.appendChild(photoBlock);
  }

  const groups = el('div', 'spec-groups');
  groups.style.marginTop = '34px';

  function rebuild() {
    groups.textContent = '';
    for (const group of SPEC_GROUPS) {
      if (!group.for(spec)) continue;
      const g = el('div', 'spec-group');
      g.appendChild(el('div', 'group-label', group.label));
      const row = el('div', 'choice-row');
      for (const [value, label] of group.options) {
        const b = el('button', 'choice', label);
        b.setAttribute('aria-pressed', String(spec[group.key] === value));
        b.addEventListener('click', () => { spec[group.key] = value; rebuild(); });
        row.appendChild(b);
      }
      g.appendChild(row);
      groups.appendChild(g);
    }
  }
  rebuild();
  screen.appendChild(groups);

  const nav = el('div', 'step-nav');
  const go = el('button', 'btn primary', 'Draft my pattern');
  go.addEventListener('click', async () => {
    go.disabled = true;
    go.textContent = 'Drafting…';
    try {
      const result = await draft(spec, values);
      showResult(result);
    } catch (err) {
      go.disabled = false;
      go.textContent = 'Draft my pattern';
      alert('The engine failed to load. Refresh and try again.');
      console.error(err);
    }
  });
  nav.appendChild(go);
  screen.appendChild(nav);
}

function showResult(result) {
  screen.textContent = '';
  const head = el('div', 'result-head');
  head.appendChild(el('h1', 'screen-title', result.pattern.garment.charAt(0).toUpperCase() + result.pattern.garment.slice(1) + ', drafted for you.'));
  screen.appendChild(head);

  const body = el('div');
  screen.appendChild(body);
  renderResult(body, result);

  const nav = el('div', 'step-nav');
  const again = el('button', 'btn', 'Change garment');
  again.addEventListener('click', showSpec);
  nav.appendChild(again);
  if (!result.issues.length) {
    const save = el('button', 'btn', 'Save to closet');
    save.addEventListener('click', () => {
      saveToCloset({ spec: { ...spec }, result });
      window.location.href = 'closet.html';
    });
    nav.appendChild(save);
    const print = el('button', 'btn primary', 'Print — true scale A4');
    print.addEventListener('click', () => printPattern(result));
    nav.appendChild(print);
  }
  screen.appendChild(nav);
}

// Entry: returning users with a saved profile go straight to the garment pick.
if (saved) showSpec(); else showMeasurement(0);
