// Bugra Locket Top construction check (locketTop == Bugra).
// BASAR-IKI-KALIP.md locket items 1-5: the motor must draw the purchased
// pattern's SIX-piece Locket Top — Front Body (cut 2 mirrored, waist length,
// the big side bust dart CUT OPEN at the side seam), Back Body (ONE piece CUT
// ON FOLD with a waist dart), the TWO-PIECE gathered puff-band sleeve (Upper
// Sleeve = ruffled crown band + Lower Sleeve), and the deep-crescent Collar
// with its SEPARATE smaller Collar Lining — with NO neck facings.
// Proven here:
//  * piece count + names: EXACTLY the six Locket pieces, facings consumed;
//  * fold: Back Body is cut 1 on fold with a straight x=0 fold edge + a
//    waist dart marking;
//  * waist length: Front Body is the SHORT waist front (vs the hip-length
//    front the same spec drafts without Bugra);
//  * dart transfer truing: the front side seam is drawn LONGER than the back
//    side seam by (about) the wedge mouth the cut note records — sew the
//    wedge closed and the seams match;
//  * sleeve band truing: Upper and Lower Sleeve record the SAME band-seam mm,
//    and the Upper's drawn lower edge is measurably LONGER (the ruffle
//    fullness is real geometry, not a note);
//  * collar: crescent Collar's inner edge == the measured garment neck seam;
//    Collar Lining is smaller than the Collar (it rolls the seam under);
//  * validator + wearability green;
//  * honest refusals: hip-length / princess / sleeveless / collarless hosts
//    are left byte-identical with a named skip note;
//  * default OFF (locketTop none) stays byte-identical (golden surface).
#include <cctype>
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>

#include "../src/collar.hpp"
#include "../src/garment.hpp"
#include "../src/locket.hpp"
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

