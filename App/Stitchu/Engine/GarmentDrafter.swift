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

/// Everything the AI reads from the photo (and the user confirms) that the
/// engine knows how to draft.
struct GarmentSpec {
    var garment: GarmentType = .dress
    var neckline: Neckline = .crew
    var sleeveStyle: SleeveStyle = .none
    var sleeveLength: SleeveLength = .short
    var skirtStyle: SkirtStyle = .aLine
    var skirtLength: SkirtLength = .midi
    var topLength: TopLength = .hip
}

/// Single entry point: garment spec -> drafted pattern.
enum GarmentDrafter {
    static func draft(spec: GarmentSpec, measurements m: BodyMeasurementsSnapshot) -> DraftedPattern {
        switch spec.garment {
        case .skirt:
            return SkirtBlock.draft(measurements: m, style: spec.skirtStyle, length: spec.skirtLength)
        case .dress:
            return DressBlock.draft(spec: spec, measurements: m)
        case .top:
            return TopBlock.draft(spec: spec, measurements: m)
        }
    }
}

/// Dress = fitted bodice + attached skirt, waist seam, invisible back zipper.
struct DressBlock {
    static func draft(spec: GarmentSpec, measurements m: BodyMeasurementsSnapshot) -> DraftedPattern {
        let bodice = BodiceBlock.draft(measurements: m, neckline: spec.neckline)
        let skirtPieces = SkirtBlock.pieces(measurements: m, style: spec.skirtStyle, length: spec.skirtLength, includeWaistband: false)
            .map { piece in
                var renamed = piece
                renamed.name = "Skirt \(piece.name)"
                return renamed
            }
        let sleeves = SleeveBlock.draft(
            measurements: m,
            style: spec.sleeveStyle,
            length: spec.sleeveLength,
            armholeLength: bodice.armholeLength,
            armholeDepth: bodice.armholeDepth
        )

        var meters = SkirtBlock.fabricEstimate(measurements: m, style: spec.skirtStyle, length: spec.skirtLength) + 0.7
        if !sleeves.isEmpty { meters += spec.sleeveLength == .long ? 0.7 : 0.4 }

        var steps = [
            "Print and check the 3 cm calibration square before cutting.",
            "This block uses standard assumptions for shoulder slope, underbust\(sleeves.isEmpty ? "" : " and arm width") — sew a quick muslin (test version) from cheap fabric first and adjust before cutting your real fabric.",
            "Cut bodice front on fold, bodice back twice, skirt pieces as labelled\(sleeves.isEmpty ? "" : ", sleeves twice").",
            "Sew all darts first, pressing toward the center.",
            "Sew bodice shoulder and side seams.",
        ]
        if sleeves.isEmpty {
            steps.append("Finish armholes with bias binding (sleeveless).")
        }
        if spec.skirtStyle == .gathered {
            steps.append("Gather the skirt panels along the marked line until they match the bodice waist.")
        }
        steps += [
            "Sew the skirt seams, then join bodice to skirt at the waist seam, matching side seams.",
            "Insert an invisible zipper in the center back through bodice and skirt: install the zipper BEFORE closing the seam below it, then close the rest of the seam.",
        ]
        if !sleeves.isEmpty {
            steps.append("Sew each sleeve seam. Run gathering stitches between the cap notches, ease the cap into the armhole and set the sleeves in.")
            if spec.sleeveStyle == .balloon {
                steps.append("Gather the sleeve hem along the marked line and attach the interfaced cuffs.")
            }
        }
        if spec.skirtStyle == .halfCircle {
            steps.append("Let the dress hang for 24 hours before hemming — bias areas drop. Then trim even and hem narrow.")
        } else {
            steps.append("Try it on, then hem with a 2 cm double fold.")
        }

        let sleeveWord = spec.sleeveStyle == .none ? "" : "\(spec.sleeveStyle.title)-sleeve "
        return DraftedPattern(
            garment: "\(spec.skirtStyle.title) \(sleeveWord)dress",
            pieces: [bodice.front, bodice.back] + skirtPieces + sleeves,
            fabricAdviceKey: "dress",
            fabricMeters140: meters.rounded(toPlaces: 1),
            guideSteps: steps
        )
    }
}

/// Top = bodice lengthened past the waist to the chosen hem, gentle A-shape at hip.
struct TopBlock {
    static func draft(spec: GarmentSpec, measurements m: BodyMeasurementsSnapshot) -> DraftedPattern {
        let bodice = BodiceBlock.draft(measurements: m, neckline: spec.neckline)
        let extra = spec.topLength.belowWaist
        let hipHalfQuarter = (m.hipMM / 4) * 1.04

        let front = extend(bodice.front, from: bodice.frontLength, by: extra, toWidth: hipHalfQuarter)
        let back = extend(bodice.back, from: bodice.backLength, by: extra, toWidth: hipHalfQuarter)
        let sleeves = SleeveBlock.draft(
            measurements: m,
            style: spec.sleeveStyle,
            length: spec.sleeveLength,
            armholeLength: bodice.armholeLength,
            armholeDepth: bodice.armholeDepth
        )

        var meters = (bodice.frontLength + extra) * 2 * 1.15 / 1000
        if !sleeves.isEmpty { meters += spec.sleeveLength == .long ? 0.7 : 0.4 }

        var steps = [
            "Print and check the 3 cm calibration square before cutting.",
            "This block uses standard assumptions for shoulder slope and underbust — sew a quick muslin first and adjust before cutting your real fabric.",
            "Cut front on fold, back twice (or on fold if it slips over your head — check the neck opening against your head circumference)\(sleeves.isEmpty ? "" : ", sleeves twice").",
            "Sew darts, pressing toward the center.",
            "Sew shoulder seams, then side seams.",
            "Finish the neckline with bias binding.",
        ]
        if sleeves.isEmpty {
            steps.append("Finish the armholes with bias binding.")
        } else {
            steps.append("Sew each sleeve seam, ease the cap between the notches and set the sleeves in.")
            if spec.sleeveStyle == .balloon {
                steps.append("Gather the sleeve hem along the marked line and attach the interfaced cuffs.")
            }
        }
        steps.append("Hem with a 2 cm double fold.")

        let sleeveWord = spec.sleeveStyle == .none ? "" : " \(spec.sleeveStyle.title)-sleeve"
        return DraftedPattern(
            garment: "\(spec.topLength.rawValue)\(sleeveWord) top",
            pieces: [front, back] + sleeves,
            fabricAdviceKey: "top",
            fabricMeters140: meters.rounded(toPlaces: 1),
            guideSteps: steps
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

        var commands: [PathCommand] = []
        var index = 0
        while index < result.commands.count {
            let cmd = result.commands[index]
            if case .line(let p) = cmd, abs(p.y - (waistY - 8)) < 0.5 {
                let hemSide = CGPoint(x: hipWidth, y: waistY + extra - 10)
                let hemCenter = CGPoint(x: 0, y: waistY + extra)
                commands.append(.curve(to: hemSide,
                                       cp1: CGPoint(x: p.x, y: waistY + extra * 0.35),
                                       cp2: CGPoint(x: hipWidth, y: waistY + extra * 0.7)))
                commands.append(.curve(to: hemCenter,
                                       cp1: CGPoint(x: hipWidth * 0.6, y: waistY + extra),
                                       cp2: CGPoint(x: hipWidth * 0.25, y: waistY + extra)))
                index += 2
                if index < result.commands.count, case .curve(let to, _, _) = result.commands[index], to.y < waistY {
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
