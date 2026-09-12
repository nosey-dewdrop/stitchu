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

## Tur 53 — fiyonk kumaş rengine geçti, yaka derinleşti

Görsel: `defter-53.png`

**BAĞIMLI/BAĞIMSIZ ANALİZİ (kesimden ÖNCE yapıldı):**

*Yaka derinliği artırılacak* → bağımlı olanlar tarandı:
- ten dolgusu eşiği (45mm): zaten aşılıyor, etkilenmez ✓
- fiyonk/bağ yeri: bandın üstünde, yakaOrta'ya bağlı değil ✓
- üst dikiş: zaten kaldırılmıştı ✓
→ **derinlik tek başına değiştirilebilir, güvenli.** Kesildi.

*Kol omuzda kısa görünüyor* → ölçüm: `kol.dis.x`=179.5, `omuzUc.x`=144.9.
Fark 34.6mm — kol **yatay** uzuyor, dikey değil. Yani `dis.y`'yi değil `dis.x`'i
düşürmek gerek. `shoulderTip*1.14` → `*1.08`.

**Kesilen:**
| sorun | kök | kesim |
|---|---|---|
| fiyonk/bant/bebeYaka beyaz | `ogeCiz` sabit `fill="#fff"` — kumaş rengi öğelere hiç geçmiyordu | `ogeCiz(o,pts,s,K,KUMAS)` — giysiden kesilen öğe giysinin rengindedir. Fermuar dişi ve düğme beyaz kalır (aksesuar) |
| yaka sığ | derinlik/gövde boyu = 0.267 hedefi tutmuyordu | `yakaOrta` `neckFront+137` (gövde boyu 620.5 × 0.267 = 165.7mm) |

**AÇIK — sıradaki turun işi:**
- S19 kurdele uçları (`bag`) hâlâ beyaz
- S20 yaka dibi hâlâ fotoğraftakinden yukarıda
- S21 kol/gövde birleşimi omuzda sivri

## Tur 54 — kurdele kapandı, yaka derinleşti

Görsel: `defter-54.png`

**BAĞIMLI/BAĞIMSIZ ANALİZİ (kesimden önce):**

*Yaka derinliği +15mm* → taranan bağımlılar:
- ten dolgusu eşiği 45mm: aşılı ✓ · prenses dikişi `bustLine*0.58`'den başlar,
  `yakaOrta`'ya bağlı değil ✓ → **güvenli**

*Kol/gövde birleşimi sivri* → ölçüm: `kol.dis.y`=168.3, `omuzUc.y`=62.
Aralık 106mm, kol dik iniyor. `dis.y`'yi `underarm-52`'ye çektim.

**Kesilen:**
| sorun | kök | kesim |
|---|---|---|
| kurdele beyaz | `bag` case `fill="none"` — şerit içi boş, zemin görünüyordu | şerit KAPALI yola çevrildi (iki kenar + uç kesimi + `Z`), `fill=${KM}` |
| yaka sığ | derinlik oranı | `neckFront+152` |

**AÇIK — sıradaki tur:**
- S22 kurdele 4 çizgi gibi duruyor, kapanış yolu hatalı (`replace` ile kurulan yol bozuk)
- S23 kol tekrar kısaldı (dis.y `underarm-52` fazla yukarı)
- S24 yaka dibi köşeleri sivri

## Tur 55-56 — kıyas turu

Görseller: `defter-55.png`, `defter-55-kiyas.png` (fotoğrafla yan yana), `defter-56.png`

**ÖLÇÜM — kıyastan sonra:**
| oran | hedef | tur 55 | fark |
|---|---|---|---|
| açıklık/göğüs | 0.496 | 0.484 | %−2 ✓ |
| açıklık derinliği/gövde | 0.267 | 0.227 | %−15 ✗ |

**TEŞHİS — sayı ile görüntü çelişti:**
Genişlik oranı hedefteydi ama yaka **görsel olarak çok geniş** duruyordu.
Kök: `yakaOmuz.y = 16` → açıklık omuz çizgisine çok yakın başlıyor, **omuz bandını
yiyor**. Oran doğru olsa da açıklığın *nereden başladığı* görüntüyü belirliyor.
→ Bu, "oran testi geçiyor ama flat yanlış" durumunun ikinci örneği.

