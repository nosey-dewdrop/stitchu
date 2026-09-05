# stitchu, koşu belgesi 1

2026-09-05. Biçim rabadon koşu belgesi 5 ile aynı: istekler numaralı, kullanıcının yolu adım adım, her faz bir adımı gerçek yapar, kabul komutu fazdan önce yazılı ve mühürlü. Bu belge kendi kendine yeter.
Otorite: `HEDEF.md` > `KARARLAR.md` > bu belge. `DEVIR.md` yalnız §5 tuzaklar ve "KABUL" bloğu için okunur. `DEVIR-PROMPT.md` her faz sonunda yeniden yazılır.

---

## §1. PROJE NEDİR

**stitchu, bir fotoğraftan ya da bir cümleden dikilebilir kalıp ve satılır flat çıkarır.**

Çekirdek bir giysi grafıdır: paneller, kenarlar, dikişler; kenarlar beden landmark'ı + oranla tanımlı, mm yok. Aynı graf gerçek bedende değerlenince kalıp, croquis bedende değerlenince flat. Edit grafa bir op. Kumaş bedene bir bolluk alanı. Sözlük yok: "puf kol" diye bir tip yoktur, büzgülü bir üst katman vardır.

**Ne değil:** menüden giysi seçtiren bir araç değil, Claude'un fotoğrafa bakıp isim söylediği bir sarmalayıcı değil, güzel görünen ama dikilmeyen bir çizim üreteci değil.

---

## §2. NE İÇİN

Bir yabancı siteye girer, fotoğrafını ya da cümlesini atar, ne okunduğunu düz cümlelerle görür, "kol uzun olacak" der, kumaş ve beden seçer, indirir, diker, giyer.

**İlk gün hissedeceği an:** indirmeden önce ekranda flat'i ve "kısa kol, yuvarlak yaka, bel dikişi, A etek, arka fermuar (uyduruldu)" cümlesini görür; "kolu uzat" yazar; flat ve kalıp birlikte değişir. Bu anı üretemeyen faz, faz değildir.

Damla'nın cümlesi: *ölçüm bir hedef değil, ölçmeden zaten yapamazsın. Hedef ürün, müşteri, müşteri deneyimi.*

---

## §3. BAR

Çıta "demo çalışıyor" değil. Çıta: **isteyene "al dene" diyebilmek.** Etsy'de gerçek bir kalıp satıcısının ayarında; Damla görünce "ay evet" diyor; rastgele birine satılabiliyor.

İki düşman adıyla: **reward hacking** (eşik gevşetme, testi kendine göre yazma, ikame ile geçti) ve **compound error** (üçüncü adımın çürüğü üstünde on adım).

Tavan yok. Küçük proje gibi konumlanmayacak. Rakip yapıyor diye küçülme yok.

---

## §4. İSTEKLERİM, tavizsiz (Damla'nın cümleleri, numaraları sabit)

**Ürün**
- 1.1 Fotoğraf + prompt = kalıp + flat. Sınırsız, tüm edge case'lere rağmen. Demo değil, gerçek ürün; "al dene".
- 1.2 Midjourney tarzı bölgesel edit: "şuraya fiyonk ekle", uzat/kısalt, yakayı değiştir.
- 1.3 CS = hesap ve matematik işi.
- 1.4 Kalıbın 36'sı gerçek dikilebilir beden; flat'in 36'sı ideal kadın bedeni (croquis).
- 1.5 Flat konvansiyonu şart: göğüs–bel–kalça tutarlı; bütün flat'ler aynı insana tasarlanmış gibi. İnsanların para vereceği şey bu.
- 1.6 Kumaş davranışı ve parça bölme araştırılacak; "aynı elbise, iki kumaş, iki kalıp"; negatif pay.
- 1.7 Parça sayısı: olabilecek en az ya da görseldeki kadar.
- 1.8 Çizim motorunda tech stack sınırsız zorlanabilir.
- 1.9 Sabit sözlük yok; Edge/Panel/Stitch primitifleri, dikiş tarzıyla → sınırsız kalıp.
- 1.10 Sadece kalıp+flat değil: rehber, püf noktaları, kumaşa göre kalıp; ileride üyelik, forum, iOS.
- 1.11 Geometri motoru kusursuz değil; sorun vision'da, JSON okuyucuda, herhangi bir yerde olabilir; kök neden.
- 1.12 Çıktı Buğra'nın kalıbına yaklaşıyor mu, ölçülecek (referans, ayar hedefi değil).
- 1.13 Repo temizlenecek; proje abartıldığı kadar zor değil.
- 1.14 Eski pattern/flat'lerin hiçbiri onaylı değil; silinsin; gerekirse hesap baştan.
- 1.15 Ölçüm hedef değil; hedef ürün. Branch yok, main.

