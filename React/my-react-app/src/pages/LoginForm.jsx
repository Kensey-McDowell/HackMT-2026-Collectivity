import { useState } from "react";
import pb from "../lib/pocketbase";

export default function LoginForm({ onSwitch, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // ✅ Authenticate
      await pb.collection("users").authWithPassword(email, password);

      console.log("AUTH VALID:", pb.authStore.isValid);
      console.log("USER:", pb.authStore.model);

      // ✅ CLOSE MODAL ON SUCCESS
      onSuccess?.();

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="auth-title">Log In</h1>

      <form className="auth-form" onSubmit={handleLogin}>
        <div className="auth-field">
          <label>Email Address</label>
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <label>Password</label>
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button className="auth-button" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p className="auth-footer">
        Don’t have an account?{" "}
        <button className="auth-link" type="button" onClick={onSwitch}>
          Sign Up
        </button>
      </p>
    </>
  );
}
