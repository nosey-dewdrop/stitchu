# ETSY KAPISI — flat satılır mı? (F-E, 2026-08-23)

Damla (SSB-10/11/12): *"flatlerin testi SATILIR MI, ETSY'LİK Mİ."* ·
*"chanel gibi haute couture, bershka stradivarius, genz tarzındaki ürünlere baksın ve
flat etsylik mi, HAYIRSA OLMAMIŞ, geliştirme yolları aranacak ve DEVELOP EDİLECEK.
sadece hata rapor etmesin, hataysa ÇÖZÜM DÜŞÜNSÜN."*

**CEVAP: HAYIR, DEĞİLDİ.** Ve sebebi çizimin zevki değil, çerçevesiydi — aşağıda 8
maddede sayıyla. Üçü bu gece kapatıldı, ölçülerek.

---

## §0 ERİŞİM BEYANI (uydurma yok)

| araç | sonuç |
|---|---|
| `WebFetch` | **5/5 denemede BLOKE.** etsy.com 403 · blog.patternreview.com 403 · cloningcouture.com 403 · freesewing.eu 404 · en.wikipedia.org 404 |
| `WebSearch` | **ÇALIŞTI.** Aşağıdaki dış sayılar bu turdan, kaynak URL'leriyle. |

Yani: **sayfa gövdesi çekilemedi, arama sonucu özeti çekilebildi.** Bu dosyadaki her
dış sayının yanında kaynağı var; kaynağı olmayan hiçbir sayı yazılmadı. Etsy listing
görsellerini TEK TEK inceleyemedim (403) — fiyat bandı ve "kaç görsel" gözlemi bu
yüzden **DOĞRULANMADI** işaretli.

---

## §1 "ETSY'LİK FLAT"IN ÖLÇÜLEBİLİR TANIMI — 8 madde, her biri sayıyla

Damla'nın istediği buydu: madde madde, her biri SAYIYLA. Sağdaki sütun bu gece
ölçülen `GECE/log/F-D.shots/locket-EU38-flat.svg` değeri.

