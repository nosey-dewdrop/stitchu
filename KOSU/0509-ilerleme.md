# 0509 koşusu — ilerleme (11.3; koşunun tek ilerleme görünümü)

| tarih-saat | adım | durum | commit | saat | tek cümle |
|---|---|---|---|---|---|
| 2026-09-05 gece | A1a koşucu | HAZIR | 1 | — | `KOSU/0509-kosu.js` yazıldı; syntax OK (AsyncFunction parse), kuru koşu 0 ajan çağrısıyla A1b→A12 sırasını bastı; işçi brief'i adım başına 647-878 kelime, hakem 279, karar 131; A9 `args.satarim` olmadan PROVA-BEKLIYOR'da durdu (beklenen). Sıradaki: Damla "başla" → `Workflow scriptPath=KOSU/0509-kosu.js` → A1b. |
| 2026-09-06 | A1a koşucu v2 | HAZIR | 1 | — | Akış v2 işlendi (referans kilidi, ivme, A2a/b, A6a-e, güvenli taban, devir notu); kuru koşu syntax OK, 0 ajan; işçi brief 650-1008 kelime. Sıradaki: Damla "başla". |
| 2026-09-06 | A1a koşucu v2.1 | HAZIR | 1 | — | Dört çelişki kapandı (13.19): ölçek çözücüde sert kısıt, kapi.sh stdout yalnız JSON, locality etkilenen küme ilanı, grafdogrula/solver_utils kilitte. Kuru koşu syntax OK. |
| 2026-09-06 | A1a koşucu v2.2 | HAZIR | 1 | — | En kötü senaryo taraması (13.20): resume yükleme, tag -f, bütçe sayacı, uygula sonrası kilit, tur bütçesi, dosya bazlı kilit, A1b/c ve A2a/b/c bölünmesi, ucuz metrik, regresyon tabanı, DEVAM şartı, hakem tavanı, kilit açma, satmam yolu; anahtar yok → işçi okuması + önbellek. Kuru koşu syntax OK. |
| 2026-09-06 | A1a koşucu v2.3 | HAZIR | 1 | — | 11 yama: regresyon Day-0 tabanı, kapi.sh boş değişken/CRASH, locality float toleransı, derleme çukuru ayrı bütçe, ERR_UNSOLVABLE yönü, kapı yokluğu yeşil, ivme yalnız sayısal, etkilenen küme C++ BFS, A9 Chrome 300 s, açık soru denemesi yakmaz, aynı-insan A5'te yumuşak. Kuru koşu syntax OK, brief 1032-1449 kelime. |
| 2026-09-06 | numaralandırma + oturum planı | HAZIR | 1 | — | Adımlar A1-A12 oldu (bölüm numarasıyla karışıyordu). Koşucu `args.sadece="A1,A2"` ile yalnız o adımları koşup DURUR; atlama yasağı: açılan adımdan öncekiler state.json'da GEÇTİ değilse başlamaz. Oturum planı belgede §4 tablosunda. |
| 2026-09-06 02:20 | A1 | BASLADI | 1 | — | Gecit A1: kapi.sh yok (A1a), taban cpp.dallanma=436 olcuLdu, referans kilidi chmod ile kuruldu, tag adim-A1-once ileri tasindi. |
| 2026-09-06 03:10 | A1a | GECTI | 4 | 0.8 | `engine/tests/0509-kapi.sh` yazıldı: 15 geçitlik tek deterministik script, stdout yalnız JSON (alt süreç çıktısı `KOSU/0509-kapi.log`'a), exit 0/1/3, kendi çıktısını json.tool ile doğruluyor. Bugün 2 kırmızı (flat_ayni_insan_check, sinyal_tam — ikisi de A1a öncesinden), 4 henüz-yok (A1b kurar). Kilit ölçüldü: 210 dosya salt-okunur, dizinler yazılabilir. CRASH sözleşmesi segfault eden alt süreçle, ilkYeşil terfisi state.json'a yazıp doğrulandı. Görsel: `KOSU/ciktilar/0509-kapi/gecit-tablosu.png`. |
| 2026-09-06 03:50 | A1a karar | UYGULANDI | 1 | — | Karar ajanının 3 hükmü uygulandı: (1) `flat_ayni_insan_check` KIRMIZI kalır, `state.json` devredilen[] ilanlı kırmızı, tavan 34, pin A4 kapanışında kalkar; (2) `sinyal_tam/bundle_fresh_check` ilanlı kırmızı, kırmızı alt test kümesi donduruldu, kapanacak adım A9, `--kisa`'ya girmez; (3) `engine/CMakeLists.txt` kilide alınmaz ama `--kilit-diff` alanına + satır-yönü denetimine girer (silinen `add_test(`/`add_executable(` = KILIT_IHLALI) — uygulama A1b teslimi, koşucu A1 tarifine madde 11 olarak yazıldı. A1a GEÇTİ, A1b AÇIK. |
| 2026-09-06 04:15 | A1a karar | ARAC ONARIMI | 1 | — | `sinyal_tam` sayımı düzeltildi (8.3, eşik gevşetme DEĞİL): kapı düz `grep -c 'KIRMIZI'` sayıyordu, sinyal.sh bölüm 6 `KOSU/0509-ilerleme.md` satırlarını aynen bastığı için içinde "KIRMIZI" geçen bir ilerleme satırı sayıyı sahte yükseltiyordu (bugün 2 -> 3, yeni kırmızı yoktu). Sayım artık sinyal.sh'ın kendi işaretçi biçimine bağlı (`^  KIRMIZI <ad>`, sinyal.sh:203) ve kırmızı ADLARI JSON'a yazılıyor — karar 2(a)'nın dondurulmuş alt küme şartı böylece denetlenebilir. Gerçek tek kırmızı `bundle_fresh_check` (ctest #8) olarak doğrulandı. |
| 2026-09-06 05:15 | A1a tur 2 | GECTI | 1 | 0.4 | Hakem hükmü kapatıldı: referans kilidi ihlaliyle geri alınan 4 dosya `ctest kapi_sozlesme_check`'i ve `state.json` kabul komutlarını boşa düşürmüştü. Kabul komutu artık AYRI DOSYA DEĞİL — `bash engine/tests/0509-kapi.sh --kendi-check` (izin listesindeki dosyanın modu), 16 hüküm / 0 kırmızı / exit 0; `add_test` silinmedi, hedefi değişti. Karar 3 de burada indi: `izlenen_yollar()` CMakeLists'i izliyor, `cmake_satir_yonu()` silinen `add_test(` satırını KILIT_IHLALI basıyor (H13/H14/H15 ölçüyor). Tam koşu: 15 geçit, 2 kırmızı (ikisi de ilanlı), yeni kırmızı yok, stderr 0 bayt. Görsel tazelendi: `KOSU/ciktilar/0509-kapi/gecit-tablosu.png`. |
| 2026-09-06 05:45 | A1a karar (4 hüküm) | UYGULANDI | 1 | — | Karar ajanının 4 hükmü indirildi. **(1) DEVAM** — `A1a=GECTI`, `A1b=ACIK`; açık ENGEL'ler adıyla `state.json.acikEngeller[]`'e yazıldı: `flat_ayni_insan_check`(34)→A4, `sinyal_tam/bundle_fresh_check`(1)→A9, `emsal_mm_olcum`/`olcek_check`/`wasm_sanity`/`regresyon`→A1b; adsız engel yok. **(2) Geçit tablosu üreticisi (b)** — `KOSU/0509-kapi-tablo.py`, commit'li, girdisi tam koşunun JSON'u (uydurma sayı yok; girdi bozuksa exit 2 ve eski png TAZELENMEZ). `kapi.sh` modu (a) ve elle (c) reddedildi: kapı koşunun sözleşmesidir, hüküm basar resim çizmez; elle tazelenen görsel sessizce bayatlar. **(3) H17 sızıntı taraması** ve **(4) `add_test` HEDEF değişimi = KILIT_IHLALI (ilana tabi)** A1b'ye devredildi ve karar defterine ilan edildi; 97559b95'in hedef değişikliği geriye dönük ilan edilmiş sayıldı (eski→yeni hedef + sebep defterde). Kabul komutu yeni state ile yeşil: 16 hüküm, 0 kırmızı, exit 0. Görsel: `KOSU/ciktilar/0509-kapi/gecit-tablosu.png` (üreticiden). |

## A1b — emsal + regresyon + wasm + önbellek (6 Eyl 2026)

Dört "henüz-yok" geçidin ÜÇÜ ölçmeye başladı, biri dürüstçe henüz-yok kaldı.

- `emsal_mm_olcum` **YEŞİL** 0.693 / 2 mm — eşik `contract/flat-convention-v1.json`
  `/croquis/toleranceMM` (açık yol; alt dize taraması kaldırıldı).
- `regresyon` **YEŞİL** 0 fark — 8 girdi, 5 topoloji, 7'si koşuyor; K2 kendi
  ilan edilmiş kök sebebiyle düşüyor, sessizce atlanmıyor.
- `wasm_sanity` **YEŞİL** 0 trap / 0 fark — 512 MB sınırlı worker.
- `olcek_check` **henüz-yok** — aralık contract'a kaynaklı eklendi (395–1335 mm),
  ölçülecek bbox A2'de doğuyor. Sayı uydurulmadı.

Devredilen iki kusur kapandı (birim karışıklığı + elle yazılmış hüküm sayısı).
Karar defterinden H17 (sızıntı taraması, tarayıcı kendi sağlığını ölçüyor) ve
H18 (`add_test` hedef değişimi) uygulandı. Kabul komutu 18 hüküm, 0 kırmızı.

Kalan iki kırmızı İLANLI: `flat_ayni_insan_check` → A4, `sinyal_tam` → A9.

Ölçüm bulgusu: `biba-O1194418-dress-arka.jpg` aslında ÖN yüz (kontrol örneğiyle
doğrulandı: `-arka` konvansiyonu genel olarak doğru, sorun bu çifte özgü).
Brief madde 3(a)'nın istediği ön-arka çifti bugün elimizde YOK.

## A1 GEÇİT KARARI — kararlar uygulandı (6 Eyl 2026)

Karar ajanı beş soruyu cevapladı; bu tur yalnız onları uyguladı, yeni iş açmadı.
**Hüküm: DEVAM — A1b GEÇTİ, A2 AÇIK.**

| # | Karar | Uygulama | Kanıt |
|---|---|---|---|
| 1 | DEVAM; her açık kalem adıyla bir adıma bağlı | `state.json.A1_gecit_karari.1_devam_mi_dur_mu` | taban tazelendi: 9 girdi / 8 koşan / fark 0 |
| 2 | (b) **VE** biba kalır | `F1-mary-quant-on-arka` yeni girdi, `F2-biba-arka-yok` ayrı topoloji | F1 53945 B sha `41a9d361dc66c42c`; F2 sha `97439210fb732d05` (eski F1 ile **bayt aynı**, `diff -q` temiz) |
| 3 | K2/K5 teşhisi güncellenir, not **silinmez** | iki DÜŞEN dosyasının sonuna tarihli blok | K5 `beklenen: CIZER`, K2 `beklenen: DUSER` (değişmedi) |
| 4 | Boşluk **op tablosunda** kapanır, enum büyümez | mary-quant tarifinde `_kayip[]` 5 kalemi adıyla sayıyor | `contract/` enum'una değer EKLENMEDİ |
| 5 | wasm kıyası kabul, **ilan düzeltilir** | geçit JSON'unda `nativeKiyas` alt alanı | `gecitler[wasm_sanity].nativeKiyas` — değer wasm raporundan okunuyor, uydurulmuyor |
| 6 | ivme muafiyeti onaylandı, **A2'den itibaren yok** | `state.json.butce.yerelMinimum` karar gereği olduğu gibi bırakıldı | — |

**Fotoğraf okuması işçinin kendisi (Read aracı), `llmCagri = 0`.**
Mary-quant çiftinin arka yüzü ÖLÇÜLDÜ: ön paçı yok, yaka arka dilimi sırtta,
cep yok, kemer kesintisiz → gerçek arka. Kapsam uyarısı deftere yazıldı:
**16 çiftin 14'ü DOĞRULANMADI**, A2 her yeni çift için `-arka` dosyasını ölçer.

### ⚠ Sorulmamış bulgu — K5 "çiziyor" ama özelliksiz çiziyor

Karar "K5 ÇİZİYOR, tabanı öyle yaz" diyordu. Tabanı yazarken ikinci bir ölçüm çıktı:

- K5'in flat'ı `03-elbise-kolsuz.svg` ile **bayt sayısında aynı** (25663) ve
  yalnız **5 yolda** ayrılıyor (düğüm, siluet mikro-sapması, arka pens boyu
  495.0→535.0, bel dikiş kaçığı 48.168→39.768 mm).
- Rol sayımı: siluet 2, bel-dikişi 4, pens 12, dikiş-izi 12, orta-dikiş 2 —
  **kup/korse rolü 0**. Ekranda da göğüste kup dikişi, sırtta bağcık YOK.
- Yani `cupSeam: horizontal` ve `laceUpBack: corset` **hiç geometri üretmiyor**;
  çizilen şey kolsuz düz elbise. Madde 4 anlamında **sessiz default**, ilan edilmemişti.

Düz bir `beklenen: CIZER` bu kusuru yeşile boyardı. Beklentiye `beklenenKusur`
bağlandı (`kupDikisiGeometrisi: YOK`, `korseBagcikGeometrisi: YOK`); A2/A4 bu
alanları değiştirmek zorunda, yoksa taban sha'sı değişip kusur satırı "YOK"
kalırsa çizim gizlice eskiye dönmüş demektir.

K2 ile K5 farkı "biri çalışıyor biri bozuk" DEĞİL: K2 görünür şekilde düşüyor,
K5 sessizce özelliksiz çiziyor. Sessiz olan daha tehlikelidir.

Görsel: `KOSU/ciktilar/_yerel/0906-karar/0906-karar-kanit.html` (+ 4 png).

### Araç onarımı (8.3) — eşik gevşetme DEĞİL

**H5 `ivme-bool` yanlış kırmızı yaktı.** Kök sebep ölçüldü: hüküm NaN'ı
`assert "nan" not in json.dumps(d).lower()` ile, yani **alt dize taramasıyla**
arıyordu. Karar 6'nın muafiyet gerekçesine yazılan düz Türkçe metinde
"tıka**nan**ın" kelimesi geçtiği için tarama tetiklendi — ortada NaN yoktu.

Bu, A1b'nin devraldığı kusurla **aynı sınıf** hata (eşiği alt dize taramasıyla
aramak; orada `/croquis/toleranceMM` açık yola bağlanmıştı). Aynı sınıf ikinci
kez engellediği için araç onarıldı:

