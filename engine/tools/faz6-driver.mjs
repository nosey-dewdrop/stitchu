// FAZ 6 — uçtan uca kapsam sürücüsü (ÇAĞIRIR, motoru değiştirmez).
// Her hedef için: LLM-parse adayı (SEN=LLM tarafından hedefin spec+beyondEngine'inden
// grammar slotlarına çevrilir) → parse(cumle, aday) → compile → gate.
// PARK: değerleri parser'ın eksik_primitif yoluna gider (dürüst ÜRETİLEMEZ).
import {parse} from '../compiler/parse.mjs';
import {compile} from '../compiler/compile.mjs';
import {gate} from '../compiler/gate.mjs';
import {readFileSync} from 'node:fs';
const TARGETS = JSON.parse(readFileSync(new URL('../../contract/hedef-giysiler.json', import.meta.url), 'utf8')).targets;

// hedefin spec'ini grammar slot adaylarına çevir. GRAMERDE olan value → düz.
// GRAMERDE olmayan (PARK / beyondEngine primitifi) → 'PARK:<terim>' (dürüst red).
// Bu, insan-eli-değmeden LLM-parse'ın üreteceği aday: motorun çizemediğini
// gizlemez, PARK'a atar → parser eksik_primitif raporlar.

// grammar drawable value setleri (parse.mjs grammarPromptValues ile aynı kaynak)
const GRAMMAR = JSON.parse(readFileSync(new URL('../../contract/spec-grammar.json', import.meta.url), 'utf8'));
const OK = {};
for (const [slot, sd] of Object.entries(GRAMMAR.slots)) if (sd.values) OK[slot] = new Set(Object.keys(sd.values));

// hedef spec value → grammar value (isim eşleme). null döner = slot boş.
function mapNeckline(v){ if(!v) return null; const m={crew:'crew',scoop:'scoop',boat:'boat',square:'square',vNeck:'vNeck',sweetheart:'PARK:sweetheart',halter:'PARK:halter',cowl:'PARK:cowl',straight:'PARK:straight-neck'}; return m[v]||('PARK:'+v); }
function mapShaping(v){ if(!v) return null; const m={dart:'dart',princess:'princess',boxy:'boxy'}; return m[v]||('PARK:'+v); }
function mapSleeve(v){ if(v==null) return null; const m={none:'none',straight:'straight',balloon:'balloon',cap:'cap'}; return m[v]||('PARK:'+v); }
function mapSleeveLen(v){ if(!v) return null; return ['short','elbow','long'].includes(v)?v:('PARK:'+v); }
function mapSkirt(v){ if(!v) return null; const m={aLine:'aLine',gore:'gore',fullCircle:'fullCircle',halfCircle:'fullCircle',circle:'fullCircle',full:'fullCircle',straight:'PARK:straight',gathered:'gathered',pleated:'PARK:pleated'}; return m[v]||('PARK:'+v); }
function mapLength(v){ if(!v) return null; return ['mini','midi'].includes(v)?v:('PARK:'+v); }  // maxi PARK
function mapTopLen(v){ if(!v) return null; return ['cropped','hip'].includes(v)?v:('PARK:'+v); }
function mapPeplum(v){ if(!v||v==='none') return null; const m={full:'full',half:'half',pointed:'pointed'}; return m[v]||('PARK:'+v); }
function mapCollar(v){ if(!v||v==='none') return null; const m={peterPan:'peterPan',stand:'PARK:stand',shirt:'PARK:shirt',mandarin:'PARK:mandarin'}; return m[v]||('PARK:'+v); }
function mapStraps(v){ if(!v||v==='none') return null; const m={ruffled:'ruffled',wide:'wide',spaghetti:'spaghetti',shoulder:'PARK:shoulder',halter:'PARK:halter',offShoulder:'PARK:offShoulder',oneShoulder:'PARK:oneShoulder'}; return m[v]||('PARK:'+v); }
function mapClosure(c,spec){ if(!c||!c.type||c.type==='none') return null;
  // wrapFront: closure.type='ties' AMA tieClosure='wrapFront' → surplice wrap kapanma (wrap_dress)
  if(spec && spec.tieClosure==='wrapFront') return 'wrapFront';
  const m={buttons:'buttons',zipper:'zipper',tieBack:'tieBack',ties:'PARK:ties',placket:'PARK:placket-asymmetric','lace-up':'PARK:lace-up'}; return m[c.type]||('PARK:'+c.type); }
function mapShirred(spec){ // gatherType shirred/gathered/smocked/drawstring
  const g=spec.gatherType; if(!g||g==='none') return null;
  // SPEC-TUTARLILIK (2026-07-23): gatherType='gathered'+zone='waist' bir DIRNDL etek
  // büzgüsüdür (skirtStyle='gathered' ile AYNI öğe, ayrı bodice panosu değil) →
  // skirt slotu zaten temsil ediyor, shirred slotuna GİRMEZ (çift-kayıt kaldırıldı).
  if(g==='gathered' && spec.gatherZone==='waist' && spec.skirtStyle==='gathered') return null;
  if(g==='shirred') return 'physics'; if(g==='smocked') return 'PARK:smocked';
  if(g==='drawstring') return 'PARK:casing-drawstring-panel'; if(g==='gathered') return 'PARK:gathered-panel'; return 'PARK:'+g;
}

