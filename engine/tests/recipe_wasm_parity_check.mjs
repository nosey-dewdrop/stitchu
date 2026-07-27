#!/usr/bin/env node
// recipe_wasm_parity_check.mjs — Aşama 2 (KANVAS) mandalı: the recipe
// interpreter compiled to WASM produces byte-for-byte the SAME geometry as the
// native build, for the same recipe + measurements + params. The studio canvas
// regenerates through the WASM path; this test pins that path to the native
// one the ctest golden proofs run on (recipe_check / recipe_golden_check), so
// "green suite" keeps meaning something in the browser too.
//
// Also latches the web copy of the recipe document: web/recipes/*.json is what
// the deployed studio fetches; it must stay byte-identical to the canonical
// recipes/*.json the engine tests pin (a silent fork here would let the studio
// draw a different pattern than the one the suite proves).
//
//   usage: node recipe_wasm_parity_check.mjs <recipe-json-dump-binary> <recipe.json>
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');

const [nativeDump, recipePath] = process.argv.slice(2);
if (!nativeDump || !recipePath) {
  console.error('usage: recipe_wasm_parity_check.mjs <recipe-json-dump-binary> <recipe.json>');
  process.exit(2);
}

let fails = 0;
const fail = (m) => { console.error('FAIL:', m); fails += 1; };

// ---- 1. web copy latch: the studio fetches web/recipes/<file>; it must be
// byte-identical to the canonical document the engine tests pin.
const canonical = readFileSync(recipePath, 'utf8');
const webCopyPath = join(root, 'web/recipes', basename(recipePath));
let webCopy = null;
try { webCopy = readFileSync(webCopyPath, 'utf8'); }
catch { fail(`web copy missing: ${webCopyPath}`); }
if (webCopy !== null && webCopy !== canonical) {
  fail(`web/recipes/${basename(recipePath)} differs from ${recipePath} (silent fork: studio would draw an unproven pattern)`);
}

// ---- 2. geometry parity: native recipe-json-dump vs WASM draftRecipeJSON,
// same recipe + body + length, field-exact compare of every geometry field.
// Both writers print %.4f, so parsed numbers must be EXACTLY equal.
const createEngine = (await import(join(root, 'engine/dist/stitchu-engine.js'))).default;
const eng = await createEngine();

// The pinned golden bodies recipe-json-dump knows (cm, tools/recipe-json-dump.cpp).
const BODIES = {
  EU38: { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40.5, armLength: 58, neck: 35 },
  bigNeckSmallShoulder: { bust: 100, waist: 84, hip: 104, shoulder: 30, backLength: 40, armLength: 58, neck: 50 },
};

// Param values come from the recipe's OWN declared range (same single-param
// contract recipe-json-dump enforces): both range ends, so the parity combos
// hit the declared boundaries of whatever recipe this test is pointed at
// (skirt lengthMM 250-1200, dress extendMM 300-480, ...).
const doc = JSON.parse(canonical);
const paramNames = Object.keys(doc.params || {});
if (paramNames.length !== 1) {
  console.error(`recipe declares ${paramNames.length} params; this test binds exactly one`);
  process.exit(2);
}
const paramName = paramNames[0];
const paramRange = doc.params[paramName];
const PARAM_VALUES = [paramRange.min, paramRange.max];

const GEOM_FIELDS = ['name', 'cutInstruction', 'seamAllowance', 'grainline',
  'commands', 'markings', 'notches', 'cutLine'];

function pieceGeom(p) {
  const out = {};
  for (const f of GEOM_FIELDS) out[f] = p[f] ?? null;
  return out;
}

let combos = 0;
for (const [bodyName, body] of Object.entries(BODIES)) {
  for (const paramMM of PARAM_VALUES) {
    combos += 1;
    const nat = JSON.parse(execFileSync(nativeDump, [recipePath, bodyName, String(paramMM)], { encoding: 'utf8' }));
    const wasmOut = JSON.parse(eng.draftRecipeJSON(canonical, { ...body, upperBust: 0 }, { [paramName]: paramMM }));
    if (wasmOut.error) { fail(`${bodyName}/${paramMM}: wasm error ${wasmOut.error}`); continue; }
    if (wasmOut.issues.length) { fail(`${bodyName}/${paramMM}: wasm validator issues ${JSON.stringify(wasmOut.issues)}`); continue; }
    const np = nat.pieces, wp = wasmOut.pattern.pieces;
    if (np.length !== wp.length) { fail(`${bodyName}/${paramMM}: piece count native ${np.length} vs wasm ${wp.length}`); continue; }
    for (let i = 0; i < np.length; i += 1) {
      const a = JSON.stringify(pieceGeom(np[i]));
      const b = JSON.stringify(pieceGeom(wp[i]));
      if (a !== b) fail(`${bodyName}/${paramMM}: piece '${np[i].name}' geometry differs\n  native: ${a.slice(0, 200)}\n  wasm:   ${b.slice(0, 200)}`);
    }
    if (nat.fabricMeters140 !== wasmOut.pattern.fabricMeters140) {
      fail(`${bodyName}/${paramMM}: fabricMeters140 native ${nat.fabricMeters140} vs wasm ${wasmOut.pattern.fabricMeters140}`);
    }
  }
}

// ---- 3. Err-path parity at the WASM boundary (RULES invariant 1: the browser
// gets the same honest refusal the native interpreter gives, never a crash or
// a silent clamp).
const outOfRange = JSON.parse(eng.draftRecipeJSON(canonical, { ...BODIES.EU38, upperBust: 0 }, { [paramName]: paramRange.max + 9999 }));
if (!outOfRange.error || !/outside declared range/.test(outOfRange.error)) {
  fail(`out-of-range param not refused honestly: ${JSON.stringify(outOfRange.error)}`);
}
const smuggled = JSON.parse(eng.draftRecipeJSON(canonical, { ...BODIES.EU38, upperBust: 0 }, { [paramName]: paramRange.min, evil: 1 }));
if (!smuggled.error || !/not declared/.test(smuggled.error)) {
  fail(`undeclared param not refused: ${JSON.stringify(smuggled.error)}`);
}
const noMeas = JSON.parse(eng.draftRecipeJSON(canonical, { bust: 88, upperBust: 0 }, { [paramName]: paramRange.min }));
if (!noMeas.error || !/missing or non-positive/.test(noMeas.error)) {
  fail(`missing measurement not refused: ${JSON.stringify(noMeas.error)}`);
}
const badDoc = JSON.parse(eng.draftRecipeJSON('{"recipeVersion": 99}', { ...BODIES.EU38 }, {}));
if (!badDoc.error) fail('unknown recipeVersion accepted by the wasm boundary');

if (fails) { console.error(`recipe_wasm_parity[${doc.id}]: ${fails} failure(s)`); process.exit(1); }
console.log(`OK recipe_wasm_parity[${doc.id}]: ${combos} body-param combos byte-equal native vs wasm (pieces+fabric), web recipe copy byte-identical, 4 honest refusal paths.`);
