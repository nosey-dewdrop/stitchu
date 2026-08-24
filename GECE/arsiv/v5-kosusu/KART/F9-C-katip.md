# KART F9-C — DOCS TURUNUN KALANI (katip) · SET 2, SIRALI

Bu kart F9-B'nin devamıdır. Önceki kâtip tur tavanında kesildi: README.md ve
docs/ARCHITECTURE.md büyük ölçüde yazıldı, `docs/SATIS-SARTNAMESI.md` yarıda
kaldı. Onun tutanağı `GECE/F9-B.md`'dedir — OKU, aynı işi tekrar etme.

## NE
`engine/tests/docs_truth_check.sh` kapısını YEŞİLE indir — kuralı gevşeterek
değil, dokümanı düzelterek.

## GİRDİ DOSYALARI
- `GECE/log/F9.gate.mid.txt` — kapının BUGÜNKÜ çıktısı = senin iş listen
  (44 ihlal: SATIS-SARTNAMESI 31 · ARCHITECTURE 7 · README 4 ·
  loop-engineering 1 · KATMAN-HARITASI 1)
- `GECE/F9-B.md` — önceki kâtibin ne yaptığı
- `GECE/F0-C.md` §3 · §4 — SATIS-SARTNAMESI ve diğerleri için hüküm tablosu
- `engine/tests/docs_truth_check.sh` — kapının kurallarını OKU (değiştirme)

## ÖNCE GREP / ÖNCE KOŞ
Her düzeltmeden sonra kapıyı kendin koşamazsın (Bash'in yalnız git için açık).
Onun yerine `GECE/log/F9.gate.mid.txt`'i satır satır iş listesi olarak kullan ve
kapının betiğindeki iki kuralı (KURAL A yasak ifadeler · KURAL B tanık regex'i)
BİREBİR oku, düzelttiğin satırın kuralı geçtiğinden emin ol. Şef sonunda koşar.

## ŞEFİN KARARI — `docs/SATIS-SARTNAMESI.md` İKİYE AYRILIR
Bu dosya bugün iki farklı şey: (a) bir ŞARTNAME (bir paket ne zaman satılabilir
sayılır), (b) bir TUR GÜNLÜĞÜ ("H1.1a KAPANDI (Tur 8)", "16/17 madde geçti",
verdict tablosu). Tur günlüğü arşivdir, canlı doküman değil.
- `docs/SATIS-SARTNAMESI.md` ŞARTNAME olarak kalır: maddeler, ölçütler, ölçen
  aletin adı. Duran hüküm ("GEÇTİ", "KAPANDI", "borcu bitti") taşımaz.
- Tur günlüğü bölümleri `docs/archive/satis-sartnamesi-tur-gecmisi-2026-08-22.md`
  dosyasına TAŞINIR. Taşınan dosyanın en başına tek cümle gerekçe:
  neden arşiv, hangi tarihte, hangi koşuda. Sessiz silme YOK.
- Kalan şartname satırlarındaki her sayının AYNI SATIRINDA ölçen aletin adı
  olacak. Ölçen alet yoksa sayı iddia değildir: satırı "ölçen kapı YOK
  (2026-08-22)" diye işaretle.

## ÇIKTI
- `docs/SATIS-SARTNAMESI.md` (yeniden yapılandırılmış)
- `docs/archive/satis-sartnamesi-tur-gecmisi-2026-08-22.md` (yeni)
- `docs/ARCHITECTURE.md` · `README.md` · `docs/loop-engineering.md`
  · `docs/KATMAN-HARITASI.md` — kalan ihlaller kapatılmış
- `GECE/INDEX.md` — F9-B bunu yapamadan kesildi: koşunun her kalıcı dosyası
  yönlendirme tablosuna girer (`GECE/F0.md` `F0-A..D2.md` `F0-C.md` `F6.md`
  `F6-B/C.md` `F9-A.md` `F9-B.md` `F9-C.md` `GECE/mutasyon.tsv`
  `knowledge/kol-kapak-yedirme-2026-08-22.md`); içindeki duran sayılar
  ("ctest 232 sn") aynı anayasaya sokulur
- `GECE/F9-C.md` — tutanak: hangi satır, eski → yeni, ne taşındı, ne kapatılamadı

## YASAKLAR
- `engine/tests/docs_truth_check.sh`'a DOKUNMA. Kapıyı gevşetmek yasak (§0.12).
  Kapı haksız yere ateşliyorsa satırı DÜZELTME, tutanağa "kapı burada fazla
  ateşliyor, gerekçe ..." diye yaz ve şefe bırak.
- `engine/`, `contract/`, `web/`, `scripts/` altına yazma.
- `GECE/KOSU.md`, `GECE/F0-C.md`, `GECE/kapi.sh` değiştirme.
- Bir sayıyı kapıdan kaçırmak için SİLME. Sayı doğruysa tanığını yaz; yanlışsa
  düzelt; ölçülmemişse "ÖLÇÜLMEDİ (2026-08-22)" de.
- commit ATMA.

## SÜRE TAVANI
maxTurns 40. İLK İŞİN `GECE/F9-C.md`'yi AÇMAK ve her dosyayı bitirdikçe EKLEMEK.
Kesilirsen kalan iş yeni kart olur — sonda tek seferde yazma.
