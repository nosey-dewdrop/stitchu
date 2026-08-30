#!/usr/bin/env node
// flat_geometry_sellable_check.mjs — ETSY KAPISI / GEOMETRİ YARISI
//   (F-E 2026-08-23 · YÜZEY HATTINA BAĞLANDI H3 2026-08-30).
//
// Damla, 23 Ağu, o günkü flat'e bakarak beş kusur saydı:
//   1. Kollar gövdeden KOPUK — arada beyaz boşluk, kol oyuğu çizgisi yok
//   2. Puff kol alttan düz kesik ve sivriliyor — manşet/lastik bitişi yok
//   3. Bel yok — gövde düz iniyor, oturmalı üst değil
//   4. Etek ucu kavisi abartılı
//   5. Boyun çok geniş, omuz çok dar
//
// Bu kapı bu kusurların MEKANİK OLARAK ÖLÇÜLEBİLEN kısmını tutar. Zevk kısmı
// (çizginin karakteri, "ay evet" hissi) kapıya GİRMEZ → `DAMLA-KUYRUK.md`.
//
// ===========================================================================
// H3 — KAPI SİLİNMEDİ; ÖLÇÜLEN ÇİZİM DEĞİŞTİ, VE HÜKÜMLERİN YARISI UYUYOR
// ===========================================================================
// 30 Ağustos'a kadar ölçülen çizim croquis kalemininkiydi (`render-garment-flat`
// → `web/lib/flat-core.js`). O kalem KOL ve OMUZ da çiziyordu, o yüzden altı
// şartın altısının da bir konusu vardı. H3 kalemi sildi: kullanıcıya giden çizim
// artık kalıbın kesildiği yüzeyin projeksiyonu, ve o yüzey BUGÜN STRAPLESS bir
// giysi inşa ediyor — omuz dikişi yok, kol oyuğu yok, kol yok (repo kaydındaki
// açık G5 boşluğunun kendisi; CLAUDE.md "SIRADAKİ: G5").
//
// ★ BU YÜZDEN ŞARTLAR SİLİNMEDİ, UYUTULDU — VE UYKU BİR CIRCIRA BAĞLANDI.
//   Bir şartın konusu bugün yoksa onu yeşile boyamak da kırmızıya boyamak da
//   yalandır. Doğru olan şudur: şartın konusu olan EKSENİN motor tarafından
//   ADIYLA REDDEDİLDİĞİNİ her koşuda DOĞRULAMAK. Yani "kol yok" cümlesi kapının
//   kanaati değil, motorun kendi çıktısından okunan bir OLGU
//   (`flatJSON(...).desteklenmeyen_eksenler`). Motor bir gün kolu SEVK ETTİĞİNDE
//   o eksen redde düşmez, uyuyan şart UYANIR ve — henüz ölçüm kodu yazılmadığı
//   için — KAPI KIRMIZI DÜŞER. Şart böylece kaybolmuyor, sevkiyata KİLİTLENİYOR.
//   Uyuyan şart sayısı 5'te CIRCIRLI: artamaz, yalnız düşebilir.
//
//   S1 omuz ucu göğüs çizgisinin içinde   → uyuyor (omuz/kol oyuğu sevk edilmedi)
//   S2b etek merdiveni (boy arttıkça...)  → uyuyor (topLength ekseni reddediliyor)
//   S4 kol oyuğu içbükey                  → uyuyor
//   S5 kol iki ucu da gövdeyle paylaşır   → uyuyor
//   S6 puff eti toplanmış + manşet        → uyuyor
//
// ★ UYANIK ŞARTLAR — ÇİZİLEN SİLUETTEN ÖLÇÜLÜR, EŞİKSİZ EŞİTSİZLİK:
//   G1  BEL GERÇEKTEN DARALIYOR: çizilen bel yarı-genişliği, çizilen göğüs VE
//       kalça yarı-genişliğinden KESİN KÜÇÜK. (Damla'nın 3. kusuru: "bel yok —
//       gövde düz iniyor".)
//       ★ NEDEN BİR ORAN EŞİĞİ DEĞİL, BİR SIRALAMA. Kaynaklı çizelge ÇEVRE
//         verir (bel 70 / büst 88 cm); çizim ise bir ORTOGRAFİK İZDÜŞÜMÜN
//         YARI-GENİŞLİĞİNİ verir. Kesit bir elips olduğu için yarı-genişlik
//         oranı ile çevre oranı AYNI SAYI DEĞİLDİR (derinlik halkadan halkaya
//         değişir), ve croquis kaleminin "düz serilmiş tüp" varsayımı (yarı-gen
//         = çevre/4) yüzey hattında GEÇERSİZDİR. İki niceliği eşitmiş gibi
//         kıyaslamak uydurma bir eşik olurdu. Kıyaslanabilen tek şey YÖNDÜR ve
//         kapı tam onu tutar: çizelgenin sıralaması (bel < büst, bel < kalça)
//         çizimde de geçerli olmak zorunda. Yön çizelgeden OKUNUR, buraya
//         yazılmaz — çizelge bir gün başka bir sıra verirse kapı onu izler.
//   G2  ETEK TAVANI: `top` sınıfında çizilen etek yarı-genişliği, çizilen KALÇA
//       yarı-genişliğini AŞAMAZ — bir üst vücudun kalçasından geniş bitemez.
//       (4. kusur: "etek ucu kavisi abartılı".) Aynı gerekçeyle bu da çizim-içi
//       bir eşitsizliktir, uydurma bir orana değil kalçanın kendi çizgisine bağlı.
//   G3  ÜST SINIR SİLUETİN İÇİNDE: yaka/üst kenarın hiçbir noktası, kendi
//       yüksekliğindeki siluet yarı-genişliğinin DIŞINDA olamaz. Dışına taşan bir
//       yaka giysinin sahip olmadığı bir kenar çizer. (5. kusurun ölçülebilen
//       yarısı; croquis kalemi bunu hiç yargılamıyordu.)
//   G4  ÜST SINIR VAR VE BOŞ DEĞİL: sessizce kaybolan bir yaka H3'ün bitirmek
//       için yazıldığı körlüğün ta kendisi.
//
// ★ HİÇBİR EŞİK BİZİM ÇIKTIMIZDAN TÜRETİLMEDİ (ORTAK.md md.3). İki dış kaynak:
//   [B] SATIN ALINMIŞ Buğra Locket EU38 kalıbı — `contract/flat-convention-v1.json`
//       croquis.sideSeamProfile._normalizedToChest, ölçüm dökümü
//       GECE/log/F-E.bugra-olcum.txt. RAPOR satırı olarak basılır (kapı değil:
//       Buğra'nın 38'i burda'nın 40'ı, mutlak mm kıyaslanamaz).
//   [C] contract/tables.json draft.euSizeChart — KAYNAKLI beden çizelgesi.
//       G1 ve G2'nin eşitsizlikleri buradan gelir.
//
// ANTI-HACK: kapı hiçbir sabiti çiziciden import etmez. Çizicinin BASTIĞI SVG'yi
// parse eder, siluet yolunu 400 adımda örnekler ve ölçümü o örnekten çıkarır.
// Motorun yan kanaldan verdiği `olculer` bloğu OKUNMAZ.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const LAW = JSON.parse(readFileSync(join(root, 'contract/flat-convention-v1.json'), 'utf8'));
const TABLES = JSON.parse(readFileSync(join(root, 'contract/tables.json'), 'utf8'));
const SSP = LAW.croquis.sideSeamProfile;

