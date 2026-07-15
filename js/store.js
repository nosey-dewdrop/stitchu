// Local persistence: measurements profile + saved patterns (closet).
// Everything stays on this device — that is a product promise, not a gap.
const MEASURE_KEY = 'stitchu:measurements';
const CLOSET_KEY = 'stitchu:closet';

export const MEASUREMENTS = [
  { key: 'bust', label: 'Bust', trLabel: 'Göğüs', help: 'Around the fullest part of your chest, tape parallel to the floor.', trHelp: 'Göğsünün en dolgun yerinden, mezura yere paralel.', min: 60, max: 160 },
  { key: 'waist', label: 'Waist', trLabel: 'Bel', help: 'At the narrowest point, tape snug but not tight.', trHelp: 'En ince noktadan; mezura otursun ama sıkmasın.', min: 45, max: 140 },
  { key: 'hip', label: 'Hips', trLabel: 'Kalça', help: 'Around the fullest part of your seat.', trHelp: 'Kalçanın en dolgun yerinden.', min: 60, max: 170 },
  { key: 'shoulder', label: 'Shoulder width', trLabel: 'Omuz genişliği', help: 'Across your back, shoulder bone to shoulder bone.', trHelp: 'Sırtından, bir omuz kemiğinden diğerine.', min: 26, max: 52 },
  { key: 'backLength', label: 'Back length', trLabel: 'Sırt boyu', help: 'From the bone at the base of your neck down to your waist.', trHelp: 'Ense kökündeki kemikten beline kadar.', min: 28, max: 55 },
  { key: 'armLength', label: 'Arm length', trLabel: 'Kol boyu', help: 'Shoulder bone to wrist, arm slightly bent.', trHelp: 'Omuz kemiğinden bileğe, kol hafif bükülü.', min: 40, max: 75 },
  { key: 'neck', label: 'Neck', trLabel: 'Boyun', help: 'Around the base of your neck, one finger of ease.', trHelp: 'Boyun kökünün çevresinden, bir parmak boşlukla.', min: 26, max: 55 },
  // OPTIONAL 8th: the high/upper bust (above the bust, under the arms). Skippable.
  // When given, the pattern fits your ribcage frame while keeping the full bust —
  // the fix for a gaping neckline on a fuller bust. Left blank = the old B/C-cup
  // assumption, unchanged.
  { key: 'upperBust', label: 'Upper bust', trLabel: 'Üst göğüs', help: 'ABOVE the bust, high under the arms and across the top of the chest. Skip if unsure — but if your bust is fuller than a B/C cup, this stops the neckline gaping.', trHelp: 'Göğsünün ÜSTÜNDEN, kolların altından ve göğsün üst kısmından. Emin değilsen atla — ama göğsün B/C kaptan dolgunsa, bu yakanın açılmasını önler.', min: 60, max: 150, optional: true },
];

export function loadMeasurements() {
  try {
    const raw = localStorage.getItem(MEASURE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveMeasurements(m) {
  localStorage.setItem(MEASURE_KEY, JSON.stringify(m));
}

export function loadCloset() {
  try {
    const raw = localStorage.getItem(CLOSET_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveToCloset(entry) {
  const closet = loadCloset();
  entry.id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  entry.savedAt = Date.now();
  closet.unshift(entry);
  // localStorage budget: keep the closet bounded; oldest fall off the rail.
  while (closet.length > 40) closet.pop();
  localStorage.setItem(CLOSET_KEY, JSON.stringify(closet));
  return entry.id;
}

export function deleteFromCloset(id) {
  const closet = loadCloset().filter((e) => e.id !== id);
  localStorage.setItem(CLOSET_KEY, JSON.stringify(closet));
}

export function closetEntry(id) {
  return loadCloset().find((e) => e.id === id) || null;
}
