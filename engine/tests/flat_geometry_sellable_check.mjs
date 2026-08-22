#!/usr/bin/env node
// flat_geometry_sellable_check.mjs — ETSY KAPISI / GEOMETRİ YARISI (F-E, 2026-08-23).
//
// Damla, 23 Ağu, bugünkü flat'e bakarak beş kusur saydı:
//   1. Kollar gövdeden KOPUK — arada beyaz boşluk, kol oyuğu çizgisi yok
//   2. Puff kol alttan düz kesik ve sivriliyor — manşet/lastik bitişi yok
//   3. Bel yok — gövde düz iniyor, oturmalı üst değil
//   4. Etek ucu kavisi abartılı
//   5. Boyun çok geniş, omuz çok dar
//
// Bu kapı bu kusurların MEKANİK OLARAK ÖLÇÜLEBİLEN kısmını tutar. Zevk kısmı
// (çizginin karakteri, "ay evet" hissi) kapıya GİRMEZ → `DAMLA-KUYRUK.md`.
//
// ★ HİÇBİR EŞİK BİZİM ÇIKTIMIZDAN TÜRETİLMEDİ (ORTAK.md md.3). İki dış kaynak:
//   [B] SATIN ALINMIŞ Buğra Locket EU38 kalıbı — `patterns_real/geometry/
//       geometry-full.json`, Arka Beden parçası, ring size 38. Arka seçildi:
//       arka-orta kenarı tam dikey (90.00°, 413.97 mm düz koşu) ve pens/placket
//       dış konturu kirletmiyor. Ölçüm dökümü: GECE/log/F-E.bugra-olcum.txt.
//       Ölçülen yarı-genişlikler (arka-ortadan, mm):
//           omuz 196.13 · göğüs(max) 204.94 · bel(min) 157.46 · etek 179.22
//       Göğüse normalize: 0.9570 / 1.0000 / 0.7683 / 0.8745
//   [C] contract/flat-convention-v1.json — F-D'nin flat kanunu (croquis, mürekkep,
//       çizgi sınıfları) + F-E'nin eklediği sideSeamProfile & sleeveLaw. Yeniden
//       BEYAN EDİLMEZ, sadece OKUNUR.
//
// KAPI, KANUNUN DEĞERİNE DEĞİL ÇOĞUNLUKLA EŞİTSİZLİĞE bakar. Eşitsizliklerin
// gevşetilecek bir sayısı yoktur; ya sağlanır ya sağlanmaz:
//   S1  omuz ucu GÖĞÜS ÇİZGİSİNİN İÇİNDE  (shoulderHalf < chestHalf)
//   S2  oturan bir ÜSTÜN eteği GÖĞÜSTEN GENİŞ OLAMAZ (hemHalf < chestHalf)
//   S3  bel gerçekten daralıyor: waistHalf <= KAYNAKLI çizelgenin waist/bust'ı
//   S4  kol oyuğu İÇBÜKEY: eğri kendi iki ucunun dışına taşmaz
//   S5  kol, gövdeyle İKİ UCU DA paylaşır (omuz ucu + koltukaltı), boşluk 0.00 mm
//   S6  PUFF kolun eti EN GENİŞ yerinden DAR + manşet bandı + büzgü tırtığı var
//
// ANTI-HACK: kapı hiçbir sabiti kalemden import etmez. Kalemin BASTIĞI SVG'yi
// parse eder, path'leri 400 adımda ÖRNEKLER ve ölçümü o örnekten çıkarır. Kalem
// bir sayıyı beyan edip başka bir şey çizerse kapı çizileni görür.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const LAW = JSON.parse(readFileSync(join(root, 'contract/flat-convention-v1.json'), 'utf8'));
const TABLES = JSON.parse(readFileSync(join(root, 'contract/tables.json'), 'utf8'));
const { renderGarmentFlat } = await import(join(root, 'engine/tools/render-garment-flat.mjs'));

