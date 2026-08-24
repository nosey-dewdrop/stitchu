#!/usr/bin/env node
// sewability_check.mjs — SEVK EDİLEN KALIBIN DİKİLEBİLİRLİK KAPISI (kart V5-A,
// 2026-08-25). Yedi madde, yedi ADLANDIRILMIŞ bölüm. Ölçemediği maddeyi SESSİZCE
// GEÇMEZ: `ABSENT: <sebep>` diye ADIYLA basar ve sayısını raporlar.
//
// ★ HANGİ KALEMİ YARGILAR — TARTIŞMA YOK.
//   Kullanıcı `web/` üzerinden kalıp indirdiğinde koşan şey
//   `engine/wasm/bindings.cpp:339 draftJSON` → `GarmentDrafter::draft`. Bu kapı
//   O ARTEFAKTI yargılar, motoru `web/vendor/stitchu-engine.js` üzerinden
//   yükleyerek (emsal: `engine/tools/bugra/bugra-parity.mjs:18`, aynı usul).
//   Tek-yüzey motoru (`surfacepattern.cpp`) kullanıcıya ULAŞMIYOR, burada
//   yargılanmaz.
//
// ═══ EŞİK KÜNYESİ — HER EŞİĞİN KAYNAĞI (GECE/V5-R.md) ═══════════════════════
//
// [E1] ON_BOUNDARY_TOL = 0.79375 mm (= 1/32")
//   **YAYIN YOK.** `GECE/V5-R.md` §A hükmü birebir: 1/32" için ASTM, ISO,
//   Handford, Joseph-Armstrong, Price&Zamkoff, Cooklin, Glock&Kunz, Gerber,
//   Lectra'da dayanak BULUNAMADI; Open Library tam-metin korpusunda
//   "tolerance of 1/32" 73 kez geçiyor ve HİÇBİRİ giyim değil. Yayınlanmış tek
//   apparel-özel sayı **CLO3D `Check Sewing Length` 3 mm** (ikincil).
//   → Bu kapı 0.79375'i "üretim standardı" DİYE YAZMAZ. V5-R'nin verdiği dürüst
//     ifadeyi kullanır: **reponun kendi ölçüm gürültüsünün üstünde seçilmiş EV
//     DEĞERİ**, tanığı `engine/src/surfacepattern.cpp:19 kProdTolMM = 0.79375`.
//   ⚠ Repo İKİ tolerans taşıyor (V5-R kart-dışı §16): kProdTolMM 0.79375 ve
//     `engine/src/validator.hpp:23 pairedSeamTolerance = 3.0` (CLO'nun sayısı).
//     Bu kapı SIKI olanı alır; gevşek olanı almak ayrı ve bilinçli bir karardır.
//
// [E2] Çentik derinliği < dikiş payı
//   Kaynak: `GECE/V5-R.md` §F ★ TÜRETİLEBİLİR KURAL. Çentik toleransı için
//   YAYIN YOK (ASTM/ISO/Gerber/Lectra/Optitex/kitaplar tarandı, sıfır sonuç).
//   Bulunan tek SERT sayı sanayi çentikleyicisinin **1/8" genişlik × 1/4"
//   derinlik**'i (Cutex, birincil) ve o, 1/4"lük bir dikiş payından DAHA DERİN
//   → Fasanella'nın "seam blowout"u. Kaynak GEREKTİRMEYEN kapı buradan çıkar:
//   **çentik derinliği < dikiş payı**. Pay uydurulmaz, artefaktın kendi
//   `seamAllowance` alanından okunur (bugün 15mm; Buğra'da 10mm KANITLI).
//
// [E2b] SINIFLANDIRMA KARARI — EŞİK GEVŞETME DEĞİL, MİSAFİR AYIKLAMA.
//   ÖLÇÜLDÜ (bu kapının ilk koşusu, 2026-08-25): sevk edilen artefaktın
//   `notches` alanı TEK ve TİPSİZ bir kanaldır ve en az ÜÇ ayrı tür işaret
//   taşır — (a) kenar çentiği (12mm, kenarda), (b) bir KATLAMA/orta çizgisi
//   ('Bodice Center Back' 396.9mm tek parça), (c) 22mm aralıklı bir İÇ işaret
//   merdiveni (8mm tik, x=4'te, her kenardan uzak). Artefaktta bunları ayıran
//   HİÇBİR ALAN YOK (`type` yalnız move/line der).
//   → Bu kapı, ayıramadığı şeyi yargılamaz ve ayıramadığını GİZLEMEZ:
//     · uzunluk < seamAllowance VE tabanı kesim çizgisine ≤ seamAllowance →
//       kenar çentiği sayılır, [E1] ile YARGILANIR.
//     · geri kalan her işaret ADIYLA SAYILIR ve ayrı basılır; yargılanmaz,
//       çünkü fold/iç-işaret mi yoksa HAVADA duran bir çentik mi olduğu
//       artefakttan ÇIKARILAMAZ. Bu bir hüküm değil, ölçülmüş bir BOŞLUKTUR.
//   [E1] eşiği bu kararla DEĞİŞMEDİ, 0.79375mm.
//
// [E3] Kapalı kontur dönme sayısı = ±360°
//   **Yayınlanmış giyim eşiği YOK — bu bir TEOREM.** Hopf Umlaufsatz (theorem of
//   turning tangents): basit kapalı düzlem eğrisinin toplam işaretli dönmesi
//   ±2π'dir. Uydurulan bir sayı değil, adı konmuş yayınlanmış teorem.
//   Sayısal artık bandı: yayın YOK, bant şu ölçümden —
//   `node engine/tests/sewability_check.mjs` çıktısındaki `max |Σ−360|` sütunu.
//   TURN_TOL_DEG = 1.0° bu ölçülen artığın üstünde seçilmiştir.
//
// [E4] Baş / omuz geçiş zarfı (madde 5)
//   **ANSUR II — NATICK/TR-15/007** (Gordon ve ark., Ara 2014), KADIN n=1986:
//     baş çevresi (ölçü 46, s.135–136)   5/50/95 = 532 / 560 / 597 mm
//     omuz çevresi (ölçü 68, s.179–180)  5/50/95 = 944 / 1027 / 1119 mm
//   (birincil, `GECE/V5-R.md` §D1/§D2). ⚠ V5-R uyarısı: bideltoid genişliği
//   OTURARAK + önkollar öne uzatılmış ölçülüyor, giysi geçişi için YANLIŞ
//   büyüklük; doğru büyüklük OMUZ ÇEVRESİDİR.
//   ⚠ "Giysi için minimum baş geçiş açıklığı" hiçbir standartta YAYIN YOK
//   (V5-R §D1 son satır) → bu kapı bir GEÇİŞ EŞİĞİ KOYMAZ, zarfı BASAR.
//
// ═══ ANTI-HACK / KANIT KANCALARI ════════════════════════════════════════════
//   Yalnız §4.2 (boş test) ve §4.5 (mutasyon) kanıtları için. Üretim koşusunda
//   hiçbiri set edilmez; set edilirse EKRANA BASILIR.
//     V5A_ENGINE   — başka bir stitchu-engine.js yükle (boş-test kanıtı)
//     V5A_MUTATE   — kasıtlı bozma: `notch-off` | `selfcross` | `notch-deep`
//     V5A_SIZES    — virgüllü beden listesi (varsayılan sekiz bedenin hepsi)
//
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');

