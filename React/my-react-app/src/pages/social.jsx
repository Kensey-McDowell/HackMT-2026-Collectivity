import React, { useState, useEffect } from 'react';
import { data, Link } from 'react-router-dom'; // Ensure react-router-dom is installed
import './social.css';
import { printAllCollectibles } from '../js/testTransaction.js';
import CollectibleCard from '../components/collectibleCard'; 


export default function SocialPage() {
  // Simple state to simulate login status
  const [isLoggedIn] = useState(false);
  const [collectibles, setCollectibles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await printAllCollectibles();

      //console.log(data)
      setCollectibles(data);
      setIsLoading(false);
    }
    
    fetchData();
    
  }, 
  
  []);

 
  
 
  return (
    <div className="social-dashboard-wrapper">
      
      {/* --- TOP NAVIGATION --- */}
     

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

       {/* CENTER COLUMN: Use your actual collectibles state */}
<main className="flex-1 flex flex-col overflow-hidden">
  <div className="social-scrollable-box">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {/* If loading, show a status, otherwise map the data */}
      {isLoading ? (
        <div className="text-[var(--accent-color)] uppercase tracking-widest text-xs">Syncing Ledger...</div>
      ) : (
        collectibles.map((item, i) => (
          <CollectibleCard key={item} item={item} />
        ))
      )}
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