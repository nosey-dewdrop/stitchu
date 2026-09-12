#!/usr/bin/env node
// kumas_kalip_check — KAPI (F4-kumas, 2026-09-01).
//
// CLAIM UNDER TEST: AYNI ELBISE, KATALOGDAKI BES KUMAS — kumas ekseni alicinin
// indirdigi nesneye kadar iniyor mu, ve katalogda kaynaksiz sayi var mi?
//
// UC BACAK
//   1  AYNI spec, contract/fabric-catalog-v1.json'daki BES kumas -> en az UC
//      FARKLI kalip hashi (jarse negatif payla, dar toplar metrajla ayrisir;
//      krep ve challis'in 0.1 m yuvarlamasinda cakismasina IZIN VAR ve bu
//      katalogda adiyla ilan edildi).
//   2  %40+ strec ilan eden ORME, bel kenarinda dokumadan OLCULEBILIR dar —
//      mm olarak basilir, cumle degil sayi.
//   3  KATALOGDA KAYNAKSIZ SAYI 0: her kumasin her sayisi ya satici sayfasina
//      (`kaynak` URL) ya sinif-tipik etikete (`stretch_etiket` + OLCULMEDI)
//      dayanir; olculmemis alan null'dur, uydurma sayi degil. Formul/bant/tavan
//      kaynaklari `negative_ease_rule.kaynaklar`'da URL olarak durur.
//
// Motor, tarayicinin yukledigi hattin ta kendisinden kosulur
// (web/vendor/stitchu-engine.js) — kaynak degil, SEVK EDILEN bayt yargilanir.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');
const require = createRequire(import.meta.url);

const fails = [];
const note = [];
const check = (name, cond, detail) => {
  if (cond) note.push(`  ok   ${name}${detail ? ` — ${detail}` : ''}`);
  else fails.push(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
};

const engine = await require(join(ROOT, 'web/vendor/stitchu-engine.js'))();
const { FABRIC_CATALOG, applyFabricPreset } = await import(join(ROOT, 'web/js/fabric-catalog.js'));

// EU38, the create.html first-visitor body; the F4 dress: sleeved (kol oyugu)
// and gathered (buzgu), everything frozen except the fabric preset.
const BODY = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40, armLength: 58, neck: 35 };
const WIRE = {
  garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
  neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'short',
  skirtStyle: 'gathered', skirtLength: 'midi', topLength: 'hip',
  fabricStretchPct: -1, skirtLengthMM: 0, ruffleHem: false, ruffleTiers: 1,
  keyhole: false, frontPlacket: false, tieClosure: 0, sleeveCap: 0, collarType: 0,
  collarEdge: 0, gatherType: 0, gatherZone: 0, backOpening: 0, laceUpBack: 0,
  wrapFront: 0, backSlit: 0, ruffledStraps: 0, peplum: 0, hemFlounce: 0,
  placketStyle: 0, edgeFinish: 0, pocketStyle: 0, cuffStyle: 0, hemShape: 0,
  shoulderStyle: 0, buttonRow: 0, exposedZip: 0, backDetail: 0, bardotStyle: 0,
  cupSeam: 0, yoke: 0, boxPleat: 0,
};

// The drawn waist edge width of a piece: the horizontal span of its bottom
// band (60 mm — the waist edge of the dart bodice drops ~48 mm from side seam
// to CF, so a narrower band would see only one corner). Control points count:
// the CF-side curve's flat end lives in them. Measured off the SHIPPED
// commands, not off an engine internal.
function bottomEdgeWidth(piece) {
  const pts = [];
  for (const c of piece.commands) {
    for (const [kx, ky] of [['x', 'y'], ['cp1x', 'cp1y'], ['cp2x', 'cp2y']]) {
      if (typeof c[kx] === 'number' && typeof c[ky] === 'number') pts.push([c[kx], c[ky]]);
    }
  }
  const maxY = Math.max(...pts.map((p) => p[1]));
  const band = pts.filter((p) => p[1] > maxY - 60);
  return Math.max(...band.map((p) => p[0])) - Math.min(...band.map((p) => p[0]));
}

// ── LEG 1: five fabrics, hashed patterns ───────────────────────────────────
const ids = Object.keys(FABRIC_CATALOG);
check('katalog bes kumas sunuyor', ids.length === 5, ids.join(', '));

const drafts = {};
const hashes = {};
for (const id of ids) {
  const wire = applyFabricPreset({ ...WIRE, fabricPreset: id });
  const raw = engine.draftJSON(wire, BODY);
  const d = JSON.parse(raw);
  drafts[id] = d;
  check(`${id}: taslak temiz`, !d.error && d.pattern && !(d.issues || []).length,
    d.error || (d.issues || []).join(' | ') || `${d.pattern.pieces.length} parca`);
  hashes[id] = createHash('sha256').update(raw).digest('hex').slice(0, 12);
}
const distinct = new Set(Object.values(hashes));
console.log('\n  AYNI SPEC, BES KUMAS — kalip hashleri:');
for (const id of ids) console.log(`    ${id.padEnd(20)} ${hashes[id]}`);
check('en az UC farkli kalip hashi', distinct.size >= 3, `${distinct.size} farkli / 5 kumas`);

