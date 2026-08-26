# HAKEM — F3 (tek nesne: flat ile kalıp aynı dikiş planından)

Yargılanan: `76a4e24` (amend edilmiş, öncesi `8197771` ve `3d24053` reflog'da).
Geri alma etiketi `F3-oncesi` = `d81faa4`. Hakem bu koşuda **iş yapmadı**;
aşağıdaki her sayı hakemin **kendi** koşturmasıdır.

# ✅ HÜKÜM: GEÇTİ

Etiket `F3-yesil` atıldı. Gerekçe aşağıda, kalem kalem, **ölçülmüş**.

---

## 1. KAPILAR — HAKEM KENDİ KOŞTURDU

| kapı | kart ne dedi | **hakem ne ölçtü** |
|---|---|---|
| `ctest --test-dir engine/build` | 6 failed out of 120 | ✅ **6 failed out of 120** (396.07 sn) |
| `vocab_reference_check` | `HUKUM: YESIL`, 10306 | ✅ **`HUKUM: YESIL`**, **10306**, taban **10438**, delta **-132** |
| `indir_check` | EXIT 0 | ✅ **EXIT 0**, `İNDİR KAPISI: YEŞİL` |
| `hedef_kosu` | EXIT 0, `CIRCIR SAĞLAM` | ✅ **EXIT 0**, `CIRCIR SAĞLAM` |
| `python3 -m pytest -q` | 33 passed | ✅ **33 passed** in 0.68s |
| ⭐ `tek_nesne_check` | EXIT 0 | ✅ **EXIT 0**, 7 hüküm yeşil |

**`ctest` son satırı — kopyalandı, özetlenmedi:**

```
95% tests passed, 6 tests failed out of 120

The following tests did not run:
	105 - h10_gate_check (Disabled)

The following tests FAILED:
	  9 - flat_pattern_agree_check (Failed)
	 14 - flat_artifact_census (Failed)
	 15 - style_check (Failed)
	 22 - sizechart_source_check (Failed)
	 93 - contract_check (Failed)
	 99 - figure_check (Failed)
```

**Altı ad tam olarak miras altı. YEDİNCİ KIRMIZI YOK.** Bu koşuda üç kart
kırmızı bir kapıyı yeşil bildirmişti (`b791db5`, `cd3bea3`, `3c1835f`);
**F3 dördüncüsü değil.** K15'in yeniden yargılanması gerekmedi.

`105 - h10_gate_check` DISABLED ve öyle kaldı (K18). Numarası 104→105 kaydı
çünkü listeye yeni bir test girdi; **testin kendisine dokunulmadı** — doğrulandı.

---

## 2. AJANIN AÇTIĞI ÜÇ KALEM — ÜÇÜ DE KARARA BAĞLANDI

### Kalem 1 — `indir_check` bir koşu kırmızı doğdu. **KAPI GEVŞETİLMEDİ.**

`git diff F3-oncesi..HEAD -- engine/tests/indir_check.mjs` → **8 satır**, hepsi
okundu:

```diff
+// AWAITED since GECE7/F3: saveFlatSVG became async ... (6 satır yorum)
 const beforeFlat = saved.length;
-saveFlatSVG(SPEC, 'dress-flat.svg');
+await saveFlatSVG(SPEC, 'dress-flat.svg');
 check('the flat actually saves a file', saved.includes('dress-flat.svg'), ...
```

**Yargılayan satır (`saved.includes('dress-flat.svg')`) TEK BAYT değişmedi.**
Eşik yok, tolerans yok, kapsam yok. Değişen yalnız çağrı biçimi, çünkü
`saveFlatSVG` async oldu. §3.8 md.4 **ihlali yok**. Ajanın anlatısı doğru ve
kapının ilk koşuda imza değişikliğini yakalaması **kapının çalıştığının**
kanıtıdır — ajan bunu gizlemek yerine kartına ⚠ ile yazdı.

### Kalem 2 — K12 tuzağı ısırdı. **TABAN KESİLMEDİ, düzeltme DAVRANIŞ-NÖTR.**

**Blob hash'leri iki uçta karşılaştırıldı** (`F3-oncesi` · `HEAD` · çalışma ağacı):

| dosya | üç uçta da |
|---|---|
| `engine/tests/vocab_reference_check.sh` | **AYNI** `e1b55e857e0fa8aa32e137a8e9cffed14aadab5c` |
| `engine/tests/vocab-reference-baseline.json` | **AYNI** `8c016108b93f87674b9afbd6d3a8e26a2214debb` |
| `contract/hedef-kosu-taban.json` | **AYNI** `cf2af8c7d3c4603eee5aea252f3568feedda8d10` |
| `engine/tests/hedef_kosu.mjs` | **AYNI** `7e3683a94f50895563c2f36ea06b3d17e3497104` |
| `vision/eval/labels-hakem.json` | **AYNI** `c21964a88ad0695e5acf085fb3d92127def3928e` |
| `vision/eval/labels-hakem-BOS.json` | **AYNI** `ffc1f77d446290e8f7f907876e3bba3c2397ee7e` |
| `engine/tests/flat_expresses_spec_check.mjs` | **AYNI** `24fc6a295f301ca49219d925dfc1430dc2a63681` |

**Yedi dosyanın yedisi bayt bayt yerinde.** Taban kesilmedi, SCOPE
daraltılmadı, eşik gevşetilmedi. K2/K11/K12 **ayakta**.

**Davranış-nötr mü — reflog'dan ölçüldü, ajana sorulmadı.** Amend öncesi commit
`8197771` duruyor; `git diff 8197771..HEAD` (doküman ve derleme çıktıları hariç)
**tamamı** şu ikisi:
1. **13 yorum satırında** `neckline` → `neck edge` / `neck drop` / `top boundary`.
   Yorum, davranış taşımaz.
2. `SeamPlan`'ın üç literal alanı (`garment`/`shaping`/`fabric`) **tek dizeye**
   indi (`sinif = "top/dart/woven"`) + üç `const` erişimci. `nodeId()` içindeki
   `mix(h, garment + "/" + shaping + "/" + fabric)` → `mix(h, sinif)`: varsayılan
   değerlerde **birebir aynı dizeyi** karıştırıyor.

**İddia edilmedi, ölçüldü:** hakemin bugünkü koşusunda düğüm
**`3f3869aaee8b56b1`** — ajanın amend ÖNCESİ bildirdiği sayının aynısı.
**Davranış gerçekten nötr.**

> ⚠ Kayda geçiyor (F3'ü düşürmez, F5 bilsin): üç alan artık `const` erişimci,
> yani **yazılamıyor**. Bugün onları ayrı ayrı yazan kod yok (derleme geçiyor),
> ama F5 ikinci bir sınıf açtığında `sinif` dizesinin ayrıştırılması tek nokta
> arızasıdır — bozuk bir dize sessizce boş `shaping` üretir. F5 kartına yazıldı.

### Kalem 3 — 🔴 `flat_pattern_agree_check` ⇄ §2. **AJANIN ÖNCÜLÜ YANLIŞ. → K23**

Ajan "bu kapı §2 ile çelişiyor, kararı hakemin" dedi ve **dokunmadı** — doğru
davranış. Ama **çelişki yok**, ve bunu kapının **kendi koşusundaki üç sayı**
söylüyor:

| ölçü | flat mm | kalıp mm | fark % |
|---|---|---|---|
| `hem_circumference` | 1295.6000 | 1295.4506 | **%-0.0115** |
| `waist_circumference` | 725.0000 | 724.8907 | **%-0.0151** |
| `body_length` | 757.5584 | 728.7870 | **%-3.7979** ← **tek** ihlal |

§2 ancak iki taraf **farklı bedenler** ise eşitliği ezer. Bugün değiller:
`flatJSON`'un kendi `bedenlendirme` bloğu manken çizelgesini **`YAYIN
BULUNAMADI`** basıyor — **ilan edilmiş dönüşüm bugün ÖZDEŞLİK**, ve özdeşlik
altında **eşitlik doğru tahmindir**. Bel ve etek ucunun **%0.015 / %0.011** ile
tutması bunun ölçüsüdür.

Dahası, iki taraf da kendi metninde **aynı niceliği** ölçtüğünü yazıyor
(`pattern-measure.mjs:169` *"a length ALONG the cloth, not a vertical height
difference"* ↔ `shellprojection.cpp` `centreLineArc`). Ve kapı "iki farklı
nicelik kıyaslanmaz" kanununu zaten uyguluyor: `body_height_projected` tam bu
gerekçeyle kapı **dışına** alınmış, üç `UNMEASURED` kaleminin gerekçesi de aynı.

**Altı fazdır aranmayan kök sebep bulundu ve adlandırıldı:** merkez-ön hattının
kabuk üstündeki yayı (757.5584mm) ile açılmış panelde ölçülen yayı
(728.7870mm) arasında **28.7714mm** onarılmamış fark = motorun **kendi**
sertifikalı düzleştirme bütçesinin (`flatten_check`, strain **<%0.5**)
**7.6 katı.** Kırmızı **gerçek**; kapı gevşek değil.

**Kapı yeniden YAZILMADI, §3.8 md.1 yetkisi bilerek kullanılmadı** — iki dayanak
K23'te, özeti: (a) yayınlanmamış bir dönüşüme karşı kapı tanımlanmaz, `manken`
bugün `YAYIN BULUNAMADI`; (b) hakem turunda 6-kırmızı tabanını oynatmak, bu
koşudaki her kartın kıyasını siler. **Tetik yazıldı:** manken çizelgesi
yayınlandığı gün (F4) bu kapı **yeniden yazılmak zorunda**, çünkü o gün özdeşlik
biter — ve yazan hakemdir, önceki/sonraki sayıyı yan yana koyar.

---

## 3. İŞ 0 — HAKEM **HM8'İ KENDİ TEKRARLADI**. YAPILMIŞ.

Ajanın en ağır iddiası buydu, ve tek başına ajanın loguna güvenilmedi.

`01-a-line-cocktail-dress-mannequin.jpg`'in `shaping` yargısı `deger`'den
silinip `goremedim`'e taşındı (HM8'in aynısı):

```
mühür kapısı (pytest)   3 failed, 7 passed   -> KIRMIZI
   test_deger_hucre_sayimi · test_goremedim_sayimi · test_dosya_sha256
hedef_kosu              EXIT 0               -> HÂLÂ YEŞİL
H2                      %95.2 (40/42)  ->  %97.6 (40/41)   BEDAVA
```

**K19'un teşhisi hakem tarafından ikinci kez doğrulandı:** cevap anahtarını
gevşetmek `hedef_kosu`'ya göre **bugün de bedava**, ve onu yakan **tek şey**
F3'ün yazdığı kapıdır. Geri alındı; `git hash-object` → **`c21964a8…`**,
`F3-oncesi` ile birebir; mühür kapısı **10 passed**.

**İŞ 0 YAPILMIŞTIR.** Kapı beklenen sayıları kendi içine yazmıyor, tabandaki
`_cevap_anahtari_MUHRU` bloğundan **adıyla** okuyor; taban blob'u **el
değmemiş** (yukarıdaki tablo). Üç kaçış yönü + iki yan yüzey kapalı.

---

## 4. HAKEMİN KENDİ MUTASYONLARI — AJANIN **HİÇ DOKUNMADIĞI** DOSYALARDAN (§3.8 md.3)

Ajanın `tek_nesne_check` için koştuğu **5 mutasyonun 5'i de kendi yazdığı tek
dosyadaydı** (`engine/src/seamplan.cpp`). Sınırı aramak hakemin işiydi.

Hakem, ajanın önceden kaydettiği **bayat-ikili tuzağına** karşı sert bir koşum
kurdu: her turda ikili silinir, yeniden derlenir, ve **`shasum` ile ikilinin
gerçekten kımıldadığı kanıtlanır**; kımıldamadıysa **hüküm verilmez**.

| | mutasyon (dosya ajan tarafından **hiç değiştirilmedi**) | ikili | kapı |
|---|---|---|---|
| **HM-F1** | `src/bodysurface.cpp` — `kWaistToHipMM 205.0 → 215.0` | `2ccf4bc7…`→`a7109b6f…` | **EXIT 0** ✅ doğru davranış |
| **HM-F2** | `src/shellprojection.cpp` — `projectBack := projectFront` | `2ccf4bc7…`→`60ea1cde…` | **EXIT 0** 🚨 **BOŞLUK** |
| **HM-F3** | `src/garmentshell.cpp` — `stretch := 1.0` | **ikili KIMILDAMADI** | **HÜKÜM YOK** (mutasyon bu yolda atıl) |

**HM-F1 — kapının olumlu kontrolü, ve kıymetli:** ajanın **hiç açmadığı** bir
dosyadaki tek sabit, düğümü **`3f3869aaee8b56b1` → `6ec8e172bcb3915b`** oynattı.
Yani `dugum` bir süs ya da yerel bir sabit değil, **gerçekten yukarı akıştaki
geometriden türüyor.** Kapı yeşil kaldı — doğrusu bu, çünkü bu meşru bir
geometri değişikliği ve iki okuma yine aynı düğümü bastı.

**HM-F2 — kapının sınırı, ve F3'ü DÜŞÜRMEZ ama kayda geçer.** Arka teknik çizim
**literally ön teknik çizim** yapıldı; kapı **yeşil kaldı** ve düğüm
**hiç değişmedi**. İki katman:
1. `nodeId()` **siluetı hash'lemiyor** (yalnız `surf.rings` + `topColXMM/ZMM`).
   İnen SVG'nin `data-dugum`'u "bu flat bu nesneden çıktı" diyor ama **çizilen
   siluetı bağlamıyor.**
2. K3'ün **`arka` kolu ayırt edici değil**: yaka değişikliği siluetı zaten
   oynatmadığı için o kol **0.0000'ı 0.0000 ile** kıyaslıyor — arka literally ön
   olsa bile.

**Neden yine de GEÇTİ:** kartın **6 no'lu kapı şartı** ("yakayı 20mm
derinleştiren tek değişiklik iki okumada da ölçülür ve **aynı düğümden** türer")
**teslim edildi** ve MF1–MF5 ile kırmızı yakılabildiği gösterildi; siluet
**yapısal olarak** zaten planın kendi nesnesinden (`pat.surf`) geliyor. Eksik
olan bir kapı **kapsamı**, bir yalan değil. Ajanın kartındaki **tablo doğru**;
**geniş olan düzyazı cümlesi**: *"flat'te değişip kalıpta değişmeyen (ya da
tersi) SIFIR alan"* — bu **tek alanda** (`ust_sinir`), **tek spec değişikliği
altında** ölçüldü; yayınlanan **yedi siluet ölçüsü tek yönlülük için hiç
sınanmadı.** → **K24**: `tek_nesne_check` **F5'in ilk operatör alt-kartı
kapanmadan önce** siluet kolu kazanır ve **HM-F2'de kırmızı yanar.**

**HM-F3 dürüstçe kaydediliyor:** o satır bu yolda derlenmiyor/etkisiz, ikili
tabanla **bit-aynı** çıktı. **Bayat bir ikiliye karşı koşan mutasyon hiçbir şey
kanıtlamaz** — ajanın kendi dersi, hakem de ona uydu. Hüküm verilmedi.

Üç turun sonunda `git status engine/ vision/ contract/` **temiz**, ikili
`2ccf4bc74d5c67afb381ef247c8b76c6309549f3` = taban.

---

## 5. CIRCIR — HAKEM KENDİ KOŞTURDU, HİÇBİRİ KÖTÜLEŞMEDİ

| sayı | taban (K21) | **hakem ölçtü (n=5)** | hüküm |
|---|---|---|---|
| H1 | 5/5 | **5/5** | tavan (K25) |
| H2 | %95.2 (40/42) | **%95.2 (40/42)** | aynı |
| H3 | 2 | **2** | aynı |
| H5 | 0 / 5 çift | **0 / 5** | aynı |
| H8 | 31 | **31** (26 oov + 5 alan) | aynı |
| H10 | %58.3 | **%58.3 (70/120)** | aynı |
| **H10b** | **%40.0** | **%40.0 (48/120)** | **§0B tavanı KIMILDAMADI** |
| H10a | anahtar YOK | %17.5 (21/120) | cırcıra bağlı değil (K21) |
| H10x | %0.8 | **%0.8 (1/120)** | aynı |
| H10e | 3 | **3** | aynı |
| H11 | 3.7 ms | **3.0 ms** (en kötü 34.4) | aynı sınıf, <10 sn tavanı |
| H4 / H6 / H9 | ÖLÇEMEDİM | **ÖLÇEMEDİM** | altı fazdır |

n=10 bloğu (cırcırsız, bilgi): H1 **10/10** · H2 %93.0 (66/71) · H3 2 · H5 0 ·
H8 61 · H10 %64.4 · H10a %29.7 · H10b %33.1 · H10x %1.7 · H10e 5 · H11 2.1 ms.

**§0B tavanı sınandı mı — evet, ve geçildi:** H10b **kımıldamadı**, yani
"H10b yükselirken H2 yükselmiyor" hali **doğmadı**. F3 §0B'yi kullanmadı.

**H1 → K25.** §3.6 F3'ün hanesine H1'i yazıyor; H1 **iki `n`'de de tavanda**
(5/5 ve 10/10). Doymuş sayı iyileştirilemez. Önceden ilan edilmiş olması bu kez
**mazeret değil**, çünkü ilanı **ajan değil, F3 kartını yazan HAKEM** yaptı —
bir tahmindi ve tuttu. **H6 istisnası kullanılmadı**: F3 kendine tanınan tek
gevşemeyi harcamadı.

---

## 6. KAPSAM, PUSH, TAHMİN

`git diff --stat F3-oncesi..HEAD` → **20 dosya, +1633 / −10.** Hepsi kart içi:
- İŞ 0: `engine/tests/py/test_cevap_anahtari_muhru.py`
- İŞ 1: `engine/build-wasm.sh` (iki liste **tek** `ENGINE_SRCS` oldu — kart
  "ikisine de ekle, bu bir tuzaktır" diyordu; ajan tuzağı **kaldırdı**, daha
  iyisi), `engine/CMakeLists.txt`
- İŞ 2: `engine/src/seamplan.{hpp,cpp}` · `engine/wasm/bindings.cpp` ·
  `engine/tools/seam-plan.cpp` · `engine/src/surfacepattern.{hpp,cpp}`
- İŞ 3: `web/lib/flat-from-plan.js` · `web/js/{create,download,engine}.js`
- Kapı: `engine/tests/tek_nesne_check.mjs` · `engine/tests/indir_check.mjs`
- Derleme çıktısı: `web/vendor/stitchu-engine.js` · `backend/engine/stitchu-worker.{js,wasm}`
  — **ikisi de `build-wasm.sh`'ın kendi kopyalama hedefleri** (satır 150 ve
  182-183), yani kart dışı taşma değil.

**`patterns_real/` PUSHLANMADI.** `git diff --name-only F3-oncesi..HEAD -- patterns_real/`
→ **0 dosya.** Diskteki takipsiz kalemler (`BUGRA-DEFTER.md` · `geometry/` ·
`tools/bugra-geometry-*.json`) **takipsiz kaldı**, `git add` görmedi. K10 ayakta.

`git status` → yalnız ` M KOSU-v7.md` + takipsiz `patterns_real/` — **kartın
önceden ilan ettiği kirlilik**, F3'ün diffinde yok. **→ K26** (anayasanın
commitlenmemiş 423 satırı; F3'ün suçu değil ama kimse yazmamıştı).

**Yasak 3 doğrulandı, iddia edilmedi:** `web/js/download.js:217-223` —
`flatSVG(spec)` `top/dart/woven` için **atıyor** (*"use flatSVGAsync"*),
`flatSVGAsync:261` sınıf dışını eski hatta yolluyor. *"Şimdilik eski hatta"*
diye kalıcı bir kutu **yok**. `planLineClass` sayacı **kullanıcı arayüzüne
çıkmıyor** — doğrulandı.

**§3.12 tahmini:** kart **2–4 oturum**, tavan 8. **Tek oturumda kapandı** — iki
katı **aşılmadı**, aksine altında. Sessizce sürünme yok.

---

## 7. SAPMA SORUSU — CEVABI ÖLÇÜLDÜ

> *"Bir yabancı fotoğraf yükleyip kalıp + flat indirebiliyor muyum, ve
> `top/dart/woven` sınıfında kalıp ile flat AYNI dikiş planından mı çıkıyor?"*

**İkinci yarısı: EVET.** Hakemin kendi koşusu:

```
node engine/tests/tek_nesne_check.mjs   ->  EXIT 0
  K1 taban       iki okuma da aynı düğüm — 3f3869aaee8b56b1
  K1 yaka+20mm   iki okuma da aynı düğüm — 35eb8d7cf33be3ef
  K2 düğüm spec ile değişiyor  3f3869aaee8b56b1 -> 35eb8d7cf33be3ef
  K3 ön    flat Δ=51.1587mm · kalıp Δ=8.7794mm  — ikisi de oynadı
  K3 arka  flat Δ=0.0000mm  · kalıp Δ=0.0000mm  — ikisi de durdu
  K4 flat'in ön ortası TAM 20.0000mm düştü
```

ve hakemin HM-F1'i (ajanın **hiç açmadığı** dosya) düğümü oynattı
(`3f3869aaee8b56b1` → `6ec8e172bcb3915b`), yani bu kimlik **süs değil**.
**"Hayır ama altyapı hazırlandı" cümlesi kurulmadı; bir kapı çıkışı, bir dosya
yolu ve mutasyonların kırmızısı var.**

**Birinci yarısı: DOĞRULANMADI — ve ajan bunu KENDİ yazdı.** `indir_check`
EXIT 0 ve flat gerçekten kaydediliyor, ama **DOM saplaması üstünden**; gerçek
tarayıcıda **hiç tıklanmadı**, headless harness **altı fazdır yok** ve F3 onu
kurmadı. Ölçülen şey iddianın **motor tarafıdır**. Ajanın bunu "EVET" diye
yazmayıp eksik ilan etmesi **§3.10'a uygun ve doğru davranıştır.**

---

## 8. NEDEN GEÇTİ, TEK PARAGRAF

F3 kendisine verilen altı kapının **altısını da** hakemin kendi koşusunda geçti,
**yedinci kırmızı doğurmadı**, korunan **yedi dosyanın yedisini** bayt bayt
yerinde bıraktı, `patterns_real/`'a dokunmadı ve tahminin **altında** kapandı.
K19 gerçekten kapandı — hakem HM8'i **kendi tekrarladı** ve kapı kırmızı yandı.
§2'nin sorduğu şey (eşitlik değil, **tek kaynak + tek ilan edilmiş dönüşüm**)
`top/dart/woven` sınıfında **teslim edildi** ve mutasyonla kırmızı yakılabildiği
gösterildi. Ajan yedinci kırmızının bir kez doğduğunu, K12 tuzağının ısırdığını,
**kendi mutasyon betiğinin iki kez yalan söylediğini** ve tarayıcı yarısının
ölçülmediğini **kendisi bildirdi** — bu koşuda ödüllendirilen davranış tam
olarak budur (F2 2. turun `104 - h10_gate_check` bildirimi gibi).

Bulduğum boşluk (**HM-F2**, siluet kapsanmıyor) bir **kapı kapsamıdır, bir yalan
değil**, ve onu bulmak §3.8 md.3'e göre **hakemin işiydi** — sistem tasarlandığı
gibi çalıştı. Geri göndermek, konusu F3B (bu koşudan **çıkarıldı**) ve F4 olan
bir yüzey için bir oturum daha yakardı. Bunun yerine boşluk **ratchet'landı**:
K24, F5'in **ilk** alt-kartı kapanmadan kapatılmak zorunda ve **HM-F2 onun
mutasyonu.**

---

## 9. F3'ÜN DEVRETTİĞİ — F5'in silemeyeceği

F2'den devreden 26'ya **eklenen 5**:

27. **K24** — `tek_nesne_check` siluetı kapsamıyor; `nodeId()` `projectFront`/
    `projectBack` çıktısını hash'lemiyor, K3'ün `arka` kolu ayırt edici değil.
28. **K23** — `flat_pattern_agree_check`'in kök sebebi **bulundu ve adlandırıldı**
    (merkez-ön yayında **28.7714mm**, `flatten_check` bütçesinin **7.6 katı**)
    ama **onarılmadı**; kapının §2 biçimi F4'ün manken çizelgesine **bağlı**.
29. **K26** — `KOSU-v7.md` **commitlenmemiş 423 satır** taşıyor; her kartın
    okuma listesi HEAD'i değil çalışma ağacını gösteriyor.
30. `SeamPlan::sinif` **tek dizeyi ayrıştırıyor**; ikinci sınıf açıldığında bozuk
    bir dize sessizce boş `shaping` üretir (bugün zararsız, F5'te değil).
31. **`GarmentSurf` kopyalanıyor** (`SurfacePattern::surf`) — ajan işaret etti,
    ölçülmedi. Bugün kesimden **sonra**, aynı nesneden alınıyor; **DOĞRULANMADI**
    ki bu ileride "iki kabuk"a dönmesin.

Kapanmayan ve F3'ün de kapatmadığı miras: gerçek tarayıcıda **hiç tıklanmadı**
(**DOĞRULANMADI**, altı fazdır) · inen 7 dosyanın **5'i sessiz** ·
`download.js`'teki `kokenKaydi = null` arka kapısı (koruma **metinsel**) ·
H4/H6/H9 **ÖLÇEMEDİM** · H5 tek çiftten okunuyor · `vocab_reference_check` bir
**satır sayacı** (K12) · **K17** kapı ölçüm verisini ürün spec'i sayıyor ·
`conftest.py` bir kapsam kapısıdır ve **hiçbir mutasyonla korunmuyor** ·
`pages.yml:23` `branches: [main]` = **main'e her push canlıya çıkıyor** ·
`patterns_real/` **PUBLIC** (K10, Damla kararı) · miras 6 kırmızının
**5'inin** kök sebebi hâlâ aranmadı (altıncısı K23'te bulundu).
