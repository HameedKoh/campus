import { prisma } from "../lib/prisma";

const recordInclude = {
  doctor: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
} as const;

export const recordRepository = {
  create(input: {
    studentId: string;
    doctorId: string;
    type: "CLINICAL_NOTE" | "TRIAGE_SUMMARY" | "APPOINTMENT_NOTE" | "EMERGENCY_NOTE";
    title: string;
    encryptedNote: string;
  }) {
    return prisma.medicalRecordEntry.create({
      data: input,
      include: recordInclude
    });
  },

  findByStudentId(studentId: string) {
    return prisma.medicalRecordEntry.findMany({
      where: { studentId },
      include: recordInclude,
      orderBy: { createdAt: "desc" }
    });
  }
};
