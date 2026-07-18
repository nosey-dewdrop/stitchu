# BENCHMARK-58 — "yaptım" sayacı (ana loop dosyası)

Damla'nın kararı, 2026-07-15 akşam. Bu dosya sonraki TÜM oturumların anayasası.
Önce CLAUDE.md'yi, sonra bunu oku. Rapor: reports/2026-07-15-stitchu-canli-zincir-testi-ve-register.md

## İKİ METRİK (metrik reformu 2026-07-16)

**1) FULL PATTERN (üst hedef)** — Damla'nın 58 gerçek ürün fotoğrafından
(benchmark-58/photos-1024/) kaçında zincir **O ÜRÜNÜN tam kalıbını** veriyor.
Hedef **58/58**; ara eşik en az **%80 (47/58)**. Bu üst hedeftir ama GÜNLÜK
pusula DEĞİL — çünkü **kümelenme** var: bir foto 3-4 eksikli olabilir, motor
o öğelerden birini eklese bile foto TAM olmaz, yani sayı OYNAMAZ. Loop 4b'den
7'ye kadar motor tie + puf kol başı + tüm yaka ailesini kazandı ama FULL
14/54'te dondu — çünkü eklenen her öğe hep BAŞKA eksiklerle kümelenmiş bir
fotoya denk geldi. Yanlış pusula (Damla haklıydı, 15 Tem).

**2) ELEMENT ACCURACY (günlük pusula, ASIL ilerleme metriği)** — 58 fotodaki
TÜM dağarcık-dışı öğelerin (tekrarlarıyla = N) yüzde kaçını motor ARTIK çiziyor
(D). **D/N**. Kümelenmeyi cezalandırmaz: bir fotoda 3 öğeden 1'ini çizebilir
hale gelince bu metrik +1 alır, motorun gerçek ilerlemesini gösterir.
Manifest oov[] üstünden OFFLINE hesaplanır (sıfır vision çağrısı, stabil).
2026-07-19'dan (K1) beri filtre regex değil TERİM KAYDIDIR: contract/terms.json
(status drawable|honest); eşleşmeyen ifade honest sayılır ve UNMAPPED raporlanır.
**İlk ölçüm (2026-07-16): D/N = 37/103 = %35.9.**

Bu iki sayının dışında "yaptım / oldu / bitti" DEMEK YASAK. Her oturum sonunda
İKİSİ birden ölçülür ve buraya işlenir. Günlük ilerleme = ELEMENT ACCURACY;
başarı beyanı = FULL PATTERN %80.

> **Metrik neden değişti — KÜMELENME.** 58-sette eksik öğeler tek foto başına
> yığılıyor: 18 foto 1-eksik, 16 foto 2-eksik, 4 foto 3+-eksik. Tek-öğe
> loop'ları (tie, puf, yaka) bu yüzden FULL sayısını oynatamadı — eklenen öğe
> hep başka eksikle tıkalı fotoya denk geldi. FULL "kaç foto tam" sorusu doğru
> ÜST hedef ama motorun günlük ilerlemesini GÖSTERMEZ. ELEMENT ACCURACY (D/N)
> her tek-öğe kazanımını sayar → doğru günlük pusula.

Durum (K4 SABİTLER TABLOSU + KAĞIT SLOPER, 2026-07-19, patch 3.21): **FULL 27/54 ve ELEMENT 74/103 DEĞİŞMEDİ (motor davranışı bayt düzeyinde aynı — golden byte-identical + iki wasm hash canlı kopyalarla aynı).** Bu ray sayacı değil DERİNLİĞİ ölçtü: 16 gömülü sabit engine/constants.yaml tablosuna taşındı (SA 15 × 12+ dosya, düğme 18 × 4 yer, bicepsRatio 0.30 × 2, fullness 2.2/2.2/2.0/2.5 ailesi, 0.23/70/55/22/40 tekilleri + 22°/126mm omuz halefleri; kod üretilmiş constants.gen.hpp okur, drift = ctest contract_check kırmızı). Dağılım: 3 verified / 11 assumed / 2 REFUTED (bicepsBustRatio 0.30: −20mm vs Aldrich top arm 284; shoulderDropFactor 0.23: ~13° vs kağıt ~22° — değerler bu zincirde DEĞİŞMEDİ, v1.1 adayları). İLK DIŞ FİT SİNYALİ: EU38 fitted bodice + straight skirt, Aldrich 6. baskı yönteminden BAĞIMSIZ el hesabıyla landmark landmark mm kıyası — 12 landmark pinli sınırlar içinde (en iyi: omuz ucu +0.7mm, yan bel −0.5mm, arka yaka −1.0mm; en kötü: büst çevresi −42mm ribcage-frame tasarımı + bel +26mm %5-ease tercihi + oyuntu −10.6mm), tamamı KALICI ctest sloper_check'e (42. test) mandallandı. KANIT: golden 23406 satır byte-identical, ctest 42/42, vocab-sweep 48600/0, web-fuzz 26260/3 (K1'de kayıtlı eski defekt, değişmedi), validate-contract GREEN (+4b constants bölümü). Rapor: reports/2026-07-19-stitchu-k4-sabitler-sloper.md.

Durum (K1 TEK KONTRAT + TERİM KAYDI, 2026-07-19, patch 3.20): **FULL 0.9 kanıtlı 23→27/54 (PARTIAL 10, eski yöntem 37/54) — hareketin TAMAMI önbellek onarımı, sayım-tabanı değişikliği DEĞİL.** Sayaç tabanı artık contract/terms.json TERİM KAYDI (id + synonyms + drawable|honest + capability + evidence); benchmark-58.mjs DRAWN_SINCE 16-regex listesi SİLİNDİ, eşleşme exact-normalized sözlük, eşleşmeyen ifade OTOMATİK honest + UNMAPPED raporunda (58-set sızıntı taraması: 0 unmapped). ELEMENT ACCURACY 71→74/103 (%68.9→%71.8): +3 = regex listesinin UNUTTUĞU cep kabiliyeti (motor patch 3.12'den beri patch+side-seam cep çiziyor; FULL'a etkisi tam sıfır, üç cep fotoğrafı da başka öğeye takılı — kümelenme). İKİNCİ SAYI yayınlandı: frekans-ağırlıklı korpus kapsamı = 1600 vahşi etiketteki 5092 oov gözleminin %6.7'si drawable (342/5092; registry-mapped %17.1). DÜRÜSTLÜK: (1) bu loop 12 vision çağrısı harcadı — results snapshot'ında 12 foto EKSİKTİ, canlı yeniden okundu (0-çağrı kuralı bu yüzden delindi, beyan edildi); (2) engine/dist node kopyası BAYATTI (named-spec sınırı öncesi; her draft-proof throw edip PARTIAL'a düşüyordu), yeniden derlendi, canlı web build'iyle bayt-aynı; (3) yayınlanan 23'ün snapshot'ı yeniden kurulamıyor. KANIT: golden dump pristine-HEAD build ile byte-identical, iki wasm hash'i canlı kopyalarla aynı, ctest 41/41 (yeni contract_check dahil), vocab-sweep 37800/0, web-fuzz 26260/3 (3 = README'de kayıtlı bilinen 100-sayfa packing defekti, bu loop öncesi de var), render-pages Chrome PNG gözle. Rapor: reports/2026-07-19-stitchu-k1-kontrat.md.

Durum (önceki motor): **31→37/54 TAM KALIP — RAY 1 / R1.2 (Jackie kombo: asimetrik pat + cap sleeve) sonrası +6, 2026-07-17, patch 3.7.**
İKİ dal TEK oturumda çünkü Jackie gingham fotoları iki öğeyi BİRDEN bekliyor (tek başına biri +1/+0).
(a) ASİMETRİK DÜĞME PATI: mevcut PlacketBlock offsetMM=55mm ile CF'den kaydırılmış kapanmaya genişledi
(fold çizgisi -offset, grown kenar -(stand+offset), düğme/ilik kaymış, gerçek CF referans çizili);
offsetMM=0 = simetrik pat BYTE-IDENTICAL. (b) CAP SLEEVE: SleeveCap::Cap, set-in cap KORUNUR (armhole'a
1:1, cap kenarı == plain sleeve <0.5mm) ama gövde kesilip crown'un 55mm altında sığ yaylı KANATA iner
(dikişsiz). CANLI SAYI (0-çağrı cache reclassify, kredi harcanmadı): **31→37/54 (+6 = altı Jackie gingham
fotoğrafı; 5'i asimetrik+cap İKİSİNİ birden istiyor, 1'i (13.48.15) sadece asimetrik → kombo şart)**.
ELEMENT ACCURACY 60→71/103 (%58.3→%68.9). Kanıt: ctest **22/22** (yeni placket_asym_check + cap_sleeve_check),
golden byte-identical, web-fuzz **20190/0** (cap+asim sweep), vocab-sweep 37800/0, render-pages
jackie-asym-cap-dress (Cap Sleeve dahil 11 parça, 0 issue) + Chrome PNG gözle onay (kanat + kaymış pat).
create.js pickPlacket + sleeveHead capped→cap map + seen.capSleeveDrawn/placketAsymDrawn, missing.js
suppression, engine.js/backend/bindings placketStyle param + sleeveCap 3=Cap, iki wasm derlendi. Worker
VISION DEĞİŞMEDİ. DÜRÜST SINIR: back/double-breasted asimetrik + dropped/off-shoulder + pileli cap honest.
DEPLOY: main e6d886a, gh-pages f5817ab, canlı sayaç 37 + patches 3.7 curl teyitli. FORMULAS.md iki bölüm.
Rapor: reports/2026-07-17-stitchu-loop-jackie.md.

Durum (önceki motor): **29→31/54 TAM KALIP — RAY 1 / R1.1 (peplum) sonrası +2, 2026-07-17, patch 3.5.**
Motor artık bele takılan flare peplum volanını AYRI KESİM PARÇASI çiziyor: düz bir çember
(ya da yarım-çember / sivri) annular sektör, iç (bel) yayı bitmiş bele ÖLÇÜLÜ trued. Aldrich/
Armstrong "circular flare": peplum büzülmez, iç yayı = bitmiş bel, dış yayı daha uzun → kendiliğinden
dalgalanır. `PeplumStyle {None, Full, Half, Pointed}`, default None → golden BYTE-IDENTICAL
0.000000mm/23034 satır. Her parça π sweep'te bel'in yarısını taşır (share=W/2), iç yarıçap
r0=share/π → iç yay = share; dış yarıçap r0+180mm. Full/Pointed tek parça cut 2, Half iki on-fold
parça. TRUING: iç bel yayı bitmiş bele 0.00mm (peplum_check flatten edip ölçer, r0=share/π'den
inşa → drift edemez). DÜRÜST SINIR: pileli/büzgülü/draje/tiered peplum çizilmez honest kalır;
bel'siz gövde (etek) atlanır (sessiz no-op yok). CANLI SAYI (0-çağrı cache reclassify, kredi
harcanmadı): **29→31/54 (+2 = Cloe Puffed Sleeve Peplum Top + Serene Fit Blouse, ikisi de tek-terimli
peplum)**. Her iki peplum fotoğrafının başka oov terimleri (flat collar, bow ties, button front)
zaten çizilir durumda idi → peplum tek engeldi, çizilince ikisi de FULL. ELEMENT ACCURACY 58→60/103
(%56.3→%58.3). Kanıt: ctest **20/20** (yeni peplum_check), golden byte-identical, web-fuzz **20110/0**
(peplum sweep 3 stil × 3 neckline × 2 garment), vocab-sweep 37800/0, render-pages peplum-full-top +
peplum-pointed-top (peplum parça çizili, 0 issue). create.js pickPeplum(seen) + manuel "peplum" picker
(skirt gate) + seen.peplumDrawn, missing.js peplum suppression (pleated/gathered/draje/tiered honest).
İki wasm yeniden derlendi. Worker VISION DEĞİŞMEDİ. FORMULAS.md "Peplum". Vitrin: index sayaç 29→31,
patches.html patch 3.5 (EN/TR, honest not), style-lint temiz. Rapor: reports/2026-07-17-stitchu-loop-peplum.md.

