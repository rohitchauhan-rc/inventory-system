import React, { useEffect, useState } from "react";
import { api } from "../services/api";

const ActivityItem = ({ icon, title, sub, time }) => (
  <div className="activity-item">
    <div className="activity-dot">{icon}</div>
    <div>
      <div className="activity-title">{title}</div>
      <div className="activity-sub">{sub}</div>
      <div className="activity-time">{time}</div>
    </div>
  </div>
);

export default function Dashboard({ navigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner">Loading dashboard…</div>;
  if (error)   return <div className="alert alert-error" style={{ margin: 0 }}>{error}</div>;

  const lowStockCount = data.low_stock_products.length;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Dashboard</h1>
          <p>Overview of your inventory and logistics operations</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => navigate && navigate("products")}>
          <div className="stat-card-top">
            <div className="stat-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0052cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <span className="stat-change up">+12%</span>
          </div>
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{data.total_products.toLocaleString()}</div>
        </div>

        <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => navigate && navigate("customers")}>
          <div className="stat-card-top">
            <div className="stat-icon-wrap green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span className="stat-change up">+5.4%</span>
          </div>
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{data.total_customers.toLocaleString()}</div>
        </div>

        <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => navigate && navigate("orders")}>
          <div className="stat-card-top">
            <div className="stat-icon-wrap orange">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <span className="stat-change down">-2.1%</span>
          </div>
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{data.total_orders.toLocaleString()}</div>
        </div>

        <div className="stat-card alert-card" style={{ cursor: "pointer" }} onClick={() => navigate && navigate("products")}>
          <div className="stat-card-top">
            <div className="stat-icon-wrap red">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
          <div className="stat-label">Low Stock Alerts</div>
          <div className="stat-value">{lowStockCount.toString().padStart(2, "0")}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Low Stock Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Low Stock Products</span>
            <button className="card-link" onClick={() => navigate && navigate("products")}>
              View All Inventory →
            </button>
          </div>
          {lowStockCount === 0 ? (
            <div className="empty">
              <div className="empty-icon">✅</div>
              <div className="empty-text">All products are well stocked</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product Name</th>
                    <th style={{ textAlign: "right" }}>Current Qty</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.low_stock_products.map((p) => (
                    <tr key={p.id}>
                      <td><span className="mono">{p.sku}</span></td>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 13 }}>{p.quantity}</td>
                      <td>
                        <span className={`badge ${p.quantity === 0 ? "badge-danger" : "badge-warning"}`}>
                          {p.quantity === 0 ? "Critical" : "Low Stock"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Order Trends</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Last 7 Days</span>
            </div>
            <div style={{ padding: "20px", display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
              {[40, 65, 50, 80, 60, 90, 100].map((h, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: "100%",
                    height: `${h}%`,
                    background: i === 6 ? "var(--primary)" : "var(--primary-light)",
                    borderRadius: "3px 3px 0 0",
                    transition: "height 0.3s"
                  }} />
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {["M","T","W","T","F","S","S"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Activity</span>
              <button className="card-link" onClick={() => navigate && navigate("orders")}>View Orders →</button>
            </div>
            <div className="activity-list">
              <ActivityItem icon="🚚" title="Order Shipped" sub="Latest order dispatched" time="2 minutes ago" />
              <ActivityItem icon="👤" title="New Customer Registered" sub="Account created" time="45 minutes ago" />
              <ActivityItem icon="📦" title="Stock Re-order Placed" sub="Inventory replenishment" time="2 hours ago" />
              {lowStockCount > 0 && (
                <ActivityItem icon="⚠️" title="Low Stock Alert" sub={`${lowStockCount} product(s) need attention`} time="Just now" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
