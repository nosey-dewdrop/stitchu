# HAKEM — F2 (2026-08-26, `3c1835f`)

## HÜKÜM: ⛔ **KALDI**

`F2-yesil` **atılmadı**. `git reset --hard F2-oncesi` **koşulmadı** — gerekçesi §7'de,
bir sayıya bağlı.

Tek satırlık sebep: **kartın FAZ KAPISI md.1'i `6 failed out of 119` istiyor; hakem
kendi koşturdu ve `7 failed out of 119` çıktı. Yedincinin adı
`flat_expresses_spec_check` ve o kırmızıyı F2 doğurdu.**

---

## 1. YEDİNCİ KIRMIZI — ölçüldü, iki uçtan doğrulandı, kök sebebi bulundu

Hakemin kendi koşusu (`cmake --build engine/build -j8` → exit 0, sonra tam ctest):

```
94% tests passed, 7 tests failed out of 119
	  7 - flat_expresses_spec_check (Failed)     <-- YENİ
	  9 - flat_pattern_agree_check (Failed)
	 13 - flat_artifact_census (Failed)
	 14 - style_check (Failed)
	 21 - sizechart_source_check (Failed)
	 92 - contract_check (Failed)
	 98 - figure_check (Failed)
```

Miras altının altısı da yerinde. **Yedinci ad miras listesinde YOK.**

**İki uçtan ölçüldü** (ayrı worktree, `git worktree add /tmp/f2onc F2-oncesi`):

| ağaç | `node engine/tests/flat_expresses_spec_check.mjs` |
|---|---|
| `F2-oncesi` (`7f9bafe`) | `RATCHET sleeveStyle UNEXPRESSED 0/0` → **0 FAIL, EXIT 0** |
| `HEAD` (`3c1835f`) | `RATCHET sleeveStyle UNEXPRESSED 1/0 — TAVAN ASILDI` → **1 FAIL** |

Uçucu değil, iki ayrı koşuda birebir tekrarlandı.

### Kök sebep — bir satır, ve o satır F2'nin kendi ürünü

`flat_expresses_spec_check` kol değerlerinin **alanını** beş kaynaktan topluyor;
birincisi *"spec JSON kullanimi (git ls-files)"* ve **takipli her `.json`** içinde
şu regex'i sayıyor (kapının kendi başlığında yazılı):

```
"sleeveStyle"\s*:\s*"([^"]*)"
```

F2, `vision/eval/h10-eksenleri.json` dosyasını **ekledi** (`54f2a0b`). O dosyanın
36. satırı bir **kimlik eşlemesi** taşıyor:

```json
"sleeveStyle": "sleeveStyle",
```

Kapı bunu bir kol DEĞERİ sandı. Ölçülen sonuç, iki ağacın çıktısı yan yana:

| | kol alanı |
|---|---|
| `F2-oncesi` | `ALAN (8): straight none balloon cap bishop fitted puff set-in` |
| `HEAD` | `ALAN (9): straight none balloon cap **sleeveStyle** bishop fitted puff set-in` |

Yeni "değer" hiçbir flat tarafından ifade edilemiyor → `UNEXPRESSED 1`, cırcırın
tavanı `0` → **TAVAN AŞILDI**. Kullanım sayacı da aynı dosyayı gösteriyor:
`kullanim: straight 237 · none 140 · <boş> 38 · balloon 35 · cap 29 · sleeveStyle 1`
— o **38 boş** okuma da F2'nin ikinci yeni dosyasından (`labels-hakem-BOS.json`,
19 foto × 2 blokta boş `sleeveStyle` hücresi); bugün zararsız, çünkü boş dize
eleniyor.

### Neden bu, kartın kendi diliyle bir kalma sebebi

Kartın FAZ KAPISI md.1'i şart koşuyor: *"altı ad tam olarak miras altı … **Yedinci
ad = faz kapanmaz.**"* Ajan kartına *"6 failed / 119 — tam miras altı, **yedinci ad
YOK**"* yazdı. **Ölçülen 7.** Bu, bu koşuda **üçüncü** kez bir kartın kırmızı bir
kapıyı yeşil bildirmesidir (`b791db5`, `cd3bea3`, bugün `3c1835f`).

