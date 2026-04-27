import { assessmentRepository } from "../repositories/assessment.repository";
import { appointmentRepository } from "../repositories/appointment.repository";
import { emergencyRepository } from "../repositories/emergency.repository";
import { recordRepository } from "../repositories/record.repository";
import { userRepository } from "../repositories/user.repository";
import { auditService } from "./audit.service";
import { AppError } from "../utils/app-error";
import { decryptSensitiveValue, encryptSensitiveValue } from "../utils/crypto";
import { toSafeUser } from "./user.service";

function serializeRecordEntry(record: Awaited<ReturnType<typeof recordRepository.findByStudentId>>[number]) {
  return {
    id: record.id,
    doctor: record.doctor,
    type: record.type.toLowerCase(),
    title: record.title,
    note: decryptSensitiveValue(record.encryptedNote),
    createdAt: record.createdAt.toISOString()
  };
}

export const recordService = {
  async getMyRecords(studentId: string) {
    const user = await userRepository.findById(studentId);
    const assessments = await assessmentRepository.findManyByStudent(studentId);
    const appointments = await appointmentRepository.findMine(studentId);
    const emergencies = await emergencyRepository.findForUser("STUDENT", studentId);
    const notes = await recordRepository.findByStudentId(studentId);

    return {
      profile: toSafeUser(user),
      assessments: assessments.map((assessment) => ({
        id: assessment.id,
        triageLevel: assessment.triageLevel.toLowerCase(),
        condition: assessment.condition,
        createdAt: assessment.createdAt.toISOString(),
        recommendation: assessment.recommendation
      })),
      appointments: appointments.map((appointment) => ({
        id: appointment.id,
        status: appointment.status.toLowerCase(),
        preferredDateTime: appointment.preferredDateTime.toISOString(),
        reason: appointment.reason,
        assignedDoctor: appointment.assignedDoctor?.name ?? null
      })),
      emergencies: emergencies.map((alert) => ({
        id: alert.id,
        severity: alert.severity.toLowerCase(),
        status: alert.status.toLowerCase(),
        message: alert.message,
        createdAt: alert.createdAt.toISOString()
      })),
      clinicalNotes: notes.map((note) => serializeRecordEntry(note))
    };
  },

  async getStudentRecords(studentId: string, actorId: string) {
    const student = await userRepository.findById(studentId);
    if (!student || student.role !== "STUDENT") {
      throw new AppError(404, "Student record not found");
    }

    await auditService.log({
      actorId,
      action: "record.viewed",
      entityType: "User",
      entityId: studentId
    });

    return this.getMyRecords(studentId);
  },

  async createRecordEntry(
    studentId: string,
    actorId: string,
    input: {
      type: "CLINICAL_NOTE" | "TRIAGE_SUMMARY" | "APPOINTMENT_NOTE" | "EMERGENCY_NOTE";
      title: string;
      note: string;
    }
  ) {
    const student = await userRepository.findById(studentId);
    if (!student || student.role !== "STUDENT") {
      throw new AppError(404, "Student record not found");
    }

    const record = await recordRepository.create({
      studentId,
      doctorId: actorId,
      type: input.type,
      title: input.title,
      encryptedNote: encryptSensitiveValue(input.note) ?? ""
    });

    await auditService.log({
      actorId,
      action: "record.entry_created",
      entityType: "MedicalRecordEntry",
      entityId: record.id,
      metadata: { studentId, type: input.type }
    });

    return serializeRecordEntry(record);
  }
};
