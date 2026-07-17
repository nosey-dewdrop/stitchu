// Sweetheart neckline check: proves the heart shape is REAL geometry — a deep
// front neckline whose mirrored halves meet in a cleft notch (steep tangent at
// center front) and arc convexly over the bust — with a matching facing, valid
// drafts, and every other neckline untouched.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

static const PatternPiece* piece(const DraftedPattern& d, const std::string& name) {
    for (const auto& p : d.pieces)
        if (p.name.find(name) != std::string::npos) return &p;
    return nullptr;
}

// The front neck segment: first command is move(centerNeck), second is the
// neckline itself (one cubic for sweetheart).
struct Neck { Point start; PathCommand curve; };
static Neck frontNeck(const PatternPiece& p) {
    return {p.commands[0].to, p.commands[1]};
}

static Point bezier(const Point& p0, const PathCommand& c, double t) {
    const double mt = 1 - t;
    return {mt*mt*mt*p0.x + 3*mt*mt*t*c.cp1.x + 3*mt*t*t*c.cp2.x + t*t*t*c.to.x,
            mt*mt*mt*p0.y + 3*mt*mt*t*c.cp1.y + 3*mt*t*t*c.cp2.y + t*t*t*c.to.y};
}

int main() {
    const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36}; // EU ~38, cm

    GarmentSpec sweet;
    sweet.garment = GarmentType::Dress;
    sweet.neckline = Neckline::Sweetheart;
    // This test validates the shaped FACING geometry, so opt into the facing
    // finish (patch 3.10 made bias binding the default neckline finish) and pin
    // princess shaping (2026-07-17 made darts the default, which renames the
    // front panel "Bodice Front"; this test reads "Bodice Center Front").
    sweet.edgeFinish = static_cast<int>(EdgeFinish::Facing);
    sweet.shaping = Shaping::Princess;
    GarmentSpec scoop = sweet;  scoop.neckline = Neckline::Scoop;
    GarmentSpec vneck = sweet;  vneck.neckline = Neckline::VNeck;

    const DraftedPattern dSweet = GarmentDrafter::draft(sweet, m);
    const DraftedPattern dScoop = GarmentDrafter::draft(scoop, m);
    const DraftedPattern dVneck = GarmentDrafter::draft(vneck, m);

    std::printf("Sweetheart dress (EU38):\n");
    check(PatternValidator::issues(sweet, m, dSweet).empty(), "sweetheart dress draft valid");
    check(piece(dSweet, "Front Neck Facing") != nullptr, "front neck facing drafted");
    check(dSweet.pieces.size() == dScoop.pieces.size(),
          "same piece count as every other neckline (no structural change)");

    const PatternPiece* front = piece(dSweet, "Bodice Center Front");
    if (!front) front = piece(dSweet, "Bodice Front");
    check(front != nullptr, "front bodice piece present");
    if (front) {
        const Neck n = frontNeck(*front);
        check(n.curve.type == CmdType::Curve, "sweetheart neckline is one smooth cubic");
        const double d = n.start.y;      // cleft depth at center front
        const double w = n.curve.to.x;   // neck width at the shoulder

        // Depth: between scoop and v-neck — a real decollete, not a crew.
        const Neck sc = frontNeck(*piece(dScoop, "Bodice Center Front"));
        const Neck vn = frontNeck(*piece(dVneck, "Bodice Center Front"));
        std::printf("      cleft depth %.0f mm (scoop %.0f, v-neck %.0f), width %.0f mm\n",
                    d, sc.start.y, vn.start.y, w);
        check(d > sc.start.y && d < vn.start.y, "cleft depth sits between scoop and v-neck");

        // The heart: tangent at center front is steep -> mirrored halves meet
        // in a notch, not a smooth U. Tangent direction = cp1 - start.
        const double dx = n.curve.cp1.x - n.start.x, dy = n.curve.cp1.y - n.start.y;
        const double slope = std::fabs(dy / dx);
        std::printf("      tangent at CF rises %.2f mm per mm (crew/scoop start flat: 0.00)\n", slope);
        check(dy < 0 && slope > 1.2, "steep rising tangent at CF = the cleft notch when mirrored");

        // The lobe: mid-curve sits well ABOVE the straight chord (convex over
        // the bust), unlike scoop which hangs on/below the chord (concave U).
        double maxLift = 0, scoopLift = 0;
        for (int i = 1; i < 8; ++i) {
            const double t = i / 8.0;
            const Point p = bezier(n.start, n.curve, t);
            const double chordY = d * (1 - p.x / w);
            maxLift = std::max(maxLift, chordY - p.y);
            const Point q = bezier(sc.start, sc.curve, t);
            const double chordQ = sc.start.y * (1 - q.x / sc.curve.to.x);
            scoopLift = std::max(scoopLift, chordQ - q.y);
        }
        std::printf("      lobe lift above the chord: sweetheart %.1f mm vs scoop %.1f mm\n",
                    maxLift, scoopLift);
        check(maxLift > 15, "curve arcs >15 mm above the chord = the bust lobe");
        check(scoopLift <= 0.5, "scoop stays on/below the chord (sweetheart really is new geometry)");
    }

    // Tops get the same neckline + facing and stay valid.
    GarmentSpec top;
    top.garment = GarmentType::Top;
    top.neckline = Neckline::Sweetheart;
    top.edgeFinish = static_cast<int>(EdgeFinish::Facing);
    top.sleeveStyle = SleeveStyle::Straight;
    const DraftedPattern dTop = GarmentDrafter::draft(top, m);
    check(PatternValidator::issues(top, m, dTop).empty(), "sweetheart top (with sleeves) valid");

    std::printf(failures == 0 ? "ALL SWEETHEART CHECKS PASS\n" : "%d SWEETHEART CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
