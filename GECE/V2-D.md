# V2-D — COMMIT SONRASI DOĞAN İKİ YENİ KIRMIZI (3/3)

Koşu: 2026-08-24. Kart: `GECE/KART/V2-D-iki-yeni-kirmizi.md`. Etiket SIRALI (3/3).

**İki kapı da KAPANDI.** Commit'ten SONRA koşulan tam ctest'te kırmızı AD kümesi
tam olarak dört: `style_check` · `sizechart_source_check` · `contract_check` ·
`figure_check`. Log: `GECE/log/V2-D.ctest.after.txt`.

Commit'ler:
| commit | ne |
|---|---|
| `aa55a60` | glue'ya kaynak damgası (`build-wasm.sh`) + `?v` bump'ı |
| `9487091` | sevk edilen `.wasm`'a aynı damga (custom section) |
| `e2f7aba` | sözlük ratchet tabanı `9487091`'de yeniden kesildi |
| `f0c1398` | `?v` bump'ı GERİ ALINDI (yeni kırmızı doğurdu, RULES 9) |

---

## 1. `bundle_fresh_check` — KÖK, KARTIN ANLATTIĞINDAN GENİŞ ÇIKTI

Kartın teşhisi doğru ama EKSİK: sınıf yalnız glue değil, **sevk edilen üç
kalemin üçü de**. Kapı, izlediği kaynaklar (`engine/src`, `engine/wasm`,
`engine/build-wasm.sh`) daha yeni commit'liyken artefaktın commit tarihini
geride bulursa kırmızı düşer; git ise **baytı değişmeyen dosyayı commit'leyemez**.
Yani derleyici çıktısı aynı kalan HER kaynak değişikliği o artefaktı kalıcı
kırmızıya kilitler.

Ölçüldü, iki ayrı vaka:

1. `5d649d2` — `bindings.cpp` + `bodice.cpp` değişti, `.wasm` değişti,
   **glue bayt-aynı** → glue kırmızı. (Kartın anlattığı vaka.)
2. `aa55a60` — `build-wasm.sh` değişti (o da izlenen bir KAYNAK), tek bir
   derleyici bayrağı değişmediği için **`.wasm` bayt-aynı** → `.wasm` kırmızı.
   Bu vakayı kartın adayı kapatmıyordu; ölçüm sırasında ortaya çıktı ve
   `9487091`'de kapatıldı.

### 1.1 Onarım — damga, "üreten commit" DEĞİL, KAYNAK ÖZETİ

Kartın adayı "üreten commit + tarih" idi. **Ölçülmüş gerekçeyle sapıldı:**

- Commit sha'sı ancak build, kaynak commit'inden SONRA koşarsa doğrudur. Normal
  sıra (düzenle → derle → tek commit) kirli ağaçta derler, HEAD hâlâ eski
  commit'tir, damga aynı çıkar ve kapı **yine kırmızı kalır** — onarılmak istenen
  kusurun ta kendisi.
- Tarih koymak yapıyı **belirlenimsiz** yapar: kaynak değişmeden yapılan her
  yeniden derleme sahte bir diff üretir.