// ── LEG 2: the 40%+ knit is measurably narrower at the waist, in mm ────────
const knitId = ids.find((id) => FABRIC_CATALOG[id].cls === 'knit' && FABRIC_CATALOG[id].fabricStretchPct >= 40);
check('katalogda %40+ strec ilan eden bir orme var', !!knitId,
  knitId ? `${knitId} (%${FABRIC_CATALOG[knitId].fabricStretchPct})` : 'YOK');
if (knitId) {
  const wovenId = ids.find((id) => FABRIC_CATALOG[id].cls === 'woven');
  const waistOf = (id) => {
    const pieces = drafts[id].pattern.pieces;
    const front = pieces.find((p) => p.name === 'Bodice Front');
    const back = pieces.find((p) => p.name === 'Bodice Back');
    return 2.0 * (bottomEdgeWidth(front) + bottomEdgeWidth(back));
  };
  const wKnit = waistOf(knitId), wWoven = waistOf(wovenId);
  console.log(`\n  BEL KENARI (cizilen kaliptan, mm): ${wovenId} ${wWoven.toFixed(4)} mm | ` +
    `${knitId} ${wKnit.toFixed(4)} mm | fark ${(wKnit - wWoven).toFixed(4)} mm`);
  check('%40+ orme bel kenari dokumadan olculebilir dar (>10 mm)',
    wKnit < wWoven - 10.0, `${(wWoven - wKnit).toFixed(4)} mm dar`);
}

// ── LEG 3: zero unsourced numbers in the catalog ───────────────────────────
const catalog = JSON.parse(readFileSync(join(ROOT, 'contract/fabric-catalog-v1.json'), 'utf8'));
let unsourced = 0;
const numericFields = ['stretchPct', 'stretchLengthwisePct', 'recovery15sPct',
  'recovery30minPct', 'growthPct', 'weightGSM', 'bendingLengthMM', 'widthCM',
  'bendingRigidityUNm'];
for (const [id, f] of Object.entries(catalog.fabrics)) {
  if (id.startsWith('_')) continue;
  const hasKaynak = typeof f.kaynak === 'string' && f.kaynak.includes('http');
  check(`${id}: satici kaynagi URL olarak var`, hasKaynak, f.kaynak ? f.kaynak.slice(0, 60) : 'YOK');
  const hasEtiket = typeof f.stretch_etiket === 'string' && f.stretch_etiket.includes('OLCULMEDI');
  check(`${id}: strec sinif-tipik + OLCULMEDI etiketi tasiyor`, hasEtiket);
  for (const field of numericFields) {
    if (!(field in f)) { unsourced++; check(`${id}.${field} alani mevcut`, false, 'alan yok'); continue; }
    const v = f[field];
    if (v === null) continue; // OLCULMEDI: null is the honest value, not a number
    if (typeof v !== 'number' || !Number.isFinite(v)) { unsourced++; check(`${id}.${field} sayi`, false); continue; }
    // A number needs a basis: weight/width -> seller page; stretch -> the
    // class-typical label. recovery/growth/bending are unmeasured for all five
    // bolts, so ANY number there is unsourced by construction.
    const sourcedByKaynak = (field === 'weightGSM' || field === 'widthCM') && hasKaynak;
    const sourcedByEtiket = (field === 'stretchPct' || field === 'stretchLengthwisePct') && hasEtiket;
    if (!sourcedByKaynak && !sourcedByEtiket) {
      unsourced++;
      check(`${id}.${field}: kaynaksiz sayi`, false, String(v));
    }
  }
}
check('katalogda kaynaksiz sayi 0', unsourced === 0, `${unsourced} kaynaksiz sayi`);
// The rule sources themselves: formula, bands, ceilings, proportionality.
const kay = (catalog.negative_ease_rule || {}).kaynaklar || {};
for (const k of ['formul', 'strec_bantlari', 'urun_sinifi_tavanlari', 'yuzde_orantililik']) {
  check(`negative_ease_rule.kaynaklar.${k} URL`, typeof kay[k] === 'string' && kay[k].includes('http'),
    (kay[k] || 'YOK').slice(0, 60));
}

// ── verdict ────────────────────────────────────────────────────────────────
console.log('\nkumas_kalip_check:');
for (const n of note) console.log(n);
for (const f of fails) console.log(f);
console.log(fails.length ? `\nKIRMIZI — ${fails.length} FAIL` : '\nYESIL — kumas ekseni indirilen nesneye kadar iniyor, katalogda kaynaksiz sayi yok');
process.exit(fails.length ? 1 : 0);
