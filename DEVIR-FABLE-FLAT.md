# DEVİR — FABLE 5'E: FLAT/KALIP MOTORU KÖK ÇÖZÜM

> 2026-07-24. Önceki model (Opus) flat/kalıp katmanında BAŞARISIZ oldu. Damla haklı olarak
> "geçti dediğin hiçbir şey geçmedi, tek bir flat'ı bile beğenmedim" dedi. Bu dosya kör bir
> devir değil: sorun nerede, hangi denemeler nasıl battı, Damla'nın gerçek talebi ne — hepsi
> burada. Fable'ın görevi: HER KATMANDA kök sorunu bul ve çöz, düzgün kalıp+flat üret.

## DAMLA'NIN SÖZLERİ (birebir, süslemeden)
- "bir tane bile flati beğenmedim. bir tane bile."
- "artık tank top falan asla görmek istemiyorum."
- "görmüyorsun, çizemiyorsun, hele prenses dikişlerini çizmek aklına nereden geldi?"
- "git flat modellerine oturt — yok yapamadın, üst üste getiremedin, sadece etrafından çizdin."
- "örnek verdim, aynısını yap dedim — yapamadın aynısını ya."
- "vektör kopyala dedim, gittin i lib yükledin ama tırtıklı oldu."
- "geçme ayarın neyse 'geçti' dedin, hiçbiri geçmedi."
- "ben artık kalıp + flat istiyorum, düzgün."

## KENDİ GÖZÜMLE GÖRDÜĞÜM (Opus, /tmp/motor-flat.png render ettim)
scoop-neck-tank-mini-dress-flat.svg'yi PNG'ye çevirip baktım. GERÇEK:
- Siluet KUTU/ÇUVAL: bel girintisi yok, göğüs/kalça oranı yok, croquis'e oturmamış.
- İç çizgiler (dart) HAVADA yüzüyor, kenara bağlanmıyor, rastgele saç-teli.
- Bir flat SVG'de sadece 12 çizim elemanı / 4 path — çok fakir, "etrafından çizmiş".
- Damla'nın referansı (fashion-flat-models/*.png) = zarif ön+arka croquis, giysi vücuda oturur.
  Motorun ürettiği = onunla aynı sınıfta DEĞİL.

## FLAT MOTORU BUGÜN NASIL ÇALIŞIYOR (agent damıtması)
- **Mimari:** parametrik outline üreteç. engine/flat-engine/_engine-full.mjs (3500+ satır, salt-okur).
  buildHalf() = neck derinliği, armhole oyuğu, bel nip, etek fullness gibi SAYILARDAN Bézier çiziyor.
- **Şablon-tabanlı DEĞİL:** croquis üstüne oturtmuyor; sıfırdan parametrik outline. Bu yüzden "vücuda oturmuyor".
- **Stiller:** styles.json'da 29 stil, her biri elle kalibre KÖK PARAMETRE seti. 24 "geçti" = sadece bu kalibre edilmiş stiller.
- **Prenses/dart:** motor princess panel + bust dart çizebiliyor ama görsel elegans yok (Damla "aklına nereden geldi" diyor — teknik olarak var, estetik olarak battı).

## DENENEN 4 YÖNTEM — HEPSİ NEDEN BATTI
1. **Parametrik outline (şu anki):** çalışıyor ama her güzellik için SAYIYI elle tune etmek gerekiyor → sonsuz döngü, ölçeklenmiyor, ve sonuç yine kutu-siluet.
2. **Vektör-trace (engine/imitate/trace-piece.mjs):** Damla "i lib, tırtıklı" dedi. Radial-trace (merkezden 120 açısal nokta) yapısal olarak TIRTIKLI. Bezier smooth yetmedi. REDDEDİLDİ, dosya ölü (motora hiç feed edilmedi).
3. **Derive-from-template (BugraPatterns mm ölçüleri):** 29 stil için elle kalibrasyon. Yeni stil = yeni elle revizyon → 79 hedef "beyondEngine" kaldı.
4. **LLM-JSON:** RULES.md "LLM gerçek kalıp geometrisi bilmez" → reddedildi.

## "GEÇTİ" ÇELİŞKİSİNİN KÖKÜ (en önemli)
Raporlar 24 "GECTI" diyor AMA Damla hiçbiri dikilmedi/beğenilmedi diyor. Sebep:
- **Hakem neyi ölçtü:** validator 0 hata + kalıp mm sapması (worstD 0.12-0.72mm) + "emsal-seviye geometri".
- **Hakem neyi ÖLÇMEDİ:** GÖRSEL GÜZELLİK ve GİYİLEBİLİRLİK. Kutu-siluet "sayısalca doğru" geçti ama gözle çirkin.
- Yani hakem yanlış şeyi ölçüyordu: mm-doğruluğu ≠ güzel flat. Damla'nın gözü = tek geçerli hakem, o da 0 verdi.
- Numune terziye HİÇ gitmedi (id82 sadece "seçildi", dikilmedi). "Geçti" iddiası boştu.

## DOĞRU YÖNTEM (BugraPatterns referansından, patterns_real/BUGRA-DEFTER.md)
Gerçek profesyonel flat/kalıp:
- **Göğüs = YATAY cup seam** (Upper Cup + Lower Cup ayrı parça), motor tek-parça+dart yapıyor → göğüs oturmuyor.
- **Kol = 2-parçalı** (upper+lower), motor tek set-in.
- Croquis'e oturan zarif siluet (bel/göğüs/kalça gerçek oran), motor kutu çiziyor.

## FABLE'A GÖREV (Damla'nın emri: her katmanda kök sorunu bul ve çöz)
1. **ÖNCE GÖR:** her flat'ı PNG render edip GÖZLE bak (resvg var: engine/tools/node_modules/@resvg/resvg-js). Koda bakıp "iyi" deme — Opus'un hatası buydu.
2. **KÖK KATMAN:** parametrik outline sıfırdan çizmek yerine, Damla'nın verdiği croquis/referansa (fashion-flat-models/) giysiyi OTURT. "Üst üste getir" = giysiyi vücut şablonuna bindirme problemi çözülmemiş.
3. **VEKTÖR KOPYA DÜZGÜN:** Damla "vektör kopyala" istedi, trace tırtıklı oldu. Tırtıksız vektör (düzgün Bezier fit, açısal-trace DEĞİL) gerekiyor.
4. **HAKEM = GÖZ:** "geçti" sadece Damla flat'ı beğenince. mm-doğruluğu tek başına asla "geçti" değil.
5. **TANK TOP YOK:** Damla artık tank/kutu flat görmek istemiyor. Prenses dikişi denemelerine girme. Düzgün, croquis'e oturan, gerçek referansın aynısı flat.

## YOL DOSYALARI
- Flat motoru: engine/flat-engine/_engine-full.mjs + styles.json + cloth-solver.mjs
- Vektör-trace denemesi (ölü, tırtıklı): engine/imitate/trace-piece.mjs
- Damla'nın gerçek referansları: fashion-flat-models/*.png (croquis) + patterns_real/ (BugraPatterns gerçek kalıp)
- Denemeler: new_flats/ (volume_1, volume_2 round raporları)
- Batan derslerin tümü: DERSLER.md
