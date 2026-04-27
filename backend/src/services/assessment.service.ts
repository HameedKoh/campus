import { analyzeSymptoms, preprocessSymptoms } from "../modules/ai/triage-engine";
import { assessmentRepository } from "../repositories/assessment.repository";
import { emergencyRepository } from "../repositories/emergency.repository";
import { auditService } from "./audit.service";
import { AppError } from "../utils/app-error";

function serializeAssessment(assessment: Awaited<ReturnType<typeof assessmentRepository.findById>>) {
  if (!assessment) {
    throw new AppError(404, "Assessment not found");
  }

  return {
    id: assessment.id,
    studentId: assessment.studentId,
    submittedSymptoms: assessment.submittedSymptoms,
    normalizedSymptoms: assessment.normalizedSymptoms,
    contextNotes: assessment.contextNotes,
    triageLevel: assessment.triageLevel.toLowerCase(),
    confidence: assessment.confidence,
    condition: assessment.condition,
    matchedSignals: assessment.matchedSignals,
    explanation: assessment.explanation,
    recommendation: assessment.recommendation,
    engineVersion: assessment.engineVersion,
    emergencyFlag: assessment.emergencyFlag,
    createdAt: assessment.createdAt.toISOString()
  };
}

export const assessmentService = {
  async createAssessment(
    studentId: string,
    input: { symptoms: string[]; contextNotes?: string }
  ) {
    const normalizedSymptoms = preprocessSymptoms(input.symptoms);
    const engineResult = analyzeSymptoms(input.symptoms);

    const assessment = await assessmentRepository.create({
      studentId,
      submittedSymptoms: input.symptoms,
      normalizedSymptoms,
      contextNotes: input.contextNotes,
      triageLevel: engineResult.triageLevel,
      confidence: engineResult.confidence,
      condition: engineResult.condition,
      matchedSignals: engineResult.matchedSignals,
      explanation: engineResult.explanation,
      recommendation: engineResult.recommendation,
      engineVersion: engineResult.engineVersion,
      emergencyFlag: engineResult.emergencyFlag
    });

    if (engineResult.emergencyFlag) {
      await emergencyRepository.create({
        studentId,
        linkedAssessmentId: assessment.id,
        severity: "EMERGENCY",
        message: `Emergency triage generated automatically for ${engineResult.condition}.`
      });
    }

    await auditService.log({
      actorId: studentId,
      action: "assessment.created",
      entityType: "SymptomAssessment",
      entityId: assessment.id,
      metadata: { triageLevel: assessment.triageLevel, emergencyFlag: assessment.emergencyFlag }
    });

    return serializeAssessment(assessment);
  },

  async getMyAssessments(studentId: string) {
    const assessments = await assessmentRepository.findManyByStudent(studentId);
    return assessments.map((assessment) => serializeAssessment(assessment));
  },

  async getAssessmentById(requester: { userId: string; role: "STUDENT" | "DOCTOR" | "ADMIN" }, id: string) {
    const assessment = await assessmentRepository.findById(id);
    if (!assessment) {
      throw new AppError(404, "Assessment not found");
    }

    if (requester.role === "STUDENT" && assessment.studentId !== requester.userId) {
      throw new AppError(403, "You do not have access to this assessment");
    }

    return serializeAssessment(assessment);
  }
};
