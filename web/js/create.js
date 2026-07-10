// Create flow: measurements (one per screen) -> garment spec -> WASM draft ->
// result. Photo -> AI analysis joins this flow when the Worker URL is live;
// until then the spec picker IS the flow (same manual path the iOS app had).
import { analyzePhoto, photoAvailable } from './analyze.js?v=5';
import { applyStatic, getLang, mountLangToggle, t } from './i18n.js?v=5';
import { draft } from './engine.js?v=5';
import { printPattern } from './print.js?v=5';
import { renderResult } from './render.js?v=5';
import {
  MEASUREMENTS, loadMeasurements, saveMeasurements, saveToCloset,
} from './store.js?v=5';

const screen = document.getElementById('screen');
const saved = loadMeasurements();
const values = { ...(saved || {}) };

const SPEC_GROUPS = [
  { key: 'garment', label: 'garment', trLabel: 'kıyafet', options: [['skirt', 'skirt', 'etek'], ['dress', 'dress', 'elbise'], ['top', 'top', 'üst']], for: () => true },
  { key: 'neckline', label: 'neckline', trLabel: 'yaka', options: [['crew', 'crew', 'bisiklet'], ['scoop', 'scoop', 'oval'], ['vNeck', 'v-neck', 'V yaka'], ['square', 'square', 'kare'], ['boat', 'boat', 'kayık']], for: (s) => s.garment !== 'skirt' },
  { key: 'sleeveStyle', label: 'sleeves', trLabel: 'kol', options: [['none', 'sleeveless', 'kolsuz'], ['straight', 'straight', 'düz'], ['balloon', 'balloon', 'balon']], for: (s) => s.garment !== 'skirt' },
  { key: 'sleeveLength', label: 'sleeve length', trLabel: 'kol boyu', options: [['short', 'short', 'kısa'], ['elbow', 'elbow', 'dirsek'], ['long', 'long', 'uzun']], for: (s) => s.garment !== 'skirt' && s.sleeveStyle !== 'none' },
  { key: 'skirtStyle', label: 'skirt style', trLabel: 'etek stili', options: [['aLine', 'A-line', 'A kesim'], ['straight', 'straight', 'düz'], ['gathered', 'gathered', 'büzgülü'], ['halfCircle', 'half circle', 'yarım kloş']], for: (s) => s.garment !== 'top' },
  { key: 'skirtLength', label: 'length', trLabel: 'boy', options: [['mini', 'mini', 'mini'], ['midi', 'midi', 'midi'], ['maxi', 'maxi', 'maksi']], for: (s) => s.garment !== 'top' },
  { key: 'topLength', label: 'top length', trLabel: 'üst boyu', options: [['cropped', 'cropped', 'crop'], ['hip', 'hip', 'kalça'], ['tunic', 'tunic', 'tunik']], for: (s) => s.garment === 'top' },
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

function sewingLoader(text) {
  const wrap = el('div', 'sewing-loader');
  wrap.appendChild(el('span', 'seam-track'));
  wrap.appendChild(el('span', 'loader-text', text));
  return wrap;
}

function progressSeam(done, total) {
  const wrap = el('div', 'stepline');
  wrap.appendChild(el('span', 'hint', `${done} / ${total}`));
  const track = el('span', 'seam-progress');
  const sewn = el('span', 'sewn');
  sewn.style.width = `${Math.round((done / total) * 100)}%`;
  track.appendChild(sewn);
  wrap.appendChild(track);
  return wrap;
}

// Measuring tape with the current value under the stitch marker (brand rule:
// sewing objects, never human figures).
function tapeSVG(value, min, max) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'tape');
  svg.setAttribute('viewBox', '0 0 340 110');
  const lo = Math.max(min, Math.min(Math.floor(value) - 3, max - 8));
  let inner = '<rect x="10" y="30" width="304" height="46" fill="none" stroke="#111" stroke-width="1.8"/>' +
              '<rect x="314" y="26" width="10" height="54" fill="none" stroke="#111" stroke-width="1.8"/>';
  for (let i = 0; i <= 8; i++) {
    const x = 26 + i * 36;
    const cm = lo + i;
    if (cm > max) break;
    const tall = cm % 2 === 0;
    inner += `<line x1="${x}" y1="30" x2="${x}" y2="${tall ? 56 : 48}" stroke="#111" stroke-width="1.4"/>`;
    if (tall && x <= 296) inner += `<text x="${x}" y="70" font-family="Helvetica" font-size="12" fill="#8a8a8a" text-anchor="middle">${cm}</text>`;
  }
  const mx = 26 + (value - lo) * 36;
  if (mx >= 10 && mx <= 324) {
    inner += `<line x1="${mx}" y1="12" x2="${mx}" y2="94" stroke="#3EB8AF" stroke-width="3" stroke-dasharray="9 6" stroke-linecap="round"/>`;
  }
  svg.innerHTML = inner;
  return svg;
}

