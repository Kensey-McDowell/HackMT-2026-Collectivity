import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateCollectible.css'; // New CSS file for specific creation styles

export default function CreateCollectible() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null
  });

  const handleNext = () => {
    // Navigate to the next step (category/tags)
    navigate('/create/step-2', { state: { formData } });
  };

  return (
    <div className="product-container">
      {/* LEFT PANEL: Image Upload Area */}
      <aside className="panel-visuals">
        <div className="visuals-top-stack h-full">
          <div className="hero-image-aligned h-full flex flex-col items-center justify-center border-dashed border-2">
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <span className="text-4xl mb-4 text-[var(--accent-color)]">+</span>
              <span className="label-gold">Upload Asset Media</span>
              <span className="text-[10px] opacity-40 mt-2 uppercase tracking-widest">JPG, PNG, OR MP4</span>
            </label>
            {formData.image && (
              <p className="mt-4 text-[10px] uppercase text-[var(--accent-color)]">
                Selected: {formData.image.name}
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* RIGHT PANEL: Basic Details */}
      <main className="panel-info flex flex-col justify-between">
        <div className="space-y-12">
          <header className="product-header">
            <span className="label-gold block mb-4">Step 01 — Identity</span>
            <input 
              type="text" 
              placeholder="COLLECTIBLE NAME"
              className="product-title w-full bg-transparent border-none outline-none text-right placeholder:opacity-20"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </header>

          <div className="description-box">
            <span className="label-gold block mb-4">Description</span>
            <textarea 
              placeholder="Tell the story of this piece..."
              className="description-text w-full bg-transparent border-b border-[var(--border-color)] outline-none min-h-[200px] resize-none pb-4"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        {/* BOTTOM RIGHT: Navigation Button */}
        <div className="flex justify-end mt-8">
          <button 
            onClick={handleNext}
            className="px-10 py-4 border border-[var(--accent-color)] text-[var(--accent-color)] text-xs font-bold uppercase tracking-[0.3em] hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)] transition-all"
          >
            Categorize Asset →
          </button>
        </div>
      </main>
    </div>
  );
}