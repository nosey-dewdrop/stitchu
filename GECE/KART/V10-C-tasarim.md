# KART V10-C — LANDING TASARIMI (etiket: PARALEL, V10-B ile aynı anda)

## NE
`web/index.html` (ve zorunlu olduğu kadarıyla ona bağlı sayfa/JS) ŞU ürünü
anlatsın: **foto + prompt → kalıp + flat + REHBER**, üç çıktı da sayfada GÖRÜNSÜN.
Yalan çıkar, vizyonu ETİKETLE ve GELECEK ZAMANA çevir. Görsel kimliği YENİDEN YAZMA.

## GİRDİ DOSYALARI (isim isim)
- `ENV.md`, `RULES.md`
- `GECE/V10-A.md` + `GECE/log/V10-A.iddia.tsv` — **düzeltilecek yalanların listesi budur**
- `web/index.html`, `web/js/*.js`, `web/create.html`, `web/api.html`,
  `web/shop-shift-dress.html`, `web/showcase.html`, `web/signature.html`,
  `web/benchmark.html` (yalnız gerektiği kadar)
- `contract/layers/shape-ratios.json` — motorun GERÇEK beden kümesi
- `engine/tools/site-version.mjs`, `engine/tools/site-health.mjs`
- PNG kanıtları (sayfada kullanılabilir): `GECE/log/V7-E.png/flat-sleeve-straight.png`,
  `flat-sleeve-balloon.png`, `flat-sleeve-cap.png`, `flat-sleeve-none.png`

## ★ BU GECENİN GERÇEĞİ — sayfaya yazarken karıştırma
GERÇEK (şimdiki zamanla yazılabilir, ama sağlayıcı ADIYLA):
- **Sabit beden, 8 beden, EU34–48.** Sağlayıcı: `contract/layers/shape-ratios.json`.
- **Kol gerçekten çiziliyor**: 4 ayrı geometri, yedirme %3.99 ölçülü, PNG'leri var.
- Sözlük kilitli (`vocab_reference_check`), sınır tanımadığı değeri **ADIYLA
  REDDEDİYOR** (27 alan + 7 gövde ölçüsü).
- **Foto→spec %20.0** — 5 fotonun 1'i tam doğru; alan bazında %92.2. Bu sayı
  sayfada geçecekse **ADIYLA ve PAYDASIYLA** geçer, yuvarlanmaz, süslenmez.

VİZYON (yalnız `data-vision="1"` etiketli blokta, GELECEK ZAMANLA, canlı görsel YOK):
- Kumaş ekseni "aynı elbise, iki kumaş, iki kalıp" — **V8 KOŞMADI**.
- Mutfak anlatısı "sınırlı malzeme → sınırsız ürün" — ara değer 35 eksende
  hâlâ giysi üretmiyor. Canlı örnek DEĞİL.
- **Editleme**: kapı var, ürün yok (`edit_locality_check` tek beden/tek spec,
  çıpa sözlüğü ana dalda YOK) → VİZYON, demo değil.
- Üyelik / forum / iOS: **TEK SATIR**, gelecek zaman.

SAYFADAN ÇIKACAK (yalan):
- **BÜTÜN MTM DİLİ**: "your own measurements", "no fixed sizes", "made to
  measure", "custom fit", "bespoke", "drafted per body" (284 hit, 44+ dosya).
- **EU34–52 iddiası** (motor EU34–48). Sayfada iki aralık yan yana duruyor.
- **`web/api.html`** worker'ı canlı ürün gibi anlatamaz (ENV.md son satır).
- **"dikilebilir kalıp" SATIŞI**: `sewability_check` 585 ihlal, `draft_math_check`
  12 ihlal; kalça payı 8/8 bedende yayınlanmış minimumun ALTINDA. Bu vaat DURMAZ.
- **`0.000000 mm`** — aleti (`precision-report.js`) **iki basamak** basıyor.
- Duran-iddia kalıpları (`ALL PASS`, `byte-identical`, `zero issues`, `always`).
- **Dikiş payı çelişkisi**: sitede 15mm / 10mm / 1.5cm üç ayrı sayı. Sevk edilen
  hat WASM = `kSeamAllowanceMM = 15` (`engine/src/constants.gen.hpp:13`).
  TEK sayıya indir ve kaynağını yaz.

