#!/usr/bin/env node
// bugra-blind-compare — BUGRA KOR KONTROLU (Damla'nin 12. maddesi, F8-bugra).
//
// SORU: "bir sey cizdiginde bugranin kalibina yakin bir sey cikiyor mu?"
//
// KANUN — BU BIR KAPI DEGIL, AYAR VIDASI HIC DEGIL:
//   * Bugra TUNE HEDEFI DEGIL. Motor Bugra'ya benzemek icin AYARLANMAZ.
//   * Bu arac sadece OLCER ve yazar. Bu olcumden sonra hicbir sabit degismez.
//   * Fark buyukse rapora HIPOTEZ yazilir (hangi fazin/kuralin eksigi), sabit eklenmez.
//   * ctest'e EKLI DEGIL — rapor araci, kapi degil.
//
// KOR SPEC: Bugra Locket Top'un SATIS SAYFASINDAKI giysi tarifi (dugmeli,
// peter pan yakali, puf kollu fitted top) motorun KENDI eksenlerine cevrilir;
// Bugra'nin mm'lerine BAKILMADAN kurulur. Spec asagida, her eksenin gerekcesi
// yaninda. Motorun cizemedigi yapilar (2 parcali kol, ayri yaka astari)
// ADIYLA raporlanir — sessiz atlama yok.
//
// GERCEK VERI: patterns_real/geometry/geometry-full.json — satin alinmis A0
// PDF'ten vektor cikarim (kalibrasyon 4cm bar = 40.00mm), beden 38 halkasi,
// dikis payi DAHIL. Motor tarafinda ayni sepet: cutLine (dikis payi DAHIL
// kesim cizgisi). SA farki: motor 15mm / Bugra 10mm (+30mm etek) — tabloya
// yazilir, duzeltilmez.
//
// BEDEN NOTU (gizlenmez): motorun yayimli EU38 govdesi (contract euSizeChart)
// bust/waist/hip = 88/70/94 cm; Bugra'nin kendi 38 cizelgesi (geometry-full
// sizeChartMM) 92/72/98 cm. Iki "38" ayni govde degil. Motor KENDI 38'ini
// cizer, Bugra 38 halkasiyla kiyaslanir; fark bu satirdan okunur.
//
// HIZALAMA (serbest parametre YOK — overlay-png.mjs / ring-compare.py usulu):
// iki kontur da kendi bbox min kosesine tasinir; Bugra'ya y_yerel = ymax - y
// (PDF y-yukari -> SVG y-asagi, beyan edilmis yon farki). Dondurme yok,
// olcekleme yok, en-iyi-oturtma yok. Chamfer bu hizada olculur; Bugra parcasi
// A0 sayfasinda farkli yonde yatiyorsa o fark da SAYIYA GIRER ve not edilir.
//
// kullanim:  node engine/tools/bugra-blind-compare.mjs [--no-png]
// ciktilar:  KOSU/ciktilar/bugra-rapor.md, bugra-bindirme.svg, bugra-bindirme.png

import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const OUTDIR = join(ROOT, 'KOSU/ciktilar');
mkdirSync(OUTDIR, { recursive: true });

const require = createRequire(import.meta.url);
// engine/dist bayat (18 Tem, cupSeam oncesi); guncel wasm web/vendor'da —
// bugra-parity.mjs ile ayni tercih, ayni gerekce.
const createEngine = require(join(ROOT, 'web/vendor/stitchu-engine.js'));
const engine = await createEngine();
const { engineSpec, bodyForSize } = await import(pathToFileURL(join(ROOT, 'web/js/engine.js')).href);

const GT = JSON.parse(readFileSync(join(ROOT, 'patterns_real/geometry/geometry-full.json'), 'utf8'));
const SIZE = '38';

