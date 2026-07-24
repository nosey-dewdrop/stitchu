# K6 — OPERASYONEL SERTLEŞTİRME + ARŞİV raporu (2026-07-19, patch 3.25)

Kapanış zinciri son üretim rayı. A1 temiz (yeni özellik yok: deploy sarmalayıcı,
arşiv taşıma, metin düzeltmesi, gitignore istisnası). A5 temiz: 0 API/vision çağrısı.
Motor koduna dokunulmadı (engine/src, engine/wasm, golden by-construction aynı).

## 1. deploy.sh — tek deploy komutu (K0 5.1, 5.2, 5.9)

scripts/deploy.sh: mevcut mekaniği (git add web/ ALL → subtree split → force push
gh-pages → canlı curl) SARAR, değiştirmez. Öldürülen hata sınıfları:

- UNUTULAN ?v BUMP ÖLDÜ (5.1): sıradaki sürüm otomatik hesaplanır, web/ altındaki
  TÜM html/js/css'e uygulanır; bump sonrası birden fazla ayrık sürüm kalırsa
  deploy FAIL (mandal). Not: K0'ın bulduğu 8-sürümlü kayma (61-91) K5 deploy'unda
  zaten tek 95'e toplanmıştı; script bu sınıfın geri gelmesini imkansızlaştırır.
- KANIT ZİNCİRİ KAPI OLDU: style-lint (render-lint + preview-truth zincirli) +
  header-diff + validate-contract + ctest (engine/build varsa, 45 test) yeşil
  olmadan yayın yok. Kanıt: bu deploy'da hepsi koştu (aşağıda).
- SESSİZ BAYAT MOTOR DEPLOY'U ÖLDÜ (5.9): yayınlanmamış commit'ler engine/src ya
  da engine/wasm'a dokunuyorsa script durur, tam motor kanıt seti (iki wasm +
  golden diff + sweep/fuzz) ister; STITCHU_MOTOR_PROOF=done olmadan geçmez.
- WORKER URL DRIFT GUARD'I (5.5): web/ içindeki her workers.dev URL'i
  config.js'teki BACKEND_URL ile birebir aynı olmalı, değilse deploy FAIL.
  DÜRÜST SINIR: inline kopyalar (index.html:~326, api.html:~182) module-import
  refactor'üyle TEK kaynağa İNDİRİLMEDİ — kapanış zincirinde davranış riski
  almak yerine ayrışma sınıfı mandalla öldürüldü. Refactor v1.1 adayı.
- /tmp/package.json tuzağı (K4 gotcha): script başlık yorumunda + preflight WARN.
- Force-push subtree (5.2): tek komuta sarıldı; push öncesi pull --rebase origin
  main, sonrası canlı doğrulama (index tek sürüm + 3 sayfa HTTP 200, cache-bust).

Bu loop'un SON DEPLOY'U scripts/deploy.sh İLE yapıldı (yeşil şartı; kanıt aşağıda).

## 2. Gizlilik / operasyon taraması (K0 5.3-5.7, 5.10 + K0 mini-denetim MINOR 1)

SIZINTI YOK, ROTASYON GEREKMİYOR. Kanıtlar:

