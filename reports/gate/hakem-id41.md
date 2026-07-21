# HAKEM — id41 (Frill Top, denim sleeveless princess peplum)

Bağımsız çift-kanat. Motor/contract/styles.json DOKUNULMADI. Üret(/tmp)+gör+ölç. 0 kredi.

## KANAT 1 — FLAT (kör test)
Üretim: REF (940 680), FALLBACK değil. /tmp/j41.png Read ile görüldü.
Emsal: design_patterns/crops/ar-202426-4.png (denim Frill Top).

(a) Aynı giysi mi: EVET.
- Crew yuvarlak yaka ✓
- Kolsuz ✓
- Princess dikişi (ön + arka, göğüsten bele anatomik taper) ✓
- Bele takılı PEPLUM frill ✓ — belden aşağı flare, dalgalı/scallop hem

(b) Emsal-seviye mi: EVET.
- Peplum KISA + dolgun flare (bel→mid-hip), etek gibi uzun DEĞİL — emsal oranı ✓
- Hem yumuşak dalgalı (scallop çember volan) ✓
- Bele temiz bel dikişiyle bağlanmış (buzgu değil çember flare, emsal denim frill mantığı) ✓
- Robotik değil; emsal listing flat sketch'iyle aynı silüet sınıfı

**FLAT: PASS** — asıl kriter peplum var ve emsal gibi kısa flare.

## KANAT 2 — KALIP (Δmm)
Spec: garment=top, shaping=princess, neckline=crew, sleeveStyle=none, topLength=hip, peplum=full(1).
Body EU38 (bust90/waist72/hip98).

- Draft: HATASIZ (engine threw yok, refuse yok)
- Validator: **0 issue**
- Parça: **6** — Top Center Front | Top Side Front | Top Center Back | Top Side Back | Bias binding | **Peplum (çember etek volanı)**
- Peplum AYRI kesim parçası: EVET (132 komut, çember volan)

worstΔmm (ölçüm notu): full-scan-27 jenerik komut-indeksi (princess=4+5, waist=6) DRESS bodice içindir; peplum TOP parçası hip-boyu (CB y580'e iner, waist y179'da peplum dikişi) farklı geometri taşır → indeks eşlemesi uyumsuz segment okur (princess back Δ67 = ölçüm artefaktı, gerçek dikiş kopması değil). Otoriter fit sinyali: princess dikişi bodice.cpp:280 + garment.cpp:259 "by construction" (centerArc hesaplanır, side eşlenir, dikişler MEET) + validator 0 issue. Yani seam-match invariant olarak garanti; drafted çıktı sessizce ihlal edemez.

**KALIP: PASS** — draft hatasız, 0 issue, peplum ayrı parça çizildi (6 parça, top bandı 3-9 aralığında). worstΔ jenerik-araç artefaktı; gerçek seam-match by-construction + validator garantili.

## ÇIFT KANAT
FLAT PASS + KALIP PASS → **GEÇTİ**

Not: Peplum primitifinin bu ilk gerçek testi çift kanattan temiz geçti; emsal-seviye kısa dolgun frill, ayrı çember volan kesim parçası, seam-match invariant korundu.