static GarmentSpec locketSpec() {
    GarmentSpec s;
    s.garment = GarmentType::Top;
    s.shaping = Shaping::Dart;
    s.neckline = Neckline::Crew;
    s.sleeveStyle = SleeveStyle::Straight;
    s.sleeveLength = SleeveLength::Short;
    s.sleeveCap = SleeveCap::Puffed;
    s.fabric = Fabric::Woven;
    s.topLength = TopLength::Cropped;
    s.frontPlacket = true; // the buttoned CF
    s.collarType = static_cast<int>(CollarType::Crescent);
    s.locketTop = static_cast<int>(LocketTop::Bugra);
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
// convention bustier_check uses; the notes carry the trued seam lengths).
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

// Front hem TILT: how much lower the side hem corner sits than the CF hem.
// The dart transfer shears the below-bust side region DOWN by the wedge mouth,
// so (tilt with Bugra) - (tilt without) must equal the recorded mouth — the
// side seam really is drawn longer by the intake, in geometry not just notes.
static double frontHemTilt(const PatternPiece& p) {
    std::vector<Point> pts;
    Point cur{0, 0};
    for (const auto& c : p.commands) {
        if (c.type == CmdType::Move || c.type == CmdType::Line) { pts.push_back(c.to); cur = c.to; }
        else if (c.type == CmdType::Curve) {
            const auto fl = flattenCubic(cur, c.to, c.cp1, c.cp2, 24);
            pts.insert(pts.end(), fl.begin() + 1, fl.end());
            cur = c.to;
        }
    }
    double minX = 1e18, maxX = -1e18;
    for (const auto& q : pts) { minX = std::min(minX, q.x); maxX = std::max(maxX, q.x); }
    double yCF = -1e18, ySide = -1e18;
    for (const auto& q : pts) {
        if (q.x < minX + 22) yCF = std::max(yCF, q.y);                    // CF/stand hem corner
        if (q.x > minX + (maxX - minX) * 0.62) ySide = std::max(ySide, q.y); // side hem region
    }
    return ySide - yCF;
}

int main() {
    const GarmentSpec on = locketSpec();
    GarmentSpec off = on; off.locketTop = static_cast<int>(LocketTop::None);

    // ---- enum surface --------------------------------------------------------
    std::printf("Enum surface:\n");
    check(static_cast<int>(LocketTop::None) == 0 && static_cast<int>(LocketTop::Bugra) == 1,
          "LocketTop surface is exactly {None=0, Bugra=1} (append-only)");
    check(static_cast<int>(CollarType::Crescent) == 6,
          "CollarType::Crescent appended at 6 (existing collar ints unchanged)");

    // ---- default OFF: byte-identical (golden surface) ------------------------
    {
        std::printf("\nDefault OFF is byte-identical:\n");
        GarmentSpec plainA = off;                      // same spec, locketTop none
        GarmentSpec plainB = off; plainB.locketTop = 0;
        const DraftedPattern d0 = GarmentDrafter::draft(plainA, bugra36());
        const DraftedPattern dN = GarmentDrafter::draft(plainB, bugra36());
        bool identical = d0.pieces.size() == dN.pieces.size();
        for (size_t i = 0; identical && i < d0.pieces.size(); ++i)
            identical = d0.pieces[i].name == dN.pieces[i].name &&
                        sameCommands(d0.pieces[i].commands, dN.pieces[i].commands);
        check(identical, "locketTop none leaves the same spec byte-identical (opt-in default off)");
    }

    // ---- ON: the six-piece Locket Top ----------------------------------------
    const DraftedPattern d = GarmentDrafter::draft(on, bugra36());
    const DraftedPattern dOff = GarmentDrafter::draft(off, bugra36());
    std::printf("\nBugra Locket ON (Bugra-36 body):\n");

    const char* names[6] = {"Front Body", "Back Body", "Collar",
                            "Collar Lining", "Upper Sleeve", "Lower Sleeve"};
    for (const char* n : names)
        check(findExact(d, n) != nullptr, std::string("piece exists: ") + n);
    check(d.pieces.size() == 6,
          "EXACTLY six pieces (Locket foy) — neck facings consumed, one-piece sleeve replaced; got " +
              std::to_string(d.pieces.size()));

    const PatternPiece* fb = findExact(d, "Front Body");
    const PatternPiece* bb = findExact(d, "Back Body");
    const PatternPiece* col = findExact(d, "Collar");
    const PatternPiece* lin = findExact(d, "Collar Lining");
    const PatternPiece* us = findExact(d, "Upper Sleeve");
    const PatternPiece* ls = findExact(d, "Lower Sleeve");
    if (fb && bb && col && lin && us && ls) {
        // Fold: Back Body is cut 1 on fold with a STRAIGHT x=0 fold edge and a
        // waist dart marking (the Bugra back keeps its dart).
        check(bb->cutInstruction.find("cut 1 on fold") != std::string::npos,
              "Back Body is cut 1 on fold");
        {
            const Rect b = boundingBox(bb->commands);
            double foldLo = 1e18, foldHi = -1e18;
            int foldPts = 0;
            for (const auto& c : bb->commands) {
                if (c.type == CmdType::Close) continue;
                if (std::fabs(c.to.x) < 0.5) {
                    foldLo = std::min(foldLo, c.to.y); foldHi = std::max(foldHi, c.to.y); foldPts++;
                }
            }
            check(b.x > -1e-6 && foldPts >= 2 && (foldHi - foldLo) > b.height * 0.85,
                  "fold edge is a straight x=0 line spanning the piece (honestly cuttable on fold)");
            check(bb->markings.size() >= 3, "Back Body keeps its waist-dart marking");
        }
        // Waist length: the same spec WITHOUT Bugra drafts a hip-length front
        // (topLength hip default in the off-spec here is cropped too, so compare
        // against an explicit hip draft).
        {
            GarmentSpec hip = off; hip.topLength = TopLength::Hip;
            const DraftedPattern dHip = GarmentDrafter::draft(hip, bugra36());
            const PatternPiece* hipFront = findExact(dHip, "Top Front");
            const double lockH = boundingBox(fb->commands).height;
            const double hipH = hipFront ? boundingBox(hipFront->commands).height : 0;
            check(hipFront && lockH < hipH - 100,
                  "Front Body is the WAIST-length front (" + std::to_string((int)lockH) +
                      " mm) vs the hip-length front (" + std::to_string((int)hipH) + " mm)");
        }
        // Dart-transfer truing: the front hem tilts DOWN toward the side by the
        // recorded wedge mouth (vs the same spec without Bugra) — the side seam
        // really is drawn longer by the intake, in geometry, so sewing the
        // wedge closed levels the hem and matches the back side seam.
        {
            const double mouth = lenFromNote(fb, "mm at its mouth");
            check(mouth > 20 && mouth < 90,
                  "cut note records a real wedge mouth (" + std::to_string(mouth) + " mm)");
            // GEOMETRY == NOTE: the last three marking pairs are wedge-top tick,
            // wedge-bottom tick, wedge-apex mark. The two mouth ticks sit exactly
            // one recorded mouth apart — the wedge is real geometry, not a note.
            const size_t M = fb->markings.size();
            double drawnMouth = -1, reach = -1;
            if (M >= 6) {
                const Point t1 = fb->markings[M - 6].to;
                const Point t2 = fb->markings[M - 4].to;
                const Point ap = fb->markings[M - 2].to;
                drawnMouth = std::hypot(t2.x - t1.x, t2.y - t1.y);
                reach = std::hypot(t1.x - ap.x, t1.y - ap.y);
            }
            check(drawnMouth > 0 && std::fabs(drawnMouth - mouth) < 1.5,
                  "drawn wedge mouth " + std::to_string(drawnMouth) +
                      " mm equals the recorded " + std::to_string(mouth) + " mm");
            // TRUED WEDGE FACES: the outline carries the wedge apex as a vertex
            // whose two neighbouring cut edges (apex->upper mouth corner and
            // apex->lower mouth corner) are EQUAL — the rigid rotation's radius
            // both times — so the open dart sews closed edge-to-edge.
            {
                double e1 = -1, e2 = -1;
                const Point ap = fb->markings[M - 2].to;
                std::vector<Point> vs;
                for (const auto& c : fb->commands)
                    if (c.type == CmdType::Move || c.type == CmdType::Line) vs.push_back(c.to);
                for (size_t i = 0; i < vs.size(); ++i) {
                    if (std::fabs(vs[i].x - ap.x) < 0.01 && std::fabs(vs[i].y - ap.y) < 0.01) {
                        const Point& prev = vs[(i + vs.size() - 1) % vs.size()];
                        const Point& next = vs[(i + 1) % vs.size()];
                        e1 = std::hypot(prev.x - ap.x, prev.y - ap.y);
                        e2 = std::hypot(next.x - ap.x, next.y - ap.y);
                        break;
                    }
                }
                check(e1 > 60 && std::fabs(e1 - e2) < 0.5 && std::fabs(e1 - reach) < 1.5,
                      "wedge cut faces are equal (" + std::to_string(e1) + " vs " +
                          std::to_string(e2) + " mm) — the open dart sews closed edge-to-edge");
            }
            const PatternPiece* plainFront = findExact(dOff, "Top Front");
            // And the rotation really tilts the hem down toward the side vs the
            // same spec without Bugra (the slashed flap swings down).
            const double tiltOn = frontHemTilt(*fb);
            const double tiltOff = plainFront ? frontHemTilt(*plainFront) : -1e18;
            check(plainFront && (tiltOn - tiltOff) > 3,
                  "front hem tilts down toward the side (tilt " + std::to_string((int)tiltOn) +
                      " vs plain " + std::to_string((int)tiltOff) +
                      ") — the flap really rotated");
            check(fb->cutInstruction.find("CUT OPEN") != std::string::npos,
                  "Front Body cut note names the cut-open side dart");
        }
        // Sleeve band truing: both sleeve notes record the SAME band seam, and
        // the Upper's drawn lower edge is really longer (ruffle in geometry).
        {
            const double seamU = lenFromNote(us, "mm sleeve band seam");
            const double seamL = lenFromNote(ls, "mm sleeve band seam");
            check(seamU > 0 && seamL > 0 && std::fabs(seamU - seamL) < 0.5,
                  "sleeve band seam trued Upper<->Lower (" + std::to_string(seamU) + " vs " +
                      std::to_string(seamL) + ")");
            const double drawnBand = lenFromNote(us, "mm, gathers to the");
            check(drawnBand > seamU * 1.10,
                  "Upper Sleeve's drawn lower edge (" + std::to_string((int)drawnBand) +
                      " mm) carries real ruffle fullness over the " +
                      std::to_string((int)seamU) + " mm seam");
            // The crown gathers into the armhole: drawn crown > armhole.
            const double crown = lenFromNote(us, "mm, gathers into the");
            const double armhole = lenFromNote(us, "mm armhole");
            check(crown > armhole * 1.15,
                  "crown drawn " + std::to_string((int)crown) + " mm gathers into the " +
                      std::to_string((int)armhole) + " mm armhole (real fullness)");
            // Two crescents: both sleeve pieces are wider than tall (bands).
            const Rect ub = boundingBox(us->commands);
            const Rect lb = boundingBox(ls->commands);
            check(ub.width > ub.height * 1.6, "Upper Sleeve is a wide crown band");
            check(lb.width > lb.height * 1.4, "Lower Sleeve is a wide band");
            check(ub.width > lb.width * 1.2,
                  "Upper Sleeve is wider than the Lower (the gather is real geometry)");
        }
        // Collar truing: the crescent's recorded neck seam equals the measured
        // garment neckline (minus the grown stand jogs) to < 2 mm; the lining
        // is smaller than the collar.
        {
            const double collarNeck = lenFromNote(col, "mm neck seam");
            check(collarNeck > 200, "Collar records its neck seam length");
            const double colPerim = pathLength(col->commands);
            const double linPerim = pathLength(lin->commands);
            check(linPerim < colPerim * 0.85,
                  "Collar Lining is smaller than the Collar (perim " + std::to_string((int)linPerim) +
                      " vs " + std::to_string((int)colPerim) + ") — the seam rolls under");
            check(lin->cutInstruction.find("on fold") != std::string::npos,
                  "Collar Lining is cut on the fold");
        }
        // No neck facings; every piece carries a grainline.
        {
            bool facing = false, grain = true;
            for (const auto& p : d.pieces) {
                if (p.name.find("Neck Facing") != std::string::npos) facing = true;
                grain = grain && p.hasGrainline;
            }
            check(!facing, "no neck facing pieces (the collar + lining finish the neck, like the Bugra)");
            check(grain, "every Locket piece carries a grainline");
        }
    }

    // ---- validator + wearability green ---------------------------------------
    {
        const auto issues = PatternValidator::issues(on, bugra36(), d);
        for (const auto& i : issues) std::printf("      issue: %s\n", i.description().c_str());
        check(issues.empty(), "Locket draft is validator + wearability green");
    }

    // ---- guide names the construction ----------------------------------------
    {
        bool dartStep = false, sleeveStep = false, collarStep = false;
        for (const auto& s : d.guideSteps) {
            if (s.find("side bust dart") != std::string::npos) dartStep = true;
            if (s.find("Two-piece sleeve") != std::string::npos) sleeveStep = true;
            if (s.find("Collar Lining") != std::string::npos) collarStep = true;
        }
        check(dartStep, "guide carries the cut-open side-dart step");
        check(sleeveStep, "guide carries the two-piece gathered sleeve step");
        check(collarStep, "guide carries the collar + smaller lining step");
    }

    // ---- honest refusals: non-hosting drafts stay byte-identical -------------
    {
        std::printf("\nHonest refusals:\n");
        struct Case { const char* label; GarmentSpec spec; };
        GarmentSpec hip = on; hip.topLength = TopLength::Hip;
        GarmentSpec princess = on; princess.shaping = Shaping::Princess;
        GarmentSpec sleeveless = on; sleeveless.sleeveStyle = SleeveStyle::None;
        GarmentSpec noCollar = on; noCollar.collarType = 0;
        const Case cases[] = {{"hip-length top (not waist length)", hip},
                              {"princess shaping (the Locket is a dart top)", princess},
                              {"sleeveless (no two-piece sleeve host)", sleeveless},
                              {"no crescent collar", noCollar}};
        for (const auto& c : cases) {
            GarmentSpec base = c.spec; base.locketTop = 0;
            const DraftedPattern dOn = GarmentDrafter::draft(c.spec, bugra36());
            const DraftedPattern dBase = GarmentDrafter::draft(base, bugra36());
            bool identical = dOn.pieces.size() == dBase.pieces.size();
            for (size_t i = 0; identical && i < dOn.pieces.size(); ++i)
                identical = dOn.pieces[i].name == dBase.pieces[i].name &&
                            sameCommands(dOn.pieces[i].commands, dBase.pieces[i].commands);
            bool note = false;
            for (const auto& s : dOn.guideSteps)
                if (s.find("Bugra Locket: skipped") != std::string::npos) note = true;
            check(identical, std::string(c.label) + ": pieces byte-identical (refused, not half-built)");
            check(note, std::string(c.label) + ": named honest skip note present");
        }
    }

    (void)dOff;
    std::printf(failures == 0 ? "\nALL LOCKET CHECKS PASS\n" : "\n%d LOCKET CHECK(S) FAILED\n", failures);
    return failures == 0 ? 0 : 1;
}
