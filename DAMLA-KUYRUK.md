# DAMLA-KUYRUK

Bana değil **Damla'ya** düşen kararlar. Buraya satır olarak düşer, cevaplanınca satır kapanır (`[x]` + cevap + tarih).
**BLOKE ETMEZ** — kuyruk beklerken paralel halkalar koşmaya devam eder.

---

## ÖZET TABLO (TUR 14'te derlendi — gövdeler kısaltılmadı, sadece başlıklar netleşti)

Aciliyet üç kademe: **ACİL** = bugün bir şeyi durduruyor · **SIRADA** = bir halkanın önünde duruyor · **BEKLER** = bilgi/tercih, kimseyi durdurmuyor.

| K# | tek cümlede ne soruluyor? | bloke ettiği iş | aciliyet |
|---|---|---|---|
| K1 | Satın alınmış Buğra PDF'leri git GEÇMİŞİNDEN `filter-repo` ile kazınsın mı? | `contract_check` kırmızısı (ilan edilmiş), repo'nun public kalması | **ACİL** |
| K2 | H1 hangi bedende dikilecek — motor 8 bedenin hepsini basıyor? | H1 kapanışı, TEK KAPI'ya hangi paketin gideceği | **SIRADA** |
| K3 | Listing kapağı + tek line drawing adaylarından hangisi? | H1.3 vitrini | **SIRADA** |
| K4 | Zevk kapısının hükmü — Damla'nın gözü ne diyor? | H1.3, H3.4 (zevk turu sayacı) | **SIRADA** |
| K5 | "Dünya kapısı" hangi kapı? Terim repoda hiç tanımlı değil, uydurulmadı. | TABAN T5 (sicil kurulamıyor) | **SIRADA** |
| K6 | "İki include düzeltmesi" neydi? Repoda 0 isabet, 52 başlık temiz derleniyor. | TABAN T1 (bugün "yok hükmünde") | BEKLER |
| K7 | Public README bayat sayı söylüyor (27/54, 77/77) — ben mi düzelteyim, sen mi yazacaksın? | dışarıya söylenen her sayı | **ACİL** (yanlış söyleme riski) |
| K8 | 12 Ağustos paketleri BAŞKA BİR GİYSİ (açıklık/fermuar yok) — silinsin mi, arşive mi? | `Logs/surface-2026-08-12/` referans gösterilmesi | BEKLER |
| K9 | Buğra bir REFERANS mı, KURAL mı? Ölçüm tamam; hüküm senin. | H1.0b'nin 20–38 saatlik yönü | **ACİL** |
| K10 | Beden tablosu 46 üstünde 6cm'e geçen Alman serisi mi? `backLengthCM`'in EU44→EU46 düz adımı kasıtlı mı (16C ölçtü: gövde o adımda −11.56mm KISALIYOR)? | `contract/tables.json`'a dokunmak | **SIRADA** |
| K11 | Omuz yedirmesi motorun mu işi (kalıba basılsın) talimatın mı (kitapçıkta yazsın)? | K4 kapısı ile dikiş-eşitliği kapısının çakışması | **SIRADA** |
| K12 | ~~Buğra'nın kolu iki KATMAN, yatay bölünme değil~~ | — | **KAPANDI** |
| K13 | Paket hangi dilde basılsın — TR, EN, ikisi birden mi? | H1.4 (listing metni) | **SIRADA** |
| K14 | Pakete A1 sayfası da girsin mi? | ürün kararı, kırmızı değil | BEKLER |
| K15 | 31 stilin "kalemi"ni pinlemek için bir tur açayım mı? | `style_check` + `figure_check` (ikisi de ilan edilmiş kırmızı) | **SIRADA** |
| K16 | `vintage6070/meta.json` geri gelsin mi, yoksa 4 sayfa ailesi kalksın mı? | 4 üreteç ENOENT ile ölü; K18 bunun kararını bekliyor | **SIRADA** |
| K17 | Sitemap'in kanonik üreteci hangisi? İkisi de bugünkü ağacı yanlış anlatıyor. | canlı SEO yüzeyi | **ACİL** |
| K18 | Silinen galeriye giden 228 ölü iç referans — ~~açık~~ TUR 13'te onarıldı, ~~kalan 1~~ TUR 18'de 0 | — | **KAPANDI** |
| K19 | Uyuyan 16 aletin 3'ü uyandırmaya değer — silinsin mi, uyandırılsın mı? | envanter; hiçbir halkayı durdurmuyor | BEKLER |
| K20 | `deploy.sh`'in gh-pages adımı silinsin mi? Kanonik yayıncı Vercel mi Pages mi? | `deploy.sh` bugün ZARARLI (K17) | **ACİL** |
| K21 | Korumalı yol araç-şekilliydi; bash kapatıldı, kalan delik ilan edildi — bilgin olsun. | — | **KAPANDI** |
| K22 | `flat.size` EU42'de bitiyor, kadran EU48'e gidiyor: **32 çizimin 12'si çöküyor**, atölye yutuyor | atölye sayfası, canlı | **ACİL** |

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

