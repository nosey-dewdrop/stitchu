# V5-A — sewability_check: YEDİ MADDE TEK HÜKÜMDE

STATÜ: **kapı KIRMIZI ve KIRMIZI BIRAKILDI.** Eşik gevşetilmedi, hiçbir kaynak
kodu değiştirilmedi, mevcut hiçbir test elleçlenmedi.
SÜRE: 60 dk tavanı AŞILDI (~75 dk) — sebep, ilk koşunun kök teşhisi (aşağıda §KÖK).

---

## YAPILAN

| ne | yol |
|---|---|
| kapı (TEK yeni dosya) | `engine/tests/sewability_check.mjs` |
| §4.2 boş test | `GECE/log/V5-A.bostest.txt` |
| §4.5 mutasyon | `GECE/log/V5-A.mutasyon.txt` |
| tam ctest | `GECE/log/V5-A.ctest.after.txt` |
| kırmızı ad farkı | `GECE/log/V5-A.reddiff.txt` |
| 8 bedenin çıktısı | `GECE/log/V5-A.8beden.txt` |

`engine/CMakeLists.txt` **DEĞİŞTİRİLMEDİ** — gerekçe §KARAR.

---

## ÖLÇÜLEN (sayı + onu basan komut)

Komut: `node engine/tests/sewability_check.mjs`
Zemin: 16 draft (2 sevk edilen spec × 8 beden EU34..EU48), 112 parça, 96 kapalı kontur.
Motor `web/vendor/stitchu-engine.js` üzerinden yüklendi (emsal `bugra-parity.mjs:18`).

| madde | hüküm | sayı |
|---|---|---|
| 1 dikiş çifti eşitliği | **ABSENT** | dikiş grafiği taşıyan alan **0** / 112 parça; rehberin verdiği doğrulanamayan dikiş sözü **72** |
| 2 çentik | **KIRMIZI** | `notches` kanalında **607** işaret → kenar çentiği **233**, bunlardan tabanı kesim çizgisinde OLMAYAN **211**; sınıflanamayan **374** (%61.6) |
| 3 kapalılık / kendini kesme | **YEŞİL** | 96 kontur, açık **0**, gerçek kesişme **0** |
| 4 köşe açısı toplamı | **YEŞİL** | 96 kontur, bant dışı **0**, max \|Σ−360\| = **0.0000°** |
| 5 GEÇİŞ | **YARIM** | beyan edilen kapanma donanımı **0**/16 draft → giysi baştan geçmek zorunda; rehber **8** kez alıcıya bu kontrolü YAPTIRIYOR, artefakt sayıyı taşımıyor |
| 6 geri projeksiyon | **ABSENT** | 0 alet, 0 kapı |
| 7 draft_math_check | **ABSENT** | bu kartın işi değil (V5-D) |

ABSENT sayısı **7**; hiçbiri kapıyı yeşil yapmak için kullanılmadı, yedisi de adıyla basılıyor.

**8 bedenin hepsi kırmızı** (`GECE/log/V5-A.8beden.txt`), off-boundary çentik
beden başına 29/27/29/28/26/25/23/24.

### Eşiklerin künyesi (hepsi dosya başlığında, `GECE/V5-R.md`'den)
- `ON_BOUNDARY_TOL = 0.79375mm` → **yayın YOK** (V5-R §A: ASTM/ISO/Handford/
  Joseph-Armstrong/Cooklin/Gerber/Lectra'da dayanak bulunamadı; Open Library'de
  "tolerance of 1/32" 73 hit, hiçbiri giyim değil). Başlıkta **"ev değeri"** diye
  yazıldı, "üretim standardı" DİYE YAZILMADI. Tanığı `surfacepattern.cpp:19`.
- Çentik derinliği < dikiş payı → V5-R §F ★ türetilebilir kural (Cutex 1/8"×1/4"
  çentikleyici + Fasanella "seam blowout"). Pay uydurulmadı, artefaktın kendi
  `seamAllowance`'ından okundu.
- Dönme = ±360° → uydurulmuş sayı değil, **Hopf Umlaufsatz** (theorem of turning
  tangents), adı dosya başlığında. Sayısal artık bandı: yayın YOK, bant şu ölçümden —
  `node engine/tests/sewability_check.mjs` çıktısındaki `max |Σ−360|` = 0.0000°.
