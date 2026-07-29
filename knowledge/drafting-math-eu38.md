# Doğrulanmış çizim matematiği — EU38 (solver'ın zemini, TAHMİN YASAK)

Kaynak: Aldrich *Metric Pattern Cutting for Women's Wear* 6. baskı p.11 (verbatim, HIGH) +
çapraz-doğrulama. Tam kaynak listesi: `reports/2026-07-29-endustri-arastirmasi.md` yanı sıra
bu tur araştırma (agent abf5dcc). Güven: HIGH=birincil/verbatim, MED=ikincil, LOW=forum.

## Beden kodu tuzağı (HIGH)
"EU38/UK12" klasik = **büst 88cm**. Aldrich 6. baskı yeniden numaralandırdı: büst 88 = beden 10,
"beden 12" = büst 92. Bizim defterimiz büst **920mm (92)** kullanmış = Aldrich'te beden 12. Solver'da
hangi büste çalıştığımızı NET tut (88 mi 92 mi), etikete güvenme.

## EU38 blok ölçüleri — Aldrich p.11 (HIGH)
| ölçü (cm) | büst 88 (beden 10) | büst 92 (beden 12) |
|---|---|---|
| büst | 88 | 92 |
| bel | 72 | 76 |
| kalça | 96 | 100 |
| sırt genişliği | 34.4 | 35.4 |
| ön genişlik (chest) | 32.4 | 33.6 |
| omuz boyu | 12.25 | 12.5 |
| **bust dart intake** | **7.0** | **7.6** |
| üst kol (top arm) | 28.4 | 29.6 |
| **armscye DEPTH (dikey)** | **21.0** | **21.4** |

- **Armscye DEPTH = dikey düşüş, ÇEVRE DEĞİL.** Çevre slota 21 koyma.
- **Armhole ÇEVRESİ Aldrich'te yok** — çizilen scye'den ölçülür. Sanity çapa: **toplam armhole ~40-44cm (≈42)**, MED.
- Underbust: yayınlanmamış, uydurma yasak.

## Bust dart (HIGH)
- Standart blok = **B-cup** (büst − üst-büst = 5.08cm/2in). Aldrich dart = **7.0cm (88) / 7.6cm (92)**.
- Cup kuralı: 1 cup = 2.54cm büst-farkı; her cup ~+2.5cm dart shaping. D-cup dart ≈ 3× B-cup.
- Açı tek başına cup'ın fonksiyonu DEĞİL — aynı cm daha kısa pende daha büyük açı. **cm ağız taşınabilir sayı.**
- BİZİM 05: 9.8cm/41.5° = **C-D cup** (Locket dolgun couture parça), standart B-cup değil.

## Sleeve cap (kol kapağı)
- **Cap height: tek katsayı YOK, sistemler anlaşmıyor.** Aldrich: geometrik kuruluş (armhole÷2 diyagonal ÷3).
  Oransal RTW: **AH/4** (yaygın). Armstrong: vücut ölçüsü. → hard-code etme, savunulabilir seç + not düş.
- **Cap ease (cap dikiş − armhole):** dokuma fitted **1.25-1.75in (3-4.5cm)** veya taç üzeri ~%10.
  Kumaşa göre (HIGH): gömlek ~1in, elbise/bluz **2-3cm**, ceket 4-6cm; >7.5cm = kötü draft şüphesi.
  Dissent (Fasanella): iyi eşleşen cap ~0 ease ister. Felsefe ayrımı, not düş.
- **EASE DAĞITIMI (HIGH, herkes hemfikir) — 06'nın düzeltmesi:**
  - Koltukaltı→çentik bölgeleri (iki yan): **%0 ease, armhole'a BİREBİR eşleşir.**
  - TÜM ease çentiklerin ÜSTÜNDE, taç üzerinde.
  - Bölüşüm ≈ **1/3 ön cap, 2/3 arka cap** (arka daha çok, omuz hareketi için).
- Çentik: tek çentik=ön, çift=arka; sleeve cap armhole etrafında "walk" edilerek konur (segment eşitliği buradan).

## Ön vs arka armscye (HIGH — eski varsayımım TERS)
- **ÖN armscye daha DERİN/oyuk → ön eğri tipik daha UZUN; arka daha düz/kısa.** (kol öne uzanır)
- Fark ~0.5-1in (1.5-2.5cm), ön uzun. Sabit evrensel oran YOK.

## Yan dikiş (HIGH)
- **Ön yan dikiş = arka yan dikiş, EŞİT olmalı** (aynı koltukaltı + bel çizgisine bağlı). Ön/arka boy
  farkı bel pensi/yaka/omuzla yutulur, yan dikişle ASLA.

## Solver'a 3 acil düzeltme (araştırma emri)
1. Beden-kodu: "12" etiketine değil **büst 88/92'ye** göre doğrula.
2. Ön/arka armscye: **ön daha uzun/derin** (ters çevir).
3. 257mm ön-scye + 9.8cm dart ONAYLI şişik — extraction'da dikiş payı/ease dahil olmuş, yeniden kontrol.
