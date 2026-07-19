# stitchu v1.0 KAPANIŞ RAPORU (2026-07-19, kapanış zinciri FREEZE)

Damla direktifi 18 Tem: dağarcık büyütme durdu, mevcut olan denetlenir,
tek kontrata bağlanır, ölçülür ve kapatılır. Zincir K0 → K1 → (K2+K4) →
K3 → K5 → K6 → Denetim Z sırasıyla koştu; her ray taze mini-denetçiyle
kilitlendi, Denetim Z anayasa denetiminden FREEZE-HAZIR verdi. Bu rapor
kapanışın tek dosyası: yeşil tanımları, sayı serisi, PARK listesi,
kırmızı kalemler, ihlal beyanı, v1.1 adayları ve Damla'ya açık kalemler.

Proje durumu: v1.0 FROZEN. Yeni özellik ancak yeni bir DEVAM dosyası +
Damla onayıyla açılır.

## 1. ALTI RAY: YEŞİL TANIMLARI + MİNİ-DENETİM SONUÇLARI

### K0 — ENVANTER GATE (YEŞİL)
Tanım: beş envanter tablosu dolu (çift hakikat, sözleşme sızıntısı,
ölü kod, denetimsiz sınır, operasyonel kırılganlık), her satırda
dosya:satır, iş listesi bu envanterle donar.
Sonuç: 46 satır (11+8+9+8+10), K1-K6 iş listesi 19 madde donduruldu.
Mini-denetim PASS, 18/18 referans doğru, BLOCKER 0.
Rapor: reports/2026-07-19-stitchu-k0-envanter.md

### K1 — TEK KONTRAT + TERİM KAYDI (YEŞİL, tek freeze-blocker'dı)
Tanım: şema + terms.json validate ediyor; DRAWN_SINCE regex'leri silindi;
FULL/ELEMENT terim-İD tabanından yeniden ölçüldü (düşerse dürüstçe);
frekans-ağırlıklı korpus kapsamı yayınlandı; çift-hakikat satırları
kontrata taşındı; iki wasm + tam kanıt seti yeşil.
Sonuç: contract/{garment-spec.schema.json, tables.json, terms.json} +
gen-contract.mjs (C++ ve JS tek kaynaktan üretilir) + spec-validate.js
runtime kapısı + validate-contract.mjs mandalı. 51 terim, 237 ifade,
DRAWN_SINCE 16-regex öldü. Sayaç İD tabanına geçti: FULL 23→27/54
(hareket önbellek onarımı, sayım tabanı değil), ELEMENT 71→74/103.
Mini-denetim PASS: denetçi 27/54 + 74/103 + %6.7 + 0 unmapped + golden
cmp + ctest'i bağımsız yeniden üretti. BLOCKER 0.
Rapor: reports/2026-07-19-stitchu-k1-kontrat.md

### K2 — KOMPOZİSYON RESMİLEŞTİRME (YEŞİL)
Tanım: çakışma matrisi dosyada, compose_check ctest yeşil, render-lint
deploy zincirinde, golden byte-identical.
Sonuç: contract/composition.json (22 bileşen kaydı; attachment + z-order
+ çakışma sınıfı, dosya:satır kanıtlı; matris 74 host + 58 çift kuralı,
5 sınıf). İki mandal: compose_check (248 tekil + 465 çift gerçekten
çizdirilir, beyan-gözlem drift FAIL) + flat_render_lint. Tek davranış
farkı: 20 sessiz dispatcher no-op isimli redde çevrildi.
Mini-denetim PASS: compose_check 713/713 denetçi derlemesiyle, 6 bağımsız
wasm probe'unda sessiz no-op sıfır, golden pre-K2 vs HEAD byte-identical.
BLOCKER 0. Rapor: reports/2026-07-19-stitchu-k2-kompozisyon.md

