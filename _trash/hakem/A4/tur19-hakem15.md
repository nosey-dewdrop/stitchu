# Tur 19 — Hakem 15 (kör hakem, yalnız png) — 2026-09-10

Kural: yalnız `KOSU/ciktilar/giris-3/{1..11}/flat.png` açıldı. Repo'da başka dosya açılmadı. Karşılaştırma ölçütü bu turda web'den çekilip Read ile açılan 7 satıcı flat'i (aşağıda). Scratchpad'deki eski referanslar kullanılmadı.

## 1. Web kaynakları (bu turda çekildi ve açıldı)

| # | Satıcı / ürün | URL (görsel) | Gözlem |
|---|---|---|---|
| R1 | Style Arc — Naomi Woven Dress | https://www.stylearc.com/wp-content/uploads/naomi-woven-dress-g524661.jpg (ürün: https://www.stylearc.com/shop/sewing-patterns/naomi-woven-dress/) | Ön+arka ayrı, "FRONT/BACK" etiketli, çağrı okları ile öğe adları (drawstring, elastic, side splits). Dış kontur kalın, iç dikiş/kırışık ince; büzgü kısa düzensiz çizgilerle, ip uçları düğümlü; etek ucu hafif dalgalı; kol balonu dışa doğru. |
| R2 | Sew Over It — Betty Dress | https://sewoverit.com/cdn/shop/files/BettyDresslinedrawing_1200px.png (ürün: https://sewoverit.com/products/betty-dress-sewing-pattern) | Ön ve arka ayrı, aynı ölçek. Kalın kontur / ince pens+kırma çizgisi; göğüs pensi yan dikişten, bel pensi bel dikişinden açılıyor (pens her zaman bir kenara bağlı); arka V yaka + CB fermuar; etek ucunda kesikli baskı dikişi; omuz-boyun noktasında küçük yukarı tırnak var (yaka pervazı). |
| R3 | Helen's Closet — York Pinafore | https://helensclosetpatterns.com/cdn/shop/files/york_pinafore_flat_illustration.jpg | Gri kroki üstüne flat; View A/B, ön+arka. Cepler kesikli baskı dikişiyle bedene bağlı; etek ucunda kesikli tela çizgisi; kalın/ince hiyerarşi net; düz kesim bol pinafore düz silüetle çizilmiş. |
| R4 | Muna & Broad — Hexham Dress (views) | https://www.munaandbroad.com/cdn/shop/products/HexhamViews_1500x.png | 8 görünüm (view × arka). Kol bantları, yaka bandı, CB dikiş tek ince çizgi; A-line trapez bol, düz kesim düz. Etek ucu düz bant (ribbed). |
| R5 | Muna & Broad — Huon Shirt & Dress | https://www.munaandbroad.com/cdn/shop/files/HuonShirtandDresslinedrawing_1000x.png | Yaka altı büzgü: kısa, düzensiz, seyrek çizgiler yakaya bağlı; balon kol manşete büzülmüş; ön pat kesikli topstitch; etek ucu dalgalı (kumaş düşüşü); cep ağzı ince diyagonal. |
| R6 | Pattern Emporium — Long Weekend Tank Dress | https://patternemporium.com/cdn/shop/files/LINE-DRAWING-Long-Weekend-Tank-Dress-with-Side-Splits-Wide-Binding-Sewing-Pattern-Emporium.jpg | Etiketli feature flat + altta ön/arka boy varyantları küçük flat. Bel dikişi arkada, yırtmaç, bağlama kuşak düğümlü; oturan silüet vücut kavisiyle. |
| R7 | Jalie 3460 Bella (zarf arkası) | https://jalie.com/cdn/shop/products/3460-bella-fit-and-flare-dress-jalie-8.png | Prenses dikişli fit&flare; ön/arka ("DOS/BACK") aynı ölçek; etek ucu kavisli; kol varyantları yan yana; ince tek çizgi stil. |

