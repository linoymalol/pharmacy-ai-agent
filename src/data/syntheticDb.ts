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

export const syntheticDb = {
  users: [
    { id: "user1", name: "David Cohen", language: "he", email: "david.cohen@example.com" },
    { id: "user2", name: "Sarah Levy", language: "he", email: "sarah.levy@example.com" },
    { id: "user3", name: "Michael Ben-David", language: "he", email: "michael.bd@example.com" },
    { id: "user4", name: "Rachel Mizrahi", language: "he", email: "rachel.m@example.com" },
    { id: "user5", name: "John Smith", language: "en", email: "john.smith@example.com" },
    { id: "user6", name: "Emily Johnson", language: "en", email: "emily.j@example.com" },
    { id: "user7", name: "Daniel Brown", language: "en", email: "daniel.b@example.com" },
    { id: "user8", name: "Lisa Anderson", language: "en", email: "lisa.a@example.com" },
    { id: "user9", name: "Tom Wilson", language: "en", email: "tom.w@example.com" },
    { id: "user10", name: "Anna Martinez", language: "en", email: "anna.m@example.com" },
  ] as UserRecord[],
  medications: [
    {
      id: "med1",
      name: "Aspirin",
      activeIngredient: "Acetylsalicylic acid",
      requiresPrescription: false,
      stock: 150,
      dosage: "100mg, 325mg tablets",
      usageInstructions: "Take with food or water. Do not exceed recommended dosage.",
    },
    {
      id: "med2",
      name: "Amoxicillin",
      activeIngredient: "Amoxicillin trihydrate",
      requiresPrescription: true,
      stock: 45,
      dosage: "250mg, 500mg capsules",
      usageInstructions: "Take as directed by your doctor, typically 2-3 times daily with or without food.",
    },
    {
      id: "med3",
      name: "Ibuprofen",
      activeIngredient: "Ibuprofen",
      requiresPrescription: false,
      stock: 200,
      dosage: "200mg, 400mg, 600mg tablets",
      usageInstructions: "Take with food or milk to reduce stomach upset. Do not exceed 3200mg per day.",
    },
    {
      id: "med4",
      name: "Atorvastatin",
      activeIngredient: "Atorvastatin calcium",
      requiresPrescription: true,
      stock: 30,
      dosage: "10mg, 20mg, 40mg, 80mg tablets",
      usageInstructions: "Take once daily, with or without food, as prescribed by your doctor.",
    },
    {
      id: "med5",
      name: "Metformin",
      activeIngredient: "Metformin hydrochloride",
      requiresPrescription: true,
      stock: 25,
      dosage: "500mg, 850mg, 1000mg tablets",
      usageInstructions: "Take with meals to reduce stomach upset. Follow your doctor's instructions carefully.",
    },
  ] as MedicationRecord[],
  prescriptions: [
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
  ] as PrescriptionRecord[],
};

export function getMedicationByName(name: string): MedicationRecord | null {
  const normalizedName = name.toLowerCase().trim();
  return (
    syntheticDb.medications.find(
      (med) => med.name.toLowerCase() === normalizedName
    ) || null
  );
}

export function getMedicationById(id: string): MedicationRecord | null {
  return syntheticDb.medications.find((med) => med.id === id) || null;
}

export function getUserById(id: string): UserRecord | null {
  return syntheticDb.users.find((user) => user.id === id) || null;
}

export function getUserPrescriptions(userId: string): PrescriptionRecord[] {
  return syntheticDb.prescriptions.filter((presc) => presc.userId === userId);
}

export function getPrescriptionById(id: string): PrescriptionRecord | null {
  return syntheticDb.prescriptions.find((presc) => presc.id === id) || null;
}
