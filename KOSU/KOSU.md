# KOŞU — stitchu (12 Eylül 2026)

> ## ⛔ OTURUMUN TEK YETKİSİ (Damla, 12 Eyl — bu satırlar her şeyin üstünde)
>
> Bu dosyadaki **A1-A13 listesi tek listedir.** Yeni düzen, yeni faz, yeni
> numaralama, yeni kapı, yeni ritüel **kurulmaz**. Üç ayrı düzen kuruldu
> (G1-G4, altı iş, A1-A13); her biri bir öncekini geçersiz kıldı ve on gün
> boşa gitti. Sebep fazların sırası değildi, **her oturumun sıfırdan plan
> yapmasıydı.**
>
> Oturumun yapacağı tek şey:
> 1. §1.4 durum tablosundaki **ilk AÇIK maddeyi** al.
> 2. Sadece onu yap. Brief'i yeniden yorumlama.
> 3. Bitince tabloda **KAPANDI** yap, yanına tek satır ölçülmüş sonuç yaz,
>    commit + push.
> 4. **DUR.** Sıradaki maddeye geçme. Faz içinde çıkan soru Damla'ya
>    sorulmaz, tarafsız ajana sorulur.
>
> Takılırsan: madde AÇIK kalır, altına tek satır neye takıldığın yazılır,
> commit atılır. Uydurma çözüm, "yaklaşık çalışıyor", sessiz varsayılan yasak.
>
> Yasak: plan yazmak, koşu düzeni kurmak, sıralama önermek, repo inceleme
> raporu çıkarmak, yeni faz tanımlamak, kapanmamış maddeyi atlamak.

> Otorite: `HEDEF.md` > bu belge. Bu belgede geçen her faz satırının yanında
> **hangi maddeden geldiği** yazılıdır (md.1, md.9 …). Madde numarası yoksa o
> satır bu plana giremez.
>
> **Bu planın kendi kuralı yoktur.** Mühür, yasak listesi, eşik, kapı
> sözleşmesi, ritüel — hiçbiri bu belgede ÜRETİLMEZ. Zaten repoda çalışan
> ölçüm araçları (`kapi.sh`, `goz.mjs`, `altin-kiyas.mjs`) vardır; onlar
> kullanılır, yenisi kurulmaz.

---

## 0. Sıra gerekçesi — neden MVP önce, güzelleştirme sonra?

Damla'nın cümlesi:

> *"bir ajan da flat güzelleştirmesini başa değil sona koysaydı şu anda MVP
> projeyi satıyorduk para kazanıyorduk."*

Bu plan o cümlenin doğrudan uygulamasıdır. Ölçülen durum şunu söylüyor:

**Zincir zaten çalışıyor — ama sadece terminalde.** Bugün (12 Eyl 12:52)
`KOSU/servis.mjs` ile bir fotoğraf yüklenip flat + kalıp üretildi ve dosyalar
diskte duruyor (`KOSU/ciktilar/yerel/31090/`). Aynı anda `stitchu.com`'daki
sitede flat indirme düğmesi **hiçbir zaman çalışmıyor** — çünkü
`web/js/create.js:1327` içindeki `siluetOkumasi()` fonksiyonu gövdesi
`return null;`. Yani:

| | fotoğraf → flat + kalıp |
|---|---|
| terminal (`servis.mjs`) | **ÇALIŞIYOR**, bugün ölçüldü |
| canlı site | **ÇALIŞMIYOR**, her zaman `ERR_OKUMA_YOK` |

Aradaki mesafe bir mimari sorun değil, bir **bağlama** işi. Zincirin
halkalarının hepsi var ve tek tek doğrulandı (§1). Eksik olan, halkaların
kullanıcının göreceği yere takılması.

Bu yüzden sıra şudur:

1. **A1–A3: zinciri kullanıcıya ulaştır** (md.1). Çirkin olsun, ama bir insan
   fotoğraf yükleyip flat + kalıp + rehber indirebilsin. Bu, `CLAUDE.md`'nin
   tek testinin ("bir insanın satın alabileceği bir nesne") ilk kez gerçekten
   sağlandığı andır.
2. **A4–A5: satılabilir hale getir** (md.10, platform maddesi). Paket, rehber,
   üyelik, ödeme. Çirkin flat de satılır; indirilemeyen flat satılmaz.
3. **A6–A8: güzelleştir** (md.4, md.5, md.12). Prenses X çaprazlaması, croquis
   konvansiyonu, Buğra kıyası. Bunlar **ürünü daha iyi** yapar; ürünü **var**
   etmezler. Var etme işi A1–A5'te bitmiştir.
4. **A9–A11: genişlet** (md.2, md.6, md.9). Bölgesel edit, kumaş, primitifler.
   Bunlar yeni yetenek; MVP'nin şartı değil.
5. **A12–A13: çoğalt** (pazarlama, iOS).

**Neden güzelleştirme sonda?** Çünkü bugün elde olan flat zaten satılabilir
ayarda. `KOSU/ciktilar/yerel/31090/flat.png` gözle incelendi: prenses dikişli,
bel kesimli, klos etekli, fisto kenarlı, ön+arka, temiz kontur, sıfır kırmızı.
Etsy'deki bir kalıp satıcısının ilanına konsa yadırganmaz. Bunu %10 daha iyi
yapmak için harcanan hafta, **sıfır satışlı bir hafta**dır.

**Neden repo temizliği (md.13) en sonda değil?** Çünkü o A1'i engellemiyor.
Ama A4'ten (ödeme/deploy) önce yapılmalı: 110 MB `KOSU/ciktilar` + 116 MB
`engine/build` ile deploy edilmez. Bu yüzden A4'ün içine konuldu, ayrı faz
olarak değil — md.13 bir iş değil, bir bakım.

---

## 1. BUGÜNKÜ DURUM — ölçüldü, iddia yok

Aşağıdaki her satır 12 Eyl 2026'da bu repoda **çalıştırılarak** doğrulandı.
Doğrulanmayanlar açıkça `DOĞRULANMADI` yazıyor.

### 1.1 Zincirin halkaları — tek tek çalıştırıldı

| halka | dosya | durum | kanıt |
|---|---|---|---|
| fotoğraf → okuma | `KOSU/siluet-oku.mjs` | **ÇALIŞIYOR** | `claude -p` alt süreci (`/opt/homebrew/bin/claude` var). `ARKA_UCLAR = { 'claude-p': … }`, tek arka uç. 21 önbellek dosyası bu hattan üretilmiş; en yenisi `siluet-bc918577….json`, damgası `"claude-sonnet-5 via 'claude -p' alt sureci (arkaUc=claude-p), 2026-09-12"` |
| okuma → flat SVG | `web/lib/siluet-ciz.js` | **ÇALIŞIYOR** | `node KOSU/siluet-ciz.mjs <okuma> <cikis.svg>` → exit 0, 5 579 baytlık SVG, `"kirmizi":[]` (sıfır ihlal) |
| okuma → kalıp | `KOSU/siluet-kalip.mjs` | **ÇALIŞIYOR** | `node KOSU/siluet-kalip.mjs yerel 31090` → exit 0, `motorExit: 0`, `hedefDusen: []`, `kalipPng: true`, `hemKirpma: null` |
| tarayıcı köprüsü | `KOSU/servis.mjs` | **ÇALIŞIYOR** | localhost:7311 ayakta; `GET /` → 200, `/contract/body-v1.json` → 200, `/lib/siluet-ciz.js` → 200 |
| **canlı site** | `web/js/create.js` | **ÇALIŞMIYOR** | `siluetOkumasi()` gövdesi `return null;` → `flatSVG()` her zaman `ERR_OKUMA_YOK` fırlatır |

