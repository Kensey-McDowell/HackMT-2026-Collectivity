import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import './social.css';
import CollectibleCard from '../components/collectibleCard'; 
import { UI_TAG_MAP } from '../js/tags';
import pb from '../lib/pocketbase';

const PB_COLLECTABLES = 'collectables'; 
const PB_ANALYTICS = 'user_analytics';

export default function SocialPage() {
  const location = useLocation();
  const [collectibles, setCollectibles] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [topInterests, setTopInterests] = useState([]);
  const [followingList, setFollowingList] = useState([]); // New state for following
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Memorabilia");
  const [availableTags, setAvailableTags] = useState([]);
  const [activeTags, setActiveTags] = useState([]);
  
  const [activeSidebarTab, setActiveSidebarTab] = useState('following'); // Set following as default if desired

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // 1. Fetch Global Collectibles
        const records = await pb.collection(PB_COLLECTABLES).getFullList({
          sort: '-created',
          expand: 'category,tags',
          $autoCancel: false
        });

        const items = records.map(record => ({
          ...record,
          unique_ID: record.id, 
          collectible_name: record.name,
          imageUrl: record.images?.length ? pb.files.getURL(record, record.images[0]) : null
        }));
        setCollectibles(items);

        // 2. Fetch Recent Views from LocalStorage
        const recentIds = JSON.parse(localStorage.getItem('recent_views') || '[]');
        if (recentIds.length > 0) {
          const filterStr = recentIds.map(id => `id="${id}"`).join(' || ');
          const recentRecords = await pb.collection(PB_COLLECTABLES).getList(1, 3, {
            filter: filterStr,
            $autoCancel: false
          });
          const sortedRecents = recentIds
            .map(id => recentRecords.items.find(r => r.id === id))
            .filter(Boolean);
          setRecentItems(sortedRecents);
        }

        // 3. User Specific Data (Interests and Following)
        if (pb.authStore.model) {
          // Fetch Following Data
          // We fetch the current user record again to expand the 'following' relation
          const userWithFollowing = await pb.collection('users').getOne(pb.authStore.model.id, {
            expand: 'following',
            $autoCancel: false
          });
          setFollowingList(userWithFollowing.expand?.following || []);

          // Fetch Analytics/Interests
          const analytics = await pb.collection(PB_ANALYTICS).getList(1, 40, {
            filter: `user = "${pb.authStore.model.id}"`,
            sort: '-view_count',
            $autoCancel: false
          });
          setTopInterests(analytics.items);
          
          if (analytics.items.length > 0) {
            const topId = analytics.items[0].interest_id;
            const recs = await pb.collection(PB_COLLECTABLES).getList(1, 3, {
              filter: `category = "${topId}" || tags ~ "${topId}"`,
              expand: 'category,tags',
              $autoCancel: false
            });
            setRecommendedItems(recs.items);
          }
        }
      } catch (err) {
        if (!err.isAbort) console.error("Fetch failed:", err);
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
        if (!err.isAbort) console.error("Tag load failed:", err);
      }
    }
    if (selectedCategory) loadTags();
  }, [selectedCategory]);

  const handleTagClick = (tagName) => {
    if (activeTags.includes(tagName)) {
      setActiveTags(activeTags.filter(t => t !== tagName));
    } else {
      setActiveTags([...activeTags, tagName]);
    }
  };

  const filteredItems = collectibles.filter(item => {
    const matchesSearch = item.collectible_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = activeTags.length === 0 || 
      activeTags.some(tagName => item.expand?.tags?.some(t => t.name === tagName));
    return matchesSearch && matchesTags;
  });

  const SidebarNav = () => (
    <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-2 gap-1.5">
      <button 
        onClick={() => setActiveSidebarTab('following')}
        className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${activeSidebarTab === 'following' ? 'text-[var(--accent-color)]' : 'opacity-30 hover:opacity-100'}`}
      >
        Following
      </button>
      <button 
        onClick={() => setActiveSidebarTab('recent')}
        className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${activeSidebarTab === 'recent' ? 'text-[var(--accent-color)]' : 'opacity-30 hover:opacity-100'}`}
      >
        Recent
      </button>
      <button 
        onClick={() => setActiveSidebarTab('interests')}
        className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${activeSidebarTab === 'interests' ? 'text-[var(--accent-color)]' : 'opacity-30 hover:opacity-100'}`}
      >
        Interests
      </button>
      <button 
        onClick={() => setActiveSidebarTab('suggested')}
        className={`text-[9px] uppercase tracking-widest font-bold transition-colors ${activeSidebarTab === 'suggested' ? 'text-[var(--accent-color)]' : 'opacity-30 hover:opacity-100'}`}
      >
        For You
      </button>
    </div>
  );

  return (
    <div className="social-dashboard-wrapper">
      <div className="social-main-content-area w-full flex">
        
        <aside className="social-sidebar w-64 hidden lg:flex flex-col border-r border-[var(--border-color)] p-6">
          <SidebarNav />
          
          <div className="flex flex-col gap-4 overflow-y-auto pr-1">
            {activeSidebarTab === 'following' && (
              followingList.length > 0 ? (
                followingList.map((user) => (
                  <Link key={user.id} to={`/profile/${user.id}`} className="flex items-center gap-3 p-2 border border-white/5 bg-white/5 hover:border-[var(--accent-color)]/30 transition-all group">
                    <div className="w-10 h-10 rounded-full border border-[var(--accent-color)]/20 overflow-hidden shrink-0">
                      <img 
                        src={user.avatar ? pb.files.getURL(user, user.avatar) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                        alt={user.username} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-white group-hover:text-[var(--accent-color)] transition-colors truncate">
                        {user.username || user.name || "Collector"}
                      </span>
                      <span className="text-[8px] opacity-30 font-mono italic uppercase">View Vault</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-[9px] opacity-20 italic text-center mt-10 uppercase tracking-widest">Not following anyone</div>
              )
            )}

            {activeSidebarTab === 'recent' && (
              recentItems.length > 0 ? (
                recentItems.map((item) => (
                  <Link key={item.id} to={`/product/${item.id}`} className="social-sidebar-image-card group block h-32 relative border border-white/5 overflow-hidden">
                    <div className="w-full h-full bg-white/5">
                      {item.images?.length > 0 && (
                        <img src={pb.files.getURL(item, item.images[0])} alt={item.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    <div className="p-2 bg-black/70 absolute bottom-0 w-full border-t border-white/5">
                      <span className="text-[9px] uppercase tracking-widest font-bold truncate block text-white">{item.name}</span>
                    </div>
                  </Link>
                ))
              ) : <div className="text-[9px] opacity-20 italic text-center mt-10 uppercase tracking-widest">No history</div>
            )}

            {activeSidebarTab === 'interests' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-[8px] uppercase tracking-[0.3em] mb-3 text-[var(--accent-color)] opacity-60 font-bold">Top Categories</h3>
                  <div className="flex flex-col gap-2">
                    {topInterests.filter(i => i.type === 'category' || i.type.includes('category')).slice(0, 5).map((interest) => (
                      <div key={interest.id} className="p-2 border border-white/5 bg-white/5 flex justify-between items-center group">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-white group-hover:text-[var(--accent-color)] transition-colors">
                          {interest.interest_name || "Untitled Category"}
                        </span>
                        <span className="text-[8px] font-mono opacity-30">{interest.view_count}v</span>
                      </div>
                    ))}
                    {topInterests.filter(i => i.type === 'category' || i.type.includes('category')).length === 0 && (
                      <div className="text-[9px] opacity-20 italic">No category data</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-[8px] uppercase tracking-[0.3em] mb-3 text-[var(--accent-color)] opacity-60 font-bold">Top Tags</h3>
                  <div className="flex flex-col gap-2">
                    {topInterests.filter(i => i.type === 'tag' || i.type.includes('tag')).slice(0, 8).map((interest) => (
                      <div key={interest.id} className="p-2 border border-white/5 bg-white/5 flex justify-between items-center group">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-white group-hover:text-[var(--accent-color)] transition-colors">
                          {interest.interest_name || "Untitled Tag"}
                        </span>
                        <span className="text-[8px] font-mono opacity-30">{interest.view_count}v</span>
                      </div>
                    ))}
                    {topInterests.filter(i => i.type === 'tag' || i.type.includes('tag')).length === 0 && (
                      <div className="text-[9px] opacity-20 italic">No tag data</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSidebarTab === 'suggested' && (
              recommendedItems.length > 0 ? (
                recommendedItems.map((item) => (
                  <Link key={item.id} to={`/product/${item.id}`} className="social-sidebar-image-card group block h-32 relative border border-white/5 overflow-hidden">
                    <div className="w-full h-full bg-white/5">
                      {item.images?.length > 0 && (
                        <img src={pb.files.getURL(item, item.images[0])} alt={item.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    <div className="p-2 bg-[var(--accent-color)]/20 absolute bottom-0 w-full border-t border-[var(--accent-color)]/30 backdrop-blur-sm">
                      <span className="text-[9px] uppercase tracking-widest font-bold truncate block text-white">{item.name}</span>
                    </div>
                  </Link>
                ))
              ) : <div className="text-[9px] opacity-20 italic text-center mt-10 uppercase tracking-widest">Keep exploring to see suggestions</div>
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="social-scrollable-box p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {isLoading ? (
                <div className="text-[var(--accent-color)] uppercase tracking-widest text-xs">Syncing Database...</div>
              ) : (
                filteredItems.map((item) => (
                  <Link key={item.id} to={`/product/${item.id}`} className="transform transition-transform duration-300 hover:scale-105 active:scale-95">
                    <CollectibleCard item={item} />
                  </Link>
                ))
              )}
            </div>
          </div>
        </main>

        <aside className="social-sidebar w-80 hidden md:flex flex-col gap-10 border-l border-[var(--border-color)] p-6 overflow-y-auto">
          <h2 className="text-xl font-bold italic tracking-tighter text-[var(--text-color)]">Discovery</h2>
          <div className="space-y-8">
            <section>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block opacity-50">Filter By Name</label>
              <input type="text" placeholder="Search..." className="social-search-input w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </section>

            <section>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block opacity-50">Category</label>
              <select className="social-search-input cursor-pointer w-full" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
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
              <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block opacity-50">Available Tags</label>
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