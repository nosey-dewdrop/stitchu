# F9-A — DOCS DURAN-İDDİA KAPISI (tutanak, ilerledikçe eklenir)

## 0. Açılış
Kart: `GECE/KART/F9-A-kapi.md` okundu. RULES.md + ENV.md okundu.
RULES.md §6 kapının yasal dayanağı: "Numbers live in TEST OUTPUT, not in docs.
Docs never assert 'ALL PASS / 0.00mm / byte-identical / zero issues' as standing
fact — name the tool/test that prints the number instead." §7: "'Bugs: none known'
is banned."

Bu kapı o iki kuralı MEKANİK hale getiriyor.

## 1. ÖNCE GREP (devam ediyor)
- `grep -n "add_test" engine/CMakeLists.txt` → 90+ kayıt. `.sh` tabanlı 12 test var
  (`engine/tests/*.sh`). Kayıt biçimi: `add_test(NAME x COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/tests/x.sh ...)`.
- `grep -rn "docs_truth" engine/` → **0 satır**. Böyle bir kapı YOK, ikinci nüsha doğurmuyorum.
- Çalışma dizini: ctest'in cwd'si build dizini. `generated_ratchet_check.sh:43`
  repo kökünü BETİĞİN KENDİ YERİNDEN türetiyor:
  `ROOT="$(cd "$(dirname "$0")/../.." && pwd)"`. Yol UYDURMADIM, aynısını yaptım —
  worktree'ye kopyalandığında da o ağacın kökünü buluyor (before ölçümü bunu gerektiriyor).

## 2. KAPI YAZILDI
`engine/tests/docs_truth_check.sh` (chmod +x). bash + gömülü perl (macOS'ta hazır;
awk'ta `\b` word-boundary yok, kart regex'i onu gerektiriyor).

Kartın şartnamesinden TEK sapma, ve gevşetme DEĞİL: kart sayısal-iddia regex'ini
`...|%)\b` yazıyor. Perl/PCRE'de `\b` bir word-char gerektirir, `%` word-char
değildir → satır sonundaki `%3` ASLA eşleşmezdi. `\b` yalnızca harfle biten
birimlere uygulandı, `%` çıplak bırakıldı. Bu okuma DAHA ÇOK satır yakalar.
Betiğin içine gerekçesiyle yazıldı.

Sayım kuralı: KURAL A'da bir satır birden fazla yasak ifade taşıyorsa her ifade
ayrı ihlaldir (README.md:44 hem `0.00 mm` hem sayısal ihlal veriyor). KURAL B
satır başına en fazla 1 ihlal ("tanıksız her satır ihlaldir").

## 3. ctest'e BAĞLANDI
`engine/CMakeLists.txt` — `generated_ratchet_check` kaydının hemen altına
`add_test(NAME docs_truth_check COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/tests/docs_truth_check.sh)`
+ neden-yorumu. Çalışma dizini argümanı YOK; kök betiğin kendi yerinden türüyor
(generated_ratchet_check ile birebir aynı desen).

Doğrulama (temiz build dizini, mevcut `engine/build`'a dokunulmadı):
`cmake -S engine -B /tmp/f9a-build -DCMAKE_BUILD_TYPE=Release` → cfg=0
`ctest --test-dir /tmp/f9a-build -R '^docs_truth_check$'` →
`5 - docs_truth_check (Failed)`, `0% tests passed, 1 tests failed out of 1`.
Yani kapı ctest'ten görünüyor ve build dizininden koşarken repo kökünü buluyor.

## 4. FAZ-ÖNCESİ ÖLÇÜM (K2 kanıtı)
`git worktree add --detach /tmp/f9-before 962407d` → HEAD 962407d28aac...
Kapı betiği oraya KOPYALANDI (değiştirilmedi, sha256 log başında).
Log: `GECE/log/F9A.gate.before.txt` (62 satır)

**docs truth: 16 standing-claim violation(s) | 36 unwitnessed numeric claim(s) — EXIT=1**

Kapı faz-öncesinde KIRMIZI. BOŞ DEĞİL. En sert örnekler (hepsi 962407d'de duruyor):
- `README.md:44` — "Seam-pair precision: worst pair 0.00 mm" (hem duran iddia hem tanıksız)
- `README.md:43` — "Clean-build test suite: 77/77 green" — bugün ctest 84+ test kayıtlı,
  yani sayı BAYAT ve satırda onu basan alet adı yok
- `docs/ARCHITECTURE.md:73` — "must keep the matrix ALL PASS and the base draft byte-identical"
- `docs/ARCHITECTURE.md:80` — "geometric validation **is complete**"
- `docs/SATIS-SARTNAMESI.md:241` — "borcu **bitti**: §2 6/6 · §3 4/4 · §4 4/4"

## 5. BUGÜNKÜ ÖLÇÜM
Log: `GECE/log/F9A.gate.now.txt`
**docs truth: 16 standing-claim violation(s) | 32 unwitnessed numeric claim(s) — EXIT=1**

⚠ Bu sayı HAREKETLİ: aynı fazda paralel kâtip işçisi `README.md`'yi yazıyor.
Ölçüm anında `git diff --stat 962407d -- <5 dosya>` = `README.md | 26 +++---`
(14 ekleme / 12 silme). Benim ilk koşumda (kâtip yazmadan önce) bugünkü sayı da
36'ydı; 4 tanıksız sayı README'den kâtip tarafından kaldırılmış. Duran iddia 16
hiç kımıldamadı. **Kâtip işini bitirdiğinde sayı yeniden ölçülmeli** — bu log
13:33Z anının fotoğrafıdır.

## 6. KAPI BOŞ DEĞİL, DUVAR DA DEĞİL (exit 0 yolu kanıtlandı)
`/tmp/f9-clean` altında 5 dosyalık sentetik temiz ağaç kuruldu:
- tanıklı sayı satırı (`433.45mm ... flatten-research/18-seam.py`) → ihlal YOK
- ``` bloğu içindeki `ALL PASS 0.00mm 84/84` → SAYILMADI (kapsam dışı, doğru)
- çıktı: `docs truth: 0 ... | 0 ...`, **CLEAN_EXIT=0**
- kapsam dosyası eksikse: `SCOPE FILE MISSING`, **MISSING_EXIT=2** (sessizce geçmiyor)

## 7. YAPILMAYAN
- Tam `ctest` süiti koşulmadı (sadece `-R '^docs_truth_check$'`). Gerekçe: aynı
  gecede paralel işçiler `engine/build`'ı kullanıyor; tam süit ~130s ve bu kartın
  kanıtı değil. Yeni test hiçbir mevcut hedefe link olmuyor, C++ derlemesine
  dokunmuyor.
- `docs/` ve `README.md` içeriğine DOKUNULMADI (kart yasağı). Yalnız okundu.
- commit ATILMADI.
- `git worktree remove /tmp/f9-before` ile ağaç kaldırıldı.
