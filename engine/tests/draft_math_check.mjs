#!/usr/bin/env node
// draft_math_check.mjs — V5 madde 7: POZİTİF GEOMETRİ KAPISI (kart V5-D, 2026-08-25).
//
// SORU: motorun SEVK ETTİĞİ ana kalıbın ölçüleri, YAYINLANMIŞ bir çizim formülü
// ya da bandıyla, BEDEN BEDEN (EU34..EU48) tutuyor mu?
//
// YARGILANAN HAT — TARTIŞMA YOK (V5-D kartı, "HANGİ KALEMİ YARGILAYACAK"):
//   engine/wasm/bindings.cpp:339 draftJSON -> GarmentDrafter::draft
//   (engine/src/garment.cpp). Motor `web/vendor/stitchu-engine.js` üstünden
//   yükleniyor; emsal engine/tools/bugra/bugra-parity.mjs:18.
//   surface-pattern hattı BU KAPININ KONUSU DEĞİLDİR (o hat STRAPLESS ve
//   omuz/oyuk taşımıyor — GECE/V5-Z.md §5; bu hat taşıyor, ölçüldü).
//
// =============================================================================
// EŞİK KÜNYELERİ — HEPSİ `GECE/V5-R.md`'DEN BİREBİR. KÜNYESİ OLMAYAN SAYI
// EŞİK OLAMAZ; öyle bir kalem `KAYNAKSIZ` statüsüyle basılır ve KAPIYI
// DÜŞÜRMEZ (V5-D kartı, YASAKLAR: "SAYI UYDURMA").
// =============================================================================
//
// [K1] SCYE DERİNLİĞİ — TABLO, formül DEĞİL.
//   Aldrich, *Metric Pattern Cutting*, 4. baskı (Blackwell 2004), s.11:
//   armscye depth = 20 / 20.5 / 21 / 21.5 / 22 / 22.5 / 23 / 23.7 / 24.4 / 25.1 cm
//   (beden 8->26 <-> büst 80->122). GÜVEN: birincil-verbatim (V5-R §C1).
//   Aldrich onu vücuttan TÜRETMEYİ AÇIKÇA REDDEDİYOR: "15 Armscye Depth . . .
//   standard measurement." (4. bs. s.171). "Büst/8 + X" tipi formül Aldrich'te
//   YOK (tam metin grep'i, V5-R §C1 yokluk kanıtı).
//   Blok inşası (yakın oturan bodice, 4. bs. s.14): "1-2 armscye depth
//   measurement plus 0.5 cm; square across." -> BEKLENEN = tablo + 5.0mm.
//   ⚠ TOLERANS YAYINLANMAMIŞ (V5-R §A: apparel kalıp toleransı için hiçbir
//   yayın bulunamadı) -> sapma RATCHET'lenir, aşağıya bak.
//
// [K2] KOL OYUĞU ÇEVRESİ — **YAYIN YOK.**
//   Aldrich hedef oyuk çevresi YAYINLAMIYOR; kol bloğunun girdisi
//   "armscye - measure the armscye" (4. bs. s.14/16/22, birincil-verbatim).
//   "armhole = k x büst" ilişkisi için de yayın bulunamadı (V5-R §C2).
//   Yayınlanan tek sayı bir VÜCUT tablosudur (Jill Wolcott Knits, göğüs
//   90-94cm -> 40.0-40.6cm) ve GİYSİ oyuğu ile AYNI BÜYÜKLÜK DEĞİLDİR
//   (V5-R §C2 ★: "40-44cm bandı vücut ile giysiyi aynı ada koyuyor").
//   -> STATÜ: KAYNAKSIZ. YAYIN YOK, BANT ŞU ÖLÇÜMDEN:
//      Buğra Locket EU38, KESİM çizgisi toplam armhole 433.45mm; 8 bedende
//      42.5-47.5cm. Basan komut:  python3 patterns_real/tools/trace-match.py
//      (CLAUDE.md "GERÇEK BUĞRA LOCKET-38 - ÖLÇÜLDÜ", T14 17.08).
//      Bu bant RAPORLANIR, KIYASLANIR, ama KAPIYI DÜŞÜRMEZ.
//
// [K3] OMUZ GENİŞLİĞİ — TABLO + iki blok kuralı.
//   Aldrich 4. bs. s.11 shoulder length = 11.75 / 12 / 12.25 / 12.5 / 12.75 /
//   13 / 13.25 / 13.6 / 13.9 / 14.2 cm (aynı büst ekseni). birincil-verbatim.
//   Yakın oturan bodice: ARKA "9-11 shoulder length measurement plus 1 cm"
//   (s.14) -> BEKLENEN(arka) = tablo + 10.0mm.
//   ÖN "27-30 draw a line from 27, shoulder length measurement" - EKLEME YOK
//   (s.14) -> BEKLENEN(ön) = tablo.
//   ⚠ TOLERANS YAYINLANMAMIŞ -> RATCHET.
//
// [K4] ÇEVRE PAYLARI (ease) — BANT VAR, gerçek GEÇTİ/KALDI hükmü burada.
//   büst  ALT SINIR: Louise Cutting, "Ease Into Place", Threads #221, Bahar
//         2023, s.71, *MINIMUM EASE*: "Büst 2½-3 in" -> 63.5mm (birincil-verbatim,
//         derginin kendi PDF'i). ÜST SINIR: aynı yazının FIT AND EASE tablosu,
//         bluz/elbise "Fitted" 3-4 in -> 101.6mm.
//   bel   ALT SINIR: aynı MINIMUM EASE listesi, "Bel: elbise 1 in+" -> 25.4mm.
//         ÜST SINIR: Aldrich 4. bs. s.28 yakın oturan "half the waist
//         measurement plus 3 cm ease" -> +60.0mm (birincil-verbatim).
//   kalça ALT SINIR: Threads MINIMUM EASE "Kalça 2-3 in" -> 50.8mm.
//         ÜST SINIR: Threads/Big-4 etek-pantolon "Fitted" 2-3 in üst ucu
//         76.2mm; Aldrich yakın oturan bodice kalça payı +50mm (s.14) bu
//         bandın ALT ucuyla birebir aynı yerde duruyor.
//   ⚠ V5-R §C4 ⚠: Threads ile Big-4 BAĞIMSIZ İKİ KAYNAK DEĞİLDİR (bantlar 1/8"
//     farkla aynı). Burada TEK kaynak sayılıyorlar, "iki kaynak doğruluyor"
//     DENMİYOR.
//   ⚠ V5-R §C4 ★★: reponun "büst+60 / bel+25 / kalça+50, kaynak Threads+Aldrich"
//     künyesi ölçüldü ve BÜST kalemi künyesini DESTEKLEMİYOR (60 < 63.5).
//     Bu kapı o bulguyu bağımsız olarak yeniden ölçer.
//
// [K5] ENSE OYUNTUSU (back neck drop) — SABİT, yayınlanmış.
//   Aldrich 4. bs. s.14/16 "0-1 1.5 cm" — bütün bedenlerde SABİT (ceket 1.75,
//   palto 2.0). birincil-verbatim (V5-R §C5). -> BEKLENEN = 15.0mm, her beden.
//   V5-R §C5 ayrıca üç dolaşan kuralı ("= 1/3 yaka genişliği", "= 2 cm sabit",
//   "ön düşüş = genişlik + 1 cm") YAYIN YOK diye işaretliyor ve Aldrich üçünü
//   de çürütüyor - o üçünden hiçbiri bu dosyaya girmedi.
//   ⚠ TOLERANS YAYINLANMAMIŞ -> RATCHET.
//
// -----------------------------------------------------------------------------
// TOLERANS NEDEN RATCHET (v6 §4.7 anlamında dürüst hüküm)
// -----------------------------------------------------------------------------
// V5-R §A'nın hükmü: apparel kalıp toleransı için **YAYIN YOK** — ASTM D5585 bir
// VÜCUT ölçü tablosudur, ISO 8559-3 "garment dimensions are not included",
// 1/32" ifadesi Open Library tam-metin korpusunda 73 kez geçiyor ve HİÇBİRİ
// giyim değil. Yani "Aldrich'ten şu kadar mm sapabilir" diye YAZILABİLECEK
// hiçbir yayınlanmış sayı yoktur. Uydurmak yerine bu kapı, nokta-değerli
// kalemlerde SAPMAYI DONDURUR: bugün ölçülen en kötü sapma tavandır, tavan
// yalnız DÜŞEBİLİR. Emsal: engine/tests/flat_pattern_agree_check.mjs
// UNMEASURED_RATCHET. Tavanlar aşağıda, her biri onu basan komutla birlikte.
//
// ANTI-HACK / KANIT KANCALARI (yalnız §4.2 boş-test ve §4.5 mutasyon kanıtı
// için; üretim koşusunda hiçbiri set edilmez, set edilirse EKRANA BASILIR):
//   V5D_MUTATE=<ölçü_adı>:<mm>[,<ölçü_adı>:<mm>...]  ölçülen değere mm ekler
//   V5D_ENGINE=<yol>                                  başka bir motor .js'i yükler
//   V5D_SIZES=EU38[,EU40...]                          beden alt kümesi

