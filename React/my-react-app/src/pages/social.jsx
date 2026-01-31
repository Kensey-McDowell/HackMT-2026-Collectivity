import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Ensure react-router-dom is installed
import './social.css';

export default function SocialPage() {
  // Simple state to simulate login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="social-dashboard-wrapper">
      
      {/* --- TOP NAVIGATION --- */}
      <nav className="social-main-nav">
        <div className="w-1/3 invisible lg:visible" />
        
        <div className="w-1/3 text-center">
          <h1 className="social-platform-logo">COLLECTIVITY</h1>
        </div>

        {/* TOP RIGHT: Conditional Profile or Sign In */}
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
              className="px-6 py-2 border border-[var(--accent-color)] text-[var(--accent-color)] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)] transition-all rounded-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* --- MAIN LAYOUT --- */}
      <div className="social-main-content-area">
        
        {/* LEFT SIDEBAR: Recently Viewed (3 Boxes) */}
        <aside className="social-sidebar w-64 hidden lg:flex flex-col border-r border-[var(--border-color)]">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 text-[var(--accent-color)]">
            Recently Viewed
          </h2>
          <div className="flex flex-col">
            {[1, 2, 3].map((i) => (
              <div key={i} className="social-sidebar-image-card">
                <span className="text-[10px] uppercase tracking-widest font-bold">Recent {i}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER COLUMN: Scrollable Image Box */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="social-scrollable-box">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="social-image-card">
                  <span className="text-[10px] uppercase tracking-widest font-bold">Picture {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR: Discovery & Search */}
        <aside className="social-sidebar w-80 hidden md:flex flex-col gap-10 border-l border-[var(--border-color)]">
          <h2 className="text-xl font-bold italic tracking-tighter">Discovery</h2>
          
          <div className="space-y-8">
            <section>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block opacity-50">Filter By Name</label>
              <input type="text" placeholder="Search..." className="social-search-input" />
            </section>

            <section>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block opacity-50">Category</label>
              <select className="social-search-input cursor-pointer appearance-none">
                <option>All Exhibits</option>
                <option>Cinematic</option>
                <option>Modern Architecture</option>
                <option>Noir Photography</option>
              </select>
            </section>

            <section>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-4 block opacity-50">Tags</label>
              <div className="flex flex-wrap gap-2">
                {['#Gold', '#Noir', '#Modern', '#Classic'].map(tag => (
                  <span 
                    key={tag} 
                    className="px-3 py-1 border border-[var(--border-color)] text-[10px] uppercase font-bold cursor-pointer hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)] transition-all"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </aside>

      </div>
    </div>
  );
}
