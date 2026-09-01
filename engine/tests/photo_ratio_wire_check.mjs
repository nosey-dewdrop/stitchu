#!/usr/bin/env node
// photo_ratio_wire_check.mjs — MANDAL (2026-07-27): olculen sayilar kullanici
// akisina bagli. Adli rapor bulgusu: LLM sayi okuyamiyor (anchor-echo, miniler
// prompt orneği 1.55'e kumeleniyor); sayilarin tek kaynagi deterministik piksel
// olcumu (web/js/measure.js). Bu test kilitler:
//   1) OLCUM KAPISI: applyMeasuredRatios olculen oranlari seen'e koyar; LLM'in
//      ratios{} cevabi ASLA tuketilmez (olcum reddedince null, echo olmaz).
//   2) YAPISAL YASAK: ratiosMeasured taniti olmadan (ham LLM seen'i)
//      pickSkirtLengthMM 0, pickSkirtFullness null — ucuncu (sessiz) yol yok.
//   3) ROUND-TRIP 1: ayni foto + farkli govde olculeri -> farkli mm.
//   4) ROUND-TRIP 2: farkli L/W'li iki foto -> farkli spec (mm + fullness).
//   5) FULLNESS TABLOSU: hemToWaistWidth -> mevcut enum siniflari, esikler
//      deterministik; pleated/gore etiketi (yapisal okuma) orani ezer.
//   6) KAYNAK MANDALI: create.js/analyze.js/render.js kablolari gercekten
//      takili (DOM modulleri node'da kosulamaz, kaynak regex'i).
// Fotograflar SENTETIK (cizilen siluetler): test hermetik, ag yok, kredi yok,
// telifli fixture yok; measureGarment TAM piksel hattinda kosar.
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');

const { measureGarment } = await import(join(root, 'web/js/measure.js'));
const {
  applyMeasuredRatios, pickSkirtLengthMM, pickSkirtFullness,
  refreshSkirtLengthMM, MEASURE_MIN_CONFIDENCE, SKIRT_FULLNESS_TABLE,
} = await import(join(root, 'web/js/vision-bridge.js'));

let fails = 0;
const fail = (m) => { console.error('FAIL:', m); fails += 1; };

// ---- sentetik elbise silueti: duz zemin + dolu, ortali siluet -------------
// Genislik profili kirilma noktalari (garment boyu orani -> genislik px):
// 0.00 omuz, 0.15 bust, 0.40 bel (en dar), 1.00 etek ucu. measureGarment'in
// landmark bantlari (bust 10-22%, bel min 24-62%, etek max 88-100%) bu
// profilden tasarim degerlerini okur.
function makeDressImage({ bustW, waistW, hemW, len }) {
  const shoulderW = Math.round(bustW * 0.9); // kafa-reddi bandindan uzak (>0.55*bust)
  const pad = 40;
  const W = Math.max(hemW, bustW) + 2 * pad;
  const H = len + 2 * pad;
  const data = new Uint8ClampedArray(W * H * 4);
  for (let p = 0; p < W * H; p++) { // duz bej zemin
    data[p * 4] = 236; data[p * 4 + 1] = 229; data[p * 4 + 2] = 218; data[p * 4 + 3] = 255;
  }
  const stops = [[0, shoulderW], [0.15, bustW], [0.4, waistW], [1, hemW]];
  const widthAt = (f) => {
    for (let i = 1; i < stops.length; i++) {
      if (f <= stops[i][0]) {
        const [f0, w0] = stops[i - 1];
        const [f1, w1] = stops[i];
        return w0 + (w1 - w0) * ((f - f0) / (f1 - f0));
      }
    }
    return hemW;
  };
  const cx = W / 2;
  for (let y = 0; y < len; y++) {
    const half = widthAt(y / (len - 1)) / 2;
    const x0 = Math.round(cx - half);
    const x1 = Math.round(cx + half);
    for (let x = x0; x <= x1; x++) {
      const o = ((y + pad) * W + x) * 4;
      data[o] = 40; data[o + 1] = 45; data[o + 2] = 90; data[o + 3] = 255;
    }
  }
  return { data, width: W, height: H };
}

const DEMO = { bust: 88, backLength: 40 };  // EU38 demo govdesi (create.js DEMO_BODY)
const USER = { bust: 102, backLength: 44 }; // kullanicinin gercek olcusu

