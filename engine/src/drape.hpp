#pragma once
// Drape preview engine (PIPELINE Aşama 2/6 — CAD yüzeyi: canlı önizleme yönünde
// ilk gerçek atak). Takes a flat pattern piece (the motor's deterministic mm
// geometry, geometry.hpp) and hangs it in 3D as a mass-spring cloth so the flat
// draft can be PREVIEWED as a garment falling under gravity around a body.
//
// HONEST SCOPE (bu bir CLO3D fizik motoru DEĞİLDİR): this is a Provot-style
// mass-spring cloth (structural + shear + bend springs) integrated with Verlet
// under gravity, the piece's pinned edge held fixed, and a single vertical
// cylinder body-collision so the cloth drapes AROUND a waist instead of
// collapsing to a plane. No self-collision, no bending stiffness tuning to real
// fabric, no seam-sewing of multiple panels — one panel, one hang. It is a
// deterministic geometric preview, not a validated physical simulation.
//
// DETERMINISM (the whole point — same input, same 3D): the particle mesh is
// built by a FIXED grid rasterization of the piece polygon (motor flattenCubic,
// geometry.cpp), springs by fixed neighbour rules, integration by a FIXED number
// of Verlet steps at a FIXED dt. No randomness, no dates, no wall-clock. The same
// PatternPiece + same DrapeOptions → byte-identical vertex coordinates. This is
// what the drape_check ctest proves.
//
// Coordinate frame: input is the motor's 2D pattern frame (mm, y grows DOWN,
// geometry.hpp:2-4). Output is 3D world mm where +Y is UP (gravity is -Y) and the
// cloth starts in the Z=0 plane, then bulges in ±Z as it wraps the body cylinder.
// The 2D pattern y (down) maps to world -Y (down) so the pinned top edge is the
// highest row (the waist / neckline the garment hangs from).
#include <string>
#include <vector>

#include "geometry.hpp"

