# V1 — ALTI KIRMIZI, SINIF HÜKMÜ (tarafsız hakem, 2026-08-24)

Hakem niyet görmedi, brief okumadı (`GECE-KOSUSU-v6.md` ve `GECE/KOSU.md` açılmadı).
Okunanlar: `RULES.md`, `GECE/V0-0F.md`, `GECE/log/V0-0F.aday.txt`,
`GECE/log/V0-SEF.ctest.txt`, altı kapının KAYNAK dosyaları, ilgili pin/veri dosyaları.
Altı kırmızının hepsi bu oturumda YENİDEN KOŞTURULDU.

Sınıflar:
- **(a) GERİLEME** — motor eskiden doğru olanı bozdu; pin haklı, kod haksız.
- **(b) BİLİNÇLİ BAYAT PİN** — kod kasten ve gerekçeli değişti; pin geride kaldı, kod haklı.
- **(c) KAYNAK/KARAR EKSİĞİ** — kapı bir yayın ya da bir insan kararı bekliyor.

Devralınan kırmızı seti doğrulandı: `GECE/log/V0-SEF.ctest.txt:453` →
`94% tests passed, 6 tests failed out of 105`; adlar `:461-466`.

---

## 1. `golden_check` — SINIF (b) BİLİNÇLİ BAYAT PİN

**Gerekçe (tek cümle):** Scye derinliğini kaynaksız `backLengthCM` kolonundan Aldrich
p.11'in büst-bağlı yayınlanmış iki noktasına taşıyan `52ae85c` bunu commit gövdesinde
AÇIKÇA ilan etti ve bağımsız bir tanıkla (sloper_check) doğrulattı; geride kalan
`engine/golden-reference.csv`.

**Dayanak — yeniden koşturuldu:**
```
$ engine/tests/golden_check.sh engine/build/golden_dump engine/golden-reference.csv engine/GOLDEN-PIN.md
golden_check FAIL: engine output differs from the REPO PIN (engine/golden-reference.csv).
  dump: 23406 lines   pin: 23406 lines
< EU38|dress/crew/aLine/none.short|piece0:Bodice Front,outline,3,curve,244.2000,219.4004,212.2411,66.8624,213.4501,181.5164
> EU38|dress/crew/aLine/none.short|piece0:Bodice Front,outline,3,curve,244.2000,225.0000,245.0965,81.4390,164.9867,185.5956
```
Satır sayısı eşit (23406 = 23406) → parça eklenmedi/silinmedi, değişen ÇİZİM.

**Dayanak — ilan yazılı:** `git log -1 --format=%B 52ae85c`, son paragraf:
> `golden_check + recipe_dress_check: çizim değişti, pin/DSL aynası bayat;`
> `reçete DSL'i kapalı form istiyor, çözücüyü ifade edemiyor.`

Aynı gövde (b) maddesi: *"backLengthCM EU44→46'da duruyordu... Kaynaksız kolon terk
edildi: scye derinliği artık Aldrich p.11'in BUST'a bağlı iki noktasından (21.0cm@88,
21.4cm@92, dosyadan doğrulandı): depth = 0.10*bust + 122"*. Kod tarafındaki gerekçe
`engine/src/bodice.hpp:96-114` (satır 96 eski sabiti `LEGACY` diye işaretliyor,
97-112 kaynağı ve çerçeve düzeltmesini yazıyor, 113-114 yeni sabitler).

**Dayanak — kodun haklılığı bağımsız tanıkla:** commit gövdesi *"sloper_check'in
temmuzda pinlenmiş el çizimi, scye depth 189.0 → 210.0mm (Aldrich 215, sapma −5.0mm)
— KIRMIZIYDI, YEŞİL"* diyor. Bugün koşuldu:
```
$ ctest --test-dir engine/build -R '^(sloper_check|garment_armhole_check|recipe_dress_golden_check)$'
100% tests passed, 0 tests failed out of 3
```
Motordan türetilmemiş, temmuzda pinlenmiş el çizimi yeni sayıyı onaylıyor → pin haklı değil, kod haklı.

**(b) ŞARTI — repoda yazılı mı, nerede, makine mi insan mı?**
Yazılı, üç yerde ve üçü aynı şeyi söylüyor:
- `engine/tests/golden_check.sh:28-32` — *"2. INTENDED behavior change → DECLARED re-pin:
  run scripts/repin-golden.sh with a declaration label, add the ledger entry, and get
  Damla's approval BEFORE pinning."*
