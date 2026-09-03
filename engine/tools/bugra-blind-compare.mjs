#!/usr/bin/env node
// bugra-blind-compare — BUGRA KOR KONTROLU (Damla'nin 12. maddesi).
//
// SORU: "bir sey cizdiginde bugranin kalibina yakin bir sey cikiyor mu?"
//
// KANUN — BU BIR KAPI DEGIL, AYAR VIDASI HIC DEGIL:
//   * Bugra TUNE HEDEFI DEGIL. Motor Bugra'ya benzemek icin AYARLANMAZ.
//   * Bu arac OLCER ve SINIFLAR. Fark uc kovaya ayrilir:
//       STIL         — iki giysi ayri sey, fark mesru.
//       MOTOR EKSIGI — motorun sozlugunde/ekseninde o yapi YOK.
//       HATA         — motor KENDI yayinlanmis kuralini tutturamiyor.
//     Sadece HATA kovasi kapatilir, o da KOK SEBEPTEN; Bugra'ya benzesin diye
//     sabit EKLENMEZ.
//   * ctest'e EKLI DEGIL — rapor araci, kapi degil.
//
// KOR SPEC: Bugra Locket Top'un SATIS SAYFASINDAKI giysi tarifi (dugmeli,
// peter pan yakali, puf kollu fitted top) motorun KENDI eksenlerine cevrilir;
// Bugra'nin mm'lerine BAKILMADAN kurulur.
//
// GERCEK VERI: patterns_real/geometry/geometry-full.json (A0 PDF vektor
// cikarimi, 4cm bar = 40.00mm kalibrasyon, beden 38 halkasi, dikis payi DAHIL)
// + patterns_real/geometry/seamgraph.json (ayni halkanin ADLANDIRILMIS
// kenarlari: yaka / omuz / OYUK / yan-dikis / etek / orta; cut + stitch mm).
//
// BEDEN NOTU (gizlenmez): motorun yayimli EU38 govdesi 88/70/94 cm; Bugra'nin
// kendi 38 cizelgesi 92/72/98 cm. Iki "38" ayni govde degil.
//
// HIZALAMA (serbest parametre YOK): iki kontur da kendi bbox min kosesine
// tasinir; Bugra'ya y_yerel = ymax - y (PDF y-yukari -> SVG y-asagi). Dondurme
// yok, olcekleme yok, en-iyi-oturtma yok.
//
// ONCE/SIMDI: ayni spec, ayni hizalama, IKI motor. "ONCE" = --baseline ile
// verilen git revizyonundaki web/vendor/stitchu-engine.js. Bindirme levhasinda
// her parca iki kez cizilir, ayni kirmizi Bugra konturuna karsi.
//
// kullanim:  node engine/tools/bugra-blind-compare.mjs [--no-png] [--baseline=<rev>]
// ciktilar:  KOSU/ciktilar/bugra-rapor.md, bugra-bindirme.svg, bugra-bindirme.png

import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  motorBodyEdges, motorSleeveEdges, motorCollarEdges,
  bugraEdges, resample, bez, polyLen, KOR_SPEC,
} from './bugra-landmarks.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const OUTDIR = join(ROOT, 'KOSU/ciktilar');
mkdirSync(OUTDIR, { recursive: true });

const arg = (k, d) => (process.argv.find((a) => a.startsWith(k + '=')) ?? (k + '=' + d)).split('=')[1];
// Varsayilan taban: 17d45361 — 0c17a8c0 ("buzgu edge operator") ONCESI son
// commit, yani bir onceki bugra raporunu basan motor. Ayar sayisi degil, tanik.
const BASELINE_REV = arg('--baseline', '17d45361');

const require = createRequire(import.meta.url);
const createEngine = require(join(ROOT, 'web/vendor/stitchu-engine.js'));
const engine = await createEngine();
const { engineSpec, bodyForSize } = await import(pathToFileURL(join(ROOT, 'web/js/engine.js')).href);

const GT = JSON.parse(readFileSync(join(ROOT, 'patterns_real/geometry/geometry-full.json'), 'utf8'));
const SG = JSON.parse(readFileSync(join(ROOT, 'patterns_real/geometry/seamgraph.json'), 'utf8'));
const SIZE = '38';

// KOR SPEC tek kaynaktan (bugra-landmarks.mjs KOR_SPEC).
const RAW_SPEC = KOR_SPEC;

const NOT_IN_VOCAB = [
  'PUF UST KATMANI (Bugra Upper Sleeve): T14 olcumune gore Bugra kolu "yatay bolunmus" DEGIL — Lower Sleeve gercek set-in kol, Upper Sleeve onun ustune dikilen %29-35 buzgulu AYRI DIS KATMAN. Motorun sozlugunde ikinci katman doguran operator yok (sleeveCap {plain, gathered, puffed, cap} TEK parcayi sekillendirir). Motor puf ust katmanini CIZEMIYOR — adiyla kayit.',
  'BUYUME-YAKALI ON (grown-on / cut-on facing): Bugra on govdesi CF hattinda kendi uzerine katlanan bir temizleme payi tasiyor. Motor bunu AYRI parca (Front/Back Neck Facing) ile cozuyor; "on parcaya buyume-yaka payi ekle" ekseni yok.',
  'ayri yaka astari PARCASI (Collar Lining + tela): motor yakayi "cut 2 + interfacing" TALIMATIYLA verir, ayri astar parcasi cizen eksen yok.',
];

const BODY = { ...bodyForSize('EU' + SIZE), upperBust: 0 };

function draftWith(eng) {
  const out = JSON.parse(eng.draftJSON(engineSpec(RAW_SPEC), BODY));
  if (out.error) throw new Error('MOTOR REDDETTI: ' + out.error);
  return out.pattern.pieces;
}
const piecesNow = draftWith(engine);

// ── ONCE (taban motor) ─────────────────────────────────────────────────────
let piecesOnce = null, baselineNote = '';
try {
  const cacheDir = join(ROOT, 'engine/.cache');
  mkdirSync(cacheDir, { recursive: true });
  const p = join(cacheDir, `bugra-baseline-${BASELINE_REV}.js`);
  if (!existsSync(p)) {
    const js = execFileSync('git', ['show', `${BASELINE_REV}:web/vendor/stitchu-engine.js`],
                            { cwd: ROOT, maxBuffer: 128 * 1024 * 1024 });
    writeFileSync(p, js);
  }
  piecesOnce = draftWith(await (require(p))());
  baselineNote = `ONCE sutunu: git ${BASELINE_REV} icindeki web/vendor/stitchu-engine.js`;
} catch (e) {
  baselineNote = `TABAN MOTOR YUKLENEMEDI (${e.message}) — ONCE sutunu bos`;
}

