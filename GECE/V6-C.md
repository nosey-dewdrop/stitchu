# V6-C — ÇIPA KAYNAĞI: Katman 2 topolojisi ÜRETİYOR mu?

Ham çıktılar: `GECE/log/V6-C.topoloji.txt` (8 komut, hepsi bu turda koşuldu).
Teşhis kartı — kod/şema/kontrat DEĞİŞMEDİ.

## HÜKÜM (önce, sonra gerekçe)

**KENAR GRANÜLARİTESİNDE ÜRETİLEMEZ — HAYIR.**
Konumlu edit'in ("fiyonk ekle ŞURAYA") istediği çıpa bir PANELİN BİR KENARIDIR.
Repoda **hiçbir dosya bileşen → panel → kenar zincirini taşımıyor** ve motorun
ürettiği artefakt **sıfır adlandırılmış kenar** basıyor. Kaynak = YOK.

**PANEL GRANÜLARİTESİNDE ÜRETİLİYOR — EVET, BUGÜN ÇALIŞIYOR.**
`bölge → panel adı` eşlemesi bugün deterministik olarak hesaplanıyor
(`engine/tools/spec-diff.mjs` `touchedZones` + `untouchablePatterns`), girdisi
`contract/edit-locality-v1.json:zones` + motorun bastığı `pattern.pieces[].name`.
Ölçüldü: varsayılan 6 panelli elbisede **35 serbest bölge-panel çifti** (komut 6).

Yani: **çıpa vardır ama PANEL kadar kabadır.** "Şuraya" dendiğinde bugün
gösterilebilecek en küçük şey `Bodice Front`'un tamamıdır, yaka kenarı değil.

## 1. Katman 2 bileşen topolojisi NEREDE yaşıyor?

Üç aday da isim isim açıldı (komut 1). Hiçbiri zinciri taşımıyor:

