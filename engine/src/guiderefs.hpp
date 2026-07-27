#pragma once
// Guide <-> piece two-way audit. The sewing guide used to be free text with no
// tie to the drafted pieces, so a guide could sew a piece the cut list hid
// (courtney's bias binding) or mention a construction the draft never drew.
// This audit (a) attaches to every guide step the drafted pieces it references,
// (b) flags ORPHAN pieces no step mentions, (c) flags PHANTOM steps that name a
// separable piece category with no matching piece in the draft.
#include <algorithm>
#include <cctype>
#include <string>
#include <vector>

#include "garment.hpp"

namespace stitchu {

struct GuideAudit {
    // stepPieces[i] = names of drafted pieces referenced by guideSteps[i]
    std::vector<std::vector<std::string>> stepPieces;
    std::vector<std::string> orphanPieces;  // drafted but never mentioned
    std::vector<std::string> phantomSteps;  // mention a piece category not drafted
};

namespace guidedetail {

inline std::string lower(const std::string& s) {
    std::string out = s;
    std::transform(out.begin(), out.end(), out.begin(),
                   [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    return out;
}

// Separable-piece categories: when a guide step says this word, a dedicated
// piece of that category must exist in the draft. Technique words that
// legitimately appear without a piece (facing as a finish, bias as a grain,
// elastic as a notion) are NOT in this list on purpose.
inline const std::vector<std::string>& pieceCategories() {
    static const std::vector<std::string> kCats = {
        "sleeve", "cuff", "pocket", "collar", "peplum", "strap", "waistband",
        "drawstring", "cape", "flounce", "ruffle", "binding", "frill",
    };
    return kCats;
}

// Categories the PHANTOM check enforces. 'binding' and 'frill' stay coverage-
// only: "finish with a facing or bias binding" is technique-alternative
// language and "it frills down the back" is a verb — both appear legitimately
// with no dedicated piece.
inline const std::vector<std::string>& phantomCategories() {
    static const std::vector<std::string> kCats = {
        "sleeve", "cuff", "pocket", "collar", "peplum", "strap", "waistband",
        "drawstring", "cape", "flounce", "ruffle",
    };
    return kCats;
}

inline bool isAlpha(char c) { return std::isalpha(static_cast<unsigned char>(c)) != 0; }

// Whole-word occurrence (plural 's' allowed): 'sleeve' matches "sleeves" but
// not "sleeveless". When negatedOnly is false, occurrences preceded by "no " /
// "without " (honest negations: "there are no sleeves") do not count.
inline bool matchWord(const std::string& textLower, const std::string& tok, bool countNegated) {
    size_t pos = 0;
    while ((pos = textLower.find(tok, pos)) != std::string::npos) {
        const bool startOk = pos == 0 || !isAlpha(textLower[pos - 1]);
        size_t end = pos + tok.size();
        if (end < textLower.size() && textLower[end] == 's') end++; // plural
        const bool endOk = end >= textLower.size() || !isAlpha(textLower[end]);
        if (startOk && endOk) {
            if (!countNegated) {
                const std::string before = textLower.substr(pos > 12 ? pos - 12 : 0, pos > 12 ? 12 : pos);
                if (before.find("no ") != std::string::npos || before.find("without ") != std::string::npos) {
                    pos = end;
                    continue;
                }
            }
            return true;
        }
        pos = end;
    }
    return false;
}

// ALL categories a piece name carries ("Sleeve Cuff" is both sleeve and cuff).
inline std::vector<std::string> categoriesOf(const std::string& pieceNameLower) {
    std::vector<std::string> cats;
    for (const auto& cat : pieceCategories())
        if (pieceNameLower.find(cat) != std::string::npos) cats.push_back(cat);
    return cats;
}

// A step that HONESTLY reports a skip ("the sleeve choice was skipped") may
// name a category without its piece — that sentence is the honesty layer.
inline bool isHonestSkip(const std::string& stepLower) {
    return stepLower.find("skipped") != std::string::npos ||
           stepLower.find("not drawn") != std::string::npos ||
           stepLower.find("rather than") != std::string::npos; // "bound edge rather than a raglan sleeve"
}

} // namespace guidedetail

inline GuideAudit auditGuide(const DraftedPattern& p) {
    using namespace guidedetail;
    GuideAudit audit;
    audit.stepPieces.resize(p.guideSteps.size());

    std::vector<std::string> stepLower;
    stepLower.reserve(p.guideSteps.size());
    for (const auto& s : p.guideSteps) stepLower.push_back(lower(s));

    // piece -> steps: a piece is referenced when one of its category words
    // (sleeve, pocket...) or, for body panels, a body word of its name appears
    // in the step. Negated mentions still count as a reference here — "leave
    // the center back seam open" references the back piece.
    for (size_t pi = 0; pi < p.pieces.size(); ++pi) {
        const std::string nameLower = lower(p.pieces[pi].name);
        // Coverage is lenient on wording: any word of the piece's name counts
        // as a mention ("Bias binding" is covered by "bind ... the bias strip").
        std::vector<std::string> tokens = categoriesOf(nameLower);
        for (const char* w : {"bodice", "skirt", "top", "front", "back", "center", "side",
                              "tie", "bow", "cord", "elastic", "facing", "keyhole", "panel",
                              "band", "bias", "cup"})
            if (nameLower.find(w) != std::string::npos) tokens.push_back(w);
        bool covered = false;
        for (size_t si = 0; si < stepLower.size(); ++si) {
            for (const auto& tok : tokens) {
                if (matchWord(stepLower[si], tok, /*countNegated=*/true)) {
                    audit.stepPieces[si].push_back(p.pieces[pi].name);
                    covered = true;
                    break;
                }
            }
        }
        if (!covered) audit.orphanPieces.push_back(p.pieces[pi].name);
    }

    // step -> pieces: a step naming a separable category must have that piece.
    std::vector<std::string> presentCats;
    for (const auto& piece : p.pieces)
        for (const auto& cat : categoriesOf(lower(piece.name)))
            presentCats.push_back(cat);
    // A halter's neck straps are GROWN-ON (part of the bodice front piece by
    // construction), so halter guides may say "strap" with no strap piece.
    // Detected from the draft itself: the halter's dedicated binding piece.
    bool halter = lower(p.garment).find("halter") != std::string::npos;
    for (const auto& piece : p.pieces)
        if (lower(piece.name).find("halter") != std::string::npos) halter = true;
    // The Bugra corset's straps are also GROWN-ON — cut in one piece with the
    // Upper Cup and the Back Body Side (the cut notes say "cut-on strap") — so
    // its guide names straps with no separate strap piece, like the halter.
    bool grownOnStrap = halter;
    for (const auto& piece : p.pieces)
        if (lower(piece.cutInstruction).find("cut-on strap") != std::string::npos)
            grownOnStrap = true;
    for (size_t si = 0; si < stepLower.size(); ++si) {
        if (isHonestSkip(stepLower[si])) continue;
        for (const auto& cat : phantomCategories()) {
            if (grownOnStrap && cat == "strap") continue;
            if (!matchWord(stepLower[si], cat, /*countNegated=*/false)) continue;
            if (std::find(presentCats.begin(), presentCats.end(), cat) == presentCats.end())
                audit.phantomSteps.push_back(p.guideSteps[si] + " [no '" + cat + "' piece drafted]");
        }
    }
    return audit;
}

} // namespace stitchu
