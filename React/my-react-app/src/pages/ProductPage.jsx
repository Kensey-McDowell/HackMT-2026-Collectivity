import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import pb from '../lib/pocketbase';
import './ProductPage.css';

const PB_COLLECTABLES = 'collectables';

const STATUS_LABELS = {
  0: "Verified",
  1: "Not Verified",
  2: "For Sale",
  3: "Not For Sale"
};

export default function ProductPage() {
  const navigate = useNavigate();
  const { itemIndex } = useParams(); // This is now the record ID (e.g., "76p87dy234")
  const [product, setProduct] = useState(null);
  const [productImageUrl, setProductImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const statusLabel = STATUS_LABELS[product?.status] || "Verified";
  const categoryLabel = product?.expand?.category?.name || "Uncategorized";

  const handleTagClick = (tagLabel) => {
    navigate('/social', { state: { filterTag: tagLabel } });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    async function loadProduct() {
      if (!itemIndex) return;
      
      try {
        setIsLoading(true);
        
        // FETCH UPDATE: Use getOne for a direct ID lookup
        const record = await pb.collection(PB_COLLECTABLES).getOne(itemIndex, {
          expand: 'category,tags,created_by'
        });

        const mappedProduct = {
          ...record,
          collectible_name: record.name,
          price: record.estimated_value,
          ownership: record.expand?.created_by?.name || record.expand?.created_by?.email || "Unknown Owner",
          displayTags: record.expand?.tags || []
        };

        setProduct(mappedProduct);

        if (record.images?.length) {
          setProductImageUrl(pb.files.getURL(record, record.images[0]));
        }
      } catch (err) {
        console.error("Load failed:", err);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [itemIndex]);

  if (isLoading) return <div className="loading-screen">Accessing Secure Vault...</div>;

  if (!product) {
    return (
      <div className="product-viewport flex flex-col items-center justify-center text-[var(--accent-color)] h-screen bg-[var(--bg-color)]">
        <h1 className="font-serif italic text-3xl mb-4">Asset Not Found</h1>
        <p className="mb-8 opacity-60">The ID "{itemIndex}" does not match our records.</p>
        <Link to="/" className="px-6 py-2 border border-[var(--accent-color)] uppercase text-[10px] tracking-widest">
          Return to Gallery
        </Link>
      </div>
    );
  }

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

        <div className="history-section">
          <span className="label-gold mb-4 block">Transaction History</span>
          <div className="history-scroll-container">
            <div className="history-row">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest">Original Entry</span>
                <span className="text-[10px] opacity-40 font-mono">{product.ownership}</span>
              </div>
              <div className="text-right flex flex-col gap-1">
                <span className="text-[10px] opacity-40">
                  {new Date(product.created).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}