# K9 — "ön armscye mi arka armscye mi uzun?" ÖLÇÜLDÜ (2026-08-17)

Halka: `DAMLA-KUYRUK.md` **K9**. Görev: iki kaynağın çelişkisini ayrıştır, hüküm ver.
Ölçüm dosyası: `flatten-research/18-armscye-front-back.py` · çıktı `out-18-armscye-front-back.json`
Kaynak: `patterns_real/geometry/geometry-full.json` (PDF VEKTÖR, mm-kalibre).
`ring-trace-locket-front-38.json` **kullanılmadı** (%40 bridge).

---

## 0. CEVAP TEK CÜMLE

**İki iddia AYNI ŞEYDEN BAHSETMİYOR.** Aldrich tarafının doğru olan yarısı **eğrilik**
("ön oyuk daha derin/oyuk"), Buğra'nın ölçtüğü ise **yay uzunluğu**. Buğra 8/8 bedende
**ikisini birden** doğruluyor: ön oyuk daha eğri (8/8), arka oyuk daha uzun (8/8).
Çelişki, `knowledge/drafting-math-eu38.md`'de bir gözlemin bir çıkarımla **"→" ile
kaynaştırılmasından** doğmuş; çıkarımın kaynağı yok (§3'te kanıtlandı) ve ölçüm onu çürütüyor.

---

## 1. LANDMARK ATAMASI — körü körüne değil, doğrulandı

8 bedende **köşe sayısı ve sırası sabit**: Front Body 9 köşe, Back Body 6 köşe. Bu yüzden
kenar→anlam ataması indise değil YAPIYA dayanıyor. EU38'de `CLAUDE.md`'nin kayıtlı arc
değerleriyle çapraz kontrol **≤1mm** (resample adımı 0.25mm):

```
Front Body  ölçülen [219.50 406.00 542.75 681.25 726.00 937.00 1000.75 1219.75 1640.75]
            CLAUDE  [219    406    543    681    726    937    1001    1220    1641   ]  UYUYOR
Back Body   ölçülen [  0.00  64.50 287.00 532.00 728.75 1142.75]
            CLAUDE  [  0      65    287    532    729    1143   ]                        UYUYOR
```

Kenarlar (Front): 0→1 yan-dikiş-alt · 1→2→3 pens (2 = apeks, dönüş −135°) · 3→4 yan-dikiş-üst ·
**4→5 OYUK** · **5→6 OMUZ** · 6→7 yaka · 7→8 CF/plaket (düz) · 8→0 etek.
Kenarlar (Back): **0→1 OMUZ** · **1→2 OYUK** · 2→3 yan-dikiş · 3→4 etek · 4→5 CB (düz) · 5→0 yaka.

---

## 2. ÖLÇÜM — 8 beden

### 2.1 ARMSCYE YAYI (fark = ön − arka; negatif = ARKA UZUN)

| beden | ön kesim | arka kesim | fark | ön dikiş | arka dikiş | fark | ön yay/kiriş | arka yay/kiriş |
|---|---|---|---|---|---|---|---|---|
| 34 | 205.17 | 219.00 | **−13.83** | 223.57 | 236.71 | −13.14 | 1.2394 | 1.1764 |
| 36 | 208.92 | 221.39 | **−12.47** | 226.92 | 238.43 | −11.51 | 1.2350 | 1.1767 |
| 38 | 211.00 | 222.46 | **−11.46** | 228.94 | 239.40 | −10.46 | 1.2292 | 1.1749 |
| 40 | 221.86 | 226.49 | **−4.63** | 241.12 | 243.36 | −2.24 | 1.2620 | 1.1734 |
| 42 | 227.23 | 231.24 | **−4.01** | 246.81 | 247.83 | −1.02 | 1.2551 | 1.1707 |
| 44 | 231.97 | 235.20 | **−3.23** | 251.14 | 251.36 | −0.22 | 1.2470 | 1.1676 |
| 46 | 236.13 | 238.69 | **−2.56** | 254.62 | 254.54 | +0.08 | 1.2419 | 1.1654 |
| 48 | 242.50 | 244.00 | **−1.50** | 261.13 | 259.80 | +1.33 | 1.2323 | 1.1610 |

- **Kesim çizgisinde 8/8 ARKA UZUN.** Fark −13.83 … −1.50mm.
- **Dikiş çizgisinde 6/8 arka uzun**, EU46 (+0.08) ve EU48 (+1.33) işaret değiştiriyor.
  Kesim çizgisi **birincil**dir (basılı kontur = kesim çizgisi, `CLAUDE.md` kanıtlı).
- **Fark bedenle 9 kat KÜÇÜLÜYOR** (−13.83 → −1.50). Bu bir SABİT değil, bu giysinin
  grade'i. Sayı olarak şart yazılırsa yanlış olur.

### 2.2 OMUZ DİKİŞİ (fark = arka − ön; pozitif = ARKA UZUN)

| beden | ön kesim | arka kesim | fark | ön dikiş | arka dikiş | fark |
|---|---|---|---|---|---|---|
| 34 | 63.00 | 63.93 | +0.93 | 62.99 | 63.62 | +0.62 |
| 36 | 63.73 | 64.50 | +0.77 | 63.66 | 64.50 | +0.84 |
| 38 | 63.75 | 64.50 | +0.75 | 63.75 | 64.50 | +0.75 |
| 40 | 64.50 | 65.50 | +1.00 | 64.50 | 65.50 | +1.00 |
| 42 | 65.67 | 66.50 | +0.83 | 65.30 | 66.50 | +1.20 |
| 44 | 66.25 | 67.20 | +0.95 | 66.25 | 66.96 | +0.71 |
| 46 | 66.92 | 67.75 | +0.83 | 66.54 | 67.75 | +1.21 |
| 48 | 67.75 | 68.70 | +0.95 | 67.75 | 68.40 | +0.65 |

**8/8 arka omuz uzun, +0.75…+1.00mm (kesim), düz — bedenle büyümüyor.** `CLAUDE.md` 29 Tem
kaydını (+0.95…+1.13mm, "dümdüz, hiç büyümüyor") bağımsız bir hatla doğruluyor.
Alan bilgisiyle **AYNI YÖNDE**, ama kürek payı bandının (6–12mm) **6–8 kat altında**.
→ **Omuz K9'un çelişkisinin PARÇASI DEĞİL.** Omuz ile oyuk aynı cümlede anılmamalıydı.

### 2.3 "DAHA DERİN/OYUK MU?" — ayrı ölçü, ve BU AYRI SONUÇ VERİYOR

| beden | ön yay/kiriş | arka yay/kiriş | ön toplam dönüş | arka toplam dönüş |
|---|---|---|---|---|
| 34 | 1.2394 | 1.1764 | −105.3° | −101.5° |
| 36 | 1.2350 | 1.1767 | −103.1° | −97.6° |
| 38 | 1.2292 | 1.1749 | −102.8° | −97.1° |
| 40 | 1.2620 | 1.1734 | −110.3° | −96.7° |
| 42 | 1.2551 | 1.1707 | −112.2° | −95.0° |
| 44 | 1.2470 | 1.1676 | −109.8° | −92.6° |
| 46 | 1.2419 | 1.1654 | −105.9° | −90.8° |
| 48 | 1.2323 | 1.1610 | −106.8° | −90.6° |

**8/8 bedende ÖN OYUK DAHA EĞRİ.** İki metrik de aynı yönü veriyor, bantlar **hiç çakışmıyor**
(ön 1.232–1.262, arka 1.161–1.177).

★ **İkisi de PENS-BAĞIŞIK.** Ön parçanın yan dikişine kesilmiş büst pensi kapanınca oyuk
kenarı **rijit döner**: yay uzunluğu, kiriş uzunluğu ve toplam dönüş üçü de korunur. Yani
2.1 ve 2.3'ün hiçbiri "pens açık" itirazıyla çürütülemez. (Buna karşılık x/y açılımı
korunmaz — o yüzden bu tabloda dx/dy kullanılmadı.)

