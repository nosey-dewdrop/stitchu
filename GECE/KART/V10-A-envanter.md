# KART V10-A — WEB ENVANTERİ (etiket: SIRALI — V10-B ve V10-C bunu bekler)

## NE
`web/` ağacındaki HER iddiayı bugünkü koda karşı ÖLÇ ve tek tabloya yaz.
Onarım YOK, tasarım YOK, `web/` altına TEK BAYT yazma.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md`, `RULES.md`
- `web/**` — tüm `.html`, `web/js/*.js`, `web/css` varsa (yalnız OKUMA)
- `README.md:1-10` (satılan beden aralığı cümlesi)
- `engine/pattern-bridge/shape-ratios.json` (motorun GERÇEK beden kümesi)
- `engine/tools/site-health.mjs` (koşulacak alet)
- `engine/tools/site-version.mjs` (`?v` damgasının tek kaynağı)
- `GECE/V0-0C.md` — 24 Ağu'da ölçülmüş ESKİ tablo. **DEVRALMA, TAZELE.**
  Her kalemi bugün yeniden ölç; bayat olanı "BAYAT" diye işaretle.

## ÖLÇÜLECEK (her satır: sayı + onu basan komut + dosya:satır)
1. **MTM ↔ SABİT BEDEN YALANI.** `web/` altında "your own measurements",
   "no fixed sizes", "made to measure", "custom fit" kalıplarını SAY
   (`grep -rc`), dosya adlarıyla listele. Motorun gerçeği: `shape-ratios.json`
   kaç beden, hangi aralık — komutla bas. İkisini yan yana koy.
2. **DİKİŞ PAYI.** `web/shop-shift-dress.html:59` ne diyor; motorun/ölçümün
   payı ne (`patterns_real` ölçümü 10mm; motor tarafındaki sayıyı grep'le bul).
3. **`web/api.html`** — worker'ı canlı gibi mi anlatıyor? ENV.md son satırı
   "never claim the worker is live" diyor. Sayfadaki her cümleyi ADIYLA çıkar.
4. **SÜRÜM KAYMASI.** Her HTML'deki `?v=` değerlerini say ve grupla;
   `site-version.mjs`'in bastığı tek kaynak sayı ne. Kaç dosya kaymış.
5. **UI ≠ MOTOR.** `web/js/*.js` içinde beden seçimi → motora giden spec →
   ekranda gösterilen beden zinciri. Seçilen beden ile GÖSTERİLEN beden ayrışıyor
   mu? Ayrışıyorsa hangi satırda. Bu bulgu YALAN listesine girer.
6. **ÖLÜ LİNK.** `node engine/tools/site-health.mjs` — exit kodu + tam çıktı
   `GECE/log/V10-A.site-health.txt`'ye.
7. **İDDİA TABLOSU.** `web/**` içindeki her TAŞIYICI iddiayı (sayı içeren ya da
   bir özelliğin var olduğunu söyleyen cümle) tek tabloya çıkar. Kolonlar:
   dosya:satır · iddia metni · sınıf (DOĞRU / YALAN / KANITSIZ) · repoda onu
   basan test/alet ADI (yoksa "YOK") · şimdiki zaman mı gelecek zaman mı.
   Sınıfı "DOĞRU" diyeceksen aleti KOŞTUR ve çıktıyı yapıştır.
8. **DURAN-İDDİA KALIPLARI** (`ALL PASS`, `0.00mm`, `zero`, `bitti`, `perfect`,
   `always`, `never fails`) `web/**` içinde kaç hit, hangi dosyada.
9. **MOBİL KIRILIM TABANI.** Sayfaların viewport meta'sı + 320px'te yatay taşma
   riski taşıyan sabit genişlikler (`width: NNNpx`, `min-width`) — grep, sayı.

## ÇIKTI
- `GECE/V10-A.md` — yukarıdaki 9 başlık, her sayının yanında komut.
  Sonunda **ÖZET SATIRI**: `DOĞRU n · YALAN n · KANITSIZ n · ölü link n`.
- `GECE/log/V10-A.site-health.txt`
- `GECE/log/V10-A.iddia.tsv` — 7. maddenin makine okunur hâli (tab ayraçlı),
  V10-B kapısının girdisi olacak.

## YASAKLAR
- `web/` altına YAZMA (tek bayt bile). Bu bir ÖLÇÜM kartıdır.
- `GECE/V0-0C.md`'yi değiştirme. Eski sayıyı taşıma; ölçmediğini yazma.
- "baktım / doğru görünüyor" yasak (RULES 3).
- `patterns_real/` altındaki PDF'lere dokunma.

## SÜRE TAVANI
60 dk. Tavanda o ana kadarki tabloyu commit et, kalan başlıkları
"ÖLÇÜLMEDİ — süre" diye ADIYLA yaz.

## COMMIT
`git add GECE/V10-A.md GECE/log/V10-A.*` +
`git commit -m "v10-a: measure every claim in web/ against today's engine"`
