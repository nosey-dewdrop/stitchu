# DEVAM — LOOP 4 / PATCH 2.1: VİTRİN LOOP'U (yama notları + yerleşim + beta hunisi)

Zincirin parçası: DEVAM-VISION-LOOP.md'deki ortak kuralları oku (içerik logu,
yama notu, kanıt zorunluluğu, NEREDEYİZ güncelleme). Bu loop TEK session, otonom.

## STRATEJİ (Damla kararları, 2026-07-16 — bu loop'un anayasası)
1. **Şu anki tek hedef kitle: beta waitlist'ine yazılacak insan.** B2B mi B2C mi
   kararı SONRA; ondan önce beta sürüm var. Sitenin tek dönüşüm metriği =
   waitlist kaydı. Fiyat satmıyoruz, beta'ya davet ediyoruz.
2. **Yama notları bağ kurar (LoL modeli).** League of Legends her değişikliği
   yama notu olarak yazar ve oyuncu bunu okumaya GELİR. stitchu'nun benchmark
   loop tarihçesi zaten hazır yama notu malzemesi — dürüst, sayılı, "+3 aldık,
   kaçan +1 şurada" diyen bir tarihçe. Bunu siteye koymadık; koyunca ürün
   "canlı ve gelişiyor" hissi verir, waitlist'e yazılma sebebi olur.
3. **Sorun içerik değil YERLEŞİM.** Benchmark sayfası, API sayfası, kanıtlar —
   hepsi var ama Damla (developer!) bile siteye bakınca göremiyor. Müşteri
   hiç göremez. İş: bilgi mimarisini düzeltmek, yeni şey icat etmek değil.
4. **Hedef yol = StitchLift'in yolu (Damla, 16 Tem): hayali sat + SEO'yu patlat.**
   Asıl müşteri Etsy'de dükkan hayali kuran kişi; copy "para kazan" umuduna
   konuşur ("turn one photo into a sellable size run" ruhu). SEO altyapısı bu
   loop'a dahil: her sayfaya doğru title/meta/canonical, ld+json (SoftwareApplication
   + FAQ), sitemap.xml, patch notes = ilk içerik motoru. Blog/rehber yazıları
   (Etsy nasıl satılır vb.) AYRI bir iş, bu loop'ta değil — rapora backlog yaz.
5. **Evrensel beden (Damla, 16 Tem):** made-to-measure TEK mod olmaz; Etsy
   satıcısı XS-XL/EU34-52 size-run ister — motor /api/grade ile bunu ZATEN
   yapıyor, landing bunu görünür satsın ("one photo → a full size run").
   Ürün UI'ına standart-beden modu eklemek AYRI loop, burada sadece copy.

## İŞLER (sırayla)

### A — web/patches.html: yama notları sayfası
- LoL yapısı, stitchu tonu (couture-teknik, dürüst, vişne; abartı yok):
  her patch = numara + tarih + başlık + "ne değişti" 2-4 madde + sayı
  (FULL x/54 öncesi→sonrası ya da 0.00mm kanıtı) + 1 cümle dürüst not
  ("kuyruk +4 dedi, gerçek +3 çıktı" gibi — bu cümleler markanın sesi).
- GERİYE DOLDURMA: patch 1.0–1.9 = gerçek tarihçe. Kaynak: reports/
  2026-07-15/16-stitchu-benchmark-loop*.md + CLAUDE.md STATUS blokları +
  linkedin.md essay'leri. UYDURMA YASAK; her girdi rapordan gelir.
  1.0 etiketleme/ilk sayı 6/54 → 1.1 vision köprüsü → 1.2 dürüstlük katmanı →
  1.3 düğme patı → 1.4 bağ/kurdele → 1.5 denetim A → 1.6 puf kol →
  1.7 yaka ailesi → 1.8 metrik reformu → 1.9 büzgü + open-back (19→22/54).
  Zincirdeki 2.0 bittiyse onu da ekle (NEREDEYİZ'e bak).
- EN üstte kısa manifesto satırı: "every change, measured, published — misses
  included" ruhu (tam cümleyi session yazar, deniz-abartı yok).
- EN/TR (mevcut data-en/data-tr düzenini kullan), nav'a "patch notes" linki.

### B — index.html + tüm sayfalar: BABY BLUE TEMA + yerleşim (Damla onayı, 16 Tem)
- TEMA: vişne gider, BABY BLUE gelir — kontrat mocks/babyblue-stil-1.html'deki
  Damla'nın SEÇTİĞİ varyant (NEREDEYİZ altına hangi varyant yazılacak; seçim
  yazılmadan bu loop BAŞLAMAZ). Pötikare zemin CSS'ten, Didot serif korunur.
  Düğme MJ assetleri gelene dek CSS placeholder (docs/mj-button-prompts.md).
  Tema TÜM sayfalara uygulanır: index, benchmark, api, patches, privacy,
  create — yarım boyama yok.
