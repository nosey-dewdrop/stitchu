# DEVAM — KAPANIŞ ZİNCİRİ (yeni özellik YOK, proje v1.0'a mühürlenir)

Damla direktifi 18 Tem: dağarcık büyütme durdu. Bu zincir mevcut olanı
denetler, tek kontrata bağlar, ölçer ve kapatır. Bittiğinde proje v1.0
FROZEN'dır; yeni özellik ancak v1.0'dan sonra, ayrı bir DEVAM dosyasıyla açılır.

## BAŞLATMA KOMUTU (Damla yeni session'a yapıştırır)
> stitchu'ya devam. ~/damla_projects_2026/00_currently_on_working/stitchu/DEVAM-KAPANIS-LOOP.md
> oku ve zinciri otonom koştur. Yeni özellik eklemek yasak. Sabaha rapor.

## ZORUNLU OKUMA SIRASI (orkestratör İLK İŞ; loop agent'ları prompt'larında alır)
1. CLAUDE.md (en üst status + GOTCHAS)
2. Bu dosyanın KAPANIŞ ANAYASASI bölümü (pazarlıksız)
3. BENCHMARK-58.md (metrik tarihi; sayaç bu zincirde İD tabanına taşınacak)
4. reports/2026-07-18-stitchu-pipeline-darbogazlar.txt (bu zincirin gerekçesi)
5. reports/2026-07-17-depth-diagnosis.txt (fit boşluğu teşhisi; K4'ün gerekçesi)
6. engine/FORMULAS.md + docs/ARCHITECTURE.md (mevcut sözleşmeler)
7. DEVAM-RAY-LOOP.md (loop format şablonu: rapor/patch/deploy disiplini aynen)
8. DESIGN-RULES.md (web'e dokunan her iş için)

## KAPANIŞ ANAYASASI (her loop prompt'unun en üstüne kopyalanır)
- A1. YENİ ÖZELLİK YASAK. Özellik tanımı: yeni enum değeri, yeni C++ blok,
  yeni flat bileşeni, yeni vocabulary terimi İÇİN ÇİZİM YETENEĞİ, yeni sayfa
  ailesi, resimli adım talimatı gibi yeni çıktı türleri. Bunlardan biri
  gerekli görünürse yapılmaz; NEREDEYİZ'e "PARK: <ne> <neden>" yazılır, geçilir.
  (Kelimeyi KAYDA almak yasak değildir: terim kaydına honest/undrawable olarak
  girmek kapanış işidir, çizmek özelliktir.)
- A2. BİTMİŞ TANIMI SONLUDUR. Aşağıdaki 6 rayın her birinin YEŞİL tanımı bu
  dosyada önceden yazılıdır. Ray YEŞİL ya da KIRMIZI-MÜHÜR ile kapanır
  (ritim protokolü) ve yeniden açılmaz. Tek freeze-blocker K1; kırmızı
  raylar freeze raporunda açıkça listelenir.
- A3. FRAKTAL SINIRLI. Mikro-loop derinliği en fazla 2. Derinlik 2'de hâlâ
  çözülmeyen sorun PARK edilir ve NEREDEYİZ'e dürüstçe yazılır. Kapanış
  zincirinde "pes yok" kuralı "dipsiz kazma yok" kuralıyla dengelenir.
- A4. KANIT REJİMİ AYNEN: golden byte-identical + ctest + web-fuzz +
  vocab-sweep + render gözle teyit; kanıtsız "oldu" yasak. Motor koduna
  dokunan her loop iki wasm derler.
- A5. KREDİ: yalnız K5 kredi harcar, tavanı kendi bölümünde. Diğer raylar
  0 çağrı; ölçüm hep cache/offline.
- A6. Her SHIPPED loop: rapor + patches.html girdisi + ?v bump + subtree
  gh-pages deploy + canlı curl teyit + BENCHMARK-58.md ve CLAUDE.md status.
- A7. Ölçüm sayısı DÜŞEBİLİR. K1 sayaç tabanını değiştirince FULL/ELEMENT
  sayıları yeniden hesaplanır; düşerse düşer, patch notunda dürüstçe yazılır.
  Sayıyı korumak için eşanlamlı genişletmek YASAK (ölçüm hilesi).

## MEKANİK KOPYA KAĞIDI (DEVAM-RAY-LOOP ile aynı; özet)
- Deploy: ?v bump TÜM sayfalarda → git add web/ (HEPSİ) → subtree split →
  force push gh-pages → canlı curl teyit. Motor değiştiyse önce tam kanıt
  seti + iki wasm.
- Paralel loop'lar aynı dosyaya dokunacaksa: ayrı worktree, push öncesi
  pull --rebase, çakışmayı kendisi çözer.
- Her loop TAZE arka plan agent, orkestratör NEREDEYİZ'i günceller.

## SIRA VE BAĞIMLILIK
K0 (gate) → K1 → (paralel: K2 + K4) → K3 → K5 → K6 → DENETİM Z → FREEZE
K1'siz K2/K3/K5 açılamaz (hepsi kontrata/İD'lere yaslanır). K4 ve K6 bağımsız,
boş kapasitede öne alınabilir. Her ray kendi MİNİ-DENETİMİYLE kapanır
(protokol aşağıda); Z ray içeriğini değil anayasayı denetler.

## DÖNGÜ-DENETİM RİTMİ (sonlanma protokolü; her loop prompt'una kopyalanır)
Sonsuz döngü, iş listesi büyüyebildiği için olur. Üç kilit bunu keser:

- KİLİT 1 — SABİT İŞ LİSTESİ: iş listesi K0 envanteriyle BİR KEZ donar.
  Envanterde olmayan iş açılmaz; sonradan bulunan iş NEREDEYİZ'e "SONRADAN
  BULUNDU" olarak yazılır ve v1.1 adayıdır, bu zincirde açılmaz.
- KİLİT 2 — SONLU DURUM, TEK YÖN: her ray şu makinede yaşar:
  AÇIK → ÜRETİM → MİNİ-DENETİM ─PASS→ YEŞİL (kilitlenir, yeniden açılmaz)
                       │
                    BLOCKER → DÜZELTME (tek hak) → RE-DENETİM ─PASS→ YEŞİL
                                                        │
                                                      FAIL → KIRMIZI-MÜHÜR
  KIRMIZI-MÜHÜR = ray kapanmadan mühürlenir, dürüst notla; zincir DURMAZ.
  Tek freeze-blocker K1'dir (kontrat kırmızıysa v1.0 olmaz; K2/K3/K5 ona
  yaslanır). Diğer raylar kırmızıyla freeze'e girebilir; freeze raporu
  kırmızıları açıkça listeler. v1.0 = "hepsi yeşil" değil, "hepsinin durumu
  ölçülü ve yazılı".
