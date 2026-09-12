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

// ---- KUMAS PARCASI: dolgu + kenara yapisan ic golge + dis kontur.
// Tek yerden gelir ki govde ve kol AYNI derinlik dilini konussun.
// genislik = ic golge bandinin mm karsiligi (govde genis, kol dar).
let _kpSayac = 0;
function kumasParcasi(d, kumas, ad, genislik) {
  const id = 'kp-' + ad.replace(/[^a-zA-Z0-9]/g, '') + '-' + (_kpSayac++);
  const koyu = koyult(kumas, 0.13);
  return `<clipPath id="${id}"><path d="${d}"/></clipPath>\n`
    + `<path d="${d}" fill="${kumas}" stroke="none"/>\n`
    // GOLGE TEK YONDEN GELIR (12 Eyl duzeltme). Once kenarin TAMAMINA esit
    // kalinlikta iki cizgi cekiliyordu; bu, giysiyi cevreleyen SERT bir bant
    // uretiyordu ("golgeler kotu"). Gercek flat'te golge tek yonlu ve yumusaktir:
    // isik sol ustten gelir, koyuluk sag ve alt kenarda toplanir, yukarida solar.
    // Linear gradient ile maskelenir: ust %0, alt %100.
    + `<linearGradient id="${id}-g" x1="0" y1="0" x2="0.35" y2="1">`
    + `<stop offset="0" stop-color="#fff" stop-opacity="0"/>`
    + `<stop offset="0.45" stop-color="#fff" stop-opacity="0.35"/>`
    + `<stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>\n`
    + `<mask id="${id}-m"><rect x="-9999" y="-9999" width="19998" height="19998" fill="url(#${id}-g)"/></mask>\n`
    + `<g clip-path="url(#${id})" mask="url(#${id}-m)">`
    + `<path d="${d}" fill="none" stroke="${koyu}" stroke-width="${genislik}"`
    + ` stroke-linejoin="round" stroke-linecap="round" opacity="0.50"/>`
    + `<path d="${d}" fill="none" stroke="${koyu}" stroke-width="${genislik * 0.42}"`
    + ` stroke-linejoin="round" stroke-linecap="round" opacity="0.40"/>`
    + `</g>\n`
    + `<path d="${d}" fill="none" stroke="#000" stroke-width="${CIZ.disKonturMM}"`
    + ` stroke-linejoin="round" stroke-linecap="round"/>\n`;
}

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

