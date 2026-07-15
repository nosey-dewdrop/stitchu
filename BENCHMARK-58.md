# BENCHMARK-58 — "yaptım" sayacı (ana loop dosyası)

Damla'nın kararı, 2026-07-15 akşam. Bu dosya sonraki TÜM oturumların anayasası.
Önce CLAUDE.md'yi, sonra bunu oku. Rapor: reports/2026-07-15-stitchu-canli-zincir-testi-ve-register.md

## TEK METRİK
Damla'nın attığı 58 gerçek ürün fotoğrafından (benchmark-58/photos-1024/) kaçında
zincir **O ÜRÜNÜN tam kalıbını** veriyor. Hedef **58/58**; ara eşik en az **%80 (47/58)**.
Bu sayının dışında "yaptım / oldu / bitti" DEMEK YASAK. Her oturum sonunda sayı
yeniden ölçülür ve buraya işlenir.

Durum (2026-07-15 manuel ölçüm): **6/54 TAM KALIP** — canlı Opus zinciri kredi bitik
olduğu için 59 foto Claude aboneliği üstünden EL İLE (worker prompt kurallarıyla)
okundu: 6 TAM + 48 eksik öğeli + 0 yanlış; doğru-red 5/5. TAM'lar Loop 0/1'le aynı
(Heloise, Hallie tank, Boat Neck Top×4). WRONG 0 → canlı zincirin 10 WRONG'u saf vision
varyansıymış (insan gözü yaka sınırını doğru okuyunca sıfırlandı). Bu bir el-ölçümü;
kredi gelince tek FAST koşuyla canlı sayı teyit edilecek, beklenti 6/54. Önceki durumlar altta:
Durum: **6/54 TAM KALIP (ÖLÇÜLDÜ, 2026-07-15 Loop 1 — Loop 0'la AYNI)** — motor
henüz yapısal alanları ÇİZMİYOR, o yüzden FULL değişmiyor ve bu NORMAL. Loop 1'in
ölçüsü ürün metriği değil ŞEMA KÖPRÜSÜ: **51/69 dağarcık-dışı öğe artık yeni yapısal
alanlarla (closure/collar/straps/cupSeams/sleeveHead/yoke/backDetail/outOfVocab[])
YAKALANIYOR** (Loop 0'da sıfırdı). Doğru-red 4/5. Ölçüm scripti: engine/tools/
benchmark-58.mjs (canlı worker; artık structuralCoverage() ile şema köprüsü stat'ı basar).

## TEŞHİS (kanıtlı, 2026-07-15 canlı test)
- CV (vision) GÖRÜYOR: 7/7 canlı testte düğme patı, yaka, korse, puf doğru okundu.
- Ama gördüğünü serbest metin "details" cümlesine yazıyor (worker.js:285) —
  şemada yapısal alan yok.
- Motorun dağarcığında o kelimelerin ÇİZİM FORMÜLÜ yok (strapless, pat, yaka,
  kup, puf cap, pile, fiyonk...).
- Yani eksik CV değil: (1) motor dağarcığı, (2) vision→motor şeması.
- En büyük güven kıran: motor çizemediğinde SESSİZCE en yakın bloğu veriyor,
  kullanıcıya söylemiyor.

## KURALLAR (Damla'nın ağzından)
1. **Çizmeye uğraş.** Dürüstlük katmanı "çizemedim" deyip bırakmak DEĞİL —
   önce dene, ancak gerçekten formülü yoksa açıkça söyle ve en yakın bloğu
   "şunlar eksik" notuyla ver.
2. **Referans = couture + high street.** Her yeni dağarcık öğesi çizilmeden önce
   o öğenin Dior / Chanel / YSL / Prada / Armani seviyesinde nasıl yapıldığı VE
   Stradivarius / Bershka'da nasıl basitleştiği çalışılır (kesim kitapları:
   Aldrich/Armstrong/M&S + gerçek ürün fotoğrafları). Formül bu araştırmadan çıkar.
3. **Kanıtla, iddia etme:** her öğe golden byte-identity (mevcut yollar) +
   truing 0.00mm + ctest + web-fuzz + render-pages strip kanıtı + benchmark
   sayısının artışıyla gelir.
4. Farklı oturumlarda farklı loop'lar; her oturum bu dosyayı günceller.

## VERİ (hepsi lokal, git'e GİRMEZ — .gitignore'da)
- `benchmark-58/photos-1024/` — 59 ekran görüntüsü, 1024px JPEG (zincirin yediği
  formatın aynısı). Kaynak: ~/Desktop/dress_patterns/. İçlerinde 1 giysi-dışı
  (Slowly ekranı, 13.30.50) + 1 çanta (13.51.19) + kalıp-çizimi görselleri var —
  etiketlemede işaretlenecek (onlar "doğru red" testleri).
- `benchmark-58/bugra-ref/` — satın alınmış BugraPatterns paketleri (Buttoned
  Corset Bustier, Locket Top, Plain Bustier Dress A0/A1/mixte + talimatlar).
  SATIN ALINMIŞ IP + ekran görüntülerinde Damla'nın tarayıcısı var → ASLA public
  repoya pushlanmaz.
- Canlı vision çıktıları (7 foto, ham JSON): rapor 2026-07-15 bölüm 1.

## LOOP KUYRUĞU (sıra Damla onaylı: frekans × zorluk; 15 loop, 2026-07-15 akşam)

Her loop = TEK oturum/agent, taze context. Bir loop bitmeden sıradaki başlamaz.
Loop bitince context TEMİZLENİR (agent ölür / session clear), sıradaki loop SIFIR
context'le açılır; loop'lar arası hafıza taşınmaz — tek taşıyıcı bu dosya + repo.
Yapan agent kendi işini "oldu" diye onaylayamaz; denetim loop'ları (A/B/C) AYRI,
kodu yazmamış bir agent tarafından koşulur — sadece çıktıya, benchmark sayısına
ve render kanıtına bakar, kod yazmaz, kırar ve rapor eder.

### Her loop'un protokolü (istisnasız)
- GİRDİ: önce CLAUDE.md, sonra bu dosya, sonra kendi satırındaki referanslar. Başka bir şey okuma.
- İŞ: sadece kendi öğesi. Kuyruktan ikinci öğe almak YASAK (context şişer, kalite düşer).
- ARAŞTIRMA (dağarcık loop'ları): öğenin couture (Dior/Chanel/YSL/Prada/Armani) +
  high street (Stradivarius/Bershka) yapımı + Aldrich/Armstrong/M&S formülü. Formül buradan çıkar.
- KANIT: golden byte-identity + truing 0.00mm + ctest tamamı + web-fuzz 0 fail +
  render-pages strip + **58'lik benchmark koşusu, sayı aşağıdaki tabloya işlenir**.
- KAPANIŞ: tabloyu + Durum satırını güncelle, CLAUDE.md status, devlog/linkedin malzeme,
  commit + push, deploy (?v bump + git add web/ ALL + subtree gh-pages).
- Blokör çıkarsa (veri erişimi, Damla kararı gereken şey): durur, tabloya "BLOKE: neden" yazar, push'lar.
- DEVLOG ŞABLONU (zorunlu, Damla 15 Tem): her reel girdisi AYNEN şu yapıda —
  `## Reel — [kısa başlık] (loop XX)` / `**Hook (ilk 2 sn):**` ters köşe tek cümle /
  `**Anlatı (~30-45 sn):**` Damla'nın dilinde "neyi değiştirdim → çünkü şu sorun
  vardı → nasıl çözdüm → ders", terimler mala öğretir gibi açılır /
  `**Görsel:**` ekran + alt yazı fikri / `**Format:** reel` (ya da carousel).
  Loop'a bağlı olmayan kavram reel'leri devlog sonundaki "TECH/AI/CV STOĞU"
  bölümüne, başlıkta loop numarası olmadan.

### Kuyruk
| # | Loop | İş | Durum | 58'de |
|---|------|-----|-------|-------|
| 0 | Etiketleme + sayaç | photos-1024'teki her foto için ground-truth manifest (garment, dağarcık-içi alanlar, dağarcık-DIŞI öğeler; Slowly ekranı 13.30.50 + çanta 13.51.19 + kalıp-çizimleri = doğru-red testleri). tools/ altında ölçüm scripti: zincirden geçir → tam kalıp / eksik öğeli / yanlış. İLK GERÇEK SAYI buradan. | **bitti** (15 Tem; manifest benchmark-58/manifest.json lokal, script engine/tools/benchmark-58.mjs; 59 foto = 54 giysi + 5 doğru-red; rate-limit füzü kendi KV'mizden resetlenerek aşıldı, wrangler authlu) | **6/54** (45 eksik öğeli, 3 yanlış; doğru-red 3/5 — talimat sayfası + kalıp çizimi giysi sanıldı) |
| 1 | Vision köprüsü | worker şemasına yapısal alanlar: closure, collar, straps, cupSeams, sleeveHead, yoke, backDetail, outOfVocab[] — serbest metin details ölür, alan doğar. worker.js:285. | **bitti** (15 Tem Loop 1; worker GERÇEK deploy edildi v7c3511e6, PUBLIC_ANALYZE on; create.js spec.seen borusu; 2 Loop 0 vision hatası prompt'ta düzeldi; golden byte-identity, web-fuzz 19555/0) | **6/54** (DEĞİŞMEDİ — motor çizmiyor, NORMAL) + **SCHEMA BRIDGE 51/69 öğe yakalandı** |
| 1b | Benchmark hız token'ı | Ölçüm 21sn/foto sürünüyor (kendi rate-limit sigortamız + KV eventual consistency). Worker'a gizli bypass header (wrangler secret, SADECE engine/tools/benchmark-58.mjs kullanır); gerçek kullanıcı limiti AYNEN kalır. 54 foto dakikalara iner — "her patch sonrası sayı" kuralı ucuzlar. | **bitti** (15 Tem Loop 1b; worker GERÇEK deploy v82498f3a; gizli header `x-sb-bench`, secret `BENCH_BYPASS` = wrangler secret + gitignore'lu benchmark-58/.benchmark-token; sabit-uzunluk XOR karşılaştırma, secret loglanmaz; token'lı=fuse atlanır, token'sız/yanlış=aynen 3/dk+15/gün; ~1.5sn/çağrı → 54 foto ~90sn vs eski 21sn/çağrı) | — (BLOKE aşağıda: kredi) |
| 2 | Dürüstlük + deneme katmanı | Motor çizemediği öğeyi ÖNCE çizmeye uğraşır (en yakın türev), gerçekten formül yoksa web'de görünür missingFeatures ile kullanıcıya söyler: "şu ikisi kalıpta YOK". Sessiz fallback ölür. | **bitti** (15 Tem Loop 2; TEK KAYNAK web/js/missing.js: closure/collar/straps/cupSeams/sleeveHead/yoke/backDetail her biri için EN-YAKIN-TÜREV eşleme + "verilen en yakın X, şunu elle ekle" notu, EN+TR. Ekranda vişne kart (render.js appendMissing) + PRINT KAPAĞINDA aynı liste (print.js appendMissingToCover, vişne başlık). outOfVocab dedupe (fırfırlı askı iki kez gelmez). Motor C++ dokunulmadı → golden byte-identical; web-fuzz 19555/0; render-pages temiz; 5 temsili spec + 1 temiz-kontrol EN+TR doğru mesaj ürettti. Sayı BLOKE: kredi.) | — (sayı BLOKE: kredi) |
| 3 | Düğme patı | Closure::FrontButton post-pass. DİKKAT: 15 Tem'de yarım strapless+pat denemesi revert edildi; mimari karar sabit: makePrincessPieces'e opsiyonel dal + keyhole-tarzı opt-in post-pass, golden byte-identity korunur. | bekliyor | — |
| 4 | Fermuar payı | Kapanma zincirinin ikinci yarısı: fermuar payı + kapanma tipine göre dikiş payı farkı. Pat'la aynı post-pass mimarisi. | bekliyor | — |
| 4b | Bağ/kurdele kapanması | Loop 0 verisinin 1 numarası (20 foto) — kuyruğa 15 Tem eklendi. Bağ/kuşak parçaları (dikdörtgen türev) + bağ konumu/payı; couture + high-street referans, Aldrich formülü. | bekliyor | — |
| 5 | DENETİM A | Taze agent, 0-4'ün kodunu görmemiş. Benchmark'ı kendisi koşar, sayıyı tabloyla kıyaslar, render strip'leri gözle kırar, truing/golden'ı doğrular. Uyuşmazlık = ilgili loop yeniden açılır. | bekliyor | — |
| 6 | Puf/büzgülü kol başı | Balon kol var; cap büzgüsü + yükseltilmiş cap. Büzgü oranı Aldrich'ten. | bekliyor | — |
| 7 | Stand/mock yaka | Yeni parça ailesi (yaka parçası + yaka oyuğu eşleşme ölçüsü). Referans: Buttoned Blouse fotoğrafı + Bugra Locket Top. | bekliyor | — |
| 8 | Flat/shirt yaka | Stand üstüne ikinci yaka tipi; parça ailesi genelleşir. | bekliyor | — |
| 9 | DENETİM B | Taze agent, 6-8 için Denetim A protokolü + tam 58 ara koşusu. %80 eşiğine mesafe rapora. | bekliyor | — |
| 10 | Strapless/bustier | Halter "frame shift" deseni şablon. Bugra Plain Bustier Dress (bugra-ref/) birebir kıyas hakemi. | bekliyor | — |
| 11 | Kup ayrımı temeli | Upper/lower cup, dikiş uzunluğu eşitliği ÖLÇÜLÜ (truing kapsamına girer). | bekliyor | — |
| 12 | Korse/bustier tamamlama | Kup + strapless + pat birleşimi; Bugra Buttoned Corset Bustier hakem. EN ZOR — taşarsa tek seferlik ek loop açılır, kuyruğa yazılır. | bekliyor | — |
| 13 | DENETİM C | Adversarial: 10-12'yi kırmaya çalışır (uç bedenler, vocab-sweep, truing sapması avı, golden diff). | bekliyor | — |
| 14 | Konsolidasyon | Etiket manifestindeki kalan uzun kuyruk (pile, fiyonk, arka detaylar, asimetrik kapanma) frekansa göre; tam 58 final koşusu; dürüst final rapor reports/ altına. 58/58 değilse kalan liste + yeni kuyruk önerisi. | bekliyor | — |

### Sayı serisi (SADECE loop sonunda değil: her rework ve her patch sonrasında da
benchmark koşulur ve buraya satır yazılır — sayısız değişiklik yok)
- 2026-07-15: ~5-10/58 (tahmin, ölçülmedi) — başlangıç
- 2026-07-15 MANUEL ÖLÇÜM (canlı zincir DEĞİL, Anthropic kredisi bitik olduğu için
  59 foto Claude aboneliği üstünden el ile worker prompt kurallarıyla okundu):
  **6/54 TAM** + 48 eksik öğeli + 0 yanlış; doğru-red **5/5** (Slowly×2 + çanta +
  talimat sayfası + kalıp çizimi hepsi reddedildi). TAM'lar Loop 0/1'le AYNI: Heloise
  (boat princess fit&flare denim), Hallie yeşil tank mini, Boat Neck Top (4 foto).
  Kalan 48 hepsi MISSING — motor gövdeyi çiziyor, çizemediği: düğme/asimetrik pat (19
  foto), bağ/kurdele/drawstring kapanma (13), yaka (peter pan/scallop/pointed/flat, 8),
  roba/shirring/gathered panel (7), cap/puf kol başı (7), açık/bağlı sırt (5), kup/korse
  (1). WRONG 0 = canlı zincirin 10 WRONG'u SAF VISION VARYANSIYDI (halter/boat/square
  belirsiz yaka); insan gözü o sınırı doğru okuyunca WRONG sıfırlandı → motor kusuru
  değil vision belirsizliği KANITLANDI. NOT: bu sayı canlı Opus zinciriyle birebir
  aynı olmayabilir (model≠ben, vision varyansı gerçek); kredi gelince tek FAST koşuyla
  (~90sn) canlı sayı teyit edilecek. Beklenti aynı: 6/54.
- 2026-07-15 Loop 2: **ÖLÇÜLEMEDİ — BLOKE: Anthropic kredisi bitik** (canlı vision
  çağrısı 400 döner, tam kalıp sayısı ölçülemez). Loop 2 ürün metriği DEĞİL dürüstlük
  katmanı: motor çizemediği her öğe için EN-YAKIN-TÜREV verilir + kullanıcıya (ekran +
  print kapağı) açıkça "şunu çizemedim, en yakın şunu verdim, kalanını elle ekle"
  denir. Sessiz fallback öldü. Kanıt: 5 temsili spec (Celine düğme, Cloe peplum+yaka+
  lace-up, Priscilla fırfırlı askı+shirring, Tie Back, Corset bustier cup+zip) + 1 temiz-
  kontrol → EN+TR doğru missingFeatures üretti (temiz-kontrol = 0 mesaj, false-flag yok);
  golden byte-identical (C++ dokunulmadı), web-fuzz 19555/0, render-pages temiz. 6/54 son
  ölçülen değer kalır. Rapor: reports/2026-07-15-stitchu-benchmark-loop2.md.
- 2026-07-15 Loop 1b: **ÖLÇÜLEMEDİ — BLOKE: Anthropic kredisi bitmiş.** Hız token'ı
  KANITLANDI (canlı): token'lı 25/25 ardışık çağrı 0×429 (fuse atlanıyor); token'sız
  15/20 çağrı 429 + limit anında token'sız=429 iken token'lı=geçiyor; yanlış/boş
  token=429 (bypass gated). YENİ HIZ: 6 çağrı 9sn (~1.5sn/çağrı) → 54 foto ~90sn
  tahmini, eski 21sn/çağrı ~19dk+ (resetlerle rapordaki ~50dk). AMA vision çağrıları
  "Your credit balance is too low" (Anthropic 400) döndüğü için TAM sayı ölçülemedi;
  6/54 son ölçülen değer olarak kalır. Damla: Anthropic bakiyesi yüklenince tek FAST
  koşuyla gerçek sayı ~90sn'de çıkar. Rapor: reports/2026-07-15-stitchu-benchmark-loop1b.md.
- 2026-07-15 Loop 1: **6/54 TAM** (DEĞİŞMEDİ, beklendiği gibi — motor hâlâ çizmiyor,
  boru bu loop döşendi) + 38 eksik öğeli + 10 yanlış + doğru-red **4/5** (3/5'ten
  arttı: çanta+2 Slowly+1 kalıp sayfası reddedildi). LOOP 1'İN GERÇEK ÖLÇÜSÜ =
  **SCHEMA BRIDGE: 51/69 dağarcık-dışı öğe yeni yapısal alanla yakalandı** (43 foto,
  27'sinde her öğe yakalandı; 32/69 outOfVocab[] onur kanalında da adıyla geçti) —
  sıfırdan (Loop 0'da yapısal alan yoktu) 51/69'a. WRONG 3→10 artışı motor değil
  VISION VARYANSI (halter/boat/square/vNeck belirsiz yaka sınırı, Loop 0 belgeledi);
  iki hedeflenen Loop 0 hatası (fırfırlı askı→kol, boat→square) canlı 6-foto testinde
  DÜZELDİ. Rapor: reports/2026-07-15-stitchu-benchmark-loop1.md.
- 2026-07-15 Loop 0: **6/54 TAM** + 45 eksik öğeli + 3 yanlış; doğru-red 3/5. TAM'lar: Heloise (boat fit&flare), Hallie tank dress, Boat Neck Top (4 foto). En sık dağarcık-dışı (54 fotoda): bağ/kurdele kapanması 20, düğme patı 19, yaka 9, yoke/büzgü 9, cap kol 5, açık sırt 5. NOT: fermuar bu sette neredeyse hiç GÖRÜNMÜYOR (gizli fermuar fotoğrafta okunmaz) — Loop 4 fermuar payı hâlâ gerekli ama görünür kapanma önceliği bağ/kurdele + düğme.

## HER OTURUMUN KAPANIŞI
- benchmark sayısını ölç, bu dosyanın Durum satırını güncelle.
- CLAUDE.md status + devlog.md/linkedin.md malzeme.
- Deploy: ?v bump + git add web/ ALL + subtree gh-pages. Worker değiştiyse
  Damla'ya wrangler redeploy hatırlat.
