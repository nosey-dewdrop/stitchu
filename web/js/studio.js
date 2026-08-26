// studio.js — live recipe editor (PIPELINE Aşama 2, KANVAS).
// The model is the recipe document + the C++ interpreter in WASM
// (engine.draftRecipeJSON via engine.js draftRecipe). This file holds ZERO
// pattern math: it reads the recipe only to build the form (which measurements,
// which params, their declared ranges), hands every input straight to the
// engine, and draws whatever geometry comes back. Change a value, the whole
// pattern is re-evaluated from formulas; the SVG is an export format, nothing
// more (PIPELINE: "resim yoktur, model vardır").
import { draftRecipe, loadEngine } from './engine.js?v=137';
// The take-it-home path lives in ONE module for the whole site (download.js).
// It used to live here, and only here, which is why create.html could not offer
// a single file — see the header of download.js.
import {
  layoutPieces, pieceSVG, escapeXML, saveSVG, saveDXF, saveA4Pdf,
} from './download.js?v=137';

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

// ANAYASA flat language: thin dark contour + ONE pastel fill per piece — the
// fills themselves are applied by download.js pieceSVG; INK is the label colour
// this file writes around them.
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
  factory: [],        // factory/index.json packs (pre-built graded EU size runs)
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
    $('dl-dxf').disabled = true;
    return;
  }
  issuesBox.hidden = out.issues.length === 0;
  if (out.issues.length) issuesBox.textContent = out.issues.join(' · ');
  const blocked = out.issues.length > 0;
  $('dl-svg').disabled = blocked;
  $('dl-pdf').disabled = blocked;
  $('dl-dxf').disabled = blocked;

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

// ----------------------------------------------------- SVG / DXF downloads
// The writers themselves are in download.js (shared with create.html); this
// file only supplies the studio's state and its file names.
function exportBase() {
  const meas = Object.entries(state.measurements).map(([k, v]) => `${k}${v}`).join('-');
  const params = Object.entries(state.params).map(([k, v]) => `${k}${v}`).join('-');
  return `${state.doc.id.replace(/\./g, '-')}-${meas}-${params}`;
}

function downloadSVG() {
  if (!state.result || !state.result.pattern || state.result.issues.length) return;
  saveSVG(state.result.pattern, `${exportBase()}.svg`);
}

// DXF-AAMA/ASTM interchange for THIS body — the industry file. It is drafted
// through the wasm dxfRecipeJSON path, whose output is byte-identical to the
// native dxf-export tool the ezdxf/mm-parity proof runs on (ctest
// dxf_wasm_parity): what downloads is the exact motor geometry, not a redraw.
async function downloadDXF() {
  if (!state.result || !state.result.pattern || state.result.issues.length) return;
  const btn = $('dl-dxf');
  const label = btn.textContent;
  btn.disabled = true; btn.textContent = 'Building DXF…';
  try {
    const refusal = await saveDXF({
      kind: 'recipe',
      recipeText: state.text,
      measurements: state.measurements,
      params: state.params,
    }, `${exportBase()}.dxf`);
    if (refusal) $('status').textContent = `DXF export refused: ${refusal}`;
  } finally {
    btn.textContent = label; btn.disabled = false;
  }
}

// ------------------------------------------------------------ factory pack
// The pre-built graded EU34–48 production package for the SELECTED recipe at its
// default parameter (web/factory/<id>.zip, built by engine/tools/gen-factory-
// pack.mjs with the native tech-pack tool: manifest + one graded DXF per size +
// PDF spec sheet). A factory size run grades one design over the standard size
// chart, so it is complete without the shopper's custom body — honest, real
// native output, not fabricated. Absent pack -> the button stays disabled.
function factoryPackFor(id) {
  return state.factory.find((p) => p.id === id) || null;
}
function refreshFactoryButton() {
  const btn = $('dl-factory');
  const note = $('factory-note');
  const pack = state.doc ? factoryPackFor(state.doc.id) : null;
  btn.disabled = !pack;
  if (pack) {
    note.textContent =
      `A graded EU34 to 48 production package for this demo recipe at its default ` +
      `${pack.param} (${pack.paramMM} mm): machine manifest, one graded DXF per size, ` +
      `marker at ${pack.fabricWidthMM} mm width, and a human-readable PDF spec sheet ` +
      `(${pack.gradedSizesClean}/${pack.gradedSizesTotal} sizes clean). A factory size run ` +
      `grades one design across the standard chart, so a buyer picks their size from the table.`;
  } else {
    note.textContent = 'No prepared factory pack is published for this recipe yet.';
  }
}
function downloadFactoryPack() {
  const pack = state.doc ? factoryPackFor(state.doc.id) : null;
  if (!pack) return;
  const a = document.createElement('a');
  a.href = `factory/${pack.file}?v=137`;
  a.download = pack.file;
  a.click();
}

// -------------------------------------------------------------- PDF export
// A REAL FILE, not the print dialog. Until F-İNDİR this button called
// printPattern(), i.e. window.print(): the user had to know to pick "Save as
// PDF" and to set scale to 100%, and on a phone there is no such dialog at all.
// It now writes the vector PDF pdf-core.js builds — the SAME pack
// engine/tools/gen-collection-pattern.mjs publishes, cover + cut list +
// assembly + 3 cm calibration square, then the A4-tiled sheets with register
// marks. One PDF truth for the whole site.
function downloadPDF() {
  if (!state.result || !state.result.pattern || state.result.issues.length) return;
  saveA4Pdf(state.result.pattern, state.doc.title || state.doc.id, `${exportBase()}-a4.pdf`);
}

// ------------------------------------------------------------------ startup
async function loadRecipe(entry) {
  const res = await fetch(`recipes/${entry.file}?v=137`);
  if (!res.ok) throw new Error(`recipe fetch failed: HTTP ${res.status}`);
  state.text = await res.text();
  state.doc = JSON.parse(state.text); // form metadata only; the engine re-parses
  state.selected = -1;
  buildMeasFields();
  buildParamFields();
  renderPieceInfo();
  refreshFactoryButton();
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
    const res = await fetch('recipes/index.json?v=137');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.recipes = (await res.json()).recipes;
  } catch (e) {
    $('status').textContent = `Recipe list failed to load (${e.message}). The studio needs the site served over http(s).`;
    return;
  }
  // Factory-pack index (optional): the pre-built graded size runs per recipe.
  // A missing index just leaves the factory button disabled, never a crash.
  try {
    const fres = await fetch('factory/index.json?v=137');
    if (fres.ok) state.factory = (await fres.json()).packs || [];
  } catch { state.factory = []; }
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
  $('dl-dxf').addEventListener('click', () => { downloadDXF(); });
  $('dl-factory').addEventListener('click', downloadFactoryPack);
  await warmup;
  if (state.recipes.length) await loadRecipe(state.recipes[0]);
}

init().catch((e) => { $('status').textContent = `Studio failed to start: ${e.message}`; });
