// Create flow: measurements (one per screen) -> garment spec -> WASM draft ->
// result. Photo -> AI analysis joins this flow when the Worker URL is live;
// until then the spec picker IS the flow (same manual path the iOS app had).
import { analyzePhoto, photoAvailable } from './analyze.js?v=47';
import { applyStatic, getLang, mountLangToggle, t } from './i18n.js?v=47';
import { draft, grade } from './engine.js?v=47';
import { printPattern, printGrade, printGradeNested } from './print.js?v=47';
import { renderResult } from './render.js?v=47';
import {
  MEASUREMENTS, loadMeasurements, saveMeasurements, saveToCloset,
  loadProfiles, saveProfile, deleteProfile,
} from './store.js?v=47';

const screen = document.getElementById('screen');
const saved = loadMeasurements();
// A standard EU38 body so a first-time visitor can SEE a real pattern before
// being asked to measure themselves — the "aha" comes before the 7-measurement
// ask, not after it. Replaced by the user's own numbers the moment they add them.
const DEMO_BODY = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40, armLength: 58, neck: 35 };
let usingDemo = !saved;
const values = { ...(saved || DEMO_BODY) };

const SPEC_GROUPS = [
  { key: 'garment', label: 'garment', trLabel: 'kıyafet', options: [['skirt', 'skirt', 'etek'], ['dress', 'dress', 'elbise'], ['top', 'top', 'üst']], for: () => true },
  { key: 'neckline', label: 'neckline', trLabel: 'yaka', options: [['crew', 'crew', 'bisiklet'], ['scoop', 'scoop', 'oval'], ['vNeck', 'v-neck', 'V yaka'], ['square', 'square', 'kare'], ['boat', 'boat', 'kayık'], ['sweetheart', 'sweetheart', 'kalp yaka'], ['halter', 'halter', 'halter (boyundan bağlı)']], for: (s) => s.garment !== 'skirt' },
  { key: 'keyhole', label: 'front detail', trLabel: 'ön detay', options: [['none', 'plain', 'sade'], ['keyhole', 'keyhole cut-out', 'anahtar deliği']], for: (s) => s.garment !== 'skirt' && s.neckline !== 'halter' },
  // A halter has no shoulders to hang a sleeve from — the pickers hide.
  { key: 'sleeveStyle', label: 'sleeves', trLabel: 'kol', options: [['none', 'sleeveless', 'kolsuz'], ['straight', 'straight', 'düz'], ['balloon', 'balloon', 'balon']], for: (s) => s.garment !== 'skirt' && s.neckline !== 'halter' },
  { key: 'sleeveLength', label: 'sleeve length', trLabel: 'kol boyu', options: [['short', 'short', 'kısa'], ['elbow', 'elbow', 'dirsek'], ['long', 'long', 'uzun']], for: (s) => s.garment !== 'skirt' && s.neckline !== 'halter' && s.sleeveStyle !== 'none' },
  { key: 'skirtStyle', label: 'skirt style', trLabel: 'etek stili', options: [['aLine', 'A-line', 'A kesim'], ['straight', 'straight', 'düz'], ['gathered', 'gathered', 'büzgülü'], ['halfCircle', 'half circle', 'yarım kloş'], ['pleated', 'pleated', 'pileli']], for: (s) => s.garment !== 'top' },
  { key: 'waistline', label: 'waistline', trLabel: 'bel hattı', options: [['natural', 'natural waist', 'normal bel'], ['empire', 'empire (under bust)', 'göğüs altı (babydoll)']], for: (s) => s.garment === 'dress' },
  { key: 'skirtLength', label: 'length', trLabel: 'boy', options: [['mini', 'mini', 'mini'], ['midi', 'midi', 'midi'], ['maxi', 'maxi', 'maksi']], for: (s) => s.garment !== 'top' },
  { key: 'ruffle', label: 'hem ruffle', trLabel: 'fırfır', options: [['none', 'none', 'yok'], ['single', 'hem ruffle', 'etek ucu fırfır'], ['tiered', 'tiered (3)', 'kademeli (3 kat)']], for: (s) => s.garment !== 'top' },
  { key: 'topLength', label: 'top length', trLabel: 'üst boyu', options: [['cropped', 'cropped', 'crop'], ['hip', 'hip', 'kalça'], ['tunic', 'tunic', 'tunik']], for: (s) => s.garment === 'top' },
  // Princess is the engine default; darts are the legacy/advanced option.
  // Gathered and half-circle skirts have no waist shaping to convert.
  { key: 'shaping', label: 'shaping', trLabel: 'form', options: [['princess', 'princess seams', 'prenses dikiş'], ['dart', 'darts', 'pens']], for: (s) => s.garment !== 'skirt' || s.skirtStyle === 'aLine' || s.skirtStyle === 'straight' },
  { key: 'fabric', label: 'fabric', trLabel: 'kumaş', options: [['woven', 'woven (no stretch)', 'dokuma (esnemez)'], ['knit', 'knit / stretch', 'örgü / streç']], for: () => true },
];
const spec = {
  garment: 'dress', neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short',
  skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip', shaping: 'princess',
  waistline: 'natural', fabric: 'woven', ruffle: 'none', keyhole: 'none',
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
    inner += `<line x1="${mx}" y1="12" x2="${mx}" y2="94" stroke="#8f2038" stroke-width="3" stroke-dasharray="9 6" stroke-linecap="round"/>`;
  }
  svg.innerHTML = inner;
  return svg;
}

