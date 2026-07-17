# Sitewide polish log — 2026-07-17

One coherent pass across every user-facing page: Title Case, spelling/punctuation,
no purple links, hero + guestbook layout, SEO. Cache-bust bumped to v80 everywhere.

Verification tools both green at the end:
- `node engine/tools/style-lint.mjs` → clean (54 pages + 7 css, 0 violations)
- `node engine/tools/header-diff.mjs` → header identical across 47 pages

---

## 1. Title Case (nav, footer, buttons, headings, card titles)

Applied to BOTH `data-en` AND `data-tr` (Turkish Title Case per Turkish rules).

### Nav + footer labels (all 47 header pages + generators)
| was (EN) | now (EN) | was (TR) | now (TR) |
|---|---|---|---|
| create | Create | çiz | Çiz |
| closet | Closet | dolap | Dolap |
| patterns | Patterns | kalıplar | Kalıplar |
| blog | Blog | günlük | Günlük |
| benchmark | Benchmark | kıyaslama | Kıyaslama |
| patch notes | **Patch Notes** | yama notları | Yama Notları |
| home | Home | ana sayfa | Ana Sayfa |
| privacy | Privacy | gizlilik | Gizlilik |
| showcase | Showcase | vitrin | Vitrin |
| style library | Style Library | stil kütüphanesi | Stil Kütüphanesi |

### Button / CTA labels
| was | now |
|---|---|
| Join the beta | **Join the Beta** |
| Beta'ya katıl | Beta'ya Katıl |
| Become a beta partner | Become a Beta Partner |
| Beta ortağı ol | Beta Ortağı Ol |
| See the full benchmark → | See the Full Benchmark → |
| Tüm kıyaslamayı gör → | Tüm Kıyaslamayı Gör → |
| Draft a pattern free → | Draft a Pattern Free → |
| Ücretsiz kalıp çiz → | Ücretsiz Kalıp Çiz → |

Left in sentence case ON PURPOSE (full-sentence sub-link, per the brief):
- "or draft a pattern free →" / "ya da ücretsiz kalıp çiz →"
- Brand tagline "stitchu · a pattern-making engine" and handle "@nosey-dewdrop".

### Pages touched for Title Case
- 9 hand-written main pages: index, create, closet, benchmark, patches, api,
  privacy, showcase, collection-60s70s.
