// ============================================================================
// MALZEME KATMANI — 2026-07-31
//
// Tez: kalip alanlari yemek degil MALZEME olmali. engine/vocab.json bugun 37
// kategorik alan tutuyor (neckline: crew|scoop|vNeck|... , collarType:
// peterPan|shirt|crescent|...). Bunlar tabak isimleri. Asagidaki liste
// malzemedir: her biri SUREKLI bir sayidir, iki tarif arasi bir yer vardir.
//
// KANITLANAN (olculdu 2026-07-31, kaynak
// patterns_real/geometry/geometry-full.json -- satin alinmis Bugra "Locket Top"
// A0 PDF'i, beden 38, mm-kalibre. Motor ciktisi DEGIL):
//   Ayni kalibin uc parcasi -- uretici defterinde ikisinin adi var, ucuncusunun
//   adi YOK -- olcum icin ayni nesnedir: iki kenarli bir EGRI BANT. Her kenar
//   (uzunluk + 4 egrilik katsayisi) = 5 sayi ile yeniden ciziliyor:
//     bant B  kenar hatasi ortalama 0.03mm / en fazla 0.14mm
//     bant C  kenar hatasi ortalama 0.01mm / en fazla 0.03mm
//     parca 3 duz kenarinda 0.03mm; kose iceren kenarinda 2.5mm (kose ORADA
//             oldugunu soyluyor, gizlemiyor)
//   Yani ADI olmayan parca da olculuyor ve yeniden ciziliyor. Ad tasimiyor.
//   ACIKLIK = serbest kenar / bagli kenar: 1.400 · 1.519 · 1.545.
//
// CURUTULEN -- bunu iddia ETME (31 Tem, hakem + kendi olcumum ayni yere cikti):
//   "Yaka tipi diye bir sey yoktur, tek bir egrilik kadrani hepsini verir"
//   YANLIS. Kalipcilik literaturunde SERT bir ikilik var:
//     - yatan yaka (bebe/flat): boyun kenari gomlegin yaka egrisinden KOPYALANIR
//       (on parca + arka parca, omuz noktasinda birlesir, orada KIRILIR)
//     - hakim / gomlek yakasi: boyun kenari bir dikdortgen iskelet uzerine tek
//       bir skalerden (yarim boyun olcusu) cizilir
//   Tek skaler egrilik bu ikisi arasinda yolculuk edemez.
//   Kendi olcumum da ayni yone cikti: kapali form aciklik = 1 + w/r 23% hata
//   veriyor (bant duz halka degil, derinligi boyunca degisiyor), ve parca 3'un
//   bagli kenari ortasinda KOSE tasiyor -- tek egrilik polinomu tutmuyor.
//   -> "Dik/yatan" bir OLCUM sonucudur, cizim GIRDISI degil.
//
// EKSIK MALZEMELER (literatur taramasi, kaynakli; bu dosya HENUZ tasimiyor):
//   iplik/verev · kumas davranisi · balans (on-arka boy iliskisi) · dagilim
//   profilleri (her skaler aslinda bir egri boyunca fonksiyon) · contouring
//   (Armstrong 3. ilke: vucudun COKUK yerinden almak) · spring · sweep ·
//   roll line · dikis-esitligi kisiti · pivot · pay/centik · on-arka asimetri.
//   Ayrica: pens payi + ease + cevre TEK eksendir, uc kez sayilmis;
//   ve topoloji bir malzeme degil, TABAK SECICISIDIR -- once o sabitlenir,
//   altindaki her sey ondan sonra surekli olur.
//
// Bu dosya ciziim kalemini (engine/flat-engine/_engine-full.mjs, SALT-OKURUR)
// DEGISTIRMEZ. Kalem zaten bir stil KAYDI aliyor; styles.json'da o kayittan 31
// tane var, o kadar. Burasi kaydi listeden degil malzeme degerlerinden kurar.
// ============================================================================

