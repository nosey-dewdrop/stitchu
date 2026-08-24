# V5-D — draft_math_check: POZİTİF GEOMETRİ KAPISI (V5 madde 7)

Koşu: 2026-08-25, ağaç HEAD `87b0feb`. SÜRE TAVANI 60 dk — tavana gelindi, aşağıda
"YAPILAMAYAN" bölümüne yazıldı.

## YAPILAN (dosya yolu + hash)

| dosya | ne |
|---|---|
| `engine/tests/draft_math_check.mjs` | kapının kendisi; her eşiğin künyesi dosya başlığında, `GECE/V5-R.md`'den birebir |
| `GECE/log/V5-D.run.txt` | 8 bedenin tam çıktısı — `node engine/tests/draft_math_check.mjs` |
| `GECE/log/V5-D.bostest.txt` | §4.2 boş test, `12ad937`'ye karşı |
| `GECE/log/V5-D.mutasyon.txt` | §4.5 mutasyon, ±5mm, 8 ölçüde |
| `GECE/log/V5-D.remedy.txt` | v6 §4.7 kök teşhis + ÖLÇÜLMÜŞ çözüm adayı + kart dışı ölü-girdi ölçümü |
| `GECE/log/V5-D.addtest.txt` | `engine/CMakeLists.txt`'e eklenecek TEK satır (dosya KİLİTLİ, şef ekleyecek) |

Commit hash: bu dosyanın altında, "COMMIT" başlığında.

**DOKUNULMAYANLAR (emir gereği):** `engine/CMakeLists.txt` (kilitli — kartın 3.
maddesi askıya alındı), `engine/tests/sewability_check.mjs` (açılmadı, okunmadı),
`engine/src/` altında hiçbir dosya, `patterns_real/` PDF'leri, mevcut testler.
Yeni bağımlılık kurulmadı (yalnız node stdlib + repodaki `web/vendor/stitchu-engine.js`).

## ÖLÇÜLEN (sayı + onu basan komut)

Basan komut: `node engine/tests/draft_math_check.mjs` → `GECE/log/V5-D.run.txt`

**HÜKÜM: KAPI KIRMIZI. 12 ihlal. Kırmızı BIRAKILDI — eşik gevşetilmedi, sayı uydurulmadı.**
Yargı sayımı: **GEÇTİ 12 · KALDI 12 · KAYNAKSIZ 40** · **UNMEASURABLE 0**.

### Kalem kalem, 8 bedende (EU34..EU48)

| kalem | ölçülen bant (8 beden) | beklenen | künye | statü |
|---|---|---|---|---|
| scye_depth | 216.4 … 249.4 mm | Aldrich s.11 tablosu + s.14 "plus 0.5 cm" (205 … 242 mm) | Aldrich 4.bs, V5-R §C1, birincil-verbatim | KAYNAKSIZ (tolerans yayını yok) → RATCHET |
| armhole_circumference | 374.2 … 485.1 mm | **YAYIN YOK** | V5-R §C2: Aldrich oyuk çevresi yayınlamıyor | KAYNAKSIZ, kapıya girmiyor |
| shoulder_width_front | 109.21 … 127.95 mm | Aldrich s.11 tablosu (117.5 … 136 mm) | V5-R §C3 | KAYNAKSIZ → RATCHET |
| shoulder_width_back | 109.33 … 128.07 mm | tablo + 1 cm (127.5 … 146 mm) | V5-R §C3 s.14 "plus 1 cm" | KAYNAKSIZ → RATCHET |
| back_neck_drop | 20.4 … 23.4 mm | **15.0 mm, SABİT** | Aldrich s.14/16 "0-1 1.5 cm", V5-R §C5 | KAYNAKSIZ → RATCHET |
| bust_ease | 49.15 … 82.15 mm | **63.5 … 101.6 mm** | Threads #221 s.71 MINIMUM EASE + FIT AND EASE "Fitted" | **KALDI 4/8** |
| waist_ease | 40.10 … 53.32 mm | 25.4 … 60.0 mm | Threads MINIMUM EASE + Aldrich s.28 | GEÇTİ 8/8 |
| hip_ease | 17.20 … 23.20 mm | **50.8 … 76.2 mm** | Threads #221 s.71 MINIMUM EASE kalça 2-3 in | **KALDI 8/8** |

