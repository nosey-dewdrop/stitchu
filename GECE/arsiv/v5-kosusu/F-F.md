# F-F — KALIP: kol oyuğu + yaka (ikinci vardiya, 2026-08-23)

Kapı: `engine/tests/garment_armhole_check` — **YEŞİL** (25 yargı, 0 FAIL).
Önceki vardiya aynı kapıda 12/24 FAIL bırakmıştı.

## 1. TEŞHİS — açık kirişte değil, OYMADA

`./engine/build/armhole-basis-probe`, EU38, dikiş çizgisi:

| yarı | bizim kiriş | Buğra kiriş | bizim yay/kiriş | Buğra yay/kiriş |
|---|---|---|---|---|
| ön | 195.9 | 171.7 | **1.043** | 1.230 |
| arka | 184.8 | 188.9 | **1.020** | 1.180 |

Kiriş kısa DEĞİL (ön 24mm daha uzun). Açığın tamamı yay/kirişte, yani OYMADA.
Kök sebep sayıyla: **arka dx (omuz ucu → koltukaltı yatay açıklık) EU34'te 20.2mm**
(Buğra 48.2). Oyuk neredeyse DİKEY bir çizgiydi, ve oymanın tavanı `h <= 0.94*dx`
olduğu için dx küçükken oyulacak yer de yoktu.

## 2. ÇÖZÜM — oyma artık YAYINLANMIŞ bir çizgiye oturuyor

Eski hedef, Buğra'nın ölçülen yay/kiriş oranıydı. İki sebeple bırakıldı:
1. **Tutturulamıyor** (tek kübik, ulaşılan 1.006..1.073).
2. **Tutturulsa da yanlış olurdu**: bizim kirişimiz daha uzun, o oranla oyuk
   ~459mm çıkardı — Aldrich'in yayınlanmış 40–44cm bandının ÜSTÜ. Buğra parite
   tanığıdır, kapı değildir (v5 §C).

Yerine **Aldrich p.11'in yayınlanmış genişlik çizgileri** kondu
(`knowledge/drafting-math-eu38.md:27-28`, verbatim tablo):

```
arka genişlik  34.4 cm @ büst 88 · 35.4 cm @ büst 92 →  yarı_mm = 0.125*bust + 62.0
ön   genişlik  32.4 cm @ büst 88 · 33.6 cm @ büst 92 →  yarı_mm = 0.150*bust + 30.0
```

Oyuğun KARNI (çizilen eğrinin ulaştığı en küçük x) bu çizgiye oturuyor.

★ **Bu, eski "geometrik tavan"ı ÇÜRÜTÜR.** Eski kural cp2 omuz ucunun içine
geçemez diyordu. Yayın tersini söylüyor: büst 88'de arka genişlik yarısı
**172.0mm**, bizim omuz ucumuz **185.0mm** — gerçek scye omuz ucunun **13mm
İÇİNDEN** geçer. Tavan geometri değil, fazla sıkı bir varsayımdı.

## 3. KIRIK — EU46→48 +34.11mm ÖLDÜ

Kök: `backLengthCM` EU44→46'da duruyordu **ve** `shoulderSeamTargetMM` sekiz
bedende SABİT 126mm'di. Derinlik önceki vardiyada Aldrich'in büste bağlı scye
depth'ine bağlanmıştı; bu vardiyada **omuz dikişi de büste bağlandı**
(Aldrich p.11: 12.25cm @ büst 88 · 12.5cm @ büst 92 → `0.0625*bust + 67.5`).
Eski 126 sabiti o doğrunun büst 936'daki değeri — yani her bedene EU41'in
omzunu takıyorduk; omuz ucu yerinde dururken koltukaltı büstle dışarı kaçıyor,
oyuk büyük bedenlerde kendiliğinden açılıyordu.

| | EU36 | EU38 | EU40 | EU42 | EU44 | EU46 | EU48 | max/medyan |
|---|---|---|---|---|---|---|---|---|
| gece başı | 9.39 | 10.46 | 10.70 | 12.23 | 13.02 | 13.14 | **34.11** | **2.788** |
| 1. vardiya | 15.60 | 16.79 | 17.36 | 18.47 | 19.12 | 19.06 | **29.90** | 1.619 |
| şimdi | 11.01 | 10.90 | 8.34 | 12.07 | 12.11 | 12.47 | **11.85** | **1.053** |

## 4. SEVİYE — 8 beden

| beden | gece başı | şimdi | bant |
|---|---|---|---|
| EU34 | 353.21 | 399.36 | (taban değil) |
| EU36 | 362.59 | 410.37 | |
| **EU38** | **373.06** | **421.27** | **400–440 İÇİNDE** |
| EU40 | 383.76 | 429.60 | |
| EU42 | 395.99 | 441.67 | |
| EU44 | 409.01 | 453.78 | |
| EU46 | 422.15 | 466.25 | |
| EU48 | 456.26 | 478.10 | |

