import React, { useState } from "react";

function SettingsSection({ title, children }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header">
        <span className="card-title">{title}</span>
      </div>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, sub, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
      <div>
        <div style={{ fontWeight: 500, fontSize: 14, color: "var(--text)" }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>
        {children}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 40, height: 22, borderRadius: 999, border: "none", cursor: "pointer",
        background: checked ? "var(--primary)" : "var(--border)",
        position: "relative", transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3, left: checked ? 20 : 3, width: 16, height: 16,
        borderRadius: "50%", background: "#fff", transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({ name: "Admin User", email: "admin@logisticspro.com", company: "LogisticsPro Inc." });
  const [api, setApi] = useState({ url: "http://localhost:8000", timeout: "30" });
  const [notifs, setNotifs] = useState({ lowStock: true, newOrder: true, newCustomer: false, orderComplete: true });
  const [display, setDisplay] = useState({ density: "compact", currency: "USD", dateFormat: "MM/DD/YYYY" });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Settings</h1>
          <p>Configure your LogisticsPro workspace.</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleSave}>
          {saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>

      {saved && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>
          Settings saved successfully.
        </div>
      )}

      {/* Profile */}
      <SettingsSection title="Profile">
        <SettingRow label="Display Name" sub="Shown in the top navigation bar">
          <input
            style={{ width: 220, padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)", fontFamily: "var(--font)", fontSize: 13, color: "var(--text)", background: "var(--bg-card)" }}
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
          />
        </SettingRow>
        <SettingRow label="Email Address" sub="Login and notification email">
          <input
            type="email"
            style={{ width: 220, padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)", fontFamily: "var(--font)", fontSize: 13, color: "var(--text)", background: "var(--bg-card)" }}
            value={profile.email}
            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
          />
        </SettingRow>
        <SettingRow label="Company Name" sub="Appears in reports and exports">
          <input
            style={{ width: 220, padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)", fontFamily: "var(--font)", fontSize: 13, color: "var(--text)", background: "var(--bg-card)" }}
            value={profile.company}
            onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))}
          />
        </SettingRow>
      </SettingsSection>

      {/* API Configuration */}
      <SettingsSection title="API Configuration">
        <SettingRow label="Backend URL" sub="Base URL for the inventory API">
          <input
            style={{ width: 260, padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text)", background: "var(--bg-card)" }}
            value={api.url}
            onChange={(e) => setApi((a) => ({ ...a, url: e.target.value }))}
          />
        </SettingRow>
        <SettingRow label="Request Timeout" sub="Seconds before a request times out">
          <input
            type="number"
            min="5" max="120"
            style={{ width: 80, padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text)", background: "var(--bg-card)" }}
            value={api.timeout}
            onChange={(e) => setApi((a) => ({ ...a, timeout: e.target.value }))}
          />
        </SettingRow>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title="Notifications">
        <SettingRow label="Low Stock Alerts" sub="Notify when a product falls below 10 units">
          <Toggle checked={notifs.lowStock} onChange={(v) => setNotifs((n) => ({ ...n, lowStock: v }))} />
        </SettingRow>
        <SettingRow label="New Orders" sub="Notify when an order is placed">
          <Toggle checked={notifs.newOrder} onChange={(v) => setNotifs((n) => ({ ...n, newOrder: v }))} />
        </SettingRow>
        <SettingRow label="New Customers" sub="Notify when a customer registers">
          <Toggle checked={notifs.newCustomer} onChange={(v) => setNotifs((n) => ({ ...n, newCustomer: v }))} />
        </SettingRow>
        <SettingRow label="Order Completed" sub="Notify when an order is delivered">
          <Toggle checked={notifs.orderComplete} onChange={(v) => setNotifs((n) => ({ ...n, orderComplete: v }))} />
        </SettingRow>
      </SettingsSection>

      {/* Display Preferences */}
      <SettingsSection title="Display Preferences">
        <SettingRow label="Table Density" sub="Default row spacing for data tables">
          <select
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)", fontFamily: "var(--font)", fontSize: 13, color: "var(--text)", background: "var(--bg-card)", cursor: "pointer" }}
            value={display.density}
            onChange={(e) => setDisplay((d) => ({ ...d, density: e.target.value }))}
          >
            <option value="compact">Compact</option>
            <option value="comfortable">Comfortable</option>
          </select>
        </SettingRow>
        <SettingRow label="Currency" sub="Display currency symbol">
          <select
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)", fontFamily: "var(--font)", fontSize: 13, color: "var(--text)", background: "var(--bg-card)", cursor: "pointer" }}
            value={display.currency}
            onChange={(e) => setDisplay((d) => ({ ...d, currency: e.target.value }))}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </SettingRow>
        <SettingRow label="Date Format" sub="How dates are displayed">
          <select
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)", fontFamily: "var(--font)", fontSize: 13, color: "var(--text)", background: "var(--bg-card)", cursor: "pointer" }}
            value={display.dateFormat}
            onChange={(e) => setDisplay((d) => ({ ...d, dateFormat: e.target.value }))}
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
          </select>
        </SettingRow>
      </SettingsSection>

      {/* Danger Zone */}
      <div className="card" style={{ border: "1px solid #fca5a5" }}>
        <div className="card-header" style={{ borderBottom: "1px solid #fca5a5" }}>
          <span className="card-title" style={{ color: "#dc2626" }}>Danger Zone</span>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <SettingRow
            label="Clear All Orders"
            sub="Permanently delete all order records. This cannot be undone."
          >
            <button
              className="btn btn-danger btn-sm"
              onClick={() => window.confirm("This will permanently delete all orders. Are you sure?") && alert("Not implemented in demo.")}
            >
              Clear Orders
            </button>
          </SettingRow>
          <SettingRow
            label="Reset Database"
            sub="Remove all products, customers, and orders. Irreversible."
          >
            <button
              className="btn btn-danger btn-sm"
              onClick={() => window.confirm("This will delete ALL data. Are you absolutely sure?") && alert("Not implemented in demo.")}
            >
              Reset Database
            </button>
          </SettingRow>
        </div>
      </div>
    </div>
  );
}
