// web/lib/siluet-ciz.js — SILUET -> FLAT. URUNUN TEK FLAT KALEMI.
//
// 11 Eyl 2026, G2: bugune kadar web'de IKI flat cizici yasiyordu ve KULLANICININ
// GORDUGU taraf yanlis olandi. Olculen celiski: web/lib/flat-from-pattern.js
// KOL_ACI_MIN_DEG = 20 yaziyordu, contract/flat-convention-v1.json
// sevkPoz.kolAcisiDeg.min = 65 diyordu — kod sozlesmeyi ihlal ediyordu ve canli
// olan koddu. flat_mirror_check (3 ihlal) ve cizim_giysi_mi (kol acisi 32-40
// derece, band [65,70]) tam olarak bunu olcuyordu. Iki dosya da silindi.
//
// KALAN TEK KALEM BUDUR ve o kalem KOSU/siluet-ciz.mjs'in ta kendisidir —
// KOPYA DEGIL, TASINMIS hali. CLI (KOSU/siluet-ciz.mjs) artik bu dosyayi import
// eder; iki yerde iki geometri yok, tek geometri var.
//
// NE CIZER. Flat, GORDUGUNUN mankene (croquis36) cizilmis halidir. Okuma
// (contract/siluet-v1.json semasi) noktalari manken landmark'larina ORANLA verir
// ve bu dosya YALNIZ o noktalari cizer. Cevre / 1/4 / 2pi / pens payi / bolluk
// YOK; taban elbise YOK; motor (graf) flat'e girmez.
//
// ⛔ OKUMA YOKSA CIZIM YOK. Bir cagiran silueti olmadan, yalniz bir spec'ten
// flat isterse bu dosya ERR_OKUMA_YOK ile REDDEDER. Sessiz varsayilan YASAK:
// "elbise + duz kol" kelimelerinden bir siluet uydurmak, tam olarak silinen
// hattin yaptigi seydi.
//
// ⛔ AYNA SABITI YOK. Kanunun sayilari (mm agirliklari, landmark'lar) bu dosyaya
// KOPYALANMAZ; kanunuKur() ile DISARIDAN verilir. Tarayici contract/'i
// readFileSync edemedigi icin eski kalem sayilari kendi icine yaziyordu ve
// flat_mirror_check'in var olma sebebi oydu. Burada kopyalanacak sayi yok.
//   tarayici: import { kanunuKur, ciz } from './siluet-ciz.js';
//             kanunuKur(await (await fetch('/contract/body-v1.json')).json(),
//                       await (await fetch('/contract/siluet-v1.json')).json());
//   node:     KOSU/siluet-ciz.mjs iki dosyayi diskten okuyup kanunuKur cagirir.

let BODY = null;   // contract/body-v1.json
let CIZ = null;    // contract/siluet-v1.json .cizgi
let LM = null;     // croquis36 landmarklari
let KOLEVI = null; // contract/siluet-v1.json .gorunum.kolevi  (kol evi = KENAR)
let ETEKUCU = null;// contract/siluet-v1.json .gorunum.etekUcu (etek ucu kavisi)

/** Kanunu yukle. Cizim oncesi bir kez cagrilir; sayilar bu dosyada TUTULMAZ. */
export function kanunuKur(bodyV1, siluetV1) {
  if (!bodyV1 || !bodyV1.bedenler || !bodyV1.bedenler.croquis36) {
    throw new Error('ERR_KANUN_YOK: contract/body-v1.json verilmedi (bedenler.croquis36 yok)');
  }
  if (!siluetV1 || !siluetV1.cizgi) {
    throw new Error('ERR_KANUN_YOK: contract/siluet-v1.json verilmedi (.cizgi yok)');
  }
  BODY = bodyV1;
  CIZ = siluetV1.cizgi;
  // KOL EVI ve ETEK UCU: sayilar burada DEGIL, contract/siluet-v1.json'da yasar (bkz. AYNA SABITI YOK).
  KOLEVI = (siluetV1.gorunum && siluetV1.gorunum.kolevi) || null;
  ETEKUCU = (siluetV1.gorunum && siluetV1.gorunum.etekUcu) || null;
  LM = BODY.bedenler.croquis36.landmarklar;
}
export function kanunKurulduMu() { return !!(BODY && CIZ && LM); }
function kanunSart() {
  if (!kanunKurulduMu()) throw new Error('ERR_KANUN_YOK: kanunuKur(body-v1, siluet-v1) cagrilmadi');
}

const lm = (ad) => { const l = LM['landmark.' + ad]; if (!l) throw new Error('landmark yok: ' + ad); return l; };
// ayni ifade baska bedende (kalip: gercek36) — KOSU/siluet-kalip.mjs kullanir
export function noktaBeden(p, bedenId) {
  kanunSart();
  const T = BODY.bedenler[bedenId].landmarklar, l = (ad) => { const q = T['landmark.' + ad]; if (!q) throw new Error('landmark yok: ' + ad); return q; };
  const [xs, ys] = p;
  const mx = /^(\w+)\*(-?[0-9.]+)(?:([+-][0-9.]+))?$/.exec(xs), my = /^(\w+)(?:\.\.(\w+)@([0-9.]+))?(?:([+-][0-9.]+))?$/.exec(ys);
  if (!mx || !my) throw new Error('ifade bozuk: ' + xs + ' / ' + ys);
  let y = l(my[1]).y; if (my[2]) y += (l(my[2]).y - y) * parseFloat(my[3]); if (my[4]) y += parseFloat(my[4]);
  return { x: l(mx[1]).x * parseFloat(mx[2]) + (mx[3] ? parseFloat(mx[3]) : 0), y };
}

// ---- nokta ifadeleri (contract/siluet-v1.json koordinat)
export function nokta(p) {
  if (Array.isArray(p) && typeof p[0] === 'number') return { x: p[0], y: p[1] };
  const [xs, ys] = p;
  const mx = /^(\w+)\*(-?[0-9.]+)(?:([+-][0-9.]+))?$/.exec(xs);
  if (!mx) throw new Error('x ifadesi bozuk: ' + xs);
  const x = lm(mx[1]).x * parseFloat(mx[2]) + (mx[3] ? parseFloat(mx[3]) : 0);
  const my = /^(\w+)(?:\.\.(\w+)@([0-9.]+))?(?:([+-][0-9.]+))?$/.exec(ys);
  if (!my) throw new Error('y ifadesi bozuk: ' + ys);
  let y = lm(my[1]).y;
  if (my[2]) y = y + (lm(my[2]).y - y) * parseFloat(my[3]);
  if (my[4]) y += parseFloat(my[4]);
  return { x, y };
}
const f1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
const P = (p) => `${f1(p.x)} ${f1(p.y)}`;

