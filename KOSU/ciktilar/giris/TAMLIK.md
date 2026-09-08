# Primitif kumesinin TAMLIK kaniti — 5 fotograf, 10 prompt, Bugra'nin 2 kalibi

Uretici: `python3 KOSU/0509-a3-tamlik.py`. Her satir motordan GECTI ya da adiyla RED; tablo elle yazilmadi.
Kume: `contract/graf-v1.json` oplar (19 op). Kural (Damla, 9 Eyl): fotograf/prompt basina op eklenmez; yazilamayan kalem
**eksik primitif** olarak geometrik adiyla asagida durur, sozluk acilmaz. grafdogrula = gercek36, 0 kirmizi = dikilebilir tutarlilik.

**Kullanilan primitifler (14/19):** addPanel, closure, drop, extendTo, fitLength, flare, gather, merge, mirror, moveVertex, reshapeEdge, sew, split, subdivide
**Kumede olup hic kullanilmayan:** attach, extend, overlay, shorten, suppress

## Fotograflar (KOSU/ciktilar/giris/N, okuma opDemeti = primitif)

| # | fotograf | op | primitifler | grafdogrula | eksik primitif (geometrik adiyla) |
|---|---|---|---|---|---|
| 1 | biba-O1194418-dress.jpg | 8 | addPanel, closure, extendTo, fitLength, reshapeEdge, sew | **0 kirmizi** | PRIMITIF: setGrain{panel, deg} — Panel.grainDeg alani var, yazan op yok (kesim planini degistirir, kalibi degil)<br>OKUMA: ikinci katin bel dikisine yakalanmasi — ayni dikise ucuncu katman dikis modelinde yok; kat yuze dikili (onto) yazildi, konstruksiyon notu farkli |
| 2 | biba-O1194418-dress-arka.jpg | 8 | addPanel, closure, extendTo, fitLength, reshapeEdge, sew | **0 kirmizi** | PRIMITIF: setGrain{panel, deg} — Panel.grainDeg alani var, yazan op yok (kesim planini degistirir, kalibi degil)<br>OKUMA: ikinci katin bel dikisine yakalanmasi — ayni dikise ucuncu katman dikis modelinde yok; kat yuze dikili (onto) yazildi, konstruksiyon notu farkli |
| 3 | biba-O120579-dress.jpg | 14 | addPanel, extendTo, fitLength, reshapeEdge, sew, split, subdivide | **0 kirmizi** | OKUMA: kesme hattinin kavisli-dis bicimi icin kontrol noktasi orani verilmedi, duz kesildi<br>OKUMA: kol agzi dusey dugme detayi — kapanma yalniz dikise yazilir, kol agzi dikis degil (detay, kalip parcasi degil)<br>PRIMITIF: setGrain{panel, deg} — Panel.grainDeg alani var, yazan op yok (kesim planini degistirir, kalibi degil) |
| 4 | mary-quant-O365926-dress.jpg | 12 | addPanel, closure, extendTo, fitLength, merge, reshapeEdge, sew | **0 kirmizi** | OKUMA: bagimsiz parca (bel bandi/kusak) — hicbir panele dikili degil, komsuluk_bagli kurali reddeder; aksesuar, kalip parcasi degil<br>OKUMA: yama parcanin yatay yeri fotograftan oran olarak cikarilmadi (DOGRULANMADI, secildi) |
| 5 | mary-quant-O365926-dress-arka.jpg | 8 | addPanel, extendTo, fitLength, merge, sew | **0 kirmizi** | KAPANDI 2026-09-09: ic halka pens (balik pensi) Panel.darts olarak merge ile geliyor; grafdogrula pens_cozum agzi cozuyor<br>OKUMA: bagimsiz parca (bel bandi/kusak) — hicbir panele dikili degil, komsuluk_bagli kurali reddeder; aksesuar, kalip parcasi degil<br>OKUMA: CB kapanma turu okunamadi; tabanin fermuari duruyor (ilan) |

## Promptlar (10; P7-P10 sozluk disi) ve Bugra'nin iki kalibi

