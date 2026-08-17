# HEDEF — stitchu

**Bu dosya reponun en üst otoritesidir.** ANAYASA / DERSLER / ROADMAP / CLAUDE.md ile çelişki çıkarsa çelişki bu dosya lehine **tek karar commit'iyle** kapanır; o commit'te diğer dosyanın çelişen satırı **silinir**. İki doğru bırakılmaz.

Açıldı: 2026-08-16 · Branch: `vardiya/2026-08-16`

---

## SAYAÇ

```
H1'e kalan:  5 halka / 25–37 koşu saati    [H1.0: 25–45 → 20–38 → 18–35 → **14–26s**]
H2'ye kalan: 7 halka / 168–295 koşu saati
H3'e kalan:  4 halka / 80–120 koşu saati + zevk turu 0
TABAN:       4 halka / ~3–4 koşu saati     [T2,T3,T4,T6,T7,T8,T9,T10,T11 kapandı · T1 yok-hükmünde · T5 bloke · +T12,T13,T14]
```

**T9 KAPANDI 17.08.** `arapFlatten`'ın `rounds`'u sayaç olmaktan çıkıp **TAVAN** oldu; duruş şartı çözücünün kendi cevabı (bir turda max düğüm yer değişimi `< 1e-4mm`). `60 → 400` YAPILMADI — ölçüldü, gövde panelleri **69–95 turda** bitiyor, 60 sadece 10–35 tur eksikmiş. Sonuç: bel dönüş açısı 8 bedende **±0.54°** içinde (önce EU46 +88.31°), `maxStrain` **%28.61/32.51/34.62 → 8 bedende %0.77–0.87**, bel dikiş sayısı 10–26 arası dağınıktan **8 bedende de 14**'e. `flatten_check`'in sertifikaları ayakta (koni bit-aynı 0.005814°). Bedel **+3.1 saniye**.

> **KAPSAM BÜYÜDÜ: +3 halka (T12, T13, T14). Sebebi:** Tur 5, bozuk `10`/`12` scriptlerini düzeltirken üç bağımsız açık kalem bıraktı. Üçü de bugün karar besliyor.

| # | Halka | Ölçülen | Süre |
|---|---|---|---|
| T12 | `flatten-research/13-digitize-multisize.py` aynı bozuk ofseti taşıyor | `inward_offset`+`line_isect` kopyası; `13`'ten türemiş her sayı hâlâ şüpheli. Çalıştırılmadı | ~0.5s |
| T13 | fikstür işaret şartını **yargılamıyor**, sadece basıyor | K9 hükmü belgelere yazıldı (`ön_yay ≤ arka_yay` **ve** `ön_yay/kiriş > arka_yay/kiriş`) ama `h10_gate_check` onu hüküm olarak koşmuyor | ~1s |
| T14 | **net cap ease NEGATİF** — düz set-in dikişte fiziksel olarak tuhaf | Düzeltilmiş ölçüm: oyuk **468.33mm**, kapak **446.43mm**, ease **−21.90mm (−4.7%)**. Üç ihtimal DOĞRULANMADI: oyuğa giden kenar aslında Upper Sleeve mi · Lower tam oyuğa oturmuyor mu · `KAPAK` landmark ataması hatalı mı. **K1'in hedef bandını etkileyebilir** | 1–2s |

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
| H1.1 | paket tanımı mührü | `docs/SATIS-SARTNAMESI.md` zaten kalem kalem tanımlıyor → mühürlenecek | ~1s |
| H1.2 | kitapçık — motor çıktısından | **H1.0'ın ARKASINA alındı** (rota kararı: giysinin şekli değişecek) | ~4s |
| H1.3 | kapak + tek line drawing | **H1.0'ın ARKASINA alındı.** Damla'nın gözü (→ DAMLA-KUYRUK K3) | ~3s |
| H1.4 | listing — metin, fiyat, beden tablosu, lisans | **H1.0'ın ARKASINA alındı.** Etsy'ye yapıştırılabilir halde | ~3s |
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

## BRANCH DÜZENİ (Damla emri, 17.08)

- **Koşu bitene kadar hiçbir branch silinmez, yeniden adlandırılmaz. `gh-pages`'e dokunulmaz.**
- **Yeni branch AÇILMAZ.** Bütün iş `vardiya/2026-08-16`'da. Ajanlardan biri branch açarsa **hakem bunu ihlal sayar** ve turu kırmızı kapatır.
- **KOŞU SONU TOPOLOJİSİ:** `vardiya/2026-08-16` → `main`'e **mühürlü merge** (taban mührü + üç sayaç raporu commit'in içinde), *sonra* `f1-body-front-back` kapanır. Bu sıra değişmez.
- Ölçüm 17.08: `git log vardiya/2026-08-16..f1-body-front-back` **boş** → f1 vardiyanın içinde, taşınacak commit yok.

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

### GÜNLÜK RAPOR
Her ~24 koşu saatinde `reports/YYYY-MM-DD-vardiya.txt` — **üç sayı + tek paragraf.** Tüccar raporu: hedefe mesafe, para ve tarih dilinde. Virtüöz anlatısı yok.

---

## DAMLA'YA DÜŞENLER — `DAMLA-KUYRUK.md`

beden cevabı · dikim · zevk hükümleri · `patterns_real` kararı. **BLOKE ETMEZ** — paralel halkalar koşmaya devam eder; bekleyen işi öne alıp "bekliyorum" diye durmak yasak.
