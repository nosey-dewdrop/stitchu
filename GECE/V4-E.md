# V4-E — KAPININ DEĞER ALANI ARTIK SEÇİLMİYOR, TÜRETİLİYOR

Tur 5, SIRALI, DÜZELTME turu. Kart: `GECE/KART/V4-E.md`.
Hakem V4'ü **KALDI** dedi ve iki kusur saydı; ikisi de onarıldı, hüküm tartışılmadı.

---

## KUSUR 1 — DEĞER ALANI ELLE SEÇİLMİŞTİ → KAYNAKTAN TÜRETİLDİ

**Hakemin ölçtüğü:** kapı `['none','set','raglan','puff','cap']` listesi üstünde
koşuyordu = o gece onarılan ikisi + zaten ayrışan üçü. Alan dışı altı değerin
altısı da `set` ile eleman kümesi ÖZDEŞ, kontur 2705.08u, fark 0.00u.

**Onarım:** liste SİLİNDİ. Kapı alanı beş kaynaktan türetiyor, hiçbiri elle
yazılmıyor. Alanı basan komut = kapının kendisi:

```
node engine/tests/flat_expresses_spec_check.mjs        # log: GECE/log/V4-E.kapi.txt
```

| kaynak | ne veriyor |
|---|---|
| `git ls-files '*.json'` (163 dosya) içindeki fiili kullanım | straight **237** · none **140** · balloon **35** · cap **29** |
| `engine/vocab.json` `fields` (kapalı enum + BEYANLI eşanlamlar) | balloon none straight + bishop fitted puff set-in |
| `contract/spec-grammar.json` `slots` | balloon cap none straight |
| `contract/spec-v1-v2-map.json` `axes` | v1 yazımı → v2 sicil değeri |
| `contract/garment-spec.schema.json` `$defs.draftSpec` | balloon none straight |

Türetilen alan: **kol 8 yazım** (4 kanonik + 4 beyanlı eşanlam) · **yaka 7** ·
**omuz 3**. Aynı türetme faz-öncesi ağaçta (`c396fb4`) koşturuldu ve **birebir
aynı alanı** verdi (`GECE/log/V4-E.bostest.txt` başı) — yani alan bu gecenin
düzeltmesine göre şekillenmiyor. Hakemin aradığı kanıt budur.

### İki kova, üçüncüsü yok
- **İFADE EDİLDİ** — aynı taban spec'te başka her kanonik değerden geometrik
  olarak farklı çizim (fark > 0; eşik yok, eşitlik/eşitsizlik).
- **UNEXPRESSED** — çizim başkasıyla özdeş AMA kalem değeri ADIYLA
  `data-engine-gap`'e damgalıyor ve kapı onu ADIYLA sayıyor. Damgasız
  özdeşlik = KIRMIZI.
- **Beyanlı eşanlam istisnası** (uydurma değil): vocab `bishop→balloon`,
  `puff→balloon`, `set-in→straight`, `fitted→straight` diyor. Bunların AYNI
  çizmesi doğrudur ve kapı bunu ayrıca ŞART koşuyor — beyanı yalanlayan eşanlam
  da kusurdur. Dördü de ok.

### ÖNCELİK: fiilen kullanılan değer gerçekten İFADE EDİLDİ
`balloon` (**35 kullanım**) sessizce DÜZ kola düşüyordu. Kök sebep kalemde
görünürdü: puf dalı yalnız sayısal kapak alanından tetikleniyordu, kolun kendi
adından değil. **Yeni sayı UYDURULMADI** — puf çizimi `contract/flat-convention-v1.json`
`croquis.sleeveLaw`'ın ölçülmüş kanunundan (Buğra Locket EU38 Alt Kol) aynen
geliyor; eksik olan tek şey o dala türetilmiş yoldan girmekti.

Dal artık addan değil TÜRETİLMİŞ SİCİL DEĞERİNDEN seçiliyor:
`vocab eşanlamı → kanonik → v1v2 haritası → v2 kapalı enum → çizim dalı`.
Yan kazanç: `bishop` de aynı hamlede onarıldı, çünkü vocab onu balloon'un
eşanlamı ilan ediyor.

**ÖLÇÜLEN (kapının kendi çıktısı):**

| yazım | eleman | kontur | önce |
|---|---|---|---|
| none | 6 | 1917.76u | — |
| straight | 10 | 2705.08u | 2705.08u |
| **balloon** | **54** | **2996.36u** | 10 eleman / 2705.08u (= straight) |
| cap | 10 | 2354.75u | — |

Görsel kanıt (RULES 3): `GECE/log/V4-E.kol/sleeve-balloon.png` ·
`sleeve-straight.png` · `sleeve-cap.png` · `sleeve-none.png` · `sleeve-bishop.png`
(+ aynı adlarla .svg).