- `engine/GOLDEN-PIN.md:3-7` — *"Every re-pin ... is DECLARED here. A re-pin without a
  ledger entry is invalid ... (Damla approval required for behavior changes)."*
- `scripts/repin-golden.sh:33-38` — *"NOW REQUIRED (the pin is not valid without these):
  1. ledger entry ... 2. Damla's explicit approval for the behavior change. 3. commit the
  csv + ledger together."*

**Şartın türü: İNSAN ONAYI.** Makine kısmı (script + bayt kıyası + defter satırı) vardır
ama kapıyı açan bileşen değildir; `repin-golden.sh` etiketsiz koşmayı reddeder (satır
11-15) ve geçerlilik açıkça Damla'nın onayına bağlanmıştır. Emsal: `GOLDEN-PIN.md:11`
2026-07-28 pini bugün hâlâ **"(DAMLA APPROVAL PENDING)"** yazıyor — yani bugünkü pin
bile beklemede olan bir pindir.

**V0-0F İLE ÇELİŞİYORUM.** `GECE/V0-0F.md:50` şöyle diyor: *"Pin bayat değil — **motor
ilan edilmemiş bir davranış değişikliği yaptı**."* Bu yanlıştır ve kanıtı commit'in
kendi gövdesindedir: `52ae85c` son paragrafı **"pin/DSL aynası bayat"** cümlesiyle
değişikliği ismen ilan ediyor, hangi iki kapının kırmızıya döneceğini önceden yazıyor,
ve gerekçesini yayınlanmış bir kaynağa (Aldrich p.11) bağlıyor. V0-0F kök satırı doğru
buldu ama commit mesajını okumadan "ilan edilmemiş" dedi; V0-0F'in kendi özet tablosu
(`:105`) da bu yüzden yanlış sınıflandı. Doğru sınıf **(b)**.

---

## 2. `recipe_dress_check` — SINIF (b) BİLİNÇLİ BAYAT PİN

**Gerekçe:** Aynı `52ae85c` reçete DSL'inin de geride kaldığını ismen ilan etti; reçete
dosyası hâlâ terk edilmiş formülü taşıyor (`recipes/shift-dress-square-spaghetti.json:46`
→ `"torsoArmholeY": "backLengthMM * armholeDepthFactor + shoulderDrop"`), motor onu
`bodice.hpp:96`'da `LEGACY` diye işaretleyip bıraktı.

**Dayanak — yeniden koşturuldu:**
```
$ ctest --test-dir engine/build -R '^(golden_check|recipe_dress_check)$' --output-on-failure
recipe_dress_check: FAILURES
0% tests passed, 2 tests failed out of 2
```

**Dayanak — "ikinci hat bayat"ın bu hakem tarafından bulunan bağımsız kanıtı:**
`recipe_dress_golden_check` **YEŞİL** (`GECE/log/V0-SEF.ctest.txt:330`; bugün de yeşil,
yukarıdaki 3/3 koşusunda). O test reçete hattının çıktısını **pinin alt kümesine** bayt
bayt diff'ler (`engine/tests/recipe_dress_golden_check.sh:26-33`). Yani reçete hattı ile
28 Tem pini BİRBİRİYLE hâlâ birebir aynı; ikisinden ayrılan tek taraf motordur. Bu, V0-0F'in
"tek kök" tespitini doğruluyor ve "kod haklı, ayna bayat" yönünü kanıtlıyor.

**Dayanak — sapmanın büyüklüğü** (V0-0F A4, `GECE/log/V0-0F.aday.txt:177-217`):
EU38 `Top Front` outline[4] 48.4634 mm, grainline 5.5996 mm; `Spaghetti Strap` her yerde
0.0000 mm.

**(b) ŞARTI — repoda yazılı mı, nerede, makine mi insan mı?**
Yazılı: `engine/tests/recipe_dress_golden_check.sh:40-43` —
> *"The pin does not move for this test. Fix the interpreter or the recipe document until
> the recipe path reproduces the PINNED motor output; formulas are read FROM
> bodice.cpp/garment.cpp, never adjusted to force bytes (RECETE-SPEC §2.1/§6)."*

