# ETSY KAPISI — GEOMETRİ YARISI (F-E, 23 Ağu 2026)

> **İKİ F-E VARDIRAYNI GECE.** Bu repoda aynı kartı iki vardiya paralel koştu.
> Öbürü — `knowledge/ETSY-KAPISI-2026-08-23.md`, kapısı `flat_sellable_check` —
> **LİSTELEME GÖRÜNTÜSÜNE** baktı: en-boy oranı, küçük-resim kırpması, raster
> çözünürlüğü, sayfadaki beden tablosu. Bu dosya — kapısı
> `flat_geometry_sellable_check` — **GİYSİNİN GEOMETRİSİNE** bakar: kol gövdeye
> nasıl bağlanıyor, puff'ın eti toplanmış mı, bel okunuyor mu, etek boyla
> genişliyor mu. İkisi çakışmıyor; öbür dosya §3.2'de "bu gece uygulanmadı"
> dediği üç kalemin (kol oyuğu, koltukaltı, puff manşeti) **çizim tarafını** bu
> dosya kapatıyor. Öbür vardiya `render-garment-flat.mjs`'ye hiç dokunmadı.

Girdi: `GECE/log/F-D.shots/locket-EU38-flat.png`
Önce/sonra: `GECE/log/F-E.shots/01-once.png` · `02-sonra.png`
Ham ölçüm: `GECE/log/F-E.bugra-olcum.txt` · mutasyon: `GECE/log/F-E.mutasyon.txt`
Üretici: `GECE/f-e-shot.mjs` (F-D'nin çekimini **bayt bayt** yeniden üretiyor, 7276 bayt)
Kapı: `engine/tests/flat_geometry_sellable_check.mjs` · kanun: `contract/flat-convention-v1.json`

---

## §0 ÖLÇÜT NEREDEN GELDİ

Kartın 1. maddesi "Etsy'de profesyonel sewing-pattern PDF listinglerine bak" diyor.
**Bu vardiya o yola gitmedi** — daha sert bir ölçüt zaten repoda duruyordu ve
kullanılmamıştı: `patterns_real/` içindeki **satın alınmış Buğra Locket kalıbının
kendisi**. Bir listing fotoğrafından gözle çıkarılacak her oran, o kalıbın vektör
geometrisinde milimetre olarak **zaten yazılı**. CLAUDE.md'nin kendi kuralı:
*"benchmark = gerçek Buğra mm"* + *"geometriyle ÖLÇÜLEBİLEN hiçbir şeyi
araştırmaya sorma; ölçüm kesin+bedava, araştırma pahalı+dolaylı."*

Kaynak: `patterns_real/geometry/geometry-full.json` → `locket_top` / **Arka Beden** /
ring size 38. **Neden arka beden:** arka-orta kenarı tam dikey (90.00°, 413.97 mm
düz koşu → parçanın kendi ekseni tahmin edilmeden bulunuyor) ve ön bedenin aksine
pens/placket dış konturu kirletmiyor.

### Ölçülen yan dikiş profili — Buğra Locket EU38 (arka-ortadan yarı-genişlik)

| hat | mm | göğüse normalize |
|---|---|---|
| omuz | 196.13 | **0.9570** |
| göğüs (max) | 204.94 | 1.0000 |
| bel (min) | 157.46 | **0.7683** |
| etek | 179.22 | **0.8745** |

Boy: omuz→etek 413.97 mm · bel omuzdan 289.8 mm aşağıda · etek belden 124.17 mm aşağıda.

### ⚠ MUTLAK mm ÖLÇÜT DEĞİL, sadece ORAN — bu gecenin yan bulgusu

Buğra'nın **kendi** beden çizelgesi (`geometry-full.json → sizeChartMM`):
EU38 = büst **920** / bel **720** / kalça **980** mm.
Bizim kaynaklı çizelgemiz (burda style, verified): EU38 = **880 / 700 / 940**.
**Buğra'nın 38'i, burda'nın 40'ıdır.** Bu yüzden hiçbir yerde Buğra'nın mutlak
milimetresi eşik yapılmadı; yalnız **parçanın kendi içindeki oranları** kullanıldı.
Oran beden çizelgesinden bağımsızdır. *(Bu, `trace-match.py`'ın armhole/cap-ease
sayılarını da etkiler mi — **DOĞRULANMADI**, bakılmadı.)*

---

## §1 BEŞ KUSUR — kök sebep, ölçü, ne yapıldı

### Kusur 1 — "Kollar gövdeden KOPUK, kol oyuğu çizgisi yok" ✅ KAPANDI

**Kök sebep, ve kusurun adı yanlış konmuş.** Kol ile gövde arasında *boşluk*
yoktu (öbür vardiya da bunu ölçtü: iki uç paylaşılıyor, 0 mm). Fazladan bir
*çizgi* vardı: `halfOutline()` kol oyuğu kübiğinin ikinci kontrol noktası
`[underX + 12, …]` = **85.33u** idi. Kübik oradan beslenince eğri **80.4u**'ya
kadar şişiyordu — hem omuz ucunun (78.0u) hem koltukaltının (73.33u) **dışına**.
Gövde konturu, üstüne çizilen kolun içinden **dışarı sızıp** ikinci bir kenar gibi
okunuyordu. Ölçülen taşma: **13.79 mm**, 10 panelin 10'unda.

**İkinci kök:** `sleeveHalf()` içinde `underY = 92` **elle yazılıydı**;
`U.chestY`'nin de 92 olması tesadüftü. Croquis oynasa kol gövdeden gerçekten kopardı.

**Yapılan:** kol oyuğu **içbükey** kılındı — iki kontrol de `[shoulderTipX .. underX]`
aralığına alındı (`c2x = min(shoulderTipX, underX) × 0.94` → içe oyulur).
`underY` croquis'ten okunuyor. Kol path'i `data-part="sleeve"` ile işaretlendi.

**Sonuç:** taşma **13.79 → 0.00 mm**; uç boşluğu 0.06 / 0.10 mm (kalemin yazı
çözünürlüğü 0.30 mm'nin altında).

> **NOT — kapatılmayan yarısı:** öbür vardiyanın teşhisi (*"kol oyuğu `outline`
> 2.0 ağırlığında çiziliyor, oysa set-in kolda o bir KONSTRÜKSİYON DİKİŞİ, `seam`
> 1.4 olmalı"*) **doğru ve bu gece yapılmadı.** Sebep aynı: kontur tek kapalı
> path, ayırmak `flat_convention_check` §1b uç-nokta beyanını riske atıyor.

### Kusur 2 — "Puff kol alttan düz kesik, sivriliyor, manşet yok" ✅ KAPANDI

**Kök sebep:** eski kalem puff kolu bir **boru** çiziyordu — dış kenar
`L (hemX, hemTopY) → (hemX−4, hemBotY)` düz bir çizgi, yani **kolun en geniş yeri
ETİYDİ** (oran 1.000). "Puff" bunun tersidir: dolgunluk yukarıda, et toplanır.
Düz L'nin hem eğrisiyle yaptığı köşe de "sivrilik"ti.

**Yapılan:** kol en geniş yerine **etin üstünde** (bicep hattı) ulaşıyor, sonra
manşete daralıyor; dış kenar kübik. Ete **manşet bandı** (`data-part="cuff-band"`)
ve etin **normaline dik** büzgü tırtıkları kondu — tırtık konumları uydurulmadı,
etin kendi quadratic'i örneklenip normali alındı.

**Eşik nereden:** salt "et < en geniş" **yetmedi** — ölçüldü, **0.9889**'luk bir
boru o eşitsizlikten geçiyor (MUTASYON C). Tavan Buğra'nın **Alt Kol** parçasından:
kendi min-alan dönük kutusunda en geniş **342.22 mm**, dış ucu **319.20 mm** →
**0.9327**. Bu **kasıtlı olarak muhafazakâr**: Alt Kol, puff'ın içindeki düz
katmandır, eti neredeyse hiç toplanmaz; görünen puff (Üst Kol) çok daha fazla
toplanır. Gerçek bir puff bu tavanın altında kalır; tavan sadece "boru çizip puff
demeyi" yasaklar.

**Sonuç:** et/en geniş **1.000 → 0.8670** (en geniş 420.0 mm, et 364.1 mm).

> Öbür vardiya bunu *"F-C'nin işi, `cuffBand` primitifi yok"* diye bıraktı. İkisi
> çelişmiyor: **sözlükte** primitif hâlâ yok, ama **flat kaleminde** puff artık
> manşetli çiziliyor. Primitif gelince kalem onu okur.

### Kusur 3 "Bel yok" + Kusur 4 "Etek ucu kavisi abartılı" ✅ İKİSİ DE (tek kök)

Aynı satırdan çıkıyorlardı:

```js
hemHalf = spec.shaping === 'princess' ? U.hipW * 1.02 : U.hipW * 0.98;
```

Etek yarı-genişliği **boydan bağımsız** kalçaya sabitlenmişti: crop, hip, tunic
**üçü de** 76.75u. Ve 76.75 > chestX 73.33 → **üst, büstten geniş bitiyor**
(1.0477). Bel doğru daralıyordu (58.33u) ama hemen kalçaya açıldığı için
**okunmuyordu**; crop boyda o açılma 24 birime (72 mm) sıkışınca da **kâse
kavisi** çıkıyordu. İki kusur, tek satır.

**Yapılan:** etek yarı-genişliği artık **belden**, ölçülmüş eğimle türüyor:
`hemHalf = min(kalça tavanı, waistW + drop × 0.1881)`.
`0.1881` uydurulmadı: Buğra'da bel 0.7683 → etek 0.8745, arada 41.39 birim düşüş;
eğim = (0.8745 − 0.7683) × 73.3333 / 41.39 = **0.1881 birim/birim**.

**Sonuç — etek/göğüs oranı:**

| boy | ÖNCE | SONRA |
|---|---|---|
| crop | 1.0477 | **0.8590** |
| hip | 1.0477 | **0.9400** |
| tunic | 1.0477 | **1.0477** (kalça tavanı) |

Merdiven **düz halden monoton artan hale** geçti. (Buğra'nın kendi eteği 0.8745,
belden 124 mm aşağıda; bizim crop 72 mm aşağıda — sayı eşitlenmez, **yön** eşitlenir.)

### Kusur 5 — "Boyun çok geniş, omuz çok dar" ⚠ ÖLÇÜLDÜ, KAPATILMADI

**Omuz — teşhis kesin.** `shoulderTipX = 78.0u = 234 mm` yarı-omuz →
**omuzdan omuza 46.8 cm**. Aynı croquis'in göğüs yarı-genişliği 220 mm. Yani
**omuz ucu büstün DIŞINDA** (oran **1.0636**). Set-in kollu hiçbir giyside omuz
noktası göğüs çizgisinin dışında olamaz. Buğra'da oran **0.9570** → doğru değer
**70.1799u = 210.54 mm**, türeyen `shoulderTipY = 16.8576u`.

**Neden kapatılmadı — mazeret değil, bir çıkar çatışması.** Düzeltme **denendi ve
işe yaradı** (yeni kapının S1'i yeşile döndü), ama mevcut
`engine/tests/flat_convention_check.mjs` **kırıldı**. O kapının `measureCroquis()`
çıkarımı omuz ucunu *"CF yakadan aşağı yürürken x'in İLK YEREL MAKSİMUMU"* diye
buluyor. Bu sezgi **sadece omuz göğüsten genişse doğrudur** — yani kapı,
düzeltmeye çalıştığımız kusurun kendisini varsayıyor. Omuz içeri alınınca yerel
maksimum kalmıyor; çıkarım koltukaltını omuz sanıp **27.00 / 153.00 / 750.00 mm**
sapma basıyor.

Düzeltmek **var olan bir testin çıkarımını** değiştirmeyi gerektiriyor;
`GECE/KART/ORTAK.md` md.5 *"Var olan teste dokunma"* diyor. **Eşik gevşetilmedi,
kapı susturulmadı, sayı gizlenmedi:** S1 şartı kapıya HİÇ konmadı, ama her koşuda
ihlal listesi + doğru değer ekrana basılıyor. Karar Damla'da → `DAMLA-KUYRUK.md`
**K-FE-1**. Sonraki aday tek satır: `measureCroquis()` omuz ucunu "ilk yerel
maksimum" yerine **"omuz dikişi ile kol oyuğu arasındaki en keskin köşe"** diye
bulsun.

**Boyun — DOĞRULANMADI.** `neckBase = 30u = 90 mm` yarı (180 mm açıklık). Buğra'nın
ön bedeninde ölçülen yaka yarı-genişliği **45.0 mm**, omuz dikişi **127.07 mm**.
Ama bu iki sayı **doğrudan kıyaslanamaz**: Buğra'nınki yakalı+düğmeli bir parçanın
yaka çizgisi (üstüne Peter Pan biniyor), bizimki bitmiş giysinin yaka açıklığı.
Kıyas kurulamadığı için **hiçbir şey değiştirilmedi.**

---

## §2 KAPI — `flat_geometry_sellable_check`

5 stil × 2 panel. Zevk kapıya **girmez** → `DAMLA-KUYRUK.md`.

| şart | ne tutuyor | sayı nereden |
|---|---|---|
| S1 | omuz ucu büstün içinde | Buğra 0.9570 — **AÇIK KALEM, KAPI DEĞİL (K-FE-1)** |
| S2a | etek ≤ kalça/büst | burda EU38 94/88 = 1.0682 (verified) |
| S2b | etek merdiveni monoton: crop < hip < tunic | **eşitsizlik**, sayı yok |
| S2c | crop/waist boyunda etek < büst | **eşitsizlik**, sayı yok |
| S3 | bel ≤ kaynaklı bel/büst | burda EU38 70/88 = 0.7955 (verified) |
| S4 | kol oyuğu içbükey, uçlarının dışına taşmaz | **eşitsizlik**, sayı yok |
| S5 | kol iki ucu gövdeyle paylaşır | **özdeşlik**; tolerans 0.15 mm = kalemin yarım yazı adımı |
| S6 | puff eti ≤ 0.9327 × en geniş + manşet bandı + ≥3 tırtık | Buğra Alt Kol ölçümü |

Yedi şartın **dördü saf eşitsizlik/özdeşlik** — gevşetilecek sayıları yok. Kalan
üçünün sayısı ya kaynaklı beden çizelgesinden ya satın alınmış kalıptan;
**motorun kendi çıktısından türetilen tek bir eşik yok** (ORTAK.md md.3).

**S5'in 0.15 mm'si gevşetme değil**, kalemin yazı çözünürlüğü: her koordinat 0.1
kullanıcı birimine yuvarlanarak basılıyor (`n()`), yani SVG'de temsil edilebilen
en küçük fark 0.1u = 0.3 mm; "aynı nokta" en fazla yarım adım sapabilir. Daha
büyük seçilse gerçek bir kopukluğu gizlerdi, daha küçük seçilse matematiği değil
**yazıyı** yargılardı.

**Anti-hack:** kapı hiçbir sabiti kalemden import etmez; kalemin **bastığı SVG**'yi
parse eder, path'leri 40 adım/segment örnekler, ölçümü o örnekten çıkarır. Kalem
beyan edip başka şey çizerse kapı **çizileni** görür. Kollu/puff panel sayısı 0
olursa kapı kendini FAIL eder (boş koşamaz).

### Mutasyon kanıtı (`GECE/log/F-E.mutasyon.txt`)

| # | ne geri alındı | kapı |
|---|---|---|
| A | F-D'nin eski kalemi (bütün kod düzeltmeleri geri) | **FAIL, 25 ihlal** — S2b, S2c, S4, S5 |
| B | eski `shoulderTipX = 78.0u` (S1 kapı yapılmış haliyle) | **FAIL, 10 ihlal** — S1 |
| C | puff eti düz boruya geri (`CUFF_RATIO 0.72 → 1.0`) | **FAIL, 2 ihlal** — S6 (0.9889 > 0.9327) |

---

## §3 YAPILAMAYAN / DOĞRULANMAYAN (gizlenmedi)

- **Kartın 1. ve 2. maddesi (Etsy listing taraması + Chanel/Bershka özellik dili)
  BU VARDİYADA YAPILMADI.** Bir web araştırma ajanı salındı, gece bitmeden
  dönmedi; §0'daki birincil kaynağa geçildi. **Öbür vardiya bunu yaptı** —
  `knowledge/ETSY-KAPISI-2026-08-23.md` §1 ve §2. Oraya bak, tekrar edilmedi.
- **Kol parçalarının kendi ekseni çıkarılamadı.** Üst/Alt Kol nest'te döndürülmüş
  ve **hilal** şekilli; eksene hizalı tarama da min-alan dönük kutu da yanlış
  eksen veriyor (Üst Kol: 89.0°'de 203×505 mm, anlamsız — uç genişlikleri 8 mm ve
  7 mm çıkıyor). S6'nın 0.9327 tavanı bu yüzden **Alt Kol**'un dönük kutusundan;
  muhafazakâr ama **puff'ın gerçek büzgü oranı DEĞİL**. Doğrusu için kapak
  akorunun iki ucundan çerçeve kurulmalı — yapılmadı.
- **Ön Beden profili kullanılmadı.** Pens dış konturu kesiyor; tarama %60'ta
  176.06 mm, %70'te 300.00 mm gibi zıplayan sayılar veriyor. Arka bedenle
  yetinildi; **ön/arka yan dikiş farkı ölçülmedi.**
- **Etek ucu SARKMASI hiç yargılanmadı.** `dip = 4u = 12 mm`. Kapatılan şey
  **açılmaydı** (genişlik), sarkma değil. Damla "kavis" derken sarkmayı da
  kastediyor olabilir. Buğra'nın etek ucu eğrisi **ölçülmedi**.
- **Kısa puff kolun doğru boyu ölçülmedi** — bugün omuzdan 96u = 288 mm, bitmiş
  flat'te kol büstün altında bitiyor. Uzun görünüyor; sayısı yok.
- **`hemRisePerU = 0.1881` TEK BİR KALIPTAN, TEK BEDENDEN.** 8 bedene ya da ikinci
  bir kalıba (corset_bustier) bakılmadı; grade'i sabit mi bilinmiyor.
- **Elbise (`isDress`) yolu bu gece HİÇ DEĞİŞMEDİ.** Etek genişliği hâlâ eski
  `flare` çarpanlarından (aLine 1.58 / straight 1.12 / gathered 1.9 / circle
  2.6-2.1) ve bu çarpanlar **kaynaksız**. Kapı elbiseye sadece S1/S3'ü uyguluyor;
  S2 ailesi (etek merdiveni) elbisede **koşmuyor**.
- **`ctest` bu gece ÜÇ VARDİYA aynı ağaçta koştuğu için izole değil.**
  `photo_ratio_wire_check` kırmızısı `web/js/create.js`'ten geliyor; o dosyaya
  bu vardiya **hiç dokunmadı** (F-I commit'i `8373176`).
