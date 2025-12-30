export type MedicationRecord = {
  id: string;
  name: string;
  activeIngredient: string;
  requiresPrescription: boolean;
  stock: number;
};

export type UserRecord = {
  id: string;
  name: string;
  language: "en" | "he";
};

export const syntheticDb = {
  users: [] as UserRecord[],
  medications: [] as MedicationRecord[],
};

export function getMedicationByName(_name: string): MedicationRecord | null {
  // TODO: implement lookup
  return null;
}
