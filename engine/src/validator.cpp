#include "validator.hpp"

#include <algorithm>
#include <cmath>
#include <cstdio>
#include <optional>

#include "bodice.hpp"
#include "skirt.hpp"
#include "sleeve.hpp"

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

std::vector<ValidationIssue> bodiceIssues(const BodiceDraft& bodice, const BodyMeasurementsSnapshot& m) {
    std::vector<ValidationIssue> issues;

    const double seamDelta = std::fabs(bodice.frontSideSeam - bodice.backSideSeam);
    if (seamDelta > pairedSeamTolerance) {
        issues.push_back({"sideseam", "Bodice",
            fmt("front side seam %.1f vs back %.1f differ by %.1f mm (max %.1f)",
                bodice.frontSideSeam, bodice.backSideSeam, seamDelta, pairedSeamTolerance)});
    }

    const double underbust = std::max(m.bustMM() - BodiceBlock::underbustOffset, m.waistMM());
    const double expectedFrontChest = (m.bustMM() / 4) * (1 + BodiceBlock::chestEase);
    const double expectedBackChest = (underbust / 4) * (1 + BodiceBlock::chestEase);
    if (std::fabs(bodice.frontChestWidth - expectedFrontChest) > chestWidthTolerance) {
        issues.push_back({"chest", "Bodice Front",
            fmt("chest width %.1f, expected %.1f — bust ease is being eaten", bodice.frontChestWidth, expectedFrontChest)});
    }
    if (std::fabs(bodice.backChestWidth - expectedBackChest) > chestWidthTolerance) {
        issues.push_back({"chest", "Bodice Back",
            fmt("chest width %.1f, expected %.1f", bodice.backChestWidth, expectedBackChest)});
    }

    // Dart + seam take-in must reproduce the waist target exactly.
    const double frontTarget = (m.waistMM() * (1 - BodiceBlock::backWaistShare) / 2) * (1 + BodiceBlock::waistEase);
    const double backTarget = (m.waistMM() * BodiceBlock::backWaistShare / 2) * (1 + BodiceBlock::waistEase);
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
    return issues;
}

// MARK: Sleeve

