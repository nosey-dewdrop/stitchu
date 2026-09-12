# GECE KOŞUSU — plan ve ilerleme defteri
**12 Eyl 2026, gece.** Damla bilgisayarı teslim etti. Bu dosya sabaha kadar
her turda güncellenir; uyanınca buradan okursun.

---

## DÖNGÜ (her elbise için aynı)

```
1. GÖR      hedef fotoğrafı Read ile aç, yapıyı yaz
2. TEŞHİS   bağımlı/bağımsız değişken analizi — hangi sayı neyi bozuyor
3. KÖK      motorda ne eksik? JSON ayarı DEĞİL, kod. Yoksa tur atlanır.
4. KES      motoru değiştir (primitif ekle / kural düzelt / kanun ölç)
5. KAPI     node KOSU/pembe-kapi.mjs <json>   -> 7 oran + nesne/biçim
6. GÖZ      PNG'yi Read ile aç. Kapı yeşil ama çirkinse kapıya yeni kontrol ekle.
7. REGRESYON  önceki elbiseleri yeniden koştur — biri bozulduysa geri al
8. YAZ      bu dosyaya: ne gördüm, ne kestim, ne ölçtüm, görsel adı
9. COMMIT   bir adım = bir commit
```

**Durma şartı yok — sorun bitene kadar döner.** Tur sayısı değil, hata sayısı önemli.

### Kural: her tur motorda kök bir şey
Bir turda sadece JSON sayısı değiştiysem o tur **sayılmaz**, kökü bulana kadar
devam eder. "Sayı hedefte ama flat çirkin" durumunda kök kapıdadır → kapıya
yeni ölçüt eklenir.

---

## SIRA (17 elbise, `00-HEDEF-ELBISELER.md`)

**A — silüet hazır, detay ekleniyor**
1. pembe fiyonklu mini · **BİTTİ** (kapı 7/7 + 6/6)
2. **Navy Gingham** — foto + GERÇEK KALIP PAFTASI · *sırada*
3. lacivert gingham asimetrik pat
4. kırmızı gingham düğmeli + pile
5. krem puantiye halter

**B — yeni gövde yapıları**
6. göğüs altı büzgü · 7. yan büzgü + bağcık · 8. devrik asimetrik yaka
9. omuz fiyonku + düşük bel · 10-11. kemer + toka + ters pile

**C — en zor**
12. oversize bebe yaka + korse · 13. fırfır · 14. balon etek
15. arka fiyonk (arka asıl yüz) · 16. bel drapesi + katmanlı etek · 17. maxi klos

---

## YER GERÇEKLERİ (uydurma değil, ölçülen)

| kaynak | ne veriyor |
|---|---|
| `patterns_real/geometry/geometry-full.json` | Buğra'nın 2 satın alınmış kalıbı, 13 parça, 8 beden, mm kalibreli (4cm bar = 113.386pt) |
| `patterns_real/Locket Top/5 Inspirations.jpg` | satılan ürün flat'i — çizgi/gölge/doku ölçütü |
| Navy Gingham fotoğrafı | foto + kalıp paftası + beden çizelgesi aynı görselde |
| `GIRDI/hedef-fotograflar-3/etsy-*.png` | 11 satıcı flat'i — konvansiyon ölçümü |

---

## BU GECE KESİLEN KÖKLER

### 1. Kapı pembe elbiseye özeldi
"bant var mı / pens var mı / kol var mı" diye soruyordu; bantsız-kolsuz bir
elbisede yanlış yeri ölçüp 3/6 veriyordu. → Artık **sadece var olan** nesneleri
denetler; olmayan öğe için kontrol atlanır. Kolsuz giysiye özel kural eklendi
(kol evi gövdeye oyuk olmalı). Pembe 7/7+6/6 korundu.

### 2. Üç hedef matematiksel olarak tutarsızdı
`bel/göğüs 0.945 × etek/bel 1.392 = 1.315` ama `etek/göğüs` hedefi **1.113**.
Kapı imkânsız bir şey istiyordu — hangisini tuttursam diğeri bozuluyordu.
→ `etek/bel` artık **türetiliyor** (1.113/0.805), elle girilmiyor.

### 3. İki hedef perspektif düzeltmesiz ölçümdü
Fotoğraf 3/4 dönük → yatay eksen kısalıyor → bel geniş, göğüs dar okunuyor.
Yol B'nin iki eksenli kalibrasyonu (dikey 1.6408 / yatay 1.1911 mm/px, oran
1.378) ile: `bel/göğüs` 0.945 → **0.805**, `gövde/göğüs` 2.235 → **1.96**
(ikinci hesap geometriden: mini = etek kalçanın hemen altında).
Bu ikisi olmadan flat ya tunik ya armut çıkıyordu — kapı yeşil olsa bile.

### 4. `gercek36`'nın beli yoktu ← YER GERÇEĞİ
Kalıp bedeni waist/bust **0.940** (düz tüp). Buğra'nın satın alınmış kalıbı
EU36: bust 880 / waist 680 / hip 940 mm → waist/bust **0.7727**, hip/bust
**1.0682**. Bust yarı genişliği 124.5 sabit tutuldu:
**waist 117 → 96.2**, **hip 156.9 → 133.0**.
Not: `croquis36` (flat) zaten 0.798 ile gerçeğe yakındı — **bozuk olan KALIP
bedeniydi**, yani kalıp motoru düz bir tüp üzerine çalışıyordu.

---

## İLERLEME (her turda eklenir)

| saat | elbise | kesilen kök | kapı | görsel |
|---|---|---|---|---|
| 23:10 | — | kapı genelleştirildi | pembe 7/7+6/6 | — |
| 23:25 | — | `gercek36` beli yer gerçeğinden düzeltildi | pembe 7/7+6/6 | — |