import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const require = createRequire(import.meta.url);

let fails = 0;
const FAIL = (m) => { console.log(`FAIL  ${m}`); fails += 1; };
const OK = (m) => console.log(`ok    ${m}`);

// ---------------------------------------------------------------------------
// KÜNYELİ TABLOLAR — büst(cm) anahtarlı, Aldrich 4. bs. s.11
// ---------------------------------------------------------------------------
const ALDRICH_P11 = {
  //  büst : { scyeDepthCM, shoulderCM }   (beden 8..26)
  80:  { scye: 20.0, shoulder: 11.75 },
  84:  { scye: 20.5, shoulder: 12.00 },
  88:  { scye: 21.0, shoulder: 12.25 },
  92:  { scye: 21.5, shoulder: 12.50 },
  96:  { scye: 22.0, shoulder: 12.75 },
  100: { scye: 22.5, shoulder: 13.00 },
  104: { scye: 23.0, shoulder: 13.25 },
  110: { scye: 23.7, shoulder: 13.60 },
  116: { scye: 24.4, shoulder: 13.90 },
  122: { scye: 25.1, shoulder: 14.20 },
};

// Yayınlanmış ease bantları (K4). [alt, üst] mm, ve künye.
const EASE_BANDS = {
  bust_ease:  { lo: 63.5, hi: 101.6, cite: 'Threads #221 s.71 MINIMUM EASE büst 2.5in=63.5mm .. FIT AND EASE "Fitted" 4in=101.6mm' },
  waist_ease: { lo: 25.4, hi: 60.0,  cite: 'Threads #221 s.71 MINIMUM EASE bel elbise 1in=25.4mm .. Aldrich 4.bs s.28 "half waist plus 3cm"=+60mm' },
  hip_ease:   { lo: 50.8, hi: 76.2,  cite: 'Threads #221 s.71 MINIMUM EASE kalça 2in=50.8mm .. etek/pantolon "Fitted" 3in=76.2mm' },
};