// --- 10 malzeme ailesi. Sira ekranda gorunen sira.
// EN USTTE TOPOLOJI: yukaridaki notun kendi cumlesi -- "topoloji bir malzeme
// degil, TABAK SECICISIDIR -- once o sabitlenir, altindaki her sey ondan sonra
// surekli olur". 31 kayitlik listenin 14'u UST idi ve tezgah 'dress'e civili
// oldugu icin hicbiri disari cikmiyordu (Damla, 1 Agu 14:00: "sadece 1 urun mu
// var, vocab kombinasyonlari yok mu").
const FAMILIES = [
  ['govde', 'ne dikiyoruz', 'Ilk soru bu: elbise mi, ust mu. Altindaki her kadran anlamini buradan alir; bu topolojide okunmayan kadran soluk gosterilir.'],
  ['olcu', 'beden', 'Vucut olcusu. Malzeme degil, uzerine calisilan sey.'],
  ['seviye', 'seviye', 'Vucutta yukseklik: yaka nereye iner, bel nerede, etek nerede biter.'],
  ['cevre', 'cevre', 'Bir seviyedeki genislik: yaka acikligi, kol genisligi.'],
  ['pens', 'pens payi', 'Vucuda oturmak icin cevreden CIKARILAN miktar.'],
  ['bolluk', 'bolluk', 'Kes-ac ile EKLENEN kumas. Klos, buzgu, firfir hepsi bu.'],
  ['kapak', 'kapak', 'Kol kapaginin yuksekligi ve payi.'],
  ['bant', 'dik / yatan', 'Yaka, mansaf, peplum, firfir: hepsi bir bant. Derinlik + aciklik.'],
  ['kenar', 'kenar rolu', 'Bir kenara ne oluyor: dikis / kat / buzgu / biye.'],
  ['topoloji', 'topoloji', 'Kac panel var, hangi kenar hangisine dikiliyor.'],
  ['kalem', 'kalem', 'Cizim dili. Giysinin kendisi degil, resmi.'],
];

// --- malzemeler. def = varsayilan profil (Damla zevki, generic degil).
// Her satir: [anahtar, aile, etiket, min, max, adim, varsayilan, aciklama]
const M = [
  ['size', 'olcu', 'beden', 0, 7, 1, 2, 'EU34..EU48. Sabit beden satilir; olcuye gore dikim degil.'],

  ['hemLevel', 'seviye', 'etek boyu', 8, 112, 1, 74, 'Crop’tan maxi’ye tek sayi. mini/midi/maxi ayri tur degil.'],
  ['neckDepth', 'seviye', 'yaka derinligi on', 2, 30, 0.5, 12, 'Yakanin on ortada ne kadar indigi.'],
  ['neckDepthBack', 'seviye', 'yaka derinligi arka', 1, 20, 0.5, 3, 'Ayni sey, arkada.'],
  ['yokeDrop', 'seviye', 'bel hatti', 6, 26, 0.5, 12, 'Bel dikisinin yuksekligi. Empire = bu sayi kucuk.'],
  ['shoulderSlope', 'seviye', 'omuz egimi', 0.6, 3.0, 0.05, 1.6, 'Omuz cizgisinin dususu.'],
  ['sleeveLen', 'seviye', 'kol boyu', 5, 48, 0.5, 14, 'Kolun nerede bittigi. kisa/dirsek/uzun ayri tur degil.'],

  ['neckWidth', 'cevre', 'yaka genisligi', 0.85, 1.75, 0.01, 1.05, 'Yakanin omza dogru acilmasi. Bateau = bu sayi buyuk.'],
  ['sleeveWidth', 'cevre', 'kol genisligi', 3, 15, 0.1, 7, 'Kolun cevresi.'],
  ['armholeHollow', 'cevre', 'kol oyugu', 0.04, 0.32, 0.005, 0.12, 'Oyugun ne kadar ice oyuldugu.'],
  ['strapWidth', 'cevre', 'aski genisligi', 1.0, 5.0, 0.1, 2.6, 'Spagetti = kucuk, kalin aski = buyuk.'],
  ['strapLen', 'cevre', 'aski boyu', 3, 16, 0.5, 8, ''],

  ['waistNip', 'pens', 'bel pensi', 0, 0.38, 0.005, 0.12, 'Belden cikarilan pay. 0 = kutu, 0.30 = korsaj.'],
  ['bustProject', 'pens', 'gogus bombesi', 0, 1.0, 0.02, 0.5, ''],
  ['bustHeight', 'pens', 'gogus yuksekligi', 0.15, 0.6, 0.01, 0.3, ''],

  ['skirtFull', 'bolluk', 'etek bollugu', 1.0, 2.9, 0.02, 1.6, '1.0 = duz, 1.95 = A, 2.6+ = klos. Ayri tur degil, tek sayi.'],
  ['skirtCurve', 'bolluk', 'etek dususu', 0, 1, 0.02, 0.4, 'Yan hattin koni-duz mu bombeli mi dustugu.'],
  ['gatherRatio', 'bolluk', 'buzgu orani', 1.0, 3.4, 0.05, 1.0, 'Kac kat kumas buzuluyor. 1.0 = buzgu yok.'],
  ['ruffle', 'bolluk', 'firfir', 0, 1.4, 0.02, 0, ''],

  ['capPuff', 'kapak', 'kapak yuksekligi', 0, 4.0, 0.05, 0, '0 = duz set-in kol. 1.4+ = puf. Balon/bishop ayri tur degil.'],
  ['cuffGather', 'kapak', 'kol agzi buzgusu', 0, 2.0, 0.05, 0, ''],

  ['collarWidth', 'bant', 'bant derinligi', 0.8, 10, 0.1, 4.6, 'Yaka bandinin derinligi. Dik/yatan bunun SONUCUDUR, girdisi degil.'],
  ['collarGap', 'bant', 'bant araligi', 0, 3.0, 0.05, 0.5, 'Iki yaka ucunun on ortada acikligi.'],

  ['shirrRows', 'kenar', 'buzgu sirasi', 3, 12, 1, 6, ''],
  // biye kadranlari 1 Agu'ya kadar compile()'da 1.4 / 16 diye SABIT yaziliydi;
  // kalem ikisini de okuyor (laceBand genlik + tarak sayisi).
  ['laceWidth', 'kenar', 'biye derinligi', 0.5, 4.0, 0.1, 1.4, 'Dantel/biye seridinin derinligi.'],
  ['laceScallops', 'kenar', 'biye tarak sayisi', 4, 30, 1, 16, 'Serit boyunca kac dalga.'],
  ['goreCount', 'topoloji', 'panel sayisi', 2, 12, 2, 6, 'Etegin kac dilimden kuruldugu.'],
  ['tieLength', 'topoloji', 'bag boyu', 8, 34, 1, 22, ''],

  ['foldCount', 'kalem', 'kat sayisi', 2, 18, 1, 10, ''],
  ['drape', 'kalem', 'dokum', 0, 1.6, 0.05, 1, ''],
  ['hemWave', 'kalem', 'etek dalgasi', 0, 2.5, 0.05, 1, ''],
  ['hemDip', 'kalem', 'etek sarkmasi', 0, 8, 0.2, 2, ''],
  ['seed', 'kalem', 'kalem tohumu', 1, 40, 1, 7, 'Ayni tohum hep ayni cizim. Rastgelelik yok.'],
];

