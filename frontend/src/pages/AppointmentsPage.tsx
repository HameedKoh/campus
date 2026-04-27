import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import type { Appointment, Assessment } from "../types";
import { StatusPill } from "../components/StatusPill";

export function AppointmentsPage() {
  const { session } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [error, setError] = useState("");
  const [studentForm, setStudentForm] = useState({
    preferredDateTime: "",
    reason: "",
    triageReferenceId: ""
  });
  const [assignDoctorId, setAssignDoctorId] = useState("");
  const [responseText, setResponseText] = useState("");

  async function loadData() {
    try {
      if (session?.user.role === "STUDENT") {
        const [appointmentsData, assessmentsData] = await Promise.all([
          api.getMyAppointments(),
          api.getMyAssessments()
        ]);
        setAppointments(appointmentsData);
        setAssessments(assessmentsData);
      } else {
        const appointmentsData = await api.getAppointmentQueue();
        setAppointments(appointmentsData);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load appointments");
    }
  }

  useEffect(() => {
    void loadData();
  }, [session?.user.role]);

  async function createAppointment(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    try {
      await api.createAppointment({
        preferredDateTime: studentForm.preferredDateTime,
        reason: studentForm.reason,
        triageReferenceId: studentForm.triageReferenceId || undefined
      });
      setStudentForm({ preferredDateTime: "", reason: "", triageReferenceId: "" });
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create appointment");
    }
  }

  async function updateAppointment(id: string, status: string) {
    try {
      await api.updateAppointmentStatus(id, {
        status,
        clinicianResponse: responseText || undefined
      });
      setResponseText("");
      await loadData();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Update failed");
    }
  }

  async function assignAppointment(id: string) {
    if (!assignDoctorId) {
      return;
    }

    try {
      await api.assignAppointment(id, assignDoctorId);
      setAssignDoctorId("");
      await loadData();
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : "Assignment failed");
    }
  }

  return (
    <div className="page-shell">
      <section className="panel page-heading">
        <div>
          <div className="eyebrow">Appointment Management</div>
          <h2>{session?.user.role === "STUDENT" ? "Book an appointment" : "Manage the clinic queue"}</h2>
          <p>
            {session?.user.role === "STUDENT"
              ? "Request a clinic visit and connect your latest AI assessment when it helps staff prioritize your case."
              : "Approve, reschedule, reject, or assign pending requests from the campus health queue."}
          </p>
        </div>
      </section>

      {error && <div className="form-error">{error}</div>}

      {session?.user.role === "STUDENT" && (
        <form className="panel" onSubmit={createAppointment}>
          <div className="form-grid">
            <label>
              Preferred date and time
              <input
                type="datetime-local"
                value={studentForm.preferredDateTime}
                onChange={(event) =>
                  setStudentForm((current) => ({
                    ...current,
                    preferredDateTime: event.target.value
                  }))
                }
                required
              />
            </label>

            <label>
              Reason
              <textarea
                value={studentForm.reason}
                onChange={(event) =>
                  setStudentForm((current) => ({ ...current, reason: event.target.value }))
                }
                required
              />
            </label>

            <label>
              Link assessment
              <select
                value={studentForm.triageReferenceId}
                onChange={(event) =>
                  setStudentForm((current) => ({
                    ...current,
                    triageReferenceId: event.target.value
                  }))
                }
              >
                <option value="">No linked triage result</option>
                {assessments.map((assessment) => (
                  <option key={assessment.id} value={assessment.id}>
                    {assessment.condition} - {assessment.triageLevel}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="primary-button" type="submit">
            Submit Appointment Request
          </button>
        </form>
      )}

      {session?.user.role !== "STUDENT" && (
        <section className="panel">
          <div className="form-grid compact-grid">
            <label>
              Clinician response
              <textarea
                value={responseText}
                onChange={(event) => setResponseText(event.target.value)}
                placeholder="Optional note to include with approvals or reschedules"
              />
            </label>
            <label>
              Assign doctor ID
              <input
                value={assignDoctorId}
                onChange={(event) => setAssignDoctorId(event.target.value)}
                placeholder="Paste a doctor user ID when needed"
              />
            </label>
          </div>
        </section>
      )}

      <section className="panel">
        <h3>{session?.user.role === "STUDENT" ? "My requests" : "Current queue"}</h3>
        {appointments.length ? (
          appointments.map((appointment) => (
            <div className="queue-card" key={appointment.id}>
              <div>
                <div className="queue-title">
                  <strong>{appointment.student.name}</strong>
                  <StatusPill value={appointment.status} />
                </div>
                <p>{appointment.reason}</p>
                <span>
                  Preferred time: {new Date(appointment.preferredDateTime).toLocaleString()}
                </span>
                <span>Student ID: {appointment.student.id}</span>
                {appointment.assignedDoctor && <span>Doctor: {appointment.assignedDoctor.name}</span>}
                {appointment.triageLevel && <span>Triage: {appointment.triageLevel}</span>}
              </div>

              {session?.user.role === "STUDENT" ? (
                <button
                  className="ghost-button danger"
                  onClick={() => void updateAppointment(appointment.id, "CANCELLED")}
                >
                  Cancel
                </button>
              ) : (
                <div className="action-cluster">
                  <button className="ghost-button" onClick={() => void updateAppointment(appointment.id, "APPROVED")}>
                    Approve
                  </button>
                  <button className="ghost-button" onClick={() => void updateAppointment(appointment.id, "RESCHEDULED")}>
                    Reschedule
                  </button>
                  <button className="ghost-button danger" onClick={() => void updateAppointment(appointment.id, "REJECTED")}>
                    Reject
                  </button>
                  <button className="ghost-button" onClick={() => void assignAppointment(appointment.id)}>
                    Assign
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="empty-state">No appointments to show yet.</p>
        )}
      </section>
    </div>
  );
}
