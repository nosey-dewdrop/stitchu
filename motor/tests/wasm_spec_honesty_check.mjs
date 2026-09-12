#!/usr/bin/env node
// wasm_spec_honesty_check.mjs — KART V2-C gate. Judges the SHIPPED boundary
// (engine/dist/stitchu-engine.js, the exact byte web/js/engine.js loads) on the
// one promise RULES.md invariant 1 makes and engine/wasm/bindings.cpp:82 claims
// in a comment:
//
//   "an unknown or unsupported value is an ERROR, never a silent drop or coerce"
//
// Two measured defects made that promise false on the shipped path
// (GECE/V0-0D.md §4a and §5 item 1); this file is the ratchet that keeps them
// closed. It asserts BEHAVIOUR at the boundary, never a number printed by the
// code under test.
//
//   (a) INT VOCABULARY AXES — an in-between value must be refused BY NAME.
//       Measured before the fix: sleeveCap=1.5 and sleeveCap=1 returned
//       BYTE-IDENTICAL JSON (0.9 -> 0, 2.999 -> 2, -0.5 -> 0), because
//       intField() called v.as<int>() and truncated inside the JS->C++
//       conversion, so parseEnumInt never saw the real value. No error, no
//       warning, `issues` unchanged. Every int axis in engine/vocab.json is
//       tested, not a sample.
//
//   (b) THE OUTPUT MUST BE JSON — always, for every collarType. Measured
//       before the fix: a body object whose keys did not match (or were
//       missing) arrived as a person 0 cm wide; the neck facing normalised a
//       zero-length shoulder vector (0/0), and the resulting NaN was printed by
//       the writer as the bare token `nan`. That is not JSON: the browser's
//       JSON.parse throws SyntaxError BEFORE any caller can read the `issues`
//       array in which the validator had ALREADY said
//       "[finite] Front Neck Facing: non-finite coordinate". An honest verdict
//       destroyed by the writer is not an honest verdict.
//
//   usage: node wasm_spec_honesty_check.mjs [path/to/stitchu-engine.js]
//   (the optional argument is what lets the BOŞ TEST run this same file
//    against a pre-phase engine build and watch it go red)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');

const enginePath = process.argv[2]
  ? resolve(process.argv[2])
  : join(root, 'engine/dist/stitchu-engine.js');

let fails = 0;
const fail = (m) => { console.error('FAIL:', m); fails += 1; };
let checks = 0;
const ok = () => { checks += 1; };

const createEngine = (await import(enginePath)).default;
const eng = await createEngine();

// A real EU38 body — the same one the parity tests pin. Every field present and
// positive, so nothing below is testing a degenerate body by accident.
const BODY = {
  bust: 88, waist: 70, hip: 94, shoulder: 37,
  backLength: 40.5, armLength: 58, neck: 35,
};

// A base spec that draws a whole garment (bodice + skirt), so a collar has a
// real neckline to true against.
const BASE = {
  garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
  neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short',
  skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
};

// The vocabulary IS the source of truth for which axes are int-typed and how
// many members each has — this test never hardcodes a count.
const VOCAB = JSON.parse(readFileSync(join(root, 'engine/vocab.json'), 'utf8')).fields;

// The axes the wasm boundary reads as INTEGERS (web/js/engine.js intValue()
// converts the word to this index before the call). String axes are covered by
// specparse's parseEnum and were already honest (GECE/V0-0D.md §4b).
const INT_AXES = [
  'tieClosure', 'sleeveCap', 'collarType', 'collarEdge', 'gatherType', 'gatherZone',
  'backOpening', 'laceUpBack', 'wrapFront', 'backSlit', 'ruffledStraps', 'peplum',
  'hemFlounce', 'placketStyle', 'edgeFinish', 'pocketStyle', 'cuffStyle', 'hemShape',
  'shoulderStyle', 'buttonRow', 'exposedZip', 'backDetail', 'bardotStyle', 'cupSeam',
  'locketTop', 'yoke', 'boxPleat',
];

// Cross-field coherence (specparse.hpp validateSpecCross) refuses some axes on
// a plain dress before the value is ever judged, so those axes get the spec
// they need. The point of the test is the VALUE, not the combination.
const SPEC_FOR = {
  sleeveCap: { sleeveStyle: 'straight' },
  cuffStyle: { sleeveStyle: 'straight' },
  ruffledStraps: { sleeveStyle: 'none' },
};

const call = (spec, body = BODY) => {
  try { return { text: String(eng.draftJSON(spec, body)) }; }
  catch (e) { return { threw: e instanceof Error ? e.message : String(e) }; }
};

