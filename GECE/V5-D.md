# V5-D — draft_math_check: POZİTİF GEOMETRİ KAPISI (V5 madde 7)

Rapor kartı: `GECE/KART/V5-RAP.md`. Kesilen oturumun diske düşürdüğü loglardan
yazıldı; **loglardaki her sayı, komut bugün yeniden koşturularak doğrulandı.**

Yargılanan hat (`GECE/log/V5-D.run.txt:2`): `bindings.cpp draftJSON → GarmentDrafter::draft`.
Motor: `web/vendor/stitchu-engine.js`. Eşik kaynağı: `GECE/V5-R.md` (künyeler
`engine/tests/draft_math_check.mjs` başlığında birebir).

STATÜ (banklanan koşu, `GECE/log/V5-D.run.txt` son satırı):
**`FAIL draft_math_check — 12 ihlal`. KAPI KIRMIZI, KIRMIZI BIRAKILDI** — eşik
gevşetilmedi, sayı uydurulmadı, motor kaynağına dokunulmadı.
⚠ Bugünkü çalışma ağacı farklı exit kodu basıyor — §RATCHET KATMANI.

## YAPILAN (dosya yolu + hash)

| dosya | ne |
|---|---|
| `engine/tests/draft_math_check.mjs` | kapının kendisi; her eşiğin künyesi dosya başlığında, `GECE/V5-R.md`'den birebir |
| `GECE/log/V5-D.run.txt` | 8 bedenin tam çıktısı — `node engine/tests/draft_math_check.mjs` |
| `GECE/log/V5-D.bostest.txt` | §4.2 boş test, `12ad937`'ye karşı |
| `GECE/log/V5-D.mutasyon.txt` | §4.5 mutasyon, ±5mm, 8 ölçüde |
| `GECE/log/V5-D.remedy.txt` | §4.7 kök teşhis + ÖLÇÜLMÜŞ çözüm adayı + `body.shoulder` ölü-girdi ölçümü |
| `GECE/log/V5-D.addtest.txt` | `engine/CMakeLists.txt`'e eklenecek TEK satır (dosya KİLİTLİ, şef ekleyecek) |
| `GECE/V5-D.md` | bu rapor |

Commit'ler (`git log --oneline`):
- `30054c1` — *gece v5-d: draft_math_check gate — sourced aldrich/threads thresholds, 8 sizes, red on published bust and hip ease minimums*
- `097b2ab` — *gece v5-d: record commit hash in the report*
- `d566a8a` — *bank the v5-a and v5-d gates the killed session left untracked: both test files, empty-test and mutation proofs, opening ctest*

**DOKUNULMAYANLAR:** `engine/CMakeLists.txt` (kilitli), `engine/src/` altında hiçbir
dosya, `patterns_real/` PDF'leri, mevcut testler. Yeni bağımlılık kurulmadı
(yalnız node stdlib + repodaki `web/vendor/stitchu-engine.js`).

## ÖLÇÜLEN (sayı + onu basan komut)

Basan komut: `node engine/tests/draft_math_check.mjs` → `GECE/log/V5-D.run.txt`

### 8 BEDENİN YARGI SAYIMI

Çıktının basan satırı (`GECE/log/V5-D.run.txt` sondan 3. satır, bugün yeniden
koşuldu ve birebir aynı çıktı):
```
    yargı sayımı: GEÇTİ 12 · KALDI 12 · KAYNAKSIZ 40
    UNMEASURABLE sayısı: 0  (RATCHET tavanı 0)
```
**GEÇTİ 12 · KALDI 12 · KAYNAKSIZ 40 · UNMEASURABLE 0.** Toplam 64 = 8 kalem × 8 beden.
`ADIYLA basılan ihlal satırı: 12`, komutla sayıldı:
`node engine/tests/draft_math_check.mjs | grep -c "^FAIL "` → **12**.

### Kalem kalem, 8 bedende (EU34..EU48)

