# V4-B — İFADE KAPISI: aynı croquis, FARKLI giysi (+ ratchet onarımı)

Tur 3, SIRALI. Kart: `GECE/KART/V4-B.md`.

---

## 0. RATCHET ONARIMI — KAPANDI (madde 0, diğer her şeyden önce)

**ÖLÇÜLEN.** Komut: `bash engine/tests/vocab_reference_check.sh`
Log: `GECE/log/V4-B.ratchet.txt` (önce/sonra iki çıktı tam olarak orada).

| | taban | önce (af6842c) | sonra (3340cb9) |
|---|---|---|---|
| toplam | 10438 | **10444 (+6)** | **10438 (+0)** |
| `garment` | 1186 | 1190 (+4) | 1186 |
| `peplum` | 335 | 337 (+2) | 335 |
| hüküm | — | **FAIL** | **YEŞİL** |

Artışın 6 satırının 6'sı `engine/tools/flat-board.mjs`'teydi (gecenin tek yeni
kaynak dosyası). Devralınan kırmızı AD kümesi 6'ydı; `vocab_reference_check` 7.
ad olarak eklenmişti = RULES 9.

**TABAN YENİDEN KESİLMEDİ.** Artıran geri alındı, kartın izin verdiği ikinci yol
kullanıldı ("kapalı-liste olmayan bir ifadeye çevir"):
- üretim flat kalemi artık dizinden **DESENLE** bulunuyor
  (`/^render-[a-z0-9]+-flat\.mjs$/`, tek eşleşme şart, değilse yüksek sesle çöker)
  — adı dört kez elle yazılmıyor;
- hücre altındaki aile etiketi **stil anahtarından türetiliyor**, elle yazılmış
  ikinci bir menü kopyası değil (yan fayda: `styles.json`'dan sapamaz).

**Pano çalışmaya devam ediyor:** `node engine/tools/flat-board.mjs` → 2 sayfa ×
5 hücre = **10 hücre**, ve 10 stil SVG'sinin **10'u da V4-C koşusuyla BAYT BAYT
AYNI** (9 stil + `shell-flat-EU38`). Yalnız altyazılar değişti.
Commit **3340cb9**.

⚠ **AYNI TUZAĞA İKİNCİ KEZ DÜŞÜLDÜ VE ÖLÇÜLEREK ÇIKILDI.** Madde 1'in kodu
yazılınca ratchet tekrar kırmızıya döndü (**10456, +18**: `sleeveStyle` +9,
`collarType` +5, `garment` +2, `sleeveCap` +2) — çünkü ratchet **düz metni de
sayıyor** ve yeni yorum satırları eksen adlarını elle yazıyordu. Onarıldı:
yorumlar eksen adını değil işin kendisini anlatıyor ("puf kol", "yaka türü"),
alan adları **tek sabitte** toplandı (`SLEEVE_FIELD`/`COLLAR_FIELD`) ve mevcut
okuma yerleri de o sabite bağlandı. Son durum **YEŞİL**, üstelik sayı **DÜŞTÜ**
(`sleeveStyle` 351→349, `sleeveLength` 274→273). Düşüş tabanı kendiliğinden
güncellemez, `--baseline` çağrılmadı.

---

## 1. İFADE KAPISI — `flat_expresses_spec_check` (YENİ KANAT, YEŞİL)

Dosya: `engine/tests/flat_expresses_spec_check.mjs` · kaydı `engine/CMakeLists.txt`
Koşu: `ctest -R flat_expresses_spec_check` → **Passed 0.05 sec**, 0 FAIL.

### ★ KARTIN VARSAYIMI ÖLÇÜLDÜ VE DÜZELTİLDİ — İKİ AYRI OTORİTE VAR

Kart kapıyı **sicile** (`contract/garment-spec-v2.json`) bağlamayı öneriyordu ve
"sleeve/collarFamily absent ise doğru cevap ADIYLA REDDETMEKTİR" diyordu.
Sicil gerçekten öyle: `sleeve` **absent**, `collarFamily` **absent**,
`gatheredOverlayLayer` **absent**.

**DENENDİ VE ÖLÇÜLDÜ: bu yol yanlıştı.** Reddedip kolu çizmemek
`flat_geometry_sellable_check`'i **KIRMIZIYA** düşürdü (S5/S6: `locket_puff_top`
ve `crew_sleeved_top` için "data-part=sleeve path'i YOK", + "matriste hiç kollu
panel ölçülmedi — kapı boş koştu"). Yani kırmızı AD kümesi 6→7 olacaktı = RULES 9.
**Silme GERİ ALINDI.**

Sebep artık açık ve kayıtlı: **flat'in kanunu sicil değil,
`contract/flat-convention-v1.json`'dur.** Sicil KALIP motorunu
(`surfacepattern.cpp`) tarif eder; flat bir GÖSTERİM çizimidir ve kolunu
`croquis.sleeveLaw`'ın ölçülmüş kanunundan çizer. İkisinin anlaşmazlığı zaten
ayrı bir kapının konusu: `flat_pattern_agree_check`, bu gece **devralınan
kırmızı**. Yani repo bu çelişkiyi zaten biliyor ve zaten kırmızıda tutuyor.

**Hüküm:** ifade gücünü flat kanunu tanımlar; sicil ise boşluğu **ADLANDIRIR**.

### KAPININ ÜÇ ŞARTI

**(A) Kalemin ayırt ettiğini iddia ettiği her kol değeri FARKLI olacak.**
Ölçü sha değil GEOMETRİ (çizen eleman kümesi + kontur uzunluğu), yargı
eşitlik/eşitsizlik — gevşetilecek eşik yok. 10 çiftin 10'u geçiyor:

| sleeveStyle | eleman | kontur |
|---|---|---|
| none | 6 | 1917.76u |
| set | 10 | 2705.08u |
| raglan | 18 | 3497.78u |
| puff | 54 | 2996.36u |
| cap | 10 | 2354.75u |

**(B) Motorun kesemediği her değer `data-engine-gap`'te EKSİK OPERATÖRÜN ADIYLA
geçecek.** Bugün basılan damgalar:
`sleeveStyle=set:sleeve` · `sleeveStyle=puff:sleeve+gatheredOverlayLayer` ·
`sleeveStyle=cap:sleeve` · `sleeveStyle=raglan:unknown` ·
`collarType=1..4:collarFamily`.

**(C) Bugün AYRILAMAYAN eksenler gizlenmiyor, sayıyla raporlanıyor** (kapı değil).

### ÜRETİM TARAFI — İKİ SESSİZ ÇÖKERTME KÖKÜNDEN ONARILDI

Kartın ölçtüğü sha eşitliğinin sebebi kodda görünürdü:

1. **puf** yalnızca `sleeveCap === 2` sayısal alanından okunuyordu, kolun kendi
   ADINDAN değil → "puf kol istiyorum" diyen spec sessizce düz kol alıyordu.
   Bu, `CLAUDE.md`'nin emsalinin birebir tekrarı (*puf kol sessizce düşürüldü,
   2026-07-18*). **Yeni sayı YOK**: çizim dalı zaten vardı ve zaten contract'ın
   ölçülmüş kanununu (`puffHemOverWidestMax = 0.9327`, Buğra Locket EU38 Alt Kol)
   uyguluyordu — eksik olan tek şey dalın ADLA da tetiklenmesiydi.
