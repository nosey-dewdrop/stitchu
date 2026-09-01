#pragma once
// Garment assembly: single entry point + dress and top blocks.
#include "bodice.hpp"
#include "geometry.hpp"
#include "measurements.hpp"

namespace stitchu {

// Single entry point: garment spec -> drafted pattern.
namespace GarmentDrafter {
DraftedPattern draft(const GarmentSpec& spec, const BodyMeasurementsSnapshot& m);
// TECHNICAL MARKINGS kernel service (grainline fallback, balance notches,
// dress CB-zipper closure mark). Public so the recipe path (RECETE-SPEC §6)
// can run the SAME pass on its independently drawn pieces — one code path,
// no re-implementation. dressZipper = stamp the invisible CB zipper glyph.
// zipGerekce (F5-parca): the measured sentence behind the zipper decision;
// stamped into the back pieces' gerekce next to the closure label.
void annotateTechnical(DraftedPattern& pattern, bool dressZipper,
                       const std::string& zipGerekce = std::string());

// F5-parca: every piece must say why it exists. This pass fills a role-based
// gerekce for any piece its drafting block left empty, and classes finishing
// strips (bias binding) as `bitirme` so they stay out of the cut-piece count.
// Runs at the END of both drafting paths (GarmentDrafter::draft + recipe).
void fillGerekce(DraftedPattern& pattern);
}

// Dress = fitted bodice + attached skirt, waist seam, invisible back zipper.
namespace DressBlock {
DraftedPattern draft(const GarmentSpec& spec, const BodyMeasurementsSnapshot& m);
}

// Top = bodice lengthened past the waist to the chosen hem.
namespace TopBlock {
DraftedPattern draft(const GarmentSpec& spec, const BodyMeasurementsSnapshot& m);
// The top's sewing-guide step builder, extracted VERBATIM from draft() so the
// recipe path (RECETE-SPEC §6) emits the exact same guide text through the
// exact same code. waistEnds = the top ends at the waist (extra == 0).
std::vector<std::string> guide(const GarmentSpec& spec, bool halter, bool biasNeck,
                               bool sleeveless, bool frontPrincess, bool backPrincess,
                               bool waistEnds);
}

} // namespace stitchu
