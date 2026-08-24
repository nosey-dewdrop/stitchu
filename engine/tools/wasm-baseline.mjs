#!/usr/bin/env node
// wasm-baseline.mjs — V0-0E BASELINE (v6 §4.1): the engine that SHIPS is the
// wasm one, so the numbers a later phase is measured against must come from
// the wasm module, not from a green native ctest.
//
// It measures three things and prints nothing it did not measure:
//   1) PARITY   native golden_dump CSV  vs  the SAME spec matrix run through
//               dist/stitchu-engine.js draftJSON, re-serialised with the same
//               rules golden_dump.cpp uses (Facing pieces skipped, facing
//               fabric adder subtracted, the Swift double-prefix rename).
//   2) LATENCY  one draft, N repeats, median + min + max + p95 (ms).
//   3) HEAP     what the module lets us see. The build pins
//               INITIAL_MEMORY=64MB / ALLOW_MEMORY_GROWTH=0, and the module
//               exports ONLY the four embind functions — no HEAPU8, no
//               _malloc — so the wasm-internal high-water mark is NOT
//               readable from here. What IS measurable: the process memory
//               either side of a long run, and whether a long run survives
//               inside a heap that cannot grow (an unbounded leak would
//               abort). Both are reported as what they are.
//
// This tool decides NOTHING. It sets no threshold and changes no code.
//   run: node engine/tools/wasm-baseline.mjs [--reps N] [--soak N]
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const engineDir = join(here, '..');
const root = join(engineDir, '..');
const require2 = createRequire(import.meta.url);

const argv = process.argv.slice(2);
const argN = (flag, dflt) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? parseInt(argv[i + 1], 10) : dflt;
};
const REPS = argN('--reps', 200);
const SOAK = argN('--soak', 5000);

const engine = await require2(join(engineDir, 'dist/stitchu-engine.js'))();
const { VOCAB } = await import(join(root, 'web/js/vocab.gen.js'));
const FACING = VOCAB.edgeFinish.values.indexOf('facing');
if (FACING < 0) { console.error('FATAL: edgeFinish has no "facing" value'); process.exit(2); }

// ---------------------------------------------------------------- 1. PARITY
// The bodies golden_dump.cpp pins (cm).
const BODIES = {
  EU38: { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40.5, armLength: 58, neck: 35 },
  pear: { bust: 96, waist: 70, hip: 116, shoulder: 37, backLength: 41, armLength: 58, neck: 36 },
  bigNeckSmallShoulder: { bust: 100, waist: 84, hip: 104, shoulder: 30, backLength: 40, armLength: 58, neck: 50 },
};

// The label IS the spec (golden_dump.cpp builds it from raw(enum)), so it is
// parsed back rather than re-listed — a matrix listed twice drifts once.
function specFromLabel(label) {
  const p = label.split('/');
  if (p[0] === 'skirt') {
    return { garment: 'skirt', shaping: 'dart', skirtStyle: p[1], skirtLength: p[2] };
  }
  if (p[0] === 'dress') {
    const [style, len] = p[3].split('.');
    return { garment: 'dress', shaping: 'dart', edgeFinish: FACING, neckline: p[1],
             skirtStyle: p[2], skirtLength: 'midi', sleeveStyle: style, sleeveLength: len };
  }
  if (p[0] === 'top') {
    const [style, len] = p[3].split('.');
    return { garment: 'top', shaping: 'dart', edgeFinish: FACING, neckline: p[1],
             topLength: p[2], sleeveStyle: style, sleeveLength: len };
  }
  throw new Error(`unknown label shape: ${label}`);
}

const f4 = (v) => v.toFixed(4);
function dumpCommands(kind, commands, prefix, out) {
  commands.forEach((c, i) => {
    if (c.type === 'move') out.push(`${prefix},${kind},${i},move,${f4(c.x)},${f4(c.y)}`);
    else if (c.type === 'line') out.push(`${prefix},${kind},${i},line,${f4(c.x)},${f4(c.y)}`);
    else if (c.type === 'curve') out.push(`${prefix},${kind},${i},curve,${f4(c.x)},${f4(c.y)},${f4(c.cp1x)},${f4(c.cp1y)},${f4(c.cp2x)},${f4(c.cp2y)}`);
    else if (c.type === 'close') out.push(`${prefix},${kind},${i},close`);
  });
}

// golden_dump.cpp: facings are post-Swift, so they are skipped and their
// fabric adder (BodiceBlock::facingFabricMeters, engine/src/bodice.hpp:314)
// is subtracted for every non-skirt garment.
const FACING_FABRIC_METERS = 0.2;

