# Primitif kumesinin TAMLIK kaniti — 5 fotograf, 10 prompt, Bugra'nin 2 kalibi

Uretici: `python3 KOSU/0509-a3-tamlik.py`. Her satir motordan GECTI ya da adiyla RED; tablo elle yazilmadi.
Kume: `contract/graf-v1.json` oplar (19 op). Kural (Damla, 9 Eyl): fotograf/prompt basina op eklenmez; yazilamayan kalem
**eksik primitif** olarak geometrik adiyla asagida durur, sozluk acilmaz. grafdogrula = gercek36, 0 kirmizi = dikilebilir tutarlilik.

**Kullanilan primitifler (14/19):** addPanel, closure, drop, extendTo, fitLength, flare, gather, merge, mirror, moveVertex, reshapeEdge, sew, split, subdivide
**Kumede olup hic kullanilmayan:** attach, extend, overlay, shorten, suppress

## Fotograflar (KOSU/ciktilar/giris/N, okuma opDemeti = primitif)

| # | fotograf | op | primitifler | grafdogrula | eksik primitif (geometrik adiyla) |
|---|---|---|---|---|---|
| 1 | biba-O1194418-dress.jpg | 8 | addPanel, closure, extendTo, fitLength, reshapeEdge, sew | **0 kirmizi** | kumas grain ekseni 45 derece: Panel.grainDeg alani var, op yok (grain yazan primitif) — kalibi degistirmez, kesim planini degistirir<br>ikinci katin bel dikisine YAKALANMASI: ayni dikise ucuncu katman yok; kat yuze dikili (onto) olarak yazildi, konstruksiyon notu farkli |
| 2 | biba-O1194418-dress-arka.jpg | 8 | addPanel, closure, extendTo, fitLength, reshapeEdge, sew | **0 kirmizi** | kumas grain ekseni 45 derece: Panel.grainDeg alani var, op yok (grain yazan primitif) — kalibi degistirmez, kesim planini degistirir<br>ikinci katin bel dikisine YAKALANMASI: ayni dikise ucuncu katman yok; kat yuze dikili (onto) olarak yazildi, konstruksiyon notu farkli |
| 3 | biba-O120579-dress.jpg | 14 | addPanel, extendTo, fitLength, reshapeEdge, sew, split, subdivide | **0 kirmizi** | kesme hattinin kavisli-dis bicimi: kontrol noktasi uydurulmadan yazilamadi (oran verilmedi), duz kesildi<br>kol agzindaki dusey dugme/carpma detayi: kapanma yalniz dikise yazilir, kol agzi dikis degil<br>kumas grain ekseni: op yok |
| 4 | mary-quant-O365926-dress.jpg | 12 | addPanel, closure, extendTo, fitLength, merge, reshapeEdge, sew | **0 kirmizi** | bagimsiz parca (bel bandi/kusak): hicbir panele dikili degil; komsuluk_bagli kurali bagimsiz parcayi reddediyor, primitif yok (aksesuar)<br>yama parcanin yatay yeri fotograftan oran olarak cikarilmadi (DOGRULANMADI, secildi) |
| 5 | mary-quant-O365926-dress-arka.jpg | 8 | addPanel, extendTo, fitLength, merge, sew | **0 kirmizi** | IC HALKA PENS (bel pensi, bel dikisi yokken): panel modeli dis halkadir; merge bel pensini dusurur (reason'da adiyla). Kumeye eklenecek primitif: pens (ic halka)<br>bagimsiz parca (bel bandi): komsuluk kurali, primitif yok<br>CB kapanma turu okunamadi: taban grafin fermuari duruyor (ilan) |

## Promptlar (10; P7-P10 sozluk disi) ve Bugra'nin iki kalibi

| ad | girdi | op | primitifler | motor | panel | grafdogrula | eksik primitif / not |
|---|---|---|---|---|---|---|---|
| P1-keskin-koseli-yaka | yatik bebe yaka ama koseleri sivri, kisa kollu, A etekli midi elbise | 7 | addPanel, extendTo, fitLength, flare, sew | UYGULANDI | 6 | **0 kirmizi** | kisa kol: taban kol agzi dirsekte; omuz-dirsek arasinda landmark yok, ara nokta (extendTo) yazilamiyor -> extendTo yLerp (landmark cifti + oran) primitif eksigi |
| P2-ayrik-panelli-buzgulu-kol | prenses dikisli beden, balon kol, kolda lastik buzgu, uzun kollu maxi elbise | 17 | addPanel, extendTo, fitLength, gather, reshapeEdge, sew, split, subdivide | UYGULANDI | 8 | 5 kirmizi: centik:bel @0.3300; dikis_uzunluk:bel; dikis_zincir:kol_oyugu; halka_kapanma:kol_oyugu_halka (armhole); kendini_kesme:kol_bandi | lastik: bant dikisinin orani (2.2) secildi, kumas/lastik esnemesi bir sayi olarak grafta yok<br>prenses dikisine emilen pens: bacaklar seam olunca pens cozucusu (cozPens, yalniz dartLeg cifti + ic pens) onlari gormez -> bel dikisi iki tarafi esit cikmaz (dikis_uzunluk bel, centik bel). Eksik: dikise gomulu supresyonu cozen kisit (A4 supresyon isi)<br>balon kolun kendini kesmesi (kendini_kesme kol): kol agzi 1.3 acilinca koltukalti kenari kapakla kesisiyor; cozum reshape ile mumkun, burada yazilmadi |
| P3-etek-tek-topoloji | A formlu kemerli midi etek | 13 | addPanel, drop, extendTo, fitLength, flare, sew | UYGULANDI | 4 | 4 kirmizi: dikis_uzunluk:arka_bel_dikisi; dikis_uzunluk:on_bel_dikisi; kendini_kesme:arka_bel_bandi; kendini_kesme:on_bel_bandi | bel bandinin dikis uzunlugu: dogrulayici once fitLength'i (band kenari) sonra pens agzini (cozPens) cozuyor; bant, pens acilmadan onceki zincire uyduruluyor -> dikis_uzunluk kirmizi. Eksik primitif degil, cozum SIRASI (grafdogrula.cpp; A4 supresyon/kisit isi) |
| P4-kolsuz-dik-yaka-mini | kolsuz, dik yakali, mini A etekli elbise | 8 | addPanel, drop, extendTo, fitLength, flare, sew | UYGULANDI | 5 | **0 kirmizi** | — |
| P5-ust-gomlek-yaka-buzgu | gomlek yakali, uzun kollu, yakasi buzgulu bluz | 15 | addPanel, drop, extendTo, fitLength, gather, sew | UYGULANDI | 5 | 3 kirmizi: dikis_uzunluk:boyun_ust_dikisi; dikis_uzunluk:kol_oyugu; kisit:P5-ust-gomlek-yaka-buzgu | bel altina uzayan beden: pens apeksi yerinde kalir, pens etege kadar acik iner (gercek kalipta pens bel altinda kapanir) -> reshapeEdge ile apeks tasinabilir, burada yazilmadi<br>buzgulu boyun: gather boyun kenarini eksen etrafinda buyutur, omuz-boyun kosesi disari kayar; kumas EKLEME (yarip acma / slash-spread) yok -> band kisiti (1.3) bu bedende cozulmuyor (kisit kirmizi), boyun_ust_dikisi ve kol_oyugu uzunluklari sapar. Eksik primitif: kenara kumas ekleyen 'yar ve ac' (slash&spread) |
| P6-a2-cumlesi | bel dikisli, kolsuz, yuvarlak yakali, etek ucu genisleyen, arkadan kapanan elbise | 3 | drop, flare | UYGULANDI | 4 | **0 kirmizi** | — |
| P7-tek-omuz-asimetrik-fiyonk | bel hizasinda fiyonklu tek omuz asimetrik elbise (SOZLUK DISI) | 17 | addPanel, merge, mirror, reshapeEdge, sew | UYGULANDI | 9 | 13 kirmizi: centik:bel @0.3300; dikis_uzunluk:kol_oyugu; dikis_uzunluk:kol_oyugu_2; halka_kapanma:bel_halka (waist_ring); halka_kapanma:etek_ucu (hem); halka_kapanma:yaka (neck); kenar_turu:arka_ayna/cb; kenar_turu:arka_etek_ayna/cb; kenar_turu:on_tam/shoulder.2; kisit:P7-tek-omuz-asimetrik-fiyonk; topoloji:arka_ayna/cb; topoloji:arka_etek_ayna/cb; topoloji:on_tam/shoulder.2; CIZIM: ERR_NO_VIEW: hicbir panel kat kenari tasimiyor, gorunum kurulamadi | ayna sonrasi KENDI-AYNA dikisleri (arka_orta_beden/etek: a=b=arka_beden/cb) iki panele acilamiyor: dikis referansini yeniden yazan primitif (resew) YOK -> arka_ayna/cb ve ayna omuz-tarafi dikisleri acik kalir, dogrulayici kapanma/dikis_cifti kirmizi basar<br>tek omuzun egik hatti: sag omuz ucundan sol koltukaltina TEK kenar; bugun shoulder.2 serbest kenar yapildi ama neck_front.2 ile birlestirilmedi (kenar birlestirme = iki kenari tek kenar yapan primitif yok)<br>KISMEN: ayna + 6 dikis + iki birlestirme motordan gecti; kalan iki kalem eksikPrimitif |
| P8-kimono-kollu-wrap | kimono kollu wrap (SOZLUK DISI) | 10 | drop, moveVertex, reshapeEdge, sew | UYGULANDI | 4 | **0 kirmizi** | wrap on: on parca CF'yi asip obur yan dikise gider -> ayna + kendi-ayna dikis acma (resew) gerekli, P7 ile ayni eksik<br>kimono kol: kol paneli kaldirilip omuz/oyuk koseleri disari tasindi (moveVertex), koltukalti hatti one-arkaya dikildi |
| P9-korse-ustlu-balon-etek | korse ustlu balon etek (SOZLUK DISI) | 19 | addPanel, closure, drop, fitLength, gather, reshapeEdge, sew, split, subdivide | UYGULANDI | 6 | **0 kirmizi** | korse balenleri / kup dikisi bu promptta istenmedi; ust kenar duz (koltukalti hizasi), gogus ustu kavis kontrol noktasi uydurulmadi |
| P10-keyhole-yakali-dropped-waist | keyhole yakali dropped waist (SOZLUK DISI) | 10 | extendTo, reshapeEdge, subdivide | UYGULANDI | 5 | **0 kirmizi** | — |
| BUGRA-1-buttoned-corset-bustier | Bugra Buttoned Corset Bustier: 6 parca — upper cup, lower cup, front side, front center, back side, back center (fold); onden dugmeli | 28 | closure, drop, reshapeEdge, sew, split, subdivide | UYGULANDI | 5 | 2 kirmizi: kendini_kesme:on_alt_kap; supresyon:BUGRA-1-buttoned-corset-bustier | Bugra'da orta arka KATLI ve kapanma onde: tabanin arka orta fermuar dikisi ust kesimle silinip alt parcada yeniden dikildi (arka_orta_alt zipper); fermuari HIC dikmemek icin dikis kaldiran primitif yok -> arka kapanma fazladan (Bugra'da yok)<br>kap dikisinin gogus kavisi: kontrol noktasi uydurulmadi, duz kesim; kap kesimi orta on parcada pens-dikisi ile kesisiyor (kendini_kesme on_alt_kap) — kesim noktasi apeksin ustunde secilmeliydi, program duzeltilmedi<br>supresyon kapisi: pensler prenses dikisine emilince dartLeg/ic pens kalmiyor, kapi %0 gorur (A4: kapi dikise gomulu supresyonu olcmuyor)<br>6 parca: on_ust_kap, on_alt_kap, on_yan, arka_orta, arka_yan (+ arka orta 2 parca, kat degil) |
| BUGRA-2-locket-top | Bugra Locket Top: front body (dugmeli), back body (bel pensi, kalca boyu), collar + collar lining, lower sleeve + upper sleeve (%29-35 buzgulu) | 16 | addPanel, closure, drop, extendTo, fitLength, sew, split, subdivide | UYGULANDI | 6 | **0 kirmizi** | arka bel pensi Bugra'da kalca boyunda BALIK pensi: burada pens agzi kalcaya tasindi, apeks yerinde -> pens etek ucuna acik iner; ic halka pens (Panel.darts) yalniz merge uretiyor, sifirdan ic pens yazan primitif (dart op) yok<br>yatik parcanin dis kenarina astar: astarin dis kenarlari parcaya dikildi; parcanin omuz_ustu/dis kenarlari cut oldugu icin sew onlari seam'e cevirdi (dogru), ic kenar astarda raw<br>6 parca: on_beden(2), arka_beden(2), boyun_parca, boyun_parca_astar, kol_ust(2), kol_alt(2) |

