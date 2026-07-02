import Foundation
import CoreGraphics

enum GarmentType: String, CaseIterable, Identifiable {
    case skirt, dress, top

    var id: String { rawValue }
    var title: String { rawValue }
}

enum TopLength: String, CaseIterable, Identifiable {
    case cropped, hip, tunic

    var id: String { rawValue }
    /// Extra length below the natural waist, mm.
    var belowWaist: Double {
        switch self {
        case .cropped: 0
        case .hip: 180
        case .tunic: 300
        }
    }
}

/// Single entry point: garment parameters -> drafted pattern.
enum GarmentDrafter {
    static func draft(
        garment: GarmentType,
        measurements m: BodyMeasurementsSnapshot,
        skirtStyle: SkirtStyle,
        skirtLength: SkirtLength,
        topLength: TopLength
    ) -> DraftedPattern {
        switch garment {
        case .skirt:
            return SkirtBlock.draft(measurements: m, style: skirtStyle, length: skirtLength)
        case .dress:
            return DressBlock.draft(measurements: m, skirtStyle: skirtStyle, skirtLength: skirtLength)
        case .top:
            return TopBlock.draft(measurements: m, length: topLength)
        }
    }
}

/// Dress = fitted bodice + attached skirt, waist seam, invisible back zipper.
/// v1 is sleeveless (sleeve block not yet verified); armholes get bias facing.
struct DressBlock {
    static func draft(measurements m: BodyMeasurementsSnapshot, skirtStyle: SkirtStyle, skirtLength: SkirtLength) -> DraftedPattern {
        let bodice = BodiceBlock.draft(measurements: m)
        let skirt = SkirtBlock.draft(measurements: m, style: skirtStyle, length: skirtLength)
        // Reuse the skirt's front/back quarters; drop its waistband (dress has a waist seam).
        let skirtPieces = skirt.pieces.filter { $0.name != "Waistband" }.map { piece in
            var renamed = piece
            renamed.name = "Skirt \(piece.name)"
            return renamed
        }

        let meters = skirt.fabricMeters140 + 0.7 // bodice front+back on top of skirt yardage

        return DraftedPattern(
            garment: "\(skirtStyle.title) dress",
            pieces: [bodice.front, bodice.back] + skirtPieces,
            fabricAdviceKey: "dress",
            fabricMeters140: meters.rounded(toPlaces: 1),
            guideSteps: [
                "Print and check the 3 cm calibration square before cutting.",
                "This block uses standard assumptions for shoulder slope and underbust — sew a quick muslin (test version) from cheap fabric first and adjust darts before cutting your real fabric.",
                "Cut bodice front on fold, bodice back twice, skirt front and back on fold.",
                "Sew all darts first: bodice waist darts and skirt darts, pressing toward the center.",
                "Sew bodice shoulder and side seams. Finish armholes with bias binding (this version is sleeveless).",
                "Sew skirt side seams, leaving the top 20 cm of the LEFT side open only if you prefer a side zipper.",
                "Join bodice to skirt at the waist seam, matching side seams and darts.",
                "Insert an invisible zipper in the center back through bodice and skirt: install the zipper BEFORE closing the seam below it.",
                "Close the remaining back seam, try it on, then hem with a 2 cm double fold.",
            ]
        )
    }
}

/// Top = bodice lengthened past the waist to the chosen hem, gentle A-shape at hip.
struct TopBlock {
    static func draft(measurements m: BodyMeasurementsSnapshot, length: TopLength) -> DraftedPattern {
        let bodice = BodiceBlock.draft(measurements: m)
        let extra = length.belowWaist
        let hipHalfQuarter = (m.hipMM / 4) * 1.04

        let front = extend(bodice.front, from: bodice.frontLength, by: extra, toWidth: hipHalfQuarter)
        let back = extend(bodice.back, from: bodice.backLength, by: extra, toWidth: hipHalfQuarter)

        let lengthM = (bodice.frontLength + extra) * 2 * 1.15 / 1000
        return DraftedPattern(
            garment: "\(length.rawValue) top",
            pieces: [front, back],
            fabricAdviceKey: "top",
            fabricMeters140: lengthM.rounded(toPlaces: 1),
            guideSteps: [
                "Print and check the 3 cm calibration square before cutting.",
                "This block uses standard assumptions for shoulder slope and underbust — sew a quick muslin first and adjust darts before cutting your real fabric.",
                "Cut front on fold, back twice (or on fold if it slips over your head — check the neck opening against your head circumference).",
                "Sew darts, pressing toward the center.",
                "Sew shoulder seams, then side seams.",
                "Finish the neckline and armholes with bias binding.",
                "Hem with a 2 cm double fold.",
            ]
        )
    }

    /// Extends a bodice half-piece below the waist: side seam flows out to the
    /// hip width, hem squares back to the center edge.
    private static func extend(_ piece: PatternPiece, from waistY: Double, by extra: Double, toWidth hipWidth: Double) -> PatternPiece {
        guard extra > 0 else {
            var cropped = piece
            cropped.name = piece.name.replacingOccurrences(of: "Bodice", with: "Top")
            return cropped
        }
        var result = piece
        result.name = piece.name.replacingOccurrences(of: "Bodice", with: "Top")

        // The bodice outline runs ... side seam -> sideWaist -> waist curve -> centerWaist -> center ...
        // Rebuild: replace the waistline segment with hem at waistY + extra.
        var commands: [PathCommand] = []
        var index = 0
        while index < result.commands.count {
            let cmd = result.commands[index]
            if case .line(let p) = cmd, abs(p.y - (waistY - 8)) < 0.5 {
                // side seam endpoint: continue to the hem instead of the waist
                let hemSide = CGPoint(x: hipWidth, y: waistY + extra - 10)
                let hemCenter = CGPoint(x: 0, y: waistY + extra)
                commands.append(.curve(to: hemSide,
                                       cp1: CGPoint(x: p.x, y: waistY + extra * 0.35),
                                       cp2: CGPoint(x: hipWidth, y: waistY + extra * 0.7)))
                commands.append(.curve(to: hemCenter,
                                       cp1: CGPoint(x: hipWidth * 0.6, y: waistY + extra),
                                       cp2: CGPoint(x: hipWidth * 0.25, y: waistY + extra)))
                // skip original waistline curve and center-edge curve, close from hem center
                index += 2
                if index < result.commands.count, case .curve(let to, _, _) = result.commands[index], to.y < waistY {
                    // append the original center edge, retargeted to start from hem center
                    commands.append(.line(CGPoint(x: 0, y: to.y)))
                    index += 1
                }
                continue
            }
            commands.append(cmd)
            index += 1
        }
        result.commands = commands
        return result
    }
}
