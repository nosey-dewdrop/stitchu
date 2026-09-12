# Bugra kalıp ölçü defteri — forensik mm referansı

> Satın alınan iki gerçek Bugra (BP) kalıbının A0 PDF'lerinden vektör olarak
> çıkarılmış GERÇEK milimetre ölçüleri. Ölçek kanıtı: her iki PDF'te kalibrasyon
> "4cm bar" = 113.386 pt = **tam 40.00 mm**; MediaBox 821×1169mm ≈ A0. PDF birimi
> point, mm = pt × 25.4/72. Çıkarım: q/Q graphics-state stack + translate-only
> `cm` matrisi (a=d=1, b=c=0). Kaynak script /tmp/bugra-extract.py,
> ham veri /tmp/bugra-geometry.json.
>
> Bu ürünlerin kalitesi = stitchu motorunun HEDEFİ. Her sayı A0 stream'inden
> kanıtlı; uydurma yok. Ölçüler "outer" = en büyük nested beden halkası (8 bedenin
> en büyüğü), "inner" = en küçük beden. rings=8 = 8 beden renk-kodlu üst üste.

## 1. Buttoned Corset Bustier — 6 parça, 8 beden nested

Revize (2026-04-07): eski versiyon çok dardı → dikiş payı DAHİL edildi, dokuma
kumaş için daha rahat. Astar = ana kumaş (kalın değilse). Kap dikişi (cup seam)
ile göğüs kavisi 2 yatay parçadan veriliyor — motorun EN KRİTİK eksiği.

| # | Parça | Kesim | outer WxH mm | perim mm | not |
|---|-------|-------|--------------|----------|-----|
| 1 | Upper Cup | 2 aynalı | 278×291 | 998 | kavisli üst kap (T-L) |
| 2 | Lower Cup | 2 aynalı | 211×232 | 842 | alt kap (T-C) |
| 3 | Front Body | 2 aynalı | 169×294 | 622 | yan ön panel (T-R) |
| 4 | Front Body | 2 aynalı | 114×357 | 615 | orta ön panel (T-R) |
| 5 | Back Body | 2 aynalı | 281×120 | 647 | yan arka (T-R) |
| 6 | Back Body | 1 katlı | 521×178 | 1303 | orta arka, cut-on-fold (M-C) |

**Kritik yapı:** Upper Cup + Lower Cup = YATAY cup seam. Motor bunu çizmiyor
(cupSeam=0 → tek princess panel + bust dart). Strapless/bustier'in göğse
oturmasının anahtarı bu yatay bölme. → Görev #4 (cup seam bloğu).

Beden grading span (inner→outer bbox): örn parça 6 arka 474→521mm genişlik
(8 beden aralığı ~47mm genişlik büyümesi).

## 2. Locket Top — 6 parça, 8 beden nested

"Kalıplarım oldukça dar" — dokuma kumaş için bel/göğüse 2-3cm bolluk ekle ya da
1 beden büyük al (elle grading zaafı; motor parametrik ease ile otomatik çözer).
Dikiş payı 1cm, etek ucu 3cm — hepsi DAHİL.

| # | Parça | Kesim | Tela | outer WxH mm | perim mm | not |
|---|-------|-------|------|--------------|----------|-----|
| 1 | Front Body | 2 aynalı | — | 366×543 | 1922 | en büyük panel (M-L) |
| 2 | Back Body | 1 katlı | — | 272×480 | 1418 | bel pensesi var (M-R) |
| 3 | Collar | 2 katlı | 1 katlı | 213×169 | 622 | yaka (M-C) |
| 4 | Collar Lining | 1 katlı | 1 katlı | 158×171 | 501 | yaka astarı (M-C) |
| 5 | Lower Sleeve | 2 aynalı | — | 398×180 | 980 | alt kol (T-C) |
| 6 | Upper Sleeve | 2 aynalı | — | 537×221 | 1254 | üst kol, fırfırlı kenar (T-C) |

