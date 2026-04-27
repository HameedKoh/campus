import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form);
      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="eyebrow">Secure Login</div>
        <h1>Welcome back to Campus SmartCare</h1>
        <p>Students, doctors, and admins all access the same secure platform here.</p>

        <label>
          Email
          <input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            type="email"
            placeholder="you@campus.edu"
            required
          />
        </label>

        <label>
          Password
          <input
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            type="password"
            placeholder="Enter your password"
            required
          />
        </label>

        {error && <div className="form-error">{error}</div>}

        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? "Signing in..." : "Login"}
        </button>

        <p className="inline-note">
          Student account not created yet? <Link to="/register">Register here</Link>.
        </p>
      </form>
    </div>
  );
}
