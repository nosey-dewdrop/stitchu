// gen-pattern-pages.mjs — builds the pattern library blog: one SEO page per FULL
// benchmark pattern (web/patterns/<slug>.html) + the index (web/patterns/index.html).
// Shell = the canonical baby-blue site universe (header/footer/theme, EN/TR toggle).
// Content is the engine's OWN drafted output; source photos are never named or shown.
// Writing rules (Damla): no em dash; sentence-headings get a full stop; question
// headings a question mark; "i" not "we".
//   run:  node engine/tools/render-patterns.mjs && node engine/tools/gen-pattern-pages.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const WEB = join(here, '../../web');
const OUT = join(WEB, 'patterns');
mkdirSync(OUT, { recursive: true });
const BASE = 'https://stitchu.noseydewdrop.com';
const V = process.env.V || '83';

const meta = JSON.parse(readFileSync(join(OUT, 'svg', 'meta.json'), 'utf8'));
// The sixties/seventies looks live in their own top-level Collections section
// (web/collections/ + collection-60s70s.html), no longer folded onto this page.
// Phase 2: the printable PDF pack, one set of three per pattern (gen-pattern-pdfs.mjs).
// File sizes shown to the visitor come straight from this manifest, never guessed.
const pdfManifest = JSON.parse(readFileSync(join(OUT, 'pdf', 'pdf-manifest.json'), 'utf8'));
const pdfBySlug = Object.fromEntries(pdfManifest.map((p) => [p.slug, p]));
const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

