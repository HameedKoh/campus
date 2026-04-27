import { prisma } from "../lib/prisma";

const emergencyInclude = {
  student: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  linkedAssessment: true,
  acknowledgedBy: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
} as const;

export const emergencyRepository = {
  create(input: {
    studentId: string;
    linkedAssessmentId?: string;
    severity: "MODERATE" | "EMERGENCY";
    message: string;
  }) {
    return prisma.emergencyAlert.create({
      data: input,
      include: emergencyInclude
    });
  },

  findForUser(role: "STUDENT" | "DOCTOR" | "ADMIN", userId: string) {
    return prisma.emergencyAlert.findMany({
      where: role === "STUDENT" ? { studentId: userId } : undefined,
      include: emergencyInclude,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }]
    });
  },

  findById(id: string) {
    return prisma.emergencyAlert.findUnique({
      where: { id },
      include: emergencyInclude
    });
  },

  update(id: string, data: { status: "ACKNOWLEDGED" | "RESOLVED"; acknowledgedById?: string; resolvedAt?: Date | null }) {
    return prisma.emergencyAlert.update({
      where: { id },
      data,
      include: emergencyInclude
    });
  },

  countActive() {
    return prisma.emergencyAlert.count({
      where: {
        status: {
          in: ["ACTIVE", "ACKNOWLEDGED"]
        }
      }
    });
  },

  findRecent(limit: number) {
    return prisma.emergencyAlert.findMany({
      take: limit,
      include: emergencyInclude,
      orderBy: { createdAt: "desc" }
    });
  }
};