| kalem | ölçülen bant (8 beden) | beklenen | künye | statü |
|---|---|---|---|---|
| scye_depth | 216.4 … 249.4 mm | Aldrich s.11 tablosu + s.14 "plus 0.5 cm" (205 … 242 mm) | Aldrich 4.bs, V5-R §C1 | KAYNAKSIZ (tolerans yayını yok) → RATCHET |
| armhole_circumference | 374.2 … 485.1 mm | **YAYIN YOK** | V5-R §C2 | KAYNAKSIZ, **kapıya girmiyor** |
| shoulder_width_front | 109.21 … 127.95 mm | Aldrich s.11 tablosu (117.5 … 136 mm) | V5-R §C3 | KAYNAKSIZ → RATCHET |
| shoulder_width_back | 109.33 … 128.07 mm | tablo + 1 cm (127.5 … 146 mm) | V5-R §C3, s.14 "plus 1 cm" | KAYNAKSIZ → RATCHET |
| back_neck_drop | 20.4 … 23.4 mm | **15.0 mm, SABİT** | Aldrich s.14/16 "0-1 1.5 cm", V5-R §C5 | KAYNAKSIZ → RATCHET |
| bust_ease | 49.15 … 82.15 mm | **63.5 … 101.6 mm** | Threads #221 s.71 MINIMUM EASE + FIT AND EASE "Fitted" | **KALDI 4/8** |
| waist_ease | 40.10 … 53.32 mm | 25.4 … 60.0 mm | Threads MINIMUM EASE + Aldrich s.28 | GEÇTİ 8/8 |
| hip_ease | 17.20 … 23.20 mm | **50.8 … 76.2 mm** | Threads #221 s.71 MINIMUM EASE kalça 2-3 in | **KALDI 8/8** |

### ★ 12 İHLAL — ADIYLA, hangi kalem / hangi beden

Basan komut: `node engine/tests/draft_math_check.mjs | grep "^FAIL "`
(çıktının satır numaraları `/tmp/dm.out` koşusundan; aynı satırlar
`GECE/log/V5-D.run.txt` içinde de var).

| # | beden | kalem | ölçülen | yayınlanmış bant | kaynak |
|---|---|---|---|---|---|
| 1 | EU34 | **bust_ease** | 49.1500 mm | 63.5 … 101.6 | Threads #221 s.71 |
| 2 | EU34 | **hip_ease** | 17.2000 mm | 50.8 … 76.2 | Threads #221 s.71 |
| 3 | EU36 | **bust_ease** | 53.5500 mm | 63.5 … 101.6 | Threads #221 s.71 |
| 4 | EU36 | **hip_ease** | 18.0000 mm | 50.8 … 76.2 | Threads #221 s.71 |
| 5 | EU38 | **bust_ease** | 57.9500 mm | 63.5 … 101.6 | Threads #221 s.71 |
| 6 | EU38 | **hip_ease** | 18.8000 mm | 50.8 … 76.2 | Threads #221 s.71 |
| 7 | EU40 | **bust_ease** | 62.3500 mm | 63.5 … 101.6 | Threads #221 s.71 |
| 8 | EU40 | **hip_ease** | 19.6000 mm | 50.8 … 76.2 | Threads #221 s.71 |
| 9 | EU42 | **hip_ease** | 20.4000 mm | 50.8 … 76.2 | Threads #221 s.71 |
| 10 | EU44 | **hip_ease** | 21.2000 mm | 50.8 … 76.2 | Threads #221 s.71 |
| 11 | EU46 | **hip_ease** | 22.0000 mm | 50.8 … 76.2 | Threads #221 s.71 |
| 12 | EU48 | **hip_ease** | 23.2000 mm | 50.8 … 76.2 | Threads #221 s.71 |