// ---------------------------------------------------------------------------
// RATCHET TAVANLARI — YAYIN DEĞİL, EV KARARI. Bugün ölçülen en kötü sapma,
// 8 bedende. Basan komut:  node engine/tests/draft_math_check.mjs
// ★ TAVANLAR ELLE YAZILMAZ (kart V5-E): tek kaynak
//   `engine/tests/v5-ratchet-baseline.json` — her tavanın künyesi, ölçüm tarihi
//   ve onu basan komut orada. Emsal: engine/tests/vocab-reference-baseline.json.
// ★ EŞİK GEVŞETME DEĞİL: Aldrich tabloları, Threads/Aldrich ease bantları ve
//   her GEÇTİ/KALDI satırı AYNEN duruyor ve ADIYLA basılıyor. Değişen tek şey
//   exit kodunun bağlandığı yer: "ihlal = 0" yerine "ihlal ≤ ölçülmüş tavan".
//   Tavanı aşan KIRMIZI düşer; tavanın altına düşülürse "TAVAN DÜŞÜRÜLEBİLİR"
//   uyarısı basılır ve indirmek ayrı, bilinçli bir commit'tir.
// ---------------------------------------------------------------------------
const RBFILE = JSON.parse(readFileSync(join(here, 'v5-ratchet-baseline.json'), 'utf8'));
const RB = RBFILE.kapilar.draft_math_check;
const RATCHET = RB.sapmaTavaniMM;
const BAND_RATCHET = RB.bantDisiTavani;
const UNMEASURABLE_RATCHET = RB.digerTavanlar.unmeasurable;
const ENGINE_ERROR_RATCHET = RB.digerTavanlar.engine_error;

