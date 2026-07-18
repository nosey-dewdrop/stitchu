# K4 — SABİTLER TABLOSU + KAĞIT SLOPER raporu (2026-07-19)

Kapanış zinciri K4 rayı. İki iş: (1) koda gömülü her tasarım varsayımı tek
tabloya taşındı (engine/constants.yaml → üretilen constants.gen.hpp), değerler
DEĞİŞMEDEN — golden byte-identical kanıtlı. (2) Projenin İLK DIŞ FİT SİNYALİ:
motorun EU38 fitted bodice + straight skirt bloğu, Aldrich'in yayınlanmış
yöntemiyle BAĞIMSIZ elle hesaplanan blokla landmark landmark mm cinsinden
kıyaslandı; doğrulanan sınırlar kalıcı ctest'e (sloper_check) mandallandı.

Anayasa uyumu: A1 yeni özellik yok (tablo + test + rapor), A3 mikro-loop 0,
A4 tam kanıt seti (aşağıda), A5 0 API/vision çağrısı (Aldrich adımları için
yalnız ücretsiz web kaynakları okundu; hiçbir LLM/vision kredisi yok).

---

## 1. SABİTLER TABLOSU (constants.yaml → constants.gen.hpp)

- `engine/constants.yaml`: 16 satır, alanlar {name, value, unit, source,
  status: verified|assumed|refuted, experiment}.
