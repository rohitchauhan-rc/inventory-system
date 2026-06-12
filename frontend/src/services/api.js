const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) {
    const message = data.detail || JSON.stringify(data);
    throw new Error(message);
  }
  return data;
}

export const api = {
  // Products
  getProducts: () => request("GET", "/products"),
  getProduct: (id) => request("GET", `/products/${id}`),
  createProduct: (data) => request("POST", "/products", data),
  updateProduct: (id, data) => request("PUT", `/products/${id}`, data),
  deleteProduct: (id) => request("DELETE", `/products/${id}`),

  // Customers
  getCustomers: () => request("GET", "/customers"),
  getCustomer: (id) => request("GET", `/customers/${id}`),
  createCustomer: (data) => request("POST", "/customers", data),
  deleteCustomer: (id) => request("DELETE", `/customers/${id}`),

  // Orders
  getOrders: () => request("GET", "/orders"),
  getOrder: (id) => request("GET", `/orders/${id}`),
  createOrder: (data) => request("POST", "/orders", data),
  deleteOrder: (id) => request("DELETE", `/orders/${id}`),

  // Dashboard
  getDashboard: () => request("GET", "/dashboard"),
};
