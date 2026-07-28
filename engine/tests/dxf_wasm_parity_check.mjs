#!/usr/bin/env node
// dxf_wasm_parity_check.mjs — Aşama 5 (endüstri sınırı) mandalı, tarayıcı tarafı:
// the DXF-AAMA/ASTM export compiled to WASM (engine/dist/stitchu-engine.js,
// dxfRecipeJSON) produces BYTE-FOR-BYTE the same interchange file as the native
// dxf-export tool, for the same recipe + body + param. The native side is
// already proven against ezdxf + mm-parity (dxf_check.sh); this test pins the
// browser download to that native output, so the DXF a shopper downloads for
// their own measurement is the exact motor geometry the outside CAD proof runs
// on — not a redraw, not a drift.
//
// It also proves the wasm boundary refuses honestly (RULES invariant 1): an
// out-of-range param, a missing measurement and an unknown recipe version each
// come back as {"error": ...} with no DXF, never a silent default or crash.
//
//   usage: node dxf_wasm_parity_check.mjs <dxf-export-binary> <recipe.json>
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');

const [nativeDxf, recipePath] = process.argv.slice(2);
if (!nativeDxf || !recipePath) {
  console.error('usage: dxf_wasm_parity_check.mjs <dxf-export-binary> <recipe.json>');
  process.exit(2);
}

let fails = 0;
const fail = (m) => { console.error('FAIL:', m); fails += 1; };

const canonical = readFileSync(recipePath, 'utf8');
const doc = JSON.parse(canonical);
const paramNames = Object.keys(doc.params || {});
if (paramNames.length !== 1) {
  console.error(`recipe declares ${paramNames.length} params; this test binds exactly one`);
  process.exit(2);
}
const paramName = paramNames[0];
const paramRange = doc.params[paramName];

const createEngine = (await import(join(root, 'engine/dist/stitchu-engine.js'))).default;
const eng = await createEngine();

// The pinned bodies dxf-export knows by name (cm; tools/dxf-export.cpp), plus
// the cm object the wasm bindings take. Same field order as recipe-json-dump.
const BODIES = {
  EU38: { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40.5, armLength: 58, neck: 35 },
  pear: { bust: 96, waist: 70, hip: 116, shoulder: 37, backLength: 41, armLength: 58, neck: 36 },
  bigNeckSmallShoulder: { bust: 100, waist: 84, hip: 104, shoulder: 30, backLength: 40, armLength: 58, neck: 50 },
};

// Both range ends: the parity combos hit the recipe's OWN declared param
// boundaries (skirt lengthMM 250-1200, dress extendMM 300-480, ...).
const PARAM_VALUES = [paramRange.min, paramRange.max];

let combos = 0;
for (const [bodyName, body] of Object.entries(BODIES)) {
  for (const paramMM of PARAM_VALUES) {
    combos += 1;
    const native = execFileSync(nativeDxf, [recipePath, bodyName, String(paramMM)], { encoding: 'utf8' });
    const out = JSON.parse(eng.dxfRecipeJSON(canonical, { ...body, upperBust: 0 }, { [paramName]: paramMM }));
    if (out.error) { fail(`${bodyName}/${paramMM}: wasm error ${out.error}`); continue; }
    if (typeof out.dxf !== 'string' || out.dxf.length === 0) { fail(`${bodyName}/${paramMM}: wasm returned no dxf`); continue; }
    if (out.dxf !== native) {
      // find the first differing byte for a precise report
      let i = 0;
      while (i < out.dxf.length && i < native.length && out.dxf[i] === native[i]) i += 1;
      fail(`${bodyName}/${paramMM}: wasm DXF != native (byte ${i}: ` +
        `native ${JSON.stringify(native.slice(i, i + 24))} vs wasm ${JSON.stringify(out.dxf.slice(i, i + 24))})`);
    }
  }
}

// ---- honest refusal at the wasm boundary (no DXF handed out).
const outOfRange = JSON.parse(eng.dxfRecipeJSON(canonical, { ...BODIES.EU38, upperBust: 0 }, { [paramName]: paramRange.max + 9999 }));
if (!outOfRange.error || outOfRange.dxf !== null) fail(`out-of-range param not refused: ${JSON.stringify(outOfRange.error)}`);
const noMeas = JSON.parse(eng.dxfRecipeJSON(canonical, { bust: 88, upperBust: 0 }, { [paramName]: paramRange.min }));
if (!noMeas.error || noMeas.dxf !== null) fail(`missing measurement not refused: ${JSON.stringify(noMeas.error)}`);
const badDoc = JSON.parse(eng.dxfRecipeJSON('{"recipeVersion":99}', { ...BODIES.EU38, upperBust: 0 }, {}));
if (!badDoc.error || badDoc.dxf !== null) fail('unknown recipeVersion accepted by the wasm DXF boundary');

if (fails) { console.error(`dxf_wasm_parity[${doc.id}]: ${fails} failure(s)`); process.exit(1); }
console.log(`OK dxf_wasm_parity[${doc.id}]: ${combos} body-param DXF byte-identical native vs wasm, 3 honest refusal paths.`);
