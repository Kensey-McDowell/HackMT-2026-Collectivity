import React, { createContext, useContext, useMemo, useState } from "react";

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [redirectTo, setRedirectTo] = useState(null); // where to go after login

  const api = useMemo(
    () => ({
      authOpen,
      authMode,
      redirectTo,
      openLogin: (path) => {
        setAuthMode("login");
        setRedirectTo(path || null);
        setAuthOpen(true);
      },
      openRegister: (path) => {
        setAuthMode("register");
        setRedirectTo(path || null);
        setAuthOpen(true);
      },
      close: () => setAuthOpen(false),
      clearRedirect: () => setRedirectTo(null),
      setMode: setAuthMode,
    }),
    [authOpen, authMode, redirectTo]
  );

  return <AuthModalContext.Provider value={api}>{children}</AuthModalContext.Provider>;
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used inside <AuthModalProvider>");
  return ctx;
}