**→ Aldrich tarafının "ön daha derin/oyuk" yarısı ÖLÇÜMLE DOĞRULANDI. "Dolayısıyla ön daha
uzun" yarısı ÖLÇÜMLE ÇÜRÜTÜLDÜ. İkisi farklı büyüklükler ve birbirini gerektirmiyor:
daha eğri bir yay, daha kısa bir kiriş üzerinde yine de daha KISA olabilir.**

### 2.4 Toplam armhole (çapa kontrolü)

| beden | 34 | 36 | 38 | 40 | 42 | 44 | 46 | 48 |
|---|---|---|---|---|---|---|---|---|
| AH kesim (mm) | 424.17 | 430.31 | **433.45** | 448.35 | 458.47 | 467.16 | 474.83 | 486.50 |

EU38 = **43.35cm**, `CLAUDE.md`'nin kayıtlı 43.30cm'siyle 0.05cm içinde ve Aldrich'in
40–44cm sanity bandında (MED). Ölçüm hattı sağlam.

---

## 3. ALDRICH KAYNAĞI DOĞRULANDI — VE KAYNAK YOK

`knowledge/drafting-math-eu38.md` §"Ön vs arka armscye (HIGH — eski varsayımım TERS)":

> **ÖN armscye daha DERİN/oyuk → ön eğri tipik daha UZUN; arka daha düz/kısa.** (kol öne uzanır)
> Fark ~0.5-1in (1.5-2.5cm), ön uzun. Sabit evrensel oran YOK.