// --- kenar rolu + topoloji: acik/kapali. Bunlar da malzeme, sadece surekli degil.
//
// BAYRAKLAR IKI AYRI YERE GIDER — karistirmak sessizce hicbir sey yapmaz:
//   FLAGS  -> kalemin parts{} nesnesi   (kalem parts() ile okur: pt.sleeve ...)
//   SFLAGS -> stil KAYDININ kendisi     (kalem STYLE[p.style] ile okur: st.boxy ...)
// Kalem bilmedigi anahtari yok sayar, o yuzden yanlis kovaya koymak hata
// vermez, sadece kadran olu kalir. Ayrim bu yuzden yazili.
const FLAGS = [
  ['sleeve', 'topoloji', 'kol var', true, 'Kol paneli var mi.'],
  ['collar', 'topoloji', 'yaka bandi', false, 'Boyun kenarina dikilen bant.'],
  ['straps', 'topoloji', 'aski panelleri', false, 'Bant govdenin ustunden omza cikan aski parcalari. SADECE bant govdede: omuz govdesinde kalem k.strapX kurmuyor, cizim NaN oluyor (olculdu).'],
  ['princessSeam', 'topoloji', 'prenses dikis', false, 'Pensi dikise gomer. Pens payi ayni, YOLU farkli.'],
  ['backSeam', 'topoloji', 'arka orta dikis', true, ''],
  ['gorePanels', 'topoloji', 'dilimli etek', false, ''],
  ['wrapTie', 'topoloji', 'kruvaze bag', false, 'Kruvaze onun belde baglanan ucu.'],
  ['tie', 'topoloji', 'boyun bagi', false, ''],
  ['tieBack', 'topoloji', 'arka bel bagi', false, ''],
  ['shirr', 'kenar', 'buzgulu kenar', false, 'Kenar duz dikilmiyor, buzuluyor.'],
  ['casing', 'kenar', 'tunel / bagcik', false, ''],
  ['cfGather', 'kenar', 'on orta buzgu', false, 'Yakanin hemen altinda on ortada toplanan buzgu.'],
  ['laceNeck', 'kenar', 'yaka biyesi', false, ''],
  ['laceSleeve', 'kenar', 'kol biyesi', false, ''],
  ['laceHem', 'kenar', 'etek biyesi', false, ''],
];

// --- stil KAYDI bayraklari (st.*). Kalem bunlari parts{} icinde ARAMAZ.
// 1 Agu'ya kadar hicbiri kurulmuyordu; kalem okuyor, tezgah vermiyordu.
const SFLAGS = [
  ['boxy', 'pens', 'kutu kesim', false, 'Bel daralmasi YOK: bel bust hizasina acilir, siluet boru. Acikken bel pensi kadrani gorunmez kalir.'],
  ['spaghettiStrap', 'topoloji', 'spagetti aski', false, 'Omuz cizgisi uzerinde yukari cikip baglanan ince aski. OMUZ govdesi ister; aski govdesinde omuz noktasi olmadigi icin kalem NaN uretiyor (olculdu), o yuzden orada kapatilir.'],
  ['fittedBand', 'topoloji', 'oturan korsaj', false, 'Aski govdesinin ust kenarini daraltir (bust*0.72) ve bele oturtur. SADECE aski govdesinde okunur.'],
  ['peplumRuffle', 'bolluk', 'peplum firfiri', false, 'Peplum hem’ine dikilen buzgulu serit. Peplum yoksa kalem hic bakmaz.'],
];