### İki KIRMIZI, adıyla

1. **hip_ease — 8 bedenin 8'i de yayınlanmış MİNİMUMUN ALTINDA.** Ölçülen kalça payı
   17.2–23.2 mm; Threads #221 s.71'in yayınladığı *MINIMUM EASE* kalça satırı 2–3 in =
   **50.8–76.2 mm**. Motorun payı yayınlanmış minimumun **üçte biri**.
2. **bust_ease — EU34/36/38/40 yayınlanmış MİNİMUMUN ALTINDA** (49.15 / 53.55 / 57.95 /
   62.35 mm < 63.5 mm). EU42 ve üstü bandın içinde.
   ★ Bu, `GECE/V5-R.md` §C4'ün ★★ bulgusunun **bağımsız teyididir**: reponun
   "büst +60 mm, kaynak Threads RTW + Aldrich" künyesi büst kalemini desteklemiyor.

### KÖK TEŞHİS (ölçüm, iddia değil) — `GECE/log/V5-D.remedy.txt`

Motorun payı **ÇARPIMSAL**, yayınlanmış bant **TOPLAMSAL**:

- kalça payı / kalçaCM = **0.2000, 8 bedende BİT-SABİT** → motor kalça halkasını
  `10.2 × kalçaCM` mm çiziyor, yani pay = %2. Yayınlanmış bant bedenden bağımsız
  50.8–76.2 mm istiyor.
- büst payı / büstCM = 0.6144 → 0.7468 (bedenle **büyüyor**): motor `11.1 × büstCM − 38.85` mm
  çiziyor. Küçük bedenler minimumun altında kalıyor, büyükler bandın içine giriyor.
- Yani hata "bir sabit yanlış" değil, **payın CİNSİ yanlış**.

### ÖLÇÜLMÜŞ ÇÖZÜM ADAYI (v6 §4.7 şartı) — `node /tmp/remedy.mjs`

Motor kaynağına dokunmak yasak olduğu için gereken büyüklük, aynı motora **gövde
girdisi kaydırılarak** ölçüldü (bu bir teşhis vekilidir, sevk edilecek düzeltme değil):

| aday | 8 bedende ölçülen pay | bant | sonuç |
|---|---|---|---|
| büst +1.0 cm | 60.25 … 93.25 mm | 63.5 … 101.6 | TUTMUYOR |
| **büst +1.5 cm** | **65.80 … 98.80 mm** | 63.5 … 101.6 | **HEPSİ BANTTA ✔** |
| büst +2.0 cm | 71.35 … 104.35 mm | 63.5 … 101.6 | TUTMUYOR (üst uçtan taşıyor) |
| **kalça +3.5 … +5.0 cm** | 52.90 … 74.20 mm | 50.8 … 76.2 | **HEPSİNDE BANTTA ✔** |

Yani: büstte gereken ek pay **+16.65 mm halka** (girdi +1.5 cm karşılığı), kalçada
**+35.7 … +51.0 mm halka**. Bu sayılar ölçüldü, türetilmedi.

### RATCHET (tolerans YAYINLANMAMIŞ kalemler)

