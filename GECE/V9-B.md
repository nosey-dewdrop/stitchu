# V9-B — `docs_truth_check` KAPISI (tutanak)

Koşu: 2026-08-25 · ağaç `main` · kapı `engine/tests/docs_truth_check.mjs`
(node, bağımlılık YOK) · taban `engine/tests/docs-truth-baseline.json` ·
ctest adı **`docs_truth_check`** (`engine/CMakeLists.txt` sonu).

**`docs/` ve `README.md`'nin İÇERİĞİ DEĞİŞTİRİLMEDİ.** Kanıt mutasyon log'unun
§3'ünde: `git status --porcelain -- docs/ README.md` → BOŞ. Onarım V9-C/D/E'nin işi.

---

## 1. BUGÜNKÜ SAYILAR (üç alt denetim)

Basan komut: `node engine/tests/docs_truth_check.mjs --no-baseline`
(tam çıktı: `GECE/log/V9-B.red-before.txt`)

| ölçü | bugün | taban dosyasındaki karşılığı |
|---|---|---|
| taranan prose dosya (D1/D2) | **18** | `kapsam.taranan_D1_D2` |
| taranan `.md` (D3) | **7** | `kapsam.taranan_D3` |
| **D1** ham duran-iddia hit'i | **16** | `D1.hamHit` |
| D1 — tırnak/kod-span içinde düşen | **4** | `D1.dusen.tirnak_kod_span` |
| D1 — tarihli ölçüm bağlamında düşen | **3** | `D1.dusen.olcum_baglami_tarihli` |
| D1 — fenced blok içinde düşen | **0** | `D1.dusen.fenced_blok` |
| **D1 GERÇEK ihlal** | **9** | `D1.acikBorc` (eşik 0, 9 kalem kayıtlı borç) |
| **D2** yoklanan yol referansı | **502** | `D2.yoklananHedef` |
| D2 — VAR | **477** | `D2.var` |
| D2 — düşen yanlış-pozitif sınıfı | **16** | `D2.dusenSinif` |
| **D2 GERÇEK ölü** | **9** (7 tekil parmak izi) | `D2.acikBorc` (eşik 0) |
| **D3** sayı+birim taşıyan satır | **133** | `D3.sayisalSatir` |
| **D3 SAĞLAYICISIZ (= taban)** | **52** | `D3.taban` — yalnız DÜŞEBİLİR |

### Eşikler ve nereden geldikleri (§5.1/§7.6 — uydurma sayı YOK)

- **D1/D2 eşiği = 0.** `GECE/V9-R.md` §2: açılan 17 birincil kaynağın hiçbiri
  "N ihlale kadar tolerans" yayınlamıyor; yayınlanan tek eşik **sıfır + açık
  muafiyet**. Bugün açık olan 9+9 kalem bir TOLERANS değil, taban dosyasında
  satır metniyle tek tek yazılı **KAYITLI BORÇ**'tur (Vale `accept.txt` / woke
  `.wokeignore` / Crossplane-Elastic-Grafana pratiği, V9-R §1 D3: yanlış pozitif
  kapıyı gevşetmez, aynı commit'te görünür ve versiyonlanmış listeye girer).
  Listede OLMAYAN her ihlal kırmızıdır. Liste yalnız **küçülebilir**.
- **D3 tabanı = 52**, bugünkü ÖLÇÜM. `vocab_reference_check` emsali: yayınlanmış
  formül yok, bugünün sayısı taban olur; düşüş kapıyı kırmaz ve tabanı
  KENDİLİĞİNDEN güncellemez (`--baseline` ayrı, bilinçli bir commit).
  ⚠ V9-A §1'in uyarısı uygulandı: eşik **iddia cümlesi sayısına** değil
  (o sayı RULES §6 onarımıyla YÜKSELİYOR: 0C 28 → bugün 104),
  **sağlayıcısız cümle sayısına** kondu.
- **Exit kodu ayrık** (lychee emsali, V9-R §1 B3): `0` yeşil · `1` İHLAL ·
  `3` kapının kendi arızası (taban dosyası yok vb.). Eksik yasa asla geçiş değildir.

