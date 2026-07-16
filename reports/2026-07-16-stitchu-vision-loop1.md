# stitchu — LOOP 1 / PATCH 2.0 (V0: VISION HATA TAKSONOMISI)

> Zincir: DEVAM-VISION-LOOP.md · 2026-07-16 · offline (1 kredi probe hariç 0 canlı çağrı)

---

## PATCH 2.0 — VISION ERROR TAXONOMY (2026-07-16)
- **Ne değişti:** benchmark-58.mjs SUMMARY'ye 3. metrik blok eklendi —
  **vision-accuracy** (kritik alan temiz oranı, DRAWN_SINCE'e dokunulmadan).
  Vision hata taksonomisi çıkarıldı (benchmark-58/vision-error-taxonomy.md, lokal).
  Ortak skor dosyası açıldı (reports/stitchu-vision-progress.md).
- **Sayı öncesi→sonrası:** FULL 22/54 → 22/54 (değişmedi, taksonomi loop'u kod
  düzeltmiyor). YENİ baseline'lar: vision-accuracy **46/53 = %86.8**,
  neckline misreads **5**, ELEMENT ACCURACY 53/103 = %51.5.
- **Dürüst not:** disk üzerindeki cls alanları bayattı (reclassify bellekte kalıp
  diske yazılmıyordu); güncel DRAWN_SINCE ile yeniden sınıflandırınca gerçek tablo
  22/54 çıktı. Motor/golden/DRAWN_SINCE dokunulmadı; deploy yok; kredi harcanmadı.

---

## KREDI PROBE (ilk iş)
Canlı /api/analyze'a 1 foto (x-sb-bench token'lı) gönderildi → geçerli vision
yanıtı döndü (garment="other", tam şema). **KREDİ VAR** (creditAvailable=true).
Probe dışında canlı çağrı yapılmadı — bu loop offline.

## RECLASSIFY (güncel DRAWN_SINCE, results-2026-07-16.json)
| verdict | n |
|---|---|
| FULL | 22 |
| MISSING | 24 |
| WRONG | 7 |
| ERROR | 1 (cache'de spec yok) |
| REJECT-OK | 4 |
| REJECT-FAIL | 1 |

**FULL PATTERN: 22/54.** (Prompt'taki "bugünkü gerçek 22/54" ile birebir.)

## KATMAN ATFI (V0'ın asıl sorusu)
- **VISION-kaynaklı: 7 foto** (tüm WRONG). 6 gerçek yanlış-okuma + 1 gerçek
  garment reddi (corset flat bundle → "other").
- **MOTOR-kaynaklı: 24 foto** (tüm MISSING). Vision doğru okudu, motorun
  çizemediği out-of-vocab öğe var.
- **KÖPRÜ-kaynaklı: 0 foto.** Hiçbir foto L2'nin bir alanı düşürmesinden
  kaybetmiyor. Kayıp temiz şekilde VISION vs MOTOR bölünüyor.

## dominantErrorField = neckline
WRONG alan frekansı: **neckline 5**, garment(reject) 1, shaping 1.
Ön/arka çelişki alan frekansı: **neckline 5 ürün**, shaping 3, closure 2, straps 2.
Yaka her iki eksende de tepe.

## frontBackConflicts = 15
11 çok-fotolu ürün, 8'i en az bir kritik alanda çelişiyor. Kozmetik collar
name="" vs "none" farkları hariç **15 anlamlı alan-çelişkisi**. Örüntü: arka/worn
görünüm fotoğrafı outlier (halter/vNeck/square okuyor), ön doğru boat/crew okuyor.

## LOOP 2 HEDEF LİSTESİ
5 yaka fotoğrafı (hepsi arka/worn outlier):
13.47.49 JACKIE (square→boat), 13.48.06 Mira back (halter→boat), 13.48.17 Jackie
gingham back (vNeck→crew), 13.50.24 Tie Back polka back (halter→boat), 13.51.24
Ruby Pea Coat worn (square→crew). Kural: ön+arka TEK garment, TEK neckline; halter
sadece boyna dolanan bant görünürse; belirsizken {boat,crew,scoop} çoğunluğa düş;
arka foto ön neckline'ı ezemez. Tavan: 5 düzelirse vision-accuracy → ~%96, FULL +4'e kadar.

## TESLİMAT (bu loop TEK teslimatı = taksonomi + baseline)
- benchmark-58/vision-error-taxonomy.md (lokal, gitignore) — tam etiketli tablo
- benchmark-58.mjs: vision-accuracy 3. SUMMARY bloğu (DRAWN_SINCE değişmedi)
- reports/stitchu-vision-progress.md — baseline satırı + 4 ASCII bar
- linkedin.md Essay 13 + devlog.md seri X (3 reel)
- hiçbir prompt/motor düzeltmesi YAPILMADI (V0 kuralı)
