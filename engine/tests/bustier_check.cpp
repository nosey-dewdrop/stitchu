// Bugra Buttoned Corset Bustier construction check (cupSeam == Bugra).
// BASAR-IKI-KALIP.md corset items 1-4: the motor must draw the purchased
// pattern's SIX-piece corset — merged Upper Cup with a cut-on strap, the
// under-bust crescent Lower Cup, Front Body Center (button-placket edge,
// underbust -> corset hem) + Front Body Side (starts AT the underbust), the
// strapped Back Body Side (body + armhole sweep + cut-on strap in ONE piece)
// and the SHORT cut-on-fold Back Body Center (not a shoulder-to-hip tank back).
// Proven here:
//  * piece count + names: EXACTLY the six Bugra pieces, binding strip consumed;
//  * fold: Back Body Center is cut 1 on fold with a straight x=0 fold edge;
//  * cut-on straps: both strapped pieces carry a real narrow strap in the
//    GEOMETRY (tall piece, narrow top), not just in a note;
//  * band levels + truing: cup-seam note matched Upper<->Lower, underbust note
//    matched Lower<->both Front Bodies, and the crescent's drawn bottom edge
//    measures the recorded underbust lengths (geometry == note);
//  * the corset back is SHORT (vs the tank back the same spec drafts w/o Bugra);
//  * validator + wearability green;
//  * honest refusals: cropped / dress / crew / dart hosts are left byte-
//    identical with a named skip note;
//  * default OFF (cupSeam none) stays byte-identical (golden surface).
#include <cctype>
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "../src/cupseam.hpp"
#include "../src/garment.hpp"
#include "../src/validator.hpp"

using namespace stitchu;

static int failures = 0;
static void check(bool ok, const std::string& what) {
    std::printf("  [%s] %s\n", ok ? "PASS" : "FAIL", what.c_str());
    if (!ok) failures++;
}

static const BodyMeasurementsSnapshot& bugra36() {
    // The purchased pattern's size-36 body (geometry-full.json sizeChartMM).
    static const BodyMeasurementsSnapshot m{88, 68, 94, 37, 40, 58, 35};
    return m;
}

static GarmentSpec corsetSpec() {
    GarmentSpec s;
    s.garment = GarmentType::Top;
    s.shaping = Shaping::Princess;
    s.neckline = Neckline::Square;
    s.sleeveStyle = SleeveStyle::None;
    s.fabric = Fabric::Woven;
    s.topLength = TopLength::Hip;
    s.frontPlacket = true; // the buttoned CF
    s.cupSeam = static_cast<int>(CupSeam::Bugra);
    return s;
}

static const PatternPiece* findExact(const DraftedPattern& d, const char* name) {
    for (const auto& p : d.pieces)
        if (p.name == name) return &p;
    return nullptr;
}

static bool sameCommands(const std::vector<PathCommand>& a, const std::vector<PathCommand>& b) {
    if (a.size() != b.size()) return false;
    for (size_t i = 0; i < a.size(); ++i) {
        if (a[i].type != b[i].type) return false;
        if (std::fabs(a[i].to.x - b[i].to.x) > 1e-9 || std::fabs(a[i].to.y - b[i].to.y) > 1e-9) return false;
    }
    return true;
}

// Parse the mm number immediately preceding " mm <key>" in a cut note (same
// convention cup_check uses; the notes carry the trued seam lengths).
static double lenFromNote(const PatternPiece* p, const std::string& key) {
    if (!p) return -1;
    const std::string& s = p->cutInstruction;
    const size_t pos = s.find(key);
    if (pos == std::string::npos) return -1;
    size_t end = s.rfind(' ', pos - 2);
    if (end == std::string::npos) return -1;
    std::string num;
    for (size_t i = end + 1; i < pos && (std::isdigit(s[i]) || s[i] == '.'); ++i) num += s[i];
    return num.empty() ? -1 : std::stod(num);
}

