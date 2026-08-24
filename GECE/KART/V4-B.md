# KART V4-B — İFADE KAPISI: aynı croquis, FARKLI giysi (+ ratchet onarımı)

ETİKET: SIRALI (tur 3; V4-A'nın dosyalarına yazar, A bitti ve commit'lendi)
SÜRE TAVANI: 90 dk

## NE
Konvansiyon "hepsi aynı manken" demektir, "hepsi aynı çizim" değil. Bugün
kalem üç FARKLI kolu **bayt bayt aynı** çiziyor. Aynılığı zorlayan kapı bu
sessizliği MÜHÜRLÜYOR. Bu kart iki iş yapar: (0) RULES 9 ihlalini onarır,
(1) sessiz çökertmeyi kapıya bağlar.

---

## 0. ★ ÖNCE BU — RULES 9 İHLALİ, ONARILACAK (KAPATMADAN DİĞERİNE GEÇME)

`vocab_reference_check` bu gece KIRMIZI'ya döndü. ÖLÇÜLDÜ:

    bash engine/tests/vocab_reference_check.sh
    taban 10438 -> bugun 10444 (delta +6)
    ARTTI  garment 1186 -> 1190 (+4) · peplum 335 -> 337 (+2)
    HUKUM: FAIL (2 artan, 0 yeni)

Artışın **6 satırının 6'sı** `engine/tools/flat-board.mjs` (bu gece eklenen
tek yeni kaynak dosya). Devralınan kırmızı AD kümesi 6'ydı; bu 7. AD =
RULES 9 ihlali ve fazı düşürür.

**ONARIM YOLU — tek yol: referansı KALDIR.**
`flat-board.mjs` kapalı enum'lara (garment · peplum) yaptığı 6 referansı
kaldır ya da kapalı-liste olmayan bir ifadeye çevir. Pano ÇALIŞMAYA devam
etmeli — `GECE/log/V4-C.pano/board-eski-*.png` yeniden basılıp aynı 10 hücre
çıkmalı.
**TABANI YENİDEN KESME.** V3'te taban bilinçli kesildi ve o gece hüküm şu
oldu: sayıyı düşürmek için metin silmek ARTEFAKT GİZLEMEDİR. Burada tersi
geçerli: sayı ARTTI, artıranı geri al. Kapı yeşile dönene kadar kart kapanmaz.
Kanıt: onarım öncesi/sonrası iki `vocab_reference_check` çıktısı
`GECE/log/V4-B.ratchet.txt`'ye.

---

## 1. İFADE KAPISI — `flat_expresses_spec_check` (yeni kanat)

ÖLÇÜLDÜ (bu kart yeniden ölçmez, doğrular):

    sleeveStyle none  2537 bayt  sha 0b647b4f1df3cfa3
    sleeveStyle set   3495 bayt  sha 70cb9c7881ce0c0a
    sleeveStyle raglan 3495 bayt sha 70cb9c7881ce0c0a   <-- set ile AYNI
    sleeveStyle puff  3495 bayt  sha 70cb9c7881ce0c0a   <-- set ile AYNI
    sleeveStyle cap   3471 bayt  sha a90b71628ae22f13
    collarType 1/2/3  3509 bayt  sha b26b7091834573e7   <-- ÜÇÜ DE AYNI

RULES invariant 1: desteklenmeyen değer sessizce düşürülemez/çökertilemez —
ya ifade edilir ya AÇIKÇA reddedilir. RULES invariant 2: her spec alanı
ROUND-TRIP eder ya da açıkça reddedilir. `CLAUDE.md`'de emsali var
(*sleeveStyle 'puff' silently dropped, 2026-07-18*).

**KAPI ŞARTI:** `contract/garment-spec-v2.json` sicilinde durumu **shipped**
olan her spec alanının her ayrı değeri, aynı taban spec'te **ÖLÇÜLEBİLİR
BİÇİMDE FARKLI** bir flat üretmek zorundadır (sha eşitliği = KIRMIZI).
Sicilde shipped DEĞİLSE kalem o değeri **adıyla REDDETMEK** zorundadır
(sessiz eşitlik değil, açık red).
- Farkın ölçüsü sha değil GEOMETRİ olsun: iki SVG'nin çizen eleman kümesi
  ya da kontur uzunluğu farkı; eşik uydurma — **eşitlik/eşitsizlik** kullan
  (fark > 0), o zaman gevşetilemez de.
- `contract/garment-spec-v2.json` sicilini OKU; `sleeve` ve `collarFamily`
  orada **absent** olabilir. Absent ise doğru cevap kalemin o değeri
  ADIYLA REDDETMESİDİR ve kapı bunu bekler. Sicili sen değiştirme.

