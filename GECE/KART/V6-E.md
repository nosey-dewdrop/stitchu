# KART V6-E — `edit_locality_check`'in DİŞSİZ YÖNÜNÜ ONAR (M1 açığı)

ETİKET: **PARALEL** (V6-D ile) · SÜRE TAVANI: **60 dk**

## NE
`edit_locality_check` üç yönde dişli ama BAYT İNCELİĞİNİ koruyan mandalı YOK:
karşılaştırma bayttan "panel varlığına" indirildiğinde kapı hâlâ yeşil kalıyor
(ölçüldü). O açığı kapat ve mutasyonla KANITLA. Kapının kalanını bozmadan.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md` · `RULES.md`
- `GECE/V6-B.md` ← ÖNCEKİ ÖLÇÜM (mutasyon tablosu, M1'in neden kırmadığı).
  GİRDİ olarak oku; sayılarını devralma, mutasyonları KENDİN yeniden koştur.
- `GECE/log/V6-B.mutasyon.txt`
- `engine/tests/edit_locality_check.mjs` · `engine/tools/spec-diff.mjs`
- `contract/edit-locality-v1.json`

## YAPILACAKLAR
1. M1'i KENDİN yeniden koştur ve kırmadığını KANITLA (exit kodu + çıktı satırı).
   Kırıyorsa V6-B yanılmış demektir; bunu yaz ve karta göre devam et.
2. **KÖK TEŞHİS**: A1 mandalının eşiği neden yakalamıyor (test `:75` civarı,
   `antiCaught > 0`). Kök sebebi bir cümleyle ve dosya:satır ile yaz.
3. **ONAR** — mandalın eşiği TABANLANIR, gevşetilmez:
   - A1'in yakalaması gereken vaka sayısı bir TABANA bağlanır (bugünkü ölçülen
     sayı taban olur, yalnız YÜKSELEBİLİR — ratchet). Taban dosyaya yazılır.
   - Bölge dışı karşılaştırmanın GRANÜLARİTESİ ilan edilir ve denetlenir:
     karşılaştırma bayt ise "bayt" olduğunu test kendisi doğrular (karşılaştırma
     fonksiyonu bir kontrol vakasında ayrımı görmek ZORUNDA — ör. dokunulmayan
     panelde tek koordinat 0.001mm oynatılınca ihlal basmalı).
   - ★ 4.6: eşik/tolerans değişiyorsa eski değer + yeni değer + gerekçe
     COMMIT MESAJINA yazılır.
4. **MUTASYON KANITI (§4.5)**, hepsi GERİ ALINARAK, ÖNCE/SONRA exit kodlu:
   M1′ karşılaştırmayı bayttan panel varlığına indir → artık **KIRMALI**.
   M2′ dokunulmayan panele +0.001mm enjekte et → **KIRMALI** (incelik kanıtı).
   M3′ A1 tabanını elle düşür → **KIRMALI** (ratchet kanıtı).
   Kırılmayan mutasyon adıyla yazılır, saklanmaz.
5. **ÇELİŞKİ, dokunma ama ÖLÇ:** V6-B "12 vakanın 2'sinde A1 rewrite kipinde
   yakalamıyor" dedi (10/12). Bugünkü sayıyı KENDİN bas; hangi vakalar
   olduğunu adıyla yaz. Onarımın bu sayıyı DÜŞÜRMEMELİ.

## ÇIKTI
`engine/tools/spec-diff.mjs` · `engine/tests/edit_locality_check.mjs` ·
`GECE/V6-E.md` · `GECE/log/V6-E.mutasyon.txt`

## YASAKLAR
- `contract/` DEĞİŞTİRİLMEZ (V6-D orada üretiyor). `engine/CMakeLists.txt`
  DEĞİŞTİRİLMEZ. `engine/tools/gen-anchors.mjs` ve `contract/anchors-v1.json`
  SENİN DEĞİL — okuma bile gerekmiyor.
- `engine/src/`, `backend/`, `web/`, `engine/tools/foto-spec-olcum.mjs` dokunma.
- **KAPIYI GEVŞETEREK GEÇMEK YASAK** (§7.1): vaka silmek, toleransı büyütmek,
  bir vakayı `skip` etmek fazı düşürür.
- Yeni kırmızı AD doğurma. Koşumun sonunda
  `ctest --test-dir engine/build -R "edit_locality|spec_diff|specv2" --output-on-failure`
  koş ve çıktısını logla.
- "Kapı artık sağlam" yasak — exit kodu + çıktı satırı.

## COMMIT
`git commit -- engine/tools/spec-diff.mjs engine/tests/edit_locality_check.mjs GECE/V6-E.md GECE/log/V6-E.mutasyon.txt`
`git add -A` KULLANMA (paralel işçi var).
