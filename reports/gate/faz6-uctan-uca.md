# FAZ 6 — UÇTAN UCA KAPSAM (103 hedef, cümle → parse → compile → gate)

**Tarih:** 2026-07-22  
**Yöntem:** Her hedefin spec+label+beyondEngine'i cümleye çevrildi; LLM-parse adayı (SEN=Claude) grammar slotlarına eşlendi (beyondEngine primitifleri `PARK:` olarak dürüstçe işaretlendi), `parse()` gramere karşı doğruladı, geçenler `compile()` + `gate()` deterministik kanatlarından geçti. **Hakem + terzi kanatları ÖLÇÜLMEDİ** (LLM-hakem 103 için pahalı) → en fazla GEÇTİ-ADAYI. Motor/contract/parse/compile/gate DEĞİŞTİRİLMEDİ; yalnızca çağrıldı (sürücü: `engine/tools/faz6-driver.mjs`).

## 1. SAYAÇ (103 üzerinden — insan eli değmeden kapıyı geçen cümle)

| kategori | sayı |
|---|---|
| ÜRETİLEMEZ | 91 |
| ÜRETİLDİ-GEÇMEDİ | 0 |
| **GEÇTİ-ADAYI** | **12** |

> GEÇTİ-ADAYI = compile ok + flat referans + deterministik kanatlar (bant/parça) temiz. Gerçek GEÇTİ 4 kanat ister (hakem+terzi bu turda ÖLÇÜLMEDİ).

## 2. EKSİK PRİMİTİF FREKANS (en sık → sıradaki aile)

| # | eksik primitif | frekans |
|---|---|---|
| 1 | ties | 14 |
| 2 | gathered | 12 |
| 3 | wide | 11 |
| 4 | gathered-panel | 11 |
| 5 | spaghetti | 11 |
| 6 | shoulderYoke | 11 |
| 7 | maxi | 10 |
| 8 | halfCircle | 10 |
| 9 | sweetheart | 9 |
| 10 | single | 9 |
| 11 | straight-neck | 8 |
| 12 | trousers | 7 |
| 13 | halter | 7 |
| 14 | cap | 7 |
| 15 | straight | 6 |
| 16 | skirt | 6 |
| 17 | offShoulder | 6 |
| 18 | tiered | 5 |
| 19 | lace-up | 5 |
| 20 | kopru-eslesmesi-yok | 4 |
| 21 | casing-drawstring-panel | 4 |
| 22 | mandarin | 3 |
| 23 | shirt | 3 |
| 24 | other | 3 |
| 25 | stand | 2 |
| 26 | tunic | 2 |
| 27 | pleated | 2 |
| 28 | shoulder | 1 |
| 29 | smocked | 1 |
| 30 | smocking | 1 |
| 31 | placket-asymmetric | 1 |
| 32 | oneShoulder | 1 |
| 33 | notched | 1 |

**Sıradaki AİLE (frekansa göre):** `ties` (14) — bel/boyun/yan bağ-fiyonk ailesi en sık tek eksik. Ardından `gathered`+`gathered-panel` (23 birleşik) büzgülü etek + panel büzgü; `wide`+`spaghetti`+`halter`+`offShoulder`+`shoulder`+`oneShoulder` (~32 birleşik) ASKI ailesi; `maxi`+`halfCircle` (20) uzun boy + tam/yarım kloş etek; `straight-neck`+`sweetheart` (17) yaka ailesi.

## 3. GEÇTİ-ADAYI id listesi

`15, 18, 23, 29, 41, 44, 53, 63, 65, 82, 88, 90` (12 hedef)

Hepsi gramer-temiz, tüm-çizilebilir primitifli giysiler (princess/boxy/dart top+dress, aLine/gore etek, peplum-full, shirred-physics, peterPan yaka, buttons/zipper/tieBack kapanma).

