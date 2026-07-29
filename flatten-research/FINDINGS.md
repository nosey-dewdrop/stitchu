# stitchu — 3D-surface → flatten (KAMP notları, 2026-07-28 gece)

Bu klasör: pattern-making'in DOĞRU matematiğini (3B yüzey düzleştirme) kanıtlayan
çalışan Python spike'ları + bulgular. Amaç: bir sonraki oturum sıfırdan türetmesin.

## KARAR (Damla, kalıcı)
- stitchu BİTİRİLECEK (Damla'nın ilk göz ağrısı; ölçek meselesi kararı değiştirmez).
- Mimari MÜHÜRLÜ: **3B kıyafet yüzeyi → düzleştir (flatten)**. Eski 2B-formül (Aldrich blok)
  = yanlış soyutlama, kök kusur. Pens eğrilikten düşer, dikişler YAPICA eşleşir.
- KAMP KURALI: her adımın SERT geometrik kapısı var. "Buğra'ya benziyor gibi" YASAK.
  Kapı düşerse YAMALAMA yok, yöntemi değiştir. Haftalarca aynı sonucu farklı kelimeyle
  sunmak = bu kampın reddettiği şey.
- Memory: `project_stitchu_karar_kamp.md`, `project_stitchu_geometri_kanun.md`.

## NE KANITLANDI (çalışan kod — `python3 <dosya>` ile koş)
- `01-dart-from-curvature.py`: KONİ FRUSTUMU (etek paneli, düzleşebilir) → pens TAM 0.
  KÜRE KALOTU (göğüs, K>0) → pens ZORUNLU. **Pens = yüzeyin eğriliği, formül değil.**
- `02-gore-flatten-strain.py`: kalot dilimlere bölünüp düzleştirilince strain → %0.46
  (K=12). **İzometrik düzleştirme başarılıyor.** Açılan pens toplamı → 33.8° ≈ **41mm**
  = gerçek göğüs pensi ölçüsü (bel+yan darta bölünür).
- `03-single-dart-spring.py`: tek pens kaba spring → strain %4 (tek pens derin kalotta
  kalanı bırakır = bolluk; 2 pens gerçekte çözer). Deterministik.

## DÜZELTİLEN HATA (önemli, tekrar düşme)
- İlk türetmede "pens = Gauss-Bonnet eğrilik integrali = 2π(1-cosθ) = 99.3° ≈ 107mm"
  DENDİ — YANLIŞ. Bu TOPLAM eğrilik, düzleştirme pensi DEĞİL. Gerçek develop-pensi
  = 2π(1-sinθ/θ) = 33.8° ≈ 41mm (izometrik develop deficit'i). Sayısal düzleştirme
  bunu yakaladı — formül olsaydı hata gizli kalırdı. Tezin ispatı bu.

## AÇIK İŞ / BUGLI
- `04-arap-BUGGY-do-not-trust.py`: proper ARAP çözücü DENEMESİ, BUGLI (strain %257).
  Jacobi/lineer global adımı hatalı. ARAP ders-kitabı yöntemi doğru; bu implementasyon
  YANLIŞ. GÜVENME. Sıradaki iş: ARAP'ı TEST EDİLMİŞ REFERANSTAN düzgün kur (libigl
  arap param / Liu&Zhang local-global / Sorkine-Hornung), gece tahmini değil.

## MİMARİ (4 uzman + şüpheci kurucu doğruladı — workflow wf_1a033787-506)
Kök kusur: motor 2B pattern'i PRİMİTİF sanıyor (formülden çiziyor); pattern aslında
ÇIKTI (3B yüzeyin düzleştirilmesi). 6 katman doğru mimari:
1. BODY MESH — ölçüden 3B gövde üçgen-mesh'i (bust/waist/hip çemberleri gerçek Z'de, torso loft; kol tapered silindir).
2. EASE FIELD — normal-offset e(u,v) mm; body ⊕ e·n = kıyafet yüzeyi. Kumaş = anizotropik metrik.
3. STYLE LINES — pens/dikiş yolları yüzeyde GEODEZİK eğri (tek operatör "eğriliği γ boyunca serbest bırak", routing parametreli).
4. FLATTEN — geodezik kesiklerden panelleri izometrik düzleştir (ARAP/energy-based); kalan eğrilik pens kaması olarak açılır (= angle deficit).
5. 2D PATTERN — düzleşen sınırlar PathCommand'e; recipe belge = ÇIKTI/replay, kaynak değil.
6. VERIFY — düzleşen paneli gövdeye GERİ-DRAPE et (drape.cpp ileri koş), strain+çakışma = 3B fit oracle.

