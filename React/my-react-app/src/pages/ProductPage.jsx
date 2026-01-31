import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { printAllCollectibles } from '../js/testTransaction.js';

import './productpage.css';

export default function ProductPage() {
  const { itemIndex } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function loadProduct() {
      setIsLoading(true);
      const allItems = await printAllCollectibles();
      
      // DEBUG: This will show you exactly why it's not matching in the console
      console.log("Searching for ID:", itemIndex);
      console.log("Available Items:", allItems);

      // We use .toLowerCase() to prevent "0xABC" vs "0xabc" mismatches
      const foundProduct = allItems.find(i => 
        String(i.Index).toLowerCase() === String(itemIndex).toLowerCase()
      );
      
      setProduct(foundProduct);
      setIsLoading(false);
    }
    loadProduct();
  }, [itemIndex]);

  if (isLoading) return <div className="loading-screen">Accessing Smart Contract...</div>;
 
  if (!product) {
    return (
      <div className="product-viewport flex flex-col items-center justify-center text-[var(--accent-color)] h-screen bg-[var(--bg-color)]">
        <h1 className="font-serif italic text-3xl mb-4">Asset Not Found</h1>
        <p className="mb-8 opacity-60">The ID "{itemId}" does not match any items in our records.</p>
        <Link to="/" className="px-6 py-2 border border-[var(--accent-color)] uppercase text-[10px] tracking-widest hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)] transition-all">
          Return to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="product-viewport font-sans">
      <nav className="main-nav">
        <div className="w-1/3">
          <Link to="/" className="back-link">
            <span className="arrow">←</span>
            <span className="back-text">Back</span>
          </Link>
        </div>
        
        <div className="w-1/3 text-center">
          <h1 className="platform-logo">COLLECTIVITY</h1>
        </div>

        <div className="w-1/3 flex justify-end items-center">
          {isLoggedIn ? (
            <div className="flex items-center gap-4 group cursor-pointer">
              <span className="profile-name">{user.username}</span>
              <div className="profile-avatar-container">
                <img 
                 // src={user.profileImageUrl}
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <Link to="/registration" className="sign-in-btn">
              Sign In
            </Link>
          )}
        </div>
      </nav>

import React from 'react';
import './productpage.css';

export default function ProductPage() {
  // We no longer need local isLoggedIn state here as the Header is in the Layout
  
  return (
    <>
      <div className="product-container">
        {/* LEFT PANEL: Visuals & Technicals */}
        <aside className="panel-visuals">
          <div className="visuals-top-stack">
            <div className="hero-image-aligned">
              <img 
                src={product.imageUrl} 
                className="w-full h-full object-cover" 
                alt={product.name} 
              />
            </div>
            <div className="thumb-scroller-aligned">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="thumb-box-aligned overflow-hidden">
                  <img src={product.imageUrl} className="w-full h-full object-cover opacity-40 hover:opacity-100 transition-opacity cursor-pointer" alt="Thumbnail" />
                </div>
              ))}
            </div>
          </div>

          <div className="info-technical-grid">
            <div className="tech-row">
              <div className="flex flex-col">
                <span className="label-gold-dim">Collection</span>
                <span className="tech-value">{product.collectionName}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="label-gold-dim">Asset Status</span>
                <span className="tech-value text-green-400">{product.status}</span>
              </div>
            </div>
            <div className="tech-row border-b-0">
              <div className="flex flex-col">
                <span className="label-gold-dim">Type</span>
                <span className="tech-value uppercase tracking-tighter">{product.type}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="label-gold-dim">ID Reference</span>
                <span className="tech-value text-[var(--accent-color)] font-bold">
                  {/* SAFE CONVERSION: String() ensures padStart works even if id is a number */}
                  #{String(product.id).padStart(4, '0')}
                </span>
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
                <span className="label-gold">Origin</span>
                <span className="category-text">{product.collectionName}</span>
              </div>
              <div className="meta-stack text-right items-end">
                <span className="label-gold">Tags</span>
                <div className="tag-cloud-inline">
                  {product.tags && product.tags.slice(0, 10).map(tag => (
                    <button key={tag} className="tag-item transition-transform duration-300 ease-in-out 
                   hover:scale-105 active:scale-95">#{tag}</button>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <div className="description-box">
            <span className="label-gold block mb-2">Item Description</span>
            <p className="description-text">
              The {product.name} is a high-value {product.type} belonging to the {product.collectionName} collection. 
              A unique digital artifact verified on the Collectivity platform.
            </p>
          </div>

          <div className="history-section">
            <span className="label-gold mb-4 block">Transaction History</span>
            <div className="history-scroll-container">
              {[1, 2, 3].map((item) => (
                <div key={item} className="history-row">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Ownership Transfer</span>
                    <span className="text-[10px] opacity-40 font-mono text-[var(--text-color)]">0x71C...{8000 + item}</span>
                  </div>
                  <div className="text-right flex flex-col gap-1">
                    <span className="block text-sm text-[var(--accent-color)] font-bold">EST. VALUE</span>
                    <span className="text-[10px] opacity-40 text-[var(--text-color)]">JAN 2026</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button className="w-full mt-8 py-4 bg-[var(--accent-color)] text-[var(--bg-color)] font-bold uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-lg active:scale-[0.98]">
            Initiate Acquisition
          </button>
        </main>
      </div>
    </>
  );
}