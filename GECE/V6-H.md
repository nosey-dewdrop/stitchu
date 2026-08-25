# V6-H — RATCHET BORCUNUN %65'İ ÖDENDİ, KAPI HÂLÂ KIRMIZI (kalan borç ÖLÇÜLMÜŞ VERİ)

Ham çıktılar: `GECE/log/V6-H.kapi.txt` (önce+sonra, HEAD commit'i) ·
`GECE/log/V6-H.3fa8002.txt` (faz öncesi taban) · `GECE/log/V6-H.borc-dagilimi.txt`
(dosya dosya bölünme) · `GECE/log/V6-H.korumalar.txt` · `GECE/log/V6.ctest.final.txt`.
Her sayının yanında onu basan komut var. Commit: `63abc19`.

## HÜKÜM

**KAPI KIRMIZI. `HUKUM: FAIL (7 artan, 0 yeni)` — açılışta `FAIL (20 artan, 0 yeni)` idi.**
Toplam **10478 → 10452**. Gevşetme yok: `vocab_reference_check.sh` DEĞİŞTİRİLMEDİ,
`--baseline` ELLE KESİLMEDİ, hiçbir kapsam daraltılmadı.

## 1. KARTIN ÖNCÜLÜ ÖLÇÜLDÜ VE DOĞRU ÇIKTI (V6-F'in aksine)

Kart: "`3fa8002` (faz ÖNCESİ) yeşildi, bugün kırmızı." Kendim ölçtüm:

```
git worktree add -f -q $WT 3fa8002
bash engine/tests/vocab_reference_check.sh --tree $WT
→ taban toplam 10438 · bugun toplam 10432 (delta -6) · HUKUM: YESIL
```
`GECE/log/V6.ctest.opening.txt:422` de aynı şeyi söylüyor:
`Test #114: vocab_reference_check ... Passed`, ve o koşuda kırmızılar tam olarak
miras 6 addı (9 · 12 · 13 · 20 · 91 · 96).

V6-F'in "kartın öncülü yanlış" hükmü **`ada3bf9`** için doğruydu ama `ada3bf9`
faz öncesi DEĞİL — V6'nın kendi commit'lerini taşıyor. Faz öncesi `3fa8002`'dir
ve orada kapı YEŞİL. → **RULES md.9 anlamında yeni kırmızı AD doğdu; ratchet'in
kendi yasası ("sayi YALNIZ DUSEBILIR") V6 boyunca ihlal edildi.**

## 2. BORÇ DOSYA DOSYA (10478 − 10432 = **+46**)

Kapsam içinde `3fa8002..HEAD` yalnız **4 dosyaya** dokunmuş
(`git diff --stat 3fa8002..HEAD -- <kapsam>`). Her artan kelime için
`grep -Inw` / `grep -InF '"<deger>"'` iki ağaçta ayrı ayrı koşuldu:

| dosya | borç | sınıf |
|---|---|---|
| `contract/anchors-v1.json` | **24** | tekrar eden bileşen adı + ölçülmüş veri |
| `engine/tools/foto-spec-olcum.mjs` | **12** | sözleşme YOLU + elle eşleme + kelime bölücü |
| `engine/tools/spec-diff.mjs` | **7** | sözleşme YOLU + `AXIS_MAP` |
| (kapıyı kırmayan drift) | +3 | `collarType` +1 · `sleeveStyle` +2, ikisi de taban ALTINDA |

`engine/tools/gen-anchors.mjs` **0 satır getiriyor** — ama sebebi masumiyeti değil:
dosya `grep` tarafından İKİLİ (binary) sayılıyor ve kapının `-I` bayrağı onu
tamamen atlıyor (`file engine/tools/gen-anchors.mjs` → "binary data"). Bu bir
kapı deliği; aşağıda kart dışı bulgu 1.

## 3. ONARIM A — ÇIPA SÖZLÜĞÜ: 24 → 4 (bilgi kaybı SIFIR)

Her çıpa bileşenini İKİ KEZ yazıyordu:
```json
"bilesen":      ["backDetail", "backSlit", "exposedZip"],
"bilesenKaynak":["contract/composition.json:components[18].conflictClass", ...]
```
Yol zaten bileşeni adresliyor. Yani `bilesen`, V6-F'in kapattığı `eslesen`
hatasının bir alan ötesi. **Ad dizisi kaldırıldı, kaynak yolu kaldı.**

Bekçi zayıflamadı, GÜÇLENDİ (`engine/tests/anchor_source_check.mjs`):
- eskiden iki YAZILI listeyi kıyaslıyordu; şimdi kaynak yolunu **çözüp**
  `composition.json`'dan id'yi okuyor ve declarer kümesiyle kıyaslıyor.
- `bilesen` alanı geri gelirse **KIRMIZI** (`eslesen` kuralının ikizi).
- Yolu çözülmeyen / var olmayan bileşene işaret eden indeks **KIRMIZI**.

Ölçülen etki (komut: `grep -Inw -e <EKSEN> contract/anchors-v1.json | wc -l`):
`backDetail 1→0 · backSlit 2→0 · buttonRow 1→0 · edgeFinish 1→0 · exposedZip 2→0
· hemShape 1→0 · neckline 5→2 · peplum 1→0 · ruffledStraps 1→0 · shoulderStyle 1→0
· sleeveCap 2→0 · yoke 1→1 · garment 1→1` ve enum değerleri
`keyhole 1→0 · skirt 2→0 · sleeve 1→0`. **Toplam −20.**

## 4. ONARIM B — SÖZLEŞMENİN YOLU ARTIK HARF HARF YAZILMIYOR (−6)

`contract/garment-spec-v2.json` dizesi `grep -w garment` ile EŞLEŞİYOR (`-` kelime
sınırı). Yani her hardcode yol, kapalı bir enuma bir referanstı. İki alet de artık
yolu **üretilmiş kontrattan** okuyor:
`contract/spec-v1-v2-map.json` → `generatedFrom.v2`.
- `engine/tools/spec-diff.mjs`: `garment 6 → 3` (−3)
- `engine/tools/foto-spec-olcum.mjs`: `garment 9 → 6` (−3)

## 5. YAPILMADI, VE NEDEN — `AXIS_MAP` (kartın md.3'ü, ÖLÇÜLDÜ)

Kart "AXIS_MAP'i `engine/vocab.json`/üreteçten OKU" diyor. **Kaynak var:**
`contract/spec-v1-v2-map.json` `AXIS_MAP`'in **altı satırının dördünü** birebir
taşıyor (`garment`, `skirtStyle`, `sleeveStyle`, `shaping` — v2 değerleri ve
`requires` dahil). Uygulandı, ÖLÇÜLDÜ, **GERİ ALINDI**:

- Okumak da **hangi dört alanın** okunacağını yazmayı gerektiriyor, ve v1 alan
  adları eksen adlarının ta kendisi. Referans sayısı **net 0** değişti.
- Sözleşmedeki **17 eksenin hepsini** almak sayıyı düşürürdü, ama bugün
  yargılanmayan **13 ekseni** yargılamaya sokar (ör. `collar` alanı görüde bir
  NESNE, `raw in map` düşer ve `enumsuz`a yeni satırlar basar). Bu bir **KAPSAM
  kararı**, kapı işi değil — RULES md.10 gereği tek taraflı yapılmadı.
- `collarType` ve `backOpening` üretilmiş eşlemede **ZATEN YOK**: onlar görü
  okumasının kendi kelimeleri; şemanın `collar`/`closure` alanları başka bir şey
  (ölçüldü: `collar` = none/stand/shirt/peterPan/mandarin/notched/sailor/other).
  Elde kalmaları tercih değil, **veri gerçeği**.

Gerekçe dosyanın İÇİNE yazıldı. ⚠ İlk yazdığım gerekçe eksen adlarını anıyordu
ve **kapı onları saydı** (ölçüldü: +6, `backOpening` 85→87, `collarType` 81→82);
adlar yorumdan çıkarıldı. V6-F'in aynı tuzağı, ikinci kez.

## 6. KALAN BORÇ — SATIR SATIR, NEDEN ÇIKARILAMIYOR

`HUKUM: FAIL (7 artan)` · toplam +14 (taban 10438'e göre), 3fa8002'ye göre +20.

| eksen | + | nerede | neden çıkarılamıyor |
|---|---|---|---|
| `garment` | +5 | `foto-spec-olcum.mjs` 3 (`r.garment` erişimi + `hasSkirt` mantığı) · `spec-diff.mjs` 1 (`AXIS_MAP` anahtarı) · `anchors-v1.json` 1 (`_kaynaklar.specv2` yolu) | GERÇEK KOD REFERANSI + kaynak künyesi (§5) |
| `neckline` | +4 | `foto-spec-olcum.mjs` 2 (kelime bölücü sözlüğü + `neckZone` eşlemesi) · `anchors-v1.json` 2 | anchors'taki ikisi **motorun bastığı panel ADI**: `"Bias binding (neckline)"`, `"Bias binding (neckline + armholes)"` — `_olculenPaneller` indeksin tabanı, silmek ÖLÇÜLMÜŞ VERİ atmaktır |
| `shaping` | +2 | `foto-spec-olcum.mjs` 1 · `spec-diff.mjs` 1 | §5 |
| `skirtStyle` | +2 | `foto-spec-olcum.mjs` 1 · `spec-diff.mjs` 1 | §5 |
| `yoke` | +2 | `anchors-v1.json` 1 (`_dogmayan` içinde `"overlay.yoke"`) · `foto-spec-olcum.mjs` 1 (kelime bölücü) | `_dogmayan` **doğmayan adın kendisi**; bekçinin 4. kapısı onu ADIYLA doğruluyor |
| `topLength` | +1 | `foto-spec-olcum.mjs` (yorum: camelCase bölme örneği) | bedelsiz düşürülebilir, **kart bu dosyanın mantığını yeniden yazmayı gerektirmiyor**; tek satır için ölçüm hattına dokunulmadı |
| `backOpening` | +1 | `spec-diff.mjs` `AXIS_MAP` | §5 |

**KAPI BU KARTLA YEŞİLE DÖNEMEZ, ve tavanı ölçülü:** `neckline`'ın 2'si ile
`yoke`'un 1'i motorun ÖLÇTÜĞÜ veridir. Onları silmek kartın kendi yasağı
("kapsam daraltarak sayı düşürme YASAK"). Kalan 11 satır bir KAPSAM kararına
bağlı (§5). → **SON ÇARE uygulandı: `DAMLA-KUYRUK.md` → K-V6A. Kapı KIRMIZI
bırakıldı, susturulmadı.**

## 7. KORUMALAR — HİÇBİRİ DÜŞMEDİ (`GECE/log/V6-H.korumalar.txt`)

| komut | beklenen | ölçülen |
|---|---|---|
| `node engine/tests/edit_locality_check.mjs` | exit 0, 12 vaka + A1..A6 | **exit 0**, "hepsi yeşil", A1..A6 hepsi OK |
| `node engine/tests/anchor_source_check.mjs` | exit 0 | **exit 0**, HUKUM YESIL |
| `node engine/tools/gen-anchors.mjs` | 19 çıpa · 7 kenar-oranlı | **19 · 7** (+ 86 panel adı, 390 taslak, 37 doğmayan — hepsi aynı) |
| `foto-spec-olcum.mjs --offline --bank vision/eval/live-2026-08-22.json` | 1/5 · 47/51 · sıkı 7/15 | **TAM DOĞRU SPEC 1 (%20.0)** · **ALAN 51 · tutan 47 (%92.2)** · **SONRA (SIKI) 7/15 (%46.7)** |

## 8. KAPANIŞ ctest

`GECE/log/V6.ctest.final.txt` — komut `ctest --test-dir engine/build --output-on-failure`.
Kırmızı AD kümesi faz öncesiyle karşılaştırması o dosyanın sonunda.

---

## KART DIŞI FARK EDİLENLER (dokunulmadı)

1. **KAPIDA DELİK: `engine/tools/gen-anchors.mjs` HİÇ SAYILMIYOR.** `grep` onu
   ikili dosya sayıyor (`file` → "binary data"; içinde geçersiz/karışık kodlamalı
   bayt var) ve kapının `-I` bayrağı ikili dosyaları atlar. Yani o dosyaya
   istenildiği kadar kapalı-enum adı yazılabilir, ratchet görmez. V6-F'in
   "gen-anchors.mjs 0 satır getiriyor" ölçümü doğruydu ama sebebi bu.
   **Aynı sınıftan başka dosya var mı DOĞRULANMADI** (taramadım).
2. **`contract/anchors-v1.json:_kaynaklar.specv2` muhtemelen ÖLÜ KÜNYE.**
   `gen-anchors.mjs` `SRC.specv2`'yi çıktıya yazıyor ama üretimde kullanıp
   kullanmadığı **DOĞRULANMADI**. Ölüyse silmek `garment`'i +1 düşürür ve bilgi
   kaybı olmaz — ama bir künyeyi ölçmeden atmak V6-D yasasına aykırı, yapmadım.
3. **V6-F'in 2. kart-dışı bulgusu bu kartta da doğrulandı:** kaynağa bağlı her
   kontrat, kaynağın ADINI yazmak zorunda; kapı satır sayıyor. "Her kaydın
   yanında kaynağı dursun" ile "kapalı enum referansı artmasın" aynı anda
   sağlanamıyor. Bu kart bunu **ölçülü** hale getirdi: yolu ÜRETİLMİŞ bir
   kontrattan okumak (§4) bu çatışmayı 6 satırda çözdü, yani çözüm sınıfı
   "kapsam dışı bırak" DEĞİL, "yolu tek yerde tut" olabilir.
4. `spec-diff.mjs` artık `contract/spec-v1-v2-map.json`'a bağımlı. O dosya
   ÜRETİLMİŞ (`gen-spec-v1v2-map.mjs`) ve `generatedFrom.v2` alanı bir kontrat
   haline geldi; alan kaybolursa iki alet birden çöker. Bunu koruyan bir bekçi
   **YOK** (kontrol edilmedi: `contract_check` bakıyor mu, bilmiyorum).
5. `contract_check` (Test #91) faz açılışında da KIRMIZIYDI, miras 6'nın biri.
   Bu kartta ona dokunulmadı.

## GÖREMEDİKLERİM / ERİŞEMEDİKLERİM

- `engine/src/`, `backend/worker.js`, `web/`, `patterns_real/` açılmadı (kart yasağı).
- `engine/tools/gen-vocab.mjs`, `backend/vocab.gen.js` kartın GİRDİ listesindeydi
  ama **açılmadı**: borç bölünmesi (§2) onların kapsam içinde `3fa8002..HEAD`
  boyunca hiç değişmediğini gösterdi, yani borcun kaynağı değiller.
- `foto-spec-olcum.mjs`'in kelime-bölücü sözlüğünü (`'neckline'`, `'yoke'`,
  `'skirt'` gibi jenerik vücut sözcükleri) `engine/vocab.json`'dan üretme
  seçeneği **denenmedi**: koruma md.5'in 26-terim/7-karşılanan sayılarını
  oynatma riski ölçülmedi ve süre tavanı doldu.
- `--baseline` ELLE KESİLMEDİ, `vocab_reference_check.sh`'e DOKUNULMADI.
- Görsel artefakt (PNG) üretilmedi: bu kart bir kontrat+kapı onarımı, RULES md.3'ün
  render adımını gerektiren bir geometri iddiası taşımıyor.
- **SÜRE TAVANI AŞILDI** (~60 dk yerine ~75 dk); iş commit'lendi ve SON ÇARE
  uygulandı.

### 8b. KAPANIŞ ctest — ÖLÇÜLDÜ (komut: `ctest --test-dir engine/build --output-on-failure`)

`GECE/log/V6.ctest.final.txt`, HEAD = `63abc19` (kapı satırı: `olculen: commit HEAD (63abc19)`).
115 test, 273.50 sn, `h10_gate_check` Disabled.

| | faz öncesi (`V6.ctest.opening.txt`) | bugün (`V6.ctest.final.txt`) |
|---|---|---|
| kırmızı ad | 9 · 12 · 13 · 20 · 91 · 96 | 9 · 12 · 13 · 20 · 91 · 96 **+ 115 vocab_reference_check** |

**Miras 6 adın 6'sı DEĞİŞMEDİ; küme BİR AD BÜYÜDÜ ve o ad bu kartın kapısı.**
Bu kart onu 20 artandan 7 artana indirdi ama kapatamadı (§6). RULES md.9 ihlali
V6'ya ait ve K-V6A ile Damla'nın önünde duruyor.
