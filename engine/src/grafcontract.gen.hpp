#pragma once
// grafcontract.gen.hpp — URETILMIS DOSYA, ELLE DUZENLEME.
// Ureten: node KOSU/a2b-gen-contract-hpp.mjs (0509 A2b)
// Icerik: contract/graf-v1.json ve contract/pattern-sheet-v1.json'un BAYT-AYNI metni.
// Amac: WASM'de disk yok; wasm flatSVG/kalipSVG native ile ayni sozlesmeyi okusun diye gomulur.
namespace stitchu {
namespace graf {

// contract/graf-v1.json (28825 bayt)
inline const char* kGrafContractJSON() { return R"stitchu({
  "_contract": "graf-v1 — GRAF IR SOZLESMESI (F2a, 2026-09-05). HEDEF.md madde 9: sozluk Edge/Panel/Stitch primitifleriyle kurulur, sabit menu yok. Madde 4-5: BIR giysi grafi, IKI beden (gercek36 = kalip, croquis36 = flat), iki cikti. Madde 2: edit = grafa op, kaydi tekrar oynatilabilir. Bu dosya alan adlarinin, enum'larin, toleranslarin ve op tablosunun TEK kaynagidir: engine/src/graf.hpp (tipler + JSON gidis-donus), engine/src/grafop.hpp (op'lar), engine/src/grafdogrula.hpp (dogrulayici + sanal dikis) buradan okur. F4a (fotograf) ve F4b (prompt) hedef semasi da BU dosyadir: vision/prompt katmani dogrudan bu belgeyi uretir. Alan adlari Ingilizce, aciklamalar TR+EN (1.2.0: Anchor/Term oran->xFactor, ofsetMM->xOffsetMM, yOran->yLerp, yOfsetMM->yOffsetMM; Panel bolluk->ease (tip Bolluk->RingEase), Panel/Seam gerekce->reason; op suppress intakeOran->intakeFraction, extendTo yOfsetMM->yOffsetMM. Eski Turkce anahtar gelirse sema 'tanimsiz alan', parse 'bilinmeyen alan' der — sessiz kabul yok). Kaynagi olmayan sayi 'DOGRULANMADI' tasir ve en kisitlayici secildi.",
  "version": "1.2.0",
  "id": "graf-v1",
  "_yasa": [
    "1. Nokta mm ile DEGIL beden landmark'i + oranla tanimlanir (Anchor). mm yalniz xOffsetMM/yOffsetMM alanlarinda durur ve bedenden bagimsiz bir eklemedir (pay, kayma). Bir nokta birden cok landmark teriminin afin birlesimi olabilir (combo, agirliklar 1'e toplanir): kesirle bolme ve oranla uzatma grafi mm'ye dusurmez.",
    "2. Ayni graf iki bedende degerlenir: Body('gercek36' / graded EU34-44) -> KALIP, Body('croquis36') -> FLAT. Graf hangi bedende oldugunu bilmez; degerleme baglami (EvalCtx) bedeni ve halka basina bollugu tasir. Kumas = bedene bolluk alani: bolluk halkanin cevresini orantili buyutur.",
    "3. Panel kapali kenar halkasidir: edges[i].to == edges[i+1].from yapisal olarak (landmark terimleri esit), sayiyla degil. Kenar turleri: seam (bir Seam'de dikilir), cut (serbest kenar, finish gerekcesi zorunlu), fold (x=0 kat cizgisi, panel onFold), dartLeg (pens bacagi; iki bacak ortak apeks, esit uzunluk).",
    "4. Seam iki kenar ZINCIRI arasinda bir oran tasir: len(a) = ratio x len(b) + easeMM. Buzgu bir stil adi degil bu orandir (GarmentCode Interface.ruffle; contract/primitives-v1.json seam.ratio). a tarafi buzulen taraftir, ratio >= 1. a ve b SIRALI zincirdir: ardisik kenarlar bir tepe paylasir (ayni panelde kose; panel gecisinde baska bir dikisin ilan edilen uc esi). Yon zincirden turetilir; `reverse` a'nin basinin b'nin basiyla (false) mi sonuyla (true) mi dikildigini ILAN eder (karar 7; GarmentCode Interface.reverse/needsFlipping, knowledge/TEKNOLOJI-2026-08-23.md:52-59). notchFractions a'nin basindan olculur, b'ye reverse ile tasinir. Yon olmadan centik kesri tanimsizdir; tahmin yok.",
    "5. Bir kenar bolununce ROLU kaybolmaz, PARCALI tasinir (rolePart/roleCount). K2/K5'in kok sebebi (KOSU/ciktilar/primitif-DUSEN-*.txt: yoke/cup bolmesi kol oyugunun adini dusuruyordu) bu alanla kapanir: oyuk = parcalarin toplami.",
    "6. Her op saf fonksiyondur ve yalniz adiyla dokundugu panel(ler)i degistirir; diger paneller BAYT-AYNI kalir (edit-locality, contract/edit-locality-v1.json yasasi grafa tasindi). Op kaydi grafa eklenir; kayitlarin tabana yeniden oynatilmasi ayni JSON'u verir (spec-diff deseni, Zoo/KittyCAD). Op adlari contract/primitives-v1.json operator adlariyla birdir (suppress/gather/flare/extend/shorten/split/overlay/attach); Turkce ya da vocab.json enum degeriyle carpisan ad yok (karar 2).",
    "6b. KISIT (karar 6): grafa mm cozum yazilmaz. `fitLength` bir kubik kenari bir dikise BAGLAR (Edge.fitSeam); kontrol noktasi kaymasi degerleme aninda verilen Body'de bisection ile cozulur (grafop.hpp cozumle, sinirlar `cozucu` blogunda). Boylece ayni graf gercek36 / EU34-44 / croquis36'da ayri ayri kapanir; tek bedende cozulmus sabit yoktur.",
    "7. Dikilebilirlik bir Body verilince olculur: dikis uzunluk artigi, centik eslesmesi, kendini kesme, halka kapanmasi (sanal dikis). Kapanmayan giysi dikilebilir DEGILDIR. Sonuc bir tablodur (JSON + markdown) ve F6 paketine girer.",
    "8. Giysi TIPI kelimesine bagli sabit bu dosyaya GIRMEZ (HEDEF 1.9). Enum'lar dikis tarzi ve bitirme teknigidir, giysi adlari degil.",
    "9. Bir alan TEK anlam tasir (karar 3): Anchor.ring yalniz xOf ring* icin halka adi, Anchor.width yalniz xOf widthHalf icin genislik olcusu adi. Carpik kombinasyon (widthHalf+ring dolu, ring*+width dolu, widthHalf+width bos) sema ve parse'ta ADIYLA reddedilir. F4a/F4b vision-prompt katmani bu semayi uretir; bir alanin iki anlami modele ogretilemez.",
    "10. Dogrulayici ciktisi grafin notes'undaki DOGRULANMADI kalemlerini 'uydurma' bolumu olarak basar (karar 4a; HEDEF §2 sessiz default yok) ve esikleri kaynak sutunuyla basliga yazar (karar 5)."
  ],
  "koordinat": "contract/body-v1.json koordinat blogu ile ayni cumle: x=0 CF/CB duzlemi, y=0 omuz cizgisi (landmark.neckBase), +y asagi, mm. Panel yerel koordinati bedenin koordinatidir; kalip sayfasina yerlestirme F2b'nin isidir.",
  "kokTip": "Garment",
  "tipler": {
    "Garment": {
      "aciklama": {"tr": "Giysi grafi: paneller, dikisler, halkalar ve op gecmisi.", "en": "The whole design as a graph: panels, seams, rings and the op history."},
      "alanlar": {
        "id": {"tip": "string", "zorunlu": true, "aciklama": {"tr": "Grafin adi.", "en": "Name of the graph."}},
        "version": {"tip": "string", "zorunlu": true, "aciklama": {"tr": "Her zaman 'graf-v1'.", "en": "Always 'graf-v1'."}},
        "notes": {"tip": "string", "aciklama": {"tr": "Serbest not: kaynaklar, uydurulan varsayimlar ADIYLA (HEDEF §2: uydurdugunu soyle).", "en": "Free note: sources, and every assumed choice named out loud."}},
        "panels": {"tip": "Panel[]", "zorunlu": true, "aciklama": {"tr": "Kesilecek parcalar.", "en": "Pieces to be cut."}},
        "seams": {"tip": "Seam[]", "zorunlu": true, "aciklama": {"tr": "Dikisler (iki kenar kumesi + oran).", "en": "Seams (two edge sets + ratio)."}},
        "rings": {"tip": "Ring[]", "zorunlu": true, "aciklama": {"tr": "Acikliklar: yaka, kol oyugu, bel, etek ucu, kol agzi. Sanal dikis bunlarin kapanmasini olcer.", "en": "Openings: neck, armhole, hem, sleeve hem. Virtual sewing measures their closure."}},
        "ops": {"tip": "OpRecord[]", "zorunlu": true, "aciklama": {"tr": "Uygulanan op kayitlari, sirayla. Bos dizi = taban graf.", "en": "Applied op records in order. Empty = base graph."}}
      }
    },
    "Panel": {
      "aciklama": {"tr": "Kapali kenar halkasi = bir kez kesilecek parca.", "en": "Closed edge loop = one piece to cut."},
      "alanlar": {
        "id": {"tip": "string", "zorunlu": true},
        "edges": {"tip": "Edge[]", "zorunlu": true, "aciklama": {"tr": "En az 3 kenar; edges[i].to == edges[i+1].from.", "en": "At least 3 edges; edges[i].to == edges[i+1].from."}},
        "grainDeg": {"tip": "number", "zorunlu": true, "aciklama": {"tr": "Cozgu yonu, derece; 0 duz, 45 verev (ASTM D6673 katman 7).", "en": "Grain angle in degrees; 0 straight, 45 bias."}},
        "onFold": {"tip": "boolean", "zorunlu": true, "aciklama": {"tr": "x=0 kat cizgisi (ASTM katman 6). fold kenari olan panelde true.", "en": "Cut on the x=0 fold line."}},
        "cutCount": {"tip": "integer", "zorunlu": true, "aciklama": {"tr": "Kac kez kesilecek.", "en": "How many times to cut."}},
        "seamAllowanceMM": {"tip": "number", "zorunlu": true, "aciklama": {"tr": "Dikis payi mm; 0 = F2b contract varsayilanini (pattern-sheet-v1) uygular, burada sayi uydurulmaz.", "en": "Seam allowance mm; 0 = F2b applies the sheet contract default."}},
        "ease": {"tip": "RingEase[]", "aciklama": {"tr": "Halka basina cevre bollugu (mm). Degerleme bu halkanin cevresini G + mm olarak okur.", "en": "Per-ring circumference ease (mm) added at evaluation."}},
        "reason": {"tip": "string", "aciklama": {"tr": "Parca neden var (parca_sayisi yasasi: gerekcesiz parca yok).", "en": "Why this piece exists."}}
      }
    },
    "Edge": {
      "aciklama": {"tr": "Iki nokta arasinda tek kenar: dogru (control bos) ya da kubik (2 kontrol).", "en": "One edge between two points: a line (no control) or a cubic (2 controls)."},
      "alanlar": {
        "id": {"tip": "string", "zorunlu": true, "aciklama": {"tr": "Panel icinde tekil. Bolunen kenar '.1', '.2' eki alir.", "en": "Unique within the panel; split parts get '.1', '.2'."}},
        "kind": {"tip": "enum:edgeKind", "zorunlu": true},
        "role": {"tip": "string", "aciklama": {"tr": "Anatomik ad, mevcut edgeRoles ile uyumlu: armhole_front, armhole_back, sleeve_cap, sleeve_underarm, sleeve_hem, neck_front, neck_back, shoulder, side_front, side_back, waist_front, waist_back, hem_front, hem_back, cf, cb. Serbest metin; enum degil.", "en": "Anatomical name compatible with the engine's edgeRoles. Free text, not an enum."}},
        "rolePart": {"tip": "integer", "aciklama": {"tr": "Bolunmus rolun kacinci parcasi (1..roleCount). Yok = tam kenar.", "en": "Which part of a split role (1..roleCount)."}},
        "roleCount": {"tip": "integer", "aciklama": {"tr": "Rol kac parcaya bolundu.", "en": "How many parts the role was split into."}},
        "from": {"tip": "RefPoint", "zorunlu": true},
        "to": {"tip": "RefPoint", "zorunlu": true},
        "control": {"tip": "RefPoint[]", "aciklama": {"tr": "0 ya da 2 kontrol noktasi (kubik Bezier).", "en": "0 or 2 control points (cubic Bezier)."}},
        "finish": {"tip": "enum:finish", "aciklama": {"tr": "cut kenar icin bitirme gerekcesi; dikisli kenarda bos.", "en": "Finishing reason for a cut edge; empty on a sewn edge."}},
        "notches": {"tip": "number[]", "aciklama": {"tr": "Kenar uzerinde centik kesirleri (0,1), yay uzunluguyla.", "en": "Notch fractions along the edge (0,1) by arc length."}},
        "gatherRatio": {"tip": "number", "aciklama": {"tr": "Bu kenar buzgu icin kac kat uzatildi (bilgi; hukum Seam.ratio'da).", "en": "How much this edge was lengthened for gathering (info; the judgement lives in Seam.ratio)."}},
        "fitSeam": {"tip": "string", "aciklama": {"tr": "KISIT (op fitLength, yasa 6b): bu kubik kenarin kontrolleri degerleme aninda, verilen bedende, bu dikisi kapatacak sekilde cozulur. mm yazilmaz. Yalniz control 2 nokta olan kenarda.", "en": "Constraint: this cubic edge's controls are solved at evaluation time, in the given body, to close the named seam. No mm stored."}}
      }
    },
    "Anchor": {
      "aciklama": {"tr": "Tek landmark terimi. x = xFactor x taban + xOffsetMM; taban xOf'a gore landmark.x, halka payi ya da genislik/2. y = yLandmark.y (+ yLerp x (yLandmark2.y - yLandmark.y)) + yOffsetMM.", "en": "One landmark term. x = xFactor x base + xOffsetMM; base is landmark.x, a ring share or half a body width per xOf. y from yLandmark, optionally interpolated toward yLandmark2 by yLerp, plus yOffsetMM."},
      "alanlar": {
        "landmark": {"tip": "string", "zorunlu": true, "aciklama": {"tr": "contract/body-v1.json landmark adi ('landmark.<ad>').", "en": "A body-v1 landmark name."}},
        "xOf": {"tip": "enum:xOf", "aciklama": {"tr": "x tabani. landmark: landmark.x (croquis'te cevre/4 tup). ringFront: G x (1 - arkaPay) / 2; ringBack: G x arkaPay / 2; ringQuarter: G / 4. G = halka cevresi + bolluk. widthHalf: width alanindaki genislik olcusu / 2.", "en": "x base: the landmark's x, a share of the ring circumference (front / back / quarter), or half of the body width named in `width`."}},
        "ring": {"tip": "string", "aciklama": {"tr": "YALNIZ xOf ring* (ve landmark: bolluk halkasi) icin halka ('girth.<ad>'); bos = landmark'in kendi halkasi. widthHalf ile dolu olmasi sema hatasi.", "en": "Ring for xOf ring* (and the ease ring for landmark); empty = the landmark's own ring. Filled with widthHalf = schema error."}},
        "width": {"tip": "string", "aciklama": {"tr": "YALNIZ xOf widthHalf icin beden genislik olcusu adi ('width.crossFront', 'width.crossBack' — contract/body-v1.json). Baska xOf ile dolu olmasi sema hatasi.", "en": "Only for xOf widthHalf: the body width measure name. Filled with any other xOf = schema error."}},
        "xFactor": {"tip": "number", "zorunlu": true, "aciklama": {"tr": "x carpani (oran). 0 = CF/CB, 1 = landmark kenari.", "en": "x multiplier. 0 = centre line, 1 = the landmark edge."}},
        "xOffsetMM": {"tip": "number", "zorunlu": true, "aciklama": {"tr": "x'e mutlak ekleme, mm (bedenden bagimsiz pay).", "en": "Absolute x addition, mm."}},
        "yLandmark": {"tip": "string", "aciklama": {"tr": "y tabani; bos = landmark.", "en": "y base; empty = landmark."}},
        "yLandmark2": {"tip": "string", "aciklama": {"tr": "Dolu ise y iki landmark arasinda yLerp ile ara deger.", "en": "If set, y is interpolated toward this landmark by yLerp."}},
        "yLerp": {"tip": "number", "aciklama": {"tr": "y ara deger katsayisi: 0 = yLandmark, 1 = yLandmark2.", "en": "y interpolation weight: 0 = yLandmark, 1 = yLandmark2."}},
        "yOffsetMM": {"tip": "number", "aciklama": {"tr": "y'ye mutlak ekleme, mm.", "en": "Absolute y addition, mm."}}
      }
    },
    "RefPointCombo": {
      "aciklama": {"tr": "Cok terimli nokta: agirliklari 1'e toplanan Anchor'lar.", "en": "Multi-term point: anchors whose weights sum to 1."},
      "alanlar": {
        "combo": {"tip": "Term[]", "zorunlu": true}
      }
    },
    "Term": {
      "aciklama": {"tr": "Agirlikli Anchor.", "en": "Weighted anchor."},
      "alanlar": {
        "w": {"tip": "number", "zorunlu": true},
        "landmark": {"tip": "string", "zorunlu": true},
        "xOf": {"tip": "enum:xOf"},
        "ring": {"tip": "string"},
        "width": {"tip": "string"},
        "xFactor": {"tip": "number", "zorunlu": true},
        "xOffsetMM": {"tip": "number", "zorunlu": true},
        "yLandmark": {"tip": "string"},
        "yLandmark2": {"tip": "string"},
        "yLerp": {"tip": "number"},
        "yOffsetMM": {"tip": "number"}
      }
    },
    "RingEase": {
      "aciklama": {"tr": "Bir halkaya (girth.<ad>) eklenen cevre bollugu, mm.", "en": "Circumference ease added to one ring, mm."},
      "alanlar": {
        "ring": {"tip": "string", "zorunlu": true},
        "mm": {"tip": "number", "zorunlu": true}
      }
    },
    "EdgeRef": {
      "aciklama": {"tr": "Panel + kenar adi.", "en": "Panel + edge id."},
      "alanlar": {
        "panel": {"tip": "string", "zorunlu": true},
        "edge": {"tip": "string", "zorunlu": true}
      }
    },
    "Seam": {
      "aciklama": {"tr": "Iki kenar ZINCIRINI birlestiren dikis. len(a) = ratio x len(b) + easeMM. Zincir sirali: ardisik kenarlar tepe paylasir (yasa 4).", "en": "A seam joining two ordered edge chains. len(a) = ratio x len(b) + easeMM."},
      "alanlar": {
        "id": {"tip": "string", "zorunlu": true},
        "a": {"tip": "EdgeRef[]", "zorunlu": true, "aciklama": {"tr": "Buzulen taraf (ratio >= 1). SIRALI zincir; yon ardisik tepe paylasimindan turetilir.", "en": "The gathered side (ratio >= 1). Ordered chain; direction derived from shared vertices."}},
        "b": {"tip": "EdgeRef[]", "zorunlu": true, "aciklama": {"tr": "SIRALI zincir.", "en": "Ordered chain."}},
        "reverse": {"tip": "boolean", "zorunlu": true, "aciklama": {"tr": "false: a'nin basi b'nin BASIYLA dikilir (uclar bas-bas, son-son); true: a'nin basi b'nin SONUYLA. Zorunlu: sessiz varsayim yok (yasa 4, karar 7).", "en": "false: a's start is sewn to b's start; true: to b's end. Required — no silent default."}},
        "ratio": {"tip": "number", "zorunlu": true, "aciklama": {"tr": "araliklar.ratio icinde.", "en": "Within araliklar.ratio."}},
        "easeMM": {"tip": "number", "zorunlu": true, "aciklama": {"tr": "Oran disi mutlak fazlalik (kol kapagi payi gibi).", "en": "Absolute extra beyond the ratio (cap ease)."}},
        "notchFractions": {"tip": "number[]", "aciklama": {"tr": "Dikis boyunca kesirler, a'nin BASINDAN olculur; b'de reverse ise 1-f. Iki tarafta o kesirde centik bulunmali (toleranslar.centikMM).", "en": "Fractions along the seam from a's start (1-f on b when reverse); both sides must carry a notch there."}},
        "closure": {"tip": "Closure", "aciklama": {"tr": "Kapama (fermuar/dugme) bu dikisin bir bolumudur.", "en": "A closure lives on a part of this seam."}},
        "reason": {"tip": "string", "aciklama": {"tr": "Dikis neden var / hangi uc hangi uca (serbest metin).", "en": "Why this seam exists / which end meets which (free text)."}}
      }
    },
    "Closure": {
      "alanlar": {
        "type": {"tip": "enum:closureType", "zorunlu": true},
        "fromFraction": {"tip": "number", "zorunlu": true},
        "toFraction": {"tip": "number", "zorunlu": true}
      }
    },
    "Ring": {
      "aciklama": {"tr": "Aciklik: dikildiginde ardisik kenarlar. Kat cizgisine dayanan uclar ayna ile kapanir.", "en": "An opening: consecutive edges once sewn. Ends resting on a fold line close by mirror."},
      "alanlar": {
        "id": {"tip": "string", "zorunlu": true},
        "role": {"tip": "string", "zorunlu": true, "aciklama": {"tr": "neck | armhole | hem | sleeve_hem | waist_ring ... (edgeRoles ile uyumlu, enum degil).", "en": "Anatomical name; free text."}},
        "edges": {"tip": "EdgeRef[]", "zorunlu": true}
      }
    },
    "OpRecord": {
      "alanlar": {
        "op": {"tip": "string", "zorunlu": true, "aciklama": {"tr": "oplar tablosundaki ad.", "en": "A name from the oplar table."}},
        "args": {"tip": "json", "zorunlu": true}
      }
    }
  },
  "enumlar": {
    "edgeKind": ["cut", "seam", "fold", "dartLeg"],
    "_edgeKind": "cut = serbest kenar (finish zorunlu); seam = bir Seam'de dikilir; fold = x=0 kat cizgisi; dartLeg = pens bacagi (op suppress'in urettigi kenar turu: pens bir kenar degil iki bacak + apeks oldugu icin bacak adiyla). ASTM D6673: kesim cizgisi (1) ve dikis cizgisi (14) ayri katman; ayrim burada kind'da.",
    "xOf": ["landmark", "ringFront", "ringBack", "ringQuarter", "widthHalf"],
    "_xOf": "widthHalf: x = xFactor x (beden genislik olcusu)/2; olcunun adi Anchor.width alaninda (width.crossFront, width.crossBack — contract/body-v1.json genislikler, ad ailesi ayni). Kol oyugunun icbukey noktasi (cross front/back) buradan gelir, uydurma oran degil. Anchor.ring yalniz ring* icin (yasa 9).",
    "finish": ["hem", "faced", "bound", "rolled", "raw"],
    "_finish": "Serbest kenarin bitirme teknigi: hem = kivrilip dikilir; faced = pervaz; bound = biye; rolled = rulo kenar; raw = bitirilmez (kumas gerekcesi). Giysi adi degil, dikis teknigi.",
    "closureType": ["zipper", "buttons", "hooks", "ties", "open"],
    "_closureType": "Kapama donanimi; 'open' = dikilmeyen acik bolum (yirtmac). Yirtmac derinligi contract/primitives-v1.json seam.sewnToFraction ile ayni sayidir: closure.fromFraction..toFraction."
  },
  "toleranslar": {
    "_tanim": "grafdogrula.hpp Tolerans::fromContract buradan okur; NaN kalirsa dogrulayici adiyla reddeder. Hepsi mm. Karar 5 (F2a): 2.0 mm uc kuralda ayni zincir ayni etiket; centik 0.5 mm kalir ve ASIL hukum kesir esitligidir (notchFractions iki tarafta ayni sayi; 0.5 mm yalniz sayisal artik siniri). Dogrulayici bu tabloyu kaynak sutunuyla F6 raporunun basligina basar.",
    "dikisUzunlukMM": {
      "deger": 2.0,
      "kaynak": "contract/body-v1.json ayniInsan.toleransMM ile AYNI zincir: URBN Apparel Technical Manual 'Position points, olcu <5 in' = 1/8 in = 3.175 mm ust sinir (knowledge/POM-TOLERANS-URBN-2026-08-23.md); repodaki CLO sayisi engine/src/validator.hpp:23 pairedSeamTolerance 3.0 (yayin degil, yazilim varsayilani); GarmentCode StitchingRule.isMatching tol=0.05 GORELI (500 mm'de 25 mm — bizim kapimizin esigi degil, knowledge/TEKNOLOJI-2026-08-23.md:66). En kisitlayici yayinli degerin altinda, cizim cozunurlugunun (1 mm) ustunde: 2.0 — DOGRULANMADI etiketi ayniInsan ile ayni, gevsetme yonunde degil."
    },
    "centikMM": {
      "deger": 0.5,
      "kaynak": "engine/tests/notch_alignment_check.cpp (2026-09-03): 'dikisin ustunde yurunen mm ... 0.5mm icinde' — motorun mevcut centik kapisi, repo konvansiyonu (yayin yok, DOGRULANMADI). En kisitlayici var olan deger."
    },
    "halkaKapanmaMM": {
      "deger": 2.0,
      "kaynak": "dikisUzunlukMM ile ayni: halka bir dikisin uzunluk artigi ya da bir kavsakta iki dikisin farkiyla kapanir; ayni buyukluk, ayni dayanak."
    },
    "pensBacakMM": {
      "deger": 2.0,
      "kaynak": "engine/src/validator.hpp dartSumTolerance 2.0 (repo konvansiyonu) ve dikisUzunlukMM ile ayni zincir; pens bacaklari insadan esit oldugu icin fark yalniz sayisal artiktir."
    }
  },
  "araliklar": {
    "ratio": {"aralik": [1.0, 3.5], "kaynak": "contract/primitives-v1.json seam.ratio ve op.gather.ratio aralik 1.0..3.5 (Bugra Locket olcumu %29-35 buzgu bandin icinde)."},
    "flareFactor": {"aralik": [1.0, 4.0], "kaynak": "contract/primitives-v1.json op.flare.hemFactor aralik 1.0..4.0."}
  },
  "cozucu": {
    "_tanim": "grafop.hpp cozumle (karar 6): fitSeam tasiyan kubik kenarin kontrol noktalari kiris normali boyunca d mm kaydirilir, d bisection ile bulunur. Bu sayilar fizik degil ARAMA sinirlaridir; NaN kalirsa cozucu adiyla reddeder.",
    "fitLength": {
      "dMaxMM": {"deger": 120, "kaynak": "Arama siniri: |d| <= 120 mm. DOGRULANMADI (fizik kaynagi yok): Aldrich kol kapagi yuksekligi bandi 130-150 mm'nin altinda secildi ki kontrol kaymasi tek basina bir kapak yuksekligi kadar olamasin; kok yoksa cozucu 'ulasilamadi' der, sinir gevsetilmez."},
      "tolMM": {"deger": 0.05, "kaynak": "Cozum toleransi 0.05 mm = cizim cozunurlugu 1 mm'nin 1/20'si; kapinin dikisUzunlukMM 2.0'inin 1/40'i — cozucu artigi kapida gorunmez. Sayisal, gevsetme yonunde degil."}
    },
    "gevsetme": {
      "_tanim": "engine/src/solver_utils.hpp (A2a): 2B panel tepe konumlari icin ITERATIF YAY-KUTLE GEVSETMESI. Yumusak hedefler (oran hedefleri) yay kuvvetidir; SERT kisitlar (dikis cifti uzunluk esitligi, panel kapaliligi, mutlak insan olcegi) her iterasyonda PROJEKSIYONLA zorlanir. Buradaki sayilar fizik degil ARAMA sinirlaridir; tavan asilinca yumusak hedefler ADIYLA birakilir, sert kisitlar kalir. NaN kalirsa cozucu adiyla reddeder (sessiz default yok).",
      "maxIter": {"deger": 400, "kaynak": "Arama butcesi (fizik degil), DOGRULANMADI — yayinlanmis kaynagi yok. Turetme: bir iterasyon sert kisitlari bir kez projekte eder; yakinsama olcutu artigin yakinsamaMM (0.05) altina inmesidir. 400 iterasyon = yakinsamaMM'nin toleranslar.dikisUzunlukMM 2.0'a orani (40x) ile adimBoyu 0.5'in geometrik yavaslamasi icin alinan ust sinir; asilirsa esik GEVSETILMEZ, cozucu 'yumusak birakildi' ya da ERR_UNSOLVABLE der."},
      "sureTavaniMS": {"deger": 2000, "kaynak": "Arama butcesi (fizik degil), DOGRULANMADI — olcum degil. Turetme: 0509 kapisinin --kisa modu adim basi kosar ve tek panel-cifti cozumunun ctest icinde saniyeler surmemesi gerekir; 2000 ms ust sinirdir. Tavan asilinca cozucu ASILI KALMAZ: yumusak hedefleri birakip sert kisitlarla doner ya da ERR_UNSOLVABLE atar."},
      "adimBoyu": {"deger": 0.5, "kaynak": "Gevsetme adim carpani (boyutsuz, 0 < k <= 1), DOGRULANMADI — sayisal secim. 1.0 Jacobi tarzi gevsetmede salinim (over-relaxation) uretir, 0'a yakini yakinsamayi maxIter'in altina sokmaz; kararli bandin ortasi 0.5."},
      "yakinsamaMM": {"deger": 0.05, "kaynak": "cozucu.fitLength.tolMM ile AYNI sayi, AYNI dayanak: 0.05 mm = cizim cozunurlugu 1 mm'nin 1/20'si, kapinin dikisUzunlukMM 2.0'inin 1/40'i — cozucu artigi kapida gorunmez. Iki cozucu ayni sayisal tolerans zincirini kullanir."},
      "olcekKaynagi": "contract/body-v1.json olcekAraligi.giysiYuksekligiMM (min 395.0, max 1335.0 mm; gercek36 mutlak). MUTLAK INSAN OLCEGI SERT kisittir: cozucu olcegi bozarak dikisi kapatamaz. Sinir kutusu yuksekligi bu araligin disina cikacaksa ERR_UNSOLVABLE atilir — boylece A1'in ERR_SCALE_MISMATCH'i ile pinpon olmaz (olcek burada gevsetilecek bir hedef degil, projeksiyonla korunan bir sinirdir).",
      "hataKodlari": {"ERR_UNSOLVABLE": "Sert kisitlar birbiriyle ya da olcek siniriyla celisiyor: cozum yok. Cozucu en yakin cozumu (son durumu) ve hangi kisitin gevsetilmesi gerektigini ADIYLA doner."}
    }
  },
  "oplar": {
    "_tanim": "engine/src/grafop.hpp applyOp(op, args). Her op saf: yalniz adi gecen panel(ler)/dikis degisir; kaydi Garment.ops'a eklenir. Kesir = 0..1 yay parametresi; oran boyutsuz.",
    "subdivide": {"args": {"panel": "string", "edge": "string", "fractions": "number[]"}, "tr": "Kenari kesirlerde boler; rol PARCALI tasinir; dikis/halka referanslari parcalara acilir.", "en": "Split an edge at fractions; the role is carried as parts."},
    "suppress": {"args": {"panel": "string", "edge": "string", "atFraction": "number", "intakeFraction": "number", "apex": "RefPoint", "legId": "string", "trueLegs": "boolean (varsayilan true)"}, "tr": "Pens = kenara uygulanan operator (HEDEF 1.9; ad contract/primitives-v1.json op.suppress, karar 2). Kenardan intakeFraction kadar (kenar uzunlugunun kesri) iceri alir; iki dartLeg + apeks. Aci parametre DEGIL (primitives-v1 ile ayni): intake ve apeks, aciyi beden verir. trueLegs=true: apeks agzin dik ortayina kurulur (x agiz ortasindan, y verilen apeksten) -> bacaklar insadan esit; false: apeks oldugu gibi, kenar_turu kurali yargilar.", "en": "Take in a fraction of the edge as a dart: two dartLeg edges to the apex; trueLegs puts the apex on the mouth's bisector."},
    "gather": {"args": {"panel": "string", "edge": "string", "ratio": "number"}, "tr": "Kenari kendi dogrultusunda ratio kat uzatir (kat kenarina dayaniyorsa x=0 etrafinda); tasidigi dikisin orani guncellenir (a = buzulen taraf).", "en": "Lengthen the edge along itself by ratio; the seam ratio follows."},
    "flare": {"args": {"panel": "string", "edge": "string", "factor": "number"}, "tr": "Serbest (cut) kenari factor kat acar (klos). Dikisli kenar icin gather.", "en": "Widen a free edge by factor."},
    "extend": {"args": {"panel": "string", "edge": "string", "deltaMM": "number"}, "tr": "Kenari +y'ye deltaMM tasir (uzatma).", "en": "Move the edge down by deltaMM."},
    "shorten": {"args": {"panel": "string", "edge": "string", "deltaMM": "number"}, "tr": "Kenari -y'ye deltaMM tasir (kisaltma, pozitif mm).", "en": "Move the edge up by deltaMM."},
    "extendTo": {"args": {"panel": "string", "edge": "string", "yLandmark": "string", "yOffsetMM": "number"}, "tr": "Kenarin y tabanini baska bir landmark'a baglar (diz -> ayak bilegi).", "en": "Re-anchor the edge's y to another landmark."},
    "split": {"args": {"panel": "string", "vertexA": "string", "vertexB": "string", "panelA": "string", "panelB": "string", "seam": "string", "seamRatio": "number"}, "tr": "Paneli iki kose arasinda ikiye boler (kose = kenar baslangici); yeni dikis eklenir; roller parcali kalir (once subdivide ile kose ac).", "en": "Cut a panel between two vertices into two panels joined by a new seam."},
    "overlay": {"args": {"host": "string", "edges": "string[]", "excessRatio": "number", "panel": "string", "seamPrefix": "string"}, "tr": "Konak panelin kopyasi ust katman; sayilan kenarlar excessRatio ile uzatilir ve konaga dikilir (buzgulu ust katman). Konak bayt-ayni.", "en": "A gathered overlay copy of the host panel sewn back on the named edges."},
    "attach": {"args": {"hostPanel": "string", "hostEdge": "string", "panel": "Panel", "edge": "string", "ratio": "number", "seam": "string"}, "tr": "Yeni panel (fiyonk/cep/volan/kusak) konak kenara ratio ile dikilir.", "en": "Sew a new panel onto a host edge."},
    "reshapeEdge": {"args": {"panel": "string", "edge": "string", "from": "RefPoint?", "to": "RefPoint?", "control": "RefPoint[]?"}, "tr": "Kenarin uc/kontrol noktalarini yeniden yazar (yaka, etek ucu).", "en": "Rewrite an edge's endpoints / controls."},
    "moveVertex": {"args": {"panel": "string", "edge": "string", "to": "RefPoint"}, "tr": "Kenar baslangic kosesini tasir (komsu kenar birlikte).", "en": "Move a vertex (shared by two edges)."},
    "mirror": {"args": {"panel": "string", "newId": "string"}, "tr": "Panelin x-aynasi yeni panel (asimetri icin).", "en": "Mirror a panel across x=0 into a new panel."},
    "closure": {"args": {"seam": "string", "type": "enum:closureType", "fromFraction": "number", "toFraction": "number"}, "tr": "Dikisin bir bolumune kapama yazar.", "en": "Mark a closure on part of a seam."},
    "fitLength": {"args": {"panel": "string", "edge": "string", "target": {"seam": "string", "ratio": "number", "easeMM": "number"}}, "tr": "KISIT (karar 6): kubik kenari dikise baglar (Edge.fitSeam), dikisin ratio/easeMM'ini yazar; mm YAZMAZ. Degerleme aninda cozumle() her bedende ayri cozer (cozucu blogu). Kenar dikisin bir tarafinda olmali; iki tarafi da kisitli dikis (dongu) reddedilir.", "en": "Constraint: bind a cubic edge to a seam so its controls are solved per body at evaluation time; no mm stored."}
  }
}
)stitchu"; }

// contract/pattern-sheet-v1.json (12290 bayt)
inline const char* kPatternSheetJSON() { return R"stitchu({
  "_contract": "pattern-sheet-v1 — KALIP SAYFASI KONVANSIYONU (F1, 2026-09-05). Damla: 'kaliplar da cirkin'. Kalip sayfasi (parca etiketi, grain oku, notch, kat cizgisi, kesim/dikis cizgisi stilleri, sayfa dizimi, lejant, tipografi) BURADAN cizilir: F2b kalip SVG'si ve F6a PDF'i bu dosyadan okur, sayi koda gomulmez. Uc kaynak katmani: (A) OLCULDU — satin alinmis Bugra Locket Top A0/A4 PDF (patterns_real/, okunur, kopyalanmaz; pdftotext + icerik akisi 'w'/'d'/'Tf' operatorleri, 2026-09-05); (B) STANDART — ASTM D6673-10 katman tablosu (geri cekildi 2019, hala CAD degisim referansi); (C) INDIE KONVANSIYON — Tilly and the Buttons isaret rehberi, Closet Core PDF yazdirma rehberi. Kaynagi olmayan sayi 'DOGRULANMADI' tasir ve en kisitlayici secildi.",
  "version": 1,
  "id": "stitchu-pattern-sheet-v1",
  "birim": "mm",
  "kaynaklar": {
    "bugra": "patterns_real/Locket Top/PDF's/A0.pdf + A4.pdf (Adobe Illustrator 28.2, MediaBox A0 821x1169 mm; kalibrasyon '4cm bar' 113.386 pt = 40.00 mm, patterns_real/BUGRA-DEFTER.md)",
    "astm": "ASTM D6673-10 'Standard Practice for Sewn Products Pattern Data Interchange—Data Format' §4.3 katman listesi (https://www.normsplash.com/Samples/ASTM/191361149/ASTM-D6673-10-en.pdf ornek sayfalari) + DH Patterns and Fit 'ePattern ASTM Standard' (https://dorthehansen.com/wp-content/uploads/2014/10/ePattern-ASTM-Standard.pdf) 23 katman tablosu",
    "tilly": "https://tillyandthebuttons.com/blogs/sewing/understanding-sewing-pattern-markings",
    "closetcore": "https://closetcorepatterns.com/pages/how-to-print-and-assemble-pdf-patterns (test karesi 4 in / 10.2 cm; A4/Letter tiling; A0 copyshop 46x48 in)",
    "draftingMath": "knowledge/drafting-math-eu38.md (centik: tek=on, cift=arka; kol kapagi walk)",
    "bugraOlcum": "F1 duzeltme turu 2026-09-05, pypdf ContentStream (q/Q + cm matrisi, w, d, m/l/S, Tf x Tm x ctm): A0.pdf 1 sayfa MediaBox 821x1169 mm; A4.pdf 12 sayfa MediaBox 200x287 mm (A4 210x297 eksi 5 mm kenar), sayfalar 1..12 numarali, harf/sayi karo kimligi ve hizalama ucgeni METIN olarak yok (vektor ucgen ayristirilmadi: OLCULMEDI). Tek-segment yollar: 7.0 mm x184 (A0) / x202 (A4) = centikler (8 beden x 6 parca), 5.5 mm x7 (cetvel), 2.0 mm x2. Kalinlik yalniz 0.35 ve 1.0 mm; dash yalniz [11.999] ve [12.06 12.06] pt."
  },
  "katmanlar": {
    "_tanim": "ASTM D6673 katman numaralari; SVG'de data-astm-layer niteligi olarak basilir, DXF cikisinda katman adi olur. Numara, metin degil (ASTM: 'Layers must be numbered').",
    "1": {
      "ad": "piece boundary (kesim cizgisi)",
      "zorunlu": true,
      "kaynak": "astm"
    },
    "2": {
      "ad": "turn points",
      "kaynak": "astm"
    },
    "3": {
      "ad": "curve points",
      "kaynak": "astm"
    },
    "4": {
      "ad": "V-notch ve slit notch",
      "kaynak": "astm"
    },
    "5": {
      "ad": "grade reference",
      "kaynak": "astm"
    },
    "6": {
      "ad": "mirror line (kat cizgisi)",
      "kaynak": "astm"
    },
    "7": {
      "ad": "grainline",
      "kaynak": "astm"
    },
    "8": {
      "ad": "internal lines (kesilmez; pens, cep yeri)",
      "kaynak": "astm"
    },
    "11": {
      "ad": "internal cutouts",
      "kaynak": "astm"
    },
    "13": {
      "ad": "drill holes (pens ucu delgi)",
      "kaynak": "astm"
    },
    "14": {
      "ad": "sew line (dikis cizgisi)",
      "kaynak": "astm"
    },
    "15": {
      "ad": "annotation text (parca etiketi)",
      "kaynak": "astm"
    },
    "80": {
      "ad": "T-notch",
      "kaynak": "astm"
    },
    "81": {
      "ad": "castle notch (U, dikdortgen uc)",
      "kaynak": "astm"
    },
    "82": {
      "ad": "check notch (V ucu, tek tarafi kenara dik)",
      "kaynak": "astm"
    },
    "83": {
      "ad": "U-notch (yarim daire uc)",
      "kaynak": "astm"
    }
  },
  "cizgiStilleri": {
    "_tanim": "Cizgi kalinliklari mm; kaynak Bugra A0 icerik akisi: yalniz IKI kalinlik kullaniliyor (0.353 mm = 1 pt ve 1.000 mm) ve tek dash dizisi (12 pt = 4.233 mm on/off). Hiyerarsi 1.0 : 0.35 ≈ 3:1 (flat-convention lineClasses 4:2:1 ile ayni aile).",
    "kesim": {
      "katman": 1,
      "kalinlikMM": 1.0,
      "dash": null,
      "kaynak": "bugra (1.000125 mm 'w')"
    },
    "dikis": {
      "katman": 14,
      "kalinlikMM": 0.35,
      "dash": [
        4.233,
        4.233
      ],
      "kaynak": "bugra (0.353 mm 'w', '[11.999] 0 d' = 4.233 mm esit on/off); tilly: 'dotted line indicates stitching line'"
    },
    "icCizgi": {
      "katman": 8,
      "kalinlikMM": 0.35,
      "dash": null,
      "kaynak": "bugra 0.353 mm"
    },
    "katCizgisi": {
      "katman": 6,
      "kalinlikMM": 0.35,
      "dash": [
        4.233,
        4.233
      ],
      "kaynak": "bugra ayni dash; tilly: 'double-pointed arrow with the ends bent at 90 deg towards a pattern outline' = place on fold isareti kat kenarina paralel"
    },
    "grainOku": {
      "katman": 7,
      "kalinlikMM": 0.35,
      "ucOkBasiMM": 6.0,
      "uzunlukOran": 0.5,
      "kaynak": "tilly: 'long, double-pointed arrow running down the length of your pattern piece'. Ok basi 6 mm ve uzunluk = parca boyunun 0.5'i DOGRULANMADI (Bugra'da ok vektor olarak ayristirilamadi); F1 duzeltme turu: A0 icerik akisinda 7.0 mm disinda kisa segment sinifi yok, ok basi ayri vektor olarak ayristirilamadi (OLCULMEDI)"
    },
    "bedenSerisi": {
      "_tanim": "Nested bedenler: her beden AYRI RENK (Bugra: 8 beden 8 renk, RG operatorleri) ya da ayri dash stili (tilly: 'multiple nested lines ... in different dot-and-dash styles'). stitchu: tek beden basar (musteri bedeni), seri PDF'inde renk + lejant.",
      "renklerRGB_bugra": [
        "1 0 0",
        "0.886 0.592 0",
        "0.294 1 0",
        "0 0.608 0.608",
        "0 0 1",
        "0.357 0 0.737",
        "0.976 0 0.976",
        "1 0 0.384"
      ],
      "kaynak": "bugra"
    }
  },
  "centik": {
    "_tanim": "Notch tipi ve olcusu. ASTM tipler: slit (4), V (4), T (80), castle (81), check (82), U (83). Indie: 'short lines at a right angle to the cutting line – or sometimes triangles' (tilly).",
    "varsayilanTip": "slitNotch",
    "tipler": { "slitNotch": 4, "vNotch": 4, "tNotch": 80, "castleNotch": 81, "checkNotch": 82, "uNotch": 83 },
    "_tipler": "ASTM D6673 centik tip kumesi -> DXF-AAMA katman numarasi (deger). Adlar vocab enum kelimeleriyle ciplak carpismaz (karar ajani 5: 'slit' backSlit ile carpisiyordu -> slitNotch; kural genel). F2b kalip SVG'si varsayilanTip'i ve katman'i BURADAN okur, koda ad/sayi gommez. Bekci: engine/tools/gen-contract.mjs --check — varsayilanTip kume icinde ve katman == tipler[varsayilanTip] degilse exit 1 (gen_contract_check).",
    "katman": 4,
    "uzunlukMM": 7.0,
    "_uzunlukNot": "bugra: A0/A4 icerik akisinda 184/202 tek-segment yol tam 7.0 mm (0.5 mm kovada), baska kisa segment sinifi yok -> centik 7 mm (eski 5.0 DOGRULANMADI degeri kalkti). Dikis payi 10 mm: centik dikis cizgisine 3 mm kala biter",
    "genislikMM": 0.35,
    "onArka": {
      "on": 1,
      "arka": 2,
      "kaynak": "tilly: 'Two notches together usually indicates the back of a pattern piece, such as on a sleeve'; knowledge/drafting-math-eu38.md: tek centik=on, cift=arka"
    },
    "ciftAralikMM": 6.0,
    "_ciftAralikNot": "DOGRULANMADI: Bugra'da cift centik cifti (iki 7 mm segmentin merkez araligi) bu turda ayristirilmadi; 6.0 mm indie pratigi",
    "kaynak_uzunluk": "bugra (olculdu)",
    "_varsayilanTipNot": "ASTM D6673 katman 4 'slit notch' (duz kisa cizgi, kesim cizgisine dik); adi vocab backSlit degeriyle carpismasin diye slitNotch"
  },
  "dikisPayi": {
    "govdeMM": 10.0,
    "etekUcuMM": 30.0,
    "kaynak": "bugra etiketi 'Seam Allowence 1cm - 3/8''' ve 'For Hem 3 cm - 1 1/8\"' (Locket Top, dahil); indie yaygin 1 cm (3/8 in) ya da 1.2 cm (1/2 in) (arama ozeti, DOGRULANMADI)",
    "yazim": "etikette 'DP 1 cm — 3/8 in · etek ucu 3 cm' cift birim (bugra iki birim basiyor)"
  },
  "parcaEtiketi": {
    "_tanim": "Katman 15 annotation. Icerik ve sira Bugra etiketinden OLCULDU (pdftotext A4.pdf).",
    "satirlar": [
      "parca adi (or. 'Front Body')",
      "kesim talimati: 'CUT 2X MIRRORED' | 'CUT 1X ON FOLD MAIN' | 'CUT 1X ON FOLD INTERFACING'",
      "beden: 'EU 36' (seri PDF'inde 'EU: 34 - 44')",
      "dikis payi: 'Seam Allowance 1 cm - 3/8 in'",
      "etek ucu payi (varsa): 'For Hem 3 cm'",
      "kat kenari yazisi kat cizgisi boyunca: 'CENTER BACK ON FOLD'",
      "islem notu (varsa): 'GATHERING', 'BUTTON PLACKET FOLD INSIDE 3 CM'",
      "parca numarasi (Bugra 1..7)"
    ],
    "kaynak": "bugra",
    "yeri": "parcanin ic bolgesinde, grain okuna paralel, kesim cizgisinden >= 10 mm iceride (DOGRULANMADI: yer kurali yayinsiz)",
    "tipografi": {
      "aileTercih": "sans (Bugra: Illustrator varsayilan TT/T1 gomulu font)",
      "parcaAdiMM": 6.3,
      "govdeMM": 4.4,
      "minimumMM": 2.4,
      "_not": "bugra OLCULDU (Tf x Tm x ctm, A0 = A4 ayni boyutlar): parca adi ve numarasi 6.3 mm (Front/Back Body), 5.5 (Sleeve), 4.1 (Collar/Lining) — buyuk parcada buyuk yazi; kesim/dikis payi satirlari 4.4-5.5 mm; beden araligi 'EU: 34 - 48' 2.4-3.7 mm (en kucuk); kat kenari yazisi 'CENTER FRONT / CENTER BACK ON FOLD' 9.4 mm, 'ON FOLD' 7.3 mm; islem notu 'GATHERING' 8.0, 'BUTTON PLACKET...' 5.7 mm; cetvel 3.5/4.2 mm. stitchu: parca adi 6.3, govde 4.4, minimum 2.4, kat kenari 9.4 (Bugra'nin en cok kullandigi degerler)",
      "katKenariYazisiMM": 9.4
    }
  },
  "sayfa": {
    "A4": {
      "genislikMM": 210,
      "yukseklikMM": 297,
      "kenarBoslukMM": 5,
      "kaynak": "ISO 216 210x297; bugra A4.pdf MediaBox 200x287 mm = her kenardan 5 mm bosluk (OLCULDU); ev yazicisi yazdirilamaz alan 5 mm icinde kalir",
      "karoSayisi_bugra": 12,
      "_karoNot": "bugra Locket Top A4: 12 karo, sayfa numarasi 1-12 (pdftotext), harf+sayi kimligi YOK; A0'in dogrudan karolanmasi degil (821/200 = 4.1 sutun tutmaz), parcalar A4'e ayri yerlesmis. Hizalama isareti OLCULMEDI (vektor)"
    },
    "Letter": {
      "genislikMM": 215.9,
      "yukseklikMM": 279.4,
      "kenarBoslukMM": 10
    },
    "A0": {
      "genislikMM": 841,
      "yukseklikMM": 1189,
      "kaynak": "closetcore copyshop A0; bugra A0 MediaBox 821x1169 (kenar boslugu 10 mm dusulmus)"
    },
    "dizim": {
      "kural": "sayfa karolari sag ve alt kenari kesilir, sonrakine yapistirilir; her karoda kose hizalama ucgenleri + harf/sayi kimligi (satir harf, sutun sayi)",
      "binisMM": 0,
      "kaynak": "closetcore: 'cutting off only the right and bottom edges of each sheet'; 'line up small triangles on the tile edges marked with letters and numbers'",
      "_bugra": "bugra 12 karo, birlestirme isareti metin olarak yok; kural closetcore'dan"
    },
    "testKaresi": {
      "kenarMM": 100.0,
      "cizgiMM": 0.35,
      "yazi": "10 cm / 4 in — yazdirdiktan sonra olc",
      "kaynak": "closetcore 4 in / 10.2 cm; arama: 'test square should measure 10cm x 10cm' (iki kaynak: 100 mm secildi, metrik). Bugra: 1-4 cm cetvel + 1-3 inch cetvel (4 cm bar = 40.00 mm kalibrasyon)"
    },
    "cetvel": {
      "metrikMM": [
        10,
        20,
        30,
        40
      ],
      "inch": [
        1,
        2,
        3
      ],
      "kaynak": "bugra"
    }
  },
  "lejant": {
    "satirlar": [
      "kesim cizgisi (1.0 mm duz)",
      "dikis cizgisi (0.35 mm kesik 4.2/4.2)",
      "kat cizgisi",
      "grain oku",
      "centik: 1 on / 2 arka",
      "delgi: pens ucu",
      "dikis payi dahil: 1 cm, etek ucu 3 cm",
      "test karesi 10 cm"
    ],
    "yeri": "ilk sayfa (kapak/lejant), bugra 'READ' sayfasi karsiligi",
    "kaynak": "bugra + tilly (icerik), yer DOGRULANMADI"
  },
  "kapak": {
    "satirlar": [
      "giysi adi + kaynak (prompt/fotograf YOLU, fotografin kendisi degil)",
      "beden + kumas",
      "parca listesi ve adet",
      "kesim plani (kumas eni)",
      "dikis sirasi rehberi baglantisi"
    ],
    "kaynak": "HEDEF §4 paket (A4 PDF, test karesi, rehber); bugra '6 READ.jpg' + 'PLEASE READ BEFORE SEW!!.txt' karsiligi"
  },
  "_durum": "F1 duzeltme turu (2026-09-05): Bugra'dan OLCULEN sayilar eklendi — centik 7.0 mm, tipografi 4 kademe, A4 kenar boslugu 5 mm, 12 karo. Kalan DOGRULANMADI: cift centik araligi, grain oku basi/uzunlugu, hizalama ucgeni, etiket yeri, lejant yeri."
})stitchu"; }

}  // namespace graf
}  // namespace stitchu
