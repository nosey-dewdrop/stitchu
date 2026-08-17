# DAMLA-KUYRUK

Bana değil **Damla'ya** düşen kararlar. Buraya satır olarak düşer, cevaplanınca satır kapanır (`[x]` + cevap + tarih).
**BLOKE ETMEZ** — kuyruk beklerken paralel halkalar koşmaya devam eder.

---

## AÇIK

### [ ] K1 — `patterns_real/` ve public repo · ACİL · 2026-08-16
**Ölçülen durum:** `git ls-files patterns_real/ | wc -l` → **49 dosya takipli**. `.gitignore` içinde `patterns_real` girdisi **YOK** (grep boş döndü) — yani dosyalar kazayla değil, bilerek commit'lenmiş. İçinde satın alınmış **Buğra kalıp PDF'leri** var. Repo bugün **public** açıldı.
**Damla private'a çekiyor** (kendi sözü).
**Soru:** Geçmişten `git filter-repo` ile kazınsın mı?
- Kazınırsa: geçmiş yeniden yazılır, tüm commit hash'leri değişir, fork/klon varsa kopar.
- Kazınmazsa: repo bir gün tekrar public olursa PDF'ler geçmişte durmaya devam eder.
**Ben yapmıyorum — geçmiş yeniden yazmak Damla'nın kararı.**
**Cevap:**

### [ ] K2 — beden cevabı · 2026-08-16
H1'in dikileceği beden hangisi? Motor EU34–EU48 üretiyor, paket 8 bedende hazır.
**Cevap:**

### [ ] K3 — kapak adayları (H1.3) · 2026-08-16
Listing vitrini için kapak + tek line drawing. Adaylar üretilince buraya PNG yolu düşer, Damla seçer.
Şartname zaten sabitliyor: ön+arka flat tek karo, 3 katman çizgi hiyerarşisi, navy `#1f3a5f` gövde / `#5c7aa0` seam.
**Cevap:**

### [ ] K4 — zevk hükümleri (H1.3, H3.4) · 2026-08-16
Zevk kapısının hakemi Damla. Süre taahhüt edilemez; raporlarda `zevk turu N` diye sayılır.
**Cevap:**