2. **raglan** hiçbir dalın koşulu değildi → sessizce düz kola düşüyordu. Fark
   **TOPOLOJİK**, sayı gerekmedi: set-in dikiş (omuz ucu → koltukaltı) yerine
   raglan dikişi **yakadan koltukaltına** iniyor. İki uç da croquis'te zaten
   vardı; uydurulmuş sayı eklenmedi.

**GÖRSEL KANIT (RULES invariant 3 — dosya yolu):**
`GECE/log/V4-B.kol/sleeve-none.png` · `sleeve-set.png` · `sleeve-raglan.png` ·
`sleeve-puff.png` · `sleeve-cap.png` (+ aynı adlarla .svg).

### §4.5 MUTASYON KANITI — ZORUNLU, YAPILDI
Log: `GECE/log/V4-B.mutasyon.txt`
- MUTASYON: raglan tekrar set'e eşitlendi + puf tekrar yalnız sayısal alandan
  okundu → **KIRMIZI, 3 FAIL** (`'set' ile 'raglan' AYNI`, `'set' ile 'puff'
  AYNI`, `'raglan' ile 'puff' AYNI`), exit 1.
- GERİ ALINDI → **YEŞİL, 0 FAIL**, exit 0.

---

## 2. ÇİZGİ HİYERARŞİSİ — BEYAN EDİLEN ORANLAR ARTIK OKUNUYOR (YEŞİL)

`flat_convention_check.mjs` içine **3b** kanadı eklendi. `lineClasses.ratios`
diskte duruyordu ama kapı bu alanı **HİÇ OKUMUYORDU** — doğrulanmayan beyan.
Eşik ve künye test BAŞLIĞINDA: **ISO 128-2:2020 md.5.1** izinli kalınlık serisi
(0,13…2 mm, ortak oran 1:√2) + **md.5.2** sapma toleransı **±0,1d** → oran için
en kötü hal nominalin **0.8182×…1.2222×** bandı (%22.22 tavan).

| oran | beyan | tablodan ölçülen | sapma |
|---|---|---|---|
| outline:seam | 1.4286 | 1.4286 | %0.00 |
| seam:mark | 1.4 | 1.4000 | %0.00 |
| outline:mark | 2.0 | 2.0000 | %0.00 |

## 3. DETAY CALLOUT — SAYILDI (bugün 0)

**3c** kanadı. ISO 128-3:2022 md.4.12 üç parçası birlikte aranıyor (kapalı ince
sürekli sınır + tek büyük harf + `HARF (n:1)` ölçek beyanı).
**HAT-2 (üretim kalemi, 8 stil): tek-harf etiketi 0 · ölçek beyanı 0 → callout 0.**
Üretim tarafı bu kartta YAPILMADI (bütçe) → **kuyruk kalemi**, aşağıda.

