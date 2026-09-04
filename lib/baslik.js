// baslik.js — SONUC BASLIGI, ALICININ KENDI CUMLESINDEN.
//
// NEDEN VAR (T4-hakem, kusur 5). Bagimsiz hakem uc vaka olctu ve ucunde de
// baslik alicinin yazdigi cumleyle CELISTI:
//
//   "a long sleeve maxi wrap dress with a tie at the waist, knit fabric,
//    deep v neckline"        -> baslik "A-line straight-sleeve dress"
//   "a top with a zipper at the front and a peter pan collar"
//                            -> baslik "Cropped top"
//   "fitted gathered midi dress with puff sleeves"
//                            -> baslik "A-line puff-sleeve dress"
//
// Okuma satiri her uc vakada da DOGRUYDU (wrapFront: surplice, skirtLength:
// maxi, exposedZip: centerFront, collarType: peterPan hepsi okunmustu). Yalan
// yalnizca baslikta.
//
// KOK SEBEP, OLCULDU (motor kaynagi): baslik `engine/src/garment.cpp`'de
// `title(spec.skirtStyle) + sleeveWord + "dress"` olarak kuruluyor — yani
// SADECE iki eksenden. O iki eksen alici tarafindan SECILMEMISSE motorun kendi
// varsayilani (aLine / plain) basiliyor, ve alicinin ACIKCA yazdigi
// wrapFront / skirtLength / exposedZip / collarType / topLength eksenleri
// basliga hic girmiyor. Yani baslik, alicinin secmedigi bir seyi ILAN ediyor
// ve sectigi seyi GIZLIYOR.
//
// YASA. Bir baslik yalnizca KAYNAGI OLAN kelimeyi tasiyabilir. Kaynak, koken
// kaydinin kendisidir (provenance.js): `soruldu` = alici yazdi/secti,
// `gorulen` = fotografta okundu. `cikarildi` (host default) ve `zorunlu`
// (dikilebilirlik) BASLIGA GIREMEZ — ilan edilmesi gereken sey zaten koken
// satirinda ilan ediliyor, baslikta bir iddiaya donusemez.
//
// KELIME DE UYDURULMAZ. Oncelik: (1) alicinin kendi kelimesi (prompt
// okumasindaki `kelime`), (2) menunun kendi etiketi (create.js SPEC_GROUPS),
// (3) eksen degerinin insan okunur hali. Sira da alicinin kendi cumlesinin
// sirasi: giysi adindan ONCE soyledikleri sifat olarak onune gecer, SONRA
// soyledikleri "with ..." olarak arkasina.
//
// Saf modul, DOM yok: kapi (baslik_dogru_check) bunu node'da aynen kosar.

/** Bir eksen degerinin insan okunur son carecisi: camelCase -> "camel case". */
function insanlastir(v) {
  return String(v).replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').toLowerCase().trim();
}

/** Basligi tasimayan degerler: bir sey YOK demek bir sifat degildir. */
const BOS_DEGER = new Set(['none', 'unset', 'no', 'false', '', 'straight']);

/**
 * @param {object} a
 * @param {object} a.spec        cizilen spec (eksen -> deger)
 * @param {object} a.koken       provenance kaydi (eksen -> {kaynak})
 * @param {object|null} a.okuma  parsePrompt ciktisi ({eksenler: {alan: {value, kelime, idx}}})
 * @param {object} a.etiketler   eksen -> (deger -> etiket) menu tablosu
 * @param {string} a.isim        giysinin adi ('dress' | 'top' | 'skirt')
 * @returns {{baslik: string, once: string[], sonra: string[], atlanan: string[]}}
 *   `atlanan` = spec'te dolu ama kaynagi host default oldugu icin BASLIGA
 *   ALINMAYAN eksenler. Sessiz atlama yok: cagiran isterse basar.
 */
export function giysiBasligi({ spec, koken, okuma, etiketler = {}, isim }) {
  const eksenler = (okuma && okuma.eksenler) || {};
  const kaynakli = (alan) => {
    const k = koken && koken[alan] && koken[alan].kaynak;
    return k === 'soruldu' || k === 'gorulen';
  };
  const isimIdx = eksenler.garment && Array.isArray(eksenler.garment.idx) && eksenler.garment.idx.length
    ? Math.min(...eksenler.garment.idx) : null;

  const once = [], sonra = [], atlanan = [];
  const adaylar = [];
  for (const alan of Object.keys(spec || {})) {
    if (alan === 'garment') continue;
    const deger = spec[alan];
    if (deger === null || deger === undefined) continue;
    if (typeof deger === 'number' || typeof deger === 'object') continue;
    if (BOS_DEGER.has(String(deger))) continue;
    if (!kaynakli(alan)) { atlanan.push(alan); continue; }
    const okundu = eksenler[alan];
    const kelime = (okundu && okundu.kelime) ? String(okundu.kelime)
      : ((etiketler[alan] && etiketler[alan][deger]) ? String(etiketler[alan][deger])
        : insanlastir(deger));
    const idx = (okundu && Array.isArray(okundu.idx) && okundu.idx.length) ? Math.min(...okundu.idx) : null;
    adaylar.push({ alan, kelime: kelime.trim(), idx });
  }
  // Sira: alicinin kendi cumlesindeki sira. Cumlede yeri olmayan (menuden
  // secilmis) eksenler, yazilanlarin ARDINDAN, eksen adina gore kararli sirada.
  adaylar.sort((a, b) => {
    if (a.idx === null && b.idx === null) return a.alan < b.alan ? -1 : 1;
    if (a.idx === null) return 1;
    if (b.idx === null) return -1;
    return a.idx - b.idx;
  });
  const gorulen = new Set();
  for (const c of adaylar) {
    const k = c.kelime.toLowerCase();
    if (!k || gorulen.has(k)) continue;   // ayni kelime iki eksende okunmus olabilir
    gorulen.add(k);
    if (isimIdx !== null && c.idx !== null && c.idx > isimIdx) sonra.push(c.kelime);
    else once.push(c.kelime);
  }
  const govde = [...once, insanlastir(isim || 'garment')].join(' ').replace(/\s+/g, ' ').trim();
  let baslik = govde.charAt(0).toUpperCase() + govde.slice(1);
  if (sonra.length) baslik += ` with ${sonra.join(', ')}`;
  return { baslik, once, sonra, atlanan: atlanan.sort() };
}
