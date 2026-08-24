# KART V3-K — KEŞİF (ölçüm, onarım YOK)

ETİKET: PARALEL (V3-R ile birlikte koşar; dosya kesişimi yok)
SÜRE TAVANI: 45 dk

## NE
Repoda flat çizimi ve kalıp üretimi hangi kodlardan çıkıyor — iki hattın
BUGÜNKÜ kaynağını isim isim, satır satır ölç. Hiçbir şey yazma, hiçbir şey
düzeltme.

## GİRDİ (bunlara bak; yoksa "DİSKTE YOK" yaz)
- `flatten-research/` · `curve-research/` · `engine/flat-engine/`
- `fashion-flat-models/` · `new_flats/`
- `engine/src/` (özellikle flatten.cpp, surfacepattern.cpp, curvefit.*,
  geometry.hpp, bodice.cpp, drape.cpp)
- `engine/tools/` (grep: flat, render-flat, render-garment-flat, project,
  ortho, silhouette, croquis)
- `web/js/` (grep: flat, render)
- `contract/` (spec şeması: flat ile kalıp aynı spec'ten mi besleniyor)
- `engine/CMakeLists.txt`, `engine/tests/`

## ÇIKTI → `GECE/V3-K.md` (tek dosya, tablo ağırlıklı)
Kanıt: kart kesimi + §6/V3 kanat (b) artefakt sayımının kaynak-satırı şartı.
1. **FLAT HATTI**: flat siluetini bugün hangi dosya/fonksiyon üretiyor?
   Dosya:satır. Girdisi ne (spec mi, elle yazılmış path mi, SVG şablon mu)?
   Sabit/hard-coded katsayı var mı — VARSA HEPSİNİ dosya:satır ile listele.
2. **KALIP HATTI**: panel üretimi hangi dosya/fonksiyon? Dosya:satır. Girdisi?
3. **ORTAK KAYNAK VAR MI?** İki hat aynı gövde/kabuk verisini mi okuyor,
   yoksa ayrı ayrı mı? Tek cümle + dosya:satır kanıtı.
4. **AÇILIM/FLATTEN NE VAR**: mevcut açılım/parametrizasyon kodu (ARAP, LSCM,
   konik açılım, Verlet) — dosya, fonksiyon adı, algoritmanın YAYINLANMIŞ adı
   (dosya başlığında yazıyorsa aynen aktar), test bağı var mı.
5. **PROJEKSİYON NE VAR**: ortografik projeksiyon / siluet çıkarımı yapan
   herhangi bir kod var mı? Yoksa "YOK" yaz.
6. **6 ÖLÇÜ**: etek ucu çevresi · göğüs çevresi · bel çevresi · gövde boyu ·
   yaka açıklığı genişliği · omuz genişliği — bu altısını BUGÜN ölçebilen
   bir alet var mı? Alet adı + komut + örnek çıktı. Yoksa "YOK".
7. **Eigen / libigl** repoda var mı, CMake'e bağlı mı? Dosya:satır.
8. **ÇALIŞTIR**: `cmake --build engine/build -j8 --config Release` ve
   `ctest --test-dir engine/build -N` (sadece liste). Test sayısını ve
   build'in çalışıp çalışmadığını RAPORLA (tam ctest koşma, uzun sürer).

## YASAKLAR
- Kod yazma, dosya düzenleme, commit atma. Sadece oku + ölç + `GECE/V3-K.md` yaz.
- `patterns_real/` altındaki PDF'lere DOKUNMA.
- "görünüyor / muhtemelen" yasak; her satırda dosya:satır ya da komut çıktısı.
- Bulamadığına "YOK" yaz, tahmin etme.
