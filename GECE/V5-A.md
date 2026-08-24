# V5-A — sewability_check: YEDİ MADDE TEK HÜKÜMDE

Rapor kartı: `GECE/KART/V5-RAP.md`. Bu dosya, kesilen oturumun diske düşürdüğü
loglardan yazıldı; **loglardaki her sayı, komut bugün yeniden koşturularak
doğrulandı** (aşağıda "BUGÜN YENİDEN KOŞTURULDU").

STATÜ (banklanan koşu, `GECE/log/V5-A.bostest.txt:121`): **kapı KIRMIZI ve
KIRMIZI BIRAKILDI** — `exit=1`. Eşik gevşetilmedi, motor kaynağı değiştirilmedi,
mevcut hiçbir test elleçlenmedi.

⚠ **BUGÜNKÜ ÇALIŞMA AĞACI FARKLI HÜKÜM VERİYOR — ÖLÇÜLDÜ, §RATCHET'e bak.**

---

## YAPILAN

| ne | yol |
|---|---|
| kapı (TEK yeni dosya) | `engine/tests/sewability_check.mjs` |
| §4.2 boş test | `GECE/log/V5-A.bostest.txt` |
| §4.5 mutasyon | `GECE/log/V5-A.mutasyon.txt` |
| tam ctest (koşu sonrası) | `GECE/log/V5-A.ctest.after.txt` |
| kırmızı ad farkı | `GECE/log/V5-A.reddiff.txt` |
| 8 bedenin çıktısı | `GECE/log/V5-A.8beden.txt` |
| bu rapor | `GECE/V5-A.md` |

Commit'ler (`git log --oneline`):
- `d756284` — *gece v5-a: sewability gate over the shipped draft — seven named items, 211 notches off the cut line*
- `d566a8a` — *bank the v5-a and v5-d gates the killed session left untracked: both test files, empty-test and mutation proofs, opening ctest*

`engine/CMakeLists.txt` **DEĞİŞTİRİLMEDİ** — gerekçe §KARAR.

---

## ÖLÇÜLEN (sayı + onu basan komut)

Komut: `node engine/tests/sewability_check.mjs`
Zemin (`/tmp/sew.out:6`): **16 draft** (2 sevk edilen spec × 8 beden EU34..EU48),
**112 parça**, **96 kapalı-aday kontur**. Motor `web/vendor/stitchu-engine.js`
üzerinden yüklendi (emsal `bugra-parity.mjs:18`).

### Yedi maddenin HER BİRİ için bugünkü hüküm

| madde | hüküm | sayı (komut çıktısının satırı) |
|---|---|---|
| 1 dikiş çifti uzunluk eşitliği | **ABSENT** | dikiş grafiği taşıyan alan **0** / 112 parça (`seams/seamGraph/edges/edgeNames/pairs/stitches` = 0) |
| 2 çentik eşleşmesi | **KIRMIZI** | işaretli parça **80**, `notches` kanalında toplam **607** işaret → kenar çentiği **233**, bunlardan tabanı kesim çizgisinde OLMAYAN **211**; sınıflanamayan **374** (%61.6) = uzunluk≥pay **32** + kenardan uzak **342** (en uzağı **78.9269mm**) |
| 3 kapalılık / kendini kesme | **YEŞİL** | 96 kontur · AÇIK **0** · gerçek kesişme **0** (örnekleme adımı ≤2mm) |
| 4 köşe açısı toplamı (Hopf Umlaufsatz) | **YEŞİL** | 96 kapalı kontur · bant dışı **0** · max \|Σ−360\| = **0.0000°** (bant ±1° [E3]) |
| 5 GEÇİŞ (donning) | **YARIM** — iki ABSENT | beyan edilen kapanma donanımı **0**/16 draft → giysi baştan geçmek zorunda; sevk edilen rehber **8** kez ALICIYA bu kontrolü yaptırıyor, artefakt sayıyı taşımıyor |
| 6 geri projeksiyon | **ABSENT** | **0** alet, **0** kapı (`grep -rniE "backProject\|reproject\|wrap3d\|liftTo3D" engine/` → 0 sonuç) |
| 7 draft_math_check | **ABSENT** | bu kartın işi değil (V5-D) |

