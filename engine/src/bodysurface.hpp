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
#include <string>
#include <vector>

#include "measurements.hpp"
#include "volume.hpp"

namespace stitchu {

// One anatomical level: a height up the body and the girth that must be
// measured there. widthToDepth is the section aspect (side-to-side over
// front-to-back); it is a declared ASSUMPTION, not a chart value.
struct BodyLevel {
    std::string name;
    double heightMM = 0.0;
    double girthMM = 0.0;
    double widthToDepth = 1.0;
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

    const std::vector<BodyLevel>& levels() const { return levels_; }
    double parameterFor(double heightMM) const;

    // Semi-axes of the elliptic section at t: a across the body (side to side),
    // b through it (front to back). The garment shell offsets THIS curve in its
    // own plane, which is what a girth ease actually means.
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
    double zCentre_ = 0.0;
    double zHalf_ = 0.0;
};

// Perimeter of the ellipse with semi-axes a, b by Gauss-Legendre over the
// parameter angle. No series, no Ramanujan: the integral is the definition.
double ellipsePerimeter(double a, double b, int order = 12);

}  // namespace stitchu