// --- yaka egrisinin SEKLI.
// KALEMIN GERCEKTEN AYRIK OLDUGU YER SADECE UC DEGER (olculdu 2026-08-01,
// bayt karsilastirmasi): 'v' · 'square' · 'sweetheart'. Kalemde bu ucunun
// disinda neckline ne yazarsa yazsin ('boat', 'crew', 'scoop', 'wrap',
// bos) AYNI egri cikiyor; ustte (garment==='top') hepsi yuvarlak U dalina
// dusuyor ve dordu de BAYT-AYNI.
//   -> 'kayik' bu yuzden bir kalem degeri degil, HAZIR AYAR: yaka genisligi
//      + on derinlik kadranlarini gorunur sekilde bir yere iter. Zaten bu
//      dosyanin tezi: kayik yaka ayri bir tur degil, GENIS + SIG yuvarlak
//      yakadir. Kadran ekranda kayar, arkada gizli is yapilmaz.
//   -> 'kruvaze' de bir yaka EGRISI degil: kalemde st.neckline==='wrap' hicbir
//      yerde okunmuyor (olu deger), gorunen kruvazenin tamami parts.wrapSurplice
//      cizgileridir. Iki kavram tek dugmeye indirildi: FLAGS'teki ayri
//      'kruvaze on' bayragi KALDIRILDI, yerini bu yaka ailesi aldi. Kayit
//      yine neckline:'wrap' tasir (mihenk stili wrap_dress boyle) ama isi
//      yapan parts.wrapSurplice'tir.
const NECKSHAPES = [
  ['round', 'yuvarlak'],
  ['v', 'V'],
  ['square', 'kare'],
  ['sweetheart', 'kalp'],
  ['boat', 'kayik'],
  ['wrap', 'kruvaze'],
];
// kalemin ayri egri cizdigi degerler (digerleri yuvarlak U'ya duser)
const PEN_NECK = { v: 'v', square: 'square', sweetheart: 'sweetheart', wrap: 'wrap' };
// hazir ayar: dugmeye basinca GORUNUR sekilde kayan kadranlar
const NECKPRESET = {
  boat: { neckWidth: 1.55, neckDepth: 6 },
  wrap: { neckDepth: 20, neckWidth: 1.15 },
};

// --- topoloji secicileri (surekli degil, ayrik: once bunlar sabitlenir)
const GARMENTS = [['dress', 'elbise'], ['top', 'ust']];
// GOVDE TABANI (st.top). 1 Agu'ya kadar bu TEK bir 'aski' onay kutusuydu ve iki
// ayri seyi ayni anda yapiyordu: (a) govde tabanini bant yapmak (st.top='band'),
// (b) aski panellerini cizmek (parts.straps). Ikisi ayrilinca BANDEAU (bant
// govde + aski YOK) ilk kez ulasilabilir oluyor -- kalemde zaten var olan bir
// aile (styles.json: top_bandeau_shirred_peplum) ama tezgahtan cikmiyordu.
const BODICES = [['shoulder', 'omuz'], ['band', 'bant / straplez']];
// peplum: kalemde p.peplum bir ENUM. 'pointed' 2.0 kat aciklik / 36px boy /
// 12px hem dalgasi; 'full' 1.8 / 28 / 4; baska her truthy deger 1.45 / 28 / 4
// (kalem satir 322-329). 'half' o ucuncu kovanin adidir. SADECE ust'te okunur
// (st.garment==='top' kosulu kalemde yazili; elbisede bayt-ayni cikti).
const PEPLUMS = [['none', 'yok'], ['half', 'kisa'], ['full', 'dolgun'], ['pointed', 'sivri']];
// bel bagi: kalemde 'bow' (fiyonk) | 'tie' (kusak ucu). SADECE elbisede okunur
// (kalem satir 371: st.garment!=='top'); ustte bayt-ayni cikti.
const WAISTTIES = [['none', 'yok'], ['bow', 'fiyonk'], ['tie', 'kusak']];
// kruvaze bindirme yonu (kalem p.wrapDir 1 | 2)
const WRAPDIRS = [['right', 'sag uste'], ['left', 'sol uste']];

