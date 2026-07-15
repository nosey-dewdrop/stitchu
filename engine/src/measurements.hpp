#pragma once
// Measurement snapshot + garment spec enums. Mirrors the Swift engine types.
#include <cmath>
#include <string>

namespace stitchu {

struct BodyMeasurementsSnapshot {
    double bustCM = 0, waistCM = 0, hipCM = 0, shoulderCM = 0;
    double backLengthCM = 0, armLengthCM = 0, neckCM = 0;
    // OPTIONAL high/upper-bust girth (above the bust, under the arms). This is
    // the ribcage FRAME. When given (> 0), the back and armhole size to it while
    // the front keeps the full bust — a real full-bust adjustment, so a fuller
    // bust no longer gapes at the neck/armhole. When 0, we fall back to the old
    // B/C-cup assumption (bust - 70 mm) and the draft is byte-identical.
    double upperBustCM = 0;

    double bustMM() const { return bustCM * 10; }
    double waistMM() const { return waistCM * 10; }
    double hipMM() const { return hipCM * 10; }
    double backLengthMM() const { return backLengthCM * 10; }
    double neckMM() const { return neckCM * 10; }
    double upperBustMM() const { return upperBustCM * 10; }
};

// Halter is more than a neck shape: the front rises into a nape strap, the
// shoulders are bare (no shoulder seam, no sleeves) and the back is cut low.
enum class Neckline { Crew, Scoop, VNeck, Square, Boat, Sweetheart, Halter };
enum class SkirtStyle { ALine, Straight, Gathered, HalfCircle, Pleated };
// Dress waist seam level. Empire sits just under the bust (underbust girth);
// empire + gathered = the babydoll silhouette.
enum class Waistline { Natural, Empire };
// Fabric class scales every ease: knits stretch, so they need far less room.
enum class Fabric { Woven, Knit };
enum class SkirtLength { Mini, Midi, Maxi };
enum class SleeveStyle { None, Straight, Balloon };
enum class SleeveLength { Short, Elbow, Long };
// Opt-in sleeve HEAD (cap) treatment (Loop 6). Plain = the classic set-in cap
// (byte-identical default). Gathered = the crown is gathered but the cap height
// is NOT raised (soft high-street puff). Puffed = the crown is gathered AND the
// cap is raised + widened (a puff/gigot that stands up above the shoulder).
// This is the sleeve HEAD; the balloon style gathers the HEM/wrist instead.
enum class SleeveCap { Plain, Gathered, Puffed };
enum class GarmentType { Skirt, Dress, Top };
enum class TopLength { Cropped, Hip, Tunic };
// How waist suppression is shaped. Princess is the default: seams a person can
// actually sew and the look that justifies the engine; darts are the advanced
// legacy option (also the golden-diff reference against the Swift engine).
enum class Shaping { Princess, Dart };

inline const char* raw(Neckline n) {
    switch (n) {
        case Neckline::Crew: return "crew";
        case Neckline::Scoop: return "scoop";
        case Neckline::VNeck: return "vNeck";
        case Neckline::Square: return "square";
        case Neckline::Boat: return "boat";
        case Neckline::Sweetheart: return "sweetheart";
        case Neckline::Halter: return "halter";
    }
    return "";
}
inline const char* title(Neckline n) { return n == Neckline::VNeck ? "v-neck" : raw(n); }

inline const char* raw(SkirtStyle s) {
    switch (s) {
        case SkirtStyle::ALine: return "aLine";
        case SkirtStyle::Straight: return "straight";
        case SkirtStyle::Gathered: return "gathered";
        case SkirtStyle::HalfCircle: return "halfCircle";
        case SkirtStyle::Pleated: return "pleated";
    }
    return "";
}
inline const char* title(SkirtStyle s) {
    switch (s) {
        case SkirtStyle::ALine: return "A-line";
        case SkirtStyle::Straight: return "straight";
        case SkirtStyle::Gathered: return "gathered";
        case SkirtStyle::HalfCircle: return "half circle";
        case SkirtStyle::Pleated: return "pleated";
    }
    return "";
}

inline const char* raw(Waistline w) {
    switch (w) {
        case Waistline::Natural: return "natural";
        case Waistline::Empire: return "empire";
    }
    return "";
}
inline const char* raw(Fabric f) {
    switch (f) {
        case Fabric::Woven: return "woven";
        case Fabric::Knit: return "knit";
    }
    return "";
}

inline const char* raw(SkirtLength l) {
    switch (l) {
        case SkirtLength::Mini: return "mini";
        case SkirtLength::Midi: return "midi";
        case SkirtLength::Maxi: return "maxi";
    }
    return "";
}
inline double millimeters(SkirtLength l) {
    switch (l) {
        case SkirtLength::Mini: return 450;
        case SkirtLength::Midi: return 650;
        case SkirtLength::Maxi: return 900;
    }
    return 0;
}

inline const char* raw(SleeveStyle s) {
    switch (s) {
        case SleeveStyle::None: return "none";
        case SleeveStyle::Straight: return "straight";
        case SleeveStyle::Balloon: return "balloon";
    }
    return "";
}
inline const char* title(SleeveStyle s) { return s == SleeveStyle::None ? "sleeveless" : raw(s); }

inline const char* raw(SleeveLength l) {
    switch (l) {
        case SleeveLength::Short: return "short";
        case SleeveLength::Elbow: return "elbow";
        case SleeveLength::Long: return "long";
    }
    return "";
}

inline const char* raw(TopLength t) {
    switch (t) {
        case TopLength::Cropped: return "cropped";
        case TopLength::Hip: return "hip";
        case TopLength::Tunic: return "tunic";
    }
    return "";
}
inline double belowWaist(TopLength t) {
    switch (t) {
        case TopLength::Cropped: return 0;
        case TopLength::Hip: return 180;
        case TopLength::Tunic: return 300;
    }
    return 0;
}

inline const char* raw(Shaping s) {
    switch (s) {
        case Shaping::Princess: return "princess";
        case Shaping::Dart: return "dart";
    }
    return "";
}

struct GarmentSpec {
    GarmentType garment = GarmentType::Dress;
    Shaping shaping = Shaping::Princess;
    Waistline waistline = Waistline::Natural; // dress only
    Fabric fabric = Fabric::Woven;
    Neckline neckline = Neckline::Crew;
    SleeveStyle sleeveStyle = SleeveStyle::None;
    SleeveLength sleeveLength = SleeveLength::Short;
    // Opt-in gathered / puff sleeve HEAD (Loop 6). Plain by default → the cap
    // path is byte-identical. See sleeve.hpp / FORMULAS.md "Gathered/puff sleeve cap".
    SleeveCap sleeveCap = SleeveCap::Plain;
    SkirtStyle skirtStyle = SkirtStyle::ALine;
    SkirtLength skirtLength = SkirtLength::Midi;
    TopLength topLength = TopLength::Hip;
    // Opt-in hem ruffle (fırfır). Off by default → existing drafts unchanged.
    bool ruffleHem = false;
    double ruffleFullness = 2.5; // gather ratio 2.0–3.0
    double ruffleDepthMM = 80;   // how deep the ruffle hangs
    int ruffleTiers = 1;         // cascading tiers (kademeli); 1 = single ruffle
    // Opt-in keyhole (anahtar deliği) opening below the front neckline.
    bool keyhole = false;
    // Opt-in front button placket (düğme patı): grown-on button stand + fold line
    // + button/buttonhole markings on the front. Off by default → byte-identical.
    bool frontPlacket = false;
    // Opt-in fabric ties / sash / bow (bağ / kuşak / fiyonk): adds separate tie
    // pieces (self-fabric strips) + a placement notch. Off by default (None) →
    // byte-identical. See tie.hpp / FORMULAS.md "Fabric ties / sashes".
    int tieClosure = 0; // TiePlacement enum value; 0 = None
};

inline double roundToPlaces(double value, int places) {
    const double factor = std::pow(10.0, places);
    return std::round(value * factor) / factor;
}

} // namespace stitchu