Dosyanın başlığı iki kaynak sayıyor: **Aldrich 6. baskı p.11** ve
**`reports/2026-07-29-endustri-arastirmasi.md`**. İkisi de bu cümleyi taşımıyor:

1. **Aldrich p.11 bir ÖLÇÜ TABLOSU sayfası** (büst/bel/kalça/sırt genişliği/omuz boyu/
   armscye depth). Dosyanın kendi §12–23'ü bunu doğru alıntılıyor. p.11'de ön/arka oyuk
   YAY UZUNLUĞU yok; dosya bunu zaten kendisi yazmış: *"Armhole ÇEVRESİ Aldrich'te yok —
   çizilen scye'den ölçülür."* (satır 26). **Bir sayfa hem "çevre yok" hem "ön çevre
   1.5–2.5cm uzun" diyemez.**
2. **`reports/2026-07-29-endustri-arastirmasi.md` diskte YOK**; git'te duruyor
   (`git show 0e67777:reports/2026-07-29-endustri-arastirmasi.md`). İçinde
   `armscye|scye|armhole` geçen **0 satır** var — rapor endüstriyel pattern CAD mimarisi
   üzerine. **Bu cümleyi taşımıyor.**

→ **§47–49 KAYNAKSIZ.** "HIGH" etiketi hak edilmemiş. Cümlenin yapısı da bunu ele veriyor:
gözlem ("ön daha derin/oyuk") ile çıkarım ("→ ön eğri tipik daha UZUN") **bir "→" ile**
birleştirilmiş; gerekçe de bir sezgi ("kol öne uzanır"), bir ölçüm değil.

### 3.1 Dosya KENDİ İÇİNDE de çelişiyor — üçü de arka-uzunu gösteriyor

- §12–23 (Aldrich p.11, HIGH): **sırt genişliği 34.4 > ön genişlik 32.4** (büst 88);
  35.4 > 33.6 (büst 92). Arka, göğüs hizasında yarımda 1.0cm daha geniş.
- §41–44 (HIGH, "herkes hemfikir"): cap ease bölüşümü **1/3 ön, 2/3 arka**. Arka cap daha
  çok ease yutuyorsa arka oyuk daha uzundur; kısa bir kenara iki katı ease yüklenmez.
- `CLAUDE.md` 29 Tem (alan bilgisi): **arka omuz ön omuzdan uzun, 6–12mm standart.** Omuz
  ucu daha uzaktaysa oyuğun o ucu da daha uzun yol yürür.

Üç bağımsız HIGH kalem arka-uzunu gösteriyor; kaynaksız tek kalem tersini söylüyor.

---

## 4. "LOCKET BİR ÜST, PLAKET/YAKA FARKI YARATIYOR" — ÖLÇÜLDÜ, ÇÜRÜTÜLDÜ

| beden | CF kenarı yay | CF kiriş | düzlük (yay/kiriş) | CF ile oyuk arasındaki yaka kenarı |
|---|---|---|---|---|
| 34 | 416.93 | 416.91 | 1.00006 | 216.74 |
| 36 | 421.00 | 421.00 | 1.00000 | 218.93 |
| 38 | 421.00 | 421.00 | 1.00000 | 218.94 |
| 40 | 427.43 | 427.40 | 1.00008 | 226.13 |
| 42 | 433.92 | 433.90 | 1.00004 | 231.45 |
| 44 | 438.24 | 438.24 | 1.00000 | 235.18 |
| 46 | 442.50 | 442.50 | 1.00000 | 237.43 |
| 48 | 447.75 | 447.75 | 1.00000 | 240.39 |

- **Plaket/düğme payı CF kenarındadır** — 8/8 bedende **tam düz** çizgi (yay/kiriş ≤1.00008).
- Oyuk kenarının **iki ucu da CF üzerinde değil**: bir yandan yaka (216.7–240.4mm) + omuz
  (63.0–67.8mm), öte yandan etek + yan dikiş + pens onu CF'den ayırıyor.
