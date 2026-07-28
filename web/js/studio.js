// studio.js — live recipe editor (PIPELINE Aşama 2, KANVAS).
// The model is the recipe document + the C++ interpreter in WASM
// (engine.draftRecipeJSON via engine.js draftRecipe). This file holds ZERO
// pattern math: it reads the recipe only to build the form (which measurements,
// which params, their declared ranges), hands every input straight to the
// engine, and draws whatever geometry comes back. Change a value, the whole
// pattern is re-evaluated from formulas; the SVG is an export format, nothing
// more (PIPELINE: "resim yoktur, model vardır").
import { draftRecipe, loadEngine } from './engine.js?v=131';
import { pathD, bounds } from './sheet.js?v=131';
import { printPattern } from './print.js?v=131';

const $ = (id) => document.getElementById(id);

// ---- recipe-declared measurement names -> the cm form fields they bind to.
// Same mapping the interpreter uses (recipe.cpp measurementValue); a name the
// engine does not know never reaches a form, it dies at recipe parse time.
const MEAS_FIELDS = {
  bustMM: { key: 'bust', label: 'Bust (cm)', dflt: 88 },
  waistMM: { key: 'waist', label: 'Waist (cm)', dflt: 70 },
  hipMM: { key: 'hip', label: 'Hip (cm)', dflt: 94 },
  shoulderMM: { key: 'shoulder', label: 'Shoulder (cm)', dflt: 37 },
  backLengthMM: { key: 'backLength', label: 'Back length (cm)', dflt: 40.5 },
  neckMM: { key: 'neck', label: 'Neck (cm)', dflt: 35 },
  upperBustMM: { key: 'upperBust', label: 'Upper bust (cm)', dflt: 86 },
};

// ANAYASA flat language: thin dark contour + ONE pastel fill per piece.
// pudra, lila, krem, bej — rotated in piece order.
const PASTELS = ['#f4e3e0', '#eae4f1', '#f7f1e2', '#ece5d8'];
const INK = '#1f3a5f';

const state = {
  recipes: [],        // manifest entries {id, title, file}
  text: null,         // raw recipe JSON text (handed verbatim to the engine)
  doc: null,          // parsed ONLY for form metadata (measurements/params/title)
  measurements: {},   // cm values from the form
  params: {},         // param values from the form
  result: null,       // last {pattern, issues} from the engine
  selected: -1,       // selected piece index
  pending: false,
};

// ---------------------------------------------------------------- form build
// URL state: ?waist=84&hip=104&lengthMM=900 opens the studio at those values
// (shareable state; the engine still validates everything itself).
const urlState = new URLSearchParams(location.search);
function urlNumber(key) {
  const v = Number(urlState.get(key));
  return Number.isFinite(v) && v > 0 ? v : null;
}

function buildMeasFields() {
  const box = $('meas-fields');
  box.textContent = '';
  state.measurements = {};
  for (const name of state.doc.measurements || []) {
    const f = MEAS_FIELDS[name];
    if (!f) continue; // unknown name: the engine already refused at parse time
    const start = urlNumber(f.key) ?? f.dflt;
    state.measurements[f.key] = start;
    const row = document.createElement('div');
    row.className = 'field-row';
    const label = document.createElement('label');
    label.textContent = f.label;
    label.setAttribute('for', `m-${f.key}`);
    const input = document.createElement('input');
    input.type = 'number';
    input.id = `m-${f.key}`;
    input.step = '0.5';
    input.min = '1';
    input.value = start;
    input.addEventListener('input', () => {
      state.measurements[f.key] = Number(input.value);
      scheduleRegen();
    });
    row.append(label, input);
    box.appendChild(row);
  }
}

