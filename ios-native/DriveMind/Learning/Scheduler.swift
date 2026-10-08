// Author: Flenym
import Foundation

func pickQuestions(questions: [Question], stats: [String: QuestionStats], limit: Int, recentIds: Set<String> = [], now: Date = Date()) -> [Question] {
    struct Scored { let q: Question; let priority: Double; let bucket: String; let due: Date? }
    let scored: [Scored] = questions.map { q in
        guard let s = stats[q.id] else { return Scored(q: q, priority: 30 + Double.random(in: 0...5), bucket: "new", due: nil) }
        if s.lastAnswerCorrect == false { return Scored(q: q, priority: 100 + Double(s.incorrect)*10, bucket: "mistake", due: s.dueAt) }
        if let d = s.dueAt, d <= now { let overdue = now.timeIntervalSince(d)/86400; return Scored(q: q, priority: 80 + overdue*2 + (s.difficulty ?? 5), bucket: "due", due: d) }
        if s.masteryLevel == "learning" { return Scored(q: q, priority: 60 + Double(s.incorrect)*3, bucket: "learning", due: s.dueAt) }
        if s.masteryLevel == "review" { return Scored(q: q, priority: 20 + Double.random(in: 0...10), bucket: "review", due: s.dueAt) }
        return Scored(q: q, priority: 5 + Double.random(in: 0...5), bucket: "mastered", due: s.dueAt)
    }.map { recentIds.contains($0.q.id) ? Scored(q: $0.q, priority: $0.priority - 50, bucket: $0.bucket, due: $0.due) : $0 }
     .sorted { $0.priority > $1.priority }

    var buckets: [String: [Scored]] = ["mistake":[], "due":[], "learning":[], "new":[], "review":[], "mastered":[]]
    for s in scored { buckets[s.bucket, default: []].append(s) }
    let order = ["mistake","due","learning","new","review","mastered"]
    var result: [Question] = []
    var seen = Set<String>()
    while result.count < limit {
        var added = false
        for b in order {
            if var arr = buckets[b], !arr.isEmpty {
                // pop first unseen
                while let first = arr.first, seen.contains(first.q.id) { arr.removeFirst() }
                if let first = arr.first {
                    result.append(first.q); seen.insert(first.q.id); arr.removeFirst(); buckets[b]=arr; added=true
                    if result.count >= limit { break }
                } else { buckets[b]=arr }
            }
        }
        if !added { break }
    }
    if result.count < limit {
        for s in scored where !seen.contains(s.q.id) { result.append(s.q); seen.insert(s.q.id); if result.count >= limit { break } }
    }
    return Array(result.prefix(limit))
}
