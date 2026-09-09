# Tur 10 — Hakem 4 (kör hakem, yalnız png) — 2026-09-09

Girdi: `KOSU/ciktilar/giris-3/{1..11}/flat.png`. Başka dosya okunmadı. Kıyas: aşağıdaki satıcı flat'leri (görsellerin kendisi indirilip bakıldı).

## Bulunan satıcı flat'leri (7 satıcı)

| # | Satıcı / kalıp | URL |
|---|---|---|
| S1 | Pattern Emporium — Go-To Fit & Flare Dress | https://patternemporium.com/cdn/shop/products/Go-ToFit_FlareDressLINEDRAWINGSewingPatternEmporium_1024x1024.jpg (ürün: https://patternemporium.com/products/go-to-fit-flare-dress-sewing-pattern) |
| S2 | Tilly and the Buttons — Seren Dress | https://tillyandthebuttons.com/cdn/shop/products/Seren_TECH_DRAWING_910fcb46-0735-4bd3-a62f-0aca99fc8d73_1800x1800.jpg |
| S3 | Closet Core Patterns — Elodie Wrap Dress | https://cdn.shopify.com/s/files/1/0632/8217/products/Wrap-dress_TechnicalFlat_CS6-03.jpg |
| S4 | True Bias — Southport Dress | https://cdn.shopify.com/s/files/1/0085/3901/3186/files/southport_14-32_line_drawings.jpg |
| S5 | Friday Pattern Co — Saltwater Slip Dress | https://cdn.shopify.com/s/files/1/2899/9794/products/Saltwaterslipflat.png |
| S6 | Cashmerette — Duxbury Dress | https://cdn.shopify.com/s/files/1/0735/5719/files/Cashmerette-1302-Duxbury-tech-ill-4x5-gray.jpg |
| S7 | Helen's Closet — Reynolds Top & Dress | https://cdn.shopify.com/s/files/1/0715/6701/6159/files/reynolds-top-and-dress-line-drawings.jpg |

Bakılıp elenen (flat değil, kalıp yerleşimi): Tiana's Closet Betty ve Ceicily sayfalarındaki png'ler. Etsy ve Mood sayfaları 403 verdi, oradan görsel alınamadı.

### Satıcı flat'lerinin ortak dili (ölçülen)

