# Tur 1 — Bağımsız Hakem Raporu (id 23, 88, 90)

Tarih: 2026-07-20. Rol: bağımsız hakem (master directive md 3+10). Üreten ben değilim; ölçüp karar verdim.
Kriter: ÇİFT KANAT — FLAT (kör test) + KALIP (Δmm). İkisi de PASS ise hedef GEÇTİ.

Kısıt uygulandı: motor/golden/.cpp/contract/styles.json/_engine-full.mjs'e DOKUNULMADI. Sadece /tmp'ye üretim + ölçüm. 0 API/kredi.

## Hedef spec'leri (kontrat)
- **id23**: top, boat yaka, kolsuz, princess shaping, hip uzunluk, ön düğme (centerFront). Emsal: "Boatneck Button Down Top" (Jana, princess seam mini top) — kolsuz düğmeli princess top.
- **id88**: top, crew yaka, kolsuz, dart shaping, hip. Emsal: "Clementine Dress & Blouse" — gingham, **kısa puflu kollu**, gevşek/robalı A-siluet, düğmeli bluz.
- **id90**: top, scoop yaka, kolsuz, shaping=null, hip. Emsal: askıda mavi kolsuz üst — net **yuvarlak (scoop)** yaka, düz gevşek siluet.

Not: id90'ın shaping'i null; köprü (mapVisionSpec) 'dart'a default'ladı → kalıp id88 ile birebir aynı çıktı (yaka hariç).

---

## KANAT 1 — FLAT (kör test, Chrome PNG + Read ile görüldü)

Emsal referans kalite bandı: crops/66-2.png (boatneck princess top) ve 10-2.png (bustier) — temiz, figürlü, koltuk altı DÜZGÜN, anatomik dart/princess.

### id23 — FLAT FAIL
- Aynı giysi mi: boat yaka doğru (geniş/düz), kolsuz doğru, hip uzunluk doğru, princess seam çizgileri var, ön düğme markası var. Giysi kimliği DOĞRU.
- Kalite: **kritik kusur** — koltuk altında side seam DIŞA balon/yumru yapıp sonra bele içeri çöküyor (armhole altı "hip-bump" silueti). Emsal 66-2'de bu bölge DÜZ ve içe akıyor. Bu robotik/hatalı, emsalden AYIRT EDİLEBİLİR kötü. 1600px zoom'da doğrulandı, front+back'te de var.
- **VERDICT: FAIL** (doğru giysi ama koltuk-altı silueti robotik/bozuk).

### id88 — FLAT FAIL
- Aynı giysi mi: **HAYIR**. Emsal Clementine = kısa puflu KOLLU, gevşek robalı gingham bluz. Motor flat'i = kolsuz, oturmuş dart top, üstelik front'ta crew spec'ine rağmen belirgin **V-yaka** çizmiş (crew = yuvarlak beklenir). Hem yaka yanlış hem giysi tipi (kollu/gevşek/robalı) emsalle uyuşmuyor.
- **VERDICT: FAIL** (yanlış giysi + yaka spec/çizim uyuşmazlığı).