### 1.2 En önemli tek bulgu

`web/js/create.js:1327`:

```js
function siluetOkumasi() {
  return null;
}
```

Üstündeki 25 satırlık yorum bunun **bilerek** yapıldığını söylüyor: sitedeki
fotoğraf yolu (`analyze.js` → `vision-bridge.js`) spec ekseni üretir ("elbise",
"düz kol"), giysinin yakasının/koltukaltının/etek ucunun **nerede** olduğunu
değil. Kelimeden silüet uydurmak yerine adıyla reddediyor — dürüst davranış.

Ama sonuç şu: **sitede flat indirme düğmesi hiç çalışmadı, çalışmıyor.**
Terminalde çalışan zincir siteye bağlı değil. A1'in tek işi budur.

### 1.3 Ölçülen çıktı — `KOSU/ciktilar/yerel/31090/`

`servis.mjs` üzerinden bugün 12:52–12:56 arasında üretildi:

```
girdi.png       2.5 MB   yüklenen fotoğraf
siluet.json     4 350 B  okuma (claude -p)
flat.svg        5 579 B  flat, sıfır kırmızı
flat.png       55 569 B
graf.json      50 291 B  motor grafı
ops.json        4 798 B  9 op
hedefler.json     315 B  2 hedef (bel/göğüs 0.8455, kalça/göğüs 1.3526)
kalip-36.svg   11 951 B
kalip-36.png   37 306 B
kaynak-yolu.txt   503 B  kaynak zinciri yazılı
```

`flat.png` gözle incelendi: ince askılı, prenses dikişli, bel hattında enine
kesimli, klos etekli, etek ucu fisto kenarlı, arka fermuarlı uzun elbise.
Ön ve arka yan yana. Kontur temiz, kolevi hilali görünüyor, pensler dik.
**Bu çıktı, olduğu gibi satılabilir ayarda.**

### 1.4 A1–A12 defteri (`KOSU/1209-kosu.md` §1) ne diyor

