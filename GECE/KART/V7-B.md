# KART V7-B — KOL 0/8 İFADESİZ: SEKİZ DEĞER NE, NEREDE ÖLÜYOR

ETİKET: PARALEL (V7-R, V7-A ile aynı anda; dosya kesişimi YOK)
SÜRE TAVANI: 55 dk

## NE
Ölçülmüş gerçek: sözlükte **sekiz kol değeri** var ve flat sekizini de AYNI
çiziyor (KOL 0/8 İFADESİZ). Ayrıca v2 sözleşmesinde `sleeve` operatörü
**ABSENT**. Bu kartın işi TEŞHİS: sekiz değerin zinciri nerede kopuyor.

**S1.** Sekiz kol değerinin ADI ne, hangi dosyada tanımlı? Listeyi bas.
**S2.** `engine/tests/flat_expresses_spec_check.mjs` bugün ne basıyor — komutu
koş, çıktıyı aynen al. Kol satırı gerçekten 0/8 mi? ÖLÇ, devralma.
**S3.** Zincirin her halkasında sekiz değer AYRI mı yoksa AYNI mı:
  (a) spec/JSON girdisinde ayrı mı?
  (b) bridge/parse katmanında ayrı mı, yoksa burada mı düşüyor?
  (c) motorun çizim çağrısında ayrı mı?
  (d) çıkan artefakt (SVG/PNG/JSON) baytça ayrı mı? — `cmp`/`sha256` ile
      sekizini KARŞILAŞTIR ve tabloyu bas.
  **Kopma noktasını dosya:satır olarak göster.** Bu kartın asıl ürünü budur.
**S4.** v2 sözleşmesinde `sleeve` ABSENT: hangi dosyada, hangi satırda absent
sayılıyor, ve `sleeve` operatörü eklenirse hangi alanları taşıması gerektiğini
mevcut motorun ÇİZDİĞİ parametrelerden çıkar (uydurma değil, kod okuyarak).

## GİRDİ DOSYALARI (isim isim; alt aramalar/grep serbest)
- `ENV.md`, `RULES.md`
- `engine/tests/flat_expresses_spec_check.mjs`
- `engine/flat-engine/` tamamı (özellikle `styles.json` ve çizim modülleri)
- `engine/src/sleeve.cpp`, `engine/src/sleeve.hpp` (varsa)
- `contract/` altındaki v2 spec/sözlük dosyaları (grep `sleeve`)
- `web/js/` altında spec köprüsü dosyaları (grep `sleeve`)
- `engine/tools/` — ÖNCE GREP, yeni alet YAZMA

## ÇIKTI
`GECE/V7-B.md` — S1..S4 başlıklarıyla; her cevabın yanında dosya:satır +
çalıştırdığın komut + komutun bastığı çıktı. Sonunda **KOPMA NOKTASI** başlığı
altında tek satır: `dosya:satır — burada sekiz değer bire iniyor, çünkü ...`.
Sekiz artefaktın sha256 tablosu ÇIKTIDA olacak.

Bittiğinde KENDİN commit et:
`git add GECE/V7-B.md && git commit -m "v7-b: locate where the eight sleeve values collapse to one"`
Commit hash'ini raporunda yaz.

## YASAKLAR
- KOD YAZMA / KAYNAK DOSYA DEĞİŞTİRME. Bu bir ÖLÇÜM kartıdır.
- `GECE/KOSU.md`, `GECE-KOSUSU-v6.md`, başka kartlar: AÇMA.
- Sekizin aynı olduğunu "gördüm" DEME — `cmp`/`sha256sum` çıktısı koy (RULES 3).

## RAPOR FORMATI
yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu basan komut) ·
yapılamayan (sebep) · kart dışı fark edilen (dokunma, yaz).