// Per-pattern editorial copy. Each entry keys off the slug from meta.json.
// lead / facts / fabric are the honest description of the ENGINE output; drawnBy
// links back to the patch that made it possible. TR mirrors EN.
const COPY = {
  'boat-neck-linen-shell': {
    en: { lead: 'A clean sleeveless shell with a wide boat neckline that sits high on the shoulder. There is no closure to draft: it drops over the head, so the whole pattern is four pieces.',
      fabric: 'Light to mid-weight woven linen or cotton, roughly 1.6 m at 140 cm.',
      facts: ['The boat neckline is cut wide and shallow, so the shoulder seam stays short and the neck opening clears the head without a zip.',
        'Bust and waist darts shape a soft, close fit through the body; the side seams follow the same shaping so the shell skims rather than boxes.',
        'A front and back neck facing finish the neckline cleanly, cut from the same drafted neck curve so they cannot drift from the edge they finish.'] },
    tr: { lead: 'Omuzda yüksek oturan geniş kayık yakalı, sade kolsuz bir bluz. Çizilecek kapama yok: baştan geçer, bu yüzden tüm kalıp dört parça.',
      fabric: 'Hafif ya da orta gramajlı dokuma keten veya pamuk, 140 cm ende yaklaşık 1.6 m.',
      facts: ['Kayık yaka geniş ve sığ kesilir, böylece omuz dikişi kısa kalır ve yaka açıklığı fermuar olmadan baştan geçer.',
        'Büst ve bel pensleri gövdeyi yumuşak, vücuda yakın biçimlendirir; yan dikişler aynı biçimi izler, bluz sarkmadan siner.',
        'Ön ve arka yaka pervazı yakayı temizce bitirir; bitirdikleri yaka eğrisinin aynısından kesilir, o kenardan kaymaları imkânsızdır.'] },
  },
  'scoop-neck-tank-mini-dress': {
    en: { lead: 'A soft scoop-neck tank dress cut in knit jersey. The stretch does the fitting, so it is a pull-on with a straight mini skirt and no closure.',
      fabric: 'Medium-weight knit jersey with recovery, roughly 1.5 m at 140 cm.',
      facts: ['Because the fabric is knit, the block is drafted with negative ease: the pattern sits smaller than the body and the jersey stretches to fit.',
        'The scoop neckline is dropped and rounded at the front and lifted at the back, finished with facings cut to the same curve.',
        'The straight mini skirt joins the bodice at the natural waist and falls without flare for a close column line.'] },
    tr: { lead: 'Örme jarseden kesilmiş yumuşak oval yakalı bir atlet elbise. Esneklik biçimlendirmeyi yapar, bu yüzden kapamasız, düz mini etekli, baştan geçen bir model.',
      fabric: 'Toparlayan orta gramajlı örme jarse, 140 cm ende yaklaşık 1.5 m.',
      facts: ['Kumaş örme olduğu için blok negatif bollukla çizilir: kalıp vücuttan küçük durur, jarse esneyerek oturur.',
        'Oval yaka önde düşük ve yuvarlak, arkada yükseltilmiş kesilir; aynı eğriden kesilen pervazlarla bitirilir.',
        'Düz mini etek doğal belde gövdeye eklenir ve yakın bir kolon çizgisi için kloşsuz düşer.'] },
  },
  'boat-neck-button-down-top': {
    en: { lead: 'A boat-neck top that buttons all the way down the front. The button placket is drafted, not implied: a grown-on stand carries the buttons and buttonholes on the printed piece.',
      fabric: 'Crisp mid-weight woven cotton, roughly 1.7 m at 140 cm.',
      facts: ['The front button placket grows on to the centre-front edge as an 18 mm stand, with a fold line, a fold-back facing line and the buttons and buttonholes marked directly on the piece.',
        'A button is forced at the bust line so the front cannot gape, following the womenswear right-over-left rule.',
        'Bust and waist darts shape the fit through the body, so the top follows the figure while the whole front stays one clean panel under the button placket.'] },
    tr: { lead: 'Önden boydan boya düğmeli, kayık yakalı bir üst. Düğme patı ima değil, çizilmiş: parça üzerinde büyüyen bir bant düğmeleri ve ilikleri taşır.',
      fabric: 'Diri, orta gramajlı dokuma pamuk, 140 cm ende yaklaşık 1.7 m.',
      facts: ['Ön düğme patı ön orta kenara 18 mm’lik bir bant olarak büyür; katlama çizgisi, geri katlanan pervaz çizgisi ve düğmelerle ilikler doğrudan parçaya işlenir.',
        'Büst hizasında zorunlu bir düğme konur, böylece ön açılmaz; kadın giyimindeki sağ-üste-sol kuralı izlenir.',
        'Büst ve bel pensleri biçimi vücut boyunca verir; ön parça düğme patının altında tek temiz bir panel olarak kalır.'] },
  },
  'gingham-button-blouse': {
    en: { lead: 'A sleeveless button blouse with a wide boat neckline and a full front placket. A boxy, forgiving fit shaped only by soft darts.',
      fabric: 'Mid-weight woven cotton or poplin, roughly 1.7 m at 140 cm.',
      facts: ['The full-length front button placket is drawn as a grown-on stand with the fold line, facing and every button and buttonhole placed on the piece.',
        'Light bust and waist darts give a soft, boxy fit rather than a fitted one, so the blouse hangs cleanly from the shoulder.',
        'The boat neckline and armholes are finished with facings cut from the same drafted edges they bind.'] },
    tr: { lead: 'Geniş kayık yakalı ve boydan boya ön patlı, kolsuz düğmeli bir bluz. Sadece yumuşak penslerle biçimlenen bol, affedici bir kesim.',
      fabric: 'Orta gramajlı dokuma pamuk ya da poplin, 140 cm ende yaklaşık 1.7 m.',
      facts: ['Boydan boya ön düğme patı, katlama çizgisi, pervaz ve her düğme ile ilik parçaya yerleştirilerek büyüyen bir bant olarak çizilir.',
        'Hafif büst ve bel pensleri oturmuş değil yumuşak, bol bir kesim verir; bluz omuzdan temizce düşer.',
        'Kayık yaka ve kol oyukları, bağladıkları aynı çizilmiş kenarlardan kesilen pervazlarla bitirilir.'] },
  },
  'mandarin-collar-fitted-blouse': {
    en: { lead: 'A fitted button blouse with short set-in sleeves and a low mandarin stand collar. Every added piece, collar and placket, is drafted from the same neck and centre-front the bodice already drew.',
      fabric: 'Crisp mid-weight woven cotton, roughly 2.3 m at 140 cm.',
      facts: ['The stand collar is a separate piece whose neck edge is measured straight off the drafted neckline, so it cannot come out longer or shorter than the opening it sits on.',
        'The front button placket grows on to the centre front with its fold line, facing and marked buttons and buttonholes.',
        'Bust and waist darts with a short set-in sleeve give a tailored, close fit through the bust and upper arm, keeping the front and back each a single panel.'] },
    tr: { lead: 'Kısa oturtma kollu ve alçak dik yakalı, oturmuş düğmeli bir bluz. Eklenen her parça, yaka ve pat, gövdenin çizdiği aynı yaka ve ön ortadan çizilir.',
      fabric: 'Diri, orta gramajlı dokuma pamuk, 140 cm ende yaklaşık 2.3 m.',
      facts: ['Dik yaka ayrı bir parçadır; yaka kenarı doğrudan çizilmiş yakadan ölçülür, oturduğu açıklıktan uzun ya da kısa çıkamaz.',
        'Ön düğme patı, katlama çizgisi, pervazı ve işaretli düğmeleriyle ön ortaya büyür.',
        'Büst ve bel pensleri ile kısa oturtma kol, büst ve üst kolda oturmuş yakın bir kesim verir; ön ve arka her biri tek panel kalır.'] },
  },
  'back-tie-shift-mini-dress': {
    en: { lead: 'A sleeveless shift mini dress with a boat neckline and a fabric tie at the back waist. The tie is a real cut piece, not a drawn-on suggestion.',
      fabric: 'Mid-weight woven linen, roughly 1.7 m at 140 cm.',
      facts: ['The back-waist tie is drafted as its own self-fabric rectangle, cut twice and folded into a self-lined tube, with a placement notch marked on the back where it attaches.',
        'The shift silhouette skims from a boat neckline to a straight mini hem, shaped lightly with darts rather than seams.',
        'A centre-back closure and neck facings finish the dress; the tie sits at the natural waist to draw the shift in.'] },
    tr: { lead: 'Kayık yakalı, arka belinde kumaş bağı olan kolsuz salaş mini elbise. Bağ çizilmiş bir öneri değil, gerçek bir kesim parçası.',
      fabric: 'Orta gramajlı dokuma keten, 140 cm ende yaklaşık 1.7 m.',
      facts: ['Arka bel bağı kendi kumaşından bir dikdörtgen olarak çizilir, iki kez kesilir ve kendinden astarlı bir tüpe katlanır; arkada bağlandığı yere yerleşim çentiği işlenir.',
        'Salaş siluet kayık yakadan düz mini eteğe siner; dikişlerle değil, hafif penslerle biçimlenir.',
        'Arka orta kapama ve yaka pervazları elbiseyi bitirir; bağ, salaşı toplamak için doğal belde durur.'] },
  },
  'square-neck-back-tie-babydoll-top': {
    en: { lead: 'A square-neck babydoll top with an empire seam and a fabric tie that closes at the back. A flared, romantic line drawn with soft darts and a high waist seam.',
      fabric: 'Mid-weight woven cotton or poplin, roughly 1.8 m at 140 cm.',
      facts: ['The back tie is a separate self-fabric strip, cut twice and self-lined, placed at the back with a marked attachment point.',
        'The square neckline is drafted with crisp corners and finished with a trued bias binding, so no separate facing piece is needed.',
        'Bust darts and an empire waist raise the fit line under the bust and let the lower body flare softly, while the front and back each stay a single panel.'] },
    tr: { lead: 'Empire dikişli ve arkadan bağlanan kumaş bağlı, kare yakalı bir babydoll üst. Yumuşak pensler ve yüksek bel dikişiyle çizilmiş kloş, romantik bir çizgi.',
      fabric: 'Orta gramajlı dokuma pamuk ya da poplin, 140 cm ende yaklaşık 1.8 m.',
      facts: ['Arka bağ ayrı bir kendinden kumaş şeridir; iki kez kesilir, kendinden astarlanır, arkaya işaretli bir bağlanma noktasıyla yerleştirilir.',
        'Kare yaka net köşelerle çizilir ve trüe edilmiş biye ile bitirilir; ayrı bir pervaz parçasına gerek kalmaz.',
        'Büst pensleri ve empire bel, oturma çizgisini büstün altına taşır ve alt gövdenin yumuşakça kloşlanmasına izin verir; ön ve arka her biri tek panel kalır.'] },
  },
  'empire-waist-tie-back-dress': {
    en: { lead: 'An empire-waist dress with a gathered bust panel and a fabric bow at the back waist. The gather and the bow are both drafted pieces, not just markings.',
      fabric: 'Mid-weight woven cotton or poplin, roughly 2.3 m at 140 cm.',
      facts: ['The bust panel is cut wider than the finished bust edge and gathered down to it; the cut width is measured from the drafted edge, so the gather ratio cannot drift.',
        'The back-waist bow is a separate self-lined tie piece with its own placement notch on the back.',
        'A high empire seam sits the gather under the bust; below it the gathered skirt falls full from the raised waist.'] },
    tr: { lead: 'Büzgülü büst panosu ve arka belinde kumaş fiyongu olan empire belli bir elbise. Büzgü de fiyonk da sadece işaret değil, çizilmiş parçalar.',
      fabric: 'Orta gramajlı dokuma pamuk ya da poplin, 140 cm ende yaklaşık 2.3 m.',
      facts: ['Büst panosu bitmiş büst kenarından geniş kesilir ve ona kadar büzülür; kesim genişliği çizilmiş kenardan ölçülür, büzgü oranı kayamaz.',
        'Arka bel fiyongu, arkada kendi yerleşim çentiği olan ayrı bir kendinden astarlı bağ parçasıdır.',
        'Yüksek empire dikişi büzgüyü büstün altına oturtur; altında büzgülü etek yükseltilmiş belden dolgun düşer.'] },
  },
  'square-neck-drawstring-babydoll-dress': {
    en: { lead: 'A square-neck babydoll dress gathered at the bust by a drawstring. The panel is cut wide and drawn in by a cord that runs through its own casing.',
      fabric: 'Mid-weight woven cotton or seersucker, roughly 1.9 m at 140 cm.',
      facts: ['The bust panel carries a drawstring casing drawn as two parallel channel lines with cord exit holes; a separate cord piece is drafted alongside.',
        'The cut width of the panel is the finished bust edge times the drawstring ratio, measured from the drafted edge so the gather stays true.',
        'The empire seam sets the drawstring under the bust and the gathered mini skirt falls full below it.'] },
    tr: { lead: 'Büstten bir büzgü bağıyla toplanan, kare yakalı bir babydoll elbise. Pano geniş kesilir ve kendi kanalından geçen bir kordonla içeri çekilir.',
      fabric: 'Orta gramajlı dokuma pamuk ya da seersucker, 140 cm ende yaklaşık 1.9 m.',
      facts: ['Büst panosu, iki paralel kanal çizgisi ve kordon çıkış delikleriyle çizilen bir büzgü kanalı taşır; yanında ayrı bir kordon parçası çizilir.',
        'Panonun kesim genişliği, bitmiş büst kenarı çarpı büzgü oranıdır; çizilmiş kenardan ölçülür, böylece büzgü doğru kalır.',
        'Empire dikişi büzgüyü büstün altına oturtur ve büzgülü mini etek altında dolgun düşer.'] },
  },
  'open-back-princess-mini-dress': {
    en: { lead: 'A princess-seam mini dress with a shaped open back. The cutout is drawn into the back piece and finished by a facing cut to the exact same line.',
      fabric: 'Mid-weight woven, roughly 2.1 m at 140 cm.',
      facts: ['The open-back cutout starts 40 mm below the nape so the shoulder still carries fabric, and clears the waist by 55 mm; its depth and width follow a round shape.',
        'The cutout is drawn half against the centre-back fold, so it opens to a fully symmetric shape when the piece is cut on the fold.',
        'A back facing carries the cutout line as a marking, byte-identical to the edge it finishes, so the finished opening cannot drift from what was drawn.'] },
    tr: { lead: 'Şekilli açık sırtı olan, prenses dikişli bir mini elbise. Oyuk arka parçaya çizilir ve tam aynı çizgiden kesilen bir pervazla bitirilir.',
      fabric: 'Orta gramajlı dokuma, 140 cm ende yaklaşık 2.1 m.',
      facts: ['Açık sırt oyuğu enseden 40 mm aşağıda başlar, böylece omuz hâlâ kumaş taşır; beli 55 mm boşlukla geçer; derinliği ve genişliği yuvarlak bir biçimi izler.',
        'Oyuk arka orta katlamaya karşı yarım çizilir, böylece parça katlamada kesildiğinde tamamen simetrik bir biçime açılır.',
        'Arka pervaz oyuk çizgisini bir işaret olarak taşır; bitirdiği kenarla bayt-birebir aynıdır, bitmiş oyuk çizilenden kayamaz.'] },
  },
  'open-back-tie-back-mini-dress': {
    en: { lead: 'A dart-shaped mini dress with a round open back and a fabric tie at the back. The cutout and the tie are drafted together, on the same back piece.',
      fabric: 'Mid-weight woven linen, roughly 2.3 m at 140 cm.',
      facts: ['The round open-back cutout is drawn half against the centre-back fold and clears the nape by 40 mm and the waist by 55 mm.',
        'A separate self-fabric tie closes the upper back, drafted as its own cut-twice piece with a placement notch, and it coexists on the same draft as the cutout.',
        'A back facing carries the cutout line as a marking so the finished opening matches the drawn line exactly.'] },
    tr: { lead: 'Yuvarlak açık sırtı ve arkasında kumaş bağı olan, pensle biçimlenmiş bir mini elbise. Oyuk ve bağ birlikte, aynı arka parçada çizilir.',
      fabric: 'Orta gramajlı dokuma keten, 140 cm ende yaklaşık 2.3 m.',
      facts: ['Yuvarlak açık sırt oyuğu arka orta katlamaya karşı yarım çizilir; enseyi 40 mm, beli 55 mm boşlukla geçer.',
        'Ayrı bir kendinden kumaş bağ üst sırtı kapatır; kendi iki-kez-kes parçası olarak yerleşim çentiğiyle çizilir ve oyukla aynı kalıpta bir arada durur.',
        'Arka pervaz oyuk çizgisini bir işaret olarak taşır, böylece bitmiş oyuk çizilen çizgiyle tam eşleşir.'] },
  },
  'peter-pan-collar-puff-sleeve-babydoll-dress': {
    en: { lead: 'A babydoll dress that pulls three added pieces together at once: a round peter-pan collar, a puff sleeve head and a smocked yoke. This is the pattern that proves several construction pieces can be drafted on one garment without any of them drifting.',
      fabric: 'Mid-weight woven cotton or poplin, roughly 2.6 m at 140 cm.',
      facts: ['The peter-pan collar is a separate flat piece with a round outer edge; its neck edge is measured straight off the drafted neckline so it fits the opening exactly.',
        'The puff sleeve raises and widens the cap and gathers the crown, drawn from the plain sleeve rather than guessed at.',
        'The smocked yoke panel is cut wider than the finished neck yoke and gathered down to it, the cut width taken from the drafted edge.'] },
    tr: { lead: 'Üç eklenen parçayı aynı anda bir araya getiren bir babydoll elbise: yuvarlak bebe yaka, puf kol başı ve büzgülü roba. Bu, birkaç yapım parçasının hiçbiri kaymadan tek bir giyside çizilebildiğini kanıtlayan kalıp.',
      fabric: 'Orta gramajlı dokuma pamuk ya da poplin, 140 cm ende yaklaşık 2.6 m.',
      facts: ['Bebe yaka, yuvarlak dış kenarı olan ayrı bir yatık parçadır; yaka kenarı doğrudan çizilmiş yakadan ölçülür, açıklığa tam oturur.',
        'Puf kol, kol başını yükseltip genişletir ve tacı büzer; tahminle değil, düz koldan çizilir.',
        'Büzgülü roba panosu bitmiş yaka robasından geniş kesilir ve ona kadar büzülür; kesim genişliği çizilmiş kenardan alınır.'] },
  },
  'ruffled-strap-milkmaid-babydoll-dress': {
    en: { lead: 'A square-neck milkmaid babydoll dress with ruffled shoulder straps, a shirred bust yoke and a soft tie at the front. Every gathered piece is drafted, not implied.',
      fabric: 'Light to mid-weight woven cotton or seersucker, roughly 2.2 m at 140 cm.',
      facts: ['The ruffled straps are separate self-fabric strips, each cut long and gathered along its length so it ruffles, with a placement notch on the front and back shoulder.',
        'The shirred front yoke is cut wider than the finished edge and drawn in with rows of gathering; the cut width comes from the drafted edge so the gather ratio cannot drift.',
        'The square neckline sits above an empire seam that raises the fit line under the bust, and the mini skirt falls gathered and full below it, closed with a soft front tie.'] },
    tr: { lead: 'Fırfırlı omuz askıları, büzgülü büst robası ve önde yumuşak bağı olan, kare yakalı bir milkmaid babydoll elbise. Büzülen her parça ima değil, çizilmiş.',
      fabric: 'Hafif ya da orta gramajlı dokuma pamuk ya da seersucker, 140 cm ende yaklaşık 2.2 m.',
      facts: ['Fırfırlı askılar ayrı kendinden kumaş şeritlerdir; her biri uzun kesilir ve boyunca büzülerek fırfırlanır; ön ve arka omuza yerleşim çentiğiyle konur.',
        'Büzgülü ön roba bitmiş kenardan geniş kesilir ve büzgü sıralarıyla içeri çekilir; kesim genişliği çizilmiş kenardan gelir, büzgü oranı kayamaz.',
        'Kare yaka, oturma çizgisini büstün altına taşıyan empire dikişinin üstünde durur; mini etek altında büzgülü ve dolgun düşer, önde yumuşak bir bağla kapanır.'] },
  },
  'shirt-collar-smocked-babydoll-top': {
    en: { lead: 'A babydoll top with a pointed shirt collar, a smocked chest yoke and short gathered puff sleeves, buttoning down the front. Collar, yoke, sleeve and placket are all drafted from the pieces the bodice already drew.',
      fabric: 'Crisp mid-weight woven cotton or poplin, roughly 2.2 m at 140 cm.',
      facts: ['The pointed shirt collar is two separate pieces, a stand and a blade, whose neck edge is measured straight off the drafted neckline so it fits the opening exactly.',
        'The smocked yoke panel across the chest is cut wider than the finished edge and drawn in with a smocking grid; the cut width is taken from the drafted edge.',
        'The gathered puff sleeve head is drawn from the plain sleeve, and a grown-on front button placket carries the fold line, facing and marked buttons and buttonholes.'] },
    tr: { lead: 'Sivri gömlek yakası, büzgülü göğüs robası ve kısa büzgülü puf kolları olan, önden düğmeli bir babydoll üst. Yaka, roba, kol ve pat, gövdenin çizdiği parçalardan çizilir.',
      fabric: 'Diri, orta gramajlı dokuma pamuk ya da poplin, 140 cm ende yaklaşık 2.2 m.',
      facts: ['Sivri gömlek yakası, bir bant ve bir yaprak olmak üzere iki ayrı parçadır; yaka kenarı doğrudan çizilmiş yakadan ölçülür, açıklığa tam oturur.',
        'Göğüs boyunca uzanan büzgülü roba panosu bitmiş kenardan geniş kesilir ve bir büzgü gridiyle içeri çekilir; kesim genişliği çizilmiş kenardan alınır.',
        'Büzgülü puf kol başı düz koldan çizilir; ön orta kenara büyüyen bir düğme patı katlama çizgisini, pervazı ve işaretli düğmelerle ilikleri taşır.'] },
  },
  'gathered-bust-empire-mini-dress': {
    en: { lead: 'A boat-neck empire mini dress with a gathered bust panel under the empire seam and a fabric bow at the back waist. Princess seams shape the bodice; the gather and the bow are real cut pieces.',
      fabric: 'Mid-weight woven cotton or poplin, roughly 2.3 m at 140 cm.',
      facts: ['The bust panel is cut wider than the finished bust edge and gathered down to it under a high empire seam; the cut width is measured from the drafted edge so the gather ratio cannot drift.',
        'Princess seams run over the bust for a shaped, close bodice fit, splitting the back into a centre and side panel.',
        'The back-waist bow is a separate self-lined tie piece with its own placement notch, and the gathered mini skirt falls full below the raised waist.'] },
    tr: { lead: 'Empire dikişinin altında büzgülü büst panosu ve arka belinde kumaş fiyongu olan, kayık yakalı empire mini elbise. Prenses dikişleri gövdeyi biçimlendirir; büzgü ve fiyonk gerçek kesim parçalarıdır.',
      fabric: 'Orta gramajlı dokuma pamuk ya da poplin, 140 cm ende yaklaşık 2.3 m.',
      facts: ['Büst panosu bitmiş büst kenarından geniş kesilir ve yüksek bir empire dikişinin altında ona kadar büzülür; kesim genişliği çizilmiş kenardan ölçülür, büzgü oranı kayamaz.',
        'Prenses dikişleri büstün üzerinden geçerek oturmuş, yakın bir gövde kesimi verir; arkayı orta ve yan panele böler.',
        'Arka bel fiyongu, kendi yerleşim çentiği olan ayrı bir kendinden astarlı bağ parçasıdır; büzgülü mini etek yükseltilmiş belin altında dolgun düşer.'] },
  },
  'patch-pocket-shift-dress': {
    en: { lead: 'A scoop-neck A-line shift dress with a pair of patch pockets on the front skirt. The pockets are real cut pieces the engine drafts and places, not a printed detail.',
      fabric: 'Mid-weight woven cotton, linen or twill, roughly 1.7 m at 140 cm.',
      facts: ['Each patch pocket is a separate rounded-corner piece with a self-hem top edge, sized in proportion to the front skirt panel and trued to the drafted placement.',
        'A softly flared A-line skirt gives room to reach into the pockets while keeping a clean line.',
        'The bodice is dart-shaped with a bias-bound neckline and armholes, closing with an invisible centre-back zip.'] },
    tr: { lead: 'Ön eteğinde bir çift yama cebi olan, oval yakalı A kesim şift elbise. Cepler baskı bir detay değil, motorun çizip yerleştirdiği gerçek kesim parçalarıdır.',
      fabric: 'Orta gramajlı dokuma pamuk, keten ya da twill, 140 cm ende yaklaşık 1.7 m.',
      facts: ['Her yama cebi, üst kenarı kendinden katlı, yuvarlak köşeli ayrı bir parçadır; ön etek panosuna oranlı boyutlanır ve çizilen yerleşime göre doğrulanır.',
        'Yumuşak açılan A kesim etek, temiz bir hat korurken cebe rahatça uzanma payı bırakır.',
        'Gövde pensli kesimdir; yaka ve kol oyukları biye ile bitirilir, arka orta gizli fermuarla kapanır.'] },
  },
  'cup-seam-corset-bustier': {
    en: { lead: 'A sweetheart princess bustier top with a horizontal cup seam. The seam splits the front into three drafted bands, an upper cup, a lower cup and a front body, the corset construction the engine used to be missing.',
      fabric: 'Mid-weight woven cotton, twill or a firm satin, roughly 1.5 m at 140 cm.',
      facts: ['The cup seam is an opt-in horizontal split. It cuts the sweetheart princess front into an Upper Cup, a Lower Cup and a Front Body, so the bust is shaped by seams the way a real corset bustier is built rather than by a single dart.',
        'The three cup bands are trued to each other at the seam, so the upper and lower cup edges that sew together came out an exact match, measured to 0.00 mm.',
        'This construction was learned from a purchased professional pattern by a forensic millimetre comparison, then drafted so it draws to your own measurements. It is opt-in, so the plain princess bustier is byte-identical when the cup seam is off.'] },
    tr: { lead: 'Yatay kup dikişli, kalp yakalı prenses bir bustiyer üst. Dikiş önü üç çizilmiş banda böler: bir üst kup, bir alt kup ve bir ön gövde; motorun eskiden eksik olduğu korse yapısı.',
      fabric: 'Orta gramajlı dokuma pamuk, twill ya da diri saten, 140 cm ende yaklaşık 1.5 m.',
      facts: ['Kup dikişi opsiyonel yatay bir bölmedir. Kalp yakalı prenses önü bir Üst Kup, bir Alt Kup ve bir Ön Gövdeye böler; böylece büst, tek bir pensle değil, gerçek bir korse bustiyerin kurulduğu gibi dikişlerle biçimlenir.',
        'Üç kup bandı dikiş yerinde birbirine trüe edilir; birbirine dikilen üst ve alt kup kenarları tam eşleşerek çıkar, 0.00 mm ölçülü.',
        'Bu yapı, satın alınmış profesyonel bir kalıptan adli bir milimetre karşılaştırmasıyla öğrenildi, sonra kendi ölçülerine göre çizilecek şekilde kuruldu. Opsiyoneldir, bu yüzden kup dikişi kapalıyken sade prenses bustiyer bayt-birebir aynıdır.'] },
  },
  'yoke-doll-dress': {
    en: { lead: 'A crew-neck doll dress with a horizontal yoke seam and a soft A-line skirt. The yoke splits the bodice front and back into a yoke and a lower body, the babydoll and swing-dress construction.',
      fabric: 'Light to mid-weight woven cotton or poplin, roughly 1.9 m at 140 cm.',
      facts: ['The yoke is an opt-in horizontal seam. It splits the front and back into a Front Yoke, a Back Yoke, a Front Body and a Back Body, so the dress can hang from a fitted yoke the way a doll or swing dress does.',
        'The yoke line is measured at 28 percent of the panel drop from shoulder to hem, so the seam sits high on the chest and back where the doll silhouette wants it.',
        'The seam is a plain yoke: the lower body does not gather yet, so the swing comes from the A-line skirt block rather than from fullness added at the yoke. It is opt-in, so the plain bodice is byte-identical when the yoke is off.'] },
    tr: { lead: 'Yatay roba dikişli ve yumuşak A kesim etekli, bisiklet yakalı bir doll elbise. Roba gövde önünü ve arkasını bir roba ile bir alt gövdeye böler; babydoll ve salıncak elbise yapısı.',
      fabric: 'Hafif ya da orta gramajlı dokuma pamuk ya da poplin, 140 cm ende yaklaşık 1.9 m.',
      facts: ['Roba opsiyonel yatay bir dikiştir. Önü ve arkayı bir Ön Roba, bir Arka Roba, bir Ön Gövde ve bir Arka Gövdeye böler; böylece elbise, bir doll ya da salıncak elbisesi gibi oturmuş bir robadan sarkabilir.',
        'Roba çizgisi, omuzdan eteğe panonun düşüşünün yüzde 28inde ölçülür; böylece dikiş, doll siluetinin istediği yerde, göğsün ve sırtın üstünde durur.',
        'Dikiş sade bir robadır: alt gövde henüz büzülmez, bu yüzden salınım robada eklenen bir dolgunluktan değil, A kesim etek bloğundan gelir. Opsiyoneldir, bu yüzden roba kapalıyken sade gövde bayt-birebir aynıdır.'] },
  },
  'ruffled-strap-drawstring-babydoll': {
    en: { lead: 'A ruffled-strap drawstring babydoll: a band bodice gathered onto a drawstring with a small centre bow, ruffled shoulder straps, and a gathered mini skirt that falls to a scalloped hem. This is the first flat drawn in stitchu\'s own drawing pen and the first one approved, shown beside the exact pattern the engine drafts from it.',
      fabric: 'Light woven cotton, lawn, or a soft crepe, roughly 1.9 m at 140 cm.',
      facts: ['The bodice is a gathered yoke panel cut wide and drawn up onto a drawstring cord, so it pulls in to fit while staying soft across the bust; the cord is its own cut piece.',
        'The ruffled shoulder straps are a real drafted piece, not a ready-made trim: each is cut as a 74 by 340 mm rectangle and gathered down to a finished 141 mm strap, cut 2. The exact strip length is drafted per size, so it sews, it is not decorative.',
        'The flat and the pattern on this page pass an automatic structural-equality test (preview-truth): every structural element you see in the drawing has a counterpart piece in the pattern. That check is the moat: it is a claim no competitor publishes.'] },
    tr: { lead: 'Fırfırlı askılı büzgülü bir babydoll: kordonla toplanan bir bant gövde, ortada küçük bir fiyonk, fırfırlı omuz askıları ve taraklı bir eteğe düşen büzgülü mini etek. Bu, stitchu\'nun kendi çizim kalemiyle çizilen ve onaylanan ilk flat; yanında motorun ondan çizdiği birebir kalıp.',
      fabric: 'Hafif dokuma pamuk, patiska ya da yumuşak krep, 140 cm ende yaklaşık 1.9 m.',
      facts: ['Gövde, geniş kesilip bir kordona toplanan büzgülü bir yaka panosudur; göğüste yumuşak kalırken oturacak kadar büzülür, kordon kendi kesim parçasıdır.',
        'Fırfırlı omuz askıları hazır bir şerit değil, gerçek çizilmiş bir parçadır: her biri 74 x 340 mm dikdörtgen kesilip bitmiş 141 mm askıya büzülür, cut 2. Şerit boyu beden başına hesaplanır, yani dekoratif değil dikilebilir.',
        'Bu sayfadaki çizim ile kalıp otomatik bir yapısal eşitlik testinden (preview-truth) geçer: çizimde gördüğünüz her yapısal öğenin kalıpta karşılığı vardır. Bu test moattır; hiçbir rakibin yayınlamadığı bir iddiadır.'] },
  },
};

