# DEVAM — stitchu VISION LOOP ZİNCİRİ (4 loop, her biri TEK session, OTONOM)

ÇALIŞMA DÜZENİ (Damla kuralı, 2026-07-16 güncel): zincir OTONOM koşar — Damla
yok. Orkestratör ana oturum her loop'u taze context'li arka plan agent olarak
açar (taze agent = Damla'nın /clear'ı), agent bu dosyayı + CLAUDE.md
layer-denetimi bloğunu okur, SADECE kendi loop'unu yapar, bitirirken NEREDEYİZ
satırını günceller + commit + push eder; orkestratör sıradakini açar. Loop
atlamak, birleştirmek, "hazır başlamışken V2'yi de yapayım" YASAK.
SIRA: LOOP 1 (V0) → LOOP 4 (vitrin, DEVAM-LANDING-LOOP.md — krediden bağımsız,
öne alındı) → LOOP 2 (V1) → LOOP 3 (V3).

YAMA NUMARALARI (Damla kuralı: LoL yama notları gibi, bağ kurar; numara =
YAPILMA SIRASI): eski BENCHMARK-58 loop'ları = patch 1.x (1.0 Loop 0
etiketleme ... 1.9 Loop 9b open-back; vitrin loop'u reports/'tan geriye
doldurur). Bu zincir yapılma sırasıyla: **2.0 = V0 taksonomi, 2.1 = vitrin,
2.2 = V1 neckline, 2.3 = V3 ön/arka.** Her session raporunda ve yama notları
sayfasında bu numarayı kullanır.