- **Bir kenarın yay uzunluğu, konturun başka bir yerindeki uzatma/kısaltmadan etkilenmez.**
  → **Plaket oyuk farkının sebebi OLAMAZ.**
- **Peter Pan yaka** ayrı parça (`Collar`, `Collar Lining`) ve **yaka kenarına** oturur,
  oyuğa değil. **Puf kol** `Upper/Lower Sleeve`'de, gövdenin oyuk kenarına değmez.

⚠ Kalan dürüst pay: Locket'in bir ÜST olması oyuk **derinliğini/stilini** (dolayısıyla
farkın BÜYÜKLÜĞÜNÜ) etkileyebilir. **İŞARETİNİ** etkilediğine dair hiçbir mekanizma
ölçülmedi ve yukarıdaki topoloji bunu dışlıyor.

---

## 5. HÜKÜM (ajan hükmü — Damla'nın hükmü K9'da açık)

**1. `knowledge/drafting-math-eu38.md` §47–49'un UZUNLUK yarısı SİLİNİR.**
Buğra Aldrich'i yendiği için değil — **o cümle Aldrich değil.** Kaynaksız bir çıkarım (§3),
dosyanın kendi HIGH kalemleriyle çelişiyor (§3.1) ve repodaki tek ölçülmüş gerçek kalıpta
8/8 çürüyor (§2.1). Kaynaksız bir çıkarıma "HIGH" damgası, `07-sleeve`'i çöpe attıran
tam o hatadır. `docs/G5-OMUZ-PLANI.md` kapı-2 ve `docs/H1.0-KAPI.md` satır 138 aynı
commit'te düzeltilir (HEDEF.md yasası: iki doğru bırakılmaz).

**2. §47'nin EĞRİLİK yarısı KALIR ve TERFİ EDER** — artık sezgi değil, ölçüm:
ön yay/kiriş **1.232–1.262**, arka **1.161–1.177**, 8/8 çakışmıyor; toplam dönüş
ön −103…−112°, arka −91…−102°.

**3. "−13.5…−1.5mm" SAYI OLARAK ŞART YAZILMAZ.** Fark 8 bedende **9 kat** değişiyor;
bu bir kanun değil, Buğra'nın grade'i. Sayıyı şart yapmak = referansı kural yapmak =
Damla'nın 28 Tem kararının ihlali ("Buğra bir REFERANS, kural değil") ve motoru
internetteki her şeyi çizemez hale getirir.

**4. ŞART YAZILACAKSA İŞARET YAZILIR, BÜYÜKLÜK YAZILMAZ:**
- `ön_oyuk_yay ≤ arka_oyuk_yay` (kesim çizgisinde)
- `ön_oyuk_yay/kiriş > arka_oyuk_yay/kiriş`
- büyüklük **REPORTED** kalır, yargılanmaz.

İkisi de 8/8 tutuyor, ikisi de pens-bağışık, ikisi de üç bağımsız HIGH kalemle aynı yönde
(§3.1), ve hiçbiri motoru Buğra'nın grade'ine kilitlemiyor.

**5. Ölçülen giysi sayısı = 1** (`locket_top`). `corset_bustier` STRAPLESS — oyuğu ve omzu
YOK, ikinci tanık olamaz. **İşaret şartı bu n=1 üstüne yazılıyor**; büyüklük şartı
yazılmamasının ikinci sebebi budur.

---

## 6. YAN BULGULAR (sorulmadı, ama bu turda çıktı — §5.5)

### 6.1 ★ `flatten-research/10-seam-walk-real.py`'ın DİKİŞ-ÇİZGİSİ SAYILARI BOZUK

`CLAUDE.md` 29 Tem "dikiş-çizgisi sayıları ŞÜPHELİ" diyordu; **mekanizma bulundu.**
10 numaralı dosya her kenarın uçlarından **17–28 nokta buduyor** ve **her kenarı kısaltıyor**.
Tek satırlık çürütme: **CF kenarı DÜZ bir çizgi**, 10'a göre `420.8 → 401.5mm (−19.4)`.
**Düz bir çizgiyi 10mm paralel ötelemek boyunu DEĞİŞTİREMEZ.** CB `413.7 → 393.6 (−20.1)`,
etek-ön `263.8 → 243.1 (−20.7)`, omuz-ön `63.8 → 44.8 (−19.0)` — hepsi ≈ −2×SA, yani
budamanın kendisi. Aynı testte bu turun yöntemi CF için **421.00 → 421.00** veriyor.

