# K2 — KOMPOZİSYON RESMİLEŞTİRME raporu (2026-07-19, patch 3.22)

Kapanış zincirinin K2 rayı. İş listesi K0 envanterinin K2 maddeleri (8-9) + zincir dosyasının K2 bölümü; envanter dışı iş açılmadı, YENİ bileşen/enum/çizim yeteneği eklenmedi (A1).

## Ne kuruldu

**contract/composition.json (v1.0.0).** Mevcut her çizilebilir bileşen için tek kayıt:
- **21 bileşen** (19 dispatcher post-pass + 3 taban ailesi: halter çerçevesi, sleeveCap, edgeFinish) — her birine attachment point, z-order (garment.cpp post-pass sırası 1-19), çakışma sınıfı (cfZone / neckZone / backZone / shoulderZone / waistZone / hemZone / sleeveZone / sideSeam / surface) ve dosya:satır kanıtı.
- **Flat motoru z-order beyanı:** _engine-full.mjs render() çizim sırası 11 katman olarak resmileşti (kol EN ALTA — gövde üstüne biner; yaka gövde VE yaka çizgisinin ÜSTÜNE — "bebe yaka en üstte, orta dikişi örter" elle kuralı artık beyan; fiyonk en üstte). Flat part bayrakları styles.json'dan.
- **Çakışma matrisi:** 5 sınıf — `allowed` (çizer, validator temiz), `excluded` (spec sınırında isimli hatayla RED, specparse), `validator` (çizer ama PatternValidator isimli issue ile BLOKE eder, PDF verilmez — görünür dürüst red kanalı), `honest` (blok kendini atlar ve rehberde söyler: "skipped —"), `ignored` (alan bu host'ta anlamsız, motor BELGELİ TASARIMLA sessiz yutar — SADECE halter × {dropped, raglan, facing} üçlüsü + feature==host özdeşliği; başka her sessiz no-op test FAIL'idir). Matris: **74 host kuralı + 58 çift kuralı + defaultClass allowed.**

**MANDAL 1 — compose_check (yeni ctest).** Matrisi OKUMAZ, YENİDEN TÜRETİR: 8 kanonik host × 31 bileşen-değeri = 248 tekil + 465 çift, her biri GERÇEKTEN çizdirilerek sınıflandırılır (refused / validator-issue / honest-note / silent / allowed) ve beyan edilen sınıfla karşılaştırılır. Beyan edilmemiş her sessiz no-op ve her iki yönde sınıf kayması FAIL. Matris verisi gen-contract.mjs'in yeni çıktısı engine/src/composition.gen.hpp'den gelir (gen-contract --check drift bekçisi bu dosyayı da kapsar — K1 mandalı otomatik genişledi). Golden çakışma seti = composition.json'ın kendisi (pin).

**MİKRO-LOOP 1 (davranış değiştiren tek fark, ≤2 sınırı içinde).** Kod taraması + probe 20 sessiz dispatcher no-op'u buldu: garment.cpp host gate'leri alanı SESSIZCE düşürüyordu (skirt × {keyhole, placket, collar, gather, backOpening, ruffledStraps, peplum, bardot, buttonRow, backDetail, shoulderStyle, edgeFinish} · top × {backSlit, ruffleHem} · gathered/pleated/halfCircle × {backSlit, hemShape}). Motorun kendi doktrini zaten specparse.hpp'de yazılıydı ("an incoherent spec is an error, never a silent no-op") — validateSpecCross bu kombinasyonları da isimli hatayla reddedecek şekilde genişletildi. Web picker'ları bu kombinasyonların hepsini zaten gizleyip sıfırlıyor (create.js rebuild), vision köprüsü gate'li; değişikliği yalnız ham API çağıranlar görür. KANIT: benchmark reclassify önce/sonra AYNI (aşağıda), web-fuzz aynı (26260 draft, aynı 3 bilinen failure), golden byte-identical.