### id90 — FLAT FAIL
- Aynı giysi mi: **HAYIR**. Emsal net YUVARLAK (scoop) yakalı kolsuz üst. Motor flat'i front'ta derin **V-yaka** çizmiş. scoop ≠ V. Yaka yanlış giysi olarak okunuyor.
- Ayrıca shaping=null → figür yok, düz-tüpsü siluet; id88 flat'iyle neredeyse aynı geometri (sadece yaka eğrisi değişmiş).
- **VERDICT: FAIL** (scoop spec'i derin V çizilmiş, yanlış yaka).

---

## KANAT 2 — KALIP (Δmm, yerel wasm engine.draftJSON, body EU38 90/72/98)

| id | draft | validator issues | parça | worstΔmm | not |
|----|-------|------------------|-------|----------|-----|
| 23 | ✓ | **0** | 5 (CF/SF/CB/SB princess + bias binding) | **~0.0** | princess seam CF(185.5+186.6) = SF(186.6+185.5) Δ≈0.0; armhole 154.0=154.0 |
| 88 | ✓ | **0** | 3 (front/back + bias binding) | **0.71** | shoulder Δ0.12, side seam Δ0.71 |
| 90 | ✓ | **0** | 3 (front/back + bias binding) | **0.71** | 88 ile birebir (shaping default) |

- Hepsi draft ediliyor, hata YOK.
- Motor validator'ı 3'ünde de **0 issue**.
- worstΔ ≤ 3.0mm toleransı: 23 (~0.0), 88 (0.71), 90 (0.71) — hepsi TOLERANS İÇİNDE.
- Parça sayısı: 23→5, 88→3, 90→3. Emsal top bandı 3-8 parça → hepsi BANDDA.

### KALIP VERDICT
- **id23: PASS** (draft ✓, 0 issue, worstΔ≈0.0mm, 5 parça)
- **id88: PASS** (draft ✓, 0 issue, worstΔ0.71mm, 3 parça)
- **id90: PASS** (draft ✓, 0 issue, worstΔ0.71mm, 3 parça)

---

## ÇİFT KANAT SONUÇ

| id | FLAT | KALIP | ÇİFT KANAT |
|----|------|-------|------------|
| 23 | FAIL | PASS  | **GEÇMEDİ** |
| 88 | FAIL | PASS  | **GEÇMEDİ** |
| 90 | FAIL | PASS  | **GEÇMEDİ** |

### KAPSAM: 0/3 GEÇTİ

Kalıp katmanı (Δmm/validator) 3/3 sağlam — geometri problemi yok. Fren tamamen FLAT katmanında.

## Geçmeyenler — hangi kanat, neden, tek cümle düzeltme
- **id23** (FLAT): koltuk-altı side seam dışa balon/yumru yapıyor → armhole altı gövde kavisini emsal (66-2) gibi düz-içe akıtacak şekilde flat side-seam eğrisi düzeltilmeli.
- **id88** (FLAT): crew spec'i front'ta V-yaka çiziliyor (ayrıca emsal kollu/robalı, motor kolsuz) → crew neckline flat'te yuvarlak boyun olarak çizilmeli (front V bug'ı).
- **id90** (FLAT): scoop spec'i front'ta derin V çiziliyor → scoop neckline flat'te kaşık/yuvarlak eğri olarak çizilmeli (scoop≠V).

Ortak kök: FLAT motoru crew/scoop yakaları front'ta V'ye kaçırıyor + kolsuz gövde koltuk-altı silueti (princess'te yumru, dart'ta figürsüz). Kalıp doğru, flat sunum yanlış.

---

## tur1b — FLAT KÖR TEST (yeni flat düzeltmesinden sonra)

Tarih: 2026-07-20. Rol: bağımsız hakem. Yalnız FLAT kör testi (kalıp kanadı önceki turda 3/3 PASS → PASS kabul, tekrar koşulmadı). Kısıt: motor/contract/styles.json/_engine-full.mjs'e DOKUNULMADI, sadece /tmp üretim + Chrome PNG + Read. 0 API/kredi.

Üretim: `renderGarmentFlatAsync` ile 3 flat → /tmp/judge3-{23,88,90}.svg → Chrome headless PNG (900x500) → Read ile görüldü. Emsal bandı: crops/66-2.png (kolsuz princess top, temiz içe-akan koltuk-altı) + 10-2.png (bustier).

