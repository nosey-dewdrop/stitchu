# KART V2-R — ARAŞTIRMA (R-kartı, §5.1) · SIRALI (fazın İLK kartı)

## NE
V2'nin üç eşiğini YAYINLANMIŞ kaynağa bağla ve bir otorite hükmü ver:

(1) **Üç dünya emsalinin primitif üçgeni kıyaslaması** — GarmentCode/PyGarment
    (Edge/Panel/Stitch) · Seamly2D (parametrik nokta/çizgi/eğri "malzeme" dili) ·
    FreeSewing (part/point/path/macro). Her biri için: hangi primitifler var,
    kapalı isim listesi (menü) tutuyorlar mı, tarif katmanı primitiflere nasıl
    çözülüyor, lisans. **Seamly2D özellikle**: repodaki `contract/primitives-v1.json`
    başlığı GarmentCode + FreeSewing + ASTM sayıyor, Seamly2D'yi SAYMIYOR —
    Seamly2D'nin taşıyıp bizde OLMAYAN primitifi var mı, isim isim.

(2) **İki yeni kapının eşiği**: `vocab_reference_check` (kapalı enum referans
    sayısı taban alınır, yalnız DÜŞEBİLİR) ve `vocab_source_check` (kelime listesi
    build ürünü). Yayınlanmış pratik ara: ratchet/monotonic-lint sınıfı denetim
    (ör. "type-coverage ratchet", ESLint `--max-warnings`, Rust `deny(warnings)`
    ratchet, generated-code drift kapıları) hangi şartla meşru sayılıyor;
    üretilen dosyanın elde edilmiş kopyasını kapıda tutmanın (checked-in
    generated artifact + regen-and-diff) yayınlanmış usulü nedir.

(3) **OTORİTE HÜKMÜ (V0-0D §5.4 açık sorusu)**: motorun okuduğu tek sözlük
    `engine/vocab.json`; `contract/` altında `garment-spec.schema.json` (82 enum),
    `garment-spec-v2.schema.json` (8), `primitives-v1.json` (8) paralel menü
    tanımı taşıyor. **Hangisi otorite?** Bunu yayından değil ÖLÇÜMDEN kur:
    hangi dosya motor yolunda okunuyor, hangisi hiçbir kod tarafından okunmuyor
    (grep + dosya:satır). Hüküm: OTORİTE / TÜRETİLMİŞ / OKUNMUYOR.

## GİRDİ DOSYALARI (isim isim, başkasını açma)
- `ENV.md`, `RULES.md`
- `contract/primitives-v1.json` (başlık bloğu + `_yasa`)
- `contract/vocab-resolution-v1.json` (yalnız `_baslik` `_yasa` `_alanlar`
  `_host` `_sayim` blokları — 3096 satırın tamamını okuma)
- `engine/vocab.json`
- `contract/garment-spec.schema.json`, `contract/garment-spec-v2.schema.json`
- `vision/vocab.py`
- `engine/tools/gen-vocab.mjs`, `engine/tools/mine-vocab.mjs`
- `knowledge/TEKNOLOJI-2026-08-23.md` — ⚠ bu dosya ÖNCEKİ bir koşudan kaldı ve
  **bu koşuda kanıt DEĞİLDİR**. İçindeki her künyeyi BİRİNCİL kaynaktan
  (yayın/repo/dokümantasyon) yeniden doğrula; doğrulayamadığını
  "DOĞRULANAMADI" diye işaretle. Alıntısını olduğu gibi taşıma.

## ÇIKTI
`GECE/V2-R.md` — tek dosya, üç bölüm (yukarıdaki 1/2/3 sırasıyla).

Bölüm 1 tablosu zorunlu: emsal · primitif adı · bizdeki karşılığı
(`contract/primitives-v1.json` alanı, yoksa "YOK") · kaynak (repo dosyası +
satır ya da yayın künyesi + URL) · lisans · hüküm ALINIR/ALINMAZ + tek cümle.

Bölüm 2: eşik başına — aday pratik · künye/URL · şart listesi madde madde ·
bizim kapıya nasıl bağlanır (tek cümle). Yayın yoksa "yayınlanmış formül YOK,
bant şu ölçümden" açıkça yazılır (§5.1).

Bölüm 3: dosya · motor yolunda okunuyor mu (grep komutu + çıktı satır sayısı) ·
hüküm OTORİTE/TÜRETİLMİŞ/OKUNMUYOR · gerekçe tek cümle.

## YASAKLAR
- Kod YAZMA. Tek satır bile. `contract/` `engine/` `recipes/` `web/` `vision/`
  altına dokunma. Tek yazdığın dosya `GECE/V2-R.md`.
- Kaynak UYDURMA. Erişemediğin yayının/repo satırının içeriğini tahmin etme;
  "erişilemedi + künye" yaz.
- `knowledge/TEKNOLOJI-2026-08-23.md`'yi kaynak diye GÖSTERME — o bir ara
  belgedir, birincil kaynak değildir.
- `GECE/arsiv/` altına BAKMA. `GECE/KOSU.md`, `GECE-KOSUSU-v6.md`, başka
  kartlar senin context'in değil.
- Model ağırlığı indirme · harici API anahtarı · GPU · ücretli PDF satın alma YOK.
- "Başkası yapmış, biz yapamayız" cümlesi yasak (§5.4).

## SÜRE TAVANI
60 dk (orakçı tavanı; dolarsa o ana kadarki tablo commit'lenir, kalan kart olur)

## ETİKET
SIRALI — çıktısı V2-A ve V2-B kartlarının girdisidir; onlar bu kart bitmeden
başlamaz.
