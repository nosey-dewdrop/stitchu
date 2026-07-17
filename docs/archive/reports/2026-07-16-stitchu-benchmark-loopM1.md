# stitchu — FAZ M / LOOP M1: BACK HEM SLIT / WALKING VENT (patch 3.0)

> İlk FAZ M motor dalı. K2 köprü denetimi (reports/2026-07-16-stitchu-k2-kopru-
> denetimi.md) marjinal-kazanç/maliyet sırasında back-hem-slit'i **1. sıra, EN
> UCUZ +2** koydu (tek-terimli 2 foto = Laura ×2; keyhole/open-back post-pass
> desenine birebir; golden opt-in, düşük risk). Bu loop onu yazdı.

## SONUÇ (ölçülü, uydurma yok)
- **FULL PATTERN: 24 → 26/54 (+2)** — tam olarak Laura ×2 (cover + flat sketch),
  ikisi de manifest'te tek oov terimi "back hem slit". Cache reclassify, **0 vision
  çağrısı, kredi harcanmadı** (motor loop'u, DRAWN_SINCE'e yeni kural eklendi).
- **ELEMENT ACCURACY: 53 → 55/103 (%51.5 → %53.4, +2)**.
- vision-accuracy 94.4% DEĞİŞMEDİ (doğru — bu motor loop'u, vision'a dokunulmadı).
- **golden BYTE-IDENTICAL: 0.000000 mm / 23034 satır** (backSlit off default).
- **ctest 18/18** (yeni slit_check), **web-fuzz 19960/0**, **vocab-sweep 37800/0**.

Neden tam +2, fazla değil: K2 tablosu back-hem-slit'i SOLO +2 (tek-terimli 2 foto)
diye işaretlemişti; başka hiçbir fotoda "back slit" tek eksik değil. Ölçüm tahmini
BİREBİR doğruladı — iki Laura fotoğrafı MISSING→FULL, başka foto oynamadı.

## NE YAPILDI

### Araştırma (Aldrich/Armstrong + vent tutorial'ları)
Yürüme yırtmacı bir DİKİŞTEKİ açıklıktır, arka orta dikişte oturur. Kurallar:
- **Konum:** arka orta (CB) dikiş; oturan düz/kalem etek gerektirir (büzgülü/kloş
  eteğin yürüme payı zaten var, yırtmaca gerek yok).
- **Boy:** etek ucundan yukarı ~"hem to just above the knee", tipik 15 cm (6 in);
  motor `[100, 350] mm` clamp, default 180 mm; oturak/kalça hattını `seatClearance
  = 60 mm` geçmez (yırtmaç kalça üstünde açılmaz).
- **Extension (kanat, underlap/overlap):** ~1.5 in (40 mm), dikişe paralel, 45°
  üst köşe; iki arka üst üste kapanır (klasik terzi vent).
- **Üst nokta + bar tack:** dikiş nerede durup açıklık nerede başlıyor — en çok
  atlanan vent detayı; yatay bar-tack işareti.
FORMULAS.md "Back hem slit / walking vent" bölümü yazıldı.

### C++ motor (slit.hpp / slit.cpp, opt-in post-pass)
- `HemSlit { None, Vent, Slit }` enum, `GarmentSpec.backSlit` (int; 0 = None).
- garment.cpp'de open-back bloğundan SONRA post-pass; sadece Skirt/Dress + straight/
  A-line skirtStyle gate'i. None default → mevcut her draft byte-identical.