function candidateFromTarget(spec){
  const c = {};
  const put=(slot,val)=>{ if(val!=null) c[slot]=val; };
  put('garment', ({dress:'dress',top:'top',skirt:'PARK:skirt',trousers:'PARK:trousers',other:'PARK:other'})[spec.garment] || (spec.garment?('PARK:'+spec.garment):null));
  put('neckline', mapNeckline(spec.neckline));
  put('shaping', mapShaping(spec.shaping));
  // sleeveHead 'capped' bir CAP SLEEVE'dir (sleeveStyle alanı bazen 'straight' de
  // dese) → sleeve slotuna 'cap' olarak çözülür (id47 hakem-geçti 2026-07-22).
  put('sleeve', spec.sleeveHead==='capped' ? 'cap' : mapSleeve(spec.sleeveStyle));
  put('sleeveLength', mapSleeveLen(spec.sleeveLength));
  put('skirt', mapSkirt(spec.skirtStyle));
  put('length', mapLength(spec.length));
  put('topLength', mapTopLen(spec.topLength));
  put('peplum', mapPeplum(spec.peplum));
  put('shirred', mapShirred(spec));
  put('closure', mapClosure(spec.closure, spec));
  put('collar', mapCollar(spec.collar && spec.collar.type));
  put('straps', mapStraps(spec.straps && spec.straps.type));
  // hemRuffle / backSlit / yoke → beyondEngine sınıfı: grammarda yok
  if (spec.hemRuffle && spec.hemRuffle!=='none') c['hemRuffle']='PARK:'+spec.hemRuffle;
  if (spec.yoke && spec.yoke.type && !['none'].includes(spec.yoke.type)) {
    if (spec.yoke.type==='shoulderYoke') c['yoke']='PARK:shoulderYoke';
    else if (spec.yoke.type==='smocking') c['yoke']='PARK:smocking';
    // shirring yoke zaten shirred slotunda temsil edilir
  }
  return c;
}

// TR cümle üret (hedefin kendi tarifi) — label + beyondEngine karışımı, insan okur gibi.
function sentence(t){ return `${t.label} (${t.spec.garment})`; }

const rows = [];
let n_uretilemez=0, n_gecmedi=0, n_gecti=0;
const eksikPrimFreq = {};

for (const t of TARGETS){
  const cand = candidateFromTarget(t.spec);
  const cum = sentence(t);
  const p = parse(cum, cand);   // LLM-parse: aday gramere karşı doğrulanır
  let kategori, eksikSatir='';
  if (p.uretilemez){
    kategori='URETILEMEZ';
    eksikSatir = (p.eksik_primitif||[]).join(', ') || (p.celiski||[]).join('; ');
    for (const e of (p.eksik_primitif||[])) eksikPrimFreq[e]=(eksikPrimFreq[e]||0)+1;
    n_uretilemez++;
  } else {
    // compile
    const opts = t.spec.referenceStyle ? {referenceStyle: t.spec.referenceStyle} : {};
    const comp = await compile(p.spec, opts);
    if (!comp.ok){
      kategori='URETILEMEZ';
      eksikSatir = (comp.eksik_primitif||[]).join(', ') + (comp.not?(' — '+comp.not):'');
      for (const e of (comp.eksik_primitif||[])) eksikPrimFreq[e]=(eksikPrimFreq[e]||0)+1;
      n_uretilemez++;
    } else {
      const g = await gate(comp);  // judgeFn/tailorFn YOK → hakem/terzi ÖLÇÜLMEDİ
      // deterministik kanatlar: eksik listesinden hakem/terzi ÖLÇÜLMEDİ kaynaklıları AYIR
      const detEksik = (g.eksik||[]).filter(e =>
        !e.includes('terzi gözü giriş kontrolü çalıştırılmadı') &&
        !e.startsWith('hakem '));
      if (detEksik.length === 0){
        kategori='GECTI-ADAYI'; n_gecti++;
      } else {
        kategori='URETILDI-GECMEDI'; eksikSatir = detEksik.join('; '); n_gecmedi++;
      }
    }
  }
  rows.push({id:t.id, cum, kategori, eksik:eksikSatir});
}

console.log(JSON.stringify({
  sayac:{URETILEMEZ:n_uretilemez, 'URETILDI-GECMEDI':n_gecmedi, 'GECTI-ADAYI':n_gecti, toplam:rows.length},
  eksikPrimFreq: Object.entries(eksikPrimFreq).sort((a,b)=>b[1]-a[1]),
  gectiAdayi: rows.filter(r=>r.kategori==='GECTI-ADAYI').map(r=>r.id),
  rows
}, null, 1));