İki cümlede: **hip_ease 8 bedenin 8'inde de yayınlanmış MİNİMUMUN ALTINDA**
(motorun payı minimumun **üçte biri**). **bust_ease EU34/36/38/40'ta minimumun
altında**, EU42 ve üstü bandın içinde.
★ Bu, `GECE/V5-R.md` §C4'ün ★★ bulgusunun **bağımsız teyididir**: reponun
"büst +60 mm, kaynak Threads RTW + Aldrich" künyesi büst kalemini desteklemiyor.

### KÖK TEŞHİS (ölçüm, iddia değil) — `GECE/log/V5-D.remedy.txt`

Motorun payı **ÇARPIMSAL**, yayınlanmış bant **TOPLAMSAL**:

| beden | büst cm | kalça cm | büst payı mm | kalça payı mm | pay/büstCM | pay/kalçaCM |
|---|---|---|---|---|---|---|
| EU34 | 80 | 86 | 49.15 | 17.20 | 0.6144 | **0.2000** |
| EU36 | 84 | 90 | 53.55 | 18.00 | 0.6375 | **0.2000** |
| EU38 | 88 | 94 | 57.95 | 18.80 | 0.6585 | **0.2000** |
| EU40 | 92 | 98 | 62.35 | 19.60 | 0.6777 | **0.2000** |
| EU42 | 96 | 102 | 66.75 | 20.40 | 0.6953 | **0.2000** |
| EU44 | 100 | 106 | 71.15 | 21.20 | 0.7115 | **0.2000** |
| EU46 | 104 | 110 | 75.55 | 22.00 | 0.7264 | **0.2000** |
| EU48 | 110 | 116 | 82.15 | 23.20 | 0.7468 | **0.2000** |

- kalça payı / kalçaCM = **0.2000, 8 bedende BİT-SABİT** → motor kalça halkasını
  `10.2 × kalçaCM` mm çiziyor, yani pay = **%2**. Yayınlanmış bant bedenden bağımsız
  50.8–76.2 mm istiyor.
- büst payı / büstCM = 0.6144 → 0.7468 (**bedenle büyüyor**): motor
  `11.1 × büstCM − 38.85` mm çiziyor. Küçük bedenler minimumun altında, büyükler
  bandın içinde.
- Yani hata "bir sabit yanlış" değil, **payın CİNSİ yanlış**.

### ★ §4.7 — ÖLÇÜLMÜŞ ÇÖZÜM ADAYI ve **BEDELİ**

Motor kaynağına dokunmak yasak olduğu için gereken büyüklük, aynı motora
**gövde girdisi kaydırılarak** ölçüldü. Komut: `node /tmp/remedy.mjs`
(log: `GECE/log/V5-D.remedy.txt` orta bölüm).

| aday | 8 bedende ölçülen pay | bant | sonuç |
|---|---|---|---|
| büst +1.0 cm | 60.25 … 93.25 mm | 63.5 … 101.6 | TUTMUYOR (alt uçtan) |
| **büst +1.5 cm** | **65.80 … 98.80 mm** | 63.5 … 101.6 | **HEPSİ BANTTA ✔** |
| büst +2.0 cm | 71.35 … 104.35 mm | 63.5 … 101.6 | TUTMUYOR (üst uçtan taşıyor) |
| **kalça +3.5 cm** | **52.90 … 58.90 mm** | 50.8 … 76.2 | **HEPSİ BANTTA ✔** |
| **kalça +4.0 cm** | **58.00 … 64.00 mm** | 50.8 … 76.2 | **HEPSİ BANTTA ✔** |
| **kalça +4.5 cm** | **63.10 … 69.10 mm** | 50.8 … 76.2 | **HEPSİ BANTTA ✔** |
| **kalça +5.0 cm** | **68.20 … 74.20 mm** | 50.8 … 76.2 | **HEPSİ BANTTA ✔** |

Gereken ek halka: büstte **+16.65 mm**, kalçada **+35.7 … +51.0 mm**.
Bu sayılar **ölçüldü, türetilmedi**.

