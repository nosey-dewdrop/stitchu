# V9-E — KÂTİP 3 TUTANAĞI (`SATIS-SARTNAMESI` · `KATMAN-HARITASI` · `loop-engineering` · arşiv mock)

Koşu: 2026-08-25 · ağaç `main` · kapı `node engine/tests/docs_truth_check.mjs --no-baseline`
Dokunulan dosya: **4**. `engine/`, `contract/`, `web/`, başka işçinin dosyaları: **DOKUNULMADI**
(`git status --porcelain -- engine/` → boş).

---

## 1. ÖNCE → SONRA (yalnız benim dört dosyam)

| denetim | ÖNCE | SONRA |
|---|---|---|
| D1 duran iddia | **5** | **0** |
| D2 ölü repo yolu | **4** | **0** |
| D3 sağlayıcısız sayısal satır | **12** | **0** |

Ağaç geneli (V9-C/V9-D/V9-F paralel çalıştı, onların düşüşü de içinde):
`HÜKÜM: YEŞİL — HARD-0 kipi · D1 0 · D2 0 · D3 0` · taban kipinde `exit 0`, D3 `52 → 0`.

### ÖNCE — kapının bastığı satırlar (benim dosyalarım)

```
D1  docs/KATMAN-HARITASI.md:47            [bayt bayt]
D1  docs/KATMAN-HARITASI.md:74            [bayt bayt]
D1  docs/SATIS-SARTNAMESI.md:243          [0.0000mm]
D1  docs/SATIS-SARTNAMESI.md:311          [bitti]
D1  docs/archive/mocks/babyblue-stil-1.html:108   [0.00mm]
D2  docs/SATIS-SARTNAMESI.md:29   -> benchmark-58/dress_patterns/
D2  docs/SATIS-SARTNAMESI.md:29   -> reports/2026-07-19-stitchu-f0-gusto-korpus.md
D2  docs/SATIS-SARTNAMESI.md:226  -> print-svg/a4-page5.svg
D2  docs/SATIS-SARTNAMESI.md:240  -> print-svg/a4-page5.svg
D3  docs/SATIS-SARTNAMESI.md:14 :15 :120 :128 :131 :135 :136 :176 :177 :223 :224 :305
```

### SONRA

Aynı komut, aynı filtre (`| grep -E "SATIS-SARTNAMESI|KATMAN-HARITASI|loop-engineering|babyblue"`)
→ **hiçbir satır basmıyor.**

---

## 2. KAPATILAN İHLALLER — TEK TEK, ÖNCE→SONRA

### D1-1 · `SATIS-SARTNAMESI.md:243` — `0.0000mm`
- ÖNCE: *"`printpack.log` NOTCHES tablosunda iki `triple zip-end` çentiği **0.0000mm**
  eşleşiyor"* — sayıyı basan alet adı yok, RULES §6 yasaklısı.