### YAKA BULGUSU — DÜZELDİ ✓
Önceki turun ana kusuru (crew/scoop front'ta V-yaka) GİDERİLMİŞ:
- **id23 boat**: geniş + sığ yuvarlak kesim, doğru. Kolsuz doğru.
- **id88 crew**: yuvarlak boyun (V DEĞİL). Emsal "crew"e göre bir tık derin (scoop'a yakın) ama yuvarlak — kabul edilebilir.
- **id90 scoop**: derin + yuvarlak U kesim (V DEĞİL), doğru. Kolsuz doğru.
Üç yakada da V bug'ı yok. Yaka ekseninde emsal-seviye.

### ARMHOLE BALONU — HÂLÂ VAR ✗ (kök kusur giderilmemiş)
Üç flat'te de koltuk-altında side seam DIŞA konveks balon/yumru yapıp sonra bele içeri çöküyor. SVG path'te doğrulandı (id23 front sağ outline): omuz ucu x≈318 → armhole içeri → side seam x≈328'e ŞİŞİYOR (silüetin en geniş noktası koltuk-altı, omuzdan taşıyor). Emsal 66-2'de en geniş nokta omuz/büst; koltuk-altı side seam omuz çizgisinin İÇİNDE, asla dışa taşmaz. Bu balon emsalden AYIRT EDİLEBİLİR robotik kusur, front+back her ikisinde.

### FİGÜR
- **id23 (princess)**: princess seam çizgileri var ama koltuk-altı balonu figürü bozuyor.
- **id88/id90 (dart/null→dart)**: gövde düz kutu — bel oyuğu YOK, büst dart'ı flat'te görünmüyor; hem düz-canlı. Figürsüz + koltuk-altı balonlu.

### id88 SPEC-EMSAL UYUMSUZLUĞU (ayrı not)
Emsal Clementine = kısa puflu KOLLU, gevşek robalı gingham bluz. Motor spec'i = crew kolsuz dart top. Flat verdict'i motorun KENDİ spec'ine göre verildi (crew kolsuz dart top'u emsal-kalite çizdi mi). Sonuç: yaka doğru ama koltuk-altı balonu + figürsüz gövde → emsal-kalite DEĞİL. Spec-emsal tipi uyumsuzluğu köprü/hedef seçimi meselesi, flat kusuru değil.

### VERDICT (tur1b)
| Hedef | FLAT (yeni) | KALIP (önceki tur) | ÇİFT KANAT |
|---|---|---|---|
| id23 | **FAIL** — yaka düzeldi, armhole balonu sürüyor | PASS (Δ≤0.71mm) | FAIL |
| id88 | **FAIL** — yaka düzeldi, armhole balonu + figürsüz | PASS | FAIL |
| id90 | **FAIL** — yaka düzeldi, armhole balonu sürüyor | PASS | FAIL |

**GEÇEN: 0/3.** Yaka bug'ı (V-yaka) tamamen düzeldi — gerçek ilerleme. Ama kabul ölçütü "emsalden ayırt edilemez kötü DEĞİL" ve koltuk-altı side seam balonu üç flat'te de emsalden ayırt edilebilir robotik kusur → tur1b'de hiçbir hedef GEÇMEDİ.

### Kalan tek kusur (bir cümle)
Kolsuz gövdede koltuk-altı side seam'i dışa konveks balon yapıp silüetin en geniş noktasını koltuk-altına taşıyor; emsal (66-2) gibi armhole altını omuz çizgisinin içinde düz-içe akıtacak flat side-seam eğrisi gerekiyor.

---

## tur1c — koltuk-altı balon fix sonrası kör FLAT re-test (id 23, 88, 90)

Tarih: 2026-07-20. Bu tur: motor FLAT çıktısı kolsuz underarm'ı omuz ucunun içine çekmek için yeniden düzeltildi (koltuk-altı balon fix iddiası). KALIP kanadı 3/3 PASS (değişmedi) → PASS kabul. Sadece FLAT'ı kör test ettim. Üretim /tmp'ye, 0 kredi, motora dokunulmadı.

Emsal referans (66-2, 10-2): kolsuz üstlerde koltuk-altı omuzdan aşağı DÜZ/hafif içbükey iner; en geniş nokta omuzdadır, koltuk altında dışa şişen balon YOKTUR.

### id23 (boat + princess) — FLAT **FAIL**
Koltuk-altı hâlâ belirgin dışa-şişen BALON taşıyor: kolsuz kenar omuzdan çıkıp aşağıda dışa yumru yapıp geri dönüyor, en geniş nokta koltuk altında (omuzda değil). Emsalden ayırt edilir derecede robotik/anatomi-dışı. Yaka doğru (boat, düz-geniş), figür+bel oyuğu+düz canlı hem var — ama balon kusuru sürüyor. Fix bu hedefte TUTMADI.

### id88 (crew) — FLAT **PASS**
Koltuk-altı omuzdan düz iner, balon GİTTİ. En geniş nokta omuzda. Crew yaka yuvarlak+doğru, kolsuz, figür bel oyuğu + düz canlı hem var. Emsal seviye.

### id90 (scoop) — FLAT **PASS**
Koltuk-altı düz iner, balon GİTTİ. Geniş yuvarlak scoop yaka doğru (V değil), kolsuz, temiz siluet, bel oyuğu + düz hem var. Emsal seviye.

### Çift kanat özeti
| id | FLAT | KALIP | GEÇTİ? |
|----|------|-------|--------|
| 23 | FAIL | PASS  | HAYIR |
| 88 | PASS | PASS  | EVET |
| 90 | PASS | PASS  | EVET |

**GEÇEN: 2/3** (88, 90).

### Kalan kusur (tek cümle)
Fix crew/scoop'ta balonu temizledi ama id23 (boat + princess) hâlâ koltuk altında dışa-şişen balon taşıyor — princess/boat dalı düzeltmeden hariç kalmış görünüyor.

---

## tur1d — id23 yeniden yargı (bust genişliği underarm içine çekildi, bağımsız hakem)

Motor FLAT'i id23 için bir kez daha düzeltildi (bust genişliği underarm İÇİNE çekildi = yan-dikiş balonu fix). Yeniden üretilip (/tmp/judge5-23.svg → w5.png) gözle yargılandı. Motor/contract/styles.json'a dokunulmadı; sadece üret+gör+karar.

### id23 (boat + princess) — FLAT **PASS**
- **Balon GİTTİ.** Kolsuz kenar/yan dikiş artık omuzdan aşağı temiz iniyor; koltuk altında dışa-şişen yumru yok. En geniş nokta OMUZ hizasında; yan dikiş içeri bel oyuğuna, oradan düz heme akıyor. Önceki tur1c'deki tek kusur (koltuk-altı/armhole balonu) temizlendi — fix bu hedefte TUTTU.
- **Yaka:** geniş+sığ yuvarlak boat/bateau, yüksek oturuyor, omuzdan omuza yakın — doğru (emsal 66-2 geniş-sığ yaka ailesi).
- **Kolsuz:** evet, temiz armhole, kol yok.
- **Princess dikişi:** ön iki eğrisel dikiş armhole ortasından bust apeksinden heme, simetrik, anatomik (66-2 princess yerleşimi). Arka CB dikişi + iki princess çizgisiyle aynalı.
- **Figür:** bel oyuğu belirgin, hem düz+dashed hizalı — emsal seviye.
- Ölçüt "emsalden ayırt edilemez kötü DEĞİL": karşılıyor.

### Çift kanat (id23)
FLAT **PASS** + KALIP **PASS** (kalıp önceki turda geçmişti: 0 issue, Δ≈0mm, 5 parça) → id23 GEÇTİ.

### Bu tur toplam kapsam
| id | FLAT | KALIP | GEÇTİ? |
|----|------|-------|--------|
| 88 | PASS | PASS  | EVET (önceki tur) |
| 90 | PASS | PASS  | EVET (önceki tur) |
| 23 | PASS | PASS  | EVET (tur1d) |

**GEÇEN: 3/3** (88 + 90 + 23). Kolsuz-princess/boat balon kusuru üç hedefte de temizlendi.
