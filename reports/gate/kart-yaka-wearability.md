# KART (AÇIK) — yaka açıklığı wearability guard eksiği (2026-07-22, FAZ 0 numune)

## Bulgu (terzi gözü, id82)
Bitmiş yaka açıklığı 35.0cm, fermuar/pat yok. Kafa çevresi ~56cm.
→ DOKUMA kumaşta kafadan GEÇMEZ (~21cm eksik). ÖRME kumaşta geçer (35cm örme esner).

## Motor guard neden yakalamıyor
wearability.cpp sadece 150mm ALTI çökmüş açıklığı reddediyor. 350mm "çökmüş değil" ama
dokuma + kapanışsız için hâlâ giyilemez (baş geçmez).

## Düzeltme yönü (motor işi, kart)
wearability guard: kolsuz/kapanışsız üst + neckOpening < headClearance(~560mm) + fabric=woven
→ ya kapanış (zip/placket) ZORUNLU ya fabric=knit işareti. knit ise geç.
id82 fabric=knit olmalı (emsal Elle örme atlet).

## Şimdilik (numune)
Paket uyarısı: "ÖRME/hafif esnek kumaşla dikin" basılı. Numune örme ile terziye gidebilir.

## Ayrıca (spec temizlik)
id82 contract shaping=null ama sevk edilen örnek pens kullanıyor. Boxy pens'siz mi olmalı? Damla kararı.
