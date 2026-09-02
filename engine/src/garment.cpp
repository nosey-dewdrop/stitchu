#include "garment.hpp"
#include "rehber.hpp"

#include <cmath>

#include "backdetail.hpp"
#include "buttonrow.hpp"
#include "collar.hpp"
#include "exposedzip.hpp"
#include "gather.hpp"
#include "offshoulder.hpp"
#include "hem.hpp"
#include "keyhole.hpp"
#include "laceupback.hpp"
#include "neckext.hpp"
#include "openback.hpp"
#include "peplum.hpp"
#include "hemflounce.hpp"
#include "cupseam.hpp"
#include "locket.hpp"
#include "yoke.hpp"
#include "boxpleat.hpp"
#include "cuff.hpp"
#include "placket.hpp"
#include "pocket.hpp"
#include "ruffle.hpp"
#include "shoulder.hpp"
#include "skirt.hpp"
#include "slit.hpp"
#include "sleeve.hpp"
#include "strap.hpp"
#include "patternedit.hpp"
#include "tie.hpp"
#include "wearability.hpp"  // F5-parca: gecis kurali (fermuar karari)
#include "wrapfront.hpp"

namespace stitchu {

namespace {

std::string replaceBodice(const std::string& name) {
    std::string result = name;
    const std::string from = "Bodice";
    const auto pos = result.find(from);
    if (pos != std::string::npos) result.replace(pos, from.size(), "Top");
    return result;
}

// Extends a bodice half-piece below the waist: side seam flows out to the hip
// width, hem squares back to the center edge. The hem side sits at the SAME
// depth for front and back (measured from the shared side waist) so the side
// seams stay equal; the front's center hem keeps the balance drop.
PatternPiece extendPiece(const PatternPiece& piece, double sideWaistY, double centerWaistY, double extra, double hipWidth) {
    if (extra <= 0) {
        PatternPiece cropped = piece;
        cropped.name = replaceBodice(piece.name);
        return cropped;
    }
    PatternPiece result = piece;
    result.name = replaceBodice(piece.name);
    // A waist dart's legs must sit on a seam edge; once the piece extends past
    // the waist there is no edge there, so the top goes boxy.
    result.markings.clear();

    std::vector<PathCommand> commands;
    size_t index = 0;
    while (index < result.commands.size()) {
        const PathCommand& cmd = result.commands[index];
        if (cmd.type == CmdType::Line && std::fabs(cmd.to.y - (sideWaistY - 8)) < 0.5) {
            const Point hemSide{hipWidth, sideWaistY + extra - 10};
            const Point hemCenter{0, centerWaistY + extra};
            commands.push_back(PathCommand::curve(
                hemSide,
                {cmd.to.x, sideWaistY + extra * 0.35},
                {hipWidth, sideWaistY + extra * 0.7}));
            commands.push_back(PathCommand::curve(
                hemCenter,
                {hipWidth * 0.6, hemCenter.y},
                {hipWidth * 0.25, hemCenter.y}));
            index += 2;
            if (index < result.commands.size() &&
                result.commands[index].type == CmdType::Curve &&
                result.commands[index].to.y < sideWaistY) {
                commands.push_back(PathCommand::line({0, result.commands[index].to.y}));
                index += 1;
            }
            continue;
        }
        commands.push_back(cmd);
        index += 1;
    }
    result.commands = commands;
    return result;
}

// Neckline + armhole edge finish (patch 3.10). Bias binding is the DEFAULT:
// a thin trued bias strip replaces the neck facings on an open (collarless)
// neck, and a second strip binds the sleeveless armholes. Facing (edgeFinish ==
// Facing) restores the old facing pieces. A REAL collar (collarType != None)
// keeps the facings so the collar attaches to a faced neck edge exactly as
// before (byte-identical collar path). Halter is handled by its own binding
// upstream and never reaches here. Returns every finish piece for the block.
std::vector<PatternPiece> edgeFinishPieces(
    const GarmentSpec& spec, const BodyMeasurementsSnapshot& m,
    const std::string& frontFacingCut, const std::string& backFacingCut,
    double armholeLength, bool sleeveless) {
    std::vector<PatternPiece> out;
    const bool realCollar = spec.collarType != static_cast<int>(CollarType::None);
    const bool useFacing = spec.edgeFinish == static_cast<int>(EdgeFinish::Facing) || realCollar;
    if (useFacing) {
        auto facings = BodiceBlock::neckFacings(m, spec.neckline, frontFacingCut, backFacingCut);
        out.insert(out.end(), facings.begin(), facings.end());
        // A REAL collar (useFacing via collar, not the Facing opt-in) still binds
        // the sleeveless armholes with bias — armhole facings aren't drafted.
        // The explicit Facing opt-in keeps the pre-3.10 behavior (no armhole strip).
        if (sleeveless && spec.edgeFinish != static_cast<int>(EdgeFinish::Facing)) {
            out.push_back(BodiceBlock::biasBinding(armholeLength * 2, "armholes"));
        }
    } else {
        // Default finish: ONE bias binding piece serves every raw edge. A sewist
        // cuts a single continuous length of bias strip and binds the neckline
        // and — when sleeveless — both armholes from it (join end to end). No
        // reason to list two separate binding "pieces" for one notion. Lengths
        // are trued to the drafted edges (neck circumference + 2× armhole).
        double edge = BodiceBlock::neckEdgeLength(m, spec.neckline);
        const char* label = "neckline";
        if (sleeveless) {
            edge += armholeLength * 2;
            label = "neckline + armholes";
        }
        out.push_back(BodiceBlock::biasBinding(edge, label));
    }
    return out;
}

// ---------------------------------------------------------------------------
// TECHNICAL MARKINGS post-pass (STEP 3): a real sewable commercial pattern
// carries, per piece: a GRAINLINE arrow, BALANCE NOTCHES on the curved seams
// that must align when sewn, and a CLOSURE mark where a non-stretch fitted
// garment needs one. These live in the new `notches`/`closure` fields, kept
// OUT of `commands`/`markings` so the sewing + cut geometry (and the golden
// dump) stays byte-identical. Placement is by bounding box + piece name, so it
// is robust across every garment/shaping variant.

// A single balance notch = one short line INTO the piece from the edge point.
void notch1(std::vector<PathCommand>& into, Point edge, double dx, double dy) {
    into.push_back(PathCommand::move(edge));
    into.push_back(PathCommand::line({edge.x + dx, edge.y + dy}));
}
// A double balance notch = two short parallel lines (front/back match pair).
void notch2(std::vector<PathCommand>& into, Point edge, double dx, double dy, double sepX, double sepY) {
    notch1(into, {edge.x - sepX * 0.5, edge.y - sepY * 0.5}, dx, dy);
    notch1(into, {edge.x + sepX * 0.5, edge.y + sepY * 0.5}, dx, dy);
}

bool nameHas(const PatternPiece& pc, const char* s) {
    return pc.name.find(s) != std::string::npos;
}

} // namespace

// Annotate every drafted piece with grainline (fallback), balance notches and
// (for a CB-zip garment) the closure mark. dressZipper = the garment carries an
// invisible center-back zipper (a dress; hasDonningOpening already true).
// Public kernel service (declared in garment.hpp) so the recipe path runs the
// SAME pass on its independently drawn pieces (RECETE-SPEC §6).
void GarmentDrafter::annotateTechnical(DraftedPattern& pattern, bool dressZipper,
                                       const std::string& zipGerekce) {
    const bool sleeved = [&] {
        for (const auto& pc : pattern.pieces)
            if (nameHas(pc, "Sleeve")) return true;
        return false;
    }();
    for (auto& pc : pattern.pieces) {
        // Strip/notion pieces (bias binding, ruffle, tie, cord, drawstring) are
        // straight rectangles cut on the bias/straight — no balance notches.
        const bool strip = nameHas(pc, "Bias binding") || nameHas(pc, "Ruffle") ||
                           nameHas(pc, "Tie") || nameHas(pc, "Cord") ||
                           nameHas(pc, "Binding");
        // GRAINLINE — every real piece must carry one. Most already do; add a
        // straight vertical fallback through the bbox centre for any that don't.
        if (!pc.hasGrainline && !pc.commands.empty()) {
            const Rect bb = boundingBox(pc.commands);
            const double cx = bb.x + bb.width * 0.5;
            pc.hasGrainline = true;
            pc.grainline = Grainline{{cx, bb.y + bb.height * 0.20},
                                     {cx, bb.y + bb.height * 0.80}};
        }
        if (strip || pc.commands.empty()) continue;
        const Rect bb = boundingBox(pc.commands);
        const bool isBack = nameHas(pc, "Back");
        const bool isFront = nameHas(pc, "Front");
        // TORSO panel — the role, not one spelling of it. The notch pass used to
        // ask for "Bodice"/"Top" only, so every post-pass that renames the torso
        // panels shipped a piece with ZERO balance notches: measured 2026-08-23,
        // the EU38 Bugra Locket (Front Body / Back Body, locket.cpp) came out of
        // the motor with 0 notch ticks while the plain top carried 4. "Body" is
        // the third spelling in use (locket.cpp, cupseam.cpp princess panels);
        // it is a role name, not a per-style exception.
        const bool isTorso = nameHas(pc, "Bodice") || nameHas(pc, "Top") ||
                             nameHas(pc, "Body");
        // --- Bodice / Top: armhole + waist balance notches on the side seam ---
        // Side seam is the max-x edge; armhole notch sits high (near the scye),
        // waist notch sits at the bottom edge. Front = single, back = double.
        if (isTorso && (isFront || isBack)) {
            const double sideX = bb.x + bb.width;
            if (sleeved) {
                const Point armPt{sideX, bb.y + bb.height * 0.18};
                if (isBack) notch2(pc.notches, armPt, -12, 0, 0, 12);
                else notch1(pc.notches, armPt, -12, 0);
            }
            // Waist notch on the side seam at the bottom edge (matches the skirt).
            const Point waistPt{sideX, bb.y + bb.height};
            if (isBack) notch2(pc.notches, waistPt, -12, 0, 0, 12);
            else notch1(pc.notches, waistPt, -12, 0);
        }
        // --- Skirt: waist balance notch on the side seam at the top edge ---
        if (nameHas(pc, "Skirt") && (isFront || isBack)) {
            const double sideX = bb.x + bb.width;
            const Point waistPt{sideX, bb.y};
            if (isBack) notch2(pc.notches, waistPt, -12, 0, 0, 12);
            else notch1(pc.notches, waistPt, -12, 0);
        }
        // --- CLOSURE: a dress carries an invisible CB zipper. Mark the back
        // pieces (bodice back + skirt back, cut on a CB seam) with the zipper
        // glyph down the center-back edge + a human closure label. ---
        if (dressZipper && isBack &&
            (isTorso || nameHas(pc, "Skirt"))) {
            // Center-back seam edge = min-x for a "cut 2" back panel.
            const double cbX = bb.x;
            const double top = bb.y + bb.height * 0.02;
            const double bot = nameHas(pc, "Skirt") ? bb.y + std::min(bb.height * 0.35, 180.0)
                                                     : bb.y + bb.height;
            // Zipper teeth glyph: a line down the CB with short ticks.
            pc.notches.push_back(PathCommand::move({cbX + 4, top}));
            pc.notches.push_back(PathCommand::line({cbX + 4, bot}));
            for (double y = top; y <= bot; y += 22.0) {
                pc.notches.push_back(PathCommand::move({cbX + 4, y}));
                pc.notches.push_back(PathCommand::line({cbX + 12, y}));
            }
            pc.closure = "invisible zipper (center back)";
            // F5-parca: the closure's reason (with the measured numbers) rides
            // on the piece itself — a zipper without a sentence is a kosulsuz
            // parca ozelligi and the gate rejects it.
            if (!zipGerekce.empty()) {
                pc.gerekce = pc.gerekce.empty() ? zipGerekce : pc.gerekce + "; " + zipGerekce;
            }
        }
    }
}

// F5-parca: her parca nicin var — rol tabanli doldurma. Ozgul (sayili)
// gerekceler kaynaginda yazilir (bodice eskalasyonu, fermuar, birlesik etek);
// bu gecis yalniz BOS kalani doldurur ve bitirme seritlerini siniflar, boylece
// listede gerekcesiz (= kosulsuz) parca kalmaz. parca_sayisi_check kapisidir.
void GarmentDrafter::fillGerekce(DraftedPattern& pattern) {
    const auto has = [](const PatternPiece& pc, const char* w) {
        return pc.name.find(w) != std::string::npos;
    };
    for (auto& pc : pattern.pieces) {
        if (has(pc, "Bias binding") || has(pc, "Binding")) {
            pc.bitirme = true;
            if (pc.gerekce.empty())
                pc.gerekce = "bitirme seridi: ham kenar (yaka/kol oyugu) bantla temizlenir — kesim parcasi sayimina girmez";
            continue;
        }
        if (!pc.gerekce.empty()) continue;
        if (has(pc, "Sleeve") || has(pc, "Cap "))
            pc.gerekce = "kol: spec kol istedi (kol oyugu kapakla dikilir)";
        else if (has(pc, "Waistband"))
            pc.gerekce = "bitirme bandi: bel kenarini temizler ve tasir";
        else if (has(pc, "Facing"))
            pc.gerekce = "temizleme parcasi (facing): ham kenar icten cevrilir";
        else if (has(pc, "Collar"))
            pc.gerekce = "yaka: spec yaka istedi";
        else if (has(pc, "Cuff"))
            pc.gerekce = "manset: spec manset istedi";
        else if (has(pc, "Pocket"))
            pc.gerekce = "cep: spec cep istedi";
        else if (has(pc, "Ruffle") || has(pc, "Flounce") || has(pc, "Peplum") ||
                 has(pc, "Cape") || has(pc, "Tier"))
            pc.gerekce = "susleme/volan parcasi: spec istedi (" + pc.name + ")";
        else if (has(pc, "Tie") || has(pc, "Sash") || has(pc, "Cord") || has(pc, "Strap"))
            pc.gerekce = "baglama/aski parcasi: spec istedi (" + pc.name + ")";
        else if (has(pc, "Side Front") || has(pc, "Side Back"))
            pc.gerekce = "prenses yan paneli: supresyon dikise tasindi";
        else if (has(pc, "Skirt") && has(pc, "Front & Back"))
            pc.gerekce = "etek on+arka tek kalip: fermuar yok ve iki ceyrek ozdes (cut 2 on fold)";
        else if (has(pc, "Skirt"))
            pc.gerekce = has(pc, "Back") ? "arka etek: bel dikisinden etege"
                                         : "on etek: bel dikisinden etege";
        else if (has(pc, "Front & Back"))
            pc.gerekce = "on+arka tek kalip: iki panel ozdes (cut 2)";
        else if (has(pc, "Front"))
            pc.gerekce = pattern.garment.find("skirt") != std::string::npos
                ? "on etek paneli" : "on govde";
        else if (has(pc, "Back"))
            pc.gerekce = pattern.garment.find("skirt") != std::string::npos
                ? "arka etek paneli" : "arka govde";
        else if (has(pc, "Upper Cup") || has(pc, "Lower Cup") || has(pc, "Cup"))
            pc.gerekce = "kap dikisi paneli: cupSeam spec'ten";
        else
            pc.gerekce = "spec ozelligi parcasi: " + pc.name + " (spec'in actigi blok ekledi)";
    }
}

// Single source of truth for the shaping decision. Every block routes its
// shaping through here instead of reading spec.shaping directly.
Shaping resolveShaping(const GarmentSpec& spec, const BodyMeasurementsSnapshot& m) {
    // PHASE 1: pure passthrough. Auto-fallback logic comes in phase 2.
    (void)m;
    return spec.shaping;
}

namespace DressBlock {

DraftedPattern draft(const GarmentSpec& spec, const BodyMeasurementsSnapshot& m) {
    BodiceBlock::BodiceOptions options;
    options.neckline = spec.neckline;
    options.shaping = resolveShaping(spec, m);
    options.waistline = spec.waistline;
    options.fabric = spec.fabric;
    // Dropped shoulder reshapes the armhole here (Set/Raglan leave it untouched;
    // a halter has no shoulder seam, so it is ignored on halters). Raglan is a
    // post-pass in GarmentDrafter::draft.
    if (spec.neckline != Neckline::Halter &&
        static_cast<ShoulderStyle>(spec.shoulderStyle) == ShoulderStyle::Dropped)
        options.shoulderStyle = ShoulderStyle::Dropped;
    // Sleeveless: cut the scye in slightly so the bare-shoulder edge hugs the
    // body (a real sleeveless armhole). A set-in sleeve keeps the full armhole so
    // the cap seats. Halter has its own bare-shoulder frame.
    options.sleeveless = spec.neckline != Neckline::Halter &&
                         spec.sleeveStyle == SleeveStyle::None;
    const BodiceDraft bodice = BodiceBlock::draft(m, options);
    const bool empire = spec.waistline == Waistline::Empire;
    // Empire: the seam sits above the natural waist, so the skirt makes up
    // the difference to keep the hem where the chosen length puts it.
    const double skirtExtra = std::max(0.0, m.backLengthMM() - bodice.waistSeamY);
    // The skirt is drafted against the bodice's measured sewn waist so the
    // waist seam lengths agree exactly where the two join. Princess mode goes
    // further: each quarter matches its bodice half and the gore seam is
    // placed at the princess seam's arc, so the seams MEET when sewn.
    const double bodiceSewnWaist = (bodice.frontSewnWaist + bodice.backSewnWaist) * 2;
    SkirtBlock::SkirtJoin join;
    join.frontQuarterWaist = bodice.frontSewnWaist;
    join.backQuarterWaist = bodice.backSewnWaist;
    join.frontSeamArc = bodice.frontPrincess ? bodice.frontWaistCenterArc : 0;
    join.backSeamArc = bodice.backPrincess ? bodice.backWaistCenterArc : 0;
    const Shaping shaping = resolveShaping(spec, m);
    const bool useJoin = shaping == Shaping::Princess;
    // ── F5-parca: GECIS KURALI — fermuar KOSULSUZ degil, olculen karar ──────
    // (contract/parca-gecis-v1.json). Once giysinin KENDI acikligi var mi diye
    // bakilir (GarmentDrafter'in backAlreadyOpens listesinin aynisi, ayni spec
    // eksenlerinden); yoksa cizilen yaka acikligi + dikilen bel cevresi bas
    // referansiyla yargilanir. Karar ve gerekcesi kaliba yazilir.
    const auto tiePl5 = static_cast<TiePlacement>(spec.tieClosure);
    const bool opensElsewhere =
        OpenBackBlock::opensForDonning(static_cast<BackOpening>(spec.backOpening)) ||
        LaceUpBackBlock::opensForDonning(static_cast<LaceUpBack>(spec.laceUpBack)) ||
        WrapFrontBlock::opensForDonning(static_cast<WrapFront>(spec.wrapFront)) ||
        spec.frontPlacket || spec.neckline == Neckline::Halter ||
        tiePl5 == TiePlacement::TieBack || tiePl5 == TiePlacement::BackWaist ||
        tiePl5 == TiePlacement::BackWaistBow || tiePl5 == TiePlacement::WrapFront ||
        spec.buttonRow == static_cast<int>(ButtonRow::Functional) ||
        spec.exposedZip != static_cast<int>(ExposedZip::None);
    Wearability::GecisKarari gecis;
    if (opensElsewhere) {
        gecis.fermuar = false;
        gecis.gerekce = "fermuarsiz: giysinin kendi acikligi giydiriyor (halter/placket/sirt acikligi/wrap)";
    } else {
        DraftedPattern neckProbe;
        neckProbe.pieces = {bodice.front, bodice.back};
        gecis = Wearability::gecisKurali(
            spec, Wearability::finishedNeckOpeningMM(spec, neckProbe), bodiceSewnWaist);
    }
    const bool needZip = gecis.fermuar;
    // Fermuarsiz + prenses degil + basit stil + arkaya ozel bir ozellik yoksa
    // etegin on/arka ceyregi TEK kaliptir. Arkayi ayri tutan her sart ayni
    // zamanda o parcanin gerekcesidir (yirtmac CB dikis ister, cep on panele
    // islenir, hem sekli/volani on-arka ayri boler).
    const bool skirtMerged = !needZip && !useJoin &&
        (spec.skirtStyle == SkirtStyle::ALine || spec.skirtStyle == SkirtStyle::Straight ||
         spec.skirtStyle == SkirtStyle::Gathered || spec.skirtStyle == SkirtStyle::Pleated) &&
        spec.backSlit == static_cast<int>(HemSlit::None) &&
        spec.pocketStyle == static_cast<int>(PocketStyle::None) &&
        spec.hemShape == static_cast<int>(HemShape::Straight) &&
        spec.hemFlounce == static_cast<int>(HemFlounce::None);
    std::vector<PatternPiece> skirtPieces = SkirtBlock::pieces(
        m, spec.skirtStyle, spec.skirtLength, /*includeWaistband=*/false, bodiceSewnWaist,
        shaping, spec.fabric, skirtExtra, useJoin ? &join : nullptr, spec.skirtLengthMM,
        skirtMerged);
    for (auto& piece : skirtPieces) {
        const std::string original = piece.name;
        // Half-circle panels already carry the word; avoid "Skirt Skirt Panel".
        if (original.rfind("Skirt", 0) != 0) piece.name = "Skirt " + original;
        // The invisible zipper continues from the bodice center back into the
        // skirt, so the skirt back needs a CB seam (no fold) — ONLY when the
        // gecis kurali actually asked for a zipper (F5-parca).
        if (needZip && (original == "Back" || original == "Center Back")) {
            piece.cutInstruction = "cut 2 (center back seam)";
        }
        // Arkayi ayri tutan sebep parcanin gerekcesine yazilir.
        if (!skirtMerged && (original == "Back" || original == "Center Back")) {
            piece.gerekce = needZip
                ? "arka etek ayri: fermuar CB dikisinde devam eder"  // sayili cumleyi annotate basar
                : "arka etek ayri: arkaya ozel ozellik/kesim (prenses, yirtmac, hem sekli ya da stil)";
        }
    }
    // Halter: shoulders bare by construction — sleeves are impossible, and one
    // bias strip binds every raw edge instead of the neck facings.
    const bool halter = spec.neckline == Neckline::Halter;
    const std::vector<PatternPiece> sleeves = SleeveBlock::draft(
        m, halter ? SleeveStyle::None : spec.sleeveStyle, spec.sleeveLength,
        bodice.armholeLength, bodice.armholeDepth, spec.fabric, spec.sleeveCap);
    const bool sleeveless = sleeves.empty();
    // Neckline + armhole finish: bias binding by default (patch 3.10), facing
    // opt-in, real collar keeps the facing. Halter keeps its dedicated binding.
    const std::vector<PatternPiece> facings = halter
        ? std::vector<PatternPiece>{BodiceBlock::halterBinding(bodice.halterBindingEdgeMM)}
        : edgeFinishPieces(spec, m, "cut 1 on fold, interface", "cut 2, interface",
                           bodice.armholeLength, sleeveless);
    const bool biasNeck = !halter &&
        spec.collarType == static_cast<int>(CollarType::None) &&
        spec.edgeFinish != static_cast<int>(EdgeFinish::Facing);

    // Bias binding uses much less fabric than a facing; a real collar/facing keeps
    // the old facing allowance. Golden dumps subtract whichever was added.
    const double neckFinishMeters = (halter || biasNeck)
        ? BodiceBlock::bindingFabricMeters : BodiceBlock::facingFabricMeters;
    double meters = SkirtBlock::fabricEstimate(m, spec.skirtStyle, spec.skirtLength, shaping, spec.fabric, skirtExtra, spec.skirtLengthMM) + 0.7 + neckFinishMeters;
    if (!sleeves.empty()) meters += spec.sleeveLength == SleeveLength::Long ? 0.7 : 0.4;
    // A sleeveless (non-halter) garment bias-binds both armholes (a real piece in
    // the default finish, a step in the facing finish) — count the self-fabric
    // strip either way (patch 3.13) so the estimate covers what the guide prescribes.
    if (sleeveless && !halter) meters += BodiceBlock::armholeBiasFabricMeters(bodice.armholeLength);
    const bool princess = bodice.frontPrincess || bodice.backPrincess;
    std::vector<std::string> steps{
        "Print and check the 3 cm calibration square before cutting.",
        std::string("This block uses standard assumptions for shoulder slope, underbust") +
            (sleeveless ? "" : " and arm width") +
            " — sew a quick muslin (test version) from cheap fabric first and adjust before cutting your real fabric.",
        std::string("Cut every piece as labelled: pieces marked 'on fold' on the fabric fold, 'cut 2' twice") +
            (sleeveless ? "" : ", sleeves twice") + ".",
    };
    if (halter) {
        if (spec.sleeveStyle != SleeveStyle::None) {
            steps.push_back("A halter has no shoulders to hang a sleeve from — the sleeve choice was skipped.");
        }
        steps.push_back("Staystitch the neckline, the strap edges and the back top edge just inside the seam line — every one of these is a bias-ish raw edge that stretches if you look at it wrong.");
    } else if (biasNeck) {
        steps.push_back("Staystitch the neckline just inside the seam line so it doesn't stretch while you work.");
    } else {
        steps.push_back("Fuse interfacing to the neck facings.");
        steps.push_back("Staystitch the neckline just inside the seam line so it doesn't stretch while you work.");
    }
    if (spec.fabric == Fabric::Knit) {
        steps.insert(steps.begin() + 2,
            "Knit fabric: sew with a narrow zigzag or stretch stitch and a ballpoint/stretch needle so the seams stretch with the fabric.");
    }
    if (princess) {
        steps.push_back("Staystitch the curved princess edges too, for the same reason.");
        steps.push_back("Sew each bodice princess seam: pin center panel to side panel matching the bust notch, sew, clip the side panel's curve over the bust inside the seam allowance, press toward the center.");
        if (!bodice.frontPrincess || !bodice.backPrincess) {
            steps.push_back("Sew the remaining waist darts (where a panel wasn't split), pressing toward the center.");
        }
    } else {
        steps.push_back("Sew all darts first, pressing toward the center.");
    }
    if (halter) {
        // No shoulder seams; one bias strip binds neckline, straps, sweep and
        // back top edge. Ends stay free at the CB for the zipper, like facings.
        steps.push_back("Sew the bodice side seams.");
        steps.push_back("Sew the bias strip ends together as needed and press it in half lengthwise along the marked fold line.");
        steps.push_back(std::string("Bind the raw edges with the bias strip in one continuous run where you can — up one strap, around the neckline, up the other strap, then each underarm sweep and the back top edge") +
            (needZip ? " — leaving the last 2 cm free at each center back edge (the zipper goes there later)" : "") +
            ". Stretch the binding VERY slightly on the inner curves so it lies flat; trim the excess as you go.");
        steps.push_back("Run a stay tape or clear elastic inside the back top edge binding so the low back hugs the body instead of gaping.");
        steps.push_back("Close the straps at the nape: try the dress on, pin the strap ends to length, then sew hooks (or a button) — or extend the binding into ties if you prefer a tied halter.");
    } else if (biasNeck) {
        steps.push_back("Sew the bodice shoulder seams and press them open.");
        steps.push_back("Prepare the neckline bias strip: join the ends as needed and press it in half lengthwise along the marked fold line.");
        steps.push_back(std::string("Bind the neckline with the bias strip, right sides together and raw edges even") +
            (needZip ? ", leaving the last 2 cm free at each center back edge (the zipper goes there later)" : "") +
            ". Ease the strip gently around the curves. Trim to 6 mm, turn the folded edge to the inside and topstitch or slipstitch it down.");
        steps.push_back("Sew the bodice side seams.");
        if (sleeveless) {
            steps.push_back("Finish each armhole the same way with its bias strip: press it in half, bind the armhole right sides together, ease around the curve, then turn and topstitch it to the inside.");
        }
    } else {
        steps.push_back("Sew the bodice shoulder seams and press them open.");
        steps.push_back("Sew the front and back neck facings together at the shoulders; finish the facing's outer edge (zigzag, overlock or turn 5 mm and stitch).");
        steps.push_back(std::string("Attach the facing to the neckline right sides together") +
            (needZip ? ", leaving the last 2 cm free at each center back edge (the zipper goes there later)" : "") +
            ". Trim to 6 mm, clip into the curve every 2 cm.");
        steps.push_back("Understitch: press the seam allowance toward the facing and stitch it to the facing 2 mm from the seam — this keeps the facing rolled inside. Turn, press, tack at the shoulder seams.");
        steps.push_back("Sew the bodice side seams.");
        if (sleeveless) {
            steps.push_back("Finish each armhole with a self-cut bias strip: cut a 3 cm wide strip on the bias from the leftover fabric (the fabric estimate already includes it), bind the armhole edge and topstitch it to the inside.");
        }
    }
    if (spec.skirtStyle == SkirtStyle::Gathered) {
        steps.push_back("Gather the skirt panels along the marked line until they match the bodice waist.");
    }
    if (spec.skirtStyle == SkirtStyle::Pleated) {
        steps.push_back("Form the knife pleats along the marked line pairs (fold on the second line of each pair, bring it to the first, all pleats toward the center), baste across the top and press.");
    }
    if (spec.skirtStyle == SkirtStyle::HalfCircle) {
        steps.push_back(std::string("Place the two skirt panel seams at center front and center back (cut the panels flat, not on fold)") +
            (needZip ? " so the zipper can continue into the back seam." : "."));
    }
    if (princess && (spec.skirtStyle == SkirtStyle::ALine || spec.skirtStyle == SkirtStyle::Straight)) {
        steps.push_back("Sew each skirt gore seam (center panel to side panel, matching the tip notch), pressing toward the center.");
    }
    steps.push_back(std::string(needZip
            ? "Sew the skirt seams (leave the center back seam open where the zipper will go), then join bodice to skirt at the "
            : "Sew the skirt seams, then join bodice to skirt at the ") +
        (empire ? "underbust seam (the empire line sits right under the bust)" : "waist seam") + ", matching side seams" +
        std::string(princess ? " and lining the gore seams up with the bodice princess seams as closely as possible" : "") + ".");
    if (needZip) {
        steps.push_back(std::string("Insert an invisible zipper in the center back through bodice and skirt: install the zipper BEFORE closing the seam below it, then close the rest of the seam.") +
            (spec.fabric == Fabric::Knit ? " (Very stretchy knit? Baste the back seam closed first and test pulling the dress on — you may be able to skip the zipper and just sew the seam.)" : ""));
        steps.push_back(std::string("Fold the free ") + ((halter || biasNeck) ? "binding" : "facing") +
            " ends back over the zipper tape and hand-tack them down so the edge sits clean against the zipper.");
    } else {
        // F5-parca: no zipper, and the guide says WHY with the measured number
        // instead of silently dropping the step (gecis.gerekce carries it).
        steps.push_back("No zipper: this dress pulls on over the head — the measured opening clears the head reference (" +
            gecis.gerekce + "). Sew the center back seam fully closed.");
    }
    if (!sleeveless) {
        if (spec.sleeveCap == SleeveCap::Cap) {
            steps.push_back("Cap sleeve: this is a short wing, not a full sleeve — there is no underarm seam to sew. Finish the outer (curved) edge with a narrow hem or bias facing, then ease the cap edge into the armhole between the notches exactly like a set-in sleeve and stitch it in. The wing simply covers the top of the shoulder and stops at the underarm.");
        } else {
            steps.push_back("Sew each sleeve seam. Run gathering stitches between the cap notches, ease the cap into the armhole and set the sleeves in.");
            if (spec.sleeveCap != SleeveCap::Plain) {
                // M1-puf: the old sentence described the DELETED hand-drawn crown
                // markings ("between the two crown notches ... the length below the
                // notches matches the armhole 1:1"). That is no longer what the
                // engine draws: the WHOLE cap edge is gathered, by the buzgu
                // operator, at the measured Bugra ratio, and the gather marks are
                // stamped along that edge. The guide now says what the piece is.
                steps.push_back(std::string("Puff/gathered head (buzgu): the whole cap edge is drawn ") +
                    std::to_string(static_cast<long>(std::lround((SleeveBlock::capBuzguRatio(spec.sleeveCap) - 1) * 1000) / 10)) + "." +
                    std::to_string(static_cast<long>(std::lround((SleeveBlock::capBuzguRatio(spec.sleeveCap) - 1) * 1000) % 10)) +
                    "% longer than the armhole it goes into — that surplus is GATHERED, not eased. Run two rows of gathering along the cap edge, draw them up until the cap measures the armhole, and distribute the fullness evenly between the gather marks so it " +
                    (spec.sleeveCap == SleeveCap::Puffed ? "stands up over the shoulder" : "sits as a soft gather") + ". Then set the sleeve in as usual.");
            }
        }
        if (spec.sleeveStyle == SleeveStyle::Balloon) {
            steps.push_back("Gather the sleeve hem along the marked line and attach the interfaced cuffs.");
        }
    }
    if (spec.skirtStyle == SkirtStyle::HalfCircle) {
        steps.push_back("Let the dress hang for 24 hours before hemming — bias areas drop. Then trim even and hem narrow.");
    } else {
        steps.push_back("Try it on, then hem with a 2 cm double fold.");
    }

    const std::string sleeveWord = halter
        ? "halter "
        : (spec.sleeveStyle == SleeveStyle::None ? "" : std::string(title(spec.sleeveStyle)) + "-sleeve ");

    DraftedPattern pattern;
    pattern.garment = empire
        ? (spec.skirtStyle == SkirtStyle::Gathered
               ? sleeveWord + "babydoll dress"
               : "empire " + std::string(title(spec.skirtStyle)) + " " + sleeveWord + "dress")
        : std::string(title(spec.skirtStyle)) + " " + sleeveWord + "dress";
    pattern.pieces = {bodice.front};
    if (bodice.frontPrincess) pattern.pieces.push_back(bodice.frontSide);
    pattern.pieces.push_back(bodice.back);
    if (bodice.backPrincess) pattern.pieces.push_back(bodice.backSide);
    pattern.pieces.insert(pattern.pieces.end(), facings.begin(), facings.end());
    pattern.pieces.insert(pattern.pieces.end(), skirtPieces.begin(), skirtPieces.end());
    pattern.pieces.insert(pattern.pieces.end(), sleeves.begin(), sleeves.end());
    // F5-parca: the donning decision + its sentence ride on the pattern; the
    // annotate pass stamps the glyph and the gerekce from HERE (single source).
    pattern.cbZipper = needZip;
    pattern.cbZipperGerekce = gecis.gerekce;
    pattern.fabricAdviceKey = "dress";
    pattern.fabricMeters140 = roundToPlaces(meters, 1);
    pattern.guideSteps = steps;
    // A dress bodice front ENDS at the waist (its bottom edge IS the waist seam,
    // where the skirt joins); the only fabric below the natural-waist line is the
    // front-balance drop, which is part of that waist seam, not a separate band. So
    // a dress never carries a below-waist Front Body — leave cupSeamWaistBelowApex
    // at 0 and the cup seam produces just Upper + Lower cup (the skirt is the piece
    // below the waist). Only a top that EXTENDS through the waist gets a Front Body.
    return pattern;
}

} // namespace DressBlock

namespace TopBlock {

// Sewing-guide step builder, extracted VERBATIM from draft() (2026-07-28) so
// the recipe path (RECETE-SPEC §6) emits the exact same guide text through the
// exact same code — no duplicated strings to drift. waistEnds = extra == 0.
std::vector<std::string> guide(const GarmentSpec& spec, bool halter, bool biasNeck,
                               bool sleeveless, bool frontPrincess, bool backPrincess,
                               bool waistEnds) {
    const bool princess = frontPrincess || backPrincess;
    std::vector<std::string> steps{
        "Print and check the 3 cm calibration square before cutting.",
        "This block uses standard assumptions for shoulder slope and underbust — sew a quick muslin first and adjust before cutting your real fabric.",
        std::string("Cut every piece as labelled ('on fold' on the fabric fold, 'cut 2' twice)") +
            (sleeveless ? "" : ", sleeves twice") +
            (halter ? ". The neck strap closes at the nape, so this top slips on without a head-opening worry."
                    : ". Check the neck opening against your head circumference — a top has no zipper, it must slip over your head."),
    };
    if (halter) {
        if (spec.sleeveStyle != SleeveStyle::None) {
            steps.push_back("A halter has no shoulders to hang a sleeve from — the sleeve choice was skipped.");
        }
        steps.push_back("Staystitch the neckline, the strap edges and the back top edge just inside the seam line — every one of these is a bias-ish raw edge that stretches if you look at it wrong.");
    } else if (biasNeck) {
        steps.push_back("Staystitch the neckline just inside the seam line so it doesn't stretch while you work.");
    } else {
        steps.push_back("Fuse interfacing to the neck facings.");
        steps.push_back("Staystitch the neckline just inside the seam line so it doesn't stretch while you work.");
    }
    if (spec.fabric == Fabric::Knit) {
        steps.insert(steps.begin() + 2,
            "Knit fabric: sew with a narrow zigzag or stretch stitch and a ballpoint/stretch needle so the seams stretch with the fabric.");
    }
    if (princess) {
        steps.push_back("Sew each princess seam: pin center panel to side panel matching the bust notch, sew from armhole to hem in one pass, clip the curve over the bust inside the seam allowance, press toward the center.");
        if (!frontPrincess || !backPrincess) {
            steps.push_back(waistEnds
                ? "Sew the remaining waist darts (where a panel wasn't split), pressing toward the center."
                : "The unsplit half has no waist shaping below the bust — that is expected at this intake.");
        }
    } else if (waistEnds) {
        steps.push_back("Sew the waist darts, pressing toward the center.");
    }
    if (halter) {
        steps.push_back("Sew the side seams.");
        steps.push_back("Press the bias strip in half lengthwise along the marked fold line.");
        steps.push_back("Bind the raw edges with the bias strip in one continuous run where you can — up one strap, around the neckline, up the other strap, then each underarm sweep and the back top edge. Stretch the binding VERY slightly on the inner curves so it lies flat; trim the excess as you go.");
        steps.push_back("Run a stay tape or clear elastic inside the back top edge binding so the low back hugs the body instead of gaping.");
        steps.push_back("Close the straps at the nape: try it on, pin the strap ends to length, then sew hooks (or a button) — or extend the binding into ties.");
    } else if (biasNeck) {
        steps.push_back("Sew the shoulder seams and press them open.");
        steps.push_back("Prepare the neckline bias strip: join the ends as needed and press it in half lengthwise along the marked fold line.");
        steps.push_back("Bind the neckline with the bias strip, right sides together and raw edges even, easing the strip gently around the curves. Trim to 6 mm, turn the folded edge to the inside and topstitch or slipstitch it down.");
        steps.push_back("Sew the side seams.");
    } else {
    steps.push_back("Sew the shoulder seams and press them open.");
    steps.push_back("Sew the front and back neck facings together at the shoulders; finish the facing's outer edge (zigzag, overlock or turn 5 mm and stitch).");
    steps.push_back("Attach the facing to the neckline right sides together, sewing exactly on the seam line. Trim to 6 mm, clip into the curve every 2 cm.");
    steps.push_back("Understitch: press the seam allowance toward the facing and stitch it to the facing 2 mm from the seam — this is what keeps the facing rolled inside. Turn, press, and tack the facing down at the shoulder seams.");
    steps.push_back("Sew the side seams.");
    }
    if (halter) {
        // binding covered the armhole sweeps above; nothing to add
    } else if (sleeveless && biasNeck) {
        steps.push_back("Finish each armhole with its bias strip: press it in half, bind the armhole right sides together, ease around the curve, then turn and topstitch it to the inside.");
    } else if (sleeveless) {
        steps.push_back("Finish each armhole with a self-cut bias strip: cut a 3 cm wide strip on the bias from the leftover fabric (the fabric estimate already includes it), bind the armhole edge and topstitch it to the inside.");
    } else {
        if (spec.sleeveCap == SleeveCap::Cap) {
            steps.push_back("Cap sleeve: this is a short wing, not a full sleeve — there is no underarm seam to sew. Finish the outer (curved) edge with a narrow hem or bias facing, then ease the cap edge into the armhole between the notches exactly like a set-in sleeve and stitch it in. The wing simply covers the top of the shoulder and stops at the underarm.");
        } else {
            steps.push_back("Sew each sleeve seam, ease the cap between the notches and set the sleeves in.");
            if (spec.sleeveCap != SleeveCap::Plain) {
                // M1-puf: the old sentence described the DELETED hand-drawn crown
                // markings ("between the two crown notches ... the length below the
                // notches matches the armhole 1:1"). That is no longer what the
                // engine draws: the WHOLE cap edge is gathered, by the buzgu
                // operator, at the measured Bugra ratio, and the gather marks are
                // stamped along that edge. The guide now says what the piece is.
                steps.push_back(std::string("Puff/gathered head (buzgu): the whole cap edge is drawn ") +
                    std::to_string(static_cast<long>(std::lround((SleeveBlock::capBuzguRatio(spec.sleeveCap) - 1) * 1000) / 10)) + "." +
                    std::to_string(static_cast<long>(std::lround((SleeveBlock::capBuzguRatio(spec.sleeveCap) - 1) * 1000) % 10)) +
                    "% longer than the armhole it goes into — that surplus is GATHERED, not eased. Run two rows of gathering along the cap edge, draw them up until the cap measures the armhole, and distribute the fullness evenly between the gather marks so it " +
                    (spec.sleeveCap == SleeveCap::Puffed ? "stands up over the shoulder" : "sits as a soft gather") + ". Then set the sleeve in as usual.");
            }
        }
        if (spec.sleeveStyle == SleeveStyle::Balloon) {
            steps.push_back("Gather the sleeve hem along the marked line and attach the interfaced cuffs.");
        }
    }
    steps.push_back("Hem with a 2 cm double fold.");
    return steps;
}

DraftedPattern draft(const GarmentSpec& spec, const BodyMeasurementsSnapshot& m) {
    const double extra = belowWaist(spec.topLength);
    const double hipHalfQuarter = (m.hipMM() / 4) * 1.04;
    // Princess panels extend through the waist inside the bodice block and
    // stay fitted; dart-mode pieces use the classic (boxy) hem extension.
    BodiceBlock::BodiceOptions options;
    options.neckline = spec.neckline;
    options.shaping = resolveShaping(spec, m);
    options.fabric = spec.fabric;
    options.extendBelowWaist = extra;
    options.hipHalfQuarter = hipHalfQuarter;
    // Dropped shoulder reshapes the armhole (Set/Raglan untouched; halter has no
    // shoulder seam). Raglan is a post-pass in GarmentDrafter::draft.
    if (spec.neckline != Neckline::Halter &&
        static_cast<ShoulderStyle>(spec.shoulderStyle) == ShoulderStyle::Dropped)
        options.shoulderStyle = ShoulderStyle::Dropped;
    // Sleeveless: cut the scye in slightly so the bare-shoulder edge hugs the
    // body (a real sleeveless armhole). A set-in sleeve keeps the full armhole so
    // the cap seats. Halter has its own bare-shoulder frame.
    options.sleeveless = spec.neckline != Neckline::Halter &&
                         spec.sleeveStyle == SleeveStyle::None;
    // Bugra corset (cupSeam == Bugra): the corset BASE draft differs — zero
    // wearing ease and the princess seams moved to the Buğra style positions
    // (front toward the side, back toward the fold). Gated on the same cheap
    // class checks the post-pass enforces, so a host the pass would refuse is
    // never silently drafted corset-tight. Default (None/Horizontal) leaves the
    // options untouched — byte-identical.
    if (spec.cupSeam == static_cast<int>(CupSeam::Bugra) &&
        options.shaping == Shaping::Princess && extra > 0 &&
        spec.neckline != Neckline::Halter &&
        CupSeamBlock::isStraplessBustierClass(spec.neckline, spec.sleeveStyle,
                                              spec.sleeveCap == SleeveCap::Cap)) {
        options.corsetEase = true;
        options.corsetChestEase = CupSeamBlock::bugra::corsetChestEase;
        options.corsetWaistEase = CupSeamBlock::bugra::corsetWaistEase;
        options.princessShareFront = CupSeamBlock::bugra::frontPrincessShare;
        options.princessShareBack = CupSeamBlock::bugra::backPrincessShare;
        // The corset hem sits at the HIGH hip (hemBelowWaistMM under the waist),
        // so the below-waist panels aim at the interpolated high-hip girth, not
        // the full-hip flare (200 = the drafting hip-blend depth the panels
        // flare over, see bodice.cpp hipBlendDepth). Zero ease, like the rest
        // of the corset.
        options.hipHalfQuarter =
            (m.waistMM() +
             (m.hipMM() - m.waistMM()) * (CupSeamBlock::bugra::hemBelowWaistMM / 200.0)) / 4.0;
    }
    // Bugra Locket (locketTop == Bugra): the Locket BASE draft moves the side
    // seam toward the BACK (measured off the purchased size-36 pieces: front
    // half wider, back half narrower than the even bust/4 split). Gated on the
    // same cheap class checks the post-pass enforces, so a host the pass would
    // refuse is never silently drafted with a walked seam. Default (None)
    // leaves the options untouched — byte-identical.
    if (spec.locketTop == static_cast<int>(LocketTop::Bugra) &&
        options.shaping == Shaping::Dart &&
        LocketBlock::isLocketHost(spec)) {
        options.sideSeamShiftMM = LocketBlock::bugra::sideSeamShiftMM;
    }
    const BodiceDraft bodice = BodiceBlock::draft(m, options);

    std::vector<PatternPiece> tops;
    if (bodice.frontPrincess) {
        PatternPiece center = bodice.front;
        center.name = replaceBodice(center.name);
        PatternPiece side = bodice.frontSide;
        side.name = replaceBodice(side.name);
        tops.push_back(center);
        tops.push_back(side);
    } else {
        tops.push_back(extendPiece(bodice.front, bodice.frontPieceWaistY, bodice.frontPieceLength, extra, hipHalfQuarter));
    }
    if (bodice.backPrincess) {
        PatternPiece center = bodice.back;
        center.name = replaceBodice(center.name);
        PatternPiece side = bodice.backSide;
        side.name = replaceBodice(side.name);
        tops.push_back(center);
        tops.push_back(side);
    } else {
        tops.push_back(extendPiece(bodice.back, bodice.backPieceWaistY, bodice.backPieceLength, extra, hipHalfQuarter));
    }
    const bool halter = spec.neckline == Neckline::Halter;
    const std::vector<PatternPiece> sleeves = SleeveBlock::draft(
        m, halter ? SleeveStyle::None : spec.sleeveStyle, spec.sleeveLength,
        bodice.armholeLength, bodice.armholeDepth, spec.fabric, spec.sleeveCap);
    const bool sleeveless = sleeves.empty();
    // Neckline + armhole finish: bias binding by default (patch 3.10), facing
    // opt-in, real collar keeps the facing. Halter keeps its dedicated binding.
    const std::vector<PatternPiece> facings = halter
        ? std::vector<PatternPiece>{BodiceBlock::halterBinding(bodice.halterBindingEdgeMM)}
        : edgeFinishPieces(spec, m, "cut 1 on fold, interface", "cut 2, interface",
                           bodice.armholeLength, sleeveless);
    const bool biasNeck = !halter &&
        spec.collarType == static_cast<int>(CollarType::None) &&
        spec.edgeFinish != static_cast<int>(EdgeFinish::Facing);

    const double neckFinishMeters = (halter || biasNeck)
        ? BodiceBlock::bindingFabricMeters : BodiceBlock::facingFabricMeters;
    double meters = (bodice.frontLength + extra) * 2 * 1.15 / 1000 + neckFinishMeters;
    if (!sleeves.empty()) meters += spec.sleeveLength == SleeveLength::Long ? 0.7 : 0.4;
    // Sleeveless (non-halter): both armholes are bias-bound — count the strip
    // (patch 3.13), whether the finish is the default bias piece or the facing step.
    if (sleeveless && !halter) meters += BodiceBlock::armholeBiasFabricMeters(bodice.armholeLength);
    std::vector<std::string> steps = guide(spec, halter, biasNeck, sleeveless,
                                           bodice.frontPrincess, bodice.backPrincess,
                                           /*waistEnds=*/extra == 0);

    const std::string sleeveWord =
        spec.sleeveStyle == SleeveStyle::None ? "" : std::string(" ") + title(spec.sleeveStyle) + "-sleeve";

    DraftedPattern pattern;
    pattern.garment = std::string(raw(spec.topLength)) + sleeveWord + " top";
    pattern.pieces = tops;
    pattern.pieces.insert(pattern.pieces.end(), facings.begin(), facings.end());
    pattern.pieces.insert(pattern.pieces.end(), sleeves.begin(), sleeves.end());
    pattern.fabricAdviceKey = "top";
    pattern.fabricMeters140 = roundToPlaces(meters, 1);
    pattern.guideSteps = steps;
    // Measured apex->waist drop for the opt-in cup seam: the drafted natural-waist Y
    // minus the drafted apex Y, in the un-rebased center-panel frame (a frame-
    // invariant offset that survives each piece's local rebase). Only set it when
    // the top actually EXTENDS through the waist (extra > 0 — a hip/tunic top): then
    // the cup seam's second cut yields a real Front Body from the waist to the hem.
    // A cropped top ends at the waist (extra == 0), so it stays Upper + Lower cup;
    // the only fabric below the natural-waist line there is the front-balance drop,
    // not a Front Body band. bodice.front is the un-rebased center panel.
    if (extra > 0 && bodice.frontPrincess && !bodice.front.markings.empty())
        pattern.cupSeamWaistBelowApex =
            bodice.frontPieceWaistY - bodice.front.markings[0].to.y;
    // Measured armhole frame, carried out for the opt-in Locket sleeve post-pass
    // (metadata only — never serialized, golden dump unchanged).
    pattern.sleeveArmholeLenMM = bodice.armholeLength;
    pattern.sleeveArmholeDepthMM = bodice.armholeDepth;
    return pattern;
}

} // namespace TopBlock

namespace GarmentDrafter {

DraftedPattern draft(const GarmentSpec& spec, const BodyMeasurementsSnapshot& m) {
    DraftedPattern pattern;
    switch (spec.garment) {
        case GarmentType::Skirt:
            pattern = SkirtBlock::draft(m, spec.skirtStyle, spec.skirtLength, resolveShaping(spec, m), spec.fabric,
                                        spec.skirtLengthMM);
            break;
        case GarmentType::Dress:
            pattern = DressBlock::draft(spec, m);
            break;
        case GarmentType::Top:
            pattern = TopBlock::draft(spec, m);
            break;
    }
    // Opt-in shoulder/sleeve-join style (patch 3.13). Dropped shoulder already
    // reshaped the armhole inside the bodice draft above; here we (a) note the
    // dropped shoulder in the guide and (b) run the RAGLAN post-pass, which draws
    // the diagonal raglan seam on the front/back and converts the set-in sleeve
    // into a raglan sleeve. Set → nothing runs (byte-identical). A halter is
    // skipped for both (no shoulder seam). Not on a skirt (no bodice).
    if (spec.garment != GarmentType::Skirt && spec.neckline != Neckline::Halter) {
        const ShoulderStyle ss = static_cast<ShoulderStyle>(spec.shoulderStyle);
        if (ss == ShoulderStyle::Dropped) {
            pattern.guideSteps.insert(
                pattern.guideSteps.begin() + 1,
                "Dropped shoulder: the shoulder seam runs past your natural shoulder "
                "onto the arm and the armhole sits lower and wider, so the sleeve hangs "
                "with a soft, relaxed head instead of a tailored set-in crown — this is "
                "already drawn into the shoulder and armhole.");
        } else if (ss == ShoulderStyle::Raglan) {
            const double armholeDepth = m.backLengthMM() * 0.44;
            ShoulderBlock::applyRaglan(pattern, armholeDepth, m.shoulderCM * 10);
        }
    }
    // Opt-in keyhole: a teardrop opening below the front neckline. Post-pass
    // like the ruffle, so the base draft is byte-identical with it off.
    if (spec.keyhole &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        KeyholeBlock::apply(pattern);
    }
    // Neckline extensions (patch 3.16): Cowl re-marks the front to cut on the
    // bias with drape excess; PussyBow adds a high neck band + a long self-lined
    // tie strip (band trued to the neckline). Post-pass keyed on the Neckline
    // enum — for the 7 original necklines apply() does nothing, so the base draft
    // is byte-identical. Cowl/PussyBow only touch dress/top necklines.
    if ((spec.neckline == Neckline::Cowl || spec.neckline == Neckline::PussyBow) &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        NecklineExtBlock::apply(pattern, spec.neckline, m.neckCM);
    }
    // Opt-in front button placket (düğme patı): grown-on button stand + fold line
    // + buttons/buttonholes on the front. Post-pass on the finished front piece,
    // so the base draft is byte-identical with it off. The bust level is read
    // from the piece's own apex notch inside PlacketBlock (0 = "use the notch /
    // fall back to the run midpoint").
    // R1.2: an ASYMMETRIC placket (placketStyle == Asymmetric) carries the closure
    // off center. It draws even when frontPlacket is false; a Standard placket (or
    // the legacy bool) draws the symmetric CF stand (offset 0 → byte-identical).
    const bool asymPlacket = spec.placketStyle == static_cast<int>(PlacketStyle::Asymmetric);
    const bool stdPlacket = spec.frontPlacket ||
                            spec.placketStyle == static_cast<int>(PlacketStyle::Standard);
    if ((stdPlacket || asymPlacket) &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        PlacketBlock::apply(pattern, 0.0, asymPlacket ? PlacketBlock::asymOffset : 0.0);
    }
    // Opt-in true wrap / surplice front (kruvaze / surplice ön): reshapes the
    // FRONT bodice panel into a crossed double front — the CF edge is extended past
    // the center front into a diagonal wrap edge, the panel is cut 2 mirror-image,
    // and the two fronts lap over each other at CF (the wrap-dress family). Post-
    // pass on the finished draft, so the base is byte-identical with it off
    // (wrapFront == None). Only a dress/top bodice front hosts one; a skirt is
    // refused honestly. Runs BEFORE the tie pass so a composed wrap-front tie lands
    // its placement notch on the ALREADY-reshaped front, and BEFORE the cutting-line
    // offset so the wrapped edge gets its own cut line. The wrap allowance scales
    // from the drafted front quarter (bust/4, like the patch pocket).
    if (spec.wrapFront != static_cast<int>(WrapFront::None) &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        WrapFrontBlock::apply(pattern, static_cast<WrapFront>(spec.wrapFront), m.bustMM() / 4.0);
    }
    // Opt-in fabric ties / sash / bow (bağ / kuşak / fiyonk, Loop 4b): adds
    // separate tie pieces + a placement notch. Post-pass on the finished draft,
    // so the base is byte-identical with it off (tieClosure == None). Only
    // simple applied ties are drawn — drawstring-gathered types stay honest.
    if (spec.tieClosure != static_cast<int>(TiePlacement::None)) {
        TieBlock::apply(pattern, static_cast<TiePlacement>(spec.tieClosure), m.waistMM());
    }
    // Opt-in collar family (yaka, Loop 7/8): stand/mock band or flat/peter-pan/
    // shirt collar as a SEPARATE piece, neck edge trued to the neckline. Post-pass
    // on the finished draft, so the base is byte-identical with it off
    // (collarType == None). Bias-bound/knit/grown-on bands stay honest (missing.js).
    if (spec.collarType != static_cast<int>(CollarType::None) &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        CollarBlock::apply(pattern, static_cast<CollarType>(spec.collarType),
                           static_cast<CollarEdge>(spec.collarEdge));
    }
    // Opt-in drawstring / shirred / smocked gathering (büzgü, Loop 8): adds a
    // separate gathered panel (+ a drawstring cord when drawstring) whose
    // gathered edge is trued to the drafted zone edge. Post-pass on the finished
    // draft, so the base is byte-identical with it off (gatherType == None).
    // A fully smocked couture panel with shaped honeycomb stays approximate.
    if (spec.gatherType != static_cast<int>(GatherType::None) &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        GatherBlock::apply(pattern, static_cast<GatherType>(spec.gatherType),
                           static_cast<GatherZone>(spec.gatherZone));
    }
    // Opt-in open-back cutout (açık sırt oyuğu, Loop 9b): a shaped opening in the
    // back center piece + a facing whose inner edge is trued to the opening.
    // Post-pass on the finished draft, so the base is byte-identical with it off
    // (backOpening == None). Coexists with a tie-back (the tie draws the closure,
    // this draws the opening it fastens over) — both can be on the same garment.
    if (spec.backOpening != static_cast<int>(BackOpening::None) &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        OpenBackBlock::apply(pattern, static_cast<BackOpening>(spec.backOpening));
    }
    // Opt-in corset lace-up back (korse bağcıklı sırt): a CB facing strip on each
    // back edge + two trued eyelet columns + a lacing cord — an eyelet-laced,
    // open-gap, ADJUSTABLE back closure (the two back halves don't meet). Post-pass
    // on the finished draft, so the base is byte-identical with it off (laceUpBack
    // == None). Only a fitted (princess/dart) bodice back on a dress/top hosts one;
    // a skirt or loose/gathered back is refused honestly. The open laced gap is a
    // real donning opening, so the CB zipper is suppressed below (opensForDonning).
    if (spec.laceUpBack != static_cast<int>(LaceUpBack::None) &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        LaceUpBackBlock::apply(pattern, static_cast<LaceUpBack>(spec.laceUpBack));
    }
    // Opt-in back hem slit / walking vent (arka etek yırtmacı, Loop M1): a walking
    // opening up the center-back seam of the back skirt/dress piece. Post-pass on
    // the finished draft, so the base is byte-identical with it off (backSlit ==
    // None). Only a straight/A-line skirt (or dress skirt) hosts a CB vent —
    // gathered/pleated/half-circle skirts have walking ease already and are gated
    // out here (SlitBlock also skips honestly if it finds no CB seam candidate).
    if (spec.backSlit != static_cast<int>(HemSlit::None) &&
        (spec.garment == GarmentType::Skirt || spec.garment == GarmentType::Dress) &&
        (spec.skirtStyle == SkirtStyle::Straight || spec.skirtStyle == SkirtStyle::ALine)) {
        SlitBlock::apply(pattern, static_cast<HemSlit>(spec.backSlit));
    }
    // Opt-in ruffled shoulder straps (fırfırlı askı, queue #3): a gathered
    // self-fabric frill strip drawn as a separate pair + a placement notch at each
    // shoulder point. Post-pass on the finished draft, so the base is byte-identical
    // with it off (ruffledStraps == None). Only a sleeveless dress/top carries one
    // (StrapBlock skips honestly if it finds a sleeve or no top edge).
    if (spec.ruffledStraps != static_cast<int>(StrapStyle::None) &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        StrapBlock::apply(pattern, static_cast<StrapStyle>(spec.ruffledStraps));
    }
    // Opt-in peplum (bele takılan volan, R1.1): a flat circular/part-circular
    // flare hung from the waist as a separate piece, inner arc trued to the
    // finished waist (m.waistMM(), passed like the tie sash). Post-pass on the
    // finished draft, so the base is byte-identical with it off (peplum == None).
    // Only a waisted bodice/top hosts one (PeplumBlock skips honestly if it finds
    // no front+back body). A pleated/gathered/draped peplum stays honest.
    if (spec.peplum != static_cast<int>(PeplumStyle::None) &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        PeplumBlock::apply(pattern, static_cast<PeplumStyle>(spec.peplum), m.waistMM());
    }
    // Opt-in all-around hem flounce (etek ucu volanı — dropped-waist tiered look):
    // a gathered flounce strip hung from the WHOLE hem (front + back), the last
    // remaining partial flat. NOT a peplum (waist) or a back-neck flounce (nape).
    // The flat gathered edge is trued to the finished hem MEASURED off the drafted
    // front + back bottom edges. Post-pass on the finished draft, so the base is
    // byte-identical with it off (hemFlounce == None). Only a dress/top with a real
    // hosting hem carries one (HemFlounceBlock skips honestly if it finds no
    // measurable hem). A gathered/flared skirt already ripples and is refused.
    if (spec.hemFlounce != static_cast<int>(HemFlounce::None) &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        HemFlounceBlock::apply(pattern, static_cast<HemFlounce>(spec.hemFlounce));
    }
    // Opt-in pocket (cep, patch 3.12): a PATCH pocket (separate piece + placement
    // mark) or a SIDE-SEAM in-seam pocket (two bag pieces + a mouth mark). Post-
    // pass on the finished draft, so the base is byte-identical with it off
    // (pocketStyle == None). The patch is sized/trued to the measured front-panel
    // width (a quarter of the bust girth — the drafted front quarter); the side-
    // seam bag measures its own host seam. Welt/besom/cargo stay honest.
    if (spec.pocketStyle != static_cast<int>(PocketStyle::None)) {
        PocketBlock::apply(pattern, static_cast<PocketStyle>(spec.pocketStyle),
                           m.bustMM() / 4.0);
    }
    // Opt-in cup seam (kup dikişi — Corset Bustier): splits the princess FRONT
    // panel(s) into an Upper Cup + a Lower Cup along a HORIZONTAL seam through the
    // bust apex — the strapless/sweetheart bustier construction the motor was
    // missing. Post-pass on the finished draft (the princess front is already
    // drawn), so the base draft is byte-identical with it off (cupSeam == None).
    // The seam y is READ from the panel's own apex notch (can't drift), and the
    // two new cut edges are the same horizontal line (length-matched by
    // construction). Only a princess-seamed sweetheart/strapless front hosts one;
    // any other host is refused honestly. Runs BEFORE the cutting-line offset so
    // each cup gets its own cut line. Moulded/foam/boned cups stay honest.
    if (spec.cupSeam != static_cast<int>(CupSeam::None) &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        // The strapless-bustier class needs the sleeve context: a cap sleeve
        // (SleeveCap::Cap) is a weightless wing and still counts as strapless; any
        // real set-in/straight/balloon sleeve is a shoulder-carried bodice and is
        // refused. The block decides the whole class rule (isStraplessBustierClass).
        const bool capSleeve = spec.sleeveCap == SleeveCap::Cap;
        // backWaistY: the drafted natural-waist level in the back-panel frame
        // (the back is drawn un-shifted for every non-halter draft, so the body
        // frame IS the piece frame). Only the Bugra corset variant reads it.
        CupSeamBlock::apply(pattern, static_cast<CupSeam>(spec.cupSeam), spec.neckline,
                            spec.sleeveStyle, capSleeve, pattern.cupSeamWaistBelowApex,
                            m.backLengthMM());
    }
    // Opt-in Bugra Locket Top construction (locketTop == Bugra): rebuilds the
    // waist-length buttoned dart top as the purchased Locket's six pieces —
    // Front Body (big cut-open side bust dart), fold-cut Back Body, the
    // TWO-PIECE gathered puff-band sleeve (Upper + Lower Sleeve) and the
    // crescent Collar + Collar Lining already drawn by the collar block, with
    // the neck facings consumed (the collar finishes the neck, as the purchased
    // pattern does). Post-pass on the finished draft, so the base is
    // byte-identical with it off (locketTop == None); any non-Locket host is
    // refused honestly inside the block. Runs BEFORE the cutting-line offset so
    // every rebuilt piece gets its own cut line. See locket.hpp.
    if (spec.locketTop != static_cast<int>(LocketTop::None) &&
        spec.garment == GarmentType::Top) {
        LocketBlock::apply(pattern, spec, m);
    }
    // Opt-in yoke split (roba — doll / babydoll / swing dress): splits the FRONT and
    // BACK bodice panels along a HORIZONTAL seam high on the chest into a Yoke (the
    // shoulder panel) + a lower body that flares from the yoke seam — the doll-dress
    // construction the motor was missing (the highest-frequency gap over 23 flats).
    // Post-pass on the finished draft (the bodice panels are already drawn), so the
    // base draft is byte-identical with it off (yoke == None). The seam y is MEASURED
    // off each panel's own drawn shoulder-to-hem drop (can't drift), and the two new
    // cut edges are the same horizontal line (length-matched by construction). Only a
    // dress/top with a bodice front/back hosts one; any other host is refused
    // honestly. Runs BEFORE the cutting-line offset so each new piece gets its own cut
    // line. A gathered-below yoke stays approximate (Plain draws the plain seam).
    if (spec.yoke != static_cast<int>(Yoke::None) &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        YokeBlock::apply(pattern, static_cast<Yoke>(spec.yoke));
    }
    // Opt-in center inverted box pleat (orta ters kutu pili): the first LOCALIZED
    // fullness — a SINGLE fold at the center front, not the distributed gather the
    // engine already has. Widens the CF-foldable front panel by a fixed pleat
    // underlay folded behind, so the finished (pressed) width equals the original.
    // Unlocks the swing / doll top (yoke + center box pleat). Post-pass on the
    // finished draft, so the base is byte-identical with it off (boxPleat == None).
    // Runs AFTER the yoke block so it can act on the yoke-renamed "Front Body" of a
    // swing top. Only a dress/top with a CF-foldable front panel hosts one; a skirt
    // or a cut-2 front is refused honestly. Runs BEFORE the cutting-line offset so
    // the widened CF edge gets its own cut line. See boxpleat.hpp.
    if (spec.boxPleat != static_cast<int>(BoxPleat::None) &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        BoxPleatBlock::apply(pattern, static_cast<BoxPleat>(spec.boxPleat));
    }
    // Opt-in sleeve-end cuff (manşet, patch 3.13): a separate band stitched to the
    // wrist end of a full-length sleeve, the wider sleeve hem gathered/pleated in.
    // Post-pass on the finished draft (the sleeve piece is already inserted), so
    // the base is byte-identical with it off (cuffStyle == None). Only a garment
    // with a real full-length sleeve carries one — CuffBlock skips honestly for a
    // sleeveless / cap / short sleeve. French / elastic-casing cuffs stay honest.
    if (spec.cuffStyle != static_cast<int>(CuffStyle::None) &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        // Wrist girth estimate: ~0.155 * bust. ASSUMPTION (anthropometric, the
        // wrist is roughly half the biceps and biceps ~0.30 bust) — UNVALIDATED,
        // validate with a muslin. The cuff band clamps to the sleeve hem so a bad
        // wrist never makes the band wider than the hem it gathers.
        CuffBlock::apply(pattern, static_cast<CuffStyle>(spec.cuffStyle), m.bustMM() * 0.155);
    }
    // Opt-in hem SHAPE (etek ucu şekli, patch 3.15): reshapes the lower-edge line
    // of the fitted skirt/dress-skirt/top pieces into a shirt-tail (sides up, center
    // long) or a high-low (front short, back long). Post-pass on the finished draft,
    // so the base is byte-identical with it off (hemShape == Straight). Only a fitted
    // straight/A-line lower edge hosts one; a gathered/pleated/half-circle panel is
    // refused honestly. Runs BEFORE the ruffle so a ruffled hem attaches to the
    // reshaped edge, and BEFORE the cutting lines so the new hem is offset too.
    if (spec.hemShape != static_cast<int>(HemShape::Straight) &&
        (spec.garment == GarmentType::Skirt || spec.garment == GarmentType::Dress ||
         spec.garment == GarmentType::Top) &&
        (spec.garment == GarmentType::Top ||
         spec.skirtStyle == SkirtStyle::Straight || spec.skirtStyle == SkirtStyle::ALine)) {
        HemBlock::apply(pattern, static_cast<HemShape>(spec.hemShape));
    }
    // Opt-in hem ruffle: attaches to a skirt/dress hem. Off by default, so every
    // existing draft is byte-identical. (halfCircle uses skirt length; an empire
    // half-circle dress ruffle is approximate — noted, not silently wrong.)
    // A TOP has no skirt hem, but a top WITH A PEPLUM has a peplum hem — the
    // ruffle trims the peplum's outer edge (id51/62/75/84/91: peplum + fırfır hem).
    // Off by default (byte-identical). Only when peplum != None on a top.
    const bool topPeplumRuffle = spec.ruffleHem && spec.garment == GarmentType::Top &&
                                 spec.peplum != static_cast<int>(PeplumStyle::None);
    if (spec.ruffleHem &&
        (spec.garment == GarmentType::Skirt || spec.garment == GarmentType::Dress ||
         topPeplumRuffle)) {
        const double hemMM = topPeplumRuffle
            ? PeplumBlock::hemCircumferenceMM(static_cast<PeplumStyle>(spec.peplum), m.waistMM())
            : SkirtBlock::hemCircumferenceMM(
                  m, spec.skirtStyle, spec.skirtLength, resolveShaping(spec, m), spec.fabric,
                  /*lengthExtraMM=*/0, spec.skirtLengthMM);
        const auto ruffles = RuffleBlock::draftTiers(
            hemMM, spec.ruffleFullness, spec.ruffleDepthMM, spec.ruffleTiers);
        pattern.pieces.insert(pattern.pieces.end(), ruffles.begin(), ruffles.end());
        if (ruffles.size() == 1) {
            pattern.guideSteps.push_back(
                "Ruffle: cut the long ruffle strip as labelled. Gather its top edge with two rows "
                "of gathering stitches and pull it down to the hem length, matching the notches so "
                "the gathers sit evenly. Sew it to the hem right sides together, press the seam up, "
                "then finish the strip's bottom edge with a narrow 1 cm hem.");
        } else {
            pattern.guideSteps.push_back(
                "Tiered ruffle: cut every tier strip as labelled. Gather tier 1's top edge with "
                "two rows of gathering stitches down to the hem length, matching the notches, and "
                "sew it to the hem right sides together; press the seam up. Gather each next tier "
                "onto the bottom edge of the tier above it the same way. Only the last tier gets a "
                "narrow 1 cm rolled hem — the other tiers' bottom edges disappear into the seam "
                "that receives the next tier.");
        }
        // Fabric: each tier is hem x fullness^i long and (depth + margins) deep.
        double lenMultiplier = 0, f = 1;
        for (size_t i = 0; i < ruffles.size(); ++i) { f *= spec.ruffleFullness; lenMultiplier += f; }
        pattern.fabricMeters140 = roundToPlaces(
            pattern.fabricMeters140 +
                hemMM * lenMultiplier * (spec.ruffleDepthMM + 25) / 1.0e6 * 1.1,
            1);
    }
    // Opt-in off-shoulder / bardot neckline (omuz açık, vocab 2026-07-17):
    // reshapes the bodice top edge down below the shoulder into an elastic-cased
    // bardot band (+ optional frill). Runs on a bodiced garment only; a princess/
    // skirt garment is refused honestly. Off (None) → byte-identical. Runs BEFORE
    // the closure passes below only in spirit — order-independent here (it reshapes
    // the top edge, the closures touch the CF/CB seam).
    if (spec.bardotStyle != static_cast<int>(BardotStyle::None) &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        OffShoulderBlock::apply(pattern, static_cast<BardotStyle>(spec.bardotStyle));
    }
    // Opt-in button row (düğme sırası, vocab 2026-07-17): a drawn vertical row of
    // round button circles down the front — Functional grows the CF opening (reuses
    // the placket geometry, opens for donning), Decorative is buttons-for-looks
    // (no opening). Off (None) → byte-identical.
    if (spec.buttonRow != static_cast<int>(ButtonRow::None) &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        ButtonRowBlock::apply(pattern, static_cast<ButtonRow>(spec.buttonRow));
    }
    // Opt-in exposed / visible zipper (görünür fermuar, vocab 2026-07-17): a
    // visible design zip drawn as a teeth glyph on the CF or CB seam, opens for
    // donning. Distinct from the invisible CB zip a dress always carries. Off
    // (None) → byte-identical.
    if (spec.exposedZip != static_cast<int>(ExposedZip::None)) {
        ExposedZipBlock::apply(pattern, static_cast<ExposedZip>(spec.exposedZip));
    }
    // Opt-in back detail (arka pelerin/fırfır, vocab 2026-07-17): a separate ruffle
    // / cape / flounce piece attached at the back neck, attach edge trued to the
    // back neck edge. Off (None) → byte-identical.
    if (spec.backDetail != static_cast<int>(BackDetail::None) &&
        (spec.garment == GarmentType::Dress || spec.garment == GarmentType::Top)) {
        BackDetailBlock::apply(pattern, static_cast<BackDetail>(spec.backDetail));
    }
    // TECHNICAL MARKINGS (STEP 3): grainline (fallback), balance notches on the
    // seams that must align, and the CB-zipper closure mark on a dress. Runs
    // after every geometry post-pass so every piece is covered, and BEFORE the
    // cutting-line offset (notches sit on the sewing line). A dress always gets
    // the invisible center-back zipper (see wearability::hasDonningOpening).
    // A dress carries an invisible CB zipper UNLESS its own back opening/closure
    // already opens the back: a DONNING open-back (a deep low-open-back), a back
    // tie/back-waist bow, a front placket, or a halter (opens at the nape) —
    // mirror hasDonningOpening so we never stamp a redundant zipper onto a
    // garment that opens elsewhere. A decorative round/square/keyhole cutout is a
    // small faced hole on the CB fold — it does NOT open the tube, so the dress
    // still needs its zipper (opensForDonning is the single source of truth).
    const auto tiePl = static_cast<TiePlacement>(spec.tieClosure);
    const bool tieOpensBack =
        tiePl == TiePlacement::TieBack || tiePl == TiePlacement::BackWaist ||
        tiePl == TiePlacement::BackWaistBow ||
        // A wrap-front tie opens the FRONT (the front laps over itself) — the
        // dress does not also need a redundant invisible CB zipper.
        tiePl == TiePlacement::WrapFront;
    // A functional button row opens the front (it reuses the placket geometry).
    const bool buttonRowOpens = spec.buttonRow == static_cast<int>(ButtonRow::Functional);
    // An exposed zip on CF or CB opens that seam for donning (a visible zip is a
    // real closure, not just decoration).
    const bool exposedZipOpens = spec.exposedZip != static_cast<int>(ExposedZip::None);
    // A wrap / surplice front opens at the FRONT (the two fronts lap over each
    // other), so the dress does not also need a redundant invisible CB zipper.
    const bool wrapOpens =
        WrapFrontBlock::opensForDonning(static_cast<WrapFront>(spec.wrapFront));
    const bool backAlreadyOpens =
        OpenBackBlock::opensForDonning(static_cast<BackOpening>(spec.backOpening)) ||
        LaceUpBackBlock::opensForDonning(static_cast<LaceUpBack>(spec.laceUpBack)) ||
        spec.frontPlacket || spec.neckline == Neckline::Halter || tieOpensBack ||
        buttonRowOpens || exposedZipOpens || wrapOpens;
    // F5-parca: the zipper is no longer unconditional on a dress. DressBlock
    // measured the gecis kurali (neck opening + waist passage vs the head
    // reference, contract/parca-gecis-v1.json) and already folded the
    // opensElsewhere list in; pattern.cbZipper is that single decision.
    // backAlreadyOpens stays as the safety belt: a post-pass opening added
    // after the dress block can only ever REMOVE the zipper, never add one.
    annotateTechnical(pattern,
        /*dressZipper=*/spec.garment == GarmentType::Dress && pattern.cbZipper &&
            !backAlreadyOpens,
        pattern.cbZipperGerekce);

    // ⭐ THE EDIT LAYER (GECE7 / F7) — op.extend / op.attach, HERE and not
    // earlier. It runs after every drafting post-pass and after the technical
    // annotation, but BEFORE the cutting lines and the edge re-anchoring below,
    // so an extended outline gets its own offset cut line and an attached piece
    // enters the cut plan on the same terms as a drafted one. Opt-in and OFF by
    // default: with editExtendMM == 0 and editAttach == 0 this call does nothing
    // at all and the golden dump is byte-identical (RULES 4).
    // The program's report is KEPT (F7-edit): a refused edit used to die here
    // as a discarded return value, i.e. the user asked, the engine said no, and
    // nobody heard the no. Only a declared edit writes the field, so a no-edit
    // draft's JSON stays byte-identical.
    {
        const EditProgram editProg = runEditProgram(pattern, spec, m);
        if (!editProg.steps.empty()) pattern.editProgramJSON = editJSON(editProg);
    }

    // CUTTING LINES (last, so every post-pass piece is covered): each real
    // piece gets its sewing line offset outward by its seam allowance — cut on
    // the outer line, sew on the inner. Strip pieces (ruffle, bias binding)
    // carry every allowance inside their cut note, and zero-allowance pieces
    // (keyhole facing) are sewn ON the drawn line, so those stay single-line.
    for (auto& piece : pattern.pieces) {
        if (piece.name.find("Ruffle") != std::string::npos ||
            piece.name.find("Bias binding") != std::string::npos) continue;
        const bool onFold = piece.cutInstruction.find("on fold") != std::string::npos;
        piece.cutLine = offsetOutline(piece.commands, piece.seamAllowance, onFold);
        // FOLD LINE (ASTM layer 6): the cut note's "on fold" turned into a drawn
        // mirror edge, so the cutter sees the fold instead of reading it.
        piece.onFold = onFold;
        piece.foldLine = onFold ? foldLineOf(piece.commands)
                                : std::vector<PathCommand>{};
    }

    // NAMED EDGES, RE-ADDRESSED (V7-D) — after every post-pass has finished
    // rewriting outlines and BEFORE any consumer reads a name. One choke point
    // instead of a repair in each pass: the shoulder-panel split, the bardot
    // rework, the cup seam, the pleat and the Locket dart transfer all re-emit
    // `commands`, and an index range written upstream would then address a
    // different edge. Coordinates survive that; indices do not. A role whose
    // endpoints are gone is DROPPED here, so the consumer refuses by name
    // rather than measuring the wrong edge (RULES invariant 1).
    for (auto& piece : pattern.pieces) reanchorEdgeRoles(piece);

    // REHBER (F-H İŞ 2) — LAST, after every post-pass piece and every cut line
    // exists, because the advice counts pieces, notches and fold edges off the
    // FINISHED draft. Metadata only: no geometry is touched here, so the golden
    // dump is unaffected. Damla: kalıp + flat + REHBER, all three in the output.
    pattern.rehber = rehber::build(pattern, spec.fabric);
    // F5-parca: gerekcesiz parca kalmaz (rol tabanli doldurma; ozgul sayili
    // gerekceler kaynaklarinda yazildi). Kapi: parca_sayisi_check.
    fillGerekce(pattern);
    return pattern;
}

} // namespace GarmentDrafter

} // namespace stitchu
