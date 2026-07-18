# YOL HARİTASI — sıralı, kapılı (Damla, 2026-07-18)

Bu dosya sıradaki oturumların zemini. Kural: bir FAZ, kendinden önceki fazın KAPI koşulu geçmeden
başlamaz. Kapı geçilmeden sonraki fazdan iş alma, "bu arada şunu da yapayım" deme.
Breadth = erteleme, depth = bitirme.

Genel: görmediğine "gördüm" yazma. Her adımın çıktısı dosya veya test sonucu olsun, cümle değil.
Emin olmadığına "bilmiyorum" yaz.

## FAZ 0 — dürüstlük zemini — TAMAMLANDI 2026-07-18
GOREV-enum-err.md'deki 8 adım + 0.9 (benchmark sayacı round-trip'ten geçer; FULL = çizim kanıtlı).
KAPI 0 GEÇİLDİ: ctest 40/40, roundtrip kırmızı→yeşil kanıtı raporda, yeni rakam eskisiyle YAN YANA
yayınlandı (README + BENCHMARK-58.md + patch 3.19 + canlı site): eski yöntem 34 (yayınlanmış 37),
dürüst yöntem 23/54 FULL + 11 PARTIAL. Rakam düştü; düştüğü yer gerçek rakam.
AÇIK KALAN (KAPI 0 dışı, PROJECT.md şüphe listesinde): golden referansı bayat + ctest'te zorlanmıyor
(re-pin Damla onayı ister), shirred-yoke sideseam bug'ı, 100+ yaprak paketleme, A0 ölçek, glyph.

## FAZ 1 — İLK NUMUNE (projenin bugüne kadarki en büyük eksiği) — SIRADAKİ
1.1 en basit stili seç (düz etek ya da kolsuz gövde) — özellik gösterme, bloğu sına.
1.2 docs/muslin-protocol.md: ölçülecekler DİKİMDEN ÖNCE yazılır (koltukaltı derinliği, omuz eğimi,
    büst/empire hattı, bel/kalça bolluğu, kap ease'i, büzgü oranı).
1.3 bulgular sabitlere geri beslenir: hangi sabit, eski→yeni değer, hangi numune kanıtladı;
    FORMULAS.md'ye "sewn-validated" işareti (kaynak referansından güçlü, kopyalanamaz).
1.4 her düzeltme bir regresyon testine döner.
KAPI 1: en az bir numune dikildi, protokol tamam, en az bir sabit sewn-validated, fotoğraflar
docs/muslin/ altında yol+hash ile.
KURAL (kalıcı, KAPI 1'le RULES.md'ye girer): dikilmeden ship edilmez.

## FAZ 2 — DERİNLİK
2.1 envanter: her öznitelik SEWN / DRAWN / CLAIMED (docs/attribute-status.md).
2.2 CLAIMED kovası boşalır: ya kodla ya sil (örn. princess seam varsayılanı).
2.3 DRAWN→SEWN: mine-vocab frekansına göre en sık 10 öznitelik numuneyle.
KAPI 2: CLAIMED boş; en sık 10 SEWN.

## FAZ 3 — GENİŞLİK (çarpımla)
Sıradaki öznitelik TAHMİNLE değil mine-vocab frekansıyla; her yeni öznitelik: engine + test +
validator + round-trip + render PNG + bridge + vocab.json + numune.
KAPI 3: benchmark rakamı (dürüst yöntemle) gerçekten yükseliyor.

## FAZ 4 — PAKETLEME (en son)
API ürünleştirme, 3D-derived 2D, kamera→ölçüm, katalog UX, nested multi-size PDF.
"API bir ARAYÜZ kararıdır, KALİTE kararı değil. Önce motoru doğru yap, sonra paketle."

## Her fazda geçerli ölçü
"a metric per boundary; a boundary without a number does not exist."
vision→vocab uyum, bridge→round-trip, engine→golden+ctest, output→print-fit+render PNG,
FAZ 1 sonrası: numune sayısı / SEWN öznitelik oranı — içeriden üretilemez, sadece makas ve
iğneyle birikir, ve kimse indiremez.
