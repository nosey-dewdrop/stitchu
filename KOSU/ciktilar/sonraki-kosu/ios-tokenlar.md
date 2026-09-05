# iOS zemini — tasarım tokenları ve backend çağrısı

iOS uygulaması web ile **aynı arkaplan ve fontları** kullanacak. Bunun tek yolu
değerleri iki yerde ayrı ayrı yazmamak. Bugünden sonra tek kaynak
`contract/design-tokens.json`; hem `web/css/tokens.css` hem
`App/Stitchu/Tokens.swift` ondan **üretiliyor**.

```
contract/design-tokens.json
        │
        ├── node scripts/gen-design-tokens.mjs          → web/css/tokens.css
        └── node scripts/gen-design-tokens.mjs --swift  → App/Stitchu/Tokens.swift
```

`--check` bayrağı hiçbir şey yazmaz, sadece diskteki dosya contract'ın
çıktısıyla aynı mı diye bakar; kapı (`ctest -R ios_zemin_check`) bunu koşuyor.

**Görünüm değişmedi — kanıt:** üreteç `web/css/tokens.css`'i yeniden yazmadı.
`--stdout` çıktısı 16 Tem reskin'den beri yayında olan dosyayla `diff` altında
**bayt bayt aynı** (1886 bayt), `git status` `web/css/` altında sıfır değişiklik
gösteriyor. Yani "aynı sonucu veriyor" değil, **aynı dosyanın kendisi**.

---

## Token tablosu

| CSS değişkeni | Değer | Swift | Ne için |
|---|---|---|---|
| `--ink` | `#1f3a5f` | `StitchuTokens.Color.ink` | gövde yazısı (beyazda AA) |
| `--paper` | `#ffffff` | `.paper` | zemin |
| `--accent` | `#2f6f7e` | `.accent` | vurgu (petrol) |
| `--gray` | `#5b7089` | `.gray` | ikincil yazı |
| `--faint` | `#cfe0ef` | `.faint` | en soluk çizgi |
| `--bb` | `#8fbfe8` | `.bb` | bebek mavisi |
| `--bb-deep` | `#3f74a8` | `.bbDeep` | okunur mavi (etiket/link) |
| `--bb-pale` | `#dceaf7` | `.bbPale` | soluk dolgu |
| `--bb-line` | `#bcd7ee` | `.bbLine` | çizgi mavisi |
| `--navy` | `#1f3a5f` | `.navy` | lacivert (= ink) |
| `--teal` | `#2f6f7e` | `.teal` | petrol (= accent) |
| `--thread-rose` | `#C4767B` | `.threadRose` | iplik paleti |
| `--thread-ochre` | `#B8963E` | `.threadOchre` | iplik paleti |
| `--thread-olive` | `#7A8450` | `.threadOlive` | iplik paleti |
| `--thread-navy` | `#3E5C76` | `.threadNavy` | iplik paleti |
| `--thread-plum` | `#7E5A75` | `.threadPlum` | iplik paleti |
| `--font` | `"Helvetica Neue", Helvetica, Arial, sans-serif` | `StitchuTokens.Font.ui` | gövde yazısı |
| — | `Helvetica, Arial, sans-serif` | `.uiCompact` | paylaşılan buton/başlık |
| — | `'Didot', 'Bodoni 72', Georgia, serif` | `.display` | marka/başlık serif |
| `--size-hero` | `46px` | `Size.sizeHero` | 46 pt |
| `--size-h2` | `26px` | `Size.sizeH2` | 26 pt |
| `--size-body` | `16px` | `Size.sizeBody` | 16 pt |
| `--size-small` | `14px` | `Size.sizeSmall` | 14 pt |
| `--size-fine` | `13px` | `Size.sizeFine` | 13 pt |
| `--radius` | `2px` | `Size.radius` | keskin köşe tavanı |
| `--space-1..5` | `8/16/24/40/72px` | `Size.space1..space5` | boşluk merdiveni |
| `--measure` | `1060px` | `Size.measure` | metin genişliği |

`--hairline` ve `--seam` (`1px solid/dashed var(--ink)`) bileşik CSS değerleri;
Swift'e sayı olarak taşınmıyor, iOS tarafında `Size.radius` + `Color.ink` ile
kurulur.

## Üretilen Swift (kesit)

`swiftc -parse` ile doğrulandı, 31 sabit:

