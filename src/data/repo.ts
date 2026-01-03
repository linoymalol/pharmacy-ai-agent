import { db } from "./db.js";
import type { MedicationRecord, UserRecord, PrescriptionRecord } from "./types.js";

type MedicationRow = Omit<MedicationRecord, "requiresPrescription" | "aliases"> & {
  requiresPrescription: number;
  aliases: string | null;
};

function mapMedication(row: MedicationRow | null): MedicationRecord | null {
  if (!row) {
    return null;
  }

  const aliases = row.aliases ? (JSON.parse(row.aliases) as string[]) : undefined;

  return {
    id: row.id,
    name: row.name,
    aliases,
    activeIngredient: row.activeIngredient,
    requiresPrescription: Boolean(row.requiresPrescription),
    stock: row.stock,
    dosage: row.dosage,
    usageInstructions: row.usageInstructions,
  };
}

export function getMedicationByName(name: string): MedicationRecord | null {
  // Name lookup supports exact matches for canonical names and aliases.
  const normalizedName = name.toLowerCase().trim();
  const row = db
    .prepare<[string], MedicationRow>(
      "SELECT id, name, aliases, activeIngredient, requiresPrescription, stock, dosage, usageInstructions FROM medications WHERE LOWER(name) = ?"
    )
    .get(normalizedName);
  const medication = mapMedication(row ?? null);
  if (medication) {
    return medication;
  }

  const aliasRows = db
    .prepare<[], MedicationRow>(
      "SELECT id, name, aliases, activeIngredient, requiresPrescription, stock, dosage, usageInstructions FROM medications WHERE aliases IS NOT NULL"
    )
    .all();

  for (const aliasRow of aliasRows) {
    const aliasMedication = mapMedication(aliasRow);
    if (
      aliasMedication?.aliases?.some(
        (alias) => alias.toLowerCase().trim() === normalizedName
      )
    ) {
      return aliasMedication;
    }
  }

  return null;
}

export function getMedicationById(id: string): MedicationRecord | null {
  const row = db
    .prepare<[string], MedicationRow>(
      "SELECT id, name, aliases, activeIngredient, requiresPrescription, stock, dosage, usageInstructions FROM medications WHERE id = ?"
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