**MANDAL 2 — render-lint (flat tarafı, K0 4.1 kapandı).** engine/tools/render-lint.mjs: styles.json'daki HER stil headless render edilip (a) NaN/Infinity, (b) sıfır-alan kapalı halka, (c) yapısal hatların (body/piece/tie) self-intersection'ı, (d) ters normal (aynı path içinde zıt yönlü halka), (e) **sampleX y-monotonluk assert'i** (render'ın sampleX'e verdiği gerçek geometri, gerçekten sorgulanan shirr bandında, sampleX'in kendi 0.5px toleransıyla) taranır. Deploy zincirine kancası: style-lint.mjs'in SONUNA zincirlendi (mevcut "style-lint temiz" kanıt adımı artık flat lint'i de koşar) + ayrı ctest `flat_render_lint`. _engine-full.mjs export'lanabilir yapıldı; CLI çıktısı 4 stil için cmp ile BAYT-AYNI kanıtlı.

**K0 4.7 kapandı (dürüst beyan yolu).** web-fuzz.js packer aynası sheet.js'i süremiyor (?v-son ekli ESM importlar Node'da çözülmüyor); sınır artık dosyanın başında ve SUMMARY çıktısında BEYANLI: ayna = shelf taban çizgisi; canlı packPieces yarışı sayfa sayısında asla daha kötü olamaz (A4 loop invariantı), skyline/rotasyon yerleşimlerinin bekçisi register-continuity.mjs.

## Beyan-kod çelişkileri (kod kazandı, hepsi kayıtlı)

1. **20 sessiz dispatcher no-op** — garment.cpp yorumları bazılarını "gated out here / skips honestly" diye anlatıyordu ama gate bloğun dürüst notunu hiç çalıştırmıyordu (örn. gathered etek × vent: SlitBlock dürüst atlardı, gate ona hiç ulaştırmıyordu). Mikro-loop 1 ile kapatıldı (yukarıda).
2. **Flat şeması çizmediği bayrakları beyan ediyor** — styles.json `straps`, `ruffledStraps`, `gatherWaist` bayraklarını taşıyor, contract flat.* şeması tanıyor, AMA render() bu bayrakları HİÇ okumuyor (set etmek hiçbir şey çizmiyor). composition.json `flatComponents.declaredButNotDrawn` olarak kayıtlı; davranış değiştirilmedi. v1.1 adayı.
3. **Motor, köprünün asla üretmediği kombinasyonları çiziyor** — halter × {keyhole, collar, placket, buttonRow, bardot, gather...} create.js'te gizli ama motor seviyesinde ÇİZİLİYOR (halter + bebe yaka 6 parça validator-temiz çıktı). Matris bunları allowed beyan eder (mevcut davranış); Kate Middleton sorusu v1.1'e not.
4. **Tekil bileşenler bazı host'larda validator-BLOKE çıkıyor (gerçek kusurlar, matris dürüstçe beyan etti, düzeltmek kapsam dışı — PARK):**
   - top × bardot: "hem extension did not apply" (2 issue) — bardot bir TOP'ta bugün fiilen çizilip bloke oluyor; create.js bu kombinasyonu sunuyor, kullanıcı draft'ta hata görür.
   - skirt × tie (3 varyant): etek beli + waistband 161-190mm tutarsız — TieBlock'un skirt üstünde yan etkisi.
   - top × placket.asymmetric: sideseam 31mm ayrışması; top/top.cropped × hemShape.highLow: sideseam/marking issue.
   - dress(kolsuz) × shoulder.dropped: rehber adımı olmayan kol parçasına referans veriyor (guideCoverage) — dropped omuz kolsuz host'ta bloke.
   - halter × backDetail.cape ve bardot × backDetail.cape: pelerin eğrisi kink (25° üstü dönüş).
   - keyhole × CF bileşenleri (pussyBow, placket ×2, tie ×2, collar, gather, ruffledStraps, bardot, buttonRow ×2): "keyhole stitch line is not a CF teardrop" — CF bölgesi n-kare çatışmasının ta kendisi; validator hepsini yakalıyor (bloke), matris resmileştirdi.
5. **Flat'te 2 kozmetik self-intersection** (canlı SVG'lerde bugün de var, K1'den beri bayt-aynı): lace_vneck_70s puf kol dış hattı (ön+arka, seg 7×21) ve peterpan_puff yaka halkası (seg 165×176). render-lint.allow.json'a PİNLİ (yeni bulgu pinlenemez, FAIL olur); v1.1 düzeltme adayı.

## Sayılar (A7: düşüş yok, hepsi öncekiyle birebir — kanıt: 0-çağrı cache reclassify önce/sonra)