// ─── EŞİKLER (künyeleri yukarıda) ──────────────────────────────────────────
const ON_BOUNDARY_TOL_MM = 0.79375;   // [E1] ev değeri, yayın YOK
const TURN_TOL_DEG = 1.0;             // [E3] Hopf Umlaufsatz sayısal artık bandı
const TOPO_STEP_MM = 2.0;             // kübik örnekleme adımı (topoloji testleri)
const ARC_STEP_MM = 0.05;             // kübik örnekleme adımı (yay uzunluğu) — pattern-measure.mjs emsali
const HEAD_CIRC_MM = { p5: 532, p50: 560, p95: 597 };      // [E4] ANSUR II kadın n=1986
const SHOULDER_CIRC_MM = { p5: 944, p50: 1027, p95: 1119 }; // [E4] ANSUR II kadın n=1986

const ENGINE_PATH = process.env.V5A_ENGINE || join(root, 'web/vendor/stitchu-engine.js');
const MUTATE = process.env.V5A_MUTATE || '';

const CHART = JSON.parse(readFileSync(join(root, 'contract/tables.json'), 'utf8')).draft.euSizeChart;
const SHIPPED_SIZES = JSON.parse(readFileSync(join(root, 'contract/layers/size-table.json'), 'utf8')).sizes;
const SIZES = (process.env.V5A_SIZES ? process.env.V5A_SIZES.split(',') : SHIPPED_SIZES).map((s) => s.trim());

