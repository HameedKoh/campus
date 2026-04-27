import type { AppointmentStatus } from "@prisma/client";
import { appointmentRepository } from "../repositories/appointment.repository";
import { assessmentRepository } from "../repositories/assessment.repository";
import { userRepository } from "../repositories/user.repository";
import { auditService } from "./audit.service";
import { AppError } from "../utils/app-error";

function serializeAppointment(appointment: Awaited<ReturnType<typeof appointmentRepository.findById>>) {
  if (!appointment) {
    throw new AppError(404, "Appointment not found");
  }

  return {
    id: appointment.id,
    student: appointment.student,
    assignedDoctor: appointment.assignedDoctor,
    preferredDateTime: appointment.preferredDateTime.toISOString(),
    reason: appointment.reason,
    status: appointment.status.toLowerCase(),
    clinicianResponse: appointment.clinicianResponse,
    triageReferenceId: appointment.triageReferenceId,
    triageLevel: appointment.triageReference?.triageLevel.toLowerCase() ?? null,
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString()
  };
}

export const appointmentService = {
  async createAppointment(
    studentId: string,
    input: { preferredDateTime: string; reason: string; triageReferenceId?: string }
  ) {
    if (input.triageReferenceId) {
      const assessment = await assessmentRepository.findById(input.triageReferenceId);
      if (!assessment || assessment.studentId !== studentId) {
        throw new AppError(400, "The selected assessment cannot be linked to this appointment");
      }
    }

    const appointment = await appointmentRepository.create({
      studentId,
      preferredDateTime: new Date(input.preferredDateTime),
      reason: input.reason,
      triageReferenceId: input.triageReferenceId
    });

    await auditService.log({
      actorId: studentId,
      action: "appointment.created",
      entityType: "Appointment",
      entityId: appointment.id
    });

    return serializeAppointment(appointment);
  },

  async getMyAppointments(studentId: string) {
    const appointments = await appointmentRepository.findMine(studentId);
    return appointments.map((appointment) => serializeAppointment(appointment));
  },

  async getQueue(role: "DOCTOR" | "ADMIN", userId: string) {
    const appointments = await appointmentRepository.findQueue(role, userId);
    return appointments.map((appointment) => serializeAppointment(appointment));
  },

  async updateStatus(
    actor: { userId: string; role: "STUDENT" | "DOCTOR" | "ADMIN" },
    appointmentId: string,
    input: { status: AppointmentStatus; clinicianResponse?: string }
  ) {
    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new AppError(404, "Appointment not found");
    }

    if (actor.role === "STUDENT") {
      const studentAllowed = input.status === "CANCELLED" && appointment.studentId === actor.userId;
      if (!studentAllowed) {
        throw new AppError(403, "Students can only cancel their own appointments");
      }
    }

    const updatedAppointment = await appointmentRepository.update(appointmentId, {
      status: input.status,
      clinicianResponse: input.clinicianResponse
    });

    await auditService.log({
      actorId: actor.userId,
      action: "appointment.status_updated",
      entityType: "Appointment",
      entityId: updatedAppointment.id,
      metadata: { status: input.status }
    });

    return serializeAppointment(updatedAppointment);
  },

  async assignDoctor(actorId: string, appointmentId: string, assignedDoctorId: string) {
    const doctor = await userRepository.findDoctorById(assignedDoctorId);
    if (!doctor) {
      throw new AppError(400, "Assigned doctor must be an active doctor account");
    }

    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new AppError(404, "Appointment not found");
    }

    const updatedAppointment = await appointmentRepository.update(appointmentId, {
      assignedDoctorId
    });

    await auditService.log({
      actorId,
      action: "appointment.assigned",
      entityType: "Appointment",
      entityId: updatedAppointment.id,
      metadata: { assignedDoctorId }
    });

    return serializeAppointment(updatedAppointment);
  }
};