### İFADE EDİLEMEYENLER — GİZLENMEDİ, SAYIYA BAĞLANDI
Yaka bandının beş türü bugün de aynı bandı basıyor; ayırmak ölçülmüş bir yaka
kanunu ister, sicilde `collarFamily` **absent** ve `contract/flat-convention-v1.json`
bir yaka kanunu taşımıyor. Sayı uydurmak yasak → dördü ADIYLA UNEXPRESSED:
**shirt · mock · flat · crescent** (hepsi `stand`'in bandıyla özdeş, kontur
2053.59u, fark 0.00u, dördü de damgalı). Omuzda **dropped** aynı durumda.

**RATCHET (bugün ÖLÇÜLDÜ, kapının başlığında yazılı, yalnız DÜŞER):**

```
kol   UNEXPRESSED 0/0
yaka  UNEXPRESSED 4/4   [shirt · mock · flat · crescent]
omuz  UNEXPRESSED 1/1   [dropped]
```

Artıran commit kapıda kırmızı düşer. Bu kova DÜRÜSTLÜKTÜR: bugün ifade
edilemeyeni yeşile boyamak yerine bir sayıya bağladık.

**Yeni şart (C):** sicilin kapalı enum'unun HER değerinin bir çizim dalı
olacak. Enum büyürse kapı büyür — alanın bir daha elle yazılmasını bu engelliyor.

**Bir kat daha aşağı:** ALAN ADLARI da elle yazılmıyor. `engine/vocab.json` her
alanı bir enum TİPİNE bağlıyor; hem kapı hem kalem alan adını o tipten buluyor
(`fieldOf('SleeveStyle')`). Yan kazanç ölçüldü: kapalı-enum ratchet'i düz metni
de saydığı için eksen adlarını yazmak sayıyı ŞİŞİRİYORDU — ilk yazımda
`omuz +5 / kol +1` ile **FAIL** verdi; türetmeye geçince taban KESİLMEDEN
`kol 351→347 · yaka 81→80` ile YEŞİL'e döndü.

---

## KUSUR 2 — `raglan` BİR RAGLAN DEĞİLDİ

### 2a. `c993491`'in yanlış cümlesi
O commit'in gövdesi *"the seam runs neck → underarm **instead of** shoulder tip →
underarm"* diyordu. **Bu cümle YANLIŞTI.** Ölçüldü: `data-part="sleeve"` path'i
`set` ile birebir aynıydı ve hâlâ omuz ucundan (`M 70.2 16.9`) başlıyordu; dikiş
onun YERİNE değil ÜSTÜNE ekleniyordu. Düzeltme burada ve V4-E commit'inin
gövdesinde açıkça yazılı, sessizce silinmedi.

### 2b. Yinelenen çizim ÖLDÜ (kırpmayla değil, kökten)
`sleeveHalf` zaten SAĞ YARIMDIR ve çağıran `viewPanel` çıktının tamamını bir kez
daha aynalar; V4-B kodu dikişi bir de kendi içinde aynalıyordu → görünüm başına
**4 kopya**. `set 10 → raglan 18` eleman artışının **8'i** üst üste binen kopyaydı.
Ayrı `raglan-seam` path'i tamamen kaldırıldı: dikiş artık kol parçasının kendi
KAPANAN kenarı. **Ölçülen: raglan eleman 18 → 10** (`set` ile aynı sayı).

