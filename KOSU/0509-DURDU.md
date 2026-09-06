# 0509 KOŞU DURDU — 8.29

Tarih: 2026-09-06. Durum: **DURDU**. Bu dosya soru içermez, karar istemez.

## Hangi adım
**A2 — İlk geçiş (graf → çizim).** Karar: DUR (hakem hükmü, tur 2 kapsam kilidi).
A1 (A1a, A1b) GEÇTİ. A2a GEÇTİ; A2b/A2c koştu ama adım KAPANMADI.

## Hangi kusur (4 açık + 2 devredilen)

### 1. Giyilemez: kapanma yok (SATIŞ ENGELİ)
Nerede: `KOSU/ciktilar/graf-ilk/graf.json` — beş panel (on_beden, arka_beden, on_etek,
arka_etek, kol); `seams[].closure` hepsi null.
Girdi cümlesi "arkadan kapanan elbise" diyor; arka_beden ve arka_etek `onFold=true`.
Ölçüm: bel 342.50mm yarım = 685mm tam; göğüs 900mm; kalça 950mm. Giysi en dar
yerinden geçmiyor. Bu, A2 tarifinin KIRILMA şartıdır ("kapanmayan giysi teslim değil").
Katman: **graf** (şema + `grafdogrula` topolojik kuralları). `seam.closure` alanı ve
`opClosure` var ama taban graf kullanmıyor; dört kural "giysi vücuda giriyor mu"yu içermiyor.
Kapanış ölçütü: `grafdogrula` GİYİLEBİLİRLİK kuralı + `ERR_NOT_WEARABLE`; halka sayısı
>=7 (bust, hip dahil), `arka_beden.onFold=false`, >=1 dikişte `closure!=null`.

### 2. Sıfır pens (SATIŞ ENGELİ)
Nerede: `graf.json` beş panelde `dartLeg` kenar sayısı 0; `engine/src/grafdegerle.cpp` Halka2B.
A2 tarifi madde 1 açıkça "pens bel/göğüs halka farkından" diyor. Ölçüm: gerçek36 yarım
bedende göğüs 450.0mm, bel 342.5mm -> 107.5mm supresyon hiçbir pens/prenses/büzgü
tarafından emilmiyor; kalçada ters yönde 132.5mm. `kalip-36.png`'de tek pens üçgeni yok.
Katman: **değerleme** (Halka2B panel kaynağı).
Kapanış ölçütü: gövde panellerinde toplam >=2 dartLeg, pens bacak farkı <= 2.0mm,
sum(pens) + yan dikiş alımı = 107.5mm ± 2.0mm.

### 3. `sanalDikisMM=0.00` kazanılmış değil, YAPISAL (SATIŞ ENGELİ)
Nerede: `engine/tests/0509-kapi.sh` sanalDikisMM + `graf.json` rings[] (5 halka), ops[] (2 fitLength).
Ölçüm: 6 dikişten yalnız kol_oyugu çözücüden geçiyor. Kalan 5 dikişin iki tarafı da aynı
`ringQuarter=G/4` formülünden çiziliyor (`engine/src/graf.cpp:288`) — eşitlik kısıt çözümü
değil aritmetik özdeşlik; kod değişmeden bu sayı 0'dan başka bir şey OLAMAZ. rings[] göğüs
(girth.bust) ve kalça (girth.hip) halkası taşımıyor: 107.5mm supresyon metriğin görüş
alanına hiç girmiyor. kol_oyugu'ndaki -9.99e-09mm tek çözülen dikişin float artığıdır.
Karar ajanının DEVAM gerekçesi ("çekirdek çürük DEĞİL, boşluk-sıfır değil") ölçümle YANLIŞLANDI.
Katman: **değerleme + graf şeması**. Geçit vacuous yeşil basıyor.
Kapanış ölçütü: halka sayısı >=7 (bust+hip), bu iki halkanın kapanmaMM'i < 2.0;
ops[] fitLength >=4 (şu an 2/6). Yanlışlama şartı: bel çevresi elle 20mm bozulunca
sanalDikisMM > 2.0 KIRMIZI basmalı (şu an yine 0 basar).

