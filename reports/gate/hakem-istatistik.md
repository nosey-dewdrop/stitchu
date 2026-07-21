# HAKEM İSTATİSTİĞİ (2026-07-21 gece, Şerit B devralındı)

## Bugüne kadarki tüm hakem kararları
- **GEÇEN (çift kanat): 8** — id23, id88, id90 (tur1), id82, id15, id29, id53, id65
- **KIRMIZI: 1** — id47 (square yaka + cap sleeve yok)

## Düşme dağılımı
| kanat | düşme sayısı | not |
|-------|--------------|-----|
| **KALIP (Δmm)** | **0** | 8/8 geçen + kırmızılar HEP KALIP PASS. Validator her zaman 0 issue. worstΔ 0.12-0.72mm (tolerans 3.0). |
| **FLAT-karakter** | tur1a/b/c + id65-ilk | V-yaka bug, armhole balon, kısa+kabarık kol — HEPSİ düzeltildi, sonra geçti |
| **FLAT-yetenek** | id47 | square yaka + cap sleeve motorda YOK (primitif eksik) |
| **köprü-fallback** | 0 | hiçbir geçen hedef fallback'ten çizilmedi |

## EN SIK DÜŞME SEBEBİ: FLAT
- Karakter bug'ları (yaka/armhole/kol) → düzeltilebilir, düzeltildi
- Yetenek eksiği (square/cap) → yeni primitif gerekir
- **KALIP motoru tamamen sağlam** — madde 4'ten (27/27) beri hiç düşmedi

## YARININ STRATEJİSİ (bu dağılımdan)
1. **KALIP'a güven** — kalıp kanadı otomatik geçiyor, enerji FLAT'e.
2. **FLAT primitif üretimi** ana iş — her yeni primitif (peplum/collar/ruffle) bir grup hedef açar.
3. **Karakter bug'ları kıyas döngüsüyle çözülüyor** (shirred/plainSleeve kanıtı) — emsal yan yana + sayısal fark reçetesi işliyor.
4. **En verimli:** FLAT-yetenek eksiklerini frekans×tam-açılan sırasıyla kapat (collar 12, ruffle 14, square-neck birkaç hedef).

## Bu gece biten primitifler
- plainSleeve (id65 geçti) ✅
- peplum (id41 hakemde) 🔄
- tieBack (id53 geçti) ✅
- boxy (id82 geçti) ✅
- roundNeck-dress (id15/29 geçti) ✅
