# stitchu — tek evren denetimi (2026-07-16)

Şikayet: "bütün html'ler birbirinden ayrı bir evrene ait gibiler ve bu çok çömez duruyor."
Görev: siteyi tek ürün gibi hissettirmek, her tutarsızlığı kanıtla kapatmak. İçerik yeniden
yazılmadı, tasarım icat edilmedi; sadece kabuk (header/nav/footer/favicon/başlık/toggle) birleştirildi.

7 sayfa: index, create, closet, benchmark, api, patches, privacy.

## ÖNCE matrisi (FAIL işaretli)

| kriter | index | create | closet | benchmark | api | patches | privacy |
|---|---|---|---|---|---|---|---|
| nav link seti aynı | (landing) | FAIL | FAIL | FAIL | FAIL (`.top` bar) | FAIL | FAIL |
| aktif sayfa vurgusu | PASS | FAIL | FAIL | FAIL | FAIL | PASS | FAIL |
| footer aynı (metin+set+vN) | PASS | FAIL (yok) | FAIL (yok) | FAIL | FAIL (tek satır) | PASS | FAIL (yok) |
| favicon aynı (navy dashed) | PASS | PASS | PASS | PASS | FAIL (b6.png) | PASS | PASS |
| title deseni "stitchu · X" | PASS | PASS | PASS | PASS | FAIL (SEO copy) | PASS | PASS |
| EN·TR toggle var | PASS | PASS (JS) | PASS (JS) | PASS | FAIL (yok) | PASS | FAIL (yok) |
| toggle tek localStorage anahtarı | PASS `stitchu:lang` | PASS | PASS | **FAIL `stitchu_lang`** | FAIL | PASS | n/a |
| tema tokenları tek kaynak | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| default EN, TR sızıntısı yok | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| iç link bütünlüğü (404 yok) | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| View Transitions linkli | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| pötikare şerit (beyaz sayfa) | PASS (hero) | n/a | n/a | PASS (band) | PASS (band) | PASS (band) | **FAIL (yok)** |
| viewport meta | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| sürüm etiketi | PASS | FAIL (yok) | FAIL (yok) | PASS | PASS | PASS | FAIL (yok) |
| stitchu.dev yok | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

Toplam FAIL: **21**.

Kök bulgular:
- Her sayfa farklı nav idiomu: index landing topnav; create/closet/privacy app `<header>` (küçük `api`, aktif vurgu yok, footer yok); benchmark/patches `<header>` farklı link setiyle; api tamamen ayrı `.top` bar.
- **Gerçek bug**: benchmark toggle'ı `stitchu_lang` yazıyordu, site geri kalanı `stitchu:lang` — dil seçimi benchmark'tan taşınmıyordu.
- create/closet/privacy footer'ı yoktu; sürüm etiketi yoktu.
- api favicon `b6.png`, title marketing copy, `.top` bar, tek-satır footer — en aykırı sayfa.
- privacy'de pötikare şerit yoktu (kardeş doc sayfalarında var).
- Not: "stitchu.dev" hiçbir yerde yoktu (brief'te varsayılmıştı); vişne/#8f2038 sadece yorumlarda kaldı (zararsız).

## Değişiklikler (kabuk birleştirme, cerrahi)

Kanonik nav (tüm alt sayfalar): mark (home) + create · closet · benchmark · patch notes · API + EN·TR toggle. Aktif sayfa kesikli alt çizgi.
Kanonik footer: `stitchu · a pattern-making engine` | home · benchmark · patch notes · API · privacy · @nosey-dewdrop · vN.
Kanonik favicon: navy dashed SVG her sayfada. Kanonik title: `stitchu · X`.
Kanonik toggle: paylaşılan anahtar `stitchu:lang`, buton id `lang-en`/`lang-tr` (index/benchmark/api/patches/privacy); create/closet i18n.js `mountLangToggle` (LANG_KEY zaten `stitchu:lang`).

- **benchmark.html**: toggle anahtarı `stitchu_lang`→`stitchu:lang`, buton id `en/tr`→`lang-en/lang-tr`, setLang kanonik forma; nav'a create/closet eklendi + benchmark aktif; footer'a benchmark link.
- **api.html**: `.top` bar → kanonik `<header>`; favicon b6.png → navy SVG; title → `stitchu · API`; footer flex + kanonik set; setLang + EN·TR toggle eklendi.
- **create.html / closet.html**: nav `api`→`API`, aktif sayfa vurgusu, kanonik footer + sürüm etiketi eklendi; wordmark çizgisi `#fff`→navy (yeni zeminde görünür).
- **patches.html**: nav'a create/closet eklendi (parça, parallel agent zaten kısmen birleştirmişti); footer'a patch notes self-link; patch 2.6 girdisi.
- **privacy.html**: kanonik footer + sürüm etiketi + EN·TR toggle + setLang eklendi; pötikare signature band eklendi (kardeş doc sayfalarıyla eşleşir); nav `API` düzeltildi.
- **Tümü**: cache-bust tek sürüme çekildi (v61).

Dokunulmayanlar (bilinçli): index landing topnav (giriş sayfası, farklı olması doğru); gingham duvar kağıdı hero-only (Damla'nın patch 2.1 kararı); api gövde metni EN (legal/doc, TR çeviri kapsam dışı); privacy legal gövde EN.

## SONRA matrisi

| kriter | sonuç |
|---|---|
| nav link seti (6 alt sayfa birebir aynı) | PASS |
| aktif sayfa vurgusu | PASS |
| footer aynı | PASS |
| favicon aynı | PASS |
| title deseni | PASS |
| EN·TR toggle her sayfada | PASS |
| toggle tek anahtar `stitchu:lang` | PASS |
| tema tokenları tek kaynak (tokens.css) | PASS |
| default EN, TR sızıntısı 0 | PASS |
| iç link 404 yok | PASS |
| View Transitions | PASS |
| pötikare şerit | PASS |
| sürüm etiketi (v61 her yerde) | PASS |
| yapısal parse (node) | 7/7 PASS |

Toplam FAIL: **0**.

Kanıt (local, deploy öncesi):
- Tüm yerel src/href referansları çözülüyor (0 MISSING).
- 7/7 sayfa node yapı kontrolünden geçti (html/head/body tekil, setLang'in aradığı `lang-en` id mevcut).
- Tüm sayfalar tek `stitchu:lang` anahtarı; benchmark bug'ı kapandı.
- TR sızıntısı grep: 0 (tüm TR metin data-tr veya isTR() koşulunda).
- Sürümler: 7/7 css v61, 7/7 footer v61.

## Canlı teyit
Deploy sonrası gh-pages 6+ sayfa curl 200, nav seti ve `<html lang="en">` default grep ile doğrulandı (aşağıda).