---

## 2. KALAN KAPILAR — hepsini hakem kendi koşturdu

| komut | ÖLÇÜLEN | kart ne demişti |
|---|---|---|
| `cmake --build engine/build -j8` | exit 0 | exit 0 ✅ |
| `ctest --output-on-failure` | **7 failed / 119** ⛔ | 6 failed / 119 ❌ |
| `ctest -R hedef_kosu` / doğrudan | **EXIT 0**, `CIRCIR SAĞLAM` | Passed ✅ |
| `ctest -R indir_check` / doğrudan | **EXIT 0**, `İNDİR KAPISI: YEŞİL` | Passed ✅ |
| `bash engine/tests/vocab_reference_check.sh` | **EXIT 0**, `HUKUM: YESIL`, toplam **10276** / taban **10438** (delta −162) | aynı ✅ |
| `python3 -m pytest -q` | **23 passed** | 23 passed ✅ |
| `git status` | temiz (` M KOSU-v7.md` + takipsiz `patterns_real/` — koşu öncesinden) | ✅ |

**`patterns_real/` PUSHLANMADI.** `git diff --name-only F2-oncesi..HEAD -- patterns_real/`
**boş**; üç takipsiz kalem takipsiz duruyor. K10 yasağına uyuldu.

**Kart dışına taşma YOK.** `git diff --stat F2-oncesi..HEAD`: 25 dosya, +2474/−6.
Silinen 10 dosya `_dropped` fotoğraflarıdır (kartın emri). Kaynak kodda dokunulan
tek yer `web/js/provenance.js`; `create.js` · `download.js` · `pdf-core.js` ·
`flat-core.js` **bayt bayt el değmemiş**. `vocab_reference_check.sh` ve tabanına
dokunulmamış (§3.8 md.4 ihlali yok).

### Cırcır — hakemin kendi koşusu, n=5

| | H1 | H2 | H3 | H5 | H8 | H10 | H10a | H10b | H10x | H10e | H11 |
|---|----|----|----|----|----|-----|------|------|------|------|-----|
| taban | 5/5 | %92.2 | 4 | 0 | 31 | %58.3 | — | — | — | — | 3.0 ms |
| **F2 sonrası** | **5/5** | **%92.2** | **4** | **0** | **31** | **%58.3** | %0 | %0 | %58.3 | 4 | 2.9 ms |

Hiçbiri kötüleşmedi. H4/H6/H9 **ÖLÇEMEDİM** olarak duruyor (üç fazdır).

---

## 3. HAKEMİN KENDİ MUTASYONLARI — altı tane, üçü ajanın HİÇ DOKUNMADIĞI dosyada

§3.8 md.3. Loga güvenilmedi, hepsi baştan koşuldu ve **hepsi geri alındı**.