function showMeasurement(index) {
  screen.className = 'wrap';
  const m = MEASUREMENTS[index];
  const tr = getLang() === 'tr';
  const mLabel = tr ? m.trLabel : m.label;
  screen.textContent = '';
  screen.appendChild(el('h1', 'screen-title', t('create.measure.title')));
  screen.appendChild(el('p', 'screen-sub', t('create.measure.sub')));
  screen.appendChild(progressSeam(index + 1, MEASUREMENTS.length));

  const block = el('div', 'measure-block');
  block.appendChild(el('div', 'measure-label', mLabel));
  block.appendChild(el('div', 'measure-help', tr ? m.trHelp : m.help));

  const initial = values[m.key] ?? '';
  let tape = tapeSVG(Number(initial) || m.min, m.min, m.max);
  block.appendChild(tape);

  const row = el('div', 'measure-row');
  const input = document.createElement('input');
  input.inputMode = 'decimal';
  input.value = initial;
  input.setAttribute('aria-label', `${mLabel} (cm)`);
  row.appendChild(input);
  row.appendChild(el('span', 'unit', 'cm'));
  block.appendChild(row);
  const error = el('div', 'field-error', '');
  block.appendChild(error);
  block.appendChild(el('p', 'privacy-note', t('create.measure.privacy')));

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
    const back = el('button', 'btn', t('create.back'));
    back.addEventListener('click', () => showMeasurement(index - 1));
    nav.appendChild(back);
  }
  const nextLabel = index === MEASUREMENTS.length - 1 ? t('create.done') : t('create.next', { label: (tr ? MEASUREMENTS[index + 1].trLabel : MEASUREMENTS[index + 1].label).toLowerCase() });
  const next = el('button', 'btn primary', nextLabel);
  next.addEventListener('click', () => {
    const v = parseFloat(input.value.replace(',', '.'));
    if (Number.isNaN(v)) { error.textContent = t('create.measure.numerror'); return; }
    if (v < m.min || v > m.max) {
      error.textContent = t('create.measure.rangeerror', { label: mLabel.toLowerCase(), min: m.min, max: m.max });
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
  screen.className = 'wrap spec-screen';
  screen.appendChild(el('h1', 'screen-title', t('create.spec.title')));
  const sub = el('p', 'screen-sub', t('create.spec.sub'));
  const edit = el('a', '', t('create.spec.edit'));
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
    photoBlock.appendChild(el('div', 'group-label', t('create.spec.photo')));
    const row = el('div', 'choice-row');
    const pick = el('button', 'choice', t('create.spec.photobtn'));
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
      status.textContent = '';
      const loader = sewingLoader(t('create.spec.reading'));
      status.appendChild(loader);
      try {
        const seen = await analyzePhoto(file.files[0]);
        spec.garment = seen.garment;
        if (seen.neckline) spec.neckline = seen.neckline;
        if (seen.sleeveStyle) spec.sleeveStyle = seen.sleeveStyle;
        if (seen.sleeveLength) spec.sleeveLength = seen.sleeveLength;
        if (seen.skirtStyle) spec.skirtStyle = seen.skirtStyle;
        if (seen.length) spec.skirtLength = seen.length;
        if (seen.topLength) spec.topLength = seen.topLength;
        status.textContent = (seen.details ? seen.details + ' — ' : '') + t('create.spec.checkpicks');
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
      g.appendChild(el('div', 'group-label', getLang() === 'tr' ? group.trLabel : group.label));
      const row = el('div', 'choice-row');
      for (const [value, label, trOption] of group.options) {
        const b = el('button', 'choice', getLang() === 'tr' ? trOption : label);
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
  const go = el('button', 'btn primary', t('create.draft'));
  const drafting = el('div', '');
  go.addEventListener('click', async () => {
    go.disabled = true;
    go.textContent = t('create.drafting');
    drafting.appendChild(sewingLoader(t('create.drafting')));
    try {
      const result = await draft(spec, values);
      showResult(result);
    } catch (err) {
      go.disabled = false;
      go.textContent = t('create.draft');
      drafting.textContent = '';
      alert(t('create.engineerror'));
      console.error(err);
    }
  });
  nav.appendChild(go);
  screen.appendChild(nav);
  screen.appendChild(drafting);
}

function showResult(result) {
  screen.textContent = '';
  screen.className = 'wrap';
  const head = el('div', 'result-head');
  head.appendChild(el('h1', 'screen-title', t('create.result.title', { garment: result.pattern.garment.charAt(0).toUpperCase() + result.pattern.garment.slice(1) })));
  screen.appendChild(head);

  const body = el('div');
  screen.appendChild(body);
  renderResult(body, result);

  const nav = el('div', 'step-nav');
  const again = el('button', 'btn', t('create.changegarment'));
  again.addEventListener('click', showSpec);
  nav.appendChild(again);
  if (!result.issues.length) {
    const save = el('button', 'btn', t('create.save'));
    save.addEventListener('click', () => {
      saveToCloset({ spec: { ...spec }, result });
      window.location.href = 'closet.html';
    });
    nav.appendChild(save);
    const print = el('button', 'btn primary', t('create.print'));
    print.addEventListener('click', () => printPattern(result));
    nav.appendChild(print);
  }
  screen.appendChild(nav);
}

applyStatic();
mountLangToggle();

// Entry: returning users with a saved profile go straight to the garment pick.
if (saved) showSpec(); else showMeasurement(0);