const SIZES = ['EU34', 'EU36', 'EU38', 'EU40', 'EU42', 'EU44', 'EU46', 'EU48'];
const INKS = [['minimal', 'az'], ['orta', 'orta'], ['dolu', 'dolu']];

function defaultState() {
  const s = {
    _garment: 'dress', _bodice: 'shoulder', _neckShape: 'round',
    _peplum: 'none', _waistTie: 'none', _wrapDir: 'right',
    _ink: 'orta', _asym: true,
  };
  M.forEach(([k, , , , , , d]) => { s[k] = d; });
  FLAGS.forEach(([k, , , d]) => { s[k] = d; });
  SFLAGS.forEach(([k, , , d]) => { s[k] = d; });
  return s;
}

// ---------------------------------------------------------------------------
// KADRAN GECERLILIGI — su anki topolojide kalemin OKUMADIGI malzemeler.
// Her satir kalemdeki gercek kosula dayanir, tahmine degil; hepsi bayt
// karsilastirmasiyla dogrulandi (engine/tools/atolye-contact.mjs --dead).
// UI bunlari silmez, SOLDURUR: uzay gorunur kalsin ama yalan soylemesin.
// ---------------------------------------------------------------------------
function inertKeys(s) {
  const off = new Set();
  const isTop = s._garment === 'top';
  const isBand = s._bodice === 'band';
  const gathering = !!s.shirr && s.gatherRatio > 1.05;   // kalem: iki kosul birlikte

  if (isTop) {
    // ust dali kalemde erken return ediyor (satir 154-171): etek paneli,
    // drapePlan ve hem dalgasi o dala hic girmiyor.
    ['skirtFull', 'skirtCurve', 'hemWave', 'foldCount', 'drape'].forEach((k) => off.add(k));
    off.add('_waistTie');                       // kalem satir 371: st.garment!=='top'
    // kalem satir 74: ust'te bustX omuz genisligine kilitleniyor. Bant dalinda
    // ise ust kenar hala bombeyi okuyor (satir 98) -> orada yasar.
    if (!isBand) off.add('bustProject');
    if (!s.shirr) off.add('gatherRatio');        // ust'te buzgu disinda buzgu orani okunmuyor
  } else {
    off.add('_peplum');                          // kalem satir 322: st.garment==='top'
  }
  if (!isTop || s._peplum === 'none') off.add('peplumRuffle');

  if (isBand) {
    // bant dalinda kalem omuz/yaka noktasini (k.nX/k.stX/k.stY/k.uaX/k.nSeg)
    // hic kurmuyor (satir 92-98) -> yaka, omuz, kol oyugu ve kola bagli her sey
    // olu; bazilari acilirsa NaN (compile() orada kapatiyor).
    ['_neckShape', 'neckDepth', 'neckDepthBack', 'neckWidth', 'shoulderSlope',
      'armholeHollow', 'spaghettiStrap', 'princessSeam', 'gorePanels', 'goreCount',
      'cfGather', 'wrapTie', 'laceNeck', 'collar', 'collarWidth', 'collarGap',
      'sleeve', 'sleeveLen', 'sleeveWidth', 'capPuff', 'cuffGather', 'laceSleeve',
    ].forEach((k) => off.add(k));
  } else {
    // omuz govdesinde bant tabaninin kadranlari okunmuyor
    ['strapWidth', 'strapLen', 'fittedBand', 'straps', 'ruffle'].forEach((k) => off.add(k));
  }
  if (isBand && !s.straps) { off.add('strapWidth'); off.add('ruffle'); }  // strapLen bant ust kenarini tasir, aski olmasa da yasar
  if (!isBand && !s.sleeve) ['sleeveLen', 'sleeveWidth', 'capPuff', 'cuffGather', 'laceSleeve'].forEach((k) => off.add(k));
  if (!gathering) { off.add('shirrRows'); off.add('casing'); }
  if (s.gatherRatio <= 1.05) off.add('shirr');   // buzgu bayragi tek basina cizgi uretmiyor
  if (!s.gorePanels) off.add('goreCount');
  if (!s.collar) { off.add('collarWidth'); off.add('collarGap'); }
  if (!s.tie && !s.tieBack && !s.wrapTie && s._waistTie === 'none') off.add('tieLength');
  if (!s.laceNeck && !s.laceSleeve && !s.laceHem) { off.add('laceWidth'); off.add('laceScallops'); }
  if (s._neckShape !== 'wrap' || isBand) off.add('_wrapDir');   // yon sadece kruvaze cizilirken
  if (s._ink !== 'dolu') off.add('foldCount');   // drapePlan kat sayisini SADECE dolu murekkepte okuyor
  if (s.boxy) off.add('waistNip');               // kalem satir 80: eX=bustX, pens payi yutulur
  return off;
}