- Geçiş zarfı → **ANSUR II NATICK/TR-15/007** kadın n=1986: baş çevresi
  532/560/597mm (ölçü 46), omuz çevresi 944/1027/1119mm (ölçü 68). Kapı bir
  GEÇİŞ EŞİĞİ KOYMUYOR, zarfı basıyor — çünkü "giysi için minimum baş açıklığı"
  hiçbir standartta YAYIN YOK (V5-R §D1).

---

## KÖK TEŞHİS — 211 çentik neden kenarda değil?

**Çentik işaretleri, parçanın kendi sınırından bağımsız bir x'e basılıyor.**
Ölçüm (EU38, `Top Front`): çentik (244.4, 112.5) → (232.4, 112.5). 244.4, parçanın
**maksimum x**'i ve o x'e ancak y≈575'te (yan dikişin alt ucunda) ulaşılıyor;
y=112.5'te gerçek sınır x≈173–189 civarında. Yani çentik, sınırdan **43.10mm**
uzakta havada duruyor. Aynı çentik EU34'te 28.83mm, EU48'de **78.93mm** uzakta —
**sapma bedenle büyüyor**, yani gürültü değil, sistematik bir inşa hatası.

İkinci bulgu (aynı kök): `notches` **tek ve TİPSİZ bir kanal** ve en az üç tür
işaret taşıyor — kenar çentiği (12mm), bir **396.9mm'lik katlama/orta çizgisi**
(`Bodice Center Back`), ve **22mm aralıklı 8mm'lik bir iç işaret merdiveni**.
Artefaktta bunları ayıran hiçbir alan yok (`type` yalnız `move`/`line`).
Kapı, ayıramadığını YARGILAMADI ama SAYDI ve adıyla bastı (374 işaret).

**Alıcı açısından ne demek:** kalıbı basıp çentikleri kesmeye kalkarsa, işaretlerin
çoğu kumaş panelinin ORTASINA denk geliyor; kenar çentiklerinin de 211'i (medyan
11.0mm) yanlış yerde. Bu, Etsy ayarında bir kalıpta doğrudan kusurdur.

### ÖLÇÜLMÜŞ ÇÖZÜM ADAYI (v6 §4.7)
Kenar çentiğini, hesaplanan noktadan değil **kesim çizgisi üzerindeki en yakın
noktadan** başlat (sınıra izdüşür, sonra içe doğru normalde `depth` kadar çiz).
Maliyeti ÖLÇÜLDÜ, komut:
`V5A_DUMP=9999 node engine/tests/sewability_check.mjs | grep ... | awk ...`
→ 211 çentiğin izdüşüm mesafesi: **min 0.0000 · medyan 11.0000 · ort 9.7488 ·
max 15.0000 mm**. Yani hepsi dikiş payı bandının (15mm) İÇİNDE kalıyor:
izdüşüm çentiği paydan dışarı taşırmaz, `off-boundary` sayacı inşaat gereği
**211 → 0** olur.
⚠ Bu aday **342 "kenardan uzak" işareti KURTARMAZ** (en uzağı 78.93mm): onlar
izdüşürülemez, yeniden türetilmeleri gerekir — ve önce `notches` kanalına bir
**TÜR ALANI** eklenmeden hangisinin çentik hangisinin iç işaret olduğu bilinemez.
Bu iki iş ayrı ve bu kartın dışında; **YAPILMADI**, çünkü kart `engine/src/`
altında kaynak değiştirmeyi YASAKLIYOR (kapı kartı).

---

## §4.2 BOŞ TEST — **VACUOUS DEĞİL**

`git worktree add --detach /tmp/v5pre 12ad937` (o commit'te `sewability_check` YOK:
`git ls-tree -r --name-only 12ad937 | grep -c sewability_check` → 0).
`V5A_ENGINE=/tmp/v5pre/web/vendor/stitchu-engine.js node engine/tests/sewability_check.mjs`
→ **exit 1, KIRMIZI**, off-boundary **211**. Kapı faz-öncesi artefaktta da düşüyor
→ kartın ölçütüne göre **boş DEĞİL**.
★ Ama dürüst okuma: sayılar HEAD ile **birebir aynı** (211/211, kesişme 0/0).
Yani kapı iki ağacı **ayırt etmiyor**; bulduğu kusur V5 fazının ürünü değil,
**DEVRALINMIŞ**tır.

## §4.5 MUTASYON — üç bozma da ISIRIYOR

