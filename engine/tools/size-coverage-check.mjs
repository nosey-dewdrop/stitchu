// ============================================================================
// size-coverage-check.mjs — TUR 18 (18C). THE GATE FOR "THE DIAL OFFERS A SIZE
// THE TABLE DOES NOT HAVE".
//
// WHAT IT MEASURED (2026-08-17, before this file existed).
// contract/tables.json -> flat.size stops at EU42: five rows, EU34..EU42.
// The atelier's size dial ships EIGHT: engine/tools/atolye/ingredients.js
// declares SIZES = EU34..EU48 and the dial's range is 0..7. So three of the
// eight positions a visitor can drag to have NO ROW AT ALL, and both consumers
// index the table directly (`SIZE[p.size]` -> `sz.shp`):
//     web/atolye.html:421            (figureOf, the SHIPPED page)
//     engine/flat-engine/_engine-full.mjs:37   (the read-only pen)
//
// WHAT ACTUALLY HAPPENS — measured end to end, not guessed, by running the
// SHIPPED page's own draw() (same extraction atolye-proof.mjs uses), all four
// topology branches x all eight dial positions, 32 runs:
//
//     dress+shoulder   EU34..EU42 OK (5038..5044 B, deterministic)  EU44/46/48 THROW
//     top+shoulder     EU34..EU42 OK (3722..3732 B, deterministic)  EU44/46/48 THROW
//     band             EU34..EU42 OK (3314..3317 B, deterministic)  EU44/46/48 THROW
//     top+band         EU34..EU42 OK (2001..2003 B, deterministic)  EU44/46/48 THROW
//     throw = TypeError: Cannot read properties of undefined (reading 'shp')
//
// So it does NOT draw silently wrong: the engine throws honestly, in EVERY
// branch, EU44/46/48, 12 of 32 (37.5%). THE SILENCE IS IN THE UI. atolye.html
// paint() wraps draw() in `catch (e) { $('stat').textContent = 'cizim hatasi: '
// + e.message; return; }` and that `return` sits ABOVE the lines that update
// the drawing, the size label and every dial readout. So the visitor who drags
// the size dial to EU44 sees THE EU42 DRAWING, still labelled EU42, with every
// readout stale — a small status line is the only signal that anything failed.
// That is exactly this shift's repeated lesson (a silent skip is worse than a
// crash), so it gets a gate.
//
// WHY THIS IS NOT A NAME COMPARISON. Comparing key lists would go green the
// moment somebody typed EU44 into the table with wrong numbers. This gate RUNS
// THE SHIPPED PAGE. It also refuses to pass when it cannot measure: no
// atolye.html, no module script, no branch surviving — all non-zero.
//
// WHOSE FIX IS IT. The missing rows belong to contract/tables.json, which is
// 18B's file this turn — 18C measured and gated, and did NOT invent three rows
// of body numbers (the table's own provenance is already an open question:
// TUR 17 found euSizeChart's 70 numbers have no declared source anywhere in the
// repo). See DAMLA-KUYRUK. engine/flat-engine/* is READ-ONLY (Damla, 19 Jul)
// and was read, never written.
//
// USAGE:  node engine/tools/size-coverage-check.mjs [page.html]
// The optional page argument exists so the gate can be MUTATION-PROVED against
// a fixture page without touching the shipped one. It changes nothing about the
// default run, which is always web/atolye.html.
// ============================================================================
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PAGE = process.argv[2] ? resolve(process.argv[2]) : join(ROOT, 'web/atolye.html');

const die = (msg) => { console.log(`FAIL  OLCULEMEDI: ${msg}`); process.exit(2); };

if (!existsSync(PAGE)) die(`${PAGE} diskte yok — bir kapi girdisi yoksa YESIL basmaz`);
const html = readFileSync(PAGE, 'utf8');
const m = html.match(/<script type="module">\n([\s\S]*?)\n<\/script>/);
if (!m) die('atolye.html icinde modul script yok');
let src = m[1];
const cut = src.indexOf('// TEZGAH');
if (cut === -1) die('atolye.html icinde TEZGAH isareti yok (UI katmani kesilemedi)');
src = src.slice(0, src.lastIndexOf('// ====', cut));

// Every topology branch the atelier can be in, not just the default one.
const BRANCHES = [
  ['dress+shoulder', {}],
  ['top+shoulder', { _garment: 'top' }],
  ['dress+band', { _bodice: 'band' }],
  ['top+band', { _garment: 'top', _bodice: 'band' }],
];

src += `
const __BR = ${JSON.stringify(BRANCHES)};
const __rows = [];
for (const [label, over] of __BR) {
  for (let i = 0; i < SIZES.length; i++) {
    const mk = () => draw(Object.assign(defaultState(), over, { size: i }));
    try { const a = mk(), b = mk(); __rows.push([label, SIZES[i], 'OK', a.length, a === b]); }
    catch (e) { __rows.push([label, SIZES[i], 'THROW', e.message, null]); }
  }
}
const __tableKeys = Object.keys(SIZE).filter((k) => k[0] !== '_');
import { writeFileSync as __wf } from 'node:fs';
__wf(process.env.SIZECOV_OUT, JSON.stringify({ rows: __rows, dial: SIZES, tableKeys: __tableKeys }));
`;

const tmpMod = join(tmpdir(), `sizecov-${process.pid}.mjs`);
const tmpOut = join(tmpdir(), `sizecov-${process.pid}.json`);
writeFileSync(tmpMod, src);
process.env.SIZECOV_OUT = tmpOut;
try { await import(tmpMod); }
catch (e) { die(`sayfanin cizim katmani yuklenemedi: ${e.message}`); }
if (!existsSync(tmpOut)) die('cizim katmani hic satir uretmedi');

const { rows, dial, tableKeys } = JSON.parse(readFileSync(tmpOut, 'utf8'));
if (!rows.length) die('0 olcum satiri — kapi girdisiz YESIL basmaz');

const bad = rows.filter((r) => r[2] !== 'OK');
const nondet = rows.filter((r) => r[2] === 'OK' && r[4] === false);

for (const [label, size, kind, info] of rows) {
  if (kind === 'OK') continue;
  console.log(`FAIL  ${label.padEnd(15)} ${size}  cizim COKTU: ${info}`);
}
for (const [label, size] of nondet) {
  console.log(`FAIL  ${label.padEnd(15)} ${size}  iki kosu ayni bayti vermedi (determinizm)`);
}

const missing = dial.filter((s) => !tableKeys.includes(s));
if (missing.length) {
  console.log(`      kok: contract/tables.json flat.size = [${tableKeys.join(', ')}]`);
  console.log(`      kadran            SIZES            = [${dial.join(', ')}]`);
  console.log(`      cizelgede satiri OLMAYAN beden     = ${missing.join(', ')}`);
  console.log('      not: motor comuyor gorunmuyor — atolye.html paint() hatayi yutuyor ve');
  console.log('           cizim/etiket/okumalar BIR ONCEKI bedende donuyor (sessiz yanlis).');
}

const total = rows.length;
const fails = bad.length + nondet.length;
console.log(`checked: ${BRANCHES.length} topoloji dali x ${dial.length} beden = ${total} cizim`);
console.log(fails
  ? `size-coverage: ${fails} FAIL (${total - fails}/${total} cizildi)`
  : `OK  size-coverage: ${total}/${total} cizim, kadranin her bedeni her dalda ciziliyor.`);
process.exit(fails ? 1 : 0);
