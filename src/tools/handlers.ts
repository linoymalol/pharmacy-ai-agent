import type { ToolHandlerMap } from "./definitions.js";
import {
  getMedicationByName,
  getMedicationById,
  getUserById,
  getUserPrescriptions,
  getPrescriptionById,
} from "../data/repo.js";
import type { MedicationRecord, PrescriptionRecord } from "../data/types.js";

type GetMedicationInput = { name: string };
type CheckStockInput = { medicationName: string };
type GetUserPrescriptionsInput = { userId: string };
type GetPrescriptionDetailsInput = { prescriptionId: string };

async function handleGetMedicationByName(
  input: unknown
): Promise<{
  success: boolean;
  medication?: MedicationRecord;
  error?: string;
}> {
  try {
    const { name } = input as GetMedicationInput;
    
    if (!name || typeof name !== "string") {
      return {
        success: false,
        error: "Invalid input: 'name' parameter is required and must be a string",
      };
    }

    const medication = getMedicationByName(name);
    
    if (!medication) {
      return {
        success: false,
        error: `Medication '${name}' not found in our database. Please check the spelling or ask the customer for more details.`,
      };
    }

    return {
      success: true,
      medication,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error retrieving medication: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function handleCheckStock(
  input: unknown
): Promise<{
  success: boolean;
  medicationName?: string;
  inStock?: boolean;
  stockCount?: number;
  error?: string;
}> {
  try {
    const { medicationName } = input as CheckStockInput;
    
    if (!medicationName || typeof medicationName !== "string") {
      return {
        success: false,
        error: "Invalid input: 'medicationName' parameter is required and must be a string",
      };
    }

    const medication = getMedicationByName(medicationName);
    
    if (!medication) {
      return {
        success: false,
        error: `Medication '${medicationName}' not found in our database.`,
      };
    }

    const inStock = medication.stock > 0;
    
    return {
      success: true,
      medicationName: medication.name,
      inStock,
      stockCount: medication.stock,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error checking stock: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function handleGetUserPrescriptions(
  input: unknown
): Promise<{
  success: boolean;
  userId?: string;
  prescriptions?: PrescriptionRecord[];
  error?: string;
}> {
  try {
    const { userId } = input as GetUserPrescriptionsInput;
    
    if (!userId || typeof userId !== "string") {
      return {
        success: false,
        error: "Invalid input: 'userId' parameter is required and must be a string",
      };
    }

    const user = getUserById(userId);
    
    if (!user) {
      return {
        success: false,
        error: `User '${userId}' not found in our database.`,
      };
    }

    const prescriptions = getUserPrescriptions(userId);
    
    return {
      success: true,
      userId,
      prescriptions,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error retrieving prescriptions: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function handleGetPrescriptionDetails(
  input: unknown
): Promise<{
  success: boolean;
  prescription?: PrescriptionRecord & {
    medication?: MedicationRecord;
    user?: { name: string };
  };
  error?: string;
}> {
  try {
    const { prescriptionId } = input as GetPrescriptionDetailsInput;
    
    if (!prescriptionId || typeof prescriptionId !== "string") {
      return {
        success: false,
        error: "Invalid input: 'prescriptionId' parameter is required and must be a string",
      };
    }

    const prescription = getPrescriptionById(prescriptionId);
    
    if (!prescription) {
      return {
        success: false,
        error: `Prescription '${prescriptionId}' not found in our database.`,
      };
    }

    const medication = getMedicationById(prescription.medicationId);
    const user = getUserById(prescription.userId);
    
    return {
      success: true,
      prescription: {
        ...prescription,
        medication: medication || undefined,
        user: user ? { name: user.name } : undefined,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Error retrieving prescription details: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export const toolHandlers: ToolHandlerMap = {
  get_medication_by_name: handleGetMedicationByName,
  check_stock: handleCheckStock,
  get_user_prescriptions: handleGetUserPrescriptions,
  get_prescription_details: handleGetPrescriptionDetails,
};
