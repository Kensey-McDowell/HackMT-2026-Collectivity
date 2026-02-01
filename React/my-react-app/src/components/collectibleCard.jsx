import { useNavigate } from 'react-router-dom'; 
import { useState } from 'react';
import './collectibleCard.css'; 

export default function CollectibleCard({ item }) {
  const [isClicked, setIsClicked] = useState(false);
  const navigate = useNavigate(); 

  // POCKETBASE MAPPING: 
  // We use the expanded data from the 'expand' property we fetched in SocialPage
  const categoryName = item?.expand?.category?.name || "Uncategorized";
  const tagsList = item?.expand?.tags || [];

  const handleClick = (e) => {
    if (isClicked) return;
    if (e.target.closest('button')) return; 

    setIsClicked(true);

    setTimeout(() => {
      // Use the PocketBase record ID for navigation
      navigate(`/ProductPage/${item.id}`); 
      setIsClicked(false);
    }, 600); 
  };

  return (
    <article 
      onClick={handleClick}
      className={`card group relative overflow-hidden rounded-md aspect-square w-full border border-[var(--border-color)] bg-[var(--secondary-bg)] shadow-lg transition-all duration-300 cursor-pointer
        ${isClicked ? 'animate-pulse-gold border-[var(--accent-color)] scale-[0.97]' : 'hover:border-[var(--accent-color)] hover:-translate-y-1'}`}
    >
      
      {/* 1. THE IMAGE (Now uses the pre-computed imageUrl from the parent) */}
      <img 
        src={item.imageUrl || "/placeholder.jpg"} 
        alt={item.name} 
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 
          ${isClicked ? 'scale-105 opacity-40 blur-[2px]' : 'group-hover:scale-110'}`} 
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-transparent to-transparent opacity-90" />

      {/* 2. THE HEADER (Bookmark) */}
      <header className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center z-10">
        <button className="hover:scale-110 transition-transform p-1">
          <svg height="18" width="18" fill="var(--accent-color)" viewBox="0 0 24 24">
            <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </button>
      </header>

      {/* 3. THE FOOTER */}
      <footer className="absolute bottom-0 left-0 right-0 p-3 text-[var(--text-color)] z-10">
        <p className={`text-[22px] font-bold tracking-tight truncate leading-none font-serif mb-1 transition-all duration-300 
          ${isClicked ? 'translate-y-[-5px] text-[var(--accent-color)]' : 'text-[var(--text-color)]'}`}>
          {item.name}
        </p>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--accent-color)] opacity-80 mb-3">
          {categoryName}
        </p>

          {/* TAGS SECTION - No more numeric lookups! */}
          <div className="flex flex-wrap gap-1.5">
            {tagsList.slice(0, 4).map((tag, index) => (
              <div key={tag.id} className="relative w-14 h-8">
                <div
                  className={`
                    absolute top-0 left-0 min-w-full w-full h-full 
                    bg-[var(--bg-color)]/80 backdrop-blur-sm text-[var(--accent-color)] text-[8px] 
                    font-bold uppercase rounded-sm border border-[var(--border-color)] 
                    px-1.5 flex items-center justify-center truncate transition-all
                    ${isClicked ? 'opacity-0 scale-50' : 'opacity-100'}
                  `}
                >
                  {tag.name}
                </div>
              </div>
            ))}
          </div>
      </footer>

      {/* 4. THE PULSE CORE */}
      {isClicked && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="w-full h-full bg-[var(--accent-color)]/30 animate-ping" />
          <div className="absolute w-12 h-12 bg-[var(--accent-color)] rounded-full blur-2xl animate-pulse" />
        </div>
      )}
    </article>
  );
}