# SONRAKİ SESSION'A PROMPT (bunu olduğu gibi yapıştır)

---

stitchu üzerinde çalışacaksın. Önce `CLAUDE.md`, sonra `ROADMAP.md` oku. Ama **onlara güvenme** — bir önceki session (31 Tem) onları yazdı ve o session **defalarca yanıldı.** Görevin önce hataları bulmak.

## HEDEF (Damla'nın kendi cümlesi)

> **Bir istek promptu verilir → KALIP + FLAT çıkar. Bunlar GİYİLEBİLİR, SATILABİLİR şeylerdir.**
> *"matematiğinin ne kadar kusursuz olduğu umrumda değil."*

## ÖNCEKİ SESSION'IN YAPTIĞI 7 HATA — TEKRARLAMA

1. **Ürün yerine mimari planladı.** Beş saat plan konuşuldu, satılabilir nesne çıkmadı. Damla: *"5 saattir plan konuşuyoruz."*
2. **★ Lahmacun listesini üç kez büyüttü.** Damla ilk mesajından beri şunu söylüyor: *"adamlar süt, un, yağ, yumurta gibi liste tutarak poğaça da yapıyo revani de. biz sadece poğaça ve revani diye liste tutuyoruz."* Önceki session buna "37 alanın her birine varsayılan atayalım" diye cevap verdi — **yani lahmacun listesine varsayılan ekledi.** `engine/vocab.json`'daki `neckline: [crew, scoop, vNeck, square, sweetheart...]` ve `collarType: [none, stand, mock, flat, peterPan, shirt, crescent]` **malzeme değil, yemek.**
3. **Motorun kendi çıktısını kanıt gösterdi.** `skirt.cpp`'yi "etek nasıl olur"un delili sandı. Damla yakaladı: *"kanıtlamaya çalıştığın şeyi kanıt olarak kullanamazsın."*
4. **Kontrol etmeden novelty iddia etti.** "Dikiş uzunluğu eşitliğini kimse sert kısıt olarak çözmüyor" dedi — **YANLIŞ.** parafashion (SIGGRAPH'22, GPL3) ve CLO patenti US 11308707 zaten yapıyor. `CLAUDE.md` bunu zaten uyarmıştı, okumamıştı.
5. **Araştırabileceği şeyi Damla'ya sordu.** Damla: *"araştırsana internette 100 yıllık terzilik kaynağı var."* Sonra araştırıldı ve cevap 10 dakikada çıktı.
6. **Gerçek çıktıya gözüyle bakmadı.** Saatlerce mimari tasarladı, motorun ürettiği SVG'ye hiç bakmadı. Baktığında 13 çizgi olduğunu gördü.
7. **Ajan disiplinini çiğnedi.** Kural max 3-4; 12+ ajan koşturdu.

## ÖLÇÜLDÜ, GÜVENEBİLİRSİN (hepsi doğrulanabilir, yolu verildi)

| Bulgu | Nerede doğrulanır |
|---|---|
| `engine/src/` = **17.693 satır, 43 .cpp**, her biri bir giysi parçası | `wc -l engine/src/*.cpp` |
| Sabitler tek kalıba fit: `chestEase: 0.211032`, `hollowShareFront: 1.07` (kirişin dışı) | `recipes/bugra-locket-top-front-38.json` |
| Motor kol oyuğunu **koltukaltında 24.4°, omuzda 0.0°** çıkarıyor | `python3 curve-research/02-underarm-angle.py` |
| **Gerçek Buğra kalıbı (beden 38): koltukaltı 75-90°, omuz 73-88°** — kural "dik" | aynı script |
| Korpus bozuk: **7/13 parça beden-monotonluğu ihlali**, `Collar Lining` 46→48'de 501.5→382.9mm | `patterns_real/geometry/geometry-full.json` |
| Elastica çözücü çalışıyor: uzunluk hatası **0**, uç nokta **1e-13mm** | `python3 curve-research/01-elastica.py` |
| Bizim flat **13 çizgi**, referansta etek kıvrımları bile ~20 | `dataset/taste-pool/svg/g001-flat.svg` vs `design_patterns/crops-flat/flat-01.png` |
| Bir kalıp **37 kategorik alan + 8 ölçü** istiyor; "bir elbise" 1 tanesini veriyor | `engine/vocab.json` |

**Rakipler (doğrulandı):** Lekala 3.003 kalıbı **elle** çizmiş · Tailornova "sınırsız" ama ~15 şablon×slider · **dart pivot + slash&spread açık kaynakta YOK** (Seamly2D #369 hâlâ açık) · **açık kaynak grading motoru YOK** · **kalıp+flat'i tek kaynaktan veren YOK** · Sewformer (SOTA) kalıplarının **%76.3'ü dikilemiyor.**

**Lisans:** ✅ GarmentCode·BFF·OptCuts·PolyVectorization·informative-drawings (MIT) · libigl core (MPL2, CoMISo hariç) · libWetCloth (MPL2) · ezdxf (BSD)
❌ parafashion·Seamly2D·κ-curves·Developability (GPL3) · **Patro (AGPL)** · **GarmageNet (ticari yasak)**

---

## ★ ASIL İŞ: MALZEME SÖZLÜĞÜ

Önceki session son anda şuna vardı ama **kanıtlamadı, sadece iddia etti.** Görevin bunu çürütmek ya da kanıtlamak:

**İddia:** yaka tipi diye bir şey yoktur; **stand** (dik bant) ve **fall** (yatan bant) vardır. İkisi oynayınca mandarin de çıkar, gömlek yakası da, bebe yaka da, listede olmayan yaka da.

**Önerilen 9 malzeme** (37 enum × 130 seçenek bunlara çökmeli):
suppression (pens payı) · ease · fullness (kes-aç) · level (vücutta yükseklik) · girth · cap (kapak yüksekliği+ease) · stand/fall · kenar rolü (dikiş/kat/büzgülü/biye) · topoloji (kaç panel, hangi kenar hangisine)

### Yapman gerekenler

1. **DENETLE:** bu 9 kalem gerçekten yeterli mi? `engine/vocab.json`'daki 37 alanın **her birini** tek tek bu 9'a indirgemeyi dene. İndirgenemeyen çıkarsa **söyle** — liste eksik demektir. Uydurma, indirgeyemediğini yaz.
2. **ARAŞTIR:** kalıpçılık literatürü bu malzemeleri nasıl adlandırıyor? (Joseph-Armstrong'un üç ilkesi: dart manipulation / added fullness / contouring. Aldrich, Müller & Sohn, Bunka. archive.org'da public domain: Vincent "Cutter's Practical Guide", Hecklinger, Devere, Gordon.) **Zanaatın kendi sözlüğü ne? Benimki uydurma mı, gerçek mi?**
3. **KANITLA — tek kapı:** sözlük doğruysa **listede olmayan bir giysiyi ifade edebilmeli.** Somut test elde var: `patterns_real/geometry/geometry-full.json` içinde `EXTRA-TL (not in defter)` diye bir parça var — **üreticinin kendi talimat kitapçığında bile yok.** Bugünkü enum listesi onu ifade edemez. 9 malzeme edebiliyor mu?
4. **SONRA ÜRÜNE BAĞLA:** sözlük oturunca `prompt → malzeme değerleri → EKRANDA FLAT → kadran → kalıp iner` döngüsünü kur. **Flat sondaki teslimat değil, ARAYÜZÜN KENDİSİ** — "seni anladım mı"nın cevabı JSON olamaz, resim olmak zorunda. `engine/flat-engine/*` (40 stil, parametrik, zaten çiziyor) bu döngünün ekran katmanı, **yarısı kurulu, SALT-OKUNUR (Damla emri).**

---

## KURALLAR

- **Bana katılma. Yanıldığım yeri bul ve söyle.** Önceki session 5 saatte 7 kez yanıldı; sen de yanılacaksın, erken yakala.
- **Giysi başına yeni dosya — bir daha asla.**
- **Beden ölçüsü veya beyan edilmiş tasarım parametresi olmayan hiçbir sayı.**
- **Motorun kendi çıktısı asla kanıt değildir** (`golden-reference.csv`, `dataset/taste-pool/`, `contract/preview-truth.json`, showcase SVG'leri — hepsi motor çıktısı).
- **GPL/AGPL kod repoya girmez.** Algoritmayı makaleden yazmak serbest.
- **Ajan tavanı 3-4.** Geometriyle ölçülebilen şey araştırmaya sorulmaz.
- **Damla'ya soru sorma, araştır.** 100 yıllık literatür açık.
- **Render → PNG → GÖZLE BAK.** Path'e bakıp beğenmek yasak.
- **Plan yazma, iş yap.** Beş saat plan yandı. Damla: *"aynı yolu süslü şekilde geçemeyiz, zamanımız yok."*

## TEK TEST (her işten önce)

**Bu iş, bir insanın satın alabileceği bir nesneyle mi bitiyor?** Hayırsa yapma.
Ölçüm, tablo, rapor, mimari, benchmark **nesne değildir.**
