import { describe, it, expect } from "vitest";
import { toolHandlers } from "../handlers.js";
import { db } from "../../data/db.js";
import type { MedicationRecord, PrescriptionRecord } from "../../data/types.js";

type MedicationHandlerResult =
  | { success: true; medication: MedicationRecord }
  | { success: false; error: string };

type StockHandlerResult =
  | { success: true; medicationName: string; inStock: boolean; stockCount: number }
  | { success: false; error: string };

type PrescriptionsHandlerResult =
  | { success: true; userId: string; prescriptions: PrescriptionRecord[] }
  | { success: false; error: string };

describe("toolHandlers", () => {
  it("get_medication_by_name returns existing medication", async () => {
    const result = (await toolHandlers.get_medication_by_name({
      name: "Aspirin",
    })) as MedicationHandlerResult;

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.medication.name).toBe("Aspirin");
    }
  });

  it("get_medication_by_name returns error for missing medication", async () => {
    const result = (await toolHandlers.get_medication_by_name({
      name: "NotAMed",
    })) as MedicationHandlerResult;

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("not found");
    }
  });

  it("check_stock reports inStock true when stock is available", async () => {
    const result = (await toolHandlers.check_stock({
      medicationName: "Ibuprofen",
    })) as StockHandlerResult;

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.inStock).toBe(true);
      expect(result.stockCount).toBeGreaterThan(0);
    }
  });

  it("check_stock reports inStock false when stock is zero", async () => {
    const original = db
      .prepare<[string], { stock: number }>("SELECT stock FROM medications WHERE name = ?")
      .get("Aspirin");

    expect(original).not.toBeUndefined();

    db.prepare("UPDATE medications SET stock = 0 WHERE name = ?").run("Aspirin");

    try {
      const result = (await toolHandlers.check_stock({
        medicationName: "Aspirin",
      })) as StockHandlerResult;

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.inStock).toBe(false);
        expect(result.stockCount).toBe(0);
      }
    } finally {
      db.prepare("UPDATE medications SET stock = ? WHERE name = ?").run(original?.stock ?? 0, "Aspirin");
    }
  });

  it("get_user_prescriptions returns prescriptions for valid user", async () => {
    const result = (await toolHandlers.get_user_prescriptions({
      userId: "user1",
    })) as PrescriptionsHandlerResult;

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.userId).toBe("user1");
      expect(result.prescriptions.length).toBeGreaterThan(0);
    }
  });

  it("get_user_prescriptions returns error for invalid user", async () => {
    const result = (await toolHandlers.get_user_prescriptions({
      userId: "missing",
    })) as PrescriptionsHandlerResult;

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("not found");
    }
  });
});
