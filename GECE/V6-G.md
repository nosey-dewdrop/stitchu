# V6-G — EDİTLEME ZİNCİRİNE SİCİL REDDİ + ÇIPA + SONRA ÖLÇÜMÜ (25 Ağu 2026)

Değişen dosyalar: `engine/tools/spec-diff.mjs`, `engine/tests/edit_locality_check.mjs`,
`engine/tools/foto-spec-olcum.mjs`. `contract/` altına **YAZILMADI** — `anchors-v1.json`
sadece OKUNDU (o dosyayı V6-F yeniden yazıyor). Ham çıktılar:
`GECE/log/V6-G.olcum.txt` · `GECE/log/V6-G.mutasyon.txt`.

Bu dosyadaki her sayı bu gece kendi komutumla üretildi. ÖNCE sayıları `GECE/V6-A.md`'den
devralınmadı, aynı komutla yeniden basıldı.

---

## 1. OPERATÖR SİCİL REDDİ (kart md. 1)

`spec-diff.mjs`'e `operatorSicil(spec, dokunulanAlanlar)` eklendi. Kural uydurulmadı,
`contract/garment-spec-v2.json` `topology._role`'den okundu: *"bir değer, gerektirdiği
operatörlerden biri `shipped` değilse İFADE EDİLEMEZ ve red o operatörün ADIYLA verilir."*

- Sicil, diff **UYGULANDIKTAN SONRAKİ** spec'e sorulur (kart md. 1).
- Red cümlesi operatörün **ADI + STATÜSÜ**'nü taşır ve alanın diff'te geçip geçmediğini söyler:
  ```
  SİCİL — OPERATÖR SEVK EDİLMEDİ: 'sleeve' statüsü ABSENT
  (gereken: sleeveStyle='balloon' -> v2 sleeve='puff', bu alan DIFF'TE geçiyor)
  ```
- v1 alan → v2 eksen eşlemesi (`garment/skirtStyle/sleeveStyle/shaping/collarType/backOpening`)
  `spec-diff.mjs:AXIS_MAP`'te **açık yazılı ve tartışmaya açıktır**. Eşleme benim, statü
  sözleşmenin. Karşılığı olmayan değer (`skirtStyle='halfCircle'`) operatörü SUÇLAMAZ,
  `enumsuz` diye ayrı sayılır.

### Ölçülmüş çelişki — ÇÖZÜLMEDİ, ADIYLA kayda geçiyor

Sicil `sleeve` · `collarFamily` · `skirtFamily` için **absent** diyor. Ama sevk edilen web
motoru aynı vakalarda **`Puff Sleeve` ve `Peter Pan Collar` panellerini BASIYOR** — bu gecenin
kapı çıktısında görünüyor (`edit_locality_check` "yakayı değiştir (bebe yaka)" vakası bölge
dışında `Sleeve` paneli tutuyor, yani kol paneli VAR).

Kart bu çelişkiyi çözmeyi yasakladı. Yapılan: sicil reddi **UYARI KANALI** (`r.sicil`);
hattı kesmez, 12 yeşil lokallik vakasının hiçbirini kırmaz. Kapı `operatorGate: true` ile
**açıkça** istenir (CLI: `--sicil-kapi`) — RULES 4 gereği yeni özellik opt-in, varsayılan
KAPALI. Sessiz geçiş yok: kapı kapalıyken bile red ADIYLA basılır.

⚠ **ÇELİŞKİ AÇIK KALDI, isimleriyle:** `contract/garment-spec-v2.json` sicili
`web/js/engine.js` + `engine/dist/stitchu-engine.js` hattını DEĞİL, `engine/src/surfacepattern.cpp`
yüzey hattını tarif ediyor. İki motor var, tek sicil var. Hangisinin doğru olduğu
**KARARA BAĞLANMADI**. Sicil bugün, sevk edilen web motoru için **YANLIŞ NEGATİF** basıyor
olabilir; bu ölçülmedi.

