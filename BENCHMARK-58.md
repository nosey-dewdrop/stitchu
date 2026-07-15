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

## OTURUM PLANI (sıra Damla onaylı: frekans × zorluk)
0. **Etiketleme + sayaç:** 58 fotonun her birine ground-truth (garment, dağarcık
   içi alanlar, dağarcık DIŞI öğeler listesi). tools/ altında ölçüm scripti:
   zincirden geçir → tam kalıp / eksik öğeli / yanlış say. İlk gerçek sayı buradan.
1. **Dürüstlük + deneme katmanı:** vision şemasına yapısal alanlar (closure,
   collar, straps, cupSeams, sleeveHead...) + motor çizemediğini KULLANICIYA
   söyleyen missingFeatures çıktısı (web'de görünür).
2. **Düğme patı** (en sık + en kolay geometri) — Closure::FrontButton post-pass.
   NOT: yarım kalmış bir strapless+pat denemesi 15 Tem'de geri alındı (revert);
   tasarım notları bu commit'in konuşma geçmişinde, mimari karar: makePrincessPieces'e
   opsiyonel dal + keyhole-tarzı opt-in post-pass, golden byte-identity korunur.
3. **Puf/büzgülü kol başı** (balon kol var; cap büzgüsü + yükseltilmiş cap).
4. **Strapless/bustier** (halter "frame shift" deseni şablon; kup ayrımı sonrası).
5. **Yaka ailesi** (stand collar önce — Buttoned Blouse fotoğrafı; sonra flat/shirt collar).
6. **Kup ayrımı** (upper/lower cup, dikiş uzunluğu eşitliği ölçülü) — en zor.
7. Sonrası etikete göre: pile, fiyonk, arka detaylar, asimetrik kapanma...

## HER OTURUMUN KAPANIŞI
- benchmark sayısını ölç, bu dosyanın Durum satırını güncelle.
- CLAUDE.md status + devlog.md/linkedin.md malzeme.
- Deploy: ?v bump + git add web/ ALL + subtree gh-pages. Worker değiştiyse
  Damla'ya wrangler redeploy hatırlat.
