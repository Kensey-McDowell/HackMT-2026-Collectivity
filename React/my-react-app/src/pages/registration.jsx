import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import "./registration.css";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // login | register

  return (
    <div className="auth-page">
      <div className="auth-card">
        {mode === "login" ? (
          <LoginForm onSwitch={() => setMode("register")} />
        ) : (
          <RegisterForm onSwitch={() => setMode("login")} />
        )}
      </div>
    </div>
  );
}