Durum (önceki motor + eşleştirme): **26→29/54 TAM KALIP — queue #3 (ruffled straps) sonrası +3, 2026-07-17, patch 3.1.**
İkinci FAZ M motor dalı (K2 kuyruğu: slit → peplum → ruffled-straps). Motor artık fırfırlı
omuz askısını AYRI KESİM PARÇASI çiziyor: askıdan uzun bir öz-kumaş şerit, boyunca büzülüp
fırfırlanan, önde ve arkada her omuza yerleşim çentiğiyle. StrapStyle enum {None, Ruffled},
default None → golden BYTE-IDENTICAL 0.000000mm/23034 satır. Tie/placket deseniyle birebir:
opt-in post-pass (garment.cpp'de slit'ten sonra), sadece kolsuz dress/top; kollu/halter giysi
dürüstçe atlanır (sessiz no-op yok). KESİM: (2·W + 2·SA) × (yuvarla(span·fullness) + 2·SA),
W=22mm, fullness=2.2, SA=15mm; span motorun çizdiği omuz noktalarından ölçülü, [90,220]mm clamp.
TRUING: cutL − 2·SA == yuvarla(span·fullness) (strap_check 0.00mm), cutW == 2·W + 2·SA.
BONUS (Priscilla worn'u tutan sleeveStyle null-vs-none manifest artefaktı): classify()'de
sleeveStyle için null ile 'none' EŞİT sayıldı — kolsuz kolsuzdur, blok aynı çizer; ÖLÇÜM HİLESİ
DEĞİL, dürüst eşleştirme (eşik gevşetilmedi, sadece aynı anlama gelen iki yazım birbirini
karşıladı). CANLI SAYI (0-çağrı cache reclassify, kredi harcanmadı): **26→29/54 (+3 = üç
Priscilla babydoll: cover + close-up SAF MOTORLA, worn null-tolerans BONUSU ile)**. Attribution
kanıtlı: strap kuralı tek başına +2 (26→28), null-tolerans +1 (28→29). ELEMENT ACCURACY
55→58/103 (%53.4→%56.3). Kanıt: ctest **19/19** (yeni strap_check: tam 1 ekstra parça, mevcut
outline byte-identical, cut truing, çift omuz çentiği, kollu red + dürüst not, slit+open-back
coexist), golden byte-identical, web-fuzz **20020/0** (strap sweep 4 neckline × 3 garment),
vocab-sweep 37800/0, render-pages ruffled-straps-babydoll (6 parça, strap çizili). create.js
pickRuffledStraps(seen) + manuel "fırfırlı askı" picker (kolsuz/non-halter gate) +
seen.ruffledStrapsDrawn, missing.js ruffled strap suppression (spagetti/tek-omuz/halter honest).
İki wasm yeniden derlendi. Worker VISION DEĞİŞMEDİ. FORMULAS.md "Ruffled straps". Vitrin: index
sayaç 26→29, patches.html patch 3.1 (EN/TR, bonus dürüstçe gerekçelendi), style-lint temiz.
Rapor: reports/2026-07-17-stitchu-loop-a-ruffled-straps.md. SIRADAKİ (K2 kuyruğu): peplum (+2) /
[asymmetric-placket + cap-sleeve KOMBO +6].

Durum: **24/54 TAM KALIP — +2 (Vision LOOP 2 / patch 2.2 = V1 neckline, 2026-07-16).**
worker.js vision prompt'una yaka belirsizlik-giderme kural bloğu eklendi (ön+arka TEK
garment TEK yaka; arka/giyilmiş foto önün yakasını uyduramaz; halter SADECE boyna
dolanan bant; emin değilsen boat/crew/scoop'a düş). Sıfır C++, sıfır motor kodu.
wrangler deploy (version 5cb94ca5). Canlı FAST koşu (59 çağrı, 8dk20sn), aynı koşullar
before/after: **yaka yanlış-okuması 5→2, vision-accuracy %86.8→%94.4, FULL 22→24.**
Düzelen 3 arka görünüm: Mira arkası (halter→null+tieBack), Jackie gingham arkası
(vNeck→crew), Tie Back polka arkası (halter→boat+tieBack, FULL'a geçti). Regresyon
bekçisi: FULL yükseldi, revert YOK. Kalan 2 yaka hatası arka karışıklığı DEĞİL,
gerçekten belirsiz ÖN çekimler (JACKIE front square, bir vNeck) — metin düzeltmesinin
dürüst tavanı. web/patches.html'e patch 2.2 girdisi. Rapor:
reports/2026-07-16-stitchu-vision-loop2.md.

Durum (ÖNCEKİ): **22/54 TAM KALIP — DEĞİŞMEDİ (vitrin loop / patch 2.1, 2026-07-16).**
Vitrin loop'u motora/vision'a DOKUNMAZ: site vişne→bebek mavisi RESKIN edildi,
web/patches.html (LoL yama notları, 1.0–2.0 geriye dolduruldu) eklendi, hero
CTA "join the beta" → canlı /api/waitlist (probe HTTP 200), fiyat rakamları beta
çerçevesine çevrildi, sayfa geçişleri (View Transitions) eklendi. FULL 22/54
tanım gereği sabit. Deploy v59. Rapor: reports/2026-07-16-stitchu-vitrin-loop.md.
Durum (motor): **26/54 TAM KALIP — Loop M1 (back hem slit / walking vent) sonrası +2, 2026-07-16.**
İLK FAZ M motor dalı (K2 köprü denetiminden sonra EN UCUZ +2). Motor artık oturan düz/A kesim
eteğin ARKA parçasını arka-orta dikişle keser ve etek ucundan yukarı bir yürüme yırtmacı açar:
VENT için 40mm geri-katlanan 45° üst köşeli kanat (iki arka üst üste kapanır), SLIT için düz faced
açıklık, her ikisinde üst-nokta bar tack. Sadece oturan düz/A kesim arka barındırır (büzgülü/pileli/
yarım-kloş yürüme payı zaten var → dürüstçe atlanır, sessiz no-op yok). SlitBlock::apply placket/
openback-tarzı opt-in post-pass, HemSlit enum {None,Vent,Slit}, default None → golden BYTE-IDENTICAL
0.000000mm/23034 satır. TRUING: kanat = CB dikişinin ventExtension=40mm dışa offset'i (her y'de tam
40.00mm, drift edemez); üst-nokta y = hemY − height parçanın kendi ucundan ölçülü. Kanıt: ctest 18/18
(yeni slit_check: cut note→CB seam, bar tack hemY−height'ta, kanat 40.00mm truing, 45° köşe, gathered
red + dürüst not, tie-back+open-back+slit coexist, plain slit outline dokunmaz), golden byte-identical,
web-fuzz 19960/0 (slit sweep 2 finish×2 skirt×3 length×3 body dahil), vocab-sweep 37800/0, render-pages
vent-straight-dress (Skirt Back min-x −40.00mm) + slit-straight-skirt çizili. create.js pickHemSlit(seen)
vision→spec + manuel "arka yırtmaç" picker (straight/aLine gate) + seen.hemSlitDrawn, missing.js
hemSlitDrawn back/hem/walking slit suppression (front/side slit honest kalır), engine.js/backend/bindings
int backSlit param. İki wasm yeniden derlendi. Worker VISION DEĞİŞMEDİ (ürün akışı tarayıcı wasm'ini
kullanır). FORMULAS.md "Back hem slit / walking vent". CANLI SAYI (0-çağrı cache reclassify, kredi
harcanmadı): 24→26/54 (+2 = Laura ×2, ikisi de tek-terimli "back hem slit"). ELEMENT ACCURACY 53→55/103
(%51.5→%53.4). Patch 3.0. Deploy: web/index.html sayaç 22→26, patches.html patch 3.0, style-lint temiz.
Rapor: reports/2026-07-16-stitchu-benchmark-loopM1.md.

Önceki motor durumu (Loop 9b) aşağıda:

Durum (motor): **22/54 TAM KALIP — Loop 9b (open-back cutout) sonrası +3, 2026-07-16.**
Motor artık SIRT parçasında şekilli açık-sırt oyuğu (yuvarlak/düşük-V/kare/damla) çiziyor +
facing (oyuk kenarını bitiren offset parça); OpenBackBlock opt-in post-pass, default None →
golden BYTE-IDENTICAL 23034 satır. Oyuk nape'ten 40mm aşağı başlar (omuzda yoke), CB fold'a
karşı yarım çizilir (back cut-2 CB seam mirror), boy 55-320mm clamp. TRUING: facing oyuk
çizgisini marking olarak taşır = back'e çizilen oyukla byte-identical → 0.00mm (backopen_check).
Loop 4b tie-back ile ÇAKIŞMAZ, ikisi aynı drafta çıkar (Tie Back Mini Dress hem bağ hem oyuk).
CANLI SAYI (0-çağrı cache reclassify, kredi harcanmadı): **22/54 (+3)** = Jana (low open back) +
Tie Back ×2 (cover + front worn). Kuyruk +4 demişti; GERÇEK +3 — 3. Tie Back (polka, back view)
cached vision'da neckline="halter" okunmuş (manifest boat/crew bekliyor) → WRONG kalıyor: oyuk+bağ
ÇİZİLİ ama neckline field FULL'u bloke ediyor (vision varyansı, motor değil); Arielle kümelenmiş
(side-seam pockets çizilemez). ELEMENT ACCURACY 48→53/103 (%46.6→%51.5, +5). Kanıt: ctest 17/17
(yeni backopen_check), golden byte-identical, web-fuzz 19780/0, vocab-sweep 37800/0, 160-draft
çok-body validator-clean, render openback-round + openback-lowv-tieback + görsel SVG teyit.
create.js pickBackOpening + manuel şekil picker + seen.backOpeningDrawn, missing.js open-back
suppression (tie-back/laced honest), engine.js/backend/bindings int backOpening, iki wasm
yeniden derlendi. Worker VISION DEĞİŞMEDİ. FORMULAS.md "Open-back cutout". Deploy v58.
Rapor: reports/2026-07-16-stitchu-benchmark-loop9b.md. Önceki durum (Loop 9a):
**19/54 TAM KALIP — Loop 9a (drawstring/shirred büzgü) sonrası +5, 2026-07-16.**
Motor artık panonun KENDİSİNİN büzüldüğü yapıyı çiziyor (fırfır ayrı şerit, bağ ayrı strip
değil; boyun/büst/roba panosu geniş kesilip kanaldan/lastikten toplanıyor). GatherBlock opt-in
post-pass, GatherType {None,Drawstring,Shirred,Smocked} × GatherZone; kesim genişliği = bitmiş
kenar × oran (ip 1.8 / lastik 2.0 / smok 3.0), bitmiş kenar boyun oyuğundan ÖLÇÜLÜ → truing
inşadan (gather_check kesim/oran=bitmiş kenar 0.005mm). Golden BYTE-IDENTICAL 23034 satır
gathersiz. CANLI SAYI (0-çağrı cache reclassify, kredi harcanmadı — cache güncel, sadece
DRAWN_SINCE verdict'i oynadı, Loop 6/7 ile aynı yöntem): **19/54 (+5)** = Mira ×3 (gathered
bust) + Blair ×2 (shirred yoke). Kuyruk +6 tahmin etmişti; GERÇEK +5 çünkü Priscilla babydoll
kümelenmiş (drawstring boyun VE fırfırlı askı, hâlâ MISSING) — tahmin bir foto şişmiş, bu
kümelenmenin ta kendisi. ELEMENT ACCURACY 37→48/103 (%35.9→%46.6). Kanıt: ctest 16/16, golden
byte-identical, web-fuzz 19740/0, vocab-sweep 37800/0, render drawstring-neck+shirred-bust+
smocked-yoke. NOT: iki agent aynı loop'a düştü (paralel çakışma); engine+create.js+engine.js
paralel agent'tan, FORMULAS+devlog-restore+web-fuzz-fix+essay+ölçüm+deploy bu agent'tan.
Rapor: reports/2026-07-16-stitchu-benchmark-loop9a.md. Önceki durum (Loop 7):
**14/54 TAM KALIP — Loop 7 (yaka ailesi) sonrası DEĞİŞMEDİ, DÜRÜST, 2026-07-16.**
Motor artık bütün yaka ailesini (dik/mandarin/yatık/bebe/gömlek) AYRI PARÇA olarak çiziyor,
boyun kenarı boyun oyuğuna 0.0000 mm trued (oyuk bitmiş gövde parçasından ÖLÇÜLÜ, drift edemez);
opt-in CollarBlock post-pass, golden BYTE-IDENTICAL (23034 satır) yakasız yollarda. AMA bu
58-sette yakanın TEK eksik olduğu foto YOK: yaka 9 fotoda geçiyor, hepsi başka kümelenmiş öğeyle
tıkalı (peplum, shirred yoke, double-breasted, drawstring kol, gathered yoke, pinafore) — manifest
analiziyle ÖNCEDEN bilinen kümelenme. Reclassify: 9 fotonun HEPSİNDE 'collar' engel listesinden
çıktı, sızıntı=0; her biri farklı bir ikinci öğeyle hâlâ MISSING/WRONG. Kabiliyet gerçek+kanıtlı
(ctest 15/15 collar_check dahil, golden byte-identical, truing 0.0000 mm, web-fuzz 19620/0,
vocab-sweep 37800/0, 420 collar-on draft validator-clean, render 3 yaka spec). STRATEJİ VERİSİ:
kümelenme yüzünden tek-öğe loop'ları artık sayıyı oynatmıyor → sıradaki loop'lar aynı fotodaki
İKİNCİ öğeyi (yoke/peplum) hedeflemeli. Deploy v56. Worker VISION DEĞİŞMEDİ. Rapor:
reports/2026-07-15-stitchu-benchmark-loop7.md. Önceki durum (Loop 6):
**14/54 TAM KALIP — Loop 6 (puf/büzgülü kol başı) sonrası DEĞİŞMEDİ, DÜRÜST, 2026-07-15.**
Motor artık puf/büzgülü SLEEVE HEAD çiziyor (raised+widened cap + crown gather; SleeveBlock
opt-in param, golden BYTE-IDENTICAL Plain'de), ama bu 58-sette puf/gathered kol başının TEK
eksik olduğu foto YOK — sette geçen kol-büzgü terimleri motorun DOĞRU çizmediği honest sınırlar
(cap sleeve ŞEKLİ ×5, drawstring gathered ×2). Yetenek gerçek+kanıtlı, sayı bu setin son
boşluğunu açmıyor. Kanıt: ctest 14/14 (puf bloğu dahil) + golden byte-identical + precision
0.00mm + web-fuzz 19620/0 + vocab-sweep 37800/0 + render Puff Sleeve chord 460 vs plain 317.
Deploy v55. Önceki Loop 5 (DENETİM A): 14/54 teyit, 8/8 madde geçti. Önceki Loop 4b durumu:
**14/54 (CANLI, Loop 4b sonrası — +3)**
Motor artık BASİT UYGULANAN kumaş bağını/kuşağını/fiyonkunu AYRI PARÇA olarak ÇİZİYOR
(öz-kumaş dikdörtgen (2W+2·SA)×(L+2·SA), bel sash/fiyonk + tie-back + ön/boyun fiyonku +
manşet; Aldrich/Armstrong). DÜRÜST SINIR: drawstring-büzgülü (kanal+shirring gerektiren)
bağ ÇİZİLMEZ, honest kalır. +3 tie-driven: 2 Jackie back-tie + Emma back tie closure.
30 eksik öğeli / 10 yanlış (vision varyansı, motor değil) / doğru-red 4/5. Ölçüm 8m22s
(FAST token, 59 çağrı). Önceki durum (Loop 3): 11/54 (ön düğme patı, grown-on stand +
fold + düğme/ilik). Daha eski durum:
Durum (2026-07-15 manuel ölçüm): **6/54 TAM KALIP** — canlı Opus zinciri kredi bitik
olduğu için 59 foto Claude aboneliği üstünden EL İLE (worker prompt kurallarıyla)
okundu: 6 TAM + 48 eksik öğeli + 0 yanlış; doğru-red 5/5. TAM'lar Loop 0/1'le aynı
(Heloise, Hallie tank, Boat Neck Top×4). WRONG 0 → canlı zincirin 10 WRONG'u saf vision
varyansıymış (insan gözü yaka sınırını doğru okuyunca sıfırlandı). Bu bir el-ölçümü;
kredi gelince tek FAST koşuyla canlı sayı teyit edilecek, beklenti 6/54. Önceki durumlar altta:
Durum: **6/54 TAM KALIP (ÖLÇÜLDÜ, 2026-07-15 Loop 1 — Loop 0'la AYNI)** — motor
henüz yapısal alanları ÇİZMİYOR, o yüzden FULL değişmiyor ve bu NORMAL. Loop 1'in
ölçüsü ürün metriği değil ŞEMA KÖPRÜSÜ: **51/69 dağarcık-dışı öğe artık yeni yapısal
alanlarla (closure/collar/straps/cupSeams/sleeveHead/yoke/backDetail/outOfVocab[])
YAKALANIYOR** (Loop 0'da sıfırdı). Doğru-red 4/5. Ölçüm scripti: engine/tools/
benchmark-58.mjs (canlı worker; artık structuralCoverage() ile şema köprüsü stat'ı basar).

## TEŞHİS (kanıtlı, 2026-07-15 canlı test)
- CV (vision) GÖRÜYOR: 7/7 canlı testte düğme patı, yaka, korse, puf doğru okundu.
- Ama gördüğünü serbest metin "details" cümlesine yazıyor (worker.js:285) —
  şemada yapısal alan yok.
- Motorun dağarcığında o kelimelerin ÇİZİM FORMÜLÜ yok (strapless, pat, yaka,
  kup, puf cap, pile, fiyonk...).
- Yani eksik CV değil: (1) motor dağarcığı, (2) vision→motor şeması.
- En büyük güven kıran: motor çizemediğinde SESSİZCE en yakın bloğu veriyor,
  kullanıcıya söylemiyor.

## KURALLAR (Damla'nın ağzından)
1. **Çizmeye uğraş.** Dürüstlük katmanı "çizemedim" deyip bırakmak DEĞİL —
   önce dene, ancak gerçekten formülü yoksa açıkça söyle ve en yakın bloğu
   "şunlar eksik" notuyla ver.
2. **Referans = couture + high street.** Her yeni dağarcık öğesi çizilmeden önce
   o öğenin Dior / Chanel / YSL / Prada / Armani seviyesinde nasıl yapıldığı VE
   Stradivarius / Bershka'da nasıl basitleştiği çalışılır (kesim kitapları:
   Aldrich/Armstrong/M&S + gerçek ürün fotoğrafları). Formül bu araştırmadan çıkar.
3. **Kanıtla, iddia etme:** her öğe golden byte-identity (mevcut yollar) +
   truing 0.00mm + ctest + web-fuzz + render-pages strip kanıtı + benchmark
   sayısının artışıyla gelir.
4. Farklı oturumlarda farklı loop'lar; her oturum bu dosyayı günceller.

## VERİ (hepsi lokal, git'e GİRMEZ — .gitignore'da)
- `benchmark-58/photos-1024/` — 59 ekran görüntüsü, 1024px JPEG (zincirin yediği
  formatın aynısı). Kaynak: ~/Desktop/dress_patterns/. İçlerinde 1 giysi-dışı
  (Slowly ekranı, 13.30.50) + 1 çanta (13.51.19) + kalıp-çizimi görselleri var —
  etiketlemede işaretlenecek (onlar "doğru red" testleri).
- `benchmark-58/bugra-ref/` — satın alınmış BugraPatterns paketleri (Buttoned
  Corset Bustier, Locket Top, Plain Bustier Dress A0/A1/mixte + talimatlar).
  SATIN ALINMIŞ IP + ekran görüntülerinde Damla'nın tarayıcısı var → ASLA public
  repoya pushlanmaz.
- Canlı vision çıktıları (7 foto, ham JSON): rapor 2026-07-15 bölüm 1.

## LOOP KUYRUĞU (sıra Damla onaylı: frekans × zorluk; 15 loop, 2026-07-15 akşam)

Her loop = TEK oturum/agent, taze context. Bir loop bitmeden sıradaki başlamaz.
Loop bitince context TEMİZLENİR (agent ölür / session clear), sıradaki loop SIFIR
context'le açılır; loop'lar arası hafıza taşınmaz — tek taşıyıcı bu dosya + repo.
Yapan agent kendi işini "oldu" diye onaylayamaz; denetim loop'ları (A/B/C) AYRI,
kodu yazmamış bir agent tarafından koşulur — sadece çıktıya, benchmark sayısına
ve render kanıtına bakar, kod yazmaz, kırar ve rapor eder.

### Her loop'un protokolü (istisnasız)
- GİRDİ: önce CLAUDE.md, sonra bu dosya, sonra kendi satırındaki referanslar. Başka bir şey okuma.
- İŞ: sadece kendi öğesi. Kuyruktan ikinci öğe almak YASAK (context şişer, kalite düşer).
- ARAŞTIRMA (dağarcık loop'ları): öğenin couture (Dior/Chanel/YSL/Prada/Armani) +
  high street (Stradivarius/Bershka) yapımı + Aldrich/Armstrong/M&S formülü. Formül buradan çıkar.
- KANIT: golden byte-identity + truing 0.00mm + ctest tamamı + web-fuzz 0 fail +
  render-pages strip + **58'lik benchmark koşusu, sayı aşağıdaki tabloya işlenir**.
- KAPANIŞ: tabloyu + Durum satırını güncelle, CLAUDE.md status, devlog/linkedin malzeme,
  commit + push, deploy (?v bump + git add web/ ALL + subtree gh-pages).
- Blokör çıkarsa (veri erişimi, Damla kararı gereken şey): durur, tabloya "BLOKE: neden" yazar, push'lar.
- DEVLOG ŞABLONU (zorunlu, Damla 15 Tem): her reel girdisi AYNEN şu yapıda —
  `## Reel — [kısa başlık] (loop XX)` / `**Hook (ilk 2 sn):**` ters köşe tek cümle /
  `**Anlatı (~30-45 sn):**` Damla'nın dilinde "neyi değiştirdim → çünkü şu sorun
  vardı → nasıl çözdüm → ders", terimler mala öğretir gibi açılır /
  `**Görsel:**` ekran + alt yazı fikri / `**Format:** reel` (ya da carousel).
  Loop'a bağlı olmayan kavram reel'leri devlog sonundaki "TECH/AI/CV STOĞU"
  bölümüne, başlıkta loop numarası olmadan.

### SIRADAKİ LOOP KUYRUĞU — MARJİNAL KAZANÇ SIRASI (2026-07-16 reformu)

Frekans + kümelenme analizinden (offline, manifest oov[] × DRAWN_SINCE).
"Marjinal kazanç" = o öğe eklenince kaç foto FULL'a geçer (o öğenin TEK kalan
eksik olduğu foto sayısı). Kümelenme yüzünden en sık eksik (placket 11 foto,
gathering 10 foto) MUTLAKA en yüksek marjinal kazanç DEĞİL — çünkü çok-eksikli
fotolara yığılıyorlar. Bu yüzden sıra marjinal kazanca göre kurulur:

| Sıra | Öğe | Kaç fotoda eksik | Marjinal kazanç (FULL'a geçen) |
|------|-----|:---:|:---:|
| 1 | **drawstring/shirred gathering** (kanal + büzgü; babydoll/milkmaid boyun+büst) | 10 | **+6** |
| 2 | **open-back cutout** (dairesel/düşük açık sırt oyuğu) | 5 | **+4** |
| 3 | **peplum** (bele oturan + aşağı açılan pano) | 2 | **+2** |
| 4 | **hem slit** (etek/elbise etek yırtmacı) | 2 | **+2** |
| 5 | **bias-cut slip** (verev kesim askılı slip) | 1 | **+1** |
| 6 | **shorts / two-piece** (Hallie set: şort + tank) | 1 | **+1** |
| 7 | **drawstring/gathered sleeve** (kol kanalı) | 2 | +1 |
| — | yoke (front/back/gathered/shirred) | 6 | 0 (hepsi kümelenmiş) |
| — | cap sleeve (kısa cap şekli) | 5 | 0 (hepsi placket'le kümelenmiş) |
| — | asymmetric/double-breasted placket | 11 | +1 (10'u kümelenmiş) |

NOT — üst-hedef ile pusula ayrışması: gathering + open-back + peplum + hem-slit
sırayla eklenirse FULL 14 → ~28 (**+14 foto**, %26→%52), ELEMENT ACCURACY ise
her tek öğede de artar. Placket ve yoke frekansta yüksek ama marjinal kazançları
düşük (çok-eksikli fotolara yığılı) → onlar SON, tek başlarına sayıyı oynatmaz;
ancak bir fotonun İKİNCİ eksiği de kapanınca değer verir. Couture taksonomisi
genişlemesi (pantolon/ceket blokları, korse/kup) ayrı üst-hedef; bu set ağırlıklı
elbise/top/etek olduğu için gathering+open-back önce gelir.

### Kuyruk
| # | Loop | İş | Durum | 58'de |
|---|------|-----|-------|-------|
| 0 | Etiketleme + sayaç | photos-1024'teki her foto için ground-truth manifest (garment, dağarcık-içi alanlar, dağarcık-DIŞI öğeler; Slowly ekranı 13.30.50 + çanta 13.51.19 + kalıp-çizimleri = doğru-red testleri). tools/ altında ölçüm scripti: zincirden geçir → tam kalıp / eksik öğeli / yanlış. İLK GERÇEK SAYI buradan. | **bitti** (15 Tem; manifest benchmark-58/manifest.json lokal, script engine/tools/benchmark-58.mjs; 59 foto = 54 giysi + 5 doğru-red; rate-limit füzü kendi KV'mizden resetlenerek aşıldı, wrangler authlu) | **6/54** (45 eksik öğeli, 3 yanlış; doğru-red 3/5 — talimat sayfası + kalıp çizimi giysi sanıldı) |
| 1 | Vision köprüsü | worker şemasına yapısal alanlar: closure, collar, straps, cupSeams, sleeveHead, yoke, backDetail, outOfVocab[] — serbest metin details ölür, alan doğar. worker.js:285. | **bitti** (15 Tem Loop 1; worker GERÇEK deploy edildi v7c3511e6, PUBLIC_ANALYZE on; create.js spec.seen borusu; 2 Loop 0 vision hatası prompt'ta düzeldi; golden byte-identity, web-fuzz 19555/0) | **6/54** (DEĞİŞMEDİ — motor çizmiyor, NORMAL) + **SCHEMA BRIDGE 51/69 öğe yakalandı** |
| 1b | Benchmark hız token'ı | Ölçüm 21sn/foto sürünüyor (kendi rate-limit sigortamız + KV eventual consistency). Worker'a gizli bypass header (wrangler secret, SADECE engine/tools/benchmark-58.mjs kullanır); gerçek kullanıcı limiti AYNEN kalır. 54 foto dakikalara iner — "her patch sonrası sayı" kuralı ucuzlar. | **bitti** (15 Tem Loop 1b; worker GERÇEK deploy v82498f3a; gizli header `x-sb-bench`, secret `BENCH_BYPASS` = wrangler secret + gitignore'lu benchmark-58/.benchmark-token; sabit-uzunluk XOR karşılaştırma, secret loglanmaz; token'lı=fuse atlanır, token'sız/yanlış=aynen 3/dk+15/gün; ~1.5sn/çağrı → 54 foto ~90sn vs eski 21sn/çağrı) | — (BLOKE aşağıda: kredi) |
| 2 | Dürüstlük + deneme katmanı | Motor çizemediği öğeyi ÖNCE çizmeye uğraşır (en yakın türev), gerçekten formül yoksa web'de görünür missingFeatures ile kullanıcıya söyler: "şu ikisi kalıpta YOK". Sessiz fallback ölür. | **bitti** (15 Tem Loop 2; TEK KAYNAK web/js/missing.js: closure/collar/straps/cupSeams/sleeveHead/yoke/backDetail her biri için EN-YAKIN-TÜREV eşleme + "verilen en yakın X, şunu elle ekle" notu, EN+TR. Ekranda vişne kart (render.js appendMissing) + PRINT KAPAĞINDA aynı liste (print.js appendMissingToCover, vişne başlık). outOfVocab dedupe (fırfırlı askı iki kez gelmez). Motor C++ dokunulmadı → golden byte-identical; web-fuzz 19555/0; render-pages temiz; 5 temsili spec + 1 temiz-kontrol EN+TR doğru mesaj ürettti. Sayı BLOKE: kredi.) | — (sayı BLOKE: kredi) |
| 3 | Düğme patı | Closure::FrontButton post-pass. DİKKAT: 15 Tem'de yarım strapless+pat denemesi revert edildi; mimari karar sabit: makePrincessPieces'e opsiyonel dal + keyhole-tarzı opt-in post-pass, golden byte-identity korunur. | **bitti** (15 Tem Loop 3; PlacketBlock::apply keyhole-tarzı post-pass, spec.frontPlacket default false → golden BYTE-IDENTICAL 0.000000mm/23034 satır; GROWN-ON stand 18mm=düğme Ø (Aldrich/Armstrong araştırması, couture default), CF kenarı dışa taşınır + fold çizgisi CF'de + düğme CF üstünde + ilik 3mm dışa + zorunlu göğüs düğmesi; sadece ön parça büyür, yaka/facing DOKUNULMAZ; ctest 13/13, placket_check 4 gövde yeşil, precision 0.00mm, web-fuzz 19620/0 (65 pat draft'ı), vocab-sweep 37800/0, render-pages pat'lı dress+top strip'te çizili; missing.js ÖN düğme/pat'ı artık listelemez (seen.closureDrawn), arka/yan pat honest kalır) | **sayı BLOKE: kredi** (offline ön-kontrol: manifest'te 19 pat'lı fotodan 2 ARKA→honest kalır, 7 saf-ÖN-pat→artık tam kalıp adayı, 10 ön-pat+başka eksik→pat çizildi kalanı eksik) |
| 4 | Fermuar payı | Kapanma zincirinin ikinci yarısı: fermuar payı + kapanma tipine göre dikiş payı farkı. Pat'la aynı post-pass mimarisi. | bekliyor (DÜŞÜK ÖNCELİK: bu sette fermuar neredeyse görünmüyor — marjinal kazanç ~0) | — |
| 9a | **Drawstring / shirred gathering** (YENİ 1. ÖNCELİK, marjinal +6→GERÇEK +5) | Kanal (casing) + büzgü/shirring: babydoll/milkmaid boyun + büst panosu. En yüksek marjinal kazanç. Aldrich shirring + casing; couture (smock) + high-street (babydoll). | **bitti** (16 Tem Loop 9a; GatherBlock::apply opt-in post-pass, GatherType enum {None,Drawstring,Shirred,Smocked} + GatherZone {Neckline,Bust,Waist,Sleeve}, default None → golden BYTE-IDENTICAL 0.000000mm/23034 satır. Pano KENDİSİ büzülüyor (fırfır ayrı şerit, bağ ayrı strip; burada panonun kesim genişliği = bitmiş kenar × oran: ip 1.8, lastik 2.0, smok 3.0). Bitmiş kenar motorun çizdiği boyun oyuğundan/büst bandından ÖLÇÜLÜ (aynı neck-point taraması collar'dan) → truing inşadan. Drawstring = pano + kanal (2 paralel çizgi + kordon delikleri) + ayrı kordon parçası; shirred/smocked = pano + paralel büzgü sıraları (+smok nokta gridi). DÜRÜST SINIR: kol drawstring'i (kola kanal) + gathered STRAP + gerçek el-smok dokusu ÇİZİLMEZ honest kalır. Kanıt: ctest 16/16 (yeni gather_check: kesim/oran=bitmiş kenar 0.005mm, drawstring cord ekler shirred eklemez, oran sırası smok>lastik>ip, mevcut outline byte-identical, yerleşim notch), golden byte-identical, web-fuzz 19740/0 (gather sweep 3 tip×4 zone×2 garment dahil, gatherRun sheet-count countSheets'e düzeltildi), vocab-sweep 37800/0, render-pages drawstring-neck + shirred-bust + smocked-yoke pano+kordon çizili. create.js pickGather(seen) vision→spec + manuel büzgü/zone picker + seen.gatherDrawn, missing.js gatherDrawn yoke/oov büzgü suppression (sleeve gather honest kalır), engine.js/backend/bindings int gatherType/gatherZone param. İki wasm yeniden derlendi. Worker VISION DEĞİŞMEDİ. FORMULAS.md "Drawstring / shirred gathering". NOT: 2 agent aynı loop'a düştü (paralel çakışma), engine+wiring paralel agent'tan, FORMULAS+devlog-restore+web-fuzz-fix+essay+ölçüm+deploy bu agent'tan) | **19/54 (+5)**: Mira ×3 (gathered bust panel) + Blair ×2 (shirred/smocked yoke). Kuyruk +6 demişti, GERÇEK +5 — Priscilla babydoll kümelenmiş (drawstring boyun VE fırfırlı askı → hâlâ MISSING), tahmin bir foto şişmişti. ELEMENT ACCURACY 37→48/103 (%35.9→%46.6, +11). |
| 9b | **Open-back cutout** (YENİ 2. ÖNCELİK, marjinal +4) | Dairesel/düşük açık sırt oyuğu + facing/binding kenarı. Tie-back'lerle birlikte (bağ zaten çizili, oyuk kalıyor). | **bitti** (16 Tem Loop 9b; OpenBackBlock::apply keyhole-tarzı opt-in post-pass, BackOpening enum {None,RoundCutout,LowV,Square,Keyhole}, default None → golden BYTE-IDENTICAL 0.000000mm/23034 satır. SIRT center parçasında (CB fold x=0) şekilli oyuk marking + facing parçası (facingMargin 34mm dışa offset silhouette). Oyuk nape'ten gapBelowNape=40mm aşağı başlar (omuzda yoke fabric kalır, giysiyi asar), waistClearance=55mm, boy [55,320]mm clamp; half-width/boy oranı şekle göre (round 0.42/lowV 0.34/square 0.36/keyhole 0.24). Oyuk CB fold'a karşı YARIM çizilir, back cut-2 CB SEAM mirror ekseni → yarım tam simetrik oyuğa açılır (keyhole ile aynı on-fold kuralı). TRUING: facing oyuk çizgisini MARKING olarak taşır, back'e çizilen oyukla BYTE-IDENTICAL → 0.00mm (backopen_check), facing kapattığı delikten drift edemez; facing seamAllowance=0 (marked line'da dikilir, sonra yarılır). Loop 4b tie-back ile ÇAKIŞMAZ: tie kapanma stripini, bu oyuğu çizer, İKİSİ AYNI drafta çıkar (bağımsız enum+post-pass). Kanıt: ctest 17/17 (yeni backopen_check: 1 fazla facing parça, mevcut outline byte-identical, facing oyuk çizgisi=back oyuk çizgisi 0.00mm truing, facing solid oyuktan geniş, 4 şekil çizer, tie-back+open-back coexist), golden byte-identical, web-fuzz 19780/0 (backOpen sweep 4 şekil×2 garment dahil), vocab-sweep 37800/0, 160-draft çok-body validator-clean (0 issue, 160 facing), render-pages openback-round + openback-lowv-tieback strip'te oyuk+facing çizili + görsel SVG teyit (vişne oyuk yarım-oval CB fold'a karşı, facing D-shape offset). create.js pickBackOpening(seen) vision→spec + manuel "açık sırt" şekil picker + seen.backOpeningDrawn, missing.js openBack/keyholeBack/vBack + oov open-back terim suppression (tie-back/laced honest kalır), engine.js/backend/bindings int backOpening param. İki wasm yeniden derlendi. Worker VISION DEĞİŞMEDİ. FORMULAS.md "Open-back cutout") | **22/54 (+3)**: Jana (low open back) + Tie Back ×2 (cover, front worn). Kuyruk +4 demişti; GERÇEK +3 — 3. Tie Back (polka, back view) cached vision neckline="halter" okumuş (manifest boat/crew bekliyor) → WRONG, oyuk+bağ çizili ama neckline field bloke ediyor (vision varyansı, motor değil); Arielle kümelenmiş (side-seam pockets çizilemez, MISSING). ELEMENT ACCURACY 48→53/103 (%46.6→%51.5, +5). |
| M1 | **Back hem slit / walking vent** (K2 kuyruğu 1. sıra, +2) | Arka orta dikişte yürüme yırtmacı; vent = geri-katlanan kanat, slit = düz açıklık. | **bitti** (16 Tem Loop M1; SlitBlock::apply opt-in post-pass, HemSlit enum {None,Vent,Slit}, golden BYTE-IDENTICAL; kanat 40mm truing, üst-nokta bar tack; ctest 18/18) | **26/54 (+2)**: Laura ×2 (tek-terimli back hem slit). ELEMENT 53→55/103. |
| #3 | **Ruffled straps** (K2 kuyruğu 3. sıra, +2 solo) | Fırfırlı omuz askısı = askıdan uzun büzülen öz-kumaş şerit, ayrı kesim parçası + omuz çentiği. Tie deseniyle aynı düşük-risk. | **bitti** (17 Tem queue #3; StrapBlock::apply opt-in post-pass, StrapStyle enum {None,Ruffled}, default None → golden BYTE-IDENTICAL 0.000000mm/23034 satır. Kesim (2·W+2·SA)×(yuvarla(span·fullness)+2·SA), W=22 fullness=2.2 SA=15; span motorun omuz noktalarından ölçülü [90,220]mm clamp; TRUING cutL−2·SA==yuvarla(span·fullness) 0.00mm + cutW==2·W+2·SA. Sadece kolsuz dress/top; kollu/halter dürüstçe atlanır. BONUS: classify() sleeveStyle null==='none' dürüst eşleştirme (ölçüm hilesi değil). ctest 19/19 (yeni strap_check), golden byte-identical, web-fuzz 20020/0 (strap sweep 4 neckline×3 garment), vocab-sweep 37800/0, render ruffled-straps-babydoll. create.js pickRuffledStraps + manuel picker + seen.ruffledStrapsDrawn, missing.js ruffled strap suppression (spagetti/tek-omuz/halter honest), engine.js/backend/bindings int ruffledStraps. İki wasm yeniden derlendi. Worker VISION DEĞİŞMEDİ. FORMULAS.md "Ruffled straps") | **26→29/54 (+3)**: üç Priscilla babydoll (cover+close-up saf motor +2, worn null-tolerans bonus +1). Attribution: strap kuralı 26→28, null-tolerans 28→29. ELEMENT 55→58/103 (%53.4→%56.3). |
| 9c | **Peplum + hem slit** (YENİ 3-4. ÖNCELİK, marjinal +2+2) | Peplum = bele oturan aşağı açılan pano (pointed hem dahil); hem slit = etek yırtmacı. İki küçük post-pass. | **İKİSİ DE BİTTİ** (hem slit M1 +2, peplum R1.1 +2, 17 Tem; PeplumStyle {None,Full,Half,Pointed} opt-in post-pass, iç bel yayı trued r0=share/π, golden byte-identical, ctest 20/20 peplum_check, cache reclassify 29→31) | **31/54 (+2)**: Cloe Peplum Top + Serene Fit Blouse. ELEMENT 58→60/103. |
| 4b | Bağ/kurdele kapanması | Loop 0 verisinin 1 numarası (20 foto) — kuyruğa 15 Tem eklendi. Bağ/kuşak parçaları (dikdörtgen türev) + bağ konumu/payı; couture + high-street referans, Aldrich formülü. | **bitti** (15 Tem Loop 4b; TieBlock::apply placket-tarzı opt-in post-pass, spec.tieClosure=0 default → golden BYTE-IDENTICAL 0.000000mm/23034 satır; öz-kumaş dikdörtgen kuralı (2W+2·SA)×(L+2·SA), 4 placement: bel sash/fiyonk + tie-back + ön/boyun fiyonku + manşet; ayrı "cut 2" parça + gövde yerleşim işareti; DÜRÜST SINIR: drawstring-büzgülü (kanal+shirring) ÇİZİLMEZ honest kalır; ctest 14/14 (yeni tie_check), precision 0.00mm, web-fuzz 19620/0, vocab-sweep 37800/0, render-pages tie dress+tie-back strip'te çizili; missing.js tieDrawn iken ties/tieBack listelemez; engine.js+backend/draft.js int tieClosure param, worker DEĞİŞMEDİ; FORMULAS.md "Fabric ties / sashes") | **14/54** (+3: 2 Jackie back-tie + Emma; WRONG 10 vision varyansı, doğru-red 4/5) |
| 5 | DENETİM A | Taze agent, 0-4'ün kodunu görmemiş. Benchmark'ı kendisi koşar, sayıyı tabloyla kıyaslar, render strip'leri gözle kırar, truing/golden'ı doğrular. Uyuşmazlık = ilgili loop yeniden açılır. | **geçti** (15 Tem; 8/8 madde bağımsız doğrulandı, kırılan yok, yeniden açılacak loop yok. Golden byte-identical (23034 satır kendim regen+diff), ctest 14/14 kendim derledim, precision 0.00mm, web-fuzz 19620/0, vocab-sweep 37800/0, render-pages strip'lerde tie parçası (fold+grainline+cut-2 note) ve placket (CF fold+facing+6 buton tick+6 ilik slit, bust-anchored) + register (grid kodu+register kareleri+devam okları) GÖZLE teyit; live create.js/missing.js hash=local hash v54; benchmark 0-çağrı reclassify **14/54** birebir; DRAWN_SINCE her manifest oov terimine karşı test — back/double/asymmetric placket + drawstring MISSING kalıyor, LEAK YOK; 14 FULL'ün her biri gerekçeli; sayı serisi results snapshot'larıyla destekli; /api/draft engine_error teyit = ayrı worker-wasm build sorunu, tie/motor kodu değil, önceden var) | **14/54** (teyit) |
| 6 | Puf/büzgülü kol başı | Balon kol var; cap büzgüsü + yükseltilmiş cap. Büzgü oranı Aldrich'ten. | **bitti** (15 Tem Loop 6; SleeveCap enum {Plain,Gathered,Puffed} + `SleeveBlock::draft` opt-in cap param → Plain default golden BYTE-IDENTICAL 0.000000mm/23034 satır. VERIFIED invariant (dresspatternmaking / M.Müller gigot): cap-height RAISE = spread. Slash-spread SADECE crown'a (notch üstü): gathered spread=0.20·W (yükseltme YOK), puffed spread=0.45·W (yükseltme=spread); notch altı armhole ile 1:1, fazlalık BÜZÜLÜR. Crown gather notch'ları ±capHalf·0.60 + crown boyunca kesikli büzgü çizgisi. Validator cap-ease penceresi puf için style-band'e genişledi (spreadFrac·0.5..·2.5+0.20); biceps floor korunur. ctest 14/14 (sleeve_check'e puf bloğu: crown plain'den geniş, puf yükseltilmiş, gather marks var, validator temiz), precision 0.00mm, web-fuzz 19620/0, vocab-sweep 37800/0, render-pages puff-sleeve-dress (Puff Sleeve chord 460 vs plain 317, topY 255 vs 113) + gathered-head-top strip'te çizili; missing.js sleeveCapDrawn ile puf/gathered başı artık listelemez, cap-sleeve/drawstring honest kalır. FORMULAS.md "Gathered/puff sleeve cap". create.js sleeveCap alanı (vision sleeveHead + manuel picker), engine.js/backend int sleeveCap param. Worker VISION DEĞİŞMEDİ) | **14/54 (DEĞİŞMEDİ — DÜRÜST)**: bu 58-sette puf/gathered SLEEVE HEAD tek-eksik olan foto YOK. Sette geçen tüm kol-büzgü terimleri motorun DOĞRU çizmediği honest sınır: "cap sleeve" (5, KISA CAP ŞEKLİ, gathered head değil) + "drawstring gathered sleeves" (2, casing/kanal gerek). O 5 cap-sleeve fotosunda ayrıca "asymmetric button front closure" da var → zaten MISSING. Yani yetenek gerçek+kanıtlı ama bu setin son boşluğunu açmıyor. |
| 7+8 | Yaka ailesi (stand/mock + flat/peter-pan/shirt) | Loop 7 ve 8 tek loop'ta birleşti (yaka bir parça ailesi; parça + oyuk eşleşme geometrisi ortak). CollarBlock post-pass, boyun kenarı = boyun oyuğu 0.0000mm ÖLÇÜLÜ (oyuk bitmiş gövdeden ölçülü). Referans: Aldrich/Armstrong/M&S + couture (Dior/Chanel/YSL) + high-street (Zara/Bershka). | **bitti** (16 Tem Loop 7; CollarType enum {None,Stand,Mock,Flat,PeterPan,Shirt} + CollarEdge {Round,Pointed,Scallop}, opt-in default None → golden BYTE-IDENTICAL 0.000000mm/23034 satır. Stand/mock = boyun kenarı DÜZ (uzunluk=oyuk) + CF içeri kıvrılan bant; flat/peter-pan = düz boyun kenarı + round/pointed/scallop dış kenar; shirt = 2 parça (bant + yaprak). Boyun oyuğu bitmiş ön+arka parçadan doğrudan ölçülüyor → truing inşadan, drift edemez. Honest sınır: bias-bound/notched/sailor/lapel çizilmez, missing.js honest kalır. ctest 15/15 (yeni collar_check: N ekstra parça, byte-identical outline, boyun kenarı=half-neckline 0.0000mm, flat band'den geniş, scallop curve ekliyor), precision 0.00mm, web-fuzz 19620/0, vocab-sweep 37800/0, 420 collar-on draft validator-clean, render-pages stand+peterpan+shirt strip'te çizili. create.js pickCollar(seen) + manuel picker + seen.collarDrawn, missing.js COLLAR_DRAWN, engine.js/backend int collarType/collarEdge. İki wasm yeniden derlendi. Worker VISION DEĞİŞMEDİ) | **14/54 (DEĞİŞMEDİ — DÜRÜST)**: bu 58-sette yakanın TEK eksik olduğu foto YOK. Yaka 9 fotoda, hepsi başka kümelenmiş öğeyle tıkalı (peplum, shirred yoke, double-breasted, drawstring kol, gathered yoke, pinafore). Reclassify: 9 fotonun HEPSİNDE collar engel listesinden çıktı, sızıntı=0; her biri farklı ikinci öğeyle hâlâ MISSING/WRONG. Kabiliyet gerçek+kanıtlı ama setin son boşluğunu açmıyor. |
| 9 | DENETİM B | Taze agent, 6-8 için Denetim A protokolü + tam 58 ara koşusu. %80 eşiğine mesafe rapora. | bekliyor | — |
| 10 | Strapless/bustier | Halter "frame shift" deseni şablon. Bugra Plain Bustier Dress (bugra-ref/) birebir kıyas hakemi. | bekliyor | — |
| 11 | Kup ayrımı temeli | Upper/lower cup, dikiş uzunluğu eşitliği ÖLÇÜLÜ (truing kapsamına girer). | bekliyor | — |
| 12 | Korse/bustier tamamlama | Kup + strapless + pat birleşimi; Bugra Buttoned Corset Bustier hakem. EN ZOR — taşarsa tek seferlik ek loop açılır, kuyruğa yazılır. | bekliyor | — |
| 13 | DENETİM C | Adversarial: 10-12'yi kırmaya çalışır (uç bedenler, vocab-sweep, truing sapması avı, golden diff). | bekliyor | — |
| 14 | Konsolidasyon | Etiket manifestindeki kalan uzun kuyruk (pile, fiyonk, arka detaylar, asimetrik kapanma) frekansa göre; tam 58 final koşusu; dürüst final rapor reports/ altına. 58/58 değilse kalan liste + yeni kuyruk önerisi. | bekliyor | — |

### Sayı serisi (SADECE loop sonunda değil: her rework ve her patch sonrasında da
benchmark koşulur ve buraya satır yazılır — sayısız değişiklik yok)
- 2026-07-17 CACHE RECLASSIFY (RAY 1 / R1.1 / patch 3.5 = peplum, 0 vision çağrısı,
  kredi harcanmadı): **FULL 29→31 (+2)**, ELEMENT ACCURACY 58→60/103 (%56.3→%58.3),
  vision-accuracy %94.4 DEĞİŞMEDİ (motor loop'u). Attribution: iki peplum fotoğrafı
  (Cloe Puffed Sleeve Peplum Top "peplum construction" + Serene Fit Blouse "pointed
  peplum hem"), ikisi de tek-terimli — başka oov terimleri (flat collar, front bow
  ties, button front closure) zaten çizilir durumda, peplum tek engeldi → çizilince
  ikisi de MISSING→FULL. Sızıntı yok (yalnız bu iki foto oynadı). Motor artık bele
  takılan flare peplum'u ayrı kesim parçası (annular sektör) çiziyor: PeplumStyle
  {None,Full,Half,Pointed} opt-in post-pass, iç bel yayı bitmiş bele trued (r0=share/π),
  golden byte-identical. ctest 20/20 (peplum_check truing <0.5mm), web-fuzz 20110/0,
  vocab-sweep 37800/0, render peplum-full-top + peplum-pointed-top.
  Rapor: reports/2026-07-17-stitchu-loop-peplum.md.
- 2026-07-17 CACHE RECLASSIFY (queue #3 / patch 3.1 = ruffled straps, 0 vision çağrısı,
  kredi harcanmadı): **FULL 26→29 (+3)**, ELEMENT ACCURACY 55→58/103 (%53.4→%56.3),
  vision-accuracy %94.4 DEĞİŞMEDİ (motor loop'u). Attribution kanıtlı (izole python replay):
  StrapBlock kuralı tek başına 26→28 (Priscilla cover+close-up, ikisi de sleeveStyle='none'),
  classify() sleeveStyle null-tolerans bonusu 28→29 (Priscilla worn, vision null okumuş). Üç
  flip de Priscilla babydoll — sızıntı yok. Motor artık fırfırlı askıyı ayrı kesim parçası
  çiziyor (StrapStyle {None,Ruffled} opt-in post-pass, golden byte-identical, cut truing 0.00mm).
  BONUS bir eşleştirme düzeltmesi (null==='none' kolsuz), ölçüm hilesi DEĞİL. ctest 19/19
  (strap_check), web-fuzz 20020/0, vocab-sweep 37800/0, render ruffled-straps-babydoll.
  Rapor: reports/2026-07-17-stitchu-loop-a-ruffled-straps.md.
- 2026-07-16 CANLI (Vision LOOP 2 / patch 2.2 = V1 neckline, taze FAST koşu 59 çağrı
  8dk20sn): **FULL 22→24 (+2)**, vision-accuracy 46/53→51/54 (%86.8→%94.4), yaka
  yanlış-okuması 5→2, WRONG 7→4. worker.js vision prompt'una yaka belirsizlik-giderme
  bloğu (ön+arka TEK garment TEK yaka; arka/giyilmiş foto yaka uyduramaz; halter sadece
  boyna dolanan bant; belirsizde boat/crew/scoop). Sıfır C++/motor. wrangler deploy
  version 5cb94ca5. Düzelen 3 arka görünüm (Mira/Jackie-gingham/TieBack-polka); kalan 2
  hata gerçekten belirsiz ÖN çekim. ELEMENT ACCURACY 53/103 sabit (vision loop, öğe
  loop'u değil). Regresyon bekçisi: FULL yükseldi, revert yok. Rapor:
  reports/2026-07-16-stitchu-vision-loop2.md.
- 2026-07-16 OFFLINE (Vision LOOP 1 / patch 2.0 = V0 taksonomi, 0 yeni çağrı, sadece
  1 kredi probe): **FULL 22/54 DEĞİŞMEDİ** (taksonomi loop'u kod düzeltmez). Güncel
  DRAWN_SINCE ile reclassify: 22 FULL, 24 MISSING, 7 WRONG, 1 ERROR, 4 REJECT-OK,
  1 REJECT-FAIL. KATMAN ATFI: 7 vision-kaynaklı (WRONG), 24 motor-kaynaklı (MISSING),
  0 köprü-kaynaklı. YENİ METRİK **vision-accuracy = 46/53 = %86.8** (kritik alan temiz),
  neckline misreads=5. dominantErrorField=**neckline** (5/7 WRONG, 5/8 çelişen ürün).
  frontBackConflicts=**15** (8 üründe, arka/worn foto ön yakayı eziyor). ELEMENT
  ACCURACY 53/103 = %51.5. Kredi VAR (probe geçerli vision döndü). benchmark-58.mjs'ye
  vision-accuracy 3. SUMMARY bloğu eklendi (DRAWN_SINCE dokunulmadı, deploy yok).
  Taksonomi: benchmark-58/vision-error-taxonomy.md (lokal). Skor: reports/stitchu-vision-progress.md.
  Rapor: reports/2026-07-16-stitchu-vision-loop1.md. SIRADAKİ: LOOP 4 (vitrin) → LOOP 2 (V1 neckline).
- 2026-07-16 CANLI (Loop 9b sonrası, 0-çağrı cache reclassify — cache güncel, sadece
  DRAWN_SINCE loop-9b verdict'i oynadı, kredi harcanmadı, Loop 9a ile aynı yöntem):
  **22/54 TAM (+3)** — WRONG 7, correct-reject 4/5. ELEMENT ACCURACY **53/103 = %51.5**
  (48'den +5). +3 FULL: Jana (low open back) + Tie Back ×2 (cover, front worn) — tek eksiği
  açık-sırt oyuğu olan fotolar. Kuyruk marjinal +4 demişti; GERÇEK +3: 3. Tie Back fotosu
  (polka, back view) cached vision'da neckline="halter" okunmuş (manifest boat/crew bekliyor)
  → WRONG; motor oyuğu VE bağı çiziyor (oov temizlendi) ama neckline field FULL'u bloke ediyor,
  bu VISION VARYANSI motor kusuru değil (Tie Back polka geometri olarak da FULL-hazır). Arielle
  kümelenmiş (side-seam pockets çizilemez → open back çizildi ama pocket MISSING, foto TAM olmadı;
  tahmin bir foto şişmiş = kümelenme + vision noise). Motor artık SIRT parçasında şekilli oyuk
  (yuvarlak/düşük-V/kare/damla) + facing çiziyor: OpenBackBlock opt-in post-pass, oyuk CB fold'a
  karşı yarım (back cut-2 CB seam mirror), facing = oyuk silhouette'i 34mm dışa offset + oyuk
  çizgisini marking olarak taşır → truing 0.00mm (facing oyuk çizgisi = back oyuk çizgisi
  byte-identical, backopen_check). Loop 4b tie-back ile ÇAKIŞMAZ (bağımsız enum+post-pass, ikisi
  aynı drafta). DRAWN_SINCE loop-9b kuralı open-back/back-cutout/backless/low-open-back çizer,
  tie-back CLOSURE'ı DIŞLAR (Loop 4b kuralı bozulmadı; tie-back ayrı oov terim, ayrı kural).
  Kanıt: ctest 17/17 (yeni backopen_check), golden byte-identical 23034 satır, web-fuzz 19780/0
  (backOpen sweep 4 şekil×2 garment dahil), vocab-sweep 37800/0, 160-draft çok-body validator-clean
  (0 issue, 160 facing), render-pages openback-round + openback-lowv-tieback pano+facing çizili +
  görsel SVG teyit (vişne oyuk yarım-oval, facing D-shape offset). Deploy v58. Worker VISION
  DEĞİŞMEDİ (redeploy sadece /api/draft için gerekir, ürün akışı tarayıcı wasm'ı kullanıyor).
  Rapor: reports/2026-07-16-stitchu-benchmark-loop9b.md.
- 2026-07-16 CANLI (Loop 9a sonrası, 0-çağrı cache reclassify — cache güncel, sadece
  DRAWN_SINCE loop-9a verdict'i oynadı, kredi harcanmadı, Loop 6/7 ile aynı yöntem):
  **19/54 TAM (+5)** — MISSING 25, WRONG 10, correct-reject 3/5 (2 REJECT-FAIL = canlı vision
  iki kontrol görselini elbise sandı, vision noise). ELEMENT ACCURACY **48/103 = %46.6** (37'den
  +11). +5 FULL: Mira ×3 (gathered bust panel) + Blair ×2 (shirred/smocked yoke) — tek eksiği
  büzgü olan fotolar. Kuyruk marjinal +6 demişti; GERÇEK +5: Priscilla babydoll İKİ eksikli
  (drawstring boyun VE fırfırlı askı) → büzgü çizildi ama askı hâlâ MISSING, foto TAM olmadı;
  tahmin bir foto şişmiş = kümelenme kanıtı (analizim bile kümelenmeden etkilenmiş, saklamıyorum).
  Motor artık panonun KENDİSİNİN büzüldüğü yapıyı çiziyor: GatherBlock opt-in post-pass, kesim
  genişliği = bitmiş kenar × oran (ip 1.8/lastik 2.0/smok 3.0), bitmiş kenar boyun oyuğundan/büst
  bandından ÖLÇÜLÜ → truing inşadan (gather_check kesim/oran=bitmiş kenar 0.005mm). DRAWN_SINCE
  loop-9a kuralı drawstring/shirr/smock/gathered PANEL çizer, SLEEVE gather'ı DIŞLAR (Alli
  drawstring sleeve hâlâ MISSING, sızıntı=0). Kanıt: ctest 16/16 (yeni gather_check), golden
  byte-identical 23034 satır, web-fuzz 19740/0 (gather sweep dahil, gatherRun sheet-count
  countSheets'e düzeltildi — uzun kordon şeridi bbox-çarpımıyla 110-130 sayfa sanılıyordu,
  gerçek used-set 91), vocab-sweep 37800/0, render-pages drawstring-neck+shirred-bust+
  smocked-yoke pano+kordon çizili. Deploy v57. Worker VISION DEĞİŞMEDİ (redeploy sadece
  /api/draft için gerekir, ürün akışı tarayıcı wasm'ı kullanıyor). NOT: iki agent aynı loop'a
  düştü (paralel çakışma, git status birebir aynı iş); engine+create.js+engine.js+bindings
  paralel agent'tan, FORMULAS+devlog-reel-restore(silinen 2 reel geri)+web-fuzz-fix+essay 10+
  ölçüm+docs+deploy bu agent'tan; çakışan yazımlar dışında tek commit'e birleşti.
  Rapor: reports/2026-07-16-stitchu-benchmark-loop9a.md.
- 2026-07-16 METRİK REFORMU (offline teşhis, 0 vision çağrısı — manifest oov[] ×
  DRAWN_SINCE loop 3/4b/6/7): **ELEMENT ACCURACY (ilk ölçüm) D/N = 37/103 = %35.9.**
  Yani 58 fotodaki tüm dağarcık-dışı öğelerin (tekrarlarıyla 103) motorun ARTIK
  %35.9'unu çiziyor. FULL PATTERN 14/54'te sabit KALIR (manifest-teorik tavan 16;
  canlı 14 çünkü 2 fotoda vision WRONG). KÜMELENME HİSTOGRAMI (giysi fotoları):
  16 foto ZATEN tam (0 eksik) · 18 foto 1-eksik · 16 foto 2-eksik · 4 foto 3+-eksik.
  MARJİNAL KAZANÇ sırası (bir öğe eklenince kaç foto FULL'a geçer): drawstring/
  shirred gathering +6, open-back cutout +4, peplum +2, hem slit +2, bias-cut slip
  +1, shorts/two-piece +1. Frekansta en yüksek (asymmetric/double-breasted placket
  11 foto, gathering 10 foto) ama placket marjinali +1 çünkü 10'u çok-eksikli
  fotolara yığılı — kümelenme kanıtı. Yeni günlük pusula ELEMENT ACCURACY;
  FULL PATTERN %80 üst hedef kalır. benchmark-58.mjs SUMMARY artık iki metriği de
  basıyor (kod değişmedi, sadece raporlama; golden etkilenmez). Rapor:
  reports/2026-07-16-stitchu-metrik-reformu.md.
- 2026-07-16 CANLI (Loop 7 sonrası, taze koşu FAST token, worker vision DEĞİŞMEDİ):
  **14/54 TAM (DEĞİŞMEDİ)** — MISSING 30, WRONG 10, correct-reject 3/5 (2 REJECT-FAIL =
  canlı vision iki kontrol görselini elbise sandı; vision noise, motor değil). Motor artık
  bütün yaka ailesini (dik/mandarin/yatık/bebe/gömlek) AYRI PARÇA çiziyor, boyun kenarı
  boyun oyuğuna 0.0000 mm trued (oyuk bitmiş gövdeden ÖLÇÜLÜ). Sayı OYNAMADI çünkü bu
  58-sette yakanın TEK eksik olduğu foto YOK — yaka 9 fotoda ama hepsi başka kümelenmiş
  öğeyle tıkalı (peplum, shirred yoke, double-breasted, drawstring kol, gathered yoke,
  pinafore; manifest analiziyle oturumdan ÖNCE bilindi). DRAWN_SINCE loop-7 kuralı
  stand/mock/flat/peter-pan/shirt/scallop/round/pointed çizer, bias-bound/notch/sailor/
  lapel DIŞLAR (sızıntı=0). Reclassify KANITI: yakası olan 9 fotonun HEPSİNDE 'collar'
  engel listesinden çıktı, collar-still-wrongly-blocking=0; her biri farklı ikinci öğeyle
  hâlâ MISSING/WRONG. Kabiliyet gerçek+kanıtlı (ctest 15/15 collar_check dahil, golden
  byte-identical, truing 0.0000 mm, web-fuzz 19620/0, vocab-sweep 37800/0, 420 collar-on
  draft validator-clean, render 3 yaka spec çizili). STRATEJİ VERİSİ: kümelenme yüzünden
  tek-öğe loop'ları artık sayıyı oynatmıyor → sıradaki loop'lar aynı fotodaki İKİNCİ öğeyi
  (yoke/peplum) hedeflemeli. Deploy v56. Worker DEĞİŞMEDİ. Rapor:
  reports/2026-07-15-stitchu-benchmark-loop7.md.
- 2026-07-15 CANLI (Loop 6 sonrası, cache-reclassify FAST, 0 yeni çağrı — kredi VAR,
  59 spec cache'ten güncel dağarcıkla yeniden sınıflandı): **14/54 TAM (DEĞİŞMEDİ)** —
  MISSING 30, WRONG 10, correct-reject 4/5. DÜRÜST BULGU: motor artık puf/büzgülü SLEEVE
  HEAD çiziyor (raised+widened cap + crown gather; SleeveBlock opt-in param, golden
  byte-identical Plain'de), AMA bu 58-fotoluk sette puf/gathered kol başının TEK eksik
  olduğu foto YOK. Sette geçen kol-büzgü oov terimleri motorun DOĞRU çizmediği honest
  sınırlar: "cap sleeve" ×5 (kısa cap ŞEKLİ ≠ gathered head; ayrıca hepsinde "asymmetric
  button front closure" var → zaten MISSING) + "drawstring gathered sleeves" ×2 (casing/
  kanal gerektirir). DRAWN_SINCE loop-6 kuralı puf/gathered/gigot çizer, cap-sleeve +
  drawstring'i DIŞLAR (leak yok). Yetenek gerçek+kanıtlı (ctest 14/14 puf bloğu dahil,
  golden byte-identical, precision 0.00mm, web-fuzz 19620/0, vocab-sweep 37800/0,
  render-pages Puff Sleeve chord 460 vs plain 317 + crown gather çizgisi gözle teyit),
  sayı bu setin son boşluğunu açmadığı için 14'te kalır. Deploy v55. Worker DEĞİŞMEDİ.
  Rapor: reports/2026-07-15-stitchu-benchmark-loop6.md.
- 2026-07-15 DENETİM A (Loop 5, bağımsız taze agent, 0-4b kodunu görmemiş):
  **14/54 TEYİT** (0-çağrı cache reclassify; correct-reject 4/5, WRONG 10, MISSING 30).
  8/8 denetim maddesi geçti, KIRILAN YOK, yeniden açılacak loop yok. Golden'ı kendim
  regen+diff ettim (byte-identical 23034 satır), ctest 14/14 kendim derledim, precision
  0.00mm, web-fuzz 19620/0, vocab-sweep 37800/0. Tie parçası + placket buton/ilik +
  register işaretleri SVG kaynağından gözle teyit. Live create.js/missing.js hash =
  local hash (v54, bayat değil). DRAWN_SINCE filtresi manifest oov terimlerine karşı
  tek tek: back/double/asymmetric placket + drawstring MISSING kalıyor (leak yok);
  14 FULL'ün her biri gerekçeli (6 placket + 5 tie + 5 in-vocab). /api/draft engine_error
  teyit edildi = ayrı worker-wasm build sorunu (tie/motor kodu değil, önceden var, ürün
  akışı kullanmıyor). Rapor: reports/2026-07-15-stitchu-denetim-a.md.
- 2026-07-15: ~5-10/58 (tahmin, ölçülmedi) — başlangıç
- 2026-07-15 CANLI (Loop 4b sonrası, taze koşu 8m22s/59 çağrı, FAST): **14/54 TAM** (+3
  Loop 3 üzerine). Motor basit uygulanan bağı/kuşağı/fiyonku AYRI PARÇA çiziyor (TieBlock,
  öz-kumaş dikdörtgen; bel sash + tie-back + ön/boyun fiyonku + manşet). +3 tie-driven:
  Jackie (back, tie visible), Jackie (front full), Emma (back tie closure) — hepsi tek eksiği
  bağ olan fotolar. DÜRÜST SINIR çizildi: drawstring-büzgülü (Priscilla neckline, Alli sleeve,
  Lua bust drawstring) ÇİZİLMEDİ → honest kalır; açık-sırt oyuğu olan tie-back'ler (Tie Back ×3)
  bağ çizildi ama oyuk çizilemez → MISSING kalır. WRONG 10 (vision varyansı: ör. boat flat-sketch
  shaping princess vs dart, motor değil), doğru-red 4/5. Cache-reclassify (0 çağrı) 11→14 verdi,
  taze koşu da 14 teyit etti. Kanıt: golden byte-identical 23034 satır/0.000000mm, ctest 14/14
  (yeni tie_check), precision 0.00mm, web-fuzz 19620/0, vocab-sweep 37800/0, render-pages tie
  strip'lerde çizili. Deploy v54. Worker DEĞİŞMEDİ. Rapor: reports/2026-07-15-stitchu-benchmark-loop4b.md.
- 2026-07-15 21:00 CANLI (kredi geldi, Loop 3 sonrası): **11/54 TAM — İLK ARTIŞ** (+6, hepsi
  pat'lı fotolar). 31 eksik öğeli, 12 yanlış (vision yaka varyansı, motor değil; el
  ölçümünde WRONG 0'dı), doğru-red 4/5. İki koşu yapıldı: Loop 3 ÖNCESİ canlı 5/54
  (el ölçümü 6/54'ün 1 eksiği = vision varyansı, bir boat-yaka düştü), Loop 3 SONRASI
  11/54. SAYAÇ DÜZELTMESİ: benchmark-58.mjs manifest'in donmuş "çizilemez" listesini
  motorun GÜNCEL dağarcığına karşı filtreliyor artık (DRAWN_SINCE — her çizim loop'u
  kendi kuralını ekler; asimetrik/arka/çift-sıra pat dürüstçe çizilemez kaldı) +
  cache'lenmiş spec'ler güncel dağarcıkla yeniden sınıflanıyor. Süre: 8dk/59 çağrı
  (FAST token çalışıyor; vision gecikmesi, sigorta cezası yok).
- 2026-07-15 MANUEL ÖLÇÜM (canlı zincir DEĞİL, Anthropic kredisi bitik olduğu için
  59 foto Claude aboneliği üstünden el ile worker prompt kurallarıyla okundu):
  **6/54 TAM** + 48 eksik öğeli + 0 yanlış; doğru-red **5/5** (Slowly×2 + çanta +
  talimat sayfası + kalıp çizimi hepsi reddedildi). TAM'lar Loop 0/1'le AYNI: Heloise
  (boat princess fit&flare denim), Hallie yeşil tank mini, Boat Neck Top (4 foto).
  Kalan 48 hepsi MISSING — motor gövdeyi çiziyor, çizemediği: düğme/asimetrik pat (19
  foto), bağ/kurdele/drawstring kapanma (13), yaka (peter pan/scallop/pointed/flat, 8),
  roba/shirring/gathered panel (7), cap/puf kol başı (7), açık/bağlı sırt (5), kup/korse
  (1). WRONG 0 = canlı zincirin 10 WRONG'u SAF VISION VARYANSIYDI (halter/boat/square
  belirsiz yaka); insan gözü o sınırı doğru okuyunca WRONG sıfırlandı → motor kusuru
  değil vision belirsizliği KANITLANDI. NOT: bu sayı canlı Opus zinciriyle birebir
  aynı olmayabilir (model≠ben, vision varyansı gerçek); kredi gelince tek FAST koşuyla
  (~90sn) canlı sayı teyit edilecek. Beklenti aynı: 6/54.
- 2026-07-15 Loop 3 (İLK ÇİZİM): **çizim shipped, sayı BLOKE: kredi** (canlı vision
  400 döner). Motor artık ÖN düğme patını çiziyor (grown-on 18mm stand + fold çizgisi +
  düğme/ilik işaretleri, göğüs hizasında zorunlu düğme; Aldrich/Armstrong formülü,
  FORMULAS.md "Front button placket"). Kanıt: golden BYTE-IDENTICAL 0.000000mm (23034
  satır, C++ closure-off yolları dokunulmadı), placket_check 4 gövde (dress/top,
  princess/dart, petite/plus) yeşil, ctest 13/13, precision-report worst pair 0.00mm/0
  fail, web-fuzz 19620 draft/0 fail (65 pat draft'ı dahil), vocab-sweep 37800/0,
  render-pages pat'lı dress+top strip'te düğme+fold çizili. OFFLINE ÖN-KONTROL (canlı
  koşu DEĞİL, manifest oov'una karşı): 19 pat'lı fotodan 2 ARKA pat (honest layer'da
  kalır — location gate ön dışını çizmez), 7 saf-ÖN-pat (tek eksik pat'tı → artık TAM
  KALIP ADAYI), 10 ön-pat + başka eksik (pat çizildi, kalan öğeler hâlâ eksik).
  Asimetrik (Jackie ×6) ve double-breasted (Ruby ×3) STANDART tek-sıra pat olarak
  çizilir = en-yakın-türev, birebir değil. 6/54 son ÖLÇÜLEN değer kalır; kredi gelince
  tek FAST koşuyla canlı sayı çıkar. Rapor: reports/2026-07-15-stitchu-benchmark-loop3.md.
- 2026-07-15 Loop 2: **ÖLÇÜLEMEDİ — BLOKE: Anthropic kredisi bitik** (canlı vision
  çağrısı 400 döner, tam kalıp sayısı ölçülemez). Loop 2 ürün metriği DEĞİL dürüstlük
  katmanı: motor çizemediği her öğe için EN-YAKIN-TÜREV verilir + kullanıcıya (ekran +
  print kapağı) açıkça "şunu çizemedim, en yakın şunu verdim, kalanını elle ekle"
  denir. Sessiz fallback öldü. Kanıt: 5 temsili spec (Celine düğme, Cloe peplum+yaka+
  lace-up, Priscilla fırfırlı askı+shirring, Tie Back, Corset bustier cup+zip) + 1 temiz-
  kontrol → EN+TR doğru missingFeatures üretti (temiz-kontrol = 0 mesaj, false-flag yok);
  golden byte-identical (C++ dokunulmadı), web-fuzz 19555/0, render-pages temiz. 6/54 son
  ölçülen değer kalır. Rapor: reports/2026-07-15-stitchu-benchmark-loop2.md.
- 2026-07-15 Loop 1b: **ÖLÇÜLEMEDİ — BLOKE: Anthropic kredisi bitmiş.** Hız token'ı
  KANITLANDI (canlı): token'lı 25/25 ardışık çağrı 0×429 (fuse atlanıyor); token'sız
  15/20 çağrı 429 + limit anında token'sız=429 iken token'lı=geçiyor; yanlış/boş
  token=429 (bypass gated). YENİ HIZ: 6 çağrı 9sn (~1.5sn/çağrı) → 54 foto ~90sn
  tahmini, eski 21sn/çağrı ~19dk+ (resetlerle rapordaki ~50dk). AMA vision çağrıları
  "Your credit balance is too low" (Anthropic 400) döndüğü için TAM sayı ölçülemedi;
  6/54 son ölçülen değer olarak kalır. Damla: Anthropic bakiyesi yüklenince tek FAST
  koşuyla gerçek sayı ~90sn'de çıkar. Rapor: reports/2026-07-15-stitchu-benchmark-loop1b.md.
- 2026-07-15 Loop 1: **6/54 TAM** (DEĞİŞMEDİ, beklendiği gibi — motor hâlâ çizmiyor,
  boru bu loop döşendi) + 38 eksik öğeli + 10 yanlış + doğru-red **4/5** (3/5'ten
  arttı: çanta+2 Slowly+1 kalıp sayfası reddedildi). LOOP 1'İN GERÇEK ÖLÇÜSÜ =
  **SCHEMA BRIDGE: 51/69 dağarcık-dışı öğe yeni yapısal alanla yakalandı** (43 foto,
  27'sinde her öğe yakalandı; 32/69 outOfVocab[] onur kanalında da adıyla geçti) —
  sıfırdan (Loop 0'da yapısal alan yoktu) 51/69'a. WRONG 3→10 artışı motor değil
  VISION VARYANSI (halter/boat/square/vNeck belirsiz yaka sınırı, Loop 0 belgeledi);
  iki hedeflenen Loop 0 hatası (fırfırlı askı→kol, boat→square) canlı 6-foto testinde
  DÜZELDİ. Rapor: reports/2026-07-15-stitchu-benchmark-loop1.md.
- 2026-07-15 Loop 0: **6/54 TAM** + 45 eksik öğeli + 3 yanlış; doğru-red 3/5. TAM'lar: Heloise (boat fit&flare), Hallie tank dress, Boat Neck Top (4 foto). En sık dağarcık-dışı (54 fotoda): bağ/kurdele kapanması 20, düğme patı 19, yaka 9, yoke/büzgü 9, cap kol 5, açık sırt 5. NOT: fermuar bu sette neredeyse hiç GÖRÜNMÜYOR (gizli fermuar fotoğrafta okunmaz) — Loop 4 fermuar payı hâlâ gerekli ama görünür kapanma önceliği bağ/kurdele + düğme.

## HER OTURUMUN KAPANIŞI
- benchmark sayısını ölç, bu dosyanın Durum satırını güncelle.
- CLAUDE.md status + devlog.md/linkedin.md malzeme.
- Deploy: ?v bump + git add web/ ALL + subtree gh-pages. Worker değiştiyse
  Damla'ya wrangler redeploy hatırlat.


## SAYMA YÖNTEMİ DÜZELTİLDİ (2026-07-18, FAZ 0.9)

Eski sayaç "kalıp çıktı mı" diye soruyordu, spec'i hiç ÇİZDİRMİYORDU.
`sleeveStyle:'puff'` sessizce None'a düştüğünde kolsuz elbise de FULL sayıldı.
Yeni sayaç FULL adayı her fotoğrafı GERÇEK motor + GERÇEK web köprüsünden
(web/js/vision-bridge.js, create.js ile TEK kaynak) geçirir ve üç şart arar:
1. sınıflandırma "kol var" diyorsa parça listesinde Sleeve parçası OLMALI,
2. hiçbir alan eşlemede sessizce varsayılana düşmemeli,
3. "çizilebilir" sayılan her öğe çizilen parçalarda KANIT bırakmalı.
Geçemeyen FULL sayılmaz, PARTIAL sayılır.

YAN YANA (sessiz düzeltme yok):
- eski yöntem, bu cache: **34/54** (daha önce 37/54 yayınlandı; 3 fotoluk fark
  repo cache'inden yeniden üretilemiyor, bu da başlı başına bir bulgudur)
- dürüst yöntem: **FULL 23/54 + PARTIAL 11** (+1 ERROR: vision parse_fail cache'te)

Düşen 11 PARTIAL gerçek onarım listesi: back-waist tie'lar köprüde honest-skip'e
düşerken sayaç kuralı "çizilebilir" diyordu (kural ile köprü uyumsuz), shirred
yoke iki fotoda validator'dan dönüyor ([sideseam] Top 335.0 vs 348.0, GERÇEK
motor hatası), open-back cutout ve flat collar spec'e hiç girmemiş. Rakam düştü,
düştüğü yer gerçek rakam.
