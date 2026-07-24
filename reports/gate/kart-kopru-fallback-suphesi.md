# KART — spec-driven köprü (viewPanel) yanlış çiziyor, GEÇTİ-ADAYI şüphesi

**Açılış:** 2026-07-23 (gathered dirndl turu, Damla eki 1)
**Mühür/karar:** Damla'da. Köprü düzeltmesi AYRI İŞ — bu tur sadece tespit + kart.

## SORUN
`render-garment-flat.mjs` iki flat yolu taşıyor:
1. **Referans kalem** (`tryReferencePen` → `_engine-full.mjs` + styles.json) — viewBox `940 680`, styleKey eşleşen spec'ler buradan çizilir. TEK HAKİKAT.
2. **spec-driven köprü fallback** (`viewPanel` / `renderGarmentFlat`) — viewBox `960 720`, styleKey eşleşmeyen spec bu şematik yola düşer.

Köprü fallback GÜVENİLMEZ: id24 spec'i (vNeck plain-sleeve gathered, shirred=none, sleeveHead=plain) bu yoldan geçince **olmayan shirred bust çizgileri + olmayan puff kol** üretti (bu turda görsel kanıt: /tmp/id24-gathered.png ilk render). Yani köprü, spec'te olmayan öğeleri uyduruyor = İKAME. compile bunu `flatIsReference=false` ile yakalıyor ve ÜRETİLEMEZ sayıyor — AMA driver'ın `isReference` kontrolü bazı fallback flat'leri yine de GEÇTİ-ADAYI'ya sokabiliyor.

## ÖLÇÜM (2026-07-23, faz6 GECTI-ADAYI=24)
Her GECTI-ADAYI hedefin flat'i referans kalemden mi köprüden mi çizildiği ayrıştırıldı (`940 680` vs `960 720`):

- **REFERANS KALEM (23, temiz):** 13,15,18,23,24,27,29,31,41,44,46,47,53,57,58,63,65,68,71,74,82,88,90
- **KÖPRÜ FALLBACK (1, ADAY-ŞÜPHELİ):** **id4**

## id4 ADAY-ŞÜPHELİ (regresyon DEĞİL — önceden de böyleydi)
id4 = top, square, straps=wide, gatherType=shirred(bust), topLength=cropped, closure=buttons.
Beklenen styleKey = `top_cami_sq_wide_shirred` (ASKI ailesi, 2026-07-22 GEÇTİ demişti).
Şu an köprü fallback'e düşüyor (`940 680` YOK). Bu tur öncesi git stash ile teyit: id4 benim gathered değişikliğimden ÖNCE de fallback'teydi (stash'te 4,24,57 fallback). Yani id4'ün "GEÇTİ (hakem-teyitli)" kaydı ile flat'in fallback'ten çizilmesi TUTARSIZ.

Olası kök: id4 spec'inin bir alanı (muhtemelen closure=buttons ya da straps.count) tryReferencePen top cami eşleme koşullarını tutturmuyor → styleKey=null → fallback. Askı turunda id4 renderStyle ile ELLE mi hakeme sokulmuştu (spec-driven köprü değil), o yüzden hakem geçti ama otomatik köprü tutmuyor?

## KARAR (Damla'da)
1. id4'ün styleKey eşleşmesini düzelt (köprü top-cami kuralını id4 spec'iyle tuttur) VE/VEYA
2. Köprü fallback yolunu (viewPanel) TAMAMEN kapat: styleKey eşleşmeyen spec = ÜRETİLEMEZ (ikame yasağı, uydurma öğe riski). compile zaten `flatIsReference=false`→ÜRETİLEMEZ diyor; driver da aynı katılıkta olmalı.
3. GEÇTİ (hakem-teyitli) listesindeki her hedefin flat'i referans kalemden geldiğini bir MANDAL ile garanti et (fallback'ten geçen hedef GEÇTİ sayılamaz).

## NOT
Referans kalem oranı sanılandan İYİ: 23/24 temiz. Köprü fallback sadece 1 hedefte (id4). Damla'nın "22 aday köprüden geçti" endişesi ölçümle daralttı — asıl köprü yükü küçük, ama id4 gerçek bir tutarsızlık.
