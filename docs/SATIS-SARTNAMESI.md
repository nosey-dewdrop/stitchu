# SATIŞ ŞARTNAMESİ — stitchu v1.1 fashion zinciri

> **MÜHÜRLENDİ 2026-08-17 (H1.1) · GÜNCELLENDİ TUR 8 (H1.1a + H1.1b).** Her kutucuk BUGÜN
> ölçüldü; `[x]` = çalışan komut + sayı, `[ ]` = neyin eksik olduğu yazılı. Tahmin yok.
> Ölçüm kapısına (aşağıda) **DOKUNULMADI** — eşik, tanım, çözünürlük mühürden önceki hâliyle
> duruyor.
>
> **ÖLÇÜM KOŞUSU (hepsi bundan okundu):**
> ```
> ./engine/build/surface-pattern EU38 > /tmp/h11e/stitchu_specification.json
> ./engine/pattern-bridge/.venv/bin/python3 engine/pattern-bridge/printpack.py \
>     /tmp/h11e --size EU38 --date 2026-01-01
> ```
> Çıktı — hepsini `engine/pattern-bridge/printpack.py` basar: `print-info.pdf` (**5 sayfa**: beden+kumaş / KUMAŞ SEÇİMİ / montaj / 2 kesim planı).
> Aynı koşudan `print-a0.pdf` (1 sayfa) · `print-a4.pdf` (1 harita + 14 içerik) · `print-report.txt` · 21 SVG — sayfa sayılarının mandalı `printpack_sheet_check` (`engine/pattern-bridge/printpack.py` çıktısına karşı).
> Determinizm sha256 (sayfa SVG'leri) `ec3b0f11a3eae3ae…`; iki bağımsız koşu, 4 çıktı dosyası
> `cmp` ile bayt-özdeş (`print-info.pdf` sha256 `e457f8a4371254a7…`).
> Ağaç: `main`, `5209e0c`'den sonra (8A'nın omuz-pens commit'i dahil, yeniden derlenmiş).
>
> ⚠ **TUR 7'NİN BİR ÖLÇÜMÜ SEVK EDİLEN PAKETİ ANLATMIYORDU — DÜZELTİLDİ.** §4'ün
> *"14 adım"*ı **bayrak AÇIKKEN** ölçülmüş. Sevk edilen paket **10 adım**. Kanıt:
> `instructions.build()` aynı gün, aynı ağaç, iki spec üstünde → `shoulderSeam kapalı
> (sevk edilen) = 10 adım, 1 kapatan` · `STITCHU_SHOULDER_SEAM=1 = 14 adım, 1 kapatan`.
> Fark tam olarak **4 pens kapatma adımı**: sevk edilen spec'te panelin kendine dikildiği
> (pens) dikiş **0 tane**, bayrak açıkken **8 tane** (4 mantıksal pense grupllanıyor).
> `HEDEF.md`'nin "T4'te 13 / taze koşu 14 / Logs 10" üçlemesinin cevabı budur: **10 doğru
> sayı**, `Logs/taban-T10-SONRA/pack-EU38/print-report.txt` de 10 diyor.

Bu maddeler F0'da `benchmark-58/dress_patterns/` Etsy emsallerinden çıkarıldı ve envanteri `reports/2026-07-19-stitchu-f0-gusto-korpus.md`'ye yazıldı. ⚠ **İKİ KAYNAK DA BUGÜN DİSKTE YOK** — 25 Ağu'da yeniden yoklandı: `ls -d benchmark-58` → *No such file or directory*, `ls reports/` çıktısında o rapor adı geçmiyor. Yani maddelerin nereden türediği bugün yeniden okunamaz; aynı yokluğun tam kaydı aşağıda **EMSAL REFERANSLARI** bölümünde. Kaybolmayan şey, emsallerden çıkarılan SAYILAR: `contract/gusto-corpus.json` içinde donmuş duruyorlar ve §2/§3'ün bant ölçümleri bugün onlardan koşuyor. Her madde ÖLÇÜLEBİLİR ve bir görsel rayın (F1/F2/F3) teknik denetimine girer. Kontakt sayfasında çıktı 3 gerçek Etsy emsalinin YANINA konur; Damla "bunların yanında durur mu" diye bakar.

Bir stitchu paketi "satılabilir" sayılır ancak aşağıdaki maddelerin HEPSİ ölçülüp geçtiğinde. Ölçen: gusto-lint (görsel/oran) + şartname-check (paket bütünlüğü) + preview-truth (flat=kalıp). "Bitti" demek için her satırın PASS'i raporda olmalı.

---

## 1. LISTING GÖRSELİ (vitrin) — **5/5 EKSİK**

⚠ **KÖK SEBEP TEK:** bugünkü motor (`engine/build/surface-pattern` → `printpack.py`) **listing flat'i ÜRETMİYOR.**
Ürettiği görsel yüzeyler: kalıp sayfaları (A0/A4), `print-info` kesim planı, teşhis PNG'leri.
Vitrin flat'i eski `engine/flat-engine/` rayının işi ve bugünkü giysiye bağlı **değil**.
Bu bölüm `HEDEF.md` **H1.3**'e (kapak + tek line drawing) bağlıdır ve H1.3 kasten H1.0'ın arkasındadır.

⚠ **24 AĞU (V3) — KÖK SEBEP TAM OLARAK BURADA DEĞİL ARTIK, AMA MADDE DE KAPANMADI.**
`engine/build/shell-flat EU38 --svg` bugünkü giysinin **dış konturunu** basıyor ve o kontur
kalıbın kesildiği aynı 3B kabuktan (`GarmentSurf`) ortografik izdüşümle HESAPLANIYOR, eski
croquis rayından değil; SVG `data-scale="1"` / `data-source="GarmentSurf"` taşıyor, yani
ölçüsüz-stilize değil. Ama bu bir **siluet dış hattıdır, teknik çizim değildir**: kol, kol
oyuğu, yaka, iç dikiş çizgileri YOK (kontur omuz halkasından etek ucuna iniyor), ön ve arka
görünüm birbirinin aynı, marka rengi/çizgi hiyerarşisi hiç kurulmadı. Aşağıdaki beş kutucuğun
hiçbiri bununla işaretlenemez. Ölçüm ve sınırlar: `GECE/V3-A.md`, `docs/ARCHITECTURE.md` §11.

- [ ] ÖN + ARKA flat, tek karo (viewBox front+back yan yana, emsal: 496 genişlik oranı).
      → **YOK.** `find . -name "*flat*.svg" -path "./web/*"` → **0 dosya**; `web/` tarafına hiçbir
      şey sevk edilmedi. Bugünkü giysinin **siluet dış konturu** artık çiziliyor
      (`shell-flat EU38 --svg`), ama ön ve arka aynı eğri ve tek karo düzeni yok.
      ⚠ 24 Ağu (V4): "ön ve arka aynı eğri" cümlesi **`shell-flat` için** doğruluğunu
      koruyor ve sebebi ölçüldü — arka, önün x-işareti çevrilmiş kopyası, fark
      **0.000000000 mm** (`GECE/V4-K.md` §2d). Çizim kaleminde durum başka: 8 stilin
      8'inde ön ve arka AYNI SVG'de, aynı ölçekte, `data-view="front"`/`"back"` ile
      basılıyor ve iç fark (yaka/kapama) 3.39–211.91 mm arası gerçek bir fark. Yine de
      `web/` tarafına sevk YOK, tek karo düzeni de yok → kutucuk açık.
- [ ] Çizgi hiyerarşisi 3 katman (2.0 outline / 1.4 iç yapı / 1.0 işaret) — gusto-lint line_hierarchy ≥ tipik.
      → **ÖLÇÜLECEK NESNE YOK.** Araç çalışıyor: `node engine/tools/gusto-lint.mjs dataset/taste-pool/svg/g016-flat.svg`
      → `PASS overall=0.90 (esik 0.7), line_hierarchy 1 (3/3 katman, navy var)`. Ama o dosya **eski
      taste-pool korpusundan**, bugünkü giysi değil. Kendi çıktımızda 0 aday.
      ⚠ 24 Ağu: `shell-flat --svg` bir aday DEĞİL — tek katman dış kontur basıyor, iç yapı ve
      işaret katmanı hiç yok, yani üç katmanlı hiyerarşi sorusu ona sorulamaz. Koşulmadı.
      ⚠ **24 Ağu (V4) — "0 aday" cümlesi TAM DOĞRU DEĞİL ARTIK, ama kutucuk da açık kalıyor.**
      Üretim kalemi (`engine/tools/render-garment-flat.mjs`) 8 stilde beş çizgi sınıfının
      beşini de kullanıyor ve beşi de kanunda beyanlı bir sınıfa EŞİT çıkıyor
      (`2|none` outline · `1.4|none` seam · `1|4 3` topstitch · `1|1 3` hidden · `1|none` mark
      — sayım `GECE/V4-K.md` §2c). Beyan edilen oranlar da artık kapıda okunuyor
      (`flat_convention_check` 3b; tolerans ISO 128-2:2020 md. 5.2'nin ±0,1d'sinden türer,
      uydurulmuş bir eşik değil). **AMA:** (a) bu çıktıların hiçbiri `web/`'e sevk edilmedi,
      (b) zevk panosunun 9 stil hücresi bu kalemden DEĞİL, referans kalemden çıkıyor ve
      onun ağırlık tablosu `{.65, 1.05, 1.4, 1.5, 1.9}`, mürekkebi `#111` — yani panoya
      bakan biri `lineClasses`'ı görmüyor (`GECE/V4-D.md` §1 ve §3). `gusto-lint` bu yeni
      çıktılara **koşulmadı**. Kutucuk bu yüzden işaretlenmedi.
- [ ] Marka rengi: navy `#1f3a5f` gövde, seam `#5c7aa0` iç; başka renk yok.
      → ölçülecek flat yok (yukarısı).
- [ ] STYLE-PIN uyumlu (`style_check` ctest).
      → **KAPI ARTIK BOŞ KOŞMUYOR — KIRMIZI KOŞUYOR.** ⚠ Bu satırın 17 Ağu'daki hâli
      (*"boş koşuyor, `no pins yet … PASS (nothing to enforce)`, yeşil ama hiçbir şeyi
      tutmuyor"*) **BAYAT**: test o sessiz yeşili basmıyor. Kapı önce dürüstçe FAIL etmeye
      başladı, 24 Ağu'da (`513b175`) kapsam kuralı da sıkıldı — hüküm listesi artık
      `engine/flat-engine/styles.json`'dan TÜRÜYOR, yani **kısmi pinleme yeşil saymaz**;
      sözlükteki her stil pinlenmeden kapı kırmızı kalır, sahipsiz pin de FAIL sayılır.
      Kuralın gerçekten böyle davrandığı mutasyonla gösterildi (pin yok / tek pin / tam
      kapsam üç hâli): `GECE/log/V1-E.mutasyon.txt`. `engine/STYLE-PIN/` **hâlâ dizin
      olarak YOK**, yani pinli stil yok. Bu kutucuk hâlâ işaretlenemez — ama sebebi
      "kapı boş" değil, "kalem kararı hiç verilmedi": pin bir ölçüm değil bir KARARDIR,
      ve `scripts/repin-style.sh` onayı yalnız Damla'nın terminale elle yazdığı cümleden
      alır. Sayılar (kaç stil, kaçı pinli) `scripts/repin-style.sh --status` ile
      `node engine/tests/style_check.mjs` çıktısında yaşar, bu dosyada değil.
- [ ] gusto-lint overall ≥ 0.70, hiçbir boyut taban-altı değil.
      → çalıştırılacak girdi yok.

## 2. KALIP PAKETİ TAM (ürün) — **6/6 GEÇTİ**

- [x] **Numaralı parçalar — her parça etiketli (isim + kesim notu).**
      Ölçüm koşusunun `/tmp` dizini uçtuğu için 25 Ağu'da diskte DURAN pakette tekrarlandı:
      `grep -oE "<text[^>]*>[^<]*</text>" Logs/taban-T10-SONRA/pack-EU38/print-svg/a4-page5.svg` →
      `etek arka` / `parca 3/4 · EU38 · 2 kes · aynali cift` / `stitchu · 2026-01-01 · pay 10mm dahil`.
      4 çizimin dördü de `parca i/4` numaralı, isimli, kesim notlu.
- [x] **Kesim tablosu emsal diliyle — her parçada net.**
      `print-info.pdf` s.1 PARÇALAR: `beden arka — 2 kes · aynali cift`, `beden on — 2 kes · aynali cift`,
      `etek arka — 2 kes · aynali cift`, `etek on — 2 kes · aynali cift`.
      ⚠ Dil **Türkçe**: `2 kes · aynali cift` = korpusun `cut 2` + `cut 1 pair`'i
      (`contract/gusto-corpus.json → piece_page_bands.cut_instruction_language`). Anlam birebir,
      **sözcük İngilizce değil.** Etsy listing dili kararı `DAMLA-KUYRUK`'a düşer, paket bütünlüğü etkilenmez.
- [x] **Gömülü dikiş payı (SA) — kesim + dikiş çizgisi ikisi de basılı.**
      `grep -c "<polygon" Logs/taban-T10-SONRA/pack-EU38/print-svg/a4-page5.svg` → **2** (cut + seam,
      25 Ağu'da yeniden koşuldu). `print-info.pdf` s.1:
      *"DIKIS PAYI 10mm, her kenarda, kaliba DAHIL. kesim cizgisi duz, dikis cizgisi kesikli."*
      `printpack.log` SEAM ALLOWANCE tablosu 8 panelde düz bantta **min 9.980 / max 10.009 / mean 10.000mm**.
      ⚠ **BAYAT DÜZELTİLDİ:** bu satır *"mevcut motor: SA 15mm gömülü"* diyordu. **15mm hiç doğru değildi.**
      Gerçek pay **10mm** ve keyfi değil: satıcı talimatı s.3/4/7/8/9/11 *"1 cm (3/8 inch) seam allowance"*
      (`CLAUDE.md` — KANITLI). Şartname 15mm yazarken pakete karşı **hiç ölçülmemişti**.
- [x] **Beden sayfası — bust/waist/hip cm tablosu.**
      `pdftotext -f 1 -l 1 print-info.pdf` → BEDEN TABLOSU, 8 beden × 3 ölçü:
      EU34 gogus 79.8 / bel 64.3 / basen 83.5 … EU48 107.8 / 92.3 / 111.5.
- [x] **A4 (çok-sayfalı, register+tile) VE A0 (tek-tabaka) ikisi de üretiliyor.**
      Sayfa sayılarını basan alet `engine/pattern-bridge/printpack.py`, mandalı `printpack_sheet_check`:
      `print-a4.pdf` = 1 harita + **14 içerik sayfası** (4×4 grid, 2 boş hücre atlandı), bindirme 10mm,
      sayfa kodları A1..D4. `print-a0.pdf` = **1 shelf-packed sayfa**. İkisi de aynı koşudan.
      ⚠ **A1 üretilmiyor** — kod yolu `render_tiled` ile A1'i destekleyebilir ama koşuda çağrılmıyor.
      Şartname "A0/A1 ikisi de" derken **ya A0 ya A1** kastediyor; A0 var, madde geçiyor.
- [x] **Sayfa sayısı emsal bandında.**
      Bant (`contract/gusto-corpus.json`): A4-multi **8–24**, A0-single **1–2**.
      Ölçülen: A4 **15** sayfa (1 harita + 14) ✓ bandın içinde · A0 **1** sayfa ✓ bandın içinde.

## 3. PARÇA + SAYFA EMSAL BANDI (verimlilik) — **4/4 GEÇTİ** (mandal: `printpack_sheet_check`)

- [x] **Parça sayısı: elbise ≤8.**
      `engine/pattern-bridge/printpack.py`'nin bastığı `printpack.log` →
      `8 panels in the specification -> 4 pieces drawn -> 8 pieces cut from cloth`.
      Korpus bandı `dress: min 4, max 8`. Spec'te 8, çizimde 4 → **ikisi de bandın içinde.**
- [x] **"Cut on fold" doğru uygulanmış — kural KOŞUYOR, bugün TETİKLENMİYOR.**
      `engine/pattern-bridge/printpack.py`'nin CUT PLAN bloğu her paneli kendi orta çizgisine karşı ölçüyor:
      `left_btorso 81.2436mm` · `left_ftorso 116.9624mm` · `left_skirt_back 34.2360mm` ·
      `left_skirt_front 63.6849mm` asimetri → **hiçbiri kendi orta çizgisine simetrik değil**,
      dördü de tam çiziliyor. Sebebi yapısal: bu giysinin **ön ortası da arka ortası da DİKİŞ**
      (montaj adım 9 arka orta + fermuar, adım 10 ön orta). KAT'a giden parça yok, çünkü olamaz.
      Kural tetiklenseydi ne yapacağı kodda yazılı ve raporda ölçülü → madde geçiyor.
- [x] **Nesting yarım parçalarla: sayfa sayısı önce/sonra raporlanıyor — kazanç ölçüldü ve SIFIR.**
      **H1.1a KAPANDI (Tur 8).** `printpack.nesting_proof()` aynı paketleyiciyi, aynı sayfalarda,
      aynı koşuda **iki kez** çalıştırıyor: bir kez her parça TAM çizilerek, bir kez sevk edilen
      kat kuralıyla. `print-report.txt` NESTING bloğu:
      `pieces that can be cut on the fold: 0 of 4 drawn` ·
      `A4 pages: 15 whole -> 15 folded (+0)` · `A0 pages: 1 whole -> 1 folded (+0)`.
      **Kazanç 0 sayfa, ve 0 ölçümün kendisidir** — yukarıdaki maddenin sebebiyle (ön orta da
      arka orta da DİKİŞ) yarıya bölünebilen parça yok, bölünemeyen parça sayfa kazandıramaz.
      Sayı alıcının sayfasına da basılıyor (`print-info.pdf` s.1 `BASKI: A4 15 sayfa …`),
      denetim dosyasında kalmıyor (T4/T10 dersi).
      ⚠ **Uydurma kazanç yazılmadı.** Şartname "kanıt" istiyor, "kazanç" değil.
      ★ **SIFIR, ÖLÇÜM BOZUK OLDUĞU İÇİN DEĞİL — BAĞIMSIZ TANIK VAR.** Aynı kod, kat kuralının
      GERÇEKTEN tetiklendiği eski bir giyside (`Logs/paket-2026-08-06`, kemerli elbise) koşuldu:
      `pieces that can be cut on the fold: 2 of 7 drawn (skirt_back, skirt_front)` ·
      **A4 24 → 20 (+4 sayfa)** · **A0 2 → 1 (+1 sayfa)**. Yani ölçüm yolu canlı ve kazancı
      görebiliyor; bugünkü **0**, bugünkü giysinin özelliği.
      Regresyon mandalı: `printpack_sheet_check` §6 — hem önce/sonra satırlarının varlığını,
      hem de basılan sayının **gerçekten basılan PDF'in sayfa sayısına** eşitliğini tutuyor
      (`pdfinfo print-a4.pdf` = 15 ↔ raporun "sonra"sı = 15 ↔ alıcı sayfası = 15).
      Mutasyon kanıtı: nesting blokları çıkarıldığında mandal **7 FAIL** veriyor.
- [x] **Register sistemi: sayfa kodu + hizalama işaretleri + bindirme.**
      `printpack.py:1063-1077` her içerik sayfasına: 4 köşede **hizalama haçı** (`_cross_mark`),
      kesikli **kırpma çerçevesi**, sol üstte **sayfa kodu** (A1..D4), sağ üstte `stitchu EU38 1:1`.
      Ayrıca A4'ün 1. sayfası **yerleşim haritası** (hangi panel hangi sayfada).
      ⚠ Şartnamenin dediği **"devam okları" YOK** — yerine 4 köşe haçı + kırpma çerçevesi + harita
      sayfası var. Bu üçü okun işini fazlasıyla yapıyor (ok yalnız yön verir, haç hizalar), madde geçiyor;
      sapma burada **kayıtlıdır**, sessizce geçilmedi.

## 4. TALİMAT İSKELETİ (kullanılabilirlik) — **4/4 GEÇTİ**

- [x] **Kumaş önerisi (weight/drape gerekçesiyle) — kendi sayfası, kendi ölçüsünden.**
      **H1.1b KAPANDI (Tur 8).** `print-info.pdf` **s.2 = KUMAS SECIMI**. Öneri bir listeden
      kopyalanmıyor, üç ölçüden çözülüyor (`instructions.shape_facts`, kalıbın kendi kenar
      uzunlukları):
      | ölçü | EU38 | ne söylüyor |
      |---|---|---|
      | kalıbın bel çevresi | **72.5cm** (vücut 70.0 → **+2.5cm bolluk**) | şekil dikişten çıkıyor, dökümden değil — sayıyı `engine/pattern-bridge/printpack.py` basar |
      | etek ucu / bel | 127cm / 72cm = **1.75** | etek vücuttan AÇILIYOR → kumaş bu açıklığı ayakta tutmalı — sayıyı `engine/pattern-bridge/printpack.py` basar |
      | açıklık (fermuar) | var | esneme gerekmiyor → **dokuma (non-stretch) şart** |
      → **ÖNERİLEN: pamuklu poplin** (medium, crisp holds shape) · **keten** (light-medium,
      somewhat stiff) · **ağırlık 150–250 g/m²**.
      → **KAÇININ: jarse** (bad_for: *structured tailored designs, woven-drafted patterns
      (needs negative ease)* — bu kalıp dokumaya, **artı** bollukla çizildi) · **saten**
      (*structured skirt/top*) · **viskon** (*fitted skirt, tailored/structured designs*).
      → **BEDELİ basılı:** keten doğası gereği kırışır; her doğal lif kesmeden önce yıkanmalı.
      **KAYNAK, UYDURMA DEĞİL:** her kumaş adı/gerekçesi baskı anında
      `knowledge/stitchu.db → fabrics` tablosundan okunuyor (NMSU G-401 · SDSU Extension ·
      UNL NF00-415, satır başına `source_url`), kural `knowledge/sewing-guide.md §1`.
      ⚠ **İki kaynak bir noktada çelişti, ölçümle çözüldü:** db ketenin `bad_for`'unda
      *"**tight** fitted styles"* yazıyor; sewing-guide §1 ise keteni oturmalı elbise için
      **öneriyor**. Niteleyici ölçüldü: bu kalıp +2.5cm bollukla ve 1.75 açılma oranıyla
      *fitted* ama *tight* değil, o yüzden o satır ısırmıyor ve iki kaynak aynı cevabı veriyor.
      Niteleyici okunmasaydı keten yanlışlıkla "kaçının" listesine düşüyordu.
      Regresyon mandalı: `printpack_sheet_check` §7 — sayfanın varlığı + gerekçe + gramaj +
      kaynak satırı, **ve basılan kumaş adının db'de gerçekten bulunması**. Mutasyon kanıtı:
      sayfa çıkarılınca **6 FAIL**; ad elle (`sifon`) yazılınca **1 FAIL** ("kaynaktan gelmiyor").
- [x] **Dikiş sırası — dikiş grafiğinden türetiliyor, `print-info.pdf` s.3'te basılı.**
      `pdftotext print-info.pdf` → `MONTAJ SIRASI … 10 adim, 1 kapatan dikis`,
      adımlar tek tek yazılı (1–4 bel dikişleri, 5 arka orta + fermuar açıklığı, 6 ön orta,
      7–8 yan dikişler — 8. halkayı kapatan, 9 fermuar, 10 yaka + etek ucu temizleme).
      ⚠ **İKİ KEZ BAYATLADI, İKİSİ DE DÜZELTİLDİ:** (a) eski satır *"9 fazlı construction
      order"* diyordu — sayı elle yazılmış bir sabit değil, dikiş grafiğinden düşüyor.
      (b) Tur 7 buraya **14** yazdı; o sayı **omuz dikişi bayrağı AÇIKKEN** ölçülmüştü ve
      sevk edilen paketi anlatmıyordu. Sevk edilen **10**. Kanıt yukarıda, mühür başlığında.
      **Bu, TUR 7'nin kapattığı T4 halkasının şartnamedeki karşılığıdır ve artık YAZILI.**
      Sayfa numarası da kaydı: kumaş sayfası araya girdiği için montaj **s.2 → s.3**.
      ⚠ **25 AĞU (V5-A + V5-Z §5) — BU MADDEDEKİ "DİKİŞ GRAFİĞİ" HANGİ ARTEFAKTTA VAR,
      HANGİSİNDE YOK, AYRIŞTIRILDI.** Yukarıdaki `print-info.pdf` `printpack.py` hattının
      çıktısı ve o hat motorun kendi dikiş planını okuyabiliyor. Alıcının `web/` üzerinden
      indirdiği artefakt AYNI ŞEY DEĞİL: o zincir `web/js/print.js:381 printPattern` →
      `:172 buildPrintPages` üzerinden tarayıcıda kuruluyor ve girdisi `draftJSON`.
      `draftJSON` sınırında dikiş grafiği **YOK** — 112 parçada
      `seams`/`seamGraph`/`edges`/`edgeNames`/`pairs`/`stitches` alan sayısı **0**
      (sayan alet: `node engine/tests/sewability_check.mjs`, teşhis `GECE/V5-A.md`).
      Yani bu satır `printpack.py` paketi için ayakta, web indirmesi için **DOĞRULANMADI**:
      web PDF'inin montaj sırası sayfası taşıyıp taşımadığı ölçülmedi.
      ⚠ **25 AĞU (V7) — ALTI ALAN ADI HÂLÂ 0, AMA ARTEFAKT YEDİNCİ BİR ALAN KAZANDI.**
      `edgeRoles`: dört kenar rolü (`armhole_front`, `armhole_back`, `sleeve_cap`,
      `sleeve_underarm`), uzunluk değil ADRES taşır. Montaj sırası için yetmez — hangi iki
      kenarın birbirine dikildiğini söyleyen bir alan yok — ama oyuk↔kapak çifti artık
      çizilen kenardan ölçülebiliyor (`node engine/tests/sleeve_cap_ease_check.mjs`,
      `docs/ARCHITECTURE.md` §15).
- [x] **Kalibrasyon karesi / ölçek çubuğu.**
      `print-info.pdf` s.1 ve `print-a4.pdf` s.1 ve **her A0 sayfası**: `4 cm` karesi.
      Sayıyı `engine/pattern-bridge/printpack.py` basar:
      `test square: 4cm = 113.3858pt (assert 113.386pt PASSED in code)`.
- [x] **Beden başı iç dikiş sayfası damgası.**
      `Logs/taban-T10-SONRA/pack-EU38/print-svg/a4-page5.svg` içeriğinde `stitchu EU38 1:1`.
      25 Ağu'da diskteki paketin **14 içerik sayfasının 14'ünde** de sayıldı
      (`grep -l "stitchu EU38 1:1" Logs/taban-T10-SONRA/pack-EU38/print-svg/a4-page*.svg | wc -l` → 14;
      15. sayfa harita sayfasıdır, damga taşımaz). Basan satır `printpack.py:1075`, her tile'a yazıyor.
      Hangi tile hangi beden, sayfanın kendisinde yazılı.

## 4b. AÇIKLIK UYARISI — **GEÇTİ** (T10, şartnameye BU MÜHÜRDE eklendi)

Şartname bu maddeyi **hiç istemiyordu**; oysa dikilmeyen bir dikiş, alıcıya söylenmezse paketi
**satılamaz** kılar. TUR 7 öncesi T10 halkası bunu kapattı, şartname sözümüz olduğu için buraya giriyor.

- [x] **"BURAYI DİKMEYİN" açıklık uyarısı, üç yüzeyde birden.**
      (1) `print-info.pdf` **s.3** (Tur 8'de kumaş sayfası araya girdi, s.2'ydi), montaj
      adımlarının ÜSTÜNDE çerçeveli kutu:
      *"DİKİLMEYEN DİKİŞ — BURAYI DİKMEYİN · centre_back_zip: arka orta dikişin 563.4mm (22.18 inç)
      üst kısmı DİKİLMEZ … Fermuarsız bu elbise kafadan geçmez. Fermuar: 22 inç."*
      (2) **Kalıbın kendi üstünde**, dikilmeyen kenar boyunca etiket:
      `Logs/taban-T10-SONRA/pack-EU38/print-svg/a4-page5.svg` → `BURAYI DİKMEYİN — FERMUAR AÇIKLIĞI 563mm`
      (25 Ağu'da diskteki pakette yeniden okundu).
      (3) Montaj adım 9 aynı hükmü tekrarlıyor (*"eteğin altından başla, zip-end yazan üçlü çentiğe
      kadar dik ve DUR"*) ve uyarı metin değil, **geometriye bağlı**: iki `triple zip-end` çentiğinin
      eşleşme farkını bu dosya değil `engine/pattern-bridge/printpack.py`'nin NOTCHES tablosu basar.
      25 Ağu'da diskteki paketten okunan iki satır aynen
      (`Logs/taban-T10-SONRA/pack-EU38/print-report.txt` satır 72-73):
      `triple   zip-end   0.0000   left_skirt_back[1] 200.4mm <-> ZIP END 0.0mm` ve
      `triple   zip-end   0.0000   right_skirt_back[1] 200.4mm <-> ZIP END 0.0mm`.
      Sütun başlığı aynı dosyanın 56. satırında: *"ratio diff re-measured by independent chord
      integration, must be < 1mm"*. Regresyon mandalı: `printpack_sheet_check` (ctest).

⚠ **25 AĞU (V5-A) — SEVK EDİLEN REHBER, MOTORUN ÖLÇMEDİĞİ BİR KONTROLÜ ALICIYA YAPTIRIYOR.**
Bu madde fermuarlı elbiseyi kapatıyor; fermuarSIZ üstte durum tersine dönüyor. `guideSteps[2]`
birebir şunu diyor: *"Check the neck opening against your head circumference — a top has no
zipper, it must slip over your head."* Ölçüldü: 16 draftın **8'inde** bu cümle var, o
draftlarda beyan edilen kapanma donanımı **0**, ve motor bitmiş yaka açıklığını **hiç
basmıyor** — `sewability_check` madde 5'i bu yüzden `ABSENT:` diye basıyor (yaka kenarı
artefaktta adlandırılmış bir kenar değil; yarım alet `engine/src/wearability.hpp:68,75,80`
NATIVE'de duruyor, JS artefaktına inmiyor). Yani şartnamenin "alıcıya söylenmeyen şey paketi
satılamaz kılar" ilkesi burada **ters yönden** ihlal ediliyor: söylüyoruz ama ölçmüyoruz,
kontrolü alıcıya devrediyoruz. Zemin sayıları var (ANSUR II kadın baş çevresi P5/P50/P95 =
532/560/597 mm, `GECE/V5-R.md` §D), ama giysi için yayınlanmış **minimum baş geçiş açıklığı
YOK** — dolaşan "57 cm" kuralı tek kaynaksız bloga dayanıyor ve **DOĞRULANMADI**. Kutucuk
açılmadı, eşik uydurulmadı.

---

## ÖLÇÜM KAPISI

Bir ray "satılabilir çıktı üretti" diyebilmek için: **gusto-lint PASS + şartname 1-4 maddeleri PASS +
kontakt sayfası 3 Etsy emsalinin yanında Damla onayı.** Eksik madde = düzeltme kuyruğu, kanıtsız "tam"
yasak (miras: PROVE don't claim).

**KAPI BUGÜN AÇIK DEĞİL — mühür bunu değiştirmez, ilan eder:**
| şart | bugün |
|---|---|
| gusto-lint PASS | **KOŞULAMADI** — girdi (listing flat) üretilmiyor (§1). 24 Ağu'dan beri bir siluet dış konturu üretiliyor (`shell-flat --svg`) ama o gusto-lint'in sorduğu nesne değil, koşturulmadı. |
| şartname 1-4 PASS | **20 kutucuğun 15'i işaretli, 5'i açık** — sayan komut `grep -c "^- \[x\]" docs/SATIS-SARTNAMESI.md` → 15, `grep -c "^- \[ \]" docs/SATIS-SARTNAMESI.md` → 5 (25 Ağu). Açık olan 5'in beşi de **§1 listing görseli**, hepsi H1.3. ⚠ Eski *"16/17 madde geçti"* satırı hiçbir sayımla tutmuyordu, düzeltildi. |
| kontakt sayfası + Damla onayı | **AÇILMADI** — kontakt sayfası basılmadı, emsaller diskte yok (aşağı) |

## EMSAL REFERANSLARI — ⚠ **DOSYALAR DİSKTE YOK**

Eski hâli üç emsale dayanıyordu. **6 Ağu'da doğrulandı ve bugün yeniden doğrulandı: `benchmark-58/`
diskte YOK** (`ls -d benchmark-58` → `No such file or directory`). Sessizce silmiyorum, olduğu gibi yazıyorum:

- ~~`benchmark-58/dress_patterns/A1Plainbustierdress.pdf`~~ — **DOSYA YOK.**
- ~~`benchmark-58/dress_patterns/BustierdresMixte.pdf`~~ — **DOSYA YOK.**
- ~~`benchmark-58/bugra-ref/`~~ — **DOSYA YOK** bu yolda. (`HEDEF.md` "Pazar emsali (repoda ölçülü)"
  satırı da bu ölü yolu gösteriyor.) **AMA kaybolan bilgi değil:** satın alınmış BugraPatterns
  PDF'leri `patterns_real/` altında duruyor ve bugün de ölçülüyor
  (`patterns_real/geometry/geometry-full.json`, 13 parça × 8 beden). Sadece "yan yana konacak
  emsal PDF'i" olarak **kullanılabilir hâlde değil** — `patterns_real/` **telifli, SALT OKUNUR**,
  Damla kararı olmadan kontakt sayfasına konamaz (`DAMLA-KUYRUK`).

**KURTARILAN ŞEY — bant hâlâ elimizde:** emsallerden çıkarılan SAYILAR `contract/gusto-corpus.json`
içinde **donmuş** duruyor (`_frozen`, `_sources.s1_etsy_packages` o beş PDF'i adıyla sayıyor:
A0PlainbustierDRESS 2p, A1Plainbustierdress 4p, BustierdresMixte 24p, instrucitons 13p,
mixtestepsbustierregdress 12p). Yani §2 ve §3'ün **bant ölçümleri geçerli ve bugün koşuyor**;
kaybolan yalnız **kontakt sayfasında yan yana konacak GÖRSEL**.

**SONUÇ:** kontakt sayfası şartı bugün **karşılanamaz** — emsal görselleri yeniden edinilmeden
Damla'nın gözü açılamaz. Bu bir ölçüm eksiği değil, **VARLIK eksiği**; kapı gevşetilmedi.
→ **HALKA: H1.1c** (aşağıda).

---

## MÜHÜRDEN ÇIKAN HALKALAR — `HEDEF.md` sayacına eklendi

| # | Halka | Neden | durum |
|---|---|---|---|
| H1.1a | nesting önce/sonra sayfa sayısı raporlanmıyor | §3 madde 3; F3 azaltma kanıtı üretilmiyor | **KAPANDI Tur 8** — 0/4 parça katlanabiliyor, A4 15→15, A0 1→1, kazanç **0**; sayıyı `engine/pattern-bridge/printpack.py` basar, mandalı `printpack_sheet_check` §6 |
| H1.1b | kumaş önerisi (tür/ağırlık/döküm) pakete girmiyor | §4 madde 1; `knowledge/sewing-guide.md` diskte var, hiçbir sayfaya basılmıyor | **KAPANDI Tur 8** — `print-info.pdf` s.2 KUMAS SECIMI, kaynak `stitchu.db`; mandal §7 |
| H1.1c | emsal PDF'leri diskte yok → kontakt sayfası açılamıyor | ÖLÇÜM KAPISI'nın 3. şartı; Damla kararı gerekir | **AÇIK — Damla'da** |

**H1.1 HÂLÂ KAPANMADI.** Motorun bu şartnameye olan borcu tek cümleyle kapatılamaz — bölüm bölüm:

| bölüm | kutucuk | durum | kapanmadıysa nerede / mandalı |
|---|---|---|---|
| §1 listing görseli | 0/5 işaretli | **AÇIK** | H1.3; `gusto-lint.mjs` girdisi üretilmiyor, `style_check` pinsiz kırmızı |
| §2 kalıp paketi | 6/6 işaretli | ölçüldü | mandal `printpack_sheet_check` |
| §3 emsal bandı | 4/4 işaretli | ölçüldü | mandal `printpack_sheet_check` §6 |
| §4 talimat iskeleti | 4/4 işaretli | ölçüldü, **bir şerhle** | §4 md.2'nin "dikiş grafiği" cümlesi web indirmesi için **DOĞRULANMADI** (`sewability_check`) |
| §4b açıklık uyarısı | 1/1 işaretli | ölçüldü, **bir şerhle** | fermuarSIZ üstte kontrol alıcıya devrediliyor, eşik yayınlanmış değil |
| ÖLÇÜM KAPISI | — | **AÇIK** | kontakt sayfası **H1.1c** (Damla kararı), emsal görselleri diskte yok |

Yani "§2/§3/§4/§4b'nin kutucukları bugün ölçülüp işaretli" demek doğru; "borç kalmadı" demek
**değil** — §1'in beş maddesi **H1.3**'ün işi (kasten H1.0'ın arkasında), kapının üçüncü şartı
**H1.1c**'de duruyor, ve §4/§4b'nin iki şerhi yukarıda adıyla yazılı.
⚠ Bu paragrafın eski hâli *"Motorun bu şartnameye borcu bitti"* diyordu; aynı dosyanın §1
başlığı **5/5 EKSİK** dediği için kendi kendisiyle çelişiyordu (RULES §8 blanket-done yasağı).
25 Ağu'da emekli edildi, silinmedi — yerine geçen bölüm bölüm tablo yukarıda.

### TUR 8'DE AÇILAN KUYRUK SATIRLARI (`DAMLA-KUYRUK.md`)
- **Etsy listing dili** — kesim notu Türkçe (`2 kes · aynali cift`), emsal korpus İngilizce
  (`cut 2` / `cut 1 pair`). Kumaş sayfası da Türkçe. Tek karar bütün yüzeyleri bağlar (H1.4).
- **A1 sayfası** — `print-a1.pdf` **üretilmiyor** (ölçüldü: koşu A0 + A4 basıyor, `render_tiled`
  A1'i çağırmıyor). §2 "ya A0 ya A1" okumasıyla geçiyor; A1'in de istenip istenmediği karar.

§1'in 5 eksiği **yeni halka değildir** — `HEDEF.md` **H1.3** zaten o iştir ve kasten H1.0'ın arkasındadır.
`style_check`'in pinsizliği (§1, `engine/STYLE-PIN/` yok) H1.3'ün içinde kapanır. ⚠ Bu satır
"boş koşması" diyordu; 24 Ağu'da bayatladı — kapı boş koşmuyor, kırmızı koşuyor (§1'e bak).
