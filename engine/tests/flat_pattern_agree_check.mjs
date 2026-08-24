#!/usr/bin/env node
// flat_pattern_agree_check.mjs — ÜÇ KANAT KAPISI / KANAT (a): FLAT ↔ KALIP UYUMU
// (V3-C, 2026-08-24).
//
// SORU: aynı spec'ten üretilen TEKNİK ÇİZİM (shell-flat) ile KALIP
// (surface-pattern) altı ölçüde birbirini tutuyor mu?
//
// ★ EŞİK: %1.5 — VE BU EŞİK YAYINDAN DEĞİL, KARARDAN GELİYOR.
//   `GECE/V3-R.md` "EŞİK 2" bölümünün hükmü birebir şudur: "Yayınlanmış formül
//   YOK. %1.5'i 'sanayi standardı' diye YAZMA — hiçbir kaynak desteklemiyor."
//   Technical flat ile kalıp arasında sayısal ölçü uyumu şartı koyan hiçbir
//   standart bulunamadı (ASTM D5585 bir VÜCUT ÖLÇÜSÜ tablosudur, tolerans
//   tablosu değildir; sanayi QC toleransı POM başına MUTLAK verilir, yüzde
//   değil). %1.5 burada şu GEREKÇEYLE duruyor, kaynakla değil: üretim
//   toleransımız 1/32" = 0.79375mm bir bel halkasında %0.113, 50mm'lik bir
//   segmentte %1.588; ticari QC pratiği (zayıf kaynak) ~%2.38. %1.5 bu ikisinin
//   ARASINDA duruyor. Bu bir KARARDIR. Kaynak diye anılırsa yanlış atıftır.
//
// ★ ÖLÇÜM ALETİ SÖZLEŞMESİ (kalıp tarafı): `engine/tools/pattern-measure.mjs`
//   — bu aleti V3-B yazıyor, bu kapı YAZMAZ. Sözleşme:
//     `node engine/tools/pattern-measure.mjs <pattern.json>` stdout'a JSON basar;
//     `measures` alanı (ya da düz dizi) AYNI ALTI AD'ı AYNI SIRADA taşır,
//     ölçülen değer `mm` alanındadır, ÖLÇÜLEMEYEN ölçü `mm: null` + `reason`
//     ile gelir.
//   ALET DİSKTE YOKSA BU KAPI **KIRMIZI** DÜŞER — `SKIP` DEĞİL. Eksik alet =
//   eksik kanıt (V3-C kartı, kanat (a)).
//
// ★ `null` gelen ölçü ATLANMAZ: adıyla raporlanır, `UNMEASURED` satırı basılır,
//   kaç tanesinin ölçülemediği sayılır. Ölçülemeyen ölçü kapıyı KIRMIZI düşürür.
//
// ANTI-HACK / KANIT KANCALARI (yalnızca 4.2 ve 4.5 kanıtları için; üretim
// koşusunda hiçbiri set edilmez ve set edilirse EKRANA BASILIR):
//   V3C_SHELL_JSON       — shell-flat yerine hazır bir JSON artefaktı oku
//   V3C_PATTERN_JSON     — surface-pattern yerine hazır bir kalıp JSON'u oku
//   V3C_PATTERN_MEASURE  — pattern-measure.mjs yerine başka bir ölçüm aleti koş

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const SIZE = process.env.V3C_SIZE || 'EU38';
const TOL_PCT = 1.5;

const SHELL_BIN = join(root, 'engine/build/shell-flat');
const PATTERN_BIN = join(root, 'engine/build/surface-pattern');
const MEASURE_TOOL = process.env.V3C_PATTERN_MEASURE || join(root, 'engine/tools/pattern-measure.mjs');

const SIX = ['hem_circumference', 'bust_circumference', 'waist_circumference',
             'body_length', 'neck_opening_width', 'shoulder_width'];

let fails = 0;
const FAIL = (m) => { console.log(`FAIL  ${m}`); fails += 1; };
const OK = (m) => console.log(`ok    ${m}`);

console.log('=== KANAT (a) — FLAT ↔ KALIP UYUMU · beden ' + SIZE);
console.log(`    tolerans %${TOL_PCT} — YAYINDAN DEĞİL, KARARDAN (GECE/V3-R.md "EŞİK 2": yayınlanmış formül YOK)`);
console.log(`    flat  tarafı: engine/build/shell-flat ${SIZE}`);
console.log(`    kalıp tarafı: node ${MEASURE_TOOL.replace(root + '/', '')} <pattern.json>`);
for (const k of ['V3C_SHELL_JSON', 'V3C_PATTERN_JSON', 'V3C_PATTERN_MEASURE', 'V3C_SIZE']) {
  if (process.env[k]) console.log(`    ⚠ KANIT KANCASI AKTİF: ${k}=${process.env[k]}`);
}

// ---------------------------------------------------------------------------
// FLAT TARAFI
// ---------------------------------------------------------------------------
function readFlat() {
  if (process.env.V3C_SHELL_JSON) return JSON.parse(readFileSync(process.env.V3C_SHELL_JSON, 'utf8'));
  if (!existsSync(SHELL_BIN)) { FAIL(`[a] shell-flat ikilisi YOK: ${SHELL_BIN} — eksik alet = eksik kanıt`); return null; }
  return JSON.parse(execFileSync(SHELL_BIN, [SIZE], { encoding: 'utf8', maxBuffer: 1 << 28 }));
}