**Yeni yapılar:**
- **2 parçalı kol** (Upper + Lower Sleeve) — motorun tek-parça set-in sleeve'inden
  farklı; üst kol fırfırlı kesim.
- **Yaka + yaka astarı ayrı parça** (collar + collar lining, tela ile) — motorda
  yaka var ama astar/tela ayrımı yok.
- Arka bende bel pensesi (dart).

## Motorun zaten iyi yaptığı
- Princess dikişi (ön/arka panel bölme) Bugra'nınkiyle aynı sınıf.
- Parametrik ease + sonsuz beden → Bugra'nın "1 beden büyük al" / "ayrı XXS
  dosyası" zaafını otomatik çözer.

## Motorun eksikleri (öncelik sırası, en yüksek etki üstte)
1. **Cup seam** (Upper/Lower Cup) — strapless/bustier ailesini oturtan yatay bölme. → Görev #4
2. **2 parçalı kol** (Upper/Lower Sleeve) — set-in sleeve'i yatay böl.
3. **Yaka astarı + tela** talimatı — parça değil sunum/talimat katmanı.
4. **Nested multi-size tek A0** — 8 beden renk-kodlu üst üste (motorun gradeJSON'u
   bedenleri çıkarıyor ama nested tek-sayfa basmıyor).

## XXS özel beden notu
Bugra XXS için AYRI dosya + önde ekstra dart (Bust 81/Waist 58/Hip 84).
Motor bunu ayrı dosya olmadan gradeJSON ile çıkarır — elle-kalıp zaafının tam
tersi bir motor üstünlüğü.

## Kafa-kafaya mm kıyas (motor EU38 vs Bugra 8-beden ortası)

Motor draftJSON `commands` (move/line/curve) mm cinsinden ölçüldü (bezier 10 pt
örneklem). Kaynak /tmp/motor-vs-bugra.mjs.

**Corset:** Motor bustier'i DİKEY princess (Top Center/Side Front, her biri
~216×625mm, omuzdan hem'e TEK panel) + bust dart ile çiziyor. Bugra YATAY cup
seam (Upper Cup 278×291 + Lower Cup 211×232) ile göğüs kavisini AYRI parçadan
veriyor. Motor bustier'i "ayrı cup" olarak düşünmüyor → strapless'ta göğüs
oturmaz/boşluk yapar. **Bu en yüksek etkili eksik.**

**Locket:** Motor kolu TEK set-in sleeve (304×209mm). Bugra kolu YATAY 2'ye
bölüyor (Lower Sleeve 398×180 + Upper Sleeve 537×221, fırfırlı). Motor yaka
stand+blade veriyor (fonksiyonel eşdeğer) ama ayrı astar/tela parçası yok.

İki net motor eksiği: (1) cup seam, (2) 2-parçalı kol. Öncelik cup seam.

## 4x raster halka izleme — mm bağlama TUR 2 (2026-07-28 gece, trace-ring v3)

