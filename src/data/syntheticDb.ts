import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { seedDatabase } from "./seed.js";

export type MedicationRecord = {
  id: string;
  name: string;
  activeIngredient: string;
  requiresPrescription: boolean;
  stock: number;
  dosage?: string;
  usageInstructions?: string;
};

export type UserRecord = {
  id: string;
  name: string;
  language: "en" | "he";
  email?: string;
};

export type PrescriptionRecord = {
  id: string;
  userId: string;
  medicationId: string;
  prescribedDate: string;
  quantity: number;
  refillsRemaining: number;
  doctorName: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..", "..");
const dataDir = join(projectRoot, "data");
const dbPath = join(dataDir, "pharmacy.db");
const schemaPath = join(projectRoot, "schema.sql");

function ensureDatabase(): Database {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");

  const schema = readFileSync(schemaPath, "utf-8");
  db.exec(schema);
  seedDatabase(db);

  return db;
}

const db = ensureDatabase();

function mapMedication(row: MedicationRecord | null): MedicationRecord | null {
  if (!row) {
    return null;
  }

  return {
    ...row,
    requiresPrescription: Boolean(row.requiresPrescription),
  };
}

export function getMedicationByName(name: string): MedicationRecord | null {
  const normalizedName = name.toLowerCase().trim();
  const row = db
    .prepare<MedicationRecord>(
      "SELECT id, name, activeIngredient, requiresPrescription, stock, dosage, usageInstructions FROM medications WHERE LOWER(name) = ?"
    )
    .get(normalizedName);
  return mapMedication(row ?? null);
}

export function getMedicationById(id: string): MedicationRecord | null {
  const row = db
    .prepare<MedicationRecord>(
      "SELECT id, name, activeIngredient, requiresPrescription, stock, dosage, usageInstructions FROM medications WHERE id = ?"
    )
    .get(id);
  return mapMedication(row ?? null);
}

export function getUserById(id: string): UserRecord | null {
  const row = db
    .prepare<UserRecord>(
      "SELECT id, name, language, email FROM users WHERE id = ?"
    )
    .get(id);
  return row ?? null;
}

export function getUserPrescriptions(userId: string): PrescriptionRecord[] {
  return db
    .prepare<PrescriptionRecord>(
      "SELECT id, userId, medicationId, prescribedDate, quantity, refillsRemaining, doctorName FROM prescriptions WHERE userId = ?"
    )
    .all(userId);
}

export function getPrescriptionById(id: string): PrescriptionRecord | null {
  const row = db
    .prepare<PrescriptionRecord>(
      "SELECT id, userId, medicationId, prescribedDate, quantity, refillsRemaining, doctorName FROM prescriptions WHERE id = ?"
    )
    .get(id);
  return row ?? null;
}