const BUNDLE = join(root, 'engine/dist/stitchu-engine.js');
const FLAT_MOD = join(root, 'web/lib/flat-from-plan.js');
const SIZE = process.env.V3C_SIZE || 'EU38';

// UYUYAN ŞART CIRCIRI — bir tolerans değil, bir SAYIM tavanı. Yalnız düşebilir.
const DORMANT_RATCHET = 5;

let fails = 0;
const FAIL = (m) => { console.log(`FAIL  ${m}`); fails += 1; };
const OK = (m) => console.log(`ok    ${m}`);

if (!existsSync(BUNDLE)) FAIL(`sevk edilen wasm paketi YOK: ${BUNDLE}`);
if (!existsSync(FLAT_MOD)) FAIL(`cizici YOK: ${FLAT_MOD}`);
if (fails) { console.log(`\nFAIL flat_geometry_sellable_check — ${fails} ihlal`); process.exit(1); }

const engine = await (await import(BUNDLE)).default();
const { renderFlatFromPlan } = await import(FLAT_MOD);

// ---------------------------------------------------------------------------
// SVG path (M/L/C/Z, mutlak) -> yoğun nokta dizisi.
// ---------------------------------------------------------------------------
function samplePath(d, per = 40) {
  const tok = d.trim().split(/[\s,]+/);
  const pts = []; let i = 0, cur = [0, 0], start = [0, 0];
  const num = () => { const v = Number(tok[i++]); if (!Number.isFinite(v)) throw new Error(`yol: sayi degil '${tok[i - 1]}'`); return v; };
  const cub = (p0, c1, c2, p1) => {
    for (let k = 1; k <= per; k++) {
      const t = k / per, u = 1 - t;
      pts.push([u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0],
                u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1]]);
    }
  };
  while (i < tok.length) {
    const c = tok[i++];
    if (c === 'M') { cur = [num(), num()]; start = cur.slice(); pts.push(cur.slice()); }
    else if (c === 'L') { const p = [num(), num()]; pts.push(p.slice()); cur = p; }
    else if (c === 'C') { const c1 = [num(), num()], c2 = [num(), num()], p = [num(), num()]; cub(cur, c1, c2, p); cur = p; }
    else if (c === 'Z') { pts.push(start.slice()); cur = start.slice(); }
    else throw new Error(`yol: taninmayan komut '${c}'`);
  }
  return pts;
}
// Bir YÜKSEKLİKTEKİ yarı-genişlik: siluet bir POLİGON sayılıp y doğrusuyla
// KESİŞİMLERİ interpole edilir; (en sağ − en sol) / 2 döner. Bant yok, tam sayı.
//
// ⚠ MUTLAK |x| ALINMAZ. Paneller sayfada YAN YANA yerleştirilmiştir (ön solda,
// arka sağda), yani bir panelin x koordinatları 0 etrafında simetrik DEĞİL. |x|
// almak arka panelin yarı-genişliğini sayfa ofseti kadar şişirirdi — ve şişmiş
// bir sayı bu kapıyı hem yanlış kırmızıya hem yanlış yeşile düşürebilir.
function halfWidthAt(pts, yIn) {
  const ys = pts.map((p) => p[1]);
  const ymin = Math.min(...ys), ymax = Math.max(...ys);
  // ⚠ SAYISAL KENETLEME — BİR ÖLÇÜM TOLERANSI DEĞİL, YAZI ÇÖZÜNÜRLÜĞÜ.
  // Çizici her koordinatı DÖRT ondalıkla basıyor (flat-from-plan.js toFixed(4)),
  // yani bir mikronun onda biri kadar yuvarlama kaçınılmaz. Bir halka giysinin
  // TAM ucunda durabilir — düz kılıfta kalça çizgisi eteğin ta kendisidir
  // (altZ_mm = hip.z_mm) — ve o hâlde sorgulanan y, yazılmış poligonun dışına
  // 1e-4 mm düşebilir. Kenetleme yalnız bu büyüklükte ve yalnız uçlarda çalışır;
  // gerçek bir "kesişim yok" hâlini (halka giysinin dışında) GİZLEMEZ.
  let y = yIn;
  if (y > ymax && y - ymax < 1e-3) y = ymax;
  if (y < ymin && ymin - y < 1e-3) y = ymin;
  const xs = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1];
    if (Math.abs(b[1] - a[1]) < 1e-12) {
      // YATAY SEGMENT ATLANMAZ. Etek ucu tam da budur: siluetin kapanış L'i
      // yataydır ve düz kılıfta ölçülmek istenen çizgi ORASIDIR. Atlamak,
      // ölçülecek tek kesiti kör etmek olurdu.
      if (Math.abs(a[1] - y) < 1e-9) { xs.push(a[0], b[0]); }
      continue;
    }
    if ((a[1] - y) * (b[1] - y) > 0) continue;
    const t = (y - a[1]) / (b[1] - a[1]);
    xs.push(a[0] + t * (b[0] - a[0]));
  }
  if (xs.length < 2) return null;
  return (Math.max(...xs) - Math.min(...xs)) / 2;
}
// ETEK yarı-genişliği = siluetin ALT %8'indeki en geniş kesit (etek KÖŞESİ).
// En alt nokta değil: en alt nokta orta-öndeki sarkma çukurudur.
function hemHalf(pts) {
  const ys = pts.map((p) => p[1]);
  const y0 = Math.min(...ys), y1 = Math.max(...ys), lo = y0 + (y1 - y0) * 0.92;
  const band = pts.filter((p) => p[1] >= lo).map((p) => p[0]);
  if (band.length < 2) return 0;
  return (Math.max(...band) - Math.min(...band)) / 2;
}
const pathD = (svg, view, curve) => {
  const m = new RegExp(`<path data-view="${view}" data-curve="${curve}"[^>]*\\sd="([^"]*)"`).exec(svg);
  return m ? m[1] : null;
};

