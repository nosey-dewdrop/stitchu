# KART V7-G — RULES 9 ONARIMI: 7. KIRMIZIYI KÖKÜNDEN KALDIR

ETİKET: SIRALI (tek işçi) · SÜRE TAVANI: 30 dk

## ŞEFİN ÖLÇTÜĞÜ KÖK SEBEP (tekrar ölçme, DOĞRULA ve üstüne çalış)
Açılışta (`e4249b7`) `vocab_reference_check` **YEŞİLDİ** (113 test / 6 kırmızı).
Bu gece **7. kırmızı** olarak düştü. Şef kökü izole etti:

- `bash engine/tests/vocab_reference_check.sh` → `HUKUM: FAIL`,
  `garment 1186 -> 1189 (+3)`, `sleeveCap 146 -> 147 (+1)`.
- Eksen sayımı: `grep -cw garment contract/garment-spec-v2.json`
  → `e4249b7`'de **4**, bugün **7**. `engine/src/validator.cpp` **22 → 22**
  (DEĞİŞMEDİ — kod tarafı temiz).
- **KANIT:** repo kopyasında YALNIZ `contract/garment-spec-v2.json` faz-öncesi
  hâline döndürülünce kapı `HUKUM: YESIL — hicbir sayi tabanin ustune cikmadi`
  basıyor (`delta -6`). Yani 7. kırmızının TAMAMI o dosyaya `b85c2c8`
  (V7-F) ile eklenen ŞERH DÜZ YAZISIDIR — kod değil, sözlük değil.
- Kapı `engine/tests/vocab_reference_check.sh:82-86`: "adding a new reference
  to a closed enum is the thing being forbidden... the baseline is re-cut by
  hand ONLY if the vocabulary genuinely gained an axis or a value."
  **Sözlük bu gece hiçbir eksen/değer KAZANMADI** → taban yeniden KESİLEMEZ.

## NE
`contract/garment-spec-v2.json` içindeki V7-F şerhini **İŞARETÇİYE İNDİR**:
sicilde HÜKÜM cümlesi + kanıt dosyasının YOLU kalsın; kaynak dosya adlarını
ve ham dizgi sayımlarını içeren uzun kanıt düz yazısı sicilden çıksın.

**MUTLAK ŞART — HİÇBİR DOĞRU CÜMLE YOK OLMAYACAK.**
Sicilden çıkardığın her cümlenin `GECE/V7-F.md` içinde **kelimesi kelimesine**
durduğunu ÖNCE doğrula (`grep -F` ile göster). Durmuyorsa **önce oraya ekle**,
sonra sicilden çıkar. Bu bir gizleme değil, yer değiştirmedir ve şartı budur.

Sicilde MUTLAKA kalacaklar (kısaltma serbest, anlam kaybı YASAK):
1. `sleeve` operatörünün status'u **DEĞİŞMİYOR** (absent) — V7-F kararı (B).
2. Çelişkinin ADI: sicil bir motoru, sevkiyat başka bir motoru anlatıyor —
   bu bir yalan değil KAPSAM kaymasıdır.
3. Kanıtın yolu: `GECE/V7-F.md`.
4. `_statuses.shipped` metninin bugün fiilen yanlış olduğu şerhi (V7-F'nin
   kart dışı 1. bulgusu) — tek cümle, dosya adı vermeden.

## ŞARTLAR
1. Bitince `bash engine/tests/vocab_reference_check.sh` **YEŞİL** basacak.
   Çıktıyı `GECE/log/V7-G.vocab.txt`'ye yaz.
2. `ctest --test-dir engine/build -R 'specv2_check|contract_check|vocab_source_check|vocab_reference_check' --output-on-failure`
   koş; `contract_check` MİRAS kırmızıdır (dokunma), diğerleri yeşil kalacak.
   Çıktıyı `GECE/log/V7-G.gate.txt`'ye yaz.
3. `python3 engine/tools/gen-spec-v2.mjs --check` benzeri üreteç bekçisi varsa
   (V7-F "in sync" demişti) onu da koş ve çıktıyı logla.
4. **TABANI YENİDEN KESME** (`--baseline` KULLANMA). Kapıyı gevşetme, SCOPE
   satırına dokunma, EXCL listesine dokunma. Bu yasaklar mutlaktır.
5. `engine/`, `web/`, `backend/` altındaki HİÇBİR dosyaya dokunma.

## ÇIKTI
- `contract/garment-spec-v2.json` (şerh işaretçiye indi)
- `GECE/V7-F.md` (gerekiyorsa tam metin oraya taşındı)
- `GECE/V7-G.md`: ne çıkarıldı · her çıkarılan cümlenin `GECE/V7-F.md`'de
  durduğunun `grep -F` kanıtı · kapı ÖNCE/SONRA çıktısı
- `GECE/log/V7-G.vocab.txt` · `GECE/log/V7-G.gate.txt`

Sonra `DAMLA-KUYRUK.md`'nin SONUNA 3.8.d formatında tek satır ekle:
`K-V7A · V7-F'in sicil şerhi, vocab ratchet'i kırdığı için işaretçiye
indirildi (tam metin GECE/V7-F.md'de) · SEÇENEKLER: (A) böyle kalsın —
sicil kısa, kanıt kayıtta, kapı yeşil; (B) tam metin sicile dönsün ve
ratchet tabanı bu kapsam kararı için elle yeniden kesilsin · VARSAYILAN (A)
· ETKİLEDİĞİ FAZ: V9 (docs turu)`

Bittiğinde KENDİN commit et (push etme, `git add -A` KULLANMA):
`git commit -m "v7-g: reduce the v7-f registry note to a pointer so the vocab ratchet stays green"`

## RAPOR FORMATI
yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu basan komut) ·
yapılamayan (sebep) · kart dışı fark edilen (dokunma, yaz).