- Kaynak ÖZETİ ikisini de çözer: glue'nun baytı, kapının izlediği kaynakların
  bir FONKSİYONU olur. Aynı kaynak → aynı bayt (belirlenimli, ölçüldü: mutasyon
  geri alınıp yeniden derlendiğinde üç artefakt da commit'li baytla bayt-aynı).

Damga = `engine/src` + `engine/wasm` + `engine/build-wasm.sh` altındaki her
dosyanın sha256'sının sha256'sı, ilk 16 hane. Bugünkü değer `ecdb56421eadd2a2`.

- **glue (2 dosya):** 1. satıra tek JS yorumu. Çalışmaya dokunmuyor.
- **`.wasm`:** ikili dosyanın yorum satırı yok, ama wasm formatının
  **CUSTOM SECTION**'ı (id 0) var — spec-legal, her runtime tarafından yok
  sayılır, `name`/`producers` bölümleri de tam olarak budur. `stitchu.source-stamp`
  adlı tek bir custom section ekleniyor (saf `python3`, yeni bağımlılık yok).
  Doğrulandı: `WebAssembly.compile` OK, `WebAssembly.Module.customSections`
  damgayı geri okuyor.

**Sevk edilen motor baytı DEĞİŞMEDİ** (`GECE/log/V2-D.engine-bytes.txt`):
`5d649d2:web/vendor/stitchu-engine.js` ile bugünkü dosyanın 1. satırı atılmış
hâli aynı sha256 → `fe570bae…0887`.

### 1.2 Mutasyon (4.5) — `GECE/log/V2-D.mutasyon.txt`

| mutant | ne yapıldı | kapı |
|---|---|---|
| M1 | `engine/src/bodice.cpp`'ye yorum satırı + commit, **build-wasm.sh koşulmadı** | **KIRMIZI** — üç artefakt da "STALE BY 1 COMMITS" |
| M1 geri | `git reset --hard HEAD~1` | **YEŞİL** |
| M2 | aynı yorum + **build-wasm.sh koşuldu** | derleyici çıktısı (`dist/`) `.js` ve `.wasm` olarak **bayt-aynı** (`73fd03c7…`, `f9cc3dcb…`), **damgalı sevk kalemleri DEĞİŞTİ** (`b13e28b6…`→`52181875…`, `90d6f448…`→`3a2a066b…`) |
| M2 geri | kaynak geri + yeniden derleme | üç artefakt da commit'li baytla **bayt-aynı**, `git status` boş |

M2 kartın istediğinden fazlası ve asıl kanıt: **damga olmasaydı yeniden derleme
bile kapıyı açamazdı**, çünkü derleyici aynı baytı basıyor.

---

## 2. `vocab_reference_check` — (a) YOLU SEÇİLDİ, TABAN YENİDEN KESİLDİ

Kartın verdiği iki yoldan **(a)** seçildi. Gerekçe ölçüldü.

**Delta doğrulandı** (`GECE/log/V2-D.vocab.delta.txt`, komut kapının kendi eksen
grep'i: `git grep -In -w sleeveCap <rev> -- <kapsam>`):

```
b799748  engine/wasm/bindings.cpp  2 satır   :73 sleeveCapFrom yardımcısı · :147 çağrı
9487091  engine/wasm/bindings.cpp  4 satır   :125 YORUM · :131 YORUM · :193+:194 çağrı
```

Kelimeyi taşıyan 40 dosyanın diğer 39'unda sayı **birebir aynı**. Kod tarafı net
sıfır (`sleeveCapFrom` öldü −1, çağrı bir satırdan ikiye çıktı +1); **+2'nin
tamamı iki yorum satırı** — V2-C'nin onardığı sessiz ikame kusurunu ölçülmüş
örneğiyle anlatan satırlar.

**Sözlük büyümedi:** `git diff b799748..HEAD -- engine/vocab.json` boş,
37 eksen / 132 değer.

**Neden (b) değil:** (b) o iki yorumu silmek demek, yani sınırı okuyan kişinin
bakacağı tek yerden ölçülmüş bir örneği silmek. Ratchet menü büyümesin diye var,
onarılan kusur yazılmasın diye değil.

**Yeni taban** (`e2f7aba`, gerekçe commit mesajında satır satır):
```
eski: b799748  toplam 10416  eksen ADI 7575  enum DEĞERİ 2841
yeni: 9487091  toplam 10418  eksen ADI 7577  enum DEĞERİ 2841
kımıldayan tek anahtar: sleeveCap 144 -> 146
```
Kapının sayım yöntemine, kapsamına, filtresine **DOKUNULMADI** (7.1).

⚠ `--baseline` `_yasa` metnini betikten yeniden üretiyor; bu yeniden kesmenin
gerekçesi bu yüzden taban dosyasına elle yazılmadı (bir sonraki `--baseline`
onu sessizce silerdi), commit mesajına ve bu dosyaya yazıldı.

---

## 3. `?v` DAMGASI — YAPILDI, ÖLÇÜLDÜ, **GERİ ALINDI** (RULES 9)

Kartın ⚠ kalemi: `web/vendor/stitchu-engine.js` yeni baytla değişti,
`web/js/engine.js:56` hâlâ `?v=136`.

`site-version.mjs` ÖNCE okundu (§7.5). Söylediği: sürüm ayrı bir dosyada
tutulmuyor, **`web/` KENDİSİ kayıttır** ve `web/` tek bir değerde anlaşmak
zorundadır (aksi hâlde `siteVersion()` fırlatır). Yani "yalnız `engine.js`'i
bump'la" **yapılamaz**: ölçüldü, `?v` taşıyan **137 dosyada 488 kalem** var ve
hepsi `136`. Desen yeniden icat edilmedi, mevcut desen (`web/` genelinde tek
değer) uygulandı: 136 → 137, `siteVersion()` → `137`.

**Sonra ölçüldü ve geri alındı.** `9487091`'de koşulan tam ctest:

```
4 - generated_ratchet_check (Failed)      <- YENİ AD, miras kümede yok
generated_ratchet_check: 57 declared paths, 57 on disk
  bytes moved: 54 · declared-but-missing: 0 · undeclared: 0
```

`?v` taşıyan 137 dosyanın **54'ü ÜRETİLMİŞ** dosya ve sha256'ları bir manifest'te
ilan edilmiş; elle bump onların baytını ilan edilen sha kımıldamadan oynatıyor.
RULES 9: yeni kırmızı ad doğuran değişiklik push edilmez, **geri alınır**.
`f0c1398` ile geri alındı — `web/`, `web/vendor` dışında `5d649d2` ile bayt-aynı
(`git diff --stat 5d649d2 -- web ':!web/vendor'` boş), `web/` yine tek değer
taşıyor (136), `generated_ratchet_check` yeşil.

**Kusur DURUYOR ve kapatılmadı.** Doğru kanal, 54 üretilmiş dosyayı
üreteçlerinden geçirip manifest'i AYNI commit'e koymaktır; bu kartın çıktı
listesinde o yol yok. 4.7 formatında §5'te.

---

## 4. ZORUNLU KANIT

| # | kanıt | komut | sonuç | log |
|---|---|---|---|---|
| 1 | **TAM ctest, COMMIT'TEN SONRA** (HEAD `f0c1398`, ağaç temiz) | `ctest --test-dir engine/build --output-on-failure` | `96% tests passed, 4 tests failed out of 108` — `style_check`·`sizechart_source_check`·`contract_check`·`figure_check`. `bundle_fresh_check` **Passed**, `vocab_reference_check` **Passed**, `generated_ratchet_check` **Passed**, `golden_check` **Passed** | `GECE/log/V2-D.ctest.after.txt` |
| 2 | mutasyon M1+M2 | §1.2 | M1 kırmızı/geri yeşil · M2 damganın gerekliliğini bayt olarak gösteriyor | `GECE/log/V2-D.mutasyon.txt` |
| 3 | wasm build | `./engine/build-wasm.sh` | **exit=0** | `GECE/log/V2-D.build-wasm.txt` |
| 4 | taban bantları | `node engine/tools/wasm-baseline.mjs` | parite **1.0000e-4 mm** (tavan 1e-4) OK · **gecikme İKİ BANT DA AŞILDI**, §5.1 | `GECE/log/V2-D.baseline.txt` |
| 5 | çalışma ağacı | `git status --porcelain` | yalnız `patterns_real/` altındaki 3 takipsiz yol (telifli, dokunulmadı) | rapor |

### 4.1 Kapı çıktıları

```
$ bash engine/tests/bundle_fresh_check.sh
ok    web/vendor/stitchu-engine.js       (9487091 >= source)
ok    backend/engine/stitchu-worker.js   (9487091 >= source)
ok    backend/engine/stitchu-worker.wasm (9487091 >= source)
bundle_fresh_check: PASS

$ bash engine/tests/vocab_reference_check.sh
taban commit  : 94870917…  ·  taban toplam 10418  ·  bugun 10418 (delta +0)
HUKUM: YESIL
```

---

## 5. YAPILAMAYAN (4.7)

### 5.1 `wasm-baseline` gecikme bantları AŞILDI — kök: MAKİNE YÜKÜ, kod değil

```
ölçülen (2 koşu)   : draftJSON medyan 1.234 / 1.254 ms   (tavan 1.031)
                     gradeJSON medyan 10.457 / 12.217 ms (tavan 8.800)
V2-C aynı tavanlarla: draftJSON 0.956 · gradeJSON 8.499
$ uptime -> load averages: 4,29 5,36 4,89
```

**Kök teşhis, ölçülmüş:** ölçülen modül `engine/dist/stitchu-engine.js` ve o
dosya bu kartla **bayt-aynı** (`fe570bae…0887`, §1.1) — damga yalnız kopyalara
yazılıyor, `dist/`'e değil. Bayt aynıysa yavaşlama kodun değil, ölçüm ortamının.
Yük ortalaması 4-5, yani makinede paralel işler var; iki koşu arasında
`gradeJSON` p95'i 10.98 → 17.31 ms zıpladı (aynı bayt, %58 fark) — bu ölçek
ancak dış yükle açıklanır.

**ÖLÇÜLMÜŞ ÇÖZÜM ADAYI:** kapı bugün sadece bir metin raporu; sayı ne olursa
olsun exit 0. Bant gerçekten bir kapıysa, `wasm-baseline.mjs` en iyi-N medyanını
(ör. 5 koşunun en düşük medyanı) alıp tavanı AŞARSA exit 1 dönmeli ve ctest'e
bağlanmalı; en-düşük-medyan tam olarak dış yükü eleyen istatistiktir. Bu kartın
çıktı listesinde `wasm-baseline.mjs` yok, o yüzden **yapılmadı, ölçülüp
raporlandı**.

### 5.2 `?v` bump'ı — §3. Geri alındı, kusur duruyor.

**ÖLÇÜLMÜŞ ÇÖZÜM ADAYI:** `generated_ratchet_check`'in kendi mesajı yolu
söylüyor ("run the producer, then --accept, and put the manifest in the SAME
commit"). Yani bump `scripts/deploy.sh` üzerinden koşup 54 üretilmiş dosyayı
üreteçlerinden geçirmeli ve manifest aynı commit'e girmeli. Ölçülen büyüklük:
137 dosya / 488 kalem, 54'ü üretilmiş. Kart bu yolları çıktı olarak vermiyor.

---

## 6. KART DIŞI FARK EDİLENLER (DOKUNULMADI)

1. ⚠ **`bundle_fresh_check` yeşilken bile SEVK EDİLEN ≠ CANLI.** Kapı yalnız
   repo içi tazeliği ölçüyor. Worker'ın canlıya çıkması Damla'nın adımı
   (`backend/DEPLOY.md`), site deploy'u da öyle. **Worker canlı DEĞİL sayılır.**
2. ⚠ **`?v` bump'ı bir deploy başına bir kezdir, bir derleme başına değil.**
   Bu kart iki kez yeniden derledi; tek bir bump ikisini de kapsardı. Bump geri
   alındığı için site `136`'da duruyor ve `web/vendor` baytı `5d649d2`'den beri
   iki kez değişti (biri sadece damga satırı).
3. ⚠ **`engine/dist/` gitignore'da ve damgasız.** Kapının gördüğü üç kalem
   damgalı, `dist/` değil. Biri `dist/`'ten elle kopyalarsa damgasız bayt sevk
   edilir ve kapı bunu göremez (commit tarihine bakıyor, içeriğe değil).
4. ⚠ **Kapı içerik doğrulamıyor.** Damga bir İDDİA: artefaktı elle düzenleyip
   damgayı bırakmak kapıyı yeşil bırakır. Kapıyı içerik-doğrulayan yapmak
   (damgayı yeniden hesaplayıp karşılaştırmak) mümkün ama kapının kaynağına
   dokunmak bu kartta yasak (7.1) — **yapılmadı**.
5. ℹ️ `vocab_reference_check` `--baseline` çıktısındaki `_yasa` metni hâlâ
   `b799748` yeniden kesmesini anlatıyor; bu kartın yeniden kesmesi orada
   görünmüyor (§2'nin son uyarısı).
6. ℹ️ `patterns_real/` altındaki 3 takipsiz yol (`BUGRA-DEFTER.md`, `geometry/`,
   `bugra-geometry-2026-07-23.json`) oturum başında da takipsizdi; telifli,
   dokunulmadı (7.2).
