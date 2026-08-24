# V4-A — KROKİ ÇIKARIMININ KÖKÜ DÜZELTİLDİ, ÖLÇÜLMÜŞ OMUZ UYGULANDI

KART: `GECE/KART/V4-A.md` · tur 2, SIRALI
YAZILAN: `engine/tests/flat_convention_check.mjs` · `contract/flat-convention-v1.json`
`engine/tools/render-garment-flat.mjs` ELLENMEDİ — kanunu okuduğu için değer kendiliğinden taşındı (aşağıda ölçüldü).

---

## 1. ÇIKARIM KÖKTEN DEĞİŞTİ (kapı artık kendi kusurunu varsaymıyor)

**Eskisi:** omuz ucu = "CF yakadan aşağı yürürken x'in İLK KESİN YEREL MAKSİMUMU".
Bu sezgi yalnızca omuz göğüsten GENİŞSE doğrudur — yani kapı, düzeltmeye çalıştığı
kusurun ta kendisini varsayıyordu.

**Yenisi (`measureCroquis`, oran-bağımsız, tamamen geometrik):**
omuz ucu = **omuz çizgisi kirişi ile kol oyuğu kirişinin buluştuğu köşe**.
İki komşu kirişin karakteriyle bulunur:
- omuz çizgisi SIĞ ve DIŞA gider → `dx > 0 && |dx| >= |dy|`
- kol oyuğu DİK İNER → `dy > 0 && |dy| > |dx|`

Gerekçe kanunun kendi geometrisi: set-in kol oyuğu omuz ucu ile koltukaltını
PAYLAŞIR (`sleeveLaw.sleeveSharesArmholeEndpoints`) ve omuzdan aşağı iner. Kriter
omuzun göğüsten geniş mi dar mı olduğunu HİÇ SORMAZ. `dy > 0` şartı kare/sweetheart
yakanın dikey (yukarı giden) kenarını eler. **Hiçbir `data-*` beyanı, hiçbir kanun
sayısı okunmaz** — sadece çizilen poligonun kirişleri (ANTİ-HACK korundu).

### KANIT — aynı çıkarım, iki croquis (`GECE/log/V4-A.inference.txt`)

komut: `node engine/tests/flat_convention_check.mjs` (her iki kanun değerinde)

