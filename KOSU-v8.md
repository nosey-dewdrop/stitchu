# KOŞU v8 — SON KOŞU

Hedef cümlesi, tek satır, hiçbir fazda değişmez.

> **Fotoğraf + prompt → kalıp + flat.**

Bu koşunun bitiş şartı bir ölçüm değil. Bitiş şartı şu: bir yabancı siteye girer, fotoğrafını atar, kumaşını seçer, kalıbını + flat'ini + rehberini indirir, diker, giyer. "Al dene" diyebildiğin gün koşu bitmiştir.

---

## KİM İÇİN, VE NEREDE ÇÖKÜYOR

Üç kullanıcı var ve ihtiyaçları farklı. Her fazın kabul testi bunlardan birine bakar.

| kim | ne istiyor | çöktüğü yer |
|---|---|---|
| **Dikiş bilen ev kullanıcısı** | kendine uyan, dikilebilir kalıp + net talimat | bedenini yanlış seçer, yazıcı ölçeği kaydırır, dikiş payı belirsizdir |
| **Etsy kalıp satıcısı** | satabileceği paket: katmanlı PDF, beden serisi, temiz flat | tek beden işe yaramaz, flat'i vitrine koyamaz |
| **Indie marka** | üretime giden dosya: DXF, tech pack, beden serisi | DXF katmanı eksikse fabrika okumaz |

**Kullanıcı yolculuğu ve bilinen ölüm noktaları.** Her adımın yanında onu koruyan faz var. Fazı olmayan adım, bugün ölü.

```
1  siteye girer, ne olduğunu anlar                     H14
2  fotoğrafını atar                                    H7
3  arkası görünmüyor, sistem uydurur ve söyler         H8
4  kumaşını seçer                                      H6
5  bedenini seçer / ölçüsünü girer          ← ÖLÜ      H11
6  kalıbını + flat'ini görür                           H2 H3 H4 H5
7  "yakayı biraz derinleştir" der                      H9
8  indirir (PDF A4/A0, DXF, flat SVG)                  H14
9  yazdırır, ölçek doğru mu                 ← ÖLÜ      H11
10 keser, dikiş payı dahil mi                ← ÖLÜ      H11
11 diker                                                H13
12 giyer, oluyor mu                          ← ÖLÜ      H12
13 olmadı, ne yapacak                        ← ÖLÜ      H12 H13
14 para öder                                 ← ÖLÜ      H14
```

**600 saatin cevabı bu tabloda.** Motor 1-8 arasını yazdı. 9-14 hiç yazılmadı. O yüzden hiçbir koşu "ürün oldu" diyemedi.

---

## 0. ORKESTRASYON

### 0.1 Roller

**Şef.** Tek bir Claude Code oturumu. Sıfır iş yapar. Disk taramaz, belge okumaz, kod yazmaz, ölçmez. Üç şey yapar: kart yapıştırır, ajan doğurur, hakem doğurur. Dördüncü bir şey yaparsa koşu bozulmuştur.

**Ajan.** Her faz için taze doğar. Sadece kendi kartını görür. Önceki fazların kartlarını, tartışmalarını, hakem raporlarını GÖRMEZ. Sadece kod tabanını ve kendi kartını görür. İşi biter, üç satır yazar, ölür.

**Hakem.** Her faz için ayrı doğar. Ajanın raporunu GÖRMEZ. Eline üç şey geçer: kart, `git diff`, ve kabul komutunun kendisi. Komutu kendi çalıştırır. Ajanın "geçti" demesi hiçbir şey ifade etmez.

**Damla.** Döngünün dışında. Tek aksiyonu şefin açılış bloğunu bir kez yapıştırmak, ve `GIRDI/` klasörünü doldurmak. Ajan Damla'ya soru soramaz.

### 0.2 Hakem üç cevaptan birini verir

```
GEÇTİ      — kabul komutu eşiği tutturdu, diff kartın izin verdiği dosyalarda kaldı
KALDI      — komut eşiği tutturmadı. Ajan yeniden doğar, AYNI kartla, hakemin
             ölçtüğü sayı kartın altına eklenir. En fazla iki kez.
KART YANLIŞ — kart yanlış şeyi ölçüyor, ya da eşik yanlış yerde. Hakem kartı
             yeniden yazar, gerekçesini bu dosyaya düşer, faz baştan koşar.
```

`KART YANLIŞ` Damla'nın eski yeridir. Artık hakemin. Hakem kartı yeniden yazarken **eşiği sadece zorlaştırabilir.** Kolaylaştırma yönünde tek bir değişiklik yapamaz. Kolaylaştırma gerekiyorsa koşu durur ve Damla'yı bekler. Bu, hakem+ajan ikilisinin insan yokken "geçti" üretmesini engelleyen tek kilit.

### 0.3 Birikimli hata

Her kart, kendinden önceki **tüm** fazların kabul komutlarını taşır. Hakem hepsini koşar. H7'nin hakemi H2'nin komutunu da çalıştırır. Biri kızarırsa koşu durur, sonraki faz açılmaz, ve kızaran fazın adı bu dosyaya yazılır.

### 0.4 Kart formatı

Şef her fazı bu dört satırla açar. Beşinci satır yok.

```
KULLANICI CÜMLESİ : <bir cümle, kullanıcının ağzından, audit başlığı değil>
KABUL KOMUTU      : <tek satır, kopyala-yapıştır çalışır>
EŞİK              : <bir sayı>
DOKUNULABİLİR     : <dosya listesi. dışına çıkmak KART YANLIŞ değil, KALDI'dır>
```

### 0.5 Ajan raporu

Üç satır. Dördüncü satır yok.

```
NE DEĞİŞTİ  : dosya:satır
KOMUT ÇIKTISI: <yapıştır>
YAPILAMAYAN : <varsa, adıyla>
```