const UNIT = LAW.scale.unitMM;
const SSP = LAW.croquis.sideSeamProfile;
const CQ = LAW.croquis.landmarks;
const TOL_MM = LAW.croquis.toleranceMM;

let fails = 0;
const FAIL = (m) => { console.log(`FAIL  ${m}`); fails += 1; };
const OK = (m) => console.log(`ok    ${m}`);

// ---------------------------------------------------------------------------
// SVG path (M/L/C/Q/Z, mutlak) -> yoğun nokta dizisi. Kalemin bastığı dil bu.
// ---------------------------------------------------------------------------
function samplePath(d, per = 40) {
  const tok = d.match(/[MLCQZ]|-?\d+(?:\.\d+)?/gi) || [];
  const pts = []; let i = 0, cmd = '', cur = [0, 0], start = [0, 0];
  const num = () => parseFloat(tok[i++]);
  const cub = (p0, c1, c2, p1) => {
    for (let k = 1; k <= per; k++) {
      const t = k / per, u = 1 - t;
      pts.push([u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0],
                u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1]]);
    }
  };
  const quad = (p0, c, p1) => {
    for (let k = 1; k <= per; k++) {
      const t = k / per, u = 1 - t;
      pts.push([u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0],
                u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]]);
    }
  };
  while (i < tok.length) {
    const t = tok[i];
    if (/^[MLCQZ]$/i.test(t)) {
      cmd = t.toUpperCase(); i += 1;
      if (cmd === 'Z') { pts.push(start.slice()); continue; }
    }
    if (cmd === 'M') { cur = [num(), num()]; start = cur.slice(); pts.push(cur.slice()); }
    else if (cmd === 'L') { const p = [num(), num()]; pts.push(p.slice()); cur = p; }
    else if (cmd === 'C') { const c1 = [num(), num()], c2 = [num(), num()], p = [num(), num()]; cub(cur, c1, c2, p); cur = p; }
    else if (cmd === 'Q') { const c = [num(), num()], p = [num(), num()]; quad(cur, c, p); cur = p; }
    else i += 1;
  }
  return pts;
}
const bbox = (pts) => {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
};
// Bir YÜKSEKLİKTEKİ yarı-genişlik. Bant içinde "en büyük |x|" ARAMAZ (o, işaretin
// biraz üstündeki daha geniş noktayı yakalayıp beli olduğundan geniş gösterirdi);
// silüeti bir POLİGON sayıp y doğrusuyla KESİŞİMLERİNİ interpole eder ve en
// dıştaki kesişimi döner. Tam sayı, bant yok.
function halfWidthAt(pts, y) {
  let best = null;
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1];
    if ((a[1] - y) * (b[1] - y) > 0 || Math.abs(b[1] - a[1]) < 1e-12) continue;
    const t = (y - a[1]) / (b[1] - a[1]);
    const x = Math.abs(a[0] + t * (b[0] - a[0]));
    best = Math.max(best ?? 0, x);
  }
  return best;
}
// ETEK yarı-genişliği = silüetin ALT %8'indeki en dış nokta (etek KÖŞESİ).
// En alt nokta değil: en alt nokta orta-öndeki sarkma çukurudur, etek köşesi değil.
function hemHalf(pts) {
  const b = bbox(pts), lo = b.y0 + (b.y1 - b.y0) * 0.92;
  let best = 0;
  for (const p of pts) if (p[1] >= lo) best = Math.max(best, Math.abs(p[0]));
  return best;
}
function panels(svg) {
  const out = [];
  const marks = [...svg.matchAll(/<g\s+data-view="(front|back)"([^>]*)>/g)];
  for (let k = 0; k < marks.length; k++) {
    const stop = k + 1 < marks.length ? marks[k + 1].index : svg.length;
    out.push({ view: marks[k][1], body: svg.slice(marks[k].index, stop) });
  }
  return out;
}
function pathsOf(panelSvg, attr) {
  const re = attr
    ? new RegExp(`<path[^>]*data-part="${attr}"[^>]*\\sd="([^"]+)"`, 'g')
    : /<path[^>]*\sd="([^"]+)"/g;
  return [...panelSvg.matchAll(re)].map((m) => m[1]);
}
// gövde silüeti = paneldeki en büyük kutulu path (F-D kapısıyla aynı tanım)
function silhouette(panelSvg) {
  let best = null, bestA = -1;
  for (const d of pathsOf(panelSvg)) {
    const pts = samplePath(d, 8);
    if (pts.length < 12) continue;
    const b = bbox(pts), a = (b.x1 - b.x0) * (b.y1 - b.y0);
    if (a > bestA) { bestA = a; best = d; }
  }
  return best ? samplePath(best, 40) : null;
}

