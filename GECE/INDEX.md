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

## V1 fazı — onarım (24 Ağu 2026)

Faz kuralı: V0'ın saydığı kırmızılara dokunulur, ama devralınan kırmızı ADLARI büyüyemez
(RULES §9) ve her onarım kendi önce/sonra `ctest` çıktısını yanına bırakır.

| dosya | içinde ne var |
|---|---|
| `GECE/V1.md` | fazın tutanağı (şef yazar). |
| `GECE/V1-R.md` | araştırma hükümleri: beden tablosunun kaynaksız dört kolonu, golden yeniden-pinleme pratiği, `taban_v3` bandı sorusu. |
| `GECE/V1-SINIF.md` | devralınan kırmızıların sınıflandırması: hangisi kasten bayat pin, hangisi kaynak/karar boşluğu, hangisi regresyon. |
| `GECE/KART/V1-A-golden-mühür.md` · `V1-B-recete.md` · `V1-D-figure.md` · `V1-E-stylepin.md` · `V1-R-arastirma.md` | işçi kartlarının brief'i: kapalı kaynak listesi, çıktı dosya kümesi, teslim şartı. |
| `GECE/log/V1.ctest.before.txt` · `V1-A.ctest.after.txt` · `V1-A.ctest.after-precommit.txt` | turun BAŞINDAKİ ve SONUNDAKİ tam `ctest` koşuları. Kırmızı ADLARININ büyüyüp büyümediği bu dosyaların `diff`'inden okunur, buradaki bir cümleden değil. |
| `GECE/log/V1-A.olcum.txt` | golden yeniden-pinlemesinin ölçüm defteri: içerik diff'i, parça başına sapma, reçete yolunun koşusu. |
| `GECE/log/V1-B.ctest.before.txt` · `V1-B.ctest.after.txt` · `V1-B.ctest.recipe-applied.txt` · `V1-B.olcum.txt` · `V1-B.diff-tool.cpp` · `V1-B.recipe-FIXED.json` | reçete DSL'ine `scye` opu eklenirken alınan üç ctest koşusu, ölçüm defteri, kıyas aleti ve düzeltilmiş reçete belgesi. |
| `GECE/log/V1-D.kardes.txt` | `figure_check`: bandeau'nun devralabileceği bir kardeş stil var mı — bileşen tablosuyla gösterildi, iddiayla değil. |
| `GECE/log/V1-E.mutasyon.txt` | `style_check` kapsam kuralının mutasyon kanıtı: pin yok / tek pin / tam kapsam üç hâlde kapı ne diyor. |
| `GECE/log/V1-F.sloper-tanik.txt` | bağımsız tanık `sloper_check`'in değişimden ÖNCE ve SONRA koşuları (komut izi dahil) — golden mühür etiketindeki bir iddianın çürütüldüğü ölçüm. |
| `engine/GOLDEN-PIN.md` | golden yeniden-pinleme defteri. Deftersiz pin geçersiz; 2026-08-24 girdisi **Damla onayını BEKLİYOR (K-V1A)**, yani mühür kapanmış bir karar değil. |

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
