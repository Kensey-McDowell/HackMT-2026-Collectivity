import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CollectibleCard from '../components/collectibleCard';
import { printAllCollectibles } from '../js/testTransaction.js';
import './social.css';

export default function Social() {
  const [collectibles, setCollectibles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCollectibles() {
      try {
        setIsLoading(true);
        const items = await printAllCollectibles();
        setCollectibles(items || []);
      } catch (err) {
        console.error('Failed to load collectibles:', err);
        setCollectibles([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadCollectibles();
  }, []);

  if (isLoading) {
    return (
      <div className="social-loading">
        Loading Collectibles…
      </div>
    );
  }

  return (
    <div className="social-page">
      {/* HEADER */}
      <header className="social-header">
        <h1 className="social-title">Social Gallery</h1>
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
      </header>

      {/* CONTENT */}
      <section className="social-grid">
        {collectibles.length === 0 ? (
          <p className="empty-state">No collectibles found.</p>
        ) : (
          collectibles.map((item, index) => (
            <CollectibleCard
              key={item.Index ?? index}
              collectible={item}
            />
          ))
        )}
      </section>
    </div>
  );
}