// ---- egriler
// Catmull-Rom -> kubik Bezier (yumusak yan dikis: koltukalti -> gogus -> bel -> kalca -> etekYan)
function catmull(pts, gerginlik = 0.5) {
  if (pts.length < 2) return '';
  let d = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6 * gerginlik * 2, y: p1.y + (p2.y - p0.y) / 6 * gerginlik * 2 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6 * gerginlik * 2, y: p2.y - (p3.y - p1.y) / 6 * gerginlik * 2 };
    d += ` C ${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return d;
}
// iki nokta arasi kavis: bombe (mm) sag-el normali yonunde (pozitif = saga/asagi tarafa)
function kavis(a, b, bombe) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  return ` Q ${f1(mx + nx * bombe * 2)} ${f1(my + ny * bombe * 2)} ${P(b)}`;
}
const ayna = (p) => ({ x: -p.x, y: p.y });

// ---- KOL EVI: bir KENAR (nokta degil). omuzUc -> koltukalti, GOVDEYE dogru icbukey.
// Kolsuz giyside bu oyuk yoksa dis hat kesintisiz kapanir ve kol deligi kaybolur
// (11-12 Eyl olcumu: hata altin kopyalarda da vardi = sema eksikligi).
// Derinlik contract'tan gelir: gorunum.kolevi.oyukluk (sapma/kiris), OLCULDU 8 bedende.
// s = +1 sag yarim, -1 sol yarim. Yon: kiris normali, govde tarafina (x=0'a dogru).
// OYUK YATAY OLCULUR, kirise dik DEGIL. Sebep (12 Eyl olcumu): okuma omuzUc'u govdeden
// disari tasirdiginda (etsy-08: omuzUc 173.7 vs gogus 138.7) kiris egik olur; kirise dik
// bir sapma o egimi TAKIP eder ve oyuk gorunmez. Satici flat'inde (etsy-08 on) omuz ucu ile
// koltukalti AYNI yari genislikte (162.9 = 162.9), yani kol evi kenari DIKEYE yakindir ve
// oyuk govdeye dogru YATAY isirir. Kenari boyle cizeriz.
function kolEviYolu(ou, ka, s, oyuk) {
  const dy = ka.y - ou.y;
  const sag = Math.abs(dy) * oyuk;          // isirik = dikey dusus x oyukluk
  // iki kontrol noktasi: omuzdan hemen sonra ice gir, koltukaltina dikey tegetle gel.
  // Boylece omuz ucunda KOSE olusur (kol deligi orada baslar) ve yan dikise cusp'siz baglanir.
  const icX = Math.min(Math.abs(ou.x), Math.abs(ka.x)) - sag;
  const c1 = { x: s * Math.max(0, icX), y: ou.y + dy * 0.42 };
  const c2 = { x: s * Math.max(0, icX), y: ou.y + dy * 0.78 };
  return ` C ${P(c1)} ${P(c2)} ${P(ka)}`;
}
const kolEviOyuk = (g) => (g && typeof g.koleviOyuk === 'number')
  ? g.koleviOyuk
  : ((KOLEVI && KOLEVI.oyukluk && KOLEVI.oyukluk.varsayilan) || 0);

// Kol evinin OMUZ UCU: konturun omuzUc'u bandin DIS ucu; kol evi bunun biraz icinden baslar.
// Oran contract'tan (Aldrich s.28 ' 1 cm in from shoulder edge' -> 10/118.1 = 0.0847).
// Boylece omuz uzerinde dar bir bant kalir ve omuz govdeyi assa bile kol deligi GORUNUR.
function kolEviBas(yo, ou) {
  const oran = (KOLEVI && KOLEVI.omuzIceriOran && KOLEVI.omuzIceriOran.varsayilan) || 0;
  if (!yo || !oran) return ou;
  return { x: ou.x + (yo.x - ou.x) * oran, y: ou.y + (yo.y - ou.y) * oran };
}

// ---- ETEK UCU: kavis merkezde asagi sarkar. Sarkma = oran x etek yari genisligi (contract, OLCULDU).
function etekSarkmaHesap(ey) {
  const oran = (ETEKUCU && ETEKUCU.sarkmaOran && ETEKUCU.sarkmaOran.varsayilan) || 0;
  return Math.abs(ey.x) * oran;
}

// ---- yaka bicimleri: yakaOrta (x=0) -> yakaOmuz
// YAKA — SOZLUK DEGIL KOORDINAT (12 Eyl).
// Yaka bir ISIM degildir; orta noktadan omuz noktasina giden bir EGRIDIR.
// bicim: ya bir kontrol-noktasi listesi (oranli: [xOran, yOran] 0..1),
// ya da geriye-uyum icin eski isimlerden biri (isimler asagida SADECE
// kontrol noktasina cevrilir; ciziciye tek satir bile dallanma girmez).
//
// Oranlar: x, omuz noktasinin x'ine gore (0 = orta, 1 = omuz).
//          y, orta ile omuz arasi (0 = orta y, 1 = omuz y).
// Bir isim yerine dogrudan [[0.5,0],[0.86,1]] verilebilir -> yeni yaka
// icin KOD DEGISMEZ. Sinirsizlik buradan gelir.
const YAKA_NOKTALARI = {
  V:         [],                                  // dogrudan cizgi
  kare:      [[1, 0], [1, 1]],                    // kose: once yatay, sonra dikey
  duz:       [[0.62, 0.45]],                      // tek kontrol -> quadratic
  'off-shoulder': [[0.62, 0.45]],
  kalp:      [[0.10, -0.08], [0.36, 0.42], [0.50, 0.45], [0.66, 0.45], [0.96, 0.93], [1, 1]],
  kayik:     [[0.50, 0], [0.86, 1]],
  yuvarlak:  [[0.55, 0], [0.90, 1]],
};

// Kontrol noktasi listesini SVG yol parcasina cevirir. Tek fonksiyon,
// dallanma yok: 0 nokta -> L, 1 nokta -> Q, 2 nokta -> C, 4+ -> zincir C.
function yakaYolu(orta, omuz, bicim, sag = true, kisalt = 0) {
  const s = sag ? 1 : -1;
  const o = { x: s * Math.abs(orta.x), y: orta.y }, m0 = { x: s * Math.abs(omuz.x), y: omuz.y };
  const yuvarlakMi = Array.isArray(bicim) ? false : (bicim === 'kayik' || bicim === 'yuvarlak' || !bicim);
  const m = (kisalt && yuvarlakMi) ? { x: m0.x - s * kisalt, y: m0.y + 0.5 } : m0;

  const kn = Array.isArray(bicim) ? bicim : (YAKA_NOKTALARI[bicim] || YAKA_NOKTALARI.yuvarlak);
  // oran -> mutlak nokta
  const A = ([kx, ky]) => ({ x: m.x * kx, y: o.y + (m.y - o.y) * ky });
  const pts = kn.map(A);

  if (pts.length === 0) return ` L ${P(m)}`;
  if (pts.length === 1) return ` Q ${P(pts[0])} ${P(m)}`;
  if (pts.length === 2) return ` C ${P(pts[0])} ${P(pts[1])} ${P(m)}`;
  // 3n nokta: ardisik kubik zinciri; son hedef m
  let d = '';
  for (let i = 0; i + 2 < pts.length; i += 3) d += ` C ${P(pts[i])} ${P(pts[i + 1])} ${P(pts[i + 2])}`;
  const kalan = pts.length % 3;
  if (kalan === 2) d += ` C ${P(pts[pts.length - 2])} ${P(pts[pts.length - 1])} ${P(m)}`;
  else if (kalan === 1) d += ` Q ${P(pts[pts.length - 1])} ${P(m)}`;
  else d += ` L ${P(m)}`;
  return d;
}

// ---- bir gorunumun dis konturu (kapali yol) + aski / kol / ic ogeler
function gorunumCiz(g, ad, kirmizi, oturma) {
  const K = {}; for (const k of Object.keys(g.kontur)) K[k] = g.kontur[k] ? nokta(g.kontur[k]) : null;
  const KS = {}; if (g.konturSol) for (const k of Object.keys(g.konturSol)) KS[k] = g.konturSol[k] ? nokta(g.konturSol[k]) : null;
  const sag = (k) => K[k], sol = (k) => (KS[k] !== undefined ? KS[k] : K[k]) && ayna(KS[k] !== undefined ? KS[k] : K[k]);
  const yb = g.yakaBicim || 'yuvarlak';
  // yaka ortasi asimetrikse (Leia) konturSol.yakaOrta ile verilir; sag/sol ayri
  const yakaOrtaSag = sag('yakaOrta'), yakaOrtaSol = KS.yakaOrta ? ayna(KS.yakaOrta) : ayna(K.yakaOrta);

  let d = `M ${P(yakaOrtaSag)}`;
  // SAG yarim: yaka -> omuz -> kol oyugu -> yan -> etek
  // gogus noktasi koltukaltiyla ayni hizadaysa (manken: underarm 198 / bust 213 mm) yan dikis yatay baslayip kanca yapiyordu
  // (tur 14 olcumu, 8 numara): o zaman en genis yer koltukaltidir, gogus noktasi yan dikise girmez
  const gogusAyri = K.gogus && K.koltukalti ? Math.abs(K.gogus.y - K.koltukalti.y) >= 30 : true;
  const yanAdlar = ['koltukalti', ...(gogusAyri ? ['gogus'] : []), 'bel', 'kalca', 'etekYan'];
  const yanSag = yanAdlar.map(sag).filter(Boolean);
  const yuvarla = (!g.aski && (yb === 'kayik' || yb === 'yuvarlak')) ? 7 : 0;
  d += yakaYolu(yakaOrtaSag, sag('yakaOmuz'), yb, true, yuvarla);
  if (yuvarla) { const m = sag('yakaOmuz'), o2 = sag('omuzUc'), L2 = Math.hypot(o2.x - m.x, o2.y - m.y) || 1; d += ` Q ${P(m)} ${f1(m.x + (o2.x - m.x) / L2 * yuvarla)} ${f1(m.y + (o2.y - m.y) / L2 * yuvarla)}`; }
  if (g.aski && sag('askiUst')) {
    const a = sag('askiUst'), w = g.aski.genislik || 12, yo = sag('yakaOmuz'), ou = sag('omuzUc');
    // ic kenar: yakaOmuz -> aski ust ic; ust; dis kenar: aski ust dis -> omuzUc  (askilar omuza dogru hafif kavisli)
    // aski dis kenari: ust ucundan govde ust kenarina (askiDip) iner; omuz ucu bloğu cizilmez (tur 25 hakemi)
    const dip = sag('askiDip') || ou;
    d += ` L ${f1(a.x - w / 2)} ${f1(a.y)} L ${f1(a.x + w / 2)} ${f1(a.y)} L ${P(dip)}`;
    if (a.x + w / 2 > lm('shoulderTip').x + 0.5) kirmizi.push(`${ad}: aski ucu manken omuz noktasini asiyor (${f1(a.x + w / 2)} > ${f1(lm('shoulderTip').x)})`);
  } else if (sag('omuzUc')) {
    d += ` L ${P(sag('omuzUc'))}`;
  }
  // kol oyugu / kol: omuzUc -> koltukalti
  const ou = (g.aski && sag('askiDip')) ? sag('askiDip') : sag('omuzUc'), ka = sag('koltukalti');
  if (ou && ka) {
    if (g.kol) d += ` L ${P(ka)}`; // kol uste cizilir, oyuk cizgisi kolun altinda kalir
    // kol evi KENARI: govdeye dogru icbukey; derinlik contract'tan (olculmus oyukluk)
    else { const kb = kolEviBas(sag('yakaOmuz'), ou); d += ` L ${P(kb)}` + kolEviYolu(kb, ka, 1, kolEviOyuk(g)); }
  }
  d += catmull(yanSag, 0.38);
  // etek ucu: etekYan -> etekOrta -> etekYan(sol), sarkik kavis
  const eo = sag('etekOrta'), ey = sag('etekYan');
  const eySol = sol('etekYan');
  if (g.etekFisto) { // fisto etek ucu: dis kontur dalgali (kalin), dis ustunde arc'lar asagi
    const adim = g.etekFisto.adim || 22, der = g.etekFisto.derinlik || 6, sark = g.etekSarkma ?? 6;
    const hemY = (x) => eo.y + sark * (1 - (x * x) / (ey.x * ey.x)); // sarkik taban egrisi
    const n = Math.max(2, Math.round((2 * ey.x) / adim));
    for (let k = 1; k <= n; k++) {
      const x0 = ey.x - (2 * ey.x) * (k - 1) / n, x1 = ey.x - (2 * ey.x) * k / n, xm = (x0 + x1) / 2;
      d += ` Q ${f1(xm)} ${f1(hemY(xm) + der * 2)} ${f1(x1)} ${f1(hemY(x1))}`;
    }
  } else {
    // tek yay: CF'de kose yok (tur 23 hakemleri); orta noktada yatay teget, sarkma etekOrta'nin altinda
    // SARKMA ORANI contract'tan: gorunum.etekUcu.sarkmaOran x etek yari genisligi (OLCULDU 8 bedende).
    // Etek genisledikce kavis de buyur — A-line/klos etekte duz yatay cizgi kalmaz.
    const sark = g.etekSarkma ?? etekSarkmaHesap(ey);
    d += ` C ${f1(ey.x * 0.55)} ${f1(eo.y + sark * 1.35)} ${f1(eySol.x * 0.55)} ${f1(eo.y + sark * 1.35)} ${P(eySol)}`;
  }
  // SOL yarim ters sirayla
  const yanSol = [...yanAdlar].reverse().map(sol).filter(Boolean);
  d += catmull(yanSol, 0.38);
  const ouS = (g.aski && sol('askiDip')) ? sol('askiDip') : sol('omuzUc'), kaS = sol('koltukalti');
  if (ouS && kaS) {
    // sol yarim ters yonde yurur (koltukalti -> omuzUc): ayni kenar, ters cizilir
    if (g.kol) d += ` L ${P(ouS)}`;
    else { const kbS = kolEviBas(sol('yakaOmuz'), ouS); d += kolEviYolu(kaS, kbS, -1, kolEviOyuk(g)) + ` L ${P(ouS)}`; }
  }
  const askiSol = KS.askiUst !== undefined ? KS.askiUst : K.askiUst;
  if (g.aski && askiSol && g.askiSol !== null) {
    const a = ayna(askiSol), w = g.aski.genislik || 12, yo = sol('yakaOmuz');
    void 0;
    const dipS = sol('askiDip') || ouS;
    d += ` L ${f1(a.x - w / 2)} ${f1(a.y)} L ${f1(a.x + w / 2)} ${f1(a.y)} L ${P(yo)}`;
    void dipS;
  } else if (sol('omuzUc')) {
    if (yuvarla) { const m = sol('yakaOmuz'), o2 = sol('omuzUc'), L2 = Math.hypot(o2.x - m.x, o2.y - m.y) || 1; d += ` L ${f1(m.x + (o2.x - m.x) / L2 * yuvarla)} ${f1(m.y + (o2.y - m.y) / L2 * yuvarla)} Q ${P(m)} ${f1(m.x + yuvarla)} ${f1(m.y + 0.5)}`; }
    else d += ` L ${P(sol('yakaOmuz'))}`;
  }
  // sol yaka: yakaOmuz(sol) -> yakaOrta(sol): sag yolun aynasi, ters yonde -> yakaYolu'nu ters cizmek yerine simetrik yol kur
  d += yakaTers(yakaOrtaSol, sol('yakaOmuz'), KS.yakaBicim || yb, true, yuvarla);
  if (Math.abs(yakaOrtaSol.x - yakaOrtaSag.x) > 0.01 || Math.abs(yakaOrtaSol.y - yakaOrtaSag.y) > 0.01) d += ` L ${P(yakaOrtaSag)}`;
  d += ' Z';

  let svg = `<path d="${d}" fill="#fff" stroke="#000" stroke-width="${CIZ.disKonturMM}" stroke-linejoin="round" stroke-linecap="round"/>\n`;

  // KOL (kapak / puf / duz) — govdenin ustune, beyaz dolgu
  const kolCiz = (kol, ou, ka, s) => {
    if (!kol) return '';
    const dis = nokta(kol.dis), ic = nokta(kol.ic);
    dis.x *= s; ic.x *= s;
    const sis = (kol.sisme || 0) * s;
    let kd = `M ${P(ou)}`;
    // KOL — SOZLUK DEGIL SAYI (12 Eyl). 'puf'/'kapak' ISIM DEGIL, tek sayinin
    // iki ucu: sisme (mm). sisme>0 -> balon govde + manset; sisme=0 -> kol evine
    // teget kapak. Arada her deger gecerli; yeni kol tipi icin KOD DEGISMEZ.
    const sismeMM = (kol.sisme != null) ? Math.abs(kol.sisme) : (kol.tip === 'puf' ? 40 : 0);
    if (sismeMM > 0) {
      // balon: kol eksenine (omuz ucu -> agiz ortasi) gore sisme; alt ucu MANSET bandina toplanir; ic kenar koltukaltina iner
      const C = { x: (dis.x + ic.x) / 2, y: (dis.y + ic.y) / 2 };
      const ax = C.x - ou.x, ay = C.y - ou.y, L = Math.hypot(ax, ay) || 1, ux = ax / L, uy = ay / L;
      let px = -uy, py = ux; if (px * s < 0) { px = -px; py = -py; }   // disari bakan normal
      const S = sismeMM, bh = kol.bantMM || 14;
      // balon govdesi: omuz ucu -> dis bombe -> manset dis ucu -> manset ic ucu -> koltukalti
      kd += ` C ${f1(ou.x + px * S * 1.1 - ux * L * 0.05)} ${f1(ou.y + py * S * 1.1 - uy * L * 0.05)} ${f1(dis.x + px * S * 0.9 - ux * L * 0.3)} ${f1(dis.y + py * S * 0.9 - uy * L * 0.3)} ${P(dis)}`;
      kd += ` L ${P(ic)} L ${P(ka)} C ${f1(ka.x - 6 * s)} ${f1(ka.y - (ka.y - ou.y) * 0.30)} ${f1(ou.x - (ou.x - ka.x) * 0.60)} ${f1(ou.y + (ka.y - ou.y) * 0.32)} ${P(ou)} Z`;
      let out = `<path d="${kd}" fill="#fff" stroke="#000" stroke-width="${CIZ.disKonturMM}" stroke-linejoin="round" stroke-linecap="round"/>\n`;
      // manset bandi: agiz cizgisinin altinda kapali dikdortgen (beyaz), kalin dis kontur
      const b1 = { x: dis.x + ux * bh, y: dis.y + uy * bh }, b2 = { x: ic.x + ux * bh, y: ic.y + uy * bh };
      out += `<path d="M ${P(dis)} L ${P(ic)} L ${P(b2)} L ${P(b1)} Z" fill="#fff" stroke="#000" stroke-width="${CIZ.disKonturMM}" stroke-linejoin="round" stroke-linecap="round"/>\n`;
      out += `<path d="M ${P(dis)} L ${P(ic)}" fill="none" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linecap="round" stroke-linejoin="round"/>\n`;
      if (kol.buzgu) out += tikler([dis, ic], 12, 11, { x: -ux, y: -uy });
      if (kol.firfir) out += ogeCiz({ tip: 'firfir', adim: 9, derinlik: 5 }, [{ x: b1.x + ux * 5, y: b1.y + uy * 5 }, { x: b2.x + ux * 5, y: b2.y + uy * 5 }], s, {});
      if (kol.buzgu && kol.kapakBuzgu !== false) out += tikler([{ x: ou.x + px * 10 + ux * 8, y: ou.y + py * 10 + uy * 8 }, { x: ou.x + px * S * 0.55 + ux * L * 0.22, y: ou.y + py * S * 0.55 + uy * L * 0.22 }], 18, 11, { x: ux, y: uy });
      return out;
    } else if (kol.kapak !== false) {
      // KOL EVI ILE TEK EGRI (tur 27 hakemleri): kapak, kol evinin kendisinden dogar — ust kenar omuz ucundan disa,
      // alt ucu koltukaltinin hemen ustunde biter ve kol evi kavisine teget kapanir. Kama/sarkma yok.
      const dy = Math.min(dis.y, ka.y - 4);
      const d2 = { x: dis.x, y: dy };
      kd += ` C ${f1(ou.x + (d2.x - ou.x) * 0.55)} ${f1(ou.y + (d2.y - ou.y) * 0.12)} ${f1(d2.x + (d2.x - ou.x) * 0.12)} ${f1(d2.y - (d2.y - ou.y) * 0.32)} ${P(d2)}`;
      kd += ` C ${f1(d2.x - (d2.x - ka.x) * 0.25)} ${f1(d2.y + 8)} ${f1(ka.x + (d2.x - ka.x) * 0.35)} ${f1(ka.y - 2)} ${P(ka)}`;
      kd += ` C ${f1(ka.x - 12 * s)} ${f1(ka.y - (ka.y - ou.y) * 0.32)} ${f1(ou.x - (ou.x - ka.x) * 0.55)} ${f1(ou.y + (ka.y - ou.y) * 0.32)} ${P(ou)} Z`;
      return `<path d="${kd}" fill="#fff" stroke="#000" stroke-width="${CIZ.disKonturMM}" stroke-linejoin="round" stroke-linecap="round"/>\n`;
    } else {
      kd += ` L ${P(dis)}`;
    }
    kd += ` L ${P(ic)} L ${P(ka)} Z`;
    let out = `<path d="${kd}" fill="#fff" stroke="#000" stroke-width="${CIZ.disKonturMM}" stroke-linejoin="round" stroke-linecap="round"/>\n`;
    if (kol.bant) { // agiz bandi: agiz cizgisine paralel ic cizgi
      const bh = kol.bantMM || 14, ux = ic.x - dis.x, uy = ic.y - dis.y, L = Math.hypot(ux, uy) || 1;
      const nx = uy / L * -bh * s, ny = -ux / L * -bh * s; // bant yukari (agizdan govde-ust yonune)
      out += `<path d="M ${f1(dis.x + nx)} ${f1(dis.y + ny)} L ${f1(ic.x + nx)} ${f1(ic.y + ny)}" fill="none" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linecap="round" stroke-linejoin="round"/>\n`;
      if (kol.buzgu) out += tikler([{ x: dis.x + nx, y: dis.y + ny }, { x: ic.x + nx, y: ic.y + ny }], 12, 13, { x: 0, y: -1 });
    }
    if (kol.firfir) { const ux = ic.x - dis.x, uy = ic.y - dis.y, L = Math.hypot(ux, uy) || 1; const nx = -uy / L * 7 * s, ny = ux / L * 7 * s;
      out += ogeCiz({ tip: 'firfir', adim: 9, derinlik: 5 }, [{ x: dis.x - nx, y: dis.y - ny }, { x: ic.x - nx, y: ic.y - ny }], s, {}); }
    if (kol.buzgu && sismeMM > 0) { // kapak buzgusu: omuz ucundan asagi kisa cizgiler
      out += tikler([{ x: ou.x, y: ou.y }, { x: ou.x + (dis.x - ou.x) * 0.5, y: ou.y - (kol.kubbe || 22) * 0.9 }], 10, 11, { x: 0, y: 1 });
    }
    return out;
  };
  if (g.kol) {
    svg += kolCiz(g.kol, ou, ka, 1);
    if (g.kolSol !== null) svg += kolCiz(g.kolSol || g.kol, ouS, kaS, -1);
  }

  // IC OGELER
  for (const o of g.ogeler || []) {
    const taraflar = o.ayna === false ? [1] : (o.ayna === 'sol' ? [-1] : [1, -1]);
    for (const s of taraflar) {
      const pts = (o.noktalar || []).map((p) => { const q = nokta(p); q.x *= s; return q; });
      svg += ogeCiz(o, pts, s, K);
    }
  }
  // imza: konturun deterministik ozeti (yanlislama 1/2)
  const imza = ['yakaOrta', 'yakaOmuz', 'omuzUc', 'koltukalti', 'gogus', 'bel', 'kalca', 'etekYan', 'etekOrta'].map((k) => K[k] ? `${k}=${f1(K[k].x)},${f1(K[k].y)}` : `${k}=-`).join(';');
  // yanlislama 3: bol duran giysi oturamaz
  if (oturma && oturma.bel === false && K.bel && K.gogus && K.bel.x < K.gogus.x * 0.97) kirmizi.push(`${ad}: fotografta bel OTURMUYOR ama flat belde daraliyor (bel ${f1(K.bel.x)} < gogus ${f1(K.gogus.x)} x 0.97)`);
  const xs = [], ys = [];
  for (const k of Object.keys(K)) if (K[k]) { xs.push(Math.abs(K[k].x)); ys.push(K[k].y); }
  for (const k of Object.keys(KS)) if (KS[k]) { xs.push(Math.abs(KS[k].x)); ys.push(KS[k].y); }
  if (g.kol) { const dd = nokta(g.kol.dis); xs.push(Math.abs(dd.x) + (g.kol.sisme || 0)); ys.push(dd.y); }
  return { svg, imza, aynala: !!g.aynala, w: Math.max(...xs), y0: Math.min(...ys) - (g.kol && ((g.kol.sisme != null ? Math.abs(g.kol.sisme) : (g.kol.tip === 'puf' ? 40 : 0)) > 0) ? (g.kol.kubbe || 22) : 0), y1: Math.max(...ys) + (g.etekSarkma ?? 11) };
}
function yakaTers(orta, omuz, bicim, mirror = true, kisalt = 0) {
  // sol yarim: omuz(sol) -> orta(sol). yakaYolu'nun (orta->omuz) sag-el aynasi ters yonde: kontrol noktalarini ters sirala
  const yol = yakaYolu(orta, { x: Math.abs(omuz.x), y: omuz.y }, bicim, true, kisalt); // sag yol: orta -> omuz
  // sag yolu segmentlere ayir, ters cevir ve x'i aynala
  const toks = yol.trim().split(/\s+(?=[A-Z])/);
  const segs = toks.map((t) => { const [c, ...n] = t.split(/\s+/); return { c, n: n.map(Number) }; });
  let d = ''; let son = { x: Math.abs(omuz.x), y: omuz.y };
  const noktalar = []; // (cmd, ctrl..., end) listesi; ters: end_i -> ... -> start
  let cur = { x: orta.x < 0 ? -orta.x : orta.x, y: orta.y }; cur = { x: Math.abs(orta.x), y: orta.y };
  for (const sgm of segs) {
    if (sgm.c === 'L') { noktalar.push({ c: 'L', from: cur, to: { x: sgm.n[0], y: sgm.n[1] } }); cur = { x: sgm.n[0], y: sgm.n[1] }; }
    else if (sgm.c === 'Q') { noktalar.push({ c: 'Q', from: cur, c1: { x: sgm.n[0], y: sgm.n[1] }, to: { x: sgm.n[2], y: sgm.n[3] } }); cur = { x: sgm.n[2], y: sgm.n[3] }; }
    else if (sgm.c === 'C') { noktalar.push({ c: 'C', from: cur, c1: { x: sgm.n[0], y: sgm.n[1] }, c2: { x: sgm.n[2], y: sgm.n[3] }, to: { x: sgm.n[4], y: sgm.n[5] } }); cur = { x: sgm.n[4], y: sgm.n[5] }; }
  }
  const A = (p) => ({ x: mirror ? -p.x : p.x, y: p.y });
  for (const sgm of noktalar.reverse()) {
    if (sgm.c === 'L') d += ` L ${P(A(sgm.from))}`;
    else if (sgm.c === 'Q') d += ` Q ${P(A(sgm.c1))} ${P(A(sgm.from))}`;
    else d += ` C ${P(A(sgm.c2))} ${P(A(sgm.c1))} ${P(A(sgm.from))}`;
  }
  void son;
  return d;
}

// kisa cizgiler (buzgu): yol boyunca, normal yonunde uzunluk 'boy', aralik CIZ.buzguTikMM
// pref: cizgilerin gitmesi istenen MUTLAK yon (ör. {x:0,y:1} asagi); normalin isareti ona gore secilir.
// SATICI BUZGUSU (tur 22 hakemi, 8 satici flat'i): dikisi delen tik YOK; cizgi dikisin 4 mm icinden baslar, kumasa dogru
// uzar ve incelerek/solarak biter (iki parcali: yakin yari tam, uzak yari daha ince).
function tikler(pts, boy, aralik = CIZ.buzguTikMM, pref = { x: 0, y: 1 }, ofset = 4) {
  let out = '';
  const J = (k, m) => ((Math.sin(k * 12.9898 + m * 78.233) * 43758.5453) % 1 + 1) % 1;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], L = Math.hypot(b.x - a.x, b.y - a.y);
    const n = Math.max(1, Math.floor(L / aralik));
    let nx = -(b.y - a.y) / L, ny = (b.x - a.x) / L;
    if (nx * pref.x + ny * pref.y < 0) { nx = -nx; ny = -ny; }
    const tx = (b.x - a.x) / L, ty = (b.y - a.y) / L;
    for (let k = 0; k <= n; k++) {
      const t = (k + 0.5) / (n + 1);
      const bb = Math.abs(boy) * (0.75 + 0.25 * J(k, 2)), egim = (J(k, 3) - 0.5) * 0.3;
      const x0 = a.x + (b.x - a.x) * t + nx * ofset, y0 = a.y + (b.y - a.y) * t + ny * ofset;   // dikisin 4 mm icinden
      const dx = nx * bb + tx * bb * egim, dy = ny * bb + ty * bb * egim;
      out += `<path d="M ${f1(x0)} ${f1(y0)} q ${f1(dx * 0.5 + ty * 1.5)} ${f1(dy * 0.5 - tx * 1.5)} ${f1(dx * 0.55)} ${f1(dy * 0.55)}" fill="none" stroke="#000" stroke-width="${CIZ.kilcalMM}" stroke-linecap="round"/>\n`;
      out += `<path d="M ${f1(x0 + dx * 0.55)} ${f1(y0 + dy * 0.55)} l ${f1(dx * 0.45)} ${f1(dy * 0.45)}" fill="none" stroke="#000" stroke-width="${CIZ.kilcalMM * 0.6}" stroke-linecap="round"/>\n`;
    }
  }
  return out;
}
function yol(pts, kapali = false, bombe = 0) {
  if (!pts.length) return '';
  let d = `M ${P(pts[0])}`;
  for (let i = 1; i < pts.length; i++) d += bombe ? kavis(pts[i - 1], pts[i], bombe) : ` L ${P(pts[i])}`;
  return d + (kapali ? ' Z' : '');
}
function ogeCiz(o, pts, s, K) {
  const ince = `fill="none" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linecap="round"`;
  const kesik = `fill="none" stroke="#000" stroke-width="${CIZ.kesikliMM}" stroke-dasharray="${CIZ.kesikli}"`;
  const bombe = (o.bombe || 0) * s;
  switch (o.tip) {
    case 'dikis': case 'roba': return `<path d="${o.catmull ? 'M ' + P(pts[0]) + catmull(pts, 0.5) : yol(pts, false, bombe)}" ${ince}/>\n`;
    case 'kesikli': return `<path d="${o.catmull ? 'M ' + P(pts[0]) + catmull(pts, 0.5) : yol(pts, false, bombe)}" ${kesik}/>\n`;
    case 'fermuar': { // CB fermuar: kesikli cift cizgi + cekecek
      const [a, b] = pts;
      return `<path d="M ${f1(a.x - 2)} ${f1(a.y)} L ${f1(b.x - 2)} ${f1(b.y)} M ${f1(a.x + 2)} ${f1(a.y)} L ${f1(b.x + 2)} ${f1(b.y)}" ${kesik}/>\n<rect x="${f1(a.x - 3)}" y="${f1(a.y + 2)}" width="6" height="9" fill="#fff" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linecap="round" stroke-linejoin="round"/>\n`;
    }
    case 'buzgu': { const pref = o.yon === 'yukari' ? { x: 0, y: -1 } : o.yon === 'ic' ? { x: -s, y: 0 } : o.yon === 'dis' ? { x: s, y: 0 } : { x: 0, y: 1 };
      if (o.yon === 'ic' || o.yon === 'dis') return tikler(pts, o.boy || 12, (o.aralik || CIZ.buzguTikMM), pref, 0);
      return tikler(pts, Math.max(24, (o.boy || 12) * 1.6), (o.aralik || CIZ.buzguTikMM) * 1.4, pref); }
    case 'pens': { const [uc, a, b, alt] = pts; return alt ? `<path d="M ${P(uc)} L ${P(a)} L ${P(alt)} L ${P(b)} Z" ${ince}/>\n` : `<path d="M ${P(a)} L ${P(uc)} L ${P(b)}" ${ince}/>\n`; }
    case 'dugme': {
      const [a, b] = pts, n = o.adet || 5, r = (o.cap || 12) / 2; let out = '';
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0.5 : i / (n - 1), x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
        out += `<path d="M ${f1(x - r * 1.1)} ${f1(y)} L ${f1(x + r * 1.1)} ${f1(y)}" fill="none" stroke="#000" stroke-width="${CIZ.kilcalMM}"/>` +
          `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="#fff" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${f1(x - r * 0.3)}" cy="${f1(y)}" r="0.9" fill="#000"/><circle cx="${f1(x + r * 0.3)}" cy="${f1(y)}" r="0.9" fill="#000"/>\n`;
      }
      return out;
    }
    case 'pat': { const [a, b] = pts, w = (o.genislik || 24) / 2;
      const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L * w, ny = dx / L * w;
      return `<path d="M ${f1(a.x - nx)} ${f1(a.y - ny)} L ${f1(b.x - nx)} ${f1(b.y - ny)} M ${f1(a.x + nx)} ${f1(a.y + ny)} L ${f1(b.x + nx)} ${f1(b.y + ny)}" ${o.kesikli ? kesik : ince}/>\n`; }
    case 'fiyonk': { // FIYONK: iki KULAK (sag/sol, yatay) + ortada DUGUM + iki kuyruk.
      // OLCUM (pembe-fiyonk foto): kulaklar dugumden YANLARA acilir, hafif yukari egiktir;
      // kuyruklar dugumun altindan cikar. d7'de kulaklar yukari dogru cizildigi icin fiyonk
      // bandin uzerine tirmaniyor ve "havada" duruyordu.
      //   pts[0] = DUGUM merkezi (bandin uclarinin bulustugu yer)
      //   o.boy  = kulak yari acikligi (mm). o.kuyruk = kuyruk boyu (mm, 0 = kuyruk yok)
      const c = pts[0], b = o.boy || 28, ky = o.kuyruk ?? b * 1.2, kh = b * (o.kulakYuk ?? 0.52);
      const kulak = (sg) => `M ${P(c)} C ${f1(c.x + sg * b * 0.45)} ${f1(c.y - kh)} ${f1(c.x + sg * b)} ${f1(c.y - kh * 0.85)} ${f1(c.x + sg * b)} ${f1(c.y - kh * 0.10)}` +
        ` C ${f1(c.x + sg * b)} ${f1(c.y + kh * 0.70)} ${f1(c.x + sg * b * 0.40)} ${f1(c.y + kh * 0.55)} ${P(c)} Z`;
      const kuyruk = ky ? `M ${f1(c.x - b * 0.13)} ${f1(c.y + kh * 0.35)} C ${f1(c.x - b * 0.38)} ${f1(c.y + ky * 0.42)} ${f1(c.x - b * 0.16)} ${f1(c.y + ky * 0.74)} ${f1(c.x - b * 0.42)} ${f1(c.y + ky)}` +
        ` M ${f1(c.x + b * 0.13)} ${f1(c.y + kh * 0.35)} C ${f1(c.x + b * 0.40)} ${f1(c.y + ky * 0.42)} ${f1(c.x + b * 0.14)} ${f1(c.y + ky * 0.76)} ${f1(c.x + b * 0.46)} ${f1(c.y + ky * 0.96)}` : '';
      const dugum = `M ${f1(c.x - b * 0.16)} ${f1(c.y - kh * 0.34)} C ${f1(c.x - b * 0.26)} ${f1(c.y)} ${f1(c.x - b * 0.16)} ${f1(c.y + kh * 0.34)} ${f1(c.x - b * 0.13)} ${f1(c.y + kh * 0.38)}` +
        ` L ${f1(c.x + b * 0.13)} ${f1(c.y + kh * 0.38)} C ${f1(c.x + b * 0.24)} ${f1(c.y)} ${f1(c.x + b * 0.16)} ${f1(c.y - kh * 0.34)} ${f1(c.x + b * 0.16)} ${f1(c.y - kh * 0.34)} Z`;
      const st = `fill="#fff" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linecap="round" stroke-linejoin="round"`;
      return `<path d="${kulak(-1)} ${kulak(1)}" ${st}/>\n<path d="${dugum}" ${st}/>\n` + (ky ? `<path d="${kuyruk}" fill="none" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linecap="round"/>\n` : '');
    }
    case 'bag': { // SARKAN BAGCIK (tie uclari): dugumden cikan iki ince serit, hafif dalgali,
      // asagi dogru AYRILARAK iner (foto: uclar birbirinden uzaklasir, paralel DEGIL).
      // Her seridin KENDI iki kenari cizilir (serit genisligi o.en), ucu duz kesilir.
      const c = pts[0], b = o.boy || 120, en = o.en ?? 7, ayr = o.ayrilma ?? 0.22;
      const serit = (sg) => {
        const x0 = c.x + sg * en * 0.55, x1 = c.x + sg * (en * 0.55 + b * ayr);
        const k1 = { x: x0 + sg * b * 0.10, y: c.y + b * 0.38 };
        const k2 = { x: x1 - sg * b * 0.06, y: c.y + b * 0.72 };
        const kenarYolu = (d) =>
          `M ${f1(x0 + sg * d)} ${f1(c.y)} C ${f1(k1.x + sg * d)} ${f1(k1.y)} ${f1(k2.x + sg * d)} ${f1(k2.y)} ${f1(x1 + sg * d)} ${f1(c.y + b)}`;
        return kenarYolu(-en / 2) + ' ' + kenarYolu(en / 2) +
          ` M ${f1(x1 - sg * en / 2)} ${f1(c.y + b)} L ${f1(x1 + sg * en / 2)} ${f1(c.y + b - en * 0.5)}`;
      };
      return `<path d="${serit(-1)} ${serit(1)}" fill="none" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linecap="round" stroke-linejoin="round"/>\n`;
    }
    case 'drape': { const kil = `fill="none" stroke="#000" stroke-width="${CIZ.kilcalMM}" stroke-linecap="round"`;
      let out = ''; for (let i = 0; i + 1 < pts.length; i += 2) out += `<path d="${yol([pts[i], pts[i + 1]], false, (o.bombe || 6) * s)}" ${kil}/>\n`; return out; }
    case 'firfir': { // dalgali kenar: kucuk yaylar
      let out = 'M ' + P(pts[0]);
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], L = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(2, Math.round(L / (o.adim || 10)));
        const nx = -(b.y - a.y) / L, ny = (b.x - a.x) / L;
        for (let k = 1; k <= n; k++) { const t = k / n, tm = (k - 0.5) / n; out += ` Q ${f1(a.x + (b.x - a.x) * tm + nx * (o.derinlik || 6) * (k % 2 ? 1 : -1))} ${f1(a.y + (b.y - a.y) * tm + ny * (o.derinlik || 6) * (k % 2 ? 1 : -1))} ${f1(a.x + (b.x - a.x) * t)} ${f1(a.y + (b.y - a.y) * t)}`; }
      }
      return `<path d="${out}" ${ince}/>\n`;
    }
    case 'bebeYaka': { // bedene yatan yuvarlak yaka: on = CF'de ayrilan iki lob; arka (o.arka) = surekli
      const w = o.genislik || 45, orta = { x: 0, y: K.yakaOrta.y }, omuz = { x: K.yakaOmuz.x * s, y: K.yakaOmuz.y };
      const dis = { x: omuz.x + s * w * 0.62, y: omuz.y + w * 0.5 };   // omuz ucu lobu (omuz-boyun kavsagini orter)
      const alt = { x: s * w * 0.42, y: orta.y + w * 0.95 };            // CF lobunun alt ucu
      let d;
      if (o.arka) d = `M ${P(orta)} L ${f1(0)} ${f1(orta.y + w * 0.9)} C ${f1(s * w * 0.9)} ${f1(orta.y + w * 0.95)} ${f1(dis.x - s * w * 0.2)} ${f1(dis.y + w * 0.15)} ${P(dis)} C ${f1(omuz.x + s * w * 0.35)} ${f1(omuz.y + w * 0.2)} ${f1(omuz.x + s * 6)} ${f1(omuz.y)} ${P(omuz)}`;
      else d = `M ${f1(s * 1.5)} ${f1(orta.y)} L ${f1(s * 1.5)} ${f1(orta.y + w * 0.55)} C ${f1(s * 2)} ${f1(orta.y + w * 1.02)} ${f1(s * w * 0.42)} ${f1(orta.y + w * 1.08)} ${f1(s * w * 0.62)} ${f1(orta.y + w * 0.82)} C ${f1(s * w * 0.85)} ${f1(orta.y + w * 0.52)} ${f1(dis.x - s * w * 0.1)} ${f1(dis.y + w * 0.15)} ${P(dis)} C ${f1(omuz.x + s * w * 0.4)} ${f1(omuz.y + w * 0.12)} ${f1(omuz.x + s * 10)} ${f1(omuz.y - 3)} ${f1(omuz.x + s * 5)} ${f1(omuz.y - 4)}`;
      // ic kenar: omuz noktasindan yaka cizgisi boyunca CF/CB'ye geri (boyun oyugu acik kalir)
      d += ` L ${f1(omuz.x)} ${f1(omuz.y)}` + yakaTers({ x: 0, y: K.yakaOrta.y }, { x: Math.abs(K.yakaOmuz.x), y: K.yakaOmuz.y }, o.bicim || 'yuvarlak', s < 0) + ' Z';
      let out = `<path d="${d}" fill="#fff" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linejoin="round" stroke-linecap="round"/>\n`;
      if (o.firfir) out += ogeCiz({ tip: 'firfir', adim: 8, derinlik: 4 }, o.arka ? [{ x: 0, y: orta.y + w * 0.9 + 4 }, { x: dis.x + s * 3, y: dis.y + 3 }] : [{ x: s * w * 0.62, y: orta.y + w * 0.82 + 4 }, { x: dis.x + s * 3, y: dis.y + 3 }], s, K);
      return out;
    }
    case 'cepKapagi': { const [a, b] = pts; const h = o.yukseklik || 40, ph = o.cepBoyu || 120;
      const cep = `<path d="M ${f1(a.x + s * 3)} ${f1(a.y + h * 0.4)} L ${f1(a.x + s * 3)} ${f1(a.y + ph)} Q ${f1((a.x + b.x) / 2)} ${f1(a.y + ph + 12)} ${f1(b.x - s * 3)} ${f1(b.y + ph)} L ${f1(b.x - s * 3)} ${f1(b.y + h * 0.4)}" fill="#fff" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linecap="round" stroke-linejoin="round"/>\n`;
      return cep + `<path d="M ${P(a)} L ${P(b)} L ${f1(b.x)} ${f1(b.y + h * 0.7)} Q ${f1((a.x + b.x) / 2)} ${f1(b.y + h * 1.15)} ${f1(a.x)} ${f1(a.y + h * 0.7)} Z" fill="#fff" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linecap="round" stroke-linejoin="round"/>\n<path d="M ${f1(a.x + s * 3)} ${f1(a.y + 4)} L ${f1(b.x - s * 3)} ${f1(b.y + 4)}" ${kesik}/>\n`; }
    case 'yakaBandi': { // BANT YAKA (stand / tie collar) — OLCULMUS KONVANSIYON
      // KAYNAK: flat-01 (flats-clean) on figur, bant seridi.
      //   ust kenar tepe y=35, alt dikis y=58  -> serit kalinligi h = 23 px
      //   serit tam genislik 225-104 = 121 px  -> h/W = 0.19 ; h/(W/2) = 0.38
      // KURAL: bant SABIT KALINLIKLI bir serittir. Alt kenar govdenin boyun halkasi,
      // ust kenar ayni egrinin NORMAL yonunde h kadar otelenmisi. (Iki kenari ayri ayri
      // egri olarak kurmak, CF'de ikisini birlestirip yanlarda ayirinca 'boynuz' uretiyordu.)
      const nb = lm('neckBase'), nf = lm('neckFront');
      const cfAlt = pts[0] ? pts[0].y : nf.y;
      const yariGen = Math.abs(nb.x) * (o.omuzOran || 0.50);
      const h = o.yukseklik != null ? o.yukseklik : yariGen * 0.38;
      const omuzAlt = nb.y + (o.omuzDusme || 2);
      const ay = o.acik ? (o.aralik || 3) : 0;
      // alt kenari orneklenmis nokta dizisi olarak kur (kuadratik yay), sonra normal boyunca otele
      const A = { x: ay, y: cfAlt }, B = { x: yariGen, y: omuzAlt };
      const C = { x: ay + (yariGen - ay) * 0.62, y: cfAlt - (cfAlt - omuzAlt) * 0.18 }; // kontrol: asagi kabarik
      const N = 14, alt = [], ust = [];
      for (let i = 0; i <= N; i++) {
        const t = i / N, u = 1 - t;
        const x = u * u * A.x + 2 * u * t * C.x + t * t * B.x;
        const y = u * u * A.y + 2 * u * t * C.y + t * t * B.y;
        // teget -> normal (yukari bakan)
        let dx = 2 * u * (C.x - A.x) + 2 * t * (B.x - C.x);
        let dy = 2 * u * (C.y - A.y) + 2 * t * (B.y - C.y);
        const L = Math.hypot(dx, dy) || 1;
        let nx = dy / L, ny = -dx / L;            // sol normal
        if (ny > 0) { nx = -nx; ny = -ny; }        // her zaman YUKARI (-y) baksin
        alt.push({ x: s * x, y });
        ust.push({ x: s * (x + nx * h), y: y + ny * h });
      }
      let dpath = 'M ' + P(alt[0]);
      for (let i = 1; i < alt.length; i++) dpath += ' L ' + P(alt[i]);
      dpath += ' L ' + P(ust[ust.length - 1]);
      for (let i = ust.length - 2; i >= 0; i--) dpath += ' L ' + P(ust[i]);
      dpath += ' Z';
      return `<path d="${dpath}" fill="#fff" stroke="#000" stroke-width="${CIZ.disKonturMM * 0.62}" stroke-linejoin="round" stroke-linecap="round"/>\n`;
    }
    case 'keyhole': { // ACIKLIK (keyhole / damla / kama) — OLCULMUS KONVANSIYON
      // KAYNAK 1 (dolgu): etsy-01 sag figur V acikligi. Aciklik KAPALI bir sekildir ve
      //   govdeden FARKLI, DAHA KOYU bir tonla doldurulur: ic RGB(224,207,172) vs
      //   govde (253,244,230) -> luminans ~%15 daha koyu. Aciklik BEYAZ DEGILDIR.
      //   Bu, acikligi 'beyaz uzerine beyaz' gorunmezliginden kurtaran tek kural.
      // KAYNAK 2 (oran): etsy-01, V derinligi 114 px / govde tam genislik 206 px = 0.55.
      // KAYNAK 3 (cizgi): etsy-01 y=500 -> dis kontur 3 px, ic dikis 2 px = 1.5:1.
      //   Aciklik kenari IC DIKIS agirligindadir, dis kontur degil.
      // BICIM: o.bicim = 'kama' (duz kenarli, ustte dar altta genis trapez — hedef elbise;
      //   bant altindan cikip dekolteye acilan yarik) | 'damla' (klasik sisik keyhole).
      const [a, b] = pts;
      const w = (o.genislik || 46) / 2;
      const L = b.y - a.y;
      const bogaz = (o.bogazOran != null ? o.bogazOran : 0.30);
      const dolgu = o.dolgu || '#e9e3da';
      const kesim = `fill="${dolgu}" stroke="#000" stroke-width="${CIZ.disKonturMM * 0.62}" stroke-linejoin="round" stroke-linecap="round"`;
      let d;
      if (o.bicim === 'kama') {
        // KAMA: ustte 2*w*bogaz genisliginde baslar, asagi dogru NEREDEYSE DUZ kenarlarla
        // acilir, altta 2*w'ye ulasir; alt kenar hafif asagi kavisli (dekolte cizgisiyle
        // ayni yonde). Kenarlar cok hafif disbukey — flat'te duz cetvel cizgisi olmaz.
        const kav = (o.kenarKavis != null ? o.kenarKavis : 0.06) * w;
        d = `M ${f1(s * w * bogaz)} ${f1(a.y)}` +
          ` C ${f1(s * (w * bogaz + (w - w * bogaz) * 0.34 + kav))} ${f1(a.y + L * 0.34)}` +
          ` ${f1(s * (w * bogaz + (w - w * bogaz) * 0.72 + kav))} ${f1(a.y + L * 0.72)}` +
          ` ${f1(s * w)} ${f1(b.y)}` +
          ` C ${f1(s * w * 0.45)} ${f1(b.y + L * 0.07)} ${f1(-s * w * 0.45)} ${f1(b.y + L * 0.07)} ${f1(-s * w)} ${f1(b.y)}` +
          ` C ${f1(-s * (w * bogaz + (w - w * bogaz) * 0.72 + kav))} ${f1(a.y + L * 0.72)}` +
          ` ${f1(-s * (w * bogaz + (w - w * bogaz) * 0.34 + kav))} ${f1(a.y + L * 0.34)}` +
          ` ${f1(-s * w * bogaz)} ${f1(a.y)} Z`;
      } else {
        const enY = a.y + L * (o.enGenisOran || 0.46);
        d = `M ${f1(s * w * bogaz)} ${f1(a.y)}` +
          ` C ${f1(s * w * 0.72)} ${f1(a.y + L * 0.16)} ${f1(s * w)} ${f1(enY - L * 0.20)} ${f1(s * w)} ${f1(enY)}` +
          ` C ${f1(s * w)} ${f1(enY + L * 0.30)} ${f1(s * w * 0.60)} ${f1(b.y - L * 0.08)} ${P(b)}` +
          ` C ${f1(-s * w * 0.60)} ${f1(b.y - L * 0.08)} ${f1(-s * w)} ${f1(enY + L * 0.30)} ${f1(-s * w)} ${f1(enY)}` +
          ` C ${f1(-s * w)} ${f1(enY - L * 0.20)} ${f1(-s * w * 0.72)} ${f1(a.y + L * 0.16)} ${f1(-s * w * bogaz)} ${f1(a.y)} Z`;
      }
      return `<path d="${d}" ${kesim}/>\n`;
    }
    case 'pili': { // ters pili: iki kat cizgisi, ustte dikise baglanir, altta etek ucuna iner
      const [ust, alt] = pts, w = (o.genislik || 26) / 2;
      return `<path d="M ${f1(ust.x - w)} ${f1(ust.y)} L ${f1(alt.x - w)} ${f1(alt.y)} M ${f1(ust.x + w)} ${f1(ust.y)} L ${f1(alt.x + w)} ${f1(alt.y)} M ${f1(ust.x)} ${f1(ust.y)} L ${f1(alt.x)} ${f1(alt.y)}" ${ince}/>\n`; }
    default: if (o.__kirmizi) o.__kirmizi.push(`CIZILEMEDI: oge tipi '${o.tip}' ciziciye tanimli degil`);
      return `<!-- bilinmeyen oge ${o.tip} -->\n`;
  }
}