| croquis | omuz/göğüs oranı | çıkarımın bulduğu omuz ucu x | stiller arası sapma |
|---|---|---|---|
| KOŞU A `shoulderTipX=78.0u` (omuz DIŞARIDA) | 1.0636 | **78.000u** ✓ | 0.00 mm |
| KOŞU B `shoulderTipX=70.1799u` (omuz İÇERİDE) | 0.9570 | **70.200u** ✓ (kalem 0.1u'ya yuvarlar) | 0.00 mm |

Aynı log'daki KONTROL koşusu, KOŞU B silüetinde iki çıkarımı yan yana koyuyor.
Sağ yarının köşe dizisi:
`[[0,40],[40,4],[70.2,16.9],[73.3,92],[58.3,150],[92.2,400],[0,410]]`
- ESKİ çıkarım → index **3**, nokta **[73.3, 92]** = KOLTUKALTI (omuz sanıyor)
- YENİ çıkarım → index **2**, nokta **[70.2, 16.9]** = OMUZ UCU ✓

Kök düzeltme şarttı; yama değildi.

---

## 2. ÖLÇÜLMÜŞ DÜZELTME UYGULANDI (§4.6)

`contract/flat-convention-v1.json → croquis.landmarks`:

| alan | eski | yeni | türetme |
|---|---|---|---|
| `shoulderTipX` | 78.0u / 234.0 mm | **70.1799u / 210.54 mm** | chestX 73.3333u × 0.9570 |
| `shoulderTipY` | 19.36u / 58.08 mm | **16.8576u / 50.57 mm** | 4.0 + (70.1799−30.0)×0.32 |

- Eski değerler **silinmedi**: her ikisinde `_previous` alanı açıldı; F-E'nin
  `_F_E_OLCULDU_AMA_DEGISTIRILMEDI` ve `_NEDEN_DEGISTIRILMEDI` metinleri de yerinde
  duruyor. Yeni `_V4_A_NEDEN_DEGISTI` / `_V4_A_ENGEL_NASIL_KALKTI` alanları engelin
  nasıl kalktığını yazıyor.
- **KAYNAK:** 0.9570 = satın alınmış Buğra Locket EU38 `Back Body` parçasında
  ölçülen omuz/göğüs yarı-genişlik oranı 196.13/204.94 mm
  (ölçüm `GECE/log/F-E.bugra-olcum.txt`). Buğra sayısı yalnız BÜYÜKLÜĞÜ besler.
- `patterns_real/` altındaki PDF'lere DOKUNULMADI (§7.2).

**Kalem kendiliğinden taşındı, doğrulandı:** `render-garment-flat.mjs` kanunu
`LAW.croquis.landmarks`'tan okuyor; elle yazılmış kopya arandı ve BULUNAMADI
(`grep -rn "78\.0\b|shoulderW *=|19\.36" render-garment-flat.mjs
flat_geometry_sellable_check.mjs contract/*.json` → `_previous`/gerekçe metinleri
dışında 0 satır). Çizilen omuz ucu 78.0 → 70.2u'ya kendiliğinden düştü.

---

## 3. YENİ KAPI SATIRI — 1c OMUZ UCU GÖĞÜSÜN İÇİNDE

`engine/tests/flat_convention_check.mjs`, madde 1'in altına: her stil/görünüm için
**ölçülen** `shoulderTipX <= chestX`.

Başlıkta yazılı gerekçe **§7.3 sınırında**: şart bir GEOMETRİK YASA
(set-in kollu giyside kol oyuğu omuz ucu ile koltukaltını paylaşır, dışarı şişemez),
"Buğra'ya benziyor mu" DEĞİL. 0.9570 kaynağıyla birlikte beyan edildi ve bir EŞİK
olarak kullanılmadı — kapının şartında sayı yok, sadece eşitsizlik var.

Bugünkü ölçüm: 16 panelin 16'sında omuz ucu **210.60 mm**, göğüs **219.90 mm**,
oran **0.9577**. `PASS flat_convention_check — 0 ihlal`.

### MUTASYON KANITI (§4.5) — `GECE/log/V4-A.mutasyon.txt`

| adım | `shoulderTipX` | sonuç | exit |
|---|---|---|---|
| mutasyon | kasten **78.0u** | `FAIL flat_convention_check — 16 ihlal` (16 panelin hepsi `[1c omuz>gogus]`, omuz göğüsten **14.10 mm** dışarıda, oran 1.0641) | **1** |
| geri alındı | **70.1799u** | `PASS flat_convention_check — 0 ihlal` | **0** |

Mutasyon aynı zamanda şunu da gösteriyor: 78.0u'da yeni çıkarım omuz ucunu yine
DOĞRU buluyor (`omuz ucu x min 78.000u max 78.000u`), yani kapı çıkarım hatasından
değil GERÇEK KUSURDAN kırmızı düşüyor.

---

## 4. YAN ETKİ ÖLÇÜLDÜ — `GECE/log/V4-A.ctest.after.txt`

komut: `cd engine/build && ctest --output-on-failure`
`94% tests passed, 7 tests failed out of 110` · `Total Test time (real) = 406.46 sec`

**KAPANAN KIRMIZI:** yok (V4-A kırmızı kapatma kartı değil).
**AÇILAN KIRMIZI:** V4-A'dan **yok**. Ama koşuda 7. bir kırmızı AD var:
`vocab_reference_check`. Üç ayrı ölçümle V4-A'nın olmadığı gösterildi:

1. **Kapı çalışma ağacını değil HEAD COMMIT'ini sayıyor** (`count_commit HEAD`,
   ayrı detached worktree). V4-A'nın değişiklikleri o koşuda commit'siz idi.