// TR phrasing of "drawnBy" for the honest-note sentence, keyed by slug.
const DRAWN_BY_TR = {
  'boat-neck-button-down-top': 'ön düğme patını',
  'gingham-button-blouse': 'ön düğme patını',
  'mandarin-collar-fitted-blouse': 'yaka ailesini ve düğme patını',
  'back-tie-shift-mini-dress': 'kumaş arka bel bağını',
  'square-neck-back-tie-babydoll-top': 'kumaş arka bağı',
  'empire-waist-tie-back-dress': 'büzgülü büst panosunu ve arka bel fiyongunu',
  'square-neck-drawstring-babydoll-dress': 'ön büst büzgü bağını',
  'open-back-princess-mini-dress': 'şekilli açık sırt oyuğunu',
  'open-back-tie-back-mini-dress': 'açık sırt oyuğunu ve arka bağ kapamasını',
  'peter-pan-collar-puff-sleeve-babydoll-dress': 'bebe yakayı, puf kol başını ve büzgülü robayı',
  'ruffled-strap-milkmaid-babydoll-dress': 'fırfırlı omuz askılarını, büzgülü büst robasını ve ön bağı',
  'shirt-collar-smocked-babydoll-top': 'sivri gömlek yakasını, büzgülü göğüs robasını ve büzgülü puf kol başını',
  'gathered-bust-empire-mini-dress': 'empire dikişinin altındaki büzgülü büst panosunu ve arka bel fiyongunu',
  'patch-pocket-shift-dress': 'ön etekteki bir çift yama cebini',
  'cup-seam-corset-bustier': 'bustiyer önünü üç banda bölen yatay kup dikişini',
  'yoke-doll-dress': 'gövdeyi bir roba ile bir alt gövdeye bölen yatay roba dikişini',
};

