# KART V10-R — ARAŞTIRMA (etiket: PARALEL, V10-A ile aynı anda)

## NE
V10'un kuracağı `landing_truth_check` kapısının EŞİKLERİ ve "vizyon vs. canlı
özellik" ayrımının YAZIM KURALI için yayınlanmış kaynak bul. Kod YAZMA.

## GİRDİ DOSYALARI (bunlar + kendi web aramaların; başka repo dosyası açma)
- `ENV.md`
- `RULES.md`
- `web/index.html` (yalnız okuma; nasıl yazıldığını görmek için)

## ARANAN (dördü de ayrı başlık; bulunamayan "yayınlanmış kaynak YOK" yazılır)
1. Reklam/ürün sayfasında sayısal iddia için **doğrulanabilirlik** kuralı:
   FTC Endorsement/Substantiation ("competent and reliable evidence"),
   ASA/CAP Code (UK) "objective claims must be substantiated". İddianın yanında
   KAYNAK gösterme yükümlülüğünün ADI ve maddesi.
2. **İleriye dönük ifade** ayrımı: "forward-looking statement" konvansiyonu
   (SEC safe harbor dili) ve yazılım pazarlamasında "roadmap / not a commitment"
   ibaresi. Bizim karşılığımız: vizyon bölümü gelecek zaman + etiket. Kaynak ADI.
3. **Erişilebilirlik/mobil kırılım** için ölçülebilir eşik: WCAG 2.2 SC 1.4.10
   (Reflow, 320 CSS px'te yatay kaydırma yok), SC 1.4.3 kontrast oranı 4.5:1.
   Bunlar bizim kapımıza girebilecek TEK kaynaklı sayılardır — madde numarasıyla.
4. Kendi kendini denetleyen içerik kapılarında **kaçış grameri** dersi: alıntı
   içi metin, kod bloğu, yorum satırı nasıl kapı dışına düşer. (Kaynak bulunmazsa
   `GECE/V9.md` §8'deki ölçülmüş üç kaçışı ADIYLA aktar — o repoda ölçülmüştür.)

## ÇIKTI
- `GECE/V10-R.md` — başlık başına: KAYNAK (tam ad + link/yayıncı) · LİSANS ya da
  erişim türü · HÜKÜM (bizim kapıya hangi eşik/kural olarak giriyor) · GÜVEN
  (YÜKSEK/ORTA/DÜŞÜK). Kaynağı olmayan eşik "gelişigüzel" diye ADIYLA işaretlenir.
- Kanıt: hangi kapıya girdiği (landing_truth_check'in hangi denetimi).

## YASAKLAR
- Kod yazma, `web/` altına dokunma, test dosyası açma.
- Model ağırlığı / API anahtarı / bulut servis (§5.3 kalıcı veto).
- "Muhtemelen böyledir" yok: kaynağı yoksa YOK yaz.

## SÜRE TAVANI
40 dk. Tavanda ne bulduysan onu commit et (`GECE/V10-R.md`), kalanı dosyanın
sonuna "ARANMADI" başlığıyla yaz.

## COMMIT
Kendi commit'ini kendin at: `git add GECE/V10-R.md && git commit -m "v10-r: published sources for landing claim substantiation and reflow thresholds"`
