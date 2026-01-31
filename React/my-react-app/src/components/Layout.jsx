import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import '../pages/social.css'; 

export default function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Define paths where the "Back" button should NOT show (e.g., the main feed)
  const isMainPage = location.pathname === '/' || location.pathname === '/social';

  return (
    <div className="social-dashboard-wrapper">
      
      {/* --- GLOBAL TOP NAVIGATION --- */}
      <nav className="social-main-nav">
        
        {/* LEFT SLOT: Contextual Back Button */}
        <div className="w-1/3 flex items-center">
          {!isMainPage ? (
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-[var(--accent-color)] uppercase tracking-[0.3em] text-[10px] font-bold group bg-transparent border-none cursor-pointer"
            >
              <span className="text-lg mr-2 transition-transform group-hover:-translate-x-1">←</span>
              <span>Back</span>
            </button>
          ) : (
            <div className="invisible lg:visible" />
          )}
        </div>
        
        <div className="w-1/3 text-center">
          <h1 className="social-platform-logo">COLLECTIVITY</h1>
        </div>

        <div className="w-1/3 flex justify-end items-center">
          {isLoggedIn ? (
            <div className="flex items-center gap-4 group cursor-pointer">
              <span className="text-sm font-bold tracking-widest uppercase text-[var(--text-color)] group-hover:text-[var(--accent-color)] transition-colors">
                Alex Rivera
              </span>
              <div className="w-12 h-12 rounded-full border-2 border-[var(--border-color)] overflow-hidden shrink-0 transition-all group-hover:border-[var(--accent-color)]">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <Link 
              to="/registration" 
              className="px-10 py-3 border border-[var(--accent-color)] text-[var(--accent-color)] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)] transition-all rounded-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* --- CONTENT AREA --- */}
      <div className="social-main-content-area">
        <Outlet />
      </div>
    </div>
  );
}