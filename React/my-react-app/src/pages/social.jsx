import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { printAllCollectibles } from '../js/testTransaction.js';

import './social.css';

export default function SocialPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadGallery() {
      try {
        setIsLoading(true);
        const blockchainData = await printAllCollectibles();
        // Ensure data is an array before setting state
        setItems(Array.isArray(blockchainData) ? blockchainData : []);
      } catch (error) {
        console.error("Gallery failed to load:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadGallery();
  }, []);

  // Filter logic for the search input
  const filteredItems = items.filter(item => 
    item.collectible_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="social-dashboard-wrapper flex items-center justify-center">
        <div className="social-platform-logo animate-pulse">Syncing Ledger...</div>
      </div>
    );
  }

  return (
    <div className="social-dashboard-wrapper">
      {/* HEADER: Matching your CSS .social-main-nav */}
      <nav className="social-main-nav">
        <h1 className="social-platform-logo">COLLECTIVITY</h1>
        <div className="flex gap-4">
           {/* Navigation placeholders if needed */}
        </div>
      </nav>

      <div className="social-main-content-area">
        {/* LEFT SIDEBAR: Recently Viewed */}
        <aside className="social-sidebar w-64 hidden lg:flex flex-col border-r border-[var(--border-color)]">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 text-[var(--accent-color)]">
            Recently Viewed
          </h2>
          <div className="flex flex-col">
            {items.slice(0, 3).map((item) => (
              <Link key={item.unique_ID} to={`/product/${item.unique_ID}`} className="social-sidebar-image-card group overflow-hidden relative">
                <img 
                  src={`https://placehold.co/200x200/111/c5a367?text=${item.Index}`} 
                  className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-50 transition-all" 
                  alt="Recent"
                />
                <span className="relative z-10 text-[10px] uppercase tracking-widest font-bold text-[var(--text-color)]">
                  Asset #{item.Index}
                </span>
              </Link>
            ))}
          </div>
        </aside>

        {/* CENTER COLUMN: The Scrollable Grid */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="social-scrollable-box">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <Link 
                  key={item.unique_ID} 
                  to={`/product/${item.unique_ID}`} 
                  className="social-image-card relative group overflow-hidden"
                >
                  <img 
                    src={`https://placehold.co/400x400/111/c5a367?text=${item.collectible_name}`} 
                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-80 transition-opacity"
                    alt={item.collectible_name}
                  />
                  <div className="relative z-10 p-4 text-center">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--text-color)] block">
                      {item.collectible_name}
                    </span>
                    <span className="text-[9px] text-[var(--accent-color)] font-mono mt-2 block">
                      {item.price} ETH
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR: Discovery */}
        <aside className="social-sidebar w-80 hidden md:flex flex-col gap-10 border-l border-[var(--border-color)]">
          <h2 className="text-xl font-bold italic tracking-tighter text-[var(--text-color)]">Discovery</h2>
          
          <div className="space-y-8">
            <section>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block opacity-50">Filter By Name</label>
              <input 
                type="text" 
                placeholder="Search ledger..." 
                className="social-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </section>

            <section>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block opacity-50">Category</label>
              <select className="social-search-input cursor-pointer appearance-none">
                <option>All Exhibits</option>
                {[...new Set(items.map(i => i.tag))].map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
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