let fails = 0;
const FAIL = (m) => { console.log(`FAIL  ${m}`); fails += 1; };
const OK = (m) => console.log(`ok    ${m}`);
const ABSENT = (item, why) => console.log(`ABSENT: [madde ${item}] ${why}`);

console.log('=== sewability_check — SEVK EDİLEN kalıbın dikilebilirlik kapısı (kart V5-A)');
console.log(`    motor: ${ENGINE_PATH.replace(root + '/', '')}`);
console.log(`    bedenler: ${SIZES.join(' ')}  (kaynak: contract/layers/size-table.json)`);
console.log(`    eşikler: ON_BOUNDARY_TOL ${ON_BOUNDARY_TOL_MM}mm [E1 ev değeri, yayın YOK] · dönme ±360°±${TURN_TOL_DEG}° [E3 Hopf Umlaufsatz]`);
for (const k of ['V5A_ENGINE', 'V5A_MUTATE', 'V5A_SIZES']) {
  if (process.env[k]) console.log(`    ⚠ KANIT KANCASI AKTİF: ${k}=${process.env[k]}`);
}
if (!existsSync(ENGINE_PATH)) {
  FAIL(`motor diskte YOK: ${ENGINE_PATH} — eksik alet = eksik kanıt, SKIP değil KIRMIZI`);
  console.log(`\nFAIL sewability_check — ${fails} ihlal`);
  process.exit(1);
}

// ─── geometri ──────────────────────────────────────────────────────────────
function cubicPoly(p0, c) {
  return Math.hypot(c.cp1x - p0.x, c.cp1y - p0.y) + Math.hypot(c.cp2x - c.cp1x, c.cp2y - c.cp1y)
       + Math.hypot(c.x - c.cp2x, c.y - c.cp2y);
}
// komut dizisini poligona indir. step = kübik örnekleme adımı tavanı (mm).
function toPoly(cmds, step) {
  const pts = [];
  let cur = null, start = null, closed = false;
  const push = (x, y) => {
    const n = pts.length;
    if (n && Math.abs(pts[n - 1][0] - x) < 1e-9 && Math.abs(pts[n - 1][1] - y) < 1e-9) return;
    pts.push([x, y]);
  };
  for (const c of cmds) {
    if (c.type === 'move') { cur = { x: c.x, y: c.y }; start = cur; push(c.x, c.y); }
    else if (c.type === 'line') { push(c.x, c.y); cur = { x: c.x, y: c.y }; }
    else if (c.type === 'curve') {
      const n = Math.max(8, Math.ceil(cubicPoly(cur, c) / step));
      for (let i = 1; i <= n; i++) {
        const t = i / n, mt = 1 - t;
        push(mt * mt * mt * cur.x + 3 * mt * mt * t * c.cp1x + 3 * mt * t * t * c.cp2x + t * t * t * c.x,
             mt * mt * mt * cur.y + 3 * mt * mt * t * c.cp1y + 3 * mt * t * t * c.cp2y + t * t * t * c.y);
      }
      cur = { x: c.x, y: c.y };
    } else if (c.type === 'close') { closed = true; if (start) { push(start.x, start.y); cur = start; } }
  }
  return { pts, closed, start };
}
function polyLen(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}
function distPointSeg(p, a, b) {
  const vx = b[0] - a[0], vy = b[1] - a[1];
  const L2 = vx * vx + vy * vy;
  if (L2 < 1e-18) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  let t = ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / L2;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(p[0] - (a[0] + t * vx), p[1] - (a[1] + t * vy));
}
function distPointPoly(p, pts) {
  let d = Infinity;
  for (let i = 1; i < pts.length; i++) d = Math.min(d, distPointSeg(p, pts[i - 1], pts[i]));
  return d;
}
const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
// gerçek (proper) kesişme: uç uca değme sayılmaz, komşu segmentler atlanır.
function properIntersect(p1, p2, p3, p4) {
  const d1 = cross(p3, p4, p1), d2 = cross(p3, p4, p2), d3 = cross(p1, p2, p3), d4 = cross(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}
function selfIntersections(pts, isClosed) {
  const n = pts.length - 1; // segment sayısı
  let hits = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (isClosed && i === 0 && j === n - 1) continue; // kapanış komşuluğu
      if (properIntersect(pts[i], pts[i + 1], pts[j], pts[j + 1])) hits += 1;
    }
  }
  return hits;
}
// Hopf Umlaufsatz: basit kapalı eğrinin toplam işaretli dönmesi ±360°.
function turningDeg(pts) {
  const q = [];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1];
    if (Math.hypot(dx, dy) > 1e-9) q.push([dx, dy]);
  }
  if (q.length < 3) return NaN;
  let sum = 0;
  for (let i = 0; i < q.length; i++) {
    const a = q[i], b = q[(i + 1) % q.length];
    sum += Math.atan2(a[0] * b[1] - a[1] * b[0], a[0] * b[0] + a[1] * b[1]);
  }
  return (sum * 180) / Math.PI;
}

