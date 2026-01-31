import { useState } from "react";
import defaultAvatar from "../assets/images/Avatar_Photo.jpg";

export default function SettingsPage() {
  return (
    <div className="min-h-screen p-6 bg-[var(--bg-color)] text-[var(--text-color)]">
      <h1 className="text-3xl font-semibold mb-6">Settings Page</h1>
      <AccountSettings />
      <VisualSettings />
    </div>
  );
}

function AccountSettings() {
  const [option, setOption] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);

  const inputClasses =
    "block mt-2 p-2 w-64 rounded bg-[var(--secondary-bg)] text-[var(--text-color)] border border-[var(--border-color)] shadow-sm";

  const buttonClasses =
    "mt-3 px-4 py-2 rounded bg-[var(--accent-color)] text-[var(--bg-color)] font-medium hover:bg-[var(--hover-color)] transition";

  const selectClasses =
    "p-2 mb-4 rounded bg-[var(--secondary-bg)] text-[var(--text-color)] border border-[var(--border-color)]";

  const handleChange = (field, value) => {
    if (field === "profilePic") {
      setProfilePic(value);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>

      <select
        value={option}
        onChange={(e) => setOption(e.target.value)}
        className={selectClasses}
      >
        <option value="">Select an Option</option>
        <option value="username">Change Username</option>
        <option value="password">Change Password</option>
        <option value="email">Change Email</option>
        <option value="profile">Change Profile Picture</option>
      </select>

      {option === "username" && (
        <div className="mt-4">
          <label className="block">New Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClasses}
          />
          <button className={buttonClasses}>Update Username</button>
        </div>
      )}

      {option === "password" && (
        <div className="mt-4">
          <label className="block">New Password</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
          />
          <button className={buttonClasses}>Update Password</button>
        </div>
      )}

      {option === "email" && (
        <div className="mt-4">
          <label className="block">New Email</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
          />
          <button className={buttonClasses}>Update Email</button>
        </div>
      )}

      {option === "profile" && (
        <div className="mt-4">
          <label className="block mb-2">New Profile Picture</label>

          <div className="w-24 h-24 rounded-full bg-[var(--secondary-bg)] border border-[var(--border-color)] flex items-center justify-center overflow-hidden mb-3">
            <img
              src={profilePic ? URL.createObjectURL(profilePic) : defaultAvatar}
              alt="Profile Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleChange("profilePic", e.target.files[0])}
            className="block text-sm text-[var(--text-color)]
              file:mr-4 file:py-2 file:px-4 file:rounded file:border-0
              file:bg-[var(--accent-color)] file:text-[var(--bg-color)]
              hover:file:bg-[var(--hover-color)]"
          />

          <button className={buttonClasses}>Update Profile Picture</button>
        </div>
      )}
    </div>
  );
}

function VisualSettings() {
  const [option, setOption] = useState("");
  return (
    <div className="p-4"> 
    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">Visual Settings</h2> 
  
    <select value={option} 
      onChange={(e) => setOption(e.target.value)} 
      className="bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] p-2 rounded-md" 
  > 
    <option value="">Select Visual Option</option> 
    <option value="theme">Change Theme</option> 
    <option value="font">Change Font Size</option> 
    <option value="layout">Change Layout</option>
</select>
   </div>
  );
}
