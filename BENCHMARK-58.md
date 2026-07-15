# BENCHMARK-58 — "yaptım" sayacı (ana loop dosyası)

Damla'nın kararı, 2026-07-15 akşam. Bu dosya sonraki TÜM oturumların anayasası.
Önce CLAUDE.md'yi, sonra bunu oku. Rapor: reports/2026-07-15-stitchu-canli-zincir-testi-ve-register.md

## TEK METRİK
Damla'nın attığı 58 gerçek ürün fotoğrafından (benchmark-58/photos-1024/) kaçında
zincir **O ÜRÜNÜN tam kalıbını** veriyor. Hedef **58/58**; ara eşik en az **%80 (47/58)**.
Bu sayının dışında "yaptım / oldu / bitti" DEMEK YASAK. Her oturum sonunda sayı
yeniden ölçülür ve buraya işlenir.

Durum: **~5-10/58 (tahmin, 2026-07-15)** — henüz etiketlenmedi, oturum 0 ölçecek.

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

### Kuyruk
| # | Loop | İş | Durum | 58'de |
|---|------|-----|-------|-------|
| 0 | Etiketleme + sayaç | photos-1024'teki her foto için ground-truth manifest (garment, dağarcık-içi alanlar, dağarcık-DIŞI öğeler; Slowly ekranı 13.30.50 + çanta 13.51.19 + kalıp-çizimleri = doğru-red testleri). tools/ altında ölçüm scripti: zincirden geçir → tam kalıp / eksik öğeli / yanlış. İLK GERÇEK SAYI buradan. | bekliyor | — |
| 1 | Vision köprüsü | worker şemasına yapısal alanlar: closure, collar, straps, cupSeams, sleeveHead, gathering, outOfVocab[] — serbest metin details ölür, alan doğar. worker.js:285. Wrangler redeploy gerekir → Damla'ya not. | bekliyor | — |
| 2 | Dürüstlük + deneme katmanı | Motor çizemediği öğeyi ÖNCE çizmeye uğraşır (en yakın türev), gerçekten formül yoksa web'de görünür missingFeatures ile kullanıcıya söyler: "şu ikisi kalıpta YOK". Sessiz fallback ölür. | bekliyor | — |
| 3 | Düğme patı | Closure::FrontButton post-pass. DİKKAT: 15 Tem'de yarım strapless+pat denemesi revert edildi; mimari karar sabit: makePrincessPieces'e opsiyonel dal + keyhole-tarzı opt-in post-pass, golden byte-identity korunur. | bekliyor | — |
| 4 | Fermuar payı | Kapanma zincirinin ikinci yarısı: fermuar payı + kapanma tipine göre dikiş payı farkı. Pat'la aynı post-pass mimarisi. | bekliyor | — |
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

### Sayı serisi (her loop sonunda buraya bir satır)
- 2026-07-15: ~5-10/58 (tahmin, ölçülmedi) — başlangıç

## HER OTURUMUN KAPANIŞI
- benchmark sayısını ölç, bu dosyanın Durum satırını güncelle.
- CLAUDE.md status + devlog.md/linkedin.md malzeme.
- Deploy: ?v bump + git add web/ ALL + subtree gh-pages. Worker değiştiyse
  Damla'ya wrangler redeploy hatırlat.
