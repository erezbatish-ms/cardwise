import { describe, it, expect } from "vitest";

// Direct import, no mocks needed
const { sanitizeForLog } = await import("../../src/utils/sanitize.js");

describe("sanitizeForLog", () => {
  it("should redact password fields", () => {
    const result = sanitizeForLog({ password: "secret123", name: "test" });
    expect(result.password).toBe("[REDACTED]");
    expect(result.name).toBe("test");
  });

  it("should redact username fields", () => {
    const result = sanitizeForLog({ username: "john", data: "safe" });
    expect(result.username).toBe("[REDACTED]");
    expect(result.data).toBe("safe");
  });

  it("should redact nested sensitive fields", () => {
    const result = sanitizeForLog({
      credentials: { password: "secret", apiKey: "key123" },
      info: "visible",
    });
    const nested = result.credentials as Record<string, unknown>;
    expect(nested.password).toBe("[REDACTED]");
    expect(nested.apiKey).toBe("[REDACTED]");
    expect(result.info).toBe("visible");
  });

  it("should handle empty objects", () => {
    const result = sanitizeForLog({});
    expect(result).toEqual({});
  });
});