## 4. HAT-1 RAPOR SATIRI — BASILDI (eşiğe BAĞLANMADI)

**3d** kanadı, kapı değil, kırmızı düşürmez:
- **bel**: croquis 700.0 mm vs kabuk 725.0000 mm → **fark 25.0 mm**
- **göğüs yarı-genişliği**: croquis 219.90 mm vs kabuk 229.56 mm → **fark 9.66 mm**

Croquis beli kanundan türüyor (`waistX 58.3333u × 3.0 × 4`); kabuk sayıları
`GECE/log/V4-K.probe.txt` ve `GECE/V4-K.md` md.214 ölçümünden. İleride yalnız
DÜŞMESİ beklenir.

---

## KIRMIZI AD KÜMESİ — BÜYÜMEDİ (RULES 9)

`GECE/log/V4-B.ctest.after.txt` · 112 test koştu, yeni kapı **#7 Passed**.

| | devralınan (`V4.ctest.before.txt`) | V4-B sonrası |
|---|---|---|
| kırmızı AD | 6 | **6** |
| yeni ad | — | **YOK** |

Küme aynen: `contract_check` · `figure_check` · `flat_artifact_census` ·
`flat_pattern_agree_check` · `sizechart_source_check` · `style_check`.
Kapanan kırmızı YOK.

---

## YAPILAMAYAN (sebebiyle)

1. **Yaka ailesi AYRILMADI.** `collarType` 1/2/3 bugün de **aynı bandı** basıyor
   (kontur 2053.59u, üçü de özdeş; 4 farklı: 2337.96u). Ayırmak üç ayrı yaka
   formunun **ölçülmüş** bir kanununu ister: `contract/flat-convention-v1.json`'da
   yaka kanunu **YOK**, sicilde `collarFamily` **absent**. Kart "sayı uydurma"
   diyor, uydurulmadı. Durum gizlenmedi: kapı (C) bölümünde sayıyla basıyor.
2. **`sleeveStyle: 'straight'` ile `'set'` hâlâ AYNI çizim.** Bu değer sicilde
   yok ama `edit_locality_check` ve `wasm_spec_honesty_check` onu kullanıyor;
   dokunmak kart dışıydı. Kapı bunu da (C)'de basıyor.
3. **Detay callout ÜRETİMİ** yapılmadı (kart §3 bütçe gereği yasakladı).

## KUYRUK KALEMLERİ (V4-D / kuyruk kartı)

- **Detay callout üretimi** — ISO 128-3:2022 md.4.12, mekanik tanım
  `GECE/V4-R.md` §3'te dört maddede yazılı. Bugün 0.
- **Yaka ailesi ayrımı** — önce ÖLÇÜLMÜŞ bir yaka kanunu (peterPan/stand/shirt),
  sonra çizim. Kaynaksız yapılmaz.

## KART DIŞI FARK EDİLEN (dokunulmadı, yazıldı)

1. **`flat_convention_check`'in yasak-boya süzgeci HAM METİN arıyor.**
   `data-pattern-gap` adlı bir ÖZNİTELİK, `fillLaw.forbidden` içindeki
   `"pattern"` (SVG `<pattern>` dolgusu) ile eşleşip kapıyı kırmızıya düşürdü.
   Öznitelik `data-engine-gap` olarak yeniden adlandırıldı, **süzgece
   DOKUNULMADI**. Süzgeç bugün eleman değil metin eşliyor — yanlış pozitif
   üretebilir.
2. **`vocab_reference_check` düz metni saydığı için YORUM YAZMAK kapıyı
   kırabiliyor.** Bu gece iki kez oldu. Kapının kendi başlığı bunu "bilinen
   gürültü, bilerek onarılmadı" diye yazıyor; ama pratik sonucu şu: bir eksen
   adını AÇIKLAMAK için yazmak ile ona REFERANS vermek ayırt edilemiyor.
3. **Sicilde `collar` ekseninin `notched` değeri YOK** (değerler: none ·
   peterPan · stand · shirt), ama kalemin kodu `collarType === 4` için ayrı bir
   peter-pan/hilal yaprağı çiziyor. Sayıdan sicil değerine bir eşleme yazan
   KAYNAK bulunamadı; bu yüzden eşleme uydurulmadı, boşluk doğrudan
   `collarFamily` operatörü adıyla damgalandı. **Sicil DEĞİŞTİRİLMEDİ.**
4. **`flat_geometry_sellable_check` S5/S6 "kapı boş koştu" durumunu FAIL
   sayıyor** — iyi bir tasarım (boş koşan kapı yeşil görünmemeli), başka
   kapılarda emsal olarak kullanılabilir.
5. `ctest` özet satırı "out of 111" diyor ama 112 test koşuyor
   (`112/112 Test #112`). Per-test satırları otoritedir. **DOĞRULANMADI**, sebebi
   aranmadı.
