# HEDEF — stitchu

**Bu dosya reponun en üst otoritesidir.** ANAYASA / DERSLER / ROADMAP / CLAUDE.md ile çelişki çıkarsa çelişki bu dosya lehine **tek karar commit'iyle** kapanır; o commit'te diğer dosyanın çelişen satırı **silinir**. İki doğru bırakılmaz.

Açıldı: 2026-08-16 · Branch: `vardiya/2026-08-16`

---

## SAYAÇ

> **KAPSAM BÜYÜDÜ: +3 halka (H1.1a, H1.1b, H1.1c). Sebebi:** H1.1'in mührü şartnameyi ilk kez BUGÜNKÜ pakete karşı ölçtü ve üç madde gerçekten sağlanmıyor çıktı — nesting önce/sonra kanıtı hiç üretilmiyor, kumaş önerisi hiçbir sayfaya basılmıyor, kontakt sayfasının emsal PDF'leri diskte yok. Üçü de "H1.0 yeşillenince geçer" cinsinden **değil**; üçü de alıcıya verdiğimiz sözün eksik kalan parçası. Şartnameyi "tam" diye kapatıp bunları sessizce taşımak kapı boyamak olurdu.

```
H1'e kalan:  8 halka / 26–37 koşu saati    [H1.0: 12–22 → **13–24s**, teşhis yer değiştirdi] [+H1.1a/b/c]
H2'ye kalan: 7 halka / 168–295 koşu saati
H3'e kalan:  4 halka / 80–120 koşu saati + zevk turu 0
TABAN:       2 halka / ~1 koşu saati       [T13,T15,T16 KAPANDI · T1 yok-hükmünde · T5 bloke · +T17 style_check boş koşuyor]
```

## TUR 7 — ALICIYA ULAŞAN BİR HATA KAPANDI + H1.0a'NIN TEŞHİSİ YER DEĞİŞTİRDİ

### ★ Bugünün en somut bulgusu: basılan beden tablosu kalıptan farklıydı
`contract/layers/size-table.json`, `printpack.py:1380`'de alıcının PDF'ine **"BEDEN TABLOSU (vücut ölçüleri, cm)"** başlığıyla basılıyordu; motor ise `euSize()`'dan kesiyordu. Fark sabit ve büyük:
`EU34–46: göğüs −0.159 · bel +2.334 · basen −2.522 cm` · `EU48: göğüs −2.159 · basen −4.522`
→ **EU38 sayfası "bel 72.3" yazarken kalıp 70.0'a kesilmişti.** Kendini bizim tablomuza göre ölçen alıcı **yanlış bedene** gönderiliyordu. Tekleştirildi (kök `euSizeChart` — 11 tüketici vs 1); `size-table.json` artık sözleşmeden **kopyalıyor**. `ctest` önce=sonra (`99%, 1/91`), K2 grade **7/7 korundu**, K6 dizisi bit-aynı.

### H1.0a — ÖNCEKİ TEŞHİS ÖLÇÜMLE GERİ ÇEKİLDİ
Tur 6'nın *"üst pensler bel pensleriyle kesişiyor"* teşhisi **YANLIŞTI**: `STITCHU_SLIT_DEBUG` 4 bedende, bayrak açık ve kapalı — **gövdede HİÇ BEL PENSİ YOK** (gövde yalnız üst çapa türetiyor; etek develop-deficit **+0.000°**, çünkü `skimBodice`+`hemSweep` koniye çeviriyor). *"Ön-orta ölü bölge"* de kök değil: o bölgenin deficit'i dikişten çıkıyor (sınır gerinimleri %0.011–0.092, kapı %0.5).

**GERÇEK KÖK — EYER.** Panelin deficit'i üstteki iki satır bandında **+34.57° sivri, sonra −64.34° çukur**; altındaki her bant −0.12…−0.18°. Çukur bir **eyer**, ve **pens eyeri yutamaz** — `dartColumnsFromDeficitRows` negatif bantları yerleşim için sıfıra kırpıyor, katlamanın negatif eğriliğine gidecek yer hiç verilmiyor ve **bacak gerinimi olarak yüzeye çıkıyor: %8.929** (kapıyı kıran %1.83'ün kaynağı). Bu bir pens muhasebesi sorunu değil, **`CrestFold`'un şeklinin** sorunu.
İki alt kalem: (1) üst pensin bacakları dikiş listesine **pens çifti olarak girmiyor** — PNG'de hiç mavi kenar yok, dikiciye kapatma talimatı yok; (2) `maxDartDeg` **bağlamıyor** (ilan edilen kapak 14°, gerçekte pens başına 24.4°).
**Bir düzeltme daha alınmadı:** `total`'dan pens sayma (n 2→4) kuyruk yürüyüşünü komşu kolonlara yığdı ve kesim çizgisini **kötüleştirdi** (ön 1.8318→%2.2734). Ölçüldü, ilan edildi, alınmadı.

> **KAPSAM BÜYÜDÜ: +1 halka (T17). Sebebi:** `style_check` ctest'te **YEŞİL** ama `engine/STYLE-PIN/` dizini **hiç olmadığı için** `PASS (nothing to enforce)` basıyor — hiçbir şeyi tutmuyor. T7 (`walk.py` kapı değil yazıcıydı) ile **aynı sınıf**. Tek testi düzeltmek yetmez: **başka hangi kapılar yeşil görünüp boş koşuyor?** Süpürme gerekiyor.

## TUR 6 — OMUZ DİKİŞİ İNŞA EDİLDİ, BAYRAK ARKASINDA BEKLİYOR

**İnşa bitti ve çalışıyor.** Tüp → omuz bandında ön/arka üst sınır **tek bir crest eğrisine** katlanıyor, `farEdges` c ↔ NR−c dikişleri planda, aynalama panel bazında türetiliyor. Açıkken kapı **52/63 → 24/63 FAIL**:

