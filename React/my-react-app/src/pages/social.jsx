import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import './social.css';
// Removed: import { printAllCollectibles } from '../js/testTransaction.js'; (Blockchain no longer needed)
import CollectibleCard from '../components/collectibleCard'; 
import { UI_TAG_MAP } from '../js/tags';
import pb from '../lib/pocketbase';

const PB_COLLECTABLES = 'collectables'; 

export default function SocialPage() {
  const location = useLocation();
  const [collectibles, setCollectibles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Memorabilia");
  const [availableTags, setAvailableTags] = useState([]);
  
  // New state to track multiple selected tags for the UI highlight
  const [activeTags, setActiveTags] = useState([]);

  useEffect(() => {
    if (location.state?.filterTag) {
      setSelectedTag(location.state.filterTag);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // FULL CONVERSION: Fetching directly from PocketBase instead of Blockchain
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch items directly from PocketBase
        // We use 'expand' to get the category and tags data in the same request
        const records = await pb.collection(PB_COLLECTABLES).getFullList({
          sort: '-created',
          expand: 'category,tags', 
        });

        const items = records.map(record => ({
          ...record,
          // Map PocketBase fields to the names expected by your existing CollectibleCard component
          unique_ID: record.unique_id, 
          collectible_name: record.name,
          imageUrl: record.images?.length ? pb.files.getURL(record, record.images[0]) : null
        }));

        setCollectibles(items);
      } catch (err) {
        console.error("Failed to fetch collectibles:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function loadTags() {
      try {
        const records = await pb.collection('tags').getFullList({
          filter: `field.name ~ "${selectedCategory}"`,
          sort: 'name',
          $autoCancel: false
        });
        setAvailableTags(records);
      } catch (err) {
        console.error("Connection failed:", err);
      }
    }
    if (selectedCategory) loadTags();
  }, [selectedCategory]);

  // Toggle tag selection logic
  const handleTagClick = (tagName) => {
    if (activeTags.includes(tagName)) {
      setActiveTags(activeTags.filter(t => t !== tagName));
    } else {
      setActiveTags([...activeTags, tagName]);
    }
  };

  const filteredItems = collectibles.filter(item => {
    const matchesSearch = item.collectible_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check if the item's tags (from the expand field) match any activeTags
    const matchesTags = activeTags.length === 0 || 
      activeTags.some(tagName => item.expand?.tags?.some(t => t.name === tagName));

    return matchesSearch && matchesTags;
  });

  return (
    <div className="social-dashboard-wrapper">
      <div className="social-main-content-area w-full flex">
        
        {/* LEFT SIDEBAR */}
        <aside className="social-sidebar w-64 hidden lg:flex flex-col border-r border-[var(--border-color)]">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 text-[var(--accent-color)]">Recently Viewed</h2>
          <div className="flex flex-col">
            {[1, 2, 3].map((i) => (
              <div key={i} className="social-sidebar-image-card">
                <span className="text-[10px] uppercase tracking-widest font-bold">Recent {i}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER FEED */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="social-scrollable-box p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {isLoading ? (
                <div className="text-[var(--accent-color)] uppercase tracking-widest text-xs">Syncing Database...</div>
              ) : (
                filteredItems.map((item) => (
                  <Link 
                    key={item.unique_ID || item.id} 
                    to={`/product/${item.unique_ID}`}
                    className="transform transition-transform duration-300 hover:scale-105 active:scale-95"
                  >
                    <CollectibleCard item={item} />
                  </Link>
                ))
              )}
            </div>
          </div>
        </main>

        {/* RIGHT DISCOVERY SIDEBAR */}
        <aside className="social-sidebar w-80 hidden md:flex flex-col gap-10 border-l border-[var(--border-color)] p-6 overflow-y-auto">
          <h2 className="text-xl font-bold italic tracking-tighter text-[var(--text-color)]">Discovery</h2>
          
          <div className="space-y-8">
            <section>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block opacity-50">Filter By Name</label>
              <input 
                type="text" 
                placeholder="Search..." 
                className="social-search-input w-full" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </section>

            <section>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block opacity-50">Category</label>
              <select 
                className="social-search-input cursor-pointer w-full"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="Memorabilia">Memorabilia</option>
                <option value="Hardware">Hardware</option>
                <option value="Toys & Hobbies">Toys & Hobbies</option>
                <option value="Movies & TV">Movies & TV</option>
                <option value="Music">Music</option>
                <option value="Comics">Comics</option>
                <option value="Figures">Figures</option>
                <option value="Board Games">Board Games</option>
                <option value="Video Games">Video Games</option>
                <option value="Sports">Sports</option>
                <option value="Books">Books</option>
                <option value="Cards">Cards</option>
                <option value="Global">Global</option>
              </select>
            </section>

            <section>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block opacity-50">
                Available Tags
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableTags.length > 0 ? (
                  availableTags.map((tag) => {
                    const isSelected = activeTags.includes(tag.name);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => handleTagClick(tag.name)}
                        className={`px-3 py-2 border rounded-md text-[10px] uppercase tracking-tighter transition-all duration-200 ${
                          isSelected 
                            ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-black font-bold' 
                            : 'border-[var(--border-color)] text-[var(--text-color)] opacity-70 hover:opacity-100 hover:border-[var(--accent-color)]'
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-[10px] opacity-30 italic">No tags found for {selectedCategory}.</p>
                )}
              </div>
            </section>
          </div>
        </aside>

      </div>
    </div>
  );
}