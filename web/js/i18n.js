// Two languages, one tiny dictionary. Default English; "tr" persisted in
// localStorage. Static pages translate via data-i18n attributes, dynamic
// screens call t(). Sewing-guide steps stay English for now: correct Turkish
// sewing terminology is content, and content is Damla's, flagged in TR mode.
const LANG_KEY = 'stitchu:lang';

export const STRINGS = {
  // nav + landing
  'nav.create': { tr: 'oluştur' },
  'nav.closet': { tr: 'dolap' },
  'hero.title': { en: 'Photograph a garment. Get its sewing pattern in eight fixed sizes, EU34 to EU48.', tr: 'Bir kıyafetin fotoğrafını çek. Dikiş kalıbını sekiz sabit bedenden birinde al.' },
  'hero.sub': { en: 'True-scale A4 printing, fabric advice and a step-by-step sewing guide. The numbers you type never leave this browser.', tr: 'Gerçek ölçekli A4 baskı, kumaş önerisi ve adım adım dikiş rehberi. Ölçülerin bu tarayıcıdan asla çıkmaz.' },
  'hero.cta': { en: 'Start a pattern', tr: 'Kalıba başla' },
  // V10-D L3: bu satır işaretsiz bir blokta "coming soon / yakında" taşıyordu ve
  // bir JS stringi data-vision="1" ile İŞARETLENEMEZ. Vaat silindi; yerine bugünün
  // durumu yazıldı (App/ klasörü referans kopya, sevk edilmiş bir iOS uygulaması YOK).
  'hero.platforms': { en: 'web only, that is the whole platform list today', tr: 'yalnız web; bugünkü platform listesi bu' },
  'hero.sewhint': { en: 'drag along the line to sew your first stitch', tr: 'ilk ilmeğini dikmek için çizgi boyunca sürükle' },
  'how.title': { en: 'How it works', tr: 'Nasıl çalışır' },
  'how.1.title': { en: 'Upload a photo', tr: 'Fotoğraf yükle' },
  'how.1.body': { en: 'Any skirt, dress or top. Stitchu reads the neckline, sleeves and silhouette, and you confirm what it saw.', tr: 'Herhangi bir etek, elbise ya da üst. Stitchu yakayı, kolları ve silueti okur; gördüğünü sen onaylarsın.' },
  'how.2.title': { en: 'Drafted from the seven numbers you type', tr: 'Yazdığın yedi ölçüden çizilir' },
  'how.2.body': { en: 'The pattern is calculated in the eight fixed sizes EU34 to EU48, right here in the browser. Nothing is uploaded.', tr: 'Kalıp, EU34 ile EU48 arası sekiz sabit bedende, bu tarayıcının içinde hesaplanır. Hiçbir şey yüklenmez.' },
  'how.3.title': { en: 'Print and sew', tr: 'Bas ve dik' },
  'how.3.body': { en: 'Tiled A4 sheets with a calibration square, fabric meters, and a sewing order that starts at the right seam.', tr: 'Kalibrasyon kareli A4 yapraklar, kumaş metresi ve doğru dikişten başlayan dikim sırası.' },
  'wall.title': { en: 'The stitch wall', tr: 'Dikiş duvarı' },
  'wall.lede': { en: 'Every visitor sews a few stitches and they stay. Drag inside the frame, this thread color is yours.', tr: 'Her ziyaretçi birkaç ilmek atar ve ilmekler kalır. Çerçevenin içinde sürükle, bu iplik rengi senin.' },
  'wall.yourthread': { en: 'your thread', tr: 'senin ipliğin' },
  'wall.noteplaceholder': { en: 'Leave a note under the wall (80 chars)', tr: 'Duvarın altına bir not bırak (80 karakter)' },
  'wall.stitchit': { en: 'Stitch it', tr: 'Dik gitsin' },
  'wall.localmode': { en: 'the shared wall wakes up at launch, until then your stitches stay on this device', tr: 'ortak duvar lansmanla uyanacak, o zamana dek ilmeklerin bu cihazda kalır' },
  'wall.unreachable': { en: 'the wall is unreachable right now, your stitches stay on this device', tr: 'duvara şu an ulaşılamıyor, ilmeklerin bu cihazda kalır' },
  'wall.keepkind': { en: 'keep it kind', tr: 'kibar kalalım' },
  'wall.notefail': { en: 'could not stitch the note, try later', tr: 'not dikilemedi, sonra dene' },
  'wall.count': { en: '{n} stitches sewn by visitors', tr: 'ziyaretçiler {n} ilmek dikti' },
  'wall.count1': { en: '1 stitch sewn by visitors', tr: 'ziyaretçiler 1 ilmek dikti' },
  'footer.tag': { en: 'stitchu, a pocket sewing teacher', tr: 'stitchu, cep terzisi öğretmenin' },
  'footer.privacy': { tr: 'gizlilik' },

  // create flow
  'create.measure.title': { en: 'Your body numbers', tr: 'Ölçülerin' },
  'create.measure.sub': { en: 'Seven measurements, once, saved on this device only.', tr: 'Yedi ölçü, bir kez, yalnızca bu cihazda saklanır.' },
  'create.measure.privacy': { en: 'Stored in this browser only. Nothing is uploaded.', tr: 'Yalnızca bu tarayıcıda saklanır. Hiçbir şey yüklenmez.' },
  'create.measure.numerror': { en: 'Enter a number in centimeters.', tr: 'Santimetre cinsinden bir sayı gir.' },
  'create.measure.rangeerror': { en: "That doesn't look like a {label} in cm (expected {min}–{max}).", tr: 'Bu cm cinsinden bir {label} gibi durmuyor ({min}–{max} arası bekleniyor).' },
  'create.back': { en: 'Back', tr: 'Geri' },
  'create.next': { en: 'Next, {label}', tr: 'Sıradaki, {label}' },
  'create.skip': { en: 'Skip, pick your garment', tr: 'Atla, kıyafetini seç' },
  'create.optional': { en: 'optional', tr: 'isteğe bağlı' },
  'create.profile.current': { en: 'current body', tr: 'aktif beden' },
  'create.profile.nameph': { en: 'name this body (e.g. a client)', tr: 'bu bedene ad ver (örn. bir müşteri)' },
  'create.profile.save': { en: 'Save body', tr: 'Bedeni kaydet' },
  'create.done': { en: 'Done, pick your garment', tr: 'Bitti, kıyafetini seç' },
  'create.spec.title': { en: 'What are we sewing?', tr: 'Ne dikiyoruz?' },
  'create.spec.sub': { en: 'Pick the garment; the pattern is drafted to your saved measurements. ', tr: 'Kıyafeti seç; kalıp kayıtlı ölçülerine çizilir. ' },
  'create.spec.subdemo': { en: 'Pick a garment (or upload a photo) and see a real pattern, drafted to a standard size for now. ', tr: 'Bir kıyafet seç (ya da fotoğraf yükle) ve gerçek bir kalıp gör, şimdilik standart bedene çizilir. ' },
  'create.spec.edit': { en: 'Edit measurements', tr: 'Ölçüleri düzenle' },
  'create.spec.addmeasure': { en: 'add the seven body numbers', tr: 'ölçülerini ekle' },
  'create.demo.banner': { en: 'This is a standard EU38. Make it fit you →', tr: 'Bu standart EU38 beden. Kendine göre çizdir →' },
  'create.demo.cta': { en: 'Draft it to my measurements', tr: 'Benim ölçülerime çiz' },
  'create.demo.badge': { en: 'standard size, not yet yours', tr: 'standart beden, henüz senin değil' },
  'create.spec.prompt': { en: 'or describe it in words', tr: 'ya da yazıyla tarif et' },
  'create.spec.promptph': { en: 'e.g. "puff-sleeve mini dress" or "square neckline, long fitted sleeves"', tr: 'örn. "puf kollu mini elbise" ya da "kare yaka, uzun kol"' },
  'create.spec.promptbtn': { en: 'Read my words', tr: 'Yazdığımı oku' },
  'create.spec.promptok': { en: 'read: {what}. Check the picks below, fix anything I got wrong.', tr: 'okunan: {what}. Aşağıdaki seçimleri kontrol et, yanlışım varsa düzelt.' },
  'create.spec.promptunknown': { en: 'not understood: {word} — {hint}', tr: 'anlaşılmadı: {word} — {hint}' },
  'create.spec.promptempty': { en: 'Nothing to read yet — type a few words about the garment.', tr: 'Okunacak bir şey yok — giysiyi birkaç kelimeyle yaz.' },
  'create.spec.photo': { en: 'or start from a photo', tr: 'ya da fotoğraftan başla' },
  'create.spec.photobtn': { en: 'Upload a garment photo', tr: 'Kıyafet fotoğrafı yükle' },
  // F10-vitrin: the privacy sentence ON the upload door, not only on the
  // privacy page. The photo does NOT stay on the device — the engine does, the
  // vision does not — and saying so before the click is the honest order.
  'create.spec.photoprivacy': {
    en: 'The photo is sent to the stitchu server and forwarded to the Anthropic API for garment reading; it is not stored. The pattern itself is drafted in your browser.',
    tr: 'Fotoğraf stitchu sunucusuna gönderilir ve giysi okuması için Anthropic API\'ye iletilir; saklanmaz. Kalıbın kendisi tarayıcında çizilir.',
  },
  'create.spec.reading': { en: 'reading the garment…', tr: 'kıyafet okunuyor…' },
  // F3-arka: the optional back-photo door + the two honest sentences. The
  // invented-back sentence DECLARES, it does not ask — the flow never stops.
  'create.spec.arkabtn': { en: 'Add a back photo (optional)', tr: 'Arka fotoğraf ekle (isteğe bağlı)' },
  'create.spec.arkareading': { en: 'reading the back…', tr: 'arka okunuyor…' },
  'create.spec.arkauydurma': { en: 'No back photo, so the back is INVENTED and labelled so: plain back, neck mirroring the front, a zip only if it will not slip on. Add a back photo or pick the back yourself to change it.', tr: 'Arka fotoğraf yok, arka UYDURULDU ve öyle etiketlendi: düz sırt, boyun ön yakanın aynası, geçmiyorsa fermuar. Değiştirmek için arka fotoğraf ekle ya da arkayı kendin seç.' },
  'create.spec.arkagorulen': { en: 'The back photo was read — the back fields now come from it.', tr: 'Arka fotoğraf okundu — arka alanları artık ondan geliyor.' },
  'create.spec.checkpicks':{ en: 'Check the picks below, fix anything I got wrong.', tr: 'Aşağıdaki seçimleri kontrol et, yanlışım varsa düzelt.' },
  'create.spec.ratiobelirsiz': { en: 'I could not read these proportions confidently, the pattern uses the standard table for them:', tr: 'Bu oranları emin okuyamadım, kalıp onlar için standart tabloyu kullandı:' },
  'create.draft': { en: 'Draft my pattern', tr: 'Kalıbımı çiz' },
  'create.drafting': { en: 'drafting your pattern…', tr: 'kalıbın çiziliyor…' },
  'create.engineerror': { en: 'The engine failed to load. Refresh and try again.', tr: 'Motor yüklenemedi. Sayfayı yenileyip tekrar dene.' },
  'create.result.title': { en: '{garment}, drafted for you.', tr: '{garment}, senin için çizildi.' },
  'create.changegarment': { en: 'Change garment', tr: 'Kıyafeti değiştir' },
  'create.save': { en: 'Save to closet', tr: 'Dolaba kaydet' },
  'create.print': { en: 'Print, true scale A4', tr: 'Yazdır, gerçek ölçek A4' },
  // F-İNDİR: the three files a user takes home. Named by what they are FOR,
  // not by their extension — a shopper knows "home printer", not "A4 tiled".
  'create.dl.title': { en: 'Take it home', tr: 'Eve götür' },
  'create.dl.sub': {
    en: 'The pattern you cut, and the flat that says what it is — all straight from the engine that drafted this. Print at true scale, then measure the calibration square on the cover before you cut.',
    tr: 'Keseceğin kalıp, ve onun ne olduğunu anlatan teknik çizim — hepsi bu kalıbı çizen motorun kendi çıktısı. Gerçek ölçekte yazdır, kesmeden önce kapaktaki kalibrasyon karesini ölç.',
  },
  'create.dl.pdf': { en: 'PDF, home printer (A4)', tr: 'PDF, ev yazıcısı (A4)' },
  'create.dl.a0': { en: 'PDF, print shop (A0, single sheet)', tr: 'PDF, matbaa (A0, tek sayfa)' },
  'create.dl.svg': { en: 'SVG, vector', tr: 'SVG, vektör' },
  'create.dl.dxf': { en: 'DXF, CAD / cutter', tr: 'DXF, CAD / kesim' },
  // The flat is a DIFFERENT drawing from the pattern and the label has to say so,
  // or a shopper downloads it expecting pieces and finds a picture of a dress.
  'create.dl.flat': { en: 'SVG, technical flat (front + back)', tr: 'SVG, teknik çizim (ön + arka)' },
  // Named refusal, not a silent redraw: the flat pen stamps the operator it does
  // not have, and the shopper is told before the file is on their disk.
  'create.dl.flatgap': {
    en: 'The flat is drawn, but the engine cannot yet cut: {what}',
    tr: 'Teknik çizim çizildi, ama motorun henüz kesemediği var: {what}',
  },
  // ⭐ H2 — THE AXES THE SURFACE LINE REFUSED, ON SCREEN.
  // The engine now receives the whole spec and answers with the axes it could
  // not put on a dial. A refusal the shopper cannot read is not a refusal, so
  // the list is printed by name, with the value that was asked for.
  'create.dl.flataxes': {
    en: 'The flat is drawn from the seam plan; these axes did not reach it: {what}',
    tr: 'Teknik çizim dikiş planından çizildi; şu eksenler ona ulaşmadı: {what}',
  },
  // F10-vitrin (hakem borcu c): the sewing guide the shopper takes home, wired
  // to the result screen instead of sitting pure in web/lib. The refusal is
  // named: no catalog fabric, no needle table, no invented numbers.
  'create.dl.rehber': { en: 'HTML, sewing guide (Turkish)', tr: 'HTML, dikiş rehberi (Türkçe)' },
  'create.dl.rehberfabric': {
    en: 'pick a catalog fabric above first — without one the guide refuses to invent needle and stitch settings',
    tr: 'önce yukarıdan katalog kumaşı seç — kumaşsız rehber iğne ve dikiş ayarı uydurmayı reddeder',
  },
  // ⭐ OPERATÖR PROGRAMI (GECE7 / F5-D). Bir RET burada bir hata mesajı DEĞİL,
  // motorun ölçülmüş cevabıdır: sevk edilen gövde bir konidir ve op.suppress onu
  // reddeder. Cümle bunu bir kusur gibi değil, bir cevap gibi söyler.
  // EDIT SATIRI (GECE7 / F7). Soru formundaki her baslik "?" ile biter.
  'create.edit.lengthen': { en: 'Lengthen by (cm)', tr: 'Su kadar uzat (cm)' },
  // F7-edit: uc mm alani daha, ayni satirda. Kisaltma uzatmanin negatifi
  // DEGILDIR (motor ikisini ayri operator olarak soyler), o yuzden ayri alan.
  'create.edit.shorten': { en: 'Shorten by (cm)', tr: 'Su kadar kisalt (cm)' },
  'create.edit.sleeve': { en: 'Lengthen the sleeve by (cm)', tr: 'Kolu su kadar uzat (cm)' },
  'create.edit.neck': { en: 'Deepen the neckline by (cm)', tr: 'Yakayi su kadar derinlestir (cm)' },
  'create.edit.bow': { en: 'Add a bow', tr: 'Fiyonk ekle' },
  'create.edit.apply': { en: 'Apply the edit and redraw', tr: 'Editi uygula, yeniden ciz' },
  'create.edit.badnum': { en: 'An edit takes a number of centimetres, 0 or more.',
                          tr: 'Edit 0 ya da daha buyuk bir santimetre sayisi ister.' },
  'create.edit.nothing': { en: 'Nothing to edit — give at least one field a value.',
                           tr: 'Degisecek bir sey yok — en az bir alana deger girin.' },
  // BOLGE KAPISI (contract/edit-locality-v1.json): bolge disi panel bayt-ayni
  // degilse edit REDDEDILIR ve kalip degismez — sessiz bozulma yok.
  // "byte-identical" landing_truth_check L2'nin duran-iddia listesinde; kullanıcı
  // cümlesi aynı hükmü yasaklı kalıba girmeden söylüyor (F10-vitrin).
  'create.edit.locality': { en: 'Zone check: {n} out-of-zone panels did not move by a single byte.',
                            tr: 'Bolge kontrolu: bolge disi {n} panel tek bayt oynamadi.' },
  'create.edit.localityfail': {
    en: 'REFUSED: the edit leaked outside its declared zone — {list}. The pattern was not changed.',
    tr: 'REDDEDILDI: edit ilan ettigi bolgenin disina tasti — {list}. Kalip degistirilmedi.',
  },
  'create.edit.head': { en: 'What actually moved:', tr: 'Ne oynadi:' },
  'create.edit.length': { en: 'Piece length {once} mm -> {sonra} mm',
                          tr: 'Parca boyu {once} mm -> {sonra} mm' },
  'create.edit.pieces': { en: 'Pieces to cut {once} -> {sonra}',
                          tr: 'Kesilecek parca {once} -> {sonra}' },
  'create.edit.yardage': { en: 'Fabric {once} m -> {sonra} m',
                           tr: 'Kumas {once} m -> {sonra} m' },
  'create.ops.run': { en: 'What can the operators do to this pattern?',
                      tr: 'Operatörler bu kalıba ne yapabilir?' },
  'create.ops.head': { en: 'The engine answered, panel by panel:',
                       tr: 'Motorun cevabı, panel panel:' },
  'create.ops.did': { en: 'DID IT', tr: 'YAPTI' },
  'create.ops.didnt': { en: 'DID NOT — and here is why',
                        tr: 'YAPMADI — sebebi şu' },
  'create.dl.working': { en: 'building…', tr: 'hazırlanıyor…' },
  'create.dl.refused': { en: 'That file could not be built: {why}', tr: 'Bu dosya çıkarılamadı: {why}' },
  'create.grade.title': { en: 'Grade to a size run', tr: 'Beden serisine seril' },
  'create.grade.sub': { en: 'Selling this design? Draft it across a full EU size range in one click, every size from the same engine, true to fit.', tr: 'Bu tasarımı satacak mısın? Tek tıkla EU beden aralığında çiz, her beden aynı motordan, doğru kalıpla.' },
  'create.grade.from': { en: 'from', tr: 'başlangıç' },
  'create.grade.to': { en: 'to', tr: 'bitiş' },
  'create.grade.go': { en: 'Generate size run', tr: 'Beden serisini oluştur' },
  'create.grade.working': { en: 'grading every size…', tr: 'her beden çiziliyor…' },
  'create.grade.done': { en: '{n} sizes drafted, the print dialog has the full run.', tr: '{n} beden çizildi, yazdırma penceresinde tüm seri var.' },
  'create.grade.done.some': { en: '{n} sizes drafted. Refused by name: {names} — the engine reported an issue on each, so they are not in the run.', tr: '{n} beden çizildi. Adıyla reddedilenler: {names} — motor her birine bir sorun bastı, seride yoklar.' },
  'create.grade.refused.detail': { en: '{size}: {issue}', tr: '{size}: {issue}' },
  'create.grade.none': { en: 'This design cannot be sewn at any size in that range, try a narrower range or a simpler spec.', tr: 'Bu tasarım o aralıkta hiçbir bedende dikilemiyor, daha dar bir aralık ya da daha sade bir seçim dene.' },
  'create.grade.error': { en: 'Grading failed. Refresh and try again.', tr: 'Serileme başarısız. Sayfayı yenileyip tekrar dene.' },
  'create.grade.layout.nested': { en: 'Nested (all sizes on one set of sheets)', tr: 'İç içe (tüm bedenler tek sayfa setinde)' },
  'create.grade.layout.per': { en: 'Per size (each size its own sheets)', tr: 'Beden başına (her beden kendi sayfası)' },

  // result labels
  'result.pieces': { en: 'pieces', tr: 'parçalar' },
  'result.piecesv': { en: '{n} · each labeled with its cutting note', tr: '{n} · her biri kesim notuyla etiketli' },
  'result.fabric': { en: 'fabric', tr: 'kumaş' },
  'result.fabricv': { en: '{n} m at 140 cm width', tr: '140 cm ende {n} m' },
  'result.sa': { en: 'seam allowance', tr: 'dikiş payı' },
  'result.sav': { en: '{n} cm, drawn in: cut the outer line, sew the inner', tr: '{n} cm, çizili: dış çizgiden kes, iç çizgiden dik' },
  'result.proportions.measured': { en: 'proportions measured from your photo', tr: 'oranlar fotoğrafından ölçüldü' },
  'result.proportions.standard': { en: 'standard proportions (the photo could not be measured reliably)', tr: 'standart oranlar (fotoğraf güvenilir ölçülemedi)' },
  'result.assembled': { en: 'Your assembled pattern', tr: 'Birleştirilmiş kalıbın' },
  'result.assemblednote': { en: 'This is the whole pattern laid out as it prints, the faint grid is the A4 page edges. At full size it prints across those A4 sheets you tape together; this preview is scaled to fit the screen.', tr: 'Bu, kalıbın basıldığı haliyle birleşik görünümü; silik ızgara A4 sayfa kenarlarıdır. Gerçek boyutta bantlayıp birleştirdiğin A4 sayfalara basılır; bu önizleme ekrana sığacak şekilde ölçeklidir.' },
  'result.guide': { en: 'Sewing guide', tr: 'Dikiş rehberi' },
  'result.guidetrnote': { en: '', tr: 'Bu adımın Türkçesi henüz eklenmedi.' },
  'result.rehber': { en: 'Fabric and technique', tr: 'Kumaş ve teknik' },
  'result.rehbernote': { en: 'Every line below carries the reason it exists: either a number this draft measured, or the document it was read from. A line with neither is not printed.', tr: 'Aşağıdaki her satır var olma sebebini taşıyor: ya bu çizimin ölçtüğü bir sayı, ya okunduğu belge. İkisi de olmayan satır basılmaz.' },
  'result.fabricadvice': { en: 'Fabric advice', tr: 'Kumaş önerisi' },
  'result.photofabric.good': { en: 'The fabric in your photo looks like {name}, a good match for this project. Watch out: {note}', tr: 'Fotoğraftaki kumaş {name} görünüyor, bu proje için uygun. Dikkat: {note}' },
  'result.photofabric.bad': { en: 'The fabric in your photo looks like {name}, it works against this shape ({drape}). Consider one of the suggestions below.', tr: 'Fotoğraftaki kumaş {name} görünüyor, bu forma ters çalışır ({drape}). Aşağıdaki önerilerden birini düşün.' },
  'result.photofabric.unknown': { en: 'The fabric in your photo looks like {name}. No verified guide for it here yet, handle it by its stretch (the knit/woven choice you made) and test on a scrap first.', tr: 'Fotoğraftaki kumaş {name} görünüyor. Bunun için doğrulanmış rehber henüz yok, esnekliğine göre davran (seçtiğin örgü/dokuma ayarı) ve önce artık parçada dene.' },
  // Fabric names/drape terms come from the sourced knowledge base (English);
  // only the connective UI text localises so the sentence reads in Turkish.
  'result.fabric.suggest': { en: '{name}, {drape}, {difficulty} to sew. ', tr: '{name}, {drape}, dikimi {difficulty}. ' },
  'result.fabric.avoid': { en: 'avoid {name} here, ', tr: 'burada {name} kullanma, ' },
  'result.fabric.avoidnote': { en: 'works against this shape ({drape}).', tr: 'bu forma ters çalışır ({drape}).' },
  'result.legend': { en: 'How to read the pieces: OUTER solid line = cutting line (seam allowance included) · inner fine line = sewing line · dashed burgundy = darts and fold lines (they are drawn dashed on purpose) · arrow = grainline, align it with the fabric grain.', tr: 'Parçalar nasıl okunur: DIŞ kalın çizgi = kesim hattı (dikiş payı dahil) · içteki ince çizgi = dikiş hattı · kesikli vişne = pens ve katlama yerleri (bilerek kesiklidir) · ok = boy iplik yönü, kumaşın boyuna hizalanır.' },
  'result.blocked': { en: 'This draft did not pass the safety checks, so it cannot be printed. The most common cause is a measurement typo (a waist larger than the bust, a hip smaller than the waist), please re-check the seven measurements you entered. If they are right, the fault is ours: the combination has been logged in your browser console.', tr: 'Bu çizim güvenlik kontrollerinden geçemedi, o yüzden yazdırılamaz. En sık neden bir ölçü yazım hatası (belin göğüsten büyük, kalçanın belden küçük girilmesi), lütfen yedi ölçünü tekrar kontrol et. Ölçüler doğruysa hata bizde: kombinasyon tarayıcı konsoluna kaydedildi.' },

  // sewing companion (web/js/sewing.js): why this fabric + construction order.
  'sew.whyfabric': { en: 'Why this fabric', tr: 'Neden bu kumaş' },
  'sew.want': { en: 'For this shape, look for {want}.', tr: 'Bu form için {want} ara.' },
  'sew.families': { en: 'families', tr: 'kumaş ailesi' },
  'sew.ask': { en: 'ask for', tr: 'kumaşçıya söyle' },
  'sew.tradeoff': { en: 'trade-off', tr: 'ödünleşim' },
  'sew.order': { en: 'The order it comes together', tr: 'Hangi sırayla birleşir' },
  'sew.orderintro': { en: 'Build flat for as long as you can: every seam is easier to sew and press while the piece is still open. Close it into a tube (side seams, sleeves) only near the end.', tr: 'Olabildiğince düz kur: her dikiş parça açıkken dikmesi ve ütülemesi daha kolaydır. Tüpe dönüştürmeyi (yan dikişler, kollar) en sona bırak.' },
  'sew.morelink': { en: 'Read the full sewing companion →', tr: 'Dikiş rehberinin tamamını oku →' },

  // closet
  'closet.title': { en: 'Closet', tr: 'Dolap' },
  'closet.sub': { en: '{n} saved · stored in this browser only', tr: '{n} kayıtlı · yalnızca bu tarayıcıda' },
  'closet.empty.title': { en: 'No patterns yet.', tr: 'Henüz kalıp yok.' },
  'closet.empty.body': { en: 'Draft your first one, it takes a photo or three taps, and it stays on this device.', tr: 'İlkini çiz, bir fotoğraf ya da üç dokunuş yeter, ve bu cihazda kalır.' },
  'closet.start': { en: 'Start a pattern', tr: 'Kalıba başla' },
  'closet.delete': { en: 'delete', tr: 'sil' },
  'closet.today': { en: 'today', tr: 'bugün' },
  'closet.yesterday': { en: 'yesterday', tr: 'dün' },
  'closet.daysago': { en: '{n}d ago', tr: '{n} gün önce' },
};

export function getLang() {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'tr' || stored === 'en') return stored;
    // No stored choice yet: default to English (Damla, 16 Jul). The EN/TR
    // toggle is always visible for Turkish visitors.
    return 'en';
  } catch { return 'en'; }
}

export function setLang(lang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* private mode */ }
}

// t('key', {n: 3}), TR falls back to English; EN with no entry returns the
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
