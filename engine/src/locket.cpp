#include "locket.hpp"

#include <algorithm>
#include <cmath>
#include <string>
#include <vector>

#include "collar.hpp"
#include "sleeve.hpp"

namespace stitchu {
namespace LocketBlock {

namespace {

constexpr double SA = constants::kSeamAllowanceMM;

std::string mmStr(double v) {
    return std::to_string(static_cast<long>(std::lround(v)));
}

// Flatten a piece outline to a closed point loop (cubics -> 24 segments),
// engine convention — same helper family as cupseam.cpp.
std::vector<Point> flattenOutline(const std::vector<PathCommand>& cmds) {
    std::vector<Point> poly;
    Point current{0, 0}, start{0, 0};
    bool have = false;
    auto push = [&](Point p) {
        if (poly.empty() ||
            std::fabs(poly.back().x - p.x) > 1e-6 || std::fabs(poly.back().y - p.y) > 1e-6)
            poly.push_back(p);
    };
    for (const auto& cmd : cmds) {
        switch (cmd.type) {
            case CmdType::Move: current = cmd.to; start = cmd.to; have = true; push(current); break;
            case CmdType::Line: push(cmd.to); current = cmd.to; break;
            case CmdType::Curve: {
                const auto pts = flattenCubic(current, cmd.to, cmd.cp1, cmd.cp2, 24);
                for (size_t i = 1; i < pts.size(); ++i) push(pts[i]);
                current = cmd.to; break;
            }
            case CmdType::Close:
                if (have) push(start);
                break;
        }
    }
    if (poly.size() > 1 &&
        std::fabs(poly.front().x - poly.back().x) < 1e-6 &&
        std::fabs(poly.front().y - poly.back().y) < 1e-6)
        poly.pop_back();
    return poly;
}

std::vector<PathCommand> outlineFromLoop(const std::vector<Point>& loop) {
    std::vector<PathCommand> out;
    if (loop.empty()) return out;
    out.push_back(PathCommand::move(loop.front()));
    for (size_t i = 1; i < loop.size(); ++i) out.push_back(PathCommand::line(loop[i]));
    out.push_back(PathCommand::close());
    return out;
}

int findIdx(const DraftedPattern& pattern, const std::string& name) {
    for (size_t i = 0; i < pattern.pieces.size(); ++i)
        if (pattern.pieces[i].name == name) return static_cast<int>(i);
    return -1;
}

// Honest structural refusal: every guard that bails leaves a note naming WHERE
// the geometry did not map (never a silent no-op).
bool refuse(DraftedPattern& pattern, const std::string& where) {
    pattern.guideSteps.push_back(
        "Bugra Locket: skipped — the drafted geometry did not map at: " + where +
        ". Nothing changed.");
    return false;
}

// Classic S-shaped cap cubic (SleeveBlock::capCurve's shape, re-stated here for
// the Locket crown band so the crown eases into the armhole the same way).
PathCommand capCubic(Point from, Point to, bool front) {
    const double dx = to.x - from.x;
    const double dy = to.y - from.y;
    const double hollow = front ? 0.24 : 0.18;
    return PathCommand::curve(
        to,
        {from.x + dx * hollow, from.y + dy * 0.02},
        {from.x + dx * 0.55, from.y + dy * 0.98});
}

// ---- FRONT: cut the side bust dart OPEN (dart transfer) --------------------
// The drafted dart-mode front carries a folded WAIST dart (markings triple:
// move(legA), line(apex), line(legB)). The Locket front instead has a BIG side
// dart CUT OPEN at the side seam. Transfer the same intake as the CLASSIC
// slash-and-rotate: cut from the side seam at the bust line to the SAME apex,
// close the waist dart by rotating the flap between the dart and the cut
// RIGIDLY about the apex by the dart's own angle — the side wedge opens by
// exactly that angle. Rigid rotation = every seam length on the flap (side
// seam, waist run) is PRESERVED, so sewing the wedge closed levels the hem and
// the side seam matches the back again. The dart span itself blends the
// rotation across its two legs (the intake that used to fold out). Mouth =
// the chord the rotation opens at the side (recorded in the cut note).
bool rebuildFront(PatternPiece& front, double& outMouth, double& outWedgeApexX) {
    if (front.markings.size() < 3 ||
        front.markings[0].type != CmdType::Move ||
        front.markings[1].type != CmdType::Line ||
        front.markings[2].type != CmdType::Line)
        return false;
    const Point legA = front.markings[0].to;
    const Point apex = front.markings[1].to;
    const Point legB = front.markings[2].to;
    const double dartW = std::fabs(legB.x - legA.x);
    const double dartLen = (legA.y + legB.y) / 2.0 - apex.y;
    if (dartW < 4 || dartLen < 40) return false;

    const std::vector<Point> loop = flattenOutline(front.commands);
    if (loop.size() < 4) return false;

    // Side-seam crossing at the bust line: the max-x crossing of y = apex.y.
    const size_t n = loop.size();
    double sideX = -1e18;
    size_t sideEdge = n;
    for (size_t i = 0; i < n; ++i) {
        const Point& a = loop[i];
        const Point& b = loop[(i + 1) % n];
        const bool straddle = (a.y <= apex.y && b.y > apex.y) || (a.y > apex.y && b.y <= apex.y);
        if (!straddle) continue;
        const double t = (apex.y - a.y) / (b.y - a.y);
        const double x = a.x + (b.x - a.x) * t;
        if (x > sideX) { sideX = x; sideEdge = i; }
    }
    if (sideEdge == n || sideX <= apex.x + 20) return false;

    const double reach = sideX - apex.x;
    // Dart angle about the apex (between the two legs) = the rotation that
    // closes the dart; angles measured from +x (toward the side), y down.
    const double angA = std::atan2(legA.y - apex.y, legA.x - apex.x);
    const double angB = std::atan2(legB.y - apex.y, legB.x - apex.x);
    const double phi = angA - angB;
    if (phi <= 0 || phi > 0.6) return false;
    const double mouth = 2.0 * reach * std::sin(phi / 2.0);
    outMouth = mouth;
    outWedgeApexX = apex.x;

    // Rigid rotation about the apex, blended to zero across the dart span:
    // full phi from the side cut up to legB, phi->0 between legB and legA
    // (the folded intake), 0 left of legA and everywhere above the bust line.
    auto transfer = [&](const Point& p) -> Point {
        const double dx = p.x - apex.x, dy = p.y - apex.y;
        if (dy <= 1e-9) return p; // above/at the bust line: stationary
        const double ang = std::atan2(dy, dx);
        double t;
        if (ang <= angB) t = 1.0;
        else if (ang >= angA) t = 0.0;
        else t = (angA - ang) / (angA - angB);
        if (t <= 0) return p;
        const double c = std::cos(phi * t), s = std::sin(phi * t);
        return {apex.x + c * dx - s * dy, apex.y + s * dx + c * dy};
    };

    const Point sTop{sideX, apex.y};       // wedge mouth, upper corner (stationary)
    const Point sLow{apex.x + reach * std::cos(phi), apex.y + reach * std::sin(phi)};

    // Rebuild the loop with the wedge inserted on the side edge at the bust line.
    std::vector<Point> out;
    out.reserve(n + 4);
    for (size_t i = 0; i < n; ++i) {
        out.push_back(transfer(loop[i]));
        if (i == sideEdge) {
            const Point& a = loop[i];
            const Point& b = loop[(i + 1) % n];
            // Insert in walk direction: crossing DOWNWARD enters the rotated
            // flap (upper corner, apex, lower corner); upward is the reverse.
            if (a.y <= apex.y && b.y > apex.y) {
                out.push_back(sTop);
                out.push_back({apex.x, apex.y});
                out.push_back(sLow);
            } else {
                out.push_back(sLow);
                out.push_back({apex.x, apex.y});
                out.push_back(sTop);
            }
        }
    }
    front.commands = outlineFromLoop(out);

    // Drop the (transferred) waist-dart triple; keep the placket markings
    // (fold line, facing line, buttons) that follow it. Add a notch tick at
    // each wedge mouth corner so the sewer pairs the two dart faces.
    std::vector<PathCommand> marks(front.markings.begin() + 3, front.markings.end());
    marks.push_back(PathCommand::move(sTop));
    marks.push_back(PathCommand::line({sTop.x - 12, sTop.y - 6}));
    marks.push_back(PathCommand::move(sLow));
    marks.push_back(PathCommand::line({sLow.x - 12, sLow.y + 6}));
    // The wedge apex mark (the dart point the sewer stitches to — and the
    // ctest's anchor for proving the transfer preserved the seam lengths).
    marks.push_back(PathCommand::move({apex.x, apex.y}));
    marks.push_back(PathCommand::line({apex.x + 10, apex.y + 6}));
    front.markings = std::move(marks);
    return true;
}

} // namespace

// The exact Locket host class (see header). ONE named rule: waist-length dart
// top, short straight puffed sleeve, buttoned CF, crescent collar, not halter.
bool isLocketHost(const GarmentSpec& spec) {
    const bool cfOpening = spec.frontPlacket || spec.placketStyle != 0 || spec.buttonRow == 1;
    return spec.garment == GarmentType::Top && spec.topLength == TopLength::Cropped &&
           spec.shaping == Shaping::Dart && spec.neckline != Neckline::Halter &&
           spec.sleeveStyle == SleeveStyle::Straight &&
           spec.sleeveLength == SleeveLength::Short &&
           spec.sleeveCap == SleeveCap::Puffed && cfOpening &&
           spec.collarType == static_cast<int>(CollarType::Crescent);
}

bool apply(DraftedPattern& pattern, const GarmentSpec& spec,
           const BodyMeasurementsSnapshot& m) {
    if (static_cast<LocketTop>(spec.locketTop) == LocketTop::None) return true;

    // ---- HOST CLASS (honest gate, the same rule the base draft walks on) ----
    if (!isLocketHost(spec)) {
        pattern.guideSteps.push_back(
            "Bugra Locket: skipped — this construction is the waist-length "
            "buttoned dart top with a short set-in puffed sleeve and the crescent "
            "collar (the purchased Locket Top's exact class). Draft it as a "
            "cropped dart top with sleeveCap puffed, a front placket and "
            "collarType crescent. Nothing changed.");
        return false;
    }

    const int iFront = findIdx(pattern, "Top Front");
    const int iBack = findIdx(pattern, "Top Back");
    int iSleeve = -1;
    for (size_t i = 0; i < pattern.pieces.size(); ++i)
        if (pattern.pieces[i].name.find("Sleeve") != std::string::npos) {
            iSleeve = static_cast<int>(i);
            break;
        }
    if (iFront < 0 || iBack < 0) return refuse(pattern, "Top Front / Top Back panels");
    if (iSleeve < 0) return refuse(pattern, "sleeve piece");
    if (findIdx(pattern, "Collar") < 0 || findIdx(pattern, "Collar Lining") < 0)
        return refuse(pattern, "crescent Collar + Collar Lining pieces");
    if (pattern.sleeveArmholeLenMM <= 0 || pattern.sleeveArmholeDepthMM <= 0)
        return refuse(pattern, "measured armhole frame");

    // ---- 1. FRONT BODY: waist length + the big CUT-OPEN side bust dart ------
    double mouth = 0, wedgeApexX = 0;
    {
        PatternPiece& front = pattern.pieces[iFront];
        if (!rebuildFront(front, mouth, wedgeApexX))
            return refuse(pattern, "front waist-dart transfer (apex/side geometry)");
        front.name = "Front Body";
        front.cutInstruction =
            "cut 2 mirrored (Front Body — waist-length buttoned front; the bust "
            "shaping is the big side dart CUT OPEN at the side seam, " + mmStr(mouth) +
            " mm at its mouth. Sew that wedge closed first, matching the notches — "
            "the side seam, drawn " + mmStr(mouth) +
            " mm longer than the back on purpose, then matches the Back Body side "
            "seam. The centre-front edge carries the grown button placket)";
    }

    // ---- 2. BACK BODY: ONE piece, CUT ON FOLD, waist dart -------------------
    {
        PatternPiece& back = pattern.pieces[iBack];
        // Straighten the small drafted CB take-in onto x = 0 so the piece is
        // honestly cuttable on the fold (same move as the corset back).
        for (auto& cmd : back.commands) {
            if (cmd.type == CmdType::Move || cmd.type == CmdType::Line) {
                if (std::fabs(cmd.to.x) < 12.0) cmd.to.x = 0;
            } else if (cmd.type == CmdType::Curve) {
                if (std::fabs(cmd.to.x) < 12.0) cmd.to.x = 0;
                if (std::fabs(cmd.cp1.x) < 12.0 && std::fabs(cmd.cp2.x) < 12.0 &&
                    std::fabs(cmd.to.x) < 1e-9) {
                    cmd.cp1.x = 0;
                    cmd.cp2.x = 0;
                }
            }
        }
        back.name = "Back Body";
        back.cutInstruction =
            "cut 1 on fold (Back Body — ONE piece, the centre back is the FOLD; "
            "the small CB take-in is straightened onto it. Sew the waist dart as "
            "marked — this is not a cut-2 centre-back-seamed back)";
    }

    // ---- 3./4. UPPER + LOWER SLEEVE: the two-piece gathered puff band -------
    // Refit the PLAIN sleeve frame against the same measured armhole the base
    // sleeve was fit to (width on the biceps floor, cap height trued to the
    // armhole) and rebuild it as the Locket's two crescent pieces.
    {
        const std::vector<PatternPiece> plain = SleeveBlock::draft(
            m, SleeveStyle::Straight, SleeveLength::Short,
            pattern.sleeveArmholeLenMM, pattern.sleeveArmholeDepthMM,
            spec.fabric, SleeveCap::Plain);
        if (plain.empty() || plain[0].commands.size() < 4 ||
            plain[0].commands[0].type != CmdType::Move)
            return refuse(pattern, "plain sleeve frame");
        const double capHalf = -plain[0].commands[0].to.x;
        const double capH = plain[0].commands[0].to.y;
        if (capHalf < 40 || capH < 30) return refuse(pattern, "fitted cap frame");

        // Upper Sleeve — the gathered crown band (ruffled edge). Crown arc =
        // the same S-cap family, spread wider by the measured Bugra factor so
        // the surplus GATHERS into the armhole; the band's lower edge scoops up
        // under the crown and gathers onto the Lower Sleeve.
        const double tipX = bugra::crownWidthFactor * capHalf;
        const double tipY = bugra::crownDepthShare * capH;
        const Point tipL{-tipX, tipY}, tipR{tipX, tipY}, crown{0, 0};
        const double cY = bugra::bandCenterShare * tipY;
        const PathCommand crownL = capCubic(tipL, crown, true);
        const PathCommand crownR = capCubic(crown, tipR, false);
        const PathCommand bandR = PathCommand::curve(
            {0, cY}, {tipX * 0.72, tipY + bugra::bandSagMM}, {tipX * 0.30, cY});
        const PathCommand bandL = PathCommand::curve(
            tipL, {-tipX * 0.30, cY}, {-tipX * 0.72, tipY + bugra::bandSagMM});
        const double crownLen =
            pathLength({PathCommand::move(tipL), crownL, crownR});
        const double bandLen =
            pathLength({PathCommand::move(tipR), bandR, bandL});

        // Lower Sleeve — from the band seam down to the hem: top arc rises to
        // the centre (it RECEIVES the gathered band), hem dips below the
        // underarm tips near the ends and lifts at the centre (the ring's own
        // crescent profile).
        const double riseL = bugra::lowerRiseShare * capH;
        const Point tipL2{-capHalf, riseL}, tipR2{capHalf, riseL}, mid2{0, 0};
        const PathCommand lowTopL = capCubic(tipL2, mid2, true);
        const PathCommand lowTopR = capCubic(mid2, tipR2, false);
        const double hemCY = riseL - bugra::hemCenterRiseMM;
        const PathCommand hemR = PathCommand::curve(
            {0, hemCY},
            {capHalf * 0.75, riseL + bugra::hemDipMM * 1.9},
            {capHalf * 0.28, hemCY});
        const PathCommand hemL = PathCommand::curve(
            tipL2,
            {-capHalf * 0.28, hemCY},
            {-capHalf * 0.75, riseL + bugra::hemDipMM * 1.9});
        const double seamLen =
            pathLength({PathCommand::move(tipL2), lowTopL, lowTopR});

        PatternPiece upper;
        upper.name = "Upper Sleeve";
        upper.commands = {PathCommand::move(tipL), crownL, crownR,
                          bandR, bandL, PathCommand::close()};
        upper.cutInstruction =
            "cut 2 mirrored (Upper Sleeve — the gathered crown band, the ruffled "
            "edge. The crown, drawn " + mmStr(crownLen) +
            " mm, gathers into the " + mmStr(pattern.sleeveArmholeLenMM) +
            " mm armhole between the notches; the lower edge, drawn " + mmStr(bandLen) +
            " mm, gathers to the " + mmStr(seamLen) +
            " mm sleeve band seam matched to the Lower Sleeve — the extra fullness "
            "is the ruffle that puffs over the seam)";
        upper.markings = {
            // crown gather notches
            PathCommand::move({-tipX * 0.55, tipY * 0.40}),
            PathCommand::line({-tipX * 0.55, tipY * 0.28}),
            PathCommand::move({tipX * 0.55, tipY * 0.40}),
            PathCommand::line({tipX * 0.55, tipY * 0.28}),
            // band seam centre notch
            PathCommand::move({0, cY}),
            PathCommand::line({0, cY - 12}),
        };
        upper.hasGrainline = true;
        upper.grainline = Grainline{{0, tipY * 0.30}, {0, cY - 8}};
        upper.seamAllowance = SA;

        PatternPiece lower;
        lower.name = "Lower Sleeve";
        lower.commands = {PathCommand::move(tipL2), lowTopL, lowTopR,
                          hemR, hemL, PathCommand::close()};
        lower.cutInstruction =
            "cut 2 mirrored (Lower Sleeve — band seam to the hem; the top edge is "
            "your " + mmStr(seamLen) +
            " mm sleeve band seam, matched to the gathered Upper Sleeve at the "
            "notches; the underarm closes where the pointed ends meet)";
        lower.markings = {
            PathCommand::move({0, 0}),
            PathCommand::line({0, 12}),
        };
        lower.hasGrainline = true;
        lower.grainline = Grainline{{0, riseL * 0.30}, {0, hemCY - 8}};
        lower.seamAllowance = SA;

        pattern.pieces.erase(pattern.pieces.begin() + iSleeve);
        pattern.pieces.insert(pattern.pieces.begin() + iSleeve, {upper, lower});
    }

    // ---- 5. No neck facings: the collar + lining finish the neck ------------
    pattern.pieces.erase(
        std::remove_if(pattern.pieces.begin(), pattern.pieces.end(),
                       [](const PatternPiece& p) {
                           return p.name.find("Neck Facing") != std::string::npos;
                       }),
        pattern.pieces.end());

    // Drop the now-moot steps: the facing finish and the one-piece sleeve set-in
    // are replaced by the Locket steps below (never leave a step that lies).
    pattern.guideSteps.erase(
        std::remove_if(pattern.guideSteps.begin(), pattern.guideSteps.end(),
                       [](const std::string& s) {
                           return s.find("facing") != std::string::npos ||
                                  s.find("Facing") != std::string::npos ||
                                  s.find("Sew each sleeve seam") != std::string::npos ||
                                  s.find("Puff/gathered head") != std::string::npos;
                       }),
        pattern.guideSteps.end());

    pattern.guideSteps.push_back(
        "Bugra Locket construction — Front Body: sew the big side bust dart "
        "closed first (the open wedge at the side seam, " + mmStr(mouth) +
        " mm at its mouth, notch to notch); the front side seam then matches the "
        "back. Back Body is cut ON THE FOLD in one piece — sew its waist dart and "
        "press toward the centre.");
    pattern.guideSteps.push_back(
        "Two-piece sleeve: gather the Upper Sleeve's lower edge down to the "
        "sleeve band seam and sew it to the Lower Sleeve's top edge, matching the "
        "centre notches — the extra fullness is the frill that puffs over the "
        "seam. Then gather the crown between the notches, set the sleeve into the "
        "armhole, and close the underarm where the pointed ends meet.");
    return true;
}

} // namespace LocketBlock
} // namespace stitchu
