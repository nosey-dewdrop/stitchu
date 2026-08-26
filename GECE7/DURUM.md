# GECE7 — DURUM (şef tutanağı)

Koşu: KOSU-v7. Şef kod yazmaz (Halka 0 hariç); kart yazar, ajan salar, hakem salar.
Hedef sabit: **fotoğraf + prompt → kalıp + flat.**

## Sıra — §4 HALKA YAPISI (26 Ağu düzeltmesi)

| Halka | Fazlar | Durum |
|---|---|---|
| **0 — ISINMA** | disk + hedef koşusu tabanı | ✅ **BİTTİ** (şef koşturdu) |
| **1 — AL DENE** | **F-İNDİR** → F0 → F2 | ← şimdi buradayız |
| **2 — MOTOR** | F3 ⇄ F5 (operatör başına alt-kart) | bekliyor |
| **3 — DERİNLİK** | F4 → F6 → F7 → F8 → F9 | bekliyor |

**F1 Halka 0'a soğuruldu.** **F3B bu koşudan ÇIKARILDI**, H7 hedef koşusunda yok.

## Tablo

| Faz | Etiket | Ajan | Hakem | Durum |
|-----|--------|------|-------|-------|
| Halka 0 | `halka0-yesil` | şef (ajan yok) | — | ✅ BİTTİ, kart `GECE7/HALKA0.md` |
| F-İNDİR | **`F-INDIR-yesil`** ✅ | 2 tur koştu, `ee1414c`+`072705c` → `cce710d`+`fac2993` | 2 tur koştu | ✅ **GEÇTİ** (2. tur) — kart `GECE7/F-INDIR.md`, hüküm `GECE7/HAKEM-F-INDIR.md` |
| F0 | ⛔ etiket YOK | 1 tur koştu, `cd3bea3` | 1 tur koştu | ⛔ **KALDI** (1. tur) — yedinci kırmızı; kart `GECE7/F0.md`, hüküm `GECE7/HAKEM-F0.md` |
| F0 (2. tur) | `F-INDIR-yesil` hâlâ son yeşil | — | — | SIRADAKİ — kart `GECE7/F0.md` sonundaki **HAKEM İKİNCİ TUR KARTI** |
| F2 | — | — | — | ⛔ **BAŞLAMAZ** — F0 yeşillenmeden açılmaz; iki zorunlu maddesi `HAKEM-F0.md` §7'de |

> ▶ **KOŞU AÇILDI** (26 Ağu, Damla): Halka 1 → F-İNDİR → F0 → F2, sonra Halka 2
> (F3 ⇄ F5), sonra Halka 3 (F4 → F6 → F7 → F8 → F9). **F9 kapanana kadar durulmaz.**
> F3B koşulmaz. Damla koşunun dışındadır (§3.4); zevk kararları dahil her karar
> hakeme gider, hakem `GECE7/KARARLAR.md`'ye gerekçesiyle yazar.

## İKİ DÜZELTME — her faz ajanına ve hakeme geçirilir (26 Ağu, Damla)

1. **H10 ikiye ayrılır.**
   - **H10a** — fotoğrafta **görünmesi mümkün olmayan** alanlar (arka, iç, örtülü).
     **Cırcıra BAĞLANMAZ**; yükselmesi tek başına faz kapatmaz da kapatmamazlık etmez.
   - **H10b** — fotoğrafta **görünen ama alınamayan** alanlar. **Cırcır YALNIZ H10b'ye
     bakar** ve §0B tavanı H10b'ye uygulanır: H10b yükselirken H2 yükselmiyorsa faz kapanmaz.
   - Taban tablosundaki tek `H10 %58.3` sayısı **ayrıştırılmamıştır**; ayrıştıran ilk faz
     iki sayıyı da `n`'siyle basar, hakem tabanı günceller (§3.8 md.1 — tabana yalnız hakem dokunur).
2. **F2'nin İLK işi §1F fotoğraf havuzu.** dropped 10 silinir, havuz **19'a** iner, kalan
   19'un **künyeleri** çıkar (kaynak, lisans, çekim koşulu), **hakem etiketler** — H2'nin
   doğru cevabı makine etiketi olmaktan çıkar. F2'nin başka hiçbir işi bu bitmeden başlamaz.

## Son kapı sayıları — taban, n=5

`ctest --test-dir engine/build -R hedef_kosu` · taban `contract/hedef-kosu-taban.json`

