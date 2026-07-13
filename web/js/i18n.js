// Two languages, one tiny dictionary. Default English; "tr" persisted in
// localStorage. Static pages translate via data-i18n attributes, dynamic
// screens call t(). Sewing-guide steps stay English for now: correct Turkish
// sewing terminology is content, and content is Damla's — flagged in TR mode.
const LANG_KEY = 'stitchu:lang';

export const STRINGS = {
  // nav + landing
  'nav.create': { tr: 'oluştur' },
  'nav.closet': { tr: 'dolap' },
  'hero.title': { en: 'Photograph a garment. Get its sewing pattern, drafted to your body.', tr: 'Bir kıyafetin fotoğrafını çek. Dikiş kalıbını kendi bedenine çizilmiş al.' },
  'hero.sub': { en: 'True-scale A4 printing, fabric advice and a step-by-step sewing guide. Your measurements never leave this browser.', tr: 'Gerçek ölçekli A4 baskı, kumaş önerisi ve adım adım dikiş rehberi. Ölçülerin bu tarayıcıdan asla çıkmaz.' },
  'hero.cta': { en: 'Start a pattern', tr: 'Kalıba başla' },
  'hero.platforms': { en: 'web · iOS app · Android coming soon', tr: 'web · iOS uygulaması · Android yakında' },
  'hero.sewhint': { en: 'drag along the line to sew your first stitch', tr: 'ilk ilmeğini dikmek için çizgi boyunca sürükle' },
  'how.title': { en: 'How it works', tr: 'Nasıl çalışır' },
  'how.1.title': { en: 'Upload a photo', tr: 'Fotoğraf yükle' },
  'how.1.body': { en: 'Any skirt, dress or top. Stitchu reads the neckline, sleeves and silhouette, and you confirm what it saw.', tr: 'Herhangi bir etek, elbise ya da üst. Stitchu yakayı, kolları ve silueti okur; gördüğünü sen onaylarsın.' },
  'how.2.title': { en: 'Drafted to your measurements', tr: 'Senin ölçülerine çizilir' },
  'how.2.body': { en: 'The pattern is calculated from your own seven measurements, right here in the browser. Nothing is uploaded.', tr: 'Kalıp, yedi ölçünden bu tarayıcının içinde hesaplanır. Hiçbir şey yüklenmez.' },
  'how.3.title': { en: 'Print and sew', tr: 'Bas ve dik' },
  'how.3.body': { en: 'Tiled A4 sheets with a calibration square, fabric meters, and a sewing order that starts at the right seam.', tr: 'Kalibrasyon kareli A4 yapraklar, kumaş metresi ve doğru dikişten başlayan dikim sırası.' },
  'wall.title': { en: 'The stitch wall', tr: 'Dikiş duvarı' },
  'wall.lede': { en: 'Every visitor sews a few stitches and they stay. Drag inside the frame — this thread color is yours.', tr: 'Her ziyaretçi birkaç ilmek atar ve ilmekler kalır. Çerçevenin içinde sürükle — bu iplik rengi senin.' },
  'wall.yourthread': { en: 'your thread', tr: 'senin ipliğin' },
  'wall.noteplaceholder': { en: 'Leave a note under the wall (80 chars)', tr: 'Duvarın altına bir not bırak (80 karakter)' },
  'wall.stitchit': { en: 'Stitch it', tr: 'Dik gitsin' },
  'wall.localmode': { en: 'the shared wall wakes up at launch — until then your stitches stay on this device', tr: 'ortak duvar lansmanla uyanacak — o zamana dek ilmeklerin bu cihazda kalır' },
  'wall.unreachable': { en: 'the wall is unreachable right now — your stitches stay on this device', tr: 'duvara şu an ulaşılamıyor — ilmeklerin bu cihazda kalır' },
  'wall.keepkind': { en: 'keep it kind', tr: 'kibar kalalım' },
  'wall.notefail': { en: 'could not stitch the note, try later', tr: 'not dikilemedi, sonra dene' },
  'wall.count': { en: '{n} stitches sewn by visitors', tr: 'ziyaretçiler {n} ilmek dikti' },
  'wall.count1': { en: '1 stitch sewn by visitors', tr: 'ziyaretçiler 1 ilmek dikti' },
  'footer.tag': { en: 'stitchu — a pocket sewing teacher', tr: 'stitchu — cep terzisi öğretmenin' },
  'footer.privacy': { tr: 'gizlilik' },

  // create flow
  'create.measure.title': { en: 'Your measurements', tr: 'Ölçülerin' },
  'create.measure.sub': { en: 'Seven measurements, once — saved on this device only.', tr: 'Yedi ölçü, bir kez — yalnızca bu cihazda saklanır.' },
  'create.measure.privacy': { en: 'Stored in this browser only. Nothing is uploaded.', tr: 'Yalnızca bu tarayıcıda saklanır. Hiçbir şey yüklenmez.' },
  'create.measure.numerror': { en: 'Enter a number in centimeters.', tr: 'Santimetre cinsinden bir sayı gir.' },
  'create.measure.rangeerror': { en: "That doesn't look like a {label} in cm (expected {min}–{max}).", tr: 'Bu cm cinsinden bir {label} gibi durmuyor ({min}–{max} arası bekleniyor).' },
  'create.back': { en: 'Back', tr: 'Geri' },
  'create.next': { en: 'Next — {label}', tr: 'Sıradaki — {label}' },
  'create.done': { en: 'Done — pick your garment', tr: 'Bitti — kıyafetini seç' },
  'create.spec.title': { en: 'What are we sewing?', tr: 'Ne dikiyoruz?' },
  'create.spec.sub': { en: 'Pick the garment; the pattern is drafted to your saved measurements. ', tr: 'Kıyafeti seç; kalıp kayıtlı ölçülerine çizilir. ' },
  'create.spec.edit': { en: 'Edit measurements', tr: 'Ölçüleri düzenle' },
  'create.spec.photo': { en: 'or start from a photo', tr: 'ya da fotoğraftan başla' },
  'create.spec.photobtn': { en: 'Upload a garment photo', tr: 'Kıyafet fotoğrafı yükle' },
  'create.spec.reading': { en: 'reading the garment…', tr: 'kıyafet okunuyor…' },
  'create.spec.checkpicks': { en: 'Check the picks below, fix anything I got wrong.', tr: 'Aşağıdaki seçimleri kontrol et, yanlışım varsa düzelt.' },
  'create.draft': { en: 'Draft my pattern', tr: 'Kalıbımı çiz' },
  'create.drafting': { en: 'drafting your pattern…', tr: 'kalıbın çiziliyor…' },
  'create.engineerror': { en: 'The engine failed to load. Refresh and try again.', tr: 'Motor yüklenemedi. Sayfayı yenileyip tekrar dene.' },
  'create.result.title': { en: '{garment}, drafted for you.', tr: '{garment} — senin için çizildi.' },
  'create.changegarment': { en: 'Change garment', tr: 'Kıyafeti değiştir' },
  'create.save': { en: 'Save to closet', tr: 'Dolaba kaydet' },
  'create.print': { en: 'Print — true scale A4', tr: 'Yazdır — gerçek ölçek A4' },

  // result labels
  'result.pieces': { en: 'pieces', tr: 'parçalar' },
  'result.piecesv': { en: '{n} · numbered in sewing order', tr: '{n} · dikim sırasına göre numaralı' },
  'result.fabric': { en: 'fabric', tr: 'kumaş' },
  'result.fabricv': { en: '{n} m at 140 cm width', tr: '140 cm ende {n} m' },
  'result.sa': { en: 'seam allowance', tr: 'dikiş payı' },
  'result.sav': { en: '{n} cm included in the guide, not drawn', tr: '{n} cm — rehberde var, çizimde yok' },
  'result.guide': { en: 'Sewing guide', tr: 'Dikiş rehberi' },
  'result.guidetrnote': { en: '', tr: 'Rehber adımları şimdilik İngilizce — Türkçesi geliyor.' },
  'result.fabricadvice': { en: 'Fabric advice', tr: 'Kumaş önerisi' },
  'result.photofabric.good': { en: 'The fabric in your photo looks like {name} — a good match for this project. Watch out: {note}', tr: 'Fotoğraftaki kumaş {name} görünüyor — bu proje için uygun. Dikkat: {note}' },
  'result.photofabric.bad': { en: 'The fabric in your photo looks like {name} — it works against this shape ({drape}). Consider one of the suggestions below.', tr: 'Fotoğraftaki kumaş {name} görünüyor — bu forma ters çalışır ({drape}). Aşağıdaki önerilerden birini düşün.' },
  'result.photofabric.unknown': { en: 'The fabric in your photo looks like {name}. No verified guide for it here yet — handle it by its stretch (the knit/woven choice you made) and test on a scrap first.', tr: 'Fotoğraftaki kumaş {name} görünüyor. Bunun için doğrulanmış rehber henüz yok — esnekliğine göre davran (seçtiğin örgü/dokuma ayarı) ve önce artık parçada dene.' },
  'result.legend': { en: 'How to read the pieces: solid line = cutting/seam line · dashed teal = darts and fold lines (they are drawn dashed on purpose) · arrow = grainline, align it with the fabric grain.', tr: 'Parçalar nasıl okunur: düz çizgi = kesim/dikiş hattı · kesikli turkuaz = pens ve katlama yerleri (bilerek kesiklidir) · ok = boy iplik yönü, kumaşın boyuna hizalanır.' },
  'result.blocked': { en: 'This draft did not pass the safety checks, so it cannot be printed. This should not happen — the combination has been logged in your browser console.', tr: 'Bu çizim güvenlik kontrollerinden geçemedi, o yüzden yazdırılamaz. Bunun olmaması gerekirdi — kombinasyon tarayıcı konsoluna kaydedildi.' },

  // closet
  'closet.title': { en: 'Closet', tr: 'Dolap' },
  'closet.sub': { en: '{n} saved · stored in this browser only', tr: '{n} kayıtlı · yalnızca bu tarayıcıda' },
  'closet.empty.title': { en: 'No patterns yet.', tr: 'Henüz kalıp yok.' },
  'closet.empty.body': { en: 'Draft your first one — it takes a photo or three taps, and it stays on this device.', tr: 'İlkini çiz — bir fotoğraf ya da üç dokunuş yeter, ve bu cihazda kalır.' },
  'closet.start': { en: 'Start a pattern', tr: 'Kalıba başla' },
  'closet.delete': { en: 'delete', tr: 'sil' },
  'closet.today': { en: 'today', tr: 'bugün' },
  'closet.yesterday': { en: 'yesterday', tr: 'dün' },
  'closet.daysago': { en: '{n}d ago', tr: '{n} gün önce' },
};