### K3 — PREVIEW-TRUTH (YEŞİL)
Tanım: tüm stiller yapısal eşitlikten geçiyor, landmark tablosu raporda,
eşik aşan tarif ya kontrat içinde düzeltildi ya PARK.
Sonuç: contract/preview-truth.json; 4 flat stili tek semantik kayıttan
iki projeksiyona (DISPLAY reçetesi / DRAFT canlı wasm) türetilip
diff'leniyor. Yapısal eşitlik 4/4 yeşil; landmark %8 yumuşak eşikte
süpürme/panelCutWidth/sleeveLen OK; 8 stilizasyon landmark'ı kontrat
referanslı pinli zarfta (flat'ler Damla-onaylı foto-türevi sanat, oranı
mühendislik oranına çekmek tasarım değişikliği olurdu; pin mandal, ötesi
deploy düşürür). Mandal: ctest preview_truth_check + style-lint kancası +
paylaşılan-packer bekçisi; mutasyonla kanıtlı.
Mini-denetim PASS: 4/4 kendi koşusu, üç mandal mutasyonu FAIL+restore,
pinli karar MEŞRU. BLOCKER 0.
Rapor: reports/2026-07-19-stitchu-k3-preview-truth.md

### K4 — SABİTLER TABLOSU + KAĞIT SLOPER (YEŞİL)
Tanım: constants.yaml kodda tek kaynak + golden yeşil; mm tablosu
raporda; her satır verified/assumed/refuted damgalı.
Sonuç: engine/constants.yaml 16 satır (3 verified / 11 assumed /
2 REFUTED: bicepsBustRatio 0.30 ve shoulderDropFactor 0.23; refuted
değerler DEĞİŞTİRİLMEDİ, v1.1 adayı). Kağıt sloper: EU38 dart bodice +
straight skirt, Aldrich 6. baskı bağımsız el hesabıyla 15 satırlık mm
tablosu; 12 landmark pinli sınır içinde (en kötü: büst -42mm ribcage
tasarımı, bel +26mm ease tercihi, oyuntu -10.6mm). Mandal: ctest
sloper_check (Aldrich referansları teste pinli) + constants drift bekçisi.
Mini-denetim PASS: drift mandalı canlı mutasyonla, Aldrich bağımsızlığı
3 el hesabıyla teyit. BLOCKER 0.
Rapor: reports/2026-07-19-stitchu-k4-sabitler-sloper.md

### K5 — VISION KASKAD + EVAL TABANI (YEŞİL; içindeki eval-150 gate KIRMIZI)
Tanım: router kodda + tau kalibre raporu + çağrı/100foto önce-sonra;
eval 150 hedefi ya tamam ya KIRMIZI-dürüst; tavan 200 aşılmaz.
Sonuç: 4 lokal student başı 1600 ambar etiketinden damıtıldı (global
sızıntısız split); tau kalibrasyonu VAL-only, hedef %95 teacher-agreement
(sleeveLength 0.94, skirtStyle 0.90, garment/neckline sınıf-koşullu).
Çağrı/100foto 100→97.5 (ölçülü, dürüst: kazanç küçük, fren garment başı).
Router bayrak KAPALI + eval-gate (150 hand-label) mekanik; public yol
değişmedi. Eval tabanı: 150 katman-dengeli aday + lokal etiketleme aracı
+ sabah paketi hazır; 150 etiket Damla'da → GATE KIRMIZI (bkz. bölüm 5).
Kredi: 1/200 canlı çağrı.
Mini-denetim PASS: tau cache'den birebir yeniden üretildi, split overlap
0, çift kapı CLI ile kanıtlı, teacher sızıntısı yok. BLOCKER 0.
Rapor: reports/2026-07-19-stitchu-k5-vision-kaskad.md