## 5. YAKA — sapan DELİKTİ, parça değil

`engine/build/neck-basis-probe`: collar PARÇASI 8 bedende 0.12..0.14mm trued
(sapmıyor). Sapan DELİK: 8 bedenin 5'inde boyun çevresinden **kısaydı**
(−0.35 … −2.42mm). Kök sebep: crew derinliği `neckW + 15` — o **15mm SABİT**,
boyunla büyümüyor, delik/boyun oranı bedenle düşüyordu (1.003 → 0.994).

Yaka eğrisi **İÇBÜKEY** → iç ofset onu UZATIR → ofset eklemek bizi kayırırdı,
o yüzden iki taraf da KESİM çizgisinde tutuldu (ölçüm tabanı değişmedi).

Düzeltme yönü **GENİŞLİK DEĞİL DERİNLİK**: yaka noktası aynı zamanda omuz
dikişinin başlangıcı; onu dışarı itmek omuz ucunu ve kol oyuğunu taşır.
Derinlik CF'de açılır, başka hiçbir kenarı oynatmaz. Bedel: en çok +2.4mm.
Şimdi 8/8 beden delik ≥ boyun.

## 6. YENİ KIRMIZI: SIFIR — ama iki sayı BÜYÜDÜ, saklanmıyor

`GECE/log/F-F2.ctest.before.txt` (11 kırmızı) → `F-F2.ctest.after.txt` (10).
Fark: `garment_armhole_check` yeşile döndü. **Yeni isim yok.**

⚠ AMA `engine_check` + `sewable_census` (ikisi de vardiya ÖNCESİNDE de kırmızı)
içindeki ihlal sayısı büyüdü ve bu gizlenmiyor:

| | gece başı | şimdi |
|---|---|---|
| düşen draft | 30 | **255** |
| `kink` | 0 | 0 *(ara halde 15909'du — çözüldü)* |
| `selfintersect` | 0 | **225** |
| `sideseam` | 54 | 54 (devralınan) |

- **Kök sebep (ölçüldü):** 225'in HEPSİ `princess/empire`. Empire bedeninde
  oyuk derinliği bel dikişinin 8mm üstüne kelepçeleniyor; kısa düşüşle derin
  oyuk yan-ön panelin kenarını kesiyor (`[selfintersect] Bodice Side Front`).
- **Denenen hamle 1 — KİNK KELEPÇESİ (tuttu):** oyma, motorun KENDİ kuralına
  (`validator.hpp kinkAngleDegrees = 25°`) çarptığı yerde duruyor.
  Ölçülen: kink ihlali **15909 → 0**.
- **Denenen hamle 2 — DOĞAL BLOK TAVANI (tuttu):** karnın omuz ucundan içeri
  girme mesafesi DOĞAL bloktakiyle sınırlandı (düşük omuz / bateau yaka omuz
  ucunu dışarı itince oyuk onunla birlikte kayar, daha derin oyulmaz).
  Ölçülen: selfintersect **2339 → 225**, `shoulder_check`/`halter_check`/
  `cup_check`/`collar_check`/`ruffle_check` yeşile döndü.
- **Denenen hamle 3 — İLMEK KELEPÇESİ (ÖLÇÜLDÜ, REDDEDİLDİ):** eğrinin kendi
  ilmeğini arayan segment-kesişme testi yazıldı; kalan 225'in **hiçbirini**
  düşürmedi → katlanan şey kübiğin kendisi değil. Koddan çıkarıldı, gerekçesi
  `bodice.cpp` içinde duruyor.
- **SONRAKİ ADAY:** prenses bölme noktası sabit `princessArmholeShare = 0.38`
  yerine oyuğun KARNINA konsun (dikiş en içteki noktadan ayrılsın; altındaki
  oyuk dışa açılır, kesişecek kenar kalmaz). İkinci aday: oyuğu çentikten iki
  kübiğe ayır.

## 7. VACUOUS KANITI

`GECE/log/garment_armhole.vacuous.txt` (ikinci bölüm). Aynı test ikilisi
`git worktree` ile 7129598'e kopyalandı: **25 yargı, 7 FAIL, exit 1**.
Bugünkü ağaçta 0 FAIL. Kapı motorun çıktısından türetilmiş bir mandal değil.

## 8. DOKUNULMAYANLAR

- Beden tablosu (`contract/tables.json`) — K10, Damla'da.
- Üç kasıtlı kırmızı (`style_check`, `sizechart_source_check`, `contract_check`).
- `constants.yaml`'daki 126 — reçete DSL aynası onu taşıyor, ayrı kalem.
- Hiçbir tolerans/eşik gevşetilmedi; hiçbir özel-durum if'i yazılmadı.