**Etkilenen kayıtlar (`CLAUDE.md`, "GERÇEK BUĞRA LOCKET-38"):**
- *"Dikiş çizgisinde: oyuk 430.4mm, kapak 425.3mm, net cap ease −5.0mm (≈0)"* —
  bu üç sayı 10/12/14 hattından geliyor. `430.4` aslında **kesim çizgisine** çok yakın
  (bu turun kesim ölçümü 433.45mm); ayrıca oyuk **içbükey** (ofset UZATIR: 433.45 → 468.33)
  ve kapak **dışbükey** (ofset KISALTIR) olduğu için ikisi ters yönde kayar.
  **"net cap ease ≈ 0" hükmü bu hatla YENİDEN ÖLÇÜLMEDEN kullanılmamalı.** DOĞRULANMADI.
- *"ön koltukaltı→çentik: oyuk 39.6 vs kapak 39.5, artık −0.1mm"* aynı hattan. Ayrı ölçülmedi.
  DOĞRULANMADI.

Bu turun yöntemi (nokta-normali ofset, teğet ±3mm penceresinde, miter YOK) **32/32 ölçümde**
analitik `ΔL = −d·Δθ` ile **≤0.013mm** uyuşuyor ve düz-çizgi testini geçiyor.

### 6.2 ★ "Yan dikiş ön = arka" ihlali GÖRÜNTÜ — K9 ile AYNI SINIF HATA

| beden | 34 | 36 | 38 | 40 | 42 | 44 | 46 | 48 |
|---|---|---|---|---|---|---|---|---|
| yan ön (kesim) | 228.88 | 230.98 | 231.10 | 234.43 | 238.17 | 240.45 | 241.98 | 244.94 |
| yan arka (kesim) | 242.40 | 244.75 | 244.86 | 248.42 | 252.17 | 254.71 | 257.36 | 260.42 |
| fark | −13.52 | −13.77 | −13.76 | −14.00 | −14.00 | −14.27 | −15.38 | −15.48 |

`CLAUDE.md` bunu açık iş #2 diye taşıyor ("ön 201.8 vs arka 227.4 = 25.6mm; ya landmark
hatalı ya kalıpta sapma"). **Üçüncü ihtimal ölçülmedi: ön yan dikişin İÇİNE BÜST PENSİ
KESİLMİŞ.** Ön yan dikiş EU38'de iki parça (186.7 + 44.7) ve aralarında pens bacakları
(136.4 + 138.0, apeks dönüşü −135°) var; pens dikey olarak **97.1mm** yutuyor. **Pens
KAPANMADAN ön ile arka yan dikiş kıyaslanamaz** — tıpkı K9'da eğrilikle uzunluğun
kıyaslanamaması gibi. Bu turda pens kapatılıp yeniden ölçülmedi: **ÖLÇÜLMEDİ**, ama
"kalıpta sapma var" **DENMEZ**.

### 6.3 Grade gözlemi
Oyuk farkı 8 bedende −13.83 → −1.50 (9 kat daralıyor) ama omuz farkı **düz** (+0.75…+1.00).
Yani Buğra oyuğu ve omzu **ayrı ayrı** grade ediyor; oyuk grade'i doğrusal değil.
Sebep **ÖLÇÜLMEDİ**.

### 6.4 Erişilemeyen / bakılmayan
- **Aldrich 6. baskı p.11'in kendisi** elimde yok; §12–23'ün alıntısı `git show`la
  doğrulanamaz. Bu turda tabloya **dokunulmadı**, sadece §47–49 sorgulandı.
- **`Collar Lining` EU48'de kırık** (7 halka) — `CLAUDE.md` KOŞU 2 FAZ 2'de kayıtlı,
  bu turda değişmedi.
- **Kol kapağının ön/arka bölünmesi**: `out-14-notch-assign.json` tacı tek bölge veriyor
  (`zones [40.007, 345.872, 39.465]`) — tepe çentiği yok (puf kol, büzgülü). Kapaktan
  bağımsız ön/arka tanık **ÇIKARILAMADI**.
- **`EXTRA-TL (not in defter)`** parçası hiç incelenmedi.
- Motor tarafına (`surfacepattern.cpp`, `walk.py`, `h10_gate_check.cpp`) **DOKUNULMADI**
  (görev ölçüm görevi). ctest bu turda koşulmadı.
