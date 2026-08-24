#!/usr/bin/env node
// flat_convention_check.mjs — FLAT KONVANSIYON KAPISI (F-D, 2026-08-23).
//
// Damla: "iyi flat yok, oyleyse iyi kalip da olamaz." · "flatlerin hepsi ayni
// convention'da degil. hepsinin AYNI MODELDEN CIKMA gibi olmasi lazim." ·
// "flat tarz sorunu degil, CS hesap ve matematik isidir."
//
// Bu kapi HICBIR SEYE INANMAZ: uretim kalemini (engine/tools/render-garment-flat.mjs)
// bir stil matrisinde kosturur, cikan SVG'yi PARSE eder ve alti sarti MEKANIK olcer.
// Kanun contract/flat-convention-v1.json'da; kapi da kalem de degerleri ORADAN okur,
// kimse kendi kopyasini tutmaz.
//
//   1. TEK CROQUIS       omuz ucu (x,y) + gogus/koltukalti (x,y) + bel yuksekligi
//                        butun stillerde +-2 mm icinde ayni (contract toleranceMM).
//   1c. OMUZ ICERIDE     omuz ucu x <= gogus (koltukalti) x. GEOMETRIK YASA, esik
//                        degil: set-in kol oyugu omuz ucu ile koltukaltini paylasir
//                        ve omuzdan asagi/iceri iner, disari sisemez.
//   2. OLCEK BEYANI      kokte data-scale + data-unit-mm; beyan contract ile ayni;
//                        VE olculen croquis genislikleri KAYNAKLI beden cizelgesiyle
//                        tutarli (gogus yari-genisligi x unitMM == bustCM*10/4).
//   3. CIZGI HIYERARSISI her cizili elemanin (width, dash) cifti beyan edilmis bir
//                        sinifa esit; beyan edilen her sinif en az bir kez kullanilmis.
//   4. SIFIR BOYA        gradient/filter/opacity sayisi 0; fill degerleri sadece
//                        none / kagit beyazi / murekkep.
//   5. ON + ARKA         her flat'te data-view="front" ve "back" panelleri var.
//   6. TEK KONTUR RENGI  butun stroke degerlerinin kumesi == {murekkep}.
//
// ANTI-HACK: croquis isaretleri panelde data-* olarak BEYAN ediliyor, ama kapi
// beyani GEOMETRIK olarak da cikariyor (siluet path'inin uc noktalarindan) ve
// ikisini karsilastiriyor. Yalan beyan = KIRMIZI. Beyani silmek de = KIRMIZI.
//
// KAPSAM (acikca yazili, gizlenmiyor): olculen kalem URETIM kalemi
// renderGarmentFlat(). REFERANS KALEM engine/flat-engine/_engine-full.mjs
// SALT-OKUNUR (Damla emri 2026-07-19) — bu kapi onu OLCER ve sapmasini RAPORLAR,
// ama kirmizi dusurmez, cunku duzeltmek Damla'nin kalem revizyonuna bagli.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const LAW = JSON.parse(readFileSync(join(root, 'contract/flat-convention-v1.json'), 'utf8'));
const TABLES = JSON.parse(readFileSync(join(root, 'contract/tables.json'), 'utf8'));
const { renderGarmentFlat } = await import(join(root, 'engine/tools/render-garment-flat.mjs'));

const UNIT = LAW.scale.unitMM;
const TOL_MM = LAW.croquis.toleranceMM;
const TOL_U = TOL_MM / UNIT;
const INK = LAW.ink.color.toLowerCase();

let fails = 0;
const FAIL = (msg) => { console.log(`FAIL  ${msg}`); fails += 1; };
const OK = (msg) => console.log(`ok    ${msg}`);

