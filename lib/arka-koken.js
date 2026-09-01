// arka-koken.js — THE BACK OF THE GARMENT AND WHERE IT CAME FROM (F3-arka).
//
// DAMLA'NIN CÜMLESİ (edge case, kendi sözü): arka fotoğraf VARSA okunur ve
// tasarlanır. SADECE ön varsa sistem arkayı UYDURUR ve uydurduğunu İLAN eder.
// Uydurulan arka: asla dekolte, asla süs, asla asimetri — en sade dikilebilir
// arka: düz sırt, boyun ön yakanın aynası, geçmiyorsa fermuar (motorun mevcut
// gizli-CB-fermuar kuralı, F5'in fermuar kuralı gelene kadar). Kullanıcı
// isterse arkayı elle/promptla değiştirir, etiket `soruldu` olur; ama sormak
// varsayılan değil, akış DURMAZ.
//
// NEDEN BURADA, create.js'İN İÇİNDE DEĞİL. İki sebep:
//   1. create.js DOM'a bağlı; bu mantık saf kalınca engine/tests/
//      arka_koken_check.mjs onu node'da, tarayıcısız, AYNEN koşabiliyor.
//   2. Arka alan listesi bir KELİME MENÜSÜ olarak yazılmıyor (yasak): liste
//      spec'in kendi eksen adlarından REGEX ile türetiliyor. Yarın motora yeni
//      bir arka ekseni gelirse bu dosyaya kelime eklenmez, kural onu kendisi
//      yakalar.
//
// ETİKETLER provenance.js'in kendi sözlüğü: `gorulen` (arka fotoğraftan
// okundu), `uydurma` (arka fotoğraf yok, sistem uydurdu ve İLAN ediyor),
// `soruldu` (kullanıcının kendi eli/promptu — dokunulmaz). `uydurma`
// ILAN_EDILEN listesinde olduğu için ekrandaki köken cümlesine, SVG köküne
// (damgala -> data-koken-alanlar) ve A4 PDF kapağına başka hiçbir kod
// yazılmadan kendiliğinden düşer.

/** Spec eksenleri içinden arkayı anlatanlar. Menü değil, türetme. */
export function arkaAlanlari(alanlar) {
  return (alanlar || []).filter((a) => /back/i.test(a)).sort();
}

/**
 * Arka köken damgası. `koken` kaydını ve gerekirse spec'i YERİNDE günceller.
 *
 *   arkaFotoVar=true  -> arka OKUNDU: her arka alan `gorulen/gorunur`.
 *                        ('none' okumak da bir okumadır — göz arkaya baktı ve
 *                        sade bir sırt gördü.)
 *   arkaFotoVar=false -> arka UYDURULDU: her arka alan en sade dikilebilir
 *                        değere (`sade`) çekilir ve `uydurma/gorunmez` damgası
 *                        yer; ön fotoğraftan "görüldü" sanılan bir arka alan da
 *                        buraya düşer, çünkü ön fotoğraf arkayı GÖREMEZ.
 *
 * `soruldu` HER İKİ yönde de dokunulmazdır: kullanıcının açık sözü fotoğrafın
 * da uydurmanın da üstündedir (F1 madde 3 ile aynı öncelik).
 *
 * Dönen dizi: bu çağrının `uydurma` damgaladığı alan adları (ekrana basılsın diye).
 */
export function arkaDamgala(koken, spec, alanlar, arkaFotoVar, isaretle, sade = 'none') {
  const uydurulan = [];
  for (const alan of arkaAlanlari(alanlar)) {
    const e = koken && koken[alan];
    if (e && e.kaynak === 'soruldu') continue;
    if (arkaFotoVar) {
      isaretle(koken, alan, 'gorulen', 'gorunur', 'arka fotoğraftan okundu');
    } else {
      spec[alan] = sade;
      isaretle(koken, alan, 'uydurma', 'gorunmez',
        'arka fotoğraf yok — en sade dikilebilir arka uyduruldu: düz sırt, boyun ön yakanın aynası, geçmiyorsa fermuar');
      uydurulan.push(alan);
    }
  }
  return uydurulan;
}

/**
 * Arkanın TEK KELİMELİK durumu — flat'in BACK görünümüne basılan damga.
 * `uydurma` her şeyi ezer (tek uydurulmuş alan bile arkayı uydurma yapar);
 * sonra `gorulen`, sonra `soruldu`; damgasız kalan back alanı `cikarildi`
 * (host default). Kayıtta HİÇ arka alanı yoksa null döner: arka hakkında hiçbir
 * şey söylemeyen bir kayıttan "görüldü/uyduruldu/türetildi" iddiası üretmek,
 * damganın öldürmeye geldiği sessiz uydurmadır (indir_check bunu ölçer:
 * damga çizime tek koordinat, tek fazla iddia eklemez).
 */
export function arkaDurumu(koken, alanlar) {
  let gorulen = false, soruldu = false, var_ = false;
  for (const alan of arkaAlanlari(alanlar)) {
    const e = koken && koken[alan];
    if (!e) continue;
    var_ = true;
    if (e.kaynak === 'uydurma') return 'uydurma';
    if (e.kaynak === 'gorulen') gorulen = true;
    else if (e.kaynak === 'soruldu') soruldu = true;
  }
  if (!var_) return null;
  return gorulen ? 'gorulen' : (soruldu ? 'soruldu' : 'cikarildi');
}

/**
 * Arka fotoğrafın vision okumasını arka eksen değerlerine indirger. Eksen
 * adları burada durur (create.js'e kelime menüsü sızmasın); pick fonksiyonları
 * ve host kapıları ÇAĞIRANIN kendi fonksiyonlarıdır — ürün yolu ile kapı aynı
 * mantığı koşar. Dönen liste: [{ alan, deger, hostable }], konakSet'e birebir.
 */
export function arkaOkumasi(seen, spec, k) {
  const acik = k.pickBackOpening(seen);
  const bag = k.pickLaceUpBack(seen);
  const det = k.pickBackDetail(seen);
  const slit = k.pickHemSlit(seen);
  const skirtDegil = !k.isSkirt(spec);
  return [
    { alan: 'backOpening', deger: acik, hostable: true },
    { alan: 'laceUpBack', deger: bag && 'corset', hostable: skirtDegil },
    { alan: 'backDetail', deger: det, hostable: skirtDegil },
    { alan: 'backSlit', deger: slit,
      hostable: !k.isTop(spec) && (spec.skirtStyle === 'straight' || spec.skirtStyle === 'aLine') },
  ];
}
