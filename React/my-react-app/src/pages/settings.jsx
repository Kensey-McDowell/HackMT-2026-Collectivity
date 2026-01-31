import { useState } from "react";
import defaultAvatar from "../assets/images/Avatar_Photo.jpg";
import { useSettings } from "../context/SettingsContext";

export default function SettingsPage() {
  return (
    <div style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)", minHeight: "100vh", padding: "24px" }}>
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

  const inputStyle = {
    marginTop: "8px",
    padding: "8px",
    width: "256px",
    borderRadius: "6px",
    backgroundColor: "var(--secondary-bg)",
    color: "var(--text-color)",
    border: "1px solid var(--border-color)"
  };

  const buttonStyle = {
    marginTop: "12px",
    padding: "8px 16px",
    borderRadius: "6px",
    backgroundColor: "var(--accent-color)",
    color: "var(--bg-color)",
    fontWeight: "500",
    cursor: "pointer"
  };

  return (
    <div>
      <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "16px" }}>Account Settings</h2>

      <select
        value={option}
        onChange={(e) => setOption(e.target.value)}
        style={inputStyle}
      >
        <option value="">Select an Option</option>
        <option value="username">Change Username</option>
        <option value="password">Change Password</option>
        <option value="email">Change Email</option>
        <option value="profile">Change Profile Picture</option>
      </select>

      {option === "username" && (
        <div style={{ marginTop: "16px" }}>
          <label>New Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} />
          <button style={buttonStyle}>Update Username</button>
        </div>
      )}

      {option === "password" && (
        <div style={{ marginTop: "16px" }}>
          <label>New Password</label>
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          <button style={buttonStyle}>Update Password</button>
        </div>
      )}

      {option === "email" && (
        <div style={{ marginTop: "16px" }}>
          <label>New Email</label>
          <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <button style={buttonStyle}>Update Email</button>
        </div>
      )}

      {option === "profile" && (
        <div style={{ marginTop: "16px" }}>
          <label>New Profile Picture</label>

          <div style={{
            width: "96px",
            height: "96px",
            borderRadius: "50%",
            backgroundColor: "var(--secondary-bg)",
            border: "1px solid var(--border-color)",
            overflow: "hidden",
            marginBottom: "12px"
          }}>
            <img
              src={profilePic ? URL.createObjectURL(profilePic) : defaultAvatar}
              alt="Profile Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <input type="file" accept="image/*" onChange={(e) => setProfilePic(e.target.files[0])} />
          <button style={buttonStyle}>Update Profile Picture</button>
        </div>
      )}
    </div>
  );
}


function VisualSettings() {
  const { theme, setTheme, fontSize, setFontSize } = useSettings();
  const [option, setOption] = useState("");

  const boxStyle = {
    marginTop: "40px",
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: "var(--secondary-bg)",
    color: "var(--text-color)"
  };

  const buttonStyle = {
    marginRight: "8px",
    padding: "6px 12px",
    borderRadius: "6px",
    backgroundColor: "var(--accent-color)",
    color: "var(--bg-color)",
    cursor: "pointer"
  };

  return (
    <div style={boxStyle}>
      <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "16px" }}>Visual Settings</h2>

      <select value={option} onChange={(e) => setOption(e.target.value)} style={{ padding: "8px", borderRadius: "6px" }}>
        <option value="">Select Visual Option</option>
        <option value="theme">Change Theme</option>
        <option value="font">Change Font Size</option>
      </select>

      {option === "theme" && (
        <div style={{ marginTop: "16px" }}>
          <button style={buttonStyle} onClick={() => setTheme("light")}>Light</button>
          <button style={buttonStyle} onClick={() => setTheme("dark")}>Dark</button>
          <button style={buttonStyle} onClick={() => setTheme("system")}>System</button>
        </div>
      )}

      {option === "font" && (
        <div style={{ marginTop: "16px" }}>
          <button style={buttonStyle} onClick={() => setFontSize("small")}>Small</button>
          <button style={buttonStyle} onClick={() => setFontSize("medium")}>Medium</button>
          <button style={buttonStyle} onClick={() => setFontSize("large")}>Large</button>
        </div>
      )}
    </div>
  );
}