## ★ GÖSTERİLEN BEDEN = SEÇİLEN BEDEN (kod düzeltmesi, bu kartın işi)
`web/js/create.js:810` 10 beden sunuyor; `:866` issue'lu bedeni **sessizce
düşürüyor**; `web/js/print.js:230` yine de kullanıcının seçtiği etiketi
damgalıyor. Beden listesi motorun kümesinden (`shape-ratios.json`) türesin;
düşen beden olursa **sessiz değil, adıyla** reddedilsin (RULES invariant 1).

## ★ TASARIM YASASI (ihlali FLOP = KALICI VETO)
- **Mevcut görsel kimlik YENİDEN YAZILMAZ.** stitchu = düz teal tek renk dünyası,
  1px tel çizgi kenarlıklar, Arial/Helvetica veya sistem mono, küçük harf ses.
  Düzen ve İÇERİK yenilenir. Kimlik değişikliği gerekiyorsa KOD YAZMA — iki
  yönlü taslağı `DAMLA-KUYRUK.md`'ye 3.8.d formatında yaz.
- **YASAK (otomatik ret):** 3px üstü yuvarlak köşe · pill/rozet · gradient ·
  glassmorphism · dekor gölge · Inter/Poppins/DM Sans/Manrope · mor/indigo aksan
  · üç kolonlu ikon+başlık+iki satır özellik ızgarası · zikzak alternating
  bölümler · hero'da dev ortalanmış başlık + "Get Started"/"Learn More" ikilisi ·
  emoji · Title Case başlık · ünlem · `hover:scale-105` · fade-in-on-scroll ·
  sahte sayı/testimonial/logo bulutu · "Supercharge/Unleash/Seamless/Effortless" ·
  cümle içinde tek renkli kelime · kartlarda 3-4px renkli sol kenar · SVG dalga
  ayırıcı · iskelet yükleyici · "Are you sure?" modal.
- **Hiyerarşi BOYUTLA kurulur**, dekorla değil. İçerik arayüzün kendisidir:
  üç çıktı (kalıp · flat · rehber) **gerçek çıktı olarak** görünsün, ikonla
  temsil edilmesin.
- **Soru formundaki her başlık `?` ile biter** (Damla'nın kalıcı kuralı).
- **waitlist KORUNUR** — kaldırma, taşıma, davranışını değiştirme.
- Mobil: 320 CSS px genişlikte **yatay kaydırma olmamalı** (WCAG 2.2 SC 1.4.10).
  ⚠ `web/index.html:34` `body{overflow-x:hidden}` taşmayı GİZLİYOR, çözmüyor —
  gizlemeye güvenme, düzeni düzelt.

## ÇIKTI
- Değişen `web/**` dosyaları
- `GECE/V10-C.md` — ÖNCE/SONRA iddia tablosu (dosya:satır · eski cümle · yeni
  cümle · sınıf DOĞRU/VİZYON/SİLİNDİ · sağlayıcı ADI), + dokunulan her dosya
- `node engine/tools/site-health.mjs` çıktısı → `GECE/log/V10-C.site-health.txt`
  (exit 0 ve ölü link 0 olmalı)

## YASAKLAR
- `engine/` altına, `docs/`'a, `README.md`'ye, `GECE/KOSU.md`'ye dokunma.
- **DEPLOY YAPMA.** `scripts/deploy.sh` çalıştırma, subtree push etme,
  "canlı/yayında" deme. Yayın Damla'nın adımı.
- `?v` damgasını elle değiştirme; tek kaynak `site-version.mjs`.
- Sahte sayı, sahte kullanıcı, sahte referans. Sayı yoksa cümle de yok.

## SÜRE TAVANI
60 dk. Tavanda: o ana kadarki `web/` değişikliği commit'lenir, kalan sayfalar
`GECE/V10-C.md`'ye "DOKUNULMADI" diye ADIYLA yazılır.

## COMMIT
`git commit -m "v10-c: landing tells the real product — photo+prompt to pattern, flat and guide; mtm language removed, vision blocks labelled"`
