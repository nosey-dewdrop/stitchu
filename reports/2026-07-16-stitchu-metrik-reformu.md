# stitchu — BENCHMARK-58 metrik reformu (öğe-doğruluğu)

2026-07-16. Teşhis + metrik reformu oturumu. Kod/motor değişmedi (sadece
benchmark-58.mjs raporlama + md dosyaları). Golden etkilenmez, deploy gerekmez.
0 vision çağrısı — tümü offline (manifest oov[] × DRAWN_SINCE filtresi).

## Neden yeni metrik: kümelenme

"58 fotoğrafta kaç TAM kalıp" (FULL PATTERN) tek metriği ölü çıktı. Loop 4b'den 7'ye
motor tie + puf kol başı + tüm yaka ailesini kazandı ama FULL 14/54'te dondu.
Sebep **kümelenme**: bir foto genelde 2-4 eksikli, motor o öğelerden birini
kazansa bile foto TAM olmaz → sayı oynamaz. Damla haklıydı: yanlış pusula.

Çözüm: **ÖĞE-BAZLI DOĞRULUK (ELEMENT ACCURACY)** = 58 fotodaki TÜM dağarcık-dışı
öğelerin (tekrarlarıyla = N) yüzde kaçını motor ARTIK çiziyor (D). D/N.
Kümelenmeyi cezalandırmaz; motorun gerçek ilerlemesini gösterir.

## 1) Öğe-doğruluğu (ilk ölçüm)

**D/N = 37/103 = %35.9.**

- N = 103 dağarcık-dışı öğe (54 giysi fotosu, tekrarlarıyla).
- D = 37 öğe motorun DRAWN_SINCE kapsamında (loop 3 placket + 4b tie + 6 puf kol
  başı + 7 yaka ailesi).
- Kalan 66 öğe henüz çizilemiyor.

Bu, motorun 4 çizim loop'unun gerçek toplu etkisidir — FULL PATTERN 14/54 sabit
kalırken öğe-doğruluğu %35.9'a çıkmış durumda. Günlük pusula bundan sonra bu.

## 2) Kümelenme histogramı (giysi fotoları, distinct eksik öğe/foto)

| Eksik öğe sayısı | Foto |
|---|---|
| 0 (ZATEN tam) | 16 |
| 1 eksik | 18 |
| 2 eksik | 16 |
| 3+ eksik | 4 |

Not: manifest-teorik tavan 16 FULL; canlı ölçümde 14, aradaki 2 fotoda vision
WRONG (öğe eksiği değil, vision okuma hatası). Kümelenme net: fotoların yarısı
(20/54) 2+ eksikli — tek-öğe loop'ları bu yüzden FULL sayısını zor oynatır.

## 3) Marjinal kazanç: hangi öğe eklenince kaç foto FULL'a geçer

Bir öğenin marjinal kazancı = o öğenin TEK kalan eksik olduğu foto sayısı.

| Sıra | Öğe | Kaç fotoda eksik | Marjinal (+FULL) |
|---|---|:---:|:---:|
| 1 | drawstring/shirred gathering (kanal+büzgü) | 10 | **+6** |
| 2 | open-back cutout | 5 | **+4** |
| 3 | peplum | 2 | **+2** |
| 4 | hem slit | 2 | **+2** |
| 5 | bias-cut slip | 1 | +1 |
| 6 | shorts / two-piece | 1 | +1 |
| 7 | drawstring/gathered sleeve | 2 | +1 |
| — | yoke (front/back/gathered/shirred) | 6 | 0 (hepsi kümelenmiş) |
| — | cap sleeve | 5 | 0 (hepsi placket'le kümelenmiş) |
| — | asymmetric/double-breasted placket | 11 | +1 (10'u kümelenmiş) |

**Kilit bulgu:** frekansta en yüksek öğe (placket 11 foto) marjinal kazançta EN
YÜKSEK DEĞİL (+1) — 10 placket fotosu başka eksiklerle kümelenmiş. Gathering ve
open-back tek-eksik fotolara denk geldiği için marjinal kazançları yüksek. Bu,
loop sırasını frekanstan marjinal-kazanca çevirmenin somut gerekçesi.

## 4) Yeniden sıralanmış loop kuyruğu (marjinal-kazanç)

1. **Drawstring / shirred gathering** (+6) — babydoll/milkmaid boyun + büst panosu,
   kanal (casing) + büzgü. Aldrich shirring + casing.
2. **Open-back cutout** (+4) — dairesel/düşük açık sırt oyuğu + facing kenarı
   (bağ zaten çizili, kalan oyuk).
3. **Peplum** (+2) — bele oturan aşağı açılan pano (pointed hem dahil).
4. **Hem slit** (+2) — etek/elbise etek yırtmacı.
5. **Bias-cut slip** (+1) / **shorts-two-piece** (+1) — küçük tekil kazanımlar.

Sırayla gathering + open-back + peplum + hem-slit eklenirse FULL 14 → ~28
(**+14 foto**, %26 → %52), öğe-doğruluğu her tek adımda ayrıca artar.
Placket/yoke frekansta yüksek ama marjinali düşük → SON, ikinci-eksik kapanınca
değer verir.

## Couture taksonomisine genişleme notu

Bu set ağırlıklı elbise/top/etek — bu yüzden gathering + open-back öne çıkıyor.
Tam couture taksonomisi (pantolon bloğu, ceket/blazer bloğu, korse/kup birleşimi)
ayrı bir ÜST-hedef katmanı: 58-setinde şu an sadece 1 shorts/two-piece + 1
korse/cup fotosu var, o yüzden bu set için düşük öncelik. Pantolon/ceket blokları
gerçek genişleme ama farklı bir foto seti + Aldrich pantolon/ceket drafting'i
gerektirir; 58-setinin element-accuracy'sini tek başlarına oynatmaz.

## Kanıt / değişenler

- `engine/tools/benchmark-58.mjs`: DRAWN_SINCE modül-scope'a taşındı (classify +
  yeni ELEMENT ACCURACY özet bloğu tek kaynak paylaşır); SUMMARY artık hem
  FULL PATTERN hem ELEMENT ACCURACY (D/N) + en sık kalan öğeleri basıyor.
  Cache reclassify ile 0 çağrı: FULL PATTERN 14/54, ELEMENT ACCURACY 37/103.
- `BENCHMARK-58.md`: TEK METRİK → İKİ METRİK (kümelenme notu dahil), marjinal-kazanç
  sıralı yeni kuyruk, sayı serisine metrik reformu satırı.
- Motor C++ / golden dokunulmadı → deploy gerekmez.
