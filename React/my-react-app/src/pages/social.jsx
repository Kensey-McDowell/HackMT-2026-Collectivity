import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import './social.css';
import { printAllCollectibles } from '../js/testTransaction.js';
import CollectibleCard from '../components/collectibleCard'; 
import { UI_TAG_MAP } from '../js/tags'; 

export default function SocialPage() {
  const location = useLocation();
  const [collectibles, setCollectibles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);

  // Catch the tag from ProductPage navigation state
  useEffect(() => {
    if (location.state?.filterTag) {
      setSelectedTag(location.state.filterTag);
      // Clear state so it doesn't re-filter on manual refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Fetch Blockchain Data
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await printAllCollectibles();
        setCollectibles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch collectibles:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredItems = collectibles.filter(item => {
    const matchesSearch = item.collectible_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const activeTagID = selectedTag ? UI_TAG_MAP[selectedTag] : null;
    const matchesTag = activeTagID ? Number(item.tag) === activeTagID : true;
    return matchesSearch && matchesTag;
  });

  const handleTagSelect = (tag) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  return (
    <div className="social-dashboard-wrapper">
      <div className="social-main-content-area">
        
        {/* LEFT SIDEBAR: Recently Viewed */}
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

        {/* CENTER COLUMN */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="social-scrollable-box">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {isLoading ? (
                <div className="text-[var(--accent-color)] uppercase tracking-widest text-xs">Syncing Ledger...</div>
              ) : (
                filteredItems.map((item) => (
                  <Link 
                    key={item.unique_ID || item.index} 
                    to={`/product/${item.index}`}
                    className="transform transition-transform duration-300 hover:scale-105 active:scale-95"
                  >
                    <CollectibleCard item={item} />
                  </Link>
                ))
              )}
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR: Discovery & Search */}
        <aside className="social-sidebar w-80 hidden md:flex flex-col gap-10 border-l border-[var(--border-color)]">
          <h2 className="text-xl font-bold italic tracking-tighter text-[var(--text-color)]">Discovery</h2>
          
          <div className="space-y-8">
            <section>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block opacity-50">Filter By Name</label>
              <input 
                type="text" 
                placeholder="Search..." 
                className="social-search-input" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                {/* Dynamically render from your MAP to ensure they always match */}
                {Object.keys(UI_TAG_MAP).map(tag => (
                  <button 
                    onClick={() => handleTagSelect(tag)}
                    key={tag} 
                    className={`px-3 py-1 border text-[10px] uppercase font-bold transition-all duration-300 
                      ${selectedTag === tag 
                        ? 'bg-[var(--accent-color)] text-[var(--bg-color)] border-[var(--accent-color)] scale-110 shadow-lg' 
                        : 'border-[var(--border-color)] text-[var(--text-color)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]'
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}