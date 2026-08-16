#pragma once
// A body as a closed parametric SURFACE, built from the seven size-chart
// numbers and nothing else. Cross sections are ellipses, so the girth at a
// level has no closed form and has to be recovered from an elliptic integral —
// the calibration is therefore exact by construction, not fitted.
//
// The closure trick matters. Writing the section scale as sigmaHat(t)·sin(t)
// with sigmaHat a C² spline makes the surface close at both poles the way a
// sphere does (scale vanishing linearly in t while dz/dt vanishes), so the
// whole torso is one regular C² surface. That is what lets Gauss-Bonnet come
// back as a clean chi=2 and report the topology of a body that was never
// labelled as closed.
//
// Units mm.
#include <cmath>
#include <string>
#include <vector>

#include "measurements.hpp"
#include "volume.hpp"

namespace stitchu {

// One anatomical level: a height up the body and the girth that must be
// measured there. widthToDepth is the section aspect (side-to-side over
// front-to-back); it is a declared ASSUMPTION, not a chart value.
// backArcFraction is the share of the girth that belongs to the BACK half —
// this one is NOT an assumption: GarmentCode's own programs use back_width the
// same way (bodice.py `front_frac = (bust - back_width)/2/bust`, bands.py
// `waist_back_frac = waist_back_width / waist`), i.e. an ARC of the girth, not
// a chord. 0.5 means "no front/back difference".
struct BodyLevel {
    std::string name;
    double heightMM = 0.0;
    double girthMM = 0.0;
    double widthToDepth = 1.0;
    double backArcFraction = 0.5;
};

// A body cross-section as a CONVEX PLANE CURVE with a front and a back.
//
// A centred ellipse (the model this replaces) is symmetric about both axes, so
// the front panel and the back panel of any garment came out identical — the
// printpack referee measured exactly that: all four torso panels one shape to
// 0.0000mm. No real dress has that. The minimal honest fix keeps the curve
// analytic and adds ONE parameter:
//
//     c(phi) = ( a*cos(phi),  bm*sin(phi) + bd*sin^2(phi) )
//
// front depth (phi=pi/2) = bm + bd, back depth (phi=3pi/2) = bm - bd, and the
// side points (phi=0, pi) stay exactly on the x-axis, which is where the side
// seam belongs. The curve is C-infinity: no blend, no seam in the model.
//
// Convexity is closed form, not a scan. With x = a cos, y = bm sin + bd sin^2:
//     x'y'' - y'x'' = a * (bm + 2*bd*sin^3(phi))
// so the section is strictly convex exactly when bm > 2*|bd|. That matters:
// Steiner's perimeter identity (P_d = P + 2*pi*d) and the shell's refusal law
// (d < smallest radius of curvature) both need convexity, and now both are
// decidable by one inequality.
struct Section {
    double a = 1.0;   // width semi-axis, side to side
    double bm = 1.0;  // mean depth
    double bd = 0.0;  // front/back asymmetry: front = bm+bd, back = bm-bd

    double x(double phi) const { return a * std::cos(phi); }
    double y(double phi) const {
        const double s = std::sin(phi);
        return bm * s + bd * s * s;
    }
    double dx(double phi) const { return -a * std::sin(phi); }
    double dy(double phi) const {
        return std::cos(phi) * (bm + 2.0 * bd * std::sin(phi));
    }
    double speed(double phi) const {
        const double u = dx(phi), v = dy(phi);
        return std::sqrt(u * u + v * v);
    }
    // signed curvature; positive everywhere on a convex section
    double curvature(double phi) const {
        const double s = std::sin(phi);
        const double sp = speed(phi);
        return a * (bm + 2.0 * bd * s * s * s) / (sp * sp * sp);
    }
    bool convex() const { return bm > 2.0 * std::fabs(bd); }
    // smallest radius of curvature — the shell refuses to exist past this d
    double minRadiusOfCurvature(int order = 24) const;

    double arcLength(double phi0, double phi1, int order = 24) const;
    double perimeter(int order = 24) const;
    double backArc(int order = 24) const;  // phi in [pi, 2pi]
    // Enclosed area by Green's theorem, A = 1/2 * closed integral of (x dy - y dx).
    // This replaces pi*a*b, which was only ever the ellipse's answer.
    double area(int order = 24) const;

    // Outward unit normal, rotate the tangent by -90 deg: n = (y', -x')/|c'|
    void normal(double phi, double& nx, double& ny) const;
    // The outer parallel curve at distance d. For a convex section this is the
    // Steiner offset and |c_d'| = |c'|*(1 + d*kappa) exactly, which is why the
    // perimeter grows by exactly 2*pi*d with no fitted constant anywhere.
    void offsetPoint(double d, double phi, double& px, double& py) const;
};

class BodySurface {
public:
    // Builds the levels from a size-chart body. capMM is how far the smooth
    // pole caps reach past the topmost and bottommost level.
    BodySurface(const BodyMeasurementsSnapshot& body, double statureMM, double capMM);

    // r(t, phi): t in [0, pi] runs bottom pole to top pole, phi in [0, 2pi].
    Surface surface() const;

    // Arc length of the section at the given level, measured by integrating
    // the section curve. This is the number the chart girth is checked against.
    double measuredGirthMM(const BodyLevel& level, int order = 12) const;

    // Arc of that same section belonging to the BACK. This is the number that
    // says the body has a front and a back at all; it is checked against
    // BodyLevel::backArcFraction, which came from the chart, not from a guess.
    double measuredBackArcMM(const BodyLevel& level, int order = 12) const;

    const std::vector<BodyLevel>& levels() const { return levels_; }
    double parameterFor(double heightMM) const;

    // THE section at t — the one object every consumer should ask for. Carries
    // the front/back asymmetry that (a, b) alone cannot express.
    Section sectionAt(double t) const;

    // Semi-axes at t: a across the body (side to side), b the MEAN depth
    // (front to back). Kept because callers that only need a bounding scale
    // still work, but note it DISCARDS the front/back difference — anything
    // that offsets, measures a girth, or cuts a panel must use sectionAt().
    void sectionSemiAxes(double t, double& a, double& b) const;
    double heightAt(double t) const;

private:
    struct Spline {
        std::vector<double> t, y, m;  // knots, values, second derivatives
        double at(double x) const;
    };

    std::vector<BodyLevel> levels_;
    std::vector<double> knotT_;
    Spline sigmaHat_;   // section scale divided by sin(t)
    Spline aspect_;     // widthToDepth
    Spline asym_;       // bd/bm, the front/back shape parameter (scale-free)
    double zCentre_ = 0.0;
    double zHalf_ = 0.0;
};

// Perimeter of the ellipse with semi-axes a, b by Gauss-Legendre over the
// parameter angle. No series, no Ramanujan: the integral is the definition.
double ellipsePerimeter(double a, double b, int order = 12);

}  // namespace stitchu