// ---------------------------------------------------------------------------
const MATRIX = [
  ['locket_puff_top',    { garment: 'top', neckline: 'crew', shaping: 'darts', topLength: 'crop', sleeveStyle: 'set', sleeveLength: 'short', sleeveCap: 2, collarType: 4, frontPlacket: 1 }],
  ['crew_sleeved_top',   { garment: 'top', neckline: 'crew', shaping: 'darts', topLength: 'hip', sleeveStyle: 'set', sleeveLength: 'short' }],
  ['scoop_tunic_placket',{ garment: 'top', neckline: 'scoop', shaping: 'darts', topLength: 'tunic', frontPlacket: 1 }],
  ['sweetheart_crop_top',{ garment: 'top', neckline: 'sweetheart', shaping: 'princess', topLength: 'crop' }],
  ['princess_scoop_dress', { garment: 'dress', neckline: 'scoop', shaping: 'princess', skirtStyle: 'aLine', skirtLength: 'midi', closure: 'backZip' }],
];
const rendered = MATRIX.map(([name, spec]) => [name, spec, renderGarmentFlat([], spec)]);

console.log('=== ETSY KAPISI / GEOMETRİ — üretim kalemi, ' + MATRIX.length + ' stil');
console.log(`    kanun : contract/flat-convention-v1.json  unitMM=${UNIT}`);
console.log(`    ölçüt : Buğra Locket EU38 Arka Beden — ${JSON.stringify(SSP._normalizedToChest)}`);
console.log(`    kaynak: ${SSP._source.split('.')[0]}`);

// ---------------------------------------------------------------------------
// S1 + S2 + S3 — YAN DİKİŞ PROFİLİ
// ---------------------------------------------------------------------------
console.log('\n--- S1/S2/S3 YAN DİKİŞ PROFİLİ (çizilen silüetten ölçüldü)');
const chartF = TABLES.draft.euSizeChart._fields;
const eu38 = TABLES.draft.euSizeChart[LAW.referenceBody.size];
const chartWaistOverBust = eu38[chartF.indexOf('waistCM')] / eu38[chartF.indexOf('bustCM')];
const chartHipOverBust = eu38[chartF.indexOf('hipCM')] / eu38[chartF.indexOf('bustCM')];
const s1Violations = [];
const hemLadder = new Map();   // topLength -> etek/göğüs oranı (S2b merdiveni)