## MOAT (dürüst — şüpheci kurucu ayakta bıraktı ama küçülttü)
GERÇEK ama net sınırlı: **deterministik + insansız + temiz-pensli + uzunluk-koruyan
düzleştirici + 3B fit oracle** kimsede yok. CLO/Lectra/Optitex = 2B-kaynak + 3B-önizleme
(insan önce 2B çiziyor). Akademik LSCM/ABF/BFF = açı-koruyan, eğriliği YAYIYOR, temiz
pens YOK, cut-sew için kullanılmaz. GarmentCode = aynı 2B-panel, iç pens yok.
AMA: algoritma icadı DEĞİL (Wang/Tang/ARAP 15 yıl açık) — entegrasyon+determinizm+otomatik-pens
WEDGE'i. Satış: "bunu insansız/deterministik kimse SHIP'lemiyor", "matematiği biz bulduk" DEĞİL.
Damla "en iyi entegre eden" kimliğine oturur. SF-seviye ama küçük-entrenched pazar (fashion CAD).

## KENDİ MOTORUMUZDAN NE KALIR (~%40)
KAL: geometry.hpp primitifleri (flattenCubic, pathLength, offsetOutline=dikiş payı),
dxf.cpp export, nest.cpp, validator (kaynak DEĞİL, regresyon-tripwire), drape.cpp'nin
Verlet+Jakobsen İÇ DÖNGÜSÜ (= flatten motoru, sadece 3B→düzlem ters koş).
AT: bütün 2B-formül-çizim beyni — bodice.cpp frontReduction/chestEase/dartCenterX/
underbustOffset, omuz tip-slide truing, princess legDrop truing, sleeve.cpp width-bisection.
Recipe DSL 2B-first SEMANTİĞİ (formül→PathCommand primitif olarak).

## FİNISHING = GEOMETRİ (el işi değil — Damla'ya kanıtlandı)
- dikiş payı = offset (var). grain = düzleştirmenin ana-gerilme yönü.
- pens→dikiş = eğrilik routing (toplam sabit). bolluk = 3B yüzey offset field.
- Tek "insan" = tasarım niyeti (silüet) — o zaten insanın.

## MİLESTONE MERDİVENİ (her biri sert kapılı, ucuz Python'da kanıtla → C++'a taşı)
M1: proper ARAP develop() — REFERANSTAN. Kapı: herhangi yüzey yaması strain<%0.5 + dağıtık pens, pens=develop-deficit.
M2: body loft (ölçü→torso+cup+kol mesh). Kapı: ölçü çemberleri gerçek Z'de eşleşir.
M3: ease field → kıyafet yüzeyi. Kapı: fitted vs relaxed farklı yüzey.
M4: style lines + geodezik kesik + flatten → gerçek bodice front + pens. Kapı: dikiş-eşleşme YAPICA <0.1mm, pens=eğrilik, validator temiz.
M5: finishing (grain/pay/dart routing). Kapı: grain deterministik, pens toplamı sabit routing.
M6: 3B fit oracle (re-drape). Kapı: gövdeye strain<eşik sarılır.
M7: tam giysi (bodice+etek+kol paylaşılan dikiş eğrisinden). Kapı: kol kapağı=armscye aynı 3B eğri.

## REPO DURUMU (temizlenecek)
- Pushlu: landing (industry section + B2B hero, ?v=136); Kapı 5 set-in armscye kernel+bridge (078fa47).
- UNCOMMITTED (working tree, ONAY BEKLİYOR): set-in scye'nin TÜM kollu giysilere bağlanması
  (bodice.cpp makePiece/makePrincessPieces setInScye) + golden RE-PIN (golden-reference.csv,
  32 kollu elbise değişti, 79/79 yeşil doğrulandı) + GOLDEN-PIN.md "pending" girişi.
  Görsel: ~/Desktop/SETIN-ARMSCYE-before-after.png, ~/Desktop/LOCKET-KOR-KIYAS/.
  KARAR (Damla): 3B-flatten'a pivot ettiğimiz için bu ESKİ-yön işi — ya küçük iyileştirme
  olarak commit et (Damla onayıyla), ya 078fa47'ye revert et, repo'yu temizle.