function wasmBlock(bodyName, label) {
  const spec = specFromLabel(label);
  const res = JSON.parse(engine.draftJSON(spec, BODIES[bodyName]));
  if (res.error) return { error: res.error, lines: [] };
  const d = res.pattern;
  const fabric = spec.garment === 'skirt' ? d.fabricMeters140 : d.fabricMeters140 - FACING_FABRIC_METERS;
  const lines = [`${bodyName}|${label}|fabric,${f4(fabric)}`];
  let p = 0;
  for (const piece of d.pieces) {
    if (piece.name.includes('Facing')) continue;
    let name = piece.name;
    if (spec.garment === 'dress' && name === 'Skirt Panel (quarter circle)') name = 'Skirt Skirt Panel (quarter circle)';
    const prefix = `${bodyName}|${label}|piece${p}:${name}`;
    dumpCommands('outline', piece.commands, prefix, lines);
    dumpCommands('marking', piece.markings, prefix, lines);
    p += 1;
  }
  return { error: null, lines };
}

// Native side: run the ALREADY-BUILT golden_dump binary. Nothing is rebuilt
// and engine/build is only read from (a parallel ctest may be using it).
const nativeBin = join(engineDir, 'build/golden_dump');
const nativeCSV = execFileSync(nativeBin, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
const nativeLines = nativeCSV.trimEnd().split('\n');

// Group native lines by body|label, keeping order.
const blocks = new Map();
const order = [];
for (const line of nativeLines) {
  const key = line.slice(0, line.indexOf('|', line.indexOf('|') + 1));
  if (!blocks.has(key)) { blocks.set(key, []); order.push(key); }
  blocks.get(key).push(line);
}

const nums = (line) => {
  const parts = line.split(',');
  const out = [];
  for (const s of parts) { const v = Number(s); if (s !== '' && Number.isFinite(v)) out.push(v); }
  return out;
};

let blocksTotal = 0, blocksIdentical = 0, blocksShapeDiff = 0, blocksErrored = 0;
let linesTotal = 0, linesIdentical = 0, linesNumericDiff = 0;
let worst = { d: 0, where: '' };
const shapeExamples = [], valueExamples = [], errorExamples = [];

for (const key of order) {
  const sep = key.indexOf('|');
  const bodyName = key.slice(0, sep);
  const label = key.slice(sep + 1);
  const nat = blocks.get(key);
  blocksTotal += 1;
  const { error, lines: was } = wasmBlock(bodyName, label);
  if (error) {
    blocksErrored += 1;
    if (errorExamples.length < 5) errorExamples.push(`${key}  -> ${error}`);
    continue;
  }
  if (was.length !== nat.length) {
    blocksShapeDiff += 1;
    if (shapeExamples.length < 5) shapeExamples.push(`${key}  native ${nat.length} lines, wasm ${was.length} lines`);
    continue;
  }
  let blockClean = true;
  for (let i = 0; i < nat.length; i++) {
    linesTotal += 1;
    if (nat[i] === was[i]) { linesIdentical += 1; continue; }
    blockClean = false;
    const a = nat[i].split(',')[0], b = was[i].split(',')[0];
    if (a !== b) {
      blocksShapeDiff += 1;
      if (shapeExamples.length < 5) shapeExamples.push(`${key} line ${i}: prefix differs\n    native: ${nat[i]}\n    wasm  : ${was[i]}`);
      blockClean = false;
      break;
    }
    linesNumericDiff += 1;
    const na = nums(nat[i]), nb = nums(was[i]);
    for (let j = 0; j < Math.min(na.length, nb.length); j++) {
      const d = Math.abs(na[j] - nb[j]);
      if (d > worst.d) worst = { d, where: `${nat[i]}  |  ${was[i]}` };
    }
    if (valueExamples.length < 5) valueExamples.push(`native: ${nat[i]}\n    wasm  : ${was[i]}`);
  }
  if (blockClean) blocksIdentical += 1;
}

console.log('=== 1. WASM PARITY (native golden_dump vs dist/stitchu-engine.js draftJSON) ===');
console.log(`native binary      : ${nativeBin}`);
console.log(`wasm bundle        : ${join(engineDir, 'dist/stitchu-engine.js')}`);
console.log(`spec x body blocks : ${blocksTotal}`);
console.log(`  identical        : ${blocksIdentical}`);
console.log(`  shape differs    : ${blocksShapeDiff}`);
console.log(`  wasm errored     : ${blocksErrored}`);
console.log(`lines compared     : ${linesTotal}`);
console.log(`  byte-identical   : ${linesIdentical}`);
console.log(`  numeric differs  : ${linesNumericDiff}`);
console.log(`worst abs delta    : ${worst.d.toExponential(4)} mm`);
if (worst.where) console.log(`  at               : ${worst.where}`);
for (const e of errorExamples) console.log(`  ERROR  ${e}`);
for (const e of shapeExamples) console.log(`  SHAPE  ${e}`);
for (const e of valueExamples) console.log(`  VALUE  ${e}`);

// --------------------------------------------------------------- 2. LATENCY
// One draft = one draftJSON call + the JSON.parse the web layer always does
// (web/js/engine.js draft()), because that is what a user waits for. Both are
// timed separately so a later phase knows which side moved.
const LSPEC = { garment: 'dress', shaping: 'dart', neckline: 'scoop', skirtStyle: 'aLine',
                skirtLength: 'midi', sleeveStyle: 'straight', sleeveLength: 'long', topLength: 'hip' };
const LBODY = BODIES.EU38;

function stats(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  return { n: s.length, min: s[0], median: q(0.5), p95: q(0.95), max: s[s.length - 1] };
}
const fmt = (o) => `n=${o.n}  median ${o.median.toFixed(3)}  min ${o.min.toFixed(3)}  p95 ${o.p95.toFixed(3)}  max ${o.max.toFixed(3)}  (ms)`;

for (let i = 0; i < 20; i++) JSON.parse(engine.draftJSON(LSPEC, LBODY)); // warm-up, not counted
const tCall = [], tFull = [];
for (let i = 0; i < REPS; i++) {
  const a = performance.now();
  const json = engine.draftJSON(LSPEC, LBODY);
  const b = performance.now();
  JSON.parse(json);
  const c = performance.now();
  tCall.push(b - a);
  tFull.push(c - a);
}
const jsonBytes = engine.draftJSON(LSPEC, LBODY).length;

console.log('\n=== 2. SINGLE DRAFT LATENCY (node, wasm module) ===');
console.log(`spec               : dress/scoop/aLine/straight.long, body EU38`);
console.log(`draftJSON only     : ${fmt(stats(tCall))}`);
console.log(`draftJSON + parse  : ${fmt(stats(tFull))}`);
console.log(`json payload       : ${jsonBytes} bytes`);

// A whole EU size run is what a seller actually buys; timed once, not a band.
const tGrade = [];
for (let i = 0; i < Math.min(REPS, 30); i++) {
  const a = performance.now();
  JSON.parse(engine.gradeJSON(LSPEC, { from: 'EU34', to: 'EU48' }));
  tGrade.push(performance.now() - a);
}
console.log(`gradeJSON EU34-48  : ${fmt(stats(tGrade))}`);

// ------------------------------------------------------------------ 3. HEAP
console.log('\n=== 3. HEAP / LEAK ===');
console.log('build pins INITIAL_MEMORY=64MB, ALLOW_MEMORY_GROWTH=0 (engine/build-wasm.sh),');
console.log('and the module exports only:', Object.keys(engine).sort().join(', '));
console.log('-> HEAPU8 / _malloc are NOT exported, so the wasm-internal high-water');
console.log('   mark is NOT readable from here. Reported instead: process memory and');
console.log('   survival of a soak inside a heap that cannot grow.');

global.gc && global.gc();
const m0 = process.memoryUsage();
let soakOK = true, soakErr = '';
const tSoak0 = performance.now();
try {
  for (let i = 0; i < SOAK; i++) JSON.parse(engine.draftJSON(LSPEC, LBODY));
} catch (e) { soakOK = false; soakErr = String(e && e.message || e); }
const tSoak = performance.now() - tSoak0;
global.gc && global.gc();
const m1 = process.memoryUsage();

const mb = (v) => (v / 1048576).toFixed(2);
console.log(`soak repeats       : ${SOAK}  -> ${soakOK ? 'SURVIVED (no abort, no heap exhaustion)' : 'ABORTED: ' + soakErr}`);
console.log(`soak wall time     : ${tSoak.toFixed(1)} ms  (${(tSoak / SOAK).toFixed(3)} ms/draft)`);
console.log(`process rss        : ${mb(m0.rss)} -> ${mb(m1.rss)} MB   delta ${mb(m1.rss - m0.rss)} MB`);
console.log(`process external   : ${mb(m0.external)} -> ${mb(m1.external)} MB   delta ${mb(m1.external - m0.external)} MB`);
console.log(`node heapUsed      : ${mb(m0.heapUsed)} -> ${mb(m1.heapUsed)} MB   delta ${mb(m1.heapUsed - m0.heapUsed)} MB`);
console.log(`arrayBuffers       : ${mb(m0.arrayBuffers)} -> ${mb(m1.arrayBuffers)} MB   delta ${mb(m1.arrayBuffers - m0.arrayBuffers)} MB`);
console.log('NOTE: process rss/external here also covers V8, not only the wasm heap.');
console.log('      The load-bearing number is the SURVIVAL line: a leaking draftJSON');
console.log('      cannot survive N repeats in a non-growable 64MB heap.');