// Where on the body each measurement is taken — drawn on a dress FORM (a sewing
// object, never a human figure, per the brand rule). The vişne line/arrow shows
// the tape placement for the current measurement so a non-drafter doesn't guess.
function measureDiagram(key) {
  // Shared dress-form silhouette (front): neck, shoulders, bust, waist, hip.
  const form = '<path d="M60 26 Q70 22 80 26 M62 30 Q70 46 70 58 Q70 70 58 82 ' +
    'M78 30 Q70 46 70 58 Q70 70 82 82 M45 44 Q58 34 62 30 M95 44 Q82 34 78 30 ' +
    'M45 44 Q40 64 52 84 M95 44 Q100 64 88 84 M52 84 Q50 104 56 120 M88 84 Q90 104 84 120 ' +
    'M56 120 Q70 128 84 120 M52 84 Q70 92 88 84" fill="none" stroke="#c7a6ac" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>';
  const V = '#8f2038';
  const lines = {
    bust:      `<line x1="46" y1="60" x2="94" y2="60" stroke="${V}" stroke-width="2.4" stroke-dasharray="5 3"/><ellipse cx="70" cy="60" rx="26" ry="8" fill="none" stroke="${V}" stroke-width="1.2" opacity=".5"/>`,
    waist:     `<line x1="52" y1="86" x2="88" y2="86" stroke="${V}" stroke-width="2.4" stroke-dasharray="5 3"/><ellipse cx="70" cy="86" rx="19" ry="6" fill="none" stroke="${V}" stroke-width="1.2" opacity=".5"/>`,
    hip:       `<line x1="55" y1="118" x2="85" y2="118" stroke="${V}" stroke-width="2.4" stroke-dasharray="5 3"/><ellipse cx="70" cy="118" rx="17" ry="6" fill="none" stroke="${V}" stroke-width="1.2" opacity=".5"/>`,
    shoulder:  `<line x1="47" y1="43" x2="93" y2="43" stroke="${V}" stroke-width="2.4"/><circle cx="47" cy="43" r="2.4" fill="${V}"/><circle cx="93" cy="43" r="2.4" fill="${V}"/>`,
    neck:      `<ellipse cx="70" cy="27" rx="11" ry="5" fill="none" stroke="${V}" stroke-width="2.2" stroke-dasharray="4 3"/>`,
    backLength:`<line x1="70" y1="30" x2="70" y2="86" stroke="${V}" stroke-width="2.4"/><circle cx="70" cy="30" r="2.4" fill="${V}"/><path d="M66 84 L70 88 L74 84" fill="none" stroke="${V}" stroke-width="2"/>`,
    armLength: `<line x1="45" y1="44" x2="34" y2="96" stroke="${V}" stroke-width="2.4"/><circle cx="45" cy="44" r="2.4" fill="${V}"/><circle cx="34" cy="96" r="2.4" fill="${V}"/>`,
    upperBust: `<line x1="48" y1="50" x2="92" y2="50" stroke="${V}" stroke-width="2.4" stroke-dasharray="5 3"/><text x="70" y="46" font-size="6" fill="${V}" text-anchor="middle" font-family="Helvetica">above the bust</text>`,
  };
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'measure-diagram');
  svg.setAttribute('viewBox', '20 12 100 120');
  svg.innerHTML = form + (lines[key] || '');
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
  const lblRow = el('div', 'measure-label', mLabel);
  if (m.optional) {
    const opt = el('span', 'measure-optional', ' · ' + t('create.optional'));
    lblRow.appendChild(opt);
  }
  block.appendChild(lblRow);
  block.appendChild(el('div', 'measure-help', tr ? m.trHelp : m.help));
  block.appendChild(measureDiagram(m.key));

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
  const isLast = index === MEASUREMENTS.length - 1;
  const nextLabel = isLast ? t('create.done')
    : (m.optional ? t('create.skip') : t('create.next', { label: (tr ? MEASUREMENTS[index + 1].trLabel : MEASUREMENTS[index + 1].label).toLowerCase() }));
  const next = el('button', 'btn primary', nextLabel);
  const advance = () => {
    if (isLast) {
      saveMeasurements(values);
      usingDemo = false; // the pattern is now drafted to the real person
      showSpec();
    } else {
      showMeasurement(index + 1);
    }
  };
  next.addEventListener('click', () => {
    const raw = input.value.trim();
    // Optional field left blank: skip it (drop any old value) and move on.
    if (m.optional && raw === '') { delete values[m.key]; advance(); return; }
    const v = parseFloat(raw.replace(',', '.'));
    if (Number.isNaN(v)) { error.textContent = t('create.measure.numerror'); return; }
    if (v < m.min || v > m.max) {
      error.textContent = t('create.measure.rangeerror', { label: mLabel.toLowerCase(), min: m.min, max: m.max });
      return;
    }
    values[m.key] = v;
    advance();
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
  const sub = el('p', 'screen-sub', usingDemo ? t('create.spec.subdemo') : t('create.spec.sub'));
  const edit = el('a', '', usingDemo ? t('create.spec.addmeasure') : t('create.spec.edit'));
  edit.href = '#';
  edit.style.color = 'inherit';
  edit.addEventListener('click', (e) => { e.preventDefault(); showMeasurement(0); });
  sub.appendChild(edit);
  screen.appendChild(sub);

  // Named bodies: for anyone drafting for OTHERS (a seller, a friend) — keep
  // several measurement sets instead of overwriting one. Hidden until there's a
  // reason to show it (a saved profile exists, or the user has real measurements
  // worth naming), so a first-timer isn't cluttered.
  const profiles = loadProfiles();
  if (!usingDemo || profiles.length) {
    const pbar = el('div', 'profile-bar');
    if (profiles.length) {
      const sel = document.createElement('select');
      sel.className = 'profile-select';
      const optCur = el('option', '', t('create.profile.current'));
      optCur.value = '';
      sel.appendChild(optCur);
      for (const p of profiles) {
        const o = el('option', '', p.name);
        o.value = p.name;
        sel.appendChild(o);
      }
      sel.addEventListener('change', () => {
        const p = profiles.find((x) => x.name === sel.value);
        if (p) { Object.assign(values, p.m); usingDemo = false; saveMeasurements(values); showSpec(); }
      });
      pbar.appendChild(sel);
    }
    // Save the current body under a name (for a client / a friend).
    const nameInput = document.createElement('input');
    nameInput.className = 'profile-name';
    nameInput.placeholder = t('create.profile.nameph');
    const saveBtn = el('button', 'profile-save', t('create.profile.save'));
    saveBtn.addEventListener('click', () => {
      const nm = nameInput.value.trim();
      if (!nm) { nameInput.focus(); return; }
      saveProfile(nm, values);
      showSpec();
    });
    pbar.appendChild(nameInput);
    pbar.appendChild(saveBtn);
    screen.appendChild(pbar);
  }

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
        if (seen.shaping === 'princess' || seen.shaping === 'dart') spec.shaping = seen.shaping;
        if (seen.waistline === 'natural' || seen.waistline === 'empire') spec.waistline = seen.waistline;
        if (seen.fabric === 'woven' || seen.fabric === 'knit') spec.fabric = seen.fabric;
        if (['none', 'single', 'tiered'].includes(seen.hemRuffle)) spec.ruffle = seen.hemRuffle;
        if (typeof seen.keyhole === 'boolean') spec.keyhole = seen.keyhole ? 'keyhole' : 'none';
        if (typeof seen.fabricName === 'string' && seen.fabricName !== 'other') spec.photoFabric = seen.fabricName;
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

  // Demo-body users: lead with the personalize CTA — they've now SEEN a real
  // pattern, so the ask to measure themselves has earned its place.
  if (usingDemo) {
    const fitBanner = el('div', 'fit-banner');
    fitBanner.appendChild(el('span', 'fit-banner-text', t('create.demo.banner')));
    const fitBtn = el('button', 'btn primary', t('create.demo.cta'));
    fitBtn.addEventListener('click', () => showMeasurement(0));
    fitBanner.appendChild(fitBtn);
    screen.appendChild(fitBanner);
  }

  const body = el('div');
  screen.appendChild(body);
  result.photoFabric = spec.photoFabric || null;
  result.demoBody = usingDemo;
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

  // Grade: sellers turn one design into a full EU size run from the same engine.
  // Only offered for a valid draft (a blocked draft has nothing to grade).
  if (!result.issues.length) {
    screen.appendChild(gradePanel(result));
  }
}

const EU_SIZES = ['EU34', 'EU36', 'EU38', 'EU40', 'EU42', 'EU44', 'EU46', 'EU48', 'EU50', 'EU52'];

// A seller-facing panel under the result: pick a size range, generate the run,
// print all sizes as one document. Honest states — errors say so, no fake run.
function gradePanel(result) {
  const panel = el('div', 'grade-panel');
  panel.appendChild(el('h2', 'grade-title', t('create.grade.title')));
  panel.appendChild(el('p', 'grade-sub', t('create.grade.sub')));

  const row = el('div', 'grade-row');
  const fromSel = el('select', 'grade-select');
  const toSel = el('select', 'grade-select');
  for (const s of EU_SIZES) {
    fromSel.appendChild(new Option(s, s));
    toSel.appendChild(new Option(s, s));
  }
  fromSel.value = 'EU36';
  toSel.value = 'EU44';
  const fromLabel = el('label', 'grade-label', t('create.grade.from'));
  fromLabel.appendChild(fromSel);
  const toLabel = el('label', 'grade-label', t('create.grade.to'));
  toLabel.appendChild(toSel);
  row.appendChild(fromLabel);
  row.appendChild(toLabel);
  panel.appendChild(row);

  // Output layout: nested (all sizes on one set of sheets, one colour each —
  // the industry-standard multi-size PDF) or per-size (each size its own
  // cover + sheets). Nested is the default: it's the seller's real deliverable.
  const layoutRow = el('div', 'grade-row grade-layout');
  const nestWrap = el('label', 'grade-radio');
  const nestRadio = document.createElement('input');
  nestRadio.type = 'radio'; nestRadio.name = 'gradeLayout'; nestRadio.value = 'nested'; nestRadio.checked = true;
  nestWrap.appendChild(nestRadio);
  nestWrap.appendChild(el('span', '', t('create.grade.layout.nested')));
  const perWrap = el('label', 'grade-radio');
  const perRadio = document.createElement('input');
  perRadio.type = 'radio'; perRadio.name = 'gradeLayout'; perRadio.value = 'per';
  perWrap.appendChild(perRadio);
  perWrap.appendChild(el('span', '', t('create.grade.layout.per')));
  layoutRow.appendChild(nestWrap);
  layoutRow.appendChild(perWrap);
  panel.appendChild(layoutRow);

  const go = el('button', 'btn primary', t('create.grade.go'));
  const msg = el('p', 'grade-msg');
  go.addEventListener('click', async () => {
    let from = fromSel.value;
    let to = toSel.value;
    // Keep the range ordered so a seller can't ask for EU44..EU36.
    if (EU_SIZES.indexOf(from) > EU_SIZES.indexOf(to)) [from, to] = [to, from];
    go.disabled = true;
    msg.style.color = '';
    msg.textContent = t('create.grade.working');
    try {
      const graded = await grade(spec, from, to);
      const sizes = (graded.sizes || []).filter((s) => !s.draft.issues.length);
      if (!sizes.length) {
        msg.style.color = '#8f2038';
        msg.textContent = t('create.grade.none');
        go.disabled = false;
        return;
      }
      const dropped = (graded.sizes || []).length - sizes.length;
      msg.textContent = dropped
        ? t('create.grade.done.some', { n: sizes.length, dropped })
        : t('create.grade.done', { n: sizes.length });
      if (nestRadio.checked) printGradeNested(sizes, result.pattern.garment);
      else printGrade(sizes, result.pattern.garment);
    } catch (err) {
      msg.style.color = '#8f2038';
      msg.textContent = t('create.grade.error');
      console.error(err);
    }
    go.disabled = false;
  });
  panel.appendChild(go);
  panel.appendChild(msg);
  return panel;
}

applyStatic();
mountLangToggle();

// Entry: EVERYONE lands on the garment picker so they see a real pattern first
// (drafted to a standard body for newcomers). The 7-measurement ask comes after
// the aha, offered on the result as "make it fit you".
showSpec();
