# stitchu golden adli inceleme (re-pin reddi uzerine)
2026-07-19 — Damla'nin BLOCKER'i: re-pin adayi (23406) "identical + 372 yeni kayit" diye sunuldu ama icinde yerinde geometri degisikligi var. Bu rapor 4 soruyu dosya/commit referansli, olcumle cevaplar. Hicbir sey pinlenmedi, ana agaca bu dosya disinda yazilmadi, 0 API cagrisi.

## OLCUM ALTYAPISI
Worktree'ler ~/.cache/stitchu-adli/<sha>/ altinda kuruldu, her birinde `cmake --build --target golden_dump` + kosum. Karsilastirma md5 + cmp (byte duzeyi).

| commit | tarih | golden_dump satir | md5 |
|---|---|---|---|
| 234659b (pin commit, "smooth bezier armholes") | 17 Tem 14:54 | 23034 | 0f1ff71b... == repodaki engine/golden-reference.csv (cmp byte-identical) |
| 00f429c (20cc289'un ebeveyni) | 18 Tem | 23034 | 0f1ff71b... (pin ile byte-identical) |
| **20cc289 ("refine dart drafting to aldrich")** | **18 Tem 13:59** | **23406** | **7c3d83f2... (bugunku HEAD regen ile byte-identical)** |
| 6923237 (pre-K2) | 19 Tem | 23406 | 7c3d83f2... |
| 71ed330 (post-K2) | 19 Tem | 23406 | 7c3d83f2... |
| 7f0a000 (pre-K4) | 19 Tem | 23406 | 7c3d83f2... |
| a15bdd3 (post-K4) | 19 Tem | 23406 | 7c3d83f2... |
| 430e6e9 (HEAD = tag v1.0) | 19 Tem | 23406 | 7c3d83f2... |

/tmp kanit dosyalari: z-golden-1.csv == z-golden-2.csv == k4-golden-baseline/after == golden_now/phase1/phase2 == md5 7c3d83f2 (hepsi HEAD-donemi regen'i). Hicbirine dokunulmadi.

## SORU 1 — GEOMETRIYI DEGISTIREN KOD HANGISI, HANGI COMMIT?
**Cevap: tek commit, 20cc289 (18 Tem 13:59, "engine: refine dart drafting to aldrich, shaping resolver, sewability census").** Ebeveyni 00f429c'nin dump'i pin ile byte-identical; 20cc289'un dump'i bugunku HEAD regen'i ile byte-identical. Iraksama tek noktada dogdu ve zincir boyunca bir daha hic degismedi.

Degisen dosyalar (git show 20cc289 --stat): engine/src/bodice.cpp (+49), bodice.hpp, garment.cpp (+23), skirt.cpp (+25), skirt.hpp (+ yeni tests/sewable_census.cpp). "Tablo" degil, koda gomulu cizim sabitleri/formulleri degisti (commit mesajindaki sayilarla): omuz dikisi 78.5mm/32.8° → 117.7mm/22° (Aldrich blok), bust dart 11.5° → 15.4°, duz etek bel darti 30mm ustunde IKIYE BOLUNUR (koni onleme), + resolveShaping merkezilestirmesi. (Bu degerler K4'te constants.yaml'a tasindi — deger degistirmeden, golden 23406 sabit kaldi.)

**Delta imzasi eslesmesi (pin 23034 vs aday 23406, anahtar = body|spec):**
- yeni giysi anahtari 0, silinen 0 (Damla'nin kaniti ile ayni)
- yerinde degisen giysi: 562/1122 (Damla'nin 537 sayisi anahtar granularitesine gore; ayni sinif)
- 500 giyside satir sayisi AYNI, salt koordinat degisimi (omuz/dart formulu → karisik isaretli delta; Damla'nin +51/+74/.../−9/−7 histogramiyla tutarli, tek-sabit-kaydirma degil)
- 62 giyside +6 satir → 62×6 = **372** satir farkinin TAMAMI; 62'si tam olarak straight-skirt'lu giysiler (25 aLine-bodice + 25 straight + 12 dress-length dagilimi), +6 satir = tek dart isareti (3 satir) → bolunmus cift dart (2×3 satir): 20cc289'un "skirt waist dart splits above 30mm" satiriyla birebir.
- yerinde degisen satirlar TUM parca tiplerinde: Balloon Sleeve 2112, Bodice Front/Back 1770+1770, Sleeve 1679, Top Front/Back 840+840, Skirt Front/Back 425+425 (Damla'nin "tum parca tipleri" kaniti dogru).

## SORU 2 — MOTOR SU AN NEREDEN TURETIYOR, 23034 YENIDEN URETILEBILIR MI?
Kaynak HEAD'de: engine/constants.yaml → gen-constants.mjs → constants.gen.hpp (K4 be2bbb0'dan beri) + contract/tables.json → contract.gen.hpp (K1 c3c07b0'dan beri); geometri kodu engine/src/bodice.cpp / skirt.cpp bu uretilmis header'lardan okur.

Ampirik:
- 23034'u ureten SON commit **00f429c**; onun ve pin commit 234659b'nin dump'i repodaki golden-reference.csv ile **byte-identical (EVET, md5 0f1ff71b)**. Pin tam olarak yeniden uretilebilir — ama sadece 18 Tem 13:59 oncesi kodla.
- HEAD (430e6e9) dump'i 23406 / md5 7c3d83f2: **HEAD kodundan 23034 uretilemiyor (HAYIR, kanitli).** Uretmek 20cc289'un cizim degerlerini geri almayi gerektirir.

## SORU 3 — NEDEN "IDENTICAL + 372" DIYE RAPORLANDI?
Zincirdeki her "golden byte-identical" iddiasi **regen-vs-regen** idi, hicbiri 23034 pinine karsi degildi:

| beyan | neye karsi diff | dogru mu |
|---|---|---|
| 18 Tem enum-err (~/damla_projects_2026/reports/2026-07-18-enum-err-fix.md:108-114) | oturum-basi dump hash'i (5240397b, 23406-donemi) | DOGRU ve ACIK: "golden-reference.csv HEAD ile zaten uyusmuyor (23034 vs 23406)... Kok: dunku 20cc289 (Aldrich iki-dart)... Front marking 3 satir → 6 satir. TOPLU ONAY YAPMADIM." Kok neden O GUN dogru teshis edilmisti. |
| K1 (reports/2026-07-19-stitchu-k1-kontrat.md:49) | pristine HEAD ec42994 regen (23406 == 23406) | diff dogru; pin bayatligi SONRADAN BULUNDU olarak beyanli |
| K2 (k2-kompozisyon.md:50) | pristine origin/main regen + pre-K2 vs HEAD (23406) | dogru (olctugum: 6923237 == 71ed330) |
| K4 (k4-sabitler-sloper.md:153) | relocation oncesi/sonrasi dump (23406) | dogru (7f0a000 == a15bdd3; /tmp k4-golden-* ayni md5) |
| K3 (k3-preview-truth.md:137-138) | by-construction (motor diff yok) + "golden ctest passed" | by-construction dogru; **"golden ctest" YANLIS ETIKET — golden ctest'i yok (bkz. soru 4)** |
| K6 (k6-operasyon.md:136) | by-construction | dogru |
| Z / kapanis (v1-kapanis.md:124-125, 209-213) | HEAD-regen vs HEAD-regen (z-golden-1 == z-golden-2) | diff dogru; ama 7a "tek komutla re-pin edilir" cercevesi iceriksel farki tasimiyor |

"372 yeni kayit / identical" ifadesi repo dokumanlarinin HICBIRINDE yok — repodaki dil "bayat, 23034 vs 23406" (satir aritmetigi). O etiket re-pin talep MESAJINDA dogdu: 23406−23034=372 aritmetigi "eskisinin ustune 372 ek" gibi sunuldu. Maskeleme mekanizmasi: zincir boyunca kimse pin-vs-aday ICERIK diff'i kosmadi (ilk kosan Damla); satir-sayisi aritmetigi 500 salt-koordinat yerinde degisimini gorunmez kildi.

Durust teshis: "23406 her rayda byte-identical" beyanlari OLCTUKLERI SEY icin dogruydu (zincir motora dokunmadi — bu adli incelemeyle bir kez daha kanitlandi). Yaniltici olan iki etiket: (1) "golden-reference.csv **bayat**" — dogrusu "20cc289 davranis degisikligiyle ICERIK OLARAK ayristi (562 giysi yerinde)"; (2) re-pin mesajindaki "identical + 372 yeni kayit". Ayrica 18 Tem raporundaki dogru kok-neden teshisi (20cc289, iki-dart, yerinde degisim) zincir ozetlerine TASINMADI, sadece satir aritmetigi tasindi.

## SORU 4 — DENETIM Z NEYE DIFF'LEDI, CTEST GOLDEN'I NEYI KULLANIYOR?
- Z'nin golden maddesi (DEVAM-KAPANIS-LOOP.md:232 "kendi derler+kosar: ... golden regen"): iki bagimsiz HEAD kosumu birbirine diff'lendi — /tmp/z-golden-1.csv == /tmp/z-golden-2.csv (md5 7c3d83f2, 23406). **Z, 23034 pinine HIC diff'lemedi.** Anayasasi da bunu istemiyordu (regen tekrarlanabilirligi).
- **ctest'te golden testi YOK.** engine/CMakeLists.txt:48-49 golden_dump'i sadece DERLER, add_test kaydi yok (45 testin hicbiri golden degil). golden-reference.csv'yi okuyan tek arac engine/golden-diff.py (elle kosulur, Swift-vs-C++ kiyasi icin yazilmis; usage satiri golden-diff.py:5). Repo genelinde golden-reference.csv'ye kod referansi sifir — sadece doc/rapor. Bu bosluk 18 Tem raporunda da beyanli ("hicbir ctest golden'i zorlamiyor", enum-err-fix.md:110) ama v1.0'a kadar kapatilmadi. K3 raporundaki "golden ctest passed in the 45" ifadesi bu yuzden yanlis etiket.

## KARAR VERISI (A/B — karar Damla'nin)

| soru | olcum |
|---|---|
| A yolu: 23034 HEAD kodundan uretilebilir mi? | **HAYIR** (HEAD regen 23406/7c3d83f2). 23034'e donmek = 20cc289 cizim degerlerini geri almak. NOT: K4 kagit sloper 22°/117.7mm YENI degerleri Aldrich'e karsi VERIFIED isaretledi ve ctest sloper_check (a15bdd3) onlara pinli — 23034'e donus, kagit-dogrulanmis degerlerden refuted eski degerlere (32.8° omuz) donus demektir ve sloper_check'i kirar. |
| B yolu: 20cc289 bilincli/gerekceli mi? | Commit mesaji degerleri kaynakli veriyor (Aldrich blok, dart derece, 30mm bolme) + sewable_census 70200 kaniti ayni commit'te; 18 Tem FAZ 0 kaydi (hafiza: "suppression/koni DUZELTILDI omuz+dart", roadmap asama 2) isin Damla'nin gundemindeki koni/omuz duzeltmesi oldugunu gosteriyor; K4 bagimsiz kagit sloper dogrulamasi ustune geldi. **EKSIK olan: 18 Tem'de golden'in 562 giyside degistigi Damla'ya ICERIK olarak sunulup onay alinmadi** (enum-err raporu "TOPLU ONAY YAPMADIM, re-pin onay bekliyor" dedi ama fark ozeti "satir sayisi + duz etek isareti" duzeyinde kaldi, bodice/kol yerinde degisimi hic listelenmedi). |
| K2 mini-denetimi yeni golden'a karsi yeniden kossa? | Ayni sonuc: pre-K2 (6923237) ve post-K2 (71ed330) dump'lari zaten ayni md5 (7c3d83f2). Ampirik kosuldu. |
| K4 mini-denetimi yeni golden'a karsi? | Ayni sonuc: 7f0a000 == a15bdd3 == HEAD (ampirik) + /tmp k4-golden-baseline/after ayni md5. |
| Zincir butunlugu | Iraksama zincirden ONCE (18 Tem 13:59); K1→Z arasi motor ciktisi bayt duzeyinde sabit (6 commit noktasinda ampirik). Zincirin "motor davranisi degismedi" iddiasi DOGRU; yanlis olan re-pin'in sunumu. |

## YANILTICI ETIKET LISTESI
1. "identical + 372 yeni kayit" (re-pin talep mesaji; repoda yok) — gercek: 0 yeni anahtar, 562 giysi yerinde degisim, +372 = 62 etek × bolunmus dart.
2. "golden-reference.csv bayat" (K1:49, kapanis 7a, CLAUDE.md:3) — "bayat" surum-gerisi cagristiriyor; gercek: davranis degisikligi iceren icerik ayrismasi.
3. "golden ctest passed in the 45" (k3-preview-truth.md:138) — golden ctest'i mevcut degil (CMakeLists.txt:48-49, add_test yok).
4. "tek komutla re-pin edilir" (v1-kapanis.md:212) — teknik olarak dogru, ama onaya sunulan seyin 562 giysilik geometri degisikligi onayi oldugunu soylemiyor.