### K6 — OPERASYONEL SERTLEŞTİRME + ARŞİV (YEŞİL)
Tanım: deploy.sh kullanılıyor (son deploy onunla), tarama raporu
temiz/rotasyonlu, arşiv taşındı, K0 madde-5 satırları sıfır.
Sonuç: scripts/deploy.sh (otomatik ?v bump + tek-sürüm mandalı + kanıt
zinciri kapısı + motor guard + worker-URL drift guard); gizlilik taraması
SIZINTI YOK, rotasyon gerekmedi (.benchmark-token git geçmişine hiç
girmemiş, canlı sk-ant repoda yok); 20+ dosya docs/archive'a; patches.html
em-dash stoku sıfırlandı (style-lint artık fiilen kapı); vocab-canonical
commit (%6.7 repodan yeniden üretilebilir). K0 madde-5: 10/10 kapandı.
Mini-denetim PASS: 5 mandal kod okuması + kuru mutasyonla, kendi subtree
split'i gh-pages HEAD ile birebir, anahtar geçmiş taraması 0. BLOCKER 0.
Rapor: reports/2026-07-19-stitchu-k6-operasyon.md

### DENETİM Z (anayasa denetimi)
Ray içeriği değil anayasa denetlendi: ray durumları mini-denetim
raporlarıyla tutarlı, mandallar yerinde (bağımsız derleme + koşu),
İD sayaç serisi snapshot'larla tutuyor, PARK ve KIRMIZI listeleri
yayınlanmış, K1 yeşil. Sonuç: FREEZE-HAZIR.

## 2. SAYI SERİSİ (hepsi kanıt rejiminden, iddia değil ölçüm)

- FULL pattern: 27/54 (terim-İD tabanı, K1'de 23→27; hareket önbellek
  onarımıydı, sayım tabanı değişimi değil). Bağlam: eski regex yöntemi
  aynı fotoğraflarda 37/54 diyordu; İD tabanı daha sert ve daha dürüst,
  A7 gereği düşüş açıkça yayınlandı.
- ELEMENT accuracy: 74/103 (%71.8).
- Vision accuracy: 51/54 (%94.4).
- Frekans-ağırlıklı korpus kapsamı (ikinci sayı): 342/5092 (%6.7),
  vocab-canonical.json commit'li, repodan yeniden üretilebilir.
- ctest: 45/45 (contract_check, compose_check, flat_render_lint,
  sloper_check, preview_truth_check dahil).
- Golden: 23406 satır byte-identical (pristine cmp, her rayda ayrı ayrı
  kanıtlandı). golden-reference.csv legacy pini 23034'te (bölüm 7a).
- vocab-sweep: 48600/0.
- web-fuzz: 26260/3 (3 = bilinen eski PAGES packing defekti, README'de
  kayıtlı; bu zincirde değişmedi).
- Kredi: K5 1/200 + K1 ihlal beyanı 12 çağrı (bölüm 6). Diğer raylar 0.
- Canlı site: tek sürüm, patch 3.20-3.26, scripts/deploy.sh ile.

## 3. PARK LİSTESİ (A1 gereği bu zincirde açılmadı, tamamı)

- PARK (K1): worker.js vision prompt'unu şemadan üretmek (davranış
  değiştirir); made-to-measure genişletmesi; flat-engine'e yeni stil.
- PARK (K2): top×bardot hem-extension kusuru (validator-bloke, matris
  beyanlı); skirt×tie bel/kuşak tutarsızlığı; dress(kolsuz)×dropped
  guideCoverage; backDetail cape kink (halter/bardot kombolarında);
  keyhole×CF ailesinin ÇİZİLEREK çözülmesi (bugün validator-bloke =
  doğru dürüst davranış); flat'in çizmediği straps/ruffledStraps/
  gatherWaist bayrakları (çiz ya da şemadan düş); 2 pinli flat
  self-intersection (lace_vneck puf kol, peterpan yaka halkası);
  web-fuzz'ın gerçek sheet.js packer'ını sürmesi (ESM/?v import engeli).
- PARK (K3): lace trim çizim kabiliyeti (flat lace bantlarını çiziyor,
  motorun lace parçası yok); yayın notu: lace flat'leriyle kurulan
  listing "dantel hazır şerittir, kalıp parçası değildir" demek zorunda
  (contract/preview-truth.json allowlist girdisinde kayıtlı).
- PARK (K6): SPECS-next-vocabulary.md (UNVERIFIED + PARK bandıyla
  damgalı; taslak, plan değil).
- Zincir tanımı gereği planlı-dışarıda: muslin dikimi (Damla'nın FAZ 1
  numune işi), FAZ P primitif katmanı, resimli adım talimatları, yeni
  vocabulary çizimleri.

