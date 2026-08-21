# KOŞU — 2026-08-21

## ŞU AN
faz: **F1 açıldı (21 Ağu)** · durum: harness mühürlü, ağaç temiz, taban ölçülü, `gece.sh` koşuyor · son yeşil commit: **YOK**
(devralınan taban: **ctest 89/96 — 7 kırmızı**, aşağıda isim isim. §0.6 gereği ölçü sayı değil **isim kümesi**.)

## HAT VARSAYIMI
ürün hattı = `garment` · yüzey (`surfacepattern`) = henüz sevk edilmiyor   [Damla varsayılanı, geri alınabilir]
Dayanağı §4.6: `engine/wasm/bindings.cpp` → `garment.hpp`; aynı dosyada "surfacepattern" **0 kez** geçiyor.

## KAPANMIŞ FAZLAR
F0 ✓ Damar %0, flat kalıptan türemiyor ve kontrat bunu zaten beyan etmiş -> `GECE/F0.md` (kapı tutanağı: `GECE/KAPI.md`)

## AÇIK KIRMIZILAR (ne · nerede · ölçülen sayı)
- ctest devralınan kırmızı · **7/96 FAIL** · isimler `GECE/log/F0.red.before` dosyasında,
  temiz ağaçta ölçüldü (kapı `Testing/Temporary/LastTestsFailed.log`'dan okuyor):
  - `style_check` · `engine/STYLE-PIN` dosyası yok · pinlenmiş stil **0**
  - `bugra_bridge_check` · `patterns_real/geometry/ring-trace-locket-front-38.json` yok
  - `contract_check` · `patterns_real/` git'te **41 takipli dosya** (Damla'nın kararında, dokunulmaz)
  - `preview_truth_check` · `princess_dress` → `bustHalf`/`neckHalf`/`neckDepth` **ÖLÇÜLMEDİ**
  - `figure_check` · 3+ stil `waist/bust 0.637` tabansız · `figure-bands` `mandal.taban_v3` pin yok
  - `h10_gate_check` · EU34 armhole **312.86 mm** (kapı 384.50–424.50) · shoulder-seam **0 dikiş** (kapı ≥2)
  - `sizechart_source_check` · beden tablosunun 70 sayısından **40'ı kaynaksız**
    (`shoulderCM` `backLengthCM` `armLengthCM` `neckCM` — hiçbiri bir yayına dayanmıyor)
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
3. **ctest 89/96** — 7 devralınan kırmızı, isimleri yukarıda

## [HAT-VARSAYIM] ETİKETLİ İŞLER
(fazlar buraya yazacak)

## HARNESS (21 Ağu kuruldu, mühürlü, KOŞTURULARAK doğrulandı)
`GECE/gece.sh` · `GECE/kapi.sh` (K1–K7) · `GECE/mutasyon.sh` · `GECE/mutasyon.tsv` · `GECE/hakem-sorusu.md` · `GECE/kapi.sha`
**Faz ajanına düşen tek ek görev:** kendi kapısını `GECE/mutasyon.tsv`'ye yazmak. Boş satır = o faz kapanamaz (§2.3).

Doğrulama (sözdizimi değil, **koşturuldu**):
- `kapi.sh F0 66e2732` üç kez koştu; yedi alt kapı da ateşledi. Log: `GECE/log/F0.kapi.txt`.
- **K1'in tabanı YALANDI, iki ayrı kusurdan, ikisi de ölçülüp kapatıldı.**
  (a) Worktree sadece takipli dosyaları alır; `engine/dist` · `engine/.venv-dxf` ·
  `engine/pattern-bridge/.venv` · `engine/tools/node_modules` · `core/third_party` orada
  olmadığı için **16 test sahte KIRMIZI** düşüyordu (19 → 9 → 6). Artefakt dizinleri artık
  taranıp bağlanıyor.
  (b) `/tmp` symlink'i **1 testi sahte YEŞİL** yapıyordu (aşağıda ayrı bölüm). 6 → **7**.
- **Mutasyon kanıtlayıcısı koşturuldu.** Temiz bir worktree'de `hem_check` yeşilken
  `engine/src/hem.cpp`'nin merkez-panel kaydırması bozuldu → kapı **kırmızıya döndü**,
  ağaç geri alındı, mühür sağlam kaldı. Yani `mutasyon.sh` bir nesneyi gerçekten bozabiliyor.

Koşu **başlatıldı** (21 Ağu, Damla açtı): `bash GECE/gece.sh > GECE/log/gece.txt 2>&1 &`