// ---------------------------------------------------------------------------
// MATRİS — kartın saydığı dört sınıf. Sınıflar arası GEOMETRİ farkı olmaması bir
// kusur değil, ilan edilmiş bir REDDİR (`desteklenmeyen_eksenler`); kapı yine de
// dördünü de ayrı ayrı ölçer, çünkü bir gün ayrışacaklar.
// ---------------------------------------------------------------------------
const MATRIX = [
  ['elbise',     { garment: 'dress', shaping: 'dart', fabric: 'woven', skirtStyle: 'aLine', neckline: 'scoop' }],
  ['etek',       { garment: 'skirt', shaping: 'dart', fabric: 'woven', skirtStyle: 'aLine', neckline: 'crew', sleeveStyle: 'none' }],
  ['top',        { garment: 'top',   shaping: 'dart', fabric: 'woven', skirtStyle: 'aLine', neckline: 'scoop' }],
  ['orme',       { garment: 'top',   shaping: 'dart', fabric: 'knit',  skirtStyle: 'aLine', neckline: 'scoop' }],
  // G2b'nin iki dalini da olcmek icin: `straight` sevk edilen ikinci klos
  // kelimesidir (hemSweepMM = 0). Tek dal kosan bir sart yarim sarttir.
  ['elbise_duz', { garment: 'dress', shaping: 'dart', fabric: 'woven', skirtStyle: 'straight', neckline: 'scoop' }],
];