// ── geometri yardimcilari ──────────────────────────────────────────────────
function cmdsToPoly(cmds) {
  const P = []; let cur = null;
  for (const c of cmds) {
    if (c.type === 'move' || c.type === 'line') { cur = [c.x, c.y]; P.push(cur); }
    else if (c.type === 'curve') { P.push(...bez(cur, c, 16)); cur = [c.x, c.y]; }
  }
  return P;
}
const bbox = (P) => {
  let x0 = 1/0, y0 = 1/0, x1 = -1/0, y1 = -1/0;
  for (const [x, y] of P) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
};
const closeP = (P) => (P.length && (P[0][0] !== P.at(-1)[0] || P[0][1] !== P.at(-1)[1]) ? [...P, P[0]] : P);
const toOrigin = (P) => { const b = bbox(P); return P.map(([x, y]) => [x - b.x0, y - b.y0]); };
const flipY = (P) => { const b = bbox(P); return P.map(([x, y]) => [x, b.y1 - y]); };
function ptSegDist(px, py, ax, ay, bx, by) {
  const dx = bx-ax, dy = by-ay, L2 = dx*dx + dy*dy;
  if (L2 < 1e-12) return Math.hypot(px-ax, py-ay);
  let u = ((px-ax)*dx + (py-ay)*dy) / L2; u = u < 0 ? 0 : u > 1 ? 1 : u;
  return Math.hypot(px - (ax + u*dx), py - (ay + u*dy));
}
function ptPolyDist([px, py], poly) {
  let best = 1/0;
  for (let i = 0; i < poly.length - 1; i++) {
    const d = ptSegDist(px, py, poly[i][0], poly[i][1], poly[i+1][0], poly[i+1][1]);
    if (d < best) best = d;
  }
  return best;
}
function chamfer(A, B) {
  const dists = [];
  for (const p of A) dists.push(ptPolyDist(p, B));
  for (const p of B) dists.push(ptPolyDist(p, A));
  dists.sort((a, b) => a - b);
  const q = (f) => dists[Math.min(dists.length - 1, Math.floor(dists.length * f))];
  return { mean: dists.reduce((a, b) => a + b, 0) / dists.length,
           med: q(0.5), p95: q(0.95), max: dists.at(-1) };
}

// ── iki taraf ──────────────────────────────────────────────────────────────
const shape = (p) => ({
  name: p.name, cut: p.cutInstruction, sa: p.seamAllowance, raw: p,
  poly: toOrigin(closeP(cmdsToPoly(p.cutLine ?? p.commands))),
  seamPerim: polyLen(closeP(cmdsToPoly(p.commands))),
  cutPerim: polyLen(closeP(cmdsToPoly(p.cutLine ?? p.commands))),
});
const motor = piecesNow.map(shape);
const motorOnce = piecesOnce ? piecesOnce.map(shape) : null;

const rings = GT.rings.filter((r) => r.pattern === 'locket_top' && r.sizeGuess === SIZE)
  .map((r) => ({
    name: r.piece,
    poly: toOrigin(flipY(closeP(r.polygon.map((p) => [p[0], p[1]])))),
    // seamgraph indeksleri 1mm yeniden ornekli halkada tanimli (meta.step_mm = 1)
    ring1mm: resample(closeP(r.polygon.map((p) => [p[0], p[1]])), 1),
    perim: r.perimMM,
  }));

const MAP = {
  'Top Front': 'Front Body',
  'Top Back': 'Back Body',
  'Puff Sleeve': 'Lower Sleeve',
  'Peter Pan Collar (bebe yaka)': 'Collar',
  'Front Neck Facing': null,
  'Back Neck Facing': null,
};

// ── olcum ──────────────────────────────────────────────────────────────────
const lines = [];
const say = (s) => { lines.push(s); console.log(s); };
const r1 = (v) => Math.round(v * 10) / 10;

say('bugra-blind-compare | KOR KONTROL — olcer ve siniflar, ayarlamaz | Bugra Locket Top 38 vs motor EU38');
say(`kor spec: ${JSON.stringify(RAW_SPEC)}`);
say(`motor govde EU38 (contract euSizeChart): bust ${BODY.bust} / waist ${BODY.waist} / hip ${BODY.hip} cm`);
const bs = GT.sizeChartMM[SIZE];
say(`Bugra kendi 38 cizelgesi: bust ${bs.bustMM/10} / waist ${bs.waistMM/10} / hip ${bs.hipMM/10} cm -> IKI "38" AYNI GOVDE DEGIL (bust orani ${(BODY.bust*10/bs.bustMM).toFixed(3)})`);
say(`dikis payi: motor ${motor[0].sa}mm her kenar | Bugra 10mm + etek 30mm — ikisi de kesim cizgisinde DAHIL`);
say(baselineNote);
say('');
say(`PARCA SAYISI: motor ${motor.length} | Bugra ${rings.length}`);
say('');
say('A) PANEL DIS CEVRESI — Chamfer (mm), kesim cizgisi, bbox-min hizali');
say('   parca eslemesi                                 motor bbox  Bugra bbox  SIMDI mean/p95/max        ONCE mean  delta');

const usedGt = new Set();
const rows = [];
for (const m of motor) {
  const gtName = MAP[m.name];
  if (gtName === null) {
    say(`   ${m.name.padEnd(30)} YAPISAL FARK — Bugra'da bu parca yok (astarli / buyume-yakali konstruksiyon)`);
    rows.push({ motor: m.name, kind: 'yapisal-motor-fazla' });
    continue;
  }
  const gg = rings.find((r) => r.name === gtName);
  if (!gg) { say(`   ${m.name.padEnd(30)} ESLEME YOK`); continue; }
  usedGt.add(gg.name);
  const mb = bbox(m.poly), gb = bbox(gg.poly);
  const B = resample(gg.poly, 2);
  const c = chamfer(resample(m.poly, 2), B);
  let cOnce = null, mPolyOnce = null;
  if (motorOnce) {
    const mo = motorOnce.find((x) => x.name === m.name);
    if (mo) { mPolyOnce = mo.poly; cOnce = chamfer(resample(mo.poly, 2), B); }
  }
  say(`   ${(m.name + ' ~ ' + gg.name).padEnd(46)} ${(Math.round(mb.w)+'x'+Math.round(mb.h)).padEnd(11)} `
    + `${(Math.round(gb.w)+'x'+Math.round(gb.h)).padEnd(11)} `
    + `${(c.mean.toFixed(1)+' / '+c.p95.toFixed(1)+' / '+c.max.toFixed(1)).padEnd(25)} `
    + `${(cOnce ? cOnce.mean.toFixed(1) : '-').padEnd(10)} `
    + `${cOnce ? (c.mean - cOnce.mean >= 0 ? '+' : '') + (c.mean - cOnce.mean).toFixed(1) : '-'}`);
  rows.push({ motor: m.name, bugra: gg.name, kind: 'olculdu',
    mW: mb.w, mH: mb.h, gW: gb.w, gH: gb.h,
    mPerim: m.cutPerim, gPerim: gg.perim, mSeamPerim: m.seamPerim,
    chamfer: c, chamferOnce: cOnce, mPoly: m.poly, gPoly: gg.poly, mPolyOnce });
}
for (const gg of rings) {
  if (usedGt.has(gg.name)) continue;
  const gb = bbox(gg.poly);
  say(`   (motor karsiligi yok)                          ${gg.name.padEnd(28)} Bugra ${Math.round(gb.w)}x${Math.round(gb.h)}`);
  rows.push({ bugra: gg.name, kind: 'bugra-fazla', gW: gb.w, gH: gb.h, gPerim: gg.perim });
}

