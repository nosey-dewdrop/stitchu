# KART V7-D — KAPI: KOL OYUĞU YAYI ↔ KAPAK YAYI, BEYANLI YEDİRME ORANIYLA

ETİKET: SIRALI (V7-C'nin çıktısına bağlı, V7-C BİTTİ)
SÜRE TAVANI: 60 dk — tavana gelirsen O ANA KADARKİNİ COMMIT ET, kalanı raporla.

## ÖLÇÜLMÜŞ ZEMİN (bu koşuda ölçüldü — tekrar ölçme, üstüne inşa et)
- **V7-C (`cb6f078`) kenar kimliğini KURDU.** `engine/src/geometry.hpp:40-71`
  `struct EdgeRole` (`role` + `firstCommand..lastCommand` + `start`/`end`
  çapası; **uzunluk alanı bilerek YOK**). `geometry.cpp:182-231`
  `edgePathOf()`/`edgeLengthOf()`; aralık taşarsa ya da çapa tutmazsa **BOŞ
  döner**. Adlar `bodice.cpp:518-525,:709-715,:743-748` ve
  `sleeve.cpp:186-208,:126-133`'te ÇİZEN kodun yanında veriliyor.
  wasm'a `engine/wasm/bindings.cpp:283-301` ile çıkıyor (`"edgeRoles":[...]`).
- Adlandırılmış kenar: ÖNCE **0**, SONRA **5** (kollu üst, 4 rol adı):
  `armhole_front 211.3405` · `armhole_back 192.9188` · `sleeve_cap 420.3840` ·
  `sleeve_underarm 421.1106` (×2).
  **İlk kez kenar↔kenar cap ease ölçüldü: +3.989%** (oyuk 404.2594mm vs
  kapak 420.3840mm).
- ★ **KIRILACAK TAUTOLOJİ:** `engine/src/validator.cpp:282-300` hâlâ ÜÇ
  TAHMİNLE çalışıyor — parça adı alt-dizgisi `"Sleeve"` (`:282`), sabit komut
  indeksi `commands[0..2]` (`:289-295`), ve çizilen kenar yerine SKALER
  `bodice.armholeLength` (`:300`, yazan `bodice.cpp:509`). Bugünkü "0.00mm
  uyum" = **aynı sayının kendisiyle uyumu**. V7-C tüketiciyi TAŞIMADI.
- **YEDİRME BANDI (V7-R, `GECE/V7-R.md`, yayınlanmış):**
  · tavan **≤ 1½ in = 38.1 mm** — Linda Lee, *Setting in a Sleeve*, slayt 6.
  · azami tek düzeltme ½ in = 12.7 mm (a.g.e. slayt 7).
  · **İŞARET POZİTİF** şart (kapak ≥ oyuk).
  · Bizim 8/8 bedende kesim çizgisi ölçümümüz **+6.61…+18.30 mm** — bandın
    içinde ama yayınlanmış 20–50mm aralığının ALTINDA. **Bu bir hüküm değil,
    kayıt.** Motor ölçüyü basar, yargılamaz.
  · ★ **PUF/BALON KAPISI AÇMA** — V7-R "puf" ve "balon"un NİCEL tanımı için
    yayınlanmış eşik BULAMADI; kaynaksız eşik kapıya giremez (§5.1/§7.6).

## NE — iki iş, bu sırayla

**1. TÜKETİCİYİ TAŞI.** `validator.cpp:282-300`'ün oyuk↔kapak yargısı artık
`edgeRoles`'tan okusun: oyuk = `armhole_front + armhole_back` yay uzunlukları,
kapak = `sleeve_cap` yay uzunluğu — **ikisi de ÇİZİLEN kenardan**, skaler
`bodice.armholeLength` kopyasından DEĞİL. Rol bulunamazsa/BOŞ dönerse
**Result::Err ya da açık ihlal** (RULES invariant 1 — sessizce düşürme YOK).

**2. KAPIYI KUR:** `sleeve_cap_ease_check`. Ölçtüğü:
 (a) kol içeren her spec'te dört rolün de ÇÖZÜLDÜĞÜ (boş yay = FAIL) —
     V7-C'nin açık bıraktığı "bayat rol sessizce boşalır" deliği budur;
 (b) `ease = capLen − (armholeFront + armholeBack)`, **işaret pozitif**;
 (c) `|ease| ≤ 38.1 mm` (kaynak: Linda Lee slayt 6, dosya başlığına YAZ);
 (d) beyan edilen oran ile ölçülen oran arasındaki fark (motor bir yedirme
     oranı beyan ediyorsa onu, etmiyorsa "beyan YOK" diye AÇIKÇA bas).
Bandın ALT ucu için yayın YOK → alt uç **REPORTED** (bilgi), FAIL değil.
Kapıyı `engine/CMakeLists.txt`/ctest'e KAYDET.

## ŞARTLAR (pazarlıksız)
1. **§4.2 BOŞ TEST, BİRİNCİL USUL:** kapı faz-ÖNCESİ motorda KIRMIZI düşmeli.
   Usul: faz-öncesi commit **`e4249b7`**'nin ürettiği ÇIKTI ARTEFAKTINI
   (JSON döküm) yeni ölçüm aletine ver — o artefaktta `edgeRoles` YOK, kapı
   kırmızı düşmeli. **Derleme hatası "kırmızı düştü" SAYILMAZ.**
   Logu `GECE/log/V7-D.bostest.txt`'ye yaz.
2. **§4.5 MUTASYON:** kapak yayına kasıtlı **+5mm** (ya da bandı aşan bir
   bozma) uygula → kapı KIRMALI; geri al → YEŞİLE dönmeli. İKİ logu da
   `GECE/log/V7-D.mutasyon.txt`'ye yaz. Kırılamayan kapı süstür.
3. **RULES 9:** kırmızı AD kümesi BÜYÜMEYECEK. Açılış kırmızıları (MİRAS):
   `style_check · sizechart_source_check · contract_check · figure_check ·
   flat_pattern_agree_check · flat_artifact_census`
   (`GECE/log/V7.ctest.opening.txt`, 113 test / 6 kırmızı).
   ⚠ `vocab_reference_check` bu gece 7. kırmızı olarak düştü — **ŞEF ONU AYRI
   ELE ALIYOR, SENİN İŞİN DEĞİL**; sen onu ne düzelt ne kötüleştir.
4. **RULES 4:** golden BAYT-AYNI kalacak
   (`./engine/build/golden_dump > /tmp/x.csv && cmp /tmp/x.csv engine/golden-reference.csv`).
5. **WASM PARİTESİ (§4.1):** kapının dokunduğu üretim yolu node üzerinden
   wasm modülüyle de koşulacak; native yeşil + wasm patlak = faz KIRMIZI.
6. **§7.5:** en fazla **1 yeni kaynak dosya** (kapının kendisi).
   `engine/tools/` altında yüzü aşkın alet var: ÖNCE GREP.
7. **§7.6:** kaynaksız eşik YASAK. Kullandığın her sayının kaynağı dosya
   başlığında yazılı olacak.
8. **§4.6:** hiçbir mevcut toleransı oynatma, hiçbir mevcut testi gevşetme.

## ÇIKTI
- `engine/tests/sleeve_cap_ease_check.*` (+ CMakeLists kaydı)
- `engine/src/validator.cpp` (tüketici taşındı)
- `GECE/V7-D.md`: ölçülen ease sayıları (spec spec, beden EU38 + varsa grade) ·
  boş test kanıtı · mutasyon kanıtı · golden kanıtı · wasm parite kanıtı ·
  ctest sonucu
- Loglar: `GECE/log/V7-D.bostest.txt` · `GECE/log/V7-D.mutasyon.txt` ·
  `GECE/log/V7-D.ctest.txt`

Rebuild gerekirse `-DCMAKE_BUILD_TYPE=Release` ZORUNLU (boş bırakırsan süit
19s→2684s olur ve kapı geçmez).

Bittiğinde KENDİN commit et (push etme). `git add -A` KULLANMA — açık yol
listesiyle commit et (paralel işçilerin dosyaları ağaçta olabilir):
`git commit -m "v7-d: gate the armhole-to-cap ease on named edges, not on a scalar copy"`

## YASAKLAR
- `engine/src/surfacepattern.cpp` (sevk edilmiyor) · `contract/` · `GECE/KOSU.md`
  · `GECE-KOSUSU-v6.md` · başka kartlar: DOKUNMA.
- Mevcut testleri değiştirme/gevşetme, baseline kesme.
- Puf/balon için nicel kapı kurma (kaynak YOK).
- "çalışıyor / doğru görünüyor" YASAK — komut çıktısı koy (RULES 3).

## RAPOR FORMATI
yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu basan komut) ·
yapılamayan (sebep) · kart dışı fark edilen (dokunma, yaz).
