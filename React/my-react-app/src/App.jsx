import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SettingsProvider, useSettings } from "./context/SettingsContext";

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
import ClickSpark from "./components/ClickSpark";

function ThemedApp() {
  const { theme, fontSize } = useSettings();

  return (
    <div className={`theme-${theme} font-${fontSize}`} style={{ minHeight: "100vh" }}>
      <Router>
        <ChatWidget />

        <Routes>
          <Route path="/intro" element={<IntroPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
         
          <Route path="/profile" element={<ProfilePage />} />

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

            <Route
              path="/settings"
              element={
                <ClickSpark>
                  <SettingsPage />
                </ClickSpark>
              }
            />

            <Route path="/admin" element={<AdminPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/productpage" element={<ProductPage />} />
             <Route path="/social" element={<SocialPage />} />
          <Route path="/ProductPage/:itemIndex" element={<ProductPage />} />
            <Route path="/create" element={<CreateCollectible />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <ThemedApp />
    </SettingsProvider>
  );
}