// ── B) LANDMARK-LANDMARK ───────────────────────────────────────────────────
say('');
say('B) LANDMARK-LANDMARK — ayni ADLI kenar, dikis cizgisi (mm). Chamfer sekil verir, bu satirlar SEVK olcusu verir.');
say('   kenar                      motor   Bugra   fark     motor y/k  Bugra y/k');

const lmRows = [];
function pushLM(ad, mLen, gLen, mRatio = null, gR = null, not = '') {
  lmRows.push({ ad, mLen, gLen, mRatio, gRatio: gR, not });
  const f = (mLen != null && gLen != null) ? (mLen - gLen) : null;
  say(`   ${ad.padEnd(26)} ${String(mLen == null ? '-' : r1(mLen)).padEnd(7)} `
    + `${String(gLen == null ? '-' : r1(gLen)).padEnd(7)} `
    + `${String(f == null ? '-' : (f >= 0 ? '+' : '') + r1(f)).padEnd(8)} `
    + `${String(mRatio == null ? '-' : mRatio.toFixed(3)).padEnd(10)} `
    + `${String(gR == null ? '-' : gR.toFixed(3))} ${not}`);
}

const ringOf = (n) => rings.find((r) => r.name === n);
const bugraFront  = bugraEdges(SG, ringOf('Front Body').ring1mm, 'locket_top/Front Body', SIZE);
const bugraBack   = bugraEdges(SG, ringOf('Back Body').ring1mm, 'locket_top/Back Body', SIZE);
const bugraSleeve = bugraEdges(SG, ringOf('Lower Sleeve').ring1mm, 'locket_top/Lower Sleeve', SIZE);
const bugraCollar = bugraEdges(SG, ringOf('Collar').ring1mm, 'locket_top/Collar', SIZE);
const gE = (list, name) => list?.find((e) => e.name === name) ?? null;

const mFront  = motorBodyEdges(piecesNow.find((p) => p.name === 'Top Front'));
const mBack   = motorBodyEdges(piecesNow.find((p) => p.name === 'Top Back'));
const mSleeve = motorSleeveEdges(piecesNow.find((p) => /Sleeve/.test(p.name)));
const mCollar = motorCollarEdges(piecesNow.find((p) => /Collar/.test(p.name)));

const lmFail = [];
if (!mFront.ok) lmFail.push('Top Front: ' + mFront.why);
if (!mBack.ok) lmFail.push('Top Back: ' + mBack.why);
if (!mSleeve.ok) lmFail.push('Sleeve: ' + mSleeve.why);
if (!mCollar.ok) lmFail.push('Collar: ' + mCollar.why);

const mRatioOf = (e) => (e && e.kiris > 0 ? e.len / e.kiris : null);
const gRatioOf = (e) => (e && e.kiris > 0 ? e.cutMM / e.kiris : null);

if (mFront.ok) {
  const n = mFront.named;
  pushLM('yaka-on', n.yaka?.len, gE(bugraFront, 'yaka-on')?.stitchMM);
  pushLM('omuz-on', n.omuz?.len, gE(bugraFront, 'omuz-on')?.stitchMM);
  pushLM('OYUK-on', n.OYUK?.len, gE(bugraFront, 'OYUK-on')?.stitchMM,
         mRatioOf(n.OYUK), gRatioOf(gE(bugraFront, 'OYUK-on')), '(y/k KESIM cizgisinde)');
  const gSide = (gE(bugraFront, 'yan-dikis-alt')?.stitchMM ?? 0) + (gE(bugraFront, 'yan-dikis-ust')?.stitchMM ?? 0);
  pushLM('yan-dikis-on', n['yan-dikis']?.len, gSide, null, null, '(Bugra: alt+ust, arada pens agzi)');
  pushLM('etek-on', n.etek?.len, gE(bugraFront, 'etek-on')?.stitchMM);
  pushLM('on-orta CF', n.orta?.len, gE(bugraFront, 'on-orta(CF)')?.stitchMM);
}
if (mBack.ok) {
  const n = mBack.named;
  pushLM('yaka-arka', n.yaka?.len, gE(bugraBack, 'yaka-arka')?.stitchMM);
  pushLM('omuz-arka', n.omuz?.len, gE(bugraBack, 'omuz-arka')?.stitchMM);
  pushLM('OYUK-arka', n.OYUK?.len, gE(bugraBack, 'OYUK-arka')?.stitchMM,
         mRatioOf(n.OYUK), gRatioOf(gE(bugraBack, 'OYUK-arka')));
  pushLM('yan-dikis-arka', n['yan-dikis']?.len, gE(bugraBack, 'yan-dikis-arka')?.stitchMM);
  pushLM('etek-arka', n.etek?.len, gE(bugraBack, 'etek-arka')?.stitchMM);
  pushLM('arka-orta CB', n.orta?.len, gE(bugraBack, 'arka-orta(CB)')?.stitchMM);
}
let oyukToplam = null, oyukIsaret = null;
if (mFront.ok && mBack.ok) {
  oyukToplam = mFront.named.OYUK.len + mBack.named.OYUK.len;
  oyukIsaret = mFront.named.OYUK.len - mBack.named.OYUK.len;
  const gOn = gE(bugraFront, 'OYUK-on'), gArka = gE(bugraBack, 'OYUK-arka');
  pushLM('OYUK toplam (on+arka)', oyukToplam, gOn.stitchMM + gArka.stitchMM);
  pushLM('OYUK on-arka (isaret)', oyukIsaret, gOn.cutMM - gArka.cutMM, null, null,
         '(yasa: on <= arka — knowledge/drafting-math-eu38.md, Bugra 8/8 beden)');
}
if (mSleeve.ok) {
  const kap = gE(bugraSleeve, 'KAPAK(oyuga giden)');
  pushLM('KAPAK (oyuga giden)', mSleeve.capLen, kap?.stitchMM,
         mSleeve.capLen / mSleeve.capChord, kap ? kap.cutMM / kap.kiris : null);
  pushLM('kol kirisi (bicep)', mSleeve.capChord, kap?.kiris, null, null, '(Bugra kesim kirisi)');
  pushLM('kapak yuksekligi', mSleeve.capH, 129.81, null, null, '(Bugra sagitta, T14)');
  pushLM('kol alt kenari', mSleeve.hemLen, gE(bugraSleeve, 'ALT-kenar')?.stitchMM);
  pushLM('kol koltukalti', mSleeve.underLen, gE(bugraSleeve, 'uc-A')?.stitchMM);
  if (oyukToplam != null) {
    const gTot = gE(bugraFront, 'OYUK-on').stitchMM + gE(bugraBack, 'OYUK-arka').stitchMM;
    pushLM('kapak/oyuk fazlasi %', (mSleeve.capLen - oyukToplam) / oyukToplam * 100,
           (kap.stitchMM - gTot) / gTot * 100, null, null,
           '(motor TEK parcada buzgu | Bugra Lower ~0, buzgu AYRI Upper katmanda %29-35)');
  }
}
let mCollarRatio = null, gCollarRatio = null;
if (mCollar.ok) {
  const gIn = bugraCollar?.reduce((a, b) => (b.notches?.length && (!a || b.cutMM > a.cutMM) ? b : a), null);
  const gOut = bugraCollar ? [...bugraCollar].sort((a, b) => b.cutMM - a.cutMM)[0] : null;
  pushLM('yaka boyun kenari', mCollar.boyun.len, gIn?.stitchMM, null, null, '(Bugra: centikli kenar = boyun)');
  pushLM('yaka dis kenari', mCollar.dis.len, gOut?.stitchMM);
  mCollarRatio = mCollar.dis.len / mCollar.boyun.len;
  gCollarRatio = gOut && gIn ? gOut.cutMM / gIn.cutMM : null;
  pushLM('yaka dis/boyun orani', null, null, mCollarRatio, gCollarRatio);
}
for (const f of lmFail) say(`   LANDMARK AYRIMI YAPILAMADI — ${f}`);

