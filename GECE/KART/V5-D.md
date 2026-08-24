# KART V5-D — draft_math_check (V5'in 7. maddesi): POZİTİF GEOMETRİ KAPISI

## NE
Ana kalıp ölçülerini BEDEN BEDEN, YAYINLANMIŞ çizim formülü ya da bandıyla
karşılaştıran kapıyı yaz. Formülü olmayan ölçü için "yayın YOK, bant şu
ölçümden" açıkça yazılır.

## ETİKET
SIRALI (V5-A'dan SONRA — ikiniz de `engine/CMakeLists.txt`'e yazıyorsunuz).
SÜRE TAVANI: 60 dk.

## ÖLÇÜLECEK KALEMLER (v6 §6/V5 madde 7, birebir)
- scye derinliği (armhole depth)
- kol oyuğu çevresi
- omuz genişliği
- göğüs / bel / kalça çevre payları (ease)
- ense oyuntusu (back neck drop)
Her kalem, her beden (EU34..EU48): ÖLÇÜLEN · BEKLENEN (formül/bant) ·
KAYNAK KÜNYESİ · GEÇTİ/KALDI/KAYNAKSIZ.

## HANGİ KALEMİ YARGILAYACAK — TARTIŞMA YOK
`GECE/V5-Z.md` §5 ölçtü: sevk edilen kalıp `engine/wasm/bindings.cpp:339
draftJSON` → `GarmentDrafter::draft` (`engine/src/garment.cpp`). Kapı bunu
yargılar. Motoru yükleme emsali: `engine/tools/bugra/bugra-parity.mjs:18`
(`web/vendor/stitchu-engine.js`).

## GİRDİ DOSYALARI (isim isim, başka dosya açma)
- ENV.md · RULES.md
- GECE/V5-R.md  ← EŞİKLERİN TEK KAYNAĞI. Burada künyesi olmayan sayıyı
  kapıya SOKMA; "KAYNAKSIZ" statüsüyle bas.
- knowledge/drafting-math-eu38.md (Aldrich doğrulanmış sayılar)
- engine/tools/bugra/bugra-parity.mjs · engine/tools/pattern-measure.mjs
- engine/tests/flat_pattern_agree_check.mjs (mjs kapı emsali)
- engine/CMakeLists.txt (yalnız add_test satırı eklemek için)
- contract/tables.json · contract/layers/size-table.json

## BİLİNEN ZEMİN (ölçüm, tekrar arama)
`GECE/V5-Z.md` KART DIŞI #5: sevk edilen kalıp STRAPLESS — omuz dikişi ve
kol oyuğu STİTCH GRAFİĞİNDE YOK (`flat_pattern_agree_check` bunu 3
UNMEASURED olarak sayıyor ve tavanı dolu). Yani scye derinliği · kol oyuğu
çevresi · omuz genişliği · ense oyuntusu bugün SEVK EDİLEN kalıpta
ÖLÇÜLEMEYEBİLİR. Bu bir başarısızlık değil BULGUDUR:
- ölçülemeyeni `UNMEASURABLE: <sebep>` diye ADIYLA bas, sessizce geçme;
- kaç kalemin ölçülebildiğini SAYIYLA raporla;
- UNMEASURABLE sayısını RATCHET olarak kilitle (yalnız DÜŞEBİLİR) —
  emsal: `engine/tests/flat_pattern_agree_check.mjs` UNMEASURED tavanı.

## YAPILACAK
1. `engine/tests/draft_math_check.mjs` (TEK yeni dosya).
2. Her eşiğin künyesi dosya başlığında (`GECE/V5-R.md`'den birebir).
   Kaynaksız kalem için başlıkta "yayın YOK, bant şu ölçümden: <komut>".
3. `engine/CMakeLists.txt`'e `add_test(NAME draft_math_check ...)` — saf
   ekleme, mevcut satırlara DOKUNMA.
4. 8 bedenin hepsinde koştur.
5. §4.2 BOŞ TEST KANITI: faz-öncesi commit `12ad937`'ye
   (`git worktree add --detach /tmp/v5pre-d 12ad937`) karşı koştur,
   `GECE/log/V5-D.bostest.txt`. Kırmızı düşmüyorsa "VACUOUS" diye yaz.
6. §4.5 MUTASYON: bir ölçüyü kasten +5mm boz → kapı kırılsın, geri al →
   yeşile dönsün. `GECE/log/V5-D.mutasyon.txt`.
7. Tam ctest koş: `GECE/log/V5-D.ctest.after.txt` + kırmızı ad farkı
   `GECE/log/V5-D.reddiff.txt` (kıyas: `GECE/log/V5.ctest.before.txt`).

## YASAKLAR
- SAYI UYDURMA. `GECE/V5-R.md`'de künyesi olmayan hiçbir sayı eşik olamaz.
- Kapıyı geçmek için şekillendirme; kırmızıysa kırmızı bırak + kök teşhis +
  en az bir ölçülmüş çözüm adayı (v6 §4.7).
- Buğra'ya benzerlikle kapı kurma (v6 §7.3).
- Mevcut testleri değiştirme. `engine/src/` altında kaynak DEĞİŞTİRME.
- `patterns_real/` PDF'lerine dokunma. Yeni bağımlılık kurma.

## ÇIKTI
- `engine/tests/draft_math_check.mjs` · `engine/CMakeLists.txt` (saf ekleme)
- `GECE/log/V5-D.{bostest,mutasyon,ctest.after,reddiff}.txt` + 8 beden çıktısı
- `GECE/V5-D.md` — yapılan (yol + hash) · ölçülen (sayı + komut) ·
  yapılamayan (sebep) · kart dışı fark edilen.
"Baktım / doğru görünüyor" YASAK (RULES 3).
Bitince commit at (lowercase english), hash'i rapora yaz.
