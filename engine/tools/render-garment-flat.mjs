// render-garment-flat.mjs — the FINISHED-GARMENT flat technical sketch (the Etsy
// line-art hero on every pattern / collection page).
//
// IMPORTANT (the fix, 2026-07-17): a technical flat is NOT the pattern piece
// reflected. The pattern piece is a MANUFACTURING drawing (seam allowance, darts
// open, grainline, notches, cut-on-fold). The technical flat is the FINISHED
// garment as if worn on a body — darts closed, shoulder seam on top, a clean
// silhouette. You cannot get the flat by "mirror + union" of the drafted piece:
// for a SLEEVELESS garment the mirrored armhole curve reads as a fake long sleeve.
//
// So this renderer draws the flat PARAMETRICALLY FROM THE STYLE SPEC, never from
// the pieces. It reads the neckline / sleeve / shaping / skirt / length fields
// / skirtStyle / topLength / collar / placket / tie / gather / backOpening / closure
// and draws a clean finished-garment FRONT and BACK.
//
// Silhouette families (one parametric template each): TOP/SHELL, DRESS. Each is a
// single continuous outline drawn as the RIGHT half in cubic beziers, then mirrored
// with transform="scale(-1,1)" so it is perfectly symmetric. Interior design lines
// (darts, princess seams, button row, empire seam, zip, ties) overlay as separate
// thin <path>s. Stroke hierarchy: outer silhouette 2, interior 1, navy on white,
// round joins/caps.
//
// Exports renderGarmentFlat(pieces, spec). `pieces` is accepted for signature
// compatibility but NOT used to derive the outline — the flat is spec-driven.

// F-D FLAT KONVANSİYONU (2026-08-23) — bu kalem artık kendi sayısını TUTMUYOR.
// Croquis, ölçek, mürekkep ve çizgi sınıfları TEK KANUN dosyasından okunuyor:
// contract/flat-convention-v1.json. Kapı: engine/tests/flat_convention_check.mjs.
import { readFileSync } from 'node:fs';
const LAW = JSON.parse(readFileSync(new URL('../../contract/flat-convention-v1.json', import.meta.url), 'utf8'));
const CQ = LAW.croquis.landmarks;

// ---------------------------------------------------------------------------
// İFADE KAPISI / SİCİL (V4-B, 2026-08-24).
//
// ÖLÇÜLDÜ: bu kalem üç FARKLI kolu (düz set-in · raglan · puf) BAYT BAYT AYNI
// çiziyordu — 3495 bayt, sha 70cb9c7881ce0c0a — ve üç farklı yaka türünü de
// aynı şekilde (3509 bayt, sha b26b7091834573e7). Sebep kodda görünürdü: puf
// YALNIZCA sayısal kapak alanından okunuyordu, kolun kendi ADINDAN değil; raglan
// ise hiçbir dalın koşulu değildi, yani sessizce düz kola düşüyordu. Bu,
// CLAUDE.md'nin kendi emsalinin birebir tekrarı (*puf kol sessizce düşürüldü,
// 2026-07-18*) ve RULES invariant 1'in yasağı: desteklenmeyen değer sessizce
// düşürülemez/çökertilemez.
//
// İKİ AYRI OTORİTE VAR, KARIŞTIRILMAMALI — ÖLÇÜLDÜ. Bu kalem bir GÖSTERİM
// çizimidir (teknik flat) ve kanunu contract/flat-convention-v1.json'dur. Sicil
// (contract/, spec v2) ise KALIP motorunu (surfacepattern.cpp) tarif eder. Kolu
// sicile bakıp SİLMEK denendi ve flat_geometry_sellable_check S5/S6 kırmızıya
// döndü: o kapı, kollu stillerin kolu ÇİZMESİNİ ve croquis.sleeveLaw'ın ÖLÇÜLMÜŞ
// kanununa uymasını şart koşuyor. Silme GERİ ALINDI.
//
// O YÜZDEN SİCİL BURADA SUSTURMAZ, ADLANDIRIR: motorun kesemediği her değer SVG
// kökünde `data-engine-gap` olarak EKSİK OPERATÖRÜN ADIYLA duruyor. (Ad neden
// "pattern" değil: flat_convention_check'in yasak-boya süzgeci ham SVG metninde
// "pattern" arıyor — SVG'nin <pattern> dolgusu için — ve bir ÖZNİTELİK ADINDAKİ
// aynı harf dizisi onu ateşliyordu. Ölçüldü, ad değiştirildi; süzgece
// dokunulmadı.) Flat ile kalıbın anlaşmazlığı zaten ayrı bir kapının konusu
// (flat_pattern_agree_check, bu gece devralınan kırmızı); damga onu sessiz
// olmaktan çıkarır.
//
// SESSİZ ÇÖKERTME ise ASIL AŞAĞIDA onarıldı: puf artık kolun ADINDAN da
// tetikleniyor ve raglan kendi TOPOLOJİK dikişini çiziyor.
// Kapı: engine/tests/flat_expresses_spec_check.mjs.
const SICIL = JSON.parse(readFileSync(new URL('../../contract/garment-spec-v2.json', import.meta.url), 'utf8'));

// ---------------------------------------------------------------------------
// KOL DEĞER ALANI ELLE YAZILMAZ — TÜRETİLİR (V4-E, 2026-08-24).
//
// V4-B'de burada elle yazılmış bir tablo duruyordu (`{none, set, setIn, puff,
// cap}`) ve bağımsız hakem onu ÖLÇTÜ: tablo, fiilen KULLANILAN değerleri hiç
// içermiyordu. Tracked JSON'larda sayılan gerçek kullanım
//     straight 237 · none 140 · balloon 35 · cap 29   (raglan/puff/set: 0)
// yani `balloon` (35 kullanım) sessizce DÜZ kola düşüyordu — CLAUDE.md'nin
// emsalinin (puf kol sessizce düşürüldü, 2026-07-18) ve RULES invariant 1'in
// birebir ihlali, hem de en çok kullanılan yolda.
//
// Artık üç KAYNAK okunuyor, hiçbir liste elle yazılmıyor:
//   engine/vocab.json fields.<kol>           -> kapalı enum + BEYANLI eşanlamlar
//   contract/spec-grammar.json slots.sleeve  -> gramerin kabul ettiği değerler
//   contract/spec-v1-v2-map.json axes.*      -> v1 değeri -> v2 sicil değeri
// Çizim dalı da elle eşlenmiyor: değer önce KANONİK'e (vocab), sonra v2 sicil
// değerine (harita) çözülüyor ve dal SİCİLİN KAPALI ENUM'una göre seçiliyor.
// Sicile yeni bir kol değeri girerse dalı olmayan değer sessizce düz kola
// düşemez; kapı onu adıyla UNEXPRESSED sayar.
const VOCAB = JSON.parse(readFileSync(new URL('../vocab.json', import.meta.url), 'utf8'));
// Alan adları TEK YERDE. Hem bu katman hem aşağıdaki çizim dalları bunları
// kullanır; ad iki yerde elle yazılırsa biri kayar ve kimse fark etmez.
// V4-E: alan ADLARI da elle yazilmiyor. engine/vocab.json her alani bir enum
// TIPINE bagliyor (asagida okunuyor); ad o tipten bulunur, boylece kapali
// enumun adi tek kaynakta kalir.
const fieldOf = (enumType) => {
  const k = Object.keys(VOCAB.fields).find((f) => VOCAB.fields[f].enum === enumType);
  if (!k) throw new Error(`engine/vocab.json icinde ${enumType} tipli alan YOK`);
  return k;
};
const SLEEVE_FIELD = fieldOf('SleeveStyle');
const COLLAR_FIELD = fieldOf('CollarType');
const SHOULDER_FIELD = fieldOf('ShoulderStyle');
const GRAMMAR = JSON.parse(readFileSync(new URL('../../contract/spec-grammar.json', import.meta.url), 'utf8'));
const V1V2 = JSON.parse(readFileSync(new URL('../../contract/spec-v1-v2-map.json', import.meta.url), 'utf8'));

const SLEEVE_ENUM = VOCAB.fields[SLEEVE_FIELD];                       // {values, synonyms}
const SLEEVE_SYNONYM = SLEEVE_ENUM.synonyms || {};                    // puff->balloon, bishop->balloon, ...
const GRAMMAR_SLEEVE = Object.keys(GRAMMAR.slots.sleeve.values || {}); // none, straight, balloon, cap

// v1 yazımı -> v2 sicil değeri (`sleeve.setIn` -> `setIn`). İki eksen de okunur:
// kol ekseni (straight/balloon) ve `sleeveHead` (capped -> cap).
const V1_TO_V2_SLEEVE = {};
for (const ax of [SLEEVE_FIELD, 'sleeveHead']) {
  const vals = ((V1V2.axes || {})[ax] || {}).values || {};
  for (const [k, v] of Object.entries(vals)) {
    if (v && typeof v.v2 === 'string' && v.v2.startsWith('sleeve.')) V1_TO_V2_SLEEVE[k] = v.v2.slice('sleeve.'.length);
  }
}

// Eşanlam çöz + kanonik değeri döndür. Hiçbir kaynakta yoksa null = BİLİNMEYEN
// (en yakın komşuya düşürmek sicilin 2. yasasının yasakladığı şey).
export function canonicalSleeve(raw) {
  if (raw === undefined || raw === null || raw === '') return 'none';
  const s = String(raw);
  const c = SLEEVE_SYNONYM[s] || s;
  if (SLEEVE_ENUM.values.includes(c) || GRAMMAR_SLEEVE.includes(c)) return c;
  return null;
}
// Kanonik değer -> v2 sicil değeri. Harita sussa bile sicilin kendi enum'unda
// aynı adla duruyorsa kimlik eşlemesi geçerlidir (ör. `cap`).
export function sleeveV2(raw) {
  const c = canonicalSleeve(raw);
  if (c === null) return undefined;
  if (V1_TO_V2_SLEEVE[c]) return V1_TO_V2_SLEEVE[c];
  return ((SICIL.topology.sleeve || {}).values || {})[c] ? c : undefined;
}
// SİCİLİN KAPALI ENUM'U -> çizim dalı. Anahtarlar sicilden gelir, uydurulmaz.
const V2_BRANCH = { none: 'none', setIn: 'plain', puff: 'puff', cap: 'cap' };
export const sleeveBranch = (spec) => {
  const v2 = sleeveV2(spec.sleeve !== undefined ? spec.sleeve : spec[SLEEVE_FIELD]);
  return v2 === undefined ? 'unknown' : (V2_BRANCH[v2] || 'unknown');
};
// Yaka türü SAYIDIR (0 = yaka yok). Sayıdan sicil DEĞERİNE bir eşleme YAZILMADI:
// kalemin kodu yalnızca "4 -> peter-pan yaprağı, diğerleri -> bant" diyor, hangi
// sayının hangi yaka ailesi olduğunu söyleyen KAYNAK YOK ve uydurmak yasak.
// Gerek de yok: sicildeki yaka değerlerinin HEPSİ aynı `collarFamily`
// operatörüne bağlı, yani sıfırdan farklı her yaka aynı boşluğu taşıyor.
const COLLAR_OPERATOR = 'collarFamily';

const opStatus = (op) => (SICIL.operators[op] || {}).status || 'absent';

