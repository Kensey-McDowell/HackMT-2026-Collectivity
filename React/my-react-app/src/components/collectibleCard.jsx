import './collectibleCard.css'; // Keep this for your :root variables


export default function CollectibleCard({ item }) {
  return (
    <article className="card group relative overflow-hidden rounded-xl h-80 w-full">
      {/* 1. THE IMAGE (Base Layer) */}
      <img 
        src={item.imageUrl} 
        alt={item.name} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
      />

      {/* 2. THE OVERLAY (Gradient to make text readable) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

      {/* 3. THE TOP CONTENT (Price & Icon) */}
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white">
        <button>
                <svg height="20" width="20" fill="white" viewBox="0 0 24 24" className="drop-shadow-md">
           <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
        </button>
        
      </header>

      {/* 4. THE BOTTOM CONTENT (Title & Collection) */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <p className="text-lg font-bold truncate">{item.name}</p>
        <p className="text-xs opacity-80">
          {item.collectionName}
        </p>
    {/* 1. OUTER CONTAINER: The "Boss" that stacks things vertically from bottom-to-top */}
<div className="flex flex-col-reverse gap-1">

  {/* 2. INNER WRAPPER: This allows tags to sit side-by-side in a row */}
  <div className="flex flex-wrap gap-1 items-end transition-all duration-300">
    
    {item.tags && item.tags.slice(0, 10).map((tag, index) => (
      <button
        key={index} 
        style={{ 
           transitionDelay: index >= 4 ? `${(index - 4) * 50}ms` : '0ms' 
        }}
        className={`
          py-1 px-2 bg-white/20 text-white text-[9px] font-black uppercase rounded-sm hover:bg-white/40 transition-colors
          ${index >= 4 ? 'hidden group-hover:block opacity-0 group-hover:opacity-100' : 'block opacity-100'}
          transition-opacity duration-300 ease-out
        `}
      >
        {tag}
      </button>
    ))}
  </div>

</div>
       
      </footer>
    </article>
  );
}

 