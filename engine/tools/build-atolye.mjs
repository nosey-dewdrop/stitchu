// ============================================================================
// build-atolye.mjs — 2026-07-31
//
// Bundles the READ-ONLY flat pen (engine/flat-engine/_engine-full.mjs, Damla
// emri 2026-07-19: dokunulmaz) into one self-contained page: web/atolye.html.
//
// The pen is NEVER modified. It is read as text, its three node:fs JSON loads
// are replaced with the JSON inlined, and its CLI tail is dropped. Everything
// else is byte-identical — same functions, same seeds, same drawing.
//
// On top of it sits the INGREDIENT layer (malzeme katmani):
//   prompt -> ingredient values -> a style record -> the pen -> flat on screen.
// The pen already takes a style record; styles.json just happens to hold 31 of
// them. Nothing in the pen requires the list. This page proves that by driving
// it with values that are not in the list.
// ============================================================================
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const R = (p) => readFileSync(join(ROOT, p), 'utf8');
const J = (p) => JSON.parse(R(p));

// ---------------------------------------------------------------- read the pen
let pen = R('engine/flat-engine/_engine-full.mjs');
let cloth = R('engine/flat-engine/cloth-solver.mjs');

// strip each file's node-only CLI tail (everything from its fs import onward)
const cutTail = (src) => {
  const i = src.indexOf("import { writeFileSync } from 'node:fs';");
  const j = src.indexOf("import {writeFileSync} from 'node:fs';");
  const k = Math.max(i, j);
  return k === -1 ? src : src.slice(0, k);
};
cloth = cutTail(cloth).replace(/^export const /gm, 'const ').replace(/^export function /gm, 'function ');
pen = cutTail(pen);

