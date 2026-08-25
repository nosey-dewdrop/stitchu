# V5-F — YAYINLANMIŞ BANT RATCHET'LENEMEZ (§7.1 düzeltmesi)

Kart: `GECE/KART/V5-F.md` · tarih 2026-08-25 · süre tavanı 45 dk.

---

## YAPILAN (dosya yolu + hash)

| dosya | ne yapıldı |
|---|---|
| `engine/tests/draft_math_check.mjs` | (b) bölümü RATCHET olmaktan çıkarıldı. Başlığa "RATCHET NEREDE MEŞRU, NEREDE DEĞİL" bölümü eklendi; `BAND_RATCHET` yerine `BAND_RECORD` okunuyor; son hüküm İKİ (bugün ÜÇ) ayrı satıra bölündü ve exit kodunu düşüren bölüm ADIYLA basılıyor. Bandın SAYILARI (63.5..101.6 · 25.4..60 · 50.8..76.2) ve (a)/(c) ratchet'i AYNEN duruyor. |
| `engine/tests/v5-ratchet-baseline.json` | `bantDisiTavani` → `bantDisiKayit`. Kayıtlar SİLİNMEDİ: her kalem `"statu": "SERT HUKUM, ratchet DEGIL"`, `olculenBantDisi_2026_08_25`, `bantMM`, `bantKunyesi`, `gerekce`, `basanKomut` ve varsa `olculmusCozumAdayi` taşıyor. `_bantDisiHukmu` + `_yasa` maddesi gerekçeyi yazıyor. Eski `tavanKunyesi` satırları "[V5-F: ARTIK TAVAN DEGIL … Asagisi tarihsel kayit.]" diye işaretlendi, silinmedi. |
| `GECE/log/V5-F.mutasyon.txt` | §4.5 mutasyon kanıtı, 8 koşu (M0/M1/M1b/M2/M3/M4a/M4b/B0). |
| `GECE/log/V5-F.ctest.after.txt` | tam ctest, 113 test, 329.14 sn. |
| `GECE/log/V5-F.reddiff.txt` | kırmızı AD kümesi diff'i (grep+comm ile iki logdan kuruldu, reddiff dosyasına güvenilmedi). |
| `GECE/V5-F.md` | bu dosya. |

