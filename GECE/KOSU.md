# KOŞU — 2026-08-21

## ŞU AN
faz: **F0 kapandı · hiçbir faz açılmadı** · durum: harness kuruldu ve mühürlendi, koşu Damla'nın komutunu bekliyor · son yeşil commit: **YOK**
(devralınan taban kırmızı: ctest 89/95. §0.6 gereği ölçü "kırmızı sayısı" değil, **kırmızı isim kümesi**.)

## HAT VARSAYIMI
ürün hattı = `garment` · yüzey (`surfacepattern`) = henüz sevk edilmiyor   [Damla varsayılanı, geri alınabilir]
Dayanağı §4.6: `engine/wasm/bindings.cpp` → `garment.hpp`; aynı dosyada "surfacepattern" **0 kez** geçiyor.

## KAPANMIŞ FAZLAR
F0 ✓ Damar %0, flat kalıptan türemiyor ve kontrat bunu zaten beyan etmiş -> `GECE/F0.md` (kapı tutanağı: `GECE/KAPI.md`)

## AÇIK KIRMIZILAR (ne · nerede · ölçülen sayı)
- ctest devralınan kırmızı · `engine/build` · **6/95 FAIL** · isimler: `style_check` `bugra_bridge_check`
  `contract_check` `preview_truth_check` `figure_check` `h10_gate_check`
  (kaynak: `engine/build/Testing/Temporary/LastTestsFailed.log` — kapı da bu dosyadan okuyor)
  - `style_check` · `engine/STYLE-PIN` dosyası yok · pinlenmiş stil **0**
  - `bugra_bridge_check` · `patterns_real/geometry/ring-trace-locket-front-38.json` yok
  - `contract_check` · `patterns_real/` git'te **41 takipli dosya** (Damla'nın kararında, dokunulmaz)
  - `preview_truth_check` · `princess_dress` → `bustHalf`/`neckHalf`/`neckDepth` **ÖLÇÜLMEDİ**
  - `figure_check` · 3+ stil `waist/bust 0.637` tabansız · `figure-bands` `mandal.taban_v3` pin yok
  - `h10_gate_check` · EU34 armhole **312.86 mm** (kapı 384.50–424.50) · shoulder-seam **0 dikiş** (kapı ≥2)
- Sicilde **adı bile olmayan** damar detayları · `contract/garment-spec-v2.json` · 6 primitiften **5'i YOK**
  (fiyonk, mini-düğme, fırfır/peplum, lace-up, dantel) → red cümlesi ismi söyleyemiyor (§0.3 ihlali).
  Gerçek `absent` sayısı **4**: `sleeve` `collarFamily` `gatheredOverlayLayer` `skirtFamily`.
- Flat ↔ kalıp ortak birim yok · `contract/tables.json` → `flat._layer` bunu **beyan ediyor** ("NOT millimetres")
- Flat SVG'de ölçek beyanı yok · `unitDeclared: false`
- İkinci flat kalemi ayakta · `engine/tools/render-garment-flat.mjs` kendi 2 şablonu + `engine/flat-engine/_engine-full.mjs`
- `engine/flat-engine/_engine-full.mjs:256` · **2 stil-pinli sert kodlanmış kaçış** (tek croquis yasasını deliyor)
- `shoulderSeam` **geometriden** kapalı · iç gerinim **%24.07 / %18.14**, kapı **%3.0** (kod var: `engine/src/shoulder.cpp`)
- Sevk edilmeyen kütüphane · `engine/src/` · 14 .cpp derleniyor ama yüzey hattında; WASM garment hattından

## BİR SONRAKİ FAZIN DEVRALDIĞI ÜÇ SAYI
1. **DAMAR = %0** (kalıp yolu %0 · flat yolu 9/31 = %29, ama flat satılabilir nesne değil)
2. **hem/bel oranı: kalıp 1.787 · flat 1.214** — iki hattı karşılaştıran tek birimsiz sayı (≈%47 sapma)
3. **ctest 89/95** — 6 devralınan kırmızı, isimleri yukarıda

## [HAT-VARSAYIM] ETİKETLİ İŞLER
(yok — hiçbir faz açılmadı)

## HARNESS (21 Ağu kuruldu, mühürlü, KOŞTURULARAK doğrulandı)
`GECE/gece.sh` · `GECE/kapi.sh` (K1–K7) · `GECE/mutasyon.sh` · `GECE/mutasyon.tsv` · `GECE/hakem-sorusu.md` · `GECE/kapi.sha`
**Faz ajanına düşen tek ek görev:** kendi kapısını `GECE/mutasyon.tsv`'ye yazmak. Boş satır = o faz kapanamaz (§2.3).

