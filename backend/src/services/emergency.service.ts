import { emergencyRepository } from "../repositories/emergency.repository";
import { assessmentRepository } from "../repositories/assessment.repository";
import { auditService } from "./audit.service";
import { AppError } from "../utils/app-error";

function serializeEmergency(alert: Awaited<ReturnType<typeof emergencyRepository.findById>>) {
  if (!alert) {
    throw new AppError(404, "Emergency alert not found");
  }

  return {
    id: alert.id,
    student: alert.student,
    linkedAssessmentId: alert.linkedAssessmentId,
    severity: alert.severity.toLowerCase(),
    status: alert.status.toLowerCase(),
    message: alert.message,
    acknowledgedBy: alert.acknowledgedBy,
    createdAt: alert.createdAt.toISOString(),
    resolvedAt: alert.resolvedAt?.toISOString() ?? null
  };
}

export const emergencyService = {
  async createEmergency(
    studentId: string,
    input: { message: string; linkedAssessmentId?: string; severity?: "MODERATE" | "EMERGENCY" }
  ) {
    if (input.linkedAssessmentId) {
      const assessment = await assessmentRepository.findById(input.linkedAssessmentId);
      if (!assessment || assessment.studentId !== studentId) {
        throw new AppError(400, "The linked assessment is invalid for this student");
      }
    }

    const alert = await emergencyRepository.create({
      studentId,
      linkedAssessmentId: input.linkedAssessmentId,
      severity: input.severity ?? "EMERGENCY",
      message: input.message
    });

    await auditService.log({
      actorId: studentId,
      action: "emergency.created",
      entityType: "EmergencyAlert",
      entityId: alert.id,
      metadata: { severity: alert.severity }
    });

    return serializeEmergency(alert);
  },

  async getEmergencies(role: "STUDENT" | "DOCTOR" | "ADMIN", userId: string) {
    const alerts = await emergencyRepository.findForUser(role, userId);
    return alerts.map((alert) => serializeEmergency(alert));
  },

  async acknowledge(alertId: string, actorId: string) {
    const alert = await emergencyRepository.findById(alertId);
    if (!alert) {
      throw new AppError(404, "Emergency alert not found");
    }

    const updatedAlert = await emergencyRepository.update(alertId, {
      status: "ACKNOWLEDGED",
      acknowledgedById: actorId
    });

    await auditService.log({
      actorId,
      action: "emergency.acknowledged",
      entityType: "EmergencyAlert",
      entityId: alertId
    });

    return serializeEmergency(updatedAlert);
  },

  async resolve(alertId: string, actorId: string) {
    const alert = await emergencyRepository.findById(alertId);
    if (!alert) {
      throw new AppError(404, "Emergency alert not found");
    }

    const updatedAlert = await emergencyRepository.update(alertId, {
      status: "RESOLVED",
      acknowledgedById: actorId,
      resolvedAt: new Date()
    });

    await auditService.log({
      actorId,
      action: "emergency.resolved",
      entityType: "EmergencyAlert",
      entityId: alertId
    });

    return serializeEmergency(updatedAlert);
  }
};
