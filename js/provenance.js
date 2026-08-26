// provenance.js — KÖKEN ETİKETİ. Her alan nereden geldiğini TAŞIR.
//
// NEDEN VAR (F0, 2026-08-26). Hakem ölçtü: hedef koşusunda 120 alanın 70'i
// (%58.3) fotoğraftan değil host default'undan geliyor, dördü ilan edilmemiş
// uydurma — ve sevk edilen indirme yolunda bunu söyleyen SIFIR satır vardı:
//
//   grep -rn "cikarildi|inferred|defaulted" web/js/create.js web/js/download.js
//   -> 0 satır   (hakem, 2026-08-26)
//
// Yani kullanıcı eve bir kalıp + bir flat götürüyordu ama götürdüğü şeyin
// yarısından fazlası onun fotoğrafında hiç görülmemişti, ve hiçbir yüzey bunu
// ona söylemiyordu. KOŞU v7 §0B'nin yasası tam olarak budur: motor her alanı
// doldurur, boş çıktı yoktur — ama her alan KAYNAĞINI taşır. Cezalandırılan
// uydurmak değil, SESSİZCE uydurmaktır (§3.6 H3).
//
// BU BİR RAPOR DEĞİL. Etiket spec'in kendisinde durur, inen dosyanın İÇİNE
// yazılır (flat SVG kökü + A4 PDF kapağı) ve sonuç ekranına ADIYLA basılır.
// Kullanıcı dosyayı internetsiz açtığında da görür.
//
// İKİ EKSEN, TEK KOVA DEĞİL. `cikarildi` ileride ikiye bölünecek (§DURUM,
// Damla'nın 26 Ağu düzeltmesi): H10a = fotoğrafta GÖRÜNMESİ MÜMKÜN OLMAYAN
// alan (arka, iç, örtülü), H10b = GÖRÜNEN ama alınamayan alan. Cırcır yalnız
// H10b'ye bakar. Ayrıştırma F2'nin işidir, F0'ın DEĞİL — ama şema onu
// sonradan mümkün kılmak zorunda, yoksa F2 tek kovayı elle sökmek zorunda
// kalır. O yüzden her kaydın İKİNCİ bir ekseni var: `gorunurluk`.
// F0 hepsine `bilinmiyor` yazar ve hiçbir şeyi bölmez.

/** §0B'nin beş etiketi + `uydurma` (sicilde karşılığı olmayan değer). */
export const KAYNAKLAR = Object.freeze([
  'gorulen',    // fotoğrafta var, okundu
  'soruldu',    // kullanıcıya soruldu / kullanıcı eliyle seçti
  'cikarildi',  // fotoğrafta yok, kuraldan/default'tan türetildi
  'zorunlu',    // dikilebilirlik gereği kondu, tercih değil
  'belirsiz',   // görüldü ama güvenle okunamadı; en sade yorum seçildi
  'uydurma',    // sözlükte karşılığı yok
]);

/** İkinci eksen. F2 `cikarildi`'yı bunun üstünden H10a/H10b'ye böler. */
export const GORUNURLUKLER = Object.freeze(['gorunur', 'gorunmez', 'bilinmiyor']);

/** Kullanıcıya söylenmesi ZORUNLU olan kaynaklar: uydurmanın sessiz hâli yok. */
export const ILAN_EDILEN = Object.freeze(['cikarildi', 'belirsiz', 'uydurma']);

/**
 * Boş bir köken kaydı: verilen alanların hepsi başlangıçta `cikarildi`.
 * Doğru başlangıç budur — bir alan aksi KANITLANANA kadar host default'undan
 * gelmiştir. Ters başlangıç (hepsi `gorulen`) tam olarak bugün cezalandırılan
 * sessiz uydurmanın kendisidir.
 */
export function yeniKoken(alanlar, kaynak = 'cikarildi', gorunurluk = 'bilinmiyor') {
  const koken = {};
  for (const alan of alanlar) koken[alan] = { kaynak, gorunurluk, not: '' };
  return koken;
}

/** Tek alanı işaretle. Bilinmeyen etiket YUTULMAZ, atılır (RULES invariant 1). */
export function isaretle(koken, alan, kaynak, gorunurluk = 'bilinmiyor', not = '') {
  if (!KAYNAKLAR.includes(kaynak)) {
    throw new Error(`köken: '${kaynak}' bir kaynak etiketi değil (${KAYNAKLAR.join('|')})`);
  }
  if (!GORUNURLUKLER.includes(gorunurluk)) {
    throw new Error(`köken: '${gorunurluk}' bir görünürlük değeri değil (${GORUNURLUKLER.join('|')})`);
  }
  koken[alan] = { kaynak, gorunurluk, not: String(not || '') };
  return koken;
}