// Bir eksen değeri ifade edilebilir mi? Sicilin 3. yasası, birebir.
export function expressibility(axis, value) {
  const ax = SICIL.topology[axis];
  const entry = ax && ax.values ? ax.values[value] : undefined;
  if (!entry) return { ok: false, unknown: true, missing: [] };
  const missing = (entry.requires || []).filter((op) => opStatus(op) !== 'shipped');
  return { ok: missing.length === 0, unknown: false, missing };
}

// Motorun kesemediği kalemleri ADIYLA topla.
export function refusals(spec) {
  const out = [];
  const raw = spec.sleeve || spec[SLEEVE_FIELD];
  if (raw !== undefined && raw !== null && raw !== '' && raw !== 'none') {
    const v = sleeveV2(raw);
    const e = v === undefined ? { ok: false, unknown: true, missing: [] } : expressibility('sleeve', v);
    if (!e.ok) out.push({ field: SLEEVE_FIELD, value: String(raw), reason: e.unknown ? 'unknown' : 'operator-absent', missing: e.missing });
  }
  const ct = spec[COLLAR_FIELD];
  if (ct && opStatus(COLLAR_OPERATOR) !== 'shipped') {
    out.push({ field: COLLAR_FIELD, value: String(ct), reason: 'operator-absent', missing: [COLLAR_OPERATOR] });
  }
  // OMUZ EKSENİ (V4-E). engine/vocab.json omuz için kapalı bir enum ilan ediyor
  // (set · dropped · raglan) ama v2 sicilinin `shoulder` ekseninde yalnız
  // {strapless, shoulderSeam} var ve contract/spec-v1-v2-map.json'da bu eksen
  // HİÇ YOK — yani sicil bu üç değerin üçünü de kesemez. Damgasız bırakmak,
  // `dropped`ın sessizce `set` gibi çizilmesini gizlerdi.
  const sh = spec[SHOULDER_FIELD];
  if (sh !== undefined && sh !== null && sh !== '') {
    const known = ((SICIL.topology.shoulder || {}).values || {})[sh];
    if (!known) out.push({ field: SHOULDER_FIELD, value: String(sh), reason: 'unknown', missing: [] });
  }
  return out;
}

// data-engine-gap BİÇİMİ (kapı bunu ayrıştırır): "alan=deger:operator+operator",
// virgülle ayrılmış. Sicilde hiç olmayan değerde operatör yerine "unknown".
const refusalStamp = (spec) => refusals(spec)
  .map((r) => `${r.field}=${r.value}:${r.missing.length ? r.missing.join('+') : r.reason}`)
  .join(',');

const NAVY = LAW.ink.color;
// TEK MÜREKKEP (F-D): hiyerarşi RENKLE değil AĞIRLIK + KESİKLE kurulur. Eski
// ikinci renk (#5c7aa0) hiyerarşiyi renge kaçırıyordu — teknik flat kanunu bunu
// kabul etmez. Sabit korunuyor ki çağrı yerleri okunur kalsın; değeri tek mürekkep.
const SEAM = NAVY;

// F2 çizgi hiyerarşisi (gusto-corpus line_hierarchy 3 katman) + F-D'nin iki yeni
// sınıfı: topstitch KESİK, gizli hat NOKTALI. Değerler kanundan.
const W_OUTLINE = LAW.lineClasses.classes.outline.width;
const W_SEAM = LAW.lineClasses.classes.seam.width;
const W_MARK = LAW.lineClasses.classes.mark.width;
const D_TOPSTITCH = LAW.lineClasses.classes.topstitch.dash;
const D_HIDDEN = LAW.lineClasses.classes.hidden.dash;
const W_TOPSTITCH = LAW.lineClasses.classes.topstitch.width;
const W_HIDDEN = LAW.lineClasses.classes.hidden.width;

const svgDoc = (w, h, inner, refused = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" ` +
  `width="100%" role="img" data-scale="${LAW.scale.declared}" data-unit-mm="${LAW.scale.unitMM}" ` +
  `data-croquis="${LAW.croquis.id}" data-ref-size="${LAW.referenceBody.size}"` +
  (refused ? ` data-engine-gap="${refused}"` : '') + `>` +
  `<rect width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${LAW.ink.paper}"/>${inner}</svg>`;

const n = (v) => (Math.round(v * 10) / 10).toFixed(1);

// ---------------------------------------------------------------------------
// PORT: Damla kalem dili — REFERANS KALEM'den (engine/flat-engine/_engine-full.mjs)
// alınan taper mürekkep + deterministik drape planı. Şematik düz çizgi yerine
// el-çizimi karakteri: kıvrımlar taper'la kalınlaşıp incelir, drape planı ana
// sırt (köşeye giden) + sönen ikincil kıvrımları asimetrik dağıtır.
// ---------------------------------------------------------------------------
// deterministik gürültü (aynı seed = aynı çizim; MIHENK-01 randomluk dersi)
function rng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// cubic bezier noktası
function cubicPt(s, t) {
  const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * s[0] + b * s[2] + c * s[4] + d * s[6], a * s[1] + b * s[3] + c * s[5] + d * s[7]];
}
function samplePts(p0, c1, c2, p1, m) {
  const s = [p0[0], p0[1], c1[0], c1[1], c2[0], c2[1], p1[0], p1[1]], out = [];
  for (let i = 0; i <= m; i++) out.push(cubicPt(s, i / m));
  return out;
}
// TAPER: bir nokta dizisini, ortası kalın uçları sivri kapalı bir mürekkep
// şeridine çevirir (REFERANS KALEM'deki taper ile aynı matematik). bias eğrisi
// kalınlığın nasıl doğup söndüğünü ayarlar.
function taperInk(pts, maxw, bias, color) {
  const L = pts.length, a = [], b = [];
  for (let i = 0; i < L; i++) {
    const t = L > 1 ? i / (L - 1) : 0.5;
    const q = pts[Math.min(i + 1, L - 1)], r = pts[Math.max(i - 1, 0)];
    const dx = q[0] - r[0], dy = q[1] - r[1], d = Math.hypot(dx, dy) || 1;
    const w = maxw * 0.5 * Math.pow(Math.sin(Math.PI * Math.min(Math.max(t, 0.002), 0.998)), bias || 0.5);
    a.push([pts[i][0] - dy / d * w, pts[i][1] + dx / d * w]);
    b.push([pts[i][0] + dy / d * w, pts[i][1] - dx / d * w]);
  }
  let s = `M ${n(a[0][0])} ${n(a[0][1])}`;
  for (let i = 1; i < L; i++) s += ` L ${n(a[i][0])} ${n(a[i][1])}`;
  for (let i = L - 1; i >= 0; i--) s += ` L ${n(b[i][0])} ${n(b[i][1])}`;
  return `<path d="${s} Z" fill="${color || NAVY}" stroke="none"/>`;
}
// DRAPE PLANI: n kıvrım, ana sırt (köşeye giden, prim) + sönen ikincil.
// REFERANS KALEM drapePlan mantığı: ink rejimi kıvrım sayısını verir, deterministik
// jitter yerlerini dağıtır, orta ön temiz kalır.
function drapePlan(seed, ink, foldCount, drape) {
  const rnd = rng(seed);
  const cnt = ink === 'minimal' ? 2 : ink === 'orta' ? 3 : Math.max(2, Math.round((foldCount || 10) / 2));
  const R = [], CORE = 0.20;
  for (let i = 0; i < cnt; i++) {
    const prim = i % 2 === 0, base = (i + 0.65) / (cnt + 0.25);
    const u = Math.min(0.96, Math.max(0.04, base + (rnd() - 0.5) * 0.8 / cnt));
    R.push({ u: CORE + (1 - CORE) * u, prim,
      swing: prim ? 0.55 + rnd() * 0.45 : 0.15 + rnd() * 0.30,
      birth: prim ? rnd() * 0.05 : (0.14 + rnd() * 0.30) * (drape || 1),
      die: prim ? 1 : 0.40 + rnd() * 0.35,
      sway: (rnd() - 0.5) * 0.45 });
  }
  R.sort((a, b) => a.u - b.u);
  R[R.length - 1].prim = true; R[0].prim = false; // orta ön temiz
  if (ink === 'minimal') R.forEach((r) => { r.prim = true; });
  return R;
}

// ---------------------------------------------------------------------------
// CIRCLE-SKIRT FLAT LANGUAGE (full-circle primitive). The pattern foot already
// drafts halfCirclePanel (skirt.cpp) for skirtStyle 'halfCircle'/'fullCircle';
// the flat foot used to drop these to the aLine fallback (flare 1.58) so a
// circle skirt read as a plain A-line. Here we resolve every circle-skirt name
// to ONE path so the drawing shows the true wide radial sweep + wavy hem.
//   full circle  = cut from two half-circles → widest fullness (waist × 2.6)
//   half circle  = one/two quarter panels    → wide but less (waist × 2.1)
// Names are unified: circle / full / fullCircle → full; halfCircle → half.
// (matches beyondEngine "full circle etek" wording and the halfCircle spec.)
function circleSkirt(skirtStyle) {
  const st = String(skirtStyle || '').toLowerCase();
  if (st === 'fullcircle' || st === 'full' || st === 'circle') return 'full';
  if (st === 'halfcircle') return 'half';
  return null;                                   // not a circle skirt
}
function circleFlare(kind) {                      // hemHalf multiplier vs waistW
  return kind === 'full' ? 2.6 : kind === 'half' ? 2.1 : null;
}

// ---------------------------------------------------------------------------
// Body proportions for the flat (illustration units, NOT mm — this is a fashion
// drawing, not the pattern). x=0 is center front/back; y grows downward from the
// shoulder line. We draw the RIGHT half (positive x) and mirror it.
// ---------------------------------------------------------------------------
// TEK CROQUIS (F-D). Bütün stiller bu tek manken işaretlerinden çıkar. Sayılar
// contract/flat-convention-v1.json'dan; chestW/waistW/hipW KAYNAKLI EU38 beden
// çizelgesinden çözüldü (çevre/4, düz serili tüp geometrisi), gerisi AÇIK ilan
// edildi. Buraya elle sayı yazılmaz.
const U = {
  shoulderW: CQ.shoulderTipX.u,   // half shoulder width (shoulder tip x)
  neckBase: CQ.neckBase.u,        // half neck width at a crew/round base
  chestW: CQ.chestX.u,            // half chest / bust width  = bustCM*10/4/unitMM
  waistW: CQ.waistX.u,            // half waist width         = waistCM*10/4/unitMM
  hipW: CQ.hipX.u,                // half hip width           = hipCM*10/4/unitMM
  shoulderY: 0,                   // shoulder line
  neckDrop: CQ.neckDrop.u,        // shoulder-neck point below the shoulder line
  chestY: CQ.chestY.u,            // underarm / bottom of armhole (göğüs hattı)
  waistY: CQ.waistY.u,            // natural (body) waist line
  slope: CQ.shoulderSlope.value,  // shoulder seam slope dy/dx
  // OMUZ UCU YÜKSEKLİĞİ CROQUIS SABİTİDİR. Eskiden yakanın genişliğine bağlıydı
  // (shoulderNeckY + (tipX - nHalf)*slope) → her yakada başka bir omuz ucu, yani
  // her stil başka bir mankenden çıkıyordu. Ölçüldü: 12.30u … 19.40u = 21.30 mm
  // sapma (GECE/log/F-D.gate.before.txt). Artık yakadan BAĞIMSIZ: eğim boyun
  // TABANINDAN ölçülür, yakanın kendisinden değil.
  shoulderTipY: CQ.shoulderTipY.u,
};