| şart | kapalı (sevk edilen) | **AÇIK** |
|---|---|---|
| K3 omuz dikişi | 0 | **30 dikiş, ok 8/8** |
| K5 yaka kapalı çevrim | açık | **ok 8/8** |
| K5 yaka çevresi | 364.67, 4/8 | **503.80, ok 8/8** |
| K6 taşıyıcı yüzey | −12.79mm | **+2.91mm, ok 8/8** |
| K4 omuz dengesi | −2.336mm | **−0.015mm** (hâlâ FAIL) |
| K2 grade | 7/7 ok | **7/7 ok, korundu** |

**Neden sevk edilmedi:** açıkken iki taban kapısını kırıyor — `surface_pattern_check` 0→4 FAIL (gövde kesim çizgisi %0.02 → **%1.83**, kapı %0.5) ve `walkgate_check` 0→**6 hüküm, hepsi kendini-kesme**. Kırık test yamalanmaz, geri alınır. `SheathOptions.shoulderSeam=false` bayrağıyla sevk edildi; **tek bool ile 24/63 geri gelir**, hiçbir şey silinmedi.

**Kök sebep ölçüldü:** katlamanın Gauss eğriliği üst-çapalı penslerden çıkamıyor. (a) Üst pensler bel pensleriyle **KESİŞİYOR** — bel yarığı `[0, 0.80)`, üst yarık `(0.55, rowsN]`, bantlar çakışıyor; koddaki *"cuts cannot cross by construction"* yorumu **YANLIŞ**. (b) Ön-orta kesiğin yanında pens türetilmeyen ölü bölge var.

**İki düzeltme denendi, İKİSİ DE ALINMADI** (Tur 5 emsali): crest bandı 60→120mm kesim çizgisini %0.46'ya indirdi ama walkgate'i **6→30**'a çıkardı — sayı düştü, giysi kötüleşti. `topDartApexFrac` 0.55→0.80: iç gerinim 6.96→**%11.67**.

> **KAPSAM BÜYÜDÜ: +4 halka (H1.0a, H1.0b, T15, T16). Sebebi:**
> **H1.0a — pens düzeni** (3–6s): üst pens ↔ bel pensi kesişmesi + ön-orta ölü bölge. **Bu çözülmeden omuz dikişi açılamaz.** Kritik yolun kendisi.
> **H1.0b — kol oyuğu gerçek 2B delik** (6–12s): K1 "%19 eksik" değil, **YAPISAL**. Oyuk bugün φ∈[0, 19.9°] bandında ince bir mercek — derinlik ~148mm, ön-arka genişlik **~52mm**. Elips aritmetiği: 150×52 → ~333mm (ölçülen 330 ✓); Buğra'nın 424–486'sı için delik **~110mm geniş** olmalı. Katlama buna +1mm bile katmıyor. Oyuk, φ'nin fonksiyonu olan bir çentik olmaktan çıkıp **gerçek bir 2B delik** olmalı.
> **T15 — KAPANDI 17.08. ÇARPAN KONDU, TEK BİR SAYI DEĞİŞMEDİ, K9 AYAKTA.** `18`'in mandalına sarılım çarpanı (`w = +1 CCW / −1 CW`) kondu ve sarılım artık **ölçülüp basılıyor**, varsayılmıyor. **Ölçüm: Front Body CCW 8/8, Back Body CCW 8/8** — bu dosya **kol parçası hiç ölçmüyor**, o yüzden körlük burada hiçbir zaman tetiklenmemişti. Önce/sonra: 728 sayıda **en büyük fark 0.0000000000mm**, konsol çıktısı sarılım bloğu dışında **bayt bayt aynı**. Bağımsız tanık: düzeltmeden ÖNCE bile Tablo 6'nın numerik-vs-analitik farkı 32 ölçümde en kötü **0.013mm** (CW olsaydı ~2·d·Δθ ≈ 30–40mm olurdu) → körlük zaten sessizdi. <br>★ **K9 HÜKMÜ SARSILMADI, çünkü tablo kımıldamadı:** `ön_yay ≤ arka_yay` kesim çizgisinde **8/8** (fark −13.83…−1.50mm) ve `ön_yay/kiriş > arka_yay/kiriş` **8/8** (1.2323–1.2620 vs 1.1610–1.1767). `docs/H1.0-KAPI.md`'nin şartı **devredilmedi, gerek kalmadı**. ⚠ Değişmeyen ama **kayda geçen** yan bulgu: DİKİŞ çizgisinde `ön ≤ arka` yalnız **6/8** (EU46 **+0.08**, EU48 **+1.33mm** ters); K9 kesim çizgisi hükmüdür, dikiş çizgisine genişletilirse iki bedende düşer.
> **T16** (~1s): **İKİ BEDEN TABLOSU VAR VE UYUŞMUYORLAR.** `contract/layers/size-table.json` bust'u kusursuz doğrusal (EU48 = **107.84**), `contract.gen.hpp` EU48'i **110** yazıyor; `h10_gate_check` ikincisini kullanıyor. `CLAUDE.md`'nin "ÜÇÜNCÜ VÜCUT KAYNAĞI" teşhisi hâlâ canlı. Ayrıca `backLengthCM` EU44→EU46 adımı **0.0cm** (diğer altı adım +0.5) — dizgi hatası gibi, DOĞRULANMADI.

### K4 — 5B'NİN REÇETESİ BU NOKTADA YANLIŞTI, DÜZELTİLDİ
"K4'ün işareti bu inşadan düşer" **olmadı**: dikiş tek eğri olunca iki kenar **tanım gereği eşit** (−2.336 → −0.015mm). `arka > ön` bir **yüzey özelliği değil, dikişte YEDİRME**dir; Buğra'nın +0.95…+1.13mm'si onun payıdır.
⚠ **İKİ KAPI ARASINDA GERÇEK GERİLİM:** K4 bandı `[0.5, 12.0]mm` ile dikiş-eşitliği kapısı `0.79375mm` yalnız **0.5–0.79mm** aralığında kesişiyor. → `DAMLA-KUYRUK` **K11**.