| ad | girdi | op | primitifler | motor | panel | grafdogrula | eksik primitif / not |
|---|---|---|---|---|---|---|---|
| P1-keskin-koseli-yaka | yatik bebe yaka ama koseleri sivri, kisa kollu, A etekli midi elbise | 7 | addPanel, extendTo, fitLength, flare, sew | UYGULANDI | 6 | **0 kirmizi** | PRIMITIF: extendTo{yLandmark, yLandmark2, yLerp} — kenari iki landmark ARASI bir orana baglama (bugun yalniz tek landmark); omuz-dirsek arasi kol agzi boyu bununla yazilir |
| P2-ayrik-panelli-buzgulu-kol | prenses dikisli beden, balon kol, kolda lastik buzgu, uzun kollu maxi elbise | 17 | addPanel, extendTo, fitLength, gather, reshapeEdge, sew, split, subdivide | UYGULANDI | 8 | 5 kirmizi: centik:bel @0.3300; dikis_uzunluk:bel; dikis_zincir:kol_oyugu; halka_kapanma:kol_oyugu_halka (armhole); kendini_kesme:kol_bandi | OKUMA: bant dikisinin orani (2.2) secildi; lastik esnemesi kumas katalogundan gelir (A6 fabric-catalog), graf eksigi degil<br>COZUCU (A4): dikise gomulu supresyon — bacaklar seam olunca cozPens (dartLeg cifti + ic pens) onlari gormez, bel dikisinin iki tarafi esit cikmaz (dikis_uzunluk/centik bel)<br>OKUMA/PROGRAM: kol agzi 1.3 acilinca koltukalti kenari kapakla kesisiyor (kendini_kesme kol); reshapeEdge ile duzeltilebilir, bu programda yazilmadi |
| P3-etek-tek-topoloji | A formlu kemerli midi etek | 13 | addPanel, drop, extendTo, fitLength, flare, sew | UYGULANDI | 4 | 4 kirmizi: dikis_uzunluk:arka_bel_dikisi; dikis_uzunluk:on_bel_dikisi; kendini_kesme:arka_bel_bandi; kendini_kesme:on_bel_bandi | COZUCU (A4): cozum SIRASI — grafdogrula once fitLength (band kenari) sonra pens agzini (cozPens) cozuyor; bant pens acilmadan onceki zincire uyduruluyor (dikis_uzunluk bel bandi, kendini_kesme bant) |
| P4-kolsuz-dik-yaka-mini | kolsuz, dik yakali, mini A etekli elbise | 8 | addPanel, drop, extendTo, fitLength, flare, sew | UYGULANDI | 5 | **0 kirmizi** | — |
| P5-ust-gomlek-yaka-buzgu | gomlek yakali, uzun kollu, yakasi buzgulu bluz | 15 | addPanel, drop, extendTo, fitLength, gather, sew | UYGULANDI | 5 | 3 kirmizi: dikis_uzunluk:boyun_ust_dikisi; dikis_uzunluk:kol_oyugu; kisit:P5-ust-gomlek-yaka-buzgu | OKUMA/PROGRAM: bel altina uzayan bedende pens apeksi yerinde kalir, pens etek ucuna acik iner; reshapeEdge ile apeks tasinabilir, bu programda yazilmadi<br>PRIMITIF: slashSpread{panel, edge, ratio} — kenara kumas EKLEME (yarip acma); gather komsu koseleri tasiyor, omuz/oyuk uzunlugu bozuluyor, band kisiti (1.3) cozulmuyor (kisit, boyun_ust_dikisi, kol_oyugu kirmizilari) |
| P6-a2-cumlesi | bel dikisli, kolsuz, yuvarlak yakali, etek ucu genisleyen, arkadan kapanan elbise | 3 | drop, flare | UYGULANDI | 4 | **0 kirmizi** | — |
| P7-tek-omuz-asimetrik-fiyonk | bel hizasinda fiyonklu tek omuz asimetrik elbise (SOZLUK DISI) | 17 | addPanel, merge, mirror, reshapeEdge, sew | UYGULANDI | 9 | 13 kirmizi: centik:bel @0.3300; dikis_uzunluk:kol_oyugu; dikis_uzunluk:kol_oyugu_2; halka_kapanma:bel_halka (waist_ring); halka_kapanma:etek_ucu (hem); halka_kapanma:yaka (neck); kenar_turu:arka_ayna/cb; kenar_turu:arka_etek_ayna/cb; kenar_turu:on_tam/shoulder.2; kisit:P7-tek-omuz-asimetrik-fiyonk; topoloji:arka_ayna/cb; topoloji:arka_etek_ayna/cb; topoloji:on_tam/shoulder.2; CIZIM: ERR_NO_VIEW: hicbir panel kat kenari tasimiyor, gorunum kurulamadi | PRIMITIF: resew{seam, a, b} — var olan dikisin kenar referanslarini yeniden yazma; ayna sonrasi kendi-ayna dikisi (arka_orta_beden: a=b=arka_beden/cb) iki panele acilamiyor, arka_ayna/cb acik kalir (kapanma/dikis_cifti kirmizi, ERR_NO_VIEW)<br>PRIMITIF: joinEdges{panel, edgeA, edgeB} — bitisik iki kenari tek kenar yapma (subdivide'in tersi); tek omuzun egik hatti shoulder.2 + neck_front.2 tek kenar olmali<br>KISMEN: ayna + 6 dikis + iki birlestirme motordan gecti; kalan iki kalem eksikPrimitif |
| P8-kimono-kollu-wrap | kimono kollu wrap (SOZLUK DISI) | 10 | drop, moveVertex, reshapeEdge, sew | UYGULANDI | 4 | **0 kirmizi** | PRIMITIF: resew (P7 ile ayni) — wrap on parca CF'yi asip obur yan dikise gider; ayna + kendi-ayna dikisini acma gerekir<br>kimono kol: kol paneli kaldirilip omuz/oyuk koseleri disari tasindi (moveVertex), koltukalti hatti one-arkaya dikildi |
| P9-korse-ustlu-balon-etek | korse ustlu balon etek (SOZLUK DISI) | 19 | addPanel, closure, drop, fitLength, gather, reshapeEdge, sew, split, subdivide | UYGULANDI | 6 | **0 kirmizi** | OKUMA: ust kenar duz (koltukalti hizasi); gogus ustu kavis icin kontrol noktasi orani verilmedi, uydurulmadi |
| P10-keyhole-yakali-dropped-waist | keyhole yakali dropped waist (SOZLUK DISI) | 10 | extendTo, reshapeEdge, subdivide | UYGULANDI | 5 | **0 kirmizi** | — |
| BUGRA-1-buttoned-corset-bustier | Bugra Buttoned Corset Bustier: 6 parca — upper cup, lower cup, front side, front center, back side, back center (fold); onden dugmeli | 28 | closure, drop, reshapeEdge, sew, split, subdivide | UYGULANDI | 5 | 2 kirmizi: kendini_kesme:on_alt_kap; supresyon:BUGRA-1-buttoned-corset-bustier | Bugra'da orta arka KATLI ve kapanma onde: tabanin arka orta fermuar dikisi ust kesimle silinip alt parcada yeniden dikildi (arka_orta_alt zipper); fermuari HIC dikmemek icin dikis kaldiran primitif yok -> arka kapanma fazladan (Bugra'da yok)<br>OKUMA/PROGRAM: kap dikisi duz (kavis orani yok); kesim noktasi apeksin altinda secildi, pens-dikisiyle kesisiyor (kendini_kesme on_alt_kap) — program duzeltilmedi<br>COZUCU (A4): supresyon kapisi dikise gomulu supresyonu olcmuyor — pensler prenses dikisine emilince %0 gorur<br>6 parca: on_ust_kap, on_alt_kap, on_yan, arka_orta, arka_yan (+ arka orta 2 parca, kat degil) |
| BUGRA-2-locket-top | Bugra Locket Top: front body (dugmeli), back body (bel pensi, kalca boyu), collar + collar lining, lower sleeve + upper sleeve (%29-35 buzgulu) | 16 | addPanel, closure, drop, extendTo, fitLength, sew, split, subdivide | UYGULANDI | 6 | **0 kirmizi** | PRIMITIF: dart{panel, mouth a/b, apexUp, apexDown} — sifirdan ic halka (balik) pens; bugun Panel.darts yalniz merge ile dogar; Bugra arka bel pensi bu yuzden etek ucuna acik iniyor<br>OKUMA: astar ic kenari raw (boyun dikisine ikinci katman olarak girmesi ayni-dikise-ucuncu-katman sinirina takilir; PRIMITIF adayi degil, dikis modeli siniri, foto 1 ile ayni)<br>6 parca: on_beden(2), arka_beden(2), boyun_parca, boyun_parca_astar, kol_ust(2), kol_alt(2) |

