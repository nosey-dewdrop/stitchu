# KART F0-C — VİTRİN İDDİA SAYIMI (paralel set, işçi 3/4)

## NE
docs/ ve web/ altındaki her İDDİA cümlesini tablola: hâlâ doğru mu, kanıtlayan
test/alet hangisi. HÜKÜM VERME, SAY.

## GİRDİ DOSYALARI
- docs/ ağacı (tüm .md)
- web/ altındaki sayfalar
- engine/tools/gen-landing.js, gen-style-pages.mjs, gen-guide.mjs,
  gen-collections-page.mjs (ve Glob ile bulduğun diğer gen-*.mjs/js)
- contract/generated-paths.sha256

## ÖNCE GREP
- `grep -rn "ALL PASS\|0.00mm\|byte-identical\|bitti\|kapandı\|zero issues" docs/ README.md`
- `node engine/tools/site-health.mjs`  (çıktısını olduğu gibi kaydet)

## YAPILACAK
1. İDDİA TABLOSU: her satır = iddia cümlesi · dosya:satır · hâlâ doğru mu
   (ölçtün mü, neyle) · kanıtlayan test/alet adı · hüküm ADAYI (kal/güncelle/sil).
   Ölçemediğine "ÖLÇÜLMEDİ" yaz — silme, kaldır deme.
2. ÜRETEÇ TABLOSU: hangi sayfa hangi üreteçten çıkıyor ve o üreteç BUGÜN
   koşuyor mu (çalıştır; ENOENT / hata varsa aynen yaz). Hangi sayfaların
   üreteci YOK (elle yazılmış) — onları da işaretle.
   NOT: web/index.html BİLEREK elle yazılmıştır (Damla hükmü, 22 Ağu) — kusur
   olarak yazma, sadece "elle, ilan edilmiş" diye işaretle.
3. site-health.mjs çıktısı: kırık iç link, sitemap 404/eksik, ?v gerilemesi —
   sayılarla.
4. Atölye sayfası: gösterilen beden = seçilen beden mi? Ölçerek söyle
   (hangi dosya, hangi satır). Ölçemezsen "ÖLÇÜLMEDİ".

## ÇIKTI
`GECE/F0-C.md` — tablolar. (Bu tablo F9 ve F10'un girdisidir.)

## YASAKLAR
- docs/ ve web/ altında HİÇBİR dosyayı değiştirme. Yalnız GECE/ altına yaz.
- Commit ATMA.
- Hüküm verme ("bu silinmeli" deme; "hüküm adayı: sil" de).
- reports/ Logs/ HEDEF.md okuma (§0.1).

## SÜRE TAVANI
maxTurns 40. Tur biterse tabloyu olduğu yerde kes, "KALAN İŞ" yaz.
