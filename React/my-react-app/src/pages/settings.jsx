import { useState } from "react";
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

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);

  return (
    <div className="settings-section">
      <h2 className="section-title">Account Settings</h2>

      <div className="dropdown">
        <div className="dropdown-label">Select an Option</div>

        <div
          className="dropdown-selected"
          onClick={() => setOpenAccount(!openAccount)}
        >
          {option === "" ? "Choose..." : option}
          <span className={`arrow ${openAccount ? "open" : ""}`}></span>
        </div>

        {openAccount && (
          <div className="dropdown-menu">
            <div
              className="dropdown-item"
              onClick={() => {
                setOption("Change Username");
                setOpenAccount(false);
              }}
            >
              Change Username
            </div>

            <div
              className="dropdown-item"
              onClick={() => {
                setOption("Change Password");
                setOpenAccount(false);
              }}
            >
              Change Password
            </div>

            <div
              className="dropdown-item"
              onClick={() => {
                setOption("Change Email");
                setOpenAccount(false);
              }}
            >
              Change Email
            </div>

            <div
              className="dropdown-item"
              onClick={() => {
                setOption("Change Profile Picture");
                setOpenAccount(false);
              }}
            >
              Change Profile Picture
            </div>
          </div>
        )}
      </div>

      {option === "Change Username" && (
        <div className="settings-input-group">
          <label>New Username</label>
          <input
            type="text"
            className="settings-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button className="settings-button">Update Username</button>
        </div>
      )}

      {option === "Change Password" && (
        <div className="settings-input-group">
          <label>New Password</label>
          <input
            type="text"
            className="settings-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="settings-button">Update Password</button>
        </div>
      )}

      {option === "Change Email" && (
        <div className="settings-input-group">
          <label>New Email</label>
          <input
            type="text"
            className="settings-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="settings-button">Update Email</button>
        </div>
      )}

      {/* PROFILE PICTURE */}
      {option === "Change Profile Picture" && (
        <div className="settings-input-group">
          <label>New Profile Picture</label>

          <div className="profile-preview">
            <img
              src={profilePic ? URL.createObjectURL(profilePic) : defaultAvatar}
              alt="Profile Preview"
            />
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfilePic(e.target.files[0])}
          />

          <button className="settings-button">Update Profile Picture</button>
        </div>
      )}
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

        <div
          className="dropdown-selected"
          onClick={() => setOpenTheme(!openTheme)}
        >
          {theme.charAt(0).toUpperCase() + theme.slice(1)}
          <span className={`arrow ${openTheme ? "open" : ""}`}></span>
        </div>

        {openTheme && (
          <div className="dropdown-menu">
            <div
              className="dropdown-item"
              onClick={() => {
                setTheme("system");
                setOpenTheme(false);
              }}
            >
              System
            </div>

            <div
              className="dropdown-item"
              onClick={() => {
                setTheme("light");
                setOpenTheme(false);
              }}
            >
              Light
            </div>

            <div
              className="dropdown-item"
              onClick={() => {
                setTheme("dark");
                setOpenTheme(false);
              }}
            >
              Dark
            </div>
          </div>
        )}
      </div>

      {/* FONT SIZE DROPDOWN */}
      <div className="dropdown">
        <div className="dropdown-label">Font Size</div>

        <div
          className="dropdown-selected"
          onClick={() => setOpenFont(!openFont)}
        >
          {fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}
          <span className={`arrow ${openFont ? "open" : ""}`}></span>
        </div>

        {openFont && (
          <div className="dropdown-menu">
            <div
              className="dropdown-item"
              onClick={() => {
                setFontSize("small");
                setOpenFont(false);
              }}
            >
              Small
            </div>

            <div
              className="dropdown-item"
              onClick={() => {
                setFontSize("medium");
                setOpenFont(false);
              }}
            >
              Medium
            </div>

            <div
              className="dropdown-item"
              onClick={() => {
                setFontSize("large");
                setOpenFont(false);
              }}
            >
              Large
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
