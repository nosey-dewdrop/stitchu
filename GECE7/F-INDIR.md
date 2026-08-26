# F-İNDİR — kullanıcı eve bir dosya götürsün 📥

Halka 1'in ilk fazı. Etiket: `F-INDIR-oncesi` (faz öncesi), main'de çalışıldı,
branch açılmadı (§3.5). Tek push.

## Faz neyi buldu ve ne yaptı

**Ölçülen hastalık (kartın kendi sayısı, 26 Ağu):** `web/js/create.js` içinde
`download` / `dxf` geçen satır sayısı **0**. Kullanıcı fotoğraf yüklüyor,
motor kalıbı çiziyor, ekranda görüyor — ve elinde **hiçbir dosya olmadan**
çıkıyor. 118 testin hiçbiri bunu göremiyordu, çünkü hiçbiri "ürün bir dosya
teslim ediyor mu" diye sormuyordu.

**Kartın "sadece bir indirme butonu" teşhisi eksikti.** İndirme yolu
`studio.js`'te vardı ama **tarif diline (recipe DSL) bağlıydı**: motorda tek
DXF kapısı `dxfRecipeJSON` idi ve fotoğraf yolunda tarif metni **hiç yoktur**.
Yani o buton kopyalanarak bile kurulamazdı. Eksik olan buton değil, **motor
kapısıydı**.

### Yapılanlar

