import { db } from "./db.js";
import type { MedicationRecord, UserRecord, PrescriptionRecord } from "./types.js";

type MedicationRow = Omit<MedicationRecord, "requiresPrescription"> & {
  requiresPrescription: number;
};

function mapMedication(row: MedicationRow | null): MedicationRecord | null {
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
    .prepare<[string], MedicationRow>(
      "SELECT id, name, activeIngredient, requiresPrescription, stock, dosage, usageInstructions FROM medications WHERE LOWER(name) = ?"
    )
    .get(normalizedName);
  return mapMedication(row ?? null);
}

export function getMedicationById(id: string): MedicationRecord | null {
  const row = db
    .prepare<[string], MedicationRow>(
      "SELECT id, name, activeIngredient, requiresPrescription, stock, dosage, usageInstructions FROM medications WHERE id = ?"
    )
    .get(id);
  return mapMedication(row ?? null);
}

export function getUserById(id: string): UserRecord | null {
  const row = db
    .prepare<[string], UserRecord>(
      "SELECT id, name FROM users WHERE id = ?"
    )
    .get(id);
  return row ?? null;
}

export function getUserPrescriptions(userId: string): PrescriptionRecord[] {
  return db
    .prepare<[string], PrescriptionRecord>(
      "SELECT id, userId, medicationId, prescribedDate, quantity, refillsRemaining, doctorName FROM prescriptions WHERE userId = ?"
    )
    .all(userId);
}

export function getPrescriptionById(id: string): PrescriptionRecord | null {
  const row = db
    .prepare<[string], PrescriptionRecord>(
      "SELECT id, userId, medicationId, prescribedDate, quantity, refillsRemaining, doctorName FROM prescriptions WHERE id = ?"
    )
    .get(id);
  return row ?? null;
}
