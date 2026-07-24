# SATIŞ ŞARTNAMESİ — stitchu v1.1 fashion zinciri
> F0'da benchmark-58/dress_patterns/ Etsy emsallerinden çıkarıldı. Her madde ÖLÇÜLEBİLİR ve bir görsel rayın (F1/F2/F3) teknik denetimine girer. Kontakt sayfasında çıktı 3 gerçek Etsy emsalinin YANINA konur; Damla "bunların yanında durur mu" diye bakar. Kaynak envanteri: reports/2026-07-19-stitchu-f0-gusto-korpus.md.

Bir stitchu paketi "satılabilir" sayılır ancak aşağıdaki maddelerin HEPSİ ölçülüp geçtiğinde. Ölçen: gusto-lint (görsel/oran) + şartname-check (paket bütünlüğü) + preview-truth (flat=kalıp). "Bitti" demek için her satırın PASS'i raporda olmalı.

## 1. LISTING GÖRSELİ (vitrin)
- [ ] ÖN + ARKA flat, tek karo (viewBox front+back yan yana, emsal: 496 genişlik oranı).
- [ ] Çizgi hiyerarşisi 3 katman (2.0 outline / 1.4 iç yapı / 1.0 işaret) — gusto-lint line_hierarchy ≥ tipik.
- [ ] Marka rengi: navy #1f3a5f gövde, seam #5c7aa0 iç; başka renk yok (couture/vişne kuralı korunur).
- [ ] STYLE-PIN uyumlu (Damla "kalemim" dediği render'a piksel-yakın; style_check ctest).
- [ ] gusto-lint overall ≥ 0.70, hiçbir boyut taban-altı değil.

## 2. KALIP PAKETİ TAM (ürün)
- [ ] Numaralı parçalar — her parça etiketli (isim + kesim notu), emsal bandında sayı (bluz 3-5, elbise 4-8, etek 2-4).
- [ ] Kesim tablosu emsal diliyle: "cut 1 on fold" / "cut 2" / "cut 1 pair" / "place on fold" — her parçada net.
- [ ] Gömülü dikiş payı (SA) — kesim + dikiş çizgisi ikisi de basılı (mevcut motor: SA 15mm gömülü).
- [ ] Beden sayfası — bust/waist/hip cm tablosu (grade run kapağı; alıcı bedenini seçebilmeli).
- [ ] A4 (çok-sayfalı, register+tile) VE A0/A1 (tek-tabaka) ikisi de üretilebilir — emsal ikisini de sunar.
- [ ] Sayfa sayısı emsal bandında (A4-multi 8-24, A0 1-2, A1 1-4) — çok = puzzle, tek-tabaka verimli nesting.

## 3. PARÇA + SAYFA EMSAL BANDI (verimlilik)
- [ ] Parça sayısı: bluz ≤5, elbise ≤8, etek ≤4 (F3 hedefi; fazla parça = amatör puzzle).
- [ ] "Cut on fold" doğru uygulanmış: orta-simetrik + closure'sız parça YARIM çizilir + fold notu (F3; "küp" örneği = tişört önü tek yarım parça).
- [ ] Nesting yarım parçalarla: sayfa sayısı önce/sonra raporlanır (F3 azaltma kanıtı).
- [ ] Register sistemi: sayfa kodu + köşe kareleri + devam okları (mevcut, v50'de shipped).

## 4. TALİMAT İSKELETİ (kullanılabilirlik)
- [ ] Kumaş önerisi (weight/drape gerekçesiyle — mevcut sewing companion katmanı).
- [ ] Dikiş sırası (9 fazlı construction order — mevcut).
- [ ] Kalibrasyon karesi / 1 inch çubuğu (baskı ölçeği doğrulama — mevcut).
- [ ] Beden başı iç dikiş sayfası damgası (grade run: her iç tile hangi beden — mevcut).

## ÖLÇÜM KAPISI
Bir ray "satılabilir çıktı üretti" diyebilmek için: gusto-lint PASS + şartname 1-4 maddeleri PASS + kontakt sayfası 3 Etsy emsalinin yanında Damla onayı. Eksik madde = düzeltme kuyruğu, kanıtsız "tam" yasak (miras: PROVE don't claim).

## EMSAL REFERANSLARI (kontakt sayfasında yan yana konacaklar)
- benchmark-58/dress_patterns/A1Plainbustierdress.pdf (4 sayfa A1, tek-tabaka, ~4 yapısal parça)
- benchmark-58/dress_patterns/BustierdresMixte.pdf (24 sayfa A4, çok-sayfalı tile)
- benchmark-58/bugra-ref/ (BugraPatterns satılan set — elle Illustrator, 5 ayda 1.1k satış)
