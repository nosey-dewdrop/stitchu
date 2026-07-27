# PIPELINE — MÜHÜRLÜ (2026-07-27, Damla mührü)

Damla'nın emri: "bu son kararımızı mühürlüyorum ve bu karardan asla sapmayacağın
looplu denetimli kapılı aşamalı akıcı bir pipeline istiyorum." Bu dosya o mühürdür.

İş sırası dayatabilen YALNIZCA iki belge vardır: **ANAYASA.md** (hedef + hakem + zevk
yasası) ve **bu dosya** (sıra + kapılar). Diğer her yol/durum dosyası tarih arşividir.
Bu dosyadan sapmak = incident: sapma fark edildiği an iş durur, önce dosya konuşur.

## MÜHÜRLÜ KARAR (değişmez çekirdek)

Vaat: **prompt ya da görselden, Damla'nın onaylayacağı flat + dikilebilir kalıp.**
Hedef ölçek: demo değil, v1 değil; endüstriyel kalıp CAD'i (Valentina/Lectra ligi).
Mimari üç kat:

1. **GENERATİF KAT** — tasarımı spec dilinde ÜRETİR (etiket + parametre; kombinasyonla
   sonsuzluk). Asla sayı ölçmez, asla koordinat çizmez.
2. **DETERMİNİSTİK KERNEL** — C++ motor; kalıp + flat geometrisinin TEK sayı kaynağı;
   dikiş boyu eşitleme, çentik, grainline. Tahmin sıfır.
3. **SÜZGEÇ** — ANAYASA üyelik kontrolü (8 soru) + makine testleri + Damla'nın evet'i.
   Makine testi gerekli ama yeterli değil; zevk kapısının tek hakemi Damla.

Sınırda endüstri uyumluluğu: DXF-AAMA/ASTM, print tiling, nokta bazlı grading.

## KALICI YASAKLAR (incident kaynaklı, tartışmasız)

- LLM'den ölçüm/sayı/koordinat istemek (çapa yankısı kanıtı:
  `reports/2026-07-27-stitchu-json-el-adli.txt`).
- El-ayarlı çarpan kalemini ürün yüzeyinde diriltmek (flat hattı = tracer/referans).
- Yeni sayaç rejimi kurmak (FULL x/N tarzı). Başarı beyanı = kapı kanıtı + Damla evet'i.
- Bu dosya dışında iş sırası dayatan yeni doküman açmak.
- Aynı anda iki aşama yürütmek.
- Hakemi baştan tanımlanmamış iş başlatmak (doğruluk sinyali yasası).
- Repo tuzak listesi (`CLAUDE.md` devri daim bölümü) aynen geçerli: bayat sayaçla teşhis
  yok, tam-ayna estetiği yok, empire'a skirtLengthMM yok.

## SAPMA TESTİ (her işten önce 3 soru)

1. Bu iş AKTİF aşamanın listesinde mi? Değilse yapılmaz; PARK bölümüne tek satır yazılır,
   sırası geldiğinde Damla'ya sorulur.
2. Hakemi baştan belli mi? (piksel gerçeği / geometri testi / Damla'nın yan yana evet'i)
3. Bitince kanıtı ne olacak? (rapor + dosya + ölçüm)

Üçünden biri boşsa iş başlamaz. Bu üç soru her oturum başında yeniden okunur.

## AŞAMALAR VE KAPILAR

Sıra mühürlü. Aşama açılırken ilk iş CANLI yeniden doğrulama (bayat teşhis tuzağı);
aşamanın madde listesi o doğrulamayla netleşir, kapısı ise şimdiden sabittir.

> **AÇIK ÇELİŞKİ (Damla kararı bekliyor):** CLAUDE.md'de aynı güne tarihli ikinci bir
> "her şeyden önce" emri var: BASAR-IKI-KALIP kampanyası (2 satın alınmış Buğra kalıbı
> motorca bire bir yapılana kadar başka iş yok). Bu kampanyanın hakemi mühür ilkesine
> zaten uygun (gerçek kalıpla bire bir örtüşme = dış dünya gerçeği). Damla tek kelimeyle
> çözer: "kampanya önce" derse kampanya AŞAMA 1 olur ve kablo kapanışı ardına geçer;
> "pipeline önce" derse kampanya PARK'a düşer. Karar gelene kadar iki iş de açılmaz.