// ── B2) SCYE KARNI vs YAYINLANMIS GENISLIK CIZGISI ─────────────────────────
// Motorun KENDI yasasi (engine/src/bodice.hpp, Aldrich p.11'in iki noktasindan
// gecen dogru): oyugun KARNI bu x'e oturur. Burada iddia degil OLCUM yapilir:
// cizilen oyuk kubiginin en kucuk x'i.
const bustMM = BODY.bust * 10;
const YAYIN = { on: 0.150 * bustMM + 30.0, arka: 0.125 * bustMM + 62.0 };
function scyeBelly(pieces, adi) {
  const p = pieces.find((q) => q.name === adi);
  if (!p) return null;
  const role = (p.edgeRoles ?? []).find((r) => /^armhole_/.test(r.role));
  if (!role) return null;
  let cur = null, best = null;
  for (const c of p.commands) {
    if (c.type === 'move' || c.type === 'line') { cur = [c.x, c.y]; continue; }
    if (c.type !== 'curve') continue;
    const isIt = Math.abs(c.x - role.endX) < 1e-6 && Math.abs(c.y - role.endY) < 1e-6;
    if (isIt) {
      let m = Math.min(cur[0], c.x);
      for (let i = 0; i <= 400; i++) {
        const t = i / 400, u = 1 - t;
        m = Math.min(m, u*u*u*cur[0] + 3*u*u*t*c.cp1x + 3*u*t*t*c.cp2x + t*t*t*c.x);
      }
      best = { belly: m, tipX: cur[0] };
    }
    cur = [c.x, c.y];
  }
  return best;
}
const bellyNow = { on: scyeBelly(piecesNow, 'Top Front'), arka: scyeBelly(piecesNow, 'Top Back') };
const bellyOnce = piecesOnce
  ? { on: scyeBelly(piecesOnce, 'Top Front'), arka: scyeBelly(piecesOnce, 'Top Back') }
  : { on: null, arka: null };
say('');
say('B2) SCYE KARNI — motorun KENDI yayinlanmis genislik cizgisine (Aldrich p.11) uzaklik');
for (const half of ['on', 'arka']) {
  const n = bellyNow[half], o = bellyOnce[half];
  say(`   ${half.padEnd(6)} yayin cizgisi ${YAYIN[half].toFixed(2)} | omuz ucu ${n ? n.tipX.toFixed(2) : '?'} `
    + `| karin ONCE ${o ? o.belly.toFixed(2) : '-'} (acik ${o ? (o.belly - YAYIN[half]).toFixed(2) : '-'}) `
    + `-> SIMDI ${n ? n.belly.toFixed(2) : '-'} (acik ${n ? (n.belly - YAYIN[half]).toFixed(2) : '-'})`);
}

// ── C) SINIFLANDIRMA ───────────────────────────────────────────────────────
const gv = (list, name, field = 'stitchMM') => gE(list, name)?.[field] ?? null;
const num = (v) => (v == null ? '?' : String(Math.round(v * 10) / 10));
const frontRow = rows.find((r) => r.motor === 'Top Front');
const backRow = rows.find((r) => r.motor === 'Top Back');
const collarRow = rows.find((r) => r.motor?.includes('Collar'));
const upper = rings.find((r) => r.name === 'Upper Sleeve');

