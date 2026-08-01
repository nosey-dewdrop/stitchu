// ============================================================================
// REFERANS KALEM — SALT-OKUNUR (Damla emri 2026-07-19). BU ÜRETİM MOTORU DEĞİL.
// Bu prototip Damla'nın flat çizim DİLİNİN cetvelidir ("hedef böyle görünür"):
// dantel biye, fırfır katları, balon kol karakteri, taper mürekkep, drape planı.
// STYLE-PIN'in atası. F2'nin işi bu dili ÜRETİM renderer'ına (engine/tools/
// render-garment-flat.mjs) parametre parametre PORT etmek — styles.json'dan
// okuyarak. TEK HAKİKAT: iki paralel ürün yolu olamaz; bu dosya cetvel, ürün
// değil. Silme, itme, dokunma. Değişiklik SADECE Damla'nın kalem revizyonuyla.
// ============================================================================
// K1 contract (2026-07-19): shared values come from contract/tables.json
// (flat.* namespace — DRAWING units, not millimetres), style records come from
// styles.json (style = a data record, not code). No inline value copies.
import {readFileSync as _rf} from 'node:fs';
import {rectClothGather as _rectGather, SEED_FABRICS as _SEED_FAB} from './cloth-solver.mjs';
var _CT=JSON.parse(_rf(new URL('../../contract/tables.json',import.meta.url),'utf8'));
var _ST=JSON.parse(_rf(new URL('./styles.json',import.meta.url),'utf8'));
// FIGURE_BASE (2026-07-22): figür oran bandı — top bel oyuğu buradan hesaplanır
// (kaynaklı matematik, göz kararı knob değil). Pinli/dress yolları okumaz.
var _FB=JSON.parse(_rf(new URL('../../contract/figure-bands.json',import.meta.url),'utf8'));
var S=_CT.flat.unitPX;
var SIZE=_CT.flat.size;
var LEN=_CT.flat.len;
var SHARED=_ST.shared;
var STYLE=_ST.styles;
var P={};
function defaults(styleKey,keep){var st=STYLE[styleKey],o={style:styleKey};for(var k in SHARED)o[k]=(keep&&k in keep)?keep[k]:SHARED[k];for(var j in st.own)o[j]=st.own[j];if(st.topLength!=null)o.topLength=st.topLength;if(st.sleeveLength!=null)o.sleeveLength=st.sleeveLength;if(st.peplum!=null)o.peplum=st.peplum;if(st.waistTie!=null)o.waistTie=st.waistTie;o.title=st.label;return o;}
function parts(){return STYLE[P.style].parts;}
function rng(seed){var s=seed>>>0;return function(){s=(s+0x6D2B79F5)>>>0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
function seg(p0,c1,c2,p1){return [p0[0],p0[1],c1[0],c1[1],c2[0],c2[1],p1[0],p1[1]];}
function mirror(segs,ax){var m=[],r=function(x){return 2*ax-x;};for(var i=segs.length-1;i>=0;i--){var s=segs[i];m.push([r(s[6]),s[7],r(s[4]),s[5],r(s[2]),s[3],r(s[0]),s[1]]);}return m;}
function enforceC1(g,flatStart){if(flatStart!==false)g[0][3]=g[0][1];g[g.length-1][5]=g[g.length-1][7];return g;}
function toPath(g){var d="M "+g[0][0].toFixed(1)+","+g[0][1].toFixed(1);g.forEach(function(s){d+=" C "+s[2].toFixed(1)+","+s[3].toFixed(1)+" "+s[4].toFixed(1)+","+s[5].toFixed(1)+" "+s[6].toFixed(1)+","+s[7].toFixed(1);});return d+" Z";}
function toOpen(g){var d="M "+g[0][0].toFixed(1)+","+g[0][1].toFixed(1);g.forEach(function(s){d+=" C "+s[2].toFixed(1)+","+s[3].toFixed(1)+" "+s[4].toFixed(1)+","+s[5].toFixed(1)+" "+s[6].toFixed(1)+","+s[7].toFixed(1);});return d;}
function cubic(s,t){var u=1-t,a=u*u*u,b=3*u*u*t,c=3*u*t*t,d=t*t*t;return [a*s[0]+b*s[2]+c*s[4]+d*s[6], a*s[1]+b*s[3]+c*s[5]+d*s[7]];}
// OMUZ OUTLINE Y @ verilen X (KÖK2 tutunma fix 2026-07-23): omuz eğrisi neck point
// (nX,y0)→shoulder tip (stX,stY) cubic'i (buildHalf'teki seg ile AYNI kontrol noktaları);
// bir X için outline'ın gerçek Y'sini döndürür → askı tabanı gövdeye tam oturur (havada kalmaz).
function shoulderYAt(x,k){var nX=k.nX,y0=k.y0,stX=k.stX,stY=k.stY;
  var seg=[nX,y0,nX+(stX-nX)*0.34,y0+(stY-y0)*0.28,nX+(stX-nX)*0.70,y0+(stY-y0)*0.72,stX,stY];
  var bt=0,bd=1e9;for(var t=0;t<=1;t+=0.01){var c=cubic(seg,t);var d=Math.abs(c[0]-x);if(d<bd){bd=d;bt=t;}}
  return cubic(seg,bt)[1];}
function sampleX(segs,y){var best=null;for(var i=0;i<segs.length;i++){var s=segs[i],y0=s[1],y1=s[7];if(Math.min(y0,y1)-0.5<=y&&y<=Math.max(y0,y1)+0.5){var lo=0,hi=1,p;for(var k=0;k<26;k++){var t=(lo+hi)/2;p=cubic(s,t);if((y1>y0)?(p[1]<y):(p[1]>y))lo=t;else hi=t;}if(best===null||p[0]>best)best=p[0];}}return best;}
function smooth(pts){var g=[];for(var i=0;i<pts.length-1;i++){var p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||pts[i+1];g.push(seg(p1,[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6],p2));}return g;}
function taper(pts,maxw,bias){var L=pts.length,a=[],b=[],i;for(i=0;i<L;i++){var t=L>1?i/(L-1):0.5;var q=pts[Math.min(i+1,L-1)],r=pts[Math.max(i-1,0)];var dx=q[0]-r[0],dy=q[1]-r[1],d=Math.hypot(dx,dy)||1;var w=maxw*0.5*Math.pow(Math.sin(Math.PI*Math.min(Math.max(t,0.002),0.998)),bias||0.5);a.push([pts[i][0]-dy/d*w,pts[i][1]+dx/d*w]);b.push([pts[i][0]+dy/d*w,pts[i][1]-dx/d*w]);}var s="M "+a[0][0].toFixed(1)+","+a[0][1].toFixed(1);for(i=1;i<L;i++)s+=" L "+a[i][0].toFixed(1)+","+a[i][1].toFixed(1);for(i=L-1;i>=0;i--)s+=" L "+b[i][0].toFixed(1)+","+b[i][1].toFixed(1);return s+" Z";}
function samplePts(p0,c1,c2,p1,n){var s=[p0[0],p0[1],c1[0],c1[1],c2[0],c2[1],p1[0],p1[1]],out=[];for(var i=0;i<=n;i++)out.push(cubic(s,i/n));return out;}
// BÜZGÜ TİK İNK (KÖK3 güzellik turu 2026-07-23): fizik-çözülmüş fold'u "püskül" (band boyu
// uzun ince saç-teli) yerine EMSAL diline basar — KISA (band'in %25-42'si), düzensiz boy
// (fold indeksine göre), KALIN uç (dikişe yakın taban geniş → ucu inceltmeden). Fizik fold
// VERİSİ (kat konumu/dağılımı) DEĞİŞMEZ — sadece fold'un band-üst diliminden kısa tik çizilir,
// ikinci kıvrım yolu YOK. Damla: emsalde büzgü kısa, uçları kalın, düzensiz-aralıklı tik.
function gatherTick(foldPts,idx){
  if(foldPts.length<3) return taper(foldPts,1.1,0.4);
  // düzensiz kısa boy: band diliminin %25-42'si (idx faz farkıyla dalgalanır, seed'siz determinist)
  var frac=0.25+0.17*(0.5+0.5*Math.sin(idx*1.7+0.6));
  var n=Math.max(2,Math.round((foldPts.length-1)*frac));
  var slice=foldPts.slice(0,n+1);
  // KALIN uç: taban geniş, uç sivrilmeden (bias 0.85 → sin eğrisi tepede daha düz = kalın uç).
  // Hakem PASS bu değerde (2026-07-23); bias 1.5 denendi ama belirgin kazanç yok → 0.85 korundu.
  // Uç-dolgunluğu nüansı v1.1 kozmetik adayı (hakem notu, shipping bloklamaz).
  return taper(slice,1.35,0.85);
}
function polyFromSegs(segs,n){var out=[];segs.forEach(function(sg,i){for(var j=(i?1:0);j<=n;j++)out.push(cubic(sg,j/n));});return out;}
function laceBand(poly,w,sc){var inner=[],outer=[],i;for(i=0;i<poly.length;i++){var q=poly[Math.min(i+1,poly.length-1)],r=poly[Math.max(i-1,0)];var dx=q[0]-r[0],dy=q[1]-r[1],d=Math.hypot(dx,dy)||1;var nx=-dy/d,ny=dx/d;if(ny<0){nx=-nx;ny=-ny;}var t=i/(poly.length-1);var amp=w*(0.60+0.40*Math.abs(Math.sin(t*Math.PI*sc)));inner.push(poly[i]);outer.push([poly[i][0]+nx*amp,poly[i][1]+ny*amp]);}var d1="M "+inner[0][0].toFixed(1)+","+inner[0][1].toFixed(1);for(i=1;i<inner.length;i++)d1+=" L "+inner[i][0].toFixed(1)+","+inner[i][1].toFixed(1);for(i=outer.length-1;i>=0;i--)d1+=" L "+outer[i][0].toFixed(1)+","+outer[i][1].toFixed(1);d1+=" Z";var d2="M "+inner[0][0].toFixed(1)+","+inner[0][1].toFixed(1);for(i=1;i<inner.length;i++){var q2=outer[i],p2=inner[i];d2+=" L "+(p2[0]+(q2[0]-p2[0])*0.30).toFixed(1)+","+(p2[1]+(q2[1]-p2[1])*0.30).toFixed(1);}return {band:d1,head:d2};}
function drapePlan(p,rnd){var n=(p.ink==='minimal')?2:(p.ink==='orta')?3:Math.max(2,Math.round(p.foldCount/2));var R=[],CORE=0.20;for(var i=0;i<n;i++){var prim=(i%2===0),base=(i+0.65)/(n+0.25);var u=Math.min(0.96,Math.max(0.04,base+(rnd()-0.5)*0.8/n));R.push({u:CORE+(1-CORE)*u,prim:prim,swing:prim?0.55+rnd()*0.45:0.15+rnd()*0.30,birth:prim?rnd()*0.05:(0.14+rnd()*0.30)*p.drape,die:prim?1:0.40+rnd()*0.35,sag:0.55+rnd()*0.75,sway:(rnd()-0.5)*0.45});}R.sort(function(a,b){return a.u-b.u;});R[R.length-1].prim=true;R[0].prim=false;if(p.ink==='minimal')R.forEach(function(r){r.prim=true;});return R;}
function hemPoints(p,k,R){function baseY(u){return k.yHem+k.dip*(1-Math.pow(u,1.7));}var W=p.hemWave*3.2,pts=[[k.hX,k.yHem]];var prim=R.filter(function(r){return r.prim;});for(var j=prim.length-1;j>=0;j--){var r=prim[j],outer=(j===prim.length-1)?1:prim[j+1].u,mid=(r.u+outer)/2;pts.push([k.cx+(k.hX-k.cx)*mid,baseY(mid)+W*r.sag]);var x=k.cx+(k.hX-k.cx)*r.u,y=baseY(r.u)-W*(0.45+r.swing*0.75);r.hem=[x,y];pts.push([x,y]);pts.push([x,y]);}var i0=prim[0].u*0.45;pts.push([k.cx+(k.hX-k.cx)*i0,baseY(i0)+W*0.55]);pts.push([k.cx,baseY(0)]);return pts;}
function buildHalf(p,cx,isBack,rnd){var sz=SIZE[p.size],st=STYLE[p.style];var y0=46,k={cx:cx,y0:y0},g=[];var eX=cx+sz.emp*(1-p.waistNip)*S;
// GÖĞÜS GENİŞLİĞİ (2026-08-01, Damla: "göğüs daha dar olacak, sarkık memeleri
// reddettim"). Eskiden bustX koltukaltından %3.5 DIŞARIDAYDI (1+0.07*0.5), yani
// yan hat oyuğun altında balon yapıyordu — sarkık okunmasının yarısı bu. Artık
// varsayılanda koltukaltıyla aynı hizada (0.975+0.05*0.5 = 1.000), kadran hâlâ
// çalışıyor ama dışa taşma ancak bilinçli olarak açılıyor.
var bustX=cx+sz.bust*(0.975+0.05*p.bustProject)*S;
// TOP bust-width (2026-07-20 tur1c — hakem: en geniş nokta underarm ALTINDA, yan
// dikişte bust dışa balon yapıyordu). Root wasn't the armhole; it was bustX
// (86.8px) bulging past the sleeveless underarm (69.1px), read most on boat+
// princess. A sleeveless top's side seam runs close: keep bust at/inside the
// underarm so shoulder stays the widest point. Guarded on garment==='top'.
// ASKI AILESI (2026-07-22): band-top'ta (cami/bandeau) omuz YOK — bust en geniş
// kalmalı; shp-daraltma sadece OMUZ gövdeli top'a (tur1c kuralı omuz-en-geniş).
if(st.garment==='top'&&st.top!=='band')bustX=cx+sz.shp*0.99*S;
// BOXY top (2026-07-21 gece — id82/65 boxy oversized): yan dikiş DÜZ iner, bel
// çekmesi yok, en geniş nokta omuz=bust=hip. eX (bel) bust hizasına açılır →
// kutu siluet. Guarded on st.boxy → sadece boxy stiller; diğer top'lar figürlü.
// FIGURE_BASE İSTİSNASI (2026-07-22): boxy KASITLI kutu — figürel bel çekmesi
// boxy'ye UYGULANMAZ; mandal boxy'nin borusunu da korur (yanlış figürelleşme=FAIL).
if(st.boxy){eX=bustX;}
// FIGURE_BASE (2026-07-22, figür denetimi bulgusu): boxy-olmayan TOP'larda bel
// oyuğu YOKTU (waist/bust ölçülen 0.98 = BORU; bel 71.3px bust 67.6px'ten bile
// genişti). Bel artık contract/figure-bands.json bandından HESAPLANIR (göz kararı
// knob değil): iskelet oranı = band ortası − 0.09 (çizim eğrisi yumuşatması
// iskeleti ölçümde ~+0.09 kaldırır, figur-denetimi dress kalibrasyonu 0.635→0.726).
// Omuz-en-geniş kuralı (tur1c hakem) KORUNUR: bust=shp*0.99 dokunulmadı, sadece
// bel banda çekildi. Dress/pinli stiller bu bloğa girmez → byte-identical.
if(st.garment==='top'&&!st.boxy){
  var _wb=(_FB.ratios.waist_bust.band[0]+_FB.ratios.waist_bust.band[1])/2;   // 0.78 band ortası (EU36)
  eX=cx+(bustX-cx)*_wb;   // bel landmark'ta ölçüm iskeleti direkt okur → düzeltme yok
}
var nip=Math.max(0.05,0.34-0.9*p.waistNip);if(st.top==='band'){var yTop=y0+p.strapLen*S,yEmp=yTop+p.yokeDrop*S;var yB=yTop+(yEmp-yTop)*p.bustHeight;
// FITTED BAND (2026-07-26 taklit döngüsü, golden flat-01 bindirme bulgusu): band gövde
// üst kenarı bust genişliğindeydi + yanlar düz = KUTU okunuyor. Gerçek straplez korsaj:
// üst kenar DAR (~bust*0.72), bust bombesi ılımlı (~0.88), bele oturur. SADECE
// st.fittedBand taşıyan stiller; mevcut bandeau/cami topları (0.95) byte-identical.
if(st.fittedBand)bustX=cx+sz.bust*0.88*S;
var topX=cx+sz.bust*((st.fittedBand?0.72:0.95)-0.03*p.bustProject)*S;k.yTop=yTop;k.panelTop=yTop;k.yEmp=yEmp;k.bX=topX;k.bustX=bustX;k.strapX=cx+sz.strap*S;g.push(seg([cx,yTop],[cx+(topX-cx)*0.34,yTop+2.5],[topX-(topX-cx)*0.20,yTop-1.0],[topX,yTop]));g.push(seg([topX,yTop],[topX+(bustX-topX)*0.60,yTop+(yB-yTop)*0.28],[bustX,yB-(yB-yTop)*0.42],[bustX,yB]));g.push(seg([bustX,yB],[bustX,yB+(yEmp-yB)*0.42],[eX+(bustX-eX)*nip,yEmp-(yEmp-yB)*0.16],[eX,yEmp]));}else{var stX=cx+sz.shp*S,stY=y0+p.shoulderSlope*S;var ny=y0+(isBack?p.neckDepthBack:p.neckDepth)*S;var nX=Math.min(cx+sz.neck*p.neckWidth*S,stX-0.22*(stX-cx));var uaX=cx+sz.bust*S,uaY=y0+sz.ad*S;
// TOP armhole tightening (2026-07-20 tur1 — hakem tur1b: underarm silüetin en
// geniş noktasıydı = koltuk-altı balon). Bir kolsuz top'ta EN GENİŞ nokta OMUZ
// ucudur; underarm onun İÇİNDE kalır, silüet omuzdan bele düz-içe akar. bust
// genişliği (86.8px) omuz ucundan (70.6px) genişti → underarm'ı omuz ucunun
// hemen içine (shp*0.98) çek, balonu öldür. Guarded on garment==='top' → kollu
// pinli stiller (underarm=bust, kol soketi geniş olmalı) byte-identical kalır.
if(st.garment==='top'){uaX=cx+sz.shp*0.98*S;uaY=y0+sz.ad*0.88*S;}
var yEmp2=uaY+p.yokeDrop*S;k.ny=ny;k.nX=nX;k.stX=stX;k.stY=stY;k.uaX=uaX;k.uaY=uaY;k.panelTop=y0+sz.ad*0.42*S;k.yEmp=yEmp2;k.bX=bustX;k.bustX=bustX;
// GÖĞÜS APEX Y — SHOULDER-relative (KÖK1 güzellik turu 2026-07-23, template piksel-kalibre).
// ESKİ apex = uaY+(yEmp-uaY)*bustHeight → apex torso'nun %73'ünde (bel çizgisine çok yakın) =
// Damla teşhisi "göğüs sarkık/bele-yakın/aşağıda". Zoe Hong template: apex omuz→bel torso'nun
// %44'ünde (apex_dusus_torso_frac=0.441, contract/figure-bands.json). k.apexY iç-işaret çizgileri
// (princess/surplice/sweetheart seam) için; büst-bel mesafesini açar → sarkıklık gider. Yan-hat
// bombe (side seam) uaY-relative KALIR (bombe underarm altında = fizik; yukarı çekmek zigzag yapar).
k.apexY=stY+(yEmp2-stY)*0.441;if(st.neckline==='square'){
  // SQUARE neckline (2026-07-22 — gerçek square: DÜZ taban + iki DİK kenar,
  // yuvarlatma YOK. neck point (nX,y0)'dan omuza; CF'de (cx,ny) düz taban; köşe
  // (nX,ny) keskin. İki segment: taban (cx,ny→nX,ny) + dik kenar (nX,ny→nX,y0).
  // roundNeck yuvarlak U çiziyordu; square onun ANTİTEZİ. crew ikamesi YASAK.
  g.push(seg([cx,ny],[cx+(nX-cx)*0.5,ny],[nX,ny],[nX,ny]));      // düz taban CF→köşe
  g.push(seg([nX,ny],[nX,ny-(ny-y0)*0.5],[nX,y0],[nX,y0]));      // dik kenar köşe→omuz
  k.nSeg=2;k.pointed=false;k.squareCorner=[nX,ny];
}else if(st.neckline==='sweetheart'&&!isBack){
  // SWEETHEART yaka (2026-08-01 Damla cerrahi izni: "kalp böyle değil" — eski hal
  // köşeli çentik okunuyordu: merkez ile lob dibi arası 9px, enforceC1 CF tanjantını
  // yatay zorluyordu → W-zigzag). Gerçek kalp: iki YUMUŞAK KAVİSLİ lob ortada küçük
  // V'de buluşur. CF noktası lob dibinden belirgin yukarıda; lob dibinde yatay tanjant
  // (iki segment C1); askı/omuz kenarına yumuşak yükseliş. k.pointed=true → enforceC1
  // CF tanjantına dokunmaz, ayna V'yi korur (v-yaka dalıyla aynı mekanizma).
  // Motor Neckline::Sweetheart zaten çiziyor (bodice.cpp); flat kalp dilini kurar.
  // Arka: st.roundNeck ile normal scoop kavisi (kalp sadece önde).
  // İKİNCİ TUR (2026-08-01, Damla: "kalp W gibi duruyor" — ilk tur yetmedi, ölçtüm):
  // W'nin sebebi merkezdi. CF çentiği yaka derinliğinin %34'ü kadar YÜKSEK ve sivriydi,
  // loblar da sığ kalınca siluet /\_/\ okunuyor. Gerçek kalpte merkez KÜÇÜK bir
  // çentiktir, hacim LOBLARDADIR. Çentik %14'e indi, lob dışa açıldı (0.52 → 0.62),
  // ve lob dibi iki yandan yatay tanjantla kuşatıldı → yuvarlak kupa, sivri uç değil.
  var _swVY=ny-(ny-y0)*0.14;                            // CF çentiği: sığ
  var _swCupX=cx+(nX-cx)*0.62,_swCupY=ny;               // lob dibi: dışa açık
  g.push(seg([cx,_swVY],[cx+(_swCupX-cx)*0.20,_swVY+(_swCupY-_swVY)*0.90],[_swCupX-(_swCupX-cx)*0.55,_swCupY],[_swCupX,_swCupY])); // çentikten hızla in, dipte yatay
  g.push(seg([_swCupX,_swCupY],[_swCupX+(nX-_swCupX)*0.58,_swCupY],[nX-(nX-cx)*0.03,y0+(ny-y0)*0.46],[nX,y0])); // dipten yatay çık, omza yumuşak yüksel
  k.nSeg=2;k.pointed=true;
}else if(st.neckline==='v'&&!isBack){var mid=[cx+(nX-cx)*0.54,ny-(ny-y0)*0.56];g.push(seg([cx,ny],[cx+(nX-cx)*0.15,ny-(ny-y0)*0.13],[cx+(nX-cx)*0.37,ny-(ny-y0)*0.37],mid));g.push(seg(mid,[cx+(nX-cx)*0.72,ny-(ny-y0)*0.76],[nX-(nX-cx)*0.05,y0+(ny-y0)*0.14],[nX,y0]));k.nSeg=2;k.pointed=true;}else if(st.garment==='top'||st.roundNeck){
  // TOP round neckline (2026-07-20 tur1 fix — hakem: crew/scoop front V'ye kaçıyordu).
  // A true crew/scoop is a wide U: flat-bottomed at CF (horizontal tangent held
  // LONGER), then a fast rise near the neck point. The old else-curve lifted its
  // second control point too early (0.55 of the depth), reading as a V. Here the
  // bottom control stays low and wide, so the eye reads round. Guarded on
  // garment==='top' so every pinned (non-top) style keeps its exact old curve.
  g.push(seg([cx,ny],[cx+(nX-cx)*0.55,ny],[nX-(nX-cx)*0.04,ny-(ny-y0)*0.18],[nX,y0]));k.nSeg=1;k.pointed=false;
}else{g.push(seg([cx,ny],[cx+(nX-cx)*0.38,ny],[nX-(nX-cx)*0.12,ny-(ny-y0)*0.55],[nX,y0]));k.nSeg=1;k.pointed=false;}g.push(seg([nX,y0],[nX+(stX-nX)*0.34,y0+(stY-y0)*0.28],[nX+(stX-nX)*0.70,y0+(stY-y0)*0.72],[stX,stY]));var H=p.armholeHollow;var a1=[stX+(uaX-stX)*H,stY+(uaY-stY)*0.36];var a2=[stX+(uaX-stX)*0.50,stY+(uaY-stY)*0.74];g.push(seg([stX,stY],[stX+(uaX-stX)*H*0.7,stY+(uaY-stY)*0.13],[stX+(uaX-stX)*H,stY+(uaY-stY)*0.24],a1));g.push(seg(a1,[a1[0]+(a2[0]-a1[0])*0.42,a1[1]+(a2[1]-a1[1])*0.48],[a1[0]+(a2[0]-a1[0])*0.66,a1[1]+(a2[1]-a1[1])*0.74],a2));g.push(seg(a2,[a2[0]+(uaX-a2[0])*0.46,a2[1]+(uaY-a2[1])*0.68],[uaX-(uaX-a2[0])*0.52,uaY],[uaX,uaY]));// YAN-HAT BÜST-BEL TAPER: KÖK1 iter2 GERİ ALINDI (2026-07-23). Yan-hat bombe zaten
// minimal (~3px) → taper yumuşatma id53/id24'te GÖRÜNMEDİ (kazanç yok, prompt "puan
// yükselmeli" kuralı). id13/id101 iyileşmesini iter1 apex-fix zaten yaptı. ESKİ taper
// korundu (byte-identical). id53/id24 gerçek göğüs sorunu ayrı yerde (id53 empire seam
// konumu, id24 büzgü/etek KÖK3/4) → dürüst not, bu KÖK'te çözülmedi.
// GÖĞÜS YÜKSEKLİĞİ (2026-08-01, Damla: "daha yukarıda olacak"). Yan-hat bombesi
// koltukaltı ile bel arasının %30'undaydı; bel çizgisine yakın bombe = sarkık.
// 0.58 çarpanı bombeyi koltukaltının hemen altına çeker (%17), kadran korunur.
var yB2=uaY+(yEmp2-uaY)*p.bustHeight*0.58;g.push(seg([uaX,uaY],[uaX+(bustX-uaX)*0.85,uaY+(yB2-uaY)*0.22],[bustX,yB2-(yB2-uaY)*0.55],[bustX,yB2]));g.push(seg([bustX,yB2],[bustX,yB2+(yEmp2-yB2)*0.44],[eX+(bustX-eX)*nip,yEmp2-(yEmp2-yB2)*0.16],[eX,yEmp2]));}k.eX=eX;
// TOP branch (2026-07-20, master directive item 8 — top family, 46 targets).
// A top is ONE figured body that skims from the waist to a hip/crop hem: no
// separate skirt panel, no waist seam gape, no drape folds. Guarded on
// st.garment==='top' so every existing (pinned) style — none of which carries a
// garment field — takes the untouched dress path and stays byte-identical.
if(st.garment==='top'){
  // hem length from topLength (cropped ~ at waist, hip ~ below, tunic ~ lower);
  // the body keeps a soft waist nip then eases back out to a near-straight hip.
  var _tl={cropped:5,hip:16,tunic:30}[p.topLength||'hip'];
  k.yHem=k.yEmp+_tl*S;k.dip=(p.hemDip*0.35)*S;
  // hip barely fuller than the waist — a top hangs close, never flares.
  // FIGURE_BASE (2026-07-22): hem = BEL LANDMARK + oranlı ease (serbest Y/X yasak).
  // Eski hali emp*((1-waistNip)+0.06) bel'den BAĞIMSIZ hesaplanıyordu → yeni bel
  // oyuğuyla çelişip hem'i bust dışına taşırırdı. Şimdi bel(eX)'ten bust'a doğru
  // high-hip ease: cropped bele yakın biter, hip boyu daha dolgun. Boxy: kutu (eX).
  k.hX=st.boxy?eX:eX+(bustX-eX)*((p.topLength||'hip')==='cropped'?0.15:0.38);
  var Rt=[];k.hemPts=[[k.hX,k.yHem],[cx,k.yHem+k.dip*0.4]];
  // side seam: waist -> hip, gentle ease-out (no skirt sweep).
  g.push(seg([eX,k.yEmp],[eX+(k.hX-eX)*0.5,k.yEmp+(k.yHem-k.yEmp)*0.4],[k.hX,k.yHem-(k.yHem-k.yEmp)*0.35],[k.hX,k.yHem]));
  // straight hem across to centre front (slight dip only).
  g.push(seg([k.hX,k.yHem],[cx+(k.hX-cx)*0.6,k.yHem+k.dip*0.3],[cx+(k.hX-cx)*0.3,k.yHem+k.dip*0.45],[cx,k.yHem+k.dip*0.4]));
  return {g:g,folds:Rt,k:k};
}
k.yHem=k.yEmp+LEN[p.length]*S;k.dip=p.hemDip*S;k.hX=cx+sz.emp*((1-p.waistNip)+(p.skirtFull-1))*S;var R=drapePlan(p,rnd);k.hemPts=hemPoints(p,k,R);
// ETEK YAN-HAT S-KAVİS (KÖK4 güzellik turu 2026-07-23): ESKİ c2=0.18/0.30 → yan kenar
// belden hem'e düz-diagonal ("koni gibi, flow yok" — Damla). YENİ: belde hafif içbükey
// (üst korunur), kalçada döner, hem'e DIŞBÜKEY açılır = S karakteri (alt dışbükey 3.2→9.6px).
// c1 0.05→0.02 (üst içbükey belirgin), c2 x 0.18→0.05 + y 0.30→0.42 (hem'e flare dönüşü).
// PIN KORUMASI: pinli babydoll/lace ESKİ kavis (byte-identical).
var _pinSkirt=(p.style==='drawstring_babydoll'||p.style==='lace_vneck_70s');
if(_pinSkirt)g.push(seg([eX,k.yEmp],[eX+(k.hX-eX)*0.05,k.yEmp+(k.yHem-k.yEmp)*0.26],[k.hX-(k.hX-eX)*0.18,k.yHem-(k.yHem-k.yEmp)*0.30],[k.hX,k.yHem]));
else{
// ETEK DOLGUNLUK (2026-07-27 taklit döngüsü, 3 referans bindirmesinde ortak duvar):
// referans eteklerde yan hat dışa BOMBELİ dolgun düşer, bizimki koni-düz iniyordu.
// p.skirtCurve 0..1: 0 = eski kavis BİREBİR (skirtCurve taşımayan her stil
// byte-identical), 1 = tam dolgun (c1 dışarı, c2 hem'e yakın + hX ötesine bombe).
var _sq=p.skirtCurve||0;
g.push(seg([eX,k.yEmp],[eX+(k.hX-eX)*(0.02+0.30*_sq),k.yEmp+(k.yHem-k.yEmp)*0.26],[k.hX-(k.hX-eX)*(0.05-0.14*_sq),k.yHem-(k.yHem-k.yEmp)*(0.42-0.22*_sq)],[k.hX,k.yHem]));}
smooth(k.hemPts).forEach(function(s){g.push(s);});return {g:g,folds:R,k:k};}
/* fırfırlı askı (Damla kalem revizyonu 2026-07-19: straps:true stilleri için
   strapShape geri getirildi; repo K2-minify sırasında budanmıştı, çizim veriyle
   tutmuyordu — MIHENK-04 "askısı var ama"). Senin ilk prototip HTML'inden birebir. */
function strapShape(p,k,rnd){
  var w=p.strapWidth*S*0.5,amp=p.ruffle*S*0.42;
  var aX=k.cx+(k.bX-k.cx)*0.55+p.strapWidth*S*0.5,aY=k.yTop+2;
  var bX=k.strapX,bY=k.y0;
  var m=9,L=[],R=[],lumps=[];
  for(var i=0;i<=m;i++){
    var t=i/m;
    var x=aX+(bX-aX)*t-(Math.sin(Math.PI*t)*4),y=aY+(bY-aY)*t;
    var dx=(bX-aX)-Math.PI*Math.cos(Math.PI*t)*4,dy=(bY-aY),d=Math.hypot(dx,dy);
    var nx=-dy/d,ny=dx/d,ph=i*1.05;
    var wl=w+amp*(0.5+0.5*Math.sin(ph))*(0.55+rnd()*0.75);
    var wr=w+amp*(0.5+0.5*Math.sin(ph+Math.PI))*(0.55+rnd()*0.75);
    L.push([x+nx*wl,y+ny*wl]);R.push([x-nx*wr,y-ny*wr]);
    lumps.push({x:x,y:y,nx:nx,ny:ny,wl:wl,wr:wr,side:Math.sin(ph)>0?1:-1});
  }
  var outline=smooth(L)
    .concat([seg(L[m],[L[m][0],L[m][1]],[R[m][0],R[m][1]],R[m])])
    .concat(smooth(R.slice().reverse()))
    .concat([seg(R[0],[R[0][0],R[0][1]],[L[0][0],L[0][1]],L[0])]);
  return {outline:outline,lumps:lumps};
}
function puffSleeve(p,k){var capTop=k.stY-p.capPuff*S;var outX=k.stX+p.sleeveWidth*S;var hemY=k.stY+p.sleeveLen*S;var shoulderY=k.stY+(hemY-k.stY)*0.34;var g=[];g.push(seg([k.stX,k.stY],[k.stX+(outX-k.stX)*0.18,capTop-3],[outX,shoulderY-(shoulderY-capTop)*0.52],[outX,shoulderY]));g.push(seg([outX,shoulderY],[outX,shoulderY+(hemY-shoulderY)*0.44],[outX-1,hemY-7],[outX-5,hemY]));g.push(seg([outX-5,hemY],[k.uaX+22,hemY+5],[k.uaX+14,hemY+3],[k.uaX+9,hemY-3]));g.push(seg([k.uaX+9,hemY-3],[k.uaX+4,hemY-22],[k.uaX+1,k.uaY+14],[k.uaX,k.uaY]));return {g:g,capTop:capTop,outX:outX,hemY:hemY,shoulderY:shoulderY};}
// PLAIN set-in sleeve (2026-07-21 gece — 9 hedef straight/plain kol ister; puf
// DEĞİL). Omuz ucundan hafif eğimli düz aşağı iner, bilekte hafif daralır:
// dikdörtgen-ish set-in kol. Ayrı fonksiyon → puffSleeve (pinli princess/wrap)
// byte-identical. capTop=stY (cap yükseltme yok), düz kenarlar.
// KOL KAPAĞI = GÖVDENİN OYUĞU (2026-08-01, Damla: "kol çirkin").
// Kol konturu koltukaltından omuz ucuna DÜZ kapanıyordu (toPath'in Z'si), oysa
// gövdenin oyuğu orada kavisli. İki çizgi çakışmayınca koltukaltında küçük bir
// kanca/ok görünüyordu — ekrandaki artık buydu. Bu yardımcı buildHalf'in oyuk
// eğrisinin AYNISINI ters yönde döndürür, kol oyuğa birebir oturur.
function armholeBack(p,k){
  var H=p.armholeHollow,sX=k.stX,sY=k.stY,uX=k.uaX,uY=k.uaY;
  var a1=[sX+(uX-sX)*H,sY+(uY-sY)*0.36],a2=[sX+(uX-sX)*0.50,sY+(uY-sY)*0.74];
  return [seg([uX,uY],[uX-(uX-a2[0])*0.52,uY],[a2[0]+(uX-a2[0])*0.46,a2[1]+(uY-a2[1])*0.68],a2),
          seg(a2,[a1[0]+(a2[0]-a1[0])*0.66,a1[1]+(a2[1]-a1[1])*0.74],[a1[0]+(a2[0]-a1[0])*0.42,a1[1]+(a2[1]-a1[1])*0.48],a1),
          seg(a1,[sX+(uX-sX)*H,sY+(uY-sY)*0.24],[sX+(uX-sX)*H*0.7,sY+(uY-sY)*0.13],[sX,sY])];
}
function plainSleeve(p,k){
  // sleeveLength → boy (2026-07-21 FAZ1 kıyas: emsal kısa≈korsaj 1/4, uzun≈3/4).
  // CAP (2026-07-22 id47): omzu KAPLAYAN çok kısa kol — dış kenar omuzdan AŞAĞI
  // eğimli çıkar (yataydan flutter/kanat okunuyordu, MIHENK dersi), boy kısa.
  var _cap=p.sleeveLength==='cap';
  var _slen={cap:9,short:17,elbow:28,long:42}[p.sleeveLength||'short'];
  var outX=k.stX+p.sleeveWidth*S;var hemY=k.stY+_slen*S;
  var wristX=k.stX+p.sleeveWidth*S*0.70; // bilek omuz genişliğinin %70'i (hafif konik)
  // FITTED elbow/long (2026-08-01 Damla cerrahi izni: "kol uzayınca bu kadar çirkin
  // olmamalı"). Eski yol dış kenarı wristX'e (omuz ekseninde) İÇE süpürüyordu →
  // dirsek/uzun kol gövdeye paralel 5-15px'lik cılız eğri şerit çiziyordu. Ticari
  // flat dili: kol omuzdan bileğe gövdeye ~12-13° açıyla iner, bisep→ağız düzgün
  // konik, ağızda eksene DİK temiz kapanış. cap/short ESKİ yolda, bayt-aynı.
  if(p.sleeveLength==='elbow'||p.sleeveLength==='long'){
    var _sn=0.22,_cs=0.9755;                             // sin/cos ~12.7° (gövdeden dışa)
    var _bh=(outX-k.uaX)*0.5;                            // bisep yarı-genişliği
    var _axL=hemY-k.uaY;                                 // bisep çizgisinden ağız merkezine eksen boyu
    var _wcX=k.uaX+_bh+_sn*_axL,_wcY=k.uaY+_cs*_axL;     // ağız (bilek/dirsek) merkezi
    var _wh=_bh*(p.sleeveLength==='long'?0.60:0.80);     // ağız yarı-genişliği (bilek dar, dirsek dolgun)
    var _owX=_wcX+_cs*_wh,_owY=_wcY-_sn*_wh;             // ağız dış köşe (eksene dik)
    var _iwX=_wcX-_cs*_wh,_iwY=_wcY+_sn*_wh;             // ağız iç köşe
    var _cY=k.stY+(k.uaY-k.stY)*0.30;                    // omuz kapağı dönüş noktası
    var gf=[];
    gf.push(seg([k.stX,k.stY],[k.stX+(outX-k.stX)*0.5,k.stY],[outX,k.stY+(_cY-k.stY)*0.5],[outX,_cY])); // omuz ucu → kapak (kısa kolla aynı karakter)
    gf.push(seg([outX,_cY],[outX+(_owX-outX)*0.22,_cY+(_owY-_cY)*0.38],[_owX-(_owX-outX)*0.12,_owY-(_owY-_cY)*0.20],[_owX,_owY])); // dış kenar: kapaktan ağza düzgün konik, dışa açılı
    gf.push(seg([_owX,_owY],[_owX+(_iwX-_owX)*0.33+_sn*1.5,_owY+(_iwY-_owY)*0.33+_cs*1.5],[_iwX+(_owX-_iwX)*0.33+_sn*1.5,_iwY+(_owY-_iwY)*0.33+_cs*1.5],[_iwX,_iwY])); // ağız: eksene dik temiz kapanış (hafif dışbükey)
    gf.push(seg([_iwX,_iwY],[_iwX-(_iwX-k.uaX)*0.30,_iwY-(_iwY-k.uaY)*0.34],[k.uaX+(_iwX-k.uaX)*0.10,k.uaY+(_iwY-k.uaY)*0.22],[k.uaX,k.uaY])); // iç kenar: ağızdan koltukaltına
    // dönen outX/hemY manşet-seam çapasıdır (render sl.outX/sl.hemY okur; x çapaları
    // sabit uaX bölgesinde). Açılı kolda bilek dışarı kaydığı için çizgi bilekte havada
    // kalırdı; İÇ DİKİŞE çapalanan kırışık olarak konur: ucu (x=uaX+11) iç dikişin
    // o x'i kestiği yüksekliğe oturur — dirsek kolunda ağzın hemen üstü (gerçek hemY),
    // uzun kolda dirsek hizası. Kısa koldaki manşet kıvrımıyla aynı kalem dili.
    gf.push.apply(gf,armholeBack(p,k));   // kol kapağı = gövdenin oyuğu (kanca gitti)
    return {g:gf,outX:outX,hemY:(p.sleeveLength==='long'?k.uaY+(_iwY-k.uaY)*(11/(_iwX-k.uaX))+11:hemY),wristX:_iwX};
  }
  var g=[];
  // omuz ucundan dış kenar: cap'te aşağı-eğimli (omuz çizgisini takip), düzde yatay
  if(_cap){g.push(seg([k.stX,k.stY],[k.stX+(outX-k.stX)*0.45,k.stY+(hemY-k.stY)*0.16],[outX-(outX-k.stX)*0.12,k.stY+(hemY-k.stY)*0.34],[outX,k.stY+(hemY-k.stY)*0.5]));}
  else g.push(seg([k.stX,k.stY],[k.stX+(outX-k.stX)*0.5,k.stY],[outX,k.stY],[outX,k.stY+(hemY-k.stY)*0.12]));
  // dış kenar aşağı bileğe (düz-hafif konik)
  g.push(seg([outX,k.stY+(hemY-k.stY)*0.12],[outX-(outX-wristX)*0.4,k.stY+(hemY-k.stY)*0.55],[wristX,hemY-(hemY-k.stY)*0.14],[wristX,hemY]));
  // bilek (kol ağzı, düz hafif kavis)
  g.push(seg([wristX,hemY],[wristX-(wristX-(k.uaX+6))*0.5,hemY+2],[k.uaX+10,hemY+1],[k.uaX+6,hemY-1]));
  // iç kenar (koltukaltı dikişi) bilekten underarm'a — DÜZ yumuşak
  g.push(seg([k.uaX+6,hemY-1],[k.uaX+3,hemY-(hemY-k.uaY)*0.55],[k.uaX+1,k.uaY+8],[k.uaX,k.uaY]));
  g.push.apply(g,armholeBack(p,k));   // kol kapağı = gövdenin oyuğu (kanca gitti)
  return {g:g,outX:outX,hemY:hemY,wristX:wristX};}
function collarShape(p,neckSeg,k,gap){var n=16,outer=[],inner=[];for(var i=0;i<=n;i++){var t=i/n,q=cubic(neckSeg,t),q2=cubic(neckSeg,Math.min(1,t+0.02));var dx=q2[0]-q[0],dy=q2[1]-q[1],d=Math.hypot(dx,dy)||1;var w=p.collarWidth*S*(0.72+0.28*Math.sin(Math.PI*t));inner.push([q[0],q[1]]);outer.push([q[0]+dy/d*w,q[1]-dx/d*w]);}outer[0]=[k.cx+gap,outer[0][1]];inner[0]=[k.cx+gap,inner[0][1]];var loop=outer.concat(inner.slice().reverse());loop.push(loop[0]);return smooth(loop);}
function render(p){var pt=parts(),st=STYLE[p.style];var W=940,H=680,o='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg">';o+='<style>.body{fill:#fff;stroke:#111;stroke-width:1.9;stroke-linejoin:round;stroke-linecap:round}.piece{fill:#fff;stroke:#111;stroke-width:1.5;stroke-linejoin:round}.tie{fill:#fff;stroke:#111;stroke-width:1.4;stroke-linejoin:round;stroke-linecap:round}.seam{fill:none;stroke:#111;stroke-width:1.05;stroke-linecap:round}.ink{fill:#111;stroke:none}.st{fill:none;stroke:#111;stroke-width:.65;stroke-dasharray:3.5 3;stroke-linecap:round}.lbl{font-family:Helvetica,Arial,sans-serif;font-size:9.5px;letter-spacing:2.8px;fill:#111;text-anchor:middle}</style>';[false,true].forEach(function(isBack){var cx=isBack?700:240;var rnd=rng(p.seed*131+(isBack?977:13));var b=buildHalf(p,cx,isBack,rnd),k=b.k;var half=enforceC1(b.g.slice(),!k.pointed),full=half.concat(mirror(half,cx));var M=function(d,c){return '<path class="'+c+'" d="'+d+'"/>'+'<g transform="translate('+(2*cx)+',0) scale(-1,1)"><path class="'+c+'" d="'+d+'"/></g>';};
// INK-ASİMETRİ (2026-07-26, flat-metre bulgusu): gerçek emsal flat'lerde mürekkep
// (kıvrım/tik) sol-sağ AYNA DEĞİL (ölçülen simetri 0.66-0.84); bizim kalem her ink'i
// scale(-1,1) ile kopyalıyordu (ölçülen 0.997-1.0 = robotik). p.inkAsym açıkken drape
// fold'ları sol kanatta KENDİ deterministik planından çizilir, fizik-büzgü tikleri
// aynalanmaz (çözücü tüm genişliği üretir). SİLÜET AYNALI KALIR. Default KAPALI →
// pinli/mevcut her stil byte-identical. Determinist: rndL sabit tohum, md5 eşit.
var AS=!!p.inkAsym;var rndL=rng(p.seed*131+(isBack?977:13)+500009);
var refl=function(pts){return pts.map(function(q){return [2*cx-q[0],q[1]];});};
// MJ: ink taper'ı çift kanat basar. Asym: sağ ham; sol = yansıt + iç noktalara
// deterministik mikro-jitter (uçlar SABİT = yapısal konum korunur), genişlik ±%10.
var MJ=function(pts,maxw,bias){if(!AS)return M(taper(pts,maxw,bias),'ink');
  var L=refl(pts).map(function(q,i,a){if(i===0||i===a.length-1)return q;
    return [q[0]+(rndL()-0.5)*2.4,q[1]+(rndL()-0.5)*1.8];});
  return '<path class="ink" d="'+taper(pts,maxw,bias)+'"/>'+
         '<path class="ink" d="'+taper(L,maxw*(0.9+rndL()*0.2),bias)+'"/>';};if(pt.straps){var sp=strapShape(p,k,rng(p.seed*57+(isBack?31:5)));o+=M(toPath(sp.outline),'piece');if(p.ruffle>0.05)sp.lumps.forEach(function(l,i){if(i===0||i===sp.lumps.length-1)return;var s=l.side,w=s>0?l.wl:l.wr;o+=MJ(samplePts([l.x+l.nx*w*s*0.92,l.y+l.ny*w*s*0.92],[l.x+l.nx*w*s*0.45,l.y+l.ny*w*s*0.45+2],[l.x-l.nx*w*s*0.25,l.y-l.ny*w*s*0.25+3],[l.x-l.nx*w*s*0.62,l.y-l.ny*w*s*0.62+4],7),1.5,0.45);});}if(pt.sleeve){var sl=(p.capPuff>0.05?puffSleeve(p,k):plainSleeve(p,k));o+=M(toPath(sl.g),'piece');var cn=(p.capPuff>0.05?5:0),cr=rng(p.seed*23+(isBack?7:19));for(var ci=1;ci<=cn;ci++){var ct=ci/(cn+1),cp=cubic(sl.g[0],ct);if(cp[0]<k.stX+(sl.outX-k.stX)*0.55)continue;var inx=cp[0]-(cp[0]-k.stX)*0.22,iny=cp[1]+9+cr()*5;o+=MJ(samplePts(cp,[cp[0]-(cp[0]-inx)*0.3,cp[1]+4],[inx+(cp[0]-inx)*0.2,iny-4],[inx,iny],6),0.95,0.5);}// MANŞET DİKİŞİ (2026-08-01, Damla: "kol uzayınca bu kadar çirkin olmamalı").
// Eğri kolun AĞZINI değil, kol ağzından GÖVDENİN koltukaltına kadar uzanıyordu
// (bitiş k.uaX+11). Kısa kolda ağız zaten gövdeye yakın olduğu için fark
// edilmiyordu; uzun/dirsek kolda kolun ortasını boydan boya kesen bir çizgi
// oluyordu — görüntüdeki artık bu. Artık sadece kolun kendi ağzını kapatıyor.
// Manşet dikişi çizgisi KALDIRILDI (2026-08-01, Damla: "simple dursun").
// Uzun/dirsek kolda `sl.hemY` bileği değil koltukaltı hizasını döndürüyor, o
// yüzden çizgi kol ağzına değil OMUZ OYUĞUNUN yanına düşüyordu — ekranda
// görülen küçük artık buydu. Düz kolun ağzı zaten konturla kapanıyor, ayrı
// bir dikiş çizgisine ihtiyacı yok.
var cuY=sl.hemY-9;if(pt.laceSleeve){var cuffPoly=polyFromSegs([sl.g[2]],10);var cl=laceBand(cuffPoly,p.laceWidth*S*0.85,Math.round(p.laceScallops*0.5));o+=M(cl.band,'piece');o+=M(cl.head,'st');}var gn=p.cuffGather<0.05?0:Math.round(5*p.cuffGather)+2,gr=rng(p.seed*37+(isBack?11:3));for(var gi=1;gi<gn;gi++){var gu=(gi/gn)*0.58,gx2=(sl.outX-8)+((k.uaX+13)-(sl.outX-8))*gu,gy2=cuY-3;o+=MJ([[gx2,gy2],[gx2+1.5,gy2-7-gr()*6],[gx2+2.5,gy2-14-gr()*8]],1.1,0.4);}}o+='<path class="body" d="'+toPath(full)+'"/>';if(pt.shirr && st.physicsShirr && p.gatherRatio>1.05 && (!isBack||st.top==='shoulder')){
  // FIZIK-SHIRRED (2026-07-21 — cloth-solver, st.physicsShirr bayrağı). Elle-shirr
  // satırları yerine fizik-çözülmüş fold çizgileri. SADECE physicsShirr taşıyan
  // stiller → pinli babydoll (bayrak yok) byte-identical. Deterministik.
  var _pTop=k.panelTop+(pt.casing?11:6),_pBot=k.yEmp-(st.top==='band'?4.5*S:2.5*S);
  var _pFin=(sampleX(half,_pTop)||k.bX)-k.cx-3;      // bitmiş yarım-genişlik
  var _res=_rectGather({finishedW:_pFin*2,clothH:(_pBot-_pTop),gatherRatio:p.gatherRatio,fabric:_SEED_FAB.cotton,seed:p.seed,profile:'shirred'});
  for(var _fi=0;_fi<_res.folds.length;_fi++){var _fl=_res.folds[_fi],_fp=[];
    for(var _fj=0;_fj<_fl.length;_fj++)_fp.push([k.cx-_pFin+_fl[_fj][0],_pTop+_fl[_fj][1]]);
    o+=AS?'<path class="ink" d="'+gatherTick(_fp,_fi)+'"/>':M(gatherTick(_fp,_fi),'ink');}   // KÖK3: püskül → kısa emsal tik (asym: çözücü tüm genişlik, ayna yok)
}else if(pt.shirr && p.gatherRatio>1.05 && (!isBack||st.top==='shoulder')){var rows=(p.ink==='minimal')?Math.min(4,p.shirrRows):p.shirrRows,top=k.panelTop+(pt.casing?11:6),bot=k.yEmp-(st.top==='band'?4.5*S:2.5*S),prev=null;for(var i=0;i<rows;i++){var ry=top+(bot-top)*(i/(rows-1||1));var rx=sampleX(half,ry);if(rx===null)rx=k.bX;rx-=3;var bumps=Math.max(3,Math.round(4*(p.gatherRatio-1)+2+(rnd()-0.5)*2));var amp=0.9+rnd()*0.9,ph=rnd()*Math.PI,spts=[];for(var s2=0;s2<=bumps*2;s2++){var u=s2/(bumps*2);spts.push([k.cx+1+(rx-k.cx-1)*u,ry+Math.sin(ph+u*bumps*Math.PI)*amp*(0.35+0.65*u)]);}o+=MJ(spts,1.35,0.35);prev=ry;}}var eL=2*k.cx-k.eX;if(st.garment!=='top')o+='<path class="seam" d="M '+eL.toFixed(1)+','+(k.yEmp-1).toFixed(1)+' C '+(k.cx-(k.eX-k.cx)*0.45)+','+(k.yEmp+2.5)+' '+(k.cx+(k.eX-k.cx)*0.45)+','+(k.yEmp+2.5)+' '+k.eX.toFixed(1)+','+(k.yEmp-1).toFixed(1)+'"/>';
// FIZIK-GATHERED ETEK (2026-07-23 — dirndl karakteri, st.gatheredSkirt bayrağı).
// Dirndl = etek belde BÜZÜLÜR (aLine gibi konik açılmaz). Bel dikişinin hemen
// altına fizik-çözülmüş (cloth-solver, profile:'skirt') büzgü kırışıkları çizilir;
// çözücü katları kendisi bulur, İKİNCİ kıvrım yolu yok — shirred bust'ta yaptığının
// etek-beli versiyonu. Deterministik. SADECE gatheredSkirt taşıyan stiller etkilenir.
if(st.gatheredSkirt&&st.garment!=='top'){
  var _gFin=(k.eX-k.cx);                                 // bitmiş yarım-bel genişliği
  var _gTop=k.yEmp+2,_gBand=Math.min(24*S*0.5,(k.yHem-k.yEmp)*0.22); // büzgü bandı boyu (belin hemen altı)
  var _gr=_rectGather({finishedW:_gFin*2,clothH:_gBand,gatherRatio:(p.gatherRatio||2),fabric:_SEED_FAB.cotton,seed:p.seed,profile:'skirt'});
  for(var _gi=0;_gi<_gr.folds.length;_gi++){var _gl=_gr.folds[_gi],_gp=[];
    for(var _gj=0;_gj<_gl.length;_gj++)_gp.push([k.cx-_gFin+_gl[_gj][0],_gTop+_gl[_gj][1]]);
    o+=AS?'<path class="ink" d="'+gatherTick(_gp,_gi)+'"/>':M(gatherTick(_gp,_gi),'ink');}   // KÖK3: püskül → kısa emsal tik (asym: ayna yok)
}
var _foldTapers=function(r){var su=0.12+r.u*(0.48+r.sway*0.12);var A=[k.cx+(k.eX-k.cx)*su,k.yEmp+3+r.birth*(k.yHem-k.yEmp)*0.55];var B=r.prim?r.hem:[k.cx+(k.hX-k.cx)*r.u*0.92,k.yEmp+(k.yHem-k.yEmp)*r.die];var h=B[1]-A[1];var sw=Math.pow(r.u,1.6);B=[A[0]+(B[0]-A[0])*(0.25+0.75*sw),B[1]];var c1=[A[0]+(B[0]-A[0])*(r.prim?0.08:0.16)*(1+r.sway*0.5),A[1]+h*0.40];var c2=[B[0]-(B[0]-A[0])*0.10,B[1]-h*(r.prim?0.46:0.58)];var line=samplePts(A,c1,c2,B,14);if(p.ink==='minimal')return [[line.slice(0,4),1.3,0.55],[line.slice(9),1.5,0.5]];return [[line,r.prim?1.8:0.95,r.prim?0.32:0.65]];};
if(AS&&b.folds.length){
  // sağ kanat: mevcut plan, ayna YOK; sol kanat: kendi bağımsız (deterministik) planı
  b.folds.forEach(function(r){_foldTapers(r).forEach(function(t){o+='<path class="ink" d="'+taper(t[0],t[1],t[2])+'"/>';});});
  var R2=drapePlan(p,rndL);hemPoints(p,k,R2); // r.hem atamak için; silüet hemPts DEĞİŞMEZ
  R2.forEach(function(r){_foldTapers(r).forEach(function(t){o+='<path class="ink" d="'+taper(refl(t[0]),t[1],t[2])+'"/>';});});
}else b.folds.forEach(function(r){_foldTapers(r).forEach(function(t){o+=M(taper(t[0],t[1],t[2]),'ink');});});var ts=k.hemPts.filter(function(q,i,a){return !(a[i-1]&&a[i-1][0]===q[0]&&a[i-1][1]===q[1]);});if(pt.laceHem){var hl=laceBand(polyFromSegs(smooth(ts),4),p.laceWidth*S,p.laceScallops);o+=M(hl.band,'piece');o+=M(hl.head,'st');}else{o+=M(toOpen(smooth(ts.map(function(q){return [q[0],q[1]-9];}))),'st');}if(pt.backSeam&&isBack)o+='<path class="seam" d="M '+k.cx+','+((st.top==='band'?k.yTop:k.ny)+1).toFixed(1)+' L '+k.cx+','+(k.hemPts[k.hemPts.length-1][1]).toFixed(1)+'"/>';
// TIE-BACK (2026-07-21 gündüz — id53 sınıf: arkada belde bağlanan bağ). Arka
// parçada (isBack), bel çizgisinde CB'den iki yana çıkan bağ şeritleri, uçları
// aşağı sarkar+kıvrılır (fiyonk değil, açık bağ uçları). Sadece pt.tieBack.
if(pt.tieBack&&isBack){var _tby=k.yEmp,_tbL=(p.tieLength||22)*S*0.7;
  // sol+sağ bağ ucu (M ile aynalanır)
  o+=M('M '+k.cx.toFixed(1)+','+_tby.toFixed(1)+' C '+(k.cx-(k.eX-k.cx)*0.5)+','+(_tby+_tbL*0.3)+' '+(k.cx-(k.eX-k.cx)*0.85)+','+(_tby+_tbL*0.7)+' '+(k.cx-(k.eX-k.cx)*0.7)+','+(_tby+_tbL),'tie');
  // bağ düğümü (CB'de küçük)
  o+='<path class="tie" d="M '+(k.cx-4)+','+(_tby-3)+' L '+(k.cx+4)+','+(_tby-3)+' L '+(k.cx+4)+','+(_tby+7)+' L '+(k.cx-4)+','+(_tby+7)+' Z"/>';}
// PEPLUM (2026-07-21 FAZ A2 — bele takılı, aşağı açılan kısa flare panel; id41
// + 8 hedef). Top gövdesinin bel çizgisinden (k.yHem) aşağı dairesel flare: iç
// yay = bel genişliği, dış yay daha geniş → kendiliğinden dalgalanır (drape).
// Ayrı kesim parçası çizgisi. p.peplum!=='none' && st.garment==='top'. Pinli
// stiller peplum taşımaz → byte-identical. full=tam, half=sığ, pointed=sivri.
if(p.peplum&&p.peplum!=='none'&&st.garment==='top'){
  var _pw=k.hX-k.cx;                              // bel yarım-genişlik
  var _pflare=(p.peplum==='full')?1.8:(p.peplum==='pointed')?2.0:1.45;
  var _plen=(p.peplum==='pointed')?36:28;         // peplum boyu (px) — KISA, bel→kalça
  var _py0=k.yHem, _pyH=k.yHem+_plen*S;
  var _phX=k.cx+_pw*_pflare;                       // dış (hem) yarım-genişlik
  var _pdip=(p.peplum==='pointed')?12:4;           // hem dalga derinliği (yumuşak)
  k.pepH=_pyH;                                      // label'ı peplum altına almak için
  // yan kenar: bel → flare hem
  o+=M('M '+k.hX.toFixed(1)+','+_py0.toFixed(1)+' C '+(k.hX+(_phX-k.hX)*0.45).toFixed(1)+','+(_py0+(_pyH-_py0)*0.45).toFixed(1)+' '+_phX.toFixed(1)+','+(_pyH-(_pyH-_py0)*0.28).toFixed(1)+' '+_phX.toFixed(1)+','+_pyH.toFixed(1),'seam');
  // dalgalı hem — YUMUŞAK cubic dalga (flare kendiliğinden dalga, sivri değil)
  var _phem='M '+_phX.toFixed(1)+','+_pyH.toFixed(1),_nw=3,_pts=[];
  for(var _pi=0;_pi<=_nw*2;_pi++){var _pu=_pi/(_nw*2);_pts.push([_phX+(k.cx-_phX)*_pu,_pyH+((_pi%2)?_pdip:0)]);}
  o+=M(toOpen(smooth(_pts)),'seam');
  // bel bağlanma çizgisi (peplum dikişi)
  o+=M('M '+k.cx+','+_py0.toFixed(1)+' L '+k.hX.toFixed(1)+','+_py0.toFixed(1),'st');
  // PEPLUM HEM FIRFIRI (2026-07-23 — st.peplumRuffle). Peplum dış hem'ine (_pyH,_phX)
  // dikilen büzgülü fırfır şeridi. Motor Ruffle strip parçasını (peplum hem çevresine
  // trued) çiziyor; flat SUNUM: hem'in altına daha derin+dalgalı fırfır katı.
  if(st.peplumRuffle){var _rfD=(_pdip+8);                 // fırfır derinliği (peplum dalgasından derin)
    var _rfN=Math.max(5,_nw*2),_rfPts=[];
    for(var _ri=0;_ri<=_rfN;_ri++){var _ru=_ri/_rfN;_rfPts.push([_phX+(k.cx-_phX)*_ru,_pyH+_rfD+((_ri%2)?_rfD*0.55:0)]);}
    o+=M(toOpen(smooth(_rfPts)),'seam');                  // fırfır alt dalgalı kenar
    // fırfır büzgü çizgileri (peplum hem'inden fırfıra inen kısa dikey işaretler)
    for(var _rj=1;_rj<_rfN;_rj+=2){var _rx=_phX+(k.cx-_phX)*(_rj/_rfN);o+=MJ([[_rx,_pyH+1],[_rx+1,_pyH+_rfD*0.5],[_rx,_pyH+_rfD*0.9]],1.0,0.4);}
  }
}if(pt.princessSeam&&st.top!=='band'){var _apY=k.apexY;var _apX=k.cx+(k.bustX-k.cx)*(isBack?0.52:0.66);var _oX=k.cx+(k.uaX-k.cx)*0.80;var _wX=k.cx+(k.eX-k.cx)*0.50;var _hemBotY=k.hemPts[k.hemPts.length-1][1];var _hX=k.cx+(k.hX-k.cx)*0.46;var _psA=samplePts([_oX,k.uaY+4],[_oX-(_oX-_apX)*0.28,k.uaY+(_apY-k.uaY)*0.5],[_apX,_apY-6],[_apX,_apY],10);var _psB=samplePts([_apX,_apY],[_apX,_apY+(k.yEmp-_apY)*0.5],[_wX,k.yEmp-8],[_wX,k.yEmp],10);var _psC=samplePts([_wX,k.yEmp],[_wX,k.yEmp+(_hemBotY-k.yEmp)*0.34],[_hX,k.yEmp+(_hemBotY-k.yEmp)*0.66],[_hX,_hemBotY-2],12);o+=MJ(_psA,1.35,0.4);o+=MJ(_psB,1.35,0.5);o+=MJ(_psC,1.4,0.4);}if(pt.gorePanels&&st.top!=='band'){var _gN=p.goreCount||6,_gHalf=Math.max(1,Math.round(_gN/2)),_gHemBotY=k.hemPts[k.hemPts.length-1][1];for(var _gi=1;_gi<=_gHalf;_gi++){var _gu=_gi/_gHalf;var _gTopX=k.cx+(k.eX-k.cx)*_gu;var _gBotX=k.cx+(k.hX-k.cx)*_gu;var _gMidX=k.cx+(k.eX-k.cx)*_gu+((k.hX-k.eX)*_gu)*0.30;var _gpts=samplePts([_gTopX,k.yEmp+2],[_gTopX+( _gMidX-_gTopX)*0.4,k.yEmp+(_gHemBotY-k.yEmp)*0.34],[_gMidX,k.yEmp+(_gHemBotY-k.yEmp)*0.62],[_gBotX,_gHemBotY-3],12);o+=MJ(_gpts,1.3,0.42);}}if(pt.wrapSurplice&&!isBack){var _wd=(p.wrapDir===2?-1:1);var _snX=k.nX,_snY=k.stY;var _apY2=k.apexY;var _apX2=k.cx-_wd*(k.bustX-k.cx)*0.42;var _owX=k.cx-_wd*(k.eX-k.cx)*0.62;var _ov=samplePts([k.cx+_wd*(_snX-k.cx),_snY],[k.cx+_wd*(_snX-k.cx)*0.5,_snY+(_apY2-_snY)*0.42],[_apX2+_wd*(k.bustX-k.cx)*0.25,_apY2-10],[_apX2,_apY2],12);var _ov2=samplePts([_apX2,_apY2],[_apX2-_wd*(k.bustX-k.cx)*0.10,_apY2+(k.yEmp-_apY2)*0.5],[_owX,k.yEmp-10],[_owX,k.yEmp],12);o+=M(taper(_ov,1.7,0.4),'ink');o+=M(taper(_ov2,1.7,0.42),'ink');o+=M('M '+(k.cx-_wd*(_snX-k.cx)).toFixed(1)+','+_snY.toFixed(1)+' C '+(k.cx-_wd*(_snX-k.cx)*0.55).toFixed(1)+','+(_snY+(_apY2-_snY)*0.55).toFixed(1)+' '+(k.cx+_wd*(k.eX-k.cx)*0.10).toFixed(1)+','+(_apY2+8).toFixed(1)+' '+(k.cx+_wd*(k.eX-k.cx)*0.28).toFixed(1)+','+k.yEmp.toFixed(1),'st');}if(pt.wrapTie&&!isBack){var _wd2=(p.wrapDir===2?-1:1);var _ty2=k.yEmp;var _tKX=k.cx+_wd2*(k.eX-k.cx)*0.30;o+=M('M '+(k.cx+_wd2*(k.eX-k.cx)*1.0).toFixed(1)+','+(_ty2-3).toFixed(1)+' Q '+(k.cx+_wd2*(k.eX-k.cx)*0.5).toFixed(1)+','+(_ty2+7).toFixed(1)+' '+_tKX.toFixed(1)+','+(_ty2+3).toFixed(1),'seam');var _TL2=(p.tieLength||22)*S*0.5;o+=M('M '+_tKX.toFixed(1)+','+(_ty2+3).toFixed(1)+' C '+(_tKX+_wd2*8)+','+(_ty2+_TL2*0.4)+' '+(_tKX+_wd2*4)+','+(_ty2+_TL2*0.8)+' '+(_tKX-_wd2*2)+','+(_ty2+_TL2),'seam');}if(pt.laceNeck){var nl=laceBand(polyFromSegs(half.slice(0,k.nSeg),9),p.laceWidth*S,Math.round(p.laceScallops*0.55));o+=M(nl.band,'piece');o+=M(nl.head,'st');}if(pt.cfGather&&!isBack){var cg=rng(p.seed*71+9);for(var ci2=0;ci2<4;ci2++){var a0=[k.cx+3,k.ny+4+ci2*3];var a1x=[k.cx+16+cg()*10,k.ny+16+ci2*7+cg()*6];o+=MJ([a0,[(a0[0]+a1x[0])/2,(a0[1]+a1x[1])/2-2],a1x],1.15,0.5);}}if(pt.collar){var gap=isBack?0:p.collarGap*S;o+=M(toPath(collarShape(p,half[0],k,gap)),'piece');}if(pt.tie&&!isBack){var ty=(st.top==='band')?k.yTop+1.2*S+1:k.ny-4;var TL=p.tieLength*S*0.5;o+=M('M '+(k.cx+3)+','+(ty+6)+' C '+(k.cx+9)+','+(ty+TL*0.34)+' '+(k.cx+16)+','+(ty+TL*0.66)+' '+(k.cx+13)+','+(ty+TL)+' L '+(k.cx+5)+','+(ty+TL-2)+' C '+(k.cx+8)+','+(ty+TL*0.64)+' '+(k.cx+4)+','+(ty+TL*0.32)+' '+(k.cx+1)+','+(ty+8)+' Z','tie');o+=M('M '+(k.cx+4)+','+(ty+2)+' C '+(k.cx+22)+','+(ty-12)+' '+(k.cx+42)+','+(ty-5)+' '+(k.cx+40)+','+(ty+6)+' C '+(k.cx+38)+','+(ty+17)+' '+(k.cx+19)+','+(ty+12)+' '+(k.cx+4)+','+(ty+8)+' Z','tie');o+='<path class="tie" d="M '+(k.cx-5)+','+(ty-3)+' L '+(k.cx+5)+','+(ty-3)+' L '+(k.cx+5)+','+(ty+11)+' L '+(k.cx-5)+','+(ty+11)+' Z"/>';}
// BEL BAĞI (2026-07-23 — st.waistTie 'bow'|'tie'). id24 bow = önde bele bağlanan
// FİYONK; id57 tie = bele bağlanan KUŞAK uçları. Ön parçada (!isBack), bel çizgisinde
// (k.yEmp). Motor kalıpta ayrı kesim parçası çiziyor (TiePlacement FrontWaistBow/Tie);
// flat SUNUM işaretidir. Deterministik, sadece st.waistTie taşıyan stiller.
// SPAGHETTI TIE-STRAP (2026-07-23 — st.spaghettiStrap). id101 sınıf: shoulder-top
// sweetheart/kolsuz gövdede omuzda BAĞLANAN ince askı. Omuz çizgisi üzerinde
// (nX↔stX arası) ince dikey bant yukarı çıkar + tepesinde küçük bağ ucu. Motor
// Spaghetti Strap parçasını zaten çiziyor (StrapBlock); flat sunum işareti.
if(st.spaghettiStrap){var _ssX=k.nX+(k.stX-k.nX)*0.42,_ssTop=k.y0-9*S,_ssW=2.4;
  // TUTUNMA FIX (KÖK2 güzellik turu 2026-07-23): askı tabanı k.stY (sabit omuz-ucu Y)
  // idi ama _ssX omuz-ucundan içeride → omuz eğimli olduğu için orada gerçek outline Y'si
  // farklı = askı GÖVDEDEN KOPUK (id101 "askı havada", ölçüm 5.4px). Askı tabanı artık
  // omuz outline cubic'inin _ssX noktasındaki GERÇEK Y'sine oturur (shoulderYAt) → değer.
  var _ssBaseY=shoulderYAt(_ssX,k);
  // ince askı bandı (omuz noktasından yukarı, hafif içe)
  o+=M('M '+(_ssX-_ssW).toFixed(1)+','+_ssBaseY.toFixed(1)+' C '+(_ssX-_ssW).toFixed(1)+','+(_ssBaseY-(_ssBaseY-_ssTop)*0.5)+' '+(_ssX-_ssW*0.6).toFixed(1)+','+(_ssTop+3)+' '+(_ssX-_ssW*0.4).toFixed(1)+','+_ssTop.toFixed(1),'piece');
  o+=M('M '+(_ssX+_ssW).toFixed(1)+','+_ssBaseY.toFixed(1)+' C '+(_ssX+_ssW).toFixed(1)+','+(_ssBaseY-(_ssBaseY-_ssTop)*0.5)+' '+(_ssX+_ssW*0.6).toFixed(1)+','+(_ssTop+3)+' '+(_ssX+_ssW*0.4).toFixed(1)+','+_ssTop.toFixed(1),'piece');
  o+=M('M '+(_ssX-_ssW*0.4).toFixed(1)+','+_ssTop.toFixed(1)+' L '+(_ssX+_ssW*0.4).toFixed(1)+','+_ssTop.toFixed(1),'piece');
  // omuzda küçük bağ ucu (sarkan)
  o+=M('M '+_ssX.toFixed(1)+','+_ssTop.toFixed(1)+' C '+(_ssX-5)+','+(_ssTop-6)+' '+(_ssX-3)+','+(_ssTop-12)+' '+(_ssX+1)+','+(_ssTop-10),'tie');
}
var _wtie=(p.waistTie!=null?p.waistTie:st.waistTie);
if(_wtie&&!isBack&&st.garment!=='top'){var _wy=k.yEmp,_WL=(p.tieLength||26)*S*0.5;
  if(_wtie==='bow'){ // iki ilmek + orta düğüm + sarkan uçlar
    o+=M('M '+(k.cx+3)+','+(_wy+6)+' C '+(k.cx+10)+','+(_wy+_WL*0.32)+' '+(k.cx+18)+','+(_wy+_WL*0.66)+' '+(k.cx+14)+','+(_wy+_WL)+' L '+(k.cx+5)+','+(_wy+_WL-2)+' C '+(k.cx+9)+','+(_wy+_WL*0.62)+' '+(k.cx+4)+','+(_wy+_WL*0.30)+' '+(k.cx+1)+','+(_wy+8)+' Z','tie');
    o+=M('M '+(k.cx+4)+','+(_wy+1)+' C '+(k.cx+24)+','+(_wy-13)+' '+(k.cx+46)+','+(_wy-5)+' '+(k.cx+43)+','+(_wy+7)+' C '+(k.cx+40)+','+(_wy+18)+' '+(k.cx+20)+','+(_wy+12)+' '+(k.cx+4)+','+(_wy+8)+' Z','tie');
    o+='<path class="tie" d="M '+(k.cx-5)+','+(_wy-3)+' L '+(k.cx+5)+','+(_wy-3)+' L '+(k.cx+5)+','+(_wy+11)+' L '+(k.cx-5)+','+(_wy+11)+' Z"/>';
  } else { // kuşak: CF'den iki yana çıkan bağ şeritleri
    o+=M('M '+(k.cx+2)+','+(_wy-2)+' C '+(k.cx+(k.eX-k.cx)*0.4)+','+(_wy-3)+' '+(k.eX-6)+','+(_wy-2)+' '+(k.eX-2)+','+(_wy)+'','seam');
    o+=M('M '+(k.eX-2)+','+(_wy)+' C '+(k.eX+6)+','+(_wy+_WL*0.4)+' '+(k.eX+2)+','+(_wy+_WL*0.8)+' '+(k.eX-4)+','+(_wy+_WL)+'','seam');
  }
}
o+='<text class="lbl" x="'+cx+'" y="'+((k.pepH?k.pepH:k.yHem+k.dip)+52)+'">'+(isBack?'BACK':'FRONT')+'</text>';});return o+'</svg>';}
// K2 (2026-07-19): the engine is importable so render-lint.mjs can inspect the
// exact geometry it draws (same functions, same seeds). The CLI path below is
// byte-identical to before the refactor (cmp-proven per style).
function renderStyle(styleKey, overrides) {
  P = defaults(styleKey);
  if (overrides) Object.assign(P, overrides);
  return render(P);
}
export {SIZE, LEN, STYLE, SHARED, defaults, rng, buildHalf, enforceC1, mirror, cubic, sampleX, render, renderStyle, puffSleeve};

import {writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // usage: node _engine-full.mjs <style> <out.svg> ['{"overrides":1}']
  var style = process.argv[2] || 'lace_vneck_70s';
  var out = process.argv[3] || '/tmp/flat.svg';
  P = defaults(style);
  if (process.argv[4]) Object.assign(P, JSON.parse(process.argv[4]));
  writeFileSync(out, render(P));
  console.log('wrote', out, JSON.stringify(P));
}
