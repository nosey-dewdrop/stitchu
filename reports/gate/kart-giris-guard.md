# KART — Giriş kontrolü guard'ı eşik düzeltmesi (2026-07-22, mühür Damla'da)

## İstenen
Terzi gözü id82: yaka 35cm kapanışsız dokuma → kafa geçmez. Guard 150mm mutlak eşik yerine yaka açıklığı vs baş çevresi karşılaştırsın.

## Denendi + GERİ ALINDI (sayıyla)
C++'ta RULE 1: mutlak 150mm → yaka çevresi × (örme ? 1.6 : 1.0) < baş(boyun×1.51≈560mm) ise FAIL.
- **Golden: byte-identical PASS** (guard kontrol, renderer değil — byte üretmedi, senin dediğin gibi).
- **ctest: 9 test FAIL** (wearability_check, cap_sleeve, grade, shoulder, closed_garment, sewable_census, compose + contract/preview-truth önceden).
- Sebep: **çevre-vs-baş karşılaştırması meşru geniş-sığ boat/scoop yakalarını reddediyor.**

## KÖK: motor bunu BİLEREK reddetmiş (wearability.hpp:44-58 yorumu)
> "finished perimeter is a NOISY head oracle: a wide-shallow boat neck legitimately draws a perimeter WELL under the neck girth (455mm on a 500mm neck). Any perimeter-vs-body threshold above trivia FALSE-POSITIVES on real drafts."

Yani yaka ÇEVRESİ ≠ baştan geçen açıklık. Boat yaka omuz-omuza geniş, çevre küçük ama baş omuzdan geçer. Çevre-vs-baş matematiksel olarak yanlış birim.

## GERÇEK TEŞHİS (id82)
id82'nin sorunu yaka dar DEĞİL — **fabric woven'dı, ÖRME olmalıydı.** Crew crop tank örme giysi. Terzi haklı (woven'da geçmez) ama çözüm guard eşiği değil, **spec fabric=knit.**

## HÜKÜM (Claude görüşü, karar Damla)
1. Guard eşiği bu haliyle YANLIŞ — geri alındı. Çevre gürültülü oracle.
2. id82 numunesi: **pakete basılı örme şartı YETERLİ** (paket zaten "örme/hafif esnek kumaşla dikin" diyor). Paket düzeltilmeli DEĞİL; asıl düzeltme spec fabric=knit.
3. Doğru guard (ileride, ayrı tur): çevre değil, **yaka açıklığının GENİŞLİĞİ (çap) + omuz eğimi** hesabı — çok daha ince, Aldrich donning-ease referansı gerekir. Ya da: kapanışsız top spec'i fabric=woven ise vision/parser fabric=knit ata (id82 tipi).

## SAYAÇ ETKİSİ
Guard geri alındığı için 11 geçen hedef guard'dan geçirilmedi (guard yok). Mevcut çökmüş-açıklık guard'ı (150mm) 11'inde zaten PASS (hiçbiri çökmüş değil). Sayaç 11/103 KALIR — bu guardla değişmedi.

## Damla kararı gerekli
- (a) Doğru guard'ı (çap+omuz, ince) ayrı tur olarak yaz, VEYA
- (b) parser/vision fabric ataması (kapanışsız dar top → knit öner), VEYA
- (c) şimdilik pakete-basılı örme şartıyla yetin (numune öyle gidiyor).
