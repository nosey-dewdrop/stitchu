# V7-G — RULES 9 ONARIMI: 7. KIRMIZI KÖKÜNDEN KALDIRILDI

**HÜKÜM: `vocab_reference_check` YEŞİL.** Kapı gevşetilmedi, taban yeniden
kesilmedi, SCOPE/EXCL'e dokunulmadı. Kırmızıyı doğuran şey geri alındı.

Commit mesajı: *v7-g: reduce the v7-f registry note to a pointer so the vocab
ratchet stays green*. Aşağıdaki kapı çıktıları, sicil değişikliğinin içerik
commit'i `1eef61d` üstünde ölçüldü; o commit bu raporun/logların eklenmesiyle
`--amend`'lendiği için nihai hash farklıdır (`git log --grep 'v7-g:'`).
`contract/garment-spec-v2.json` ağacı ikisinde de AYNI, yani sayılar geçerli.

---

## 1. NE ÇIKARILDI

Şefin izole ettiği kök doğrulandı: 7. kırmızının tamamı `b85c2c8` (V7-F) ile
`contract/garment-spec-v2.json`'a eklenen ŞERH DÜZ YAZISIDIR. Kod tarafı temiz
(`engine/src/validator.cpp` 22 → 22), sözlük bu gece hiçbir eksen/değer
KAZANMADI, dolayısıyla kapının kendi yasasına göre taban KESİLEMEZDİ.

Sicilden çıkarılan **10 dizgi**, üç yerde:

| yer | alan | ne oldu |
|---|---|---|
| `_serh.V7-F-2026-08-24` | `başlık` | çıkarıldı, yerine kapsam-kayması adı |
| `_serh.V7-F-2026-08-24` | `ölçüm[0..4]` (5 madde) | TAMAMEN çıkarıldı (dosya adları + ham dizgi sayımları) |
| `_serh.V7-F-2026-08-24` | `hüküm` | kuyruğu (iki dosya adı) çıkarıldı, hüküm cümlesi KALDI |
| `_serh.V7-F-2026-08-24` | `KARARA BAĞLANMAMIŞ` | kuyruğu çıkarıldı, soru KALDI |
| `operators.sleeve` | `blockedByStillValid` | `dosya:satır` + sembol alıntısı çıkarıldı, hüküm KALDI |
| `operators.sleeve` | `serh` | üç maddelik kanıt düz yazısı çıkarıldı, karar (B) + kapsam kayması + yol KALDI |

**Sicilde MUTLAKA kalması istenen dördü de yerinde:**

1. `operators.sleeve.status` = **`absent`** — hiçbir status değişmedi
   (`git diff` ile doğrulandı, aşağıda §3).
2. Çelişkinin ADI — `_serh...hüküm`: *"Çelişki bir yalan değil, KAPSAM
   kaymasıdır."*
3. Kanıtın yolu — `_serh...kanıt`: `GECE/V7-F.md` (ayrıca `sleeve.serh` ve
   `sleeve.blockedByStillValid` içinde de).
4. `_statuses.shipped` metninin bugün fiilen yanlış olduğu şerhi — yeni tek
   satır `shippedTanımıBugünYanlış`, **dosya adı vermeden**.

Ek olarak `_serh._neden_isaretci` yazıldı: indirmenin SEBEBİ ve tam metnin YERİ
sicilin kendi içinde duruyor, yani bu bir gizleme değil yer değiştirmedir.

---

## 2. HİÇBİR DOĞRU CÜMLE YOK OLMADI — `grep -F` KANITI

Önce `GECE/V7-F.md`'ye §5 eklendi (çıkarılan dizgilerin kelimesi kelimesine
kopyaları), SONRA sicilden çıkarıldı. Kanıt, `HEAD~1`'deki sicilden okunan
dizgiler `GECE/V7-F.md`'de aranarak üretildi:

