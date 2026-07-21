# Bağımsız Hakem — id31 + id44 (shirred-bust + peplum top)

İlk kombine test: fizik-shirred primitifi + peplum birlikte, tek giyside. İki hedef, çift kanat geçme kriteri.
Gövde S: bust90 waist72 hip98 shoulder38 backLength40 armLength58 neck36.

## ÜRET
İki hedef de REF (940 680 viewBox), FALLBACK yok. Draft hatasız.

---

## id31 — kolsuz shirred-bust peplum top
Emsal: ar-202411-6.png (Daisy Shirred Cami peplum top).

### KANAT 1 — FLAT (kör test): PASS
- (a) Aynı giysi: EVET. Kolsuz, geniş askılı (wide strap), kare/scoop yakalı üst. Üst göğüste yoğun **shirred büzgü** (üstte sık kırışık tarama) VAR. Bele takılı **peplum flare** (empire hattından aşağı genişleyen dalgalı etek) VAR. İkisi bir giyside.
- (b) Emsal-seviye: Shirred büzgü üstte yoğun, aşağı doğru söner (emsaldeki cami shirred panelle aynı davranış). Peplum kısa flare, dalgalı hem. İki öğe uyumlu. Emsal Daisy'de shirred panel + alta takılı peplum aynı kompozisyon — motor bunu tanınır şekilde çiziyor.

### KANAT 2 — KALIP: PASS
- Draft hatasız, refuse yok.
- Validator **0 issue**.
- Parça: **3** (Top Front, Top Back, Bias binding neckline+armholes) — 3-9 aralığında.
- Peplum ayrı parça değil: empire waistline + peplum=full ile Top Front/Back'e grown-on çiziliyor. Geometri kanıtı: Top Front hem yarı-genişlik 255mm vs üst 169mm → peplum flare gerçekten çizili. Seam by-construction; full-scan jenerik Δmm okunmadı (talimat gereği, peplum-top geometrisine uymaz).

**id31: FLAT PASS + KALIP PASS → GEÇTİ**

---

## id44 — puff-kollu shirred-bust peplum top
Emsal: ar-202432-1.png (The OG Top, square shirred puff peplum).

### KANAT 1 — FLAT (kör test): PASS
- (a) Aynı giysi: EVET. Puff (balon) kısa kollu, kare/scoop yakalı üst. Üst göğüste yoğun **shirred büzgü** VAR. Bele takılı **peplum flare** VAR. Kol başında + kol ucunda büzgü (puff cap) görünüyor.
- (b) Emsal-seviye: Shirred üstte yoğun aşağı söner, peplum kısa dalgalı flare, puff kollar. Emsal OG Top ile aynı silüet: shirred gövde + puff kol + peplum hem. Üç öğe bir giyside uyumlu.

### KANAT 2 — KALIP: PASS
- Draft hatasız, refuse yok.
- Validator **0 issue**.
- Parça: **5** (Top Front, Top Back, Bias binding neckline, Balloon Sleeve, Sleeve Cuff) — 3-9 aralığında.
- Peplum grown-on (id31 ile aynı): Top Front hem 255mm vs üst 178mm → flare çizili. Puff kol + cuff ayrı parça olarak var.

**id44: FLAT PASS + KALIP PASS → GEÇTİ**

---

## ÇIFT KANAT SONUÇ

| Hedef | FLAT | KALIP | Verdict |
|-------|------|-------|---------|
| id31  | PASS | PASS  | GEÇTİ   |
| id44  | PASS | PASS  | GEÇTİ   |

**2/2 GEÇTİ.**

Not: Peplum, top gövdesinde grown-on çiziliyor (ayrı "Peplum" parçası yok) — bu bir kusur değil, empire+peplum=full tasarımının doğru konstruksiyonu; hem-genişlik ölçümü flare'i doğruluyor. Küçük büzgü çizgisi konumu bloklamadı; giysi her iki hedefte de tanınır ve emsal-seviye.

## GECERSIZ (2026-07-22): crew ikamesiyle uretildi, square yaka yok. id31/44 URETILEMEZ isaretlendi. Bu hakem karari SAYILMAZ. Gercek square primitifi eklenince yeniden kosulacak.