### İstisna kuralı — ZORUNLU, ve öngörüsü tuttu

V9-A §7: *"istisna olmadan kapı §2B'deki 13 yanlış pozitifin 6'sına ateş eder"*
→ 3 gerçek + 6 = **9**. Kapı bağımsız yazıldı, ölçtüğü D1 = **9**. Aynı şekilde
ham hit 16 = V9-A §2, yol referansı 502 = V9-A §3. Üç sayı da bağımsız tutuyor.

---

## 2. İKİ KANIT LOG'U

| kanıt | yol | özet |
|---|---|---|
| **§4.2 kırmızı** | `GECE/log/V9-B.red-before.txt` | faz-öncesi ONARIMSIZ ağaçta `--no-baseline` → **EXIT 1**, D1 9 + D2 9 + D3 52 ihlal ADIYLA listelendi. Derleme hatası değil. |
| **§4.5 mutasyon** | `GECE/log/V9-B.mutasyon.txt` | temiz ağaç yeşil (exit 0) → D1 mutasyonu (`ALL PASS` + `byte-identical`) exit 1 → D2 mutasyonu (iki olmayan yol) exit 1, ctest'te `docs_truth_check (Failed)` → geçici dosya silindi → exit 0, ctest `Passed`. |

★ **Mutasyon testi kapının kendi kusurunu buldu ve onarttı** (log'un başında yazılı):
ilk denemede D2 mutasyonu YUTULDU, çünkü "üstü çizili / YOK ilan edilmiş hedef"
düşürücüsü kelime sınırsız `/YOK/` kullanıyordu ve enjekte edilen dosya adındaki
**"YOKTUR"**un içine düştü, satırdaki iki ölü yolu birden muaf saydı.
`/\bYOK\b/` yapıldı. Kırılamayan kapı süstür — bu kapı kırıldı.

---

## 3. BİLİNEN ZAAFLAR — NE YAKALAMAZ

1. **Doğruluk değil BİÇİM ölçer.** "Alet adı var" ≠ "sayı o aletten çıktı".
   D3 bir satırda `precision-report.js` görürse geçer; o aletin o sayıyı
   basıp basmadığını doğrulamaz. V9-R §4 md.1'in birinci sıraya koyduğu POZİTİF
   taraf (Cog `--check`: sayıyı elle yazma, ALETLE ÜRET) bu kapıda **YOK** —
   burada yalnız ikinci savunma hattı kuruldu.
2. **`yok` düşürücüsü yanlış düşürebiliyor, ÖLÇÜLDÜ.** `docs/H1.0-KAPI.md:162`'nin
   ölü `reports/2026-07-29-endustri-arastirmasi.md` referansı (V9-A §3B'nin
   gerçek ölüsü) kapıdan DÜŞTÜ, çünkü aynı satırda *"Armhole ÇEVRESİ Aldrich'te
   yok"* geçiyor ve oradaki "yok" başka bir şey için. **Kapı bu gerçek ölüyü
   kaçırıyor.**
3. **Türkçe çekim eki.** `bitti` kalıbı "bittiğinde"ye de ateş ediyor
   (`docs/H1.0-KAPI.md:16`, V9-A §2B'nin yanlış pozitifi). Tırnak içinde
   değilse borç listesine giriyor. Kart kalıp listesini isim isim verdiği için
   gevşetilmedi.
4. **Basename çözücü zaafı DEVRALINDI** (V9-A §8): `print-info.pdf` gibi yalın
   bir ad repoda HERHANGİ bir yerde bulunursa VAR sayılır; hangi paketin olduğu
   doğrulanmaz. D2'nin VAR sayısını (477) yukarı yanlı yapar.
5. **`engine/`-göreli çözüm VAR sayısını 468 → 477 çıkardı** (V9-A §3C(i)'nin
   9 çözücü artefaktı kapandı). Ama aynı gevşeklik, gerçekten `engine/` dışında
   kastedilen bir yolu yanlışlıkla VAR sayabilir.
6. **D2 parmak izi satır numarası taşımaz** (`dosya|hedef`). Bu yüzden aynı
   dosyadaki aynı ölü hedefin İKİ satırı tek borç kalemi sayılır (9 ihlal →
   7 tekil kalem). Kasıtlı: satır kayması kapıyı kırmasın diye.
7. **Kapsam `docs/` + `README.md`.** `web/` (V10'un işi), `contract/`,
   `knowledge/`, `engine/*.md` (ör. `engine/FORMULAS.md:1104`'teki 70,200)
   TARANMIYOR.
8. `docs/archive/tools/*.mjs|*.js` kapsam dışı (kart hükmü; JS template literal).

---

## 4. V9-A İLE AYRIŞAN 4 KALEM (gizlenmedi)

| kalem | V9-A hükmü | kapının hükmü | sebep |
|---|---|---|---|
| `SATIS:29 benchmark-58/dress_patterns/` | §3C(ii) dürüst yokluk | **İHLAL** | yokluk ilanı o maddede değil, `:277`'de |
| `SATIS:226` + `:240 print-svg/a4-page5.svg` | §3C(iii) koşu-göreli artefakt | **İHLAL** (2) | kart bu sınıfı düşürülecekler arasında saymıyor |
| `H1.0:162 reports/2026-07-29-…md` | §3B gerçek ölü | **DÜŞTÜ** | satırdaki "yok" başka şey için → zaaf 2 |

Net: V9-A 7 gerçek ölü sayıyor, kapı 9 sayıyor; üçü fazladan, biri eksik.

---

## 5. YAPILAMAYAN / YARGILANMAYAN

- **Cog-sınıfı pozitif taraf kurulmadı** (V9-R §4 md.1). Kapı iddiayı ÜRETMİYOR,
  yalnız yasaklıyor + hedefi yokluyor + sağlayıcı arıyor.
- **52 sağlayıcısız satırın hiçbiri tek tek yargılanmadı** — hangisinin gerçekten
  yanlış, hangisinin sadece alet adı eksik olduğu ölçülmedi. D3 bir RATCHET'tir,
  bir doğruluk hükmü değil.
- **Docs'un iddia ettiği hiçbir sayı bu kartta yeniden ÜRETİLMEDİ**
  (70,200 · 19,555 · 27/54 · 86% · 143/238mm). Kart kapı kurar, ölçüm koşturmaz.
- `GECE/arsiv/`, `KOSU.md`, diğer kartlar **AÇILMADI**.

---

## 6. KART DIŞI FARK EDİLEN

1. **`docs/ARCHITECTURE.md:249` → `engine/SPECS-next-vocabulary.md` diskte YOK**
   ve satır *"review before building"* diyor: gözden geçirilecek dosya yok.
   V9-A §3A'da da vardı, kapanmadı.
2. **Markdown'da "kapsayıcı paragraf" FAZLA GENİŞ, ölçüldü.** İlk uygulamada
   boş-satır bloğu kullanıldı; `docs/ARCHITECTURE.md`'nin "Known limits" madde
   listesi tek blok olduğu için bir maddedeki "YOK" bütün listeyi muaf kıldı ve
   `:249` kapıdan kaçtı. Kapsayıcı MADDE'ye (satır + sarma satırları, tablo
   satırı tek başına) indirildi; D3 aynı düzeltmeyle 37 → **52** çıktı.
   Yani gevşek kapsayıcı D3'ün 15 ihlalini de yutuyormuş.
3. **`docs/SATIS-SARTNAMESI.md` D1+D2 borcunun ağırlığını taşıyor:** 9 D1
   ihlalinin 2'si, 9 D2 ihlalinin 4'ü onda. V9-A §9 md.5 ile aynı yön.
4. Taban dosyası ihlal satırlarının METNİNİ taşıyor. Bu, V9-C/D/E onarım
   yapınca kalemin parmak izinin tutmamasına ve kapının `KAPANDI` satırı
   basmasına yol açar — düşüş kapıyı kırmaz, ama taban elle yeniden kesilmelidir.