**Orkestrasyon**
- 2.1 Damla router değil; sorular tarafsız ajana, Damla'ya soru yok.
- 2.2 Her faz taze ajan, işi biten ölür.
- 2.3 Adımlar arası compounding error kontrolü; önceki kabuller yeniden koşulur.
- 2.4 Reward hacking'e karşı tarafsız denetim; sonraki faz öncekinin çıktısına göre değişebilir.
- 2.5 Hakemin sorusu "kapı yeşil mi" değil: oldu mu bitti mi, alır mıydım, güçlü mü.
- 2.6 Sabah raporu yok; bitiş yeni turun başı.
- 2.7 Ajanlar taraf tutmaz; eleştirel cevap.
- 2.8 Darboğazda ajan doğurmak yok; aracı tamir et.
- 2.9 Alt-ajan doğurma yasağı.
- 2.10 Sonraki oturum için devir promptu.
- 2.11 LLM gereken yerde; para boşa yakılmaz; "olmuş gibi" yok.

**Edge case**
- 3.1 Sadece ön fotoğraf: en sade dikilebilir arka + uydurulduğu açıkça söylenir; arka fotoğraf varsa onu tasarla.
- 3.2 Bulanık/giysi olmayan fotoğraf, çelişkili prompt, uç beden, streç aşımı, dar en: adıyla.

**İş**
- 4.4 Landing: bayat veri, eski blog, patch notes silinir.
- 4.5 Aynı zemin/fontla iOS; ticari iş gibi.
- 4.6 Tavan yok.
- 4.7 Fiyat/pazar Damla'nın; ajan mesai harcamaz.
- 5.x Platform (üyelik, 2 hak, kredi, gardırop, ödeme, SEO) sonraki koşu; bu koşu zeminini bırakır. 5.8 güvenlik ürün bitince.

---

## §5. KULLANICININ YOLU

Koşunun omurgası. Her faz bu yolun bir adımını gerçek yapar.

| adım | kullanıcı ne yaşıyor | bugün (5 Eyl, ölçüldü) |
|---|---|---|
| 1. duyar | landing'de motordan çıkmış gerçek bir flat + dikilebilirlik tablosu görür | bayat landing, onaysız flat'ler |
| 2. atar | fotoğraf ya da cümle | ikisi de enum spec'e çevriliyor (39 enum tipi); "puff" demek zorunda |
| 3. görür | flat önizlemesi + motorun okuduğu tarif düz cümlelerle, uydurulan işaretli | flat var (onaysız), tarif cümlesi yok, uydurma ilanı yalnız arka için |
| 4. düzeltir | "kolu uzat" yazar, flat ve kalıp birlikte değişir | yok |
| 5. seçer | kumaş, beden | var: 5 kumaş, 34-44 |
| 6. indirir | kalıp PDF + katmanlı flat SVG + rehber + malzeme | var, ama çizim onaysız ve enum hattından |
| 7. diker | her dikiş çiftinin mm tablosu, pervaz, prova listesi | yok; 900 saatte toile yok |
| 8. döner | gardırop: aynı graf, yeni edit | localStorage spec; edit yok |
| 9. anlatır | flat'i vitrine/Instagram'a koyar | "çok çirkin" |

