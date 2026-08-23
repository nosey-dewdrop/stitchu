# F-N — GECE KAPANIŞI: kalan dört mühendislik kırmızısı
`GECE/KART/ORTAK.md` oku. Sonra bu kart.

## ÖLÇÜM — 04:52, sakin ağaç, tek koşu, 351s
**105 test · 9 kırmızı** (gece başı 6, ara tepe 11).
`h10_gate_check` DISABLED (kasten, sevk edilmeyen hattı ölçüyordu).

Üçü **KASITLI**, DOKUNMA: `style_check` `sizechart_source_check` `contract_check`
Kalan **altı** iş:

| test | sınıf | ne yapılacak |
|---|---|---|
| `sewable_census` | **GERİLEME** | 270 draft kendini kesiyor — kök sebep, düzelt |
| `engine_check` | pin bayat | ölçülen yeni değere taşı, gerekçe dosyaya |
| `golden_check` | pin bayat | **Damla kararı** — taşıma, ölç ve kuyruğa yaz |
| `recipe_dress_check` | DSL bayat | aşağıda |
| `preview_truth_check` | teşhis hazır | `GECE/IKI-KIRMIZI-TESHIS.md` |
| `figure_check` | teşhis hazır | `GECE/IKI-KIRMIZI-TESHIS.md` |

## 1. `sewable_census` — ÖNCELİK, gerçek gerileme
`82980 draft / 15 gövde × 5532 spec` · **selfintersect 270** (%0.33).
Bir önceki turda kusur `[sideseam] 3.0mm`'di ve kapandı; yerine BU geldi.
Yani bu gecenin geometri işlerinden biri (scye çözücüsü, oyma, kumaş ekseni ya da
etek) bazı hücrelerde paneli kendi üstüne katlıyor.
- `git log -S` ile hangi commit, ÖLÇEREK bul. Tahmin etme.
- Hangi 270 hücre? Gövde/stil dağılımını bas — tek bir eksende mi toplanıyor?
- F-F'in kendi notu aday veriyor: *"cp2 omuz ucunu geçemiyor (geçince panel kendini
  kesiyor — ölçüldü)"*. O clamp bazı hücrelerde tutmuyor olabilir.
- Eşiği büyütmek YASAK. Kök sebebi kapat.

## 2. `engine_check` + `recipe_dress_check` — pin/ayna bayat
Geometri KASTEN değişti (F-G çentik+katlama, F-F scye, F-K yaka). Çıktı gerçekten
değişti ve DAHA DOĞRU.
→ **5 Ağu emsali:** pin ÖLÇÜLEN yeni değere taşınır, tolerans GENİŞLETİLMEZ, gerekçe
pin dosyasının İÇİNE yazılır (hangi commit, hangi ölçüm, kaç satır, her satır hangi iş).
**Açıklanamayan tek satır varsa taşıma DURUR.**

⚠ `recipe_dress_check` ekstra: reçete DSL'i `hollow = share * dx` KAPALI FORM istiyor,
F-F'in bisection'ını ifade edemiyor. İki aday, birini seç ve gerekçesini yaz:
(1) oymayı kirişin kapalı-form kesrine indir · (2) DSL'e `solve` primitifi ekle.

## 3. `golden_check` — TAŞIMA, Damla kararı
`GOLDEN-PIN.md` etiket istiyor. Farkı ÖLÇ (kaç satır, her biri hangi işten),
`DAMLA-KUYRUK.md`'ye satır düş, pini TAŞIMA.

## 4. `preview_truth_check` + `figure_check`
Teşhisleri hazır, `GECE/IKI-KIRMIZI-TESHIS.md` OKU. Özet:
- `figure_check`: 21/23 geçiyor. İki stilin `taban_v3`'te **pini yok** (sapma değil,
  tabansızlık). Üçü de 0.637 ölçüyor, `princess_dress` zaten 0.643 pinli → **kardeş
  pinini devral**. `drift_tolerans` 0.02 DEĞİŞMEZ, mevcut pinler KIMILDAMAZ.
- `preview_truth_check`: `princess_dress` için **on landmark'ın onu da** "draft
  tarafında sayı yok" diyor. Pin sorunu değil — draft hiçbir şey yayınlamıyor.
  Üç ihtimali sırayla ele, kökü bul, **draft tarafı sayıyı bassın**.
  "Beyanda açıklanmış say" diyerek kapatmak kapının ölçtüğünü yok etmektir.

## KAPI
Tam ctest, sakin ağaç, tek koşu, kendi build dizininde:
- `sewable_census` YEŞİL (selfintersect 0)
- `engine_check` `recipe_dress_check` `preview_truth_check` `figure_check` YEŞİL
- `golden_check` kırmızı KALABİLİR (Damla kararı), farkı ölçülmüş ve kuyruğa yazılmış
- Yeni kırmızı ad SIFIR
- Önce/sonra ctest logu commit'e girer: `GECE/log/F-N.ctest.{before,after}.txt`
