export const TRIAGE_ENGINE_VERSION = "1.0.0";

export type EngineTriageLevel = "MILD" | "MODERATE" | "EMERGENCY";

export interface TriageAssessmentResult {
  condition: string;
  triageLevel: EngineTriageLevel;
  confidence: number;
  matchedSignals: string[];
  explanation: string;
  recommendation: string;
  emergencyFlag: boolean;
  engineVersion: string;
}

interface RuleDefinition {
  name: string;
  symptoms: string[];
  optionalSymptoms: string[];
  condition: string;
  triageLevel: EngineTriageLevel;
  explanation: string;
  recommendation: string;
}

const symptomAliases: Record<string, string> = {
  "high temperature": "fever",
  "high fever": "fever",
  "running nose": "runny nose",
  "short of breath": "shortness of breath",
  "difficulty breathing": "shortness of breath",
  "chest tightness": "chest pain",
  "tummy pain": "stomach pain",
  "abdominal pain": "stomach pain",
  "throwing up": "vomiting",
  "body pain": "body aches",
  "lightheadedness": "dizziness"
};

const emergencySignals = new Set([
  "chest pain",
  "shortness of breath",
  "severe bleeding",
  "unconsciousness",
  "seizure",
  "confusion"
]);

const symptomWeights: Record<string, number> = {
  fever: 2,
  chills: 2,
  headache: 1,
  vomiting: 2,
  diarrhea: 2,
  "stomach pain": 2,
  cough: 1,
  fatigue: 1,
  "body aches": 1,
  "shortness of breath": 4,
  "chest pain": 4,
  confusion: 4,
  dizziness: 2,
  sweating: 1,
  rash: 1,
  swelling: 2,
  wheezing: 3,
  "sore throat": 1
};

const rules: RuleDefinition[] = [
  {
    name: "Malaria Pattern",
    symptoms: ["fever", "chills", "headache"],
    optionalSymptoms: ["fatigue", "body aches", "vomiting"],
    condition: "Possible malaria",
    triageLevel: "MODERATE",
    explanation:
      "Fever, chills, and headache form a common malaria-like cluster in campus clinic settings.",
    recommendation:
      "Visit the campus clinic within 24 to 48 hours for testing, hydration support, and clinician review."
  },
  {
    name: "Typhoid Pattern",
    symptoms: ["fever", "stomach pain", "headache"],
    optionalSymptoms: ["diarrhea", "vomiting", "fatigue"],
    condition: "Possible typhoid fever",
    triageLevel: "MODERATE",
    explanation:
      "Persistent fever combined with abdominal discomfort and headache is consistent with a typhoid-like pattern.",
    recommendation:
      "Book a clinic visit soon for assessment, hydration advice, and medical review."
  },
  {
    name: "Respiratory Infection Pattern",
    symptoms: ["fever", "cough", "fatigue"],
    optionalSymptoms: ["sore throat", "runny nose", "body aches"],
    condition: "Possible viral respiratory illness",
    triageLevel: "MODERATE",
    explanation:
      "This pattern suggests a respiratory infection that should be monitored and reviewed if symptoms persist.",
    recommendation:
      "Rest, hydrate, and schedule a clinic visit if symptoms continue or worsen."
  },
  {
    name: "Food Poisoning Pattern",
    symptoms: ["vomiting", "diarrhea", "stomach pain"],
    optionalSymptoms: ["fever", "weakness", "fatigue"],
    condition: "Possible food poisoning",
    triageLevel: "MODERATE",
    explanation:
      "Sudden vomiting, diarrhea, and abdominal pain commonly point to foodborne illness or gastroenteritis.",
    recommendation:
      "Increase fluid intake and visit the clinic for persistent vomiting, dehydration, or worsening pain."
  },
  {
    name: "Allergic Reaction Pattern",
    symptoms: ["rash", "itching", "swelling"],
    optionalSymptoms: ["runny nose", "sneezing", "shortness of breath"],
    condition: "Possible allergic reaction",
    triageLevel: "MODERATE",
    explanation:
      "Rash, itching, and swelling suggest an allergic response that needs monitoring for escalation.",
    recommendation:
      "Avoid likely triggers and seek urgent care immediately if breathing becomes difficult."
  },
  {
    name: "Tension Pattern",
    symptoms: ["headache", "fatigue"],
    optionalSymptoms: ["neck stiffness", "stress", "eye strain"],
    condition: "Possible tension-related headache",
    triageLevel: "MILD",
    explanation:
      "This symptom pattern can fit stress-related headaches and fatigue, especially during demanding academic periods.",
    recommendation:
      "Prioritize hydration, rest, and follow up at the clinic if symptoms persist for more than a few days."
  }
];

