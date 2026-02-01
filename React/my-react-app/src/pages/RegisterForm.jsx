import { useState } from "react";
import pb from "../lib/pocketbase";

export default function RegisterForm({ onSwitch }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Create user in PocketBase
      await pb.collection("users").create({
        email: form.email,
        password: form.password,
        passwordConfirm: form.confirmPassword,
        name: form.name,
  
      });

      // 2️⃣ Auto-login after signup
      await pb.collection("users").authWithPassword(
        form.email,
        form.password
      );

      console.log("User created:", pb.authStore.model);
      console.log("Auth valid:", pb.authStore.isValid);

      // TODO: redirect to dashboard
    } catch (err) {
      console.error(err);
      setError("Account creation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="auth-title">Create your account</h1>

      <form className="auth-form" onSubmit={handleRegister}>
        <div className="auth-field">
          <label>Name</label>
          <input
            className="auth-input"
            name="name"
            value={form.name}
            onChange={update}
            required
          />
        </div>

        <div className="auth-field">
          <label>Email</label>
          <input
            className="auth-input"
            type="email"
            name="email"
            value={form.email}
            onChange={update}
            required
          />
        </div>

        

        

        <div className="auth-field">
          <label>Password</label>
          <input
            className="auth-input"
            type="password"
            name="password"
            value={form.password}
            onChange={update}
            required
          />
        </div>

        <div className="auth-field">
          <label>Confirm Password</label>
          <input
            className="auth-input"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={update}
            required
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button className="auth-button" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account?{" "}
        <button type="button" className="auth-link" onClick={onSwitch}>
          Back to Log In
        </button>
      </p>
    </>
  );
}