### 0.6 Kayıt

Tek dosya, bu dosya. Faz başına bir blok. GECE7 gibi 98 dosya yok. Blok formatı:

```
## H<n> — <ad> — <GEÇTİ|KALDI×n|KART YANLIŞ>
ölçülen: <sayı>   eşik: <sayı>   commit: <sha>
hakem notu: <tek cümle>
```

### 0.7 Değişmeyen kurallar

- **Main.** Branch yok. Her faz maine commit.
- **Ölçmeden iddia yok.** Kod hakkında "çalışıyor" demeden önce çalıştır.
- **Uydurma sayı yok.** Kaynağı olmayan sayı koda giremez. Kaynak yoksa en kısıtlayıcı değer seçilir ve "uydurma" etiketiyle ilan edilir.
- **Sessiz default yok.** Motor bilmediği bir şeyi çizmez, adıyla reddeder.
- **Her reddin bir sonraki adımı vardır.** "Bu yakayı çizemiyorum" tek başına
  kabul edilmez. Yanında ya çizebildiği en yakın şey, ya da kullanıcının
  yapabileceği bir aksiyon olmak zorunda. Çıkmaz sokak bir hatadır.
- **Kullanıcının fotoğrafı üçüncü tarafa gidiyorsa bu ekranda yazar.** Fotoğraf
  `backend/worker.js` üzerinden Anthropic API'ye gidiyor. Sessiz kalmak yasak.

---

## H0 · GİRDİ MASASI

**Damla kararlarını verdi. Bu fazı ŞEF koşar, Damla değil.**

### Damla'nın kararları (verildi, tartışılmaz)

```
ESTETİK HEDEF   : 70's. Biba / Ossie Clark ailesi. Dar A-line, empire,
                  akışkan uzun kol, minimal parça.
ARKA YÜZ KARARI : Arka fotoğraf yoksa UYDUR ve uydurduğunu İLAN ET.
                  Asla dekolte, asla süs, asla asimetri.
                  En sade dikilebilir arka: düz sırt, boyun ön yakanın
                  aynası, geçmiyorsa fermuar. Etiket: uydurma.
BUĞRA REFERANSI : patterns_real/Locket Top, EU38, Back Body parçası.
                  Ölçümü contract/flat-convention-v1.json içinde zaten var
                  (sideSeamProfile, 196.13/204.94 = 0.9570).
BRANCH          : yok. main.
```

### Şefin dolduracağı

```
GIRDI/
  hedef-fotograflar/   15-20 referans fotoğraf. Biba, Ossie Clark,
                       Laura Ashley, Mary Quant geçiş dönemi.
                       ⚠ SADECE iç değerlendirme. Telifli. Siteye
                       basılmaz, repoya commit edilmez, .gitignore.
                       Varsa arka görünüş aynı isimle -arka son ekiyle.

  kumaslar.md          70's ailesinin kumaşları. En az 5:
                       crepe · jarse · viskon · pamuklu lawn · kadife
                       Her satır: isim | streç% | recovery% | ağırlık g/m²
                       | bending length mm | en cm | KAYNAK
                       Streç/recovery ASTM D2594 (örme) veya D3107
                       (dokuma) bandından. Kaynağı olmayan sayı yazılmaz,
                       "ÖLÇÜLMEDİ" yazılır.

  bugra/README.md      Yukarıdaki Buğra referansı tek paragraf olarak.

  iyi-flat/            ⚠ TEK BEKLEYEN İŞ. Şef 15 aday flat toplar,
                       tek bir HTML sayfasında yan yana dizer
                       (GIRDI/iyi-flat/secim.html), her birine bir
                       checkbox koyar. Damla beşini işaretler, sayfa
                       secim.json yazar. Damla'nın tek işi bakmak.
                       Yazı yok, form yok, açıklama yok.
```

### Şef bu fazı ne zaman koşar

H1 · H2 · H3 bittikten sonra. O üçü `GIRDI/` olmadan koşar. H4 `iyi-flat/secim.json` olmadan başlayamaz, çünkü manken çizelgesinin kaynağı o dosya.

`secim.json` yoksa şef H4'ü atlamaz, **durur.** Uydurma bir manken çizelgesiyle devam etmek yasak (§0.7).

**Neden gerekli.** Bugün repodaki 19 fotoğraf müze mankeni ve gelinlik. Croquis bir Zoe Hong flat template ekran görüntüsünden piksel ölçülerek kurulmuş. Yan dikiş oranı satın alınmış Buğra kalıbından ölçülmüş. Yani sistemin bütün estetik zemini Damla'nın seçmediği kaynaklardan. "İyi flat görmedim" cümlesinin sayısal karşılığı yok, çünkü hedef yok. `iyi-flat/secim.json` o hedefin tek kaynağı olacak.

```
KABUL KOMUTU : ls GIRDI/hedef-fotograflar | wc -l && test -f GIRDI/kumaslar.md
               && test -f GIRDI/iyi-flat/secim.html && grep -c GIRDI .gitignore
EŞİK         : ≥ 15 fotoğraf · kumaslar.md ≥ 5 satır, her satır KAYNAK taşıyor
               · secim.html açılıyor · GIRDI .gitignore'da
DOKUNULABİLİR: GIRDI/, .gitignore
```

---

## H1 · "DEPO TEMİZ"

**Kullanıcı cümlesi.** Yeni gelen biri repoyu açtığında ne yaptığımızı anlıyor.

**Silinecek.** 1400 dosya, ~107MB.