| # | dosya | ajan dokundu mu | ne bozuldu | ÖLÇÜLEN |
|---|---|---|---|---|
| H-M1 | `web/js/create.js` | **HAYIR** | `hemFlounce` `spec` varsayılanından silinir (K13 / eski H2-A) | **EXIT 8** — `37 axes parsed from create.js (floor 38)` |
| H-M2 | `web/js/download.js` | **HAYIR** | `flatSVG` köken damgasını atlar | **EXIT 8**, 4 FAIL (`cikarildi=undefined toplam=undefined`) |
| H-M3 | `web/lib/pdf-core.js` | **HAYIR** | A4 kapağından `Origin / Köken` başlığı silinir | **EXIT 8** — `the A4 cover has an Origin block` |
| H-M4 | `web/js/provenance.js` | evet | `gorunurlukCelismesi` hep temiz döner (İŞ 3) | **EXIT 8**, 4 FAIL — üç kaçış yönü + kayıtsız eksen |
| H-M5 | `vision/eval/labels-hakem-BOS.json` | evet | şablona **tek** dolu hücre | **pytest 1 failed / 22 passed** |
| H-M6 | `engine/tests/hedef_kosu.mjs` | evet | `INF_X = 0` (ayrışma H10'u tüketmez) | **EXIT 2** — `AYRIŞMA BOZUK: 0 + 0 + 0 != 70` |

**H-M1 K13'ü kapatıyor.** F0'da bu mutasyon **EXIT 0** ile kaçıyordu; bugün EXIT 8.
K13 hakem tarafından **kapalı** sayıldı.

---

## 4. HAKEMİN KENDİ İŞİ — 19 FOTOĞRAFIN GÖZ ETİKETİ KONDU

Kartın hakeme yüklediği iş (§1F md.3). **19 fotoğrafın 19'u açıldı ve bakıldı.**
Cevap anahtarı: **`vision/eval/labels-hakem.json`** (takipli), her satırında
`credits.json`'dan gelen künye + dosyanın **sha256**'sı.

`labels-hakem-BOS.json` **BOŞ BIRAKILDI** ve öyle kalacak: o dosya, faz ajanının
kendi notunu kendi vermediğinin kanıtıdır ve `test_hakem_sablonu_bos_gelir` onu
boş tutuyor. Cevap anahtarı ayrı bir dosyadır (K14).

**Üç durum, tahmin yok:**
- `deger`: enum değeri = gördüm ve yargıladım · `null` = bu fotoğraf bu ekseni
  **gösteremez** · `"göremedim"` = çerçevede ama yargılayamadım (örtülü / bulanık /
  enumda karşılığı yok). §0B md.3, en kısıtlayıcı.
- `gorunurluk`: `true` = görünüyor · `false` = görünmesi mümkün değil · `""` =
  göremedim, **iki sayıya da yazılmaz**.

**Doluluk:**

| blok | hücre | doldu | oran |
|---|---|---|---|
| `gorunurluk` (19 × 24) | 456 | **431** (görünür 281 + görünemez 150) | **%94.5** |
| `deger` (19 × 12) | 228 | 143 yargı + 33 `null` + **52 göremedim** | — |

**24 eksenin 24'ünün artık sütunu var** — F2'nin ölçtüğü *"13 eksenin sütunu bile
yok"* kusuru **kapandı**.

### 4a. Ayrışma bu etiketle ÇALIŞIYOR — kartın asıl sorusunun cevabı

Aynı 5 fixture fotoğrafı, aynı 70 çıkarılmış alan, hakemin etiketine karşı:

| | H10a | H10b | H10x | toplam |
|---|---|---|---|---|
| bugün (makine beyanı) | %0 (0/120) | %0 (0/120) | %58.3 (70/120) | 70 |
| **hakemin etiketiyle** | **%17.5 (21/120)** | **%40.0 (48/120)** | **%0.8 (1/120)** | **70** |

**21 + 48 + 1 = 70.** Kartın DEĞİŞMEZLER şartı ilk kez tutuyor ve H10a+H10b
70'in **69'unu** kaplıyor. Yani: **F2'nin kurduğu ayrışma mekanizması DOĞRU;
eksik olan tek şey veriydi, ve veri artık var.**

### 4b. H2 insan etiketine karşı — ve bunun neden bir kazanım OLMADIĞI

| cevap anahtarı | H2 |
|---|---|
| makine (`labels.json`, Fable) | **47/51 = %92.2** ← kapının bugün bastığı sayı, hakem birebir tekrarladı |
| **hakem (göz)** | **40/42 = %95.2** |

⚠ **BU BİR İYİLEŞME DEĞİL, CEVAP ANAHTARININ DEĞİŞMESİDİR.** Payda **51 → 42**
düştü çünkü hakem, makinenin kendine sorduğu **9 yargıyı fotoğraftan yapmayı
REDDETTİ**. Kalan iki gerçek uyuşmazlık:

- `01` — `shaping`: hat **`princess`**, göz **`dart`**
- `03` — `skirtStyle`: hat **`straight`**, göz **`aLine`**

Yüzdeyi bir cırcır kazanımı gibi okumak yasaktır ve tabana o yüzden **yazılmadı**.

### 4c. Göz etiketinin bulduğu, kimsenin sormadığı şey

F2 *"dosya adı içerik değil arama terimidir"* diye ölçmüştü. **Hakemin gözü aynı
kusuru havuzda KALAN 19'da da buldu** — F2 yalnız düşürülen 10'da aramıştı:

- `05-empire-waist-gown.jpg` → bel **EMPIRE DEĞİL**, normal belde (18. yy açık robe).
- `15-square-neckline-dress.jpg` → **kare yaka görünmüyor**; ön gövde taşınan bezle örtülü.
- `30-linen-dress-mannequin.jpg` → **keten değil**, yatay katlı **plise** (Fortuny tipi).

Üçü de bugün `labels.json`'da makinenin doğru cevabı olarak duruyor.

---

## 5. ÖLÇÜM SETİ — HAKEM SEÇTİ (§3.8 md.2)

Taban dosyasına yazıldı (`_olcum_seti`). Faz ajanı seçemez.

**HEDEF 10:** `01` `02` `03` `04` `05` `13` `31` `32` `37` `38`
Beşi mühürlü fixture'da **bankalı** → n 5→10 için 14 değil **5** yeni VLM turu.
Eklenen beşi ölçülen bir aralığı kapatıyor (görünür eksen /24): `13`→8 · `31`→9 ·
`38`→14 · `37`→14 · `32`→16. Havuzdaki **tek etek** (31), **tek düz-serili
flat-lay** (37), **tek ön-olmayan kadraj** (38) ve **giysi türünün bile
görünmediği tek hal** (13) bu beşte.

**YEDEK 5 (holdout):** `10` `14` `15` `34` `36` — görünür eksen 3 · 20 · 10 · 19 · 12,
hedef setin aralığını aynalıyor. **Faz ajanı koşturamaz, ayarlayamaz, etiketine
bakamaz; yalnız hakem koşturur.** Hedef ile yedek arasında açılan fark **ayar
kanıtıdır ve kırmızıdır.** Liste açıkça yazıldı: tek repoda gerçek gizlilik yoktur
(ajan 19 dosyayı hash'leyip eşleyebilir), o yüzden koruma **sahte bir sır değil
yazılı bir kuraldır** (K16).

Kullanılmayan 4: `11` `12` `30` `35`.

---

## 6. SAPMA SORUSU — ölçüldü

> *"Bir yabancı fotoğraf yükleyip kalıp + flat indirebiliyor muyum, indirdiğimin
> hangi alanı nereden geldi görebiliyor muyum, ve fotoğrafta **GÖRÜNEN** alanları
> bir önceki fazdan **daha çok** mı alabiliyorum?"*

1. **İNİYOR.** `indir_check` EXIT 0, `Logs/indir-check/` altında 7 dosya. (Hakem
   dosya listesini gördü. **Gerçek tarayıcıda tıklanmadı — DOĞRULANMADI**, repoda
   headless harness yok, üç fazdır böyle.)
2. **GÖRÜLEBİLİYOR**, ve F2 bunu 10 değil **38 eksende** yargılatıyor
   (H-M1: 38→37 düşüşü artık EXIT 8).
3. ⛔ **HAYIR — DAHA ÇOK ALAMIYORUM.** H2 %92.2 → %92.2, H10 %58.3 → %58.3.
   Çıkarım hattına tek satır girmedi.

**Bu bir sapma mıdır — HAYIR, ve gerekçe "altyapı hazırlandı" değil ölçülen üç sayı:**
(a) havuz **29 → 19** ve 19'unun künyesi **sha256 kimliğiyle** kanıtlı;
(b) hakemin H2-A kaçış yolu **EXIT 0 → EXIT 8**;
(c) ayrışma mekanizması, hakemin etiketiyle beslendiğinde **0/0/70 → 21/48/1**
üretti, yani mekanizma yanlış değil, verisizdi.

Kartın kendi sapma sorusu (*"doğru cevabı bir insan mı söylüyor?"*) **bugün de
HAYIR** — ama artık cevap anahtarı **diskte ve takipli**; eksik olan onu kapıya
bağlayan koddur, ve o kod faz ajanının işidir (§3.7).

---

## 7. NEDEN "GERİ AL" DEĞİL — ölçülen orantı

Kartın NOTLAR bölümü *"Aynı sınıf hata bu koşuda iki kez oldu … Üçüncüsü GERİ
AL'dır"* diyor ve bu üçüncüsü. Hakem o cümleyi **uygulamadı** ve gerekçesini
saklamıyor (K15):

- Yedinci kırmızının nedeni **tek bir satır**, ve o satır **üretilmiş bir veri
  dosyasında** (`h10-eksenleri.json:36`, `node hedef_kosu.mjs --eksenler`
  çıktısı). Çekirdek işte değil.
- Geri almanın bedeli ölçülü: **2474 satır**, künyesi sha256 ile kanıtlanmış
  **19 fotoğraflık havuz**, **K13'ün kapanışı** (hakem H-M1 ile doğruladı),
  etiketin doğruluğunu koruyan **§10-(j)** (H-M4: 4 FAIL), ve ayrışma
  mekanizması — ki hakem onu **21/48/1 ile çalışır ölçtü**.
- Emsal: `K1` (F-İNDİR) ve F0 1. tur, ikisi de aynı sınıfta **KALDI** aldı ve
  ölçütleri şuydu: *fazın ürünü ölçülerek sağlam mı?* Bugün cevap **evet**.

Kanıtlanmış bir kazanımı, üretilmiş bir dosyadaki bir satır yüzünden silmek
orantısızdır. **KALDI** yeterli ve daha ucuz: ikinci turun tek zorunlu işi bir
satırlık çarpışmayı kaldırmaktır.

---

## 8. K12 / K9 — ne oldu

- **K12** (`vocab_reference_check` bir SATIR sayacıdır): F2 kapıyı **hiçbir cümleyi
  yeniden yazarak geçmedi.** Hakem ölçtü: kapsam içi `hemFlounce` **26 → 26**,
  toplam **10276 → 10276** = fazın sözlüğe **net etkisi 0 satır**. Kapsam içinde
  dokunulan tek dosya `web/js/provenance.js` ve oraya tek bir eksen adı dize
  sabiti yazılmamış. Kapının kusuru **kapatılmadı** — borç, silinmedi.
- **K9** (`H3 = 4` gevşetilmedi): `hedef_kosu.mjs`'in H3 tanımı ve eşiği
  **değişmedi** (hakem diffe baktı: dosyadaki değişiklik H10 ayrışması ve `--eksenler`
  bayrağı, H3'ün satırları değil). İlan kanalı ölçüm hattına **bağlanmadı**, H3
  düşmedi, F2'nin hanesine bir düşüş **yazılmıyor.**

---

## 9. HAKEMİN BULDUĞU, KİMSENİN SORMADIĞI — ve ÖLÇEMEDİKLERİ

**Bulunan:**
1. ⭐ **Takipli bir JSON'a bir eksen ADI değer olarak yazmak bir kapıyı kırmızı
   yakabiliyor.** `flat_expresses_spec_check` **takipli her `.json`'ı** tarıyor
   ve kimlik eşlemesini bir enum değeri sanıyor. Bu bir F2 kusuru olmanın ötesinde
   bir **kapı kusurudur**: `vision/eval/` ölçüm verisidir, ürün spec'i değil, ama
   kapı ikisini ayırmıyor. **Yeni borç (K17).**
2. **`vision/eval/labels.json`'un `_note` satırı bugün YANLIŞ** (*"Dropped files …
   kept on disk"* — dosyalar silindi). Dosya §3.8 md.2 mührüyle korunuyor, ajan
   doğru davranıp dokunmadı. **Hakem kalemi, hakem de dokunmadı** (mühür hakem
   için de mühürdür; H2'nin bugünkü sayısı o dosyadan okunuyor ve tek bayt
   değişirse taban kıyaslanamaz olur). Kayıtta durur.
3. **H2'nin paydası cevap anahtarına bağlı ve kimse bunu ölçmemişti.** 51 → 42.
   Bir modelin kendi etiketine karşı ölçülen isabetin şişkinliği yalnız **payda**
   değil; makine, bir insanın fotoğraftan yapmayı reddettiği **9 yargıyı**
   yapıyor. H2 %92.2'nin *"geçici"* olmasının asıl büyüklüğü budur.
4. **`.github/workflows/pages.yml:23` hâlâ `branches: [main]`** — main'e her push
   canlıya çıkıyor ve main şu an **yedi kırmızıyla** yayında. F0 hakemi de yazmıştı,
   **kapanmadı**.
5. **K10 hâlâ açık:** repo PUBLIC, `patterns_real/` origin/main'de. F2 tek dosya
   eklemedi (doğrulandı), ama kalem duruyor. **Damla kararı.**
6. `conftest.py` bu koşuda kök dizine **yeni** eklendi (F2, +34 satır) ve
   `python3 -m pytest -q`'nun kapsamını belirliyor. Hakem içeriğine baktı, kapsam
   gerekçeli ve dört `test_*.py`'nin hiçbiri silinmemiş; **ama bir kapsam
   dosyasının kendisi bir kapı yüzeyidir ve hiçbir mutasyonla korunmuyor.**

**Ölçemedikleri — DOĞRULANMADI:**
- **Gerçek tarayıcıda hiç tıklanmadı.** Repoda headless harness yok. Bütün indirme
  hükmü `indir_check`'in node koşusuna dayanıyor.
- **Künyelerin hukuki doğruluğu yorumlanmadı.** `credits.json` Commons
  `extmetadata`'sını olduğu gibi taşıyor; hakem sha256 kimliğini **tek tek
  doğrulamadı**, `test_her_fotografin_kanitli_kunyesi_var`'ın 19 parametrik
  koşusunun yeşiline dayandı.
- **n=5'in ötesi ölçülmedi.** Havuz 19, ölçülen 5. Hedef 10 ve yedek 5 **seçildi
  ama koşulmadı** (5 yeni VLM turu = para; hakem harcamadı).
- **Miras 6 kırmızının kök sebebi bu turda da aranmadı** (dört fazdır).
- **H4 / H6 / H9 ÖLÇEMEDİM**, H5 yalnız `armhole↔sleeve_cap` çiftinden okunuyor.
- **H10e = 4** hakem tarafından insan etiketiyle **yeniden ölçülmedi**.
- İnen 7 dosyanın **5'i hâlâ sessiz** (`a0.pdf` · `.dxf` · düz `.svg` ·
  `…-flat.svg` · `…-a4.pdf`) — hakem bu turda **greple tekrar saymadı**, F0
  hakeminin ölçümüne dayanıyor.

---

## 10. BORÇ — 22 devraldı, 1 kapandı, 21 + 2 yeni devrediyor

**Kapanan: K13** (`KOKEN_ALANLARI` 38'den düşünce kapı yanmıyordu) — H-M1 ile
hakem tarafından doğrulandı, **EXIT 8**.

**Yeni:**
- **K17** — `flat_expresses_spec_check` **takipli her `.json`'ı** ürün spec'i
  sayıyor; ölçüm verisi (`vision/eval/`) ile spec ayrılmıyor. Bu turun yedinci
  kırmızısının kök sebebi.
- **23.** `conftest.py` bir kapsam kapısıdır ve **hiçbir mutasyonla korunmuyor**;
  kapsamı daraltmak bugün sessizce mümkün.

Kalan 21 madde silinmedi, hiçbiri kapatılmadı.
