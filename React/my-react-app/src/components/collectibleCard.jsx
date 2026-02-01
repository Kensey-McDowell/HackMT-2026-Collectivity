import { useNavigate } from 'react-router-dom'; 
import { useState } from 'react';
import './collectibleCard.css'; 

export default function CollectibleCard({ item }) {
  const categoryLabel = item?.expand?.category?.name || "Uncategorized";
  const displayTags = item?.expand?.tags || [];

  const [isClicked, setIsClicked] = useState(false);
  const navigate = useNavigate(); 

  const handleClick = (e) => {
    if (isClicked) return;
    if (e.target.closest('button')) return; 

    setIsClicked(true);

    setTimeout(() => {
      // NAVIGATION UPDATE: Use the internal PocketBase ID
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
      <img 
        src={item.imageUrl || "https://cdn.pixabay.com/photo/2018/11/19/05/53/animal-3824672_640.jpg"} 
        alt={item.collectible_name} 
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 
          ${isClicked ? 'scale-105 opacity-40 blur-[2px]' : 'group-hover:scale-110'}`} 
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-transparent to-transparent opacity-90" />

      <header className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center z-10">
        <button className="hover:scale-110 transition-transform p-1">
          <svg height="18" width="18" fill="var(--accent-color)" viewBox="0 0 24 24">
            <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </button>
      </header>

      <footer className="absolute bottom-0 left-0 right-0 p-3 text-[var(--text-color)] z-10">
        <p className={`text-[22px] font-bold tracking-tight truncate leading-none font-serif mb-1 transition-all duration-300 
          ${isClicked ? 'translate-y-[-5px] text-[var(--accent-color)]' : 'text-[var(--text-color)]'}`}>
          {item.collectible_name}
        </p>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--accent-color)] opacity-80 mb-3">
          {categoryLabel}
        </p>

          <div className="flex flex-wrap gap-1.5">
            {displayTags.slice(0, 8).map((tag, index) => {
              return (
                <div 
                  key={tag.id || index} 
                  className={`relative w-14 h-8 ${index >= 4 ? 'hidden group-hover:block' : 'block'}`}
                >
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
              );
            })}
          </div>
      </footer>

      {isClicked && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="w-full h-full bg-[var(--accent-color)]/30 animate-ping" />
          <div className="absolute w-12 h-12 bg-[var(--accent-color)] rounded-full blur-2xl animate-pulse" />
        </div>
      )}
    </article>
  );
}