// ---------------------------------------------------------------------------
// STIL MATRISI — birbirinden gercekten FARKLI aileler. Croquis testinin anlami
// bu: iki FARKLI stilin flat'i ayni mankenden cikmis gibi olmali.
// ---------------------------------------------------------------------------
const MATRIX = [
  ['princess_scoop_dress', { garment: 'dress', neckline: 'scoop', shaping: 'princess', skirtStyle: 'aLine', skirtLength: 'midi', closure: 'backZip' }],
  ['boat_shift_dress',     { garment: 'dress', neckline: 'boat', shaping: 'shift', skirtStyle: 'straight', skirtLength: 'mini' }],
  ['vneck_empire_dress',   { garment: 'dress', neckline: 'vNeck', waistline: 'empire', shaping: 'darts', skirtStyle: 'gathered', skirtLength: 'maxi' }],
  ['square_gathered_dress',{ garment: 'dress', neckline: 'square', shaping: 'darts', skirtStyle: 'gathered', skirtLength: 'midi', gatherType: 2, gatherZone: 2 }],
  ['crew_sleeved_top',     { garment: 'top', neckline: 'crew', shaping: 'darts', topLength: 'hip', sleeveStyle: 'set', sleeveLength: 'short' }],
  ['sweetheart_crop_top',  { garment: 'top', neckline: 'sweetheart', shaping: 'princess', topLength: 'crop' }],
  ['scoop_tunic_placket',  { garment: 'top', neckline: 'scoop', shaping: 'darts', topLength: 'tunic', frontPlacket: 1 }],
  ['cowl_openback_top',    { garment: 'top', neckline: 'cowl', shaping: 'shift', topLength: 'waist', backOpening: 1 }],
];

// ---------------------------------------------------------------------------
// SVG PATH — sadece M/L/C/Q/Z mutlak (kalemin bastigi dil). Uc noktalari donur.
// ---------------------------------------------------------------------------
function endpoints(d) {
  const tok = d.match(/[MLCQZ]|-?\d+(?:\.\d+)?/gi) || [];
  const out = [];
  let i = 0, cmd = '';
  const num = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    const t = tok[i];
    if (/^[MLCQZ]$/i.test(t)) { cmd = t.toUpperCase(); i += 1; if (cmd === 'Z') continue; }
    if (cmd === 'M' || cmd === 'L') out.push([num(), num()]);
    else if (cmd === 'C') { num(); num(); num(); num(); out.push([num(), num()]); }
    else if (cmd === 'Q') { num(); num(); out.push([num(), num()]); }
    else i += 1;
  }
  return out;
}
const bboxArea = (pts) => {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
};

