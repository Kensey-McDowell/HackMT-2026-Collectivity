import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import pb from '../lib/pocketbase';
import './ProductPage.css';

const PB_COLLECTABLES = 'collectables';
const PB_LOGS = 'activity_ledger';
// Ensure this matches your PocketBase collection name exactly (usually lowercase)
const PB_ANALYTICS = 'user_analytics';


const STATUS_LABELS = {
  0: "Verified",
  1: "Not Verified",
  2: "For Sale",
  3: "Not For Sale"
};

export default function ProductPage() {
  const navigate = useNavigate();
  const { itemIndex } = useParams(); 
  const [product, setProduct] = useState(null);
  const [productImageUrl, setProductImageUrl] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = pb.authStore.model;
  const statusLabel = STATUS_LABELS[product?.status] || "Verified";
  const categoryLabel = product?.expand?.category?.name || "Uncategorized";

  const handleTagClick = (tagLabel) => {
    navigate('/social', { state: { filterTag: tagLabel } });
  };

  const updateRecentHistory = (id) => {
    try {
      const stored = localStorage.getItem('recent_views');
      const existing = stored ? JSON.parse(stored) : [];
      const updated = [id, ...existing.filter(item => item !== id)].slice(0, 3);
      localStorage.setItem('recent_views', JSON.stringify(updated));
    } catch (err) {
      console.error("Local history error:", err);
    }
  };

  /**
   * GLOBAL ANALYTICS TRACKER
   * Stores interest_name directly to bypass expansion issues
   */
  const trackEngagement = async (categoryId, categoryName, tags = []) => {
    if (!currentUser) return;

    // Build entries with ID and Name
    const entries = [];
    if (categoryId) {
      entries.push({ id: categoryId, name: categoryName, type: 'category' });
    }
    
    (tags || []).forEach(tag => {
      if (tag.id) entries.push({ id: tag.id, name: tag.name, type: 'tag' });
    });

    for (const item of entries) {
      if (!item.id || typeof item.id !== 'string') continue;

      try {
        const existing = await pb.collection(PB_ANALYTICS).getFirstListItem(
          `user = "${currentUser.id}" && interest_id = "${item.id}"`,
          { $autoCancel: false }
        );

        await pb.collection(PB_ANALYTICS).update(existing.id, {
          view_count: (existing.view_count || 0) + 1,
          interest_name: item.name // Keep name updated
        });

      } catch (err) {
        if (err.status === 404) {
          await pb.collection(PB_ANALYTICS).create({
            user: currentUser.id,
            interest_id: item.id,
            interest_name: item.name, // Save the name here
            type: item.type,
            view_count: 1
          }, { $autoCancel: false });
        }
      }
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    async function loadProduct() {
      if (!itemIndex) return;
      
      try {
        setIsLoading(true);
        const record = await pb.collection(PB_COLLECTABLES).getOne(itemIndex, {
          expand: 'category,tags,created_by',
          $autoCancel: false 
        });

        const logs = await pb.collection(PB_LOGS).getFullList({
          filter: `collectible_id = "${itemIndex}"`,
          sort: '-created',
          expand: 'changed_by',
          $autoCancel: false
        });

        setProduct({
          ...record,
          collectible_name: record.name,
          price: record.estimated_value,
          ownership: record.expand?.created_by?.name || record.expand?.created_by?.email || "Unknown Owner",
          displayTags: record.expand?.tags || []
        });
        setTransactions(logs);

        updateRecentHistory(itemIndex);
        
        // Pass names to the tracker
        trackEngagement(
          record.category, 
          record.expand?.category?.name || "Unknown Category", 
          record.expand?.tags || []
        );

        if (record.images?.length) {
          setProductImageUrl(pb.files.getURL(record, record.images[0]));
        }
      } catch (err) {
        if (!err.isAbort) {
          console.error("Vault access failed:", err);
          setProduct(null);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [itemIndex]);

  if (isLoading) return <div className="loading-screen">Accessing Secure Vault...</div>;
  if (!product) return <div className="loading-screen text-red-500">Asset Data Corrupted</div>;

  return (
    <div className="product-container">
      <aside className="panel-visuals">
        <div className="visuals-top-stack">
          <div className="hero-image-aligned">
            {productImageUrl ? (
              <img src={productImageUrl} alt={product.collectible_name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full w-full uppercase tracking-[0.5em] text-[var(--border-color)] font-bold text-[10px]">
                Asset View
              </div>
            )}
          </div>
          <div className="thumb-scroller-aligned">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="thumb-box-aligned flex items-center justify-center uppercase text-[10px] tracking-widest text-[var(--border-color)]">
                Pic
              </div>
            ))}
          </div>
        </div>

        <div className="info-technical-grid">
          <div className="tech-row">
            <div className="flex flex-col">
              <span className="label-gold-dim">Asset Status</span>
              <span className="tech-value text-green-400">{statusLabel}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="label-gold-dim">Market Value</span>
              <span className="tech-value text-[var(--accent-color)] font-bold">$ {Number(product.price).toLocaleString()}</span>
            </div>
          </div>
          <div className="tech-row border-b-0">
            <div className="flex flex-col">
              <span className="label-gold-dim">Owner</span>
              <span className="tech-value">{product.ownership}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="panel-info">
        <header className="product-header">
          <h2 className="product-title">{product.collectible_name}</h2>
          <div className="header-meta-row">
            <div className="meta-stack">
              <span className="label-gold">Category</span>
              <span className="category-text">{categoryLabel}</span>
            </div>
            <div className="meta-stack text-right items-end">
              <span className="label-gold">Tags</span>
              <div className="tag-cloud-inline">
                {product.displayTags.map((tagRecord) => (
                  <button 
                    key={tagRecord.id} 
                    onClick={() => handleTagClick(tagRecord.name)}
                    className="tag-item transform transition-transform duration-300 hover:scale-110"
                  >
                    {tagRecord.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="description-box">
          <span className="label-gold block mb-2">Item Description</span>
          <p className="description-text">
            {product.description || "No description provided for this asset."}
          </p>
        </div>

        <div className="history-section mt-8">
          <span className="label-gold mb-4 block">Transaction History</span>
          <div className="history-scroll-container border-t border-white/10 pt-2">
            {transactions.length > 0 ? (
              transactions.map((log) => (
                <div key={log.id} className="history-row flex justify-between border-b border-white/5 py-4 last:border-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-color)]">
                      {log.action}
                    </span>
                    <span className="text-[11px] opacity-70">
                      <span className="opacity-40">{log.previous_value}</span>
                      <span className="mx-2 text-[var(--accent-color)]">→</span>
                      <span className="text-white">{log.new_value}</span>
                    </span>
                    <span className="text-[9px] opacity-30 font-mono uppercase tracking-tighter">
                      Auth: {log.expand?.changed_by?.name || log.expand?.changed_by?.username || "System_Node"}
                    </span>
                  </div>
                  <div className="text-right flex flex-col justify-center">
                    <span className="text-[10px] opacity-40 font-mono">
                      {new Date(log.created).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      }).toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="history-row flex justify-between py-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-color)]">Genesis Entry</span>
                  <span className="text-[10px] opacity-40 font-mono">Initial Vaulting by {product.ownership}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] opacity-40 font-mono">
                    {new Date(product.created).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    }).toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}