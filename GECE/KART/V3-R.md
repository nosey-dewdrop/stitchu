# KART V3-R — ARAŞTIRMA (§5.1 R-kartı; kod YAZMAZ)

ETİKET: PARALEL (V3-K ile birlikte koşar; dosya kesişimi yok)
SÜRE TAVANI: 45 dk

## NE
Bu fazın üç eşiği için YAYINLANMIŞ kaynak bul. Kaynak yoksa "yayınlanmış
formül YOK" diye açıkça yaz — uydurma kesinlikle yasak.

## ARANACAK ÜÇ EŞİK
1. **Teğet süreksizliği (C1) eşiği**: bitişik eğri segmentleri arasındaki
   teğet açısı farkı hangi değerin altında "sürekli" sayılır? Nerede aranır:
   CAD/geometrik modelleme literatürü (G1 continuity tolerance), STEP/IGES
   tolerans pratiği, OpenCASCADE/Rhino belgelenmiş varsayılanları,
   kalıp yazılımı (Gerber/Optitex) eğri toleransları. Derece ya da radyan
   ver, ve kaynağın künyesini.
2. **Flat (technical flat / fashion flat) ile kalıp arasında ölçü uyumu**:
   %1.5 tolerans için yayınlanmış bir pratik var mı? Yoksa üretim toleransı
   (1/32" = 0.79375mm) nasıl bir yüzdeye düşer, hangi ölçüde?
3. **Açılım artefakt sınıfları**: düzleştirme/parametrizasyon literatüründe
   (LSCM Lévy 2002, ARAP Liu&Zhang 2008, Sorkine-Hornung, Sheffer
   "Mesh Parameterization Methods and Their Applications") artefaktlar
   nasıl adlandırılıyor ve nasıl ölçülüyor (conformal/area distortion,
   flipped triangle, foldover, boundary self-intersection)? Bizim dört
   sınıfımıza (tırtıklı etek ucu · kendini kesen kontur · C1 kırığı ·
   sıfır alanlı parça) hangi yayınlanmış ad karşılık geliyor?

## AYRICA (kısa, ≤10 satır her biri)
4. **Ortografik projeksiyon → fashion flat**: giysi kabuğundan ön/arka
   teknik çizim üretmenin yayınlanmış yöntemi var mı (GarmentCode,
   Sewformer, NeuralTailor, ChatGarment, akademik "technical flat
   generation")? Varsa nasıl yapıyorlar, yoksa "YOK".
5. **libigl** hangi açılım fonksiyonlarını sunuyor (isim isim:
   `igl::lscm`, `igl::arap`, `igl::harmonic` vb.), lisansı, header-only mu,
   Emscripten/wasm ile derlenmiş emsali var mı? **Eigen** aynı sorular.
   NOT: bu koşuda CGAL/OpenCASCADE sınıfı YASAK — onları araştırma.

## ÇIKTI → `GECE/V3-R.md`
Format: her eşik için bir bölüm — ARANAN · BULUNAN (künye: yazar, yıl,
yayın/repo, URL) · LİSANS · HÜKÜM (eşik değeri + hangi kapıya bağlanacağı) ·
BULUNAMADIYSA "yayınlanmış formül YOK, bant şu ölçümden" cümlesi.
Sonda tek tablo: eşik · değer · kaynak · güven (YÜKSEK/ORTA/DÜŞÜK).

## YASAKLAR
- Kod yazma, dosya düzenleme (sadece `GECE/V3-R.md`).
- Model ağırlığı indirme, GPU kurulumu, API anahtarı — kalıcı veto (§5.3).
- Telifli görsel indirme yok; referans = link + özellik dili.
- Kaynaksız sayı yazma. "Muhtemelen 5 derece" gibi cümle = kart ihlali.
- En fazla 3-4 web araması dalgası; sonsuz tarama yapma.
