# KOSU/onbellek/ — fotograf tarifleri

**Bu klasordeki tarifler KOSU ISCISI tarafindan okundu, canli worker degil.**

Damla'nin 6 Eyl karari: anahtar YOK. Fotograf okumasi icin dis LLM cagrisi
yapilmaz. Isci fotografa dogrudan bakar (Read araci), tarifi buraya yazar,
kosu bundan sonra HEP buradan okur. Ayni girdi iki kez odenmez.

- Dosya adi: `<sha256(fotograf dosyasi)>.json`
- Alanlar: `girdiYolu`, `sha256`, `semaSurumu`, `tarif`, `guven` puanlari,
  `okuyan`, `tarih`, `okunamayanlar`, `enYakinSpec`
- `okuyan: "isci-A1b"` = bu tarifi A1b iscisi yazdi.
- **llmCagri = 0.** Bu klasordeki hicbir tarif icin dis cagri odenmedi.

Backend yolu (`web/worker.js` `/api/analyze`) kodda YAZILI KALIR ama kosu onu
cagirmaz. Canli worker denemesi A10'da, yalniz Damla kredi verirse.

## Okunamayan sey ADIYLA yazilir

Sessiz default yok (madde 4). Fotografta gorunmeyen nitelik `okunamayanlar[]`
listesine adiyla girer; `enYakinSpec._kayip[]` de motorun enum'unda karsiligi
olmayan her nitelii ("sweetheart yaka enum'da yok") tek tek sayar.

## Bu klasor COMMIT EDILIR

Kabul komutlari ve testler tarifleri buradan okur; `.gitignore`'a girmez.
