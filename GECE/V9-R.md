# V9-R — ARAŞTIRMA: doküman doğruluğunun YAYINLANMIŞ pratiği

Kart: `GECE/KART/V9-R.md` · erişim tarihi (tüm URL'ler): **2026-08-25** · kod yazılmadı.
Konu: RULES.md §6 ("Numbers live in TEST OUTPUT, not in docs… name the tool/test that
prints the number") ve §3'ün rapor-yasakları için YAYINLANMIŞ emsal + `docs_truth_check`
kapısının kalıp listesi / eşiği / kaçış mekanizması için kaynak taban.

Kaynak sayısı: **17 birincil kaynak** (hepsi bu koşuda açıldı) + 1 akademik kayıt
(tam metni açılmadı, aşağıda işaretli).

---

## 1. HÜKÜM TABLOSU

### Sınıf A — Executable / testable documentation (dokümandaki sayı test zamanında doğrulanır)

| # | Kaynak | Lisans | NE ÖLÇÜYOR | `docs_truth_check`'e ne veriyor | Hüküm |
|---|---|---|---|---|---|
| A1 | Python `doctest` — https://docs.python.org/3/library/doctest.html | PSF-2.0 (CPython stdlib) | Docstring'deki interaktif oturumu ÇALIŞTIRIR, basılan çıktının beklenen metinle **birebir** eşleşmesini şart koşar: *"doctest is serious about requiring exact matches in expected output. If even a single character doesn't match, the test fails."* | **Kaçış mekanizmasının en net emsali:** `# doctest: +SKIP`, `+ELLIPSIS`, `+NORMALIZE_WHITESPACE`, `+IGNORE_EXCEPTION_DETAIL` — satır içi direktif. Eşik = 0 uyuşmazlık, ama satır bazında muafiyet VAR. | **ALINIR** — "sıfır ihlal + satır içi muafiyet" ikilisinin en eski, en yaygın emsali; `docs_truth_check` tam bu şekli almalı. |
| A2 | Rust doctests (rustdoc) — https://doc.rust-lang.org/rustdoc/write-documentation/documentation-tests.html · https://github.com/rust-lang/rust/blob/main/src/doc/rustdoc/src/write-documentation/documentation-tests.md | MIT OR Apache-2.0 | `cargo test` doküman bloklarını derleyip koşar; `assert_eq!` ile "bu sayı budur" iddiası panik ederse test kırmızı. `#` ile başlayan satırlar teste girer, render'da GÖRÜNMEZ. | (a) İDDİA = TEST kalıbı: dokümandaki sayı, yanında koşan bir assert taşır. (b) Kaçış: ```ignore``` / ```no_run``` blok niteliği. (c) `#[doc = include_str!("../README.md")]` + `#[cfg(doctest)]` ile **README'nin kendisi doctest'e sokuluyor** — yayınlanmış, yaygın. | **ALINIR** — "README'yi test harness'ına sok" fikri bizde doğrudan uygulanabilir (`docs/*.md` içindeki sayıyı üreten komutu koştur). |
| A3 | Go testable examples — https://blog.golang.org/examples · https://pkg.go.dev/testing | BSD-3-Clause | `ExampleXxx` fonksiyonunun stdout'u, sonundaki `// Output:` yorumuyla karşılaştırılır. *"Godoc examples are… verified by running them as tests."* | Dokümantasyonda görünen çıktı bloğu = testin beklediği çıktı. **Tek kaynak.** Bizim §6'nın "sayı test çıktısında yaşar"ının birebir endüstri karşılığı. | **ALINIR** — kalıp: doküman sayısı ayrı yazılmaz, test çıktısından ÜRETİLİR/karşılaştırılır. |
| A4 | Sphinx `doctest` builder — https://www.sphinx-doc.org/en/master/usage/extensions/doctest.html | BSD-2-Clause | `make doctest`; `testcode`/`testoutput` (ve klasik doctest blokları) doküman derlemesinden AYRI bir builder olarak koşulur, grup grup. | Doküman-doğruluğu **ayrı bir kapı** olarak koşulabilir (bizde ctest içinde ayrı hedef). `doctest_default_flags` = proje çapında gevşetme ayarı. | **ALINIR** — kapı ayrı hedef olsun; proje çapı bayrağı emsalli. |
| A5 | `mdbook test` — https://rust-lang.github.io/mdBook/cli/test.html · repo https://github.com/rust-lang/mdBook | MPL-2.0 | Kitaptaki (Markdown) kod bloklarını rustdoc ile koşar; `ignore` nitelikli ve Rust olmayan bloklar atlanır. | Markdown DOKÜMANIN kendisinin test edilebildiğinin emsali. Kaçış = blok niteliği (`ignore`). ⚠ Belgede exit-code / build kırma davranışı YAZMIYOR (aşağıda BULUNAMADI). | **ALINIR (şartlı)** — sadece "markdown testlenebilir" emsali olarak; eşik sayısı vermiyor. |
| A6 | Cog (Ned Batchelder) — https://nedbatchelder.com/code/cog/index.html | MIT | `[[[cog … ]]] … [[[end]]]` bloğu içindeki kodu koşup ÇIKTISINI dosyaya yazar. `--check`: *"run cog just to check that the files would not change if run again. This is useful in continuous integration to check that your files have been updated properly."* | ★ **Bu kartın en güçlü bulgusu.** "Docs'taki sayı, onu basan aletin çıktısıdır" kuralının MEKANİK, YAYINLANMIŞ hali: sayı elle yazılmaz, üreten komut dosyanın içinde durur, CI bayat olup olmadığını kontrol eder. Yasak-kelime kapısından **daha güçlü** — iddiayı yasaklamak yerine iddiayı türetiyor. | **ALINIR — birinci sıra.** `docs_truth_check`'in pozitif tarafı bu olmalı; yasaklı kalıp listesi yalnızca ikinci savunma hattı. |

### Sınıf B — Docs-as-code / prose linter (yasaklı kalıp kapısı)

| # | Kaynak | Lisans | NE ÖLÇÜYOR | `docs_truth_check`'e ne veriyor | Hüküm |
|---|---|---|---|---|---|
| B1 | Vale — https://github.com/errata-ai/vale · https://docs.vale.sh/formats/markdown | MIT (v3, Go) | Düzyazı linter'ı. İki ana kural türü: **existence** (şu kalıp varsa hata) ve **substitution** (şunu şununla değiştir). Markup'ı anlar, kod bloklarını prose kurallarından hariç tutar. | (a) Kalıp listesinin biçimi: kural başına bir YAML dosyası, `StylesPath` altında. (b) **Kaçış — birincil kaynaktan doğrulandı:** `<!-- vale off -->` / `<!-- vale on -->`, `<!-- vale Style.Kural = NO -->` / `= YES`, hatta tek eşleşme bazında `<!-- vale Style.Kural["ACT test","OTHER"] = NO -->`, ve `<!-- vale styles = A, B -->`. (c) Sözlük: `StylesPath/config/vocabularies/*/accept.txt` + `reject.txt` — **reject.txt = yayınlanmış "yasaklı kelime listesi" mekanizmasının ta kendisi**, accept.txt = allowlist. (d) `MinAlertLevel` ile hata/uyarı ayrımı. | **ALINIR** — `docs_truth_check`'in kalıp listesi Vale'in existence kuralı biçimini taklit etmeli; kaçış üç kademeli (dosya / blok / tek eşleşme) olmalı. |
| B2 | markdownlint — https://github.com/DavidAnson/markdownlint | MIT | Markdown yapı linter'ı; **custom rule API** var (`customRules` seçeneği, npm `markdownlint-rule` anahtar kelimesi). | (a) `docs_truth_check` yayınlanmış bir uzantı noktasına takılabilir — sıfırdan alet icat etmek gerekmiyor. (b) Kaçış grameri: `<!-- markdownlint-disable -->` / `-enable`, `-disable-line`, `-disable-next-line`, `-capture` / `-restore`, kural adıyla hedefli (`<!-- markdownlint-disable MD001 MD005 -->`). | **ALINIR** — kaçış sözdizimi bizim için hazır emsal (özellikle `disable-next-line`: tek satırlık muafiyet). |
| B3 | lychee — https://github.com/lycheeverse/lychee · https://lychee.cli.rs/ | Apache-2.0 **VEYA** MIT (çift lisans) | Ölü link kapısı (Rust, async). **Exit kodları ayrık:** 0 başarı, 1 girdi/yapılandırma hatası, 2 = en az bir link düştü, 3 = config dosyası hatası. | (a) Kapının CI'da nasıl konuşacağının emsali: **başarısızlık türüne göre AYRI exit kodu** — "docs yanlış" ile "kapı bozuk" karışmasın. (b) Kaçış: `--exclude <regex>`, `--exclude-path <regex>`, `.lycheeignore`. | **ALINIR** — ayrık exit kodu tasarımı; §5.1'e uygun, kapının kendi arızasını ihlalden ayırır. |
| B4 | Google developer documentation style guide — "Excessive claims" https://developers.google.com/style/excessive-claims · word list https://developers.google.com/style/word-list · ana sayfa https://developers.google.com/style/ | İçerik **CC BY 4.0**, kod örnekleri Apache-2.0 | ★ Doğrudan bizim §6'nın konusu. Tanım (birebir alıntı): excessive claim = *"Makes a statement about performance or cost that isn't easily verifiable"* / güvenlik olayıyla çürüyecek iddia / öznel-aşağılayıcı yorumlanabilecek iddia. Kural: *"Avoid superlatives like best, simplest, fastest, never, and always. Similarly, be careful about words like ensure and guarantee and use them only when something can truly be ensured or guaranteed."* ve **kaynak şartı**: *"If you make specific performance claims—how fast a product is, how much storage it requires, and so on—make sure that you reference the source of your information."* Word list'te `easy/easily` (*"What might be easy for you might not be easy for others"*), `simple`, `just`, `performant` ("use a more precise term"). | ★ **`docs_truth_check` kalıp listesinin KAYNAKLI tabanı.** Bizim yasaklarımızın (§6 "ALL PASS / 0.00mm / byte-identical / zero issues" duran-iddiası, §7 "Bugs: none known", §3 "baktım/looked correct") tam olarak Google'ın üç maddesinin altına düşen özel hâlleri. Ayrıca "sayı veriyorsan kaynağını göster" şartı **yayınlanmış bir stil kuralı olarak VAR** — bizim "aletin adını yaz"ımız bunun sertleştirilmiş hâli. | **ALINIR — kalıp listesinin tepesine bu konur.** Tek kaynaklı, açık lisanslı, alıntılanabilir. |
| B5 | Diátaxis (Daniele Procida) — https://diataxis.fr/ · https://github.com/evildmp/diataxis-documentation-framework | CC BY-SA 4.0 | Dokümanı 4 türe ayıran taksonomi (tutorial / how-to / reference / explanation). | **HİÇBİR ŞEY.** İçerik doğruluğu, yasaklı kalıp veya ölçülebilir eşik hakkında tek kural içermiyor; yalnızca yerleştirme/yapı çerçevesi. | **ALINMAZ** — konu dışı; `docs_truth_check`'e kalıp da eşik de vermiyor. Kart "aranacak" dediği için arandı ve boş çıktığı burada yazıldı. |

### Sınıf C — Provenance / attestation (sayının yanına onu üreten işin adı)

| # | Kaynak | Lisans | NE ÖLÇÜYOR | `docs_truth_check`'e ne veriyor | Hüküm |
|---|---|---|---|---|---|
| C1 | SLSA Build Provenance — https://slsa.dev/spec/draft/build-provenance | Spec metni CC-BY-4.0 (slsa.dev / OpenSSF) | *"Provenance is an attestation that a particular build platform produced a set of software artifacts through execution of the buildDefinition."* Zorunlu alanlar: **builder identity** (hangi platform ürettiyse), **build configuration** (giriş noktası + parametreler), **source reference** (repo + commit digest). in-toto attestation biçiminde, imzalı. | ★ **"Sayının yanına onu basan aletin adı + commit"** şartının kavramsal emsali — ama **ARTEFAKT** düzeyinde, düzyazı düzeyinde değil. Bize verdiği somut şey: alan ŞEMASI — `üretici_alet` + `komut/parametre` + `kaynak commit` üçlüsü. `docs_truth_check`'in kabul ettiği "aletin adı" formatı bu üçlüden az olmamalı. | **ALINIR (şema olarak), ALINMAZ (alet olarak)** — SLSA hiçbir doküman metnini denetlemez; bizim kapımızı koşamaz. |
| C2 | Kettle (arXiv 2605.08363) — https://arxiv.org/pdf/2605.08363 | DOĞRULANMADI (PDF açılmadı — kart §YASAKLAR: WebFetch'e PDF özetletmek yasak) | Arama sonucuna göre `provenance.json` üretip SLSA Provenance v1.2 predicate'i ile source commit + toolchain digest yazıyor. | Kayıt için tutuldu; **hüküm verilmedi.** | **DOĞRULANMADI** — sayı/eşik çıkarılmadı, kapıya girmez. |

### Sınıf D — Gerçek projelerde yasaklı-kelime kapısı ve yanlış pozitif yönetimi

| # | Kaynak | Lisans | NE ÖLÇÜYOR | `docs_truth_check`'e ne veriyor | Hüküm |
|---|---|---|---|---|---|
| D1 | woke — https://docs.getwoke.tech/usage/ · https://docs.getwoke.tech/ignore/ | Lisans **sayfada YAZMIYOR** (telif: Caitlin Elfring 2020-2021) — DOĞRULANMADI | Kaynak kodda + dokümanda yasaklı terim taraması; varsayılan kural seti + YAML ile özel kural seti. | ★ **Yanlış pozitif yönetiminin en ayrıntılı yayınlanmış hâli.** Birincil kaynaktan doğrulanan sözdizimi: satır sonu `// wokeignore:rule=whitelist`; bir ÜST satırda aynı yorum (next-line ignore, *"takes precedence over in-line ignores"*); çoklu kural virgülle boşluksuz `wokeignore:rule=whitelist,blacklist`; dosya düzeyi `.wokeignore` (+ `.gitignore`, `.ignore`, `.git/info/exclude` otomatik saygı görüyor). Uyarı da yayınlanmış: *"woke is not responsible for broken code due to in-line ignoring."* | **ALINIR** — `docs_truth_check`'in kaçış grameri birebir bundan türetilebilir: `<!-- stitchu-truth-ignore:rule=STANDING_CLAIM -->` satır-içi + üst-satır, artı dosya listesi. |
| D2 | GitLab dokümantasyon stil kılavuzu + word list — https://docs.gitlab.com/development/documentation/styleguide/word_list/ · https://docs.gitlab.com/development/documentation/styleguide/ | GitLab docs (MIT / CC — sayfada doğrulanmadı) | Gerçek, büyük ölçekli bir projenin Vale ile koşan tavsiye-edilen-kelime listesi. | Liste **kural başına gerekçeyle** yazılıyor: her terimin yanında "neden" ve "yerine ne". Bizim listemiz de kalıp + gerekçe + yerine-ne taşımalı. | **ALINIR (biçim olarak)** — kalıp listesinin sütun düzeni. |
| D3 | Crossplane / Elastic / Grafana Vale kılavuzları — https://docs.crossplane.io/contribute/vale/ · https://www.elastic.co/docs/contribute-docs/vale-linter · https://grafana.com/docs/writers-toolkit/review/lint-prose/rules/ | Proje dokümanları (çeşitli) | Vale'i CI kapısı olarak kuran gerçek projeler; yanlış pozitifi **sözlüğe ekleme** (`accept.txt`) yoluyla PR içinde çözmeyi kurala bağlıyorlar. | Doğrulanan pratik: yanlış pozitif KAPIYI GEVŞETMEZ, **aynı PR'da allowlist'e girer** ve incelemeye tabi olur. Bu bizim §5.1'e uygun tek yol. | **ALINIR** — kaçış "sessiz atlatma" değil, versiyonlanmış ve gözden geçirilen bir girdi olur. |
| D4 | *Linting Style and Substance in READMEs* (LintMe) — Mynampaty, Josephine, Isaacs, McNutt; CHI 2026 · https://dl.acm.org/doi/10.1145/3772318.3791597 · https://arxiv.org/pdf/2603.00331 | Akademik yayın (ACM); metin lisansı doğrulanmadı | README'lerde **hem stil hem İÇERİK** denetleyen bir araştırma probu: hafif bir DSL ile programatik kontroller (ör. kırık link) + LLM tabanlı içerik değerlendirmesi (ör. jargon tespiti). | Bize verdiği: "içerik/substance denetimi" bir araştırma sorusu olarak 2026'da HÂLÂ AÇIK; üstelik çözümün LLM'e ihtiyaç duyduğu iddia ediliyor. Yani mekanik bir substance-kapısı sanayi standardı DEĞİL. | ⚠ **ALINMAZ (şimdilik)** — tam metin okunmadı (ACM 403; PDF özetletmek kart yasağı). Ayrıca LLM'li kontrol bizim wrapper testine takılır. Kayıt olarak duruyor. |

---

## 2. KARTIN İKİ AÇIK SORUSU — CEVAP

### Soru 1: Yasaklı kalıp listesine KAÇIŞ (escape/allowlist) yayınlanmış pratikte VAR MI?

**VAR — ve istisnasız var. Bu koşuda açılan yasaklı-kalıp/doğruluk kapısı türünden
HER aletin bir kaçışı vardı; kaçışsız tek bir örnek bulunamadı.** Biçimler üç kademede
toplanıyor:

1. **Tek satır / tek eşleşme muafiyeti** (en yaygın, en dar)
   - `# doctest: +SKIP` (Python doctest)
   - `<!-- markdownlint-disable-next-line MD001 -->` ve `-disable-line`
   - `// wokeignore:rule=whitelist` (satır sonu) veya üst satırda aynı yorum
   - `<!-- vale Style.Kural["ACT test"] = NO -->` — **tek eşleşme düzeyinde**, kuralı bile kapatmadan
2. **Blok / bölge muafiyeti**
   - `<!-- vale off -->` … `<!-- vale on -->`
   - `<!-- markdownlint-disable -->` … `<!-- markdownlint-enable -->`, `-capture` / `-restore`
   - rustdoc / mdbook blok niteliği: ```ignore```, ```no_run```
3. **Dosya / proje düzeyi allowlist**
   - Vale `vocabularies/*/accept.txt` (kabul) + `reject.txt` (yasak liste) — **liste ve
     allowlist aynı mekanizmanın iki yüzü**
   - `.wokeignore`, `.lycheeignore`, `--exclude` / `--exclude-path` regex'i
   - Sphinx `doctest_default_flags`

**`docs_truth_check` için hüküm:** kaçışsız kapı kurmanın yayınlanmış emsali YOK.
Kapı üç kademeli olmalı ve kaçış **görünür + versiyonlanmış** olmalı (D3: yanlış pozitif
aynı commit'te allowlist'e girer, sessizce atlatılmaz). En dar kademe (tek satır, kural
adıyla) zorunlu; en geniş kademe (tüm dosya) mümkünse hiç kullanılmamalı.

### Soru 2: "Her sayısal iddianın yanında onu BASAN aletin adı" şartını MEKANİK denetleyen yayınlanmış bir alet VAR MI?

**HAYIR. Bu şartı denetleyen yayınlanmış bir alet BULUNAMADI.** Dört ayrı arama
(citation-for-numeric-claim linter, unsubstantiated performance claim rule, docs claim
provenance, benchmark "produced by <tool> @ <commit>" konvansiyonu) sıfır alet döndürdü.
Bulunanlar üç kategoriye düşüyor ve hiçbiri şartı denetlemiyor:

- **Kural VAR, alet YOK:** Google style guide `excessive-claims` *"make sure that you
  reference the source of your information"* diyor — ama bu **insan tarafından uygulanan
  bir yazı kuralı**; onu koşan bir linter yayınlanmamış. (Vale'de yalnızca kelime düzeyi
  karşılıkları var: `easy`, `simple`, `performant` gibi.)
- **Şart tersine çevrilmiş, MEKANİK ve YAYINLANMIŞ:** Cog `--check`, doctest, rustdoc
  doctest, Go `// Output:`, Sphinx doctest, `mdbook test`. Bunlar "sayının yanında aletin
  adı var mı?" diye SORMUYOR; **sayıyı aletin kendisine bastırıyor** ve doküman ile
  çıktı ayrışırsa CI'ı kırıyor. Denetlenen şey atıf değil, EŞİTLİK.
- **Artefakt düzeyinde provenance:** SLSA (builder identity + build config + source
  commit). Doküman metnine hiç bakmaz.

**Yani: yayınlanmış alet YOK. `docs_truth_check` şu ölçümden kurulur:**

1. **Pozitif taraf (birinci savunma, Cog emsali):** `docs/` içindeki her sayı, onu üreten
   komutun adı + çıktısıyla birlikte üretilmiş bir blok içinde durur; kapı, komutu
   yeniden koşup dosyanın DEĞİŞİP DEĞİŞMEDİĞİNE bakar. Eşik = **0 fark** (Cog `--check`,
   Go `// Output:`, doctest: hepsi birebir eşleşme). Bu bizim §6'mızı yorumsuz uygular.
2. **Negatif taraf (ikinci savunma, Vale/woke emsali):** duran-iddia kalıpları için
   existence kuralı listesi. Kaynaklı taban = Google `excessive-claims` üç maddesi +
   superlatif listesi (`best, simplest, fastest, never, always, ensure, guarantee`),
   üstüne bizim repo-özel kalıplarımız (RULES §6: `ALL PASS`, `0.00mm`, `byte-identical`,
   `zero issues` — sayının yanında üreten alet adı YOKSA; §7: `bugs: none known`;
   §3: `baktım`, `looked correct`, `read by eye`). Eşik = **0 ihlal**, üç kademeli kaçışlı.
3. **Exit kodu (lychee emsali):** ihlal ile kapının kendi arızası AYRI exit kodu alır.

**Uydurma eşik yok:** bu koşuda açılan hiçbir kaynak "N ihlale kadar tolerans" gibi
sayısal bir eşik yayınlamıyor. Yayınlanan tek eşik **sıfır** (+ açık muafiyet). Bu yüzden
`docs_truth_check`'e sayısal tolerans girmemeli.

---

## 3. BULUNAMADI / DOĞRULANMADI LİSTESİ

- **"Her sayısal iddianın yanında üreten aletin adı" kapısını koşan yayınlanmış alet: BULUNAMADI.** (Soru 2, yukarıda.)
- **Benchmark raporlarında "produced by `<tool>` @ `<commit>`" diye bir YAYINLANMIŞ konvansiyon: BULUNAMADI.** SLSA'nın artefakt provenance'ı dışında, düzyazı rapor için standart yok.
- **woke'un lisansı: DOĞRULANMADI.** docs.getwoke.tech'te yazmıyor; GitHub deposu bu koşuda açılmadı.
- **GitLab docs / Crossplane / Elastic / Grafana sayfalarının içerik lisansı: DOĞRULANMADI.**
- **Vale'in exit kodları ve `MinAlertLevel`'ın CI'ı kırma davranışı: DOĞRULANMADI** — birincil kaynaktan teyit edilmedi. "Önce `MinAlertLevel = warning`, sonra `error`" tavsiyesi ikincil bir blogdan geldi (docsio.co), **DOĞRULANMADI**.
- **markdownlint-cli exit kodları: DOĞRULANMADI** (repo README'sinde bakılmadı).
- **lychee'de tek bir linki satır içi HTML yorumuyla atlama: BULUNAMADI** — README `--exclude` / `--exclude-path` / `.lycheeignore` veriyor, satır içi yorum vermiyor.
- **`mdbook test` başarısızlıkta build'i kırıyor mu: BULUNAMADI** — CLI belgesi exit kodundan hiç söz etmiyor.
- **LintMe (CHI 2026) tam metni: OKUNMADI.** ACM sayfası 403 döndü; arXiv sürümü PDF ve kart PDF özetletmeyi YASAKLIYOR. Yukarıdaki özet **arama sonucu düzeyinde, DOĞRULANMADI.**
- **Kettle (arXiv 2605.08363): DOĞRULANMADI** — aynı PDF yasağı.
- **Diátaxis: aranıp BOŞ çıktı.** Kart onu emsal listesine koymuş; taksonomi olduğu için `docs_truth_check`'e kalıp/eşik/kaçış hiçbir şey vermiyor. Hüküm ALINMAZ.
- **`markdown-link-check` (npm): açılmadı** — lychee ve mdbook-linkcheck kapsandığı için ayrıca kovalanmadı. Lisansı/kaçışı **DOĞRULANMADI**.

---

## 4. KART DIŞI FARK EDİLENLER (sorulmadı ama önemli)

1. **★ Cog, bu kartın asıl bulgusu ve kartın çerçevesini aşıyor.** Kart "yasaklı kalıp
   listesi + eşik" arıyordu; yayınlanmış pratiğin daha güçlü hâli **iddiayı yasaklamak
   değil, iddiayı ÜRETMEK**. Yasaklı kelime listesi, sayının elle yazıldığı bir dünyanın
   çaresidir. Cog/doctest/Go-Example dünyasında yasaklanacak bir şey kalmaz. Bu,
   `docs_truth_check`'in tasarımını değiştirebilecek bir bulgu — V9-A'ya (kod tarafı)
   iletilmesi gerekebilir. Ben V9-A'dan bir şey okumadım, kart öyle diyor.
2. **README'yi doctest'e sokma emsali (`#[doc = include_str!("../README.md")]` +
   `#[cfg(doctest)]`)** — bizim `README.md`'deki sayıların da kapıya girmesi gerektiğini
   söylüyor; kart yalnızca `docs/`'tan söz ediyordu ama RULES §6 "Docs" diyor ve README
   de dokümandır.
3. **Vale'in `reject.txt`'i tam olarak bizim istediğimiz şey** — ayrı bir kural dosyası
   yazmadan düz metin bir yasak listesi. Ama `reject.txt` **spell-checker** yolundan
   çalışıyor (kelime düzeyi); bizim kalıplarımız çok kelimeli ("byte-identical",
   "bugs: none known") olduğu için muhtemelen `existence` kuralı gerekir. Bu ayrımı
   birincil kaynaktan tam doğrulayamadım — **DOĞRULANMADI**.
4. **Google `excessive-claims`'in güvenlik maddesi bizde de geçerli:** *"Makes a statement
   about security that would be invalidated by a security incident."* CLAUDE.md/RULES bunu
   hiç yazmıyor; kalıp listesine "güvenli / sızmaz / garanti" sınıfı da girebilir.
   Karar Damla'nın.
5. **§7 ("Bugs: none known" yasak) ile Google'ın `ensure/guarantee` uyarısı aynı ailedendir**
   — yani bizim iki ayrı kuralımız (§6 ve §7) tek bir yayınlanmış kural sınıfının altına
   düşüyor ve `docs_truth_check` içinde tek kalıp ailesi olarak kurulabilir.
6. **Yanlış pozitif yönetiminde bir uyarı yayınlanmış:** GitLab'da Vale'in bir çoğul
   kuralı `scope: raw` yüzünden kod bloklarını da tarayıp ~30 bulgunun çoğunu yanlış
   pozitif yapmış; `scope` düzeltilince 12 bulgu / 0 yanlış pozitife inmiş. **Kaynak
   ikincil (arama özeti), DOĞRULANMADI** — ama ders şu: `docs_truth_check` kod bloklarını
   ve test çıktısı bloklarını TARAMAMALI, yoksa kendi ürettiğimiz gerçek sayıları
   "yasaklı iddia" diye işaretler.