| H1 | H2 | H3 | H4 | H5 | H6 | H8 | H9 | H10 | H11 |
|----|----|----|----|----|----|----|----|-----|-----|
| 5/5 | %92.2 | 4 | ÖLÇEMEDİM | 0 / 5 çift | ÖLÇEMEDİM | 31 | ÖLÇEMEDİM | %58.3 | 3.1 ms |

- H2'nin doğru cevabı **makine etiketi** (§1F) → sayı geçici.
- H5 yalnız `armhole↔sleeve_cap` çiftinde ölçülebiliyor; kalıpta başka kenar rolü ilan edili değil.
- H11 cırcıra değil **tavana** bağlı (<10 sn) ve **VLM turu hariç**.

## ctest

**Sayma yöntemi düzeltildi (hakem, K3): resmi sayı `ctest -N`'in listelediğidir,
`grep -c add_test` DEĞİL** — CMakeLists satır 906'da bir *yorumun* içinde
`add_test(NAME …)` geçiyor ve grep'i 1 fazla saydırıyor. Eski "119 test" o şişmiş sayıydı.

| ağaç | listelenen (`ctest -N`) | DISABLED | koşan | yeşil | kırmızı |
|---|---|---|---|---|---|
| Halka 0 sonu (`34586c8`) | 118 | 1 (`h10_gate_check`) | **117** | 111 | **6** |
| F-İNDİR 1. tur (`b791db5`) | 119 | 1 (`h10_gate_check`) | **118** | 111 | **7** ⛔ |
| **F-İNDİR 2. tur (`fac2993`)** | **120** | 1 (`h10_gate_check`) | **119** | **113** | **6** ✅ |
| **F0 1. tur (`cd3bea3`)** | **120** | 1 (`h10_gate_check`) | **119** | **112** | **7** ⛔ |

⛔ **F0'IN YEDİNCİ KIRMIZISI (hakem ölçtü, kart YEŞİL diye bildirmişti):**
`vocab_reference_check` **FAIL** — `hemFlounce` **26 → 27**. İki uçtan ölçüldü:
`F0-oncesi` worktree'sinde **YESIL**, `cd3bea3`'te **FAIL**. Kapsam içinde 16
dosyanın 15'i aynı; tek fark `web/js/create.js` **2 → 3** = `create.js:178`'e
yazılan `'hemFlounce'` dize sabiti. Ajan yalnız `garment` eksenine bakmış
(1137/1186, doğru) ama kapı **37 eksen + 92 kelimeyi** cırcırlıyor. Taban
yeniden **kesilmedi** (K11); F0 2. tur bunu tek iş olarak kapatacak.