console.log(`    ${'stil/görünüm'.padEnd(28)} ${'omuz/göğüs'.padStart(11)} ${'bel/göğüs'.padStart(10)} ${'etek/göğüs'.padStart(11)}`);
for (const [name, spec, svg] of rendered) {
  for (const p of panels(svg)) {
    const pts = silhouette(p.body);
    if (!pts) { FAIL(`[S1] ${name}/${p.view}: silüet path'i bulunamadı`); continue; }
    const hShoulder = halfWidthAt(pts, CQ.shoulderTipY.u);
    const hChest = halfWidthAt(pts, CQ.chestY.u);
    const hWaist = halfWidthAt(pts, CQ.waistY.u);
    const hHem = hemHalf(pts);
    if (hShoulder == null || hChest == null || !hHem) { FAIL(`[S1] ${name}/${p.view}: işaret yüksekliğinde kesişim yok`); continue; }
    const rSh = hShoulder / hChest, rWa = hWaist == null ? NaN : hWaist / hChest, rHe = hHem / hChest;
    console.log(`    ${(name + '/' + p.view).padEnd(28)} ${rSh.toFixed(4).padStart(11)} ${(Number.isNaN(rWa) ? '—' : rWa.toFixed(4)).padStart(10)} ${rHe.toFixed(4).padStart(11)}`);

    // S1 — RAPOR, KAPI DEĞİL (bu gece). Şart: omuz ucu göğüs çizgisinin İÇİNDE
    // olmalı; set-in kollu hiçbir giyside omuz noktası büstün dışında olamaz.
    // Bugün İHLAL EDİLİYOR ve bu KAPATILMADI — çünkü croquis'i düzeltmek mevcut
    // flat_convention_check'in landmark çıkarımını da değiştirmeyi gerektiriyor
    // (o çıkarım omuzun göğüsten GENİŞ olduğunu, yani kusurun kendisini varsayıyor)
    // ve ORTAK.md md.5 "var olan teste dokunma" diyor. Karar Damla'da:
    // DAMLA-KUYRUK.md K-FE-1. Eşik gevşetilmedi — ŞART HİÇ KAPI YAPILMADI, ve
    // ihlal her koşuda EKRANA BASILIYOR ki sessizce kaybolmasın.
    if (!(rSh < 1.0)) s1Violations.push(`${name}/${p.view}: omuz/göğüs ${rSh.toFixed(4)} >= 1.0 (Buğra ${SSP._normalizedToChest.shoulder})`);

    const isDress = spec.garment === 'dress';
    if (!isDress) {
      // S2a — TAVAN: hiçbir üst, vücudun KALÇASINDAN geniş bitemez. Sayı kaynaklı
      // çizelgeden (burda EU38 hip/bust), bizim çıktımızdan değil.
      if (!(rHe <= chartHipOverBust + 1e-6)) {
        FAIL(`[S2a] ${name}/${p.view}: etek/göğüs ${rHe.toFixed(4)} > kaynaklı kalça/büst ${chartHipOverBust.toFixed(4)}`);
      }
      // S2c — BEL/CROP boyunda biten bir üst büstten GENİŞ olamaz: doğal belin
      // hemen altında vücut hâlâ büstten dardır.
      const tl = spec.topLength || 'hip';
      if ((tl === 'crop' || tl === 'waist') && !(rHe < 1.0)) {
        FAIL(`[S2c] ${name}/${p.view}: '${tl}' boy, etek/göğüs ${rHe.toFixed(4)} >= 1.0 — belde biten üst büstten GENİŞ (Buğra etek oranı ${SSP._normalizedToChest.hem})`);
      }
      const prev = hemLadder.get(tl);
      if (prev != null && Math.abs(prev - rHe) > 1e-6) FAIL(`[S2b] '${tl}' iki stilde iki farklı etek oranı verdi (${prev} vs ${rHe})`);
      hemLadder.set(tl, rHe);
    }

    // S3 — oturan gövdede bel, KAYNAKLI çizelgenin bel/büst oranından geniş olamaz.
    const fitted = spec.shaping === 'princess' || spec.shaping === 'darts' || spec.waistline === 'empire';
    if (fitted && !Number.isNaN(rWa) && !(rWa <= chartWaistOverBust + 1e-6)) {
      FAIL(`[S3] ${name}/${p.view}: bel/göğüs ${rWa.toFixed(4)} > kaynaklı çizelge ${chartWaistOverBust.toFixed(4)} (burda EU38 ${eu38[chartF.indexOf('waistCM')]}/${eu38[chartF.indexOf('bustCM')]})`);
    }
  }
}

