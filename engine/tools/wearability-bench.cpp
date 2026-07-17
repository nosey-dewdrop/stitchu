// Wearability benchmark harness. Reads spec rows on stdin (one per benchmark
// photo), drafts each on a standard adult body, runs the wearability gate, and
// prints per-row PASS/FAIL + a summary. Lets us count how many of the 54
// benchmark specs the engine currently drafts into an UNWEARABLE pattern.
//
// Input is TSV (tab-separated), one row per garment, fields (all strings/ints):
//   id  garment  neckline  sleeveStyle  frontPlacket  tieClosure  backOpening  keyhole
// frontPlacket/keyhole are 0/1; tieClosure/backOpening are the enum ints.
//
// The mapping from vision language -> these fields is done in the node driver
// (wearability-bench.mjs), mirroring create.js. This CLI is the deterministic
// engine side.
#include <cstdio>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

#include "../src/garment.hpp"
#include "../src/validator.hpp"
#include "../src/wearability.hpp"

using namespace stitchu;

static Neckline necklineFrom(const std::string& s) {
    if (s == "scoop") return Neckline::Scoop;
    if (s == "vNeck") return Neckline::VNeck;
    if (s == "square") return Neckline::Square;
    if (s == "boat") return Neckline::Boat;
    if (s == "sweetheart") return Neckline::Sweetheart;
    if (s == "halter") return Neckline::Halter;
    return Neckline::Crew;
}
static SleeveStyle sleeveStyleFrom(const std::string& s) {
    if (s == "straight") return SleeveStyle::Straight;
    if (s == "balloon") return SleeveStyle::Balloon;
    return SleeveStyle::None;
}
static GarmentType garmentFrom(const std::string& s) {
    if (s == "skirt") return GarmentType::Skirt;
    if (s == "top") return GarmentType::Top;
    return GarmentType::Dress;
}

int main() {
    const BodyMeasurementsSnapshot m{90, 72, 98, 38, 40, 58, 36}; // EU ~38 adult

    int total = 0, fail = 0, headFail = 0, foldFail = 0, edgeFail = 0;
    std::string line;
    std::printf("%-28s %-8s %-10s %-6s  RESULT\n", "id", "garment", "neckline", "opng");
    while (std::getline(std::cin, line)) {
        if (line.empty() || line[0] == '#') continue;
        std::stringstream ss(line);
        std::string id, garment, neckline, sleeveStyle, fp, tie, back, key;
        std::getline(ss, id, '\t');
        std::getline(ss, garment, '\t');
        std::getline(ss, neckline, '\t');
        std::getline(ss, sleeveStyle, '\t');
        std::getline(ss, fp, '\t');
        std::getline(ss, tie, '\t');
        std::getline(ss, back, '\t');
        std::getline(ss, key, '\t');

        GarmentSpec spec;
        spec.garment = garmentFrom(garment);
        spec.neckline = necklineFrom(neckline);
        spec.sleeveStyle = sleeveStyleFrom(sleeveStyle);
        spec.frontPlacket = (fp == "1");
        spec.tieClosure = tie.empty() ? 0 : std::stoi(tie);
        spec.backOpening = back.empty() ? 0 : std::stoi(back);
        spec.keyhole = (key == "1");

        const DraftedPattern d = GarmentDrafter::draft(spec, m);
        const auto wear = Wearability::issues(spec, m, d);
        const double opening = Wearability::finishedNeckOpeningMM(spec, d);

        bool h = false, f = false, e = false;
        for (const auto& i : wear) {
            if (i.detail.find("cannot be put on") != std::string::npos) h = true;
            else if (i.detail.find("closure was dropped") != std::string::npos) f = true;
            else if (i.detail.find("raw, fraying edge") != std::string::npos) e = true;
        }
        total++;
        std::string tag;
        if (h) { headFail++; tag += "HEAD "; }
        if (f) { foldFail++; tag += "FOLD "; }
        if (e) { edgeFail++; tag += "EDGE "; }
        if (!wear.empty()) fail++;
        std::printf("%-28s %-8s %-10s %-6.0f  %s\n",
            id.substr(0, 28).c_str(), garment.c_str(), neckline.c_str(), opening,
            wear.empty() ? "wearable" : ("UNWEARABLE " + tag).c_str());
    }
    std::printf("\nSUMMARY: %d specs, %d UNWEARABLE (head=%d fold=%d edge=%d)\n",
                total, fail, headFail, foldFail, edgeFail);
    return 0;
}
