# F-L — RATCHET ONARIMI: kırmızı küme büyüdü, §0.6 ihlali
`GECE/KART/ORTAK.md` oku. Sonra bu kart.

## ÖLÇÜM (sakin ağaçta, tek başına tam ctest, 589s)
102 test · **11 kırmızı** · `h10_gate_check` DISABLED.
Gece başındaki küme **6**'ydı. §0.6: *"Kırmızı test KÜMESİ (adlar) büyüyemez."*

**ALTI YENİ AD:**
`engine_check` · `golden_check` · `bundle_fresh_check` · `sewable_census` ·
`recipe_dress_check` · `garment_armhole_check`

Devralınan üç kasıtlı (DOKUNMA): `style_check` `sizechart_source_check` `contract_check`
Devralınan iki mühendislik: `preview_truth_check` `figure_check`
(teşhisleri hazır: `GECE/IKI-KIRMIZI-TESHIS.md` — ikisi de pin sorunu DEĞİL)

## ALTISININ SINIFI — ölçüldü, karıştırma

**A) PIN BAYAT — geometri KASTEN değişti (3 test)**
- `golden_check`: "engine output differs from the REPO PIN (`engine/golden-reference.csv`)"
- `recipe_dress_check`: "grainline DIFFERS, geometry DIFFERS" — F-G çentik+katlama işi
- `engine_check`: aynı aile (doğrula)
Sebep meşru: F-G Locket'e **6 çentik** kazandırdı (önce 0'dı), `foldLine` geometriye
girdi. Yani çıktı gerçekten değişti ve DAHA DOĞRU.
→ **5 Ağu emsali uygulanır:** pin ÖLÇÜLEN yeni değere taşınır, tolerans
GENİŞLETİLMEZ, gerekçe pin dosyasının İÇİNE yazılır (hangi commit, hangi ölçüm).
Taşımadan önce farkın **tamamının** açıklanabilir olduğunu göster: kaç satır değişti,
her biri hangi işten. Açıklanamayan tek satır varsa taşıma DURUR.

**B) GERÇEK GERİLEME — bu düzeltilir, pin taşınmaz (1 test)**
- `sewable_census`: `[sideseam] Bodice: front side seam 348.9 vs back 351.9
  differ by 3.0 mm (max 3.0)` — tam sınırda, `pear/knit/princess/crew/hip` hücresi.
  Yan dikiş çifti eşit olmalı. Bu bir dikilebilirlik kusuru.
  → Kök sebebi bul (`git log -S` ile bu geceki hangi commit), **düzelt**.
  Eşiği 3.0'dan büyütmek YASAK.

**C) AÇIKLANABİLİR (2 test)**
- `bundle_fresh_check`: WASM ikilisi bu gecenin C++ değişikliklerinden geride.
  → Yeniden derle + commitle. (Kapının kendisi doğru çalışıyor, onu susturma.)
- `garment_armhole_check`: F-F'in YENİ kapısı. Kol oyuğu hâlâ yayın bandının altında
  olduğu için kırmızı — bu **dürüst bir yeni kapı**, gerileme değil.
  → Kırmızı kalabilir AMA §0.4 gereği yanında kök sebep + ölçülmüş çözüm adayı
  duracak. Kapıyı gevşetme, testi silme, DISABLED yapma.

## KAPI
Tam ctest, sakin ağaçta, tek koşu:
- A grubu 3 test YEŞİL (pin taşındı, gerekçeli)
- B grubu `sewable_census` YEŞİL (kök sebep kapandı)
- `bundle_fresh_check` YEŞİL
- `garment_armhole_check` kırmızı kalabilir, gerekçesi yazılı
- BAŞKA yeni kırmızı ad SIFIR
- Önce/sonra ctest logu commit'e girer (`GECE/log/F-L.ctest.{before,after}.txt`)

## YASAK
Pin taşımayı "yaklaşsın diye" tek tek yapmak · toleransı büyütmek · testi
DISABLED yapmak · assert çıkarmak · `git checkout --` ile temizlemek.

---
## EK — F-F ajanı kök sebebi ZATEN buldu, tekrar arama
`sewable_census` + `engine_check`: 82980 draftın **30'unda** `[sideseam] 3.0mm`
(tavan 3.0), hepsi `pear` gövde, hepsi tam sınırda.
**KÖK:** yan dikiş eşitlemesi, oyuk seviyesi değişince yeniden koşmuyor.
**ADAY:** eşitlemeyi `armholeY` çözüldükten SONRA çağır.
Bunu uygula, eşiği büyütme.

`golden_check` / `recipe_dress_check`: çizim değişti → pin ve reçete-DSL aynası bayat.
⚠ Reçete DSL'i `hollow = share * dx` KAPALI FORM istiyor, F-F'in bisection'ını ifade
edemiyor. İki aday: (1) oymayı kirişin kapalı-form kesrine indir, (2) DSL'e `solve`
primitifi ekle. Hangisini seçtiğini gerekçesiyle yaz.
⚠ `golden_check` repin **Damla kararı** (`GOLDEN-PIN.md` etiket istiyor) — pin'i
taşıma, farkı ÖLÇ ve `DAMLA-KUYRUK.md`'ye satır düş.
