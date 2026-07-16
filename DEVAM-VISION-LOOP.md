# DEVAM — stitchu VISION LOOP ZİNCİRİ (3 loop, her biri TEK session)

ÇALIŞMA DÜZENİ (Damla kuralı, 2026-07-16): her loop KENDİ session'ında koşar.
Session bu dosyayı + CLAUDE.md layer-denetimi bloğunu okur, SADECE kendi loop'unu
yapar, bitirirken aşağıdaki NEREDEYİZ satırını günceller + commit + push eder,
sonra Damla /clear deyip sıradaki loop'u taze session'da başlatır. Loop atlamak,
birleştirmek, "hazır başlamışken V2'yi de yapayım" YASAK.

## NEREDEYİZ
> SIRADAKİ: LOOP 1 (V0). Henüz hiçbiri koşmadı.

## TEŞHİS (2026-07-16, kanıtlı — zincirin varlık sebebi)
Katmanlar kod olarak ayrık ve temiz (L1 vision / L2 köprü / L3 motor / L4 çıktı).
Benchmark'ı ~%40'ta (19-22/54) tutan şey MOTOR DEĞİL, katmanlar arası DİL:
- 27 MISSING'in hepsi "engine cannot draw X" = vision görüyor, motorda kelime yok
  (kümelenme: foto başına 2-4 eksik, tek kelime eklemek fotoyu FULL yapmıyor).
- 7 WRONG'un 6'sı vision'ın kelime KARARSIZLIĞI: aynı garment'a square/halter/vNeck
  (beklenen boat/crew). Motor o yanlış spec'i kusursuz çiziyor. Tie Back polka'da
  oyuk+bağ ÇİZİLİ ama neckline="halter" okunduğu için foto WRONG düşüyor.
En ucuz +N motor değil vision kararlılığı. Kanıt: benchmark-58/results-2026-07-16.json.

## ORTAK KURALLAR (her loop için; ihlal = loop geçersiz)
- C++ motoruna, golden'a, DRAWN_SINCE'e DOKUNMA. Sadece worker.js vision
  prompt/şeması + ölçüm scripti. Golden byte-identical kalır.
- Her iddia ölçümle gelir; BENCHMARK-58.md güncellenmeden "oldu" DEME.
- Kredi kontrolü İLK İŞ: canlı /api/analyze 1 foto ile probe. Kredi yoksa offline
  kısmı yap, canlı ölçümü "KREDİ BEKLİYOR" bırak — uydurma sayı yok.
- Session sonu teslimat: reports/YYYY-MM-DD-stitchu-vision-loopN.md + linkedin.md
  essay + devlog.md reel + CLAUDE.md status bloğu + NEREDEYİZ güncelle + push.
- İÇERİK LOGU ZORUNLU (Damla kuralı, 2026-07-16): her session kendi gelişmesini,
  pivotunu, +N'ini ve teşhisini POST olarak loglar — linkedin.md'ye 300-500 kelime
  numaralı-zincir essay (ne + neden + karar, gerçek tarihçeden, uydurma yok) ve
  devlog.md'ye şablonlu reel (Hook 2sn + Anlatı ~45sn + Görsel + Format). Sayı
  kımıldamadıysa o da içerik: "neden kımıldamadı"nın kendisi post olur (Essay
  9/Loop 7 örneği). Önce mevcut dosyayı oku, çift kayıt açma.
- SKOR TABLOSU (Damla kuralı, 2026-07-16): tek ortak ilerleme dosyası
  **reports/stitchu-vision-progress.md** — her loop sonunda AYNI dosyaya bir satır
  eklenir (loop, tarih, FULL x/54, ELEMENT ACCURACY d/103, vision-accuracy,
  neckline-hata sayısı, 1 cümle not) + altında metriklerin ASCII bar grafiği
  (her satır bir koşu, █ ile oranlı bar; loop geçtikçe çubuk uzamalı). Dosya yoksa
  LOOP 1 açar, baseline satırını yazar. Grafik uydurma değil results-*.json
  snapshot'larından; her satırın yanına kaynak dosya adı.

