CREATE TABLE IF NOT EXISTS subject_periods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id INTEGER NOT NULL,
  period_id INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  deletedAt DATETIME DEFAULT NULL,
  FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY(period_id) REFERENCES periods(id) ON DELETE CASCADE,
  UNIQUE(subject_id, period_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subject_periods_subject_period_active
  ON subject_periods(subject_id, period_id)
  WHERE deletedAt IS NULL;
