import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import './social.css';
import CollectibleCard from '../components/collectibleCard'; 
import { UI_TAG_MAP } from '../js/tags';
import pb from '../lib/pocketbase';

const PB_COLLECTABLES = 'collectables'; 
const PB_ANALYTICS = 'user_analytics';

// --- SUB-COMPONENT: DRAGGABLE FLOATING CHAT WINDOW ---
const FloatingChat = ({ receiver, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  // Dragging State
  const [position, setPosition] = useState({ x: 320, y: window.innerHeight - 420 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    async function loadMessages() {
      try {
        const records = await pb.collection('messages').getList(1, 50, {
          filter: `(sender="${pb.authStore.model.id}" && receiver="${receiver.id}") || (sender="${receiver.id}" && receiver="${pb.authStore.model.id}")`,
          sort: 'created',
          $autoCancel: false
        });
        setMessages(records.items);
      } catch (err) {
        console.error("Chat load failed:", err);
      }
    }

    loadMessages();
    const unsubscribe = pb.collection('messages').subscribe('*', ({ action, record }) => {
      if (action === 'create') {
        const isParticipant = (record.sender === receiver.id || record.receiver === receiver.id);
        if (isParticipant) {
          setMessages(prev => [...prev, record]);
        }
      }
    });

    return () => pb.collection('messages').unsubscribe();
  }, [receiver.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- DRAG HANDLERS ---
  const onMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, dragOffset]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await pb.collection('messages').create({
        sender: pb.authStore.model.id,
        receiver: receiver.id,
        content: newMessage
      });
      setNewMessage("");
    } catch (err) {
      console.error("Transmission failed:", err);
    }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div 
      className="fixed w-80 h-96 bg-[var(--bg-color)] border border-[var(--accent-color)]/40 shadow-2xl flex flex-col z-[100] select-none"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
    >
      {/* DRAGGABLE HEADER */}
      <div 
        onMouseDown={onMouseDown}
        className="p-3 bg-white/5 flex justify-between items-center border-b border-white/5 cursor-grab active:cursor-grabbing"
      >
        <div className="flex flex-col pointer-events-none">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--accent-color)]">Floating Terminal // {receiver.username || receiver.name}</span>
          <span className="text-[7px] font-mono opacity-40 uppercase tracking-tighter">Status: Secure Line // Drag to move</span>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white transition-opacity text-lg leading-none pointer-events-auto">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide select-text">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === pb.authStore.model.id ? 'items-end' : 'items-start'}`}>
            <div className={`p-2 text-[10px] max-w-[85%] leading-relaxed ${
              msg.sender === pb.authStore.model.id 
              ? 'bg-[var(--accent-color)] text-black font-medium' 
              : 'bg-white/5 border border-white/10 text-white'
            }`}>
              {msg.content}
            </div>
            <span className="text-[7px] font-mono opacity-20 mt-1 uppercase">
              {formatTime(msg.created)}
            </span>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} className="p-2 border-t border-white/5 flex gap-1 bg-black/20">
        <input 
          className="flex-1 bg-transparent border border-white/10 text-[10px] p-2 outline-none focus:border-[var(--accent-color)] placeholder:opacity-20"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="SEND MSG..."
        />
        <button className="bg-[var(--accent-color)] text-black px-3 py-1 text-[9px] font-bold uppercase">Sync</button>
      </form>
    </div>
  );
};

