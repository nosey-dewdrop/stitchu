# DEVAM — FASHION ZİNCİRİ (v1.1: satılabilir ürün. Dandik ölür, kalem motora girer.)

Hedef tek cümle: zincir bitince Damla'nın seçtiği siluetler, Damla'nın flat
kalemiyle çizilmiş, profesyonelce parçalanmış, Etsy emsallerinin yanında
duran paket olarak basılıyor.

## BAŞLATMA KOMUTU
> stitchu'ya devam. DEVAM-FASHION.md oku, zinciri otonom koştur.
> DURMA: teknik denetimler kendi akar, raydan raya kendin geçersin.
> Sadece PIN'ler (STYLE-PIN, golden re-pin) onay kuyruğuna yazılır ve
> beklerken diğer işlere devam edersin. Süre tahmini yapma, iş bitene
> kadar koş.

## ZORUNLU OKUMA
CLAUDE.md → bu dosyanın ANAYASA'sı → DEVAM-KAPANIS-LOOP.md (ritim + golden
kuralı MİRAS) → reports/2026-07-19-stitchu-v1-kapanis.md (v1.1 aday listesi)
→ engine/GOLDEN-PIN.md → benchmark-58/dress_patterns arşivi (satış emsalleri)
→ flat-engine prototipi (Damla'nın kalem dili: çizgi hiyerarşisi, drape
planı, ink rejimi, taper mürekkep — F2'nin hedefi budur).

## ANAYASA
- A1-TERS: yeni yetenek SERBEST, ölçüsüz yetenek YASAK. Her rayın yeşil
  tanımı sayı + Damla onayı içerir.
- GOLDEN YASASI (miras, pazarlıksız): motor commit'i ya scripts/repin-golden.sh
  ile beyanlı re-pin yapar ya "PIN BEKLİYOR" taşır. golden_check her build'de
  pine karşı. Regen-vs-regen kanıt değildir.
- DAMLA KAPISI (SADECE PİN'LER, ASENKRON): rutin denetim palantirin işi;
  Damla yalnız GERİ-ALINAMAZ işlemde devrededir: STYLE-PIN yazma, golden
  re-pin, v1.1 tag. Adaylar kontakt kartı olarak kuyruğa düşer
  (reports/gate/), zincir beklemeden diğer işlere devam eder; pin ancak
  onayla yazılır. "Değil" + tek cümle gerekçe → ZEVK SÖZLÜĞÜ'ne işlenir +
  gusto-lint'e ölçü adayı olur (korpusa girişi bir sonraki DEVAM'da).
- GUSTO DENETİMİ (PALANTIR — otomatik zevk denetçisi): rutin "satar mı /
  kalem mi" hükmünü Damla değil İSTATİSTİK verir. F0'da kurulan GUSTO
  KORPUSU'na karşı her görsel çıktı puanlanır: gusto-lint raporu = silüet
  grameri (terim-İD kombinasyonu korpusta var mı, hangi frekansta) · oran
  bantları (omuz/bel/kalça/boy oranları emsal dağılımının yüzde kaçında) ·
  çizgi hiyerarşisi istatistiği (kalınlık katmanları, ink yoğunluğu
  flat-engine diline uyum) · parça/sayfa sayısı emsal bandı · kompozisyon
  (drape/büzgü yoğunluğu emsal aralığında mı). Eşik altı = düzeltme
  kuyruğu, eşik üstü = ray kendi kendine yeşil.
  SONSUZ LOOP KİLİTLERİ (pazarlıksız): (1) korpus ve eşikler F0'da DONAR —
  zincir kendi ölçüsünü değiştiremez, korpus güncellemesi ayrı DEVAM ister;
  (2) ray başına maks 3 düzeltme turu; (3) her tur puanı YÜKSELTMEK zorunda,
  yükselmeyen tur = KIRMIZI-MÜHÜR + rapora dürüst not, zincir sıradakine
  geçer. Puanlar her rayın raporunda yayınlanır (measured, not claimed).
- ZEVK SÖZLÜĞÜ: contract/taste-lexicon.md — Damla'nın her gerekçesi
  ("kaba", "ölü büzgü", "steril") → parametre çevirisi kaydedilir; sonraki
  turlar sözlükten başlar.
- STYLE-PIN: "kalemim" onayı alan render'lar engine/STYLE-PIN/ altına
  pinlenir + style_check ctest (piksel diff). Pinli görsel ancak Damla
  yeniden-onayıyla değişir. GOLDEN-PIN'in görsel kardeşi.
- SATIŞ ŞARTNAMESİ: docs/SATIS-SARTNAMESI.md (F0'da arşiv emsallerinden
  çıkarılır). Ölçülebilir maddeler: listing görseli (ön+arka flat, STYLE-PIN
  uyumlu) · kalıp paketi tam (numaralı parçalar, kesim tablosu "cut 1 on
  fold" diliyle, gömülü SA, beden sayfası, A4+A0) · parça sayısı emsal
  bandında · sayfa sayısı emsal bandında · talimat iskeleti. Her görsel
  rayın teknik denetimine girer. Kontakt sayfasında çıktı, 3 gerçek Etsy
  emsalinin YANINA konur; Damla "bunların yanında durur mu" diye bakar.
- RİTİM MİRAS: mini-denetim bağımsız, kanıt kendi üretir, BLOCKER/MINOR/PARK
  triage, mandal kuralı, sabit iş listesi. Kredi: yalnız vision işleri,
  tavan 200 çağrı/ray.

## SIRA
F0 → **F2 → F1** → F3 → DENETİM → v1.1 tag  (Damla kararı 2026-07-19: F2 öne alındı)
(F4 şartname F0'da doğar, F1-F3'ün hepsine denetim olarak bağlanır; ayrı ray değildir.)

SIRA REVİZYONU GEREKÇESİ: MIHENK-01 reddi ölçülmüş kanıt verdi — mihenkin
görsel kabulünü F2 çizim dili (anatomik iç seam eğrisi + 1.4 ağırlık katmanı)
belirliyor, F1 geometrisi değil (kalıp geometrisi zaten doğru). Çizim dili
mihenk "kalemim" onayının ön koşulu; F1 siluetleri de aynı kalemle çıkacağı
için F2 önce gelmeli. Plan F0→F1→F2 idi; Damla F0→F2→F1'e çevirdi.

## F0 — KOMUTA EKRANI + KAPI ALTYAPISI
- web/komuta.html (APP_TOKEN arkası): tek ekran — zincir durumu, açık
  kapılar, sayılar (FULL/ELEMENT/korpus/ctest), son kontakt sayfası linki,
  NEREDEYİZ özeti. Statik + mevcut JSON/raporlardan üretilir.
- Kontakt sayfası üreteci: mihenk 5'lisinin önce/sonra render'ları yan yana,
  altında "kalemim / değil + gerekçe" girişi; karar reports/gate/ altına
  JSON yazılır, zincir oradan okur.
- Mihenk 5'lisi İLK KURULUM: ZİNCİR SEÇER (Damla kararı 2026-07-19: "zincir
  seçsin, ilk kontakta onaylarım"). En çok satılan Etsy kategorilerine denk
  5 mevcut/hedef giysi; İLK kontakt sayfasında Damla onaylar/değiştirir.
  Mihenk = F1 hedef siluetleriyle aynı liste (kalibrasyon ve üretim tek 5).
- SATIS-SARTNAMESI.md arşiv emsallerinden çıkarılır, madde madde ölçülebilir.
- GUSTO KORPUSU kurulur ve DONDURULUR: benchmark-58/dress_patterns arşivi
  (Etsy emsal flat'leri + paketleri) + vision korpusu terim-İD frekansları +
  flat-engine prototip dili (çizgi/ink referansı) + moda tarihi silüet
  aileleri (60s/70s vintage seti mevcut sayfalardan). Her kaynaktan
  ÖLÇÜLEBİLİR bant çıkarılır (oranlar, parça sayıları, çizgi katmanları,
  kombinasyon frekansları) → contract/gusto-corpus.json + eşikler.
  gusto-lint.mjs bu dosyadan okur; F1-F3 boyunca dosya SALT-OKUNUR.
YEŞİL: ekran canlı, kuyruk mekanizması çalışıyor (kart yaz/oku kanıtlı),
şartname dosyada, gusto-corpus.json + eşikler donmuş, gusto-lint mevcut 5
mihenk giysisinde koşup puan raporu üretti (kalibrasyon kanıtı).

## F1 — FAZ P PRİMİTİFLERİ (fashionable siluetler; en ağır ray)
- Primitifler: PieceSplit (prenses dikiş, panel bölme), GatherStrip (büzgü
  bandı genelleşir), FlaredAppendage (gode, volan, flare).
- Hedef siluetler (mihenk onayında Damla revize edebilir): prenses dikişli
  fitted elbise · wrap elbise · godeli midi etek · drape yaka bluz ·
  fit-and-flare 60s elbise.
- Her siluet: draft (validator-clean + walking seams) + flat + kesim tablosu
  + preview-truth + şartname. Kombinasyon matrisi (K2) yeni primitiflerle
  güncellenir; compose_check büyür.
- Golden: beyanlı re-pin(ler), defter girdili, Damla onaylı — GOLDEN YASASI.
- Terim-İD kapsamı yeniden ölçülür: %6.7 → yeni sayı yayınlanır (hedef değil
  ölçüm; şişirme yasak).
YEŞİL: 5 hedef siluet uçtan uca basılıyor + Damla Kapısı PASS + şartname
PASS + ctest/golden/preview-truth yeşil + yeni kapsam sayısı raporda.

## ROL AYRIMI — REFERANS KALEM vs ÜRETİM HATTI (Damla emri 2026-07-19)
1. **engine/flat-engine/_engine-full.mjs + styles.json = REFERANS KALEM** —
   SALT-OKUNUR. Damla'nın flat çizim dilinin cetveli ("hedef böyle görünür":
   dantel biye, fırfır katları, balon kol karakteri, taper mürekkep, drape
   planı). STYLE-PIN'in atası. Silme/itme/dokunma yok; değişiklik sadece
   Damla'nın kalem revizyonuyla.
2. **ÜRETİM HATTI TEK: motorun flat renderer'ı** (engine/tools/
   render-garment-flat.mjs). F2'nin gerçek işi = prototibin DİLİNİ üretim
   renderer'ına parametre parametre, styles.json'dan okuyarak PORT etmek.
3. İki paralel ürün yolu OLAMAZ (tek hakikat). Prototip cetvel, ürün değil.
4. MIHENK render'ları: üretim renderer + port edilmiş kalemle. Babydoll ilk
   test — prototipteki babydoll ile yan yana, fark gözle görünür.

## F2 — DAMLA KALEMİ MOTORA (listing-flat kalitesi)
- flat-engine prototipinin dili C++ flat renderer'a taşınır: çizgi
  hiyerarşisi (gövde 1.9 / dikiş orta / pens ince / bastırma kesik), drape
  planı (ana sırt köşeye, ikincil söner), taper mürekkep, ink rejimi
  (minimal/orta/tam), deterministik seed.
- Listing kartı: ön+arka flat + başlık; render-listing-card ailesi bu dile
  bağlanır.
- Golden'a etkisi: flat çıktısı golden CSV'de değilse pin oynamaz; oynuyorsa
  GOLDEN YASASI.
YEŞİL: mihenk 5'lisi + F1 siluetleri yeni kalemle basılıyor, Damla Kapısı
"kalemim" dedi, STYLE-PIN'ler pinlendi, style_check ctest doğdu.

## F3 — CUT-ON-FOLD + EĞRİ CİLASI (profesyonel kalıp)
- Simetri kuralı: orta hattı simetrik + closure'sız parça → yarım çizim +
  "cut 1 on fold" + grainline; kasıtlı orta dikiş (cb_zip, gode) → tam/paylı;
  asimetrik → olduğu gibi. Kesim tablosu dili: cut 1 on fold / cut 2 /
  cut 1 pair.
- Nesting yarım parçalarla yeniden: sayfa sayısı raporlanır (önce/sonra).
- Eğri cilası: birleşim sürekliliği (C1) tüm parça sınırlarında assert;
  oyuntu/yaka segment yoğunluğu emsal kalıp eğrilerine karşı gözden geçirilir
  — değişiklik golden'a beyanla girer.
YEŞİL: parça sayıları emsal bandında (bluz ≤4-5, elbise ≤6-8), "küp" örneği
(tişört önü tek yarım parça) kontakt sayfasında kanıtlı, golden beyanlı,
şartname parça/sayfa maddeleri PASS.

## DENETİM + KAPANIŞ
Bağımsız denetçi: anayasa maddeleri + golden/style pin bütünlüğü + şartname
+ kapı kayıtları (reports/gate/) tam mı. Onay kuyruğunda bekleyen kart varsa
tag atılamaz — kuyruk boşalana kadar zincir diğer düzeltme/park işlerini
yapar. PASS + kuyruk boş → git tag v1.1, kapanış raporu, patch girdisi
(dürüst sayılarla).

## ZİNCİR SONRASI (Damla'nın el işleri — zincir yapamaz)
1. MUSLIN: bigNeckSmallShoulder gövdesinden ilk numune (+75mm omuz riski).
2. AVUKAT: marka fotoğrafı türevi kalıplar (TR/AB) — ilk satıştan önce.
3. İLK LISTING'LER: şartname + kapı + muslin fotoğraflı.
4. PAZAR VERİSİ: tık/satış/iade sayıları terim-İD frekansının yanına;
   FAZ P'nin sıradaki primitifini kasa seçer. (Gusto hattının 3. katmanı —
   Damla-zevk-modeli — kapı kararları 100'ü geçince ayrı DEVAM ile.)

## NEREDEYİZ
> (orkestratör günceller)

- 2026-07-19 F0 KOMUTA EKRANI + KAPI ALTYAPISI: **YEŞİL** (5 kriter bağımsız
  doğrulandı, motora dokunulmadı, golden sabit ctest 46/46, 0 API çağrısı).
  KURULANLAR: (1) contract/gusto-corpus.json — beş kaynaktan ölçülebilir bant,
  `_frozen: 2026-07-19`, F1-F3 SALT-OKUNUR (anayasa kilidi 1); 5 boyut ağırlık
  toplamı 1.0. (2) engine/tools/gusto-lint.mjs — PALANTIR zevk denetçisi, 5
  boyut (silhouette_grammar/proportion_bands/line_hierarchy/piece_page_bands/
  composition_bands), eşik 0.70 + boyut tabanı 0.50. KALİBRASYON: mevcut 32
  flat spec'siz koştu, ortalama 0.766, PASS 24/32, en düşük 5 = düz/sade bluz
  (çizgi katmanı 2/3 — F2 işi + az drape — F1 işi; lint doğru ayırt ediyor).
  Mihenk giysisinde spec ile TAM 5-boyut çalıştı (m1 prenses 0.933 PASS).
  (3) docs/SATIS-SARTNAMESI.md — Etsy emsallerinden 19 ölçülebilir madde
  (listing görseli/kalıp paketi/parça-sayfa bandı/talimat). (4) engine/tools/
  gate.mjs — Damla Kapısı kuyruğu (reports/gate/*.json), yaz/oku/karar döngüsü
  kanıtlı (open→list→decide→get test edildi+temizlendi). (5) engine/tools/
  contact-sheet.mjs — kontakt sayfası üreteci (adaylar + gusto rozeti + 3 Etsy
  emsali yan yana + kalemim/değil komutları); Chrome PNG ile GÖZLE onaylandı.
  (6) engine/tools/komuta.mjs — iç durum ekranı (sayılar/kuyruk/neredeyiz).
  (7) contract/taste-lexicon.md — zevk sözlüğü iskeleti (ret gerekçeleri buraya).
  MİHENK 5'LİSİ (Damla kararı 2026-07-19 "zincir seçsin"): 1 prenses fitted
  elbise · 2 wrap elbise · 3 godeli midi etek · 4 drape yaka bluz · 5 fit-flare
  60s elbise (= F1 hedefleri). İLK KONTAKT KARTI MIHENK-01 KUYRUKTA (pending);
  3'ü mevcut render'lı+puanlı, 2'si (wrap+gode) F1'de doğacak "render bekliyor".
  BİLİNÇLİ SAPMA: komuta ekranı plan "web/komuta.html (APP_TOKEN arkası)" diyordu
  ama iç durum ekranını herkese açık siteye koymak sızıntı riski + canlıda
  APP_TOKEN akışı yok → reports/gate/komuta.html + noindex, web/ DIŞI, deploy'a
  girmez (aynı güvenlik, daha az risk). DEPLOY YOK: F0 web/ altını değiştirmedi,
  iç altyapı rayı; canlı site aynı (v98). Rapor: reports/2026-07-19-stitchu-f0-
  gusto-korpus.md. KUYRUK: MIHENK-01 pending (Damla açar, onaylar/değiştirir).
  SIRADAKİ: F1 (Faz P primitifleri) — MIHENK-01 beklerken başlanabilir (mihenk
  onayı F1 çıktısını revize eder ama primitif işi paralel yürür).

- 2026-07-19 F1 KEŞİF + MIHENK-01 KARARI: motor haritası çıkarıldı (peplum
  bloğu = post-pass şablonu; garment.cpp 3 post-pass sırası doğrulandı).
  ÖNEMLİ BULGU (motor sanılandan yetenekli): prenses dikiş (bodice.cpp
  makePrincessPieces + skirt goreQuarter, armhole→apex→bel anatomik), wrap-tie
  (TiePlacement::WrapFront "front opening" kapanma), cowl/drape yaka
  (render-pages cowl-dress) ZATEN motorda. 5 mihenkten 3'ü (prenses/wrap/
  fit-flare) çizilebiliyor ama gusto-lint spec'iyle ÖLÇÜLMEDİ; gerçekten yeni
  primitif isteyen: çok-panelli gode etek + (belki) drape yaka. F1 çekirdeği
  yeniden tanımlandı: sıfırdan silüet DEĞİL → mevcut yeteneği ölç (A1-TERS) +
  eksik primitifi ekle.
  MIHENK-01 = **REJECTED** (Damla, gerekçe kayıtlı + taste-lexicon "parantez
  çizgi" girişi). ÖZÜ: prenses render'ının gövde-içi dikiş çizgileri parantez
  gibi rastgele bombeli + dikiş çizgisi konturla eşit ağırlıkta (orta katman
  1.4 eksik). KATMAN AYRIMI KANITLANDI: kalıp GEOMETRİSİ doğru (motor apex'ten
  geçen anatomik seam çiziyor), kusur FLAT ÇİZİM DİLİNDE (iç işaret çizgisi
  markings). Bu = **F2 işi, F1 değil.**
  STRATEJİK SONUÇ (sıra revizyonu adayı): gusto-lint kalibrasyonda "1.4 katman
  eksik"i yakalamıştı; Damla'nın gözü aynı kusuru doğruladı. Mihenk "kalemim"
  alamıyorsa F1 siluetleri de aynı çizim diliyle reddedilir → **F2 (Damla
  kalemi: çizgi hiyerarşisi + anatomik iç seam eğrisi) F1'den ÖNCE ya da onunla
  İÇ İÇE gitmeli.** Plandaki F0→F1→F2 sırası, ölçülen kanıtla F0→F2→F1'e
  kayabilir (F2 çizim dili mihenk kabulünün ön koşulu). Damla onayı beklenen
  karar: F2'yi öne al mı? Bu turda F2'ye geçilmedi (sıra değişikliği Damla'nın).
  SIRADAKİ: F2 öne-alma kararı Damla'da; onaya kadar F1 ölçüm işi (mevcut 3
  mihenki gerçek motordan render + gusto-lint 5-boyut + şartname) yürüyebilir.

- 2026-07-19 F2 DAMLA KALEMİ (çizgi hiyerarşisi + anatomik iç seam): **ÜRETİM
  BİTTİ, MIHENK-02 KUYRUKTA (pending, Damla "kalemim?" bekliyor).** Damla F2'yi
  öne aldı (sıra F0→F2→F1). DEĞİŞEN TEK DOSYA: engine/tools/render-garment-flat.mjs
  (fashion flat renderer; motor C++ DOKUNULMADI → golden sabit, golden_check
  PASS kanıtlı, GOLDEN YASASI: flat çıktısı golden CSV'de değil). İKİ DÜZELTME
  (MIHENK-01 ret gerekçesinin iki maddesi): (1) ÇİZGİ HİYERARŞİSİ 3 katman —
  W_OUTLINE 2.0 / W_SEAM 1.4 / W_MARK 1.0; empire seam, prenses seam, dart,
  buton çizgisi, zip, gather, back-opening hepsi doğru katmana çekildi (eskiden
  hepsi "1", orta 1.4 katmanı hiç yoktu = "dikiş kontur ile aynı ağırlıkta"
  kusuru). (2) ANATOMİK PRENSES SEAM — geom'a bust apex eklendi (apexY bustHeight
  0.30-0.60 fraksiyonundan, apexHalfX chest×0.55); iç seam artık oyuntu (chest×
  0.80) → apex → bel nip (waist×0.46) → hip 3 kübikle geçen S-eğrisi ("parantez
  gibi rastgele bombeli quadratic" GİTTİ; back princess blade-seam düzleştirildi).
  1 MİKRO-DÜZELTME: seam başlangıcı yakadan (neck×0.95 = yanlış V) oyuntuya
  (chest×0.80) taşındı. ÖLÇÜM (measured): prenses gusto line_hierarchy 0.667→
  **1.0** (3/3 katman), overall 0.933→**0.97**; Damla'nın gözünün gördüğü kusuru
  gusto-lint zaten sayıyla yakalıyordu, F2 çözdü, sayı yükseldi (aynı kusur, iki
  bağımsız kaynak). RENDER-ONAY: 3 mihenk (prenses/drape-bluz/fit-flare) yeni
  kalemle basıldı, Chrome PNG ile GÖZLE onaylandı (anatomik S okunuyor, katman
  ayrımı var). MIHENK-02 kontakt kuyrukta: prenses 0.97 PASS, fit-flare 0.97
  PASS, drape-bluz 0.795 düzeltme. STYLE-PIN + style_check ctest: MIHENK-02
  onayı gelince pinlenecek (Damla "kalemim" demeden pin yazılmaz, anayasa).
  AÇIK: ön prenses seam üst ucunda küçük kanca kaldı (Damla gözü karar verir;
  ret gelirse 2. düzeltme turu hakkı var). Rapor: bu NEREDEYİZ + kontakt sayfası.
  SIRADAKİ: MIHENK-02 kararı Damla'da; onaydan sonra STYLE-PIN + F1 (mevcut
  yetenek ölçümü + gode primitifi) yeni kalemle.

- 2026-07-19 F2 PORT (kalem dili üretim renderer'a): **1. ADIM BİTTİ, MIHENK-03
  KUYRUKTA (pending).** Damla rol ayrımı yaptı: _engine-full.mjs+styles.json =
  REFERANS KALEM (salt-okunur cetvel, işaretlendi); ÜRETİM HATTI TEK =
  render-garment-flat.mjs; F2 işi = prototip dilini parametre parametre PORT.
  PORT EDİLEN (referans kalemden üretim renderer'a): taper mürekkep fonksiyonu
  (taperInk, ortası kalın uçları sivri), deterministik drape planı (drapePlan:
  ana sırt köşeye + sönen ikincil, ink rejimi kıvrım sayısı, orta ön temiz),
  dalgalı taper shirr sıraları (düz 2 çizgi yerine büzgü panosu dokusu),
  drawstring casing. SONUÇ: boş şematik etek → el-çizimi drape; motor C++
  dokunulmadı → golden sabit. MIHENK-03 kıyas: babydoll referans vs port,
  yan yana (reports/gate/MIHENK-03-contact.html). DÜRÜST FARK (gözle):
  çizim dili (taper/drape/shirr) TUTTU ama SİLÜET FORMU eksik — referans
  strapless band-top (düz üst + kordon fiyongu), üretim hâlâ kol-oyuntulu
  bluz gövdesi çiziyor; babydoll'un strapless karakteri + üst fiyonk yok.
  Bu port'un 2. adımı (band-top form + üst tie). Damla kararı bekliyor:
  kalem dili tuttu mu, form eksiği kabul edilebilir mi? SIRADAKİ: MIHENK-03
  kararı Damla'da; onaya göre port 2. adım (strapless band-top formu) ya da
  başka mihenk.

## PARK
> (resimli adım talimatları · figür ailesi · blog musluğu · made-to-measure ·
> gusto-lint korpusu · Damla-zevk-modeli — sırası gelince ayrı DEVAM)