const chartF = TABLES.draft.euSizeChart._fields;
const chart = TABLES.draft.euSizeChart[SIZE];
const chartCM = (f) => chart[chartF.indexOf(f)];
// SIRALAMA ÇİZELGEDEN OKUNUR, BURAYA YAZILMAZ.
const CHART_BEL_DAR_BUST = chartCM('waistCM') < chartCM('bustCM');
const CHART_BEL_DAR_KALCA = chartCM('waistCM') < chartCM('hipCM');

console.log(`=== ETSY KAPISI / GEOMETRI — YUZEY HATTI (H3), ${MATRIX.length} sinif, beden ${SIZE}`);
console.log('    olculen hat : engine.flatJSON(spec, body) -> web/lib/flat-from-plan.js');
console.log(`    kaynakli siralama (contract/tables.json draft.euSizeChart.${SIZE}): ` +
            `bel ${chartCM('waistCM')} ${CHART_BEL_DAR_BUST ? '<' : '>='} bust ${chartCM('bustCM')} · ` +
            `bel ${CHART_BEL_DAR_KALCA ? '<' : '>='} kalca ${chartCM('hipCM')} cm`);

const cizimler = [];
for (const [ad, spec] of MATRIX) {
  let F;
  try { F = JSON.parse(engine.flatJSON(spec, { size: SIZE })); }
  catch (e) { FAIL(`[0] ${ad}: flatJSON coktu: ${e.message}`); continue; }
  if (F.error) { FAIL(`[0] ${ad}: flatJSON reddetti: ${F.error}`); continue; }
  let P;
  try { P = JSON.parse(engine.planJSON(spec, { size: SIZE })); }
  catch (e) { FAIL(`[0] ${ad}: planJSON coktu: ${e.message}`); continue; }
  let svg;
  try { svg = renderFlatFromPlan(F); } catch (e) { FAIL(`[0] ${ad}: cizim uretilemedi: ${e.message}`); continue; }
  cizimler.push({ ad, spec, F, P, svg });
}
if (cizimler.length !== MATRIX.length) FAIL(`[0] ${MATRIX.length} sinifin ${cizimler.length}'i cizilebildi`);