## 4. KIRMIZI-DÜRÜST KALEMLER

- K5 eval-150 gate: KIRMIZI. Kaskad go-live kapısı kodda mekanik olarak
  ≥150 hand-label istiyor; bugün 0/150. Aday seçimi + etiketleme aracı +
  sabah paketi hazır (dataset/eval/README.md, ~25-30 dk). Gate, Damla
  150 etiketi elle bitirene kadar kırmızı kalır ve bu, K5 yeşilini
  düşürmez (yeşil tanımı "ya tamam ya KIRMIZI-dürüst" idi).
- Kırmızı-mühürlü ray YOK: altı rayın altısı da yeşil kilitlendi.

## 5. A5 İHLAL BEYANI

K1'de 12 canlı vision çağrısı harcandı (A5: K1 0-çağrı raydı). Sebep:
results snapshot'ında 12 fotoğrafın spec'i hiç yoktu, çağrısız
sınıflandırılamazlardı. Patch notunda ve K1 raporunda açık beyan edildi;
mini-denetim MINOR saydı (dürüst beyanlı). Tekrar-önleme (snapshot
kırılganlığı) v1.1 adayı. K5'in 1 çağrısı ihlal değil (K5 kredili ray,
tavan 200).

## 6. v1.1 ADAY LİSTESİ (SONRADAN BULUNDU + MINOR'lardan; bu zincirde açılmadı)

Operasyonel:
1. Benchmark results snapshot'larının üzerine-yazma kırılganlığı →
   tarih+saat damgalı geçmiş (bir kez yayınlanmış sayıyı yeniden
   kurulamaz hale getirdi; A5 ihlalinin de kökü).
2. Worker URL inline kopyalarının module-import refactor'ü (şimdilik
   deploy guard'ıyla mühürlü).
3. KV_NS çift kopyası tek kaynağa (wrangler.toml ↔ benchmark-58.mjs).
4. Araçlardaki (benchmark/mine-vocab) worker URL kopyalarını guard
   kapsamına almak.
5. deploy.sh canlı doğrulamasını 4 sayfanın ötesine genişletmek.

Motor/kontrat:
6. golden-reference.csv re-pin 23034→23406 (Damla onayı; bölüm 7a).
7. REFUTED sabitlerin düzeltilmesi: bicepsBustRatio 0.30 (-20mm vs
   Aldrich) ve shoulderDropFactor 0.23 (~13° vs ~22°, neckFacings'te
   yaşıyor) — kağıt sloper kanıtı hazır, değer değişikliği golden kırar,
   bilinçli v1.1.
8. Envanter 1.5-1.9 dışı gömülü tasarım sabitleri constants.yaml'a
   (offshoulder dropMM 55, peplum depth 180, slit 180, neckext bandH 55).
9. buttonrow.cpp:107 + placket.cpp:218 talimat metinlerindeki hard-coded
   "18 mm" string'leri (yaml değişirse metin sessizce bayatlar).
10. 2 pinli flat self-intersection'ın gerçek çözümü (render-lint.allow
    girdileri).
11. Lace trim'i çizilebilir kabiliyete çevirmek (K3 PARK).
12. benchmark mapVisionSpec köprüsüne create.js rebuild() sıfırlamasını
    eklemek (bugün fark üretmiyor, beyan farkı).
13. preview-truth allowStructural girdilerine contractRef zorunluluğu
    (lint; bugün referanssız girdi sessiz geçerdi).
14. web-fuzz 3 PAGES failure'ının gerçek onarımı (bilinen packing
    defekti) + gerçek sheet.js packer'ını fuzz'a sürmek.
15. FAZ P primitif katmanı ve dağarcık büyütme: v1.1 zincirinin ilk
    büyük adayı (Damla onayıyla, yeni DEVAM dosyasıyla).

