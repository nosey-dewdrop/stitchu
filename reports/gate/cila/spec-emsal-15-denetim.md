# CİLA — spec-emsal 15'lik örneklem denetimi

**Tarih:** 2026-07-23 gece maratonu, D3 (artık zaman)
**Sonuç:** Sistematik emsal-uyumsuzluk YOK. 1 bilinen (id54) + 1 isim-artefaktı (id24).

## ÖRNEKLEM (15 hedef: 9 GEÇTİ + 3 aday/gecmedi + 3 üretilemez)
id2, 4, 13, 18, 21, 24, 39, 40, 47, 54, 57, 58, 66, 82, 101

## SONUÇ
| id | spec-emsal | not |
|----|-----------|-----|
| 4,13,40,47,57,82,101 | ✓ TUTARLI | GEÇTİ, hakemde emsal-doğrulandı |
| 24 | ✓ (isim artefaktı) | crop "ar-202343-5.png-alt" = ar-202343-5.png dosyasının 2. sketch'i (note'ta yazılı, dosya VAR). "-alt" eki sanal, gerçek eksik değil. |
| **54** | ✗ UYUMSUZ (bilinen) | crop ar-202547-1 = Handkerchief Skirt ürünü, sweetheart dress DEĞİL. kart-sweetheart-ailesi.md. Damla kararı. |
| 18,58 | ~ (flat fallback) | spec doğru ama flat spec'i çizmiyor (kart-aday-terfi-C.md) — spec-emsal değil, flat-spec sorunu |
| 2,21,39,66 | ✓ spec-emsal | ÜRETİLEMEZ (primitif eksik) ama spec crop'a uygun |

## BULGU
- **Sistematik spec-emsal uyumsuzluğu YOK** — 15 örneklemde sadece id54 gerçek uyumsuz (crop yanlış ürün).
- id24 "-alt" isim eki bir crop-adlandırma kuralı (çok-sketch crop), veri hatası değil.
- Asıl sorunlar spec-emsal değil, FLAT-SPEC (id18/58/63/71 flat spec'i çizmiyor, kart-aday-terfi-C.md).

## KARAR (Damla'da)
- id54 crop düzeltmesi (doğru sweetheart emsali). Diğer 14 temiz.
- "-alt" crop isimlendirmesi bir kural, dokunulmaz.