// ---- RENK: bir hex rengi oran kadar koyultur (golge tonu kumastan turer).
// Sabit gri golge, pembe/krem kumasta OLU bir leke birakir; golge her zaman
// kumasin kendi tonunun koyusudur.
function koyult(hex, oran) {
  const h = String(hex).replace('#', '');
  const t = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(t, 16);
  if (!isFinite(n) || t.length !== 6) return '#c9c0bb';
  const r = Math.round(((n >> 16) & 255) * (1 - oran));
  const g = Math.round(((n >> 8) & 255) * (1 - oran));
  const b = Math.round((n & 255) * (1 - oran));
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

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
// Ayni kenar, TERS yonde (koltukalti -> omuzUc). Kol kapaginin kapanisi bunu
// kullanir; govdeninkiyle birebir ayni egri olur, arada beyaz hilal kalmaz.
function kolEviYoluTers(ou, ka, s, oyuk) {
  const dy = ka.y - ou.y;
  const sag = Math.abs(dy) * oyuk;
  const icX = Math.min(Math.abs(ou.x), Math.abs(ka.x)) - sag;
  const c1 = { x: s * Math.max(0, icX), y: ou.y + dy * 0.42 };
  const c2 = { x: s * Math.max(0, icX), y: ou.y + dy * 0.78 };
  // ters: c2 once, sonra c1, hedef ou
  return ` C ${P(c2)} ${P(c1)} ${P(ou)}`;
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
// genislikTavan: acikligin cikabilecegi EN GENIS yari genislik (mm).
// Normalde yakaOmuz'dur; ama DERIN bir aciklik (dekolte/keyhole) boyun
// noktasiyla sinirli kalirsa dar bir YARIK olur. Derin acikliklarda tavan
// omuz ucuna dogru acilir (bkz. derinlik/genislik kanunu asagida).
function yakaYolu(orta, omuz, bicim, sag = true, kisalt = 0, genislikTavan = null) {
  const s = sag ? 1 : -1;
  const o = { x: s * Math.abs(orta.x), y: orta.y }, m0 = { x: s * Math.abs(omuz.x), y: omuz.y };
  const yuvarlakMi = Array.isArray(bicim) ? false : (bicim === 'kayik' || bicim === 'yuvarlak' || !bicim);
  const m = (kisalt && yuvarlakMi) ? { x: m0.x - s * kisalt, y: m0.y + 0.5 } : m0;

  let kn = Array.isArray(bicim) ? bicim : (YAKA_NOKTALARI[bicim] || YAKA_NOKTALARI.yuvarlak);

  // YAKA SEKIL KANUNU (12 Eyl, kok duzeltme #1b). Okuma serbest kontrol noktasi
  // verebilir ama GIYSI OLMAYAN bir sekil veremez. Pembe okumasi [2.6, ...] yaziyordu:
  // x orani 2.6, yani aciklik omuz noktasinin 2.6 KATI genisliginde. Sonuc:
  // aciklik omuzlarin disina tasan, tabani DUZ, koseleri DIK bir KOVA idi
  // ("yaka igrenc" sikayetinin kok sebebi). Satici flat'inde (etsy-01) yaka
  // acikligi HER ZAMAN omuz noktasinin icinde kalir: V dibi 114 px / omuz acilimi
  // 206 px -> genislik orani en fazla 1.0.
  // KANUN: (1) hicbir kontrol noktasi omuz x'ini asamaz (oran <= 1.0);
  //         (2) acikligin DIBI yuvarlaktir: ortaya (x=0) yatay tegetle inen bir
  //             kontrol noktasi 0.34'ten genis olamaz, yoksa taban duz cikar.
  // SINIR: aciklik yaka-omuz noktasini asamaz. (genislikTavan sadece DIP
  // yelpazesinin dayanagi olarak kullanilir; ustteki kontrol noktalari boyun
  // noktasiyla sinirli kalir, yoksa aciklik omuzdan tasar ve giysi dusuk gorunur.)
  // DUZELTME (12 Eyl, ikinci tur): sinir yanlis referansa bagliydi. Oranlar
  // yakaOmuz.x'in kati; tavan 1.0 olunca aciklik yakaOmuz'u HIC asamiyor ve
  // her zaman dar bir yarik cikiyor. Ama yakaOmuz BOYUN kenaridir, omuz ucu degil.
  // Gercek yasa: aciklik OMUZ UCUNU (shoulderTip) asamaz — arasindaki omuz bandi
  // korunur. Olcum (etsy-08 kare yaka): aciklik yari 118 px / omuz ucu 162.9 px = 0.72.
  // Tavan = 0.80 x shoulderTip.x / yakaOmuz.x  -> aciklik genisleyebilir ama
  // omuz bandini yemez.
  const _st = LM['landmark.shoulderTip'];
  const OMUZ_ASMA_SINIRI = (_st && Math.abs(m.x) > 1)
    ? Math.max(1.0, (0.80 * _st.x) / Math.abs(m.x))
    : 1.0;
  kn = kn.map(([kx, ky]) => [Math.max(-OMUZ_ASMA_SINIRI, Math.min(OMUZ_ASMA_SINIRI, kx)), ky]);

  // (2) DIP YUVARLAKTIR. Bir Bezier'in ilk iki kontrol noktasi AYNI x'te ise
  // (pembe okumasi: [2.6,0] ve [2.6,0.01]) egri orta noktadan DIK cikar ve taban
  // DUZ + koseler DIK olur — kutu. Satici flat'inde aciklik dibi daima kavislidir.
  // DUZELTME: dipteki (ky < 0.15) kontrol noktalarini, ortadan disari acilan bir
  // YELPAZEYE yeniden dagitiriz: ilk nokta dar (yatay teget), sonraki genisler.
  // Boylece dip yuvarlak, kenarlar yukari dogru acilir.
  // (3) DERINLIK/GENISLIK ORANI. Aciklik ne kadar DERIN inerse o kadar GENIS
  // olmali; yoksa dar ve uzun bir YARIK cikar (pembe okumasi: derinlik 157 mm,
  // genislik 51 mm -> oran 3.1). Satici flat'inde (etsy-01 V yaka) derinlik
  // 114 px / genislik 206 px = 0.55; en dar keyhole'da bile oran 1.6'yi gecmez.
  // KANUN: derinlik/genislik > 1.7 ise kontrol noktalari YATAY olarak acilir.
  {
    // Dar bir yarik (keyhole) MESRU bir bicimdir — zorla genisletilmez, cunku
    // genisletilince fotograftaki giysi degil BASKA bir giysi cizilir (denendi:
    // 1.7 orani balon seklinde bir delik uretti). Ama derinligin de bir siniri
    // vardir: olculdu (etsy-01, etsy-08 ve pembe foto) aciklik hicbir zaman
    // GOGUS HATTINI gecmez; gectiginde giysi "yirtik" gorunur.
    // Bu yuzden burada yalnizca bir UYARI uretilir; bicimi okuma belirler.
    void 0;
  }

  // DIP BICIMI OKUMANIN KARARIDIR, SABIT KURAL DEGIL (12 Eyl, ikinci tur).
  // Yelpaze kurali her aciklik dibini YUVARLAK yapiyordu; kare/U dekolte
  // cizilemiyordu (HEDEF md.9: sabit menu/limit koymak ihlaldir).
  // Yasa yalnizca sunu korur: dip noktalari hem AYNI x'te hem de x=0'a yapisik
  // olamaz (o zaman egri orta noktadan dik cikar ve sivri V uretir).
  // Dipte en az bir nokta merkeze yakin (<=0.45) ise dip YUVARLAK okunur ve
  // yelpazeye dagilir; hepsi disarida ise dip DUZ birakilir (kare dekolte).
  const dipNoktalar = kn.filter(([, ky]) => ky < 0.15);
  const dipler = dipNoktalar.length;
  const dipYuvarlak = dipler >= 2 && dipNoktalar.some(([kx]) => Math.abs(kx) <= 0.45);
  if (dipYuvarlak) {
    const enGenis = Math.max(...kn.map(([kx]) => Math.abs(kx)));
    let n = 0;
    kn = kn.map(([kx, ky]) => {
      if (ky >= 0.15) return [kx, ky];
      const t = dipler > 1 ? n / (dipler - 1) : 0; n++;
      return [Math.sign(kx || 1) * enGenis * (0.30 + 0.42 * t), ky];
    });
  }

  // oran -> mutlak nokta
  const A = ([kx, ky]) => ({ x: m.x * kx, y: o.y + (m.y - o.y) * ky });
  const pts = kn.map(A);

  if (pts.length === 0) return ` L ${P(m)}`;
  if (pts.length === 1) return ` Q ${P(pts[0])} ${P(m)}`;
  if (pts.length === 2) return ` C ${P(pts[0])} ${P(pts[1])} ${P(m)}`;
  // 3n nokta: ardisik kubik zinciri; son hedef m
  // KOSE NOKTASI (12 Eyl): 6 nokta verildiginde zincir iki kubik kurup sonda
  // ` L m` cekiyordu — yani SON kontrol noktasi hic kullanilmiyordu ve yaka
  // omuza DUZ bir cizgiyle gidiyordu. Kademe (dar yarik -> genis dekolte) bu
  // yuzden cizilemiyordu: her kubik kendi icinde yumusak, aralarinda kirilma yok.
  // COZUM: ard arda gelen iki kontrol noktasi AYNI y'de ve x'leri arasindaki fark
  // buyukse (> %40) orada bir KOSE vardir; zincir orada kesilir ve ` L ` ile
  // keskin donus yapilir. Boylece "dar yarik + kare dekolte" tek yolda cizilir.
  let d = '';
  let i = 0;
  while (i < pts.length) {
    // kose arayisi: pts[i] ile pts[i+1] arasi keskin donus mu?
    const kose = (i + 1 < pts.length) &&
      Math.abs(pts[i + 1].y - pts[i].y) < Math.abs(m.y - o.y) * 0.06 &&
      Math.abs(Math.abs(pts[i + 1].x) - Math.abs(pts[i].x)) > Math.abs(m.x) * 0.40;
    if (kose) { d += ` L ${P(pts[i])} L ${P(pts[i + 1])}`; i += 2; continue; }
    if (i + 2 < pts.length) { d += ` C ${P(pts[i])} ${P(pts[i + 1])} ${P(pts[i + 2])}`; i += 3; continue; }
    const kalan = pts.length - i;
    if (kalan === 2) d += ` C ${P(pts[i])} ${P(pts[i + 1])} ${P(m)}`;
    else if (kalan === 1) d += ` Q ${P(pts[i])} ${P(m)}`;
    else d += ` L ${P(m)}`;
    return d;
  }
  d += ` L ${P(m)}`;
  return d;
}

// ---- OMUZ DIKISI: CETVEL DEGIL (12 Eyl, kok duzeltme #5).
// ESKI HATA: yakaOmuz -> omuzUc arasi ` L ` ile, yani DUZ CIZGIYLE ceviliyordu.
// croquis36'da egim var (yakaOmuz y=10 -> omuzUc y=58, 21 derece) ama duz cizgi
// cizildigi icin flat'te "cetvelle cizilmis" duruyordu: gercek omuz yuvarlak bir
// kemik ustunden gecer ve dikis hafif ICBUKEY (yukari kambur) izlenir.
// OLCUM: etsy-01 sag figur omuz dikisi piksel izlendi — kirisin ustunde en buyuk
// sapma 2.5 px / kiris 52 px = 0.048; etsy-08 arka 1.8/40 = 0.045. Secilen 0.046.
// Isaret: sapma YUKARI (omuz kemiginin uzerinden gecer), asagi degil.
const OMUZ_KAMBUR = 0.046;
function omuzYolu(yo, ou) {
  if (!yo || !ou) return ` L ${P(ou)}`;
  const dx = ou.x - yo.x, dy = ou.y - yo.y, L = Math.hypot(dx, dy) || 1;
  // kirise dik normal, YUKARI bakan (-y)
  let nx = -dy / L, ny = dx / L;
  if (ny > 0) { nx = -nx; ny = -ny; }
  const s = L * OMUZ_KAMBUR;
  // kubik: iki kontrol noktasi kirisin 1/3 ve 2/3'unde, normal yonunde s kadar yukarida
  const c1 = { x: yo.x + dx * 0.34 + nx * s * 1.2, y: yo.y + dy * 0.34 + ny * s * 1.2 };
  const c2 = { x: yo.x + dx * 0.70 + nx * s * 1.1, y: yo.y + dy * 0.70 + ny * s * 1.1 };
  return ` C ${P(c1)} ${P(c2)} ${P(ou)}`;
}

// sol omuz: omuzUc -> yakaOmuz yonunde ayni egri (kontrol noktalari ters sirada)
function omuzYoluTers(yo, ou) {
  if (!yo || !ou) return ` L ${P(yo)}`;
  const dx = ou.x - yo.x, dy = ou.y - yo.y, L = Math.hypot(dx, dy) || 1;
  let nx = -dy / L, ny = dx / L;
  if (ny > 0) { nx = -nx; ny = -ny; }
  const s = L * OMUZ_KAMBUR;
  const c1 = { x: yo.x + dx * 0.34 + nx * s * 1.2, y: yo.y + dy * 0.34 + ny * s * 1.2 };
  const c2 = { x: yo.x + dx * 0.70 + nx * s * 1.1, y: yo.y + dy * 0.70 + ny * s * 1.1 };
  return ` C ${P(c2)} ${P(c1)} ${P(yo)}`;
}

// ---- YAN DIKIS NOKTALARI: kum saati (gogus -> bel -> kalca -> etek)
// Satici flat'inde (etsy-08, Locket) yan dikis DORT noktadan gecer ve aralarina
// ARA NOKTA konur; yoksa Catmull-Rom uzun araliklari duz cizgiye cevirir.
// gogus->bel 200 mm, bel->kalca 160 mm: bu mesafelerde kontrol noktalari
// birbirini yer ve egri duzlesir. Her aralik ortasina, iki ucun ARASINDA ama
// govdeye dogru hafif ic/dis kaydirilmis bir ara nokta ekleriz:
//   gogus->bel: ara nokta bel tarafina yakin ve ICERI (gogus altinin toparlanmasi)
//   bel->kalca: ara nokta kalca tarafina yakin ve DISARI (kalcanin acilmasi)
// Bu, kum saatinin S kavisini uretir; duz diyagonal kalmaz.
function araNokta(a, b, t, disari) {
  return { x: a.x + (b.x - a.x) * t + disari, y: a.y + (b.y - a.y) * t };
}
function yanKumSaati(K, sag) {
  let gogus = sag('gogus');
  const bel = sag('bel'), kalca = sag('kalca'), etek = sag('etekYan');
  const ka = sag('koltukalti');
  const pts = [];
  // GOGUS KOLTUKALTINI ASAMAZ (tur 2 olcumu). Okuma gogus=149.4 / koltukalti=114.7
  // veriyor: aradaki 35 mm, 15 mm'lik dikey dususte YATAY bir RAF uretiyor ve
  // koltukaltinda sivri bir cikinti olusuyor. Satici flat'inde (etsy-08) koltukalti
  // 162.9 / gogus 173.9 -> fark yari genisligin %6.7'si. Gogsu o banda sikistiririz:
  // giysi koltukaltindan gogse en fazla %8 genisler.
  if (gogus && ka && Math.abs(gogus.x) > Math.abs(ka.x) * 1.08) {
    gogus = { x: Math.sign(gogus.x || 1) * Math.abs(ka.x) * 1.08, y: gogus.y };
  }
  // yan dikis gogusten baslar; gogus yoksa koltukalti
  const bas = gogus || ka;
  if (!bas) return [ka, bel, kalca, etek].filter(Boolean);
  pts.push(bas);
  if (bel) {
    // gogus alti: bele dogru inerken kavis ICERI (gogus cikintisinin altinda toparlanir)
    const derinlik = Math.abs(bas.x - bel.x);
    pts.push(araNokta(bas, bel, 0.42, -derinlik * 0.16 * Math.sign(bas.x || 1)));
    pts.push(bel);
  }
  if (kalca) {
    if (bel) {
      // belden kalcaya: DISARI kavis (kalca acilir)
      const acilim = Math.abs(kalca.x - bel.x);
      pts.push(araNokta(bel, kalca, 0.52, acilim * 0.14 * Math.sign(kalca.x || 1)));
    }
    pts.push(kalca);
  }
  if (etek) pts.push(etek);
  return pts.filter(Boolean);
}

// ---- bir gorunumun dis konturu (kapali yol) + aski / kol / ic ogeler
function gorunumCiz(g, ad, kirmizi, oturma, okumaRenk) {
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
  // YAN DIKIS = KUM SAATI (12 Eyl, kok duzeltme #4). ESKI HATA: gogus noktasi
  // koltukaltina 30 mm'den yakinsa yan dikisten TAMAMEN ATILIYORDU. croquis36'da
  // underarm.y=198.3 / bustLine.y=213.3 -> fark 15 mm, yani gogus HER ZAMAN
  // atiliyordu. Atilan nokta govdenin EN GENIS yeriydi (x=149.4 vs koltukalti
  // 114.7): yan dikis 114.7'den 106.4'e (bel) neredeyse DUZ iniyordu ve kum saati
  // hic olusmuyordu. "Govde duz" sikayetinin kok sebebi buydu.
  // COZUM: gogus ATILMAZ. Koltukalti kol evine ait bir nokta, yan dikisin baslangici
  // degil; yan dikis GOGUSTEN baslar. Koltukalti ile gogus arasindaki kisa parca
  // kol evinin kapanisidir (kolEviYolu zaten oraya kadar ciziyor).
  const yanSag = yanKumSaati(K, sag);
  const yuvarla = (!g.aski && (yb === 'kayik' || yb === 'yuvarlak')) ? 7 : 0;
  // ACIKLIK GENISLIK TAVANI: boyun noktasi ile omuz ucunun ORTASI. Derin bir
  // dekolte boyun noktasiyla sinirli kalirsa dar YARIK olur; omuz ucuna kadar
  // acilirsa giysi omuzdan duser. Satici flat'inde (etsy-01) V yakanin en genis
  // yeri omuz acilmasinin ~%55'i.
  const yakaTavan = sag('omuzUc')
    ? Math.abs(sag('yakaOmuz').x) + (Math.abs(sag('omuzUc').x) - Math.abs(sag('yakaOmuz').x)) * 0.55
    : null;
  d += yakaYolu(yakaOrtaSag, sag('yakaOmuz'), yb, true, yuvarla, yakaTavan);
  if (yuvarla) { const m = sag('yakaOmuz'), o2 = sag('omuzUc'), L2 = Math.hypot(o2.x - m.x, o2.y - m.y) || 1; d += ` Q ${P(m)} ${f1(m.x + (o2.x - m.x) / L2 * yuvarla)} ${f1(m.y + (o2.y - m.y) / L2 * yuvarla)}`; }
  if (g.aski && sag('askiUst')) {
    const a = sag('askiUst'), w = g.aski.genislik || 12, yo = sag('yakaOmuz'), ou = sag('omuzUc');
    // ic kenar: yakaOmuz -> aski ust ic; ust; dis kenar: aski ust dis -> omuzUc  (askilar omuza dogru hafif kavisli)
    // aski dis kenari: ust ucundan govde ust kenarina (askiDip) iner; omuz ucu bloğu cizilmez (tur 25 hakemi)
    const dip = sag('askiDip') || ou;
    d += ` L ${f1(a.x - w / 2)} ${f1(a.y)} L ${f1(a.x + w / 2)} ${f1(a.y)} L ${P(dip)}`;
    if (a.x + w / 2 > lm('shoulderTip').x + 0.5) kirmizi.push(`${ad}: aski ucu manken omuz noktasini asiyor (${f1(a.x + w / 2)} > ${f1(lm('shoulderTip').x)})`);
  } else if (sag('omuzUc')) {
    d += omuzYolu(sag('yakaOmuz'), sag('omuzUc'));
  }
  // kol oyugu / kol: omuzUc -> koltukalti
  const ou = (g.aski && sag('askiDip')) ? sag('askiDip') : sag('omuzUc'), ka = sag('koltukalti');
  if (ou && ka) {
    // KOL VARKEN DE KOL EVI KENARI (12 Eyl, Locket olcumu): eskiden duz ` L ka` cekiliyordu,
    // yani kol evi HIC cizilmiyordu; kolun ic kenari x=122'ye kavislanirken govde x=128'de
    // kaliyor ve arada 6 mm beyaz kama kaliyordu — kol havada duruyordu. Artik ikisi AYNI
    // kenari (kolEviYolu) kullanir: paylasilan kenar = birlesmis parca.
    if (g.kol) d += kolEviYolu(ou, ka, 1, kolEviOyuk(g));
    // kol evi KENARI: govdeye dogru icbukey; derinlik contract'tan (olculmus oyukluk)
    else { const kb = kolEviBas(sag('yakaOmuz'), ou); d += ` L ${P(kb)}` + kolEviYolu(kb, ka, 1, kolEviOyuk(g)); }
  }
  // KOLTUKALTI -> GOGUS KOPRUSU. Yan dikis artik gogusten basliyor (kum saati
  // duzeltmesi); kol evi ise koltukaltinda bitiyor. Aradaki kisa parca (croquis36'da
  // 114.7 -> 149.4 mm, 15 mm dususte) kol evinin govdeye KAPANISIDIR: disbukey,
  // gogus hattinda dikeye donerek yan dikise teget baglanir. Duz cizgi birakilirsa
  // koltukaltinda kirik bir kose olusur (satici flat'inde o kose YOK).
  if (ka && yanSag.length && (yanSag[0] !== ka)) {
    const g0 = yanSag[0], dyk = g0.y - ka.y;
    d += ` C ${f1(ka.x + (g0.x - ka.x) * 0.55)} ${f1(ka.y + dyk * 0.18)}` +
         ` ${f1(g0.x)} ${f1(g0.y - dyk * 0.45)} ${P(g0)}`;
  }
  d += catmull(yanSag, 0.38);
  // etek ucu: etekYan -> etekOrta -> etekYan(sol), sarkik kavis
  const eo = sag('etekOrta'), ey = sag('etekYan');
  const eySol = sol('etekYan');
  if (g.etekFisto) { // fisto etek ucu: dis kontur dalgali (kalin), dis ustunde arc'lar asagi
    const adim = (g.etekFisto.adim ?? 22), der = (g.etekFisto.derinlik ?? 6), sark = g.etekSarkma ?? 6;
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
  // sol yarim: AYNI noktalarin aynasi, ters sirada (yanAdlar listesi kaldirildi;
  // iki yarim ayri hesaplanirsa asimetri riski var)
  const yanSol = yanKumSaati(K, sag).map(ayna).reverse();
  d += catmull(yanSol, 0.38);
  const ouS = (g.aski && sol('askiDip')) ? sol('askiDip') : sol('omuzUc'), kaS = sol('koltukalti');
  // sol koprü: gogus -> koltukalti (sagin aynasi, ters yon)
  if (kaS && yanSol.length && (yanSol[yanSol.length - 1] !== kaS)) {
    const g0 = yanSol[yanSol.length - 1], dyk = g0.y - kaS.y;
    d += ` C ${f1(g0.x)} ${f1(g0.y - dyk * 0.45)}` +
         ` ${f1(kaS.x + (g0.x - kaS.x) * 0.55)} ${f1(kaS.y + dyk * 0.18)} ${P(kaS)}`;
  }
  if (ouS && kaS) {
    // sol yarim ters yonde yurur (koltukalti -> omuzUc): ayni kenar, ters cizilir
    // SOL KOL EVI: AYNI EGRI, TERS YON (12 Eyl, kok duzeltme #2d).
    // ESKI HATA: kolEviYolu(kaS, ouS, ...) cagriliyordu, yani KOLTUKALTI 'ou'
    // parametresine, OMUZ 'ka' parametresine geciyordu. Fonksiyonun 0.42/0.78
    // agirliklari asimetriktir; roller degisince egri BASKA bir egri olur.
    // OLCULDU: govdenin sol kol evi ile kolun sol kol evi ayni yukseklikte
    // 7.6 mm'ye kadar ayrisiyordu -> aradaki bos serit = "omuzda beyaz cizgi".
    // DOGRUSU: roller korunur (ou=omuz, ka=koltukalti), sadece CIZIM YONU terslenir.
    if (g.kol) d += kolEviYoluTers(ouS, kaS, -1, kolEviOyuk(g)).replace(/^ C/, ' C');
    else { const kbS = kolEviBas(sol('yakaOmuz'), ouS); d += kolEviYoluTers(kbS, kaS, -1, kolEviOyuk(g)) + ` L ${P(ouS)}`; }
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
    else d += omuzYoluTers(sol('yakaOmuz'), sol('omuzUc'));
  }
  // sol yaka: yakaOmuz(sol) -> yakaOrta(sol): sag yolun aynasi, ters yonde -> yakaYolu'nu ters cizmek yerine simetrik yol kur
  d += yakaTers(yakaOrtaSol, sol('yakaOmuz'), KS.yakaBicim || yb, true, yuvarla, yakaTavan);
  if (Math.abs(yakaOrtaSol.x - yakaOrtaSag.x) > 0.01 || Math.abs(yakaOrtaSol.y - yakaOrtaSag.y) > 0.01) d += ` L ${P(yakaOrtaSag)}`;
  d += ' Z';

  // YAKA ACIKLIGI TENDIR, ZEMIN DEGIL (12 Eyl, olculdu). Satici flat'inde acikligin
  // dolgusu govdeden ~%15 KOYU: etsy-01 V ici RGB(224,207,172) / govde RGB(253,244,230).
  // Beyaz uzerine beyaz cizilince aciklik GORUNMEZ.
  // KIRPMA: dolgu, govde konturunun DISINA tasmamali (hakem olcumu: bandin ustune ve
  // iki yanina ucgen sizintilar yapiyordu). Govde yolunun kendisi clipPath olur:
  // dolgu ancak govdenin ic bosluguna duser.
  let svg = '';
  // YAKA ACIKLIGI AYRI KAPALI EGRIDIR (12 Eyl, kok duzeltme #1).
  // ESKI HATA: aciklik govde konturunun bir PARCASIYDI — `d` yolu yakaYolu ile
  // acikligi DA ceviriyordu. Iki sonucu vardi:
  //   (a) acikligin kenari DIS KONTUR kalinliginda (disKonturMM) ciziliyordu;
  //       satici flat'inde yaka kenari IC DIKIS agirligindadir (etsy-01: dis 3 px,
  //       yaka kenari 2 px). Kalin siyah cerceve "cuval" gorunumunu uretiyordu.
  //   (b) aciklik konturun parcasi oldugu icin ona AYRI sekil verilemiyordu;
  //       her degisiklik omuz/govde hattini da bozuyordu.
  // COZUM: govde konturu omuzdan omuza KESINTISIZ gecer (yakaUstYolu); aciklik
  // govdenin USTUNE ayri kapali yol olarak cizilir, kendi dolgusu ve kendi ince
  // kenariyla. Boylece yakaya bagimsiz sekil verilebilir.
  const acik = (yakaOrtaSag.y - lm('neckFront').y) > (CIZ.tenEsigiMM ?? 45);
  const yakaAcikligiYolu = `M ${P(yakaOrtaSag)}` + yakaYolu(yakaOrtaSag, sag('yakaOmuz'), yb, true, 0, yakaTavan) +
    ` L ${P(sol('yakaOmuz'))}` + yakaTers(yakaOrtaSol, sol('yakaOmuz'), KS.yakaBicim || yb, true, 0, yakaTavan) + ' Z';
  // KUMAS RENGI (12 Eyl, kok duzeltme): govde dolgusu SABIT BEYAZ'di; elbise pembe
  // olsa da flat beyaz cikiyordu. Satici flat'leri renklidir: etsy-01 krem #fdf4e6,
  // etsy-08 soluk pembe, Bugra "Locket Top" ayni flat'i ALTI kumasta basiyor.
  // Renk okumadan gelir (g.renk ya da okuma.renk); yoksa beyaz.
  const KUMAS = g.renk || (okumaRenk ?? null) || '#fff';
  // GOVDE yolu burada BASILMAZ; once kol cizilmeli (kol govdenin ALTINDA).
  // kolCiz asagida tanimli oldugu icin gercek basim oradan sonra yapilir.
  // GOLGE / DERINLIK (12 Eyl, kok duzeltme #3).
  // ESKI DURUM: govde TEK DUZ RENKTI; kumasin hacmi hic okunmuyordu ("govde duz,
  // golgeler kotu"). Satici flat'i olculdu (etsy-01 krem figur, etsy-08 pembe
  // figur): govde dolgusu gercekten DUZ renktir, AMA iki sey ekler —
  //   (1) kenarlarda ICE dogru sonen ince bir KOYULUK (kumasin yuvarlanmasi);
  //       etsy-01 sag figurde kenar bandi govdeden ~%8-12 koyu, ~6-10 mm genislikte.
  //   (2) yapisal DIKIS cizgileri (prenses/yan) — bizde zaten var.
  // Yani cozum degisken gradyan DEGIL, kenara yapisan yumusak bir ic golgedir.
  // BURADA: govde yolunun kendisi clipPath olur, ayni yol KALIN ve KOYU bir
  // stroke'la ic tarafa basilir; kirpma disariyi keser, geriye sadece ic banda
  // yapisan yumusak koyuluk kalir. Renk KUMAS'tan turetilir (sabit gri degil),
  // yoksa pembe uzerinde gri leke olusur.
  const govdeSvg = kumasParcasi(d, KUMAS, 'govde-' + ad, 26);

  // YAKA ACIKLIGI — govdenin USTUNE, AYRI KAPALI EGRI (kok duzeltme #1).
  // Dolgu: acikliktan gorunen sey ten/astardir, govdeden koyu (olculdu: %15).
  // Kenar: IC DIKIS agirligi (disKonturMM degil) — satici flat'inde yaka cizgisi
  // dis konturdan incedir; kalin cerceve "cuval" gorunumunu uretiyordu.
  const yakaAcikSvg = acik
    ? `<path d="${yakaAcikligiYolu}" fill="${CIZ.tenDolgu ?? '#e9e3da'}"`
      + ` stroke="#000" stroke-width="${CIZ.disKonturMM * 0.62}"`
      + ` stroke-linejoin="round" stroke-linecap="round"/>\n`
    : '';

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
      let out = `<path d="${kd}" fill="${KUMAS}" stroke="#000" stroke-width="${CIZ.disKonturMM}" stroke-linejoin="round" stroke-linecap="round"/>\n`;
      // manset bandi: agiz cizgisinin altinda kapali dikdortgen (beyaz), kalin dis kontur
      const b1 = { x: dis.x + ux * bh, y: dis.y + uy * bh }, b2 = { x: ic.x + ux * bh, y: ic.y + uy * bh };
      out += `<path d="M ${P(dis)} L ${P(ic)} L ${P(b2)} L ${P(b1)} Z" fill="${KUMAS}" stroke="#000" stroke-width="${CIZ.disKonturMM}" stroke-linejoin="round" stroke-linecap="round"/>\n`;
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
      // KOL AGZI GOVDENIN DISINDA BITER (12 Eyl, kok duzeltme #2c).
      // ESKI HATA: kol agzi dogrudan koltukalti'na (ka) kapaniyordu. Kol evi kenari
      // oraya dogru ICBUKEY geldigi icin agiz kenari ile kol evi kenari SIVRI bir
      // kama olusturuyor, kama boyunca agiz cizgisi govdenin ICINDE kaliyor ve
      // govde dolgusuyla ortulmeyen ince bir BEYAZ SERIT birakiyordu (olculdu:
      // y=200 satirinda 3 px). Satici flat'inde (etsy-08) kol agzi koltukaltinin
      // DISINDA, kol evi kenarina belirgin bir aciyla girer.
      // COZUM: agzin ic ucu, kol evi kenarinin o yukseklikteki x'inden en az
      // AGIZ_PAYI kadar DISARIDA olmali.
      const AGIZ_PAYI = 9;
      const kolEviX = Math.min(Math.abs(ou.x), Math.abs(ka.x)) - Math.abs(ka.y - ou.y) * kolEviOyuk(g);
      const icUcX = Math.max(Math.abs(ic.x), kolEviX + AGIZ_PAYI);
      const agizIc = { x: s * icUcX, y: Math.min(ic.y, ka.y - 6) };
      kd += ` C ${f1(d2.x - (d2.x - agizIc.x) * 0.25)} ${f1(d2.y + 8)} ${f1(agizIc.x + (d2.x - agizIc.x) * 0.30)} ${f1(agizIc.y - 2)} ${P(agizIc)}`;
      // agizdan kol evine: kisa, belirgin acili gecis (kama degil)
      kd += ` L ${P(ka)}`;
      // KOL EVI KENARI PAYLASILIR (12 Eyl, kok duzeltme #2).
      // ESKI HATA: kolun kapanis kenari burada EL YORDAMIYLA yaziliyordu
      // (ka.x - 12*s, 0.32, 0.55 gibi uydurma katsayilar), govde ise AYNI kenari
      // kolEviYolu() ile ciziyordu. Iki farkli egri = omuzda ince BEYAZ HILAL
      // ("omuzda beyaz cizgi, kol havada duruyor" sikayeti). Kenar TEK yerden
      // gelmeli: govdenin kullandigi kolEviYolu'nun TERSI.
      kd += kolEviYoluTers(ou, ka, s, kolEviOyuk(g));
      kd += ' Z';
      // kol da govde gibi golgelenir (kok duzeltme #3): duz renk kol, yuvarlak
      // kapak kolu DUZ bir kagit parcasi gibi gosteriyordu.
      return kumasParcasi(kd, KUMAS, 'kol' + (s > 0 ? 'R' : 'L') + ad, 16);
    } else {
      kd += ` L ${P(dis)}`;
    }
    kd += ` L ${P(ic)} L ${P(ka)} Z`;
    let out = `<path d="${kd}" fill="${KUMAS}" stroke="#000" stroke-width="${CIZ.disKonturMM}" stroke-linejoin="round" stroke-linecap="round"/>\n`;
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
  // KOL, GOVDENIN ALTINA CIZILIR (12 Eyl, kok duzeltme #2b).
  // ESKI HATA: kol govdenin USTUNE ciziliyordu. Kol evi kenari govdeye dogru
  // ICBUKEY oldugu icin kolun kapanis kenari govdenin ICINE dusuyor ve orada
  // KENDI dis konturunu basiyordu; govdenin kol evi cizgisi de yaninda duruyordu.
  // Sonuc: iki paralel siyah cizgi + aralarinda beyaz serit (olculdu: ~2 px).
  // Gercek flat'te kol evi TEK cizgidir. Kolu govdeden ONCE cizince govde dolgusu
  // fazlalik kenari orter ve geriye tek dikis cizgisi kalir.

  // SIRA: kol (altta) -> govde (ustte) -> yaka acikligi -> ic ogeler
  if (g.kol) {
    svg += kolCiz(g.kol, ou, ka, 1);
    if (g.kolSol !== null) svg += kolCiz(g.kolSol || g.kol, ouS, kaS, -1);
  }
  svg += govdeSvg;
  svg += yakaAcikSvg;

  // IC OGELER
  for (const o of g.ogeler || []) {
    const taraflar = o.ayna === false ? [1] : (o.ayna === 'sol' ? [-1] : [1, -1]);
    for (const s of taraflar) {
      const pts = (o.noktalar || []).map((p) => { const q = nokta(p); q.x *= s; return q; });
      svg += ogeCiz(o, pts, s, K, KUMAS);
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
function yakaTers(orta, omuz, bicim, mirror = true, kisalt = 0, genislikTavan = null) {
  // sol yarim: omuz(sol) -> orta(sol). yakaYolu'nun (orta->omuz) sag-el aynasi ters yonde: kontrol noktalarini ters sirala
  const yol = yakaYolu(orta, { x: Math.abs(omuz.x), y: omuz.y }, bicim, true, kisalt, genislikTavan); // sag yol: orta -> omuz
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
function ogeCiz(o, pts, s, K, KUMAS) {
  // GIYSININ PARCASI OLAN OGELER KUMAS RENGINDE (12 Eyl kok duzeltme): fiyonk, bag,
  // bant, bebeYaka, cep kapagi giysiden KESILIR, o yuzden govdeyle ayni renktedir.
  // Beyaz birakilinca pembe elbisenin uzerinde beyaz fiyonk duruyordu.
  const KM = KUMAS || '#fff';
  const ince = `fill="none" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linecap="round"`;
  const kesik = `fill="none" stroke="#000" stroke-width="${CIZ.kesikliMM}" stroke-dasharray="${CIZ.kesikli}"`;
  const bombe = ((o.bombe ?? 0)) * s;
  switch (o.tip) {
    case 'dikis': case 'roba': return `<path d="${o.catmull ? 'M ' + P(pts[0]) + catmull(pts, 0.5) : yol(pts, false, bombe)}" ${ince}/>\n`;
    case 'kesikli': return `<path d="${o.catmull ? 'M ' + P(pts[0]) + catmull(pts, 0.5) : yol(pts, false, bombe)}" ${kesik}/>\n`;
    case 'fermuar': { // CB fermuar: kesikli cift cizgi + cekecek
      const [a, b] = pts;
      return `<path d="M ${f1(a.x - 2)} ${f1(a.y)} L ${f1(b.x - 2)} ${f1(b.y)} M ${f1(a.x + 2)} ${f1(a.y)} L ${f1(b.x + 2)} ${f1(b.y)}" ${kesik}/>\n<rect x="${f1(a.x - 3)}" y="${f1(a.y + 2)}" width="6" height="9" fill="#fff" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linecap="round" stroke-linejoin="round"/>\n`;
    }
    case 'buzgu': { const pref = o.yon === 'yukari' ? { x: 0, y: -1 } : o.yon === 'ic' ? { x: -s, y: 0 } : o.yon === 'dis' ? { x: s, y: 0 } : { x: 0, y: 1 };
      if (o.yon === 'ic' || o.yon === 'dis') return tikler(pts, (o.boy ?? 12), ((o.aralik ?? CIZ.buzguTikMM)), pref, 0);
      return tikler(pts, Math.max(24, ((o.boy ?? 12)) * 1.6), ((o.aralik ?? CIZ.buzguTikMM)) * 1.4, pref); }
    case 'pens': { const [uc, a, b, alt] = pts; return alt ? `<path d="M ${P(uc)} L ${P(a)} L ${P(alt)} L ${P(b)} Z" ${ince}/>\n` : `<path d="M ${P(a)} L ${P(uc)} L ${P(b)}" ${ince}/>\n`; }
    case 'dugme': {
      const [a, b] = pts, n = (o.adet ?? 5), r = ((o.cap ?? 12)) / 2; let out = '';
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0.5 : i / (n - 1), x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
        out += `<path d="M ${f1(x - r * 1.1)} ${f1(y)} L ${f1(x + r * 1.1)} ${f1(y)}" fill="none" stroke="#000" stroke-width="${CIZ.kilcalMM}"/>` +
          `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="#fff" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${f1(x - r * 0.3)}" cy="${f1(y)}" r="0.9" fill="#000"/><circle cx="${f1(x + r * 0.3)}" cy="${f1(y)}" r="0.9" fill="#000"/>\n`;
      }
      return out;
    }
    case 'pat': { const [a, b] = pts, w = ((o.genislik ?? 24)) / 2;
      const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L * w, ny = dx / L * w;
      return `<path d="M ${f1(a.x - nx)} ${f1(a.y - ny)} L ${f1(b.x - nx)} ${f1(b.y - ny)} M ${f1(a.x + nx)} ${f1(a.y + ny)} L ${f1(b.x + nx)} ${f1(b.y + ny)}" ${o.kesikli ? kesik : ince}/>\n`; }
    case 'fiyonk': { // FIYONK: iki KULAK (sag/sol, yatay) + ortada DUGUM + iki kuyruk.
      // OLCUM (pembe-fiyonk foto): kulaklar dugumden YANLARA acilir, hafif yukari egiktir;
      // kuyruklar dugumun altindan cikar. d7'de kulaklar yukari dogru cizildigi icin fiyonk
      // bandin uzerine tirmaniyor ve "havada" duruyordu.
      //   pts[0] = DUGUM merkezi (bandin uclarinin bulustugu yer)
      //   o.boy  = kulak yari acikligi (mm). o.kuyruk = kuyruk boyu (mm, 0 = kuyruk yok)
      const c = pts[0], b = (o.boy ?? 28), ky = o.kuyruk ?? b * 1.2, kh = b * (o.kulakYuk ?? 0.52);
      const kulak = (sg) => `M ${P(c)} C ${f1(c.x + sg * b * 0.45)} ${f1(c.y - kh)} ${f1(c.x + sg * b)} ${f1(c.y - kh * 0.85)} ${f1(c.x + sg * b)} ${f1(c.y - kh * 0.10)}` +
        ` C ${f1(c.x + sg * b)} ${f1(c.y + kh * 0.70)} ${f1(c.x + sg * b * 0.40)} ${f1(c.y + kh * 0.55)} ${P(c)} Z`;
      const kuyruk = ky ? `M ${f1(c.x - b * 0.13)} ${f1(c.y + kh * 0.35)} C ${f1(c.x - b * 0.38)} ${f1(c.y + ky * 0.42)} ${f1(c.x - b * 0.16)} ${f1(c.y + ky * 0.74)} ${f1(c.x - b * 0.42)} ${f1(c.y + ky)}` +
        ` M ${f1(c.x + b * 0.13)} ${f1(c.y + kh * 0.35)} C ${f1(c.x + b * 0.40)} ${f1(c.y + ky * 0.42)} ${f1(c.x + b * 0.14)} ${f1(c.y + ky * 0.76)} ${f1(c.x + b * 0.46)} ${f1(c.y + ky * 0.96)}` : '';
      const dugum = `M ${f1(c.x - b * 0.16)} ${f1(c.y - kh * 0.34)} C ${f1(c.x - b * 0.26)} ${f1(c.y)} ${f1(c.x - b * 0.16)} ${f1(c.y + kh * 0.34)} ${f1(c.x - b * 0.13)} ${f1(c.y + kh * 0.38)}` +
        ` L ${f1(c.x + b * 0.13)} ${f1(c.y + kh * 0.38)} C ${f1(c.x + b * 0.24)} ${f1(c.y)} ${f1(c.x + b * 0.16)} ${f1(c.y - kh * 0.34)} ${f1(c.x + b * 0.16)} ${f1(c.y - kh * 0.34)} Z`;
      const st = `fill="${KM}" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linecap="round" stroke-linejoin="round"`;
      return `<path d="${kulak(-1)} ${kulak(1)}" ${st}/>\n<path d="${dugum}" ${st}/>\n` + (ky ? `<path d="${kuyruk}" fill="none" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linecap="round"/>\n` : '');
    }
    case 'bag': { // SARKAN BAGCIK: dugumden cikan iki KAPALI serit, asagi ayrilarak iner.
      // Serit giysiden kesilir -> kumas renginde. Kapali yol: sol kenar asagi,
      // uc kesimi, sag kenar YUKARI geri, Z. (Once `replace` ile kurulmustu, yol
      // bozuluyor ve dort ayri cizgi gibi gorunuyordu.)
      const c = pts[0], b = (o.boy ?? 120), en = o.en ?? 7, ayr = o.ayrilma ?? 0.22;
      const serit = (sg) => {
        const x0 = c.x + sg * en * 0.55, x1 = c.x + sg * (en * 0.55 + b * ayr);
        const k1x = x0 + sg * b * 0.10, k1y = c.y + b * 0.38;
        const k2x = x1 - sg * b * 0.06, k2y = c.y + b * 0.72;
        const h = en / 2, ucY = c.y + b, ucEgim = en * 0.5;
        // sol kenar: ust -> alt
        let d = `M ${f1(x0 - sg * h)} ${f1(c.y)} C ${f1(k1x - sg * h)} ${f1(k1y)} ${f1(k2x - sg * h)} ${f1(k2y)} ${f1(x1 - sg * h)} ${f1(ucY)}`;
        // uc: egik kesim
        d += ` L ${f1(x1 + sg * h)} ${f1(ucY - ucEgim)}`;
        // sag kenar: alt -> ust (kontrol noktalari ters sirada)
        d += ` C ${f1(k2x + sg * h)} ${f1(k2y)} ${f1(k1x + sg * h)} ${f1(k1y)} ${f1(x0 + sg * h)} ${f1(c.y)} Z`;
        return d;
      };
      return `<path d="${serit(-1)}" fill="${KM}" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linejoin="round" stroke-linecap="round"/>\n` +
             `<path d="${serit(1)}" fill="${KM}" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linejoin="round" stroke-linecap="round"/>\n`;
    }
    case 'drape': { const kil = `fill="none" stroke="#000" stroke-width="${CIZ.kilcalMM}" stroke-linecap="round"`;
      let out = ''; for (let i = 0; i + 1 < pts.length; i += 2) out += `<path d="${yol([pts[i], pts[i + 1]], false, ((o.bombe ?? 6)) * s)}" ${kil}/>\n`; return out; }
    case 'firfir': { // dalgali kenar: kucuk yaylar
      let out = 'M ' + P(pts[0]);
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], L = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(2, Math.round(L / ((o.adim ?? 10))));
        const nx = -(b.y - a.y) / L, ny = (b.x - a.x) / L;
        for (let k = 1; k <= n; k++) { const t = k / n, tm = (k - 0.5) / n; out += ` Q ${f1(a.x + (b.x - a.x) * tm + nx * ((o.derinlik ?? 6)) * (k % 2 ? 1 : -1))} ${f1(a.y + (b.y - a.y) * tm + ny * ((o.derinlik ?? 6)) * (k % 2 ? 1 : -1))} ${f1(a.x + (b.x - a.x) * t)} ${f1(a.y + (b.y - a.y) * t)}`; }
      }
      return `<path d="${out}" ${ince}/>\n`;
    }
    case 'bebeYaka': { // bedene yatan yuvarlak yaka: on = CF'de ayrilan iki lob; arka (o.arka) = surekli
      const w = (o.genislik ?? 45), orta = { x: 0, y: K.yakaOrta.y }, omuz = { x: K.yakaOmuz.x * s, y: K.yakaOmuz.y };
      const dis = { x: omuz.x + s * w * 0.62, y: omuz.y + w * 0.5 };   // omuz ucu lobu (omuz-boyun kavsagini orter)
      const alt = { x: s * w * 0.42, y: orta.y + w * 0.95 };            // CF lobunun alt ucu
      let d;
      if (o.arka) d = `M ${P(orta)} L ${f1(0)} ${f1(orta.y + w * 0.9)} C ${f1(s * w * 0.9)} ${f1(orta.y + w * 0.95)} ${f1(dis.x - s * w * 0.2)} ${f1(dis.y + w * 0.15)} ${P(dis)} C ${f1(omuz.x + s * w * 0.35)} ${f1(omuz.y + w * 0.2)} ${f1(omuz.x + s * 6)} ${f1(omuz.y)} ${P(omuz)}`;
      else d = `M ${f1(s * 1.5)} ${f1(orta.y)} L ${f1(s * 1.5)} ${f1(orta.y + w * 0.55)} C ${f1(s * 2)} ${f1(orta.y + w * 1.02)} ${f1(s * w * 0.42)} ${f1(orta.y + w * 1.08)} ${f1(s * w * 0.62)} ${f1(orta.y + w * 0.82)} C ${f1(s * w * 0.85)} ${f1(orta.y + w * 0.52)} ${f1(dis.x - s * w * 0.1)} ${f1(dis.y + w * 0.15)} ${P(dis)} C ${f1(omuz.x + s * w * 0.4)} ${f1(omuz.y + w * 0.12)} ${f1(omuz.x + s * 10)} ${f1(omuz.y - 3)} ${f1(omuz.x + s * 5)} ${f1(omuz.y - 4)}`;
      // ic kenar: omuz noktasindan yaka cizgisi boyunca CF/CB'ye geri (boyun oyugu acik kalir)
      d += ` L ${f1(omuz.x)} ${f1(omuz.y)}` + yakaTers({ x: 0, y: K.yakaOrta.y }, { x: Math.abs(K.yakaOmuz.x), y: K.yakaOmuz.y }, o.bicim || 'yuvarlak', s < 0) + ' Z';
      let out = `<path d="${d}" fill="${KM}" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linejoin="round" stroke-linecap="round"/>\n`;
      if (o.firfir) out += ogeCiz({ tip: 'firfir', adim: 8, derinlik: 4 }, o.arka ? [{ x: 0, y: orta.y + w * 0.9 + 4 }, { x: dis.x + s * 3, y: dis.y + 3 }] : [{ x: s * w * 0.62, y: orta.y + w * 0.82 + 4 }, { x: dis.x + s * 3, y: dis.y + 3 }], s, K);
      return out;
    }
    case 'cepKapagi': { const [a, b] = pts; const h = (o.yukseklik ?? 40), ph = (o.cepBoyu ?? 120);
      const cep = `<path d="M ${f1(a.x + s * 3)} ${f1(a.y + h * 0.4)} L ${f1(a.x + s * 3)} ${f1(a.y + ph)} Q ${f1((a.x + b.x) / 2)} ${f1(a.y + ph + 12)} ${f1(b.x - s * 3)} ${f1(b.y + ph)} L ${f1(b.x - s * 3)} ${f1(b.y + h * 0.4)}" fill="${KM}" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linecap="round" stroke-linejoin="round"/>\n`;
      return cep + `<path d="M ${P(a)} L ${P(b)} L ${f1(b.x)} ${f1(b.y + h * 0.7)} Q ${f1((a.x + b.x) / 2)} ${f1(b.y + h * 1.15)} ${f1(a.x)} ${f1(a.y + h * 0.7)} Z" fill="${KM}" stroke="#000" stroke-width="${CIZ.icDikisMM}" stroke-linecap="round" stroke-linejoin="round"/>\n<path d="M ${f1(a.x + s * 3)} ${f1(a.y + 4)} L ${f1(b.x - s * 3)} ${f1(b.y + 4)}" ${kesik}/>\n`; }
    case 'yakaBandi': { // BANT YAKA (stand / tie collar) — OLCULMUS KONVANSIYON
      // KAYNAK: flat-01 (flats-clean) on figur, bant seridi.
      //   ust kenar tepe y=35, alt dikis y=58  -> serit kalinligi h = 23 px
      //   serit tam genislik 225-104 = 121 px  -> h/W = 0.19 ; h/(W/2) = 0.38
      // KURAL: bant SABIT KALINLIKLI bir serittir. Alt kenar govdenin boyun halkasi,
      // ust kenar ayni egrinin NORMAL yonunde h kadar otelenmisi. (Iki kenari ayri ayri
      // egri olarak kurmak, CF'de ikisini birlestirip yanlarda ayirinca 'boynuz' uretiyordu.)
      const nb = lm('neckBase'), nf = lm('neckFront');
      const cfAlt = pts[0] ? pts[0].y : nf.y;
      const yariGen = Math.abs(nb.x) * ((o.omuzOran ?? 0.50));
      const h = o.yukseklik != null ? o.yukseklik : yariGen * 0.38;
      const omuzAlt = nb.y + ((o.omuzDusme ?? 2));
      // aralik=0 GECERLI bir degerdir (bant CF'de kapali). `|| 3` sifiri yutuyordu:
      // JS'te 0 falsy, bu yuzden 'aralik: 0' yazan okuma sessizce 3 mm yarik aliyordu.
      const ay = o.acik ? (o.aralik != null ? o.aralik : 3) : 0;
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
      return `<path d="${dpath}" fill="${KM}" stroke="#000" stroke-width="${CIZ.disKonturMM * 0.62}" stroke-linejoin="round" stroke-linecap="round"/>\n`;
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
      const w = ((o.genislik ?? 46)) / 2;
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
        const enY = a.y + L * ((o.enGenisOran ?? 0.46));
        d = `M ${f1(s * w * bogaz)} ${f1(a.y)}` +
          ` C ${f1(s * w * 0.72)} ${f1(a.y + L * 0.16)} ${f1(s * w)} ${f1(enY - L * 0.20)} ${f1(s * w)} ${f1(enY)}` +
          ` C ${f1(s * w)} ${f1(enY + L * 0.30)} ${f1(s * w * 0.60)} ${f1(b.y - L * 0.08)} ${P(b)}` +
          ` C ${f1(-s * w * 0.60)} ${f1(b.y - L * 0.08)} ${f1(-s * w)} ${f1(enY + L * 0.30)} ${f1(-s * w)} ${f1(enY)}` +
          ` C ${f1(-s * w)} ${f1(enY - L * 0.20)} ${f1(-s * w * 0.72)} ${f1(a.y + L * 0.16)} ${f1(-s * w * bogaz)} ${f1(a.y)} Z`;
      }
      return `<path d="${d}" ${kesim}/>\n`;
    }
    case 'pili': { // ters pili: iki kat cizgisi, ustte dikise baglanir, altta etek ucuna iner
      const [ust, alt] = pts, w = ((o.genislik ?? 26)) / 2;
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
  const parcalar = gorunumler.map(([ad, g]) => ({ ad, ...gorunumCiz(g, ad, kirmizi, okuma.oturma, okuma.renk) }));
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
