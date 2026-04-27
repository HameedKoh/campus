import { describe, expect, it } from "vitest";
import { decryptSensitiveValue, encryptSensitiveValue } from "./crypto";

describe("crypto helpers", () => {
  it("encrypts and decrypts sensitive values", () => {
    const original = "Peanut allergy";
    const encrypted = encryptSensitiveValue(original);
    expect(encrypted).not.toBe(original);
    expect(decryptSensitiveValue(encrypted)).toBe(original);
  });
});
