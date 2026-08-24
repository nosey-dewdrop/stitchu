# KOSU.md — v6 gece koşusu (24 Ağu 2026)

Protokol: GECE-KOSUSU-v6.md. v5 koşusunun kayıtları GECE/arsiv/v5-kosusu/
altındadır ve bu koşuda kanıt DEĞİLDİR.

## ŞU AN
Faz: **V0 KAPANDI** (dürüst envanter; ölçüm var, onarım yok). Sıradaki V1.
Son yeşil commit: yok — HEAD'de 6 kırmızı var, hepsi MİRAS (V0 hiçbirini
doğurmadı, ana ağaçta motor değişikliği sıfır).
V0'ın ölçtüğü ağaç: `81fdae3..HEAD`. Açılış ağacı: `b197ccf`.

## KAPANMIŞ FAZLAR
- **V0** — 7 kart (0R/0A/0B/0C/0D/0E paralel + 0F sıralı), 6 alt kapı yeşil,
  4.7 önce KALDI sonra 0F ile GEÇTİ. Tutanak: `GECE/V0.md` · Kapı: `GECE/KAPI.md`

## AÇIK KIRMIZILAR (V0'ın ölçtüğü, ad · nerede · sayı)
1. `golden_check` — pin ↔ motor · **9651/23406 satır (%41.23)**, max
   **62.7764 mm**, medyan 5.6000; kök `52ae85c` (scye derinliği formülü)
2. `recipe_dress_check` — `recipes/shift-dress-square-spaghetti.json` ·
   **115 PASS / 10 FAIL**; aynı kök `52ae85c`; sapma Top Front max 48.46 mm.
   Ölçülmüş aday: metinsel düzeltme → 116/9
3. `style_check` — `engine/STYLE-PIN` diskte YOK (`af49514` sildi) ·
   aday YOK, gerekçe ölçüldü (pin kendi çıktısından üretilemez)
4. `sizechart_source_check` — `contract/tables.json` · 7 kolonun **4'ü
   UNSOURCED** · K10: uydurmak yasak, tek yol yayınlanmış kaynak
5. `contract_check` — `git ls-files patterns_real` = **41** takipli telifli
   dosya · aday ölçüldü (untrack → GREEN) ama Damla kararı
6. `figure_check` — `contract/figure-bands.json` `mandal.taban_v3` **16 pin**,
   `dress_bandeau_circle` yok · pin adayı ÖLÇÜLDÜ ve REDDEDİLDİ (regen-vs-regen)

KAPANAN: `bundle_fresh_check` (v6 §1'in listesindeydi, bu gece yeşil ölçüldü).
AÇILAN YENİ AD: **0**.

## DEVİR ÜÇ SAYI (V1'e)
1. **KIRMIZI = 6** — tanımlı 106, koşan 105, 1 disabled; iki bağımsız koşuda
   aynı adlar (`GECE/log/V0-0A.ctest.txt`, `GECE/log/V0-SEF.ctest.txt`)
2. **GOLDEN SAPMASI = 9651 satır / %41.23 / max 62.7764 mm, TEK KÖK `52ae85c`** —
   iki kırmızı bu tek commit'ten türüyor, öncesi pinle bayt-özdeş
3. **SİCİL = 15 operatör (9 shipped / 1 flagged / 5 absent)** — damarın 11
   kalemi İSİMSİZ; foto damarının **%50'si** sırf `sleeve` absent olduğu için
   sözleşmede ifade edilemiyor

## TABAN BANTLARI (§4.1 — sessizce aşılamaz)
`draftJSON` medyan **1.031 ms** (p95 1.338) · `gradeJSON` EU34→48 **8.800 ms** ·
5000 soak SURVIVED, external delta 0.00 MB · native↔wasm en kötü **1e-4 mm** ·
çağrı yolu **main thread**, Worker yok → Worker refaktörü KUYRUK KARTI, kapı değil.
Alet: `engine/tools/wasm-baseline.mjs`.

## SONRAKİ FAZLARIN HAZIR GİRDİSİ
- V1 ← `GECE/V0-0F.md` (6 kırmızının kökü + ölçülmüş adayları)
- V2 ← `GECE/V0-0D.md` (37 eksen / 132 değer / 7524 referans tabanı; sevk
  edilen taraf MENÜ; `bindings.cpp:94` sessiz int ikamesi)
- V6 ← `GECE/V0-0B.md` (foto→spec: 5 fotoda 1 tam doğru; hata sınıfı GÖRME %100;
  kelime listesi ELLE yazılmış `vision-student/vocab.py:17`)
- V9/V10 ← `GECE/V0-0C.md` (1248 iddia: doğru 14 / YALAN 12 / kanıtsız 15;
  292 duran-iddia; en ağırı: site MTM satıyor, motor sabit beden)

## DAMLA'YA DÜŞEN (bloke etmez)
- **K-FN1** (kol oyuğu bandı: taban beden mi, sekiz beden mi) —
  `DAMLA-KUYRUK.md` başında, varsayılan (A) yürür.
- **K-V0A** (yeni): `patterns_real/` 41 takipli telifli dosya `contract_check`'i
  kırmızı tutuyor; untrack ölçüldü ve kapıyı yeşile döndürüyor, ama git
  geçmişi kazısı Damla kararıdır. Varsayılan: dokunma, kırmızı kalsın.
- **K-V0B** (yeni): `style_check` yeniden pinleme `scripts/repin-style.sh`
  ile Damla onayı bekliyor; aday üretilemedi. Varsayılan: kırmızı kalsın.