- **Yan dikiş:** hafif kavisli; bel/göğüs genişlik oranı S1 ≈0.75, S2 ≈0.85, S4 ≈0.80, S6 ≈0.85. S-şeklinde bel-kalça dalgası **yok**; sheath'te yan dikiş neredeyse düz.
- **Kum saati:** var ama ılımlı; bel daralması göğüsün %15-25'i.
- **Etek ucu:** S1/S2/S3/S4/S6 aşağı doğru dışbükey kavis; S5 (düz kesim) düz + dikiş çizgisi.
- **Çizgi hiyerarşisi:** S3/S5 kalın kontur + ince iç çizgi + noktalı dikiş; S1/S2/S4 tek ince ağırlık; S6 kalın kontur + noktalı topstitch + gölge.
- **Gövde çizgisi:** S7 hariç yok. S4/S6 yaka içini gri dolduruyor (iç boşluk hissi).
- **Askı:** S2 iki paralel çizgi, sabit genişlik, ~5° dışa eğim, üstte düz kesik uç; S5 tek ince çift çizgi, ayarlı toka.
- **Kol:** S6 kısa kol düşeyden ~15° açık, kol ucu düz + topstitch; S3 kimono. Omuz üstünde tümsek yok.
- **Pens:** S4 kısa tek-çizgi V (bedenin ~%10'u); S2 etekte bel'den inen kısa çift çizgi. Bedenin yarısını geçen pens yok.
- **Kapama:** S2/S4 düğme daireleri CF üstünde, tek kapama. Fermuar ayrı gösterilmiyor (S1-S7 hiçbirinde CB fermuar + düğme birlikte yok).
- **Yaka:** S1 bant iki çizgi; S6 arka yaka omuz noktasından hafif yukarı, CB'de küçük çukur. Yakalı (Peter Pan) örneği bu 7'de yok — konvansiyon bilgisi: iki yuvarlak lob CF'de buluşur, arka görünüşte yaka görünür.

## 11 hüküm ("aynı elden çıkmış mı?")

**1 — V yaka, kolsuz, cepli fit&flare: EVET**
- Kalın kontur (~2px) + ince pens (~1px) + kesik dikiş: S3/S5 ile aynı hiyerarşi.
- Bel/omuz genişlik oranı ≈0.63 (210/335px): satıcılardan ~%15 daha sıkı, ama fit&flare için okunur.
- Bel dikişinde yan dikiş kırılıyor (bodice-etek birleşiminde köşe, ~150°); satıcılar burayı yumuşatıyor. Etek ucu kavisi S1/S2 ile aynı.

**2 — İnce askılı midi: EVET**
- Askılar iki paralel çizgi, üste doğru ~10px daralıyor, S2 ile aynı dil.
- Bodice/etek yükseklik oranı 0.24 (180/760px); S2'de 0.31 — bodice satıcıya göre kısa duruyor.
- Bodice üst köşelerinde dışa küçük "kulak" (~8px çıkıntı); S2'de köşe temiz.

**3 — Peter Pan yaka, roba, kısa kol: HAYIR**
- Yaka tek parça U bant; Peter Pan'ın CF'de buluşan iki lobu yok, arka görünüşte yaka hiç çizilmemiş (sadece boyun + fermuar).
- Kol başı omuz noktasının üstünde yuvarlak tümsek yapıyor (y≈75'te dışa ~20px), büzgü çizgisi yok → puf mu düz kol mu okunmuyor; S6'da kol omuzdan düz iner.
- Yan dikiş bel altında dışa dalga (S eğrisi), waist/hip ≈0.62; satıcı sheath'lerinde bu dalga yok.

**4 — Kayık yaka, cap kol, önü düğmeli sheath: HAYIR**
- Yan dikiş üç kırılmalı S: göğüs x=95 → bel x=122 → kalça x=78 (sol taraf); korse silüeti, S4/S6'da yan dikiş neredeyse düz.
- Cap kol dışa lob gibi taşıyor (omuz noktasından ~40px dışa, iç kenar C kavisi), kol ucu eğik kesik çizgi; petal/ear gibi okunuyor.
- Önde 7 düğme + arkada CB fermuar: aynı giyside iki kapama. 7 satıcı flat'inin hiçbirinde yok.

**5 — Kolsuz, göğüs altı panel + bel dikişi: EVET**
- Yaka/kol evi içindeki kesik dikiş çizgisi S4/S6'nın noktalı topstitch diliyle aynı.
- Panel pensleri kısa V (≈100px), etek pensleri uzun (≈220px) — S2'nin etek pens diline yakın.
- Bel ≈0.68 omuz genişliği; hafif fazla ama S1'in fit&flare bodice'ine yakın.

**6 — Geniş askılı mini fit&flare: EVET**
- Askılar altta 45px, üstte 35px: kama şekli; S2'de sabit genişlik. Küçük ama görülüyor.
- Bodice üst kenarında iki yatay çizgi (bant + dikiş) + köşe kulakları: S2 bant çizimiyle örtüşüyor, kulaklar fazla.
- Etek ucu kavisi ve etek pensleri S2 ile birebir aynı dil.

**7 — Straplez, katlı bant: HAYIR**
- Bant dikdörtgeni gövdenin üstünde "yüzüyor": alt kenarı bodice üst çizgisiyle çakışmıyor (~10px yukarıda), iki yanda kancalar var.
- Yan dikiş S eğrisi: göğüs x=75, bel x=100, kalça x=45 (sol); kum saati waist/hip ≈0.60.
- Ön pensler bodice'in %75'i boyunca (y=230→680): satıcılarda pens bedenin %10-30'u.

**8 — Kolsuz düğmeli bluz/bodice: HAYIR**
- Ön pensler y=245→690, gövdenin ~%78'i; pens değil prenses dikişi gibi okunuyor, ama uçları sivri pens.
- Önde 10 düğme + arkada CB fermuar: çift kapama.
- Kontur/dikiş/pens hiyerarşisi doğru; bel oranı 0.72 satıcı bandında — kusurlar yalnız yukarıdaki ikisi.

**9 — Sweetheart, ince askı, mini: EVET**
- Sweetheart kavisi iki simetrik lob, CF'de sivri iniş; askılar lobların tepesinden çıkıyor — doğru yerleşim.
- Askı ince çift çizgi, S5 ile aynı dil; arka bodice üst kenarı düz + kesik dikiş, S2 arka görünüşüyle aynı.
- Etek pensleri ve etek ucu kavisi 1/6 ile aynı; arka üst köşelerde küçük kulaklar var.

**10 — Geniş askılı fit&flare (6'nın kısası): EVET**
- 6 ile aynı gözlemler: askı kama (45→35px), bant iki çizgi, köşe kulakları.
- Etek flare açısı yan dikişte ~20°, S1'in A-line'ından biraz dar; okunur.
- Arka askı üst uçları arka bodice üst kenarının 10px üstünde bitiyor, düz kesik: S2 ile aynı.

**11 — Peter Pan yaka, roba, kısa kol bluz: HAYIR**
- 3 ile aynı yaka sorunu: tek U bant, CF'de lob yok, arkada yaka yok.
- Kol başında tümsek + kol ucu eğik; kol düşeyden ~35° açık, S6'da ~15°.
- Bel dalgası: göğüs x=95 → bel x=120 → etek ucu x=75; bluz için kalçada dışa dalga fazla.

## Toplam hüküm: EVET (6 / 11, dar farkla)

EVET: 1, 2, 5, 6, 9, 10. HAYIR: 3, 4, 7, 8, 11. Çoğunluk EVET ama 6-5; HAYIR'ların 4'ü iki tekrarlayan sebepten (yaka, S-yan dikiş).

**En ağır üç kusur**
1. **Peter Pan yaka (3, 11):** tek parça U bant, CF lobları yok, arka görünüşte yaka hiç yok. Yakalı iki çizimin ikisi de bu yüzden düşüyor.
2. **Sheath/bluzlarda S-eğrili yan dikiş (4, 7, 8, 11):** göğüs→bel→kalça üç kırılmalı dalga, waist/hip ≈0.60; satıcı sheath'lerinde yan dikiş neredeyse düz, bel daralması %15-25.
3. **Kol başı tümseği ve lob kol (3, 4, 11):** omuz noktasının üstünde dışa taşan yuvarlak, büzgü çizgisi yok; kol ucu eğik kesik. Puf/petal gibi okunuyor.

İkincil: çift kapama (4, 8: ön düğme + CB fermuar); bodice üst köşelerindeki "kulaklar" (2, 6, 7, 9, 10); askı kama şekli (6, 10); 7'de yüzen bant.

**En güçlü üç yan**
1. **Çizgi hiyerarşisi:** kalın kontur / ince iç çizgi / kesik dikiş — S3, S5, S6 ile aynı dil; 11'inde tutarlı.
2. **Etek ucu, bel dikişi, etek pensleri, askı (2, 9):** S1/S2/S5 ile yan yana konunca fark yok.
3. **Ön/arka çift görünüş, CB fermuar, sweetheart ve V yaka geometrisi:** satıcı sayfasına doğrudan konabilir seviyede (1, 5, 9).

## Döküm (sorulmayan ama görülen)

- 11 çizim aynı pens yerleşimi/uzunluğu kalıbını paylaşıyor; "aynı el" tutarlılığı güçlü, ama pens uzunluğu tasarıma göre değişmiyor (sheath'te de bodice'te de aynı).
- Arka yaka konturu CB'de tepe yapıyor (kubbe); S6'da CB'de küçük çukur var. Küçük, hükmü değiştirmedi.
- Satıcı flat'lerinde (S1, S3, S4, S6) kumaş düşüş/büzgü çizgileri var; motorun 11'inde hiç yok. Bu 11 tasarım pensli/düz kumaş olduğu için eksik sayılmadı, ama büzgülü model gelirse eksik olur.
- Etsy listeleri (Peter Pan, sweetheart) 403 — Etsy'ye özgü flat görülemedi; kıyas 7 indie satıcı sitesiyle yapıldı. DOĞRULANMADI: Etsy satıcılarının ortalama flat kalitesinin bu 7'den düşük/yüksek olduğu.
