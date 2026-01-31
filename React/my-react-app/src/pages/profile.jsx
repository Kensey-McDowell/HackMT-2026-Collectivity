import { useState, useEffect } from "react";
import './profile.css'; 
import CollectibleCard from '../components/collectibleCard';

const MOCK_USER = {
  id: "user123",
  username: "John",
  profileImageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuQupw8P5ewX8dxMamX8Yit1r8M9nMZ8EZ9g&s",
  profileBannerUrl: "https://i.etsystatic.com/34466454/r/il/5e9775/4175504808/il_fullxfull.4175504808_bdhn.jpg"
};

const MOCK_ITEMS = [
  {
    id: "1",
    name: "Ducky",
    imageUrl: "https://m.media-amazon.com/images/I/511Wd7ip16L._AC_SY300_SX300_QL70_FMwebp_.jpg",
    collectionName: "Genesis Series",
    type: "Weapon",
    tags: ["Pokemon", "MTG", "misc", "Gen1", "Rare", "Limited", "Exclusive", "2023", "Collectible", "Digital"]
  },
  {
    id: "2",
    name: "Toaster Extreme",
    imageUrl: "https://t3.ftcdn.net/jpg/00/81/15/04/360_F_81150471_689xIvD8CrU8DvAZk2NOma9vZhEV9aL5.jpg",
    collectionName: "Apparel",
    type: "Gear",
    tags: ["Pokemon", "MTG", "misc", "Gen1", "Rare", "Limited", "Exclusive", "2023", "Collectible", "Digital"]

  },
  {
    id: "3",
    name: "Picachu",
    imageUrl: "https://www.brickheadscollectables.com/cdn/shop/products/49_hires_72b3a91c-c514-4069-8ced-5753d659b446.png?v=1706758626",
    collectionName: "Genesis Series",
    type: "Defense",
    tags: ["Pokemon", "MTG", "misc", "Gen1", "Rare", "Limited", "Exclusive", "2023", "Collectible", "Digital"]
  },
 
   
];

export default function ProfilePage() {
  const [items, setItems] = useState(MOCK_ITEMS);
  const [user, setUser] = useState(MOCK_USER);
  const isOwnProfile = false;

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
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-16 bg-cover bg-center bg-no-repeat p-6 rounded-md shadow-[0_10px_30px_var(--shadow-color)] border border-[var(--border-color)]/100"
          style={{ 
            backgroundImage: `linear-gradient(to top, var(--bg-color) 0%, rgba(10, 9, 8, 0.4) 30%), url(${user.profileBannerUrl})` 
          }} 
        >
          <div className="relative">
            {/* Using your border color variable */}
            <img 
              src={user.profileImageUrl}
              alt="Profile" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-[var(--border-color)] object-cover shadow-[0_10px_30px_var(--shadow-color)]" 
            />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-medium italic tracking-tight mb-4 text-[var(--text-color)]">
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
            <header className="flex items-center gap-6 text-[11px] font-medium tracking-[0.5em] text-[var(--text-color)]/100 mb-10 uppercase">
              <span className="italic">Collectibles</span>
              <div className="h-[1px] flex-1 bg-[var(--secondary-bg)]"></div>
            </header>
            
            {/* THE GRID CONTAINER */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 
                            gap-4 md:gap-8 
                            p-6 md:p-10    
                            /* Removed the extra solid background line */
                            bg-[var(--secondary-bg)]/30
                            backdrop-blur-sm           
                            border border-[var(--border-color)]/100 
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