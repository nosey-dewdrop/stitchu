// ============================================================================
// SOZLUK — cumle -> malzeme degeri.  2026-07-31
//
// LLM YOK. Kural tabanli, deterministik, cevrimdisi, aninda. Bir cumlenin
// verdigi bilgi zaten cok az: "puf kollu elbise" 45 sayidan 2-3'unu soyluyor.
// O 2-3'u bulmak icin model cagirmaya gerek yok; kalan 42'yi zaten model de
// uyduramaz, onlar varsayilan profilden gelir.
//
// Her kural bir TABAK adini bir MALZEME degerine cevirir. Tabak adi burada
// kalir, motora gecmez:
//    "puf kol"      -> kapak yuksekligi 2.4     (ayri bir kol turu degil)
//    "balon kol"    -> kapak 2.0 + kol agzi buzgusu 1.3
//    "klos etek"    -> etek bollugu 2.55        (ayri bir etek turu degil)
//    "hakim yaka"   -> bant derinligi 2.2       (yatan kisim yok)
//    "bebe yaka"    -> bant derinligi 4.6       (yatarak durur)
// Iki tarif arasindaki her yer de gecerli bir giysidir; liste bunu yasaklardi.
// ============================================================================

const RULES = [
  // ---- siluet / boy
  [/\b(crop|kisa\s*ust|krop)/i, { hemLevel: 16, waistNip: 0.10 }],
  [/\b(mini)\b/i, { hemLevel: 42 }],
  [/\b(midi)\b/i, { hemLevel: 74 }],
  [/\b(maxi|uzun\s*elbise|maksi)/i, { hemLevel: 105 }],
  [/\b(diz\s*(alti|ustu)|knee)/i, { hemLevel: 58 }],
  [/\b(tunik|tunic)/i, { hemLevel: 34 }],

  // ---- etek bollugu (tek sayi, ayri tur degil)
  [/\b(klos|circle\s*skirt|tam\s*klos)/i, { skirtFull: 2.55, skirtCurve: 0.8 }],
  [/\b(a\s*-?\s*line|a\s*kesim|kloş)/i, { skirtFull: 1.95, skirtCurve: 0.6 }],
  [/\b(kalem|duz\s*etek|straight|pencil)/i, { skirtFull: 1.02, skirtCurve: 0.1, waistNip: 0.22 }],
  [/\b(dilimli|gore|panelli)/i, { gorePanels: true, skirtFull: 2.0 }],
  [/\b(buzgulu\s*etek|dirndl|gathered\s*skirt)/i, { skirtFull: 2.2, gatherRatio: 2.2 }],
  [/\b(bol|salas|oversize|kutu|boxy)/i, { waistNip: 0.02, skirtFull: 1.15 }],
  [/\b(oturan|fitted|vucuda|dar)/i, { waistNip: 0.28, skirtFull: 1.15 }],

  // ---- yaka: seviye + cevre + egri ailesi
  [/\b(v\s*yaka|v-?neck)/i, { _neckShape: 'v', neckDepth: 16 }],
  [/\bderin\s*v/i, { _neckShape: 'v', neckDepth: 24 }],
  [/\b(kare\s*yaka|square\s*neck)/i, { _neckShape: 'square', neckDepth: 13, neckWidth: 1.22 }],
  [/\b(kalp\s*yaka|sweetheart)/i, { _neckShape: 'sweetheart', neckDepth: 14 }],
  [/\b(kayik\s*yaka|bateau|boat\s*neck)/i, { _neckShape: 'round', neckDepth: 6, neckWidth: 1.55 }],
  [/\b(bisiklet\s*yaka|crew)/i, { _neckShape: 'round', neckDepth: 6.5, neckWidth: 0.98 }],
  [/\b(kasik\s*yaka|scoop)/i, { _neckShape: 'round', neckDepth: 15, neckWidth: 1.2 }],
  [/\bderin\s*(yaka|dekolte)/i, { neckDepth: 22 }],
  [/\b(kapali\s*yaka|yuksek\s*yaka)/i, { neckDepth: 4, neckWidth: 0.92 }],
  [/\b(sirt\s*dekolte|acik\s*sirt|open\s*back)/i, { neckDepthBack: 15 }],

  // ---- bant ailesi: yaka tipi diye bir sey yok, derinlik var
  [/\b(hakim\s*yaka|mandarin|dik\s*yaka|stand\s*collar)/i, { collar: true, collarWidth: 2.2, collarGap: 0.2 }],
  [/\b(bebe\s*yaka|peter\s*pan)/i, { collar: true, collarWidth: 4.6, collarGap: 0.5 }],
  [/\b(gomlek\s*yaka|shirt\s*collar)/i, { collar: true, collarWidth: 5.6, collarGap: 0.1 }],
  [/\b(genis\s*yaka|sal\s*yaka|shawl)/i, { collar: true, collarWidth: 8.0, collarGap: 0.8 }],
  [/\byakasiz|kolsuz\s*yakasiz/i, { collar: false }],

  // ---- kol: kapak yuksekligi + buzgu, ayri tur degil
  [/\b(kolsuz|sleeveless|askili)/i, { sleeve: false }],
  [/\b(puf\s*kol|puff\s*sleeve|karpuz\s*kol)/i, { sleeve: true, capPuff: 2.4, sleeveLen: 12 }],
  [/\b(balon\s*kol|balloon|bishop)/i, { sleeve: true, capPuff: 2.0, cuffGather: 1.3, sleeveLen: 22 }],
  [/\b(duz\s*kol|set-?in|klasik\s*kol)/i, { sleeve: true, capPuff: 0, sleeveLen: 17 }],
  [/\b(kisa\s*kol|short\s*sleeve)/i, { sleeve: true, sleeveLen: 12 }],
  [/\b(uzun\s*kol|long\s*sleeve)/i, { sleeve: true, sleeveLen: 42 }],
  [/\b(dirsek|elbow)/i, { sleeve: true, sleeveLen: 28 }],
  [/\b(genis\s*kol|wide\s*sleeve)/i, { sleeveWidth: 11 }],

  // ---- aski
  [/\b(ince\s*aski|spagetti|spaghetti)/i, { straps: true, sleeve: false, strapWidth: 1.4 }],
  [/\b(kalin\s*aski|wide\s*strap)/i, { straps: true, sleeve: false, strapWidth: 4.0 }],
  [/\b(straplez|bandeau|straplez)/i, { straps: false, sleeve: false }],

  // ---- kenar rolu / bolluk
  [/\b(buzgu|buzgulu|shirr|gathered|shirred)/i, { shirr: true, gatherRatio: 2.2 }],
  [/\b(firfir|ruffle|volan|frill)/i, { ruffle: 0.9 }],
  [/\b(bagcik|tunel|drawstring|ip)/i, { casing: true }],
  [/\b(dantel|biye|lace|trim)/i, { laceNeck: true, laceHem: true }],
  [/\b(kruvaze|wrap|anvelop|surplice)/i, { wrapSurplice: true }],
  [/\b(kusak|kemer|belted|bag)/i, { tieBack: true }],
  [/\b(bel\s*bagi|boyun\s*bagi|fiyonk)/i, { tie: true }],

  // ---- dikis mimarisi
  [/\b(prenses\s*dikis|princess)/i, { princessSeam: true }],
  [/\b(pensli|dart)/i, { princessSeam: false }],
  [/\b(empire|yuksek\s*bel)/i, { yokeDrop: 7 }],
  [/\b(dusuk\s*bel|drop\s*waist)/i, { yokeDrop: 22 }],

  // ---- kalem
  [/\b(sade\s*ciz|az\s*cizgi|minimal)/i, { _ink: 'minimal' }],
  [/\b(detayli\s*ciz|dolu\s*ciz)/i, { _ink: 'dolu' }],

  // ---- beden
  [/\b(34|xs)\b/i, { size: 0 }], [/\b36\b/, { size: 1 }], [/\b38\b/, { size: 2 }],
  [/\b40\b/, { size: 3 }], [/\b42\b/, { size: 4 }], [/\b44\b/, { size: 5 }],
  [/\b46\b/, { size: 6 }], [/\b48\b/, { size: 7 }],
];

// Turkce aksan + yaygin yazim varyantlarini duzler; kural tarafi hep sade harf.
function fold(t) {
  return t.toLowerCase()
    .replace(/ı/g, 'i').replace(/İ/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, ' ');
}

// -> { state, touched:Set, matched:[etiket] }
function readSentence(text, base) {
  const t = fold(text);
  const s = Object.assign({}, base);
  const touched = new Set();
  const matched = [];
  for (const [re, set] of RULES) {
    const m = t.match(re);
    if (!m) continue;
    matched.push(m[0].trim());
    for (const k in set) { s[k] = set[k]; touched.add(k); }
  }
  // "elbise" / "ust" / "etek" sadece hem seviyesini belirler, ayri tur degil
  if (!touched.has('hemLevel')) {
    if (/\b(ust|bluz|top|gomlek|tisort)\b/.test(t)) { s.hemLevel = 22; touched.add('hemLevel'); }
    else if (/\betek\b/.test(t) && !/\belbise\b/.test(t)) { s.hemLevel = 60; touched.add('hemLevel'); }
  }
  return { state: s, touched, matched };
}
