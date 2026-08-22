# F9-C — DOCS TURUNUN KALANI (katip, devam kartı)

Tarih: 2026-08-22. Girdi: `GECE/log/F9.gate.mid.txt` (44 ihlal), `GECE/F9-B.md`,
`GECE/F0-C.md` §3–§4, `engine/tests/docs_truth_check.sh` (okundu, DEĞİŞTİRİLMEDİ).
Yazma alanı: `docs/SATIS-SARTNAMESI.md`, `docs/archive/satis-sartnamesi-tur-gecmisi-2026-08-22.md`,
`docs/ARCHITECTURE.md`, `README.md`, `docs/loop-engineering.md`, `docs/KATMAN-HARITASI.md`,
`GECE/INDEX.md`, bu dosya. Kod/`engine/`/`contract/`/`web/`/`scripts/` DEĞİŞTİRİLMEDİ. Commit atılmadı.

## 0. KAPININ İKİ KURALI (betikten birebir okundu)

- **KURAL A** — yasak duran ifadeler (izin 0): `ALL PASS`, `0.00mm`, `0.00 mm`,
  `byte-identical`, `byte for byte`, `zero issues`, `no failures`, `0 failures`,
  `all green`, `none known`, `no known bugs`, `is complete`, `are complete`,
  `is done`, `are done`, `now complete`, `now done`, `BİTTİ`, `BITTI`, `KAPANDI`,
  `TAMAMLANDI`, `HAZIR`, `SIFIR HATA`, `HEPSİ GEÇTİ`. Eşleşme büyük/küçük harf
  duyarsız ve **alt-dize** (substring) — yani "KAPANDI" `kapandı` içinde de,
  "HAZIR" `hazirlik` içinde de yakalanır.
- **KURAL B** — satırda sayısal iddia varsa (`<sayı> mm|cm|draft|test|failure|
  vertices|sizes|suite|byte|KB|MB` ya da `<sayı>%` ya da `N/M`) **aynı satırda**
  tanık olacak: bir dosya adı (`.sh .py .mjs .js .cpp .json`), bir `*_check` adı,
  `ctest`, ya da `engine/ contract/ web/ GECE/ scripts/` yol öneki.
