#pragma once
// Stitchu volume kernel. Every quantity here is an INTEGRAL over a parametric
// surface, not a triangle sum: area from the first fundamental form, enclosed
// volume from the divergence theorem, centroid from the second moment identity,
// and total Gaussian curvature from the second fundamental form. The last one
// is carried on purpose — Gauss-Bonnet (∮K dA = 2πχ) lets a closed surface
// prove its own topology out of the same integration pass that measured it.
//
// Units mm, matching FORMULAS.md "Conventions". Volume comes back in mm³.
#include <functional>

namespace stitchu {

struct Vec3 {
    double x = 0.0, y = 0.0, z = 0.0;
};

inline Vec3 operator+(Vec3 a, Vec3 b) { return {a.x + b.x, a.y + b.y, a.z + b.z}; }
inline Vec3 operator-(Vec3 a, Vec3 b) { return {a.x - b.x, a.y - b.y, a.z - b.z}; }
inline Vec3 operator*(Vec3 a, double s) { return {a.x * s, a.y * s, a.z * s}; }
inline double dot(Vec3 a, Vec3 b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
inline Vec3 cross(Vec3 a, Vec3 b) {
    return {a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x};
}

// r(u, v) over a rectangular parameter domain. The surface is whatever you can
// evaluate: a body loft, a garment shell, an analytic solid.
using Surface = std::function<Vec3(double, double)>;

struct SurfaceIntegrals {
    double area = 0.0;                 // ∫∫ |r_u × r_v| du dv          [mm²]
    double volume = 0.0;               // (1/3) ∮ r·n dA, signed        [mm³]
    Vec3 centroid;                     // (1/2V) ∮ xᵢ² nᵢ dA            [mm]
    double gaussCurvatureTotal = 0.0;  // ∮ K dA                        [sr]
    double eulerCharacteristic = 0.0;  // gaussCurvatureTotal / 2π
};

// Tensor-product Gauss-Legendre. `order` is nodes per cell per axis; cellsU and
// cellsV subdivide the domain so the polynomial rule stays accurate on surfaces
// one patch cannot swallow whole. Nodes are interior, so a parametrisation that
// degenerates at the domain edge (sphere poles) never gets evaluated there.
SurfaceIntegrals integrateSurface(const Surface& r,
                                  double u0, double u1, double v0, double v1,
                                  int cellsU, int cellsV, int order);

}  // namespace stitchu
