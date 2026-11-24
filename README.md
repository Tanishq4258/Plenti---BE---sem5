# Plenti – Save More. Waste Less.
### Full-Stack Surplus Food Marketplace (MongoDB, Express, React & Node.js)

**Plenti** is a surplus-food marketplace designed to reduce food waste by connecting food businesses (bakeries, cafes, restaurants) with customers looking for quality meals at discounted prices.

---

## 🏗️ Architecture & Tech Stack

- **Database:** MongoDB (via Mongoose schemas with atomic inventory locking)
- **Backend API:** Node.js + Express REST API with JWT authentication, CORS, and role-based permissions (`customer`, `business`, `admin`)
- **Frontend Options:**
  - **React SPA:** Modern Vite + React single-page app located in `/client`
  - **HTML5/JS Client:** Vanilla web portals (`index.html`, `business-dashboard.html`, `admin-dashboard.html`) connected to the same live MongoDB backend via `/assets/js/api.js`

---

## ⚡ Quick Start Guide

### 1. Configure MongoDB Connection String
Open `server/.env` and paste your MongoDB URI (either MongoDB Atlas connection string or local MongoDB):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/plenti_db?retryWrites=true&w=majority
JWT_SECRET=plenti_super_secure_jwt_secret_key_2026_xyz987
JWT_EXPIRE=7d
```

### 2. Seed the Database with Realistic Data
Populate MongoDB with demo accounts (Admin, Merchants, Customers) and surplus food listings:
```bash
npm run seed
```

### 3. Run the Backend Server
Start the Express API server:
```bash
npm run dev
# Server will run at: http://localhost:5000/api
```

### 4. Run the React Client (Optional)
Start the modern React frontend:
```bash
npm run client
# React app will run at: http://localhost:3000
```
Or simply open `index.html`, `business-dashboard.html`, or `admin-dashboard.html` in your browser. They automatically connect to `http://localhost:5000/api`!

---

## 🔑 Seed Test Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Merchant (Artisan Bakery)** | `pierre@artisanbakery.com` | `password123` |
| **Merchant (Green Leaf Cafe)** | `ananya@greenleafcafe.com` | `password123` |
| **Customer** | `rohan@example.com` | `password123` |

---

## 📡 REST API Reference

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Public | Service health & status check |
| `/api/auth/register` | `POST` | Public | Register customer or food business |
| `/api/auth/login` | `POST` | Public | Authenticate user & return JWT token |
| `/api/auth/me` | `GET` | Authenticated | Retrieve current user profile |
| `/api/listings` | `GET` | Public | Browse surplus listings (filters: category, search) |
| `/api/listings` | `POST` | Business | Publish new surplus food listing |
| `/api/listings/:id/stock` | `PATCH` | Business | Real-time increment/decrement of stock |
| `/api/orders` | `POST` | Customer | Atomic food reservation booking |
| `/api/orders/store-orders` | `GET` | Business | Merchant incoming orders |
| `/api/orders/:id/status` | `PATCH` | Business/Admin | Transition status (`pending` ➔ `ready` ➔ `completed`) |
| `/api/admin/overview` | `GET` | Admin | Aggregate platform metrics & analytics |
| `/api/admin/businesses/:id/status` | `PATCH` | Admin | Approve or suspend business partners |