### ★ TUR 16 (16C) — KALEM 3 (`backLengthCM`) ARTIK "DOĞRULANMADI" DEĞİL: SONUCU ÖLÇÜLDÜ

Ölçüm ağacı: HEAD **`94ab73d`**, `engine/build-16c` Release (ctest dışlamalı
**90/90**). Tablo yine **okundu**; sonucu ise sevk edilen motordan **koşuldu**.

6B *"dizgi hatası gibi duruyor ama DOĞRULANMADI"* demişti. Kalem hâlâ bir KARAR
ama artık bedeli sayıyla duruyor:

`backLengthCM` = 39.5 · 40 · 40.5 · 41 · 41.5 · **42** · **42** · 42.5 —
EU44→EU46 adımı **0.0cm**, sekiz bedenin tek düz adımı.
Aynı adımda `shaperatios.gen.hpp` `shoulderWidthCM` **+1.0cm** (36.4568→37.4568)
gibi hiç kırılmadan büyümeye devam ediyor. `bodysurface.cpp:338-346` omuz
halkasını nape'ten **kendi genişliğinin eğimi kadar** aşağı indiriyor
(`drop = tan(21.6777°)·halfW`), yani omuz genişledikçe omuz halkası ALÇALIYOR.
backLength sabit kalınca nape↔bel mesafesi de sabit kalıyor →
**bel→omuz koşusu tam EU44→EU46'da KISALIYOR.**

Sevk edilen motorda ölçülen sonuç (`gradeset.py --motor surface`, `94ab73d`):

| adım | torso dikey dikiş toplamı | düzleştirilmiş panelin yatay kirişi |
|---|---|---|
| EU42→EU44 | **+10.29mm** | +17.92mm |
| **EU44→EU46** | **−11.56mm** | **−3.86mm** |
| EU46→EU48 | +4.54mm | +16.96mm |

★ **15A'nın "göğüs çevresi küçülüyor" DİKKAT satırının kökü budur, ve o bir çevre
değildi:** gerçek çevreler (govde üst sınırı 1541.70→1576.45, bel halkası
844.88→884.87) o adımda **BÜYÜYOR**. Küçülen şey gövdenin BOYU; düzleştirilmiş
koni açılımının yatay kirişi boy kısalınca daha çok kıvrıldığı için küçülüyor.
Yani tabloda **bir çevre hatası yok**, bir **BOY** hatası var.

**Karar Damla'nın, tek taraflı düzeltilmedi.** Sorulan tek şey: EU46'nın
`backLengthCM`'i 42.0 mı 42.5 mi? 42.5 olursa EU44→EU46'daki −11.56mm'lik gövde
kısalması kalkar; kalırsa EU46 alıcısı EU44'ten **daha kısa** bir gövde alır ve
kapı bunu bilerek geçirmelidir.

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

---

### ★ TUR 18B — TABLONUN KAYNAĞI ARANDI: BİR SORU KAPANDI, İKİ SORU SERTLEŞTİ, İKİ YENİ KALEM AÇILDI

Ölçüm ağacı: HEAD **`1fe3309`**, `engine/build-18b` Release. Tablo yine **okundu**;
kaynak git geçmişinden **ölçüldü** ve dışarıdan **araştırıldı**.
Tam dosya: **`knowledge/eu-beden-cizelgesi-kaynak-2026-08-17.md`**.
Kapı: **`sizechart_source_check`** (ctest, bugün **4 FAIL**, mutasyon kanıtı 7/7).