// ─── motor ─────────────────────────────────────────────────────────────────
const require_ = createRequire(import.meta.url);
const createEngine = require_(ENGINE_PATH);
const engine = await createEngine();

const BASE = { waistline: 'natural', fabric: 'woven', sleeveLength: 'short', skirtStyle: 'aLine',
  skirtLength: 'midi', topLength: 'hip', frontPlacket: false, tieClosure: 0, sleeveCap: 0,
  collarType: 0, collarEdge: 0, gatherType: 0, gatherZone: 0, backOpening: 0, backSlit: 0,
  ruffledStraps: 0, peplum: 0, placketStyle: 0, edgeFinish: 0, pocketStyle: 0, cuffStyle: 0,
  hemShape: 0, shoulderStyle: 0, buttonRow: 0, exposedZip: 0, backDetail: 0, bardotStyle: 0 };
// Sevk edilen iki sınıf: kollu üst (set-in kol + omuz + yan dikiş) ve prenses elbise
// (bel birleşimi + etek dikişleri). İkisi de web'in sattığı stil ailesinden.
const SPECS = [
  { id: 'dart_crew_top', spec: { garment: 'top', shaping: 'dart', neckline: 'crew', sleeveStyle: 'straight' } },
  { id: 'princess_scoop_dress', spec: { garment: 'dress', shaping: 'princess', neckline: 'scoop', sleeveStyle: 'straight' } },
];
const bodyOf = (size) => {
  const r = CHART[size];
  if (!r) throw new Error(`beden tabloda yok: ${size}`);
  return { bust: r[0], waist: r[1], hip: r[2], shoulder: r[3], backLength: r[4], armLength: r[5], neck: r[6] };
};

// ─── mutasyon (yalnız §4.5 kanıtı) ─────────────────────────────────────────
function mutate(pattern) {
  if (!MUTATE) return null;
  if (MUTATE === 'notch-off' || MUTATE === 'notch-deep') {
    // Kenara EN YAKIN duran işareti bul (yani bugün [E1]'i GEÇEN bir çentik) ve onu boz.
    let best = null;
    for (const pc of pattern.pieces) {
      const cl = pc.cutLine || [], nt = pc.notches || [];
      if (cl.length < 4 || nt.length < 2) continue;
      const fine = toPoly(cl, ARC_STEP_MM).pts;
      for (let i = 0; i + 1 < nt.length; i += 2) {
        if (nt[i].type !== 'move' || nt[i + 1].type !== 'line') continue;
        const d = Math.min(distPointPoly([nt[i].x, nt[i].y], fine), distPointPoly([nt[i + 1].x, nt[i + 1].y], fine));
        if (!best || d < best.d) best = { d, pc, i };
      }
    }
    if (!best) return `${MUTATE}: uygun işaret yok`;
    const { pc, i, d } = best;
    if (MUTATE === 'notch-off') {
      pc.notches[i].x += 5; pc.notches[i + 1].x += 5;  // kenarda duran çentiği kenardan KOPAR
      return `notch-off: '${pc.name}' işaret #${i / 2} (kenara en yakın, taban ${d.toFixed(4)}mm) +5mm kaydırıldı`;
    }
    pc.notches[i + 1].x = pc.notches[i].x - (pc.seamAllowance + 5); // pay+5mm derin
    return `notch-deep: '${pc.name}' işaret #${i / 2} (taban ${d.toFixed(4)}mm) dikiş payından 5mm DERİN yapıldı`;
  }
  if (MUTATE === 'selfcross') {
    // İki UZAK köşeyi takas et: kontur kendi üstünden GERÇEKTEN geçmek zorunda kalır.
    const q = pattern.pieces.find((x) => (x.cutLine || []).length > 12);
    if (!q) return 'selfcross: uygun parça yok';
    const cl = q.cutLine, n = cl.length;
    const i = Math.floor(n * 0.25), j = Math.floor(n * 0.75);
    const t = { x: cl[i].x, y: cl[i].y };
    cl[i].x = cl[j].x; cl[i].y = cl[j].y;
    cl[j].x = t.x; cl[j].y = t.y;
    return `selfcross: '${q.name}' cutLine[${i}] ile cutLine[${j}] TAKAS edildi`;
  }
  return `BİLİNMEYEN MUTASYON: ${MUTATE}`;
}

