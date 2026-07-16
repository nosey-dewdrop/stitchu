# DEVAM — LOOP 4 / PATCH 2.3: VİTRİN LOOP'U (yama notları + yerleşim + beta hunisi)

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
  Zincirdeki 2.0/2.1 bittiyse onları da ekle (NEREDEYİZ'e bak).
- EN üstte kısa manifesto satırı: "every change, measured, published — misses
  included" ruhu (tam cümleyi session yazar, deniz-abartı yok).
- EN/TR (mevcut data-en/data-tr düzenini kullan), nav'a "patch notes" linki.

### B — index.html yerleşim: görünürlük onarımı (redesign DEĞİL)
- KIRMIZI ÇİZGİ: görsel dil AYNEN kalır — vişne #8f2038, tipografi, mevcut
  bileşen stili, whimsy yok. Kör redesign YASAK; bu loop sadece HİYERARŞİ ve
  YERLEŞİM taşır. Şüphede kalırsan taşıma, rapora yaz.
- Hedef durum (müşteri 5 saniyede görmeli): (1) ne bu → (2) kanıt bar'ı
  (0.00mm · 70,200 draft · on-device) tıklanabilir, benchmark.html'e →
  (3) TEK birincil CTA: beta waitlist. İkincil linkler (benchmark / API /
  patch notes / privacy) kalıcı görünür nav'da — şu an sayfanın dibinde
  kaybolan her şey yukarıda adresli olsun.
- Fiyat bölümü (api.html'deki indicative $19/$49 dahil): "beta" çerçevesine
  çevrilir — "beta partners: free, tell us your volume". Fiyat rakamları
  kaldırılır (Damla kararı: beta önce, satış sonra). Rakamlar raporda saklanır.
- Sayfaya görünür sürüm etiketi (v++) — Damla canlıda hard-refresh ile görür.

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
  patch 2.3 girdisi (artık sayfa var, oraya).
- NEREDEYİZ güncelle (DEVAM-VISION-LOOP.md) + commit + push.
