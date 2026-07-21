# SHIRRED RE-PIN KARARI — Damla mühür vuracak

## 1) YAN YANA GÖRSEL
reports/gate/kart-shirred/repin-yanyana.png
- SOL: eski pin (drawstring_babydoll, elle-shirr, ~8 düzenli yatay casing satırı)
- SAĞ: yeni fizik (cloth-solver shirred, üstte yoğun fold kırışığı)
- Outline / askı / fiyonk / etek / hem IKISINDE DE AYNI. Sadece büst panosundaki büzgü çizimi farklı.

## 2) SAYISAL FARK (bağımsız hakem ölçümü)
| metrik | ESKI elle | YENI fizik | EMSAL |
|---|---|---|---|
| kat/satır sayısı | 8 satır | 27 fold | ~25-45 |
| aralık dağılımı | eşit (düz, oran 1.18) | üst-sık-alt-seyrek (27→19→4→1) | keskin |
| sönüm mesafesi | %81 dolu (sönmüyor) | %37'de söner | %15-25 |
| üst/alt yoğunluk | ~1.0 | 27.0 | ~4-6 |

**HÜKÜM (hakem):** Fizik-shirred emsal karakterini KORUYOR — satır sayısı emsal bandına girdi, aralık düzden üst-sık-alt-seyreğe döndü, %37'de sönümleniyor (elle %81 dolu+düz). TEK SAPMA: üst/alt oranı emsal 4-6'yı aşıp 27 (fade emsalden agresif, yön doğru). Re-pin sonrası fold-length yayarak 4-6'ya çekilebilir.

## 3) MÜHÜRLERSEM AÇILAN HEDEFLER (dürüst)
shirred içeren 12 hedef: id 1, 4, 10, 31, 35, 44, 46, 59, 67, 83, 84, 85

- **MÜHÜR + peplum (peplum ZATEN bitti) = TAM AÇILAN 2:** id31 (Daisy shirred cami peplum), id44 (square shirred peplum) → ikisi de shirred+peplum, ikisi de var
- **Kalan 10:** shirred + henüz-olmayan primitif (halter/off-shoulder/lace-up/tiered/sweetheart) — shirred TEMEL koyar ama o primitifler de gerekir

**Yani:** mühür 2 hedefi HEMEN açar (id31/44), 10 hedefe temel koyar. "12 açılır" değil, dürüst rakam bu.

## KARAR SEÇENEKLERİ
- **(i) İki yol kalsın:** babydoll'a DOKUNMA (elle-shirr = casing büzgüsü, farklı konstrüksiyon), fizik-shirred sadece yeni stillerde. Pin byte-identical, onay gerekmez. → id31/44 açılır.
- **(ii) Tek yola in:** babydoll'un shirr'ini fiziğe taşı, STYLE-PIN yeniden mühürle (yeni md5). Daha temiz mimari, pinli çıktı değişir (yukarıdaki sağ görsel yeni pin olur).

Mühür senin. Görsele + tabloya bakınca vur.
