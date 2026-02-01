import React, { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import pb from "./lib/pocketbase";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import { AuthModalProvider, useAuthModal } from "./context/AuthModalContext.jsx";

import "./pages/theme.css";

import Layout from "./components/Layout.jsx";
import HomePage from "./pages/home.jsx";
import IntroPage from "./pages/intro.jsx";
import AboutPage from "./pages/about.jsx";
import ProfilePage from "./pages/profile.jsx";
import SettingsPage from "./pages/settings.jsx";
import AdminPage from "./pages/admin.jsx";
import FAQPage from "./pages/FAQ.jsx";
import RegistrationPage from "./pages/registration.jsx";
import SocialPage from "./pages/social.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import CreateCollectible from "./pages/CreateCollectible.jsx";
import ChatWidget from "./ChatWidget.jsx";
import ClickSpark from "./components/ClickSpark.jsx";

function usePocketAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(pb.authStore.isValid);
  const [user, setUser] = useState(pb.authStore.model);

  useEffect(() => {
    setIsLoggedIn(pb.authStore.isValid);
    setUser(pb.authStore.model);

    const unsub = pb.authStore.onChange(() => {
      setIsLoggedIn(pb.authStore.isValid);
      setUser(pb.authStore.model);
    });

    return unsub;
  }, []);

  return { isLoggedIn, user };
}

function RequireAuth({ children }) {
  const location = useLocation();
  const { isLoggedIn } = usePocketAuth();
  const { openLogin } = useAuthModal();

  if (!isLoggedIn) {
    // ✅ pop modal and bounce to a safe background route
    openLogin(location.pathname);
    return <Navigate to="/home" replace />;
  }

  return children;
}

function RequireAdmin({ children }) {
  const location = useLocation();
  const { isLoggedIn, user } = usePocketAuth();
  const { openLogin } = useAuthModal();

  if (!isLoggedIn) {
    openLogin(location.pathname);
    return <Navigate to="/home" replace />;
  }

  const isAdmin = String(user?.role || "").toLowerCase() === "admin";
  if (!isAdmin) return <Navigate to="/home" replace />;

  return children;
}

function ThemedApp() {
  const { theme, fontSize } = useSettings();

  return (
    <div className={`theme-${theme} font-${fontSize}`} style={{ minHeight: "100vh" }}>
      <Router>
        <ChatWidget />

        <Routes>
          {/* Public */}
          <Route path="/intro" element={<IntroPage />} />
          <Route path="/registration" element={<RegistrationPage />} />

          {/* Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />

            <Route
              path="/about"
              element={
                <ClickSpark>
                  <AboutPage />
                </ClickSpark>
              }
            />

            {/* ✅ PROTECTED */}
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              }
            />

            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <ClickSpark>
                    <SettingsPage />
                  </ClickSpark>
                </RequireAuth>
              }
            />

            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminPage />
                </RequireAdmin>
              }
            />

            {/* Public inside layout */}
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/productpage" element={<ProductPage />} />
            <Route path="/social" element={<SocialPage />} />
            <Route path="/ProductPage/:itemIndex" element={<ProductPage />} />
            <Route path="/create" element={<CreateCollectible />} />
          </Route>

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthModalProvider>
        <ThemedApp />
      </AuthModalProvider>
    </SettingsProvider>
  );
}