**Şartın türü: MAKİNE ŞARTI** (bayt paritesi), ama zincirli: reçete "pinli motor
çıktısını" üretmek zorunda olduğu için, pin taşınana kadar (yani #1'deki İNSAN ONAYI
gelene kadar) reçeteyi düzeltmek bu kapıyı kapatır, öbürünü açar. Ayrıca makine şartının
tamamı bu gece bile ulaşılabilir değil: V0-0F ölçtü ki formül satırı taşınınca FAIL 10→9
(`GECE/log/V0-0F.aday.txt:308-328`) ve kalan 9'un tamamı `geometry DIFFERS` — çünkü oyuk
artık ölçülen yay/kiriş oranına **iteratif çözülüyor** ve DSL'de çözücü yok. Bu son parça
mühür yenileme değil, mühendislik işidir.

**V0-0F ile:** kök teşhiste ÇELİŞMİYORUM; sınıf adlandırmasında yine "ilan edilmemiş"
nitelemesini reddediyorum (kanıt yukarıda, commit gövdesi bu kapıyı da ismen sayıyor).

---

## 3. `style_check` — SINIF (c) KAYNAK/KARAR EKSİĞİ

**Gerekçe:** Kapının yargılayacağı pin dizini hiç yok ve pini üretmenin repoda yazılı tek
yolu Damla'nın terminale elle yazdığı onay cümlesidir — ne kod ne pin hatalı, karar yok.

**Dayanak — yeniden koşturuldu:**
```
$ node engine/tests/style_check.mjs
style_check FAIL: pinlenmiş stil 0 — .../engine/STYLE-PIN yok/boş.
  Bu kapı bugüne kadar YEŞİL basıyordu ve hiçbir kalemi tutmuyordu (T17).
```
`engine/tests/style_check.mjs:15` (`PIN_DIR = engine/STYLE-PIN`), `:18-20` (dizin yoksa
pin listesi boş), `:22-29` (yorumda: pin'i bu test kendi çıktısından ÜRETEMEZ =
regen-vs-regen), `:30-42` (sıfır pin → FAIL, sessiz skip yasak).

**Kararın kanalı yazılı:** `scripts/repin-style.sh:121-136` —
> *"Onay bir bayrakla, bir ortam değişkeniyle ya da bir --yes ile verilemez: tek kanal,
> terminale ELLE yazılan cümledir."* ve `if [ ! -t 0 ]` → *"FAIL: onay yalnız TERMİNALDEN
> alınır (stdin bir tty değil). Pin bir ÖLÇÜM değil bir KARARDIR; script/CI/ajan
> onaylayamaz."*

Bitiş şartı da sayılı: `scripts/repin-style.sh:59,170-171` — 31 stilin **hepsi**
pinlenince yeşile döner.

**V0-0F ile ÇELİŞMİYORUM** (`GECE/V0-0F.md:110` "karar eksiği"). Bu hakem ayrıca doğruladı:
`ls -ld engine/STYLE-PIN` diskte yok, ve `style_check`'in pinli hâli bu koşuda da
ÖLÇÜLMEDİ (pin üretilemez).

---

## 4. `sizechart_source_check` — SINIF (c) KAYNAK/KARAR EKSİĞİ

**Gerekçe:** Yedi kolonun dördü (`shoulderCM`, `backLengthCM`, `armLengthCM`, `neckCM`)
`status: NONE` taşıyor — bu bir kusur değil, arkasında yayın OLMADIĞININ dürüst beyanı;
kapı bir yayın bekliyor.

**Dayanak — yeniden koşturuldu:**
```
$ node engine/tests/sizechart_source_check.mjs
euSizeChart: 7 columns x 10 sizes = 70 numbers on a buyer's body
  sourced (verified against a publication): 3 -> bustCM, waistCM, hipCM
  UNSOURCED (verified absence, declared):   4 -> shoulderCM, backLengthCM, armLengthCM, neckCM
FAIL: column 'shoulderCM' is UNSOURCED (status NONE) — 10 published values with no publication behind them
... (4 kolon)
mutation probes: 7/7 moved the verdict
sizechart source gate FAILED (4)
```
⚠ Not: bugün mutasyon sondaları **7/7** yeşil; V0-0F'in A8'de 6/7'ye düşürdüğü sonda,
uydurma kaynağın yazıldığı doktorlanmış kopyaya aitti, ana ağaçta değil.

`engine/tests/sizechart_source_check.mjs:24-27` kapının bilerek kırmızı doğduğunu,
`:29-34` bitiş şartını yazıyor: *"each remaining column is either (a) matched to a
published table ... or (b) REPLACED by Damla with numbers from a named source. An agent
may not close it by editing the chart."* Kuyruk kaydı: `DAMLA-KUYRUK.md:49` (K10).

