# GECE/ — yönlendirme

Bu koşu tek context'te yürümez. Aşağıdaki tabloya bakıp **sadece** ihtiyacın olan
dosyayı aç.

| şunu sorarsan | şu dosyaya bak |
|---|---|
| şu an neredeyiz, ne açık | `GECE/KOSU.md` (≤150 satır, canlı durum) |
| bir faz gerçekten kapandı mı, hakem ne dedi | `GECE/KAPI.md` |
| bugün ne var ne yok, sayılar nereden geldi | `GECE/F0.md` |
| kalıbın EU38 ölçüleri | `GECE/f0-pattern-EU38.json` (üreten: `GECE/f0-measure-pattern.py`) |
| flat'in siluet ölçüleri, ölçek beyanı var mı | `GECE/f0-flat-princess.json` (üreten: `GECE/f0-measure-flat.mjs`) |
| hangi operatör sevk edilmiş | `contract/garment-spec-v2.json` → `operators` |
| damar nedir, ne çizilir ne çizilmez | `ANAYASA.md:28-58` |
| flat ile kalıp neden aynı sayıyı vermiyor | `contract/tables.json` → `flat._layer` (kontrat beyanı) |
| ctest bugün ne durumda | `GECE/KOSU.md` → AÇIK KIRMIZILAR |

## Ölçüm aletlerini çalıştır

```
python3 GECE/f0-measure-pattern.py EU38          # kalıp ölçüleri (cm)
node    GECE/f0-measure-flat.mjs <styleKey>      # flat siluet ölçüleri (birimsiz)
cd engine/build && ctest                          # 232 sn
```

## Kural
Bir faz açılırken context'e giren dosyalar SADECE: `GECE/KOSU.md` + `RULES.md` +
o fazın brief'i + fazın adıyla saydığı kaynaklar. `HEDEF.md`, `DAMLA-KUYRUK.md`,
`devlog.md`, `linkedin.md` **hiçbir faza girmez** — gerekirse `grep` ile tek satır.