// ---------------------------------------------------------------------------
// MOTOR
// ---------------------------------------------------------------------------
const ENGINE_JS = process.env.V5D_ENGINE || join(root, 'web/vendor/stitchu-engine.js');
const CONTRACT = join(root, 'contract/tables.json');

console.log('=== draft_math_check — POZİTİF GEOMETRİ KAPISI (V5 madde 7)');
console.log(`    yargılanan hat: bindings.cpp draftJSON -> GarmentDrafter::draft`);
console.log(`    motor:          ${ENGINE_JS.replace(root + '/', '')}`);
console.log(`    eşik kaynağı:   GECE/V5-R.md (künyeler bu dosyanın başlığında, birebir)`);
for (const k of ['V5D_MUTATE', 'V5D_ENGINE', 'V5D_SIZES']) {
  if (process.env[k]) console.log(`    ⚠ KANIT KANCASI AKTİF: ${k}=${process.env[k]}`);
}

if (!existsSync(ENGINE_JS)) {
  FAIL(`motor diskte YOK: ${ENGINE_JS} — eksik alet = eksik kanıt (SKIP DEĞİL, KIRMIZI)`);
  console.log(`\nFAIL draft_math_check — ${fails} ihlal`);
  process.exit(1);
}
if (!existsSync(CONTRACT)) {
  FAIL(`contract/tables.json diskte YOK: ${CONTRACT}`);
  console.log(`\nFAIL draft_math_check — ${fails} ihlal`);
  process.exit(1);
}

const createEngine = require(ENGINE_JS);
const engine = await createEngine();

const chart = JSON.parse(readFileSync(CONTRACT, 'utf8')).draft.euSizeChart;
const FIELDS = chart._fields; // ["bustCM","waistCM","hipCM","shoulderCM","backLengthCM","armLengthCM","neckCM"]
const ALL_SIZES = ['EU34', 'EU36', 'EU38', 'EU40', 'EU42', 'EU44', 'EU46', 'EU48'];
const SIZES = (process.env.V5D_SIZES || ALL_SIZES.join(',')).split(',').map((s) => s.trim());

function bodyOf(size) {
  const row = chart[size];
  if (!Array.isArray(row)) throw new Error(`contract/tables.json euSizeChart içinde ${size} yok`);
  const g = (n) => row[FIELDS.indexOf(n)];
  return { bust: g('bustCM'), waist: g('waistCM'), hip: g('hipCM'), shoulder: g('shoulderCM'),
           backLength: g('backLengthCM'), armLength: g('armLengthCM'), neck: g('neckCM') };
}

// bugra-parity.mjs:63 ile AYNI temel spec — bu kapı yeni bir giysi icat etmiyor,
// motorun bugün sevk ettiği ana kalıbı ölçüyor.
const SPEC = { waistline: 'natural', fabric: 'woven', sleeveLength: 'short', skirtStyle: 'aLine',
  skirtLength: 'mini', topLength: 'hip', frontPlacket: false, tieClosure: 0, sleeveCap: 0,
  collarType: 0, collarEdge: 0, gatherType: 0, gatherZone: 0, backOpening: 0, backSlit: 0,
  ruffledStraps: 0, peplum: 0, placketStyle: 0, edgeFinish: 0, pocketStyle: 0, cuffStyle: 0,
  hemShape: 0, shoulderStyle: 0, buttonRow: 0, exposedZip: 0, backDetail: 0, bardotStyle: 0 };

