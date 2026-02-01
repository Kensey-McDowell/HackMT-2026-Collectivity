import Modal from "./Modal";
import LoginForm from "../pages/LoginForm.jsx";
import RegisterForm from "../pages/RegisterForm.jsx";

export default function AuthModal({ open, mode, setMode, onClose, onSuccess }) {
  // When auth succeeds:
  // 1) Close modal (UI)
  // 2) Notify parent (so it can redirect if needed)
  const handleSuccess = () => {
    onClose?.();
    onSuccess?.();
  };

  return (
    <Modal open={open} onClose={onClose}>
      {mode === "login" ? (
        <LoginForm
          onSwitch={() => setMode("register")}
          onSuccess={handleSuccess}
        />
      ) : (
        <RegisterForm
          onSwitch={() => setMode("login")}
          onSuccess={handleSuccess}
        />
      )}
    </Modal>
  );
}