// Bir panelin GOVDE SILUETI = paneldeki en buyuk kutulu path. (Kol/ic cizgi degil.)
function silhouette(panelSvg) {
  const ds = [...panelSvg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
  let best = null, bestA = -1;
  for (const d of ds) {
    const pts = endpoints(d);
    if (pts.length < 5) continue;
    const a = bboxArea(pts);
    if (a > bestA) { bestA = a; best = pts; }
  }
  return best;
}

// GEOMETRIK croquis cikarimi — beyana bakmadan. Siluetin SAG yarisi CF yakadan
// CF etek ucuna kadar; icinden omuz ucu / koltukalti / bel isaretleri cikarilir.
//
// ★ V4-A KOK DUZELTMESI (2026-08-24). ESKI cikarim omuz ucunu "CF yakadan asagi
// yurunurken x'in ILK KESIN YEREL MAKSIMUMU" diye buluyordu. O sezgi YALNIZCA
// omuz gogusten GENISSE dogrudur — yani kapi, duzeltmeye calistigi kusurun ta
// kendisini VARSAYIYORDU: omuz ucu buste geri cekilince (dogru giysi) yerel
// maksimum kaybolur, cikarim koltukaltini omuz sanar ve kapi 27/153/750 mm
// sapma basardi. Kapi kendi kusurunu koruyordu.
//
// YENI KRITER — omuz/gogus ORANINDAN BAGIMSIZ, tamamen SIRT-GEOMETRIK:
//   omuz ucu = OMUZ CIZGISI ile KOL OYUGU EGRISININ bulustugu KOSE.
// Iki komsu kirisin karakteri bunu yeterince belirler:
//   * omuz cizgisi SIGDIR ve DISA gider  (|dx| >= |dy|, dx > 0)
//   * kol oyugu DIK INER                 (|dy| >  |dx|, dy > 0)
// Kol oyugu tanimi geregi omuzdan ASAGI iner (set-in armscye); omuz cizgisi
// tanimi geregi boyun noktasindan omuz ucuna yatay yurur. Bu ayrim omuzun
// gogusten genis mi dar mi oldugunu HIC SORMAZ.
// Yukari giden dik kirisler (kare/sweetheart yakanin dikey kenari) dy > 0
// sartiyla elenir; onlar yaka, omuz degil.
// ANTI-HACK: hicbir data-* beyani, hicbir kanun sayisi okunmaz — sadece cizilen
// poligonun kendi kirisleri.
function measureCroquis(pts) {
  // sag yari: bastan, |x|<0.5 ile CF etege donene kadar
  let end = pts.length - 1;
  for (let i = 1; i < pts.length; i++) { if (Math.abs(pts[i][0]) < 0.5) { end = i; break; } }
  const half = pts.slice(0, end + 1);
  const chord = (i) => [half[i + 1][0] - half[i][0], half[i + 1][1] - half[i][1]];
  const shallowOut = (c) => c[0] > 0 && Math.abs(c[0]) >= Math.abs(c[1]);
  const steepDown = (c) => c[1] > 0 && Math.abs(c[1]) > Math.abs(c[0]);
  let si = -1;
  for (let i = 1; i + 1 < half.length; i++) {
    if (shallowOut(chord(i - 1)) && steepDown(chord(i))) { si = i; break; }
  }
  if (si < 0) return { shoulder: null, chest: null, waist: null, half };
  const shoulder = half[si];
  const chest = half[si + 1] || null;
  const waist = half[si + 2] || null;
  return { shoulder, chest, waist, half };
}

// Panel bulucu. BIRINCIL yol: data-view isareti. YEDEK yol (isaret YOKSA):
// panel <g transform="translate(...)"> gruplarindan sirayla front/back. Yedek yol
// KASITLI: data-view'i silmek "5 on+arka" ve "1b beyan" sartlarini KIRAR ama
// croquis olcumunu KORLESTIRMEZ — isareti silerek olcumden kacilmaz.
function panels(svg) {
  const out = [];
  const re = /<g\s+data-view="(front|back)"([^>]*)>/g;
  const marks = [...svg.matchAll(re)];
  if (!marks.length) {
    const f = svg.indexOf('>FRONT<'), b = svg.indexOf('>BACK<');
    if (f >= 0 && b > f) {
      out.push({ view: 'front(legacy)', attrs: {}, body: svg.slice(f, b) });
      out.push({ view: 'back(legacy)', attrs: {}, body: svg.slice(b) });
    }
    return out;
  }
  for (let k = 0; k < marks.length; k++) {
    const start = marks[k].index;
    const stop = k + 1 < marks.length ? marks[k + 1].index : svg.length;
    const attrs = {};
    for (const a of marks[k][2].matchAll(/([a-z-]+)="([^"]*)"/g)) attrs[a[1]] = a[2];
    out.push({ view: marks[k][1], attrs, body: svg.slice(start, stop) });
  }
  return out;
}

// ---------------------------------------------------------------------------
console.log('=== FLAT KONVANSIYON KAPISI — uretim kalemi, ' + MATRIX.length + ' stil');
console.log(`    kanun: contract/flat-convention-v1.json  unitMM=${UNIT}  tolerans=${TOL_MM}mm`);

const rendered = MATRIX.map(([name, spec]) => [name, spec, renderGarmentFlat([], spec)]);

// --- 5. ON + ARKA ----------------------------------------------------------
let allPanels = [];
for (const [name, , svg] of rendered) {
  const ps = panels(svg);
  const views = ps.map((p) => p.view);
  if (!views.includes('front') || !views.includes('back')) {
    FAIL(`[5 on+arka] ${name}: data-view paneli eksik, bulunan=[${views.join(',')}]`);
  }
  allPanels.push(...ps.map((p) => ({ ...p, style: name })));
}
if (!fails) OK(`5 on+arka — ${MATRIX.length} stilin hepsinde front+back paneli var`);

// --- 1. TEK CROQUIS --------------------------------------------------------
console.log('\n--- 1. TEK CROQUIS (geometrik olcum, beyana bakmadan)');
const rows = [];
for (const p of allPanels) {
  const pts = silhouette(p.body);
  if (!pts) { FAIL(`[1 croquis] ${p.style}/${p.view}: siluet path'i bulunamadi`); continue; }
  const m = measureCroquis(pts);
  if (!m.shoulder || !m.chest || !m.waist) { FAIL(`[1 croquis] ${p.style}/${p.view}: isaret cikarilamadi`); continue; }
  rows.push({ style: p.style, view: p.view, attrs: p.attrs,
    shX: m.shoulder[0], shY: m.shoulder[1], chX: m.chest[0], chY: m.chest[1], waY: m.waist[1] });
}
const spread = (key) => {
  const v = rows.map((r) => r[key]);
  return { min: Math.min(...v), max: Math.max(...v), mm: (Math.max(...v) - Math.min(...v)) * UNIT };
};
for (const [key, label] of [['shX', 'omuz ucu x'], ['shY', 'omuz ucu y'], ['chX', 'gogus (koltukalti) x'], ['chY', 'gogus hatti y']]) {
  const s = spread(key);
  const line = `${label.padEnd(22)} min ${s.min.toFixed(3)}u  max ${s.max.toFixed(3)}u  SAPMA ${s.mm.toFixed(2)} mm`;
  if (s.mm > TOL_MM + 1e-9) FAIL(`[1 croquis] ${line}  (> ${TOL_MM} mm)`); else OK(`1 croquis — ${line}`);
}
// bel hatti: dogal bel ailesi ayni yukseklikte olmali; empire ailesi ONU KULLANMAMALI
const nat = rows.filter((r) => (r.attrs['data-waistline'] || 'natural') === 'natural');
const emp = rows.filter((r) => r.attrs['data-waistline'] === 'empire');
if (nat.length) {
  const v = nat.map((r) => r.waY);
  const mm = (Math.max(...v) - Math.min(...v)) * UNIT;
  const line = `bel hatti y (dogal)    min ${Math.min(...v).toFixed(3)}u  max ${Math.max(...v).toFixed(3)}u  SAPMA ${mm.toFixed(2)} mm`;
  if (mm > TOL_MM + 1e-9) FAIL(`[1 croquis] ${line}  (> ${TOL_MM} mm)`); else OK(`1 croquis — ${line}`);
}
for (const r of emp) {
  const dmm = Math.abs(r.waY - LAW.croquis.landmarks.waistY.u) * UNIT;
  if (dmm <= TOL_MM) FAIL(`[1 croquis] ${r.style}/${r.view}: data-waistline="empire" beyan ediyor ama siluet dogal belde (${r.waY}u) — beyan kacamak`);
  else OK(`1 croquis — ${r.style}/${r.view} empire beyani gercek: siluet beli ${r.waY}u, dogal belden ${dmm.toFixed(1)}mm yukarida`);
}

// --- 1c. OMUZ GOGUSTEN DISARI TASAMAZ --------------------------------------
// GEOMETRIK YASA (esik degil, esitsizlik): set-in kollu bir giyside omuz ucu,
// gogus (koltukalti) hattinin DISINDA olamaz — cunku kol oyugu egrisi omuz ucu
// ile koltukaltini PAYLASIR (croquis.sleeveLaw.sleeveSharesArmholeEndpoints) ve
// omuzdan asagi ve ICERI iner (armholeNeverBulgesOutward). Omuz ucu bustun
// disinda kalirsa kol oyugu disa dogru sismek zorunda kalir ve omuz bir RAF
// gibi durur; giysi okunmaz. Sart bu yuzden gevsetilemez: ustunde bir SAYI yok.
// BUYUKLUK nereden: shoulderTipX = chestX x 0.9570; 0.9570 SATIN ALINMIS Bugra
// Locket EU38 'Back Body' parcasinda olculdu (196.13/204.94 mm yari-genislik,
// olcum GECE/log/F-E.bugra-olcum.txt). Bugra sayisi yalnizca BUYUKLUGU besler;
// kapinin sarti "Bugra'ya benziyor mu" DEGIL, "omuz bustun disinda mi" dir.
console.log('\n--- 1c. OMUZ UCU GOGUS HATTININ ICINDE (set-in kol yasasi)');
for (const r of rows) {
  const dmm = (r.shX - r.chX) * UNIT;
  const line = `${r.style}/${r.view}: omuz ucu ${(r.shX * UNIT).toFixed(2)} mm, gogus ${(r.chX * UNIT).toFixed(2)} mm, ` +
    `oran ${(r.shX / r.chX).toFixed(4)}`;
  if (r.shX > r.chX + 1e-9) {
    FAIL(`[1c omuz>gogus] ${line} — omuz gogusten ${dmm.toFixed(2)} mm DISARIDA; set-in kol oyugu omuz ucu ile koltukaltini paylasir, disari sisemez`);
  } else {
    OK(`1c omuz icerde — ${line}`);
  }
}

// --- ANTI-YALAN: beyan == cizilen ------------------------------------------
console.log('\n--- 1b. BEYAN == CIZILEN (croquis data-* yalan soyleyemez)');
const L = LAW.croquis.landmarks;
for (const r of rows) {
  const a = r.attrs;
  if (a['data-croquis'] !== LAW.croquis.id) { FAIL(`[1b] ${r.style}/${r.view}: data-croquis beyani yok/yanlis (${a['data-croquis']})`); continue; }
  const chk = [
    ['data-shoulder-x', r.shX, L.shoulderTipX.u], ['data-shoulder-y', r.shY, L.shoulderTipY.u],
    ['data-chest-x', r.chX, L.chestX.u], ['data-chest-y', r.chY, L.chestY.u],
  ];
  for (const [attr, drawn, law] of chk) {
    const dec = parseFloat(a[attr]);
    if (!Number.isFinite(dec)) { FAIL(`[1b] ${r.style}/${r.view}: ${attr} beyani yok`); continue; }
    if (Math.abs(dec - drawn) * UNIT > 0.2) FAIL(`[1b] ${r.style}/${r.view}: ${attr} beyan ${dec} ama CIZILEN ${drawn.toFixed(3)}`);
    if (Math.abs(dec - law) * UNIT > TOL_MM) FAIL(`[1b] ${r.style}/${r.view}: ${attr} beyan ${dec}, kanun ${law}`);
  }
}
if (!fails) OK('1b beyan == cizilen == kanun');

// --- 2. OLCEK BEYANI -------------------------------------------------------
console.log('\n--- 2. OLCEK BEYANI');
for (const [name, , svg] of rendered) {
  const sc = /<svg[^>]*\sdata-scale="([^"]+)"/.exec(svg);
  const um = /<svg[^>]*\sdata-unit-mm="([^"]+)"/.exec(svg);
  if (!sc) { FAIL(`[2 olcek] ${name}: kokte data-scale YOK`); continue; }
  if (!um) { FAIL(`[2 olcek] ${name}: kokte data-unit-mm YOK`); continue; }
  if (sc[1] !== LAW.scale.declared) FAIL(`[2 olcek] ${name}: data-scale="${sc[1]}", kanun "${LAW.scale.declared}"`);
  if (Math.abs(parseFloat(um[1]) - UNIT) > 1e-9) FAIL(`[2 olcek] ${name}: data-unit-mm=${um[1]}, kanun ${UNIT}`);
  const [, nStr] = sc[1].split(':');
  if (Math.abs(parseFloat(nStr) - UNIT) > 1e-9) FAIL(`[2 olcek] ${name}: data-scale 1:${nStr} ile unitMM ${UNIT} aritmetik olarak tutmuyor`);
}
// olcek GERCEK olcuyle tutarli mi: gogus yari-genisligi x unitMM == bust/4
const chart = TABLES.draft.euSizeChart;
const fi = chart._fields.indexOf('bustCM');
const bustMM = chart[LAW.referenceBody.size][fi] * 10;
const chDrawnMM = rows.length ? rows[0].chX * UNIT : NaN;
const want = bustMM / 4;
if (!(Math.abs(chDrawnMM - want) <= TOL_MM)) {
  FAIL(`[2 olcek] gogus yari-genisligi ${chDrawnMM.toFixed(2)} mm, KAYNAKLI capa ${want.toFixed(2)} mm (bustCM ${bustMM / 10} / 4) — fark ${(chDrawnMM - want).toFixed(2)} mm`);
} else {
  OK(`2 olcek — gogus yari-genisligi ${chDrawnMM.toFixed(2)} mm == bustCM/4 ${want.toFixed(2)} mm (burda EU38, verified)`);
}