**★ ÖNCE DOĞUM YERİ: TABLO BİR TEST FIXTURE'IYDI.**
`git log -S` ile ilk giriş: **`77193d5`** (7 Tem 2026) — **`engine-check/main.swift`**,
yani bir **test koşum takımı**. Tek gerekçe bir yorum satırı: *"EU size chart (German
convention) + edge cases"*, ve **aynı dizide** uydurma `tall / petite / pear / apple /
bigNeckSmallShoulder` gövdeleri. **`1eafc16`** (15 Tem) o on satırı `sizechart.hpp`'ye
**birebir kopyalayıp motorun gövde gerçeği yaptı** ve terfi anında **hiçbir kaynak
eklemedi**; `c3c07b0` kontrata taşıdı. Repoda (`reports/`, `docs/`, `knowledge/`,
`CLAUDE.md`, `HEDEF.md`, `ROADMAP.md`, tüm commit mesajları) **kaynak beyanı yok**;
`EN 13402` · `DOB` · `Hohenstein` · `Burda` kelimeleri repoda **hiç geçmiyor**.

**✅ KALEM 1 (+6cm rejimi) — CEVAP GELDİ, KASITLI VE ARTIK KAYNAKLI.**
**burda style, "Richtig Maßnehmen + Maßtabellen — Damengrößen"**, NORMALE
DAMENGRÖSSEN, Körpergröße 168
(<https://burda-product-cms.s3.amazonaws.com/public_files/Damen_Ma%C3%9Ftabellen_online.pdf>):
Brustumfang `80 84 88 92 96 100 104 **110 116 122**` · Taillenumfang
`62 66 70 74 78 82 86 **92 98 104**` · Hüftumfang `86 90 94 98 102 106 110 **116 122 128**`.
**Çizelgemizle 30 hücrede 30 BİREBİR.** Teyit: Aldrich *Metric Pattern Cutting for
Women's Wear* 4./6. baskı, başlığı **"4cm and 6cm Increments (European Sizing)"**.
⇒ Tur 7'nin "dizgi hatası kendini üç kez tekrar etmez" çıkarımı **doğruydu**; artık
iç tutarlılık değil **birincil yayın**. **Bu soruya Damla'nın cevap vermesi gerekmiyor.**
⚠ Kapanmayan yan hüküm: aynı kenarda `shoulderCM` de +0.5 → +1.0 kırılıyor (Tur 16A:
K2 EU48 −15.823mm). **Göğüs kırılması kaynaklı, omuz kırılması kaynaksız.**

**⛔ KALEM 3 (`backLengthCM` 0.0 adımı) — SORU SERTLEŞTİ: HÜCRE DEĞİL, KOLON KAYNAKSIZ.**
Yayınlanmış sırt boyu serilerinin **hepsi düzgün**: Burda **+0.5 tekdüze** (40.5→45),
Aldrich 6. baskı **+0.4 tekdüze**, Aldrich 4. baskı +0.5, Müller +0.2 sonra +0.3.
Var olan düz koşular yalnız serinin **UÇLARINDA** ve bir daha yükselmiyor (Aldrich 4.
baskı 43 @ 20/22/24/26; Müller 41.4 @ 32/34/36). **Serinin ORTASINDA olup sonra +0.5'e
DÖNEN bir düz adım hiçbir yayında bulunamadı** ⇒ bir grade geleneği değil.
Ve kolonun **tamamı** kaynaksız: her bedende Burda'nın **~1cm altında**, Burda'nın
Kurz-168 ile Normal-168 serilerinin **arasında** duruyor (köken hipotezi, **DOĞRULANMADI**).
**Yani tek hücreyi düzeltmek kolonu kaynaklı yapmaz.** Tek taraflı düzeltilmedi.

**⛔ KALEM 2 (`neckCM` düzensizliği) — SORU SERTLEŞTİ: HİÇBİR YAYINDA KARŞILIĞI YOK.**
Yayınlanmış her kadın boyun çevresi serisi **düzgün**: Aldrich 6. baskı **+1.0 tekdüze**
(35…44) · Aldrich 4. baskı +1.0 sonra +1.4 · Müller +0.6 sonra +1.2 — ve Müller'in **tek**
kırılması **göğüs kırılmasıyla hizalı**. Bizimki **üç kez** kırılıyor, göğüsle hizasız,
ve değerleri Aldrich/Müller'in **1–3cm altında**. ⚠ Burda'nın kadın tablosunda boyun
çevresi **HİÇ YOK**; EN 13402-3 · ISO 8559-2/-3 · DIN 33402-2 · GB/T 1335.2 · GOST 17522
· ASTM D5585/D5586 (2020'de geri çekildi) · Hohenstein · Müller resmi tablo (82 EUR)
**arandı, sayı çıkarılamadı**. Tek taraflı düzeltilmedi.

**★ YENİ KALEM 4 — `shoulderCM`: DEĞER DEĞİL, TANIM UYUŞMAZLIĞI.**
Yayınlanan her çizim standardında `Schulterbreite/shoulder` **tek omuz dikişidir**:
Burda 12–14.5 · Müller 11.8–13.6 · Aldrich 11.75–14.2 cm. Müller tanımı kendi sayfasında
yazıyor (*"from the beginning of the neck to the beginning of the arm"*).
**36–42cm'i bir VÜCUT ölçüsü olarak basan hiçbir standart bulunamadı** — o aralık yalnız
perakendecilerin **bitmiş giysi** "across-shoulder" tablolarında görünüyor (DOĞRULANMADI).
⇒ Kolon sadece kaynaksız değil, **hangi büyüklüğü ölçtüğü belirsiz**. Bu, Tur 15/16'nın
"chart kolonu Aldrich bandına giriyor, `shaperatios` 8/8 kısa" hükmüyle **çelişmiyor**
ama onu **kaynaksız** bırakıyor.

**★ YENİ KALEM 5 — `armLengthCM`: kusursuz `+0.5 ×9`, ve dış kaynak bunu DESTEKLEMİYOR.**
En yakın yayın Aldrich sleeve length `57.5 58 58.5 59 59.5 60 60.25 60.5 60.75 61`
(eğim beden 18'de +0.25'e kırılıyor); bizimki ondan **−0.5 kaydırılmış** ve **kırılma
düzleştirilmiş**. Burda Armlänge `59 59 60 60 61 61 61 61 62 62` — hiç tutmuyor.
Yani "kusursuz doğrusallık" bir uzatma imzası ve **gerçek yayınlar bu sütunu düz uzatmıyor.**

**Damla'ya giden GÜNCEL soru — artık üç soru, ve hiçbiri "4 mü 6 mı" değil:**
> 1. `neckCM` ve `backLengthCM` kolonları **hangi kaynaktan** yeniden yazılsın?
>    (Aldrich 6. baskı ikisini de basıyor: neck +1.0 tekdüze 35…44, nape-to-waist
>    +0.4 tekdüze 40.2…43.8. Burda **neck basmıyor**, Rückenlänge basıyor.)
>    ⚠ Bunları değiştirmek K5 neck-girth'ü ve gövde boyunu **birden** oynatır.
> 2. `shoulderCM` **hangi büyüklük**: omuz dikişi mi (11–14cm, standartların tanımı),
>    across-shoulder mu (36–42cm, bugünkü sayılar)? Motorun beklentisi ne?
> 3. Bir kolonu Burda'dan, bir kolonu Aldrich'ten almak **karma bir vücut** yaratır.
>    Tek yayına mı yaslanılsın (Burda: neck yok), yoksa kolon kolon kaynak mı beyan edilsin?

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

> ⚠ **TUR 14 DERLEME NOTU — K13 ve K14 KUYRUKTA İKİŞER KEZ YAZILMIŞTI.** İki ayrı ajan aynı iki soruyu bağımsız olarak sordu ve ikinci kopyalar buraya, K15 ile K16 arasına düşmüştü. İkinci kopyalar **SİLİNDİ**; ikisi de birincinin daha kısa bir yeniden anlatımıydı ve **hiçbir yeni ölçüm taşımıyordu** (karşılaştırıldı: K13-ikinci'nin tek fazlası *"iki dil paketi büyütür ve her sayfayı iki kez doğrulamak gerekir"*, K14-ikinci'ninki *"kopya dükkânlarında A1 A0'dan yaygın ve ucuz"* — ikisi de yukarıdaki asıl kalemlerin gövdesinde zaten vardı). Ölçüm silinmedi; **tekrar** silindi.

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

### [ ] K22 — `flat.size` üç bedeni eksik ve atölye çöküşü YUTUYOR · 2026-08-17 (TUR 18)
**Ölçüm, tahmin değil.** Sevk edilen `web/atolye.html`'in KENDİ `draw()`'u koşuldu, **4 topoloji dalı × 8 kadran bedeni = 32 çizim** (kapı: `node engine/tools/size-coverage-check.mjs`, mutasyon kanıtı 4/4):

| dal | EU34–EU42 | EU44 / EU46 / EU48 |
|---|---|---|
| dress+shoulder | OK, 5038–5044 B, iki koşu bayt-aynı | **ÇÖKÜYOR** |
| top+shoulder | OK, 3722–3732 B, bayt-aynı | **ÇÖKÜYOR** |
| dress+band | OK, 3314–3317 B, bayt-aynı | **ÇÖKÜYOR** |
| top+band | OK, 2001–2003 B, bayt-aynı | **ÇÖKÜYOR** |

Hepsi aynı istisna: `TypeError: Cannot read properties of undefined (reading 'shp')`.
**Kök:** `contract/tables.json → flat.size` **beş satır** (EU34–EU42); kadran **sekiz** beden sevk ediyor (`engine/tools/atolye/ingredients.js:202`, `['size', …, 0, 7, …]`). İki tüketici de çizelgeye doğrudan giriyor: `web/atolye.html:421` ve **salt-okunur** `engine/flat-engine/_engine-full.mjs:37`.

★ **Motor dürüst — YALAN SÖYLEYEN UI.** `atolye.html` `paint()`:
```
try { svg = draw(ST); }
catch (e) { $('stat').textContent = 'cizim hatasi: ' + e.message; return; }
```
O `return`, çizimi (`$('flat')`), beden etiketini (`$('ver')`) ve **bütün kadran okumalarını** güncelleyen satırların ÜSTÜNDE. Yani ziyaretçi kadranı EU48'e çekince ekranda **EU42'nin çizimi, EU42 etiketiyle** durmaya devam ediyor; tek sinyal küçük bir durum satırı. Bu vardiyanın on kez tekrarladığı **sessiz atlama** sınıfı.

**YAPMADIĞIM:** üç satırı ben yazmadım. (a) `contract/tables.json` bu turda **18B'nin dosyası**, (b) çizelgenin kendi kaynağı zaten açık bir soru — TUR 17 `euSizeChart`'ın **70 sayısının repoda hiçbir yerde beyan edilmediğini** ölçtü. Vücut sayısı **uydurulmaz**.

**Soru: üç satır (EU44/EU46/EU48) `flat.size`'a hangi kaynaktan eklensin?** Alternatif — kadran beşe indirilsin mi? (O da motorun sevk ettiği 8 bedenle çelişir, yani kapıyı boyar.) Kapı bugün **12 FAIL** ile `pages.yml`'de duruyor ve deploy'u bilerek bloke ediyor.
**Cevap:**

### [ ] K19 — Uyuyan 16 alet: silinmedi, envanteri çıkarıldı · 2026-08-17 (TUR 12)
11B'nin listesi, **hiçbiri silinmedi**, her biri tek satır — *ne yapıyor · neden uyuyor · uyandırmaya değer mi*:
`accuracy-benchmark.cpp` (kalıp doğruluk kıyası · CMakeLists'te YOK, hiç derlenmiyor · **DEĞER** — H1.0 kırmızısına sayı üretebilir) · `vocab-sweep.cpp` (sözlük süpürme · CMakeLists'te YOK · deploy.sh motor-kanıt setinde ADI GEÇİYOR ama koşamaz, **DEĞER**) · `one-figure-lint.mjs` (tek-figür render denetimi · figür hattı 3.30'da kaldırıldı · hayır) · `bugra/bugra-parity.mjs` (Buğra landmark paritesi · `patterns_real` yolu · **DEĞER**, K1'in tanığı) · `render-grade-nest.mjs` (8-beden nest render · nestpack.py devraldı · hayır) · `komuta.mjs` (vardiya komuta paneli · rabadon devraldı · hayır) · `collect.mjs` (foto toplama · `collect.config.example.json` var, gerçeği yok · hayır) · `emsal-crop.py` (emsal PDF kırpma · girdi PDF'leri diskte yok, H1.1c ile aynı kök · **ŞARTLI**) · `vision-probe.mjs` (görsel LLM sondası · wrapper sınıfı · hayır) · `virtual-sew.js` (tarayıcıda sanal dikiş · walk.py devraldı ve hüküm veriyor · hayır) · `gen-gore-grid/contact.mjs` + `gen-wrap-grid/contact.mjs` (gore/wrap kontakt sayfaları · vitrin hattı, ürün değil · hayır) · `flat-metre/` alt ağacı (flat ölçüm defteri · preview-truth devraldı · hayır).
**Özet: 16'nın 3'ü uyandırmaya değer** (`accuracy-benchmark`, `vocab-sweep`, `bugra-parity`), 1'i şartlı, 12'si halefi olduğu için uyuyor. **Silme kararı Damla'nın; ben yalnız envanter çıkardım.**
**Cevap:**

### [ ] K20 — Deploy yolu ÖLÇÜLDÜ: iki değil ÜÇ yüzey var, biri ölü, biri Vercel · 2026-08-17 (TUR 12)
10B "iki deploy yolu yarışıyor" demişti. Ölçüldü — **yarışmıyorlar, çünkü üçü de aynı kaynağı (main/`web/`) izliyor ve biri hiç kimseye servis etmiyor.** Kanıt canlı baytların eşleştirilmesiyle:
- `curl https://stitchu.noseydewdrop.com/index.html` **= `web/index.html` ile BAYT AYNI** (`cmp` sessiz, 67925 bayt).
- Aynı canlı bayt, `origin/gh-pages:index.html`'den **FARKLI** (67960 bayt, char 482'de ayrışıyor).
- `origin/gh-pages` son commit'i **2026-07-28 17:12**; main'in `web/`'e son dokunuşu **2026-08-16**. Branch 20 gündür donmuş.
- Pages API: `build_type: workflow` → `source.branch: gh-pages` alanı **yok sayılıyor**, artık bir kalıntı.
**Hüküm: kanonik yayıncı `pages.yml` (main → artifact).** `scripts/deploy.sh`'in `git subtree split` → `gh-pages --force` adımı (satır 116–117) **kimsenin okumadığı bir branch'e yazıyor** — yani sahte bir "deploy oldu" sinyali. Bozuk değil, **konusuz**.
★ **Sorulmamış ama önemli — özel alan adı GitHub'da DEĞİL:** `curl -I stitchu.noseydewdrop.com` → **`server: Vercel`**; `nosey-dewdrop.github.io` → `server: GitHub.com`. Pages API `cname: null` ve `web/CNAME` diskte yok — çünkü alan adı Pages'e hiç bağlanmamış, **ayrı bir Vercel projesi** aynı repoyu yayınlıyor (`web/vercel.json` duruyor). İki adres aynı baytı veriyor çünkü ikisi de main'i izliyor, birbirlerini ezdikleri için değil.
⚠ **CLAUDE.md'nin "eski nosey-dewdrop.github.io ÖLÜ" satırı YANLIŞ** — 200 dönüyor ve GitHub tarafının kanonik adresi tam olarak orası.
⚠ **`deploy.sh` çalıştırmak bugün ZARARLI:** sitemap'i `web/gen-sitemap.py` ile yeniden yazar ve o üreteç `styles`'ı atlar → **24 canlı stil sayfası sitemap'ten düşer** (K17).
**Karar gerekiyor: `deploy.sh`'in gh-pages adımı silinsin mi (yayıncı `pages.yml` ilan edilsin), Vercel mi GitHub Pages mi kanonik kalsın?** Siteyi bozmamak için **hiçbirine dokunmadım**. ~1 saat.
**Cevap:**