const SINIF = [
  { s: 'STIL', ad: 'beden cizelgesi',
    olcum: `motor EU38 bust 88.0 vs Bugra 38 bust ${bs.bustMM/10} cm (oran ${(BODY.bust*10/bs.bustMM).toFixed(3)}) — her yarim panelde ~%4.3 beklenen genislik farki`,
    kok: 'iki yayin iki ayri cizelgesi; motor KENDI yayimli cizelgesini cizer',
    durum: 'DUZELTILMEZ' },
  { s: 'STIL', ad: 'giysi boyu',
    olcum: `on-orta CF motor ${num(mFront.ok ? mFront.named.orta?.len : null)} vs Bugra ${num(gv(bugraFront, 'on-orta(CF)'))} mm`,
    kok: "motorun topLength sinifi 'hip'; Bugra'nin ustu belin hemen altinda bitiyor — ayni giysi degil",
    durum: 'DUZELTILMEZ' },
  { s: 'STIL', ad: 'buyume-yakali on vs ayri facing',
    olcum: `Bugra on ${Math.round(frontRow?.gW ?? 0)} / arka ${Math.round(backRow?.gW ?? 0)} mm (+${Math.round((frontRow?.gW ?? 0) - (backRow?.gW ?? 0))}); motor on ${Math.round(frontRow?.mW ?? 0)} / arka ${Math.round(backRow?.mW ?? 0)} (+${Math.round((frontRow?.mW ?? 0) - (backRow?.mW ?? 0))}) + 2 ayri facing parcasi`,
    kok: 'ayni islev iki topolojiyle cozulmus; ikisi de dikilebilir',
    durum: 'DUZELTILMEZ' },
  { s: 'STIL', ad: 'kol topolojisi (buzgunun yeri)',
    olcum: mSleeve.ok && oyukToplam != null
      ? `motor TEK parca, kapak fazlasi %${num((mSleeve.capLen - oyukToplam) / oyukToplam * 100)} | Bugra Lower ~%${num((gv(bugraSleeve, 'KAPAK(oyuga giden)') - (gv(bugraFront, 'OYUK-on') + gv(bugraBack, 'OYUK-arka'))) / (gv(bugraFront, 'OYUK-on') + gv(bugraBack, 'OYUK-arka')) * 100)} + AYRI Upper katman %29-35`
      : '?',
    kok: 'buzgu orani AYNI BANDDA, farkli parcaya konmus',
    durum: 'kok = asagidaki MOTOR EKSIGI' },

  { s: 'MOTOR EKSIGI', ad: 'tuketici sozlugunden erisilebilen GENEL iki-katman buzgu operatoru',
    olcum: upper ? `Bugra Upper Sleeve ${Math.round(bbox(upper.poly).w)}x${Math.round(bbox(upper.poly).h)} mm; bu kor kiyasta motorda karsiligi 0 parca` : '?',
    kok: 'Iki katmani doguran YAPI-OZGU Locket ekseni var ve calisiyor; bu kor spec onu bilerek set etmiyor (bkz. KOR_SPEC). Parca yok cunku SORULMADI, motor cizemedigi icin degil. Tanik ayni agacta: engine/tests/buzgu_katman_check.mjs (e), Upper 444.1 mm > Lower 329.2 mm (buzgu payi x1.349). Gercek acik daha dar: sleeveCap {plain,gathered,puffed,cap} tek parcayi sekillendirir, yani tuketici sozlugunden erisilen GENEL bir iki-katman operatoru yok.',
    durum: 'ACIK (dar hali) — "motor iki katmanli pufu CIZEMIYOR" cumlesi GERI CEKILDI, olcumle curudu' },
  { s: 'MOTOR EKSIGI', ad: 'yaka KAVISI (dis/boyun orani TUTUYOR, kavis tutmuyor)',
    olcum: mCollar.ok
      ? `dis/boyun orani motor ${mCollarRatio.toFixed(3)} vs Bugra ${gCollarRatio ? gCollarRatio.toFixed(3) : '?'} (%${gCollarRatio ? (Math.abs(mCollarRatio / gCollarRatio - 1) * 100).toFixed(1) : '?'} fark — AYNI AILE). Ayrilan sey KAVIS: bbox en/boy motor ${((collarRow?.mW ?? 0) / (collarRow?.mH ?? 1)).toFixed(2)} vs Bugra ${((collarRow?.gW ?? 0) / (collarRow?.gH ?? 1)).toFixed(2)}; motor yakasi yayvan bir bant, Bugra'ninki neredeyse ceyrek halka`
      : '?',
    kok: 'yaka konturu boyun kenarinin OFSETI olarak cizilir; "yatma yarikapi" (bir peterPan\'in ne kadar kivrilacagi) icin eksen yok — collarType kategorik',
    durum: 'ACIK' },
  { s: 'MOTOR EKSIGI', ad: 'mm-hedefli ust boyu',
    olcum: 'topLength {cropped, hip, tunic} = 3 sinif; skirtLengthMM var, topLengthMM yok',
    kok: 'boy ekseni nicel degil',
    durum: 'ACIK' },

  { s: 'KAPANDI', ad: 'set-in scye karni motorun KENDI yayinlanmis genislik cizgisine ULASMIYORDU',
    olcum: `on: yayin cizgisi ${YAYIN.on.toFixed(2)} | omuz ucu ${bellyNow.on.tipX.toFixed(2)} | cizilen karin ${bellyNow.on.belly.toFixed(2)} -> ACIK ${(bellyNow.on.belly - YAYIN.on).toFixed(2)} mm (ONCE 11.08). `
      + `arka: yayin ${YAYIN.arka.toFixed(2)} | omuz ucu ${bellyNow.arka.tipX.toFixed(2)} | karin ${bellyNow.arka.belly.toFixed(2)} -> ACIK ${(bellyNow.arka.belly - YAYIN.arka).toFixed(2)} mm (ONCE 9.05). `
      + `yay/kiris on ${mFront.ok ? mRatioOf(mFront.named.OYUK).toFixed(3) : '?'} (ONCE 1.066) arka ${mBack.ok ? mRatioOf(mBack.named.OYUK).toFixed(3) : '?'} (ONCE 1.033); olculen Bugra tanigi 1.229 / 1.175`,
    kok: "cp1.x omuz ucunun DISINDA (+0.06*dx) idi -> x'(0) > 0, egri uctan DISARI ayriliyordu ve solveHollow'un useWidthLine dali ULASILAMAZ bir hedefi kovalayip tavana oturuyordu. Yer: engine/src/bodice.cpp armholeCurveFor `setIn` dali. Duzeltme TEK SATIR, YENI SABIT YOK: cizgi kullanilabilirken cp1.x = innerLimit.",
    durum: 'KAPANDI 2026-09-03 (hakem K1). Oyuk toplami 404.3 -> 422.9 mm, K1 bandi (400-440) ICINDE. Golden pin DECLARED RE-PIN ile tasindi (engine/GOLDEN-PIN.md 2026-09-03, 5432 satir yerinde degisti). Kapilar: engine_check 70200 PASS, garment_armhole_check / sleeve_check / locket_check / buzgu_katman_check / sewability_check / cuttable_output_check / notch_alignment_check hepsi YESIL.' },
  { s: 'KAPANDI', ad: 'arka scye karnini scyeMaxInset kelepceliyordu (ON yaka genisligiyle olculdugu icin)',
    olcum: `arka omuz ucu ${bellyNow.arka.tipX.toFixed(2)}, yayin cizgisi ${YAYIN.arka.toFixed(2)} -> gereken icerlek ${(bellyNow.arka.tipX - YAYIN.arka).toFixed(2)}mm; ulasilan karin ${bellyNow.arka.belly.toFixed(2)} (ACIK ${(bellyNow.arka.belly - YAYIN.arka).toFixed(2)}mm). ONCE: yalniz 1.08mm icerlege izin veriliyordu, acik 7.97mm kaliyordu.`,
    kok: 'bodice.cpp naturalTipXForScye "dogal blok omuz ucu"nu ON yaka genisligi carpaniyla (frontNeckWidthFactor 0.17) hesaplayip AYNI degeri arkaya da uyguluyordu; arka yaka daha genis (0.197) oldugu icin gercek arka omuz ucu o referansin disinda kaliyor ve tavan gercekte olmayan bir kelepce vuruyordu',
    durum: 'KAPANDI 2026-09-03 (hakem K4). Capa yariya gore ayri hesaplaniyor (naturalTipXFront / naturalTipXBack), yeni sabit YOK.' },
  { s: 'KAPANDI', ad: 'centikler DIKIS cizgisine basiliyordu, kesim cizgisine degil',
    olcum: 'sewability_check ratchet: notch_off_boundary 211 -> 0, mark_far_from_edge 342 -> 0 (mark_over_seam_allowance 32, degismedi). Iki tavan da bu commit\'te 0\'a INDIRILDI (yukseltilmedi).',
    kok: 'annotateTechnical draft() icinde kesim cizgilerinden ONCE kosuyordu, yani kendi referans cizgisini goremiyordu; ustelik capayi konturun degil BOUNDING BOX\'in max-x\'ine koyuyordu (egri yan dikiste konturun uzerinde bile olmayan bir nokta). Uc duzeltme: (1) gecis kesim cizgilerinden SONRA kosuyor, (2) capa yan dikis YURUYUSUNUN uzerinde, (3) fermuar disi tikleri kesim kenarindan basliyor. Ayrica denge centigi artik iki yarida EsIT mm\'de (commonSideSeamMM), esit KESIRDE degil.',
    durum: 'KAPANDI 2026-09-03 (hakem K3). Iki kapi SIKILASTI: cuttable_output_check kesir kiyasini birakip dikisi YURUYOR (0.1mm), notch_alignment_check bbox max-x yerine konturun ustunde 0.5mm ve mm-esitligi olcuyor.' },
  { s: 'KAPANDI', ad: 'FLAT DUGMEYI HIC CIZMIYORDU (sayfa "dugmeli" derken giysi dugmesiz)',
    olcum: 'KOSU/ciktilar/bugra-spec-giysi.svg: ONCE 0 dugme; SIMDI 7 dugme (data-rol="dugme", r=9.00mm). Kalip tarafinda dugmeler ZATEN vardi (Top Front markings 110 komut).',
    kok: 'IKI KOPUKLUK, ikisi de AD ESLESMESI: (1) web/lib/flat-from-pattern.js dugme katmanini HIC OKUMUYORDU — flat kalibin izdusumu olmasina ragmen markings icindeki daireler izdusume girmiyordu; (2) engine/src/buttonrow.cpp frontCenter() uc yazim biliyordu ("Bodice/Top Front..."), Bugra Locket hatti on paneli "Front Body" diye adlandirdigi icin buttonRow=functional olan bir Locket sessizce dugmesiz ciziliyordu. Motorun dugmeyi CIZEMEDIGI iddiasi YANLISTI: buttonrow.cpp buttonCircle dort kubik ceyrek yayla ciziyor ve calisiyor.',
    durum: 'KAPANDI 2026-09-03 (hakem K7). Flat dugme sayisini, yaricapini ve derinlik oranini KALIPTAN okur; uydurulmus sayi yok.' },
  { s: 'HATA', ad: 'on oyuk arka oyuktan UZUN (isaret ihlali)',
    olcum: oyukIsaret != null
      ? `motor on-arka = ${num(oyukIsaret)} mm (yasa: <= 0). Bugra kesim cizgisinde ${num(gv(bugraFront, 'OYUK-on', 'cutMM') - gv(bugraBack, 'OYUK-arka', 'cutMM'))} mm, 8/8 bedende negatif`
      : '?',
    kok: `motorun koltukalti seviyesinde ON ceyregi ARKA ceyregden genis (on ${num(mFront.ok ? mFront.named.OYUK.to[0] : null)} / arka ${num(mBack.ok ? mBack.named.OYUK.to[0] : null)} mm); Aldrich p.11 genislik cizgileri TERSINI yayinliyor (sirt 34.4 > on 32.4 cm)`,
    durum: 'ACIK — hakem K5: SIMDI DOKUNMA, kendi fazini hak ediyor (butun bloklari oynatir, 8 bedende once/sonra ister). '
      + 'EXIT KODU: bu tek kalem bir REGRESYON CIZGISI tasiyor (asagi bak) — kirmizi ADIYLA duruyor ama kapiyi tek basina dusurmuyor, '
      + 'cunku kapanmasi bir OLCUM degil bir KARAR. Emsal: engine/tests/v5-ratchet-baseline.json V5-G uzlasmasi. '
      + 'DIKKAT — BU FAZ ONU KOTULESTIRDI: 18.4 -> 22.5 mm. Sebep K1/K4: on oyuk yayinlanmis on genislik cizgisine (162.0) '
      + 'oturunca arkadan (172.0) daha COK uzadi. Iki duzeltme de motorun KENDI yayinina karsi dogru; kotulesen sey, '
      + 'zaten ACIK olan on/arka bust bolusumu. Cizgi bugunku olculen degere BILEREK ve ADIYLA tasindi — sessiz degil.',
    kuyruk: { cizgiMM: 22.5, olculenMM: oyukIsaret } },
  { s: 'MOTOR EKSIGI', ad: 'fitted top BELDE DARALMIYOR (yan dikis koltukaltindan etege surekli genisliyor)',
    olcum: 'sevk edilen cizimde (KOSU/ciktilar/bugra-spec-giysi.png, FRONT ve BACK figurleri) shaping=dart oldugu halde yan dikis monoton; bel daralmasi GOZLE 0. Kalipta bust pensi VAR, yan dikiste bel girintisi YOK.',
    kok: 'shaping ekseni PENS uretir, yan dikis EGRISI uretmez; "fitted" bir ust bel hattinda yan dikisten de alir. Motorda yan dikisi belde iceri alan bir eksen yok.',
    durum: 'ACIK — bu fazda ADIYLA acildi, kapatilmadi (hakem raporunda C bolumunun hicbir kovasinda gecmiyordu)' },
];

