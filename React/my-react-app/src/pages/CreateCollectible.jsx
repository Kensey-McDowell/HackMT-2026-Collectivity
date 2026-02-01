import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import './CreateCollectible.css';
import pb from '../lib/pocketbase';

const PB_COLLECTABLES = 'collectables';
const PB_LEDGER = 'activity_ledger';

export default function CreateCollectible() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditMode = Boolean(id);

  const [categoryPool, setCategoryPool] = useState([]);
  const [tagPool, setTagPool] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null); 

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

  // 1. Load Resources
  useEffect(() => {
    async function loadResources() {
      try {
        const [cats, tags] = await Promise.all([
          pb.collection('categories').getFullList({ sort: 'name' }),
          pb.collection('tags').getFullList({ sort: 'name' })
        ]);
        setCategoryPool(cats);
        setTagPool(tags);
      } catch (err) {
        console.error("Failed to load schema resources:", err);
      }
    }
    loadResources();
  }, []);

  // 2. Fetch existing data for Edit Mode
  useEffect(() => {
    if (isEditMode) {
      async function fetchAsset() {
        try {
          const record = await pb.collection(PB_COLLECTABLES).getOne(id);
          
          setFormData({
            name: record.name || '',
            description: record.description || '',
            year: record.year || '',
            value: record.estimated_value || '',
            category: record.category || '',
            tags: record.tags || [],
            images: [] 
          });

          if (record.images && record.images.length > 0) {
            setPreviewUrl(pb.files.getURL(record, record.images[0]));
          }
        } catch (err) {
          console.error("Fetch Error:", err);
        }
      }
      fetchAsset();
    }
  }, [id, isEditMode]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 4) return;
    setFormData({ ...formData, images: [...formData.images, ...files] });
    if (files[0]) setPreviewUrl(URL.createObjectURL(files[0]));
  };

  const toggleTag = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId) 
        ? prev.tags.filter(id => id !== tagId) 
        : [...prev.tags, tagId]
    }));
  };

  const filteredCats = categoryPool.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()));
  const filteredTags = tagPool.filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase()));

  // 3. THE LEDGER LOGIC (Background Update)
  const logToLedger = async (targetId, action, prev, next) => {
    try {
      // Force string ID to ensure Relation field is satisfied
      const cleanId = typeof targetId === 'object' ? targetId.id : targetId;
      
      await pb.collection(PB_LEDGER).create({
        collectible_id: cleanId, // Relation to collectables
        action: action,          // Plain Text
        previous_value: String(prev),
        new_value: String(next),
        changed_by: currentUser.id // Relation to users
      });
    } catch (err) {
      console.error("Ledger Logging Failed:", err);
    }
  };

  const handleImportToVault = async () => {
    setError(null);
    setShowSuccess(false);
    
    if (!pb.authStore.isValid || !currentUser) {
      setError('Unauthorized access.');
      return;
    }

    const price = Math.round(parseFloat(String(formData.value).replace(/[$,]/g, '')) || 0);
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      fd.append('description', formData.description.trim());
      fd.append('estimated_value', price); 
      fd.append('year', Number(formData.year) || 0);
      fd.append('category', formData.category);
      formData.tags.forEach(t => fd.append('tags', t));
      if (formData.images?.length) {
        formData.images.forEach((file) => fd.append('images', file, file.name));
      }

      if (isEditMode) {
        // Fetch old state for accurate logging before update
        const old = await pb.collection(PB_COLLECTABLES).getOne(id);
        
        await pb.collection(PB_COLLECTABLES).update(id, fd);

        // Comparison Logging to Ledger using the 'id' from useParams
        if (old.name !== formData.name) 
          await logToLedger(id, "Identity Rename", old.name, formData.name);
        
        if (old.estimated_value !== price) 
          await logToLedger(id, "Price Update", `$${old.estimated_value}`, `$${price}`);
        
        if (old.category !== formData.category) {
            const oldCatName = categoryPool.find(c => c.id === old.category)?.name || "Unknown";
            const newCatName = categoryPool.find(c => c.id === formData.category)?.name || "Unknown";
            await logToLedger(id, "Classification Change", oldCatName, newCatName);
        }

      } else {
        // NEW RECORD CREATION
        fd.append('created_by', currentUser.id);
        const newRecord = await pb.collection(PB_COLLECTABLES).create(fd);
        
        // Log Initial Creation linked to the newly generated PocketBase ID
        await logToLedger(newRecord.id, "Genesis Mint", "VOID", `Asset: ${formData.name}`);
      }

      setShowSuccess(true);
    } catch (err) {
      setError(err?.message || 'Transaction failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="product-container h-full max-h-full overflow-hidden box-border bg-[#0a0a0a] text-white flex flex-row p-8 pb-8 gap-8">
      
      {/* COLUMN 1: Identity */}
      <section className="flex-1 flex flex-col overflow-hidden pr-4 border-r border-white/10">
        <div className="mb-4 shrink-0">
          <span className="label-gold">{isEditMode ? 'Modify Identity' : 'Vault New Asset'}</span>
          <input 
            type="text" 
            placeholder="COLLECTIBLE NAME" 
            className="w-full bg-transparent border-b border-white/10 py-2 outline-none text-2xl font-thin tracking-widest focus:border-[var(--accent-color)] transition-colors uppercase"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="space-y-4 mb-6 shrink-0">
          <div>
            <span className="label-gold">Origin Year</span>
            <input type="number" className="w-full bg-transparent border-b border-white/10 py-1 outline-none text-[var(--accent-color)] font-mono text-sm" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
          </div>
          <div>
            <span className="label-gold">Valuation</span>
            <span className="flex items-baseline border-b border-white/10 py-1">
              <span className="text-[var(--accent-color)] font-mono text-sm mr-1">$</span>
              <input type="text" className="flex-1 min-w-0 bg-transparent outline-none text-[var(--accent-color)] font-mono text-sm" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
            </span>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          <span className="label-gold">Provenance & Story</span>
          <textarea 
            className="flex-1 w-full bg-white/5 border border-white/10 p-4 mt-2 outline-none resize-none text-xs leading-relaxed font-light focus:border-[var(--accent-color)]/30 transition-colors custom-scrollbar"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>
      </section>

      {/* COLUMN 2: Media */}
      <section className="w-[40%] flex flex-col overflow-hidden">
        <span className="label-gold mb-2 text-center">Visual Verification</span>
        <div className="flex-1 border border-white/10 relative bg-white/5 group hover:border-[var(--accent-color)]/50 transition-colors overflow-hidden">
          <input type="file" id="file-upload" className="hidden" multiple onChange={handleFileChange} accept="image/*" />
          <label htmlFor="file-upload" className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-10">
            {!previewUrl && <span className="label-gold text-[10px] opacity-40">+ Upload Asset Media</span>}
          </label>
          {previewUrl && <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover" alt="Primary" />}
        </div>
        
        <div className="grid grid-cols-4 gap-3 mt-4 h-20 shrink-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-white/10 bg-black overflow-hidden relative">
              {formData.images[i] ? <img src={URL.createObjectURL(formData.images[i])} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-10 text-[8px]">BUFFER_{i+1}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* COLUMN 3: Settings & Submission */}
      <aside className="w-1/4 flex flex-col border-l border-white/10 pl-6 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col h-[45%] mb-4 min-h-0">
            <span className="label-gold">Classification</span>
            <div className="active-display-box h-10 mt-2 flex items-center justify-center border border-[var(--accent-color)] bg-[var(--accent-color)]/5 uppercase tracking-[0.2em] font-bold text-[var(--accent-color)] text-[9px]">
              {categoryPool.find(c => c.id === formData.category)?.name || "Unclassified"}
            </div>
            <input type="text" placeholder="Filter..." className="vault-search-input mt-2" value={catSearch} onChange={(e) => setCatSearch(e.target.value)} />
            <div className="vault-scroll-box mt-2 flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex flex-wrap gap-2">
                {filteredCats.map(cat => (
                  <button key={cat.id} onClick={() => setFormData({...formData, category: cat.id})} className={`vault-btn text-[9px] px-2 py-1.5 uppercase border transition-all ${formData.category === cat.id ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-color)]/10' : 'border-white/10 opacity-60 hover:opacity-100'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col h-[45%] overflow-hidden min-h-0">
            <span className="label-gold">Encryption Tags</span>
            <input type="text" placeholder="Search Tags..." className="vault-search-input mt-2" value={tagSearch} onChange={(e) => setTagSearch(e.target.value)} />
            <div className="vault-scroll-box mt-3 flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex flex-wrap gap-2 pb-4">
                {filteredTags.map(tag => (
                  <button key={tag.id} onClick={() => toggleTag(tag.id)} className={`px-3 py-1.5 text-[9px] uppercase tracking-tighter border rounded-sm transition-all ${formData.tags.includes(tag.id) ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-black font-bold' : 'border-white/10 opacity-50 hover:opacity-100'}`}>
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-[9px] mt-2 italic bg-red-400/10 p-2 border border-red-400/20">{error}</p>}
        
        <button type="button" onClick={handleImportToVault} disabled={isSubmitting} className="w-full py-5 mt-4 border border-[var(--accent-color)] text-[var(--accent-color)] uppercase tracking-[0.5em] text-[10px] font-black hover:bg-[var(--accent-color)] hover:text-black transition-all shrink-0">
          {isSubmitting ? 'Syncing Ledger...' : (isEditMode ? 'Sign Transaction' : 'Vault Asset')}
        </button>
      </aside>

      {showSuccess && (
        <div className="create-success-overlay" onClick={() => navigate(`/profile/${currentUser.id}`)}>
          <div className="create-success-modal" onClick={e => e.stopPropagation()}>
            <h2 className="create-success-title">{isEditMode ? 'Transaction Recorded' : 'Genesis Complete'}</h2>
            <p className="create-success-text">Changes have been permanently hashed to the asset ledger.</p>
            <button type="button" className="create-success-dismiss" onClick={() => navigate(`/profile/${currentUser.id}`)}>View Profile</button>
          </div>
        </div>
      )}
    </div>
  );
}