// foto A: shift benzeri (dar etek ucu) — L/W ~2.2, hem/bel ~1.25 -> straight
const mA = measureGarment(makeDressImage({ bustW: 200, waistW: 160, hemW: 200, len: 440 }));
// foto B: fit-and-flare — L/W ~1.8, hem/bel ~2.1 -> gathered
const mB = measureGarment(makeDressImage({ bustW: 200, waistW: 150, hemW: 320, len: 360 }));

for (const [name, m, lw, hw] of [
  ['A (shift)', mA, [2.0, 2.45], [1.15, 1.45]],
  ['B (fit-and-flare)', mB, [1.6, 2.0], [1.9, 2.4]],
]) {
  if (!m.ok) { fail(`foto ${name}: olcum reddetti (${m.reason})`); continue; }
  if (m.confidence < MEASURE_MIN_CONFIDENCE) fail(`foto ${name}: confidence ${m.confidence} < esik ${MEASURE_MIN_CONFIDENCE}`);
  const r = m.ratios;
  if (!(r.lengthToWidth >= lw[0] && r.lengthToWidth <= lw[1])) fail(`foto ${name}: L/W ${r.lengthToWidth} beklenen bandin (${lw}) disinda`);
  if (!(r.hemToWaistWidth >= hw[0] && r.hemToWaistWidth <= hw[1])) fail(`foto ${name}: hem/bel ${r.hemToWaistWidth} beklenen bandin (${hw}) disinda`);
}

// ---- 0) SEMA MANDALI: worker ratios{} 7 alaninin HEPSI olcum ciktisinda ----
// (goz kolu v1, 2026-07-28). Anahtar listesi istem kaynagindan okunur:
// sema degisirse bu test bilincli guncellenene kadar kirmizi.
// F1 (2026-09-01) BILINCLI GUNCELLEME: istem literali worker.js'ten
// backend/analyze-core.js'e tasindi (metin-analiz ayni semayi paylassin diye,
// tek kaynak). Sema METNI degismedi — prompt_spec_check foto istemini bayt
// bayt kilitliyor; buradaki mandal ayni 7 anahtari yeni kaynaktan okur.
const workerSrc = readFileSync(join(root, 'backend/analyze-core.js'), 'utf8');
const ratiosLine = workerSrc.match(/"ratios": \{([^}]*)\}/);
if (!ratiosLine) fail('worker.js ratios{} satiri bulunamadi — sema mandali kör');
const workerKeys = [...(ratiosLine ? ratiosLine[1] : '').matchAll(/"(\w+)": number \| null/g)].map((m2) => m2[1]);
if (workerKeys.length !== 7) fail(`worker ratios sema anahtari 7 degil (${workerKeys.length}: ${workerKeys})`);
for (const k of workerKeys) {
  if (!Object.prototype.hasOwnProperty.call(mA.ratios, k)) fail(`olcum ratios '${k}' alanini tasimiyor (worker sema uyumu kirik)`);
  const v = mA.ratios[k];
  if (v === null) {
    if (!mA.ratioNull || typeof mA.ratioNull[k] !== 'string' || !mA.ratioNull[k]) {
      fail(`ratios.${k} null ama ratioNull nedeni yok — durust null sozlesmesi kirik`);
    }
  } else if (typeof v !== 'number' || !Number.isFinite(v)) {
    fail(`ratios.${k} sayi degil (${v})`);
  }
}
// duz-omuzlu sentetik: yaka cukuru yok -> null + neden (0 UYDURULMAZ), v1 kol nedeni sabit.
if (mA.ratios.neckDepthToLength !== null || (mA.ratioNull || {}).neckDepthToLength !== 'neck_dip_below_noise_floor') {
  fail(`duz omuz sentetigi yaka derinligi uydurdu (${mA.ratios.neckDepthToLength} / ${(mA.ratioNull || {}).neckDepthToLength})`);
}
if (mA.ratios.sleeveLenToGarment !== null || (mA.ratioNull || {}).sleeveLenToGarment !== 'sleeve_not_separable_from_silhouette_v1') {
  fail('sleeveLenToGarment v1 durust-null sozlesmesi kirik');
}

// ---- 0b) DETERMINIZM: ayni goruntu iki kosuda bayt-ayni JSON ----
const detA1 = JSON.stringify(measureGarment(makeDressImage({ bustW: 200, waistW: 160, hemW: 200, len: 440 })));
const detA2 = JSON.stringify(measureGarment(makeDressImage({ bustW: 200, waistW: 160, hemW: 200, len: 440 })));
if (detA1 !== detA2) fail('determinizm kirik: ayni sentetik goruntu iki kosuda farkli JSON');

