import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import RequireAuth from "./components/RequireAuth";

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

export default function App() {
  return (
    <Router>
      <Routes>
        {/* --- GROUP 1: PUBLIC PAGES (NO HEADER) --- */}
        <Route path="/intro" element={<IntroPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* --- GROUP 2: PAGES WITH GLOBAL HEADER --- */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/social" element={<SocialPage />} />
          <Route path="/productpage" element={<ProductPage />} />
          <Route path="/create" element={<CreateCollectible />} />
        </Route>
      </Routes>
    </Router>
  );
}