// ---------------------------------------------------------------------------
// (a) INT AXES: an in-between value is a WRONG value and must be named.
// ---------------------------------------------------------------------------
console.log('=== (a) int vocabulary axes: in-between value refused by name ===');
for (const axis of INT_AXES) {
  const field = VOCAB[axis];
  if (!field) { fail(`vocab.json has no field '${axis}' — the axis list drifted from the vocabulary`); continue; }
  const count = field.values.length;
  const spec = { ...BASE, ...(SPEC_FOR[axis] || {}) };

  // The fractional value sits strictly between two REAL members, so "it is out
  // of range anyway" can never explain a pass.
  const between = count >= 2 ? 0.5 : 0.5;
  const probes = [
    [between, 'fractional between two members'],
    [count - 1 + 0.5, 'fractional above the last member'],
    [-0.5, 'fractional negative'],
    [Number.NaN, 'NaN'],
    [Number.POSITIVE_INFINITY, 'Infinity'],
  ];

  for (const [value, why] of probes) {
    const r = call({ ...spec, [axis]: value });
    const msg = r.threw ?? (() => {
      let o; try { o = JSON.parse(r.text); } catch { return null; }
      return o.error ?? null;
    })();
    if (msg === null) {
      fail(`${axis} = ${value} (${why}): accepted silently — no error, JSON came back as a pattern. ` +
           `That is the coercion RULES invariant 1 forbids.`);
      continue;
    }
    if (!msg.includes(axis)) {
      fail(`${axis} = ${value} (${why}): refused, but the message does not name the axis: "${msg}"`);
      continue;
    }
    ok();
  }

  // The two silent-substitution pairs measured in GECE/V0-0D.md §4a: the
  // fractional value must NOT produce the truncated member's drawing.
  if (count >= 2) {
    const truncated = call({ ...spec, [axis]: 1 });
    const fractional = call({ ...spec, [axis]: 1.5 });
    if (!truncated.threw && !fractional.threw && truncated.text === fractional.text) {
      fail(`${axis}: 1.5 and 1 return BYTE-IDENTICAL JSON — the value was truncated before the vocabulary saw it`);
    } else ok();
  }

  // The honest half of the boundary must not regress: every REAL member is
  // still accepted, and absence still means the default.
  for (let v = 0; v < count; ++v) {
    const r = call({ ...spec, [axis]: v });
    if (r.threw) { fail(`${axis} = ${v} is a real vocabulary member but the boundary threw: ${r.threw}`); continue; }
    let o; try { o = JSON.parse(r.text); } catch (e) { fail(`${axis} = ${v}: output is not JSON (${e.message})`); continue; }
    if (o.error) fail(`${axis} = ${v} is a real vocabulary member but was refused: ${o.error}`);
    else ok();
  }
}

// ---------------------------------------------------------------------------
// (a2) PLAIN int fields (not vocabulary axes). ruffleTiers is a COUNT: 1.5
// tiers is a wrong value, not a roundable one, and it went through the same
// truncating reader. Without this section a mutation that restores the
// truncation on the plain reader survives the gate (measured: MUTANT M3).
// ---------------------------------------------------------------------------
console.log('=== (a2) plain int fields: fractional count refused by name ===');
for (const [value, why] of [[1.5, 'fractional'], [-0.5, 'fractional negative'],
                            [Number.NaN, 'NaN'], [Number.POSITIVE_INFINITY, 'Infinity']]) {
  const r = call({ ...BASE, ruffleHem: true, ruffleTiers: value });
  const msg = r.threw ?? (() => {
    let o; try { o = JSON.parse(r.text); } catch { return null; }
    return o.error ?? null;
  })();
  if (msg === null) fail(`ruffleTiers = ${value} (${why}): accepted silently — the count was truncated`);
  else if (!msg.includes('ruffleTiers')) fail(`ruffleTiers = ${value} (${why}): refused without naming the field: "${msg}"`);
  else ok();
}
for (const tiers of [1, 2, 3, 4, 5]) {
  const r = call({ ...BASE, ruffleHem: true, ruffleTiers: tiers });
  if (r.threw) { fail(`ruffleTiers = ${tiers} is a whole count but the boundary threw: ${r.threw}`); continue; }
  let o; try { o = JSON.parse(r.text); } catch (e) { fail(`ruffleTiers = ${tiers}: not JSON (${e.message})`); continue; }
  if (o.error) fail(`ruffleTiers = ${tiers} is a whole count but was refused: ${o.error}`);
  else ok();
}

