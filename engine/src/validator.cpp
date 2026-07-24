#include "validator.hpp"

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <optional>

#include "bodice.hpp"
#include "guiderefs.hpp"
#include "collar.hpp"
#include "hem.hpp"
#include "skirt.hpp"
#include "sleeve.hpp"
#include "wearability.hpp"

namespace stitchu {
namespace PatternValidator {
namespace {

std::string fmt(const char* format, ...) {
    char buffer[256];
    va_list args;
    va_start(args, format);
    std::vsnprintf(buffer, sizeof(buffer), format, args);
    va_end(args);
    return buffer;
}

bool hasPrefix(const std::string& s, const std::string& prefix) {
    return s.rfind(prefix, 0) == 0;
}
bool hasSuffix(const std::string& s, const std::string& suffix) {
    return s.size() >= suffix.size() && s.compare(s.size() - suffix.size(), suffix.size(), suffix) == 0;
}
bool contains(const std::string& s, const std::string& needle) {
    return s.find(needle) != std::string::npos;
}

std::vector<Point> allPoints(const std::vector<PathCommand>& commands) {
    std::vector<Point> points;
    for (const auto& cmd : commands) {
        switch (cmd.type) {
            case CmdType::Move:
            case CmdType::Line:
                points.push_back(cmd.to);
                break;
            case CmdType::Curve:
                points.push_back(cmd.to);
                points.push_back(cmd.cp1);
                points.push_back(cmd.cp2);
                break;
            case CmdType::Close:
                break;
        }
    }
    return points;
}

double angleDegrees(Point a, Point b) {
    const double dot = a.x * b.x + a.y * b.y;
    const double magnitudes = std::hypot(a.x, a.y) * std::hypot(b.x, b.y);
    if (magnitudes <= 0) return 0;
    const double cosine = std::min(1.0, std::max(-1.0, dot / magnitudes));
    return std::acos(cosine) * 180.0 / M_PI;
}

// A single bezier in an outline must not fold back on itself: the turning
// angle between consecutive flattened segments stays under tolerance.
std::vector<ValidationIssue> kinkIssues(const PatternPiece& piece) {
    std::vector<ValidationIssue> issues;
    Point current{0, 0};
    for (size_t index = 0; index < piece.commands.size(); ++index) {
        const auto& cmd = piece.commands[index];
        switch (cmd.type) {
            case CmdType::Move:
            case CmdType::Line:
                current = cmd.to;
                break;
            case CmdType::Curve: {
                const auto samples = flattenCubic(current, cmd.to, cmd.cp1, cmd.cp2, 24);
                bool hasPrev = false;
                Point prevDirection{0, 0};
                for (size_t i = 1; i < samples.size(); ++i) {
                    const double dx = samples[i].x - samples[i - 1].x;
                    const double dy = samples[i].y - samples[i - 1].y;
                    if (std::hypot(dx, dy) <= 0.3) continue; // skip degenerate steps
                    const Point direction{dx, dy};
                    if (hasPrev) {
                        const double turn = angleDegrees(prevDirection, direction);
                        if (turn > kinkAngleDegrees) {
                            issues.push_back({"kink", piece.name,
                                fmt("curve %zu turns %.0f deg in one step (max %.0f)", index, turn, kinkAngleDegrees)});
                            break;
                        }
                    }
                    prevDirection = direction;
                    hasPrev = true;
                }
                current = cmd.to;
                break;
            }
            case CmdType::Close:
                break;
        }
    }
    return issues;
}

using Segment = std::pair<Point, Point>;

std::vector<Segment> flattenOutline(const std::vector<PathCommand>& commands) {
    std::vector<Segment> segments;
    Point current{0, 0};
    Point subpathStart{0, 0};
    for (const auto& cmd : commands) {
        switch (cmd.type) {
            case CmdType::Move:
                current = cmd.to;
                subpathStart = cmd.to;
                break;
            case CmdType::Line:
                if (distance(current, cmd.to) > 0.01) segments.push_back({current, cmd.to});
                current = cmd.to;
                break;
            case CmdType::Curve: {
                const auto samples = flattenCubic(current, cmd.to, cmd.cp1, cmd.cp2, 16);
                for (size_t i = 1; i < samples.size(); ++i) {
                    if (distance(samples[i - 1], samples[i]) > 0.01) {
                        segments.push_back({samples[i - 1], samples[i]});
                    }
                }
                current = cmd.to;
                break;
            }
            case CmdType::Close:
                if (distance(current, subpathStart) > 0.01) segments.push_back({current, subpathStart});
                current = subpathStart;
                break;
        }
    }
    return segments;
}

// Proper crossing test (shared endpoints between neighbours excluded by caller).
bool segmentsCross(const Segment& s1, const Segment& s2) {
    // If the segments share an endpoint (curve joins), that's not a crossing.
    const double eps = 0.01;
    for (const Point& a : {s1.first, s1.second}) {
        for (const Point& b : {s2.first, s2.second}) {
            if (std::hypot(a.x - b.x, a.y - b.y) < eps) return false;
        }
    }
    auto orientation = [](Point p, Point q, Point r) {
        return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
    };
    const double d1 = orientation(s2.first, s2.second, s1.first);
    const double d2 = orientation(s2.first, s2.second, s1.second);
    const double d3 = orientation(s1.first, s1.second, s2.first);
    const double d4 = orientation(s1.first, s1.second, s2.second);
    return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

std::vector<ValidationIssue> selfIntersectionIssues(const PatternPiece& piece) {
    const auto segments = flattenOutline(piece.commands);
    if (segments.size() <= 3) return {};
    for (size_t i = 0; i + 2 < segments.size(); ++i) {
        for (size_t j = i + 2; j < segments.size(); ++j) {
            // Skip neighbours (shared endpoints), incl. the closing wrap.
            if (i == 0 && j == segments.size() - 1) continue;
            if (segmentsCross(segments[i], segments[j])) {
                return {{"selfintersect", piece.name,
                         fmt("outline crosses itself near (%.1f, %.1f)", segments[i].first.x, segments[i].first.y)}};
            }
        }
    }
    return {};
}

std::vector<ValidationIssue> markingIssues(const PatternPiece& piece, const Rect& box) {
    const double minX = box.x - markingSlack, maxX = box.x + box.width + markingSlack;
    const double minY = box.y - markingSlack, maxY = box.y + box.height + markingSlack;
    for (const Point& p : allPoints(piece.markings)) {
        if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) {
            return {{"marking", piece.name, fmt("marking point (%.1f, %.1f) falls outside the piece", p.x, p.y)}};
        }
    }
    return {};
}

// MARK: Bodice

std::vector<ValidationIssue> bodiceIssues(const GarmentSpec& spec, const BodiceDraft& bodice, const BodyMeasurementsSnapshot& m) {
    std::vector<ValidationIssue> issues;

    const double seamDelta = std::fabs(bodice.frontSideSeam - bodice.backSideSeam);
    if (seamDelta > pairedSeamTolerance) {
        issues.push_back({"sideseam", "Bodice",
            fmt("front side seam %.1f vs back %.1f differ by %.1f mm (max %.1f)",
                bodice.frontSideSeam, bodice.backSideSeam, seamDelta, pairedSeamTolerance)});
    }

    const double chestEase = BodiceBlock::chestEaseFor(spec.fabric);
    const double waistEase = BodiceBlock::waistEaseFor(spec.fabric);
    // Mirror the drafter's frame girth EXACTLY (incl. the clamp): the real upper
    // bust when given (full-bust adjustment), else the bust-minus-cup assumption.
    const double rawFrame = m.upperBustMM() > 0 ? m.upperBustMM()
                                                : (m.bustMM() - BodiceBlock::underbustOffset);
    const double frameGirth = std::min(rawFrame, m.bustMM() - 20.0);
    const double underbust = std::max(frameGirth, m.waistMM());
    // Empire bodices suppress toward the underbust girth, not the waist.
    const bool empire = spec.garment == GarmentType::Dress && spec.waistline == Waistline::Empire;
    const double girth = empire ? underbust : m.waistMM();
    // The full-bust adjustment adds a share of the cup fullness to the front, so
    // the expected front chest must include it (else it reads as eaten ease).
    const double cupFullness = std::max(0.0, m.bustMM() - underbust);
    const double frontCupAdd = m.upperBustMM() > 0 ? cupFullness * 0.35 : 0.0;
    // A dropped shoulder intentionally widens BOTH halves by the same amount
    // (read back from the draft so this stays one source). Set/Raglan → 0.
    const double expectedFrontChest = (m.bustMM() / 4) * (1 + chestEase) + frontCupAdd + bodice.droppedWiden;
    const double expectedBackChest = (underbust / 4) * (1 + chestEase) + bodice.droppedWiden;
    if (std::fabs(bodice.frontChestWidth - expectedFrontChest) > chestWidthTolerance) {
        issues.push_back({"chest", "Bodice Front",
            fmt("chest width %.1f, expected %.1f — bust ease is being eaten", bodice.frontChestWidth, expectedFrontChest)});
    }
    if (std::fabs(bodice.backChestWidth - expectedBackChest) > chestWidthTolerance) {
        issues.push_back({"chest", "Bodice Back",
            fmt("chest width %.1f, expected %.1f", bodice.backChestWidth, expectedBackChest)});
    }

    // Dart + seam take-in must reproduce the waist target exactly.
    const double frontTarget = (girth * (1 - BodiceBlock::backWaistShare) / 2) * (1 + waistEase);
    const double backTarget = (girth * BodiceBlock::backWaistShare / 2) * (1 + waistEase);
    if (std::fabs(bodice.frontStraightWaist - frontTarget) > dartSumTolerance) {
        issues.push_back({"dartsum", "Bodice Front",
            fmt("sewn waist span %.1f vs target %.1f — dart intake inconsistent with waist reduction",
                bodice.frontStraightWaist, frontTarget)});
    }
    if (std::fabs(bodice.backStraightWaist - backTarget) > dartSumTolerance) {
        issues.push_back({"dartsum", "Bodice Back",
            fmt("sewn waist span %.1f vs target %.1f — dart intake inconsistent with waist reduction",
                bodice.backStraightWaist, backTarget)});
    }

    if (bodice.armholeLength <= 0 || !std::isfinite(bodice.armholeLength)) {
        issues.push_back({"armhole", "Bodice", fmt("armhole length %.1f is not sane", bodice.armholeLength)});
    }

    // Princess panels: the two edges of one seam must sew together.
    if (bodice.frontPrincess) {
        const double delta = std::fabs(bodice.frontSeamCenterLen - bodice.frontSeamSideLen);
        if (delta > princessSeamTolerance) {
            issues.push_back({"princess", "Bodice Front",
                fmt("princess edge center %.1f vs side %.1f differ by %.1f mm (max %.1f)",
                    bodice.frontSeamCenterLen, bodice.frontSeamSideLen, delta, princessSeamTolerance)});
        }
    }
    if (bodice.backPrincess) {
        const double delta = std::fabs(bodice.backSeamCenterLen - bodice.backSeamSideLen);
        if (delta > princessSeamTolerance) {
            issues.push_back({"princess", "Bodice Back",
                fmt("princess edge center %.1f vs side %.1f differ by %.1f mm (max %.1f)",
                    bodice.backSeamCenterLen, bodice.backSeamSideLen, delta, princessSeamTolerance)});
        }
    }
    return issues;
}

// MARK: Sleeve

std::vector<ValidationIssue> sleeveIssues(
    const GarmentSpec& spec,
    const BodyMeasurementsSnapshot& m,
    const DraftedPattern& draft,
    const BodiceDraft& bodice
) {
    // A halter has no shoulders to hang a sleeve from — the engine skips the
    // sleeve choice (and says so in the guide), so none is expected here.
    if (spec.sleeveStyle == SleeveStyle::None || spec.neckline == Neckline::Halter) return {};
    const PatternPiece* sleeve = nullptr;
    for (const auto& piece : draft.pieces) {
        if (contains(piece.name, "Sleeve") && !contains(piece.name, "Cuff")) {
            sleeve = &piece;
            break;
        }
    }
    if (!sleeve) {
        return {{"sleeve", draft.garment, "sleeve requested but no sleeve piece drafted"}};
    }
    // Cap = move(capLeft) + the two cap curves, a stable layout of SleeveBlock.
    if (sleeve->commands.size() < 3 ||
        sleeve->commands[0].type != CmdType::Move ||
        sleeve->commands[1].type != CmdType::Curve ||
        sleeve->commands[2].type != CmdType::Curve) {
        return {{"sleeve", sleeve->name, "unexpected sleeve command layout, cannot measure cap"}};
    }
    const double capLength = pathLength({
        PathCommand::move(sleeve->commands[0].to), sleeve->commands[1], sleeve->commands[2]});
    const double capEase = SleeveBlock::capEaseFor(spec.fabric);
    const double target = bodice.armholeLength * (1 + capEase);
    const double ease = capLength / bodice.armholeLength - 1;
    std::vector<ValidationIssue> issues;
    // GATHERED / PUFF HEAD (Loop 6): the crown arc is INTENTIONALLY longer than
    // armhole + ease — that surplus is GATHERED in, not eased. So the plain 1–9%
    // ease window does not apply; instead the crown surplus must land near the
    // spread the style adds (with a generous band, since arc growth is nonlinear
    // in the spread). The sleeve still SETS INTO the same armhole because the
    // length below the notches is unchanged; the biceps floor still holds because
    // the widened crown is >= the base width. Guard the gather is neither absent
    // (looks plain) nor runaway (unsewable).
    if (spec.sleeveCap != SleeveCap::Plain) {
        const double spreadFrac = SleeveBlock::capSpreadFrac(spec.sleeveCap);
        // Arc grows a bit more than the chord spread; accept a wide band.
        const double lo = spreadFrac * 0.5;   // must actually be gathered
        const double hi = spreadFrac * 2.5 + 0.20; // but not runaway
        if (ease < lo || ease > hi) {
            issues.push_back({"cap", sleeve->name,
                fmt("gathered-head surplus %.1f%% outside the expected %.0f-%.0f%% gather band",
                    ease * 100, lo * 100, hi * 100)});
        }
        const double bicepsEstimate =
            m.bustMM() * SleeveBlock::bicepsRatio * (1 + SleeveBlock::bicepsEaseFor(spec.fabric));
        const double capWidth = distance(sleeve->commands[0].to, sleeve->commands[2].to);
        if (capWidth < bicepsEstimate - 1.0) {
            issues.push_back({"biceps", sleeve->name,
                fmt("sleeve %.0f mm wide is narrower than the %.0f mm biceps line — it would bind on the arm",
                    capWidth, bicepsEstimate)});
        }
        return issues;
    }
    // The cap-ease WINDOW is the real sewability gate. The exact-target
    // convergence check below is only a solver-health check: it must not fire
    // when the biceps floor legitimately pushes the cap longer than the 4% ideal
    // (a wide arm on a shallow armhole — e.g. a fuller bust under a high empire
    // seam), because that cap is still perfectly sewable as long as its ease
    // stays in the window. So the convergence check only counts when the ease is
    // ALSO out of window — i.e. the solver genuinely failed, not the arm forced it.
    const bool easeInWindow = ease >= capEaseMin && ease <= capEaseMax;
    if (std::fabs(capLength - target) > capLengthTolerance && !easeInWindow) {
        issues.push_back({"cap", sleeve->name,
            fmt("cap seam %.1f vs target %.1f (armhole %.1f + %.0f%% ease) — convergence missed by %.1f mm",
                capLength, target, bodice.armholeLength, capEase * 100, std::fabs(capLength - target))});
    }
    if (!easeInWindow) {
        issues.push_back({"cap", sleeve->name,
            fmt("cap ease %.1f%% outside the %.0f-%.0f%% window", ease * 100, capEaseMin * 100, capEaseMax * 100)});
    }
    // Biceps floor: the sleeve must be at least as wide as the biceps girth +
    // ease, or it binds / won't close at the underarm. The cap chord (capLeft ->
    // capRight) IS the finished biceps width. This guards the length-only cap
    // fit from ever silently returning a too-narrow sleeve.
    const double bicepsEstimate =
        m.bustMM() * SleeveBlock::bicepsRatio * (1 + SleeveBlock::bicepsEaseFor(spec.fabric));
    const double capWidth = distance(sleeve->commands[0].to, sleeve->commands[2].to);
    if (capWidth < bicepsEstimate - 1.0) {
        issues.push_back({"biceps", sleeve->name,
            fmt("sleeve %.0f mm wide is narrower than the %.0f mm biceps line — it would bind on the arm",
                capWidth, bicepsEstimate)});
    }
    return issues;
}

// MARK: Skirt helpers

double dartIntake(const PatternPiece& piece) {
    // Dart marking layout: move(legA), line(tip), line(legB).
    double intake = 0;
    size_t index = 0;
    while (index + 2 < piece.markings.size()) {
        if (piece.markings[index].type == CmdType::Move &&
            piece.markings[index + 1].type == CmdType::Line &&
            piece.markings[index + 2].type == CmdType::Line) {
            const Point a = piece.markings[index].to;
            const Point b = piece.markings[index + 2].to;
            const double width = std::fabs(b.x - a.x);
            const double drop = std::fabs(b.y - a.y);
            if (width > 2 && drop < width) { // darts are near-horizontal pairs; skip fold/gather lines
                intake += width;
                index += 3;
                continue;
            }
        }
        index += 1;
    }
    return intake;
}

// Waist edge length of a skirt piece, measured along the drafted curve.
std::optional<double> skirtWaistLength(const PatternPiece& piece, SkirtStyle style) {
    if (piece.commands.size() < 2 || piece.commands[0].type != CmdType::Move) return std::nullopt;
    const Point start = piece.commands[0].to;
    switch (style) {
        case SkirtStyle::ALine:
        case SkirtStyle::Straight:
        case SkirtStyle::HalfCircle:
        case SkirtStyle::Gore:
            // Quarter pieces, circle panels and gore panels all open with the
            // waist edge (a single move + first path command).
            return pathLength({PathCommand::move(start), piece.commands[1]});
        case SkirtStyle::Gathered:
            if (piece.commands[1].type != CmdType::Line) return std::nullopt;
            return std::fabs(piece.commands[1].to.x - start.x);
        case SkirtStyle::Pleated:
            // The panel is cut 3x wide; pleated up, it presents width / ratio.
            if (piece.commands[1].type != CmdType::Line) return std::nullopt;
            return std::fabs(piece.commands[1].to.x - start.x) / SkirtBlock::pleatRatio;
    }
    return std::nullopt;
}

// Quarter-skirt side seam: waist-to-hip curve + hip-to-hem line.
std::optional<double> skirtSideSeamLength(const PatternPiece& piece) {
    if (piece.commands.size() < 4 ||
        piece.commands[1].type != CmdType::Curve ||
        piece.commands[2].type != CmdType::Curve ||
        piece.commands[3].type != CmdType::Line) return std::nullopt;
    return pathLength({PathCommand::move(piece.commands[1].to), piece.commands[2], piece.commands[3]});
}

// Full-garment bodice sewn waist: front + back halves, darts excluded,
// measured along the drafted waist curves. Both halves count twice.
double bodiceSewnWaist(const BodiceDraft& bodice) {
    return (bodice.frontSewnWaist + bodice.backSewnWaist) * 2;
}

// MARK: Skirt (standalone or attached to a dress bodice)

std::vector<ValidationIssue> skirtIssues(
    const GarmentSpec& spec,
    const BodyMeasurementsSnapshot& m,
    const DraftedPattern& draft,
    double waistEase,
    const BodiceDraft* bodice
) {
    std::vector<ValidationIssue> issues;
    std::vector<const PatternPiece*> skirtPieces;
    for (const auto& piece : draft.pieces) {
        // Standalone skirts: everything but the waistband is a skirt piece
        // (Front / Center Front / Side Front / panels...). In a dress the
        // skirt pieces all carry the "Skirt" prefix.
        // A hem ruffle is a trim, not a waist-bearing piece — never count it.
        if (piece.name.find("Ruffle") != std::string::npos) continue;
        // Pockets (patch 3.12) are attachments, not waist-bearing panels: a patch
        // pocket sits ON a panel and an in-seam pocket bag hangs off the side seam
        // — neither joins the waist, so they must never enter the waist sum.
        if (piece.name.find("Pocket") != std::string::npos) continue;
        if (spec.garment == GarmentType::Skirt ? piece.name != "Waistband"
                                               : hasPrefix(piece.name, "Skirt")) {
            skirtPieces.push_back(&piece);
        }
    }
    if (skirtPieces.empty()) {
        return {{"skirt", draft.garment, "no skirt pieces found"}};
    }

    // Sewn waist (dart intake excluded) totalled over the full garment.
    // Every skirt piece is a half of front/back (on fold or cut 2), so x2.
    double sewnWaist = 0;
    for (const auto* piece : skirtPieces) {
        const auto waist = skirtWaistLength(*piece, spec.skirtStyle);
        if (!waist) {
            issues.push_back({"skirt", piece->name, "unexpected command layout, cannot measure waist"});
            continue;
        }
        // Every skirt piece is a half of front/back (on fold or cut 2), so x2 —
        // EXCEPT a gore panel, which is one of `goreCount` identical panels each
        // carrying waistShare of the finished waist, so it counts `goreCount`
        // times (SkirtBlock::goreCount).
        const double multiplier = (spec.skirtStyle == SkirtStyle::Gore)
                                      ? static_cast<double>(SkirtBlock::goreCount) : 2.0;
        sewnWaist += (*waist - dartIntake(*piece)) * multiplier;
    }

    if (spec.skirtStyle == SkirtStyle::Gathered) {
        // Gathered panels only need to be comfortably wider than the waist.
        const double reference = bodice ? bodiceSewnWaist(*bodice) : m.waistMM() * (1 + waistEase);
        if (sewnWaist < reference * 1.3) {
            issues.push_back({"waistjoin", "Skirt",
                fmt("gathered panels %.0f mm give less than 1.3x the waist %.0f", sewnWaist, reference)});
        }
    } else if (bodice) {
        const double bodiceWaist = bodiceSewnWaist(*bodice);
        if (std::fabs(sewnWaist - bodiceWaist) > waistJoinTolerance) {
            issues.push_back({"waistjoin", "Skirt",
                fmt("skirt waist %.1f vs bodice waist %.1f differ by %.1f mm (max %.1f)",
                    sewnWaist, bodiceWaist, std::fabs(sewnWaist - bodiceWaist), waistJoinTolerance)});
        }
    } else {
        const double target = m.waistMM() * (1 + waistEase);
        if (std::fabs(sewnWaist - target) > waistJoinTolerance) {
            issues.push_back({"waist", "Skirt",
                fmt("skirt waist %.1f vs eased body waist %.1f differ by %.1f mm",
                    sewnWaist, target, std::fabs(sewnWaist - target))});
        }
        for (const auto& piece : draft.pieces) {
            if (piece.name == "Waistband") {
                const double bandLength = boundingBox(piece.commands).width;
                const double bandTotal = bandLength * 2 - 60; // 30mm button stand per half
                if (std::fabs(bandTotal - sewnWaist) > waistJoinTolerance) {
                    issues.push_back({"waistband", "Waistband",
                        fmt("band %.1f vs skirt waist %.1f differ by %.1f mm",
                            bandTotal, sewnWaist, std::fabs(bandTotal - sewnWaist))});
                }
                break;
            }
        }
    }

    // Quarter skirts: front and back side seams must match. In gore mode the
    // side seam lives on the side panels; otherwise on the single quarters.
    if (spec.skirtStyle == SkirtStyle::ALine || spec.skirtStyle == SkirtStyle::Straight) {
        const PatternPiece* front = nullptr;
        const PatternPiece* back = nullptr;
        for (const auto* piece : skirtPieces) {
            if (contains(piece->name, "Side Front")) front = piece;
            else if (contains(piece->name, "Side Back")) back = piece;
        }
        if (!front || !back) {
            front = back = nullptr;
            for (const auto* piece : skirtPieces) {
                if (!front && hasSuffix(piece->name, "Front")) front = piece;
                if (!back && hasSuffix(piece->name, "Back")) back = piece;
            }
        }
        if (front && back) {
            const auto f = skirtSideSeamLength(*front);
            const auto b = skirtSideSeamLength(*back);
            if (f && b && std::fabs(*f - *b) > pairedSeamTolerance) {
                issues.push_back({"sideseam", "Skirt",
                    fmt("front side seam %.1f vs back %.1f", *f, *b)});
            }
        }

        // Waist-join alignment (dress): the skirt's gore seam must land where
        // the bodice's princess seam lands, measured as the sewn arc from the
        // center edge. A sewist matches these two seams by eye at the waist.
        if (bodice) {
            for (const bool isFront : {true, false}) {
                const bool princess = isFront ? bodice->frontPrincess : bodice->backPrincess;
                if (!princess) continue;
                const double bodiceArc = isFront ? bodice->frontWaistCenterArc : bodice->backWaistCenterArc;
                const PatternPiece* center = nullptr;
                for (const auto* piece : skirtPieces) {
                    if (contains(piece->name, std::string("Center ") + (isFront ? "Front" : "Back"))) { center = piece; break; }
                }
                if (!center || center->commands.size() < 2 || center->commands[1].type != CmdType::Curve) continue;
                const double skirtArc = pathLength({PathCommand::move(center->commands[0].to), center->commands[1]});
                if (std::fabs(skirtArc - bodiceArc) > princessSeamTolerance) {
                    issues.push_back({"waistalign", std::string("Skirt ") + (isFront ? "Front" : "Back"),
                        fmt("gore seam sits %.1f mm from the center edge, princess seam %.1f — off by %.1f",
                            skirtArc, bodiceArc, std::fabs(skirtArc - bodiceArc))});
                }
            }
        }

        // Gore pairs: the center panel's seam edge must match the side
        // panel's. Center layout: [1]=waist, [2]=line(tip), [3]=line(hem).
        // Side layout: [4]=hem curve, [5]=line(tip), [6]=line(waist leg).
        for (const char* half : {"Front", "Back"}) {
            const PatternPiece* center = nullptr;
            const PatternPiece* side = nullptr;
            for (const auto* piece : skirtPieces) {
                if (contains(piece->name, std::string("Center ") + half)) center = piece;
                if (contains(piece->name, std::string("Side ") + half)) side = piece;
            }
            if (!center || !side) continue;
            if (center->commands.size() < 4 ||
                center->commands[2].type != CmdType::Line ||
                center->commands[3].type != CmdType::Line ||
                side->commands.size() < 7 ||
                side->commands[4].type != CmdType::Curve ||
                side->commands[5].type != CmdType::Line ||
                side->commands[6].type != CmdType::Line) {
                issues.push_back({"gorepair", std::string("Skirt ") + half,
                    "unexpected gore panel layout, cannot measure the seam"});
                continue;
            }
            const double centerLen = pathLength({
                PathCommand::move(center->commands[1].to), center->commands[2], center->commands[3]});
            const double sideLen = pathLength({
                PathCommand::move(side->commands[4].to), side->commands[5], side->commands[6]});
            if (std::fabs(centerLen - sideLen) > pairedSeamTolerance) {
                issues.push_back({"gorepair", std::string("Skirt ") + half,
                    fmt("gore seam center %.1f vs side %.1f differ by %.1f mm",
                        centerLen, sideLen, std::fabs(centerLen - sideLen))});
            }
        }
    }

    // A dress zipper runs through bodice and skirt: the skirt back (or a
    // half-circle panel) must be cut 2 so a center back seam exists. A gored
    // skirt is exempt — it is built from `goreCount` vertical panels, so a panel
    // seam always lands at the center back for the zipper to continue into.
    if (spec.garment == GarmentType::Dress && spec.skirtStyle != SkirtStyle::Gore) {
        const PatternPiece* zipCarrier = nullptr;
        for (const auto* piece : skirtPieces) {
            if (hasSuffix(piece->name, "Back")) { zipCarrier = piece; break; }
        }
        if (!zipCarrier && !skirtPieces.empty()) zipCarrier = skirtPieces.front();
        if (zipCarrier && !contains(zipCarrier->cutInstruction, "cut 2")) {
            issues.push_back({"zipper", zipCarrier->name,
                "dress skirt back is '" + zipCarrier->cutInstruction + "' — no center back seam for the zipper to continue into"});
        }
    }
    return issues;
}

// MARK: Top

// Extended top layout tail: ..., armhole curve, side curve to hem,
// hem CURVE to center, center LINE(s) up, close. The side-to-hem and hem-to-
// center connectors are always CURVES (extendPiece emits them as curves); the
// trailing center-front edge is always LINE(s). A front button placket grows
// the whole CF edge outward — the hem corner and the vertical CF edge move to
// x = -(stand + offset) — and inserts one extra jog LINE back to the neck point
// before close. So the trailing CF edge can sit at any x (e.g. -73 mm for an
// asymmetric placket, not just within ~18 mm for a symmetric one). Walk back
// over trailing Close/Line commands (the CF edge, whatever it grew to) until the
// first CURVE — that curve is the hem-to-center connector, and the two curves
// before it are the side-to-hem (hemEnd-1) and armhole-lower (hemEnd-2). This is
// topology-driven, so it lands on the true side seam for every front topology
// and every placket offset. (An earlier |x| <= 20 mm skip missed the grown edge
// of an asymmetric placket and measured the hem sweep as the side seam — a false
// front-vs-back mismatch; fixed 2026-07-23.)
std::optional<double> topSideSeamLength(const PatternPiece& piece) {
    const size_t count = piece.commands.size();
    if (count < 5) return std::nullopt;
    size_t hemEnd = count - 1; // index of the close command
    // Walk back over the closing center-front edge (Close + the trailing LINEs
    // that ride the CF, at whatever x the placket grew them to) to the first
    // CURVE — the hem-to-center connector.
    while (hemEnd > 0 &&
           (piece.commands[hemEnd].type == CmdType::Close ||
            piece.commands[hemEnd].type == CmdType::Line)) {
        --hemEnd;
    }
    // hemEnd now points at the hem-to-center curve; the two curves before it are
    // side-to-hem (hemEnd-1) and armhole-lower (hemEnd-2).
    if (hemEnd < 2 ||
        piece.commands[hemEnd - 2].type != CmdType::Curve ||
        piece.commands[hemEnd - 1].type != CmdType::Curve) return std::nullopt;
    return pathLength({PathCommand::move(piece.commands[hemEnd - 2].to), piece.commands[hemEnd - 1]});
}

// Princess side panel: [0]=move(split), [1]=armhole lower half, [2]=side seam
// (curve to hem when extended, line to the waist when cropped).
std::optional<double> princessTopSideSeam(const PatternPiece& piece) {
    if (piece.commands.size() < 3 ||
        piece.commands[1].type != CmdType::Curve ||
        (piece.commands[2].type != CmdType::Curve && piece.commands[2].type != CmdType::Line)) {
        return std::nullopt;
    }
    return pathLength({PathCommand::move(piece.commands[1].to), piece.commands[2]});
}

std::vector<ValidationIssue> topIssues(
    const GarmentSpec& spec,
    const DraftedPattern& draft,
    const BodiceDraft& bodice
) {
    std::vector<ValidationIssue> issues;
    const double extra = belowWaist(spec.topLength);
    auto find = [&](const std::string& name) -> const PatternPiece* {
        for (const auto& piece : draft.pieces) {
            if (piece.name == name) return &piece;
        }
        return nullptr;
    };

    // Per half: princess halves carry center+side panels, others one piece.
    std::optional<double> frontSide, backSide;
    for (const bool isFront : {true, false}) {
        const char* half = isFront ? "Front" : "Back";
        const bool princess = isFront ? bodice.frontPrincess : bodice.backPrincess;
        // Piece-frame lengths: identical to the body frame except the halter's
        // shifted halves (low back, strap-raised front).
        double expected = (isFront ? bodice.frontPieceLength : bodice.backPieceLength) + extra;
        // patch 3.15: a high-low hem intentionally RAISES the front center hem (and
        // a shirttail raises the sides, not the center), so the reshaped half is
        // legitimately shorter than the drafted length — relax the "hem extension
        // did not apply" height check by the amount the hem shape lifts that half.
        if (isFront && spec.hemShape == static_cast<int>(HemShape::HighLow))
            expected -= HemBlock::highLowFrontRise;
        auto& sideLen = isFront ? frontSide : backSide;
        // Cup seam (Corset Bustier): the front princess panels are REPLACED by an
        // Upper Cup + a Lower Cup, so the front-half princess-panel + side-seam
        // audit below no longer maps (the cups carry that wearability, checked in
        // cup_check). Skip the front half for a cup-split garment.
        if (isFront && spec.cupSeam != 0 &&
            find("Upper Cup Center Front") && find("Lower Cup Center Front")) {
            continue;
        }
        // Yoke split (roba — doll / babydoll dress): the "Top <half>" panel (dart) or
        // the "Top Center/Side <half>" princess panels are REPLACED by a "<half> Yoke"
        // + "<half> Body" (dart), or "<half> Yoke Center/Side" + "<half> Body
        // Center/Side" (princess). The single-piece shoulder-to-hem height + side-seam
        // audit below no longer maps (two stacked pieces carry that length now). The
        // yoke seam is trued by construction and checked in yoke_check + the neck-
        // facing check; skip this half here exactly as the cup-seam split does above.
        if (spec.yoke != 0 &&
            ((find(std::string(half) + " Yoke") && find(std::string(half) + " Body")) ||
             (find(std::string(half) + " Yoke Center") && find(std::string(half) + " Body Center")))) {
            continue;
        }
        if (princess) {
            const PatternPiece* center = find(std::string("Top Center ") + half);
            const PatternPiece* side = find(std::string("Top Side ") + half);
            if (!center || !side) {
                issues.push_back({"top", draft.garment, std::string(half) + " princess panels missing"});
                continue;
            }
            if (boundingBox(center->commands).height < expected - 15) {
                issues.push_back({"top", center->name,
                    fmt("height %.0f, expected about %.0f — hem extension did not apply",
                        boundingBox(center->commands).height, expected)});
            }
            if (extra > 0 && boundingBox(side->commands).height < extra) {
                issues.push_back({"top", side->name,
                    fmt("height %.0f is shorter than the %.0f hem extension", boundingBox(side->commands).height, extra)});
            }
            sideLen = princessTopSideSeam(*side);
        } else {
            const PatternPiece* piece = find(std::string("Top ") + half);
            if (!piece) {
                issues.push_back({"top", draft.garment, std::string(half) + " piece missing"});
                continue;
            }
            if (boundingBox(piece->commands).height < expected - 15) {
                issues.push_back({"top", piece->name,
                    fmt("height %.0f, expected about %.0f — hem extension did not apply",
                        boundingBox(piece->commands).height, expected)});
            }
            if (extra > 0) sideLen = topSideSeamLength(*piece);
        }
    }
    if (frontSide && backSide && std::fabs(*frontSide - *backSide) > pairedSeamTolerance) {
        issues.push_back({"sideseam", "Top", fmt("front side seam %.1f vs back %.1f", *frontSide, *backSide)});
    }
    return issues;
}

// MARK: Neck facings

// The facing's inner edge must retrace the garment neckline exactly; both
// start at move(centerNeck) and reach the neck point after k commands.
// Total bias strip length from a strip's own geometry: width × segment count.
// The strip is drawn as one rectangle per printable segment; the cut note also
// carries the total, but geometry is the single truth here.
double biasStripLength(const PatternPiece& p) {
    const Rect box = boundingBox(p.commands);
    return box.width; // one drawn segment; total is on the cut note
}

std::vector<ValidationIssue> facingIssues(const GarmentSpec& spec, const DraftedPattern& draft,
                                          const BodyMeasurementsSnapshot& m) {
    std::vector<ValidationIssue> issues;

    // Bias binding edge finish (patch 3.10, DEFAULT). A collarless, non-halter
    // neck bound with edgeFinish == BiasBinding carries ONE bias binding strip —
    // "Bias binding (neckline)" when sleeved, "Bias binding (neckline + armholes)"
    // when sleeveless (one notion binds every raw edge). No neck facings.
    const bool realCollar = spec.collarType != static_cast<int>(CollarType::None);
    const bool biasNeck = spec.neckline != Neckline::Halter && !realCollar &&
                          spec.edgeFinish != static_cast<int>(EdgeFinish::Facing);
    if (biasNeck) {
        const PatternPiece* neckBias = nullptr;
        for (const auto& piece : draft.pieces) {
            if (piece.name == "Bias binding (neckline)" ||
                piece.name == "Bias binding (neckline + armholes)") neckBias = &piece;
            if (piece.name.find("Neck Facing") != std::string::npos)
                issues.push_back({"facing", piece.name, "neck facing drafted with a bias binding finish"});
        }
        if (!neckBias) {
            issues.push_back({"facing", draft.garment, "neckline bias binding piece missing"});
            return issues;
        }
        // Trued: the strip's total length (drawn segment × segment count) must
        // equal the drafted neck edge circumference + overlap. Read the total
        // off the cut note the strip carries; fall back to the geometry length.
        const double edge = BodiceBlock::neckEdgeLength(m, spec.neckline);
        const double drawn = biasStripLength(*neckBias);
        const Rect box = boundingBox(neckBias->commands);
        if (box.height < 15 || box.height > 40 || box.width > 1500) {
            issues.push_back({"facing", neckBias->name,
                fmt("neck binding strip %.0f x %.0f mm is not a sane bias strip", box.width, box.height)});
        }
        // Single-segment necks (all in this size range) draw the full length in
        // one rectangle, so the drawn width must cover edge + overlap.
        if (drawn + 1.0 < edge) {
            issues.push_back({"facing", neckBias->name,
                fmt("neck binding %.1f mm shorter than the %.1f mm neck edge", drawn, edge)});
        }
        return issues;
    }

    // Halter: one bias strip binds every raw edge instead of neck facings.
    // The strip must exist, be a sane strip, and be honestly long enough for
    // the edges the bodice reports.
    if (spec.neckline == Neckline::Halter) {
        const PatternPiece* binding = nullptr;
        for (const auto& piece : draft.pieces)
            if (piece.name == "Bias binding (halter)") binding = &piece;
        if (!binding) {
            issues.push_back({"facing", draft.garment, "halter bias binding piece missing"});
            return issues;
        }
        const Rect box = boundingBox(binding->commands);
        if (box.height < 20 || box.height > 45 || box.width > 1500) {
            issues.push_back({"facing", binding->name,
                fmt("binding strip %.0f x %.0f mm is not a sane bias strip", box.width, box.height)});
        }
        for (const auto& piece : draft.pieces) {
            if (piece.name.find("Neck Facing") != std::string::npos) {
                issues.push_back({"facing", piece.name, "neck facing drafted on a halter (binding replaces it)"});
            }
        }
        return issues;
    }
    auto neckLength = [&](const PatternPiece& piece, size_t k) -> std::optional<double> {
        if (piece.commands.size() < k + 1 || piece.commands[0].type != CmdType::Move) return std::nullopt;
        std::vector<PathCommand> path{piece.commands[0]};
        for (size_t i = 1; i <= k; ++i) path.push_back(piece.commands[i]);
        return pathLength(path);
    };
    // The yoke split (yoke.cpp) replaces "Bodice Front"/"Top Front" (and back) with a
    // "<half> Yoke" (upper) + a "<half> Body" (lower). The NECKLINE lives on the Yoke
    // piece (it carries the shoulder + neck edge); the lower Body has no neck edge.
    // But yoke.cpp re-emits the panel outline as a FLATTENED polyline (curves -> 24
    // line segments), so the k-command trick above can't isolate the neck edge on it.
    // Measure the yoke's neck edge geometrically instead: it runs from the center-neck
    // move point along the outline to the neck point (the shoulder-neck corner = the
    // min-y vertex, after which the outline turns toward the armhole/side seam). That
    // is the exact run of edge the neck facing must retrace — the same seam, just
    // polyline-drawn — so a valid facing on a valid yoke still trues to < 1.5 mm.
    auto yokeNeckLength = [&](const PatternPiece& piece) -> std::optional<double> {
        const auto& cmds = piece.commands;
        if (cmds.size() < 3 || cmds[0].type != CmdType::Move) return std::nullopt;
        size_t neckIdx = 0;
        double minY = cmds[0].to.y;
        // Walk only the leading run of Line vertices (the split panel is emitted as
        // lines); the neck point is the lowest-y vertex of that leading run.
        for (size_t i = 1; i < cmds.size(); ++i) {
            if (cmds[i].type != CmdType::Line) break;
            if (cmds[i].to.y < minY - 1e-9) { minY = cmds[i].to.y; neckIdx = i; }
        }
        if (neckIdx < 1) return std::nullopt;
        std::vector<PathCommand> path;
        for (size_t i = 0; i <= neckIdx; ++i) path.push_back(cmds[i]);
        return pathLength(path);
    };
    for (const bool isFront : {true, false}) {
        const char* half = isFront ? "Front" : "Back";
        const PatternPiece* facing = nullptr;
        const PatternPiece* body = nullptr;
        const PatternPiece* yoke = nullptr;
        for (const auto& piece : draft.pieces) {
            if (piece.name == std::string(half) + " Neck Facing") facing = &piece;
            // Dart mode splits into "<half> Yoke"; princess mode splits the center
            // panel into "<half> Yoke Center" (that center piece carries the neck edge
            // on the fold, exactly as "Bodice Center <half>" did before the split).
            if (piece.name == std::string(half) + " Yoke" ||
                piece.name == std::string(half) + " Yoke Center") yoke = &piece;
            for (const char* prefix : {"Bodice Center ", "Bodice ", "Top Center ", "Top "}) {
                if (piece.name == std::string(prefix) + half) { body = &piece; break; }
            }
        }
        // After a yoke split there is no "Bodice/Top <half>" panel — the neck edge
        // moved onto the "<half> Yoke". Treat that yoke as the neck-carrying body so a
        // real facing on a valid yoke draft is NOT falsely reported missing. With
        // neither a body panel NOR a yoke, the facing is genuinely orphaned (a phantom
        // facing with no parent) and must STILL be caught.
        if (!facing || (!body && !yoke)) {
            issues.push_back({"facing", draft.garment,
                std::string(half) + (facing ? " body piece" : " neck facing") + " missing"});
            continue;
        }
        // The square front neckline is two commands; everything else is one.
        const size_t k = (isFront && spec.neckline == Neckline::Square) ? 2 : 1;
        const auto fLen = neckLength(*facing, k);
        // Prefer the un-split body panel's k-command measurement (byte-identical with
        // the yoke off); fall back to the yoke's geometric neck edge after a split.
        const auto bLen = body ? neckLength(*body, k) : yokeNeckLength(*yoke);
        if (!fLen || !bLen) {
            issues.push_back({"facing", facing->name, "unexpected layout, cannot measure the neck edge"});
            continue;
        }
        if (std::fabs(*fLen - *bLen) > 1.5) {
            issues.push_back({"facing", facing->name,
                fmt("inner edge %.1f vs garment neckline %.1f differ by %.1f mm",
                    *fLen, *bLen, std::fabs(*fLen - *bLen))});
        }
    }
    return issues;
}

// MARK: Cutting line

// Cheap per-piece invariant (the deep sampled-distance check lives in
// tests/cutline_check): every real piece carries a cut line whose bounding box
// extends past the sewing line by ~the seam allowance on every free side —
// except across a fold, where it must sit exactly on x = 0.
std::vector<ValidationIssue> cutLineIssues(const DraftedPattern& draft) {
    std::vector<ValidationIssue> issues;
    for (const auto& piece : draft.pieces) {
        const bool strip = piece.name.find("Ruffle") != std::string::npos ||
                           piece.name.find("Bias binding") != std::string::npos;
        const bool zeroSA = piece.seamAllowance <= 0.01;
        if (strip || zeroSA) {
            if (!piece.cutLine.empty()) {
                issues.push_back({"cutline", piece.name, "unexpected cut line on a strip/zero-allowance piece"});
            }
            continue;
        }
        if (piece.cutLine.empty()) {
            issues.push_back({"cutline", piece.name, "cutting line missing"});
            continue;
        }
        for (const auto& cmd : piece.cutLine) {
            if (cmd.type == CmdType::Close) continue;
            if (!std::isfinite(cmd.to.x) || !std::isfinite(cmd.to.y)) {
                issues.push_back({"cutline", piece.name, "non-finite cut line coordinate"});
                break;
            }
        }
        // Flattened boxes: boundingBox() counts curve CONTROL points, which sit
        // outside bulgy curves (balloon sleeve) and would fake a violation.
        auto flatBox = [](const std::vector<PathCommand>& cmds) {
            double minX = 1e18, minY = 1e18, maxX = -1e18, maxY = -1e18;
            Point cur{0, 0};
            auto eat = [&](Point p) {
                minX = std::min(minX, p.x); maxX = std::max(maxX, p.x);
                minY = std::min(minY, p.y); maxY = std::max(maxY, p.y);
            };
            for (const auto& c : cmds) {
                if (c.type == CmdType::Move || c.type == CmdType::Line) { eat(c.to); cur = c.to; }
                else if (c.type == CmdType::Curve) {
                    for (const Point& p : flattenCubic(cur, c.to, c.cp1, c.cp2, 12)) eat(p);
                    cur = c.to;
                }
            }
            return Rect{minX, minY, maxX - minX, maxY - minY};
        };
        const Rect sew = flatBox(piece.commands);
        const Rect cut = flatBox(piece.cutLine);
        const bool onFold = piece.cutInstruction.find("on fold") != std::string::npos;
        // Guardrail only (sharp tips legitimately grow less along an axis than
        // the full allowance — the sampled distance audit lives in
        // tests/cutline_check): the cut box must grow OUTWARD on every free
        // side, and never cross a fold.
        const double minGrow = 1.0;
        if (onFold) {
            if (cut.x < -0.1) {
                issues.push_back({"cutline", piece.name,
                    fmt("cut line crosses the fold by %.1f mm", -cut.x)});
            }
        } else if (sew.x - cut.x < minGrow) {
            issues.push_back({"cutline", piece.name, "cut line does not clear the sewing line (left)"});
        }
        if (cut.x + cut.width - (sew.x + sew.width) < minGrow ||
            sew.y - cut.y < minGrow ||
            cut.y + cut.height - (sew.y + sew.height) < minGrow) {
            issues.push_back({"cutline", piece.name, "cut line does not clear the sewing line on every side"});
        }
    }
    return issues;
}

// MARK: Keyhole

// When the keyhole is requested it must be REAL: the teardrop stitch line on
// the front center piece (inside the piece, below the neck edge) plus a facing
// that covers the line with margin all around — or an honest "skipped" note.
std::vector<ValidationIssue> keyholeIssues(const GarmentSpec& spec, const DraftedPattern& draft) {
    std::vector<ValidationIssue> issues;
    if (!spec.keyhole) return issues;

    const PatternPiece* facing = nullptr;
    const PatternPiece* front = nullptr;
    for (const auto& piece : draft.pieces) {
        if (piece.name == "Keyhole Facing") facing = &piece;
        for (const char* name : {"Bodice Center Front", "Bodice Front",
                                 "Top Center Front", "Top Front"}) {
            if (piece.name == name) front = &piece;
        }
    }
    if (!facing) {
        for (const auto& step : draft.guideSteps)
            if (step.rfind("Keyhole: skipped", 0) == 0) return issues; // honest skip
        issues.push_back({"keyhole", draft.garment,
            "keyhole requested but neither drafted nor declared skipped"});
        return issues;
    }
    if (!front || front->markings.size() < 3) {
        issues.push_back({"keyhole", draft.garment, "front piece missing the keyhole stitch line"});
        return issues;
    }

    // The teardrop is the last three marking commands: move + two curves,
    // starting and ending on the CF fold (x = 0).
    const auto& mk = front->markings;
    const PathCommand& a = mk[mk.size() - 3];
    const PathCommand& b = mk[mk.size() - 2];
    const PathCommand& c = mk[mk.size() - 1];
    if (a.type != CmdType::Move || b.type != CmdType::Curve || c.type != CmdType::Curve ||
        std::fabs(a.to.x) > 0.01 || std::fabs(c.to.x) > 0.01) {
        issues.push_back({"keyhole", front->name, "keyhole stitch line is not a CF teardrop"});
        return issues;
    }
    const Rect pieceBox = boundingBox(front->commands);
    const Rect holeBox = boundingBox({PathCommand::move(a.to), b, c});
    if (a.to.y <= front->commands[0].to.y) {
        issues.push_back({"keyhole", front->name, "keyhole starts above the neck edge"});
    }
    if (holeBox.y + holeBox.height > pieceBox.y + pieceBox.height - 40) {
        issues.push_back({"keyhole", front->name, "keyhole runs into the waist area"});
    }
    if (holeBox.x + holeBox.width > pieceBox.x + pieceBox.width) {
        issues.push_back({"keyhole", front->name, "keyhole wider than the piece"});
    }
    const Rect facingBox = boundingBox(facing->commands);
    if (facingBox.y > holeBox.y - 20 ||
        facingBox.y + facingBox.height < holeBox.y + holeBox.height + 20 ||
        facingBox.x + facingBox.width < holeBox.x + holeBox.width + 20) {
        issues.push_back({"keyhole", facing->name,
            "facing does not cover the keyhole stitch line with enough margin"});
    }
    return issues;
}

} // namespace

// MARK: Per piece geometry

std::vector<ValidationIssue> geometryIssues(const PatternPiece& piece) {
    std::vector<ValidationIssue> issues;

    for (const auto& points : {allPoints(piece.commands), allPoints(piece.markings)}) {
        for (const Point& p : points) {
            if (!std::isfinite(p.x) || !std::isfinite(p.y)) {
                issues.push_back({"finite", piece.name, fmt("non-finite coordinate (%f, %f)", p.x, p.y)});
                return issues; // everything downstream would be noise
            }
        }
    }

    const Rect box = boundingBox(piece.commands);
    if (box.width <= 0 || box.height <= 0) {
        issues.push_back({"print", piece.name,
            "empty bounding box — the PDF exporter would silently skip this piece"});
        return issues;
    }
    if (std::max(box.width, box.height) > maxPieceSpan) {
        issues.push_back({"print", piece.name,
            fmt("piece spans %.0f mm, beyond the %.0f mm tiled print sanity cap",
                std::max(box.width, box.height), maxPieceSpan)});
    }

    for (auto& issue : kinkIssues(piece)) issues.push_back(issue);
    for (auto& issue : selfIntersectionIssues(piece)) issues.push_back(issue);
    for (auto& issue : markingIssues(piece, box)) issues.push_back(issue);
    return issues;
}

std::vector<ValidationIssue> issues(
    const GarmentSpec& spec,
    const BodyMeasurementsSnapshot& m,
    const DraftedPattern& draft
) {
    std::vector<ValidationIssue> result;

    // Body-plausibility gate. An anatomically impossible body (a waist far under
    // half the bust, or a hip well under two thirds of it) is almost always a
    // measurement typo. The drafter would still produce pieces, but the side
    // seam has to nip so hard that the princess panels fold through themselves —
    // the user then sees cryptic "self-intersection" geometry errors instead of
    // the real cause. Catch it first with ONE legible reason so the web's
    // "check your measurements" copy is the honest first thing they read. The
    // thresholds sit far below any real adult body (measured range: waist
    // 0.5–0.95×bust, hip 0.69–1.25×bust) so no plausible body is ever refused.
    if (m.bustCM > 0) {
        if (m.waistCM < 0.45 * m.bustCM) {
            result.push_back({"proportion", draft.garment,
                fmt("waist %.0f cm is implausibly small next to a %.0f cm bust — please re-check your measurements",
                    m.waistCM, m.bustCM)});
        }
        if (m.hipCM < 0.60 * m.bustCM) {
            result.push_back({"proportion", draft.garment,
                fmt("hip %.0f cm is implausibly small next to a %.0f cm bust — please re-check your measurements",
                    m.hipCM, m.bustCM)});
        }
        if (!result.empty()) return result; // one clear reason beats a wall of geometry noise
    }

    if (draft.pieces.empty()) {
        result.push_back({"pieces", draft.garment, "no pieces drafted"});
        return result;
    }
    if (!std::isfinite(draft.fabricMeters140) || draft.fabricMeters140 <= 0 || draft.fabricMeters140 > 30) {
        result.push_back({"fabric", draft.garment,
            fmt("fabric estimate %.1f m is not sane", draft.fabricMeters140)});
    }

    for (const auto& piece : draft.pieces) {
        for (auto& issue : geometryIssues(piece)) result.push_back(issue);
    }
    for (auto& issue : cutLineIssues(draft)) result.push_back(issue);

    switch (spec.garment) {
        case GarmentType::Skirt: {
            for (auto& issue : skirtIssues(spec, m, draft, SkirtBlock::waistEaseFor(spec.fabric), nullptr)) result.push_back(issue);
            break;
        }
        case GarmentType::Dress: {
            BodiceBlock::BodiceOptions options;
            options.neckline = spec.neckline;
            options.shaping = spec.shaping;
            options.waistline = spec.waistline;
            options.fabric = spec.fabric;
            // Dropped shoulder reshapes the armhole in the drafter — recompute the
            // reference bodice the SAME way so the sleeve cap is measured against
            // the dropped armhole it was actually fit to. Set/Raglan → unchanged.
            if (spec.neckline != Neckline::Halter &&
                static_cast<ShoulderStyle>(spec.shoulderStyle) == ShoulderStyle::Dropped)
                options.shoulderStyle = ShoulderStyle::Dropped;
            const BodiceDraft bodice = BodiceBlock::draft(m, options);
            for (auto& issue : bodiceIssues(spec, bodice, m)) result.push_back(issue);
            for (auto& issue : sleeveIssues(spec, m, draft, bodice)) result.push_back(issue);
            for (auto& issue : skirtIssues(spec, m, draft, BodiceBlock::waistEaseFor(spec.fabric), &bodice)) result.push_back(issue);
            for (auto& issue : facingIssues(spec, draft, m)) result.push_back(issue);
            for (auto& issue : keyholeIssues(spec, draft)) result.push_back(issue);
            break;
        }
        case GarmentType::Top: {
            // Recompute with the same parameters the top block drafted with.
            BodiceBlock::BodiceOptions options;
            options.neckline = spec.neckline;
            options.shaping = spec.shaping;
            options.fabric = spec.fabric;
            if (spec.shaping == Shaping::Princess) {
                options.extendBelowWaist = belowWaist(spec.topLength);
                options.hipHalfQuarter = (m.hipMM() / 4) * 1.04;
            }
            if (spec.neckline != Neckline::Halter &&
                static_cast<ShoulderStyle>(spec.shoulderStyle) == ShoulderStyle::Dropped)
                options.shoulderStyle = ShoulderStyle::Dropped;
            const BodiceDraft bodice = BodiceBlock::draft(m, options);
            for (auto& issue : bodiceIssues(spec, bodice, m)) result.push_back(issue);
            for (auto& issue : sleeveIssues(spec, m, draft, bodice)) result.push_back(issue);
            for (auto& issue : topIssues(spec, draft, bodice)) result.push_back(issue);
            for (auto& issue : facingIssues(spec, draft, m)) result.push_back(issue);
            for (auto& issue : keyholeIssues(spec, draft)) result.push_back(issue);
            break;
        }
    }

    // Wearability gate (2026-07-17): the pattern is internally consistent above;
    // now prove a human can actually put it on and wear it (head entry, a
    // declared opening not collapsed to a fold, a finished sleeveless armhole).
    // An outside LLM found a green-but-unwearable draft; these turn that lesson
    // into a permanent, deterministic, zero-cost gate.
    for (auto& issue : Wearability::issues(spec, m, draft)) result.push_back(issue);

    // Guide <-> piece two-way gate (2026-07-18): every drafted piece must be
    // sewn by some guide step, and every separable piece the guide names must
    // exist in the draft. The courtney guide once sewed a bias binding the cut
    // list hid — a violation here means the deliverable lies, so no PDF.
    {
        const GuideAudit audit = auditGuide(draft);
        for (const auto& orphan : audit.orphanPieces)
            result.push_back({"guideCoverage", orphan, "piece is drafted but no guide step mentions it"});
        for (const auto& phantom : audit.phantomSteps)
            result.push_back({"guideCoverage", "guide", "step references an undrafted piece: " + phantom});
    }

    return result;
}

} // namespace PatternValidator
} // namespace stitchu
