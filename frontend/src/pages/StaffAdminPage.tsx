import { useState } from "react";
import { api } from "../lib/api";

export function StaffAdminPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "DOCTOR"
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const user = await api.createStaffAccount(form);
      setSuccess(`${user.name} created successfully as ${user.role.toLowerCase()}.`);
      setForm({ name: "", email: "", password: "", role: "DOCTOR" });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create staff");
    }
  }

  return (
    <div className="page-shell">
      <section className="panel page-heading">
        <div>
          <div className="eyebrow">Administrative Control</div>
          <h2>Provision staff accounts</h2>
          <p>Create doctor and admin accounts securely without public self-registration.</p>
        </div>
      </section>

      <form className="panel" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Full name
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Role
            <select
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
            >
              <option value="DOCTOR">Doctor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
        </div>
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}
        <button className="primary-button" type="submit">
          Create Staff Account
        </button>
      </form>
    </div>
  );
}