// ---------------------------------------------------------------------------
// GEOMETRİ — yay uzunlukları KİRİŞLE DEĞİL, örneklenerek. Adım tavanı 0.05mm
// (pattern-measure.mjs ile aynı sözleşme).
// ---------------------------------------------------------------------------
const MAX_STEP_MM = 0.05;
function cubicLen(a, c) {
  const chord = Math.hypot(c.x - a.x, c.y - a.y)
    + Math.hypot(c.cp1x - a.x, c.cp1y - a.y) + Math.hypot(c.cp2x - c.cp1x, c.cp2y - c.cp1y)
    + Math.hypot(c.x - c.cp2x, c.y - c.cp2y);
  const n = Math.max(64, Math.ceil(chord / MAX_STEP_MM));
  let L = 0, px = a.x, py = a.y;
  for (let i = 1; i <= n; i++) {
    const t = i / n, mt = 1 - t;
    const x = mt*mt*mt*a.x + 3*mt*mt*t*c.cp1x + 3*mt*t*t*c.cp2x + t*t*t*c.x;
    const y = mt*mt*mt*a.y + 3*mt*mt*t*c.cp1y + 3*mt*t*t*c.cp2y + t*t*t*c.y;
    L += Math.hypot(x - px, y - py); px = x; py = y;
  }
  return L;
}
// Konturu KENARLARA ayır: her kenar = bir çizim komutu (line ya da cubic).
// Kalıbın kendi köşeleri kenar sınırıdır; hiçbir landmark aranmaz/tahmin edilmez.
function edgesOf(cmds) {
  const out = []; let cur = null;
  for (const c of cmds) {
    if (c.type === 'move') { cur = { x: c.x, y: c.y }; }
    else if (c.type === 'line') { out.push({ a: cur, b: { x: c.x, y: c.y }, len: Math.hypot(c.x - cur.x, c.y - cur.y) }); cur = { x: c.x, y: c.y }; }
    else if (c.type === 'curve') { out.push({ a: cur, b: { x: c.x, y: c.y }, len: cubicLen(cur, c) }); cur = { x: c.x, y: c.y }; }
  }
  return out;
}
// Pens ağzı: markings üçlüsü [bacak1, apeks, bacak2]; ağız = iki bacak arası
// kiriş. (Bacaklar kalıbın alt kenarı ÜSTÜNDE duruyor; kenar sığ olduğu için
// kiriş ~ yay. Bu bir YAKLAŞIMDIR ve burada ADIYLA yazılıdır.)
function dartIntakes(markings) {
  const out = [];
  for (let i = 0; i + 2 < (markings || []).length; i += 3) {
    const a = markings[i], b = markings[i + 2];
    out.push(Math.hypot(b.x - a.x, b.y - a.y));
  }
  return out;
}