## 7. v1.2 ADAYI — YAPIM KATMANI ("evde couture"nün kalbi, Damla 2026-07-19)
Kumaş bilgisi (web/data/fabrics.json seed_fabrics) kalıba İKİ KÖPRÜ ile bağlanır.
Bu, "evde couture" vaadinin somutlaştığı yer; resimli talimat rayıyla BİRLİKTE
planlanır (talimat = köprünün çıktısını gösterir).

KÖPRÜ 1 — stretchPercent → ease/bolluk geometrisi (zaten aday listede, madde
büyütüldü): kumaşın esneme yüzdesi motorun woven-ease varsayımını değiştirir;
örgü kumaşta negatif ease (kalıp vücuttan dar), dokumada pozitif ease. draft
geometrisine girer → golden'ı oynatır (bilinçli, beyanlı re-pin).

KÖPRÜ 2 — İÇ YAPI ÖNERİLERİ (YENİ, yapım katmanının kalbi): astar/tela/biye
kuralları. Ölçülebilir alt-maddeler:
- Hangi kumaş + silüet astar İSTER (kural tablosu: şeffaf/açık dokuma + fitted
  gövde → astar; ağır dokuma + yapılı → tela; ince/kenar → biye). Deterministik,
  runtime LLM yok — fabrics.json profili × silüet sınıfı.
- Astar kalıbı gövdeden NASIL TÜRER: astar = gövde kalıbının türevi (yaka/oyuntu
  facing hattından içeri, hem'den kısa); ayrı çizim değil, mevcut parçadan
  derive (peplum/facing gibi). Motor işi (yeni parça türü → golden re-pin adayı).
- Talimata NASIL YAZILIR: sewing companion katmanına (knowledge/sewing-guide.md +
  gen-guide.mjs) astar/tela adımları; resimli talimat rayı bu adımları görsel
  gösterir (astar yerleştirme, tela ütüleme sırası).
BAĞIMLILIK: resimli adım talimatı rayı (PARK listesinde) bu köprünün vitrinidir;
ikisi tek DEVAM'da planlanır. Golden etkisi: köprü 1 kesin re-pin, köprü 2 astar
parçası eklerse re-pin (ikisi de beyanlı, Damla onayı).

## 7. DAMLA'YA AÇIK KALEMLER (freeze bunlara takılmadı, sırada bunlar var)

a) GOLDEN RE-PIN ONAYI: engine/golden-reference.csv 23034 satırlık eski
   pinde; HEAD dump'ı 23406 (fark K1 öncesinden beri beyanlı, mevcut
   golden_dump mekanizması 23406'yı her rayda byte-identical kanıtladı,
   csv legacy pin). FREEZE'İN TEK AÇIK KALEMİ BU: onay gelince tek
   komutla re-pin edilir, v1.0 golden'ı o olur.
b) EVAL-150 SABAH PAKETİ: node dataset/eval/label-tool.mjs →
   http://localhost:8791; her şey dataset/eval/README.md'de, ~25-30 dk.
   Bitince kaskad go-live gate'i yeşile döner.
c) review.waistNip (0.07) / review.armholeHollow (0.10): FİT Mİ STİL Mİ?
   Fit dersen draft.*'a taşınır ve gerçek ölçüye tabi olur (K3'teki iki
   pin iş emrine döner); stil dersen flat.*'ta kalır. Tek satırlık karar.
d) CLAUDE_API_KEY ROTASYONU: 15 Tem'den beri açık; anahtar işi yalnız
   sende. Repo tarafı temiz (K6 taraması: sızıntı yok).
e) AVUKAT SORUSU: marka fotoğrafı türevi kalıplar + tescilsiz topluluk
   tasarımı (TR/AB). Zincir hukuk yorumu yapmadı, yapmaz.

## 8. FREEZE MÜHRÜ

- git tag v1.0 (annotated) HEAD'e atıldı, origin'e push'landı.
- CLAUDE.md status: v1.0 FROZEN; yeni özellik = yeni DEVAM dosyası +
  Damla onayı.
- patches.html kapanış girdisi (3.26, EN/TR) canlıda.
- Kapanış deploy'u scripts/deploy.sh ile (kanıt zinciri otomatik koştu),
  canlı curl teyitli.
