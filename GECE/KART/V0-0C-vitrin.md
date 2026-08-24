# KART V0-0C — vitrin envanteri (docs + web)

ETİKET: PARALEL · SÜRE TAVANI: 60 dk

## NE
`docs/` ve `web/` altındaki HER iddia cümlesini tablola. Hüküm VERME, SAY.

1) İddia tablosu: iddia (aynen alıntı, dosya:satır) · hâlâ doğru mu
   (doğru / yalan / kanıtsız) · kanıtlayan test veya alet ADI (varsa) ·
   hüküm ADAYI (kal / güncelle / sil). "Kanıtsız" = doğrulayan test yok;
   "yalan" = repoda onu çürüten ölçüm/kod var, yolunu yaz.
2) Duran-iddia taraması: "ALL PASS", "0.00mm", "byte-identical", "bitti",
   "zero issues", "hazır", "hatasız" kalıplarını grep'le, her hit dosya:satır.
3) Ölü link taraması: docs/ ve web/ içindeki iç linkler + sitemap.
   `node engine/tools/site-health.mjs` varsa KOŞ, çıktısını logla.
4) UI ≠ motor farkları: web'in kullanıcıya söylediği ile motorun yaptığı her
   fark (örn. seçilen beden ≠ gösterilen beden) YALAN listesine girer.
   İddiayı kodla göster: hangi dosya hangi satırda ne yapıyor.

## GİRDİ DOSYALARI
- ENV.md · RULES.md
- docs/ (tamamı) · web/ (tamamı) · README.md
- engine/tools/site-health.mjs (varsa koş)

## ÇIKTI
- `GECE/log/V0-0C.site-health.txt` — alet koşabildiyse ham çıktı
- `GECE/V0-0C.md` — iddia tablosu (toplam N · doğru X · yalan Y · kanıtsız Z),
  duran-iddia hit listesi, ölü link listesi, UI-motor fark listesi
  Kanıt olduğu kapı: V0 kapısı + V9 (docs turu) ve V10 (landing) girdisi.

## YASAKLAR
- HİÇBİR docs/web dosyasını DÜZELTME, silme, yeniden yazma. Bu faz onarmaz.
- Hüküm verme — sen sayarsın, hükmü V9/V10 uygular.
- Sayıyı yuvarlama/tahmin etme; iddia sayısı tam sayım olacak.
- Kart dışı dosyaya yazma.

## RAPOR FORMATI (zorunlu)
yapılan (dosya yolu + commit hash) · ölçülen (sayı + onu basan komut) ·
yapılamayan (sebep) · kart dışı fark edilen (dokunma, yaz).