// ---------------------------------------------------------------------------
// (b) collarType 0..6: the output is JSON, and it carries no NaN/Infinity.
// ---------------------------------------------------------------------------
console.log('=== (b) collarType 0..N: valid JSON, finite coordinates ===');
const collarCount = VOCAB.collarType.values.length;

// The finiteness walk is over the PARSED object, so it cannot be fooled by a
// substring: every number anywhere in the pattern must be finite.
function nonFinite(node, path = '$') {
  if (typeof node === 'number') return Number.isFinite(node) ? [] : [`${path} = ${node}`];
  if (Array.isArray(node)) return node.flatMap((v, i) => nonFinite(v, `${path}[${i}]`));
  if (node && typeof node === 'object')
    return Object.entries(node).flatMap(([k, v]) => nonFinite(v, `${path}.${k}`));
  return [];
}

// Necklines + garments that change how the neckline (hence the collar) is
// drafted — the same spread GECE/V0-0D.md §5 used.
const COLLAR_BASES = [
  ['dress+crew+sleeveless', { ...BASE }],
  ['dress+crew+straight-sleeve', { ...BASE, sleeveStyle: 'straight' }],
  ['top+crew', { ...BASE, garment: 'top' }],
  ['dress+scoop', { ...BASE, neckline: 'scoop' }],
  ['dress+vNeck', { ...BASE, neckline: 'vNeck' }],
];

for (const [label, spec] of COLLAR_BASES) {
  for (let ct = 0; ct < collarCount; ++ct) {
    const r = call({ ...spec, collarType: ct });
    if (r.threw) { fail(`collarType=${ct} @ ${label}: the boundary threw: ${r.threw}`); continue; }
    if (/(^|[^"\w])(nan|-?inf(inity)?)([^"\w]|$)/i.test(r.text))
      fail(`collarType=${ct} @ ${label}: output carries a bare non-JSON token (nan/inf)`);
    let o;
    try { o = JSON.parse(r.text); }
    catch (e) { fail(`collarType=${ct} @ ${label}: output is NOT valid JSON — ${e.message}`); continue; }
    if (o.error) { fail(`collarType=${ct} @ ${label}: refused a real vocabulary member: ${o.error}`); continue; }
    const bad = nonFinite(o.pattern, 'pattern');
    if (bad.length) fail(`collarType=${ct} @ ${label}: ${bad.length} non-finite number(s), first: ${bad[0]}`);
    else if ((o.issues || []).length) fail(`collarType=${ct} @ ${label}: validator issues: ${o.issues.join(' | ')}`);
    else ok();
  }
}

// ---------------------------------------------------------------------------
// (b2) The INPUT that produced those NaNs must be refused by name, not drafted.
// A missing measurement is not a measurement of zero.
// ---------------------------------------------------------------------------
console.log('=== (b2) a body that is not a body is refused by name ===');
const BAD_BODIES = [
  ['empty object', {}],
  ['wrong key spelling (bustCM instead of bust)', { bustCM: 88, waistCM: 70, hipCM: 94 }],
  ['one field missing (shoulder)', { ...BODY, shoulder: undefined }],
  ['one field zero (shoulder)', { ...BODY, shoulder: 0 }],
  ['one field negative (neck)', { ...BODY, neck: -35 }],
  ['one field NaN (bust)', { ...BODY, bust: Number.NaN }],
];
for (const [label, body] of BAD_BODIES) {
  const r = call({ ...BASE, collarType: 4 }, body);
  const msg = r.threw ?? (() => {
    let o; try { o = JSON.parse(r.text); } catch { return null; }
    return o.error ?? null;
  })();
  if (msg === null) { fail(`body "${label}": drafted a pattern instead of refusing`); continue; }
  if (!/body/i.test(msg)) { fail(`body "${label}": refused, but the message does not say which input: "${msg}"`); continue; }
  ok();
}
// ...and the honest half: a full body still drafts, and upperBust stays optional.
for (const [label, body] of [['full body', BODY], ['upperBust omitted', { ...BODY, upperBust: 0 }]]) {
  const r = call({ ...BASE, collarType: 4 }, body);
  if (r.threw) { fail(`body "${label}": threw ${r.threw}`); continue; }
  let o; try { o = JSON.parse(r.text); } catch (e) { fail(`body "${label}": not JSON (${e.message})`); continue; }
  if (o.error) fail(`body "${label}": refused a valid body: ${o.error}`);
  else ok();
}

console.log(`\nengine: ${enginePath}`);
console.log(`${checks} assertions passed, ${fails} FAILED`);
process.exit(fails ? 1 : 0);