// Human piece names for the piece list (strip the parenthetical TR the engine adds).
const cleanPiece = (n) => n.replace(/\s*\([^)]*\)\s*$/, '').trim();

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const bilingual = (en, tr, tag = 'span') => `<${tag} data-en="${esc(en)}" data-tr="${esc(tr)}">${esc(en)}</${tag}>`;

// ---- SEO depth helpers (mirror gen-collection-pattern.mjs): real content from
// the look's own data, never invented. Pattern-blog meta has no `shaping`, so
// difficulty leans on piece count, garment type and closure, which are enough.
function patDifficulty(m) {
  let score = 0;
  if (m.pieces >= 8) score += 2; else if (m.pieces >= 6) score += 1;
  if (m.garment === 'dress') score += 1;              // bodice + skirt join
  if (/zip|button|placket|lace/i.test(m.closure || '')) score += 1;
  if ((m.pieceNames || []).some((p) => /sleeve/i.test(p))) score += 1;
  if ((m.pieceNames || []).some((p) => /collar|cuff|pocket|placket/i.test(p))) score += 1;
  if (score <= 2) return { en: 'Beginner', tr: 'Başlangıç' };
  if (score <= 4) return { en: 'Confident beginner', tr: 'Orta-başlangıç' };
  return { en: 'Intermediate', tr: 'Orta' };
}
function patFaqEntries(m, diff) {
  const q = [];
  q.push({
    q_en: `How much fabric does the ${m.style.toLowerCase()} need?`,
    q_tr: `${m.style} ne kadar kumaş ister?`,
    a_en: `Plan for roughly ${m.fabric} m at 140 cm wide. The estimate scales with your measurements when you draft the pattern to your own size.`,
    a_tr: `140 cm ende yaklaşık ${m.fabric} m planlayın. Tahmin, kalıbı kendi bedeninize çizdiğinizde ölçülerinize göre değişir.`,
  });
  q.push({
    q_en: `Is the ${m.style.toLowerCase()} a beginner sewing pattern?`,
    q_tr: `${m.style} yeni başlayanlar için uygun mu?`,
    a_en: `Difficulty is ${diff.en.toLowerCase()}. It has ${m.pieces} pattern pieces${m.closure ? ` and closes with ${m.closure}` : ' and needs no separate closure'}.`,
    a_tr: `Zorluk ${diff.tr.toLowerCase()}. ${m.pieces} kalıp parçası var${m.closure ? ` ve kapanış ${m.closure}` : ' ve ayrı bir kapanış gerektirmez'}.`,
  });
  q.push({
    q_en: `Can I get the ${m.style.toLowerCase()} in my own measurements?`,
    q_tr: `${m.style} kendi ölçülerimde alabilir miyim?`,
    a_en: `Yes. The printable PDF is an EU38 demo, but on the create page the engine redraws every piece to your exact measurements, free.`,
    a_tr: `Evet. Baskıya hazır PDF EU38 örnektir, ama çiz sayfasında motor her parçayı tam ölçülerinize göre ücretsiz yeniden çizer.`,
  });
  q.push({
    q_en: `How do I print this pattern at the right size?`,
    q_tr: `Bu kalıbı doğru boyutta nasıl basarım?`,
    a_en: `Every sheet carries a 3 cm calibration square. Print at 100 percent scale with no fit-to-page, measure the square, and the pattern comes out true to size.`,
    a_tr: `Her sayfada 3 cm'lik bir kalibrasyon karesi var. Yüzde 100 ölçekte, sayfaya sığdırmadan basın, kareyi ölçün; kalıp gerçek boyutunda çıkar.`,
  });
  return q;
}

