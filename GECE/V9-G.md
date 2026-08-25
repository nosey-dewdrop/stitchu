# V9-G — H1.0-KAPI.md:54'ÜN KAYNAĞI DÜRÜSTÇE İLAN EDİLDİ (tutanak)

Koşu: 2026-08-25 · kapı `engine/tests/docs_truth_check.mjs` (DEĞİŞTİRİLMEDİ, yalnız
koşuldu) · taban `engine/tests/docs-truth-baseline.json` · ctest adı `docs_truth_check`.
Commit: `f4b5235`.

Değişen iki dosya: `docs/H1.0-KAPI.md` (tek satır) ve `engine/tests/docs-truth-baseline.json`.
`README.md`, `docs/` altındaki diğer dosyalar, `web/`, `contract/`, `engine/src/`,
`engine/tools/`, `patterns_real/` **DEĞİŞTİRİLMEDİ** — `git status --porcelain` yalnız bu
iki `M` satırını basıyor (`patterns_real/` altındaki `??` satırları bu koşudan ÖNCE de
vardı, `2f748db`'nin bıraktığı izlenmeyen dosyalar).

---

## 1. ÖLÇÜM — İDDİA DEĞİL, KOMUT ÇIKTISI

| komut | çıktı |
|---|---|
| `git ls-files --error-unmatch patterns_real/geometry/geometry-full.json` | `error: pathspec … did not match any file(s) known to git` · **exit 1** |
| `git ls-files --error-unmatch patterns_real/geometry/seamgraph.json` | aynı hata · **exit 1** |
| `git check-ignore -v patterns_real/geometry/geometry-full.json` | çıktı YOK · **exit 1** (eşleşme yok) |
| `git check-ignore -v patterns_real/geometry/seamgraph.json` | çıktı YOK · **exit 1** (eşleşme yok) |
| `ls -l patterns_real/geometry/` | `geometry-full.json` 664754 bayt · `seamgraph.json` 89834 bayt · `ring-trace-locket-front-38.json` 12887 bayt — **üçü de DİSKTE VAR** |
| `git log --oneline -1 2f748db` | `2f748db move stitchu reports into a single corpus dump, drop the duplicates from the repo` (tarih `%ad` ile: **2026-08-20**) |
| `git log --diff-filter=D --oneline -- patterns_real/geometry/` | **tek satır: `2f748db`** |
| `git show --diff-filter=D --name-only 2f748db -- patterns_real/geometry/` | `geometry-full.json` · `ring-trace-locket-front-38.json` · `seamgraph.json` |
| `git ls-files patterns_real/ \| wc -l` | **41** — `patterns_real/` altında hâlâ 41 dosya İZLENİYOR, yani dizinin tamamı repodan çıkmış değil |

**Hüküm:** iki dosya diskte VAR, izlenen ağaçta YOK, gitignore'da da YOK. Temiz bir
klonda bulunmazlar. Doküman onları "Birincil kaynak" diye sunuyordu.

---

## 2. ÖNCE / SONRA

**ÖNCE** — `node engine/tests/docs_truth_check.mjs --no-baseline` (`/tmp/v9g-nb.txt`
öncesi koşu):

(sayılar yeniden ölçüldü: `git worktree add /tmp/v9gbefore HEAD~1` + aynı komut, **exit 1**)

```
yoklanan hedef 568 · VAR 491 · düşen yanlış-pozitif sınıfı 35
sayı+birim taşıyan satır 139 · SAĞLAYICISIZ 0
GERÇEK ölü 1 · kayıtlı borç 0 · YENİ 1
  IHLAL  docs/H1.0-KAPI.md:54  -> patterns_real/geometry/geometry-full.json  [TICK]
  cipasiz docs/H1.0-KAPI.md:54 -> seamgraph.json           (ÇIPASIZ AD 17)
HÜKÜM: FAIL — HARD-0 kipi · D1 0 · D2 1 · D3 0
```

**ONARIM** — `docs/H1.0-KAPI.md:54`. Eski cümle ve **iki kaynağın adı da yerinde
kaldı**; yanına gerçek durum yazıldı: dosyaların diskte olduğu (ölçen komut yazılı),
izlenen ağaçta olmadığı, gitignore'da da olmadığı, hangi commit'in onları çıkardığı ve
temiz klonda bulunmadığı. Kaynak silinmedi, statüsü ilan edildi. Repoya geri alınıp
alınmayacağı (telif + `patterns_real/` gizlilik çelişkisi) **DAMLA KARARI** olarak
satırda kayıtlı; tek taraflı yapılmadı.

**SONRA** — `node engine/tests/docs_truth_check.mjs --no-baseline`, `/tmp/v9g-nb.txt`:

```
yoklanan hedef 570 · VAR 492 · düşen yanlış-pozitif sınıfı 38
GERÇEK ölü 0 · kayıtlı borç 0 · YENİ 0
sayı+birim taşıyan satır 140 · SAĞLAYICISIZ 0
HÜKÜM: YEŞİL — HARD-0 kipi · D1 0 · D2 0 · D3 0        EXIT 0
```

`seamgraph.json` da ÇIPASIZ listesinden düştü (17 → 16): satır artık kendi yokluğunu
ilan ettiği için hedef "kapsam dışı jeton" olarak değil, **ilan edilmiş yokluk** olarak
düşüyor.

**TABAN SIFIRA KESİLDİ** — `--note="v9-g: H1.0-KAPI.md:54 kaynak durumu dürüstçe ilan
edildi, D2 kayıtlı borcu 1 -> 0" --baseline`, exit 0:

```
D1 açık borç : 0 (ham 14)
D2 açık borç : 0 (yoklanan 570)
D3 taban     : 0 / 140 sayısal satır
```

V9-B3'ün `bilinenAcik` **kayıtlı borcu 1 → 0**; taban dosyasında artık D1/D2 borç
listesi yok, yalnız D3 tabanı 0. Taban kapının KENDİ `--baseline` seçeneğiyle kesildi,
elle yazılmadı.

**ctest** — `ctest --test-dir engine/build -R docs_truth_check --output-on-failure`:
`1/1 Test #116: docs_truth_check … Passed 0.15 sec` · `100% tests passed, 0 tests failed
out of 1` · exit 0.

---

## 3. TAŞINABİLİRLİK KANITI (commit'ten SONRA)

```
git worktree add /tmp/v9g HEAD      → Preparing worktree (detached HEAD f4b5235)
cd /tmp/v9g && node engine/tests/docs_truth_check.mjs
  yoklanan hedef 570 · VAR 492 · düşen yanlış-pozitif sınıfı 38
  GERÇEK ölü 0 · kayıtlı borç 0 · YENİ 0
  sayı+birim taşıyan satır 140 · SAĞLAYICISIZ 0
  HÜKÜM: YEŞİL — yeni duran-iddia 0, yeni ölü hedef 0, D3 0 <= taban 0
  EXIT 0
git worktree remove /tmp/v9g       → `git worktree list` doğrulandı
```

Temiz worktree ile çalışma dizini **bit bit aynı D2 sayılarını** veriyor (570/492/0).
Hüküm çalışma dizininden bağımsız — V9-B3'ün onardığı portatiflik şartı korunuyor.

---

## 4. YAPILAMAYAN / KAPSAM DIŞI

- `patterns_real/geometry/`'nin repo statüsü **ÇÖZÜLMEDİ** — dosyalar hâlâ izlenmiyor.
  Bu kart onu çözmek için değil, dokümanın o durumu dürüstçe söylemesi için açıldı.
  İzlensin mi / gitignore'a mı girsin: Damla kararı (`CLAUDE.md` GİZLİLİK ÇELİŞKİSİ).
- Kapı dosyası açılıp OKUNDU (kaçış gramerini bilmek için) ama **DEĞİŞTİRİLMEDİ**;
  `git status` onda hiçbir satır basmıyor.

## 5. KART DIŞI FARK EDİLEN (sorulmadı, ölçüldü — dökülüyor)

1. **Aynı ölü kaynağı anan iki doküman satırı DAHA var, kapı ikisini de görmüyor:**
   - `docs/G5-OMUZ-PLANI.md:64` → `patterns_real/geometry/geometry-full.json`, **backtick
     YOK** (düz parantez içinde). Kapının D2'si yalnız backtick/md-link tarar → sessizce
     geçiyor.
   - `docs/SATIS-SARTNAMESI.md:299` → `` `patterns_real/geometry/geometry-full.json` ``,
     backtick VAR ama kapı ateşlemiyor. **SEBEP ÖLÇÜLDÜ:** kapsayıcı madde 296. satırda
     başlıyor (`- ~~\`benchmark-58/bugra-ref/\`~~ — **DOSYA YOK** …`) ve 301'e kadar
     sürüyor; `DECLARED_MISSING_STRONG` kalıbı KAPSAYICI PARAGRAFTA arandığı için o
     "DOSYA YOK" ilanı, aynı maddenin içinde anılan **başka** bir yolu da muaf kılıyor.
     Üstelik satır tam tersini iddia ediyor: *"`patterns_real/` altında duruyor ve bugün
     de ölçülüyor"* — bu cümle temiz klonda YANLIŞ. Bu, V9-B2'nin satır kanalında
     kapattığı zaafın (H1.0:189) **paragraf kanalındaki eşi**: STRONG ilan hedefin
     solunda/başka bir hedef için olabiliyor. Kapatmanın yolu STRONG'u da hedefin sağına
     çipalamak; bu kartta YAPILMADI (kapı DEĞİŞTİRİLMEZ).
   İkisi de bu kartın "DEĞİŞTİRİLMEZ" listesinde olduğu için elle sürülmedi. Yani
   **"D2 0" = "docs'ta ölü kaynak referansı kalmadı" DEĞİL**; kapının GÖRDÜĞÜ ölü
   referans kalmadı.
2. `2f748db` `ring-trace-locket-front-38.json`'ı da repodan çıkardı. `CLAUDE.md` o dosya
   için "KULLANMA — %40 uydurma" diyor, yani kaybı zararsız; ama artık o uyarının
   işaret ettiği dosya da temiz klonda yok.
3. `git worktree list` bu koşuda **başka bir işçinin açık worktree'sini** gösteriyor:
   `/private/tmp/v7base` (detached `e4249b7`). Benim değil, dokunulmadı.
4. Taban dosyası artık D1/D2 için **boş liste** taşıyor. Bu bir sıkılaşmadır: bundan
   sonra docs'ta beliren HER ölü hedef ve HER duran-iddia doğrudan kırmızı düşer,
   arkasında saklanacak kayıtlı borç kalmadı.
5. V9-B3 §5'te kayıtlı zaafların hiçbiri bu kartta kapanmadı (ARTEFAKT ve ÇIPASIZ AD
   sınıflarının kaçış kanalı olması, D3 sağlayıcısının semantik olmaması, kapının kendi
   fazını denetlememesi). Bu tutanak da hiçbir kapıdan geçmiyor.
