#!/usr/bin/env node
// preview-truth.mjs — K3 preview-truth (2026-07-19), the closing-chain answer
// to K0 finding 4.3 ("preview <-> pattern boundary unmeasured"). One semantic
// JSON per flat style (contract/preview-truth.json specs) feeds TWO
// projections:
//   DISPLAY  = engine/flat-engine styles.json recipe of the same key (the flat
//              the listing cards / assembled preview world shows), and
//   DRAFT    = the committed product engine (web/vendor/stitchu-engine.js,
//              the exact wasm the browser drafts with) via draftJSON.
// Two tests, one script (precision-report family):
//   1. STRUCTURAL EQUALITY (hard): every structural element the flat draws
//      must have a counterpart among the drafted pieces, and every drafted
//      piece must be represented in the flat. Undeclared gaps FAIL. Declared
//      gaps live in contract/preview-truth.json structuralAllow with a
//      contract reference each (K2's declaredButNotDrawn parts included).
//   2. LANDMARK DEVIATION (soft, 8%): the same landmarks measured on both
//      projections, normalised by the bust half-width anchor of each
//      projection (proportion stylisation is free; the ANCHOR row is 0% by
//      construction and printed as such). A deviation above 8% must cite a
//      contract-declared stylisation (landmarkAllow) and stays PINNED at its
//      recorded envelope — drift beyond a pin FAILS. This is the ratchet.
// Runs in ctest (preview_truth_check) and is chained after render-lint in
// style-lint.mjs, so the existing deploy proof step runs it automatically.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const require = createRequire(import.meta.url);
const flat = await import(join(root, 'engine/flat-engine/_engine-full.mjs'));
const styles = JSON.parse(readFileSync(join(root, 'engine/flat-engine/styles.json'), 'utf8'));
const comp = JSON.parse(readFileSync(join(root, 'contract/composition.json'), 'utf8'));
const tables = JSON.parse(readFileSync(join(root, 'contract/tables.json'), 'utf8'));
const truth = JSON.parse(readFileSync(join(root, 'contract/preview-truth.json'), 'utf8'));
const vocab = JSON.parse(readFileSync(join(root, 'engine/vocab.json'), 'utf8'));
const createEngine = require(join(root, 'web/vendor/stitchu-engine.js'));

const THRESHOLD = 8; // percent, soft
let failures = 0;
const fail = (msg) => { console.error(`FAIL ${msg}`); failures += 1; };

// ---- semantic spec -> engine int spec (same vocab table the API uses) --------
const VF = vocab.fields || vocab;
const enumInt = (field, val) => {
  if (val === undefined) return 0;
  const i = VF[field].values.indexOf(val);
  if (i < 0) throw new Error(`preview-truth spec: invalid ${field} '${val}'`);
  return i;
};
function engineSpec(sem) {
  return {
    garment: sem.garment, shaping: sem.shaping, waistline: sem.waistline, fabric: sem.fabric,
    neckline: sem.neckline, sleeveStyle: sem.sleeveStyle, sleeveLength: sem.sleeveLength,
    skirtStyle: sem.skirtStyle, skirtLength: sem.skirtLength, topLength: sem.topLength,
    ruffleHem: false, ruffleTiers: 1, keyhole: false, frontPlacket: false,
    tieClosure: enumInt('tieClosure', sem.tieClosure), sleeveCap: enumInt('sleeveCap', sem.sleeveCap),
    collarType: enumInt('collarType', sem.collarType), collarEdge: enumInt('collarEdge', sem.collarEdge),
    gatherType: enumInt('gatherType', sem.gatherType), gatherZone: enumInt('gatherZone', sem.gatherZone),
    backOpening: 0, backSlit: 0, ruffledStraps: enumInt('ruffledStraps', sem.ruffledStraps),
    peplum: 0, placketStyle: 0, edgeFinish: 0, pocketStyle: 0, cuffStyle: 0, hemShape: 0,
    shoulderStyle: 0, buttonRow: 0, exposedZip: 0, backDetail: 0, bardotStyle: 0,
  };
}

