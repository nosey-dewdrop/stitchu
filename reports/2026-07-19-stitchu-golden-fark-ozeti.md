# stitchu golden fark ozeti (pin 23034 vs HEAD 23406) — onay paketi
2026-07-19. Bu rapor KARAR VERMEZ; Damla'nin onayina sunulacak farki insan-okur halde gosterir. Pin degistirilmedi, repo koduna dokunulmadi, 0 API cagrisi. Kaynak: ~/.cache/stitchu-adli/dump-00f429c.csv (pin ile byte-identical, adli rapor) vs dump-430e6e9.csv (HEAD regen). Iraksama tek commit: 20cc289 "refine dart drafting to aldrich" (adli rapor: reports/2026-07-19-stitchu-golden-adli.md).

Anahtar granularitesi: body|spec = 561 giysi (3 govde x 187 spec). Adli rapordaki 562 sayisi farkli granularite; bu rapor Damla'nin kendi olcumundeki 537 ile ayni anahtari kullanir.

## 1. TEPEDEN GORUNUM
- 561 giysi: 0 yeni, 0 silinmis anahtar. **537 giyside yerinde geometri degisimi**, 24 giysi bayt-ayni.
- Degismeyen 24: dart'siz eteklerin tekil halleri (gathered + halfCircle her govdede) + bigNeckSmallShoulder'in tekil aLine/straight etekleri (bel-kalca farki dart bolme esigine girmiyor, omuz sabiti etek parcasina islemiyor).
- +372 satir farkinin TAMAMI = 62 giyside +6 satir (dart bolunmesi, bolum 4).

## 2. PARCA TIPI BAZINDA OZET (562-satir istegi; olculen 561 anahtar, yerinde degisen 537)
Delta = ayni satirin endpoint koordinat kaymasi, mm. "n" = o parcanin degistigi giysi sayisi.

| parca | n giysi | ort. maks delta | maks delta | degisen nokta | bas landmark'lar |
|---|---|---|---|---|---|
| Bodice Front | 300 | 31.6mm | 75.9mm | 1820 | omuz ucu, koltukalti oyuntu, yan bel, dart bacaklari |
| Bodice Back | 300 | 31.2mm | 79.2mm | 1820 | omuz ucu, oyuntu derinligi |
| Top Front / Top Back | 225+225 | 30.5 / 31.2mm | 75.9 / 79.2mm | 765+765 | bodice ile ayni (ayni blok) |
| Balloon Sleeve / Sleeve | 196+196 | 15.3mm | 50.3mm | 2156+1582 | kol basi (cap) yeni oyuntuya yeniden cizilmis: daha genis + daha basik tepe |
| Skirt Front / Skirt Back (elbise icinde) | 175+175 | 19.0mm | 66.2mm | 475+475 | bel dart genisligi + (62 giyside) dart bolunmesi |
| Front / Back (tekil etek) | 12+12 | 56.5mm | 68.2mm | 36+36 | bel dart bolunmesi (pear/EU38) |
| Skirt Panel (quarter circle) | 75 | 0.1mm | 0.2mm | 300 | pratik sifir (yuvarlama duzeyinde) |

Govde bazinda maks delta: bigNeckSmallShoulder 79.2mm (175 giysi) > pear 68.2mm (181) > EU38 44.8mm (181).

## 3. DELTA HISTOGRAMI — DAMLA'NIN KUMELERI HANGI SABITIN ISI
Damla'nin gordugu +51 / +74 / +45 / +41 / 0 / −9 / −7 kumeleri **hepsi ayni satirin, omuz ucu x-koordinatinin** govde x yaka kirilimidir. Kaynak sabit: 20cc289'un omuz dikisi revizyonu 78.5mm/32.8grad -> 117.7mm/22grad (Aldrich blok). Eski motor omuzu govdeye gore degisen boyda cizerken (74-133mm arasi), yenisi Aldrich formulune cekiyor; kayma yonu ve buyuklugu govdenin eski omzuna gore degisiyor:

| kume (Damla) | olculen dx | kim | mekanizma |
|---|---|---|---|
| +74 | +75/+78mm | bigNeckSmallShoulder x boat yaka | en kucuk eski omuz (74mm) + boat genisletmesi ustune |
| +51 | +52/+53mm | bigNeckSmallShoulder x diger yakalar | 74mm -> ~126mm omuz |
| +45 | +45/+48mm | pear x boat | |
| +41 | +42/+45mm | EU38 x boat | (adli rapordaki 78.5->117.7 ornegi bu satir) |
| 0 | 0 | degismeyen noktalar (CF/CB, yaka oyuntusu, etek ucu vb.) | |
| −7 | −7mm | pear x boat-disi yakalar | eski omuz (131mm) yeni normdan UZUNDU, iceri geldi |
| −9 | −9mm | EU38 x boat-disi yakalar | eski 133mm -> ~126mm |