**BAĞIMLI/BAĞIMSIZ:**
`yakaOmuz.x` ↓ (46.7→31.1) → açıklık dip genişliği de düşerdi
→ telafi: `yakaBicim` dip oranı 1.48 → 2.22 (31.1 × 2.22 = 69.1, genişlik korundu)
**Ders:** `yakaOmuz` ve `yakaBicim` oranları ters yönde birlikte hareket etmeli.

**Kesilen:** yaka başlangıcı içe/yukarı (omuz bandı korundu), derinlik +25mm,
etek ucu sarkması 11→2 (fotoğrafta düz kesim), kol koltukaltının dışına.

**AÇIK:**
- S29 yaka dibi armut/damla oldu (dip kontrol noktaları ölçek değişince yuvarlandı)

## Tur 57-58 — yaka dibi kare oldu

Görsel: `defter-58.png`

**TEŞHİS — üç kademeli:**
1. Tur 57'de dip noktalarını değiştirdim, şekil **değişmedi**. Demek ki sorun
   oranlarda değil.
2. Motoru izledim: yelpaze kuralı devreye girmiyor (dip noktalarının hepsi >0.45),
   `OMUZ_ASMA_SINIRI` 4.05 (kırpma yok). Yani **sayılar motora olduğu gibi geçiyor**.
3. Kök: **Bezier'in doğası.** Dip CF'de (x=0), ilk kontrol 1.55'te → aradaki geçiş
   yumuşak, damla çıkıyor. Kare dip için ilk kontrol CF'ye yakın (0.50) ve
   **y=0'da yatay** olmalı; ikinci kontrol hemen köşede (2.10, y=0).

**Kesim:** `[0.50,0.000],[2.10,0.000],[2.22,0.055]` — yatay dip, keskin köşe.

**Ders (deftere geçsin):** Şekil sorunu üç yerden gelebilir — (a) JSON oranları,
(b) motordaki kurallar (yelpaze/kırpma), (c) Bezier'in kendi geometrisi.
Üçünü sırayla elemeden "sayıyı değiştir, bak" yapmak tur yakıyor.

**AÇIK:**
- yaka fotoğraftakinden hâlâ dar; fotoğrafta omuzlara doğru daha geniş kare
- gölge çok hafif

## Tur 59 — bel yukarı, kol uzadı, yaka üstte daraldı

Görsel: `defter-59.png`

**ÖLÇÜM (fotoğraftan, piksel):**
omuz y=115, etek y=687 → gövde 572 px
En dar yer (bel) y=320 → **bel konumu = %36**
Bizim `waist` landmark'ı: (414.4−62)/568.5 = **%62**
→ **Bel 26 puan aşağıdaydı.** Silüetin en dar yeri yanlış yerdeydi, o yüzden
"kadın gibi değil" görünüyordu: kum saatin beli kalçaya yakın çıkıyordu.

**BAĞIMLI/BAĞIMSIZ:**
`bel.y` ↑ → alt gövde uzar → kalça noktası da yukarı alınmalı (`waist..hip@0.45`)
`yakaOmuz.x` ↓ (31.1→21.2) → dip genişliği düşer → `yakaBicim` dip oranı
2.22→3.10 ile telafi (21.2×3.10 = 65.7mm, genişlik korundu)

**Kesim:** bel `bustLine..waist@0.62`'ye taşındı, kol `underarm-10`'a uzatıldı
(kolun üst yarısını örtüyor), yaka üstü 21.2mm'ye daraltıldı.

**AÇIK:**
- S34 yaka üst kısmı V gibi, fotoğrafta dikey yarık
- S35 gövde tekrar tüpleşti (bel yukarı çıkınca alt kısım düzleşti)
- S36 kol omuzda gövdeyle çakışıyor, dış hat kırık

## Tur 60-61 — bel geri, yaka genişletme denemesi geri alındı

Görsel: `defter-59.png` (tur 59), tur 61 kaydedilmedi (regresyon)