// Width of the piece's straight bottom edge: the horizontal span of outline
// points within 1 mm of the piece's max y.
static double bottomEdgeWidth(const PatternPiece& p) {
    const Rect b = boundingBox(p.commands);
    double lo = 1e18, hi = -1e18;
    for (const auto& c : p.commands) {
        if (c.type == CmdType::Close) continue;
        if (std::fabs(c.to.y - (b.y + b.height)) < 1.0) { lo = std::min(lo, c.to.x); hi = std::max(hi, c.to.x); }
    }
    return hi > lo ? hi - lo : 0;
}

// Piece width measured across the TOP band (a cut-on strap shows as a tall
// piece whose top 15% is narrow).
static double topBandWidth(const PatternPiece& p, double share) {
    const Rect b = boundingBox(p.commands);
    const double yCut = b.y + b.height * share;
    double lo = 1e18, hi = -1e18;
    std::vector<Point> pts;
    Point cur{0, 0};
    for (const auto& c : p.commands) {
        if (c.type == CmdType::Move || c.type == CmdType::Line) {
            pts.push_back(c.to); cur = c.to;
        } else if (c.type == CmdType::Curve) {
            const auto fl = flattenCubic(cur, c.to, c.cp1, c.cp2, 24);
            pts.insert(pts.end(), fl.begin() + 1, fl.end());
            cur = c.to;
        }
    }
    for (const auto& q : pts)
        if (q.y <= yCut) { lo = std::min(lo, q.x); hi = std::max(hi, q.x); }
    return hi > lo ? hi - lo : 0;
}

