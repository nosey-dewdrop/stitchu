import SwiftUI

enum Palette {
    static let bg = Color(hex: 0xF5FAFF)
    static let card = Color.white
    static let ink = Color(hex: 0x2C3E50)
    static let inkSecondary = Color(hex: 0x7B8FA3)
    static let blue = Color(hex: 0x6FB3DE)
    static let blueLight = Color(hex: 0xDCEEFA)
    static let blueDark = Color(hex: 0x4A88B5)
    static let line = Color(hex: 0xC9DDEC)
    static let pink = Color(hex: 0xE8B4B8)
    static let pinkLight = Color(hex: 0xFFF0F1)
    static let sage = Color(hex: 0xB5C4A8)
    static let sageLight = Color(hex: 0xEDF3E8)
    static let lavender = Color(hex: 0xC4B5D4)
    static let lavenderLight = Color(hex: 0xF0EAF5)
}

extension Color {
    init(hex: UInt32) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255
        )
    }
}

enum Quicksand {
    static func regular(_ size: CGFloat) -> Font { .custom("Quicksand-Regular", size: size) }
    static func medium(_ size: CGFloat) -> Font { .custom("Quicksand-Medium", size: size) }
    static func semiBold(_ size: CGFloat) -> Font { .custom("Quicksand-SemiBold", size: size) }
    static func bold(_ size: CGFloat) -> Font { .custom("Quicksand-Bold", size: size) }
}

/// Dashed "stitched" border used across cards to keep the sewing feel.
struct StitchedBorder: ViewModifier {
    var color: Color = Palette.line
    var cornerRadius: CGFloat = 20

    func body(content: Content) -> some View {
        content.overlay(
            RoundedRectangle(cornerRadius: cornerRadius)
                .strokeBorder(color, style: StrokeStyle(lineWidth: 2, dash: [6, 4]))
        )
    }
}

extension View {
    func stitchedBorder(color: Color = Palette.line, cornerRadius: CGFloat = 20) -> some View {
        modifier(StitchedBorder(color: color, cornerRadius: cornerRadius))
    }
}

/// Placeholder box for assets Damla will hand-draw. Mirrors the mock's dashed placeholder system.
struct DoodlePlaceholder: View {
    let label: String
    var height: CGFloat = 80

    var body: some View {
        RoundedRectangle(cornerRadius: 14)
            .fill(Palette.blueLight.opacity(0.5))
            .frame(height: height)
            .overlay(
                Text(label)
                    .font(Quicksand.medium(13))
                    .foregroundStyle(Palette.inkSecondary)
                    .multilineTextAlignment(.center)
                    .padding(8)
            )
            .stitchedBorder(cornerRadius: 14)
    }
}