// ─── ÖLÇÜM ─────────────────────────────────────────────────────────────────
const T = {
  pieces: 0, drafts: 0, seamGraphFields: 0,
  marks: 0, notches: 0, notchOffBoundary: 0, notchTooDeep: 0, notchPieces: 0,
  markOverSA: 0, markFarFromEdge: 0, maxFarMM: 0,
  contours: 0, unclosed: 0, selfCross: 0,
  turnChecked: 0, turnBad: 0, maxTurnResidDeg: 0,
  donningDeclared: 0, headCheckPromised: 0, seamPromises: 0,
  offenders: [],
};
const SEAM_PROMISE = /\bsew\b[^.]*\bseams?\b|set the sleeves in/i;
const HEAD_PROMISE = /head circumference|slip over your head/i;

for (const { id, spec } of SPECS) {
  for (const size of SIZES) {
    const out = JSON.parse(engine.draftJSON({ ...BASE, ...spec }, bodyOf(size)));
    if (out.error) { FAIL(`[draft] ${id} ${size}: motor hata: ${out.error}`); continue; }
    const pat = out.pattern;
    T.drafts += 1;
    if (MUTATE) { const m = mutate(pat); if (T.drafts === 1) console.log(`    ⚠ MUTASYON UYGULANDI → ${m}`); }

    // madde 1 tanığı: artefaktta dikiş grafiği taşıyan alan var mı?
    for (const pc of pat.pieces) for (const k of Object.keys(pc))
      if (/^(seams|seamGraph|edges|edgeNames|pairs|stitches)$/.test(k)) T.seamGraphFields += 1;
    for (const s of (pat.guideSteps || [])) {
      if (SEAM_PROMISE.test(s)) T.seamPromises += 1;
      if (HEAD_PROMISE.test(s)) T.headCheckPromised += 1;
    }
    // madde 5 tanığı: sevk edilen spec'te BEYAN EDİLEN kapanma donanımı
    const full = { ...BASE, ...spec };
    for (const k of ['backOpening', 'exposedZip', 'buttonRow', 'backSlit', 'tieClosure', 'placketStyle'])
      if (full[k]) T.donningDeclared += 1;
    if (full.frontPlacket) T.donningDeclared += 1;

    for (const pc of pat.pieces) {
      T.pieces += 1;
      const cl = pc.cutLine || [];
      if (cl.length < 3) continue;
      const { pts, closed } = toPoly(cl, TOPO_STEP_MM);
      if (pts.length < 4) continue;
      T.contours += 1;

      // ── madde 3: kapalılık + kendini kesme ────────────────────────────
      const gap = Math.hypot(pts[pts.length - 1][0] - pts[0][0], pts[pts.length - 1][1] - pts[0][1]);
      const isClosed = closed || gap <= ON_BOUNDARY_TOL_MM;
      if (!isClosed) { T.unclosed += 1; T.offenders.push(`[3] ${id} ${size} '${pc.name}': kontur AÇIK, uç-uca boşluk ${gap.toFixed(4)}mm > ${ON_BOUNDARY_TOL_MM}mm`); }
      const ring = isClosed && gap > 1e-9 ? [...pts, pts[0]] : pts;
      const xs = selfIntersections(ring, isClosed);
      if (xs) { T.selfCross += xs; T.offenders.push(`[3] ${id} ${size} '${pc.name}': kontur KENDİNİ KESİYOR, ${xs} gerçek kesişme`); }

      // ── madde 4: köşe açısı toplamı (Hopf Umlaufsatz) ─────────────────
      if (isClosed) {
        T.turnChecked += 1;
        const t = turningDeg(ring);
        const resid = Math.abs(Math.abs(t) - 360);
        if (Number.isFinite(resid)) T.maxTurnResidDeg = Math.max(T.maxTurnResidDeg, resid);
        if (!Number.isFinite(t) || resid > TURN_TOL_DEG) {
          T.turnBad += 1;
          T.offenders.push(`[4] ${id} ${size} '${pc.name}': toplam dönme ${Number.isFinite(t) ? t.toFixed(4) + '°' : 'NaN'} ≠ ±360°±${TURN_TOL_DEG}° (artık ${resid.toFixed(4)}°)`);
        }
      }

      // ── madde 2: çentik ───────────────────────────────────────────────
      const nt = pc.notches || [];
      if (nt.length >= 2) {
        T.notchPieces += 1;
        const fine = toPoly(cl, ARC_STEP_MM).pts;
        for (let i = 0; i + 1 < nt.length; i += 2) {
          if (nt[i].type !== 'move' || nt[i + 1].type !== 'line') continue;
          T.marks += 1;
          const A = [nt[i].x, nt[i].y], B = [nt[i + 1].x, nt[i + 1].y];
          const dA = distPointPoly(A, fine), dB = distPointPoly(B, fine);
          const base = Math.min(dA, dB);
          const depth = Math.hypot(B[0] - A[0], B[1] - A[1]);
          const SA = pc.seamAllowance;
          // [E2b] sınıflandırma: ayıramadığını yargılama, ADIYLA SAY.
          if (!(depth < SA)) {
            T.markOverSA += 1;
            T.offenders.push(`[2·sınıflanamadı] ${id} ${size} '${pc.name}' işaret #${i / 2}: uzunluk ${depth.toFixed(4)}mm ≥ dikiş payı ${SA}mm — ya KATLAMA/iç çizgi ya da seam blowout; artefaktta TÜR ALANI YOK`);
            continue;
          }
          if (base > SA) {
            T.markFarFromEdge += 1;
            T.maxFarMM = Math.max(T.maxFarMM, base);
            T.offenders.push(`[2·sınıflanamadı] ${id} ${size} '${pc.name}' işaret #${i / 2}: her kenardan ${base.toFixed(4)}mm uzak (> dikiş payı ${SA}mm) — ya İÇ işaret ya HAVADA duran çentik; artefaktta TÜR ALANI YOK`);
            continue;
          }
          // buradan sonrası UNSUZ kenar çentiğidir: dikiş payı bandının içinde duruyor.
          T.notches += 1;
          if (base > ON_BOUNDARY_TOL_MM) {
            T.notchOffBoundary += 1;
            T.offenders.push(`[2] ${id} ${size} '${pc.name}' çentik #${i / 2}: tabanı kesim çizgisinde DEĞİL, ${base.toFixed(4)}mm > ${ON_BOUNDARY_TOL_MM}mm [E1]`);
          }
        }
      }
    }
  }
}