- .benchmark-token (5.3): gitignore'lu (benchmark-58/ bloğu), lokalde var,
  `git log --all -- benchmark-58/` BOŞ = git geçmişine HİÇ girmemiş. Türü
  rate-limit bypass eşi (BENCH_BYPASS wrangler secret'ının kopyası). Rotasyon:
  gerekli DEĞİL (sızıntı yok); gerekirse prosedür = `npx wrangler secret put
  BENCH_BYPASS` + benchmark-58/.benchmark-token dosyasını aynı değerle güncelle
  (BENCHMARK-58.md satır ~322'de kayıtlı mimari).
- KV namespace id (5.4): backend/wrangler.toml:26'da VE benchmark-58.mjs:40'ta
  (KV_NS) — İKİ kopya. Namespace id bir kimliktir, secret değildir; Cloudflare
  hesap yetkisi olmadan kullanılamaz, wrangler.toml'da tutmak standart pratik.
  Public repoda kalması KABUL; çift kopya drift riski v1.1 notu.
- wrangler reset yolu (K0 mini-denetim MINOR 1, envanterde eksikti — BURADA
  KAPSANDI): benchmark-58.mjs resetFuse() kendi IP'sinin fuse sayaçlarını authed
  wrangler ile siler (satır ~55-65). Secret içermez; lokal wrangler login ister
  (Damla'nın makinesi). Gerçek kullanıcı limitlerine dokunmaz (yalnız kendi IP
  anahtarları). Temiz.
- Worker URL (5.5): kamusal by-design (config.js yorumu). 3 web kopyası deploy
  guard'ıyla kilitli (yukarıda). Araçlardaki kopyalar (benchmark-58.mjs,
  mine-vocab.mjs) ölçüm scripti, guard kapsamı dışı, not edildi.
- APP_TOKEN (5.6): wrangler secret + App/Stitchu/Secrets.swift PLACEHOLDER;
  Secrets.swift git'te YOK (ls-files 0, log --all 0). Rotasyon komutları
  backend/DEPLOY.md'de. Temiz.
- CLAUDE_API_KEY (5.7): yalnız Cloudflare secret. Repo genelinde canlı sk-ant-
  değeri git grep'te YOK (yalnız doküman referansı "your sk-ant- key"). 15 Tem
  "key rotation still open" notu DAMLA'DA — NEREDEYİZ'e taşındı, anahtar
  üretilmedi/döndürülmedi (emir gereği).
- gitignore kapsamı (5.10): benchmark-58/, dataset/* (araç istisnaları),
  collect.config.json, Secrets.swift ignore'lu; `git ls-files dataset/` yalnız
  6 araç/veri-temiz dosya. dataset/ geçmişindeki 2 commit yalnız araçlar. Temiz.
- Secret DEĞERİ hiçbir dosyaya/roapora yazılmadı.

## 3. Arşiv (K0 3.1-3.8 + NEREDEYİZ kalıntıları)

docs/archive/ altına taşındı (git mv, tarih korunur; mockup=kontrat gereği
silinmedi):

- tools/: print-repro.js, halter/keyhole/ruffle/sweetheart/tiered-ruffle-proof
  .js+.svg (5 script + 5 svg), flat-v2.mjs + 4 üretilmiş çıktı (3.1-3.4),
  _render-smocked-babydoll.mjs + render-garment-from-pieces.mjs (untracked
  zincir-öncesi kalıntılar, İLK KEZ commit'lendi — aşağıda karar).
- flat-engine/: courtney-flat.svg/.png (3.5).
- mocks/: mocks/ dizininin tamamı (7 mockup + assets) + kök mock.html (3.7).
- asset-guide/: asset-guide.html/-tr.html/.pdf (3.8).
- Canlı referans taraması: taşınanlara kod referansı 0 (yalnız prose/tarih
  notları). virtual-sew.js envanterde YOK, yerinde kaldı.

KARARLAR:
- render-listing-card.mjs uncommitted diff (K1 MINOR 4): İŞE YARAR — 3 renk
  sabiti bej/krem paletten sitenin bebek-mavisi dünyasına hizalanıyor (LINE
  #bcd7ee = --bb-line, MUTE #5b7089 = site metni). 16 Tem reskin'in araçlara
  yansımamış kuyruğu. COMMIT'LENDİ (geri alınmadı).
- render-garment-from-pieces.mjs: sahipsiz ama tasarım-gerekçesi değerli
  (parça-tabanlı dürüst çizim argümanı, 18 Tem). Canlı zincirde 0 referans →
  ARŞİV (silinmedi). _render-smocked-babydoll.mjs onun tek çağıranı, birlikte.
- Bayat engine/dist (K4 MINOR c): gitignored LOKAL artefakt; commit'li kanonik
  kopyalardan geri dolduruldu (web/vendor/stitchu-engine.js → dist, backend/
  engine/stitchu-worker.{js,wasm} → dist), md5 birebir doğrulandı. Araçlar
  artık canlıyla aynı motoru sürüyor; derleme YAPILMADI (A4).
- SPECS-next-vocabulary.md (3.6): UNVERIFIED + PARK bandı dosya başına EKLENDİ
  (K0 doğru buldu: bant yoktu, zincir dosyası "zaten var" sanıyordu).

## 4. Metin düzeltmesi: patches.html 6 em-dash

K3 dönemi girdisindeki (3.23) 6 uzun çizgi görünür metinden çıkarıldı (: , ;
ile), Damla'nın kalıcı yazım emrinin ihlaliydi ve style-lint'i (dolayısıyla
deploy.sh kanıt adımını) düşürüyordu. style-lint şimdi exit 0. Dürüst not:
bu K5 mini-denetim MINOR 2'nin kapanışı; içerik anlamı değişmedi.

## 5. Diğer NEREDEYİZ adayları

- results-snapshot üzerine-yazma: K0 envanterinde YOK → KİLİT 1 gereği bu
  zincirde AÇILMADI, v1.1 damgası NEREDEYİZ'de (patches 3.25 honest notunda da
  yayınlandı).
- vocab-canonical.json: içerik değerlendirildi — SAF terim-eşanlam haritası
  (71 giriş; foto adı, kaynak URL, kişisel veri YOK) → sızıntı DEĞİL,
  gitignore istisnasıyla COMMIT'lendi. %6.7 korpus sayısı artık repodan
  yeniden üretilebilir (K1 MINOR 2 kapandı; dosyasız %6.2 sapması öldü).
- Hukuk sorusu NEREDEYİZ'e yazıldı (yorum yapılmadı).

## 6. K0 envanter-5 kapanış tablosu (yeşil şartı: satırlar sıfır)

| satır | durum |
|---|---|
| 5.1 manuel ?v | KAPANDI (deploy.sh otomatik bump + tek-sürüm mandalı) |
| 5.2 korkuluksuz force-push | KAPANDI (deploy.sh sarmalama + pull --rebase + canlı doğrulama) |
| 5.3 .benchmark-token | KAPANDI (tarama: geçmişte yok; rotasyon prosedürü kayıtlı, gerek yok) |
| 5.4 KV id | KAPANDI (kimlik, secret değil; public kabul; çift kopya v1.1 notu) |
| 5.5 worker URL ×3 | KAPANDI-MANDALLA (deploy guard ayrışmayı öldürür; refactor v1.1) |
| 5.6 APP_TOKEN senkron | KAPANDI (git'te yok; rotasyon komutları DEPLOY.md; takvim Damla'da) |
| 5.7 CLAUDE_API_KEY | KAPANDI (yalnız CF secret; rotasyon hatırlatması NEREDEYİZ'de Damla'ya) |
| 5.8 paralel clobber | KAPANDI (NEREDEYİZ notu; zincir seri koşuyor, K0 19 gereği ek iş yok) |
| 5.9 elle motor kanıt seti | KAPANDI (deploy.sh motor guard'ı) |
| 5.10 gitignore teyit | KAPANDI (tarama temiz satırı, bölüm 2) |

## 7. Kanıt (bu deploy)

- style-lint 81 sayfa + render-lint + preview-truth: exit 0
- header-diff 52 sayfa: exit 0
- validate-contract: GREEN
- ctest 45/45 (38.9s, deploy.sh içinde yeniden koştu)
- golden: by-construction (engine/src ve wasm'a dokunulmadı; motor guard 0 buldu)
- deploy: scripts/deploy.sh ile ?v 95→96, subtree gh-pages, canlı curl:
  index tek sürüm ?v=96 + patches/create/benchmark HTTP 200 (log commit'te)
- 0 API/vision çağrısı; sayılar DEĞİŞMEDİ: FULL 27/54, ELEMENT 74/103,
  vision %94.4, korpus %6.7.

## MANDAL LİSTESİ (K6'nın bıraktığı bekçiler)

1. deploy.sh tek-sürüm kontrolü (birden fazla ?v = deploy FAIL)
2. deploy.sh kanıt zinciri (style-lint/header-diff/validate-contract/ctest kapısı)
3. deploy.sh motor guard'ı (kanıtsız motor deploy'u FAIL)
4. deploy.sh worker-URL drift guard'ı (config.js'ten ayrışma FAIL)
5. style-lint em-dash kuralı artık fiilen kapı (ihlal stoku sıfırlandı)

## v1.1 ADAYLARI (bu zincirde açılmadı)

- results snapshot'larının zaman damgalı geçmişi (üzerine-yazma kırılganlığı)
- worker URL inline kopyalarının module-import refactor'ü (guard var, refactor yok)
- KV_NS çift kopyasının tek kaynağa inmesi (wrangler.toml ↔ benchmark-58.mjs)
- araçlardaki (benchmark/mine-vocab) worker URL kopyaları guard kapsamına almak
