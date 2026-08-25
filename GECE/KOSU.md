# KOSU.md — v6 gece koşusu (24-25 Ağu 2026)

Protokol: GECE-KOSUSU-v6.md. Eski v5 koşusunun kayıtları GECE/arsiv/ altındadır
ve bu koşuda kanıt DEĞİLDİR.

## ŞU AN
Faz: **V9 KAPANDI** (DOCS — `docs/` + `README.md` bugünkü koda doğrultuldu,
`docs_truth_check` kuruldu). Sıradaki **V10 (landing)**, sonra V11.
HEAD'de 6 kırmızı (miras), **115 test**. Hakem **GEÇTİ** dedi (`GECE/KAPI.md`
`5885b80`) ve aynı turda kapının TAŞINAMAZ olduğunu buldu → `f3bd10b` +
`f4b5235` ile kökünden onarıldı, iki bağımsız kanıtla.

## KAPANMIŞ FAZLAR (tutanaklar `GECE/V0..V9.md`)
**V0** 7 kart · **V1** 5 kart, hakem önce KALDI, kırmızı 6→4 · **V2** 105→108 ·
**V3** 6 kart, flat konturu ÇİZİLMİYOR `GarmentSurf`'ten HESAPLANIYOR 108→110 ·
**V4** 7 kart 110→111 · **V5** 12 kart 111→113 · **V6** 10 kart 113→113 ·
**V7** 9 kart (kol, kenar kimliği) 113→114 · **V8 KOŞMADI (atlandı)** ·
**V9** 10 kart (R·A·B·B2·B3·C·D·E·F·G) 114→115. V5/V6/V7/V9'da ad kümesi birebir.

## AÇIK KIRMIZILAR (6 — V9 hiçbirine dokunmadı, kâtip koda dokunamaz)
1. `style_check` — `engine/STYLE-PIN` diskte YOK · kapsam **0/31** · 32 kez GÖZ
2. `sizechart_source_check` — 7 kolonun **4'ü UNSOURCED**; aday AT (V5:
   `body.shoulder` 20→80cm'de geometri BAYT AYNI = **ÖLÜ GİRDİ**)
3. `contract_check` — **41** takipli telifli dosya · aday untrack → GREEN exit 0,
   Damla kararı. ⚠ Kapı metni "49" diyor, saydığı **41**
4. `figure_check` — tek `fittedBand` · ⚠ V4+V5+V6+V7'ye yazıldı, DÖRDÜNDE DE
   KESİLMEDİ; V9 kâtip fazı olduğu için kart olamadı
5. `flat_pattern_agree_check` — `body_length` −%3.7979 (tol %1.5) + UNMEASURED
   3/6. KÖK: strapless = G5
6. `flat_artifact_census` — sınıf 3, 2 nokta, **20.5602° > 1°**, belde. KÖK:
   `surfacepattern.cpp:71-81` — ⚠ o dosya SEVK EDİLMİYOR

## DEVİR ÜÇ SAYI (V10'a) — V9 şefi kendi ölçtü
1. **KIRMIZI = 6 · TEST = 115.** Açılış `GECE/log/V9.ctest.opening.txt`
   (114/6, 274.01 sn, `a6689ef`), kapanış `GECE/log/V9.ctest.final.txt`
   (115/6, 271.98 sn). **AD kümesi birebir**; hakem bağımsız `diff` aldı.
   116. tanımlı test `h10_gate_check` **(Disabled)** — kırmızı değil, KOŞMUYOR
2. **SÖZLÜK TABANI = 10438 @ `495d58a` · bugün 10432 (−6, tabanın ALTINDA),
   YEŞİL.** `bash engine/tests/vocab_reference_check.sh`. Yalnız DÜŞEBİLİR