// S2b — ETEK MERDİVENİ. Damla'nın 3. ("bel yok") ve 4. ("etek ucu kavisi abartılı")
// kusurlarının tek kök sebebi: eski kalem HER üste aynı etek genişliğini (kalça)
// veriyordu, boydan bağımsız. O yüzden bel daralıp hemen kalçaya açılıyor, crop
// boyda o açılma 24 birime sıkışıp kâse kavisi üretiyordu. Bu şart o eşitliği
// YASAKLAR: etek genişliği boyla KESİN ARTAR.
console.log('\n--- S2b ETEK MERDİVENİ (boy arttıkça etek genişler)');
const order = ['crop', 'waist', 'hip', 'tunic'].filter((k) => hemLadder.has(k));
console.log('    ' + order.map((k) => `${k} ${hemLadder.get(k).toFixed(4)}`).join('  <  '));
for (let i = 0; i + 1 < order.length; i++) {
  const a = hemLadder.get(order[i]), b = hemLadder.get(order[i + 1]);
  if (!(a < b - 1e-6)) FAIL(`[S2b] '${order[i]}' etek oranı ${a.toFixed(4)} >= '${order[i + 1]}' ${b.toFixed(4)} — etek boydan BAĞIMSIZ, bel okunmaz`);
}
if (order.length < 2) FAIL('[S2b] merdiven ölçülemedi: matriste en az iki farklı topLength gerekli');
if (!fails) OK('S2/S3 — on panelde yan dikiş profili giysi gibi, etek merdiveni monoton');

// --- S1 AÇIK KALEM (KAPI DEĞİL) -------------------------------------------
console.log('\n--- S1 OMUZ UCU BÜSTÜN İÇİNDE Mİ? (AÇIK KALEM — KAPI DEĞİL, K-FE-1)');
if (!s1Violations.length) console.log('    ihlal yok.');
else {
  console.log(`    ${s1Violations.length} panelde İHLAL — omuz ucu göğüs yarı-genişliğinin DIŞINDA:`);
  for (const v of s1Violations) console.log(`      ${v}`);
  const shMM = CQ.shoulderTipX.u * UNIT, chMM = CQ.chestX.u * UNIT;
  console.log(`    croquis: shoulderTipX ${shMM.toFixed(1)} mm (omuzdan omuza ${(2*shMM/10).toFixed(1)} cm) > chestX ${chMM.toFixed(1)} mm`);
  console.log(`    Buğra oranıyla olması gereken: ${(CQ.chestX.u*SSP._normalizedToChest.shoulder).toFixed(4)}u = ${(CQ.chestX.u*SSP._normalizedToChest.shoulder*UNIT).toFixed(2)} mm`);
  console.log('    KAPI YAPILMADI: croquis düzeltilince flat_convention_check.mjs measureCroquis()');
  console.log('    kırılıyor (o çıkarım omuzun göğüsten geniş olmasına dayanıyor = kusurun kendisi).');
  console.log('    Mevcut teste dokunmak ORTAK.md md.5 ile yasak. Karar Damla\'da: DAMLA-KUYRUK K-FE-1.');
}

// ---------------------------------------------------------------------------
// S4 — KOL OYUĞU İÇBÜKEY (eğri kendi iki ucunun dışına taşmaz)
// ---------------------------------------------------------------------------
console.log('\n--- S4 KOL OYUĞU İÇBÜKEY');
const shTipX = CQ.shoulderTipX.u, shTipY = CQ.shoulderTipY.u, chX = CQ.chestX.u, chY = CQ.chestY.u;
const scyeCeil = Math.max(shTipX, chX);
for (const [name, , svg] of rendered) {
  for (const p of panels(svg)) {
    const pts = silhouette(p.body);
    if (!pts) continue;
    // kol oyuğu bandı: omuz ucu yüksekliği ile koltukaltı yüksekliği arasındaki
    // SAĞ yarı noktaları (x > 0). Beyana bakılmadan, çizilenden.
    const scye = pts.filter((q) => q[0] > 0 && q[1] >= shTipY - 0.5 && q[1] <= chY + 0.5);
    if (!scye.length) { FAIL(`[S4] ${name}/${p.view}: kol oyuğu bandında nokta yok`); continue; }
    const maxX = Math.max(...scye.map((q) => q[0]));
    const over = (maxX - scyeCeil) * UNIT;
    if (over > 0.05) FAIL(`[S4] ${name}/${p.view}: oyuk max x ${maxX.toFixed(3)}u, tavan ${scyeCeil.toFixed(3)}u — DIŞARI ${over.toFixed(2)} mm taşıyor`);
  }
}
if (!fails) OK(`S4 — oyuk hiçbir panelde kendi uçlarının dışına taşmıyor (tavan ${scyeCeil.toFixed(3)}u)`);