```swift
// Tokens.swift — GENERATED. Do not edit.
// Source: contract/design-tokens.json
// Regenerate: node scripts/gen-design-tokens.mjs --swift

import CoreGraphics
import SwiftUI

enum StitchuTokens {
    enum Color {
        /// navy body ink (AA on white)
        static let ink = SwiftUI.Color(tokenHex: 0x1F3A5F)
        static let paper = SwiftUI.Color(tokenHex: 0xFFFFFF)
        /// teal/navy accent (was vişne #8f2038)
        static let accent = SwiftUI.Color(tokenHex: 0x2F6F7E)
        ...
    }
    enum Font {
        /// CSS: "Helvetica Neue", Helvetica, Arial, sans-serif
        static let ui: [String] = ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"]
        /// CSS: 'Didot', 'Bodoni 72', Georgia, serif
        static let display: [String] = ["Didot", "Bodoni 72", "Georgia", "serif"]
    }
    enum Size {
        /// CSS --size-body: 16px
        static let sizeBody: CGFloat = 16
        /// CSS --space-3: 24px
        static let space3: CGFloat = 24
        ...
    }
}
```

Font yığını dizi olarak geliyor çünkü CSS'in "sırayla dene" davranışının iOS
karşılığı elle yürütülür: `UIFont(name:size:)` olmayan aileye `nil` döner.

```swift
extension UIFont {
    static func stitchu(_ stack: [String], _ size: CGFloat) -> UIFont {
        for name in stack { if let f = UIFont(name: name, size: size) { return f } }
        return .systemFont(ofSize: size)
    }
}
let body = UIFont.stitchu(StitchuTokens.Font.ui, StitchuTokens.Size.sizeBody)
```

**Xcode uyarısı (yapılmadı, bilerek):** `App/project.yml` XcodeGen ile klasör
tarıyor, ama depodaki `Stitchu.xcodeproj/project.pbxproj` dosyaları tek tek
listeliyor. `Tokens.swift` hedefe girmesi için `xcodegen generate` bir kez
koşmalı. Xcode projesi bu koşuda **açılmadı**, `Theme.swift`'e dokunulmadı.

**Not — `Theme.swift` başka bir dünya:** eldeki iskelet Quicksand + pembe/sage/
lavanta paleti kullanıyor (`Palette.blue #6FB3DE`, `Palette.pink #E8B4B8`); web
tokenları Helvetica + lacivert/bebek mavisi. İkisi **aynı değil**. `Tokens.swift`
kırmadan yanına kondu; hangisinin kazanacağı Damla'nın kararı.

---

## iOS bu backend'i nasıl çağırır?

Sözleşmenin tamamı `backend/API.md`. Üç uç belgeli: `/api/draft`, `/api/grade`,
`/api/analyze`. Kapı her koşuda bu üçünün `worker.js`'te gerçekten
yönlendirildiğini doğruluyor.

**Kritik: uygulama `x-app-token` yolunu kullanmak ZORUNDA.** Public katmanın ilk
kapısı `Origin` beyaz listesi (iki web adresi) ve `Origin` başlığı olmayan istek
reddediliyor (`403 forbidden_origin`) — native `URLSession` o başlığı göndermez.
İkinci kapı Turnstile tarayıcı testi, uygulama çözemez. Token derleme zamanı
gizli dosyadan gelir (`App/Stitchu/Secrets.example.txt` → gitignore'lu
`Secrets.swift`), depoya girmez.

### 1) Fotoğraf/metin → giysi okuması

```
POST /api/analyze
content-type: application/json
x-app-token: <APP_TOKEN>

{"image":"<base64 JPEG, data: öneki yok>","mediaType":"image/jpeg",
 "text":"sweetheart yaka, prenses dikişli, midi A kesim elbise"}
```

`image`, `text` ya da ikisi; en az biri şart. İkisi birlikte gelirse **yazı
fotoğrafı ezer**. Metin tavanı 500 karakter, public katmanda görsel tavanı
2.800.000 bayt.

Cevap Anthropic Messages gövdesinin **aynısı**; okuma ilk metin bloğunun içinde:

```json
{"content":[{"type":"text","text":"{\"garment\":\"dress\",\"neckline\":\"sweetheart\",\"skirtStyle\":\"aLine\",\"length\":\"midi\",\"shaping\":\"princess\", ...}"}],
 "usage":{"input_tokens":1620,"output_tokens":380}}
```

```swift
struct AnalyzeEnvelope: Decodable { struct Block: Decodable { let text: String? }
                                    let content: [Block] }
let env = try JSONDecoder().decode(AnalyzeEnvelope.self, from: data)
guard let raw = env.content.first?.text,
      let s = raw.firstIndex(of: "{"), let e = raw.lastIndex(of: "}") else { throw … }
let reading = try JSONDecoder().decode(VisionReading.self,
                                       from: Data(raw[s...e].utf8))
```