// ── KOR SPEC — Bugra'nin urun tarifinden, mm'lerinden DEGIL ────────────────
// "buttoned, peter pan collared, puff sleeved fitted top":
//   buttonRow functional + placketStyle standard + frontPlacket  <- dugmeli on
//   collarType peterPan                                          <- bebe yaka
//   sleeveStyle straight + sleeveCap puffed + sleeveLength short <- puf kol
//   shaping dart (Bugra arka bel pensesi urun fotosunda; princess degil)
//   topLength hip: motorun sundugu {cropped, hip, tunic} icinde belden uzun
//   EN KISA sinif — giysi sinifi kurali, Bugra cetveline bakilmadi (bugra-parity
//   F8 dersiyle ayni kural).
const RAW_SPEC = {
  garment: 'top', shaping: 'dart', fabric: 'woven',
  neckline: 'crew', collarType: 'peterPan',
  sleeveStyle: 'straight', sleeveCap: 'puffed', sleeveLength: 'short',
  buttonRow: 'functional', placketStyle: 'standard', frontPlacket: true,
  topLength: 'hip',
};

// Motorun SOZLUGUNDE OLMAYAN Bugra yapilari — eksen yok, yani motor bunu
// cizemez; bu bir sessiz default degil, sozluk yoklugudur ve adiyla yazilir.
const NOT_IN_VOCAB = [
  'PUF UST KATMANI (Bugra Upper Sleeve): T14 olcumune gore (CLAUDE.md / knowledge/cap-ease-isareti-2026-08-17.md) Bugra kolu "yatay bolunmus" DEGIL — Lower Sleeve gercek set-in kol, Upper Sleeve onun ustune dikilen %29-35 buzgulu AYRI DIS KATMAN. Motorun sozlugunde "buzgulu ust katman" operatoru yok (sleeveCap {plain, gathered, puffed, cap} tek parcayi sekillendirir, ikinci katman dogurmaz). Motor puf ust katmanini CIZEMIYOR — adiyla kayit.',
  'ayri yaka astari parcasi (Collar Lining + tela): motor yakayi "cut 2 + interfacing" TALIMATIYLA verir, ayri astar PARCASI cizen eksen yok.',
];

const BODY = { ...bodyForSize('EU' + SIZE), upperBust: 0 };
const out = JSON.parse(engine.draftJSON(engineSpec(RAW_SPEC), BODY));
if (out.error) { console.error('MOTOR REDDETTI:', out.error); process.exit(1); }

// ── geometri yardimcilari ──────────────────────────────────────────────────
function bezPts(p0, c, n = 16) {
  const pts = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n, mt = 1 - t;
    pts.push([
      mt*mt*mt*p0[0] + 3*mt*mt*t*c.cp1x + 3*mt*t*t*c.cp2x + t*t*t*c.x,
      mt*mt*mt*p0[1] + 3*mt*mt*t*c.cp1y + 3*mt*t*t*c.cp2y + t*t*t*c.y,
    ]);
  }
  return pts;
}
function cmdsToPoly(cmds) {
  const P = []; let cur = null;
  for (const c of cmds) {
    if (c.type === 'move' || c.type === 'line') { cur = [c.x, c.y]; P.push(cur); }
    else if (c.type === 'curve') { P.push(...bezPts(cur, c)); cur = [c.x, c.y]; }
  }
  return P;
}
const bbox = (P) => {
  let x0 = 1/0, y0 = 1/0, x1 = -1/0, y1 = -1/0;
  for (const [x, y] of P) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
};
const closeP = (P) => (P.length && (P[0][0] !== P.at(-1)[0] || P[0][1] !== P.at(-1)[1]) ? [...P, P[0]] : P);
const perim = (P) => { let s = 0; for (let i = 1; i < P.length; i++) s += Math.hypot(P[i][0]-P[i-1][0], P[i][1]-P[i-1][1]); return s; };
const toOrigin = (P) => { const b = bbox(P); return P.map(([x, y]) => [x - b.x0, y - b.y0]); };
const flipY = (P) => { const b = bbox(P); return P.map(([x, y]) => [x, b.y1 - y]); };
// 2mm adimla esit-aralikli yeniden ornekleme (Chamfer ornek yogunlugu iki
// tarafta esit olsun; adim = geometry-full bezierStepMM ile ayni mertebe).
function resample(P, step = 2) {
  const Q = [P[0]]; let acc = 0;
  for (let i = 1; i < P.length; i++) {
    let [ax, ay] = P[i-1]; const [bx, by] = P[i];
    let seg = Math.hypot(bx-ax, by-ay);
    while (acc + seg >= step) {
      const t = (step - acc) / seg;
      const nx = ax + (bx-ax)*t, ny = ay + (by-ay)*t;
      Q.push([nx, ny]); ax = nx; ay = ny;
      seg = Math.hypot(bx-ax, by-ay); acc = 0;
    }
    acc += seg;
  }
  return Q;
}
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
// Simetrik Chamfer: iki yonde nokta->kontur mesafelerinin birlesik dagilimi.
function chamfer(A, B) {
  const dists = [];
  for (const p of A) dists.push(ptPolyDist(p, B));
  for (const p of B) dists.push(ptPolyDist(p, A));
  dists.sort((a, b) => a - b);
  const q = (f) => dists[Math.min(dists.length - 1, Math.floor(dists.length * f))];
  const mean = dists.reduce((a, b) => a + b, 0) / dists.length;
  return { mean, med: q(0.5), p95: q(0.95), max: dists.at(-1) };
}

