// Author: Flenym
import SwiftUI

struct RootView: View {
    @EnvironmentObject var store: AppStore
    var body: some View {
        if !store.isReady { ProgressView().tint(.green) }
        else {
            TabView {
                HomeView().tabItem { Label("Главная", systemImage: "house.fill") }
                TicketsView().tabItem { Label("Билеты", systemImage: "rectangle.stack") }
                StatsView().tabItem { Label("Статистика", systemImage: "chart.bar") }
                SettingsView().tabItem { Label("Настройки", systemImage: "gearshape") }
            }.tint(Color.green)
        }
    }
}

struct HomeView: View {
    @EnvironmentObject var store: AppStore
    var mastered: Int { store.stats.values.filter{ $0.masteryLevel=="mastered" }.count }
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 12) {
                    Text("DRIVE MIND").font(.system(size: 28, weight: .black)).foregroundStyle(.white)
                    Text("Персональный тренажёр ПДД — категория B").foregroundStyle(.secondary)
                    ZStack { Circle().stroke(Color.green, lineWidth: 4).frame(width: 120, height: 120)
                        VStack { Text("\(store.questions.isEmpty ? 0 : Int(Double(mastered)/Double(max(1,store.questions.count))*100))%").font(.title).bold().foregroundStyle(.white)
                            Text("\(mastered)/\(store.questions.count) освоено").font(.caption).foregroundStyle(.secondary) } }
                    StatCard(total: store.questions.count, mastered: mastered, stats: store.stats)
                    NavigationLink("Продолжить") { QuestionRunnerView(mode: .marathon) }.buttonStyle(.borderedProminent).tint(.green)
                    NavigationLink("Умная тренировка") { SmartTrainingView() }
                    NavigationLink("Билеты") { TicketsView() }
                    NavigationLink("Марафон \(store.questions.count)") { QuestionRunnerView(mode: .marathon) }
                    NavigationLink("Экзамен") { QuestionRunnerView(mode: .exam) }
                    NavigationLink("Ошибки") { MistakesView() }
                    NavigationLink("Теория") { TheoryView() }
                }.padding()
            }.background(Color.black).navigationTitle("DRIVE MIND").navigationBarTitleDisplayMode(.inline)
        }
    }
}

struct StatCard: View {
    let total: Int; let mastered: Int; let stats: [String:QuestionStats]
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Прогресс").bold().foregroundStyle(.white)
            Text("Всего: \(total)").foregroundStyle(.white)
            Text("● Освоено: \(mastered)").foregroundStyle(.green)
            Text("● Новые: \(max(0, total - stats.count))").foregroundStyle(.gray)
        }.frame(maxWidth: .infinity, alignment: .leading).padding().background(Color(white: 0.09)).clipShape(RoundedRectangle(cornerRadius: 16))
    }
}