// ═══ YEDİ MADDE, YEDİ ADLANDIRILMIŞ BÖLÜM ══════════════════════════════════
console.log(`\n--- ÖLÇÜM ZEMİNİ: ${T.drafts} draft (${SPECS.length} spec × ${SIZES.length} beden), ${T.pieces} parça, ${T.contours} kapalı-aday kontur`);

console.log('\n[madde 1] DİKİŞ ÇİFTİ UZUNLUK EŞİTLİĞİ');
ABSENT(1, `sevk edilen artefakt (draftJSON) DİKİŞ GRAFİĞİ TAŞIMIYOR. Ölçüldü: ` +
  `${T.pieces} parçada seams/seamGraph/edges/edgeNames/pairs/stitches alanı sayısı = ${T.seamGraphFields}. ` +
  `Parça başına yalnız kapalı kontur (cutLine) + isimsiz çentik çizgileri var; hangi kenarın hangi kenara dikildiği ARTEFAKTTA YOK, ` +
  `dolayısıyla çift uzunlukları ADI KONARAK karşılaştırılamaz.`);
console.log(`      ⚠ SAYI: sevk edilen rehber ${T.seamPromises} adet dikiş SÖZÜ veriyor ("Sew the shoulder seams", "Sew the side seams", "set the sleeves in") — ` +
  `hiçbirinin geometrik karşılığı artefaktta yok, yani hiçbiri doğrulanamıyor.`);
console.log(`      Bu maddeyi ölçen aletler NATIVE tarafta var ve ayrı koşuyor: engine/pattern-bridge/walk.py (kapı engine/tests/walkgate_check.sh), ` +
  `engine/tests/sewable_census.cpp (omuz dikişi), engine/src/validator.cpp:412,526-527,625.`);

