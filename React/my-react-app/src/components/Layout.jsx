import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import pb from "../lib/pocketbase";
import "../pages/social.css";
import "../pages/accountDropdown.css";
import AuthModal from "../components/AuthModal.jsx";
import { useAuthModal } from "../context/AuthModalContext.jsx";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [open, setOpen] = useState(false);

  // ✅ global auth modal state
  const { authOpen, authMode, setMode, close, redirectTo, clearRedirect, openLogin } = useAuthModal();

  // 🔐 REACTIVE AUTH STATE
  const [user, setUser] = useState(pb.authStore.model);
  const [isLoggedIn, setIsLoggedIn] = useState(pb.authStore.isValid);

  // ✅ ADMIN CHECK (USER ROLE)
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  const isMainPage = location.pathname === "/" || location.pathname === "/social";

  // subscribe to auth changes
  useEffect(() => {
    setUser(pb.authStore.model);
    setIsLoggedIn(pb.authStore.isValid);

    const unsubscribe = pb.authStore.onChange(() => {
      setUser(pb.authStore.model);
      setIsLoggedIn(pb.authStore.isValid);
    });

    return unsubscribe;
  }, []);

  // ✅ after login, go to the protected page they tried to hit
  const handleAuthSuccess = () => {
    close();

    if (redirectTo) {
      navigate(redirectTo);
      clearRedirect();
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    setOpen(false);
    navigate("/");
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatarUrl = user ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}` : "";

  return (
    <div className="social-dashboard-wrapper">
      <nav className="social-main-nav">
        {/* LEFT */}
        <div className="w-1/3 flex items-center">
          {!isMainPage && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-[var(--accent-color)] uppercase tracking-[0.3em] text-[10px] font-bold group bg-transparent border-none cursor-pointer"
            >
              <span className="text-lg mr-2 group-hover:-translate-x-1 transition-transform">←</span>
              Back
            </button>
          )}
        </div>

        {/* CENTER */}
        <div className="w-1/3 text-center">
          <h1 className="social-platform-logo" onClick={() => navigate("/social")} style={{cursor: 'pointer'}}>
            COLLECTIVITY
          </h1>
        </div>

        {/* RIGHT */}
        <div className="w-1/3 flex justify-end items-center relative">
          {!isLoggedIn ? (
            <div className="flex gap-4">
              <button
                onClick={() => openLogin(location.pathname)}
                className="px-10 py-3 border border-[var(--accent-color)] text-[var(--accent-color)] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)] transition-all rounded-sm"
              >
                Sign In
              </button>
            </div>
          ) : (
            <div ref={dropdownRef} className="relative">
              {/* PROFILE BUTTON */}
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 cursor-pointer group"
                type="button"
              >
                <span className="text-sm font-bold tracking-widest uppercase text-[var(--text-color)] group-hover:text-[var(--accent-color)] transition-colors">
                  {user?.username}
                </span>

                <div className="w-11 h-11 rounded-full border-2 border-[var(--border-color)] overflow-hidden transition-all group-hover:border-[var(--accent-color)]">
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                </div>
              </button>

              {/* DROPDOWN */}
              {open && (
                <div className="absolute right-0 mt-4 z-50">
                  <div className="account-menu">
                    <button
                      className="account-item"
                      onClick={() => {
                        setOpen(false);
                        // DYNAMIC CHANGE: Navigate to the specific user ID
                        navigate(`/profile/`);
                      }}
                    >
                      Account
                    </button>

                    <button
                      className="account-item"
                      onClick={() => {
                        setOpen(false);
                        navigate("/settings");
                      }}
                    >
                      Settings
                    </button>

                    {/* ✅ ADMIN (ONLY IF ROLE === ADMIN) */}
                    {isAdmin && (
                      <button
                        className="account-item"
                        onClick={() => {
                          setOpen(false);
                          navigate("/admin");
                        }}
                      >
                        Admin
                      </button>
                    )}

                    <button className="account-item account-item-logout" onClick={handleLogout}>
                      Logout
                    </button>

                    <div className="glider-container">
                      <div className="glider" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="social-main-content-area">
        <Outlet />
      </div>

      {/* ✅ GLOBAL AUTH MODAL */}
      <AuthModal
        open={authOpen}
        mode={authMode}
        setMode={setMode}
        onClose={close}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}