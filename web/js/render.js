// SVG rendering of drafted pieces (mm -> px preview; true-scale printing is
// the print pipeline's job, not this preview's).
import { fabricAdvice } from './fabrics.js?v=52';
import { getLang, t } from './i18n.js?v=52';
import { missingFeatures, MISSING_STRINGS } from './missing.js?v=52';
import { GUIDE_TR } from './guide-tr.js?v=52';
import { GLOSSARY } from './glossary.js?v=52';

// Turn plain text into a node where known sewing terms are tappable (dotted
// underline + a native tooltip) — a beginner can learn a word without leaving
// the step. Case-insensitive, whole-word, first occurrence per term per line.
const GLOSSARY_RE = new RegExp('\\b(' + Object.keys(GLOSSARY).join('|') + ')\\b', 'i');
function withGlossary(text) {
  const lang = getLang() === 'tr' ? 'tr' : 'en';
  const frag = document.createDocumentFragment();
  let rest = text;
  const usedTerms = new Set();
  while (rest.length) {
    const m = GLOSSARY_RE.exec(rest);
    if (!m) { frag.appendChild(document.createTextNode(rest)); break; }
    const key = m[1].toLowerCase();
    if (usedTerms.has(key)) {
      frag.appendChild(document.createTextNode(rest.slice(0, m.index + m[1].length)));
      rest = rest.slice(m.index + m[1].length);
      continue;
    }
    usedTerms.add(key);
    frag.appendChild(document.createTextNode(rest.slice(0, m.index)));
    const term = document.createElement('span');
    term.className = 'gloss';
    term.textContent = m[1];
    term.title = GLOSSARY[key][lang];
    term.setAttribute('tabindex', '0');
    frag.appendChild(term);
    rest = rest.slice(m.index + m[1].length);
  }
  return frag;
}

const PREVIEW_SCALE = 0.28;

// pathD/bounds live in sheet.js (the pure print-geometry module) — one truth,
// one place; imported and re-exported so existing imports keep working.
import { pathD, bounds } from './sheet.js?v=52';
export { pathD, bounds };

export function pieceCard(piece) {
  const s = PREVIEW_SCALE;
  const b = bounds(piece);
  const pad = 10;
  const vx = b.minX * s - pad;
  const vy = b.minY * s - pad;
  const w = (b.maxX - b.minX) * s + pad * 2;
  const h = (b.maxY - b.minY) * s + pad * 2;

  // Double line: outer solid = CUTTING line (allowance included), inner
  // fine line = the SEWING line. Old closet saves keep the single line.
  const hasCut = (piece.cutLine || []).length > 0;
  let inner = hasCut
    ? `<path d="${pathD(piece.cutLine, s)}" fill="none" stroke="#111" stroke-width="1.6"/>` +
      `<path d="${pathD(piece.commands, s)}" fill="none" stroke="#8a8a8a" stroke-width="1"/>`
    : `<path d="${pathD(piece.commands, s)}" fill="none" stroke="#111" stroke-width="1.6"/>`;
  if (piece.markings.length) {
    inner += `<path d="${pathD(piece.markings, s)}" fill="none" stroke="#8f2038" stroke-width="1.4" stroke-dasharray="6 4"/>`;
  }
  if (piece.grainline) {
    const g = piece.grainline;
    inner += `<line x1="${g.fromX * s}" y1="${g.fromY * s}" x2="${g.toX * s}" y2="${g.toY * s}" stroke="#111" stroke-width="1.2"/>`;
    // arrowheads
    const ang = Math.atan2(g.toY - g.fromY, g.toX - g.fromX);
    for (const [px, py, dir] of [[g.fromX * s, g.fromY * s, ang], [g.toX * s, g.toY * s, ang + Math.PI]]) {
      const a1x = px + Math.cos(dir + 0.4) * 8;
      const a1y = py + Math.sin(dir + 0.4) * 8;
      const a2x = px + Math.cos(dir - 0.4) * 8;
      const a2y = py + Math.sin(dir - 0.4) * 8;
      inner += `<path d="M ${a1x} ${a1y} L ${px} ${py} L ${a2x} ${a2y}" fill="none" stroke="#111" stroke-width="1.2"/>`;
    }
  }

  const div = document.createElement('div');
  div.className = 'piece-card';
  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = piece.name + ' · ';
  const cut = document.createElement('span');
  cut.className = 'cut';
  cut.textContent = piece.cutInstruction;
  label.appendChild(cut);
  div.appendChild(label);
  const svgWrap = document.createElement('div');
  svgWrap.innerHTML = `<svg width="${w.toFixed(0)}" height="${h.toFixed(0)}" viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}">${inner}</svg>`;
  div.appendChild(svgWrap.firstChild);
  return div;
}