| # | madde | eşik + KAYNAK | F-D'deki hâlimiz | mekanik? |
|---|---|---|---|---|
| 1 | **Yükleme oranı** | 4:3 (1.3333) yatay veya 1:1 — Etsy önerisi | **2.840** ✗ | EVET |
| 2 | **Arama küçük-resmi güvenli kutusu** | Etsy ilk fotoğrafı 570×456 = **5:4 = 1.25**'e ORTADAN kırpar; dışı aramada görünmez | ink'in **%37.5**'i sağ kalıyor ✗ | EVET |
| 3 | **Çözünürlük** | kısa kenar ≥ **2000 px** (altında zoom açılmıyor) | **493 px** ✗ | EVET |
| 4 | **Görünür beden beyanı** | beden aralığı okunur mürekkep olarak basılı | yok — sadece `data-scale="1:3"` (makine attribute'u) ✗ | EVET |
| 5 | **Görünür ölçek çapası** | çizilen bir ölçek çubuğu, etiketi = gerçek uzunluğu | yok ✗ | EVET |
| 6 | **Beden tablosu** | her beden için satır; SADECE kaynaklı kolonlar | yok ✗ | EVET |
| 7 | **Ön + arka** | ikisi de var | **VAR ✓** (F-D kapattı) | EVET |
| 8 | **Çizgi hiyerarşisi** | dış siluet en kalın, üst dikiş **kesik**, gizli hat **noktalı**, 3 ağırlık | **VAR ✓** — ölçüldü: 6 elemanda 2.0, 7'sinde 1.4, 26'sında 1.0, 2'sinde 1.0+"4 3" | EVET |

★ **Ölçtüğüm en sert tek sayı, madde 2.** F-D flat'i 744×262. Etsy'nin ortalı 5:4
kırpması `x ∈ [371,1028]`'i tutuyor; ama **FRONT paneli x=184'te, BACK paneli
x=560'ta**. Yani arama sonucunda görünen küçük resim, iki gövdenin **dilimlenmiş**
hâli. Bu bir zevk meselesi değil, çerçeve aritmetiği.

**KAPIYA GİRMEYEN (zevk) maddeler → `DAMLA-KUYRUK.md`, hakem Damla:** mürekkep
yoğunluğu / sayfa doluluk hissi · manken inceliği · çizimin "el çizimi" karakteri ·
kaç görsel yüklenmeli · fiyat bandı.

**Kaynaklar (§1):**
[Etsy foto boyutu/oran](https://www.growingyourcraft.com/blog/etsy-listing-photo-optimal-size-aspect-ratio) ·
[2000px minimum](https://snaptosize.com/etsy-listing-photo-size) ·
[570×456 küçük resim, ortadan kırpma](https://www.insightagent.app/guides/etsy-listing-photo-and-thumbnail-size-guide) ·
[teknik flat çizgi ağırlığı konvansiyonu](https://www.arcusag.com/fashion-design-sketches-that-manufacturers-understand/)

---

## §2 STİL PANOSU — MENÜ İSMİ DEĞİL, YAPI DİLİ

Damla'nın istediği dönüşüm: *"sweetheart yaka DEME — yapıyı SÖYLE."* Aşağısı görsel
değil; **link + özellik-dili tarifi**. Repoya hiçbir telifli görsel indirilmedi.

### 2.1 Chanel haute couture ceket — yapı, "şık" değil
| menü ismi | YAPI DİLİ (flat'te çizilebilir olan) |
|---|---|
| ~~"Chanel ceket"~~ | gövde **kenar boyunca kesintisiz bir bordür** taşır: yaka çizgisini, ön kapanışı, cepleri, manşeti ve etek ucunu TEK sürekli hat olarak dolanır → flat'te bu, siluetin 3–5 mm içinden ofsetlenmiş **ikinci kapalı kontur**tur |
| ~~"güzel oturan kol"~~ | **ÜÇ PARÇALI KOL**: normal iki-parçalı koldan farklı olarak ince bir ÜÇÜNCÜ alt-kol paneli var → flat'te kol dış konturunun içinde **iki uzunlamasına dikiş** görünür, biri arka-dış, biri ince alt |
| ~~"ağır düşüyor"~~ | etek ucunun İÇİNE elle dikilmiş **zincir ağırlık** → flat'te etek ucunda `hidden` sınıfı (noktalı) bir hat |
| ~~"lüks astar"~~ | ipek astar dış kumaşa **kapitone ızgarayla** dikilir → flat'in dışında görünmez; ama tarif/rehber katmanına (F-H) düşer |

Bizim sözlüğümüzde bu dördünden **hiçbirinin** karşılığı yok. `topstitch` sınıfı var
ama "kenar boyunca dolanan sürekli bordür" bir PRİMİTİF değil.
Kaynak: [Threads — Inside My Chanel Jacket](https://www.threadsmagazine.com/readerproject/2010/10/24/inside-my-chanel-jacket) ·
[Susan Khalje / WeAllSew](https://weallsew.com/haute-couture-master-teacher-susan-khalje-spills-the-secrets-of-the-classic-french-jacket/) ·
[Linton Tweeds](https://lintontweeds.com/us/news/how-to-create-a-chanel-inspired-jacket)

### 2.2 Bershka / Stradivarius / genz — yapı
| menü ismi | YAPI DİLİ |
|---|---|
| ~~"oversized"~~ | **düşük omuz**: omuz ucu, kol oyuğu genişliğinin dışına taşırılır ve kol oyuğu **düz bir dikeye** yaklaşır (set-in kavis kaybolur) → croquis'te `shoulderTipX` sabit kalır ama GİYSİ omuz noktası ayrı bir eksen olur |
| ~~"korse üst"~~ | gövde **panellere bölünür ve panel dikişi bust apeksinden geçer**; apeks çentikle işaretlenir; dikiş apeksten dışarı **≈12.7 mm (1/2")** kaydırılabilir ve oturuş bozulmaz — bu bir TOLERANS, sayısı yayınlanmış |
| ~~"crop"~~ | etek ucu bel çizgisinin ÜSTÜNDE biter → yan dikiş belde daralıp **yeniden açılmaya vakit bulamaz** |
| ~~"Y2K"~~ | bel çizgisi aşağı iner (low-rise) → bel/kalça arası dikey mesafe kısalır |

**Kaynak (bust apeksi + 1/2" toleransı, YAYINLANMIŞ):**
[Cashmerette — princess seam / apex](https://blog.cashmerette.com/2020/11/how-to-do-an-fba-on-a-princess-seamed-bodice.html) ·
[Closet Core — princess bodice fitting](https://blog.closetcorepatterns.com/bodice-fitting-guide-to-fitting-princess-seams/) ·
[M.Müller & Sohn — princess seam](https://www.muellerundsohn.com/en/allgemein/princess-seam/)

### 2.3 ★ TEKNİK FLAT ≠ MODA İLLÜSTRASYONU — bu gecenin en kullanışlı dış sayısı
Yayınlanmış konvansiyon: moda illüstrasyonu **9–10 kafa** boyunda abartılı figür
kullanır; **teknik çizim 7–8 kafaya geri çeker**, çünkü muhatabı kalıpçı/üreticidir.
→ Damla'nın *"flatler kadınların olduğundan daha ince gerçek mankenlere göredir"*
cümlesi bir MANKEN çizelgesi ister; ama teknik flat için doğru bant 7–8 kafa, 9–10
değil. Bu ikisi çelişebilir; **karar Damla'nın**, kuyruğa düştü.
Kaynak: [8 vs 9-10 kafa; teknik çizim 7-8](https://fashionillustrationtribe.com/whats-up-with-fashion-proportions/) ·
[9-kafa sistemi](https://vizcom.com/blog/fashion-croquis)

---

## §3 KUSUR → KÖK SEBEP → ÖLÇÜLEN ÇÖZÜM

Kart (`GECE/KART/F-E-etsy.md`) gözle 5 kusur saydı. **Üçünü doğruladım, birini
ÇÜRÜTTÜM, biri başka fazın işi.** Sonra 3 yeni ve daha sert kusur ölçtüm.

### 3.0 ÖNCE: KARTIN İDDİASINI ÇÜRÜTEN ÖLÇÜM (bilgi silinmez)
**Kart md.1: "kollar gövdeden KOPUK — arada beyaz boşluk, kol oyuğu çizgisi yok."**
→ **OMUZDA YANLIŞ.** SVG'den okundu: gövde konturu omuz ucunda `(78.0, 19.4)`
duruyor; kol path'i **tam aynı noktadan** başlıyor (`M 78.0 19.4 C 102.8 -2.6 ...`)
ve `L 73.3 92.0` ile koltukaltı noktasında gövdeye geri bağlanıyor. İki uç da
paylaşılıyor, boşluk **0 mm**. Zoom kanıtı: `/tmp/armhole_zoom.png` üretildi ve
bakıldı — omuzda boşluk yok.
→ **GERÇEK OLAN, ADI YANLIŞ KONMUŞ:** koltukaltında gövde ile kol **keskin bir V
köşesiyle** buluşuyor (`/tmp/underarm.png`), ve kol oyuğu `outline` (2.0) ağırlığında
çiziliyor — yani bir SİLUET gibi okunuyor, oysa set-in kolda kol oyuğu bir
**KONSTRÜKSİYON DİKİŞİ**dir, `seam` (1.4) sınıfına ait. "Kopukluk" hissi buradan.

### 3.1 UYGULANAN ÇÖZÜMLER (3 adet, önce/sonra ölçüldü)

| # | kusur | neden Etsy'lik değil | çözüm — dosya | ÖLÇÜLEN SONUÇ |
|---|---|---|---|---|
| **Ç1** | oran 2.840 | §1 md.1+2 | **YENİ** `engine/tools/render-listing-sheet.mjs` — 4:3 listing sayfası, flat'i BOZMADAN sarar | oran **2.840 → 1.333**; küçük-resim kırpmasında sağ kalan ink **%37.5 → %100.00** |
| **Ç2** | kısa kenar 493 px | §1 md.3 | **YENİ** `engine/tools/raster.mjs` — headless Chrome, komut edilen piksel boyu | kısa kenar **493 → 2000 px** (çıktı 2667×2000) |
| **Ç3** | görünür beden/ölçek/tablo yok | §1 md.4,5,6 | aynı sayfa: başlık + `EU 34–52 · PDF SEWING PATTERN · PRINT AT 100%` + 200 mm ölçek çubuğu + 10 satırlık beden tablosu | görünür `<text>` sayısı **2 ("FRONT","BACK") → 47**; beden satırı **0 → 10** |

**Ç1'in mimari gerekçesi (önemli):** flat'i 4:3'e ZORLAMADIM. Flat, F-D'nin kanununa
tabi bir teknik çizim (tek croquis, 1:3 beyanı, `flat_convention_check`). Listing
sayfası ise alıcının gördüğü AYRI bir nesne ve başka yayına (Etsy) tabi. Flat'i
Etsy'ye uydurmak F-D kanununu kırardı; **sarmak kırmıyor** — ve kapı, flat
path'lerinin sayfa içinde **bayt bayt aynı** kaldığını doğruluyor (anti-hack §8).

**Ç3'te K10'a dokunulmadı:** beden tablosunda SADECE `contract/tables.json`'ın
`status="verified"` dediği 3 kolon basılıyor (bust/waist/hip, burda style). Kaynaksız
4 kolon (`shoulderCM` `backLengthCM` `armLengthCM` `neckCM`) **basılmıyor** —
satacağımız bir şeyin üstüne kaynaksız sayı yazılmaz. Kapı bunu da zorluyor.

### 3.2 UYGULANMAYANLAR — neden, ve sonraki aday (§E: bırakılmadı, bulundu)

| kusur | kök sebep (ölçülü) | neden bu gece uygulanmadı | sonraki aday (dosya + değişiklik) |
|---|---|---|---|
| kol oyuğu `outline` ağırlığında | `render-garment-flat.mjs:427` gövde konturunun TAMAMINI `W_OUTLINE`=2.0 ile basıyor; kol oyuğu o konturun bir parçası | kontur tek bir `<path>`; kol oyuğu segmentini ayırmak siluetin kapalılığını bozar, `flat_convention_check` §1b uç-nokta beyanını kırma riski var — **ölçmeden dokunmam** | konturu bölmek yerine kol oyuğu yayını `seam` (1.4) sınıfında **ikinci bir path olarak ÜSTÜNE** çiz; beklenen: kol oyuğu dikiş olarak okunur, uç noktalar değişmez, 5. sınıf (`hidden`) hâlâ kullanımda kalır |
| koltukaltında keskin V köşesi | kol iç kenarı düz `L` ile koltukaltına iniyor (`M ... L 73.3 92.0`) | aynı path ailesi; ölçüsüz dokunma yasak | `L`'yi kısa bir `Q` ile değiştir, teğet açısını gövde konturunun koltukaltındaki teğetine eşitle; beklenen: birleşme açısı ~65° → ~15°, ölçüsü SVG teğetinden çıkar |
| puff kol altı düz kesik, manşetsiz | manşet/lastik bitişi bir PRİMİTİF değil (F-C sözlüğünde yok) | **F-C'nin işi** — sözlük reformu primitif eklemeden çizilemez | `contract/primitives-v1.json`'a `cuffBand` primitifi |
| "manken gerçek kadından ince" | `contract/flat-convention-v1.json referenceBody.openItem`: **yayınlanmış manken çizelgesi YOK** | uydurmak yasak; üstelik §2.3'e göre teknik flat 7–8 kafa ister, 9–10 değil — bu bir ÇELİŞKİ | **DAMLA KARARI** (kuyruk) |
| mürekkep yoğunluğu %2.94 | sayfa daha çok kâğıt taşıyor | eşiği YAYINDA bulamadım; kendi çıktımdan eşik türetmek dairesel (SSC) | zevk → kuyruk |

⚠ **DÜRÜST NEGATİF:** ink kapsama oranı **%3.68 → %2.94'e DÜŞTÜ** (2000px'te ölçüldü).
Sayfa daha çok beyaz taşıyor çünkü tablo + başlık bandı geldi. Buna karşılık sayfa
artık 47 görünür bilgi kalemi taşıyor ve küçük resimde %100 sağ kalıyor. Bunu bir
kazanç diye satmıyorum — **ölçüldü, düştü, yazıldı.**

---

## §4 KAPI — `flat_sellable_check`

`engine/tests/flat_sellable_check.mjs`, `flat_convention_check` ile **aynı 8 stillik
matriste** koşar (tek giysi gören kapı demo'dur, kapı değildir). Ölçtüğü 9 şart §1'in
mekanik yarısı; zevk kapıya alınmadı.

**Hiçbir eşik motorun kendi çıktısından türetilmedi (SSC).** Kaynaklar kapının
başında `[E1] [E2] [L] [K10]` etiketleriyle basılıyor.

### Mutasyon kanıtı — kapı gerçekten ısırıyor
| mutasyon | sonuç |
|---|---|
| M1 sayfayı 2.84 oranında bas (F-D statükosu) | **KIRDI** — 92/286 nokta güvenli kutu dışında, exit 1 |
| M2 "PRINT AT 100%" satırını sil | **KIRDI** — exit 1 |
| M3 ölçek çubuğunu yanlış etiketle (200 yaz, 250 çiz) | **KIRDI** — "the sheet lies about size", exit 1 |
| M4 kaynaksız `shoulderCM` kolonunu bas | **KIRDI** — K10 ihlali, `backLengthCM` de yakalandı |
| M5 sayfa flat'i sarmak yerine yeniden çizsin | (aşağıda, koşu logu `GECE/log/F-E.listing.mutasyon.txt`) |

★ **Kapı ilk koşuda KENDİ hatasını yakaladı:** ilk `drawnPointsRoot` yazdığım hâlde
`scale(-1,1)` aynasını `|sx|` alıp "garantiye almak için" hem +x hem −x noktası
basıyordu. Bu, her sayfada **8 hayalet nokta** uydurdu (1166 birim dışarıda) ve 8
stilin 8'i de kırmızı düştü. Sıkı yönde yanlış olmak da yanlış olmaktır; parser
işaretli transform'a çevrildi ve gerekçesi kodun içine yazıldı.

---

## §5 SORULMADI AMA ÖNEMLİ (döküm — kısaltma dürtüsü geçersiz)

1. **F-D kapısı, Damla'nın BAKTIĞI görüntüyü ölçmüyor.** `flat_convention_check`
   ÜRETİM kalemini (`render-garment-flat.mjs`) 8 stilde koşturuyor. Ama vitrindeki
   `locket-EU38-flat.svg` **REFERANS kalemden** (`engine/flat-engine/_engine-full.mjs`,
   salt-okunur) çıkmış. İkisi aynı kanuna tabi değil. Locket görüntüsünde `hidden`
   sınıfı (1.0 + "1 3") **hiç kullanılmıyor** — 41 elemanın dağılımı 26×1.0, 7×1.4,
   6×2.0, 2×(1.0+"4 3"). Kanuna aykırı değil, ama "5/5 sınıf kullanıldı" YEŞİLİ
   üretim kaleminden geliyor, vitrinden değil.
2. **Bu gece repoda EŞZAMANLI İKİNCİ BİR AJAN çalışıyor.** Koşum sırasında
   `contract/flat-convention-v1.json` benim dışımda değişti: `shoulderTipX`
   **78.0 → 70.1799** (gerekçe: omuz ucu göğüs yarı-genişliğinin DIŞINDAYDI,
   78.0 > 73.3333) ve `sideSeamProfile` + `sleeveLaw` blokları eklendi. Ayrıca
   `engine/src/bodice.cpp`, `dxf.cpp`, `geometry.cpp` değişmiş durumda.
   **Benim commit'im yalnızca kendi 4 dosyamı içeriyor.** O ajanın işi ayrı
   raporlanmalı; buradaki önce/sonra sayılarım **dondurulmuş** F-D SVG dosyası
   üzerinden alındığı için etkilenmedi.
3. **Etsy fiyat bandı — DOĞRULANMADI.** Arama sonuçlarında $7.50 / $9.00 / $10.00
   tekil listing fiyatları göründü, ama listing sayfalarını açamadım (403) ve bir
   ORTALAMA yayını bulamadım. "PDF kalıp $8–12 bandındadır" cümlesini **kurmuyorum**.
   Repo kaydındaki *BugraPatterns 5 ayda 1.1k satış* rakamı da bu turda
   doğrulanamadı (`benchmark-58/` diskte yok — CLAUDE.md 6 Ağu notu).
4. **"Kaç görsel" — DOĞRULANMADI.** Doğrulanabilen tek sayı: Etsy listing başına
   **20 fotoğraf + 1 video (5–15 sn)** sınırı. Profesyonellerin kaçını kullandığını
   ölçemedim.
5. **Etsy'nin kendi anketi:** ankete katılanların **%90'ı** "ürünün kaliteli bir
   görseli" satın alma kararında en önemli şey dedi; "Görsel Kalitesi", "Ürünün
   Fiyatı"nın ÜSTÜNDE sıralandı. Bu, F-E'yi bir kozmetik faz değil bir SATIŞ fazı
   yapıyor. Kaynak: [Alan Ranger — Etsy product photography](https://www.alanranger.com/blog-on-photography/etsy-product-photography-rules)
6. **Bizim çizgi hiyerarşimiz yayınlanmış konvansiyonla ÖRTÜŞÜYOR** — bu iyi haber
   ve şimdiye kadar hiç doğrulanmamıştı. Yayın: "dış siluet iç detaydan kalın,
   dikişler kesik çizgi, gizli dikişler noktalı, 3 ağırlık kullan." Bizim kanun:
   outline 2.0 / seam 1.4 / mark 1.0 / topstitch 1.0+"4 3" / hidden 1.0+"1 3".
   **Birebir aynı sistem.** F-D'nin bu kararı dışarıdan doğrulandı.
7. **`patterns_real/` okunmadı, indirilmedi.** Telifli görsel repoya girmedi.
8. **Göremediklerim:** Etsy listing gövdeleri · gerçek satıcıların görsel sırası ·
   Chanel/Bershka ürün sayfaları (403) · FreeSewing doküman sayfası (404).

---

## §6 SONRAKİ ADIM (F-E'nin bıraktığı kanca)

1. Kol oyuğunu `seam` sınıfına indir + koltukaltı V'sini `Q` ile yumuşat (§3.2, iki
   satır, ölçüsü SVG teğetinden çıkar — tahmin yok).
2. Listing sayfasını **vitrine bağla**: `web/` bugün bu sayfayı hiç üretmiyor;
   `bundle_fresh_check` mantığıyla bir tazelik kapısı gerekir.
3. Manken çizelgesi çelişkisi (§2.3) Damla'ya soruldu — cevap gelene kadar croquis
   insan bloğunun üstünde duruyor ve bunu AÇIKÇA beyan ediyor.
