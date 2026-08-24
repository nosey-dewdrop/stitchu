# KART V1-R — ARAŞTIRMA (R-kartı, §5.1) · SIRALI (fazın İLK kartı)

## NE
V1'in üç eşiği için YAYINLANMIŞ kaynak ara ve hüküm tablosu bas:
(1) `contract/tables.json` `euSizeChart` içindeki dört kaynaksız kolon —
`shoulderCM`, `backLengthCM`, `armLengthCM`, `neckCM` — EU32..EU50 için;
(2) regresyon mühürünü (golden baseline) yenilemenin yayınlanmış pratiği:
davranış değişikliği ilan edilerek baseline taşınır mı, taşınırsa hangi
kayıt zorunludur;
(3) `contract/figure-bands.json` `mandal.taban_v3` bandının ölçtüğü büyüklük
için yayınlanmış bir bant/oran var mı (yoksa açıkça "yayın YOK" yaz).

## GİRDİ DOSYALARI (isim isim, başkasını açma)
- `ENV.md`, `RULES.md`
- `contract/tables.json`
- `contract/figure-bands.json`
- `engine/tests/sizechart_source_check.mjs` (kapının kaynak şemasını oku:
  `_sources` alanında hangi alanlar zorunlu)
- `scripts/repin-golden.sh`
- `engine/GOLDEN-PIN.md`
- `knowledge/drafting-math-eu38.md`

## ÇIKTI
`GECE/V1-R.md` — tek dosya, üç bölüm. Kanıt olduğu kapılar:
`sizechart_source_check` (V1-C kartının GİRDİSİ) · `golden_check` (V1-A) ·
`figure_check` (V1-D).

Her kolon için tablo satırı zorunlu:
kolon · aday yayın (tam künye: yazar/kurum, başlık, baskı/yıl, sayfa veya
tablo no, URL) · yayının verdiği sayılar (beden beden, cm) · çizelgedeki
sayıyla FARK (mm) · hüküm: BAĞLANABİLİR / BAĞLANAMAZ + tek cümle gerekçe.
Kolon başına aday bulunamazsa satır yine yazılır, hüküm BAĞLANAMAZ, ve
"nerelere bakıldı" listesi eklenir. Aranacak sınıflar en az: ISO 8559-1/-2,
EN 13402-2/-3, ASTM D5585 sınıfı, Aldrich *Metric Pattern Cutting*,
Burda/Müller & Sohn beden çizelgeleri, ulusal antropometri (SizeUK,
CAESAR, Türkiye antropometri yayınları).

(2) için: hangi kaynak (yazılım mühendisliği pratiği: approval testing /
golden master / characterization test literatürü) baseline yenilemeyi ne
şartla meşru sayıyor — şart listesini madde madde yaz, kaynağıyla.

## YASAKLAR
- Kod YAZMA. Tek satır bile. `contract/` `engine/` `recipes/` `web/`
  altına dokunma.
- Kaynak UYDURMA. Erişemediğin yayının sayısını "muhtemelen şu" diye yazma.
  Erişemediysen "erişilemedi + künye" yaz. (K10, Damla kararı: uydurmak yasak.)
- Sayıyı çizelgenin kendisinden türetip "kaynak" diye sunma (V0-0F §5'te
  bu tam olarak ölçüldü ve REDDEDİLDİ).
- Model ağırlığı indirme, harici API anahtarı, ücretli PDF satın alma YOK.
- Telifli kitap sayfası indirme/kopyalama YOK — künye + sayı + URL yeter.

## SÜRE TAVANI
60 dk (orakçı tavanı; dolarsa o ana kadarki tablo commit'lenir, kalan kart olur)

## ETİKET
SIRALI — çıktısı V1-C kartının girdisidir, V1-C bu kart bitmeden başlamaz.
