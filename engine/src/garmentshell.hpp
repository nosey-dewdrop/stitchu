#pragma once
// A GARMENT as a surface, built from a body surface and nothing but ease.
//
// The whole point of this file is that "8 cm of bust ease" stops being a number
// a draftsman types into a formula and becomes a geometric operation with a
// theorem behind it. A section of the body is a convex plane curve. Ease is the
// OUTER PARALLEL BODY of that curve at distance d. Steiner's formulae say
// exactly what that costs:
//
//     perimeter(K_d) = perimeter(K) + 2*pi*d
//     area(K_d)      = area(K) + d*perimeter(K) + pi*d^2
//
// Both are identities for any convex K, not approximations for an ellipse. So
// the offset a girth ease implies is a division, d = ease / (2*pi), and it is
// EXACT. No fitted constant enters the garment anywhere. The engine can then
// hand back the ease as a VOLUME in cm^3 — the thing a wearer actually feels —
// instead of a handful of millimetres quoted at three rings.
//
// The same convexity that makes Steiner true also says when the shell breaks:
// the parallel curve self-intersects the moment d reaches the smallest radius
// of curvature of the section. For an ellipse with semi-axes a >= b that radius
// is b^2/a, in closed form. The shell REFUSES to exist past it rather than
// drawing a garment that folds through itself.
//
// Units mm.
#include <string>
#include <vector>

#include "bodysurface.hpp"
#include "volume.hpp"

namespace stitchu {

// Ease declared the way patternmaking declares it: extra GIRTH at a named
// anatomical ring, in millimetres. Nothing here is a normal offset; the
// conversion is the engine's job and it is a theorem.
struct EaseRing {
    std::string level;        // must name a level of the BodySurface
    double girthEaseMM = 0.0;
};

struct ShellMeasurement {
    double areaMM2 = 0.0;          // garment surface area
    double garmentVolumeMM3 = 0.0; // enclosed by shell + neck cap + hem cap
    double bodyVolumeMM3 = 0.0;    // same caps, zero ease
    double easeVolumeMM3 = 0.0;    // garment minus body — the number that matters
    // Steiner is used as construction, so it is also checked as a witness:
    // the offset girth is re-measured off the drawn curve and compared with
    // girth + 2*pi*d. Worst absolute disagreement over the sampled rings.
    double worstSteinerGirthMM = 0.0;
    double worstSteinerAreaMM2 = 0.0;
};

// Where and why the shell refuses to exist.
struct PinchReport {
    bool ok = true;
    double t = 0.0;               // parameter of the worst ring
    double heightMM = 0.0;
    double offsetMM = 0.0;        // d asked for there
    double minRadiusMM = 0.0;     // b^2/a of that section
    double marginMM = 0.0;        // minRadius - offset; negative means folded
};

class GarmentShell {
public:
    // topHeightMM / bottomHeightMM are the neckline and hem levels: a garment is
    // an OPEN tube, and where it starts and stops is a design decision, not a
    // body fact.
    GarmentShell(const BodySurface& body,
                 const std::vector<EaseRing>& ease,
                 double topHeightMM,
                 double bottomHeightMM);

    // r(t, phi) over [tTop, tBottom] x [0, 2pi].
    Surface surface() const;

    double tTop() const { return tTop_; }
    double tBottom() const { return tBottom_; }

    // Normal offset at t, in mm. This is ease/(2pi), splined through the rings.
    double offsetMM(double t) const;

    // Girth of the garment section, integrated off the drawn offset curve.
    double sectionGirthMM(double t, int order = 16) const;
    // Area enclosed by that same drawn curve.
    double sectionAreaMM2(double t, int order = 16) const;

    PinchReport pinch(int samples = 1024) const;
    ShellMeasurement measure(int cellsT = 24, int cellsPhi = 24, int order = 8) const;

private:
    struct Spline {
        std::vector<double> t, y, m;
        double at(double x) const;
    };

    const BodySurface* body_ = nullptr;
    Spline offset_;
    double tTop_ = 0.0;
    double tBottom_ = 0.0;

    // Offset section curve and its enclosed area / perimeter, for a given d.
    void sectionAt(double t, double& a, double& b, double& d) const;
    // THE section at t, front and back included. Every geometric quantity in
    // this class goes through it; sectionAt()'s (a, b) cannot say where the
    // front is, and a garment cut from (a, b) alone has no front and no back.
    Section sectionCurve(double t) const;
    double capContribution(double t, double sign) const;
};

}  // namespace stitchu