// ---------------------------------------------------------------------------
// G1 + G2 — YAN DİKİŞ PROFİLİ, ÇİZİLEN SİLUETTEN
// ---------------------------------------------------------------------------
console.log('\n--- G1/G2 YAN DIKIS PROFILI (cizilen siluetten olculdu)');
console.log(`    ${'sinif/gorunum'.padEnd(20)} ${'gogus mm'.padStart(10)} ${'bel mm'.padStart(10)} ${'kalca mm'.padStart(10)} ${'etek mm'.padStart(10)}`);
for (const c of cizimler) {
  const halkalar = Array.isArray(c.P.halkalar) ? c.P.halkalar : [];
  const zOf = (ad) => (halkalar.find((h) => h.ad === ad) || {}).z_mm;
  if (![zOf('bust'), zOf('waist'), zOf('hip')].every(Number.isFinite)) {
    FAIL(`[G1] ${c.ad}: kalip bel/gogus/kalca cizgilerini yayinlamiyor`); continue;
  }
  for (const view of LAW.views.required) {
    const d = pathD(c.svg, view, 'siluet');
    if (!d) { FAIL(`[G1] ${c.ad}/${view}: siluet yolu YOK`); continue; }
    let pts;
    try { pts = samplePath(d, 40); } catch (e) { FAIL(`[G1] ${c.ad}/${view}: yol ayristirilamadi: ${e.message}`); continue; }
    // SVG y asagi sayar; siluetin EN UST noktasi kabugun ustZ_mm'sidir. Yerlesim
    // sabitleri KOPYALANMAZ: cizimin kendi en ust y'si capa.
    const yTop = Math.min(...pts.map((p) => p[1]));
    const w = (ad) => halfWidthAt(pts, yTop + (c.F.ustZ_mm - zOf(ad)));
    const hBust = w('bust'), hWaist = w('waist'), hHip = w('hip'), hHem = hemHalf(pts);
    if (hBust == null || hWaist == null || hHip == null || !hHem) { FAIL(`[G1] ${c.ad}/${view}: isaret yuksekliginde kesisim yok`); continue; }
    console.log(`    ${(c.ad + '/' + view).padEnd(20)} ${(2 * hBust).toFixed(4).padStart(10)} ${(2 * hWaist).toFixed(4).padStart(10)} ` +
                `${(2 * hHip).toFixed(4).padStart(10)} ${(2 * hHem).toFixed(4).padStart(10)}`);

    // G1 — SIRALAMA. Yon cizelgeden okunur; buyukluk cizimden. Esik yok.
    if (CHART_BEL_DAR_BUST && !(hWaist < hBust - 1e-9)) {
      FAIL(`[G1] ${c.ad}/${view}: cizilen bel ${(2 * hWaist).toFixed(4)}mm >= gogus ${(2 * hBust).toFixed(4)}mm, ` +
           `oysa cizelge beli bustten DAR ilan ediyor (${chartCM('waistCM')} < ${chartCM('bustCM')} cm) — BEL YOK`);
    }
    if (CHART_BEL_DAR_KALCA && !(hWaist < hHip - 1e-9)) {
      FAIL(`[G1] ${c.ad}/${view}: cizilen bel ${(2 * hWaist).toFixed(4)}mm >= kalca ${(2 * hHip).toFixed(4)}mm, ` +
           `oysa cizelge beli kalcadan DAR ilan ediyor (${chartCM('waistCM')} < ${chartCM('hipCM')} cm) — BEL YOK`);
    }
    // G2a — SİLUET BELDEN AŞAĞI DARALMAZ. Bir giysi belin altında sıkışamaz:
    // vücut orada genişliyor. Sıralama, eşik değil.
    if (!(hWaist <= hHip + 1e-6 && hHip <= hHem + 1e-6)) {
      FAIL(`[G2a] ${c.ad}/${view}: siluet belden asagi DARALIYOR — bel ${(2 * hWaist).toFixed(4)} ` +
           `kalca ${(2 * hHip).toFixed(4)} etek ${(2 * hHem).toFixed(4)} mm (monoton olmali)`);
    }
    // G2b — ETEK KLOŞU BEYAN EDİLEN KLOŞTUR. Damla'nın 4. kusuru ("etek ucu
    // kavisi abartılı") yüzey hattında bir kavis değil bir SAYIDIR: spec'in
    // skirtStyle kelimesi. `straight` düz kılıf demektir (hemSweepMM = 0,
    // engine/src/seamplan.cpp), yani etek KALÇAYLA AYNI genişlikte biter;
    // `aLine` sevk edilen açılmadır, yani etek kalçadan GENİŞ biter. Kapı
    // beyanı çizimde arar: kelimeyi söyleyip başka bir etek çizmek yasak.
    // Eşik yok — biri eşitlik (0.1mm, --all'ın kendi toleransı), diğeri
    // eşitsizlik. Kaynak: spec'in kendi kelimesi, uydurma bir oran değil.
    const st = String(c.spec.skirtStyle || '');
    if (st === 'straight' && Math.abs(hHem - hHip) > 0.05) {
      FAIL(`[G2b] ${c.ad}/${view}: skirtStyle="straight" (duz kilif, hemSweep 0) beyan edildi ama ` +
           `etek ${(2 * hHem).toFixed(4)}mm ile kalca ${(2 * hHip).toFixed(4)}mm arasinda ` +
           `${(2 * (hHem - hHip)).toFixed(4)}mm fark cizildi`);
    }
    if (st === 'aLine' && !(hHem > hHip + 0.05)) {
      FAIL(`[G2b] ${c.ad}/${view}: skirtStyle="aLine" beyan edildi ama etek ${(2 * hHem).toFixed(4)}mm ` +
           `kalcadan ${(2 * hHip).toFixed(4)}mm genis DEGIL — beyan edilen klos cizilmemis`);
    }
  }
}