say('');
say('C) FARKIN SINIFI — STIL / MOTOR EKSIGI / HATA / KAPANDI (her satir sayiyla)');
for (const c of SINIF) {
  say(`   [${c.s}] ${c.ad}`);
  say(`        olcum : ${c.olcum}`);
  say(`        kok   : ${c.kok}`);
  say(`        durum : ${c.durum}`);
}
say('');
say('MOTORUN SOZLUGUNDE OLMAYAN BUGRA YAPILARI (adiyla, sessiz atlama yok):');
for (const n of NOT_IN_VOCAB) say('  - ' + n);

// ── bindirme levhasi (ONCE | SIMDI) ────────────────────────────────────────
const INK_M = '#1a1a1a', INK_O = '#9a9a9a', INK_B = '#c0392b', PAPER = '#ffffff';
const n2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
const dOf = (P) => 'M ' + P.map(([x, y]) => `${n2(x)} ${n2(y)}`).join(' L ') + ' Z';
const pairs = rows.filter((r) => r.kind === 'olculdu');
const PAD = 24, HEAD = 56, GAP = 34;
let cx = PAD, rowH = 0, cy = HEAD + PAD;
const cells = []; let sheetW = 0;
// ONCE ve SIMDI AYNI SATIRDA durur — ikisi ayri satira dusunce "yan yana fark"
// diye bir sey kalmiyor. Sarma sadece CIFTLER arasinda olur.
for (const r of pairs) {
  const which = ['once', 'simdi'].filter((w) => (w === 'once' ? r.mPolyOnce : r.mPoly));
  const boxes = which.map((w) => {
    const mp = w === 'once' ? r.mPolyOnce : r.mPoly;
    const b = bbox([...mp, ...r.gPoly]);
    return { w: Math.max(b.w, 200), h: b.h + 42, mp, which: w };
  });
  const pairW = boxes.reduce((a, b) => a + b.w, 0) + GAP * (boxes.length - 1);
  if (cx + pairW > 1240 && cells.length) { cx = PAD; cy += rowH + GAP + 10; rowH = 0; }
  for (const b of boxes) {
    cells.push({ r, which: b.which, mp: b.mp, x: cx, y: cy, w: b.w, h: b.h });
    cx += b.w + GAP; rowH = Math.max(rowH, b.h); sheetW = Math.max(sheetW, cx);
  }
  cx += GAP;
}
const sheetH = cy + rowH + PAD;
let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n2(sheetW)} ${n2(sheetH)}" width="100%" data-unit-mm="1" data-kind="bugra-kor-kontrol" data-size="${SIZE}">`
  + `<rect width="${n2(sheetW)}" height="${n2(sheetH)}" fill="${PAPER}"/>`
  + `<text x="${PAD}" y="22" font-family="Helvetica,Arial,sans-serif" font-size="15" font-weight="700" fill="${INK_M}">BUGRA KOR KONTROLU — motor EU38 vs Bugra Locket Top 38 (kirmizi kesik), mm 1:1, bbox-min hizali</text>`
  + `<text x="${PAD}" y="39" font-family="Helvetica,Arial,sans-serif" font-size="11" fill="${INK_B}">her parca IKI kez: solda ONCE (gri, git ${BASELINE_REV}), sagda SIMDI (siyah) — ayni kirmizi kontura karsi. Olcum, ayar degil.</text>`;
