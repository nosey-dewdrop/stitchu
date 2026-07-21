# PEPLUM TASARIM NOTU (FAZ A2, 2026-07-21)

## Ne
Peplum = bele takılı, aşağı açılan kısa flare panel (dairesel frill). id41 (Frill Top) + 8 hedef.

## Kaynaklar (mevcut, birleştir — ikinci yol açma)
- **cloth-solver skirt profili** — flare kat çizgileri (bele büzülmüş değil, dairesel açılan)
- **buildHalf top hem'i** — peplum bağlanma çizgisi (top waist, y=yHem)
- **peplum.cpp** — kalıp tarafı ZATEN VAR (CLAUDE.md "peplum block", PeplumStyle {None,Full,Half,Pointed}). KALIP kanadı hazır.

## Render'a nasıl girer
`pt.peplum` (parça) VEYA `p.peplum` (enum full/half/pointed) → top gövdesinin hem çizgisinden (k.yHem) aşağı flare panel. Ayrı kesim parçası (bele dikişli).
- Bağlanma yayı = top bel genişliği (k.hX, bele oturur)
- Flare: dış yay > iç yay (dairesel sektor, kendiliğinden dalgalanır)
- Boy: peplumLen ≈ gövdenin 1/3 (bel→kalça)
- Hem: dalgalı (cloth-solver skirt profili kat çizgileri)

## Parametreler
- `peplumLen` (boy, ~50-70px)
- `peplumFlare` (dış/iç yay oranı, 1.5-2.2)
- `peplum` enum (full=tam çember, half=yarım, pointed=sivri handkerchief)

## PİNLİ STİLLERE KAPI ŞARTI (kritik)
`pt.peplum` VEYA `st.garment==='top' && p.peplum!=='none'` koşullu. Pinli stiller (babydoll/princess_dress/wrap/gore/lace_vneck/peterpan/courtney) peplum parçası taşımaz → byte-identical. Her değişiklikte golden diff + 7 pin cmp.

## Emsal ölçümü (ar-202426-4 Frill Top)
- Peplum bele oturur, kalçaya flare
- Boy ≈ gövdenin 1/3 (kısa)
- Ön orta düz, yanlara dalga artar
- Hem dalgalı (2-4 dalga)

## Kıyas döngüsü planı (FAZ A2, max 3 tur)
1. Peplum parçası çiz (bele takılı flare, cloth-solver kat)
2. Emsal (id41 crop) yan yana → kıyas hakemi "aynı karakterde mi"
3. Değilse: boy/flare/dalga sayısı sapmasını sayıyla kapat, yeniden kıyas
4. Oturunca: id41 çift kanat hakem (FLAT + KALIP peplum_check)

## KALIP notu
peplum.cpp + peplum_check ZATEN VAR — KALIP kanadı hazır olmalı. ctest peplum_check koş, id41 kalıbı 0-issue mi teyit et.