## TABAN (21 Ağu 14:5x, temiz ağaçta ölçüldü) — **7 kırmızı, 96 test**
```
bugra_bridge_check · contract_check · figure_check · h10_gate_check
preview_truth_check · sizechart_source_check · style_check
```
F0'ın "89/95"i iki yerde eksikti: test sayısı **96** (bayat `engine/build` 95'te kalmış) ve
`sizechart_source_check` sayılmamış. `figure_check` **gerçek devralınan kırmızı** — stash'lenen
yığından gelmiyor (aşağıdaki sahte-yeşil kusuru düzeltilince taban listesine girdi).

## KAPININ KENDİ SAHTE YEŞİLİ (bulundu, ölçüldü, kapatıldı)
Worktree'yi `/tmp` altına kurmuştum; macOS'ta `/tmp` → `/private/tmp` bir **symlink**.
Repodaki 6 `.mjs` dosyası `import.meta.url === pathToFileURL(argv[1])` deyimini kullanıyor:
symlink yolundan çağrılınca eşitlik tutmuyor, **süit hiç koşmuyor, node 0 ile çıkıyor.**
Ölçüldü: `engine/tools/figure-lint.mjs` gerçek yoldan `exit 1`, `/tmp` yolundan **çıktısız `exit 0`**.
Yani kapı, §2'nin tam olarak yasakladığı **vacuous green**'i kendi üretiyordu ve her faza sahte
"yeni kırmızı: figure_check" basacaktı. `TMP` artık `pwd -P` ile fiziksel yola sabit.
Aynı kırılgan deyimi kullanan diğer 5 dosya: `cloth-solver.mjs` · `_engine-full.mjs` ·
`compiler/parse.mjs` · `compiler/gate.mjs` · `compiler/compile.mjs`.

## ÖNCEKİ OTURUM ARTIĞI — STASH'LENDİ
Benden önce bırakılmış **285 commit'siz değişiklik** vardı (`reports/` → `gate/` + `docs/kanit/`
taşıması, `REPORTS.md` yeni, `devlog.md` ve `linkedin.md` **silinmiş**,
`engine/tests/capability_check.cpp` **değiştirilmiş**). Damla'nın emriyle stash'lendi:
```
git stash list -> stash@{0}: On main: onceki oturum artigi
```
**Silinmedi, duruyor.** `devlog.md`/`linkedin.md` silmesi CLAUDE.md'nin "DOKUNMA, dağıtım kanalı"
satırıyla çelişiyor — geri almadan önce Damla'nın hükmü gerek. Ağaç artık temiz, `gece.sh` başlayabilir.

## DOĞRULANIRKEN ÇIKAN, SORULMAMIŞ BULGULAR
- **Test sayısı 95 değil 96.** Temiz build 96 kaydediyor; `engine/build` 95'te kalmış (bayat cache).
- **`sizechart_source_check` F0'ın listesinde hiç yoktu** ama devralınan bir kırmızı. Sebebi ortam
  değil içerik; son commit `97c1c4d` zaten bunu söylüyor. F8'in sayımı buna dikkat etmeli.
- **DOĞRULANMADI:** `gece.sh` uçtan uca hiç koşmamıştı — `claude -p` / hakem / push yolu ilk kez
  bu gece deneniyor. `claude -p --output-format stream-json --allowedTools` ayrı ayrı sınandı, çalışıyor.
- **DOĞRULANMADI:** K7 (context hijyeni) hiç ateşlemedi, ajan logu yoktu. İlk gerçek fazda sınanacak.

## DAMLA'YA DÜŞEN (bloke etmez)
- **`patterns_real/` kararı açık:** `contract_check` kırmızısı oradaki 41 satın alınmış takipli dosyadan.
  Silme/taşıma yasak, karar senin.
- **Stash geri gelecek mi?** `stash@{0}` içinde `devlog.md` ve `linkedin.md` **silinmiş** duruyor;
  CLAUDE.md o ikisi için "DOKUNMA, dağıtım kanalı" diyor. Hükmün ne?
- **Kapanma dili:** §4.9 lace-up öneriyor (ayarlanabilir olduğu için grade hatasını yutar). F4'ün "geçiş"
  maddesi bu seçime dayanacak. Onaylıyor musun?
- **F3, F1'e kısmen yaslanıyor** ("F1 kapandıysa bedava gelir"). `gece.sh` F1 düşse bile F3'ü açıyor
  (§2.7: bağımsız faza geç). Sert bağımlılık istersen söyle.
- **Kullanım limiti:** önceki hesap %90'daydı (sıfırlanma 24 Ağu 11:00), Damla ikinci hesaba geçti.
  Koşu 4 faz × (ajan + hakem) = 8 oturum.
