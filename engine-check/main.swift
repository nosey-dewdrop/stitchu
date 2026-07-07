import Foundation
import CoreGraphics

// Engine validation harness: drafts every garment spec the app can produce
// across a realistic EU 34-52 size matrix plus edge-case bodies, and runs
// PatternValidator on each result. Pure numeric — no simulator, no screenshots.
// Run with engine-check/run.sh.

struct Body {
    var name: String
    var m: BodyMeasurementsSnapshot
}

func body(_ name: String, _ bust: Double, _ waist: Double, _ hip: Double, _ shoulder: Double, _ backLength: Double, _ arm: Double, _ neck: Double) -> Body {
    Body(name: name, m: BodyMeasurementsSnapshot(bustCM: bust, waistCM: waist, hipCM: hip, shoulderCM: shoulder, backLengthCM: backLength, armLengthCM: arm, neckCM: neck))
}

// EU size chart (German convention) + edge cases.
let bodies: [Body] = [
    body("EU34", 80, 62, 86, 36, 39.5, 57, 34),
    body("EU36", 84, 66, 90, 36.5, 40, 57.5, 34.5),
    body("EU38", 88, 70, 94, 37, 40.5, 58, 35),
    body("EU40", 92, 74, 98, 37.5, 41, 58.5, 36),
    body("EU42", 96, 78, 102, 38, 41.5, 59, 36.5),
    body("EU44", 100, 82, 106, 38.5, 42, 59.5, 37),
    body("EU46", 104, 86, 110, 39, 42, 60, 38),
    body("EU48", 110, 92, 116, 40, 42.5, 60.5, 39),
    body("EU50", 116, 98, 122, 41, 43, 61, 40),
    body("EU52", 122, 104, 128, 42, 43.5, 61.5, 41),
    body("tall", 92, 74, 98, 39, 47, 66, 36),
    body("petite", 84, 64, 90, 34, 33, 49, 33),
    body("pear", 96, 70, 116, 37, 41, 58, 36),
    body("apple", 118, 112, 104, 40, 42, 60, 40),
    body("bigNeckSmallShoulder", 100, 84, 104, 30, 40, 58, 50),
]

var specs: [(String, GarmentSpec)] = []
for style in SkirtStyle.allCases {
    for length in SkirtLength.allCases {
        var spec = GarmentSpec()
        spec.garment = .skirt
        spec.skirtStyle = style
        spec.skirtLength = length
        specs.append(("skirt/\(style.rawValue)/\(length.rawValue)", spec))
    }
}
let sleeveCombos: [(SleeveStyle, SleeveLength)] = [(.none, .short), (.straight, .short), (.straight, .long), (.balloon, .short), (.balloon, .elbow)]
for neckline in Neckline.allCases {
    for style in SkirtStyle.allCases {
        for (sleeve, sleeveLength) in sleeveCombos {
            var spec = GarmentSpec()
            spec.garment = .dress
            spec.neckline = neckline
            spec.skirtStyle = style
            spec.skirtLength = .midi
            spec.sleeveStyle = sleeve
            spec.sleeveLength = sleeveLength
            specs.append(("dress/\(neckline.rawValue)/\(style.rawValue)/\(sleeve.rawValue).\(sleeveLength.rawValue)", spec))
        }
    }
    for topLength in TopLength.allCases {
        for (sleeve, sleeveLength) in sleeveCombos {
            var spec = GarmentSpec()
            spec.garment = .top
            spec.neckline = neckline
            spec.topLength = topLength
            spec.sleeveStyle = sleeve
            spec.sleeveLength = sleeveLength
            specs.append(("top/\(neckline.rawValue)/\(topLength.rawValue)/\(sleeve.rawValue).\(sleeveLength.rawValue)", spec))
        }
    }
}

var drafts = 0
var failures = 0
var ruleCounts: [String: Int] = [:]
var examples: [String] = []

for body in bodies {
    for (label, spec) in specs {
        let draft = GarmentDrafter.draft(spec: spec, measurements: body.m)
        let issues = PatternValidator.issues(spec: spec, measurements: body.m, draft: draft)
        drafts += 1
        if !issues.isEmpty {
            failures += 1
            for issue in issues {
                ruleCounts[issue.rule, default: 0] += 1
                if examples.count < 40 {
                    examples.append("\(body.name) \(label): \(issue)")
                }
            }
        }
    }
}

print("engine check: \(drafts) drafts across \(bodies.count) bodies x \(specs.count) specs")
if failures == 0 {
    print("ALL PASS")
    exit(0)
} else {
    print("FAILED drafts: \(failures)")
    for (rule, count) in ruleCounts.sorted(by: { $0.value > $1.value }) {
        print("  rule \(rule): \(count) violations")
    }
    print("examples:")
    for example in examples { print("  \(example)") }
    exit(1)
}