// Kalemin enum bekledigi iki yer. Surekli kadran en yakin kovaya yuvarlanir;
// kova sinirlari kalemin KENDI sayilaridir, uydurma degil:
//   kol   : plainSleeve() {cap:9, short:17, elbow:28, long:42}
//   ust boy: {cropped:5, hip:16, tunic:30}   (kalem satir 157)
const SLEEVE_BUCKETS = [['cap', 9], ['short', 17], ['elbow', 28], ['long', 42]];
const TOP_BUCKETS = [['cropped', 5], ['hip', 16], ['tunic', 30]];
function nearestBucket(v, buckets) {
  return buckets.reduce((a, b) => (Math.abs(b[1] - v) < Math.abs(a[1] - v) ? b : a))[0];
}

// ---------------------------------------------------------------------------
// compile(): malzeme degerleri -> kalemin bekledigi stil KAYDI.
// Kalem dosyasina dokunulmaz; disari verdigi STYLE ve LEN nesnelerine
// calisma aninda tek bir kayit eklenir.
// ---------------------------------------------------------------------------
function compile(s) {
  LEN['__live'] = s.hemLevel;                 // surekli etek boyu (mini/midi/maxi enum'u yerine)

  const isTop = s._garment === 'top';
  const isBand = s._bodice === 'band';        // kalemde st.top === 'band'
  const shape = s._neckShape;

  const parts = {};
  FLAGS.forEach(([k]) => { parts[k] = !!s[k]; });
  // KALEM SINIRI 2 (goruldu 2026-07-31, PNG ile): kalemdeki collarShape() yaka
  // egrisinin SADECE ilk segmentini ofsetliyor (collarShape(p, half[0], ...)).
  // Yuvarlak yakada nSeg=1, fark edilmiyor; V/kare/kalp yakada nSeg=2 ve bant
  // yakanin yarisinda bitip V'nin dibinde burusmus bir kapak gibi ciziliyordu.
  // Kalem SALT-OKUNUR; duzeltme burada: bant kaleme hic cizdirilmez, draw()
  // ayni genislik profiliyle TUM yaka segmentlerini yuruyerek cizer (kalemin
  // icindeki laceNeck zaten boyle yapiyor: polyFromSegs(half.slice(0,k.nSeg))).
  parts.collar = false;

  // KRUVAZE: yaka ailesinin 'wrap' uyesi = parts.wrapSurplice (yukaridaki
  // NECKSHAPES notu). Aski govdesinde kalem omuz noktasini (k.stY) hic
  // kurmadigi icin surplice cizimi CRASH ediyor (olculdu) -> orada kapali.
  parts.wrapSurplice = shape === 'wrap' && !isBand;
  parts.wrapTie = parts.wrapTie && !isBand;   // k.eX var ama kruvaze bagi surplice'siz anlamsiz
  parts.cfGather = parts.cfGather && !isBand; // k.ny sadece omuz govdesinde kuruluyor
  // BANT GOVDE KAPILARI — hepsi olculdu (bkz. atolye-contact.mjs --probe):
  // bant dalinda kalem k.nX / k.stX / k.stY / k.uaX / k.uaY / k.nSeg kurmuyor.
  //   parts.straps  omuz govdesinde  -> NaN x488   (k.strapX yok)
  //   parts.sleeve  bant govdesinde  -> NaN        (k.stX/k.uaX yok)
  //   parts.laceNeck bant govdesinde -> half.slice(0, undefined) TUM govdeyi
  //                                     dantel sanip siluetin etrafini doluyor
  parts.straps = parts.straps && isBand;
  if (isBand) { parts.sleeve = false; parts.laceNeck = false; parts.laceSleeve = false; }

  const st = {
    label: 'atolye',
    garment: isTop ? 'top' : 'dress',
    top: isBand ? 'band' : 'shoulder',
    neckline: PEN_NECK[shape],
    roundNeck: shape === 'round' || shape === 'boat',
    length: '__live',
    physicsShirr: !!s.shirr,
    gatheredSkirt: !isTop && s.gatherRatio > 1.05 && !s.shirr,
    parts,
    own: {},
  };

  // --- stil-kaydi bayraklari. Her biri kalemin GERCEKTEN okudugu kosulda
  // kurulur; kosul disinda kurmak sessizce bir sey yapmaz ya da NaN uretir.
  if (s.boxy) st.boxy = true;                          // kalem satir 80, iki topolojide de okunur
  if (s.spaghettiStrap && !isBand) st.spaghettiStrap = true;  // omuz noktasi sart (NaN olculdu)
  if (s.fittedBand && isBand) st.fittedBand = true;    // kalem satir 97, sadece band dalinda
  if (isTop && s._peplum !== 'none') {
    st.peplum = s._peplum;                             // kalem satir 322: st.garment==='top'
    if (s.peplumRuffle) st.peplumRuffle = true;        // kalem satir 341, peplum blogunun icinde
  }
  if (!isTop && s._waistTie !== 'none') st.waistTie = s._waistTie;  // kalem satir 371

  // KALEM SINIRI 3 (olculdu 2026-08-01): ust'un hem'i p.topLength ENUM'undan
  // okunuyor -- var _tl={cropped:5,hip:16,tunic:30}[p.topLength||'hip'] (kalem
  // satir 157). Sayi kabul etmiyor; listede olmayan anahtar undefined -> NaN.
  // Yani surekli 'etek boyu' kadrani ust'te dogrudan calisamiyor. Kol boyunda
  // kurulan EMSAL izlenir: kadran en yakin kovaya yuvarlanir, boylece kadran
  // ust'te de yasar. DURUST NOT: ust'te boy 3 kademeli, surekli DEGIL --
  // kadranin okumasi bu yuzden ekranda kova adiyla gosteriliyor.
  if (isTop) st.topLength = nearestBucket(s.hemLevel, TOP_BUCKETS);
  STYLE['__live'] = st;

  const over = {};
  M.forEach(([k]) => { if (k !== 'size' && k !== 'hemLevel') over[k] = s[k]; });
  over.size = SIZES[s.size];

  // KALEM SINIRI (olculdu 2026-07-31):
  // puffSleeve() kol boyunu p.sleeveLen'den SUREKLI okuyor; plainSleeve() ise
  // p.sleeveLength enum'undan {cap:9, short:17, elbow:28, long:42}. Yani kapak
  // yuksekligi 0 iken "kol boyu" kadrani hicbir sey yapmiyordu -- uc farkli
  // sleeveLen ayni cizimi veriyordu. Kalem SALT-OKUNUR oldugu icin duzeltme
  // burada: enum'a en yakin kovaya yuvarlanir, boylece kadran her durumda
  // calisir. DURUST NOT: kapak 0'da kol boyu 4 kademeli, surekli degil.
  over.sleeveLength = nearestBucket(s.sleeveLen, SLEEVE_BUCKETS);

  over.length = '__live';
  over.ink = s._ink;
  over.inkAsym = !!s._asym;
  // kruvaze yonu: kalem p.wrapDir===2'de bindirmeyi aynaliyor (sol-uste-sag).
  // 1 Agu'ya kadar 1'e civiliydi; ikisi de gercek bir kruvaze.
  over.wrapDir = s._wrapDir === 'left' ? 2 : 1;
  return over;
}