### AŞAMA 1 — KABLO KAPANIŞI (aktif)
Motorun gerçek çıktısı ile kullanıcının gördüğü şey arasında kopuk hat kalmaması.
Oran kablosu uçtan uca bağlandı (ctest `skirtlen_check` 12/12); kalan adli bulgular
canlıda tek tek doğrulanıp kapatılır: draft.js normalize kopyası, create.js foto-anı
ölçü bug'ı, peterPan köprü regex'i, compile() web lehçesi.
**KAPI 1 (hakem: makine + ekran kanıtı):** aynı stile iki farklı kullanıcı ölçüsü →
ürün yüzeyinde iki FARKLI çıktı (byte/md5 kanıtı); suite yeşil; ekran görüntüsü Damla'ya.

### AŞAMA 2 — GÖZ DÜRÜSTLÜĞÜ
Çapa yankısının ölümü: prompt'taki örnek sayılar çıkarılır; ölçüm deterministik piksel
koduna geçer (silüet → genişlik/boy profili → oranlar). LLM'in işi sadece etiket.
Vision maliyeti (yeniden tarama ~59 çağrı) işten ÖNCE söylenir.
**KAPI 2 (hakem: piksel gerçeği):** iki farklı foto → farklı oranlar; probe setinde
ölçümler bağımsız el ölçümüne tolerans içinde; sonuç raporu `reports/`e.

### AŞAMA 3 — FLAT DAMAR HATTI
Tracer hattı büyür: doku/zemin bağışıklığı, Bugra vektör PDF'lerinin rasterize+izlenmesi,
izlenen referanslardan parametrik BLOK çıkarımı (her blok tek tek Damla evet'iyle girer).
**KAPI 3 (hakem: Damla):** referans + çıktı yan yana; kör iterasyon yasak: 3 tur üst üste
iyileşme yoksa DUR, Damla'ya çık.

### AŞAMA 4 — GENERATİF KAT
Prompt → spec üretici: yeni kombinasyonlar, varyasyonlar; üyelik ön-süzgeci otomatik;
parametreler kernelin dikilebilir aralıklarından. (Bu aşamanın 3'ten sonra gelme nedeni:
yeni tasarımın flat'i ancak blok kütüphanesiyle çizilebilir; referanssız tasarıma tracer
çalışmaz. Sıra atlanmaz.)
**KAPI 4 (hakem: Damla):** Damla'nın verdiği TEK prompt'tan 3 farklı tasarım; üçünün de
kalıp + flat'i iner; üçü de üyelik + dikiş testinden geçer; Damla evet der.

### AŞAMA 5 — ENDÜSTRİ SINIRI
DXF-AAMA/ASTM export; print tiling (A4/A0); nokta bazlı grading (beden serisi).
**KAPI 5 (hakem: dış dünya):** çıktı bağımsız bir CAD'de açılır (Valentina/Seamly2D);
seam-walking raporu temiz; grading beden tablosuyla doğrulanır. Chanel çıtasının ilk
gerçek eşiği bu kapıdır.

### AŞAMA 6 — CAD YÜZEYİ
Parça editörü, proje/dosya yönetimi, marker/yerleşim. Detayı KAPI 5 geçilince Damla ile
yazılır; şimdiden detaylandırmak drift kaynağıdır, sadece adı mühürlü.

## LOOP DÜZENİ (her aşamanın içi)

yap → ölç (aşamanın hakemiyle) → raporla (kanıt `reports/`e) → geçemediyse TEK değişken
değiştirip tekrar. 3 tur üst üste metrik iyileşmiyorsa DUR ve Damla'ya çık (mikro-loop
kararı Damla'nın). Kapı geçilince: commit + push + Damla'ya kanıt. Makine-hakemli kapıdan
sonra sıradaki aşama otomatik açılır; Damla-hakemli kapı onun evet'ini bekler.

## PARK

(Aşama listesi dışı her fikir buraya tek satır düşer; Damla evet demeden işe dönmez.)

## DEĞİŞİKLİK PROTOKOLÜ

Bu dosya yalnız Damla'nın açık evet'iyle değişir. Her değişiklik altta tarihli tek satır.

- 2026-07-27: mühür basıldı (üç katlı mimari + 6 aşama + kapılar). — Damla kararı