// F-E YAN DİKİŞ ŞEKİL KANUNU + KOL KANUNU — ikisi de contract'tan, burada sayı yok.
const SSP = LAW.croquis.sideSeamProfile;
const SLAW = LAW.croquis.sleeveLaw;

// Resolve the finished-garment geometry from the spec into numbers the templates
// use. Everything is in illustration units.
function geom(spec) {
  const kindOf = spec.garment || 'top';
  const isDress = kindOf === 'dress';

  // --- body length (shoulder -> hem) -------------------------------------
  // top/shell lengths, then dress skirt length adds on below the waist.
  const topLen = spec.topLength || 'hip';
  const bodyToWaist = U.waistY;            // croquis: shoulder -> natural (body) waist
  const empire = spec.waistline === 'empire';
  const waistY = empire ? bodyToWaist * 0.66 : bodyToWaist;

  // waist width depends on shaping (aşağıda da lazım, bu yüzden YUKARI taşındı):
  // fitted/princess/empire bodice belde daralır, salkım shift daralmaz.
  const fitted0 = spec.shaping === 'princess' || spec.shaping === 'darts' || empire;
  const waistW0 = fitted0 ? U.waistW : U.chestW - 6;

  let hemY, hemHalf;
  if (isDress) {
    const skLen = spec.skirtLength || 'midi';
    const skDrop = skLen === 'mini' ? 150 : skLen === 'midi' ? 250 : skLen === 'maxi' ? 360 : 190;
    hemY = waistY + skDrop;
    const st = spec.skirtStyle || 'aLine';
    const circle = circleSkirt(st);              // full / half / null
    const flare = circle ? circleFlare(circle)   // real circle-skirt sweep
      : st === 'straight' ? 1.12 : st === 'gathered' ? 1.9 : 1.58;   // aLine default
    hemHalf = U.waistW * flare;
  } else {
    // a top / shell / blouse / tunic ends at hip / waist / tunic length.
    const drop = topLen === 'crop' ? 24 : topLen === 'waist' ? 0
      : topLen === 'tunic' ? 120 : 56;     // hip default
    hemY = waistY + drop;
    // F-E KÖK DÜZELTMESİ (Damla kusur 3 "bel yok" + kusur 4 "etek ucu kavisi
    // abartılı" — TEK kök sebep). ESKİ: hemHalf = hipW*0.98 = 76.75u, hem boydan
    // BAĞIMSIZ hem de göğüsten (73.33u) GENİŞ. Bel doğru daralıyordu ama hemen
    // ardından kalçaya açıldığı için bel okunmuyordu; crop boyda o açılma 24
    // birime sıkışıp kâse kavisi üretiyordu.
    // YENİ: etek yarı-genişliği BELDEN, ölçülmüş yan-dikiş eğimiyle türer
    // (contract sideSeamProfile.hemRisePerU — Buğra Locket EU38 arka bedeninden).
    // Tavan hâlâ kalça: gövde kalçanın altına inince ondan dar olamaz.
    const ceiling = spec.shaping === 'princess' ? U.hipW * 1.02 : U.hipW * 0.98;
    hemHalf = Math.min(ceiling, waistW0 + drop * SSP.hemRisePerU);
  }

  // --- neckline (half width, depth of the dip below the neck base) --------
  const neck = necklineGeom(spec.neckline || 'crew');

  // --- sleeve ------------------------------------------------------------
  const hasSleeve = spec[SLEEVE_FIELD] && spec[SLEEVE_FIELD] !== 'none';

  const fitted = fitted0, waistW = waistW0;          // yukarıda çözüldü (F-E)

  // Bust apex (göğüs noktası): the anatomical landmark a princess seam passes
  // THROUGH. Height between shoulder and waist (bustHeight 0..1, default 0.42 of
  // the shoulder->waist span, flat-engine styles.json bustHeight~0.3-0.4); half-x
  // sits between neck and chest edge (~0.55 of chest half). A real princess seam
  // runs armhole -> apex -> waist as an S; without the apex it reads as a random
  // bracket bulge (MIHENK-01 taste-lexicon "parantez çizgi").
  const bustFrac = typeof spec.bustHeight === 'number' ? (0.30 + spec.bustHeight * 0.30) : 0.42;
  const apexY = waistY * bustFrac;
  const apexHalfX = U.chestW * 0.55;

  return {
    isDress, empire, waistY, hemY, hemHalf, neck, hasSleeve, apexY, apexHalfX,
    shoulderTipY: U.shoulderTipY, chestY: U.chestY,
    shoulderW: U.shoulderW, neckBase: U.neckBase, chestW: U.chestW,
    waistW, shoulderY: U.shoulderY, neckDrop: U.neckDrop,
  };
}

// neckline shape: how wide the half-neck opening is, how deep it dips at CF, and a
// `kind` tag so we can draw the correct curve (U scoop, V vNeck, square, boat line,
// sweetheart, cowl, off-shoulder).
function necklineGeom(kind) {
  switch (kind) {
    case 'scoop':      return { kind, half: 40, depth: 40 };
    case 'vNeck':      return { kind, half: 30, depth: 66 };
    case 'square':     return { kind, half: 34, depth: 40 };
    case 'boat':       return { kind, half: 52, depth: 12 };
    case 'sweetheart': return { kind, half: 40, depth: 44 };
    case 'halter':     return { kind, half: 18, depth: 64 };
    case 'cowl':       return { kind, half: 36, depth: 50 };
    case 'offShoulder':return { kind, half: 62, depth: 20 };
    case 'crew':
    default:           return { kind: 'crew', half: 30, depth: 22 };
  }
}

// ---------------------------------------------------------------------------
// Right-half outline as cubic beziers. Returns the SVG path `d` for ONE half:
// from the CF neckline point, up/out along the neckline to the shoulder-neck
// point, out the shoulder to the shoulder tip, down the armhole, down the side
// seam (through waist) to the hem, then in along the hem to CF, closing up the
// center line. The mirror is applied by the caller via transform="scale(-1,1)".
//
// `view` = 'front' | 'back'. Back necklines sit higher (shallower) than front.
// ---------------------------------------------------------------------------
function halfOutline(g, view) {
  const { neck } = g;
  const isBack = view === 'back';
  // back neck is shallow regardless of the front style (a real garment's back
  // neck is a small scoop) EXCEPT wide styles (boat/offShoulder) stay wide.
  const wide = neck.kind === 'boat' || neck.kind === 'offShoulder';
  const nHalf = neck.half;
  // back neck always sits shallower than the front of the same style: a small
  // scoop about a third of the front depth (clamped), so front/back read as
  // clearly different pieces, not mirror copies. Wide boat/off-shoulder stay wide.
  const nDepth = isBack ? (wide ? Math.min(neck.depth, 14) : Math.max(10, Math.min(neck.depth * 0.35, 18))) : neck.depth;
  const cfY = nDepth;                         // CF neckline point y
  const shoulderNeckX = nHalf;
  const shoulderNeckY = g.shoulderY + g.neckDrop;
  const shoulderTipX = g.shoulderW;
  // real garment shoulder slopes DOWN from neck point to tip (~22deg). Tip must
  // sit clearly BELOW the shoulder-neck point so the seam reads as a natural
  // sloping shoulder, never an upward "smile" that sags at center.
  // CROQUIS SABİTİ — yakadan bağımsız (F-D). Bkz. U.shoulderTipY yorumu.
  const shoulderTipY = U.shoulderTipY;
  const armDeepY = U.chestY;                    // underarm / bottom of armhole
  const chestX = g.chestW;
  const waistX = g.waistW;
  const hemX = g.hemHalf;

  const underX = chestX;
  const dip = g.isDress ? 10 : 4;

  // Build the right-half boundary as an ordered SEGMENT list, from the CF neck
  // point (0,cfY) down to the CF hem point (0, hemY+dip). NO center-line edge —
  // the caller stitches this to its mirror so the CF join is invisible (there is
  // no fake center-front seam stroked down the garment).
  const segs = [];
  // neckline CF -> shoulder-neck point
  segs.push(...necklineSegs(neck.kind, isBack, nHalf, cfY, shoulderNeckX, shoulderNeckY));
  // shoulder seam (neck point -> shoulder tip)
  segs.push({ t: 'L', p: [[shoulderTipX, shoulderTipY]] });
  // armhole: shoulder tip -> underarm.
  // F-E KÖK DÜZELTMESİ (Damla kusur 1 "kollar gövdeden KOPUK"). ESKİ ikinci
  // kontrol noktası [underX + 12, ...] = 85.33u idi; kübik oradan beslenince
  // eğri 80u'ya kadar şişip OMUZ UCUNUN (78u, artık 70.18u) DIŞINA taşıyordu.
  // Kollu bir flat'te bu, gövde konturunun kolun içinden dışarı sızıp ikinci bir
  // çizgi gibi okunması demek — kolun gövdeye değmediği hissi tam olarak buydu.
  // Kol oyuğu İÇBÜKEYDİR: omuz ucundan koltukaltına x MONOTON AZALIR, hiçbir
  // noktası omuz ucundan dışarı çıkamaz (contract sleeveLaw.armholeNeverWiderThanShoulder).
  // İki kontrol de [shoulderTipX .. underX] aralığında tutulur.
  const scyeC1X = shoulderTipX;                              // omuz ucundan dik iniş
  const scyeC2X = Math.min(shoulderTipX, underX) * 0.94;     // İÇE oyulur (içbükey scye)
  segs.push({ t: 'C', p: [[scyeC1X, shoulderTipY + 26], [scyeC2X, armDeepY - 26], [underX, armDeepY]] });
  // side seam: underarm -> waist. Ease INTO the waist (control point stays near
  // waistX, not pulled sharply in) so the bust-to-waist curve reads as a soft
  // taper, never a hard hourglass corner that snaps in then out at the seam.
  segs.push({ t: 'C', p: [[underX - 2, g.waistY - 46], [waistX, g.waistY - 22], [waistX, g.waistY]] });
  if (g.isDress) {
    // skirt: leave the waist ALONG the waist tangent (control near waistX) then
    // sweep OUT to the hem so the skirt visibly flares/A-lines away from the body
    // instead of dropping as a straight tube. Deeper outward control = real flare.
    segs.push({ t: 'C', p: [[waistX + (hemX - waistX) * 0.12, g.waistY + (g.hemY - g.waistY) * 0.28],
                            [hemX - (hemX - waistX) * 0.28, g.hemY - (g.hemY - g.waistY) * 0.14], [hemX, g.hemY]] });
  } else {
    segs.push({ t: 'C', p: [[waistX + 6, g.waistY + (g.hemY - g.waistY) * 0.4], [hemX, g.hemY - 12], [hemX, g.hemY]] });
  }
  // hem: hem point in to the CF hem point (with a slight worn-hang dip at center)
  segs.push({ t: 'Q', p: [[hemX * 0.5, g.hemY + dip], [0, g.hemY + dip]] });
  return { segs, cfNeckY: cfY, cfHemY: g.hemY + dip };
}

