import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './productpage.css';

export default function ProductPage() {
  // Simple state to simulate login status from social.jsx
  const [isLoggedIn] = useState(false);

  return (
    <div className="product-viewport font-sans">
      <nav className="main-nav">
        <div className="w-1/3">
          <Link to="/" className="back-link">
            <span className="arrow">←</span>
            <span className="back-text">Back</span>
          </Link>
        </div>
        
        <div className="w-1/3 text-center">
          {/* Matches social.platform-logo size and text */}
          <h1 className="platform-logo">COLLECTIVITY</h1>
        </div>

        {/* TOP RIGHT: Exactly as seen in social.jsx */}
        <div className="w-1/3 flex justify-end items-center">
          {isLoggedIn ? (
            <div className="flex items-center gap-4 group cursor-pointer">
              <span className="profile-name">Alex Rivera</span>
              <div className="profile-avatar-container">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <Link to="/registration" className="sign-in-btn">
              Sign In
            </Link>
          )}
        </div>
      </nav>

      <div className="product-container">
        <aside className="panel-visuals">
          <div className="visuals-top-stack">
            <div className="hero-image-aligned">
              <div className="flex items-center justify-center h-full w-full uppercase tracking-[0.5em] text-[var(--border-color)] font-bold text-[10px]">
                Asset View
              </div>
            </div>
            <div className="thumb-scroller-aligned">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="thumb-box-aligned flex items-center justify-center uppercase text-[10px] tracking-widest text-[var(--border-color)]">
                  Pic
                </div>
              ))}
            </div>
          </div>

          <div className="info-technical-grid">
            <div className="tech-row">
              <div className="flex flex-col">
                <span className="label-gold-dim">Current Owner</span>
                <span className="tech-value">Alex Rivera</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="label-gold-dim">Asset Status</span>
                <span className="tech-value text-green-400">Available For Sale</span>
              </div>
            </div>
            <div className="tech-row border-b-0">
              <div className="flex flex-col">
                <span className="label-gold-dim">Physical Location</span>
                <span className="tech-value">London Gallery</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="label-gold-dim">Market Value</span>
                <span className="tech-value text-[var(--accent-color)] font-bold">£12,400.00</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="panel-info">
          <header className="product-header">
            <h2 className="product-title">Obsidian Shard</h2>
            <div className="header-meta-row">
              <div className="meta-stack">
                <span className="label-gold">Category</span>
                <span className="category-text">Physical Sculpture</span>
              </div>
              <div className="meta-stack text-right items-end">
                <span className="label-gold">Tags</span>
                <div className="tag-cloud-inline">
                  {['#Handcrafted', '#Marble', '#Unique'].map(tag => (
                    <span key={tag} className="tag-item">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <div className="description-box">
            <span className="label-gold block mb-2">Item Description</span>
            <p className="description-text">
              Hand-carved from rare obsidian deposits, this piece represents a physical anchor to the digital world. 
              The surface features a naturally occurring matte finish that absorbs light, creating a void-like effect.
            </p>
          </div>

          <div className="history-section">
            <span className="label-gold mb-4 block">Transaction History</span>
            <div className="history-scroll-container">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="history-row">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Sale & Transfer</span>
                    <span className="text-[10px] opacity-40 font-mono">0x71C...8241</span>
                  </div>
                  <div className="text-right flex flex-col gap-1">
                    <span className="block text-sm text-[var(--accent-color)] font-bold">£11,200.00</span>
                    <span className="text-[10px] opacity-40">24 OCT 2025</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}