- 24 style-library pages (styles/*.html).
- 13 pattern pages (patterns/*.html).
- 7 guide pages (guide/*.html).
- 1 blog page (blog/index.html).
- **5 generators** updated identically so a future regen produces Title Case and
  does not silently revert the hand edits (DESIGN-RULES rule 8):
  gen-blog, gen-style-pages, gen-pattern-pages, gen-guide, gen-vintage-page.

### Scoping care (prose left alone)
The transform only rewrote anchors carrying BOTH `data-en` + `data-tr` labels.
Two honest-copy PROSE sentences on the blog that contain "benchmark"/"patch notes"
links were caught and reverted to lowercase (blog/index.html line 97 and the
gen-blog.mjs source), so the sentence still reads "...tracked openly in the
benchmark and the patch notes." Style-library prose links like
`<a href="../patches.html">patch notes</a>` (no data-en) were never touched.

### header-diff normalizer updated
`engine/tools/header-diff.mjs` normalizes the patterns/blog link tokens by
matching `data-en="patterns"` / `data-en="blog"`. Those were bumped to
`data-en="Patterns"` / `data-en="Blog"` so the byte-compare stays green.

---

## 2. Spelling & punctuation (EN + TR)

Audited every visible string on all 10 primary pages. Result: essentially clean.
- **No em dashes** in visible text anywhere (grep clean; style-lint rule (a) green).
- Turkish diacritics (ı/i, ş, ç, ğ, ü, ö) correct throughout; apostrophes on
  proper nouns correct ("Beta'ya").
- Reviewed flagged items and confirmed they are NOT errors:
  - Turkish decimal `0,00 mm` (index chip) is correct TDK localization (EN shows
    `0.00 mm`); left as-is.
  - `.delta` metadata spans on patches.html use "·" separators and no terminal
    period in BOTH EN and TR — they are label lines, not sentences; consistent,
    left as-is.
- Net forced spelling/punctuation edits: 0 (nothing was actually wrong).

---

## 3. Purple / unstyled links

Audit finding: the site has NO global `a { color }` rule but every link IS
covered by a scoped/page/inline color rule (nav a, footer a, `.chip`, `.cta2`,
page-level `a{color:var(--bb-deep)}`, `body.couture nav a`, blog `a{color:...}`).
The real gap was `:visited` — NOT styled anywhere, so a VISITED link fell through
to browser-default purple sitewide.

Fix: added one universal rule to `web/css/shared-header.css` (loaded on all 54
pages):
```
a:visited { color: inherit; }
```
This makes every visited link keep its own unvisited color. The prior `.cta2`
fix in landing.css was preserved (built on top, not rewritten).

---

## 4. Layout fixes

### Hero form (index.html, live `.betaform`)
Input and "Join the Beta" button had a height mismatch. Fixed by pinning both to
`height:46px; box-sizing:border-box`, `align-items:stretch` on the row, and
centering the button label. They now read as a matched field + button pair.
(Verified in /tmp/polish-index.png.)

### Guestbook note-form button (web/css/landing.css)
The `.note-form` button was `background: var(--paper)` — white, a visual twin of
the white input. Made it a real button: filled navy (`background: var(--ink)`,
white text, bold, `flex:none`) with a navy hover. It now reads clearly as a
button, the input clearly as the field. (Note: the `.note-form`/stitch-wall
markup is not currently mounted on any live page — wall.js references
`#note-form` but no page carries it — so this is the correct CSS fix for whenever
the guestbook is mounted, per the brief's instruction to fix the landing.css
proportion.)

Both changes are CSS-only and surgical; no redesign.

---

## 5. SEO

Checked every page for: unique `<title>`, `<meta name="description">`, canonical,
OG (title/description/image/url), and sitemap/robots/JSON-LD.

### Present already (no change needed)
- Unique `<title>` — all 54 pages. ✓
- `<meta name="description">` — all pages. ✓
- `rel="canonical"` — all pages. ✓
- `og:title` + `og:url` — all pages. ✓
- JSON-LD on homepage — WebSite + Organization + WebApplication. ✓
- robots.txt — present, points at sitemap. ✓

### Gaps found + filled
- **og:image was missing on EVERY page** and no social-card asset existed.
  Created a real 1200×630 branded OG card (`web/assets/og-card.png`, source
  `og-card.svg`) matching the site world (baby-blue gingham, navy Didot
  headline, brandpatch, dashed seam, live URL). Added `og:image` +
  `og:image:width/height`, upgraded `twitter:card` to `summary_large_image`, and
  added `twitter:image` on all 54 pages AND in all 5 generators.
- **sitemap.xml was missing `patches.html` and the new `/blog/`.** Added both
  with `<lastmod>2026-07-17</lastmod>`. Also fixed the sitemap generator's
  `pages` array (it was stale: missing patches, showcase, collection, blog, and
  the guide pages) so a future regen produces a complete sitemap; added a
  `guide/` directory scan.

Sitemap now lists 54 URLs including /blog/ and patches.html; all pattern URLs on
disk match sitemap (no stale, no missing).

---

## Verification

- style-lint.mjs: clean (54 pages + 7 css, 0 violations).
- header-diff.mjs: header identical across 47 pages.
- All 5 generators + header-diff.mjs pass `node --check`.
- Local http.server on :8899 — index 200, blog 200, create 200, og-card.png 200,
  zero 404s in the server log during headless renders (→ no failed-load console
  errors).
- Headless Chrome screenshots: /tmp/polish-index.png (nav Title Case, "Join the
  Beta" filled button aligned with input, no purple), /tmp/polish-blog.png
  (Title Case headings + card titles, prose links stay lowercase), plus
  /tmp/polish-create.png, /tmp/polish-privacy.png, /tmp/og-card.png.
- Cache-bust: every `?v=` and every footer badge is v80.

## Constraints honored
- DID NOT touch DEVAM-RAY-LOOP.md or backend/worker.js (left dirty as found; not
  staged).
- landing.css .cta2 rule preserved; layout fix built on top.
- One additive commit on top of main; no history rewrite (co-author cleanup agent
  runs in parallel).

## Commit + deploy
- Commit SHA: __FILL__
- gh-pages deploy SHA: __FILL__
- Live curl verification: __FILL__
