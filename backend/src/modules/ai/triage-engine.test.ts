import { describe, expect, it } from "vitest";
import { analyzeSymptoms, preprocessSymptoms } from "./triage-engine";

describe("triage engine", () => {
  it("normalizes duplicate symptom aliases", () => {
    expect(preprocessSymptoms(["High Fever", " high temperature ", "HEADACHE"])).toEqual([
      "fever",
      "headache"
    ]);
  });

  it("escalates emergency symptoms immediately", () => {
    const result = analyzeSymptoms(["chest pain", "dizziness"]);
    expect(result.triageLevel).toBe("EMERGENCY");
    expect(result.emergencyFlag).toBe(true);
  });

  it("classifies common campus illnesses with an explanation", () => {
    const result = analyzeSymptoms(["fever", "chills", "headache", "fatigue"]);
    expect(result.condition).toContain("malaria");
    expect(result.explanation.length).toBeGreaterThan(20);
  });
});
