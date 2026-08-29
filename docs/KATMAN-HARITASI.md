# KATMAN HARİTASI — kim kimi okur, kim kimi OKUYAMAZ? (2026-08-10)

> Amaç: her arıza TEK katmana mühürlenebilsin. Yasak-okuma zabıtası
> `scripts/katman-lint.py`. Kural: her katman sadece bir ALTININ
> KONTRAT ÇIKTISINI okur — içini asla.

## Katmanlar?

| Katman | Ne | Mevcut dosyalar | Kontrat çıktısı | OKUYAMAZ |
|---|---|---|---|---|
| **L0 VÜCUT** | Tek vücut gerçeği | `contract/figure-bands.json` (figur_croquis), `engine/src/bodysurface.{cpp,hpp}`, `engine/pattern-bridge/bodies/mean_all.yaml` | `contract/layers/body.EU38.json` (26 ölçü + girth mm + croquis px↔mm kalibrasyonu) | üst katmanların hiçbirini |
| **L1 TASARIM** | Stil uzayı (vücutsuz) | atolye state (46 kadran), `engine/flat-engine/styles.json`, `contract/figure-bands.json garment_ease` (bel/gogus çarpanları) | design-state JSON — **içinde mm YASAK**, sadece oran/enum/çarpan | L0'ın mm'lerini |
| **L2 GİYSİ YÜZEYİ** | vücut+tasarım → 3B shell | `engine/src/garmentshell.{cpp,hpp}`, `drape.{cpp,hpp}`, `volume.hpp` | shell ölçüm raporu: `rings.waist_mm` TEK SAYI, bust/hip, ease hacmi | L3/L4'ü |
| **L3a FLAT (croquis hattı)** | Yüzeyin çizimi | `engine/flat-engine/_engine-full.mjs` (referans kalem, 31 stil, SALT-OKUNUR), `engine/tools/render-garment-flat.mjs` (üretim kalemi) | SVG. ⚠ **"ölçüsüz" artık iki kalem için ayrı ayrı okunur (24 Ağu, V4):** üretim kalemi `data-scale="1:3"` + `data-unit-mm="3"` + `data-croquis` + `data-ref-size` beyan ediyor ve kanunu `contract/flat-convention-v1.json`; referans kalem **31 stilin 0'ında** `data-scale` beyan ediyor ve stilize kalıyor | kalıp dünyasından HİÇBİR ŞEYİ (`body.yaml`, specification, mapping) |
| **L3a′ FLAT (kabuk projeksiyonu)** ★ 24 Ağu | Yüzeyin İZDÜŞÜMÜ — çizim değil | `engine/src/shellprojection.{cpp,hpp}`, alet `engine/build/shell-flat` | JSON: 6 ölçü mm + ön/arka kontur + halka aralığı; `--svg` ile `data-scale="1"` 1:1 SVG | — **L2'nin kabuğunu DOĞRUDAN okur** (aynı `GarmentSurf`), bu istisna kasıtlı |
| **L3b KALIP** | Yüzeyin düzleştirilmesi | `engine/src/bodice.cpp` vb., `engine/pattern-bridge/mapping.py`, GarmentCode (kara kutu). ⚠ **L3b İKİYE AYRILDI (25 Ağu, V5-Z §5):** "yüzeyin düzleştirilmesi" (`surfacepattern.cpp` + `flatten.cpp`) YALNIZ native ctest'te koşuyor; alıcıya giden hat eski 2B blok çizicisi `engine/src/garment.cpp` `GarmentDrafter::draft`. Ayıran ölçüm md.9 | `stitchu_specification.json` + panel kenar uzunlukları mm | `figur_croquis`'i doğrudan; kalemi |
| **L4 DOĞRULAMA** | Hakem | `engine/pattern-bridge/walk.py`, `printpack.py`, `test_seamdeed.py` | tapu + print-report | üretici katmanların İÇİNİ |

## Bugünkü bilinen ihlaller / boşluklar (lint --report envanteri günceller)?

