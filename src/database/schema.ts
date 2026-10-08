export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY, value TEXT);

CREATE TABLE IF NOT EXISTS questions(
  id TEXT PRIMARY KEY,
  ticketId TEXT NOT NULL,
  questionNumber INTEGER NOT NULL,
  category TEXT NOT NULL,
  text TEXT NOT NULL,
  imagePath TEXT,
  extraImages TEXT,
  explanation TEXT,
  sourceName TEXT,
  sourceUrl TEXT,
  version INTEGER NOT NULL,
  topicIds TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS answers(
  id TEXT PRIMARY KEY,
  questionId TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sortOrder INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS correct_answers(
  questionId TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answerId TEXT NOT NULL REFERENCES answers(id),
  PRIMARY KEY(questionId, answerId)
);

CREATE TABLE IF NOT EXISTS topics(
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  parentId TEXT
);

CREATE TABLE IF NOT EXISTS theory_sections(
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  clause TEXT,
  source TEXT,
  verifiedAt TEXT
);

CREATE TABLE IF NOT EXISTS question_stats(
  questionId TEXT PRIMARY KEY REFERENCES questions(id) ON DELETE CASCADE,
  attempts INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  incorrect INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  lastAnswerCorrect INTEGER,
  lastAnsweredAt TEXT,
  masteryLevel TEXT NOT NULL DEFAULT 'new',
  dueAt TEXT,
  stability REAL,
  difficulty REAL,
  intervalDays REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS attempts(
  id TEXT PRIMARY KEY,
  questionId TEXT NOT NULL,
  ticketId TEXT,
  selectedAnswerIds TEXT NOT NULL,
  isCorrect INTEGER NOT NULL,
  mode TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions(
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL,
  ticketId TEXT,
  questionIds TEXT NOT NULL,
  currentIndex INTEGER NOT NULL,
  answers TEXT NOT NULL,
  startedAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  completedAt TEXT
);

CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT);

CREATE INDEX IF NOT EXISTS idx_questions_ticket ON questions(ticketId, questionNumber);
CREATE INDEX IF NOT EXISTS idx_attempts_q ON attempts(questionId, createdAt);
CREATE INDEX IF NOT EXISTS idx_stats_due ON question_stats(dueAt, masteryLevel);
`;

export const MIGRATIONS: { version: number; sql: string }[] = [
  { version: 1, sql: SCHEMA_SQL },
];