// ---------------------------------------------------------------------------
// G3 + G4 — ÜST SINIR (YAKA/OMUZ HATTI) SİLUETİN İÇİNDE
// ---------------------------------------------------------------------------
// Croquis kaleminin HİÇ yargılanmayan yanı buydu: üst sınır siluete İÇSELDİR,
// yani siluet ölçümüne görünmez. Ölçüldü (H3, shellprojection.hpp): ön yakayı
// 20mm derinleştirmek kalıbın ön gövde panelinin çevresini 6.15mm oynatıyor,
// siluetini 0.0000mm. Flat yalan söylemiyordu, KÖRDÜ. Bu şart o körlüğü kapatır.
console.log('\n--- G3/G4 UST SINIR SILUETIN ICINDE');
for (const c of cizimler) {
  for (const view of LAW.views.required) {
    const dSil = pathD(c.svg, view, 'siluet');
    const dUst = pathD(c.svg, view, 'ust-sinir');
    if (!dUst || dUst.trim().length < 20) { FAIL(`[G4] ${c.ad}/${view}: ust sinir YOK/BOS — sessizce kaybolan yaka`); continue; }
    let sil, ust;
    try { sil = samplePath(dSil, 40); ust = samplePath(dUst, 40); }
    catch (e) { FAIL(`[G3] ${c.ad}/${view}: yol ayristirilamadi: ${e.message}`); continue; }
    // Panel merkezi bir kez hesaplanir: siluet nokta nokta degismez ve dongu
    // icinde yeniden taramak olcumu degistirmeden kapiyi dakikalarca yavaslatir.
    const silXs = sil.map((q) => q[0]);
    const cx = (Math.min(...silXs) + Math.max(...silXs)) / 2;
    let enKotu = 0, nerede = null;
    for (const p of ust) {
      const h = halfWidthAt(sil, p[1]);
      if (h == null) continue;                    // siluetin disinda bir yukseklik: asagida ayrica yakalanir
      const tasma = Math.abs(p[0] - cx) - h;
      if (tasma > enKotu) { enKotu = tasma; nerede = p; }
    }
    if (enKotu > 0.05) {
      FAIL(`[G3] ${c.ad}/${view}: ust sinir siluetin ${enKotu.toFixed(3)} mm DISINA tasiyor ` +
           `(nokta ${nerede[0].toFixed(2)},${nerede[1].toFixed(2)}) — giysinin sahip olmadigi bir kenar`);
    } else {
      OK(`G3/G4 — ${c.ad}/${view}: ust sinir ${ust.length} noktada siluetin icinde (en kotu tasma ${enKotu.toFixed(4)} mm)`);
    }
  }
}