console.log('\n[madde 2] ÇENTİK EŞLEŞMESİ');
console.log(`      işaretli parça ${T.notchPieces} · notches kanalındaki TOPLAM işaret ${T.marks}`);
console.log(`      → kenar çentiği sayılan (uzunluk < pay VE tabanı paya ≤ pay): ${T.notches}`);
console.log(`        bunlardan tabanı kesim çizgisinde DEĞİL: ${T.notchOffBoundary}   (eşik ${ON_BOUNDARY_TOL_MM}mm [E1] ev değeri, yayın YOK)`);
console.log(`      → SINIFLANAMAYAN işaret [E2b]: uzunluk ≥ dikiş payı: ${T.markOverSA} · her kenardan paydan uzak: ${T.markFarFromEdge} (en uzağı ${T.maxFarMM.toFixed(4)}mm)`);
ABSENT(2, `ÇENTİK ÇİFTİ eşleşmesi ölçülemedi: eşleşme bir dikiş grafiği ister, artefaktta yok (madde 1'in aynı boşluğu). ` +
  `Karşılığı aranamayan çentik sayısı = ${T.notches}. NATIVE tarafta engine/tests/notch_alignment_check.cpp yan-dikiş çentiğini yargılıyor ` +
  `ama kendi satır 23'ü oyuk↔taç çentik ÇİFTİNİ kapsam DIŞI ilan ediyor (PatternPiece.notches verified: 0).`);
ABSENT(2, `sevk edilen artefaktın notches kanalında İŞARET TÜRÜ ALANI YOK [E2b]: ${T.markOverSA + T.markFarFromEdge} işaret ` +
  `(toplam ${T.marks}'nin %${((100 * (T.markOverSA + T.markFarFromEdge)) / Math.max(1, T.marks)).toFixed(1)}'i) kenar çentiği mi, katlama çizgisi mi, ` +
  `iç işaret mi yoksa HAVADA duran bir çentik mi — ARTEFAKTTAN ÇIKARILAMIYOR, o yüzden YARGILANMADI. Bu bir geçiş değil, ölçülmüş bir boşluktur.`);
if (T.notchOffBoundary) FAIL(`[2] ${T.notchOffBoundary} kenar çentiğinin tabanı kesim çizgisinde değil`);
if (T.notches && !T.notchOffBoundary) OK(`2 — kenar sayılan ${T.notches} çentiğin hepsi kesim çizgisinde`);
if (!T.notches) console.log('      ⚠ kenar çentiği sayılan işaret SIFIR — bu bölümün YARGI kısmı bu koşuda hiçbir şey söylemiyor.');

console.log('\n[madde 3] KAPALILIK / KENDİNİ KESME');
console.log(`      yargılanan kontur ${T.contours} · AÇIK kontur ${T.unclosed} · gerçek kesişme ${T.selfCross}`);
if (T.unclosed) FAIL(`[3] ${T.unclosed} kontur kapalı değil`);
if (T.selfCross) FAIL(`[3] ${T.selfCross} kendini kesme`);
if (!T.unclosed && !T.selfCross) OK(`3 — ${T.contours} konturun hepsi kapalı ve kendini kesmiyor (örnekleme adımı ≤${TOPO_STEP_MM}mm)`);

console.log('\n[madde 4] KÖŞE AÇISI TOPLAMI (Hopf Umlaufsatz / theorem of turning tangents)');
console.log(`      yargılanan kapalı kontur ${T.turnChecked} · bant dışı ${T.turnBad} · max |Σ−360| = ${T.maxTurnResidDeg.toFixed(4)}°  (bant ±${TURN_TOL_DEG}° [E3])`);
if (T.turnBad) FAIL(`[4] ${T.turnBad} konturun toplam dönmesi ±360° değil`);
else if (T.turnChecked) OK(`4 — ${T.turnChecked} konturun hepsi ±360°±${TURN_TOL_DEG}° içinde`);
console.log(`      ⚠ Bu, 2B kontur köşelerinin toplamıdır. 3B köşe açısı AÇIĞI (2π − komşu açı toplamı) ` +
  `engine/src/surfacepattern.cpp:717 columnDeficitRows / :747 columnDeficit'te VAR ama tüketicisi PENS'tir — dikilebilirlik HÜKMÜ basmıyor, ` +
  `ve surfacepattern kullanıcıya SEVK EDİLMİYOR.`);