export function getLang() {
  try { return localStorage.getItem(LANG_KEY) === 'tr' ? 'tr' : 'en'; } catch { return 'en'; }
}

export function setLang(lang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* private mode */ }
}

// t('key', {n: 3}) — TR falls back to English; EN with no entry returns the
// key so applyStatic leaves the original English markup untouched (never
// leak Turkish into English mode).
export function t(key, vars) {
  const entry = STRINGS[key] || {};
  let s = getLang() === 'tr' ? (entry.tr ?? entry.en) : entry.en;
  if (s === undefined) s = key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

// Static pages: translate all [data-i18n] nodes + placeholders, and mount the
// EN/TR toggle into nav.
export function applyStatic() {
  for (const node of document.querySelectorAll('[data-i18n]')) {
    const key = node.dataset.i18n;
    const s = t(key);
    if (s !== key) node.textContent = s;
  }
  for (const node of document.querySelectorAll('[data-i18n-placeholder]')) {
    const key = node.dataset.i18nPlaceholder;
    const s = t(key);
    if (s !== key) node.placeholder = s;
  }
}

export function mountLangToggle() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const a = document.createElement('a');
  a.href = '#';
  const refresh = () => { a.textContent = getLang() === 'tr' ? 'en' : 'tr'; };
  a.addEventListener('click', (e) => {
    e.preventDefault();
    setLang(getLang() === 'tr' ? 'en' : 'tr');
    window.location.reload();
  });
  refresh();
  nav.appendChild(a);
}
