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

      const foundProduct = allItems.find(
        i => String(i.Index).toLowerCase() === String(itemIndex).toLowerCase()
      );

      setProduct(foundProduct || null);
      setIsLoading(false);
    }

    loadProduct();
  }, [itemIndex]);

  if (isLoading) {
    return <div className="loading-screen">Accessing Smart Contract...</div>;
  }

  if (!product) {
    return (
      <div className="product-viewport flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl mb-4">Asset Not Found</h1>
        <p className="mb-8 opacity-60">
          The ID "{itemIndex}" does not match any items in our records.
        </p>
        <Link to="/" className="sign-in-btn">
          Return to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="product-viewport font-sans">
      {/* NAV */}
      <nav className="main-nav">
        <div className="w-1/3">
          <Link to="/" className="back-link">
            ← Back
          </Link>
        </div>
        <div className="w-1/3 text-center">
          <h1 className="platform-logo">COLLECTIVITY</h1>
        </div>
        <div className="w-1/3" />
      </nav>

      {/* PRODUCT BODY */}
      <div className="product-container">
        {/* LEFT PANEL */}
        <aside className="panel-visuals">
          <div className="hero-image-aligned">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="info-technical-grid">
            <div className="tech-row">
              <div>
                <span className="label-gold-dim">Collection</span>
                <span className="tech-value">{product.collectionName}</span>
              </div>
              <div className="text-right">
                <span className="label-gold-dim">Status</span>
                <span className="tech-value">{product.status}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <main className="panel-info">
          <h2 className="product-title">{product.collectible_name}</h2>

          <div className="description-box">
            <p>
              The {product.name} is a {product.type} from the{' '}
              {product.collectionName} collection.
            </p>
          </div>

          <button className="w-full mt-8 py-4 bg-[var(--accent-color)]">
            Initiate Acquisition
          </button>
        </main>
      </div>
    </div>
  );
}
