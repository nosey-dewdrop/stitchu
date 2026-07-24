# KART (AÇIK) — eski 3 stil preview_truth FAIL (önceki oturum, benim değil)

## Durum
preview_truth_check'te 3 stil FAIL: gore_skirt_dress, princess_dress, wrap_dress.
- Bu 3 spec HEAD'de YOK; önceki "kalem genelleme G2+G3" commit'inin UNCOMMITTED çalışma-ağacı değişikliğinden (git M: contract/preview-truth.json, garment-spec.schema.json, preview-truth.mjs).
- Benim oturumumdan ÖNCE failing idiler (2026-07-20 öncesi).

## FAIL'ler
- gore_skirt_dress: neckDepth +233%, waistHalf -34% (landmark pin eksik)
- princess_dress: sleeveLen/sleeveWidth NaN (kollu ama draft sleeve landmark okumuyor)
- wrap_dress: Wrap Front Tie structural (flat temsili yok) + neckDepth + waistHalf

## Neden benim değil
Benim 11 stilim (bu oturum) preview_truth'tan GEÇİYOR. Bu 3 önceki oturumun yarım kalem işi.

## Hijyen etkisi
Suite kırmızı kalıyor (bu 3 yüzünden). Yeni kırılmayı görmek için: benim 11'im geçtiği için, bu 3'ün DIŞINDA yeni FAIL çıkarsa görürüm. Ama temiz suite için bu 3 ya düzeltilmeli ya commit edilip pinlenmeli.

## Damla kararı
- (a) Bu 3'ü de düzelt (önceki kalem işini tamamla), VEYA
- (b) Bu 3'ün M dosyalarını commit'le + landmark pinle (kalem genelleme kapansın), VEYA
- (c) şimdilik bu kartla ayır, benim işim temiz commit'lensin.

## KAPANDI 2026-07-22
Aynı yöntemle geçirildi (sebep-ayrıştırmalı). princess NaN = HARNESS boşluğu (harness fix, allow yazılmadı); gore/wrap = gerçek sapma (4 landmark pin + 1 structural, geometrik gerekçeli). STYLE-PIN dokunulmadı, golden PASS. TAM ctest 48/48.
