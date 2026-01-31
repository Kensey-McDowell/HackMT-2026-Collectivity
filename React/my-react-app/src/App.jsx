import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

// ClickSpark click animation wrapper
import ClickSpark from "./components/ClickSpark";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* --- GROUP 1: PAGES WITHOUT HEADER --- */}
        <Route path="/intro" element={<IntroPage />} />
        <Route path="/registration" element={<RegistrationPage />} />

        {/* --- GROUP 2: PAGES WITH GLOBAL HEADER --- */}
        <Route element={<Layout />}>
          {/* Redirect root to home */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* --- Normal pages --- */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/ProductPage/:itemIndex" element={<ProductPage />} />

          {/* --- Pages with ClickSpark effect --- */}
          <Route
            path="/about"
            element={
              <ClickSpark>
                <AboutPage />
              </ClickSpark>
            }
          />

          <Route
            path="/profile"
            element={
              <ClickSpark>
                <ProfilePage />
              </ClickSpark>
            }
          />

          <Route
            path="/social"
            element={
              <ClickSpark>
                <SocialPage />
              </ClickSpark>
            }
          />

          <Route
            path="/faq"
            element={
              <ClickSpark>
                <FAQPage />
              </ClickSpark>
            }
          />

          <Route
            path="/settings"
            element={
              <ClickSpark>
                <SettingsPage />
              </ClickSpark>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}