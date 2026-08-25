# V9-D — KÂTİP 2 tutanağı: `docs/H1.0-KAPI.md` + `docs/G5-OMUZ-PLANI.md`

Koşu: 2026-08-25 · ağaç `main` (giriş commit'i `33d87f4`) · kapı
`node engine/tests/docs_truth_check.mjs --no-baseline`.
Koda, `contract/`'a, `engine/`'e **DOKUNULMADI** (yalnız okundu); kapı dosyası ve
`docs-truth-baseline.json` **DEĞİŞTİRİLMEDİ**.

---

## 1. ÖNCE → SONRA (yalnız bu iki dosya)

| denetim | ÖNCE | SONRA |
|---|---|---|
| D1 duran iddia | **1** (`docs/H1.0-KAPI.md:16`, kalıp `bitti`) | **0** |
| D2 ölü repo yolu | **1** (`docs/H1.0-KAPI.md:20` → `engine/tests/h10_gate_check.cpp`) | **0** |
| D3 sağlayıcısız sayı | **37** (H1.0 32 · G5 5) | **0** |

Kapının SONRA çıktısı, bu iki dosyayla ilgili bölüm:

```
$ node engine/tests/docs_truth_check.mjs --no-baseline | grep -E "H1.0-KAPI|G5-OMUZ"
(çıktı BOŞ)
```

Aynı koşunun HÜKÜM satırı (ağacın tamamı; V9-C/E/F'in aynı anda çalışan onarımları dâhil):

```
HÜKÜM: YEŞİL — HARD-0 kipi · D1 0 · D2 0 · D3 0
```

Taban kipi, ctest üzerinden:

```
$ ctest --test-dir engine/build -R docs_truth_check --output-on-failure
1/1 Test #116: docs_truth_check .................   Passed    4.62 sec
100% tests passed, 0 tests failed out of 1
```

⚠ D3'ün toplam sayısal satır sayısı **133 → 139** çıktı: sağlayıcı eklemek satır
uzatıyor, dolayısıyla "sayısal satır" sayısı bir sağlık göstergesi değildir
(V9-A §1'in uyarısının aynısı, ters yönden).

---

## 2. ★ EN AĞIR İŞ — `docs/H1.0-KAPI.md`'nin ÜÇ GERÇEKLİĞİ, BUGÜN ÖLÇÜLDÜ

Dosyanın ilk 25 satırı üç ayrı şey söylüyordu. Üçü de aynı anda doğru olamıyor.
Bugün ölçülenler (hepsi kendim koşturdum, çıktılar aynen):

| soru | komut | çıktı |
|---|---|---|
| fikstür kayıtlı mı, koşuyor mu? | `ctest --test-dir engine/build -N` | `Test #103: h10_gate_check (Disabled)` · `Total Tests: 116` |
| kaç test devre dışı? | `ctest --test-dir engine/build -N \| grep -c Disabled` | `1` (116'nın tek devre dışı testi) |
| fikstür dosyası hangisi? | `ls engine/tests/` | `h10_gate_check_LEGACY.cpp` VAR · `h10_gate_check.cpp` **YOK** |
| CMake ne diyor? | `grep -n h10 engine/CMakeLists.txt` | `:745 add_executable(h10_gate_check tests/h10_gate_check_LEGACY.cpp)` · `:748 set_tests_properties(... DISABLED TRUE)` |
| eski koşu dizinleri var mı? | `ls -d engine/build*` | yalnız `engine/build`; `engine/build-h10` ve `engine/build-6b` **YOK** |

**Uzlaştırılan tek gerçeklik** (dosyanın başına yazıldı):
fikstür kayıtlı ama **DISABLED**, yani **kırmızı değil — hiç koşmuyor.**
"Bugün KIRMIZI olması doğrudur ve beklenendir" cümlesi üstü çizilerek bırakıldı ve
altına gerekçesi yazıldı (SESSİZ SİLME YOK). §3 tablosunun ne olduğu da yeniden
adlandırıldı: **bugünün hükmü değil, `15d4495`'teki son koşunun kaydı.**
Kapıyı yeniden etkinleştirmek `HEDEF.md` § YASALAR-1 gereği DAMLA KARARIDIR;
tek taraflı **yapılmadı** ve kapı/eşik/toleransların hiçbirine dokunulmadı.

Dosyanın en başına statü satırı kondu:
**"ÖLÇÜM TUTANAĞI + ŞART TANIMI. Tanımladığı kapı BUGÜN KOŞMUYOR."**

---

## 3. D3 — SAYILAR SİLİNMEDİ, KAYNAĞINA BAĞLANDI

Hiçbir sayı kırpılmadı. Her sağlayıcısız satıra onu basan alet/kanıt yolu eklendi:

| sayı kümesi | bağlandığı sağlayıcı |
|---|---|
| §0 zemin teyitleri (armhole 432.99mm · omuz +0.95…+1.13mm · yaka 350.41mm) | `patterns_real/tools/trace-match.py` |
| Aldrich 40–44cm bandı (H1.0 başlık · G5 kapı 2) | `draft_math_check` + `garment_armhole_check` |
| §3 fikstür tablosu (K1…K9, 8 satır) | tabloya **"basan" sütunu** eklendi: `h10_gate_check` + fikstürün kendi satır adı (`K1 armhole` … `K9 armhole-sign`) |
| §4.1 sapma −9.4…−9.7mm · §4.2 K6 dizisi · §4.3 K5 dizisi · §4.4 kirlenmiş koşu | `h10_gate_check` / `engine/tests/h10_gate_check_LEGACY.cpp` (satır 269 dâhil) |
| §4.2 beden tablosu (bust/waist/hip/shoulder adımları) | tabloya **"okuma" sütunu**: `grep -n STITCHU_CONTRACT_EU_SIZE_CHART engine/src/contract.gen.hpp` |
| §4.2 `shoulderWidth` +1.0cm 7/7 | `grep -n -A9 kBackArcFraction engine/src/shaperatios.gen.hpp` (5. sütun 31.4568 → 38.4568) |
| ön−arka −13.83…−1.50mm (H1.0 §2 · G5 kapı 2) | `flatten-research/18-armscye-front-back.py` + `knowledge/armscye-on-arka-2026-08-17.md` |
| G5 omuz ucu 70.1799u = 210.54mm | `flat_convention_check` + `contract/flat-convention-v1.json` |
| G5 armscye DEPTH 21.0cm · omuz boyu 12.25cm | `draft_math_check`, satır `engine/tests/draft_math_check.mjs:126` |

**Sağlayıcı iddiaları diske vurularak doğrulandı** (uydurma alet adı yok):
`draft_math_check.mjs:126` gerçekten `88: { scye: 21.0, shoulder: 12.25 }` satırını
taşıyor; `contract.gen.hpp`'nin `STITCHU_CONTRACT_EU_SIZE_CHART` satırları EU46→EU48
adımını gerçekten +6/+6/+6/+1.0 basıyor ve `backLengthCM` EU44→EU46'da gerçekten
42 → 42 (0.0) duruyor; `shaperatios.gen.hpp` 5. sütunu gerçekten tam +1.0 adımlıyor;
`h10_gate_check_LEGACY.cpp:269` gerçekten `shoulderPointXMM` + `carryReachXMM` basıyor.

### "BULUNAMADI" diye açıkça yazılanlar (kartın izin verdiği geçerli cevap)

1. **G5 `78.0u` (eski omuz ucu):** "kaynaksız, devralınmış" etiketi KORUNDU ve üstüne
   *"78.0u'yu basan bir alet repoda BULUNAMADI"* yazıldı. Yerine geçen 70.1799u kaynaklı.
2. **G5 `13°` omuz eğimi:** `engine/FORMULAS.md` varsayımı; *"onu basan bir alet repoda
   BULUNAMADI"* yazıldı.
3. **H1.0 §4.3:** −24.41mm'yi açıklayabilecek alet (yaka yayını kolon kolon basan bir
   çıktı) *"repoda BULAMADIM"* diye yazıldı; **DOĞRULANMADI** etiketi korundu.

---

## 4. TAŞINAN / SİLİNEN CÜMLE + GEREKÇE

`docs/archive/`'e taşınan **YOK**. Silinen cümle **YOK**. İki cümle DEĞİŞTİ, ikisi de
gerekçesi yerinde duracak şekilde:

1. `docs/H1.0-KAPI.md:16` — *"iş **bittiğinde**"* → *"iş **tamamlandığında**"*.
   Gerekçe: D1'in `bitti` kalıbı Türkçe çekim ekine ateş ediyor (V9-B §3 zaaf 3).
   Cümlenin ANLAMI değişmedi; eş anlamlı kelimeyle yazıldı, kapı gevşetilmedi.
2. `docs/H1.0-KAPI.md` eski *"Fikstür / Koşan komut"* çifti → §2'deki ölçülmüş bloğa
   dönüştü. Eski dosya adı (`h10_gate_check.cpp`) ve eski koşu dizinleri
   (`engine/build-h10`, `engine/build-6b`) **metinde duruyor**, yanlarında "diskte YOK"
   ilanıyla. Bu, kapının `DECLARED_MISSING_STRONG` sınıfına da girer, yani dürüst
   yokluk kaydı cezalandırılmıyor.
3. *"Bugün KIRMIZI olması doğrudur ve beklenendir"* — **üstü çizildi, silinmedi**,
   altına ölçümle gerekçesi kondu.

---

## 5. YAPILAMAYAN / YARGILANMAYAN

- **Kapı yeniden ETKİNLEŞTİRİLMEDİ.** `DISABLED TRUE`'yu kaldırmak `engine/`'e dokunmaktır
  (kart YASAKLAR) ve ayrıca `HEDEF.md` § YASALAR-1 gereği Damla kararıdır.
- **§3 tablosunun sayıları YENİDEN ÖLÇÜLMEDİ.** Fikstür koşmadığı için ölçülemezdi;
  bu yüzden tablo "bugünün hükmü" olmaktan çıkarılıp `15d4495` kaydı olarak etiketlendi.
  §4.4'ün *"K5/K6 mutlak dizileri yeniden ölçülmeli"* uyarısı **AÇIK duruyor**.
- **Kapının "alet adı var ≠ sayı o aletten çıktı" zaafı bende de geçerli** (V9-B §3 md.1).
  Yukarıda 4 sağlayıcıyı diske vurup doğruladım; §3 tablosunun 8 satırının HER BİRİNİN
  fikstür satır adını tek tek koşarak teyit **edemedim** (fikstür DISABLED).
  Satır adları `docs/H1.0-KAPI.md` §1'in kendi "Ölçen:" satırlarından devralındı.
- **G5'in 1-3. maddeleri hâlâ PLAN** (kod yok); bu tur onlara dokunmadı.

---

## 6. KART DIŞI FARK EDİLEN

1. ★ **AYNI DOSYADA İKİ FARKLI "ön−arka" DİZİSİ VAR ve uzlaşmıyorlar.**
   `docs/H1.0-KAPI.md` §0 zemin tablosu (üreteci `patterns_real/tools/trace-match.py`)
   ön−arka farkını **−13.50 … −1.22mm** okuyor; aynı dosyanın §2'si ve
   `docs/G5-OMUZ-PLANI.md` §Kapılar-2 aynı büyüklüğü **−13.83 … −1.50mm** okuyor
   (üreteci `flatten-research/18-armscye-front-back.py`). Fark uçlarda 0.28–0.33mm.
   İki alet farklı örnekleme adımı kullanıyor olabilir (CLAUDE.md: `12` 1mm, `10`/`18`
   0.25mm) ama bu **DOĞRULANMADI**. Çelişkiyi gizlemedim: her iki diziyi de metne
   koydum ve "UZLAŞTIRILMADI" diye yazdım. Kâtip işi değil, ölçüm işi.
2. **`docs/H1.0-KAPI.md:162` gerçek bir ölü yol taşıyor ve kapı onu KAÇIRIYOR** —
   `reports/2026-07-29-endustri-arastirmasi.md` diskte yok, ama satırdaki *"Aldrich'te
   yok"* ifadesi `DECLARED_MISSING_LOOSE`'u tetikliyor. V9-B §3 md.2 bunu zaten
   yazmış. **DOKUNMADIM**: kapı onu ihlal saymıyor, ve satırın kendi ifadesi
   (o dosyada `armscye|scye|armhole` geçen 0 satır var) artık doğrulanamaz durumda —
   kaynağın kendisi `git 0e67777`'de kalmış.
3. **`engine/build` 84 değil 116 test taşıyor.** `CLAUDE.md`'nin "ctest 84/84
   DOĞRULANDI (16 Ağu)" kaydı bayat: bugün `ctest -N` **Total Tests: 116** basıyor.
   Testleri KOŞTURMADIM (yalnız `-N` listeledim), yani 116'nın kaçının yeşil olduğu
   bu turda **ölçülmedi**.
4. **Kapının `bitti` kalıbı Türkçeye kör.** "bittiğinde/bitirmek/bitiş" hepsi ateş eder.
   Bu turda eş anlamlıyla dolanıldı; ama kapı gevşetilmediği için sonraki kâtipler de
   aynı duvara toslayacak. Kalıcı çözüm kapı sahibinin işi (kelime sınırı `\bbitti\b`
   yetmez, çekim eki gerekiyor) — **önerdim, YAPMADIM.**
5. Bu tur boyunca ağaçta V9-C/E/F'in commit'lenmemiş değişiklikleri vardı
   (`docs/KATMAN-HARITASI.md`, `docs/SATIS-SARTNAMESI.md`, `docs/loop-engineering.md`,
   `docs/archive/mocks/babyblue-stil-1.html`). **Hiçbirine dokunulmadı**; commit yalnız
   `docs/H1.0-KAPI.md`, `docs/G5-OMUZ-PLANI.md`, `GECE/V9-D.md` içerir.
6. **`docs-truth-baseline.json` bayatladı** (V9-B §6 md.4 bunu öngörmüştü): D1/D2 borç
   kalemlerinin satır metinleri artık tutmuyor, D3 tabanı 52 iken ölçüm 0.
   Tabanı yeniden kesmek (`--baseline`) ayrı ve bilinçli bir commit'tir —
   **bu kartın işi değil, YAPMADIM.**