// ---- 0c) POZITIF sentetik: askili + yaka cukurlu elbise, yeni alanlar olculur ----
// tasarim: L=400, omuz genisligi 200 (dis kenarlar), 2 ask? 12px, yaka cukuru 30px.
function makeStrapDressImage() {
  const pad = 40;
  const bustW = 200;
  const len = 400;
  const strapW = 12;
  const neckDrop = 30;
  const W = 320 + 2 * pad;
  const H = len + 2 * pad;
  const data = new Uint8ClampedArray(W * H * 4);
  for (let p = 0; p < W * H; p++) {
    data[p * 4] = 236; data[p * 4 + 1] = 229; data[p * 4 + 2] = 218; data[p * 4 + 3] = 255;
  }
  const cx = W / 2;
  const ink = (x, y) => {
    const o = (y * W + x) * 4;
    data[o] = 40; data[o + 1] = 45; data[o + 2] = 90; data[o + 3] = 255;
  };
  // straps: outer edges at +-bustW/2, rows pad..pad+neckDrop
  for (let y = 0; y < neckDrop; y++) {
    for (let dx = 0; dx < strapW; dx++) {
      ink(Math.round(cx - bustW / 2) + dx, pad + y);
      ink(Math.round(cx + bustW / 2) - dx, pad + y);
    }
  }
  // body: bust 200 -> waist 150 (40%) -> hem 260, filled
  const stops = [[0, bustW], [0.4, 150], [1, 260]];
  const widthAt = (f) => {
    for (let i = 1; i < stops.length; i++) {
      if (f <= stops[i][0]) {
        const [f0, w0] = stops[i - 1];
        const [f1, w1] = stops[i];
        return w0 + (w1 - w0) * ((f - f0) / (f1 - f0));
      }
    }
    return 260;
  };
  for (let y = neckDrop; y < len; y++) {
    const half = widthAt((y - neckDrop) / (len - neckDrop - 1)) / 2;
    for (let x = Math.round(cx - half); x <= Math.round(cx + half); x++) ink(x, pad + y);
  }
  return { data, width: W, height: H };
}
const mS = measureGarment(makeStrapDressImage());
if (!mS.ok) fail(`askili sentetik reddedildi (${mS.reason})`);
else {
  const rs = mS.ratios;
  // tasarim degerleri: neckDepth 30/400=0.075, neckWidth ~(200-2*12)/200=0.88, strap 12/200=0.06
  if (!(rs.neckDepthToLength >= 0.06 && rs.neckDepthToLength <= 0.09)) {
    fail(`askili sentetik yaka derinligi ${rs.neckDepthToLength}, tasarim 0.075 bandi (0.06-0.09) disi`);
  }
  if (!(rs.neckWidthToShoulder >= 0.8 && rs.neckWidthToShoulder <= 0.95)) {
    fail(`askili sentetik yaka/omuz ${rs.neckWidthToShoulder}, tasarim 0.88 bandi (0.8-0.95) disi`);
  }
  if (!(rs.strapWidthToShoulder >= 0.045 && rs.strapWidthToShoulder <= 0.075)) {
    fail(`askili sentetik aski/omuz ${rs.strapWidthToShoulder}, tasarim 0.06 bandi (0.045-0.075) disi`);
  }
}

// 1) OLCUM KAPISI: LLM'in ratios cevabi (anchor-echo 1.55) ASLA hayatta kalmaz.
const LLM_ECHO = { lengthToWidth: 1.55, hemToWaistWidth: 1.55 };
const seenA = { garment: 'dress', waistline: 'natural', skirtStyle: 'aLine', ratios: { ...LLM_ECHO } };
if (applyMeasuredRatios(seenA, mA) !== 'measured') fail('guvenilir olcum "measured" donmedi');
if (seenA.ratiosMeasured !== true) fail('olcum tanigi (ratiosMeasured) yazilmadi');
if (seenA.ratios.lengthToWidth === 1.55) fail('LLM echo (1.55) olcumun yerine gecti — kapi delik');
if (seenA.ratios !== mA.ratios) fail('seen.ratios olculen nesne degil — kaynak olcum olmali');

const seenB = { garment: 'dress', waistline: 'natural', skirtStyle: 'aLine', ratios: { ...LLM_ECHO } };
applyMeasuredRatios(seenB, mB);