// --- 3. CIZGI HIYERARSISI --------------------------------------------------
console.log('\n--- 3. CIZGI HIYERARSISI');
const CLASSES = LAW.lineClasses.classes;
const keyOf = (w, dash) => `${Number(w)}|${dash || ''}`;
const legal = new Map();
for (const [cname, c] of Object.entries(CLASSES)) legal.set(keyOf(c.width, c.dash), cname);
const used = new Set();
for (const [name, , svg] of rendered) {
  for (const el of svg.matchAll(/<(path|line|circle|polyline|rect)\b[^>]*>/g)) {
    const tag = el[0];
    const st = /\sstroke="([^"]+)"/.exec(tag);
    if (!st || st[1] === 'none') continue;
    const w = /\sstroke-width="([^"]+)"/.exec(tag);
    const dsh = /\sstroke-dasharray="([^"]+)"/.exec(tag);
    const k = keyOf(w ? w[1] : 1, dsh ? dsh[1] : '');
    if (!legal.has(k)) FAIL(`[3 hiyerarsi] ${name}: beyan edilmemis cizgi sinifi (width=${w ? w[1] : 'yok'} dash=${dsh ? dsh[1] : 'yok'}) -> ${tag.slice(0, 90)}`);
    else used.add(legal.get(k));
  }
}
for (const cname of Object.keys(CLASSES)) {
  if (!used.has(cname)) FAIL(`[3 hiyerarsi] "${cname}" sinifi beyan edilmis ama matriste HIC kullanilmamis (olu beyan)`);
}
if (used.size === Object.keys(CLASSES).length) OK(`3 hiyerarsi — ${used.size}/${Object.keys(CLASSES).length} sinif beyanli ve kullanilmis: ${[...used].join(', ')}`);

