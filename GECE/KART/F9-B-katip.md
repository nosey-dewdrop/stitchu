# KART F9-B — DOCS BÜYÜK TURU, UYGULAMA (katip) · SET 1, PARALEL

## NE
`GECE/F0-C.md`'de "güncelle" hükmü verilmiş **23 iddianın hepsini** README.md ve
docs/ üzerinde UYGULA; "kal" hükmü verilenlere DOKUNMA.

## GİRDİ DOSYALARI (bunlar ve sadece bunlar)
- `GECE/F0-C.md` §1 (README) · §2 (ARCHITECTURE) · §3 (SATIS-SARTNAMESI)
  · §4 (KATMAN-HARITASI + loop-engineering) — hüküm sütunu son sütundur
- Yazacağın dosyalar: `README.md` · `docs/ARCHITECTURE.md`
  · `docs/KATMAN-HARITASI.md` · `docs/SATIS-SARTNAMESI.md` · `docs/loop-engineering.md`
  · `GECE/INDEX.md`
- `git log --oneline -5` (bugünkü taban commit'i görmek için)

⚠ `GECE/F0-C.md` §5 (web/) ve §6 (üreteç tablosu) **BU FAZIN İŞİ DEĞİL** — onlar
F10'a ait. Dokunma.

## ÖNCE GREP
Her "güncelle" satırı için önce iddianın bugünkü hâlini kendin doğrula:
`grep -n "<alıntı>" <dosya>` ve F0-C'nin gerekçesinde adı geçen dosyanın
gerçekten var/yok olduğunu `ls` ile gör. F0-C bir tablo, kutsal metin değil —
bir hükmü ölçüp yanlış bulursan UYGULAMA ve tutanağa gerekçesiyle yaz.

## NASIL YAZILIR (anayasa)
- Duran iddia yazma. "ALL PASS / 0.00mm / byte-identical / bitti / kapandı /
  hazır / 0 failures / none known" YASAK. Yerine **sayıyı basan testin veya
  aletin ADI** yazılır.
  Kötü: "Clean-build test suite: 77/77 green."
  İyi: "Test suite state is whatever `ctest --test-dir engine/build` prints;
       the run recorded on 2026-08-22 was 89 of 96 passing (`GECE/log/F0v3.ctest.txt`)."
- **Her sayısal iddianın aynı SATIRINDA** onu basan alet/test adı geçmeli
  (`*_check`, `ctest`, `engine/tools/*.mjs`, bir dosya yolu). Şef kapıyı bu
  kurala göre kurdurdu; satırında tanığı olmayan sayı kırmızı düşer.
- Diskte OLMAYAN dosyaya referans (`flatten-research/FINDINGS.md`,
  `docs/RECETE-SPEC.md`, `PROJECT.md`, `PLAN.md`,
  `engine/SPECS-next-vocabulary.md`) ya doğru yolla değiştirilir ya da satır
  gerekçesiyle silinir. "Belki vardır" yok — `ls` ile bak.
- Bayat bir BÖLÜM tümden yanlışsa sessizce silme: `docs/archive/` altına taşı ve
  taşıma sebebini taşınan dosyanın başına tek cümle yaz.
- Soru biçimindeki her başlık `?` ile biter.

## ÇIKTI (dosya yolu + kapı adı)
- Yukarıdaki 5 doküman dosyası + `GECE/INDEX.md` güncellenmiş hâlde
- `GECE/INDEX.md`: koşunun her kalıcı dosyası yönlendirme tablosunda —
  `GECE/F0.md` `F0-A..D2.md` `F6.md` `F6-B/C.md` `F9-A.md` `F9-B.md`
  `knowledge/kol-kapak-yedirme-2026-08-22.md` `GECE/mutasyon.tsv` dahil.
  Sonundaki "ctest 232 sn" gibi duran sayıları da aynı anayasaya sok.
- `GECE/F9-B.md` — tutanak: hangi iddia, hangi dosya:satır, eski cümle → yeni
  cümle, ve UYGULANMADIYSA neden.

## YASAKLAR
- `engine/`, `contract/`, `web/`, `scripts/` altına HİÇBİR ŞEY yazma. Koda
  dokunma. Sen sadece docs + README + GECE/INDEX.md yazarsın.
- `engine/tests/docs_truth_check.sh`'a dokunma — onu paralel bir işçi yazıyor.
- `GECE/KOSU.md`, `GECE/F0-C.md`, `GECE/kapi.sh` DEĞİŞTİRME.
- Ölçmediğin bir şeyi "doğrulandı" diye yazma. Ölçemediysen cümleyi
  "ÖLÇÜLMEDİ (<tarih>)" diye işaretle — bu dürüsttür, iddia etmekten iyidir.
- commit ATMA.

## SÜRE TAVANI
maxTurns 40. İLK İŞİN `GECE/F9-B.md`'yi AÇMAK ve her dosyayı bitirdikçe
EKLEMEK — sonda tek seferde yazma (§ MEKANİK DERS).
