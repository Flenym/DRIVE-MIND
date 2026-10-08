# DRIVE MIND — План проекта

> Персональный тренажёр ПДД категории B для iOS. Цель: выучить билеты за 7–14 дней офлайн.
> **Автор и владелец: Flenym.**

> **Два трека в репо** (решение 2026-10-08 — «делай как лучше»):
> - `src/` — кроссплатформенный Expo + TypeScript (Android/Web, быстрая отладка на Windows, EAS Build).
> - `ios-native/` — нативный iOS на SwiftUI + SwiftData/SQLite (основной дистрибутив для iPhone, см. §1.1).

## 1. Выбранная архитектура

**Стек:** React Native + TypeScript + Expo (SDK 52, managed, dev-build) + `expo-sqlite` + `expo-file-system` + React Navigation 6 (native-stack + bottom-tabs) + Jest.

**Почему не bare RN:** Expo даёт EAS Build + OTA без macOS на ранней стадии, `expo-sqlite` покрывает все требования к миграциям/транзакциям, `expo-file-system` — для картинок. Для подписи IPA всё равно нужен macOS/Apple Developer — см. §10.

**Модули:**

```
src/
  app/              entry, providers, navigation
  components/       UI-kit (кнопки, карточки, прогресс)
  screens/          9 экранов (Home, Tickets, Question, Marathon, Mistakes, SmartTraining, Exam, Theory, Statistics, Settings + Onboarding)
  database/         db.ts, migrations/, schema.ts, repositories/
  content/          types.ts, validation.ts, import.ts, manifest.ts
  learning/         repetition/fsrs.ts, scheduling.ts, mastery.ts
  services/         network, storage, updateChecker
  types/
  utils/
assets/images/questions/
scripts/import-content/
tests/unit + integration
.github/workflows/
```

Честный принцип: офлайн-first, весь прогресс — локально, никакого бэкенда/авторизации/аналитики.

---

## 2. Список экранов и навигация

Старт — проверка наличия БД: если пусто → Onboarding с кнопкой «Загрузить базу».
Bottom Tabs (тёмная тема): `Главная | Билеты | Статистика | Настройки`. Стек-пуши: Question, Marathon, Exam, Mistakes, SmartTraining, Theory.

| Экран | Что делает |
|---|---|
| **Home** | Прогресс (кольцо), карточки освоено/на повтор/новых, CTA: Продолжить, Умная тренировка, Билеты, Марафон, Экзамен, Теория, Обновить базу. Число в «Марафоне» — динамическое `totalQuestions`, не 800. |
| **Tickets** | Список 40 билетов (фактическое число из БД), бейджи ошибок/процента/даты, вход в билет по порядку, восстановление сессии. |
| **Question** | Номер билета/вопроса, картинка (pinch-zoom, aspect-contain), текст, 2–5 вариантов, одиночный/множественный выбор, фиксация, подсветка, объяснение, переход далее. Дедуп нажатий. |
| **Marathon** | Весь пул категории B, пауза/продолжить, resume после kill, финал-статистика + «Повторить ошибки». |
| **SmartTraining** | Выбор длительности 5/10/15/20/∞ → подбор через `scheduler.pickQuestions()`, смешение new/due/overdue/mistake. |
| **Exam** | Конфиг из `content/examConfig.json` (20 вопр., лимит ошибок/допа): актуальный регламент 2024–2025 — 20 вопросов за 20 мин, ≤2 ошибки, при ошибке + блок 5 вопросов за 5 мин без ошибок. Параметры — в файле, не в коде. |
| **Mistakes** | Фильтр по билету/теме, сортировка по частоте/дате, bulk-повтор. |
| **Theory** | Темы ПДД (знаки/разметка/светофор/перекрёстки/скорости/остановка...), пункт ПДД + источник + `verifiedAt`, связанные вопросы. |
| **Statistics** | Всего/просмотрено/освоено/на повтор/новые/точность/по темам/график 14д. Чётко различает просмотрено vs освоено. |
| **Settings/Onboarding** | Версия базы, «Обновить базу», план 7/10/14дней. |

**Дизайн-токены:** bg `#000`, surface `#1A1A1C`, text `#FFF`, success `#22C55E`, error `#EF4444`, warning `#F59E0B`, muted `#9AA0A6`, radius 16, hit-slop ≥44pt.

---

## 3. Схема БД (SQLite, `expo-sqlite`)

Миграции версионируются, накатываются транзакционно.