std::vector<ValidationIssue> sleeveIssues(
    const GarmentSpec& spec,
    const DraftedPattern& draft,
    const BodiceDraft& bodice
) {
    if (spec.sleeveStyle == SleeveStyle::None) return {};
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
    const double target = bodice.armholeLength * (1 + SleeveBlock::capEase);
    const double ease = capLength / bodice.armholeLength - 1;
    std::vector<ValidationIssue> issues;
    if (std::fabs(capLength - target) > capLengthTolerance) {
        issues.push_back({"cap", sleeve->name,
            fmt("cap seam %.1f vs target %.1f (armhole %.1f + %.0f%% ease) — convergence missed by %.1f mm",
                capLength, target, bodice.armholeLength, SleeveBlock::capEase * 100, std::fabs(capLength - target))});
    }
    if (ease < capEaseMin || ease > capEaseMax) {
        issues.push_back({"cap", sleeve->name,
            fmt("cap ease %.1f%% outside the %.0f-%.0f%% window", ease * 100, capEaseMin * 100, capEaseMax * 100)});
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
            // Quarter pieces and circle panels both open with the waist edge.
            return pathLength({PathCommand::move(start), piece.commands[1]});
        case SkirtStyle::Gathered:
            if (piece.commands[1].type != CmdType::Line) return std::nullopt;
            return std::fabs(piece.commands[1].to.x - start.x);
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
        if (piece.name == "Front" || piece.name == "Back" || hasPrefix(piece.name, "Skirt")) {
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
        sewnWaist += (*waist - dartIntake(*piece)) * 2;
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

    // Quarter skirts: front and back side seams must match.
    if (spec.skirtStyle == SkirtStyle::ALine || spec.skirtStyle == SkirtStyle::Straight) {
        const PatternPiece* front = nullptr;
        const PatternPiece* back = nullptr;
        for (const auto* piece : skirtPieces) {
            if (!front && hasSuffix(piece->name, "Front")) front = piece;
            if (!back && hasSuffix(piece->name, "Back")) back = piece;
        }
        if (front && back) {
            const auto f = skirtSideSeamLength(*front);
            const auto b = skirtSideSeamLength(*back);
            if (f && b && std::fabs(*f - *b) > pairedSeamTolerance) {
                issues.push_back({"sideseam", "Skirt",
                    fmt("front side seam %.1f vs back %.1f", *f, *b)});
            }
        }
    }

    // A dress zipper runs through bodice and skirt: the skirt back (or a
    // half-circle panel) must be cut 2 so a center back seam exists.
    if (spec.garment == GarmentType::Dress) {
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
// hem curve to center, center line, close.
std::optional<double> topSideSeamLength(const PatternPiece& piece) {
    const size_t count = piece.commands.size();
    if (count < 5 ||
        piece.commands[count - 5].type != CmdType::Curve ||
        piece.commands[count - 4].type != CmdType::Curve) return std::nullopt;
    return pathLength({PathCommand::move(piece.commands[count - 5].to), piece.commands[count - 4]});
}

std::vector<ValidationIssue> topIssues(
    const GarmentSpec& spec,
    const DraftedPattern& draft,
    const BodiceDraft& bodice
) {
    std::vector<ValidationIssue> issues;
    const double extra = belowWaist(spec.topLength);
    const PatternPiece* front = nullptr;
    const PatternPiece* back = nullptr;
    for (const auto& piece : draft.pieces) {
        if (piece.name == "Top Front") front = &piece;
        if (piece.name == "Top Back") back = &piece;
    }
    if (!front || !back) {
        return {{"top", draft.garment, "top front/back pieces missing"}};
    }
    // Guard against the hem extension silently not applying.
    const double expectedFront = bodice.frontLength + extra;
    const double expectedBack = bodice.backLength + extra;
    if (boundingBox(front->commands).height < expectedFront - 15) {
        issues.push_back({"top", front->name,
            fmt("height %.0f, expected about %.0f — hem extension did not apply",
                boundingBox(front->commands).height, expectedFront)});
    }
    if (boundingBox(back->commands).height < expectedBack - 15) {
        issues.push_back({"top", back->name,
            fmt("height %.0f, expected about %.0f — hem extension did not apply",
                boundingBox(back->commands).height, expectedBack)});
    }
    if (extra > 0) {
        const auto f = topSideSeamLength(*front);
        const auto b = topSideSeamLength(*back);
        if (f && b && std::fabs(*f - *b) > pairedSeamTolerance) {
            issues.push_back({"sideseam", "Top", fmt("front side seam %.1f vs back %.1f", *f, *b)});
        }
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

    switch (spec.garment) {
        case GarmentType::Skirt: {
            for (auto& issue : skirtIssues(spec, m, draft, SkirtBlock::waistEase, nullptr)) result.push_back(issue);
            break;
        }
        case GarmentType::Dress: {
            const BodiceDraft bodice = BodiceBlock::draft(m, spec.neckline);
            for (auto& issue : bodiceIssues(bodice, m)) result.push_back(issue);
            for (auto& issue : sleeveIssues(spec, draft, bodice)) result.push_back(issue);
            for (auto& issue : skirtIssues(spec, m, draft, BodiceBlock::waistEase, &bodice)) result.push_back(issue);
            break;
        }
        case GarmentType::Top: {
            const BodiceDraft bodice = BodiceBlock::draft(m, spec.neckline);
            for (auto& issue : bodiceIssues(bodice, m)) result.push_back(issue);
            for (auto& issue : sleeveIssues(spec, draft, bodice)) result.push_back(issue);
            for (auto& issue : topIssues(spec, draft, bodice)) result.push_back(issue);
            break;
        }
    }
    return result;
}

} // namespace PatternValidator
} // namespace stitchu