// ---------------------------------------------------------------------------
// S5 + S6 — KOL: UÇLAR PAYLAŞILIYOR + PUFF ETİ TOPLANMIŞ
// ---------------------------------------------------------------------------
// KUANTLAMA TOLERANSI — GEVŞETME DEĞİL, KALEMİN YAZI ÇÖZÜNÜRLÜĞÜ. Kalem her
// koordinatı 0.1 kullanıcı birimine yuvarlayarak basıyor (render-garment-flat.mjs
// `n()`), yani SVG'de temsil edilebilen en küçük fark 0.1u = 0.3 mm. İki ucun
// "aynı nokta" olması bu yazıda en fazla yarım adım = 0.05u = 0.15 mm sapabilir.
// Eşik bundan büyük seçilirse gerçek bir kopukluğu gizler; küçük seçilirse
// matematiği değil YAZIYI yargılar. Tam yarım adım alındı.
const QUANT = 0.05 * UNIT;   // 0.15 mm
console.log(`\n--- S5/S6 KOL  (uç özdeşliği toleransı ${QUANT.toFixed(2)} mm = kalemin yarım yazı adımı)`);
let sleeveSeen = 0, puffSeen = 0;
for (const [name, spec, svg] of rendered) {
  if (!spec.sleeveStyle || spec.sleeveStyle === 'none') continue;
  for (const p of panels(svg)) {
    const ds = pathsOf(p.body, 'sleeve');
    if (!ds.length) { FAIL(`[S5] ${name}/${p.view}: data-part="sleeve" path'i YOK`); continue; }
    sleeveSeen += 1;
    const pts = samplePath(ds[0], 40);
    const a = pts[0], z = pts[pts.length - 1];
    const dTip = Math.hypot(a[0] - shTipX, a[1] - shTipY) * UNIT;
    const dUnd = Math.hypot(z[0] - chX, z[1] - chY) * UNIT;
    if (dTip > QUANT) FAIL(`[S5] ${name}/${p.view}: kol omuz ucundan ${dTip.toFixed(2)} mm KOPUK (${a[0].toFixed(2)},${a[1].toFixed(2)} vs ${shTipX},${shTipY})`);
    if (dUnd > QUANT) FAIL(`[S5] ${name}/${p.view}: kol koltukaltından ${dUnd.toFixed(2)} mm KOPUK (${z[0].toFixed(2)},${z[1].toFixed(2)} vs ${chX},${chY})`);

    if (spec.sleeveCap === 2) {                       // PUFF
      puffSeen += 1;
      const b = bbox(pts);
      const wMax = b.x1;                               // en geniş yarı-genişlik
      const hemY = b.y1;
      const hemXs = pts.filter((q) => q[1] >= hemY - 2.0).map((q) => q[0]);
      const wHem = Math.max(...hemXs);
      const ratio = wHem / wMax;
      console.log(`    ${(name + '/' + p.view).padEnd(28)} puff: en geniş ${(wMax * UNIT).toFixed(1)} mm · et ${(wHem * UNIT).toFixed(1)} mm · oran ${ratio.toFixed(4)}`);
      const puffMax = LAW.croquis.sleeveLaw.puffHemOverWidestMax;
      if (!(ratio <= puffMax + 1e-9)) {
        FAIL(`[S6] ${name}/${p.view}: puff eti/en geniş ${ratio.toFixed(4)} > ${puffMax} (Buğra Alt Kol ölçümü) — bu bir boru, puff değil`);
      }
      if (!pathsOf(p.body, 'cuff-band').length) FAIL(`[S6] ${name}/${p.view}: puff kolda manşet bandı (data-part="cuff-band") YOK`);
      // büzgü tırtığı: mark sınıfında, etin 3 birim üstünde duran kısa çizgiler
      const markW = LAW.lineClasses.classes.mark.width;
      const ticks = [...p.body.matchAll(/<line[^>]*stroke-width="([^"]+)"[^>]*\/>/g)]
        .filter((m) => Number(m[1]) === Number(markW))
        .map((m) => { const y = /y1="(-?[\d.]+)"/.exec(m[0]); return y ? parseFloat(y[1]) : null; })
        .filter((y) => y != null && y > hemY - 3 * 4 && y < hemY + 4);
      if (ticks.length < 3) FAIL(`[S6] ${name}/${p.view}: manşette büzgü tırtığı ${ticks.length} < 3`);
    }
  }
}
if (sleeveSeen === 0) FAIL('[S5] matriste hiç kollu panel ölçülmedi — kapı boş koştu');
if (puffSeen === 0) FAIL('[S6] matriste hiç puff kol ölçülmedi — kapı boş koştu');
if (!fails) OK(`S5/S6 — ${sleeveSeen} kollu panel uçlarını gövdeyle paylaşıyor, ${puffSeen} puff eti toplanmış`);

