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

### "çadır + boynuz + ızgara + yelpaze" (2026-07-19, kart MIHENK-03, babydoll port)
**Damla'nın sözü:** çok çirkin, referansla aynı evrende değil. (1) omuzlar sivri boynuz gibi, gövde çadır gibi — form komple yanlış: strapless band-top + fiyonk şart, kanat-çentikli ucube değil. (2) shirr bandı kumaş büzgüsü değil ızgara (üst üste düz çizgiler); dalgalı elle-çizilmiş sıra karakteri şart. (3) drape yelpaze: eşit açılı simetrik çizgiler, kumaş değil geometri; farklı boy + asimetri + seed'li dağılım. (4) etek ucu düz yay; referansın taraklı/dantelli kavisi yok.

**PARAMETRE ÇEVİRİSİ:**
1. FORM (en ağır): band-top strapless babydoll ÜRETİM renderer'ında yok — kol-oyuntulu bluz gövdesi çiziliyor, cap kanatları "boynuz", geniş etek "çadır" okunuyor. Çeviri: strapless stil için AYRI form yolu — düz üst kenar (band), omuz/kol/oyuntu YOK, üst kenarda kordon fiyongu. Referans buildHalf'in `top:'band'` dalı hedef.
2. SHIRR: rows düz `<line>` değil — her sıra taperInk dalgalı bump dizisi (referans kalemdeki sin-bump shirr). Mevcut port kısmen yaptı ama drawstring casing hâlâ 2 düz çizgi; bütün pano dalgalı olmalı.
3. DRAPE: simetrik eşit-açı yelpaze YASAK — drapePlan'ın seed'li asimetri + farklı boy (prim/ikincil die) üretim renderer'da tam çalışmalı; şu an her iki yön ayna simetrik çiziliyor, bir yönü diğerinden farklı seed almalı.
4. HEM: düz yay değil — taraklı/dantelli kavis (laceBand dili, referans hemPoints dalgası). Üretime port edilmedi.

**EMİR:** mevcut render üzerine iyileştirme YAPMA. Form sıfırdan strapless kurulsun; referansın babydoll'u (band + fiyonk + shirr dalgası + tarak hem) birebir hedef. Bu, gusto-lint silhouette_grammar + composition boyutlarının port-öncesi kör noktası — form yanlışsa çizgi dili düzelse de "aynı evren değil".

### ANA MADDE — FİGÜR KURALI + KALEM DİLİ GENELLEMESİ (2026-07-20, kartlar MIHENK-06/07/08 üçü de reject)
**Damla'nın sözü (ortak kök neden):** prenses/wrap/gode ÜÇÜ de eski üretim kalemiyle
çiziliyor; referans kalemin dili band-top köprüsüyle SADECE babydoll ailesine taşınmış,
diğer siluetler şematik. İki kusur her üçünde:
1. **FİGÜR ÜÇGEN/HUNİ:** gövde omuzdan eteğe düz genişliyor. Damla'nın figür dili GERÇEK
   38 beden kadın: **bel oyulur, kalça dolgun, omuz-kalça dengeli; elbise bir VÜCUDUN
   üstünde durur gibi okunmalı.** Üçgen/huni/heyula gövde YASAK.
2. **CETVEL HEM + GEOMETRİ-DEĞİL-KUMAŞ:** hem düz yay, seam düz Q-flare, gode panelleri
   kumaştan değil geometriden açılıyor; döküm/akış yok. Referans kalemin dalgalı hem
   (hemPoints), drape (drapePlan), taper mürekkep dili şart.

**PARAMETRE ÇEVİRİSİ (BÜYÜK İŞ — kalem dili genellemesi):**
1. **Figür grameri portu:** referans kalem buildHalf'in figür S-eğrisi (waistNip ile bel
   daralması + skirtFull ile kalça/etek dolgunluğu + armholeHollow oyuntu + omuz eğimi +
   bust apex kavisi) üretim renderer'ın halfOutline'ına TÜM siluetlere taşınır. Mevcut
   üretim nip'i VAR ama zayıf (tube okuyor) — referans oranlarına çekilir.
2. **Dalgalı hem + drape + taper:** hemPoints (dalgalı etek ucu), drapePlan asimetri,
   taper mürekkep üretim renderer'ın etek/hem yolunda kullanılır (şu an düz Q + düz drape).
3. **Wrap asimetrik surplice:** sahte simetrik vNeck notch + kesik overlap çizgisi YASAK.
   Outline'ın bir yarısı gerçekten surplice V ile kesilir (asimetrik, F3 hakkı); overlap
   gerçek sarma akışı gibi (kesik dikiş izi değil).
4. **gode döküm:** panel seam'leri düz Q-flare değil, kumaş dökümü gibi hafif S + hem'de
   dalgalanma (referans hem dili).

**gusto-lint bağlantısı (yeni ölçü adayları, korpus donmuş — v1.1 sonrası):**
- **figure_ratio** boyutu: bel/omuz oranı < 1 (bel daralmış), kalça/bel oranı > 1 (kalça
  dolgun) — üçgen gövde (monoton genişleme) eşik-altı. Şu an silhouette_grammar bunu
  yakalamıyor (spec kombosuna bakıyor, figür S-eğrisine değil).
- **hem_liveliness:** hem düz yay mı dalgalı mı (nokta sayısı + y-varyansı).

**EMİR (Damla):** acele yok, DOĞRU olsun. Üç mihenk de YENİ dille yeniden üretilir,
ızgaralar aynı formatta. Bu v1.1 tag'inin ÖNÜNDE.

## Bilinen zevk sınırları (mevcut hafızadan tohum, henüz kart değil)
Bunlar Damla'nın geçmiş sözlerinden; kart reddi geldiğinde buraya taşınıp gusto-lint ölçüsüne bağlanacak:
- "ölü büzgü" → gather_density_ratio bandı + drape fold canlılığı (composition_bands); büzgü var ama hareketsiz görünüyorsa
- "steril" → composition_bands 0-dash cezası (hiç drape/işaret yok)
- "kaba" → line_hierarchy (tek kalın katman, incelik yok) + oran bandı
- "çok parça / puzzle gibi" → piece_page_bands (parça sayısı emsal üstü)
- "randomluk algın yok" → seed/drape dağılımı tekdüze (F2 kalem işi)
