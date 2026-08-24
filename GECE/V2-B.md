# V2-B — İKİ SÖZLÜK KAPISI ctest'E BAĞLANDI

Kart: `GECE/KART/V2-B2-kapilari-bitir.md` (önceki kart `GECE/KART/V2-B-iki-kapi.md`).
Koşu: 2026-08-24. Bu dosyanın her sayısının yanında onu basan komut yazılı.
Ham loglar: `GECE/log/V2-B.bostest.source.txt` · `GECE/log/V2-B.bostest.ratchet.txt` ·
`GECE/log/V2-B.mutasyon.txt` · `GECE/log/V2-B.ctest.after.txt`.

---

## 0. NE OLDU — TEK CÜMLE

`6fac6cb`'de yarım bırakılan dört dosya okundu, koşuldu, iki yerinden düzeltildi ve
**ikisi de ctest'e bağlandı**: `vocab_source_check` (#107) ve `vocab_reference_check`
(#108), ikisi de YEŞİL, miras kırmızı AD kümesi büyümedi (4 → 4).

---

## 1. `vocab_source_check` — GÖRÜ KELİME LİSTESİ ARTIK BİR BUILD ÜRÜNÜ

`vision-student/vocab.py` "The classes MUST stay identical to the teacher schema"
cümlesiyle açılıyordu ve o cümleyi denetleyen hiçbir şey yoktu. Kartın saydığı üç
sapmanın üçü de kapandı; ölçüm `engine/vocab.json` (otorite, `GECE/V2-R.md` §3.3)
ve `contract/vocab-resolution-v1.json` (Katman 3→1) karşısında:

| eksen | elle yazılmış hâli | üretilmiş hâli | komut |
|---|---|---|---|
| `neckline` | 7 (`cowl`, `pussyBow` YOK) | **9** | `grep -n NECKLINE_CLASSES vision-student/vocab.py` |
| `garment` | `["skirt","dress","top","trousers","other"]` | **`["skirt","dress","top"]`** | aynı |
| `skirtStyle` | 5 (`gore` YOK) | **6** | aynı |
| `sleeveLength` | 3 | 3 (değişmedi) | aynı |

`trousers` ve `other` **SİLİNMEDİ** (RULES değişmez 1): hiçbir eksende ve çözüm
tablosunda karşılıkları olmadığı için `_UNRESOLVED` bloğuna gerekçeleriyle düştüler,
ve kapı o bloğu ÜRETEÇTEN BAĞIMSIZ olarak iki JSON tablosundan yeniden türetip
denetliyor (`vocab_source_check.sh` adım 4).

Dışarı verilen isimler korundu — `vision-student/` altında 8 dosya bu modülden import
ediyor (`grep -rn "from vocab import" vision-student/*.py` → 8 satır: `calibrate_cascade`,
`dataset`, `export_onnx`, `eval_agreement`, `test_onnx_load`, `train_field`,
`train_neckline`, `train_val_run`); `NECKLINE_CLASSES`, `GARMENT_CLASSES`,
`SLEEVE_LENGTH_CLASSES`, `SKIRT_STYLE_CLASSES`, `FIELDS`, `UNCERTAIN_VALUES`,
`classes_for`, `label_to_index` hepsi yerinde.

⚠ **SONUCU OLAN BİR YAN ETKİ (onarılmadı, kart dışı):** `NECKLINE_CLASSES` 7 → 9
büyüdü. İlk yedi kelimenin SIRASI değişmedi (üreteç `engine/vocab.json` ilan sırasını
koruyor, `cowl`/`pussyBow` sona eklendi), yani eski etiketlerin indeksleri kaymadı —
ama 7 çıkışlı eğitilmiş bir kafa artık sınıf sayısıyla uyuşmaz. Aynısı `skirtStyle`
5 → 6 için geçerli. Yeniden eğitim gerekip gerekmediği **KARARA BAĞLANMADI.**

## 2. `vocab_reference_check` — RATCHET

Sınıf: PHPStan / Android-lint tabanı, betterer snapshot'ı DEĞİL (`GECE/V2-R.md` §2.1).
Sayım yöntemi `GECE/V0-0D.md` §3'ün kanonik DAR kapsam grep'i; `"none"` kirliliği
uyarısı uygulandı, yani **değer sayımı yalnız PAYLASIM=1 kelimeler için** yapılıyor.

Taban dosyası `engine/tests/vocab-reference-baseline.json`:

```
taban commit  b799748  ·  toplam 10416  ·  eksen ADI 7575  ·  enum DEĞERİ 2841
eksen sayısı  37       ·  PAYLASIM=1 kelime 92
komut: engine/tests/vocab_reference_check.sh --baseline b799748
```

Hem taban hem bugünün sayısı ayrı bir `git worktree`'de, commit'li ağaçta okunuyor
(k8s `hack/lib/verify-generated.sh` deseni, §2.2b) — ratchet'in birimi COMMIT.

### 2.1 ⚠ KARTLA ÇELİŞKİ: TABAN `a6b473a` DEĞİL

Kart tabanı `a6b473a`'te SABİT ilan etti. Ölçüldü, o taban **kesildiği gün kırmızı**:

```
engine/tests/vocab_reference_check.sh --baseline a6b473a && engine/tests/vocab_reference_check.sh
-> taban toplam 10349 · bugün toplam 10416 (delta +67) · HUKUM: FAIL (32 artan, 0 yeni)
```

Sözlük BÜYÜMEDİ: `git diff --stat a6b473a..b799748 -- engine/vocab.json` → **boş diff**,
hâlâ 37 eksen / 132 değer. 67 satırın tamamı üç dosyaya yazıldı ve toplam TAM tutuyor
(`GECE/log/V2-B.bostest.ratchet.txt` bölüm B, komut logda):

```
contract/vocab-resolution-v1.json  +25   V2-A (e5c9628), sicil kalemleri
contract/garment-spec-v2.md        +25   V2-A (e5c9628), menü hakkında DÜZ METİN
engine/tools/gen-vision-vocab.mjs  +17   BU kart, üretecin yorum satırları
TOPLAM                             +67
```

Kesildiği gün kırmızı olan bir taban ratchet değil, kapatılmış testtir — bu repo o
hatayı bir kez yaşadı (`preview_truth_check`/`figure_check` haftalarca "önceden kırık"
diye geçildi, CLAUDE.md KOŞU 2). Kart "kapı yeşilse ekle, değilse EKLEME" diyor; iki
şart aynı anda tutmuyor. **Seçilen yol:** taban inişin yapıldığı commit'te (`b799748`)
yeniden kesildi, `a6b473a`'nin 10349'u ve +67'nin dosya dosya dağılımı hem taban
dosyasının `_yasa`'sına hem kapının başlık yorumuna yazıldı. Sayı kaybolmadı, hüküm
değişti. **Bu kartın karardan sapan tek kalemidir ve gizlenmedi.**

### 2.2 BİLİNEN GÜRÜLTÜ (bilerek onarılmadı)

İmza düz metni de sayıyor: 67'nin 25'i `contract/` içindeki bir markdown dosyasından
geldi. Sayım yöntemi V0-0D §3'ün grep'inin AYNISI bırakıldı; değiştirmek elimizdeki tek
ölçümle kıyaslanabilirliği yok ederdi (detekt'in "kararlı imza" şartı, §2.1).

### 2.3 ÖLÇÜLÜP DÜZELTİLEN İKİNCİ KUSUR: `.rabadon/` KAPSAM İÇİNDEYDİ

`--tree .` (çalışma ağacını commit öncesi denetleme yolu) temiz bir ağaçta **+12**
basıyordu. On iki satırın tamamı gitignore'lu `.rabadon/` oturum dökümlerindendi ve o
dizinler `backend/`, `engine/src/`, `engine/pattern-bridge/` **İÇİNDE** duruyor.
Sınıfları `Logs/`+`reports/` ile aynı (kelimenin kendisi değil, dökümü), V0-0D onları
zaten kapsam dışı bırakıyor. `EXCL`'e `.rabadon` ve `.wrangler` eklendi.
**Commit tarafı hiç kımıldamadı** — git o yolları checkout etmiyor; taban yeniden
kesildi ve `10416 -> 10416`, `eksenAdi` ve `enumDegeri` sözlükleri bayt-aynı çıktı
(komut ve çıktı: `GECE/log/V2-B.mutasyon.txt` M2-önce başlığı).

Ayrıca `--baseline`'ın sessiz `a6b473a` varsayılanı kaldırıldı: tabanı yeniden kesmek
bilinçli bir eylemdir, varsayılan onu kazara bir yere sabitler.

---

## 3. ZORUNLU KANIT

### 3.1 BOŞ TEST (4.2) — her iki kapı da faz-öncesi durumda KIRMIZI

| kapı | koşul | komut | sonuç |
|---|---|---|---|
| `vocab_source_check` | bugünkü ELLE yazılmış `vision-student/vocab.py` (git HEAD, 55 satır) | `engine/tests/vocab_source_check.sh` | **EXIT=1**, `HUKUM FAIL (2)`, 9 audit FAIL + tam diff |
| `vocab_reference_check` | taban bir eksik referansla kuruldu (`eksenAdi.garment` 1172 → 1171), ağaç değişmedi | `engine/tests/vocab_reference_check.sh` | **EXIT=1**, `FAIL ARTTI eksen ADI garment 1171 -> 1172 (+1)` |
| `vocab_reference_check` | taban dosyası hiç yok | `mv taban /tmp; engine/tests/vocab_reference_check.sh` | **EXIT=1**, "a missing law is never a pass" |

Loglar: `GECE/log/V2-B.bostest.source.txt`, `GECE/log/V2-B.bostest.ratchet.txt`.

### 3.2 MUTASYON (4.5) — `GECE/log/V2-B.mutasyon.txt`

| # | kapı | kasıtlı bozma | mutasyonlu | geri alınca |
|---|---|---|---|---|
| M1a | `vocab_source_check` | `vision-student/vocab.py`'a ELLE `"trousers"` eklendi | **EXIT=1** (4 audit FAIL, "in BOTH FIELDS and _UNRESOLVED") | **EXIT=0** |
| M1b | `vocab_source_check` | üretecin `FOREIGN` listesine ÇÖZÜLEBİLİR bir kelime (`neckline.cowl`) eklendi, dosya YENİDEN ÜRETİLDİ (adım 3 diff'i tertemiz) | **EXIT=1** — adım 4 yakaladı: "`_UNRESOLVED['neckline.cowl']` is resolvable today" | **EXIT=0** |
| M2 | `vocab_reference_check` | `engine/tools/gen-vision-vocab.mjs`'e `neckline` ekseni + `"cowl"` değeri geçen tek satır yorum | **EXIT=1** — `neckline 991 -> 992`, `cowl 14 -> 15` | **EXIT=0** (hem `--tree .` hem HEAD yolu) |

M1b, kartın istediğinin bir fazlasıdır ve gerekçesi kapının içinde yazılı: adım 3 tek
başına ÜRETECİN YALANIYLA geçilebilir, çünkü diff'in iki tarafını da üreteç yazar.

### 3.3 ctest TAM KOŞUSU — `GECE/log/V2-B.ctest.after.txt`

```
ctest --test-dir engine/build --output-on-failure
96% tests passed, 4 tests failed out of 107     (Total Test time 276.32 sec)
Test #107: vocab_source_check ....... Passed  0.13 sec
Test #108: vocab_reference_check .... Passed  4.79 sec
FAILED: style_check · sizechart_source_check · contract_check · figure_check
```

Faz öncesi (`GECE/log/V2.ctest.before.txt`): `96% tests passed, 4 tests failed out of 105`,
kırmızı AD kümesi **birebir aynı dört ad**. RULES 9 tutuyor: küme büyümedi, koşan test
105 → 107 (iki yeni kapı). `h10_gate_check` her iki koşuda da Disabled.

---

## 4. DOSYA PAYI (§7.5)

Yeni kaynak dosya yaratılmadı: pay `6fac6cb`'nin dört dosyasıyla doldu
(`vocab_reference_check.sh`, `vocab-reference-baseline.json`, `vocab_source_check.sh`,
`gen-vision-vocab.mjs`). Bu koşu onları düzeltti, `vision-student/vocab.py`'ı üretti,
`engine/CMakeLists.txt`'e iki `add_test` satırı ekledi ve bu tutanağı yazdı.

## 5. KART DIŞI FARK EDİLENLER (DOKUNULMADI)

1. `contract/garment-spec-v2.md` ratchet kapsamının içinde bir DÜZ METİN dosyası ve
   tek başına +25 referans getirdi. Kapsam kararı V0-0D'nin; değiştirilmedi.
2. `engine/tests/` ratchet kapsamının DIŞINDA — yani kapının kendi dosyaları kendi
   sayısını hiç etkilemiyor. Bu kazara doğru çıktı, ilan edilmiş bir tasarım değil.
3. Ratchet ctest içinde `git worktree add` çağırıyor (4.79 sn). Paralel bir git
   işlemiyle kilit çakışması **DOĞRULANMADI**; bu koşuda olmadı.
4. `patterns_real/BUGRA-DEFTER.md`, `patterns_real/geometry/`,
   `patterns_real/tools/bugra-geometry-2026-07-23.json` bu koşu BAŞLARKEN takipsizdi ve
   öyle bırakıldı — bu kartın çıktısı değiller. CLAUDE.md `patterns_real/`'ı "gitignore,
   ASLA push" diye anıyor ama bu üç yol `git status`'ta `??` (yok sayılmış değil) görünüyor.