| faz | konu | durum (o belgeye göre) |
|---|---|---|
| A1 | geçit altyapısı | KAPANDI |
| A2 | ilk uçtan uca | KAPANDI — 5/5 sıfır kırmızı çiziliyor |
| A3 | fotoğraf okunsun | **AÇIK — 2/5** (kapı 4/5 ister; kalan sebep `pens`) |
| A4 | çizim güzelleşsin | AÇIK — kolevi ✓, etek kavisi ✓; kalan: prenses X çaprazlaması |
| A5 | düzeltme (edit) | açılmadı |
| A6 | her giysi | açılmadı |
| A7 | kumaş ve rehber | açılmadı |
| A8 | Buğra | açılmadı (son ölçüm 4 Eyl: Top Back +394 mm / %31; croquis 12 Eyl'de değişti → **yeniden ölçülmeli**) |
| A9 | paket ve prova | açılmadı (`paket-02`'de 8 PDF var, Damla hiç dikmedi) |
| A10 | deploy ve landing | açılmadı — **G2 dört kapıyı kırmızıya düşürdü** (`vitrin_gercek`, `indir`, `uctan_uca`, `manken_insan_ayrim`) |
| A11 | tur | açılmadı |
| A12 | tavan denemesi | açılmadı |

**Bu plandaki en büyük yeniden sıralama budur.** Eski defter A3'ü (okuma
2/5→4/5) A5+'ın önüne koymuş, A10'u (deploy) en sona atmış. Damla'nın cümlesi
tam tersini söylüyor: A10 **önce**. Okuma 2/5 iken bile 5/5 flat sıfır
kırmızıyla çiziliyor (A2 kanıtı) ve bugünkü çıktı satılabilir. A3'ün 2/5'i
"flat çıkmıyor" demek değil; "flat altın kopyaya %5 yerine %10 uzak" demek.
Bu bir **güzelleştirme** ölçüsüdür → sona.

### 1.5 `engine/vocab.json` — md.9 açık mı kapalı mı?

**37 alan, 132 değer.** Ölçüldü:

```
garment 3 · shaping 2 · waistline 2 · fabric 2 · neckline 9 · sleeveStyle 3
sleeveLength 3 · skirtStyle 6 · skirtLength 3 · topLength 3 · tieClosure 9
sleeveCap 4 · collarType 7 · collarEdge 3 · gatherType 4 · gatherZone 4
backOpening 5 · laceUpBack 2 · wrapFront 2 · backSlit 3 · ruffledStraps 4
peplum 4 · hemFlounce 2 · placketStyle 3 · edgeFinish 2 · pocketStyle 4
cuffStyle 3 · hemShape 5 · shoulderStyle 3 · buttonRow 3 · exposedZip 3
backDetail 4 · bardotStyle 3 · cupSeam 3 • locketTop 2 · yoke 3 · boxPleat 2
```

`neckline: ["crew","scoop","vNeck","square","boat","sweetheart","halter",
"cowl","pussyBow"]` — md.9'un adıyla yasakladığı şeyin ta kendisi
(*"heartneck"* → `sweetheart`, *"puff sleeve"* → `sleeveCap: puffed`).

**Ama bu sözlük ÜRÜN HATTINDA DEĞİL.** Ölçülen ayrım:

- **Flat hattı sözlüksüz.** `web/lib/siluet-ciz.js` bir *okuma* alır; okuma
  noktaları croquis36 landmark'larına **orana** verir (`"bel": ["waist*1.06",
  "waist"]`). Ortada `neckline: "square"` gibi bir menü seçimi yok — yakanın
  **nerede** olduğu var. Bu, md.9'un istediği Edge/Panel/Stitch mantığıdır.
- **Sözlük eski spec hattında yaşıyor** (`engine/src/*.hpp` enum'ları,
  `web/js/vision-bridge.js`). O hat siteyi besliyor ve zaten `ERR_OKUMA_YOK`
  ile reddediliyor (§1.2).

→ **md.9 kısmen kapalı:** yeni hat (siluet) açık, eski hat (vocab) hâlâ duruyor
ama ürüne bağlı değil. A3'te eski hat sökülünce md.9 tam kapanır.

### 1.6 `KOSU/ciktilar/paket-02/` içinde ne var?

3 Eyl 12:51–12:55 üretilmiş, **21 dosya**:

| dosya | boyut |
|---|---|
| `kalip-A4.pdf` (seçilen beden) | 94 709 B |
| `kalip-A4-EU34/36/38/40/42/44.pdf` (beden serisi) | 90–102 KB × 6 |
| `kalip-A0.pdf` (matbaa, tek sayfa) | 10 016 B |
| `flat.svg` / `flat-onizleme.png` | 26 843 B / 52 991 B |
| `rehber.html` + `rehber-onizleme.png` | 14 210 B / 628 474 B |
| `rehber-{viscose-crepe, cotton-modal-jersey, viscose-challis, cotton-lawn, cotton-velveteen}.html` | 5 kumaş × ~12.7 KB |
| `kesim-plani.md` | 531 B |
| `beden-serisi.json` | 1 192 B |
| `README.md` | 3 026 B |

İçerik: *a-line dress, short straight sleeve, EU38, pamuklu lawn %100 pamuk
(87 gsm), dikiş payı 15 mm, 6 parça, 2 m @ 140 cm.*

**Kritik uyarı — bu paket md.14 kapsamındadır.** `paket-02`, silüet okuma hattı
kurulmadan (3 Eyl), eski motor/spec hattından üretildi. `yerel/31090`'ın
`kaynak-yolu.txt`'sindeki zincirle **hiçbir ilgisi yok**. Damla "eski onaysız
çıktılar silinsin" dedi (md.14) ve "hiç dikmedi" (A9 satırı).

→ `paket-02` **ürün değil, ŞABLON**dur. Değerli olan tek şey, bir paketin
hangi dosyalardan oluşacağını göstermesi. A3 aynı 21 dosyayı **yeni zincirden**
üretecek; `paket-02`'nin kendisi A4'te silinecek.

### 1.7 Repo durumu (md.13)

| ölçü | değer |
|---|---|
| kök dizinde dosya/klasör | 25 |
| `KOSU/` içinde dosya | 47 |
| `KOSU/ciktilar/` | **110 MB** |
| `engine/build/` | **116 MB** |
| `git status --porcelain` | 8 satır |
| `KOSU/0509-kapi.log` | 1 215 443 B (1.2 MB tek log dosyası) |
| `0509-kosu.md` (kökte) | 91 524 B |
| `KOSU/0509-kosu.js` | 103 651 B |

Kökte üç ayrı koşu belgesi var: `0509-kosu.md` (91 KB), `KOSU/1209-kosu.md`
(35 KB), `KOSU/1209-devir.md`, `KOSU/0911-kapanis.md`, `KOSU/0509-devir-notu.md`,
`KOSU/0509-ilerleme.md`. Bu plan onların yerine geçer; A4'te birleştirilir.

### 1.8 Para kısıtı — ölçüldü

- `.env.local` var ama **A1–A13 boyunca hiçbir faz API anahtarı okumaz.**
- Tek arka uç: `claude -p` alt süreci (`KOSU/siluet-oku.mjs` `ARKA_UCLAR`).
- Bir okuma **5–8 dakika** sürer (`ZAMAN_TAVANI_MS = 8 dk`). Tam çevrim 30–40 dk.
- Okumalar `KOSU/onbellek/` içinde sha256 ile önbelleklenir → aynı fotoğraf
  iki kez ücret/süre harcamaz. 21 okuma zaten hazır.

**Plana etkisi:** `siluet-oku.mjs` içindeki `ARKA_UCLAR` tablosu tek değişim
noktasıdır. Para gelince oraya `'api'` arka ucu eklenir, üstündeki hiçbir
dosya değişmez. A2 bu tabloyu **korur**, genişletmez.

### 1.9 DOĞRULANMADI / göremediklerim

Damla'nın bilmesi gereken, bu turda **ölçemediğim** şeyler:

- **A3'ün bugünkü sayısı bilinmiyor.** `1209-kosu.md` §2.8 açıkça yazıyor:
  *"G1 SAYISI ÖLÇÜLMEDİ … '≥4/5 oldu' İDDİASI YOK."* N3'ün düzeltmeleri
  (taban seçim kuralı, askı oranı, prompt kalibrasyonu) **ölçülmedi**. 2/5
  rakamı N3 **öncesine** ait olabilir. Gerçek sayı 2/5 ile 5/5 arasında,
  bilinmiyor.
- **Okuyucu varyansı ölçülmedi.** Üç koşu ortancası uygulanmadı; aynı
  fotoğraf farklı koşularda farklı sonuç verebilir.
- **`servis.mjs` üzerinden uçtan uca YENİ bir fotoğraf denemedim.** Var olan
  önbellekli çıktıyı doğruladım; taze bir yükleme 5–8 dk sürerdi.
- **`kapi.sh` koşturulmadı** (10 578 B script). Hangi kapıların bugün yeşil
  olduğunu bilmiyorum; `1209-kosu.md` G2'nin dört kapıyı kırmızıya düşürdüğünü
  yazıyor ama o 11 Eyl ölçümü.
- **Buğra kıyası (md.12) 4 Eyl'den beri ölçülmedi** ve croquis 12 Eyl'de
  değişti (`shoulderTip.x` 188.8 → 122.5 mm). Eski +394 mm / %31 sayısı
  **geçersiz sayılmalı**.
- **`goz.mjs` ve `altin-kiyas.mjs` koşturulmadı.** Okudum, çalıştırmadım.
- **Deploy durumu bilinmiyor.** `.vercel/` var, `web/vercel.json` var; canlı
  sitede bugün ne yayında, doğrulamadım.
- Konu dışı ama önemli: `engine/golden-reference.csv` **2.5 MB salt-okunur**
  bir dosya ve `engine/CMakeLists.txt` **102 KB** — normal bir CMake dosyası
  1–3 KB olur. Bu ikisi repo temizliğinde bakılacak yerler.

---

## 2. FAZ LİSTESİ

Sıra bağlayıcı. Her faz **taze ajan**; işi bitince ölür. Her fazın çıktısını
**tarafsız hakem ajanı** denetler (§3). Alt ajan doğurma yasak. Branch yok,
`main`'de çalışılır. Damla'ya soru sorulmaz.

### ▸ BÖLÜM A — MVP: zincir kullanıcıya ulaşsın

---

#### A1 — Site fotoğrafı gerçekten okusun

**Madde:** md.1 (fotoğraf+prompt = kalıp+flat) · md.11 (kök neden mimaride olabilir)

**Ne yapılacak.** `web/js/create.js:1327`'deki `siluetOkumasi()` gerçek bir
okuma döndürsün. Zincir zaten var (§1.1); yapılacak iş onu tarayıcıya bağlamak:

1. `create.js` fotoğrafı `servis.mjs`'in `POST /oku` ucuna gönderir.
2. `GET /durum?is=<id>` ile ilerlemeyi yoklar (okuma 5–8 dk sürer → ekranda
   gerçek bir ilerleme göstergesi olmalı, donmuş sayfa değil).
3. Dönen okuma `siluetOkumasi()`'nin çıktısı olur; `flatSVG()` artık
   `ERR_OKUMA_YOK` fırlatmaz.
4. `servis.mjs` ayakta değilse ekranda **adıyla** söylenir (sessiz default yok).

**Dokunulmayacak:** `web/lib/siluet-ciz.js` (geometri), `KOSU/siluet-oku.mjs`
(okuyucu), `contract/*.json`. Bu faz **bağlama** fazıdır, geometri fazı değil.

**Bitince NE GÖRÜLECEK.**
`http://localhost:7311` — Damla tarayıcıda bir fotoğraf yükler, ilerleme
çubuğu döner, ekranda flat çizimi belirir. Ekran görüntüsü + üretilen
`KOSU/ciktilar/yerel/<no>/flat.svg` dosyası.

**Hakem ne soracak:** *Bir insan bu ekranda fotoğraf yükleyip flat gördü mü?
Bu oldu mu bitti mi? Satılsa alır mıydım?*

---

#### A2 — İndirme düğmesi: flat + kalıp + rehber

**Madde:** md.1 · md.10 (sadece kalıp+flat verilip geçilmeyecek: rehber, püf noktaları)

**Ne yapılacak.** A1'in ürettiği okumadan **indirilebilir dosyalar** çıksın:

1. `flat.svg` + `flat.pdf` — teknik çizim (ön + arka).
2. `kalip-A4.pdf` — 1:1 kalıp, A4 sayfalarda, 100 mm kalibrasyon karesiyle.
3. `kalip-A0.pdf` — tek sayfa matbaa.
4. `rehber.html` — dikiş rehberi: dikiş payı, kesim planı, iğne tipi,
   püf noktaları (md.10'un saydığı üç şey).
5. `kesim-plani.md`.

`paket-02`'nin dosya listesi **şablon olarak** kullanılır (§1.6) — içeriği
değil, **hangi dosyaların olacağı** oradan alınır. Üretim `yerel/31090`
zincirinden yapılır. `web/lib/pdf-core.js` (27 865 B) ve `web/lib/rehber-tr.js`
(27 903 B) zaten var; yeniden yazılmaz, bağlanır.

**Beden serisi bu fazda YOK.** Tek beden (EU36) yeter — md.4 flat'in 36'sı ile
kalıbın 36'sını ayırıyor, seri değil. Seri A5'te.

**Bitince NE GÖRÜLECEK.**
Damla indirme düğmesine basar, `stitchu-<tarih>.zip` iner, açar; içinde
yukarıdaki 5 dosya. PDF'i açıp kalibrasyon karesini cetvelle ölçer → 100 mm.

**Hakem ne soracak:** *Bu zip'i indiren biri elinde dikilebilir bir şey mi
tutuyor, yoksa bir sürü dosya mı? Satılsa alır mıydım?*

---

#### A3 — Arka uydurma dürüstlüğü + eski hattı sök

**Madde:** edge case (sadece ön varsa arkayı UYDUR ama uydurduğunu SÖYLE) ·
md.9 (sabit sözlük yok) · md.14 (eski onaysız çıktılar silinsin)

**Ne yapılacak.** İki iş, ikisi de dürüstlükle ilgili:

1. **Arka uydurma ilanı.** `yerel/31090/kaynak-yolu.txt` şu anda
   `arka.koken turetildi` yazıyor — ama bu **dosyada**, kullanıcının gördüğü
   yerde değil. Uydurulan arka, ekranda ve rehberde açıkça söylenecek:
   *"Arka fotoğraf yoktu. En sade dikilebilir arka türetildi: [ne yapıldı].
   Sebebi: [neden]."* Kafadan dekolte uydurulmaz.
2. **Eski spec hattını sök.** `web/js/vision-bridge.js` + `analyze.js` spec
   ekseni üretiyor ve ürüne bağlı değil (§1.5). Sökülür. `engine/vocab.json`
   ve ona bağlı enum'lar ürün hattından çıkarılır. Bu, md.9'u kapatan iştir:
   sabit menü artık **repoda da** yok.

**Dikkat:** `vocab.json` motorun (`engine/src/*.hpp`) derleme bağımlılığı
olabilir. Sökme ≠ silme; önce ürün hattından koparılır, motor derlenmeye
devam ediyorsa öyle bırakılır ve durum yazılır.

**Bitince NE GÖRÜLECEK.**
Sadece ön fotoğraf yüklenir; ekranda arka çizimin yanında uydurma ilanı
görünür. `grep -rn "vocab\|neckline" web/js/` çıktısı ürün hattında boş.

**Hakem ne soracak:** *Kullanıcı arka çizimin uydurma olduğunu gördü mü?
Ürün bir yerde hâlâ sabit menüden mi seçiyor?*

---

### ▸ BÖLÜM B — SATILABİLİR

---

#### A4 — Deploy + repo temizliği

**Madde:** md.13 (repo düzenlenecek, gereksiz silinecek) · md.14 (eski çıktılar silinsin)

**Ne yapılacak.**

1. **`servis.mjs` yerine sunucu ucu.** Canlı sitede `claude -p` koşamaz.
   `ARKA_UCLAR` tablosuna sunucu tarafı bir uç eklenir (§1.8) — ama
   **bugün para yok**, o yüzden canlı site "yerel köprüyü çalıştır" talimatı
   verir ya da kuyruk kurulur. Bu fazın kararı ölçümle verilir, şimdiden
   uydurulmaz.
2. **Repo temizliği** (ölçülen sayılar §1.7):
   - `KOSU/ciktilar/` 110 MB → gitignore + eski setler silinir (md.14).
   - `engine/build/` 116 MB → gitignore.
   - `KOSU/0509-kapi.log` 1.2 MB → silinir.
   - Koşu belgeleri (`0509-kosu.md` 91 KB, `1209-kosu.md`, `1209-devir.md`,
     `0911-kapanis.md`, `0509-devir-notu.md`, `0509-ilerleme.md`) → ölçüm
     tabloları bu dosyaya taşınır, gerisi arşive.
   - `paket-02` silinir (§1.6 — şablonu A2'ye geçti).
   - `engine/CMakeLists.txt` 102 KB ve `golden-reference.csv` 2.5 MB
     incelenir (§1.9).
3. G2'nin kırmızıya düşürdüğü dört kapı (`vitrin_gercek`, `indir`,
   `uctan_uca`, `manken_insan_ayrim`) A1–A3'ten sonra yeniden koşturulur.

**Bitince NE GÖRÜLECEK.**
Canlı URL'de fotoğraf → flat + kalıp. `du -sh .git` ve kök dosya sayısı
önce/sonra tablosu. `git status` temiz.

**Hakem ne soracak:** *Damla'nın arkadaşı linke tıklayıp bir kalıp indirebilir
mi? Repo bir başkasının açıp anlayabileceği halde mi?*

---

#### A5 — Platform: üyelik, kredi, gardırop, ödeme

**Madde:** md.10 (ileride üyelik, forum) · platform maddesi (üyelik, 2 ücretsiz
hak, kredi/abonelik, gardırop, ödeme, agresif SEO)

**Ne yapılacak.**

1. **Üyelik** — e-posta ile giriş.
2. **2 ücretsiz hak** — yeni üye iki flat+kalıp üretir, sonra kredi ister.
3. **Kredi / abonelik** — kredi bakiyesi, tükenince ödeme ekranı.
4. **Gardırop** — kullanıcının ürettiği paketler hesabında durur, yeniden
   indirilir. (`web/closet.html` var, 3 321 B — bağlanacak iskelet.)
5. **Ödeme** — sağlayıcı seçilir, bir satın alma uçtan uca çalışır.
6. **Beden serisi** — A2'de tek bedendi; burada EU34–44 açılır
   (`paket-02/beden-serisi.json` şablonu).
7. **Agresif SEO** — `sitemap.xml`, `robots.txt` var; giysi tipi başına
   sayfa üretimi.

**Bitince NE GÖRÜLECEK.**
Damla kendi kartıyla kendi sitesinden bir paket satın alır ve iner.
Ekran görüntüsü + banka bildirimi.

**Hakem ne soracak:** *Bir yabancı üye olup para verip paket indirebilir mi?
Bu bir ürün mü, bir demo mu?*

---

### ▸ BÖLÜM C — GÜZELLEŞTİRME (ürün satıldıktan sonra)

> Buradan sonrası **ürünü daha iyi** yapar. Hiçbiri ürünün var olma şartı
> değil. A5 bitmeden bu bölüme geçilmez.

---

#### A6 — Okuma doğruluğu (eski A3) + prenses X çaprazlaması (eski A4)

**Madde:** md.11 (kök neden her yerde olabilir) · md.5 (flat konvansiyonu)

**Ne yapılacak.**

1. **Önce ÖLÇ, sonra düzelt.** §1.9'a göre A3'ün bugünkü sayısı bilinmiyor.
   İlk iş: N3 sonrası 5 fotoğrafta okuma koşturup gerçek skoru yazmak.
   Üç koşu + ortanca (varyans bugüne kadar hiç ölçülmedi).
2. **Prenses X çaprazlaması** (`1209-kosu.md` §2.8'de ölçüldü): okuyucu
   prenses dikişinin üst ucunu `['neckFront*0', ...]` yani ön ortaya
   bağlıyor, `ayna:true` ile iki kopya merkezden çıkıp X yapıyor. Altın
   kopya omuzdan başlatıyor ve `bustApex`'ten geçiriyor. Düzeltme prompt'ta.
3. **`pens` kaçışı** — A3'ün kalan tek sebebi olarak yazılmış.

**Bitince NE GÖRÜLECEK.**
5 fotoğrafın flat'leri yan yana, önce/sonra. Ölçülmüş skor tablosu
(koşu koşu, yayılım dahil).

**Hakem ne soracak:** *Çizimler önceki turdan gözle daha mı iyi? Bir skor
tablosu değil, ÇİZİMLER gösterildi mi?*

---

#### A7 — Croquis konvansiyonu: hepsi aynı insana çizilmiş gibi

**Madde:** md.5 · md.4 (flat 36 = croquis, kalıp 36 = dikilebilir)

**Ne yapılacak.** `1209-kosu.md` §5'in araştırma bulgusu: *flat croquis'ten
değil POM'dan çizilir, 1:8 ölçekte* ve *croquis oran sayıları blog seviyesi,
contract'a sayı olarak YAZILMAZ*. 12 Eyl'de `shoulderTip.x` 188.8 → 122.5 mm
değişti ve ölçümle (0.918, iki bağımsız kaynak 0.0008 içinde) yapıldı —
doğru yöntem buydu. Kalan croquis oranları aynı yöntemle denetlenir:
ölçülmüş mü, konmuş mu?

**Bitince NE GÖRÜLECEK.**
5 farklı giysinin flat'i üst üste bindirilmiş: göğüs/bel/kalça hatları
çakışıyor mu? Tek görsel, tek soru.

**Hakem ne soracak:** *Bu beş flat aynı insana çizilmiş gibi duruyor mu?*

---

#### A8 — Buğra kıyası (eski A8)

**Madde:** md.12 (Buğra'nın kalıbına yaklaşıyor mu — kör kontrol, ayar hedefi değil)

**Ne yapılacak.** Son ölçüm 4 Eyl (Top Back +394 mm / %31) ve croquis 12 Eyl'de
değişti → **o sayı geçersiz** (§1.9). Yeniden ölçülür.
`patterns_real/geometry/geometry-full.json` var.

**md.12'nin kendi cümlesi bağlayıcı: "kör kontrol; ayar hedefi değil."**
Sonuç kötü çıkarsa kalıp Buğra'ya doğru **ayarlanmaz**; sapma raporlanır.

**Bitince NE GÖRÜLECEK.**
Bizim kalıp ile Buğra'nın kalıbı üst üste, parça parça, mm cinsinden fark
tablosu.

**Hakem ne soracak:** *Fark küçüldü mü, ve kimse sayıyı tutturmak için
kalıbı eğip bükmedi mi?*

---

### ▸ BÖLÜM D — GENİŞLETME

---

#### A9 — Bölgesel edit (eski A5)

**Madde:** md.2 (Midjourney tarzı bölgesel edit — anchor+ratio, JSON spec)

**Ne yapılacak.** "Şuraya fiyonk ekle", "uzat", "yakayı değiştir". Altyapı
kısmen var: `docs/GRAF-IR.md`'de 15 op + replay, doğal dil yok.
Doğal dil → op çevirisi `claude -p` ile yapılır (para yok).

**Kritik şart: yerellik.** Bir op uygulanınca **sadece hedef bölge** değişir.
Yakayı değiştirince etek ucu oynuyorsa olmamıştır.

**Bitince NE GÖRÜLECEK.**
Aynı elbisenin dört hali yan yana: temel, +fiyonk, +uzatılmış, +değişmiş yaka.
Diff görseli: hangi pikseller değişti?

**Hakem ne soracak:** *"Fiyonk ekle" dedim, fiyonk eklendi mi ve BAŞKA bir şey
bozuldu mu?*

---

#### A10 — Kumaş ve parça bölme (eski A7)

**Madde:** md.6 (kumaş davranışı, parça bölme, aynı elbise iki kumaş iki kalıp,
negatif pay) · md.7 (en az parça, gereksiz bölme yok)

**Ne yapılacak.** `1209-kosu.md` §4'te **önceden ölçülmüş tuzak** var ve
bağlayıcıdır:

> Negatif payda formül ile sektör tablosu çelişiyor. Formül %75 streç için
> **%43**, sektör tablosu **%5**. **Motor TABLOYU alacak, formülü DEĞİL.**

| kumaş | streç | kalıp indirimi |
|---|---|---|
| stable knit | %18–25 | %0 |
| moderate | %26–50 | %2 |
| stretchy | %50–75 | %3 |
| super-stretchy | %75–100 | %5 |

Ayrıca: negatif pay **anizotropik** (yatay %8–12, dikey %0); örme bloklar
**dartless** (göğüs pensi kol evine rotate, kol evi +1/2" yükselir).

md.7 için §5'in bulgusu: *dart = ayrıklaştırılmış Gaussian curvature*; parça
sayısı estetik karar değil geometrik zorunluluk. Pens AÇI olarak saklanır:
`sin(θ/2) = (genişlik/2) / uzunluk`.

**Bitince NE GÖRÜLECEK.**
Aynı elbise, iki kumaş, İKİ FARKLI kalıp. Yan yana, fark mm cinsinden işaretli.

**Hakem ne soracak:** *İki kalıp gerçekten farklı mı, yoksa aynı kalıbın iki
kopyası mı? Parça sayısı gereksiz mi büyümüş?*

---

#### A11 — Her giysi (eski A6)

**Madde:** md.9 (sınırsız kalıp ve flat) · md.1

**Ne yapılacak.** Elbise dışı: etek, üst, pantolon, ceket. `GIRDI/` altında
zaten 20 hedef fotoğraf var (Dior HC FW26 bluz/etek/pantolon/elbise/gömlek,
11 Etsy ilanı, V&A arşivi: Ossie Clark, Mary Quant, Biba).

**Bitince NE GÖRÜLECEK.**
Dört farklı giysi tipi, dördünün flat + kalıbı. Tek sayfada.

**Hakem ne soracak:** *Dördü de satılır mı, yoksa elbise iyi gerisi bozuk mu?*

---

### ▸ BÖLÜM E — ÇOĞALT

---

#### A12 — Pazarlama

**Madde:** pazarlama maddesi (Instagram/LinkedIn, iki iş modeli: flat satışı +
giysi satışı)

**Not — ölçülmüş bulgu** (`1209-kosu.md` §5.1): *Ticari boşluk kalıpta değil
FLAT'te.* CLO3D 3D'den vektör flat üretmiyor, sadece render veriyor; sektörde
flat hâlâ POM'dan ELLE çiziliyor. Kalıp tarafı akademide kalabalık
(GarmentCode, Sewformer, NGL, GarmageNet).

→ Damla'nın iki iş modelinden **flat satışı** wrapper testini geçen taraftır.
Pazarlama dili buradan kurulur.

**Bitince NE GÖRÜLECEK.** Yayınlanmış gönderiler + gelen ziyaretçi sayısı.

**Hakem ne soracak:** *Bu gönderiyi gören bir moda öğrencisi siteye girer mi?*

---

#### A13 — iOS uygulaması

**Madde:** md.10 (ileride iOS) · iOS maddesi (Swift, aynı arkaplan/fontlar)

**Ne yapılacak.** Swift. Siteyle aynı arkaplan ve fontlar. `App/` klasörü var.

**Bitince NE GÖRÜLECEK.** Simülatörde fotoğraf → flat. Ekran kaydı.

**Hakem ne soracak:** *Bu uygulama siteyle aynı ürün gibi mi duruyor?*

---

## 3. HAKEM — nasıl çalışır?

Her fazın sonunda **tarafsız hakem ajanı** koşar. İşi yapan ajan kendini
övemez; hakem işi yapanın raporunu değil, **çıktının kendisini** görür.

**Hakemin sorusu "kapı yeşil mi" DEĞİLDİR.** Hakem şunu sorar:

> **Bu oldu mu bitti mi? Satılsa alır mıydım? Ürün olarak güçlü mü?**

- Hakem **"almazdım" dediği sürece** faz kapanmaz: düzelt, tekrar sor.
- Hakem sayı değil **çıktı** görür: SVG/PNG/PDF/ekran görüntüsü. Skor tablosu,
  kapı raporu, test çıktısı **geçer not değildir**.
- Hakemin hükmü gerekçeli olur: *ne* kötü, *nerede*, *ne kadar*.
- Hakem faz brief'ini görür; böylece "istenen şey mi yapıldı" da denetlenir.

**Fazlar arası compounding error kontrolü.** Her fazın hakemi, kendi fazından
önce tek soru daha sorar:

> **Hedeften şaştık mı?** Bu faz `HEDEF.md` §0'daki tek cümleye
> (*fotoğraf/prompt → dikilebilir kalıp + satılır flat*) yaklaştırdı mı,
> yoksa yan bir şeye mi saptı?

Şaşma varsa faz kapanmaz.

**Orkestrasyon kuralları** (Damla'nın kendi listesi):
- Her faz TAZE ajan, işi bitince ölür.
- Alt ajan doğurma **yasak** (4 Eyl'de 69 alt-ajanlık kaçak yaşandı).
- Damla'ya soru sorulmaz; Damla router değil.
- Branch yok, `main`'de çalışılır.

---

## 4. AJAN BRIEF'LERİ — kopyala/yapıştır

> Her brief'in başına şu ortak blok girer:
>
> ```
> Repo: /Users/damummyphus/damla_projects_2026/stitchu
> Otorite: HEDEF.md > KOSU/KOSU.md. Çelişkide HEDEF.md kazanır.
> Main'de çalış, branch açma. Alt ajan doğurma. Damla'ya soru sorma.
> API anahtarı YOK, API parası YOK. Tek arka uç: `claude -p` alt süreci
> (KOSU/siluet-oku.mjs ARKA_UCLAR tablosu). Ücretli servis planlama.
> İş bitince: bir adım = bir commit, küçük harf İngilizce mesaj, co-author yok.
> İddia etme, kanıtla: her "çalışıyor" bir çalıştırma çıktısıyla gelir.
> ```

---

### A1 brief

```
GÖREV: stitchu sitesinde fotoğraf yüklemesi gerçekten flat üretsin.

DURUM (ölçüldü, 12 Eyl):
- Zincir terminalde ÇALIŞIYOR. `node KOSU/servis.mjs` → localhost:7311;
  fotoğraf yüklenince claude -p okur, flat.svg + kalip-36.svg üretir.
  Kanıt: KOSU/ciktilar/yerel/31090/ (bugün üretildi, 9 dosya).
- Sitede ÇALIŞMIYOR. web/js/create.js:1327 `siluetOkumasi()` gövdesi
  `return null;` → flatSVG() her zaman ERR_OKUMA_YOK fırlatır.

YAP:
1. create.js fotoğrafı servis.mjs'in POST /oku ucuna göndersin.
2. GET /durum?is=<id> ile yoklasın. Okuma 5-8 DAKİKA sürer — ekranda
   gerçek ilerleme göstergesi olsun, donmuş sayfa değil.
3. Dönen okumayı siluetOkumasi() döndürsün.
4. servis.mjs ayakta değilse ekranda ADIYLA söylensin. Sessiz default YASAK.

DOKUNMA: web/lib/siluet-ciz.js, KOSU/siluet-oku.mjs, contract/*.json.
Bu bir BAĞLAMA fazı; geometriye girme.

BİTİNCE GÖSTER: tarayıcı ekran görüntüsü (yüklenen fotoğraf + çıkan flat)
ve üretilen SVG dosyasının yolu.
```

---

### A2 brief

```
GÖREV: indirme düğmesi flat + kalıp + rehber versin.

DURUM: A1 bitti, ekranda flat var. İndirilecek dosya yok.
KOSU/ciktilar/paket-02/ bir ŞABLONDUR (3 Eyl, ESKİ hattan üretildi,
içeriği kullanılmaz) — ondan alınacak tek şey DOSYA LİSTESİ.
web/lib/pdf-core.js ve web/lib/rehber-tr.js zaten var; yeniden yazma, bağla.

YAP: A1'in okumasından şu dosyalar üretilsin ve tek zip inisin:
  flat.svg + flat.pdf        teknik çizim, ön + arka
  kalip-A4.pdf               1:1, A4, 100mm kalibrasyon karesiyle
  kalip-A0.pdf               tek sayfa matbaa
  rehber.html                dikiş payı, kesim planı, iğne tipi, püf noktaları
  kesim-plani.md

TEK BEDEN (EU36). Beden serisi bu fazda YOK.

BİTİNCE GÖSTER: inen zip'in içeriği + kalip-A4.pdf'in kalibrasyon karesi
ölçülmüş hali (100 mm mi?).
```

---

### A3 brief

```
GÖREV: arka uydurma dürüstlüğü + eski sabit-sözlük hattını sök.

İŞ 1 — ARKA UYDURMA İLANI (HEDEF.md edge case):
Bugün KOSU/ciktilar/yerel/31090/kaynak-yolu.txt "arka.koken turetildi" yazıyor
ama bu DOSYADA; kullanıcı görmüyor. Sadece ön fotoğraf varken ekranda ve
rehberde açıkça yazsın: "Arka fotoğraf yoktu. En sade dikilebilir arka
türetildi: [ne]. Sebebi: [neden]." Kafadan dekolte uydurma.

İŞ 2 — ESKİ HATTI SÖK (HEDEF.md md.9):
engine/vocab.json'da 37 alan / 132 değer var; neckline listesi tam olarak
md.9'un yasakladığı şey ("sweetheart", "puff sleeve"→sleeveCap:puffed).
O sözlük ÜRÜN HATTINDA DEĞİL — web/js/vision-bridge.js + analyze.js spec
ekseni üretiyor ve zaten ERR_OKUMA_YOK ile reddediliyor.
Ürün hattından kopar. DİKKAT: vocab.json motorun (engine/src/*.hpp) derleme
bağımlılığı olabilir; sökme ≠ silme. Motor derlenmeye devam ediyorsa öyle
bırak ve durumu YAZ.

BİTİNCE GÖSTER: sadece ön fotoğrafla üretilmiş çıktının ekran görüntüsü
(uydurma ilanı görünür halde) + `grep -rn "vocab\|neckline" web/js/` çıktısı.
```

---

### A4 brief

```
GÖREV: canlı deploy + repo temizliği (HEDEF.md md.13, md.14).

İŞ 1 — DEPLOY:
Canlı sitede `claude -p` koşamaz. KOSU/siluet-oku.mjs'deki ARKA_UCLAR tablosu
tek değişim noktasıdır. Bugün API parası YOK → seçenekleri ÖLÇ, uydurma:
yerel köprü talimatı mı, kuyruk mu, başka bir şey mi. Kararı ölçümle ver.

İŞ 2 — TEMİZLİK (ölçülmüş sayılar):
  KOSU/ciktilar/       110 MB  -> gitignore + eski setler sil (md.14)
  engine/build/        116 MB  -> gitignore
  KOSU/0509-kapi.log   1.2 MB  -> sil
  KOSU/ciktilar/paket-02/       -> sil (şablonu A2'ye geçti)
  koşu belgeleri (0509-kosu.md 91KB, 1209-kosu.md, 1209-devir.md,
    0911-kapanis.md, 0509-devir-notu.md, 0509-ilerleme.md)
    -> ölçüm tabloları KOSU/KOSU.md'ye taşı, gerisi arşive
  engine/CMakeLists.txt 102 KB ve golden-reference.csv 2.5 MB -> incele
Kök dizinde 25, KOSU/'da 47 dosya var. Öncesi/sonrası tablo ver.

İŞ 3: G2'nin kırmızıya düşürdüğü dört kapıyı (vitrin_gercek, indir,
uctan_uca, manken_insan_ayrim) yeniden koştur.

BİTİNCE GÖSTER: canlı URL'de fotoğraf→flat ekran görüntüsü + du -sh
öncesi/sonrası + git status temiz.
```

---

### A5 brief

```
GÖREV: platform — üyelik, 2 ücretsiz hak, kredi/abonelik, gardırop, ödeme, SEO.
(HEDEF.md md.10 + Damla'nın platform maddesi)

YAP:
1. Üyelik (e-posta ile giriş).
2. Yeni üyeye 2 ÜCRETSİZ hak; sonra kredi ister.
3. Kredi bakiyesi + abonelik; tükenince ödeme ekranı.
4. Gardırop: üretilen paketler hesapta kalır, yeniden indirilir.
   web/closet.html var (3321 B), iskelet — bağla.
5. Ödeme: bir satın alma uçtan uca çalışsın.
6. Beden serisi EU34-44 açılsın (paket-02/beden-serisi.json şablonu).
7. Agresif SEO: sitemap.xml ve robots.txt var; giysi tipi başına sayfa.

Her şey public standardında: KVKK/GDPR, secret sızmaz.

BİTİNCE GÖSTER: Damla'nın kendi kartıyla kendi sitesinden yaptığı satın
almanın ekran görüntüsü + inen paket.
```

---

### A6 brief

```
GÖREV: okuma doğruluğu + prenses X çaprazlaması.

⚠ İLK İŞ ÖLÇMEK, DÜZELTMEK DEĞİL.
KOSU/1209-kosu.md §2.8 açıkça yazıyor: "G1 SAYISI ÖLÇÜLMEDİ ... '≥4/5 oldu'
İDDİASI YOK." N3'ün düzeltmeleri (taban seçim kuralı, askı oranı, prompt
kalibrasyonu) ölçülmedi. Defterdeki 2/5 rakamı N3 ÖNCESİNE ait olabilir.
Ayrıca okuyucu varyansı hiç ölçülmedi (üç koşu ortancası uygulanmadı).
Önce 5 fotoğrafta, üç koşu + ortanca ile GERÇEK skoru ölç ve yaz.

SONRA DÜZELT:
1. Prenses X çaprazlaması (ölçüldü, 1209-kosu.md §2.8): okuyucu prenses
   dikişinin üst ucunu ['neckFront*0', 'bustLine+15'] yani ÖN ORTAYA
   bağlıyor; ayna:true ile iki kopya merkezden çıkıp X yapıyor. Altın kopya
   omuzdan başlatıyor ve bustApex'ten geçiriyor. Düzeltme PROMPT'ta.
2. `pens` kaçışı — A3'ün kalan tek sebebi olarak yazılmış.

⚠ Prompt 24k'yı geçince sonuç 0/5'e düşüyor (ölçülmüş eşik). Ekleme
yapıyorsan eşit miktarda tekrar sil.

BİTİNCE GÖSTER: 5 fotoğrafın flat'leri ÖNCE/SONRA yan yana (görsel) +
koşu koşu skor tablosu (yayılım dahil).
```

---

### A7 brief

```
GÖREV: flat konvansiyonu — hepsi aynı insana çizilmiş gibi (HEDEF.md md.5).

ÖLÇÜLMÜŞ UYARI (1209-kosu.md §5): flat croquis'ten değil POM'dan çizilir,
1:8 ölçekte. "Croquis oran sayıları blog seviyesi ve çelişkili (omuz 2 baş mı
1.5 baş mı) -> contract'a sayı olarak YAZILMAZ; tutarlılığı POM + 1:8 ölçek
zincirinden al."

12 Eyl'de shoulderTip.x 188.8 -> 122.5 mm değişti ve ÖLÇÜMLE yapıldı
(oran 0.918; satıcı flat pikselleri + satın alınmış Locket Top EU36 kalıbı,
iki bağımsız kaynak 0.0008 içinde uyuştu). DOĞRU YÖNTEM BUDUR.
Kalan croquis oranlarını aynı yöntemle denetle: ölçülmüş mü, konmuş mu?

BİTİNCE GÖSTER: 5 farklı giysinin flat'i ÜST ÜSTE bindirilmiş tek görsel —
göğüs/bel/kalça hatları çakışıyor mu?
```

---

### A8 brief

```
GÖREV: Buğra kıyası (HEDEF.md md.12).

⚠ ESKİ SAYI GEÇERSİZ. Son ölçüm 4 Eyl (Top Back +394 mm / %31) ve croquis
12 Eyl'de değişti (shoulderTip.x 188.8 -> 122.5). Baştan ölç.
Veri: patterns_real/geometry/geometry-full.json (satın alınmış gerçek kalıp).

⚠ md.12'nin kendi cümlesi bağlayıcı: "kör kontrol; ayar hedefi değil."
Sonuç kötü çıkarsa kalıbı Buğra'ya doğru AYARLAMA. Sapmayı raporla.

BİTİNCE GÖSTER: bizim kalıp + Buğra'nın kalıbı üst üste, parça parça,
mm cinsinden fark tablosu.
```

---

### A9 brief

```
GÖREV: bölgesel edit — "şuraya fiyonk ekle" (HEDEF.md md.2).

DURUM: docs/GRAF-IR.md'de 15 op + replay VAR, doğal dil YOK.
Doğal dil -> op çevirisi `claude -p` ile yapılır (API parası yok).
md.2'nin kendi sözleri: anchor + ratio, JSON spec.

KRİTİK ŞART — YERELLİK: bir op uygulanınca SADECE hedef bölge değişir.
Yakayı değiştirince etek ucu oynuyorsa OLMAMIŞTIR.

BİTİNCE GÖSTER: aynı elbisenin dört hali yan yana (temel, +fiyonk,
+uzatılmış, +değişmiş yaka) + hangi piksellerin değiştiğini gösteren diff.
```

---

### A10 brief

```
GÖREV: kumaş davranışı ve parça bölme (HEDEF.md md.6, md.7).

⚠ ÖNCEDEN ÖLÇÜLMÜŞ TUZAK (1209-kosu.md §4) — BAĞLAYICI:
Negatif payda formül ile sektör tablosu ÇELİŞİYOR.
  formül: (1 - 1/streç) x 100 -> %75 streç için %43
  sektör tablosu -> %5
MOTOR TABLOYU ALIR, FORMÜLÜ DEĞİL. Formül sadece üst sınır.
Ham formülü koda gömmek GİYİLEMEZ kalıp üretir.

  stable knit      %18-25 streç -> %0 indirim
  moderate         %26-50      -> %2
  stretchy         %50-75      -> %3
  super-stretchy   %75-100     -> %5

Negatif pay ANİZOTROPİK: yatay %8-12, dikey %0. Tek çarpan DEĞİL.
Örme bloklar DARTLESS: göğüs pensi kol evine rotate, kol evi +1/2" yükselir.

md.7 (en az parça) için: dart = ayrıklaştırılmış Gaussian curvature. Parça
sayısı estetik karar değil geometrik zorunluluk. Pens AÇI olarak saklanmalı:
sin(θ/2) = (genişlik/2) / uzunluk.

BİTİNCE GÖSTER: aynı elbise, iki kumaş, İKİ FARKLI kalıp yan yana,
farklar mm cinsinden işaretli.
```

---

### A11 brief

```
GÖREV: elbise dışındaki giysiler (HEDEF.md md.9 "modanın sınırı yok", md.1).

Etek, üst, pantolon, ceket. Hedef fotoğraflar GIRDI/ altında HAZIR (20 adet):
  GIRDI/hedef-fotograflar-2/  Dior HC FW26 (bluz, etek, pantolon, elbise, gömlek)
  GIRDI/hedef-fotograflar-3/  11 Etsy ilanı
  GIRDI/hedef-fotograflar/    V&A arşivi (Ossie Clark, Mary Quant, Biba)

md.9: sabit menü / limit / sınır getirme. Yeni giysi tipi için sözlüğe
değer EKLEME; Edge/Panel/Stitch primitifleriyle çöz.

BİTİNCE GÖSTER: dört farklı giysi tipinin flat + kalıbı, tek sayfada.
```

---

### A12 brief

```
GÖREV: pazarlama — Instagram/LinkedIn, iki iş modeli.

ÖLÇÜLMÜŞ BULGU (1209-kosu.md §5.1) — pazarlama dili buradan kurulur:
Ticari boşluk KALIPTA DEĞİL, FLAT'te. CLO3D 3D'den vektör flat üretmiyor,
sadece render veriyor; sektörde flat hâlâ POM'dan ELLE çiziliyor.
Kalıp tarafı akademide kalabalık (GarmentCode, Sewformer, NGL, GarmageNet).
-> Damla'nın iki iş modelinden FLAT SATIŞI wrapper testini geçen taraf.

Her soru cümlesi "?" ile biter — başlıklar dahil.

BİTİNCE GÖSTER: yayınlanmış gönderiler + siteye gelen ziyaretçi sayısı.
```

---

### A13 brief

```
GÖREV: iOS uygulaması (HEDEF.md md.10 + Damla'nın iOS maddesi).

Swift. Siteyle AYNI arkaplan ve fontlar. App/ klasörü var.
Fotoğraf çek/seç -> flat + kalıp. Arka uç A4'te kurulan uçtur.

BİTİNCE GÖSTER: simülatörde fotoğraf -> flat, ekran kaydı.
```

---

## 5. NEREDE KALDIK DEFTERİ

`HEDEF.md`'deki her madde, bugünkü ölçülmüş durumu, ve hangi fazda kapandığı.

| madde | ne diyor | durum (12 Eyl, ölçüldü) | kapanacağı faz |
|---|---|---|---|
| **md.1** | fotoğraf+prompt = kalıp+flat | **YARI AÇIK** — terminalde çalışıyor (`yerel/31090`), sitede `return null` | **A1, A2** |
| **md.2** | Midjourney tarzı bölgesel edit | **AÇIK** — 15 op + replay var (`docs/GRAF-IR.md`), doğal dil yok | A9 |
| **md.3** | CS hesap ve matematik işi | **AÇIK/sürekli** — croquis düzeltmesi ölçümle yapıldı (0.918, iki kaynak 0.0008 içinde); yöntem doğru | sürekli |
| **md.4** | flat 36 = croquis, kalıp 36 = dikilebilir | **KISMEN** — ayrım kodda var (`croquis36` / `gercek36`); dikilebilirlik prova edilmedi (Damla hiç dikmedi) | A5 (seri), A8 (prova) |
| **md.5** | flat konvansiyonu, hepsi aynı insana | **AÇIK** — croquis oranları ölçülmüş değil, konmuş (araştırma uyarısı §5) | A7 |
| **md.6** | kumaş, parça bölme, iki kumaş iki kalıp | **AÇIK** — 5 kumaş rehberi `paket-02`'de var ama ESKİ hattan; negatif pay tuzağı ölçülmüş, uygulanmamış | A10 |
| **md.7** | en az parça, gereksiz bölme yok | **AÇIK** — `yerel/31090` 9 op; dart=Gaussian curvature bulgusu uygulanmadı | A10 |
| **md.8** | tech stack sınırsız zorlanabilir | **AÇIK/serbest** — bugün kısıt para, teknoloji değil | — |
| **md.9** | sabit sözlük YOK, Edge/Panel/Stitch | **YARI KAPALI** — silüet hattı sözlüksüz (oran tabanlı); `vocab.json` 37 alan/132 değer duruyor ama ürüne bağlı değil | **A3** |
| **md.10** | rehber, püf noktaları, üyelik, forum, iOS | **AÇIK** — rehber kodu var (`rehber-tr.js`), yeni zincire bağlı değil | A2, A5, A13 |
| **md.11** | kök neden her yerde, think out of the box | **ÇALIŞIYOR** — 12 Eyl'de kök neden `engine/src/body.cpp:174`'te bulundu (croquis omuz, göğsün 55.4 mm dışında); doğru refleks | sürekli |
| **md.12** | Buğra'ya yaklaşıyor mu | **AÇIK** — son ölçüm 4 Eyl, croquis 12 Eyl'de değişti → **o sayı geçersiz** | A8 |
| **md.13** | repo düzenlenecek | **AÇIK** — kök 25 dosya, `KOSU/` 47, `ciktilar` 110 MB, `build` 116 MB, tek log 1.2 MB | A4 |
| **md.14** | eski onaysız çıktılar silinsin | **AÇIK** — `paket-02` (3 Eyl, eski hat) duruyor; `ciktilar/` altında 40+ eski set | A4 |
| **edge** | ön varsa arkayı uydur, **söyle** | **YARI** — `kaynak-yolu.txt`'de "arka.koken turetildi" yazıyor ama kullanıcı görmüyor | **A3** |
| **platform** | üyelik, 2 hak, kredi, gardırop, ödeme, SEO | **AÇIK** — `closet.html` iskeleti var (3 321 B), bağlı değil | A5 |
| **pazarlama** | Instagram/LinkedIn, iki iş modeli | **AÇIK** — hangisinin güçlü olduğu ölçüldü (flat satışı) | A12 |
| **iOS** | Swift, aynı arkaplan/fontlar | **AÇIK** — `App/` klasörü var | A13 |

### Eski A defterinden bu plana eşleme

| eski | yeni | değişen |
|---|---|---|
| A1 geçit altyapısı | — | KAPANDI, taşınmadı |
| A2 ilk uçtan uca | — | KAPANDI (terminalde) |
| A3 fotoğraf okunsun | **A6** | **öne değil, SONA** — güzelleştirme |
| A4 çizim güzelleşsin | **A6, A7** | sona |
| A5 edit | A9 | — |
| A6 her giysi | A11 | — |
| A7 kumaş | A10 | — |
| A8 Buğra | A8 | eski sayı geçersiz ilan edildi |
| A9 paket | **A2** | **sondan ÖNE** — MVP'nin parçası |
| A10 deploy/landing | **A4** | **sondan ÖNE** |
| A11 tur | A12 | — |
| A12 tavan denemesi | — | çıkarıldı; `CLAUDE.md` "tavan yok" diyor |
| — | **A1** | **YENİ ve İLK** — siteyi zincire bağla |
| — | **A5** | **YENİ** — üyelik/ödeme (Damla'nın platform maddesi) |

---

## 6. Bu planın kendisine dair

Bu belge `KOSU/1209-kosu.md`'nin yerine geçmez; onun **ölçülmüş bulgularını**
(§2.5–§2.8, §4, §5) kaynak olarak kullanır ve A4'te o belge arşive taşınır.

Bu belge bir **sıra**dır. İçinde yeni eşik, yeni yasak, yeni ritüel yoktur.
Ölçme araçları (`kapi.sh`, `goz.mjs`, `altin-kiyas.mjs`) zaten repoda ve
oldukları gibi kullanılır.

Plan büyürse yanlış yoldayız: yeni bir kural ekleme dürtüsü gelirse, o dürtü
bu planın kendi giriş cümlesinin ihlalidir.