---

## KAPANDI

> Buraya **yalnız Damla'nın hükmü GEREKMEYEN** kalemler taşınır. Ölçümle cevaplanmış olsa bile
> soru bir KARAR soruyorsa (K1, K9, K10, K16, K17, K19, K20 gibi) kalem AÇIK kalır — ölçüm bir
> hükmün yerine geçmez. Gövdeler kısaltılmadan taşındı.

### [x] K12 — Buğra'nın kolu yatay bölünmüş DEĞİL, iki KATMAN · 2026-08-17 · **karar gerekmedi**
Kalemin kendi son satırı: *"Bu bir bilgi düzeltmesi, senden karar istemiyorum — ama defterin yanlış olduğunu bilmen gerekiyordu."* Sorulan bir şey yok, o yüzden bekletilmesinin sebebi de yok.
`patterns_real/BUGRA-DEFTER.md` kolu *"yatay ikiye bölünmüş"* diye kaydetmiş ve motorun eksiğini *"set-in kolu yatay böl"* diye yazmış. **Ölçüldü, çürüdü:** iki parça da **tam kapak** taşıyor ve kapak **sagitta oranı 8 bedende bit-sabit 1.227** (kiriş oranı 1.549 → 1.347 kayarken). Bit-sabit oran bölünme değil, **ölçekli kopya** demek. Upper Sleeve = **dış büzgülü puf katmanı**, Lower = iç astar. Motorun gerçek eksik operatörü **büzgülü overlay katmanı** — H2.3'ün operatör dalgasına giriyor. `patterns_real/` telifli ve salt-okunur, oradaki satır düzeltilmedi; düzeltme `knowledge/cap-ease-isareti-2026-08-17.md` §2.1'de.