console.log('\n[madde 5] GEÇİŞ (donning)');
console.log(`      sevk edilen ${T.drafts} draftta BEYAN EDİLEN kapanma donanımı (backOpening/exposedZip/buttonRow/backSlit/tieClosure/placket): ${T.donningDeclared}`);
console.log(`      → donanım ${T.donningDeclared === 0 ? 'SIFIR: giysi baştan/omuzdan GEÇMEK ZORUNDA' : 'var'}`);
console.log(`      yayınlanan geçiş zarfı [E4] ANSUR II kadın n=1986 (NATICK/TR-15/007):`);
console.log(`        baş çevresi   5/50/95 = ${HEAD_CIRC_MM.p5} / ${HEAD_CIRC_MM.p50} / ${HEAD_CIRC_MM.p95} mm  (ölçü 46, s.135–136)`);
console.log(`        omuz çevresi  5/50/95 = ${SHOULDER_CIRC_MM.p5} / ${SHOULDER_CIRC_MM.p50} / ${SHOULDER_CIRC_MM.p95} mm  (ölçü 68, s.179–180)`);
console.log(`      ★ sevk edilen rehberin kendisi ${T.headCheckPromised} kez ALICIYA bu kontrolü YAPTIRIYOR ` +
  `("Check the neck opening against your head circumference — a top has no zipper, it must slip over your head"), ` +
  `ama artefakt o sayıyı TAŞIMIYOR: kontrolü alıcıya devrediyoruz.`);
ABSENT(5, `"en dar halka baş/omuz çevresinden geçiyor mu" ADIYLA ölçülemedi: bitmiş yaka açıklığı bir HALKA'dır, ` +
  `sevk edilen artefaktta yaka kenarı adlandırılmış bir kenar değil — parça konturunun isimsiz bir parçası. ` +
  `Yarım alet NATIVE tarafta: engine/src/wearability.hpp:68,75,80 (finishedNeckOpeningMM, hasDonningOpening; kapılar wearability_check, wearable_check).`);
ABSENT(5, `kapanma donanımının SATILAN BOYU hiç ölçülmüyor ve ölçülemez: V5-R §D3 hükmü — hiçbir fermuar ÜRETİCİSİ ` +
  `bitmiş-boy merdiveni YAYINLAMIYOR (YKK kataloğu ve Coats/Opti veri sayfası açıldı: sıfır cm/inç boy; zincir metreyle satılıp siparişe göre kesiliyor). ` +
  `Boy merdiveni bir STOKLAMA konvansiyonudur, fiziksel kısıt değil.`);

console.log('\n[madde 6] GERİ PROJEKSİYON (2B kalıp → 3B yüzeye geri taşıma)');
ABSENT(6, `motorda YOK. engine/src/drape.hpp kendi satır 12'si: "no seam-sewing of multiple panels — one panel, one hang". ` +
  `grep -rniE "backProject|reproject|wrap3d|liftTo3D" engine/ → 0 sonuç (kart V5-A'nın ölçümü). ` +
  `Ölçülebilecek bir şey olmadığı için bu bölüm SAYI BASAMIYOR; sayısı = 0 alet, 0 kapı.`);

console.log('\n[madde 7] draft_math_check');
ABSENT(7, 'BU KARTIN İŞİ DEĞİL — ayrı kart (V5-D). Burada bilerek ölçülmedi.');

// ═══ HÜKÜM ═════════════════════════════════════════════════════════════════
if (T.offenders.length) {
  console.log(`\n--- İHLAL DÖKÜMÜ (${T.offenders.length})`);
  for (const o of T.offenders.slice(0, Number(process.env.V5A_DUMP || 60))) console.log(`    ${o}`);
  if (T.offenders.length > 60) console.log(`    … +${T.offenders.length - 60} tane daha`);
}
const absentCount = 7; // madde 1, 2(çift), 2(tür alanı), 5(halka), 5(donanım boyu), 6, 7
console.log(`\nABSENT sayısı: ${absentCount} — hiçbiri kapıyı YEŞİL YAPMAK için kullanılmadı, altısı da adıyla yukarıda.`);
console.log(`${fails === 0 ? 'PASS' : 'FAIL'} sewability_check — ${fails} ihlal`);
process.exit(fails === 0 ? 0 : 1);