## LOOP 1 — V0: VISION HATA TAKSONOMİSİ (offline, 0 kredi, ölçüm temeli)
1. benchmark-58/results-2026-07-16.json + cached-specs + manifest.json'ı eşleştir.
2. Her WRONG ve MISSING'i etiketle: kaynak vision mi motor mu köprü mü? Alan
   bazında: neckline / shaping / silhouette / closure / straps / diğer.
3. Çıktı: benchmark-58/vision-error-taxonomy.md (lokal klasörde kalır, gitignore)
   + rapora tablo: "vision-kaynaklı X foto, motor-kaynaklı Y, köprü-kaynaklı Z".
4. YENİ METRİK tanımla: **vision-accuracy** = kritik alanları (neckline, shaping,
   silhouette, closure.type) manifest'le eşleşen foto oranı. benchmark-58.mjs
   SUMMARY'ye üçüncü satır olarak ekle (DRAWN_SINCE mantığına dokunma). Bu sayı
   LOOP 2'nin before değeri. Taksonomi + baseline = bu loop'un TEK teslimatı;
   hiçbir prompt/kod düzeltmesi yapılmaz.
5. LOOP 2 için hedef listesi bırak: en çok vision hatası yiyen alan + foto adları.

## LOOP 2 — V1: NECKLINE DISAMBIGUATION (V0 tablosu ne derse ona nişan al)
V0 büyük ihtimalle neckline'ı gösterecek (bugünkü veri: JACKIE square,
Jackie-gingham vNeck, Mira + TieBack halter). Öyleyse:
1. worker.js vision prompt'una kural blok: ön+arka aynı garment'tır, TEK neckline
   kararı; halter SADECE boyna dolanan bant görünüyorsa; emin değilsen
   {boat,crew,scoop} çoğunluk sınıfına düş; arka foto ön neckline'ı değiştiremez.
   Gerekirse 2-3 few-shot örnek (kelimeyle, foto değil).
2. wrangler deploy (sadece vision worker; ürün akışı tarayıcı wasm'i, risk yok).
3. ÖLÇ: FAST koşu (x-sb-bench token, ~90sn). before/after: vision-accuracy +
   neckline-yanlış-okuma sayısı + FULL sayısı.
4. Regresyon bekçisi: FULL DÜŞERSE prompt değişikliği geri alınır, raporlanır.
Başarı: neckline yanlış-okuma before→after düştü, FULL düşmedi. Beklenti mütevazı:
bugünkü 7 WRONG'un 4-5'i neckline; hepsi düzelirse FULL +3-4 potansiyel.

## LOOP 3 — V3: ÖN/ARKA TUTARLILIK (kararsızlığın kökü)
Aynı elbisenin ön+arka fotoları şu an AYRI okunup çelişiyor (manifest'te aynı
ürünün çoklu ekran görüntüleri var — WRONG'ların çoğu arka-görünüm fotoları).
1. Çözüm adayları (session karar verir, küçük olanı seçer): (a) prompt kuralı
   "bu bir ürün arka görünümü olabilir; neckline'ı SADECE önden görünüyorsa
   raporla, yoksa null bırak" — null zaten benchmark'ta tolere ediliyor;
   (b) benchmark tarafında aynı-ürün fotolarını grupla, alan bazında çoğunluk oyu.
   (a) ürünü de düzeltir, (b) sadece ölçümü — ÖNCE (a) dene.
2. ÖLÇ: FAST koşu; ön/arka çelişki sayısı + vision-accuracy + FULL before/after.
3. Zincir sonu raporu: 3 loop'un toplam etkisi tek tabloda (FULL, ELEMENT
   ACCURACY, vision-accuracy: zincir öncesi → sonrası). Sıradaki faz kararını
   Damla'ya bırak: FAZ K (köprü delikleri: cupSeams/strapless) veya V4 (güven eşiği).
