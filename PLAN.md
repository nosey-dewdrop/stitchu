# PLAN — fotoğraf + prompt = kalıp + flat (5 Eylül 2026)

Otorite sırası: `HEDEF.md` (Damla'nın cümleleri) > `KARARLAR.md` (karar defteri) > bu dosya.
`DEVIR.md` §5 (tuzaklar) geçerli kalır; gerisi ve `~/Desktop/stitchu-kosu-yol-a.js` emekli. `DEVIR-PROMPT.md` yaşar: her faz sonunda `KARARLAR.md` "nerede kaldık"tan yeniden yazılır (yapıştırılacak metin: hangi faz geçti, açık kusur, sıradaki brief). Oturum düşerse yeni oturum onunla başlar, sıfırdan çözmez.
Yeni oturum sırayla okur: `HEDEF.md` → `KARARLAR.md` ("nerede kaldık" dahil) → bu dosya → `DERSLER.md` (batan yaklaşımlar).

## 0. Hedef, tek satır

Bir yabancı `create.html`'e fotoğraf ya da prompt atar, kumaş ve beden seçer; dikilebilir kalıp + satılır flat +
rehber indirir. Sınırsız giysi, sözlük yok. Edit doğal dilde. İlk paket Damla'nın dikeceği paket.

## 1. Bugün elde ne var, ne yok? (ölçüldü, 5 Eyl 19:00)

| Var | Yok |
|---|---|
| Graf IR: Edge/Panel/Seam, landmark + oranla; 15 saf op; doğrulayıcı + sanal dikiş; 3 bedende 0 kırmızı (`docs/GRAF-IR.md`) | Graftan **çizim**: kalıp SVG, flat SVG. `graf-ilk/` altında yalnız JSON ve tablo var |
| Beden sözleşmesi: gerçek36 + croquis36 + 34-44 grade (`contract/body-v1.json`) | Enum çekirdekte hâlâ ana yol: 436 dallanma, 39 enum tipi (`enum_dallanma_check --measure`) |
| Flat konvansiyonu sayıyla: 5 emsalden ölçülmüş kol açısı, tek croquis landmark'ları (`flat-convention-v1.json`, `flat-olcum.json`) | Vision ve prompt hâlâ **isim** üretiyor (`crew / vNeck / balloon`, `analyze-core.js`); graf üretmiyor |
| Kalıp sayfa konvansiyonu (`pattern-sheet-v1.json`), kumaş kataloğu 5 kumaş, negatif pay formülü | Kumaş bolluğu grafta alan değil, eski hatta katsayı |
| 58 hedef fotoğraf, 15 aday flat + 5 seçili emsal, Buğra'nın 2 gerçek kalıbı | Damla'nın "satarım" dediği tek flat yok; dikilmiş toile yok |
| Canlı site v152, worker (`/api/analyze`, Claude vision) | Eski 01-09 flat, paket-01/02: onaysız (madde 14) |

## 2. Neden iki ay döndük? Bu planda karşılığı ne?

| Geçmiş hata | Bu planda |
|---|---|
| Altyapı önce, görsel en sonda; 16 saatte bakılacak png çıkmadı | **Her fazın teslimi bir png.** Png'siz faz bitmemiş sayılır. Altyapı o png'nin gerektirdiği kadar yazılır |
| Session karar miras almıyor; yüzey ↔ enum ↔ graf salınımı (a-b-a) | **`KARARLAR.md`:** her mimari karar tarih + gerekçe + "şu ölçüm çürütürse değişir". Kilit değil; geri dönmek ölçüm ister |
| Hakem ajanları her turda kapsam büyüttü; F1 26 commit, 12'si araç kavgası; 3 deneme sinyalsiz | **Hakem ajanı yok.** Kapı = çalıştırılabilir test + png'ye ben bakarım. Faz başlamadan kabul ölçütü yazılı ve sabit; yeni bulgu deftere gider, faza değil. En çok 2 deneme |
| Aracın hatası iş sanıldı (vocab çırçırı) | Bir araç iki kez engelledi → aracı **ben** onarırım, ajana bırakmam |
| "Sabaha ürün" → yama, "geçti" raporu | Sabah sözü yok. Faz sürelerini yazıyorum (§4); toplam **günler**, bir gece değil. Bitiş yeni turun başı |
| 69 alt-ajan, milyonlarca token | İşçi ajan alt-ajan doğuramaz (brief'te yasak, ben izlerim); faz başına 1 işçi |
| Sözlük yeniden öneriliyor ("A-line, fermuar") | Taban giysi bir **graf**tır (`graf-ilk/graf.json`), adı yok; girişler graf üretir; menü kelimesi çıktı formatına giremez |
| Emsal yok, "güzel" ölçüsüz | Emsal: `flat-secim.md`'deki 5 deer-and-doe (ölçümleri contract'ta). Her flat png'si emsalin yanında aynı ölçekte basılır |
| Eski çıktıya parite kuruldu | Onaysız çıktılar P4'te silinir, aynı adlarla graftan yeniden üretilir |
| MacBook Air ısındı | Sıralı; build -j2; ctest hedefli; tam ctest yalnız deploy öncesi |
| Oturum düştü, yarım iş kayboldu | Her faz kendi commit'iyle biter; `KARARLAR.md` "nerede kaldık" satırı taşır |

## 3. Zincir (mimari, tek çizgi)

```
fotoğraf ──┐                                  Body(gerçek36 … 44) ──→ kalıp SVG/PDF + dikilebilirlik tablosu
prompt  ──┼─→ GRAF TARİFİ (graf-v1 JSON) ─→ doğrula ─→ ┤
edit    ──┘   (paneller, kenarlar, dikişler,           Body(croquis36)     ──→ flat SVG/PNG (katmanlı)
              landmark + oran, "uydurdum" notları)     kumaş → bolluk alanı + bölme + pervaz → rehber + malzeme
```

Tek yol. Enum bu çizgide yok. Kalıp ve flat aynı graftan, iki bedenden. Edit = grafa op, iki çıktı yenilenir.

## 4. Fazlar (sıralı; her satır: iş → png → kapı)

Süreler dürüst tahmin; geçilirse defterde neden yazılır.

| # | Faz | İş | Damla'nın göreceği png | Kapı (çalıştırılır) | Süre |
|---|---|---|---|---|---|
| P1 | **Graftan çizim** | `grafdegerle` (graf × Body → 2B paneller, PanelKaynak arayüzü), `flatsvg` (croquis36, katmanlı), `kalipsvg` (pattern-sheet stiliyle). Eski `bodice/skirt/sleeve.cpp` formülleri kaynak, dallanma değil | `graf-ilk/flat.png` emsal 13 yanında aynı ölçekte; `kalip-36.png` (yerelde Buğra sayfası yanında); `seri.png` (34-44). **P1 geçmeden P2 başlamaz** | determinizm (iki koşum diff boş), wasm=native, flat konvansiyon ölçümü (kol açısı, croquis landmark'ları ±2 mm), kalıp sayfa ölçümü, 34-44'te doğrulayıcı 0 kırmızı | 6-10 s |
| P2 | **Edit = op, görsel** | 8 edit graf üstünde: yaka V, yaka 2 cm derin, etek 8 cm uzat, kol kısalt, bel fiyonk (attach), yan cep, etek ucu volan, kol büzgü. Her biri önce/sonra | `edit/kontak.png` | edit-locality (bölge dışı panel bayt-aynı), her edit sonrası doğrulayıcı 0 kırmızı, iki çıktı da yenilendi | 4-6 s |
| P3 | **Sınırsızlık testi** | Buğra'nın 2 kalıbı + 9 eski kompozisyon + 5 emsal flat'i graf olarak yazılır (op dizisi). Yazılamayan varsa eksik op adıyla eklenir. Bilinen açık kusurlar burada kapanır (9.4, `kusur-listesi.md`): puf kol hacmi = `overlay` op (büzgülü üst katman), K2 prenses+roba ve K5 küp korse flat'i (`rolePart` ile), kol silueti (manşete daralma) | `flat-ayni-insan.png` (tüm flat'ler yan yana, bel/göğüs/kalça çizgisi tek hizada); **`emsal-vs-biz.png`**: 5 emsalin grafla yeniden çizimi orijinalinin yanında — "iyi flat" sorusunun ilk gerçek cevabı, fark gözle ve mm; `bugra-bindirme.png` (yerel) | flat_ayni_insan ±2 mm; Buğra bindirme mm raporu (hedef değil, referans) | 8-12 s |
| P4 | **Tek hat** | `garment.cpp` draft yolu graftan geçer; enum dallanmaları ve kaplama blokları kaldırılır; web flat'i C++'tan alır (`flat-from-pattern.js` emekli); eski çıktılar silinir, aynı adlarla yeniden üretilir; golden yeniden pin (gerekçe commit'te) | `once-sonra.png` | `enum_dallanma_check` sevk yolunda **0**; 4 ilanlı kırmızı (flat_artifact_census, style_check, sizechart_source_check, figure_check) ya kapanır ya ilanı güncellenir, beşinci yok; silinen dosya listesi commit'te (rg kanıtı) | 8-12 s |
| P5 | **Prompt → graf** | Deterministik parçalayıcı: cümle → op dizisi (sözlük değil, kenar/panel/dikiş fiilleri). Yetmezse backend LLM, çıktı yine graf-v1 (şema doğrulamalı). Bilinmeyen: adıyla "absent" + yapılabilir adım. Çelişkili prompt ("kolsuz uzun kollu"): hangi iki cümle çeliştiği yazılarak ret | `giris-prompt-10.png` (10 prompt, 4'ü sözlük dışı: "bel hizasında fiyonklu tek omuz asimetrik", "kimono kollu wrap", "korse üstlü balon etek", "keyhole yakalı dropped waist") | prompt_graf_check: 10/10 graf doğrulayıcıdan geçer, hiçbiri sessizce başka giysiye dönmez | 6-8 s |
| P6 | **Fotoğraf → graf** | Üç kaynak: (a) tarayıcıda poz landmark'ı (MediaPipe pose; kurulamazsa deftere), (b) giysi silueti → oranlar (mm değil), (c) Claude vision **graf tarifi** üretir (`analyze-core.js` yeniden yazılır; enum alanları gider). Parça sayısı fotoğraftaki **görünür dikişlerden** okunur (madde 7); dikiş yoksa panel yok. Çelişkide ölçüm kazanır. LLM çıktısı üç kapıdan geçer: şema, graf doğrulayıcı, (a)/(b) ölçümüyle çelişki tablosu. Çevrimdışı çapraz doğrulama: SewFormer / ChatGarment ile 20 fotoğrafta panel sayısı + dikiş topolojisi uyum tablosu (Air'da koşmazsa deftere, sessiz atlama yok). Arka: ikinci fotoğraf alanı; yoksa en sade arka + görünür ilan. **Önizleme + düzeltme:** indirmeden önce flat + düz cümle tarif + yazıyla düzeltme (P2 op'u). Edge case'ler adıyla: bulanık / giysi olmayan / birden fazla giysi / kısmi görünen fotoğraf → ret + neden + "şöyle çek"; uç beden yok (seçim 34-44); streç aşımı ve dar en P7'de. Tablo `edge-case-tablosu.md` P5-P7 boyunca dolar, P8'de kapanır | `giris-foto-20.png` (20 foto, 2 ön+arka çifti, landmark/siluet overlay); önizleme ekranı png | foto_graf_check 20/20 doğrulayıcı geçer; arka_koken; edge_case tablosu güncel; yerelde koşar (anahtar/CORS ENV.md) | 10-16 s |
| P7 | **Terzilik** | Kumaş → Body üstünde bölge bazlı bolluk alanı (dokuma +, örgü − = 1−1/streç); pervaz/tela graftan türetilir; en bölme yalnız zorunluysa (split op, grain + notch); streç aşımı adıyla ret; malzeme listesi (fermuar boyu, düğme, tela, iplik, metraj); rehber TR+EN, kaynaklı; dikiş sırası graftan | `kumas-farki.png` (aynı graf, katalogdan 3 kumaş: cotton-lawn / cotton-modal-jersey / viscose-crepe → 3 kalıp, flat aynı) | kumas_kalip (3 kalıp farklı, flat bayt-aynı), pervaz olmadan "dikilebilir" verilmez, rehber_kaynak | 8-12 s |
| P8 | **Ürün ve paket** | `create.html` yabancı gibi: prompt, foto, önizleme, düzeltme, kumaş, beden, indir. **Paket-03** (Damla'nın): fotoğraf kökenli, EU36, cotton-lawn: A4 PDF (test karesi, birleştirme, grain, notch, kat, pervaz), flat, TR+EN rehber, dikilebilirlik tablosu (her dikiş çifti mm), malzeme, beden tablosu, prova kontrol listesi (beklenen sayılarla), graf JSON + motor damgası. Landing: bayat veri, eski blog, patch notes silinir; iddia motorun yaptığı şey, kanıt canlı dikilebilirlik tablosu (elle sayı yok); fiyat cümlesi yok (toile dikilene kadar); "fotoğrafını at, düzelt, indir" 3 ekran. Repo temizliği (rg kanıtlı, ayrı commit'ler) | `paket-03/ekran-*.png`, paket dosyaları | pdf-verify, techpack-verify, tam ctest, deploy, canlı curl + ekran | 8-12 s |
| P9 | **Tur** | Üç mercek sırayla, her biri taze ajan, ürünü kullanır: dikişçi, tasarımcı, sözlük-dışı saldırgan (5 tarif + 3 edit + 2 zor foto + estetik: flat emsal yanında). Kusur → kök sebep (katman adıyla) → onarım → ben ölçerim. İki temiz tur | `tur-N/` ekranlar | tavan 8 tur | tur 3-5 s |

Toplam: 65-100 saat iş (P9 iki temiz tur dahil). Yani 4-7 gün, makine ve oturum düşmeleriyle. Bunu "sabaha" diye satmıyorum.

**P8 içinde platform hazırlığı (ucuz, yapılır):** paket içinde graf JSON + kumaş + beden + motor damgası (gardırop kaydı = bu; aynı JSON aynı paketi üretir); indirme tek fonksiyondan geçer ki ileride `/api/pack` ile sunucuda sayılabilsin (kota istemcide sayılmaz).

**Girdi dosyaları (okunur, plana veri):** `KOSU/ciktilar/kusur-listesi.md` (açık kusurlar → P3/P4/P9), `platform-plani.md` (kota /api/pack, iyzico, ETBİS, iOS Origin→guard.js), `seo-plani.md` (~250 sayfa, hesaplayıcı sayfaları, wasm SEO sayfasına yüklenmez, llms.txt), `pazar-notlari.md` (Damla'nın, dokunulmaz).

**Sonrası (mimari hazır, bu planda yapılmaz):** Yüzey3B ikinci PanelKaynak (kapıları defterde: NaN yok, <500 ms, dikiş
uzunluğu ±0.5 mm, kol/yaka yüzeyden), platform (hesap, 2 hak, kredi, gardırop = graf JSON + motor damgası, ödeme), iOS
(aynı tokenlar, aynı motor), programatik SEO (her sayfa gerçek motor çıktısı), landing fiyat cümlesi (toile dikilince), güvenlik açıkları (5.8: ürün bitince kapatılır; secret sızmaz kuralı bugün de geçerli), XPBD drape / 3B önizleme (olsa hoş, Yüzey3B geçerse).

## 5. Her fazda değişmeyen kurallar

- **Zincir testi:** P1'den itibaren taban graf her fazın sonunda uçtan uca koşar (graf → kalıp + flat). P5'ten itibaren prompt'tan, P6'dan itibaren fotoğraftan. Bir faz zinciri kırdıysa geçmez. "Hedeften şaştık mı?" sorusunun ölçülebilir hali bu.
- **Önceki kapılar yeniden koşar** (compounding error). Kızaran varsa ilerleme yok.
- **Araştırma sırası:** önce repo (`knowledge/`, `flatten-research/`, `docs/`, `contract/`, eski koşu bulguları: garment-flattening, spec-diff edit, ChatGarment/SewFormer), sonra web. "Yapan nasıl yapmış" çevrilir, sıfırdan icat edilmez; kaynak yazılır.
- **DERSLER.md batan listesi geçerli:** sessiz enum fallback yok, ikame ile geçti yok, png'ye bakmadan "iyi" yok, rehber gerçek kenardan türer (şablon değil), parça listesi ↔ rehber ↔ PDF aynı sayı, Türkçe glyph kontrolü, uydurma eşik yok.
- **LLM:** prompt hattında önce deterministik, LLM yalnız fallback; fotoğrafta fotoğraf başına tek çağrı; çıktı her zaman şemalı graf JSON, kod/SVG değil. Para sayılır, "olmuş gibi" gösterilmez.
- **Brief taraf tutmaz** (2.7): işçiye "şunu doğrula" değil durum + kabul ölçütü verilir; eleştirel, iyileştiren cevap istenir.
- **Tavan yok** (4.6): rakip yapıyor diye küçültme yok; "onlar yapıyorsa biz farklı ve iyisini yaparız". Rakip cümlesi denenmeden kurulmaz.
- **Pazar/fiyat ajan işi değil** (4.7): fiyatlandırma, pazar araştırması, rakip listesi Damla'nın; ajan mesai harcamaz, `pazar-notlari.md`'ye dokunmaz.
- **Sayı koda gömülmez;** contract'a, kaynağıyla. Kaynak yoksa `DOĞRULANMADI` yazılır, uydurulmaz.
- **Sessiz default yok:** bilinmeyen tarif adıyla reddedilir + en yakın yapılabilir adım. İkame ile "geçti" yok.
- **Uydurulan her şey ilan edilir** (arka, kapak yüksekliği, oran): graf `notes` + pakette kapak cümlesi.
- **Reward hacking listesi:** eşik gevşetme, testi kendine göre yazma, özel-durum if'i, Buğra'ya sabit, hakemden önce golden pin, geometriyi JS'e kaçırma, alan dışı dosya. Görürsem geri alınır.
- Branch yok, main. Commit küçük harf İngilizce, co-author yok. Faz bitince push.
- `GIRDI/` okunur, commit'e girmez (gitignore). `patterns_real/` bugün HEAD'de takipli (repo private); geçmiş kazısı Damla kararı, plan buna dokunmaz. Buğra/V&A içeren üretilmiş görseller `KOSU/ciktilar/_yerel/` (gitignore).
- Proje `CLAUDE.md`'deki "Buğra'nın 2 kalıbının aynısını çıkar, yeni giysi yok" (29 Tem) satırı `HEDEF.md` (5 Eyl) ile çelişir; HEDEF kazanır, satır P4 temizliğinde silinir.

## 6. Kim ne yapar? (ajan modeli, HEDEF §3'e göre)

- **Ben (bu oturum):** plan, brief, kapıları koşmak, png'lere bakmak, aracı onarmak, defteri tutmak, commit'i doğrulamak. Hakem benim; ayrı hakem ajanı yok.
- **İşçi:** faz başına bir taze ajan, işi bitince ölür (HEDEF 3.2). Brief: hedef cümlesi, dosya alanı, kabul ölçütü, yasaklar, makine kuralı, "alt-ajan doğurma". Aynı hata iki kez → durur, bana yazar; ben aracı onarırım.
- **Karar:** Bir fork gerçekten iki yollu ve HEDEF'ten çözülemiyorsa tek bir taze karar ajanı, tek soru, cevabı `KARARLAR.md`'ye. Damla'ya soru gitmez (HEDEF 3.1).
- **"Alır mıydım?" sorusu** (HEDEF 3.5) hakem ajanına değil, P9'da ürünü **kullanan** denetçilere sorulur; "almazdım" dediği sürece kusur listesi boş olamaz, onarılır, tekrar sorulur.
- **Damla:** png'ye bakar, isterse "satarım / satmam" der. Bakmazsa koşu durmaz.

## 7. Bu plan HEDEF'in hangi maddesini nerede kapatıyor?

Canlı defter (9.5) `KARARLAR.md` "Madde defteri" bölümünde: her faz sonunda madde başına AÇIK / KISMEN / KAPANDI + kanıt yolu. Aşağıdaki tablo statik haritadır.

| HEDEF | Faz |
|---|---|
| 1 fotoğraf + prompt = kalıp + flat | P5, P6, P8 |
| 2 edit, Midjourney gibi | P2 (op), P6 (önizlemede düzeltme) |
| 3 hesap/matematik | P1 determinizm, sanal dikiş, parite |
| 4 iki beden | P1 (gerçek36 kalıp, croquis36 flat) |
| 5 konvansiyon, aynı insan | P1 kapı, P3 flat-ayni-insan |
| 6 kumaş, bölme | P7 |
| 7 en az parça | P7 (bölme yalnız zorunlu), P3 (Buğra parça sayısı) |
| 8 tech tavanı yok | P6 landmark/siluet; sonrası Yüzey3B |
| 9 sözlük yok | P4 enum 0, P5/P6 girişler graf üretir |
| 10 rehber, püf, ileride üyelik/iOS | P7, P8; mimari §4 sonrası |
| 11 sorun her yerde olabilir | P9 kök sebep katman adıyla; P6 üç kaynak çelişki görünür |
| 12 Buğra yakınlık | P3 (referans, ayar hedefi değil) |
| 13 repo temizliği | P4, P8 |
| 14 eski çıktı silinir | P4 |
| §2 edge case'ler | P6 |
| §4 Damla diker | P8 paket-03 |

## 8. Damla nereye bakar?

Her faz bitince tek mesaj: png yolu + kapı çıktısı (sayı) + defterde ne değişti. Yollar:
P1 `KOSU/ciktilar/graf-ilk/{flat.png, kalip-36.png, seri.png}` · P2 `KOSU/ciktilar/edit/kontak.png` ·
P3 `KOSU/ciktilar/{flat-ayni-insan.png, emsal-vs-biz.png}` · P4 `KOSU/ciktilar/once-sonra.png` ·
P5 `KOSU/ciktilar/giris/giris-prompt-10.png` · P6 `KOSU/ciktilar/giris/giris-foto-20.png` + `onizleme.png` ·
P7 `KOSU/ciktilar/kumas-farki/kumas-farki.png` · P8 `KOSU/ciktilar/paket-03/` · P9 `KOSU/ciktilar/tur-N/`.
Damla'nın tek hükmü isteğe bağlı: "satarım / satmam". "Satmam" derse neyi, tek cümle; o cümle deftere girer ve o faz yeniden açılır.
