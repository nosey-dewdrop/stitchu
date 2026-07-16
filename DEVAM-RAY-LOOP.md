# DEVAM — RAY 1 + RAY 2 GECE ZİNCİRİ (Damla uyuyor, zincir otonom)

Damla direktifi 17 Tem gece: iki ray için detaylı loop planı; agent'lar ayrı
session'da başlatılacak. Bu dosya o session'ın anayasası.

## BAŞLATMA KOMUTU (Damla yeni session'a şunu yapıştırır)
> stitchu'ya devam. ~/damla_projects_2026/00_currently_on_working/stitchu/DEVAM-RAY-LOOP.md
> oku ve zinciri otonom koştur. Ben uyuyorum, sabaha rapor.

## ZORUNLU OKUMA SIRASI (orkestratör İLK İŞ; loop agent'ları da prompt'larında alır)
1. CLAUDE.md (bu repo, gitignore'lu/lokal — en üstteki 17 Tem status'ler + GOTCHAS bölümü)
2. BENCHMARK-58.md (anayasa: tek metrik, held-out ilkesi)
3. reports/2026-07-16-stitchu-benchmark-loopM1.md (motor loop'unun BİREBİR şablonu)
4. DEVAM-DATA-LOOP.md (Ray 2 arka planı + AMBAR YASASI) + dataset/brands.md (iç liste)
5. engine/FORMULAS.md (motor loop'ları için; her yeni blok buraya bölüm ekler)

## MEKANİK KOPYA KAĞIDI (bilinmeden loop açılmaz)
- Ölçüm (0 kredi): node engine/tools/benchmark-58.mjs cache reclassify yolu — canlı
  çağrı YAPMA, DRAWN_SINCE kuralına yeni çizilen terimleri ekle, results-*.json snapshot.
- Deploy: ?v bump TÜM sayfalarda → git add web/ (HEPSİ, sadece dokunulan değil) →
  `SHA=$(git subtree split --prefix=web HEAD | tail -1)` → `git push --force origin <SHA>:gh-pages`
  → canlı curl teyit (cache-bust ?fresh=ts). Motor değiştiyse önce: engine_check +
  cutline_check + precision + web-fuzz + golden diff + vocab-sweep, iki wasm derle
  (build-wasm.sh; browser + worker hedefi).
- Paralel loop'lar AYNI dosyaya dokunacaksa (patches.html/index.html): her agent kendi
  worktree'sinde çalışır, push öncesi git pull --rebase, çakışmayı kendisi çözer.
- Madencilik: engine/tools/mine-vocab.mjs (başındaki yorum blokunda tüm bayraklar).
  Kredi hatası "credit balance too low" = zarif duruş, banka --aggregate ile dökülür.

## İŞLETİM KURALLARI (pazarlık yok)
- Her loop TAZE arka plan agent (Opus 4.8), kendi worktree'sinde. Orkestratör ana
  session'dır: loop bitince NEREDEYİZ'i günceller, sıradakini açar.
- FRAKTAL KURAL: loop takılırsa/ilerlemezse o mikro sorunu çözen mikro-loop açılır,
  raporda "MİKRO-LOOP: sorun/çözüm/dönüş noktası" bloğu, bitince kaldığı yere döner. Pes yok.
- KREDİ = YEMEK PARASI, TAM HASAT EMRİ: her vision çağrısının TAM çıktısı
  dataset/labels/<hash>.json'a bankalanır (madencilik+eğitim+cache üçü birden), aynı
  foto ASLA ikinci kez çağrılmaz, benchmark ölçümü HEP 0-çağrı cache reclassify.
  Her kredili loop başlamadan çağrı sayısını loglar; TAVAN aşılmaz.
- KANIT REJİMİ: golden byte-identical + ctest + web-fuzz + vocab-sweep + render-pages
  gözle teyit; kanıtsız "oldu" yasak. BENCHMARK-58.md + CLAUDE.md status her loop sonu.
- benchmark-58/ ve dataset/ fotoğrafları ASLA stage/push edilmez. 58-set held-out:
  eğitimde/promptta KULLANILMAZ.
- Her SHIPPED loop: patches.html girdisi (numara sırayla 3.4'ten devam) + index sayacı +
  ?v bump + subtree gh-pages deploy + canlı curl teyidi.
- İçerik: her loop sonunda ~/damla_projects_2026/icerik/linkedin.md (essay, numaralı
  zincir, 300-500 kelime, ses Damla) + devlog.md (reel: hook 2sn + 30-45sn) stitchu
  bölümüne CERRAHİ ekleme. Rapor: ~/damla_projects_2026/reports/YYYY-MM-DD-konu.md.
- Commit: lowercase english, no emojis, no dashes, co-author ASLA. Push'lar milestone'da.

## SIRA (kredili işler öne: Damla uyurken kredi sorunu çıkarsa gece boşa geçmesin,
## motor rayı krediden bağımsız devam eder)
R2.0 → R2.1 → (paralel: R1.1 + R2.3) → R2.2 → R1.2 → R1.3 → (kaldıysa R2.4)

---

## RAY 2 — VERİ/KELİME MADENCİLİĞİ (kredi harcar, tam hasat)

### R2.0 — ANCHOR TESTİ (gate, ~10 çağrı)
`node engine/tools/mine-vocab.mjs --anchor 10`. AMBAR YASASI: 230 mevcut etiketin
"şüpheli" damgası kalkar ya da sorun raporlanır. GEÇMEZSE: mikro-loop aç (neden
sapıyor), çözülmeden R2.1'e GEÇME; çözülmüyorsa Ray 2'yi durdur, Ray 1 devam.

### R2.1 — OPEN-SET MADENCİLİK KALAN TUR (tavan 2.270 çağrı, partili)
`node engine/tools/mine-vocab.mjs --openset --limit 500` × 4 parti + artık.
Her parti sonunda: etiket sayısı + kaba maliyet logu + hata oranı. Kredi biterse
(400/credit hatası) ZARAFETLE dur, o ana kadarki bankayı --aggregate ile rapora döker,
NEREDEYİZ'e "kredi bitti, kaldığı yer" yazar. Kategori-dengeli sampler kullanılır.

### R2.2 — PAZAR PUSULASI RAPORU (0 kredi)
`--aggregate` → dataset/vocab-frequency.md yenile. Çıktı raporu: terim × frekans ×
marjinal kazanç tablosu; 58-set kuyruğu (peplum/Jackie) ile YAN YANA kıyas. Bu rapor
R1 kuyruğunun kalanını YENİDEN SIRALAR (Damla'ya sabah tek tablo). İçerik logu YAZAR
(pazar pusulası iyi essay malzemesi).

### R2.3 — DALGA 2 DEFİLE TOPLAYICI (0 kredi, sadece indirme)
dataset/brands.md'deki 30 marka (İÇ dosya). collect.mjs'e runway/lookbook kaynağı ekle.
KIRMIZI ÇİZGİLER: robots.txt, rate-limit (istek arası bekleme), paywall YOK, sadece
herkese açık sayfalar, foto lokal+gitignore, marka adı sadece iç manifest.
FİLTRE (Damla, aynen): gelinlik/düğün/Met Gala/kırmızı halı TOPLANMAZ; hedef zarif
Fransız kadını, giyilebilir RTW; couture evlerinde SADECE ready-to-wear koleksiyonlar.
Hedef ilk parti: marka başı 30-80 foto, ~1.500-2.000 toplam, 1024px, hash-dedup, manifest.

### R2.4 — DEFİLE MADENCİLİĞİ (kredi kaldıysa, tavan 300 çağrı)
R2.3 havuzundan kategori-dengeli 300 örnek → mine-vocab borusu (tam hasat).
Amaç sayı değil COUTURE TERİM çeşitliliği; vocab-frequency'ye "runway" etiketiyle girer.
Kredi yoksa atla, NEREDEYİZ'e yaz.

### RAY 2 SINIRI: Track B EĞİTİMİ BU GECE YOK. Damıtma eğitimi ambar güvenilir +
### Damla uyanıkken başlar (onun kararı).

---

## RAY 1 — MOTOR DAĞARCIĞI (kredi HARCAMAZ; ölçüm hep cache reclassify)

### R1.1 — PEPLUM (patch 3.4, beklenen +2 → 31/54)
Bel hizasından takılan volan parçası. M1/tie/strap ile aynı kalıp: opt-in post-pass
(enum default None → golden BYTE-IDENTICAL), Aldrich/Armstrong konstrüksiyonu (peplum =
flare'li çember/yarım-çember segment, bel kenarı = bitmiş bel ölçüsünden OLCULU truing),
dürüst sınırlar (çizemediği peplum türü honest kalır). Köprü: create.js pick + missing.js
suppression + engine.js/backend/bindings param + iki wasm derle. Kanıt rejimi tam.
Yeni ctest: peplum_check. FORMULAS.md bölümü.

### R1.2 — JACKIE KOMBO (patch 3.5, beklenen +6 → ~37/54; GECENİN BÜYÜK İŞİ)
İKİ dal TEK oturumda (kombo şart, tek başına +1/+0): (a) ASİMETRİK DÜĞME PATI —
mevcut PlacketBlock'u CF'den kaydırılmış asimetrik kapanmaya genişlet (fold çizgisi
asimetrik, düğme sırası kaymış CF üstünde, facing yeniden), (b) CAP SLEEVE ŞEKLİ —
SleeveBlock'a kısa kanat cap varyantı (omuz noktasından ölçülü, armhole'a 1:1).
Her dal kendi ctest'i. Golden byte-identical iki dalda da. Takılan dal olursa fraktal
mikro-loop; bir dal bitmez ise BİTEN dalı shipped yap, bitmeyeni NEREDEYİZ'e dürüstçe yaz
(yarım iş "oldu" DENMEZ). Ölçüm: cache reclassify, Jackie ×6 hedef.

### R1.3 — DENETİM C (bağımsız, 0 kredi)
Taze denetçi agent (R1.1/R1.2 kodunu görmemiş): golden'ı kendi regen+diff eder, ctest'i
kendi derler, reclassify'ı kendi koşar, sayı serisini results snapshot'larıyla doğrular,
DRAWN_SINCE sızıntı taraması. Denetim A/B formatı. GEÇMEYEN madde = ilgili loop yeniden
açılır (fraktal).

### R1.4 — FAZ P PRİMİTİF KATMANI (BU GECE BAŞLAMA — sabah Damla kararı)
Not olarak durur: PieceSplit / GatherStrip / FlaredAppendage primitifleri MEVCUT
bloklardan (tie/slit/strap/peplum) damıtılır + terim→tarif tablosu. R2.2 pazar pusulası
çıktısı bu tasarımı besler. Büyük oturum, Damla uyanıkken.

---

## NEREDEYİZ
> (zinciri koşturan orkestratör her loop sonunda burayı günceller: hangi loop bitti,
> sayı kaç, kredi durumu, açılan mikro-looplar, sıradaki)

- **R1.1 PEPLUM BİTTİ (patch 3.5, deploy v73).** FULL **29→31/54 (+2)** = Cloe
  Puffed Sleeve Peplum Top + Serene Fit Blouse (ikisi de tek-terimli peplum, başka
  oov'ları zaten çizilir durumdaydı). ELEMENT 58→60/103 (%58.3). 0 vision çağrısı
  (cache reclassify, kredi harcanmadı). PeplumStyle {None,Full,Half,Pointed} opt-in
  post-pass, iç bel yayı bitmiş bele trued (r0=share/π), golden byte-identical. ctest
  20/20 (peplum_check truing 0.07mm), web-fuzz 20110/0, vocab-sweep 37800/0, render
  peplum-full-top + peplum-pointed-top (PNG gözle onaylandı: çember + sivri variant).
  İki wasm derlendi. 2 mikro-loop (waist truing → m.waistMM() pass-in; arc flatten
  24→64 segment). NOT: paralel A4 loop patch 3.4'ü aldığı için peplum 3.5 oldu; rebase
  ile A4+sewing-guide üzerine layer'landı (create.js/patches/index/?v origin üzerine
  yeniden uygulandı). Rapor: reports/2026-07-17-stitchu-loop-peplum.md. SIRADAKİ RAY 1:
  **R1.2 Jackie kombo** (asimetrik pat + cap sleeve, +6 → ~37/54).

- A4 STRATEJİ LOOP BİTTİ (patch 3.4, deploy edildi, canlı v72 curl teyitli). Sabit
  22-çizimlik test takımında toplam A4 sayfa sayısı 456 -> 430 (-26, -5.7%), sıfır
  kalıp gerilemesi. Seri: 456 -> 442 (skyline packer) -> 439 (min-waste fit) -> 436
  (sıralama varyantları) -> 431 (parça bazlı katı 90° döndürme) -> 430 (genişlik
  sırası). Loop -1 sayfa marjinal kazançta kapandı (eşik 5). Tasarım: packPieces
  içinde min-sheets YARIŞI (shelf + skyline varyant yelpazesi), yeni strateji ancak
  yardım edebilir asla geriletemez, o yüzden geri alınan strateji YOK. Kutsal kural
  korundu: 1:1 gerçek ölçek/dış hat dokunulmadı (sadece grup transform), register
  continuity 139 çift <0.01mm, 22 çizim/57 döndürülmüş yerleşim 0 bütünlük hatası,
  boşluk tam 12mm. Kod: web/js/sheet.js (skylinePack + placeDim + orient, packPieces
  race). Rapor: reports/2026-07-17-stitchu-a4-strateji-loop.md. İçerik: linkedin
  Essay 21 + devlog seri BD. Rebase çakışması (render.js, paralel loop sewing.js
  import ekledi) çözüldü, ikisi de v=57'ye bump'lamış. Kredi harcanmadı (tamamen
  lokal/deterministik ray). SIRADAKI (kaldıysa): FAZ P primitif katmanı ya da
  MaxRects packer (rapor "Next ideas"); ama A4 sayfa rayı marjinal kazanç <5 ile
  PARK edildi, sayfa sayısı yeniden canı yakana dek açılmaz.
