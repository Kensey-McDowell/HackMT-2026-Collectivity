import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; 
import CollectibleCard from '../components/collectibleCard';
import pb from '../lib/pocketbase';
import './profile.css';

const PB_COLLECTABLES = 'collectables'; 

export default function ProfilePage() {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isOwnProfile = pb.authStore.isValid && pb.authStore.model.id === userId;

  useEffect(() => {
    async function loadProfileAndInventory() {
      try {
        setIsLoading(true);
        const userRecord = await pb.collection('users').getOne(userId, { $autoCancel: false });
        
        setProfileData({
          id: userRecord.id,
          username: userRecord.username || userRecord.name || "Collector",
          profileImageUrl: userRecord.avatar 
            ? pb.files.getURL(userRecord, userRecord.avatar) 
            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${userRecord.id}`,
          profileBannerUrl: userRecord.banner 
            ? pb.files.getURL(userRecord, userRecord.banner) 
            : "https://i.etsystatic.com/34466454/r/il/5e9775/4175504808/il_fullxfull.4175504808_bdhn.jpg",
        });

        // Check if current user is following this profile
        if (pb.authStore.isValid && !isOwnProfile) {
          const currentUser = pb.authStore.model;
          const followingList = currentUser.following || [];
          setIsFollowing(followingList.includes(userId));
        }

        const records = await pb.collection(PB_COLLECTABLES).getFullList({
          filter: `created_by = "${userId}"`,
          sort: '-created',
          expand: 'category,tags',
          $autoCancel: false
        });

        setItems(records.map(record => ({
          ...record,
          collectible_name: record.name,
          imageUrl: record.images?.length ? pb.files.getURL(record, record.images[0]) : null,
          index: record.id 
        })));
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) loadProfileAndInventory();
  }, [userId, isOwnProfile]);

  const toggleFollow = async () => {
    if (!pb.authStore.isValid) return alert("Please log in to follow collectors.");
    
    setIsProcessing(true);
    try {
      const currentUser = pb.authStore.model;
      let followingList = [...(currentUser.following || [])];

      if (isFollowing) {
        // Unfollow
        followingList = followingList.filter(id => id !== userId);
      } else {
        // Follow
        followingList.push(userId);
      }

      // Update the user record in PocketBase
      const updatedUser = await pb.collection('users').update(currentUser.id, {
        following: followingList
      });

      // Update local authStore and state
      pb.authStore.save(pb.authStore.token, updatedUser);
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("Follow toggle failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const pageStyle = { 
    fontFamily: "'Playfair Display', serif",
    backgroundColor: "var(--bg-color)",
    color: "var(--text-color)",
    width: "100%"
  };

  if (isLoading) return (
    <div style={pageStyle} className="min-h-screen flex items-center justify-center uppercase tracking-[0.5em]">
      Accessing Vault Records...
    </div>
  );

  if (!profileData) return null;

  return (
    <div style={pageStyle} className="min-h-screen p-2 md:p-4 antialiased">
      <div className="w-full px-4 md:px-8">
        
        {/* HEADER SECTION */}
        <div 
          className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-cover bg-center bg-no-repeat p-10 md:p-16 rounded-sm border border-[var(--border-color)]"
          style={{ 
            backgroundImage: `linear-gradient(to right, var(--bg-color) 15%, rgba(10, 9, 8, 0.1) 100%), url(${profileData.profileBannerUrl})`,
            minHeight: '200px'
          }} 
        >
          <div className="flex flex-col md:flex-row items-center gap-10">
            <img 
              src={profileData.profileImageUrl}
              alt="Profile" 
              className="w-32 h-32 md:w-44 md:h-44 rounded-full border-2 border-[var(--accent-color)] object-cover bg-[var(--bg-color)] shadow-2xl" 
            />
            <div className="text-center md:text-left">
              <span className="text-[10px] uppercase tracking-[0.6em] text-[var(--accent-color)] font-bold block mb-2">Vault Identifier</span>
              <h1 className="text-5xl md:text-8xl font-medium italic tracking-tighter text-[var(--text-color)] drop-shadow-2xl">
                {profileData.username}
              </h1>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-3">
            {isOwnProfile ? (
              <a href="/#/create" className="px-12 py-3 bg-[var(--accent-color)] text-[var(--bg-color)] text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-lg">
                Create New Asset
              </a>
            ) : (
              <button 
                onClick={toggleFollow}
                disabled={isProcessing}
                className={`px-12 py-3 border-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-lg ${
                  isFollowing 
                  ? 'border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)]' 
                  : 'bg-[var(--accent-color)] border-[var(--accent-color)] text-[var(--bg-color)] hover:opacity-90'
                }`}
              >
                {isProcessing ? "Processing..." : isFollowing ? "Following" : "Follow Collector"}
              </button>
            )}
            <div className="text-[10px] uppercase tracking-widest opacity-40 italic">
              Member since {new Date().getFullYear()}
            </div>
          </div>
        </div>

        {/* INVENTORY SECTION */}
        <div className="w-full">
          <header className="flex items-center gap-4 text-[11px] font-bold tracking-[0.8em] text-[var(--text-color)] mb-8 uppercase opacity-60">
            <span className="italic">Authorized Inventory</span>
            <div className="h-[1px] flex-1 bg-[var(--border-color)]/40"></div>
            <span className="text-[var(--accent-color)]">{items.length} Items</span>
          </header>
          
          {items.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12
                            gap-4 md:gap-5
                            p-4 md:p-6     
                            bg-[var(--secondary-bg)]/5
                            border border-[var(--border-color)]/10 
                            rounded-sm">     
                {items.map((item) => (
                    <CollectibleCard key={item.id} item={item} />
                ))}
            </div>
          ) : (
            <div className="text-center py-32 border border-dashed border-[var(--border-color)] opacity-20 rounded-sm">
              <p className="uppercase tracking-[0.5em] text-xs">No assets recorded in this vault.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}