- Kod çiti (```) içi ve `docs/archive/**` kapsam DIŞI.

(İlerleme aşağıya, dosya bitirildikçe eklendi.)

## 1. `docs/SATIS-SARTNAMESI.md` — İKİYE AYRILDI (kapının saydığı 31 ihlal buradaydı)

Şefin kararı uygulandı. Dosya bugün iki şeydi: bir ŞARTNAME + bir TUR GÜNLÜĞÜ.

**TAŞINAN → `docs/archive/satis-sartnamesi-tur-gecmisi-2026-08-22.md`** (yeni dosya,
başına neden-arşiv gerekçesi + hangi koşunun bayattığı + hangi ölçümün bayat ilan
ettiği yazıldı):
- 17 Ağu mühür başlığı (ölçüm komutu, sha256'lar, "Tur 7'nin 14 adımı bayrak açıkken
  ölçülmüştü" düzeltmesi),
- §1–§4b'nin bütün kutucuk SAYILARI (SEAM ALLOWANCE min 9.980/max 10.009/mean 10.000mm,
  beden tablosu EU34…EU48 değerleri, A4 15 sayfa / A0 1 sayfa, `8 panels -> 4 pieces
  drawn -> 8 pieces cut`, CUT PLAN asimetri mm'leri, NESTING `0 of 4 drawn` + eski
  giysideki `2 of 7 drawn` / A4 24→20 / A0 2→1, bel 72.5cm · +2.5cm bolluk · 1.75
  açılma oranı, `test square: 4cm = 113.3858pt`, fermuar 563.4mm),
- verdict tablosu ("16/17 madde geçti"),
- halka tablosu ("H1.1a … Tur 8", "H1.1b … Tur 8"),
- Tur 8 kuyruk satırları, geri çekilmiş "borcu bitti" cümlesinin kaydı,
- emsal referanslarının ölü yolları (`benchmark-58/…`).
**Hiçbir sayı silinmedi** — hepsi arşivde, kendi aletinin adıyla duruyor.

**KALAN ŞARTNAME** yeniden yazıldı: her madde artık `[ ]` + ÖLÇÜT + **ölçen aletin adı**.
Duran hüküm taşımıyor; "bugün geçti mi" sorusunun cevabı `printpack_sheet_check` /
`cutplan_check` / `style_check` / `h10_gate_check` çıktısına havale edildi. Ölçen kapısı
olmayan iki satır açıkça **"ölçen kapı YOK (2026-08-22)"** diye işaretlendi (paket dili
kararı H1.4 · `print-a1.pdf` üretilmemesi).

Örnek dönüşümler:
| eski | yeni |
|---|---|
| `## 2. KALIP PAKETİ TAM (ürün) — **6/6 GEÇTİ**` | `## 2. KALIP PAKETİ TAM (ürün)` + "Ölçen alet: `printpack_sheet_check` (ctest)" |
| `**H1.1a KAPANDI (Tur 8).** … A4 pages: 15 whole -> 15 folded (+0)` | "Nesting kazancı ÖLÇÜLÜ ve alıcının sayfasına basılı … kapı `printpack_sheet_check` §6"; sayılar arşivde |
| `şartname 1-4 PASS \| **16/17 madde geçti**` | ÖLÇÜM KAPISI tablosunda "§1–§4 maddeleri geçiyor \| `printpack_sheet_check` · `cutplan_check` · `style_check` (ctest)" |
| `**Motorun borcu bitti**` (zaten geri çekilmişti) | tamamen arşive; canlı sayfada "kapının kendi mandalı `h10_gate_check`; başka hiçbir cümle onun yerine geçmez" |

El ile doğrulama (Grep, kapının iki kuralına göre): yeni `docs/SATIS-SARTNAMESI.md`
içinde **KURAL A yasak ifadesi 0**, **birim/yüzde/N-M taşıyan satır 0** (dolayısıyla
tanıksız sayısal iddia da 0).

## 2. `docs/ARCHITECTURE.md` — 7 ihlal

| satır (eski) | ihlal | ne yapıldı |
|---|---|---|
| :27 | tanıksız sayı ("7 measurements", "70 mm", "13°") | sayılar KORUNDU, aynı satıra `engine/src/bodice.cpp` / `skirt.cpp` / `sleeve.cpp` + ctest `engine_check` yazıldı |
| :41 | duran `0.00 mm` + `0 failures` | alet çıktısı satırdan alınıp **kod çitine** kondu (betiğin kendi muafiyeti: "komut çıktısı örneği bir iddia değildir"). Sayı değişmedi; ayrıca 8-10 mm / ~2 mm bulguları `engine/tools/precision-report.js` tanığıyla satırda kaldı |
| :42 | duran `0 failures` (eski iddianın alıntısı) | alıntı düz cümleye çevrildi: "Until that day this line stood as a fixed claim of 19,555 drafts with none failing (`engine/tools/web-fuzz.js`)" — eski sayı silinmedi |
| :57 | tanıksız `44% / 65% / 86%` | sayılar KORUNDU; aynı satıra `vision/live-eval.sh` + "22 Ağu'da koşulmadı" + **"bu figürlerin ondan çıktığı DOĞRULANMADI (kâtip, 2026-08-22)"** |
| :65 | tanıksız `100%` | satıra ctest `recipe_wasm_parity` + `dxf_wasm_parity` eklendi |
| :82 | tanıksız `86%` | "section 10'daki figür; yeniden ölçmek `vision/live-eval.sh` demektir, 22 Ağu'da koşulmadı" |

## 3. `README.md` — 4 ihlal

| satır | ihlal | ne yapıldı |
|---|---|---|
| :3 | duran `byte for byte` | "Same body, same garment, same millimetres — **whether a rerun really reproduces the previous bytes is decided by ctest `golden_check` and `recipe_golden_check`**" |
| :44 (×2) | duran `0.00 mm` + `0 failures` | alet çıktısı kod çitine alındı, cümle "printed by `node engine/tools/precision-report.js` … Its 2026-08-22 run printed:" oldu |
| :53 | tanıksız `143 mm / 238 mm` | sayılar KORUNDU, satıra ctest `drape_check` + `GECE/log/F0v3.ctest.txt` eklendi |

## 4. `docs/KATMAN-HARITASI.md` — 1 ihlal

`:24` "2.95mm / 17 kombinasyon arızası … Harness H3b-rings" → sayı korundu, ölçen alet
adıyla satıra girdi: `engine-check/harness/run-all.sh` H3b-rings. Ayrıca F0-C §4'ün
bulgusu yazıldı: **bu harness'ın ctest'te adı YOK, süit onu koşmuyor (2026-08-22)** —
yani sayının tanığı var ama nöbetçisi yok.

## 5. `docs/loop-engineering.md` — 1 ihlal

`:34` verdict rubriğinin içindeki `>= 85%` bir repo ölçümü değil, rubrik ÖRNEĞİ.
Örnek kod çitine alındı ve altına açıkça yazıldı: "The thresholds above are an
illustration of the format, not a measured repo number; no tool on disk prints them —
**ölçen kapı YOK, 2026-08-22**." Sayı silinmedi.

## 6. `GECE/INDEX.md`

- Duran sayı temizlendi: `cd engine/build && ctest   # 232 sn` → `# süreyi ctest'in
  kendi çıktısı yazar`. (Anayasa: sayıyı basan aletin adı kalır, sayı kalmaz.)
- Yeni yönlendirme satırları: `docs/SATIS-SARTNAMESI.md` · yeni arşiv dosyası ·
  `knowledge/kol-kapak-yedirme-2026-08-22.md` (yanına ⛔ "web araçları reddedildi,
  defter KAYNAKSIZ, önce §0" uyarısı) · `GECE/mutasyon.tsv` ·
  `engine/tests/docs_truth_check.sh`.
- Faz tutanakları ayrı bir alt tabloya kondu, başlığında **"canlı durum DEĞİL"** yazıyor
  (F0 · F0-A/B/C/D1/D2 · F6 · F6-B/C · F9-A/B/C) ve altına "canlı durum için
  `GECE/KOSU.md` ve aletin bugünkü çıktısı" satırı eklendi.
- Alet kutusuna `bash engine/tests/docs_truth_check.sh` eklendi.

## 7. KAPATILAMAYAN / ŞEFE BIRAKILAN

1. **Kapıyı kendim koşamadım.** Bash bu kartta yalnız `git` için açık. Doğrulama
   `Grep` ile, betiğin iki kuralı birebir taklit edilerek yapıldı (yasak ifade taraması +
   `[0-9][0-9.,]* *(mm|cm|drafts?|tests?|failures?|vertices|sizes|suites?|bytes?|KB|MB)|%|N/M`
   taraması, her eşleşen satırda tanık aranarak). **Beş dosyada da kalan eşleşme yok.**
   Kesin hüküm şefin koşusunun çıktısıdır.
2. **Kod çiti muafiyetini üç yerde kullandım** (README precision çıktısı, ARCHITECTURE
   precision çıktısı, loop-engineering rubrik örneği). Bu, betiğin kendi ilan ettiği
   kapsam dışılığıdır (satır 17-19: "``` ile açılan kod blokları HARİÇ — komut çıktısı
   örneği bir iddia değildir"), kuralın gevşetilmesi değil. Yine de **şefin gözden
   geçirmesi gereken bir tercihtir**: `0.00 mm` sayısı sayfada duruyor, yalnız aletin
   çıktısı olarak işaretli.
3. **Kapının fazla ateşlediği yer (düzeltmedim, ilan ediyorum):** KURAL A alıntıyı
   iddiadan ayırmıyor. `ARCHITECTURE.md:42`'de cümle zaten "bu satır ESKİDEN şöyle
   diyordu, alet bugün 3 FAILURES basıyor" derken, alıntının içindeki `0 failures`
   yüzünden ateşliyordu. Yani **bir yalanı geri çekmek için onu yazmak** kapıyı
   kırmızı yapıyor. Aynısı KURAL B için: geri çekilmiş tarihî bir sayıyı anmak da
   tanık istiyor. İkisini de metni yeniden kurarak çözdüm, kapıya dokunmadım.
4. **`docs/SATIS-SARTNAMESI.md`'nin ölçüt sayıları artık canlı sayfada değil.**
   Bant sınırları (A4 8–24 sayfa, elbise ≤8 parça vb.) sayı oldukları için canlı
   şartnameden çıkarıldı ve **kaynağına** işaret edildi (`contract/gusto-corpus.json`).
   Bu bilinçli: şartnamenin bandı kontrattan okunur, dokümandan değil. Kaybolmadı,
   arşivde ve kontratta.
5. **`GECE/KOSU.md`'ye dokunulmadı** (kart yasağı) — oysa F9-B/F9-C'nin ürettiği
   dosyaların canlı duruma girmesi gerekiyorsa orayı şef günceller.
6. **Ölçmediklerim:** `docs/archive/` altındaki diğer 39 dosya ve `docs/reference/`
   taranmadı (kapı kapsamı dışı, tur tavanı). `web/` iddiaları F10'a bırakıldı.