```sql
-- meta
CREATE TABLE meta(key TEXT PRIMARY KEY, value TEXT); -- db_version, content_version

-- контент (импорт транзакционно, FK OFF до валидации)
CREATE TABLE questions(
  id TEXT PRIMARY KEY, ticketId TEXT NOT NULL, questionNumber INTEGER NOT NULL,
  category TEXT NOT NULL, text TEXT NOT NULL, imagePath TEXT, explanation TEXT,
  sourceName TEXT, sourceUrl TEXT, version INTEGER NOT NULL, topicIds TEXT NOT NULL -- JSON array
);
CREATE TABLE answers(id TEXT PRIMARY KEY, questionId TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE, text TEXT NOT NULL, sortOrder INTEGER NOT NULL);
CREATE TABLE correct_answers(questionId TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE, answerId TEXT NOT NULL REFERENCES answers(id), PRIMARY KEY(questionId, answerId));
CREATE TABLE topics(id TEXT PRIMARY KEY, title TEXT NOT NULL, parentId TEXT);
CREATE TABLE theory_sections(id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL, clause TEXT, source TEXT, verifiedAt TEXT);

-- прогресс
CREATE TABLE question_stats(
  questionId TEXT PRIMARY KEY REFERENCES questions(id),
  attempts INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  incorrect INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  lastAnswerCorrect INTEGER,
  lastAnsweredAt TEXT,
  masteryLevel TEXT NOT NULL DEFAULT 'new', -- new|learning|review|mastered
  dueAt TEXT, stability REAL, difficulty REAL, -- FSRS params
  intervalDays REAL DEFAULT 0
);
CREATE TABLE attempts(
  id TEXT PRIMARY KEY, questionId TEXT NOT NULL, ticketId TEXT,
  selectedAnswerIds TEXT NOT NULL, -- JSON
  isCorrect INTEGER NOT NULL, mode TEXT NOT NULL, createdAt TEXT NOT NULL
);
CREATE TABLE sessions(
  id TEXT PRIMARY KEY, mode TEXT NOT NULL, ticketId TEXT,
  questionIds TEXT NOT NULL, -- JSON ordered
  currentIndex INTEGER NOT NULL, answers TEXT NOT NULL, -- JSON map
  startedAt TEXT NOT NULL, updatedAt TEXT NOT NULL, completedAt TEXT
);
CREATE TABLE settings(key TEXT PRIMARY KEY, value TEXT);
```

Индексы: `questions(ticketId, questionNumber)`, `attempts(questionId, createdAt)`, `question_stats(dueAt, masteryLevel)`.

Миграции: `001_initial.sql`, `002_fsrs_columns.sql` ... + `PRAGMA user_version`.

---

## 4. План получения вопросов

### 4.1 Проверка источников (2025-10-08, Win, офлайн-проверка доменов)

- `gibdd.ru` → редирект на `xn--90adear.xn--p1ai` (официальный сайт Госавтоинспекции). Прямого публичного API билетов не публикуется, раздел «Экзамен» ведёт на сторонние площадки. Подтверждённого открытого API нет.
- `pdd.ru`, `drom.ru/pdd`, `pdd-russia.com` — коммерческие агрегаторы, ToS запрещает скрейпинг, CAPTCHA/защита. Массовая загрузка — нарушение.
- Проверенных структурированных дампов в официальном доступе не найдено.

**Вывод для v1:** легальный бесплатный импорт невозможен без ручной верификации лицензии. Стратегия — **универсальный оффлайн-импорт** + `scripts/import-content`.

### 4.2 Загрузчик `scripts/import-content`

- Вход: папка `incoming/` с `manifest.json` + `questions.jsonl` + `images/*`.
- Валидация (§4.3), проверка SHA256 из манифеста, транзакционная запись, сохранение `images/` через `expo-file-system`.
- Источник/дата/версия фиксируются в `meta` и в каждом `questions.source`.
- Поддерживает дифференциальный импорт по `id` (upsert по стабильному id).

### 4.3 Проверка полноты (валидатор)

- Кол-во билетов/вопросов, уникальность `id`, наличие ≥2 ответов, наличие `correctAnswerIds ⊆ answers`, отсутствие пустых `text`, битые `imagePath`, контрольные суммы, дубликаты формулировок (fuzzy).
- Отчёт `reports/content-report.json` + `reports/missing.json`.
- База не помечается `ready`, пока `errors.length===0`.

### 4.4 Размер

~300–400 Мб изображений (если хранить оригинал); предусмотрена поставка как asset-pack: `assets/questions/` в бандле + докачка отсутствующего.

### 4.5 Что поставляется в репо v1

В репо **нет** 800 «настоящих» билетов — во избежание фейков и нарушения авторских прав. В `assets/content/demo/` лежит **демо-набор 12 вопросов**, явно помеченный `source.name="DEMO — не экзаменационные"` для проверки UI/алгоритма. Реальный набор импортируется владельцем локально (инструкция ниже).

---

## 5. Формат базы вопросов (версионируемый)

`manifest.json`:
```json
{
  "version": 1,
  "releasedAt": "2025-10-08",
  "categories": ["B"],
  "files": [{"path":"questions.jsonl","sha256":"...","count":800}],
  "minAppVersion": "1.0.0",
  "source": {"name":"...","url":"https://..."}
}
```

Вопрос — см. ТЗ §5. Доп. поля: `topicIds: string[]`, `extraImages?: string[]`. Идентификатор — стабильный `id`, не порядковый номер. Версионирование — `manifest.version` + `questions.version`. Обновление сохраняет `question_stats` по `id`.

