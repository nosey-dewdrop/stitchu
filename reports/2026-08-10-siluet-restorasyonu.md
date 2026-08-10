# silüet restorasyonu — iki kırmızı test kök sebeple kapandı (2026-08-10)

## ne kırıktı?
`figure_check` (21 FAIL) + `preview_truth_check` (36 FAIL), 5 Ağu 03:33'ten (4aec2e5) beri.
Push kapısı süiti kendi koşuyor → 5 gündür hiçbir push yeşil damga alamazdı.

## kök sebep (tahmin değil, ölçüm)?
4aec2e5 tek croquis'e geçerken **boyları** torso oranıyla taşıdı ama **giysi genişliğini taşımadı**:
giysi gövdesi vücudun kendisine çöktü. Bol 70s dantel (1.003) da kasıtlı boxy kutu (0.986) da
aynı vücut oranına (~0.637-0.74) figürelleşti. Flat artık giysi değil vücut çiziyordu — ve bu,
"flat'in vaat ettiği ile kalıbın çizdiği ayrışıyor" kök derdinin 2B yüzü.

## ne yapıldı (yama değil, eksik yarımın tamamlanması)?
1. **Hedefler AYNI ALETLE ölçüldü:** eski onaylı kalem (30fae0e) worktree'de koşuldu,
   31 stilin waist/bust'ı figure-lint'in kendi `waistBust`'ıyla alındı
   (`Logs/siluet-2026-08-10/old-figure-targets.txt`).
2. **Kontrat katmanı doğdu:** `contract/figure-bands.json garment_ease` —
   vücut TEK kalır (figür croquis, Damla 5 Ağu emri), giysi silüeti stil başına
   `bel` / `gogus` çarpanıyla vücudun ÜSTÜNE biner. Bu, "vücut + bolluk = giysi"
   ayrımının ilk gerçek kontratı (L0/L1 katman ayrımının tuğlası).
3. **Çarpanlar ÇÖZÜLDÜ, yazılmadı:** `engine/tools/solve-garment-ease.mjs` ikili arama,
   tolerans 0.002; her iterasyon taze subprocess (modül cache kontratı donduruyor).
   Bel tek başına yetmedi — alet minimumu koltukaltında okuyup 0.78'de doyuyordu;
   omuzdan düşen 11 stile `gogus` (eski üst gövdesi 70.6px / yeni vücut 53.94px = 1.3089).
   Geçen stile DOKUNULMADI (bayt aynı).
4. **preview-truth pinleri TAŞINDI (61a8ee4 emsali, gevşetilmedi):** draft tarafı kanıtlı
   sabit — 160 landmark satırında draft kolonunda 0.001 üstü drift YOK
   (`Logs/siluet-2026-08-10/pt-tables.json`). Hareketin tamamı flat paydasında
   (elbise bustHalf 86.8→53.94px = ×0.6215) + bugünkü restorasyonda. 28 pin ölçülen
   sapma + 0.2 okuma payına taşındı, gerekçe her pinin içinde.

## kanıt?
- `figure_check`: 21 FAIL → **YEŞİL** (çözücü logları: 16 stil ±0.002, tent/boxy gogus sonrası tam hedefte)
- `preview_truth_check`: 36 FAIL → **YEŞİL**
- **ctest 82/82** (tam süit)
- Göz turu: `Logs/siluet-2026-08-10/yeni-*.svg` (boxy gerçek kutu, 70s dantel bol,
  peplum belde toplanıp çan açıyor) — eski çökük hal `flat-*.svg` yanında.

## açık kalan (bu düzeltmenin ÇÖZMEDİĞİ)?
- Flat ile kalıp hâlâ İKİ ayrı dünyadan türetiliyor; bugünkü iş makası kapatmadı,
  makası ÖLÇÜLÜR ve pinli hale getirdi. Ömürlük çözüm tek 3B giysi yüzeyi (plan Faz C).
- Bel halkası 2.95mm arızası (bodice 726.28 vs etek 723.34mm, 17/17 kombinasyon) DURUYOR —
  o kalıp katmanının derdi, plan Faz B4'te mühürlenip Faz C'de kökten çözülecek.
- `garment_ease` şu an 2B flat katmanının kontratı; Faz C'de L2 ease-field d(t,φ)'nin
  2B izdüşümü olarak yeniden türetilecek (değerler ölçülü hedefleriyle duruyor).
