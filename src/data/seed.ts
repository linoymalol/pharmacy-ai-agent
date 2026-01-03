import type { Database as DatabaseType } from "better-sqlite3";
import type { UserRecord, MedicationRecord, PrescriptionRecord } from "./types.js";

const users: UserRecord[] = [
  { id: "user1", name: "David Cohen" },
  { id: "user2", name: "Sarah Levy"},
  { id: "user3", name: "Michael Ben-David" },
  { id: "user4", name: "Rachel Mizrahi" },
  { id: "user5", name: "John Smith" },
  { id: "user6", name: "Emily Johnson"},
  { id: "user7", name: "Daniel Brown" },
  { id: "user8", name: "Lisa Anderson" },
  { id: "user9", name: "Tom Wilson" },
  { id: "user10", name: "Anna Martinez" },
];

const medications: MedicationRecord[] = [
  {
    id: "med1",
    name: "Aspirin",
    aliases: ["אספירין"],
    activeIngredient: "Acetylsalicylic acid",
    requiresPrescription: false,
    stock: 150,
    dosage: "100mg, 325mg tablets",
    usageInstructions:
      "Take with food or water. Do not exceed recommended dosage.",
  },
  {
    id: "med2",
    name: "Amoxicillin",
    activeIngredient: "Amoxicillin trihydrate",
    requiresPrescription: true,
    stock: 45,
    dosage: "250mg, 500mg capsules",
    usageInstructions:
      "Take as directed by your doctor, typically 2-3 times daily with or without food.",
  },
  {
    id: "med3",
    name: "Ibuprofen",
    activeIngredient: "Ibuprofen",
    requiresPrescription: false,
    stock: 200,
    dosage: "200mg, 400mg, 600mg tablets",
    usageInstructions:
      "Take with food or milk to reduce stomach upset. Do not exceed 3200mg per day.",
  },
  {
    id: "med4",
    name: "Atorvastatin",
    activeIngredient: "Atorvastatin calcium",
    requiresPrescription: true,
    stock: 30,
    dosage: "10mg, 20mg, 40mg, 80mg tablets",
    usageInstructions:
      "Take once daily, with or without food, as prescribed by your doctor.",
  },
  {
    id: "med5",
    name: "Metformin",
    activeIngredient: "Metformin hydrochloride",
    requiresPrescription: true,
    stock: 25,
    dosage: "500mg, 850mg, 1000mg tablets",
    usageInstructions:
      "Take with meals to reduce stomach upset. Follow your doctor's instructions carefully.",
  },
];

const prescriptions: PrescriptionRecord[] = [
  {
    id: "presc1",
    userId: "user1",
    medicationId: "med4",
    prescribedDate: "2024-01-15",
    quantity: 30,
    refillsRemaining: 2,
    doctorName: "Dr. Avraham Goldstein",
  },
  {
    id: "presc2",
    userId: "user2",
    medicationId: "med5",
    prescribedDate: "2024-01-20",
    quantity: 60,
    refillsRemaining: 1,
    doctorName: "Dr. Miriam Cohen",
  },
  {
    id: "presc3",
    userId: "user5",
    medicationId: "med2",
    prescribedDate: "2024-02-01",
    quantity: 21,
    refillsRemaining: 0,
    doctorName: "Dr. Robert Miller",
  },
];

type MedicationSeedRow = Omit<MedicationRecord, "requiresPrescription" | "aliases"> & {
  requiresPrescription: number;
  aliases?: string | null;
};

function toMedicationSeedRow(medication: MedicationRecord): MedicationSeedRow {
  return {
    ...medication,
    requiresPrescription: medication.requiresPrescription ? 1 : 0,
    aliases: medication.aliases ? JSON.stringify(medication.aliases) : null,
  };
}

export function seedDatabase(db: DatabaseType): void {
  const insertUser = db.prepare(
    "INSERT OR IGNORE INTO users (id, name) VALUES (@id, @name)"
  );
  const insertMedication = db.prepare(
    "INSERT OR IGNORE INTO medications (id, name, aliases, activeIngredient, requiresPrescription, stock, dosage, usageInstructions) VALUES (@id, @name, @aliases, @activeIngredient, @requiresPrescription, @stock, @dosage, @usageInstructions)"
  );
  const insertPrescription = db.prepare(
    "INSERT OR IGNORE INTO prescriptions (id, userId, medicationId, prescribedDate, quantity, refillsRemaining, doctorName) VALUES (@id, @userId, @medicationId, @prescribedDate, @quantity, @refillsRemaining, @doctorName)"
  );

  const seedTransaction = db.transaction(() => {
    users.forEach((user) => insertUser.run(user));
    medications
      .map(toMedicationSeedRow)
      .forEach((medication) => insertMedication.run(medication));
    prescriptions.forEach((prescription) => insertPrescription.run(prescription));
  });

  seedTransaction();
}
