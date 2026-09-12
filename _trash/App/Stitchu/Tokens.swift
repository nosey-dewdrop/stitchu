// Tokens.swift — GENERATED. Do not edit.
// Source: contract/design-tokens.json
// Regenerate: node scripts/gen-design-tokens.mjs --swift
//
// These are the SAME values web/css/tokens.css is generated from, so the iOS
// app and the web app cannot drift apart. The hand-written Theme.swift is a
// separate, older surface and is not touched by this generator.

import CoreGraphics
import SwiftUI

enum StitchuTokens {
    // MARK: - Colour
    enum Color {
        /// navy body ink (AA on white)
        static let ink = SwiftUI.Color(tokenHex: 0x1F3A5F)
        static let paper = SwiftUI.Color(tokenHex: 0xFFFFFF)
        /// teal/navy accent (was vişne #8f2038)
        static let accent = SwiftUI.Color(tokenHex: 0x2F6F7E)
        static let gray = SwiftUI.Color(tokenHex: 0x5B7089)
        static let faint = SwiftUI.Color(tokenHex: 0xCFE0EF)
        static let bb = SwiftUI.Color(tokenHex: 0x8FBFE8)
        /// AA-readable baby blue for labels/links
        static let bbDeep = SwiftUI.Color(tokenHex: 0x3F74A8)
        static let bbPale = SwiftUI.Color(tokenHex: 0xDCEAF7)
        static let bbLine = SwiftUI.Color(tokenHex: 0xBCD7EE)
        static let navy = SwiftUI.Color(tokenHex: 0x1F3A5F)
        static let teal = SwiftUI.Color(tokenHex: 0x2F6F7E)
        static let threadRose = SwiftUI.Color(tokenHex: 0xC4767B)
        static let threadOchre = SwiftUI.Color(tokenHex: 0xB8963E)
        static let threadOlive = SwiftUI.Color(tokenHex: 0x7A8450)
        static let threadNavy = SwiftUI.Color(tokenHex: 0x3E5C76)
        static let threadPlum = SwiftUI.Color(tokenHex: 0x7E5A75)
    }

    // MARK: - Type
    // The three font stacks the web is allowed to name, in CSS order:
    // try each family and fall through. UIFont(name:) returns nil for a
    // missing family, so the iOS side walks the same list.
    enum Font {
        /// CSS: "Helvetica Neue", Helvetica, Arial, sans-serif
        static let ui: [String] = ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"]
        /// CSS: Helvetica, Arial, sans-serif
        static let uiCompact: [String] = ["Helvetica", "Arial", "sans-serif"]
        /// CSS: 'Didot', 'Bodoni 72', Georgia, serif
        static let display: [String] = ["Didot", "Bodoni 72", "Georgia", "serif"]
        /// --font (the web body stack) is fontStacks.ui above.
    }

    // MARK: - Scale (points; the CSS px values read 1:1 as iOS points)
    enum Size {
        /// CSS --size-hero: 46px
        static let sizeHero: CGFloat = 46
        /// CSS --size-h2: 26px
        static let sizeH2: CGFloat = 26
        /// CSS --size-body: 16px
        static let sizeBody: CGFloat = 16
        /// CSS --size-small: 14px
        static let sizeSmall: CGFloat = 14
        /// CSS --size-fine: 13px
        static let sizeFine: CGFloat = 13
        /// CSS --radius: 2px
        static let radius: CGFloat = 2
        /// CSS --space-1: 8px
        static let space1: CGFloat = 8
        /// CSS --space-2: 16px
        static let space2: CGFloat = 16
        /// CSS --space-3: 24px
        static let space3: CGFloat = 24
        /// CSS --space-4: 40px
        static let space4: CGFloat = 40
        /// CSS --space-5: 72px
        static let space5: CGFloat = 72
        /// CSS --measure: 1060px
        static let measure: CGFloat = 1060
    }
}

extension SwiftUI.Color {
    /// 0xRRGGBB from the design-token contract, in sRGB.
    init(tokenHex: UInt32) {
        self.init(
            .sRGB,
            red: Double((tokenHex >> 16) & 0xFF) / 255,
            green: Double((tokenHex >> 8) & 0xFF) / 255,
            blue: Double(tokenHex & 0xFF) / 255
        )
    }
}
