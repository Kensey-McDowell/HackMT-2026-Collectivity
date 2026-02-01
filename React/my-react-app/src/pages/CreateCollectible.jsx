import React, { useState } from 'react';
import './CreateCollectible.css';
import pb from '../lib/pocketbase';

const PB_COLLECTABLES = 'collectables';

function randomPbId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(15)), (b) => chars[b % chars.length]).join('');
}

export default function CreateCollectible() {
  const categoryPool = ["Cards", "Game Items", "Military Items", "Sneakers", "Sports"];
  const tagPool = ["Rare", "Mint", "Signed", "Limited", "Antique", "Restored", "Original Box", "Auction Grade", "Provenanced"];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    year: '',
    value: '',
    category: '',
    tags: [],
    images: []
  });

  const [catSearch, setCatSearch] = useState('');
  const [tagSearch, setTagSearch] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const currentUser = pb.authStore.model;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 4) return;
    setFormData({ ...formData, images: [...formData.images, ...files] });
  };

  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag) 
        : [...prev.tags, tag]
    }));
  };

  const filteredCats = categoryPool.filter(c => c.toLowerCase().includes(catSearch.toLowerCase()));
  const filteredTags = tagPool.filter(t => t.toLowerCase().includes(tagSearch.toLowerCase()));

  const handleImportToVault = async () => {
    setError(null);
    setShowSuccess(false);
    
    if (!pb.authStore.isValid || !currentUser) {
      setError('No active session found. Please sign in first.');
      return;
    }

    if (!formData.name.trim()) return setError('Collectible name is required.');
    if (!formData.category) return setError('Please select a category.');

    const priceRaw = parseFloat(String(formData.value).replace(/[$,]/g, '').trim()) || 0;
    const price = Math.round(priceRaw);

    setIsSubmitting(true);

    try {
      // Create FormData for PocketBase (handles files and text fields)
      const recordId = randomPbId();
      const fd = new FormData();
      
      fd.append('id', recordId);
      fd.append('name', formData.name.trim());
      fd.append('description', formData.description.trim());
      fd.append('estimated_value', price); 
      fd.append('year', Number(formData.year) || 0);
      fd.append('created_by', currentUser.id); 
      fd.append('category', formData.category);
      fd.append('tags', JSON.stringify(formData.tags));

      if (formData.images?.length) {
        formData.images.forEach((file) => fd.append('images', file, file.name));
      }

      // Direct write to PocketBase
      await pb.collection(PB_COLLECTABLES).create(fd);

      setShowSuccess(true);
      setFormData({ name: '', description: '', year: '', value: '', category: '', tags: [], images: [] });
      
    } catch (err) {
      console.error("Vault Error:", err);
      const msg = err?.data?.message ?? err?.message ?? 'Failed to secure asset in database.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="product-container h-full max-h-full overflow-hidden box-border bg-[#0a0a0a] text-white flex flex-row p-8 pb-8 gap-8">
      
      {/* COLUMN 1: Identity */}
      <section className="flex-1 flex flex-col overflow-hidden pr-4 border-r border-white/10">
        <div className="mb-4 shrink-0">
          <span className="label-gold">Asset Identity</span>
          <input 
            type="text" 
            placeholder="COLLECTIBLE NAME" 
            className="w-full bg-transparent border-b border-white/10 py-2 outline-none text-2xl font-thin tracking-widest focus:border-[var(--accent-color)] transition-colors uppercase"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          {currentUser && (
            <div className="flex items-center gap-2 mt-2 opacity-40">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-[8px] font-mono uppercase tracking-tighter">
                Verified Owner: {currentUser.name || currentUser.id}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 mb-6 shrink-0">
          <div>
            <span className="label-gold">Origin Year</span>
            <input type="number" placeholder="YYYY" className="w-full bg-transparent border-b border-white/10 py-1 outline-none text-[var(--accent-color)] font-mono text-sm" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
          </div>
          <div>
            <span className="label-gold">Valuation</span>
            <span className="flex items-baseline border-b border-white/10 py-1">
              <span className="text-[var(--accent-color)] font-mono text-sm mr-1">$</span>
              <input type="text" placeholder="0.00" className="flex-1 min-w-0 bg-transparent outline-none text-[var(--accent-color)] font-mono text-sm" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
            </span>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          <span className="label-gold">Provenance & Story</span>
          <textarea 
            placeholder="The documented history of this asset..." 
            className="flex-1 w-full bg-white/5 border border-white/10 p-4 mt-2 outline-none resize-none text-xs leading-relaxed font-light focus:border-[var(--accent-color)]/30 transition-colors custom-scrollbar"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>
      </section>

      {/* COLUMN 2: Media */}
      <section className="w-[40%] flex flex-col overflow-hidden">
        <span className="label-gold mb-2 text-center">Step 03 — Media</span>
        <div className="flex-1 border border-white/10 relative bg-white/5 group hover:border-[var(--accent-color)]/50 transition-colors overflow-hidden">
          <input type="file" id="file-upload" className="hidden" multiple onChange={handleFileChange} accept="image/*" />
          <label htmlFor="file-upload" className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-10">
            {!formData.images[0] && <span className="label-gold text-[10px] opacity-40">+ Add Primary Asset</span>}
          </label>
          {formData.images[0] && <img src={URL.createObjectURL(formData.images[0])} className="absolute inset-0 w-full h-full object-cover" alt="Primary" />}
        </div>
        
        <div className="grid grid-cols-4 gap-3 mt-4 h-20 shrink-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-white/10 bg-black overflow-hidden relative">
              {formData.images[i] ? <img src={URL.createObjectURL(formData.images[i])} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-10 text-[8px]">SLOT {i+1}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* COLUMN 3: Classification */}
      <aside className="w-1/4 flex flex-col border-l border-white/10 pl-6 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          
          <div className="flex flex-col h-[45%] mb-4 min-h-0">
            <span className="label-gold">Category</span>
            <div className="active-display-box h-10 min-h-[40px] mt-2 flex items-center justify-center border border-[var(--accent-color)] bg-[var(--accent-color)]/5 uppercase tracking-[0.2em] font-bold text-[var(--accent-color)] text-[9px]">
              {formData.category || "Select Category"}
            </div>
            <input 
              type="text" 
              placeholder="Filter..." 
              className="vault-search-input mt-2"
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
            />
            <div className="vault-scroll-box mt-2 flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex flex-wrap gap-2">
                {filteredCats.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setFormData({...formData, category: cat})}
                    className={`vault-btn text-[9px] px-2 py-1.5 uppercase border transition-all ${formData.category === cat ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-color)]/10' : 'border-white/10 opacity-60 hover:opacity-100'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col h-[45%] overflow-hidden min-h-0">
            <span className="label-gold">Asset Tags</span>
            <input 
              type="text" 
              placeholder="Search Tags..." 
              className="vault-search-input mt-2"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
            />
            <div className="vault-scroll-box mt-3 flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex flex-wrap gap-2 pb-4">
                {filteredTags.map(tag => {
                  const isSelected = formData.tags.includes(tag);
                  return (
                    <button 
                      key={tag} 
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 text-[9px] uppercase tracking-tighter border rounded-sm transition-all duration-200 
                        ${isSelected 
                          ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-black font-bold' 
                          : 'border-white/10 opacity-50 hover:opacity-100'}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-[9px] mt-2 italic bg-red-400/10 p-2 border border-red-400/20">{error}</p>}
        
        <button
          type="button"
          onClick={handleImportToVault}
          disabled={isSubmitting}
          className="w-full py-5 mt-4 border border-[var(--accent-color)] text-[var(--accent-color)] uppercase tracking-[0.5em] text-[10px] font-black hover:bg-[var(--accent-color)] hover:text-black transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Securing Entry…' : 'Import to Vault'}
        </button>
      </aside>

      {/* Success modal */}
      {showSuccess && (
        <div className="create-success-overlay" onClick={() => setShowSuccess(false)}>
          <div className="create-success-modal" onClick={e => e.stopPropagation()}>
            <h2 className="create-success-title">Vaulting Complete</h2>
            <p className="create-success-text">Asset metadata secured under Owner ID: {currentUser.id}</p>
            <button type="button" className="create-success-dismiss" onClick={() => setShowSuccess(false)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}