`GECE/V5-R.md` §A'nın hükmü kesin: apparel kalıp toleransı için **YAYIN YOK**
(ASTM D5585 bir VÜCUT tablosu; ISO 8559-3 "garment dimensions are not included";
1/32" Open Library tam-metninde 73 kez geçiyor, hiçbiri giyim değil). O yüzden
"Aldrich'ten şu kadar sapabilir" diye yazılabilecek bir sayı yok. Uydurmak yerine
bugünkü en kötü sapma DONDURULDU; tavan yalnız düşebilir. Emsal:
`engine/tests/flat_pattern_agree_check.mjs` `UNMEASURED_RATCHET`.

| kalem | bugün en kötü \|sapma\| | tavan | işaret |
|---|---|---|---|
| scye_depth | 11.4000 mm (EU34) | 11.4000 | motor **DERİN** çiziyor |
| shoulder_width_front | 8.2988 mm (EU46) | 8.298841 | motor **KISA** çiziyor |
| shoulder_width_back | 18.1823 mm (EU46) | 18.182277 | motor **KISA** çiziyor |
| back_neck_drop | 8.4000 mm (EU48) | 8.4000 | motor **DERİN** çiziyor, ve **bedenle büyüyor** (Aldrich SABİT diyor) |

★ `back_neck_drop` işareti ayrıca bir SINIF hatası gösteriyor: Aldrich'in kuralı bütün
bedenlerde 1.5 cm SABİT; motorunki 20.4 → 23.4 mm arası **graduate ediliyor**. Yayınlanan
üç dolaşan alternatiften ("⅓ yaka genişliği", "2 cm sabit", "ön düşüş = genişlik + 1 cm")
hiçbiri bu dosyaya sokulmadı — V5-R §C5 üçünü de YAYIN YOK diye işaretliyor.

### §4.2 BOŞ TEST — `GECE/log/V5-D.bostest.txt`

`git worktree add --detach /tmp/v5pre-d 12ad937` → kapı kopyalandı → koşuldu:
**exit 1, 12 ihlal.** Yani kırmızı DÜŞÜYOR, kapı **VACUOUS DEĞİL**.

**AMA BU KANIT ZAYIF VE SEBEBİ ÖLÇÜLDÜ.** Kapının okuduğu iki girdi de faz-öncesi
commit ile HEAD arasında bayt bayt aynı:
- `web/vendor/stitchu-engine.js` → `3d5e7d59…` (12ad937 = HEAD)
- `contract/tables.json` → `11297ee0…` (12ad937 = HEAD)

Çıktı diff'i **0 satır**. Dürüst etiket: **"VACUOUS DEĞİL, ama 12ad937 karşısında
AYIRT ETMİYOR"** — çünkü bu gecenin fazı motoru hiç değiştirmedi. Kapının gerçekten
ısırdığının kanıtı mutasyondur, boş test değil.

### §4.5 MUTASYON — `GECE/log/V5-D.mutasyon.txt`

Kanca `V5D_MUTATE=<ölçü>:<±mm>` ÖLÇÜLEN değere ekler (eşiğe değil), koşuda ekrana basılır.
Referans: 12 ihlal.

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

Geri alma (kancasız aynı komut): **12 ihlal, 0 RATCHET KIRILDI satırı.**

★ **+5 mm HER KALEMDE BOZMA DEĞİLDİR, ÖLÇÜLDÜ:** omuz kalemlerinde sapma NEGATİF
(motor Aldrich'ten kısa çiziyor), o yüzden +5 mm |sapmayı| küçültür. Bozan yön EKSİ.
Bu yüzden her kalem iki yönde de bozuldu.

★ **KAPININ ISIRMADIĞI ÜÇ KALEM, ADIYLA:**
- `waist_ease`: ±5 mm yakalanmıyor, çünkü ölçülen 40.10–53.32 mm ve **yayınlanmış** bant
  25.4–60 mm; ±5 mm hâlâ bandın içinde. Bandı daraltmak sayı uydurmak olurdu, DARALTILMADI.
  Yakalandığı eşik ölçüldü: `V5D_MUTATE=waist_ease:20` → **20 ihlal**.
- `hip_ease`, `bust_ease`: zaten bandın dışındalar; sayı satırda kayıyor (EU38 18.80 → 23.80)
  ama ihlal SAYISI artmıyor.
- `armhole_circumference`: **KAYNAKSIZ = kapıya hiç girmiyor**, mutasyon hiçbir şey
  değiştirmiyor. Bu KASITLI: yayınlanmış bir hedef oyuk çevresi yok (V5-R §C2), ve
  yayın yokken kapı kurmak yasak.

## YAPILAMAYAN (sebep)

1. **`engine/CMakeLists.txt` GÜNCELLENMEDİ** — dosya kilitli (aynı anda başka işçi
   yazıyor). Eklenecek tam satır `GECE/log/V5-D.addtest.txt`'de, kopyala-yapıştır hazır:
   `add_test(NAME draft_math_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/draft_math_check.mjs)`
   (biçim `engine/CMakeLists.txt:131` `flat_pattern_agree_check` emsalinden birebir).
   ⚠ **ŞEFE UYARI — RULES 9 ÇATIŞMASI:** bu kapı bugün KIRMIZI. Satır eklenirse
   ctest'in kırmızı AD kümesi 6 → 7 olur; RULES 9 "kırmızı AD kümesi büyüyemez" diyor.
   Ekleme kararı şefindir. Bu bir eşik gevşetme gerekçesi DEĞİLDİR — kırmızının sebebi
   iki YAYINLANMIŞ bandın ihlali ve düzeltmesi ölçüldü (yukarıda).
2. **Tam ctest koşulmadı** — emirle atlandı (şef koşacak). Onun yerine kendi testi
   doğrudan koşuldu, çıktı `GECE/log/V5-D.run.txt`. Bu yüzden
   `GECE/log/V5-D.ctest.after.txt` ve `GECE/log/V5-D.reddiff.txt` **ÜRETİLMEDİ**.
3. **`engine/tests/sewability_check.mjs`** — emirle açılmadı, okunmadı, oluşturulmadı.
4. **`UNMEASURABLE` sayısı 0** — kartın "BİLİNEN ZEMİN"i bu kalemlerin ölçülemeyebileceğini
   söylüyordu; ölçüldü ve **beşi de ölçülebildi**. Sebep: o ZEMİN `surface-pattern`
   hattının STRAPLESS olmasıydı (V5-Z §5); kartın yargılamamı emrettiği hat
   `draftJSON → GarmentDrafter::draft` ve **o hat omuz dikişi, kol oyuğu, yaka taşıyor**
   (`Bodice Front`/`Bodice Back` konturlarında köşeleriyle duruyor). İki hat aynı giysiyi
   sevk etmiyor — aşağıda kart dışı #1.
5. **PNG render YOK** (RULES 3): bu bir ölçüm kapısı, çizim üretmiyor. Görsel iddia da
   kurulmadı, o yüzden PNG borcu doğmadı.

## KART DIŞI FARK EDİLEN

1. ★★ **İKİ HAT İKİ AYRI GİYSİ SEVK EDİYOR.** `flat_pattern_agree_check` üç ölçüyü
   (`bust_circumference`, `neck_opening_width`, `shoulder_width`) "kalıp tarafında YOK,
   giysi STRAPLESS" diye UNMEASURED sayıp tavanı 3'te ratchet'liyor. Ama `draftJSON`
   hattının bastığı kalıpta omuz dikişi de kol oyuğu da yaka da VAR ve bu kapı üçünü de
   ölçtü. Yani "G5 sevk edilmedi" hükmü **surface-pattern hattı için doğru, draftJSON
   hattı için yanlış**. Repo iki farklı ana kalıp taşıyor ve hangisinin ürün olduğu
   bu turda çözülmedi.
2. ★★ **`contract/tables.json` `shoulderCM` kolonu ÖLÜ GİRDİ — ölçüldü.**
   `body.shoulder` 20 / 30 / 37 / 50 / 80 cm verildiğinde `draftJSON`'ın bastığı
   **kalıp geometrisi bayt bayt aynı**; tek bir koordinat kımıldamıyor (10 cm'de yalnız
   kumaş metresi metni oynuyor, kalıp yine aynı). Komut ve çıktı:
   `GECE/log/V5-D.remedy.txt` son bölüm. V5-R KART DIŞI #5 bu kolonu "kaynaksız ve yanlış
   büyüklük şüphesi altında" diye işaretlemişti; buna ek olarak artık **KULLANILMADIĞI**
   da ölçülü. Motor omzu kendi çiziyor ve çizdiği omuz Aldrich tablosundan
   ön −8.30 mm / arka −18.18 mm kısa.
3. ★ **Motor `scye_depth`'i BÜSTTEN türetiyor; Aldrich bunu açıkça reddediyor.**
   Ölçüldü: `bust +10 cm` → koltukaltı çizgisi 225 → 235 mm (bedenle 205.4 → 249.4).
   Aldrich 4.bs s.171: *"15 Armscye Depth . . . standard measurement."* — yani bağımsız
   bir tablo değeri, vücuttan hesaplanan bir büyüklük değil. Sonuç sayısal olarak yakın
   düşüyor (sapma ≤ 11.4 mm) ama **cinsi farklı**.
4. ★ **`back_neck_drop` motorda `0.6 × yakaCM` mm** (ölçüldü: yaka 35 → 21.0 mm,
   yaka 45 → 27.0 mm). Aldrich SABİT 1.5 cm. Ayrıca motorun ön yaka düşüşü
   `2.1286 × yakaCM` (35 → 74.5 mm), Aldrich ⅕ neck − 0.2 = 68 mm. Bu ikisi kapının
   gated kalemi değil, burada BİLGİ olarak duruyor.
5. ★ **Bel halkası iki yerde iki farklı ham sayı veriyor, pens ağızları düşülünce
   yaklaşıyorlar.** EU38: bodice alt kenarı ham 926.05 mm − pens 183.01 = **743.04 mm**;
   etek üst kenarı ham 860.43 mm − pens 112.77 = **747.65 mm**. **4.61 mm fark** (bodice ve
   etek aynı bele dikiliyor). Bu kapı bel payını bodice tarafından okuyor; 1.63 mm'lik
   uyuşmazlık AYRI bir kapının konusu ve **kovalanmadı**.
6. ★ **Pens ağzı KİRİŞLE ölçüldü, yayla değil** — dosyada adıyla yazılı. Alt kenar sığ
   olduğu için fark küçük ama SIFIR DEĞİL; hassas bir bel kapısı kurulacaksa bu
   düzeltilmeli.
7. ★ **`armhole_circumference` bizim ölçüm bandımızın dışına iki uçtan taşıyor:**
   EU34 374.2 · EU36 388.1 · EU38 403.6 · EU40 417.8 mm bandın (Buğra kesim çizgisi
   425–475 mm) ALTINDA, EU48 485.1 mm ÜSTÜNDE. 8 bedenin yalnız **3'ü** içeride
   (EU42 432.5 · EU44 447.5 · EU46 462.2). Bu bir HÜKÜM DEĞİL (bant bir ölçümden,
   üstelik BAŞKA bir giysiden geliyor) ama bir sinyal.
8. ★ **`GECE/V5-R.md` §C1 boy düzeltmesi UYGULANMADI.** Aldrich kısa (152–160 cm) için
   −0.8 cm, uzun (172–180 cm) için +0.8 cm scye derinliği düzeltmesi yayınlıyor; bizim
   beden çizelgemiz Burda'nın **Körpergröße 168** satırı. 168 hangi banda düşüyor
   çözülmedi → düzeltme uygulanmadı ve bu **DOĞRULANMADI** olarak duruyor.
9. ★ **Aldrich s.11 tablosu bizim büst eksenimizle 8/8 örtüşüyor** (80/84/88/92/96/100/
   104/110 = Aldrich beden 8..22). Yani ölçek eşlemesi için hiçbir interpolasyon
   yapılmadı — bu şanslı bir kolaylıktı, EU50/EU52 için de tablo var (116/122).