// ── iki taraf ──────────────────────────────────────────────────────────────
// Motor: cutLine = dikis payi DAHIL kesim cizgisi (Bugra da SA dahil basar).
const motor = out.pattern.pieces.map((p) => ({
  name: p.name, cut: p.cutInstruction, sa: p.seamAllowance,
  poly: toOrigin(closeP(cmdsToPoly(p.cutLine ?? p.commands))),
  seamPerim: perim(closeP(cmdsToPoly(p.commands))),
}));
const rings = GT.rings.filter((r) => r.pattern === 'locket_top' && r.sizeGuess === SIZE)
  .map((r) => ({ name: r.piece, poly: toOrigin(flipY(closeP(r.polygon.map((p) => [p[0], p[1]])))) }));

// motor parca adi -> Bugra 38 halka adi. null = yapisal fark (sayi kiyasi
// yapilmaz ama SATIRI yazilir). Puff Sleeve, Bugra'nin LOWER Sleeve'ine karsi
// olculur: T14 olcumuyle oyuga dikilen gercek set-in kol LOWER'dir (kiris =
// bicep hatti, sagitta = kapak yuksekligi); Upper ise motorun cizemedigi
// buzgulu DIS katman. Es degil, en yakin islevsel karsilik; fark ayrica yazilir.
const MAP = {
  'Top Front': 'Front Body',
  'Top Back': 'Back Body',
  'Puff Sleeve': 'Lower Sleeve',
  'Peter Pan Collar (bebe yaka)': 'Collar',
  'Front Neck Facing': null,  // Bugra'da facing yok (astarli yaka konstruksiyonu)
  'Back Neck Facing': null,
};

// ── olcum ──────────────────────────────────────────────────────────────────
const lines = [];
const say = (s) => { lines.push(s); console.log(s); };

say('bugra-blind-compare | KOR KONTROL — olcum, ayar degil | Bugra Locket Top beden 38 vs motor EU38');
say(`kor spec: ${JSON.stringify(RAW_SPEC)}`);
say(`motor govde EU38 (contract euSizeChart): bust ${BODY.bust} / waist ${BODY.waist} / hip ${BODY.hip} cm`);
const bs = GT.sizeChartMM[SIZE];
say(`Bugra kendi 38 cizelgesi (sizeChartMM): bust ${bs.bustMM/10} / waist ${bs.waistMM/10} / hip ${bs.hipMM/10} cm -> IKI "38" AYNI GOVDE DEGIL (motor 88/70/94 = Bugra ~36-38 arasi); fark gizlenmez, tabloya girer`);
say(`dikis payi: motor ${motor[0].sa}mm her kenar | Bugra 10mm + etek 30mm (defter) — ikisi de kesim cizgisinde DAHIL, fark duzeltilmez`);
say(`hizalama: bbox min kosesi, dondurmesiz, olceklemesiz (serbest parametre YOK) | ornekleme 2mm`);
say('');
say(`PARCA SAYISI: motor ${motor.length} | Bugra ${rings.length} (defterde adli 6 + "EXTRA-TL (not in defter)")`);
say('');
say('parca eslemesi                                      motor bbox    Bugra bbox    Dcevre(kesim)   Chamfer mm (mean/med/p95/max)');