| dosya | ne taşıyor | bileşen | panel | adlandırılmış kenar |
|---|---|---|---|---|
| `contract/primitives-v1.json:bilesenler` | 7 bileşen → hangi PRİMİTİF türlerini kullandığı (`["panel","op.suppress","seam"]`) + Türkçe açıklama | **7** (bodice, sleeve, skirt, collar, cuff, band, overlay) | **0** — hiçbir bileşen panel ADI saymıyor | **0** |
| `contract/composition.json:components` | 22 bileşen; alanları `id, specField, values, attachment, zOrder, conflictClass, evidence`. `attachment` SERBEST METİN ("shoulder seam + armhole (reshape / diagonal raglan seam)"), makine okumaz | **22** | **0** | **0** |
| `contract/garment-spec-v2.json:topology` | 7 eksen × kapalı enum → `requires:[operatör]`. 15 operatör (7 shipped, 1 flagged, 5 absent... tam liste komut 1'de). Panel adı yalnız `proof` serbest metninde geçiyor ("ftorso/btorso panels") | 15 operatör | **0 yapısal** | **0** |

`contract/primitives-v1.json:primitifler.edge.parametreler.label` bir kenar
etiketi ALANI TANIMLIYOR ("id — FreeSewing makro id'si gibi; geri-alınabilir
editlemenin dayanağı"), ama **bu alanı dolduran hiçbir üretici yok** (madde 2).
Şemada var, veride yok.

## 2. Motorun ürettiği artefakt adlandırılmış kenar taşıyor mu? — HAYIR (kendim ölçtüm)

Komut: `node /tmp/v6c/dump.mjs` → `spec-diff.mjs draft()` →
`engine/dist/stitchu-engine.js draftJSON()`.

```
top-level pattern keys: garment, fabricAdviceKey, fabricMeters140, guideSteps, guideRefs, rehber, pieces
piece count: 6
piece keys union: closure, commands, cutInstruction, cutLine, foldLine, grainline,
                  markings, name, notches, onFold, seamAllowance
  Bodice Front | cmds=8 | markings=3 | notches=4
  Bodice Back  | cmds=8 | markings=3 | notches=46
  Bias binding (neckline) | cmds=5 | markings=2 | notches=0
  Skirt Front  | cmds=7 | markings=6 | notches=2
  Skirt Back   | cmds=7 | markings=6 | notches=22
  Sleeve       | cmds=7 | markings=4 | notches=0
"edgeLabel"/"edges"/"label"/"seam"/"seams"/"seamGraph"/"stitch"/"conn" occurrences: 0 (hepsi)
```

88 spec'lik tarama (komut 5, tüm eksenler tek tek gezildi):
**62 ayrı panel adı · adlandırılmış-kenar alanı 0 · dikiş/graf alanı 0.**

Kaynak seviyesinde de doğrulandı (komut 2) — `engine/src/geometry.hpp:40`
`struct PatternPiece`: `name, cutInstruction, commands, markings, cutLine,
notches, closure, hasGrainline, grainline, seamAllowance, onFold, foldLine`.
Panelin ADI var, kenarının adı yok.

`notches` bir dikiş grafiği DEĞİL: `{"type":"move","x":249.75,"y":79.2}` —
sadece çizgi komutu. Ne adı var, ne karşı panelin çentiğine işareti (komut 4).

→ **V5 bulgusu "artefakt dikiş grafiği taşımıyor (0/112)" DOĞRULANDI**, üstelik
farklı bir hattan: benim sayımım 88 spec × tüm paneller üstünde ve 0.

## 3. Repodaki çıpa/landmark sınıfı: `contract/figure-landmarks.json`

- **10 landmark**, tek düz sözlük — panel/kenar bağı yok.
- Durumları kendi dosyasında dürüstçe yazılı: **4 mevcut** (`neckBase` 40.0/0.0,
  `shoulderTip` 68.3/9.0, `underarm` 84.0/112.0, `waist` 55.2/179.2 — `bustLine`
  sadece y), **1 oran-kalibre** (`bustApex`), **1 hedef** (`hip`, y=null),
  **3 eksik/ÖLÇÜLMEDİ** (`underbust`, `highHip`, `crotch`).
- **ELLE YAZILMIŞ.** `GENERATED` başlığı YOK; `_ROL` alanı kaynağını kendisi
  söylüyor: "buildHalf figürel dress dalı formüllerinden HESAP
  (`_engine-full.mjs:40-95`)". Üreteç grep'i (komut 7): repoda bu dosyayı
  okuyan ya da yazan **0 satır kod**. Tek anışı `ROADMAP.md:324` ve o da
  "motor çıktısı, kanıt değil" diye işaretliyor.
- **Koordinat sistemi YANLIŞ motorda:** birim "flat px (S=5.6), EU36",
  kaynağı `engine/flat-engine/_engine-full.mjs` — yani **vitrin/flat çizim**
  motoru. Kalıp motoru (`stitchu-engine.js`, mm) başka bir uzayda çiziyor.
  İki uzay arasında yayınlanmış bir dönüşüm YOK; dosyanın kendisi de bunu
  itiraf ediyor ("template↔flat dikey ölçek tutarsız, uydurma dönüşüm yasak").
- Sonuç: figure-landmarks bugün **ölü bir kontrat** — tüketicisi yok, ölçeği
  kalıp artefaktına oturmuyor.

Sözü geçen ikinci çıpa sınıfı `contract/edit-locality-v1.json`: **9 adlandırılmış
bölge + `global`**, 41 alan bölgeye bağlı (`fieldZones`). Bölgenin tanımı
GEOMETRİ değil, **panel adı üstünde çalışan RegExp listesi** (`untouchable`).
Yani bölge = "hangi paneller dokunulmaz", "kalıbın neresi" değil.

## 4. ÇIPA ADAYI TABLOSU (her adayın yanında kaynak; kaynaksız yazılmadı)

### KATMAN A — bugün ÜRETİLEN ve geometrisi OLAN çıpalar (panel granülaritesi)

| çıpa | kaynak dosya:anahtar | hangi bileşenden doğuyor | geometrisi var mı |
|---|---|---|---|
| 62 panel adı (`Bodice Front`, `Skirt Back`, `Sleeve`, `Peter Pan Collar (bebe yaka)`, `Pocket Bag (yan dikiş cebi)`, … tam liste log komut 5) | MOTOR ARTEFAKTI `pattern.pieces[].name` (88 spec taramasıyla ölçüldü) | bodice/sleeve/skirt/collar/cuff/band/overlay — `primitives-v1.json:bilesenler` | **EVET** — `commands` + `cutLine` |
| 9 bölge (`neckZone` `shoulderZone` `sleeveZone` `waistZone` `hemZone` `cfZone` `backZone` `sideSeamZone` `surface`) | `contract/edit-locality-v1.json:zones` | `composition.json` `conflictClass` (dosya bunu kendi `_bolge_kaynagi` alanında ilan ediyor) | **HAYIR** — sadece panel-adı RegExp'i |
| 35 bölge×panel çifti (varsayılan 6 panelli elbisede) | `spec-diff.mjs untouchablePatterns()` × ölçülen panel adları | yukarıdaki ikisinin kesişimi | **EVET, panel kadar kaba** |

### KATMAN B — ADI türetilebilen ama YERİ türetilemeyen çıpalar

**27 tekil konum jetonu**, hepsi kaynaklı (komut 6 tam listeyi ve her jetonun
kaç kaynaktan geldiğini basıyor):

- 8 ← `contract/primitives-v1.json:primitifler.op.extend.parametreler.fromLandmark`
  = nape, shoulder, bust, waist, hip, knee, wrist, hem
- 8 ← `…op.attach.parametreler.position`
  = neck, waist, wrist, hem, shoulder, centerFront, centerBack, sideSeam
- 6 ← `…op.overlay.parametreler.region` = cap, yoke, front, back, hem, neck
- 10 ← `contract/figure-landmarks.json:landmarks.*`
- 9 ← `contract/edit-locality-v1.json:zones.*`

Bunların **hiçbiri bir panelin bir kenarına bağlı değil.** `waist` jetonunun 4
ayrı kaynağı var ama hiçbiri "Bodice Front'un 5. kenarı bel kenarıdır" demiyor.

### ★ KROSS-ÇARPIM BİR MENÜDÜR — ÜRETİM DEĞİL (kartın yasağının sayısı)

"taraf × jeton" naif üretimini bilerek koşturdum (komut 6):
**2 taraf × 27 jeton = 54 aday.** İçinden çıkanlar: `frontCenterback`,
`backCenterfront`, `frontBack`, `backFront`, `frontCrotch`, `backCrotch`,
`frontWrist`, `backSleeve`… Yani **en az 8'i kendi kendisiyle çelişiyor**,
onlarcası anlamsız. Bileşen→panel→kenar zinciri olmadan üretim, iki sözlüğün
çarpımına çöküyor — ki bu tam olarak V2'nin yasakladığı MENÜ.
**Bu 54'lük listeyi çıpa sözlüğü diye kimseye vermem.**

## 5. SERBEST KANALIN 26 TERİMİYLE KESİŞİM (komut 8)

Kaynak: `vision/eval/live-2026-08-22.json` `outOfVocab` (5 foto, 26 terim —
sayı bağımsız doğrulandı, aynı 26).

- **konum ibaresi TAŞIYAN: 15/26 (%57.7)** — 11'inde hiç konum sözcüğü yok
  ("metallic floral embroidery appliqué", "beaded tassel drops"…).
- **jeton sözlüğü konum ibaresinin TAMAMINI karşılayan: 12/26 (%46.2), konumlulara göre 12/15 (%80).**
- Karşılanmayan 3'ü tek bir eksikten: **`empire` ve `dropped` jetonu YOK.**
  - `empire seam lace trim band` → KARŞILANMAZ (`empire` jeton YOK)
  - `beaded empire waist sash` → KISMİ (`waist` var, `empire` yok)
  - `dropped waist` → KISMİ (`waist` var, `dropped` yok)
  - İkisi de bir landmark+ofset işi: `empire` ⇒ `figure-landmarks:landmarks.underbust`,
    ama o landmark **`durum: "eksik"`, y=null, ÖLÇÜLMEDİ**. Yani sözlük eksiği
    değil, **ÖLÇÜM eksiği** — figure-landmarks kendi içinde bunu zaten yazmış:
    "empire dikişin evi… landmark kurulunca empire=underbust'a bağlanır".

★ Bu %80'e ALDANMAYIN: kesişim **JETON** seviyesinde tutuyor, ÇIPA seviyesinde
değil. "front hip welt pockets" için `front` ve `hip` jetonlarının ikisi de
kaynaklı — ama motorda `Skirt Front`'un kalça hizasındaki kenar/nokta YOK, o
yüzden cebin nereye dikileceği hâlâ söylenemiyor.

## ÜRETİLEBİLİRLİK HÜKMÜ — sebebiyle

**HAYIR (kenar/nokta çıpası).** Üretecin girdisi mevcut değil. Eksik olan tek
şey: **panelin kenarlarının kimliği.** Bugün `commands` bir poligon/eğri
dizisidir; hangi komutun "yaka oyuğu", hangisinin "yan dikiş" olduğunu söyleyen
alan `primitives-v1.json:primitifler.edge.parametreler.label` olarak TANIMLI ama
`PatternPiece`'te (`engine/src/geometry.hpp:40-73`) KARŞILIĞI YOK ve artefaktta
0 kez geçiyor.

**EVET (panel çıpası), ama zaten üretiliyor** — `spec-diff.mjs` bölge-panel
hükmünü bugün basıyor, 35 çift ölçüldü. Yani "üreteç yazılacak" işi panel
seviyesinde YENİ İŞ DEĞİL; yeni iş sadece kenar seviyesinde ve önce
`edge.label`'ın motorda doğması gerekiyor.

**Sıradaki kartın kapısı (üreteç kartı yazılacaksa) bu olmalı:** üreteç değil,
`PatternPiece`'e kenar kimliği. O olmadan yazılacak her çıpa sözlüğü elle
yazılmış menüdür.

---

## KART DIŞI FARK EDİLENLER (dokunulmadı)

1. `contract/figure-landmarks.json` **ölü kontrat**: repoda okuyan/yazan 0 satır
   kod. Ayrıca ölçeği ölü 2B flat vitrin motorunun (`_engine-full.mjs`) — kalıp
   motoruna bağlanmamış. RULES md.7 anlamında bir OPEN SUSPICION.
2. `primitives-v1.json` `edge.label` alanı şemada var, üreticisi yok →
   "belgelenmiş garanti kodda zorlanmıyorsa YOKTUR" (RULES md.1) durumu.
3. `composition.json:components[].attachment` serbest metin. Kenar çıpası
   üretecinin en doğal girdisi burası olurdu ("shoulder seam + armhole"), ama
   makine okunur değil — 22 satırlık bir yapılandırma işi.
4. `garment-spec-v2.json` operatör sicili: **15 operatörün 5'i `absent`**
   (sleeve, collarFamily, skirtFamily, zipperPiece, gatheredOverlayLayer), 1'i
   `flagged` (shoulderSeam). Buna rağmen `stitchu-engine.js` (web/wasm hattı)
   kol, yaka, manşet, pileli etek PANELİ BASIYOR (88 spec taramasında
   `Puff Sleeve`, `Peter Pan Collar`, `Ribbed Cuff`, `Skirt 6-gore Panel` çıktı).
   **İki hat farklı şeyler söylüyor**: v2 sicili YÜZEY motorunu (surfacepattern.cpp)
   anlatıyor, artefaktı basan ise ESKİ hat. Bu kartın işi değil ama bir çelişki,
   ve çıpa üreteci hangi hattın panellerine bağlanacağını bilmeden yazılamaz.
5. `contract/spec-grammar.json` kendi başında `_OLU_2B_HATTI` damgası taşıyor
   ("BU DOSYA HÜKÜM TAŞIMAZ", 2026-08-17) — kartın girdi listesinde vardı ama
   kendi ilanına göre hükümsüz; bu rapordaki hiçbir sayı ondan türetilmedi.
6. `contract/terms.json` 52 terim taşıyor; serbest kanalın 26 terimi bu sicilde
   aranıyor (`foto-spec-olcum.mjs:81-89`) ama terms.json'da konum alanı YOK —
   yani çıpa için kaynak değil.

## GÖREMEDİKLERİM / ERİŞEMEDİKLERİM

- `patterns_real/` (kart yasağı) — orada `seamgraph.json` ve `trace-match.py`
  var (CLAUDE.md diyor). Gerçek Buğra kalıbından çıkarılmış kenar/landmark
  isimleri **orada olabilir**; **DOĞRULANMADI, açmadım.**
- `surfacepattern.cpp` yüzey hattının kendi çıktısı (h3b/walk paketleri) —
  bu turda üretilmedi; adlandırılmış kenar taşıyıp taşımadığı **DOĞRULANMADI**.
  Ölçtüğüm artefakt `engine/dist/stitchu-engine.js` (web/wasm) hattınındır.
- Görsel artefakt (PNG) üretilmedi: bu kart teşhis kartı, RULES md.3'ün
  render adımını gerektiren bir özellik iddiası yok.
