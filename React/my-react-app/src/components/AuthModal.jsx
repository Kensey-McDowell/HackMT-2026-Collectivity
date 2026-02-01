import Modal from "./Modal";
import LoginForm from "../pages/LoginForm.jsx";
import RegisterForm from "../pages/RegisterForm.jsx";

export default function AuthModal({ open, mode, setMode, onClose }) {
  return (
    <Modal open={open} onClose={onClose}>
      {mode === "login" ? (
        <LoginForm
          onSwitch={() => setMode("register")}
          onSuccess={onClose}
        />
      ) : (
        <RegisterForm
          onSwitch={() => setMode("login")}
          onSuccess={onClose}
        />
      )}
    </Modal>
  );
}
