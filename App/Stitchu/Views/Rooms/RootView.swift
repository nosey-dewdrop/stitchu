import SwiftUI

enum Room: String, CaseIterable, Identifiable {
    case inspire, create, closet, community

    var id: String { rawValue }
    var title: String { rawValue }
}

struct RootView: View {
    @State private var room: Room = .create
    @State private var showProfile = false

    var body: some View {
        NavigationStack {
            ZStack {
                Palette.bg.ignoresSafeArea()
                VStack(spacing: 0) {
                    header
                    pills
                    TabView(selection: $room) {
                        InspireRoomView().tag(Room.inspire)
                        CreateRoomView().tag(Room.create)
                        ClosetRoomView().tag(Room.closet)
                        CommunityRoomView().tag(Room.community)
                    }
                    .tabViewStyle(.page(indexDisplayMode: .never))
                    .animation(.easeInOut(duration: 0.25), value: room)
                }
            }
            .sheet(isPresented: $showProfile) {
                ProfileSheet()
                    .presentationDetents([.medium, .large])
                    .presentationDragIndicator(.visible)
            }
        }
    }

    private var header: some View {
        HStack {
            Text("Stitchu")
                .font(Quicksand.bold(30))
                .foregroundStyle(Palette.ink)
            Spacer()
            Button {
                showProfile = true
            } label: {
                Circle()
                    .fill(Palette.blueLight)
                    .frame(width: 40, height: 40)
                    .overlay(Circle().strokeBorder(Palette.blue, style: StrokeStyle(lineWidth: 2, dash: [5, 3])))
                    .overlay(
                        Text("d")
                            .font(Quicksand.bold(20))
                            .foregroundStyle(Palette.blueDark)
                    )
            }
            .accessibilityLabel("Profile")
        }
        .padding(.horizontal, 24)
        .padding(.top, 6)
        .padding(.bottom, 10)
    }

    private var pills: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(Room.allCases) { r in
                    Button {
                        room = r
                    } label: {
                        Text(r.title)
                            .font(Quicksand.semiBold(16))
                            .foregroundStyle(room == r ? .white : Palette.inkSecondary)
                            .padding(.vertical, 9)
                            .padding(.horizontal, 20)
                            .background(room == r ? Palette.blue : Palette.card, in: Capsule())
                            .overlay(Capsule().strokeBorder(room == r ? .clear : Palette.line, lineWidth: 1.5))
                    }
                }
            }
            .padding(.horizontal, 24)
        }
        .padding(.bottom, 12)
    }
}
