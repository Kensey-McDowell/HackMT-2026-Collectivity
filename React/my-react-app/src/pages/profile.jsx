import { useState, useEffect } from "react";
import './profile.css';
import CollectibleCard from '../components/collectibleCard';
import { printAllCollectibles } from '../js/testTransaction.js';
import pb from '../lib/pocketbase';

const PLACEHOLDER_AVATAR = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuQupw8P5ewX8dxMamX8Yit1r8M9nMZ8EZ9g&s';
const PLACEHOLDER_BANNER = 'https://i.etsystatic.com/34466454/r/il/5e9775/4175504808/il_fullxfull.4175504808_bdhn.jpg';

export default function ProfilePage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = pb.authStore.model;
  const isOwnProfile = !!user;

  useEffect(() => {
    async function loadCollectibles() {
      try {
        setIsLoading(true);
        const raw = await printAllCollectibles();
        const normalized = (raw || []).map((c) => ({
          ...c,
          imageUrl: c.imageUrl || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800',
          collectionName: c.collectionName ?? 'On-chain',
          tags: c.tags ?? (c.tag != null ? [String(c.tag)] : []),
          collectable: c.collectable ?? c.collectible_name,
        }));
        setItems(normalized);
      } catch (err) {
        console.error('Failed to load collectibles:', err);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadCollectibles();
  }, []);

  const pageStyle = {
    fontFamily: "'Playfair Display', serif",
    backgroundColor: "var(--bg-color)",
    color: "var(--text-color)"
  };

  if (isLoading) {
    return (
      <div style={pageStyle} className="min-h-screen p-4 md:p-8 antialiased flex items-center justify-center">
        <p className="text-[var(--text-color)] opacity-80">Loading collectibles…</p>
      </div>
    );
  }

  return (
    <div style={pageStyle} className="min-h-screen p-4 md:p-8 antialiased">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div 
          className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-16 bg-cover bg-center bg-no-repeat p-6 rounded-md shadow-[0_10px_30px_var(--shadow-color)] border border-[var(--border-color)]"
          style={{
            backgroundImage: `linear-gradient(to top, var(--bg-color) 0%, rgba(10, 9, 8, 0.4) 30%), url(${user?.profileBannerUrl || user?.banner || PLACEHOLDER_BANNER})`
          }} 
        >
          <div className="relative">
            <img
              src={user?.profileImageUrl || (user?.avatar ? pb.files.getUrl(user, user.avatar) : null) || PLACEHOLDER_AVATAR}
              alt="Profile"
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-[var(--border-color)] object-cover shadow-[0_10px_30px_var(--shadow-color)]"
            />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-medium italic tracking-tight mb-4 text-[var(--text-color)] drop-shadow-lg">
              {user?.username ?? user?.name ?? 'Profile'}
            </h1>
            
            <div className="flex justify-center md:justify-start gap-4">
              {isOwnProfile ? (
                <>
                  <button className="px-6 py-2 rounded-sm bg-[var(--accent-color)] text-[var(--bg-color)] text-[11px] font-bold uppercase tracking-widest hover:brightness-110 transition-all duration-300">
                    Edit Profile
                  </button>
                  <button className="px-7 py-2 rounded-sm border border-[var(--border-color)] text-[var(--text-color)] text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--secondary-bg)] transition-all duration-300">
                    Import
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
            <span className="italic">Collectibles</span>
            <div className="h-[1px] flex-1 bg-[var(--border-color)]/20"></div>
          </header>
          
          {/* THE GRID CONTAINER (The "Tray") */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 
                          gap-4 md:gap-8 
                          p-6 md:p-10    
                          bg-[var(--secondary-bg)]/30
                          backdrop-blur-sm           
                          border border-[var(--border-color)]/50 
                          rounded-md shadow-inner">     
              {items.map((item, index) => (
                <CollectibleCard key={item.index ?? item.id ?? index} item={item} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}