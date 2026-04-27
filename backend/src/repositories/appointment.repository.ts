import type { AppointmentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

const appointmentInclude = {
  student: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  assignedDoctor: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  triageReference: true
} as const;

export const appointmentRepository = {
  create(input: {
    studentId: string;
    preferredDateTime: Date;
    reason: string;
    triageReferenceId?: string;
  }) {
    return prisma.appointment.create({
      data: input,
      include: appointmentInclude
    });
  },

  findMine(studentId: string) {
    return prisma.appointment.findMany({
      where: { studentId },
      include: appointmentInclude,
      orderBy: { createdAt: "desc" }
    });
  },

  findQueue(role: "DOCTOR" | "ADMIN", userId: string) {
    return prisma.appointment.findMany({
      where:
        role === "DOCTOR"
          ? {
              OR: [
                { assignedDoctorId: userId },
                { assignedDoctorId: null }
              ]
            }
          : undefined,
      include: appointmentInclude,
      orderBy: [{ status: "asc" }, { preferredDateTime: "asc" }]
    });
  },

  findById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
      include: appointmentInclude
    });
  },

  update(id: string, data: { status?: AppointmentStatus; clinicianResponse?: string; assignedDoctorId?: string }) {
    return prisma.appointment.update({
      where: { id },
      data,
      include: appointmentInclude
    });
  },

  countByStatus(status: AppointmentStatus) {
    return prisma.appointment.count({
      where: { status }
    });
  },

  countAssignedToDoctor(doctorId: string) {
    return prisma.appointment.count({
      where: {
        assignedDoctorId: doctorId,
        status: {
          in: ["APPROVED", "RESCHEDULED", "PENDING"]
        }
      }
    });
  },

  findRecent(limit: number) {
    return prisma.appointment.findMany({
      take: limit,
      include: appointmentInclude,
      orderBy: { createdAt: "desc" }
    });
  }
};
