import React, { useEffect, useState } from "react";
import { api } from "../services/api";

const PAGE_SIZE = 10;

function getStockBadge(qty) {
  if (qty === 0)   return <span className="badge badge-danger">Out of Stock</span>;
  if (qty <= 10)   return <span className="badge badge-warning">Low Stock</span>;
  return               <span className="badge badge-success">In Stock</span>;
}

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(
    product || { name: "", sku: "", price: "", quantity: "", description: "" }
  );
  const [error, setError]   = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.sku || form.price === "" || form.quantity === "") {
      setError("Name, SKU, price, and quantity are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity, 10),
        description: form.description || null,
      };
      if (product?.id) {
        await api.updateProduct(product.id, payload);
      } else {
        await api.createProduct(payload);
      }
      onSave();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{product?.id ? "Edit Product" : "Add Product"}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-grid">
          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
              <input value={form.name} onChange={set("name")} placeholder="e.g. Wireless Mouse" />
            </div>
            <div className="form-group">
              <label>SKU / Code *</label>
              <input value={form.sku} onChange={set("sku")} placeholder="e.g. WM-001" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Price ($) *</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={set("price")} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Quantity *</label>
              <input type="number" min="0" value={form.quantity} onChange={set("quantity")} placeholder="0" />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <input value={form.description} onChange={set("description")} placeholder="Optional description" />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : product?.id ? "Update Product" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [error, setError]       = useState(null);
  const [density, setDensity]   = useState("compact");
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const load = () => {
    setLoading(true);
    api.getProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try { await api.deleteProduct(id); load(); }
    catch (e) { alert(e.message); }
  };

  const handleExport = () => {
    const rows = [["Name","SKU","Price","Quantity","Status"]];
    products.forEach((p) => {
      const status = p.quantity === 0 ? "Out of Stock" : p.quantity <= 10 ? "Low Stock" : "In Stock";
      rows.push([p.name, p.sku, p.price.toFixed(2), p.quantity, status]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "products.csv";
    a.click();
  };

  // Filter logic
  const filtered = products.filter((p) => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" ? true :
      filterStatus === "low" ? (p.quantity > 0 && p.quantity <= 10) :
      filterStatus === "out" ? p.quantity === 0 :
      p.quantity > 10;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const lowStock  = products.filter((p) => p.quantity > 0 && p.quantity <= 10).length;
  const outStock  = products.filter((p) => p.quantity === 0).length;
  const totalVal  = products.reduce((s, p) => s + p.price * p.quantity, 0);

  return (
    <div>
      {modal !== null && (
        <ProductModal
          product={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}

      <div className="page-header">
        <div className="page-header-text">
          <h1>Product Inventory</h1>
          <p>Manage your global enterprise product catalog and stock levels.</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setModal("add")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Product
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setFilterStatus("all")}>
          <div className="stat-label">Total Products</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
            <div className="stat-value" style={{ fontSize: 26 }}>{products.length.toLocaleString()}</div>
            <span className="stat-change up">+4%</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderColor: lowStock > 0 ? "#fcd34d" : undefined, cursor: "pointer" }} onClick={() => setFilterStatus("low")}>
          <div className="stat-label">Low Stock Alerts</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
            <div className="stat-value" style={{ fontSize: 26, color: lowStock > 0 ? "var(--warning)" : undefined }}>
              {lowStock + outStock}
            </div>
            {(lowStock + outStock) > 0 && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            )}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Stock Value</div>
          <div className="stat-value" style={{ fontSize: 26, marginTop: 4 }}>
            ${totalVal >= 1e6 ? (totalVal / 1e6).toFixed(1) + "M" : totalVal.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg. Fulfillment</div>
          <div className="stat-value" style={{ fontSize: 26, marginTop: 4 }}>1.4 days</div>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16, marginLeft: 0, marginRight: 0 }}>{error}</div>}

      <div className="card">
        <div className="table-toolbar">
          {/* Search */}
          <div className="toolbar-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--text-muted)" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="toolbar-search-input"
              placeholder="Search by name or SKU…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Status filter */}
          <select
            className="toolbar-select"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          >
            <option value="all">All Status</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          <button className="btn btn-secondary btn-sm" onClick={handleExport}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>

          <div className="table-toolbar-right">
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Density:</span>
            <div className="density-toggle">
              <button className={`density-btn ${density === "compact" ? "active" : ""}`} onClick={() => setDensity("compact")}>Compact</button>
              <button className={`density-btn ${density === "comfortable" ? "active" : ""}`} onClick={() => setDensity("comfortable")}>Comfortable</button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="spinner">Loading products…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📦</div>
            <div className="empty-text">
              {search || filterStatus !== "all" ? "No products match your filters." : "No products yet. Add your first product to get started."}
            </div>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className={density === "compact" ? "density-compact" : ""}>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Quantity in Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        {p.description && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{p.description}</div>}
                      </td>
                      <td><span className="mono">{p.sku}</span></td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>${p.price.toFixed(2)}</td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{p.quantity.toLocaleString()}</td>
                      <td>{getStockBadge(p.quantity)}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setModal(p)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span>Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} products</span>
              <div className="pagination">
                <button className="page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
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