function buildParamFields() {
  const box = $('param-fields');
  box.textContent = '';
  state.params = {};
  for (const [name, def] of Object.entries(state.doc.params || {})) {
    // default: the K1 mini length for the skirt table, else the range midpoint.
    const dflt = urlNumber(name) ??
      (def.table === 'draft.skirtLengthMM' ? 450 : Math.round((def.min + def.max) / 2));
    state.params[name] = dflt;
    const block = document.createElement('div');
    block.className = 'param-block';
    const row = document.createElement('div');
    row.className = 'field-row';
    const label = document.createElement('label');
    label.textContent = `${name} (mm)`;
    label.setAttribute('for', `p-${name}`);
    const num = document.createElement('input');
    num.type = 'number';
    num.id = `p-${name}`;
    num.min = def.min; num.max = def.max; num.step = '5';
    num.value = dflt;
    row.append(label, num);
    const rangeLine = document.createElement('div');
    rangeLine.className = 'range-line';
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = def.min; slider.max = def.max; slider.step = '5';
    slider.value = dflt;
    slider.setAttribute('aria-label', name);
    rangeLine.appendChild(slider);
    const limits = document.createElement('div');
    limits.className = 'param-limits';
    limits.innerHTML = `<span>${def.min}</span><span>${def.max}</span>`;
    const set = (v) => {
      state.params[name] = Number(v);
      num.value = v; slider.value = v;
      scheduleRegen();
    };
    slider.addEventListener('input', () => set(slider.value));
    num.addEventListener('input', () => set(num.value));
    block.append(row, rangeLine, limits);
    box.appendChild(block);
  }
}

// ------------------------------------------------------------- regeneration
let rafToken = 0;
function scheduleRegen() {
  // collapse a burst of slider events into one engine call per frame
  const token = ++rafToken;
  requestAnimationFrame(() => { if (token === rafToken) regenerate(); });
}

async function regenerate() {
  if (!state.text || state.pending) { state.dirty = true; return; }
  state.pending = true;
  const t0 = performance.now();
  const out = await draftRecipe(state.text, state.measurements, state.params);
  const dt = performance.now() - t0;
  state.pending = false;
  state.result = out;

  const issuesBox = $('issues');
  const status = $('status');
  if (out.error) {
    issuesBox.hidden = false;
    issuesBox.textContent = out.error;
    status.textContent = 'The engine refused this input; the drawing was not updated.';
    $('dl-svg').disabled = true;
    $('dl-pdf').disabled = true;
    return;
  }
  issuesBox.hidden = out.issues.length === 0;
  if (out.issues.length) issuesBox.textContent = out.issues.join(' · ');
  $('dl-svg').disabled = out.issues.length > 0;
  $('dl-pdf').disabled = out.issues.length > 0;

  drawPattern(out.pattern);
  const p = out.pattern;
  status.innerHTML =
    `<span class="ok">re-evaluated in ${dt.toFixed(1)} ms</span> · ` +
    `${p.pieces.length} pieces · fabric ${p.fabricMeters140} m (140 cm wide)`;

  const canvas = $('canvas');
  canvas.classList.remove('flash');
  void canvas.offsetWidth; // restart the flash animation
  canvas.classList.add('flash');

  if (state.dirty) { state.dirty = false; scheduleRegen(); }
}

// ------------------------------------------------------------------ drawing
const GUTTER = 40; // mm between pieces on the drafting table

function layoutPieces(pieces) {
  // side-by-side drafting-table layout in true mm, top-aligned
  const placed = [];
  let cursor = 0, maxH = 0;
  for (const piece of pieces) {
    const b = bounds(piece);
    const w = b.maxX - b.minX, h = b.maxY - b.minY;
    placed.push({ piece, b, tx: cursor - b.minX, ty: -b.minY });
    cursor += w + GUTTER;
    maxH = Math.max(maxH, h);
  }
  return { placed, totalW: Math.max(cursor - GUTTER, 1), totalH: maxH };
}

function grainlineSVG(g, strokeAttrs) {
  const ang = Math.atan2(g.toY - g.fromY, g.toX - g.fromX);
  let d = `M ${g.fromX} ${g.fromY} L ${g.toX} ${g.toY}`;
  for (const [px, py, dir] of [[g.fromX, g.fromY, ang], [g.toX, g.toY, ang + Math.PI]]) {
    const a1x = px + Math.cos(dir + 0.4) * 12, a1y = py + Math.sin(dir + 0.4) * 12;
    const a2x = px + Math.cos(dir - 0.4) * 12, a2y = py + Math.sin(dir - 0.4) * 12;
    d += ` M ${a1x.toFixed(1)} ${a1y.toFixed(1)} L ${px} ${py} L ${a2x.toFixed(1)} ${a2y.toFixed(1)}`;
  }
  return `<path d="${d}" fill="none" stroke="${INK}" ${strokeAttrs}/>`;
}

