#!/usr/bin/env node
// specv2-check.mjs — the garment-spec v2 seal's gate (ctest: specv2_check).
//
// A schema nobody runs is a draft with a .json extension. This is what makes
// H2.1 a seal rather than a second draft. It fails loudly on ANY of:
//
//   1. contract/garment-spec-v2.json unparsable / malformed registry
//   2. the generated schema out of sync with the single source
//   3. an operator marked `shipped` or `flagged` whose declared engine binding
//      no longer exists in engine/src/surfacepattern.hpp  (the anti-rot latch:
//      if 9A renames a field, this contract stops being true and says so)
//   4. an operator marked `absent` that has acquired a binding (the opposite
//      rot: scope grew and the registry lied by omission)
//   5. a declared quantity whose `default` no longer matches the value in
//      surfacepattern.hpp  (the contract claiming a number the engine dropped)
//   6. a topology enum value requiring an operator id that is not in the
//      registry  (a value with fake scope)
//   7. an operator whose status is not one of the three declared statuses
//   8. the three FIXTURES below — the mutation proof the seal is judged on:
//        valid spec        -> ok
//        broken enum       -> invalid, NOT substituted
//        unsupported spec  -> refused BY THE OPERATOR'S NAME
//
// Fixture 3 is the whole point. The bitiş tanımı says the remaining two of ten
// "refuse honestly, naming the missing operator". This test is the machine
// holding us to that sentence.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadContract, checkSpec, refusalSentence, buildSchema, root, SCHEMA_PATH } from './specv2.mjs';

let failures = 0;
const fail = (m) => { console.error('FAIL:', m); failures += 1; };
const ok = (m) => console.log('ok:', m);

// ---- 1. parse ---------------------------------------------------------------
let c;
try { c = loadContract(); ok('contract/garment-spec-v2.json parses'); }
catch (e) { console.error('FAIL: contract/garment-spec-v2.json unparsable:', e.message); process.exit(1); }

// ---- 2. generated schema in sync -------------------------------------------
{
  const want = JSON.stringify(buildSchema(c), null, 2) + '\n';
  let got = null;
  try { got = readFileSync(SCHEMA_PATH, 'utf8'); } catch { /* handled below */ }
  if (got === null) fail('contract/garment-spec-v2.schema.json missing — run node engine/tools/gen-spec-v2.mjs');
  else if (got !== want) fail('contract/garment-spec-v2.schema.json STALE — run node engine/tools/gen-spec-v2.mjs');
  else ok('generated schema in sync with the single source');
}

// ---- 3/4/5. the engine bindings are real ------------------------------------
const hpp = readFileSync(join(root, 'engine/src/surfacepattern.hpp'), 'utf8');
// SheathOptions body only: a binding must live in the spec struct, not anywhere
// in the header (SurfacePattern's OUTPUT fields are not spec fields).
const sheath = (() => {
  const i = hpp.indexOf('struct SheathOptions');
  if (i < 0) return null;
  const j = hpp.indexOf('\n};', i);
  return j < 0 ? null : hpp.slice(i, j);
})();
if (!sheath) fail('could not locate struct SheathOptions in engine/src/surfacepattern.hpp');

const declares = (field) => sheath !== null &&
  new RegExp(`\\b${field}\\s*=`).test(sheath.replace(/\/\/[^\n]*/g, ''));

{
  const STATUSES = new Set(['shipped', 'flagged', 'absent']);
  let bad = 0;
  for (const [id, op] of Object.entries(c.operators)) {
    if (id.startsWith('_')) continue;
    if (!STATUSES.has(op.status)) { fail(`operator '${id}' has undeclared status '${op.status}'`); bad += 1; continue; }
    if (op.status === 'absent') {
      if (op.binds) { fail(`operator '${id}' is absent but declares a binding '${op.binds}' — scope lie`); bad += 1; }
      if (!op.refusalReason) { fail(`absent operator '${id}' has no refusalReason — refusal cannot name it`); bad += 1; }
      continue;
    }
    if (!op.binds) { fail(`operator '${id}' is ${op.status} but binds to nothing`); bad += 1; continue; }
    for (const sym of op.binds.split(',').map((s) => s.trim())) {
      const field = sym.replace(/^SheathOptions::/, '').replace(/\s*\(.*\)$/, '');
      if (!declares(field)) { fail(`operator '${id}' binds SheathOptions::${field}, which no longer exists`); bad += 1; }
    }
    if (op.status === 'flagged' && !op.refusalReason) {
      fail(`flagged operator '${id}' has no refusalReason`); bad += 1;
    }
  }
  if (!bad) ok(`operator registry: ${Object.keys(c.operators).length} operators, every binding real, every non-shipped one has a refusal sentence`);
}

{
  let drift = 0;
  for (const [name, q] of Object.entries(c.quantities)) {
    if (name.startsWith('_')) continue;
    const field = q.binds;
    const m = sheath && sheath.replace(/\/\/[^\n]*/g, '').match(new RegExp(`\\b${field}\\s*=\\s*(-?[0-9.]+)`));
    if (!m) { fail(`quantity '${name}' binds SheathOptions::${field}, which no longer exists`); drift += 1; continue; }
    if (Math.abs(parseFloat(m[1]) - q.default) > 1e-9) {
      fail(`quantity '${name}' default drift: contract ${q.default} vs engine ${m[1]}`); drift += 1;
    }
    if (!(q.default >= q.min && q.default <= q.max)) {
      fail(`quantity '${name}' default ${q.default} outside its own band [${q.min}, ${q.max}]`); drift += 1;
    }
  }
  if (!drift) ok(`${Object.keys(c.quantities).length - 1} quantities: every binding real, every default equal to the engine's`);
}