namespace stitchu {
namespace drape {

// A 3D vertex of the draped mesh, world mm (+Y up).
struct Vec3 {
    double x = 0.0;
    double y = 0.0;
    double z = 0.0;
};

// A mass-spring constraint between two particles with a rest length (mm) and a
// kind (structural/shear/bend) — kept so the renderer and the tests can reason
// about which springs are load-bearing.
enum class SpringKind { Structural, Shear, Bend };
struct Spring {
    int a = -1;
    int b = -1;
    double rest = 0.0;
    SpringKind kind = SpringKind::Structural;
};

// A triangle of the cloth mesh (indices into particles), used only for rendering
// the draped surface (shading + silhouette). Never affects the simulation.
struct Tri {
    int a = -1;
    int b = -1;
    int c = -1;
};

// Options for the drape. All defaults are deterministic and body-neutral; the
// caller (drape-preview tool) picks a body radius from the piece's own waist
// width so the cylinder matches the garment, never a magic constant.
struct DrapeOptions {
    // Particle grid spacing in mm. Smaller = finer cloth, more particles. Fixed
    // by the caller; the mesh topology is a pure function of this + the polygon.
    double cellMM = 25.0;
    // Verlet integration: FIXED iteration count and step so the settle is
    // deterministic. 240 steps at dt=0.04 settles the pinned panels used here.
    int steps = 240;
    double dt = 0.04;
    // Gravity magnitude (mm/step² scale; tuned for a visually settled drape, not
    // a physical g). Pulls -Y (down).
    double gravity = 9.0;
    // Spring stiffness in [0,1] as a Verlet position-correction fraction per
    // constraint pass. Structural stiffest, bend softest (cloth folds, not rods).
    double kStructural = 0.9;
    double kShear = 0.5;
    double kBend = 0.2;
    // Constraint relaxation passes per Verlet step (Jakobsen). More = stiffer.
    int constraintPasses = 6;
    // Velocity damping per step (0 = none, 1 = frozen). Small damp settles.
    double damping = 0.02;
    // Body cylinder the cloth wraps: vertical axis at (cx, *, cz), radius mm.
    // The cloth is pushed OUT to the cylinder surface on collision. radius <= 0
    // disables body collision (flat hang, for testing).
    double bodyRadiusMM = 0.0;
    double bodyCenterX = 0.0;
    double bodyCenterZ = 0.0;
    // Initial wrap: how far (fraction of a half-turn) the flat panel is pre-bent
    // around the cylinder before settling, so it starts near the body instead of
    // a flat sheet passing through it. 0 = start flat.
    double initialWrap = 0.0;
};

// The built cloth: particles (initial 3D positions), which particles are PINNED
// (held fixed = the edge the garment hangs from), the springs, the render
// triangles, and a back-map from each particle to its source 2D pattern point
// (mm, motor frame) for debugging / seam work later.
struct ClothMesh {
    std::vector<Vec3> particles;      // initial positions (pre-simulation)
    std::vector<bool> pinned;         // parallel to particles
    std::vector<Point> source2D;      // parallel: original pattern-frame mm point
    std::vector<Spring> springs;
    std::vector<Tri> tris;
    // The polygon the mesh was built from (motor frame, mm), for the report.
    std::vector<Point> polygon;
    bool ok = false;
    std::string error;
};

// The settled drape: final 3D particle positions + the mesh topology carried
// through, plus honest diagnostics the ctest checks.
struct DrapeResult {
    bool ok = false;
    std::string error;
    std::vector<Vec3> particles;      // FINAL settled positions
    std::vector<bool> pinned;
    std::vector<Tri> tris;
    std::vector<Spring> springs;
    // Diagnostics (all MEASURED from the settled mesh, never asserted):
    int particleCount = 0;
    int springCount = 0;
    int pinnedCount = 0;
    double maxPinDriftMM = 0.0;       // largest move of any pinned particle (must be ~0)
    double maxSpringStrain = 0.0;     // max |len-rest|/rest over all springs (settle quality)
    double bodyPenetrationMM = 0.0;   // deepest a particle sits INSIDE the body cylinder (want ~0)
    double finalHeightMM = 0.0;       // pinned Y minus lowest Y (how far it hangs)
    double dropFromFlatMM = 0.0;      // how much the hem dropped vs the flat lay (drape magnitude)
    double zSpreadMM = 0.0;           // max Z minus min Z: the 3D wrap depth (0 = still a flat sheet)
    bool anyNaN = false;              // NaN/Inf guard — a real sim must never produce these
};

// Build the cloth mesh from a pattern piece: flatten its outline to a polygon
// (motor flattenCubic at `steps` resolution — the SAME deterministic path the
// dxf/nest exporters use), rasterize a grid of particles inside it at cellMM
// spacing, connect structural/shear/bend springs, pin the TOP row (min pattern y
// = the waist/neck the garment hangs from), and triangulate the grid for
// rendering. The piece's seam allowance / cut line are ignored (drape is on the
// SEWING outline). Err (ok=false) when the piece has no closed outline or the
// grid produced fewer than 3 particles.
ClothMesh buildCloth(const PatternPiece& piece, const DrapeOptions& opts);

// Run the deterministic Verlet mass-spring settle on a built cloth and return the
// final 3D positions + measured diagnostics. Pure function of (mesh, opts): same
// in, byte-identical out. Never throws; a malformed mesh returns ok=false.
DrapeResult settle(const ClothMesh& mesh, const DrapeOptions& opts);

// Convenience: build + settle in one call.
DrapeResult drapePiece(const PatternPiece& piece, const DrapeOptions& opts);

// Render the settled drape to an SVG string (a real 3D->2D projected view: the
// cloth triangles shaded by their facing + a body-cylinder silhouette + the
// pinned edge). Orthographic, a fixed 3/4 view so the wrap is visible.
// Deterministic text; the tool rasterizes it to PNG (visual proof, RULES inv 3).
std::string drapeSVG(const DrapeResult& result, const DrapeOptions& opts);

} // namespace drape
} // namespace stitchu
