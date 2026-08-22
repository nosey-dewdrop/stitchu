# GECE KOŞUSU — stitchu · TEK DOSYA

Bu dosya bir oturum brief'i **değil**, bir **koşu protokolüdür**.
Baştan sona tek context'te okunmaz. Her faz kendi context'inde açılır, kendi
kapısından geçer, kapanır.

> **Bu dosyayı okuyan ilk ajana:** §0, §1, §2'yi oku. Sonra §4'ü (F0 sicili) oku.
> Sonra **sadece sana verilen fazın** §5'teki bölümünü oku. Diğer fazları açma.

---

# §0 — DEĞİŞMEZLER

1. **Otorite sırası:** `HEDEF.md` > `ANAYASA.md` > `RULES.md` > diğer her şey.
   Çelişki tek karar commit'iyle kapanır, çelişen satır **silinir**. İki doğru bırakılmaz.
   Arşiv dosyaları (`reports/`, `Logs/`, `NABIZ.md`, eski `DEVAM-*`) **otorite değildir**
   ve iş sırası dayatamaz. Bir cümleyi bir otorite dosyasına atfetmeden önce
   `grep` ile o dosyada olduğunu doğrula. (F0'da bu bir kez yanlış yapıldı, §4.7.)

2. **Kanıt = dosya yolu.** "Baktım", "doğru görünüyor", "çalışıyor" yasak.
   Bir adım ancak ürettiği dosyanın yolu raporda geçiyorsa yapılmıştır.

3. **Sessiz ikame yasak.** İstenen değer sicilde `shipped` değilse spec **reddedilir**
   ve red cümlesi **eksik operatörü adıyla söyler**. Fallback = halüsinasyon.

4. **Hata bulmak iş değil, çözümünü tasarlamak iştir.** Kırmızı raporunun şekli §2.4'te.
   "Burada sorun var" tek başına çıktı sayılmaz.

5. **Kapsamı en iyi olan belirler, en itaatkâr olan değil.** Damla'nın açık vetosu
   kalıcıdır; geri kalanda çelişkiyi dürüstçe önüne koy, sonra en iyi yolu seç.

6. **Push kuralı — devralınan kırmızı istisnası.**
   Kural: yeni kırmızı doğuran değişiklik geri alınır, push edilmez.
   İstisna: faz öncesi ve sonrası kırmızı **kümesi birebir aynıysa** (isim isim,
   sayı değil) push serbesttir. Şart: **iki ctest logu da commit'e girer.**
   İtiraf yeterli değil, kanıt kapıdan geçer (`kapi.sh` K1).

7. **Buğra bir referanstır, kural değildir.** Hiçbir kapı "Buğra'ya benziyor mu"
   diye sormaz. Kapılar geometri, dikilebilirlik ve zevk üzerinden kurulur.

8. **Ürün hattı kararı (Damla, geri alınabilir varsayılan):**
   > **Ürün hattı = `garment`** — tarayıcıya giden hat (`engine/wasm/bindings.cpp`
   > `garment.hpp` include ediyor). Damarın 14 bileşeni orada yazılı.
   > **Yüzey hattı (`surfacepattern`) = "henüz sevk edilmiyor"** — ölü değil, DAR.
   > Uzun vadede sınırsız sözlüğü mümkün kılan tek hat o; bugün ürün değil.
   >
   > Bu varsayıma dayanan her iş `GECE/KOSU.md`'de **etiketlenir**
   > (`[HAT-VARSAYIM]`). Etiketsiz iş yapmak yasak — sabah karar tersine dönerse
   > etiketli işler tek tek geri alınabilir olmalı.

---

# §1 — CONTEXT HİJYENİ

Bu koşu 8–14 saat sürecek. Tek context'te yürümez.
**Her faz ayrı bir ajan sürecidir.** Süreç ölünce context yok olur.
Aralarında geçen tek şey **diskteki dosyalar**.

## Klasör

```
GECE/
  KOSU.md          <= CANLI DURUM. ≤150 satır. HARD CAP. Eklemek için sil.
  F0.md .. F8.md   <= faz tutanakları (uzun, serbest; canlı duruma girmez)
  STOP.md          <= koşu durursa yazılır (yoksa dosya da yok)
  kapi.sh          <= makine kapısı (MÜHÜRLÜ, sha256 GECE/kapi.sha'da)
  mutasyon.sh      <= kapının kendi kanıtı (MÜHÜRLÜ)
  mutasyon.tsv     <= faz basina mutasyon manifestosu (faza ait, muhurlu DEGIL)
  gece.sh          <= dış döngü
  hakem-sorusu.md  <= hakem oturumunun tek sorusu
  log/             <= faz + kapı + hakem logları
```

## Her ajanın göreceği tek şey

```
RULES.md            (50 satır tavanlı)
GECE/KOSU.md        (150 satır tavanlı — canlı durum)
GECE-KOSUSU.md'nin §0 + §1 + §2 + §4 + o fazın §5 bölümü
+ fazın kendi ADIYLA saydığı kaynak dosyalar
```

**Hiçbir faza girmeyecekler:** `HEDEF.md`, `DAMLA-KUYRUK.md`, `devlog.md`,
`linkedin.md`, `ANAYASA.md`'nin envanter tabloları, `reports/`, `Logs/`.
Gerekirse `grep` ile tek satır çekilir; dosya bütün olarak açılmaz.
Bu öneri değil — `kapi.sh` ajan logunda bu dosyaların bütün okunduğunu görürse
fazı kırmızı sayar.

## KOSU.md şablonu

```
# KOŞU — <tarih>
## ŞU AN
faz: F#  ·  durum: <tek cümle>  ·  son yeşil commit: <hash>
## HAT VARSAYIMI
ürün hattı = garment · yüzey = henüz sevk edilmiyor   [Damla varsayılanı, geri alınabilir]
## KAPANMIŞ FAZLAR
F0 ✓ <tek satır sonuç> -> GECE/F0.md
## AÇIK KIRMIZILAR (her satır: ne · nerede · ölçülen sayı)
## BİR SONRAKİ FAZIN DEVRALDIĞI ÜÇ SAYI
## [HAT-VARSAYIM] ETİKETLİ İŞLER
## DAMLA'YA DÜŞEN (bloke etmez)
```

---

# §2 — KAPI YASASI: "yeşil" ne demek

**`ctest` yeşil bir kapı DEĞİLDİR.** Ajan test dosyasını yazabiliyorsa, testin
verdiği sayı ajanın kendi beyanıdır. Kurnazlıkların tamamı burada yaşar: eşiği
gevşetmek · testi silmek · testi çıktıya göre seçmek · girdiyi kırpmak · hiçbir
hüküm koşmayan test yazıp `0 FAIL` bastırmak.

**Bu repoda emsali var:** `test_seamdeed` sıfır kural koşarken yeşil basıyordu;
`spec_census` 8 beden 2 panele çökerken dikişler korunduğu için yeşildi.
Teorik risk değil, iki kez olmuş bir şey.

## 2.1 KATMAN A — ARTEFAKT KAPISI (ajan yazamaz, çünkü test değil ÖLÇÜM)

Kapı test dosyasına değil **üretilen nesnenin geometrisine** bakar.
Ajan çıktıyı değiştirmeden bu sayıları oynatamaz.

**A1 · Dikilebilirlik — KALIBIN kapısı** (flat bu teste TABİ DEĞİL)

| ölçü | hüküm |
|---|---|
| dikiş çifti uzunluk eşitliği | her kenar çifti eşit, ya da beyan edilmiş yedirme oranıyla farklı · tol **0.79375mm** (1/32") |
| çentik eşleşmesi | her çiftte çentikler aynı sırada, aynı yay uzunluğunda |
| panel kapalılığı | kapalı · kendini kesmiyor · sıfır alanlı üçgen yok |
| köşe açısı tutarlılığı | dikiş birleşimlerinde açı toplamı tutarlı (kırışık/körük kökü) |
| **geçiş** | en dar halka gereken kesitten geçiyor mu; geçmiyorsa açıklık operatörü ZORUNLU ve red cümlesi onu adıyla söyler |
| **durma** | strapless ise düşmeden duruyor mu (balensiz durmaz — geçiş sorusunun yerine bu geçer) |
| **geri projeksiyon** | panelleri dikili varsay → 3B'ye sar → gövde yüzeyine otur → her noktada gerinim ölç |

**A2 · Geri projeksiyon, kapının belkemiği.**
İnsan vücudu hacimli bir cisim; kalıptan ne çıkacağı **hesaplanabilir**. Bu bir
görüş değil, bir integral. Ajan bu sayıyı ancak **gerçekten daha iyi bir kalıp
çizerek** düşürebilir — test dosyasına dokunarak düşüremez, çünkü sayı testten
değil geometriden geliyor.
Yarısı yazılı: `flatten-research/15-arap-proper.py` + `02-gore-flatten-strain.py`.

**A3 · Satılabilirlik — FLAT'in kapısı** (dikilebilirlik testine tabi değil)
Flat gerçek mankene göredir, kalıp insana göredir. Ölçülebilir kısım:
tek croquis (omuz/göğüs/bel yüksekliği mm cinsinden eşit, ±2mm) · ölçek beyanı ·
üç katman çizgi hiyerarşisi · sıfır gölge · ön+arka zorunlu.
**Zevk kısmı bu kapıda değil** — Etsy hakemi Damla'dır (ANAYASA).

**A4 · Damar yüzdesi.** ANAYASA'nın altı yumuşak primitifinden kaçı üretilebiliyor.
Bugün **0**. Gece boyunca gerçekten ilerlenip ilerlenmediğinin tek sayılık özeti.

## 2.2 KATMAN B — KAPININ KENDİSİ KİLİTLİ

1. `GECE/kapi.sh`, `GECE/mutasyon.sh` ve `engine/tests/**` **diff'te geçerse faz
   OTOMATİK KIRMIZI.** Ajan kapıya ve var olan teste dokunamaz.
   Yeni test **ekleyebilir**, mevcut olanı değiştiremez/silemez.
   Kapı script'lerinin sha256'sı `GECE/kapi.sha`'da; döngü her fazdan önce doğrular.
2. **Tolerans/eşik sabiti diff'te oynamışsa KIRMIZI** — çıktı ne kadar iyi olursa
   olsun. Tolerans oynatmak bir HAMLE'dir; gündüz ölçülür, gerekçesi yazılır,
   Damla'ya sorulur. **Gece yapılmaz.**
3. **Golden byte-identical.** Yeni özellik opt-in, varsayılan KAPALI.
4. **Yeni test faz öncesi commit'te KIRMIZI düşmeli.** Düşmüyorsa boştur (vacuous).

## 2.3 KATMAN C — MUTASYON: "bu kapı gerçekten bir şey ölçüyor mu"

En önemli madde. Yeşil basmak, kapının çalıştığını **kanıtlamaz** — hiç koşmamış
da olabilir.

> Faz kapanmadan önce, kapının ölçtüğü şey **kasten bozulur** ve kapı
> **kırmızıya dönmek zorundadır.** Dönmüyorsa kapı boştur, faz kapanmaz.

`GECE/mutasyon.sh` içindeki zorunlu mutasyonlar:
- bir dikiş çiftinin kenarını **+5mm** uzat → A1 kırmızı olmalı
- bir çentiği kaydır → çentik hükmü kırmızı olmalı
- bir paneli sil → panel sayısı tabanı kırmızı olmalı
- flat'in omuz yüksekliğini **6mm** oynat → tek croquis kırmızı olmalı
- bir kalıbı düzlemde **1.1** ile ölçekle → geri projeksiyon gerinimi kırmızı olmalı

Mutasyon geçmezse **"yeşil" kelimesi o gece kullanılmaz.**

## 2.4 KIRMIZI RAPORUNUN ŞEKLİ (kural 4)

```
hata:       <ne · hangi sayı · hangi dosya>
kök:        <ÖLÇÜLMÜŞ sebep, tahmin değil>
adaylar:    <en az 2 çözüm, her biri ölçülmüş sonucuyla>
alınan:     <hangisi · neden>
reddedilen: <hangisi · hangi sayıyla reddedildi>
```
Ölçülüp reddedilen hamle de kayda geçer (repoda emsali var: Tur 5/6/7/8).

## 2.5 HAKEM — brief'i görmeyen göz

Makine kapısı geçtikten sonra ayrı temiz oturum. Eline verilen: diff + fazın
eklediği test + `RULES.md`. Brief'i **görmez ve isteyemez**.
Cevap tek satırla başlar: `HAKEM: EVET` / `HAKEM: HAYIR`. Hayır derse faz kapanmaz.

## 2.6 ÖZET — "yeşil" bundan sonra şu demek

1. Artefaktın geometrisi ölçüldü, hüküm geçti (test dosyası değil, **nesne**)
2. Kapıya ve teste dokunulmadı (sha + diff kilidi)
3. Tolerans oynatılmadı
4. Kapı **mutasyonla** kırmızıya döndüğü kanıtlandı
5. Brief'i görmeyen hakem `EVET` dedi

**Beşi birden yoksa yeşil yok.**

## 2.7 GECE KURALI GÜNDÜZDEN SERT

Gündüz: kırmızı → ajan çözüm arar.
**Gece: kırmızı → ajan BİR kez düzeltme dener, yine kırmızıysa DURUR.**

Damla uyuyor. Kırmızıda ısrar eden ajan gecenin kalanını yanlış yöne kürek
çekerek geçirir ve sabah 8 saatlik çöp bırakır. **Durmuş koşu, yanlış yöne
koşmuş koşudan iyidir.**

Durunca `GECE/STOP.md` yazılır: hangi faz · hangi kapı · hangi sayı · denenen
düzeltme · **çözüm adayları** (§2.4 şekliyle).
Sonra sıradaki fazı **açmaz**, ama bağımsız bir faz varsa ona geçer.
(F1 durursa F2 koşabilir — birbirine bağlı değiller.)

---

# §3 — HARNESS

Script'lerin kendisi `GECE/gece.sh`, `GECE/kapi.sh`, `GECE/mutasyon.sh`,
`GECE/hakem-sorusu.md` dosyalarındadır. Bu bölüm **niyeti** anlatır; **otorite
dosyanın kendisidir**, buradaki alıntı değil. (Kurulum sırasında bu makineye göre
yapılan sapmalar `GECE/KOSU.md` → DAMLA'YA DÜŞEN altında tek tek yazılıdır.)

## 3.1 `GECE/gece.sh` — dış döngü

Fazları **ayrı ajan süreçleriyle** sırayla koşturur. Her faz için sırasıyla:

1. **faz ajanı** — temiz oturum; eline geçen: `§0..§5-başlığı` ortak metni + kendi
   `<!--FAZ:F#-->` bloğu + system prompt olarak `RULES.md` + `GECE/KOSU.md`.
   Diğer fazların brief'ini **görmez**.
2. **makine kapısı** — `GECE/kapi.sh F# <once_commit>` (K1..K7).
3. **mutasyon** — `GECE/mutasyon.sh F#`; kapı gerçekten ölçüyor mu.
4. **hakem** — brief'i görmeyen temiz oturum, `GECE/hakem-sorusu.md`.

Dördü de geçerse commit + push. Biri kırmızıysa `GECE/STOP.md`'ye yazılır ve
faz **kapanmaz** (§2.7 gereği döngü sıradaki bağımsız faza geçer).

Koşudan önce `GECE/kapi.sha` doğrulanır; mühür kırıksa koşu **başlamaz**.

Kritik olan: her ajan çağrısı **yeni bir süreç**, yani yeni bir context. Dört fazı
aynı oturuma sıkıştırırsan bu dosyanın hiçbir anlamı kalmaz.

## 3.2 `GECE/kapi.sh` — yargılamayan kapı

`GECE/kapi.sh <FAZ> <once_commit>` → exit 0 yeşil, 1 kırmızı. Alt kapılar:

| kapı | ne ölçer |
|---|---|
| K1 | devralınan kırmızı **kümesi** değişti mi (isim isim, sayı değil) — §0.6 |
| K2 | fazın eklediği yeni test, faz **öncesi** commit'te kırmızı düşüyor mu (vacuous test kapanı) |
| K3 | `GECE/F#.md` raporunda geçen her dosya yolu diskte gerçekten var mı |
| K4 | tolerans/eşik sabiti **mevcut** bir dosyada oynatılmış mı |
| K5 | dokunulmazlar (`patterns_real/`, `ANAYASA.md`, `GECE/kapi.sh`, `GECE/mutasyon.sh`) değişmiş mi + mühür sağlam mı |
| K6 | var olan test **silinmiş ya da değiştirilmiş** mi (yeni test eklemek serbest) |
| K7 | ajan logunda §1'in yasakladığı dosyalar bütün olarak okunmuş mu |

## 3.3 `GECE/hakem-sorusu.md`

Hakem fazın brief'ini **görmez ve isteyemez**. Tek sorusu: bu çıktı, testin
geçtiğini iddia ettiği şeyi gerçekten yapıyor mu, yoksa testi geçmek için mi
şekillendirilmiş? Cevap `HAKEM: EVET` / `HAKEM: HAYIR` ile başlar.

## 3.4 Mühürleme (koşudan önce bir kez)

```bash
sha256sum GECE/kapi.sh GECE/mutasyon.sh > GECE/kapi.sha
chmod +x GECE/gece.sh GECE/kapi.sh GECE/mutasyon.sh
```

## 3.5 Uyumadan önce tek komut

```bash
bash GECE/gece.sh > GECE/log/gece.txt 2>&1 &
```

---

# §4 — F0 SİCİLİ (ölçüldü, commit 66e2732 · TEKRAR ÖLÇÜLMEYECEK)

Bu bölüm hazır ölçümdür. Hiçbir faz bunları baştan ölçmek için zaman harcamaz.
Şüphe varsa tek satır `grep` ile doğrulanır, bütün dosya açılmaz.

**4.1 · Üç sayı:** `DAMAR = %0` · `ctest 89/95` · hem/bel oranı: **kalıp 1.787 · flat 1.214**

**4.2 · Flat kalıptan türemiyor — ve kontrat bunu yazmış.**
`engine/tools/render-garment-flat.mjs:23` kendi başlığında: `pieces … NOT used to
derive the outline`. Asıl kanıt `contract/tables.json` → `flat._layer`:
*"NOT millimetres and NOT the same quantity as draft."*
Yani ortada birbirini denetlemeyen iki doğru **yok** — **bir doğru + bir resim** var.
Flat SVG'de hiçbir ölçek beyanı yok (`unitDeclared: false`).

**4.3 · Damar %0.** Kalıp yolunda ANAYASA'nın altı yumuşak detayından
(fiyonk / büzgü / fırfır / mini-düğme / lace-up / dantel) **sıfırı** üretilebiliyor.
Flat yolunda 9/31 stil = %29 çiziyor, ama flat satılabilir nesne değil.
Sevk edilen kalıp ayrıca **strapless** (shoulderSeam flagged, sleeve absent).

**4.4 · Sicil deliği.** Damarın en sık 5 detayı (fiyonk ~14, mini-düğme 9,
fırfır/peplum ~9, lace-up 2, dantel 2-3) sicilde `absent` bile **değil — adı yok**.
Kural "red cümlesi eksik operatörü adıyla söyler" diyor; adı olmayanı adıyla
reddedemezsin. Gerçek `absent` sayısı **4**: `sleeve · collarFamily ·
gatheredOverlayLayer · skirtFamily`. (`zipperPiece` absent olması **doğru** —
görünür fermuar damar dışı, ANAYASA.)

**4.5 · `shoulderSeam` flagged, gerekçesi yazılı.** Kod **var**:
`engine/src/shoulder.cpp` 9981 byte, `engine/CMakeLists.txt:40`'ta derleniyor,
Tur 6 sayılarıyla ölçmüş (kapı 52/63 → 24/63). Bayrak açıkken
`surface_pattern_check` 0 → 4 FAIL, iç gerinim %24.07 / %18.14, kapı %3.0.
**Omuz eksik koddan değil, GEOMETRİDEN kapalı.**

**4.6 · "Yazılmış ama sevk edilmemiş" 14 dosyanın gerçek durumu.**
Çağrılmıyor **değil** — **başka hatta** çağrılıyor:
```
ruffle · peplum · buttonrow · gather · laceupback · hemflounce · sleeve · shoulder
      -> hepsi garment.cpp'den cagriliyor

surfacepattern.hpp'yi include eden URETIM dosyasi: 1 (surfacepattern.cpp)
                                    + 3 probe + 4 test. Baska yok.
engine/wasm/bindings.cpp -> #include "../src/garment.hpp"
                            "surfacepattern" gecme sayisi: 0
```
Yani tarayıcıya giden WASM **garment hattından** derleniyor; yüzey hattı bugün
pratikte bir **test hattı**. §0.8'deki hat kararının dayanağı budur.

**4.7 · F0'ın kendi düzelttiği üç iddia** (hakem çürüttü, dürüstçe kayıtta):
"Damar %0" gerekçesi delikti — ANAYASA'nın üyelik testi bir **çizim** testidir,
kalıba uygulanmaz; sonuç ayakta kaldı ama üç yeni bacağa oturdu.
"5 eksik operatör" yanlış sayımdı → 4.
"Tek croquis" fazla cömertti — `engine/flat-engine/_engine-full.mjs:256`'da
**2 stil-pinli sert kodlanmış kaçış** var.
Ayrıca F0'ın kendi ölçüm aletinin ürettiği üç sayı **silindi** (EU38'de göğüs
çevresi 129cm veriyordu, gerçek ~88 — yöntem çürüktü).

**4.8 · `G5` çelişkisi YOKTUR — kaynak yanlış atfedilmiş.**
`HEDEF.md`'de `G5` **0 kez**, `SIRADAKİ` **0 kez** geçiyor.
`docs/G5-OMUZ-PLANI.md` commit `2f748db`'de **silinmiş**, bugün diskte yok.
Muhtemel kaynak `reports/gate/NABIZ.md` (arşiv) ya da gitignore'lu `CLAUDE.md`.
**Arşiv otorite değildir** (§0.1). Bu satır tekrar açılmaz.

**4.9 · Kapanma dili (Damla hükmü).** Görünür fermuar **yok** (ANAYASA: kapanma
dili yumuşak — düğme/bağcık/fiyonk). Damarın üç meşru açıklığı ve kodu:
`buttonrow.cpp` · `laceupback.cpp` · `tie.cpp`.
**Tercih: lace-up.** Ayarlanabilir olduğu için grade hatasını yutar; monotonluk
ihlali 34 kenarın 30'unda açıkken bu ölçülebilir bir avantaj.

**4.10 · Açık kalanlar (Damla'da, hiçbir fazı bloke etmez):**
K1 — `patterns_real/` altında 41 takipli satın alınmış dosya, `contract_check`
kırmızısının kaynağı. **Dokunulmaz** (§2.2 K5).

---

# §5 — FAZLAR

Çekirdek **F1–F4** (bu gece). Uzatma **F5–F8** (sabah / kalan süreye göre).
Her fazın ajanı **yalnız kendi bölümünü** okur.

<!--FAZ:F1-->
## F1 — İKİ DOĞRUYU TEKE İNDİR: flat kalıptan türesin (3–5 s)

**Devralınan teşhis (§4.2):** ortada iki motor yok; **bir kalıp + bir resim** var.
`contract/tables.json` bunu açıkça beyan etmiş: flat katmanı milimetre değil ve
kalıpla aynı büyüklük değil. Damla'nın *"iyi flat yok, öyleyse iyi kalıp da olamaz"*
cümlesinin makine karşılığı budur.

**Hedef:** flat'in dış konturu **çizilmesin, HESAPLANSIN.**

```
BodySurface  (bodysurface.cpp — var)
   └─> giysi kabugu (ease + siluet uygulanmis)
         ├─> ON PROJEKSIYON   -> flat on siluet  (ortografik, duz onden)
         ├─> ARKA PROJEKSIYON -> flat arka siluet
         └─> ACILIM (flatten.cpp) -> kalip panelleri
```

Flat bir *manüfaktür* çizimi değil, *bitmiş giysi* çizimidir: pensler kapalı,
dikişler kapanmış, giysi vücut üstünde. İç çizgiler (prenses dikişi, pens, empire
kesiği) kalıbın **gerçek dikiş hatlarının** aynı projeksiyona düşmüş hâlidir.

**ÖN HALKA — ZORUNLU, 30 dk, ilk iş bu:**
§0.8'deki hat varsayımı `GECE/KOSU.md`'nin başına yazılır. Projeksiyon **hangi
kabuktan** alınacaksa (garment hattı) bu açıkça beyan edilir. Yüzey hattından
alınırsa **üçüncü bir doğru** üretilmiş olur — yasak. Bu halkanın çıktısı tek
paragraf: "flat şu kabuktan türüyor, şu commit'te, şu dosyada."

**Kabul kapısı — yeni test `flat_pattern_agree_check`:**
aynı spec'ten üretilen flat ve kalıp için şu 6 ölçü toleransta eşit olmalı:
`etek ucu çevresi · göğüs çevresi · bel çevresi · gövde boyu (omuz→etek ucu) ·
yaka açıklığı genişliği · omuz genişliği` — **tolerans %1.5**.
Bugünkü başlangıç noktası ölçülü: hem/bel oranı kalıp **1.787**, flat **1.214**
(≈%47 sapma). Test F1 öncesi commit'te **kırmızı düşmeli** (§2.2-4).

**ANTI-HACK (hakeme sorulacak tam soru):** kapıyı geçmek için flat'e sabit çarpan,
ölçek katsayısı ya da stil-özel düzeltme eklemek **YASAK**. Kapı, iki üretim
hattının **aynı kaynaktan beslendiğini** kanıtlamalı — sayıları eşitlemeyi değil.
`_engine-full.mjs:256`'daki iki sert kodlanmış kaçış (§4.7) **kaldırılmalı ya da
sayısıyla ilan edilmeli**; sessizce bırakılamaz.

**MUTASYON SÖZÜ (§2.3, zorunlu):** `GECE/mutasyon.tsv`'ye `F1` satırı yazılır:
flat üretim hattına sabit ölçek çarpanı (**1.1**) sokan bir knob göster; mutasyon
uygulandığında `flat_pattern_agree_check` **kırmızıya dönmek zorunda**. Dönmüyorsa
kapı boştur ve faz kapanmaz.

**Bitmezse:** kabuk→projeksiyon hattının **ön gövdesi tek bedende (EU38)** çalışsın
yeter; grade F3'e kalır. Eski şablon hattı **silinmez**, `_LEGACY` bayrağı arkasına
alınır. **Kısmi çalışan hat, tam çalışan sahte hattan iyidir.**

**Çıktı:** `GECE/F1.md` (§2.4 şekli) + en az bir PNG/SVG yolu + güncellenmiş `KOSU.md`.
<!--FAZ-SON:F1-->

<!--FAZ:F2-->
## F2 — SÖZLÜK REFORMU: menü değil mutfak (3–5 s) · F1'e bağlı DEĞİL

**Teşhis:** iki sözlük var, ikisi aynı felsefede değil.
- `engine/tools/atolye/lexicon.js` **doğru felsefede**: "puf kol ayrı bir kol türü
  değil, kapak yüksekliği 2.4"; "kloş etek ayrı bir tür değil, etek bolluğu 2.55".
- `contract/garment-spec-v2.json` `topology` ekseni **kapalı enum**
  (`crew, scoop, vNeck, square, boat, sweetheart, halter`);
  `vision-student/vocab.py` aynı kapalı listeyi elle kopyalıyor.

Mutfak JS tarafında, menü C++ tarafında, **sevk edilen taraf menü.**
"Sınırsız ürün çıkmıyor" şikâyetinin kökü budur.

**Hedef mimarî** (GarmentCode / PyGarment'in kanıtlanmış şekli — `scripts/setup-garmentcode.sh`
zaten pinli duruyor):

```
KATMAN 1 — PRIMITIF (surekli, kapali liste DEGIL)
  Edge : parametrik kenar (duz/yay/spline) · uzunluk + egrilik + gerginlik
  Panel: kapali kenar zinciri + grainline + katlama ekseni
  Seam : iki kenari eslestiren bag (uzunluk esitligi + yedirme orani + centik)
  Op   : olculebilir islem — suppress(pens/prenses) · gather(oran) · flare(koni acisi)
         extend(mm) · split(oran) · overlay(katman) · attach(arayuz)

KATMAN 2 — BILESEN (primitiflerden kurulmus)
  bodice · sleeve · skirt · collar · cuff · band · overlay
  Her biri kendi PARAMETRE KUMESINI acar, kapali bir isim listesi degildir.

KATMAN 3 — TARIF / PRESET (sadece bir isim + parametre demeti)
  "sweetheart" = necklineDraft(centerNotch=… , cupRise=… , cupWidth=…)
  "puf kol"    = sleeve(capHeight=2.4, capEase=… , hemGather=…)
  "peplum"     = overlay(anchor=waist, flare=… , length=…)
  "fiyonk"     = tie(anchor=… , loopW=… , tailL=…)   <-- bugun sicilde ADI YOK
```

**Yasa:** Katman 3'teki her isim Katman 1/2 parametrelerine **çözülebilir olmalı**.
Çözülemeyen isim sözlüğe **girmez**. Bir isim silinince arkasındaki geometri **kalır**
— "heart neck" kelimesini attığında o giysi hâlâ üretilebilir olmalı.
İki tarif arasındaki her ara değer de geçerli bir giysidir; kapalı liste bunu yasaklıyordu.

**İş:**
1. Katman 1'i `contract/primitives-v1.json` olarak tanımla; `spec-v2`'nin `topology`
   enum'larını bu primitiflere **çözen** tabloyu yaz.
2. §4.4'teki **adı olmayan 5 detayı** sicile yaz — `absent` olarak, gerekçesiyle.
   Adı olmayanı adıyla reddedemezsin; önce ad, sonra geometri.
3. `lexicon.js`'in kural tabanını Katman 3 preset tablosuna taşı — **tek kaynak**.
4. `vision-student/vocab.py`'ın listesi Katman 3'ten **üretilsin**, elle yazılmasın.

**Kanıt testi `preset_resolve_check`:** her preset ismi primitiflere çözülüyor mu,
**ve** çözümü motorda gerçekten bir panel üretiyor mu (0.9 draft-proof).

**ANTI-HACK:** preset tablosuna isim eklemek bedava ve **hiçbir şey çizmez**.
Bir ismin `drawable` sayılması, arkasındaki primitif zincirinin **çizen** bir panel
üretmesine bağlıdır. `terms.json`'daki `status: honest` (kayıtlı ama çizilmiyor)
ayrımı korunur ve bu fazda **genişletilir**.

**MUTASYON SÖZÜ (§2.3, zorunlu):** `GECE/mutasyon.tsv`'ye `F2` satırı yazılır:
bir primitifi çözüm tablosundan düşür; `preset_resolve_check` **kırmızıya dönmek
zorunda**. Dönmüyorsa test isimleri sayıyor, geometriyi değil — faz kapanmaz.
<!--FAZ-SON:F2-->

<!--FAZ:F3-->
## F3 — FLAT KONVANSİYONU: "aynı modelden çıkmış gibi" ölçülebilir olsun (2–4 s)

Damla'nın şikâyeti zevk değil **tutarlılık**: flat'ler aynı croquis'ten gelmediği
için her biri başka bir orana oturuyor.

**Endüstri konvansiyonu (tartışmasız kısım):**
- Flat **ölçekli** çizilir. Yetişkinde yerleşik ölçek **1:8** (çocukta 1:4), formül `d/D = 1/S`.
- **Çizgi hiyerarşisi anlam taşır:** dış siluet + ana dikişler KALIN · iç dikiş,
  pens, panel İNCE · topstitch KESİKLİ · gizli hat NOKTALI. Fabrika bunu tek bakışta
  okur; eşit ağırlık = şema hissi, flat hissi değil.
- **Gölge, doku, perspektif yok.** Ön + arka zorunlu; karmaşık bölge için büyütülmüş
  detay callout'u (yaka, bağcık, manşet).
- Tüm flat'ler **tek temel bloktan/croquis'ten** türer. Kategori değişse bile taban
  aynı kalır — "aynı mankenin üstünde" hissi buradan gelir, çizim stilinden değil.

**Kapı `flat_convention_check`:**
1. **Tek croquis yasası** — iki farklı stilin flat'inde `omuz genişliği`,
   `göğüs hattı yüksekliği`, `bel hattı yüksekliği` piksel değil **mm cinsinden**
   eşit, tolerans ±2mm. (F1 kapandıysa bedava gelir.)
   §4.7'deki **iki sert kodlanmış kaçış** burada kapanmalı.
2. **Ölçek beyanı** — her SVG `data-scale` taşır ve gerçek ölçüyle tutarlıdır.
   Bugün `unitDeclared: false` (§4.2).
3. **Üç katman çizgi** — `W_OUTLINE > W_SEAM > W_MARK`, oran sabit ve dosyada beyan
   edilmiş. (`render-garment-flat.mjs`'de bugün 2.0 / 1.4 / 1.0 — kapı bunu ölçsün.)
4. **Sıfır gölge / sıfır dolgu gradyanı.**
5. **Ön + arka zorunlu.** ANAYASA "arka çizildiyse arkada olay var" diyor; arka
   çizilmiyorsa çıktı damar dışıdır.

**Bu fazda düzeltilecek somut kusur:** bugünkü çıktıda etek ucu **tırtıklı/dalgalı**
(`engine/tools/flat-metre/out/dress_princess_scoop_aline.png` ve `top_princess_peplum.png`).
Tasarım değil — koni açılımının **kenar örneklemesinden** gelen artefakt.
Kökünü ölç, sonra düzelt. **Kırpma ile gizleme.**

**MUTASYON SÖZÜ (§2.3, zorunlu):** `GECE/mutasyon.tsv`'ye `F3` satırı yazılır:
flat croquis'inin omuz yüksekliğini **6mm** oynatan knob; `flat_convention_check`
**kırmızıya dönmek zorunda**.

**Etsy kapısı burada DEĞİL** (§2.1-A3). Bu faz sadece ölçülebilir olanı kapatır ki
zevk turuna temiz çıktı gitsin.
<!--FAZ-SON:F3-->

<!--FAZ:F4-->
## F4 — DİKİLEBİLİRLİK KAPISI: kalıp gerçekten dikilir mi (3–5 s)

Damla'nın ayrımı mimarîye yazılır:
> **flat** gerçek mankene göredir → *satılabilirlik* testine tabidir.
> **kalıp** insana göredir → *dikilebilirlik* testine tabidir.
> İki test asla birbirinin yerine geçmez.

Kapının maddeleri **§2.1-A1'de** tanımlı. Bu faz onları **koda bağlar**.

**Notlar:**
- Geri projeksiyonun yarısı yazılı: `flatten-research/15-arap-proper.py` ve
  `02-gore-flatten-strain.py`. Önce oku, sonra yaz (§6).
- **Geçiş maddesi:** en dar halka gereken kesitten geçmiyorsa açıklık operatörü
  **zorunlu** ve red cümlesi onu **adıyla** söyler. Fermuar yok; seçim
  `buttonrow / laceupback / tie` (§4.9, tercih lace-up).
  `DAMLA-KUYRUK` K8'in "kafadan geçmeyen kapalı tüp"ü tam bu kapının eksikliğinden çıkmış.
- **Durma maddesi:** sevk edilen giysi bugün **strapless** (§4.3). Orada "kafadan
  geçiyor mu" konusuz; yerine **"düşmeden duruyor mu"** geçer. Balensiz durmaz.
- **Mutasyon zorunlu** (§2.3): bu kapı yazıldıktan sonra `GECE/mutasyon.tsv`'ye `F4`
  için **dört** satır yazılır — kenar **+5mm** · çentik kayması · panel silme ·
  düzlemde **1.1** ölçekleme. Dördünün de kapıyı kırmızıya döndürdüğü
  **kanıtlanmadan** faz kapanmaz.

**Ve kural 4 burada yürür:** kapı kırmızı verdiğinde çıktı "hata var" değil,
§2.4'teki beş satırdır. Ölçülüp reddedilen hamle de kayda geçer.
<!--FAZ-SON:F4-->

<!--FAZ:F5-->
## F5 — KOL (uzatma, 4–8 s) · sicildeki en pahalı `absent`

`sleeve` operatörü **absent** (§4.4), ama ANAYASA'nın 43 görselinin ezici çoğunluğu
kolsuz **ya da kısa puf/balon/kap kol**. Sicilin tek eksik satırı damarın büyük bir
dilimini kilitliyor.

Kol, primitif katmanında **ayrı bir giysi türü değil**: bir Panel + iki Seam
(kol oyuğu arayüzü + kol içi dikişi) + kapak eğrisi. `lexicon.js` doğru söylüyor:
"puf kol" = kapak yüksekliği; "balon kol" = kapak + kol ağzı büzgüsü.

**Kapı:** kol oyuğu yayı ile kol kapağı yayı **yedirme oranıyla** eşleşiyor mu
(F4 kapısı bunu zaten ölçebiliyor olmalı). Başlangıç: `flatten-research/19-cap-vs-armscye.py`,
`knowledge/cap-ease-isareti-2026-08-17.md`.

**Ön koşul:** `shoulderSeam` bayrağı **geometriden** kapalı (§4.5) — iç gerinim
%24.07/%18.14, kapı %3.0. Kol inşa edilmeden önce çözülecek şey kol değil, **o gerinim**.

**Not:** `DAMLA-KUYRUK` K9 açık — ön/arka oyuk uzunluğunda kitap ile satın alınmış
kalıp ters söylüyor. Hangi kaynağın kural olduğu **Damla'nın hükmüdür**. Hüküm
gelene kadar kol motoru ölçüyü **basar, yargılamaz** (bugünkü fikstür davranışı doğru).
<!--FAZ-SON:F5-->

<!--FAZ:F6-->
## F6 — KUMAŞ KATMANI + REHBER (uzatma, 2–3 s)

Ürün artık "kalıp + flat" değil, **"kalıp + flat + rehber"**.
**Kumaş spec'in bir ekseni olmalı** (bugün değil).

| kumaş sınıfı | esneme | kalıp davranışı |
|---|---|---|
| dokuma (woven) | ~0 | **pozitif ease** zorunlu, şekil pens/prenses ile verilir |
| stable knit | %0–25 | kalıp ≈ vücut ölçüsü, indirim yok |
| orta esnek | %26–50 | ~%3 daraltma |
| esnek | %51–75 | ~%5 daraltma |
| süper esnek | %76–100+ | ~%10 daraltma, pens genelde kalkar |

Negatif ease formülü: `(1 − 1/esneme_oranı) × 100`.
**Ham formül tek başına uygulanmaz:** toparlanma (recovery) olmadan esneme sayısı
yanıltıcıdır — toparlaması zayıf kumaş bir saatte torbalanır. Ayrıca kullanılabilir
esneme, kumaşın "ağırlaşmaya" başladığı noktaya kadardır, maksimumuna kadar değil.

**Yasa:** kumaş sınıfı değişince kalıp **değişmeli**. Aynı spec + farklı kumaş =
farklı kalıp.
**Kapı `fabric_ease_check`:** woven ve %50 knit için üretilen aynı spec'in göğüs
çevresi farkı beklenen **yönde ve büyüklükte** mi.

**Rehber çıktısı** (satılan pakete girer): kumaş önerisi + esneme testi tarifi
(10cm işaretle, rahat gerdir, ölç) + o kumaşa özel püf noktalar (tela nerede, hangi
dikiş, hangi iğne) + kesim planı. Yarısı yazılı: `knowledge/sewing-guide.md`,
`knowledge/seed_fabrics.sql` — üretime bağlanmamış.
`DAMLA-KUYRUK` H1.1a bunu zaten kırmızı sayıyor: "kumaş önerisi hiçbir sayfaya basılmıyor".
<!--FAZ-SON:F6-->

<!--FAZ:F7-->
## F7 — DÜZENLEME OPERATÖRÜ: "şuraya fiyonk ekle" (uzatma)

Doğru şekli literatürde çözülmüş: **model geometri üretmez, program/parametre üretir.**
Spec zaten bu yasayı taşıyor (`garment-spec-v2.json` `_law` 1: LLM JSON yazar, kod yazmaz).
Düzenleme de aynı yasanın altında kalır.

```
mevcut spec + "arka bele fiyonk ekle"
  -> spec DIFF (sadece degisen alanlar)
  -> sema dogrulamasi (kapali eksen + sinirli skaler)
  -> operator sicili kontrolu (gereken operator shipped mi; degilse ADIYLA reddet)
  -> yeniden uretim (ayni seed, ayni beden)
  -> ONCE/SONRA farki: sadece istenen bolge mi degisti?
```

**Kritik kapı `edit_locality_check`:** "yakayı değiştir" dendiğinde etek ucu
**değişmemeli**; dokunulmayan panellerde diff **byte-identical** olmalı.
Midjourney benzeri düzenleme hissinin tamamı bu kapıda yaşar.
Bu kapı yoksa özellik düzenleme değil, **yeniden üretimdir**.

**Ön koşul:** F2 bitmiş olmalı — "fiyonk" bugün sicilde **adı olmayan** bir şey (§4.4).
<!--FAZ-SON:F7-->

<!--FAZ:F8-->
## F8 — KAPANIŞ (atlanmaz)

1. `ctest` durumu: kaç test, kaç kırmızı, hangileri — **test çıktısından**, dokümandan değil.
2. §4.1'in **damar yüzdesini yeniden ölç**. Değişmediyse gece boyunca zevk tarafında
   hiçbir şey ilerlememiş demektir — bunu **açıkça yaz**.
3. `KOSU.md` son hâli + `[HAT-VARSAYIM]` etiketli işlerin listesi.
4. `DAMLA-KUYRUK.md`'ye gece düşen yeni sorular.
5. **Yalnızca push edildikten sonra rapor.** "Bitti / hazır" toptan cümlesi yasak;
   yapılan ve yapılmayan ayrı ayrı yazılır.
6. Rapor **üç sayı** ile başlar: kaç kapı yeşile döndü · kaç yeni kırmızı doğdu ·
   damar yüzdesi ne oldu.
<!--FAZ-SON:F8-->

---

# §6 — YASAKLAR

- **Kapıyı gevşeterek geçmek.** Tolerans değiştirmek bir HAMLE'dir; gece yapılmaz (§2.2-2).
- **Kırmızıyı "sonraki fazda" diye taşımak.** Kapı kırmızıysa faz kapanmaz.
- **Var olan testi değiştirmek ya da silmek.** Yeni test eklenir, eskisine dokunulmaz.
- **Yeni dosya enflasyonu.** Bir faz en fazla **3 yeni kaynak dosya** açar; fazlası
  gerekiyorsa gerekçesi `GECE/F#.md`'ye yazılır.
- **Var olan aleti okumadan ikincisini yazmak.** `engine/tools/` altında 100+ alet
  var ve bir kısmı uyuyor — önce `grep`, sonra yaz.
- **Arşive dayanarak otoriteye cümle atfetmek** (§0.1, §4.8).
- **Damla'nın onaylamadığı çıktıyı "geçti" saymak.** ANAYASA: başarı beyanı yalnızca
  Damla'nın evet'idir.
- **`patterns_real/` altındaki satın alınmış PDF'leri silmek, taşımak, yayınlamak.**
- **Etiketsiz iş.** Hat varsayımına dayanan her iş `[HAT-VARSAYIM]` etiketi taşır (§0.8).

---

# §7 — AÇILIŞ (yeni oturuma yapıştırılacak)

> `GECE-KOSUSU.md` dosyasının **§0, §1, §2, §3 ve §4**'ünü oku. §5'i **açma**.
> Yapacağın tek iş şu: `GECE/` klasörünü kur — `gece.sh`, `kapi.sh`,
> `hakem-sorusu.md` dosyalarını §3'ten çıkar, `mutasyon.sh`'i §2.3'teki beş
> mutasyona göre yaz, `GECE/KOSU.md`'yi §1'deki şablonla ve §4'ün üç sayısıyla
> doldur, sonra §3.4'teki mühürleme komutunu çalıştır.
> Sonra **DUR ve bana söyle.** Hiçbir fazı açma — `gece.sh` açacak.
