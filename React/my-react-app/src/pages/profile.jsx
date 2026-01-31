import { useState, useEffect } from "react";
import './profile.css'; 
import CollectibleCard from '../components/collectibleCard';

const MOCK_USER = {
  id: "user123",
  username: "Ash Ketchum",
  profileImageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuQupw8P5ewX8dxMamX8Yit1r8M9nMZ8EZ9g&s"
};

const MOCK_ITEMS = [
  {
    id: "1",
    name: "Cyber Punk Blade",
    imageUrl: "https://m.media-amazon.com/images/I/511Wd7ip16L._AC_SY300_SX300_QL70_FMwebp_.jpg",
    collectionName: "Genesis Series",
    type: "Weapon",
    tags: ["Pokemon", "MTG", "misc", "Gen1", "Rare", "Limited", "Exclusive", "2023", "Collectible", "Digital"]
  },
  {
    id: "2",
    name: "Neon Visor",
    imageUrl: "https://placehold.co/400x400/444/white?text=Visor",
    collectionName: "Apparel",
    type: "Gear",
    tags: ["Pokemogggggggn", "Exclusive", "2023", "Collectible", "Digital"]
  },
  {
    id: "3",
    name: "Void Shield",
    imageUrl: "https://placehold.co/400x400/666/white?text=Shield",
    collectionName: "Genesis Series",
    type: "Defense",
    tags: ["Pokemon", "MTG", "misc", "Gen1", "Rare", "Limited", "Exclusive", "2023", "Collectible", "Digital"]
  }
];

export default function ProfilePage() {
  const [items, setItems] = useState(MOCK_ITEMS);
  const [user, setUser] = useState(MOCK_USER);
  const isOwnProfile = true;

  // We use your :root variables here
  const pageStyle = { 
    fontFamily: "'Playfair Display', serif",
    backgroundColor: "var(--bg-color)",
    color: "var(--text-color)"
  };

  return (
    <div style={pageStyle} className="min-h-screen p-4 md:p-8 antialiased">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-16">
          <div className="relative">
            {/* Using your border color variable */}
            <img 
              src={user.profileImageUrl}
              alt="Profile" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-[var(--border-color)] object-cover shadow-[0_10px_30px_var(--shadow-color)]" 
            />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-medium italic tracking-tight mb-4 text-[var(--secondary-accent)]">
              {user.username}
            </h1>
            
            <div className="flex justify-center md:justify-start gap-4">
              {isOwnProfile ? (
                <>
                  <button className="px-6 py-2 rounded-sm bg-[var(--accent-color)] text-[var(--bg-color)] text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--hover-color)] transition-colors duration-300">
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
          <header className="flex items-center gap-6 text-[11px] font-medium tracking-[0.5em] text-[var(--border-color)] mb-10 uppercase">
            <span className="italic">Collectibles</span>
            <div className="h-[1px] flex-1 bg-[var(--secondary-bg)]"></div>
          </header>
          
         {/* THE GRID CONTAINER */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 
                            gap-4 md:gap-8 
                            p-6 md:p-10        
                            bg-[var(--secondary-bg)]/30   {/* The /50 sets background opacity to 50% */}
                            backdrop-blur-sm           
                            bg-[var(--secondary-bg)] 
                            border border-[var(--border-color)] 
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