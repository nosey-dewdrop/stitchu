# PEMBE ELBİSE DEFTERİ — flat motorunun kök sorunları

Her turda: görsel → teşhis → bağımlı/bağımsız değişken analizi → kesim → sonuç.
Sadece eklenir. En yeni en altta.

**Hedef:** `GIRDI/pembe-fiyonk-mini.png` elbisesinin satılır flat'i.
**Motor:** `web/lib/siluet-ciz.js` · **Girdi:** `pembe-siluet.json` · **Çıktı:** `pembe-flat.png`

---

## DEĞİŞKEN HARİTASI (hangi sayı neyi bozuyor)

Bu tablo turlarda ölçüldü. Bir değişkeni oynatınca hangilerinin bozulduğu.

| BAĞIMSIZ (elle verilen) | BAĞIMLI (kendiliğinden değişen) | ölçülen etki |
|---|---|---|
| `kontur.gogus` | kum saati derinliği, koltukaltı rafı | göğüs−koltukaltı > %15 → koltukaltında sivri raf |
| `kontur.koltukalti` | kol oturması, silüet düzlüğü | koltukaltı ≈ göğüs olursa silüet tüpleşir |
| `kontur.bel` | kum saati, "kadın gibi" görünme | göğüsten %16 dar = doğal; %25 = abartı; %5 = tüp |
| `kontur.omuzUc.y` | omuz eğimi | `neckBase+10` = cetvel; `+58..62` = doğal (croquis 16°) |
| `kontur.yakaOmuz.x` | açıklık genişliği TABANI | `yakaBicim` oranları bunun KATI — bunu değiştirince tüm yaka ölçeklenir |
| `kontur.etekYan.y` | gövde boyu/göğüs oranı, tüm iç öğelerin yeri | etek ucu değişince üst dikiş + prenses dikişi HAVADA kalır |
| `kol.dis.x` | kolun görünürlüğü | `omuzUc.x`'ten küçükse kol **kaybolur** |
| `kol.ic.x` | koltukaltı çakışması | `koltukalti.x`'i aşarsa kol gövdeye girer |
| `yakaBicim` dip noktaları | dip yuvarlak/kare | biri ≤0.45 ise yelpaze → yuvarlak; hepsi >0.45 ise düz |

**En kırılgan bağ:** `etekYan.y`. Onu oynatınca 3 öğe birden havada kalıyor.
**En sinsi bağ:** `yakaOmuz.x` — `yakaBicim` oranlarının paydası olduğu için
açıklığı daraltmak isterken tüm yakayı ölçekliyor.

---

## Tur 46 — motorun beş kökü kesildi (ajan)

Görsel: `defter-46.png` yok (tur 52'de birleşti)

**Teşhis — kök sebepler, hepsi motorda:**
1. Açıklık gövde konturunun *parçasıydı*; kalın dış kontur ağırlığında basılıyordu
   ve bağımsız şekil verilemiyordu → ayrı kapalı eğri yapıldı
2. Sol kol evinde **parametre sırası ters**: koltukaltı `ou`'ya, omuz `ka`'ya
   gidiyordu. Fonksiyonun ağırlıkları asimetrik (0.42/0.78) olduğu için eğri
   başka bir eğri oluyordu → gövde ile kol arasında **7.6 mm** açıklık, omuzdaki
   beyaz çizginin sebebi buydu
3. Gölge yok: satıcı flat'lerinde derinlik kenara yapışan ince koyuluktan gelir
   → `kumasParcasi()` + `koyult()` (gölge kumaştan türer, sabit gri değil)
4. **`gogusAyri = |gogus.y − koltukalti.y| >= 30`** — göğüs koltukaltına 30mm'den
   yakınsa yan dikişten **tamamen atılıyordu**. croquis'te fark 15mm → göğüs
   **her zaman** atılıyordu. Gövdenin en geniş yeri (149.4 vs 114.7) çizimden
   çıkarılmıştı. "Kum saati yok"un kök sebebi → `yanKumSaati()`
5. `yakaOmuz → omuzUc` arası düpedüz `L` idi → `omuzYolu()` (sapma/kiriş 0.046,
   ölçüm: etsy-01 0.048, etsy-08 0.045)

---

## Tur 47-52 — çıktıya bakıp bulunan 12 sorun, aynı turlarda kesildi

**BAĞIMLI/BAĞIMSIZ ANALİZİ — bu turlarda ölçülen zincirler:**

`koltukalti` ↑ → göğüsle fark ↓ → **silüet tüpleşir** (tur 47'de oldu)
`kol.dis.x` < `omuzUc.x` → **kol tamamen kaybolur** (tur 47 ve 49'da oldu)
`kol.ic.x` > `koltukalti.x` → kol gövdeye girer, koltukaltı kaybolur
`yakaOmuz.x` ↑ → `yakaBicim` oranları aynı kalsa bile **tüm açıklık büyür**

**Kesilen sorunlar:**
| # | sorun | kök | kesim |
|---|---|---|---|
| S1 | yaka dar yarık | `OMUZ_ASMA_SINIRI = 1.0` açıklığın `yakaOmuz`'u aşmasını yasaklıyordu | sınır yanlış referanstaydı: `yakaOmuz` boyun kenarıdır, omuz ucu değil. Tavan `0.80 × shoulderTip.x / yakaOmuz.x` oldu |
| S5,S11 | kol kayboldu | `kol.dis.x` `omuzUc.x`'in içinde kaldı | dis `shoulderTip*1.10`'a çıkarıldı |
| S7 | gövde tüpleşti | koltukaltı göğüse eşitlendi | koltukaltı göğüsten %13 dar (ölçüm: etsy-08 kolevi/göğüs 0.87) |
| S12,S14,S17 | yaka dibi yuvarlak/sivri | **yelpaze kuralı her dibi yuvarlak yapıyordu** — kare dekolte çizilemiyordu | HEDEF md.9 ihlali: dip biçimi okumanın kararı oldu. Dipte bir nokta ≤0.45 ise yuvarlak, hepsi >0.45 ise düz |
| S18 | kol koltukaltıyla çakıştı | `kol.ic` (138) > `koltukalti` (124) | ic `bustLine*0.90` |

---

## Tur 52 — şu anki hal

Görsel: `defter-52.png`

**Kesilenler:** pembe kumaş rengi, gölge, kum saati, omuz eğimi, kol evi tek çizgi,
gerçek kısa kol, kare dekolte dibi, dikiş payı çizgileri kaldırıldı.

**AÇIK KALAN — bir sonraki turun işi:**
- yaka hâlâ fotoğraftakinden dar ve yukarıda; fotoğrafta göğse kadar inen geniş kare
- kol omuzda biraz kısa
- fiyonk/bağ/bant hâlâ `#fff` (giysiden kesilir, kumaş renginde olmalı)
- gölge çok hafif, satıcı flat'lerindeki kadar belirgin değil
