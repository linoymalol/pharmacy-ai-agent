import { describe, it, expect } from "vitest";
import { defaultLocale, parseLocale } from "../locale.js";

describe("parseLocale", () => {
  it("returns the locale for known values", () => {
    expect(parseLocale("en")).toBe("en");
    expect(parseLocale("he")).toBe("he");
  });

  it("falls back to default when value is undefined", () => {
    expect(parseLocale(undefined)).toBe(defaultLocale);
  });

  it("falls back to default for invalid values", () => {
    expect(parseLocale("fr")).toBe(defaultLocale);
  });
});