2. **Artışın tamamı attribute edildi:** `eksen ADI garment 1186→1190 (+4)`,
   `peplum 335→337 (+2)`. `git diff b99e21d c396fb4 -- <kapsam>` → 6 satırın 6'sı
   `engine/tools/flat-board.mjs`, yani **V4-C'nin commit'i c396fb4**.
   `V4.ctest.before.txt` b99e21d'de alınmıştı; c396fb4 ondan SONRA landi.
3. **V4-A'nın kendi katkısı ölçüldü ve SIFIR:**
   `engine/tests/vocab_reference_check.sh --tree .` (V4-A'nın kirli ağacı) →
   `bugun toplam 10444 (delta +6)`, artan aynı iki ad — HEAD ile **birebir aynı**.

**DEVRALINAN 6 KIRMIZININ İÇERİĞİ DEĞİŞMEDİ:** altı blok da before/after arasında
`diff`lendi; tek fark koşu süresi (ör. contract_check 0.35s→0.21s), hata metinleri
satır satır AYNI. Yani RULES 9 anlamında **kırmızı ad kümesi V4-A tarafından
büyütülmedi**; hiçbir eşik gevşetilmedi, hiçbir kapı susturulmadı, taban yeniden
kesilmedi.

Ayrıca `flat_geometry_sellable_check` ölçüldü:
`PASS — 0 ihlal · tolerans 2 mm`, ve S1 açık kalemi artık **"ihlal yok"**
(F-E'de ihlal listesi doluydu). Parite: omuz bizim **0.9559** vs Buğra **0.9570**,
fark **−0.11 puan**.

**GÖRSEL ÇIKTI (RULES 3):**
- `GECE/log/V4-A.crew_sleeved_top.png` (+ `.svg`)
- `GECE/log/V4-A.princess_scoop_dress.png` (+ `.svg`)

---

## YAPILAMAYAN

- `vocab_reference_check`'in tabanını yeniden kesmek: V4-C'nin kapsam kararı, V4-A'nın
  değil. Elle yeniden kesmek onun bulgusunu SİLERDİ; dokunulmadı, DAMLA-KUYRUK kalemi.
- Diğer 6 devralınmış kırmızıya dokunulmadı (kart kapsamı dışı).

---

## KART DIŞI FARK EDİLEN (dokunulmadı)

1. **`flat_convention_check`'in PARİTE RAPORU'ndaki referans-kalem croquis sapması
   artık başka bir sayı basıyor** (yeni çıkarım oraya da uygulanıyor). Rapor zaten
   "GÖSTERGE, DOĞRULANMADI" etiketli ve kırmızı düşürmüyor; ama referans kalem
   (`engine/flat-engine/_engine-full.mjs`, SALT-OKUNUR) hâlâ ayrı mürekkep (#111 vs
   #1f3a5f), ayrı ağırlık tablosu ve **0/31 ölçek beyanı** ile duruyor.
2. **`chestX`'in çizilen değeri 219.90 mm, kaynaklı çıpa 220.00 mm** — 0.10 mm fark
   kalemin 0.1u yazı adımından. Tolerans 2 mm olduğu için görünmüyor, ama kapının
   ölçtüğü her croquis sayısı bu adıma yuvarlı (omuz 70.1799 → 70.2 yazılıyor).
   Bir gün tolerans 0.2 mm'ye inerse ilk kırılacak yer burası.
3. **`waistY` ve `chestY` hâlâ KAYNAKSIZ** (`source: ACIK`). Omuz ucu artık ölçülü,
   göğüs/bel yükseklikleri değil — croquis'in yarısı kaynaklı, yarısı devralınmış.
4. **`shoulderSlope 0.32` kaynaksız** ve `shoulderTipY` tamamen ondan türüyor. Omuz
   ucu x düzeldiği için y de düştü (58.08→50.57 mm), ama düşüşün büyüklüğü hâlâ
   kaynaksız bir eğime bağlı.
5. V4-K'nın KART DIŞI md.2'si ayakta: **`sleeveStyle` set/raglan/puff bayt bayt aynı
   çizimi üretiyor** — RULES invariant 1 ile çelişiyor, bugün hiçbir kapı yakalamıyor.