const conditionProfiles: Record<string, string[]> = {
  "Possible malaria": ["fever", "chills", "headache", "fatigue", "body aches", "vomiting"],
  "Possible typhoid fever": ["fever", "stomach pain", "headache", "diarrhea", "vomiting"],
  "Possible viral respiratory illness": ["fever", "cough", "fatigue", "sore throat", "runny nose"],
  "Possible food poisoning": ["vomiting", "diarrhea", "stomach pain", "weakness"],
  "Possible allergic reaction": ["rash", "itching", "swelling", "shortness of breath"]
};

function normalizeSymptom(symptom: string) {
  return symptomAliases[symptom] ?? symptom;
}

export function preprocessSymptoms(rawSymptoms: string[]) {
  const values = rawSymptoms
    .map((symptom) => symptom.toLowerCase().trim())
    .map((symptom) => symptom.replace(/^[^a-z]+|[^a-z]+$/g, ""))
    .filter(Boolean)
    .map(normalizeSymptom);

  return Array.from(new Set(values));
}

function getRiskScore(symptoms: string[]) {
  return Math.min(
    symptoms.reduce((sum, symptom) => sum + (symptomWeights[symptom] ?? 0), 0),
    10
  );
}

function getLevelFromRisk(riskScore: number): EngineTriageLevel {
  if (riskScore >= 8) {
    return "EMERGENCY";
  }

  if (riskScore >= 4) {
    return "MODERATE";
  }

  return "MILD";
}

function runRuleMatch(symptoms: string[]) {
  const symptomSet = new Set(symptoms);
  let best:
    | {
        rule: RuleDefinition;
        confidence: number;
        matchedSignals: string[];
      }
    | undefined;

  for (const rule of rules) {
    const requiredMatches = rule.symptoms.filter((symptom) => symptomSet.has(symptom));
    if (requiredMatches.length === 0) {
      continue;
    }

    const optionalMatches = rule.optionalSymptoms.filter((symptom) =>
      symptomSet.has(symptom)
    );
    const confidence = Math.min(
      Number(
        (
          requiredMatches.length / rule.symptoms.length +
          optionalMatches.length / Math.max(rule.optionalSymptoms.length, 1) * 0.2
        ).toFixed(2)
      ),
      1
    );

    if (!best || confidence > best.confidence) {
      best = {
        rule,
        confidence,
        matchedSignals: [...requiredMatches, ...optionalMatches]
      };
    }
  }

  return best;
}

function runSimilarityFallback(symptoms: string[]) {
  const symptomSet = new Set(symptoms);
  const results = Object.entries(conditionProfiles)
    .map(([condition, profile]) => {
      const matched = profile.filter((item) => symptomSet.has(item));
      return {
        condition,
        matchedSignals: matched,
        score: Number((matched.length / profile.length).toFixed(2))
      };
    })
    .filter((item) => item.score > 0.15)
    .sort((left, right) => right.score - left.score);

  return results[0];
}

