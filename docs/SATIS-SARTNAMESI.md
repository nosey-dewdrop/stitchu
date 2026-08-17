# SATIŞ ŞARTNAMESİ — stitchu v1.1 fashion zinciri

> **MÜHÜRLENDİ 2026-08-17 (H1.1).** Her kutucuk BUGÜN ölçüldü; `[x]` = çalışan komut + sayı,
> `[ ]` = neyin eksik olduğu yazılı. Tahmin yok. Ölçüm kapısına (aşağıda) **DOKUNULMADI** —
> eşik, tanım, çözünürlük mühürden önceki hâliyle duruyor.
>
> **ÖLÇÜM KOŞUSU (hepsi bundan okundu):**
> ```
> ./engine/build/surface-pattern EU38 > /tmp/h11pack/stitchu_specification.json
> ./engine/pattern-bridge/.venv/bin/python3 engine/pattern-bridge/printpack.py \
>     /tmp/h11pack --size EU38 --date 2026-01-01
> ```
> Çıktı: `print-info.pdf` (4 sayfa) · `print-a0.pdf` (1 sayfa) · `print-a4.pdf` (1 harita + 14 içerik)
> · `print-report.txt` · 20 SVG. Determinizm sha256 (sayfa SVG'leri) `160146aeb579e07e…`.
> Ağaç: `main`, T15 commit'inden sonra.

F0'da `benchmark-58/dress_patterns/` Etsy emsallerinden çıkarıldı. Her madde ÖLÇÜLEBİLİR ve bir görsel rayın (F1/F2/F3) teknik denetimine girer. Kontakt sayfasında çıktı 3 gerçek Etsy emsalinin YANINA konur; Damla "bunların yanında durur mu" diye bakar. Kaynak envanteri: `reports/2026-07-19-stitchu-f0-gusto-korpus.md`.

Bir stitchu paketi "satılabilir" sayılır ancak aşağıdaki maddelerin HEPSİ ölçülüp geçtiğinde. Ölçen: gusto-lint (görsel/oran) + şartname-check (paket bütünlüğü) + preview-truth (flat=kalıp). "Bitti" demek için her satırın PASS'i raporda olmalı.

---

## 1. LISTING GÖRSELİ (vitrin) — **5/5 EKSİK**

⚠ **KÖK SEBEP TEK:** bugünkü motor (`engine/build/surface-pattern` → `printpack.py`) **listing flat'i ÜRETMİYOR.**
Ürettiği görsel yüzeyler: kalıp sayfaları (A0/A4), `print-info` kesim planı, teşhis PNG'leri.
Vitrin flat'i eski `engine/flat-engine/` rayının işi ve bugünkü giysiye bağlı **değil**.
Bu bölüm `HEDEF.md` **H1.3**'e (kapak + tek line drawing) bağlıdır ve H1.3 kasten H1.0'ın arkasındadır.

- [ ] ÖN + ARKA flat, tek karo (viewBox front+back yan yana, emsal: 496 genişlik oranı).
      → **YOK.** `find . -name "*flat*.svg" -path "./web/*"` → **0 dosya**. Bugünkü giysinin flat'i hiç çizilmedi.
- [ ] Çizgi hiyerarşisi 3 katman (2.0 outline / 1.4 iç yapı / 1.0 işaret) — gusto-lint line_hierarchy ≥ tipik.
      → **ÖLÇÜLECEK NESNE YOK.** Araç çalışıyor: `node engine/tools/gusto-lint.mjs dataset/taste-pool/svg/g016-flat.svg`
      → `PASS overall=0.90 (esik 0.7), line_hierarchy 1 (3/3 katman, navy var)`. Ama o dosya **eski
      taste-pool korpusundan**, bugünkü giysi değil. Kendi çıktımızda 0 aday.
- [ ] Marka rengi: navy `#1f3a5f` gövde, seam `#5c7aa0` iç; başka renk yok.
      → ölçülecek flat yok (yukarısı).
- [ ] STYLE-PIN uyumlu (`style_check` ctest).
      → **KAPI BOŞ KOŞUYOR.** `node engine/tests/style_check.mjs` →
      `no pins yet (engine/STYLE-PIN boş) — PASS (nothing to enforce)`; `engine/STYLE-PIN/` **dizin olarak YOK**.
      Yeşil ama **hiçbir şeyi tutmuyor**; bu kutucuk o yeşille işaretlenemez.
- [ ] gusto-lint overall ≥ 0.70, hiçbir boyut taban-altı değil.
      → çalıştırılacak girdi yok.

## 2. KALIP PAKETİ TAM (ürün) — **6/6 GEÇTİ**

- [x] **Numaralı parçalar — her parça etiketli (isim + kesim notu).**
      `grep -oE "<text[^>]*>[^<]*</text>" /tmp/h11pack/print-svg/a4-page5.svg` →
      `etek arka` / `parca 3/4 · EU38 · 2 kes · aynali cift` / `stitchu · 2026-01-01 · pay 10mm dahil`.
      4 çizimin dördü de `parca i/4` numaralı, isimli, kesim notlu.
- [x] **Kesim tablosu emsal diliyle — her parçada net.**
      `print-info.pdf` s.1 PARÇALAR: `beden arka — 2 kes · aynali cift`, `beden on — 2 kes · aynali cift`,
      `etek arka — 2 kes · aynali cift`, `etek on — 2 kes · aynali cift`.
      ⚠ Dil **Türkçe**: `2 kes · aynali cift` = korpusun `cut 2` + `cut 1 pair`'i
      (`contract/gusto-corpus.json → piece_page_bands.cut_instruction_language`). Anlam birebir,
      **sözcük İngilizce değil.** Etsy listing dili kararı `DAMLA-KUYRUK`'a düşer, paket bütünlüğü etkilenmez.
- [x] **Gömülü dikiş payı (SA) — kesim + dikiş çizgisi ikisi de basılı.**
      `grep -c "<polygon" print-svg/a4-page5.svg` → **2** (cut + seam). `print-info.pdf` s.1:
      *"DIKIS PAYI 10mm, her kenarda, kaliba DAHIL. kesim cizgisi duz, dikis cizgisi kesikli."*
      `printpack.log` SEAM ALLOWANCE tablosu 8 panelde düz bantta **min 9.980 / max 10.009 / mean 10.000mm**.
      ⚠ **BAYAT DÜZELTİLDİ:** bu satır *"mevcut motor: SA 15mm gömülü"* diyordu. **15mm hiç doğru değildi.**
      Gerçek pay **10mm** ve keyfi değil: satıcı talimatı s.3/4/7/8/9/11 *"1 cm (3/8 inch) seam allowance"*
      (`CLAUDE.md` — KANITLI). Şartname 15mm yazarken pakete karşı **hiç ölçülmemişti**.
- [x] **Beden sayfası — bust/waist/hip cm tablosu.**
      `pdftotext -f 1 -l 1 print-info.pdf` → BEDEN TABLOSU, 8 beden × 3 ölçü:
      EU34 gogus 79.8 / bel 64.3 / basen 83.5 … EU48 107.8 / 92.3 / 111.5.
- [x] **A4 (çok-sayfalı, register+tile) VE A0 (tek-tabaka) ikisi de üretiliyor.**
      `print-a4.pdf` = 1 harita + **14 içerik sayfası** (4×4 grid, 2 boş hücre atlandı), bindirme 10mm,
      sayfa kodları A1..D4. `print-a0.pdf` = **1 shelf-packed sayfa**. İkisi de aynı koşudan.
      ⚠ **A1 üretilmiyor** — kod yolu `render_tiled` ile A1'i destekleyebilir ama koşuda çağrılmıyor.
      Şartname "A0/A1 ikisi de" derken **ya A0 ya A1** kastediyor; A0 var, madde geçiyor.
- [x] **Sayfa sayısı emsal bandında.**
      Bant (`contract/gusto-corpus.json`): A4-multi **8–24**, A0-single **1–2**.
      Ölçülen: A4 **15** sayfa (1 harita + 14) ✓ bandın içinde · A0 **1** sayfa ✓ bandın içinde.

## 3. PARÇA + SAYFA EMSAL BANDI (verimlilik) — **3/4 GEÇTİ**

- [x] **Parça sayısı: elbise ≤8.**
      `printpack.log` → `8 panels in the specification -> 4 pieces drawn -> 8 pieces cut from cloth`.
      Korpus bandı `dress: min 4, max 8`. Spec'te 8, çizimde 4 → **ikisi de bandın içinde.**
- [x] **"Cut on fold" doğru uygulanmış — kural KOŞUYOR, bugün TETİKLENMİYOR.**
      `printpack.log` CUT PLAN her paneli kendi orta çizgisine karşı ölçüyor:
      `left_btorso 81.2436mm` · `left_ftorso 116.9624mm` · `left_skirt_back 34.2360mm` ·
      `left_skirt_front 63.6849mm` asimetri → **hiçbiri kendi orta çizgisine simetrik değil**,
      dördü de tam çiziliyor. Sebebi yapısal: bu giysinin **ön ortası da arka ortası da DİKİŞ**
      (montaj adım 9 arka orta + fermuar, adım 10 ön orta). KAT'a giden parça yok, çünkü olamaz.
      Kural tetiklenseydi ne yapacağı kodda yazılı ve raporda ölçülü → madde geçiyor.
- [ ] **Nesting yarım parçalarla: sayfa sayısı önce/sonra raporlanmıyor.**
      → **EKSİK.** `printpack.log` yalnız SON sayfa sayısını basıyor (A4 15 / A0 1); yarım-parça
      **öncesi** sayı hiç üretilmiyor, dolayısıyla "F3 azaltma kanıtı" **yok**. Üstelik yukarıdaki
      madde gereği bugün yarım çizilen parça da yok → kıyas bugün **anlamsız**, ama ölçüm yolu da yok.
      → **HALKA: H1.1a** (aşağıda).
- [x] **Register sistemi: sayfa kodu + hizalama işaretleri + bindirme.**
      `printpack.py:1063-1077` her içerik sayfasına: 4 köşede **hizalama haçı** (`_cross_mark`),
      kesikli **kırpma çerçevesi**, sol üstte **sayfa kodu** (A1..D4), sağ üstte `stitchu EU38 1:1`.
      Ayrıca A4'ün 1. sayfası **yerleşim haritası** (hangi panel hangi sayfada).
      ⚠ Şartnamenin dediği **"devam okları" YOK** — yerine 4 köşe haçı + kırpma çerçevesi + harita
      sayfası var. Bu üçü okun işini fazlasıyla yapıyor (ok yalnız yön verir, haç hizalar), madde geçiyor;
      sapma burada **kayıtlıdır**, sessizce geçilmedi.

## 4. TALİMAT İSKELETİ (kullanılabilirlik) — **3/4 GEÇTİ**

- [ ] **Kumaş önerisi (weight/drape gerekçesiyle).**
      → **EKSİK.** `print-info.pdf` s.1 KUMAS bölümü yalnız **metraj** veriyor
      (110cm en → 1.53m, 140cm en → 1.53m, gerekçesiyle). **Kumaş TÜRÜ / ağırlığı / dökümü
      hiçbir yerde yazmıyor.** "Mevcut sewing companion katmanı" diyen eski satır **bayattı**:
      `knowledge/sewing-guide.md` diskte var ama pakete basılan hiçbir sayfaya girmiyor
      (`grep -ri "kumas\|fabric" print-svg/info-page*.svg` → yalnız metraj satırları).
      → **HALKA: H1.1b** (aşağıda).
- [x] **Dikiş sırası — dikiş grafiğinden türetiliyor, `print-info.pdf` s.2'de basılı.**
      `pdftotext -f 2 -l 2 print-info.pdf` → `MONTAJ SIRASI … 14 adim, 1 kapatan dikis`,
      adımlar tek tek yazılı (1–4 pens kapatma, 5–8 bel dikişleri, 9 arka orta + fermuar,
      10 ön orta, … son adım halkayı kapatan yan dikiş).
      ⚠ **BAYAT DÜZELTİLDİ:** eski satır *"9 fazlı construction order"* diyordu. Sayı **elle yazılmış
      bir sabit değil**, dikiş grafiğinden düşüyor ve bugün **14**. (T4 kapanışında 13'tü; aradaki
      fark pens adımlarının ayrışması — sayıyı şartnameye SABİT yazmak yanlıştı, kural yazılır.)
      **Bu, TUR 7'nin kapattığı T4 halkasının şartnamedeki karşılığıdır ve artık YAZILI.**
- [x] **Kalibrasyon karesi / ölçek çubuğu.**
      `print-info.pdf` s.1 ve `print-a4.pdf` s.1 ve **her A0 sayfası**: `4 cm` karesi,
      `printpack.log` → `test square: 4cm = 113.3858pt (assert 113.386pt PASSED in code)`.
- [x] **Beden başı iç dikiş sayfası damgası.**
      `print-svg/a4-page5.svg` içeriğinde `stitchu EU38 1:1` — 14 içerik sayfasının **hepsinde**
      (`printpack.py:1075` her tile'a basıyor). Hangi tile hangi beden, sayfanın kendisinde yazılı.

## 4b. AÇIKLIK UYARISI — **GEÇTİ** (T10, şartnameye BU MÜHÜRDE eklendi)

Şartname bu maddeyi **hiç istemiyordu**; oysa dikilmeyen bir dikiş, alıcıya söylenmezse paketi
**satılamaz** kılar. TUR 7 öncesi T10 halkası bunu kapattı, şartname sözümüz olduğu için buraya giriyor.

- [x] **"BURAYI DİKMEYİN" açıklık uyarısı, üç yüzeyde birden.**
      (1) `print-info.pdf` **s.2**, montaj adımlarının ÜSTÜNDE çerçeveli kutu:
      *"DİKİLMEYEN DİKİŞ — BURAYI DİKMEYİN · centre_back_zip: arka orta dikişin 563.4mm (22.18 inç)
      üst kısmı DİKİLMEZ … Fermuarsız bu elbise kafadan geçmez. Fermuar: 22 inç."*
      (2) **Kalıbın kendi üstünde**, dikilmeyen kenar boyunca etiket:
      `print-svg/a4-page5.svg` → `BURAYI DİKMEYİN — FERMUAR AÇIKLIĞI 563mm`.
      (3) Montaj adım 9 aynı hükmü tekrarlıyor (*"eteğin altından başla, zip-end yazan üçlü çentiğe
      kadar dik ve DUR"*) ve `printpack.log` NOTCHES tablosunda iki `triple zip-end` çentiği
      **0.0000mm** eşleşiyor — uyarı metin değil, **geometriye bağlı**.
      Regresyon mandalı: `printpack_sheet_check` (ctest).

---

## ÖLÇÜM KAPISI

Bir ray "satılabilir çıktı üretti" diyebilmek için: **gusto-lint PASS + şartname 1-4 maddeleri PASS +
kontakt sayfası 3 Etsy emsalinin yanında Damla onayı.** Eksik madde = düzeltme kuyruğu, kanıtsız "tam"
yasak (miras: PROVE don't claim).

**KAPI BUGÜN AÇIK DEĞİL — mühür bunu değiştirmez, ilan eder:**
| şart | bugün |
|---|---|
| gusto-lint PASS | **KOŞULAMADI** — girdi (listing flat) üretilmiyor (§1) |
| şartname 1-4 PASS | **14/17 madde geçti** · §1 5 eksik · §3 nesting eksik · §4 kumaş önerisi eksik |
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

| # | Halka | Neden |
|---|---|---|
| H1.1a | nesting önce/sonra sayfa sayısı raporlanmıyor | §3 madde 3; F3 azaltma kanıtı üretilmiyor |
| H1.1b | kumaş önerisi (tür/ağırlık/döküm) pakete girmiyor | §4 madde 1; `knowledge/sewing-guide.md` diskte var, hiçbir sayfaya basılmıyor |
| H1.1c | emsal PDF'leri diskte yok → kontakt sayfası açılamıyor | ÖLÇÜM KAPISI'nın 3. şartı; Damla kararı gerekir |

§1'in 5 eksiği **yeni halka değildir** — `HEDEF.md` **H1.3** zaten o iştir ve kasten H1.0'ın arkasındadır.
`style_check`'in boş koşması (§1, `engine/STYLE-PIN/` yok) H1.3'ün içinde kapanır.
