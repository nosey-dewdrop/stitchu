# DEVAM — FAZ D: VERİ HATTI (foto toplama + kelime madenciliği + kendi CV'miz)

Damla direktifi (16 Tem akşam): "fotoğrafları senin bulman lazım — Chanel/Dior/YSL +
Stradivarius/Zara/Bershka + moda dergileri; onlarla kelime dağarcığı artmalı; yavaş
yavaş CV geliştirmeye de başla. Token benden, mühendislik senden."

## KIRMIZI ÇİZGİLER (pazarlık yok)
- Toplanan HER fotoğraf LOKAL kalır: dataset/ klasörü gitignore'lu, ASLA push edilmez,
  ASLA siteye/içeriğe konmaz (benchmark-58 fotoğraflarıyla aynı rejim). Fotoğraflar
  sadece iki iç iş için: kelime madenciliği (vision etiketleme) + öğrenci model eğitimi.
- Toplama SAYGILI: rate-limit (istek başına bekleme), sadece herkese açık ürün/lookbook
  sayfaları, robots.txt'e bak, paywall arkasına girme (Vogue arşivi vb. YOK).
- Marka isimleri iç manifest'te kalır; kamuya açık hiçbir yerde "X markasından topladık"
  denmez.

## GERÇEKÇİ SIRA (ürün fotoğrafı > podyum fotoğrafı)
E-ticaret ürün sayfası fotoğrafları (Zara/Bershka/Stradivarius/Mango...) motor için
EN İYİ veri: düz duruş, ön/arka çekim, net giysi — benchmark'taki Etsy ekran
görüntüleriyle aynı tür. Podyum/dergi fotoğrafı (couture) ise açı/ışık/drape yüzünden
vision'a zor; onlar İKİNCİ dalga ve amaçları farklı: inşa TERİMİ çeşitliliği
(dağarcık genişliği), sayı değil.

## D1 — TOPLAYICI (tek seferlik alet + tekrar koşulabilir)
- engine/tools/collect.mjs (ya da .py): kaynak listesi config'ten; kategori sayfası →
  ürün foto URL'leri → indir → 1024px'e küçült → dataset/<marka>/<id>.jpg +
  dataset/manifest.json (kaynak URL, marka, kategori, tarih, hash-dedup).
- İlk parti hedefi: high-street 3 markadan elbise/üst/etek kategorileri, ~300-600 foto.
  Vogue/on binler HEDEF DEĞİL şimdilik — önce boru çalışsın, ölçek sonra.
- dataset/ .gitignore'a eklenir (İLK İŞ, foto inmeden önce).

## D2 — KELİME MADENCİLİĞİ (dağarcık haritası, token harcar)
- Toplanan fotolardan örneklem (ilk tur ~50-100) canlı /api/analyze'dan geçir
  (x-sb-bench token, FAST tempo), outOfVocab terimlerini topla.
- Çıktı: dataset/vocab-frequency.md — terim × frekans × hangi markalarda tablosu.
  Bu tablo FAZ M kuyruğunun YENİ pusulası olur (58-set frekansı yerine pazar frekansı).
- Her tur BENCHMARK'a DOKUNMAZ (58-set ayrı, held-out ilkesi); istersek yeni setten
  20-30 foto "held-out v2" olarak kenara ayrılır, hiç optimize edilmez.

## D3 — KENDİ CV'MİZ (Track B damıtma, yavaş yavaş)
- Aşama 1: etiket ambarı — D2'de Opus'un verdiği her yapısal etiket (garment/neckline/
  sleeve/closure/...) dataset/labels/*.json olarak birikir. Her analiz çift işe yarar:
  bugün kelime frekansı, yarın eğitim verisi.
- Aşama 2: öğrenci model iskeleti — küçük görüntü sınıflandırıcı (ONNX, tarayıcıda
  koşabilir), alan-başına kafa (neckline classifier önce: en çok etiketli alan).
  İlk milestone: SADECE neckline'da öğrenci vs Opus uyumu ≥%85 → rapor.
- Aşama 3 (sonra): tüm alanlar + tarayıcıya gömme + maliyet sıfır. Aceleye gerek yok;
  etiket ambarı büyüdükçe model kendiliğinden mümkün olur.

## ÇALIŞMA DÜZENİ
Tree-loop deseni: her D-dalı tek session, sayıyla döner (D1: kaç foto/kaç kaynak,
D2: kaç terim/frekans tablosu, D3: uyum yüzdesi), rapor + yama notu + skor satırı yazar.
Öncelik sırası beklenen kazanç/maliyet: D1 (ucuz, her şeyin önkoşulu) → D2 küçük tur
(orta token, FAZ M pusulasını düzeltir) → D3 aşama 1 (bedava, D2'nin yan ürünü) →
D2 büyük tur / D3 aşama 2 (Damla onaylı token).