export function analyzeSymptoms(rawSymptoms: string[]): TriageAssessmentResult {
  const normalizedSymptoms = preprocessSymptoms(rawSymptoms);

  if (normalizedSymptoms.length === 0) {
    return {
      condition: "No valid symptoms submitted",
      triageLevel: "MILD",
      confidence: 0,
      matchedSignals: [],
      explanation:
        "No usable symptoms were provided, so the assistant could not run a medical triage assessment.",
      recommendation: "Please enter symptoms separated clearly so the system can assess them.",
      emergencyFlag: false,
      engineVersion: TRIAGE_ENGINE_VERSION
    };
  }

  const redFlags = normalizedSymptoms.filter((symptom) => emergencySignals.has(symptom));
  if (redFlags.length > 0) {
    return {
      condition: "Emergency symptoms detected",
      triageLevel: "EMERGENCY",
      confidence: 1,
      matchedSignals: redFlags,
      explanation: `The system detected emergency red-flag symptoms (${redFlags.join(
        ", "
      )}), so the case was escalated immediately before routine rule matching.`,
      recommendation:
        "Seek urgent medical attention immediately and notify campus emergency responders or the nearest clinic.",
      emergencyFlag: true,
      engineVersion: TRIAGE_ENGINE_VERSION
    };
  }

  const ruleResult = runRuleMatch(normalizedSymptoms);
  const similarityResult = runSimilarityFallback(normalizedSymptoms);
  const riskScore = getRiskScore(normalizedSymptoms);
  const riskLevel = getLevelFromRisk(riskScore);

  if (ruleResult) {
    const finalLevel =
      ruleResult.rule.triageLevel === "EMERGENCY" || riskLevel === "EMERGENCY"
        ? "EMERGENCY"
        : ruleResult.rule.triageLevel === "MODERATE" || riskLevel === "MODERATE"
          ? "MODERATE"
          : "MILD";

    return {
      condition: ruleResult.rule.condition,
      triageLevel: finalLevel,
      confidence: ruleResult.confidence,
      matchedSignals: ruleResult.matchedSignals,
      explanation:
        `${ruleResult.rule.explanation} The engine matched ${ruleResult.matchedSignals.join(
          ", "
        )} and computed a risk score of ${riskScore}/10, leading to a ${finalLevel.toLowerCase()} triage decision.`,
      recommendation:
        finalLevel === "EMERGENCY"
          ? "Seek urgent medical attention immediately and raise an emergency alert."
          : ruleResult.rule.recommendation,
      emergencyFlag: finalLevel === "EMERGENCY",
      engineVersion: TRIAGE_ENGINE_VERSION
    };
  }

  if (similarityResult) {
    return {
      condition: similarityResult.condition,
      triageLevel: riskLevel,
      confidence: Number((similarityResult.score * 0.8).toFixed(2)),
      matchedSignals: similarityResult.matchedSignals,
      explanation:
        `No exact rule fully matched the symptoms, so the engine used similarity scoring. ${similarityResult.condition} had the strongest overlap (${Math.round(
          similarityResult.score * 100
        )}%), and the final triage level was adjusted using the ${riskScore}/10 risk score.`,
      recommendation:
        riskLevel === "MILD"
          ? "Rest, monitor symptoms, and book a clinic visit if you do not improve."
          : riskLevel === "MODERATE"
            ? "Schedule a clinic appointment soon for professional review."
            : "Seek urgent medical attention immediately and raise an emergency alert.",
      emergencyFlag: riskLevel === "EMERGENCY",
      engineVersion: TRIAGE_ENGINE_VERSION
    };
  }

  return {
    condition: "Uncertain condition",
    triageLevel: riskLevel,
    confidence: 0.2,
    matchedSignals: normalizedSymptoms,
    explanation:
      `The current rule base did not strongly match this symptom combination, so the result is conservative and based on a ${riskScore}/10 risk score.`,
    recommendation:
      riskLevel === "MILD"
        ? "Monitor symptoms and visit the clinic if they persist."
        : riskLevel === "MODERATE"
          ? "Book a clinic appointment soon for further evaluation."
          : "Seek urgent medical attention immediately.",
    emergencyFlag: riskLevel === "EMERGENCY",
    engineVersion: TRIAGE_ENGINE_VERSION
  };
}
