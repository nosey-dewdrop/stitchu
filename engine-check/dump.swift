import Foundation
import CoreGraphics

// Golden dump for the C++ port: prints every drafted coordinate for a body
// subset x all specs as CSV lines. The C++ side prints the identical format;
// engine/golden-diff.py compares within 0.1 mm.
// Build: engine-check/run-dump.sh > /tmp/golden-swift.csv

func dumpBody(_ name: String, _ bust: Double, _ waist: Double, _ hip: Double, _ shoulder: Double, _ backLength: Double, _ arm: Double, _ neck: Double) -> (String, BodyMeasurementsSnapshot) {
    (name, BodyMeasurementsSnapshot(bustCM: bust, waistCM: waist, hipCM: hip, shoulderCM: shoulder, backLengthCM: backLength, armLengthCM: arm, neckCM: neck))
}

let goldenBodies = [
    dumpBody("EU38", 88, 70, 94, 37, 40.5, 58, 35),
    dumpBody("pear", 96, 70, 116, 37, 41, 58, 36),
    dumpBody("bigNeckSmallShoulder", 100, 84, 104, 30, 40, 58, 50),
]

var goldenSpecs: [(String, GarmentSpec)] = []
for style in SkirtStyle.allCases {
    for length in SkirtLength.allCases {
        var spec = GarmentSpec()
        spec.garment = .skirt
        spec.skirtStyle = style
        spec.skirtLength = length
        goldenSpecs.append(("skirt/\(style.rawValue)/\(length.rawValue)", spec))
    }
}
let goldenSleeves: [(SleeveStyle, SleeveLength)] = [(.none, .short), (.straight, .short), (.straight, .long), (.balloon, .short), (.balloon, .elbow)]
for neckline in Neckline.allCases {
    for style in SkirtStyle.allCases {
        for (sleeve, sleeveLength) in goldenSleeves {
            var spec = GarmentSpec()
            spec.garment = .dress
            spec.neckline = neckline
            spec.skirtStyle = style
            spec.skirtLength = .midi
            spec.sleeveStyle = sleeve
            spec.sleeveLength = sleeveLength
            goldenSpecs.append(("dress/\(neckline.rawValue)/\(style.rawValue)/\(sleeve.rawValue).\(sleeveLength.rawValue)", spec))
        }
    }
    for topLength in TopLength.allCases {
        for (sleeve, sleeveLength) in goldenSleeves {
            var spec = GarmentSpec()
            spec.garment = .top
            spec.neckline = neckline
            spec.topLength = topLength
            spec.sleeveStyle = sleeve
            spec.sleeveLength = sleeveLength
            goldenSpecs.append(("top/\(neckline.rawValue)/\(topLength.rawValue)/\(sleeve.rawValue).\(sleeveLength.rawValue)", spec))
        }
    }
}

func csv(_ p: CGPoint) -> String { String(format: "%.4f,%.4f", p.x, p.y) }

func dumpCommands(_ kind: String, _ commands: [PathCommand], _ prefix: String) {
    for (i, cmd) in commands.enumerated() {
        switch cmd {
        case .move(let p): print("\(prefix),\(kind),\(i),move,\(csv(p))")
        case .line(let p): print("\(prefix),\(kind),\(i),line,\(csv(p))")
        case .curve(let to, let cp1, let cp2): print("\(prefix),\(kind),\(i),curve,\(csv(to)),\(csv(cp1)),\(csv(cp2))")
        case .close: print("\(prefix),\(kind),\(i),close")
        }
    }
}

for (bodyName, m) in goldenBodies {
    for (label, spec) in goldenSpecs {
        let draft = GarmentDrafter.draft(spec: spec, measurements: m)
        print("\(bodyName)|\(label)|fabric,\(String(format: "%.4f", draft.fabricMeters140))")
        for (p, piece) in draft.pieces.enumerated() {
            let prefix = "\(bodyName)|\(label)|piece\(p):\(piece.name)"
            dumpCommands("outline", piece.commands, prefix)
            dumpCommands("marking", piece.markings, prefix)
        }
    }
}