// A right-half segment list -> a single closed full outline path `d`. The right
// half runs CF-neck -> ... -> CF-hem; we then walk it BACKWARD mirrored (x -> -x)
// from CF-hem up to CF-neck, closing the loop. Result: one continuous silhouette
// with no interior center line.
function fullOutlinePath(half) {
  const { segs, cfNeckY, cfHemY } = half;
  let d = `M 0 ${n(cfNeckY)} `;
  for (const s of segs) {
    if (s.t === 'L') d += `L ${n(s.p[0][0])} ${n(s.p[0][1])} `;
    else if (s.t === 'Q') d += `Q ${n(s.p[0][0])} ${n(s.p[0][1])} ${n(s.p[1][0])} ${n(s.p[1][1])} `;
    else if (s.t === 'C') d += `C ${n(s.p[0][0])} ${n(s.p[0][1])} ${n(s.p[1][0])} ${n(s.p[1][1])} ${n(s.p[2][0])} ${n(s.p[2][1])} `;
  }
  // now at CF-hem (0, cfHemY); walk the mirror backward up to CF-neck.
  // a segment from A -> B with controls c1,c2 becomes, reversed & mirrored,
  // B' -> A' with controls c2',c1' (all x negated).
  const mx = (pt) => [-pt[0], pt[1]];
  // reconstruct start points to reverse cleanly: track the running "from" point.
  const pts = [[0, cfNeckY]];
  for (const s of segs) pts.push(s.p[s.p.length - 1]);
  for (let i = segs.length - 1; i >= 0; i--) {
    const s = segs[i];
    const from = pts[i];              // mirror target (we END here going backward)
    const to = mx(from);
    if (s.t === 'L') d += `L ${n(to[0])} ${n(to[1])} `;
    else if (s.t === 'Q') {
      const c = mx(s.p[0]);
      d += `Q ${n(c[0])} ${n(c[1])} ${n(to[0])} ${n(to[1])} `;
    } else if (s.t === 'C') {
      const c2 = mx(s.p[1]), c1 = mx(s.p[0]);
      d += `C ${n(c2[0])} ${n(c2[1])} ${n(c1[0])} ${n(c1[1])} ${n(to[0])} ${n(to[1])} `;
    }
  }
  d += 'Z';
  return d;
}

// neckline as a segment list (CF point -> shoulder-neck point).
function necklineSegs(kind, isBack, nHalf, cfY, snX, snY) {
  if (isBack) {
    return [{ t: 'C', p: [[nHalf * 0.35, cfY], [nHalf * 0.7, snY + (cfY - snY) * 0.4], [snX, snY]] }];
  }
  switch (kind) {
    case 'vNeck':
      return [{ t: 'L', p: [[snX, snY]] }];
    case 'square':
      return [{ t: 'L', p: [[nHalf, cfY]] }, { t: 'L', p: [[snX, snY]] }];
    case 'boat':
    case 'offShoulder':
      // gentle near-horizontal boat line; control sits just BELOW cfY so the
      // line never bows upward into a smile between the two shoulder points.
      return [{ t: 'Q', p: [[nHalf * 0.55, cfY + 3], [snX, snY]] }];
    case 'sweetheart':
      return [{ t: 'C', p: [[nHalf * 0.22, cfY - 20], [nHalf * 0.6, cfY - 6], [nHalf * 0.66, cfY - 16]] },
              { t: 'C', p: [[nHalf * 0.8, snY + (cfY - snY) * 0.3], [snX, snY + 6], [snX, snY]] }];
    case 'halter':
      return [{ t: 'C', p: [[nHalf * 0.6, cfY - 6], [snX, snY + 24], [snX, snY]] }];
    case 'scoop':
    case 'cowl':
    case 'crew':
    default:
      return [{ t: 'C', p: [[nHalf * 0.28, cfY], [snX, snY + (cfY - snY) * 0.55], [snX, snY]] }];
  }
}

// ---------------------------------------------------------------------------
// Sleeve: an ACTUAL sleeve shape attached at the shoulder, drawn only when the
// spec HAS a sleeve. Sleeveless -> nothing (the clean armhole in halfOutline is
// the whole story). Right-half only; mirrored by the caller.
// ---------------------------------------------------------------------------
function sleeveHalf(g, spec) {
  if (!g.hasSleeve) return '';
  // MUST match the sloped shoulder tip used in halfOutline, or the sleeve cap
  // detaches from the body and reads as an outward kink/ear. Same formula.
  const shoulderNeckY = g.shoulderY + g.neckDrop;
  const shoulderTipX = g.shoulderW;
  const shoulderTipY = U.shoulderTipY;          // CROQUIS SABİTİ (F-D)
  // F-E: koltukaltı ARTIK CROQUIS'TEN. Eskiden `underY = 92` elle yazılıydı ve
  // U.chestY ile aynı sayı olması TESADÜFTÜ — croquis değişse kol gövdeden
  // kopardı (contract sleeveLaw.sleeveSharesArmholeEndpoints).
  const underX = g.chestW, underY = U.chestY;
  const style = spec[SLEEVE_FIELD];
  const len = spec.sleeveLength || 'short';
  // V4-B KÖK DÜZELTMESİ. ÖLÇÜLDÜ: puf kol ile düz set-in kol BAYT BAYT aynı flat
  // üretiyordu (3495 bayt, sha 70cb9c7881ce0c0a). Sebep tam burasıydı — puf
  // YALNIZCA yukarıdaki sayısal kapak alanından okunuyordu, kolun kendi ADINDAN
  // değil. Yani "puf kol istiyorum" diyen spec sessizce düz kol alıyordu:
  // CLAUDE.md'nin emsalinin birebir tekrarı ve RULES invariant 1'in yasağı.
  // Çizim tarafı zaten DOĞRUYDU ve contract croquis.sleeveLaw'ın ÖLÇÜLMÜŞ
  // kanununu (puffHemOverWidestMax 0.9327, Buğra Locket EU38 Alt Kol) uyguluyor
  // — eksik olan tek şey bu dalın adla da tetiklenmesiydi. Yeni sayı YOK.
  //
  // V4-E: dal artık ADDAN DEĞİL, TÜRETİLMİŞ SİCİL DEĞERİNDEN seçiliyor
  // (sleeveBranch: vocab eşanlamları -> kanonik -> v1v2 haritası -> sicil enum'u).
  // Ölçülen kusur: `balloon` — reponun EN ÇOK kullandığı puf yazımı, 35 kullanım —
  // hiçbir dalın koşulu değildi ve sessizce düz kola düşüyordu. `bishop` de aynı
  // durumdaydı (vocab onu balloon'un eşanlamı ilan ediyor). Yeni sayı EKLENMEDİ:
  // puf çizimi contract croquis.sleeveLaw'ın ölçülmüş kanunundan aynen geliyor.
  const branch = sleeveBranch(spec);
  const puff = branch === 'puff' || spec.sleeveCap === 2;
  // cap sleeve: a short set-in sleeve that caps the shoulder without winging out.
  // Names unified — canonical 'cap', numeric sleeveCap===4, or spec.sleeveHead
  // 'capped' (the vision/target spec field) all resolve to the same short cap draw.
  const cap = branch === 'cap' || spec.sleeveCap === 4 || spec.sleeveHead === 'capped';

  // sleeve length (how far the hem drops below the shoulder tip)
  const drop = cap ? 34 : len === 'long' ? 300 : len === 'threeQuarter' ? 220
    : len === 'elbow' ? 150 : 96;            // short default
  // how far the sleeve projects outward at the hem. A cap sleeve barely extends
  // past the shoulder tip (it caps the shoulder, it does not wing out); keeping
  // outW small stops the round "ear" kink at the shoulder.
  const outW = cap ? 16 : puff ? 62 : 48;
  const hemX = shoulderTipX + outW;
  const hemTopY = shoulderTipY + drop * 0.5;
  const hemBotY = shoulderTipY + drop;

  // cap head: puff rises above the shoulder; plain/cap follows the shoulder line
  const capRise = puff ? 22 : cap ? 6 : 8;

  // -------------------------------------------------------------------------
  // F-E KÖK DÜZELTMESİ (Damla kusur 2: "puff kol alttan DÜZ KESİK ve sivriliyor
  // — manşet/lastik bitişi yok"). ESKİ kalem puff kolu bir BORU çiziyordu: dış
  // kenar (hemX, hemTopY)'den (hemX-4, hemBotY)'ye düz bir L, yani kolun en
  // geniş yeri ETİYDİ. "Puff" tam olarak bunun tersidir — dolgunluk yukarıda,
  // et bir manşet/lastikle TOPLANIR. Eşitlik (et == en geniş) puff DEĞİLDİR;
  // contract sleeveLaw.puffHemNarrowerThanWidest bu eşitliği yasaklıyor.
  // Buğra Locket EU38 Alt Kol parçası kendi ekseninde: en geniş 342.22 mm,
  // dış ucu 319.20 mm — oran 0.933, yani gerçek kalıpta bile et en geniştne dar.
  // Uygulanan: puff kol en geniş yerine ETİN ÜSTÜNDE ulaşır (bicep hattı), sonra
  // manşete daralır; ete iki paralel çizgiden bir bant + büzgü tırtıkları konur.
  // -------------------------------------------------------------------------
  const CUFF_RATIO = 0.72;     // manşet / en geniş — toplanan et (puff)
  const CUFF_BAND = 7;         // manşet bandı yüksekliği (birim) = 21 mm
  const bicepY = puff ? shoulderTipY + drop * 0.62 : hemTopY;  // en geniş hat
  const bicepX = hemX;                                          // = shoulderTip + outW
  const cuffOutX = puff ? shoulderTipX + outW * CUFF_RATIO : hemX - (cap ? 6 : 4);
  const cuffInX = underX + (cap ? 6 : 10);
  const cuffInY = cap ? underY + 6 : hemBotY - drop * 0.12;

  // -------------------------------------------------------------------------
  // RAGLAN TOPOLOJİSİ (V4-E). V4-B'de raglan bir raglan DEĞİLDİ: kol path'i
  // set-in ile BİREBİR aynıydı (ikisi de omuz ucundan, `M 70.2 16.9`, başlıyordu)
  // ve üstüne bir dikiş EKLENİYORDU. c993491'in gövdesindeki *"instead of"*
  // cümlesi bu yüzden YANLIŞTI — eklemek, yerine koymak değildir.
  //
  // Raglanın tanımı topolojiktir: OMUZ DİKİŞİ YOKTUR. Kol oyuğu dikişi yakadan
  // koltukaltına iner, yani OMUZ UCU KÖŞESİ GÖVDEYE DEĞİL KOLA aittir. Uygulanan
  // tam olarak budur: kol parçasının üst kenarı artık YAKA TABANINDAN başlıyor
  // (set-in'de omuz ucundan başlıyordu) ve omuz ucunun üstünden geçip bicep'e
  // iniyor. Uydurulmuş sayı yok: iki uç da croquis'in kendi noktaları
  // (yaka tabanı ve koltukaltı), kontrol noktaları ikisinin arasından türüyor.
  // -------------------------------------------------------------------------
  const raglan = spec[SHOULDER_FIELD] === 'raglan' || String(style) === 'raglan';
  const neckX = g.neck.half, neckY = shoulderNeckY;
  let d = raglan ? `M ${n(neckX)} ${n(neckY)} ` : `M ${n(shoulderTipX)} ${n(shoulderTipY)} `;
  // over the cap head, out to the widest point of the sleeve (bicep line). RAGLAN:
  // the same outer edge, but it starts at the neck and carries the shoulder tip.
  if (raglan) {
    d += `C ${n(neckX + (shoulderTipX - neckX) * 0.55)} ${n(neckY - (neckY - shoulderTipY) * 0.55)} ` +
      `${n(shoulderTipX)} ${n(shoulderTipY - capRise * 0.5)} ${n(bicepX)} ${n(bicepY)} `;
  } else {
    d += `C ${n(shoulderTipX + outW * 0.4)} ${n(shoulderTipY - capRise)} ${n(bicepX - outW * 0.1)} ${n(shoulderTipY + 6)} ${n(bicepX)} ${n(bicepY)} `;
  }
  // down the outer sleeve edge to the cuff. PUFF: eğri İÇERİ toplanır (manşet),
  // düz L değil — düz L "sivrilen boru" okumasının kendisiydi.
  if (puff) d += `C ${n(bicepX)} ${n(bicepY + (hemBotY - bicepY) * 0.45)} ${n(cuffOutX + (bicepX - cuffOutX) * 0.35)} ${n(hemBotY - CUFF_BAND)} ${n(cuffOutX)} ${n(hemBotY)} `;
  else d += `L ${n(cuffOutX)} ${n(hemBotY)} `;
  // along the sleeve hem back toward the body
  d += `Q ${n((cuffOutX + underX) * 0.5)} ${n(hemBotY + (cap ? 4 : 8))} ${n(cuffInX)} ${n(cuffInY)} `;
  // up the underarm seam back to the underarm point on the body
  d += `L ${n(underX)} ${n(underY)} `;

  // RAGLAN: parça KAPANIR — koltukaltından yakaya çıkan raglan dikişi kolun
  // KENDİ kenarıdır, gövdenin üstüne EKLENEN ayrı bir çizgi değil. Kapanan
  // parça kağıtla dolduğu için gövde siluetinin omuz parçası artık kolun
  // ALTINDA kalır: omuz ucu köşesi gövdeden çıkıp kola geçer.
  if (raglan) {
    const cx = (neckX + underX) * 0.5, cy = (neckY + underY) * 0.5;
    d += `Q ${n(cx + (underX - neckX) * 0.18)} ${n(cy)} ${n(neckX)} ${n(neckY)} Z`;
  }
  let s = `<path data-part="sleeve" d="${d}" fill="${raglan ? LAW.ink.paper : 'none'}" stroke="${NAVY}" stroke-width="${W_OUTLINE}" ` +
    `stroke-linejoin="round" stroke-linecap="round"/>`;
  if (puff) {
    // gather ticks at the cap head
    for (let t = 0.2; t <= 0.85; t += 0.16) {
      const gx = shoulderTipX + outW * t;
      s += `<line x1="${n(gx)}" y1="${n(shoulderTipY - 2)}" x2="${n(gx)}" y2="${n(shoulderTipY + 9)}" stroke="${SEAM}" stroke-width="${W_MARK}"/>`;
    }
    // MANŞET BANDI: bitmiş puff kolun eti kesik değil, toplanmış ve bir banda
    // (lastik/manşet) dikilmiş. Teknik flat bunu ete PARALEL ikinci bir çizgiyle
    // gösterir; bandın içine büzgü tırtıkları düşer.
    const bandD = `M ${n(cuffOutX - 1.5)} ${n(hemBotY - CUFF_BAND)} ` +
      `Q ${n((cuffOutX + underX) * 0.5)} ${n(hemBotY + 8 - CUFF_BAND)} ${n(cuffInX + 1.5)} ${n(cuffInY - CUFF_BAND * 0.55)}`;
    s += `<path data-part="cuff-band" d="${bandD}" fill="none" stroke="${SEAM}" stroke-width="${W_SEAM}" stroke-linecap="round"/>`;
    // büzgü tırtıkları: ET EĞRİSİNİN ÜSTÜNDE, ona DİK. Konumları uydurulmuyor —
    // etin kendi quadratic'i örnekleniyor, tırtık o noktadaki NORMALE çiziliyor.
    const hq0 = [cuffOutX, hemBotY], hqc = [(cuffOutX + underX) * 0.5, hemBotY + 8], hq1 = [cuffInX, cuffInY];
    for (let t = 0.16; t <= 0.88; t += 0.18) {
      const u = 1 - t;
      const px = u * u * hq0[0] + 2 * u * t * hqc[0] + t * t * hq1[0];
      const py = u * u * hq0[1] + 2 * u * t * hqc[1] + t * t * hq1[1];
      const tx = 2 * u * (hqc[0] - hq0[0]) + 2 * t * (hq1[0] - hqc[0]);
      const ty = 2 * u * (hqc[1] - hq0[1]) + 2 * t * (hq1[1] - hqc[1]);
      const LL = Math.hypot(tx, ty) || 1;
      // normal KOLUN İÇİNE bakmalı (et aşağıda, kol yukarıda): işaret buradan.
      const nx = -ty / LL, ny = tx / LL;
      s += `<line x1="${n(px + nx * 1.5)}" y1="${n(py + ny * 1.5)}" ` +
        `x2="${n(px + nx * (CUFF_BAND - 0.5))}" y2="${n(py + ny * (CUFF_BAND - 0.5))}" ` +
        `stroke="${SEAM}" stroke-width="${W_MARK}"/>`;
    }
  }
  // V4-E — YİNELENEN ÇİZİM ÖLDÜ. V4-B burada raglan dikişini bir kez basıp bir
  // kez de `scale(-1,1)` ile aynalıyordu; oysa BU FONKSİYON zaten SAĞ YARIMDIR
  // ve çağıran (viewPanel) çıktının tamamını bir kez daha aynalıyor. Sonuç:
  // dikiş görünüm başına 4 KEZ basılıyordu ve `set 10 -> raglan 18` eleman
  // artışının 8'i üst üste binen kopyaydı. Kırpmayla gizlenmedi, KÖKÜ atıldı:
  // raglan dikişi artık kol parçasının kendi kapanan kenarı (yukarıda), ayrı bir
  // path DEĞİL. Bu blok kaldırıldı.
  return s;
}

