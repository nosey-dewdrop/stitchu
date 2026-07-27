# PIPELINE — MÜHÜRLÜ (2026-07-27, Damla mührü; aynı gece CAD yöntemi revizyonu)

Damla'nın emri: "bu son kararımızı mühürlüyorum ve bu karardan asla sapmayacağın
looplu denetimli kapılı aşamalı akıcı bir pipeline istiyorum." Bu dosya o mühürdür.

İş sırası dayatabilen YALNIZCA iki belge vardır: **ANAYASA.md** (hedef + hakem + zevk
yasası) ve **bu dosya** (yöntem + sıra + kapılar). Diğer her yol/durum dosyası tarih
arşividir. Bu dosyadan sapmak = incident: sapma fark edildiği an iş durur.

## MÜHÜRLÜ KARAR (değişmez çekirdek)

Vaat: **prompt ya da görselden, Damla'nın onaylayacağı flat + dikilebilir kalıp.**
Hedef ölçek: demo değil, v1 değil; endüstriyel kalıp CAD'i (Valentina/Lectra ligi),
zevk çıtası couture (Chanel/Dior). Anlaşma: ürün Claude'dan, dünya/pazarlama Damla'dan.

**YÖNTEM (Damla emri, 27 Tem gece: "autocad, valentina"): pipeline değil, MODEL.**
Üç haftanın hastalığı boru hattıydı: foto girer, borulardan geçer, ucundan SVG resmi
düşer, resim ayarlanır, bitmez. CAD yönteminde resim yoktur, model vardır: kalıp =
ölçülere bağlı formüllü YAPIM REÇETESİ (operasyon dizisi); ekrandaki görüntü modelin
yansımasıdır, ölçü değişince her şey yeniden üretilir. Mimari dört unsur:

1. **REÇETE VERİ MODELİ** — kalıp, kaydedilip düzenlenebilen yapım reçetesidir
   (nokta/eğri/pens operasyonları, ölçü tablosuna bağlı formüller). Valentina dosya
   mantığı. Üretilen resim değil, belge.
2. **DETERMİNİSTİK KERNEL** — C++ motor; geometri hesabı, dikiş boyu eşitleme, çentik,
   grainline. TEK sayı kaynağı. Tahmin sıfır.
3. **KANVAS** — canlı çizim yüzeyi: parça görünür, nokta seçilir, ölçü değişince anında
   yeniden çizilir. SVG sadece dışa aktarım formatıdır.
4. **GENERATİF KAT** — prompt/foto → reçete YAZAR (asla sayı ölçmez, koordinat çizmez;
   kombinasyonla sonsuzluk). Aynı reçete elle de düzenlenebilir. AI çıkarılınca geriye
   eksiksiz bir CAD kalır.

Süzgeç her katın üstünde: ANAYASA üyelik kontrolü (8 soru) + makine testleri + Damla'nın
evet'i. Makine testi gerekli ama yeterli değil; zevk kapısının tek hakemi Damla.
Sınırda endüstri uyumluluğu: DXF-AAMA/ASTM, print tiling, nokta bazlı grading.

## KALICI YASAKLAR (incident kaynaklı, tartışmasız)

- LLM'den ölçüm/sayı/koordinat istemek (çapa yankısı kanıtı:
  `reports/2026-07-27-stitchu-json-el-adli.txt`).
- El-ayarlı çarpan kalemini ürün yüzeyinde diriltmek.
- Modeli olmayan resim üretmek (reçetesiz SVG = eski hastalık).
- Yeni sayaç rejimi kurmak (FULL x/N tarzı). Başarı beyanı = kapı kanıtı + Damla evet'i.
- Bu dosya dışında iş sırası dayatan yeni doküman açmak.
- Aynı anda iki aşama yürütmek.
- Hakemi baştan tanımlanmamış iş başlatmak (doğruluk sinyali yasası).
- Repo tuzak listesi (`CLAUDE.md` devri daim bölümü) aynen geçerli: bayat sayaçla teşhis
  yok, tam-ayna estetiği yok, empire'a skirtLengthMM yok.

## SAPMA TESTİ (her işten önce 3 soru)

1. Bu iş AKTİF aşamanın listesinde mi? Değilse yapılmaz; PARK bölümüne tek satır yazılır.
2. Hakemi baştan belli mi? (piksel gerçeği / geometri testi / dış CAD / Damla'nın evet'i)
3. Bitince kanıtı ne olacak? (rapor + dosya + ölçüm)

Üçünden biri boşsa iş başlamaz. Bu üç soru her oturum başında yeniden okunur.

## AŞAMALAR VE KAPILAR (CAD yöntemine göre, sıra mühürlü)