Ulaşılamayan: seamwork.com katalog/ürün sayfaları (404), sewhouse7.com/collections/patterns (404), lieslandco.com (SSL hatası). Bu üçünden görsel alınmadı.

Satıcı flat'i ortak dili (R1–R7'den çıkarılan): (a) kalın dış kontur, ince iç dikiş; (b) her pens/büzgü/cep bir dikişe veya kenara bağlı; (c) kavisli yan dikiş, hafif kavisli etek ucu; (d) kapanma (fermuar/düğme) gösterilir; (e) ön/arka aynı ölçek, aynı giysi; (f) kol/askı omuz üzerinden geçen bir genişliğe sahiptir.

## 2. Hükümler (piksel konumları 900px genişlikte png'de yaklaşık; ön x≈50–430, arka x≈480–860)

**1 — V yakalı, kolsuz, omuzdan prenses dikişli, bel dikişli, A-line etek, iki kapaklı yamalı cep; arka kayık yaka — EVET**
- Çizgi hiyerarşisi satıcı seviyesinde: kalın kontur, ince prenses/bel dikişi, V yaka pervazı kesikli (x≈180–300, y≈70–215) — R2/R3 diliyle aynı.
- Cepler bedene bağlı: cep ağzı kesikli topstitch (y≈490) ve prenses dikişi cep arkasından geçiyor; etek ucu hafif kavisli, yan dikiş belde içe kalçada dışa.
- Kusur (küçük): oturan prenses elbisede hiçbir kapanma yok (arka CB fermuar yok, x≈670). R2'de olurdu. Satıcı yanında yine okunur, o yüzden EVET.

**2 — İnce askılı, oyuk yakalı, prenses panelli korsaj, bel dikişli, diz altı A-line etek, dalgalı (dantel) etek ucu — EVET**
- Askı çift ince çizgi, korsaj üst köşesinden çıkıyor (x≈150/330, y≈150); askı ucu R6/R1 gibi.
- Korsaj prenses hatları bel dikişine iniyor, etek panel çizgileri aynı hizadan devam ediyor (x≈185/295); yan dikiş kavisli.
- Dalgalı etek ucu (y≈905) dantel/fisto olarak okunuyor; kusur olarak yalnız kapanma yok (yan fermuar işaretsiz).

**3 — Peter Pan yakalı, anahtar deliği + düğmeli, roba altı bırakılmış pensli, dantel kenarlı puf kollu shift elbise — EVET**
- Puf kol balon: omuz noktasından dışa/yukarı şişiyor (x≈70–130, y≈100–200), kol kapağında büzgü tırnakları, kol ucunda fisto (y≈210–235) — R5'in balon kolu ile aynı dil.
- Roba dikişi (y≈205) ve altından iki serbest pens/pli (x≈175, 305) robaya bağlı; arka roba + CB kısa çizgi (x≈660, y≈85–115) tutarlı.
- Kusur (küçük): yaka lobları omuz-boyun noktasında sivri uçla bitiyor (x≈160 ve 310, y≈80); Peter Pan yakada dış kenar yuvarlak biter. Okunurluğu bozmuyor.

**4 — Kayık yakalı, ön boydan düğmeli (9 düğme), prenses dikişli, petal/kap kollu oturan sheath — HAYIR**
- Prenses dikişleri CF'ye göre asimetrik: sol prenses belde x≈185 (pat merkezinden ~87px), sağ prenses belde x≈300 (pat kenarı x≈290'a 10px yapışık). Pat x≈255–290. Aynı giysi değilmiş gibi okunuyor; arka (x≈580/770) simetrik, önle çelişiyor.
- Kap kol "boynuz": kol ucu omuz noktasının üstüne sivri çıkıyor (x≈75, y≈90) ve alt kenarı kanca gibi bedene kıvrılıyor (x≈100, y≈205). R7'nin kap kolu omuzdan aşağı sarkan kısa kol; bu şekil satıcı dilinde yok. Arkada da aynı (x≈490/840).
- Olumlu: yan dikiş bel/kalça kavisi ve düğme yerleşimi (x≈270, eşit aralık) doğru.