// ---------------------------------------------------------------------------
// ÖLÇÜM — draftJSON çıktısındaki KÖŞELERDEN. Her landmark, hangi köşe olduğu
// motorun kendi çıktısı ÜSTÜNDE hassasiyet ölçümüyle doğrulanarak seçildi
// (gövde ölçüsü +10cm oynatılıp hangi koordinatın kımıldadığı görüldü);
// tahmin edilmedi.
// ---------------------------------------------------------------------------
function measure(size) {
  const body = bodyOf(size);
  const res = JSON.parse(engine.draftJSON(SPEC, body));
  if (!res.pattern) return { body, err: res.error || 'pattern null' };
  const P = Object.fromEntries(res.pattern.pieces.map((p) => [p.name, p]));
  const need = ['Bodice Front', 'Bodice Back', 'Skirt Front', 'Skirt Back'];
  for (const n of need) if (!P[n]) return { body, err: `parça YOK: ${n}` };

  const F = edgesOf(P['Bodice Front'].commands);   // 0 yaka, 1 omuz, 2 oyuk, 3 yan, 4 bel, 5 CF
  const B = edgesOf(P['Bodice Back'].commands);
  const SF = edgesOf(P['Skirt Front'].commands);   // 0 bel, 1 kalçaya, 2 etek yanı, 3 etek ucu, 4 CF
  const SB = edgesOf(P['Skirt Back'].commands);

  const fNeckPt = F[0].b, fShoulderTip = F[1].b, fUnderarm = F[2].b;
  const bCBNeck = B[0].a, bNeckPt = B[0].b, bShoulderTip = B[1].b, bUnderarm = B[2].b;

  const m = {};
  // K1 — scye derinliği: arka blokta, omuz-boyun noktasının (Aldrich nokta 9,
  // nokta 1 ile aynı yatay çizgide) hizasından koltukaltı çizgisine dikey düşüş.
  m.scye_depth = bUnderarm.y - bNeckPt.y;
  // K2 — kol oyuğu çevresi: ön oyuk yayı + arka oyuk yayı (giysi oyuğu).
  m.armhole_circumference = F[2].len + B[2].len;
  // K3 — omuz genişliği: omuz dikişinin kendi uzunluğu (boyun noktası -> omuz ucu).
  m.shoulder_width_front = Math.hypot(fShoulderTip.x - fNeckPt.x, fShoulderTip.y - fNeckPt.y);
  m.shoulder_width_back  = Math.hypot(bShoulderTip.x - bNeckPt.x, bShoulderTip.y - bNeckPt.y);
  // K5 — ense oyuntusu: CB boyun noktasının omuz-boyun noktasından düşüşü.
  m.back_neck_drop = bCBNeck.y - bNeckPt.y;

  // K4 — çevre payları. Halkalar KÖŞELERDEN, pens ağızları DÜŞÜLEREK
  // (pens kapanmadan çevre okunamaz — knowledge/drafting-math-eu38.md §Yan dikiş
  // ile aynı sınıf hata olurdu).
  const bustRing = 2 * (fUnderarm.x + bUnderarm.x);              // ön yarım + arka yarım
  m.bust_ease = bustRing - body.bust * 10;

  const waistRingRaw = 2 * (F[4].len + B[4].len);
  const waistDarts = 2 * (dartIntakes(P['Bodice Front'].markings).reduce((a, b) => a + b, 0)
                        + dartIntakes(P['Bodice Back'].markings).reduce((a, b) => a + b, 0));
  m.waist_ease = (waistRingRaw - waistDarts) - body.waist * 10;

  const hipRing = 2 * (SF[1].b.x + SB[1].b.x);                    // kalça köşesi (hip-tahrikli, ölçüldü)
  m.hip_ease = hipRing - body.hip * 10;

  // Mutasyon kancası — DEĞERE uygulanır, EŞİĞE değil.
  if (process.env.V5D_MUTATE) {
    for (const part of process.env.V5D_MUTATE.split(',')) {
      const [k, v] = part.split(':');
      if (!(k in m)) { FAIL(`V5D_MUTATE bilinmeyen ölçü adı: ${k}`); continue; }
      m[k] += Number(v);
    }
  }
  return { body, m, raw: { bustRing, waistRingRaw, waistDarts, hipRing } };
}

// ---------------------------------------------------------------------------
// YARGI
// ---------------------------------------------------------------------------
const worst = { scye_depth: 0, shoulder_width_front: 0, shoulder_width_back: 0, back_neck_drop: 0 };
const bandOut = { bust_ease: 0, waist_ease: 0, hip_ease: 0 };
let unmeasurable = 0;
let engineErrors = 0;
const tally = { GECTI: 0, KALDI: 0, KAYNAKSIZ: 0 };

const W = (s, n) => String(s).padStart(n);
const L = (s, n) => String(s).padEnd(n);