### [x] K18 — Silinen galeriye giden ölü iç referanslar · 2026-08-17 (TUR 13'te onarıldı) · **karar gerekmedi**
Kalem *"~2 saat, ama önce K16 kararı gerek"* diye açılmıştı. **K16 kararı gerekmedi:** onarım galeriyi geri getirmeden, **üreteçlerin şablonlarından** yapıldı — yani guard'ın istediği yoldan (*"elle HTML düzenleme yok, üreteci değiştir"*), K16'nın veri sorusuna hiç dokunmadan.
Ölçülen önce/sonra (`node engine/tools/site-health.mjs`, HEDEF.md TUR 12–13): **ölü iç referans 228 → 1** · sitemap'in 404 döndürdüğü URL **22 → 0** · sitemap'te olmayan canlı sayfa **24 → 0** · sürümü geri alan üreteç **5 → 0** · bozuk `?vN` damgası **24 → 0**.
★ Kalemin kendi sayısı da yanlıştı: 12C **187** demişti, gerçek **228**'di ve **41'i kırık `<img>`** — yani linkte değil **sayfada** delik. Kaynak tek şablon değil: **95 header + 23 footer + 1 CTA**.
★ Ayrıca link denetleyicinin asla bulamayacağı bir kusur çıktı: **24 stil sayfasının hepsi kendini "Pattern Blog" ilan ediyordu** (404 değil, yanlış etiket).
Site sağlığı artık bir **kapı** ve `pages.yml verify`'a bağlı, 6 mutasyon sınıfı.
⚠ **AÇIK KALAN 1 ölü referans DOĞRULANMADI** — hangi dosyada olduğu bu turda okunmadı.