Diger buyuk kumeler (Damla'nin listesinde olmayan ama ayni revizyonun parcasi):
- **+12mm dart genislemesi**: on bel dart bacak-arasi 34->46 / 39->52 / 62->74mm (bust dart 11.5grad -> 15.4grad); yan bel noktasi ayni +12mm disari (240 bodice + 60 top on parcasi).
- **+4.7 / +12.7mm oyuntu derinlesmesi**: koltukalti noktasi asagi (govdeye gore), oyuntu Aldrich derinligine.
- **kol basi ~50mm**: yeni oyuntu cevresine yeniden cizilen cap — tepe basikliyor, genisliyor (2156+1582 nokta, en yaygin degisen parca).

## 4. +372 SATIRIN ACIKLAMASI (DART BOLUNMESI)
+372 = 62 giysi x +6 satir. Her +6 = etek On + Arka parcalarinda tek dart isareti (3 satir: move-line-line V) -> **iki dart** (2x3 satir). 20cc289'un "straight-skirt bel darti 30mm ustunde ikiye bolunur (koni onleme)" satiri.

62'nin kirilimi (olculen): **pear 56** (50 elbise: 5 yaka x {aLine, straight} etek x 5 kol/boy + 6 tekil etek) + **EU38 6** (sadece tekil aLine/straight etekler). bigNeckSmallShoulder'da hic yok (dart 30mm esigini asmiyor). Yani bolunme govde-kosullu: bel-kalca farki buyuk govdede (pear) elbise eteklerinde de tetikleniyor. Gorsel kaniti: garment-03 ve garment-04.

## 5. EN BUYUK SAPMALI 20 GIYSI (maks delta sirali)
Ilk 20 ham siralama tek govde-yaka ailesinde kumelendigi icin (bigNeckSmallShoulder x boat, 35 giysi hepsi 79.2mm) iki liste veriyorum.

Ham ilk 20 (hepsi bigNeckSmallShoulder|dress-veya-top /boat/, maks 79.2mm, Bodice/Top Back omuz ucu): dress/boat x {aLine, gathered, halfCircle, straight} x {balloon.elbow, balloon.short, none.short, straight.long, straight.short} = 20 kayit; ayirt edici tek fark etek/kol kombinasyonu.

Aile bazinda tekillestirilmis ilk 15:
| maks delta | giysi | degisen parcalar |
|---|---|---|
| 79.2mm | bigNeckSmallShoulder dress/boat/aLine/balloon.elbow | Bodice F 75.9 + B 79.2, Sleeve 50.3 |
| 79.2mm | bigNeckSmallShoulder top/boat/cropped/balloon.elbow | Top F/B 75.9/79.2, Sleeve 50.3 |
| 68.2mm | pear skirt/aLine/maxi | Front/Back 68.2 + dart bolunmesi |
| 68.2mm | pear skirt/straight/maxi | Front/Back 68.2 + dart bolunmesi |
| 66.2mm | pear dress/boat/aLine/balloon.elbow | Bodice 45/48 + Skirt 66.2 + bolunme + Sleeve |
| 66.2mm | pear dress/{crew,scoop,square,vNeck}/aLine/balloon.elbow | ayni imza, yaka farki omuz kaymasini -7'ye dusurur |
| 54.7mm | bigNeckSmallShoulder dress/{crew,scoop,square,vNeck}/aLine/balloon.elbow | Bodice omuz +52/+53, Sleeve |
| 54.7mm | bigNeckSmallShoulder top/{crew,scoop}/cropped/balloon.elbow | ayni |
| 44.8mm | EU38 (en buyuk) | boat omuz +42/+45 + dart +12 |

## 6. YAN YANA GORSELLER (reports/golden-fark/, sol=00f429c pin, sag=HEAD, ayni olcek, dump koordinatlarindan cizildi — her taraf kendi commit'inin motor ciktisi)
1. **garment-01-yanyana.png** — bigNeckSmallShoulder dress/boat/aLine/balloon.elbow (79.2mm): omuz belirgin uzamis, oyuntu derinlesmis, kol basi basik/genis.
2. **garment-02-yanyana.png** — bigNeckSmallShoulder top/boat/cropped/balloon.elbow (79.2mm): ayni omuz+cap imzasi cropped top blokta.
3. **garment-03-yanyana.png** — pear skirt/aLine/maxi (68.2mm): tek genis bel darti -> iki dar dart (bolunme, +6 satir) her iki parcada.
4. **garment-04-yanyana.png** — pear dress/boat/aLine/balloon.elbow (66.2mm): elbisede ayni anda omuz + dart genislemesi + etek dart bolunmesi.
5. **garment-05-yanyana.png** — bigNeckSmallShoulder dress/crew/aLine/balloon.elbow (54.7mm): boat-disi yaka; omuz +52/+53, sleeve cap yeniden.
Bes PNG de Chrome headless ile basildi ve gozle tek tek kontrol edildi (bos/kirpik yok, iki panel de tam).

## 7. ONAY SORUSU (karar Damla'nin)
Bu fark, 20cc289 "dart drafting'i Aldrich'e cek" revizyonunun beklenen imzasi mi?
- Lehte olculen: farkin tamami commit mesajindaki uc sabitle bire bir aciklaniyor (omuz 78.5->117.7mm/22grad; bust dart 11.5->15.4grad = +12mm; 30mm ustu etek darti bolunmesi) + kol basi bunlarin mekanik sonucu; kume degerlerinin govde/yaka kirilimi formul-degisimi deseninde (tek-sabit-kaydirma degil, rastgele gurultu de degil). K4 kagit sloper yeni omuz degerlerini Aldrich'e karsi VERIFIED isaretledi (adli rapor).
- Aleyhte/riskli olculen: degisim 537 giyside ve maksimum 79.2mm — kucuk bir kalibrasyon degil, blok revizyonu. bigNeckSmallShoulder govdesinde omuz +75mm buyudu; bu govde tipinde yeni blok fiziksel dogru mu, muslin'siz kanit yok. Golden bir kez re-pin edilirse eski davranisa donus 20cc289 geri alinmadan mumkun degil.
Onaylanirsa: 23406 pin'lenir (re-pin komutu kapanis raporunda). Reddedilirse: 20cc289 cizim degerleri geri alinir (sloper_check'in yeni degerlere pinli oldugu nota dikkat, adli rapor Soru 2/A).