---

## §6. BUGÜN NEREDEYİZ (5 Eyl 19:00, ölçüldü)

- Graf IR yazıldı: Edge/Panel/Seam, 15 saf op, doğrulayıcı + sanal dikiş, 3 bedende 0 kırmızı (`docs/GRAF-IR.md`, `graf_*_check`). **Graftan çizim yok**: `KOSU/ciktilar/graf-ilk/` altında JSON ve tablo var, png yok.
- Beden sözleşmesi: gerçek36 + croquis36 + 34-44 (`contract/body-v1.json`). Flat konvansiyonu 5 emsalden ölçülmüş (`flat-convention-v1.json`, `flat-olcum.json`, `flat-secim.md`). Kalıp sayfa konvansiyonu (`pattern-sheet-v1.json`).
- Enum çekirdekte ana yol: **436 dallanma, 39 tip** (`enum_dallanma_check.sh --measure`). Vision ve prompt isim üretiyor (`backend/analyze-core.js`, `web/js/prompt-parse.js`).
- Kabul zinciri var: `DEVIR.md` "KABUL" bloğu (a) 27 ctest + flat-olcum + primitif + enum, exit 0; (b) iki bilinen kırmızı sayı piniyle.
- 5-6 Eyl koşuları: F0-F2a geçti, 16+ saat, 54 commit, sıfır görsel. Sebep §9'da.
- Canlı v152. Damla'nın "satarım" dediği flat yok. Toile yok.

---

## §7. FAZLAR

Sıralı, tek işçi, MacBook Air (build -j2, ctest hedefli, tam ctest yalnız P8). Her fazın altında **ADIM** (§5), **İSTEK** (§4 numaraları), **UX** (Damla ne görür), **KABUL** (`KOSU/kabul/PN.sh`, fazdan önce yazıldı, mühürlü; işçi dokunamaz), **DEĞİŞMEZSE** (bu faz bitmeseydi ürünün hangi cümlesi yanlış kalırdı).

### P1. Graftan çizim
`grafdegerle` (graf × Body → 2B paneller; `PanelKaynak` arayüzü, ilk uygulama Halka2B), `flatsvg` (croquis36, katmanlı `<g id=outline|seams|topstitch|details>`), `kalipsvg` (pattern-sheet stiliyle: etiket, grain, notch, kat, kesim/dikiş çizgisi). Eski `bodice/skirt/sleeve.cpp` formülleri kaynak, dallanma değil. Determinizm: aynı graf + beden → bayt-aynı SVG; wasm = native. 34-44 ölçekleme değil yeniden değerleme.
**ADIM** 3, 6. **İSTEK** 1.3, 1.4, 1.5, 1.9. **UX** `KOSU/ciktilar/graf-ilk/flat.png` emsal 13 yanında aynı ölçekte; `kalip-36.png`; `seri.png`. Buğra sayfası yanında kalıp: `_yerel/`. **KABUL** `KOSU/kabul/P1.sh`. **DEĞİŞMEZSE** "graftan kalıp ve flat çıkar" cümlesi yalan kalır. **Süre** 6-10 s. P1 geçmeden P2 yok.

### P2. Edit = op, görsel
8 edit graf üstünde, önce/sonra: yaka V, yaka 2 cm derin, etek 8 cm uzat, kol kısalt, bel fiyonk (attach), yan cep, etek ucu volan, kol büzgü (overlay). Her editte iki çıktı yenilenir; bölge dışı panel bayt-aynı.
**ADIM** 4, 8. **İSTEK** 1.2, 1.9. **UX** `KOSU/ciktilar/edit/kontak.png`. **KABUL** `P2.sh`. **DEĞİŞMEZSE** "Midjourney gibi edit" bir cümle olarak kalır. **Süre** 4-6 s.

