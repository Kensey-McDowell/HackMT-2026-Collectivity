import { useState, useEffect } from "react";
import './profile.css'; // Keep this for your :root variables
import CollectibleCard from '../components/collectibleCard';
import "tailwindcss";


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
    tags: ["Pokemogggggggn", "Pokemogggggggn", "Pokemogggggggn", "Pokemogggggggn", "Pokemogggggggn", "Pokemogggggggn", "Exclusive", "2023", "Collectible", "Digital"]

    
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
  const isOwnProfile = true;

  const [items, setItems] = useState(MOCK_ITEMS); 

  // Eventually, your useEffect will replace this with real data
  useEffect(() => {
    // When the team is ready: 
    // const realData = fetchFromBlockchain();
    // setItems(realData);
  }, []);

  return (
    /* We use 'profile-container' for your global styles, 
       then Tailwind for the layout logic */
    <div className="profile-container p-1 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col items-left gap-4 mb-10 text-center">
        <img 
          src="https://via.placeholder.com/150" 
          alt="Profile" 
          className="w-32 h-32 rounded-full border-4 border-[var(--border-color)] object-cover shadow-md" 
        />
        <h1 className="text-3xl font-bold tracking-tight">username</h1>

        {isOwnProfile ? (
          <button className="px-6 py-2 rounded-full border border-gray-300 hover:bg-gray-50 transition font-medium">
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            {/* Example: Using a custom variable for the background */}
            <button className="px-8 py-2 rounded-full bg-[var(--primary-accent)] text-white font-semibold hover:opacity-90 transition">
              Follow
            </button>
            <button className="px-8 py-2 rounded-full border border-gray-300 font-semibold hover:bg-gray-50 transition">
              Message
            </button>
          </div>
        )}
      </div>

      {/* Collectibles Section */}
      <div className="mt-8">
        <header className="text-xs font-black tracking-[0.3em] text-gray-400 mb-6 uppercase border-b pb-2">
          COLLECTIBLES
        </header>
        
        {/* Grid layout stays in Tailwind because it's easier to manage */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {items.length > 0 ? (
                items.map((item) => (
                    <CollectibleCard key={item.id} item={item} />
                ))
            ) : (
                <p className="text-red-500">No items found in MOCK_ITEMS!</p>
            )}
</div>
      </div>
    </div>
  );
}