**Ne yapıldı:** Her iki A0 PDF 288dpi (4x) rasterize edildi (`pdftoppm -r 288
-png -aaVector no`, çıktılar `new_flats/rasters/{locket,corset}-a0-288na-1.png`,
gitignore). `engine/tools/tracer/trace-ring.py` SEÇİLEN bedenin halkasını RENK
ayrımıyla izole edip (72dpi turunun açık işi "8-halkadan tek beden seçimi"
ÇÖZÜLDÜ) merkez-çizgiden ölçüyor; dış-sınır izlemesinin çentik-dolaşım şişmesi
(TUR 1'de çevre +%47) bu yolla öldü. mm kesin: 288dpi'de 1px = 0.25pt =
0.0882mm. Hakem: `geometry/geometry-full.json` per-ring vektör gerçeği.

**Ölçü bağlama kayıtları:** 24 halka (2 kalıp × 12 parça-beden; bedenler 38 ve
42, tüm parçalar; kaynak her iki PDF'in A0 sayfa-1 rasteri; parça adları bu
defterin tablolarındaki adlarla birebir). Tam sayılar
`reports/gate/bugra-ring-2026-07-28.txt` (RULES inv. 6: sayı test çıktısında).
En kötü bölge corset "Back Body (side)": komşu halkaların yoğun örttüğü dar
şerit. Görsel kanıt `~/Desktop/IZLEYICI-BUGRA-03.png` + parça başına overlay
`new_flats/rasters/trace-out/rings/`. Determinizm: aynı komut iki koşu
stdout+overlay bayt-özdeş (cmp).

**Ölçümle öğrenilen yöntem gerçekleri (tekrarı önlemek için):**
1. **AA açıkken renk ayrımı İMKANSIZ:** antialias komşu halkalardan SAHTE renk
   üretiyor — AA rasterinde "48 pembesi (1.0 0 0.384)" sanılan pikseller
   46-magenta × 34-kırmızı karışımı çıktı. `-aaVector no` şart.
2. **En büyük beden (48) sayfada kendi renginde ÇİZİLMİYOR** (34-46 arası 7
   beden birebir renkli var). 48 için renk yolu kapalı; gerekirse siyah dış
   kompozit ya da vektör yolundan gidilir.
3. **Sayfa çerçevesi = geometry-full.json çerçevesi** (offset 0,0; y ekseni
   ters: y_px = H - y_mm×s). Grid aramayla doğrulandı.
4. **Painter's algorithm örtmesi:** üstte çizilen bedenler alttakinin çizgisini
   uzun bölümler halinde yutuyor → tek bedenin rengi sayfada parçalı. Dilate
   ile kaynatma BATTI (yakınsama bölgelerinde komşu halkalar 1mm'e iniyor, ağ
   kuruyor); doğru yol PARÇA KÖPRÜLEME — kendi renk parçaları truth poligonu
   yay-uzunluğuna göre sıralanır (izdüşüm SEGMENTE; sıralama aralığı orta-nokta
   ± fiziksel-uzunluk/2, uç-nokta aralığı köşe-izdüşüm ve t=0 dikişi
   tuzaklarına düştü), boşluklar düz köprüyle kapanır, ölçülü/köprü mm ayrı
   raporlanır (truth yalnız sıralama/kimlik; ölçülen sayı raster pikselinden).

**Açık işler (sonraki tur):** dar-şerit parçalarda köprü oranını düşürmek;
çentik konumlarını ayrı katman olarak çıkarmak; bu mm-doğru konturları reçete
parametrelerine bağlayan çeviri (Aşama 3 ana işi, tracer→reçete köprüsü v1
tanımı hâlâ açık — sabah işi).

## tracer→reçete köprüsü v1 — TUR 3 (2026-07-28 gece)

Locket Front Body (38) izlenen konturu GERÇEK reçeteye bağlandı
(`ring2recipe.py` → `recipes/bugra-locket-top-front-38.json`, RECETE-SPEC v1.1
dili, yeni op gerekmedi; yan göğüs pensi marking move/line). Gövde = Buğra'nın
kendi çizelgesi (38: 920/720/980); fit edilen her sabit gerekçeli
(`reports/gate/kopru-v1/fit-defteri-locket-front-38.txt`). Hakem ctest
`bugra_bridge_check`: bbox +0.53/+0.54%, çevre vs pens-kapalı vektör +0.92%,
nokta-mesafe medyan 4.77mm (rapor `reports/gate/kopru-v1-2026-07-28.txt`).
Ölçümle çıkan YAPISAL sınırlar: (1) v1.1 kolsuz-armscye eğri ailesi takma-kol
oyuğunu çizemiyor (p95 34mm'nin ana kaynağı) — motor eksik listesindeki
"2-parçalı kol" ailesiyle aynı kök; (2) kare-yaka modeli Locket'in geniş-sığ
oyuk yakasını köşeyle yaklaşıyor; (3) CF kenarı baskıda üst halkalarca örtülü
(431.6mm tek köprü). Bustier köprüsü cup seam olmadan kurulamaz (öncelik #1).