// ---------------------------------------------------------------------------
// Yaka bandi — collarShape() ile ayni cizim dili (ayni genislik profili, ayni
// CF sabitleme, ayni smooth), tek fark: ilk segment degil TUM yaka yurunur.
// Kalemin disari verdigi fonksiyonlarla kurulur, kaleme dokunulmaz.
// ---------------------------------------------------------------------------
function bandLoop(p, half, k, gap) {
  // Tanjant segment ICINDEN alinir (koseyi merkezi farkla 45 dereceden kesmek
  // dis kenari bandin icinden gecirtiyordu). Segment sinirindaki kose bandin
  // IC kosesidir: iki ofset dogrusunun KESISIMI (gonye/miter noktasi) alinir —
  // kare yakada (kose_x - w, kose_y - w)'ye denk gelir; duz birlesimlerde iki
  // nokta zaten cakisir, kesisim ayni yere duser.
  const segs = half.slice(0, k.nSeg), N = 16;
  const outer = [], inner = [];
  segs.forEach((sg, si) => {
    for (let j = 0; j <= N; j++) {
      const u = (si * N + j) / (segs.length * N);
      const q = cubic(sg, j / N);
      const q0 = cubic(sg, Math.max(0, j - 1) / N), q2 = cubic(sg, Math.min(N, j + 1) / N);
      const dx = q2[0] - q0[0], dy = q2[1] - q0[1], d = Math.hypot(dx, dy) || 1;
      const w = p.collarWidth * S * (0.72 + 0.28 * Math.sin(Math.PI * u));
      inner.push([q[0], q[1], dx / d, dy / d, w]);   // tanjant + w miter icin saklanir
      outer.push([q[0] + dy / d * w, q[1] - dx / d * w]);
    }
  });
  for (let si = 1; si < segs.length; si++) {         // segment siniri = olasi kose
    const ia = si * (N + 1) - 1, ib = si * (N + 1);  // ayni kose noktasi, iki tanjant
    const [qx, qy, t1x, t1y, w] = inner[ia];
    const [, , t2x, t2y] = inner[ib];
    const P1 = [qx + t1y * w, qy - t1x * w], P2 = [qx + t2y * w, qy - t2x * w];
    const det = t1x * t2y - t1y * t2x;
    if (Math.abs(det) > 1e-6) {
      const a = ((P2[0] - P1[0]) * t2y - (P2[1] - P1[1]) * t2x) / det;
      const Mx = P1[0] + a * t1x, My = P1[1] + a * t1y;
      outer[ia] = [Mx, My]; outer[ib] = [Mx, My];
    }
  }
  const innerPts = inner.map((q) => [q[0], q[1]]);
  outer[0] = [k.cx + gap, outer[0][1]];
  innerPts[0] = [k.cx + gap, innerPts[0][1]];
  const loop = outer.concat(innerPts.slice().reverse());
  loop.push(loop[0]);
  return smooth(loop);
}

