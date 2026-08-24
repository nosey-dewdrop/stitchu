# STITCHU GECE KOŞUSU v5 — Damla'nın sipariş listesi, ölçülmüş zeminle

v4 (`GECE-KOSUSU-v4.md`) yürürlükte kalır: §0 değişmezleri, §C rol mimarisi, §E kapı
protokolü, §M birikme önlemleri aynen geçerli. v5 onun **faz sırasını ve ölçütünü**
değiştirir. Çelişkide v5 kazanır ve çelişen v4 satırı silinir.

Sebep: 22 Ağu gecesi üç ölçüm v4'ün dayandığı üç varsayımı çürüttü (§A).

---

## §A ÜÇ ÇÜRÜYEN VARSAYIM — hepsi bu gece koşturularak ölçüldü

**1. "Buğra'ya ≤%5" bir kapı olamaz.**
`bodice.hpp:36` armholeLength **DİKİŞ** çizgisi; `docs/H1.0-KAPI.md:25` Buğra zemin
tablosu **KESİM** çizgisi. Oyuk içbükey → 10mm iç ofset onu **+34.3…36.2mm uzatır**
(`knowledge/cap-ease-isareti-2026-08-17.md:17`). Aynı temele getirilince açık −%13.8
değil **−%20.3** (EU38). Ama asıl mesele şu: aynı temelde **Buğra'nın kendi dikiş
çizgisi 46.8cm**, Aldrich'in yayınlanmış 40–44cm bandının **üstünde**. Buğra'yı kapı
yapmak, bizi yayınlanmış çapanın dışına iter. `CLAUDE.md` (28 Tem) zaten yazıyordu:
**"Buğra bir REFERANS, kural değil."** Damla 22 Ağu'da tekrarladı: *"gelişmeleri Buğra
üzerinden bakmasın."*

**2. Kol oyuğu kırığı motorda değil, KAYNAKSIZ beden kolonunda.**
`bodice.cpp:642` → `armholeY = min(cap, max(torso, arm))`; torso `backLength`'e, arm
`bust`'a bağlı. `backLengthCM` EU44→EU46'da **duruyor** (42.0→42.0), bust büyümeye
devam ediyor, rejim EU46'da TORSO→ARM'a geçiyor, EU48'de +34.11mm sıçruyor
(diğer adımlar 9–13mm). `backLengthCM`, `sizechart_source_check`'in TUR 18B'den beri
KAYNAKSIZ dediği 4 kolondan biri. **Kolonu uydurup düzeltmek yasak (K10, Damla kararı).**
Derinlik açığın sebebi değil: EU38 scye derinliğimiz 22.54cm, Aldrich'in doğrulanmış
21.0cm'sinden derin. Açık **genişlikte ya da oymada**.

**3. ★ SEVK EDİLEN İKİLİ DÖRT HAFTA BAYAT — bu gecenin en sert bulgusu.**
`web/vendor/stitchu-engine.js` son kez **28 Tem**'de derlendi (`dd30846`). O günden
beri `engine/src`'e **52 commit** girdi. Yani **web'de koşan motor bu ayın hiçbir
düzeltmesini görmüyor.** Kol oyuğunu bu gece düzeltsek sitede değişen hiçbir şey olmaz.
Ayrıca: `surfacepattern.hpp` `engine/src` içinden **sıfır kez** include ediliyor; dört
test (`h10_gate_check`, `surface_pattern_check`, `capability_check`, `wearable_check`)
yalnızca test/tool tarafında yaşayan bir modülü ölçüyor.

---

## §B DAMLA'NIN SİPARİŞİ — 15 madde, hepsi bu koşunun kapsamı

Bunlar yorum değil, sipariş. Her fazın hangi maddeyi kapattığı §D'de yazılı.

1. **Sabah foto + prompt → kalıp + flat.** Kusursuzlaşacak, çünkü üstüne editleme gelecek.
2. **Editleme (Midjourney gibi):** "fiyonk ekle şuraya", uzatma, kısaltma, yaka değiştirme.
3. **Flat tarz sorunu DEĞİL — CS, hesap, matematik işi.** Geometrisi çıkarılabilir.
   *"fal.ai ya da midjourney ekipleri de bir insan."* Çizecek. İstersen zorla.
4. **Sözlük dikiş tarzıyla kurulacak.** `bust/kol/heartneck` gibi MENÜ isimleri değil.
   Valentina/Gerber gibi **ipucu ve mutfak** tutuluyor — "lahmacun" denmiyor.
   Sınırlı malzemeden sınırsız ürün.
5. **Kumaşa göre farklı kalıp.** Aynı spec + farklı kumaş = FARKLI kalıp.
6. **Ürün = kalıp + flat + REHBER.** Püf noktaları, terzilik hesabı. İnsanlar sadece
   kalıp alıp gitmeyecek.
7. **İleride:** üyelik, forum, iOS uygulaması.
8. **"İyi flat yok, öyleyse iyi kalıp da olamaz."** — sıra bunu takip eder.
9. **Flat'lerin hepsi aynı konvansiyonda değil.** Hepsi aynı modelden çıkmış gibi
   olmalı (*"atıyorum Barbara Palvin"*) — tek croquis.
10. **İki ayrı test, karıştırılmaz:**
    flat → mankene göre (gerçek kadından ince) → testi **SATILIR MI, ETSY'LİK Mİ**
    kalıp → insana göre → testi **DİKİLEBİLİRLİK**
    Flat dikilebilirlik testine TABİ DEĞİL.
11. **Zevk ölçütü Buğra değil:** Chanel HC, Bershka/Stradivarius, genz estetiği.
12. **Hata raporlamak iş değil — ÇÖZÜM düşünülecek.** *"hata var deyip geçmesin."*
13. **İnsan vücudu hacimsel cisim.** Modelleme, projeksiyon, integral, fizik.
    *"gerekirse yeni bir motor ekleyebilirsin."*
