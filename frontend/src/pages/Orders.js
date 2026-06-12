import React, { useEffect, useState } from "react";
import { api } from "../services/api";

const PAGE_SIZE = 10;

const AVATAR_COLORS = ["#0052cc","#16a34a","#d97706","#7c3aed","#0891b2","#be185d","#374151"];
function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

const STATUS_MAP = {
  pending:   { badge: "badge-warning", label: "Pending" },
  confirmed: { badge: "badge-info",    label: "Confirmed" },
  shipped:   { badge: "badge-info",    label: "In Transit" },
  delivered: { badge: "badge-success", label: "Completed" },
  cancelled: { badge: "badge-danger",  label: "Cancelled" },
};

function OrderModal({ onClose, onSave }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts]   = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems]         = useState([{ product_id: "", quantity: 1 }]);
  const [error, setError]         = useState(null);
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    Promise.all([api.getCustomers(), api.getProducts()])
      .then(([c, p]) => { setCustomers(c); setProducts(p); })
      .catch((e) => setError(e.message));
  }, []);

  const setItem = (idx, key, val) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));
  const addItem    = () => setItems((prev) => [...prev, { product_id: "", quantity: 1 }]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const getProduct = (id) => products.find((p) => p.id === parseInt(id));
  const total = items.reduce((s, it) => {
    const p = getProduct(it.product_id);
    return s + (p ? p.price * (parseInt(it.quantity) || 0) : 0);
  }, 0);

  const handleSubmit = async () => {
    if (!customerId) { setError("Please select a customer."); return; }
    const valid = items.filter((it) => it.product_id && parseInt(it.quantity) > 0);
    if (valid.length === 0) { setError("Add at least one item with a valid quantity."); return; }
    setSaving(true); setError(null);
    try {
      await api.createOrder({
        customer_id: parseInt(customerId),
        items: valid.map((it) => ({ product_id: parseInt(it.product_id), quantity: parseInt(it.quantity) })),
      });
      onSave();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Create New Order</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-grid">
          <div className="form-group">
            <label>Customer *</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
              ))}
            </select>
          </div>
          <div>
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label>Order Items *</label>
            </div>
            <div className="order-items-list">
              {items.map((item, idx) => {
                const prod = getProduct(item.product_id);
                return (
                  <div key={idx}>
                    <div className="order-item-row">
                      <div className="form-group" style={{ margin: 0, flex: 2 }}>
                        <select value={item.product_id} onChange={(e) => setItem(idx, "product_id", e.target.value)}>
                          <option value="">Select product…</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — ${p.price.toFixed(2)} (stock: {p.quantity})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group" style={{ margin: 0, flex: 1 }}>
                        <input
                          type="number" min="1" value={item.quantity}
                          onChange={(e) => setItem(idx, "quantity", e.target.value)}
                          placeholder="Qty"
                        />
                      </div>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeItem(idx)}
                        disabled={items.length === 1}
                        style={{ alignSelf: "flex-end", padding: "8px 10px" }}
                      >✕</button>
                    </div>
                    {prod && item.quantity > 0 && (
                      <div className="item-total">Subtotal: ${(prod.price * parseInt(item.quantity || 0)).toFixed(2)}</div>
                    )}
                  </div>
                );
              })}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Item</button>
            {total > 0 && <div className="order-total">Total: ${total.toFixed(2)}</div>}
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Placing…" : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <span className="modal-title">Order <span style={{ fontFamily: "var(--font-mono)", color: "var(--primary)" }}>#{order.id}</span></span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="card" style={{ padding: 14, boxShadow: "none" }}>
              <div className="stat-label" style={{ marginBottom: 6 }}>Customer</div>
              <div style={{ fontWeight: 600 }}>{order.customer?.full_name || `ID: ${order.customer_id}`}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>{order.customer?.email}</div>
            </div>
            <div className="card" style={{ padding: 14, boxShadow: "none" }}>
              <div className="stat-label" style={{ marginBottom: 6 }}>Order Info</div>
              <span className={`badge ${STATUS_MAP[order.status]?.badge || "badge-neutral"}`}>
                {STATUS_MAP[order.status]?.label || order.status}
              </span>
              <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 6 }}>
                {order.created_at ? new Date(order.created_at).toLocaleString() : "—"}
              </div>
            </div>
          </div>
          <div className="card" style={{ boxShadow: "none" }}>
            <div className="card-header" style={{ padding: "12px 16px" }}>
              <span className="card-title" style={{ fontSize: 13 }}>Items</span>
            </div>
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: "right" }}>Qty</th>
                  <th style={{ textAlign: "right" }}>Unit Price</th>
                  <th style={{ textAlign: "right" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product?.name || `Product #${item.product_id}`}</td>
                    <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 13 }}>{item.quantity}</td>
                    <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 13 }}>${item.unit_price.toFixed(2)}</td>
                    <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600 }}>${item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ borderTop: "1px solid var(--border)", padding: "12px 16px", textAlign: "right", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
              Total: ${order.total_amount.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [error, setError]         = useState(null);
  const [page, setPage]           = useState(1);
  const [filter, setFilter]       = useState("all"); // all | priority

  const load = () => {
    setLoading(true);
    api.getOrders()
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Cancel this order? Stock will be restored.")) return;
    try { await api.deleteOrder(id); load(); }
    catch (e) { alert(e.message); }
  };

  const handleView = async (id) => {
    try { const o = await api.getOrder(id); setViewOrder(o); }
    catch (e) { alert(e.message); }
  };

  const pending   = orders.filter((o) => o.status === "pending").length;
  const inTransit = orders.filter((o) => o.status === "shipped").length;
  const completed = orders.filter((o) => o.status === "delivered").length;
  const critical  = orders.filter((o) => o.status === "cancelled").length;

  const filtered = filter === "priority"
    ? orders.filter((o) => o.status === "pending" || o.status === "cancelled")
    : orders;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      {showCreate && (
        <OrderModal onClose={() => setShowCreate(false)} onSave={() => { setShowCreate(false); load(); }} />
      )}
      {viewOrder && (
        <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} />
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Order Management</h1>
          <p>Real-time oversight of global logistics operations.</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setShowCreate(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create New Order
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <span className="stat-change up">+12%</span>
          </div>
          <div className="stat-label">Pending Orders</div>
          <div className="stat-value">{pending.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon-wrap orange">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
          </div>
          <div className="stat-label">In Transit</div>
          <div className="stat-value">{inTransit.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon-wrap green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
          </div>
          <div className="stat-label">Completed Today</div>
          <div className="stat-value">{completed.toLocaleString()}</div>
        </div>
        <div className="stat-card alert-card">
          <div className="stat-card-top">
            <div className="stat-icon-wrap red">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
          </div>
          <div className="stat-label">Critical Alerts</div>
          <div className="stat-value">{String(critical).padStart(2, "0")}</div>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16, marginLeft: 0 }}>{error}</div>}

      {/* Table Card */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="card-title">Orders List</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                style={{
                  padding: "4px 12px", borderRadius: 4, fontSize: 13, fontWeight: 500,
                  border: "1px solid", fontFamily: "var(--font)", cursor: "pointer",
                  background: filter === "all" ? "var(--text)" : "var(--bg-card)",
                  color: filter === "all" ? "#fff" : "var(--text-muted)",
                  borderColor: filter === "all" ? "var(--text)" : "var(--border)",
                }}
                onClick={() => { setFilter("all"); setPage(1); }}
              >All</button>
              <button
                style={{
                  padding: "4px 12px", borderRadius: 4, fontSize: 13, fontWeight: 500,
                  border: "1px solid", fontFamily: "var(--font)", cursor: "pointer",
                  background: filter === "priority" ? "var(--text)" : "var(--bg-card)",
                  color: filter === "priority" ? "#fff" : "var(--text-muted)",
                  borderColor: filter === "priority" ? "var(--text)" : "var(--border)",
                }}
                onClick={() => { setFilter("priority"); setPage(1); }}
              >Priority</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            </button>
            <button className="btn btn-secondary btn-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="spinner">Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🧾</div>
            <div className="empty-text">No orders found. Create your first order to get started.</div>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Total Amount</th>
                    <th>Order Status</th>
                    <th>Date Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((o) => {
                    const custName = o.customer?.full_name || `Customer #${o.customer_id}`;
                    const statusInfo = STATUS_MAP[o.status] || { badge: "badge-neutral", label: o.status };
                    return (
                      <tr key={o.id}>
                        <td>
                          <button className="order-id-link" onClick={() => handleView(o.id)}>
                            #{String(o.id).padStart(7, "0")}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                              className="avatar"
                              style={{ background: avatarColor(custName), borderRadius: "6px", fontSize: 10 }}
                            >
                              {initials(custName)}
                            </div>
                            <span style={{ fontWeight: 500 }}>{custName}</span>
                          </div>
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600 }}>
                          ${o.total_amount.toFixed(2)}
                        </td>
                        <td>
                          <span className={`badge ${statusInfo.badge}`}>{statusInfo.label}</span>
                        </td>
                        <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                          {o.created_at ? new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleView(o.id)}>View</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Cancel</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span>Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length} results</span>
              <div className="pagination">
                <button className="page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((n) => (
                  <button key={n} className={`page-btn ${page === n ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
                ))}
                <button className="page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
