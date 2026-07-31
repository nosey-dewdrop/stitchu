// ============================================================================
// MALZEME KATMANI — 2026-07-31
//
// Tez: kalip alanlari yemek degil MALZEME olmali. engine/vocab.json bugun 37
// kategorik alan tutuyor (neckline: crew|scoop|vNeck|... , collarType:
// peterPan|shirt|crescent|...). Bunlar tabak isimleri. Asagidaki liste
// malzemedir: her biri SUREKLI bir sayidir, iki tarif arasi bir yer vardir.
//
// KANITLANAN (olcum: curve-research/03-band-ingredients.py, kaynak
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

// --- 9 malzeme ailesi. Sira ekranda gorunen sira.
const FAMILIES = [
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
  ['goreCount', 'topoloji', 'panel sayisi', 2, 12, 2, 6, 'Etegin kac dilimden kuruldugu.'],
  ['tieLength', 'topoloji', 'bag boyu', 8, 34, 1, 22, ''],

  ['foldCount', 'kalem', 'kat sayisi', 2, 18, 1, 10, ''],
  ['drape', 'kalem', 'dokum', 0, 1.6, 0.05, 1, ''],
  ['hemWave', 'kalem', 'etek dalgasi', 0, 2.5, 0.05, 1, ''],
  ['hemDip', 'kalem', 'etek sarkmasi', 0, 8, 0.2, 2, ''],
  ['seed', 'kalem', 'kalem tohumu', 1, 40, 1, 7, 'Ayni tohum hep ayni cizim. Rastgelelik yok.'],
];

// --- kenar rolu + topoloji: acik/kapali. Bunlar da malzeme, sadece surekli degil.
const FLAGS = [
  ['sleeve', 'topoloji', 'kol var', true, 'Kol paneli var mi.'],
  ['collar', 'topoloji', 'yaka bandi', false, 'Boyun kenarina dikilen bant.'],
  ['straps', 'topoloji', 'aski', false, ''],
  ['princessSeam', 'topoloji', 'prenses dikis', true, 'Pensi dikise gomer. Pens payi ayni, YOLU farkli.'],
  ['backSeam', 'topoloji', 'arka orta dikis', true, ''],
  ['gorePanels', 'topoloji', 'dilimli etek', false, ''],
  ['wrapSurplice', 'topoloji', 'kruvaze on', false, 'On tek panel degil, iki bindirme panel.'],
  ['tie', 'topoloji', 'boyun bagi', false, ''],
  ['tieBack', 'topoloji', 'arka bel bagi', false, ''],
  ['shirr', 'kenar', 'buzgulu kenar', false, 'Kenar duz dikilmiyor, buzuluyor.'],
  ['casing', 'kenar', 'tunel / bagcik', false, ''],
  ['laceNeck', 'kenar', 'yaka biyesi', false, ''],
  ['laceSleeve', 'kenar', 'kol biyesi', false, ''],
  ['laceHem', 'kenar', 'etek biyesi', false, ''],
];

// --- yaka egrisinin SEKLI. Kalemin gercekten ayrik oldugu tek yer.
// DURUST NOT: bu bir egri-sekli parametresidir, olcumde de boyle cikti
// (bkz. 03-band-ingredients.py: her kenar bir egrilik profili istiyor).
// Kalem SALT-OKUNUR oldugu icin bugun 4 aile olarak duruyor.
const NECKSHAPES = [
  ['round', 'yuvarlak'],
  ['v', 'V'],
  ['square', 'kare'],
  ['sweetheart', 'kalp'],
];

const SIZES = ['EU34', 'EU36', 'EU38', 'EU40', 'EU42', 'EU44', 'EU46', 'EU48'];
const INKS = [['minimal', 'az'], ['orta', 'orta'], ['dolu', 'dolu']];

function defaultState() {
  const s = { _neckShape: 'round', _ink: 'orta', _asym: true };
  M.forEach(([k, , , , , , d]) => { s[k] = d; });
  FLAGS.forEach(([k, , , d]) => { s[k] = d; });
  return s;
}

// ---------------------------------------------------------------------------
// compile(): malzeme degerleri -> kalemin bekledigi stil KAYDI.
// Kalem dosyasina dokunulmaz; disari verdigi STYLE ve LEN nesnelerine
// calisma aninda tek bir kayit eklenir.
// ---------------------------------------------------------------------------
function compile(s) {
  LEN['__live'] = s.hemLevel;                 // surekli etek boyu (mini/midi/maxi enum'u yerine)

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

  STYLE['__live'] = {
    label: 'atolye',
    garment: 'dress',                         // surekli hem yolu (top dali topLength enum'una kilitli)
    top: s.straps ? 'band' : 'shoulder',
    neckline: s._neckShape === 'round' ? undefined : s._neckShape,
    roundNeck: s._neckShape === 'round',
    length: '__live',
    physicsShirr: !!s.shirr,
    gatheredSkirt: s.gatherRatio > 1.05 && !s.shirr,
    parts,
    own: {},
  };

  const over = {};
  M.forEach(([k]) => { if (k !== 'size' && k !== 'hemLevel') over[k] = s[k]; });
  over.size = SIZES[s.size];

  // KALEM SINIRI (olculdu 2026-07-31, curve-research grid'i):
  // puffSleeve() kol boyunu p.sleeveLen'den SUREKLI okuyor; plainSleeve() ise
  // p.sleeveLength enum'undan {cap:9, short:17, elbow:28, long:42}. Yani kapak
  // yuksekligi 0 iken "kol boyu" kadrani hicbir sey yapmiyordu -- uc farkli
  // sleeveLen ayni cizimi veriyordu. Kalem SALT-OKUNUR oldugu icin duzeltme
  // burada: enum'a en yakin kovaya yuvarlanir, boylece kadran her durumda
  // calisir. DURUST NOT: kapak 0'da kol boyu 4 kademeli, surekli degil.
  const BUCKETS = [['cap', 9], ['short', 17], ['elbow', 28], ['long', 42]];
  over.sleeveLength = BUCKETS.reduce((a, b) =>
    Math.abs(b[1] - s.sleeveLen) < Math.abs(a[1] - s.sleeveLen) ? b : a)[0];

  over.length = '__live';
  over.ink = s._ink;
  over.inkAsym = !!s._asym;
  over.laceWidth = 1.4;
  over.laceScallops = 16;
  over.wrapDir = 1;
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

// renderStyle() kalemin kendi giris kapisi: modul-ici P'yi kurar, sonra cizer.
// render()'i dogrudan cagirmak parts() okumasini bozar (P kurulmamis olur).
function draw(s) {
  const over = compile(s);
  let svg = renderStyle('__live', over);
  if (s.collar) svg = svg.replace('</svg>', collarOverlay(over) + '</svg>');
  return svg;
}