// Canonical site header (create · closet · patterns · benchmark · patch notes ·
// API + EN·TR). Byte-identical to gen-style-pages.mjs and the hand-written
// pages; dimensions/behaviour come from ../css/shared-header.css + shared-header.js.
// The patterns library is the "patterns" destination, so that item is sh-active.
const HEADER = `<header class="sh-header">
  <a class="brandpatch" href="../index.html">stitchu</a>
  <nav class="sh-nav">
    <a href="../create.html" data-en="Create" data-tr="Çiz">Create</a>
    <a href="../closet.html" data-en="Closet" data-tr="Dolap">Closet</a>
    <a href="index.html" class="sh-active" data-en="Pattern Blog" data-tr="Kalıp Günlüğü">Pattern Blog</a>
    <a href="../collections/index.html" data-en="Collections" data-tr="Koleksiyonlar">Collections</a>
    <a href="../benchmark.html" data-en="Benchmark" data-tr="Kıyaslama">Benchmark</a>
    <a href="../patches.html" data-en="Patch Notes" data-tr="Yama Notları">Patch Notes</a>
    <a href="../api.html" data-en="API" data-tr="API">API</a>
    <span class="sh-lang"><button id="lang-en">EN</button><span>·</span><button id="lang-tr">TR</button></span>
  </nav>
</header>`;

const FOOTER = `<footer>
  <span>stitchu · a pattern-making engine</span>
  <span><a href="../index.html" data-en="Home" data-tr="Ana Sayfa">Home</a> · <a href="index.html" data-en="Pattern Blog" data-tr="Kalıp Günlüğü">Pattern Blog</a> · <a href="../benchmark.html" data-en="Benchmark" data-tr="Kıyaslama">Benchmark</a> · <a href="../patches.html" data-en="Patch Notes" data-tr="Yama Notları">Patch Notes</a> · <a href="../api.html">API</a> · <a href="../privacy.html" data-en="Privacy" data-tr="Gizlilik">Privacy</a> · @nosey-dewdrop · <span style="opacity:.55">v${V}</span></span>
</footer>`;