Yan not: eski sözlük aşamasının adı `'sicil'` → **`'sözlük'`** oldu (o aşama VOCAB +
composition'a bakar). `'sicil'` adı artık operatör siciline ait. Tek tüketici
`edit_locality_check.mjs` (`stage !== 'tamam'`), etkilenmedi.

## 2. ÇIPA + ORAN (kart md. 2)

Diff şeması genişletildi: `{ op, field, value, why?, anchor?, t? }`.

- `anchor` = **ÜRETİLMİŞ** çıpa sözlüğündeki bir AD. Elde yazılmış liste YOK:
  `anchorNames()` her koşuda `contract/anchors-v1.json`'ı okur. Bu gece **19 çıpa**.
  Sözlükte olmayan çıpa → ADIYLA red, geçerli çıpalar listelenerek.
  Sözlük okunamazsa/boşsa → çıpa kullanan diff **reddedilir** (sessiz kabul yok).
- `t` = 0..1 oran ofseti. Aralık dışı → ADIYLA red (`t=1.4 (anchor='neckZone', geçerli 0..1)`).
  `anchor` olmadan `t` → red.
- **Anahtar listesi KAPALI.** Şemada olmayan her anahtar ADIYLA geri çevrilir:
  `op[0]: 'x' diff şemasında YOK — konum yalnız 'anchor' + 't' ile ifade edilir,
  koordinat/vertex gönderilemez`. Şemaya **koordinat alanı EKLENMEDİ** (kart ★).

⚠ **DÜRÜSTLÜK — ÇIPA BUGÜN BİR KAPIDIR, BİR YERLEŞTİRME DEĞİL.** `applyDiff` yalnız
`field`/`value` tüketir; `anchor`/`t` doğrulanır, **geometriye henüz bağlanmaz**. Yani
"fiyonku çıpanın %50'sine koy" diff'i bugün kabul edilir ama fiyonk yine bileşenin kendi
varsayılan yerine düşer. Çıpanın geometrik tüketicisi **YAZILMADI** — kalan iş.

## 3. YENİ DENETİM VE FAZ-ÖNCESİ KANITI (kart md. 3 · §4.2)

Ayrı test dosyası **açılmadı**; mevcut `edit_locality_check.mjs`'e A5 (çıpa) ve A6 (sicil)
bölümleri eklendi. Vakalar: (a) geçerli çıpa+oran → kabul, lokallik korunuyor ·
(b) sözlükte olmayan çıpa → red, cümle ÇIPA ADINI taşıyor · (b2) aralık dışı oran →
red · (b3) koordinat anahtarı → red · (c) absent operatör isteyen diff → sicil raporu
operatör ADINI + STATÜSÜNÜ basıyor · (c2) `operatorGate:true` hattı kesiyor ·
(c3) ANTI-HACK: yalnız `shipped` operatör gerektiren spec'te rapor BOŞ (mandal "her şeye
kırmızı basan" ucuz mandal değil).

**Faz-öncesi kod bu denetimi GEÇEMİYOR — ölçüldü:**

```
git worktree add --detach /tmp/v6g-prephase HEAD        (HEAD = 3815c64)
ln -s <repo>/engine/dist /tmp/v6g-prephase/engine/dist  (dist gitignore'da)
cp engine/tests/edit_locality_check.mjs -> worktree
# faz-öncesi spec-diff.mjs'e SADECE veri okuyucu şim eklendi (anchorNames,
# OPERATOR_STATUS, operatorSicil->boş); kapı mantığı BİLEREK eklenmedi.
cd /tmp/v6g-prephase && node engine/tests/edit_locality_check.mjs
```

| | exit | sonuç |
|---|---|---|
| faz-öncesi (HEAD 3815c64) | **1** | **6 KIRMIZI**: (b) (b2) (b3) (c) (c) (c2) |
| faz-sonrası (bu commit) | **0** | hepsi yeşil |

Kırmızı düşen vakaların ADI logda: `GECE/log/V6-G.mutasyon.txt`.
**Test boş değil.** Not: (a) faz-öncesinde de geçiyordu — o vaka bir REDDİ değil,
kabul + lokalliğin bozulmadığını ölçer; şema fazladan anahtarı eskiden sessizce yutuyordu.

## 4. MUTASYON (§4.5) — İKİSİ DE KIRDI, İKİSİ DE GERİ ALINDI

| mutasyon | dosya | exit | kırmızı |
|---|---|---|---|
| **M1** sicil reddini sessizleştir (`operatorSicil` → `rejected: []`) | `engine/tools/spec-diff.mjs` | **1** | 3 — (c) (c) (c2) |
| **M2** çıpa doğrulamasını atla (anahtar/anchor/t denetimleri kapatıldı) | `engine/tools/spec-diff.mjs` | **1** | 3 — (b) (b2) (b3) |
| taban (mutasyonsuz) | — | 0 | hepsi yeşil |
| geri alma sonrası | — | 0 | hepsi yeşil |

Ham çıktı: `GECE/log/V6-G.mutasyon.txt`.

## 5. SONRA ÖLÇÜMÜ (kart md. 5)

Komut (ÖNCE sayıları da bu komutla yeniden basıldı):

```
node engine/tools/foto-spec-olcum.mjs --offline --bank vision/eval/live-2026-08-22.json
```

| ölçü | ÖNCE (V6-A) | SONRA (bu gece) |
|---|---|---|
| FOTO | 5 | **5** |
| TAM DOĞRU SPEC | 1 / 5 = %20.0 | **1 / 5 = %20.0** |
| ALAN YARGISI | 51, tutan 47 = %92.2 | **51, tutan 47 = %92.2** |
| GORME / KELIME / MOTOR | 4 / 0 / 0 | **4 / 0 / 0** |
| KONUM (kayıp terim) | 11 / 26 = %42.3 | **11 / 26 = %42.3** |

**ALAN İSABETİ DEĞİŞMEDİ, ÇÜNKÜ:** bu gece prompt, görü modeli, `contract/terms.json` ve
`web/js/vocab.gen.js` sözlüğü **değişmedi**. Değişen tek şey diff hattının ŞEMASI ve
KAPILARI; isabet zincirinin hiçbir halkasına dokunulmadı. Kartın beklediği gibi (md. 5 ⚠).
Sayı tahmin edilmedi, aynı komutla yeniden ölçüldü. Canlı `/api/analyze` çağrısı
yapılmadı (§5.3 veto); payda 5'te kaldı, sebebi V6-A md. 1'de.

### KONUM KAPASİTESİ — asıl devir sayısı

26 serbest terimin **15'i** konum ibaresi taşıyor. Bunların kaçı bir çıpayla ifade edilebilir:

| ölçü | sayı | tanım |
|---|---|---|
| **ÖNCE** | **4 / 15 = %26.7** | konumu ancak bir spec ALAN ADI/DEĞERİ tesadüfen taşıyorsa (`topLength=hip`, `shoulderStyle`) |
| **SONRA — SIKI** | **7 / 15 = %46.7** | konum sözcüğü bir çıpa ADININ içinde KELİME olarak geçiyor (`waist`→`band.waist`, `neck`→`band.neck`). Uydurma yok. |
| **SONRA — İLANLI** | **12 / 15 = %80.0** | + `foto-spec-olcum.mjs:ANCHOR_SYNONYM`'da AÇIK yazılı eşanlamlılar: `front/centre/center→cfZone`, `neckline→neckZone`, `empire/dropped/drop/natural→waistZone` |

İki sayı da basılıyor çünkü eşanlamlı tablosu **benim**; sıkı sayı kimseye bağlı değil.

**Kalan boşluk tek sözcük: `bodice` (3 terim).** `lace overlay bodice and sleeves` ·
`lace applique bodice overlay` · `pointed bodice front (stomacher)`. Sözlükte gövde
yüzeyine ait bir çıpa YOK — `surface` çıpası tüm giysiyi kapsıyor, `bodice` demek değil;
bilerek eşlenmedi. V6-A'nın *"en sık kayıp konum `front` (5) ve `bodice` (3)"* bulgusunun
**`front` yarısı kapandı** (cfZone), `bodice` yarısı açık.

★ ÖNCE→SONRA'nın anlamı sınırlıdır: bu, spec'in konumu **ADLANDIRABİLMESİ**dir. Çıpanın
geometrik tüketicisi yok (md. 2'deki dürüstlük notu), yani terim hâlâ ÇİZİLMİYOR.

---

## KART DIŞI FARK EDİLENLER (dokunulmadı)

1. **İKİ MOTOR, TEK SİCİL.** `contract/garment-spec-v2.json` operatör sicili
   `engine/src/surfacepattern.cpp` yüzey hattını anlatıyor (`proof` alanları oraya işaret
   ediyor), ama `spec-diff.mjs` / `edit_locality_check` / `foto-spec-olcum`
   `engine/dist/stitchu-engine.js` + `web/js/engine.js` hattını koşuyor. Sicil o hatta
   sorulduğunda `sleeve`/`collarFamily` ABSENT diyor, hat ise o panelleri BASIYOR.
   Bu md. 1'deki çelişkinin kökü; **DOĞRULANMADI**, kimse ölçmedi.
2. `edit_locality_check` A1 tabanı 10/12 ve atlanan vaka 1 — "manşet ekle" rewrite kipinde
   `cuffStyle requires a sleeve` diye ÜRETİMDE düşüyor. V6-B'den beri aynı, bu gece
   dokunulmadı.
3. `foto-spec-olcum.mjs` V6-A'nın saydığı iki ölü satır (`if (!bank[file]) { /* hata */ }`
   boş gövde; `used` sayacı `--offline` yolunda hiç artmıyor) **hâlâ duruyor** — kart dışı,
   dokunulmadı.
4. `contract/anchors-v1.json` bu gece **19 çıpa**, sha256 `62a66af9b1d94509…`,
   `_granularite: "PANEL"`. Kenar granülaritesi bugün üretilemiyor (V6-C md. 2), yani `t`
   oranının üstünde ölçüleceği KENAR henüz yok: `t` bugün doğrulanan ama tüketilmeyen bir
   alandır. Dosya V6-F tarafından yeniden yazılıyor; bu commit'e **EKLENMEDİ**, ve ona
   bağlı sayılar (19 çıpa, 7/15 sıkı, 12/15 ilanlı) commit'ten hemen önce yeniden koşuldu.
5. `contract/composition.json`'un 22 bileşeninin **hiçbiri bir operatör ilan etmiyor**
   (`id, specField, values, attachment, zOrder, conflictClass, evidence`). Bu yüzden
   alan→operatör köprüsü sözleşmeden okunamadı, `AXIS_MAP` olarak ELDE yazıldı. Köprüyü
   `composition.json`'a bir `requires` alanı olarak taşımak sözleşme değişikliğidir,
   tek taraflı yapılmadı.
