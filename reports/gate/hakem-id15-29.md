# Bağımsız Hakem — id15 + id29 (kolsuz princess A-line elbise)

Tarih: 2026-07-21. Çift kanat (FLAT kör test + KALIP Δmm). Motor/contract/styles DOKUNULMADI.
Vücut: bust90 waist72 hip98 shoulder38.

## Üretim
Her iki SVG `940 680` = **REF** (fallback yok). PNG → Chrome headless → gözle bakıldı.

## id15 (mini)
**FLAT — PASS.** Emsal 36-1.png ile aynı giysi: scoop YUVARLAK yaka (V değil), kolsuz,
princess dikişi (4 panel), A-line flare etek, mini uzunluk. Figürlü: bel oyuğu var,
koltuk-altı temiz, etek drape'li. Emsal-seviye, robotik değil.
**KALIP — PASS.** Draft hatasız, validator **0 issue**, **worstΔ=0.116mm** (shoulder F/B;
diğer tüm dikiş çiftleri Δ0), **9 parça** (bant içi 5-11). Bias binding yaka+kol.

## id29 (midi)
**FLAT — PASS.** Emsal ar-202358-5.png ile aynı giysi: scoop yuvarlak yaka, kolsuz,
princess dikişi, A-line flare, midi uzunluk (id15'ten belirgin uzun). Figürlü, drape'li.
**KALIP — PASS.** Draft hatasız, validator **0 issue**, **worstΔ=0.116mm**, **9 parça**.

## Sonuç: **2/2 GEÇTİ**

Not: `spec.length` (mini/midi) flat SVG'de doğru okunuyor (mini vs midi görsel farkı net).
Kalıp köprüsü (mapVisionSpec) `skirtLength` alanını okuyor; spec'te yok → ikisi de default
midi kalıba düşüyor. İkisi için AYNI davranış, geçerli elbise kalıbı; uzunluk skaler,
konstrüksiyon defekti değil. Kalıp uzunluğunu spec.length'e bağlamak istenirse köprü notu
(motor değil) — bu kapı dışı, v1.1 adayı.
