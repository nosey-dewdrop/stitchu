# T14 — NET CAP EASE NEGATİF DEĞİL: İŞARET, HANGİ ÇİZGİYİ ÖLÇTÜĞÜNÜN FONKSİYONU (2026-08-17)

Halka: `HEDEF.md` **T14**. Ölçüm dosyası: `flatten-research/19-cap-vs-armscye.py`
→ `flatten-research/out-19-cap-vs-armscye.json`.
Kaynak: `patterns_real/geometry/geometry-full.json` (PDF vektör, mm-kalibre, **sadece okundu**).
Yöntem `18-armscye-front-back.py` ile aynı: 0.25mm yeniden örnekleme · nokta-normali iç ofset ·
teğet ±3mm · **budama YOK, miter YOK** · analitik mandal `ΔL = −d·Δθ`
(**sarılım çarpanıyla** — T12'de bulunan kusur, aşağıda §5).
Analitik mandal 8 beden × 4 parça × tüm kenarlarda en kötü **0.0143mm**.

---

## 0. CEVAP — TEK CÜMLE

**Kapak oyuktan kısa değil.** Kesim çizgisinde cap ease **8/8 bedende POZİTİF**
(+1.54 … +4.22%, EU38 **+18.30mm**); dikiş çizgisinde 8/8 NEGATİF (−4.13 … −7.48%).
Aradaki ~40mm'lik salınımın tamamı **dikiş payının kendisinden** geliyor: oyuk **içbükey**
olduğu için 10mm iç ofset onu **+34.3…+36.2mm uzatıyor**, kapak **dışbükey** olduğu için
**−4.6…−6.4mm kısaltıyor**. "Cap ease +1.8…+4.3%" (trace-match.py, `CLAUDE.md`) ile
"net cap ease −4.7%" (Tur 5) **aynı kalıbın iki ayrı çizgide okunuşu** — hiç çelişmiyorlardı.

---

## 1. ÜÇ İHTİMALİN AYRILMASI

| | ihtimal | hüküm | kanıt |
|---|---|---|---|
| (a) | oyuğa giden kenar Lower değil **Upper Sleeve**'in üst kenarı | **YARISI DOĞRU, YARISI YANLIŞ** | Upper'ın üst kenarı da oyuğa gidiyor (büzgülü katman), ama Lower'ın yerine değil — Lower **gerçek kapak**tır (§2) |
| (b) | Lower tam oyuğa oturmuyor (kısmi dikiş) | **AYAKTA KALAN AÇIKLAMA, KANITLANMADI** | açık tek eksik TAÇ'ta: koltukaltı bölgeleri 8 bedende **±1.6mm** tutuyor, açığın tamamı taçta (§4) |
| (c) | `KAPAK` landmark ataması hatalı | **ELENDİ** | üç bağımsız işaret (§2) |

---

## 2. (c) ELENDİ — Lower Sleeve'in o kenarı GERÇEKTEN bir kol kapağı

`19` §6, şeklin kendisini ölçtü (yay değil: kiriş + sagitta + uç yükseklikleri):

| parça | EU38 bbox | kapak kenarı yay | kiriş | **sagitta** | iki ucun dy'si |
|---|---|---|---|---|---|
| **Lower Sleeve** | 345.9 × 169.7 | 451.75 | **345.88** | **129.81** | **0.02** |
| **Upper Sleeve** | 504.6 × 207.4 | 613.65 | 504.69 | 159.34 | 6.72 |

- Lower'ın kirişi **345.88mm = bicep hattı**, sagittası **129.81mm = kapak yüksekliği**
  (Aldrich EU38 bandı 13–15cm), iki ucu **aynı yükseklikte** (dy 0.02mm) = iki koltukaltı noktası.
  **Bu, tarifi gereği bir set-in kol kapağıdır.** Yan kenarları 41.7 / 41.4mm ve **dümdüz**
  (sagitta ≤0.11) → çok kısa bir kol.
- Kesim çizgisi ease'i 8 bedende **+1.54…+4.22%** — literatürün set-in bandı.
- Lower'ın kapak boyu, oyuğun **düzensiz** grade adımlarını takip ediyor
  (oyuk adımları +6.1/+3.1/+14.9/+10.1/+8.7/+7.7/+11.7mm; kapak +4.5/+14.8/+14.3/+6.9/+4.7/+12.7/+13.6).
  Upper'ın üst kenarı takip **etmiyor**, düzgün azalan bir büzgü oranı çiziyor (%43.2 → %34.2).

## 2.1 ★ Upper Sleeve, Lower'ın YATAY ÖLÇEKLENMİŞ KOPYASI — ve `patterns_real/BUGRA-DEFTER.md` bu noktada YANLIŞ

`patterns_real/BUGRA-DEFTER.md` (satır 52–53, 65, 86–87) kolu **"yatay 2'ye bölünmüş"**
sayıyor ve motorun eksiğini *"2 parçalı kol, set-in sleeve'i yatay böl"* diye yazıyor.
**Ölçüm bunu çürütüyor.** Yatay bölünmede alt parçanın üst kenarı düzce bir bicep çizgisi
olurdu (sagitta ≈ 0) ve iki mate kenarın kirişi eşit olurdu. Gerçekte **iki parça da TAM bir
kapak taşıyor** (sagitta 129.8 ve 159.3mm) ve:

| beden | 34 | 36 | 38 | 40 | 42 | 44 | 46 | 48 |
|---|---|---|---|---|---|---|---|---|
| kapak **sagitta** oranı Upper/Lower | 1.227 | 1.227 | **1.227** | 1.226 | 1.227 | 1.227 | 1.227 | 1.227 |
| kapak **kiriş** oranı Upper/Lower | 1.549 | 1.549 | 1.459 | 1.419 | 1.419 | 1.419 | 1.382 | 1.347 |

**Yükseklik oranı 8 bedende bit-sabit 1.227**, genişlik oranı bedenle düşüyor (= büzgü payı).
Yani Upper, Lower'ın kapağının **yükseklikte sabit, genişlikte değişken ölçeklenmiş kopyası**:
klasik **iki katmanlı puf kol** (dış katman büzgülü). Yan dikişler de bunu doğruluyor —
Upper 65.98/59.75mm, Lower 41.73/41.40mm; **8/8 bedende sistematik 19–24mm fark**, yani
ikisi ortak bir koltukaltı dikişini paylaşmıyor, biri ötekinin ÜSTÜNDE duruyor.

→ **`patterns_real/BUGRA-DEFTER.md`'nin "yatay böl" satırı çürüdü.** Dosya telifli dizinde ve
repo yasası gereği oraya yazılmıyor; düzeltme buraya kaydedildi. Motorun gerçek eksiği
"yatay bölünmüş kol" değil, **büzgülü ÜST KATMAN**. (Bu, `BUGRA-DEFTER.md`'nin backlog
satırını da değiştiriyor: farklı bir operatör.)

## 3. (a) — Upper Sleeve'in üst kenarı da oyuğa gidiyor, ama Lower'ın YERİNE değil

Dikiş çizgisinde Upper'ın üst kenarı oyuktan **+23.5…+29.9% uzun** (EU38 604.16 vs 468.33 =
**+135.83mm**), kesim çizgisinde **+34.2…+43.2%**. Bu bir ease değil, **büzgü**dür —
`13`'ün "PUFF üst büzgü %" satırıyla aynı mertebe. Bir kol oyuğuna %29 fazlalıkla giren kenar,
set-in kapak değil büzgülü katmandır.