- `engine/tools/gen-constants.mjs`: deterministik codegen → `engine/src/
  constants.gen.hpp` (K1'in gen-contract kalıbının aynısı, --check modlu).
- MANDAL: `validate-contract.mjs` bölüm 4b artık gen-constants --check koşuyor
  → ctest `contract_check` tablo/header driftinde kırmızı yanar.
- Kod tablodan okur (K0 envanter 1.5–1.9'un TÜM satırları + aynı ailenin
  taramada bulunan üyeleri):
  - SA=15: strap/pocket/backdetail/peplum/offshoulder.hpp + collar/gather/
    neckext/tie.cpp + bodice.cpp ×4 + skirt.cpp ×6 + sleeve.cpp ×2 +
    geometry.hpp default → `kSeamAllowanceMM` (envanter 1.6; geometry.hpp
    default'u listede yoktu, aynı hakikat olduğu için dahil edildi — beyan).
  - SA=10 bant/manşet: cuff.cpp, sleeve.cpp balon manşeti, skirt.cpp
    waistband, exposedzip.hpp → `kSeamAllowanceBandMM` (1.6'nın "10mm
    manşet" varyant notu).
  - SA=12 fırfır birleşimi: ruffle.cpp → `kSeamAllowanceRuffleJoinMM`.
  - Düğme 18mm ×4 (placket.hpp buttonDiameter+standWidth, buttonrow.hpp
    buttonDia+standWidth) → `kButtonDiameterMM` (1.7).
  - bicepsRatio 0.30 ×2 (sleeve.hpp + bodice.hpp bicepsRatioForArmscye)
    → `kBicepsBustRatio` (1.8).
  - shoulderDropFactor 0.23 (DEPRECATED ama neckFacings'te yaşıyor),
    underbustOffset 70, capWingDepth 55, strap finishedWidth 22,
    ventExtension 40 (1.9) → kendi satırları.
  - Fullness ailesi (1.5): strap 2.2 / backdetail 2.2 / offshoulder 2.0 /
    measurements default 2.5 → DÖRT AYRI satır. Uyumsuzluk BİRLEŞTİRİLMEDİ
    (değer değişikliği = davranış değişikliği = A1/A4 ihlali); "unify" v1.1
    adayı olarak satırların experiment alanına yazıldı.
  - Taramada bulunan: shoulderSlopeDeg 22.0 + shoulderSeamTargetMM 126.0
    (0.23'ün halefleri; kağıt kıyasın doğrudan ölçtüğü değerler).

DAĞILIM: 16 satır = 3 verified (seamAllowanceMM, shoulderSlopeDeg,
shoulderSeamTargetMM) + 11 assumed + 2 REFUTED (bicepsBustRatio 0.30,
shoulderDropFactorDeprecated 0.23).

REFUTED satırlar bu zincirde DEĞİŞTİRİLMEDİ (mühür):
- `bicepsBustRatio 0.30`: 0.30×880 = 264 mm çıplak pazu; Aldrich 6. baskı
  standart tablosu bust 88 kolonunda top arm = 284 mm → −20 mm (−%7). Motor
  ortalama kolda pazuyu dar tahmin ediyor; %15 ease bunu kısmen maskeliyor.
  v1.1 adayı: kol çevresi inputu (kalıcı çözüm) ya da oran düzeltmesi.
- `shoulderDropFactorDeprecated 0.23`: 42.6 mm drop (~13°) verir; Aldrich
  çizimi ~50 mm (~21–25°). Ana omuz yolu zaten 22°'ye geçmişti (18 Tem);
  0.23 hâlâ neckFacings'in omuz çerçevesini kuruyor — facing iç kenarı yaka
  çizgisini birebir kopyaladığı için dikişte sorun üretmiyor (facing
  validator'ı yeşil), ama çerçeve temizliği v1.1 adayı.

## 2. KAĞIT KARŞILAŞTIRMA (EU38, motor vs bağımsız Aldrich el hesabı)

Gövde: motor EU38 satırı (bust 880 / waist 700 / hip 940 / shoulder-width
370 / nape-to-waist 405 / arm 580 / neck 350 mm). Aldrich yöntemi aynı gövdeye
uygulandı; yöntemin gövdeden toplamadığı ara ölçüler Aldrich 6. baskı standart
tablosunun bust-88 kolonundan alındı: back width 344, shoulder 122.5, dart 70,
armscye depth 210, waist-to-hip 206, top arm 284 mm.

Aldrich el hesabı (adım adım; motor kopyası DEĞİL, yayınlanmış adımlar):
- scye çizgisi: armscye depth + 0.5 cm = 215 mm ense altı
- arka yaka eni: neck/5 = 70 mm; ön yaka eni: neck/5 − 0.5 cm = 65 mm
- omuz: chart shoulder 122.5 mm (net); uç düşüşü = ense çizgisi altı
  armscye/5 − 0.7 = 35 mm + yaka noktası ~15 mm yukarıda → boyun noktası
  çizgisinden ~50 mm
- büst hattı genişliği: bust/2 + 5 cm (yarım) → çevre 980 mm (ease +100)
- bel: waist + 2 cm ease = 720 mm; süprasyon yarım = 490−360 = 130 mm,
  üçe bölünür (arka pens / ön pens / yan dikiş ≈ 43.3'er)
- göğüs pensi (omuzdan): chart dart = 70 mm (motorda YOK — dürüst sınır)
- etek (tailored skirt block): kalça = hip/2 + 1.5 cm (yarım) → 970 mm;
  bel çeyrek: arka waist/4 + 4.25 (iki 2 cm pens + 0.25 ease), ön waist/4 +
  2.25 (bir 2 cm pens + 0.25) → dikilen bel ≈ 710 mm; yan bel 1.25 cm
  kalkar; kalça derinliği chart 206 mm; pens boyları arka 140/125, ön 100.

GÜVEN NOTU (dürüstlük): scye+0.5, neck/5, neck/5−0.5, shoulder+1.5 pens payı,
bust/2+5, waist+2, üçe bölme, dart 7 cm, etek formülleri — hepsi Aldrich'e
atıflı yayınlardan doğrudan alıntı (In the Folds Aldrich-5. baskı uyarlaması,
Cotton Noodle, Compulsive Seamstress Aldrich etek çizimi, 6. baskı standart
ölçü tablosu PDF'i). ORTA güvenli iki kalem: arka yaka yükselmesi (1.5 cm,
baskıya göre 1.5–2 oynar) ve omuz kılavuz düşüşü (armscye/5 − 0.7). Bu ikisi
yalnız "shoulder tip drop" satırını etkiler; o satırın payı geniş tutuldu.

### mm HATA TABLOSU (ctest sloper_check çıktısı, motor ÇİZİLMİŞ parçadan ölçer)

| landmark | motor | Aldrich | hata | durum |
|---|---|---|---|---|
| arka yaka eni | 69.0 | 70.0 | −1.0 | PASS ≤5 |
| ön yaka eni | 59.5 | 65.0 | −5.5 | rapor (motor FreeSewing oranı, dar okur) |
| oyuntu derinliği (ense altı) | 204.4 | 215.0 | −10.6 | PASS ≤15 |
| omuz boyu (çizilen) | 126.0 | 122.5 | +3.5 | PASS ≤10 |
| omuz ucu düşüşü | 50.7 | 50.0 | +0.7 | PASS ≤8 |
| büst hattı çevresi (dikilen) | 938.0 | 980.0 | −42.0 | rapor (tasarım: ribcage frame, arka=underbust; pozitif-ease bandı ayrıca assert) |
| bel çevresi (dikilen) | 746.0 | 720.0 | +26.0 | PASS ≤35 (tasarım: %5 ease vs Aldrich +2 cm; fark pinlendi) |
| ön bel pensi | 50.1 | 43.3 | +6.8 | rapor (motorda omuz göğüs pensi yok) |
| arka bel pensi | 39.9 | 43.3 | −3.4 | PASS ≤12 |
| ön/arka denge | +40 mm CF drop | (M&S kuralı) | 0.0 | PASS (Aldrich'te birebir karşılık yok; M&S kaynağına assert) |
| etek bel çevresi (dikilen) | 715.6 | 710.0 | +5.6 | PASS ≤12 |
| etek kalça çevresi | 958.8 | 970.0 | −11.2 | PASS ≤20 |
| etek kalça derinliği | 200.0 | 206.0 | −6.0 | PASS ≤10 |
| etek yan bel kalkışı | 12.0 | 12.5 | −0.5 | PASS ≤2 |
| etek arka pens toplamı (çeyrek) | 36.2 | 40.0 | −3.8 | PASS ≤8 (+ iki-pens yapısal assert) |

EN KÖTÜ 3 SAPMA: büst çevresi −42.0 mm (bilinçli ribcage-frame tasarımı,
Aldrich'ten dar; pozitif ease bandı içinde), bel çevresi +26.0 mm (%5 ease
tercihi), oyuntu derinliği −10.6 mm (motor scye'ı bir tık sığ kazıyor —
pazu tabanlı derinleştirme buna rağmen Aldrich'in altında; kol takarken
1–9% cap ease penceresi tutuyor, muslin göstergesi olarak nota geçti).

DÜRÜST SINIRLAR: (a) motorda Aldrich'in omuzdan inen 70 mm göğüs pensi YOK —
ön şekillendirme tek bel pensi + ≤5 mm yan eğim; kıyas bu yüzden ön pensте
rapor-only. (b) cross-back / cross-chest genişliği motorda ayrı landmark
olarak çizilmiyor (armhole tek kübik) — kıyaslanamadı, yazıldı. (c) motor ön
ve arka etek çeyreğini aynı süprasyonla çizer; Aldrich arkaya 4 cm öne 2 cm
verir — arka toplam yine de ±8 bandında. (d) Bu KAĞIT kıyasıdır; "insana
oturur" iddiası değildir — muslin FAZ 1'de Damla'da.

## 3. MANDALLAR (kalıcı regresyon bekçileri)

1. ctest `sloper_check` (YENİ, 42. test): yukarıdaki 12 PASS sınırı + iki
   yapısal assert (pozitif-ease bandı, arka etek çift pensi, M&S +40 balance)
   Aldrich referans sayılarıyla pinli. Landmark sınırdan kayarsa kırmızı.
2. ctest `contract_check` genişledi: gen-constants --check → constants.yaml ↔
   constants.gen.hpp driftinde kırmızı (bölüm 4b).
3. Golden byte-identical: relocation'ın davranışsızlığı golden'a mühürlü.

## 4. K0 ENVANTERİ KAPANIŞI (K4 satırları)

- 1.5 fullness dağınıklığı → KAPANDI (4 satır tabloda; unify v1.1 notu).
- 1.6 SA 12+ dosya → KAPANDI (tek kaynak kSeamAllowanceMM + 10/12 varyant
  satırları; exposedzip/geometry/waistband/manşet aynı aileden beyanla dahil).
- 1.7 düğme 18mm → KAPANDI (kButtonDiameterMM, iki header tek kaynaktan).
- 1.8 bicepsRatio ×2 → KAPANDI (tek satır + REFUTED damgası).
- 1.9 tekil sabitler → KAPANDI (hepsi tabloda; 0.23 refuted + yaşadığı yer
  belgelendi).
- 4.8 fit_proof totolojisi → İLK DIŞ SİNYALLE YANITLANDI (sloper_check
  Aldrich referanslı; fit_proof yerinde duruyor, artık yalnız iç tutarlılık
  iddiası taşıyor).
- PARK: yok (K4 iş listesinde park gerektiren madde çıkmadı).

## 5. KANIT SETİ (A4)

- golden: pristine origin/main dump 23406 satır ↔ relocation sonrası dump
  cmp BYTE-IDENTICAL (değer değişmedi, yeri değişti — kanıtlandı).
- ctest 42/42 (41 mevcut + yeni sloper_check).
- İKİ wasm yeniden derlendi (build-wasm.sh): dist/stitchu-engine.js ve
  worker js+wasm md5'leri commit'li kopyalarla AYNI → git diff'te wasm yok;
  relocation binary düzeyinde de no-op.
- vocab-sweep 48600 draft / 48600 sewable / 0 failure.
- web-fuzz 26260 / 3 FAILURE — üçü de K1'de kayıtlı ESKİ bilinen PAGES
  defekti (pussyBow+pleated+maxi+empire 102 sayfa), K4'le ilgisiz, sayı
  değişmedi.
- validate-contract GREEN (yeni 4b dahil 9 bölüm).
- Render kanıtı: motor çıktısı bayt düzeyinde değişmediği için (golden +
  wasm md5 aynı) yeni render üretilmedi; görsel durum K1'dekiyle özdeş.

## 6. OPERASYONEL NOT (K6/v1.1 adayı, SONRADAN BULUNDU)

- /tmp altında kalıntı bir package.json (type:commonjs) varsa /tmp'ye açılan
  worktree'lerde node ESM çözümlemesi kırılıyor (contract_check FAIL verir).
  Bu K4'te yaşandı; worktree ~/.cache altına taşınarak çözüldü. deploy.sh /
  K6 dokümantasyonuna "worktree'yi /tmp'ye açma" notu düşülmeli.

YEŞİL TANIMI KARŞILANDI: constants.yaml kodda tek kaynak + golden yeşil;
mm tablosu raporda; 16 satırın tamamı verified/assumed/refuted damgalı.