// ---------------------------------------------------------------------------
// UYUYAN ŞARTLAR — HER BİRİ BİR REDDEDİLMİŞ EKSENE KİLİTLİ
// ---------------------------------------------------------------------------
// Her satır: [şart, o şartın konusu olan eksen, o ekseni isteyen spec yaması].
// Kapı, yamalı spec'te motorun o ekseni ADIYLA reddettiğini doğrular. Reddetmezse
// eksen SEVK EDİLMİŞ demektir; uyuyan şart uyanır ve ölçüm kodu yazılana kadar
// KIRMIZI düşer. Bu bir gevşetme değil, sevkiyata kilitli bir borçtur.
console.log('\n--- UYUYAN SARTLAR (konusu sevk edilmemis; her biri bir REDDE kilitli)');
const UYUYAN = [
  ['S1  omuz ucu gogus cizgisinin icinde', 'shoulderStyle', { shoulderStyle: 1 }],
  ['S2b etek merdiveni (boy arttikca...)', 'topLength',     { garment: 'top', topLength: 'crop' }],
  ['S4  kol oyugu icbukey',                'sleeveStyle',   { sleeveStyle: 'straight' }],
  ['S5  kol iki ucunu da govdeyle paylasir', 'sleeveStyle', { sleeveStyle: 'straight' }],
  ['S6  puff eti toplanmis + manset',      'sleeveStyle',   { sleeveStyle: 'balloon' }],
];
const TABAN = { garment: 'top', shaping: 'dart', fabric: 'woven', skirtStyle: 'aLine', neckline: 'scoop' };
let uyuyan = 0;
for (const [sart, eksen, yama] of UYUYAN) {
  let F;
  try { F = JSON.parse(engine.flatJSON({ ...TABAN, ...yama }, { size: SIZE })); }
  catch (e) { F = { error: e.message }; }
  const red = F.error
    ? (String(F.error).includes(eksen) ? [`${eksen}=parse reddi`] : [])
    : (F.desteklenmeyen_eksenler || []).filter((r) => r.startsWith(`${eksen}=`));
  if (red.length) {
    uyuyan += 1;
    console.log(`    UYUYOR  ${sart.padEnd(40)} <- ${red.join(' · ')}`);
  } else {
    FAIL(`[UYANDI] ${sart}: '${eksen}' ekseni ARTIK REDDEDILMIYOR — sevk edildi, ama bu sart icin ` +
         'olcum kodu HALA YAZILMADI. Sartin borcu simdi odenecek (F-E, S1/S2b/S4/S5/S6).');
  }
}
console.log(`    uyuyan sart: ${uyuyan}  (circir tavani ${DORMANT_RATCHET})`);
if (uyuyan > DORMANT_RATCHET) {
  FAIL(`[circir] uyuyan sart ${uyuyan} > tavan ${DORMANT_RATCHET} — uyuyan sart sayisi ARTAMAZ`);
} else if (uyuyan < DORMANT_RATCHET) {
  OK(`circir — uyuyan ${uyuyan} < tavan ${DORMANT_RATCHET}: tavan DUSTU. Sabitlemek ayri ve bilincli bir commit'tir (DORMANT_RATCHET).`);
} else {
  OK(`circir — uyuyan ${uyuyan} = tavan ${DORMANT_RATCHET} (G5 sevk edilmedi: omuz/yaka/oyuk yok). Sayi yalniz dusebilir.`);
}

