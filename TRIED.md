# YAPILANLAR — denenmiş yollar (bir daha denenmesin)
> Kaynak: 3 aylık koşu defterleri, çöpten çıkarıldı 13 Eyl 2026.
> Kapsam: Tem–Eyl 2026, 1725 commit, 150 ayrı kapı, `_cop/` + `~/stitchu-arsiv/`.

## 1. DENENDİ VE OLMADI

- **GarmentCode/pygarment korpus koşusu** | 500 tasarım istendi, 472 kalıp üretti, 318'i jeneratörün KENDİ kapısını geçti, **202'si "green and unsewable"** — kapı sadece kendini kesen konturu arıyor, dikişin iki tarafını hiç kıyaslamıyor | `motor/pattern-bridge/corpus.py`, commit `5faadee3` (2 Ağu). Köprü 11.547 satır, terk.
- **MTM (ölçüye göre kalıp)** | 29 Tem'de kanıtla öldürüldü: ZOZO, unspun, Fayma battı, Lekala kalite tavanına çarptı; "çevre şekli belirlemez — aynı büstte iki beden farklı kalıp ister" | `_cop/README.md`. Yerine sabit beden EU34-48.
- **2B Aldrich formül draft'ı ana hat olarak** | KÖK KUSUR ilan edildi: flat bir ÇIKTI, primitif değil. Ama **yerine geçen 3B yüzey hattı müşteriye hiç ulaşmadı** — 25 Ağu ölçümü: `grep -c` WASM derleme listesinde yüzey dosyaları (surfacepattern, flatten, curvefit, bodysurface, garmentshell, shellprojection) = **0**, `garment.cpp` = **2**. 36 kaynak dosyanın hiçbiri yüzey hattından değil. Yüzey ctest'te koşuyor, alıcıya varmıyor | `_cop/README.md` §uyarı
- **A4 "çizim güzelleşsin" turları — 24+ tur, 29 hakem raporu, kapanmadı** | Hakem her tur İNTERNETTEN farklı satıcı seti çekti; skor gürültü oldu, yükselen eğri YOK: 3/11 → 10/11 → 0/11 → 7/11. Tur 26'nın iki hakemi AYNI png setine AYNI saatte ikisi de 0/11 verdi | `_cop/0911-kapanis.md`, `_cop/1209-kosu.md` §0, `_cop/hakem/A4/` (34 dosya)
- **"11/11 iki tur üst üste" kabul şartı** | Hakem dağılımı 0-10 arası oynadığı için ulaşılabilir değil, ölçüldü | `_cop/0509-ilerleme.md` (10 Eyl notu)
- **Kapıyı elle veriyle geçmek** | Son 14 commit'te `onbellek` dosyalarına **3720 satır elle** yazılmış, çiziciye **168 satır kod**. Her faz elle veri düzelterek geçti, bir sonraki fotoğrafta çöktü | `_cop/0911-kapanis.md`
- **Bindirme (overlay) hakemi** | Bozuk çıktıya doğru hüküm verdi ama insan elinden çıkmış ALTIN kopyaya da "SATILMAZ" dedi. Sebep hakem değil HİZALAMA: etsy-10'da iki model var, flat yanlışının üstüne oturdu. Kenar-enerjisi hizalaması → flat iki modelin ARASINA düştü. Satıcı flat'ini otomatik bulma → ayrım zayıf (varyans 64 vs 56) | `_cop/1209-kosu.md` §2, `_cop/goz.mjs`
- **Piksel metriği hakem olarak** | Bozuk çizim 0.805/0.777/0.043 — altın 0.805/0.770/0.050. Gözle biri giysi bile değil ama SAYILAR AYNI | `_cop/0911-kapanis.md`
- **MediaPipe poz landmarker (kaynak a)** | Self-host, headless Chrome'da fiilen koştu; **5 fotoğrafın 1'inde** kullanılabilir sonuç. Model İNSAN pozuna eğitilmiş, girdi müze mankeni/askı çekimi. mary-quant'ta güven 0.180 (eşik altı) | `_cop/docs/A3-FOTOGRAF-OKUMA.md`
- **Silüet ölçümü (kaynak b) tek başına** | biba-O120579'da `enGenis/omuz = 2.1558` (omzun iki katı) saçma sayı; bel konumunu 0.4894 verdi (gerçek 0.405 — kolların gövdeye yaklaştığı yeri bel sandı) | aynı dosya
- **Prompt'a kural ekleyerek `pens` kaçağını çözmek** | Prompt pensi ÜÇ yerde anlatıyor (satır 317-331 tanım, 6a-2 yer, son kontrol listesinde 3 madde), yine kaçıyor. N3 11 denemede aynı duvara çarptı. **Prompt 24k karakteri geçince sonuç 0/5'e ÇÖKÜYOR** | `_cop/1209-devir.md`
- **Sıfır-shot CV (CLIP/SigLIP)** | Ölçüldü: CLIP %44, SigLIP %65, Opus öğretmen %86 (19 fotoğraf, göz etiketli). "zero shot dead end" | commit `647c080c`. Öğrenci modeli `_cop/vision-student/` terk.
- **CV korpusu büyütme** | 778 fotoğrafta durdu — ücretsiz CC kaynaklarının pratik tavanı; binler için ek kaynak gerekiyor. 166 MB ölü vision raster silindi | commit `e0901cf0`, `d11a0417`
- **Müze/podyum fotoğraflarıyla sınamak** | Denendi ve ELENDİ: 3/4 açı, desen, kalabalık arkaplan — imkansız kapı kurmak olurdu | `_cop/muhur-foto.txt`
- **Croquis oran sayılarını contract'a yazmak** | Blog seviyesi ve çelişkili (omuz 2 baş mı 1.5 baş mı). Flat croquis'ten DEĞİL POM'dan çizilir, 1:8 ölçekte | `_cop/0911-kapanis.md`
- **Negatif payı formülle hesaplamak** | Formül %75 streç için %43 diyor, sektör tablosu %5. Motor TABLOYU alacak | `_cop/0911-kapanis.md`
- **Sessiz enum fallback** (puff→None, neckline→Crew, skirt→ALine) | Bilinmeyene varsayılan atamak = halüsinasyon. `sleeveStyle:'puff'` motorda yok, `sleeveCap='puffed'` ayrı eksende yaşıyor | `_cop/docs/DERSLER.md`, `_cop/KOSU-kalan/ciktilar/0509-saglik.md`
- **İkame ile sahte GEÇTİ** | id31/44: square yerine crew çizilince hakem "geçti" gördü, spec square'di. Geri alındı | `_cop/docs/DERSLER.md`
- **A0 ölçek-down %69.4** | "Kalibrasyon karesine göre büyütün" = fiziksel hatayı müşteriye atmak | aynı
- **Şablon-tabanlı kılavuz metni** | Motor "babydoll görünce princess/gore/biye" istatistik ortalaması uydurdu | aynı
- **`benchmark-58` gerçek-ürün skoru** | Korpus repoda YOK (telifli, gitignore), ayrıca paralı canlı worker çağrısı gerekiyor. "27/54 sıkı, 37/54 gevşek" sayısının bugün çalıştırılabilir sağlayıcısı yok | `_cop/README.md`
- **10 farklı dosyada 10 farklı sayaç** | Proje kendini bununla tıkadı; 24/103 · 27/54 · 37/54 üçü de 16 Ağu'da silindi | `_cop/docs/DERSLER.md`
- **Koşucu/orkestrasyon düzeni (A1-A13, G1-G4, F1-F10)** | 3 kez DURDU, hepsi bütçe aşımı: A1 26 commit/9.27 saat (tavan 12/5), A2 13 commit/3.05 saat, A3 13 commit/2.0 saat. Ürün kusuru değil protokol hatası | `_cop/0509-DURDU.md`, `_cop/0509-ilerleme.md`
- **Türkçe glyph kırpılması** | ğ/ı/ş font subset'e girmeyince üç kalıpta üç kez bozuldu | `_cop/docs/DERSLER.md`
- **v1 "cut on fold varsayılan"** | Sektör standardı CUT 1 PAIR; katlama İSTİSNA | aynı
- **3B yüzey hattı (Yüzey3B)** | Temmuz'da mühürlendi, 1 Eyl'de BIRAKILDI: NaN üretiyor, 7-30 s sürüyor (kapı <500 ms), omuz/kol/yaka yüzeyden çıkmıyor | `0509-kosu.md` K3
- **`ring-trace-locket-front-38.json`** | 1626 mm'sinin **652 mm'i "bridge" = düz çizgi tahmini (%40 uydurma)**; meşhur "257 mm hayalet" buradan çıktı. Kullanma, `geometry-full.json` kullan | arşiv L387
- **Kontura bakarak parça eşleme (`_same_piece`)** | Beş panel aynı yamuk göründüğü için "tek çizim beş kere kes" diyordu; gerçek kenar açıkları 9.58/13.19/19.07/22.67/32.25 mm | arşiv L97
- **Renk filtresiyle çentik atama** | Arka oyuk çentiği arc 87'de ve kalem rengi onu atmıştı; renk-filtreli cevap düzeltilmiş hatta **107.4 mm** sapıyor | arşiv L415
- **EU38'de dondurulmuş KESİR bel kesiği** | 48 kombinasyonun 42'si düştü, FAIL 532 — kesir bedenin bel segment oranını koruduğunu varsayıyor, korumuyorlar | arşiv L125
- **Snap toleransının kesir olması** | 72.6 cm belde 7.3 mm = 0.79375 mm üretim standardının 9 KATI. `SNAP_CM = 0.01` oldu | arşiv L260
- **A2'de "bel +20 mm bozulunca kapı kırmızı basmalı" yanlışlaması** | Şartın KENDİSİ kusurlu: beden düzeyinde dikişin iki tarafı da aynı `girth.waist`'ten türediği için birlikte ölçekleniyor. +20→0.7342, +40→1.4033, +60→2.0723 mm (eşik 2.0 ancak 60'ta aşılıyor). Graf düzeyine taşınınca 0.0652 → **20.0652 mm** | `0509-kosu.md` §5.5
- **A2'nin üç satış engeli (hakem DUR)** | (a) 5 panelde `closure` null, arka `onFold=true`, bel 685 < göğüs 900 mm → giyilemez; (b) `dartLeg`=0, yarım bedende **107.5 mm** supresyon hiçbir şeyce emilmiyor; (c) `sanalDikisMM=0.00` VACUOUS — 6 dikişin 5'i `ringQuarter = G/4` özdeşliğinden geliyor | `0509-kosu.md` §5.0
- **`sanalDikisMM` geçidi elden besleniyordu** | Değer `KAPI_SANAL` ORTAM DEĞİŞKENİNDEN okunuyordu (`0509-kapi.sh:539`); artifact'te 8 bedenin gerçek sayısı var ama geçit onu OKUMUYOR. Onarılmadı | `0509-devir-notu.md`
- **Referans kilidi hiç kurulmamıştı** | commit `94a08a27` mesajı "lock set" diyor, chmod git'te izlenmez, 217 dosya yazılabilir kalmıştı | aynı
- **`04-arap-BUGGY-do-not-trust.py`** (%257 strain, arşiv L459) · **kemersiz `SkirtManyPanels`** (n=4/5/6/8 ayna hatası, 840 açık matris hücresinin HEPSİ bu, sebep DOĞRULANMADI, arşiv L289)
- **`CMAKE_BUILD_TYPE` boş bırakmak** | engine_check 19 s → **2684 s**; push kapısı (900 s) hiç geçemedi | arşiv L86
- **Site flat indirme düğmesi hiç çalışmadı** | `web/js/create.js:1327` `siluetOkumasi()` gövdesi `return null;` → `flatSVG()` her zaman `ERR_OKUMA_YOK` | `KOSU.md`
- **Ödeme altyapısı hiç kurulmadı** | `grep -rniE "stripe|checkout|gumroad|lemonsqueezy|paddle" web/ backend/` → tek eşleşme bir CSS değişkeni. Site 8 "Waitlist" + 2 "Join the Beta", **0 fiyat, 0 checkout**. Aynı kusur 5 turda 5 kez rapor edildi | `KOSU-kalan/ciktilar/kusur-listesi.md`
- **`pages.yml` 27 Ağu'dan beri HER koşu `failure`** | Landing onarımı push edilse bile yayınlanamazdı | aynı
- **`size-coverage-check.mjs` ölü hattı ölçüyordu** | `web/atolye.html`'in `draw()`'unu koşuyordu, commit `9483ba53` o sayfayı sildi (2027 satır) → kapı sonsuza kadar `exit 2`, **TÜM deploy hattı kilitli kaldı** | aynı
- **Kademeli etek `ruffleFullness 2.5` üç kez bileşik uygulandı** | Kesim uzunlukları 2397 → 5993 → **14981 mm**; bitmiş etek ucu **15 metre**. Çizimi katman sayılarına oturtma denemesi viewBox'ı 15151 mm yapıp BOŞ SAYFA verdi, elle geri alındı. Gerçek kademeli eteklerde oran ~1.3-1.6; 15 referansın HİÇBİRİ kademeli değil | aynı
- **`paket-02` (21 dosya, 8 PDF) ürün değil ŞABLON** | Eski motor/spec hattından, silüet okuma hattı kurulmadan üretildi; hiç dikilmedi | `KOSU.md`
- **BFF ve OptCuts** | ROADMAP'te aylardır "✅ ALINIR — araştırıldı, lisansı temiz, karar verildi", ama `core/third_party/` ikisini de İÇERMİYOR. Yerine flattener elle yazıldı ve bir gece conditioning debug'ına gitti | `scripts/karar-lint.py`
- **`style_check` BOŞ KOŞUYORDU** | `engine/STYLE-PIN/` diskte yoktu, test "PASS (nothing to enforce)" basıp yeşil görünüyordu; ilan edilen çıkış scripti hiç yazılmamıştı | aynı
- **`run-all.sh` H2/L2 kapı DEĞİLDİ** | `ctest | grep` boru hattının exit kodu **grep'in** kodu; h10_gate_check kasten kırmızıyken boru hattı **exit 0** döndü. H1b `|| true` idi — defterin KAYBOLMASI bile yeşil geçiyordu | `engine-check/harness/run-all.sh`
- **`h10_gate_check` ÖLÜ** | `DISABLED TRUE`, 116 testin devre dışı olan TEK testi; yargıladığı `surfacepattern` `engine/src`'den **sıfır kez** include ediliyor | `docs/KATMAN-HARITASI.md`
- **`flat_convention_check` düzeltmeyi ENGELLEDİ** | `measureCroquis()` omuz ucunu "x'in ilk yerel maksimumu" diye buluyor — bu sezgi sadece omuz göğüsten genişse doğru, yani kapı düzeltilmeye çalışılan kusurun kendisini varsayıyor. Omuz içeri alınınca 27.00/153.00/750.00 mm sapma bastı | `knowledge/ETSY-KAPISI-GEOMETRI-2026-08-23.md`
- **`gradeset.sh` sevk edilmeyen motoru yargılıyordu** | `taban.sh` surface-pattern'i, `gradeset.sh` GarmentCode hattını koşuyordu — 8 bedeni **iki ayrı harness, iki ayrı motorda** gradeliyorduk | TUR 15
- **Kol parçalarının kendi ekseni ÇIKARILAMADI** | Üst/Alt Kol nest'te döndürülmüş ve hilal şekilli; ne eksene hizalı tarama ne min-alan dönük kutu doğru eksen veriyor (Üst Kol 89.0°'de uç genişlikleri 8 ve 7 mm = anlamsız) | aynı
- **Ön Beden profili kullanılamadı** | pens dış konturu kesiyor, tarama %60'ta 176.06, %70'te 300.00 mm gibi zıplayan sayı veriyor | aynı
- **`extendPiece()` bel penslerini siliyordu** | `engine/src/garment.cpp:63` → `result.markings.clear()`; beli geçen üstte `shaping=dart` olsa bile pens YOK. Fitted üst yan dikişi 244.2 (koltukaltı) → 244.4 (etek) = **0.2 mm GENİŞLİYOR** (kutu) | `kusur-listesi.md`, `bugra-rapor.md`

