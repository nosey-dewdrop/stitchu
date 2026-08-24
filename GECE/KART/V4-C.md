# KART V4-C — ZEVK PANOSU: referans dili + bugünkü flat'lerin ESKİ panosu

ETİKET: PARALEL (tur 1; V4-R ve V4-K ile birlikte, dosya kümesi kesişmiyor)
SÜRE TAVANI: 60 dk

## NE
İki iş, tek kart:
(1) Zevk referansının ÖZELLİK DİLİNİ çıkar — Chanel Haute Couture, Bershka /
    Stradivarius, genz estetiği, profesyonel Etsy kalıp listingleri.
(2) Bugünkü flat çıktılarımızı tek bir **ESKİ** panosuna PNG olarak bas.
Hüküm Damla'nındır; sen hüküm VERMEZSİN, malzemeyi hazırlarsın.

## (1) REFERANS DİLİ — GÖRSEL İNDİRİLMEZ
KALICI VETO (§7.2): telifli görsel indirmek YASAK. Referans =
**link + özellik-dili tarifi**. Panoya başkasının görseli BASILMAZ.

Dört kova, her kovada en az 3 referans:
- **Chanel HC** (couture teknik çizim / atölye dili)
- **Bershka / Stradivarius** (hızlı moda ürün sayfası flat/ürün çizimi)
- **genz** (bugünün genç estetiği — hangi siluet, hangi çizgi dili)
- **profesyonel Etsy kalıp listingleri** (satan listinglerin flat'i nasıl)

Her referans için satır: KAYNAK (link) · NE GÖRÜNÜYOR (özellik dili:
çizgi kalınlığı hissi, siluet oranı, ön/arka sunumu, detay büyütmesi var mı,
renk/dolgu, arka plan, tipografi) · BİZDE KARŞILIĞI (bugün var mı, yok mu) ·
ÖLÇÜLEBİLİR Mİ (bu özellik bir kapıya bağlanabilir mi — evet/hayır + nasıl).
★ Son kolon kartın asıl değeridir: "güzel" değil, ÖLÇÜLEBİLİR ne var.

## (2) ESKİ PANOSU — bugünkü çıktı, kırpmasız
Bugünkü üretim kalemini koştur ve PNG bas:
- `engine/tools/render-garment-flat.mjs` — en az 6 stil, birbirinden GERÇEKTEN
  farklı aileler (elbise · üst · prenses · puf kol · peplum · bandeau).
  Stil adları `engine/flat-engine/styles.json` → `styles` anahtarlarından.
- `./engine/build/shell-flat EU38 --svg` — hesaplanan kabuk konturu.
- Emsal alet: `engine/tools/render-pages.mjs` / `render-flat.mjs` — ÖNCE GREP,
  yeni render altyapısı KURMA (§7.5: engine/tools altında yüzü aşkın alet var).

Pano tek PNG (ya da az sayıda PNG): her hücrede stil adı + hangi kalemden
çıktığı yazılı. **Kırpma, retuş, yeniden çizim YOK** — çıktı neyse o.
Panonun sağına ileride YENİ sütunu eklenecek; yer bırak ve düzeni
`GECE/V4-C.md`'de tarif et ki V4-D aynı düzende ESKİ|YENİ basabilsin.

## GİRDİ DOSYALARI (isim isim)
- `engine/tools/render-garment-flat.mjs` (OKU + KOŞTUR, DEĞİŞTİRME)
- `engine/flat-engine/styles.json` (OKU)
- `engine/tools/render-pages.mjs` · `engine/tools/render-flat.mjs` (emsal)
- `./engine/build/shell-flat` (KOŞTUR)
- `contract/flat-convention-v1.json` (OKU — bugünkü kanun)
- ENV.md · RULES.md

## ÇIKTI
- `GECE/V4-C.md` — dört kovalı referans tablosu + pano düzeni tarifi +
  BASILAN HER PNG'NİN TAM DOSYA YOLU (RULES 3: yol yoksa adım yapılmamıştır)
- PNG'ler `GECE/log/V4-C.pano/` altına
- pano üreteci gerekiyorsa TEK yeni dosya, `engine/tools/` altına, adı
  `flat-board.mjs` (§7.5 sayacı: 1 yeni kaynak dosya)

## YASAKLAR
- Telifli görsel indirme (§7.2). Ekran görüntüsü alma, kaydetme yok.
- Hiçbir kapıyı "Buğra'ya benziyor mu" diye kurma (§7.3, §2.10):
  zevk ölçütü Buğra DEĞİL.
- `engine/src/`, `engine/tests/`, `contract/` altına YAZMA.
- Hüküm verme ("bu güzel/çirkin"). Sen ölçülebilir özelliği ayıklarsın.
- "Etsy'lik değil" tek başına çıktı değildir (§4.7): bir eksiklik yazdıysan
  yanına EN AZ BİR geliştirme yolu yaz.