// ---------------------------------------------------------------------------
// PARİTE RAPORU (KAPI DEĞİL) — Buğra ile bizim profil, yan yana
// ---------------------------------------------------------------------------
console.log('\n=== PARİTE RAPORU (KAPI DEĞİL) — Buğra Locket EU38 vs bizim locket flat');
{
  const svg = rendered[0][2];
  const p = panels(svg).find((q) => q.view === 'back');
  const pts = silhouette(p.body);
  const hCh = halfWidthAt(pts, CQ.chestY.u);
  const rows = [
    ['omuz', halfWidthAt(pts, CQ.shoulderTipY.u) / hCh, SSP._normalizedToChest.shoulder],
    ['göğüs', 1.0, 1.0],
    ['bel', halfWidthAt(pts, CQ.waistY.u) / hCh, SSP._normalizedToChest.waist],
    ['etek', hemHalf(pts) / hCh, SSP._normalizedToChest.hem],
  ];
  for (const [lbl, ours, theirs] of rows) {
    console.log(`    ${lbl.padEnd(8)} bizim ${ours.toFixed(4)}   Buğra ${theirs.toFixed(4)}   fark ${((ours - theirs) * 100).toFixed(2)} puan`);
  }
  console.log('    NOT: etek satırı BOY’a bağlıdır (Buğra’nın eteği belden 124.2 mm aşağıda,');
  console.log('         bizim crop 72 mm) — sayı eşitlenmez, YÖN eşitlenir. Kapı oranı değil');
  console.log('         "üst büstten geniş olamaz" eşitsizliğini tutuyor.');
  console.log(`    NOT: Buğra’nın KENDİ beden çizelgesi EU38 = büst 920 / bel 720 / kalça 980 mm;`);
  console.log('         burda EU38 = 880 / 700 / 940. Buğra’nın 38’i burda’nın 40’ı. Bu yüzden');
  console.log('         MUTLAK mm değil, sadece ORAN ölçüt olarak kullanıldı.');
}

console.log(`\n${fails === 0 ? 'PASS' : 'FAIL'} flat_geometry_sellable_check — ${fails} ihlal · tolerans ${TOL_MM} mm`);
process.exit(fails === 0 ? 0 : 1);