## 2. DENENDİ VE ÇALIŞTI (koru, yeniden yazma)

- **Göz hakemi — ölçütü girdinin kendisi** | İlan görseli (fotoğraf + satıcının flat'i) SOLA, bizim çizim SAĞA, 4 bölge, 3 koşu ORTANCASI. İyi çizim 4/4, bozuk 1/4, yayılım 3→0. Altın kopyanın KENDİ eksiğini yakaladı (etsy-08 peplum) | `_cop/goz.mjs`, `_cop/1209-devir.md`
- **Kapı = script exit kodu, ajan hükmü değil** | 5 evrensel kural: E1 elle-veri, E2 eşik-düşürme, E3 mühür, E4 sözlük büyümesi, E5 sabit-menü. İlk koşusunda yarım kalan tur 29'u yakaladı (siluet.json elle düzenlenmiş + çiziciye `pili` case eklenmiş 19→20) | `_cop/kapi.sh`, `_cop/0911-kapanis.md`
- **Altın kopya + sızıntı denetimi** | 5 fotoğrafın elle yazılmış okuması; okuyucu görmez, kapı ayrıca denetler. Yanlışlandı: kendisiyle GEÇTİ, başka giysiyle KALDI, boş okumayla KALDI (3/3) | `_cop/altin/`, `_cop/altin-kiyas.mjs`
- **Tek flat hattı (G2)** | Çizici `web/lib/siluet-ciz.js`'e TAŞINDI (kopya değil): eski ve yeni aynı okumadan BAYT-AYNI SVG (4068 bayt, cmp temiz). 3 rakip çizici silindi; `js.dallanma` 18→6, `js.sabitMM` 2→0 | `_cop/0911-kapanis.md`
- **Graf-IR / dikilebilirlik doğrulayıcı** | 8 bedende (gercek36, croquis36, EU34-44) `sanalDikisMM = 0.00` / eşik 2.00, tüm dikiş çiftleri ve 5 halka 0.00 artık. 14 negatif örnek hepsi doğru kırmızı bastı | `_cop/graf-ilk/dikilebilir.md`, `dikilebilir-negatif.md`
- **LLM JSON yazar, kod DEĞİL** | Model asla .svg/.html üretmez, sadece kapalı-enum şemalı JSON. Projenin asıl mimari kararı | `_cop/docs/DERSLER.md`
- **Golden byte-identical testi + round-trip invariant** | Yalnız round-trip `sleeveStyle:'puff'→None` sessiz düşüşünü yakaladı | aynı
- **Yaka/beden ölçülerinin birincil kaynağa bağlanması** | bust/waist/hip 10 bedende burda ile **30 hücrede 30 birebir** tuttu; Aldrich bağımsız teyit | `_cop/knowledge/eu-beden-cizelgesi-kaynak-2026-08-17.md`
- **Kolevi kök nedeni kodda bulundu** | `body.cpp:174` croquis omzunu ÖN İZDÜŞÜM, göğsü KESİT yarı genişliğinden alıyordu; iki farklı tanım yan yana → omuz göğsün 55.4 mm dışında → arası delik değil DOLU. Omuz 188.8 → 122.5 mm; omuz taşması +55.4 → −10.9 mm | `_cop/1209-devir.md`
- **Süpresyon kapısı tautolojiden çıkarıldı** | Eski kapı çözücünün yazdığı oranı okuyordu (%33 = pensPayı). Şimdi EMİLMEYEN ölçülüyor: dikilen bel halkası ×2 − (beden + bolluk). İlk ölçüm taban +40 mm, teslim 1 +80 mm hata buldu | `_cop/giris/HUKUM.md`
- **Şema arity denetimi** | 1 noktalı `cepKapagi` `ciz()`'i TypeError ile çökertiyordu; `EN_AZ_NOKTA` tablosu eklendi, artık `ERR_SEMA` ile adıyla reddediyor, önbelleğe yazmıyor. 21 mevcut önbellekte yanlış alarm yok | `_cop/1209-kosu.md` §2.8
- **Künyeyi sha256 kimliğiyle geri kazanma** | 19 fotoğrafın 19'u PROVEN geçti; benzeyen aday kabul edilmiyor | `_cop/dataset/*/KAYNAK.md`
- **Göz hakeminde YAPI/SÜSLEME daraltması** | YAPI (siluet, panel/dikiş, yaka-kol biçimi, boy, kapanma) sayılır; SÜSLEME (fisto, dantel, desen, renk) sayılmaz. Ayrım testi: altın 4/4, bozuk 1/4. Varyansın kaynağı buydu | `1209-kosu.md`
- **Sert "bir bölge bile kalırsa SATILMAZ" yerine 0-4 skor + eşik ≥3.0** | Sert kural iyi çizim (3/4) ile bozuk çizimi (0/4) aynı hükme sokuyordu. "4/4 istemek ulaşılamaz eşiktir — ulaşılamaz eşik 24 turun hatasıydı" | aynı
- **K1 scye karnı — TEK SATIR düzeltme** | `cp1.x` omuz ucunun DIŞINDA (+0.06·dx) idi, eğri uçtan dışarı ayrılıyor, çözücü ulaşılamaz hedef kovalıyordu. `cp1.x = innerLimit`: oyuk 404.3 → **422.9 mm**, K1 bandı (400-440) İÇİNDE, yeni sabit yok | `bugra-rapor.md`
- **K3 çentikler** | `annotateTechnical` kesim çizgilerinden ÖNCE koşuyor ve çapayı konturun değil BOUNDING BOX max-x'ine koyuyordu. `notch_off_boundary` **211 → 0**, `mark_far_from_edge` **342 → 0**; tavanlar 0'a İNDİRİLDİ | aynı
- **Ölçek/seri altyapısı (ürün değil ama sağlam)** | DXF-AAMA/ASTM (`ezdxf 1.4.4` ile doğrulandı), nesting (`shapely 2.1.2`, overlap 0.000000 mm²), tech-pack manifest, kaynak sha256 damgası, `landing_truth_check` (site iddiaları artık test) | `README.md`
- **ISO 4916/4915 dikiş kodlaması sözlük tabanı olarak** | 8 sınıf topoloji (bileşen sayısı + kenar sınırlılığı), 5 haneli seam + 3 haneli stitch kodu. HEDEF md.9'un aradığı şey bu | `_cop/knowledge/DIKIS-SOZLUGU-ISO-2026-08-23.md`

## 3. ÖLÇÜLDÜ — SAYILAR (yeniden ölçme)

| ne ölçüldü | değer | kaynak |
|---|---|---|
| EU beden bust/waist/hip (34→52) | 80/62/86 · 84/66/90 · 88/70/94 · 92/74/98 · 96/78/102 · 100/82/106 · 104/86/110 · 110/92/116 · 116/98/122 · 122/104/128 cm | `knowledge/eu-beden-cizelgesi-kaynak` (burda ile 30/30) |
| EU46 üstü grade sıçraması | +4 cm rejimi → **+6 cm** (kasıtlı, Burda'nın yayınlanmış serisi) | aynı |
| Aldrich EU38 blok (büst 88 / 92) | sırt gen. 34.4/35.4 · ön gen. 32.4/33.6 · omuz boyu 12.25/12.5 · **bust dart 7.0/7.6** · üst kol 28.4/29.6 · **armscye DEPTH 21.0/21.4** cm | `knowledge/drafting-math-eu38.md` |
| Armhole çevresi | Aldrich'te YOK; sanity çapası ~40-44 cm (≈42), MED | aynı |
| Cap ease | dokuma fitted 3-4.5 cm; gömlek ~1 in, elbise/bluz 2-3 cm, ceket 4-6 cm; >7.5 cm kötü draft | aynı |
| Cap ease dağılımı | koltukaltı→çentik **%0** (birebir), tüm ease taç üzerinde, ≈1/3 ön 2/3 arka | aynı |
| Çapraz omuz | tam büstün **%44'ü** (Aldrich 38.94/88=%44.3, Armstrong 40.64/91.44=%44.4). EU38 yarı-omuz: Aldrich 194.7 mm · Buğra Locket 210.5 mm · croquis'te duran **234.0 mm** (üçü de fazla diyor) | `knowledge/FLAT-DIS-KAYNAKLAR-2026-08-23.md` |
| Croquis omuz ucu | 188.8 → **122.5 mm** (iki bağımsız ölçüm 0.9179 ve 0.9187, 0.0008 içinde uyuştu) | `1209-devir.md` |
| Çizgi ağırlığı oranı | outline = iç detayın **TAM 2 KATI** (2 bağımsız kaynak). Mevcut contract 2.4/1.0/0.55 = **2.4:1** — sektör 2:1, uyuşmuyor | `0911-kapanis.md` |
| Çizgi semantiği | solid=seam · dashed=topstitch · dotted=gizli dikiş/fold; dash/gap sayısı hiçbir kaynakta YOK | aynı |
| Emsal 13 vs croquis36 (0.944 mm/px) | göğüs yarım 177 vs 210 (+%19) · bel yarım 158 vs 171 (+%8) · omuz→göğüs 227 vs 255 · omuz→bel 390 vs 390 | `giris/HUKUM.md` |
| Emsal medyan oranları | göğüsYarım/torso **0.50** (n=4, 0.44-0.52) bizde 0.538 · belYarım/torso **0.406** (n=6) bizde 0.437 | aynı |
| Dikilebilirlik toleransları | dikişUzunluk 2.00 mm · çentik 0.50 mm · halkaKapanma 2.00 mm · pensBacak 2.00 mm | `graf-ilk/dikilebilir.md` |
| Ölçülen sanal dikiş | 8 bedenin 8'inde **0.00 mm** | aynı |
| gercek36 dikiş uzunlukları | omuz 119.98 · yan_beden 210.96 · kol_oyugu 373.62/359.25 · bel 342.50 · yan_etek 590.54 · kol_altı 188.30 mm | aynı |
| gercek36 halkalar | yaka 154.51 · kol oyuğu 359.25 · bel 342.50 · etek ucu 475.00 · kol ağzı 310.50 mm | aynı |
| Kol görünür genişliği | panel genişliği / π = **0.49 × göğüs yarımı** (GIRDI/iyi-flat 07'de ölçüldü) | `giris/HUKUM.md` |
| Croquis kol ekseni | shoulderTip→wrist, **82.2°** | aynı |
| Askı bandı genişliği | ölçüm 30-40 mm, altın 34; okuyucu 55-65'e şişiriyordu | `1209-kosu.md` §2.8 |
| Askı oranı | okuyucu 0.80 · altın 0.72 · fotoğraf ölçümü 0.732; taşma 125.5 > 122.5 (3 mm) | `1209-devir.md` |
| Son okuma skorları (5/5 taze) | etsy-01 18/18, 4/5 öge, %5.8 GEÇTİ · 03 18/18, 6/8, %2.8 GEÇTİ · 05 18/18, 3/6, %4.6 · 08 16/18, 2/4, %5.7 · 10 16/22, 6/6, %4.8. **2/5**, kapı 4/5 ister | aynı |
| Sapma iyileşmesi | gece başı %8.6-10.1 → beşi de **%2.8-5.8** (eşik %8) | aynı |
| Prompt çöküş eşiği | **24k karakter** — geçince sonuç 0/5'e düşüyor (şu an 24.5k) | aynı |
| Pens açısı | Buğra gerçek pensi **41.5°** = develop-deficit'in kendisi (41.48°) | `REPORTS.md` 10-12 Ağu |
| Buğra yer-gerçeği | 0.021 mm sapmayla yeniden üretildi; koni strain %0.0037; gövde-altı vs etek-üstü **0.000000 mm** | aynı |
| Kalıbın 05'i | 9.8 cm / 41.5° = C-D cup (standart B-cup değil) | `knowledge/drafting-math-eu38.md` |
| Buğra parite (4 Eyl) | Top Back **+394 mm (%31)**; croquis 12 Eyl'de değişti → yeniden ölçülmeli | `1209-kosu.md` §1 |
| Bolluk (ease) kusuru | motorun payı **çarpımsal** (kalça payı/kalça = 0.2000 bit-sabit 8 bedende), her yayınlanmış band **toplamsal**; kalça 8/8 bedende yayınlanmış minimumun ALTINDA. Vücut girdisini kaydırmak ÇÜRÜTÜLDÜ: pay mm başına 0.0200 hareket ediyor, tabana ulaşmak için kalça girdisi **254 cm** olmalı | `README.md` |
| Etsy görsel kapısı | yükleme oranı 2.840 (Etsy 1.333 ister) → küçük resimde mürekkebin **%37.5'i** sağ kalıyor; düzeltmeden sonra %100. Görünür metin 2 → 47, beden satırı 0 → 10 | `knowledge/ETSY-KAPISI-2026-08-23.md` |
| URBN POM toleransı (dokuma W1) | armhole 3/16 in · neck width 1/4 · across shoulder 1/4 · sleeve width 1/8 · **position points <5 in = 1/8 in = 3.175 mm** | `knowledge/POM-TOLERANS-URBN-2026-08-23.md` |
| Yerel minimum kanıtı | 44 commit boyunca `anaSapmaMM` 0.693 sabit, `enum` 436 sabit, `sanalDikisMM` 0 — hiç kıpırdamadı | `0509-metrik.jsonl` |
| Kod kütlesi dağılımı | C++ motor `engine/src` **37.573 satır** ve `contract/*.json` 19.268 satır elbiseyi ÇİZMİYOR; çizen `web/lib/siluet-ciz.js` **472 satır** | `PLAN.md` §0.3 |
| 3 aylık üretim | 368 commit / 265.483 satır (2-12 Eyl), **kapanan madde 0** | `PLAN.md` §0.1 |
| Drape önizleme | zSpreadMM 174.3978 (EU38) vs 229.4973 (pear), bodyPenetration 0.0000. Eski "143 vs 238" ÜRETİLEMİYOR — 143.2394 aslında bodyRadiusMM olabilir (**DOĞRULANMADI**) | `README.md` |
| Motor EU38 vs Buğra 38 | motor 88/70/94 cm, Buğra 92/72/98 cm → **iki "38" aynı gövde DEĞİL**; bust oranı 0.957, panel başına ~%4.3 | `bugra-rapor.md` |
| Buğra kıyası (çevre, kesim çizgisi) | Top Front 1755 vs 1686 (+%4) · **Top Back 1669 vs 1275 (+%31)** · Puff Sleeve 1177 vs 873 (+%35) · Collar 692 vs 568 (+%22). Parça sayısı 6 vs 7 | aynı |
| Dikiş payı | motor 15 mm, Buğra 10 mm (etek 30 mm) | aynı |
| Croquis omuz/göğüs oranı kaynağı | satıcı flat medyanı 0.9179 (yayılım 0.0393) · Locket EU36 ort 0.9187 · 16 halka medyanı 0.9254 → **seçilen 0.918** | `1209-kosu.md` |
| Omuz eğimi | etsy-01 14.6°, etsy-08 arka 17.5° → ort **16.0°** | aynı |
| Kolevi oyukluk | **0.055** (satıcı flat 0.0526 + Aldrich kolsuz blok 0.0544-0.0572, iki hat 0.005 içinde); omuz içeri oran 0.0847 | aynı |
| Etek ucu sarkma oranı | **0.11** (satıcı flat 0.1018 + locket_top 8 beden 0.1289-0.1370) | aynı |
| Negatif pay sektör tablosu | stable knit %18-25 streç → **%0** · moderate %26-50 → %2 · stretchy %50-75 → %3 · super %75-100 → **%5** (formül %43 diyordu) | `1209-kosu.md` §4 |
| Cap ease (kesim vs dikiş çizgisi) | kesim çizgisinde 8/8 POZİTİF (+1.54…+4.22%), dikiş çizgisinde 8/8 NEGATİF; salınım ~40 mm. **İşaret, hangi çizgiyi ölçtüğünün fonksiyonu** | arşiv L395 |
| Green&unsewable detayı | temiz %24.6 (116/472); 1959 kırık dikişin %24'ü 3 mm toleransta görünmez; üretim toleransı 0.79375 mm | arşiv L339 |
| Edge-case tablosu | 1325 yargı / 2 FAIL; kumaş 360 kombinasyon → 323 sığdı, **37 adıyla red**; 10 beden EU34-52, 6 parça, issues 0 | `edge-case-tablosu.md` |
| Göz hakemi varyansı | düzeltmeden önce aynı görüntüye 1/4, 2/4, 4/4 (yayılım 3) → sonra yayılım 0-1 | `1209-kosu.md` |

## 4. ÇÜRÜTÜLEN İDDİALAR

- **"MIT lisansı ticari kullanıma engel"** → YANLIŞ. MIT = ticari serbest, atıf yeterli. 23 Ağu'da çürütüldü, yine de 12 Eyl'e kadar bahane olarak kullanıldı | `PLAN.md` §0.4
- **"Profesyonelin (Buğra'nın) kalıbında hata bulduk"** → HATA BİZDEYDİ. Kesim çizgisinde omuz 8 bedende +0.95…+1.13 mm, hiç büyümüyor; "bedenle büyüyen fark" sadece bizim 10 mm miter ofsetimizden sonra çıkıyor. Pens bacakları beden 34'te 119.84 vs 119.73 mm = kusursuz true. Arka omzun ön omuzdan uzun olması ZATEN STANDART (kürek payı 6-12 mm) | `CLAUDE.md` (29 Tem)
- **"Kimse dikiş doğrulamıyor"** → AŞIRI GENEL. Açık kaynak için doğru (Seamly2D sıfır, FreeSewing tek çift + 6 sihirli çarpan, GarmentCode'un kontrolü ölü `verbose` bayrağı arkasında), ama CLO3D'de `Check Sewing Length` (>1 mm kırmızı), Gerber AccuMark'ta `Walk Pieces` var. Gerçek boşluk: otomatik EŞLEŞTİRME yok. Ayrıca parafashion (SIGGRAPH 2022) zaten anizotropik enerji + 45° bias + dikiş uzunluğu eşitliği taşıyor | `CLAUDE.md`
- **"Ön armscye arka armscye'den uzun, fark 1.5-2.5 cm"** → kaynaksız çıkarım, SİLİNDİ. İki iddia aynı şeyden bahsetmiyor: Aldrich EĞRİLİK diyor, Buğra YAY UZUNLUĞU. Buğra 8/8 bedende ikisini birden doğruluyor (ön daha eğri, arka daha uzun) | `knowledge/armscye-on-arka-2026-08-17.md`
- **"Koltukaltı %0 ease Buğra'da doğrulandı, −0.1 mm"** → GERİ ÇEKİLDİ. Sayı `flatten-research/12`'nin bozuk ofsetinden geliyordu; düzeltilmiş ölçümde ön +1.5 mm, arka −1.6 mm | `knowledge/drafting-math-eu38.md`
- **Dikiş-çizgisi ofsetinin kendisi bozuktu** | "ofsetle + buda + miter'la" her kenarın UÇLARINDAN ~SA kadar uzunluk siliyordu, bazı kenarlarda İŞARET değiştiriyordu. Düzeltildi (nokta-normali ofset): 484 kenar-ölçümünde en kötü sapma 0.4102 mm; EU38 CF 401.5→420.2, oyuk 431.5→468.0, kapak 425.8→444.7 | `knowledge/seam-line-offset-2026-08-17.md`
- **`18`'in analitik mandalı SARILIM-KÖR** | iç normali hep teğetin solu sayıyor; gövde CCW ama kol parçaları CW → EU38'de 14.2/20.9 mm sahte sapma. 13 ve 19 düzeltildi, **18 düzeltilmedi** | `CLAUDE.md`
- **`-arka.jpg` gerçekten arka sanılıyordu** | `biba-O1194418-dress-arka.jpg` içeriği ÖN (sweetheart yaka, ön orta düğme, önde sivri peplum). Ölçümle çürütüldü: boy/omuz 2.3459 vs 2.3199, belKonum 0.3570 vs 0.3552. 16 ön-arka çiftinin 2'si açıldı, **14'ü OKUNMADI** | `KOSU-kalan/ciktilar/0509-saglik.md`, `0509-a3-secim.md`
- **Dosya adı = içerik sanmak** | Getirici betik `NN-<sorgu-slug>.jpg` yazıyor; `17-knit-sweater-mannequin.jpg` gerçekte II. Dünya Savaşı müzesi vitrini | `dataset/*/KAYNAK.md`
- **EU beden çizelgesi "EU (German) convention" yorumu** | 70 sayı 7 Tem'de bir TEST HARNESS'ında (`engine-check/main.swift`) doğdu, aynı dizide `tall/petite/pear/apple` gibi apaçık uydurma gövdelerle. Bir hafta sonra motorun gövde gerçeği oldu, **terfi anında hiçbir kaynak eklenmedi**. Sonradan 3 kolon (bust/waist/hip) doğrulandı, **4 kolon (shoulder/backLength/armLength/neck) hâlâ KAYNAKSIZ** (`status: NONE`) | `knowledge/eu-beden-cizelgesi-kaynak-2026-08-17.md`
- **`backLengthCM` EU44→EU46 adımı 0.0** | Hata gibi okunuyor: yayınlanmış hiçbir seride ortada düz adım yok (Burda +0.5, Aldrich +0.4 tekdüze). Tur 16'nın "gövde boyu EU44→46'da KISALIYOR (−11.56 mm)" bulgusunun kökü tam bu hücre. DÜZELTİLMEDİ | aynı
- **"Prompt contract'ı uyguluyor"** | Prompt "bel HER ZAMAN waist / kalça HER ZAMAN hip" diye sabit taban dayatıyordu; `contract/siluet-v1.json`'da `waist` kelimesi **0 kez** geçiyor. Altın kopyalar giysiye göre taban SEÇİYOR. Tek başına 14/18 kontur skoruna mal oluyormuş — HEDEF md.9 ihlali prompt'a sızmıştı | `1209-devir.md`
- **Prompt eski croquis'e kalibreymiş** | İçinde `neckBase.x 70.7 / shoulderTip.x 188.8` = 0.37 yazıyordu; yeni croquis'te 70.7/122.5 = **0.577**. Okuyucu var olmayan bir mankene göre ölçüyormuş | `1209-kosu.md` §2.8
- **Altın kopya tavan sanılıyordu** | etsy-08'de okuyucu `pili` yazdı, altın yazmadı — ama ilan metni "etek ucunda pili" diyor, **İNSAN kaçırmış**. Kıyasın tavanı altın, göz hakeminin tavanı GERÇEK GİYSİ | `1209-devir.md`
- **"77/77 test yeşil"** | 24 Ağu'da bayat çıktı, süit all-green DÖNMÜYOR | `README.md`
- **"Seam-pair worst 0.00 mm" / "DXF max error 0.000e+00"** | Donmuş sayı kapı değildir; RULES §6 ile silindi, araç çıktısına bağlandı | aynı
- **Determinizm tek yönlü sanılıyordu** | Flat kalem `sleeveStyle` set/raglan/puff için ve `collarType` 1/2/3 için BAYT-AYNI SVG çizdi — sessiz çökme. 2026-07-18'den beri kayıtlı aynı hata sınıfı | aynı
- **`edit_locality_check` tek yönde dişsizdi** | Kendi karşılaştırmasını bayttan panel varlığına gevşetmek kapıyı yeşil bıraktı (eşiği "12 vakanın en az 1'ini yakala" idi) | aynı
- **`sleeve_cap_ease` tautolojisi** | Kol ad alt-dizesiyle, kapak sabit komut indisiyle bulunuyordu, armhole geometriden hiç okunmuyordu — rapor edilen uyum bir sayının kendisiyle uyuşmasıydı | aynı
- **"Motor iki katmanlı pufu ÇİZEMİYOR"** → GERİ ÇEKİLDİ. `buzgu_katman_check`: Upper 444.1 mm > Lower 329.2 mm (×1.349). Parça yok çünkü SORULMADI | `bugra-rapor.md`
- **"Motor düğmeyi çizemiyor"** → YANLIŞ. `buttonCircle` dört kübik çeyrek yayla çiziyor. Sorun AD EŞLEŞMESİ: `frontCenter()` "Front Body"yi tanımıyordu, Locket sessizce düğmesiz çiziliyordu | aynı
- **"Motorda yan dikişi belde içeri alan eksen yok"** → YANLIŞ. Eksen vardı (`waistlineWidth`), ama o sayı kübiğin yalnız KONTROL NOKTASIydı — Bezier kontrol noktasından geçmez. Çizilen bel EU38'de 238.7 mm, kalıbınki 229.2 mm (çevrede 3.8 cm fazla) | aynı
- **"Pens tek çizgi çizilmiş, konvansiyon kapalı V ister"** → ÇÜRÜDÜ. Referansta pens TEK ÇİZGİ. Yanlış olan çizgi sayısı değil NEREDE BİTTİĞİ | `kusur-listesi.md`
- **"Hakem kolevi eksikliğini görür"** → KÖR NOKTA. Kolevisi HİÇ olmayan çizime `kolevi/kol: EVET` ve **4/4 SATILIR** verdi. Kolevi kapısı göz hakemine DEĞİL geometrik ölçüme bağlanır | `1209-devir.md`
- **"A3 = 2/5"** | Rakam N3 ÖNCESİNE ait olabilir; gerçek sayı 2/5 ile 5/5 arasında, **BİLİNMİYOR** | `KOSU.md` §1.9
- **Buğra sapması "Top Back +394 mm / %31"** | Croquis 12 Eyl'de 188.8→122.5 değişti → **o sayı GEÇERSİZ**, yeniden ölçülmeli | aynı
- **"K5-kup-korse K2 ile aynı kök sebeple düşer"** | Bugün ÇİZİYOR (25663 B). İki notun "kök sebep tek ve aynı" cümlesi ölçümle örtüşmüyor | `0509-saglik.md`
- **"Turnstile display:none challenge'ı çözmüyor"** | GERİ ÇEKİLDİ; token callback yoluyla 45 sn içinde geliyor, ilk ölçüm erken okumaydı | `kusur-listesi.md`
- **"EU34-52 tam seri / 10-of-10 beden"** | ÇÜRÜDÜ: `shape-ratios.json` EU50'de abort ediyor. Doğrusu EU34-48; site haftalarca yanlış satıyordu | `README.md`

## 5. KURULAN VE TERK EDİLEN KAPILAR/SİSTEMLER

- **150 ayrı `*_check` kapısı** git geçmişinde doğdu; bugün diskte **148 dosya**. Kapanan ürün maddesi: 0.
- `_cop/gate/` altında **26 ayrı kapı/koşu klasörü** (aski-aile, drape, endustri, f2render, grade-beden-serisi, mihenk05-08, nest-marker, satis-paketi, tech-pack, recipe-kapi1/1b …) — hepsi çöpte.
- `0509-kapi.log`: **2377 kapı koşusu**, 19.256 satır log.
- **G2'nin bilerek bıraktığı borç — 4 kapı YEŞİLDEN KIRMIZIYA döndü ve öyle bırakıldı:** `vitrin_gercek_check`, `indir_check`, `uctan_uca_check`, `manken_insan_ayrim_check`. Ölçtükleri kalem silindiği için 4 kapı daha kayıttan düştü | `0911-kapanis.md`
- **İlanlı kalıcı kırmızılar:** `flat_ayni_insan_check` (34 hüküm, A4'e devredildi, hiç kapanmadı), `sinyal_tam`/`bundle_fresh_check` (A9'a devredildi, hiç açılmadı) | `0509-DURDU.md`
- **`olcek_check`** — "henüz-yok" olarak dürüstçe bırakıldı, hiç ölçülemedi | `0509-saglik.md`
- **Ölü kalan hükümler:** silinen kapıların yargıları (çizim giysi mi / satılır mı / konvansiyon / kalıp mutabakatı) yeni kaleme BAĞLANMADI; bugün sadece `siluet-yanlisla` ve kör hakem turunda koşuyor, **ctest kapısı YOK** | `0911-kapanis.md`
- ★ **Birincil kaynak REPODA YOK:** `patterns_real/geometry/geometry-full.json` (664.754 bayt) + `seamgraph.json` (89.834 bayt) diskte var, git ağacında YOK — ne izleniyor ne gitignore'lu (çıkaran commit `2f748db`, 20 Ağu). **Temiz bir klonda bütün Buğra ölçümlerinin dayanağı bulunmaz** | `docs/KATMAN-HARITASI.md`
- **Terk edilen kod yığınları:** `motor/pattern-bridge` (11.547 satır, GarmentCode köprüsü), `engine/src` C++ (37.573 satır, flat'e hiç girmiyor), `_cop/vision-student/` (CLIP/SigLIP öğrenci), `_cop/engine-check/harness/`, `_cop/flatten-research/` (2 png kaldı), `_cop/0509-kosu.js` (103 KB koşucu), `_cop/sinyal.sh` (17 KB).
- **Silinen tek seferlikler:** 27 referanssız engine/tools, 8 KOSU jeneratörü (0 ref), `engine/imitate`, `vision/eval.js` + korpus, GECE7 gece logu, `core/include`, G5 yüzey planı, 46 eski landing ekran görüntüsü, 166 MB vision raster | commit `c8f3073a`, `05949028`, `05f6d15c`, `d11a0417`

## 6. TEKRARLANAN HATA DESENLERİ

1. **Rebirth-rework-remaster.** F1-F2-F3 gider, F4'te ölçüm yapılır, temel bozuk çıkar, plan yeniden yazılır. 368 commit / 265.483 satır, kapanan madde 0 | `PLAN.md` §0.1
2. **Plan/kural dosyası doğurmak, ürün doğurmamak.** A1-A13, G1-G4, F1-F10, 0509/1209/0911 defterleri — her biri "önceki bütün düzenler geçersizdir" diye başlıyor. En az 5 kez tam yeniden numaralandırma.
3. **Ölçüyü değiştirip ilerleme sanmak.** Hakem her tur internetten farklı ölçüt çekti; 24 tur gürültü. Ölçüt kaymasının adı bu projede kondu ama 24 tur sonra.
4. **Kapıyı elle veriyle geçmek.** 3720 satır elle önbellek verisi vs 168 satır kod. Bir sonraki fotoğrafta çöküyor.
5. **Sessiz düşme — kök sebep, 3 ay görülmedi.** Okuma DOĞRU ("boyun dibine oturan bant, damla kesim açıklık, kısa kollu"), çizim YANLIŞ (kol yok, bant yok). Çizici `shoulderTip*1.05` gelince sıfır-alanlı üçgen çizdi ve **şikayet etmedi**. Elle `*1.30` + `yakaBicim:"kare"` = iki satır, elbise çıktı. 3 ay "flat çirkin" denip çizim güzelleştirildi; kusur bu değildi | `PLAN.md` §0.2
6. **Prompt'a kural ekleyerek mekanizma sorununu çözmeye çalışmak.** Pens üç yerde anlatılıyor, yine kaçıyor; prompt 24k'yı geçince her şey çöküyor. Çözüm mekanizma (iki aşamalı okuma / 3-koşu uzlaşma / kod kapısı), daha çok kural değil.
7. **Kaynaksız sayıyı sessizce terfi ettirmek.** Test fixture'ı → motorun gövde gerçeği, kaynak eklenmeden (70 sayılık beden çizelgesi). Aynı sınıf: `belY = 0.55`, `kPensPayi` C++'ta gömülü.
8. **Ölçüm-yokken-uydurma.** Landmark/band/parça sayısı bilinmeyince olmayan eşik ekleniyor (giriş guard mutlak 150 mm çevre matematiksel yanlış çıktı) | `docs/DERSLER.md`
9. **Oran hedefte ama çıktı çirkin / tautolojik kapı.** Süpresyon kapısı çözücünün kendi yazdığı oranı okuyordu; `sleeve_cap_ease` kolu ad alt-dizesinden buluyordu — sayı kendisiyle uyuşuyordu.
10. **Kod kütlesi ürünün olmadığı yerde.** 56.841 satır (C++ motor + contract) çizmiyor, 472 satır çiziyor. Yüzey hattı ctest'te koşuyor, WASM'a hiç girmiyor, alıcıya varmıyor.
11. **Bütçe aşımı = protokol hatası, 3 kez aynı.** A1 26 commit/9.27 saat, A2 13/3.05, A3 13/2.0 — üçünde de hakem hükmü alınmadan adım kapanmadı.
12. **İtiraf ederek kapanmak.** "Ele alınmadı", "ölçülmedi", "devredildi" listeleri her DURDU'da uzuyor; devredilen kalem bir sonraki adımda da açılmıyor (flat_ayni_insan A4'e, A4 24 tur koştu, kapanmadı).
13. **Kapının kendi sağlığı ölçülmüyor.** H17'de bozuk awk deseni → boş çıktı → "sızıntı yok" → geçit BOZUK TARAYICIYLA YEŞİL yandı. `size-coverage-check` silinmiş bir sayfayı ölçüp tüm deploy'u kilitledi. `edit_locality_check` gevşetildiğinde yeşil kaldı.
14. **Prompt/kod bir yerde düzeltilip ikizi güncellenmiyor.** Çizici yeni croquis'e geçti, prompt 188.8'de kaldı. Sabit menü çiziciden atıldı, prompt'a sızdı.
15. **Ölçmeden düzeltmeye atlamak.** A6 brief'i bunu yasa yapmak zorunda kaldı: "İLK İŞ ÖLÇMEK, DÜZELTMEK DEĞİL."
16. **Yanlış kaynak dosyadan ölçmek, iki kez.** `ring-trace` (%40 uydurma bridge) ve `flatten-research/08` (yanlış kaynak) aynı sınıf hata.
17. **Alt-ajan kaçağı.** 4 Eyl'de 69 alt-ajan; 29 Tem'de 100 ajan / 863k token.
18. **Prova hiç yapılmadı.** 600+ saatte Damla `kalip-A4.pdf`'i basıp ucuz kumaştan bir kez bile dikmedi — giyilebilirliği ölçen tek kapı | `PLAN.md` F10

---
**Bir daha yapılmayacak tek cümle:** yeni plan/faz/kapı/numaralandırma kurmak. 150 kapı ve 12 düzen kuruldu, satılan nesne 0.
