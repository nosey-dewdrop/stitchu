# docs/ — reponun md'leri nerede? (6 Eyl 2026)

Kural: `docs/` = ürün gerçeğini anlatan belgeler (`docs_truth_check` kapsamı). Raporlar/planlar `KOSU/ciktilar/`. Kökte yalnız `HEDEF.md` (yasa), `0509-kosu.md` (canlı koşu), `README.md`. Başka md kökte durmaz; yeni md `docs/` altına ve tarihle (`0609-...`).

| yer | ne | kim okuyor |
|---|---|---|
| `docs/DERSLER.md` | batan/çalışan yaklaşımların damıtılmış hafızası (24 Tem) | recipe.hpp, CMakeLists, repin-style.sh, golden check'ler (yorum) |
| `docs/GRAF-IR.md` | graf IR: tipler, op tablosu, F2b kapıları | graf_ir_check, 0509 koşucusu |
| `docs/H1.0-KAPI.md` | H1.0 kapı tanımı (omuz/kol oyuğu) | bodice.hpp, surfacepattern, garment_armhole_check, docs-truth-baseline |
| `docs/KATMAN-HARITASI.md` | katman ayrımı haritası | katman-lint.py, engine-check harness |
| `docs/taste-lexicon.md` | zevk sözlüğü (27 Tem) | kimse; 0509 §14 zevk damarı özetliyor |
| `knowledge/` | kaynaklı araştırma notları + `stitchu.db` + `sewing-guide.md`; **kod runtime'da okuyor** (instructions.py, printpack_sheet_check, dials.py, gen-guide.mjs) — taşınmaz | contract/*.json kaynak alanları, motor yorumları |
| `KOSU/ciktilar/*.md` | koşu ÇIKTILARI ve raporları: bugra-rapor, flat-secim, edge-case-tablosu, graf-ilk/dikilebilir-*, kusur-listesi (4 Eyl), `KOSU/ciktilar/sonraki-kosu/` (platform-plani, seo-plani, ios-tokenlar, pazar-notlari) | testler yol olarak okuyor. **docs/ altına konmaz:** `docs_truth_check` docs/** içindeki her sayıyı sağlayıcı ister (D1-D3); raporlar ölçüm kaydıdır, kapıyı kırar (6 Eyl ölçüldü: 10 D1 + 57 D3) |
| kod yanı: `backend/API.md`, `backend/DEPLOY.md`, `engine/FORMULAS.md`, `engine/GOLDEN-PIN.md`, `contract/garment-spec-v2.md` ve kod klasörlerinin kendi README dosyaları | kodun kendi belgesi | o kod |

Silinen koşu belgeleri (git geçmişinde): DEVIR.md, DEVIR-PROMPT.md, KARARLAR.md, KOSU-v8.md, RULES.md, ENV.md, ANAYASA.md, KOSU-STITCHU.md → hepsi `0509-kosu.md` §14'e katlandı.
