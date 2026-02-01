import { useState } from "react";
import pb from "../lib/pocketbase"; 
import defaultAvatar from "../assets/images/Avatar_Photo.jpg";
import { useSettings } from "../context/SettingsContext";
import "./settings.css";

export default function SettingsPage() {
  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>
      <AccountSettings />
      <VisualSettings />
    </div>
  );
}

function AccountSettings() {
  const [option, setOption] = useState("");
  const [openAccount, setOpenAccount] = useState(false);

  // Form States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [profileBanner, setProfileBanner] = useState(null);

  const currentUser = pb.authStore.model;

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert("No user logged in!");

    // IMPORTANT: PocketBase requires FormData for file uploads
    const formData = new FormData();

    try {
      // Logic: Only append data if that specific option is selected and has a value
      if (option === "Change Username" && username) {
        formData.append("name", username);
      }
      if (option === "Change Email" && email) {
        formData.append("email", email);
      }
      if (option === "Change Password" && password) {
        formData.append("password", password);
        formData.append("passwordConfirm", password);
      }
      
      // FILE UPLOADS: This is what talks to your DB columns
      if (option === "Change Profile Picture" && profilePic) {
        formData.append("avatar", profilePic); // Must match field name 'avatar' in PB
      }
      if (option === "Change Profile Banner" && profileBanner) {
        formData.append("banner", profileBanner); // Must match field name 'banner' in PB
      }

      // Update the database
      await pb.collection("users").update(currentUser.id, formData);
      
      alert("Database updated successfully!");
      
      // Cleanup: Clear states so the old values don't stick around
      setOption("");
      setUsername("");
      setPassword("");
      setEmail("");
      setProfilePic(null);
      setProfileBanner(null);

    } catch (err) {
      console.error("DB Update Error:", err);
      alert("FAILED TO UPDATE DATABASE: " + err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Delete your account permanently? This cannot be undone.")) {
      try {
        await pb.collection("users").delete(currentUser.id);
        pb.authStore.clear(); 
        window.location.reload(); 
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="settings-section">
      <h2 className="section-title">Account Settings</h2>

      <div className="dropdown">
        <div className="dropdown-label">Select an Option</div>
        <div className="dropdown-selected" onClick={() => setOpenAccount(!openAccount)}>
          {option === "" ? "Choose..." : option}
          <span className={`arrow ${openAccount ? "open" : ""}`}></span>
        </div>

        {openAccount && (
          <div className="dropdown-menu">
            <div className="dropdown-item" onClick={() => { setOption("Change Username"); setOpenAccount(false); }}>Change Username</div>
            <div className="dropdown-item" onClick={() => { setOption("Change Password"); setOpenAccount(false); }}>Change Password</div>
            <div className="dropdown-item" onClick={() => { setOption("Change Email"); setOpenAccount(false); }}>Change Email</div>
            <div className="dropdown-item" onClick={() => { setOption("Change Profile Picture"); setOpenAccount(false); }}>Change Profile Picture</div>
            <div className="dropdown-item" onClick={() => { setOption("Change Profile Banner"); setOpenAccount(false); }}>Change Profile Banner</div>
            <div className="dropdown-item" onClick={() => { setOption("Delete Account"); setOpenAccount(false); }} style={{color: 'red'}}>Delete Account</div>
          </div>
        )}
      </div>

      <form onSubmit={handleUpdate}>
        {option === "Change Username" && (
          <div className="settings-input-group">
            <label>New Username</label>
            <input type="text" className="settings-input" value={username} onChange={(e) => setUsername(e.target.value)} />
            <button type="submit" className="settings-button">Update Username</button>
          </div>
        )}

        {option === "Change Password" && (
          <div className="settings-input-group">
            <label>New Password</label>
            <input type="password" placeholder="••••••••" className="settings-input" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="settings-button">Update Password</button>
          </div>
        )}

        {option === "Change Email" && (
          <div className="settings-input-group">
            <label>New Email</label>
            <input type="email" className="settings-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit" className="settings-button">Update Email</button>
          </div>
        )}

        {option === "Change Profile Picture" && (
          <div className="settings-input-group">
            <label>New Profile Picture</label>
            <div className="profile-preview">
              <img src={profilePic ? URL.createObjectURL(profilePic) : defaultAvatar} alt="Profile Preview" />
            </div>
            <input type="file" accept="image/*" onChange={(e) => setProfilePic(e.target.files[0])} />
            <button type="submit" className="settings-button">Update Profile Picture</button>
          </div>
        )}

        {option === "Change Profile Banner" && (
          <div className="settings-input-group">
            <label>New Profile Banner</label>
            <div className="banner-preview" style={{width: '100%', height: '80px', backgroundColor: '#333', borderRadius: '4px', margin: '10px 0', overflow: 'hidden'}}>
                {profileBanner ? (
                  <img src={URL.createObjectURL(profileBanner)} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt="Banner Preview" />
                ) : (
                  <div style={{color: '#666', textAlign: 'center', lineHeight: '80px'}}>No File Selected</div>
                )}
            </div>
            <input type="file" accept="image/*" onChange={(e) => setProfileBanner(e.target.files[0])} />
            <button type="submit" className="settings-button">Update Profile Banner</button>
          </div>
        )}

        {option === "Delete Account" && (
          <div className="settings-input-group">
            <label>This action is irreversible.</label>
            <button type="button" className="settings-button" style={{backgroundColor: '#ff4d4d'}} onClick={handleDeleteAccount}>
              Confirm Delete
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function VisualSettings() {
  const { theme, setTheme, fontSize, setFontSize } = useSettings();
  const [openTheme, setOpenTheme] = useState(false);
  const [openFont, setOpenFont] = useState(false);

  return (
    <div className="settings-section">
      <h2 className="section-title">Visual Settings</h2>

      <div className="dropdown">
        <div className="dropdown-label">Theme</div>
        <div className="dropdown-selected" onClick={() => setOpenTheme(!openTheme)}>
          {theme.charAt(0).toUpperCase() + theme.slice(1)}
          <span className={`arrow ${openTheme ? "open" : ""}`}></span>
        </div>
        {openTheme && (
          <div className="dropdown-menu">
            {["system", "light", "dark"].map(t => (
              <div key={t} className="dropdown-item" onClick={() => { setTheme(t); setOpenTheme(false); }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dropdown">
        <div className="dropdown-label">Font Size</div>
        <div className="dropdown-selected" onClick={() => setOpenFont(!openFont)}>
          {fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}
          <span className={`arrow ${openFont ? "open" : ""}`}></span>
        </div>
        {openFont && (
          <div className="dropdown-menu">
            {["small", "medium", "large"].map(size => (
              <div key={size} className="dropdown-item" onClick={() => { setFontSize(size); setOpenFont(false); }}>
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}