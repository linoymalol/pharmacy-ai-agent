export type MedicationRecord = {
  id: string;
  name: string;
  activeIngredients: string[];
  requiresPrescription: boolean;
};

export type UserRecord = {
  id: string;
  fullName: string;
};

export type SyntheticDatabase = {
  users: UserRecord[];
  medications: MedicationRecord[];
};

export const syntheticDatabase: SyntheticDatabase = {
  users: [],
  medications: [],
};
