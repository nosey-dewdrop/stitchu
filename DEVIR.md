# DEVİR — stitchu, 4 Eylül 2026

> Yeni oturum: **bu dosyayı bir kez oku, sonra çalış.** Amaç, sıfırdan çözmeye
> kalkmaman. Neyin neden böyle olduğu ve nereye basmaman gerektiği burada.
> Repo yasası `CLAUDE.md` (gitignore'da, lokal) hâlâ geçerli ama bir kısmı
> bayat — çelişkide **bu dosya** kazanır, çelişen satırı `CLAUDE.md`'den sil.

---

## 0. TEK CÜMLE

**Fotoğraf + prompt → dikilebilir kalıp + satılır flat.** Bitiş şartı bir ölçüm
değil: bir yabancı siteye girer, fotoğrafını/promptunu atar, kumaşını seçer,
kalıbını + flat'ini + rehberini indirir, diker, giyer. "Al dene" diyebildiğin
gün iş bitmiştir.

Damla'nın sözü: *ölçüm bir hedef değil, ölçmeden zaten yapamazsın. Hedef ürün,
müşteri, müşteri deneyimi.*

---

## 1. DAMLA İLE ÇALIŞMA — pazarlıksız kurallar

Bunlar tercih değil, defalarca tekrar etmek zorunda kaldığı şeyler:

1. **Router değil.** Ona soru sorma. Fazlar arası karar gerekiyorsa **tarafsız
   ajana** sor, cevabı uygula. "Bu senin kararın mı / onaylıyor musun" yasak.
   Estetik kararlar dahil — 5 flat seçimini bile hakem yaptı.
2. **Ajan izolasyonu.** Her faz taze ajanla yapılır, işi biten ölür. Tek
   context'te toplanırsa şişer, hesap bozulur, halüsinasyon gelir.
3. **Tarafsız hakem.** İşi yapan kendi işini övemez. Hakem ajanın beyanını
   KANIT saymaz, komutları kendi koşar, görselleri kendi açar.
4. **Compounding error kontrolü.** Her faz, önceki fazların kabul komutlarını da
   koşar. Biri kızarırsa ilerleme yok.
5. **Ajana taraf tutturma.** Ajanı "şunu doğrula" diye kurma; durumu anlat,
   eleştirel ve iyileştirme isteyen cevap iste. Çürütme ajanı salıp
   "doğrulanamadı = yok" yapma — bilgi atmak, bilgi vermemekten beterdir.
6. **Rapor ürün değildir.** Her turun sonunda Damla'nın **gözüyle göreceği
   çıktı** olacak: çizim, sayfa, paket. Kapı yeşilliği geçer not değil.
7. **Branch yok.** Her şey `main`'e commit. Mesaj küçük harf İngilizce,
   `Co-Authored-By` **asla**.
8. **Süründürme yok.** Süreç fazı (envanter, kart bürokrasisi, depo temizliği)
   ürün fazının önüne geçemez. v8 koşusu tam bundan öldü.
9. **Uyku/yorgunluk deme, günü kapatma.** Ne zaman durulacağına Damla karar
   verir.

---

## 2. BUGÜN NE ÇALIŞIYOR (kanıtlı)

Sevk edilen zincir uçtan uca ayakta. Kanıtı `KOSU/ciktilar/` altındaki
çıktılar ve `engine/tests/` kapıları:

| Yetenek | Kapı | Çıktı |
|---|---|---|
| Yazıdan giysi ("puf kollu mini elbise") | `prompt_spec_check.mjs` | `prompt-01..03` |
| Fotoğraf oranları motora iniyor | `vision_tasima_check.mjs` | `vision-oran-farki` |
| Arka yoksa uydur + **ilan et** | `arka_koken_check.mjs` | `arka-ilan` |
| Aynı elbise iki kumaş iki kalıp | `kumas_kalip_check.mjs` | `kumas-farki` |
| Görseldeki kadar parça, koşullu fermuar | `parca_sayisi_check.mjs` | `parca-once-sonra` |
| Flat ideal beden / kalıp gerçek beden | `manken_insan_ayrim_check.mjs` | `konvansiyon-once-sonra` |
| Bölgesel edit ("yakayı 2cm derinleştir") | `edit_locality_check.mjs --all-zones` | `edit-yaka` |
| Büzgülü üst katman (puf/balon kol) | `buzgu_katman_check.mjs` | `puf-kol` |
| Primitif kompozisyon (enum büyümeden) | `primitif_ifade_check.mjs` | `primitif-5` |
| Edge case süpürme | `edge_case_supurme_check.mjs` | `edge-case-tablosu` |
| Kaynaklı rehber + beden serisi | `rehber_kaynak_check.mjs` | `paket-02/` |
| Vitrin gerçeği söylüyor | `vitrin_gercek_check.mjs` | canlı site |
| iOS zemini (token tek kaynak) | `ios_zemin_check.mjs` | `ios-tokenlar.md` |
| Çizimin kendisi (16 spec, a–k) | `cizim_giysi_mi.mjs` | 01–09 flatler |

**Canlı:** https://stitchu.noseydewdrop.com (gh-pages, `scripts/deploy.sh`).
**Backend:** `stitchu-api.damummyphus.workers.dev` — `/api/draft` ve
`/api/analyze` **açık**, Turnstile + IP limiti + günlük 300 çağrı tavanı
arkasında. (Bir ara "kapalı" diye rapor edildi, **yanlıştı**, curl'le
doğrulandı.)

---

## 3. MİMARİ — nereye dokunacaksın

**SEVK EDİLEN HAT (ürün budur):**
```
create.html → create.js
  ├─ prompt-parse.js      (yazı → spec, deterministik)
  └─ vision-bridge.js     (fotoğraf → spec, backend/worker.js üstünden Claude)
      → engineSpec()      (web/js/engine.js)
      → draftJSON         (wasm, engine/src/*.cpp)  ← KALIP burada doğar
      → web/lib/flat-from-pattern.js + flat-geom.js ← FLAT kalıbın izdüşümü
```

**ARAŞTIRMA HATTI (sevk dışı, dokunma):** `planJSON` / `flatJSON` /
`seamPlan*` / `flat-from-plan.js` — 3B yüzey hattı. Kapıları hâlâ koşuyor ama
ürüne bağlı değil; test isimlerinde `ARASTIRMA_HATTI_SEVK_DISI` etiketi var.

**Neden böyle:** 1 Eylül'de flat 3B yüzey hattından çiziliyordu ve indirme
butonu 5/5 çöküyordu (`invalid tieClosure NaN`), çağrı başına 7.5–30 saniye
sürüyordu; tiplerinde kol, yaka, pens yoktu. Flat kalıp hattına bağlandı:
3–12 ms, ve çizim artık **alıcının kestiği kalıbın** izdüşümü. Damla'nın
3. maddesi bunu şart koşuyor.

**Kanunlar (`contract/`), sayılar koda gömülmez:**
- `flat-convention-v1.json` — `sevkPoz` bloğu: kol yataydan 30–40° **aşağı**,
  omuz eğimi 15–22°, omuz = 0.85–0.90 × göğüs, yaka oranları, çizgi
  hiyerarşisi 4:2:1, kesik çizgi = topstitch.
- `mannequin-chart` v2 — flat ideal bedenden, kalıp gerçek bedenden; fark
  EU38'de 12.74 mm ve kaynağı `KOSU/ciktilar/flat-olcum.json`.
- `fabric-catalog-v1.json` — 5 kumaş, negatif ease `(1 − 1/streç oranı) × 100`,
  yüzde parametre, yatay/dikey ayrı.
- `edit-locality-v1.json` — bölge dışı panel **bayt-aynı** yasası.
- `primitives-v1.json` — Edge/Panel/Stitch, her primitifin `motorda_kapi` alanı.
- `tables.json` `draft.gatherRatios` — büzgü oranları Buğra'dan ölçülmüş.

---

## 4. AÇIK KALANLAR — dürüst liste

`KOSU/ciktilar/kusur-listesi.md` canlı liste, önce onu oku. Bilinen büyükler:

1. **Buğra hâlâ birebir değil.** M2'de puf kol farkı 89.9 → 60.4 mm düştü ama
   gövde ve yaka aynı yerde duruyor. `engine/tools/bugra-blind-compare.mjs`
   rapor aracı, kapı değil. **Buğra'ya benzemek için sabit ekleme** — kör
   kontrol, tune hedefi değil.
2. **Toile dikilmedi.** 600+ saatte hiçbir çıktı kumaşa kesilmedi. Bu yüzden
   sitede fiyat/satış cümlesi YOK ve olmamalı. Damla bir prova dikene kadar
   pazarlama cümlesi yazılmaz.
3. **Dört ilanlı kırmızı ctest:** `flat_artifact_census` (bel C1 köşesi,
   yüzey hattında), `style_check`, `sizechart_source_check` (4 ölçü kaynaksız,
   bilerek), `figure_check` (pin eksik). Dördü de benchmark sayfasında adıyla
   ilan edilmiş. **Deploy bunlara izin verir, beşinciye vermez.**
4. **Kol silueti:** puf artık dolgun ama bazı örneklerde manşete doğru
   daralmıyor ("fırın eldiveni" okuması); referans flatlerin zarafeti yok.

---

## 5. TUZAKLAR — bunlara düşme, hepsi bu oturumda yaşandı

- **Chrome asılı kalıyor.** Headless çağrıyı `timeout` ile sar, `--user-data-dir`
  izole ver, bitince süreçleri öldür. Bir workflow tam bundan 6 denemede
  stall etti. Zombi Chrome süreçleri makinede birikiyor, öldür.
- **Bayat native build.** ctest'te açıklanamayan kırmızılar (SEGFAULT dahil)
  çıkarsa **önce** `cmake --build engine/build -j4` — 6 kırmızı bunun yüzünden
  yandı, kod hatası değildi.
- **Motor değiştiyse wasm'ı da derle** (`engine/wasm/build-wasm.sh`), yoksa web
  eski motoru kullanır ve "düzelttim" yalan olur.
- **`vocab_reference_check` (BREADTH→DEPTH cırcırı).** Kapalı enum'a referans
  artışını kırmızı yakar. Yorum satırında geçen kelime bile sayılır. Önce
  `git diff -- engine/vocab.json` bak: bayt-aynıysa artış prose'dur, tabanı
  `bash engine/tests/vocab_reference_check.sh --baseline <sha>` ile yeniden kes
  ve **gerekçeyi commit mesajına yaz**. Sözlük gerçekten büyüdüyse KESME.
- **Deploy kanıt zinciri** (`scripts/deploy.sh`): style-lint → header-diff →
  contract → tam ctest → gh-pages → canlı curl. Motor dokunulduysa
  `STITCHU_MOTOR_PROOF=done` ister (wasm iki hedef + golden + ctest gerçekten
  koşulduktan sonra). Deploy `main`'e de push yapar — beklenen davranış.
- **Session limiti / API 500.** Uzun koşular düşüyor. Workflow'u
  `resumeFromRunId` ile devam ettir: tamamlanan fazlar cache'ten döner.
  Düşen ajan çalışma ağacında **taahhütsüz iyi iş** bırakmış olabilir — silme,
  önce kapıları koş, geçiyorsa committe.
- **`git stash list`'te iki eski stash var** — dokunma, pop etme.
- **`GIRDI/`** telifli referans (V&A fotoğrafları, aday flatler) — okunur,
  değiştirilmez, commit edilmez. `patterns_real/` (satın alınmış Buğra PDF'leri)
  yerelde, git dışı.

---

## 6. ORKESTRASYON — çalışan desen

`Workflow` aracıyla, faz başına iki ajan. Bu oturumda 3 koşu bu desenle
yürüdü ve tuttu. İskelet:

```js
for (const faz of fazlar) {
  for (let deneme = 0; deneme < 3 && !gecti; deneme++) {
    await agent(ORTAK + faz.tarif + (hakemGeriBildirimi ?? ''))   // yapan, ölür
    hukum = await agent(HAKEM + faz.tarif + ajaninBeyani,          // denetleyen
                        { schema: HAKEM_SEMA })                    // GEÇTİ/KALDI
  }
  gecmisKabuller.push(faz.kabulKomutu)   // sonraki fazlar bunu da koşar
}
```

**Hakem şeması alıcı dilinde sorar** (Damla'nın son isteği):
`olduMuBittiMi` (BİTTİ/BİTMEDİ) · `alirMiydim` (ALIRDIM/ALMAZDIM) · `neden`
(almazdım ise eksik **tam olarak** ne) · `urunGucu` · `kusurlar[]`.
"ALMAZDIM" ise kusur listesi boş olamaz.

**Bitmeyen tur döngüsü:** denetçi ürünü **çalıştırır** (yerel sunucu + Chrome,
prompt yazar, indirme düğmesine basar, ekran görüntüsüne bakar) → kusur
listesi → onarıcı kök sebepten kapatır → hakem doğrular → tekrar sor.
**İki tur üst üste** hem kusur bulunmayacak hem "bitti, alırdım" denecek ki
dursun. Damla'ya ara rapor gitmez; eleştiriye göre düzelt, tekrar sor.

Ajan brief'inde her zaman: hedef cümlesi, sevk hattı, kanunlar, "uydurma sayı
yok / sessiz default yok / çıkmaz sokak yok", "eşik gevşetme ve testi kendine
göre yazma yasak", ürün çıktısı zorunluluğu, Chrome timeout kuralı,
"tam ctest koşma, hedefli koş" (tam süit ~25 dk, 8 GB makine).

---

## 7. SIRADA NE VAR

Damla'nın kendi sırası: **ticari iş modelleri + iOS uygulaması.**

- **iOS:** zemin hazır — `contract/design-tokens.json` tek kaynak, aynı
  dosyadan `Tokens.swift` üretiliyor, `backend/API.md` sözleşmeyi taşıyor.
  Xcode projesi **açılmadı**, o Damla'nın başlatacağı iş.
- **İki iş modeli:** (a) B2C dijital paket (kalıp + flat + rehber),
  (b) B2B fiziksel — aynı kalıptan dikilmiş giysi. İkisinin de tek koşulu
  zincirin edge case'lere rağmen çalışması. Ödeme akışı yok; eklenmeden önce
  iade koşulu, telif sorumluluğu ve fotoğrafın Anthropic API'ye gittiği
  bilgisi yazılı olmalı (üçüncüsü sitede zaten var).
- **Pazarlama:** Instagram + LinkedIn, kişisel marka üstünden. Konumlandırma
  ölçülebilir olmalı: rakipler istatistiksel taklit ediyor ve dikişçi
  topluluğu AI kalıplarının dikilemediğini söylüyor; bizim iddiamız
  deterministik geometri = dikilebilirlik. **Toile dikilmeden fiyat yazma.**
- **Teknik yol (araştırıldı, seçilmedi):** garment-flattening (MIT, C++) →
  flatten arka ucu · spec-diff edit mimarisi (Zoo/KittyCAD deseni) ·
  ChatGarment (Apache-2.0) fotoğraf okuma önyükleyicisi.
- **Rakip:** StitchLift (stitchlift.com) fotoğraftan kalıp + DXF iddia ediyor,
  $49/ay. Bağımsız inceleme yok, **elde denenmedi**. "Kimse yapmıyor" cümlesini
  denemeden kurma.

---

## 7.5 SONRAKİ DEĞİL, ONDAN SONRAKİ OTURUM — PLATFORM KATMANI

Damla'nın kendi tarifi. **Bu oturumda çözülmeyecek**, ama bugünkü mimari bunu
ucuza almaya hazır olacak. Sıradaki oturum ya bunu yapar ya zeminini kurar.

**Ne kuruluyor:** stitchu tek seferlik bir üretici olmaktan çıkıp **yaşayan bir
ürün** oluyor — hesap, kota, ödeme, gardırop, satış, ve programatik SEO.

### Kurallar (Damla'nın koyduğu)
1. **Bedava kullanım yok.** Başta demo için izin var, sonrası hesaba bağlı.
2. **Her hesaba 2 hak:** prompt ya da fotoğraftan → flat + kalıp, iki kez.
3. Sonrası **kredi veya abonelik** ile ilerler.
4. **Gardırop:** kullanıcının kalıpları ve giysileri hesabında durur, geri
   dönülebilir, düzenlenebilir (bölgesel edit zaten var).
5. **Web'de iki şey satılıyor:** kalıp (dijital) ve giysi (fiziksel).
6. **Üyelik web ve mobil arasında ortak** — aynı hesap, aynı gardırop.
7. **Programatik SEO, agresif.** Sayfalar elle değil üreteçten doğacak.

### Bugünkü mimarinin taşıması gerekenler (hazırlık = bunlar)
Bunlar yapılmazsa platform katmanı pahalıya patlar:

- **Kota sunucu tarafında sayılır.** İstemciye güvenilmez. `backend/guard.js`
  bugün IP + günlük tavan sayıyor; hesap başına kota da **aynı yerde**
  sayılacak. Ücretsiz 2 hakkın istemcide tutulması = herkeste sınırsız hak.
- **Üretilen her paketin kalıcı kimliği olmalı.** Gardırop, spec'in kendisini
  (JSON) saklar — piksel/PDF değil. Spec + motor sürümü = paket yeniden
  üretilebilir. Bu zaten doğru mimari: `draftJSON` deterministik, aynı spec
  aynı çıktıyı veriyor. Gardırop kaydı = spec + kumaş + beden + köken damgası.
- **Anonim → hesap geçişi.** Demo'da üretilen paket, kayıt olunca hesaba
  taşınabilmeli (spec zaten `closet.js`/localStorage'da tutuluyor; kaybolmadan
  taşınacak).
- **Motor sürümü kayıtlı.** Gardıroptaki eski bir kalıp yeniden üretildiğinde
  hangi motorla çizildiği bilinmeli, yoksa "kalıbım değişti" şikayeti gelir.
- **Ödeme öncesi yazılı olması gerekenler:** iade koşulu (dijital ürün),
  kullanıcının yüklediği fotoğrafın telif sorumluluğu, fotoğrafın Anthropic
  API'ye gittiği (bu sonuncusu sitede zaten yazıyor).
- **Fiziksel satış ayrı akış:** B2B/giysi tarafında risk Damla'da, o yüzden
  fiziksel satılan model **kendi tasarımı** olacak.

### Programatik SEO — nasıl kurulacak
Motor zaten sayı üretiyor; SEO sayfaları o sayıdan doğacak, elle yazılmayacak
(landing'de bu kural zaten var: elle yazılmış sayı = 0, `vitrin_gercek_check`).

- **Sayfa ailesi fikirleri:** giysi tipi × kumaş × beden kombinasyonları;
  "X kumaşta Y elbise kalıbı" · "EU38 A-line elbise kalıbı, dikiş payı dahil" ·
  kumaş rehberi sayfaları (katalogdaki 5 kumaşın her biri, kaynaklı) ·
  primitif kompozisyon galerisi (`primitif-5` üreteci).
- **Kural:** her sayfa **gerçek bir motor çıktısı** taşıyacak (indirilebilir
  flat/kalıp önizlemesi). İçeriksiz doorway sayfası üretme — Google cezalandırır
  ve Damla'nın "wrapper = flop" testine de takılır.
- **Altyapı hazır:** `engine/tools/gen-sitemap.mjs` tek üreteç,
  `site-health.mjs` ölü link/sitemap kapısı, `gen-landing-motor.mjs` sayıları
  motordan basıyor. Programatik sayfalar **aynı boru hattına** eklenecek,
  yan yol açılmayacak.
- **Ölçek uyarısı:** sayfa sayısı büyüyünce `site-health` ve deploy süresi
  şişer; üreteç sayfa başına değil toplu çalışacak şekilde yazılmalı.

### ALICININ KENDİ AĞZINDAN ŞİKÂYET — pazarlama zemini (kaynaklı, 4 Eyl)
Trustpilot ve YouTube yorumlarından **doğrudan alıntı** toplandı. Bizim
çözdüğümüz şeyler tam olarak bunlar:
- *"100 sayfa A4 indirip hepsini bantlamak kim ister?"* (Burda, 1★)
- *"A0 boyutunda bile sunmuyorlar! Dijital birleştirince kenardaki her parçanın
  kesik olduğunu gördüm."* (Simplicity M6044, 1★) — **hem A0 yok hem döşeme bozuk**
- *"2 inçlik test karesini bir türlü 2 inç yapamadım, ne kadar ayar yaptıysam
  olmadı. Pes ettim."* — bizim 100 mm kalibrasyon karesi + ölçek düzeltme yolu
  tam bu kişinin sorunu
- *"Katmanları açmak için aylık ücretli Adobe gerekiyor."* · *"iPad'de katman
  açılmıyor, bütün bedenleri basmak zorundayım."*
- *"Saatlerce bantlayıp sonunda AI çöpü olduğunu anlamak..."* — bantlama vergisi
  ile sahte kalıp dolandırıcılığı birbirini büyütüyor (2025-26 fenomeni)
- Etsy tarafı çürük: dosya teslim edilmiyor, satıcı gidince dosya siliniyor,
  yıldızlar sahte (*"daha dikmeden 5 yıldız veriyorlar"*).

⚠ **DÜRÜSTLÜK NOTU — pitch'i buna kurma:** aynı videoların yorumlarının
ÇOĞUNLUĞU PDF kalıpları SEVİYOR (anında erişim, bedenin değişince yeniden
basma, düşük görme için katman, *"televizyon izlerken bantlamak rahatlatıcı"*).
Doğru iddia "herkes bantlamaktan nefret ediyor" DEĞİL; doğrusu: **bantlama belli
bir kesimi eliyor** — yazıcısı olmayan, sadece iPad'i olan, vakti dar, ve
30 sayfayı aşan büyük giysiler. Hedef kitle o kesim.

### ★ KAMA CÜMLE — alıcının kendi kurduğu çerçeve
Dört ayrı kaynakta, birbirinden bağımsız insanlar aynı şeyi söylüyor:
**"Bir ürüne para verdim, sonra imalatını kendim tamamlamak zorunda kaldım."**
- *"Satıcı kendi ürününü bitirmeyi bana yıkmış gibi hissettiriyor."* (Becky)
- *"Kızım bana güldü: kalıba PARA vermişim, sonra dikebileceğim bir kalıp elde
  etmek için önce bir el işi projesi yapıyorum."* (mmcp)
- *"Kalıp tasarımcılarının bu maliyeti tüketiciye yıkması hiç hoşuma gitmiyor."*
  (alexmasson)
Konumlandırmayı "bantlamak sıkıcı" üzerine değil **bu cümle** üzerine kur.

**★ SÜRE DEĞİL, HATA BİRİKİMİ — asıl argüman bu.** Bantlamanın gerçek kusuru
sıkıcı olması değil: bir mühendis (utahliz) bantladıktan sonra parçaların
**ölçülebilir şekilde kaydığını** bildirdi; başkaları "sayfalar hiç hizalanmıyor",
"kenardaki parçalar kesik çıktı" diyor. Bu bir geometri/yazılım argümanı, "can
sıkıcı" argümanı değil — bizim tarafımız burası.
⚠ **SÜRE SAYISI KULLANMA:** iddialar iki kutuplu — yöntem satan blogcular
"5-15 dakika" diyor, sıradan dikişçiler yorumlarda "1-3 saat" diyor. Tek bir
sayı söylersen topluluk seni düzeltir. Daha sağlam birim **sayfa sayısı**
(yukarıdaki tablo).

**İki yan bulgu:** (1) kimsenin konuşmadığı bir dert — bantlanmış kalıbın
SAKLANMASI ("katlanınca bozuluyor, yer kaplıyor"); 93 yorumun ~8'i bunu diyor.
(2) Talep arzı aşmış durumda: İngiltere'deki Patternsy copyshop baskı servisi
yeni müşteriye kapandı — *"yakın zamanda (belki hiç) yeni müşteriye
açılmamız çok olası değil."*

### BANTLAMA VERGİSİNİN GERÇEK SAYILARI (9 marka, 70+ kalıp, satıcının kendi ilanından)
Rakiplerin ürün sayfalarından çekildi, tahmin değil: basit üst/etek **20-40
sayfa**, elbise/pantolon **40-60**, kaban/blazer/kot **65-115**. Bulunan en
büyük: Cashmerette Fiske pijama **147 sayfa** (A0'da 11). En küçük: Megan
Nielsen külot 8 sayfa. A0 karşılığı hep 1-5 tabaka.

**★ ÖLÇÜLEN HAKSIZLIK — pazarlamada kullanılabilir:** aynı kalıp, büyük beden
aralığında **%20-85 daha fazla sayfa**. Cashmerette Montrose 26→48 (+%85),
Hatton 36→61 (+%69), Canton Moto 53→87 (+%64), Brookhaven 48→76 (+%58).
Yani plus-size diken kadın aynı kalıp için daha çok kâğıt, daha çok mürekkep,
daha çok bant ödüyor. Bizim motorumuzda beden bir parametre — bu ceza yok.

⚠ **DÜRÜST KARŞI KANIT:** sektör bu sorunu zaten dolanıyor. Closet Core'un YENİ
kalıplarının hepsinde projeksiyon dosyası var (eskilerde yok). Yani "bantlama
acısı" tek başına konumlandırma olamaz; bizim farkımız **kalıbın kendisinin
fotoğraftan/prompttan üretilmesi**, dosya formatı değil.

### PROJEKSİYON DOSYASI — ucuz özellik, ölçülmüş talep (4 Eyl'de bulundu)
Ev dikişçileri PDF'i kâğıda basıp yapıştırmak yerine **projeksiyonla kumaşa
yansıtıyor.** Kanıt: "Projectors for Sewing" Facebook grubu 2021'de 35 bin,
2023'te 60 bin, bugün **111.292 üye** — altı yılda 10 kat. ~150 kalıp firması
projeksiyon dosyası veriyor (Jalie 202 dosya, Seamwork tüm kalıplarına ekledi).
**Bir Fiverr satıcısı tek kalıbı projeksiyon dosyasına çevirmek için $130
alıyor** — bizim motorumuz 1:1 vektör zaten üretiyor, bu neredeyse bedava bir
özellik. Ve Helen's Closet gibi üst sıra bir indie marka Eylül 2025'te hâlâ
"radarımda ama yapmadık" diyor — boşluk kayıtlı.
Uyarı: araç katmanı ücretsiz ve açık kaynak (Pattern Projector, PDFStitcher) ve
topluluğun ödeme isteği düşük ("$20 tek seferlik makul" — örneklem belirsiz).
Yani bunu ayrı ürün değil, **paketin içindeki bir dosya** olarak ver.
DOĞRULANMADI: "müşterilerin %X'i istedi" diye yayınlanmış tek bir sayı YOK —
talep hikâyesi bugün sadece grup büyümesi ve arz sayımıyla kurulabilir.

**★ İKİ SERT GERÇEK (4 Eyl, ikisi de birincil kaynaktan):**
1. **DONANIM+ABONELİK MODELİ ÖLDÜ, TALEP YAŞIYOR.** JOANN/Singer'ın "Ditto"su
   NYFW'de "160 yılın ilk yıkıcı dikiş teknolojisi" diye lanse edildi ($799 +
   $9,99/ay). Fiyatı iki yılda $799→$199'a düştü, JOANN iflas etti ve Ditto işi
   **800.000 $ nakde** Singer'a satıldı (Mayıs 2025, iflas dosyası). Kullanıcılar
   $50–200'lük jenerik projektör + ÜCRETSİZ web aracı kullanıyor. Ders: bu
   kategoride donanım/ekosistem satılmaz, **dosya** verilir.
2. **⚠ PATENT RİSKİ — projeksiyon özelliği yazmadan önce taranacak.**
   US10750810B2 "Method of projecting sewing pattern pieces onto fabric"
   (mucit Elizabeth Caven, 2038'e kadar geçerli) bugün **Singer Sourcing'in
   elinde.** Devam patentleri de taranmalı. Biz sadece 1:1 vektör dosya
   ürettiğimiz için muhtemelen kapsam dışıyız ama bu **hukukçu sorusu**,
   varsayımla geçilmez.
Yazılım katmanı ince: tek ciddi açık kaynak araç Pattern Projector (224 yıldız,
60 açık issue), rakibi $20'lik tek kişilik bir ürün — 111 bin kişilik tabana
karşı. Tek nicel talep verisi: Charm Patterns'ın 1.800 kişilik anketinde
projektör dosyası tercihi 2024'te %10'u aştı. **Bu "satışların %10'u" DEĞİL,
format tercihi — dışarı öyle söyleme.**

### Sıra (öneri, hakem değiştirebilir)
1. Hesap + kota (sunucu tarafı) → 2. Gardırop (spec kalıcılığı) →
3. Ödeme (kredi/abonelik) → 4. Programatik SEO → 5. Fiziksel satış akışı.
Mobil, hesap ve gardırop hazır olunca aynı API'yi tüketir (`backend/API.md`).

---

## 8. İLK 10 DAKİKA

```bash
cd ~/damla_projects_2026/stitchu
git log --oneline -10
cat KOSU/ciktilar/kusur-listesi.md          # açık kusurlar
open KOSU/ciktilar/paket-02/                # alıcının aldığı paket
open KOSU/ciktilar/01-elbise-duz-kol-bebe-yaka.png   # bugünkü flat
node engine/tests/cizim_giysi_mi.mjs        # çizim kapısı (hızlı)
cmake --build engine/build -j4              # bayat binary tuzağı
```

Sonra: `git status` temiz mi, `pgrep -fl chrome` zombi var mı, koşan bir
workflow kaldı mı (`/workflows`).