### [ ] K5 — dünya kapısı ne demek? · T5'i BLOKE EDER · 2026-08-16
`HEDEF.md` T4 satırı "dünya-kapısı sicili" diye bir taban halkası açıyor ama terimin tanımı repoda **hiçbir yerde yok**. Aradığım yerler ve sonuç:
- `git grep -i -E "d[uü]nya[ -]?kap|world[ -]?gate|global gate"` **tüm revizyonlarda** (`git rev-list --all`) → **2 isabet**, ikisi de halkanın kendisi: `HEDEF.md:40` ve `.vardiya/state.json:28`. İkisi de dün `bc0c63b` ile yazıldı.
- Tüm commit gövdeleri (`git log --all --format=%B`) → **0 isabet**.
- Diskteki takipsiz/gitignore'lu dosyalar dahil ağaç geneli → aynı 2 isabet.
- Tek tek okundu, geçmiyor: `ANAYASA.md`, `DERSLER.md`, `ROADMAP.md`, `CLAUDE.md`, `RULES.md`, `README.md`, `ENV.md`, `docs/`, `reports/`, `reports/gate/` (`NABIZ.md` + 8 `MIHENK-*.json` dahil).
- Yakın ama BAŞKA terimler: **TEK KAPI** (= Damla'nın gözü, `ROADMAP.md:22`), `KAPI 0` (= dikilebilirlik, `atlas.py`), `H0/H3b/H3c` (= harness kapıları), `pushGate` (= rabadon).

**Tanımı UYDURMADIM.** T5 açık bırakıldı; sicil kurulmadı, çünkü neyin sicili olduğu belli değil.
**Soru:** "dünya kapısı" hangi kapı — (a) giysinin dış dünyaya çıktığı kapı (= listeleme/satış), (b) TEK KAPI'nın başka adı, (c) motorun dışarıdan gelen rastgele isteği kabul/red kapısı (bitiş tanımındaki "10 cümle"), yoksa (d) bambaşka bir şey mi? Sicil neyi saymalı?
**Cevap:**

### [ ] K6 — "iki include düzeltmesi" neydi? · T1'i kapatır · 2026-08-16
Bunu HEDEF.md'ye senin metninden yazdım, repoda karşılığı yok. Arandı: tüm revizyonlar, tüm commit gövdeleri, `docs/`, `reports/`, `flatten-research/FINDINGS.md`, `ANAYASA/DERSLER/ROADMAP/RULES/README/ENV` → **0 isabet**.
Ampirik kontrol: 52 başlık tek tek `-fsyntax-only` ile derlendi, **0 başarısız** — yani `#include` kastediliyorsa ortada kusur yok.
**T1'i "yok hükmünde" yazdım, uydurmadım.** Başka bir şey kastettiysen söyle, halka geri açılır.
**Cevap:**

### [ ] K7 — README public'te bayat sayı söylüyor · 2026-08-16
`README.md:45` dışarıya **"the engine drafts 27 of 54 real garment photos … (37/54 under the older, looser count)"**, `:40` **"77/77 green"** diyor.
Üçü de `ANAYASA.md`'nin hükümsüz ilan ettiği 2026-07-21 rejiminden. Bugünün gerçeği: **ctest 88 test, 1 kırmızı**; 8 bedenin 3'ü h3c'den düşüyor.
Silmedim — README dört otorite dosyasından biri değil, senin anlatı yüzeyin, tek taraflı yeniden yazmak bana düşmez.
**Ama bu sayıyı dışarıda söylersen yanlış söylersin.** Düzelteyim mi, sen mi yazacaksın?
**Cevap:**

### [ ] K8 — 12 Ağustos paketleri sadece bayat değil, BAŞKA BİR GİYSİ · 2026-08-17
`Logs/surface-2026-08-12/pack-*` (8 beden) spec'inde `openings` anahtarı **hiç yok** (`None`).
Yani o elbisenin arka açıklığı da fermuarı da yok — **kafadan geçmeyen kapalı bir tüp**.
`CLAUDE.md`'deki "8 bedenin tam paketi diskte duruyor" cümlesi ürün olarak sayılamaz; bugünden itibaren öyle söylenmiyor.
Ayrıca dizin adı tutarsız: `pack-eu38` küçük harf, diğer 7'si `pack-EU34..48` büyük. Script kırabilir.
**Silinsin mi, arşive mi?** Düzeltmek bayat çıktıyı meşrulaştırır diye dokunmadım.
**Cevap:**

### [ ] K9 — İKİ KAYNAK BİRBİRİNİN TERSİNİ SÖYLÜYOR · 20–38 saatlik işin yönünü belirler · 2026-08-17
Bu, uydurulup geçilebilecek bir şey değildi; kapıya **kasten konmadı**.

- `knowledge/drafting-math-eu38.md` (HIGH güven, Aldrich verified): **"ÖN armscye daha uzun, fark 1.5–2.5cm"**. `docs/G5-OMUZ-PLANI.md` kapı-2 bunu şart yazmış.
- Satın aldığın **Buğra kalıbı 8/8 bedende TERSİNİ ölçüyor**: ön−arka = **−13.50 … −1.22mm** (arka uzun).

Fikstür bu yüzden ön/arka yayı **basıyor, yargılamıyor** — çözülmeden şart yazmak 20–38 saati kanıtsız yöne sürüklerdi.
**ÖLÇÜLMEDİ:** fark landmark atamasından mı geliyor (Locket düğmeli bir ÜST, CF plaketli) yoksa gerçek geometriden mi. Bunu Tur 4'te ölçtürüyorum; sonuç gelince buraya düşecek, ama **hangi kaynağın kural sayılacağı senin hükmün** — Buğra bir REFERANS mı, yoksa kural mı (28 Tem: "Buğra bir REFERANS, kural değil").

#### ÖLÇÜM SONUCU — TUR 4 (2026-08-17) · tam dosya: `knowledge/armscye-on-arka-2026-08-17.md`
Komut: `python3 flatten-research/18-armscye-front-back.py` · kaynak `patterns_real/geometry/geometry-full.json` (PDF vektör) · 0.25mm resample · landmarklar EU38'de `CLAUDE.md` kaydıyla **≤1mm** doğrulandı, 8 bedende köşe sayısı+sırası sabit.

**★ İKİ İDDİA AYNI ŞEYDEN BAHSETMİYOR.** Aldrich tarafı **EĞRİLİK** diyor, Buğra **UZUNLUK** ölçüyor. Buğra 8/8 bedende **ikisini birden** doğruluyor:

| beden | ön oyuk | arka oyuk | fark (ön−arka) | ön omuz | arka omuz | fark (arka−ön) | ön yay/kiriş | arka yay/kiriş |
|---|---|---|---|---|---|---|---|---|
| 34 | 205.17 | 219.00 | **−13.83** | 63.00 | 63.93 | +0.93 | 1.2394 | 1.1764 |
| 36 | 208.92 | 221.39 | **−12.47** | 63.73 | 64.50 | +0.77 | 1.2350 | 1.1767 |
| 38 | 211.00 | 222.46 | **−11.46** | 63.75 | 64.50 | +0.75 | 1.2292 | 1.1749 |
| 40 | 221.86 | 226.49 | **−4.63** | 64.50 | 65.50 | +1.00 | 1.2620 | 1.1734 |
| 42 | 227.23 | 231.24 | **−4.01** | 65.67 | 66.50 | +0.83 | 1.2551 | 1.1707 |
| 44 | 231.97 | 235.20 | **−3.23** | 66.25 | 67.20 | +0.95 | 1.2470 | 1.1676 |
| 46 | 236.13 | 238.69 | **−2.56** | 66.92 | 67.75 | +0.83 | 1.2419 | 1.1654 |
| 48 | 242.50 | 244.00 | **−1.50** | 67.75 | 68.70 | +0.95 | 1.2323 | 1.1610 |

(hepsi mm, **kesim çizgisi** = basılı kontur. Dikiş çizgisi ayrıca ölçüldü, 6/8 aynı işaret; kesim çizgisi birincil. EU38 toplam armhole 433.45mm ≈ kayıtlı 43.30cm.)

1. **ARKA OYUK UZUN, 8/8** (−13.83…−1.50mm). Ama fark bedenle **9 kat küçülüyor** → bu bir kanun değil, Buğra'nın grade'i.
2. **ÖN OYUK DAHA EĞRİ, 8/8** — yay/kiriş ön 1.232–1.262 vs arka 1.161–1.177, bantlar hiç çakışmıyor. Aldrich'in *"ön daha derin/oyuk"* yarısı **DOĞRULANDI**. Çürüyen kısım *"→ dolayısıyla ön daha UZUN"*. İkisi farklı büyüklük; daha eğri bir yay, daha kısa kiriş üzerinde yine de kısa olabilir. **İkisi de pens-bağışık** (pens kapanınca oyuk kenarı rijit döner; yay da kiriş de korunur).
3. **OMUZ ÇELİŞKİNİN PARÇASI DEĞİL.** 8/8 arka uzun, +0.75…+1.00mm, düz — alan bilgisiyle **aynı yönde** (kürek payı), sadece 6–12mm bandının 6–8 katı altında. Omuz ile oyuk aynı cümlede anılmamalıydı.
4. **PLAKET SEBEP DEĞİL — ölçüldü.** CF/plaket kenarı 8/8 bedende **tam düz** (yay/kiriş ≤1.00008) ve oyuktan yaka (216–240mm) + omuz (63–68mm) ile ayrı. Oyuğun iki ucu da CF'de değil → konturun başka yerindeki uzatma oyuk yayını değiştiremez. Peter Pan yaka ayrı parça, yaka kenarına oturuyor; puf kol gövdenin oyuğuna değmiyor.
5. **★ "Aldrich verified" ETİKETİ HAK EDİLMEMİŞ.** O cümlenin iki kaynağı da onu taşımıyor: Aldrich p.11 bir **ölçü tablosu** sayfası ve dosyanın kendisi *"Armhole ÇEVRESİ Aldrich'te yok"* yazıyor (satır 26); `reports/2026-07-29-endustri-arastirmasi.md` (git'te, diskte yok) içinde `armscye|scye|armhole` geçen **0 satır** var. Dahası dosya **kendi içinde** çelişiyor: Aldrich p.11 sırt genişliği **34.4 > ön 32.4**, ve dosyanın kendi HIGH cap-ease kuralı ease'in **2/3'ünü arkaya** veriyor — ikisi de arka-uzunu gösteriyor.

**AJAN HÜKMÜ (savunulur, menü değil):** §47–49'un **uzunluk** yarısı silinir — Buğra Aldrich'i yendiği için değil, **o cümle Aldrich değil**; kaynaksız bir çıkarım, dosyanın kendi HIGH kalemleriyle çelişiyor, ve tek ölçülmüş gerçek kalıpta 8/8 çürüyor. **Eğrilik** yarısı kalır ve ölçümle terfi eder. **Sayı şart yazılmaz** (referansı kural yapmak olur, 28 Tem kararına aykırı); şart yazılacaksa **işaret** yazılır: `ön_yay ≤ arka_yay` ve `ön_yay/kiriş > arka_yay/kiriş`, büyüklük **REPORTED** kalır. Ölçülen giysi sayısı **1** (corset_bustier strapless, tanık olamaz) — büyüklüğü şart yapmamanın ikinci sebebi bu.

**⚠ YAN BULGU (K9 dışı) — ✅ KAPANDI 17.08 Tur 5, Damla kararı GEREKTİRMEDİ.** `10-seam-walk-real.py` ve `12-notch-zone-walk.py` düzeltildi (budama+miter atıldı, `18`'in nokta-normali ofseti kondu; düz-kenar mandalı + analitik `ΔL=−d·Δθ`, en kötü sapma 0.0138mm; düzeltilmiş `10` ile `18` EU38'de birebir aynı: ön 228.94 / arka 239.40mm). **Zehirlenen üç sayı yeniden ölçüldü:** oyuk 430.4 → **468.33mm**, kapak 425.3 → **446.43mm**, net cap ease −5.0 → **−21.90mm (−4.7%)**; ön koltukaltı artığı −0.1 → **+1.5mm**. Detay `knowledge/seam-line-offset-2026-08-17.md`. ✅ **`13-digitize-multisize.py` de KAPANDI 17.08 Tur 6 (T12)** — aynı yöntem kondu; `13`'ten türemiş **kullanılan** sayı çıkmadı (zehirli alan `stitchMM`, tüketicisi yok; `cutMM`/`notches` 484 kenarda **birebir aynı**, K1 etkilenmedi).

**⚠ YAN BULGU 3 — 6B'YE / DAMLA'YA: `kBugraArmholeMM` 0.46mm kaba örneklemeli (Tur 6, T14).** K1'in bandını üreten `seamgraph.json` **STEP=1.0mm**; aynı kenarın 0.25mm ölçümü EU38'de **433.45mm**, kapıdaki sayı **432.99mm**. 8 bedende fark **−0.33 … +1.40mm**, K1 bandının (40mm) en fazla **%3.5'i**, K2 grade bandı [4.0,14.0] iki hatta da tutuyor. **Kapıya DOKUNULMADI** (6B'nin alanı). Karar: `seamgraph` 0.25mm'ye taşınsın mı (çentik indisleri yeniden türetilir; `12`/`14`/`trace-match` etkilenir) yoksa 0.46mm tolere mi edilsin?

**⚠ YAN BULGU 4 — `patterns_real/BUGRA-DEFTER.md` YANLIŞ, telifli dizinde olduğu için oraya yazılmadı.** Defter kolu *"yatay 2'ye bölünmüş"* sayıyor ve motorun eksiğini *"set-in sleeve'i yatay böl"* diye yazıyor. Ölçüm çürüttü: **iki parça da TAM bir kapak taşıyor** ve kapak sagitta oranı Upper/Lower 8 bedende **bit-sabit 1.227** (kiriş oranı 1.549→1.347 değişiyor) → **iki KATMAN** (dış büzgülü puf), yatay bölünme değil. Motorun gerçek eksiği **büzgülü üst katman** operatörü. Kanıt: `knowledge/cap-ease-isareti-2026-08-17.md` §2.1.

**⚠ YAN BULGU 2:** *"yan dikiş ön 201.8 vs arka 227.4"* açık işi (CLAUDE.md #2) muhtemelen **K9 ile aynı sınıf hata**: ön yan dikişin İÇİNE büst pensi kesilmiş (EU38'de dikey 97.1mm yutuyor). **Pens kapanmadan ön/arka yan dikiş kıyaslanamaz.** Bu turda pens kapatılıp ölçülmedi → **ÖLÇÜLMEDİ**, ama "kalıpta sapma var" denmez.

**Cevap:**

---

## K10 — BEDEN TABLOSUNDA ÜÇ KIRIK GRADE ADIMI (6B, Tur 6, T13/K6 kökü)

Kaynak: `engine/src/contract.gen.hpp` → `draft.euSizeChart` (sözleşme `contract/tables.json`).
**Ölçülmedi, OKUNDU** — tablo satırlarının kendisi. Bu yüzden koşu kirliliğinden etkilenmiyor.

Beden tablosunu tek taraflı değiştirmek ajanın işi değildir. **Üç kalem, üçü de karar bekliyor:**

**1. EU48 satırı grade'i 1.5 KATINA çıkarıyor.**

| ölçü | EU34→EU46 (6 adımın 6'sı) | **EU46→EU48** |
|---|---|---|
| bust | +4.0 cm | **+6.0 cm** |
| waist | +4.0 cm | **+6.0 cm** |
| hip | +4.0 cm | **+6.0 cm** |
| shoulder (chart) | +0.5 cm | **+1.0 cm** |
| shoulderWidth (`shaperatios.gen.hpp`) | +1.0 cm | +1.0 cm — **kırılmıyor** |

Sonucu ölçüldü: `h10_gate_check` K6 (taşıyıcı yüzey) EU46'da −32.70mm, EU48'de **−57.34mm** —
tek adımda **−24.64mm** sıçrama, diğer altı adımın hepsi −0.34…−9.62mm (commit `15d4495`).
Sebep zinciri: armscye derinliği **büst'ten** grade ediliyor, omuz noktası ise
`shaperatios`'tan geliyor ve o 8 bedende **tam +5.0mm** adımlarla düzgün ilerliyor
(147.3…182.3). EU48'de büst +6cm ile açılınca oyuk derinleşiyor, kapının soru sorduğu omuz
noktası yerinde kalıyor.
**Soru: EU48 satırı kasten mi 1.5 kat (gerçek beden tablolarında büyük bedenlerde olur),
yoksa bir dizgi hatası mı?** Kasıtlıysa kapı bunu bilmeli; değilse tablo düzelmeli.

**2. `neckCM` adımları düzensiz:** 34 · 34.5 · 35 · **36** · 36.5 · 37 · **38** · **39**
→ +0.5, +0.5, **+1.0**, +0.5, +0.5, **+1.0**, **+1.0**.
Bu doğrudan kapıyı vuruyor: K5-çevrenin **ALT SINIRI** `neckGirth`'ün kendisi, yani kapının
tabanı üç bedende iki kat sıçrıyor. K5-çevrenin bedenler arası monoton olmaması bununla
ilişkili olabilir — **ilişki DOĞRULANMADI.**

**3. `backLengthCM` bir adımda HİÇ büyümüyor:** 39.5 · 40 · 40.5 · 41 · 41.5 · 42 · **42** ·
42.5 → EU44→EU46 adımı **0.0 cm**, diğer altı adım +0.5. Dizgi hatası gibi duruyor ama
**DOĞRULANMADI** ve tek taraflı düzeltilmedi.

---

### ★ TUR 7 (7B, T16) — ÜÇ KALEM YENİDEN ÖLÇÜLDÜ, İKİSİNİN SORUSU DEĞİŞTİ

Ölçüm ağacı: HEAD **`1922374`**, `engine/build-7b` Release, ctest **90/91**
(tek kırmızı `h10_gate_check` **44/63**). Tablo yine **okundu**, koşulmadı.

**(1) EU48 "sıçraması" tek bir satır DEĞİL — bir REJİM DEĞİŞİMİ. Kasıtlı olma
ihtimali çok güçlendi.**
6B tablonun yalnız motorun sürdüğü 8 bedenine baktı, orada EU48 son satır olduğu
için sapma tek adım gibi göründü. Sözleşmede **10 beden** var ve üst üste **ÜÇ
adımın üçü de** aynı rejimde:

| adım | bust | waist | hip | shoulder |
|---|---|---|---|---|
| EU34→…→EU46 (6 adım) | +4.0 | +4.0 | +4.0 | +0.5 |
| **EU46→EU48** | **+6.0** | **+6.0** | **+6.0** | **+1.0** |
| **EU48→EU50** | **+6.0** | **+6.0** | **+6.0** | **+1.0** |
| **EU50→EU52** | **+6.0** | **+6.0** | **+6.0** | **+1.0** |

Bir dizgi hatası kendini dört sütunda üst üste üç kez **aynı** tekrar etmez.
Tablo doğduğu gün (`1eafc16`, `engine/src/sizechart.hpp`) bu haldeydi ve o
commit'in tek gerekçesi başlıktaki *"EU (German) convention"* satırı — yazılı
başka kaynak YOK. Alman DOB serisinde 46 üstü adımın 6cm'e çıkması **bu turda
dış kaynağa karşı DOĞRULANMADI**; içeriden gelen kanıt tutarlılıktır, dış
kaynak değil.

**(2) Bu kalemin dayandığı MÜHENDİSLİK BELİRTİSİ BUGÜN YOK.**
Yukarıdaki `15d4495` K6 dizisi bayat (omuz bandı işinden önce ölçülmüş).
`1922374`'te K6 taşıyıcı yüzey **8/8 ok**:

```
+0.17 · +1.69 · +2.91 · +3.73 · +3.98 · −4.28 · −4.67 · −3.33 mm   (kapı >= −5.0)
adımlar: +1.52 +1.22 +0.82 +0.25 −8.26 −0.39 +1.34
```

→ **EU46→EU48 adımı +1.34mm, yani K6 orada İYİLEŞİYOR.** −24.64mm'lik sıçrama
kalmadı. Bugünkü en büyük tek adım **EU42→EU44'te −8.26mm** ve orası grade
rejiminin kırıldığı yer **değil**. Yani "EU48 grade kırığı K6'yı bozuyor"
zinciri **düştü**; EU48 satırının hükmü artık bir mühendislik acili değil,
tablonun kendi doğruluğu meselesidir.

**(3) `backLengthCM`'in tek-hücrelik bir düzeltmesi YOK.**
10 satırlık tam dizi: 39.5 · 40 · 40.5 · 41 · 41.5 · 42 · **42** · 42.5 · 43 · 43.5.
EU46'yı 42.5 yapmak sıfır adımı silmiyor, **EU46→EU48'e taşıyor**. Kusursuz
+0.5/beden için EU46…EU52'nin dördü birden yeniden yazılmalı (42.5 · 43 · 43.5 · 44)
— yani bu bir dizgi düzeltmesi değil, **sütuna kaynak bulma** işi. Uydurulmadı.
⚠ Bu sütun **ölü değil, taşıyıcı**: `bodysurface.cpp:266-267` bel ve büst
seviyesini (`waistZ`, `bustZ`) doğrudan `backLengthMM()`'den kuruyor,
`garment.cpp:699` kol oyuğu derinliğini `backLengthMM()*0.44` yapıyor.
Belirtisi h10 çıktısında görünüyor ama küçük: omuz seviyesi 1382.3 → 1368.4,
adımlar altı kez −2.0 ve **EU44→EU46'da −1.9**.
✅ Alıcıya ULAŞMIYOR: basılan beden tablosu yalnız göğüs/bel/basen taşıyor.

**Damla'ya giden soru sadeleşti — tek soru:**
> Beden tablosu (`contract/tables.json` → `draft.euSizeChart`) 46 üstünde 6cm'e
> geçen Alman serisi mi, yoksa 34–52'nin tamamı 4cm mi olmalı? Ve `backLengthCM`
> sütununun kaynağı ne? Bu iki cevap gelene kadar tabloya dokunulmadı.

**Cevap:**

### [ ] K11 — İki kapı birbirini yiyor: omuz dengesi vs dikiş eşitliği · 2026-08-17
Tur 6'da ölçüldü, uydurulmadı.
- **K4 (omuz dengesi):** arka omuz ön omuzdan uzun olmalı, bant `[+0.5, +12.0]mm` (kürek payı).
- **Dikiş eşitliği kapısı:** birbirine dikilen iki kenar `0.79375mm` içinde eşit olmalı (üretim standardı).

İkisi yalnız **0.5–0.79mm** aralığında aynı anda sağlanabiliyor. Yani aynı anda hem "arka omuz uzun olsun" hem "iki kenar eşit olsun" diyoruz.

Omuz dikişi inşa edilince ölçüldü: dikiş **tek eğri** olunca iki kenar tanım gereği eşitleniyor (−2.336 → **−0.015mm**). Yani `arka > ön` bir **yüzey özelliği DEĞİL**, dikişte **YEDİRME**dir — terzi arka omzu gererek diker. Buğra'nın +0.95…+1.13mm'si tam olarak bu pay.

**Soru:** yedirme **motorun** mu işi (kalıba ayrı uzunluk olarak basılsın, terzi gererek diksin) yoksa **talimatın** mı (kalıpta eşit, kitapçıkta "arka omzu gererek dikin")?
Sen dikeceksin — hangisi elinde çalışır?
**Cevap:**

### [ ] K12 — Buğra'nın kolu yatay bölünmüş DEĞİL, iki KATMAN · motorun eksik operatörü · 2026-08-17
`patterns_real/BUGRA-DEFTER.md` kolu "yatay ikiye bölünmüş" diye kaydetmiş ve motorun eksiğini "set-in kolu yatay böl" diye yazmış. **Ölçüldü, çürüdü:** iki parça da **tam kapak** taşıyor ve kapak **sagitta oranı 8 bedende bit-sabit 1.227** (kiriş oranı 1.549 → 1.347 kayarken). Bit-sabit oran bölünme değil, **ölçekli kopya** demek.
Yani Upper Sleeve = **dış büzgülü puf katmanı**, Lower = iç astar. Motorun gerçek eksik operatörü **büzgülü overlay katmanı** — H2.3'ün operatör dalgasına giriyor.
`patterns_real/` telifli ve salt-okunur, oradaki satırı düzeltmedim; düzeltme `knowledge/cap-ease-isareti-2026-08-17.md`'de.
**Bu bir bilgi düzeltmesi, senden karar istemiyorum — ama defterin yanlış olduğunu bilmen gerekiyordu.**
**Cevap (gerekmiyorsa kapat):**

### [ ] K13 — Paketin dili: Türkçe mi İngilizce mi? · 2026-08-17
Bugün paket **Türkçe** basıyor ve bu hiç karar verilmedi, sadece öyle yazılmış:
- kesim notu `2 kes · aynali cift` — emsal korpusun karşılığı `cut 2` / `cut 1 pair`
  (`contract/gusto-corpus.json → piece_page_bands.cut_instruction_language`).
- montaj sırası, açıklık uyarısı (`BURAYI DİKMEYİN`), kumaş sayfası — hepsi Türkçe.
- kalıbın üstündeki etiketler de Türkçe.
Satış yüzeyi **Etsy** (HEDEF.md). Etsy'de Türkçe listing satılabilir ama alıcı kitlesi
başka; İngilizce listing + Türkçe paket **tutarsız** olur.
**Soru:** paket hangi dilde basılsın — TR, EN, yoksa ikisi birden mi (iki PDF)?
Bu karar **H1.4'ü (listing metni)** doğrudan bağlıyor ve tek tek sayfa düzeltmekten
ucuz: motorda tek yerden çıkıyor.
**Cevap:**

### [ ] K14 — A1 sayfası basılsın mı? · 2026-08-17
Ölçüldü: koşu bugün **`print-a0.pdf` (1 sayfa) + `print-a4.pdf` (15 sayfa)** basıyor.
`print-a1.pdf` **yok** — `render_tiled` herhangi bir sayfa boyunu alabiliyor, A1 sadece
çağrılmıyor. Şartname §2 "A0/A1 ikisi de üretilebilir" diyor ve bugün "ya A0 ya A1"
okumasıyla geçiyor, yani bu bir kırmızı değil, bir **ürün kararı**.
A1 kimin işine yarar: A0 baskısı olmayan ama A4'ten büyük çıktı alabilen kopyacılar
(TR'de A1 plotter çok yaygın). Maliyeti düşük (bir çağrı + bir PDF).
**Soru:** pakete A1 de girsin mi, yoksa A0 + A4 yeterli mi?
**Cevap:**

### [ ] K15 — 38 tasarımın "kalemi" pinlenecek · İKİ KAPIYI AÇAR · 2026-08-17
Tur 8'in kapı süpürmesi iki testin **boş koştuğunu** buldu ve ikisi de artık dürüstçe kırmızı:
- **`style_check`**: `engine/STYLE-PIN/` diskte **hiç yok**. Test yıllardır `PASS (nothing to enforce)` basıp yeşil görünüyordu — sıfır pin, sıfır hüküm. (Kapının ilan ettiği çıkış yolu `scripts/repin-style.sh` de diskte yok.)
- **`figure_check`**: 31 stilin **7'si** son `else` dalından **koşulsuz OK** alıyordu. Tanık: `dress_bandeau_circle` **0.872** — figürel bandın üstünde (0.84), boxy eşiğinin altında (0.93), iki yasanın da dışında, yine "ok".

**Pin ölçümden gelmez, KARARDAN gelir.** Motor kendi çıktısını pinleyemez (regen-vs-regen yasağı, `DERSLER.md`). Yani bu senin gözün.
**Soru:** 31 stilin render'ına bakıp "kalemim bu" diyeceğin bir tur açayım mı? Açarsam sana PNG kontakt sayfası üretirim, sen seçersin, pin donar ve iki kapı da dışlamadan çıkar.
**Bloke etmiyor** — o güne kadar ikisi `.rabadon/guard.json` → `pushGate._ilan_listesi`'nde gerekçesi ve bitiş şartıyla ilan edildi.
**Cevap:**

### [ ] K13 — Etsy listing dili: Türkçe mi İngilizce mi? · H1.4'ü bağlar · 2026-08-17
Paket bugün Türkçe basıyor: kesim notu `2 kes · aynali cift`, kumaş sayfası, montaj sırası. Emsal korpus (satın aldığımız Etsy kalıpları) İngilizce: `cut 2` / `cut 1 pair`.
Anlam birebir, sözcük değil. Etsy'de satıyorsak alıcı çoğunlukla İngilizce okur.
**Tek dil mi, iki dil mi?** İki dil paketi büyütür ve her sayfayı iki kez doğrulamak gerekir.
**Cevap:**

### [ ] K14 — A1 sayfası üretilsin mi? · 2026-08-17
Bugün yalnız **A0 (1 sayfa)** ve **A4 (15 sayfa)** basılıyor. Kod yolu (`render_tiled`) A1'i destekliyor ama çağrılmıyor.
Şartname "A0/A1 ikisi de üretilebilir" diyor; "ya A0 ya A1" okumasıyla madde geçti, o yüzden **çağırmadım** — bu bir ürün kararı: kopya dükkânlarında A1 A0'dan yaygın ve ucuz.
**Cevap:**

### [ ] K16 — Silinen galeri verisi geri gelsin mi? Dört üreteç onsuz koşamıyor · 2026-08-17 (TUR 12)
`af49514` (29 Tem, *"delete fake pattern gallery"*, 198 dosya / 77386 satır) `web/patterns/` ağacını sildi. O ağaçtaki **iki meta.json dört üretecin tek veri kaynağıydı**:
`gen-collection-pattern.mjs` · `gen-vintage-page.mjs` · `gen-taste-collections.mjs` · `gen-collections-page.mjs` — **dördü de bugün koşturuldu, dördü de `ENOENT` ile exit 1.**
Çıktıları **canlı ve linkli**: `collection-60s70s.html` → HTTP 200, `collections/babydoll.html` → 200, ikisi de `web/index.html`'den linkli, 23'ü sitemap'te. **Yani site bu sayfaları servis ediyor ama yeniden üretemiyor.**
**SİLMEDİM** (kanıt canlı olduklarını söylüyor) ve **"elle bakımlı" İLAN ETMEDİM** (veri tek komutla geri geliyor: `git show af49514^:web/patterns/vintage6070/meta.json` — okunabilirliği doğrulandı; "elle bakımlı" demek kapı boyamak olurdu). `guard.json` kuralı **gevşetilmedi, sıkılaştırıldı**.
⚠ **Ama geri getirmek tek başına yetmiyor, ve bir yarısı ZARARLI:** `web/patterns/svg/meta.json`'ı geri koymak `gen-style-pages.mjs`'in sitemap'ine **silinmiş galerinin 22 URL'sini geri enjekte eder** (ölçüldü). `vintage6070/meta.json` ise yalnız canlı sayfaları besliyor, geri gelmesi güvenli.
**Soru: `vintage6070/meta.json` geri gelsin mi (üreteçler koşar, sayfalar yeniden üretilebilir olur), yoksa bu dört sayfa ailesi tamamen kalksın mı?** İkincisi site'den canlı+linkli sayfa götürür, o yüzden tek başıma yapmadım. Restore ~1–2 saat (SVG bağımlılığı ayrıca ölçülmeli).
**Cevap:**

### [ ] K17 — Sitemap iki ayrı üreteçten çıkıyor ve İKİSİ DE YANLIŞ · 2026-08-17 (TUR 12)
"İki doğru bırakılmaz" ihlali, canlı SEO yüzeyinde:
- `web/gen-sitemap.py` — `scripts/deploy.sh`'in koştuğu. `SKIP_DIRS`'ünde **`styles`** var → **canlı 24 stil sayfasını hiç indexlemiyor.**
- `engine/tools/gen-style-pages.mjs` — `web/sitemap.xml`'i de yazıyor. Stil sayfalarını koyuyor ama `signature.html`'i (canlı, 200) **düşürüyor**.
**Bugün ağaçtaki `sitemap.xml` 2026-07-28 tarihli**, yani `af49514`'ten BİR GÜN ÖNCESİNDEN, ve o günden beri hiç yenilenmemiş. Sonucu: **22 `/patterns/*` URL'sini Google'a hâlâ bildiriyor ve hepsi 404** (`/patterns/yoke-doll-dress.html` → doğrulandı **404**), **24 canlı `/styles/*` sayfası ise sitemap'te hiç yok.**
**Hangisi kanonik olsun?** Tek üretece indirmek gerek; ikisini de kendi başıma seçmedim çünkü ikisi de bugünkü ağacı doğru anlatmıyor. ~1 saat.
**Cevap:**

### [ ] K18 — Sitede 187 kırık iç link var (silinen galeriye) · 2026-08-17 (TUR 12)
`web/` ağacında **187 adet `href=".../patterns/..."`** duruyor ve `web/patterns/` **yok**. Paylaşılan header'da olduğu için **`web/index.html` dahil neredeyse her sayfada**: `collections/babydoll.html` tek başına 17, `collections/retro-dresses.html` 17, 61 patch sayfasının her birinde 1.
Görseller etkilenmiyor (SVG'ler sayfaların içine gömülü, 16 adet inline), **kırılan gezinme**. Bu, K16'nın dört üretecinden bağımsız ve ondan büyük: üreteçler onarılsa bile bu linkler geri gelir, çünkü şablonların içinde yazılı.
**Bu Damla'nın yüzü** — silmedim, elle de düzeltmedim (guard: üreteci değiştir). ~2 saat, ama önce K16 kararı gerek.
**Cevap:**

### [ ] K19 — Uyuyan 16 alet: silinmedi, envanteri çıkarıldı · 2026-08-17 (TUR 12)
11B'nin listesi, **hiçbiri silinmedi**, her biri tek satır — *ne yapıyor · neden uyuyor · uyandırmaya değer mi*:
`accuracy-benchmark.cpp` (kalıp doğruluk kıyası · CMakeLists'te YOK, hiç derlenmiyor · **DEĞER** — H1.0 kırmızısına sayı üretebilir) · `vocab-sweep.cpp` (sözlük süpürme · CMakeLists'te YOK · deploy.sh motor-kanıt setinde ADI GEÇİYOR ama koşamaz, **DEĞER**) · `one-figure-lint.mjs` (tek-figür render denetimi · figür hattı 3.30'da kaldırıldı · hayır) · `bugra/bugra-parity.mjs` (Buğra landmark paritesi · `patterns_real` yolu · **DEĞER**, K1'in tanığı) · `render-grade-nest.mjs` (8-beden nest render · nestpack.py devraldı · hayır) · `komuta.mjs` (vardiya komuta paneli · rabadon devraldı · hayır) · `collect.mjs` (foto toplama · `collect.config.example.json` var, gerçeği yok · hayır) · `emsal-crop.py` (emsal PDF kırpma · girdi PDF'leri diskte yok, H1.1c ile aynı kök · **ŞARTLI**) · `vision-probe.mjs` (görsel LLM sondası · wrapper sınıfı · hayır) · `virtual-sew.js` (tarayıcıda sanal dikiş · walk.py devraldı ve hüküm veriyor · hayır) · `gen-gore-grid/contact.mjs` + `gen-wrap-grid/contact.mjs` (gore/wrap kontakt sayfaları · vitrin hattı, ürün değil · hayır) · `flat-metre/` alt ağacı (flat ölçüm defteri · preview-truth devraldı · hayır).
**Özet: 16'nın 3'ü uyandırmaya değer** (`accuracy-benchmark`, `vocab-sweep`, `bugra-parity`), 1'i şartlı, 12'si halefi olduğu için uyuyor. **Silme kararı Damla'nın; ben yalnız envanter çıkardım.**
**Cevap:**

---

## KAPANDI

_(henüz yok)_