**5 — Kayık yakalı, kolsuz, göğüs altı kavisli dikişe büzgülü korsaj, bel dikişi, etekte bel pensleri, hafif evaze etek — EVET**
- Büzgü tırnakları göğüs altı dikişine bağlı (x≈120–370, y≈260–300); pensler bel dikişinden açılıp uca kadar kapanıyor (x≈185–205 → y≈600) — R2'nin pens dili.
- Ön/arka aynı giysi: arkada aynı dikiş ve pensler, kavisli yan dikiş, kavisli etek ucu.
- Kusur (küçük): boyun-omuz noktasında yukarı küçük tırnak (x≈130 ve 345, y≈62); R2'de de benzeri var, bu yüzden kusur sayılmadı; büzgü tırnakları biraz fazla düzenli (R5'te düzensiz).

**6 — Geniş askılı, büzgülü oyuk yakası fiyonklu (bağcıklı), göğüs altı dikişte büzgülü A-line sundress — EVET**
- Büzgü dikişe bağlı: yaka büzgüsü (y≈150–165) ve göğüs altı dikiş altı büzgü tırnakları + etek kırışık çizgileri (y≈260–650) R5/R1'in dilinde.
- Fiyonk CF'de yaka kenarına bağlı, uçları sarkıyor (x≈235, y≈160–250); askılar korsaj köşesinden omuz üstüne geniş bant.
- Kusur (küçük): askı-korsaj köşesinde 5px basamak (x≈125 ve 350, y≈200; arkada x≈550/775) — bilinçli kol oyuğu köşesi olarak okunabiliyor.

**7 — Tek omuzlu, asimetrik yakalı, sağ yanda büzgülü/drapeli oturan mini elbise; arka aynalanmış — HAYIR**
- Omuz askısı yok: sol üst köşe tek bir sivri tepe (x≈110, y≈70) — genişliği sıfır. Satıcı flat'inde tek omuz, omuzdan geçen bir bant (iki çizgi) ile çizilir; sivri apeks giysiyi omuza oturtamaz. Arkada aynı apeks (x≈790, y≈70).
- Drape tırnakları yan dikişin dışına taşıyor (x≈355–375, y≈280–460) ve dört kavisli drape çizgisi dikişe bağlı görünürken en alttaki (y≈480–560) havada bitiyor; büzgü dikişi yan dikiş üstüne işaretsiz.
- Olumlu: asimetri tutarlı (ön sol yüksek ↔ arka sağ yüksek doğru aynalanmış), yaka pervazı ince paralel çizgi (y≈100–185), silüet oturan ve kavisli.

**8 — Kayık yakalı, kolsuz, ön boydan düğmeli, ön/arka bel pensli, hafif etek ucu açılan üst (bluz/yelek) — HAYIR**
- Pensler havada: pens tabanı y≈465'te bedenin ortasında (x≈165–175 ve 305–315), oysa bel/etek ucu y≈530–565. Pens hiçbir dikişe/kenara bağlı değil; R2'de her pens bir kenardan açılır. Arkada aynı (x≈585/725).
- Etek ucunda ayrı çift kısa çizgi (x≈165–175, y≈530–565) — pensin devamı mı, yırtmaç mı, pli mi belirsiz; pensle arasında 65px boşluk. Öğe dili okunmuyor.
- Yan dikiş y≈540'ta ani dışa kırılıyor (x≈100→95; sağda 385→390): peplum niyetiyse kavis olmalı, köşe hatası olarak okunuyor.

