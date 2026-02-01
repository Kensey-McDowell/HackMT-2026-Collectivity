import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; 
import { printAllCollectibles } from '../js/testTransaction.js';
import CollectibleCard from '../components/collectibleCard';
import pb from '../lib/pocketbase';
import './profile.css';

const PB_COLLECTABLES = 'collectables'; 

export default function ProfilePage() {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = pb.authStore.isValid && pb.authStore.model.id === userId;

  useEffect(() => {
    // 1. Create an AbortController or just disable auto-cancel in PB
    async function fetchProfileAndInventory() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Disable auto-cancellation for this specific request
        const userRecord = await pb.collection('users').getOne(userId, {
          $autoCancel: false 
        });
        
        const userData = {
          name: userRecord.name || "Anonymous Collector",
          email: userRecord.email,
          profileImageUrl: userRecord.avatar 
            ? pb.files.getURL(userRecord, userRecord.avatar) // Updated to getURL
            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${userRecord.id}`,
          profileBannerUrl: userRecord.banner 
            ? pb.files.getURL(userRecord, userRecord.banner) // Updated to getURL
            : "https://i.etsystatic.com/34466454/r/il/5e9775/4175504808/il_fullxfull.4175504808_bdhn.jpg",
          address: userRecord.wallet_address || "" 
        };
        setProfileData(userData);

        // 2. Fetch Blockchain Inventory
        const data = await printAllCollectibles();
        const allItems = Array.isArray(data) ? data : [];
        
        // 3. Filter by wallet address
        let userItems = allItems;
        if (userData.address) {
            userItems = allItems.filter(item => 
              item.ownership?.toLowerCase() === userData.address?.toLowerCase()
            );
        }

        // 4. Attach metadata images
        for (const item of userItems) {
          const uniqueId = item.unique_ID != null ? String(item.unique_ID) : '';
          if (!uniqueId) continue;
          try {
            // Disable auto-cancel here too since we're in a loop
            const row = await pb.collection(PB_COLLECTABLES).getFirstListItem(`unique_id = "${uniqueId}"`, {
              $autoCancel: false
            });
            if (row?.images?.length) {
              item.imageUrl = pb.files.getURL(row, row.images[0]); // Updated to getURL
            }
          } catch (_) { /* Metadata not found */ }
        }

        setItems(userItems);
      } catch (err) {
        // Only set error if it's NOT an auto-cancel error
        if (err.name !== 'ClientResponseError' || err.isAbort === false) {
            console.error("Profile load error:", err);
            setError(`Collector not found. Error: ${err.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
        fetchProfileAndInventory();
    }
  }, [userId]);

  const pageStyle = { 
    fontFamily: "'Playfair Display', serif",
    backgroundColor: "var(--bg-color)",
    color: "var(--text-color)"
  };

  if (isLoading) return (
    <div style={pageStyle} className="min-h-screen flex items-center justify-center uppercase tracking-[0.5em]">
      Scanning Blockchain Registry...
    </div>
  );

  if (error) return (
    <div style={pageStyle} className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="uppercase tracking-[0.2em] opacity-50 text-sm">Registry Error</div>
      <div className="text-xl italic">{error}</div>
    </div>
  );

  // Fallback if data hasn't loaded yet
  if (!profileData) return null;

  return (
    <div style={pageStyle} className="min-h-screen p-4 md:p-8 antialiased">
      <div className="max-w-7xl mx-auto">
        <div 
          className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-16 bg-cover bg-center bg-no-repeat p-10 rounded-md shadow-2xl border border-[var(--border-color)]"
          style={{ 
            backgroundImage: `linear-gradient(to top, var(--bg-color) 0%, rgba(10, 9, 8, 0.4) 30%), url(${profileData.profileBannerUrl})` 
          }} 
        >
          <div className="relative">
            <img 
              src={profileData.profileImageUrl}
              alt="Profile" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-[var(--accent-color)] object-cover shadow-2xl bg-[var(--bg-color)]" 
            />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <span className="text-[10x] uppercase tracking-[0.4em] opacity-50 block mb-2">Collector Signature</span>
            <h1 className="text-5xl md:text-6xl font-medium italic tracking-tight mb-6 text-[var(--text-color)] drop-shadow-lg">
              {profileData.name}
            </h1>
            
            <div className="flex justify-center md:justify-start gap-4">
              {isOwnProfile ? (
                  <a href="/settings" className="px-7 py-2 rounded-sm border border-[var(--border-color)] text-[var(--text-color)] text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--secondary-bg)] transition-all duration-300">
                    Edit Profile
                  </a>
              ) : (
                <button className="px-10 py-2 rounded-sm bg-[var(--accent-color)] text-[var(--bg-color)] text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-all">
                  Follow
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <header className="flex items-center gap-6 text-[11px] font-medium tracking-[0.5em] text-[var(--text-color)] mb-10 uppercase opacity-80">
            <span className="italic">Inventory</span>
            <div className="h-[1px] flex-1 bg-[var(--border-color)]/20"></div>
            <span className="opacity-40">{items.length} Assets</span>
          </header>
          
          {items.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-8 p-6 md:p-10 bg-[var(--secondary-bg)]/30 backdrop-blur-sm border border-[var(--border-color)]/50 rounded-md shadow-inner">     
                {items.map((item) => (
                    <CollectibleCard key={item.unique_ID} item={item} />
                ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-[var(--border-color)] opacity-40 rounded-md">
              <p className="uppercase tracking-widest text-xs">No assets detected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}