**ÜRETİM TARAFI (kartın asıl işi — §4.7: hata bulmak iş değil, ÇÖZÜM
TASARLAMAK iştir).** En az **raglan** ve **puff** kolu gerçekten AYIR:
- `contract/flat-convention-v1.json → croquis.sleeveLaw` zaten puff'ın
  ölçülmüş kanununu taşıyor: `puffHemOverWidestMax = 0.9327` (Buğra Locket
  EU38 Alt Kol'dan ölçüldü) ve `sleeveSharesArmholeEndpoints`. Puff'ı bu
  kanundan çiz — sayı UYDURMA, kanunda yazan sayıyı kullan.
- raglan: omuz dikişi yerine yakadan koltukaltına inen dikiş — TOPOLOJİK
  fark, sayı gerekmez.
- collarType 1/2/3 için de aynı hüküm: ifade et ya da ADIYLA reddet.
- Hangi değeri ifade edemediysen **ADIYLA reddedilsin** ve tutanağa yaz.

**§4.5 MUTASYON KANITI ZORUNLU:** raglan'ı tekrar set'e eşitle → kapı
KIRMIZI; geri al → YEŞİL. İki log `GECE/log/V4-B.mutasyon.txt`'ye.

---

## 2. ÇİZGİ HİYERARŞİSİ: BEYAN EDİLEN ORANLAR OKUNSUN
`contract/flat-convention-v1.json → lineClasses.ratios` (1.4286 / 1.4 / 2.0)
diskte duruyor ama `flat_convention_check.mjs` bu alanı **HİÇ OKUMUYOR** —
doğrulanmayan beyan. Kapı 3. maddesine ekle: ölçülen kalınlık oranları
beyan edilen oranlarla tutuyor mu.
Kaynak: `GECE/V4-R.md` §1 — ISO 128-2:2020 md.5.1 izinli kalınlık serisi
(0,13…2 mm, ortak oran 1:√2) ve md.5.2 sapma toleransı ±0,1d. Repo'nun
2.0/1.4/1.0'ı serinin son üç elemanı. Eşiği ve ISO künyesini test BAŞLIĞINA
yaz (§7.6: kaynaksız eşik kapıya giremez).

## 3. DETAY CALLOUT — bugün SAY, üretimi kart olarak yaz
ÖLÇÜLDÜ: her iki hatta da callout **0**. Kapı bu sayıyı BASSIN (bugün 0).
Mekanik tanım `GECE/V4-R.md` §3'te (ISO 128-3:2022 md.4.12: kapalı ince
sürekli sınır + tek büyük harf + `HARF (n:1)` ölçek beyanı) — SVG'de ne
aranacağı orada dört maddede yazılı. Üretim tarafını bu kartta YAPMA
(bütçe); sayıyı bas ve `GECE/V4-B.md`'ye "V4-D/kuyruk kartı" diye yaz.

## 4. HAT-1 RAPOR SATIRI (eşiğe BAĞLANMAZ)
`GECE/V4-K.md`'nin hükmü: kapı HAT-2'yi yargılar, HAT-1 rapor satırı olarak
girer. Kapı şu iki sayıyı BASSIN, eşiğe bağlamasın:
bel **25.0 mm** (croquis 700.0 vs kabuk 725.0000) · göğüs yarı-genişliği
**9.66 mm** (219.90 vs 229.56). Bu satır iki hattın yakınsamasını ölçülebilir
kılar; ileride yalnız DÜŞMESİ beklenir.

---

## GİRDİ DOSYALARI (isim isim)
YAZARSIN: `engine/tests/flat_convention_check.mjs` ·
`engine/tools/render-garment-flat.mjs` · `engine/tools/flat-board.mjs` ·
`contract/flat-convention-v1.json` · `engine/CMakeLists.txt` (yeni kanat
ayrı test ise kaydı)
OKURSUN: `contract/garment-spec-v2.json` (sicil, DEĞİŞTİRME) ·
`GECE/V4-R.md` · `GECE/V4-K.md` · `GECE/V4-A.md` · `engine/tests/
vocab_reference_check.sh` · ENV.md · RULES.md

## ÇIKTI
- değişen dosyalar + **commit hash** (push et)
- `GECE/V4-B.md` — ÖLÇÜLEN (sayı+komut+hash) · KAPANAN/AÇILAN KIRMIZI ·
  yapılamayan (sebep) · kart dışı fark edilen
- `GECE/log/V4-B.ratchet.txt` · `GECE/log/V4-B.mutasyon.txt` ·
  `GECE/log/V4-B.ctest.after.txt`

## YASAKLAR
- **Kırmızı AD kümesi 6'yı geçemez** (RULES 9). Kontrol:
  `GECE/log/V4.ctest.before.txt`. Geçerse değişikliği GERİ AL, iki logu commit'le.
- `vocab_reference_check` tabanını yeniden KESME (madde 0).
- Mevcut testi gevşetme; eşik düşürerek yeşile boyama = faz düşer.
- Sayı uydurma: puff oranı kanunda YAZILI (0.9327), kendin bir sayı türetme.
- "Buğra'ya benziyor mu" kapısı kurma (§7.3).
- `patterns_real/` PDF'lerine dokunma (§7.2).
- Yeni kaynak dosya AÇMA (§7.5 sayacı bu gece 1/3 kullanıldı; ikinciyi ancak
  yeni kapı AYRI test dosyası gerektiriyorsa aç ve gerekçesini yaz).
