import React, { useEffect, useMemo, useState } from "react";
import PocketBase from "pocketbase";
import collectiblesData from "./data/collectibles.json";
import adminCodeFile from "../admin_code.txt?raw";

const PB_CONFIG = { collections: { users: "users", collectibles: "collectibles", events: "events" } };
const DEMO_USERS = [
  { id: "u1", username: "alex", wallet: "0xA12b...91F3", role: "admin", created: "2026-01-30" },
  { id: "u2", username: "maria", wallet: "0xB44c...2A10", role: "user", created: "2026-01-30" },
  { id: "u3", username: "devin", wallet: "0xC900...11a1", role: "user", created: "2026-01-30" },
];
const DEMO_EVENTS = [
  { type: "MINT", tokenId: 1, from: "0x0", to: "0xA12b...91F3", block: 5523001, tx: "0x9c2a...b71d" },
  { type: "TRANSFER", tokenId: 2, from: "0xC900...11a1", to: "0xB44c...2A10", block: 5523002, tx: "0x1e7d...8aa0" },
];

const quickChartUrl = (cfg, n = 0) => `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(cfg))}&backgroundColor=transparent&format=png&width=760&height=360&devicePixelRatio=2&v=${n}`;

const buildChart = (type, labels, data, title, palette = ["#c5a367", "#d9cbb3", "#f4ece1"]) => ({
  type,
  data: {
    labels,
    datasets: type === "line" 
      ? data.map((s, i) => ({ label: s.name, data: s.data, fill: false, borderWidth: 3, pointRadius: 4, tension: 0.35, borderColor: palette[i % 3], pointBackgroundColor: palette[i % 3], pointBorderColor: palette[i % 3] }))
      : [{ label: title, data, borderWidth: 1, backgroundColor: "#c5a367", borderColor: "#c5a367" }]
  },
  options: {
    indexAxis: type === "bar" ? "y" : undefined,
    plugins: { legend: { labels: { color: "#f4ece1" } }, title: { display: true, text: title, color: "#f4ece1" } },
    scales: { x: { ticks: { color: "#d9cbb3" }, grid: { color: "rgba(110,100,88,0.35)" }, beginAtZero: true }, y: { ticks: { color: "#d9cbb3" }, grid: { color: "rgba(110,100,88,0.35)" }, beginAtZero: true } },
  },
});

const normalizeTag = (t) => String(t || "").trim().toLowerCase().replace(/[^a-z0-9\- ]/g, "").replace(/\s+/g, "-").slice(0, 26);

const extractTagsFromCollectible = (item) => {
  const text = `${item?.name || ""} ${item?.description || ""}`.toLowerCase();
  const tags = new Set();
  if (item?.category) tags.add(normalizeTag(item.category));
  if (item?.sub_category) tags.add(normalizeTag(item.sub_category));
  if (item?.subCategory) tags.add(normalizeTag(item.subCategory));
  ["psa", "cgc", "bgs", "graded", "mint", "rare", "limited", "promo", "vintage", "holo", "japanese", "sealed", "signed"].forEach(tag => { if (text.includes(tag)) tags.add(tag); });
  if (text.includes("ultra rare") || text.includes("ultra-rare")) tags.add("ultra-rare");
  if (text.includes("1st edition") || text.includes("1st-edition")) tags.add("1st-edition");
  if (text.includes("new in box") || text.includes("nib")) tags.add("new-in-box");
  if (text.includes("autograph")) tags.add("signed");
  return Array.from(tags).filter(Boolean);
};

const getPBUrl = () => (import.meta.env.VITE_PB_URL || "").trim();
const mapPbRecord = (rec) => ({ id: rec?.id, created: rec?.created ? String(rec.created).slice(0, 10) : "", ...rec });
const toTokenId = (item) => item?.token_id ?? item?.tokenId ?? item?.tokenID ?? "—";
const normalizeCode = (s) => String(s ?? "").trim();

const GateScreen = ({ title, message, children, onLogout }) => (
  <div className="ap ap-loginShell">
    <div className="ap-card ap-loginCard">
      <div className="ap-stack">
        <div>
          <h2 className="ap-title">{title}</h2>
          <p className="ap-helper" dangerouslySetInnerHTML={{ __html: message }} />
        </div>
        {children}
        {onLogout && <button className="ap-btn ap-btnSecondary" onClick={onLogout} type="button">Logout</button>}
      </div>
    </div>
  </div>
);