**V0-0F ile ÇELİŞMİYORUM** (`:109` "kaynak eksiği, bilerek kırmızı").

---

## 5. `contract_check` — SINIF (c) KAYNAK/KARAR EKSİĞİ

**Gerekçe:** Kapı bir gizlilik kazası değil, Damla'nın 17.08'de verdiği ve bedeli görünür
tutulan bir kararı sayıyor; kapanışı ölçümün değil, o kararın değişmesinin işi.

**Dayanak — yeniden koşturuldu:**
```
$ node engine/tools/validate-contract.mjs
FAIL: DECLARED DECISION (not a breach) — 'patterns_real/' has 41 TRACKED file(s) in git: ...
contract validation FAILED (1)
```
Etiketi basan kod `engine/tools/validate-contract.mjs:160-164` (`ilan_edilmis_karar` alanı
varsa "DECLARED DECISION", yoksa "BREACHED"). Kararın metni `contract/gizlilik.json:9`:
> *"Yesile donmesi olcumun degil Damla'nin karari degismesinin isi (K1)."*

Kuyruk kaydı `DAMLA-KUYRUK.md:40` (K1, **ACİL**). Ne kod hatalı (kapı doğru şeyi sayıyor:
takipli telifli dosya, hedef 0), ne pin hatalı (pin yok).

**V0-0F ile — sınıf adı farkı, çelişki değil:** `GECE/V0-0F.md:107` bunu *"ilan edilmiş
bedel"* diye adlandırıyor. Bu, bu hakemin üç sınıfından biri değil; bir insan kararına
bağlı olduğu için (c)'ye düşer. Teşhiste anlaşmazlık yok.

---

## 6. `figure_check` — SINIF (c) KAYNAK/KARAR EKSİĞİ

**Gerekçe:** Kırmızı, bir bandın ihlali değil, `dress_bandeau_circle` için ortada
DEVRALINACAK KARDEŞ PİN OLMAMASI; kendi ölçtüğü 0.872'yi pinlemek dosyanın kendi
regen-vs-regen yasağı, açılışı bir siluet/insan kararı.

**Dayanak — yeniden koşturuldu:**
```
$ node engine/tools/figure-lint.mjs
  FAIL dress_bandeau_circle             waist/bust 0.872  FAIL tabansız — figure-bands mandal.taban_v3'te pin yok, hükümsüz
figure-lint: 1 FAILURE(S)
```
Hüküm cümlesi "banttan çıktı" demiyor, **"tabansız ... hükümsüz"** diyor.

`contract/figure-bands.json:126` (`_taban_v3_pinsiz_kalan`) şartı kendi yazıyor: tek
"top: band" pinli kardeş `drawstring_babydoll` 0.858 ölçüyor/0.856 pinli, fark 0.016 =
toleransın %80'i, üstelik sınıf ortaklığı yok → devralınamaz; ve *"Kendi ölçtüğü 0.872'yi
pinlemek gate'in kendi yasağı (regen-vs-regen)"*. Aynı satırın sonu: *"Kapı DOĞRU şeyi
yakalıyor; kapanışı silüet kararı, pin kararı değil."*
Onay kanalı: `contract/figure-bands.json:138` (`_donma`) — *"bant Damla onayı olmadan
genişletilemez."*

**V0-0F ile ÇELİŞMİYORUM** (`:108` "kaynak eksiği (pinlenecek kardeş yok)").

---

## ÖZET TABLO

| kırmızı | SINIF | tek cümle |
|---|---|---|
| `golden_check` | **(b)** | `52ae85c` scye derinliğini Aldrich p.11'e kaynakladı, kırmızıyı commit gövdesinde ilan etti, bağımsız `sloper_check` tanığı yeşil; pin 28 Tem'de kaldı. |
| `recipe_dress_check` | **(b)** | Aynı commit reçete aynasının bayatladığını ismen ilan etti; `recipe_dress_golden_check`'in hâlâ yeşil olması reçete+pin ikilisinin aynı bayat hatta durduğunu kanıtlıyor. |
| `style_check` | **(c)** | `engine/STYLE-PIN` yok ve pini yalnız Damla'nın terminale yazdığı onay cümlesi doğurabilir. |
| `sizechart_source_check` | **(c)** | 4 kolon `status: NONE`; kapı bir YAYIN bekliyor, ajan çizelgeyi düzenleyerek kapatamaz. |
| `contract_check` | **(c)** | 41 takipli telifli dosya, ilan edilmiş Damla kararının bedeli; kapanışı K1 kararının değişmesi. |
| `figure_check` | **(c)** | `dress_bandeau_circle` için devralınacak kardeş pin yok; kendi ölçümünü pinlemek regen-vs-regen. |