| mutasyon | zemin | mutasyonlu | geri alınca |
|---|---|---|---|
| `selfcross` (madde 3, YEŞİL bölüm) | kesişme 0, dönme-kötü 0 | **kesişme 44, dönme-kötü 8** → 2 yeni FAIL | 0 / 0, YEŞİL |
| `notch-off` (madde 2) | off-boundary 211 | **216** | 211 |
| `notch-deep` (madde 2, [E2]) | uzunluk≥pay 32 | **45** | 32 |

Madde 3 ve 4 yeşilden kırmızıya gidip geri döndü → **o bölümler boş değil**.
Madde 2 zaten kırmızı olduğu için orada "kırmızı→yeşil" ayağı gösterilemedi;
gösterilen şey sayacın yönlü hareket etmesi ve aynen geri dönmesi.

---

## KARAR — `add_test` satırı BİLEREK EKLENMEDİ

Kart md.3 `add_test(NAME sewability_check ...)` eklemeyi söylüyor. Eklemedim, çünkü
kapı KIRMIZI ve eklemek **yeni bir kırmızı AD** doğurur; RULES 9 (ve bu vardiyanın
zemin notu) bunu açıkça yasaklıyor: *"kalıtsal kırmızı KÜME büyüyemez"*. İki emir
çatışıyor; çatışmayı gizlemek yerine **geri alınabilir olanı** seçtim: dosya diskte
ve tek komutla koşuyor, tek satırla ctest'e girer.
**Kapıyı yeşil yapmak için hiçbir eşik gevşetilmedi** — alternatif buydu ve reddedildi.
Kırmızı ad kümesi: `GECE/log/V5-A.reddiff.txt` → before 6 = after 6, **FARK YOK**
(`contract_check · figure_check · flat_artifact_census · flat_pattern_agree_check ·
sizechart_source_check · style_check`), 6 failed / 111 test, 284.78 sn.

---

## YAPILAMAYAN (sebep)

1. **Madde 1'in gerçek yargısı** — sevk edilen artefakt dikiş grafiği taşımıyor;
   eşleştirmeyi landmark tahminiyle uydurmak v6 §5.5'e aykırı olurdu. ABSENT bırakıldı.
2. **Madde 5'in halka ölçümü** — yaka kenarı artefaktta adlandırılmış bir kenar değil.
3. **`add_test` satırı** — §KARAR.
4. **Görsel PNG kanıtı (RULES 3)** — bu kapı sayı basıyor, render etmiyor; kart PNG istemedi.

---

## KART DIŞI FARK EDİLEN (dokunulmadı)

1. ★★ **Sevk edilen rehber, motorun ölçmediği bir kontrolü ALICIYA yaptırıyor.**
   `guideSteps[2]` birebir: *"Check the neck opening against your head circumference
   — a top has no zipper, it must slip over your head."* 16 draftın 8'inde bu cümle
   var, beyan edilen kapanma donanımı **0**, ve motor bitmiş yaka açıklığını hiç
   basmıyor. Yani madde 5 boşluğu teorik değil: **sevk edilen metnin içinde duruyor.**
2. ★ **`notches` kanalında TÜR ALANI YOK** (yukarıda). ASTM D6673-10 çentik türlerini
   katman 4/80/81/82/83 diye ayırıyor (V5-R §F); bizim tek kanalımız DXF ihracatında
   da bu ayrımı taşıyamaz. GRAFIS uyarısı (V5-R kart-dışı §9) buraya doğrudan bağlanıyor.
3. ★ `Bodice Center Back` parçasında **396.9mm tek bir "çentik"** var — bu bir katlama
   çizgisi olmalı ama `foldLine` alanı ayrı duruyor; aynı bilgi iki kanalda.
4. ★ Repo iki üretim toleransı taşıyor (`kProdTolMM 0.79375` / `pairedSeamTolerance 3.0`);
   bu kapı sıkı olanı aldı. Hangisinin hangi kapıda koştuğu **hâlâ haritalanmadı**.
5. ★ `engine/tools/virtual-sew.js` sabit komut İNDEKSLERİ ile dikiş eşliyor
   (`cmdLen(bcf, 6)` gibi) ve ölü `engine/dist/stitchu-engine.js`'i yüklüyor —
   yani bugün koşmuyor. Madde 1'in tek mevcut JS denemesi budur ve çürük. DOKUNULMADI.
6. Bu vardiya sırasında ağaç HEAD'i `87b0feb` → `d11e986` ilerledi (paralel işçi).
   Ölçümlerim `d11e986` ağacında koştu.