const STYLE = `<style>
  :root{ --bb:#8fbfe8; --bb-deep:#3f74a8; --bb-pale:#dceaf7; --bb-line:#bcd7ee; --navy:#1f3a5f; --ink:#2b4a6b; }
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Helvetica,Arial,sans-serif;color:var(--navy);background:#fff;line-height:1.55;overflow-x:hidden}
  a{color:var(--bb-deep)}
  /* Header comes from ../css/shared-header.css (one source, byte-identical bar). */
  .wrap{max-width:840px;margin:0 auto;padding:14px 32px 100px}
  .crumbs{font-size:12px;color:#5b7089;letter-spacing:.4px;margin-bottom:16px}
  .crumbs a{text-decoration:none}
  h1{font-family:'Didot','Bodoni 72',Georgia,serif;font-size:38px;line-height:1.14;font-weight:400;margin:8px 0 12px;color:var(--navy);max-width:26ch}
  .lead{font-size:15.5px;color:var(--ink);max-width:64ch;margin-bottom:26px}
  .drawing{border:1px solid var(--bb-line);border-radius:4px;background:#fff;box-shadow:0 8px 26px rgba(63,116,168,.10);padding:18px;margin:6px 0 10px}
  .drawing img{display:block;width:100%;height:auto}
  .viewlabel{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--navy);margin:0 0 12px;font-weight:600}
  .cap{font-size:12px;color:#5b7089;margin-top:10px;letter-spacing:.3px}
  h2{font-family:'Didot','Bodoni 72',Georgia,serif;font-size:23px;font-weight:400;margin:38px 0 12px;color:var(--navy)}
  .fact{font-size:14px;color:var(--ink);max-width:66ch;margin-bottom:12px;position:relative;padding-left:18px}
  .fact::before{content:"";position:absolute;left:2px;top:10px;width:8px;height:2px;background:var(--bb-deep)}
  table{border-collapse:collapse;width:100%;font-size:13.5px;margin-top:6px}
  th,td{text-align:left;padding:9px 14px;border-bottom:1px solid var(--bb-line)}
  th{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#5b7089;background:var(--bb-pale)}
  td.v{font-variant-numeric:tabular-nums;font-weight:700;color:var(--navy)}
  .honest{font-size:13.5px;color:#5b7089;font-style:italic;margin:6px 0 4px;max-width:66ch}
  .honest a{font-style:normal}
  .wrap > .era{font-size:12.5px;letter-spacing:.4px;color:#5b7089;margin:0 0 14px}
  .faqs{margin-top:6px}
  .faq-item{padding:14px 0;border-bottom:1px solid var(--bb-line)}
  .faq-item:first-child{border-top:1px solid var(--bb-line)}
  .faq-q{font-size:15px;font-weight:700;color:var(--navy);margin-bottom:6px}
  .faq-a{font-size:13.5px;color:var(--ink);max-width:66ch}
  ul.related{list-style:none;margin:6px 0 0;padding:0}
  ul.related li{padding:9px 0;border-bottom:1px solid var(--bb-line);font-size:14px}
  ul.related a{text-decoration:none;color:var(--bb-deep)}
  ul.related .rel-era{color:#5b7089;font-size:12px;margin-left:8px}
  /* CTA look lives in ../css/shared-button.css (.sb-btn). Layout-only helpers here. */
  .sb-btn{margin-top:30px}
  .cta2{display:inline-block;margin:30px 0 0 16px;font-size:13px;letter-spacing:.4px;color:var(--navy);text-decoration:none;border-bottom:1px dashed var(--bb-deep);padding-bottom:2px}
  .dl .sb-btn{margin-top:14px}
  .dl-alt{margin:16px 0 0;display:flex;flex-wrap:wrap;gap:22px}
  .dl-link{font-size:13px;letter-spacing:.3px;color:var(--navy);text-decoration:none;border-bottom:1px dashed var(--bb-deep);padding-bottom:2px}
  .dl-size{font-size:12px;color:#5b7089;letter-spacing:.3px}
  .dl .honest{margin-top:16px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px;margin:22px 0 6px}
  .card{display:block;background:#fff;border:1px solid var(--bb-line);border-radius:4px;overflow:hidden;text-decoration:none;color:var(--navy);box-shadow:0 6px 20px rgba(63,116,168,.08)}
  .card:hover{border-color:var(--bb-deep);box-shadow:0 10px 28px rgba(63,116,168,.16)}
  .card .thumb{background:#fff;border-bottom:1px solid var(--bb-line);display:flex;align-items:stretch;justify-content:center}
  .card .thumb img{width:100%;height:auto;display:block}
  /* The listing card SVG is the tile (Etsy-shop feel). It already carries the
     name + badges, so the body caption below stays minimal. */
  .card.listing .thumb{padding:0;border-bottom:none}
  .card .body{padding:14px 16px}
  .card .nm{font-family:'Didot',Georgia,serif;font-size:17px;margin-bottom:5px;line-height:1.2}
  .card .ds{font-size:12px;color:#5b7089;line-height:1.45}
  .counter{font-size:14px;color:var(--ink);max-width:60ch;margin:2px 0 4px}
  .counter b{color:var(--navy)}
  /* 3x3 grid, nine patterns per page. auto-fill keeps it responsive but caps at
     three columns so the page always reads as the old 3x3 layout on desktop. */
  .grid9{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin:22px 0 6px}
  @media (max-width:760px){ .grid9{grid-template-columns:repeat(2,1fr)} }
  @media (max-width:520px){ .grid9{grid-template-columns:1fr} }
  .sec{margin:52px 0 0;padding-top:8px}
  h2.sec-h{font-family:'Didot','Bodoni 72',Georgia,serif;font-size:26px;font-weight:400;margin:0 0 8px;color:var(--navy)}
  .sec-line{font-size:15px;color:var(--ink);max-width:66ch;margin-bottom:8px}
  .sec-link{font-size:13.5px;letter-spacing:.3px;color:var(--navy);text-decoration:none;border-bottom:1px dashed var(--bb-deep);padding-bottom:2px}
  .card .era{font-size:11px;letter-spacing:.4px;color:#5b7089;margin-top:6px}
  .card .era .period{font-variant-numeric:tabular-nums;font-weight:700;color:var(--navy)}
  .pager{display:flex;align-items:center;gap:14px;margin:34px 0 4px;font-size:13px;letter-spacing:.3px}
  .pager a,.pager span{color:var(--navy);text-decoration:none}
  .pager a{border-bottom:1px dashed var(--bb-deep);padding-bottom:2px}
  .pager .cur{font-variant-numeric:tabular-nums;color:#5b7089}
  .pager .off{opacity:.4}
  footer{border-top:1px solid var(--bb-line);padding:24px 40px 34px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;font-size:11px;letter-spacing:1px;color:#5b7089}
  footer a{color:var(--navy);text-decoration:none}
  body::before{content:"";display:block;height:12px;background:repeating-linear-gradient(90deg, rgba(143,191,232,.55) 0 6px, transparent 6px 12px),repeating-linear-gradient(0deg, rgba(143,191,232,.55) 0 6px, transparent 6px 12px),#fff;}
</style>`;

