#include "cuff.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

namespace stitchu {
namespace CuffBlock {

namespace {

constexpr double SA = constants::kSeamAllowanceBandMM; // band/cuff seam allowance (constants.yaml)

// --- cuff dimensions (FORMULAS.md "Cuff family") -----------------------------
constexpr double buttonHeight = 60;     // finished barrel-cuff depth
constexpr double buttonOverlap = 25;    // button/buttonhole extension past the wrist
constexpr double ribbedHeight = 70;     // cut rib depth (folds to 35 finished)
constexpr double ribStretchBack = 0.80; // rib cut length = wrist * this (stretches on)
constexpr double wovenFullness = 1.30;  // sleeve hem / cuff = pleat/gather surplus
constexpr double knitFullness = 1.20;   // knit sleeve eases into rib with less surplus

// The full-length sleeve pieces the cuff can attach to. Balloon already carries
// its OWN cuff band (drawn in the sleeve block); a cap/short sleeve has no wrist.
bool isCuffableSleeve(const std::string& name) {
    // ⭐ "Raglan Sleeve" ADDED 2026-09-03. It was missing, and the omission was
    // not a decision: a raglan differs from a set-in sleeve at the SHOULDER, not
    // at the wrist — it is drafted with the same hem line between the same two
    // max-y corners, which is all `hemWidthOf` reads. With it absent, a
    // long-sleeved raglan asked for a button cuff got the honest-but-wrong skip
    // "this garment has no full-length sleeve hem to carry a cuff (sleeveless,
    // cap, or short sleeve)" — measured on the K7 composition, whose sleeve is
    // neither sleeveless nor cap nor short.
    return name == "Sleeve" || name == "Puff Sleeve" || name == "Gathered-Head Sleeve" ||
           name == "Raglan Sleeve";
}

// The drafted sleeve HEM width: the horizontal span between the two lowest
// (max-y) outline vertices of the sleeve piece. In the sleeve block the hem is a
// straight line between hemLeft(-hemHalf, hemY) and hemRight(+hemHalf, hemY), so
// the two max-y vertices are exactly those corners; their x-span is the full hem
// the cuff must gather. Curve control points are ignored (vertices only).
double hemWidthOf(const PatternPiece& sleeve) {
    double maxY = -1e18;
    for (const auto& c : sleeve.commands)
        if (c.type != CmdType::Close) maxY = std::max(maxY, c.to.y);
    double loX = 1e18, hiX = -1e18;
    bool found = false;
    for (const auto& c : sleeve.commands) {
        if (c.type == CmdType::Close) continue;
        if (std::fabs(c.to.y - maxY) <= 1.0) {  // within 1 mm of the hem line
            loX = std::min(loX, c.to.x);
            hiX = std::max(hiX, c.to.x);
            found = true;
        }
    }
    return found ? (hiX - loX) : 0.0;
}

const PatternPiece* findSleeve(const DraftedPattern& pattern) {
    for (const auto& p : pattern.pieces)
        if (isCuffableSleeve(p.name)) return &p;
    return nullptr;
}

// One cuff band. The attach (top) SEAM edge is drafted STRAIGHT to `attachLen`
// (the length that sews to the sleeve hem: for a woven cuff = wrist + overlap;
// for a rib = the relaxed rib length). The sleeve hem, wider by the fullness
// ratio, is gathered/pleated down to this edge — that surplus is the cuff's job.
// The band stands `height` tall (folds in half at construction). CB fold at x=0.
PatternPiece cuffBand(const std::string& name, double attachLen, double height,
                      const std::string& cut, const std::string& role,
                      bool knit) {
    PatternPiece piece;
    piece.name = name;
    piece.cutInstruction = cut;

    const Point tl{0, 0};
    const Point tr{attachLen, 0};
    const Point br{attachLen, height};
    const Point bl{0, height};
    piece.commands = {
        PathCommand::move(tl),
        PathCommand::line(tr),     // attach seam edge, length = attachLen
        PathCommand::line(br),
        PathCommand::line(bl),
        PathCommand::close(),
    };
    // Fold line across the middle (band folds to half depth) + a wrist notch.
    piece.markings.push_back(PathCommand::move({0, height / 2}));
    piece.markings.push_back(PathCommand::line({attachLen, height / 2}));
    piece.markings.push_back(PathCommand::move({attachLen * 0.5, -6}));
    piece.markings.push_back(PathCommand::line({attachLen * 0.5, 6}));
    (void)role;
    piece.hasGrainline = true;
    // Woven cuff: grain runs along the band length. Knit rib: grain across the
    // band (the rib's stretch direction runs around the wrist).
    piece.grainline = knit
        ? Grainline{{attachLen * 0.5, 8}, {attachLen * 0.5, height - 8}}
        : Grainline{{12, height / 2}, {attachLen - 12, height / 2}};
    piece.seamAllowance = SA;
    return piece;
}

// Stamp a wrist placement notch on the sleeve hem (its lowest edge midpoint), so
// the sewer knows the cuff attaches there. Body-frame independent.
void wristNotch(PatternPiece* sleeve) {
    if (!sleeve || sleeve->commands.empty()) return;
    double maxY = -1e18, sumX = 0; int n = 0;
    for (const auto& c : sleeve->commands)
        if (c.type != CmdType::Close) maxY = std::max(maxY, c.to.y);
    for (const auto& c : sleeve->commands)
        if (c.type != CmdType::Close && std::fabs(c.to.y - maxY) <= 1.0) { sumX += c.to.x; n++; }
    if (!n) return;
    const double mx = sumX / n;
    sleeve->markings.push_back(PathCommand::move({mx - 6, maxY}));
    sleeve->markings.push_back(PathCommand::line({mx + 6, maxY}));
    sleeve->markings.push_back(PathCommand::move({mx, maxY - 6}));
    sleeve->markings.push_back(PathCommand::line({mx, maxY + 6}));
}

} // namespace

double sleeveHemWidthMM(const DraftedPattern& pattern) {
    const PatternPiece* sleeve = findSleeve(pattern);
    return sleeve ? hemWidthOf(*sleeve) : 0.0;
}

bool apply(DraftedPattern& pattern, CuffStyle style, double wristMM) {
    if (style == CuffStyle::None) return true;

    const PatternPiece* sleeve = findSleeve(pattern);
    if (!sleeve) {
        pattern.guideSteps.push_back(
            "Cuff: skipped — this garment has no full-length sleeve hem to carry a "
            "cuff (sleeveless, cap, or short sleeve).");
        return false;
    }
    const double hem = hemWidthOf(*sleeve);
    if (hem < 60) {
        pattern.guideSteps.push_back(
            "Cuff: skipped — no measurable sleeve hem to gather into a cuff.");
        return false;
    }
    // A sensible wrist floor if none was passed (bust-derived is not available
    // here; the caller passes the measured wrist). Clamp so a degenerate wrist
    // never produces a band wider than the hem it gathers.
    double wrist = wristMM > 40 ? wristMM : hem * 0.60;

    switch (style) {
        case CuffStyle::Button: {
            // Woven barrel cuff: band = wrist + button overlap. The sleeve hem
            // (wider) is pleated/gathered down to it — surplus = hem - attach.
            const double attach = wrist + buttonOverlap;
            const double surplus = std::max(0.0, hem - attach);
            pattern.pieces.push_back(cuffBand(
                "Button Cuff (gömlek manşeti)", attach, buttonHeight,
                "cut 2 + interfacing (1 self + 1 tela), fold in half",
                "barrel cuff, buttons at the wrist", /*knit=*/false));
            pattern.guideSteps.push_back(
                "Cuff (Button Cuff / gömlek manşeti): the band is drafted to the "
                "wrist girth plus a " + std::to_string((int)buttonOverlap) +
                " mm button overlap. The sleeve hem is wider (" +
                std::to_string((int)std::round(surplus)) +
                " mm of surplus), so run gathering stitches or fold two pleats along "
                "the hem and draw it in to the cuff length. Interface one layer, fold "
                "the band right sides together, stitch the ends, turn, then sew the "
                "long edge to the gathered sleeve hem matching the wrist notch. Work a "
                "buttonhole in the overlap and sew the button opposite.");
            break;
        }
        case CuffStyle::Ribbed: {
            // Knit rib band cut SHORTER than the wrist (it stretches on). Cut
            // length = wrist * stretch-back; the sleeve hem gathers down to it.
            const double attach = wrist * ribStretchBack;
            pattern.pieces.push_back(cuffBand(
                "Ribbed Cuff (ribana manşeti)", attach, ribbedHeight,
                "cut 2 from rib knit, fold in half (grain = stretch around the wrist)",
                "knit rib band, stretches onto the wrist", /*knit=*/true));
            pattern.guideSteps.push_back(
                "Cuff (Ribbed Cuff / ribana manşeti): a knit rib band cut SHORTER "
                "than the wrist (about " + std::to_string((int)(ribStretchBack * 100)) +
                "% of it) so it hugs when it stretches on. Fold the band in half "
                "wrong sides together, then stitch its raw edges to the sleeve hem "
                "STRETCHING the rib to meet the hem as you sew (quarter the band and "
                "the hem, match the marks, stretch between). The hem eases in with no "
                "separate gathering row — the rib's recovery draws it in.");
            break;
        }
        case CuffStyle::None:
            return true;
    }

    // Re-find the sleeve AFTER push_back (may have reallocated) and stamp notch.
    for (auto& p : pattern.pieces)
        if (isCuffableSleeve(p.name)) { wristNotch(&p); break; }

    // A cuff adds a little self-fabric (woven) or rib knit + interfacing.
    pattern.fabricMeters140 = roundToPlaces(pattern.fabricMeters140 + 0.10, 1);
    (void)wovenFullness; (void)knitFullness;
    return true;
}

} // namespace CuffBlock
} // namespace stitchu
