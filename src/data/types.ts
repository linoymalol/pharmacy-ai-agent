export type UserRecord = {
  id: string;
  name: string;
};

export type MedicationRecord = {
  id: string;
  name: string;
  aliases?: string[];
  activeIngredient: string;
  requiresPrescription: boolean;
  stock: number;
  dosage?: string;
  usageInstructions?: string;
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
