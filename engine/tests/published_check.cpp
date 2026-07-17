// published_check — drafts EACH published pattern (web/patterns/svg/meta.json,
// spec source: engine/tools/render-patterns.mjs PATTERNS[]) through the engine
// and runs the FULL validator (which invokes the Wearability gate at
// validator.cpp:1080). Prints name + sewable(bool) + issue list per pattern.
// Same EU38 demo body the site renders (render-patterns.mjs BODY).
#include <cstdio>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

int main() {
    // EU38 demo body — identical to render-patterns.mjs BODY.
    const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36};

    struct P { std::string slug; GarmentSpec spec; };
    std::vector<P> pats;

    auto base = [](GarmentType g) {
        GarmentSpec s;
        s.garment = g;
        s.shaping = Shaping::Dart;      // render-patterns default for all
        s.waistline = Waistline::Natural;
        s.fabric = Fabric::Woven;
        s.neckline = Neckline::Crew;
        s.sleeveStyle = SleeveStyle::None;
        s.sleeveLength = SleeveLength::Short;
        s.skirtStyle = SkirtStyle::ALine;
        s.skirtLength = SkirtLength::Midi;
        s.topLength = TopLength::Hip;
        s.edgeFinish = 0;               // bias binding default (render-patterns passes 0)
        return s;
    };

    // 1. boat-neck-linen-shell (top, boat, sleeveless)
    { auto s = base(GarmentType::Top); s.neckline = Neckline::Boat;
      pats.push_back({"boat-neck-linen-shell", s}); }

    // 2. scoop-neck-tank-mini-dress (dress, knit, scoop, straight mini)
    { auto s = base(GarmentType::Dress); s.fabric = Fabric::Knit; s.neckline = Neckline::Scoop;
      s.skirtStyle = SkirtStyle::Straight; s.skirtLength = SkirtLength::Mini;
      pats.push_back({"scoop-neck-tank-mini-dress", s}); }

    // 3. boat-neck-button-down-top (top, boat, front placket)
    { auto s = base(GarmentType::Top); s.neckline = Neckline::Boat; s.frontPlacket = true;
      pats.push_back({"boat-neck-button-down-top", s}); }

    // 4. gingham-button-blouse (top, boat, front placket)
    { auto s = base(GarmentType::Top); s.neckline = Neckline::Boat; s.frontPlacket = true;
      pats.push_back({"gingham-button-blouse", s}); }

    // 5. mandarin-collar-fitted-blouse (top, crew, straight sleeve, placket, stand collar)
    { auto s = base(GarmentType::Top); s.neckline = Neckline::Crew;
      s.sleeveStyle = SleeveStyle::Straight; s.frontPlacket = true;
      s.collarType = 1 /* stand */; s.collarEdge = 0;
      pats.push_back({"mandarin-collar-fitted-blouse", s}); }

    // 6. back-tie-shift-mini-dress (dress, boat, straight mini, backWaistBow tie)
    { auto s = base(GarmentType::Dress); s.neckline = Neckline::Boat;
      s.skirtStyle = SkirtStyle::Straight; s.skirtLength = SkirtLength::Mini;
      s.tieClosure = 2 /* backWaistBow */;
      pats.push_back({"back-tie-shift-mini-dress", s}); }

    // 7. square-neck-back-tie-babydoll-top (top, empire, square, tieBack)
    { auto s = base(GarmentType::Top); s.waistline = Waistline::Empire; s.neckline = Neckline::Square;
      s.tieClosure = 4 /* tieBack */;
      pats.push_back({"square-neck-back-tie-babydoll-top", s}); }

    // 8. empire-waist-tie-back-dress (dress, empire, boat, gathered midi, backWaistBow, shirred bust)
    { auto s = base(GarmentType::Dress); s.waistline = Waistline::Empire; s.neckline = Neckline::Boat;
      s.skirtStyle = SkirtStyle::Gathered; s.tieClosure = 2;
      s.gatherType = 2 /* shirred */; s.gatherZone = 1 /* bust */;
      pats.push_back({"empire-waist-tie-back-dress", s}); }

    // 9. square-neck-drawstring-babydoll-dress (dress, empire, square, gathered mini, drawstring bust)
    { auto s = base(GarmentType::Dress); s.waistline = Waistline::Empire; s.neckline = Neckline::Square;
      s.skirtStyle = SkirtStyle::Gathered; s.skirtLength = SkirtLength::Mini;
      s.gatherType = 1 /* drawstring */; s.gatherZone = 1 /* bust */;
      pats.push_back({"square-neck-drawstring-babydoll-dress", s}); }

    // 10. open-back-princess-mini-dress (dress, princess, square, aLine mini, round backOpening)
    { auto s = base(GarmentType::Dress); s.shaping = Shaping::Princess; s.neckline = Neckline::Square;
      s.skirtLength = SkirtLength::Mini; s.backOpening = 1 /* round */;
      pats.push_back({"open-back-princess-mini-dress", s}); }

    // 11. open-back-tie-back-mini-dress (dress, boat, aLine mini, round backOpening, backWaistBow)
    { auto s = base(GarmentType::Dress); s.neckline = Neckline::Boat; s.skirtLength = SkirtLength::Mini;
      s.backOpening = 1 /* round */; s.tieClosure = 2 /* backWaistBow */;
      pats.push_back({"open-back-tie-back-mini-dress", s}); }

    // 12. peter-pan-collar-puff-sleeve-babydoll-dress
    { auto s = base(GarmentType::Dress); s.waistline = Waistline::Empire; s.neckline = Neckline::Crew;
      s.sleeveStyle = SleeveStyle::Straight; s.skirtStyle = SkirtStyle::Gathered;
      s.collarType = 4 /* peterPan */; s.collarEdge = 0; s.sleeveCap = SleeveCap::Puffed;
      s.gatherType = 3 /* smocked */; s.gatherZone = 0 /* neck yoke */;
      pats.push_back({"peter-pan-collar-puff-sleeve-babydoll-dress", s}); }

    // 13. ruffled-strap-milkmaid-babydoll-dress
    { auto s = base(GarmentType::Dress); s.waistline = Waistline::Empire; s.neckline = Neckline::Square;
      s.skirtStyle = SkirtStyle::Gathered; s.skirtLength = SkirtLength::Mini;
      s.tieClosure = 3 /* frontNeckBow */; s.gatherType = 2 /* shirred */; s.gatherZone = 0 /* front yoke */;
      s.ruffledStraps = 1 /* ruffled */;
      pats.push_back({"ruffled-strap-milkmaid-babydoll-dress", s}); }

    // 14. shirt-collar-smocked-babydoll-top
    { auto s = base(GarmentType::Top); s.waistline = Waistline::Empire; s.neckline = Neckline::Crew;
      s.sleeveStyle = SleeveStyle::Straight; s.frontPlacket = true;
      s.collarType = 5 /* shirt */; s.collarEdge = 1 /* pointed */; s.sleeveCap = SleeveCap::Gathered;
      s.gatherType = 3 /* smocked */; s.gatherZone = 0 /* front yoke */;
      pats.push_back({"shirt-collar-smocked-babydoll-top", s}); }

    // 15. gathered-bust-empire-mini-dress
    { auto s = base(GarmentType::Dress); s.waistline = Waistline::Empire; s.neckline = Neckline::Boat;
      s.skirtStyle = SkirtStyle::Gathered; s.skirtLength = SkirtLength::Mini;
      s.tieClosure = 2 /* backWaistBow */; s.gatherType = 2 /* shirred */; s.gatherZone = 1 /* bust */;
      pats.push_back({"gathered-bust-empire-mini-dress", s}); }

    // 16. patch-pocket-shift-dress (dress, scoop, aLine midi, patch pocket)
    { auto s = base(GarmentType::Dress); s.neckline = Neckline::Scoop; s.pocketStyle = 1 /* patch */;
      pats.push_back({"patch-pocket-shift-dress", s}); }

    int sewable = 0;
    for (const auto& p : pats) {
        const DraftedPattern draft = GarmentDrafter::draft(p.spec, m);
        const auto issues = PatternValidator::issues(p.spec, m, draft);
        const bool ok = issues.empty();
        if (ok) ++sewable;
        std::printf("%-46s SEWABLE=%s pieces=%zu\n", p.slug.c_str(), ok ? "YES" : "NO ",
                    draft.pieces.size());
        for (const auto& i : issues) {
            std::printf("      ISSUE %s\n", i.description().c_str());
        }
    }
    std::printf("\nTOTAL %zu  SEWABLE %d\n", pats.size(), sewable);
    return 0;
}