**9 — Kalp yakalı, omuzda fiyonkla bağlanan askılı, dört panelli bustier korsaj, bel dikişi, bel pensli mini etek, kesikli etek ucu — EVET**
- Askılar korsajın üst dış köşesinden çıkıp omuz üstünde fiyonkla bitiyor (x≈110/370, y≈55) — bağlamalı askı dili R1'in düğümlü ip ucuyla aynı.
- Korsaj panel dikişleri yakadan bel dikişine iniyor (x≈150/205/285/330), kalp yaka pervazı kesikli, etek pensleri bel dikişinden açılıyor (x≈185–205 → y≈530); etek ucu kesikli baskı dikişi (y≈780) R2/R3 ile aynı.
- Kusur (küçük): arka korsaj düz dikdörtgen, hiçbir dikiş/kapanma yok (x≈560–760, y≈180–405); kalp yakalı bustier'de satıcı CB fermuar çizer.

**10 — Geniş askılı, üst kenarı zikzak (fisto/rik-rak) süslü, göğüs altı kavisli dikişte büzgülü A-line pinafore; arkada yatay dikiş + CB fermuar — EVET**
- Kapanma gösterilmiş: CB fermuar çift kesikli çizgi, üstte çekme (x≈658, y≈180–555) — R2'nin fermuar dili.
- Büzgü tırnakları göğüs altı dikişine bağlı (y≈215–245), askılar korsaj köşesinden; ön/arka aynı giysi, zikzak kenar her ikisinde (y≈155/175).
- Kusur (küçük): göğüs altı dikişi çift tepeli sinüs gibi çok düzenli (x≈125–350, y≈230–260); etek ucu A-line'a rağmen dümdüz ve köşeli (y≈715) — R2/R7'de hafif kavisli olurdu.

**11 — Fisto kenarlı Peter Pan yakalı, anahtar deliği, roba altı büzgülü, dantel uçlu puf kollu bluz — EVET**
- Roba dikişi altı büzgü tırnakları + etek kırışık çizgileri robaya bağlı (y≈205–400); arkada aynı (x≈560–800).
- Puf kol balonu ve dantel kol ucu (x≈70–130, y≈100–235) R5'in balon koluyla aynı dil; yaka fistosu ön/arkada tutarlı; etek ucu hafif kavisli.
- Kusur (küçük): kol ucu düz çizgisi ile roba dikişi aynı yükseklikte (y≈205) birleşip tek yatay çizgi gibi okunuyor (x≈80–330).

## 3. Özet

**EVET: 8 / 11** (1, 2, 3, 5, 6, 9, 10, 11). **HAYIR: 3** (4, 7, 8).

Ortak kök neden (HAYIR'lar): **Öğeler giysi yapısına bağlanmıyor / kontur köşeleri "genişliksiz" üretiliyor.**
- 8: pens bir dikişten açılmıyor, bedenin ortasında havada; etek ucundaki çift çizgiler neyin parçası belirsiz.
- 4: prenses dikişi CF patına göre asimetrik yerleşiyor (bir tarafı pata yapışık, diğeri uzak) → öğe konumu simetri eksenine değil, rastgele referansa bağlı; kap kol omuz üstüne sivri "boynuz" olarak çıkıyor.
- 7: tek omuz, omuz üstünden geçen bir bant yerine sıfır genişlikli sivri tepe.
Üçünde de aynı hata sınıfı: dikiş/pens/askı/kol gibi öğelerin "nereye bağlı olduğu" (kenar, dikiş, simetri ekseni) çizime taşınmıyor; satıcı flat'lerinde (R1–R7) her öğe bir kenara/dikişe bağlıdır ve omuzdan geçen her şey genişliği olan bir banttır.

EVET'lerde tekrar eden küçük kusur: oturan giysilerde kapanma (fermuar) gösterilmiyor (1, 2, 9) — satıcı flat'i bunu çizer; 10 çiziyor. Tırnak/büzgü çizgileri satıcıdakinden daha düzenli/mekanik (5, 10).