// olcum reddedince: LLM sayilari CANLANMAZ, null'lanir; tuketiciler default.
const seenC = { garment: 'dress', waistline: 'natural', ratios: { ...LLM_ECHO } };
if (applyMeasuredRatios(seenC, { ok: false, confidence: 0.3, ratios: null }) !== 'standard') fail('red "standard" donmedi');
if (seenC.ratios !== null) fail('olcum reddetti ama LLM ratios yasiyor — enum-default yolu kirildi');
if (pickSkirtLengthMM(seenC, USER) !== 0) fail('olcumsuz seen mm uretti');
if (pickSkirtFullness(seenC) !== null) fail('olcumsuz seen fullness uretti');
// esik alti confidence: F2-vision (2026-09-01) BILINCLI GUNCELLEME. Eskiden
// 'standard' doner ve sayilar atilirdi; simdi 'belirsiz' doner — sayilar
// ETIKETLE tasinir (ratiosUncertain), ama KAPI AYNI KAPI: ratiosMeasured
// false kalir, hicbir tuketici belirsiz sayiyi drafta sokamaz (asagida
// dogrudan olculuyor). Kapi gevsetilmedi; sessiz atma, adli tasimaya dondu.
const seenLow = { garment: 'dress', ratios: null };
const lowDurum = applyMeasuredRatios(seenLow, { ok: true, confidence: MEASURE_MIN_CONFIDENCE - 0.01, ratios: { ...LLM_ECHO } });
if (lowDurum !== 'belirsiz') fail(`esik alti confidence 'belirsiz' donmedi (${lowDurum})`);
if (seenLow.ratiosMeasured !== false) fail('esik alti confidence olcum diye gecti (ratiosMeasured true)');
if (!seenLow.ratiosUncertain) fail('esik alti oranlar atildi — F2 belirsiz tasima kirik');
if (pickSkirtLengthMM(seenLow, USER) !== 0) fail('belirsiz oran mm uretti — draft kapisi delik');
if (pickSkirtFullness(seenLow) !== null) fail('belirsiz oran fullness uretti — draft kapisi delik');

// 2) YAPISAL YASAK: ratiosMeasured tanigi olmadan (ham LLM seen'i) tuketici yok.
const rawLLM = { garment: 'dress', waistline: 'natural', ratios: { lengthToWidth: 2.2, hemToWaistWidth: 2.2 } };
if (pickSkirtLengthMM(rawLLM, USER) !== 0) fail('tanik olmadan pickSkirtLengthMM mm uretti — LLM sayilari hala tuketiliyor');
if (pickSkirtFullness(rawLLM) !== null) fail('tanik olmadan pickSkirtFullness sinif uretti');

// 3) ROUND-TRIP 1: ayni foto + farkli govde -> farkli mm (mm govdeyi izler).
const mmA_demo = refreshSkirtLengthMM(0, seenA, DEMO, false);
const mmA_user = refreshSkirtLengthMM(0, seenA, USER, false);
if (!(mmA_demo > 0) || !(mmA_user > 0)) fail(`olculen fotodan mm cikmadi (demo ${mmA_demo}, user ${mmA_user})`);
if (mmA_demo === mmA_user) fail(`ayni foto farkli govdede AYNI mm (${mmA_demo}) — oran x govde kablosu olu`);

// 4) ROUND-TRIP 2: farkli L/W'li iki foto (ayni govde) -> farkli spec.
const mmB_user = refreshSkirtLengthMM(0, seenB, USER, false);
if (!(mmB_user > 0)) fail(`foto B'den mm cikmadi (${mmB_user})`);
if (mmA_user === mmB_user) fail(`farkli L/W'li iki foto AYNI mm (${mmA_user}) uretti`);
const fullA = pickSkirtFullness(seenA);
const fullB = pickSkirtFullness(seenB);
if (fullA !== 'straight') fail(`foto A fullness '${fullA}' — dar etek 'straight' beklenirdi`);
if (fullB !== 'gathered') fail(`foto B fullness '${fullB}' — genis etek 'gathered' beklenirdi`);
if (fullA === fullB) fail('farkli hem/bel oranli iki foto ayni fullness sinifina dustu');

// empire cift-sayim yasagi + skirt kapsam disi: contract bozulmadi.
if (pickSkirtLengthMM({ ...seenA, waistline: 'empire' }, USER) !== 0) fail('empire elbiseye mm verildi — lengthExtraMM cift sayim yasagi cignendi');
if (pickSkirtLengthMM({ ...seenA, garment: 'skirt' }, USER) !== 0) fail('skirt fotosuna bust-cizgili mm verildi');
// guvenlik bandi KAYNAKTA kelepceli (motor 250-1200 ile ayni dil): bant ustu
// olcum web'de sessiz clamp / API'de 422 diye IKI dile bolunmesin.
const bandSeen = (lw) => ({ garment: 'dress', waistline: 'natural', ratiosMeasured: true, ratios: { lengthToWidth: lw } });
if (pickSkirtLengthMM(bandSeen(5.9), USER) !== 1200) fail(`bant ustu mm 1200'e kelepcelenmedi (${pickSkirtLengthMM(bandSeen(5.9), USER)})`);
if (pickSkirtLengthMM(bandSeen(0.9), USER) !== 250) fail(`bant alti mm 250'ye kelepcelenmedi (${pickSkirtLengthMM(bandSeen(0.9), USER)})`);