## Ozet

- Motordan gecen ve 0 kirmizi ve eksiksiz: **3/12** (P4-kolsuz-dik-yaka-mini, P6-a2-cumlesi, P10-keyhole-yakali-dropped-waist)
- Motordan gecen ama eksik primitif ilan eden ya da kirmizi tasiyan: **9** (P1-keskin-koseli-yaka, P2-ayrik-panelli-buzgulu-kol, P3-etek-tek-topoloji, P5-ust-gomlek-yaka-buzgu, P7-tek-omuz-asimetrik-fiyonk, P8-kimono-kollu-wrap, P9-korse-ustlu-balon-etek, BUGRA-1-buttoned-corset-bustier, BUGRA-2-locket-top)
- Motorun reddettigi program: **0** (—)
- Fotograflar: 5/5 grafdogrula 0 kirmizi; eksik primitif ilani olan: 5/5

## Eksik primitif adaylari (kumeye eklenecekler; her biri geometri emri, giysi adi degil)

- kisa kol — (P1-keskin-koseli-yaka)
- lastik — (P2-ayrik-panelli-buzgulu-kol)
- prenses dikisine emilen pens — (P2-ayrik-panelli-buzgulu-kol)
- balon kolun kendini kesmesi (kendini_kesme kol) — (P2-ayrik-panelli-buzgulu-kol)
- bel bandinin dikis uzunlugu — (P3-etek-tek-topoloji)
- bel altina uzayan beden — (P5-ust-gomlek-yaka-buzgu)
- buzgulu boyun — (P5-ust-gomlek-yaka-buzgu)
- ayna sonrasi KENDI-AYNA dikisleri (arka_orta_beden/etek — (P7-tek-omuz-asimetrik-fiyonk)
- tek omuzun egik hatti — (P7-tek-omuz-asimetrik-fiyonk)
- wrap on — (P8-kimono-kollu-wrap)
- korse balenleri / kup dikisi bu promptta istenmedi; ust kenar duz (koltukalti hizasi), gog — (P9-korse-ustlu-balon-etek)
- Bugra'da orta arka KATLI ve kapanma onde — (BUGRA-1-buttoned-corset-bustier)
- kap dikisinin gogus kavisi — (BUGRA-1-buttoned-corset-bustier)
- supresyon kapisi — (BUGRA-1-buttoned-corset-bustier)
- arka bel pensi Bugra'da kalca boyunda BALIK pensi — (BUGRA-2-locket-top)
- yatik parcanin dis kenarina astar — (BUGRA-2-locket-top)
- kumas grain ekseni 45 derece — (foto 1, foto 2)
- ikinci katin bel dikisine YAKALANMASI — (foto 1, foto 2)
- kesme hattinin kavisli-dis bicimi — (foto 3)
- kol agzindaki dusey dugme/carpma detayi — (foto 3)
- kumas grain ekseni — (foto 3)
- bagimsiz parca (bel bandi/kusak) — (foto 4)
- yama parcanin yatay yeri fotograftan oran olarak cikarilmadi (DOGRULANMADI, secildi) — (foto 4)
- IC HALKA PENS (bel pensi, bel dikisi yokken) — (foto 5)
- bagimsiz parca (bel bandi) — (foto 5)
- CB kapanma turu okunamadi — (foto 5)

Not: 'eksik' satirlarinin bir kismi primitif degil OKUMA eksigidir (oran verilmedi, kontrol noktasi uydurulmadi); tabloda ayrilmadan, oldugu gibi durur.