14. **Endüstriyel düzeye bak.** *"Başkası yapmış biz yapamayız yok. Daha iyisini,
    daha hızlısını yapabiliriz."* Beklenti büyük tutulur; uzun çözüm, kısa
    çözümsüzlükten iyidir.
15. **Fazlar ve fazlar arası kontrol.** Context yorulmayacak.

---

## §C ÖLÇÜT KANUNU — v4 §0.7'nin yerine geçer

**KAPI = yayınlanmış bant.** Kol oyuğu çevresi için Aldrich sanity çapası
40–44cm (`knowledge/drafting-math-eu38.md:38`, MED). Yayında formül yoksa bant
kullanılır ve "formül YOK" açıkça yazılır.

**BUĞRA = parite raporu, kapı DEĞİL.** Buğra sayıları basılmaya devam eder — üst üste
koyma, shape distance, parça-parça fark tablosu — ama hiçbir fazı kırmızı düşürmez.
Rapor başlığı birebir: `PARİTE RAPORU (KAPI DEĞİL)`.

**Bir eşik ancak şu üç kaynaktan gelir:** (a) yayın — ad + baskı + sayfa ya da URL,
(b) Buğra'nın ölçülen zemini — dosya:satır, yalnız **rapor** için, (c) fizik/geometri
zorunluluğu — türetmesi yazılı. Motorun kendi çıktısından eşik türetip onu kendi kapısı
yapmak **dairesel doğrulamadır, yasaktır**.

---

## §D FAZ SIRASI — "iyi flat yok, öyleyse iyi kalıp da olamaz" (§B-8)

```
F-A  BUNDLE          sevk edilen ikili 4 hafta bayat — önce bunu kapat   [§B-1]
F-B  DÜNYA TARAMASI  GarmentCode · Seamly2D · FreeSewing · Gerber · DXF  [§B-4,13,14]
F-C  MUTFAK          sözlük reformu: primitif/bileşen/tarif              [§B-4]
F-D  FLAT            tek croquis + konvansiyon + ölçek beyanı            [§B-8,9]
F-E  ETSY KAPISI     flat satılır mı — Chanel/Bershka/genz ölçütü        [§B-10,11,12]
F-F  KALIP           kol oyuğu + yaka, yayın bandı kapısı                [§B-1]
F-G  DİKİLEBİLİRLİK  kalıp gerçekten dikilir mi, geri projeksiyon        [§B-10,13]
F-H  KUMAŞ + REHBER  kumaş ekseni, püf noktaları                         [§B-5,6]
F-I  GİRİŞ HATTI     foto+prompt → spec, ve spec DIFF (editleme)         [§B-1,2]
F-J  DOCS + LANDING  vitrin, üyelik/forum/iOS vizyon satırı              [§B-7]
```

F-A ilk, çünkü onsuz bütün gecenin işi sitede görünmez.
F-B → F-C sıralı: sözlük reformu dünya taramasının çıktısıyla beslenir.
F-D → F-E sıralı: konvansiyon kurulmadan satılabilirlik yargılanamaz.
F-F → F-G sıralı: kalıp sayıları oturmadan dikilebilirlik ölçülemez.

**Her fazın çıktısı bir sonrakinin girdisi. Her faz commit + push. Yeni kırmızı 0.**

---

## §E ÇÖZÜM ZORUNLULUĞU — §B-12'nin kapıya çevrilmiş hâli

Hiçbir faz "şu bozuk" diyerek kapanamaz. Her kırmızının yanında:
kök sebep · denenen hamle · **ölçülen sonuç** · sonraki aday.
Ölçülüp reddedilen hamle de rapora girer — bilgi silinmez.

"Bulundu ama çözülmedi" meşru bir sonuçtur; "bulundu ve bırakıldı" değildir.

---

## §F KAYNAKSIZ KOLONLAR — Damla'ya düşen, koşuyu bloke etmez

`sizechart_source_check` 4 kolonu KAYNAKSIZ sayıyor: `shoulderCM` `backLengthCM`
`armLengthCM` `neckCM` — 40 sayı, arkasında yayın yok, ve bunlar alıcının vücuduna
basılıyor. `backLengthCM`'in duraklaması kol oyuğu kırığını doğuruyor (§A-2).

Kapının kendi kapanış cümlesi: *"replaced from a named source **by Damla**
(DAMLA-KUYRUK K10)"*. **Ajan beden tablosunu tek taraflı değiştirmez.**
Bu gece yapılacak olan: motorun derinlik tabanını KAYNAKLI bir ölçüye bağlamak
(`bustCM`, SOURCED 3 kolondan biri), böylece kaynaksız kolon taşıyıcı olmaktan çıkar.
Kolonun kendisi Damla'nın kararını beklemeye devam eder.

---

## §G ÜÇ KASITLI KIRMIZI — kodla kapanmaz, Damla'da

| test | neden | kim kapatır |
|---|---|---|
| `contract_check` | *"pdfleri silmicem, satın aldım"* — bilinen bedel, görünür tutuluyor | Damla |
| `style_check` | `engine/STYLE-PIN/` boş; onay ÖLÇÜMDEN değil KARARDAN gelir | Damla (`scripts/repin-style.sh`) |
| `sizechart_source_check` | §F | Damla (K10) |

Bu üçü "yeni kırmızı" sayılmaz ve hiçbir fazı bloke etmez. Ajan bunları yeşile
çevirmeye ÇALIŞMAZ — çevirmeye çalışmak, kapının ölçtüğü bedeli gizlemektir.