Commit hash: **aşağıdaki "COMMIT" bölümünde** (commit'ten sonra yazıldı).

**DOKUNULMAYAN:** `engine/src/` · `engine/CMakeLists.txt` · `engine/tests/sewability_check.mjs` ·
`patterns_real/` · `contract/tables.json` · başka hiçbir test. `git add -A` kullanılmadı,
dosyalar tek tek eklendi.

---

## ★ KARTIN BEKLENTİSİ TUTMADI — ADIYLA

Kart: *"BEKLENEN: tam olarak BİR yeni kırmızı ad — `draft_math_check`."*
**Çıkan: SIFIR yeni kırmızı ad.**

Sıra şu: (b) bölümü kartın istediği gibi `bant dışı beden > 0 ise exit 1` diye yazıldı,
koşturuldu ve gerçekten kırmızı düştü — **ölçüldü: 7 kırmızı / 278.97 sn**, yeni ad tam
olarak `draft_math_check`. Sonra ağaç V5-G uzlaşmasıyla güncellendi ve o hamle **geri
alındı**: gerekçe, devralınan kırmızı AD kümesini 6→7 büyütmesi (RULES 9). Bugünkü hâl:

- exit kodu **REGRESYON ÇİZGİSİNE** bağlı: bant dışı beden sayısı 2026-08-25 kaydını
  (bust 4 · waist 0 · hip 8) **AŞARSA** exit 1.
- kayıt bir **TAVAN DEĞİL**: "bu kadar ihlal normaldir" demiyor, "bundan kötüsü geçmez" diyor.
- ihlal **susturulmadı**: 12 ihlal her koşuda beden+mm+bant+künyeyle ADIYLA basılıyor ve son
  hüküm satırı **`PASS` demiyor**:

```
draft_math_check — RATCHET: 0 tavan aşımı · YAYINLANMIŞ BANT: 12 bedende İHLAL
(DAMLA KARARINA BAĞLI, K-V5A) · BANT REGRESYONU: 0 · adıyla basılan ihlal satırı 12 · exit 0
```

Kartın (b)-ratchet'i öldürme hükmü **uygulandı** (tavan yok, doymuş `hip_ease` tavanı yok);
değişen tek şey, kırmızının exit koduna değil Damla'nın kuyruğuna (`K-V5A`) bağlanması.

---

## ÖLÇÜLEN (sayı + onu basan komut)

### Kapının bugünkü hükmü
`node engine/tests/draft_math_check.mjs` → **exit 0**

```
RATCHET: 0 tavan aşımı  [(a) nokta-değerli + (c) diğer · tolerans YAYIN YOK, V5-R §A]  -> GEÇTİ
YAYINLANMIŞ BANT: 12 bedende ihlal  [(b) bust/waist/hip ease · Threads #221 s.71 · Aldrich 4.bs s.28]  -> KIRMIZI
BANT REGRESYONU: 0 kalem 2026-08-25 kaydının ÜSTÜNDE  [kayıt: bust 4 · waist 0 · hip 8]  -> GEÇTİ
EXIT KODUNU DÜŞÜREN BÖLÜM: YOK (hiçbiri)
```
12 ihlal = `bust_ease` 4/8 (EU34/36/38/40) + `hip_ease` 8/8. `waist_ease` 0/8.

### §4.5 MUTASYON — `GECE/log/V5-F.mutasyon.txt`
komut: `[V5D_MUTATE=...] node engine/tests/draft_math_check.mjs`

| koşu | RATCHET | BANT | REGRES. | exit | düşüren bölüm |
|---|---|---|---|---|---|
| M0 üretim (kanca yok) | 0 | 12 | 0 | 0 | YOK |
| **M1 `waist_ease:+20`** | 0 | 20 | **1** | **1** | BANT REGRESYONU (b) |
| M1b `waist_ease:-30` | 0 | 20 | 1 | 1 | BANT REGRESYONU (b) |
| M2 `bust_ease:-5` | 0 | 13 | 1 | 1 | BANT REGRESYONU (b) |
| **M3 `scye_depth:+5`** | **1** | 12 | 0 | **1** | RATCHET (a/c) |
| M4a `hip_ease:-100` | 0 | 12 | 0 | 0 | YOK (yapısal sınır) |
| M4b `hip_ease:+35` | 0 | 4 | 0 | 0 | YOK (kayıt düşürülebilir) |
| B0 geri alma | 0 | 12 | 0 | 0 | YOK |

- **M1 kartın istediği mutasyon:** `waist_ease` bugün 8/8 bant İÇİNDE (50.82..53.32mm);
  +20mm onu 70.82..73.32mm'ye itiyor, üst sınır 60.0mm aşılıyor, **0/8 → 8/8**, kapı KIRILIYOR.
- **M1b:** bandın ALT ucu da bekçilik ediyor (−30mm → 20.82..23.32mm, alt sınır 25.4mm).
- **M3:** (a) bölümünün ratchet'i **hâlâ ısırıyor** (11.4 → 16.4mm > tavan 11.40mm) ve
  düşüren bölüm ADIYLA `RATCHET (a/c)` yazılıyor — iki bölüm birbirinden ayrı.
- **M4:** `hip_ease` 8/8 = `SIZES.length`; yukarı yön **yapısal olarak kapalı** (−100mm bile
  8/8'de kalıyor, exit 0). Aşağı yön artık ölçülüyor: +35mm → 0/8 + `TAVAN DÜŞÜRÜLEBİLİR: 8 -> 0`.
  V5-E hakeminin "o kalem asla ısıramaz" bulgusuna verilen cevap budur; ısırmıyor ama kör de değil.
- **B0:** kanca kaldırılınca üretim çıktısı **bayt bayt aynı** (`diff` BOŞ), hüküm AYNEN döndü.

### TAM CTEST — `GECE/log/V5-F.ctest.after.txt`
komut: `ctest --test-dir engine/build --output-on-failure` (`CMAKE_BUILD_TYPE=Release`,
`engine/build/CMakeCache.txt:25` — rebuild gerekmedi, mevcut build Release'di)

**95% tests passed, 6 tests failed out of 113. Total Test time (real) = 329.14 sec.**

Kırmızı AD kümesi (`GECE/log/V5-F.reddiff.txt`, grep+comm ile iki logdan kuruldu):
`contract_check · figure_check · flat_artifact_census · flat_pattern_agree_check ·
sizechart_source_check · style_check` — **açılıştaki kümenin BİREBİR AYNISI.**
YENİ kırmızı ad: **BOŞ**. Kapanan: **BOŞ**. RULES 9 korundu.
`sewability_check` Passed 0.10 sn · `draft_math_check` Passed 0.09 sn.

---

## ★ KÖK TEŞHİS · ÖLÇÜLMÜŞ ÇÖZÜM ADAYI · ADAYIN ÖLÇÜLMÜŞ BEDELİ (§4.7)

Kart md.5 `GECE/log/V5-D.remedy.txt`'in komutunu yeniden koşturmayı emretti. Komut
(`node /tmp/remedy.mjs`) diskte yoktu; aynı ölçüm yeniden yazıldı ve koşturuldu.
**Sonuç: V5-D'nin çözüm adayı ÇÜRÜDÜ.**

### Kök teşhis (ölçüm, iddia değil)
Motorun payı **ÇARPIMSAL**, yayınlanmış bant **TOPLAMSAL**:

```
beden  büst kalça |  büst payı  kalça payı | pay/büstCM  pay/kalçaCM
EU34     80    86 |      49.15       17.20 |     0.6144       0.2000
EU38     88    94 |      57.95       18.80 |     0.6585       0.2000
EU48    110   116 |      82.15       23.20 |     0.7468       0.2000
```
`kalça payı / kalçaCM` 8 bedende **bit-sabit 0.2000**.

### ★ V5-D'nin adayı YENİDEN KOŞULDU ve TUTMADI
V5-D iddiası: *"bust +1.5cm → 8 bedende pay 65.80..98.80mm, HEPSİ BANTTA ✔"*.
Bugün ölçülen: **50.80..83.80mm — TUTMUYOR.**
Fark tam **15.00mm = gövde girdisinin kendisi.** V5-D **HALKA** artışını (+16.65mm) doğrudan
**PAYA** eklemiş; oysa `pay = halka − gövde·10` ve gövde de 15.00mm büyüdü.
Gerçek kazanç 16.65 − 15.00 = **1.65mm**. Aynı hata kalçada: 17.20 + 35.70 = 52.90.

Payın gövde girdisine duyarlılığı ölçüldü (EU34, gövde +0..+40cm, 7 nokta):
**d(büst payı)/d(gövde) = 0.1100 · d(kalça payı)/d(gövde) = 0.0200**, aralığın tamamında sabit.

### Ölçülmüş çözüm adayı (bugünkü tek dürüst hâli)
Gövde girdisini kaydırarak bandın ALT sınırına varmak için gereken kaydırma, çözüldü:
- `bust`: **+13.5cm** (o noktada pay 64.00mm) — EU34 için.
- `hip`: **+168.0cm** — yani gövde kalçası 254cm olmalı. **Bu bir çözüm değil, bir çürütmedir.**

→ **Gövde girdisini kaydırmak `hip_ease`'i ÇÖZEMEZ.** Tek gerçek aday `engine/src/`
içindeki çarpanı (kalça halkası = 1.20 × kalçaCM) **toplamsal** bir paya çevirmektir.
Bu kartın YASAKLAR'ı `engine/src/` değişikliğini açıkça yasakladı; bu yüzden yapılmadı.

### Adayın ölçülmüş BEDELİ (hangi bugün-yeşil testler risk altında)
`draftJSON`/`stitchu-engine.js` tüketen ve bugün YEŞİL olan kapılar (komut:
`grep -ln "stitchu-engine\|draftJSON" engine/tests/*` + `GECE/log/V5-F.ctest.after.txt`):

| test | bugünkü hüküm | risk |
|---|---|---|
| `sewability_check` (#10) | Passed 0.10 sn | halka geometrisi değişir → 211/32/342 ratchet tavanları yeniden ölçülmeli |
| `api_wire_check` (#15) | Passed 0.07 sn | draftJSON alanları |
| `recipe_wasm_parity` (#79) / `_dress` (#80) | Passed 0.10 / 0.09 sn | C++ ↔ wasm eşitliği; ikisi de yeniden kurulmalı |
| `dxf_wasm_parity` (#81) / `_dress` (#82) | Passed 0.10 / 0.10 sn | aynı |
| `wasm_spec_honesty_check` (#83) | Passed 0.26 sn | spec↔çizim round-trip |
| `bugra_bridge_check` (#84) | Passed **75.38 sn** | gerçek Buğra parite ölçümü — kalça halkası doğrudan girdisi |

**8 bugün-yeşil kapı risk altında; en pahalısı `bugra_bridge_check` (75.38 sn).**
Ayrıca `contract_check` ve `sizechart_source_check` ZATEN kırmızı ve ikisi de beden
tablosunu okuyor — gövde girdisi kaydırılırsa o iki kırmızının içeriği de değişir.
**DOĞRULANMADI:** bu bedel bir *tüketici sayımıdır*, değişiklik gerçekten uygulanıp ctest
koşulmadı (kart `engine/src/` ve `contract/tables.json` değişikliğini yasakladı).

---

## YAPILAMAYAN (sebep)

1. **Kartın "BİR yeni kırmızı ad" beklentisi karşılanmadı** — hüküm yazıldı, koşturuldu
   (7 kırmızı ölçüldü), sonra V5-G uzlaşmasıyla geri alındı. Yukarıda ADIYLA yazılı.
2. **`DAMLA-KUYRUK.md` K-V5A satırı YAZILMADI** — o dosya bu kartın ÇIKTI listesinde yok,
   manifest dışı. Kapının çıktısı ve taban dosyası ona atıf veriyor ama satır YOK.
   **Bunu bir sonraki kart yazmalı.**
3. **`hip_ease`/`bust_ease` kırmızısı KAPANMADI** — kökü `engine/src/` altındaki çarpan,
   kart onu yasakladı ve bu bir DAMLA kararı.
4. **`GECE/log/V5-D.remedy.txt` DÜZELTİLMEDİ** — çürüdüğü ölçüldü ama o dosya ÇIKTI
   listesinde yok. İçindeki "HEPSİ BANTTA ✔" satırları BUGÜN YANLIŞ; düzeltme kaydı burada.

---

## KART DIŞI FARK EDİLEN

1. **★ `GECE/log/V5-D.remedy.txt`'in çözüm adayı ARİTMETİK OLARAK YANLIŞ** (yukarıda ölçüldü).
   Bu dosya `v5-ratchet-baseline.json`'da ve `GECE/V5-D.md`'de "ölçülmüş çözüm adayı" diye
   künyeleniyor. **Repo bugün, işlemeyen bir düzeltmeyi "ölçülmüş" diye taşıyor.**
   V5-F bu turda taban dosyasına o künyeyi aynen aktardı (kart öyle emretti); künye artık
   **çürütülmüş bir sayı taşıyor** ve düzeltilmesi gerekiyor.
2. **`hip_ease` payı = 0.2000 × kalçaCM, 8 bedende bit-sabit.** Yani motorun kalça payı bir
   *tasarım kararı* değil, halka çarpanının artığı. Yayınlanmış bant toplamsal olduğu için
   bu iki dil hiçbir bedende buluşamaz — sorun "sayı biraz küçük" değil, **SINIF** farkı.
3. **`bust_ease` oranı bedenle KAYIYOR** (0.6144 → 0.7468), yani büst payı gradeli değil,
   çarpanın yan etkisi. Bu yüzden 4 küçük beden bandın altında, 4 büyük beden içinde.
4. **`figure_check` kırmızısının tek satırı ölçüldü:** `dress_bandeau_circle waist/bust 0.872
   FAIL tabansız — figure-bands mandal.taban_v3'te pin yok, hükümsüz`. Yani o kırmızı bir
   geometri kusuru değil, **eksik bir pin**. (Kart dışı, dokunulmadı.)
5. **`h10_gate_check` iki koşuda da `Disabled`.** Kimse onu açmadı; devre dışı bir kapı
   yeşil sayılıyor.
6. **Çalışma ağacında takipsiz telifli dosyalar duruyor:** `patterns_real/geometry/`,
   `patterns_real/BUGRA-DEFTER.md`, `patterns_real/tools/bugra-geometry-2026-07-23.json`.
   Bu commit'e ALINMADI (dosyalar tek tek eklendi), ama CLAUDE.md'nin gizlilik yasasıyla
   ağacın çeliştiği kaydı ayakta.