`{`…`}` dilimlemesi web istemcisinin yaptığının aynısı: model başa/sona düz
metin eklerse çözümleme yine tutar.

`429` iki farklı şey demek ve iki farklı cümle ister: gövdedeki `error`
`analysis_paused` ise günlük cüzdan kapandı (birazdan tekrar denemek işe
yaramaz), değilse dakikalık sigorta ("biraz yavaş").

### 2) Okuma → kalıp

`analyze` alanları `draft` sözlüğüne birebir değil: `length` → `skirtLength`,
`hemRuffle` → `ruffle`, `keyhole` true/false → `"keyhole"`/`"none"`,
`garment:"other"` çizilemez.

```
POST /api/draft
content-type: application/json
x-app-token: <APP_TOKEN>

{"spec":{"garment":"dress","neckline":"sweetheart","shaping":"princess",
         "skirtStyle":"aLine","skirtLength":"midi"},
 "measurements":{"bust":92,"waist":74,"hip":98,"shoulder":39,
                 "backLength":42,"armLength":58,"neck":36}}
```

Cevap: `pattern.pieces[]` — her parça `commands` (dikiş çizgisi), `cutLine`
(dışa `seamAllowance` kadar ötelenmiş kesim çizgisi), `markings`, `grainline`,
`cutInstruction`. **Koordinat birimi milimetre**, y aşağı büyür, eğri komutları
düz anahtarlı (`x`,`y`,`cp1x`,`cp1y`,`cp2x`,`cp2y`). 1 mm = 1 birim çizilirse
gerçek ölçekli kalıp çıkar; `CGAffineTransform(scaleX: 72/25.4, y: 72/25.4)` ile
1:1 PDF olur.

`422 undraftable` bir **özellik**: dikilemeyecek beden/spec bileşimi
`reasons[]` ile reddedilir, bozuk kalıp gönderilmez — uygulamada bu listeyi
olduğu gibi göstermek doğru davranış.

### 3) Beden seti (satıcı çıktısı)

`POST /api/grade` — `spec` + `from`/`to` (EU34…EU52), cevapta her beden için
`draft`. `issues` dolu olan bedenler atılır.

---

## Kapı

`engine/tests/ios_zemin_check.mjs` (ctest: `ios_zemin_check`) beş şeyi ölçer:

1. `web/css/tokens.css` contract'ın çıktısıyla bayt bayt aynı,
2. `App/Stitchu/Tokens.swift` contract'ın çıktısı **ve** `swiftc -parse` geçiyor
   (swiftc yoksa yapısal kontrol + açık "ATLANDI" satırı — sessiz geçiş yok),
3. `web/css` içinde ilansız elle yazılmış renk yok; ilan edilenler
   `contract.legacy.colors`'ta gerekçeli, dosya başına sayı **çırçır** (yükselemez),
4. ilansız `font-family` yığını yok (izinli üç yığın contract'ta),
5. `API.md` ↔ `worker.js`: belgelenen her uç var, worker'daki her `/api/` ucu ya
   belgeli ya `contract.api.undocumented`'ta.

Kapı sahiden ısırıyor — üç ayrı kurcalama denendi ve üçü de kırmızı verdi:
`studio.css`'e `#123456` eklemek (2 FAIL: ilansız renk + tavan aşımı),
`--accent`'i `#2f6f7f` yapmak (bayt sapması), `API.md`'ye olmayan
`/api/hayalet` başlığı eklemek. Üçü de geri alındı.

## Bu koşuda çıkan yan bulgular

- `/api/analyze` **hiç belgeli değildi** — API.md sadece `draft` ve `grade`
  anlatıyordu. Uygulamanın ilk çağıracağı uç buydu. Kapı bunu ilk koşuda
  yakaladı; bölüm koda bakılarak yazıldı.
- `app.css` hâlâ **vişne kalıntısı** taşıyor: `#8f2038` (`.print-cuttable
  td:first-child`) ve `rgba(143,32,56,.03/.05)`. 16 Tem reskin'i baskı
  şablonunu atlamış. Silinmedi (görünüm değiştirmemek için), gerekçesiyle ilan
  edildi.
- `/api/analyze` iki farklı hata gövdesi şekli döndürüyor (`{error,detail}` ve
  düz cümle). İstemci ikisini de karşılamak zorunda; API.md artık bunu yazıyor.
- `web/css`'te tokenleştirilmeyi bekleyen üç tekrar eden değer: `#2b4f7a`
  (lacivert hover, 3 dosya), `#9db8d6` (kesikli çerçeve mavisi), `#fbfaf6`
  (lacivert dolgu üstündeki sıcak beyaz). Üçü de contract'ta aday olarak yazılı.
