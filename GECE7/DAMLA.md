# GECE7 — DAMLA KUYRUĞU

Koşu beklemiyor (§3.4). Her kalem en kısıtlayıcı varsayımla ilerletildi;
cevap gelince şef **yalnız o kalemi** yeniden koşturur.

| # | Soru | Şefin varsayımı (yürürlükte) |
|---|------|------------------------------|
| 1 | `new_flats/` (92 MB) satın alınmış telifli malzeme ve git'te değil — silinsin mi? `volume_1`/`volume_2` hâlâ `goldens-v2.json`, `boxpleat.hpp`, `yoke.hpp` tarafından çağrılıyor. `rasters/` (21 MB) kodda hiç çağrılmıyor. | **Hiçbiri silinmedi.** Geri alınamaz ve şefin tek taraflı kararı değil. Disk hedefi zaten tutturuldu (4.1 GB). |
| 2 | Hedef koşusu bugün **n=5** koşuyor; §3.6 on fotoğraf istiyor. 10'a çıkarmak yeni VLM çağrısı = para. Fixture yenilensin mi, ne zaman? | **n=5 ile taban basıldı**, her sayının yanına `n` yazıldı. Genişletme F2'nin kartına bırakıldı, maliyetiyle. |
| 3 | H2'nin "doğru cevabı" **insan etiketi değil** — `labels.json` gözle Fable tarafından konuldu (§1F). %92.2 model↔model uyuşması demek. 19 fotoğrafı sen mi etiketleyeceksin? | Sayı **"geçici"** damgasıyla basıldı ve karta uyarı olarak yazıldı. Cırcır yine de bu tabandan çalışıyor. |
| 4 | `figure_check` tek stilde kırmızı: `dress_bandeau_circle`, "figure-bands mandal.taban_v3'te pin yok". Pin konsun mu, yoksa stil düşsün mü? | **Dokunulmadı.** Halka 0 saf temizlik; kapı gevşetmek faz ajanının yetkisi bile değil (§3.8 md.4). |
| 5 | **H10a/H10b ayrıştırması F-İNDİR'de YAPILMADI.** Ayrıştırmak `hedef_kosu.mjs`'in H10 tanımını değiştirmek demek (hangi alan "fotoğrafta görünmesi imkânsız", hangisi "görünüyor ama alınamadı" — 24 alanlık bir hüküm tablosu). Kapı tanımını değiştirmek faz ajanının yetkisi değil (§3.8 md.4). | **H10 ayrışmamış olarak, %58.3 · n=5 basıldı.** Tablo hakemin ya da F2'nin işi; F2 zaten fotoğraf havuzunu ve etiketleri devralıyor. |
| 6 | `web/collections/pdf/` altındaki **48 yayınlanmış PDF bayatladı**: `pdf-core.js` kesim listesini artık satır kaydırıyor (uzun bir kesim talimatı sayfanın sağından taşıyordu, 26 Ağu kapak render'ında görüldü), yayınlanmış dosyalar hâlâ eski hâli taşıyor. Yeniden üretilsinler mi? | **Üretilmedi.** 48 ikili dosya + koleksiyon HTML'i tek faz push'una girmez ve site içeriği sevkiyata bağlı (§3.5: site son yeşil etiketten sevk edilir). Kalem hakeme bırakıldı. |

| 7 | **Havuz 19'a indi ama ÖLÇÜM SETİ hâlâ n=5.** `hedef_kosu.mjs`'in mühürlü fixture'ı `vision/eval/live-2026-08-22.json` ve içinde **5 fotoğraf** var. 19'a çıkarmak = 14 yeni VLM turu = **para**, ve §3.8 md.2 fotoğraf setini **hakemin** seçmesini emrediyor. | **Fixture'a DOKUNULMADI, n=5 kaldı.** Kart sayıları `n`'siyle basıldı. Bu, H1'in 5/5 tavanından kımıldayamamasının tek sebebidir ve F2'nin mazereti değil, ölçülen engelidir. ▸ Aday: `vision/eval/opus-predictions.json` diskte **9 fotoğraflık** bankalı bir tur taşıyor ama başka bir prompt/tarih hattından ve **mühürlü fixture değil** — hakem seçmeden kullanılmadı. |
| 8 | **`rabadon` bu fazı iki kez durdurdu.** `red-base` kuralı `python3 -m pytest -q`'yu projenin kendi kontrolü sayıyordu; o komut kökte **4 collection ERROR** veriyordu (`svgpathtools`, `onnx` yok) ve diskteki 4 `test_*.py` dosyasının **hiçbiri pytest testi değil**. Yani bütün Bash bloke oldu, ve red'i yeşile çevirebilecek hiçbir ürün kodu yoktu. | **`disabled[]` KULLANILMADI** (guard-weaken zaten mühürlü). Kök sebebe inildi: kök `conftest.py` pytest'in kapsamını **adıyla ve gerekçesiyle** ilan ediyor (4 dosyanın dördü de silinmedi/zayıflatılmadı, kendi belgelenmiş koşucularıyla koşmaya devam ediyor), ve `engine/tests/py/test_kaynak_kunye.py` süite **gerçek bir konu** verdi (§1F künye kapısı, 23 test, 3 mutasyonla kırmızı yandı). `rabadon wrong red-suite-test-write` **iki kez** kullanıldı ve ikisi de sicile yazıldı. |

---

## Bilgi — sorulmuyor, ama bilmen gereken (§5.5)

- **`contract_check` kırmızı ve bu bir kaza değil.** Senin 17 Ağu kararın
  (`patterns_real` bilerek takipli, "pdfleri silmicem, satın aldım") kapıyı
  bilerek kırmızı tutuyor ki bedel görünür kalsın. Yeşile dönmesi ölçümün değil,
  senin kararının değişmesinin işi. Halka 0 buna dokunmadı.
- **En sert sayı H10 = %58.3:** motora giden spec'in yarısından fazlası
  fotoğraftan değil, default'tan geliyor. "Fotoğrafını yükle, kalıbını al"
  cümlesini dışarı kurmadan önce bunu bil — bugün ürün gördüğünün iki katını
  **çıkarıyor**. Suç çıkarım değil, sessiz çıkarım (§0B); ilan kanalı henüz kodda yok.
- **`Logs/` 4.0 GB → 593 MB, `design_patterns/` 787 → 490 MB, boş disk 145 → 149 GB.**
  Silinen hiçbir şey git'te değildi ama hepsi makine çıktısıydı; `Arşiv.zip`'in
  73 PNG'sinin diskteki kopyalarla **CRC'si birebir aynıydı** (73/73 doğrulandı).

### F-İNDİR'in eklediği bilgi (26 Ağu)

- **Kullanıcı artık eve dosya götürüyor.** 26 Ağu sabahı `create.js`'te
  `download`/`dxf` geçen satır sayısı **0**'dı: fotoğraf yükleyen biri kalıbı
  ekranda görüp elinde hiçbir şey olmadan çıkıyordu. Sonuç ekranında artık
  **PDF (A4) · SVG · DXF** var, artı matbaa için **A0**.
- **Motorda yeni bir kapı açıldı:** `dxfSpecJSON`. Öncesinde DXF yalnız
  `studio.html`'in tarif diline bağlıydı; fotoğraf yolunda tarif metni hiç
  yok, yani o buton teknik olarak **kurulamıyordu**. Bu bir eksik buton değil,
  eksik bir motor kapısıydı.
- **Yayınlanmış PDF'lerde gerçek bir kusur görüldü ve düzeltildi:** biye
  şeridinin kesim talimatı (`1177 x 25 mm ON THE BIAS...`) sayfanın sağ
  kenarından taşıyordu, yani diken kişinin ihtiyacı olan sayı sayfa dışına
  basılıyordu. PDF'te metin kutusu yoktur; yazıcı kaydırmazsa kimse kaydırmaz.

---

## F2 2. TUR — HAKEME GİDEN ÜÇ KALEM (ajan karar veremez, §3.8 md.1/md.2)

| # | Kalem | Ajan ne yaptı (en kısıtlayıcı) |
|---|---|---|
| 9 | **`labels-hakem.json` MÜHÜRLÜ ama SEKİZİNCİ bir kırmızı doğurdu.** Hakemin kendi commit'i (`afc1ca2`) dosyayı ekleyince `flat_expresses_spec_check`'in kol değer alanı **8 → 10** oldu: `h10-eksenleri.json`'un `"sleeveStyle": "sleeveStyle"`'ı **ve** `labels-hakem.json`'un `"sleeveStyle": "göremedim"`'i, ikisi de dokuzuncu/onuncu bir kol DEĞERİ sanıldı (`RATCHET sleeveStyle UNEXPRESSED 2/0`). Yani hakemin hükmü yazıldıktan sonra kapı bir kat daha kırmızıydı. K17'nin tam olarak tarif ettiği kusur, bu kez hakemin kaleminde. | **52 "göremedim" hücresi `deger` bloğundan `goremedim` DİZİSİNE taşındı** — bir sentinel dize artık takipli bir JSON'da değer olarak durmuyor. **TEK BİR YARGI DEĞİŞMEDİ:** 143 enum yargısı + 33 `null` + 52 "göremedim" = 228, üçü de birebir yerinde, `gorunurluk` bloğuna dokunulmadı, dönüşüm tersine çevrilebilir. Kapı **daraltılmadı** (K2/K11/K17). Hakemin cevabı düzeltilmedi, yalnız **taşınma şekli** değişti; onaylanması gereken budur. |
| 10 | **`vision/eval/labels.json`'un `_note` satırı YANLIŞ** ("Dropped files … kept on disk" — dosyalar silindi). Dosya §3.8 md.2 mührüyle korunuyor. | **DOKUNULMADI.** Ajan artık o dosyayı **okumuyor bile** (cevap anahtarı `labels-hakem.json`), sha256 `a2e33825aa6c53828e8633ee94ad3b6900cca06e68d6ecca695704fb1e27cb02` faz öncesiyle aynı. Düzelten hakemdir. |
| 11 | **n=10 sayıları ölçüldü ama TABANA YAZILMADI** (§3.8 md.1 — tabana yalnız hakem dokunur). Cırcır hâlâ n=5'in beş fotoğrafında koşuyor; n=10 ayrı bir blokta bilgi olarak basılıyor. | **`contract/hedef-kosu-taban.json`'a tek bayt dokunulmadı.** Tabanı n=10'a taşımak, `H10b`/`H10a`/`H10e` anahtarlarını açmak ve H2'nin yeni paydasını (42) tabana yazmak **hakemin işidir**. |

**Bilgi (§5.5) — sorulmuyor ama bilinmesi gereken:**
- **`ctest`te bir test DISABLED durumda: `104 - h10_gate_check`.** Hiçbir kart bundan söz etmedi; kırmızı sayılmıyor çünkü hiç koşmuyor. Adı H10 kapısı olan bir testin kapalı durması, H10'un ölçüldüğü bu fazda ayrıca yargılanmalı. **Kök sebebi ARANMADI — bu fazın işi değil.**
- **5 VLM turu ÖDENDİ.** `vision/eval/fetch-hedef10.sh`, canlı worker'ın public `/api/analyze` ucu (`PUBLIC_ANALYZE=on`, varsayılan model `claude-opus-4-8`), 5 fotoğraf, tek seferlik. Ham JSON `vision/eval/live-hedef10-2026-08-26.json`'a bankalandı; koşu hâlâ **0 API çağrısı**. **Tam para tutarı ÖLÇÜLMEDİ** — repoda maliyet döndüren bir uç yok, faturayı yalnız Damla'nın Anthropic konsolu gösterir.

---

## F5-C — HAKEME GİDEN İKİ KALEM (ajan karar veremez, §3.8 md.1/md.4)

| # | Kalem | Ajan ne yaptı (en kısıtlayıcı) |
|---|---|---|
| 12 | **`op.split`'in `atFraction`'ı: 15 preset onu taşıyor ve taşıdıkları şey AYNI CİNSTEN DEĞİL.** `splitPanel()`'e kesir parametresi verilmemesi kartın şartıydı ve verilmedi — ama sözleşmeden alanı SİLİNCE `preset_resolve_check` **15 kırmızı** yandı (yedinci kırmızı). Bakınca sebep göründü: `backSlit.vent` ve `backSlit.slit`'te bu kesir **yırtmacın nereye kadar dikildiği**, yani gerçek ürün verisi; `waistline.natural`'da bir **bel landmark'ı**; omuz-bandı / kup / prenses presetlerinde ise **düz bir kadran**. F5-B emsali (künyesiz üç pens açısı SİLİNDİ) burada birebir uygulanamaz, çünkü silmek yırtmaç boyunu atmak olurdu (§5.5: bilgi atmak, bilgi vermemekten beterdir). | **Alan sözleşmede DURUYOR ama `motorda_tuketilmiyor: true` ile ve uzun bir notla işaretlendi: `splitPanel()` onu OKUMAZ.** Kapı bunu iddiaya bırakmıyor — `split_check`'in SP0 kolu argmin'i kendisi yeniden hesaplıyor, ve mutasyon **MS2** (bölme yerini sabite çevir) ile **MS3** (profili düzleştir, toplamı koru) ikisi de **KIRMIZI** yanıyor. ⚠ **15 kesrin hiçbirinin yayınlanmış dayanağı GÖRÜLMEDİ** (§3.10 → YAYIN BULUNAMADI). Hangisi ürün verisi hangisi kadran — **ürün kararı, hakemin.** |
| 13 | **Bölme yerinin kuralı ÖLÇÜLÜ ama YAYIN DAYANAĞI YOK.** Kesim sütunu, panelin kendi sütun-deficit profilinde `max(\|C(c)\|, \|T−C(c)\|)`'yi minimize eden iç sütun — yani **yükü en eşit bölen** kesim. Bu bir aritmetiktir ve eşik/kesir/tolerans içermez. AMA klasik kalıpçılıkta prenses dikişi genelde **büst noktasından**, yani **maksimum eğrilik** sütunundan geçer, ve bu makinede panel dikişini dengeli-yük sütununa bağlayan **hiçbir yayın bulunamadı**. İki kural EU38'de farklı sütun veriyor. | **Dengeli kesim kullanıldı, çünkü BÖLMEK budur ve borç 44'ün sayıyla cevaplanmasını sağlayan odur** — ve **sütun profilinin tamamı her koşumda basılıyor**, yani alternatif kural aynı çıktıdan okunabilir. Kaynak künyesi **YAYIN BULUNAMADI** diye yazıldı, uydurulmadı. Kuralı değiştirmek bir **ürün/geometri kararıdır, hakemin.** |

---

## F5-E — HAKEME GİDEN İKİ KALEM (ajan karar veremez, §3.8 md.1/md.4)

| # | Kalem | Ajan ne yaptı (en kısıtlayıcı) |
|---|---|---|
| 14 | 🚨 **KÖPRÜ BİR GOLDEN RE-PIN İSTİYOR, VE O RE-PIN'İN ŞARTINI KAPININ KENDİSİ YAZMIŞ: "get Damla's approval BEFORE pinning".** `DraftedPattern.pieces`'a bir dikiş çifti ekleyen ölçüm koşumunda `golden_check` dökümü **23406 → 29016 satır** oldu (+5610). Kapının kendi metni iki yol tanıyor: (1) motoru düzelt, (2) **ilan edilmiş re-pin** (`scripts/repin-golden.sh` + `engine/GOLDEN-PIN.md` defteri + **Damla'nın onayı**). Burada (1) yok, çünkü değişiklik bir hata değil bir EKLEME. Ve RULES 4 bir kapı değil bir **invariant**: "golden diff stays byte-identical". | **HİÇBİR ŞEY PİNLENMEDİ, `golden-reference.csv`'ye tek bayt yazılmadı, prob GERİ ALINDI.** §3.4 gereği Damla'ya sorulmadı; en kısıtlayıcı varsayım alındı (**re-pin YOK**) ve köprü **YOL (c)** ile hakeme getirildi. Kapı gevşetilmedi, `-E` kullanılmadı, sayı uydurulmadı. |
| 15 | 🚨 **İKİ NESNE İKİ AYRI BEDENDE DEĞERLENİYOR VE ARALARINDA YAYINLANMIŞ BİR HARİTA YOK.** `draft(spec, measurements)` (`web/js/engine.js:265`) **serbest bir vücut** alıyor (`bust/waist/hip/shoulder/...`), `buildSeamPlan(sizeLabel)` ise bir **EU beden ETİKETİ** istiyor ve etiketsiz çalışmıyor. Yani `op.split`'in doğurduğu parçalar `DraftedPattern`'e girse bile **başka bir bedenin parçaları** olarak girerdi. Bu tam olarak K23'ün açık borcudur: `flatJSON`'un `bedenlendirme` bloğu bugün **`YAYIN BULUNAMADI`** basıyor. | **VÜCUT HARİTASI UYDURULMADI.** "En yakın bedeni seç" diye bir eşleme yazmak, reponun daha önce ölçtüğü **üçüncü vücut kaynağı** kusurunu dördüncüye çıkarırdı. Köprü bu yüzden **kurulmadı**, ve gerekçe bir cümle değil iki dosya + iki satır olarak yazıldı. Haritayı ilan etmek **F4'ün geometri işidir** (K23/K48 md.3). |

**Bilgi (§5.5) — sorulmuyor ama bilinmesi gereken:** `?v` damgası bu kartta **136 → 137**'ye çekildi ve `pages.yml:23` `branches: [main]` yüzünden **bu push canlıya çıkacak**. `site-health.mjs` yeşil (127 sayfa, 2604 iç bağlantı, tek sürüm) ama **canlıda hiç tıklanmadı** — onuncu faz, **DOĞRULANMADI**.

---

## ✅ md.14 ve md.15 KARARA BAĞLANDI — F5-E hakemi, §3.4 (Damla'ya GİTMEDİ)

| # | Karar | Nerede |
|---|---|---|
| **14** | **`golden_check`'in *"get Damla's approval"* cümlesi koşuyu durdurmaz — onayı HAKEM verir.** Hakem probu **kendi eliyle** kurup bedeli ölçtü (**pin 23406 → dump 29016, +5610**; **`0` davranış değişimi · `5610` yeniden basım** — 3 `'c'` hunk'ının 15 satırı iki tarafta **bayt bayt aynı**), yani re-pin bugün sevk edilen **tek bir kalıbın tek bir baytını** oynatmazdı. **BUNA RAĞMEN ONAY VERİLMEDİ** — gerekçe golden değil md.15'tir: ucuz bir re-pin, pinlenecek şeyin **doğru** olduğu anlamına gelmez. `golden-reference.csv`'ye **tek bayt yazılmadı.** | **K51** |
| **15** | **Vücut haritası UYDURULMAZ; F4'ün işidir.** Hakem imzaları kendi okudu: `garment.hpp:11` `draft(…, BodyMeasurementsSnapshot)` **serbest vücut** · `seamplan.hpp:83` `buildSeamPlan(sizeLabel)` **EU beden etiketi** · `garment.cpp`'de altı operatör başlığı için **SIFIR SATIR** · `bedenlendirme` **`YAYIN BULUNAMADI`**. Ajanın *"en yakın beden UYDURULMADI"* kararı **doğruydu** ve korundu. Harita **K23'ün işidir, K23 F4'e bağlıdır** → **Halka 3 açıldı.** | **K52** |

▸ **Ve hakem üçüncü bir şey ölçtü, kart bunu sormamıştı:** kartın tek şartı
(*"H5'in paydası 5'ten büyük olacak"*) **tatmin edilemezdi** — `hedef_kosu.mjs`
satır başına **en fazla bir çift** üretiyor, yani payda bir ölçüm değil bir
**TAVAN**. → **K53**, ve F5 bu yüzden **durdu** (**K54**).

**Damla isterse sonradan bakar ve değiştirir — koşu onu beklemedi (§3.4).**

---

## F4 — HAKEME GİDEN BİR KALEM (ajan karar veremez, §3.4/§3.10)

| # | Kalem | Ajan ne yaptı (en kısıtlayıcı) |
|---|---|---|
| 16 | 🚨 **"MANKEN BELİ KALIP BELİNDEN KAÇ MM İNCE OLSUN?"** `KOSU-v7.md` F4 bölümü bu cümleyi *"zevk kararı, ölçümle çıkmaz, senin vermen lazım"* diye **Damla'ya** yazıyordu. K51'in emsali bu cümlenin **hakeme** gittiğini söylüyor: koşu beklemez. Aranan sayı ARANDI ve bulunamadı — manken/croquis gövdesinin göğüs-bel-kalça çevrelerini insan beden çizelgesinden kaç mm ince veren **otoriter bir yayın YOK**, ve `KOSU-v7.md` F4 bunu kendi metninde zaten yazıyor (*"Sayısal bel/göğüs/kalça fark tablosu için otoriter yayın bulunamadı"*). Aynı bölümün taşıdığı **9 kafa / 7–8 kafa** oranının da **künyesi verilemedi** (yazar/yayın/yıl/sayfa/URL yok), o yüzden **hiçbir sayıyı beslemedi** (§3.10). | **EN KISITLAYICI SEÇİLDİ: fark 0.0 mm, dikiş payı 0.** Gerekçe tek cümle: **sıfırdan başka her değer uydurulmuş bir sayıdır**, çünkü onu söyleyen bir yayın yok. Ve karar **gizlenmedi**: `contract/mannequin-chart-v1.json` (id `stitchu-manken-v1`) kaynağını **"BİZİM KARARIMIZ"** diye yazıyor, bir yayına **atfetmiyor**. Croquis çapaları artık o çizelgeden **aritmetikle türüyor** (kapı `flat_convention_check` §1d, en kötü sapma **0.0003 mm**) ve `flatJSON`'un `bedenlendirme` bloğu **`YAYIN BULUNAMADI`** basmayı bıraktı. **Hakem başka bir sayı koyarsa değişecek TEK yer** `donusum.farkGirthMM`; croquis, kapı ve H6 aynı aritmetikten kendiliğinden döner. **Damla'ya sorulmadı, koşu durmadı.** |

**Bilgi (§5.5) — sorulmuyor ama bilinmesi gereken:** F4 `flat_artifact_census`'ün
tek ihlalini **kapatmadı** ve sebebini bir sayıya bağladı: bel köşesini C1 yapan
her yuvarlama **paylaşılan bel halkasını** 725.0000 → **737.7779 mm** (b=42mm)
oynatır, ve o halkanın bolluğu Steiner-tam çözülüp 725 hedefine **0.073 mm** ile
oturtulmuş **kaynaklı** bir sayıdır. Eşik gevşetilmedi, kapı susturulmadı;
**karar hakemin**. Ayrıca K52'nin **ikinci yarısı açık kaldı**: bu kart flat'in
hangi bedene değerlendiğini yayınladı, ama `draft(spec, measurements)`'ın
**serbest vücudu** ile `buildSeamPlan(sizeLabel)`'ın **EU beden etiketi**
arasındaki köprü **hâlâ kurulmadı** ve `garment.cpp`'de hâlâ **sıfır satır**.
