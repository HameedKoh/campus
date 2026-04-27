import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import type { DashboardSummary } from "../types";
import { StatusPill } from "../components/StatusPill";

export function DashboardPage() {
  const { session } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user.role === "STUDENT") {
      return;
    }

    void api
      .getDashboardSummary()
      .then(setSummary)
      .catch((dashboardError: Error) => setError(dashboardError.message));
  }, [session?.user.role]);

  if (!session) {
    return null;
  }

  return (
    <div className="page-shell">
      <section className="panel hero-panel">
        <div>
          <div className="eyebrow">Operational overview</div>
          <h2>{session.user.name}</h2>
          <p>
            {session.user.role === "STUDENT"
              ? "Manage your healthcare requests, run symptom checks, and keep your medical history organized."
              : "Monitor clinic flow, respond to emergencies, and keep campus healthcare operations moving."}
          </p>
        </div>
        <div className="profile-chip">
          <span>{session.user.role.toLowerCase()}</span>
          <strong>{session.user.email}</strong>
        </div>
      </section>

      {session.user.role === "STUDENT" ? (
        <>
          <section className="stat-grid">
            <Link className="action-card" to="/symptom-checker">
              <strong>AI Symptom Checker</strong>
              <span>Explainable triage with matched symptoms and next-step guidance.</span>
            </Link>
            <Link className="action-card" to="/appointments">
              <strong>Appointment Booking</strong>
              <span>Send appointment requests and track clinic responses in one place.</span>
            </Link>
            <Link className="action-card" to="/records">
              <strong>Health Records</strong>
              <span>View your profile, visit history, emergency alerts, and clinician notes.</span>
            </Link>
            <Link className="action-card alert-card" to="/emergency">
              <strong>Emergency Alert</strong>
              <span>Raise a high-priority alert when urgent campus medical attention is needed.</span>
            </Link>
          </section>

          <section className="panel">
            <h3>Your secure profile</h3>
            <div className="info-grid">
              <div>
                <span className="label">Matric number</span>
                <strong>{session.user.healthProfile?.matricNumber ?? "Not provided"}</strong>
              </div>
              <div>
                <span className="label">Age range</span>
                <strong>{session.user.healthProfile?.ageRange ?? "Not provided"}</strong>
              </div>
              <div>
                <span className="label">Allergies</span>
                <strong>{session.user.healthProfile?.allergies ?? "Not provided"}</strong>
              </div>
              <div>
                <span className="label">Chronic conditions</span>
                <strong>
                  {session.user.healthProfile?.chronicConditions ?? "Not provided"}
                </strong>
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          {error && <div className="form-error">{error}</div>}
          <section className="stat-grid">
            {summary &&
              Object.entries(summary.metrics).map(([label, value]) => (
                <article className="metric-card" key={label}>
                  <span>{label.replace(/([A-Z])/g, " $1")}</span>
                  <strong>{value}</strong>
                </article>
              ))}
          </section>

          <section className="two-column-grid">
            <article className="panel">
              <h3>Recent appointments</h3>
              {summary?.recentAppointments.length ? (
                summary.recentAppointments.map((appointment) => (
                  <div className="list-row" key={appointment.id}>
                    <div>
                      <strong>{appointment.studentName}</strong>
                      <span>{new Date(appointment.preferredDateTime).toLocaleString()}</span>
                    </div>
                    <StatusPill value={appointment.status} />
                  </div>
                ))
              ) : (
                <p className="empty-state">No appointment data yet.</p>
              )}
            </article>

            <article className="panel">
              <h3>Recent emergency alerts</h3>
              {summary?.recentEmergencies.length ? (
                summary.recentEmergencies.map((alert) => (
                  <div className="list-row" key={alert.id}>
                    <div>
                      <strong>{alert.studentName}</strong>
                      <span>{alert.severity}</span>
                    </div>
                    <StatusPill value={alert.status} />
                  </div>
                ))
              ) : (
                <p className="empty-state">No emergency alerts yet.</p>
              )}
            </article>
          </section>
        </>
      )}
    </div>
  );
}