// ---------------------------------------------------------------------------
// PARİTE RAPORU (KAPI DEĞİL) — Buğra ile bizim profil, yan yana
// ---------------------------------------------------------------------------
console.log('\n=== PARITE RAPORU (KAPI DEGIL) — Bugra Locket EU38 vs yuzey hatti');
if (cizimler.length) {
  const c = cizimler[0];
  const halkalar = c.P.halkalar || [];
  const pts = samplePath(pathD(c.svg, LAW.views.required[1], 'siluet'), 40);
  const yTop = Math.min(...pts.map((p) => p[1]));
  const yOf = (z) => yTop + (c.F.ustZ_mm - z);
  const hCh = halfWidthAt(pts, yOf((halkalar.find((h) => h.ad === 'bust') || {}).z_mm));
  const rows = [
    ['gogus', 1.0, 1.0],
    ['bel', halfWidthAt(pts, yOf((halkalar.find((h) => h.ad === 'waist') || {}).z_mm)) / hCh, SSP._normalizedToChest.waist],
    ['etek', hemHalf(pts) / hCh, SSP._normalizedToChest.hem],
  ];
  for (const [lbl, ours, theirs] of rows) {
    console.log(`    ${lbl.padEnd(8)} bizim ${ours.toFixed(4)}   Bugra ${theirs.toFixed(4)}   fark ${((ours - theirs) * 100).toFixed(2)} puan`);
  }
  console.log('    OMUZ satiri YOK: yuzey hatti strapless sevk ediyor, omuz ucu diye bir nokta cizilmiyor.');
  console.log(`    NOT: Bugra'nin KENDI beden cizelgesi EU38 = bust 920 / bel 720 / kalca 980 mm;`);
  console.log(`         burda ${SIZE} = ${chart[chartF.indexOf('bustCM')] * 10} / ${chart[chartF.indexOf('waistCM')] * 10} / ${chart[chartF.indexOf('hipCM')] * 10}.`);
  console.log('         Bugra\'nin 38\'i burda\'nin 40\'i. Bu yuzden MUTLAK mm degil, sadece ORAN olcut.');
}

console.log(`\n${fails === 0 ? 'PASS' : 'FAIL'} flat_geometry_sellable_check — ${fails} ihlal`);
process.exit(fails === 0 ? 0 : 1);