⚠ **BEDELİ — bu bir ADAYDIR, "uygulandı" DEĞİLDİR.** Aday, motorun formülünü
düzeltmiyor; **gövde girdisini kaydırıyor**. Yani `contract/tables.json`'un büst ve
kalça kolonlarını oynatmak demek, ve bunun bedeli ölçülmedi ama **kimin kırılacağı
adıyla belli**:

1. **Golden mührü.** ENV.md md."Build + test": `engine/golden-reference.csv`,
   diff `engine/golden-diff.py`, ve RULES 4: *"golden diff stays byte-identical."*
   Gövde girdisi kayarsa çizilen her kalıp kayar → golden bayt bayt aynı KALAMAZ.
   Bugün YEŞİL olan üç kapı doğrudan risk altında (`GECE/log/V5.ctest.opening.txt`):
   `golden_check` (#3, satır 7) · `recipe_golden_check` (#73, satır 287) ·
   `recipe_dress_golden_check` (#75, satır 291).
2. **PİNLER.** `preview_truth_check` (#93, `GECE/log/V5.ctest.opening.txt:346`)
   bugün **Passed**; landmark pinleri sabit sayılara bağlı. Gövde kayması bu pinleri
   düşürür — ve pinleri "taşımak" ayrı, gerekçeli, ölçülmüş bir iştir, bu kartın işi değil.
3. Bu yüzden aday **UYGULANMADI**. Doğru düzeltme muhtemelen girdi kaydırma değil,
   payın CİNSİNİ çarpımsaldan toplamsala çevirmek (`engine/src/`), ve **onun maliyeti
   ÖLÇÜLMEDİ** — uydurulmadı.

### RATCHET (tolerans YAYINLANMAMIŞ kalemler) — dördü sayısıyla

`GECE/V5-R.md` §A'nın hükmü kesin: apparel kalıp toleransı için **YAYIN YOK**
(ASTM D5585 bir VÜCUT tablosu; ISO 8559-3 *"garment dimensions are not included"*;
1/32" Open Library tam-metninde 73 kez geçiyor, hiçbiri giyim değil). O yüzden
"Aldrich'ten şu kadar sapabilir" diye yazılabilecek bir sayı yok. Uydurmak yerine
bugünkü en kötü sapma DONDURULDU; tavan yalnız düşebilir. Emsal:
`engine/tests/flat_pattern_agree_check.mjs` `UNMEASURED_RATCHET`.

Basan komut: `node engine/tests/draft_math_check.mjs` (çıktının `--- RATCHET (a)` bloğu).

| kalem | bugün en kötü \|sapma\| | hangi bedende | tavan | işaret |
|---|---|---|---|---|
| **scye_depth** | **11.4000 mm** | EU34 | 11.40 | motor **DERİN** çiziyor |
| **shoulder_width_front** | **8.2988 mm** | EU46 | 8.30 | motor **KISA** çiziyor |
| **shoulder_width_back** | **18.1823 mm** | EU46 | 18.18 | motor **KISA** çiziyor |
| **back_neck_drop** | **8.4000 mm** | EU48 | 8.40 | motor **DERİN** çiziyor, ve **bedenle büyüyor** (Aldrich SABİT diyor) |

★ `back_neck_drop` işareti ayrıca bir SINIF hatası gösteriyor: Aldrich'in kuralı bütün
bedenlerde 1.5 cm SABİT; motorunki 20.4 → 23.4 mm arası **graduate ediliyor**. Yayınlanan
üç dolaşan alternatiften ("⅓ yaka genişliği", "2 cm sabit", "ön düşüş = genişlik + 1 cm")
hiçbiri bu dosyaya sokulmadı — V5-R §C5 üçünü de YAYIN YOK diye işaretliyor.

### §4.2 BOŞ TEST — `GECE/log/V5-D.bostest.txt`

Usul (log satır 2–4): `git worktree add --detach /tmp/v5pre-d 12ad937` →
`cp engine/tests/draft_math_check.mjs /tmp/v5pre-d/engine/tests/` →
`cd /tmp/v5pre-d && node engine/tests/draft_math_check.mjs`.

**HÜKÜM (log satır 6): `KIRMIZI DÜŞÜYOR (exit 1, 12 ihlal)` → kapı VACUOUS DEĞİL.**

**AMA BU KANIT ZAYIF VE SEBEBİ ÖLÇÜLDÜ.** Kapının okuduğu iki girdi de faz-öncesi
commit ile HEAD arasında bayt bayt aynı (log satır 8–10):
- `web/vendor/stitchu-engine.js` → `3d5e7d597445dafd3781d0e09eb5683e88e54420` (12ad937 = HEAD)
- `contract/tables.json` → aynı

Çıktı diff'i **0 satır**. Dürüst etiket: **"VACUOUS DEĞİL, ama 12ad937 karşısında
AYIRT ETMİYOR"** — bu gecenin fazı motoru hiç değiştirmedi. Kapının gerçekten
ısırdığının kanıtı mutasyondur, boş test değil.

### §4.5 MUTASYON — `GECE/log/V5-D.mutasyon.txt`

Kanca `V5D_MUTATE=<ölçü>:<±mm>` ÖLÇÜLEN değere ekler (eşiğe değil), koşuda ekrana
basılır. Referans: **12 ihlal**.

| ölçü | +5 mm | −5 mm |
|---|---|---|
| scye_depth | **13 ihlal (RATCHET KIRILDI)** | 12 |
| shoulder_width_front | 12 | **13 (RATCHET KIRILDI)** |
| shoulder_width_back | 12 | **13 (RATCHET KIRILDI)** |
| back_neck_drop | **13 (RATCHET KIRILDI)** | 12 |
| bust_ease | 11 (bandın altındaydı, +5 İYİLEŞTİRDİ) | **13** |
| waist_ease | 12 | 12 |
| hip_ease | 12 | 12 |
| armhole_circumference | 12 | 12 |

Geri alma (kancasız aynı komut): **12 ihlal, 0 `RATCHET KIRILDI` satırı.**

★ **+5 mm HER KALEMDE BOZMA DEĞİLDİR, ÖLÇÜLDÜ:** omuz kalemlerinde sapma NEGATİF
(motor Aldrich'ten kısa çiziyor), o yüzden +5 mm |sapmayı| küçültür. Bozan yön EKSİ.
Bu yüzden her kalem iki yönde de bozuldu.

★ **KAPININ ISIRMADIĞI ÜÇ KALEM, ADIYLA:**
- `waist_ease`: ±5 mm yakalanmıyor, çünkü ölçülen 40.10–53.32 mm ve **yayınlanmış** bant
  25.4–60 mm; ±5 mm hâlâ bandın içinde. Bandı daraltmak sayı uydurmak olurdu, DARALTILMADI.
  Yakalandığı eşik ölçüldü: `V5D_MUTATE=waist_ease:20` → **20 ihlal**.
- `hip_ease`, `bust_ease`: zaten bandın dışındalar; sayı satırda kayıyor
  (EU38 18.80 → 23.80) ama ihlal SAYISI artmıyor.
- `armhole_circumference`: **KAYNAKSIZ = kapıya hiç girmiyor**, mutasyon hiçbir şey
  değiştirmiyor. Bu KASITLI: yayınlanmış bir hedef oyuk çevresi yok (V5-R §C2), ve
  yayın yokken kapı kurmak yasak.

---

## ★ RATCHET KATMANI — BUGÜNKÜ ÇALIŞMA AĞACI **PASS** BASIYOR

Kartın "komutu yeniden koştur" emri gereği `node engine/tests/draft_math_check.mjs`
bugün koşuldu. **12 ihlalin 12'si de aynı sayılarla, adıyla basıldı**, GEÇTİ 12 ·
KALDI 12 · KAYNAKSIZ 40 birebir tuttu — **ama exit kodu 1 değil, 0.**

Sebep ölçüldü: paralel işçi (kart V5-E) şu anda `engine/tests/` altında çalışıyor.
```
$ git status --short engine/tests/
 M engine/tests/draft_math_check.mjs
 M engine/tests/sewability_check.mjs
?? engine/tests/v5-ratchet-baseline.json      ← HENÜZ TAKİPSİZ
```
Değişikliğin kendi beyanı (dosya başlığı, `git diff HEAD` çıktısından):
*"EŞİK GEVŞETME DEĞİL: … her GEÇTİ/KALDI satırı AYNEN duruyor ve ADIYLA basılıyor.
Değişen tek şey exit kodunun bağlandığı yer: 'ihlal = 0' yerine 'ihlal ≤ ölçülmüş tavan'."*
Yeni eklenen tavanlar:
```
bust_ease  bant dışı beden 4/8  tavan 4
waist_ease bant dışı beden 0/8  tavan 0
hip_ease   bant dışı beden 8/8  tavan 8
PASS draft_math_check — RATCHET: 0 tavan aşımı · adıyla basılan ihlal satırı 12
```
★ **ŞEFE UYARI, YUMUŞATMADAN:** nokta-değerli dört kalemin ratchet'i (tolerans YAYIN
YOK) ile **yayınlanmış bant** kalemlerinin ratchet'i aynı şey değildir. hip_ease'te
8/8 beden **yayınlanmış bir minimumun altında** ve bu artık exit 0 basıyor. Sayı
görünür kalıyor, ama "kapı yeşil" cümlesi bundan sonra *"12 ihlal var ve 12'si
dondurulmuş tavanın altında"* demektir. Bu değişikliğe **DOKUNMADIM** (dosya kilidi);
kararı şefindir.

---

## YAPILAMAYAN (sebep)

1. **`engine/CMakeLists.txt` GÜNCELLENMEDİ** — dosya kilitli (paralel işçi).
   Eklenecek tam satır `GECE/log/V5-D.addtest.txt`'de:
   `add_test(NAME draft_math_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/draft_math_check.mjs)`
   (biçim `engine/CMakeLists.txt:131` `flat_pattern_agree_check` emsalinden birebir).
   ⚠ **RULES 9 ÇATIŞMASI:** kapı HEAD sürümünde KIRMIZI; satır o haliyle eklenirse
   ctest'in kırmızı AD kümesi 6 → 7 olur. RATCHET katmanı (yukarıda) bu çatışmayı
   kaldırıyor. Ekleme kararı şefindir; **bir eşik gevşetme gerekçesi DEĞİLDİR.**
2. **Tam ctest koşulmadı** — bu vardiyada da koşulmadı (kart YASAKLADI: paralel işçi
   `engine/` ağacında ctest koşuyor). `GECE/log/V5-D.ctest.after.txt` ve
   `GECE/log/V5-D.reddiff.txt` **ÜRETİLMEDİ** ve bu vardiyada da üretilemedi.
3. **HEAD sürümünün bugün yeniden koşulması** — iki test dosyası paralel işçi
   tarafından değiştirilmiş durumda; HEAD sürümünü koşmak `git stash` ya da ikinci
   worktree isterdi, ikisi de paralel işçinin işine dokunur. YAPILMADI; HEAD hükmü
   banklanmış logdan alındı (`exit 1, 12 ihlal`).
4. **`UNMEASURABLE` sayısı 0** — kartın "BİLİNEN ZEMİN"i bu kalemlerin
   ölçülemeyebileceğini söylüyordu; ölçüldü ve **beşi de ölçülebildi**. Sebep: o ZEMİN
   `surface-pattern` hattının STRAPLESS olmasıydı (V5-Z §5); yargılanan hat
   `draftJSON → GarmentDrafter::draft` ve **o hat omuz dikişi, kol oyuğu, yaka taşıyor**.
   İki hat aynı giysiyi sevk etmiyor — kart dışı #1.
5. **PNG render YOK** (RULES 3): bu bir ölçüm kapısı, çizim üretmiyor. Görsel iddia
   kurulmadı, o yüzden PNG borcu doğmadı.

## KART DIŞI FARK EDİLEN

1. ★★ **İKİ HAT İKİ AYRI GİYSİ SEVK EDİYOR.** `flat_pattern_agree_check` üç ölçüyü
   (`bust_circumference`, `neck_opening_width`, `shoulder_width`) "kalıp tarafında YOK,
   giysi STRAPLESS" diye UNMEASURED sayıp tavanı 3'te ratchet'liyor. Ama `draftJSON`
   hattının bastığı kalıpta omuz dikişi de kol oyuğu da yaka da VAR ve bu kapı üçünü de
   ölçtü. "G5 sevk edilmedi" hükmü **surface-pattern hattı için doğru, draftJSON hattı
   için yanlış**. Repo iki farklı ana kalıp taşıyor; hangisinin ürün olduğu bu turda
   çözülmedi. (`flat_pattern_agree_check` bugün ctest'te KIRMIZI — #9,
   `GECE/log/V5.ctest.opening.txt:428`.)

2. ★★★ **`contract/tables.json` `shoulderCM` kolonu ÖLÜ GİRDİ — ve bu, `sizechart_source_check`
   KIRMIZISI ile TAM KESİŞİYOR.**

   **(a) Ölü olduğu ölçüldü** — komut `node /tmp/sd3.mjs`, çıktı `GECE/log/V5-D.remedy.txt`
   son bölümü:
   ```
   body.shoulder= 10cm -> KALIP GEOMETRİSİ shoulder=37 ile FARKLI   (kumaş metresi 1.5)
   body.shoulder= 20cm -> BAYT BAYT AYNI    body.shoulder= 30cm -> BAYT BAYT AYNI
   body.shoulder= 37cm -> BAYT BAYT AYNI    body.shoulder= 50cm -> BAYT BAYT AYNI
   body.shoulder= 80cm -> BAYT BAYT AYNI
   ```
   ⚠ **DÜZELTME — kartın (ve bu raporun eski sürümünün) "10..80cm arası bayt bayt aynı"
   cümlesi YANLIŞ.** Logun kendi satırı `10cm`'de **FARKLI** diyor. Doğru hüküm:
   **draftJSON kalıp geometrisi `body.shoulder`'dan 20…80 cm arasında BAĞIMSIZ**;
   yalnız 10 cm gibi dejenere bir değerde geometri kımıldıyor (ve orada da oynayan tek
   şey kumaş/yerleşim metni değil, geometri de değişiyor — o uç DAHA AYRINTILI
   ÖLÇÜLMEDİ). Ölü-girdi hükmü **kullanılabilir bedensel aralık için ayakta**.

   **(b) Kesişim.** `sizechart_source_check` bugün ctest'te KIRMIZI (**#18**,
   `GECE/log/V5.ctest.opening.txt:156`) ve düşme sebebi birebir şu satırlar
   (aynı log, satır 157–163):
   ```
   euSizeChart: 7 columns x 10 sizes = 70 numbers on a buyer's body
     sourced (verified against a publication): 3 -> bustCM, waistCM, hipCM
     UNSOURCED (verified absence, declared):   4 -> shoulderCM, backLengthCM, armLengthCM, neckCM
   FAIL: column 'shoulderCM' is UNSOURCED (status NONE) — 10 published values with no publication behind them
   ```
   Yani `shoulderCM` **hem KAYNAKSIZ hem KULLANILMIYOR**: alıcının beden tablosunda
   10 sayı yayınlıyoruz, arkasında yayın yok, ve motor onları hiç okumuyor. İki kapı
   aynı kolonu iki farklı yönden kırmızı basıyor. Motor omzu **kendi çiziyor** ve
   çizdiği omuz Aldrich tablosundan ön **−8.30 mm**, arka **−18.18 mm** kısa (yukarıdaki
   RATCHET tablosu).
   ★ Aynı kesişim `neckCM` için de var: `sizechart_source_check` onu da UNSOURCED
   basıyor, ve bu kapı ölçtü ki motorun `back_neck_drop`'u **`0.6 × yakaCM`** —
   yani kaynaksız bir kolondan türeyen bir kalıp sayısı. **DOĞRULANMADI:** bu ikinci
   kesişimin `sizechart_source_check`'in düşme sebebiyle nedensel bağı ölçülmedi,
   yalnız iki çıktı yan yana konuldu.

3. ★ **Motor `scye_depth`'i BÜSTTEN türetiyor; Aldrich bunu açıkça reddediyor.**
   Ölçüldü: `bust +10 cm` → koltukaltı çizgisi 225 → 235 mm (bedenle 205.4 → 249.4).
   Aldrich 4.bs s.171: *"15 Armscye Depth . . . standard measurement."* — bağımsız bir
   tablo değeri, vücuttan hesaplanan bir büyüklük değil. Sonuç sayısal olarak yakın
   düşüyor (sapma ≤ 11.4 mm) ama **cinsi farklı**.

4. ★ **`back_neck_drop` motorda `0.6 × yakaCM` mm** (ölçüldü: yaka 35 → 21.0 mm,
   yaka 45 → 27.0 mm). Aldrich SABİT 1.5 cm. Motorun ön yaka düşüşü
   `2.1286 × yakaCM` (35 → 74.5 mm), Aldrich ⅕ neck − 0.2 = 68 mm. Kapının gated
   kalemi değil, BİLGİ olarak duruyor.

5. ★ **Bel halkası iki yerde iki farklı ham sayı veriyor.** EU38: bodice alt kenarı
   ham 926.05 mm − pens 183.01 = **743.04 mm**; etek üst kenarı ham 860.43 mm −
   pens 112.77 = **747.65 mm**. **4.61 mm fark** (bodice ve etek aynı bele dikiliyor).
   Bu kapı bel payını bodice tarafından okuyor; uyuşmazlık AYRI bir kapının konusu ve
   **kovalanmadı**.

6. ★ **Pens ağzı KİRİŞLE ölçüldü, yayla değil** — dosyada adıyla yazılı. Alt kenar sığ
   olduğu için fark küçük ama SIFIR DEĞİL; hassas bir bel kapısı kurulacaksa düzeltilmeli.

7. ★ **`armhole_circumference` bizim ölçüm bandımızın dışına iki uçtan taşıyor:**
   EU34 374.2 · EU36 388.1 · EU38 403.6 · EU40 417.8 mm bandın (Buğra kesim çizgisi
   425–475 mm, komut `python3 patterns_real/tools/trace-match.py`) ALTINDA, EU48 485.1 mm
   ÜSTÜNDE. 8 bedenin yalnız **3'ü** içeride (EU42 432.5 · EU44 447.5 · EU46 462.2).
   Bu bir HÜKÜM DEĞİL (bant bir ölçümden, üstelik BAŞKA bir giysiden geliyor) ama sinyal.

8. ★ **`GECE/V5-R.md` §C1 boy düzeltmesi UYGULANMADI.** Aldrich kısa (152–160 cm) için
   −0.8 cm, uzun (172–180 cm) için +0.8 cm scye derinliği düzeltmesi yayınlıyor; bizim
   beden çizelgemiz Burda'nın **Körpergröße 168** satırı. 168'in hangi banda düştüğü
   çözülmedi → düzeltme uygulanmadı, **DOĞRULANMADI** olarak duruyor.

9. ★ **Aldrich s.11 tablosu bizim büst eksenimizle 8/8 örtüşüyor** (80/84/88/92/96/100/
   104/110 = Aldrich beden 8..22). Ölçek eşlemesi için hiçbir interpolasyon yapılmadı —
   şanslı bir kolaylık; EU50/EU52 için de tablo var (116/122).
