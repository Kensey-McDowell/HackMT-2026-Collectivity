import { useState, useEffect, useRef } from "react";
import defaultAvatar from "../assets/images/Avatar_Photo.jpg";
import { useSettings } from "../context/SettingsContext";
import pb from '../lib/pocketbase';
import "./settings.css";

export default function SettingsPage() {
  const currentUser = pb.authStore.model;
  const { theme, setTheme, fontSize, setFontSize } = useSettings();
  const [activeSection, setActiveSection] = useState(null); 
  const [walletAddress, setWalletAddress] = useState(null);
  
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // Dynamically fetch URLs from PocketBase or fallback to defaults
  const profileImageUrl = currentUser?.avatar 
    ? pb.files.getURL(currentUser, currentUser.avatar) 
    : defaultAvatar;

  const bannerUrl = currentUser?.banner 
    ? pb.files.getURL(currentUser, currentUser.banner) 
    : "https://i.etsystatic.com/34466454/r/il/5e9775/4175504808/il_fullxfull.4175504808_bdhn.jpg";

  // --- DATABASE UPDATE LOGIC ---
  const handleFileAction = async (e, type) => {
    e.preventDefault();
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      // Ensure 'type' matches your PocketBase field names ('avatar' and 'banner')
      formData.append(type, file);

      // Update the 'users' collection for the logged-in user
      await pb.collection('users').update(currentUser.id, formData);
      
      // Refresh the page to synchronize the AuthStore and display new images
      window.location.reload();
    } catch (err) {
      console.error(`Failed to sync ${type} to database:`, err);
      alert(`Error updating ${type}. Ensure the field exists in your PocketBase 'users' collection.`);
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      } catch (err) {
        console.error("Connection Refused", err);
      }
    } else {
      alert("MetaMask / Web3 Provider not detected.");
    }
  };

  return (
    <div className="settings-page h-screen overflow-hidden antialiased w-full flex flex-col p-4 md:p-6">
      <div className="w-full max-w-[1800px] mx-auto flex flex-col h-full">
        
        {/* HIDDEN INPUTS */}
        <input type="file" ref={avatarInputRef} className="hidden" onChange={(e) => handleFileAction(e, 'avatar')} />
        <input type="file" ref={bannerInputRef} className="hidden" onChange={(e) => handleFileAction(e, 'banner')} />

        {/* --- DYNAMIC BANNER --- */}
        <div 
          className="relative w-full rounded-md border border-[var(--border-color)] overflow-hidden cursor-pointer group mb-6 flex-shrink-0"
          style={{ 
            backgroundImage: `url(${bannerUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '140px' 
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleFileAction(e, 'banner')}
          onClick={() => bannerInputRef.current.click()}
        >
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="text-[9px] tracking-[0.4em] text-white font-bold uppercase">Update Banner</span>
          </div>

          <div 
            className="absolute bottom-3 left-6 group/avatar"
            onClick={(e) => { e.stopPropagation(); avatarInputRef.current.click(); }}
            onDrop={(e) => { e.stopPropagation(); handleFileAction(e, 'avatar'); }}
          >
            <img 
              src={profileImageUrl}
              className="w-20 h-20 rounded-full border border-[var(--accent-color)] object-cover bg-[var(--bg-color)] shadow-2xl transition-transform group-hover/avatar:scale-105" 
              alt="Avatar"
            />
          </div>
        </div>

        {/* --- MAIN DASHBOARD LAYOUT --- */}
        <div className="flex flex-1 gap-12 mb-4 min-h-0">
          
          {/* FAR LEFT: SECURITY VERTICAL */}
          <aside className="w-60 flex flex-col gap-5 flex-shrink-0">
             <span className="text-[9px] tracking-[0.5em] opacity-30 uppercase font-bold mb-2">Security Node</span>
              <button onClick={() => setActiveSection("username")} className={`setting-box-rect ${activeSection === 'username' ? 'active-box' : ''}`}>
                <span className="box-label-full">CHANGE USERNAME</span>
              </button>
              <button onClick={() => setActiveSection("password")} className={`setting-box-rect ${activeSection === 'password' ? 'active-box' : ''}`}>
                <span className="box-label-full">CHANGE PASSWORD</span>
              </button>
              <button onClick={() => setActiveSection("email")} className={`setting-box-rect ${activeSection === 'email' ? 'active-box' : ''}`}>
                <span className="box-label-full">CHANGE EMAIL</span>
              </button>
          </aside>

          {/* CENTER: ACTION AREA */}
          <main className="flex-1 bg-white/[0.01] border border-white/[0.03] rounded-xl flex items-center justify-center relative">
            {activeSection ? (
              <div className="w-full max-w-md p-10 animate-fade-in">
                <ActionArea 
                  type={activeSection} 
                  theme={theme} setTheme={setTheme}
                  fontSize={fontSize} setFontSize={setFontSize}
                  close={() => setActiveSection(null)} 
                />
              </div>
            ) : (
              <div className="flex flex-col items-center opacity-10">
                <span className="italic tracking-[0.8em] text-[10px] uppercase">Initialize Terminal</span>
              </div>
            )}
          </main>

          {/* FAR RIGHT: VISUAL & WALLET */}
          <aside className="w-60 flex flex-col gap-5 flex-shrink-0">
            <span className="text-[9px] tracking-[0.5em] opacity-30 uppercase font-bold mb-2 text-right">Interface Matrix</span>
              <button onClick={() => setActiveSection("theme")} className={`setting-box-rect ${activeSection === 'theme' ? 'active-box' : ''}`}>
                <span className="box-label-full">SYSTEM THEME</span>
              </button>
              <button onClick={() => setActiveSection("font")} className={`setting-box-rect ${activeSection === 'font' ? 'active-box' : ''}`}>
                <span className="box-label-full">TEXT SCALING</span>
              </button>
              
              <button 
                onClick={connectWallet} 
                className={`setting-box-rect ${walletAddress ? 'active-wallet-border' : ''}`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="box-label-full">
                    {walletAddress ? "NODE CONNECTED" : "LINK METAFAUCET"}
                  </span>
                  {walletAddress && (
                    <span className="text-[7px] text-[var(--accent-color)] font-mono opacity-60 truncate w-32">
                      {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                    </span>
                  )}
                </div>
              </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ActionArea({ type, theme, setTheme, fontSize, setFontSize, close }) {
  const [inputVal, setInputVal] = useState("");

  const Title = ({ text }) => (
    <div className="mb-10 text-center">
      <h3 className="label-gold tracking-[0.6em] uppercase text-[11px] font-bold">{text}</h3>
    </div>
  );

  switch (type) {
    case "username":
    case "password":
    case "email":
      return (
        <div className="flex flex-col items-center">
          <Title text={`MANAGE ${type}`} />
          <input 
            type={type === "password" ? "password" : "text"} 
            className="terminal-input-slim" 
            placeholder={`ENTER NEW ${type.toUpperCase()}`} 
            value={inputVal} 
            onChange={e => setInputVal(e.target.value)} 
          />
          <div className="flex gap-4 mt-10 w-full">
            <button className="flex-1 py-4 border border-[var(--accent-color)] text-[var(--accent-color)] text-[10px] tracking-[0.3em] hover:bg-[var(--accent-color)] hover:text-black transition-all" onClick={close}>AUTHORIZE</button>
            <button className="flex-1 py-4 border border-white/10 text-white/40 text-[10px] tracking-[0.3em] hover:bg-white/5 transition-all" onClick={close}>CANCEL</button>
          </div>
        </div>
      );
    case "theme":
      return (
        <div className="text-center">
          <Title text="ATMOSPHERE" />
          <div className="flex flex-col gap-4">
            {["system", "light", "dark"].map(t => (
              <button key={t} onClick={() => setTheme(t)} className={`py-5 border text-[10px] tracking-[0.5em] transition-all ${theme === t ? 'border-[var(--accent-color)] text-[var(--accent-color)]' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                {t.toUpperCase()}
              </button>
            ))}
            <button className="mt-6 text-[9px] opacity-30 tracking-[0.3em] uppercase hover:opacity-100 transition-opacity" onClick={close}>[ Exit Selection ]</button>
          </div>
        </div>
      );
    case "font":
      return (
        <div className="text-center">
          <Title text="MATRIX SCALE" />
          <div className="flex flex-col gap-4">
            {["small", "medium", "large"].map(f => (
              <button key={f} onClick={() => setFontSize(f)} className={`py-5 border text-[10px] tracking-[0.5em] transition-all ${fontSize === f ? 'border-[var(--accent-color)] text-[var(--accent-color)]' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                {f.toUpperCase()}
              </button>
            ))}
            <button className="mt-6 text-[9px] opacity-30 tracking-[0.3em] uppercase hover:opacity-100 transition-opacity" onClick={close}>[ Exit Selection ]</button>
          </div>
        </div>
      );
    default:
      return null;
  }
}