⚠ **DOĞRULANMADI:** iki katmanın oyuğa **birlikte mi** (tek dikişte) yoksa Upper'ın önce
Lower'a mı basıldığı ölçülmedi — bu bir dikim talimatı sorusu, geometriden düşmüyor.
Talimat sayfaları JPG (`patterns_real/instrucitons Part 1|2/*.jpg`), **okunmadı**.

## 4. (b) — AYAKTA KALAN AÇIKLAMA: açığın TAMAMI TAÇTA

`13`'ün D tablosu (T12'de düzeltilmiş yöntemle yeniden koşuldu), çentik-bölge yürüyüşü:

| beden | 34 | 36 | 38 | 40 | 42 | 44 | 46 | 48 |
|---|---|---|---|---|---|---|---|---|
| ön koltukaltı artığı | +1.1 | +0.1 | **+1.5** | +2.4 | +1.5 | +0.1 | +1.9 | +1.1 |
| arka koltukaltı artığı | −3.8 | −4.0 | **−1.6** | +0.1 | −0.8 | −0.3 | +0.7 | −0.3 |
| **TAÇ ease** | −29.2 | −30.0 | **−21.9** | −25.9 | −25.2 | −29.4 | −24.8 | −22.0 |

İki koltukaltı bölgesi 8 bedende **±4mm** içinde tutuyor (EU38'de ±1.6mm); eksiğin **tamamı
taçta**. Taç, pufun hacmi taşıdığı bölgedir. Yani "Lower kapağı oyuğun tacını tam
doldurmuyor, tacı Upper'ın büzgüsü dolduruyor" okuması **veriyle tutarlı**.
**Ama kanıtlanmadı**: aynı veri "Buğra kesim çizgisinde çizip dikiş çizgisi ofsetini hesaba
katmamış" okumasıyla da tutarlı (§5).

## 5. İŞARET DÖNÜM NOKTASI — d0

`L_oyuk(d) = kes_oyuk + d·|Δθ_oyuk|` (içbükey, ofset uzatır) ·
`L_kapak(d) = kes_kapak − d·|Δθ_kapak|` (dışbükey, ofset kısaltır).
İkisinin eşitlendiği pay:

| beden | 34 | 36 | 38 | 40 | 42 | 44 | 46 | 48 |
|---|---|---|---|---|---|---|---|---|
| kesim ease (mm) | +8.27 | +6.61 | **+18.30** | +17.74 | +14.53 | +10.58 | +15.56 | +17.50 |
| **d0 (mm)** | 1.96 | 1.60 | **4.55** | 4.24 | 3.53 | 2.62 | 3.93 | 4.48 |

d0 bandı **1.60–4.55mm** (ort. 3.36). Satıcının talimatı **10mm** (s.3/4/7/8/9/11, kanıtlı),
yani ilan edilen payda işaret 8/8 negatif. **6mm / ¼ inç gibi daha küçük bir kol oyuğu payı
varsayımı da açığı kapatmıyor** — d0 hepsinde 5mm'nin altında.

★ Buradan çıkan mühendislik hükmü: **kesim çizgisi kontrattır** (ANAYASA + `CLAUDE.md`) ve
kesim çizgisinde bu kalıp tutarlıdır. Dikiş-çizgisi açığı, elle Illustrator'da kesim
çizgisinden çizen bir kalıpta beklenen bir tutarsızlık olabilir; **hangisi olduğuna karar
verilmedi.** İki okuma da veriyle tutarlı, ikisi de DOĞRULANMADI:
(i) Buğra kesim çizgisinde çizdi, ofsetin işaretini hesaba katmadı;
(ii) taç kasten kısa, hacmi puf taşıyor.

---

## 6. ★ K1'İN BANDI ETKİLENMEDİ — KANIT

`docs/H1.0-KAPI.md` K1 bandı `[Buğra_beden − 40mm, Buğra_beden]`, EU38 **392.99–432.99mm**.
Kaynağı `engine/tests/h10_gate_check.cpp` `kBugraArmholeMM`, üretimi `patterns_real/tools/trace-match.py`,
o da `seamgraph.json`'un **`cutMM`** alanını okuyor. Üç adımda kanıt:

1. **`stitchMM`'in bu repoda `13` dışında TEK BİR TÜKETİCİSİ YOK** (grep, tüm .py/.cpp/.md/.sh).
   Zehirli olan alan buydu.
2. **Düzeltilmiş `13`, HEAD'deki `seamgraph.json` ile 484 kenarda karşılaştırıldı:
   `cutMM` farkı olan kenar 0 (en büyük 0.0000mm), `notches` farkı olan kenar 0.**
   (Koş: `python3 flatten-research/13-digitize-multisize.py`, bölüm 0.)
3. K1 bandı bir **kol oyuğu çevresi** bandıdır; kolun kapağını hiç anmaz. Cap ease hikâyesi
   bandın gerekçesine girmiyor.

→ **K1'in bandı ve gerekçesi AYAKTA. Kapıya dokunulmadı.**

⚠ **6B'YE / `DAMLA-KUYRUK`'A DEVREDİLEN TEK KALEM (kapı değişikliği DEĞİL, tutarsızlık kaydı):**
`kBugraArmholeMM` EU38 = **432.99mm**, ama aynı kenarın 0.25mm örneklemeli ölçümü **433.45mm**
(`18` ve `19`). Fark **0.46mm**, kaynağı `seamgraph.json`'un **STEP=1.0mm** yeniden örneklemesi
(kaba örnekleme yayı kirişleriyle eksik sayar; `knowledge/seam-line-offset-2026-08-17.md` §4.2
aynı kusuru `12` için kaydetmişti). 8 bedende: 424.50/428.91/432.99/447.80/457.83/466.83/474.64/486.48
(STEP 1.0) vs 424.17/430.31/433.45/448.35/458.47/467.16/474.83/486.50 (STEP 0.25) —
farklar **−0.33 … +1.40mm**. K1 bandı 40mm geniş, en kötü fark bandın **%3.5'i**;
K2'nin grade adımı bandı [4.0, 14.0] ve ölçülen adımlar iki hatta da bandın içinde.
**Kapıyı ben değiştirmedim** — 6B fikstürün sahibi. Karar: `seamgraph.json` STEP'i 0.25'e
taşınacak mı (çentik indisleri yeniden türetilmeli, `12`/`14`/`trace-match` etkilenir) yoksa
0.46mm tolere mi edilecek?

---

## 7. YAN BULGULAR (sorulmadı, bu turda çıktı — §5.5)

- ★ **`18-armscye-front-back.py`'nin analitik mandalı SARILIM-KÖR.** `seam_analytic = cut − SA·Δθ`
  iç normali her zaman teğetin SOLU sayıyor; bu yalnız CCW poligonda doğru. **Front/Back Body 8
  bedende CCW, Upper/Lower Sleeve 8 bedende CW.** `18` yalnız gövde kenarlarını ölçtüğü için
  hiç yakalanmadı. Çarpansız formül kol kenarlarında `2·d·Δθ` kadar sahte sapma basıyor
  (EU38'de Lower KAPAK **14.18mm**, Upper ÜST **20.89mm**). **Kusur MANDALDA, ofsette değil**;
  `13` ve `19`'da düzeltildi, **`18` DÜZELTİLMEDİ** (kendi ölçümü etkilenmiyor ama mandalı
  yanıltıcı — kopyalayan bir sonraki dosya aynı tuzağa düşer).
- **`13`'ün dikiş-çizgisi sayılarının TAMAMI değişti** (T12), ama `cutMM` ve `notches` değişmedi.
  Önce/sonra: `knowledge/seam-line-offset-2026-08-17.md`'nin kardeş kaydı, `HEDEF.md` T12.
- **`Collar Lining` EU48 hâlâ kırık** (köşe 3 ≠ seed 4) → `13` onu dürüstçe atlıyor. Değişmedi.
- **`EXTRA-TL (not in defter)`** parçası hâlâ hiç incelenmedi; `13`'ün hizalama maliyeti onda
  EU34 ve EU44'te **0.45** (öteki parçalarda ≤0.075) → etiket taşıma orada güvenilmez.
- **Yan dikiş ön/arka** dikiş çizgisinde EU38 235.8 vs 247.1 = **+11.3mm** (T12 düzeltmesinden
  sonra, STEP=1.0). `knowledge/armscye-on-arka-2026-08-17.md` §6.2'nin +9.4mm'si 0.25mm hattından;
  aynı mertebe. Büst pensi kapatılıp yeniden ölçüm **HÂLÂ YAPILMADI**.
- **Erişilmedi / bakılmadı:** dikim talimatı JPG'leri (`instrucitons Part 1|2`), Aldrich p.11'in
  kendisi, `corset_bustier` kupleri (analitik mandal orada sivri uçlarda hâlâ dağınık).
  Motor tarafına (`surfacepattern.cpp`, `h10_gate_check.cpp`) **DOKUNULMADI**, ctest bu turda
  **KOŞULMADI** (değişen tek şey python araştırma scriptleri + belgeler).