// --- 4. SIFIR BOYA ---------------------------------------------------------
console.log('\n--- 4. SIFIR GOLGE / GRADYAN / TINT');
const allowFill = new Set(LAW.fillLaw.allowedFills.map((s) => s.toLowerCase()));
for (const [name, , svg] of rendered) {
  for (const bad of LAW.fillLaw.forbidden) {
    const c = (svg.match(new RegExp(bad, 'gi')) || []).length;
    if (c) FAIL(`[4 boya] ${name}: yasak "${bad}" x${c}`);
  }
  for (const f of svg.matchAll(/\sfill="([^"]+)"/g)) {
    if (!allowFill.has(f[1].toLowerCase())) FAIL(`[4 boya] ${name}: izinsiz fill="${f[1]}"`);
  }
}

// --- 6. TEK KONTUR RENGI ---------------------------------------------------
console.log('\n--- 6. TEK KONTUR RENGI');
const inks = new Set();
for (const [, , svg] of rendered) for (const s of svg.matchAll(/\sstroke="([^"]+)"/g)) if (s[1] !== 'none') inks.add(s[1].toLowerCase());
if (inks.size !== 1 || !inks.has(INK)) FAIL(`[6 renk] kontur renkleri: {${[...inks].join(', ')}} — kanun {${INK}}`);
else OK(`6 renk — tek murekkep ${INK}`);

