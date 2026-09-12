# DİKİŞ-ÇİZGİSİ OFSETİ BOZUKTU — düzeltildi ve zehirlenen sayılar yeniden ölçüldü (2026-08-17)

Halka: Tur 5 · bozuk kaynaklar (3). Dosyalar: `flatten-research/10-seam-walk-real.py`,
`flatten-research/12-notch-zone-walk.py` (14 bunu `exec` ile içeri alıyor).
Doğru yöntemin kaynağı: `flatten-research/18-armscye-front-back.py` (ajan 4B, Tur 4).

---

## 0. TEK CÜMLE

İki script dikiş çizgisini "ofsetle + geçersiz noktaları buda + köşeleri miter'la" diye
kuruyordu. **Budama her kenarın UÇLARINDAN ~SA kadar gerçek uzunluk siliyordu**, miter onu
geri getiremiyordu. Sonuç: her kenar ≈ −2×SA kısalıyor, bazı kenarlarda fark **işaret bile
değiştiriyordu**. Yerine `18`'in yöntemi kondu: nokta-normali ofset, teğet ±3mm merkezi
farkla, **budama YOK, miter YOK**, analitik mandal `ΔL = −d·Δθ`.

---

## 1. ÇÜRÜTME — tek satır, tartışmasız

**CF (ön-orta) kenarı DÜZ bir çizgidir.** Düz bir çizgiyi paralel ötelemek boyunu değiştiremez.

| kenar | eğrilik | ESKİ yöntem | YENİ yöntem | kesim |
|---|---|---|---|---|
| **on-orta (CF)** | **düz** | 420.8 → **401.5** (−19.4) | 421.00 → **421.00** (±0.00) | 421.00 |
| arka-orta (CB) | düz | 413.7 → 393.6 (−20.1) | 413.95 → 413.77 (−0.18) | 413.95 |
| etek-ön | hafif | 263.8 → 243.1 (−20.7) | 264.45 → 261.34 (−3.11) | 264.45 |
| omuz-ön | düz | 63.8 → 44.8 (−19.0) | 63.75 → 63.75 (±0.00) | 63.75 |

Kaybedilenler ≈ **−2×SA = −20mm**, yani budamanın kendisi. Eski yöntem her kenarın iki ucundan
**17–28 nokta** atıyordu (STEP=1mm'de ≈ 17–28mm).

**Sentetik mandal (artık her koşuda çalışır, `assert`):** 400.0000mm düz kenar, 10mm ofset →
**400.0000mm, fark 0.00e+00.** Eski yöntem bu testi geçemezdi.

**Analitik mandal:** iç ofsette `ΔL = −d·Δθ` (Δθ = kenarın toplam işaretli dönüşü).
Düzeltilmiş 10'un 23 kenarında en kötü sapma **0.0138mm** (Front 0.0124 · Back 0.0074 ·
Upper Sleeve 0.0138 · Lower Sleeve 0.0064).

**Bağımsız çapraz kontrol:** düzeltilmiş `10` ile `18` EU38'de **birebir** aynı sayıyı veriyor:
ön oyuk dikiş **228.94mm**, arka oyuk dikiş **239.40mm**. İki ayrı script, iki ayrı landmark
yolu (10 köşe-tespitiyle, 18 yapısal atamayla).

---

## 2. ZEHİRLENEN SAYILAR — önce/sonra

`CLAUDE.md` § "GERÇEK BUĞRA LOCKET-38" üç sayıyı bu hattan almıştı.

| kayıt | ESKİ (çürük) | YENİ (düzeltilmiş) |
|---|---|---|
| oyuk, dikiş çizgisi | 430.4mm | **468.33mm** (46.83cm) |
| kapak (Lower Sleeve), dikiş çizgisi | 425.3mm | **446.43mm** |
| net cap ease | **−5.0mm ≈ 0** | **−21.90mm = −4.7%** |
| ön koltukaltı→çentik artığı | **−0.1mm** | **+1.5mm** (çözülen atamada −1.6mm) |

Neden bu kadar kaydı: **oyuk İÇBÜKEY** (iç ofset UZATIR: ön +17.94, arka +16.94 = **+34.9mm**),
**kapak DIŞBÜKEY** (iç ofset KISALTIR: −5.32mm). İkisi TERS yöne gider. `CLAUDE.md`'nin kendi
notu bunu zaten söylüyordu; bozuk script her ikisini de aynı yöne (−) çekiyordu ve farkı
sahte biçimde sıfıra yaklaştırıyordu.

★ **"net cap ease ≈ 0, hacim büzgüden geliyor" hükmü DÜŞTÜ.** Düzeltilmiş sayı −21.9mm, yani
alt (astar) kolun kapağı oyuktan **kısa**. Bu düz bir set-in dikiş için fiziksel olarak
tuhaftır → aşağıda §4 açık soru.

### 2.1 Çentik ataması da değişti (`14-notch-assign.py`)

| | ESKİ | YENİ |
|---|---|---|
| çözülen çentik çifti | (87, **446**) | (87, **456**) |
| artıklar (arka/taç/ön) | −1.1 / −3.8 / −0.1 | −1.6 / −11.7 / −9.2 |
| toplam artık | 5.0mm | **22.5mm** |
| renk-filtreli cevaba üstünlük | 17.5× | **4.8×** |
| karşılığı olmayan çentikler | [127, 412, 456] | [127, 412, **446**] |

