#!/usr/bin/env node
// oran-kablo-proof.mjs — RULES-3 gorsel kanit: OLCULEN oranlar kullanici
// akisindan MOTORA kadar gider (foto -> measure.js -> applyMeasuredRatios ->
// pickSkirtFullness + refreshSkirtLengthMM -> wasm draft -> Skirt Front).
// Offline + deterministik: ag yok, vision kredisi yok. benchmark-58 fotolari
// SADECE lokal test girdisi olarak okunur; PNG'ye foto pikseli GIRMEZ —
// kanit gorseli yalnizca motor ciktisi (kalip konturu) + sayilardir.
//
//   foto A (13.50.04, shift flat)   -> dar etek  -> straight + kisa mm
//   foto B (13.50.29, fit-and-flare)-> genis etek-> gathered + farkli mm
//   ayni foto A, iki farkli govde   -> ayni oran, farkli mm (oran x govde)
//
// Etiketler (garment/neckline/shaping) LLM'in isi; burada offline sabitlenir —
// sayilar ise TAMAMEN olcumden gelir (LLM ratios{} bu boru hattinda yok).
//
// Usage: node engine/tools/oran-kablo-proof.mjs
// Output: reports/gate/oran-kablo-2026-07-27/foto-oran-kablo-proof.png + stdout JSON
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import { measureGarment } from '../../web/js/measure.js';
import { applyMeasuredRatios, pickSkirtFullness, refreshSkirtLengthMM } from '../../web/js/vision-bridge.js';
import { pathD, bounds } from '../../web/js/sheet.js';
import { imageFileToImageData, cropImage } from './photo-pixels.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PHOTOS = join(ROOT, 'benchmark-58', 'photos-1024');
const OUTDIR = join(ROOT, 'reports', 'gate', 'oran-kablo-2026-07-27');
mkdirSync(OUTDIR, { recursive: true });

const backend = await import(join(ROOT, 'backend/spec-core.js'));
const createEngine = (await import(join(ROOT, 'engine/dist/stitchu-engine.js'))).default;
const eng = await createEngine();

// create.js DEMO_BODY (EU38) + a real-user body — the same pair the ctest uses.
const DEMO = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40, armLength: 58, neck: 35 };
const USER = { bust: 102, waist: 84, hip: 108, shoulder: 39, backLength: 44, armLength: 58, neck: 36 };

const PHOTO = {
  A: { tag: '13.50.04', crop: [335, 300, 460, 600], note: 'mini shift flat (dar etek)' },
  B: { tag: '13.50.29', crop: [268, 192, 415, 428], note: 'tartan fit-and-flare flat (genis etek)' },
};

function measurePhoto(p) {
  const full = imageFileToImageData(
    join(PHOTOS, `Ekran Resmi 2026-07-15 ${p.tag}.jpg`), join('/tmp', `oran-proof-${p.tag}.bmp`));
  const m = measureGarment(cropImage(full, p.crop));
  if (!m.ok) throw new Error(`${p.tag}: olcum reddetti (${m.reason}) — kanit uretilemez`);
  return m;
}

// The exact user-flow chain: measured ratios -> seen -> fullness + mm -> spec.
function buildSpec(measured, body) {
  const seen = { garment: 'dress', waistline: 'natural', neckline: 'crew' }; // etiketler (LLM isi, offline sabit)
  const source = applyMeasuredRatios(seen, measured);
  const fullness = pickSkirtFullness(seen);
  const mm = refreshSkirtLengthMM(0, seen, body, false);
  const spec = {
    garment: 'dress', neckline: 'crew', shaping: 'dart',
    skirtStyle: fullness || 'aLine', skirtLength: 'midi', skirtLengthMM: mm,
  };
  return { spec, source, fullness, mm };
}

function draftSkirtFront(spec, body) {
  const val = backend.validateDraftRequest({ spec, measurements: body });
  if (val.error) throw new Error(`validate red: ${val.detail}`);
  const out = JSON.parse(eng.draftJSON(backend.engineSpec(val.spec), { ...body, upperBust: 0 }));
  if (out.issues && out.issues.length) throw new Error(`motor issues: ${JSON.stringify(out.issues)}`);
  const piece = out.pattern.pieces.find((p) => p.name === 'Skirt Front');
  if (!piece) throw new Error('Skirt Front bulunamadi');
  return piece;
}

