PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS medications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  aliases TEXT,
  activeIngredient TEXT NOT NULL,
  requiresPrescription INTEGER NOT NULL,
  stock INTEGER NOT NULL,
  dosage TEXT,
  usageInstructions TEXT
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  medicationId TEXT NOT NULL,
  prescribedDate TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  refillsRemaining INTEGER NOT NULL,
  doctorName TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (medicationId) REFERENCES medications(id) ON DELETE CASCADE
);
