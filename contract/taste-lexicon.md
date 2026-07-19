# ZEVK SÖZLÜĞÜ — Damla'nın gerekçe → parametre çevirisi
> DEVAM-FASHION anayasa: Damla bir kontakt kartını "değil + tek cümle gerekçe" ile reddettiğinde, gerekçe BURAYA işlenir ve gusto-lint'e ölçü adayı olur. Sonraki turlar sözlükten başlar. Korpusa fiili giriş bir sonraki DEVAM'da (kilit: korpus F1-F3 donmuş). Bu dosya gerekçeleri BİRİKTİRİR, korpusu değiştirmez.

## Format
Her giriş: `gerekçe (Damla'nın sözü)` → `parametre çevirisi (gusto-lint hangi boyut/eşik)` → `kaynak kart`

## Girişler

### "parantez çizgi" (2026-07-19, kart MIHENK-01, m1 prenses fitted elbise)
**Damla'nın sözü:** gövde içindeki prenses dikiş çizgileri düz parantez gibi dışa bombeli iki simetrik vektör yayı olarak duruyor; gerçek prenses hattı kol oyuntusu/omuzdan göğüs noktası (apex) üzerinden bele S-kıvrımıyla, vücudu takip ederek iner — amaçlı ve zarif, bunlar rastgele bombeli. Ayrıca dikiş çizgisi kontur ile aynı ağırlıkta okunuyor (orta katman eksik); vektör-şema hissinin yarısı bu.

**KATMAN AYRIMI (kanıt):** Bu bir F2 ÇİZİM DİLİ kusurudur, kalıp geometrisi DEĞİL. Motor prenses seam KESİM konturunu zaten anatomik doğru üretiyor (bodice.cpp:286-345: armhole → bust apex → waist, apex üstünde ortak kübik, altında dart-türevi kenarlar). Damla'nın gördüğü "parantez", flat render'ın İÇ İŞARET çizgisi (markings) — kesim konturu değil. İki katman ayrı: geometri doğru, flat'in iç çizgi dili yanlış okutuyor.

**PARAMETRE ÇEVİRİSİ (F2 iş emri + gusto-lint ölçü adayı):**
1. Prenses seam iç çizgisi = ANATOMİK KONTROL NOKTALARINDAN geçen S-eğrisi: oyuntu-girişi → göğüs apex → bel. Rastgele/simetrik-bombeli quadratic YASAK; apex noktasını gerçek geçen kübik. (F2 çizim dili; kalıp geometrisindeki apex zaten var, flat onu kullanmalı.)
2. Dikiş çizgisi AĞIRLIK KATMANI: iç dikiş çizgisi konturdan (2.0) ince olmalı — orta katman 1.4 (line_hierarchy'nin eksik katmanı). Kontur ile eşit ağırlık = vektör-şema hissi.

**gusto-lint bağlantısı:** line_hierarchy boyutu zaten 3-katman (2.0/1.4/1.0) ölçüyor ve mevcut flat'lerde 1.4 katmanının EKSİK olduğunu yakalıyor (kalibrasyon: 2/3 katman). Bu giriş o ölçüyü DOĞRULUYOR — Damla'nın gözü ve lint aynı kusuru gösteriyor. F2 çizgi hiyerarşisini motora taşıyınca line_hierarchy skoru yükselecek. YENİ ÖLÇÜ ADAYI (v1.1 sonrası korpus güncellemesi): "iç seam çizgisi anatomik kontrol noktalarından mı geçiyor" (apex'e yakınlık metriği) — şimdilik korpus donmuş, bu aday taste-lexicon'da bekliyor.

## Bilinen zevk sınırları (mevcut hafızadan tohum, henüz kart değil)
Bunlar Damla'nın geçmiş sözlerinden; kart reddi geldiğinde buraya taşınıp gusto-lint ölçüsüne bağlanacak:
- "ölü büzgü" → gather_density_ratio bandı + drape fold canlılığı (composition_bands); büzgü var ama hareketsiz görünüyorsa
- "steril" → composition_bands 0-dash cezası (hiç drape/işaret yok)
- "kaba" → line_hierarchy (tek kalın katman, incelik yok) + oran bandı
- "çok parça / puzzle gibi" → piece_page_bands (parça sayısı emsal üstü)
- "randomluk algın yok" → seed/drape dağılımı tekdüze (F2 kalem işi)
