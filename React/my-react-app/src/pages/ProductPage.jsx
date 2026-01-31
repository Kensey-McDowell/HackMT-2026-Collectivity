import React from 'react';
import '../pages/ProductPage.css';

export default function ProductPage() {
  // We no longer need local isLoggedIn state here as the Header is in the Layout
  
  return (
    <>
      <div className="product-container">
        {/* LEFT PANEL: Visuals & Technicals */}
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

        {/* RIGHT PANEL: Info & History */}
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
    </>
  );
}