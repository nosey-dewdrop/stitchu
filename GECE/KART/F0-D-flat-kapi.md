# KART F0-D — FLAT↔KALIP + KAPI ÖN-ENVANTERİ (paralel set, işçi 4/4)

## NE
(a) Flat kalıptan türüyor mu, (b) flat kaç ayrı kalemden çıkıyor,
(c) mevcut 96 testten hangileri F2/F5/F6/F7 kapılarının parçasını ZATEN ölçüyor.

## GİRDİ DOSYALARI
- engine/tools/render-garment-flat.mjs
- engine/flat-engine/_engine-full.mjs
- engine/tools/render-flat.mjs, engine/tools/render-pages.mjs
- contract/tables.json  (flat._layer beyanı)
- engine/tests/ altındaki test kaynakları
- engine/CMakeLists.txt (test adı → kaynak eşlemesi)

## ÖNCE GREP
- `grep -rn "flat" engine/CMakeLists.txt`
- `grep -n "_layer" contract/tables.json`

## YAPILACAK
1. FLAT ↔ KALIP: flat, kalıbın geometrisinden mi türüyor yoksa ayrı bir
   şablondan mı? Render hattının KAYNAĞINI okuyarak söyle (dosya:satır).
   Aynı spec'ten üretilen flat ile kalıbın ORTAK ölçülerini yan yana koy
   (en az: hem/bel oranı). Ortak birim var mı — contract/tables.json'daki
   flat._layer beyanını aynen alıntıla.
2. FLAT KALEM ENVANTERİ: flat kaç ayrı üreticiden çıkıyor? Her kalemi
   dosya yoluyla say. `_engine-full.mjs` içindeki stil-pinli sert kodlanmış
   kaçışları satır numarasıyla listele.
3. KAPI ÖN-ENVANTERİ (bu kartın en önemli maddesi). Şu testlerin HER BİRİ
   için: ne ölçüyor (tek cümle) · hangi v3 kapısına denk gelir · eksik ne:
     closed_garment_check · notch_alignment_check · wearability_check ·
     wearable_check · flatten_check · body_volume_check · garment_shell_check ·
     drape_check · sewable_census · sleeve_check · cap_sleeve_check ·
     gather_check
   Test kaynağını OKUYARAK cevapla, adından tahmin etme. Bir test yoksa
   "REPODA YOK" yaz. Bu tablo olmadan F2/F5/F6 yeni test yazamaz.

## ÇIKTI
`GECE/F0-D.md` — üç bölüm, her sayının yanında dosya:satır.

## YASAKLAR
- Hiçbir testi/kaynağı değiştirme, yeni test yazma. Bu kart ölçer.
- Commit ATMA.
- Adından çıkarım yapma; kaynağı okumadan "şunu ölçüyor" yazma.
- reports/ Logs/ HEDEF.md okuma (§0.1).

## SÜRE TAVANI
maxTurns 40. Tur biterse madde 3'ün tamamlanan kısmını yaz, kalanı "KALAN İŞ".