## Ozet

- Motordan gecen ve 0 kirmizi ve eksiksiz: **3/12** (P4-kolsuz-dik-yaka-mini, P6-a2-cumlesi, P10-keyhole-yakali-dropped-waist)
- Motordan gecen ama eksik primitif ilan eden ya da kirmizi tasiyan: **9** (P1-keskin-koseli-yaka, P2-ayrik-panelli-buzgulu-kol, P3-etek-tek-topoloji, P5-ust-gomlek-yaka-buzgu, P7-tek-omuz-asimetrik-fiyonk, P8-kimono-kollu-wrap, P9-korse-ustlu-balon-etek, BUGRA-1-buttoned-corset-bustier, BUGRA-2-locket-top)
- Motorun reddettigi program: **0** (—)
- Fotograflar: 5/5 grafdogrula 0 kirmizi; eksik primitif ilani olan: 5/5

## Eksikler uc kovada (hakem A3 kusur 2: kovalar ayri)

**1. EKSIK PRIMITIF — kumeye eklenecek op (ad + args imzasi; geometri emri, giysi adi degil):**

- `extendTo{yLandmark, yLandmark2, yLerp}` — (P1-keskin-koseli-yaka)
- `slashSpread{panel, edge, ratio}` — (P5-ust-gomlek-yaka-buzgu)
- `resew{seam, a, b}` — (P7-tek-omuz-asimetrik-fiyonk)
- `joinEdges{panel, edgeA, edgeB}` — (P7-tek-omuz-asimetrik-fiyonk)
- `resew (P7 ile ayni)` — (P8-kimono-kollu-wrap)
- `dart{panel, mouth a/b, apexUp, apexDown}` — (BUGRA-2-locket-top)
- `setGrain{panel, deg}` — (foto 1, foto 2, foto 3)