3. **YENİ KİLİTLİ TABAN — docs doğruluğu** (`docs_truth_check`, Test #116):
   **D1 duran-iddia 0 · D2 ölü repo yolu 0 · D3 sağlayıcısız sayı 0 / 140.**
   Kapsam `docs/**` + `README.md`. Taban `engine/tests/docs-truth-baseline.json`,
   yalnız DÜŞEBİLİR. ★ **TAŞINABİLİR**: temiz worktree ile çalışma dizini bit
   bit aynı hükmü veriyor (`GECE/log/V9-B3.kanit.txt`). Bilinen zaaf 4 madde

## ★ FOTO→SPEC İSABETİ: **%20.0 → %20.0** (V11'in 3. sorusu)
V9 görü hattına DOKUNMADI (prompt/model değişmedi = §5.3 veto). V7'den beri
kımıldamadı. ⚠ **V0-0B'nin %36.8 aleti REPODA YOK** → yeniden üretilemiyor.

## ★ V9'UN ÖLÇTÜĞÜ + KATTIĞI (ayrıntı `GECE/V9.md`)
- **İDDİA TABLOSU** (`docs/`+`README`, 35 taşıyıcı): **doğru 21→25 · YALAN
  3→0 · kanıtsız 10→10 (hepsi artık ADLI sağlayıcı taşıyor) · ölü referans 1→0**
- **KAPI SAYILARI:** D1 **9→0** · D2 **9→0** · D3 **52→0**. §4.2 birincil usul:
  `a6689ef` ağacına karşı **EXIT 1, D1 9 · D2 9 · D3 52** — hakem KENDİ
  worktree'sinde bağımsız üretti, aynı sayı. §4.5 mutasyon **üç denetimi de**
  kırıyor; hakem loglara güvenmeyip üçünü kendisi de kırdı
- ★ **D3 TABANI 52'YKEN KAPI SERT DEĞİLDİ** — tek cümlelik mutasyon eşiğin
  altında kalıyordu. Ancak 0'a kesilince kırılabildi. Borç kaydeden taban süstür
- **3 YALAN kapandı, adıyla:** (a) "EU34-52 / 70,200 drafts" — TEST GİRDİ
  aralığı (`engine_check.cpp:30-44` = 15) ile SATILAN aralık (`shape-ratios.json`
  = 8, EU34-48) ayrıldı; (b) `H1.0-KAPI.md` kapıyı canlı gibi anlatıyordu —
  fikstür `h10_gate_check_LEGACY.cpp`, `CMakeLists.txt:748` `DISABLED TRUE`,
  `build-h10` dizini YOK, yani test **kırmızı değil, hiç koşmuyor**;
  (c) `SATIS-SARTNAMESI.md` "borcu bitti" ↔ aynı dosya "5/5 EKSİK" (kutucuk
  sayımı `grep -c` ile **15 işaretli / 5 boş**; "16/17" hiç tutmuyormuş)
- ★ **BİR İDDİA DÜZELTİLMEDİ, ÇÜRÜTÜLDÜ:** README'nin Z-spread "143/238mm"
  çifti. Alet BULUNDU (`drape-preview.cpp`, kapı `drape_check` #89) ve koştu:
  **174.3978 / 229.4973mm**. Hakem bağımsız yeniden bastı, aynı sayı.
  V9-A'nın "alet adı olmayan iddia 4" sayısı da düzeldi → **3**

## ★ HAKEM KAPININ TAŞINAMAZ OLDUĞUNU BULDU (`f3bd10b`)
Temiz worktree'de kapı **EXIT 1, D2 YENİ 42**: varlık sorusu git'e değil DİSKE
soruluyordu, 42 hedef gitignore'lı artefaktti. **Mühürlenen "D2 0" dokümanın
değil TEK BİR ÇALIŞMA DİZİNİNİN özelliğiydi** → temiz klonda/CI'da yeni kırmızı
ad = RULES md.9 ihlali. Onarım kökünden: `git ls-files` + `ls-tree -r HEAD`;
gitignore'lı hedefler AYRI sınıf, sayısı BASILIYOR. VAR 540→491 = SIKILAŞTI.
★ Kusurun ikinci yarısı ancak ölçünce çıktı: `dist/` gibi dizin-ignore kuralları
yalnız GERÇEK dizinlere uyuyor, git bunu diskten öğreniyor.
`f4b5235` son borcu kapattı: `H1.0-KAPI.md:54`'ün "Birincil kaynak" dediği iki
dosya **diskte VAR, izlenen ağaçta YOK, gitignore'da da YOK** (`2f748db`).
★ Fazın 8 işçisi ve 5 mutasyon logu bunu GÖRMEDİ. Hakem kapısı süs değil.

## ★ V9'UN AÇIK BIRAKTIĞI BORÇ (tam liste `GECE/V9.md` §8; gizlenmedi)
- **HAKEMİN 3 AÇIK KUSURU:** kaçış grameri **tek jetonluk** (tırnak / tarih+bağlam
  / "does not exist" / rastgele bir `GECE/` yolu kapıyı yeşil bırakıyor — **sayı
  ile kanıtın ALAKASI aranmıyor**) · kapı **kendi fazını denetlemiyor** (`GECE/`,
  `CLAUDE.md`, `HEDEF.md`, `knowledge/`, `contract/`, `engine/*.md` DIŞARIDA) ·
  **D3'ün sağlayıcısı semantik değil** (`ctest -R nothing_at_all` da sağlayıcı
  sayılıyor; 140 satırın kaçı gerçekten o aletten çıkıyor ÖLÇÜLMEDİ)
- **V9-B3 İKİ YENİ KAÇIŞ KANALI AÇTI, işçi kendi ilan etti:** gitignore'lı dizin
  altına uydurma yol · dizinsiz uydurma dosya adı (`hayalet.cpp`). İkisi de her
  koşuda BASILIYOR ama denetlenmiyor. **Bu bir gevşetmedir ve öyle yazıldı**
- **"D2 0" ≠ "ölü kaynak referansı kalmadı"**: `G5-OMUZ-PLANI.md:64` (backtick
  YOK) ve `SATIS-SARTNAMESI.md:299` (kapsayıcı maddedeki BAŞKA yol için verilen
  "DOSYA YOK" ilanı bunu da muaf kılıyor) kapının kör noktasında
- **238 iddia cümlesinin 214'ü tek tek YARGILANMADI** (süre). Kapı kalıp sayar,
  ANLAM yargılamaz — "her cümle doğru" DENMEDİ
- Docs'un sayıları yeniden ÜRETİLMEDİ: `70,200` · `19,555` · `27 of 54` (alet
  VAR, girdi `benchmark-58/manifest.json` telifli ve repoda YOK) · `86%`.
  Hepsinin ALET ADI bağlandı, sayının o aletten çıktığı doğrulanmadı