F-İNDİR iki tur boyunca **iki test ekledi** (`indir_check` #120, `flat_tables_check` #95).
Hiçbir test silinmedi/yeniden adlandırılmadı.

**Miras 6 kırmızı (değişmedi):** `flat_pattern_agree_check` · `flat_artifact_census` ·
`style_check` · `sizechart_source_check` · `contract_check` (ilan edilmiş karar,
bilerek kırmızı) · `figure_check` (`dress_bandeau_circle` pinsiz).

✅ **7. KIRMIZI KAPANDI (2. tur):** `vocab_reference_check` yeşil. `garment` SCOPE içinde
**1188 → 1137** (taban 1186). Taban ve kapı betiği **bayt bayt dokunulmadı**
(`git diff --stat 34586c8 HEAD` boş). Düşüş kapalı enumun sökülmesinden:
`create.js`'te doğrudan enum karşılaştırması **44 → 4**. Hakem ayrı worktree'de
kendi saydı; −51'in dosya dosya dağılımı `GECE7/HAKEM-F-INDIR.md` §2'de.

## Son kapı sayıları — F0 sonrası, taban yine DEĞİŞMEDİ (hakem koşturdu, n=5)

`node engine/tests/hedef_kosu.mjs` → EXIT 0, `CIRCIR SAĞLAM`.

| | H1 | H2 | H3 | H5 | H8 | H10 | H11 |
|---|----|----|----|----|----|-----|-----|
| F0 öncesi | 5/5 | %92.2 | 4 | 0 | 31 | %58.3 | 3.1 ms |
| F0 sonrası | **5/5** | **%92.2** | **4** | **0** | **31** | **%58.3** | **3.1 ms** |

**F0 altı sayının hiçbirini oynatmadı** ve bu bir sapma değil: H1 zaten
**5/5 = tavan** (n=5'te yükselecek birim yok), H10'un düşmesi F0'ın işi
değildi (§0B: çıkarmak suç değil, **sessizce** çıkarmak suç), H3 = 4 ise ilan
kanalı `web/js/` hattına kurulup ölçüm hattı `hedef_kosu.mjs`'e bağlanmadığı
için düşemedi (K9 — H3 gevşetilmedi, düşüşü F2'nin hanesine yazılacak).
Fazın gerçek iyileşmesi artefaktın üstünde ölçüldü: kökenini söyleyen inen
dosya **0/5 → 2/5**, etiketli eksen **0 → 38**, etiketleme çağrısı **0 → 50**.

## Son kapı sayıları — taban DEĞİŞMEDİ (n=5)

`ctest -R hedef_kosu` **YEŞİL**, H1–H11 taban değerinde; F-İNDİR görme/çıkarım
hattına tek satır dokunmadı. `contract/hedef-kosu-taban.json`'a dokunulmadı
(doğrulandı: dosyanın tek commit'i `f56941e`, Halka 0). H11 3.1 → 3.3 ms duvar
saati salınımıdır ve H11 cırcıra değil **tavana** (<10 sn) bağlıdır.

## Hakemin son hükmü

⛔ **KALDI** — inen dosya artık kökenini gerçekten söylüyor (hakem ölçtü: A4 kapağında `Origin / Köken` + 8 alan adı, PNG'si **göze bakıldı**; flat SVG kökünde `data-koken-cikarildi="8"`; sevk edilen kayıt **38 eksen**, 0 → 38; hakemin **beş mutasyonunun beşi** EXIT 8, ikisi ajanın hiç dokunmadığı `download.js`'te) ve `hedef_kosu` yeşil, altı sayı taban değerinde, taban el değmemiş — **ama ctest `7 failed out of 119`**: `vocab_reference_check` `hemFlounce` **26 → 27** ile kırmızı ve kart onu **"YEŞİL"** diye bildirmiş, oysa kartın kendi DEĞİŞMEZLER satırı *"yedinci ad = faz kapanmaz"* diyor; kusur `create.js:178`'deki **tek dize sabiti** olduğu ve fazın ürünü ölçüldüğü için **GERİ AL değil**, `F0-yesil` **atılmadı**, F0 **ikinci tur** açıldı (kart `GECE7/F0.md` sonunda), gerekçe `GECE7/HAKEM-F0.md`.

> 🚨 **KOŞU DIŞI, AMA ACİL (K10):** `nosey-dewdrop/stitchu` **PUBLIC** ve
> `patterns_real/` **41 dosyayla origin/main'de** — satın alınmış Buğra A0/A4
> PDF'leri anonim `curl` ile **HTTP 200** dönüyor. `CLAUDE.md`'nin *"repo
> private (doğrulandı)"* satırı bugün yanlış. F0'ın işi değil (`87fc9d5`),
> hakem tek taraflı kapatmadı: Pages canlı siteyi bu repodan yayınlıyor.
> **Damla kararı.**

## Açık kuyruk

`GECE7/DAMLA.md` — 4 soru, hepsi en kısıtlayıcı varsayımla ilerletildi, koşu durmadı.
F0 birinci turdan yeni soru çıkmadı (kart md.4 zaten en kısıtlayıcı davranışı
emrediyordu: kayıt bozuksa **dosya yazılmaz**).

**Devreden borç: 15 madde** — F-İNDİR'in 9'u (`HAKEM-F-INDIR.md` sonu) +
F0'ın 6'sı (`GECE7/F0.md` md.10-15). Hiçbiri kapatılmadı, hiçbiri silinmedi.

⚠ **Hakemin bulduğu, kimsenin sormadığı iki kalem** (`HAKEM-F0.md` §9):
inen **5 dosyanın 3'ü hâlâ sessiz** (A0, DXF, düz `.svg` köken taşımıyor) ·
**§3.5'in "site son yeşil etiketten sevk edilir" kuralı KODDA YOK** —
`.github/workflows/pages.yml:23` `branches: [main]` diyor, yani **main'e her
push canlıya çıkıyor** ve şu an main **yedi kırmızıyla** yayında.

## Notlar

- GECE7/ 2026-08-26'da açıldı; önceki koşu klasörü `GECE/`.
- Damla'ya soru sorulmaz; `GECE7/DAMLA.md`'ye yazılır, varsayım karta işlenir.
- §3.8 md.1: **faz ajanı `contract/hedef-kosu-taban.json`'a dokunamaz.** Değiştiren hakemdir.
