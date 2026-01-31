import './collectibleCard.css'; 

export default function CollectibleCard({ item }) {
  return (
    /* Removed h-80, added aspect-square and var colors */
    <article className="card group relative overflow-hidden rounded-md aspect-square w-full border border-[var(--border-color)] bg-[var(--secondary-bg)] shadow-lg transition-all duration-300 hover:border-[var(--accent-color)] hover:-translate-y-1">
      
      {/* 1. THE IMAGE (Base Layer) */}
      <img 
        src={item.imageUrl} 
        alt={item.name} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
      />

      {/* 2. THE OVERLAY (Gradient using your shadow color) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-transparent to-transparent opacity-80" />

      {/* 3. THE TOP CONTENT (Bookmark Icon) */}
      <header className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center z-10">
        <button className="hover:scale-110 transition-transform">
          <svg height="18" width="18" fill="var(--accent-color)" viewBox="0 0 24 24" className="drop-shadow-md">
            <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </button>
      </header>

      {/* 4. THE BOTTOM CONTENT (Title & Collection) */}
      <footer className="absolute bottom-0 left-0 right-0 p-3 text-[var(--text-color)] z-10">
       <p className="text-sm font-bold italic tracking-tight truncate leading-tight font-serif mb-2 text-[var(--secondary-accent)]">
          {item.name}
        </p>
        <p className="text-xs font-medium uppercase tracking-widest text-[var(--border-color)] mb-0.5">
          {item.collectionName}
        </p>
       

        {/* TAGS SECTION */}
        <div className="flex flex-wrap gap-1">
          {item.tags && item.tags.slice(0, 10).map((tag, index) => (
            <div 
              key={index} 
              className={`relative w-10 h-4 ${index >= 4 ? 'hidden group-hover:block' : 'block'}`}
            >
              <button
                title={tag}
                className={`
                  absolute top-0 left-0 min-w-full w-full h-full 
                  bg-[var(--bg-color)]/60 backdrop-blur-sm text-[var(--accent-color)] text-[6px] 
                  font-bold uppercase rounded-sm border border-[var(--border-color)] 
                  px-1 truncate transition-all duration-200
                  hover:w-auto hover:z-30 hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)]
                  ${index >= 4 ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
                `}
              >
                {tag}
              </button>
            </div>
          ))}
        </div>
      </footer>
    </article>
  );
}