```
$ python3 - <<'PY'   # HEAD~1'deki sicilden 10 dizgiyi cikar, her birini grep -F ile ara
  ... git show HEAD~1:contract/garment-spec-v2.json -> json ...
PY
_serh.başlık                     grep -F -> 1  OK
_serh.ölçüm[0]                   grep -F -> 1  OK
_serh.ölçüm[1]                   grep -F -> 1  OK
_serh.ölçüm[2]                   grep -F -> 1  OK
_serh.ölçüm[3]                   grep -F -> 1  OK
_serh.ölçüm[4]                   grep -F -> 1  OK
_serh.hüküm                      grep -F -> 1  OK
_serh.KARARA BAĞLANMAMIŞ         grep -F -> 1  OK
sleeve.blockedByStillValid       grep -F -> 1  OK
sleeve.serh                      grep -F -> 1  OK

10/10 dizgi GECE/V7-F.md icinde KELIMESI KELIMESINE duruyor.
```

`GECE/` kapının SCOPE listesinde YOK (`contract engine/src engine/wasm
engine/tools engine/pattern-bridge engine/vocab.json web/js recipes backend
knowledge`), yani taşınan metin ratchet'e hiç görünmüyor — kelimeler kayboldu
diye değil, sayılmayan bir yere geçtiği için sayı düştü.

---

## 3. KAPI — ÖNCE / SONRA

Tam çıktı: `GECE/log/V7-G.vocab.txt` · `GECE/log/V7-G.gate.txt`

### ÖNCE (`383936e`)
```
taban toplam  : 10438
bugun toplam  : 10438 (delta +0)
  FAIL ARTTI  eksen ADI   garment                 1186 ->  1189  (+3)
  FAIL ARTTI  eksen ADI   sleeveCap                146 ->   147  (+1)
HUKUM: FAIL (2 artan, 0 yeni)
```

### SONRA (içerik commit'i `1eef61d`)
```
taban toplam  : 10438
bugun toplam  : 10432 (delta -6)
  DUSTU  eksen ADI   collarType                81 ->    80
  DUSTU  eksen ADI   sleeveLength             274 ->   273
  DUSTU  eksen ADI   sleeveStyle              351 ->   347
HUKUM: YESIL — hicbir sayi tabanin ustune cikmadi.
```

Taban commit `495d58a` DEĞİŞMEDİ, `--baseline` KULLANILMADI.

### ctest (kart §ŞARTLAR 2)
```
$ ctest --test-dir engine/build -R 'specv2_check|contract_check|vocab_source_check|vocab_reference_check' --output-on-failure
1/4 Test  #92: contract_check ...................***Failed    0.23 sec
2/4 Test  #93: specv2_check .....................   Passed    0.05 sec
3/4 Test #114: vocab_source_check ...............   Passed    0.10 sec
4/4 Test #115: vocab_reference_check ............   Passed    4.28 sec
75% tests passed, 1 tests failed out of 4
```
`contract_check`'in TEK FAIL satırı V7-F'deki ile AYNI: `patterns_real/` altında
**41 takipli telifli dosya**, ilan edilmiş Damla kararı. MİRAS kırmızı, dokunulmadı,
yeni kırmızı ad doğmadı.

### üreteç bekçisi (kart §ŞARTLAR 3)
```
$ node engine/tools/gen-spec-v2.mjs --check
ok: garment-spec-v2.schema.json in sync with contract/garment-spec-v2.json
exit=0
```
Üretilmiş şema kaymadı — beklenen sonuç, çünkü `buildSchema()` yalnız `topology`
+ `quantities` okuyor, `_serh` ve `operators.*.serh` şemaya hiç girmiyor.

### hiçbir status değişmedi
```
$ git diff HEAD~1 HEAD -- contract/garment-spec-v2.json | grep -E '^[+-]' | grep -c '"status"'
0
```
(`"status": "absent"` diff'te yalnız BAĞLAM satırı olarak görünüyor — eklenen ya
da silinen tek bir status satırı yok.)

---

## 4. DOKUNULMAYANLAR

`engine/`, `web/`, `backend/` altında **sıfır** dosya değişti (§ŞARTLAR 5):
```
$ git diff --stat HEAD~1 HEAD
 GECE/V7-F.md                   | +
 contract/garment-spec-v2.json  | +/-
```
Kapı betiği, SCOPE satırı, EXCL listesi ve `vocab-reference-baseline.json`
ELLENMEDİ.
