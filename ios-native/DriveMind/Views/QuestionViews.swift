// Author: Flenym
import SwiftUI

enum RunnerMode { case ticket(String), marathon, mistakes, smart(Int?), exam }

struct TicketsView: View {
    @EnvironmentObject var store: AppStore
    var tickets: [String] { Array(Set(store.questions.map{ $0.ticketId })).sorted() }
    var body: some View {
        List {
            ForEach(tickets, id: \.self) { t in
                NavigationLink("\(t) — \(store.questions.filter{ $0.ticketId==t }.count) вопр.") { QuestionRunnerView(mode: .ticket(t)) }
            }
        }.scrollContentBackground(.hidden).background(Color.black).navigationTitle("Билеты")
    }
}

struct QuestionRunnerView: View {
    @EnvironmentObject var store: AppStore
    let mode: RunnerMode
    @State private var queue: [Question] = []
    @State private var idx = 0
    @State private var done = false
    @State private var correct = 0
    var body: some View {
        Group {
            if queue.isEmpty { ProgressView().task { build() } }
            else if done { VStack { Text("Готово!").font(.title).bold().foregroundStyle(.white); Text("Правильно \(correct)/\(queue.count)").foregroundStyle(.secondary) }.frame(maxWidth: .infinity, maxHeight: .infinity).background(Color.black) }
            else if idx < queue.count { QuestionView(question: queue[idx], index: idx, total: queue.count) { selected in
                let q = queue[idx]
                let ok = isAnswerCorrect(correct: q.correctAnswerIds, selected: selected)
                if ok { correct += 1 }
                store.recordAnswer(questionId: q.id, selected: selected, isCorrect: ok)
                if idx + 1 >= queue.count { done = true } else { idx += 1 }
            }}
        }.background(Color.black).navigationTitle("Вопрос")
    }
    func build() {
        switch mode {
        case .ticket(let t): queue = store.questions.filter{ $0.ticketId==t }.sorted{ $0.questionNumber < $1.questionNumber }
        case .marathon: queue = store.questions
        case .mistakes: let bad = Set(store.stats.filter{ $0.value.lastAnswerCorrect==false || $0.value.incorrect>0 }.map{ $0.key }); queue = store.questions.filter{ bad.contains($0.id) }
        case .smart(let m): let limit = m==5 ? 10 : m==10 ? 20 : m==15 ? 30 : 40; queue = pickQuestions(questions: store.questions, stats: store.stats, limit: limit)
        case .exam: queue = Array(store.questions.prefix(20))
        }
    }
}

struct QuestionView: View {
    let question: Question; let index: Int; let total: Int
    var onAnswer: ([String])->Void
    @State private var selected: Set<String> = []
    @State private var revealed = false
    private var multi: Bool { question.correctAnswerIds.count > 1 }
    private var correct: Bool { Set(question.correctAnswerIds) == selected }
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                Text("\(question.ticketId) · вопрос \(question.questionNumber) · \(index+1)/\(total)").font(.caption).foregroundStyle(.secondary)
                ProgressView(value: Double(index+1)/Double(total)).tint(.green)
                if let img = question.imagePath, let url = URL(string: img) { AsyncImage(url: url) { $0.resizable().scaledToFit().clipShape(RoundedRectangle(cornerRadius: 12)) } placeholder: { Color(white:0.12).frame(height: 180).clipShape(RoundedRectangle(cornerRadius: 12)) } }
                Text(question.text).font(.title3).bold().foregroundStyle(.white)
                Text(multi ? "Можно несколько ответов" : "Выберите один").font(.caption).foregroundStyle(.secondary)
                ForEach(question.answers, id:\.id) { a in
                    let sel = selected.contains(a.id)
                    let isCorrect = revealed && question.correctAnswerIds.contains(a.id)
                    let isWrong = revealed && sel && !question.correctAnswerIds.contains(a.id)
                    Button { if !revealed { if multi { if sel { selected.remove(a.id)} else { selected.insert(a.id)} } else { selected=[a.id] } } } label: {
                        HStack { Text(a.text).foregroundStyle(.white).multilineTextAlignment(.leading); Spacer()
                            if revealed && isCorrect { Text("✓").foregroundStyle(.green) }
                            if revealed && isWrong { Text("✕").foregroundStyle(.red) }
                        }.padding().background(isCorrect ? Color.green.opacity(0.18) : isWrong ? Color.red.opacity(0.18) : sel ? Color(white:0.16) : Color(white:0.09)).clipShape(RoundedRectangle(cornerRadius: 12)).overlay(RoundedRectangle(cornerRadius: 12).stroke(isCorrect ? Color.green : isWrong ? Color.red : Color(white:0.14), lineWidth: 1))
                    }
                }
                if !revealed { Button("Ответить") { revealed = true }.buttonStyle(.borderedProminent).tint(.green).disabled(selected.isEmpty) }
                else {
                    Text(correct ? "Верно!" : "Неверно").bold().foregroundStyle(correct ? Color.green : Color.red)
                    if let exp = question.explanation { Text(exp).foregroundStyle(Color(white:0.82)).padding().background(Color(white:0.09)).clipShape(RoundedRectangle(cornerRadius: 12)) }
                    Button(index+1>=total ? "Завершить" : "Далее") { onAnswer(Array(selected)); selected=[]; revealed=false }.buttonStyle(.borderedProminent).tint(.green)
                }
            }.padding()
        }.background(Color.black)
    }
}

struct SmartTrainingView: View {
    var body: some View {
        List { ForEach([5,10,15,20], id:\.self) { m in NavigationLink("\(m) минут") { QuestionRunnerView(mode: .smart(m)) } }
            NavigationLink("Без ограничения") { QuestionRunnerView(mode: .smart(nil)) } }.navigationTitle("Умная тренировка")
    }
}
struct MistakesView: View {
    @EnvironmentObject var store: AppStore
    var bad: [Question] { let ids = Set(store.stats.filter{ $0.value.lastAnswerCorrect==false || $0.value.incorrect>0}.map{ $0.key}); return store.questions.filter{ ids.contains($0.id)} }
    var body: some View {
        List { ForEach(bad) { q in VStack(alignment:.leading){ Text(q.text.prefix(90)).foregroundStyle(.white); Text("\(q.ticketId) #\(q.questionNumber)").font(.caption).foregroundStyle(.secondary)} }
        }.navigationTitle("Ошибки — \(bad.count)")
        .toolbar { if !bad.isEmpty { NavigationLink("Повторить") { QuestionRunnerView(mode: .mistakes)} } }
    }
}
struct StatsView: View {
    @EnvironmentObject var store: AppStore
    var body: some View {
        List {
            Section("Прогресс") { Text("Всего: \(store.questions.count)"); Text("Освоено: \(store.stats.values.filter{$0.masteryLevel=="mastered"}.count)").foregroundStyle(.green) }
        }.navigationTitle("Статистика")
    }
}
struct TheoryView: View {
    var body: some View {
        List {
            ForEach(["Дорожные знаки","Разметка","Светофор","Перекрёстки","Скорость"], id:\.self) { t in Text(t) }
        }.navigationTitle("Теория")
    }
}
struct SettingsView: View {
    var body: some View {
        List {
            Section("О приложении") { Text("DRIVE MIND v1.0.0"); Text("Автор и владелец: Flenym").foregroundStyle(.secondary) }
            Section("База") { Text("Демо-набор 12 вопросов. Импорт — через manifest.json") }
        }.navigationTitle("Настройки")
    }
}