- SAYFA GEÇİŞLERİ (Damla istedi): sayfalar arası yumuşak geçiş (View
  Transitions API + CSS fallback), sekmeler/bölümler arasında premium-akıcı
  his; abartı yok, 200-300ms.
- Hedef akış (Damla'nın sırası): girişte İLK ÖNCE WAITLIST — hero'da beta
  kaydı en üstte → hemen altında KANIT (0.00mm · 70,200 draft · on-device,
  tıklanabilir → benchmark.html) → sonra ÜRETİLMİŞ PATTERN GALERİSİ (madde C2)
  → nasıl çalışır → API şeridi. İkincil linkler (benchmark / API / patch
  notes / privacy) kalıcı görünür nav'da.
- Fiyat bölümü (api.html'deki indicative $19/$49 dahil): "beta" çerçevesine
  çevrilir — "beta partners: free, tell us your volume". Fiyat rakamları
  kaldırılır (Damla kararı: beta önce, satış sonra). Rakamlar raporda saklanır.
- Sayfaya görünür sürüm etiketi (v++) — Damla canlıda hard-refresh ile görür.

### C2 — ÜRETİLMİŞ PATTERN GALERİSİ (Damla, 16 Tem: "22 olmuşsun, onları koy")
- Benchmark'ta FULL çıkan her foto = motorun GERÇEKTEN çizdiği bir kalıp.
  Galeri bunları sergiler: her kart = kalıbın parça yerleşimi SVG'si
  (render-pages.mjs ile cached spec'lerden, gerçek ürün kodundan) + dürüst
  etiket ("halter mini dress — 9 pieces, drafted to EU38") + sayaç
  "22 of 54 real product photos → full pattern, and counting" (patch
  notes'a link; sayı results-*.json'dan, elle yazılmaz).
- TELİF KIRMIZI ÇİZGİ: kaynak Etsy ürün FOTOĞRAFLARI ASLA siteye konmaz
  (satın alınmış/telifli, benchmark-58/ gitignore). Sergilenen şey SADECE
  motorun kendi çıktısı (bizim SVG'ler) + jenerik stil adı.

### C — beta hunisi: tek kapı
- Landing'deki "Draft a pattern free" kalır (ürün ücretsiz, kanıt bu) ama
  hero'daki dönüşüm CTA'sı "join the beta" olur → mevcut /api/waitlist
  worker endpoint'ine aynı formla (api.html'deki gerçek capture düzeni,
  note: 'beta-waitlist' ayrımıyla). Canlıda 1 test kaydı at, çalıştığını
  HTTP cevabıyla kanıtla, raporda göster.
- Waitlist sayısını görme yolu: worker KV'den sayıyı okuyan küçük bir
  komut/script (lokal, admin) — Damla dönünce tek komutla "kaç kişi" görsün.

## KANIT + TESLİMAT (ortak kurallara ek)
- Deploy gh-pages, github.io URL'inde doğrula (custom domain değil), cache-bust.
- Rapor: reports/YYYY-MM-DD-stitchu-vitrin-loop.md — TAŞINANLAR/TAŞINMAYANLAR
  ayrı listeler + önce/sonra hiyerarşi listesi (ekran ekran, metin olarak).
  Damla dönünce canlıda kendisi gezer; "bitti" değil "canlıda, gezilmeyi
  bekliyor" denir.
- İçerik logu: essay ("yama notları neden bağ kurar / beta kararı") + reel +
  patch 2.1 girdisi (artık sayfa var, oraya).
- NEREDEYİZ güncelle (DEVAM-VISION-LOOP.md) + commit + push.
