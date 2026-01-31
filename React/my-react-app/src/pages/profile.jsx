import { useState } from "react";
import './profile.css'; 
// Ensure this path matches where your component file is located
import CollectibleCard from '../components/collectibleCard'; 
import { MOCK_USER, MOCK_ITEMS } from '../js/mockData';

export default function ProfilePage() {
  // Using state ensures that if you add "delete" or "filter" features later, the UI updates
  const [items] = useState(MOCK_ITEMS);
  const [user] = useState(MOCK_USER);
  const isOwnProfile = true;

  const pageStyle = { 
    fontFamily: "'Playfair Display', serif",
    backgroundColor: "var(--bg-color)",
    color: "var(--text-color)"
  };

  return (
    <div style={pageStyle} className="min-h-screen p-4 md:p-8 antialiased">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div 
          className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-16 bg-cover bg-center bg-no-repeat p-6 rounded-md shadow-[0_10px_30px_var(--shadow-color)] border border-[var(--border-color)]"
          style={{ 
            backgroundImage: `linear-gradient(to top, var(--bg-color) 0%, rgba(10, 9, 8, 0.4) 30%), url(${user.profileBannerUrl})` 
          }} 
        >
          <div className="relative">
            <img 
              src={user.profileImageUrl}
              alt="Profile" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-[var(--border-color)] object-cover shadow-[0_10px_30px_var(--shadow-color)]" 
            />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-medium italic tracking-tight mb-4 text-[var(--text-color)] drop-shadow-lg">
              {user.username}
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
              {items.map((item) => (
                  <CollectibleCard key={item.id} item={item} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}