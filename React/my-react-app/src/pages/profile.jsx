import React, { useState, useEffect } from "react";
import { printAllCollectibles } from '../js/testTransaction.js';
import CollectibleCard from '../components/collectibleCard';
import pb from '../lib/pocketbase';
import './profile.css';
import { UI_TAG_MAP } from '../js/tags';

const PB_COLLECTABLES = 'collectables'; 


export default function ProfilePage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  
  const user = {
    username: "joe",
    profileImageUrl: "https://placehold.co/400x400/111/c5a367?text=AV",
    profileBannerUrl: "https://i.etsystatic.com/34466454/r/il/5e9775/4175504808/il_fullxfull.4175504808_bdhn.jpg",
    address: "0x71C...8001" 
  };

  const isOwnProfile = true; // Hardcoded for now

  useEffect(() => {
    async function loadUserInventory() {
      try {
        setIsLoading(true);
        const data = await printAllCollectibles();
        const allItems = Array.isArray(data) ? data : [];
        // Same as social page: GET PocketBase row per unique_id and set card image
        for (const item of allItems) {
          const uniqueId = item.unique_ID != null ? String(item.unique_ID) : '';
          if (!uniqueId) continue;
          try {
            const row = await pb.collection(PB_COLLECTABLES).getFirstListItem(`unique_id = "${uniqueId.replace(/"/g, '\\"')}"`);
            if (row?.images?.length) {
              item.imageUrl = pb.files.getUrl(row, row.images[0]);
            }
          } catch (_) {
            // no row for this unique_id
          }
        }
        // FILTER: Only show items where the current user is the 'ownership' address (or all for testing)
        setItems(allItems);
      } catch (error) {
        console.error("Failed to load inventory:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadUserInventory();
  }, []);

  const pageStyle = { 
    fontFamily: "'Playfair Display', serif",
    backgroundColor: "var(--bg-color)",
    color: "var(--text-color)"
  };

  if (isLoading) {
    return (
      <div style={pageStyle} className="min-h-screen flex items-center justify-center uppercase tracking-[0.5em]">
        Retrieving Personal Ledger...
      </div>
    );
  }

  return (
    <div style={pageStyle} className="min-h-screen p-4 md:p-8 antialiased">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div 
          className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-16 bg-cover bg-center bg-no-repeat p-10 rounded-md shadow-[0_10px_30px_var(--shadow-color)] border border-[var(--border-color)]"
          style={{ 
            backgroundImage: `linear-gradient(to top, var(--bg-color) 0%, rgba(10, 9, 8, 0.4) 30%), url(${user.profileBannerUrl})` 
          }} 
        >
          <div className="relative">
            <img 
              src={user.profileImageUrl}
              alt="Profile" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-[var(--accent-color)] object-cover shadow-[0_10px_30px_var(--shadow-color)]" 
            />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <span className="text-[10x] uppercase tracking-[0.4em] opacity-50 block mb-2">Authenticated Collector</span>
            <h1 className="text-5xl md:text-6xl font-medium italic tracking-tight mb-6 text-[var(--text-color)] drop-shadow-lg">
              {user.username}
            </h1>
            
            <div className="flex justify-center md:justify-start gap-4">
              {isOwnProfile ? (
                <>
                  <button className="px-6 py-2 rounded-sm bg-[var(--accent-color)] text-[var(--bg-color)] text-[11px] font-bold uppercase tracking-widest hover:brightness-110 transition-all duration-300">
                    Edit Profile
                  </button>
                  <button className="px-7 py-2 rounded-sm border border-[var(--border-color)] text-[var(--text-color)] text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--secondary-bg)] transition-all duration-300">
                    Import Asset
                  </button>
                </>
              ) : (
                <button className="px-10 py-2 rounded-sm bg-[var(--accent-color)] text-[var(--bg-color)] text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-all">
                  Follow
                </button>
              )}
            </div>
          </div>
        </div>

        {/* COLLECTIBLES SECTION */}
        <div className="mt-12">
          <header className="flex items-center gap-6 text-[11px] font-medium tracking-[0.5em] text-[var(--text-color)] mb-10 uppercase opacity-80">
            <span className="italic">Collection Inventory</span>
            <div className="h-[1px] flex-1 bg-[var(--border-color)]/20"></div>
            <span className="opacity-40">{items.length} Assets</span>
          </header>
          
          {/* THE GRID CONTAINER */}
          {items.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 
                            gap-4 md:gap-8 
                            p-6 md:p-10     
                            bg-[var(--secondary-bg)]/30
                            backdrop-blur-sm           
                            border border-[var(--border-color)]/50 
                            rounded-md shadow-inner">     
                {items.map((item) => (
                    /* Note: Ensure unique_ID is used as the key for blockchain items */
                    <CollectibleCard key={item.unique_ID} item={item} />
                ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-[var(--border-color)] opacity-40">
              <p className="uppercase tracking-widest text-xs">No assets found in this ledger.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}