| yol | dosya | boyut | neden |
|---|---|---|---|
| `GECE/` | 751 | 23M | v5 koşu arşivi, ürüne bağlı değil |
| `reports/gate/` | 264 | 7.8M | kapı çıktıları, yeniden üretilebilir |
| `docs/archive/` | 37 | 3.5M | arşiv |
| `web/collections/` + `collection-60s70s.html` | 72 | 2.4M | beğenmediğin flatlerin vitrini |
| `GECE7/` (`KARARLAR.md` hariç) | 97 | 2.5M | v7 koşu arşivi |
| `web/patches/` + `patches.html` | 62 | 1.1M | patch notes |
| `web/styles/` | 24 | 388K | ölü |
| `flatten-research/` `curve-research/` `vision-student/` `engine-check/` `mocks/` | 53 | 500K | araştırma kalıntısı |
| kök md: `DAMLA-KUYRUK` `HEDEF` `KOSU-v7` `GECE-KOSUSU-v6` `devlog` `linkedin` `ROADMAP` | 7 | 516K | bu dosya hepsinin yerini alıyor |

Kalacak md: `README ANAYASA RULES DERSLER ENV docs/ARCHITECTURE KOSU-v8`.

**Silinmeyecek, taşınacak.** `patterns_real/` (41 dosya, 65MB). Bu Buğra kör kontrolü, H10'un kabul girdisi. Public git'ten çıkacak, `.gitignore`'a girecek, yerelde duracak. Sadece dosya silmek yetmez, history rewrite gerekir:

```bash
git filter-repo --path patterns_real --invert-paths
```

**Ayrıca temizlenecek.** `web/sitemap.xml` ve `web/js/shared-header.js` nav'ı silinen sayfalara link veriyor.

```
KABUL KOMUTU : git ls-files | wc -l && git log --all --diff-filter=A --name-only | grep -c patterns_real
EŞİK         : ≤ 800  ve  0
DOKUNULABİLİR: repo geneli, engine/src ve web/js hariç
```

---

## H2 · "SEÇTİĞİM YAKAYI ÇİZİYOR"

**Kullanıcı cümlesi.** Yakayı derinleştirdiğimde hem kalıbım hem flat'im değişiyor.

**Teşhis.** Repoda iki motor var, ürün yanlış olanı kullanıyor.

```
engine/wasm/bindings.cpp:398   draftJSON(specObj, bodyObj)
                               → spec'in tamamını okur
                               → GarmentDrafter::draft → bodice/skirt/sleeve.cpp
                               → 2B FORMÜL hattı. create.html'in kalıbı bu.

engine/wasm/bindings.cpp:584   planJSON(size, neckDropMM)
engine/wasm/bindings.cpp:641   flatJSON(size, neckDropMM)
                               → buildSeamPlan → bodysurface → garmentshell
                                 → flatten → shellprojection
                               → 3B YÜZEY hattı. Sadece iki skaler alıyor.
```

Yüzey hattı derleniyor (`build-wasm.sh` `ENGINE_SRCS` içinde hepsi var) ama **spec oraya hiç ulaşmıyor.** Fotoğraf ve prompt yüzey hattına giremiyor. Araştırmanın omurgası olan parça, ürünün dışında duruyor.

**İş.**

1. `planJSONBinding` ve `flatJSONBinding` imzası `(std::string size, double neckDropMM)` yerine `(val specObj, val bodyObj)`.
2. `buildSeamPlan(size, SheathOptions)` çağrısı `SheathOptions`'ı `buildSpec(specObj)` çıktısından doldursun. Bugün sadece `frontNeckDropCoefCM` dolduruluyor, geri kalan alanlar sabit.
3. `SheathOptions` spec'in her ekseni için bir alan taşımıyorsa, taşımadığı ekseni **adıyla reddet.** Sessiz sabit bırakma. Reddedilen eksen listesi `flatJSON` çıktısında `desteklenmeyen_eksenler` dizisi olarak dönsün, kullanıcıya ekranda yazılsın.
4. `web/js/engine.js:95,101` çağrıları yeni imzaya.

**Neden birinci sırada.** H3'ten H14'e kadar her şey bu bağlantıya bağlı. Bu bağlanmadan yapılan her ölçüm yanlış motorun parçasını ölçer.

```
KABUL KOMUTU : node engine/tests/spec-reaches-surface.mjs
               (yazılacak: aynı bedende scoop ve vneck için flatJSON sha256'sı)
EŞİK         : 2 farklı hash. Ayrıca desteklenmeyen_eksenler dizisi boş olmayabilir
               ama her elemanı ekranda görünmek zorunda.
DOKUNULABİLİR: engine/wasm/bindings.cpp, engine/src/seamplan.{cpp,hpp},
               web/js/engine.js, engine/tests/
```

---

## H3 · "ELBİSEMİN FLAT'İ KALIBIMDAN ÇIKIYOR"

**Kullanıcı cümlesi.** Gördüğüm çizim, elimdeki kalıbın ta kendisi.

**Teşhis.** `web/lib/flat-from-plan.js:139`:

```js
if (garment === 'top' && shaping === 'dart' && fabric === 'woven') {
  return { garment: 'top', shaping: 'dart', fabric: 'woven' };
}
return null;
```

Yani "flat kalıptan projeksiyon" **tek bir spec üçlüsü için** doğru. Elbise, etek, örme, hepsi croquis kaleminden çıkıyor (`web/lib/flat-core.js`, 74KB, "the flat is spec-driven", `pieces` parametresi kullanılmıyor).

Üstelik o tek sınıfta bile `web/js/download.js:262`:

```js
const plan = await seamPlanFlat(sizeLabel, 0);
```

spec atılıyor, neckDrop sıfır sabit. Aynı bedende her top aynı flat'i alıyor.

v7'nin "0.0mm fark" kazanımı gerçek ama kapsamı bu. İki çıktı da aynı sabit sheath planından geldiği için sıfır çıkıyor.

**İş.**

