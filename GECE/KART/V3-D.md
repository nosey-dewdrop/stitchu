# KART V3-D — ONARIM: iki yeni kırmızı ad + iki kanat kırmızısının KÖKÜ

ETİKET: SIRALI (tek işçi, tek kalan iş)
SÜRE TAVANI: 90 dk

## NE
V3'ün açtığı iki YENİ kırmızı adı kapat (RULES 9: miras kırmızı AD kümesi
büyüyemez) ve üç kanadın kırmızılarını KÖKÜNDEN çöz. Kapıyı gevşeterek geçmek
yasaktır; çözülemeyeni ölçüp REDDEDİLMİŞ HAMLE olarak kaydet (§4.7).

## GİRDİ DOSYALARI
- `GECE/V3-C.md` (kırmızıların kök teşhisi ve ölçülmüş adayları burada)
- `GECE/V3-B.md` (kalıp tarafı ölçüleri ve `body_length` uyarısı burada)
- `engine/src/shellprojection.cpp` (:89-97, :112-115) · `.hpp`
- `engine/src/surfacepattern.cpp` (:55-60 kalça blend emsali · :71-81 bel)
- `engine/tests/flat_pattern_agree_check.mjs` · `engine/tests/flat_artifact_census.mjs`
- `engine/tools/pattern-measure.mjs` · `engine/tools/shell-flat.cpp`
- `engine/build-wasm.sh` · `engine/tests/` içindeki `bundle_fresh_check`
- `engine/tests/vocab_reference_check.sh`

## DÖRT İŞ (sırayla; her biri ayrı commit)

### 1. Sınıf 4 — dejenere segment (6 adet) → 0
Kök V3-C'de yazılı: `shellprojection.cpp:89-97` dört koşuyu KAPALI aralık
örnekliyor, sınır noktası iki kez `push_back` ediliyor (`:112-115`).
Örneklemeyi yarı-açık aralığa çevir. **Nokta oynatma, kırpma, tekilleştirme
sonrası "smoothing" YOK** — sadece çift eklemeyi kaldır.

### 2. Sınıf 3 — belde 20.5602° C1 kırığı → eşiğin (1.0°) altına
Kök V3-C'de yazılı: `surfacepattern.cpp:71-81`, belin üstünde skim zarfı /
altında halka interpolasyonu, `skimBaseH`'de teğet koşulu olmadan buluşuyor.
**Emsal ZATEN REPODA:** kalçada `surfacepattern.cpp:55-60` kuadratik köşe
yuvarlama (`blendMM=50`) ve ölçüm o sınırda kırık OLMADIĞINI gösteriyor.
AYNI mekanizmayı bele uygula — yeni algoritma UYDURMA (§5.5).
⚠ Bu kabuğu değiştirir, yani KALIBI DA değiştirir. Bu doğrudur (tek nesne),
ama bedeli ölçülecek:
- Öncesi/sonrası `./engine/build/surface-pattern EU38` bel halkası sayısı.
- Tam `ctest`: `h3b`, `walkgate`, `edgemono`, `cutplan`, `surface_pattern_check`,
  `flatten_check` kırmızıya döner mi.
- **Dönerse: GERİ AL** ve raporda "ölçüldü, reddedildi, sayı şu" diye yaz.
  Kırığı susturmak için eşiği 1.0°'den gevşetmek YASAK.

### 3. `body_length` — TANIM UYUŞMAZLIĞI (−1.9795%)
V3-B ölçtü: iki taraf AYNI NİCELİĞİ ölçmüyor. `shell-flat` düşey yükseklik
farkı basıyor (`topZMM − bottomZMM`), `pattern-measure` kumaş üstünde YAY
basıyor. Ham farkı kapıya sokmak yanlış hüküm demektir.
YAPILACAK: `shellprojection` kabuk yüzeyinde ÖN ORTA HAT YAY UZUNLUĞUNU da
hesaplasın; kapı bu ikisini karşılaştırsın. Düşey yükseklik ölçüsü SİLİNMEZ,
ayrı adla (`body_height_projected`) raporlanmaya devam eder ama kapıya girmez.
- Değişikliğin gerekçesi ve ÖNCE/SONRA iki sayı **commit mesajına** yazılır (§4.6).
- Yeni tanımda da %1.5 tutmuyorsa **GEVŞETME** — kırmızı raporla.
- Bu bir DÜZELTME KATSAYISI DEĞİLDİR ve öyle olmayacak: hiçbir yere çarpan,
  ofset, kalibrasyon sabiti eklenmez. Eklenirse faz düşer.

### 4. İki yeni kırmızı ad
- `bundle_fresh_check`: wasm paketi 1 commit bayat (`25f0f45`). `engine/build-wasm.sh`
  ile yeniden derle, damgayı tazele. Emscripten yoksa/derlenmiyorsa **ZORLAMA** —
  hata çıktısını `GECE/log/V3-D.wasm.txt`'ye yaz ve raporla.
- `vocab_reference_check`: taban **10418 referans**, RATCHET kilitli, sayı
  yalnız DÜŞEBİLİR. V3'ün eklediği kod +25 referans getirmiş. Kapının kapsam
  kuralını `engine/tests/vocab_reference_check.sh` içinden OKU, sonra
  **yeni kodun kapalı enum'a yaptığı referansları kaldır** (sabit isim listesi
  yerine mevcut çözüm tablosundan oku). Tabanı yeniden kesmek SON çaredir ve
  ancak deltanın satır satır kaynağı commit mesajına yazılırsa yapılır
  (emsal `e2f7aba`).

## UNMEASURED (3/6) — RATCHET, GEVŞETME DEĞİL
`bust` · `neck_opening_width` · `shoulder_width` kalıp tarafında YOK; kök
repoda ismen açık olan G5 boşluğu (sevk edilen kalıp strapless).
`flat_pattern_agree_check` bunları **atlamaz**: UNMEASURED sayısını basar ve
**3'te RATCHET'ler** — sayı artarsa kapı kırmızı düşer, azalması serbesttir.
Bu bir tanım kararıdır; gerekçesi test dosyasının BAŞLIĞINA ve commit
mesajına aynen yazılır: "ölçülemeyen 3, G5 (omuz/yaka/oyuk) sevk edilmediği
için; sayı yalnız düşebilir." Toleransı (%1.5) DEĞİŞTİRME.

## ÇIKTI
- Değişen kaynaklar (yeni dosya AÇMA — bu kartın yeni kaynak dosya bütçesi 0)
- `GECE/log/V3-D.ctest.txt` (tam ctest, en son hali)
- `GECE/log/V3-D.wasm.txt` (madde 4)
- `GECE/V3-D.md` — dört işin her biri için: ÖNCE sayı · SONRA sayı · komut ·
  commit hash; yapılamayan için sebep + ölçülüp reddedilen hamleler.
- Her iş ayrı commit (lowercase ingilizce). Push ETME.

## YASAKLAR
- Eşik/tolerans gevşetmek (§4.6, §7.1) — 1.0° ve %1.5 sabit kalır.
- Artefaktı kırpma/smoothing/çözünürlük düşürme ile gizlemek — fazı düşürür.
- Sabit çarpan / düzeltme katsayısı / kalibrasyon sabiti eklemek — fazı düşürür.
- Yeni algoritma sıfırdan uydurmak (§5.5) — kalça emsali repoda, onu kullan.
- Mevcut testleri (V3'ün ikisi hariç) değiştirmek.
- `render-garment-flat.mjs`, `engine/flat-engine/`, `web/`, `patterns_real/` — DOKUNMA.
- "Baktım / doğru görünüyor" yasak.
