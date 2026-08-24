# KART F10-C — landing'i urunu anlatan sayfaya cevir (isci-motor)

## NE
`web/index.html`'i ELLE yeniden yaz: fabrika/B2B dilinden cikar, sattigimiz seyi
anlatsin, ve her sayisi bir olcum dosyasina bagli olsun. Bitisde
`ctest -R landing_truth_check` YESIL, `node engine/tools/site-health.mjs` exit 0.

## GIRDI DOSYALARI (once bu ucunu oku)
- `GECE/F10-A.md`   — 18 iddianin envanteri, hukumleri, en sert bulgular
- `GECE/F10-B.md`   — kapinin kurallari ve bugun neden kirmizi dustugu
- `web/index.html`  — bugunku sayfa
- `web/landing-claims.json` — bos beyan iskeleti (semasi icinde yazili)
- `engine/tests/landing_truth_check.sh` — kapinin kendisi (OKU, DEGISTIRME)

## SENIN YAZMA ALANIN (baska hicbir yer)
`web/index.html` · `web/landing-claims.json` · `web/css/landing.css`
· `web/assets/` (yeni gorsel eklemen gerekirse) · `GECE/F10-C.md` · `GECE/log/F10C.*`

## SAYFA NEYI ANLATACAK
Urun: **bir foto ya da bir cumle → kalip + teknik ciziм (flat) + dikis rehberi.**
Sirasiyla:
1. **Uc cikti gorunur olacak.** Kalip, flat, rehber — ucu de sayfada. Bugun
   motorun GERCEKTEN urettigi hangisiyse o simdiki zamanla anlatilir; uretmedigi
   VIZYON'dur.
2. **Mutfak anlatisi:** sinirli malzeme → sinirsiz urun (sinirli sayida
   primitiften kombinasyonla cok sayida giysi). Bu bugun CALISIYOR mu, OLC
   (`contract/garment-spec-v2.json` icindeki primitiflerin kaci sicilde shipped).
   Calismiyorsa VIZYON etiketi + gelecek zaman. ASLA karistirilmaz.
3. **Duzenleme vizyonu** ("suraya fiyonk ekle") — bugun yoksa VIZYON.
4. **Kumas ekseni:** ayni elbise, iki kumas, iki kalip. Bugun yoksa VIZYON.
5. **Ileriye donuk katman** (uyelik, forum, iOS) — vizyon bolumunde TEK satir.

## SERT ICERIK YASALARI
- **"CAD" kelimesi sayfadan CIKACAK** (title, meta description, og, twitter,
  ld+json, govde metni — hepsi). Gerekce: `grep -n CAD CLAUDE.md`. Yerine ne
  yazdigini tutanaga yaz.
- **Fabrika/B2B dili geri plana.** DXF-AAMA / tech-pack / marker / production
  line bir yetenek satiri olarak kalabilir ama sayfanin BASLIGI olamaz.
- **Her sayi ya beyan edilir ya silinir.** `web/landing-claims.json`'da her sayi
  icin `{"claim": "<sayfadaki metin birebir>", "provenBy": "<diskte VAR OLAN
  dosya yolu>", "note": "<tek cumle>"}`. `provenBy` o sayiyi GERCEKTEN basan
  test ya da alet olacak — "bu dosya var" yetmez, o sayiyi o dosya uretiyor
  olacak. Baglayamadigin sayiyi SAYFADAN SIL. Kolay yol budur ve mesrudur.
- **Vizyon simdiki zamanla konusmaz.** Vizyon bolumlerinin kok elemanina
  `data-vizyon` niteligi konur ve metninde su kaliplar GECMEZ: ` is `, ` are `,
  ` does `, ` exports `, ` runs `, ` publishes `, ` drafts `, ` matches `,
  `already`, `today`. Gelecek zaman ya da "not yet / planned" kullan.
  Vizyon bolumu GORSEL OLARAK da ayrilir (etiket/rozet) — okuyan karistirmasin.
- **F10-A'nin YALAN dedigi cumleler:** ya kaldirilir ya dogru haline getirilir.
  Ozellikle "Every drawing on this page is real engine output ... and live"
  (statik gomulu SVG'ler icin) — oldugu gibi KALAMAZ.
- Gosterilen beden = secilen beden. Sayfada bir beden gosteriliyorsa hangi beden
  oldugu yazacak.

## TASARIM YASALARI
- Mevcut gorsel kimlik KORUNUR: `--navy:#1f3a5f`, Didot/Bodoni basliklar,
  baby-blue paleti, `assets/og-card.png`, gingham hero, `css/shared-header.css`
  ve `css/shared-button.css` (bunlara DOKUNMA, tek kaynak).
  Kimlik degisikligi gerekiyorsa YAPMA — `GECE/F10-C.md`'ye iki yonlu taslak
  olarak yaz, karari Damla verecek.
- Duzen ve icerik yenilenir; premium his sart, ucuz/flop UI yasak.
- **Waitlist formu korunur** (`.betaform`, gonderdigi endpoint DEGISMEZ).
- Mobil kirilim: `@media (max-width:460px)` ve `(max-width:1240px)` kirilimlari
  calisir kalacak. Ekran goruntusu almak icin headless tarayici KURMA
  (`npx` ile indirme YASAK); zaten kuruluysa kullan ve yolu tutanaga yaz,
  kurulu degilse tutanaga "olculemedi" yaz ve gec.

## SIRA (kesin)
1. `GECE/F10-C.md`'yi ILK adimda ac ve ilerledikce YAZ (tur tavaninda kesilirsen
   is kaybolmasin).
2. Sayfayi yeniden yaz.
3. `web/landing-claims.json`'i doldur.
4. `./engine/tests/landing_truth_check.sh` kostur → cikti
   `GECE/log/F10C.gate.after.txt`, son satirda EXIT.
5. `node engine/tools/site-health.mjs` kostur → `GECE/log/F10C.site-health.txt`.
6. `ctest --test-dir engine/build -R landing_truth_check --output-on-failure`
   ciktisini tutanaga yapistir.

## YASAKLAR
- `engine/` `contract/` altina TEK BAYT yazma (kapiyi da degistirme).
- `contract/generated-paths.sha256`'daki uretilmis dosyalari elle duzenleme.
- Deploy YAPMA (`scripts/deploy.sh` CALISTIRMA — Damla'nin adimi).
- `web/css/shared-header.css` · `web/css/shared-button.css` · `web/css/tokens.css`
  dosyalarini degistirme.
- HEDEF.md · DAMLA-KUYRUK.md · devlog.md · linkedin.md · ANAYASA.md · GECE/KOSU.md
  Read ile ACMA (grep -n serbest).
- Commit ATMA.
- Tutanakta andigin her dosya yolu diskte gercekten var olacak.
- Bir sayiyi kapiyi gecirmek icin "yakin bir dosyaya" baglama. Baglayamiyorsan SIL.

## SURE TAVANI
80 tur. Once dogruluk (kapi yesil + durust metin), sonra cila.