### 2c. Topoloji GERÇEKTEN kuruldu
Raglanın tanımı: omuz dikişi yoktur, omuz ucu köşesi GÖVDEYE değil KOLA aittir.
Kol parçasının üst kenarı artık **yaka tabanından** başlıyor
(`M 30.0 4.0`; set-in'de `M 70.2 16.9` = omuz ucu), omuz ucunun üstünden geçip
bicep'e iniyor, koltukaltından yakaya kapanıyor ve kapanan parça kağıtla dolduğu
için gövde siluetinin omuz parçası kolun ALTINDA kalıyor.

```
shoulderStyle set      eleman 10  kontur 2705.08u
shoulderStyle raglan   eleman 10  kontur 3186.67u   (fark 481.59u)
```

PNG: `GECE/log/V4-E.kol/shoulder-raglan.png` · `shoulder-set.png` ·
`shoulder-dropped.png`.

### 2d. ★ KART DIŞI, AMA KUSURUN ASIL KÖKÜ: raglan YANLIŞ EKSENDEYDİ
Türetme sırasında ölçüldü: **`raglan` bir kol değeri DEĞİLDİR.** Hiçbir kaynak
onu kol alanına koymuyor (takipli JSON'larda 0 kullanım); `engine/vocab.json`,
`contract/garment-spec.schema.json`, `contract/composition.json` ve
`contract/vocab-resolution-v1.json` dördü de onu **omuz** ekseninde ilan ediyor.
V4-B kalemi onu yanlış eksene bağlamıştı — kapının "raglan ile set aynı" ölçümü
de bu yüzden kol ekseninde alınmıştı.

Onarım: kalem raglanı artık omuz ekseninden okuyor (eski kol yazımı geriye dönük
kabul ediliyor), ve o eksen kapıya TÜRETİLEREK girdi. Böylece raglan onarımı bir
KAPIYLA korunuyor: `set` ile özdeş çizerse kırmızı düşer. Omuz ekseninin üç
değeri de sicilde YOK (`topology.shoulder` yalnız `strapless`/`shoulderSeam`
taşıyor, `spec-v1-v2-map.json`'da bu eksen hiç yok) → üçü de artık adıyla
damgalanıyor; `dropped`ın sessizce `set` gibi çizilmesi böylece görünür oldu.

---

## ZORUNLU KANITLAR

| kanıt | komut | log | sonuç |
|---|---|---|---|
| tam ctest | `ctest --test-dir engine/build --output-on-failure` | `GECE/log/V4-E.ctest.after.txt` + `V4-E.reddiff.txt` | 111 test, 544.12 sn, **kırmızı AD kümesi AYNI 6, diff BOŞ** |
| §4.2 boş test | faz-öncesi `c396fb4` worktree'sinde aynı kapı | `GECE/log/V4-E.bostest.txt` | **7 FAIL, exit 1** |
| §4.5 mutasyon | puf dalını tekrar yalnız sayısal alandan tetikle | `GECE/log/V4-E.mutasyon.txt` | `RATCHET … 1/0 [balloon] — TAVAN ASILDI`, exit 1 → geri al → 0 FAIL, exit 0 |
| ratchet tabanı | `bash engine/tests/vocab_reference_check.sh --tree .` | `GECE/log/V4-E.vocab-ratchet.txt` | **YEŞİL**, taban kesilmedi |
| kapı çıktısı | `node engine/tests/flat_expresses_spec_check.mjs` | `GECE/log/V4-E.kapi.txt` | 0 FAIL |
| PNG | — | `GECE/log/V4-E.kol/` (8 svg + 8 png) | RULES 3 |

Boş test çıktısındaki 7 FAIL: `balloon`≡`straight` · yaka `shirt`/`mock`/`flat`/
`crescent`≡`stand` · omuz `dropped`≡`set` · `raglan`≡`set` — hepsi damgasız,
yani faz-öncesi ağaçta SESSİZ ÇÖKERTME.

---

## KART DIŞI FARK EDİLEN (dokunulmadı, yazıldı)

1. **`sleeveCap` sayısal değerleri kaymış olabilir.** Kalem `sleeveCap === 4`'ü
   cap kol sayıyor, ama `engine/vocab.json` `fields.sleeveCap` dört değer ilan
   ediyor (`plain gathered puffed cap`) → cap'in indeksi **3**. `4` hiçbir
   şeye karşılık gelmiyor gibi duruyor. DOĞRULANMADI, dokunulmadı.
2. **`cap` iki sözleşmede çelişiyor.** `contract/spec-grammar.json` onu kol
   değeri olarak beyan ediyor ve takipli JSON'larda **29 kez** geçiyor; ama
   `engine/vocab.json` `fields` kapalı enum'u ve
   `contract/garment-spec.schema.json` onu kol değeri saymıyor (orada
   `sleeveHead: capped`). İki sözleşme aynı değeri farklı eksene koyuyor.
3. **`collarType 81`** takipli bir JSON'da bir kez geçiyor
   (`engine/tests/vocab-reference-baseline.json`) ve enum 0-6 aralığının
   dışında. Kapı onu alana almadı (aralık dışı), ama kaynak dosyada duruyor.
4. **Yaka adları alandan tamamen dışarıda.** `mandarin`/`notched`/`sailor`
   gramerde PARK'ta, sayısal enum'da karşılığı yok — kalem onları hiçbir yoldan
   alamaz. Kapı bunu bugün yargılamıyor.
5. **V4-D'nin en sert bulgusu ayakta:** bu düzeltmeler de sevk edilen `web/`
   yüzeyine ULAŞMIYOR (canlı sayfalar salt-okunur referans kalemden çıkıyor).
   Bu gecenin işi kapı + üretim kalemi tarafında.

## YAPILAMAYAN

- **Yaka ailesi hâlâ ayrılmadı** (4 UNEXPRESSED). Ayırmak ölçülmüş bir yaka
  kanunu ister; contract'ta yok, sayı uydurmak yasak. Sayıya bağlandı.
- **`dropped` omuz ayrılmadı** (1 UNEXPRESSED). Aynı gerekçe: düşük omuz ucunun
  ölçülmüş bir kaynağı yok.
- **Raglanda gövde siluetinin omuz parçası SİLİNMEDİ**, kolun kağıt dolgusunun
  ALTINDA kalıyor. Çizim doğru okunuyor ama silüet path'i hâlâ omuz ucunu
  taşıyor; kökten çıkarmak `halfOutline`'ı değiştirmek demek ve o, kollu/kolsuz
  bütün stillerin ortak yolu — bu kartta yapılmadı.
