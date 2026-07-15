// Plain-language glossary for the sewing terms in the guide + legend, so a
// total beginner (Sam) isn't drowned in jargon. Each term gets a one-line
// explanation in EN + TR; render.js turns the term into a tappable dotted span.
// Keys are lowercase; match case-insensitively, whole word.
export const GLOSSARY = {
  'staystitch': { en: 'a line of stitching just inside the edge that stops a curve (like a neckline) from stretching out of shape while you handle it.', tr: 'kenarın hemen içine atılan, kavisli bir kenarın (yaka gibi) sen çalışırken esneyip bozulmasını önleyen dikiş.' },
  'understitch': { en: 'stitching that catches the seam allowance to the facing so the facing rolls to the inside and never peeks out.', tr: 'dikiş payını pervaza tutturan, pervazın içe kıvrılıp dışarı görünmemesini sağlayan dikiş.' },
  'dart': { en: 'a folded, stitched wedge that takes in fabric to shape it over a curve like the bust or waist.', tr: 'kumaşı göğüs ya da bel gibi bir kavise oturtmak için katlanıp dikilen, içeri alan sivri kırış (pens).' },
  'ease': { en: 'a tiny bit of extra length on one seam edge, gently distributed (not gathered) so a curved piece like a sleeve cap fits smoothly.', tr: 'bir dikiş kenarındaki küçük fazlalık; kol başı gibi kavisli bir parça pürüzsüz otursun diye büzmeden yayılan pay.' },
  'grainline': { en: 'the arrow on each piece — line it up parallel to the fabric’s selvage (the woven edge) so the garment hangs straight.', tr: 'her parçadaki ok — kıyafet düzgün dursun diye kumaşın kenarına (selvedge) paralel hizala (boy iplik).' },
  'facing': { en: 'a shaped piece sewn to a raw edge (like a neckline) then turned inside, giving a clean finished edge with no raw fabric showing.', tr: 'ham bir kenara (yaka gibi) dikilip içe çevrilen şekilli parça; temiz, ham kenarı görünmeyen bir bitiş verir (pervaz).' },
  'armhole': { en: 'the opening the arm goes through; the sleeve is sewn into it.', tr: 'kolun geçtiği açıklık; kol buraya dikilir (kol oyuntusu).' },
  'notch': { en: 'a small mark on a seam edge; match the notches on two pieces so they line up correctly when you sew.', tr: 'dikiş kenarındaki küçük işaret; iki parça doğru hizalansın diye çentikleri eşleştir.' },
  'muslin': { en: 'a quick test version of the garment sewn in cheap fabric first, so you can check the fit before cutting your real fabric.', tr: 'gerçek kumaşını kesmeden önce oturmasını görmek için ucuz kumaştan dikilen hızlı deneme (prova).' },
  'baste': { en: 'long, loose temporary stitches to hold pieces together for a fitting; you pull them out later.', tr: 'parçaları prova için geçici tutan uzun, gevşek dikiş; sonra sökülür (teyel).' },
  'interfacing': { en: 'a stiffening layer fused or sewn inside areas like facings and waistbands to give them body.', tr: 'pervaz ve bel bandı gibi yerlere içten yapıştırılan/dikilen, sertlik veren katman (tela).' },
  'gore': { en: 'a shaped vertical panel of a skirt or bodice; several gores seamed together shape the garment over the body.', tr: 'etek ya da korsajın dikey şekilli panosu; birkaç pano dikilerek kıyafet vücuda oturur.' },
  'selvage': { en: 'the finished, non-fraying woven edge that runs down both long sides of the fabric.', tr: 'kumaşın iki uzun kenarında boyunca uzanan, sökülmeyen bitmiş dokuma kenarı.' },
  // Turkish craft terms used in the translated guide, so a TR beginner gets the
  // same tap-to-learn on the words they actually see.
  'ara dikiş': { en: 'staystitch — a line of stitching just inside a curved edge that stops it stretching while you work.', tr: 'kavisli bir kenarın esnemesini önlemek için kenarın hemen içine atılan dikiş (staystitch).' },
  'iç dikiş': { en: 'understitch — stitching that keeps a facing rolled to the inside so it never peeks out.', tr: 'pervazı içe kıvrık tutan, dışarı görünmesini önleyen dikiş (understitch).' },
  'pens': { en: 'dart — a folded, stitched wedge that shapes fabric over the bust or waist.', tr: 'kumaşı göğüs/bel kavisine oturtan, katlanıp dikilen sivri kırış (dart).' },
  'pervaz': { en: 'facing — a shaped piece turned inside to give a clean finished edge.', tr: 'ham kenara dikilip içe çevrilen, temiz bitiş veren şekilli parça (facing).' },
  'tela': { en: 'interfacing — a stiffening layer inside facings/waistbands to give them body.', tr: 'pervaz/bel bandına sertlik veren içten katman (interfacing).' },
  'biye': { en: 'bias binding — a fabric strip cut on the bias that wraps and finishes a raw edge.', tr: 'ham kenarı sarıp bitiren, verev kesilmiş kumaş şerit (bias binding).' },
  'teyel': { en: 'basting — long, loose temporary stitches for a fitting; pulled out later.', tr: 'prova için parçaları geçici tutan uzun gevşek dikiş; sonra sökülür (baste).' },
  'pano': { en: 'gore/panel — a shaped vertical panel; several seamed together shape the garment.', tr: 'dikey şekilli parça; birkaçı dikilerek kıyafeti vücuda oturtur (gore).' },
  'boy iplik': { en: 'grainline — line the arrow parallel to the fabric’s selvage so it hangs straight.', tr: 'oku kumaşın kenarına paralel hizala, kıyafet düzgün dursun (grainline).' },
  'prova': { en: 'muslin — a cheap test version sewn first to check the fit.', tr: 'oturmayı görmek için ucuz kumaştan dikilen deneme (muslin).' },
};