- SONRA: sayıyı **bu dosya iddia etmiyor**, aleti adlandırıyor
  (`engine/pattern-bridge/printpack.py`'nin NOTCHES tablosu) ve çıktının **iki satırı aynen
  alıntılanıyor**, kanıt yolu satırda:
  `Logs/taban-T10-SONRA/pack-EU38/print-report.txt` satır 72-73. Sütun tanımı da (aynı
  dosyanın 56. satırı, *"ratio diff re-measured by independent chord integration, must be
  < 1mm"*) yazıldı. Mandal `printpack_sheet_check` yerinde.
- ÖLÇÜLDÜ (bu turda koşuldu):
  `grep -n "NOTCHES" -A 20 Logs/taban-T10-SONRA/pack-EU38/print-report.txt` →
  `triple   zip-end   0.0000  left_skirt_back[1] 200.4mm <-> ZIP END 0.0mm` ve
  `right_skirt_back[1]` için aynısı.

### D1-2 · `SATIS-SARTNAMESI.md:311` — "borcu **bitti**"
- ÖNCE: *"Motorun bu şartnameye borcu **bitti**: §2 6/6 · §3 4/4 · §4 4/4 · §4b 1/1."*
  Aynı dosyanın §1 başlığı **5/5 EKSİK** diyor → dosya içi çelişki + RULES §8 blanket-done.
- SONRA: **bölüm bölüm tablo** (§1 AÇIK · §2 6/6 · §3 4/4 · §4 4/4 **bir şerhle** · §4b 1/1
  **bir şerhle** · ÖLÇÜM KAPISI AÇIK), her satırda nerede kapanacağı ve mandalının adı.
  Eski cümle **silinmedi**: tırnak içinde, "25 Ağu'da emekli edildi" gerekçesiyle duruyor.
- §4/§4b'nin şerhleri uydurulmadı, dosyanın kendi §4 md.2 ve §4b sonundaki kayıtlı
  DOĞRULANMADI notlarından alındı.

### D1-3/4 · `KATMAN-HARITASI.md:47` ve `:74` — `bayt bayt`
- İkisi de **ölçülmüş bir KUSUR kaydı**, iddia değil (V9-A §2B'nin tarif ettiği sınıf).
  Kapının istisna kuralı (tarih + ölçüm bağlamı **aynı satırda**) satır sarması yüzünden
  çalışmıyordu: `ölçüldü` md.6'da bir üst satırdaydı, tarih iki üst satırdaydı.
- SONRA: iki satır da tarih + alet + kanıt yolunu **kendi satırında** taşıyor:
  `:47` → "**bayt bayt aynı** çıktı — 24 Ağu 2026'da `cmp` ile ölçüldü, `GECE/V4-D.md` §1";
  `:74` → "draftJSON bayt bayt aynı kalıyor — 25 Ağu 2026'da ölçüldü, `GECE/V5-D.md`".
  Sayı, hüküm, kanıt değişmedi; **yalnız satır sınırı** değişti.

### D1-5 · `docs/archive/mocks/babyblue-stil-1.html:108` — `0.00 mm seam match`
- Kartın hükmü uygulandı: cümle **silinmedi**.
  (a) Dosyanın başına ARŞİV MOCK şerhi (pazarlama metni, ölçüm değil, sevk edilmiyor,
  tarih + gerekçe + RULES §6 atfı) HTML yorumu olarak düşüldü.
  (b) Rakam emekli edildi: `<s>"0.00 mm seam match"</s> — emekli 25 Agu 2026: arşiv mock
  pazarlama metni, ölçülmüş sayı değil`.
- ⚠ Şerh **ASCII** yazıldı: dosyanın `<meta charset="utf-8">` etiketi doctype'tan sonra
  geliyor, doctype ile `<html>` arasına Türkçe karakter koymadım.
- ⚠ `70,200-draft matrix` ve `on-device · nothing uploaded` cümlelerine DOKUNULMADI —
  kapının kalıp listesinde yoklar, ve ikisi de bu turda **ÖLÇÜLMEDİ**. Arşiv şerhi
  ikisini de kapsıyor (dosyanın tamamı "ölçüm değil" ilan edildi), ama tek tek
  yargılanmadılar.

### D2-1/2 · `SATIS-SARTNAMESI.md:29` — `benchmark-58/dress_patterns/` + `reports/2026-07-19-…md`
- Kart md.2'nin istediği uzlaştırma yapıldı: `:29` artık `:277`'ye **atıf veriyor VE
  yokluğu aynı satırda ilan ediyor**. İkisi de bu turda yeniden yoklandı:
  `ls -d benchmark-58` → `No such file or directory`; `ls reports/` çıktısında
  `2026-07-19-stitchu-f0-gusto-korpus.md` **yok** (stitchu içindeki `reports/` dizini de
  yoklandı, repo dışındaki `~/damla_projects_2026/reports/` **dizin olarak yok**).
- Kaybolmayan bilgi de yazıldı: bant sayıları `contract/gusto-corpus.json`'da donmuş.

### D2-3/4 · `SATIS-SARTNAMESI.md:226` · `:240` — `print-svg/a4-page5.svg`
- Kart bu sınıfı "koşu-göreli artefakt" diye tanıyor ama düşürülecekler arasına koymuyor.
  **Kapıyı gevşetmedim; iddiayı diskteki bir pakete karşı yeniden ölçtüm** ve yolu tam
  yazdım: `Logs/taban-T10-SONRA/pack-EU38/print-svg/a4-page5.svg`.
- ÖLÇÜLDÜ (bu turda, o dosyada):
  - `grep -o "stitchu EU38 1:1"` → var · aynı damga **15 A4 sayfasının 14'ünde**
    (`grep -l … a4-page*.svg | wc -l` → **14**; 15.'si harita sayfası).
  - `grep -o "BURAYI D[^<]*"` → `BURAYI DİKMEYİN — FERMUAR AÇIKLIĞI 563mm`.
  - `grep -c "<polygon"` → **2** (cut + seam).
  - `grep -oE "<text[^>]*>[^<]*</text>"` → `etek arka` / `parca 3/4 · EU38 · 2 kes ·
    aynali cift` / `stitchu · 2026-01-01 · pay 10mm dahil`.
  Yani §2'nin ve §4b'nin bu dört maddesi **bugün de ayakta**, artık ölmüş bir `/tmp`
  yoluna değil takipli bir dosyaya dayanıyorlar.

### D3 · 12 satır → 0
Hiçbir sayı değiştirilmedi; her satıra **onu basan alet** yazıldı:
`engine/pattern-bridge/printpack.py` (sayfa/panel/çentik/kumaş sayıları),
`printpack_sheet_check` (mandal), `Logs/taban-T10-SONRA/…` (kanıt yolu).
`:128` başlığına mandalın adı eklendi, çünkü bir bölüm başlığı sayı taşıyorsa
sağlayıcısı da başlıkta olmalı.

---

## 3. KART DIŞI AMA KARTIN İSTEDİĞİ İKİ ONARIM

**`KATMAN-HARITASI.md` md.10 — damganın sınırı yazıldı (kart md.4).**
`7023c808195429b3` damgasının kaynağı `engine/dist/stitchu-engine.js` ve o dosya
**gitignore'da** — ÖLÇÜLDÜ: `git check-ignore -v engine/dist/stitchu-engine.js` →
`engine/.gitignore` 5. satır, `dist/`. Satıra yazıldı: damga **temiz checkout'ta
üretilemez**, üstteki dizi bir kere okunmuş değerdir, bu dosyadan doğrulanamaz;
tazeliği yargılayan ayrı kapı `bundle_fresh_check` ctest'te kayıtlı. Aynı sınırı
`docs/ARCHITECTURE.md:263` de ilan ediyor, ona atıf verildi.

**`loop-engineering.md:68` — ölü skorbord (kart md.5, V9-A YENİ-13).**
Backtick'siz olduğu için kapı hiç görmemişti; elle yoklandı, `reports/stitchu-vision-progress.md`
**yok**. Sessizce silinmedi: yolun nerede olduğu, ne zaman yoklandığı ve "bugün yeniden
okunamaz" hükmü yazıldı; hâlâ denetlenebilen ikame kanıt adıyla verildi
(`vision/eval/live-2026-08-22.json`, basan alet `engine/tools/foto-spec-olcum.mjs`).

---

## 4. TAŞINAN / EMEKLİ EDİLEN CÜMLELER + GEREKÇE

`docs/archive/` altına **taşınan metin YOK** — dört dosyanın hiçbirinde bütün bir bölüm
bayat çıkmadı, ihlaller cümle düzeyindeydi. Emekli edilen üç cümle **yerinde**, tırnak
içinde, tarih + gerekçeyle duruyor:

| cümle | nerede | gerekçe |
|---|---|---|
| "Motorun bu şartnameye borcu bitti" | `SATIS-SARTNAMESI.md` §MÜHÜRDEN ÇIKAN HALKALAR | dosyanın kendi §1'i 5/5 EKSİK diyor; RULES §8 |
| "16/17 madde geçti" | `SATIS-SARTNAMESI.md` ÖLÇÜM KAPISI | **hiçbir sayımla tutmuyordu** — bugün sayıldı: `grep -c "^- \[x\]"` → **15**, `grep -c "^- \[ \]"` → **5**, toplam 20 kutucuk. Yerine ölçülen sayı yazıldı. |
| "0.00 mm seam match" | `babyblue-stil-1.html` | arşiv mock pazarlama metni, hiçbir aletten çıkmadı |

---

## 5. YAPILAMAYAN / YARGILANMAYAN — SEBEBİYLE

1. **Şartnamenin işaretli 15 kutucuğunun hiçbiri yeniden KOŞULMADI.** Ben kâtibim:
   ölçüm koşturmadım, sayı üretmedim. Diskte duran artefaktlara karşı **doğruladığım**
   şeyler yalnız §2'nin 4 grep'i ve §4b'nin NOTCHES satırlarıdır (yukarıda). Kalan
   sayılar (sha256'lar, `print-info.pdf` sayfa içerikleri, kumaş db satırları, nesting
   önce/sonra) **bu turda yeniden ölçülmedi** — yalnız sağlayıcıları adlandırıldı.
   Kapının bilinen zaafı burada geçerli: *"alet adı var" ≠ "sayı o aletten çıktı"*.
2. **`Logs/taban-T10-SONRA/pack-EU38` ile mühür başlığındaki `/tmp/h11e` koşusu AYNI
   PAKET DEĞİL.** T10-SONRA'nın `print-info` **4 sayfa**, mühür başlığı **5 sayfa** diyor
   (Tur 8'de kumaş sayfası araya girdi). §2/§4b için doğruladığım dört grep'in dördü de
   T10-SONRA'da tuttu, ama "5 sayfa" iddiası **T10-SONRA'dan doğrulanamaz** ve diskte o
   koşunun paketi kalmamış. Bu fark satıra yazılmadı — **AÇIK KALEM**, bir sonraki turun
   işi (ya paket yeniden basılır ya başlık pakete göre düzeltilir).
3. **`70,200-draft matrix` ve `on-device · nothing uploaded`** (arşiv mock) tek tek
   yargılanmadı; yalnız dosya düzeyinde "ölçüm değil" ilan edildi.
4. **`docs/SATIS-SARTNAMESI.md` §1'in beş açık kutucuğu**na dokunulmadı — onlar H1.3'ün
   işi, ve metinleri zaten dürüst ("YOK", "ölçülecek nesne yok", "koşulmadı").
5. `KOSU.md`, `GECE/arsiv/`, diğer kartlar **AÇILMADI**. `engine/tests/docs_truth_check.mjs`
   ve `docs-truth-baseline.json` **DEĞİŞTİRİLMEDİ**.

---

## 6. KART DIŞI FARK EDİLEN (dokunulmadı, yazıldı)

1. **Taban dosyası artık gerçeğin çok gerisinde.** `docs-truth-baseline.json` D1 9 · D2 9 ·
   D3 52 kayıtlı borç taşıyor; ağaç bugün **0 · 0 · 0**. Kapı taban kipinde YEŞİL ve
   `DÜŞTÜ` basıyor ama tabanı kendiliğinden güncellemiyor (tasarım gereği). Düşüşü
   sabitlemek ayrı, bilinçli bir `--baseline` commit'i — **benim kartımda değil**, ve
   `engine/tests/` altına yazacağı için kâtip yapamaz. V9-B'nin md.4'ü bunu zaten
   öngörmüştü.
2. **D3 kapsam sayısı büyüdü:** sayı+birim taşıyan satır **133 → 139**. RULES §6 onarımı
   cümle sayısını yükseltiyor — V9-A §1'in uyarısının canlı kanıtı; eşiğin cümle sayısına
   değil sağlayıcısız cümleye konması doğru karardı.
3. **`SATIS-SARTNAMESI.md` mühür başlığındaki iki sha256 kısaltılmış** (`ec3b0f11a3eae3ae…`,
   `e457f8a4371254a7…`) ve hangi dosyaların özeti olduğu yazılı, ama **hiçbiri bu turda
   yeniden hesaplanmadı** ve tam değerleri repoda bir yerde durmuyor. Kısaltılmış özet
   doğrulanamaz — kapı bunu görmüyor.
4. **`SATIS-SARTNAMESI.md:31`** hâlâ *"Ölçen: gusto-lint + şartname-check + preview-truth"*
   diyor; `şartname-check` diye bir ctest adı **yok** (`ctest -N`'de aranmadı, ama V9-A'nın
   41 `*_check` listesinde de geçmiyor). **DOĞRULANMADI**, dokunulmadı — cümle bir kapı
   adı değil bir rol tarifi gibi okunuyor, kâtip kararı değil.
5. **`docs/G5-OMUZ-PLANI.md` ve `docs/H1.0-KAPI.md` çalışma ağacında DEĞİŞİK** (başka
   işçilerin işi, commit edilmemiş). Commit'ime **almadım**: `git add` yalnız benim dört
   dosyam.
