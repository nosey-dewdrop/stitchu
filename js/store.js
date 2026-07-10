// Local persistence: measurements profile + saved patterns (closet).
// Everything stays on this device — that is a product promise, not a gap.
const MEASURE_KEY = 'stitchu:measurements';
const CLOSET_KEY = 'stitchu:closet';

export const MEASUREMENTS = [
  { key: 'bust', label: 'Bust', help: 'Around the fullest part of your chest, tape parallel to the floor.', min: 60, max: 160 },
  { key: 'waist', label: 'Waist', help: 'At the narrowest point, tape snug but not tight.', min: 45, max: 140 },
  { key: 'hip', label: 'Hips', help: 'Around the fullest part of your seat.', min: 60, max: 170 },
  { key: 'shoulder', label: 'Shoulder width', help: 'Across your back, shoulder bone to shoulder bone.', min: 26, max: 52 },
  { key: 'backLength', label: 'Back length', help: 'From the bone at the base of your neck down to your waist.', min: 28, max: 55 },
  { key: 'armLength', label: 'Arm length', help: 'Shoulder bone to wrist, arm slightly bent.', min: 40, max: 75 },
  { key: 'neck', label: 'Neck', help: 'Around the base of your neck, one finger of ease.', min: 26, max: 55 },
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