// --- PARITE RAPORU (KAPI DEGIL) -------------------------------------------
console.log('\n=== PARITE RAPORU (KAPI DEGIL) — REFERANS KALEM');
console.log('    engine/flat-engine/_engine-full.mjs SALT-OKUNUR (Damla emri 2026-07-19).');
try {
  const ref = await import(join(root, 'engine/flat-engine/_engine-full.mjs'));
  const keys = Object.keys(ref.STYLE);
  // DIKKAT: referans kalem murekkebi ATTRIBUTE ile degil <style> CSS SINIFI ile
  // veriyor. Attribute regex'i onu KOR olcer (0 renk / 0 agirlik) — bu rapor
  // CSS'i de okuyor, yoksa "sifir" diye yanlis sayi basardi.
  const refShoulderY = [], refChestY = [], refShoulderX = [], refChestX = [];
  let colors = new Set(), widths = new Set(), dashes = new Set(), scaleCount = 0;
  for (const k of keys) {
    let svg;
    try { svg = ref.renderStyle(k, {}); } catch { continue; }
    if (/data-scale|data-unit-mm/.test(svg)) scaleCount += 1;
    for (const m of svg.matchAll(/stroke:\s*([^;}\s]+)/g)) if (m[1] !== 'none') colors.add(m[1]);
    for (const m of svg.matchAll(/stroke-width:\s*([^;}\s]+)/g)) widths.add(m[1]);
    for (const m of svg.matchAll(/stroke-dasharray:\s*([^;}]+)/g)) dashes.add(m[1].trim());
    for (const m of svg.matchAll(/\sstroke="([^"]+)"/g)) if (m[1] !== 'none') colors.add(m[1]);
    // croquis: .body siniflı ana siluetin ilk (on) path'i
    const bodyD = /<path class="body" d="([^"]+)"/.exec(svg);
    if (bodyD) {
      const c = measureCroquis(endpoints(bodyD[1]));
      if (c.shoulder && c.chest) { refShoulderX.push(c.shoulder[0]); refShoulderY.push(c.shoulder[1]); refChestX.push(c.chest[0]); refChestY.push(c.chest[1]); }
    }
  }
  const sp = (v) => v.length ? (Math.max(...v) - Math.min(...v)).toFixed(2) : 'olculemedi';
  console.log(`    stil sayisi                 ${keys.length}`);
  console.log(`    data-scale beyan eden       ${scaleCount}/${keys.length}`);
  console.log(`    murekkep renkleri           {${[...colors].join(', ')}}  (uretim kalemi: ${INK})`);
  console.log(`    cizgi agirliklari           {${[...widths].sort().join(', ')}}`);
  console.log(`    kesik desenleri             {${[...dashes].join(' | ')}}`);
  console.log(`    croquis sapmasi (kendi ici, SVG birimi): omuz x ${sp(refShoulderX)}  omuz y ${sp(refShoulderY)}  gogus x ${sp(refChestX)}  gogus y ${sp(refChestY)}  (n=${refShoulderY.length})`);
  console.log('    NOT: croquis sapma sayisi GOSTERGE, DOGRULANMADI — referans kalemde askisiz/band');
  console.log('    stiller var, orada "ilk yerel maksimum" omuz ucu DEGIL band ucu olabilir.');
  console.log('    -> referans kalem uretim konvansiyonuna UYMUYOR (ayri murekkep, ayri agirlik tablosu,');
  console.log('       olcek beyani yok). SALT-OKUNUR oldugu icin bu gece DUZELTILMEDI; kirmizi da dusurmuyor.');
} catch (e) {
  console.log(`    referans kalem okunamadi: ${e.message}`);
}

console.log(`\n${fails === 0 ? 'PASS' : 'FAIL'} flat_convention_check — ${fails} ihlal`);
process.exit(fails === 0 ? 0 : 1);