export function ciz(okuma) {
  kanunSart();
  // OKUMA KAPISI. Bir siluet okumasi olmadan flat cizilmez (bkz. dosya basligi).
  if (!okuma || typeof okuma !== 'object') {
    throw new Error('ERR_OKUMA_YOK: flat bir siluet OKUMASINDAN cizilir; verilen sey okuma degil');
  }
  if (!okuma.on && !okuma.arka) {
    throw new Error('ERR_OKUMA_YOK: okumada ne on ne arka gorunum var — ' +
      'spec kelimelerinden siluet uydurulmaz');
  }
  const kirmizi = [];
  const gorunumler = [['on', okuma.on], ['arka', okuma.arka]].filter(([, g]) => g);
  const parcalar = gorunumler.map(([ad, g]) => ({ ad, ...gorunumCiz(g, ad, kirmizi, okuma.oturma) }));
  const M = 70, W = Math.max(...parcalar.map((p) => p.w)) * 2 + M;
  const y0 = Math.min(...parcalar.map((p) => p.y0)) - M, y1 = Math.max(...parcalar.map((p) => p.y1)) + M;
  const H = y1 - y0, TW = W * parcalar.length + M;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f1(TW)} ${f1(H)}" width="${f1(TW)}mm" height="${f1(H)}mm" data-siluet="v1" data-kaynak="${okuma.sha256 || ''}">\n<rect width="${f1(TW)}" height="${f1(H)}" fill="#fff"/>\n`;
  parcalar.forEach((p, i) => {
    svg += `<g transform="translate(${f1(M / 2 + W * i + W / 2)} ${f1(-y0)})${p.aynala ? ' scale(-1 1)' : ''}" data-gorunum="${p.ad}">\n${p.svg}</g>\n`;
    svg += `<text x="${f1(M / 2 + W * i + W / 2)}" y="${f1(H - 12)}" font-family="Helvetica, Arial, sans-serif" font-size="14" text-anchor="middle" fill="#666">${p.ad === 'on' ? 'ON' : 'ARKA'}</text>\n`;
  });
  svg += '</svg>\n';
  return { svg, imza: parcalar.map((p) => p.ad + ':' + p.imza).join('|'), kirmizi };
}