// ---- structural mapping ------------------------------------------------------
// The 11 flat z-order parts (contract/composition.json flatComponents.order)
// mapped to their DRAFT counterparts. A predicate receives the drafted pattern
// and the semantic spec; truthy = counterpart exists.
const hasPiece = (p, re) => p.pieces.some((x) => re.test(x.name));
const FLAT_TO_DRAFT = {
  sleeve:   (p) => hasPiece(p, /Sleeve/),
  shirr:    (p) => hasPiece(p, /Panel/),                       // gathered panel piece
  casing:   (p, sem) => sem.gatherType === 'drawstring' && hasPiece(p, /Drawstring/),
  tie:      (p, sem) => sem.gatherType === 'drawstring'
    ? hasPiece(p, /Cord/)                                      // the bow IS the knotted cord
    : hasPiece(p, /Tie/),
  backSeam: (p) => p.pieces.some((x) => /Back/.test(x.name)
    && /center back seam|cut 2/.test(x.cutInstruction)),
  collar:   (p) => hasPiece(p, /Collar/),
  straps:   (p) => hasPiece(p, /Strap/),                       // wide/spaghetti/ruffled strap piece
  princessSeam: (p) => hasPiece(p, /Side Front|Center Front/),  // draft princess split pieces carry the seam
  gorePanels: (p) => hasPiece(p, /gore|Gore/),                  // draft gore panel piece(s)
  wrapTie:  () => false,      // ink-only wrap waist tie (the draft carries wrap via closure) — allowlisted
  wrapSurplice: () => false,  // ink-only surplice edge (asymmetric overlap line) — allowlisted
  cfGather: () => false,   // ink-only decoration — must be allowlisted
  laceNeck: () => false,   // lace trim — must be allowlisted (undrawable, A1)
  laceSleeve: () => false,
  laceHem:  () => false,
};
// DRAFT pieces that a worn fashion flat represents implicitly / legitimately:
// The circle skirt drafts as ONE piece "Skirt Panel (quarter circle)" (two cut
// from a half-circle → a full circle); the worn flat shows it as the silhouette's
// flared lower half, so it belongs to the body outline, NOT a separate flat part.
const BODY_RE = /^(Bodice|Skirt|Top) (Front|Back)$|^Skirt Panel \(quarter circle\)$/; // the silhouette itself (Top = the top-garment bodice block)
const INTERNAL_RE = /Bias binding|Neck Facing|Armhole Facing/;   // inside the garment, invisible worn
const PIECE_TO_FLAT = [
  { re: /Sleeve/, part: 'sleeve' },
  { re: /Collar/, part: 'collar' },
  { re: /gore|Gore/, part: 'gorePanels' },                       // gore skirt panel(s)
  { re: /Side Front|Side Back|Center Front|Center Back/, part: 'princessSeam' }, // princess split pieces
  { re: /Panel/, part: 'shirr' },
  { re: /Cord/, part: 'tie' },
  { re: /Wrap Front Tie/, part: 'wrapTie' },                      // physical wrap tie cut (flat draws it as ink)
  { re: /^Neck\/Front Tie|Tie \(/, part: 'tie' },
  { re: /Ruffled Strap/, part: 'ruffledStraps' },                // K2 declaredButNotDrawn
  { re: /Wide Strap|Spaghetti Strap/, part: 'straps' },          // ASKI ailesi plain strap tube
];

const declaredNotDrawn = new Set(comp.flatComponents.declaredButNotDrawn.parts);
const allowStructural = (style, item, side) => truth.structuralAllow.some((a) =>
  (a.style === '*' || a.style === style) && a.items.includes(item)
  && (a.side === side || (a.side === 'declaredNotDrawn' && side !== 'flatOnly')));

// ---- landmark measurement ----------------------------------------------------
const verts = (piece) => piece.commands.filter((c) => c.x !== undefined).map((c) => [c.x, c.y]);

// ---- F-N (23 Ağu): PRENSES BÖLÜNMESİ ARTIK ÇAPA KAYBETTİRMİYOR ---------------
// Kök sebep (ölçülerek bulundu, tahmin değil): prenses stilleri önü Center +
// Side olarak İKİ parça kesiyor, bu yüzden 'Bodice Front' / 'Skirt Front'
// parçası YOK; draftLandmarks çapasını (D.bustHalf) bulamıyor ve on landmark'ın
// onu da düşüyordu. 11 stil × 8-10 yargı = 91 kırmızının 90'ı bu tek kök.
//
// Panelleri BİRLEŞTİRMEK uydurma değil, motorun kendi inşasının tersi:
// engine/src/bodice.cpp:757 ve engine/src/skirt.cpp:235 iki paneli AYNI yarım
// gövde çerçevesinde çiziyor, sonra SADECE yan paneli kendi bbox köşesine
// taşıyor (`translatePiece(side, -sideBox.x, -sideBox.y)`). Merkez panel hiç
// taşınmıyor. Yani kaybolan tek şey o ötelemedir ve geri alınabilir.
//
// Ötelemeyi hangi noktadan alıyoruz: EŞLEŞTİRME ÇENTİĞİ. İki panel de
// markings'inin ilk (move) noktasına aynı fiziksel noktayı basıyor — gövdede
// büst apeksi (bodice.cpp:693/731), etekte gore ucu (skirt.cpp:206/224).
// Zaten dikişçinin iki paneli hizalamak için kullandığı nokta bu; ölçüm de
// aynı noktayı kullanır. dx,dy = center.markings[0] - side.markings[0].
// Dikiş payı ÇİFT SAYILMIYOR: parça komutları NET kesim çizgisi, pay ayrı bir
// alan (piece.seamAllowance = 15mm), yani panelleri toplamak pay eklemez.
// DOĞRULAMA (aynı gövde, aynı koşu): birleştirilmiş prenses ön bustHalf
// 249.81mm; bölünmemiş 'Bodice Front' çizen drawstring_babydoll 249.81mm.
// Birebir aynı sayı — rekonstrüksiyon doğru.
//
// Yürüyüş: her iki panelde de çentiğin İKİ komşusu o panelin İÇ dikiş ucudur
// (gövdede split ve legA/legB, etekte legA/legB ve goreHem). Dikildiğinde bu
// uçlar zaten çakışır. Dış kontur = merkezin çentik-komşuları arası dış yayı +
// yan panelin çentik-komşuları arası dış yayı:
//   merkez[0..ai-1] ++ yanİç((j+1)..(j-1)) ++ merkez[ai+1..son]
// İç dikişin kendisi (prenses/gore) düşer — o zaten görünmeyen bir birleşme.
const dedupeLoop = (v) => (v.length > 1
  && Math.abs(v[0][0] - v[v.length - 1][0]) < 1e-9
  && Math.abs(v[0][1] - v[v.length - 1][1]) < 1e-9 ? v.slice(0, -1) : v);
const nearest = (v, p) => v.reduce((b, q, i) => (
  Math.hypot(q[0] - p[0], q[1] - p[1]) < Math.hypot(v[b][0] - p[0], v[b][1] - p[1]) ? i : b), 0);
function joinSplitFront(pat, centerName, sideName) {
  const c = pat.pieces.find((x) => x.name === centerName);
  const s = pat.pieces.find((x) => x.name === sideName);
  if (!c || !s) return null;
  const cm = (c.markings || []).find((m) => m.x !== undefined);
  const sm = (s.markings || []).find((m) => m.x !== undefined);
  if (!cm || !sm) return null;                       // çentik yok → uydurma yok, atla
  const dx = cm.x - sm.x, dy = cm.y - sm.y;
  const cv = dedupeLoop(verts(c));
  const sv = dedupeLoop(verts(s)).map((q) => [q[0] + dx, q[1] + dy]);
  if (cv.length < 4 || sv.length < 4) return null;
  const notch = [cm.x, cm.y];
  const ai = nearest(cv, notch), sj = nearest(sv, notch);
  // Çentik iki panelde de gerçekten bir KÖŞE olmalı; değilse eşleştirme
  // varsayımı tutmuyor demektir ve sessizce sayı uydurmaktansa atlanır.
  if (Math.hypot(cv[ai][0] - cm.x, cv[ai][1] - cm.y) > 1e-6) return null;
  if (Math.hypot(sv[sj][0] - cm.x, sv[sj][1] - cm.y) > 1e-6) return null;
  if (ai === 0 || ai === cv.length - 1) return null;  // merkezde çentik uçta olamaz
  const n = sv.length, sideOuter = [];
  for (let k = (sj + 2) % n; k !== (sj - 1 + n) % n; k = (k + 1) % n) sideOuter.push(sv[k]);
  const merged = [...cv.slice(0, ai), ...sideOuter, ...cv.slice(ai + 1)];
  return { commands: merged.map(([x, y]) => ({ type: 'line', x, y })), cutInstruction: c.cutInstruction || '' };
}

function draftLandmarks(pat) {
  const L = {};
  const bf = pat.pieces.find((x) => x.name === 'Bodice Front' || x.name === 'Top Front')
    || joinSplitFront(pat, 'Bodice Center Front', 'Bodice Side Front')
    || joinSplitFront(pat, 'Top Center Front', 'Top Side Front');
  const sf = pat.pieces.find((x) => x.name === 'Skirt Front')
    || joinSplitFront(pat, 'Skirt Center Front', 'Skirt Side Front');
  const sl = pat.pieces.find((x) => /Sleeve/.test(x.name));
  const panel = pat.pieces.find((x) => /Panel/.test(x.name));
  if (bf) {
    const v = verts(bf);
    const maxX = Math.max(...v.map((q) => q[0]));
    const maxY = Math.max(...v.map((q) => q[1]));
    const hpsIdx = v.reduce((b, q, i) => (q[1] < v[b][1] ? i : b), 0);
    const hps = v[hpsIdx];                       // highest point = neck/shoulder point
    const tip = v[hpsIdx + 1];                   // next vertex outward = shoulder tip
    const cfTop = v.filter((q) => q[0] < 1).reduce((b, q) => (q[1] < b[1] ? q : b));
    const underarm = v.reduce((b, q) => (q[0] > b[0] ? q : b));
    const sideBottom = v.filter((q) => q[0] > 0.5 * maxX).reduce((b, q) => (q[1] > b[1] ? q : b));
    L.bustHalf = maxX;
    L.neckHalf = hps[0];
    L.neckDepth = cfTop[1] - hps[1];
    L.shoulderLen = Math.hypot(tip[0] - hps[0], tip[1] - hps[1]);
    L.armholeDepth = underarm[1] - tip[1];
    L.waistHalf = sideBottom[0];
    if (Math.abs(maxY - sideBottom[1]) > 60) fail('draft bodice: side-bottom vertex suspiciously far from hem — landmark heuristic broke');
  }
  if (sf) {
    const v = verts(sf);
    L.hemSweepHalf = Math.max(...v.map((q) => q[0]));
    L.skirtLen = Math.max(...v.map((q) => q[1]));
  } else {
    // F-N: TAM/YARIM DAİRE ETEK — draft'ta 'Skirt Front' YOK, çünkü etek
    // çeyrek daire panel olarak kesiliyor (engine/src/skirt.cpp:294
    // halfCirclePanel, "cut 2"). Beş stil (circle aileleri) bu yüzden
    // hemSweepHalf + skirtLen'i hiç yayınlamıyordu.
    // "Beyanda açıklanmış say" diye ATLAMIYORUZ (kartın yasağı) — panelin
    // KENDİ geometrisinden ölçüyoruz. Panel dört köşe: (r,0) (0,r) (0,R) (R,0),
    // r = bel yarıçapı, R = r + etek boyu (skirt.cpp:295-297).
    //   skirtLen      = R - r  (etek düşüşü, Skirt Front'un max y'siyle aynı şey)
    //   hemSweepHalf  = pi*R/4 (Skirt Front 'cut 1 on fold' olduğu için max x'i
    //                   TOPLAM eteğin dörtte biridir; daire etekte toplam etek
    //                   ucu pi*R, dörtte biri pi*R/4 — aynı yasa, aynı payda)
    // Doğrulama (dress_bandeau_circle): r 245.5 → bel pi*r = 771.3mm; R 895.5;
    // skirtLen 650.0mm = princess_dress'in bölünmüş midi eteğiyle aynı düşüş.
    const cp = pat.pieces.find((x) => x.name === 'Skirt Panel (quarter circle)');
    if (cp) {
      const v = verts(cp);
      const coords = v.flat();
      const R = Math.max(...coords);
      const r = Math.min(...coords.filter((z) => z > 1e-6));
      if (R > r) { L.skirtLen = R - r; L.hemSweepHalf = Math.PI * R / 4; }
    }
  }
  if (sl && bf) {
    // Sleeve landmarks are only trustworthy when the bodice front anchor (bf)
    // exists. Princess styles split the front into Center Front + Side Front
    // (no un-split 'Bodice Front'/'Top Front'), so bf is absent and L.bustHalf
    // is undefined — normalising the sleeve against a reconstructed split anchor
    // would double-count the internal princess-seam allowance (a false anchor).
    // Consistent with the bodice-frame landmarks, which top_boat_princess (also
    // split) already honestly skips for the same reason.
    const v = verts(sl);
    L.sleeveWidth = Math.max(...v.map((q) => q[0])) - Math.min(...v.map((q) => q[0]));
    L.sleeveLen = Math.max(...v.map((q) => q[1])) - Math.min(...v.map((q) => q[1]));
  }
  if (panel) {
    const m = panel.cutInstruction.match(/(\d+) mm flat top edge that gathers down to (\d+) mm/);
    if (m) L.panelRatio = Number(m[1]) / Number(m[2]);
  }
  return L;
}
function flatLandmarks(styleKey) {
  const p = flat.defaults(styleKey);
  const cx = 240;
  const b = flat.buildHalf(p, cx, false, flat.rng(p.seed * 131 + 13));
  const k = b.k;
  const S = tables.flat.unitPX;
  const L = { bustHalf: k.bustX - cx, waistHalf: k.eX - cx, hemSweepHalf: k.hX - cx, skirtLen: k.yHem - k.yEmp };
  if (k.nX !== undefined) {          // shoulder-top styles only; band tops honestly skip
    L.neckHalf = k.nX - cx;
    L.neckDepth = k.ny - k.y0;
    L.shoulderLen = Math.hypot(k.stX - k.nX, k.stY - k.y0);
    L.armholeDepth = k.uaY - k.stY;
  }
  if (styles.styles[styleKey].parts.sleeve) {
    // F-N (23 Ağu): burada KOŞULSUZ `flat.puffSleeve` çağrılıyordu ve yanındaki
    // "the exact worn-sleeve geometry render() draws" yorumu YANLIŞTI.
    // render() (_engine-full.mjs:389) kolu şöyle seçiyor:
    //     p.capPuff > 0.05 ? puffSleeve(p,k) : plainSleeve(p,k)
    // Yani puf OLMAYAN kollu stillerde (cap/short/elbow/long) ölçüm, ekranda
    // çizilmeyen bir kolu ölçüyordu. İki sonucu ölçüldü:
    //  (1) capPuff=0 ve own.sleeveLen'i olmayan cap-kollu stillerde (
    //      dress_square_princess_circle, dress_boat_princess_circle)
    //      puffSleeve p.sleeveLen undefined'la NaN üretiyordu — `undefined`
    //      olmadığı için atlama kapısına da takılmıyor, "deviates NaN%" diye
    //      hükümsüz bir FAIL basıyordu.
    //  (2) dress_vneck_gathered gibi own.sleeveLen'i OLAN düz-kollu stillerde
    //      sayı üretiliyordu ama YANLIŞ kolun sayısıydı; pini de o yanlış
    //      ölçüme çakılmıştı.
    // Eşik/pin gevşetilmedi — ölçüm aleti render'ın kendi seçimine bağlandı.
    const s = (p.capPuff > 0.05 ? flat.puffSleeve(p, k) : flat.plainSleeve(p, k));
    L.sleeveWidth = s.outX - k.stX;
    // plainSleeve capTop DÖNDÜRMEZ: puf olmayan kolda kapağın tepesi omuz
    // ucunun kendisidir (puffSleeve'in capTop'u da capPuff=0'da tam k.stY'ye
    // iner — _engine-full.mjs:297). Bu olmadan sayı NaN çıkıyordu ve NaN
    // `undefined` sayılmadığı için atlama kapısına takılmadan hükümsüz bir
    // FAIL basıyordu.
    L.sleeveLen = s.hemY - (s.capTop !== undefined ? s.capTop : k.stY);
  }
  // panelCutWidth: the flat never keeps a private ratio truth (contract
  // flat.derived) — its derived cut number IS finished x draft.gatherRatios.
  return L;
}
const allowLandmark = (style, lm) => // exact-style pin overrides the '*' wildcard
  truth.landmarkAllow.find((a) => a.style === style && a.landmark === lm)
  || truth.landmarkAllow.find((a) => a.style === '*' && a.landmark === lm);

// ---- T17/TUR 9 (17 Ağu): SESSİZ ATLAMA ARTIK HÜKÜM İSTİYOR --------------------
// Buraya kadar landmark döngüsü `if (F[lm] === undefined || D[lm] === undefined)
// continue;` diyordu — "honest skip (band top, no sleeve)". ÖLÇÜLDÜ: 31 stil ×
// 10 landmark = 310 yargı yuvasının **190'ı (%61.3) atlanıyordu**, ve
// **11 stil (princessSeam ailesinin TAMAMI) 0/10 yargı alıyordu.** Sebep tek bir
// çapa: princess stilleri önü Center/Side Front'a böldüğü için draft'ta
// 'Bodice Front' parçası YOK → D.bustHalf undefined → çapa yok → ON landmark'ın
// hepsi düşüyor. Ratchet o 11 stilde hiçbir zaman koşmadı; figure_check'in 7'si
// ile aynı sınıf, daha büyüğü.
//
// Atlama yasağı değil, GEREKÇE şartı: bir landmark ancak stilin KENDİ beyanı
// (contract/preview-truth.json specs + styles.json parts) o landmark'ın var
// olmadığını söylüyorsa atlanabilir. Gerekçesiz atlama = ölçüm aletinin
// boşluğu = FAIL. Eşik (%8), tolerans, DECLARED mekanizması DEĞİŞMEDİ.
//
// bustHalf ve waistHalf HİÇBİR koşulda atlanamaz: her giysinin büstü ve beli
// vardır. Orada eksik sayı stilin özelliği değil, aletin körlüğüdür.
const SKIP_FREE = new Set(['bustHalf', 'waistHalf']);
function skipReason(styleKey, sem, parts, pat, lm, missF, missD) {
  if (SKIP_FREE.has(lm)) return null;             // her giyside var; atlanamaz
  if (lm === 'sleeveLen' || lm === 'sleeveWidth') {
    return parts.sleeve === true ? null : 'stil kolsuz (styles.json parts.sleeve yok)';
  }
  if (lm === 'hemSweepHalf' || lm === 'skirtLen') {
    if (sem.garment === 'top') return 'stil ÜST (preview-truth spec garment=top) — etek yok';
    if (parts.gorePanels === true) return 'etek gore panellerine bölünmüş (parts.gorePanels) — tek Skirt Front parçası yok';
    return null;
  }
  if (lm === 'neckHalf' || lm === 'neckDepth' || lm === 'shoulderLen' || lm === 'armholeDepth') {
    // Bant/askı üstünde flat'in omuz noktası (k.nX) YOKTUR — bu stilin kendi
    // gerçeği. Ama sayıyı kaybeden DRAFT tarafıysa, bu aletin boşluğudur.
    if (missF && !missD) return 'bant/askı üstü — flat\'in omuz noktası yok (k.nX undefined)';
    return null;
  }
  return null;
}

// ---- run ---------------------------------------------------------------------
const engine = await createEngine();
const styleKeys = Object.keys(styles.styles);
const truthKeys = Object.keys(truth.specs).filter((k) => !k.startsWith('_'));
for (const k of styleKeys) if (!truthKeys.includes(k)) fail(`style '${k}' has no semantic spec in contract/preview-truth.json — every flat style must be preview-truth tested`);
for (const k of truthKeys) if (!styleKeys.includes(k)) fail(`preview-truth spec '${k}' has no flat style record`);

for (const styleKey of styleKeys.filter((k) => truthKeys.includes(k))) {
  const sem = truth.specs[styleKey];
  const out = JSON.parse(engine.draftJSON(engineSpec(sem), truth.body));
  if (out.error) { fail(`[${styleKey}] draft projection errored: ${out.error}`); continue; }
  if ((out.issues || []).length) fail(`[${styleKey}] draft projection has validator issues: ${JSON.stringify(out.issues)}`);
  const pat = out.pattern;
  console.log(`\n== ${styleKey} — draft ${pat.pieces.length} pieces`);

  // -- 1. structural equality (hard) --
  const parts = styles.styles[styleKey].parts;
  const drawnParts = Object.keys(FLAT_TO_DRAFT).filter((x) => parts[x] === true);
  const notDrawnDeclared = Object.keys(parts).filter((x) => parts[x] === true && declaredNotDrawn.has(x));
  for (const part of drawnParts) {
    if (FLAT_TO_DRAFT[part](pat, sem)) { console.log(`  flat '${part}' -> draft counterpart OK`); continue; }
    if (allowStructural(styleKey, part, 'flatOnly')) { console.log(`  flat '${part}' -> NO draft piece — DECLARED (allowlist)`); continue; }
    fail(`[${styleKey}] flat draws '${part}' but the draft has no counterpart piece and no allowlist entry`);
  }
  for (const part of notDrawnDeclared) {
    if (allowStructural(styleKey, part, 'declaredNotDrawn')) { console.log(`  flat flag '${part}' declared-but-not-drawn — DECLARED (K2 + allowlist)`); continue; }
    fail(`[${styleKey}] flat flag '${part}' is declared-but-not-drawn without an allowlist entry`);
  }
  for (const piece of pat.pieces) {
    if (BODY_RE.test(piece.name)) continue;
    if (INTERNAL_RE.test(piece.name)) { console.log(`  draft '${piece.name}' internal construction (invisible worn) OK`); continue; }
    const map = PIECE_TO_FLAT.find((m) => m.re.test(piece.name));
    if (map && (parts[map.part] === true)) {
      // Ink-only flat parts (FLAT_TO_DRAFT false + flatOnly-allowlisted, e.g.
      // wrapTie): the flat draws them as a decorative stroke, the DRAFT cuts a
      // real piece. Require a draftOnly allowlist entry so the ink<->piece
      // correspondence is contract-declared, not silently accepted.
      if (FLAT_TO_DRAFT[map.part] && FLAT_TO_DRAFT[map.part](pat, sem) === false
          && allowStructural(styleKey, map.part, 'flatOnly')) {
        if (allowStructural(styleKey, map.part, 'draftOnly')) { console.log(`  draft '${piece.name}' cut as a real piece; flat draws '${map.part}' as ink — DECLARED (allowlist)`); continue; }
        fail(`[${styleKey}] draft cuts '${piece.name}' but the flat only draws '${map.part}' as ink (no draftOnly allowlist entry)`);
        continue;
      }
      if (declaredNotDrawn.has(map.part)) {
        if (allowStructural(styleKey, map.part, 'draftOnly')) { console.log(`  draft '${piece.name}' drawn in pattern, flat flag declared-but-not-drawn — DECLARED`); continue; }
        fail(`[${styleKey}] draft cuts '${piece.name}' but the flat never draws its declared '${map.part}' flag (no allowlist entry)`);
        continue;
      }
      console.log(`  draft '${piece.name}' -> flat '${map.part}' OK`);
      continue;
    }
    fail(`[${styleKey}] draft cuts '${piece.name}' with no flat representation and no allowlist entry`);
  }

  // -- 2. landmark deviation (soft 8%, pinned envelope) --
  const F = flatLandmarks(styleKey);
  const D = draftLandmarks(pat);
  const rows = [];
  for (const lm of ['bustHalf', 'neckHalf', 'neckDepth', 'shoulderLen', 'armholeDepth', 'waistHalf', 'hemSweepHalf', 'skirtLen', 'sleeveLen', 'sleeveWidth']) {
    const missF = F[lm] === undefined, missD = D[lm] === undefined;
    if (missF || missD) {
      const why = skipReason(styleKey, sem, parts, pat, lm, missF, missD);
      const side = missF && missD ? 'flat+draft' : (missF ? 'flat' : 'draft');
      if (why) { rows.push(`  ${lm.padEnd(13)} SKIP — ${why} (${side} tarafı yok)`); continue; }
      fail(`[${styleKey}] landmark '${lm}' ÖLÇÜLMEDİ: ${side} tarafında sayı yok ve stilin beyanında bunu açıklayan bir yapı yok — ratchet burada SESSİZ (T17/TUR 9)`);
      rows.push(`  ${lm.padEnd(13)} FAIL — gerekçesiz atlama (${side} tarafı yok)`);
      continue;
    }
    const rF = F[lm] / F.bustHalf, rD = D[lm] / D.bustHalf;
    const dev = (rF / rD - 1) * 100;
    let status;
    if (lm === 'bustHalf') status = 'ANCHOR (0 by construction)';
    else if (Math.abs(dev) <= THRESHOLD) status = 'OK';
    else {
      const a = allowLandmark(styleKey, lm);
      if (a && Math.abs(dev) <= a.maxAbsDevPct) status = `DECLARED (pin ${a.maxAbsDevPct}%: ${a.contractRef})`;
      else { status = 'FAIL'; fail(`[${styleKey}] landmark '${lm}' deviates ${dev.toFixed(1)}% (>${THRESHOLD}%) with no contract-declared stylisation${a ? ` — BEYOND its ${a.maxAbsDevPct}% pin (ratchet)` : ''}`); }
    }
    rows.push(`  ${lm.padEnd(13)} flat ${rF.toFixed(3)}  draft ${rD.toFixed(3)}  dev ${(dev >= 0 ? '+' : '') + dev.toFixed(1)}%  ${status}`);
  }
  // panelCutWidth: draft panel ratio vs the ONE contract ratio table
  if (D.panelRatio !== undefined) {
    const want = tables.draft.gatherRatios[sem.gatherType];
    const dev = (D.panelRatio / want - 1) * 100;
    const ok = Math.abs(dev) <= THRESHOLD;
    if (!ok) fail(`[${styleKey}] panelCutWidth ratio ${D.panelRatio.toFixed(3)} vs contract ${want} deviates ${dev.toFixed(1)}%`);
    rows.push(`  panelCutWidth draft ratio ${D.panelRatio.toFixed(3)}  contract ${want}  dev ${(dev >= 0 ? '+' : '') + dev.toFixed(1)}%  ${ok ? 'OK' : 'FAIL'}`);
  }
  console.log(rows.join('\n'));
}

// ---- 3. shared-packer guard (K0 finding 4.3) --------------------------------
// The assembled preview (web/js/render.js appendAssembledPreview) must keep
// using the SAME packer + sheet renderer the print pipeline uses (web/js/
// sheet.js packPieces/usedCells/sheetInner). A private preview packer would
// reopen the preview<->pattern gap this whole test exists to close.
{
  const renderJs = readFileSync(join(root, 'web/js/render.js'), 'utf8');
  for (const sym of ['packPieces', 'usedCells', 'sheetInner']) {
    if (!renderJs.includes(sym)) fail(`web/js/render.js no longer references sheet.js '${sym}' — assembled preview drifted off the shared print packer (K0 4.3 guard)`);
  }
  const previewBlock = renderJs.match(/appendAssembledPreview[\s\S]*?\n\}/);
  if (!previewBlock) fail('web/js/render.js: appendAssembledPreview not found (K0 4.3 guard)');
  if (!failures) console.log('\nshared-packer guard OK: assembled preview renders through sheet.js packPieces/usedCells/sheetInner (one packer truth).');
}

if (failures) { console.error(`\npreview-truth: ${failures} FAILURE(S)`); process.exit(1); }
console.log(`\nOK  preview-truth green across ${styleKeys.length} styles: structural equality holds (declared gaps allowlisted with contract refs), landmark deviations within the 8% threshold or pinned to contract-declared stylisations.`);