- `SlitBlock::apply`:
  1. Arka parçayı bulur ("Skirt Center Back"/"Skirt Back"/"Center Back"/"Back"),
     `hostsVent` ile büzgülü/pileli DİKDÖRTGEN paneli REDDEDER (outline'da eğri yok
     + bel genişliği = etek ucu genişliği → dikdörtgen → dürüst atlama notu).
  2. Cut note'u `cut 2 (center back seam, leave open below the slit mark)` yapar.
  3. Üst-nokta bar tack markası (x=0'da yatay çizgi).
  4. VENT ise: kanat GERÇEK KUMAŞ olduğu için placket'in grown-on stand'i gibi
     OUTLINE'a girer — arka CB kenarı (son line, hem→waist) yeniden kurulur:
     hem'de x=−40'a çıkar, extension kenarını çıkar, 45° köşeyle üst-noktaya döner,
     CB dikişini bele kadar sürer. Fold çizgisi (x=0) markadır. SLIT ise: outline'a
     dokunmaz, sadece cut note + bar tack.
  5. Dürüst atlama: kısa etek (available < minHeight) veya CB seam adayı yok →
     `guideSteps`'e dürüst not, `return false` (sessiz no-op ASLA).
- **TRUING:** kanat genişliği = CB dikişinin `ventExtension` dışa offset'i → her
  y'de tam 40.00 mm (slit_check ölçer, drift edemez). Üst-nokta y = `hemY − height`
  parçanın KENDİ hem'inden (en derin CB noktası) ölçülü → bar tack + dikiş-durak +
  kanat üst köşesi tek ölçülü y'yi paylaşır.

### Test (slit_check.cpp, ctest 18/18)
Doğrular: (1) yırtmaç EKSTRA parça eklemez (grown-on/marked), (2) her NON-back
parça outline byte-identical, (3) plain slit'te arka outline de dokunulmaz,
(4) cut note CB seam oldu, (5) bar tack hemY−height'ta CB'de başlar, (6) rise
`[minHeight,maxHeight]` içinde, (7) VENT: kanat 40.00 mm truing + 45° köşe
(−ext, topY+ext), (8) SLIT: hiç kanat yok, (9) büzgülü arkada gate byte-identical
+ direct call REDDEDER + dürüst not ekler, (10) tie-back + open-back + hem slit
AYNI dresste coexist (üçü de var, geçerli). Straight-dart dress, A-line princess
dress (Center Back gore), standalone skirt hepsinde geçer.

### Köprü (L2/L3, cerrahi)
- **engine.js:** `HEM_SLIT` map + `backSlitValue`, draftJSON + gradeJSON çağrılarına
  son param.
- **wasm/bindings.cpp:** buildSpec + draftJSON + gradeJSON'a `backSlit` (sona
  eklendi, embind trailing arg 0 default → mevcut çağrılar geçerli kalır).
- **backend/draft.js:** ENUMS whitelist `backSlit`, `HEM_SLIT`/`backSlitInt`, spec
  normalize default, iki wasm çağrısına param.
- **create.js:** manuel picker (straight/aLine gate), `pickHemSlit(seen)` (oov
  terim → vent/slit, front/side hariç), spec default, `seen.hemSlitDrawn`.
- **missing.js:** `hemSlitDrawn` iken back/hem/walking slit oov suppression;
  FRONT/SIDE slit honest kalır.
- **İki wasm yeniden derlendi** (build-wasm.sh'e slit.cpp eklendi):
  web/vendor/stitchu-engine.js + backend/engine/stitchu-worker.{js,wasm}.

### Vitrin (patch 3.0)
- **web/patches.html:** patch 3.0 girdisi ("now"), EN/TR, delta rozeti (flat),
  dürüst not, DESIGN-RULES uyumlu (pill yok, yan çizgi yok, em dash yok, başlık
  noktalı). 2.12 "now"→normal demote.
- **web/index.html:** galeri sayacı 22 → 26 (ölçülü gerçek değer).
- **style-lint temiz** (44 sayfa + 7 css, 0 ihlal).

## DÜRÜST SINIRLAR (çizilmeyen, honest kalan)
- FRONT / SIDE yırtmaç çizilmez (sadece arka orta yürüme yırtmacı).
- Büzgülü/pileli/yarım-kloş etek: yürüme payı zaten var, atlanır (dürüst not).
- Astarlı vent astar drafting'i (lining vent) çizilmez — kabuk kumaş vent'i çizilir,
  astar honest.

## SIRADAKİ (K2 kuyruğu, marjinal-kazanç/maliyet)
K2 sırası: back-hem-slit(bitti +2) → peplum (+2) → ruffled-straps (+2) →
[asymmetric-placket + cap-sleeve KOMBO +6] → [double-breasted+yoke+box-pleats +3].
Sıradaki EN UCUZ: **peplum** (tek-terimli 2 foto: Cloe, Serene pointed) veya
**ruffled-straps** (Priscilla ×2, köprü deliği #23'ü de kapatır).

## DEPLOY NOTU
Worker VISION prompt/şeması DEĞİŞMEDİ → /api/analyze redeploy GEREKMEZ. /api/draft
+ /api/grade worker-wasm backSlit destekli yeniden derlendi (backend/engine/); canlı
/api/draft'ı kullanmak isteyen için wrangler redeploy gerekir ama ürün foto→pattern
akışı tarayıcı wasm'ini kullanır (bu commit'te güncel). Web değişikliği (index sayaç +
patches 3.0) gh-pages deploy ister (?v bump + subtree split).
