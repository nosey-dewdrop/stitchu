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
//   kaç tanesinin ölçülemediği sayılır.
//
// ★ ÖLÇÜLEMEYEN 3, RATCHET (V3-D, 2026-08-24) — TANIM KARARI, GEVŞETME DEĞİL.
//   Ölçülemeyen 3, G5 (omuz/yaka/oyuk) sevk edilmediği için; sayı yalnız
//   düşebilir. `bust_circumference` · `neck_opening_width` · `shoulder_width`
//   kalıp tarafında YOK, çünkü `surface-pattern`'ün bugün sevk ettiği giysi
//   STRAPLESS: dikiş grafiğinde omuz dikişi de kol oyuğu da yok, gövde
//   panellerinin serbest üst sınırı yakasız tek bir halka, ve büst halkası
//   açılmış kalıpta kenarı/köşesi/dikişi olmayan bir İÇ eğri. Bu, repo
//   kaydındaki açık G5 boşluğunun kendisidir (CLAUDE.md "SIRADAKİ: G5").
//   Kapı bu üçünü ATLAMAZ: her koşuda adıyla basar, sayar ve sayıyı 3'te
//   RATCHET'ler — 3'ün ÜSTÜNE çıkarsa KIRMIZI düşer, düşmesi serbesttir ve
//   yeşil bırakır. Tolerans (%1.5) bu karardan ETKİLENMEZ, sabittir.
//
// ★ KAPIYA GİRMEYEN ÖLÇÜ (V3-D): flat tarafı altı ölçüden FAZLASINI basabilir
//   (bugün `body_height_projected`). Fazlalar adıyla raporlanır ama KIYASLANMAZ,
//   çünkü kalıp tarafında karşılığı olan bir nicelik yoktur. Şart: altı gated ad
//   AYNI SIRADA ve listenin BAŞINDA gelir.
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
// ÖLÇÜLEMEYEN 3, G5 (omuz/yaka/oyuk) sevk edilmediği için; sayı yalnız düşebilir.
// Gerekçe dosyanın başlığında. Bu bir TOLERANS DEĞİL, bir SAYIM tavanıdır.
const UNMEASURED_RATCHET = 3;

let fails = 0;
const FAIL = (m) => { console.log(`FAIL  ${m}`); fails += 1; };
const OK = (m) => console.log(`ok    ${m}`);

console.log('=== ARASTIRMA HATTI (sevk disi) — KANAT (a) — FLAT ↔ KALIP UYUMU · beden ' + SIZE);
console.log('    olculen hat 3B yuzey hattidir (shell-flat / surface-pattern), sevk edilen cizim DEGIL;');
console.log('    sevk edilen hattin kapisi: engine/tests/cizim_giysi_mi.mjs');
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
  if (names.slice(0, SIX.length).join('|') !== SIX.join('|')) {
    FAIL(`[a] shell-flat altı ölçüyü beklenen sırada vermiyor: [${names.join(', ')}]`);
  }
  const extra = names.slice(SIX.length);
  if (extra.length) {
    console.log(`\n    KAPIYA GİRMEYEN (raporlanır, kıyaslanmaz — kalıp tarafında karşılığı olan nicelik yok):`);
    for (const n of extra) {
      const m = flat.measures.find((x) => x.name === n);
      console.log(`    ${n.padEnd(22)} ${Number(m.mm).toFixed(4).padStart(12)}  (ring ${m.ring})`);
    }
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
  console.log(`\n    UNMEASURED sayısı: ${unmeasured.length}/${SIX.length}  (RATCHET tavanı ${UNMEASURED_RATCHET})`);
  for (const u of unmeasured) console.log(`    UNMEASURED  ${u}`);
  if (unmeasured.length > UNMEASURED_RATCHET) {
    FAIL(`[a] UNMEASURED ${unmeasured.length} > ${UNMEASURED_RATCHET} — ölçülemeyen sayısı ARTTI, RATCHET kırıldı`);
  } else if (unmeasured.length < UNMEASURED_RATCHET) {
    OK(`a — UNMEASURED ${unmeasured.length} < ${UNMEASURED_RATCHET}: tavan DÜŞTÜ. Sabitlemek ayrı ve bilinçli bir commit'tir (bu dosyadaki UNMEASURED_RATCHET).`);
  } else {
    OK(`a — UNMEASURED ${unmeasured.length} = tavan ${UNMEASURED_RATCHET} (G5 sevk edilmedi: omuz/yaka/oyuk yok). Sayı yalnız düşebilir.`);
  }
  if (!fails) OK(`a — kıyaslanan ölçülerin hepsi %${TOL_PCT} içinde`);
}