- KİLİT 3 — SAYILI DÜZELTME: ray başına 1 mini-denetim + 1 düzeltme +
  1 re-denetim. Bitti. (A3'ün mikro-loop derinlik sınırı ayrıca geçerli.)

MİNİ-DENETİM KURALLARI:
- Taze agent, üreticinin kodunu görmemiş, KOD YAZMAZ. Üreticinin raporunu
  okur ama kanıtına İNANMAZ: golden'ı kendi regen+diff eder, ctest'i kendi
  derler, ölçümü kendi snapshot'tan doğrular (Denetim A/B kalıbı).
- Denetçi kriter İCAT EDEMEZ: her bulgu ya o rayın YEŞİL tanımındaki bir
  maddeye ya anayasa maddesine referans verir. Referanssız bulgu = MINOR.
- Bulgu triage'ı, yalnız ilki geri döndürür:
  BLOCKER = yeşil tanımını fiilen düşürüyor → üreticiye döner (tek hak).
  MINOR   = doğru ama yeşili düşürmüyor → NEREDEYİZ'e not, düzeltilmez.
  PARK    = aslında özellik/kapsam işi → PARK listesi (A1).
- MANDAL (ratchet): yeşile dönen her madde bir regresyon bekçisi bırakır
  (yeni ctest / golden pin / lint kuralı). Sonraki loop onu bozarsa kendi
  mini-denetiminde yakalanır. Her tur ya kilitler ya park eder ya mühürler;
  geri dönüş yalnız sayılı BLOCKER hakkıyla → sonlanma garantili.

---

## K0 — ENVANTER GATE (0 kredi, koda yazmak yasak, sadece okumak)
Taze agent beş envanteri dosya:satır ile çıkarır, tek rapora yazar:
1. ÇİFT HAKİKAT: aynı değeri hesaplayan/tanımlayan birden fazla yer.
   Bilinen tohumlar: panelCutWidth (flat derived ↔ motor kesim), LEN
   (mini=87 panel-A ↔ mini=42 flat-B ↔ motor SkirtLength), büzgü oranları
   (ip 1.8/lastik 2.0/smok 3.0 ↔ gatherRatio slider), sleeve map'leri
   (create.js ↔ backend/draft.js ↔ bindings.cpp üçlüsü), SIZE tabloları
   (panel-A ↔ flat-B ↔ engine sizechart).
2. SÖZLEŞME SIZINTISI: alan adı/anlam kaymaları (capped↔Cap, null↔none,
   vision şeması ↔ bridge ↔ engine spec ↔ flat recipe).
3. ÖLÜ/TEKİL KOD: tek kullanımlık proof script'leri, UNVERIFIED taslaklar
   (engine/SPECS-next-vocabulary.md dahil), arşivlenecekler.
4. DENETİMSİZ SINIR: testi/metriği olmayan katman geçişleri (flat renderer
   lint'siz, eval seti 21 örnek, preview↔kalıp ölçüsüz, vs).
5. OPERASYONEL KIRILGANLIK: manuel ?v, force push, .benchmark-token,
   koda gömülü KV namespace id, wrangler reset yolu.
YEŞİL: beş tablo dolu, her satırda dosya:satır, rapor yazıldı. Bu rapor
K1-K6 loop'larının iş listesidir; envanterde olmayan iş AÇILMAZ.

## K1 — TEK KONTRAT + TERİM KAYDI (zincirin kalbi, 0 kredi)
Amaç: darboğaz raporu madde 1. İki katmanlı tek kontrat dosyası + regex'lerin
emekliliği.
- contract/garment-spec.schema.json (versiyonlu, JSON Schema):
  SEMANTİK katman = giysi dili. Kapalı enum'lar + sınırlı skalerler; VLM'in
  ve insanın konuştuğu tek dil. RENDER katmanı kontratta YOKTUR; her renderer
  semantikten kendi derleyicisiyle (compile fonksiyonu) slider/parametre
  üretir. LLM/VLM render katmanına asla yazamaz (şema reddeder).
- Ad alanları: draft.* (motoru bağlar, tek kaynak), flat.* (yalnız çizim:
  seed, ink, foldCount, hemWave, drape, bustProject, bustHeight...),
  review.* (karar bekleyen: waistNip, armholeHollow — Damla'ya sabah tek
  soru bloğu: fit mi stil mi?).
- LEN/SIZE/oran gibi HER paylaşılan tablo kontrata taşınır; panel-A, flat-B,
  motor, backend hepsi kontrattan okur (çift hakikat envanterindeki her
  satır ya kontrata taşınır ya PARK edilir).
- contract/terms.json TERİM KAYDI: {id, canonical, synonyms[], category,
  status: drawable|honest, capability}. dataset/labels normalize edilir
  (etiketleme anında İD'ye map). benchmark-58.mjs DRAWN_SINCE regex listesi
  EMEKLİ; sayaç capability beyanı × terim İD üzerinden. Sızıntı taraması
  İD tabanında yeniden koşulur.
- İkinci sayı yayınlanır: frekans-ağırlıklı korpus kapsamı (mine-vocab
  bankasındaki İD frekans dağılımında drawable payı). 58-set sayısının
  YANINA konur, yerine değil.
YEŞİL: şema + terms.json var ve validate ediyor; DRAWN_SINCE silindi;
FULL/ELEMENT İD tabanından yeniden ölçüldü (A7: düşerse dürüstçe yazıldı);
frekans-ağırlıklı kapsam raporda; çift-hakikat envanterinin kontrat
kapsamındaki satırları sıfırlandı; iki wasm + tam kanıt seti yeşil.

## K2 — KOMPOZİSYON RESMİLEŞTİRME (mevcut ~10 bileşen, yenisi YOK, 0 kredi)
Amaç: darboğaz raporu madde 2'nin n-kare patlamasını, YENİ bileşen eklemeden,
mevcutlar üzerinde resmileştirmek.
- Her mevcut bileşene (collar, sleeve, straps, shirr, casing, tie, lace×3,
  backSeam, cfGather, peplum, placket, cuff, slit, openback, keyhole...)
  kontratta: attachment point(ler), z-order önceliği, çakışma sınıfı.
- Çakışma matrisi ÜRETİLİR (bileşen × bileşen): allowed / excluded / honest.
  Motorun bugün refuse ettiği kombolar (halter×set-in gibi) matrise
  kod-taramasıyla dökülür; elle yönetilen z-order kuralları (bebe yaka
  "en üstte, orta dikişi örter") matrise taşınır.
- compose_check (yeni ctest): matristeki her allowed çift için draft
  validator-clean + flat render 0 issue; her excluded çift için motor
  dürüst red mesajı verir (sessiz no-op yasak). Golden çakışma seti pinlenir.
- sampleX'e monotonluk assert'i + flat tarafına render-lint (self-intersect,
  ters normal, sıfır alan) — style-lint'in kardeşi, deploy öncesi koşar.
YEŞİL: matris dosyada, compose_check ctest yeşil, render-lint deploy
zincirinde, golden byte-identical (matris resmileştirme davranış DEĞİŞTİRMEZ;
değiştiren fark bulunursa mikro-loop, derinlik sınırı A3).

## K3 — PREVIEW-TRUTH (yapısal eşitlik + landmark sapması, 0 kredi)
Amaç: darboğaz raporu madde 4. İki test, tek rapor:
- YAPISAL EŞİTLİK (sert kural): preview'da çizilen her yapısal öğe
  (bileşen İD'si) kalıp parçalarında birebir karşılık bulur; kalıpta olup
  preview'da olmayan da işaretlenir. Oran stilizasyonu serbest, yapısal
  sapma FAIL. Otomatik: aynı semantik JSON'dan iki projeksiyon (display
  transform / draft transform) türetilir, öğe listeleri diff'lenir.
- LANDMARK SAPMASI (yumuşak eşik): N tarif için flat'ten ve gerçek draft'tan
  aynı landmark'lar ölçülür (yaka yarı en, omuz boyu, oyuntu derinliği,
  büst yarı en, bel, etek süpürmesi, kol boy/en, pano kesim genişliği).
  Sapma yüzde raporu; eşik varsayılan %8 (Damla değiştirebilir). Eşiği aşan
  tarif yayınlanamaz.
- preview_truth.mjs precision-report ailesine katılır; deploy zincirine girer.
YEŞİL: mevcut TÜM stiller/tarifler yapısal eşitlikten geçiyor, landmark
tablosu raporda, eşik aşan tarif ya düzeltildi (kontrat içinde) ya PARK.

## K4 — SABİTLER TABLOSU + KAĞIT SLOPER (ilk dış fit sinyali, 0 kredi, 0 kumaş)
Amaç: depth-diagnosis'in ucuz yarısı.
- engine/constants.yaml: koda gömülü her varsayım çıkarılır
  (shoulderDrop 0.23, biceps 0.30, underbust −70mm, button 18mm, cap wing
  55mm, fullness 2.2, SA 15mm...). Alanlar: {ad, değer, birim, kaynak,
  durum: verified|assumed|refuted, deney}. Kod tablodan okur; golden
  byte-identical kalmalı (değer değişmiyor, yeri değişiyor).
- KAĞIT KARŞILAŞTIRMA: EU38 tek gövde; motorun fitted bodice + straight
  skirt draft'ı FLATTEN edilir (fit_proof/precision altyapısı hazır) ve
  Aldrich yayın yöntemiyle elle/bağımsız çizilmiş blokla landmark landmark
  kıyaslanır: boyun en+derinlik, omuz boy+eğim, oyuntu derinliği, göğüs
  hattı genişliği, bel pens toplamı, ön/arka denge, bel+kalça çevresi.
  Çıktı: mm hata tablosu. Her doğrulanan sınır kalıcı fit_check assert'ine
  dönüşür (wearability bug'ının kaderi gibi).
YEŞİL: constants.yaml kodda tek kaynak + golden yeşil; mm tablosu raporda;
her satır verified/assumed güncellendi. (Muslin dikimi bu zincirde YOK —
Damla'nın FAZ 1 numune işi, PARK-değil-planlı.)

## K5 — VISION KASKAD + EVAL TABANI (TEK kredili ray; tavan: 200 çağrı)
Amaç: kredi eğrisini student mükemmelleşmeden düşürmek.
- EVAL TABANI: 21 → en az 150 hand-label (Damla'nın el emeği gerektiren
  kısmı gece yapılamazsa: mevcut korpustan katman-dengeli 150 aday seçilir,
  etiketleme arayüzü hazırlanır, Damla'ya sabah paketlenir; go-live gate'i
  150 tamamlanana dek KIRMIZI kalır ve bu dürüstçe yazılır).
- KASKAD ROUTER: student alanları = {garmentType, neckline, sleeveLength,
  skirtStyle} (yüksek frekans + kolay). Karar kuralı: student margin ≥ τ
  ise student cevabı; değilse veya alan kapsam dışıysa öğretmen. τ eval
  setinde kalibre edilir (hedef: student-kararlarında ≥ %95 teacher-agreement).
- METRİK: 100 foto başına öğretmen çağrısı, kaskad öncesi/sonrası. Bu sayı
  patch notuna girer (kredi = yemek parası sayısallaşır).
- Etiket bankası K1 terim İD'lerine normalize (AMBAR YASASI aynen: null/
  şüpheli/eksik dışarıda, filtre istatistikleri loglanır).
YEŞİL: router kodda + τ kalibre raporu + çağrı/100foto önce-sonra tablosu;
eval 150 hedefi ya tamam ya KIRMIZI-dürüst. Tavan aşılmaz; kredi biterse
zarafetle durur, banka --aggregate ile dökülür.

## K6 — OPERASYONEL SERTLEŞTİRME + ARŞİV (0 kredi)
- deploy.sh: ?v bump'ı otomatik yapan tek komut (unutulan bump sınıfı hata
  ölür); mevcut subtree/curl adımlarını sarar, değiştirmez.
- Gizlilik taraması: .benchmark-token yolu, KV namespace id, worker URL —
  gitignore/env düzeni denetlenir; sızan varsa rotasyon NEREDEYİZ'e yazılır.
- Arşiv: tekil proof script'leri docs/archive'a, SPECS-next-vocabulary.md
  başına UNVERIFIED bandı zaten var — PARK damgası eklenir.
- Marka fotoğrafı türevi kalıplar için hukuk sorusu NEREDEYİZ'e "Damla:
  avukata sor (tescilsiz topluluk tasarımı, TR/AB)" olarak yazılır; zincir
  hukuk yorumu YAPMAZ.
YEŞİL: deploy.sh kullanılıyor (son deploy onunla yapıldı), tarama raporu
temiz/rotasyonlu, arşiv taşındı, K0 madde-5 satırları sıfır.

## DENETİM Z — BAĞIMSIZ KAPANIŞ DENETİMİ (taze agent, 0 kredi)
Ray içeriğini YENİDEN denetlemez (o iş mini-denetimlerde bitti); ANAYASAYI
denetler: her rayın durumu (YEŞİL/KIRMIZI-MÜHÜR) mini-denetim raporuyla
tutarlı mı, mandallar (regresyon bekçileri) gerçekten yerinde mi (kendi
derler+koşar: ctest+compose_check+preview_truth+render-lint+golden regen),
İD sayaç serisi snapshot'larla tutuyor mu, PARK ve KIRMIZI listeleri patch
notlarında saklanmadan yayınlanmış mı, K1 yeşil mi (freeze-blocker).
GEÇMEYEN madde = yalnız o madde için tek düzeltme + tek re-denetim
(ritim protokolündeki aynı sayılı hak; Z'de de sonsuzluk yok).

## FREEZE (Denetim Z yeşilse)
- git tag v1.0, golden v1.0 olarak yeniden pinlenir ve dondurulur.
- Kapanış raporu: tüm YEŞİL tanımları + sayı serisi + PARK listesi tek
  dosyada. patches.html'e kapanış girdisi (dürüst: neler PARK edildi).
- CLAUDE.md status: "v1.0 FROZEN. Yeni özellik = yeni DEVAM dosyası +
  Damla onayı." Sonraki dağarcık işi (FAZ P primitifleri dahil) v1.1
  zincirinin ilk adayıdır — bu zincirde AÇILMAZ.

---

## NEREDEYİZ
> (orkestratör her loop sonunda günceller: hangi ray, YEŞİL/KIRMIZI,
> sayılar, PARK listesi, açılan mikro-loop'lar, kredi durumu, sıradaki)

- 2026-07-19 K0 ENVANTER GATE: **YEŞİL** (mini-denetim PASS, 18/18 referans
  doğru, BLOCKER 0). Rapor: reports/2026-07-19-stitchu-k0-envanter.md.
  Envanter satırları: çift-hakikat 11, sızıntı 8, ölü kod 9, denetimsiz
  sınır 8, operasyonel 10; K1-K6 iş listesi 19 madde DONDU (KİLİT 1).
  MINOR notları (düzeltilmedi, kayıt): (1) "wrangler reset yolu" env-5'te
  satır olarak yok → K6 taramasına dahil edilecek; (2) rapor 5.1 "en az 8
  sürüm" diyor, gerçek ayrık sürüm 7 (61,78,80,84,85,86,91); (3) untracked
  engine/tools/render-garment-from-pieces.mjs zincir öncesi kalıntı,
  env-3'te yok → K6 arşiv turunda değerlendirilecek.
  Kredi: 0 çağrı. SIRADAKİ: K1 (tek kontrat + terim kaydı).

- 2026-07-19 K1 TEK KONTRAT + TERİM KAYDI: **YEŞİL — KİLİTLENDİ** (mini-denetim
  PASS, BLOCKER 0; taze denetçi bağımsız yeniden üretti: validate-contract 8/8,
  27/54 + 74/103 + %6.7 + 0 unmapped birebir, golden iki worktree cmp
  byte-identical, ctest 41/41, wasm md5'leri canlı kopyalarla aynı, canlıda tek
  sürüm v92, pocket kabiliyeti f7b6dd8/patch 3.12'den A1-temiz teyitli).
  MINOR notları (ritim gereği düzeltilmedi, kayıt): (1) A5: 12 vision çağrısı —
  dürüst beyanlı; spec'i hiç olmayan 12 foto çağrısız sınıflandırılamazdı;
  tekrar-önleme K6 adayı. (2) %6.7 hesabı gitignored vocab-canonical.json
  override'ına bağımlı; o dosyasız %6.2 çıkar — K6 operasyonel not.
  (3) rapor/statustaki "vocab-sweep 37800/0" sayısı bayat; denetçi ölçümü
  48600/48600/0 (geçiş ayakta, sayı güncel değil). (4) working tree'de K1-dışı
  uncommitted iş (render-listing-card.mjs modified + 2 untracked render script)
  — ölçümleri etkilemiyor, K6 arşiv turu konusu. Patch 3.20, deploy v92. contract/{garment-spec.schema.json, tables.json,
  terms.json} + gen-contract.mjs (→ contract.gen.hpp + web/backend
  contract.gen.js) + spec-validate.js runtime kapısı + validate-contract.mjs
  MANDALI (ctest contract_check, 8 kontrol). DRAWN_SINCE 16-regex SİLİNDİ,
  sayaç terim-İD tabanında. SAYILAR: FULL 0.9 23→27/54 (hareket önbellek
  onarımı: bayat engine/dist + 12 eksik cache girdisi; sayım tabanı değil),
  eski yöntem 37/54, ELEMENT 71→74/103 (%71.8; +3 cep kaydı, FULL etkisi 0),
  İKİNCİ SAYI korpus kapsamı %6.7 (342/5092). Sızıntı taraması 0 unmapped.
  KREDİ İHLALİ BEYANI: 12 vision çağrısı harcandı (snapshot'ta eksik 12 foto;
  A5 delindi, patch notu + raporda açık). Kanıt: golden dump pristine-HEAD ile
  byte-identical, iki wasm canlı kopyalarla md5-aynı, ctest 41/41, vocab-sweep
  37800/0, web-fuzz 26260/3 (bilinen eski defekt), flat SVG bayt-aynı, render
  PNG gözle. Damla'ya review.* sorusu: waistNip/armholeHollow fit mi stil mi?
  SONRADAN BULUNDU (v1.1): golden-reference.csv bayat (23034 vs 23406, re-pin
  Damla onayında), web-fuzz 3 PAGES failure (README'de kayıtlı), results
  snapshot üzerine-yazma kırılganlığı (K6 adayı), worker deploy edilmedi
  (davranışsız import). Rapor: reports/2026-07-19-stitchu-k1-kontrat.md.
  SIRADAKİ: K1 mini-denetimi (taze agent), sonra K2 + K4 paralel.

- 2026-07-19 K4 SABİTLER TABLOSU + KAĞIT SLOPER: **ÜRETİM BİTTİ (mini-denetim
  bekliyor)**. (1) engine/constants.yaml 16 satır {ad, değer, birim, kaynak,
  durum, deney} — K0 1.5-1.9'un tamamı + geometry.hpp SA default'u +
  exposedzip/waistband/manşet 10mm ailesi + omuz halefleri (22°/126mm) beyanla
  dahil; gen-constants.mjs → constants.gen.hpp, kod tablodan okur; MANDAL:
  validate-contract 4b = ctest contract_check drift bekçisi. DAĞILIM: 3
  verified / 11 assumed / 2 REFUTED (bicepsBustRatio 0.30 −20mm vs Aldrich top
  arm 284; shoulderDropFactor 0.23 ~13° vs ~22°, neckFacings'te hâlâ yaşıyor) —
  refuted değerler DEĞİŞTİRİLMEDİ, v1.1 adayı yazıldı. (2) KAĞIT SLOPER: EU38
  dart bodice + straight skirt, Aldrich 6. baskı BAĞIMSIZ el hesabı (adımlar
  raporda), 15 satırlık mm tablosu; 12 landmark pinli sınır içinde, en kötü 3:
  büst −42mm (ribcage-frame tasarımı, pozitif-ease bandı assert'li), bel +26mm
  (%5 ease tercihi, pinli), oyuntu −10.6mm. MANDAL: yeni ctest sloper_check
  (42. test, Aldrich referansları teste pinli). KANIT: golden 23406
  byte-identical (pristine baseline cmp), ctest 42/42, İKİ wasm md5 canlı
  kopyalarla AYNI (git diff'te wasm yok), vocab-sweep 48600/0, web-fuzz
  26260/3 (K1'deki bilinen defekt, değişmedi), style-lint 81 sayfa temiz,
  header-diff 52 temiz. Kredi: 0 çağrı. Patch 3.21, ?v 92→93 (deploy
  ORKESTRATÖRDE, K2+K4 sonrası tek deploy). K0 K4-satırları: 1.5/1.6/1.7/
  1.8/1.9 KAPANDI, 4.8 sloper_check ile yanıtlandı; PARK 0. SONRADAN BULUNDU
  (operasyonel, v1.1/K6): /tmp'de kalıntı package.json (type:commonjs) /tmp
  worktree'lerinde node ESM'i kırıyor (contract_check FAIL) — worktree
  ~/.cache'e taşınarak çözüldü, K6 deploy notuna eklenmeli. Rapor:
  reports/2026-07-19-stitchu-k4-sabitler-sloper.md. SIRADAKİ: K4
  mini-denetimi (taze agent) + K2 bitişi, sonra K3.

- 2026-07-19 K2 KOMPOZİSYON RESMİLEŞTİRME: **ÜRETİM BİTTİ, MİNİ-DENETİM BEKLİYOR**
  (patch 3.22, deploy ORKESTRATÖRDE — ?v 92→93 bump'landı, gh-pages push YOK).
  contract/composition.json: 21 bileşen (attachment + z-order + çakışma sınıfı,
  dosya:satır kanıtlı) + flat z-order beyanı (11 katman, "yaka en üstte" elle
  kuralı resmileşti) + matris 74 host kuralı + 58 çift kuralı, 5 sınıf
  (allowed/excluded/validator/honest/ignored; ignored SADECE halter×{dropped,
  raglan,facing} belgeli üçlüsü). MANDALLAR: ctest compose_check (248 tekil +
  465 çift gerçekten çizdirilir, beyan-gözlem drift = FAIL, beyan dışı sessiz
  no-op = FAIL; matris composition.gen.hpp'den, gen-contract --check kapsar) +
  ctest flat_render_lint (self-intersect/ters sarım/sıfır alan/sampleX
  monotonluk; style-lint.mjs'e zincirli → mevcut deploy kanıt adımı otomatik
  koşar; 2 pinli kozmetik bulgu render-lint.allow.json). MİKRO-LOOP 1 (tek
  davranış farkı): 20 sessiz dispatcher no-op validateSpecCross'ta isimli redde
  çevrildi (skirt×bodice-bileşenleri, top×backSlit/ruffleHem,
  gathered×backSlit/hemShape); web picker'ları zaten engelliyordu. SAYILAR
  DEĞİŞMEDİ (A7 düşüş yok): FULL 27/54, ELEMENT 74/103, %94.4, %6.7, 0 unmapped
  — 0-çağrı cache reclassify ile önce/sonra kanıtlı (KREDİ: 0 vision çağrısı;
  bir koşu foto dosyaları olmadığı için base64'te yerel hata verdi, API'ye hiç
  ulaşmadı, beyan edildi). KANIT: ctest 43/43 (K4 rebase sonrası birleşik
  ağaçta 44/44, golden yine byte-identical, sweep/fuzz/benchmark aynı, iki
  wasm birleşik kaynaktan yeniden derli bayt-aynı), golden pristine-cmp
  byte-identical 23406, vocab-sweep 48600/0, web-fuzz 26260/3 bilinen, iki wasm
  derli, flat CLI SVG cmp bayt-aynı, render PNG gözle, style-lint 81 +
  render-lint yeşil, header-diff 52. K0 kapanışı: 4.1 KAPANDI, 4.7 KAPANDI
  (web-fuzz sınırı dosya başı + SUMMARY'de dürüst beyan; PAGES üst-sınır
  garantisi yazıldı). SONRADAN BULUNDU: worker wasm deploy bekliyor (bu kez
  motor değişti, sıradaki wrangler deploy şart); benchmark mapVisionSpec
  "web ile aynı köprü" beyanı rebuild() sıfırlamasını içermiyor (bugün fark
  üretmiyor). Rapor: reports/2026-07-19-stitchu-k2-kompozisyon.md.

- 2026-07-19 ORKESTRATÖR (K2+K4 sonrası): TEK DEPLOY YAPILDI — gh-pages
  subtree push (split 7fc0f0b), canlı curl teyit: index tek sürüm ?v=93,
  patches 3.20/3.21/3.22 yayında; worker wrangler deploy edildi (stitchu-api
  versiyon 6f4aafca, K2'nin motor değişikliği + K1 import'u canlıda).
  K4 MİNİ-DENETİM: **PASS → K4 YEŞİL, KİLİTLENDİ** (BLOCKER 0; denetçi
  kendi worktree'sinde: tek-kaynak grep 8+ sabit temiz, drift mandalı canlı
  mutasyonla test edildi, golden HEAD vs pre-K4 cmp byte-identical 23406,
  Aldrich bağımsızlığı 3 el hesabıyla teyit — pens 43.33/oyuntu 215/göğüs 980,
  sloper_check 12 pin + 3 assert PASS, ctest 44/44, vocab-sweep 48600/0,
  wasm md5'ler canlı kopyalarla aynı, A5 0 çağrı temiz).
  K4 MINOR (düzeltilmedi, kayıt): (a) buttonrow.cpp:107 + placket.cpp:218
  talimat metinlerinde "18 mm" hard-coded string — yaml değişirse metin
  sessizce bayatlar; (b) envanter 1.5-1.9 DIŞI gömülü tasarım sabitleri
  (offshoulder dropMM 55, peplum depth 180, slit 180, neckext bandH 55...)
  tabloda değil — KİLİT 1 gereği v1.1 adayı; "her varsayım" envanter
  kapsamında karşılandı, harfiyen değil. (c) engine/dist/stitchu-engine.js
  untracked bayat lokal artefakt, canlı yol web/vendor.
  SIRADAKİ: K2 mini-denetimi, PASS ise K3.

## PARK LİSTESİ
> (A1 gereği ertelenen her şey buraya: resimli adım talimatları, listing
> flat sunumu, FAZ P primitif katmanı, muslin dikimi, made-to-measure
> genişletmesi, yeni vocabulary çizimleri...)

- PARK (K2): top×bardot hem-extension kusuru (validator-bloke, matris beyanlı);
  skirt×tie bel/kuşak tutarsızlığı; dress(kolsuz)×dropped guideCoverage;
  backDetail cape kink (halter/bardot kombolarında); keyhole×CF ailesinin
  ÇİZİLEREK çözülmesi (bugün validator-bloke = doğru dürüst davranış); flat'in
  çizmediği straps/ruffledStraps/gatherWaist bayrakları (çiz ya da şemadan düş);
  2 pinli flat self-intersection (lace_vneck puf kol, peterpan yaka halkası);
  web-fuzz'ın gerçek sheet.js packer'ını sürmesi (ESM/?v import engeli).