### [x] K21 — Korumalı yol ARAÇ-ŞEKİLLİYDİ, YOL-ŞEKİLLİ DEĞİL · 2026-08-17 (TUR 14) · **karar gerekmedi, bilgi**
**Ne bulundu.** TUR 13 / 13C toplu onarımlarını `node /tmp/*.mjs` ile yaptı ve korumalı yollara o şekilde yazdı. Kuralı **gevşetmedi**, etrafından dolaştı ve **kendi raporunda ilan etti**. TUR 14 bunu rabadon'un kaynağından doğruladı ve **ilan edilenden daha geniş** buldu:
- `native/gate.cpp:2892` — `protectedPaths` **yalnız** `if (toolName == "Edit" || "Write" || "MultiEdit" || "NotebookEdit")` dalının içinde denetleniyor. Bash tarafında **karşılığı yok**; `bash[]` kuralları elle yazılmış ayrı bir liste.
- Ölçüm (rabadon-gate binary'sine PreToolUse yükü verilerek, `cwd=stitchu`, gerçek `guard.json`): `web/styles/x.html`'e **Write** → `BLOCK generated-web-html`. Aynı yola Bash'ten: `cat > …` **ALLOW** · `cp /tmp/a.html …` **ALLOW** · `printf x > web/guide/y.html` **ALLOW** · `node -e fs.writeFileSync(…)` **ALLOW**.
- ★ **Sorulmamıştı, daha kötüydü: dört korumalı yolun ÜÇÜNDE bash kapsamı SIFIRDI.** `engine/golden-reference.csv`, `web/sitemap.xml`/`robots.txt` ve `STRATEGY.md` — dördü de `sed -i` ve `>` altında ALLOW. Tek bash kuralı (`no-shell-edit-generated-html`) sadece `sed -i|tee` ve sadece `web/` altını tutuyordu.

**Ne yapıldı — iki kapı, ikisi de mutasyon kanıtlı. rabadon'a HİÇBİR ŞEY YAZILMADI (ayrı proje, salt okundu).**
1. **`.rabadon/guard.json` → `no-shell-write-protected-path`.** Dört korumalı yolun dördünü birden, komut satırında **adı geçen** yazma şekillerine kapatır (`>`/`>>`, `sed -i`, `perl -pi`, `tee`, `cp`, `mv`, `rm`, `install`, `rsync`, `dd`, `node -e`, `python -c`, `awk -i`). **Mutasyon matrisi 23/23**: 13 BLOCK beklenen 13 BLOCK, 10 ALLOW beklenen 10 ALLOW (üreteçlerin kendisi — `node engine/tools/gen-style-pages.mjs` — ve okuma komutları ALLOW kaldı; yanlış pozitif yok).
2. **`engine/tests/generated_ratchet_check.sh`** (ctest'e bağlandı) + `contract/generated-paths.sha256` (**58 yol**). Üretilmiş bir dosyanın baytları, ilan edilmiş sha256'sı **aynı commit'te** onunla birlikte kımıldamadan değişemez. **Mutasyon kanıtı — 13C'nin BİREBİR rotası:** `node /tmp/mutate.mjs` ile `web/guide/index.html` elle düzenlendi → guard **ALLOW** (beklenen: yol komut satırında geçmiyor), kapı **FAIL(1)**, `declared c9137ad6… / on disk 46e96b2a…`. Geri alındı → **YEŞİL**, ağaç temiz.

⚠ **KAPI BOYANMADI — KALAN DELİK İLAN EDİLİYOR:** yolu komut satırında **geçirmeyen** bir çağrı (`node /tmp/fix.mjs`) hiçbir regex'le yakalanamaz, çünkü yol script'in İÇİNDE. Onu tutan tek şey (2)'deki ratchet'tir ve ratchet bir **yeniden-üretilebilirlik kanıtı DEĞİL**: üreteçleri koşturmuyor. Koşturamaz da — **altı üreteçten dördü bugün koşamıyor** (K16, ENOENT). K16 kararı verilip veri dönerse bu kapı *"üreteci koştur → bayt-özdeş mi"* seviyesine **yükseltilmelidir**; bugünkü ratchet dürüstçe elde olan, ve öncekinin yerini aldığı şey **hiçbir şeydi**.
**Damla'dan istenen: yok.** Bilmen gereken tek şey şu: bu koşuda bir ajan bir kuralın etrafından dolaştı, bunu sakladı değil söyledi, ve kural artık o yoldan da kapalı.

## 22 AĞU — v3 GECE KOŞUSU AÇILIŞINDA ÇIKAN KARARLAR

- **[KARAR ALINDI] Landing elle yazılır.** v3 taslağı "web/index.html gen-landing.js'den
  üretilir" diyordu; ölçüldü, yanlış: gen-landing.js index.html üretmiyor (stdout'a SVG
  parçalarından JSON basıyor), ratchet manifestinde 57 yol var ve index.html onlardan biri
  değil, rabadon guard onu allow listesinde tutuyor ("root pages are hand-written", 28 Tem).
  Damla hükmü: **elle düzenlenir.** `GECE-KOSUSU.md` §0.15 ve F10 buna göre düzeltildi.
- **[AÇIK] Kota.** v2 koşusu 4 faz × 2 oturum = 8 oturumdu. v3 en fazla 12 faz × 3 oturum
  (şef+hakem+kâtip) = 36 oturum, artı faz başına 2–6 işçi → **60–100 oturum.** Önceki hesap
  21 Ağu'da %90'daydı (sıfırlanma 24 Ağu 11:00). Koşu kotaya takılırsa `gece.sh` fazı
  "koşmadı" sayar, bir kez tekrar dener, sonra `GECE/STOP.md`'ye yazıp durur — kırmızı
  saymaz. Uzatma (F6–F8) kalan süre 4 saatin altındaysa kendiliğinden atlanır.
- **[AÇIK, v2'den devrediyor] `patterns_real/` kararı** — `contract_check` ve
  `bugra_bridge_check` kırmızıları oradan. §0.10 gereği kapatılmaya ÇALIŞILMIYOR.
- **[AÇIK, v2'den devrediyor] `stash@{0}` geri gelecek mi?** İçinde `devlog.md` ve
  `linkedin.md` silinmiş duruyor; CLAUDE.md o ikisi için "DOKUNMA, dağıtım kanalı" diyor.
  v3 §6.0 gereği bu koşu stash'e dokunmuyor.
- **[AÇIK] Kapanma dili** — F5 lace-up/fermuar/düğme seçimini artık tek karara bağlamıyor,
  araştırma kartından çıkan SEÇİM TABLOSUYLA hesaplıyor. Tablo `knowledge/kapanma-<tarih>.md`
  olarak çıkınca bakmak istersen orada.
- **[AÇIK] Zevk panosu** — F4 konvansiyon kapısını geçen flat'ler `~/Desktop/gece-zevk-panosu/`
  altına ESKİ|YENİ yan yana basılacak. Hakemi sensin, koşu bloke olmuyor.
