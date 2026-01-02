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

type HandlerResult<T> = Promise<({ success: true } & T) | { success: false; error: string }>;

const getStringField = (
  input: unknown,
  field: string
): { ok: true; value: string } | { ok: false; error: string } => {
  if (!input || typeof input !== "object") {
    return { ok: false, error: `Invalid input: '${field}' parameter is required and must be a string` };
  }
  const value = (input as Record<string, unknown>)[field];
  if (!value || typeof value !== "string") {
    return { ok: false, error: `Invalid input: '${field}' parameter is required and must be a string` };
  }
  return { ok: true, value };
};

const ensureMedicationByName = (name: string): MedicationRecord | { error: string } => {
  const medication = getMedicationByName(name);
  if (!medication) {
    return {
      error: `Medication '${name}' not found in our database. Please check the spelling or ask the customer for more details.`,
    };
  }
  return medication;
};

async function handleGetMedicationByName(
  input: unknown
): HandlerResult<{ medication: MedicationRecord }> {
  try {
    const nameResult = getStringField(input as GetMedicationInput, "name");
    if (!nameResult.ok) {
      return { success: false, error: nameResult.error };
    }

    const medicationResult = ensureMedicationByName(nameResult.value);
    if ("error" in medicationResult) {
      return { success: false, error: medicationResult.error };
    }

    return {
      success: true,
      medication: medicationResult,
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
): HandlerResult<{ medicationName: string; inStock: boolean; stockCount: number }> {
  try {
    const medicationNameResult = getStringField(input as CheckStockInput, "medicationName");
    if (!medicationNameResult.ok) {
      return { success: false, error: medicationNameResult.error };
    }

    const medicationResult = ensureMedicationByName(medicationNameResult.value);
    if ("error" in medicationResult) {
      return { success: false, error: medicationResult.error };
    }

    const inStock = medicationResult.stock > 0;
    
    return {
      success: true,
      medicationName: medicationResult.name,
      inStock,
      stockCount: medicationResult.stock,
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
): HandlerResult<{ userId: string; prescriptions: PrescriptionRecord[] }> {
  try {
    const userIdResult = getStringField(input as GetUserPrescriptionsInput, "userId");
    if (!userIdResult.ok) {
      return { success: false, error: userIdResult.error };
    }

    const user = getUserById(userIdResult.value);
    
    if (!user) {
      return {
        success: false,
        error: `User '${userIdResult.value}' not found in our database.`,
      };
    }

    const prescriptions = getUserPrescriptions(userIdResult.value);
    
    return {
      success: true,
      userId: userIdResult.value,
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
): HandlerResult<{
  prescription: PrescriptionRecord & {
    medication?: MedicationRecord;
    user?: { name: string };
  };
}> {
  try {
    const prescriptionIdResult = getStringField(input as GetPrescriptionDetailsInput, "prescriptionId");
    if (!prescriptionIdResult.ok) {
      return { success: false, error: prescriptionIdResult.error };
    }

    const prescription = getPrescriptionById(prescriptionIdResult.value);
    
    if (!prescription) {
      return {
        success: false,
        error: `Prescription '${prescriptionIdResult.value}' not found in our database.`,
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