| metrik | K1 (yayında) | K2 sonrası |
|---|---|---|
| FULL 0.9 kanıtlı | 27/54 (PARTIAL 10) | **27/54 (PARTIAL 10)** |
| FULL eski yöntem | 37/54 | 37/54 |
| ELEMENT ACCURACY | 74/103 (%71.8) | 74/103 (%71.8) |
| vision-accuracy | %94.4 | %94.4 |
| korpus kapsamı | %6.7 (342/5092) | %6.7 (342/5092) |
| sızıntı taraması | 0 unmapped | 0 unmapped |

Mikro-loop 1'in refuse'ları hiçbir benchmark hükmünü oynatmadı çünkü 0.9 draft-proof köprüsü bu alanları zaten host-gate'li kuruyor.

## Kanıt seti (A4)

- ctest **43/43** (41 + yeni compose_check + yeni flat_render_lint); K4 rebase SONRASI birleşik ağaçta yeniden koşuldu: ctest **44/44** (sloper_check dahil), golden yine pristine-cmp byte-identical, vocab-sweep 48600/0, web-fuzz 26260/3, benchmark 27/54 aynı, iki wasm birleşik kaynaktan yeniden derlendi (bayt-aynı çıktı).
- golden: pristine origin/main ayrı worktree'de derlendi, golden_dump 23406 satır == 23406, **cmp byte-identical**.
- vocab-sweep **48600 draft / 0 fail**. web-fuzz **26260 draft / 3 FAILURE** (README'de kayıtlı bilinen 100-sayfa packing defekti, K1'de de 3).
- iki wasm derlendi (motor değişti): browser build engine/dist == web/vendor md5-aynı; worker wasm backend/engine'e kopyalandı. (Not: worker DEPLOY edilmedi — K1'deki gibi davranışsız fark değil, bu kez motor değişti; bir sonraki wrangler deploy'da gider, canlı /api/draft o zamana dek eski refusal setiyle çalışır. SONRADAN BULUNDU listesine yazıldı.)
- flat: 4 stilin CLI SVG'si eski motorla **cmp bayt-aynı** (refactor kanıtı).
- render gözle: render-pages.mjs 22 çizim 0 issue; highlow-dress strip PNG (resvg) GÖZLE bakıldı — 8 parça, register kareleri + sayfa kodları (A1-S1), kesim+dikiş çizgileri, sayfa sınırında kopuş yok.
- style-lint 81 sayfa + 7 css temiz **+ zincirli render-lint yeşil**; header-diff 52 sayfa temiz.
- benchmark: 0-çağrı cache reclassify (canlı çağrı YOK; kanıt: koşu çıktısında 0 curl, tüm 59 kayıt cache'ten).

## PARK / SONRADAN BULUNDU

- PARK (A1/A3, matris beyan etti ama düzeltmedi): top × bardot hem-extension kusuru; skirt × tie bel tutarsızlığı; dress(kolsuz) × dropped guideCoverage; backDetail cape kink (halter/bardot ile); keyhole × CF ailesi çatışmalarının ÇİZİLEREK çözülmesi (bugün validator-bloke, doğru dürüst davranış); flat'in çizmediği straps/ruffledStraps/gatherWaist bayraklarının ya çizilmesi ya şemadan düşmesi; 2 pinli flat self-intersection.
- SONRADAN BULUNDU (v1.1 adayı): worker wasm deploy bekliyor (yukarıda); benchmark mapVisionSpec "web ile aynı köprü" der ama create.js rebuild()'in gizli-picker sıfırlamasını uygulamıyor — bugün fark üretmiyor (host-gate'ler örtüşüyor), yine de beyan farkı.
- ÇEVRE NOTU (repo işi değil): /tmp altındaki worktree'lerde Node, /tmp/package.json ("type":"commonjs") yüzünden web/js ESM import'larını bozuyor; ana repo yolunda sorun yok. Ölçümler için lokal-untracked web/js marker kullanıldı, commit edilmedi.

## Kapanan K0 satırları

4.1 KAPANDI (flat-engine lint'siz → render-lint + ctest + style-lint zinciri) · 4.7 KAPANDI (web-fuzz aynası: sınır dürüstçe beyan edildi, PAGES üst-sınır garantisi yazıldı; gerçek sheet.js sürme yolu ESM/?v engeli nedeniyle PARK).