1. `planLineClass` tamamen silinir. Her sınıf yüzey hattından.
2. `web/lib/flat-core.js` (74KB) ve `web/lib/flat-tables.gen.js` (77KB) silinir. Croquis kalemi ölür.
3. `flatSVG` / `flatSVGAsync` ikiliği biter, tek `flatSVG(spec, body)` kalır.
4. `flatGaps` anlamını yitirir, silinir. Yerine H2'nin `desteklenmeyen_eksenler` dizisi geçer.

```
KABUL KOMUTU : node engine/tests/flat_pattern_agree_check.mjs --all
EŞİK         : elbise + etek + top + örme, dördünde de bel/göğüs/kalça
               çizgisi farkı ≤ 0.1mm
DOKUNULABİLİR: web/lib/, web/js/download.js, engine/tests/
```

---

## H4 · "FLAT'İM MANKENDE, KALIBIM BENDE"

**Kullanıcı cümlesi.** Vitrindeki çizim ideal bir bedende, elimdeki kalıp benim bedenimde.

**Teşhis.** `contract/mannequin-chart-v1.json` manken-insan farkını **0.0mm** ilan etmiş. Gerekçe dosyada yazılı: "yayın bulunamadı, sıfırdan başka her değer uydurma olurdu."

Bu dürüst bir karar. Ama Damla'nın 4. maddesi taviz vermediği listede: *"flat ve paternların gösterdiği 36 beden farklı. patternınki tam dikilebilir. flat 36'sı ise daha ideal women body."*

Bugün croquis `waistX` 175mm = insan EU38 700/4. İki beden aynı.

**İş.** Yayın aramayı bırak. `GIRDI/iyi-flat/secim.json`'daki 5 flat'i ölç. Göğüs-bel-kalça yarı-genişliklerinin birbirine oranını çıkar. Bu bir yayın değil, **Damla'nın seçtiği hedef.** Kaynağı da bu: "stitchu manken çizelgesi v2, kaynak: Damla'nın seçtiği 5 referans flat, ölçüm dosyası GIRDI/iyi-flat/olcum.json, seçim GIRDI/iyi-flat/secim.json."

Sıfır fark uydurma değildi ama hedefe de götürmüyordu. Ölçülmüş bir hedef, kaynaksız bir sıfırdan iyidir.

**Ayrıca burada düzelt.** `contract/flat-convention-v1.json` içinde `shoulderTipX` bugün 70.1799u. Dosyanın kendi içinde yazan hikâye: eskiden 78.0u'ydu, ölçülerek yanlış bulundu, omuz ucu göğüs hattının dışındaydı, düzeltildi. Doğrulandı, kapalı. Ama düzeltmenin kaynağı yine Buğra kalıbı. H4 sonunda bu sayının kaynağı `GIRDI/iyi-flat/` olacak, Buğra sadece H10'da kör kontrol olarak kalacak.

```
KABUL KOMUTU : node engine/tests/manken_insan_ayrim_check.mjs
EŞİK         : EU38'de flat çevresi ile kalıp çevresi farkı > 0
               ve farkın kaynağı GIRDI/iyi-flat/olcum.json
DOKUNULABİLİR: contract/mannequin-chart-v1.json, contract/flat-convention-v1.json,
               engine/src/seamplan.cpp bedenlendirme bloğu, engine/tests/
```

---

## H5 · "PARÇA SAYIM GÖRSELDEKİ KADAR"

**Kullanıcı cümlesi.** Fotoğraftaki elbise üç parçaysa kalıbım da üç parça.

**Ölçülen durum.** Motor bugün şunu veriyor:

```
A-line elbise, kolsuz, scoop   → 5 parça
  Bodice Front · Bodice Back · Bias binding · Skirt Front · Skirt Back
top/dart/woven                 → 3 parça
elbise + düz kol               → 6 parça
```

A-line elbise 3 olmalı. Fazla parçanın kaynağı, yaka genişliğinden bağımsız koşulsuz eklenen arka bel fermuarı.

**Ama asıl iş sabit tablo değil.** Damla'nın 7. maddesi *"görselde ne kadarsa o kadar parçalı"* diyor. Yani parça sayısı bir sabit değil, yüzeyin developability'sinden çıkmalı.

**İş.**