1. **Motorda yeni kapı: `dxfSpecJSON(spec, body)`** (`engine/wasm/bindings.cpp`).
   `draftJSON`'ın çizdiği **aynı** `GarmentDrafter::draft` + **aynı**
   `dxf::exportPattern` — yeni bir yazıcı değil, aynı kapının spec ucu. Bloklu
   taslakta ve geçersiz enum/bedende **dosya vermez, sebebini adıyla söyler**.
   wasm yeniden derlendi (`engine/build-wasm.sh`, source stamp `723f51cf0b01b822`);
   `web/vendor/` ve `backend/engine/` artefaktları güncellendi
   (`bundle_fresh_check` bu yüzden aynı commit'te).
2. **`web/js/download.js` — sitedeki TEK indirme yolu.** `studio.js`'ten
   **taşındı, kopyalanmadı**: studio artık bu modülü çağırıyor, iki SVG yazıcısı
   / iki DXF çağrısı / iki PDF hattı kalmadı.
3. **`engine/tools/pdf-core.mjs` → `web/lib/pdf-core.js`.** Tarayıcı artık bir
   çağıran; yayınlanan tek kök `web/` (`pages.yml`, `path: web`), yani
   tarayıcının import ettiği modül orada durmak zorunda. Node bağımlılığı
   (`Buffer`) kaldırıldı: `build()` artık `Uint8Array` döndürüyor, üç üretici
   araç değişmeden çalışıyor. Latin1 sınırının dışına düşen karakter artık
   sessizce kırpılmıyor, **adıyla reddediliyor** (RULES invariant 1).
4. **`create.html` sonuç ekranı:** **PDF (A4, ev yazıcısı) · SVG · DXF** üç
   butonu + matbaa için **A0** bağlantısı. Reddedilen dosya sessiz kalmıyor,
   sebebi ekrana yazılıyor (yasak 8).
5. **`studio.html`'in PDF'i de gerçek dosya oldu.** Önce `window.print()` idi:
   kullanıcının "PDF olarak kaydet"i bulması ve ölçeği %100'e çekmesi
   gerekiyordu, telefonda o pencere zaten yok. Artık `pdf-core`'un vektör
   paketini indiriyor.
6. **Yayınlanmış PDF'te gerçek bir kusur bulundu ve düzeltildi.** Kesim listesi
   satır kaydırmıyordu; biye şeridinin talimatı (`1177 x 25 mm ON THE BIAS…`)
   sayfanın **sağ kenarından taşıyordu** — diken kişinin ihtiyacı olan sayı
   sayfa dışına basılıyordu. PDF'te metin kutusu yoktur; yazıcı kaydırmazsa
   kimse kaydırmaz. A4 kapağı ve rehber PDF'i `wrap()` ile kaydırıyor.

## KAPI — hedef koşusu, önce → sonra

`ctest --test-dir engine/build -R hedef_kosu`

| # | önce | sonra | n |
|---|------|-------|---|
| **H1** tamamlanma | 5/5 | **5/5** | n=5 |
| **H2** görülen isabet | %92.2 | **%92.2** | n=5 |
| **H3** uydurma alan | 4 | **4** | n=5 |
| **H4** gereksiz dikiş | ÖLÇEMEDİM | **ÖLÇEMEDİM** | n=5 |
| **H5** dikilebilirlik | 0 / 5 çift | **0 / 5 çift** | n=5 |
| **H6** konvansiyon | ÖLÇEMEDİM | **ÖLÇEMEDİM** | n=5 |
| **H8** ifade edilemeyen | 31 | **31** | n=5 |
| **H9** çıkarımda makullük | ÖLÇEMEDİM | **ÖLÇEMEDİM** | n=5 |
| **H10** çıkarıldı oranı | %58.3 (ayrışmamış) | **%58.3 (ayrışmamış)** | n=5 |
| **H11** süre | medyan 3.1 ms | **medyan 3.3 ms** (tavan <10 sn) | n=5 |

`CIRCIR SAĞLAM — hiçbir sayı kötüleşmedi.` Beklenen buydu: F-İNDİR görme veya
çizim hattına dokunmuyor, çizilmiş kalıbı **dosyaya çeviriyor**. H11'in 3.1→3.3
ms'i duvar saati salınımıdır ve H11 zaten eşitlik cırcırına değil **tavana**
bağlı (Halka 0 bunu bilerek böyle kurdu).

**H10a/H10b ayrıştırılmadı — ve bu bilinçli.** Ayrıştırmak `hedef_kosu.mjs`'in
H10 tanımını değiştirmek demek: 24 alanın hangisi "fotoğrafta görünmesi
imkânsız", hangisi "görünüyor ama alınamadı" — bir **hüküm tablosu**. Kapı
tanımını değiştirmek faz ajanının yetkisi değil (§3.8 md.4) ve F-İNDİR
çıkarım hattına tek satır dokunmadı, yani ayrıştırılacak bir **değişim** de
yok. `GECE7/DAMLA.md` md.5'e yazıldı; tablo hakemin ya da F2'nin işi.
`contract/hedef-kosu-taban.json`'a **dokunulmadı** (§3.8 md.1).

## Faz kapısı — kartın kendi şartı

> "üç dosya da inisin → DXF bir CAD'de açılsın, PDF'te 3 cm kalibrasyon
> karesi 3 cm ölçsün."

Yeni kapı: `ctest --test-dir engine/build -R indir_check`
(`engine/tests/indir_check.mjs`, **119. test**). Tarayıcının yüklediği
modüllerin **kendisini** koşturur (`web/js/download.js`, `web/lib/pdf-core.js`,
`engine/dist` wasm) — node'a özel bir kopyayı değil. **Sıfır API çağrısı.**

- **DXF** — `dxfSpecJSON` var, R12 belgesi, ASTM katman 1 + 8, 55 POLYLINE / 5 parça.
- **DXF, bağımsız CAD hakemi:** `ezdxf` (repo'nun `engine/.venv-dxf`'i) dosyayı
  **açtı**: `AC1009`, `$INSUNITS 4` (= mm), katmanlar `0,1,4,6,7,8,11,15,Defpoints`,
  55 POLYLINE + 5 TEXT (`Bodice Front`, `Bodice Back`, `Bias binding…`,
  `Skirt Front`, `Skirt Back`).
- **PDF, kalibrasyon karesi = 29.9999 mm.** İddia "karesi var" değil; kapak
  içerik akışındaki `re` operatörünün genişliği/yüksekliği punto'dan mm'ye
  çevrilip okundu.
- **A4** 18 sayfa (kapak + 17 pafta) · **A0** tek sayfa 841.0 × 1189.0 mm.
- **REDDETME:** geçersiz enum ve kullanılamaz beden **hiçbir dosya vermiyor**,
  ve reddi taşıyan dal (`relayDXF`) da test ediliyor.
- **BUTON VAR MI:** hastalığın ölçüldüğü terimle — `create.js` `download.js`'i
  import ediyor mu, `saveA4Pdf`/`saveSVG`/`saveDXF` çağırıyor mu, panel
  **monte** ediliyor mu.

**Görsel kanıt (RULES invariant 3 — dosya yolu, "baktım" değil):**
`Logs/indir-check/stitchu-dress-aline.dxf` · `.svg` · `-a4.pdf` · `-a0.pdf`
ve `pdftoppm` raster'ları `cover-01.png` · `sheet-02.png` · `a0-1.png`.

## Mutasyon kanıtı (§3.8 md.3) — `GECE7/log/f-indir.mutasyon.txt`

Değişmeden üç koşu yeşil (gürültüde yanmıyor). Sonra:

| mutasyon | sonuç |
|---|---|
| kalibrasyon karesi 30 → 29 mm | **EXIT 1** |
| SVG'den parça etiketi silindi | **EXIT 1** |
| panel kuruluyor ama **monte edilmiyor** | **EXIT 1** |
| `relayDXF` motorun reddini yutuyor | **EXIT 1**, 2 kalem |
| hepsi geri alındı | **EXIT 0** |

**Mutasyon iki gerçek hata buldu ve ikisi de düzeltildi:**
1. "Panel monte edildi mi" kontrolü ilk taslakta `downloadPanel(` arıyordu ve
   **fonksiyon TANIMINI** görüyordu — mount silinince kapı yeşil kaldı.
   `appendChild(downloadPanel(` aramaya çevrildi.
2. Motorun reddini taşıyan dal yalnız tarayıcıda koşan bir fonksiyonun içindeydi,
   yani **hiçbir kapı onu kırmızıya düşüremezdi**. `relayDXF` ayrıldı ve teste
   dört satırlık bir DOM taklidi kondu; artık reddi yutan mutasyon kırmızı yanıyor.

**Koşulmayan tek mutasyon:** `dxfSpecJSON` bağlanmasını motordan silip yeniden
derlemek (~90 sn × 2). Yerine kapının `typeof engine.dxfSpecJSON === 'function'`
kalemi duruyor. **DOĞRULANMADI:** fiilen silinip koşulmadı.

### `web/lib/` neden, `web/js/` neden değil — açıkça

İlk denemede dosya `web/js/pdf-core.js` oldu ve **`landing_truth_check` kırmızı
yandı**: L1 (sağlayıcısız sayı) tabanı **937 → 944**. Kapının tarama kapsamı
`rel(p).startsWith('js/')`; dosyanın **değişmemiş** beş metni ("3 cm, measure me
before cutting", "m fabric at 140 cm" başlıkları) o kapsama girdi. O beş metin
zaten **yayınlanmış PDF'lerin içinden kullanıcıya ulaşıyordu** — yeni bir iddia
doğmadı, kapının görüş alanı genişledi.

Yapılan: taban **yeniden kesilmedi** (kapı yalnız DÜŞÜŞ için izin veriyor;
kapı gevşetmek zaten faz ajanının yetkisi değil, §3.8 md.4). Dosya `web/lib/`'e
kondu — `web/js/` **sayfa betiği** ad alanıdır (`create.js`, `studio.js`,
`sheet.js`), `pdf-core` ise node üreticilerinin de import ettiği ortak PDF
yazıcısıdır, sayfa mantığı değil. Bu yerleşimin kapının kapsamı dışında kaldığı
**doğrudur ve gizlenmiyor**: gerekçe dosyanın kendi başlığına yazıldı.
Ayrıca kendi yazdığım iki UI cümlesindeki rakamlar (`100%`, `3 cm`) metinden
çıkarıldı — o sayıların yeri kullanıcının eline geçen **sayfanın kendisi**,
buton altındaki cümle değil. L1 sonrası: **937 = taban, kapı YEŞİL.**

## ctest

`ctest --test-dir engine/build` → **`95% tests passed, 6 tests failed out of 118`**
(119 test, biri `Disabled`: `h10_gate_check`). F-İNDİR bir test ekledi:
`indir_check`, yeşil. Miras alınan **6 kırmızı set büyümedi** (RULES invariant 9): `flat_pattern_agree_check` ·
`flat_artifact_census` · `style_check` · `sizechart_source_check` ·
`contract_check` (ilan edilmiş karar) · `figure_check`. Yeni kırmızı **yok** —
ama ara koşuda **bir tane doğdu ve düzeltildi** (`landing_truth_check`, aşağıda).

## Açık kalanlar — dürüstçe

- **`web/collections/pdf/` altındaki 48 yayınlanmış PDF bayat.** Kesim listesi
  kaydırması kodda düzeldi, yayınlanmış dosyalar hâlâ taşan hâli taşıyor.
  Yeniden üretmek 48 ikili dosya + koleksiyon HTML'i demek; tek faz push'una
  girmez ve site içeriği sevkiyata bağlı (§3.5). `DAMLA.md` md.6.
- **`?v` sürümü bump edilmedi** (136'da duruyor). Bump `scripts/deploy.sh`'ın
  işi ve `site-version` web/'in tek bir değerde anlaşmasını şart koşuyor;
  faz ajanının sevkiyata dokunması §3.5'e aykırı. **Sevkiyattan önce bump şart:**
  `web/vendor/stitchu-engine.js` bu fazda değişti.
- **Kalıp hâlâ kullanıcının kendi bedenine çizilmiyorsa EU38'e çiziliyor** ve bu
  `çıkarıldı` etiketiyle **söylenmiyor** (§4C md.2). F-İNDİR dosyayı verdi,
  dosyanın kimin bedeni olduğunu söylemedi — bu F0'ın kalemi.
- **`guidePdf` (kumaşa özel dikiş rehberi PDF'i) sonuç ekranına bağlanmadı.**
  Kart "kumaşa özel rehber metni" diyor; rehber **ekranda** var
  (`render.js` → `sewing.js`), ama indirilebilir bir dosya olarak değil.
  Bilerek bırakıldı: dördüncü bir butonun bedeli kartın istediği üç dosyadan
  büyük değil, ama üçü inmeden dördüncüsü anlamsız.
- **`download.js`'in DOM ucu artık kapsanıyor** (DOM taklidi), ama gerçek bir
  tarayıcıda uçtan uca tıklama **koşulmadı** — repoda headless tarayıcı
  harness'i yok. **DOĞRULANMADI:** Chrome/Safari'de indirme diyalogu.

## Tahmin

Kart: **1 gece**. Gerçekleşen: tek oturum, tahminin iki katına ulaşılmadı
(§3.12 duruşu tetiklenmedi). Karar gerektiren nokta: yok — kart da öyle diyordu.

---

## Sapma sorusu

> *"Bu faz bittiğinde bir yabancı fotoğraf yükleyip kalıp + flat indirebiliyor
> mu? Bir önceki fazdan daha mı iyi?"*

**Evet.** 26 Ağu sabahı `create.js`'te indirme kodu **sıfır satırdı**; şimdi
sonuç ekranında üç dosya + A0 var, dördü de motorun kendi geometrisi, üçü de
`indir_check`'te ölçülüyor ve DXF bağımsız bir CAD kütüphanesinde açılıyor.
Bu "altyapı hazırlandı" değil — bu, yabancının elinde bir dosya.