Doğrulama (sözdizimi değil, **koşturuldu**):
- `kapi.sh F0 66e2732` üç kez koştu; yedi alt kapı da ateşledi. Log: `GECE/log/F0.kapi.txt`.
- **K1'in tabanı ilk koşuda YALANDI ve düzeltildi.** Worktree sadece takipli dosyaları alır;
  `engine/dist` · `engine/.venv-dxf` · `engine/pattern-bridge/.venv` · `engine/tools/node_modules` ·
  `core/third_party` orada olmadığı için **16 test sahte kırmızı** düşüyordu
  (19 → 9 → **6**). Artefakt dizinleri artık taranıp worktree'ye bağlanıyor. Taban artık F0'ın
  yazdığı 6 kırmızıyla **birebir**: `GECE/log/F0.red.before`.
- **Mutasyon kanıtlayıcısı koşturuldu.** Temiz bir worktree'de `hem_check` yeşilken
  `engine/src/hem.cpp`'nin merkez-panel kaydırması bozuldu → kapı **kırmızıya döndü**,
  ağaç geri alındı, mühür sağlam kaldı. Yani `mutasyon.sh` bir nesneyi gerçekten bozabiliyor.

Koşu **başlatılmadı**. Tek komut: `bash GECE/gece.sh > GECE/log/gece.txt 2>&1 &`

## ⛔ KOŞUYU BUGÜN BLOKE EDEN TEK ŞEY
Çalışma ağacında **benden önce bırakılmış 285 commit'siz değişiklik** var:
`reports/` → `gate/` + `docs/kanit/` taşıması, `REPORTS.md` yeni, `devlog.md` ve `linkedin.md`
**silinmiş** (CLAUDE.md "DOKUNMA, dağıtım kanalı" diyor), `engine/tests/capability_check.cpp`
**değiştirilmiş**. Ben bunlara dokunmadım.
- `gece.sh` kirli ağaçta **başlamaz** (neyin ajandan geldiği ayırt edilemez).
- `kapi.sh` bu ağaçta zaten iki kırmızı veriyor: **K6** (var olan test değişmiş) ve
  **K1** (`figure_check` yeni kırmızı — 7 stil `figure-bands mandal.taban_v3`'te pinsiz;
  o stiller `66e2732`'de yok, yani kırmızıyı bu commit'siz yığın doğuruyor).
- Bunlar commit edilmeden ya da geri alınmadan gece koşusu başlayamaz. **Karar senin.**

## DOĞRULANIRKEN ÇIKAN, SORULMAMIŞ BULGULAR
- **Test sayısı 95 değil 96.** Temiz bir build 96 test kaydediyor; `engine/build` 95'te kalmış
  (bayat cache). F0'ın "89/95"i bu yüzden bir test eksik sayıyor.
- **7. bir devralınan kırmızı var: `sizechart_source_check`** — F0'ın altı kırmızısında yok.
  Sebebi ortam değil, içerik: `shoulderCM`/`backLengthCM`/`armLengthCM`/`neckCM` **kaynaksız**
  (70 sayının 4 sütunu, yani 40 değer bir yayına dayanmıyor). Son commit `97c1c4d` zaten bunu
  söylüyor. `GECE/log/F0.red.before` altı satır gösteriyor çünkü o ölçüm `66e2732`'de yapıldı;
  gerçek ağaçta yedi. **F8'in "kaç kırmızı" sayımı buna dikkat etmeli.**
- `RULES.md` "agent context = ENV.md + RULES.md ONLY" diyor; `GECE-KOSUSU.md` §1 ise
  `RULES.md + KOSU.md + brief`. `gece.sh` §1'i uyguluyor, `ENV.md`'yi ajana vermiyor.

## DAMLA'YA DÜŞEN (bloke etmez)
- **`patterns_real/` kararı açık:** `contract_check` kırmızısı oradaki 41 satın alınmış takipli dosyadan.
  Silme/taşıma yasak, karar senin.
- **`RULES.md`#9 ile §0.6 çelişiyor.** RULES "ctest tamamen yeşil olmadan push yok" diyor; taban zaten 89/95,
  yani o kural bugün fiilen çiğneniyor. Kapı §0.6'yı uyguluyor (kırmızı **kümesi** değişmedi mi).
  §0.1 "çelişen satır silinir" diyor ama `RULES.md` otorite dosyası — senin hükmün olmadan dokunmadım.
- **Kapanma dili:** §4.9 lace-up öneriyor (ayarlanabilir olduğu için grade hatasını yutar). F4'ün "geçiş"
  maddesi bu seçime dayanacak. Onaylıyor musun?
- **F3, F1'e kısmen yaslanıyor** ("F1 kapandıysa bedava gelir"). `gece.sh` F1 düşse bile F3'ü açıyor
  (§2.7: bağımsız faza geç). Sert bağımlılık istersen söyle.
