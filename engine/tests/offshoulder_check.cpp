// Off-shoulder / bardot neckline opt-in check: the bodice top edge drops below the
// shoulder, an elastic casing piece is added, a Frill adds a bardot ruffle, the
// draft stays valid AND DONNABLE (the elastic top stretches over the shoulders),
// and None is byte-identical.
#include <cstdio>
#include <cmath>
#include <string>
#include <vector>

#include "../src/offshoulder.hpp"
#include "../src/garment.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}
static bool sameCommands(const std::vector<PathCommand>& a, const std::vector<PathCommand>& b) {
    if (a.size() != b.size()) return false;
    for (size_t i = 0; i < a.size(); ++i)
        if (a[i].type != b[i].type ||
            std::fabs(a[i].to.x - b[i].to.x) > 1e-9 || std::fabs(a[i].to.y - b[i].to.y) > 1e-9)
            return false;
    return true;
}
static const BodyMeasurementsSnapshot& m0() {
    static const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};
    return m;
}
static const PatternPiece* frontOf(const DraftedPattern& d) {
    for (const auto& p : d.pieces) if (p.name == "Bodice Front" || p.name == "Top Front") return &p;
    return nullptr;
}
static double topY(const PatternPiece& p) {
    double y = 1e18; for (const auto& c : p.commands) if (c.type != CmdType::Close) y = std::min(y, c.to.y);
    return y;
}

int main() {
    // The dress Damla wants: a plain (dart) bodice + off-shoulder + gathered skirt.
    GarmentSpec dress; dress.garment = GarmentType::Dress; dress.neckline = Neckline::Scoop;
    dress.shaping = Shaping::Dart; dress.skirtStyle = SkirtStyle::Gathered;

    // Plain off-shoulder: top edge drops, elastic piece added, valid + donnable.
    {
        std::printf("Off-shoulder gingham dress (Plain):\n");
        GarmentSpec none = dress; none.bardotStyle = 0;
        GarmentSpec os = dress; os.bardotStyle = static_cast<int>(BardotStyle::Plain);
        const DraftedPattern d0 = GarmentDrafter::draft(none, m0());
        const DraftedPattern d1 = GarmentDrafter::draft(os, m0());
        const PatternPiece* f0 = frontOf(d0); const PatternPiece* f1 = frontOf(d1);
        check(f0 && f1, "front pieces exist");
        // The reshaped top edge sits LOWER (bigger y) than the shoulder line.
        check(f0 && f1 && topY(*f1) > topY(*f0) + 30,
              "off-shoulder top edge dropped below the shoulder line");
        bool elastic = false, frill = false;
        for (const auto& p : d1.pieces) {
            if (p.name.find("Elastic") != std::string::npos) elastic = true;
            if (p.name.find("Bardot Frill") != std::string::npos) frill = true;
        }
        check(elastic, "an off-shoulder elastic casing piece is added");
        check(!frill, "Plain adds no frill");
        check(PatternValidator::issues(os, m0(), d1).empty(),
              "off-shoulder draft valid AND donnable (elastic top stretches on)");
        std::printf("\n");
    }

    // Frill: adds the bardot ruffle piece too.
    {
        std::printf("Off-shoulder dress with bardot FRILL:\n");
        GarmentSpec os = dress; os.bardotStyle = static_cast<int>(BardotStyle::Frill);
        const DraftedPattern d1 = GarmentDrafter::draft(os, m0());
        bool elastic = false, frill = false;
        for (const auto& p : d1.pieces) {
            if (p.name.find("Elastic") != std::string::npos) elastic = true;
            if (p.name.find("Bardot Frill") != std::string::npos) frill = true;
        }
        check(elastic && frill, "Frill adds both the elastic casing and the bardot frill");
        check(PatternValidator::issues(os, m0(), d1).empty(), "frill draft valid + donnable");
        std::printf("\n");
    }

    // None byte-identical.
    {
        std::printf("None byte-identical:\n");
        GarmentSpec a = dress; a.bardotStyle = 0;
        const DraftedPattern d0 = GarmentDrafter::draft(a, m0());
        const DraftedPattern d1 = GarmentDrafter::draft(a, m0());
        bool same = d0.pieces.size() == d1.pieces.size();
        for (size_t i = 0; same && i < d0.pieces.size(); ++i)
            same = same && sameCommands(d0.pieces[i].commands, d1.pieces[i].commands);
        check(same, "None draft stable/byte-identical");
        std::printf("\n");
    }

    std::printf(failures == 0 ? "ALL OFF-SHOULDER CHECKS PASS\n" : "%d OFF-SHOULDER CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
