# KART V3-A — ÇEKİRDEK: kabuk → ortografik projeksiyon (flat, HESAPLANIR)

ETİKET: SIRALI (tek işçi; B ve C bu bitmeden başlamaz)
SÜRE TAVANI: 90 dk (orakçı 90. dakikada keser; o ana kadarki iş commit'lenir)

## NE
Kalıbın beslendiği AYNI 3B kabuktan (`GarmentSurf`) ön ve arka ortografik
projeksiyonu HESAPLA ve flat dış konturunu bu projeksiyondan üret. Flat'in dış
konturu artık çizilmez, hesaplanır.

## ZEMİN (ölçülmüş, tartışma değil)
- Kalıp hattı: `buildSheathPattern` — `engine/src/surfacepattern.cpp:1280`.
  Kabuk: `GarmentSurf::fromBody` — `surfacepattern.cpp:64`, 5 halka
  (neck/shoulder/bust/waist/hip), elips kesit, bolluk `Ring.d = ease/(2π)`
  (Steiner-tam, `surfacepattern.cpp:44-47`).
- Flat hattı bugün bu kabuğu HİÇ görmüyor: `engine/tools/render-garment-flat.mjs`
  2B croquis'ten çiziyor (`contract/flat-convention-v1.json`), bolluk sıfır.
  Aynı EU38 belde flat 700.0mm, kalıp 724.89mm.
- 3B→2B projeksiyon kodu repoda YOK (`drape.cpp:346` sadece drape önizlemesi,
  `drape.hpp:54` "Never affects the simulation").

## GİRDİ DOSYALARI (isim isim)
- `engine/src/surfacepattern.cpp` · `engine/src/surfacepattern.hpp`
- `engine/src/bodysurface.hpp` · `engine/src/bodysurface.cpp`
- `engine/src/sizechart.hpp` · `engine/src/contract.gen.hpp`
- `engine/src/geometry.hpp` · `engine/src/curvefit.hpp`
- `engine/tools/surface-pattern.cpp` (emsal: tool nasıl yazılıyor)
- `engine/CMakeLists.txt`

## YAPILACAK
1. **KABUĞU PAYLAŞ, KOPYALAMA.** `GarmentSurf` bugün `surfacepattern.cpp`
   içinde gizliyse bildirimini `surfacepattern.hpp`'ye TAŞI (tanım aynı yerde
   kalır). **İkinci bir kabuk sınıfı yazmak bu kartın tek kırmızı çizgisidir** —
   iki hattın aynı kaynaktan beslendiğini kanıtlayamayan çözüm reddedilir.
2. **`engine/src/shellprojection.hpp` + `.cpp`** (2 yeni kaynak dosya):
   - `projectFront(const GarmentSurf&)` ve `projectBack(const GarmentSurf&)`:
     her halkanın elips kesitini XZ düzlemine ortografik izdüşür. Elipsin
     yarı-ekseni `a` doğrudan siluet yarı-genişliğidir (ortografik izdüşümün
     tanımı; UYDURULAN ALGORİTMA DEĞİL, dosya başlığında tek cümleyle beyan et).
     Halkalar arası dış kontur `curvefit.hpp`'nin mevcut kübik fitiyle
     bağlanır — YENİ eğri yumuşatma algoritması YAZMA (§5.5).
   - Aynı kabuktan ALTI ÖLÇÜYÜ döndür (mm): etek ucu çevresi · göğüs çevresi ·
     bel çevresi · gövde boyu · yaka açıklığı genişliği · omuz genişliği.
     Çevreler halkanın elips ÇEVRESİDİR (siluet genişliği × 2 DEĞİL — o bir
     yaklaşımdır ve düzeltme katsayısına kapı açar). Genişlikler siluetten.
   - Her ölçünün yanında hangi halkadan geldiği (ad) da dönsün.
3. **`engine/tools/shell-flat.cpp`** (3. yeni kaynak dosya): `shell-flat EU38`
   → stdout'a JSON: 6 ölçü + ön/arka dış kontur nokta dizisi + her noktanın
   hangi halka aralığından geldiği. Ayrıca `--svg` ile SVG bas; SVG kökünde
   `data-scale`, `data-source="GarmentSurf"`, `data-size` nitelikleri olsun.
   Emsal: `engine/tools/surface-pattern.cpp`.
4. CMake'e bağla (kütüphaneye `shellprojection.cpp`, yeni tool hedefi).
   `-DCMAKE_BUILD_TYPE=Release` ile derle.
5. **ESKİ HAT SİLİNMEZ.** `render-garment-flat.mjs`'e DOKUNMA. Onu _LEGACY
   bayrağına almak bu kartın işi değil; sadece yeni hattı kur.

## ÇIKTI
- `engine/src/shellprojection.hpp` · `engine/src/shellprojection.cpp`
- `engine/tools/shell-flat.cpp` · `engine/CMakeLists.txt` (bağlama satırları)
- `GECE/V3-A.md` — ölçülen 6 sayı (mm) + onu basan komut + commit hash +
  `./engine/build/shell-flat EU38 --svg > /tmp/v3a-eu38.svg` çıktısının
  PNG'ye çevrilmiş yolu (RULES 3: dosya yolu yoksa adım YAPILMAMIŞTIR).
- Commit at (lowercase ingilizce mesaj, co-author YOK). Push ETME, şef edecek.

## YASAKLAR
- **Flat'e sabit çarpan / düzeltme katsayısı eklemek YASAK.** Sayıları
  eşitlemek için eklenen her katsayı fazı düşürür. İki hat aynı kaynaktan
  beslenecek; sayılar ne çıkarsa çıksın RAPORLA.
- İkinci bir kabuk/gövde modeli yazmak yasak (madde 1).
- Yeni açılım/parametrizasyon/eğri yumuşatma algoritması SIFIRDAN uydurmak
  yasak (§5.5): önce `engine/src` + `engine/tools` grep, sonra yayınlanmış
  ad, sonra serbest lisanslı port. Eigen/libigl bu kartta GEREKMİYOR — ekleme.
- Mevcut testleri değiştirmek yasak. Yeni kırmızı ad doğurmak yasak.
- `render-garment-flat.mjs`, `engine/flat-engine/`, `web/` — DOKUNMA.
- "Baktım / çalışıyor / doğru görünüyor" raporda yasak.
