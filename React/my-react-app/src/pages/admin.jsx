import React, { useEffect, useMemo, useState } from "react";
import PocketBase from "pocketbase";
import collectiblesData from "./data/collectibles.json";


/**
 * - Admin Panel 
 * - If VITE_PB_URL is set -> PocketBase mode (auth + CRUD)
 * - If not set -> Demo mode (local mock data + collectibles.json)
 */

const PB_CONFIG = {
  collections: {
    users: "users",
    collectibles: "collectibles",
    events: "events",
  },
  authMode: "admin", // "admin" (pb.admins) is easiest for hackathon admin panel
};

const DEMO_USERS = [
  { id: "u1", username: "alex", wallet: "0xA12b...91F3", role: "admin", created: "2026-01-30" },
  { id: "u2", username: "maria", wallet: "0xB44c...2A10", role: "user", created: "2026-01-30" },
  { id: "u3", username: "devin", wallet: "0xC900...11a1", role: "user", created: "2026-01-30" },
];

const DEMO_EVENTS = [
  { type: "MINT", tokenId: 1, from: "0x0", to: "0xA12b...91F3", block: 5523001, tx: "0x9c2a...b71d" },
  { type: "TRANSFER", tokenId: 2, from: "0xC900...11a1", to: "0xB44c...2A10", block: 5523002, tx: "0x1e7d...8aa0" },
];

/* ---------------- QuickChart helpers ---------------- */

function quickChartUrl(chartConfig, nonce = 0) {
  const encoded = encodeURIComponent(JSON.stringify(chartConfig));
  return `https://quickchart.io/chart?c=${encoded}&backgroundColor=transparent&format=png&width=760&height=360&devicePixelRatio=2&v=${nonce}`;
}

function buildTrendingCategoriesConfig(labels, series) {
  const palette = ["#c5a367", "#d9cbb3", "#f4ece1"];
  return {
    type: "line",
    data: {
      labels,
      datasets: series.map((s, i) => ({
        label: s.name,
        data: s.data,
        fill: false,
        borderWidth: 3,
        pointRadius: 4,
        tension: 0.35,
        borderColor: palette[i % palette.length],
        pointBackgroundColor: palette[i % palette.length],
        pointBorderColor: palette[i % palette.length],
      })),
    },
    options: {
      plugins: {
        legend: { labels: { color: "#f4ece1" } },
        title: { display: true, text: "Trending Category", color: "#f4ece1" },
      },
      scales: {
        x: { ticks: { color: "#d9cbb3" }, grid: { color: "rgba(110,100,88,0.35)" } },
        y: { ticks: { color: "#d9cbb3" }, grid: { color: "rgba(110,100,88,0.35)" }, beginAtZero: true },
      },
    },
  };
}

function buildPopularTagsBarConfig(tags, counts) {
  return {
    type: "bar",
    data: {
      labels: tags,
      datasets: [{ label: "Tag Count", data: counts, borderWidth: 1, backgroundColor: "#c5a367", borderColor: "#c5a367" }],
    },
    options: {
      indexAxis: "y",
      plugins: {
        legend: { labels: { color: "#f4ece1" } },
        title: { display: true, text: "Popular Collectible Tags", color: "#f4ece1" },
      },
      scales: {
        x: { ticks: { color: "#d9cbb3" }, grid: { color: "rgba(110,100,88,0.35)" }, beginAtZero: true },
        y: { ticks: { color: "#d9cbb3" }, grid: { color: "rgba(110,100,88,0.20)" } },
      },
    },
  };
}

/* ---------------- Tag + Analytics helpers ---------------- */

function normalizeTag(t) {
  return String(t || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\- ]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 26);
}

