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

**Cevap:**

---

## KAPANDI

_(henüz yok)_
