#pragma once
// Certified ARAP flattener — the C++ carry of flatten-research/15-arap-proper.py
// (Faz C / G1, certified 2026-08-10 against analytic truth; the buggy 04 solver
// is its warning label). The Python file stays the readable proof; this file is
// the production port and flatten_check holds it to the SAME analytic gates:
// a cone frustum must unroll to its exact sector (dart 0), and a sphere calotte
// must put its dart total on the develop-deficit.
//
// Three structural decisions carried over verbatim, because each one is a
// diagnosed failure mode of the 04 solver:
//   1. init must be a proven polar development — bad init is the classic ARAP
//      death (the caller supplies it; helpers below build the standard ones);
//   2. the LOCAL step is the closed-form 2x2 polar decomposition (no Jacobi):
//      for S=[[a,b],[c,d]], R ∝ [[a+d, b-c],[c-b, a+d]];
//   3. the GLOBAL step is a cotan Laplacian solved by a hand-written conjugate
//      gradient — dependency-free and deterministic (one vertex pinned keeps
//      the system positive).
//
// Units mm, as everywhere in the engine.
#include <array>
#include <vector>

#include "volume.hpp"

namespace stitchu {

struct Vec2 {
    double x = 0.0, y = 0.0;
};

// A triangle mesh of the 3D surface piece being flattened. Faces index V.
struct TriMesh {
    std::vector<Vec3> V;
    std::vector<std::array<int, 3>> F;
};

// Local-global ARAP. `init` is the 2D start (proven development, not random),
// `pin` the vertex held fixed. Deterministic for identical inputs.
std::vector<Vec2> arapFlatten(const TriMesh& mesh, const std::vector<Vec2>& init,
                              int pin = 0, int rounds = 60, double cgTol = 1e-10);

// Post-ARAP metric polish: direct edge-strain relaxation (the arc relaxation of
// research file 02). ARAP establishes the shape, the polish tightens the metric;
// both are deterministic.
void strainPolish(const TriMesh& mesh, std::vector<Vec2>& P, int pin = 0,
                  int iters = 4000, double step = 0.2);

// Worst |2D edge length − 3D edge length| / 3D length over all mesh edges.
// This is the certificate number: <0.1% for a developable surface, <0.5% is
// the garment gate.
double maxStrain(const TriMesh& mesh, const std::vector<Vec2>& P);

}  // namespace stitchu