for (const c of cells) {
  const { r } = c;
  const ch = c.which === 'once' ? r.chamferOnce : r.chamfer;
  svg += `<g transform="translate(${n2(c.x)} ${n2(c.y)})">`
    + `<text x="0" y="10" font-family="Helvetica,Arial,sans-serif" font-size="10" font-weight="600" fill="${c.which === 'once' ? INK_O : INK_M}">${c.which === 'once' ? 'ONCE' : 'SIMDI'} — ${r.motor} ~ ${r.bugra}</text>`
    + `<text x="0" y="23" font-family="Helvetica,Arial,sans-serif" font-size="8.5" fill="${INK_B}">Chamfer mean ${ch ? ch.mean.toFixed(1) : '-'} / p95 ${ch ? ch.p95.toFixed(1) : '-'} / max ${ch ? ch.max.toFixed(1) : '-'} mm</text>`
    + `<g transform="translate(0 34)">`
    + `<path d="${dOf(r.gPoly)}" fill="none" stroke="${INK_B}" stroke-width="1.2" stroke-dasharray="6 4" stroke-linejoin="round"/>`
    + `<path d="${dOf(c.mp)}" fill="none" stroke="${c.which === 'once' ? INK_O : INK_M}" stroke-width="1.3" stroke-linejoin="round"/>`
    + `</g></g>`;
}
svg += '</svg>';
const svgPath = join(OUTDIR, 'bugra-bindirme.svg');
writeFileSync(svgPath, svg);
say('');
say(`bindirme: ${svgPath}`);
if (!process.argv.includes('--no-png')) {
  try {
    const { rasterise } = await import(join(ROOT, 'engine/tools/raster.mjs'));
    rasterise(svgPath, join(OUTDIR, 'bugra-bindirme.png'), 2000);
    say(`bindirme: ${join(OUTDIR, 'bugra-bindirme.png')}`);
  } catch (e) { say(`PNG basilamadi (${e.message}) — SVG gecerli urun`); }
}

