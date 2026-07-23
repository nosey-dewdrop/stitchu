# KART — C DÖNGÜSÜ aday terfi: 4 aday ÜRETİLDİ-GEÇMEDİ + köprü gevşek-eşleme bulgusu

**Tarih:** 2026-07-23 gece maratonu, C döngüsü (aday terfi)
**Sonuç:** 5 GEÇTİ-ADAYI'ndan 0 terfi (dürüst). 4 hakem FAIL, 1 emsal-uyumsuz.

## HAKEM SONUÇLARI (tek tur, düzeltme yok — C kuralı)
| id | spec | flat çizdi | verdi | sebep |
|----|------|-----------|-------|-------|
| **18** | square + princess + half peplum | U/scoop yaka + peplum flare, princess dikişi çizili | ÜRETİLDİ-GEÇMEDİ | neckline SQUARE olmalı ama U/scoop okunuyor (top_princess_peplum boat/square eşlemesi yakayı U çiziyor); peplum doğru |
| **58** | deep-V + princess + on-düğme + fırfır trim | plain scoop tank (len 2545) | ÜRETİLDİ-GEÇMEDİ | V yaka YOK, princess dikişi YOK, düğme/fırfır YOK — plain dart tank fallback |
| **63** | scoop + princess (corset seam) + pointed hem | plain scoop tank | ÜRETİLDİ-GEÇMEDİ | princess/corset dikişi YOK, pointed hem YOK — plain fallback |
| **71** | vNeck + princess + asymmetric wrap vest | plain scoop tank | ÜRETİLDİ-GEÇMEDİ | wrap/asimetrik/princess YOK — plain fallback |
| 54 | sweetheart + wide + circle | doğru (referans kalem) | (emsal-uyumsuz) | crop handkerchief etek, hakem koşulamaz (kart-sweetheart-ailesi.md) |

## KRİTİK KÖPRÜ BULGUSU (kart-kopru-fallback-suphesi.md'nin genişlemesi)
id58/63/71 hepsi **shaping=princess** ama flat **plain dart tank** (len 2545, top_crew_dart/top_scoop_cami) çiziyor = **princess dikişi kayboluyor**. tryReferencePen top bloğu kuralları:
- `nl==='scoop' → top_scoop_cami` (line 777) princess'i UMURSAMIYOR
- `(crew/boat/square/vNeck) && !sleeved && !peplum && !shirred → top_crew_dart` (line 778) princess'i UMURSAMIYOR
→ princess top spec'leri plain dart stillere GEVŞEK eşleniyor = shaping İKAMESİ (dart yerine princess istendi).

Bunlar pipeline "GEÇTİ-ADAYI" görünüyordu ama flat spec'in ana öğelerini (princess/V/wrap/fırfır/corset) çizmiyor → gerçekte ÜRETİLDİ-GEÇMEDİ.

## KARAR (Damla'da)
1. tryReferencePen top kurallarını SIKILAŞTIR: princess top spec'i plain dart stile DÜŞMEMELİ. Ya princess top stili eşleş (top_boat_princess var, ama sadece boat/square) ya ÜRETİLEMEZ (ikame yasağı). Şu an sessizce dart'a düşüyor = ikame.
2. Bu 4 hedef gerçekte ÜRETİLEMEZ (princess+detay flat'te yok) — sayaç etkisi yok (zaten GEÇTİ değildi), ama "GEÇTİ-ADAYI" etiketi yanıltıcıydı, düzeltildi.

## SAYAÇ ETKİSİ
GEÇTİ 22 değişmedi. GEÇTİ-ADAYI 5→1 (sadece id54 emsal-uyumsuz kalır; id18/58/63/71 ÜRETİLDİ-GEÇMEDİ'ye taşındı, dürüst).
