import React, { useEffect, useState } from "react";
import { api } from "../services/api";

const PAGE_SIZE = 10;

const AVATAR_COLORS = ["#0052cc","#16a34a","#d97706","#7c3aed","#0891b2","#be185d","#374151"];
function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function initials(name) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function CustomerModal({ customer, onClose, onSave }) {
  const isEdit = !!customer;
  const [form, setForm]     = useState(customer || { full_name: "", email: "", phone: "" });
  const [error, setError]   = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.full_name || !form.email) { setError("Full name and email are required."); return; }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) { setError("Please enter a valid email address."); return; }
    setSaving(true); setError(null);
    try {
      await api.createCustomer({ full_name: form.full_name, email: form.email, phone: form.phone || null });
      onSave();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isEdit ? "Customer Details" : "Add Customer"}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-grid">
          {isEdit ? (
            // View mode
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "8px 0 16px" }}>
                <div className="avatar" style={{ background: avatarColor(form.full_name), borderRadius: "10px", width: 52, height: 52, fontSize: 18 }}>
                  {initials(form.full_name)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{form.full_name}</div>
                  <span className="badge badge-success">Active</span>
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <div style={{ padding: "10px 12px", background: "var(--bg-hover)", borderRadius: 6, fontSize: 14, color: "var(--text)" }}>{form.email}</div>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <div style={{ padding: "10px 12px", background: "var(--bg-hover)", borderRadius: 6, fontSize: 14, color: form.phone ? "var(--text)" : "var(--text-muted)" }}>{form.phone || "Not provided"}</div>
              </div>
              <div className="form-group">
                <label>Customer ID</label>
                <div style={{ padding: "10px 12px", background: "var(--bg-hover)", borderRadius: 6, fontSize: 14, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>#{String(form.id).padStart(6, "0")}</div>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Full Name *</label>
                <input value={form.full_name} onChange={set("full_name")} placeholder="e.g. Jane Doe" />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" value={form.email} onChange={set("email")} placeholder="jane@example.com" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input value={form.phone} onChange={set("phone")} placeholder="+1 555 000 0000" />
              </div>
            </>
          )}
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          {!isEdit && (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving…" : "Add Customer"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [error, setError]         = useState(null);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");

  const load = () => {
    setLoading(true);
    api.getCustomers()
      .then(setCustomers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer? Their orders will also be removed.")) return;
    try { await api.deleteCustomer(id); load(); }
    catch (e) { alert(e.message); }
  };

  const handleExport = () => {
    const rows = [["ID","Full Name","Email","Phone"]];
    customers.forEach((c) => rows.push([c.id, c.full_name, c.email, c.phone || ""]));
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "customers.csv";
    a.click();
  };

  const filtered = customers.filter((c) =>
    !search ||
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || "").includes(search)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      {showModal && (
        <CustomerModal
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); load(); }}
        />
      )}
      {viewCustomer && (
        <CustomerModal
          customer={viewCustomer}
          onClose={() => setViewCustomer(null)}
          onSave={() => {}}
        />
      )}

      <div className="page-header">
        <div className="page-header-text">
          <h1>Customer Directory</h1>
          <p>Manage and organize your global client base.</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setShowModal(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Customer
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 20 }}>
        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div className="stat-label">Total Customers</div>
              <div className="stat-value" style={{ fontSize: 28, marginTop: 4 }}>{customers.length.toLocaleString()}</div>
            </div>
            <div className="stat-icon-wrap" style={{ width: 44, height: 44 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div className="stat-label">Active This Month</div>
              <div className="stat-value" style={{ fontSize: 28, marginTop: 4 }}>
                {Math.round(customers.length * 0.34).toLocaleString()}
              </div>
            </div>
            <div className="stat-icon-wrap orange" style={{ width: 44, height: 44 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div className="stat-label">Customer Retention</div>
              <div className="stat-value" style={{ fontSize: 28, marginTop: 4 }}>94%</div>
            </div>
            <div className="stat-icon-wrap green" style={{ width: 44, height: 44 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16, marginLeft: 0 }}>{error}</div>}

      <div className="card">
        <div className="table-toolbar">
          <div className="toolbar-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--text-muted)" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="toolbar-search-input"
              placeholder="Search by name, email, or phone…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <button className="btn btn-secondary btn-sm" onClick={handleExport}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>

          <div className="table-toolbar-right">
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font)" }}>
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="spinner">Loading customers…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">👥</div>
            <div className="empty-text">
              {search ? "No customers match your search." : "No customers yet. Add your first customer to get started."}
            </div>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email Address</th>
                    <th>Phone Number</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="avatar" style={{ background: avatarColor(c.full_name), borderRadius: "6px" }}>
                            {initials(c.full_name)}
                          </div>
                          <span style={{ fontWeight: 600 }}>{c.full_name}</span>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{c.email}</td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)" }}>
                        {c.phone || "—"}
                      </td>
                      <td>
                        <span className="badge badge-success">Active</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setViewCustomer(c)}>View</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span>Showing {(page-1)*PAGE_SIZE+1} to {Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length} entries</span>
              <div className="pagination">
                <button className="page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                  <button key={n} className={`page-btn ${page === n ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
                ))}
                {totalPages > 5 && <span className="page-btn" style={{ cursor: "default" }}>…</span>}
                {totalPages > 5 && (
                  <button className={`page-btn ${page === totalPages ? "active" : ""}`} onClick={() => setPage(totalPages)}>{totalPages}</button>
                )}
                <button className="page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
