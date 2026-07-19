# K5 — VISION KASKAD + EVAL TABANI raporu (2026-07-19)

Kapanış zinciri, TEK kredili ray (tavan 200 çağrı). Sonuç: **1 canlı çağrı harcandı**
(kredi probe'u), kalan her ölçüm önbellekli teacher etiketlerine karşı offline.

---

## KREDİ DEFTERİ (A5)

| # | ne | çağrı | sonuç |
|---|---|---|---|
| 1 | probe: `mine-vocab.mjs --anchor 1` (canlı Opus teacher, 1 benchmark fotosu) | 1 | 6/6 alan doğru, HEALTH OK — kredi var |
| — | kaskad kalibrasyonu, router testleri, eval sanity | 0 | tümü cache'lenmiş teacher etiketleri + lokal student |
| **TOPLAM** | | **1 / 200** | tavan aşılmadı |

## 1. EVAL TABANI — durum: **KIRMIZI-DÜRÜST** (go-live gate kapalı)

Hedef ≥150 hand-label; el emeği gece yapılamaz → K5'in gece görevi aday seti +
arayüz + sabah paketiydi, üçü de hazır:

- **Aday seti**: `dataset/eval/select-candidates.mjs` (lokal araç) korpustan
  KATMAN-DENGELİ 150 aday seçti (`dataset/eval/candidates.json`, lokal —
  dataset/ kuralı gereği push'lanmaz). AMBAR YASASI filtre istatistikleri:
  seen 1600 / kept 1586 / suspect 0 / no_photo 14 / all_null 0. Dağılım
  (teacher değerine göre, sadece dengeleme için — araçta GÖSTERİLMEZ):
  garment {dress 56, top 49, skirt 37, other 4, trousers 4};
  neckline {crew 18, scoop 18, boat 18, vNeck 20, square 12, sweetheart 11, halter 11, null 42};
  sleeveLength {long 25, short 23, elbow 23, null 79};
  skirtStyle {straight 22, gathered 22, aLine 22, pleated 14, halfCircle 14, null 56}.
  Enum-dışı teacher değerleri (notched, tiered...) dengelemede null sayıldı;
  other/trousers 8 fotoya kotalı (garment negatif kontrolü).
- **Etiketleme arayüzü**: `dataset/eval/label-tool.mjs` — tek node dosyası,
  localhost:8791, foto solda + 4 alan sağda, klavye-öncelikli (rakam=seçenek,
  0=null, enter=kaydet+sonraki), her fotodan sonra `hand-labels.json`a yazar
  (çökmeye dayanıklı, kaldığı yerden devam). Etiket değerleri = kontratın
  visionReading enum İD'leri (contract/garment-spec.schema.json'dan runtime
  okunur — K1 terim/İD tabanıyla aynı kaynak). Teacher cevabı ASLA gösterilmez
  (bağımsız ground truth). Smoke test: /, /data, /photo, /save uçları + Chrome
  render PNG gözle doğrulandı.
- **Sabah paketi**: `dataset/eval/README.md` — nasıl açılır, ne etiketlenir,
  süre bütçesi ~25-30 dk (150 × ~10-12 sn), bitince gate'in nasıl yeşile
  döndüğü.

**GO-LIVE GATE KIRMIZI**: 150 hand-label tamamlanana dek kaskad CANLI karar
veremez. Bu mekanik olarak da bağlandı: router, `STITCHU_CASCADE=1` bayrağına EK
olarak `dataset/eval/hand-labels.json`da ≥150 kayıt arar; yoksa student cevabı
gated=true ile teacher'a düşer. Bu KIRMIZI, K5 yeşilini düşürmez (yeşil tanımı:
"ya tamam ya KIRMIZI-dürüst").

## 2. KASKAD ROUTER — kodda, bayrak KAPALI

- **Student kaynağı (DÜRÜST beyan)**: 4 lokal-eğitimli mobilenet_v3_small başı
  (`vision-student/train_field.py`, MPS). UYDURMA student yok: veri = 1600
  önbellekli teacher etiketi (ambar), AMBAR filtreleri dataloader'da; split =
  GLOBAL sızıntısız foto ayrımı (md5(basename) son bayt %5==0 → val, 4 baş aynı
  ayrımı paylaşır — foto-seviyesi metrik leak edemez). Eski neckline.pt (seed-42
  split) aynı kuralla YENİDEN eğitildi.

| baş | ambar filtre (kept/uncertain/no_photo) | train/val | val agreement |
|---|---|---|---|
| garment | 1586 / 0 / 14 | 1232/354 | 0.780 |
| neckline | 1293 / 293 / 14 | 1005/288 | 0.590 |
| sleeveLength | 861 / 732 / 7 | 656/205 | 0.863 |
| skirtStyle | 481 / 1106 / 13 | 377/104 | 0.683 |

- **τ kalibrasyonu** (`vision-student/calibrate_cascade.py`, VAL-only, hedef
  student-kararlarında ≥%95 teacher-agreement, min-n 30 (sınıf başına 15)):
  düz τ + sınıf-koşullu τ (selective prediction):