**İki (b), dört (c), sıfır (a).** Altı kırmızının hiçbiri bu hakemin ölçümünde bir
GERİLEME değildir: motorun eskiden doğru olup şimdi bozduğu bir davranış bulunamadı.

---

## BULDUĞUM AMA SORULMAYAN (döküm — cevap-şekilli olmak zorunda değil)

1. **`41` vs `49` çelişkisi ÇÖZÜLDÜ** (V0-0F `:70` "uzlaştırılmadı" diye bırakmıştı).
   `contract/gizlilik.json:9` ve `:43` prozası "49" diyor, canlı sayım 41. Fark tam 8
   dosya ve commit'i bulundu: `2f748db` ("move stitchu reports into a single corpus dump,
   drop the duplicates from the repo") `patterns_real`'dan **8 dosya sildi**:
   `BUGRA-DEFTER.md`, üç `PLEASE READ` txt, `geometry/geometry-full.json`,
   `geometry/ring-trace-locket-front-38.json`, `geometry/seamgraph.json`,
   `tools/bugra-geometry-2026-07-23.json`.
   ⚠ **Bu silinenler telifli PDF değil, BİZİM ÖLÇÜM ÜRETİMİMİZDİ.** `CLAUDE.md`
   `geometry-full.json`'u "PDF VEKTÖR, mm-kalibre" birincil kaynak ilan ediyor ve
   `seamgraph.json` K1 armhole bandının üreticisi. Yani gizlilik sayısı düşerken düşen
   şey telif değil, kanıt hattıydı. Bu bir hüküm değil, bir uyarıdır — kimsenin bunu
   kastettiği **DOĞRULANMADI**.

2. **`GOLDEN-PIN.md:11` — yürürlükteki pin zaten onaysız.** 2026-07-28 girdisi
   *"(DAMLA APPROVAL PENDING)"* ve *"NOT committed until approved"* diyor, ama csv
   ağaçta ve commitli. Yani golden mührü bugün kırmızı olmasaydı bile defteriyle
   tutarsız durumdaydı.

3. **`sizechart_source_check` mutasyon sondaları ana ağaçta 7/7** (bugün ölçüldü).
   V0-0F `:88`'de kapının zayıflığı olarak yazılan 6/7, doktorlanmış kopyanın sayısıdır.
   Kapının gerçek zayıflığı gözlemi yine de ayakta: `judge()` (`:51-88`) url'in
   ERİŞİLEBİLİR olduğunu değil, `_sources`'ın kendisiyle tutarlı olduğunu ölçüyor —
   `https://example.invalid/...` biçimsel testi geçer (`:71` sadece `^https?://` bakıyor).

4. **`h10_gate_check` ctest'te DISABLED** (`GECE/log/V0-SEF.ctest.txt:458`), yani 105
   testin 104'ü koştu. Devralınan kırmızı seti bu yüzden 6; devre dışı bırakılma gerekçesi
   `52ae85c` gövdesinde yazılı (yargıladığı `surfacepattern` `engine/src`'den sıfır kez
   include ediliyor). Bu hakem o iddiayı **DOĞRULAMADI**.

5. **`52ae85c` kendi açtığı üçüncü kırmızıyı da ilan etmiş:** `engine_check` +
   `sewable_census` 82980 draftın 30'unda `sideseam` 3.0mm (tavan 3.0), hepsi `pear`.
   Bugün ctest'te `engine_check` kırmızı DEĞİL — yani ya sonraki 4 commit kapattı ya da
   sınırda geçiyor. **ÖLÇÜLMEDİ.**

6. **Ölçmediklerim:** motoru `a571407`'ye döndürme adayını yeniden koşturmadım (V0-0F A3'e
   dayanmadım da — hükümlerim o ayrımdan bağımsız); `52ae85c` sonrası 4 commit'in
   golden'a katkısı hâlâ commit-commit ayrıştırılmadı (V0-0F `:119-123`); `style_check`'in
   pinli hâli koşturulamadı; `figure_check`'in ardındaki "strapless gövdede büst
   gelişmiyor, 50.70 vs 69.55mm" iddiası (`figure-bands.json:126`) bu hakem tarafından
   **DOĞRULANMADI** — doğruysa orada (c)'nin altında ayrıca bir gerçek siluet kusuru
   duruyor demektir.