### P3. Sınırsızlık testi
Buğra'nın 2 kalıbı, 9 eski kompozisyon, 5 emsal flat graf olarak yazılır (op dizisi). Yazılamayan → eksik op adıyla eklenir. Açık kusurlar burada: puf hacmi (overlay), K2/K5 (rolePart), kol silueti.
**ADIM** 9. **İSTEK** 1.5, 1.7, 1.9, 1.12. **UX** `flat-ayni-insan.png` (bel/göğüs/kalça tek hizada), **`emsal-vs-biz.png`** (emsalin grafla çizimi orijinalinin yanında — "iyi flat" sorusunun ilk cevabı), `_yerel/bugra-bindirme.png` (mm raporu; referans). **KABUL** `P3.sh`. **DEĞİŞMEZSE** "sınırsız" iddiası tek fixture'la sınırlı kalır. **Süre** 8-12 s.

### P4. Tek hat
Draft yolu graftan; `garment.cpp` enum dallanmaları ve kaplama blokları kalkar; web flat'i C++'tan alır (`flat-from-pattern.js` emekli); eski çıktılar silinir, aynı adlarla graftan yeniden üretilir (git rm, rg kanıtı, ayrı commit); golden yeniden pin (gerekçe commit'te); proje `CLAUDE.md`'deki "yeni giysi yok, Buğra'nın aynısı" satırı silinir (HEDEF kazanır).
**ADIM** 6. **İSTEK** 1.9, 1.13, 1.14. **UX** `once-sonra.png`. **KABUL** `P4.sh` (enum sevk yolunda **0**). **DEĞİŞMEZSE** 9. madde altıncı kez "kat çıkıldı" olur. **Süre** 8-12 s.

### P5. Prompt → graf
Deterministik parçalayıcı: cümle → op dizisi (kenar/panel/dikiş fiilleri; isim sözlüğü yok). Yetmezse backend LLM, çıktı yine graf-v1, şema + doğrulayıcı. Bilinmeyen: "absent" + yapılabilir adım. Çelişkili prompt: hangi iki cümle, ret.
**ADIM** 2. **İSTEK** 1.1, 1.9, 2.11, 3.2. **UX** `giris/giris-prompt-10.png` (10 prompt, 4'ü sözlük dışı). **KABUL** `P5.sh`. **DEĞİŞMEZSE** cümle hâlâ menüye çevrilir. **Süre** 6-8 s.

### P6. Fotoğraf → graf
Üç kaynak: (a) tarayıcıda poz landmark'ı, (b) giysi silueti → oranlar, (c) Claude vision graf tarifi (`analyze-core.js` yeniden; enum alanları gider). Parça sayısı görünür dikişlerden. Çelişkide ölçüm kazanır; LLM çıktısı şema + doğrulayıcı + ölçüm çelişki tablosundan geçer. Çevrimdışı çapraz doğrulama (SewFormer/ChatGarment) 20 fotoğrafta; koşmazsa deftere. Arka: ikinci alan; yoksa en sade + ilan. **Önizleme + düzeltme** üründe (§2'nin anı). Edge case'ler adıyla.
**ADIM** 2, 3, 4. **İSTEK** 1.1, 1.7, 1.8, 1.11, 3.1, 3.2. **UX** `giris/giris-foto-20.png` (landmark/siluet overlay), `giris/onizleme.png`. **KABUL** `P6.sh`. **DEĞİŞMEZSE** vaadin yarısı (fotoğraf) yok. **Süre** 10-16 s.

### P7. Terzilik
Kumaş → Body üstünde bölge bazlı bolluk alanı (dokuma +, örgü − = 1−1/streç); pervaz/tela graftan; en bölme yalnız zorunluysa (split); streç aşımı ret; malzeme listesi; rehber TR+EN kaynaklı, dikiş sırası graftan.
**ADIM** 5, 7. **İSTEK** 1.6, 1.7, 1.10, 3.2. **UX** `kumas-farki/kumas-farki.png` (aynı graf, cotton-lawn / cotton-modal-jersey / viscose-crepe → 3 kalıp, flat aynı). **KABUL** `P7.sh`. **DEĞİŞMEZSE** "kumaşa göre kalıp" bir katsayıdan ibaret kalır. **Süre** 8-12 s.

### P8. Ürün ve paket
`create.html` yabancı gibi (yerel + headless Chrome, timeout, izole profil). **Paket-03** (Damla'nın): fotoğraf kökenli, EU36, cotton-lawn: A4 PDF (test karesi, birleştirme, grain, notch, kat, pervaz), flat, TR+EN rehber, dikilebilirlik tablosu, malzeme, beden tablosu, prova kontrol listesi (beklenen sayılarla), graf JSON + kumaş + beden + motor damgası (gardırop kaydı). İndirme tek fonksiyondan (ileride `/api/pack`). Landing: bayat veri/blog/patch notes silinir; iddia motordan; fiyat yok. Repo temizliği ayrı commit'ler. Tam ctest, deploy, canlı ekran.
**ADIM** 1, 6, 7, 8. **İSTEK** 1.10, 1.13, 4.4, 5.7, HEDEF §4. **UX** `paket-03/`, `paket-03/ekran-*.png`, `canli-ekran.png`. **KABUL** `P8.sh`. **DEĞİŞMEZSE** Damla dikecek paketi bulamaz; "al dene" denemez. **Süre** 8-12 s.

### P9. Tur
Üç mercek sırayla, taze ajan, ürünü kullanır: dikişçi, tasarımcı, sözlük-dışı saldırgan (5 tarif + 3 edit + 2 zor foto + estetik). "Alır mıydım?" burada sorulur (2.5). Kusur → kök sebep katman adıyla → onarım → `sinyal.sh`. İki temiz tur; tavan 8.
**ADIM** hepsi. **İSTEK** 2.4, 2.5, 1.11. **UX** `tur-N/`. **KABUL** `P9.sh`. **Süre** tur 3-5 s.

Toplam 65-100 saat, 4-7 gün. "Sabaha" yok.

**Sonrası (mimari hazır):** Yüzey3B ikinci PanelKaynak (kapıları `KARARLAR.md` K3), platform 5.x, iOS, programatik SEO, fiyat (toile sonrası), güvenlik (5.8). Girdi dosyaları: `platform-plani.md`, `seo-plani.md`, `kusur-listesi.md`; `pazar-notlari.md` Damla'nın.

---

## §8. SİNYAL — koşu isteklerle nasıl karşılaştırılır?

Rabadon'daki desen: faz geçti mi diye değil, **istek kapandı mı** diye ölçülür.

1. **Kabul fazdan önce yazılır, mühürlenir.** `KOSU/kabul/P1.sh … P9.sh` bu belgeyle birlikte commit'lendi. `KOSU/muhur.txt` bu dosyaların ve mevcut testlerin sha256'sı. İşçi bunlara dokunamaz; dokunursa faz reddedilir (`sinyal.sh` mührü kontrol eder). İşçi yeni test yazabilir; kabul scripti o testi değil, **kendi ölçtüğünü** okur (png var mı, iki koşum diff boş mu, enum sayısı, ctest exit).
2. **`bash KOSU/sinyal.sh`** her faz sonunda ve her oturum başında koşar:
   - mühür (değiştiyse KIRMIZI),
   - `DEVIR.md` KABUL (a)+(b) zinciri (compounding error, 2.3),
   - kapanmış her fazın `kabul/PN.sh`'ı yeniden (2.3),
   - enum dallanma sayısı: `KOSU/sinyal.taban.json`'daki tabandan **yüksekse KIRMIZI** (kat çıkma dedektörü; P4'te taban 0 olur),
   - zincir testi: taban graf → kalıp + flat üçlüsü (P1'den sonra), prompt'tan (P5'ten sonra), fotoğraftan (P6'dan sonra),
   - `KARARLAR.md` "Madde defteri"ni basar: istek başına AÇIK / KISMEN / KAPANDI + kanıt.
   Tek satır hüküm, exit 0 ya da 1.
3. **Faz kapanışı üç satır:** ne değişti · ne DEĞİŞMEDİ · hangi istek numarası hangi kanıtla kapandı. "Ne değişmedi" boşsa faz süreç fazıdır, kapanmaz.
4. **Aynı faz iki devirde "sıradaki" görünürse DUR** — faz takip edilmiyor demektir; sebebi deftere.
5. Hakem ajanı yok (K6); "alır mıydım" P9'da ürünü kullanana sorulur. Fork olursa tek karar ajanı: **ölçüm ve teknik eleştiri**, karar değil; cevabı deftere.

---

## §9. BEŞ KÖK HATA VE PANZEHİRİ (rabadon devri 09-07 §8'den, stitchu için)

| hata | panzehir bu koşuda |
|---|---|
| Kabul ölçütünü işi yapan yazdı | `KOSU/kabul/*.sh` fazdan önce, mühürlü; işçi yeni kapı önerirse ayrı commit, ayrı gerekçe, ben onaylarım |
| Hedef listesi tekrarlandı, takip edilmedi | §4 numaraları sabit; `KARARLAR.md` madde defteri; `sinyal.sh` basar |
| Süreç ilerledi, iş yerinde saydı | her fazın DEĞİŞMEZSE satırı; kapanışta "ne değişmedi" zorunlu; enum tabanı yükselirse kırmızı |
| Darboğazda ajan doğuruldu | işçi brief'inde "alt-ajan doğurma"; 2 deneme; aynı hata iki kez → dur, ben aracı onarırım |
| Fiziksel doğrulama zorlanmadı | P8 paket-03 Damla'nın dikeceği paket + prova kontrol listesi; fiyat cümlesi toile'e kadar yok (K11) |

Hepsinin altındaki kural: **üstüne kat çıkma, temeli ölç.** Her iş emrinde ilk soru: bu, istenen şeyin kendisi mi, üstüne konan bir kat mı?

---

## §10. ORKESTRASYON — değişmeyen şartlar

1. Fazlar taze ajanla, işi biten ölür. Ana oturum transcript okumaz, raporu alır; iddiayı kendisi tekrar koşar.
2. Sorular Damla'ya değil tarafsız ajana; ajana taraf seçtirme: ölçüm ve eleştiri, karar değil.
3. Her ajan iddiası ana oturumda yeniden koşulur. "Geçti" ajanın sözüyle yazılmaz.
4. Compounding error her fazda: `sinyal.sh`.
5. Hedef kontrolü: faz §5'in bir adımını gerçek yapmıyorsa süreç fazıdır, koşuda yeri yok.
6. Bir adım = bir commit, push. Branch yok. Mesaj küçük harf İngilizce, co-author yok.
7. Makine: sıralı, -j2, hedefli ctest, tek Chrome, süreçler öldürülür.
8. Sayı koda gömülmez; contract'a kaynağıyla; kaynak yoksa DOĞRULANMADI. Sessiz default yok; ikame ile geçti yok; uydurulan ilan edilir.
9. Araştırma sırası: repo (`knowledge/`, `flatten-research/`, `docs/`, `contract/`), eski bulgular (garment-flattening, spec-diff, ChatGarment/SewFormer), sonra web.
10. `GIRDI/` commit'e girmez; telifli üretimler `KOSU/ciktilar/_yerel/`; `patterns_real/` bugün takipli (private), kazı Damla kararı.
11. Damla'ya giden tek şey: faz sonunda png yolu + `sinyal.sh` hükmü + defterde ne değişti. Damla'nın tek hükmü isteğe bağlı: "satarım / satmam"; "satmam"ın cümlesi deftere, faz yeniden açılır.
