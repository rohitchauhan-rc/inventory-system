import React, { useState, useRef, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import "./App.css";

const Icons = {
  dashboard: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  products: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  ),
  customers: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  orders: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  reports: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  support: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  bell: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  help: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  search: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  close: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

const NAV = [
  { id: "dashboard", label: "Dashboard" },
  { id: "products",  label: "Products" },
  { id: "customers", label: "Customers" },
  { id: "orders",    label: "Orders" },
  { id: "reports",   label: "Reports" },
];

const PAGE_SUBTITLES = {
  dashboard: "Overview of your logistics operations",
  products:  "Manage product catalog and inventory",
  customers: "Manage your client base",
  orders:    "Real-time order oversight",
  reports:   "Analytics and insights",
  settings:  "System configuration",
};

function NotificationsPanel({ onClose }) {
  const notifications = [
    { id: 1, icon: "⚠️", title: "Low Stock Alert", sub: "5 products need restocking", time: "2 min ago", unread: true },
    { id: 2, icon: "🚚", title: "Order Shipped", sub: "Order #0000042 dispatched", time: "18 min ago", unread: true },
    { id: 3, icon: "👤", title: "New Customer", sub: "Jane Doe joined", time: "1 hr ago", unread: false },
    { id: 4, icon: "📦", title: "Stock Replenished", sub: "Inventory updated for SKU-009", time: "3 hr ago", unread: false },
  ];
  return (
    <div className="dropdown-panel" style={{ width: 320 }}>
      <div className="dropdown-panel-header">
        <span>Notifications</span>
        <button className="dropdown-panel-close" onClick={onClose}>{Icons.close}</button>
      </div>
      {notifications.map((n) => (
        <div key={n.id} className={`notif-item ${n.unread ? "unread" : ""}`}>
          <div className="notif-icon">{n.icon}</div>
          <div className="notif-body">
            <div className="notif-title">{n.title}</div>
            <div className="notif-sub">{n.sub}</div>
            <div className="notif-time">{n.time}</div>
          </div>
        </div>
      ))}
      <div className="dropdown-panel-footer">
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font)" }}>
          Mark all as read
        </button>
      </div>
    </div>
  );
}

function HelpPanel({ onClose }) {
  return (
    <div className="dropdown-panel" style={{ width: 280 }}>
      <div className="dropdown-panel-header">
        <span>Help & Resources</span>
        <button className="dropdown-panel-close" onClick={onClose}>{Icons.close}</button>
      </div>
      <div style={{ padding: "8px 0" }}>
        {[
          { icon: "📖", label: "Documentation", sub: "Guides and API reference" },
          { icon: "🎓", label: "Getting Started", sub: "Quick-start tutorial" },
          { icon: "💬", label: "Contact Support", sub: "Open a support ticket" },
          { icon: "🔄", label: "What's New", sub: "Release notes and updates" },
        ].map((item) => (
          <div key={item.label} className="help-item" onClick={onClose}>
            <span className="help-icon">{item.icon}</span>
            <div>
              <div className="help-label">{item.label}</div>
              <div className="help-sub">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const notifsRef = useRef(null);
  const helpRef   = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setShowNotifs(false);
      if (helpRef.current   && !helpRef.current.contains(e.target))   setShowHelp(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const PAGES = { dashboard: Dashboard, products: Products, customers: Customers, orders: Orders, reports: Reports, settings: Settings };
  const Page = PAGES[page] || Dashboard;

  const navigate = (p) => { setPage(p); setSidebarOpen(false); };

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <span className="brand-name">LogisticsPro</span>
          <span className="brand-sub">Enterprise Admin</span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? "active" : ""}`}
              onClick={() => navigate(item.id)}
            >
              <span className="nav-icon">{Icons[item.id]}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-quick-order">
          <button className="btn-quick-order" onClick={() => navigate("orders")}>
            {Icons.plus} Quick Order
          </button>
        </div>

        <div className="sidebar-footer-links">
          <button className={`nav-item ${page === "settings" ? "active" : ""}`} onClick={() => navigate("settings")}>
            <span className="nav-icon">{Icons.settings}</span>
            <span className="nav-label">Settings</span>
          </button>
          <button className="nav-item" onClick={() => { setSidebarOpen(false); setShowHelp(true); }}>
            <span className="nav-icon">{Icons.support}</span>
            <span className="nav-label">Support</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

          <div className={`topbar-search ${searchFocused ? "focused" : ""}`}>
            <span className="search-icon">{Icons.search}</span>
            <input
              placeholder="Search orders, SKU, or customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  // Route to best matching page
                  const q = searchQuery.toLowerCase();
                  if (q.includes("order")) navigate("orders");
                  else if (q.includes("customer") || q.includes("client")) navigate("customers");
                  else if (q.includes("product") || q.includes("sku") || q.includes("stock")) navigate("products");
                  else if (q.includes("report") || q.includes("analytic")) navigate("reports");
                  setSearchQuery("");
                }
              }}
            />
            {searchQuery && (
              <button
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 2 }}
                onClick={() => setSearchQuery("")}
              >
                {Icons.close}
              </button>
            )}
          </div>

          <div className="topbar-tabs">
            <button
              className={`topbar-tab ${page === "dashboard" ? "active" : ""}`}
              onClick={() => navigate("dashboard")}
            >
              Overview
            </button>
            <button
              className={`topbar-tab ${page === "reports" ? "active" : ""}`}
              onClick={() => navigate("reports")}
            >
              Analytics
            </button>
          </div>

          <div className="topbar-actions">
            {/* Notifications */}
            <div style={{ position: "relative" }} ref={notifsRef}>
              <button
                className={`topbar-icon-btn ${showNotifs ? "active" : ""}`}
                title="Notifications"
                onClick={() => { setShowNotifs((v) => !v); setShowHelp(false); }}
              >
                {Icons.bell}
                <span className="notif-badge">2</span>
              </button>
              {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}
            </div>

            {/* Help */}
            <div style={{ position: "relative" }} ref={helpRef}>
              <button
                className={`topbar-icon-btn ${showHelp ? "active" : ""}`}
                title="Help"
                onClick={() => { setShowHelp((v) => !v); setShowNotifs(false); }}
              >
                {Icons.help}
              </button>
              {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}
            </div>

            <div className="topbar-user" onClick={() => navigate("settings")} style={{ cursor: "pointer" }}>
              <div className="user-avatar">AU</div>
              <div className="user-info">
                <span className="user-name">Admin User</span>
                <span className="user-role">Super Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-body">
          <Page navigate={navigate} />
        </div>
      </main>
    </div>
  );
}