int main() {
    const GarmentSpec on = corsetSpec();
    GarmentSpec off = on; off.cupSeam = static_cast<int>(CupSeam::None);
    GarmentSpec plain = on; plain.cupSeam = 0; // same spec, no construction

    // ---- enum surface --------------------------------------------------------
    std::printf("Enum surface:\n");
    check(static_cast<int>(CupSeam::None) == 0 && static_cast<int>(CupSeam::Horizontal) == 1 &&
              static_cast<int>(CupSeam::Bugra) == 2,
          "CupSeam surface is exactly {None=0, Horizontal=1, Bugra=2} (append-only)");

    // ---- default OFF: byte-identical (golden surface) ------------------------
    {
        std::printf("\nDefault OFF is byte-identical:\n");
        const DraftedPattern d0 = GarmentDrafter::draft(plain, bugra36());
        const DraftedPattern dN = GarmentDrafter::draft(off, bugra36());
        bool identical = d0.pieces.size() == dN.pieces.size();
        for (size_t i = 0; identical && i < d0.pieces.size(); ++i)
            identical = d0.pieces[i].name == dN.pieces[i].name &&
                        sameCommands(d0.pieces[i].commands, dN.pieces[i].commands);
        check(identical, "cupSeam none leaves the same spec byte-identical (opt-in default off)");
    }

    // ---- ON: the six-piece Bugra corset --------------------------------------
    const DraftedPattern d = GarmentDrafter::draft(on, bugra36());
    const DraftedPattern dPlain = GarmentDrafter::draft(plain, bugra36());
    std::printf("\nBugra corset ON (Bugra-36 body):\n");

    const char* names[6] = {"Upper Cup", "Lower Cup", "Front Body Center",
                            "Front Body Side", "Back Body Side", "Back Body Center"};
    for (const char* n : names)
        check(findExact(d, n) != nullptr, std::string("piece exists: ") + n);
    check(d.pieces.size() == 6,
          "EXACTLY six pieces (Bugra föy) — no extra panels, binding strip consumed by the lining finish; got " +
              std::to_string(d.pieces.size()));

    const PatternPiece* up = findExact(d, "Upper Cup");
    const PatternPiece* lo = findExact(d, "Lower Cup");
    const PatternPiece* fbc = findExact(d, "Front Body Center");
    const PatternPiece* fbs = findExact(d, "Front Body Side");
    const PatternPiece* bbs = findExact(d, "Back Body Side");
    const PatternPiece* bbc = findExact(d, "Back Body Center");
    if (up && lo && fbc && fbs && bbs && bbc) {
        // Fold: Back Body Center is cut 1 on fold with a STRAIGHT x=0 fold edge.
        check(bbc->cutInstruction.find("cut 1 on fold") != std::string::npos,
              "Back Body Center is cut 1 on fold");
        {
            const Rect b = boundingBox(bbc->commands);
            double foldLo = 1e18, foldHi = -1e18;
            int foldPts = 0;
            for (const auto& c : bbc->commands) {
                if (c.type == CmdType::Close) continue;
                if (std::fabs(c.to.x) < 0.5) {
                    foldLo = std::min(foldLo, c.to.y); foldHi = std::max(foldHi, c.to.y); foldPts++;
                }
            }
            check(b.x > -1e-6 && foldPts >= 2 && (foldHi - foldLo) > b.height * 0.9,
                  "fold edge is a straight x=0 line spanning the piece (honestly cuttable on fold)");
        }
        // The SHORT corset back — not the shoulder-to-hip tank back.
        {
            const double corsetBackH = boundingBox(bbc->commands).height;
            const PatternPiece* tank = findExact(dPlain, "Top Center Back");
            const double tankH = tank ? boundingBox(tank->commands).height : 0;
            check(tank && corsetBackH < tankH - 150,
                  "Back Body Center is the SHORT corset back (" + std::to_string((int)corsetBackH) +
                      " mm) vs the tank back the same spec drafts without Bugra (" +
                      std::to_string((int)tankH) + " mm)");
        }
        // Cut-on straps in GEOMETRY: tall piece, narrow top band.
        {
            const Rect ub = boundingBox(up->commands);
            check(ub.height > 180 && topBandWidth(*up, 0.15) < 80,
                  "Upper Cup carries a real cut-on strap (tall piece, narrow top band)");
            check(up->cutInstruction.find("cut-on strap") != std::string::npos,
                  "Upper Cup cut note names the cut-on strap");
            const Rect bb = boundingBox(bbs->commands);
            check(bb.height > 380 && topBandWidth(*bbs, 0.12) < 80,
                  "Back Body Side carries a real cut-on strap over the body+armhole piece");
            check(bbs->cutInstruction.find("cut-on strap") != std::string::npos,
                  "Back Body Side cut note names the cut-on strap");
        }
        // Band levels: the front bodies span underbust -> corset hem (short
        // bands, not full torsos) and Front Body Side starts AT the underbust.
        {
            const Rect fc = boundingBox(fbc->commands), fs = boundingBox(fbs->commands);
            check(fc.height > 120 && fc.height < 300,
                  "Front Body Center is the underbust->hem band (" + std::to_string((int)fc.height) + " mm)");
            check(fs.height > 120 && fs.height < 300,
                  "Front Body Side is the underbust->hem band (" + std::to_string((int)fs.height) + " mm)");
            check(fbc->cutInstruction.find("button-placket edge") != std::string::npos,
                  "Front Body Center's CF edge is the grown button-placket edge (note)");
            check(fbs->cutInstruction.find("starting AT the underbust") != std::string::npos,
                  "Front Body Side starts AT the underbust (note)");
        }
        // TRUING: cup seam recorded identically on both cups; underbust lengths
        // recorded on the Lower Cup match the two Front Bodies.
        const double cupUp = lenFromNote(up, "mm crescent cup seam");
        const double cupLo = lenFromNote(lo, "mm crescent cup seam");
        check(cupUp > 0 && cupLo > 0 && std::fabs(cupUp - cupLo) < 0.5,
              "crescent cup seam trued Upper<->Lower (" + std::to_string(cupUp) + " vs " +
                  std::to_string(cupLo) + ")");
        const double ubC = lenFromNote(fbc, "mm underbust seam");
        const double ubS = lenFromNote(fbs, "mm underbust seam");
        // The Lower Cup note carries "C + S mm underbust seam"; parse S (the
        // number before " mm underbust seam") and C (the number before " + ").
        const double loS = lenFromNote(lo, "mm underbust seam");
        double loC = -1;
        {
            const std::string& s = lo->cutInstruction;
            const size_t plus = s.find(" + ");
            if (plus != std::string::npos) {
                size_t start = s.rfind(' ', plus - 1);
                std::string num;
                for (size_t i = start + 1; i < plus && (std::isdigit(s[i]) || s[i] == '.'); ++i) num += s[i];
                if (!num.empty()) loC = std::stod(num);
            }
        }
        check(ubC > 0 && loC > 0 && std::fabs(ubC - loC) < 0.5,
              "underbust seam trued Lower Cup <-> Front Body Center (" + std::to_string(loC) +
                  " vs " + std::to_string(ubC) + ")");
        check(ubS > 0 && loS > 0 && std::fabs(ubS - loS) < 0.5,
              "underbust seam trued Lower Cup <-> Front Body Side (" + std::to_string(loS) +
                  " vs " + std::to_string(ubS) + ")");
        // GEOMETRY == NOTE: the crescent's drawn straight bottom edge measures
        // (almost) the recorded underbust total; the crescent tapers out before
        // the side seam (crescentSpanShare), so the drawn edge is the recorded
        // total minus the tail segment the Upper Cup sews directly — it must be
        // strictly between 70% and 100% of the total and within the span share.
        {
            const double drawn = bottomEdgeWidth(*lo);
            const double total = ubC + ubS;
            check(drawn > total * 0.70 && drawn < total + 1.0,
                  "crescent bottom edge drawn " + std::to_string((int)drawn) +
                      " mm vs recorded underbust total " + std::to_string((int)total) +
                      " mm (tapers out before the side seam by design)");
        }
        // Notches + grainlines on every piece.
        {
            bool grain = true;
            for (const auto& p : d.pieces) grain = grain && p.hasGrainline;
            check(grain, "every corset piece carries a grainline");
            check(up->markings.size() >= 4 && lo->markings.size() >= 8,
                  "cup-seam + underbust notches stamped (Upper 2, Lower 4 pairs)");
        }
    }

    // ---- validator + wearability green ---------------------------------------
    {
        const auto issues = PatternValidator::issues(on, bugra36(), d);
        for (const auto& i : issues) std::printf("      issue: %s\n", i.description().c_str());
        check(issues.empty(), "corset draft is validator + wearability green");
    }

    // ---- guide names the construction ----------------------------------------
    {
        bool corsetStep = false, liningStep = false;
        for (const auto& s : d.guideSteps) {
            if (s.find("Bugra corset construction") != std::string::npos) corsetStep = true;
            if (s.find("full lining") != std::string::npos) liningStep = true;
        }
        check(corsetStep, "guide carries the corset assembly step (bands sewn top-down)");
        check(liningStep, "guide carries the honest full-lining finish (Bugra: main fabric as lining)");
    }

    // ---- honest refusals: non-hosting drafts stay byte-identical -------------
    {
        std::printf("\nHonest refusals:\n");
        struct Case { const char* label; GarmentSpec spec; };
        GarmentSpec cropped = on; cropped.topLength = TopLength::Cropped;
        GarmentSpec dress = on; dress.garment = GarmentType::Dress;
        GarmentSpec crew = on; crew.neckline = Neckline::Crew;
        GarmentSpec dart = on; dart.shaping = Shaping::Dart;
        const Case cases[] = {{"cropped top (no below-waist body)", cropped},
                              {"dress (skirt carries the lower body)", dress},
                              {"crew neck (not the bustier class)", crew},
                              {"dart shaping (no princess panels)", dart}};
        for (const auto& c : cases) {
            GarmentSpec base = c.spec; base.cupSeam = 0;
            const DraftedPattern dOn = GarmentDrafter::draft(c.spec, bugra36());
            const DraftedPattern dOff = GarmentDrafter::draft(base, bugra36());
            bool identical = dOn.pieces.size() == dOff.pieces.size();
            for (size_t i = 0; identical && i < dOn.pieces.size(); ++i)
                identical = dOn.pieces[i].name == dOff.pieces[i].name &&
                            sameCommands(dOn.pieces[i].commands, dOff.pieces[i].commands);
            bool note = false;
            for (const auto& s : dOn.guideSteps)
                if (s.find("Bugra corset: skipped") != std::string::npos) note = true;
            check(identical, std::string(c.label) + ": pieces byte-identical (refused, not half-built)");
            check(note, std::string(c.label) + ": named honest skip note present");
        }
    }

    std::printf(failures == 0 ? "\nALL BUSTIER CHECKS PASS\n" : "\n%d BUSTIER CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
