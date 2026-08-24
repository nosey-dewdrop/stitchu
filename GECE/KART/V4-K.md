# KART V4-K — HANGİ HAT YARGILANACAK? İki flat hattını ÖLÇ, kararı sayıya bağla

ETİKET: PARALEL (tur 1; V4-R ve V4-C ile birlikte, dosya kümesi kesişmiyor)
SÜRE TAVANI: 60 dk

## NE
Bugün İKİ flat hattı birden canlı. Konvansiyon kapısı hangisini yargılayacak?
İki hattı birden yargılayan kapı süstür. Kararı ÖLÇEREK ver — kanaatle değil.
Kod YAZMAZSIN; ölçüm probu yazabilirsin ama yalnız `GECE/probe/` altına.

## İKİ HAT (isim isim)
- **HAT-1 HESAPLANAN KABUK**: `engine/tools/shell-flat.cpp` →
  `./engine/build/shell-flat EU38 --svg` (ve argümansız hâli). Kaynağı
  `engine/src/shellprojection.cpp` + `engine/src/garmentshell.cpp`
  (`buildGarmentSurf`). Kalıpla AYNI kabuktan besleniyor.
- **HAT-2 ÇİZİM KALEMİ**: `engine/tools/render-garment-flat.mjs` (üretim
  kalemi) + `engine/flat-engine/_engine-full.mjs` (referans kalem, SALT-OKUNUR)
  + `engine/flat-engine/styles.json` (31 stil). Kanunu
  `contract/flat-convention-v1.json`, kapısı `engine/tests/flat_convention_check.mjs`.

## ÖLÇÜLECEKLER — her hat için, AYNI tabloya
Her satırda: sayı + onu basan KOMUT + çıktı dosyası yolu.

1. **Kapsam**: hat kaç stil basabiliyor? (HAT-2 için stil matrisi;
   HAT-1 için: kaç ayrı giysi/stil parametresi kabul ediyor — argümanlarını
   oku, uydurma.)
2. **Beş konvansiyon maddesi, hat hat ÖLÇÜM** (geçti/kaldı DEĞİL, SAYI):
   a. TEK CROQUIS: iki farklı stilin flat'inde omuz genişliği · göğüs hattı
      yüksekliği · bel hattı yüksekliği farkı kaç mm? (tolerans ±2mm)
      HAT-1'de iki farklı stil ÜRETİLEMİYORSA bunu ölç ve "ÜRETİLEMEZ" yaz.
   b. ÖLÇEK BEYANI: kökte `data-scale` var mı, değeri ne, GERÇEK ölçüyle
      tutarlı mı (göğüs yarı-genişliği × unitMM == bustCM*10/4)? Sayı bas.
   c. ÇİZGİ HİYERARŞİSİ: SVG'de kaç ayrı (stroke-width, dash) çifti var,
      kaçı beyanlı bir sınıfa eşit? HAT-1'de bugün kaç tane? (ölç, tahmin etme)
   d. SIFIR GÖLGE/GRADYAN + ÖN & ARKA + DETAY CALLOUT: gradient/filter/opacity
      sayısı · `data-view="front"`/`"back"` var mı · callout elemanı var mı.
      ★ HAT-1 için ayrıca ÖLÇ: ön panel ile arka panel path'i AYNI mı
      (bugünkü çıktıda ikisi ayna gibi duruyor) — geometrik olarak karşılaştır
      ve mm cinsinden farkı bas. Ön=arka ise "arkada olay yok" demektir.
   e. ARTEFAKT: her iki hattın konturunda `engine/tests/flat_artifact_census.mjs`
      ölçüsünü koştur (HAT-2'ye uygulanabiliyorsa uygula; uygulanamıyorsa
      SEBEBİNİ yaz). Sınıf sayıları + en kötü teğet kırığı derecesi.
3. **Teknik çizim öğeleri sicili** — her hat için VAR/YOK, isim isim:
   omuz dikişi · kol oyuğu · yaka · kol · pens · iç dikiş çizgileri ·
   topstitch · fermuar/kapama · etek ucu. HAT-1'de kaçı var, HAT-2'de kaçı.
4. **KÖK BAĞ**: HAT-2'nin çizdiği kontur `buildGarmentSurf`'ten besleniyor mu,
   yoksa elle yazılmış katsayılardan mı? KAYNAĞI OKUYARAK cevapla, iddia
   ederek değil — dosya:satır ver. Elle yazılmış katsayı sayısını SAY.
5. **`_LEGACY` durumu**: HAT-2 bugün `_LEGACY` bayrağı arkasında mı, canlı mı?
   `grep -rn "_LEGACY" engine/ web/ contract/` ile ÖLÇ ve tüketicilerini
   (kim import ediyor) listele.

## HÜKÜM (kartın asıl ürünü)
Yukarıdaki sayılara dayanarak TEK cümlelik bir hüküm öner:
**V4 konvansiyon kapısı HANGİ hattı yargılar** ve öbür hat ne olur
(dursun / `_LEGACY` / kapıya rapor-satırı olarak girsin). Hükmün yanında:
- her seçeneğin ölçülmüş bedeli (kaç madde ÜRETİLEMEZ kalır),
- "iki hattı birden yargılamak" seçeneğinin neden süs olduğu — SAYIYLA.
Hüküm bir ÖNERİDİR; kararı şef ve hakem verir.

## ÇIKTI
- `GECE/V4-K.md` — yukarıdaki tablolar + hüküm önerisi
- ölçüm ham çıktıları `GECE/log/V4-K.*.txt`
- varsa prob dosyaları `GECE/probe/` altına (başka yere YAZMA)

## YASAKLAR
- `engine/src/`, `engine/tools/`, `engine/tests/`, `contract/` altında
  HİÇBİR dosyayı DEĞİŞTİRME. Bu kart salt ölçümdür.
- "baktım / doğru görünüyor" yasak (RULES 3): render varsa PNG yolu,
  ölçüm varsa komut çıktısı.
- `patterns_real/` altındaki satın alınmış PDF'lere dokunma (§7.2).
- Buğra'ya benzerlikle hüküm kurma (§7.3) — Buğra ölçüsü yalnız bilgi.
- Eşik uydurma; eşik gerekirse `GECE/V4-R.md` bekler, sen ÖLÇÜMÜ basarsın.