Валидация — `zod` схемы в `content/validation.ts`.

---

## 6. План работы с изображениями

- Только локальные файлы, никаких внешних URL в рантайме.
- Ссылка в `imagePath` → `FileSystem.documentDirectory + imagePath`.
- При импорте — проверка существования, SHA256, resize не делаем (исходное разрешение).
- На `QuestionScreen` — `react-native-image-viewing` / модалка + pinch.
- Обнаружение осиротевших файлов — `verify-images` скрипт.

---

## 7. Интервальное повторение

**Реализация:** `learning/repetition/fsrs.ts` — адаптированный FSRS-4.5 (параметры `w` по умолчанию, difficulty/stability/retrievability). Если лицензия `ts-fsrs` позволяет — тонкая обёртка; иначе — собственная типизированная реализация с тестами, **честно документированная**.

Хранится на вопрос: `attempts, correct, incorrect, streak, lastAnswerCorrect, lastAnsweredAt, masteryLevel, dueAt, intervalDays, stability, difficulty`.

Правила:
- `masteryLevel` — не после 1 ответа; пороги: `new→learning` при 1 correct, `learning→review` при 3 подряд, `review→mastered` при interval≥21д и streak≥5; любой `incorrect` роняет на `learning` с `dueAt = now + 10m`.
- `dueAt` по FSRS: `correct → I = S * f(D)`, `incorrect → re-learn 10m`.
- Смешивание — `scheduling.ts`: `pickQuestions({new, due, overdue, mistake, limit, timeBudget})` — приоритеты из ТЗ + адаптивный вес по долям пула (не фикс 25/25/...).
- Дедуп/анти-зацикливание: per-сессию `recentIds` окно 10, лимит повтора одного вопроса ≤2 за сессию.

---

## 8. Экзамен, теория, статистика

- `content/examConfig.json` — источник истины (см. §2). Экран соблюдает «не показывать ответ до конца блока».
- Теория — `theory_sections` + `topicIds` → «связанные вопросы».
- Статистика — агрегаты по `question_stats` + `attempts`, готовность — взвешенная формула без обещаний сдачи.

---

## 9. План обновления базы

Кнопка «Обновить базу» → `services/updateChecker.ts`:
1) check net, 2) GET `manifest.json` (URL из настроек), 3) сравнение `version`, 4) скачивание `questions.jsonl` + картинки, 5) SHA256, 6) транзакция `BEGIN; upsert; COMMIT` с бэкапом `questions_backup`, 7) на ошибке — ROLLBACK и сохранение старой версии, 8) toast результата. Без сети — сообщение «Работаем офлайн».

Маппинг по стабильному `id`: новые → `new`, удалённые → `archived` (скрыты но stats сохранены), изменённые (`text`/`answers` hash diff) → `needsReview` + сброс `masteryLevel→learning`.

---

## 10. GitHub Actions и подпись

**CI** (`.github/workflows/ci.yml`): on push/PR — `tsc --noEmit`, `eslint`, `jest`.
**Build** (`.github/workflows/build.yml`): `workflow_dispatch` + `push tags v*` — `eas build --platform ios --non-interactive` (требует `EXPO_TOKEN` secret). Альтернатива без EAS — `xcodebuild` на `macos-14`.

**Что нужно для IPA на iPhone:**
- macOS раннер (GitHub `macos-*` или локальный Mac с Xcode 15+/16).
- Apple Developer Program ($99/год), Bundle ID, App ID.
- Certificates (`Apple Distribution`/`Development`) + Provisioning Profile, хранятся в `EAS credentials` или `GitHub Secrets` (`APPLE_CERT_P12`, `APPLE_CERT_PASSWORD`, `APPLE_PROVISIONING_PROFILE`).
- Без них — собирается **неподписанный** `.app`/`.tar.gz` или Expo Development Build (установка через Xcode/Side-load). В workflow это честно отражено: job `build-unsigned` всегда доступен, `build-signed` — только при наличии секретов.

Никаких фиктивных IPA, секреты не логируются, защита Apple не обходится.

---

## 11. Риски и ограничения (честно)

- Нет официального публичного дампа билетов → v1 без преднастроенной полной базы; нужна ручная подготовка `incoming/` по лицензии.
- Демо-набор ≠ экзамен; до импорта реальных данных «готовность» не релевантна.
- Изображения — самая тяжёлая часть (авторские права / размер); нужны права на распространение.
- E-sign/IPA без Apple Developer невозможна на Windows; распространение — TestFlight/Side-load/AltStore.
- LLM-преподаватель — архитектура под ключ (`/ai` абстракция), ключ не вшивается.

---

## 12. Этапы реализации и критерии готовности

Порядок из ТЗ §25. Критерии — §27: установка на iPhone, офлайн вопросы+картинки, проверка ответов, сохранение, FSRS, ошибки, билеты/марафон/экзамен, обновление без потери прогресса, тесты + CI зеленые.

**Текущий статус (08.10.2025):** Этап 1 — план готов, каркас проекта — в работе.
