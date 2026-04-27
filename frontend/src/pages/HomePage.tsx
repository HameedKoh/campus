import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="landing-page">
      <section className="hero-card">
        <div className="hero-copy">
          <div className="eyebrow">AI-Based Smart Campus Healthcare Assistant</div>
          <h1>Healthcare access that feels immediate, secure, and campus-ready.</h1>
          <p>
            Smart triage, appointment coordination, emergency escalation, and secure
            medical history in one professional university health platform.
          </p>
          <div className="hero-actions">
            <Link className="primary-link" to="/register">
              Create Student Account
            </Link>
            <Link className="secondary-link" to="/login">
              Staff or Student Login
            </Link>
          </div>
        </div>

        <div className="hero-grid">
          <article>
            <strong>24/7</strong>
            <span>Explainable symptom assessment</span>
          </article>
          <article>
            <strong>3 Roles</strong>
            <span>Student, doctor, and admin workflows</span>
          </article>
          <article>
            <strong>Secure</strong>
            <span>JWT auth, encrypted notes, audit-ready design</span>
          </article>
          <article>
            <strong>Fast Triage</strong>
            <span>Emergency prioritization before clinic congestion builds</span>
          </article>
        </div>
      </section>
    </div>
  );
}
