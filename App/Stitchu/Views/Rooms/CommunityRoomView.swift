import SwiftUI

/// Community ships in a later phase (needs backend). Honest, warm placeholder
/// so the room exists in the world without pretending to work.
struct CommunityRoomView: View {
    var body: some View {
        VStack(spacing: 16) {
            Spacer()
            DoodlePlaceholder(label: "community illustration\n(sewing circle doodle)", height: 160)
                .padding(.horizontal, 48)
            Text("the sewing circle")
                .font(Quicksand.bold(22))
                .foregroundStyle(Palette.ink)
            Text("share your makes, follow other sewists,\nfind your people — coming soon")
                .font(Quicksand.regular(15))
                .foregroundStyle(Palette.inkSecondary)
                .multilineTextAlignment(.center)
            Spacer()
            Spacer()
        }
    }
}
