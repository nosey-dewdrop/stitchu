# KART V10-E — EKRAN GÖRÜNTÜSÜ + MOBİL KIRILIM (etiket: PARALEL, V10-F ile)

## NE
Yenilenen sayfanın PNG kanıtını üret (Damla'nın ZEVK HÜKMÜ için) ve mobil
kırılımı ÖLÇ. `web/` altında düzen bozukluğu bulursan **yalnız o kırılımı** onar.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md`, `RULES.md`
- `web/index.html`, `web/create.html`, `web/api.html` (yalnız bu üçü)
- `engine/tools/render-pages.mjs` (EMSAL: önce grep, sonra yaz — §7.5)

## ALET (yeni altyapı KURMA — §4.1 "gece yarısı Playwright sınıfı altyapı yok")
Diskte **Google Chrome** var. Headless CLI yeterli:
`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new
 --disable-gpu --screenshot=<çıktı.png> --window-size=<W,H> --hide-scrollbars
 "file://<mutlak yol>"`
`npm install` ile ağır bağımlılık çekme. Chrome koşmazsa bunu ADIYLA yaz ve
sayfayı ölçmenin ikinci yolunu (statik CSS analizi) kullan; PNG üretilemediyse
"PNG ÜRETİLEMEDİ" yaz — sahte kanıt üretme.

## ÖLÇÜLECEK
1. **PNG'ler** (masaüstü 1440×900 + mobil 390×844 + dar 320×640), üç sayfa için:
   `web/index.html`, `web/create.html`, `web/api.html`. Toplam 9 PNG.
2. **WCAG 2.2 SC 1.4.10 REFLOW** — 320 CSS px genişlikte YATAY KAYDIRMA OLMAMALI.
   Ölçüm `body{overflow-x:hidden}`'a GÜVENMEZ (o taşmayı gizler, çözmez):
   `document.documentElement.scrollWidth` ve her öğenin
   `getBoundingClientRect().right` değerlerini oku
   (`--dump-dom` yerine `--headless=new --virtual-time-budget=2000` +
   `--evaluate`/`--dump-dom` hangisi çalışıyorsa; çalışan yolu ADIYLA yaz).
   Taşan öğeleri **seçici + px** olarak listele.
3. Aynı ölçüm 390px'te de koşulur (gerçek telefon bandı).

## ONARIM (SINIRLI)
320px'te taşan öğe varsa `web/` altında **yalnız o taşmayı** onar
(sabit genişlik → `max-width:100%`, `min-width` kaldırma, `overflow-wrap`).
- Görsel kimliği DEĞİŞTİRME: renk, tipografi, kenarlık kalınlığı, köşe yarıçapı
  ELLENMEZ. Bu bir KIRILIM onarımıdır, redesign değil.
- `body{overflow-x:hidden}` ile örtme YASAK — kök taşmayı çöz.
- Onarımdan sonra 320px ölçümü YENİDEN koş, önce/sonra sayı ver.

## ÇIKTI
- `GECE/log/V10-E.png/` altına 9 PNG (adlar: `<sayfa>-<genişlik>.png`)
- `GECE/V10-E.md` — her PNG'nin YOLU + 320/390px taşma tablosu (önce/sonra) +
  koşulan tam komut. RULES 3: yol yoksa adım YAPILMAMIŞTIR.
- Değişen `web/**` (varsa)

## YASAKLAR
- `engine/` altına yazma (V10-F orada çalışıyor). `docs/`, `README.md`,
  `GECE/KOSU.md` yasak.
- **DEPLOY YAPMA**, "canlı" deme. `?v` damgasına dokunma.
- İçerik/metin değiştirme — bu kart METNE dokunmaz, `landing_truth_check`
  sayılarını yükseltmez. Bitirince `node engine/tests/landing_truth_check.mjs`
  koştur, EXIT 0 olduğunu logla (`GECE/log/V10-E.kapi.txt`).
- `git add -A` yok; sadece kendi dosyaların.

## SÜRE TAVANI
50 dk.

## COMMIT
`git commit -m "v10-e: screenshot proof at three widths and a measured 320px reflow pass"`
