// vision-landmark.js — KAYNAK (a): poz landmark'i (A3, 2026-09-08).
//
// NEDEN MEDIAPIPE. Secim ve gerekce (brief: "sec, gerekce docs'a"):
//  - Tasks Vision pose landmarker tarayicida WASM ile kosar, sunucu gerektirmez;
//    Damla'nin karari geregi ANAHTAR YOK, dis servise fotograf GITMEZ.
//  - Model self-host: web/vendor/pose/ (CDN'e canli bagimlilik yok, headless
//    Chrome'da da yuklenir).
//  - lite surumu (5.8 MB) secildi: makine 8 GB, full surum bellek yiyor.
//
// NE ISE YARAR. Siluet (kaynak b) giysinin DIS HATTINI verir ama "bel neresi",
// "omuz nerede biter", "bu genislik kol mu govde mi" sorularini CEVAPLAYAMAZ.
// Olculdu (OVERLAY-HUKMU.md + KOSU/ciktilar/_yerel/giris/*.json): kollari acik
// cekimlerde siluetin "en genis" noktasi kol hizasi cikiyor ve bel/enGenis orani
// anlamsizlasiyor (biba-O120579: enGenis/omuz 2.16 = omuzun iki kati). Poz
// landmark'i bu ayrimi yapar: omuz/dirsek/bilek/kalca noktalari bilinirse
// genislik oranlarinin PAYDASI dogru secilir.
//
// URETTIGI SEY YINE ORAN, MM DEGIL (contract/vision-graf-v1.json yasa 2).
// Landmark'lar normalize [0,1] koordinatta doner; oranlar onlardan turer.

export const POSE_MODEL = 'vendor/pose/pose_landmarker_lite.task';
export const POSE_WASM = 'vendor/pose';

// MediaPipe pose landmarker'in 33 noktasindan bize gerekenler.
export const NOKTA = {
  solOmuz: 11, sagOmuz: 12, solDirsek: 13, sagDirsek: 14,
  solBilek: 15, sagBilek: 16, solKalca: 23, sagKalca: 24,
  solDiz: 25, sagDiz: 26, solAyak: 27, sagAyak: 28,
};

/**
 * Poz landmark'i olcer. Bulamazsa ADIYLA reddeder (sessiz default yok).
 * @param {object} tasksVision  import edilmis @mediapipe/tasks-vision modulu
 * @param {HTMLImageElement|ImageBitmap} img
 * @param {string} kokYol  vendor dosyalarinin koku (varsayilan: '')
 */
export async function pozOlc(tasksVision, img, kokYol = '') {
  const { FilesetResolver, PoseLandmarker } = tasksVision;
  const fileset = await FilesetResolver.forVisionTasks(kokYol + POSE_WASM);
  const lm = await PoseLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: kokYol + POSE_MODEL },
    runningMode: 'IMAGE', numPoses: 1,
  });
  const r = lm.detect(img);
  lm.close();

  if (!r.landmarks?.length)
    return {
      hukum: 'OLCULEMEDI', hataKodu: 'ERR_NO_POSE',
      neden: 'Poz bulunamadi. Bu fotograf setinde beklenen bir sonuc: model INSAN '
           + 'pozu icin egitildi, girdiler ise manken/aski cekimleri (bas yok, uzuv '
           + 'orantilari manken, bazi kareler yalniz govde).',
    };

  const p = r.landmarks[0];
  const g = (i) => ({ x: p[i].x, y: p[i].y, v: p[i].visibility ?? 0 });
  const O = { solOmuz: g(NOKTA.solOmuz), sagOmuz: g(NOKTA.sagOmuz),
              solKalca: g(NOKTA.solKalca), sagKalca: g(NOKTA.sagKalca),
              solDirsek: g(NOKTA.solDirsek), sagDirsek: g(NOKTA.sagDirsek),
              solBilek: g(NOKTA.solBilek), sagBilek: g(NOKTA.sagBilek) };

  const uz = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const omuzGen = uz(O.solOmuz, O.sagOmuz);
  const omuzY = (O.solOmuz.y + O.sagOmuz.y) / 2;
  const kalcaY = (O.solKalca.y + O.sagKalca.y) / 2;

  return {
    hukum: 'OLCULDU',
    guven: Math.min(...Object.values(O).map((n) => n.v)),
    noktalar: O,
    // Siluetin cevaplayamadigi soru: bel HANGI y'de? Omuz-kalca araliginin
    // ~%55'i (Aldrich govde orani; contract'ta sayi yok -> DOGRULANMADI).
    belY: omuzY + 0.55 * (kalcaY - omuzY),
    _belYKaynak: 'DOGRULANMADI: omuz-kalca araliginin 0.55i; contract/body-v1.json bu orani tasimiyor',
    oranlar: [
      { ad: 'kolBoyu/omuzGen', oran: uz(O.solOmuz, O.solBilek) / omuzGen, pay: 'omuz-bilek', payda: 'omuz genisligi' },
      { ad: 'govdeBoyu/omuzGen', oran: (kalcaY - omuzY) / omuzGen, pay: 'omuz-kalca', payda: 'omuz genisligi' },
    ],
  };
}

export default { pozOlc, NOKTA, POSE_MODEL, POSE_WASM };
