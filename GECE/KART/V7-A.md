# KART V7-A — KENAR KİMLİĞİ + DİKİŞ ÇİFTİ: BUGÜN NE VAR, ÖLÇ

ETİKET: PARALEL (V7-R ile aynı anda; dosya kesişimi YOK)
SÜRE TAVANI: 55 dk

## NE
Üç soruyu ÖLÇEREK cevapla. Hiçbirine tahminle cevap verme; her cevabın yanında
dosya:satır ve komut çıktısı olacak.

**S1 — KENAR KİMLİĞİ.** Bugün kol oyuğu yayı ile kol kapağı yayını hangi kod
eşliyor, ve **ADLANDIRARAK mı yoksa sıra/indeks tahminiyle mi**? `PatternPiece`
(bkz. `engine/src/geometry.hpp` civarı) bir kenar ADI taşıyor mu? Artefaktta
kaç adlandırılmış kenar var, kaç panel var? Sayıyı BAS.

**S2 — DİKİŞ ÇİFTİ ÖLÇÜSÜ ZATEN VAR MI.** `sewability_check` (V5'te kuruldu)
dikiş çiftlerinin uzunluk eşitliğini ölçebiliyor mu? Ölçebiliyorsa hangi
girdiden çifti buluyor (ad mı, indeks mi, inşa mı)? Kol oyuğu↔kapak çiftini
BUGÜN ölçebiliyor mu — ölçemiyorsa NEDEN ölçemediğini ölç (çift yok mu, kol
paneli yok mu, ad yok mu?).

**S3 — HANGİ HAT SEVK EDİLİYOR.** Kullanıcının indirdiği kalıbı üreten kod
yolu hangisi: `engine/src/surfacepattern.cpp` (yüzey motoru) mu, 2B çizici mi,
`engine/dist/stitchu-engine.js` (wasm) mi? Kol bugün bu sevk edilen hatta
ÇİZİLİYOR mu, çiziliyorsa hangi dosya/fonksiyon çiziyor? Kanıt: komut çıktısı
(grep sayısı, üretilen artefakt yolu), iddia değil.

## GİRDİ DOSYALARI (isim isim; alt aramalar serbest)
- `ENV.md`, `RULES.md`
- `engine/src/` tamamı (grep serbest), özellikle `geometry.hpp`, `sleeve.cpp`,
  `bodice.cpp`, `surfacepattern.cpp`
- `engine/tests/` tamamı (grep serbest), özellikle `sewability_check*`,
  `garment_armhole_check*`, `flat_expresses_spec_check.mjs`
- `engine/tools/` — ÖNCE GREP (yüzü aşkın alet var, yenisini yazma)
- `engine/build-wasm.sh`, `engine/CMakeLists.txt`
- `contract/` altındaki `primitives-v1.json` ve varsa kenar/edge şemaları

## ÇIKTI
`GECE/V7-A.md` — S1/S2/S3 başlıklarıyla. Her cevap:
`CEVAP (tek cümle) · KANIT (dosya:satır) · KOMUT (çalıştırdığın komut) ·
ÇIKTI (komutun bastığı sayı)`.
Sonunda **TEK CÜMLE HÜKÜM**: "kol oyuğu↔kapak kapısı bugün kenar kimliği
olmadan kurulabilir / kurulamaz, çünkü ...".

Bittiğinde KENDİN commit et:
`git add GECE/V7-A.md && git commit -m "v7-a: measure edge identity, seam-pair capability, shipped sleeve line"`
Commit hash'ini raporunda yaz.

## YASAKLAR
- KOD YAZMA / KAYNAK DOSYA DEĞİŞTİRME. Bu bir ÖLÇÜM kartıdır.
- Yeni test/alet YAZMA. Var olanı KOŞ.
- `GECE/KOSU.md`, `GECE-KOSUSU-v6.md`, başka kartlar: AÇMA.
- "görünüyor ki / muhtemelen / çalışıyor" YASAK (RULES 3).

## RAPOR FORMATI
yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu basan komut) ·
yapılamayan (sebep) · kart dışı fark edilen (dokunma, yaz).