## NEREDEYİZ
> ZİNCİR BİTTİ (V0→V4-karar, 2026-07-16). ÖNERİ: FAZ K. Gerekçe: zincir sonu ölçümü
> (son FAST koşusundan, kredi vardı) vision-accuracy 86.8%→94.4% (>=%85) AMA FULL
> zincir boyunca 22→24 sadece +2 (<+3) → ruler dalı (a): kelimeler temizlendi, fren
> artık köprü/kümelenme (24 MISSING: L1 görüyor L3 çizemiyor — cupSeams/strapless/cap
> sleeve/asymmetric placket/yoke). WRONG 7→4, sadece 2'si neckline → vision baskın
> kaldıraç DEĞİL, dolayısıyla V4 birincil değil ama 2.3 kanıtı (dürüst null cezalanıyor)
> onu FAZ K sonrası NOTLU runner-up yapar. Karar bloğu: reports/stitchu-vision-progress.md
> (CHAIN-END DECISION tablosu + öneri). Bu agent karar agent'ı — içerik logu YAZMAZ.
>
> --- ÖNCEKİ (LOOP 3 / patch 2.3, reverted) ---
> LOOP 3 (V3 ÖN/ARKA / patch 2.3) BİTTİ ve GERİ ALINDI (2026-07-16). Kredi VAR (canlı probe
> geçerli vision döndü). Aday (a) denendi: worker prompt'una "kısmi görünümde (arka/giyilmiş/
> yakın-detay) önden okunan alanları (neckline/shaping/waistline/skirtStyle) null bırak; tek
> elbise tek okuma" iki cümlesi. Sıfır C++/motor, golden byte-identical. wrangler deploy
> (d1dff290). Canlı FAST koşu (59 çağrı, ~8dk), aynı koşullar before/after: vision-accuracy
> %86.8→%87.0, neckline misreads 5→4, AMA FULL 24→21. Sebep: benchmark arka fotoğrafı hâlâ
> önün yakasıyla etiketliyor → dürüst null bir puan kaybettiriyor (JACKIE arkası crew→null,
> FULL→WRONG). REGRESYON BEKÇİSİ ÇALIŞTI: worker 2.2'ye geri alındı (git diff temiz, byte-
> birebir), yeniden deploy (c9fcc992), results-2026-07-16.json 2.2 baseline'ına geri yüklendi.
> Yayınlanan sayı 24/54 KALIR. Ön/arka çelişki 15(V0)→8(post-2.2, bu loop'un before'u). LOOP 3'ün
> çıktısı +N değil KANIT: kalan çelişkiler prompt değil ÖLÇÜM artefaktı → doğru kaldıraç aday (b)
> (aynı ürünün ön+arka fotolarını grupla, alan bazında çoğunluk oyu; benchmark-script, ürün riski
> yok). 2.3 deneyi V4 (güven eşiği) LEHİNE somut kanıt: dürüst null şu an cezalanıyor.
> web/patches.html patch 2.3 girdisi ("reverted", EN/TR, v60, deployed). Skor:
> reports/stitchu-vision-progress.md (L3 satırı + yeni ön/arka-çelişki barı). Rapor:
> reports/2026-07-16-stitchu-vision-loop3.md. İçerik: linkedin Essay 16 + devlog Z3.
> ZİNCİR SONU: V0→V3 toplam FULL 22→24 (+2), vision-accuracy 86.8%→94.4%, neckline misreads 5→2,
> ön/arka çelişki 15→8 — hepsi prompt kelimesi, sıfır motor. SIRADAKİ FAZ KARARI DAMLA'DA:
> V3-b (ölçüm çoğunluk oyu) / FAZ K (cupSeams/strapless köprü) / V4 (vision güven eşiği).
>
> --- ÖNCEKİ (LOOP 2 / patch 2.2) ---
> LOOP 2 (V1 NECKLINE / patch 2.2) BİTTİ (2026-07-16). worker.js vision prompt'una yaka
> belirsizlik-giderme bloğu (ön+arka TEK garment TEK yaka; arka/giyilmiş foto önün yakasını
> uyduramaz; nape fiyonk/oyuk = arka detay, halter değil; halter SADECE boyna dolanan bant;
> emin değilsen boat/crew/scoop). Sıfır C++/motor. wrangler deploy (5cb94ca5). Canlı FAST
> koşu (59 çağrı, 8dk20sn), aynı koşullar before/after: yaka yanlış-okuması 5→2,
> vision-accuracy 46/53(%86.8)→51/54(%94.4), FULL 22→24 (+2), WRONG 7→4. Düzelen 3 arka
> görünüm: Mira (halter→null+tieBack), Jackie gingham (vNeck→crew), TieBack polka
> (halter→boat+tieBack, FULL'a geçti). Kalan 2 yaka hatası arka karışıklığı DEĞİL, gerçekten
> belirsiz ÖN çekim (JACKIE front square, bir vNeck) = metin düzeltmesinin dürüst tavanı.
> Regresyon bekçisi: FULL yükseldi, revert YOK. ELEMENT ACCURACY 53/103 sabit (vision loop).
> web/patches.html patch 2.2 girdisi (now, EN/TR). Skor: reports/stitchu-vision-progress.md
> (L2 V1 satırı + 4 bar). Rapor: reports/2026-07-16-stitchu-vision-loop2.md.
> SIRADAKİ: LOOP 3 (V3 ön/arka tutarlılık / patch 2.3).
>
> --- ÖNCEKİ (LOOP 4 / patch 2.1) ---
> LOOP 4 (VİTRİN / patch 2.1) BİTTİ (2026-07-16). Site vişne→bebek mavisi RESKIN
> (yerleşim/Didot korundu, pötikare sadece hero); web/patches.html LoL yama notları
> (1.0–2.0 geriye dolduruldu, EN/TR); hero CTA "join the beta" → canlı /api/waitlist
> (probe HTTP 200 {"ok":true}); fiyat rakamları beta çerçevesine; sayfa geçişleri
> (View Transitions + CSS fallback, 260ms); pattern galerisi sayacı 22/54 (sadece
> motorun kendi SVG'leri, Etsy fotoğrafı YOK). FULL 22/54 DEĞİŞMEDİ (vitrin motora/
> vision'a dokunmaz). Deploy v59, github.io doğrulandı. TAŞINMAYANLAR: MJ düğmeler
> (Damla üretecek, CSS placeholder), style-library 24 sayfa gövdesi (backlog),
> waitlist KV-sayaç script (worker gerektirir, backlog). Rapor:
> reports/2026-07-16-stitchu-vitrin-loop.md. SIRADAKİ: LOOP 2 (V1 neckline
> disambiguation) — before=vision-accuracy 46/53, neckline-misreads 5, 5 hedef
> foto (JACKIE/Mira-back/Jackie-gingham-back/TieBack-polka-back/Ruby-Pea-Coat).
>
> --- ÖNCEKİ (LOOP 1 / patch 2.0) ---
> LOOP 1 (V0 / patch 2.0) BİTTİ (2026-07-16). Taksonomi + baseline kuruldu, sıfır
> kod düzeltmesi (V0 kuralı). KREDİ VAR (probe geçerli vision döndü). Güncel
> DRAWN_SINCE reclassify: FULL 22/54, 7 vision-kaynaklı (WRONG) / 24 motor-kaynaklı
> (MISSING) / 0 köprü-kaynaklı. YENİ baseline vision-accuracy=46/53=%86.8, neckline
> misreads=5. dominantErrorField=NECKLINE (5/7 WRONG, 5/8 çelişen ürün),
> frontBackConflicts=15 (8 üründe; arka/worn foto ön yakayı eziyor). LOOP 2 hedefi:
> 5 yaka fotosu (13.47.49 JACKIE, 13.48.06 Mira back, 13.48.17 Jackie gingham back,
> 13.50.24 TieBack polka back, 13.51.24 Ruby Pea Coat). benchmark-58.mjs'ye
> vision-accuracy 3. SUMMARY bloğu eklendi. Taksonomi: benchmark-58/vision-error-taxonomy.md.
> Skor: reports/stitchu-vision-progress.md. Rapor: reports/2026-07-16-stitchu-vision-loop1.md.
> SIRADAKİ: LOOP 4 (vitrin, DEVAM-LANDING-LOOP.md).
> VİTRİN TEMA KARARI (Damla, 16 Tem, TEYİTLİ SON HALİ — "evet" alındı):
> RESKIN. Mevcut landing'in YERLEŞİMİ/KOMPOZİSYONU/Didot tipografi yapısı
> korunur ("vişnenin stili yerleşimi güzeldi, ona skin"); RENK DÜNYASI
> DEĞİŞİR: vişne #8f2038 → baby blue dünyası, metin beyazdan LACİVERT/NAVY'ye
> (kontrast şart). Pötikare duvar kağıdı SADECE girişte (hero/waitlist);
> diğer bölüm ve sayfalar sakin beyaz-mavi (varyant 2 ruhu). Gerekli
> renk/font ve yerleşim değişiklikleri SERBEST (Damla onayı) ama kompozisyon
> ruhu bozulmaz. MJ düğmeler TEAL/NAVY BLUE üretilecek (Damla tasarlatır,
> docs/mj-button-prompts.md); gelene dek CSS placeholder.

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
- YAMA NOTU ZORUNLU: her session kendi patch girdisini yazar (patch 2.x —
  tarih, ne değişti, sayı öncesi→sonrası, 1-2 cümle dürüst not). Sayfa
  web/patches.html varsa oraya ekler + deploy; henüz yoksa girdiyi raporun
  başına PATCH bloğu olarak koyar (LOOP 4 sayfayı kurunca taşır).
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

## ZİNCİR SONRASI YÖN (16 Tem derin analiz — reports/2026-07-16-stitchu-mimari-derin-analiz.md)
Sıra: V (kelimeleri kararla) → K (köprü TEK KAYNAK sözlük: worker şeması +
create.js pick* + missing.js + enum uyumu tek vocab dosyasından denetlenir) →
FAZ P (ORAN KATMANI, yeni): şemaya kelime + boyutsuz SAYI (neckline.depth,
skirt.length oranı, puf fullness, ease sınıfı fitted/regular/oversized) —
enum kayıplılığına gerçek cevap; motor zaten sürekli girdiyle çalışıyor,
kitap clamp'leri dikilebilirliği korur → M (motor, marjinal kazanç sırası).
Keypoint / backend-taşıma / morphing KANITLA REDDEDİLDİ (rapora bak), yeniden açma.