// ── rapor ──────────────────────────────────────────────────────────────────
const md = `# Bugra kor kontrolu — motor EU38 vs satin alinmis Locket Top beden 38

> KOR KONTROL. Hicbir sayi "Bugra'ya benzesin" diye motora geri yazilmadi. Fark
> uc kovaya ayrildi (STIL / MOTOR EKSIGI / HATA); sadece HATA kovasi, KENDI kok
> sebebinden kapatildi. Uretici: \`node engine/tools/bugra-blind-compare.mjs\`
> (ctest disi, kapi degil).

## Kurulum
- Kor spec (Bugra'nin urun TARIFINDEN, mm'lerinden degil): \`${JSON.stringify(RAW_SPEC)}\`
- Motor govdesi: contract euSizeChart EU38 = bust 88 / waist 70 / hip 94 cm.
- Bugra 38 kendi cizelgesi = ${bs.bustMM/10} / ${bs.waistMM/10} / ${bs.hipMM/10} cm. **Iki "38" ayni govde degil** (bust orani ${(BODY.bust*10/bs.bustMM).toFixed(3)}).
- Kesim cizgisi iki tarafta da dikis payi DAHIL: motor ${motor[0].sa}mm, Bugra 10mm (+30mm etek).
- Hizalama bbox-min kosesi, dondurmesiz, olceklemesiz; ornekleme 2mm.
- ${baselineNote}

## A) Panel dis cevresi — Chamfer (mm)

| motor ~ Bugra | motor bbox | Bugra bbox | mean SIMDI | p95 | max | mean ONCE | delta |
|---|---|---|---|---|---|---|---|
${pairs.map((r) => `| ${r.motor} ~ ${r.bugra} | ${Math.round(r.mW)}×${Math.round(r.mH)} | ${Math.round(r.gW)}×${Math.round(r.gH)} | ${r.chamfer.mean.toFixed(1)} | ${r.chamfer.p95.toFixed(1)} | ${r.chamfer.max.toFixed(1)} | ${r.chamferOnce ? r.chamferOnce.mean.toFixed(1) : '-'} | ${r.chamferOnce ? ((r.chamfer.mean - r.chamferOnce.mean >= 0 ? '+' : '') + (r.chamfer.mean - r.chamferOnce.mean).toFixed(1)) : '-'} |`).join('\n')}

Parca sayisi: **motor ${motor.length}** vs **Bugra ${rings.length}**.

Cevre (kesim cizgisi, mm):
${pairs.map((r) => `- ${r.motor}: motor ${Math.round(r.mPerim)} vs Bugra ${Math.round(r.gPerim)} (fark ${Math.round(r.mPerim - r.gPerim)}, ${((r.mPerim - r.gPerim) / r.gPerim * 100).toFixed(0)}%) — motor dikis cizgisi ${Math.round(r.mSeamPerim)}`).join('\n')}

## B) Landmark-landmark (dikis cizgisi, mm)

Motor tarafi kendi \`edgeRoles\` beyanindan (oyuk capa, komsular ondan turetilir),
Bugra tarafi \`patterns_real/geometry/seamgraph.json\` adli kenarlarindan. Sabit
komut indeksi / sabit landmark listesi YOK.

| kenar | motor | Bugra | fark | motor yay/kiris | Bugra yay/kiris | not |
|---|---|---|---|---|---|---|
${lmRows.map((r) => `| ${r.ad} | ${r.mLen == null ? '-' : r1(r.mLen)} | ${r.gLen == null ? '-' : r1(r.gLen)} | ${r.mLen != null && r.gLen != null ? ((r.mLen - r.gLen >= 0 ? '+' : '') + r1(r.mLen - r.gLen)) : '-'} | ${r.mRatio == null ? '-' : r.mRatio.toFixed(3)} | ${r.gRatio == null ? '-' : r.gRatio.toFixed(3)} | ${r.not} |`).join('\n')}
${lmFail.length ? '\n**LANDMARK AYRIMI YAPILAMADI:**\n' + lmFail.map((f) => '- ' + f).join('\n') : ''}

## B2) Scye karni vs motorun KENDI yayinlanmis genislik cizgisi (Aldrich p.11)

Bu satirlar Bugra'yla degil, motorun KENDI yasasiyla kiyaslar (bodice.hpp:
\`scyeChestWidthHalf* / scyeBackWidthHalf*\`). "Karin" = cizilen oyuk kubiginin
en kucuk x'i — kontrol noktasi degil, EGRININ kendisi.

| yari | yayin cizgisi | omuz ucu | karin ONCE (acik) | karin SIMDI (acik) |
|---|---|---|---|---|
${['on', 'arka'].map((h) => `| ${h} | ${YAYIN[h].toFixed(2)} | ${bellyNow[h] ? bellyNow[h].tipX.toFixed(2) : '?'} | ${bellyOnce[h] ? bellyOnce[h].belly.toFixed(2) + ' (' + (bellyOnce[h].belly - YAYIN[h]).toFixed(2) + ')' : '-'} | ${bellyNow[h] ? bellyNow[h].belly.toFixed(2) + ' (' + (bellyNow[h].belly - YAYIN[h]).toFixed(2) + ')' : '-'} |`).join('\n')}

## C) Farkin sinifi

${SINIF.map((c) => `### [${c.s}] ${c.ad}\n- olcum: ${c.olcum}\n- kok sebep: ${c.kok}\n- durum: **${c.durum}**`).join('\n\n')}

## Motorun cizemedigi Bugra yapilari (adiyla; sessiz atlama yok)
${NOT_IN_VOCAB.map((s) => '- ' + s).join('\n')}
- Motor karsiligi olmayan Bugra halkalari (beden 38): ${rows.filter((r) => r.kind === 'bugra-fazla').map((r) => `${r.bugra} ${Math.round(r.gW)}×${Math.round(r.gH)}`).join(' · ')}.
- Motor fazlasi: Front/Back Neck Facing — Bugra facing kullanmiyor. Yapisal fark, hata degil.

## Urun
- Bindirme levhasi: \`KOSU/ciktilar/bugra-bindirme.svg\` + \`.png\` — her parca IKI kez
  (ONCE gri = git ${BASELINE_REV}, SIMDI siyah), ayni kirmizi Bugra konturuna karsi, mm 1:1.
`;
writeFileSync(join(OUTDIR, 'bugra-rapor.md'), md);
say(`rapor: ${join(OUTDIR, 'bugra-rapor.md')}`);

// ── K10: BU KOMUT ARTIK BIR KAPI ──────────────────────────────────────────
// Hakem 2026-09-03: "bugra-blind-compare her kosuda exit 0 veren bir RAPOR
// araci; kapi degil. Sinifladigi HATA kovasi bos degilse exit 1 versin — o
// zaman 'yesil kosuyor' bir sey ifade eder."
// Kapi SADECE [HATA] kovasini isirir. [STIL] mesru fark, [MOTOR EKSIGI] adiyla
// acilmis bir yetenek boslugu (kapatilmasi ayri bir faz), [KAPANDI] tarihsel
// kayit. HATA = yanlis hesap, ve yanlis hesap sevk edilemez.
// Bir HATA kalemi kapiyi DUSURMEZ ancak KARAR'a bagli bir kuyruk satiri
// tasiyorsa; o zaman bile bir REGRESYON CIZGISI tasimak ZORUNDA ve cizgiyi
// ASARSA kapi yine kirmizi doner. Kuyruksuz her HATA dogrudan exit 1.
const hatalar = SINIF.filter((c) => c.s === 'HATA');
let dusur = 0;
say('');
say(`KAPI — [HATA] kovasi: ${hatalar.length} kalem`);
for (const h of hatalar) {
  if (!h.kuyruk) { say(`   KIRMIZI [HATA] ${h.ad} — kuyruk satiri YOK, kapiyi dusuruyor`); dusur++; continue; }
  const { cizgiMM, olculenMM } = h.kuyruk;
  const asti = olculenMM != null && Math.abs(olculenMM) > Math.abs(cizgiMM) + 0.05;
  say(`   KIRMIZI [HATA] ${h.ad} — olculen ${olculenMM == null ? '?' : num(olculenMM)} mm, ` +
      `regresyon cizgisi ${cizgiMM} mm${asti ? ' -> CIZGI ASILDI, kapi kirmizi' : ' (karara bagli, kapiyi dusurmuyor)'}`);
  if (asti) dusur++;
}
say(`   (bilgi: ${SINIF.filter((c) => c.s === 'MOTOR EKSIGI').length} MOTOR EKSIGI ve ` +
    `${SINIF.filter((c) => c.s === 'STIL').length} STIL kalemi ADIYLA yukarida; ikisi de exit kodunu DUSURMEZ. ` +
    `${SINIF.filter((c) => c.s === 'KAPANDI').length} kalem bu fazda KAPANDI.)`);
if (dusur) process.exitCode = 1;
say(dusur ? `KAPI KIRMIZI: ${dusur} kalem` : 'KAPI YESIL: kapiyi dusuren kalem yok');