function extractTagsFromCollectible(item) {
  const text = `${item?.name || ""} ${item?.description || ""}`.toLowerCase();
  const tags = new Set();

  if (item?.category) tags.add(normalizeTag(item.category));
  if (item?.sub_category) tags.add(normalizeTag(item.sub_category));
  if (item?.subCategory) tags.add(normalizeTag(item.subCategory));

  if (text.includes("psa")) tags.add("psa");
  if (text.includes("cgc")) tags.add("cgc");
  if (text.includes("bgs")) tags.add("bgs");
  if (text.includes("graded")) tags.add("graded");
  if (text.includes("mint")) tags.add("mint");

  if (text.includes("rare")) tags.add("rare");
  if (text.includes("ultra rare") || text.includes("ultra-rare")) tags.add("ultra-rare");
  if (text.includes("limited")) tags.add("limited");
  if (text.includes("1st edition") || text.includes("1st-edition")) tags.add("1st-edition");
  if (text.includes("promo")) tags.add("promo");
  if (text.includes("vintage")) tags.add("vintage");

  if (text.includes("holo")) tags.add("holo");
  if (text.includes("japanese")) tags.add("japanese");
  if (text.includes("sealed")) tags.add("sealed");
  if (text.includes("new in box") || text.includes("nib")) tags.add("new-in-box");
  if (text.includes("signed") || text.includes("autograph")) tags.add("signed");

  return Array.from(tags).filter(Boolean);
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function getPBUrl() {
  return (import.meta.env.VITE_PB_URL || "").trim();
}



function mapPbRecord(rec) {
  return {
    id: rec?.id,
    created: rec?.created ? String(rec.created).slice(0, 10) : "",
    ...rec,
  };
}

function toTokenId(item) {
  return item?.token_id ?? item?.tokenId ?? item?.tokenID ?? "—";
}

/* ---------------- Component ---------------- */

export default function AdminPage() {
  const pbUrl = getPBUrl();
  const pb = useMemo(() => (pbUrl ? new PocketBase(pbUrl) : null), [pbUrl]);
  const pbEnabled = Boolean(pb);



  const chain = "Sepolia";
  const contractAddress = "0xYourContractAddress";

  const [tab, setTab] = useState("dashboard");

  // auth
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [authError, setAuthError] = useState("");

  // data
  const [users, setUsers] = useState(DEMO_USERS);
  const [collectibles, setCollectibles] = useState(
    Array.isArray(collectiblesData?.items) ? collectiblesData.items : []
  );
  const [events, setEvents] = useState(DEMO_EVENTS);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCollectibles, setLoadingCollectibles] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [opError, setOpError] = useState("");

  // search
  const [userQuery, setUserQuery] = useState("");
  const [collectibleQuery, setCollectibleQuery] = useState("");
  const [eventQuery, setEventQuery] = useState("");

  // create user
  const [newUsername, setNewUsername] = useState("");
  const [newWallet, setNewWallet] = useState("");

  // charts
  const [chartNonce, setChartNonce] = useState(0);

  // demo creds
  const DEMO_ADMIN_USER = "alex";
  const DEMO_ADMIN_PASS = "admin";

  const adminCount = users.filter((u) => String(u.role || "").toLowerCase() === "admin").length;

  function assertNotLastAdmin(target) {
    const role = String(target?.role || "").toLowerCase();
    if (role === "admin" && adminCount <= 1) {
      alert("You cannot modify the last remaining admin.");
      return false;
    }
    return true;
  }

  async function login() {
    setAuthError("");
    setOpError("");

    if (!pbEnabled) {
      if (loginUser.trim() === DEMO_ADMIN_USER && loginPass === DEMO_ADMIN_PASS) {
        setLoggedIn(true);
        setLoginUser("");
        setLoginPass("");
        return;
      }
      setAuthError(`Invalid credentials. (Demo: ${DEMO_ADMIN_USER}/${DEMO_ADMIN_PASS})`);
      return;
    }

    try {
      pb.autoCancellation(false);

      if (PB_CONFIG.authMode === "admin") {
        await pb.admins.authWithPassword(loginUser.trim(), loginPass);
      } else {
        await pb.collection(PB_CONFIG.collections.users).authWithPassword(loginUser.trim(), loginPass);
      }

      setLoggedIn(true);
      setLoginUser("");
      setLoginPass("");
    } catch (e) {
      setAuthError(e?.message || "Login failed. Check PocketBase URL/credentials.");
    }
  }

  function logout() {
    if (pbEnabled) pb.authStore.clear();
    setLoggedIn(false);
    setTab("dashboard");
    setAuthError("");
    setOpError("");
  }

  async function loadUsers() {
    if (!pbEnabled) return;
    setLoadingUsers(true);
    setOpError("");
    try {
      const list = await pb.collection(PB_CONFIG.collections.users).getList(1, 100, { sort: "-created" });
      setUsers(list.items.map(mapPbRecord));
    } catch (e) {
      setOpError(e?.message || "Failed to load users.");
    } finally {
      setLoadingUsers(false);
    }
  }

  async function loadCollectibles() {
    if (!pbEnabled) return;
    setLoadingCollectibles(true);
    setOpError("");
    try {
      const list = await pb.collection(PB_CONFIG.collections.collectibles).getList(1, 200, { sort: "-created" });
      setCollectibles(list.items.map(mapPbRecord));
    } catch (e) {
      setOpError(e?.message || "Failed to load collectibles.");
    } finally {
      setLoadingCollectibles(false);
    }
  }

  async function loadEvents() {
    if (!pbEnabled) return;
    setLoadingEvents(true);
    setOpError("");
    try {
      const list = await pb.collection(PB_CONFIG.collections.events).getList(1, 200, { sort: "-created" });
      setEvents(list.items.map(mapPbRecord));
    } catch (e) {
      setOpError(e?.message || "Failed to load events.");
    } finally {
      setLoadingEvents(false);
    }
  }

  useEffect(() => {
    if (!pbEnabled) return;
    if (pb.authStore.isValid) setLoggedIn(true);
  }, [pbEnabled, pb]);

  useEffect(() => {
    if (!pbEnabled || !loggedIn) return;
    void loadUsers();
    void loadCollectibles();
    void loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pbEnabled, loggedIn]);

  async function handleCreateUser() {
    const u = newUsername.trim();
    const w = newWallet.trim();
    if (!u || !w) return;

    setOpError("");

    if (!pbEnabled) {
      const id = `u${Math.random().toString(16).slice(2)}`;
      setUsers((prev) => [{ id, username: u, wallet: w, role: "user", created: new Date().toISOString().slice(0, 10) }, ...prev]);
      setNewUsername("");
      setNewWallet("");
      return;
    }

    try {
      const created = await pb.collection(PB_CONFIG.collections.users).create({ username: u, wallet: w, role: "user" });
      setUsers((prev) => [mapPbRecord(created), ...prev]);
      setNewUsername("");
      setNewWallet("");
    } catch (e) {
      setOpError(e?.message || "Failed to create user.");
    }
  }

  async function toggleAdmin(userId) {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    if (!assertNotLastAdmin(target)) return;

    const nextRole = String(target.role || "").toLowerCase() === "admin" ? "user" : "admin";

    if (!pbEnabled) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u)));
      return;
    }

    setOpError("");
    try {
      const updated = await pb.collection(PB_CONFIG.collections.users).update(userId, { role: nextRole });
      setUsers((prev) => prev.map((u) => (u.id === userId ? mapPbRecord(updated) : u)));
    } catch (e) {
      setOpError(e?.message || "Failed to update role.");
    }
  }

  async function removeUser(userId) {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    if (!assertNotLastAdmin(target)) return;

    const ok = window.confirm(`Remove user "${target.username}"? This cannot be undone.`);
    if (!ok) return;

    if (!pbEnabled) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      return;
    }

    setOpError("");
    try {
      await pb.collection(PB_CONFIG.collections.users).delete(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (e) {
      setOpError(e?.message || "Failed to remove user.");
    }
  }

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const username = String(u.username || "").toLowerCase();
      const wallet = String(u.wallet || "").toLowerCase();
      const role = String(u.role || "").toLowerCase();
      return username.includes(q) || wallet.includes(q) || role.includes(q);
    });
  }, [users, userQuery]);

  const filteredCollectibles = useMemo(() => {
    const q = collectibleQuery.trim().toLowerCase();
    if (!q) return collectibles;
    return collectibles.filter((c) => {
      const token = String(toTokenId(c));
      const name = String(c.name ?? "").toLowerCase();
      const owner = String(c.owner_wallet ?? c.owner ?? c.ownerWallet ?? "").toLowerCase();
      const category = String(c.category ?? "").toLowerCase();
      const sub = String(c.sub_category ?? c.subCategory ?? "").toLowerCase();
      return token.includes(q) || name.includes(q) || owner.includes(q) || category.includes(q) || sub.includes(q);
    });
  }, [collectibles, collectibleQuery]);

  const filteredEvents = useMemo(() => {
    const q = eventQuery.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => {
      const type = String(e.type || "").toLowerCase();
      const token = String(e.tokenId ?? e.token_id ?? "");
      const from = String(e.from || "").toLowerCase();
      const to = String(e.to || "").toLowerCase();
      const block = String(e.block ?? "");
      const tx = String(e.tx || "").toLowerCase();
      return type.includes(q) || token.includes(q) || from.includes(q) || to.includes(q) || block.includes(q) || tx.includes(q);
    });
  }, [events, eventQuery]);

  const analytics = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const categoryToSeries = new Map();
    for (const item of collectibles) {
      const cat = item?.sub_category || item?.subCategory || item?.category || "other";
      if (!categoryToSeries.has(cat)) categoryToSeries.set(cat, Array(7).fill(0));
      const bucket = hashString(String(item?.name || cat)) % 7;

      const price = Number(item?.price || 0);
      const weight = 1 + Math.min(3, Math.log10(Math.max(1, price)) / 2);

      categoryToSeries.get(cat)[bucket] += weight;
    }

    let trendingSeries = Array.from(categoryToSeries.entries())
      .map(([name, data]) => ({ name, data, total: data.reduce((a, b) => a + b, 0) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
      .map((s) => ({ name: s.name, data: s.data.map((v) => Math.round(v * 10) / 10) }));

    const tagCountsMap = new Map();
    for (const item of collectibles) {
      const tags = extractTagsFromCollectible(item);
      for (const t of tags) tagCountsMap.set(t, (tagCountsMap.get(t) || 0) + 1);
    }

    const sortedTags = Array.from(tagCountsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    let topTags = sortedTags.map(([t]) => t);
    let tagCounts = sortedTags.map(([, c]) => c);

    if (!trendingSeries.length) trendingSeries = [{ name: "No data", data: [0, 0, 0, 0, 0, 0, 0] }];
    if (!topTags.length) {
      topTags = ["no-tags"];
      tagCounts = [0];
    }

    return { days, trendingSeries, topTags, tagCounts };
  }, [collectibles]);

  const trendingCategoriesUrl = useMemo(
    () => quickChartUrl(buildTrendingCategoriesConfig(analytics.days, analytics.trendingSeries), chartNonce),
    [analytics.days, analytics.trendingSeries, chartNonce]
  );

  const popularTagsUrl = useMemo(
    () => quickChartUrl(buildPopularTagsBarConfig(analytics.topTags, analytics.tagCounts), chartNonce),
    [analytics.topTags, analytics.tagCounts, chartNonce]
  );

  if (!loggedIn) {
    return (
      <div className="ap ap-loginShell">
        <div className="ap-card ap-loginCard">
          <div className="ap-stack">
            <div>
              <h2 className="ap-title">Admin Login</h2>
              <p className="ap-helper">
                {pbEnabled ? (
                  <>PocketBase URL detected. Login authenticates against PocketBase ({PB_CONFIG.authMode}).</>
                ) : (
                  <>
                    PocketBase not configured (set <span className="ap-mono">VITE_PB_URL</span>). Demo login:{" "}
                    <span className="ap-mono">{DEMO_ADMIN_USER}</span> / <span className="ap-mono">{DEMO_ADMIN_PASS}</span>
                  </>
                )}
              </p>
            </div>

            <div className="ap-field">
              <div className="ap-label">{pbEnabled ? "Email / Username" : "Username"}</div>
              <input
                className="ap-input"
                value={loginUser}
                placeholder={pbEnabled ? "admin@example.com" : "Enter username"}
                onChange={(e) => setLoginUser(e.target.value)}
                onKeyDown={(e) => (e.key === "Enter" ? void login() : undefined)}
              />
            </div>

            <div className="ap-field">
              <div className="ap-label">Password</div>
              <input
                className="ap-input"
                type="password"
                value={loginPass}
                placeholder="Enter password"
                onChange={(e) => setLoginPass(e.target.value)}
                onKeyDown={(e) => (e.key === "Enter" ? void login() : undefined)}
              />
            </div>

            {authError ? <div className="ap-error">{authError}</div> : null}

            <div className="ap-row">
              <button className="ap-btn ap-btnPrimary" onClick={() => void login()} type="button">
                Login
              </button>

              {!pbEnabled ? (
                <button
                  className="ap-btn ap-btnSecondary"
                  onClick={() => {
                    setLoginUser(DEMO_ADMIN_USER);
                    setLoginPass(DEMO_ADMIN_PASS);
                  }}
                  type="button"
                >
                  Autofill
                </button>
              ) : null}
            </div>

            {pbEnabled ? (
              <div className="ap-note">Tip: for hackathons, create a PocketBase admin and use that email/password here.</div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ap ap-page">
      <header className="ap-topbar">
        <div className="ap-brand">
          <div className="ap-dot" />
          <div>
            <p className="ap-title">Admin Panel</p>
            <p className="ap-subtitle">
              Chain: {chain} • DB: {pbEnabled ? "PocketBase" : "Demo"} • Contract: <span className="ap-mono">{contractAddress}</span>
            </p>
          </div>
        </div>

        <div className="ap-row">
          {pbEnabled ? (
            <button
              className="ap-btn ap-btnSecondary"
              onClick={() => {
                void loadUsers();
                void loadCollectibles();
                void loadEvents();
              }}
              type="button"
            >
              Sync
            </button>
          ) : null}
          <button className="ap-btn ap-btnSecondary" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </header>

      <main className="ap-layout">
        <aside className="ap-card ap-sidebar">
          <button className={`ap-navBtn ${tab === "dashboard" ? "isActive" : ""}`} onClick={() => setTab("dashboard")} type="button">
            Dashboard
          </button>
          <button className={`ap-navBtn ${tab === "users" ? "isActive" : ""}`} onClick={() => setTab("users")} type="button">
            Users
          </button>
          <button className={`ap-navBtn ${tab === "collectibles" ? "isActive" : ""}`} onClick={() => setTab("collectibles")} type="button">
            Collectibles
          </button>
          <button className={`ap-navBtn ${tab === "events" ? "isActive" : ""}`} onClick={() => setTab("events")} type="button">
            Events
          </button>
          <button className={`ap-navBtn ${tab === "settings" ? "isActive" : ""}`} onClick={() => setTab("settings")} type="button">
            Settings
          </button>

          <div className="ap-smallCard ap-mt12">
            <div className="ap-label">PocketBase</div>
            <div className="ap-helper ap-mt8">
              URL: <span className="ap-mono">{pbEnabled ? pbUrl : "not set"}</span>
            </div>
          </div>

          {opError ? <div className="ap-error ap-mt12">{opError}</div> : null}
        </aside>

        <section className="ap-content">
          {tab === "dashboard" ? (
            <>
              <div className="ap-grid3">
                <div className="ap-smallCard">
                  <div className="ap-label">Users</div>
                  <div className="ap-metric">{users.length}</div>
                  <div className="ap-helper">{adminCount} admin</div>
                </div>
                <div className="ap-smallCard">
                  <div className="ap-label">Collectibles</div>
                  <div className="ap-metric">{collectibles.length}</div>
                  <div className="ap-helper">loaded from {pbEnabled ? "PocketBase" : "collectibles.json"}</div>
                </div>
                <div className="ap-smallCard">
                  <div className="ap-label">Events</div>
                  <div className="ap-metric">{events.length}</div>
                  <div className="ap-helper">{pbEnabled ? "PocketBase" : "mocked"}</div>
                </div>
              </div>

              <div className="ap-card">
                <div className="ap-cardHeader">
                  <h3 className="ap-h3">Analytics</h3>
                  <button className="ap-btn ap-btnSecondary" onClick={() => setChartNonce((n) => n + 1)} type="button">
                    Refresh Charts
                  </button>
                </div>

                <div className="ap-grid2 ap-mt12">
                  <div className="ap-smallCard">
                    <img className="ap-chartImg" src={trendingCategoriesUrl} alt="Trending category chart" />
                    <p className="ap-helper ap-mt8">Trending categories over time (stable demo trend).</p>
                  </div>
                  <div className="ap-smallCard">
                    <img className="ap-chartImg" src={popularTagsUrl} alt="Popular collectible tags chart" />
                    <p className="ap-helper ap-mt8">Top tags extracted from name/description/category fields.</p>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {tab === "users" ? (
            <div className="ap-card">
              <div className="ap-cardHeader">
                <div>
                  <h3 className="ap-h3">Users</h3>
                  <p className="ap-helper">{pbEnabled ? "Manage users via PocketBase." : "Manage users (demo/local state)."}</p>
                </div>

                <input className="ap-input ap-search" value={userQuery} placeholder="Search username / wallet / role…" onChange={(e) => setUserQuery(e.target.value)} />
              </div>

              <div className="ap-grid2 ap-mt12">
                <div className="ap-smallCard">
                  <div className="ap-strong">Create User</div>
                  <div className="ap-stack ap-mt12">
                    <div className="ap-field">
                      <div className="ap-label">Username</div>
                      <input className="ap-input" value={newUsername} placeholder="e.g. jane" onChange={(e) => setNewUsername(e.target.value)} />
                    </div>
                    <div className="ap-field">
                      <div className="ap-label">Wallet Address</div>
                      <input className="ap-input" value={newWallet} placeholder="0x..." onChange={(e) => setNewWallet(e.target.value)} />
                    </div>
                    <button className="ap-btn ap-btnPrimary" onClick={() => void handleCreateUser()} type="button">
                      Add User
                    </button>
                  </div>
                </div>

                <div className="ap-smallCard">
                  <div className="ap-strong">Admin Summary</div>
                  <div className="ap-row ap-mt12">
                    <span className="ap-pill ap-pillGold">Admins: {adminCount}</span>
                    <span className="ap-pill">Total: {users.length}</span>
                  </div>
                  <p className="ap-helper ap-mt8">Guard rails: can’t delete/demote the last admin.</p>
                </div>
              </div>

              <div className="ap-tableWrap ap-mt12">
                <table className="ap-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Wallet</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>{u.username}</td>
                        <td className="ap-mono">{u.wallet}</td>
                        <td>
                          <span className={`ap-pill ${String(u.role).toLowerCase() === "admin" ? "ap-pillGold" : ""}`}>{u.role}</span>
                        </td>
                        <td>{u.created}</td>
                        <td>
                          <div className="ap-row ap-wrap">
                            <button className="ap-btn ap-btnSecondary" onClick={() => void toggleAdmin(u.id)} type="button" disabled={loadingUsers}>
                              {String(u.role).toLowerCase() === "admin" ? "Remove Admin" : "Make Admin"}
                            </button>
                            <button className="ap-btn ap-btnDanger" onClick={() => void removeUser(u.id)} type="button" disabled={loadingUsers}>
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="ap-empty">
                          No results.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {loadingUsers ? <div className="ap-helper ap-mt12">Loading users…</div> : null}
            </div>
          ) : null}

          {tab === "collectibles" ? (
            <div className="ap-card">
              <div className="ap-cardHeader">
                <div>
                  <h3 className="ap-h3">Collectibles</h3>
                  <p className="ap-helper">{pbEnabled ? "Loaded from PocketBase." : "Loaded from collectibles.json."}</p>
                </div>

                <input className="ap-input ap-search" value={collectibleQuery} placeholder="Search token / name / owner / category…" onChange={(e) => setCollectibleQuery(e.target.value)} />
              </div>

              <div className="ap-tableWrap ap-mt12">
                <table className="ap-table">
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Owner</th>
                      <th>Price</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCollectibles.map((c) => {
                      const token = toTokenId(c);
                      const owner = c.owner_wallet ?? c.owner ?? c.ownerWallet ?? "—";
                      const price = c.price != null ? `$${c.price}` : "—";
                      const cat = c.sub_category || c.subCategory ? `${c.category} / ${c.sub_category || c.subCategory}` : c.category || "—";
                      return (
                        <tr key={`${token}-${c.name}`}>
                          <td>{token}</td>
                          <td>{c.name}</td>
                          <td>{cat}</td>
                          <td className="ap-mono">{owner}</td>
                          <td>{price}</td>
                        </tr>
                      );
                    })}

                    {filteredCollectibles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="ap-empty">
                          No results.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {loadingCollectibles ? <div className="ap-helper ap-mt12">Loading collectibles…</div> : null}
            </div>
          ) : null}

          {tab === "events" ? (
            <div className="ap-card">
              <div className="ap-cardHeader">
                <div>
                  <h3 className="ap-h3">Events</h3>
                  <p className="ap-helper">{pbEnabled ? "Loaded from PocketBase." : "Mock events for now."}</p>
                </div>

                <input className="ap-input ap-search" value={eventQuery} placeholder="Search type / token / tx / block…" onChange={(e) => setEventQuery(e.target.value)} />
              </div>

              <div className="ap-tableWrap ap-mt12">
                <table className="ap-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Token</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Block</th>
                      <th>Tx</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEvents.map((e, i) => (
                      <tr key={`${e.tx}-${i}`}>
                        <td>
                          <span className={`ap-pill ${String(e.type).toUpperCase() === "MINT" ? "ap-pillGold" : ""}`}>{e.type}</span>
                        </td>
                        <td>{e.tokenId ?? e.token_id}</td>
                        <td className="ap-mono">{e.from}</td>
                        <td className="ap-mono">{e.to}</td>
                        <td className="ap-mono">{e.block}</td>
                        <td className="ap-mono">{e.tx}</td>
                      </tr>
                    ))}

                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="ap-empty">
                          No results.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {loadingEvents ? <div className="ap-helper ap-mt12">Loading events…</div> : null}
            </div>
          ) : null}

          {tab === "settings" ? (
            <div className="ap-card">
              <h3 className="ap-h3">Settings</h3>
              <p className="ap-helper">Placeholder. Put network/contract toggles + PB collection names here if you want them editable.</p>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
