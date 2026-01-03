import { describe, it, expect } from "vitest";
import { validateAgentRequest } from "../validation.js";

describe("validateAgentRequest", () => {
  it("rejects empty input", () => {
    const result = validateAgentRequest({ input: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Invalid input");
    }
  });

  it("sanitizes chat history by removing empty content", () => {
    const result = validateAgentRequest({
      input: "Hello",
      history: [
        { role: "user", content: "" },
        { role: "assistant", content: "Hi!" },
      ],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.history).toEqual([{ role: "assistant", content: "Hi!" }]);
    }
  });

  it("rejects history with invalid roles", () => {
    const result = validateAgentRequest({
      input: "Hello",
      history: [{ role: "system", content: "Invalid" }],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("role must be 'user' or 'assistant'");
    }
  });
});