// ---------------------------------------------------------------------------
// KALIP TARAFI
// ---------------------------------------------------------------------------
function patternFile() {
  if (process.env.V3C_PATTERN_JSON) return process.env.V3C_PATTERN_JSON;
  if (!existsSync(PATTERN_BIN)) { FAIL(`[a] surface-pattern ikilisi YOK: ${PATTERN_BIN}`); return null; }
  const out = execFileSync(PATTERN_BIN, [SIZE], { encoding: 'utf8', maxBuffer: 1 << 28 });
  const p = join(tmpdir(), `v3c-pattern-${SIZE}-${process.pid}.json`);
  writeFileSync(p, out);
  return p;
}

function readPatternMeasures(file) {
  if (!existsSync(MEASURE_TOOL)) {
    FAIL(`[a] ÖLÇÜM ALETİ DİSKTE YOK: ${MEASURE_TOOL}`);
    console.log('      Sözleşme: node engine/tools/pattern-measure.mjs <pattern.json> ->');
    console.log(`      {"measures":[{"name":"...","mm":<sayı|null>,"reason":"..."}]} , altı ad aynı sırada: ${SIX.join(', ')}`);
    console.log('      Alet V3-B tarafından yazılıyor. YOKLUĞU **SKIP DEĞİL KIRMIZI** (V3-C kartı, kanat (a)).');
    return null;
  }
  let raw;
  try {
    raw = execFileSync(process.execPath, [MEASURE_TOOL, file], { encoding: 'utf8', maxBuffer: 1 << 28 });
  } catch (e) {
    FAIL(`[a] ölçüm aleti çöktü (exit ${e.status}): ${String(e.stderr || e.message).trim().slice(0, 400)}`);
    return null;
  }
  let j;
  try { j = JSON.parse(raw); }
  catch { FAIL(`[a] ölçüm aletinin çıktısı JSON değil: ${raw.slice(0, 200)}`); return null; }
  const arr = Array.isArray(j) ? j : j.measures;
  if (!Array.isArray(arr)) { FAIL('[a] ölçüm aleti çıktısında `measures` dizisi yok (sözleşme ihlali)'); return null; }
  return arr;
}

// ---------------------------------------------------------------------------
const flat = readFlat();
if (flat) {
  const names = (flat.measures || []).map((m) => m.name);
  if (names.join('|') !== SIX.join('|')) {
    FAIL(`[a] shell-flat altı ölçüyü beklenen sırada vermiyor: [${names.join(', ')}]`);
  }
}
const pfile = flat ? patternFile() : null;
const pat = pfile ? readPatternMeasures(pfile) : null;

if (flat && pat) {
  const pnames = pat.map((m) => m.name);
  if (pnames.join('|') !== SIX.join('|')) {
    FAIL(`[a] SÖZLEŞME İHLALİ — ölçüm aleti adları/sırası: [${pnames.join(', ')}]  beklenen: [${SIX.join(', ')}]`);
  }
  const fmap = new Map((flat.measures || []).map((m) => [m.name, m.mm]));
  const unmeasured = [];
  console.log(`\n    ${'ölçü'.padEnd(22)} ${'flat mm'.padStart(12)} ${'kalıp mm'.padStart(12)} ${'fark mm'.padStart(10)} ${'fark %'.padStart(9)}`);
  for (const name of SIX) {
    const f = fmap.get(name);
    const rec = pat.find((m) => m.name === name);
    if (f == null || !Number.isFinite(f)) { FAIL(`[a] flat tarafında ${name} ölçüsü yok/sayı değil`); continue; }
    if (!rec) { FAIL(`[a] kalıp tarafında ${name} kaydı YOK`); continue; }
    if (rec.mm == null) {
      unmeasured.push(`${name} — reason: ${rec.reason || '(reason ALANI YOK — sözleşme ihlali)'}`);
      console.log(`    ${name.padEnd(22)} ${f.toFixed(4).padStart(12)} ${'null'.padStart(12)} ${'—'.padStart(10)} ${'—'.padStart(9)}`);
      continue;
    }
    if (!Number.isFinite(rec.mm)) { FAIL(`[a] ${name}: kalıp mm sayı değil (${rec.mm})`); continue; }
    const d = rec.mm - f;
    const pct = (d / f) * 100;
    console.log(`    ${name.padEnd(22)} ${f.toFixed(4).padStart(12)} ${rec.mm.toFixed(4).padStart(12)} ${d.toFixed(4).padStart(10)} ${pct.toFixed(4).padStart(9)}`);
    if (Math.abs(pct) > TOL_PCT + 1e-12) {
      FAIL(`[a] ${name}: flat ${f.toFixed(4)} mm vs kalıp ${rec.mm.toFixed(4)} mm — sapma %${pct.toFixed(4)} > %${TOL_PCT}`);
    }
  }
  console.log(`\n    UNMEASURED sayısı: ${unmeasured.length}/${SIX.length}`);
  for (const u of unmeasured) {
    console.log(`    UNMEASURED  ${u}`);
    FAIL(`[a] UNMEASURED — ${u} (ölçülemeyen ölçü ATLANMAZ, kapıyı düşürür)`);
  }
  if (!fails) OK(`a — altı ölçünün altısı da %${TOL_PCT} içinde, UNMEASURED 0`);
}

console.log(`\n${fails === 0 ? 'PASS' : 'FAIL'} flat_pattern_agree_check — ${fails} ihlal`);
process.exit(fails === 0 ? 0 : 1);
