# V6-A — ÖNCE ÖLÇÜMÜ (foto→spec isabeti, 25 Ağu 2026)

Onarım YAPILMADI: prompt, şema, sözlük değişmedi. Değişen tek dosya ölçüm aleti
(`engine/tools/foto-spec-olcum.mjs`). Bu dosyadaki her sayı bu gece kendi
komutumla üretildi; hiçbiri devralınmadı. Ham çıktılar: `GECE/log/V6-A.olcum.txt`.

---

## 0. ALETE EKLENEN `--bank` BAYRAĞI (kart md. 1)

Banka adı tarih damgalıydı (`live-<bugün>.json`), yani dünün koşusu bugün
tekrar edilemiyordu. Bayraksız koşu:

```
$ node engine/tools/foto-spec-olcum.mjs --offline
FOTO 0 · TAM DOĞRU SPEC 0 (%0.0)
banka: .../vision/eval/live-2026-08-25.json      ← diskte YOK
```

Sahte tarihli kopya bırakılmadı; alete `--bank <yol>` eklendi. Bundan sonraki
bütün sayılar bu komuttan:

```
node engine/tools/foto-spec-olcum.mjs --offline --bank vision/eval/live-2026-08-22.json
```

---

## 1. BUGÜNKÜ İSABET (kart md. 2)

| ölçü | sayı | komut |
|---|---|---|
| FOTO (payda) | **5** | `node engine/tools/foto-spec-olcum.mjs --offline --bank vision/eval/live-2026-08-22.json` |
| TAM DOĞRU SPEC | **1 / 5 = %20.0** | aynı komut |
| ALAN YARGISI | **51**, tutan **47 = %92.2** | aynı komut |
| GORME | 4 (hata toplamının %100'ü) | aynı komut |
| KELIME | 0 | aynı komut |
| MOTOR | 0 | aynı komut |

Foto foto:

| foto | alan | GORME | KELIME | MOTOR | KONUM | panel |
|---|---|---|---|---|---|---|
| 01-a-line-cocktail-dress-mannequin | 10/11 | 1 | 0 | 0 | 0 | 10 |
| 02-ball-gown-exhibit | 9/10 | 1 | 0 | 0 | 2 | 10 |
| 03-wedding-dress-mannequin | 9/10 | 1 | 0 | 0 | 1 | 10 |
| 04-babydoll-dress | 9/10 | 1 | 0 | 0 | 3 | 6 |
| 05-empire-waist-gown | 10/10 | 0 | 0 | 0 | 5 | 8 |

Dört GORME hatasının tamamı: `shaping dart→princess` · `neckline square→boat`
· `skirtStyle aLine→straight` · `sleeveLength elbow→long`.

**%20 ve %92.2, 0B'nin bastığı sayılarla AYNI ÇIKTI** (devralınmadı, yeniden
üretildi; banka dosyası 22 Ağu'dan beri değişmedi, bu yüzden aynı çıkması
beklenendi).

### Payda neden 5'ten büyük yapılamadı?

```
$ ls vision/eval/photos | wc -l                 → 29
$ labels.json göz etiketli foto                 → 19
$ live-2026-08-22.json bankalı foto             → 5
$ live-baseline-oldprompt.json foto             → 68
$ labels ∩ oldprompt                            → 0
```

- Göz etiketi 19 fotoda var, banka 5'inde. Kalan **14 etiketli foto için canlı
  `/api/analyze` çağrısı gerekir = kartın ücretli-çağrı yasağı.** Tahmin edilmedi.
- 68 fotoluk `live-baseline-oldprompt.json` payda olamaz: **ESKİ PROMPT'un
  çıktısı** ve göz etiketiyle **kesişimi 0 foto** — o dosyadaki hiçbir fotonun
  göz etiketi yok. `node vision/eval.js eval/live-baseline-oldprompt.json`
  → `OVERALL 0/0`.

---

## 2. DÖRT TAHMİN DOSYASI YAN YANA (kart md. 3)

Komut: `node vision/eval.js <dosya>` (10 alan; `topLength` ve `shaping` bu
alette yargılanmaz — foto-spec-olcum 12 alan yargılar, farkın sebebi budur).