function collarOverlay(over) {
  const p = Object.assign(defaults('__live'), over);
  let o = '';
  [[240, false], [700, true]].forEach(([cx, isBack]) => {
    const b = buildHalf(p, cx, isBack, rng(p.seed * 131 + (isBack ? 977 : 13)));
    const k = b.k;
    if (!k.nSeg) return;                      // bandeau/aski govdesinde yaka egrisi yok
    const half = enforceC1(b.g.slice(), !k.pointed);
    const d = toPath(bandLoop(p, half, k, isBack ? 0 : p.collarGap * S));
    o += '<path class="piece" d="' + d + '"/>' +
         '<g transform="translate(' + (2 * cx) + ',0) scale(-1,1)"><path class="piece" d="' + d + '"/></g>';
  });
  return o;
}

// ---------------------------------------------------------------------------
// KADRAJ — kalemin viewBox'i "0 0 940 680" SABIT, ama cizim disari tasabiliyor.
// OLCULDU (2026-08-01, cizim verisinden sinir kutusu):
//   spagetti aski              y = -16.4  (kalem askiyi k.y0-9*S'ten baslatiyor)
//   en uzun klos maxi (112/2.9) y = 868.7  (viewBox 680'de bitiyor)
// Yani tezgahta aski ucu ve etek eteginin son 190px'i KESILIYORDU. Kalem
// SALT-OKUNUR; duzeltme burada: cizimin gercek dikey siniri olculur, viewBox
// ona gore yeniden yazilir. Tek bir cizgi verisi degismez, sadece cerceve.
// X'e dokunulmaz (0..940): on ve arka figur yerinde kalsin, kadran cekilirken
// yatay ziplama olmasin.
// ---------------------------------------------------------------------------
function fitFrame(svg) {
  let y0 = 1e9, y1 = -1e9, m;
  const dRe = /\sd="([^"]+)"/g;
  while ((m = dRe.exec(svg))) {
    const ns = m[1].match(/-?\d+(?:\.\d+)?/g);
    if (!ns) continue;
    for (let i = 1; i < ns.length; i += 2) {      // kalem yalniz M/L/C/Q/Z basar: sayilar cift cift koordinat
      const y = parseFloat(ns[i]);
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  const tRe = /<text[^>]*\sy="(-?\d+(?:\.\d+)?)"/g;
  while ((m = tRe.exec(svg))) { const y = parseFloat(m[1]); if (y > y1) y1 = y; }
  if (y0 > y1) return svg;
  const top = y0 - 14, h = (y1 + 16) - top;
  return svg.replace('viewBox="0 0 940 680"', `viewBox="0 ${top.toFixed(1)} 940 ${h.toFixed(1)}"`);
}

// renderStyle() kalemin kendi giris kapisi: modul-ici P'yi kurar, sonra cizer.
// render()'i dogrudan cagirmak parts() okumasini bozar (P kurulmamis olur).
// DAMLA EMRI (1 Agu 14:20, birebir): "o aptal cizgileri toplama mi prenses
// dikis mi kalem mi ne bok dediysen KALDIR". Bir kere azaltip gecistirdim,
// emir bu degildi. Artik cizimde tek bir dekoratif kirisik/golge cizgisi
// kalmiyor: ne bizim kat katmanimiz (flFoldOverlay artik hic cagrilmiyor),
// ne de kalemin kendi 'ink' vurusları (drape fold'lari, buzgu tikleri,
// prenses/gore izleri). Geriye giysinin kendisi kaliyor: silüet, parca
// konturu, dikis ve kat cizgisi.
const INK_PATH = /<path class="ink"[^>]*\/>/g;
const EMPTY_G = /<g transform="[^"]*"><\/g>/g;

function draw(s) {
  const over = compile(s);
  let svg = renderStyle('__live', over).replace(INK_PATH, '').replace(EMPTY_G, '');
  if (s.collar) svg = svg.replace('</svg>', collarOverlay(over) + '</svg>');
  return fitFrame(svg);
}