Aşama açılırken ilk iş CANLI yeniden doğrulama (bayat teşhis tuzağı).

### AŞAMA 1 — CAD ÇEKİRDEĞİ (aktif)
Reçete veri modeli kurulur: formüllü operasyon dizisi, ölçü tablosuna bağlı; motorun
gömülü çizim adımları reçete diline dökülür; ölçüden yeniden üretim (regeneration).
**KAPI 1 (hakem: makine):** aynı reçete + iki farklı ölçü tablosu → iki DOĞRU kalıp;
mevcut motor stillerinden en az biri reçete yolundan bire bir yeniden üretilir (golden
karşılaştırma); dikiş eşitleme testleri reçete yolunda da yeşil.

### AŞAMA 2 — KANVAS
Canlı model editörü: parça görüntüleme, nokta/operasyon seçimi, ölçü değişince anında
yeniden çizim; SVG/PDF sadece export.
**KAPI 2 (hakem: Damla):** Damla ekranda kalıbı açar, ölçüyü değiştirir, kalıbın CANLI
değiştiğini gözüyle görür; evet der.

### AŞAMA 3 — GÖZ + FLAT DAMARI
Foto/referans tarafı modele bağlanır: deterministik piksel ölçümü (LLM sadece etiket;
vision maliyeti önce söylenir), tracer/blok hattı referansları reçeteye çevirir; Buğra
PDF'leri rasterize + mm bağlama burada (BASAR-IKI-KALIP malzemesi).
**KAPI 3 (hakem: piksel gerçeği + Damla):** iki farklı foto → farklı reçete
parametreleri; referans + çıktı yan yana, Damla evet. 3 tur iyileşme yoksa DUR.

### AŞAMA 4 — GENERATİF KAT
Prompt → reçete üretici; üyelik ön-süzgeci otomatik; parametreler kernelin dikilebilir
aralıklarından.
**KAPI 4 (hakem: Damla):** Damla'nın verdiği TEK prompt'tan 3 farklı tasarım; üçünün de
kalıp + flat'i iner; üçü de üyelik + dikiş testinden geçer; Damla evet der.

### AŞAMA 5 — ENDÜSTRİ SINIRI
DXF-AAMA/ASTM export; print tiling (A4/A0); nokta bazlı grading (beden serisi).
**KAPI 5 (hakem: dış dünya):** çıktı bağımsız bir CAD'de açılır (Valentina/Seamly2D);
seam-walking raporu temiz; grading beden tablosuyla doğrulanır; iki satın alınmış Buğra
kalıbı motorca bire bir yeniden üretilir (BASAR-IKI-KALIP hedefi burada kanıtlanır).
Chanel çıtasının ilk gerçek eşiği bu kapıdır.

### AŞAMA 6 — CAD YÜZEYİ TAMAMLAMA
Editör derinleşmesi, proje/dosya yönetimi, marker/yerleşim. Detayı KAPI 5 geçilince
Damla ile yazılır; şimdiden detaylandırmak drift kaynağıdır, sadece adı mühürlü.

## LOOP DÜZENİ (her aşamanın içi)

yap → ölç (aşamanın hakemiyle) → raporla (kanıt `reports/`e) → geçemediyse TEK değişken
değiştirip tekrar. 3 tur üst üste metrik iyileşmiyorsa DUR ve Damla'ya çık. Kapı
geçilince: commit + push + Damla'ya kanıt. Makine-hakemli kapıdan sonra sıradaki aşama
otomatik açılır; Damla-hakemli kapı onun evet'ini bekler.

## PARK

(Aşama listesi dışı her fikir buraya tek satır düşer; Damla evet demeden işe dönmez.)
- Eski "kablo kapanışı" kalemleri (draft.js normalize, create.js foto-anı, peterPan
  regex, web lehçesi): reçete modeli eski boru hattının yerini aldıkça çoğu kökten
  ölür; hâlâ gerekenler Aşama 1-2 canlı doğrulamasında ele alınır.

## DEĞİŞİKLİK PROTOKOLÜ

Bu dosya yalnız Damla'nın açık evet'iyle değişir. Her değişiklik altta tarihli tek satır.

- 2026-07-27: mühür basıldı (üç katlı mimari + 6 aşama + kapılar). — Damla kararı
- 2026-07-27 gece: BASAR-IKI-KALIP blokajı kalktı, hedefi Aşama 3 + Kapı 5'e gömüldü. — Damla delegasyonu, Claude kararı
- 2026-07-27 gece: YÖNTEM revizyonu — pipeline değil MODEL; reçete veri modeli + kanvas; aşamalar CAD-native yeniden yazıldı. — Damla emri ("autocad, valentina")