export default function AdminPage() {
  const pbUrl = getPBUrl();
  const pb = useMemo(() => (pbUrl ? new PocketBase(pbUrl) : null), [pbUrl]);
  const pbEnabled = Boolean(pb);
  const demoMode = !pbEnabled;

  const [tab, setTab] = useState("dashboard");
  const [adminCode, setAdminCode] = useState("");
  const [adminCodeError, setAdminCodeError] = useState("");
  const [adminVerified, setAdminVerified] = useState(() => localStorage.getItem("adminVerified") === "true");
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [users, setUsers] = useState(DEMO_USERS);
  const [collectibles, setCollectibles] = useState(Array.isArray(collectiblesData?.items) ? collectiblesData.items : []);
  const [events, setEvents] = useState(DEMO_EVENTS);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCollectibles, setLoadingCollectibles] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [opError, setOpError] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [collectibleQuery, setCollectibleQuery] = useState("");
  const [eventQuery, setEventQuery] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newWallet, setNewWallet] = useState("");
  const [chartNonce, setChartNonce] = useState(0);

  const signedIn = demoMode ? true : Boolean(pb?.authStore?.isValid);
  const authModel = demoMode ? { role: "admin" } : pb?.authStore?.model;
  const isAdmin = demoMode ? true : (String(authModel?.role || "").toLowerCase() === "admin" || authModel?.isAdmin === true);
  const adminCount = users.filter((u) => String(u.role || "").toLowerCase() === "admin").length;

  const assertNotLastAdmin = (target) => {
    if (String(target?.role || "").toLowerCase() === "admin" && adminCount <= 1) throw new Error("Cannot remove or demote the last admin.");
  };

  const lockAdmin = () => { localStorage.removeItem("adminVerified"); setAdminVerified(false); setAdminCode(""); setAdminCodeError(""); };
  const logoutEverywhere = () => { lockAdmin(); if (pbEnabled) pb.authStore.clear(); setTab("dashboard"); setOpError(""); };

  const loadData = async (collection, setter, setLoading) => {
    if (!pbEnabled) return;
    setLoading(true);
    setOpError("");
    try {
      const list = await pb.collection(PB_CONFIG.collections[collection]).getList(1, 200, { sort: "-created" });
      setter(list.items.map(mapPbRecord));
    } catch (e) {
      setOpError(e?.message || `Failed to load ${collection}.`);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = () => loadData("users", setUsers, setLoadingUsers);
  const loadCollectibles = () => loadData("collectibles", setCollectibles, setLoadingCollectibles);
  const loadEvents = () => loadData("events", setEvents, setLoadingEvents);

  const verifyAdminCode = () => {
    setAdminCodeError("");
    const entered = normalizeCode(adminCode);
    if (!entered) { setAdminCodeError("Enter an admin code."); return; }
    if (!pbEnabled) { localStorage.setItem("adminVerified", "true"); setAdminVerified(true); setAdminCode(""); return; }
    if (!signedIn) { setAdminCodeError("Please sign in first using the top-right button."); return; }
    if (!isAdmin) { setAdminCodeError("Your account is signed in, but not marked as admin in PocketBase."); return; }
    setVerifyingCode(true);
    try {
      if (entered !== normalizeCode(adminCodeFile)) { setAdminCodeError("Invalid admin code."); return; }
      localStorage.setItem("adminVerified", "true");
      setAdminVerified(true);
      setAdminCode("");
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleCreateUser = async () => {
    const un = newUsername.trim(), wa = newWallet.trim();
    if (!un || !wa) { setOpError("Username and wallet are required."); return; }
    if (!pbEnabled) {
      setUsers((prev) => [...prev, { id: `u${Date.now()}`, username: un, wallet: wa, role: "user", created: new Date().toISOString().slice(0, 10) }]);
      setNewUsername(""); setNewWallet(""); return;
    }
    setLoadingUsers(true); setOpError("");
    try {
      await pb.collection(PB_CONFIG.collections.users).create({ username: un, wallet: wa, role: "user" });
      await loadUsers(); setNewUsername(""); setNewWallet("");
    } catch (e) { setOpError(e?.message || "Failed to create user."); } finally { setLoadingUsers(false); }
  };

  const toggleAdmin = async (userId) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const currentRole = String(target.role || "").toLowerCase();
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (currentRole === "admin") { try { assertNotLastAdmin(target); } catch (e) { setOpError(e.message); return; } }
    if (!pbEnabled) { setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))); return; }
    setLoadingUsers(true); setOpError("");
    try { await pb.collection(PB_CONFIG.collections.users).update(userId, { role: newRole }); await loadUsers(); } catch (e) { setOpError(e?.message || "Failed to toggle admin."); } finally { setLoadingUsers(false); }
  };

  const removeUser = async (userId) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    try { assertNotLastAdmin(target); } catch (e) { setOpError(e.message); return; }
    if (!pbEnabled) { setUsers((prev) => prev.filter((u) => u.id !== userId)); return; }
    setLoadingUsers(true); setOpError("");
    try { await pb.collection(PB_CONFIG.collections.users).delete(userId); await loadUsers(); } catch (e) { setOpError(e?.message || "Failed to remove user."); } finally { setLoadingUsers(false); }
  };

  useEffect(() => {
    if (!pbEnabled || !signedIn || !isAdmin || !adminVerified) return;
    loadUsers().catch((e) => { console.error("Failed to load users:", e); setOpError("Collections may not be set up in PocketBase."); });
    loadCollectibles().catch(console.error);
    loadEvents().catch(console.error);
  }, [pbEnabled, signedIn, isAdmin, adminVerified]);

  const allTags = collectibles.flatMap(extractTagsFromCollectible);
  const tagCounts = {};
  allTags.forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const categoryMap = {};
  collectibles.forEach((c) => { const cat = c.category || "Unknown"; categoryMap[cat] = (categoryMap[cat] || 0) + 1; });
  const trendingLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];
  const trendingSeries = Object.keys(categoryMap).slice(0, 3).map((cat) => {
    const base = categoryMap[cat];
    return { name: cat, data: [Math.max(1, base - 3 + Math.floor(Math.random() * 4)), Math.max(1, base - 2 + Math.floor(Math.random() * 4)), Math.max(1, base - 1 + Math.floor(Math.random() * 4)), base] };
  });

  const trendingCategoriesUrl = quickChartUrl(buildChart("line", trendingLabels, trendingSeries, "Trending Category"), chartNonce);
  const popularTagsUrl = quickChartUrl(buildChart("bar", topTags.map((t) => t[0]), topTags.map((t) => t[1]), "Popular Collectible Tags"), chartNonce);

  const filterItems = (items, query, fields) => items.filter((item) => fields.some((field) => String(field(item) || "").toLowerCase().includes(query.toLowerCase())));
  const filteredUsers = filterItems(users, userQuery, [(u) => u.username, (u) => u.wallet, (u) => u.role]);
  const filteredCollectibles = filterItems(collectibles, collectibleQuery, [(c) => toTokenId(c), (c) => c.name, (c) => c.owner_wallet || c.owner || c.ownerWallet, (c) => c.category, (c) => c.sub_category || c.subCategory]);
  const filteredEvents = filterItems(events, eventQuery, [(e) => e.type, (e) => e.tokenId || e.token_id, (e) => e.tx, (e) => e.block]);

  if (!signedIn) return <GateScreen title="Admin Access" message={`Please sign in first using the top-right <span class="ap-mono">SIGN IN</span> button.<br><br>PB URL: <span class="ap-mono">${pbEnabled ? pbUrl : "not set (demo mode)"}</span>`} />;
  if (!isAdmin) return <GateScreen title="Not Authorized" message={`You are signed in, but your user is not marked as admin in PocketBase. Add <span class="ap-mono">role = "admin"</span> (or <span class="ap-mono">isAdmin = true</span>) to your user record.`} onLogout={logoutEverywhere} />;
  if (!adminVerified) return (
    <GateScreen title="Admin Code Check" message={`PocketBase confirmed you're an admin. Enter your admin code to unlock the portal.`} onLogout={logoutEverywhere}>
      <div className="ap-field">
        <div className="ap-label">Admin Code</div>
        <input className="ap-input" value={adminCode} placeholder=" Password" onChange={(e) => setAdminCode(e.target.value)} onKeyDown={(e) => (e.key === "Enter" ? void verifyAdminCode() : undefined)} />
      </div>
      {adminCodeError && <div className="ap-error">{adminCodeError}</div>}
      <div className="ap-row">
        <button className="ap-btn ap-btnPrimary" onClick={() => void verifyAdminCode()} type="button" disabled={verifyingCode}>{verifyingCode ? "Verifying..." : "Verify"}</button>
      </div>
      <div className="ap-note">PB URL: <span className="ap-mono">{pbEnabled ? pbUrl : "not set (demo mode)"}</span></div>
    </GateScreen>
  );

  return (
    <div className="ap ap-page">
      <header className="ap-topbar">
        <div className="ap-brand">
          <div className="ap-dot" />
          <div>
            <p className="ap-title">Admin Panel</p>
            <p className="ap-subtitle">Chain: Sepolia • DB: {pbEnabled ? "PocketBase" : "Demo"} • Contract: <span className="ap-mono">0xYourContractAddress</span></p>
          </div>
        </div>
        <div className="ap-row">
          {pbEnabled && <button className="ap-btn ap-btnSecondary" onClick={() => { void loadUsers(); void loadCollectibles(); void loadEvents(); setChartNonce((n) => n + 1); }} type="button">Sync</button>}
          <button className="ap-btn ap-btnSecondary" onClick={lockAdmin} type="button">Lock</button>
          <button className="ap-btn ap-btnSecondary" onClick={logoutEverywhere} type="button">Logout</button>
        </div>
      </header>

      <main className="ap-layout">
        <aside className="ap-card ap-sidebar">
          {["dashboard", "users", "collectibles", "events", "settings"].map((t) => (
            <button key={t} className={`ap-navBtn ${tab === t ? "isActive" : ""}`} onClick={() => setTab(t)} type="button">{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
          <div className="ap-smallCard ap-mt12">
            <div className="ap-label">PocketBase</div>
            <div className="ap-helper ap-mt8">URL: <span className="ap-mono">{pbEnabled ? pbUrl : "not set"}</span></div>
          </div>
          {opError && <div className="ap-error ap-mt12">{opError}</div>}
        </aside>

        <section className="ap-content">
          {tab === "dashboard" && (
            <>
              <div className="ap-grid3">
                <div className="ap-smallCard"><div className="ap-label">Users</div><div className="ap-metric">{users.length}</div><div className="ap-helper">{adminCount} admin</div></div>
                <div className="ap-smallCard"><div className="ap-label">Collectibles</div><div className="ap-metric">{collectibles.length}</div><div className="ap-helper">loaded from {pbEnabled ? "PocketBase" : "collectibles.json"}</div></div>
                <div className="ap-smallCard"><div className="ap-label">Events</div><div className="ap-metric">{events.length}</div><div className="ap-helper">{pbEnabled ? "PocketBase" : "mocked"}</div></div>
              </div>
              <div className="ap-card">
                <div className="ap-cardHeader">
                  <h3 className="ap-h3">Analytics</h3>
                  <button className="ap-btn ap-btnSecondary" onClick={() => setChartNonce((n) => n + 1)} type="button">Refresh Charts</button>
                </div>
                <div className="ap-grid2 ap-mt12">
                  <div className="ap-smallCard"><img className="ap-chartImg" src={trendingCategoriesUrl} alt="Trending category chart" /><p className="ap-helper ap-mt8">Trending categories over time (stable demo trend).</p></div>
                  <div className="ap-smallCard"><img className="ap-chartImg" src={popularTagsUrl} alt="Popular collectible tags chart" /><p className="ap-helper ap-mt8">Top tags extracted from name/description/category fields.</p></div>
                </div>
              </div>
            </>
          )}

          {tab === "users" && (
            <div className="ap-card">
              <div className="ap-cardHeader">
                <div><h3 className="ap-h3">Users</h3><p className="ap-helper">{pbEnabled ? "Manage users via PocketBase." : "Manage users (demo/local state)."}</p></div>
                <input className="ap-input ap-search" value={userQuery} placeholder="Search username / wallet / role…" onChange={(e) => setUserQuery(e.target.value)} />
              </div>
              <div className="ap-grid2 ap-mt12">
                <div className="ap-smallCard">
                  <div className="ap-strong">Create User</div>
                  <div className="ap-stack ap-mt12">
                    <div className="ap-field"><div className="ap-label">Username</div><input className="ap-input" value={newUsername} placeholder="e.g. jane" onChange={(e) => setNewUsername(e.target.value)} /></div>
                    <div className="ap-field"><div className="ap-label">Wallet Address</div><input className="ap-input" value={newWallet} placeholder="0x..." onChange={(e) => setNewWallet(e.target.value)} /></div>
                    <button className="ap-btn ap-btnPrimary" onClick={() => void handleCreateUser()} type="button">Add User</button>
                  </div>
                </div>
                <div className="ap-smallCard">
                  <div className="ap-strong">Admin Summary</div>
                  <div className="ap-row ap-mt12"><span className="ap-pill ap-pillGold">Admins: {adminCount}</span><span className="ap-pill">Total: {users.length}</span></div>
                  <p className="ap-helper ap-mt8">Guard rails: can't delete/demote the last admin.</p>
                </div>
              </div>
              <div className="ap-tableWrap ap-mt12">
                <table className="ap-table">
                  <thead><tr><th>Username</th><th>Wallet</th><th>Role</th><th>Created</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>{u.username}</td>
                        <td className="ap-mono">{u.wallet}</td>
                        <td><span className={`ap-pill ${String(u.role).toLowerCase() === "admin" ? "ap-pillGold" : ""}`}>{u.role}</span></td>
                        <td>{u.created}</td>
                        <td>
                          <div className="ap-row ap-wrap">
                            <button className="ap-btn ap-btnSecondary" onClick={() => void toggleAdmin(u.id)} type="button" disabled={loadingUsers}>{String(u.role).toLowerCase() === "admin" ? "Remove Admin" : "Make Admin"}</button>
                            <button className="ap-btn ap-btnDanger" onClick={() => void removeUser(u.id)} type="button" disabled={loadingUsers}>Remove</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && <tr><td colSpan={5} className="ap-empty">No results.</td></tr>}
                  </tbody>
                </table>
              </div>
              {loadingUsers && <div className="ap-helper ap-mt12">Loading users…</div>}
            </div>
          )}

          {tab === "collectibles" && (
            <div className="ap-card">
              <div className="ap-cardHeader">
                <div><h3 className="ap-h3">Collectibles</h3><p className="ap-helper">{pbEnabled ? "Loaded from PocketBase." : "Loaded from collectibles.json."}</p></div>
                <input className="ap-input ap-search" value={collectibleQuery} placeholder="Search token / name / owner / category…" onChange={(e) => setCollectibleQuery(e.target.value)} />
              </div>
              <div className="ap-tableWrap ap-mt12">
                <table className="ap-table">
                  <thead><tr><th>Token</th><th>Name</th><th>Category</th><th>Owner</th><th>Price</th></tr></thead>
                  <tbody>
                    {filteredCollectibles.map((c) => {
                      const token = toTokenId(c);
                      const owner = c.owner_wallet ?? c.owner ?? c.ownerWallet ?? "—";
                      const price = c.price != null ? `$${c.price}` : "—";
                      const cat = c.sub_category || c.subCategory ? `${c.category} / ${c.sub_category || c.subCategory}` : c.category || "—";
                      return (<tr key={`${token}-${c.name}`}><td>{token}</td><td>{c.name}</td><td>{cat}</td><td className="ap-mono">{owner}</td><td>{price}</td></tr>);
                    })}
                    {filteredCollectibles.length === 0 && <tr><td colSpan={5} className="ap-empty">No results.</td></tr>}
                  </tbody>
                </table>
              </div>
              {loadingCollectibles && <div className="ap-helper ap-mt12">Loading collectibles…</div>}
            </div>
          )}

          {tab === "events" && (
            <div className="ap-card">
              <div className="ap-cardHeader">
                <div><h3 className="ap-h3">Events</h3><p className="ap-helper">{pbEnabled ? "Loaded from PocketBase." : "Mock events for now."}</p></div>
                <input className="ap-input ap-search" value={eventQuery} placeholder="Search type / token / tx / block…" onChange={(e) => setEventQuery(e.target.value)} />
              </div>
              <div className="ap-tableWrap ap-mt12">
                <table className="ap-table">
                  <thead><tr><th>Type</th><th>Token</th><th>From</th><th>To</th><th>Block</th><th>Tx</th></tr></thead>
                  <tbody>
                    {filteredEvents.map((e, i) => (
                      <tr key={`${e.tx}-${i}`}>
                        <td><span className={`ap-pill ${String(e.type).toUpperCase() === "MINT" ? "ap-pillGold" : ""}`}>{e.type}</span></td>
                        <td>{e.tokenId ?? e.token_id}</td>
                        <td className="ap-mono">{e.from}</td>
                        <td className="ap-mono">{e.to}</td>
                        <td className="ap-mono">{e.block}</td>
                        <td className="ap-mono">{e.tx}</td>
                      </tr>
                    ))}
                    {filteredEvents.length === 0 && <tr><td colSpan={6} className="ap-empty">No results.</td></tr>}
                  </tbody>
                </table>
              </div>
              {loadingEvents && <div className="ap-helper ap-mt12">Loading events…</div>}
            </div>
          )}

          {tab === "settings" && (
            <div className="ap-card">
              <h3 className="ap-h3">Settings</h3>
              <p className="ap-helper">Placeholder. Put network/contract toggles + PB collection names here if you want them editable.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}