export function renderResult(container, result) {
  container.textContent = '';
  const p = result.pattern;

  if (result.issues.length) {
    const box = document.createElement('div');
    box.className = 'issues-box';
    const head = document.createElement('p');
    head.textContent = t('result.blocked');
    box.appendChild(head);
    console.error('stitchu validation issues:', result.issues);
    container.appendChild(box);
    return;
  }

  const meta = document.createElement('ul');
  meta.className = 'result-meta';
  const rows = [
    [t('result.pieces'), t('result.piecesv', { n: p.pieces.length })],
    [t('result.fabric'), t('result.fabricv', { n: p.fabricMeters140 })],
    [t('result.sa'), t('result.sav', { n: p.pieces[0].seamAllowance / 10 })],
  ];
  for (const [k, v] of rows) {
    const li = document.createElement('li');
    const key = document.createElement('span');
    key.className = 'k';
    key.textContent = k;
    const val = document.createElement('span');
    val.textContent = v;
    li.append(key, val);
    meta.appendChild(li);
  }
  container.appendChild(meta);

  // Honesty layer: the vision saw elements the engine cannot draft yet. Say so
  // out loud — the closest derivative given + what to add by hand. Silent
  // fallback is the trust killer this card removes.
  appendMissing(container, result.seen);

  const grid = document.createElement('div');
  grid.className = 'pieces-grid';
  for (const piece of p.pieces) grid.appendChild(pieceCard(piece));
  container.appendChild(grid);

  const legend = document.createElement('p');
  legend.style.cssText = 'font-size:13px;color:#8a8a8a;margin-top:14px;max-width:640px';
  legend.textContent = t('result.legend');
  container.appendChild(legend);

  const guideTitle = document.createElement('h2');
  guideTitle.style.cssText = 'font-weight:400;font-size:22px;margin-top:44px';
  guideTitle.textContent = t('result.guide');
  container.appendChild(guideTitle);
  const tr = getLang() === 'tr';
  // Any step without a Turkish translation yet falls back to English, and we
  // only show the "some steps still English" note when that actually happens.
  const untranslated = tr && p.guideSteps.some((s) => !GUIDE_TR[s]);
  if (untranslated) {
    const note = document.createElement('p');
    note.style.cssText = 'font-size:13px;color:#8a8a8a;margin-top:6px';
    note.textContent = t('result.guidetrnote');
    container.appendChild(note);
  }
  const ol = document.createElement('ol');
  ol.className = 'guide-list';
  for (const step of p.guideSteps) {
    const li = document.createElement('li');
    li.appendChild(withGlossary(tr ? (GUIDE_TR[step] || step) : step));
    ol.appendChild(li);
  }
  container.appendChild(ol);

  appendFabricAdvice(container, p.fabricAdviceKey, result.photoFabric || null);
}

// The honest "what I saw vs what the pattern draws" card. Only appears when the
// vision actually saw something the engine could not draft. vişne #8f2038 to
// match the couture brand voice — plain, no invented ornament.
function appendMissing(container, seen) {
  const lang = getLang() === 'tr' ? 'tr' : 'en';
  const items = missingFeatures(seen, lang);
  if (!items.length) return;

  const card = document.createElement('div');
  card.className = 'missing-card';
  const title = document.createElement('h2');
  title.className = 'missing-title';
  title.textContent = MISSING_STRINGS.heading[lang];
  card.appendChild(title);
  const intro = document.createElement('p');
  intro.className = 'missing-intro';
  intro.textContent = MISSING_STRINGS.intro[lang];
  card.appendChild(intro);

  const list = document.createElement('ul');
  list.className = 'missing-list';
  for (const it of items) {
    const li = document.createElement('li');
    const label = document.createElement('span');
    label.className = 'missing-label';
    label.textContent = it.label;
    li.appendChild(label);
    const detail = document.createElement('span');
    detail.className = 'missing-detail';
    if (it.applied) {
      detail.textContent = ` — ${MISSING_STRINGS.gaveClosest[lang]}: ${it.applied}. ${it.note}`;
    } else {
      detail.textContent = ` — ${MISSING_STRINGS.notInPattern[lang]}`;
    }
    li.appendChild(detail);
    list.appendChild(li);
  }
  card.appendChild(list);
  container.appendChild(card);
}

// Verified-DB aliases for the vision's fabric vocabulary.
const FABRIC_ALIASES = {
  'jersey': 'jersey (knit)',
  'viscose': 'viscose / rayon',
};

async function appendFabricAdvice(container, garmentKey, photoFabric) {
  const { suggested, avoid } = await fabricAdvice(garmentKey);
  if (!suggested.length && !avoid.length && !photoFabric) return;

  const title = document.createElement('h2');
  title.style.cssText = 'font-weight:400;font-size:22px;margin-top:44px';
  title.textContent = t('result.fabricadvice');
  container.appendChild(title);

  // Sewing-assistant line: what the photo's fabric means for THIS project.
  // Only verified-DB facts are stated; unknown fabrics get an honest note.
  if (photoFabric) {
    const canonical = FABRIC_ALIASES[photoFabric] || photoFabric;
    const inSuggested = suggested.find((f) => f.name === canonical);
    const inAvoid = avoid.find((f) => f.name === canonical);
    const line = document.createElement('p');
    line.style.maxWidth = '640px';
    if (inSuggested) {
      line.textContent = t('result.photofabric.good', { name: photoFabric, note: inSuggested.commonMistakes[0] || inSuggested.drape });
    } else if (inAvoid) {
      line.textContent = t('result.photofabric.bad', { name: photoFabric, drape: inAvoid.drape });
    } else {
      line.textContent = t('result.photofabric.unknown', { name: photoFabric });
    }
    container.appendChild(line);
  }

  const list = document.createElement('ul');
  list.className = 'result-meta';
  list.style.maxWidth = '640px';
  for (const fabric of suggested) {
    const li = document.createElement('li');
    li.style.display = 'block';
    const name = document.createElement('span');
    name.textContent = t('result.fabric.suggest', { name: fabric.name, drape: fabric.drape, difficulty: fabric.beginnerDifficulty });
    const note = document.createElement('span');
    note.className = 'k';
    note.textContent = fabric.commonMistakes[0] || '';
    li.append(name, note);
    list.appendChild(li);
  }
  for (const fabric of avoid) {
    const li = document.createElement('li');
    li.style.display = 'block';
    const name = document.createElement('span');
    name.textContent = t('result.fabric.avoid', { name: fabric.name });
    const note = document.createElement('span');
    note.className = 'k';
    note.textContent = t('result.fabric.avoidnote', { drape: fabric.drape });
    li.append(name, note);
    list.appendChild(li);
  }
  container.appendChild(list);
}