**TEŞHİS — ölçüm ile görüntü ÜÇÜNCÜ kez çeliştil:**
| ölçüm | değer | hedef | görüntü |
|---|---|---|---|
| omuz bandı | 79.1 mm | ~48 mm | yaka DAR görünüyordu |
| bel daralması | %18.0 | %16-18 ✓ | gövde TÜP görünüyordu |

Sayılara güvenip yakayı genişlettim (dip 65.8→96.9mm) → **omuz bandı yendi,
elbise askılı gibi oldu.** Geri alındı.

**KÖK:** Tur 59'da fotoğraf ölçümüne dayanıp beli %36'ya taşımıştım. O ölçüm
**kollarla kirliydi** (y=320'de 106px okundu, kolun kestiği yer). Gerçek bel
göğüs ile kalça ortasındadır — `waist` landmark'ı zaten doğru yerdeydi.
Bel yukarı çıkınca orta gövde düzleşti ve "tüp" hissi doğdu; sayı %18 diyordu
ama nip yanlış yerdeydi.

**DERS (üçüncü kez):** Oran hedefte olması flat'in doğru olduğunu göstermiyor.
Oran *ne kadar* olduğunu söyler, *nerede* olduğunu söylemez. Kirli piksel
ölçümüne dayanıp landmark taşımak, üç turluk regresyon üretti.

## Tur 62-63 — omuz bandı hedefe oturdu, ama açıklık trapez oldu

Görsel: `defter-60.png` (tur 60)

**ÖLÇÜM HATASI BENDEYDİ:** SVG'yi regex ile ölçerken iç içe `<g>` blokları
yüzünden sadece 4 path görüyordum (hepsi kol). Gerçekte 24 path var.
İki tur boyunca eksik veriyle çalıştım.

**Doğru ölçüm:** açıklık x ±80.2, gövde x ±153.8 → omuz bandı **73.6mm**
(fotoğraf hedefi ~48). Ve açıklık **y=6'dan** başlıyordu — omuz çizgisinin
üstünden, o yüzden bandı yiyor görünüyordu.

**Kesim:** `yakaOmuz.y` 6 → 26 (omuz hattının altına), `yakaOmuz.x` 21.2 → 36.8,
dip oranı 3.78 → 2.85. Sonuç: omuz bandı **49.0mm** (hedef 48) ✓

**AMA:** sayı tuttu, görüntü tutmadı — **dördüncü kez.** Açıklık artık geniş bir
trapez; fotoğrafta dar yarık + kare dekolte var.

**BİRİKEN DERS:** Bu koşuda dört kez "oran hedefte, flat yanlış" oldu:
bel nip'i, açıklık genişliği, omuz bandı, şimdi trapez. Oranlar tek başına
şekli tanımlamıyor — **hangi noktanın nerede olduğu** ayrı bir bilgi ve onu
oran testi yakalamıyor.

## Tur 64-66 — KADEME ÇIKTI: motorda köşe noktası

Görsel: `defter-66.png`

**BEŞ TUR JSON OYNATTIM, ŞEKİL DEĞİŞMEDİ.** Kök motordaydı.

**KÖK TEŞHİS (`yakaYolu`, 3n zinciri):**
6 kontrol noktası verildiğinde kod iki kübik kurup sonda ` L m` çekiyordu.
Yani **son kontrol noktası hiç kullanılmıyordu** ve yaka omuza DÜZ çizgiyle
gidiyordu. Kademe (dar yarık → geniş dekolte) bu yüzden çizilemiyordu:
her kübik kendi içinde yumuşak, aralarında kırılma yok.

**KESİM:** Köşe tespiti eklendi — ard arda iki kontrol noktası **aynı y'de**
(fark < gövde yüksekliğinin %6'sı) ve **x farkı büyükse** (> omuz x'inin %40'ı)
orada bir KÖŞE vardır; zincir kesilir, ` L ` ile keskin dönüş yapılır.

Bu, HEDEF md.9'un gereği: sabit "kare yaka / V yaka" menüsü yok, köşe
**geometriden** doğuyor. Aynı mekanizma her yaka biçiminde çalışır.

**Sonuç:** üstte dar dikey yarık, altta geniş kare dekolte, aralarında keskin
köşe — fotoğraftaki yapı.

**AÇIK:**
- açıklık fotoğraftakinden biraz geniş
- gölge sol üstte sert bant halinde

## Tur 67 — gölge tek yönlü oldu

Görsel: `defter-67.png`, `defter-67-kiyas.png`

**KÖK:** `kumasParcasi()` gölgeyi kenarın TAMAMINA eşit kalınlıkta çekiyordu →
giysiyi çevreleyen sert bant. Gerçek flat'te gölge tek yönlüdür.

**KESİM:** linearGradient maskesi (üst %0 → alt %100), ışık sol üstten gelir,
koyuluk sağ ve alt kenarda toplanır.

## Tur 68-74 — açıklık daraldı, gövde doldu; BANT dört tur kovalandı

Görseller: `defter-68.png`, `defter-72.png`

**Kesilenler:**
| sorun | ölçüm | kesim |
|---|---|---|
| açıklık gövdenin %68'i | foto ~%48 | dip oranı 2.85 → 2.01 |
| gövde fazla dar | göğüs 142.7 | 149.4, koltukaltı 129.4, bel 125.6 (%16) |
| gölge sert bant | kenarın tamamına eşit | linearGradient maskesi, tek yönlü |

**BANT — dört tur, çözülmedi:**
Ölçümle takip: bant x[0,29.7] y[26,46] — **doğru yerde**, açıklık x±73.9'un içinde.
Ama görünmüyor. Denenen:
1. Bandı boyun dibine bağla → gövdenin üstünde boş alanda kaldı
2. Açıklığın üst kenarına oturt → yine üstte
3. Genişlet (omuzOran 1.02) → **görünür oldu** ama gövdenin üstünde havada
4. Motorda `K.yakaOmuz`'a bağla, aşağı doğru kalınlık ver → tekrar kayboldu

**Teşhis:** Bant `yakaOmuz`'dan yukarı çıkıyor ve orada gövde YOK — açıklığın
üstü boş alan. Fotoğrafta bant **boynu sarar**, yani croquis'te boyun dibi
halkası ile açıklığın üst köşesi arasında bir şerittir. O bölge şu an
gövdenin dışında kalıyor çünkü `yakaOmuz.y = 26`, `neckBase.y = 0` — arada
26mm var ama gövde konturu oradan geçmiyor.

**Sıradaki turun kökü:** gövde konturu boyun dibinden mi başlamalı, yoksa
bant ayrı bir parça olarak boyun halkasını mı çizmeli? İkisi ayrı karar.

## Tur 75-81 — BANT ÇÖZÜLDÜ, açıklık oranları hedefte

Görseller: `defter-76.png`, `defter-79.png`, `defter-79-kiyas.png`, `defter-81.png`

**BANT — dört turluk kovalamanın kökü:**
Ölçüm: bant y[0,46.9], gövde konturu y=26'dan başlıyor → bandın **üst yarısı
(y 0-26) boşlukta**, orada kumaş yok. Pembe şerit pembe zemin üstünde görünmez.

**KÖK:** gövde konturu `yakaOmuz`'dan (y=26) başlıyordu, boyun dibinden değil.
**KESİM:** gövde artık `neckBase`'ten (y=2) başlıyor; açıklık ayrı bir DELİK
olarak `keyhole` primitifiyle gövdenin üstüne çiziliyor. Bant artık gerçek
kumaşın üzerinde duruyor ve görünüyor.

**KADEME BİÇİMİ motora eklendi** (`bicim: 'kademe'`):
üstte dar dikey yarık → keskin köşe → geniş kare dekolte → düz taban.
Parametreler: `bogazOran` (yarık genişliği), `kademeOran` (köşe yüksekliği),
`koseYaricap` (köşe yumuşatma). Sabit menü değil — üç sayı, sınırsız biçim.

**ÖLÇÜM (tur 81):**
| oran | hedef | şu an |
|---|---|---|
| açıklık derinliği/gövde | 0.267 | **0.267** ✓ |
| açıklık genişliği/göğüs | 0.496 | **0.495** ✓ |

**AÇIK:** yarık kısa (yuvarlak köşe yuttu), gölge hafif, çizgiler ince —
"chic ve comic" değil.

## Tur 82-97 — çizgi ağırlığı, gölge, üst dikiş, pens

Görseller: `defter-82.png`, `defter-83.png`, `defter-87.png`, `defter-89.png`,
`defter-89-kiyas.png`, `defter-91.png`, `defter-94.png`, `defter-97.png`

**ÖLÇÜM — Buğra'nın satılan flat'i (`5 Inspirations.jpg`, LINEN figürü):**
figür genişliği 246 px, dış kontur 3-4 px (%1.42), iç dikiş 2-3 px (iç/dış 0.70)
**Bizde:** figür 259 px, dış kontur 3 px (%1.16), iç dikiş **1 px** (iç/dış 0.33)
→ iç dikişler silik, flat "chic" görünmüyor.

**Kanun düzeltildi:** `disKonturMM` 2.8→3.4, `icDikisMM` 1.4→2.2 (oran 0.65),
`kesikliMM` 1.1→1.7, `kilcalMM` 0.7→1.1

**Gölge:** opacity 0.50/0.40 → 0.72/0.58, koyultma 0.13 → 0.19

**BUĞRA KIYASI (`kiyas-bugra.png`) — onda olan bizde olmayan:**
1. Kesikli **üst dikiş** — yaka, pat, etek ucu, kol ağzı. *(Tur 43'te "flat'te
   dikiş payı olmaz" diye kesiklileri silmiştim. Ayrım: dikiş payı = kalıp
   çizgisi, YOK. Üst dikiş = görünen dikiş izi, VAR.)*
2. **Pens okları** — göğse doğru
3. Kumaş dokusu *(açık)*

**Kesildi:** yaka ve etek ucu üst dikişi eklendi, pens eklendi ve yan dikişe
mıklandı (önce havada bitiyordu, sonra kola taşıyordu).

**MOTOR YASASI eklendi:** `kol.ic` koltukaltının içinde kalmalı — dışarı taşarsa
kol ile gövde arasında beyaz kama açılıyor (ölçüm: ic 136.1 > koltukaltı 133.4).

## Tur 98-106 — hakem ölçümüyle silüet düzeltmesi, bant göründü

Görseller: `defter-98.png`, `defter-99.png`, `defter-104.png`,
`defter-104-kiyas.png`, `defter-106.png`

**KÖR HAKEM ÖLÇÜMÜ (tur 94 üzerinden) — en ağır üç madde:**
| oran | hedef | ölçülen | sapma |
|---|---|---|---|
| gövde boyu/göğüs | 2.235 | 1.667 | **−%25** (tunik, mini değil) |
| etek ucu/göğüs | 1.113 | 0.886 | **−%20** (etek göğüsten DAR, ters silüet) |
| kol boyu/gövde | 0.195 | 0.342 | **+%75** |

**Kesim:** etek ucu `hip-38` → `hip+124` (gövde 529→692mm), etek genişliği
`hip*1.00` → `hip*1.098` (172.3mm), kol `underarm-8` → `underarm-2`.

**Diğer kesimler:**
- kumaş dokusu eklendi (SVG pattern, çapraz dokuma izi) — Buğra'nın flat'i
  keten dokusunu gösteriyor, bizde düz renkti
- açıklık yuvarlatılmış dikdörtgenden **keyhole+kare**ye: `koseYaricap` 0.26→0.07
- **BANT GÖRÜNDÜ.** Kök: bant doğru yerdeydi (x±55, y 0-49) ama gövdeyle aynı
  renkti ve kendi dikişi yoktu. Kesim: (a) motora `altY` eklendi, bant açıklığın
  üst kenarına değiyor; (b) bandın kendi kesikli üst dikişi çizildi — satıcı
  flat'inde her ayrı parçanın kendi dikiş izi var
- bant uçlarındaki **sivri boynuz**: üst kenar y=0'da, alt kenar altY'de,
  omuzda birleşince sivri uç oluşuyordu → `ucDusme` ile üst uç aşağı çekildi
- kol omuz ucunu 28mm aşıyordu → `shoulderTip*1.00`