// One piece as SVG inner markup. `screen` uses non-scaling px strokes (crisp
// at any zoom); the export uses true-mm stroke widths instead.
function pieceSVG(piece, idx, screen) {
  const vec = screen ? 'vector-effect="non-scaling-stroke"' : '';
  const wCut = screen ? 1.5 : 0.5;      // px on screen, mm in the export
  const wFine = screen ? 1 : 0.35;
  const fill = PASTELS[idx % PASTELS.length];
  const cut = (piece.cutLine || []).length ? piece.cutLine : piece.commands;
  let s = '';
  // pastel fill on the cut outline (the paper piece), thin ink contour on top
  s += `<path class="fill" d="${pathD(cut, 1)}" fill="${fill}" stroke="none"/>`;
  s += `<path class="cutline" d="${pathD(cut, 1)}" fill="none" stroke="${INK}" stroke-width="${wCut}" ${vec}/>`;
  // fine dashed sewing line inside (the stitched line, topstitch feel)
  if ((piece.cutLine || []).length) {
    s += `<path d="${pathD(piece.commands, 1)}" fill="none" stroke="${INK}" stroke-width="${wFine}" stroke-dasharray="4 3" opacity=".55" ${vec}/>`;
  }
  if ((piece.markings || []).length) {
    s += `<path d="${pathD(piece.markings, 1)}" fill="none" stroke="${INK}" stroke-width="${wFine}" stroke-dasharray="6 4" opacity=".8" ${vec}/>`;
  }
  if ((piece.notches || []).length) {
    s += `<path d="${pathD(piece.notches, 1)}" fill="none" stroke="${INK}" stroke-width="${wFine}" ${vec}/>`;
  }
  if (piece.grainline) s += grainlineSVG(piece.grainline, `stroke-width="${wFine}" ${vec}`);
  return s;
}

function drawPattern(pattern) {
  const { placed, totalW, totalH } = layoutPieces(pattern.pieces);
  const labelH = Math.max(18, totalH * 0.05);
  const fontMM = Math.max(12, totalH * 0.035);
  let inner = '';
  placed.forEach(({ piece, b, tx, ty }, i) => {
    const sel = i === state.selected ? ' selected' : '';
    inner += `<g class="piece${sel}" data-i="${i}" transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)})">`;
    inner += pieceSVG(piece, i, true);
    inner += `<text x="${((b.minX + b.maxX) / 2).toFixed(1)}" y="${(b.maxY + labelH).toFixed(1)}" ` +
      `text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="${fontMM.toFixed(1)}" fill="${INK}">` +
      `${escapeXML(piece.name)}</text>`;
    inner += '</g>';
  });
  const pad = 20;
  $('canvas').innerHTML =
    `<svg viewBox="${-pad} ${-pad} ${(totalW + 2 * pad).toFixed(1)} ${(totalH + labelH * 2 + 2 * pad).toFixed(1)}" ` +
    `preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
  for (const g of $('canvas').querySelectorAll('g.piece')) {
    g.addEventListener('click', () => selectPiece(Number(g.dataset.i)));
  }
  if (state.selected >= 0) renderPieceInfo();
}

function escapeXML(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---------------------------------------------------------- piece selection
function selectPiece(i) {
  state.selected = state.selected === i ? -1 : i;
  for (const g of $('canvas').querySelectorAll('g.piece')) {
    g.classList.toggle('selected', Number(g.dataset.i) === state.selected);
  }
  renderPieceInfo();
}

function renderPieceInfo() {
  const box = $('piece-info');
  if (state.selected < 0 || !state.result || !state.result.pattern) {
    box.textContent = 'Click a piece on the canvas to inspect it.';
    return;
  }
  const piece = state.result.pattern.pieces[state.selected];
  if (!piece) { state.selected = -1; box.textContent = 'Click a piece on the canvas to inspect it.'; return; }
  // sewing-line size, measured from the drafted geometry (not the cut line)
  const sb = bounds({ commands: piece.commands, markings: [], cutLine: [] });
  const dl = document.createElement('dl');
  const rows = [
    ['Name', piece.name],
    ['Cut', piece.cutInstruction],
    ['Seam allowance', `${piece.seamAllowance} mm`],
    ['Sewing-line size', `${(sb.maxX - sb.minX).toFixed(0)} × ${(sb.maxY - sb.minY).toFixed(0)} mm`],
  ];
  for (const [k, v] of rows) {
    const dt = document.createElement('dt'); dt.textContent = k;
    const dd = document.createElement('dd'); dd.textContent = v;
    dl.append(dt, dd);
  }
  box.textContent = '';
  box.appendChild(dl);
}

// -------------------------------------------------------------- SVG export
function downloadSVG() {
  if (!state.result || !state.result.pattern || state.result.issues.length) return;
  const p = state.result.pattern;
  const { placed, totalW, totalH } = layoutPieces(p.pieces);
  const labelH = Math.max(18, totalH * 0.05);
  let inner = '';
  placed.forEach(({ piece, b, tx, ty }, i) => {
    inner += `<g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)})">`;
    inner += pieceSVG(piece, i, false);
    inner += `<text x="${((b.minX + b.maxX) / 2).toFixed(1)}" y="${(b.maxY + labelH).toFixed(1)}" ` +
      `text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="14" fill="${INK}">` +
      `${escapeXML(piece.name)} · ${escapeXML(piece.cutInstruction)}</text>`;
    inner += '</g>';
  });
  const w = (totalW + 40).toFixed(1), h = (totalH + labelH * 2 + 40).toFixed(1);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" ` +
    `viewBox="-20 -20 ${w} ${h}">\n<rect x="-20" y="-20" width="${w}" height="${h}" fill="#ffffff"/>\n` +
    inner + '\n</svg>\n';
  const meas = Object.entries(state.measurements).map(([k, v]) => `${k}${v}`).join('-');
  const params = Object.entries(state.params).map(([k, v]) => `${k}${v}`).join('-');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  a.download = `${state.doc.id.replace(/\./g, '-')}-${meas}-${params}.svg`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// -------------------------------------------------------------- PDF export
