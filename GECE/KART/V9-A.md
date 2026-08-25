# KART V9-A — BUGÜNKÜ SAYIM (ölçüm, onarım YOK)

ETİKET: **SIRALI** (bu kartın çıktısı diğer bütün V9 kartlarının girdisidir)
SÜRE TAVANI: **45 dk**

## NE
`docs/` ağacının tamamı + `README.md` için BUGÜN geçerli iddia sayımını,
duran-iddia taramasını ve ölü link taramasını yeniden koş; `GECE/V0-0C.md`
tablosundaki HER kalemi bugünkü ağaca karşı tazele.

## GİRDİ DOSYALARI (isim isim, başka dosya AÇMA)
- `ENV.md` · `RULES.md`
- `GECE/V0-0C.md` (24 Ağu'da ölçülmüş girdi tablosu — DEVRALMA, TAZELE)
- `docs/**` (tamamı, `docs/archive/` dahil) · `README.md`
- Sadece bir iddiayı DOĞRULAMAK/ÇÜRÜTMEK için, o iddianın İSİM İSİM andığı
  hedefler: `contract/layers/*.json`, `engine/src/*.gen.hpp`,
  `ls -l engine/dist/stitchu-engine.js`, `ctest --test-dir engine/build -N`,
  `engine/tests/` altındaki test ADLARI, `engine/tools/` altındaki alet ADLARI.

## YAPILACAK İŞ
1. `GECE/V0-0C.md` §0.1'deki sayım betiğini AYNEN, ama kapsamı
   `docs/**/*.md` + `README.md` olarak koştur (web/ V10'un işi — dokunma).
   Bas: taranan dosya · toplam iddia cümlesi · tekil iddia cümlesi ·
   iddia taşıyan dosya. Betiği `GECE/log/V9-A.census.py` olarak KAYDET.
2. Duran-iddia taraması (RULES §6): kapsam `docs/` + `README.md`.
   Kalıplar en az: `ALL PASS`, `0.00 ?mm`, `0.0000 ?mm`, `byte-identical`,
   `bayt bayt`, `zero issues`, `zero failures`, `zero validation issues`,
   `hatasız`, `bitti`, `hazır`, `none known`, `validator[- ]clean`.
   Her hit için: dosya:satır + tam satır. YANLIŞ POZİTİFLERİ ayrı say ve
   GEREKÇESİNİ yaz (ör. Türkçe "baskıya hazır", kod yorumu, tarihli günlük).
   Ham çıktı → `GECE/log/V9-A.standing.txt`.
3. Ölü link/ölü referans taraması: `docs/` + `README.md` içindeki her
   markdown linki ve backtick içindeki her repo-yolu görünümlü dize disk
   üzerinde `test -e` ile yoklanır. Çıktı: dosya:satır · hedef · VAR/YOK.
   Ham çıktı → `GECE/log/V9-A.links.txt`. Betik → `GECE/log/V9-A.links.py`.
4. `V0-0C` §1'in 41 taşıyıcı iddiasından `docs/` + `README.md`'de OLANLARINI
   (web/ dışındakileri) tek tek BUGÜNKÜ ağaca karşı yeniden yargıla:
   doğru / YALAN / kanıtsız + kanıt yolu + hüküm ADAYI (kal/güncelle/sil).
   V0-0C'nin hükmü değişmişse "0C: X → bugün: Y" diye AÇIKÇA yaz.
5. `docs/` + `README.md`'de 0C'nin YARGILAMADIĞI ama taşıyıcı olan iddia
   varsa ekle (özellikle `docs/H1.0-KAPI.md`, `docs/SATIS-SARTNAMESI.md`,
   `docs/KATMAN-HARITASI.md`, `docs/G5-OMUZ-PLANI.md`, `docs/loop-engineering.md`).
6. Her sayısal iddia için: onu BASAN test/alet ADI diskte var mı? Üç sütun:
   iddia · aday alet adı · alet diskte VAR/YOK (yol ile).

## ÇIKTI (bu yollar, başkası değil)
- `GECE/V9-A.md` — tam tablo. Zorunlu bölümler: TOPLAM SAYIM ·
  DURAN-İDDİA (ham + yanlış pozitif düşülmüş) · ÖLÜ LİNK · İDDİA TABLOSU
  (doğru/YALAN/kanıtsız, ÖNCE 0C → SONRA bugün) · ALET EŞLEME TABLOSU ·
  YARGILANMAYAN.
- `GECE/log/V9-A.census.py` · `GECE/log/V9-A.standing.txt` ·
  `GECE/log/V9-A.links.txt` · `GECE/log/V9-A.links.py`
- Kanıt olduğu kapı: `docs_truth_check` (kapının kalıp listesi ve taban
  sayısı bu karttan çıkar).

## YASAKLAR
- `docs/`, `README.md`, `web/`, kod, `contract/`, `engine/` DEĞİŞTİRİLMEZ.
  Bu kart SAYAR, ONARMAZ. Tek yazılabilir yer: `GECE/V9-A.md` + `GECE/log/V9-A.*`.
- `GECE/arsiv/` AÇILMAZ. Diğer fazların tutanakları AÇILMAZ.
- `KOSU.md`'ye dokunma.
- "Baktım / doğru görünüyor" yasak: her sayının yanında onu basan komut.
- Tahmin yok: sayamadığını "YARGILANMAYAN" bölümüne yaz.

## RAPOR
yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu basan komut) ·
yapılamayan (sebep) · kart dışı fark edilen (dokunma, yaz).
İşini KENDİ COMMIT'İNLE bitir (lowercase ingilizce mesaj, co-author YOK).
