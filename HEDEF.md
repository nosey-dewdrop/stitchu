# HEDEF — stitchu

**Bu dosya reponun en üst otoritesidir.** ANAYASA / DERSLER / ROADMAP / CLAUDE.md ile çelişki çıkarsa çelişki bu dosya lehine **tek karar commit'iyle** kapanır; o commit'te diğer dosyanın çelişen satırı **silinir**. İki doğru bırakılmaz.

Açıldı: 2026-08-16 · Branch: `vardiya/2026-08-16`

---

## SAYAÇ

```
H1'e kalan:  5 halka / 36–56 koşu saati    [H1.0 ÖLÇÜLDÜ: 25–45s, yapısal]
H2'ye kalan: 7 halka / 168–295 koşu saati
H3'e kalan:  4 halka / 80–120 koşu saati + zevk turu 0
TABAN:       7 halka / 9–17 koşu saati     [T2,T4,T6 kapandı · T1 yok-hükmünde · T5 bloke · +T7,T8,T9,T10]
```

> **KAPSAM BÜYÜDÜ: +4 halka (T7, T8, T9, T10). Sebebi:** Tur 1, tabanın altında dört bağımsız kırmızı ölçtü. Hiçbiri "H1.0 yeşil olunca geçer" cinsinden değil; dördü de **bugün basılan paketi satılamaz kılıyor**. Sessizce eklemek yerine halka yazıyorum ve H1'in kitapçık/kapak/listing halkalarını bunların ARKASINA aldım (gerekçe: TUR 1 ROTA KARARI).

Her rapor bu üç sayıyla **biter**. Sayı düşmediyse rapor bunu gizleyemez: `sayı düşmedi, sebebi şu` yazar.

**Bu blok reponun TEK sayacıdır.** Başka hiçbir dosya sayaç yazmaz, buraya işaret eder. `contract/kapsam-checkpoint.json` T6'da tek sayaç diye adlandırılmıştı ama **diskte yok** (16.08 doğrulandı); `reports/gate/kapsam-checkpoint.json` ise 2026-07-21 / 103-hedef rejiminden ve `ANAYASA.md`'ye göre tarih arşivi — sayaç değildir.

---

## BİTİŞ TANIMI — tektir, değişmez

Damla rastgele **10 cümle/görsel** atar → en az **8'i** dikilebilir kalıp + zevk kapısından geçmiş flat döner → kalan 2'si **eksik operatörünü adıyla söyleyerek** dürüst reddeder.

Bu listenin dışında "bitirmek için gereken" bir iş keşfedilirse **SAKLANMAZ** — buraya halka olarak eklenir ve o fazın raporu `KAPSAM BÜYÜDÜ: +X halka, sebebi şu` cümlesiyle açılır. Kapsamı sessizce büyütmek, **kapı boyamakla aynı sınıf ihlaldir**.

---

## TABAN — hedef değil, bitişin şartı

Her fazın sonunda **pazarlıksız** mühürlenir.

| # | Halka | Kalan iş | Süre |
|---|---|---|---|
| T1 | iki include düzeltmesi | **YOK HÜKMÜNDE 16.08** — terim tüm revizyonlarda aranmadı değil, arandı: repoda karşılığı yok. Ampirik: 52 başlık tek tek derlendi, **0 başarısız**. Uydurulmadı → `DAMLA-KUYRUK` **K6** | 0 |
| T2 | determinizm çift koşusu | **KAPANDI 16.08** — iki bağımsız temiz koşu, manifest sha256 `8abec243…` özdeş, 24 PDF `cmp` ile 0 fark | ~0.5s |
| T3 | kenar monotonluğu | **ÖLÇÜLDÜ, KAPI KIRMIZI** — 8 beden × 8 panel = 2096 kenar, **480 ihlal**; en kötü EU34 `left_ftorso[20]` **22.99mm geri dönüş**. Kök sebep: 488 kenarın kübik kontrol parametresi `[0,1]` dışında (1.9678'e kadar) | kapatma → T8 |
| T4 | montaj sırasının pakete girişi | **KAPANDI 16.08** — `84e79a9` sadece `print-report.txt`'e basıyordu (denetim dosyası), hiçbir PDF'e girmiyordu; artık `print-info.pdf` s.2'de 13 adım | ~1s |
| T5 | dünya-kapısı sicili | **AÇIK — BLOKE.** Terim tüm revizyonlarda sadece bu satırda ve `.vardiya/state.json`'da geçiyor, tanımı repoda YOK (16.08 arandı). Sicil kurulmadı, tanım uydurulmadı → `DAMLA-KUYRUK.md` **K5** | **ÖLÇÜLMEDİ** |
| T6 | sayaç/anayasa tekleştirme | **KAPANDI 16.08** — tek sayaç bu dosyanın `§ SAYAÇ`'ı; ROADMAP/DERSLER/ANAYASA'daki bayat sayaç ve otorite satırları silindi | ~2s |

### TABAN — Tur 1'de açılan yeni halkalar

| # | Halka | Ölçülen | Süre |
|---|---|---|---|
| T7 | **`walk.py` bir kapı değil, yazıcı** | `main()` hiçbir koşulda sıfırdan farklı dönmüyor; `taban.sh:101` bu exit koduna bakıp `walk:OK` yazıyor. Ayrıca `grep -c '^FAIL'` girintili `  FAIL` satırlarını saymıyor → **76 gizli FAIL** (8 bedende kendini kesen panel). 64 panelin **60'ında** `check_self_intersection` zaten FAIL diyor, hiçbir yere bağlı değil | 2–4s |
| T8 | **eğri-fit kontrol noktası taşması** | T3'ün kök sebebi: `curvefit.cpp` kübik kontrol parametresini `[0,1]` dışına çıkarıyor (1.9678'e kadar), eğri bitiş noktasını aşıp geri dönüyor. 480 kenar | 3–6s |
| T9 | **h3c 3/8 bedende FAIL** | EU42 +0.2138mm · EU46 +0.1376mm · EU48 +0.2691mm. `worst fit` EU46'da **7.1717mm**, tolerans `kFitTolMM = 0.15mm` → **48 kat**. `waist-attach` EU48'de 5.350mm. Bel halkası yasası yeniden açılmış | 4–8s |
| T10 | **açıklık uyarısı pakete girmiyor** | `_opening_lines()` ("BURAYI DİKMEYİN / fermuar açıklığı") sadece `print-report.txt`'e gidiyor, hiçbir PDF'e girmiyor. **Alıcı arka ortayı kapatır, kafası geçmeyen bir elbise diker.** T4'ün aynı sınıfı, tek satırlık düzeltme | ~0.5s |