**T9 KAPANDI 17.08.** `arapFlatten`'ın `rounds`'u sayaç olmaktan çıkıp **TAVAN** oldu; duruş şartı çözücünün kendi cevabı (bir turda max düğüm yer değişimi `< 1e-4mm`). `60 → 400` YAPILMADI — ölçüldü, gövde panelleri **69–95 turda** bitiyor, 60 sadece 10–35 tur eksikmiş. Sonuç: bel dönüş açısı 8 bedende **±0.54°** içinde (önce EU46 +88.31°), `maxStrain` **%28.61/32.51/34.62 → 8 bedende %0.77–0.87**, bel dikiş sayısı 10–26 arası dağınıktan **8 bedende de 14**'e. `flatten_check`'in sertifikaları ayakta (koni bit-aynı 0.005814°). Bedel **+3.1 saniye**.

> **KAPSAM BÜYÜDÜ: +3 halka (T12, T13, T14). Sebebi:** Tur 5, bozuk `10`/`12` scriptlerini düzeltirken üç bağımsız açık kalem bıraktı. Üçü de bugün karar besliyor.

| # | Halka | Ölçülen | Süre |
|---|---|---|---|
| T12 | ~~`13-digitize-multisize.py` aynı bozuk ofseti taşıyor~~ | **KAPANDI 17.08.** Budama+miter atıldı, `18`'in nokta-normali ofseti kondu. Düz-kenar mandalı `400.0000 → 400.0000mm (fark 0.00e+00)`; analitik `ΔL=−d·Δθ` 484 kenar-ölçümünde en kötü **0.4102mm** (mandal düzeltilmeden önce 88.66mm — §sarılım). Bütün dikiş-çizgisi sayıları değişti: EU38 CF **401.5 → 420.2**, oyuk toplam **431.5 → 468.0**, kapak **425.8 → 444.7**, ön koltukaltı artığı **−0.1 → +1.5mm**, omuz ön/arka farkı **+3.3 → +0.2mm**. ★ **`13`'ten türemiş KULLANILAN sayı YOK:** zehirli alan `stitchMM` ve onun repoda `13` dışında tüketicisi yok (grep); `trace-match.py` + K1 `cutMM` okuyor, düzeltilmiş `13` HEAD'deki `seamgraph.json` ile **484 kenarda cutMM farkı 0 (max 0.0000mm), notches farkı 0**. Çıktı telifli dizinden çıkarıldı → `flatten-research/out-13-seamgraph.json` | ~0.5s |
| T13 | fikstür işaret şartını **yargılamıyor**, sadece basıyor | K9 hükmü belgelere yazıldı (`ön_yay ≤ arka_yay` **ve** `ön_yay/kiriş > arka_yay/kiriş`) ama `h10_gate_check` onu hüküm olarak koşmuyor | ~1s |
| T14 | ~~**net cap ease NEGATİF**~~ | **KAPANDI 17.08 — İŞARET, HANGİ ÇİZGİYİ ÖLÇTÜĞÜNÜN FONKSİYONU.** Kesim çizgisinde cap ease **8/8 POZİTİF** (+1.54…+4.22%, EU38 **+18.30mm**); dikiş çizgisinde 8/8 negatif. ~40mm'lik salınımın tamamı dikiş payından: oyuk **içbükey** (+34.3…+36.2mm), kapak **dışbükey** (−4.6…−6.4mm). "Cap ease +1.8…+4.3%" ile "−4.7%" aynı kalıbın iki çizgide okunuşu, hiç çelişmiyorlardı. **(c) ELENDİ:** Lower'ın o kenarı tarifi gereği bir kapak — EU38 kiriş **345.88mm = bicep**, sagitta **129.81mm = kapak yüksekliği** (Aldrich 13–15cm bandı), iki ucu aynı yükseklikte (dy 0.02mm). **(a) YARISI:** Upper'ın üst kenarı da oyuğa gidiyor ama Lower'ın YERİNE değil — %29 fazlalık ease değil **büzgü**. **(b) AYAKTA, KANITLANMADI:** koltukaltı bölgeleri 8 bedende ±4mm tutuyor, açığın **tamamı taçta** (−21.9…−30.0mm). ★ **`patterns_real/BUGRA-DEFTER.md`'nin "kol yatay 2'ye bölünmüş" satırı ÇÜRÜDÜ:** iki parça da tam kapak taşıyor ve kapak **sagitta oranı 8 bedende bit-sabit 1.227** (kiriş oranı 1.549→1.347 değişiyor) → iki KATMAN, yatay bölünme değil. **K1 ETKİLENMEDİ** (kanıt: `knowledge/cap-ease-isareti-2026-08-17.md` §6). Ölçüm: `flatten-research/19-cap-vs-armscye.py` | 1–2s |

> **TUR 4 DÜZELTMESİ — ÖNCEKİ TURUN İKİ SAYISI YANLIŞTI.**
> (1) `+0.2138 / +0.1376 / +0.2691mm` **h3c değildi** — motorun stderr satırıydı (`bodiceWaistSum − ringGirth`). Gerçek h3c (`h3b-rings.py`, tolerans ±1.0mm) bugün **8/8 bedende GEÇİYOR**. "T9 sayıyı kımıldatmadı" cümlesi yanlış numaraya bakıyordu: `Logs/taban-T7-SONRA` h3c'si gerçekten FAIL'di (−5.264 / −10.795 / −2.230mm) ve **T9'un `emitChain` düzeltmesi onu kapattı**.
> (2) "Zikzak panele ~3.3mm fazladan uzunluk katıyor" **yanlış**: kıvrım uzunluk-koruyucu (adımlar 7.5297→7.6104mm, pürüzsüz), bozulan yalnız dönüş açısı (−0.7° → +88.3°). mm zinciri kapatıldı: ftorso 235.973 + btorso 206.550 = 442.523, ring yarım 442.454, fark ×2 = **+0.1376mm**. Artık **birikmiş sınır gerinimi**, ekstra uzunluk değil.

> **KAPSAM BÜYÜDÜ: +1 halka (T11 — ters omuz). Sebebi:** T7 kapıyı gerçek kapı yapınca ortaya çıkan 12 hüküm-FAIL'in yarısı T9'un (waist-attach) değil: **6'sı ters omuz** — ön omuz arkadan uzun çıkıyor. `CLAUDE.md`'de kayıtlı alan bilgisi bunun tersini söylüyor (arka omzun uzun olması STANDARTTIR, kürek payı 6-12mm). İşaret hatası mı gerçek geometri mi **ölçülmedi**. T9'un içine gizlemek yerine halka yazıyorum.

