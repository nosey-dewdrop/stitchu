# stitchu — akış fix (navbar oynaması + "yükleniyor" hissi)

2026-07-16. Damla şikayeti (Safari, ekran kanıtlı): (1) sayfa geçişinde navbar hâlâ
oynuyor, (2) tıklayınca "sayfa yükleniyor" hissi var, akmıyor. Header markup zaten
bayt-aynı (patch 2.9 / c853371) — oynayan şey markup değildi. İki kök neden bulundu
ve giderildi. **Hiçbir doğruluk sayısı bu yamada oynamaz** — bu kabuk, motor/vision
değil; dataset, engine C++ ve backend'e dokunulmadı.

## Kök neden 1 — navbar yana kayması (scrollbar gutter)

Mekanizma: kısa sayfalarda (closet, create) dikey scrollbar yok, uzunlarda var.
Scrollbar belirince viewport'tan ~15px genişlik çalıyor; tüm sayfa (header dahil)
sola kayıyor. Bir kısa bir uzun sayfa arasında gidip gelince header "oynuyor".

Fix (global `html` kuralı):
```
html { scrollbar-gutter: stable; }
@supports not (scrollbar-gutter: stable) { html { overflow-y: scroll; } }
```
Gutter'ı her sayfada rezerve eder → layout genişliği asla değişmez → kayma yok.
Safari 16+ `scrollbar-gutter`'ı destekler; desteklemeyen eski motorlarda
`overflow-y: scroll` fallback'i scrollbar track'ini hep gösterip aynı sonucu verir.

## Kök neden 2 — "yükleniyor" hissi (akmıyor)

**2a. Cross-document View Transitions zaten aktifti** (`@view-transition { navigation: auto }`
theme-transitions.css'te patch 2.1'den beri var). Eksik olan: header/footer'ın geçişte
"root" ile birlikte cross-fade olması, o yüzden bar yeniden çiziliyordu. Eklenen:
```
.sh-header, body > header { view-transition-name: site-header; }
body > footer           { view-transition-name: site-footer; }
```
Adlandırılan eleman kendi snapshot'ını alır → API onu YERİNDE morph eder, root'la
birlikte redraw etmez. Bar sabit kalır, sadece aradaki içerik kayar. Cross-document
view transition desteklemeyen tarayıcıda (ör. bazı Safari sürümleri) zararsız düşer
— isim sadece etiket, transition olmayınca hiçbir şey yapmaz. İsim benzersizliği
korunur: main sayfalarda `.sh-header` ve `body > header` AYNI elemanı gösterir (tek
isim), pattern sayfalarında sadece `body > header` (düz `<header>`), styles
sayfalarında `.sh-header` — hiçbir dokümanda iki eleman aynı ismi almıyor.

**2b. Ön-getirme (prefetch)** — shared-header.js'e eklendi. Herhangi bir iç linkin
üstüne mouseover / touchstart anında hedef doküman arka planda çekilir:
`<link rel="prefetch" as="document">` (Safari + Chrome onurlandırır) + Chromium için
Speculation-Rules `prerender` ipucu (`HTMLScriptElement.supports('speculationrules')`
gate'li; Safari sessizce yok sayar). Aynı-sayfa anchor, download, dış host ve
görsel/pdf uzantıları atlanır; her URL en çok bir kez ısıtılır. Tıklandığında sayfa
çoğunlukla zaten cache'te → anında geçiş hissi.

**2c. Beyaz flaş — değişiklik GEREKMEDİ (kanıtla doğrulandı).** Her sayfanın en erken
boyanabilir zemini zaten beyaz ve nihai zeminle eşleşiyor: index/create/closet/privacy
inline `body{background:#fff}`, couture gingham zemini `#ffffff` tabanı üstüne soluk
mavi çizgiler (couture.css:7-9), pattern sayfaları inline `body{background:#fff}`.
Beyazdan-koyuya ya da koyudan-beyaza sıçrama yaratacak doygun bir ilk zemin yok →
eklenecek inline mini-CSS gereksiz olurdu (fazla kod = drift riski).

**2d. Font zıplaması yok.** Başlıklar Didot/Bodoni 72/Georgia (sistem serif zinciri),
gövde Helvetica/Arial. Web font indirilmiyor → FOUT/zıplama yok. Değişiklik gereksiz.

## Nereye kondu (katman haritası)

İki evrensel CSS dosyası var, kenarlarda ayrık:
- `theme-transitions.css` → main sayfalar + generated pattern sayfaları yükler.
- `shared-header.css` → main sayfalar + 24 style-library sayfası yükler.

Hiçbir tek dosya TÜM sayfalarda değil, o yüzden aynı kurallar **her ikisine** kondu
(idempotent — main sayfalarda çift yükleme inert, aynı değer/aynı isim). Böylece:
main sayfalar (ikisinden de), pattern sayfaları (theme-transitions'tan), style
sayfaları (shared-header'dan) fix'i alır. Prefetch shared-header.js'te → main + style
sayfalarında çalışır; pattern sayfaları hiç script yüklemeyen SEO leaf'leri, orada
prefetch yok (kabul edilebilir, düşük değer).

## Doğrulama (curl, localhost:8899 python http.server)

- theme-transitions.css?v=66 → `scrollbar-gutter: stable`, `overflow-y: scroll`
  fallback, `site-header`, `site-footer`, `@view-transition navigation: auto` HEPSİ var.
- shared-header.css?v=66 → aynı 4 kural var.
- shared-header.js?v=66 → `prefetchOnIntent`, `rel='prefetch'`, `speculationrules`,
  `mouseover`/`touchstart` listener var. `node --check` PASS.
- Her sayfa tipi v=66'da fix taşıyan bir stylesheet yüklüyor: main=her ikisi,
  pattern=theme-transitions, styles=shared-header. (11 sayfa curl'lendi, hepsi geçti.)
- CSS brace dengesi: theme-transitions 13/13, shared-header 23/23.
- patches.html: tam bir `class="patch now"` (2.10), patch-2-10 servis ediliyor.

## Markup diff teyidi (header hâlâ identical)

`git diff -- web/` içinde header MARKUP'ına ait tek `+/-` satır bir CSS yorumu
(`<header>/<footer>` kelimesini içeren açıklama). Gerçek `<header>/<nav>/brandpatch/
sh-active` satırlarında değişiklik YOK. Tüm HTML diff'i sadece `?v=65→66` / `>v65<→
>v66<` cache-bust bump'ları. Header patch 2.9'a göre bayt-aynı kalıyor.

## Değişen dosyalar

- web/css/theme-transitions.css — scrollbar-gutter + view-transition-name blokları.
- web/css/shared-header.css — aynı bloklar (style-library sayfaları için ayna).
- web/js/shared-header.js — prefetchOnIntent IIFE (hover/touch prefetch + prerender).
- web/patches.html — patch 2.10 girdisi (EN/TR, delta, dürüst "no accuracy number" notu).
- Cache-bust v65→v66 (main) + v62→v66 (pattern) tüm web/ + görünür footer etiketleri.
- engine/tools/gen-pattern-pages.mjs — default V 62→66 (regen'de eşleşsin).

## Canlı teyit

Deploy sonrası his testi Damla'da (headless screenshot yok — Damla dev'de görür).
Dokunmayan: dataset/, engine C++, backend, worker (vision/motor değişmedi, redeploy
gerekmez — bu tümüyle statik kabuk).
