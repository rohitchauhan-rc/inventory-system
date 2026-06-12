# InvenFlow — Inventory & Order Management System

A production-ready full-stack application for managing products, customers, and orders. Built with FastAPI, React, PostgreSQL, and Docker.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, plain CSS |
| Backend | Python 3.11, FastAPI |
| Database | PostgreSQL 15 |
| ORM | SQLAlchemy 2 |
| Containerization | Docker + Docker Compose |
| Frontend Hosting | Vercel / Netlify |
| Backend Hosting | Render / Railway / Fly.io |

---

## Project Structure

```
inventory-system/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, router registration
│   │   ├── database.py        # SQLAlchemy engine & session
│   │   ├── models/
│   │   │   ├── product.py
│   │   │   ├── customer.py
│   │   │   └── order.py       # Order + OrderItem models
│   │   ├── routers/
│   │   │   ├── products.py
│   │   │   ├── customers.py
│   │   │   └── orders.py
│   │   └── schemas/
│   │       └── __init__.py    # All Pydantic schemas
│   ├── Dockerfile
│   ├── .dockerignore
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js             # Shell layout + navigation
│   │   ├── App.css            # Global styles (dark theme)
│   │   ├── index.js
│   │   ├── services/
│   │   │   └── api.js         # Centralised API client
│   │   └── pages/
│   │       ├── Dashboard.js
│   │       ├── Products.js
│   │       ├── Customers.js
│   │       └── Orders.js
│   ├── Dockerfile
│   ├── .dockerignore
│   └── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Quick Start (Docker)

### 1. Clone and configure

```bash
git clone <your-repo-url>
cd inventory-system
cp .env.example .env
# Edit .env and set a strong POSTGRES_PASSWORD
```

### 2. Build and run all services

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (Redoc) | http://localhost:8000/redoc |

### 3. Stop services

```bash
docker compose down
# To also remove the database volume:
docker compose down -v
```

---

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variable
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8000 npm start
```

---

## API Reference

### Health & Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/health` | Health status |
| GET | `/dashboard` | Summary stats + low-stock products |

### Products `/products`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/products` | Create a product |
| GET | `/products` | List all products |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

**Create product body:**
```json
{
  "name": "Wireless Mouse",
  "sku": "WM-001",
  "price": 29.99,
  "quantity": 50,
  "description": "Ergonomic wireless mouse"
}
```

### Customers `/customers`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/customers` | Create a customer |
| GET | `/customers` | List all customers |
| GET | `/customers/{id}` | Get customer by ID |
| DELETE | `/customers/{id}` | Delete customer |

**Create customer body:**
```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1 555 000 0000"
}
```

### Orders `/orders`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders` | Create an order |
| GET | `/orders` | List all orders |
| GET | `/orders/{id}` | Get order details |
| DELETE | `/orders/{id}` | Cancel order (restores stock) |

**Create order body:**
```json
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ]
}
```

---

## Business Logic

- **Unique SKU**: Creating a product with a duplicate SKU returns `409 Conflict`.
- **Unique email**: Creating a customer with a duplicate email returns `409 Conflict`.
- **Stock validation**: Orders are rejected if any item's requested quantity exceeds available stock.
- **Auto stock deduction**: Placing an order automatically reduces each product's quantity.
- **Stock restoration**: Cancelling an order (`DELETE /orders/{id}`) restores inventory.
- **Auto total**: `total_amount` is computed server-side from `price × quantity` per item.
- **Non-negative quantity**: Product quantity cannot be set below zero.

---

## Deployment

### Backend on Render

1. Push code to GitHub.
2. Go to [render.com](https://render.com) → New → Web Service.
3. Connect your repository, set **Root Directory** to `backend`.
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variable: `DATABASE_URL` → your PostgreSQL connection string.
7. Add a **PostgreSQL** service on Render and copy the internal connection string.

### Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → import your repo.
2. Set **Root Directory** to `frontend`.
3. Add environment variable: `REACT_APP_API_URL` → your Render backend URL (e.g. `https://your-api.onrender.com`).
4. Deploy.

### Frontend on Netlify

1. Go to [netlify.com](https://netlify.com) → Add new site → Import from Git.
2. Base directory: `frontend`, Build command: `npm run build`, Publish directory: `frontend/build`.
3. Add environment variable: `REACT_APP_API_URL` → your backend URL.
4. Deploy.

### Docker Hub (backend image)

```bash
docker build -t yourdockerhubuser/inventory-backend:latest ./backend
docker push yourdockerhubuser/inventory-backend:latest
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `POSTGRES_DB` | Database name | `inventory_db` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | *(required in prod)* |
| `DATABASE_URL` | Full PostgreSQL URL | auto-built from above |
| `REACT_APP_API_URL` | Backend base URL for frontend | `http://localhost:8000` |

---

## Features

### Dashboard
- Total products, customers, orders at a glance
- Low-stock alert panel (products with ≤ 10 units)

### Products
- Create, view, edit, and delete products
- SKU uniqueness enforced
- Stock-level badges (green / amber / red)

### Customers
- Create and delete customers
- Email uniqueness enforced

### Orders
- Multi-item order creation with live subtotal preview
- Automatic total calculation
- Order detail modal with full line-item breakdown
- Cancel order with automatic stock restoration

---

## License

MIT
