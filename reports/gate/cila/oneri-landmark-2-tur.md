# CİLA — Landmark 2. tur: bustApex/underbust/highHip/crotch + serbest-Y taraması

**Tarih:** 2026-07-23 gece maratonu, D2 (artık zaman)
**DURUM: BULGU LİSTESİ + KART. Büyük refactor YAPILMADI. Türetilmiş değerler pin sayılır → Damla kararı.**

## MEVCUT LANDMARK DURUMU (contract/figure-landmarks.json)
Ölçülü: neckBase, shoulderTip, underarm, bustLine, waist, hip(x).
ÖLÇÜLMEDİ (eksik): **bustApex, underbust, highHip, crotch**.

## TÜRETİLMİŞ DEĞERLER (mevcut geometri + literatür oranı — ÖLÇÜLMEDİ değil, kaynağı belli)
| landmark | türetilmiş y | kaynak |
|----------|-------------|--------|
| bustApex.y | 132.2 | bustLine hizası (uaY 112 + (waist 179.2−112)*0.30); x = chest*0.55 (üretim renderer apexHalfX) |
| underbust.y | 150.1 | bust 132.2 + (waist−bust)*0.38 (empire dikiş evi, literatür bust+~5cm) |
| highHip.y | 199.4 | waist 179.2 + (waist−uaY)*0.30 (kaba; hip flat'te etek örtüyor) |
| crotch.y | — | boy referansı, flat gövde-boy kalibre edilmeden türetilemez (bust_height_frac 0.20−0.24 literatür) |

Bu değerler PIN sayılır (drift-lock gerekir) → tabloya EKLENMEDİ, Damla onayı bekliyor.

## SERBEST-Y İHLALLERİ (landmark'a bağlanmamış y-koordinatları)
Bunlar buildHalf'te knob'dan (landmark değil) inen y-değerleri = "serbest Y yasağı" sınıfı:

1. **yokeDrop → bel/empire çizgisi** (line 69 band-top, 77 shoulder-top):
   `yEmp = uaY + yokeDrop*S` — bel/empire dikiş çizgisi `yokeDrop` KNOB'undan iniyor, **underbust/waist landmark'a bağlı DEĞİL**.
   - DOĞRUSU: natural bel → LM.waist, empire/babydoll → LM.underbust (figure-landmarks baglama_kurali zaten böyle diyor ama kod yokeDrop kullanıyor).
   - ETKİ: empire/babydoll stiller (drawstring_babydoll, shirred stiller) bel çizgisini yokeDrop ile koyuyor → underbust landmark kurulunca oraya bağlanmalı.

2. **bustHeight → bustApex y'si** (line 69,103,231):
   `yB = uaY + (yEmp−uaY)*bustHeight` — bust apex/panel y'si `bustHeight` KNOB'undan, **bustApex landmark'a bağlı DEĞİL**.
   - DOĞRUSU: bustApex landmark kurulunca yB = LM.bustApex.y.

## KARAR (Damla'da)
1. Türetilmiş 4 landmark değerini tabloya EKLE + drift-lock (figure_check'e pin) — türetilmiş oldukları AÇIK etiketle, muslin ölçümüyle doğrulanana dek "türetilmiş".
2. Serbest-Y ihlallerini bağla: yokeDrop→underbust/waist, bustHeight→bustApex. AMA bu buildHalf REFACTOR'ü = pinli stiller (babydoll/peterpan/lace_vneck) byte-identical BOZULUR → re-pin gerekir (Damla: re-pin YOK). Bu yüzden BÜYÜK REFACTOR YAPILMADI, kart olarak bırakıldı.
3. Park et (mevcut knob'lar çalışıyor, figürlü okunuyor; landmark bağlama v1.1).

## NOT
Serbest-Y ihlalleri bir KUSUR değil — knob'lar tutarlı sonuç veriyor ve figure_check geçiyor. Ama "landmark'a bağla, serbest Y yasak" ilkesi için bunlar bağlanmalı; bağlama = pinli-stil re-pin (Damla kararı). Türetilmiş değerler muslin numunesiyle doğrulanmalı (ÖLÇÜLMEDİ dürüstlüğü korunuyor).