for (const size of SIZES) {
  let r;
  try { r = measure(size); }
  catch (e) { engineErrors += 1; FAIL(`${size}: motor çöktü — ${e.message}`); continue; }
  if (r.err) { engineErrors += 1; FAIL(`${size}: ${r.err}`); continue; }
  const { body, m } = r;
  const ald = ALDRICH_P11[body.bust];

  console.log(`\n--- ${size}  (contract/tables.json: büst ${body.bust} · bel ${body.waist} · kalça ${body.hip} · yaka ${body.neck} cm)`);
  if (!ald) console.log(`    ⚠ Aldrich s.11 tablosunda büst ${body.bust} YOK — nokta-değerli kalemler KAYNAKSIZ düşer`);
  console.log(`    ${L('kalem', 24)} ${W('ÖLÇÜLEN', 11)} ${W('BEKLENEN', 11)} ${W('fark', 10)}  STATÜ  KAYNAK KÜNYESİ`);

  const row = (name, meas, exp, expTxt, status, cite) => {
    console.log(`    ${L(name, 24)} ${W(meas.toFixed(4), 11)} ${W(expTxt, 11)} ${W(exp == null ? '—' : (meas - exp).toFixed(4), 10)}  ${L(status, 10)} ${cite}`);
  };

  // --- nokta-değerli, tolerans YAYINLANMAMIŞ -> KAYNAKSIZ statü + RATCHET
  const pointItems = ald ? [
    ['scye_depth',           ald.scye * 10 + 5.0,      'Aldrich 4.bs s.11 tablo ' + ald.scye + 'cm + s.14 "plus 0.5 cm"'],
    ['shoulder_width_front', ald.shoulder * 10,        'Aldrich 4.bs s.11 tablo ' + ald.shoulder + 'cm + s.14 ön "shoulder length" (ekleme YOK)'],
    ['shoulder_width_back',  ald.shoulder * 10 + 10.0, 'Aldrich 4.bs s.11 tablo ' + ald.shoulder + 'cm + s.14 arka "plus 1 cm"'],
    ['back_neck_drop',       15.0,                     'Aldrich 4.bs s.14/16 "0-1 1.5 cm" SABİT'],
  ] : [];
  for (const [name, exp, cite] of pointItems) {
    const d = Math.abs(m[name] - exp);
    if (d > worst[name]) worst[name] = d;
    row(name, m[name], exp, exp.toFixed(2), 'KAYNAKSIZ', cite + ' — TOLERANS YAYIN YOK (V5-R §A) -> RATCHET');
    tally.KAYNAKSIZ += 1;
  }
  if (!ald) {
    for (const name of Object.keys(worst)) {
      row(name, m[name], null, '—', 'KAYNAKSIZ', 'Aldrich s.11 bu büstü taşımıyor');
      tally.KAYNAKSIZ += 1;
    }
  }

  // --- yayın YOK -> KAYNAKSIZ, bant BİZİM ÖLÇÜMÜMÜZDEN, kapıyı düşürmez
  row('armhole_circumference', m.armhole_circumference, null, '—', 'KAYNAKSIZ',
      'YAYIN YOK (V5-R §C2: Aldrich oyuk çevresi yayınlamıyor) — BANT ŞU ÖLÇÜMDEN: '
      + 'Buğra Locket kesim çizgisi 425-475mm, EU38 433.45mm · komut: python3 patterns_real/tools/trace-match.py');
  tally.KAYNAKSIZ += 1;
  {
    const lo = 425.0, hi = 475.0; // ölçüm bandı — yayın DEĞİL, kapı DEĞİL, yalnız bilgi
    const inb = m.armhole_circumference >= lo && m.armhole_circumference <= hi;
    console.log(`    ${' '.repeat(24)} ${W('', 11)} ${W('', 11)} ${W('', 10)}  (ölçüm bandı ${lo}-${hi}mm içinde mi: ${inb ? 'EVET' : 'HAYIR'} — BİLGİ, HÜKÜM DEĞİL)`);
  }

  // --- bant VAR -> gerçek GEÇTİ/KALDI
  for (const name of ['bust_ease', 'waist_ease', 'hip_ease']) {
    const b = EASE_BANDS[name];
    const inb = m[name] >= b.lo - 1e-9 && m[name] <= b.hi + 1e-9;
    console.log(`    ${L(name, 24)} ${W(m[name].toFixed(4), 11)} ${W(`${b.lo}..${b.hi}`, 11)} ${W('', 10)}  ${L(inb ? 'GEÇTİ' : 'KALDI', 10)} ${b.cite}`);
    if (inb) tally.GECTI += 1;
    else { tally.KALDI += 1; bandOut[name] += 1; FAIL(`${size} ${name}: ${m[name].toFixed(4)}mm yayınlanmış bant [${b.lo}, ${b.hi}]mm DIŞINDA — ${b.cite}`); }
  }
}

