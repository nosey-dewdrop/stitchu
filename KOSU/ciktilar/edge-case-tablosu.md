# EDGE CASE SÜPÜRME TABLOSU (M4-edge)

üretildi: `node engine/tests/edge_case_supurme_check.mjs` · 2026-09-04

YASA: her vaka ya geçerli bir çıktı verir ya **adıyla** reddedilir ve reddin yanında
kullanıcının yapabileceği **sonraki adım** durur. Sessiz çöküş 0, sessiz default 0,
çıkmaz sokak 0. Canlı LLM çağrısı YOK — fotoğraf tarafı sentetik piksel fikstürleri,
etiket tarafı bankalı okuma JSON'ları, kalıp tarafı sevk edilen wasm baytı.

**1325 yargı · 0 FAIL**

| bölüm | vaka | sonuç | kullanıcının gördüğü / kanıt |
|---|---|---|---|
| foto | mankensiz düz serilmiş giysi (SAĞLIKLI HAT) | ÖLÇÜLDÜ (measured, güven 1) | L/W 2.982 · hem/bel 2.143 |
| foto | giysi olmayan fotoğraf — manzara | ADIYLA RED: background_not_separable | arka plan giysiden ayrılamadı (kalabalık ya da çok karanlık kare). Sonraki adım: giysiyi düz ve açık renkli bir zemine serip tek başına çek. |
| foto | giysi olmayan fotoğraf — boş duvar | ADIYLA RED: no_garment_found | karede zeminden ayrışan bir giysi şekli bulunamadı — ya giysi kadrajda çok küçük kalmış ya da ışık/kontrast onu zeminden ayırmaya yetmiyor (çok karanlık, çok parlak ya da bulanık kare). Sonraki adım: iyi ışıkta, zeminle zıt renkli ve giysinin kareyi dolduracağı net bir kare çek; ya da aşağıdan giysiyi kendin seç. |
| foto | birden fazla giysi tek karede | ADIYLA RED: ambiguous_foreground | karede tek bir giysi ayırt edilemedi (birden fazla parça ya da giysiyle aynı tonda zemin). Sonraki adım: tek parça bırak ve zıt renkli bir zemin kullan. |
| foto | giysi bir insanın üstünde (baş + bacaklar) | ADIYLA RED: worn_on_model_legs | giysi bir insanın üstünde görünüyor (etek ucunun altında bacaklar var). Sonraki adım: giysiyi çıkarıp düz sererek ya da askıda çek — oranlar ancak o zaman giysinin kendi oranları olur. |
| foto | aşırı karanlık kare | ADIYLA RED: no_garment_found | karede zeminden ayrışan bir giysi şekli bulunamadı — ya giysi kadrajda çok küçük kalmış ya da ışık/kontrast onu zeminden ayırmaya yetmiyor (çok karanlık, çok parlak ya da bulanık kare). Sonraki adım: iyi ışıkta, zeminle zıt renkli ve giysinin kareyi dolduracağı net bir kare çek; ya da aşağıdan giysiyi kendin seç. |
| foto | aşırı parlak / kontrastsız kare | ADIYLA RED: no_garment_found | karede zeminden ayrışan bir giysi şekli bulunamadı — ya giysi kadrajda çok küçük kalmış ya da ışık/kontrast onu zeminden ayırmaya yetmiyor (çok karanlık, çok parlak ya da bulanık kare). Sonraki adım: iyi ışıkta, zeminle zıt renkli ve giysinin kareyi dolduracağı net bir kare çek; ya da aşağıdan giysiyi kendin seç. |
| foto | bulanık + gürültülü kare | ADIYLA RED: no_garment_found | karede zeminden ayrışan bir giysi şekli bulunamadı — ya giysi kadrajda çok küçük kalmış ya da ışık/kontrast onu zeminden ayırmaya yetmiyor (çok karanlık, çok parlak ya da bulanık kare). Sonraki adım: iyi ışıkta, zeminle zıt renkli ve giysinin kareyi dolduracağı net bir kare çek; ya da aşağıdan giysiyi kendin seç. |
| foto | karede nokta kadar leke (giysi yok sayılır) | ADIYLA RED: no_garment_found | karede zeminden ayrışan bir giysi şekli bulunamadı — ya giysi kadrajda çok küçük kalmış ya da ışık/kontrast onu zeminden ayırmaya yetmiyor (çok karanlık, çok parlak ya da bulanık kare). Sonraki adım: iyi ışıkta, zeminle zıt renkli ve giysinin kareyi dolduracağı net bir kare çek; ya da aşağıdan giysiyi kendin seç. |
| foto | uzaktan çekilmiş dar giysi (ayrışıyor ama ölçülemeyecek kadar ince) | ADIYLA RED: garment_too_small | giysi karede çok küçük kaldı. Sonraki adım: daha yakın bir kadrajla, daha yüksek çözünürlükte çek. |
| foto | düşük kontrast: lekeli zemin + yanda rakip gölge | ADIYLA RED: low_confidence | fotoğraf ölçüm için fazla belirsiz (bulanık, düşük çözünürlüklü ya da düşük kontrastlı). Sonraki adım: net ve iyi ışıklı bir kare çek. |
| foto | bozuk / boş görüntü nesnesi | ADIYLA RED: bad_input | fotoğraf okunamadı (bozuk/boş dosya). Sonraki adım: fotoğrafı JPG/PNG olarak yeniden kaydedip tekrar yükle, ya da aşağıdan giysiyi kendin seç. |
| foto | measure.js'in 11 ret sebebi | HEPSİ CÜMLELİ + ADIMLI | ambiguous_foreground, background_not_separable, bad_input, foreground_fills_frame, garment_too_small, hem_tapers_like_legs, low_confidence, no_garment_found, profile_incomplete, worn_on_model_head, worn_on_model_legs |
| foto | koşarak ateşlenen 7 ret sebebi | FİKSTÜRLE KANITLI | ambiguous_foreground, background_not_separable, bad_input, garment_too_small, low_confidence, no_garment_found, worn_on_model_legs |
| prompt | boş prompt | BOŞ İLAN EDİLDİ |  |
| prompt | sadece boşluk | BOŞ İLAN EDİLDİ |  |
| prompt | sadece emoji | BOŞ İLAN EDİLDİ |  |
| prompt | sadece noktalama | BOŞ İLAN EDİLDİ |  |
| prompt | anlamsız prompt | okunan 0 eksen | ANLAŞILMADI: asdfgh → bunu tek bir detay olarak çizemiyorum; en yakın çizebildiğim şey 'edge' ekseni \| qwerty → bunu tek bir detay olarak çizemiyorum; en yakın çizebildiğim şey 'overlay' ekseni \| zxcvb → bunu tek bir detay olarak çizemiyorum; en yakın çizebildiğim şey 'edge' ekseni |
| prompt | çelişkili prompt (kolsuz + uzun kollu) | okunan 3 eksen | sleeveLength=long garment=dress sleeveStyle=none · KONAKSIZ: 'kolsuz' okundu, kolsuz seçildi; kol ekseni yok — kol istiyorsan 'kolsuz' kelimesini çıkar; 'uzun kollu' uygulanmadı |
| prompt | çelişkili prompt EN (sleeveless + long sleeve) | okunan 3 eksen | sleeveLength=long garment=dress sleeveStyle=none · KONAKSIZ: 'sleeveless' okundu, kolsuz seçildi; kol ekseni yok — kol istiyorsan 'kolsuz' kelimesini çıkar; 'long sleeve' uygulanmadı |
| prompt | çelişkili prompt (etek + yaka) | okunan 3 eksen | neckline=square garment=skirt skirtLength=midi · KONAKSIZ: 'etek' okundu, etek seçildi; üst gövde ekseni yok — bu kelimeyi kullanmak için 'elbise' ya da 'bluz' yaz; 'kare yakali' uygulanmadı |
| prompt | aynı eksene iki kelime (mini + maksi) | okunan 2 eksen | garment=dress skirtLength=mini · ANLAŞILMADI: maksi → 'skirtLength' ekseni bu metinde zaten 'mini' -> 'mini' okundu; 'maksi' uygulanmadı |
| prompt | çok uzun prompt (280 token) | okunan 5 eksen | neckline=square sleeveLength=long garment=dress skirtStyle=pleated skirtLength=midi |
| prompt | Türkçe ek: "kare yakalı puf kollu elbise" | okunan 3 eksen | neckline=square sleeveCap=puffed garment=dress |
| prompt | Türkçe+İngilizce karışık | okunan 4 eksen | sleeveCap=puffed garment=dress skirtLength=mini pocketStyle=sideSeam · ANLAŞILMADI: square → 'square' bilinen bir kelime ama tek başına bir eksen belirtmiyor; şöyle yaz: square neckline / square neck \| yakali → 'yakali' bilinen bir kelime ama tek başına bir eksen belirtmiyor; şöyle yaz: bisiklet yaka / oval yaka / v yaka |
| prompt | sayılı edit ("yakayı 2cm derinleştir") | EDIT OKUNDU (1 alan) | EDIT: editNeckDeepenMM=20mm |
| foto+prompt | fotoğraf kollu, prompt "kolsuz" | PROMPT KAZANDI | sleeveStyle straight → none · rapor ["sleeveStyle","straight","none"] |
| foto+prompt | sadece arka fotoğraf / arka fotoğraf yok | UYDURMA İLAN EDİLDİ | uydurulan alanlar: backDetail, backOpening, backSlit, laceUpBack |
| beden | EU34 | KALIP 6 parça | issues 0 |
| beden | EU36 | KALIP 6 parça | issues 0 |
| beden | EU38 | KALIP 6 parça | issues 0 |
| beden | EU40 | KALIP 6 parça | issues 0 |
| beden | EU42 | KALIP 6 parça | issues 0 |
| beden | EU44 | KALIP 6 parça | issues 0 |
| beden | EU46 | KALIP 6 parça | issues 0 |
| beden | EU48 | KALIP 6 parça | issues 0 |
| beden | EU50 | KALIP 6 parça | issues 0 |
| beden | EU52 | KALIP 6 parça | issues 0 |
| beden | flat EU34 | ÇİZİLDİ | 26382 bayt · düğüm 5829953f377b5a95 |
| beden | flat EU52 | ÇİZİLDİ | 26460 bayt · düğüm 0348ed23aa6f613d |
| beden | EU99 (tabloda yok) | ADIYLA RED | unknown size 'EU99' (valid: EU34, EU36, EU38, EU40, EU42, EU44, EU46, EU48, EU50, EU52) |
| motor | neckline='uydurma-yaka' | ADIYLA RED | invalid neckline 'uydurma-yaka' (valid: crew, scoop, vNeck, square, boat, sweetheart, halter, cowl, pussyBow) |
| kumaş | 360 kombinasyon (5 kumaş × 4 beden × 6 etek × 3 boy) | 323 SIĞDI · 37 ADIYLA RED | taşan hiçbirinde metraj sayısı basılmadı |
| kumaş | kadife 106.7cm + EU48 pileli etek | ADIYLA RED | I cannot give you a metre count for this bolt: the widest piece (Skirt Front) is 1492 mm across the grain and your fabric is only 1067 mm wide, so that piece does not fit on it at any length. Next step: use a bolt at least 149 cm wide, or pick a narrower skirt/bodice style — the pattern itself is sewable, only this fabric is too narrow for it. |
| kumaş | örme, crosswise streç %0 | KALIP TEMİZ | 6 parça |
| kumaş | örme, crosswise streç %5 | KALIP TEMİZ | 6 parça |
| kumaş | örme, crosswise streç %20 | KALIP TEMİZ | 6 parça |
| kumaş | örme, crosswise streç %50 | KALIP TEMİZ | 5 parça |
| kumaş | örme, crosswise streç %95 | KALIP TEMİZ | 5 parça |
| motor | asimetrik pat + ön ortası görünür fermuar | KALIP 5 parça | issues 0 |
| motor | editExtendMM = -50 (negatif uzatma) | ADIYLA RED (2 adım · uygulanan 0) | UZATILMADI: istenen -50.0000 mm. uzatma mm'si pozitif degil; bir kalibi negatif uzatmak KISALTMAKTIR ve bu operator kisaltmaz — ayri bir islemdir, sessizce yapilmaz |