> **KAPSAM BÜYÜDÜ: +4 halka (T7, T8, T9, T10). Sebebi:** Tur 1, tabanın altında dört bağımsız kırmızı ölçtü. Hiçbiri "H1.0 yeşil olunca geçer" cinsinden değil; dördü de **bugün basılan paketi satılamaz kılıyor**. Sessizce eklemek yerine halka yazıyorum ve H1'in kitapçık/kapak/listing halkalarını bunların ARKASINA aldım (gerekçe: TUR 1 ROTA KARARI).

Her rapor bu üç sayıyla **biter**. Sayı düşmediyse rapor bunu gizleyemez: `sayı düşmedi, sebebi şu` yazar.

**Bu blok reponun TEK sayacıdır.** Başka hiçbir dosya sayaç yazmaz, buraya işaret eder. `contract/kapsam-checkpoint.json` T6'da tek sayaç diye adlandırılmıştı ama **diskte yok** (16.08 doğrulandı); `reports/gate/kapsam-checkpoint.json` ise 2026-07-21 / 103-hedef rejiminden ve `ANAYASA.md`'ye göre tarih arşivi — sayaç değildir.

---

## BİTİŞ TANIMI — tektir, değişmez

Damla rastgele **10 cümle/görsel** atar → en az **8'i** dikilebilir kalıp + zevk kapısından geçmiş flat döner → kalan 2'si **eksik operatörünü adıyla söyleyerek** dürüst reddeder.

Bu listenin dışında "bitirmek için gereken" bir iş keşfedilirse **SAKLANMAZ** — buraya halka olarak eklenir ve o fazın raporu `KAPSAM BÜYÜDÜ: +X halka, sebebi şu` cümlesiyle açılır. Kapsamı sessizce büyütmek, **kapı boyamakla aynı sınıf ihlaldir**.

---

## TABAN — hedef değil, bitişin şartı

Her fazın sonunda **pazarlıksız** mühürlenir.

