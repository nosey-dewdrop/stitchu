# KART V1-E — `style_check`: PİNLEME SÜRECİNİ YENİDEN KUR · PARALEL

## NE
`engine/STYLE-PIN` dizini diskte YOK (`af49514` sildi). Kapı T17'ye kadar
"PASS (nothing to enforce)" basıyordu — **sıfır pin, sıfır hüküm; yeşilken de
kapı değildi.** Bugünkü kırmızı, o sessiz yeşilin dürüst hâli.

Bu kartın işi kırmızıyı kapatmak DEĞİL (pin yalnız Damla'nın onayından
doğar). İşi şu: **"pin 0 canlıya çıkamaz" kuralını testin KENDİSİNE yaz** ve
pinleme sürecini Damla'nın tek komutla koşturabileceği hâle getir. Kapı,
bugünkü sessiz-yeşile bir daha ASLA düşemesin.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md`, `RULES.md`
- `engine/tests/style_check.mjs`
- `scripts/repin-style.sh`
- `git show af49514 --stat` (STYLE-PIN'i silen commit)
- Testin CMake'e bağlandığı satır (`engine/CMakeLists.txt`, grep `style_check`)

## YÖNTEM (sıra bağlayıcı)
1. `style_check.mjs`'i oku. Bugün 0 pinde ne yapıyor: kırmızı mı düşüyor,
   yoksa başka bir sebeple mi kırmızı? Kaynaktan çıkar, raporda satır no ver.
2. Kuralı testin içine AÇIKÇA yaz: pin dizini yok / boş / 0 dosya ⇒ FAIL,
   ve hata metni ne yapılması gerektiğini (hangi script, kimin onayı) söyler.
   Metin "nothing to enforce" sınıfı bir cümle İÇEREMEZ.
3. `scripts/repin-style.sh`'i oku. Damla'nın tek komutla koşturabilmesi için
   eksik ne: kullanım satırı net mi, hangi stilleri pinleyeceğini kendi mi
   buluyor, onay istemi anlaşılır mı. Onay mekanizmasını GEVŞETME — onay
   ÖLÇÜMDEN değil KARARDAN gelir, boru hattından beslenen onay reddedilir.
   Eksik olan varsa tamamla; script'in çıktısı Damla'ya ne yazacağını
   adım adım söylesin.
4. **MUTASYON KANITI (§4.5, zorunlu):** kuralın gerçekten kapı olduğunu
   kanıtla. Sahte bir pin dizini kur (`engine/STYLE-PIN/` + 1 dosya, /tmp'de
   ya da geçici olarak) → test ne diyor; dizini boşalt → test kırmızı düşüyor
   mu; geri al → eski hâline dönüyor mu. İKİ log da çıktıya girer.
   Sahte pini AĞACA COMMİTLEME — mutasyon bitince sil.

## ÇIKTI
- `engine/tests/style_check.mjs`, `scripts/repin-style.sh`.
  Kanıt olduğu kapı: `style_check` (kapanmaz, DÜRÜSTLEŞİR).
- `GECE/log/V1-E.mutasyon.txt` — 4. adımdaki üç koşunun çıktısı.
- `GECE/log/V1-E.ctest.after.txt` — TAM ctest.

## ZORUNLU KAPILAR
1. TAM ctest. Kırmızı AD kümesi büyüyemez (RULES §9). `style_check` kırmızı
   KALIR ve bu beklenen sonuçtur — ama başka hiçbir ad kırmızıya düşemez.
2. Mutasyon kanıtı olmayan kural süstür ve kabul edilmez.
3. 4.7: kırmızı kapanmadığı için kök teşhis + ölçülmüş aday + hangi faza kart.

## YASAKLAR
- `engine/STYLE-PIN/` altına GERÇEK pin commit'leme. Pin Damla'nın kararıdır;
  bir işçi onu ölçerek üretemez (regen-vs-regen).
- Onay istemini otomatikleştirme, atlatma, env değişkeniyle geçilebilir yapma.
- `engine/src/` altına dokunma, `recipes/` `contract/` `web/` `docs/`'a dokunma.
- style_check DIŞINDAKİ mevcut testleri değiştirme.

## SÜRE TAVANI
45 dk.

## ETİKET
PARALEL (V1-B, V1-D ile; dosya kümeleri kesişmiyor)