**2. COZUCU / KAPI eksigi (primitif degil; A4 supresyon-kisit isi):**

- dikise gomulu supresyon — bacaklar seam olunca cozPens (dartLeg cifti + ic pens) onlari gormez, b — (P2-ayrik-panelli-buzgulu-kol)
- cozum SIRASI — grafdogrula once fitLength (band kenari) sonra pens agzini (cozPens) cozuyor; bant — (P3-etek-tek-topoloji)
- supresyon kapisi dikise gomulu supresyonu olcmuyor — pensler prenses dikisine emilince %0 gorur — (BUGRA-1-buttoned-corset-bustier)

**3. OKUMA / PROGRAM eksigi (oran verilmedi, kontrol noktasi uydurulmadi, program duzeltilmedi; kumeyle ilgisi yok):**

- bant dikisinin orani (2.2) secildi; lastik esnemesi kumas katalogundan gelir (A6 fabric-catalog), graf  — (P2-ayrik-panelli-buzgulu-kol)
- kol agzi 1.3 acilinca koltukalti kenari kapakla kesisiyor (kendini_kesme kol); reshapeEdge ile  — (P2-ayrik-panelli-buzgulu-kol)
- bel altina uzayan bedende pens apeksi yerinde kalir, pens etek ucuna acik iner; reshapeEdge ile — (P5-ust-gomlek-yaka-buzgu)
- ust kenar duz (koltukalti hizasi); gogus ustu kavis icin kontrol noktasi orani verilmedi, uydurulmadi — (P9-korse-ustlu-balon-etek)
- Bugra'da orta arka KATLI ve kapanma onde: tabanin arka orta fermuar dikisi ust kesimle silinip alt parcada yen — (BUGRA-1-buttoned-corset-bustier)
- kap dikisi duz (kavis orani yok); kesim noktasi apeksin altinda secildi, pens-dikisiyle kesisiy — (BUGRA-1-buttoned-corset-bustier)
- astar ic kenari raw (boyun dikisine ikinci katman olarak girmesi ayni-dikise-ucuncu-katman sinirina tak — (BUGRA-2-locket-top)
- ikinci katin bel dikisine yakalanmasi — ayni dikise ucuncu katman dikis modelinde yok; kat yuze dikili  — (foto 1, foto 2)
- kesme hattinin kavisli-dis bicimi icin kontrol noktasi orani verilmedi, duz kesildi — (foto 3)
- kol agzi dusey dugme detayi — kapanma yalniz dikise yazilir, kol agzi dikis degil (detay, kalip parcasi — (foto 3)
- bagimsiz parca (bel bandi/kusak) — hicbir panele dikili degil, komsuluk_bagli kurali reddeder; aksesuar — (foto 4, foto 5)
- yama parcanin yatay yeri fotograftan oran olarak cikarilmadi (DOGRULANMADI, secildi) — (foto 4)
- KAPANDI 2026-09-09: ic halka pens (balik pensi) Panel.darts olarak merge ile geliyor; grafdogrula pens_cozum a — (foto 5)
- CB kapanma turu okunamadi; tabanin fermuari duruyor (ilan) — (foto 5)
