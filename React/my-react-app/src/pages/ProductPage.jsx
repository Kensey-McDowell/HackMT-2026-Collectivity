import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { printAllCollectibles } from '../js/testTransaction.js';
import './productpage.css';

export default function ProductPage() {
  const { itemIndex } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Define missing variables to prevent crash
  const isLoggedIn = true; 
  const user = { username: "AUTHENTICATED_USER" };

  useEffect(() => {
    window.scrollTo(0, 0);
    async function loadProduct() {
      try {
        setIsLoading(true);
        const allItems = await printAllCollectibles();
        
        // Match the ID from URL to the 'index' in your blockchain data
        const foundProduct = allItems.find(i => 
          String(i.index).toLowerCase() === String(itemIndex).toLowerCase()
        );
        
        setProduct(foundProduct);
      } catch (err) {
        console.error("Load failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [itemIndex]);

  if (isLoading) return <div className="loading-screen">Accessing Smart Contract...</div>;

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

  // Helper for properties that might be missing from blockchain
  const displayImg = `https://placehold.co/600x600/111/c5a367?text=${product.collectible_name}`;
  return (
    <>
      <div className="product-container">
        {/* LEFT PANEL: Visuals & Technicals */}
        <aside className="panel-visuals">
          <div className="visuals-top-stack">
            <div className="hero-image-aligned">
              <div className="flex items-center justify-center h-full w-full uppercase tracking-[0.5em] text-[var(--border-color)] font-bold text-[10px]">
                Asset View
              </div>
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
                <span className="label-gold-dim">Owner</span>
                <span className="tech-value">{product.ownership}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="label-gold-dim">Asset Status</span>
                <span className="tech-value text-green-400">Available For Sale</span>
              </div>
            </div>
            <div className="tech-row border-b-0">
              <div className="flex flex-col">
                <span className="label-gold-dim">Physical Location</span>
                <span className="tech-value">London Gallery</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="label-gold-dim">Market Value</span>
                <span className="tech-value text-[var(--accent-color)] font-bold">{product.price}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT PANEL: Info & History */}
        <main className="panel-info">
          <header className="product-header">
            <h2 className="product-title">{product.collectible_name}</h2>
            <div className="header-meta-row">
              <div className="meta-stack">
                <span className="label-gold">Category</span>
                <span className="category-text">{product.category}</span>
              </div>
              <div className="meta-stack text-right items-end">
                <span className="label-gold">Tags</span>
                <div className="tag-cloud-inline">
                  {['#Handcrafted', '#Marble', '#Unique'].map(tag => (
                    <button key={tag} className="tag-item transform transition-transform duration-300 ease-out hover:scale-110 active:scale-95">{tag}</button>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <div className="description-box">
            <span className="label-gold block mb-2">Item Description</span>
            <p className="description-text">
              temp temp
            </p>
          </div>

          <div className="history-section">
            <span className="label-gold mb-4 block">Transaction History</span>
            <div className="history-scroll-container">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="history-row">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Sale & Transfer</span>
                    <span className="text-[10px] opacity-40 font-mono">0x71C...8241</span>
                  </div>
                  <div className="text-right flex flex-col gap-1">
                    <span className="block text-sm text-[var(--accent-color)] font-bold">£11,200.00</span>
                    <span className="text-[10px] opacity-40">24 OCT 2025</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}