| dosya | OVERALL | payda | en zayıf alan |
|---|---|---|---|
| `eval/live-2026-08-22.json` (bugünkü banka) | **47/50 = %94** | 5 foto | skirtStyle %80 |
| `eval/opus-predictions.json` | **67/78 = %86** | 9 foto | sleeveLength %67 |
| `eval/siglip-predictions.json` | **105/162 = %65** | 19 foto | neckline %31 |
| `eval/clip-predictions.json` | **71/162 = %44** | 19 foto | neckline %6 |
| `eval/live-baseline-oldprompt.json` | 0/0 | 0 foto (kesişim yok) | — |

Alan kırılımı (ham çıktı logda). Dikkat çeken: CLIP neckline **1/16**, skirtStyle
**3/16**, length **3/15**, keyhole **8/19** — SigLIP her üçünde de belirgin
üstün (5/16, 6/16, 7/15, 14/19), ama ikisi de `neckline`'da çöküyor.
`fabric` tek istisna: CLIP %89, SigLIP %89, opus %100.

⚠ **Paydalar EŞİT DEĞİL** (5 / 9 / 19 / 19). %94 ile %44 aynı fotoların üstünde
ölçülmedi; bu tablo bir sıralama değil, dört ayrı ölçüm.

---

## 3. KONUM — YENİ HATA SINIFI (kart md. 4)

**Tanım (alete kodlandı):** terim bir yapı elemanının YERİNİ söylüyor
(`at hip`, `front neck`, `empire waist`, `back` …) ama üretilen spec o yeri
**hiçbir alanında** taşımıyor. Alan adı ya da alan değeri o konum sözcüğünü
içeriyorsa "taşıyor" sayılır (camelCase ayrılır: `topLength`→[top,length],
`vNeck`→[v,neck]). Serbest kanal (`outOfVocab`) terimleri üstünde ölçülür,
**alan yargısıyla çakışmaz** — çift sayım yok.

| ölçü | sayı | komut |
|---|---|---|
| serbest kanal terimi | **26** | `--offline --bank vision/eval/live-2026-08-22.json` |
| konum ibaresi **taşıyan** terim | **15 / 26 = %57.7** | aynı komut |
| bunların spec'te yer bulamayanı = **KONUM** | **11 / 26 = %42.3** | aynı komut |

15 konumlu terim ve taşıdıkları konum sözcüğü:

```
asymmetric draped pleated overlay at hip            hip
beaded empire waist sash                            empire,waist
lace overlay bodice and sleeves                     bodice
sequin/crystal shoulder embellishment               shoulder
lace applique bodice overlay                        bodice
empire seam lace trim band                          empire
dropped waist                                       dropped,waist
front hip welt pockets                              front,hip
knife pleated skirt                                 skirt
neck ribbon tie                                     neck
robe à la française open front over petticoat       front
pointed bodice front (stomacher)                    bodice,front
peplum at waist                                     waist
self-fabric ruched robings trimming front opening   front
open-front overskirt revealing matching underskirt  front
```

15 konumlu terimin 11'i KONUM'a düşüyor; 4'ü düşmüyor çünkü spec o sözcüğü
tesadüfen taşıyor (`sequin/crystal shoulder…` → `shoulderStyle`;
`knife pleated skirt` → `skirtStyle`/`skirtLength`; `empire seam lace trim band`
ve `asymmetric…at hip` → `waistline=empire` / `topLength=hip`).

★ **En sık kayıp konum `front` (5 terim) ve `bodice` (3 terim).** Spec'te
ön/arka ayrımı yapan **hiçbir alan yok**: 16 varsayılan alanın hiçbiri bir yan
taşımıyor. Bu, KELIME (sözlük dar) sınıfından ayrı bir kusur — kelime sözlüğe
eklense bile spec onu **nereye** koyacağını söyleyemez.

Foto başına KONUM: 01→0, 02→2, 03→1, 04→3, 05→5. Tek TAM DOĞRU SPEC olan foto
(05) aynı zamanda **en çok KONUM kaybeden** foto — alan yargısı %100 tutarken
serbest kanalda 8 terimin 5'i yerini kaybediyor.

---

## 4. İKİ SİCİL — 26 TERİM İKİSİNE DE SORULDU (kart md. 5)

| sicil | boyut | 26 terimden **VAR** | **YOK** |
|---|---|---|---|
| `contract/terms.json` | 52 kanonik / 246 isim | **0** | **26 (%100)** |
| `dataset/vocab-canonical.json` | 88 isim | **0** | **26 (%100)** |
| ikisinde de yok | — | — | **26 (%100)** |