function head(title, desc, canonical, ldjson) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 rx=%272%27 fill=%27%231f3a5f%27/%3E%3Cline x1=%276%27 y1=%2716%27 x2=%2726%27 y2=%2716%27 stroke=%27%23fff%27 stroke-width=%273%27 stroke-dasharray=%275 4%27/%3E%3C/svg%3E">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="stitchu">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="https://stitchu.noseydewdrop.com/assets/og-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://stitchu.noseydewdrop.com/assets/og-card.png">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<script type="application/ld+json">${JSON.stringify(ldjson)}</script>
<link rel="stylesheet" href="../css/shared-header.css?v=${V}">
<link rel="stylesheet" href="../css/theme-transitions.css?v=${V}">
<link rel="stylesheet" href="../css/shared-button.css?v=${V}">
${STYLE}
</head>
<body>`;
}

// ---- per-pattern pages ----
// The public benchmark number (photos that draft to a full pattern) is the
// canonical counter shown site-wide (index hero, benchmark page). It is NOT the
// count of curated detail pages, so it stays 37 independent of dedup. Source:
// the live benchmark reclassify (BENCHMARK-58 / patch history).
const FULL_PATTERN_COUNT = 37;
const totalPhotos = FULL_PATTERN_COUNT;
for (const m of meta) {
  const c = COPY[m.slug];
  if (!c) { console.log('NO COPY for', m.slug); continue; }
  const canonical = `${BASE}/patterns/${m.slug}.html`;
  // Title carries the high-intent search terms shoppers actually type ("free",
  // "PDF", "pattern") and is honest: every look is free and downloads as a PDF.
  const title = `${m.style} · free PDF pattern · stitchu`;
  // Meta description = the honest lead, plus a "Free printable PDF" CTA when
  // there is room under ~160 chars (drives the SERP click; every look is free).
  const CTA = ' Free printable PDF pattern.';
  const desc = c.en.lead.length + CTA.length <= 158
    ? c.en.lead + CTA
    : (c.en.lead.length > 155 ? c.en.lead.slice(0, 152) + '...' : c.en.lead);
  const svgUrl = `svg/${m.slug}.svg?v=${V}`;
  const flatUrl = m.flat ? `svg/${m.flat}` : null;
  const pieces = m.pieceNames.map(cleanPiece);

  const diff = patDifficulty(m);
  const faqs = patFaqEntries(m, diff);

  const ldjson = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: title, description: desc,
        image: `${BASE}/patterns/${svgUrl}`,
        author: { '@type': 'Organization', name: 'stitchu' },
        publisher: { '@type': 'Organization', name: 'stitchu' },
        datePublished: '2026-07-17', mainEntityOfPage: canonical,
        articleSection: 'Pattern library', inLanguage: 'en',
        about: { '@type': 'Thing', name: m.style },
        isBasedOn: `${BASE}/benchmark.html`,
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question', name: f.q_en,
          acceptedAnswer: { '@type': 'Answer', text: f.a_en },
        })),
      },
    ],
  };

  const facts = c.en.facts.map((f, i) => `<p class="fact" data-en="${esc(f)}" data-tr="${esc(c.tr.facts[i])}">${esc(f)}</p>`).join('\n  ');
  const pieceRows = pieces.map((p) => `<li>${esc(p)}</li>`).join('');
  const patchNote = m.patch
    ? { en: `This pattern became possible in patch ${m.patch}, when the engine learned to draft ${m.drawnBy}. Before that, ${m.style.toLowerCase()} came out missing that piece.`,
        tr: `Bu kalıp, motor ${DRAWN_BY_TR[m.slug] || m.drawnBy} çizmeyi öğrendiğinde, ${m.patch} yamasında mümkün oldu. Ondan önce bu model o parça eksik çıkıyordu.` }
    : { en: `This pattern was drawable from day one: every piece is in the engine's core vocabulary, so it drafts complete with no missing construction.`,
        tr: `Bu kalıp ilk günden çizilebiliyordu: her parça motorun temel dağarcığında, bu yüzden hiçbir yapım eksiği olmadan tam çizilir.` };

  // Download pack: printable PDFs built by the engine (gen-pattern-pdfs.mjs).
  // A4 tiled pack is the primary CTA; A0 single sheet and the sewing guide are
  // dashed text-links. Sizes are read from the PDF manifest, not guessed.
  const pdf = pdfBySlug[m.slug];
  const dlSection = pdf ? `
  <h2 data-en="Download the printable pattern." data-tr="Baskıya hazır kalıbı indir.">Download the printable pattern.</h2>
  <div class="dl">
    <a class="sb-btn sb-primary" href="pdf/${m.slug}-a4.pdf" download data-en="A4 print pack (EU38)" data-tr="A4 baskı paketi (EU38)">A4 print pack (EU38)</a>
    <span class="dl-size" data-en=" A4, ${pdf.a4pages} pages, ${kb(pdf.a4bytes)}." data-tr=" A4, ${pdf.a4pages} sayfa, ${kb(pdf.a4bytes)}."> A4, ${pdf.a4pages} pages, ${kb(pdf.a4bytes)}.</span>
    <div class="dl-alt">
      <a class="dl-link" href="pdf/${m.slug}-a0.pdf" download data-en="A0 single sheet (${kb(pdf.a0bytes)})" data-tr="A0 tek sayfa (${kb(pdf.a0bytes)})">A0 single sheet (${kb(pdf.a0bytes)})</a>
      <a class="dl-link" href="pdf/${m.slug}-guide.pdf" download data-en="sewing guide (${pdf.guideSteps} steps, ${kb(pdf.guidebytes)})" data-tr="dikiş kılavuzu (${pdf.guideSteps} adım, ${kb(pdf.guidebytes)})">sewing guide (${pdf.guideSteps} steps, ${kb(pdf.guidebytes)})</a>
    </div>
    <p class="honest" data-en="Every sheet carries a 3 cm calibration square. Measure it after printing at 100 percent scale, no fit-to-page, so the pattern comes out true to size." data-tr="Her sayfada 3 cm’lik bir kalibrasyon karesi var. Yüzde 100 ölçekte, sayfaya sığdırmadan bastıktan sonra ölç; böylece kalıp gerçek boyutunda çıkar.">Every sheet carries a 3 cm calibration square. Measure it after printing at 100 percent scale, no fit-to-page, so the pattern comes out true to size.</p>
  </div>
` : '';

  // Related patterns: three others from the library (internal links spread crawl
  // depth and link equity, and keep readers moving through the blog).
  const idxP = meta.findIndex((x) => x.slug === m.slug);
  const picks = [];
  for (let k = 1; picks.length < 3 && k <= meta.length; k++) {
    const cand = meta[(idxP + k) % meta.length];
    if (cand.slug !== m.slug && COPY[cand.slug]) picks.push(cand);
  }
  const faqHtml = faqs.map((f) => `
    <div class="faq-item">
      <h3 class="faq-q" data-en="${esc(f.q_en)}" data-tr="${esc(f.q_tr)}">${esc(f.q_en)}</h3>
      <p class="faq-a" data-en="${esc(f.a_en)}" data-tr="${esc(f.a_tr)}">${esc(f.a_en)}</p>
    </div>`).join('');
  const relatedHtml = picks.map((r) => `<li><a href="${r.slug}.html" data-en="${esc(r.style)}" data-tr="${esc(r.style)}">${esc(r.style)}</a> <span class="rel-era">${r.pieces} pieces</span></li>`).join('');

  const html = head(title, desc, canonical, ldjson) + `
${HEADER}
<div class="wrap">
  <p class="crumbs"><a href="../index.html">stitchu</a> / <a href="index.html" data-en="Pattern Blog" data-tr="Kalıp Günlüğü">Pattern Blog</a> / ${esc(m.style)}</p>
  <h1 data-en="${esc(m.style)}, drafted." data-tr="${esc(m.style)}, çizildi.">${esc(m.style)}, drafted.</h1>
  <p class="era"><span data-en="${diff.en}" data-tr="${diff.tr}">${diff.en}</span> · <span data-en="${m.garment === 'dress' ? 'Dress' : m.garment === 'top' ? 'Top' : 'Skirt'}" data-tr="${m.garment === 'dress' ? 'Elbise' : m.garment === 'top' ? 'Üst' : 'Etek'}">${m.garment === 'dress' ? 'Dress' : m.garment === 'top' ? 'Top' : 'Skirt'}</span> · <span data-en="${m.pieces} pattern pieces" data-tr="${m.pieces} kalıp parçası">${m.pieces} pattern pieces</span></p>
  <p class="lead" data-en="${esc(c.en.lead)}" data-tr="${esc(c.tr.lead)}">${esc(c.en.lead)}</p>

  ${flatUrl ? `<div class="drawing">
    <img src="${flatUrl}?v=${V}" alt="${esc(m.style)} fashion flat drawn by the stitchu engine" loading="lazy">
    <p class="cap" data-en="The fashion flat, front and back, drawn in the engine's own pen." data-tr="Motorun kendi kalemiyle çizilmiş fashion flat, ön ve arka.">The fashion flat, front and back, drawn in the engine's own pen.</p>
  </div>` : ''}

  <div class="drawing">
    <img src="${svgUrl}" alt="${esc(m.style)} pattern pieces drafted by the stitchu engine" loading="lazy">
    <p class="cap" data-en="The engine's own drafted pieces for this style, laid out for cutting. Drawn to an EU38 demo body." data-tr="Bu model için motorun kendi çizdiği parçalar, kesim için yerleştirilmiş. EU38 örnek beden üzerine çizildi.">The engine's own drafted pieces for this style, laid out for cutting. Drawn to an EU38 demo body.</p>
  </div>

  <h2 data-en="How the engine drafts it." data-tr="Motor bunu nasıl çizer.">How the engine drafts it.</h2>
  ${facts}

  <h2 data-en="What is in the pattern." data-tr="Kalıpta ne var.">What is in the pattern.</h2>
  <table>
    <tr><th data-en="pattern pieces" data-tr="kalıp parçaları">pattern pieces</th><th data-en="fabric estimate" data-tr="kumaş tahmini">fabric estimate</th></tr>
    <tr><td><ul style="list-style:none;margin:0">${pieceRows}</ul></td><td class="v"><span data-en="${esc(c.en.fabric)}" data-tr="${esc(c.tr.fabric)}">${esc(c.en.fabric)}</span><br><span style="font-weight:400;color:#5b7089;font-size:12px" data-en="${m.pieces} pieces · fabric scales to your measurements" data-tr="${m.pieces} parça · kumaş ölçülerinize göre değişir">${m.pieces} pieces · fabric scales to your measurements</span></td></tr>
  </table>

  <h2 data-en="The honest note." data-tr="Dürüst not.">The honest note.</h2>
  <p class="honest" data-en="${esc(patchNote.en)}" data-tr="${esc(patchNote.tr)}">${esc(patchNote.en)}</p>
  <p class="honest">${m.patch ? `<a href="../patches.html" data-en="See patch ${m.patch} in the patch notes →" data-tr="Yama notlarında ${m.patch} yamasına bak →">See patch ${m.patch} in the patch notes →</a>` : `<a href="../patches.html" data-en="See the full patch history →" data-tr="Tüm yama geçmişine bak →">See the full patch history →</a>`}</p>

  <h2 data-en="Common questions." data-tr="Sık sorulanlar.">Common questions.</h2>
  <div class="faqs">${faqHtml}
  </div>
${dlSection}
  <h2 data-en="More from the pattern library." data-tr="Kalıp kütüphanesinden daha fazlası.">More from the pattern library.</h2>
  <ul class="related">${relatedHtml}
  </ul>
  <a class="sb-btn sb-primary" href="../create.html" data-en="Draft this to your measurements, free." data-tr="Bunu ölçülerine göre çiz, ücretsiz.">Draft this to your measurements, free.</a>
  <a class="cta2" href="index.html" data-en="Browse the pattern library →" data-tr="Kalıp kütüphanesine göz at →">Browse the pattern library →</a>
</div>
${FOOTER}
<script src="../js/shared-header.js?v=${V}"></script>
</body>
</html>`;
  writeFileSync(join(OUT, `${m.slug}.html`), html);
}

