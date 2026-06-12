import React, { useEffect, useState } from "react";
import { api } from "../services/api";

function StatBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: "var(--text)" }}>{label}</span>
        <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{value.toLocaleString()}</span>
      </div>
      <div style={{ height: 6, background: "var(--bg-hover)", borderRadius: 999 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color || "var(--primary)", borderRadius: 999, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

export default function Reports() {
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.getDashboard(), api.getProducts(), api.getOrders()])
      .then(([dash, prods, ords]) => {
        setData(dash);
        setProducts(prods);
        setOrders(ords);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner">Loading reports…</div>;
  if (error)   return <div className="alert alert-error" style={{ margin: 0 }}>{error}</div>;

  // Compute metrics
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total_amount, 0);

  const ordersByStatus = {
    pending:   orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    shipped:   orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };
  const maxStatus = Math.max(...Object.values(ordersByStatus));

  const inStockCount = products.filter((p) => p.quantity > 10).length;
  const lowStockCount = products.filter((p) => p.quantity > 0 && p.quantity <= 10).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;

  const topProducts = [...products]
    .sort((a, b) => b.price * b.quantity - a.price * a.quantity)
    .slice(0, 5);
  const maxVal = topProducts[0] ? topProducts[0].price * topProducts[0].quantity : 1;

  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Reports & Analytics</h1>
          <p>Key metrics and performance insights for your inventory system.</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon-wrap green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
          </div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value" style={{ fontSize: 22 }}>
            ${totalRevenue >= 1e6
              ? (totalRevenue / 1e6).toFixed(2) + "M"
              : totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
          </div>
          <div className="stat-label">Total Orders</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{orders.length.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon-wrap orange">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
          <div className="stat-label">Avg. Order Value</div>
          <div className="stat-value" style={{ fontSize: 22 }}>${avgOrderValue.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
          </div>
          <div className="stat-label">Total Products</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{products.length.toLocaleString()}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Order Status Breakdown */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Order Status Breakdown</span>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <StatBar label="Delivered / Completed" value={ordersByStatus.delivered} max={maxStatus || 1} color="#16a34a" />
            <StatBar label="Shipped / In Transit"  value={ordersByStatus.shipped}   max={maxStatus || 1} color="#0891b2" />
            <StatBar label="Confirmed"             value={ordersByStatus.confirmed} max={maxStatus || 1} color="#0052cc" />
            <StatBar label="Pending"               value={ordersByStatus.pending}   max={maxStatus || 1} color="#d97706" />
            <StatBar label="Cancelled"             value={ordersByStatus.cancelled} max={maxStatus || 1} color="#dc2626" />
          </div>

          {/* Inventory Health */}
          <div className="card-header" style={{ borderTop: "1px solid var(--border)", marginTop: 4 }}>
            <span className="card-title">Inventory Health</span>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <StatBar label="In Stock"     value={inStockCount}    max={products.length || 1} color="#16a34a" />
            <StatBar label="Low Stock"    value={lowStockCount}   max={products.length || 1} color="#d97706" />
            <StatBar label="Out of Stock" value={outOfStockCount} max={products.length || 1} color="#dc2626" />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Top Products by Value */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Top Products by Stock Value</span>
            </div>
            {topProducts.length === 0 ? (
              <div className="empty"><div className="empty-text">No products to display.</div></div>
            ) : (
              <div style={{ padding: "12px 20px" }}>
                {topProducts.map((p) => {
                  const val = p.price * p.quantity;
                  const pct = maxVal > 0 ? Math.round((val / maxVal) * 100) : 0;
                  return (
                    <div key={p.id} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8, fontFamily: "var(--font-mono)" }}>{p.sku}</span>
                        </div>
                        <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                          ${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div style={{ height: 5, background: "var(--bg-hover)", borderRadius: 999 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "var(--primary)", borderRadius: 999, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary Table */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Quick Summary</span>
            </div>
            <div className="table-wrap">
              <table>
                <tbody>
                  {[
                    ["Total Products",    products.length],
                    ["In Stock",          inStockCount],
                    ["Low Stock",         lowStockCount],
                    ["Out of Stock",      outOfStockCount],
                    ["Total Customers",   data.total_customers],
                    ["Total Orders",      orders.length],
                    ["Cancelled Orders",  ordersByStatus.cancelled],
                    ["Total Revenue",     "$" + totalRevenue.toFixed(2)],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{label}</td>
                      <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13 }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
