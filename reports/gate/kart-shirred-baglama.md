# KART — Shirred Bağlama (fizik çözücü → referans kalem)

**Durum:** Fizik-shirred hazır ve hakem-onaylı emsal karakterinde (kıyas-2 PASS).
Bağlama Damla'nın mührünü bekliyor — pinli çıktıyı değiştirir.

## Sorun
Pinli `drawstring_babydoll` (STYLE-PIN, md5 8b45e11b...) + `peterpan_puff` mevcut **elle-shirr** bloğunu (render() `pt.shirr`) kullanıyor. Fizik-shirred'i onlara bağlarsam pinli SVG **değişir** → STYLE-PIN kırılır.

## İki çıktının karşılaştırması (aynı gatherRatio 2.05)
| | babydoll elle-shirr (pinli) | fizik-shirred |
|---|---|---|
| yapı | 6 satır büzgü dikişi (shirrRows) + casing | 29 fizik kat çizgisi, üst-kilitli sönüm |
| karakter | düzenli yatay büzgü dikiş satırları | emsal panel: üstte yoğun kırışık, %21'de söner |
| path (babydoll toplam) | 74 path, 22916 byte | (bağlanınca ~+23 fold path değişir) |

**Not:** babydoll'un elle-shirr'i aslında **casing/drawstring büzgüsü** (boyun kanalı), fizik-shirred ise **shirred bodice panel** — teknik olarak FARKLI iki şey. "İki büzgü yolu" bir çelişki değil, iki ayrı konstrüksiyon olabilir.

## Golden diff özeti (bağlama denenmedi — mühür sonrası ölçülecek)
- Değişecek path'ler: babydoll gövdesindeki shirr bloğu (render satır `pt.shirr`), ~6 elle satır → ~29 fizik fold.
- Byte farkı: tahmini +2-4KB (fizik daha çok çizgi).
- pinli outline (gövde/askı/hem) DEĞİŞMEZ, sadece iç shirr çizimi.

## İki alternatifin dürüst maliyeti

### (i) "İki büzgü yolu" kalır (babydoll dokunulmaz)
- **Bakım yükü:** render()'da hem elle-shirr (casing) hem fizik-shirred (panel) kodu durur. İki kod yolu = iki bakım noktası. Ama ikisi farklı konstrüksiyon (casing vs panel) olduğu için kavramsal çelişki YOK — bir giysi casing büzgüsü de shirred panel de içerebilir.
- **Kazanç:** pin byte-identical kalır, hiçbir onay gerekmez, gece işi olarak güvenli.
- **Kayıp:** "tek kalem, tek yol" idealinden sapma; ama pratik.

### (ii) Tek yola in (elle-shirr → fizik, babydoll yeniden pinle)
- **Ne bozulur:** babydoll pinli çıktısı değişir → Damla yeni flat'i görüp onaylamalı, STYLE-PIN yeniden mühürlenir (yeni md5). peterpan_puff da etkilenir.
- **Ne kazanılır:** tek büzgü yolu (fizik), "iki kalem" borcu kapanır, gelecekteki tüm büzgü tek kaynaktan.
- **Risk:** babydoll Damla-onaylı "kalemim" pini; değiştirmek onun zevk kararı. Fizik-shirred casing büzgüsünü (boyun kanalı) doğru çizemeyebilir — o casing, panel değil; fizik-shirred panel için kalibre.

## ÖNERİ (Claude'un görüşü, karar Damla'nın)
**(i) — iki yol kalsın.** Sebep: babydoll'un shirr'i casing (boyun kanalı büzgüsü), fizik-shirred panel için kalibre — farklı konstrüksiyonlar, çelişki değil. Yeni shirred-bodice hedefleri (id31/35/44...) fizik-shirred kullanır, babydoll pini dokunulmaz kalır. Tek-yol idealine ileride, casing'i de fizikle modelleyince (ayrı kalibrasyon) geçilir.

## Mühür sonrası yapılacak (Damla "evet (i)" derse)
- Fizik-shirred'i yeni stillerde `physicsShirred` parçası olarak bağla (babydoll'a dokunma).
- shirred-bodice hedeflerini (id31/35/44...) çift kanat hakeme sok.

**Damla: (i) mi (ii) mi? Karar bekliyor, gece/gündüz işi değil — sen mühürlersin.**