const usedGt = new Set();
const rows = [];
for (const m of motor) {
  const gtName = MAP[m.name];
  if (gtName === null) {
    say(`  ${m.name.padEnd(34)} YAPISAL FARK — Bugra'da bu parca yok (astarli yaka, facing kullanmiyor)`);
    rows.push({ motor: m.name, kind: 'yapisal-motor-fazla' });
    continue;
  }
  const g = rings.find((r) => r.name === gtName);
  if (!g) { say(`  ${m.name.padEnd(34)} ESLEME YOK`); continue; }
  usedGt.add(g.name);
  const mb = bbox(m.poly), gb = bbox(g.poly);
  const A = resample(m.poly), B = resample(g.poly);
  const c = chamfer(A, B);
  const dp = perim(m.poly) - perim(g.poly);
  say(`  ${(m.name + ' ~ ' + g.name).padEnd(48)} ${Math.round(mb.w)}x${Math.round(mb.h)}`.padEnd(66)
    + `${Math.round(gb.w)}x${Math.round(gb.h)}`.padEnd(14)
    + `${dp >= 0 ? '+' : ''}${Math.round(dp)}mm`.padEnd(16)
    + `${c.mean.toFixed(1)} / ${c.med.toFixed(1)} / ${c.p95.toFixed(1)} / ${c.max.toFixed(1)}`);
  rows.push({ motor: m.name, bugra: g.name, kind: 'olculdu',
    mW: mb.w, mH: mb.h, gW: gb.w, gH: gb.h,
    mPerim: perim(m.poly), gPerim: perim(g.poly), mSeamPerim: m.seamPerim,
    chamfer: c, mPoly: m.poly, gPoly: g.poly, cut: m.cut });
}
for (const g of rings) {
  if (usedGt.has(g.name)) continue;
  const gb = bbox(g.poly);
  say(`  (motor karsiligi yok)              ${g.name.padEnd(28)} Bugra ${Math.round(gb.w)}x${Math.round(gb.h)} — MOTOR EKSIGI ya da yapisal fark, asagida adiyla`);
  rows.push({ bugra: g.name, kind: 'bugra-fazla', gW: gb.w, gH: gb.h, gPerim: perim(g.poly) });
}
say('');
say('MOTORUN SOZLUGUNDE OLMAYAN BUGRA YAPILARI (adiyla, sessiz atlama yok):');
for (const n of NOT_IN_VOCAB) say('  - ' + n);
say('');
say('DIKIS/CEVRE UZUNLUKLARI (mm; motor: dikis cizgisi + kesim cizgisi, Bugra: kesim cizgisi — halka verisinde kenar ayrimi yok):');
for (const r of rows.filter((r) => r.kind === 'olculdu')) {
  say(`  ${r.motor.padEnd(34)} motor dikis ${Math.round(r.mSeamPerim)} | motor kesim ${Math.round(r.mPerim)} | Bugra kesim ${Math.round(r.gPerim)} | fark ${Math.round(r.mPerim - r.gPerim)} (${((r.mPerim - r.gPerim) / r.gPerim * 100).toFixed(0)}%)`);
}