/** Belirli bir kaynağa sahip alan adları, alfabetik (dosyaya yazılan liste). */
export function alanlar(koken, kaynak) {
  return Object.keys(koken || {}).filter((a) => koken[a] && koken[a].kaynak === kaynak).sort();
}

/** Kullanıcıya ilan edilmesi zorunlu olan alanların adları, alfabetik. */
export function ilanEdilecek(koken) {
  return Object.keys(koken || {})
    .filter((a) => koken[a] && ILAN_EDILEN.includes(koken[a].kaynak)).sort();
}

/** Sayım: her etiketten kaç alan. `toplam` kaydın kendi alan sayısıdır. */
export function ozet(koken) {
  const sayim = {};
  for (const k of KAYNAKLAR) sayim[k] = 0;
  let toplam = 0;
  for (const a of Object.keys(koken || {})) {
    const e = koken[a];
    if (!e || !KAYNAKLAR.includes(e.kaynak)) continue;
    sayim[e.kaynak]++; toplam++;
  }
  return { toplam, sayim };
}

/**
 * KAYDIN KENDİSİ DOĞRU MU. Bu, kapının kırmızı yanabilmesini sağlayan yerdir:
 * spec'te olup kayıtta olmayan bir alan = sessiz alan; kayıtta olup spec'te
 * olmayan bir alan = hayalet ilan; tanınmayan etiket = yutturma.
 * Dönen dizi BOŞSA kayıt geçerlidir.
 */
export function dogrula(koken, specAlanlari) {
  const ihlal = [];
  if (!koken || typeof koken !== 'object') return ['köken kaydı yok'];
  const kayitli = new Set(Object.keys(koken));
  for (const alan of specAlanlari) {
    if (!kayitli.has(alan)) ihlal.push(`'${alan}' spec'te var, kökeni ilan edilmemiş`);
  }
  const spec = new Set(specAlanlari);
  for (const alan of kayitli) {
    if (!spec.has(alan)) ihlal.push(`'${alan}' köken kaydında var, spec'te yok`);
    const e = koken[alan];
    if (!e || !KAYNAKLAR.includes(e.kaynak)) ihlal.push(`'${alan}' tanınmayan kaynak etiketi: ${e && e.kaynak}`);
    else if (!GORUNURLUKLER.includes(e.gorunurluk)) ihlal.push(`'${alan}' tanınmayan görünürlük: ${e.gorunurluk}`);
  }
  return ihlal;
}

/** Kullanıcının okuyacağı tek cümle. Sayı ve adlar aynı kayıttan gelir. */
export function kokenCumlesi(koken, tr = false) {
  const liste = ilanEdilecek(koken);
  const o = ozet(koken);
  if (!liste.length) {
    return tr
      ? `${o.toplam} alanın hepsi senin fotoğrafından ya da senin seçiminden geldi.`
      : `all ${o.toplam} fields came from your photo or your own choices.`;
  }
  return tr
    ? `${o.toplam} alanın ${liste.length}'i fotoğrafında görülmedi, kuraldan türetildi: ${liste.join(' · ')}`
    : `${liste.length} of ${o.toplam} fields were not visible in your photo and were derived from rules: ${liste.join(' · ')}`;
}

/**
 * SVG kökü için öznitelikler. Ad listesi ve sayı AYNI kayıttan türer, o yüzden
 * biri boşaltılıp diğeri bırakılamaz — kapı ikisini karşılaştırıyor.
 */
export function kokenAttrs(koken) {
  const liste = ilanEdilecek(koken);
  const o = ozet(koken);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return ` data-koken-toplam="${o.toplam}" data-koken-cikarildi="${liste.length}"` +
    ` data-koken-alanlar="${esc(liste.join(' '))}"`;
}

/**
 * Köken etiketini bir SVG belgesinin KÖKÜNE basar. Kalem (flat-core.js) hiç
 * değişmez — style_check o kalemi bayt bayt pine diff'liyor ve bu faz o pini
 * kımıldatmaz; damga sevk edilen indirme yolunda vurulur.
 * Kayıt boş/bozuksa DOSYA YAZILMAZ: köken etiketi olmayan bir flat, bu fazın
 * öldürmeye geldiği sessiz dosyanın ta kendisidir.
 */
export function damgala(svg, koken, specAlanlari) {
  const ihlal = dogrula(koken, specAlanlari);
  if (ihlal.length) throw new Error(`köken damgası basılamadı: ${ihlal.slice(0, 3).join('; ')}`);
  const i = svg.indexOf('>');
  if (!svg.startsWith('<svg') || i === -1) throw new Error('köken damgası: SVG kökü bulunamadı');
  return svg.slice(0, i) + kokenAttrs(koken) + svg.slice(i);
}