- Kontrol **daraltılmadı, doğru yere bağlandı**: JSON ağacındaki her *sayısal*
  değer `math.isfinite` ile geziliyor (bool'lar hariç, yol adıyla raporlanıyor).
- Ham metinde JSON dışı `NaN`/`Infinity` sabitleri ayrıca sınır-eşleşmeli
  `grep -E` ile aranıyor (python `json` bunları geçerli sayar, tüketiciler için
  bozuktur).

Onarımın **hâlâ ısırdığı kanıtlandı**, üç ölçüm:

| durum | beklenen | sonuç |
|---|---|---|
| `{"seri":{"x":NaN}}` parse edilmiş | yakala | `AssertionError: sonlu olmayan sayi: /seri/x/` |
| ham `NaN` sabiti | yakala | YAKALANDI |
| "tikanmanin degil" düz metni | geç | GEÇTİ |

Yani hüküm eskisinden **daha güçlü**, daha gevşek değil: iki ayrı yoldan gerçek
NaN'ı tutuyor, düz metne artık takılmıyor. `--kendi-check`: 18 hüküm, 0 kırmızı.

### İvme muafiyeti artık ADIYLA ilan ediliyor, adım adına bakmıyor

Karar 6 muafiyeti onayladı ama "A2'den itibaren YOK" dedi. Bunu bulanık ad
eşlemesine bırakmak (adım adında "A1b" aramak) muafiyeti adım yeniden
adlandırılınca sessizce düşürür ya da kaldırır. Bunun yerine:

- `state.json` içinde açık bir `ivmeMuafiyeti` alanı var; **ilan yoksa muafiyet YOK**.
- `--ivme` çıktısı `muafiyet{gecerli, kaynak, ilanEdildi, okunanAdim, gerekce, biter}`
  basıyor. **Hüküm (`yerelMinimum`) DEĞİŞTİRİLMEDİ** — yalnız yanına ne olduğu yazıldı.
- Muafiyet **kendiliğinden bitmiyor**: A2'ye geçen işçi `gecerli: false` yapmak
  zorunda; yapmazsa muafiyet görünür bir yalan olarak orada durur.

## 2026-09-06 — KOŞU DURDU (8.29, bütçe)

A1 geçidi kuruldu (A1a GEÇTİ, A1b GEÇTİ) ama adım bütçesi aşıldı: **26 mantık
commiti** (tavan 12), **9.27 saat** (tavan 5), derleme commiti 0/6. 8.5'e göre bu
bir protokol hatası sinyali, ürün kusuru değil — A1 ürünü değiştirmedi.

Durum `KOSU/0509-state.json` içinde `durum: "DURDU"`. Tam gerekçe, denenen/denenmeyen
ve resume komutu: `KOSU/0509-DURDU.md`. Kilit açık bırakıldı.
2026-09-06 12:15 | A2 | BASLADI (tag adim-A2-once; kapi kosuldu, 4 kabul komutu yesil, ilanli kirmizilar tavanda)
2026-09-06 13:09 | A2 | BASLADI (tag adim-A2a-once; kapi kosuldu, 4 kabul komutu yesil, ilanli 2 kirmizi + kapi_sozlesme_check kilit-kurulu; cpp.dallanma 436=taban, anaSapmaMM 0.693, regresyon fark 0)

## A2a — SOLVER_UTILS (2026-09-06, kapandi)

- `engine/src/solver_utils.{hpp,cpp}`: kisit cozucu iskeleti. Iteratif yay-kutle gevsetmesi;
  YUMUSAK hedefler yay kuvveti, SERT kisitlar (uzunluk esitligi / panel kapaliligi / MUTLAK
  INSAN OLCEGI) her iterasyonda Gauss-Seidel projeksiyonu. Sinirlar `contract/graf-v1.json
  cozucu.gevsetme` (maxIter 400, sureTavaniMS 2000, adimBoyu 0.5, yakinsamaMM 0.05) ve olcek
  `contract/body-v1.json olcekAraligi.giysiYuksekligiMM` [395, 1335]. Kodda sabit yok:
  sozlesmesiz cagri `ERR_SOLVER_NO_CONTRACT` ile ADIYLA reddedilir.
- ASLA ASILI KALMAZ: maxIter VE sureTavaniMS iki bagimsiz tavan. Tavan dolunca yumusak
  hedefler ADIYLA birakilir (`birakilanHedefler[]`), sert kisitlar son bir turla korunur.
- OLCEK SERT: cozucu olcegi bozup dikisi kapatamaz -> `ERR_UNSOLVABLE` (A1'in
  ERR_SCALE_MISMATCH'i ile pinpon yok). Test (6) olcek kisiti acik/kapali ile kanitlar.
- Cozum yoksa: `ERR_UNSOLVABLE` + EN YAKIN COZUM (`noktalar`) + `gevsetilmesiGereken` kisit adi.
- Birim test `engine/tests/0509-solver_check.cpp` (ctest `solver_check`), 32 hukum, GECTI:
  ucgen panel, dortgen panel cifti (dikis uzunluk esitligi), acik halka kapanma, tavan
  davranisi (yumusak birakilir / sert kalir), yakinsama siniri ADIYLA ilan (uzun zincir),
  ERR_UNSOLVABLE, olcek sertligi, bozuk problem, DETERMINIZM (bit-ayni cikti).
- OLCULEN SINIR (gizlenmedi, test 4c): 40 halkalik sert zincirin artigi maxIter x 4 sweep
  icinde 0.05 mm altina INMIYOR (~0.546 mm). Cozucu bunu sessizce gecmez, ERR_UNSOLVABLE
  atar. A2b Halka2B'si panel basina kisa zincirler kurmali.
- Gorsel: `KOSU/ciktilar/graf-ilk/solver-a2a.png` (once/sonra, uc sahne, sayilarla).
- ONARILAN DEVIR: `kapi_sozlesme_check` (H7) kok sebepten kapandi — kilit A2 degil A2a izin
  listesiyle kuruldu. Esik gevsetilmedi.
- `cpp.dallanma` 436 -> 439 -> 436: durum kodu akis degiskeni olmaktan cikarildi (kararDefteri).

## A2a KAPANIS — KARAR AJANI HUKMU UYGULANDI (6 Eyl)

Hukum: **DEVAM.** A2a GECTI, A2b ACIK. Dort karar state.json.kararDefteri'ne tam
metinle (soru + karar + gerekce + uygulandi) yazildi; asagisi ozet ve kanit.

**K1 — H7 esigi acilsin mi / ilanli kirmizi mi?** IKISI DE HAYIR. Esik (<=2) degismedi,
test degistirilmedi. A2b IKI KILIT PENCERESINE bolundu:
- Pencere 1 (topoloji): `--kilit "engine/src/grafdogrula.hpp engine/src/grafdogrula.cpp"`
  — **bu turda KURULDU**: `kilit: 215 dosya salt-okunur, izin listesinden 2 dosya yazilabilir`.
- Pencere 2 (contract): `--kilit "contract/graf-v1.json"` — A2b'nin teslimi, ACILMADI.
Kilitli alan disindaki dosyalar (panelkaynak/grafdegerle/flatsvg/kalipsvg/grafciz-cli/
wasm bindings/backend/KOSU) H7'ye SAYILMAZ; `kilitli_yollar()` onlari dondurmuyor.
Kanit: `bash engine/tests/0509-kapi.sh --kendi-check` -> `OK H7 kilit-kurulu (izin disi
yazilabilir: 2)`, OZET 18 hukum gecti, 0 kirmizi.

**K2 — A2a 11.7 ile yeniden acilsin mi (0.546 mm)?** HAYIR. A2a kapali; cozucu, maxIter,
kIcProjeksiyon degeri ve cozum yontemi A2b'de DEGISTIRILMEZ. Halka2B panel basina KISA
zincir kurar. Yeniden acma SARTI ADIYLA baglandi: A2b gercek taban grafini
(`KOSU/ciktilar/graf-ilk/graf.json`, 5 panel) cozerken ERR_UNSOLVABLE alirsa — hangi panel,
kac halkalik zincir, kac mm artik `KOSU/ciktilar/graf-ilk/dikilebilir.md`'ye ADIYLA yazilir,
adim BITMEDI sayilir, 11.7 o zaman devreye girer. Olcum gelmeden acilmaz.
Kayit: state.json `A2b_pencereler.q2_yenidenAcmaSarti` + `acikEngeller[]` (tur: SARTA BAGLI).

**K3 — kIcProjeksiyon sozlesmeye tasinsin mi?** EVET, ama A2b'nin Pencere 2'sinde, AYNI
COMMIT'te, EKLEME olarak. `cozucu.gevsetme.icProjeksiyon {deger: 4, kaynak: "... DOGRULANMADI ..."}`;
deger 4'ten DEGISMEZ (32 hukumlu test o sayiyla yesil), yalniz YERI degisir. Bu tur kilitli
alana DOKUNMADI. Kabul olcumu state.json kararDefteri'nde yazili:
`python3 -c "...icProjeksiyon['deger']==4 and 'DOGRULANMADI' in kaynak"` + `! grep -q
'constexpr int kIcProjeksiyon' engine/src/solver_utils.cpp`.

**K4 — DEVAM.** A2b kabul sartlari (state.json `A2b_kabulSartlari`): (a) iki pencere, H7
hicbir anda kirmizi degil; (b) contract'a giren her satir EKLEME + commit mesajinda
eklenen/silinen satir sayisi; (c) TESLIM SIRASI: ilk saatte `KOSU/ciktilar/graf-ilk/flat.png`
+ `kalip-36.png` commit'te (kotu de olsa); (d) cozucu/maxIter/kIcProjeksiyon degeri/esik/test
degistirilmez; (e) K3 uygulandi.

Metrik bu turda DEGISMEDI ve degismemeliydi — bu tur urun kodu yazmadi:
`{"commit": "eb69fc3d", "anaSapmaMM": 0.693, "enum": 436, "kirmizi": 0}`.

**KOŞU DURDU (2026-09-06, 8.29).** A2 — İlk geçiş. Bütçe aşıldı: 13 mantık commiti
(tavan 12), 0/6 derleme commiti, 3.05 saat (tavan 5). geçitYeşil=false
(`flat_ayni_insan_check`=1, ilanlı, tavan 34, kapanacak adım A4); kilit ihlali
`engine/src/grafdogrula.cpp`; yerelMinimum=true (anaSapmaMM 0.693->0.693->0.693,
enum 436->436->436). İlerleyen: `olcek_check` 990.00 mm YEŞİL, `sanalDikisMM`
0.00 mm ölçüldü. Ayrıntı: `KOSU/0509-DURDU.md`.
Resume: `Workflow scriptPath=KOSU/0509-kosu.js args={"baslat":"A2"}`.
2026-09-06 16:41 | A2 | BASLADI
2026-09-06 17:21 | A2a | BASLADI (tag adim-A2a-once, kilit kuruldu, kapi exit=1: flat_ayni_insan_check=1 ILANLI + kapi_sozlesme_check=1 ILAN DISI)
