import React, { useState } from 'react';
import './CreateCollectible.css';

export default function CreateCollectible() {
  const categoryPool = ["Numismatics", "Fine Art", "Horology", "Vintage Tech", "Automobilia", "Jewelry", "First Editions", "Wine & Spirits"];
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

  return (
    <div className="product-container h-full max-h-full overflow-hidden box-border bg-[#0a0a0a] text-white flex flex-row p-8 pb-8 gap-8">
      
      {/* COLUMN 1: Identity & Details (LEFT) */}
      <section className="flex-1 flex flex-col overflow-hidden pr-4 border-r border-white/10">
        <div className="mb-4 shrink-0">
          <span className="label-gold">Asset Identity</span>
          <input 
            type="text" 
            placeholder="COLLECTIBLE NAME" 
            className="w-full bg-transparent border-b border-white/10 py-2 outline-none text-2xl font-thin tracking-widest placeholder:opacity-10 focus:border-[var(--accent-color)] transition-colors uppercase"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="space-y-4 mb-6 shrink-0">
          <div>
            <span className="label-gold">Origin Year</span>
            <input type="number" placeholder="YYYY" className="w-full bg-transparent border-b border-white/10 py-1 outline-none text-[var(--accent-color)] font-mono text-sm" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
          </div>
          <div>
            <span className="label-gold">Valuation</span>
            <input type="text" placeholder="$ 0.00" className="w-full bg-transparent border-b border-white/10 py-1 outline-none text-[var(--accent-color)] font-mono text-sm" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
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

      {/* COLUMN 2: Media (CENTER) */}
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

      {/* COLUMN 3: Classification & Action (RIGHT) */}
      <aside className="w-1/4 flex flex-col border-l border-white/10 pl-6 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Category Vault */}
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
                    className={`vault-btn text-[9px] px-2 py-1.5 uppercase border ${formData.category === cat ? 'border-[var(--accent-color)] text-[var(--accent-color)]' : 'border-white/10 opacity-60 hover:opacity-100'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tag Vault */}
          <div className="flex flex-col h-[45%] overflow-hidden min-h-0">
            <span className="label-gold">Asset Tags</span>
            <div className="active-tag-box min-h-[50px] max-h-[70px] border border-white/10 mt-2 p-2 bg-white/5 flex flex-wrap gap-1 content-start overflow-y-auto custom-scrollbar">
              {formData.tags.map(t => (
                <span key={t} className="bg-[var(--accent-color)] text-black px-2 py-0.5 text-[8px] font-black uppercase rounded-sm">
                  {t}
                </span>
              ))}
            </div>
            <input 
              type="text" 
              placeholder="Filter..." 
              className="vault-search-input mt-2"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
            />
            <div className="vault-scroll-box mt-2 flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex flex-wrap gap-2 pb-4">
                {filteredTags.map(tag => (
                  <button 
                    key={tag} 
                    onClick={() => toggleTag(tag)}
                    className={`vault-btn text-[9px] px-2 py-1.5 uppercase border ${formData.tags.includes(tag) ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-color)]/5' : 'border-white/10 opacity-40 hover:opacity-100'}`}
                  >
                    {formData.tags.includes(tag) ? `✕ ${tag}` : `+ ${tag}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FINAL ACTION: Bottom Right */}
        <button className="w-full py-5 mt-4 border border-[var(--accent-color)] text-[var(--accent-color)] uppercase tracking-[0.5em] text-[10px] font-black hover:bg-[var(--accent-color)] hover:text-black transition-all shrink-0">
          Import to Vault
        </button>
      </aside>

    </div>
  );
}