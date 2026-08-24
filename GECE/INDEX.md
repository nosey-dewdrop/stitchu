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

## V0 fazı — envanter (24 Ağu 2026)

Faz kuralı: ölçüm var, onarım yok. Tutanak ve kartlar aşağıda; ham çıktılar `GECE/log/`.

| dosya | içinde ne var |
|---|---|
| `GECE/V0.md` | fazın tutanağı: ölçülen kalemler, kapanan/açılan kırmızı adları, sonraki faza devredilen üç sayı ve taban bantları. |
| `GECE/V0-0A.md` | motor envanteri: `ctest` sayımı, `contract/garment-spec-v2.json` operatör sayımı ve damar yüzdelerinin adım adım yöntemi. |
| `GECE/V0-0B.md` | görü hattı ölçümü: `engine/tools/foto-spec-olcum.mjs` ve `vision/eval.js` koşularının okuması, hata sınıfları, ölçülemeyenlerin listesi. |
| `GECE/V0-0C.md` | vitrin taraması: `docs/` + `web/` + README iddia sayımı, taşıyıcı iddiaların yargısı, duran-iddia (RULES §6) hit dökümü, `site-health.mjs` okuması. |
| `GECE/V0-0D.md` | sözlük dili: `engine/vocab.json` eksen/değer sayımı, sevk edilen menü ile motor sözlüğü arasındaki kayma, `bindings.cpp` int ikamesi ve `collarType` NaN bulgusu. |
| `GECE/V0-0E.md` | wasm paritesi, tazelik kontrolü, `draftJSON`/`gradeJSON` süre tabanı, soak koşusu ve çağrı yolunun hangi iplikte olduğu. |
| `GECE/V0-0F.md` | altı kırmızının kök teşhisi ve her biri için ölçülmüş çözüm adayı (hiçbiri ana ağaca bırakılmadı). |
| `GECE/V0-0R.md` | eşiklerin kaynak araştırması: hangi eşik yayınlanmış bir kaynağa dayanıyor, hangisi için kaynak bulunamadı. |
| `GECE/KART/V0-0A-motor.md` … `V0-0R-arastirma.md` | yedi işçi kartının brief'i: her kartın kapalı kaynak listesi, çıktı dosya kümesi ve teslim şartı. |
| `GECE/log/V0-0A.ctest.txt` · `V0-SEF.ctest.txt` | `ctest --test-dir engine/build --output-on-failure` iki bağımsız koşusunun ham çıktısı. |
| `GECE/log/V0-0A.red-names.txt` · `V0-SEF.red-names.txt` | aynı iki koşudan süzülmüş kırmızı test ADLARI (`diff` ile karşılaştırılmak için). |
| `GECE/log/V0-0B.eval.txt` | görü değerlendirme koşularının ham çıktısı (foto-spec ölçümü + `vision/eval.js`). |
| `GECE/log/V0-0C.site-health.txt` · `V0-SEF.site-health.txt` | `node engine/tools/site-health.mjs` koşularının çıktısı ve exit kodu. |
| `GECE/log/V0-0D.enum-refs.txt` | eksen adı / enum değeri referans sayımını basan `grep` komutları ve çıktıları — V2'nin `vocab_reference_check` sayacının tabanı. |
| `GECE/log/V0-0E.wasm.txt` | `node --expose-gc engine/tools/wasm-baseline.mjs --reps 200 --soak 5000` çıktısı. |
| `GECE/log/V0-0F.aday.txt` · `V0-0F.hakem.txt` | çözüm adaylarının denendiği koşuların çıktısı ve hakemin bunları yeniden koşturduğu doğrulama. |
| `engine/tools/wasm-baseline.mjs` | native↔wasm parite, tek üretim/beden serisi süresi ve soak ölçümünü basan alet; taban bantları buradan okunur. |

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
