# KART V10-B — `landing_truth_check` KAPISI (etiket: PARALEL, V10-C ile aynı anda)

## NE
`web/**` için MEKANİK doğruluk kapısı kur, ctest'e bağla, TABANLA, ve mutasyonla
kır. `web/` altına TEK BAYT yazma — kapı ölçer, onarmaz.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md`, `RULES.md`
- `GECE/V10-A.md` + `GECE/log/V10-A.iddia.tsv` (ölçülmüş iddia tablosu)
- `GECE/V10-R.md` (eşiklerin yayınlanmış kaynağı — C3 eşiği oradan)
- `engine/tests/docs_truth_check*` ve `engine/tests/docs-truth-baseline.json`
  (EMSAL: aynı desende kur; **`git ls-files` + `git ls-tree -r HEAD` kullan,
  varlık sorusunu DİSKE sorma** — V9'un taşınabilirlik dersi)
- `engine/tools/site-health.mjs`
- `contract/layers/shape-ratios.json` (motorun GERÇEK beden kümesi)
- `engine/CMakeLists.txt` (test kaydı)

## KAPININ BEŞ DENETİMİ (şef tanımladı; sayı basılır, hüküm tabana göre)
- **L1 sağlayıcısız sayı**: `web/**/*.html` + `web/js/*.js` içindeki her sayısal
  iddia cümlesi, aynı iddia bloğunda (aynı satır ya da onu saran öğe) repoda
  GERÇEKTEN VAR OLAN bir test/alet ADI taşımalı. Sağlayıcı adı `ctest -N`
  çıktısındaki test adları ∪ `engine/tools/*` dosya adları kümesinden
  doğrulanır — uydurma ad sağlayıcı SAYILMAZ.
- **L2 yasak vaat + duran iddia**: `made to measure`, `your own measurements`,
  `your measurements`, `no fixed sizes`, `custom fit`, `bespoke`, `ALL PASS`,
  `byte-identical`, `zero issues`, `always`, `never fails`, `perfect`,
  `0.000000 mm`. Hit sayısı basılır.
- **L3 vizyon zamanı**: vizyon bölümü `data-vision="1"` ile İŞARETLENİR.
  İşaretli blok içindeki her cümle gelecek zaman kipinde olmalı
  (`will` / `planned` / `roadmap` / `-acak/-ecek` / `yakında`); şimdiki zaman
  fiili (`is`, `does`, `generates`, `produces`, `üretiyor`, `yapıyor`) = ihlal.
  İşaretsiz blokta vizyon kelimesi (`coming soon`, `roadmap`) geçmesi de ihlal.
- **L4 ölü link**: `node engine/tools/site-health.mjs` exit 0 ve kırık link 0.
- **L5 beden dürüstlüğü**: sitede geçen her `EU\d\d` etiketi
  `contract/layers/shape-ratios.json`'un beden kümesinde OLMALI; ayrıca
  kullanıcının seçebildiği beden listesi (web/js) motorun kümesinin ÜSTKÜMESİ
  olamaz — yani "gösterilen beden = seçilen beden".

## TABAN
`engine/tests/landing-truth-baseline.json` — L1..L5 için bugünün sayıları.
**Yalnız DÜŞEBİLİR**; artış = kırmızı. ★ V9 DERSİ: borç kaydeden taban kapıyı
süse çevirir. Taban 0 DEĞİLSE, tabanın neden 0 olamadığını dosyaya ADIYLA yaz
(hangi sayı, hangi dosya, hangi kart onaracak).

## ÇIKTI
- `engine/tests/landing_truth_check.mjs` (ya da emsalin dilinde) + `engine/CMakeLists.txt` kaydı
- `engine/tests/landing-truth-baseline.json`
- `GECE/log/V10-B.red-before.txt` — **§4.2 BİRİNCİL USUL**: kapı BUGÜNKÜ
  (faz-öncesi) `web/` ağacına karşı koşulur ve **EXIT 1** vermelidir. Derleme
  hatası "kırmızı düştü" SAYILMAZ. Tam çıktı loga.
- `GECE/log/V10-B.mutasyon.txt` — **§4.5**: beş denetimin HER BİRİ için ayrı
  kasıtlı yalan ekle (geçici, `web/` DIŞINDA bir fikstür dosyasında ya da
  `git stash`'lenen tek satırlık düzenlemeyle), kapı KIRILMALI, geri alınınca
  yeşile dönmeli. İki log da dosyaya. Kırılamayan denetim SÜSTÜR ve öyle yazılır.
- `GECE/V10-B.md` — kısa tutanak: her denetimin sayısı + komutu + kendi kusurları
  (kaçış kanalları ADIYLA; V9-B3 emsali — işçinin kendi kusurunu ilan etmesi ÇIKTIDIR).

## YASAKLAR
- `web/` altına yazma. `docs/`, `README.md`, `GECE/KOSU.md`'ye dokunma.
- Mevcut testleri DEĞİŞTİRME. Yeni kırmızı AD doğurma (RULES 9) — kapı adı
  `landing_truth_check` tektir ve faz sonunda YEŞİL olmalı.
- Eşik uydurma: sayısal eşik kullanacaksan `GECE/V10-R.md`'deki kaynağa bağla.

## SÜRE TAVANI
60 dk. Tavanda: kapı + taban + red-before commit'lenir, mutasyon eksikse
"MUTASYON KOŞULMADI" diye ADIYLA yazılır ve kart kuyruğa döner.

## COMMIT
`git commit -m "v10-b: landing_truth_check gate over web/, baselined and mutation-proven"`
