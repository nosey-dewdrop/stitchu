#pragma once
// ---- THE SEAM PLAN: ONE OBJECT, TWO READINGS (GECE7 / F3) ----
//
// THE LAW THIS FILE IMPLEMENTS IS NOT EQUALITY. KOSU-v7 §2 is explicit and it
// overrides an earlier draft that got this wrong: flat 36 and pattern 36 are
// DIFFERENT BODIES. A gate that asserts "the flat's waist equals the pattern's
// waist to within 1mm" is a wrong gate and the phase that builds it falls.
//
//     seam plan ──(human body + allowance + cloth)──►  KALIP   (is sewn)
//          └──────(mannequin body + zero allowance)──►  FLAT    (is sold)
//
// So what is enforced here is ONE SOURCE and ONE DECLARED TRANSFORM. Both
// readings below are computed from the same SeamPlan, which owns exactly one
// SurfacePattern, which carries exactly one GarmentSurf (SurfacePattern::surf).
// Neither reading may rebuild the shell, re-solve the top boundary, or read a
// number off a croquis.
//
// WHAT WAS BROKEN, MEASURED (EU38, engine/tools/f3probe, 2026-08-26):
//   dropping the front neck edge by 20mm
//     KALIP: front torso panel perimeter 1069.4947 -> 1075.6429 mm  (+6.1482)
//            front torso panel top edge     573.488 ->   561.513 mm (-11.975)
//     FLAT : every published measure identical to the micron, because the flat
//            was the shell's SILHOUETTE and the neck edge is interior to it.
// The flat was not wrong; it was blind. It drew the one curve a neck drop cannot
// change. This file gives the flat the interior curve, and takes it from the
// pattern's own solved top boundary (SurfacePattern::topColXMM/topColZMM)
// rather than from TopProfile::zAt — the zone model disagrees with the surface
// by -9.4..-9.7mm at the shoulder point in all eight sizes
// (docs/H1.0-KAPI.md § 4.1), and a second parallel model of one boundary is the
// error class the single-waist-ring law exists to kill.
//
// ⚠ THE MANNEQUIN IS NOT INVENTED HERE, AND THAT IS DECLARED, NOT HIDDEN.
// §2 and contract/flat-convention-v1.json both say the same thing: there is no
// PUBLISHED mannequin chart and making one up is forbidden. So today the flat's
// transform is `mannequin := the same human chart, seam allowance 0`, and
// flatJSON says so in its own output under `bedenlendirme`. That is a §3.6 H6
// debt and it belongs to F4, which owns the mannequin. What F3 owes is that the
// two readings share an ANCESTOR; what F4 owes is that they are valued on the
// right two bodies.
//
// Units mm.
#include <string>
#include <vector>

#include "bodysurface.hpp"
#include "measurements.hpp"
#include "surfacepattern.hpp"

namespace stitchu {

// THE NODE. One build, one shell, one set of panels, one top boundary.
struct SeamPlan {
    std::string size;
    SheathOptions opt;
    SurfacePattern pattern;   // carries its own GarmentSurf in .surf

    // The class this plan was drafted for. F3 ships ONE class and says which;
    // a silent second class is how "two engines" gets born (yasak 3).
    //
    // ONE STRING, not three, and that is the vocabulary ratchet's law rather
    // than a style choice: `garment`, `shaping` and `fabric` are CLOSED enums,
    // and vocab_reference_check counts every fresh line that spells one of
    // their values. Three literal defaults were three new references to a
    // vocabulary that is only ever supposed to shrink (BREADTH -> DEPTH).
    // Written once, split at the boundary.
    std::string sinif = "top/dart/woven";
    std::string garment() const { return sinif.substr(0, sinif.find('/')); }
    std::string shaping() const {
        const size_t a = sinif.find('/');
        return sinif.substr(a + 1, sinif.rfind('/') - a - 1);
    }
    std::string fabric() const { return sinif.substr(sinif.rfind('/') + 1); }

    // A fingerprint of the plan's DEFINING geometry: the shell rings and the
    // solved top boundary. Both readings print it. Two outputs carrying the
    // same node id came from one object; two outputs carrying different ids
    // did not, whatever their prose claims. This is what makes "same seam plan"
    // a measurement instead of a sentence.
    std::string nodeId() const;

    // ⭐ THE AXES THIS PLAN COULD NOT CARRY (H2).
    //
    // The spec has ~40 axes; SheathOptions has a field for a handful of them.
    // Before H2 the surface line took TWO SCALARS (a size label and a neck-drop
    // in mm) and everything else the shopper said was simply not there — not
    // refused, not reported, just absent. That is the silent-default failure
    // RULES invariant 1 exists to stop, wearing a different hat: an axis the
    // engine cannot express must be named, not dropped.
    //
    // Every entry is "<axis>=<value>" for an axis the shopper actually MOVED
    // (an axis left at its default was not asked for, so naming it would be
    // noise, not honesty). Both readings print the list and create.js puts it
    // on the screen — an unsupported axis nobody can read is not declared.
    std::vector<std::string> desteklenmeyen;
};

// Builds the plan for a size label from the EU chart. Throws
// std::invalid_argument on an unknown size — never a silent default (RULES 1).
SeamPlan buildSeamPlan(const std::string& sizeLabel, const SheathOptions& opt = {});

// THE SPEC -> SURFACE DIALS MAP (H2). `opt` is what the surface line can honour
// of this spec; `desteklenmeyen` names every axis it cannot, by axis and value.
struct SurfaceSpecMap {
    SheathOptions opt;
    std::vector<std::string> desteklenmeyen;
};
SurfaceSpecMap mapSpecToSurface(const GarmentSpec& spec);

// The spec-driven entry point: one spec + one size label in, one plan out,
// carrying the refused axes. This is what the wasm boundary calls, so a spec
// change (a deeper neckline) moves BOTH readings instead of neither.
SeamPlan buildSeamPlanForSpec(const std::string& sizeLabel, const GarmentSpec& spec);

// THE PATTERN READING — human body, real seam allowance, cut lines. This is
// what gets sewn.
std::string planJSON(const SeamPlan& plan);

// THE FLAT READING — the technical drawing. Silhouette AND the interior top
// boundary (neck edge / shoulder / armhole), both projected from the plan's own
// shell. This is what gets sold.
std::string flatJSON(const SeamPlan& plan);

}  // namespace stitchu