// ===========================================================================
// ⭐ --all (H3, 2026-08-30) — "ELBİSEMİN FLAT'İ KALIBIMDAN ÇIKIYOR"
// ===========================================================================
//
// YUKARIDAKİ BÖLÜM ne ölçüyordu: iki NATİV ikili (shell-flat, surface-pattern)
// altı ölçüde %1.5 içinde mi. O soru duruyor ve gevşetilmedi. Bu bölüm BAŞKA
// bir soru soruyor ve daha sıkı sorar:
//
//   Kullanıcının EKRANDA GÖRDÜĞÜ çizim, eline aldığı kalıbın ta kendisi mi —
//   ve bu DÖRT SINIFIN DÖRDÜNDE de doğru mu?
//
// NEDEN AYRI VE NEDEN SIFIR NOKTA BİR MİLİMETRE. H3'e kadar "flat kalıptan
// projeksiyondur" cümlesi TEK bir spec üçlüsü için doğruydu: web/lib/
// flat-from-plan.js'teki `planLineClass` yalnız top/dart/woven'a izin
// veriyordu, elbise · etek · örme croquis KALEMİNDEN (web/lib/flat-core.js)
// çıkıyordu. Yani üç sınıfta çizim ile kalıp İKİ AYRI NESNEYDİ; EU38'de kalem
// beli 700.0mm, kalıp 724.89mm diyordu. H3 kalemi sildi. Bu bölüm o silmenin
// KANITIDIR, iddiası değil. Tolerans %1.5 değil 0.1mm, çünkü artık iki nesne
// karşılaştırılmıyor: TEK nesnenin iki okuması karşılaştırılıyor ve tek
// nesnenin kendisiyle yüzde birkaç oynaması diye bir şey yoktur. 0.1mm bile
// cömerttir — üretim toleransımız 1/32" = 0.79375mm'nin 1/8'i.
//
// ★ ÖLÇÜLEN ŞEY SVG'NİN İÇİNDEKİ ÇİZGİDİR, MOTORUN YAN KANALDAN VERDİĞİ BİR
//   SAYI DEĞİL. Kapı `flatJSON`'un `olculer` bloğunu OKUMAZ. Kullanıcıya giden
//   dosyayı — web/lib/flat-from-plan.js'in yazdığı SVG'yi — üretir, `d`
//   niteliğindeki siluet yolunu ayrıştırır, kübik segmentleri kalıbın kendi
//   halka yüksekliğinde bisection'la çözer ve o yükseklikteki çizgi genişliğini
//   ölçer. Bir çizim hatası (yanlış ölçek, kaçmış ofset, ters çevrilmiş y,
//   bozuk yol birleştirme) bu ölçüme yansır; `olculer`'e yansımazdı.
//
// ★ KALIP TARAFI: `planJSON`'un `halkalar` bloğu (engine/src/seamplan.cpp).
//   Göğüs/bel/kalça, KALIBIN kesildiği GarmentSurf'ün kendi halkaları. Bu blok
//   H3'te açıldı, çünkü açılmış kalıp panelinde bir GÖĞÜS çizgisi ne köşe ne
//   kenar ne dikiştir (tools/pattern-measure.mjs onun için `null` basar), yani
//   "flat kalıpla göğüste uyuşuyor" cümlesi ölçülemeyen bir cümleydi.
//
// ★ SINIFLAR ARASI GEOMETRİ FARKI YOK VE BU BİR KUSUR DEĞİL, İLAN EDİLEN BİR
//   REDDİR. Yüzey hattı bugün TEK bir giysi sınıfı inşa ediyor; elbise, etek ve
//   örme spec'i geldiğinde giysiyi FARKLI çizmez, taşıyamadığı ekseni ADIYLA
//   reddeder (`desteklenmeyen_eksenler`) ve create.js onu ekrana basar. Kapı bu
//   yüzden her sınıfın reddedilen eksen listesini de BASAR ve iki okumanın
//   listelerinin AYNI olmasını şart koşar: kalıp bir şeyi reddedip çizim onu
//   çizmiş gibi yapamaz.
if (process.argv.includes('--all')) {
  const { readdirSync, statSync } = await import('node:fs');
  const path = await import('node:path');

  console.log('\n\n=== --all (H3) — DÖRT SINIF · ÇİZİLMİŞ SİLUET ↔ KALIBIN KENDİ HALKALARI');
  console.log(`    eşik 0.1000mm  ·  beden ${SIZE}  ·  ölçülen çizgiler: göğüs · bel · kalça`);

  const TOL_MM = 0.1;
  const BUNDLE = join(root, 'engine/dist/stitchu-engine.js');
  const FLAT_MOD = join(root, 'web/lib/flat-from-plan.js');

  // DÖRT SINIF. Kart bunları adıyla sayıyor: elbise · etek · top · örme.
  // `shaping`/`fabric` varsayılanları spec sözlüğünün kendi kelimeleri.
  const SINIFLAR = [
    ['elbise', { garment: 'dress', shaping: 'dart', fabric: 'woven', skirtStyle: 'aLine', neckline: 'scoop' }],
    // Etek'in bedeni yok: spec sözlüğü sleeveStyle/neckline'ı 'none'/'crew'
    // dışında bir değerle KABUL ETMİYOR ve bu bir gevşetme değil, sözlüğün kendi
    // hükmü — bir eteğe yaka sormak anlamsız bir spec'tir.
    ['etek',   { garment: 'skirt', shaping: 'dart', fabric: 'woven', skirtStyle: 'aLine', neckline: 'crew', sleeveStyle: 'none' }],
    ['top',    { garment: 'top',   shaping: 'dart', fabric: 'woven', skirtStyle: 'aLine', neckline: 'scoop' }],
    ['örme',   { garment: 'top',   shaping: 'dart', fabric: 'knit',  skirtStyle: 'aLine', neckline: 'scoop' }],
  ];
  const BODY = { size: SIZE };

  // ---- 0. KALEM GERÇEKTEN ÖLDÜ MÜ (yalnız kod okuyarak değil, DİSKE bakarak)
  //
  // Bu blok kapının kendi kendini kandırmasını engeller: 0.1mm'yi geçmek,
  // ikinci bir çizim motoru repoda dururken hiçbir şey ifade etmez — bir
  // sonraki commit sınıfı yine ona bağlayabilir (yasak 3, iki motor bir giysi).
  const OLU = ['web/lib/flat-core.js', 'web/lib/flat-tables.gen.js',
               'engine/tools/render-garment-flat.mjs', 'engine/tools/gen-flat-tables.mjs'];
  for (const f of OLU) {
    if (existsSync(join(root, f))) FAIL(`[all] croquis kalemi hâlâ diskte: ${f} — iki motor bir giysi (yasak 3)`);
  }
  // ve hiçbir canlı kaynak dosyası onu ADIYLA anmıyor.
  const CANLI_KOK = ['web', 'engine/src', 'engine/tools', 'engine/tests', 'engine/wasm',
                     'engine/compiler', 'scripts'];
  const YASAK_AD = ['planLineClass', 'flatGaps', 'flatSVGAsync', 'renderGarmentFlat',
                    'flat-core.js', 'flat-tables.gen.js'];
  const KOD_UZANTI = new Set(['.js', '.mjs', '.cjs', '.html', '.cpp', '.hpp', '.sh']);
  const izler = [];
  const yuru = (dir) => {
    let girisler = [];
    try { girisler = readdirSync(dir); } catch { return; }
    for (const ad of girisler) {
      if (ad === 'node_modules' || ad === 'dist' || ad === 'vendor' || ad.startsWith('.')) continue;
      const tam = path.join(dir, ad);
      const st = statSync(tam);
      if (st.isDirectory()) { yuru(tam); continue; }
      if (!KOD_UZANTI.has(path.extname(ad))) continue;
      // Bu kapının KENDİ yasak-kelime listesi bir referans değildir.
      if (tam === fileURLToPath(import.meta.url)) continue;
      // YORUM DEĞİL, KOD ARANIR. Silinen bir motorun ADINI bir yorumda anmak —
      // "bu kalem H3'te silindi, çünkü…" — bir referans DEĞİLDİR; sildiğin şeyin
      // adını yazamamak repo kaydını yoksullaştırır. Aranan şey ÇALIŞAN bir
      // bağdır, o yüzden blok ve satır yorumları önce atılır.
      const src = readFileSync(tam, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
        .replace(/<!--[\s\S]*?-->/g, ' ');
      for (const ad2 of YASAK_AD) if (src.includes(ad2)) izler.push(`${path.relative(root, tam)}: ${ad2}`);
    }
  };
  for (const d of CANLI_KOK) yuru(join(root, d));
  if (izler.length) {
    FAIL(`[all] kalemin ${izler.length} canlı referansı kaldı — ölü referans = yarı silinmiş motor`);
    for (const i of izler.slice(0, 12)) console.log(`      ${i}`);
  } else {
    OK('all — croquis kalemi diskte YOK ve canlı kaynakta tek referansı YOK');
  }

  // ---- 1. SEVK EDİLEN MOTOR + SEVK EDİLEN ÇİZİCİ ----------------------------
  // Fikstür değil: web/js/engine.js'in yüklediği BAYT ve create.js'in çizdiği
  // MODÜL. Bu ikisi olmadan kapı bir simülasyonu ölçmüş olurdu.
  if (!existsSync(BUNDLE)) FAIL(`[all] sevk edilen wasm paketi YOK: ${BUNDLE} — engine/build-wasm.sh`);
  if (!existsSync(FLAT_MOD)) FAIL(`[all] çizici YOK: ${FLAT_MOD}`);
  let engine = null, renderFlatFromPlan = null;
  if (existsSync(BUNDLE) && existsSync(FLAT_MOD)) {
    engine = await (await import(BUNDLE)).default();
    ({ renderFlatFromPlan } = await import(FLAT_MOD));
  }

  // ---- YOL AYRIŞTIRICI -----------------------------------------------------
  // SVG `d` verisi -> segment listesi. Yalnız bu dosyanın yazdığı dilbilgisi
  // (M / C / L / Z, hepsi MUTLAK) desteklenir; tanımadığı bir komut SESSİZCE
  // ATLANMAZ, hata olur — atlanan bir komut ölçülmemiş bir çizgi demektir.
  function parsePath(d) {
    const tok = d.trim().split(/[\s,]+/);
    const segs = [];
    let i = 0, cx = 0, cy = 0, sx = 0, sy = 0;
    const num = () => { const v = Number(tok[i++]); if (!Number.isFinite(v)) throw new Error(`yol: sayı değil '${tok[i - 1]}'`); return v; };
    while (i < tok.length) {
      const c = tok[i++];
      if (c === 'M') { cx = num(); cy = num(); sx = cx; sy = cy; }
      else if (c === 'L') { const x = num(), y = num(); segs.push({ k: 'L', p: [cx, cy, x, y] }); cx = x; cy = y; }
      else if (c === 'C') {
        const a = num(), b = num(), e = num(), f = num(), g = num(), h = num();
        segs.push({ k: 'C', p: [cx, cy, a, b, e, f, g, h] }); cx = g; cy = h;
      } else if (c === 'Z') { segs.push({ k: 'L', p: [cx, cy, sx, sy] }); cx = sx; cy = sy; }
      else throw new Error(`yol: tanınmayan komut '${c}'`);
    }
    return segs;
  }
  const at = (s, t) => {
    if (s.k === 'L') { const [x0, y0, x1, y1] = s.p; return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]; }
    const [x0, y0, x1, y1, x2, y2, x3, y3] = s.p, u = 1 - t;
    const b0 = u * u * u, b1 = 3 * u * u * t, b2 = 3 * u * t * t, b3 = t * t * t;
    return [x0 * b0 + x1 * b1 + x2 * b2 + x3 * b3, y0 * b0 + y1 * b1 + y2 * b2 + y3 * b3];
  };
  // Verilen Y yüksekliğinde yolun kestiği bütün X'ler. Örnekleme SADECE kökü
  // KUŞATMAK için; kökün kendisi 80 adım bisection ile çözülür, yani bulunan X
  // örnekleme adımına DEĞİL, kübiğin kendisine bağlıdır.
  function crossingsAt(segs, Y) {
    const xs = [];
    const N = 256;
    for (const s of segs) {
      let pt = at(s, 0);
      for (let k = 1; k <= N; k++) {
        const t = k / N, cur = at(s, t);
        if ((pt[1] - Y) === 0) xs.push(pt[0]);
        else if ((pt[1] - Y) * (cur[1] - Y) < 0) {
          let lo = (k - 1) / N, hi = t;
          for (let it = 0; it < 80; it++) {
            const mid = (lo + hi) / 2;
            if ((at(s, lo)[1] - Y) * (at(s, mid)[1] - Y) <= 0) hi = mid; else lo = mid;
          }
          xs.push(at(s, (lo + hi) / 2)[0]);
        }
        pt = cur;
      }
    }
    return xs;
  }

  // ---- 2. DÖRT SINIF -------------------------------------------------------
  const MANKEN_YOL = 'contract/mannequin-chart-v1.json';
  let mankenGorulen = 0;
  for (const [ad, spec] of (engine ? SINIFLAR : [])) {
    console.log(`\n--- ${ad}  (${spec.garment}/${spec.shaping}/${spec.fabric})`);
    let F = null, P = null;
    try { F = JSON.parse(engine.flatJSON(spec, BODY)); } catch (e) { FAIL(`[all ${ad}] flatJSON çöktü: ${e.message}`); }
    try { P = JSON.parse(engine.planJSON(spec, BODY)); } catch (e) { FAIL(`[all ${ad}] planJSON çöktü: ${e.message}`); }
    if (!F || !P) continue;
    if (F.error) { FAIL(`[all ${ad}] flatJSON reddetti: ${F.error}`); continue; }
    if (P.error) { FAIL(`[all ${ad}] planJSON reddetti: ${P.error}`); continue; }

    // (a) TEK NESNE. İki okuma aynı dikiş planından çıkmadıysa 0.1mm'lik bir
    //     uyum tesadüftür, kanıt değil.
    if (F.dugum !== P.dugum) {
      FAIL(`[all ${ad}] iki okuma İKİ AYRI nesneden: flat dugum ${F.dugum} vs kalıp ${P.dugum}`);
    } else {
      OK(`${ad} — tek nesne (dugum ${F.dugum})`);
    }
    // (b) REDDEDİLEN EKSENLER İKİ OKUMADA DA AYNI, ve ekrana basılabilir.
    const fa = (F.desteklenmeyen_eksenler || []).join(' · ');
    const pa = (P.desteklenmeyen_eksenler || []).join(' · ');
    if (fa !== pa) FAIL(`[all ${ad}] reddedilen eksen listeleri ayrışıyor — flat [${fa}] vs kalıp [${pa}]`);
    console.log(`    reddedilen eksenler: ${fa || '(yok)'}`);

    // (c) H6 — MANKEN ÇİZELGESİ BEYANI. flat_convention_check bölüm 1d bu
    //     hükmü croquis ÇAPALARI üzerinden soruyordu; çapalar H3'te silindi,
    //     hüküm silinmedi: flat hangi bedene değerlendiğini hâlâ İLAN etmek ve
    //     ilan ettiği çizelge diskte durmak zorunda.
    const bd = F.bedenlendirme || {};
    if (!existsSync(join(root, MANKEN_YOL))) {
      FAIL(`[all ${ad}] H6 — manken çizelgesi diskte YOK: ${MANKEN_YOL}`);
    } else {
      const MANKEN = JSON.parse(readFileSync(join(root, MANKEN_YOL), 'utf8'));
      const id = MANKEN.id || '(id YOK)';
      if (!String(bd.cizelge || '').includes(MANKEN_YOL) || !String(bd.cizelge || '').includes(id)) {
        FAIL(`[all ${ad}] H6 — flat manken çizelgesini adıyla ilan etmiyor: "${bd.cizelge}" (beklenen: ${id} / ${MANKEN_YOL})`);
      } else if (bd.dikis_payi_mm !== 0) {
        FAIL(`[all ${ad}] H6 — teknik çizim dikiş payı taşıyor (${bd.dikis_payi_mm}mm); manken okuması payszdır`);
      } else { mankenGorulen += 1; }
    }

    // (d) ⭐ ASIL ÖLÇÜM. Kullanıcıya giden SVG üretilir ve ÇİZİLMİŞ siluet,
    //     kalıbın kendi halka yüksekliğinde ölçülür.
    let svg = null;
    try { svg = renderFlatFromPlan(F); } catch (e) { FAIL(`[all ${ad}] çizim üretilemedi: ${e.message}`); continue; }
    // data-view adlari kanunun adlaridir (contract flat-convention-v1.json
    // views.required = front/back); motorun kendi Turkce alan adlari degil.
    const on = /<path data-view="front" data-curve="siluet" [^>]*d="([^"]+)"/.exec(svg);
    if (!on) { FAIL(`[all ${ad}] SVG'de ön siluet yolu YOK — ölçülecek çizgi yok`); continue; }
    let segs;
    try { segs = parsePath(on[1]); } catch (e) { FAIL(`[all ${ad}] siluet yolu ayrıştırılamadı: ${e.message}`); continue; }
    // SVG y aşağı sayar; siluetin EN ÜST noktası kabuğun ustZ_mm'sidir (kontur
    // omuz halkasında başlar). Yerleşim sabitleri (pad/gap) buraya KOPYALANMAZ:
    // çizimin kendi en üst y'si çapa olarak kullanılır, yani ölçüm yerleşimden
    // bağımsızdır ve download.js'in yerleşimi değişse bile aynı sayıyı verir.
    let yTop = Infinity;
    for (const s of segs) for (let k = 0; k <= 64; k++) yTop = Math.min(yTop, at(s, k / 64)[1]);

    const halkalar = Array.isArray(P.halkalar) ? P.halkalar : [];
    if (halkalar.length !== 3) {
      FAIL(`[all ${ad}] kalıp bel/göğüs/kalça çizgilerini yayınlamıyor (halkalar=${halkalar.length})`);
      continue;
    }
    console.log(`    ${'çizgi'.padEnd(8)} ${'z mm'.padStart(11)} ${'kalıp mm'.padStart(12)} ${'çizim mm'.padStart(12)} ${'fark mm'.padStart(10)}`);
    for (const h of halkalar) {
      const Y = yTop + (F.ustZ_mm - h.z_mm);
      const xs = crossingsAt(segs, Y);
      if (xs.length < 2) {
        FAIL(`[all ${ad}] ${h.ad}: çizilen siluet z=${h.z_mm} yüksekliğinde ${xs.length} kesişim veriyor — çizgi yok`);
        continue;
      }
      const cizim = Math.max(...xs) - Math.min(...xs);
      const kalip = 2 * h.yari_genislik_mm;
      const d = cizim - kalip;
      console.log(`    ${h.ad.padEnd(8)} ${h.z_mm.toFixed(4).padStart(11)} ${kalip.toFixed(4).padStart(12)} ${cizim.toFixed(4).padStart(12)} ${d.toFixed(4).padStart(10)}`);
      if (Math.abs(d) > TOL_MM) {
        FAIL(`[all ${ad}] ${h.ad} çizgisi: çizim ${cizim.toFixed(4)}mm vs kalıp ${kalip.toFixed(4)}mm — fark ${d.toFixed(4)}mm > ${TOL_MM}mm`);
      }
    }
  }
  // ⭐ H6 — MAKİNE OKUNUR SATIR. contract/hedef-kosu-taban.json'un H6 cırcırı bu
  // satırı OKUR (engine/tests/hedef_kosu.mjs); sayı orada yeniden hesaplanmaz,
  // çünkü ikinci bir hesap ikinci bir doğrudur. Format H3'ten önce
  // flat_convention_check §1d'nin bastığı formatın AYNISIDIR: o kapı croquis
  // ÇAPALARINI ölçüyordu, çapalar kalemle birlikte silindi, hüküm silinmedi ve
  // buraya — yüzey hattının kendi `bedenlendirme` bloğuna — taşındı.
  if (engine) {
    const sapan = SINIFLAR.length - mankenGorulen;
    console.log(`\n    H6 = ${sapan}  (manken capasi tek cizelgeden sapan flat sayisi / ` +
                `${SINIFLAR.length} flat, n=${SINIFLAR.length} stil x on+arka)`);
    if (sapan === 0) OK(`all — H6 = 0: dört sınıfın dördü de manken çizelgesini adıyla ilan ediyor (${MANKEN_YOL})`);
  }
}
console.log(`\n${fails === 0 ? 'PASS' : 'FAIL'} flat_pattern_agree_check — ${fails} ihlal`);
process.exit(fails === 0 ? 0 : 1);