export default function SocialPage() {
  const location = useLocation();
  const [collectibles, setCollectibles] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [topInterests, setTopInterests] = useState([]);
  const [followingList, setFollowingList] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Memorabilia");
  const [availableTags, setAvailableTags] = useState([]);
  const [activeTags, setActiveTags] = useState([]);
  
  const [activeSidebarTab, setActiveSidebarTab] = useState('following'); 
  const [floatingChatUser, setFloatingChatUser] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
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

        if (pb.authStore.model) {
          const userWithFollowing = await pb.collection('users').getOne(pb.authStore.model.id, {
            expand: 'following',
            $autoCancel: false
          });
          setFollowingList(userWithFollowing.expand?.following || []);

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
    <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-2 gap-2">
      <button 
        onClick={() => setActiveSidebarTab('following')}
        className={`text-[9px] uppercase tracking-widest font-bold transition-colors ${activeSidebarTab === 'following' ? 'text-[var(--accent-color)]' : 'opacity-30 hover:opacity-100'}`}
      >
        Following
      </button>
      <button 
        onClick={() => setActiveSidebarTab('recent')}
        className={`text-[9px] uppercase tracking-widest font-bold transition-colors ${activeSidebarTab === 'recent' ? 'text-[var(--accent-color)]' : 'opacity-30 hover:opacity-100'}`}
      >
        Recent
      </button>
      <button 
        onClick={() => setActiveSidebarTab('interests')}
        className={`text-[9px] uppercase tracking-widest font-bold transition-colors ${activeSidebarTab === 'interests' ? 'text-[var(--accent-color)]' : 'opacity-30 hover:opacity-100'}`}
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
      <div className="social-main-content-area w-full flex h-screen overflow-hidden">
        
        <aside className="social-sidebar w-80 hidden lg:flex flex-col border-r border-[var(--border-color)]">
          <div className="p-6 flex-1 flex flex-col overflow-hidden">
            <SidebarNav />
            
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 scrollbar-hide">
              {activeSidebarTab === 'following' && (
                followingList.length > 0 ? (
                  followingList.map((user) => (
                    <div 
                      key={user.id} 
                      className={`flex items-center gap-4 px-4 py-3 border transition-all group w-full justify-start ${floatingChatUser?.id === user.id ? 'border-[var(--accent-color)]/50 bg-[var(--accent-color)]/5' : 'border-white/5 bg-white/5 hover:border-[var(--accent-color)]/30'}`}
                    >
                      <Link to={`/profile/${user.id}`} className="shrink-0">
                        <div className="w-10 h-10 rounded-full border border-[var(--accent-color)]/20 overflow-hidden">
                          <img 
                            src={user.avatar ? pb.files.getURL(user, user.avatar) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                            alt={user.username || user.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>

                      <div className="flex-1 flex flex-col overflow-hidden text-left min-w-0">
                        <Link to={`/profile/${user.id}`}>
                          <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-white group-hover:text-[var(--accent-color)] transition-colors truncate block">
                            {user.username || user.name}
                          </span>
                        </Link>
                        <span className="text-[7px] opacity-30 font-mono italic uppercase tracking-widest">Authorized Collector</span>
                      </div>
                      
                      <button 
                        onClick={() => setFloatingChatUser(user)}
                        className="p-2 opacity-20 hover:opacity-100 hover:text-[var(--accent-color)] transition-all shrink-0"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-[9px] opacity-20 italic text-center mt-10 uppercase tracking-widest">Not following anyone</div>
                )
              )}

              {activeSidebarTab === 'recent' && recentItems.map((item) => (
                <Link key={item.id} to={`/product/${item.id}`} className="social-sidebar-image-card group block h-32 relative border border-white/5 overflow-hidden shrink-0">
                  <div className="w-full h-full bg-white/5">
                    {item.images?.length > 0 && (
                      <img src={pb.files.getURL(item, item.images[0])} alt={item.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  <div className="p-2 bg-black/70 absolute bottom-0 w-full border-t border-white/5">
                    <span className="text-[9px] uppercase tracking-widest font-bold truncate block text-white">{item.name}</span>
                  </div>
                </Link>
              ))}

              {activeSidebarTab === 'interests' && topInterests.slice(0, 5).map((interest) => (
                <div key={interest.id} className="p-2 border border-white/5 bg-white/5 flex justify-between items-center group">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white group-hover:text-[var(--accent-color)] transition-colors">
                    {interest.interest_name}
                  </span>
                  <span className="text-[8px] font-mono opacity-30">{interest.view_count}v</span>
                </div>
              ))}

              {activeSidebarTab === 'suggested' && recommendedItems.map((item) => (
                <Link key={item.id} to={`/product/${item.id}`} className="social-sidebar-image-card group block h-32 relative border border-white/5 overflow-hidden shrink-0">
                  <div className="w-full h-full bg-white/5">
                    {item.images?.length > 0 && (
                      <img src={pb.files.getURL(item, item.images[0])} alt={item.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  <div className="p-2 bg-[var(--accent-color)]/20 absolute bottom-0 w-full border-t border-[var(--accent-color)]/30 backdrop-blur-sm">
                    <span className="text-[9px] uppercase tracking-widest font-bold truncate block text-white">{item.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {floatingChatUser && (
          <FloatingChat 
            receiver={floatingChatUser} 
            onClose={() => setFloatingChatUser(null)} 
          />
        )}

        <main className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-6">
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
                  <p className="text-[10px] opacity-30 italic">No tags found.</p>
                )}
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}