1. **L0 ÇİFT KAYNAK:** flat vücudu `figur_croquis`'ten (px), kalıp vücudu `mean_all.yaml`'dan (cm)
   okuyor; ikisinin tutarlılığını ölçen tek test H0'dır (harness). Ömürlük çözüm: tek
   `contract/layers/body.EU*.json` → ikisi de oradan.
2. **L3b İKİ BEL PARAMETRESİ:** `mapping.py` bodice ve etek beline ayrı değer basıyor; toplam bel
   kontrolü yok → 2.95mm / 17 kombinasyon arızası (kanıt `Logs/paket-2026-08-06`). Harness H3b-rings
   bu sınırın bekçisi. Kök çözüm Faz C (bel = 3B'de tek spline).
3. **L3a↔L3b köprüsü sadece pinli makas:** `preview-truth` stilizasyon makasını ölçüp pinliyor;
   makası kapatan şey değil. Kök çözüm Faz C (ikisi tek yüzeyden türetilir).
   ⚠ **KISMEN AŞILDI 24 Ağu (V3):** yeni **L3a′** satırı tam olarak o kök çözümün ilk parçası —
   dış kontur artık kalıbın kesildiği AYNI kabuktan (`GarmentSurf`) ortografik izdüşümle
   hesaplanıyor, stilize edilmiyor. Ama **eski L3a hattı silinmedi ve makas kapanmadı**: iki hat
   yan yana duruyor, aynı EU38 belinde farklı sayı taşıyorlar (croquis sıfır bolluk, kabuk
   bolluklu). Bugünkü farkı basan kapı `node engine/tests/flat_pattern_agree_check.mjs`.
4. **L3a′ ↔ L3b altı ölçünün üçünü kıyaslayamıyor:** kalıp tarafı STRAPLESS bir giysi üretiyor,
   kabuk projeksiyonu omuz halkasından başlıyor. `bust`/`neck_opening_width`/`shoulder_width`
   kalıp tarafında ölçülecek kenar bulamıyor ve `null` + sebep dönüyor
   (`engine/tools/pattern-measure.mjs`). Tek kök: açık G5 işi (omuz/oyuk/yaka yüzeyde).
   Kapı bu boşluğu her koşuda adıyla sayıyor ve 3'te ratchet'liyor.
5. **Kabuk siluetinde belde teğet kırığı var:** bel yüksekliğinin üstünde skim zarfı, altında
   halka interpolasyonu, aralarında hiçbir teğet koşulu yok. Sayıyı basan kapı
   `node engine/tests/flat_artifact_census.mjs` (sınıf 3). Kalçadaki köşe yuvarlaması emsali
   denendi, bel halkasını şişirdiği için geri alındı.

6. **L3a KENDİ İÇİNDE İKİYE BÖLÜNMÜŞ, kanun yalnız birine ulaşıyor (24 Ağu, V4).** Konvansiyon
   kanunu (`contract/flat-convention-v1.json`) yalnız ÜRETİM kalemini bağlıyor; canlı sitenin
   31 stili ve zevk panosunun 10 hücresinin 9'u REFERANS kalemden çıkıyor.
   O gecenin iki kök düzeltmesinden sonra panonun 10 stil hücresinin 10'u da eski commit'in
   çıktısıyla **bayt bayt aynı** çıktı — 24 Ağu 2026'da `cmp` ile ölçüldü —
   yani kanuna uygunluk kapısını geçen bir onarım, alıcının
   gördüğü çizimde hiç görünmeyebiliyor. Sayan aletler: `node engine/tests/flat_convention_check.mjs`
   (üretim kalemi, 8 stil) ve `node engine/tools/flat-board.mjs <dizin> --eski <dizin>`.
   Kök çözüm — stilleri kanunun bağladığı kaleme taşımak — YAPILMADI, karar alınmadı.

7. **L3b'nin SEVK ETTİĞİ ARTEFAKT DİKİŞ GRAFİĞİ TAŞIMIYOR (25 Ağu, V5).** L4'ün hakemleri
   (`walk.py`, `printpack.py`) motorun kendi içindeki dikiş planını okuyabiliyor, ama
   `draftJSON` sınırından geçen artefaktta o plan YOK: 112 parçada
   `seams`/`seamGraph`/`edges`/`edgeNames`/`pairs`/`stitches` alan sayısı **0**, yalnız
   `cutLine` + isimsiz işaret çizgileri var. Sonuç: dikiş çifti uzunluk eşitliği ve çentik
   ÇİFTİ eşleşmesi bu katmandan **sorulamıyor**. Ek olarak `notches` **tipsiz tek kanal**
   (`type` yalnız `move`/`line`), yani kenar çentiği / katlama / iç işaret ayrımı artefakttan
   çıkarılamıyor. Sayan kapı: `node engine/tests/sewability_check.mjs` — cevaplayamadığı her
   soruyu ADIYLA `ABSENT:` diye basıyor (bugün 7).
   ⚠ **KISMEN AŞILDI 25 Ağu (V7-C/V7-D):** artefakt artık YEDİNCİ bir alan taşıyor —
   `edgeRoles` — ve orada **dört kenar ROLÜ** var (`armhole_front`, `armhole_back`,
   `sleeve_cap`, `sleeve_underarm`). Rol bir uzunluk TAŞIMAZ, kenarı ADRESLER
   (komut aralığı + uç-nokta çapası, `engine/src/geometry.hpp:40-71`); tüketici yayı
   `commands[first..last]`'tan kendi hesaplar. Yani "0 adlandırılmış kenar" cümlesi
   bayattır. **Ama ad sözlüğü dikiş grafiği DEĞİL:** artefaktta hangi iki kenarın
   birbirine dikildiğini söyleyen hiçbir şey yok, yaka/yan dikiş/bel/band kenarları
   hâlâ adsız, `notches` hâlâ tipsiz tek kanal. Yukarıdaki altı alan adının sayısı
   bugün de **0**.
8. **L0 ↔ L3b: `shoulderCM` hem KAYNAKSIZ hem KULLANILMIYOR (25 Ağu, V5).** `contract/tables.json`
   alıcıya on beden için `shoulderCM` yayınlıyor (`_sources` status **NONE**, bekçisi kırmızı:
   `sizechart_source_check`), ama L3b geometrisi o girdiden **bağımsız**: `body.shoulder`
   20…80 cm arasında değiştirildiğinde draftJSON bayt bayt aynı kalıyor — 25 Ağu 2026'da ölçüldü.
   Motor omzu kendi çiziyor ve Aldrich'in yayınlanmış omuz boyundan ön −8.30 mm / arka
   −18.18 mm kısa düşüyor. Yani L0'ın bu kolonu ne besliyor ne de doğrulanabiliyor.
   ⚠ Aynı kesişimin `neckCM` için de var olduğu iki çıktı yan yana konarak görüldü ama
   nedensel bağ **DOĞRULANMADI**.
9. **★ L3b'nin SEVK EDİLEN HATTI, HARİTANIN L3b TANIMI DEĞİL (25 Ağu, V5-Z §5).** Bu tablo
   L3b'yi *"yüzeyin düzleştirilmesi"* diye tanımlıyor. Ölçüldü: alıcının `web/` üzerinden
   indirdiği kalıp o hattan ÇIKMIYOR. Zincir dosya dosya yürütüldü —
   `web/js/create.js:730` → `web/js/engine.js:187 engine.draftJSON(...)` →
   `engine/wasm/bindings.cpp:339` → `:298 GarmentDrafter::draft(spec, m)` →
   `engine/src/garment.cpp` (eski 2B blok çizicisi). Hükmü kesen alet sembol grep'i değil
   (emscripten adları kısaltıyor), **wasm kaynak listesi**:
   `grep -c "surfacepattern\|flatten.cpp\|curvefit\|bodysurface\|garmentshell\|shellprojection" engine/build-wasm.sh`
   → **0**; aynı altı dosya native kütüphanede duruyor (`engine/CMakeLists.txt:12-17`).
   Yani `surfacepattern.cpp` (2240 satır) ve `flatten.cpp` (340 satır) yalnız
   `surface_pattern_check` · `flatten_check` · `walkgate_check` altında koşuyor,
   **kullanıcıya hiç ulaşmıyor**. Bu, md.3'te L3a için yazılan tablonun kalıp tarafındaki
   eşi: orada da kanunun bağladığı kalem sevk edilen kalem değildi. Karar ALINMADI,
   yalnız ölçüldü — ama bundan sonra "L3b kapısı yeşil" cümlesi hangi L3b olduğunu
   söylemeden kurulamaz.
   ⚠ **25 Ağu (V7-E/V7-F) — BAYAT DEĞİL, YENİDEN ÖLÇÜLDÜ.** `grep -c surfacepattern
   engine/build-wasm.sh` bugün de **0**. Ayrıca sevk hattının kendisi damgayla doğrulandı:
   `engine/dist/stitchu-engine.js` ile `web/vendor/stitchu-engine.js` arasındaki tek fark
   127 baytlık kaynak-damgası yorumu (`vendor.includes(dist)` = true), ve `V7-E` PNG'leri o
   bayttan üretildi. Takipli wasm artefaktında ham dizgi sayımı: `Sleeve` 16 · `sleeveStyle` 5,
   buna karşılık `surfacepattern` / `SheathOptions` / `shoulderSeam` **0** (sayan alet: `grep -c`).

10. **EDİTLEME BİR KATMAN DEĞİL, L3b ARTEFAKTININ ÜSTÜNE OTURUYOR — VE ORASI PANELDEN İNCE DEĞİL (25 Ağu, V6).**
    "Yakayı değiştir, gerisi yerinde kalsın" hükmünü bugün `engine/tools/spec-diff.mjs`
    veriyor, kanunu `contract/edit-locality-v1.json`, kapısı
    `node engine/tests/edit_locality_check.mjs` (ctest'te kayıtlı). Kapı L3b'nin
    **sevk edilen** hattını yargılıyor: `engine/dist/stitchu-engine.js` yükleniyor ve
    kaynak damgası `web/vendor/stitchu-engine.js` ile birebir (`7023c808195429b3`),
    yani md.9'daki ayrımın *2B* tarafı. Yüzey hattı hakkında hiçbir şey söylemiyor.
    ⚠ **BU DAMGANIN SINIRI, 25 Ağu'da yazıldı:** `engine/dist/stitchu-engine.js`
    **gitignore'da** — `git check-ignore -v engine/dist/stitchu-engine.js` `engine/.gitignore`'ın
    5. satırındaki `dist/` kuralını gösteriyor —
    yani damga TEMİZ BİR CHECKOUT'TA ÜRETİLEMEZ — üstteki onaltılık dizi bir kere okunmuş
    değerdir, bu dosyadan doğrulanamaz. Aynı sınırı `docs/ARCHITECTURE.md:263` de ilan ediyor.
    Bundle'ın kaynağıyla tazeliğini yargılayan ayrı kapı `bundle_fresh_check` ctest'te kayıtlı.
    ★ **Boşluk:** editlemenin istediği çıpa bir panelin KENARIDIR; md.7'nin saydığı
    dikiş grafiği eksikliği burada ikinci kez ısırıyor — o gün 88 spec'te **0 adlandırılmış
    kenar** ölçüldü, ve `contract/primitives-v1.json:primitifler.edge.parametreler.label`
    bir kenar etiketi alanı TANIMLIYOR ama dolduran üretici yok.
    ⚠ **"0 adlandırılmış kenar" bir gün sonra bayatladı (V7, md.11) — düzeltiliyor, silinmiyor:**
    artefaktta artık dört ROL var. Bu maddeyi KAPATMIYOR: dördü oyuk/kapak/koltukaltına ait,
    ÖLÇÜLMEK için var (gösterilmek için değil), ve `edge.label` alanının üreticisi hâlâ yok.
    "Şuraya ekle" bugün de en fazla `Bodice Front`'un tamamını gösteriyor. Bölge→panel adı
    çözümü çalışıyor (varsayılan 6 panelli elbisede 35 serbest bölge-panel çifti),
    dolayısıyla "şuraya" bugün en fazla `Bodice Front`'un tamamını gösterebiliyor.
    Kenar granülaritesindeki çıpa sözlüğü ÜRETİLDİ ama ana dala ALINMADI —
    `research/v6-cipa-editleme` @ `3d8903c`, dönüş şartı `DAMLA-KUYRUK.md` K-V6A.
    ★ İkinci boşluk: `contract/edit-locality-v1.json`'un kendisi ELLE yazılmış,
    üreteci ve `--check` bekçisi yok, `contract/generated-paths.sha256`'da geçmiyor;
    `_bolge_kaynagi`'nın "composition.json'dan birebir taşındı" cümlesi 22 bileşenin
    3'ünde YANLIŞ ölçüldü ve `fieldZones`'un 41 alanının 21'i hiçbir bileşenden
    gelmiyor (sayan kapı: `node engine/tests/edit_locality_check.mjs`). Kapı doğrulanmamış bir iddiayı ölçüyor.

11. **★ KENAR KİMLİĞİ L3b'ye GİRDİ — AMA OYUĞU YENİDEN ÇİZEN ÜÇ PAS'TA HÂLÂ YOK (25 Ağu, V7).**
    `PatternPiece` artık kenar ROLÜ taşıyor (md.7'deki `edgeRoles`). Rol, kenarı ÇİZEN kod
    tarafından verilir ve **komut aralığı + uç-nokta çapasıyla adreslenir**; bir post-pass
    komutları yeniden yazarsa `garment.cpp:1077-1085`'teki tek boğaz noktası
    (`reanchorEdgeRoles()`) rolü çapasından yeniden adresler, çapa gitmişse **adı DÜŞÜRÜR** —
    yanlış kenara işaret eden ad, adsızlıktan beterdir. Bunu kullanan kapı
    `node engine/tests/sleeve_cap_ease_check.mjs`: oyuk yayını (`armhole_front` +
    `armhole_back`) kapak yayıyla (`sleeve_cap`) karşılaştırır ve **ikisini de ÇİZİLEN
    kenardan** ölçer — eskiden yargı skaler `bodice.armholeLength` kopyasının kendisiyle
    karşılaştırılmasıydı.
    ★ **BORÇ, GİZLENMİYOR:** adlandırılmış oyuk YOKSA `validator.cpp:333-352` hâlâ eski
    skalere düşüyor — gerekçe orada yazılı (adın hiç olmaması ÜRETİCİDEKİ borçtur, o
    taslağın kusuru değil; reddetmek doğru çizilmiş kalıba sahte "dikilemez" derdi). Adın
    VAR OLUP çözülmemesi ise reddediliyor. Düşen yollar kapının kendi çıktısında ADIYLA
    sayılıyor: 25 Ağu'da `bardot_off_shoulder`, `yoke_top`, `cupseam_bustier`. Ayrıca
    **yarım ad, ad değildir**: cup seam yalnız ÖN bedeni yeniden yazdığı için taslak
    `armhole_back` ADLI + `armhole_front` ADSIZ gelebiliyor; var olanı toplamak kapağı
    YARIM oyuğa göre yargılamak olurdu. Sıradaki iş: o üç pas'ın çizdiği kenara ad vermesi.
    ⚠ Diğer post-pass'ler (`gather.cpp`, `shoulder.cpp`, `offshoulder.cpp`, `yoke.cpp`)
    **taranmadı** — bugün yalnız ctest'in kırmızıya düşürdüğü yol arandı, **DOĞRULANMADI**.

## Teşhis ilkesi?

Her harness testi SADECE kontrat dosyası okur. H3b FAIL + H0 PASS ⇒ arıza kesin L3b'de.
H0 FAIL ⇒ vücut kaynakları zaten ayrık, önce onu kapat — aşağı katmana bakma.
