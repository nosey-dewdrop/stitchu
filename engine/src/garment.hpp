#pragma once
// Garment assembly: single entry point + dress and top blocks.
#include "bodice.hpp"
#include "geometry.hpp"
#include "measurements.hpp"

namespace stitchu {

// Single entry point: garment spec -> drafted pattern.
namespace GarmentDrafter {
DraftedPattern draft(const GarmentSpec& spec, const BodyMeasurementsSnapshot& m);
}

// Dress = fitted bodice + attached skirt, waist seam, invisible back zipper.
namespace DressBlock {
DraftedPattern draft(const GarmentSpec& spec, const BodyMeasurementsSnapshot& m);
}

// Top = bodice lengthened past the waist to the chosen hem.
namespace TopBlock {
DraftedPattern draft(const GarmentSpec& spec, const BodyMeasurementsSnapshot& m);
}

} // namespace stitchu
