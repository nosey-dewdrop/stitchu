// The sewing companion: "you drafted it, now sew it". Deterministic, zero
// runtime LLM cost. Reads the garment + silhouette the engine already knows and
// renders two blocks on the result page:
//   1. WHY this fabric (weight + drape reasoning, the "neden" Damla asked for),
//      one profile per shape from web/data/sewing-guide.json.
//   2. Construction order at a glance (the 9-phase model behind the per-step
//      guide the engine emits), so the beginner sees the shape of the build
//      before the numbered steps.
// It never invents: the honesty layer (missing.js) still owns what the engine
// cannot draw. Source of truth: knowledge/sewing-guide.md.
import { getLang, t } from './i18n.js?v=113';

let guidePromise = null;
function loadGuide() {
  if (!guidePromise) {
    guidePromise = fetch('data/sewing-guide.json')
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  return guidePromise;
}

// Map the drafted spec to ONE fabric profile. Order matters: the most specific
// wins. spec fields come from create.js (garment, fabric, skirtStyle, waistline,
// gatherType, collarType, frontPlacket, ruffle); every field is optional so a
// bare/old result still resolves to a sane default.
export function fabricProfile(spec) {
  if (!spec || !spec.garment) return 'structured';
  if (spec.fabric === 'knit') return 'knit';
  const collared = (spec.collarType && spec.collarType !== 'none') ||
    spec.frontPlacket === true || spec.frontPlacket === 'true';
  if (collared) return 'tailored';
  const gathered = spec.waistline === 'empire' ||
    spec.skirtStyle === 'gathered' ||
    (spec.gatherType && spec.gatherType !== 'none') ||
    (spec.ruffle && spec.ruffle !== 'none');
  if (gathered) return 'gathered';
  if (spec.skirtStyle === 'halfCircle') return 'fluid';
  return 'structured';
}

// Append the two companion blocks. Inserted between the fabric advice list and
// the sewing guide on the result page (see render.js).
export async function appendSewingCompanion(container, spec) {
  const guide = await loadGuide();
  if (!guide) return;
  const lang = getLang() === 'tr' ? 'tr' : 'en';

  // --- 1. why this fabric ---------------------------------------------------
  const profile = fabricProfile(spec);
  const logic = guide.fabricLogic[profile] && guide.fabricLogic[profile][lang];
  if (logic) {
    const title = document.createElement('h2');
    title.style.cssText = 'font-weight:400;font-size:22px;margin-top:44px';
    title.textContent = t('sew.whyfabric');
    container.appendChild(title);

    const want = document.createElement('p');
    want.style.maxWidth = '660px';
    want.textContent = t('sew.want', { want: logic.want });
    container.appendChild(want);

    const why = document.createElement('p');
    why.style.cssText = 'max-width:660px;color:#5b7089;margin-top:6px';
    why.textContent = logic.why;
    container.appendChild(why);

    const facts = document.createElement('ul');
    facts.className = 'result-meta';
    facts.style.maxWidth = '660px';
    const rows = [
      [t('sew.families'), logic.families],
      [t('sew.ask'), logic.ask],
      [t('sew.tradeoff'), logic.tradeoff],
    ];
    for (const [k, v] of rows) {
      const li = document.createElement('li');
      li.style.display = 'block';
      const key = document.createElement('span');
      key.className = 'k';
      key.textContent = k + ': ';
      li.append(key, document.createTextNode(v));
      facts.appendChild(li);
    }
    container.appendChild(facts);
  }

  // --- 2. construction order at a glance ------------------------------------
  const phases = guide.phases[lang] || [];
  if (phases.length) {
    const title = document.createElement('h2');
    title.style.cssText = 'font-weight:400;font-size:22px;margin-top:44px';
    title.textContent = t('sew.order');
    container.appendChild(title);

    const intro = document.createElement('p');
    intro.style.cssText = 'max-width:660px;color:#5b7089';
    intro.textContent = t('sew.orderintro');
    container.appendChild(intro);

    const ol = document.createElement('ol');
    ol.className = 'guide-list';
    for (const ph of phases) {
      const li = document.createElement('li');
      const name = document.createElement('span');
      name.style.fontWeight = '700';
      name.textContent = ph.name + '. ';
      li.append(name, document.createTextNode(ph.note));
      ol.appendChild(li);
    }
    container.appendChild(ol);

    const link = document.createElement('p');
    link.style.cssText = 'font-size:13px;margin-top:10px';
    const a = document.createElement('a');
    a.href = 'guide/';
    a.textContent = t('sew.morelink');
    a.style.cssText = 'color:#8f2038;border-bottom:1px dashed #d8a3ad;text-decoration:none';
    link.appendChild(a);
    container.appendChild(link);
  }
}
