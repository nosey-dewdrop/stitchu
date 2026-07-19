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
F0 → F1 → F2 → F3 → DENETİM → v1.1 tag
(F4 şartname F0'da doğar, F1-F3'ün hepsine denetim olarak bağlanır; ayrı ray değildir.)

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

## PARK
> (resimli adım talimatları · figür ailesi · blog musluğu · made-to-measure ·
> gusto-lint korpusu · Damla-zevk-modeli — sırası gelince ayrı DEVAM)
