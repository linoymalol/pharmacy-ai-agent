import { describe, it, expect } from "vitest";
import { getMedicationByName, getUserById, getUserPrescriptions } from "../repo.js";

describe("data repo", () => {
  it("getUserById returns user when found", () => {
    const user = getUserById("user1");

    expect(user).not.toBeNull();
    expect(user?.name).toBe("David Cohen");
  });

  it("getUserById returns null when missing", () => {
    const user = getUserById("missing");

    expect(user).toBeNull();
  });

  it("getMedicationByName is case-insensitive", () => {
    const medication = getMedicationByName("aspirin");

    expect(medication).not.toBeNull();
    expect(medication?.name).toBe("Aspirin");
  });

  it("getUserPrescriptions returns only matching records", () => {
    const prescriptions = getUserPrescriptions("user1");

    expect(prescriptions.length).toBeGreaterThan(0);
    expect(prescriptions.every((record) => record.userId === "user1")).toBe(true);
  });
});
