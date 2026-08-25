# V6-D — ÇIPA SÖZLÜĞÜ ÜRETECİ (elle liste yazılmadı)

Ham çıktılar: `GECE/log/V6-D.mutasyon.txt` · `GECE/log/V6-D.ctest.txt` ·
`GECE/log/V6-D.kapsam.txt`. Her sayının yanında onu basan komut var.

## HÜKÜM (önce, sonra gerekçe)

**ÜRETEÇ VAR, SÖZLÜK 19 ÇIPA, HEPSİ KAYNAKLI, ELLE YAZILAN AD SIFIR.**
`contract/anchors-v1.json` artık bir build ürünü: `engine/tools/gen-anchors.mjs`
üretiyor, `engine/tests/anchor_source_check.mjs` (ctest'te `anchor_source_check`)
elle edit edildiğinde KIRILIYOR — üç mutasyonla ölçüldü, üçü de kırmızı.

**GRANÜLARİTE HÂLÂ PANEL.** V6-C'nin hükmü değişmedi ve bu kart onu değiştirmeyi
denemedi: `primitives-v1.json:primitifler.edge.parametreler.label` bir alan
TANIMLIYOR, dolduran üretici yok, `PatternPiece` karşılığını taşımıyor. Kenar
çıpası bugün üretilemez, o yüzden üretilmedi.

**★ ASIL BULGU — `front` KELİMESİ SÖZLÜKTE YOK, VE AÇIĞIN 5/6'SI BU.**
Serbest kanalın karşılanmayan 6 konumlu teriminin 5'i sadece `front` yüzünden
düşüyor (`front hip welt pockets`, `pointed bodice front (stomacher)`,
`open-front overskirt…`, `robe à la française open front…`,
`self-fabric ruched robings trimming front opening`). Sebep iki katmanlı ve
ikisi de ölçüldü:
1. `front`/`back` yalnız `op.overlay.region`'da ilan ediliyor; `overlay`
   bileşeninin motorda bastığı panel **0** → ad doğmuyor.
2. `op.attach.position` `centerFront`/`centerBack` diyor, `edit-locality`
   ise aynı yeri `cfZone`/`backZone` diye KISALTIYOR. İki sözlük aynı yeri iki
   ayrı yazımla adlandırdığı için birleşmiyorlar → 4 ad daha doğmuyor
   (`band/collar/cuff.centerFront|centerBack`).

## 1. ÜRETEÇ — `engine/tools/gen-anchors.mjs`

Çıpa **ancak bir bileşenin İLAN ETTİĞİ konumdan** doğar. İki aile:

| aile | zincir | çıpa |
|---|---|---|
| `bolge` | `edit-locality:zones.<z>` ⟵ en az bir `composition.json` bileşeni `conflictClass`'ında `<z>` ilan ediyor ⟶ motorun bastığı, bölgenin dışlamadığı paneller | **9** |
| `operator` | `primitives:bilesenler.<c>.primitifler` bir operatör sayıyor ⟶ operatörün konum parametresi değeri ilan ediyor ⟶ o değerin bir BÖLGESİ var ⟶ bölge `<c>`'nin panellerini dışlamıyor | **10** |

★ **Kross-çarpım yasağı iki kere uygulandı.** Bariz olanı (taraf × jeton)
zaten yasaktı. İkincisi daha sinsiydi ve ilk taslakta içine düştüm: bileşen bir
OPERATÖRÜ ilan ediyor, KONUMU değil. `cuff` `op.attach` kullanıyor, ama
`op.attach.position` 8 değer sayıyor ve `cuff.neck` onlardan biri değil.
Bileşen × 8 değer alınınca **49 çıpa** çıkıyordu ve içinde `cuff.neck`,
`collar.hem`, `skirt.nape`, `band.wrist` vardı — bir seviye aşağı inmiş aynı
menü. Üçüncü ilan (bölge) zinciri kapattı: **49 → 19**. Zincirdeki kopuk halka
adı TAHMİN ETTİRMEZ, ÖLDÜRÜR.

Doğmayan **37 ad** silinmedi, `_dogmayan` içinde sebebiyle duruyor
(`primitives-v1.json:_yasa.5` — bilgi atmak, bilgi vermemekten beterdir).

**Paneller listelenmedi, ÖLÇÜLDÜ.** Sayım motoru `contract/edit-locality-v1.json`
`fieldZones`'un her alanının `engine/vocab.json` değerleriyle, her `garment`
değeri altında sürüyor: **390 taslak, motor 331'ini çizdi, 59'unu ADIYLA
reddetti** (`invalid spec: a skirt has no bodice…` — RULES md.1'in cevabı, panel
değil). Çıkan **86 ayrı panel adı** dosyanın `_olculenPaneller` alanında.

Panel → katman-2 bileşen eşlemesi de elle yazılmadı: kural bileşen ANAHTARININ
kendisi (`primitives-v1.json:bilesenler.<c>`), panel adında kelime olarak
aranıyor. Eşleşmeyen **59 panel** (`Front`, `Top Center Back`, `Bias binding`…)
`_bilesensizPaneller` altında açık bırakıldı — operatör ailesinde çıpa
doğurmuyorlar.

## 2. BEKÇİ — `engine/tests/anchor_source_check.mjs` (ctest: `anchor_source_check`)

Dört kapı, ve yalnız birincisi üretecin kendi sözü:
1. **regen-and-diff, tolerans SIFIR BAYT.** İki koşu `mktemp`'e, determinizm
   ÖLÇÜLÜYOR; kapı yargıladığı ağaca yazmıyor (k8s `verify-generated.sh` hamlesi,
   emsali `engine/tests/vocab_source_check.sh`). `--check` bayrağının kendisi de
   çapraz doğrulanıyor.
2. **Her `kaynak` yeniden çözülüyor**, üreteçten BAĞIMSIZ. `op.attach` gibi
   noktalı anahtarlar ve `components[7]` gibi dizi indeksleri destekli. Ayrıca
   bölge çıpalarının `bilesen` listesi `composition.json`'dan yeniden türetilip
   birebir karşılaştırılıyor — çözülen bir indeks tek başına yetmez
   (`components[7]` içinde ne olursa olsun vardır).
3. **Sıfır panele inen ad = `frontCenterback` sınıfı → KIRMIZI.** Ayrıca ad
   içinde iki ayrı konum jetonu varsa KIRMIZI; jeton kümesi `primitives`'ten
   burada YENİDEN türetiliyor.
4. **`_dogmayan` denetimi.** 1. kapı tek başına yalanla geçilebilir: üreteç
   diff'in iki tarafını da kendi yazar. Bu yüzden reddedilen adların gerçekten
   `anchors` dışında olduğu ve sebeplerinin dolu olduğu ayrıca sınanıyor.

## 3. MUTASYON KANITI — 3 mutasyon, 3 kırmızı, 3 geri alma, 3 yeşil

`GECE/log/V6-D.mutasyon.txt` (koşan komut: `bash` betiği, her adımda
`node engine/tests/anchor_source_check.mjs` + `EXIT=`).

| # | mutasyon | sonuç | kapıyı ateşleyen |
|---|---|---|---|
| T0 | yok | **EXIT=0** | — |
| M1 | `anchors-v1.json`'a elle `elleYazilanCipa` eklendi | **EXIT=1** | STALE/HAND-EDITED + damga satırı + `bilesen` composition'la uyuşmuyor + `_olcum.cipa=19` ama 20 kayıt |
| M2 | `collar.neck`'in `kaynak`'ı `…degerler.OLMAYAN_ANAHTAR` yapıldı | **EXIT=1** | `kaynak … does NOT resolve` |
| M3 | üretece kross-çarpım açıldı (`build({cross:true})`) | **EXIT=1** | 32 çelişik ad doğdu (`frontCenterBack`, `backFront`, `frontFront`, `backBack`…), her biri kaynaksız + sıfır panel |

Üçünün de geri alınması **EXIT=0**; `git diff --stat` çalışma ağacında bu iki
dosya için sıfır satır bırakıyor (logun sonunda).

## 4. ÖLÇÜM

Komut: `node engine/tools/gen-anchors.mjs`

```
19 anchors, 7 carry an edge fraction, 86 panel names measured over 390 drafts
(59 refused by the engine), 37 names NOT born.
```

- **çıpa: 19** (9 bölge + 10 operatör)
- **kenar oranı (0..1) taşıyabilen: 7/19.** Kaynağı uydurma değil: bileşenin
  demetinde `_birimler.kesir` tipinde parametresi olan bir operatör varsa
  taşıyor (`op.suppress.atFraction` / `op.split.atFraction`). 7'sinin hepsi
  bölge ailesinde; operatör ailesinin 10'u **taşımıyor**, çünkü `op.attach` ve
  `op.extend`'in kesir parametresi yok.
  ⚠ Bu, "kenar üstünde 0..1 konum verilebilir" DEMEK DEĞİL — kenarın kimliği
  hâlâ yok (V6-C md.2). Taşınan şey, operatörün kesir kabul ETTİĞİ ilanı.
- **operatör sicili** (`garment-spec-v2.json:operators`, sayı olarak):
  **9 shipped · 1 flagged · 5 absent.**

### 26 serbest terimin kaçının konum ibaresi karşılanıyor?

Komut ve betiğin tamamı: `GECE/log/V6-D.kapsam.txt` (dosyanın başındaki
`---8<---` bloğu betiğin kendisi; referans leksikon çıpa dosyasından BAĞIMSIZ,
doğrudan `primitives` + `edit-locality` + `figure-landmarks`'tan kuruluyor).

```
serbest terim (outOfVocab, tekil): 26
referans konum leksigi: 26 sozcuk
cipa sozlugunun tasidigi konum sozcugu: 13
konum ibaresi TASIYAN terim: 13/26
cipa sozlugunun ibarenin TAMAMINI karsiladigi: 7/26 (konumlulara gore 7/13)
```

**Karşılanan 7:** `waistband seam` · `beaded empire waist sash` ·
`sequin/crystal shoulder embellishment` · `empire seam lace trim band` ·
`dropped waist` · `neck ribbon tie` · `peplum at waist`.

**Karşılanmayan 6, eksik jetonlarıyla:** `front` (5 terim), `hip` (2 terim).

⚠ **V6-C ile SAYI FARKI VAR, gizlemiyorum.** V6-C "konum ibaresi taşıyan 15/26,
karşılanan 12/26" dedi; ben 13/26 ve 7/26 ölçtüm. Fark ikisinin de hatası değil,
**leksikon tanımı**: V6-C 27 jetonu sayarken bileşen adlarını da (`sleeve`,
`collar`, `cuff`, `skirt`) konum saymış; ben konum leksikonundan `surface` ve
`global`'i çıkardım ve bileşen adını konum saymadım (`lace overlay bodice and
sleeves` bir KONUM ibaresi değildir). Asıl düşüş 12 → 7'de ve **gerçek**: V6-C
jeton seviyesinde saydı, ben ÇIPA seviyesinde — `front` jetonu kaynaklı ama
`front` ÇIPASI doğmuyor. V6-C'nin kendi uyarısı ("bu %80'e aldanmayın, kesişim
jeton seviyesinde") bu sayıyla nicelendi.

## 5. RULES md.9 — YENİ KIRMIZI AD DOĞMADI

Komut ve tam çıktı: `GECE/log/V6-D.ctest.txt`
```
ctest --test-dir engine/build -R "edit_locality|anchor|vocab" --output-on-failure
```
```
1/4 edit_locality_check ..... Passed 0.14 sec
2/4 anchor_source_check ..... Passed 1.48 sec     <- bu kartın yeni kapısı
3/4 vocab_source_check ...... Passed 0.10 sec
4/4 vocab_reference_check ... ***Failed 4.56 sec
```
⚠ **`vocab_reference_check` BENİM ÖNÜMDE KIRMIZIYDI, bu kart onu kırmadı.**
Kanıt: kapı sayımı `git worktree` ile **HEAD commit'i** üstünde yapıyor
(`olculen: commit HEAD (572316a)`), bu kartın dosyaları o an **takipsizdi**
(`git status --porcelain` → `?? contract/anchors-v1.json` …), yani sayıma
girmediler. Artan 6 eksen (`garment +6`, `neckline/shaping/skirtStyle/
topLength/yoke +1`) HEAD'de duran başka bir işin. **Karar bu kartın işi değil,
dokunulmadı.**

**Bu commit ratchet'i +36 DERİNLEŞTİRİYOR — ölçüldü, gizlenmiyor.**
Commit'ten sonra `bugun toplam 10444 → 10480 (taban 10438, delta +42)`,
`19 artan, 0 yeni`. Nereden geldiği kalem kalem:
- `anchors-v1.json:anchors[].bilesen` — bölge çıpalarını doğuran
  `composition.json` bileşen id'leri (`backDetail`, `buttonRow`, `exposedZip`,
  `sleeveCap`, `backSlit`, `ruffledStraps`, `peplum`, `yoke`, `hemShape`,
  `shoulderStyle`, `edgeFinish`…). Bunlar çıpanın KAYNAĞI; çıkarılırsa çıpanın
  kimden doğduğu kaybolur. **Çıkarılamaz.**
- `neckline` **17 kez** — hepsi ölçülen panel adından
  (`Bias binding (neckline + armholes)`), her çıpanın `eslesen` listesinde
  tekrarlanıyor. **Bu tekrar giderilebilir** (panel adlarını bir kez
  `_olculenPaneller`'de tutup çıpalarda indeksle göstermek), süre tavanına
  takıldığı için YAPILMADI — kalan iş.
- `GECE/log/V6-D.ctest.txt`'in per-eksen dökümü commit'ten ÇIKARILDI: o döküm
  kapalı enum adlarını satır satır basıyor ve dosya commitlenince ratchet'in
  kendi sayımını büyütüyordu (kendine referans). Dosyanın başında not var.

Ratchet tabanı **elle yeniden kesilmedi**: kapı zaten HEAD'de kırmızıydı ve
taban başka bir işin kararı (`--baseline` ayrı ve kasıtlı bir commit olmalı).

Ölçümün kendisi: `anchors-v1.json`
`neckline` kelimesini **17 kez** taşıyor — hepsi ölçülen panel adından
(`Bias binding (neckline + armholes)`). Gürültüyü azaltmak için üretecin
`_operatorSicil` alanı **operatör ADLARINI kopyalamaktan çıkarıldı**, yalnız
status sayımı kaldı (ayrıca V6-C md.4: v2 sicili YÜZEY hattını, ölçülen artefakt
ESKİ hattı anlatıyor — adı kopyalamak kimsenin göstermediği bir mutabakatı
iddia etmek olurdu). Panel adları kalıyor: onlar ölçümün kendisi.

---

## KART DIŞI FARK EDİLENLER (dokunulmadı)

1. **`cfZone`/`backZone` ile `centerFront`/`centerBack` birleşmiyor.** Aynı yeri
   iki kontrat iki ayrı yazımla adlandırıyor; makine ikisini bağlayamadığı için
   4 çıpa doğmuyor. Tek satırlık bir takma-ad alanı (`zones.cfZone._konum:
   "centerFront"`) bunu kapatır — ama bu bir KONTRAT değişikliği, kartın işi
   değil, Damla kararı.
2. **`overlay` bileşeninin motorda paneli YOK.** `primitives-v1.json` onu katman
   2'de sayıyor, 390 taslakta adında `overlay` geçen tek panel çıkmadı. 6 ad
   (`overlay.cap/yoke/front/back/hem/neck`) bu yüzden doğmuyor. CLAUDE.md
   "Upper Sleeve = büzgülü üst KATMAN operatörü eksik" diyor — aynı boşluk,
   şimdi sayıyla.
3. **`hip`, `bust`, `knee`, `nape`, `wrist`, `cap`, `yoke` konumlarının BÖLGESİ
   yok.** `op.extend.fromLandmark` 8 landmark sayıyor, `edit-locality` 9 bölge
   sayıyor, kesişim yalnız `shoulder/waist/hem`. `hip` özellikle can yakıyor
   (serbest kanalda 2 terim). `figure-landmarks.json`'da `hip` zaten
   `y=null, hedef` durumunda — V6-C'nin "sözlük eksiği değil ÖLÇÜM eksiği"
   teşhisi burada da geçerli.
4. **59 panel hiçbir katman-2 bileşenine bağlanamıyor** (86'nın %69'u):
   `Front`, `Back`, `Center Front`, `Top Center Back`, `Bias binding (neckline)`,
   `Waist Tie (bel bağı)`… Motor `Top …` ve çıplak `Front/Back` diye basıyor,
   `primitives` ise `bodice` diyor. Bu bir adlandırma kopukluğu ve operatör
   ailesinin kapsamını doğrudan daraltıyor.
5. Motor 390 taslağın **59'unu reddetti** ve hepsi ADIYLA reddetti
   (`cuffStyle requires a sleeve: set sleeveStyle to 'straight' or 'balloon'`).
   RULES md.1 bu hatta çalışıyor — sessiz düşürme görülmedi.
6. `_olcum.motorKabul` **331**; V6-C 88 spec taramıştı. İki sayı çelişmiyor,
   farklı taramalar (benimki `garment` ekseni × alan × değer).

## GÖREMEDİKLERİM / ERİŞEMEDİKLERİM

- `engine/tools/spec-diff.mjs` **yalnız okundu** (kart yasağı, V6-E yazıyor).
  Sayım onun `draft()`/`LOCALITY` ihracatını kullanıyor; o dosya değişirse
  bu üretecin çıktısı da değişir — bu bir **bağımlılık**, `--check` onu yakalar
  ama ADIYLA uyarmaz.
- `patterns_real/` açılmadı (kart yasağı). Gerçek Buğra kalıbından çıkarılmış
  kenar/landmark isimleri orada olabilir; **DOĞRULANMADI.**
- `surfacepattern.cpp` yüzey hattının kendi çıktısı taranmadı; ölçülen artefakt
  `engine/dist/stitchu-engine.js` hattınındır (V6-C md.4 ile aynı sınırlama).
- Görsel artefakt (PNG) üretilmedi: bu kart bir sözleşme+kapı kartı, RULES md.3'ün
  render adımını gerektiren bir geometri/özellik iddiası taşımıyor.
- `vocab_reference_check`'in HEAD'deki kırmızısının SEBEBİ araştırılmadı
  (başka işçinin commit'i, kart dışı).
