# GÖREV — BULGULAR.md'deki kökü kapat (Damla, 2026-07-18)

Kaynak: `engine/DENETIM-2026-07-18-courtney.md` + Damla'nın kanıt taraması. Tavsiye isteme, uygula.
Her adım kendi commit'i. Adım bitmeden sonrakine geçme. Kabul kriteri geçmeden "tamam/done" yazma.

GENEL KURALLAR
- Görmediğin şey için "gördüm/baktım/read by eye" yazmak yasak.
- Bir adımın çıktısı bir DOSYA ya da bir TEST SONUCU olmalı. Cümle değil.
- Emin olmadığın yere "bilmiyorum" yaz, tahmin etme.
- Golden'da fark çıkarsa DURDUR, toplu onaylama, farkı satır satır raporla.

## ADIM 1 — sözlüğü tekleştir: engine/vocab.json + gen-vocab.mjs → vocab.gen.hpp + vocab.gen.js;
elle yazılı sözlük tutan HER araç buna bağlanır. Kabul: quoted 'puff' grep'i sadece vocab+testlerde;
üretici deterministik (iki koşu, diff boş).

## ADIM 2 — sessiz düşüşü öldür (TEK COMMIT, C++ + JS birlikte): parseEnum/parseEnumInt bilinmeyende
std::invalid_argument; engine.js MAP||0 kalkar, bilinmeyen throw; draftJSON try/catch → {error, pattern:null};
create.js hatayı gösterir. Kabul: 'puff' hata, sleeveCap:99 hata, ctest yeşil, golden byte-identical.

## ADIM 3 — round-trip testi (roundtrip_check.cpp, ctest'e girer): her vocab değeri string→enum→raw()→string;
negatifler ("puff","puffed","vneck","blouse","") HER alanda fırlatır; sleeveCap != Plain → Sleeve parçası şart.
Kabul: ADIM 2 geri alınınca KIRMIZI, geri gelince yeşil; iki koşu çıktısı raporda.

## ADIM 4 — çapraz kurallar (buildSpec sonunda): cap/cuff kolsuz → hata; ruffledStraps kollu → hata;
skirt + (kol|crew dışı yaka) → hata. Kabul: her kural için test, ctest'te.

## ADIM 5 — kılavuz ve kesim listesi PARÇADAN türesin: pdf-core başlık=liste aynı küme, chalk parçalar
"şerit/notion" başlığında; kılavuz↔parça iki yönlü denetim (öksüz parça yok, hayali adım yok), ihlal =
draft geçersiz. Kabul: dart kılavuzunda princess/gore geçmez; öksüz testi ctest'te.

## ADIM 6 — görsel doğrulama gerçekten mümkün: render-pages svg→png, mutlak yol + sha256 stdout'a;
yol+hash raporda olmadan adım bitmez. "Baktım" cümlesi yok.

## ADIM 7 — teslim yolu: gen-pattern-pdfs hata/issues varsa BASMADAN durur; her basılan PDF'in spec'i
web/data/patterns/<slug>.json. Kabul: courtney yeniden üretilir, parça listesi karşılaştırması raporda.

## ADIM 8 — buildSpec struct'a döner (AYRI COMMIT, EN SON): 34 pozisyonel → tek obje. Kabul: golden
byte-identical, ctest yeşil.

## RAPOR — reports/2026-07-18-enum-err-fix.md: adım başına dosyalar + ctest + golden; ADIM 3 kırmızı→yeşil;
ADIM 6 PNG yol+hash; yapılamayan her şey açıkça "yapılmadı". "Hepsi tamam" yazma.

DURUM 2026-07-18 gece: 8 adım + FAZ 0.9 (dürüst benchmark sayacı) TAMAMLANDI, rapor yazıldı.