| # | Halka | Kalan iş | Süre |
|---|---|---|---|
| T1 | iki include düzeltmesi | **YOK HÜKMÜNDE 16.08** — terim tüm revizyonlarda aranmadı değil, arandı: repoda karşılığı yok. Ampirik: 52 başlık tek tek derlendi, **0 başarısız**. Uydurulmadı → `DAMLA-KUYRUK` **K6** | 0 |
| T2 | determinizm çift koşusu | **KAPANDI 16.08** — iki bağımsız temiz koşu, manifest sha256 `8abec243…` özdeş, 24 PDF `cmp` ile 0 fark | ~0.5s |
| T3 | kenar monotonluğu | **KAPANDI 17.08, T8 ile birlikte.** `edgemono_check` YEŞİL (ctest #88): 8 beden × 8 panel, **968 ihlal → 0**, en kötü geri dönüş **22.988825mm → 0.000000mm**, en kötü ters teğet 180.000° → 83.606° (kapı 90°). Kapıya, ölçüme, eşiğe dokunulmadı | ~0.5s |
| T4 | montaj sırasının pakete girişi | **KAPANDI 16.08** — `84e79a9` sadece `print-report.txt`'e basıyordu (denetim dosyası), hiçbir PDF'e girmiyordu; artık `print-info.pdf` s.2'de 13 adım | ~1s |
| T5 | dünya-kapısı sicili | **AÇIK — BLOKE.** Terim tüm revizyonlarda sadece bu satırda ve `.vardiya/state.json`'da geçiyor, tanımı repoda YOK (16.08 arandı). Sicil kurulmadı, tanım uydurulmadı → `DAMLA-KUYRUK.md` **K5** | **ÖLÇÜLMEDİ** |
| T6 | sayaç/anayasa tekleştirme | **KAPANDI 16.08** — tek sayaç bu dosyanın `§ SAYAÇ`'ı; ROADMAP/DERSLER/ANAYASA'daki bayat sayaç ve otorite satırları silindi | ~2s |

### TABAN — Tur 1'de açılan yeni halkalar

| # | Halka | Ölçülen | Süre |
|---|---|---|---|
| T7 | **`walk.py` bir kapı değil, yazıcı** | **KAPANDI 17.08.** `main()` artık hüküm döndürüyor; hangi bulgu **hüküm** (dikiş · kol oyuğu grubu · kapalı kontur · kendini kesme · ayna) hangisi **bilgi** (UNVERIFIABLE · GATHERED-UNSCORED · REPORTED · DEFERRED) `walk.py gate()` başlığında yazılı. `taban.sh` sayımı artık walk.py'ın `KAPI` satırından okuyor (girintili `  FAIL` + hiç FAIL satırı basmayan ARMHOLE hükmü dahil), grep çapraz kontrole indi. Kapı `walkgate_check` ile ctest'e bağlandı — 8 beden TAZE spec. **Ölçüm: donmuş T2-RUN2 spec'lerinde exit 0/8 → 1/8, görünen FAIL 12 → 72 (60 kendini kesen panel).** Bugünkü ağaçta (T8 curvefit düzeltmesiyle) kendini kesme 0, kalan **12 hüküm-FAIL** = 6 waist-attach + 6 ters omuz → `taban.sh` exit 1, ctest 88/89 | 2–4s |
| T8 | **eğri-fit kontrol noktası taşması** | **KAPANDI 17.08 (`25edfa2`).** Kök sebep **teğetin İŞARETİ**: `fitOne` kontrol noktalarını `c1 = p0 + al*t0`, `c2 = p3 + be*t1` (`al,be ≥ 0`) diye kuruyor, yani iki teğet de İÇERİ bakmak zorunda. `fitRange` özyinelemeli bölmede ilk yarıya, orta noktanın **İLERİ** teğetini bitiş teğeti diye veriyordu — tam tersi. Schneider'ın orijinali orta teğeti geri yönde hesaplar, ilk yarıya verir, ikinci yarı için negatifler. Sonuç: her pozitif `be` `c2`'yi `p3`'ün ÖTESİNE koyuyor, eğri kendi bitiş noktasını aşıp geri dönüyor. İkinci yarısı: en küçük kareler büyüklükte SINIRSIZDI (Schneider sadece işareti korur); artık kirişe izdüşen kontrol değerleri `x0 ≤ x1 ≤ x2 ≤ x3` kısıtıyla çözülüyor — üç doğrusal eşitsizlik, dışbükey karesel amaç, her yüzde kapalı form. Parametre **kırpılmıyor, doğru üretiliyor**: `[0,1]` dışı **488 → 0** (max 0.9937, min 0.0075). Kübik sayısı 2096 → 782, **fit sapması aynı** (paylaşılan zincir en kötü 0.1469mm, serbest 0.1356→0.1437mm, tek-kübik 7.1717mm değişmedi = T9). Yan kazanç: `walkgate_check` 72 → 12 hüküm-FAIL, kendini kesen panel **60 → 0** | 3s |
| T9 | **h3c 3/8 bedende FAIL + waist-attach** | **YARISI KAPANDI 17.08 — waist-attach BİTTİ, h3c AÇIK ama artık yeri belli.** (a) **Zorlama kaldırıldı:** `emitChain`'in `singleCubic=true`'su (tolerans `1e9`) `kFitTolMM`'i by-pass ediyordu. Konma sebebi "bel tek eğri olsun" değildi — asıl kısıt dardı: dikiş eşlemesi `waist[r][0]`'ı okuyordu, yani çok kenarlı bir bel zinciri ilk kenardan sonrasını **dikişsiz** bırakırdı. Bel BİR EĞRİ, ama tek kübik olmak zorunda değil. Prenses/yan dikişlerin zaten kullandığı **paylaşılan bölünme** (iki yakanın doğal kırılma noktalarının BİRLEŞİMİ, iki yakada yeniden fit) bele de uygulandı, eşleme `chainPair`'e taşındı (yön ölçülüyor, varsayılmıyor). **Ölçüm: `worst fit` 8 bedende 7.1717 → 0.1469mm**, hepsi `kFitTolMM=0.15`'in altında — kapı ilk kez GERÇEKTEN uygulanıyor (eşik, tolerans, sınıf DEĞİŞMEDİ). EU46 arka bel: 1 kübik / sapma 7.1717mm → 9 kübik / **0.0615mm**. (b) **waist-attach kök sebebi buydu:** hakem KENARI ölçüyor, kenar tek kübikti ve gerçek çokgeni 7mm ıskalıyordu; bel halkası **zaten bir kez örnekleniyor** (`skirt waist ≡ ring girth`, 8 bedende ≤0.0001mm). Aynı hakem, aynı gün, eski spec vs yeni spec: **waist-attach hüküm-FAIL 6 → 0**, en kötü sapma **5.350mm → 0.070mm**; T11 ile birlikte `walkgate` toplam **12 → 0**, ctest **90/90**. (c) **h3c hâlâ 3/8 FAIL, sayı kımıldamadı** (EU42 +0.2138 · EU46 +0.1376 · EU48 +0.2691mm) — çünkü h3c spec'i değil, düzleştirilmiş ÇOKGENİ ölçüyor. Yer bulundu: tek kübik bir kusuru **maskeliyormuş**. Bel koşusunun son 1-2 noktası bozuk, ve tam olarak h3c'nin düştüğü üç bedende: EU46 arka son iki nokta yanal **5.9mm zikzak**, EU42 ön son nokta y'de **geri dönüyor** (614.50 → 611.74), EU48 ön son adım neredeyse yatay (Δy 0.05mm, Δx 8.3mm); EU34/36/38/40/44 pürüzsüz. `STITCHU_SP_DEBUG` aynı yeri gösteriyor: EU46 `left_btorso` bel sınır gerinimi **%0.087**, EU38'de %0.004 — **20 kat**. Yani kalan h3c bir eğri-fit sorunu değil, gövde panelinin ARAP düzleştirmesinin bel sınırında (`surfacepattern.cpp`) — **H1.0'ın alanı**, `emitChain`'in değil. **(d) TUR 5 — KAPANDI.** Kök sebep ARAP'ın `rounds`'unun bir SAYAÇ olmasıydı ve sayaç 60'tı; 60 yakınsamıyordu. `rounds` artık **TAVAN** (2000), çözücü kendi cevabıyla duruyor: bir local/global turunda en büyük düğüm yer değişimi **< 1e-4mm** (üretim toleransı 0.79375mm'nin dört mertebe altı). Sayı büyütülmedi — `STITCHU_ARAP_DEBUG` ölçtü: gövde panelleri **69–95 turda** bitiyor, tavana hiç değmiyor; 4C'nin "400" okuması hastalıkta haklı dozda yanlıştı. **Ölçüm 8 bedende, `arapconv-probe`:** bel dönüş açısı EU42 −60.76 / EU46 +88.31 / EU48 −37.86° → **8'i de ±0.54° içinde** · `bodiceWaist−ring` +0.2138/+0.1376/+0.2691mm çıkıntıları → **−0.0257…−0.0293mm, bedenle monoton** · `h3b-rings` 8/8 OK (önce de OK'di) ama bel dikiş sayısı **10–26 → 8 bedende de 14**: kıvrım beli fazladan eğri parçasına bölüyormuş. **★ AYRI KIRMIZI DA AYNI KÖKTENMİŞ: `maxStrain` EU42 %28.61 / EU46 %32.51 / EU48 %34.62 → 8 bedende %0.77–0.87.** Bedel: 8 beden 34.2s → 37.3s. `flatten_check`'e DOKUNULMADI, sertifikalı sayılar duruyor (koni 0.005814° ve %0.003682 bit-aynı; kalot pens sapması 0.427595 → 0.427611°, çünkü 40 tavanı yerine 31'de duruyor — 1.0° kapısına karşı 1.6e-5°). Tavan 4000'de ölçülen tam-yakınsak koni 0.007706° / %0.002751 → analitikle kalan fark **ayrıklaştırma**, eksik-yakınsama değil | ~1s |
| T11 | **ters omuz** — ön omuz arkadan uzun | **KAPANDI 17.08 — (a) SINIFLANDIRMA HATASIYDI.** O dikiş omuz değil, **YAN DİKİŞ**. Dört bağımsız kanıt: (1) motorun kendi dikiş planı — `surface-pattern.cpp` panel sırası `[lF rF lB rB]`, `chainPair(base+1, base+2) // side phi=pi` ve `chainPair(base+3, base+0) // side phi=2pi`; walk.py'ın "omuz" dediği çiftler tam olarak bunlar. (2) Kontur bitişikliği: 8 bedende de o kenar panelin **bel kenarına** (edge 0, waist-attach) bitişik — omuz dikişi bele değmez. (3) `h10_gate_check` K3: 8 bedende **0 omuz dikişi**. (4) walk.py kendi aynasını bozuyordu: EU34/36/46'da AYNI yan dikişin bir yakası `shoulder`, öteki `side-seam` çıkıyordu (referans birebir maksimum, ona yalnızca bir çift eşit olabilir) — Tur 2'nin "FAIL'ler sadece `right_*` tarafında" şüphesinin cevabı bu. **KÖK SEBEP:** `shoulder_reference_height` "en yüksek ön-arka gövde dikişi = omuz" diyordu; bu bir VÜCUT yüksekliği ister, ama `surface-pattern` sekiz paneli de `translation [0,0,0] / rotation [0,0,0]` yazıyor — "yükseklik" panelin kendi y'si, iki panelinki kıyaslanamaz. Sezgi yine de cevap veriyordu. **Düzeltme kapı değil, kanıt katmanı:** `seamrules.side_seam_edges()` — bel dikişine kontur üzerinden ulaşan ön-arka gövde kenarı yan dikiştir; omuz sezgisi ancak geriye kalanlarda koşar. Eşik, tolerans, hüküm/bilgi sınıfı DEĞİŞMEDİ. **Ölçüm: `walkgate` hüküm-FAIL 12 → 6, ters-omuz hükmü 6 → 0** (kalan 6 = T9 waist-attach). Yan dikiş ön/arka farkı 8 bedende **0.003…0.035mm** ve işaret DEĞİŞİYOR (EU36 −0.003, EU48 +0.035) → yön kusuru değil eğri-fit gürültüsü; eşitlik toleransı 0.79375mm, en kötüsü toleransın **%4.4'ü**. Regresyon: omuzu GERÇEKTEN olan 7 spec'te (`gradeset-2026-08-10` ×6 + `paket-2026-08-06`) walk çıktısı **bayt bayt aynı**, omuz hükmü hâlâ koşuyor (arka +1.11…+1.74mm, Buğra'nın +0.95…+1.13mm'siyle aynı yön ve mertebe). ⚠ **GERÇEK ters-omuz kusuru VAR ama bu dikişte değil — H1.0'a bağlandı:** `h10_gate_check` K4 giysinin ÜST KENARINDA arka−ön **−3.964…−4.451mm** ölçüyor (bedenle büyüyor), kapı [0.5, 12.0] → K4 KIRMIZI, H1.0'ın alanı | ~1s |
| T10 | **açıklık uyarısı pakete girmiyor** | **KAPANDI 16.08** — uyarı artık `print-info.pdf` s.2'de çerçeveli kutu (adım listesinin İÇİNDE değil ÜSTÜNDE) + kalıbın kendi üstünde, dikilmeyen kenar boyunca etiket (A0 2×, A4 10×). Sayfa ile `print-report.txt` tek kaynaktan (`opening_facts()`) basılıyor, ayrışamazlar. **Ölçüm düzeltmesi:** T1 "hiçbir PDF'e girmiyor" dedi; doğrusu, `a65881e`'den beri adım 9 fermuarı anıyordu (1 satır) — eksik olan, o dikişin DİKİLMEYECEĞİ idi. Regresyon mandalı kuruldu: `printpack_sheet_check` (ctest #90), T4'ün montaj sırasını da tutuyor | ~1s |

T5 için "saatler/günler" demiyorum: **tanımı yok, ÖLÇÜLEMEZ.** K5 cevabından sonra ~1s.

---

## HEDEF 1 — ilk satış

Satış yüzeyi **Etsy** (karar: kendi sitesi = ödeme + trafik + hukuk, ilk satışı haftalarca geciktirir; TEK KAPI'nın sorusu zaten "Etsy'ye koyar mısın?").
Giysi: **mevcut oturtmalı elbise** (motorun bugün ürettiği tek aile).

| # | Halka | Kabul | Süre |
|---|---|---|---|
| H1.0 | **giyilebilirlik** | **KABUL KAPISI YAZILDI 17.08 → `docs/H1.0-KAPI.md`** (6 şart × 8 beden; kol oyuğu çevresi + grade · omuz dikişinin VARLIĞI · omuz ön/arka dengesi · yakanın KAPALI delik olması + çevresi · omzun üstünden geçen taşıyıcı yüzey). Fikstür `engine/tests/h10_gate_check.cpp`, ctest `h10_gate_check`, **bugün 55 yargıdan 48 FAIL** — sadece K2 (grade) yeşil. "Balensiz durur" ölçüye ÇEVRİLEMEDİ, sebebi kapı belgesinde yazılı. <br>**KIRMIZI — ÖLÇÜLDÜ 16.08.** Giysi hâlâ tüp. `GarmentSurf` 4 halka taşıyor (neck/bust/waist/hip), **omuz halkası yok**; omzun üstünden geçen hiçbir yüzey yok. Kol oyuğu bir DELİK değil, kenardaki çentik: **EU38 33.55cm**, Buğra Locket-38 **43.30cm** → bandın **6.45cm altında (%22 kısa)**. Yaka 23.34cm, boyun çevresi 35cm → yaka boyundan küçük. Omuz noktasında kumaş omzun **153.5mm altında**. PNG'ye gözle bakıldı: omuz yok, askı yok. Yapısal blokör: `buildGrid`'in (h,φ) ızgarası + `Slit`'in yalnız-bel çapası — ~610–1180 satır, 9 dosya | **25–45s** |
| H1.1 | paket tanımı mührü | **ÖLÇÜLDÜ 17.08 — AÇIK KALIYOR. `docs/SATIS-SARTNAMESI.md`** artık 17 maddenin hepsini bugünkü pakete karşı kanıtla taşıyor (taze koşu: `surface-pattern EU38` → `printpack.py`, sha256 `160146ae…`). **14/17 GEÇTİ.** §2 kalıp paketi **6/6** · §3 verimlilik **3/4** · §4 talimat **3/4** · §4b açıklık uyarısı (T10) **eklendi ve geçti** · §1 listing görseli **0/5**. <br>**Kapanmadı çünkü 3 madde gerçekten eksik** → aşağıdaki üç halka. <br>**Şartname 3 yerde BAYATTI, düzeltildi:** (a) *"SA 15mm gömülü"* — gerçek pay **10mm**, satıcı talimatıyla KANITLI, 15mm hiç ölçülmemişti; (b) *"9 fazlı construction order"* — sayı sabit değil, dikiş grafiğinden düşüyor, bugün **14 adım**; (c) **EMSAL REFERANSLARI'nın 3 dosyası da diskte YOK** (`benchmark-58/`) — silinmedi, üstü çizilip yazıldı; bantlar `contract/gusto-corpus.json`'da donmuş olduğu için §2/§3 ölçümleri ayakta, kaybolan yalnız kontakt sayfasının GÖRSELİ. <br>★ **Yan bulgu — BOŞ KOŞAN KAPI:** `style_check` (ctest) `engine/STYLE-PIN/` dizini **hiç yok** diye `PASS (nothing to enforce)` basıyor. Yeşil ama hiçbir şeyi tutmuyor; şartnamede kutucuk **işaretlenmedi**. **Ölçüm kapısına DOKUNULMADI.** | ~1s |
| H1.2 | kitapçık — motor çıktısından | **H1.0'ın ARKASINA alındı** (rota kararı: giysinin şekli değişecek) | ~4s |
| H1.3 | kapak + tek line drawing | **H1.0'ın ARKASINA alındı.** Damla'nın gözü (→ DAMLA-KUYRUK K3) | ~3s |
| H1.4 | listing — metin, fiyat, beden tablosu, lisans | **H1.0'ın ARKASINA alındı.** Etsy'ye yapıştırılabilir halde | ~3s |
| H1.1a | nesting önce/sonra sayfa sayısı | `printpack.log` yalnız SON sayıyı basıyor (A4 15 / A0 1); yarım-parça **öncesi** hiç üretilmiyor → F3 azaltma kanıtı YOK | ~1s |
| H1.1b | kumaş önerisi pakete girmiyor | `print-info.pdf` s.1 KUMAS yalnız **metraj** (110/140cm en → 1.53m); tür/ağırlık/döküm hiçbir sayfada yok. `knowledge/sewing-guide.md` diskte var, basılmıyor | ~1s |
| H1.1c | emsal PDF'leri diskte YOK → kontakt sayfası açılamıyor | ÖLÇÜM KAPISI'nın 3. şartı. `patterns_real/` telifli, Damla kararı olmadan kontakt sayfasına konamaz → `DAMLA-KUYRUK` | **Damla'da** |
| H1.5 | **Damla'nın dikimi** | giysi ayakta duruyor | Damla'da — **BLOKE ETMEZ** |
| H1.6 | kabul testi | 3 soru EVET + **hesaba geçen para** | Damla'da |

**Pazar emsali (repoda ölçülü):** `benchmark-58/bugra-ref/` — BugraPatterns elle Illustrator ile çiziyor, **5 ayda 1.1k satış**.

---

## HEDEF 2 — 10 cümle 10 kalıp

| # | Halka | Süre |
|---|---|---|
| H2.1 | spec şeması mührü (`contract/garment-spec-v2.DRAFT.md` → mühür) | 10s |
| H2.2 | **style line / bölge çıkarımı — KRİTİK YOL** | 40–80s |
| H2.3 | operatör dalgası: yaka ailesi · kol · etek ailesi · boy · kumaş ekseni | 60–100s |
| H2.4 | sanal muslin hakemi | 30–50s |
| H2.5 | F8 frontend | 10–20s |
| H2.6 | foto→spec sınıflandırma girişi (operatörler bitince) | 10–20s |
| H2.7 | **DÜRÜST RED yolu** — operatör sicili + kapsam sorgusu; red cümlesi eksik operatörü ADIYLA söyler | 8–15s |

> **KAPSAM BÜYÜDÜ: +1 halka (H2.7).** Sebebi: bitiş tanımı "kalanı eksik operatörünü söyleyerek reddeder" diyor. Bu, operatör listesinin makinede **sicil** olarak durmasını ve gelen spec'in bu sicile karşı sorgulanmasını gerektiriyor. H2.1–H2.6'nın hiçbiri bunu kendiliğinden vermiyor. Sessizce eklemek yerine halka yazıyorum.

---

## HEDEF 3 — flat hattı

| # | Halka | Süre |
|---|---|---|
| H3.1 | aynı yüzeyden çizgi çıkarımı | 80–120s (üçü aynı bütçe) |
| H3.2 | sadeleştirme | ↑ |
| H3.3 | Damla'nın kalemine oturtma | ↑ |
| H3.4 | zevk turları | **TAAHHÜT EDİLEMEZ** — hakem Damla; raporlarda `zevk turu N` diye sayılır |

---

## YASALAR — plan bunların üstüne kurulur

1. **Kapı boyanmaz.** Eşiğe, çözünürlüğe, tanıma dokunmak vardiyayı **durdurur** (16.08 emsali). Kapı düşerse yamalanmaz — yöntem değişir.
2. **Kanıtsız "bitti" geçersiz.** Her alt-ajan çıktısı: `halka X · kanıt Y (çalışan komut + sayı) · DOĞRULANMADI listesi`.
3. **Aynı anda en fazla 3 alt-ajan.** Düz fan-out, çarpan mimari yok, dar context, tavan 1 saat.
4. **Araştırma önce `knowledge/`'a sorar**, bulgu oraya döner — doğrulanmış yokluk dahil. 7 turda çıkmayan park edilir, gerekçesiyle.
5. **Motorun kendi çıktısı kanıt değildir.** Render → PNG → **gözle bakılır** (SVG path'e bakıp beğenmek yasak).
6. **Kota dolarsa** ajan kaldığı halkayı + kalan saat tahminini yazıp **durur**. Sessiz yavaşlama yasak.
7. **Kesintisizlik zorlaması yok.** Süreklilik context'e değil `.vardiya/state.json`'a bağlı.

---

## BRANCH DÜZENİ — YENİ DÜZEN (Damla kesin kararı, 17.08)

- **BÜTÜN İŞ `main`'DE.** `vardiya/2026-08-16` ve `f1-body-front-back` fast-forward ile main'e alındı (52 commit) ve **silindi** (lokal + remote). Kalan: `main` + `gh-pages` (site).
- **BRANCH AÇMAK YASAKTIR.** Açan ajan **ihlaldedir**; hakem turu kırmızı kapatır.
- Geçiş ölçümü: `git log vardiya..f1` **boş**, `git log vardiya..main` **boş** → hiçbir commit kaybolmadı, merge fast-forward oldu.

## MÜHÜR ARTIK TAG (Damla emri, 17.08)

"Sağlam nokta" branch değil, **git tag**. `scripts/taban.sh` **tam yeşil** bir mühürde `taban-<etiket>` tag'i atar ve push'lar (`FAILS=0` şartına bağlı, kod satır 200'ün altında). Satılabilir/dönülebilir noktalar **tag listesidir**; bir şey bozulursa **dönüş adresi son tag'dir**. `.vardiya/state.json` → `son_saglam_tag`.
Var olan tag'in üzerine yazılmaz — mühür geçmişi silinmez.

## PUSH KAPISI — İLAN EDİLEN TEK KIRMIZI

`rabadon` `pushGate`'i suite tam yeşil olmadan push'u blokluyor. Binary **commit mesajını okumuyor** (`gate.cpp:2823`; bilinen üst-seviye anahtarlar sabit liste) — "KIRMIZI öneki" kuralı guard'a yazılamaz, uydurma anahtar sessizce yok sayılırdı.
Yerine **tek isimle dışlama**: `ctest ... -E '^h10_gate_check$'`. O test H1.0'ın kabul kapısı ve **kasten kırmızı doğdu** (`docs/H1.0-KAPI.md`) — kendini geçiren kapı kapı değildir.
**Kapının eşiğine / toleransına / tanımına DOKUNULMADI**; yalnız rabadon'un *push ön-koşulundan* çıkarıldı ve her commit mesajı `KIRMIZI: h10_gate_check <n>/55` önekiyle sayıyı **ilan ediyor**.
Dışlama tek isim regexi → **başka bir test kırmızıya dönerse push YİNE bloke olur**, gerileme gizlenemez.
**H1.0 yeşillenince bu bölüm ve `-E` bayrağı SİLİNİR.**

## COMMIT SIKLIĞI (Damla emri, 17.08)

- **Bir adım = bir commit + push. MUTLAK, kırmızıdan etkilenmez.** Her alt-ajan işi bitince, her hakem kararından sonra, `HEDEF.md` / `.vardiya/state.json` / `DAMLA-KUYRUK.md` güncellemeleri dahil — istisnasız.
- **Taban kırmızıyken atılan commit `KIRMIZI: <kapı, kaç FAIL>` önekiyle atılır.** Bu kapı boyamak değil, kırmızılığın **İLANIDIR**.
- **30 dakikadan eski commit'lenmemiş değişiklik çalışma ağacında DURAMAZ.**

## TUR — tekrarlanan tek adım

```
1. OKU     .vardiya/state.json + HEDEF.md
2. SEÇ     kuyruktaki sıradaki halka dilimi
3. KOŞ     ≤3 ajan, düz fan-out, dar context, tavan 1 saat
4. MÜHÜR   ctest + determinizm çift koşusu → KIRMIZIYSA tur başarısız,
           halka kuyruğa geri açılır, YAMALANMAZ
5. HAKEM   rota denetimi
6. YAZ     rapor + üç sayaç + commit + push
7. DEVİR   state.json'a sonraki turun girdisi
```

### HAKEM
Her turun sonunda tek ajan, sadece `state.json` + son 5 raporu okur. Üç soru: sayaç düştü mü (düşmediyse sebebi ne) · halka hâlâ bitiş tanımına giden yolda mı · kapsam sessizce büyüdü mü. Çıktı `DEVAM` / `ROTA DEĞİŞ` (gerekçeli, kuyruğu yeniden sıralar/ekler/siler) / `DUR-SOR-DAMLA`. Her karar `state.json` sicilinde satır bırakır.

**TRIPWIRE:** Sayaç **3 tur üst üste düşmezse** hakemin `DEVAM` seçeneği **KAPANIR** — `ROTA DEĞİŞ` ya da `DUR-SOR-DAMLA` seçmek zorundadır. Sicilde `tripwire: active` olarak görünür.

**Her 10 turda bir kapsam hakemi:** bitiş tanımını halka listesine karşı okur, eksik olanı halka olarak ekler.

### DURMA SEBEBİ — sadece iki tane (Damla emri, 17.08)

**Vardiya raporu bir DURMA sebebi DEĞİLDİR, günlük ÇIKTIDIR.** Raporu yaz, commit'le, **sonraki tura DEVAM et.**
Meşru durma sebebi yalnız ikidir:
1. **KOTA** — kalan halka + kalan saat tahmini yazılır, durulur.
2. **DUR-SOR-DAMLA** — hedefe ya da kabul testine dokunmak gerekiyorsa.
Bunun dışında hiçbir şey turu bitirmez: taban kırmızısı değil, rapor değil, faz kapanışı değil.

### GÜNLÜK RAPOR
Her ~24 koşu saatinde `reports/YYYY-MM-DD-vardiya.txt` — **üç sayı + tek paragraf.** Tüccar raporu: hedefe mesafe, para ve tarih dilinde. Virtüöz anlatısı yok.

---

## DAMLA'YA DÜŞENLER — `DAMLA-KUYRUK.md`

beden cevabı · dikim · zevk hükümleri · `patterns_real` kararı. **BLOKE ETMEZ** — paralel halkalar koşmaya devam eder; bekleyen işi öne alıp "bekliyorum" diye durmak yasak.