1. Koşulsuz fermuar kalkar. Fermuar yalnızca yaka açıklığı baş çevresinden darsa eklenir.
2. Parça bölme kararı `flatten.cpp` distorsiyon ölçümüne bağlanır. Eşik aşılınca eskalasyon: **pens → prenses dikişi → ek panel.** Bu sırayla, atlamadan.
3. Eşik kumaşa bağlı (H6'nın girdisi). Tek evrensel yüzde yok, bu literatürde de yok. Kumaşın esneme profilinden türetilecek.
4. `op.split` / `op.suppress` / `op.rotate` (`panelsplit.cpp`, `dartsuppress.cpp`, `dartrotate.cpp`) bugün opt-in ve default kapalı. Bu üçü bu kararın motoru, açılacak.

```
KABUL KOMUTU : node engine/tests/parca_sayisi_check.mjs
EŞİK         : A-line kolsuz elbise = 3 · düz etek = 2 · kollu elbise = 4
               ve her parçanın varlık gerekçesi (distorsiyon mm) çıktıda
DOKUNULABİLİR: engine/src/{flatten,panelsplit,dartsuppress,dartrotate,garment}.cpp,
               engine/tests/
```

---

## H6 · "KUMAŞIMA GÖRE KALIP"

**Kullanıcı cümlesi.** Aynı elbiseyi jarseden seçince kalıbım daralıyor, dokumadan seçince değişmiyor.

**Durum.** Kumaş ekseni v7'de 2 değerden 7 attribute'a genişledi ve çalışıyor (`web/js/engine.js:171-184`). Ama içinde gerçek kumaş yok, ve negatif pay hesabı kalıba ne kadar yansıyor ölçülmedi.

**İş.**

1. `GIRDI/kumaslar.md`'deki 5 kumaş `contract/fabric-catalog-v1.json`'a girer. Uydurma kumaş silinir.
2. Negatif pay formülü: çevre = beden × (1 − k · streç%), k recovery%'den türer. ASTM D2594 (örme) / D3107 (dokuma) girdileri. Tek birleşik yayınlanmış tablo yok, bu yüzden formül kaynağıyla birlikte contract'a yazılır.
3. Bending rigidity → büzgü oranı ve kloş davranışı. FAST formülü: `Bending_Rigidity(µNm) = Weight(g/m²) × Bending_Length(mm)³ × 9.807e-6`.
4. Kumaş eni → kesim planı ve parça yönü. Dar ende bias kesim parça eğimi gerektirir.
5. **H5'in distorsiyon eşiği buradan beslenir.** Esnek kumaş pensi absorbe eder, dokuma etmez. Aynı elbise iki kumaşta farklı parça sayısı verebilir, bu doğru davranıştır.

```
KABUL KOMUTU : node engine/tests/kumas_kalip_check.mjs
EŞİK         : aynı spec, 5 kumaş → en az 3 farklı DXF hash
               ve %40 streçli kumaşta bel çevresi dokumadan ölçülebilir dar
DOKUNULABİLİR: contract/fabric-catalog-v1.json, engine/src/, web/js/fabric-catalog.js
```

---

## H7 · "FOTOĞRAFIMI OKUYOR"

**Kullanıcı cümlesi.** Attığım fotoğraftaki elbisenin oranları kalıbıma geçiyor.

**Teşhis.** `web/js/vision-bridge.js`, 42KB, 25 adet `pickX` fonksiyonu. Sabit enum sözlüğüne keyword eşleştirmesi. Damla'nın 9. maddesi tam bunu reddediyor: *"sözlüğü tekrardan bust kol heartneck gibi şeylerden yapmayalım. dikiş tarzıyla ilerleyelim."*

Ayrıca `:507` civarı: ölçülen oranlar güven eşiğinin altındaysa `seen.ratios = null` ve enum yolu sürüyor. Yani fotoğrafın sürekli oranları çoğu zaman kalıba hiç ulaşmıyor.

**İş.** NGL yaklaşımı. VLM'den ham parametre regresyonu isteme; doğal dilde semantik attribute iste, deterministik parser ile primitiflere map et.

1. 25 `pickX` gider. VLM çıktısı: garment type, length, neckline shape, sleeve structure, fit, flare, asymmetry + 7 sürekli oran.
2. Parser bunları Edge / Panel / Stitch primitiflerine map eder. Sabit isim menüsü yok.
3. `:507` ratio null'laması kalkar. Düşük güvende oran atılmaz, `belirsiz` etiketiyle taşınır ve kullanıcıya "bu oranı emin okuyamadım" diye gösterilir.
4. VLM yolu `backend/worker.js:17` üzerinden Claude API'ye gidiyor, zaten var. Anahtar `wrangler secret` ile girilir, repoda durmaz. Maliyet kontrolü `backend/guard.js` içinde, çalıştığı doğrulanır.

**Sözlük yerine primitif.** `contract/primitives-v1.json` zaten Edge/Panel/Stitch tanımlarını taşıyor ama `motorda_kapi` alanı çoğunda `null`. Bu fazın çıkışı, VLM'in ürettiği her attribute'un bir primitif kombinasyonuna oturması.

```
KABUL KOMUTU : node vision/eval.js --pool GIRDI/hedef-fotograflar --check-ratios
EŞİK         : 7 sürekli oranın 15 fotoğrafın en az 13'ünde uçtan uca kalıba
               ulaşması. Ulaşmayanlar "belirsiz" olarak ekranda görünmek zorunda.
DOKUNULABİLİR: web/js/vision-bridge.js, backend/worker.js, contract/primitives-v1.json,
               vision/
```

---

## H8 · "ARKAMI UYDURDU VE SÖYLEDİ"

**Kullanıcı cümlesi.** Sadece ön fotoğrafım vardı, arkayı kendi tasarlamış ve bunu bana söylemiş.

**Edge case, Damla'nın kendi cümlesi.** *"kafandan dekolte uydurma ama en optimal arka görüntüyü uydur, ama uydurduğunu söyle."*

**Altyapı zaten var.** `web/js/provenance.js:30-42` altı etiket taşıyor:

```
gorulen    fotoğrafta var, okundu
soruldu    kullanıcıya soruldu
cikarildi  fotoğrafta yok, kuraldan türetildi
zorunlu    dikilebilirlik gereği kondu
belirsiz   görüldü ama güvenle okunamadı
uydurma    ILAN_EDILEN listesinde
```

Bu etiketler var ama arka yüz akışına bağlı değil.

**İş.**

1. Arka fotoğraf varsa → arka spec `gorulen`.
2. Yoksa → **UYDUR** (H0 kararı). En sade dikilebilir arka: düz sırt, boyun ön yakanın aynası, geçmiyorsa fermuar. Etiket `uydurma`.
3. Kullanıcı isterse arkayı elle değiştirebilir, o zaman etiket `soruldu` olur. Ama SORMAK varsayılan değil, akış durmaz.
4. `uydurma` ve `belirsiz` etiketli her alan **ekranda ve indirilen dosyanın kökünde** görünür. `koken.damgala` bunu zaten yapıyor, arka yüz alanlarına da uygulanır.
5. Uydurulan arka asla dekolte, asla süs, asla asimetri. En kısıtlayıcı yorum.

```
KABUL KOMUTU : node engine/tests/arka_koken_check.mjs
EŞİK         : sadece-ön fotoğrafta arka alanların %100'ü uydurma|soruldu
               etiketli, ve etiketlerin %100'ü SVG kökünde
DOKUNULABİLİR: web/js/{provenance,vision-bridge,create}.js, engine/tests/
```

---

## H9 · "BURAYA FİYONK EKLE"

**Kullanıcı cümlesi.** Yakayı 2cm derinleştirdim, elbisenin geri kalanı hiç değişmedi.

**Altyapı var.** `engine/src/patternedit.cpp` 387 satır, anchor + arc-length mantığı içinde. `contract/edit-locality-v1.json` Damla'nın cümlesini yasa olarak yazmış: bir spec diff bir bölgeye dokunur, bölge dışındaki panel düzenlemeden sonra **bayt-aynı** kalmak zorunda.

Ama `RULES 4` gereği opt-in ve default kapalı: `editExtendMM == 0` ve `editAttach == 0` ise dosya hiç çalışmıyor.

**İş.**

1. Edit yolu açılır ve create.html'e bağlanır. Kullanıcı sonucu görür, "yakayı 2cm derinleştir" der, aynı sayfada değişir.
2. Piksel tahmini yok. Anchor + ratio. Kenarın %30-%70'i arasındaki kavis derinliğini Y'de kaydır tarzı.
3. `edit_locality_check` her düzenlemede koşar. Bölge dışı panel bayt-aynı değilse edit reddedilir.
4. Fiyonk / ek parça (`op.attach`) bu fazın ikinci yarısı. Yaka değiştirme, uzatma, kısaltma birinci yarısı.

```
KABUL KOMUTU : node engine/tests/edit_locality_check.mjs --all-zones
EŞİK         : 8 bölgenin 8'inde bölge dışı panel bayt-aynı
               ve en az 4 edit tipi create.html'den erişilebilir
DOKUNULABİLİR: engine/src/patternedit.cpp, engine/wasm/bindings.cpp,
               web/js/create.js, contract/edit-locality-v1.json
```

---

## H10 · "BUĞRA KONTROLÜ"

**Kullanıcı cümlesi.** Çizdirdiğim şey, satın aldığım gerçek kalıba benziyor.

**Damla'nın 12. maddesi.** *"gelişmelere rağmen bir şey çizdiğinde buğranın kalıbına yakın bir şey çıkıyor mu?"*

**Kural.** Buğra bir tune hedefi DEĞİL. Kör kontrol. Motor Buğra'ya benzemek için ayarlanmaz. H2-H9 bittikten sonra bir kez ölçülür ve sonuç ne çıkarsa yazılır.

**İş.**

1. `GIRDI/bugra/` içindeki referans kalıp, aynı spec ve aynı bedende motora çizdirilir.
2. Karşılaştırma: panel dış çevresi Chamfer mesafesi + parça sayısı + dikiş uzunlukları.
3. Bu ölçüm hiçbir sayıyı değiştirmez. Rapor.
4. Eğer fark büyükse, **hangi fazın kartı yanlıştı** sorusu sorulur. Buğra'ya yaklaşmak için sabit eklenmez.

```
KABUL KOMUTU : node engine/tools/bugra-blind-compare.mjs
EŞİK         : eşik YOK. Bu bir rapor fazı. Tek şart: sonuç bu dosyaya yazılır
               ve hiçbir contract sayısı bu ölçümden sonra değişmez.
DOKUNULABİLİR: engine/tools/ (sadece yeni dosya), KOSU-v8.md
```

---

## H11 · "BEDENİM DOĞRU, BASKIM DOĞRU, PAYIM BELLİ"

**Kullanıcı cümlesi.** Doğru bedeni seçtiğimi biliyorum, yazdırdığım kâğıt gerçek boyutta, ve dikiş payının dahil olup olmadığını okuyorum.

**Teşhis.** Bu üçü kalıbı giyilebilir yapan şey ve üçü de bugün açık.

**Beden.** `web/index.html` "8 sabit beden, EU34-48, yazdığın bir vücut değil" diyor. `draftJSON` ise 7 ölçü istiyor. İkisi aynı üründe. Kullanıcı EU bedenini bilmez ve ölçüyü yanlış alır. `web/js/measure.js` 21KB duruyor ve hiçbir akışa bağlı değil.

**Baskı.** PDF kalıplarının bir numaralı çöküş sebebi yazıcı ölçeğidir. Kullanıcı "Fit to Page" ile basar, kalıp %4 küçülür, 20 sayfayı yapıştırır, diker, olmaz. `web/lib/pdf-core.js` kalibrasyon karesi basıyor ama gerçek bir baskının ölçüldüğü kapı yok.

**Dikiş payı.** Dahil mi değil mi belirsizse giysi her dikişinden 1cm yanlış olur. Bu bir rehber cümlesi değil, kalıbın üstünde yazması gereken bir sayı.

**İş.**

1. **Beden akışı tek olur.** İkisinden biri seçilir ve ürün boyunca aynı kalır:
   - ya 8 sabit beden + "hangisi bana uyar" sihirbazı (3 ölçü sorar, beden önerir, farkı mm olarak söyler)
   - ya 7 ölçü + her ölçünün yanında "nereden nasıl ölçülür" görseli
   Melez akış yasak. Bugünkü çelişki bundan doğuyor.
2. **Beden serisi (grading).** `gradeJSON` motorda var, ürüne bağlı değil. Etsy satıcısı ve indie marka tek beden alamaz. Seçilen bedenin ±3 komşusu aynı pakete girer, katmanlı PDF'te ayrı katman olur.
3. **Baskı kapısı.** A4 PDF'in ilk sayfasında 100×100mm kare. Kullanıcı basar, cetvelle ölçer, siteye "ölçtüğüm kaç mm" yazar. 100 değilse sistem ölçek düzeltmesini kendisi hesaplar ve PDF'i yeniden üretir. "Fit to Page kapalı olsun" uyarısı yeterli değil, kimse okumuyor.
4. **Dikiş payı ilanı.** Her parçanın üstüne basılır: `DİKİŞ PAYI DAHİL · 1.0 cm` ya da `DİKİŞ PAYI DAHİL DEĞİL`. Kapak sayfasında da tekrar. DXF tarafında L14 sew line ve L1 cut line ayrı katman, bu zaten standart.
5. **Kesim planı.** Kaç metre kumaş, hangi ende, nasıl yerleşiyor. Kullanıcı kumaşı almadan önce görmek zorunda.

```
KABUL KOMUTU : node engine/tests/beden_baski_pay_check.mjs
EŞİK         : beden akışı tek (çelişkili metin = 0) · her PDF'te 100mm
               kalibrasyon karesi ve ölçek düzeltme yolu · her parçada
               dikiş payı ilanı · seçilen bedenin ±3 komşusu pakette
DOKUNULABİLİR: web/js/measure.js, web/lib/pdf-core.js, web/js/engine.js,
               web/js/print.js, engine/tests/
```

---

## H12 · "DİKTİM VE GİYDİM"

**Kullanıcı cümlesi.** Bu kalıptan bir elbise diktim, giydim, oldu.

**Bu koşunun tek gerçek kabul testi.** Diğer on üç fazın hepsi bunun önkoşulu.

600 saat ve 1200 commit boyunca hiçbir koşuda çıktı dikilmedi. Kapılar yeşil yandı, kalıp kâğıda basılmadı, kumaş kesilmedi. "Ölçtük" bir faz çıktısı değildir kuralının en pahalı ihlali bu.

**İş.**

1. `GIRDI/hedef-fotograflar/` içinden bir tanesi seçilir. 70's A-line mini, en sade olan.
2. Zincir uçtan uca koşar: fotoğraf → spec → kalıp → A4 PDF → baskı.
3. Ucuz kumaştan **toile** (prova) dikilir. Damla diktirecek.
4. Ölçülen: omuz oturuyor mu, kol evi sıkıyor mu, bel doğru yerde mi, kapanıyor mu, parça sayısı kâğıtta yazanla aynı mı.
5. Sonuç bu dosyaya yazılır. **Hiçbir sayı bu ölçümden sonra "yaklaştırmak için" değiştirilmez.** Bir şey tutmuyorsa hangi fazın kartı yanlıştı sorulur, o faz yeniden koşar.
6. Toile tutmayan her nokta için bir düzeltme talimatı üretilir ve bu H13'ün rehberine girer. Gerçek dikişte hiçbir kalıp ilk seferde tutmaz, bunu gizlemek değil söylemek gerekir.

**Kural.** H14 (vitrin ve satış) bu faz geçmeden koşamaz. Dikilmemiş bir kalıbı satmaya çalışmak, 600 saatin tekrarıdır.

```
KABUL KOMUTU : eşik YOK, bu bir gerçeklik fazı.
               Tek şart: GIRDI/toile/ içinde dikilmiş giysinin fotoğrafı
               ve olcum.md dosyası var, ve KOSU-v8.md'ye sonuç yazılmış.
EŞİK         : toile dikildi = evet/hayır. Hayırsa koşu durur.
DOKUNULABİLİR: KOSU-v8.md, GIRDI/toile/
```

---

## H13 · "NASIL DİKECEĞİMİ BİLİYORUM"

**Kullanıcı cümlesi.** Kalıbın yanında bu kumaşla nasıl dikeceğimi anlatan bir rehber geldi.

**Damla'nın 10. maddesi.** *"sadece prompt + fotoğraf karşılığında insanlar kalıp ve flat alıp gitmeyecekler. rehber, püf noktalar vs de bulunacak."*

**Durum.** `web/js/guide-tr.js` 24KB var, rehber sayılardan üretiliyor ve v7'de sıfır kayıtsız cümle ile geçti. Ama içerik ince: dikiş payı ve inşa sırası var, kumaşa özel yok.

**İş.** Rehber H6'nın kumaş verisinden beslenir. Her rehber şunları taşır:

- Dikiş payı, parça bazında, mm
- İnşa sırası, numaralı
- Bu kumaş için iğne tipi (jarse → ballpoint, dokuma → universal, kalınlığa göre numara)
- Bu kumaş için dikiş tipi (esnek → overlok/reçme, dokuma → düz + temizleme)
- Kesim planı, kumaş enine göre, kaç metre
- Bu giysinin bu kumaştaki üç zor noktası, ölçülen sayıyla
- H12'de toile'de tutmayan noktaların düzeltme talimatı

**Kural.** Rehberdeki her cümle bir sayıdan türeyecek. Kaynağı olmayan tavsiye yazılmayacak. "Dikkatli olun" cümlesi rehberde yer almaz.

```
KABUL KOMUTU : node engine/tests/rehber_kaynak_check.mjs
EŞİK         : rehberdeki kayıtsız (sayıdan türemeyen) cümle sayısı = 0
               ve 5 kumaşın 5'i için farklı iğne/dikiş tavsiyesi
DOKUNULABİLİR: web/js/guide-tr.js, contract/guide-sources.json
```

---

## H14 · "VİTRİN GERÇEĞİ SÖYLÜYOR, VE PARA ALIYOR"

**Kullanıcı cümlesi.** Siteye giren biri ne alacağını anlıyor ve alıyor.

**Bayat veri.** `web/index.html` bugün şunu yazıyor:

> "the flat engine and the pattern kernel are not joined yet, so the create page draws the pattern and the flat comes from the workbench"

H3'ten sonra bu cümle yanlış olacak. Ayrıca:

- "10 pieces · A-LINE DRESS" yazıyor, motor 5 veriyor, H5'ten sonra 3 verecek
- "Fixed sizes, not a body you type in" yazıyor ama `draftJSON` 7 ölçü istiyor

**İş.**

1. Landing'deki her sayı motordan üretilir. Elle yazılmış sayı sıfır. Build adımı sayıları motora sorup HTML'e basar.
2. Ana ekran tek akış: fotoğraf at → kumaş seç → beden seç → kalıp + flat + rehber indir. Şu an 14 üst seviye HTML var, çoğu bu akışın dışında.
3. `atolye.html` (164KB), `showcase.html` (80KB), `benchmark.html`, `signature.html`, `al-dene.html` — hangisi ana akışa hizmet ediyor, hangisi bir koşunun kalıntısı, ayrılır. Kalıntı gider.

**Ürün paketi.** Alıcı ne indiriyor, tek listede:

```
kalip-A4.pdf          katmanlı, beden serisi ayrı katman, 100mm kalibrasyon karesi
kalip-A0.pdf          copyshop
kalip.dxf             ASTM D6673 katmanları: L1 kesim · L4 çıt · L7 kumaş suyu
                      · L8 iç çizgi · L14 dikiş çizgisi · L15 parça adı/beden/adet
flat.svg              ön + arka, ISO 128-2 4:2:1 çizgi hiyerarşisi
rehber.pdf            H13
kesim-plani.pdf       kumaş eni + metraj
```

**Konumlandırma**, rakip boşluğundan ölçülmüş:

> Fotoğraf + prompt → **gerçek dikilebilir kalıp** + DXF + katmanlı PDF, tarayıcıda.

Kimse bu üçlüyü birden vermiyor. Adstronaut ve Techpacker sadece flat + BOM veriyor, kalıp vermiyor, tech pack başına $3-7. Style3D kalıp veriyor ama bulut, $99-299/ay, ve kalıp uzmanlığı gerektiriyor. Freelance teknik tasarımcı stil başına $150-500, 3-7 gün.

Kanal: Instagram + LinkedIn, kişisel marka üstünden. Hedef kitle: indie markalar, Etsy kalıp satıcıları, moda öğrencileri.

**Para.** İki model, tek koşul: H12 geçmiş olacak.

| model | ne satılıyor | not |
|---|---|---|
| B2C dijital | yukarıdaki paket | tek seferlik satın alma. İade koşulu yazılı olmak zorunda |
| B2B fiziksel | aynı kalıptan dikilmiş giysi | ayrı akış, ayrı fiyat |

Ödeme akışı bugün yok. Bu fazda en basit hali kurulur: satın al → indir. Üyelik, forum, iOS bu koşunun dışında, sonraki iş.

**Hukuk, üç madde, hepsi yazılı olacak.**

1. **Fotoğraf nereye gidiyor.** Kullanıcının fotoğrafı `backend/worker.js` üzerinden Anthropic API'ye gidiyor. Gizlilik sayfasında ve yükleme ekranında yazacak. "Cihazında kalıyor" demek yanlış, motor cihazda ama görü değil.
2. **Kullanıcı telifi.** Biri bir markanın elbisesinin fotoğrafını atıp kalıp alabilir. Kendine dikmek için sorun değil. Çoğaltıp satmak alıcının sorumluluğu ve bu şartlarda yazacak. B2B fiziksel satışta bu risk Damla'da, o yüzden fiziksel satılan her model kendi tasarımı olacak.
3. **İade.** Dijital ürün, indirildikten sonra iade koşulu ne, yazılı.

**Pazarlamanın tek koşulu.** H12 (diktim ve giydim) geçmeden hiçbir pazarlama cümlesi yazılmaz. Bugünkü landing'in yalan söylemesinin sebebi bu sıranın tersine işlemiş olması.

```
KABUL KOMUTU : node engine/tests/vitrin_gercek_check.mjs
EŞİK         : elle yazılmış sayı = 0 · ölü link = 0 ·
               ana akış tek sayfada tamamlanıyor
DOKUNULABİLİR: web/index.html, web/create.html, web/js/landing.js, scripts/
```

---

## SIRA VE BAĞIMLILIK

```
H1  Depo temiz                → bağımsız, ilk, context ekonomisi
H2  Tek motor                 → H3..H14'ün tamamının önkoşulu
H3  Flat kalıptan             → H2
H0  Girdi masası (ŞEF koşar)  → H1..H3'ten sonra
H4  Manken/insan ayrımı       → H3 + H0/secim.json  ⛔ secim.json yoksa DUR
H5  Parça sayısı              → H2, H6 ile karşılıklı
H6  Kumaş → kalıp             → H5 ile karşılıklı, H0
H7  Fotoğraf okuma            → H2, H0
H8  Arka yüz (uydur + ilan)   → H7
H9  Bölgesel edit             → H3, H5
H10 Buğra kör kontrol         → H2..H9
H11 Beden · baskı · dikiş payı→ H5, H6. İnsanın giyebilmesi buradan geçiyor
H12 DİKTİM VE GİYDİM          → H11. ⛔ Bu geçmeden H14 koşamaz
H13 Rehber                    → H6, H12
H14 Vitrin · paket · para     → H12 ve H13
```

H5 ve H6 karşılıklı bağlı. H5'in distorsiyon eşiği H6'nın kumaş verisinden gelir, H6'nın parça bölme sonucu H5'in çıktısıdır. İkili döngü: H5a (eşik altyapısı) → H6 (kumaş verisi) → H5b (eşik bağlanır).

**İki sert durak var.** H4'te `secim.json` yoksa koşu durur. H12'de toile dikilmediyse koşu durur. İkisi de Damla'yı bekler ve ikisi de kısa iş.

**H10 ve H12 farkı.** H10 Buğra'ya benziyor mu diye bakar, n=1, rapor. H12 giyilebiliyor mu diye bakar, gerçek. Benzemek hedef değil, giyilmek hedef.

---

## KOŞU KAYDI

Fazlar bittikçe buraya yazılır.

```
## H1 — Depo temiz — <durum>
ölçülen:   eşik:   commit:
hakem notu:
```