**Toplam ADIYLA basılan ihlal kalemi: 585** · ADIYLA basılan ihlal SATIRI: **1**
(`FAIL [2] 211 kenar çentiğinin tabanı kesim çizgisinde değil`).

**8 bedenin hepsi kırmızı** (`GECE/log/V5-A.8beden.txt`), off-boundary çentik
beden başına **29/27/29/28/26/25/23/24**.

### 7 ABSENT — ADIYLA ve kök sebebiyle

Komutla sayıldı: `node engine/tests/sewability_check.mjs | grep -c "^ABSENT:"` → **7**.

| # | madde | ABSENT'in adı | KÖK SEBEP |
|---|---|---|---|
| 1 | 1 | dikiş çifti uzunluk eşitliği | **Sevk edilen artefakt (draftJSON) DİKİŞ GRAFİĞİ TAŞIMIYOR.** 112 parçada `seams/seamGraph/edges/edgeNames/pairs/stitches` alan sayısı = **0**. Parça başına yalnız kapalı kontur (`cutLine`) + isimsiz çentik çizgileri var; hangi kenarın hangi kenara dikildiği artefaktta yok → çift uzunlukları ADI KONARAK karşılaştırılamaz. |
| 2 | 2 | çentik ÇİFTİ eşleşmesi | Aynı boşluk (#1): eşleştirme bir dikiş grafiği ister. Karşılığı aranamayan çentik **233**. NATIVE tarafta `engine/tests/notch_alignment_check.cpp` yan-dikiş çentiğini yargılıyor ama kendi **satır 23'ü** oyuk↔taç çentik ÇİFTİNİ kapsam DIŞI ilan ediyor (`PatternPiece.notches verified: 0`). |
| 3 | 2 | işaret TÜRÜ alanı [E2b] | `notches` **tek ve TİPSİZ bir kanal**: `type` yalnız `move`/`line`. **374** işaretin (607'nin %61.6'i) kenar çentiği mi, katlama çizgisi mi, iç işaret mi, havada duran çentik mi olduğu artefaktan ÇIKARILAMIYOR → yargılanmadı. Geçiş değil, ölçülmüş boşluk. |
| 4 | 5 | "en dar halka baş/omuz çevresinden geçiyor mu" | Bitmiş yaka açıklığı bir HALKA'dır; sevk edilen artefaktta **yaka kenarı adlandırılmış bir kenar değil** — parça konturunun isimsiz bir parçası. Yarım alet NATIVE tarafta duruyor: `engine/src/wearability.hpp:68,75,80` (`finishedNeckOpeningMM`, `hasDonningOpening`; kapılar `wearability_check`, `wearable_check`) ama JS artefaktına inmiyor. |
| 5 | 5 | kapanma donanımının SATILAN BOYU | **Ölçülemez, ve sebebi yayında:** V5-R §D3 — hiçbir fermuar ÜRETİCİSİ bitmiş-boy merdiveni yayınlamıyor (YKK kataloğu + Coats/Opti veri sayfası açıldı: sıfır cm/inç boy; zincir metreyle satılıp siparişe göre kesiliyor). Boy merdiveni bir STOKLAMA konvansiyonu, fiziksel kısıt değil. |
| 6 | 6 | geri projeksiyon (2B→3B) | **Motorda YOK.** `engine/src/drape.hpp` kendi satır 12'si: *"no seam-sewing of multiple panels — one panel, one hang."* Ölçülecek bir şey olmadığı için bu bölüm sayı basamıyor: **0 alet, 0 kapı**. |
| 7 | 7 | draft_math_check | **Bu kartın işi değil** — ayrı kart (V5-D). Bilerek ölçülmedi; V5-D'nin bugünkü hükmü `GECE/V5-D.md`. |

Yedisinin hiçbiri kapıyı YEŞİL yapmak için kullanılmadı; yedisi de çıktıda
`ABSENT: [madde n] …` satırı olarak adıyla basılıyor.

### Eşiklerin künyesi (hepsi dosya başlığında, `GECE/V5-R.md`'den)
- `ON_BOUNDARY_TOL = 0.79375mm` [E1] → **yayın YOK** (V5-R §A: ASTM/ISO/Handford/
  Joseph-Armstrong/Cooklin/Gerber/Lectra'da dayanak bulunamadı; Open Library'de
  "tolerance of 1/32" 73 hit, hiçbiri giyim değil). Başlıkta **"ev değeri"** diye
  yazıldı, "üretim standardı" DİYE YAZILMADI. Tanığı `surfacepattern.cpp:19`.
- Çentik derinliği < dikiş payı [E2] → V5-R §F ★ türetilebilir kural (Cutex 1/8"×1/4"
  çentikleyici + Fasanella "seam blowout"). Pay uydurulmadı, artefaktın kendi
  `seamAllowance`'ından okundu (bu koşuda 15mm).
- Dönme = ±360° [E3] → uydurulmuş sayı değil, **Hopf Umlaufsatz** (theorem of turning
  tangents), adı dosya başlığında. Sayısal artık bandı için yayın YOK; bant şu ölçümden —
  `max |Σ−360|` = **0.0000°**.
- Geçiş zarfı [E4] → **ANSUR II NATICK/TR-15/007** kadın n=1986: baş çevresi
  5/50/95 = **532/560/597mm** (ölçü 46, s.135–136), omuz çevresi **944/1027/1119mm**
  (ölçü 68, s.179–180). Kapı bir GEÇİŞ EŞİĞİ KOYMUYOR, zarfı basıyor — çünkü
  "giysi için minimum baş açıklığı" hiçbir standartta YAYIN YOK (V5-R §D1).

---

## ★ §4.7 — KÖK TEŞHİS: 211 çentiğin tabanı neden kesim çizgisinde değil?

**Çentik işaretleri, parçanın kendi sınırından bağımsız bir x'e basılıyor.**
Ölçüm (EU38, `Top Front`): çentik (244.4, 112.5) → (232.4, 112.5). 244.4, parçanın
**maksimum x**'i ve o x'e ancak y≈575'te (yan dikişin alt ucunda) ulaşılıyor;
y=112.5'te gerçek sınır x≈173–189 civarında. Yani çentik, sınırdan **43.10mm**
uzakta havada duruyor. Aynı çentik EU34'te **28.83mm**, EU48'de **78.93mm** uzakta —
**sapma bedenle büyüyor**, yani gürültü değil, sistematik bir inşa hatası.

İkinci bulgu (aynı kök): `notches` **tek ve TİPSİZ bir kanal** ve en az üç tür
işaret taşıyor — kenar çentiği (12mm), bir **387.1mm'lik katlama/orta çizgisi**
(`princess_scoop_dress EU34 'Bodice Center Back' işaret #4`, çıktıda adıyla),
ve **~0.4mm adımla inen bir iç işaret merdiveni** (aynı parçada işaret #6..#15:
18.98 → 15.22mm). Artefaktta bunları ayıran hiçbir alan yok.
Kapı, ayıramadığını YARGILAMADI ama SAYDI ve adıyla bastı (374 işaret).

**Alıcı açısından ne demek:** kalıbı basıp çentikleri kesmeye kalkarsa işaretlerin
çoğu kumaş panelinin ORTASINA denk geliyor; kenar çentiklerinin de 211'i
(medyan 11.0mm) yanlış yerde. Bu, Etsy ayarında bir kalıpta doğrudan kusurdur.

### ÖLÇÜLMÜŞ ÇÖZÜM ADAYI
Kenar çentiğini, hesaplanan noktadan değil **kesim çizgisi üzerindeki en yakın
noktadan** başlat (sınıra izdüşür, sonra içe doğru normalde `depth` kadar çiz).
Maliyeti ÖLÇÜLDÜ, komut:
`V5A_DUMP=9999 node engine/tests/sewability_check.mjs | grep ... | awk ...`
→ 211 çentiğin izdüşüm mesafesi: **min 0.0000 · medyan 11.0000 · ort 9.7488 ·
max 15.0000 mm**. Hepsi dikiş payı bandının (15mm) İÇİNDE kalıyor: izdüşüm
çentiği paydan dışarı taşırmaz, `notch_off_boundary` sayacı inşaat gereği
**211 → 0** olur.

⚠ Bu aday **342 "kenardan uzak" işareti KURTARMAZ** (en uzağı 78.9269mm): onlar
izdüşürülemez, yeniden türetilmeleri gerekir — ve önce `notches` kanalına bir
**TÜR ALANI** eklenmeden hangisinin çentik hangisinin iç işaret olduğu bilinemez.
Bu iki iş ayrı ve bu kartın dışında; **YAPILMADI**, çünkü kart `engine/src/`
altında kaynak değiştirmeyi YASAKLIYOR (kapı kartı).
★ İkinci bir aday (tür alanı eklemenin maliyeti) **ÖLÇÜLMEDİ** — uydurulmadı.

---

## §4.2 BOŞ TEST — **VACUOUS DEĞİL** (ama ayırt etmiyor)

Log: `GECE/log/V5-A.bostest.txt`. Usul (log satır 2–4):
`git worktree add --detach /tmp/v5pre 12ad937`, sonra
`V5A_ENGINE=/tmp/v5pre/web/vendor/stitchu-engine.js node engine/tests/sewability_check.mjs`.
`12ad937`'de `sewability_check` **YOK** (log satır 6: "0 dosya (0 beklenir)").

**HÜKÜM — exit kodu ADIYLA: `exit=1`** (`GECE/log/V5-A.bostest.txt:121`), off-boundary
**211**. Kapı faz-öncesi artefaktta da düşüyor → kartın ölçütüne göre **boş DEĞİL**.

★ Dürüst okuma: sayılar HEAD ile **birebir aynı** (211/211, kesişme 0/0).
Yani kapı iki ağacı **ayırt etmiyor**; bulduğu kusur V5 fazının ürünü değil,
**DEVRALINMIŞ**tır. Kapının gerçekten ısırdığının kanıtı mutasyondur.

## §4.5 MUTASYON — üç bozma da ISIRIYOR

Log: `GECE/log/V5-A.mutasyon.txt`. Komut: `V5A_MUTATE=<mod> node engine/tests/sewability_check.mjs`.

| mutasyon | zemin | mutasyonlu | geri alınca |
|---|---|---|---|
| `selfcross` — `'Top Front'` cutLine[13] ↔ cutLine[40] TAKAS | kesişme **0**, dönme bant dışı **0**, ihlal 1 | **kesişme 0 → 44** ve dönme bant dışı **0 → 8** (max \|Σ−360\| 0.0000° → 360.0000°) → **3 ihlal** | kesişme **0**, bant dışı **0**, ihlal 1 |
| `notch-off` — `'Top Back'` işaret #3 (taban 0.3121mm) +5mm kaydırıldı | off-boundary **211** | **211 → 216** | **211** |
| `notch-deep` — aynı işaret dikiş payından 5mm DERİN | uzunluk≥pay **32** | **32 → 45** | **32** |

Madde 3 ve 4 yeşilden kırmızıya gidip **aynen** geri döndü → o bölümler boş değil.
Madde 2 zaten kırmızı olduğu için orada "kırmızı→yeşil" ayağı gösterilemedi;
gösterilen şey sayacın yönlü hareket etmesi ve aynen geri dönmesi
(**211→216→211**, **0→44→0**).

---

## ★ ctest DURUMU — kartın "KESİLMİŞ LOG" uyarısı ÖLÇÜLDÜ ve YANLIŞ ÇIKTI

Kart V5-RAP md.1 son maddesi: *"`GECE/log/V5-A.ctest.after.txt` KESİLMİŞ bir logdur
(test 106'da duruyor, hüküm satırı YOK)."* **Bu bugün ölçüldü ve doğru değil.**

Komut ve çıktı:
```
$ grep -n "tests passed\|Total Test time" GECE/log/V5-A.ctest.after.txt
420:95% tests passed, 6 tests failed out of 111
422:Total Test time (real) = 284.78 sec
$ wc -l GECE/log/V5-A.ctest.after.txt
434
```
Log **112/112'ye kadar gidiyor** (satır 418: `112/112 Test #112: vocab_reference_check … Passed 5.25 sec`),
hüküm satırı **satır 420'de duruyor**, ve FAILED listesi satır 426–433'te
adıyla basılı:
`flat_pattern_agree_check(9) · flat_artifact_census(10) · style_check(11) ·
sizechart_source_check(18) · contract_check(89) · figure_check(94)`.
Koşmayan: `h10_gate_check (Disabled)`.

Buna rağmen **"ctest geçti" DENMİYOR ve DENEMEZ** — 6 test KIRMIZI. Söylenen şey
şudur: kırmızı AD kümesi büyümedi. `GECE/log/V5-A.reddiff.txt` → before 6 = after 6,
**FARK YOK**; açılış logu `GECE/log/V5.ctest.opening.txt` da aynı 6 adı
(satır 428–433) ve aynı 111 testi basıyor (302.32 sn, `EXIT=8`).
**Bu ctest'i BU vardiyada koşmadım** (kart yasakladı, paralel işçi `engine/` ağacında);
yukarıdaki tek iddia, banklanmış iki logun metnidir.

---

## ★ RATCHET — BUGÜNKÜ ÇALIŞMA AĞACI KAPIYI **PASS** BASIYOR (banklanan koşuda KIRMIZI'ydı)

Kartın "logdaki sayıyı komutu yeniden koşturarak doğrula" emri gereği
`node engine/tests/sewability_check.mjs` bugün koşuldu. **Sayılar birebir tuttu**
(211 · 32 · 342 · 0 · 0 · 0, ABSENT 7, ihlal kalemi 585) **ama exit kodu 1 değil, 0.**

Sebep ölçüldü, gizli değil: paralel işçi (kart V5-E) şu anda `engine/tests/` altında
çalışıyor ve exit kodunu bir RATCHET tabanına bağlamış.
```
$ git status --short engine/tests/
 M engine/tests/draft_math_check.mjs
 M engine/tests/sewability_check.mjs
?? engine/tests/v5-ratchet-baseline.json      ← HENÜZ TAKİPSİZ
```
Bugünkü çıktının son iki satırı:
```
notch_off_boundary  ölçülen 211  tavan 211   (… mark_over_seam_allowance 32/32,
mark_far_from_edge 342/342, unclosed_contour 0/0, self_intersection 0/0,
turn_out_of_band 0/0, engine_error 0/0)
PASS sewability_check — RATCHET: 0 tavan aşımı · adıyla basılan ihlal kalemi 585
```
**Hüküm yumuşatılmıyor, sadece nereye bağlandığı değişiyor:** 211 çentik hâlâ
yanlış yerde ve hâlâ adıyla basılıyor. Ama "kapı yeşil" cümlesi bundan sonra
**"ihlal 0" değil, "ihlal ≤ dondurulmuş tavan"** demektir. Bu ayrım raporda
kalmalı; aksi halde `PASS sewability_check` satırı okuyanı yanıltır.
Bu değişikliğe **DOKUNMADIM** (dosya kilidi) — kararı şefindir.

---

## YAPILAMAYAN (sebep)

1. **Madde 1'in gerçek yargısı** — sevk edilen artefakt dikiş grafiği taşımıyor;
   eşleştirmeyi landmark tahminiyle uydurmak §5.5'e aykırı olurdu. ABSENT bırakıldı.
2. **Madde 5'in halka ölçümü** — yaka kenarı artefaktta adlandırılmış bir kenar değil.
3. **`add_test` satırı** — §KARAR (aşağıda).
4. **Görsel PNG kanıtı (RULES 3)** — bu kapı sayı basıyor, render etmiyor; görsel
   iddia da kurulmadı, o yüzden PNG borcu doğmadı.
5. **HEAD sürümünün bugün yeniden koşulması** — çalışma ağacındaki iki test dosyası
   paralel işçi tarafından DEĞİŞTİRİLMİŞ durumda; HEAD sürümünü koşmak ya `git stash`
   ya ikinci bir worktree isterdi, ikisi de paralel işçinin işine dokunur. **YAPILMADI.**
   HEAD sürümünün hükmü banklanmış logdan alındı (`exit=1`).

## KARAR — `add_test` satırı BİLEREK EKLENMEDİ

Kart V5-A md.3 `add_test(NAME sewability_check ...)` eklemeyi söylüyordu. Eklenmedi:
kapı KIRMIZI ve eklemek **yeni bir kırmızı AD** doğurur; RULES 9 bunu açıkça yasaklıyor
(*"kalıtsal kırmızı AD kümesi büyüyemez"*). İki emir çatışıyor; çatışma gizlenmedi,
**geri alınabilir olan** seçildi: dosya diskte, tek komutla koşuyor, tek satırla
ctest'e girer. **Kapıyı yeşil yapmak için hiçbir eşik gevşetilmedi.**
★ Not: RATCHET katmanı (yukarıda) bu kararı yeniden açıyor — kapı artık exit 0
bastığı için `add_test` kırmızı ad DOĞURMAZ. Karar şefin.

---

## KART DIŞI FARK EDİLEN (dokunulmadı)

1. ★★ **Sevk edilen rehber, motorun ölçmediği bir kontrolü ALICIYA yaptırıyor.**
   `guideSteps[2]` birebir: *"Check the neck opening against your head circumference
   — a top has no zipper, it must slip over your head."* 16 draftın 8'inde bu cümle
   var, beyan edilen kapanma donanımı **0**, ve motor bitmiş yaka açıklığını hiç
   basmıyor. Madde 5 boşluğu teorik değil: **sevk edilen metnin içinde duruyor.**
2. ★ **`notches` kanalında TÜR ALANI YOK.** ASTM D6673-10 çentik türlerini katman
   4/80/81/82/83 diye ayırıyor (V5-R §F); bizim tek kanalımız DXF ihracatında da bu
   ayrımı taşıyamaz.
3. ★ `princess_scoop_dress` `Bodice Center Back` parçasında **387.1mm tek bir "çentik"**
   var — katlama çizgisi olmalı ama `foldLine` alanı ayrı duruyor; aynı bilgi iki kanalda.
4. ★ Repo iki üretim toleransı taşıyor (`kProdTolMM 0.79375` / `pairedSeamTolerance 3.0`);
   bu kapı sıkı olanı aldı. Hangisinin hangi kapıda koştuğu **hâlâ haritalanmadı**.
5. ★ `engine/tools/virtual-sew.js` sabit komut İNDEKSLERİ ile dikiş eşliyor
   (`cmdLen(bcf, 6)` gibi) ve ölü `engine/dist/stitchu-engine.js`'i yüklüyor —
   yani bugün koşmuyor. Madde 1'in tek mevcut JS denemesi budur ve çürük. DOKUNULMADI.
6. ★ **Kapının kendi özet satırı kendi sayısıyla çelişiyor:**
   `engine/tests/sewability_check.mjs:447` → `ABSENT sayısı: ${absentCount} — … altısı da
   adıyla yukarıda.` Sayı **7** basılıyor, cümle **"altısı"** diyor. Kozmetik ama bir
   rapor satırı; **DÜZELTİLMEDİ** (dosya kilitli).
7. ★ Madde 4'ün kendi uyarısı: ölçülen şey **2B kontur** köşe toplamı. 3B köşe açısı
   AÇIĞI (`2π − komşu açı toplamı`) `engine/src/surfacepattern.cpp:717 columnDeficitRows`
   / `:747 columnDeficit`'te VAR ama tüketicisi PENS — dikilebilirlik hükmü basmıyor,
   üstelik `surfacepattern` kullanıcıya SEVK EDİLMİYOR. **İki hat, iki giysi** (V5-D
   kart dışı #1 ile aynı bulgu, iki yönden).