**"Renk filtresi çentik atıyor" dersi AYAKTA** (çözülen cevap hâlâ renk-filtreliyi 4.8× yeniyor).
**Düşen, "0.1mm hassas" iddiasıdır.** `CLAUDE.md`'nin *"07'nin iddiası artık İKİ tarafta da
doğrulandı (koltukaltı %0 ease): ön −0.1, arka −1.1mm"* cümlesi bu hatla üretilmişti;
düzeltilmiş artıklar 1.6 / 9.2mm. **Kural literatürde HIGH kalıyor, ama bizim kalıp tanığımız
onu artık 0.1mm hassasiyetle desteklemiyor.**

---

## 3. NE DEĞİŞMEDİ

- **Kesim çizgisi sayıları hiç etkilenmedi** (ofset onlara girmiyor): toplam armhole EU38
  kesimde 433.45mm, `CLAUDE.md`'nin 43.30cm'siyle 0.05cm içinde.
- Omuz ön/arka farkı dikiş çizgisinde **+0.7mm** — 29 Tem kaydının (+0.95…+1.13mm kesim)
  aynı mertebesi ve aynı yönü. Omuz kaydı sağlam.
- Puf büzgü oranları mertebe olarak durdu: üst kenar %35.6 → **%35.3**, alt kenar %33.6 → **%30.6**.

★ **Yan dikiş sahte ihlali küçüldü ama BİTMEDİ:** eski hat "ön 201.7 vs arka 227.4 = +25.7mm"
diyordu, düzeltilmiş hat **237.8 vs 247.1 = +9.4mm**. Kalanın kök sebebi ayrıca ölçüldü:
**ön yan dikişin içine büst pensi kesilmiş**, pens kapanmadan kıyas geçersiz
(`knowledge/armscye-on-arka-2026-08-17.md` §6.2). Pens kapatılıp yeniden ölçüm **YAPILMADI**.

---

## 4. AÇIK / DOĞRULANMADI

> **✅ §4.1 ve §4.3 KAPANDI 17.08 Tur 6.** Cevaplar `knowledge/cap-ease-isareti-2026-08-17.md`
> (T14) ve `HEDEF.md` T12'de. Kısaca: (1) ease negatif değil — **kesim çizgisinde 8/8 pozitif**
> (+1.54…+4.22%), işaret dikiş payının işaretinden geliyor; oyuğa giden kenar **gerçekten
> Lower Sleeve**'in kapağıdır (kiriş 345.88 = bicep, sagitta 129.81 = kapak yüksekliği),
> Upper Sleeve onun **yatayda ölçeklenmiş büzgülü ÜST KATMANI** (sagitta oranı 8 bedende
> 1.227 sabit). (3) `13` düzeltildi; ondan türemiş **kullanılan** sayı çıkmadı.
> ★ Ayrıca: bu dosyanın dayandığı `18`'in **analitik mandalı sarılım-kör** — `ΔL=−d·Δθ`
> iç normali hep teğetin solu sayıyor, bu yalnız CCW poligonda doğru. Gövde parçaları CCW,
> **kol parçaları CW**; kol kenarlarında formül `2·d·Δθ` kadar sahte sapma basıyor
> (EU38 Lower KAPAK 14.18mm, Upper ÜST 20.89mm). `13` ve `19` düzeltildi, **`18` DÜZELTİLMEDİ.**
> §4.2 (`12`'nin 1.0mm örneklemesi) HÂLÂ AÇIK ve artık K1'e de dokunuyor — `DAMLA-KUYRUK` yan bulgu 3.

1. **Net cap ease −21.9mm neden negatif?** Üç ihtimal, hiçbiri ölçülmedi:
   (a) oyuğa giden dikiş `Lower Sleeve` değil, `Upper Sleeve`'in üst kenarıdır
   (düzeltilmiş 604.16mm → ease +135.8mm = büzgünün kendisi);
   (b) `Lower Sleeve` tam oyuğa değil, oyuğun bir kısmına oturuyor;
   (c) landmark ataması `KAPAK` kenarında hatalı.
   `CLAUDE.md` (a)'nın tersini yazıyor (*"oyuğa giden dikiş = Lower(under) Sleeve üst kenarı"*)
   ama o kayıt da aynı bozuk hattan geliyor. **DOĞRULANMADI.**
2. **`12` ile `10` arasında 1.6mm fark** (oyuk toplamı 466.7 vs 468.33). Sebep resample adımı:
   `12` STEP=1.0mm (sabit arc indisleri 726/769/937 buna bağlı, değiştirilemez), `10` ve `18`
   STEP=0.25mm. Kaba örnekleme eğrinin yayını kirişleriyle eksik sayıyor. **Birincil sayı
   0.25mm'lik olandır.** `12`'yi 0.25mm'ye taşımak çentik indislerinin yeniden türetilmesini
   gerektirir — **YAPILMADI.**
3. **`13-digitize-multisize.py` AYNI BOZUK OFSETİ TAŞIYOR** (`inward_offset` + `line_isect`
   + mesafe-alanı budaması, 10'un kopyası). Bu turda **ÇALIŞTIRILMADI, DÜZELTİLMEDİ.**
   `CLAUDE.md` zaten "10,12,13'ün dikiş-çizgisi sayıları ŞÜPHELİ" diyordu; 10 ve 12 kapandı,
   **13 hâlâ şüpheli.** 13'ten türemiş bir sayı kullanılıyorsa yeniden ölçülmeli.
4. Motor tarafına (`surfacepattern.cpp`, `flatten.cpp`, `h10_gate_check.cpp`) **DOKUNULMADI**;
   ctest bu turda **KOŞULMADI** (değişen tek şey python araştırma scriptleri + belgeler).