- `H1.0-KAPI.md` içinde **iki uzlaşmayan ön−arka dizisi**: §0 −13.50…−1.22mm
  (`trace-match.py`) ↔ §2/G5 −13.83…−1.50mm (`18-armscye-front-back.py`).
  **UZLAŞTIRILMADI** · `H1.0` §3 sayıları yeniden ÖLÇÜLEMEDİ (fikstür DISABLED)
- `Logs/taban-T10-SONRA` ile mühür başlığı **aynı paket değil** (print-info
  4 sayfa ↔ başlık 5 sayfa) → **"5 sayfa" diskten doğrulanamıyor**
- `stitchu-engine.js` **1 günde +44 052 bayt** (1 209 765→1 253 817), gitignore'da
- `SATIS-SARTNAMESI.md:31` **`şartname-check` diye bir ctest YOK** ·
  `ENV.md:10` `~/damla_projects_2026/reports/` diyor, o dizin **YOK**
- `GECE/INDEX.md` **hiçbir mekanik kapının denetiminde DEĞİL**

## SONRAKİ FAZLARIN HAZIR GİRDİSİ + KUYRUKTAKİ KARTLAR
- **V10 (landing)** ← `GECE/V0-0C.md` §1 (web'de 28 taşıyıcı iddia) · §2
  (duran-iddia **292 hit**, 119'u tek başına `web/patches.html`) · §4 (F1–F8),
  en ağırı ★ **SİTE MTM SATIYOR, MOTOR SABİT BEDEN** — 44 dosyada "your own
  measurements", 23'ünde "no fixed sizes" ↔ `README.md:3` "FIXED-SIZE (EU34-48)".
  ⚠ **DEVRALMA, TAZELE:** 0C 24 Ağu'da ölçüldü; V9-A docs'ta 0C'nin 6 kaleminden
  **5'ini bayat** buldu. `?v` **136'da donmuş** · `node engine/tools/site-health.mjs`
  0C'de exit 0 idi, V10 yeniden koştursun
- **V8 (kumaş ekseni + rehber) KOŞMADI, ATLANDI** ← girdisi `GECE/V5-R.md` §C.
  V11 raporunda "yapılmadı" satırında ADIYLA durur (§6 anti-bahane)
- **V7'den devreden:** ADSIZ oyuk borcu (`bardot_off_shoulder · yoke_top ·
  cupseam_bustier`) · `[S2]` kesim↔dikiş çizgisi kararı · `sleeve_underarm`
  çift kapısı · yaka 4/4 + omuz 1/1 İFADE borcu · `raglan` arka kapısı
- ★ `sewability_check` **SAYIYI tavanlıyor, YERİ değil** · `edit_locality_check`
  tek beden/tek spec · `back_neck_drop` SINIF hatası kapısız · repo **iki üretim
  toleransı** (0.79375 vs 3.0) · `virtual-sew.js` çürük · `flat-board.mjs` exit
  koduna bağlı DEĞİL · `h3b-rings.py` koşmuyor · `vision/eval/photos` 29 dosya
  19 etiket · `vision/eval.js` ↔ `foto-spec-olcum` aynı banka farklı sayı

## ★ PROTOKOL DERSİ (V10 ŞEFİNE — kart değil KURAL)
1. **Kapının TABANI kapı kadar önemlidir.** D3 tabanı 52'yken mutasyonu
   yutuyordu. **Borç kaydeden taban kapıyı süse çevirir** — onarımı bitir,
   sonra kes. 2. **"Yeşil" bir DİZİNİN özelliği olabilir, dokümanın değil.**
   Kurduğun kapıyı **temiz worktree'de de koştur**; `git worktree add` bedava,
   hakem koşmasaydı kapı CI'da yeni kırmızı ad olacaktı. 3. **Devralınan cümleyi
   ölçmeden kartına yazma** — brief "12 YALAN" diyordu, 5'i çoktan kapanmıştı;
   ölçüm kartı olmasa faz **kapanmış işi** yeniden yapardı. 4. **İşçinin kendi
   kusurunu ilan etmesi ÇIKTIDIR** (V9-B3 açtığı iki kaçışı, V9-G kapısının
   sınırını, V9-C V9-A'nın hatasını kendi yazdı).

## DAMLA'YA DÜŞEN (bloke etmez — tam gövdeler `DAMLA-KUYRUK.md`'de)
- **K-FN1** kol oyuğu bandı (A) — **K-V0A** `patterns_real/` 41 telifli dosya (A)
  — **K-V0B** `style_check` pinleme (A) — **K-V1A** golden mührü — **K-V1B**
  `figure_check` ⚠ V4+V5+V6+V7'ye yazıldı, DÖRDÜNDE DE KESİLMEDİ — **K-V1C**
  kaynaksız 4 kolon — **K-V2A** görü kafası — **K-V2B** `?v=136` — **K-V3A**
  20.56° kırığı (A) — **K-V4A/B/C** pano · ISO 5455 · tanınmayan değer —
  **K-V5A** pay yayınlanmış minimumun ALTINDA (A) — **K-V5B** Buğra levhaları —
  **K-V6A** çıpa/editleme REDDEDİLDİ, yan dalda `3d8903c` (A) — **K-V7A** V7-F
  sicil şerhi işaretçiye indi, tam metin `GECE/V7-F.md` §5 (A)
- **K-V9A** (YENİ) `patterns_real/geometry/` + 2 dosya **ne izleniyor ne
  gitignore'da**; `2f748db` repodan çıkardı ama diskte duruyor ve `H1.0-KAPI.md`
  onları "Birincil kaynak" sayıyor: (A) böyle kalsın, docs yokluğu ilan etsin
  (yapıldı) · (B) gitignore'a girsin · (C) geri izlensin · **VARSAYILAN (A)**