// ── bindirme levhasi (SVG -> PNG) ──────────────────────────────────────────
const INK_M = '#1a1a1a', INK_B = '#c0392b', PAPER = '#ffffff';
const n2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
const dOf = (P) => 'M ' + P.map(([x, y]) => `${n2(x)} ${n2(y)}`).join(' L ') + ' Z';
const pairs = rows.filter((r) => r.kind === 'olculdu');
const PAD = 24, HEAD = 46, GAP = 30;
let cx = PAD, rowH = 0, cy = HEAD + PAD;
const cells = []; let sheetW = 0;
for (const r of pairs) {
  const b = bbox([...r.mPoly, ...r.gPoly]);
  const w = Math.max(b.w, 170), h = b.h + 34;
  if (cx + w > 1100 && cells.length) { cx = PAD; cy += rowH + GAP; rowH = 0; }
  cells.push({ r, x: cx, y: cy, w, h });
  cx += w + GAP; rowH = Math.max(rowH, h); sheetW = Math.max(sheetW, cx);
}
const sheetH = cy + rowH + PAD;
let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n2(sheetW)} ${n2(sheetH)}" width="100%" data-unit-mm="1" data-kind="bugra-kor-kontrol" data-size="${SIZE}">`
  + `<rect width="${n2(sheetW)}" height="${n2(sheetH)}" fill="${PAPER}"/>`
  + `<text x="${PAD}" y="22" font-family="Helvetica,Arial,sans-serif" font-size="15" font-weight="700" fill="${INK_M}">BUGRA KOR KONTROLU — motor EU38 (duz cizgi) vs Bugra Locket Top beden 38 (kesik kirmizi), mm 1:1, bbox-min hizali</text>`
  + `<text x="${PAD}" y="38" font-family="Helvetica,Arial,sans-serif" font-size="11" fill="${INK_B}">olcum, ayar degil — hicbir sabit bu levhadan sonra degistirilmedi | Chamfer = simetrik ortalama/med/p95/max mm</text>`;