// replace the pen's three fs JSON loads with the JSON itself
pen = pen
  .replace(/import \{readFileSync as _rf\} from 'node:fs';\n/, '')
  .replace(/import \{rectClothGather as _rectGather, SEED_FABRICS as _SEED_FAB\} from '\.\/cloth-solver\.mjs';\n/, '')
  .replace(/var _CT=JSON\.parse\(_rf\([^;]+\);/, `var _CT=${JSON.stringify(J('contract/tables.json'))};`)
  .replace(/var _ST=JSON\.parse\(_rf\([^;]+\);/, `var _ST=${JSON.stringify(J('engine/flat-engine/styles.json'))};`)
  .replace(/var _FB=JSON\.parse\(_rf\([^;]+\);/, `var _FB=${JSON.stringify(J('contract/figure-bands.json'))};`)
  .replace(/^export \{[^}]+\};\s*$/m, '');

// the pen calls _rectGather / _SEED_FAB from the cloth solver
const penBundle = `${cloth}\nvar _rectGather=rectClothGather, _SEED_FAB=SEED_FABRICS;\n${pen}`;

if (/node:fs|node:url|process\.argv/.test(penBundle)) {
  console.error('BUILD FAILED: node-only code survived the bundle step');
  process.exit(1);
}

// TUR 17C: sayfanin "kopru neyi soyleyemiyor" paragrafinin sayilari BURADAN
// gelir, elle yazilmaz. Uretici: engine/tools/atolye-bridge-check.py --write,
// bekcisi ayni aracin --check kapisi. Sayfa ile olcum ayrilirsa kapi kirmizi.
const BD = J('engine/tools/atolye/bridge-dead.json');

const ING = R('engine/tools/atolye/ingredients.js');
const FOLD = R('engine/tools/atolye/foldlines.js');
const LEX = R('engine/tools/atolye/lexicon.js');
const UI = R('engine/tools/atolye/ui.js');
const CSS = R('engine/tools/atolye/atolye.css');

// --- collision guard.
// Everything below goes into ONE module scope. The pen declares `var S` (unitPX);
// the first version of the ingredient layer also declared `S`, which is a
// SyntaxError, so the page rendered blank with nothing in the console but
// "Identifier 'S' has already been declared". Caught by the DOM-shim test on
// 2026-07-31. The build now refuses rather than shipping a blank page.
const topLevelNames = (src) => {
  const out = new Set();
  const re = /^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm;
  let m; while ((m = re.exec(src))) out.add(m[1]);
  return out;
};
const scopes = [['pen', topLevelNames(penBundle)], ['ingredients', topLevelNames(ING)],
                ['foldlines', topLevelNames(FOLD)],
                ['lexicon', topLevelNames(LEX)], ['ui', topLevelNames(UI)]];
const clashes = [];
for (let i = 0; i < scopes.length; i++)
  for (let j = i + 1; j < scopes.length; j++)
    for (const n of scopes[i][1]) if (scopes[j][1].has(n)) clashes.push(`${n} (${scopes[i][0]} vs ${scopes[j][0]})`);
if (clashes.length) {
  console.error('BUILD FAILED: duplicate top-level declarations would blank the page:\n  ' + clashes.join('\n  '));
  process.exit(1);
}

const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>stitchu atolye</title>
<style>
${CSS}
</style>
</head>
<body>
<header class="bar">
  <span class="mark">stitchu</span>
  <span class="sub">atolye &mdash; malzeme tezgahi</span>
  <span class="ver" id="ver"></span>
</header>

<main>
  <section class="left">
    <form id="askform" autocomplete="off">
      <label class="lbl" for="ask">Ne dikelim?</label>
      <div class="askrow">
        <input id="ask" type="text" spellcheck="false"
               placeholder="puf kollu midi kloş elbise, derin v yaka">
        <button type="submit">ciz</button>
      </div>
      <p class="hint" id="hint">Cumle sadece <b>hangi malzemeden ne kadar</b> koyacagimizi soyler. Soylemedigin her malzeme varsayilanda kalir ve asagida <span class="tagd">varsayilan</span> diye isaretlenir.</p>
    </form>
    <div id="dials"></div>

    <section class="honest">
      <h2>Bu tezgah neyi yapamiyor?</h2>
      <p><b>Kanitlandi.</b> Satin alinmis Bugra "Locket Top" kalibinin uc bant parcasi
      &mdash; ureticinin kendi kitapciginda ikisinin adi var, ucuncusunun adi yok &mdash;
      olcum icin ayni nesne: iki kenarli egri bant. Her kenar <b>5 sayiyla</b>
      (uzunluk + 4 egrilik katsayisi) <b>0.01&ndash;0.05 mm</b>'ye yeniden cizildi.
      Adi olmayan parca da cizildi. Demek ki ad geometri tasimiyor.
      <span class="src">olculdu 2026-07-31</span></p>

      <p><b>Curutuldu.</b> "Yaka tipi diye bir sey yok, tek egrilik kadrani hepsini verir"
      &mdash; yanlis. Yatan yakanin boyun kenari gomlegin yakasindan kopyalanir ve omuz
      noktasinda kirilir; hakim yaka bir dikdortgen uzerine tek skalerden cizilir. Tek
      kadran ikisi arasinda gecemez. Kendi olcumum de ayni yere cikti: kapali formun
      hatasi %23, ve adsiz parcanin bagli kenari ortasinda kose tasiyor.
      Burada <b>dik/yatan bir sonuctur, girdi degil.</b></p>

      <p><b>Henuz yok.</b> Iplik ve verev &middot; kumas davranisi &middot; balans
      (on&ndash;arka boy iliskisi) &middot; her skalerin aslinda bir dagilim profili
      olmasi &middot; contouring &middot; spring &middot; sweep &middot; roll line &middot;
      dikis esitligi kisiti &middot; pay ve centik &middot; on&ndash;arka asimetri.
      Ayrica pens payi, ease ve cevre tek eksendir, burada uc kez sayildi.</p>

      <p><b>Ve en onemlisi:</b> topoloji bir malzeme degil, tabak secicisidir. Kac panel
      var sorusu once cevaplanir; surekli olan her sey onun altindadir. Bu yuzden
      <b>ne dikiyoruz</b> (elbise / ust) ve <b>govde tabani</b> (omuz / bant) en ustte,
      ayri bir aile olarak duruyor.</p>

      <p><b>1 Agustos duzeltmesi.</b> Bir gun once bu tezgah topolojiyi kadran degil
      SABIT tutuyordu: her cizim bir elbiseydi. Oysa kalem 17 ayri stil alani okuyor ve
      kalemin kendi listesindeki 31 kaydin <b>14'u ust</b>. Sekiz alan &mdash; ust govde,
      ust boyu, kutu kesim, peplum, peplum firfiri, bel bagi, spagetti aski, oturan
      korsaj &mdash; kalemde vardi, tezgahtan cikmiyordu. Hepsi acildi. Bir kadran bu
      govdede okunmuyorsa <b>silinmiyor, solduruluyor</b>: uzay gorunur kalsin ama yalan
      soylemesin. Hangi kadranin olu oldugu goz karari degil, bayt karsilastirmasiyla
      olculuyor.
      <span class="src">engine/tools/atolye-contact.mjs --dead</span></p>

      <p><b>Kalemin izin vermedigi yer.</b> Ust'te boy surekli DEGIL: kalem ust hem'ini
      uc kovadan okuyor (kisa 5 &middot; kalca 16 &middot; tunik 30), sayi kabul etmiyor.
      Kadran en yakin kovaya yuvarlanir ve okumasi ekranda kovanin adiyla gosterilir;
      kol boyunda da ayni sey oluyor. Kayik yaka ile kruvazenin kalemde ayri bir egrisi
      yok &mdash; kayik, genis ve sig bir yuvarlak yakadir; kruvazeyi cizen sey yaka
      egrisi degil bindirme on paneldir. Ikisi de oldugu gibi yazili, gizlenmedi.</p>

      <p>Ve hala: bu tezgah <b>kalip uretmiyor</b> &mdash; sadece flat ciziyor. Kalip
      koprusu ayri bir sey ve o da neyi soyleyemedigini yaninda yaziyor.</p>

      <p><b>17 Agustos olcumu &mdash; koprunun acigi.</b> Yukaridaki cumle
      ("neyi soyleyemedigini yaninda yaziyor") <b>olculdu ve tam tutmadi.</b>
      Once en onemlisi: <b>"kalip indir" sevk edilen motoru surmuyor.</b>
      Dugme <code>serve.py &rarr; generate.py &rarr; GarmentCode</code>
      <b>arsiv hattina</b> gidiyor; sevk edilen tek-yuzey motor
      (<code>engine/build/surface-pattern</code>) tek argüman aliyor &mdash; beden
      etiketi &mdash; ve <b>hicbir kadrani okumuyor.</b>
      Arsiv hattinda ise varsayilan topolojide <b>${BD.sayim.toplam_kadran} kadranin
      ${BD.sayim.kalibi_oynatan}'i</b> indirilen kalibi oynatiyor.
      Kalanin ${BD.sayim.ui_solduruyor}'ini bu sayfa zaten <b>solduruyor</b> (durust olu),
      ama <b>${BD.sayim.UI_PARLAK_AMA_KALIP_OKUMUYOR} kadran ekranda PARLAK durup
      kalibi hic oynatmiyor</b> &mdash; ve bunlarin
      <b>${BD.sayim.bunlardan_SESSIZCE_YUTULAN}'i notlarda bile gecmiyor</b>:
      <code>${BD.sessizce_yutulan.join(' ')}</code>.
      En agir sinif ucuncusu: <code>waistNip</code> 0.12&rarr;0.38 ve
      <code>yokeDrop</code> 12&rarr;26 <b>design.yaml'a gercekten islenip</b>
      (<code>shirt.width</code> 1.2053&rarr;1.0, <code>skirt.rise</code> 0.85&rarr;0.5)
      panel geometrisini <b>bayt bayt ayni</b> birakiyor &mdash; mapping haritaladigini
      sandigi icin nota da yazmiyor. Notlar mekanizmasi bu sinifi <b>yapica</b>
      goremez.
      Ayrica: arsiv hat <b>bayt determinist degil</b> &mdash; ayni durumla iki indirme
      iki farkli sha256 veriyor (fark yalniz dikis listesinin SIRASI; geometri ozdes,
      kok sebep <b>DOGRULANMADI</b>).
      Bu paragraftaki her sayi elle yazilmadi, <b>olculdu</b> ve bir kapiya bagli:
      sayfa ile olcum ayrilirsa kapi kirmizi yanar.
      <span class="src">engine/tools/atolye-bridge-check.py --check &middot; engine/tools/atolye/bridge-dead.json</span></p>
    </section>
  </section>

  <section class="right">
    <div class="stage"><div id="flat"></div></div>
    <div class="foot">
      <button id="dl-svg" type="button">flat.svg indir</button>
      <button id="dl-pattern" type="button" disabled
              title="yerel sunucu gerekir: scripts/atolye-serve.sh calistir, sayfayi oradan ac">kalip indir</button>
      <button id="reset" type="button">varsayilana don</button>
      <span class="stat" id="stat"></span>
    </div>
  </section>
</main>

<script type="module">
${penBundle}

${ING}

${FOLD}

${LEX}

${UI}
</script>
</body>
</html>
`;

writeFileSync(join(ROOT, 'web/atolye.html'), html);
console.log('wrote web/atolye.html', (html.length / 1024).toFixed(0) + 'kb');
