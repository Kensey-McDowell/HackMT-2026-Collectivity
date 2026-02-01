import { useNavigate, useParams, useLocation } from 'react-router-dom'; 
import { useState } from 'react';
import './collectibleCard.css'; 
import pb from '../lib/pocketbase';

export default function CollectibleCard({ item }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: urlProfileId } = useParams(); 
  const [isClicked, setIsClicked] = useState(false);

  // Data Parsing
  const categoryLabel = item?.expand?.category?.name || "Uncategorized";
  const displayTags = item?.expand?.tags || [];
  const currentUser = pb.authStore.model;

  // LOGIC CHECK: 
  // 1. Is the logged-in user the creator of this specific card?
  const isOwnerOfItem = currentUser && item.created_by === currentUser.id;
  
  // 2. Is the ID in the URL the same as the logged-in user?
  // We check both the param and the pathname just in case
  const isViewingOwnProfile = currentUser && (urlProfileId === currentUser.id || location.pathname.includes(currentUser.id));
  
  const canEdit = isOwnerOfItem && isViewingOwnProfile;

  // Debugging - Remove these once it works!
  /*
  console.log('--- Edit Logic Check ---');
  console.log('Item Name:', item.collectible_name);
  console.log('Logged in User ID:', currentUser?.id);
  console.log('Item Creator ID:', item.created_by);
  console.log('ID from URL:', urlProfileId);
  console.log('Can Edit:', canEdit);
  */

  const handleClick = (e) => {
    if (isClicked) return;
    if (e.target.closest('button')) return; 

    setIsClicked(true);
    setTimeout(() => {
      navigate(`/ProductPage/${item.id}`); 
      setIsClicked(false);
    }, 600); 
  };

  const handleEdit = (e) => {
    e.stopPropagation(); 
    navigate(`/edit/${item.id}`);
  };

  return (
    <article 
      onClick={handleClick}
      className={`card group relative overflow-hidden rounded-md aspect-square w-full border border-[var(--border-color)] bg-[var(--secondary-bg)] shadow-lg transition-all duration-300 cursor-pointer
        ${isClicked ? 'animate-pulse-gold border-[var(--accent-color)] scale-[0.97]' : 'hover:border-[var(--accent-color)] hover:-translate-y-1'}`}
    >
      
      {/* IMAGE */}
      <img 
        src={item.imageUrl || "https://cdn.pixabay.com/photo/2018/11/19/05/53/animal-3824672_640.jpg"} 
        alt={item.collectible_name} 
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 
          ${isClicked ? 'scale-105 opacity-40 blur-[2px]' : 'group-hover:scale-110'}`} 
      />

      {/* DROP-DOWN EDIT BOX - Ensure 'group-hover' matches the article class */}
      {canEdit && (
        <div className="absolute top-0 left-0 right-0 flex justify-center transition-all duration-300 -translate-y-full group-hover:translate-y-3 z-30">
          <button 
            type="button"
            onClick={handleEdit}
            className="bg-[var(--accent-color)] text-[var(--bg-color)] text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-sm shadow-2xl border border-white/20 hover:bg-white transition-all active:scale-95"
          >
            Edit Asset
          </button>
        </div>
      )}

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-transparent to-transparent opacity-90" />

      {/* HEADER (Bookmark) */}
      <header className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center z-10">
        <button className="hover:scale-110 transition-transform p-1">
          <svg height="18" width="18" fill="var(--accent-color)" viewBox="0 0 24 24">
            <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </button>
      </header>

      {/* FOOTER */}
      <footer className="absolute bottom-0 left-0 right-0 p-3 text-[var(--text-color)] z-10">
        <p className={`text-[22px] font-bold tracking-tight truncate leading-none font-serif mb-1 transition-all duration-300 
          ${isClicked ? 'translate-y-[-5px] text-[var(--accent-color)]' : 'text-[var(--text-color)]'}`}>
          {item.collectible_name}
        </p>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--accent-color)] opacity-80 mb-3">
          {categoryLabel}
        </p>

        {/* TAGS */}
        <div className="flex flex-wrap gap-1.5">
          {displayTags.slice(0, 8).map((tag, index) => (
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
          ))}
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