Komut: `node engine/tools/foto-spec-olcum.mjs --offline --bank vision/eval/live-2026-08-22.json`
(alet artık her iki sicili ayrı ayrı basıyor) · terim terim döküm:
`GECE/log/V6-A.olcum.txt` ADIM 5.

**Cevap: 26/26 sayısı sicille DEĞİŞMİYOR.** İki sicilden hiçbiri 26 terimden
tekini bile tanımıyor; kesişim de birleşim de 26. **0B'nin 26/26'sı ile aynı
çıktı** (yeniden üretildi).

Bu bir "iki sicil çelişiyor" bulgusu değil, tersi: **iki sicil de aynı yerde
kör.** `terms.json` ürün diline (drawable/absent kabiliyet), `vocab-canonical.json`
korpus normalizasyonuna bakıyor; serbest kanaldan gelen 26 terim ikisinin de
kapsamı dışında kalıyor.

---

## 5. v2 İFADE EDİLEBİLİRLİĞİ (kart md. 6)

Komut (alete `--v2` modu eklendi):

```
node engine/tools/foto-spec-olcum.mjs --v2 vision/eval/live-baseline-oldprompt.json
```

Kural uydurulmadı, `contract/garment-spec-v2.json` `topology._role`'den okundu:
*"bir değer, gerektirdiği operatörlerden biri `shipped` değilse İFADE EDİLEMEZ
ve red o operatörün ADIYLA verilir."*

| ölçü | sayı |
|---|---|
| FOTO | **68** |
| İFADE EDİLEBİLİR | **15 = %22.1** |
| DÜŞEN | **53 = %77.9** |
| `sleeve` **absent** yüzünden düşen (başka engeli olmayan) | **19 = %27.9** |
| `sleeve` engelinin geçtiği foto (tek engel olmasa da) | **35 = %51.5** |

Operatör başına engel (çakışabilir):

| operatör | statü | foto |
|---|---|---|
| `sleeve` | ABSENT | 35 (%51.5) |
| `skirtFamily` | ABSENT | 20 (%29.4) |
| `gatheredOverlayLayer` | ABSENT | 7 (%10.3) |

Eksen enum'unda karşılığı olmayan (operatör suçlanmadı): `skirtShape='halfCircle'`
5 foto · `garment='other'` 5 foto.

### Bu sayı 0B'nin %36.8'i DEĞİL — kıyaslamayın

Aynı payda (68) ama **ölçüm tanımı benim yazdığım eşleme**, 0B'ninkini görmedim.
İki dürüstlük notu:

1. **`shoulder` ve `closure` eksenleri YARGILANMADI** — görü çıktısı bu ikisini
   okumuyor. `shoulder=shoulderSeam` **flagged** (shipped değil), yani okunabilse
   ifade edilebilir oran **düşerdi**. **%22.1 bir TAVANDIR.**
2. Görü alanı → v2 eksen değeri eşlemesi (`dress→sheathDress`,
   `straight→setIn`, `balloon→puff`, `princess→seamOnly` …) alette açık yazılı
   ve tartışmaya açık. Kural sözleşmeden, eşleme benden.

---

## KART DIŞI, DOKUNULMADI

- `foto-spec-olcum.mjs:109` `if (!bank[file]) { /* hata */ }` — boş gövde, ölü satır.
- Aynı dosyada `used` sayacı `--offline` yolunda hiç artmıyor (`else if (!OFFLINE) used += 0`),
  yani `--limit` offline koşuda etkisiz. Ölçümü bozmuyor (banka 5 kayıt), ama yanıltıcı.
- `vision/eval.js` `topLength` ve `shaping` alanlarını hiç yargılamıyor; bu yüzden
  aynı banka üstünde %94 (47/50) basarken `foto-spec-olcum` %92.2 (47/51) basıyor.
  **İki alet iki farklı payda kullanıyor**, ikisi de "isabet" diyor.
- `vision/eval/photos` 29 dosya, `labels.json` 19 etiket → **10 fotonun göz
  etiketi hiç yazılmamış.** Etiketleme ücretsiz, ölçüm paydasını 5→19 değil
  ama etiket tavanını 19→29 çıkarır.
- `live-baseline-oldprompt.json`'un 68 fotosunun göz etiketiyle kesişimi **0**;
  o dosya bugün hiçbir isabet ölçümünü besleyemiyor, sadece topoloji taramasına
  yarıyor.