// ---- 6. no enum value with fake scope ---------------------------------------
{
  let bad = 0;
  for (const [axis, def] of Object.entries(c.topology)) {
    if (axis.startsWith('_')) continue;
    for (const [val, d] of Object.entries(def.values)) {
      for (const opId of d.requires) {
        if (!c.operators[opId]) { fail(`topology.${axis}=${val} requires unknown operator '${opId}'`); bad += 1; }
      }
    }
  }
  for (const [name, q] of Object.entries(c.quantities)) {
    if (name.startsWith('_') || !q.requiresOperator) continue;
    if (!c.operators[q.requiresOperator]) { fail(`quantity ${name} requires unknown operator '${q.requiresOperator}'`); bad += 1; }
  }
  if (!bad) ok('every enum value and gated quantity names a registered operator');
}

// ---- 7. solver knobs stay out of the schema ---------------------------------
{
  const schemaProps = Object.keys(buildSchema(c).properties.quantities.properties);
  const leak = c.solverKnobs.fields.filter((f) => schemaProps.includes(f));
  if (leak.length) fail(`solver knobs leaked into the writable schema: ${leak.join(', ')}`);
  else ok('solver knobs are not writable from the spec (an LLM cannot write code)');
}

// ---- 8. THE MUTATION PROOF --------------------------------------------------
const SHIPPED_SPEC = {
  spec: 'garment-spec/2',
  size: 'EU38',
  topology: {
    garment: 'sheathDress', skirtShape: 'aLine', shoulder: 'strapless',
    sleeve: 'none', collar: 'none', closure: 'backOpening', suppression: 'dart',
  },
  quantities: { hemSweepMM: 1270.0, easeBustMM: 60.0, backOpeningMM: 558.8 },
};

{
  const r = checkSpec(c, SHIPPED_SPEC);
  if (r.verdict !== 'ok') fail(`fixture 1 (the garment that ships today) must be ok, got ${r.verdict}: ${refusalSentence(r)}`);
  else ok('fixture 1 — the shipped sheath is expressible (verdict ok)');
}

{
  // The mutation DERSLER names: puff must NOT quietly become none.
  const broken = structuredClone(SHIPPED_SPEC);
  broken.topology.sleeve = 'puuf';
  const r = checkSpec(c, broken);
  if (r.verdict !== 'invalid') fail(`fixture 2 (broken enum 'puuf') must be invalid, got ${r.verdict}`);
  else if (!/puuf/.test(refusalSentence(r))) fail('fixture 2 refusal does not quote the offending value');
  else ok(`fixture 2 — a bad enum is REJECTED, not substituted: ${r.errors[0]}`);

  // and a smuggled solver knob is rejected too (rule 4)
  const smuggled = structuredClone(SHIPPED_SPEC);
  smuggled.quantities.arapRounds = 2000;
  const s = checkSpec(c, smuggled);
  if (s.verdict !== 'invalid') fail(`fixture 2b (smuggled arapRounds) must be invalid, got ${s.verdict}`);
  else ok('fixture 2b — a smuggled solver knob is rejected');

  const oob = structuredClone(SHIPPED_SPEC);
  oob.quantities.easeBustMM = 9000;
  const o = checkSpec(c, oob);
  if (o.verdict !== 'invalid') fail(`fixture 2c (easeBustMM out of band) must be invalid, got ${o.verdict}`);
  else ok('fixture 2c — a scalar outside its declared band is rejected');
}

{
  // The refusal that the bitiş tanımı is made of. Buğra's puff-sleeve top:
  // legal JSON in every axis, and four operators short.
  const bugra = {
    spec: 'garment-spec/2',
    size: 'EU38',
    topology: {
      garment: 'top', skirtShape: 'straight', shoulder: 'shoulderSeam',
      sleeve: 'puff', collar: 'peterPan', closure: 'buttonFront', suppression: 'dart',
    },
  };
  const r = checkSpec(c, bugra);
  const sentence = refusalSentence(r);
  if (r.verdict !== 'unsupported') {
    fail(`fixture 3 (Buğra Locket puff-sleeve top) must be unsupported, got ${r.verdict}: ${sentence}`);
  } else {
    const named = r.missing.map((m) => m.operator);
    const want = ['shoulderSeam', 'sleeve', 'gatheredOverlayLayer', 'collarFamily', 'zipperPiece'];
    const absentNames = want.filter((w) => !named.includes(w));
    if (absentNames.length) fail(`fixture 3 refusal failed to name: ${absentNames.join(', ')}`);
    else {
      ok('fixture 3 — an unbuildable garment is REFUSED BY OPERATOR NAME, not approximated:');
      console.log(sentence.split('\n').map((l) => '   ' + l).join('\n'));
    }
  }
}

console.log(failures ? `\nspecv2_check: ${failures} FAIL` : '\nspecv2_check: PASS');
process.exit(failures ? 1 : 0);