**Ayrı bulgu — köprü kapsamı eksiği (primitif değil):** 4 hedef (14, 52, 66, 77) gramer-temiz spec ürettiği halde `compile()` köprüsünde referans-stil eşleşmesi bulamadı (`kopru-eslesmesi-yok`). Bunlar ÜRETİLEMEZ sayıldı ama sebep eksik primitif DEĞİL, köprü (spec→referans stil) kapsamı; ayrı yol haritası maddesi.

## 4. 103 SATIR TABLO

| id | cümle | kategori | eksik primitif / eksik satırı |
|---|---|---|---|
| 1 | strapless princess A-line/flare maxi dress with high side slit (dress) | URETILEMEZ | sweetheart, maxi, shoulder |
| 2 | strapless full-circle A-line midi/maxi dress (fitted bodice) (dress) | URETILEMEZ | straight-neck, halfCircle |
| 3 | mandarin-collar frogged jacket with fluted cuffs, pointed hem (top) | URETILEMEZ | ties, mandarin |
| 4 | cami/bralette top with cross-lace trim and button front placket (top) | URETILEMEZ | wide |
| 5 | drawstring-side lace-up shorts with elastic waist (trousers) | URETILEMEZ | trousers |
| 6 | draped surplice bodice fitted maxi gown with ruched side slit (dress) | URETILEMEZ | sweetheart, straight, maxi, wide |
| 7 | belted surplice draped wrap tulip-hem dress (waist detail crop) (dress) | URETILEMEZ | straight |
| 8 | off-shoulder ruffle-yoke peasant top + tiered ruffle-hem maxi skirt (set) (skirt) | URETILEMEZ | skirt, gathered, maxi, offShoulder, tiered |
| 9 | sleeveless twist-front high-low sheath dress (dress) | URETILEMEZ | straight |
| 10 | tie-front ruched-cup bustier bodice fit-and-flare dress (dress) | URETILEMEZ | sweetheart, wide |
| 11 | off-shoulder blouson batwing ruched-skirt mini dress (dress) | URETILEMEZ | straight, offShoulder |
| 12 | balloon-sleeve gathered bishop cuff (sleeve detail flat) (top) | URETILEMEZ | gathered-panel |
| 13 | sleeveless V-neck side-tie wrap dress (dress) | URETILEMEZ | ties |
| 14 | long balloon bishop sleeves with elastic gathered cuff (sleeve flat) (top) | URETILEMEZ | kopru-eslesmesi-yok — spec köprüden geçmedi (fallback şematik) — bu spec için referans stil eşlemesi eksik |
| 15 | princess-seam scoop-neck fit-and-flare mini dress (green textured) (dress) | GECTI-ADAYI |  |
| 16 | gathered yoke bubble/balloon-hem maxi skirt with side drawstrings (skirt) | URETILEMEZ | skirt, gathered, maxi, casing-drawstring-panel |
| 17 | long-sleeve surplice wrap-tie dress with side slit and bralette layer (dress) | URETILEMEZ | ties, spaghetti |
| 18 | square-neck sleeveless princess-seam blouse (cover 66-1/66-2) (top) | GECTI-ADAYI |  |
| 19 | halter ruffle-tiered mini party dress (illustration) (dress) | URETILEMEZ | halter, gathered, ties, tiered |
| 20 | high-neck balloon-sleeve mermaid muslimah gown with beaded trim (dress) | URETILEMEZ | maxi, stand |
| 21 | gingham halter fit-and-flare full-circle midi dress (dress) | URETILEMEZ | halter, halfCircle |
| 22 | Ruby Pea Coat gingham collared puff-sleeve top (top) | URETILEMEZ | shoulderYoke |
| 23 | boatneck sleeveless button-down princess top (Jana / Boatneck) (top) | GECTI-ADAYI |  |
| 24 | short-sleeve V-neck button waist-tie skirt dress (sketch) (dress) | URETILEMEZ | gathered |
| 25 | lace-up front puff-sleeve peplum babydoll blouse (top) | URETILEMEZ | lace-up |
| 26 | ruffle-hem wrap mini skirt with 3D rosette (skirt) | URETILEMEZ | skirt, straight, ties, single |
| 27 | boat-neck cap-sleeve princess fit-and-flare pinafore dress (Heloise) (dress) | URETILEMEZ | halfCircle, cap |
| 28 | deep-V ruffle-strap empire peplum bow top (Tmish) (top) | URETILEMEZ | gathered-panel |
| 29 | scoop-neck sleeveless princess panelled fit-and-flare midi dress (Patterncos) (dress) | GECTI-ADAYI |  |
| 30 | overbust corset with back lace-up (Artqube corset bundle) (top) | URETILEMEZ | straight-neck, lace-up |
| 31 | Daisy shirred cami peplum top (gingham) (top) | URETILEMEZ | wide |
| 32 | wide-leg pleated wrap-tie palazzo pants (Sleepy Pleated) (trousers) | URETILEMEZ | trousers, maxi, ties |
| 33 | high-neck asymmetric-hem cap-sleeve ribbed top (Aurelic) (top) | URETILEMEZ | stand, cap |
| 34 | low-waist wide-leg drawstring yoke pants (Tillys) (trousers) | URETILEMEZ | trousers, maxi, casing-drawstring-panel, shoulderYoke |
| 35 | vintage 1950s puff-sleeve smock babydoll shortie set (ruffle trim) (dress) | URETILEMEZ | gathered, smocked, single, smocking |
| 36 | cap-sleeve collar top with front pleats (Isabel) (top) | URETILEMEZ | placket-asymmetric, shirt, cap, shoulderYoke |
| 37 | Bloom culotte shorts low-waist (wide culotte) (trousers) | URETILEMEZ | trousers |
| 38 | bow-tie wrap A-line mini skirt low/high-rise (3 lengths) (skirt) | URETILEMEZ | skirt, ties |
| 39 | scoop-neck cap-sleeve gathered-skirt smock dress with pockets (Liston) (dress) | URETILEMEZ | gathered, gathered-panel, cap, shoulderYoke |
| 40 | strapless bandeau ruched-front babydoll peplum top (Haley) (top) | URETILEMEZ | straight-neck |
| 41 | sleeveless princess-seam peplum frill top (denim, Frill Top) (top) | GECTI-ADAYI |  |
| 42 | scoop-neck sleeveless babydoll A-line mini dress (Alma denim) (dress) | URETILEMEZ | gathered-panel, wide |
| 43 | short-sleeve collared button-down shirtdress (Delilah, upcycled) (dress) | URETILEMEZ | shirt, shoulderYoke |
| 44 | square-neck puff-sleeve shirred peplum top (OG Top) (top) | GECTI-ADAYI |  |
| 45 | asymmetric one-shoulder cross-back side-tie jean top (Ossane Jean Top) (top) | URETILEMEZ | other, ties, oneShoulder |
| 46 | 2000s tie-shoulder babydoll cami top (Y2K) (top) | URETILEMEZ | spaghetti |
| 47 | square-neck cap-sleeve princess fit-and-flare midi dress (Harper) (dress) | URETILEMEZ | halfCircle, cap |
| 48 | Peter-Pan collar puff-sleeve babydoll blouse/mini dress (Olivia) (dress) | URETILEMEZ | gathered-panel, shoulderYoke |
| 49 | ruffled Peter-Pan collar puff-sleeve babydoll blouse (Blythe) (top) | URETILEMEZ | gathered-panel, shoulderYoke |
| 50 | scoop-neck sleeveless drawstring-front A-line shift dress/top (Shoreline Shift) (dress) | URETILEMEZ | casing-drawstring-panel, wide |
| 51 | Lila ruffle-tie plaid peplum tank top (top) | URETILEMEZ | single |
| 52 | boatneck asymmetric crossover cropped sweater (Nora) (top) | URETILEMEZ | kopru-eslesmesi-yok — spec köprüden geçmedi (fallback şematik) — bu spec için referans stil eşlemesi eksik |
| 53 | boatneck sleeveless A-line back-tie mini dress (Keira / Mini A-Line) (dress) | GECTI-ADAYI |  |
| 54 | sweetheart wide-strap princess fit-and-flare mini heart dress (dress) | URETILEMEZ | sweetheart, halfCircle, wide |
| 55 | handkerchief-hem asymmetric wrap mini skirt (Tori Handkerchief) (skirt) | URETILEMEZ | skirt, halfCircle |
| 56 | V-neck cross-strap open-back godet-flare babydoll mini dress (Orla) (dress) | URETILEMEZ | wide |
| 57 | short-sleeve V-neck button waist-tie shirtdress (Avril) (dress) | URETILEMEZ | gathered, gathered-panel |
| 58 | deep-V ruffle-trim button-front bralette top (floral, green) (top) | URETILEMEZ | wide |
| 59 | off-shoulder puff-sleeve shirred-bodice tiered-hem cottagecore mini dress (floral) (dress) | URETILEMEZ | sweetheart, gathered, offShoulder, tiered |
| 60 | off-shoulder puff-sleeve princess corset fit-and-flare mini dress (Melia) (dress) | URETILEMEZ | straight-neck, halfCircle, offShoulder |
| 61 | deep-V spaghetti-strap godet-flare denim romper (Willow Romper) (other) | URETILEMEZ | other, spaghetti |
| 62 | tie-shoulder ruffle-trim cami top + ruffle-hem shorts pajama set (Iggi) (top) | URETILEMEZ | spaghetti, single |
| 63 | scoop-neck sleeveless corset-seam crop top (Adelphi Corset Boatneck) (top) | GECTI-ADAYI |  |
| 64 | oversized boyfriend button-down collared shirt (striped) (top) | URETILEMEZ | shirt, shoulderYoke |
| 65 | boxy drop-shoulder crew boat tunic tee (Rina) (top) | GECTI-ADAYI |  |
| 66 | sleeveless / short-sleeve trapeze A-line shift dress (Patterns Room, 4 views) (dress) | URETILEMEZ | kopru-eslesmesi-yok — spec köprüden geçmedi (fallback şematik) — bu spec için referans stil eşlemesi eksik |
| 67 | puff-sleeve sweetheart shirred cottagecore milkmaid dress (Anastasia) (dress) | URETILEMEZ | sweetheart, gathered, offShoulder |
| 68 | sleeveless V-neck side-tie wrap linen dress (Nassimasew Wrap) (dress) | URETILEMEZ | ties |
| 69 | crew-neck sleeveless crop top + straight maxi skirt linen set (Lunaria) (skirt) | URETILEMEZ | skirt, straight, maxi |
| 70 | sweetheart ruffle-strap ruched coquette corset top (milk stripe) (top) | URETILEMEZ | sweetheart |
| 71 | asymmetric side-tie wrap vest over shirt (Simona Vest) (top) | URETILEMEZ | ties |
| 72 | off-shoulder sweetheart princess corset fit-and-flare mini dress (Melia black, alt) (dress) | URETILEMEZ | sweetheart, halfCircle, offShoulder |
| 73 | V-neck puff-sleeve gathered-skirt wrap midi dress with pockets (Addison) (dress) | URETILEMEZ | gathered, gathered-panel |
| 74 | spaghetti-strap center-front zip cami top + mini skirt (100% Human set) (top) | URETILEMEZ | spaghetti |
| 75 | spaghetti-strap deep-V rosette empire babydoll cami (yellow floral, illustration) (top) | URETILEMEZ | spaghetti, single |
| 76 | short-sleeve V-neck tiered gathered peasant dress (napravy dress, red line) (dress) | URETILEMEZ | gathered, gathered-panel, tiered, shoulderYoke |
| 77 | short-sleeve batwing boatneck fitted top (Emma Rose) (top) | URETILEMEZ | kopru-eslesmesi-yok — spec köprüden geçmedi (fallback şematik) — bu spec için referans stil eşlemesi eksik |
| 78 | halter stand-collar keyhole-back-lacing fitted top (Keyhole Top) (top) | URETILEMEZ | halter, lace-up, mandarin |
| 79 | square-neck sleeveless princess corset bustier midi dress (Bluebell) (dress) | URETILEMEZ | halfCircle, wide |
| 80 | ruffle-tiered elastic-cuff pantaloons (renaissance faire) (trousers) | URETILEMEZ | trousers, maxi, tiered |
| 81 | double-breasted mandarin cap-sleeve princess blouse (StorePatterns) (top) | URETILEMEZ | mandarin, cap |
| 82 | crew-neck sleeveless boxy crop tank (Elle Top) (top) | GECTI-ADAYI |  |
| 83 | halter deep-V spaghetti-strap empire babydoll backless cami (Amy Top) (top) | URETILEMEZ | halter, ties |
| 84 | square-neck tie-shoulder shirred-bodice ruffle-hem peplum top (Willow Shirred) (top) | URETILEMEZ | spaghetti, single |
| 85 | strapless shirred-bodice tent lounge top/dress (So Manual) (top) | URETILEMEZ | straight-neck, tunic, single |
| 86 | straight-leg elastic-waist drawstring lounge pants (Andrea/Evelyn/Luna family) (trousers) | URETILEMEZ | trousers, maxi, casing-drawstring-panel |
| 87 | halter front-tie A-line mini dress with waist ties (Margot) (dress) | URETILEMEZ | halter, ties |
| 88 | Poppy sleeveless crew-neck darted tank top (top) | GECTI-ADAYI |  |
| 89 | MUUN cross-front slit-hem lace-up tie top (Cheoma/Cross) (top) | URETILEMEZ | tunic |
| 90 | scoop-back sleeveless denim tank/cami (crop 202511-2 hanging) (top) | GECTI-ADAYI |  |
| 91 | deep-V empire ruffle-strap peplum bow top (Amy/Amynote alt) (top) | URETILEMEZ | spaghetti, single |
| 92 | Delphine tie-front halter fringe/tassel top (yellow) (top) | URETILEMEZ | halter, ties |
| 93 | Roxy cutout tie-neck cap-sleeve top (bolero + bandeau look) (top) | URETILEMEZ | straight-neck, ties, cap |
| 94 | boxy drop-shoulder gather-front colorblock top (Collage Gather) (top) | URETILEMEZ | gathered-panel, shoulderYoke |
| 95 | Pixie side-lace-up sleeveless crop top (top) | URETILEMEZ | lace-up |
| 96 | Victorian halter deep-V tailcoat vest with back lace-up + tails (top) | URETILEMEZ | lace-up, notched, halter |
| 97 | pull-on gathered patch-pocket kids/bloomer pants (pink stripe) (trousers) | URETILEMEZ | trousers, single |
| 98 | Low-waist yoke belt add-on (waistband piece) (other) | URETILEMEZ | other |
| 99 | crew-neck short-sleeve gathered-skirt smock dress with pockets (Sew Good gathering) (dress) | URETILEMEZ | gathered, gathered-panel, shoulderYoke |
| 100 | Darling box-pleat drop-waist tennis mini dress (strap, contrast hem) (dress) | URETILEMEZ | straight-neck, pleated, spaghetti |
| 101 | sweetheart tie-strap floral fit-and-flare corset mini dress (Saddleback/floral) (dress) | URETILEMEZ | sweetheart, halfCircle, spaghetti |
| 102 | V-neck oversized swing tent mini dress (Saddleback mini) (dress) | URETILEMEZ | wide |
| 103 | strapless drop-waist box-pleat pleated mini dress with contrast underskirt (Darling Pleated) (dress) | URETILEMEZ | straight-neck, pleated, spaghetti |