T5 için "saatler/günler" demiyorum: **tanımı yok, ÖLÇÜLEMEZ.** K5 cevabından sonra ~1s.

---

## HEDEF 1 — ilk satış

Satış yüzeyi **Etsy** (karar: kendi sitesi = ödeme + trafik + hukuk, ilk satışı haftalarca geciktirir; TEK KAPI'nın sorusu zaten "Etsy'ye koyar mısın?").
Giysi: **mevcut oturtmalı elbise** (motorun bugün ürettiği tek aile).

| # | Halka | Kabul | Süre |
|---|---|---|---|
| H1.0 | **giyilebilirlik** | **KIRMIZI — ÖLÇÜLDÜ 16.08.** Giysi hâlâ tüp. `GarmentSurf` 4 halka taşıyor (neck/bust/waist/hip), **omuz halkası yok**; omzun üstünden geçen hiçbir yüzey yok. Kol oyuğu bir DELİK değil, kenardaki çentik: **EU38 33.55cm**, Buğra Locket-38 **43.30cm** → bandın **6.45cm altında (%22 kısa)**. Yaka 23.34cm, boyun çevresi 35cm → yaka boyundan küçük. Omuz noktasında kumaş omzun **153.5mm altında**. PNG'ye gözle bakıldı: omuz yok, askı yok. Yapısal blokör: `buildGrid`'in (h,φ) ızgarası + `Slit`'in yalnız-bel çapası — ~610–1180 satır, 9 dosya | **25–45s** |
| H1.1 | paket tanımı mührü | `docs/SATIS-SARTNAMESI.md` zaten kalem kalem tanımlıyor → mühürlenecek | ~1s |
| H1.2 | kitapçık — motor çıktısından | **H1.0'ın ARKASINA alındı** (rota kararı: giysinin şekli değişecek) | ~4s |
| H1.3 | kapak + tek line drawing | **H1.0'ın ARKASINA alındı.** Damla'nın gözü (→ DAMLA-KUYRUK K3) | ~3s |
| H1.4 | listing — metin, fiyat, beden tablosu, lisans | **H1.0'ın ARKASINA alındı.** Etsy'ye yapıştırılabilir halde | ~3s |
| H1.5 | **Damla'nın dikimi** | giysi ayakta duruyor | Damla'da — **BLOKE ETMEZ** |
| H1.6 | kabul testi | 3 soru EVET + **hesaba geçen para** | Damla'da |

**Pazar emsali (repoda ölçülü):** `benchmark-58/bugra-ref/` — BugraPatterns elle Illustrator ile çiziyor, **5 ayda 1.1k satış**.

---

## HEDEF 2 — 10 cümle 10 kalıp

| # | Halka | Süre |
|---|---|---|
| H2.1 | spec şeması mührü (`contract/garment-spec-v2.DRAFT.md` → mühür) | 10s |
| H2.2 | **style line / bölge çıkarımı — KRİTİK YOL** | 40–80s |
| H2.3 | operatör dalgası: yaka ailesi · kol · etek ailesi · boy · kumaş ekseni | 60–100s |
| H2.4 | sanal muslin hakemi | 30–50s |
| H2.5 | F8 frontend | 10–20s |
| H2.6 | foto→spec sınıflandırma girişi (operatörler bitince) | 10–20s |
| H2.7 | **DÜRÜST RED yolu** — operatör sicili + kapsam sorgusu; red cümlesi eksik operatörü ADIYLA söyler | 8–15s |

> **KAPSAM BÜYÜDÜ: +1 halka (H2.7).** Sebebi: bitiş tanımı "kalanı eksik operatörünü söyleyerek reddeder" diyor. Bu, operatör listesinin makinede **sicil** olarak durmasını ve gelen spec'in bu sicile karşı sorgulanmasını gerektiriyor. H2.1–H2.6'nın hiçbiri bunu kendiliğinden vermiyor. Sessizce eklemek yerine halka yazıyorum.

---

## HEDEF 3 — flat hattı

| # | Halka | Süre |
|---|---|---|
| H3.1 | aynı yüzeyden çizgi çıkarımı | 80–120s (üçü aynı bütçe) |
| H3.2 | sadeleştirme | ↑ |
| H3.3 | Damla'nın kalemine oturtma | ↑ |
| H3.4 | zevk turları | **TAAHHÜT EDİLEMEZ** — hakem Damla; raporlarda `zevk turu N` diye sayılır |

---

## YASALAR — plan bunların üstüne kurulur

1. **Kapı boyanmaz.** Eşiğe, çözünürlüğe, tanıma dokunmak vardiyayı **durdurur** (16.08 emsali). Kapı düşerse yamalanmaz — yöntem değişir.
2. **Kanıtsız "bitti" geçersiz.** Her alt-ajan çıktısı: `halka X · kanıt Y (çalışan komut + sayı) · DOĞRULANMADI listesi`.
3. **Aynı anda en fazla 3 alt-ajan.** Düz fan-out, çarpan mimari yok, dar context, tavan 1 saat.
4. **Araştırma önce `knowledge/`'a sorar**, bulgu oraya döner — doğrulanmış yokluk dahil. 7 turda çıkmayan park edilir, gerekçesiyle.
5. **Motorun kendi çıktısı kanıt değildir.** Render → PNG → **gözle bakılır** (SVG path'e bakıp beğenmek yasak).
6. **Kota dolarsa** ajan kaldığı halkayı + kalan saat tahminini yazıp **durur**. Sessiz yavaşlama yasak.
7. **Kesintisizlik zorlaması yok.** Süreklilik context'e değil `.vardiya/state.json`'a bağlı.

---

## TUR — tekrarlanan tek adım

```
1. OKU     .vardiya/state.json + HEDEF.md
2. SEÇ     kuyruktaki sıradaki halka dilimi
3. KOŞ     ≤3 ajan, düz fan-out, dar context, tavan 1 saat
4. MÜHÜR   ctest + determinizm çift koşusu → KIRMIZIYSA tur başarısız,
           halka kuyruğa geri açılır, YAMALANMAZ
5. HAKEM   rota denetimi
6. YAZ     rapor + üç sayaç + commit + push
7. DEVİR   state.json'a sonraki turun girdisi
```

### HAKEM
Her turun sonunda tek ajan, sadece `state.json` + son 5 raporu okur. Üç soru: sayaç düştü mü (düşmediyse sebebi ne) · halka hâlâ bitiş tanımına giden yolda mı · kapsam sessizce büyüdü mü. Çıktı `DEVAM` / `ROTA DEĞİŞ` (gerekçeli, kuyruğu yeniden sıralar/ekler/siler) / `DUR-SOR-DAMLA`. Her karar `state.json` sicilinde satır bırakır.

**TRIPWIRE:** Sayaç **3 tur üst üste düşmezse** hakemin `DEVAM` seçeneği **KAPANIR** — `ROTA DEĞİŞ` ya da `DUR-SOR-DAMLA` seçmek zorundadır. Sicilde `tripwire: active` olarak görünür.

**Her 10 turda bir kapsam hakemi:** bitiş tanımını halka listesine karşı okur, eksik olanı halka olarak ekler.

### GÜNLÜK RAPOR
Her ~24 koşu saatinde `reports/YYYY-MM-DD-vardiya.txt` — **üç sayı + tek paragraf.** Tüccar raporu: hedefe mesafe, para ve tarih dilinde. Virtüöz anlatısı yok.

---

## DAMLA'YA DÜŞENLER — `DAMLA-KUYRUK.md`

beden cevabı · dikim · zevk hükümleri · `patterns_real` kararı. **BLOKE ETMEZ** — paralel halkalar koşmaya devam eder; bekleyen işi öne alıp "bekliyorum" diye durmak yasak.