const mA = measurePhoto(PHOTO.A);
const mB = measurePhoto(PHOTO.B);

const cases = [
  { id: 'A + EU38 demo govde', m: mA, body: DEMO, photo: PHOTO.A },
  { id: 'A + kullanici govdesi', m: mA, body: USER, photo: PHOTO.A },
  { id: 'B + kullanici govdesi', m: mB, body: USER, photo: PHOTO.B },
];
const results = [];
for (const c of cases) {
  const { spec, source, fullness, mm } = buildSpec(c.m, c.body);
  const piece = draftSkirtFront(spec, c.body);
  const b = bounds(piece);
  results.push({
    id: c.id, photo: c.photo.tag, note: c.photo.note, source,
    measured: { lengthToWidth: c.m.ratios.lengthToWidth, hemToWaistWidth: c.m.ratios.hemToWaistWidth, confidence: c.m.confidence },
    skirtStyle: spec.skirtStyle, fullness, skirtLengthMM: mm,
    pieceHeightMM: Math.round((b.maxY - b.minY) * 10) / 10,
    pieceWidthMM: Math.round((b.maxX - b.minX) * 10) / 10,
    piece, b,
  });
}

// ---- kanit tutarliligi (kanitla, iddia etme) ----
if (results[0].skirtLengthMM === results[1].skirtLengthMM) throw new Error('ayni foto iki govdede ayni mm — kablo olu');
if (results[1].skirtLengthMM === results[2].skirtLengthMM) throw new Error('farkli L/W ayni mm — kablo olu');
if (results[1].skirtStyle === results[2].skirtStyle) throw new Error('farkli hem/bel ayni fullness sinifi — tuketici olu');
if (results[0].pieceHeightMM === results[2].pieceHeightMM) throw new Error('motor ciktisi mm farkini gostermiyor');

// ---- SVG: uc Skirt Front konturu yan yana, sayilarla ----
const S = 0.32; // mm -> px
const PADX = 40;
const HEAD = 74;
let x = PADX;
let maxH = 0;
let inner = '';
for (const r of results) {
  const w = (r.b.maxX - r.b.minX) * S;
  const h = (r.b.maxY - r.b.minY) * S;
  maxH = Math.max(maxH, h);
  inner += `<g transform="translate(${x - r.b.minX * S}, ${HEAD - r.b.minY * S})">` +
    `<path d="${pathD(piecePath(r.piece), S)}" fill="none" stroke="#1f3a5f" stroke-width="2"/></g>`;
  inner += `<text x="${x}" y="26" font-family="Helvetica" font-size="15" fill="#111">${r.id}</text>` +
    `<text x="${x}" y="44" font-family="Helvetica" font-size="12" fill="#555">foto ${r.photo}: L/W ${r.measured.lengthToWidth} olculdu, hem/bel ${r.measured.hemToWaistWidth} -> ${r.skirtStyle}</text>` +
    `<text x="${x}" y="60" font-family="Helvetica" font-size="12" fill="#8f2038">skirtLengthMM ${r.skirtLengthMM} -> Skirt Front ${r.pieceHeightMM} mm</text>`;
  x += Math.max(w, 300) + PADX;
}
function piecePath(piece) { return (piece.cutLine && piece.cutLine.length) ? piece.cutLine : piece.commands; }
const W = Math.ceil(x);
const H = Math.ceil(HEAD + maxH + 40);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
  `<rect width="${W}" height="${H}" fill="#fff"/>` +
  `<text x="${PADX}" y="${H - 14}" font-family="Helvetica" font-size="12" fill="#8a8a8a">` +
  `olculen oran -> fullness sinifi + mm -> motor kalibi; kaynak deterministik piksel olcumu, LLM ratios{} bu hatta yok</text>` +
  inner + `</svg>`;

const pngPath = join(OUTDIR, 'foto-oran-kablo-proof.png');
writeFileSync(pngPath, new Resvg(svg, { fitTo: { mode: 'width', value: 1400 } }).render().asPng());

console.log(JSON.stringify(results.map(({ piece, b, ...r }) => r), null, 2));
console.log('\nproof PNG ->', pngPath);
