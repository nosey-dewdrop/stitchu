# V6-J — KAPANIŞ: reddedilen iş yan dala, ana dal yeşile

**Kart:** `GECE/KART/V6-J.md` · **Hüküm:** tarafsız hakem **KALDI** (`GECE/KAPI.md` son satırı) ·
**Tip:** kapanış / geri alma. Pazarlık yok, ölçüm var.

## 1. YAN DAL — HİÇBİR İŞ SİLİNMEDİ

`research/v6-cipa-editleme` @ **3d8903cc39b5e7a99dac462aed1e982221018886**
(= bugünkü HEAD, birebir), `origin`'e pushlu.
Yan dalda duran iş: `contract/anchors-v1.json` (1382 satır) ·
`engine/tools/gen-anchors.mjs` (421 satır) · `engine/tests/anchor_source_check.mjs`
(294 satır) · `foto-spec-olcum.mjs`'in KONUM/`--v2` ekleri (+253) ·
`spec-diff.mjs`'in V6-G ekleri (`operatorSicil`, `AXIS_MAP`, `anchorNames`, `OP_KEYS`) ·
`edit_locality_check.mjs`'in A5/A6 kısmı · `6b3378f`'in yorum edit'i (orada, dürüst
olmayan hâliyle, kaydı diye).

## 2. ÖLÇÜM ZİNCİRİ — tut/at kararı SAYIYLA verildi

Ham log: `GECE/log/V6-J.kapi.txt`. Basan komut her adımda
`bash engine/tests/vocab_reference_check.sh --tree .` (taban 10438, commit `495d58a`).

| adım | ne yapıldı | toplam | hüküm |
|---|---|---|---|
| 0 | HEAD, geri alma yok | 10448 (+10) | FAIL (6 artan) |
| 1 | `git revert --no-commit 6b3378f` | **10452 (+14)** | FAIL (7 artan) |
| 2 | `anchors-v1.json` + `gen-anchors.mjs` silindi | 10448 (+10) | FAIL (7 artan) |
| 3 | `foto-spec-olcum.mjs` → `3fa8002` | 10438 (**+0**) | **FAIL (4 artan)** |
| 4a | `spec-diff.mjs` → `3fa8002` TAM | 10432 (−6) | YESIL |
| 4b | `spec-diff.mjs` + `edit_locality_check.mjs` → `572316a` (V6-E) | **10432 (−6)** | **YESIL** ← seçilen |

**Adım 1 sayıyı ARTIRDI ve doğru olan budur.** `6b3378f` 4 eklenen / 4 silinen
satırın hepsi yorumdu; `'topLength' -> [top, length]` örneği `'hipBand' -> [hip, band]`
yapılmıştı. `words()`'ün gerçek girdisi spec ALAN ADLARI, `topLength` onlardan biri,
`hipBand` değil — yani sayı düşerken doküman yanlışlaştı. Geri alındı.

**Adım 3 kaydadeğer ders:** toplam tabana EŞİTLENDİ (10438 = 10438) ama kapı
hâlâ FAIL bastı, çünkü ratchet **anahtar bazında** yargılıyor: `backOpening +1 ·
garment +1 · shaping +1 · skirtStyle +1` tabanın üstünde kaldı, dört düşüş onları
toplamda maskeledi. "Toplamı eşitledik" bir yeşillik iddiası değildir.

**Adım 4a vs 4b — V6-E KORUNDU, gerekçesi ölçüm:** ikisi de **aynı 10432**'yi
basıyor. Yani V6-E'nin onarımı (`LOCALITY_GRANULARITY = 'bayt'` ilanı +
`pieceBytes` export, `spec-diff.mjs:170-171`) ratchet'e **sıfır satır** maliyet
getiriyor. Hakemin adıyla akladığı tek iş, kapıyı hiç zorlamadan ana dalda kaldı.
`node engine/tests/edit_locality_check.mjs` → `EXIT=0`, A1 tabanı 10 ve A4
granülarite mandalı yerinde.

**Ölçülen yan bilgi:** `anchors-v1.json` + `gen-anchors.mjs` ikisi birlikte
ratchet'e yalnız **4 satır** koyuyordu (10452→10448). `gen-anchors.mjs`'in katkısı
**0**: `file(1)` onu "binary data" sayıyor ve kapı `grep -I` kullanıyor — hakemin
işaret ettiği delik burada da doğrulandı, 421 satırlık üreteç kapıya görünmüyor.

## 3. BAĞIMLILIK TEMİZLİĞİ — ana dalda kırmızı bırakılmadı

- `engine/tests/anchor_source_check.mjs` **silindi** (dayandığı iki dosya kalktı).
- `engine/CMakeLists.txt` → `3fa8002` (yalnız `anchor_source_check` `add_test` bloğu
  düştü; `3fa8002..HEAD` bu dosyada başka satır değiştirmemiş).
- `edit_locality_check.mjs` `572316a` hâlinde, artık `anchorNames` /
  `operatorSicil` / `OPERATOR_STATUS` import etmiyor.
- Doğrulama: `grep -rln 'anchors-v1|gen-anchors|anchorNames|operatorSicil|OPERATOR_STATUS'`
  ana dal ağacında **hiçbir dosya** döndürmüyor.

Kalan kod farkı `git diff --stat 3fa8002 -- contract engine web recipes backend knowledge`:
`edit_locality_check.mjs` +79 · `spec-diff.mjs` +10. Başka hiçbir şey yok.

## 4. KAPANIŞ ÖLÇÜMÜ

- `bash engine/tests/vocab_reference_check.sh --tree .` → **`HUKUM: YESIL`**, `EXIT=0`,
  10432 (delta −6). Tam çıktı `GECE/log/V6-J.kapi.txt`.
- `bash engine/tests/vocab_reference_check.sh` (ctest'in koştuğu hâli, COMMIT'i ölçer)
  → **`HUKUM: YESIL`**, `EXIT=0`, commit `52777a1`, 10432 (delta −6).
  ⚠ Kapı `--tree` olmadan **commit'i** okur: bu yüzden commit ÖNCESİ ctest koşusunda
  `114 - vocab_reference_check` hâlâ FAIL basıyordu (ölçtüğü ağaç `3d8903c`'ti).
  Commit sonrası koşu aşağıdadır.
- `ctest --test-dir engine/build --output-on-failure` TAM koşu (271.31 sn),
  log `GECE/log/V6.ctest.final.txt`, `CTEST_EXIT=8`:
  **`95% tests passed, 6 tests failed out of 113`** — açılıştaki
  (`GECE/log/V6.ctest.opening.txt`) `95% tests passed, 6 tests failed out of 113`
  ile aynı yüzde, aynı sayı, aynı toplam.
  `114/114 Test #114: vocab_reference_check ... Passed 4.57 sec`.
  **KIRMIZI AD KÜMESİ BİREBİR AYNI (6 ad):**
  `flat_pattern_agree_check · flat_artifact_census · style_check ·
  sizechart_source_check · contract_check · figure_check`.
  Yeni kırmızı AD **0**, kapanan miras kırmızı **0** (hiçbirine dokunulmadı).

## 5. YAPILMAYAN / AÇIK

- `--baseline` **elle kesilmedi**, `vocab_reference_check.sh` **değiştirilmedi**
  (`git diff 3fa8002 -- engine/tests/vocab_reference_check.sh` BOŞ).
- Miras 6 kırmızıya dokunulmadı.
- `GECE/` altındaki hiçbir tutanak/log/kart silinmedi (kapı kapsamı dışı).
- Çıpa işinin ana dala nasıl döneceği bir KARAR: `DAMLA-KUYRUK.md` **K-V6A**.
