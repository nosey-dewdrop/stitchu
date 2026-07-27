#!/usr/bin/env node
// api_wire_check.mjs — MANDAL (2026-07-27): skirtLengthMM API kablosu.
// RULES invariant 2: her spec alanı ROUND-TRIP eder ya da açıkça reddedilir.
// Bulgu (json-el adli raporu): backend/draft.js validateDraftRequest
// skirtLengthMM'i DOĞRULUYOR ama normalize spec'e KOPYALAMIYORDU — API
// yolunda kablo sessizce hep 0, web yolu çalışıyordu (iki yol ayrı dil).
// Bu test üç şeyi kilitler:
//   1) backend normalize spec mm'i taşır (validateDraftRequest → engineSpec),
//   2) web yolu ile backend yolu AYNI spec için AYNI mm'i motora verir,
//   3) motor o mm'i gerçekten TÜKETİR (353 vs 1100 farklı etek geometrisi;
//      0/atlanmış → birebir aynı çıktı, opt-in kapalı default korunur).
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');

const backend = await import(join(root, 'backend/spec-core.js'));
const web = await import(join(root, 'web/js/engine.js'));

let fails = 0;
const fail = (m) => { console.error('FAIL:', m); fails += 1; };

const MEAS = { bust: 92, waist: 74, hip: 100, shoulder: 38, backLength: 41, armLength: 58, neck: 36 };
const SPEC = { garment: 'dress', neckline: 'crew', shaping: 'dart', skirtStyle: 'aLine', skirtLength: 'midi' };

// 1) backend normalize: validated spec mm'i TAŞIMALI, engineSpec motora vermeli.
const v353 = backend.validateDraftRequest({ spec: { ...SPEC, skirtLengthMM: 353 }, measurements: MEAS });
if (v353.error) fail(`validateDraftRequest 353 reddetti: ${v353.detail}`);
else {
  if (v353.spec.skirtLengthMM !== 353) fail(`normalize spec mm'i düşürdü (${v353.spec.skirtLengthMM}) — 27 Tem kopuk kablo geri geldi`);
  const es = backend.engineSpec(v353.spec);
  if (es.skirtLengthMM !== 353) fail(`backend engineSpec mm'i motora vermiyor (${es.skirtLengthMM})`);
}

// atlanmış/0 → 0 (opt-in kapalı default).
const v0 = backend.validateDraftRequest({ spec: { ...SPEC }, measurements: MEAS });
if (v0.error || backend.engineSpec(v0.spec).skirtLengthMM !== 0) fail('mm atlanınca engineSpec 0 vermiyor (default bozuldu)');
// bant dışı → dürüst 422, sessiz 0 değil.
const vBad = backend.validateDraftRequest({ spec: { ...SPEC, skirtLengthMM: 5000 }, measurements: MEAS });
if (!vBad.error) fail('bant dışı skirtLengthMM (5000) sessizce kabul edildi — dürüst red bekleniyordu');

// 2) web yolu vs backend yolu: AYNI spec → motora AYNI mm.
const webES = web.engineSpec({ ...SPEC, skirtLengthMM: 353 });
if (!v353.error && webES.skirtLengthMM !== backend.engineSpec(v353.spec).skirtLengthMM) {
  fail(`web (${webES.skirtLengthMM}) ile backend (${backend.engineSpec(v353.spec).skirtLengthMM}) motora FARKLI mm veriyor — iki yol ayrı dil`);
}

// 3) motor tüketimi: aynı C++ çekirdek (engine/dist) backend engineSpec'iyle
// koşulur; 353 vs 1100 farklı etek boyu üretmeli, 0 = atlanmışla birebir aynı.
const createEngine = (await import(join(root, 'engine/dist/stitchu-engine.js'))).default;
const eng = await createEngine();
const runMM = (mm) => {
  const spec = mm === undefined ? { ...SPEC } : { ...SPEC, skirtLengthMM: mm };
  const val = backend.validateDraftRequest({ spec, measurements: MEAS });
  if (val.error) { fail(`draft ${mm}: validate red (${val.detail})`); return null; }
  const out = JSON.parse(eng.draftJSON(backend.engineSpec(val.spec), { ...MEAS, upperBust: 0 }));
  if (out.issues && out.issues.length) { fail(`draft ${mm}: motor issues ${JSON.stringify(out.issues)}`); return null; }
  return JSON.stringify(out.pattern);
};
const p353 = runMM(353), p1100 = runMM(1100), pOff = runMM(undefined), pZero = runMM(0);
if (p353 && p1100 && p353 === p1100) fail('motor 353 ve 1100 mm için AYNI kalıbı üretti — mm motora ulaşmıyor');
if (pOff && pZero && pOff !== pZero) fail('mm=0 ile atlanmış spec farklı kalıp üretti — opt-in default bozuldu');
if (pOff && p353 && pOff === p353) fail('mm=353 atlanmışla aynı kalıp — kablo API yolunda hâlâ ölü');

if (fails) { console.error(`\napi_wire_check FAILED (${fails})`); process.exit(1); }
console.log('api_wire_check GREEN: skirtLengthMM API yolunda motora ulaşıyor (353!=1100 kalıp), web=backend aynı mm, 0/atlanmış default korunuyor');