for (const c of cells) {
  const { r } = c;
  svg += `<g transform="translate(${n2(c.x)} ${n2(c.y)})">`
    + `<text x="0" y="10" font-family="Helvetica,Arial,sans-serif" font-size="10" font-weight="600" fill="${INK_M}">${r.motor} ~ ${r.bugra}</text>`
    + `<text x="0" y="22" font-family="Helvetica,Arial,sans-serif" font-size="8.5" fill="${INK_B}">Chamfer mean ${r.chamfer.mean.toFixed(1)} / p95 ${r.chamfer.p95.toFixed(1)} / max ${r.chamfer.max.toFixed(1)} mm</text>`
    + `<g transform="translate(0 28)">`
    + `<path d="${dOf(r.gPoly)}" fill="none" stroke="${INK_B}" stroke-width="1.2" stroke-dasharray="6 4" stroke-linejoin="round"/>`
    + `<path d="${dOf(r.mPoly)}" fill="none" stroke="${INK_M}" stroke-width="1.2" stroke-linejoin="round"/>`
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
const front = rows.find((r) => r.motor === 'Top Front');
const collar = rows.find((r) => r.motor === 'Peter Pan Collar (bebe yaka)');
const sleeve = rows.find((r) => r.motor === 'Puff Sleeve');
const back = rows.find((r) => r.motor === 'Top Back');
const md = `# Bugra kor kontrolu — motor EU38 vs satin alinmis Locket Top beden 38

> KOR KONTROL, AYAR DEGIL. Bu rapordaki hicbir sayi motora geri yazilmadi;
> asagidaki hipotezler olcumdur, sabit onerisi degildir. Uretici:
> \`node engine/tools/bugra-blind-compare.mjs\` (ctest disi, kapi degil).

## Kurulum
- Kor spec (Bugra'nin urun TARIFINDEN, mm'lerinden degil): \`${JSON.stringify(RAW_SPEC)}\`
- Motor govdesi: contract euSizeChart EU38 = bust 88 / waist 70 / hip 94 cm.
- Bugra 38 kendi cizelgesi = 92 / 72 / 98 cm. **Iki "38" ayni govde degil** —
  motorun 88'lik govdesi Bugra cizelgesinde 36 ile 38 arasina duser. Fark
  gizlenmedi, sayilara girdi.
- Iki taraf da kesim cizgisi (dikis payi DAHIL): motor 15mm SA, Bugra 10mm
  (+30mm etek ucu). Hizalama bbox-min kosesi, dondurmesiz (serbest parametre yok).

## Sonuc tablosu (mm)

| motor parca ~ Bugra parca | motor bbox | Bugra bbox | Chamfer mean | med | p95 | max |
|---|---|---|---|---|---|---|
${pairs.map((r) => `| ${r.motor} ~ ${r.bugra} | ${Math.round(r.mW)}×${Math.round(r.mH)} | ${Math.round(r.gW)}×${Math.round(r.gH)} | ${r.chamfer.mean.toFixed(1)} | ${r.chamfer.med.toFixed(1)} | ${r.chamfer.p95.toFixed(1)} | ${r.chamfer.max.toFixed(1)} |`).join('\n')}

Parca sayisi: **motor ${motor.length}** vs **Bugra ${rings.length}** (defterde adli 6 + EXTRA-TL).

Dikis/cevre uzunluklari (kesim cizgisi, mm):
${pairs.map((r) => `- ${r.motor}: motor ${Math.round(r.mPerim)} vs Bugra ${Math.round(r.gPerim)} (fark ${Math.round(r.mPerim - r.gPerim)}, ${((r.mPerim - r.gPerim) / r.gPerim * 100).toFixed(0)}%) — motor dikis cizgisi ${Math.round(r.mSeamPerim)}`).join('\n')}

## Motorun cizemedigi Bugra yapilari (adiyla; sessiz atlama yok)
${NOT_IN_VOCAB.map((s) => '- ' + s).join('\n')}
- Motor karsiligi olmayan Bugra halkalari (beden 38): ${rows.filter(r=>r.kind==='bugra-fazla').map(r=>`${r.bugra} ${Math.round(r.gW)}×${Math.round(r.gH)}`).join(' · ')}.
- Motor fazlasi: Front/Back Neck Facing — Bugra facing kullanmiyor (astarli yaka konstruksiyonu). Yapisal fark, hata degil.

## Hipotezler (fark buyuk olan yerler — olcumle, sabit ONERISI DEGIL)
${front ? `1. **On boy farki** (motor ${Math.round(front.mH)} vs Bugra ${Math.round(front.gH)} mm, +${Math.round(front.mH - front.gH)}): motorun \`topLength\` tablosu {cropped, hip, tunic} — Bugra'nin fitted top boyu motorun 'hip' sinifindan kisa, 'cropped'tan uzun. Ara boy sinifi ya da mm-hedefli top boyu ekseni yok (skirtLengthMM var, topLengthMM yok). Eksik F2/F7 boy-ekseni sinifina duser; bir kismi da govde farki (Bugra 38 govdesi +4cm bust).` : ''}
${sleeve ? `2. **Kol yapisi** (motor tek Puff Sleeve ${Math.round(sleeve.mW)}×${Math.round(sleeve.mH)} vs Bugra Lower Sleeve ${Math.round(sleeve.gW)}×${Math.round(sleeve.gH)} + ayri buzgulu Upper katman): motor puf hacmini TEK parcanin tacina buzguyle koyuyor (o yuzden 394mm boy), Bugra ise duz set-in Lower + %29-35 buzgulu AYRI Upper katmanla veriyor. Chamfer buyuklugunun ana kaynagi bu topoloji farki; eksik olan "buzgulu ust katman" operatoru (T14 olcumu, CLAUDE.md — "yatay bolunmus kol" tezi ORADA curudu, burada tekrar kurulmadi).` : ''}
${collar ? `3. **Yaka orani** (motor ${Math.round(collar.mW)}×${Math.round(collar.mH)} vs Bugra ${Math.round(collar.gW)}×${Math.round(collar.gH)}): motorun peterPan yakasi omuz-yatik dar serit; Bugra yakasi derin tek parca + ayri astar. Yaka DERINLIK ekseni yok (collarType secimi var, boyut ekseni yok) — fark topolojik + oransal.` : ''}
${back ? `4. **Arka** (motor ${Math.round(back.mW)}×${Math.round(back.mH)} vs Bugra ${Math.round(back.gW)}×${Math.round(back.gH)}): en yakin eslesen govde parcasi; kalan fark boy (on ile ayni hipotez) + govde cizelge farki.` : ''}

## Urun
- Bindirme levhasi: \`KOSU/ciktilar/bugra-bindirme.svg\` + \`.png\` (motor duz, Bugra kesik kirmizi, mm 1:1).
`;
writeFileSync(join(OUTDIR, 'bugra-rapor.md'), md);
say(`rapor: ${join(OUTDIR, 'bugra-rapor.md')}`);