// ---- Patterns page (the single Patterns/journal home, paginated 9 per page) ----
// Damla: the pattern page IS the blog. There is no separate /blog/. Nine cards
// per page in a 3x3 grid, paginated (page 1 = index.html, page 2 = page-2.html,
// ...). The sixties/seventies looks are folded onto page 1 as their own section.
const PER_PAGE = 9;

// Title Case for headings/labels/nav (Damla design rule). Body sentences stay
// sentence case; this only touches headings and the vintage house line.
const MINOR = new Set(['a', 'an', 'and', 'the', 'of', 'to', 'in', 'on', 'with', 'for']);
function titleCase(s) {
  return s.split(' ').map((w, i) => w.split('-').map((seg) => {
    const low = seg.toLowerCase();
    if (i !== 0 && MINOR.has(low)) return low;
    return seg.charAt(0).toUpperCase() + seg.slice(1);
  }).join('-')).join(' ');
}

function patternCard(m) {
  const c = COPY[m.slug];
  const short = c ? c.en.lead.split('. ')[0] + '.' : m.style;
  const shortTr = c ? c.tr.lead.split('. ')[0] + '.' : m.style;
  // The Etsy-style listing card SVG is the tile — it already carries the brand,
  // name, badges and the pattern pieces. The caption below stays minimal.
  const thumb = (m.card ? `svg/${m.card}` : `svg/${m.slug}.svg`) + `?v=${V}`;
  return `<a class="card listing" href="${m.slug}.html">
    <div class="thumb"><img src="${thumb}" alt="${esc(m.style)} sewing pattern listing card" loading="lazy"></div>
    <div class="body">
    <div class="ds" data-en="${esc(short)}" data-tr="${esc(shortTr)}">${esc(short)}</div></div>
  </a>`;
}

const pageCount = Math.max(1, Math.ceil(meta.length / PER_PAGE));

function pager(cur) {
  if (pageCount <= 1) return '';
  const links = [];
  links.push(cur > 1
    ? `<a href="${cur === 2 ? 'index.html' : `page-${cur - 1}.html`}" data-en="Previous" data-tr="Önceki">Previous</a>`
    : `<span class="off" data-en="Previous" data-tr="Önceki">Previous</span>`);
  for (let p = 1; p <= pageCount; p++) {
    const href = p === 1 ? 'index.html' : `page-${p}.html`;
    links.push(p === cur ? `<span class="cur">${p}</span>` : `<a href="${href}">${p}</a>`);
  }
  links.push(cur < pageCount
    ? `<a href="${cur === pageCount ? '' : `page-${cur + 1}.html`}" data-en="Next" data-tr="Sonraki">Next</a>`
    : `<span class="off" data-en="Next" data-tr="Sonraki">Next</span>`);
  return `<nav class="pager">${links.join('\n    ')}</nav>`;
}

for (let page = 1; page <= pageCount; page++) {
  const slice = meta.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const isFirst = page === 1;
  const file = isFirst ? 'index.html' : `page-${page}.html`;
  const canonical = isFirst ? `${BASE}/patterns/` : `${BASE}/patterns/${file}`;
  const title = isFirst ? 'Pattern Blog · stitchu' : `Pattern Blog, Page ${page} · stitchu`;
  const desc = `Every style the stitchu engine drafts into a complete, sewable pattern from one photo. ${meta.length} distinct product styles, each drawn by the engine and published, with the honest patch that made it possible.`;
  const cards = slice.map(patternCard).join('\n  ');

  const ldjson = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: title, description: desc, url: canonical, inLanguage: 'en',
    mainEntity: {
      '@type': 'ItemList', numberOfItems: slice.length,
      itemListElement: slice.map((m, i) => ({
        '@type': 'ListItem', position: (page - 1) * PER_PAGE + i + 1, name: m.style,
        url: `${BASE}/patterns/${m.slug}.html`,
      })),
    },
  };

  const html = head(title, desc, canonical, ldjson) + `
${HEADER}
<div class="wrap">
  <p class="crumbs"><a href="../index.html">stitchu</a> / <span data-en="patterns" data-tr="kalıplar">patterns</span>${isFirst ? '' : ` / <span data-en="page ${page}" data-tr="sayfa ${page}">page ${page}</span>`}</p>
  <h1 data-en="Pattern Blog." data-tr="Kalıp Günlüğü.">Pattern Blog.</h1>
  <p class="lead" data-en="This is where the engine's work is collected as something you can read. Every pattern below was drafted end to end from a single photo, and every drawing is the engine's own output, nothing traced or mocked." data-tr="Burası, motorun işinin okunabilir bir şeye dönüştüğü yer. Aşağıdaki her kalıp tek bir fotoğraftan baştan sona çizildi ve her çizim motorun kendi çıktısı, hiçbiri kopyalanmış ya da taklit değil.">This is where the engine's work is collected as something you can read. Every pattern below was drafted end to end from a single photo, and every drawing is the engine's own output, nothing traced or mocked.</p>
  <p class="counter" data-en="${totalPhotos} of 54 real product photos turn into a full pattern, and counting." data-tr="54 gerçek ürün fotoğrafının ${totalPhotos}'i tam kalıba dönüşüyor, ve artıyor.">${totalPhotos} of 54 real product photos turn into a full pattern, and counting.</p>
  <p class="counter"><a href="../patches.html" data-en="Follow The Number In The Patch Notes" data-tr="Sayıyı Yama Notlarında Takip Et">Follow The Number In The Patch Notes</a></p>

  <div class="grid9">
  ${cards}
  </div>
  ${pager(page)}
  <a class="sb-btn sb-primary" href="../create.html" data-en="Draft One To Your Measurements, Free." data-tr="Birini Ölçülerine Göre Çiz, Ücretsiz." style="margin-top:36px">Draft One To Your Measurements, Free.</a>
</div>
${FOOTER}
<script src="../js/shared-header.js?v=${V}"></script>
</body>
</html>`;
  writeFileSync(join(OUT, file), html);
}

// Remove any stale page-N.html that a previous (larger) catalog left behind, so
// a shrunken catalog never leaves an orphan page live.
{
  const existing = readdirSync(OUT).filter((f) => /^page-\d+\.html$/.test(f));
  for (const f of existing) {
    const n = Number(f.match(/^page-(\d+)\.html$/)[1]);
    if (n > pageCount) { rmSync(join(OUT, f)); console.log(`removed stale ${f}`); }
  }
}

console.log(`generated ${meta.length} pattern pages + ${pageCount} listing page(s) -> ${OUT}`);
console.log(`total photos counter: ${totalPhotos} of 54`);
