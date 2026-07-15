# stitchu BENCHMARK-58 — Loop 9b (open-back cutout)

2026-07-16. Agent: BENCHMARK-58 kuyruğu Loop 9b. Bağımsız context.

## Sonuç
- **FULL PATTERN: 19/54 → 22/54 (+3).** Jana (low open back) + Tie Back ×2 (cover, front worn).
- **ELEMENT ACCURACY: 48/103 → 53/103 (%46.6 → %51.5, +5).**
- Kuyruk marjinal **+4** demişti; gerçek **+3** — dürüst fark aşağıda.
- Deploy **v58**. Worker VISION DEĞİŞMEDİ (redeploy yalnız /api/draft için; ürün akışı tarayıcı wasm'ı kullanıyor).

## Ne yapıldı — motor
Motor artık SIRT parçasında şekilli açık-sırt oyuğu + facing çiziyor.

- **OpenBackBlock::apply** keyhole-tarzı opt-in post-pass (openback.hpp/.cpp), garment.cpp'de gather bloğundan sonra. `BackOpening { None, RoundCutout, LowV, Square, Keyhole }`, default None → golden BYTE-IDENTICAL.
- **Anatomi (Aldrich/Armstrong + couture/high-street backless):** oyuk boyun deliğinden değil, nape'ten `gapBelowNape = 40 mm` aşağı başlar (omuzda yoke kumaş giysiyi asar); `waistClearance = 55 mm`; boy `[55, 320] mm` clamp. Half-width/boy oranı şekle göre: round 0.42, low-V 0.34, square 0.36, keyhole 0.24.
- **Kat mantığı:** oyuk CB fold'a (x=0) karşı YARIM çizilir; sırt parçası CB dikişiyle "cut 2" → yarım, dikişte aynalanıp tam simetrik oyuğa açılır (keyhole ile aynı on-fold kuralı).
- **Facing + TRUING:** solid facing (cut 1 on fold, interface) = oyuk silhouette'i `facingMargin = 34 mm` dışa offset. Facing AYNI oyuk çizgisini MARKING olarak taşır; o çizgi sırta çizilen oyukla BYTE-IDENTICAL → truing 0.00 mm (backopen_check). Facing seamAllowance = 0 (marked line'da dikilir, yarılır, çevrilir). İnşa adımları boyun facing understitch'inden hemen sonra eklenir (keyhole ile aynı slot).
- **Loop 4b tie-back ile ÇAKIŞMAZ:** Tie Back Mini Dress'te hem bağ (TieBlock) hem oyuk (OpenBackBlock) var — bağımsız enum + bağımsız post-pass, ikisi aynı drafta çıkar. Render'da teyit: "Waist Tie (bel bağı)" + "Open Back Facing (low-V)" birlikte.
- **Dürüst sınır:** yan dikiş cebi / başka undrawn detay kümeliyse o hâlâ listelenir (missing.js); sadece open-back'in kendisi suppress edilir. Laced back / back button placket honest kalır.

## Ne yapıldı — web/wiring
- **create.js:** `pickBackOpening(seen)` vision→spec (backDetail openBack + oov open-back/backless/back-cutout/low-open-back → şekil; keyhole/square/low-V descriptor'ları silhouette seçer, else round). Manuel "açık sırt" şekil picker (declarative pickers dizisi). `seen.backOpeningDrawn`.
- **missing.js:** openBack/keyholeBack/vBack backDetail + oov open-back terim suppression `backOpeningDrawn` iken; tie-back/laced honest kalır.
- **engine.js / backend/draft.js / wasm/bindings.cpp:** int `backOpening` param eklendi (BackOpening enum; ENUMS whitelist'e backOpening eklendi). İki wasm hedefi (browser SINGLE_FILE + Cloudflare worker) yeniden derlendi (build-wasm.sh'e src/openback.cpp eklendi).
- **FORMULAS.md:** "Open-back cutout" başlığı.

## Kanıt
- **golden byte-identity:** 23034 satır, diff temiz (backOpening=None default).
- **truing 0.00 mm:** backopen_check facing oyuk çizgisi = back oyuk çizgisi byte-identical.
- **ctest:** 17/17 yeşil (yeni backopen_check: 1 fazla facing parça, mevcut outline byte-identical, truing 0.00mm, facing solid oyuktan geniş, 4 şekil çizer, tie-back+open-back coexist).
- **web-fuzz:** 19780 draft / 0 FAILURES (backOpen sweep 4 şekil × 2 garment × bodies dahil; +40 draft).
- **vocab-sweep:** 37800 / 0.
- **çok-body validator sweep:** 160 open-back draft (4 body × 2 garment × 5 neckline × 4 şekil) → 0 validator issue, 160 facing çizildi.
- **render-pages:** openback-round-dress + openback-lowv-tieback-dress strip'te oyuk+facing çizili; görsel SVG teyit (vişne yarım-oval oyuk CB fold'a yaslı; facing D-shape offset, oyuk çizgisi içeride).
- **CANLI sayı:** 0-çağrı cache reclassify, kredi harcanmadı (cache güncel, sadece DRAWN_SINCE loop-9b verdict'i oynadı). benchmark-58.mjs DRAWN_SINCE'e loop-9b kuralı: open-back/back-cutout/backless/low-open-back çizer, tie-back CLOSURE'ı DIŞLAR (Loop 4b kuralı bozulmadı; ayrı oov terim, ayrı kural).

## Kuyruk +4 dedi, gerçek +3 — DÜRÜST fark
Beş open-back fotosu (offline teşhis teyit etti +4: Jana + Tie Back ×3):
| Foto | oov | Sonuç | Neden |
|------|-----|-------|-------|
| Jana Dress | low open back | **FULL** | tek eksik oyuktu, çizildi |
| Tie Back (cover) | open-back circular cutout + tie-back | **FULL** | oyuk çizildi, bağ Loop 4b'de zaten çizili |
| Tie Back (front worn) | open-back circular cutout + tie-back | **FULL** | aynı |
| Tie Back (polka, back view) | open-back circular cutout + tie-back | **WRONG** | cached vision neckline="halter" okumuş (manifest boat/crew bekliyor); oyuk+bağ ÇİZİLİ, oov temizlendi, ama neckline field FULL'u bloke ediyor → VISION VARYANSI, motor değil |
| Arielle Dress | side-seam pockets + open back + halter tie | **MISSING** | pockets çizilemez → kümelenmiş, oyuk çizildi ama cep eksik |

Yani +4'ün 3'ü geldi; kaçan +1 = üçüncü Tie Back fotosunun cached vision yaka varyansı (motorun oyuk kabiliyeti orada, geometrik olarak o foto da FULL-hazır). Arielle önceden bilinen kümelenme (+0). Tahmin bir tavandır; ölçüm gerçektir; aradaki fark saklanmıyor.

## Sırada
Loop 9c (peplum + hem slit, marjinal +2+2) ya da Loop 9 (DENETİM B). Hazır.