### 4. Bu turda ürün üretilmedi (engel değil, adım kapanmasını engelliyor)
`git log adim-A2a-once..HEAD -- engine/src` BOŞ. `flat.png` ve `kalip-36.png` 6 Eyl 15:23
damgalı, yeniden commit edilmedi. Tek ürün dokunuşu `dikilebilir.md`'de bir etiket satırı
(grafId -> graf). Kalan değişiklik geçit/ölçüm aracında (`0509-kapi.sh`) ve defterde.
İşçi bunu kendi raporunda dürüstçe yazdı ve kilit hükmüne uydu — tek başına suç değil.
Katman: **koşu düzeni** — A2 üç turdur çizim dışı iş yapıyor.
Kapanış ölçütü: `git log <tur tag'i>..HEAD -- engine/src` >=1 commit VE flat.png/kalip-36.png
commit tarihi tur tag'inden SONRA.

### Devredilen (bu turda kapanmadı, adı bağlı)
- **K2-prenses-roba** — `web/lib/flat-from-pattern.js` gather() çizim tablosu; flatSVG
  fırlatıyor ("Front Yoke Center, Front Body Center ... çizim tablosuna oturmadı").
  Katman: flat (konvansiyon). Kapanacak adım: **A4**. Ölçüt: `--regresyon` "koşmadı: 0".
- **flat_ayni_insan_check = 34** (İLANLI KIRMIZI, tavan 34; sayı ARTMADI). Katman: flat.
  Kapanacak adım: **A4**. Ölçüt: geçit JSON'unda `flat_ayni_insan_check == 0`.
- **sinyal_tam / bundle_fresh_check = 1** (İLANLI). Kapanacak adım: **A9**.

## Ne denendi
- A1a iadesi sonrası geçit onarımları: `KAPI_SANAL` artifact'tan okuma (Q1),
  H16 kabul-komutu token filtresi (Q2), `--ivme` serisinin sanalDikisMM'e bağlanması (Q4).
- `--kendi-check` 18/18 yeşil; kilit ihlali yok; reward hacking yok (doğrulandı).
- `olcek_check` 990.00 mm YEŞİL; `sanalDikisMM` null -> 0.00 mm.
- Karar ajanı hükmü: A2 DEVAM (A2c'ye), üç geçit/araç defekti A1a'ya iade.
  Bu tur hakemi hükmü ölçümle bozdu: DEVAM gerekçesi (çekirdek sağlam) yanlış çıktı.
- banned (izin dışı dokunuş denemeleri): `engine/tests/0509-kapi-kendi-check.sh`,
  `0509-kapi-sizinti.py`, `0509-kapi-tablo.mjs`, `0509-karar-kabul.sh`.

## Ne denenmedi
- `grafdogrula`ya giyilebilirlik kuralı (`ERR_NOT_WEARABLE`) yazılmadı.
- Graf'a `girth.bust` / `girth.hip` halkaları eklenmedi.
- `Halka2B`de göğüs-bel farkının pense dönüştürülmesi yazılmadı.
- `arka_beden.onFold=false` + closure'lı dikiş taban grafa konmadı.
- `graf.cpp:288` ringQuarter özdeşliği kırılmadı; 5 dikiş hâlâ çözücüye girmiyor.
- A2c ürün teslimleri: PatternPiece köprüsü, tam kalipSVG, wasm=native denklik.
- Cümle -> graf hattı (A6c'nin işi, bu adımda kasten yapılmadı).

## Resume
```
Workflow scriptPath=KOSU/0509-kosu.js args={"baslat":"A2"}
```
İşçi "kaldığın yerden, git log'a bak" ile başlar. Kilit AÇIK bırakıldı.
