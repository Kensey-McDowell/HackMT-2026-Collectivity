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

// ClickSpark import for the click sparkle animation
import ClickSpark from "./components/ClickSpark";

export default function App() {
  // Define the theme accent color here so we can pass it properly to ClickSpark
  const accentColor = "#c5a367"; // Matches your --accent-color CSS variable

  return (
    <Router>
      <Routes>
        {/* --- GROUP 1: PAGES WITHOUT GLOBAL HEADER --- */}
        <Route path="/intro" element={<IntroPage />} />
        <Route path="/registration" element={<RegistrationPage />} />

        {/* --- GROUP 2: PAGES WITH GLOBAL HEADER --- */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />

          {/* Wrapped pages with ClickSpark for interactive spark effect */}
          <Route
            path="/about"
            element={
              <ClickSpark sparkColor={accentColor}>
                <AboutPage />
              </ClickSpark>
            }
          />
          <Route
            path="/profile"
            element={
              <ClickSpark sparkColor={accentColor}>
                <ProfilePage />
              </ClickSpark>
            }
          />
          <Route
            path="/social"
            element={
              <ClickSpark sparkColor={accentColor}>
                <SocialPage />
              </ClickSpark>
            }
          />
          <Route
            path="/faq"
            element={
              <ClickSpark sparkColor={accentColor}>
                <FAQPage />
              </ClickSpark>
            }
          />
          <Route
            path="/settings"
            element={
              <ClickSpark sparkColor={accentColor}>
                <SettingsPage />
              </ClickSpark>
            }
          />

          {/* Pages without ClickSpark effect */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/productpage" element={<ProductPage />} />
        </Route>
      </Routes>
    </Router>
  );
}