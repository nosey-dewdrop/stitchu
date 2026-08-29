# G5 — omuz/kol oyuğu/yaka yüzeye iner (sonraki oturumun icra planı)

> Durum: TASARIM HAZIR, KOD YOK. Bu oturum (12 Ağu gece) strapless kılıfı
> 8 bedende iki hakemden yeşil geçirdi; elbiseyi "satılır" yapan son eksik bu.
>
> ★ **24 Ağu (V3) — G5'in açıklığı artık bir KAPI tarafından her koşuda sayılıyor.**
> `node engine/tests/flat_pattern_agree_check.mjs` altı ölçüyü kıyaslıyor; kalıp tarafı
> STRAPLESS olduğu için `bust_circumference`, `neck_opening_width`, `shoulder_width`
> ölçülecek kenar bulamıyor ve sebebiyle `null` dönüyor (`engine/tools/pattern-measure.mjs`).
> Kapı bu sayıyı 3'te ratchet'liyor: G5 kod olarak indikçe yalnız düşebilir. Aynı boşluk
> `body_length` farkının ayrıştırılamayan kısmının da kaynağı (kabuğun yayı OMUZ halkasından,
> kalıbınki strapless üst serbest kenardan başlıyor — ayrıştırılmadı).
> Bu oturumda 2. maddedeki "GarmentSurf'e 4. halka" işi YAPILMADI; `GarmentSurf` yalnızca
> `engine/src/surfacepattern.hpp`'ye yayınlandı, halka sayısı değişmedi.
>
> ★ **24 Ağu (V4-A) — OMUZ SAYISI ARTIK KAYNAKLI, AMA YANLIŞ KATMANDA. G5 AÇIK.**
> Kaynaklanan şey **FLAT croquis'inin** omuz ucu: `contract/flat-convention-v1.json →
> croquis.landmarks.shoulderTipX` 78.0u (kaynaksız, devralınmış) → **70.1799u = 210.54 mm** (`flat_convention_check`)
> yarı-omuz — iki sayıyı da yargılayan kapı `flat_convention_check`, sayının durduğu yer
> `contract/flat-convention-v1.json`, türetme `chestX 73.3333u × 0.9570`.
> ⚠ "78.0u kaynaksız, devralınmış" etiketi **KORUNUYOR**: 78.0u'yu basan bir alet repoda
> BULUNAMADI, yalnız yerine geçen 70.1799u kaynaklı. 0.9570 satın alınmış Buğra Locket EU38
> `Back Body` parçasında ölçülen omuz/göğüs yarı-genişlik oranı (196.13/204.94) — yani bu sayfanın "SAYI KURALI" bölümünün istediği türden
> bir landmark paritesi, tahmin değil. Üstüne bir kapı satırı kondu
> (`flat_convention_check` md. 1c: omuz ucu x ≤ göğüs x) ve şartın kendisi bir GEOMETRİK
> YASADIR (set-in kol oyuğu omuz ucu ile koltukaltını paylaşır), "Buğra'ya benzerlik" bir
> eşik DEĞİLDİR — Damla'nın 28 Tem kuralı korundu.
> **Bu, aşağıdaki 1-3. maddelerin HİÇBİRİNİ kapatmaz:** düzeltilen şey çizimin manken
> çapasıdır, `GarmentSurf`'ün omuz halkası değil. Kalıp tarafı hâlâ STRAPLESS, `shoulder_width`
> hâlâ `null`, `flat_pattern_agree_check`'in UNMEASURED sayacı hâlâ 3. Ölçüm ve mutasyon
> kanıtı `node engine/tests/flat_pattern_agree_check.mjs` çıktısında.
> ⚠ Aynı croquis'in `waistY`, `chestY` ve `shoulderSlope 0.32` değerleri hâlâ `source: ACIK`
> — `shoulderTipY` tamamen o kaynaksız eğimden türüyor, yani omuz ucunun **x'i** kaynaklı,
> **y'si** değil.

## Mekanizma (mevcut motora eklemeler, ölçüldü/denendi değil — plan)
1. **Pürtüklü üst sınır (ragged grid):** `buildGrid`'e kolon başına tepe
   yüksekliği `hTop[j]`; satır i yüksekliği kolon başına ölçeklenir
   (bel satırı DEĞİŞMEZ — tek halka kanunu aynen). Mevcut kontur/koşu/pens
   makineleri olduğu gibi çalışır; `farEdges` armhole/omuz/yaka koşularına
   bölünür (waistRuns gibi `farRuns` + kırılım kolonları).
2. **Omuz halkası:** GarmentSurf'e 4. halka: yükseklik = napeZ − omuz düşüşü;
   genişlik yarı-ekseni `a_sh = boyun_yarı_genişliği + omuz_boyu·cos(13°)`
   (omuz boyu ölçüsü charttan: 12.25cm EU38 — aynı sayıyı bugün ctest'te taşıyan alet
   `draft_math_check`, satır `engine/tests/draft_math_check.mjs:126`; 13° ise
   `engine/FORMULAS.md` varsayımı ve **onu basan bir alet repoda BULUNAMADI**,
   Buğra'yla sınanacak); derinlik b vücut spline'ından.
3. **Dikiş planı:** omuz koşusu ön↔arka stitch (Shoulder türü); armhole +
   yaka SERBEST kenar (stitch yok); prenses/yan/bel aynen.

## SAYI KURALI (07-sleeve çöpünün dersi — tahmin YASAK)
- armscye DEPTH 21.0cm (EU38, `knowledge/drafting-math-eu38.md`, dikey düşüş).
  Bu sayıyı bugün ctest içinde taşıyan alet: `draft_math_check`, satır
  `engine/tests/draft_math_check.mjs:126` (EU38 satırı: scye 21.0 · shoulder 12.25).
- armhole ÇEVRE kapısı: 40-44cm bandı (MED sanity çapası, `knowledge/drafting-math-eu38.md`).
  Bandı bugün basan iki alet, ikisi de ctest'te: `draft_math_check`
  (`engine/tests/draft_math_check.mjs` — satırı BİLGİ basar, hiçbir tavana bağlamaz) ve
  `garment_armhole_check` (`engine/tests/garment_armhole_check.cpp` — sevk edilen hattın kapısı).
- ön/arka: **ÖN oyuk daha EĞRİ, ARKA yay daha UZUN.** 8/8 bedende ölçüldü
  (`knowledge/armscye-on-arka-2026-08-17.md`). ⚠ 17.08'e kadar burada *"ÖN eğri arkadan
  uzun/derin"* yazıyordu — kaynaksız bir çıkarımdı, `knowledge/`'dan silindi.
- Yaka/armhole EĞRİSİNİN ŞEKLİ uydurulmaz: Buğra Locket-38 landmark'larından
  (patterns_real/geometry/geometry-full.json; ön oyuk 726→937, omuz 937→1001,
  arka omuz 0→65, oyuk 65→287) mm-parite ile kalibre edilir — G5'in tanımı bu.

## Kapılar
1. omuz dikişi çifti ≤0.79375mm (yapıdan ~0 beklenir).
   ⚠ **25 Ağu (V5-R): bu eşiğin KÜNYESİ çürüdü, sayısı değil.** Repo bu 1/32 inç'i
   "üretim standardı" diye Kathleen Fasanella'ya bağlı bir alıntıyla taşıyor
   (`engine/pattern-bridge/seamrules.py:33-35`); o cümle yazarın hiçbir metninde
   bulunamadı, yayınladığı cümle *"I guarantee accuracy to 1/32nd of an inch — but even
   that is fudged"*. Apparel kalıbını bir toleransa bağlayan **yayın hiç bulunamadı**
   (ASTM D6673-10 §1.1 parça-parça karşılığı açıkça kapsam dışı bırakıyor ve standart
   2019'da geri çekildi); apparel'e özel yayınlanmış tek sayı CLO3D'nin 3 mm'si ve biz
   onun 3.8× altındayız. Eşik korunacaksa gerekçesi *"reponun kendi ölçüm gürültüsünün
   üstünde seçilmiş ev değeri"* diye yazılır, kaynak diye değil.
   ⚠ Repo **iki** tolerans taşıyor — `engine/src/surfacepattern.cpp:19` 0.79375 ve
   `engine/src/validator.hpp:23` `pairedSeamTolerance = 3.0` — hangisinin hangi kapıda
   koştuğu **haritalanmadı**.
2. armhole toplamı 40-44cm bandında.
   ⚠ **25 Ağu (V5-R §C2 + V5-D): bu bant VÜCUT ile GİYSİYİ aynı ada koyuyor.** Aldrich
   hedef oyuk ÇEVRESİ yayınlamıyor — yayınladığı şey oyuk eğrisinin derinlikleri; 40-44 cm
   bandının bulunabilen tek zemini bir VÜCUT armscye çevresi (Jill Wolcott, EU38 için
   40.0–40.6 cm). Giysinin oyuğu ondan büyük olmak zorunda; Buğra EU38 kesim çizgisi
   **433.45 mm** zaten bandın üstünde. Ölçüldü: motorun `armhole_circumference` değeri
   8 bedenin yalnız **3'ünde** bizim ölçüm bandımızın içinde (EU34 374.2 · EU36 388.1 ·
   EU38 403.6 · EU40 417.8 mm altında, EU48 485.1 üstünde). `draft_math_check` bu satırı
   BİLGİ olarak basıyor ve **hiçbir tavana bağlamıyor** — yayın yokken eşik yazmak sayı
   uydurmak olurdu. Bant kapıya girecekse önce vücut/giysi ayrımı adlandırılmalı.
   **Ön/arka İŞARET şartı** (düzeltildi 17.08 —
   önceki hali *"ön>arka"* ÇÜRÜK, gerekçe `knowledge/armscye-on-arka-2026-08-17.md`):
   - `ön_oyuk_yay ≤ arka_oyuk_yay` (kesim çizgisinde)
   - `ön_oyuk_yay/kiriş > arka_oyuk_yay/kiriş`
   **BÜYÜKLÜK ŞART DEĞİL, REPORTED.** Fark 8 bedende −13.83 → −1.50mm, yani **9 kat**
   daralıyor (basan alet `node engine/tools/bugra/overlay-png.mjs`, tutanağı `knowledge/armscye-on-arka-2026-08-17.md` § tablo satır 45-52):
   bu bir kanun değil, ölçülen giysinin grade'i. Sayıyı şart yapmak referansı
   kural yapmaktır (Damla 28 Tem: *"Buğra bir REFERANS, kural değil"*).
   ⚠ **Tanık sayısı 1** (`locket_top`); `corset_bustier` strapless, oyuğu yok.
3. Buğra landmark mm paritesi (rapor: parça-parça fark tablosu).
   ★ **25 Ağu (V5-B): o fark tablosunu basan alet artık VAR** —
   `node engine/tools/bugra/overlay-png.mjs locket --size=36`. Motor parçasını Buğra'nın
   aynı beden halkasıyla 1:1 mm üst üste basıyor (döndürme/en-iyi-oturtma/ölçek YOK) ve
   parça başına Δbbox · Δçevre · sapma med/p95/max çıkarıyor; levhaları aletin
   kendisi `--out` ile yazar.
   **Bu bir KAPI DEĞİL, alet** — aletin kendi başlığı da öyle diyor; buradaki hiçbir
   sayıdan "kalıp yanlış" hükmü çıkarılmaz (Buğra referans, kural değil).
   G5 kapandığında bu tablo *"kapı"* yapılacaksa eşiği ayrıca kararlaştırılmalı, bugün yok.
4. Tüm mevcut kapılar (halka, sınır, walk 8 beden) YEŞİL KALIR.