// ---------------------------------------------------------------------------
// Interior design lines (thin). Darts / princess seams / button row / empire
// seam / back zip / ties / gather. Drawn on BOTH halves (x and -x) explicitly
// because they are not part of the mirrored outline group.
// ---------------------------------------------------------------------------
function interior(g, spec, view) {
  const isBack = view === 'back';
  let s = '';
  const waistY = g.waistY, bodyBottom = g.isDress ? g.waistY : g.hemY;

  // empire / waist seam
  if (g.isDress) {
    s += `<line x1="${n(-g.waistW * 1.02)}" y1="${n(waistY)}" x2="${n(g.waistW * 1.02)}" y2="${n(waistY)}" ` +
      `stroke="${SEAM}" stroke-width="${W_SEAM}"/>`;
  }

  if (spec.shaping === 'princess') {
    // Anatomik prenses dikişi: armhole/shoulder → BUST APEX → waist (→ hem on a
    // dress). The seam passes THROUGH the apex as an S-curve that follows the body
    // — over the bust it bows outward to the apex, then draws in to the waist nip,
    // then eases back out toward the hip. NOT a single random outward bracket
    // (MIHENK-01: apex'i geçmeyen bombeli quadratic yanlıştı). Two cubics joined
    // at the apex give the S. Front passes the true apex; back has no bust so its
    // apex flattens toward the shoulder-blade line.
    // Classic bodice princess line: starts at the ARMHOLE (over the chest edge,
    // near the underarm), NOT at the neck — a neck-start reads as a wrong V. Runs
    // down over the bust apex, in to the waist nip, out to the hip/hem.
    // Seam parametreleri spec.seam ile ayarlanabilir (MIHENK-06 ızgarası kurallı
    // seam versiyonlarını tarar). Varsayılanlar geriye uyumlu (mevcut pinler
    // değişmez). sm.origin: seam başlangıç x'i (chestW oranı, armhole yakını);
    // sm.top: başlangıç y'si (küçük = omuza yakın, kanca riski); sm.bow: apex'e
    // yaklaşma; sm.waist: bel nip; sm.c1: ilk kübik kontrol tension'ı (kanca kaynağı).
    const sm = spec.seam || {};
    const oOrigin = sm.origin ?? 0.80;
    const oTop = sm.top ?? 30;
    const oBowF = sm.bow ?? (isBack ? 0.46 : 0.62);
    const oWaist = sm.waist ?? 0.46;
    const oC1 = sm.c1 ?? 0.25;
    const apexY = isBack ? g.apexY * 0.78 : g.apexY;
    for (const dir of [-1, 1]) {
      const xTop = dir * g.chestW * oOrigin;
      const yTop = oTop;
      const xApex = dir * g.apexHalfX * oBowF;
      const xWaist = dir * g.waistW * oWaist;
      const xBot = dir * (g.isDress ? g.hemHalf * 0.44 : g.waistW * 0.52);
      const yBot = g.isDress ? g.hemY : g.hemY - 6;
      // cubic 1: armhole -> apex (oC1 tension; büyük = daha yumuşak giriş, kanca yok)
      let d = `M ${n(xTop)} ${n(yTop)} C ${n(xTop - (xTop - xApex) * oC1)} ${n(yTop + (apexY - yTop) * 0.55)} ` +
        `${n(xApex)} ${n(apexY - 18)} ${n(xApex)} ${n(apexY)} `;
      // cubic 2: apex -> waist nip (draw in, following the body)
      d += `C ${n(xApex)} ${n(apexY + (waistY - apexY) * 0.55)} ${n(xWaist)} ${n(waistY - 12)} ${n(xWaist)} ${n(waistY)} `;
      // cubic 3: waist -> hip/hem (ease back out)
      if (g.isDress) d += `C ${n(xWaist)} ${n(waistY + (yBot - waistY) * 0.35)} ${n(xBot)} ${n(waistY + (yBot - waistY) * 0.62)} ${n(xBot)} ${n(yBot)} `;
      else d += `L ${n(xBot)} ${n(yBot)} `;
      s += `<path d="${d}" fill="none" stroke="${SEAM}" stroke-width="${W_SEAM}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  } else if (!isBack) {
    // front bust/waist darts: short tapered lines from the waist up toward the bust
    // apex (a real dart points AT the apex, not at a guessed height).
    for (const dir of [-1, 1]) {
      const x = dir * g.waistW * 0.5;
      s += `<path d="M ${n(x)} ${n(bodyBottom * 0.99)} L ${n(dir * g.apexHalfX * 0.5)} ${n(g.apexY + 6)}" ` +
        `fill="none" stroke="${SEAM}" stroke-width="${W_SEAM}" stroke-linecap="round"/>`;
    }
  }

  // button row / placket (front only)
  const hasPlacket = spec.frontPlacket || (spec.placketStyle && spec.placketStyle > 0);
  if (hasPlacket && !isBack) {
    const top = g.neck.depth + 6;
    const bot = (g.isDress ? g.hemY : g.hemY) * 0.94;
    s += `<line x1="0" y1="${n(g.neck.depth)}" x2="0" y2="${n(bot + 8)}" stroke="${SEAM}" stroke-width="${W_SEAM}"/>`;
    const nb = 6;
    for (let i = 0; i < nb; i++) {
      const y = top + (bot - top) * i / (nb - 1);
      s += `<circle cx="0" cy="${n(y)}" r="3.4" fill="none" stroke="${NAVY}" stroke-width="${W_MARK}"/>`;
    }
  }

  // PORT: BÜZGÜ PANOSU (REFERANS KALEM shirr dili). Düz paralel çizgi yerine
  // dalgalı taper büzgü sıraları — panonun toplanan dokusu. drawstring için
  // ayrıca casing (kanal) çizgisi. Referans kalemdeki dalgalı taper karakteri.
  if (spec.gatherType) {
    const zoneY = spec.gatherZone === 1 ? 60 : spec.gatherZone === 2 ? waistY - 6 : g.neck.depth + 14;
    const halfW = g.chestW * 0.9;
    const gseed = (isBack ? 71 : 23) + Math.round(halfW) * 3 + Math.round(zoneY);
    const grnd = rng(gseed);
    // panonun dikey kapsamı: casing/üst kenardan empire seam'e kadar birkaç sıra
    const rowTop = spec.gatherType === 1 ? zoneY : Math.max(g.neck.depth + 16, zoneY - 24);
    const rowBot = spec.gatherType === 1 ? zoneY + 16 : Math.min((g.isDress ? waistY : g.hemY * 0.5) - 6, zoneY + 22);
    const rows = spec.gatherType === 1 ? 2 : 4;
    if (spec.gatherType === 1) {                 // drawstring: iki casing çizgisi + fiyonk deliği
      for (const off of [0, 10]) {
        s += `<line x1="${n(-halfW)}" y1="${n(zoneY + off)}" x2="${n(halfW)}" y2="${n(zoneY + off)}" stroke="${SEAM}" stroke-width="${W_SEAM}"/>`;
      }
    }
    // dalgalı taper büzgü sıraları (drawstring casing altında, shirred tüm panoda)
    for (let i = 0; i < rows; i++) {
      const ry = rows > 1 ? rowTop + (rowBot - rowTop) * (i / (rows - 1)) : rowTop;
      const bumps = Math.max(4, Math.round(5 + (grnd() - 0.5) * 2));
      const amp = 0.9 + grnd() * 0.9, ph = grnd() * Math.PI, pts = [];
      for (let b = 0; b <= bumps * 2; b++) {
        const u = b / (bumps * 2);
        pts.push([-halfW + (2 * halfW) * u, ry + Math.sin(ph + u * bumps * Math.PI) * amp]);
      }
      s += taperInk(pts, 1.3, 0.35, SEAM);
    }
  }

  // back-view specifics: center-back zip, back ties, open-back cutout
  if (isBack) {
    if (spec.closure && /zip/i.test(spec.closure)) {
      s += `<line x1="0" y1="${n(g.neck.depth + 4)}" x2="0" y2="${n(g.isDress ? waistY + 40 : g.hemY * 0.8)}" ` +
        `stroke="${SEAM}" stroke-width="${W_TOPSTITCH}" stroke-dasharray="${D_TOPSTITCH}"/>`;
    }
    if (spec.tie && spec.tie > 0) {
      const ty = g.isDress ? waistY : g.hemY * 0.86;
      for (const dir of [-1, 1]) {
        s += `<path d="M ${n(dir * g.waistW)} ${n(ty - 6)} Q ${n(dir * g.waistW * 0.4)} ${n(ty)} 0 ${n(ty + 2)}" ` +
          `fill="none" stroke="${SEAM}" stroke-width="${W_SEAM}" stroke-linecap="round"/>`;
      }
    }
    if (spec.backOpening && spec.backOpening > 0) {
      s += `<path d="M ${n(-g.neck.half * 0.72)} ${n(g.neck.depth + 6)} Q 0 ${n(waistY * 0.5)} ${n(g.neck.half * 0.72)} ${n(g.neck.depth + 6)}" ` +
        `fill="none" stroke="${SEAM}" stroke-width="${W_HIDDEN}" stroke-dasharray="${D_HIDDEN}"/>`;
    }
  }

  // -------------------------------------------------------------------------
  // WRAP (front only): true-wrap flat convention. The body is cut symmetric per
  // panel; the wrap is the FRONT CLOSURE — one panel crosses over the other. On
  // a finished-garment flat this reads as (1) a surplice crossover edge running
  // diagonally from one shoulder-neck point down across the bust to the opposite
  // waist, (2) the underlap edge (the panel that goes underneath, faint), and
  // (3) a self-fabric tie exiting the side seam at the waist and knotting at CF.
  // Opt-in (spec.wrap): defaults unchanged so golden + pins stay byte-identical.
  // spec.wrap: 1 = wrap-to-left (overlap right-over-left), 2 = wrap-to-right.
  // The overlap direction sets which shoulder the crossover starts from.
  // -------------------------------------------------------------------------
  if (!isBack && spec.wrap && spec.wrap > 0) {
    const dir = spec.wrap === 2 ? -1 : 1;         // overlap side
    const snX = g.neck.half, snY = g.neck.depth;  // shoulder-neck point
    const overW = g.waistW * 0.30;                // overlap crosses past CF to opp. waist
    // (1) OVERLAP EDGE (top panel): shoulder-neck -> bust -> opposite waist. Bows
    // over the bust apex like the princess seam, so it follows the body not a
    // straight chord (the diagonal is the read of the wrap, not a ruler line).
    const bx = -dir * g.apexHalfX * 0.55, byA = g.apexY;
    const wx = -dir * overW, wy = waistY;
    let d = `M ${n(dir * snX)} ${n(snY)} ` +
      `C ${n(dir * snX * 0.7)} ${n(snY + (byA - snY) * 0.5)} ${n(bx + dir * g.apexHalfX * 0.3)} ${n(byA - 14)} ${n(bx)} ${n(byA)} ` +
      `C ${n(bx - dir * g.apexHalfX * 0.2)} ${n(byA + (wy - byA) * 0.5)} ${n(wx)} ${n(wy - 14)} ${n(wx)} ${n(wy)}`;
    s += `<path d="${d}" fill="none" stroke="${SEAM}" stroke-width="${W_OUTLINE}" stroke-linecap="round" stroke-linejoin="round"/>`;
    // (2) UNDERLAP EDGE (bottom panel, faint mark): mirror side, shoulder to CF-ish
    // waist, sits under the overlap — drawn thin so it reads as the panel behind.
    const uwx = dir * overW * 0.5;
    let du = `M ${n(-dir * snX)} ${n(snY)} ` +
      `C ${n(-dir * snX * 0.6)} ${n(snY + (byA - snY) * 0.6)} ${n(-dir * g.apexHalfX * 0.4)} ${n(byA + 6)} ${n(uwx)} ${n(wy)}`;
    s += `<path d="${du}" fill="none" stroke="${SEAM}" stroke-width="${W_HIDDEN}" stroke-linecap="round" stroke-dasharray="${D_HIDDEN}"/>`;
    // (3) WRAP TIE: self-fabric strip exits the side seam at the waist on the
    // overlap side, wraps to the front, knots near CF. Two soft strokes = the tie.
    const ty = waistY;
    s += `<path d="M ${n(dir * g.waistW * 1.01)} ${n(ty - 4)} Q ${n(dir * g.waistW * 0.45)} ${n(ty + 8)} ${n(dir * overW * 0.4)} ${n(ty + 4)}" ` +
      `fill="none" stroke="${SEAM}" stroke-width="${W_SEAM}" stroke-linecap="round"/>`;
    // knot + short tails at CF
    s += `<circle cx="${n(dir * overW * 0.4)}" cy="${n(ty + 4)}" r="3.2" fill="none" stroke="${SEAM}" stroke-width="${W_MARK}"/>`;
    for (const t of [-1, 1]) {
      s += `<path d="M ${n(dir * overW * 0.4)} ${n(ty + 4)} Q ${n(dir * overW * 0.4 + t * 10)} ${n(ty + 22)} ${n(dir * overW * 0.4 + t * 6)} ${n(ty + 40)}" ` +
        `fill="none" stroke="${SEAM}" stroke-width="${W_MARK}" stroke-linecap="round"/>`;
    }
  }

  // -------------------------------------------------------------------------
  // PORT: DRAPE MÜREKKEBİ (REFERANS KALEM dili). Boş etek yerine el-çizimi
  // kıvrımlar — ana sırt (skirtBottom'a inen, taper kalın) + sönen ikincil
  // (yarı yolda biter, ince). Gathered/full etekte yoğun, düz etekte az.
  // Şematik boş etek MIHENK-01 "vektör-şema" hissinin yarısıydı.
  // -------------------------------------------------------------------------
  {
    const skirtTop = g.isDress ? waistY : (g.hemY - (g.hemY - waistY) * 0.5);
    const skirtBot = g.hemY;
    const topHalf = g.isDress ? g.waistW * 1.0 : g.chestW * 0.9;
    const botHalf = g.hemHalf;
    const st = spec.skirtStyle || (g.isDress ? 'aLine' : 'shift');
    // circle skirts (full/half) drape as densely as a gathered skirt: the wide
    // radial fullness falls into deep waves at the hem, so use the 'orta' ink.
    const full = st === 'gathered' || circleSkirt(st) !== null;
    const ink = full ? 'orta' : (spec.ink || 'minimal');

    // GORE / GODE PANEL SEAMS (skirtStyle 'gore'): the engine cuts the skirt into
    // 6 wedge panels; on a flat that reads as VERTICAL PANEL SEAMS running waist ->
    // hem, evenly spaced across the width, each flaring out with the skirt so the
    // godet fullness sits at the hem. Drawn under the drape ink (construction line,
    // W_SEAM). A 6-gore skirt shows the CF seam + evenly spaced seams to each side
    // across the visible half. Backward-compatible: only when skirtStyle === 'gore'.
    if (st === 'gore' && skirtBot - skirtTop > 30) {
      const nGore = spec.goreCount || 6;            // engine default 6 panels
      // seams visible across ONE half = half the panel-seam count (CF seam at x=0
      // shared). Space them evenly in the waist->hem taper so they flare outward.
      const seamsPerHalf = Math.max(1, Math.round(nGore / 2));
      for (let i = 0; i <= seamsPerHalf; i++) {
        const u = i / seamsPerHalf;                 // 0 = CF, 1 = side seam
        for (const dir of (i === 0 ? [1] : [-1, 1])) {
          const xTop = dir * topHalf * u;
          const xBot = dir * botHalf * u;
          // gentle outward flare (godet): control point pulls the seam out low
          const my = skirtTop + (skirtBot - skirtTop) * 0.5;
          const mx = dir * (topHalf * u + (botHalf - topHalf) * u * 0.35);
          const d = `M ${n(xTop)} ${n(skirtTop)} Q ${n(mx)} ${n(my)} ${n(xBot)} ${n(skirtBot - 2)}`;
          s += `<path d="${d}" fill="none" stroke="${SEAM}" stroke-width="${W_SEAM}" stroke-linecap="round"/>`;
        }
      }
    }

    if (skirtBot - skirtTop > 30) {                 // sadece görünür bir etek varsa
      // ASİMETRİ (taste-lexicon "yelpaze" düzeltmesi): sol ve sağ AYRI drapePlan
      // (ayrı seed) alır — fabric folds ayna simetrik bir yelpaze değil, iki yön
      // farklı boy/eğim/yerde düşer, tıpkı gerçek kumaş gibi.
      const baseSeed = (isBack ? 977 : 131) + Math.round(botHalf) * 7 + Math.round(g.hemY);
      const planByDir = {
        '-1': drapePlan(baseSeed, ink, spec.foldCount, spec.drape),
        '1': drapePlan(baseSeed * 3 + 61, ink, spec.foldCount, spec.drape),
      };
      for (const dir of [-1, 1]) {
        for (const r of planByDir[dir]) {
          // başlangıç: etek üstünde, orta ile yan arası u konumunda
          const su = 0.14 + r.u * 0.5;
          const ax = dir * topHalf * su;
          const ay = skirtTop + 4 + r.birth * (skirtBot - skirtTop) * 0.55;
          // bitiş: prim ise ete kadar dışa savrulur, ikincil yarı yolda söner
          const endU = r.prim ? (0.55 + r.u * 0.4) : r.u * 0.85;
          const bx = dir * botHalf * endU;
          const by = r.prim ? skirtBot - 3 : skirtTop + (skirtBot - skirtTop) * r.die;
          const h = by - ay;
          const c1 = [ax + (bx - ax) * (r.prim ? 0.10 : 0.18), ay + h * 0.40];
          const c2 = [bx - (bx - ax) * 0.10, by - h * (r.prim ? 0.46 : 0.58)];
          const line = samplePts([ax, ay], c1, c2, [bx, by], 14);
          if (ink === 'minimal') {
            // kısa izler: büzgü altında + ete yakın (referans kalem minimal reji)
            s += taperInk(line.slice(0, 4), 1.3, 0.55, SEAM);
            s += taperInk(line.slice(9), 1.5, 0.5, SEAM);
          } else {
            s += taperInk(line, r.prim ? 1.8 : 0.95, r.prim ? 0.34 : 0.62, SEAM);
          }
        }
      }
    }
  }

  return s;
}

// YAKA (F-D kök düzeltmesi, 2026-08-23). ESKİ HAL BİR ARTEFAKTTI: Peter Pan
// yaprakları CF'den sabit oranlarla çiziliyordu — gerçek yaka çizgisine
// DEĞMİYORDU, arka görünümde ön yakanın kopyası basılıyordu, iki yaprak boşlukta
// duran iki badem gibi okunuyordu. Kırpmayla GİZLENMEDİ, kök sebep düzeltildi:
// yaka artık O GÖRÜNÜMÜN GERÇEK yaka çizgisinden türüyor — silüetin kullandığı
// `necklineSegs` örneklenir, dış kenar o eğrinin normal ofsetidir, genişlik
// uçlarda 0'a iner (yuvarlak yaprak ucu). Arka görünüm ARKA yaka çizgisini
// kullanır ve CF yarığı YOKTUR (gerçek Peter Pan arkada tektir).
function samplePolyFromSegs(segs, start) {
  const pts = [start.slice()];
  let cur = start;
  for (const sg of segs) {
    if (sg.t === 'L') { pts.push(sg.p[0].slice()); cur = sg.p[0]; }
    else if (sg.t === 'Q') {
      const c = sg.p[0], e = sg.p[1];
      for (let i = 1; i <= 10; i++) { const t = i / 10, u = 1 - t;
        pts.push([u * u * cur[0] + 2 * u * t * c[0] + t * t * e[0], u * u * cur[1] + 2 * u * t * c[1] + t * t * e[1]]); }
      cur = e;
    } else if (sg.t === 'C') {
      const c1 = sg.p[0], c2 = sg.p[1], e = sg.p[2];
      for (let i = 1; i <= 12; i++) { const t = i / 12, u = 1 - t;
        pts.push([u * u * u * cur[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * e[0],
                  u * u * u * cur[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * e[1]]); }
      cur = e;
    }
  }
  return pts;
}

const COLLAR_W = 26;      // yaprak genişliği (birim) = 78 mm bitmiş yaka bandı

function collar(g, spec, view, cfNeckY) {
  const kind = spec[COLLAR_FIELD] || 0;
  if (!kind) return '';
  // AÇIK KALEM (V4-B): bant yakaların üç türü BUGÜN DE aynı bandı basıyor. Ayırmak
  // için üç ayrı yaka formunun ölçülmüş bir kanunu gerekir; sicilde
  // `collarFamily` absent ve contract/flat-convention-v1.json'da bir yaka
  // kanunu YOK. Sayı uydurmak yasak, o yüzden bu kart yakayı AYIRMADI ve
  // durumu gizlemedi: kapı bu eşitliği RAPORLUYOR (bkz. flat_expresses_spec_check
  // "collar" bölümü) ve iş GECE/V4-B.md'de kuyruk kalemi olarak duruyor.
  const isBack = view === 'back';
  const nHalf = g.neck.half;
  const snY = g.shoulderY + g.neckDrop;
  const segs = necklineSegs(g.neck.kind, isBack, nHalf, cfNeckY, nHalf, snY);
  const line = samplePolyFromSegs(segs, [0, cfNeckY]);
  const L = line.length;
  // stand / mock / shirt bandı: yaka çizgisine yapışık ince bant
  if (kind !== 4) {
    let d = `M ${n(line[0][0])} ${n(line[0][1])} `;
    for (let i = 1; i < L; i++) d += `L ${n(line[i][0])} ${n(line[i][1])} `;
    const band = `<path d="${d}" fill="none" stroke="${NAVY}" stroke-width="${W_SEAM}" stroke-linecap="round"/>`;
    return band + `<g transform="scale(-1,1)">${band}</g>`;
  }
  // peter-pan / hilal: yaka çizgisinden ofsetlenmiş yaprak
  const i0 = isBack ? 0 : Math.round(0.10 * (L - 1));   // önde CF yarığı, arkada yok
  const P = line.slice(i0), m = P.length;
  const outer = [];
  for (let i = 0; i < m; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(m - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], dd = Math.hypot(dx, dy) || 1;
    const u = m > 1 ? i / (m - 1) : 0.5;
    const w = COLLAR_W * Math.pow(Math.sin(Math.PI * Math.min(Math.max(u, 0.02), 0.98)), 0.45);
    outer.push([P[i][0] - (dy / dd) * w, P[i][1] + (dx / dd) * w]);
  }
  let d = `M ${n(P[0][0])} ${n(P[0][1])} `;
  for (let i = 1; i < m; i++) d += `L ${n(P[i][0])} ${n(P[i][1])} `;
  for (let i = m - 1; i >= 0; i--) d += `L ${n(outer[i][0])} ${n(outer[i][1])} `;
  d += 'Z';
  const leaf = (mir) => `<path d="${d}" fill="${LAW.ink.paper}" stroke="${NAVY}" ` +
    `stroke-width="${W_SEAM}" stroke-linejoin="round" stroke-linecap="round"` + (mir ? ' transform="scale(-1,1)"' : '') + '/>';
  return leaf(false) + leaf(true);
}

// ETEK UCU ÜST DİKİŞİ (F-D). Bitmiş giysinin eteği kıvrılıp bastırılır; teknik
// flat bunu etek kenarına PARALEL kesik çizgiyle gösterir. Silüetin son iki
// segmentinden (etek kenarı + orta-ön dip) türetilir, ayrı bir sayı uydurulmaz:
// aynı eğri, yukarı 6 birim (18 mm) ofsetlenmiş.
const HEM_TS_OFF = 6;
function hemTopstitchPath(half) {
  const segs = half.segs, last = segs[segs.length - 1];
  const prev = segs[segs.length - 2];
  const hemPt = prev.p[prev.p.length - 1];
  const c = last.p[0], end = last.p[1];
  const o = HEM_TS_OFF;
  let d = `M ${n(hemPt[0])} ${n(hemPt[1] - o)} Q ${n(c[0])} ${n(c[1] - o)} ${n(end[0])} ${n(end[1] - o)} `;
  d += `Q ${n(-c[0])} ${n(c[1] - o)} ${n(-hemPt[0])} ${n(hemPt[1] - o)}`;
  return d;
}

// ---------------------------------------------------------------------------
// One VIEW (front or back): the mirrored outline group + sleeves + interior.
// Returns { inner, w, h } in view-local coords (centered on x=0).
// ---------------------------------------------------------------------------
function viewPanel(spec, view) {
  const g = geom(spec);
  g.skirtStyle = spec.skirtStyle;

  const half = halfOutline(g, view);
  // outline: ONE continuous closed silhouette (right half + reversed mirror),
  // so there is no stroked center-front line / fake seam down the garment.
  const outline =
    `<path d="${fullOutlinePath(half)}" fill="${LAW.ink.paper}" stroke="${NAVY}" ` +
    `stroke-width="${W_OUTLINE}" stroke-linejoin="round" stroke-linecap="round"/>`;

  const slv = sleeveHalf(g, spec);
  const sleeves = slv
    ? `<g>${slv}<g transform="scale(-1,1)">${slv}</g></g>`
    : '';

  const details = collar(g, spec, view, half.cfNeckY) + interior(g, spec, view);

  const bottom = g.hemY + (g.isDress ? 10 : 4);
  // widest extent: outline hem/hip/chest, or sleeve reach if sleeved
  let maxX = Math.max(g.hemHalf, g.chestW, g.shoulderW);
  // V4-E: puf kolun dış ulaşımı 62 birim. Eskiden bu SADECE `sleeveCap===2`
  // sayısına bakıyordu, yani ADIYLA puf istenen kol (balloon/puff) kağıdın
  // dışına taşıyordu. Aynı türetilmiş dal kullanılıyor, ikinci bir kural yok.
  if (g.hasSleeve) maxX = Math.max(maxX, g.shoulderW + (sleeveBranch(spec) === 'puff' || spec.sleeveCap === 2 ? 62 : 48));
  const pad = 20;
  const w = (maxX + pad) * 2;
  const h = bottom + pad;
  const hemTs = `<path d="${hemTopstitchPath(half)}" fill="none" stroke="${NAVY}" ` +
    `stroke-width="${W_TOPSTITCH}" stroke-dasharray="${D_TOPSTITCH}" stroke-linecap="round"/>`;
  // CROQUIS BEYANI — kapı bu beyanın gerçekten çizilen path'in bir ucu olduğunu
  // doğrular (engine/tests/flat_convention_check.mjs §1b). Beyan yalan söyleyemez.
  const decl = `data-croquis="${LAW.croquis.id}" data-shoulder-x="${U.shoulderW}" ` +
    `data-shoulder-y="${U.shoulderTipY}" data-chest-x="${U.chestW}" data-chest-y="${U.chestY}" ` +
    `data-waist-y="${U.waistY}" data-waistline="${g.empire ? 'empire' : 'natural'}"`;
  // shift so x=0 maps to w/2, y starts at pad
  const inner = `<g data-view="${view}" ${decl} transform="translate(${n(w / 2)} ${pad})">` +
    `${outline}${hemTs}${sleeves}${details}</g>`;
  return { inner, w, h };
}

// ---------------------------------------------------------------------------
// REFERANS KALEM KÖPRÜSÜ (Damla mimari kararı 2026-07-19): strapless / band-top
// stiller (babydoll ailesi) için üretim renderer'ın kendi bluz-gövde yolu YANLIŞ
// form üretiyordu (MIHENK-03: çadır + boynuz). Bu formlar için ÜRETİM, REFERANS
// KALEM motorunu doğrudan ÇAĞIRIR — form birebir referans, kopya yok, tek hakikat
// (referans salt-okunur cetvel kalır). spec bir referans stiline eşlenir; eşleşme
// yoksa üretim kendi flat yolunu kullanır (prenses, shift, vb).
// ---------------------------------------------------------------------------
async function tryReferencePen(spec) {
  // TEK HAKİKAT, TEK KALEM (Damla kararı 2026-07-20): referans motor artık band-top
  // babydoll ailesinin ÖTESİNDE prenses/wrap/gode gibi TÜM figür-tabanlı siluetleri
  // de çiziyor (figür kuralı + kalem dili orada MERKEZİ). Üretim renderer bu ailelerde
  // KENDİ şematik gövde yolunu KULLANMAZ — referans stiline eşleşen HER spec köprüden
  // geçer (ikinci kalem = beş-turluk sosis/parantez/çadır krizinin kök nedeniydi).
  // Kapı: spec bir referans STYLE anahtarına eşleşiyor (referenceStyle / style / band
  // işareti). Eşleşme yoksa üretim kendi yolunu kullanır (henüz referansta olmayan formlar).
  let ref;
  try { ref = await import('../flat-engine/_engine-full.mjs'); } catch { return null; }
  // aday stil anahtarı: explicit referenceStyle > style > band işaretlerinden çıkarım
  let styleKey = spec.referenceStyle || spec.style || null;
  if (!styleKey && (spec.top === 'band' || spec.neckline === 'strapless')) {
    styleKey = 'drawstring_babydoll';
  }
  // TOP family (2026-07-20, item 8/9 — first bare-top production round). A plain
  // sleeveless top with no beyond-engine detail routes to the matching reference
  // top style so it draws figured, NOT through the schematic fallback. Only the
  // simplest, detail-free tops match here; anything with sleeves/collar/gather/etc
  // falls through until those primitives land in the reference pen.
  // SPEC → styleKey deterministik eşleme (2026-07-22 FAZ 6 — uçtan uca köprü).
  // referenceStyle olmadan cümle→spec→köprü otomatik eşlesin. 13 kanıtlı stil.
  // Eşleşmeyen spec (henüz primitifi olmayan) → null → ÜRETİLEMEZ (ikame yok).
  if (!styleKey) {
    const nl = spec.neckline;
    const sleeve = spec.sleeve || spec[SLEEVE_FIELD];   // gramer 'sleeve' | contract kol alani
    const sleeved = sleeve && sleeve !== 'none';
    const peplum = spec.peplum && spec.peplum !== 'none';
    const hemRuffle = spec.hemRuffle === 'single';   // peplum hem fırfırı (id84/91)
    const shirred = (spec.shirred === 'physics') || (spec.gatherType === 'shirred');
    const boxy = spec.shaping === 'boxy';
    const princess = spec.shaping === 'princess';
    const tieBack = spec.closure === 'tieBack' || spec.backDetail === 'tieBack' || spec.tieClosure === 'tieBack';
    const wrapFront = spec.closure === 'wrapFront' || spec.tieClosure === 'wrapFront';

    const straps = spec.straps;                          // wide | spaghetti | ruffled | none
    // KÖPRÜ SIKILAŞTIRMA (2026-07-23): strapType TEK KAYNAK (contract {type} object VE
    // gramer string ikisini de çözer). camiStrap eskiden `straps==='wide'` string
    // kontrolüydü → contract object'te FALSE → id4/74 cami yerine plain'e DÜŞÜYORDU (bug).
    const strapType = (straps && typeof straps === 'object') ? straps.type : straps;  // contract {type} | gramer string
    const camiStrap = strapType === 'wide' || strapType === 'spaghetti';
    if (spec.garment === 'top') {
      // CAMI / BANDEAU ailesi (2026-07-22 ASKI ailesi): dar askılı (wide/spaghetti)
      // band-top gövde — mevcut top gövdesinden ÖNCE eşleşir (spesifik → genel).
      if (camiStrap && (nl === 'square' || nl === 'vNeck') && shirred && peplum && strapType === 'spaghetti' && hemRuffle) styleKey = 'top_cami_sq_spag_shirred_peplum_ruffle';  // id84/91 (peplum hem fırfırı)
      else if (camiStrap && nl === 'square' && shirred && peplum && strapType === 'spaghetti') styleKey = 'top_cami_sq_spag_shirred_peplum';
      else if (camiStrap && nl === 'square' && shirred && peplum) styleKey = 'top_cami_sq_wide_shirred_peplum';
      else if (camiStrap && nl === 'square' && shirred) styleKey = 'top_cami_sq_wide_shirred';
      else if (camiStrap && nl === 'square' && strapType === 'spaghetti') styleKey = 'top_cami_sq_spaghetti';
      // kompleks kombinasyonlar önce (spesifik → genel)
      else if ((nl === 'straight' || nl === 'strapless') && (strapType === 'none' || !strapType) && shirred && peplum) styleKey = 'top_bandeau_shirred_peplum';  // id40
      else if (nl === 'square' && shirred && peplum && sleeved) styleKey = 'top_sq_puff_shirred_peplum';
      else if (nl === 'square' && shirred && peplum) styleKey = 'top_sq_shirred_peplum';
      else if (peplum && princess) styleKey = 'top_princess_peplum';
      else if (boxy && sleeved) styleKey = 'top_crew_boxy_sleeve';
      else if (boxy) styleKey = 'top_crew_boxy_crop';
      else if ((nl === 'boat' || nl === 'square') && princess) styleKey = 'top_boat_princess';
      // KÖPRÜ SIKILAŞTIRMA: princess top (boat/square dışı yaka) princess-top stili YOK →
      // sessizce plain dart'a DÜŞÜRME (ikame). styleKey null kalır → compile ÜRETİLEMEZ der.
      // top_scoop_cami/top_crew_dart SADECE princess DEĞİLKEN eşleşir (dart/plain gövde).
      else if (nl === 'scoop' && !princess) styleKey = 'top_scoop_cami';
      else if ((nl === 'crew' || nl === 'boat' || nl === 'square' || nl === 'vNeck') && !princess && !sleeved && !peplum && !shirred) styleKey = 'top_crew_dart';
      // KÖPRÜ SIKILAŞTIRMA: hemRuffle (peplum hem fırfırı) istenip peplum-ruffle
      // stiline eşleşmediyse (scoop/princess varyantı yok), fırfırsız stile DÜŞÜRME
      // (ikame). styleKey null → ÜRETİLEMEZ. id62/75 sınıfı (peplum-ruffle stili yok).
      if (hemRuffle && styleKey && !/_ruffle$/.test(styleKey)) styleKey = null;
    } else if (spec.garment === 'dress') {
      const circle = circleSkirt(spec.skirt || spec.skirtStyle) !== null;  // full/half circle
      const gathered = (spec.skirt || spec.skirtStyle) === 'gathered';     // dirndl gathered skirt
      if (nl === 'boat' && tieBack) styleKey = 'dress_boat_aline_tieback';
      else if (nl === 'vNeck' && wrapFront) styleKey = 'wrap_dress';                              // id13/68
      else if (nl === 'square' && princess && circle) styleKey = 'dress_square_princess_circle';  // id47
      else if (nl === 'boat' && princess && circle) styleKey = 'dress_boat_princess_circle';      // id27
      else if (nl === 'sweetheart' && princess && circle && !shirred && !sleeved && strapType === 'spaghetti') styleKey = 'dress_sweetheart_spag_circle';  // id101 (sweetheart spaghetti-tie-strap princess fit-and-flare, ön bow)
      else if (nl === 'sweetheart' && princess && circle && !shirred && !sleeved && (strapType === 'wide' || strapType === 'none' || !strapType)) styleKey = 'dress_sweetheart_princess_circle';  // id54 (sweetheart wide-strap princess fit-and-flare — ruched cup/shirred + kollu ayrı primitif, ikame yok)
      else if (nl === 'vNeck' && gathered && sleeved && sleeve !== 'balloon' && !wrapFront && spec.sleeveHead !== 'puffed' && !shirred) styleKey = 'dress_vneck_gathered';  // id24/57 (dirndl gathered skirt, plain kısa kol — puff/balloon kol + shirred ayrı primitif, ikame yok)
      else if ((nl === 'scoop' || nl === 'crew') && princess) {
        styleKey = (spec.length === 'midi') ? 'dress_princess_scoop_aline_midi' : 'dress_princess_scoop_aline';
      }
    }
  }
  if (!styleKey || !ref.STYLE[styleKey]) return null;
  try {
    // shared parametreleri spec'ten geçir (beden/boy/etek/düşüş/nip korunur)
    const overrides = {};
    for (const k of ['size', 'length', 'skirtFull', 'ink', 'foldCount', 'hemWave', 'drape', 'hemDip', 'seed', 'bustProject', 'bustHeight', 'waistNip']) {
      if (spec[k] != null) overrides[k] = spec[k];
    }
    // BEL BAĞI varyantı (2026-07-23): dirndl gathered dress'te tek stil, tie/bow
    // varyantı spec.tieClosure'dan türetilir (id24 frontWaistBow → bow, id57
    // frontWaistTie → tie). Motor ikisini de kalıpta ayrı parça olarak çiziyor.
    if (styleKey === 'dress_vneck_gathered') {
      const tc = spec.tieClosure;
      if (tc === 'frontWaistTie') overrides.waistTie = 'tie';
      else if (tc === 'frontWaistBow') overrides.waistTie = 'bow';
    }
    return ref.renderStyle(styleKey, overrides);
  } catch {
    return null;
  }
}

// public: assembled FRONT + BACK finished-garment flat, spec-driven.
// `pieces` is unused for the outline (kept for signature compatibility).
// Band-top strapless styles route to the reference pen (async); everything else
// draws through the production flat path (sync). renderGarmentFlat stays sync for
// callers; use renderGarmentFlatAsync to get the reference-pen routing.
export async function renderGarmentFlatAsync(pieces, spec = {}) {
  const ref = await tryReferencePen(spec);
  if (ref) return ref;
  return renderGarmentFlat(pieces, spec);
}

export function renderGarmentFlat(pieces, spec = {}) {
  const fp = viewPanel(spec, 'front');
  const bp = viewPanel(spec, 'back');

  const HEAD = 40, GAP = 56, PAD = 24;
  const panelH = Math.max(fp.h, bp.h);
  const W = PAD + fp.w + GAP + bp.w + PAD;
  const H = HEAD + panelH + PAD;
  const head = (x, w, label) =>
    `<text x="${n(x + w / 2)}" y="28" text-anchor="middle" ` +
    `font-family="Helvetica,Arial,sans-serif" font-size="22" font-weight="600" ` +
    `letter-spacing="3" fill="${NAVY}">${label}</text>`;

  let inner = head(PAD, fp.w, 'FRONT');
  inner += `<g transform="translate(${n(PAD)} ${HEAD})">${fp.inner}</g>`;
  const bx = PAD + fp.w + GAP;
  inner += head(bx, bp.w, 'BACK');
  inner += `<g transform="translate(${n(bx)} ${HEAD})">${bp.inner}</g>`;
  // PANEL AYIRICI ÇİZGİ KALDIRILDI (F-D): üçüncü bir mürekkep rengiydi (#e2e9f2)
  // ve giysiye ait olmayan bir çizgiydi. FRONT / BACK başlıkları panelleri ayırıyor.

  return svgDoc(W, H, inner, refusalStamp(spec));
}