| alan | düz τ | sınıf-koşullu τ | τ-üstü agreement | kapsama |
|---|---|---|---|---|
| garment | YOK (hiçbir düz eşik %95'i tutmuyor) | skirt@0.50 | 1.000 (17/17) | skirt tahminlerinin tamamı |
| neckline | YOK | crew@0.95 | 0.952 (20/21) | val'in %10.2'si |
| sleeveLength | 0.94 | long@0.92, short@0.94 | 0.953 (162/170) | %82.9 |
| skirtStyle | 0.90 | straight@0.83 | 0.971 (34/35) | %33.7 |

  τ'suz alan/sınıf HER ZAMAN teacher'a gider (router'da "no safe tau" yolu).
  İnce nokta dürüstçe: garment-skirt hücresi n=17 (ince), eval-150 sonrası
  yeniden denetlenecek.
- **Router**: `engine/tools/cascade-router.mjs` — saf karar fonksiyonu
  (`route()`, calibrate ile AYNI kural: conf ≥ min(düz τ, tahmin edilen sınıfın
  τ'su)) + CLI (student çıkarımını `vision-student/infer_cascade.py`
  üzerinden alır). Foto-seviyesi kural: garment güvenli DEĞİLSE teacher; garment
  güvenliyse tahmin edilen giysinin ihtiyaç alanları (dress→neckline+
  sleeveLength+skirtStyle, top→neckline+sleeveLength, skirt→skirtStyle,
  trousers/other→hiçbiri) hepsi güvenliyse teacher atlanır. **PUBLIC yol
  değişmedi**: web/js/create.js /api/analyze'ı aynen çağırır, hiçbir canlı kod
  bu modülü import etmez; bayrak (env) + eval-gate (≥150 hand-label) İKİSİ
  birden olmadan student cevabı kullanılamaz. CLI ile iki durum da kanıtlandı
  (flag off → "flag off"; flag on → "eval gate RED: hand-labels.json missing").

## 3. METRİK — çağrı/100 foto (kalibrasyon koşusundan, offline)

| | teacher çağrısı / 100 foto |
|---|---|
| kaskad ÖNCESİ | 100.0 |
| kaskad SONRASI (val 354 foto, foto-seviyesi kural) | **97.5** (9/354 atlandı; atlanan kararlarda alan-agreement 18/18 = 1.000) |

Dürüst okuma: kazanç bugün KÜÇÜK (%2.5) çünkü darboğaz garment başının
kalibre edilemeyişi (0.780 genel; dress/top tahminleri hiçbir eşikte %95'e
ulaşmıyor) — foto atlamak için ÖNCE garment güveni şart. Alan-seviyesinde
tablo daha iyi (sleeveLength %83 kapsama) ama teacher çağrısı foto başına
olduğu için alan tasarrufu tek başına krediye dönüşmüyor. Kredi eğrisini asıl
düşürecek kaldıraç: eval-150 + garment başına daha fazla etiket → yeniden
kalibrasyon (v1.1 işi, SONRADAN BULUNDU değil — K5'in bilinen sınırı).

## 4. Dağılım-kayması bulgusu (dürüstlük)

21'lik eski hand-label seti (vision/eval — müze/vintage/runway fotoğrafları,
ambar korpusundan FARKLI dağılım) üzerinde student ÇÖKÜYOR: garment 5/19,
sleeveLength routed-subset 5/11 (τ e-ticaret dağılımında kalibre edildi,
transfer ETMİYOR). Sonuç: kaskad SADECE madencilik korpusu dağılımında (ürün
fotoğrafı) güvenli — zaten kredi orada yanıyor; eval-150 adayları da AYNI
korpustan seçildi (doğru gate). Bu sınır router yorumuna ve bu rapora yazıldı.

## 5. K0 kapanışı + mühürler

- K0 madde 13 (eval 21→150): aday seti + arayüz + sabah paketi HAZIR; 150
  etiket Damla'da → **KIRMIZI-DÜRÜST gate** (K0 4.2 satırı eval tamamlanınca
  kapanır).
- K0 madde 14 (router + τ + çağrı/100foto): **KAPANDI** (bu rapor).
- MANDAL: router'ın eval-gate'i mekanik (kod hand-labels.json ≥150 istiyor);
  calibrate_cascade VAL-only + global split kuralı kodda; ambar filtre
  istatistikleri her eğitim raporunda (`vision-student/runs/*_report.json`).
- Etiket İD hizası: eval etiket değerleri = contract visionReading enum'ları
  (K1 tek kaynak); ayrı bir sözlük İCAT EDİLMEDİ.

## Dosyalar

- `dataset/eval/{select-candidates.mjs, label-tool.mjs, README.md}` (commit)
- `dataset/eval/{candidates.json, candidates-teacher-sidecar.json, hand-labels.json}` (LOKAL, gitignore)
- `vision-student/{train_field.py, calibrate_cascade.py, infer_cascade.py, vocab.py}` (commit)
- `vision-student/runs/{garment,neckline,sleeveLength,skirtStyle}.{pt,onnx}` + raporlar + `cascade-calibration.json` (LOKAL, gitignore)
- `engine/tools/cascade-router.mjs` (commit, bayrak kapalı)
