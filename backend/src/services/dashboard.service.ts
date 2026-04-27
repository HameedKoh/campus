import { appointmentRepository } from "../repositories/appointment.repository";
import { assessmentRepository } from "../repositories/assessment.repository";
import { emergencyRepository } from "../repositories/emergency.repository";
import { userRepository } from "../repositories/user.repository";

export const dashboardService = {
  async getSummary(role: "DOCTOR" | "ADMIN", userId: string) {
    const [
      activeEmergencies,
      pendingAppointments,
      recentAssessments,
      recentAppointments,
      recentEmergencies
    ] = await Promise.all([
      emergencyRepository.countActive(),
      appointmentRepository.countByStatus("PENDING"),
      assessmentRepository.countRecent(24),
      appointmentRepository.findRecent(5),
      emergencyRepository.findRecent(5)
    ]);

    if (role === "ADMIN") {
      const [studentCount, doctorCount, adminCount] = await Promise.all([
        userRepository.countByRole("STUDENT"),
        userRepository.countByRole("DOCTOR"),
        userRepository.countByRole("ADMIN")
      ]);

      return {
        metrics: {
          students: studentCount,
          doctors: doctorCount,
          admins: adminCount,
          activeEmergencies,
          pendingAppointments,
          assessmentsInLast24Hours: recentAssessments
        },
        recentAppointments: recentAppointments.map((appointment) => ({
          id: appointment.id,
          studentName: appointment.student.name,
          status: appointment.status.toLowerCase(),
          preferredDateTime: appointment.preferredDateTime.toISOString()
        })),
        recentEmergencies: recentEmergencies.map((alert) => ({
          id: alert.id,
          studentName: alert.student.name,
          severity: alert.severity.toLowerCase(),
          status: alert.status.toLowerCase()
        }))
      };
    }

    const doctorAssignments = await appointmentRepository.countAssignedToDoctor(userId);

    return {
      metrics: {
        activeEmergencies,
        pendingAppointments,
        doctorAssignments,
        assessmentsInLast24Hours: recentAssessments
      },
      recentAppointments: recentAppointments.map((appointment) => ({
        id: appointment.id,
        studentName: appointment.student.name,
        status: appointment.status.toLowerCase(),
        preferredDateTime: appointment.preferredDateTime.toISOString(),
        assignedDoctor: appointment.assignedDoctor?.name ?? null
      })),
      recentEmergencies: recentEmergencies.map((alert) => ({
        id: alert.id,
        studentName: alert.student.name,
        severity: alert.severity.toLowerCase(),
        status: alert.status.toLowerCase()
      }))
    };
  }
};
