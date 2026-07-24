# Bağımsız Hakem — id31 + id44 (GERÇEK square yaka)

Tarih: 2026-07-21. Hakem: bağımsız agent. Motor/contract/styles/_engine-full DOKUNULMADI.
Üretim: /tmp SVG + Chrome headless PNG + draftJSON ölçüm. worker/kredi kullanılmadı.

## Üretim doğrulaması
`render-garment-flat.mjs` iki hedefi de **REF** döndürdü (viewBox 940 680), FALLBACK yok. → yeşil.

Spec doğrulaması: id31 `neckline=square`, id44 `neckline=square`. İkisi de shirred-bust + peplum; id31 kolsuz (straps wide×2), id44 puff (sleeveStyle balloon, sleeveHead puffed).

## id31 — Daisy Shirred Cami (emsal ar-202411-6)

### KANAT 1 — FLAT (kör test)
- **Yaka SQUARE mı?** EVET. Flat düz yatay taban + iki dik strap kenarı + keskin köşe çiziyor; ön üst kenar düz yatay, arka kare oyuk. SVG'de sıfır arc (`A`) komutu — "round" grep isabetleri yalnız `stroke-linejoin:round` CSS, yaka eğrisi değil. Yuvarlak DEĞİL.
- **Kolsuz mu?** EVET, iki dik geniş askı, kol yok.
- **Shirred büzgü üst göğüste?** EVET, üst göğüs boyunca sık büzgü bandı çizili.
- **Peplum flare?** EVET, hem'de çember etek volanı (skalloplu alt kenar).
- **Emsal-seviye + üçü uyumlu mu?** Emsal (ar-202411-6) aslında YUVARLAK yakalı bir camidir; ancak bu turun direktifi "hedef square" — flat direktife göre square çiziyor ve square+shirred+peplum tek giyside temiz uyumlu.

**FLAT: PASS** (yaka gerçekten square, üç öğe uyumlu).

### KANAT 2 — KALIP
- Validator: **0 issue**.
- Parça: **5** — Top Front, Top Back, Bias binding (neckline + armholes), Shirred Bust Panel, Peplum.
- Shirred panel + peplum parçaları flat ile birebir.

**KALIP: PASS**.

### id31 → ÇİFT KANAT GEÇTİ

## id44 — The OG Top (emsal ar-202432-1)

### KANAT 1 — FLAT (kör test)
- **Yaka SQUARE mı?** EVET. Düz yatay taban + dik iç kenarlar + keskin köşe; sıfır arc komutu. Yuvarlak DEĞİL. Emsalin (ar-202432-1) geniş kare shirred yakasıyla uyumlu.
- **Puff kol?** EVET, iki omuzda kabarık puff kol + manşet çizili.
- **Shirred büzgü üst göğüste?** EVET, sık büzgü bandı üst göğüs boyunca.
- **Peplum flare?** EVET, çember etek volanı hem'de.
- **Emsal-seviye + üçü uyumlu mu?** EVET — square + shirred + peplum + puff dördü tek giyside emsal seviyesinde uyumlu, OG Top'un siluetiyle örtüşüyor.

**FLAT: PASS** (yaka gerçekten square, dört öğe uyumlu).

### KANAT 2 — KALIP
- Validator: **0 issue**.
- Parça: **7** — Top Front, Top Back, Bias binding (neckline), Balloon Sleeve, Sleeve Cuff, Shirred Bust Panel, Peplum.
- Puff kol → Balloon Sleeve + Cuff; shirred panel + peplum parçaları flat ile birebir.

**KALIP: PASS**.

### id44 → ÇİFT KANAT GEÇTİ

## SONUÇ

**2/2 GEÇTİ.**

Yaka her iki hedefte de GERÇEKTEN square (düz taban + dik kenar + keskin köşe, sıfır arc komutu) — önceki crew ikamesinin aksine. Her ikisinde square + shirred-bust + peplum uyumlu; id44 ayrıca puff. Kalıplar 0 validator issue, parça sayıları (5 / 7) flat ile tutarlı.