// ---------------------------------------------------------------------------
console.log(`    yargı sayımı: GEÇTİ ${tally.GECTI} · KALDI ${tally.KALDI} · KAYNAKSIZ ${tally.KAYNAKSIZ}`);
const namedFails = fails;
console.log(`ADIYLA basılan ihlal satırı: ${namedFails}`);

// ═══ RATCHET HÜKMÜ ═════════════════════════════════════════════════════════
// Yukarıdaki hiçbir satır bu bölüm yüzünden kısalmadı/gizlenmedi: her beden,
// her kalem, her GEÇTİ/KALDI ve her KALDI'nın FAIL satırı adıyla basıldı.
// Burada YALNIZ exit kodu belirleniyor.
console.log(`\n--- RATCHET (tavan dosyası: engine/tests/v5-ratchet-baseline.json · ölçüm ${RBFILE.olcumTarihi}, ağaç ${RBFILE.olcumAgaci})`);
console.log('    (a) NOKTA-DEĞERLİ KALEMLER — tolerans YAYINLANMAMIŞ (V5-R §A), sapma dondurulmuş');
let broken = 0, lowered = 0;
for (const [name, ceil] of Object.entries(RATCHET)) {
  const w = worst[name];
  console.log(`    ${L(name, 24)} en kötü |sapma| ${W(w.toFixed(4), 10)} mm   tavan ${W(ceil.toFixed(2), 8)} mm`);
  if (w > ceil + 1e-9) { broken += 1; FAIL(`RATCHET KIRILDI — ${name}: en kötü sapma ${w.toFixed(4)}mm > tavan ${ceil.toFixed(2)}mm`); }
  else if (w < ceil - 1e-9) { lowered += 1; console.log(`      TAVAN DÜŞÜRÜLEBİLİR: ${name} ${ceil} -> ${w.toFixed(6)}  (indirmek AYRI ve BİLİNÇLİ bir commit'tir)`); }
}
console.log('    (b) YAYINLANMIŞ BANT KALEMLERİ — bant DEĞİŞMEDİ, bant DIŞI BEDEN SAYISI tavanlandı');
for (const [name, ceil] of Object.entries(BAND_RATCHET)) {
  const n = bandOut[name];
  const b = EASE_BANDS[name];
  console.log(`    ${L(name, 24)} bant dışı beden ${W(n, 10)}/${SIZES.length}   tavan ${W(ceil, 8)}   bant ${b.lo}..${b.hi}mm`);
  if (n > ceil) { broken += 1; FAIL(`RATCHET KIRILDI — ${name}: bant dışı ${n} > tavan ${ceil} (bant ${b.lo}..${b.hi}mm, künye: ${b.cite})`); }
  else if (n < ceil) { lowered += 1; console.log(`      TAVAN DÜŞÜRÜLEBİLİR: ${name} ${ceil} -> ${n}  (indirmek AYRI ve BİLİNÇLİ bir commit'tir)`); }
}
console.log('    (c) DİĞER');
console.log(`    ${L('unmeasurable', 24)} ${W(unmeasurable, 10)}      tavan ${W(UNMEASURABLE_RATCHET, 8)}`);
if (unmeasurable > UNMEASURABLE_RATCHET) { broken += 1; FAIL(`RATCHET KIRILDI — UNMEASURABLE ${unmeasurable} > ${UNMEASURABLE_RATCHET} — ölçülemeyen sayısı ARTTI`); }
console.log(`    ${L('engine_error', 24)} ${W(engineErrors, 10)}      tavan ${W(ENGINE_ERROR_RATCHET, 8)}`);
if (engineErrors > ENGINE_ERROR_RATCHET) { broken += 1; FAIL(`RATCHET KIRILDI — engine_error ${engineErrors} > ${ENGINE_ERROR_RATCHET}`); }
if (lowered) console.log(`    ${lowered} kalemde tavan düşürülebilir; kapı YEŞİL kalır, taban dosyası kendiliğinden güncellenmez.`);

console.log(`\n${broken === 0 ? 'PASS' : 'FAIL'} draft_math_check — RATCHET: ${broken} tavan aşımı · adıyla basılan ihlal satırı ${namedFails}`);
process.exit(broken === 0 ? 0 : 1);