// Print-ready A4 PDF: the SAME builder create.html uses (print.js
// buildPrintPages over sheet.js packing), so the studio PDF and every other
// PDF surface share one content source: cover with cutting table + calibration
// square, then A4-tiled sheets with corner codes. The browser print dialog
// does the PDF encoding ("Save as PDF", scale 100%); no second layout truth.
function downloadPDF() {
  if (!state.result || !state.result.pattern || state.result.issues.length) return;
  printPattern(state.result);
}

// ------------------------------------------------------------------ startup
async function loadRecipe(entry) {
  const res = await fetch(`recipes/${entry.file}?v=131`);
  if (!res.ok) throw new Error(`recipe fetch failed: HTTP ${res.status}`);
  state.text = await res.text();
  state.doc = JSON.parse(state.text); // form metadata only; the engine re-parses
  state.selected = -1;
  buildMeasFields();
  buildParamFields();
  renderPieceInfo();
  await regenerate();
  // ?select=N deep-links a piece into the inspector (0-based piece index).
  const sel = urlState.get('select');
  if (sel !== null && state.result && state.result.pattern) selectPiece(Number(sel));
}

async function init() {
  const select = $('recipe-select');
  // Warm the WASM module before the first draft so the status line times the
  // re-evaluation itself, not the one-off engine download.
  const warmup = loadEngine().catch(() => {});
  try {
    const res = await fetch('recipes/index.json?v=131');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.recipes = (await res.json()).recipes;
  } catch (e) {
    $('status').textContent = `Recipe list failed to load (${e.message}). The studio needs the site served over http(s).`;
    return;
  }
  for (const r of state.recipes) {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = r.title;
    select.appendChild(opt);
  }
  select.addEventListener('change', () => {
    const entry = state.recipes.find((r) => r.id === select.value);
    if (entry) loadRecipe(entry).catch((e) => { $('status').textContent = e.message; });
  });
  $('dl-svg').addEventListener('click', downloadSVG);
  $('dl-pdf').addEventListener('click', downloadPDF);
  await warmup;
  if (state.recipes.length) await loadRecipe(state.recipes[0]);
}

init().catch((e) => { $('status').textContent = `Studio failed to start: ${e.message}`; });