// 5) FULLNESS TABLOSU deterministik: esik degerleri + yapisal veto.
const probe = (hw, extra = {}) =>
  pickSkirtFullness({ garment: 'dress', ratiosMeasured: true, ratios: { hemToWaistWidth: hw }, ...extra });
const TABLE_CASES = [
  [1.10, 'straight'], [1.50, 'straight'],
  [1.51, 'aLine'], [1.79, 'aLine'],
  [1.80, 'gathered'], [2.54, 'gathered'],
  [2.55, 'halfCircle'], [3.20, 'halfCircle'],
];
for (const [hw, want] of TABLE_CASES) {
  const got = probe(hw);
  if (got !== want) fail(`fullness tablosu: ${hw} -> '${got}', beklenen '${want}'`);
}
if (probe(5.5) !== null) fail('kontrat bandi (0.5-5) disi oran sinif uretti');
if (probe(0.4) !== null) fail('kontrat bandi alti oran sinif uretti');
if (probe(2.0, { garment: 'top' }) !== null) fail('top icin fullness uretildi (etek yok)');
if (probe(2.0, { skirtStyle: 'pleated' }) !== null) fail('pleated etiketi (yapisal okuma) oran tarafindan ezildi');
if (probe(2.0, { skirtStyle: 'gore' }) !== null) fail('gore etiketi (yapisal okuma) oran tarafindan ezildi');
if (SKIRT_FULLNESS_TABLE.length !== 4) fail('fullness tablosu 4 sinif olmali (mevcut enum siniri)');

// 6) KAYNAK MANDALI: DOM modulleri node'da kosulamiyor; en azindan kablolarin
// sokulmesi yakalanir (baglanti adlari degisirse bilincli guncellenir).
const createSrc = readFileSync(join(root, 'web/js/create.js'), 'utf8');
if (!/applyMeasuredRatios\(seen, measureGarment\(pixels\)\)/.test(createSrc)) {
  fail('create.js foto akisinda applyMeasuredRatios(seen, measureGarment(pixels)) yok — olcum kapisi sokulmus');
}
if (!/const fullness = pickSkirtFullness\(seen\)/.test(createSrc) ||
    !/if \(fullness\) spec\.skirtStyle = fullness/.test(createSrc)) {
  fail('create.js fullness kablosu (pickSkirtFullness -> spec.skirtStyle) yok');
}
if (!/ratiosMeasured: seen\.ratiosMeasured === true/.test(createSrc)) {
  fail('create.js spec.seen.ratiosMeasured tasimiyor — durust ibare kaynaksiz');
}
const analyzeSrc = readFileSync(join(root, 'web/js/analyze.js'), 'utf8');
if (!/getImageData\(/.test(analyzeSrc) || !/return \{ reading: parsed, pixels \}/.test(analyzeSrc)) {
  fail('analyze.js ayni canvas piksellerini dondurmuyor — olcum farkli goruntuden olur');
}
const renderSrc = readFileSync(join(root, 'web/js/render.js'), 'utf8');
if (!/ratiosMeasured/.test(renderSrc)) fail('render.js durust ibareyi basmiyor (ratiosMeasured okunmuyor)');
const i18nSrc = readFileSync(join(root, 'web/js/i18n.js'), 'utf8');
if (!/result\.proportions\.measured/.test(i18nSrc) || !/result\.proportions\.standard/.test(i18nSrc)) {
  fail('i18n measured/standard ibare anahtarlari eksik (EN+TR deseni)');
}

if (fails) { console.error(`\nphoto_ratio_wire_check FAILED (${fails})`); process.exit(1); }
console.log(
  `photo_ratio_wire_check GREEN: olcum kapisi tek kaynak (LLM echo olu), ` +
  `ayni foto farkli govde ${mmA_demo}->${mmA_user}mm, farkli L/W ${mmA_user} vs ${mmB_user}mm, ` +
  `fullness '${fullA}' vs '${fullB}', tablo+veto deterministik, kablolar takili`,
);
