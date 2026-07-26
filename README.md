# ShopHub - Role-Based E-Commerce Platform

A full-stack e-commerce web application with role-based authentication, product CRUD with Cloudinary image uploads, Razorpay test payments, cart/wishlist, and role-specific dashboards.

## Live Links

| Service  | URL |
|----------|-----|
| Frontend | _https://shop-hub-ruby.vercel.app_ |
| Backend  | _https://shophub-ecbr.onrender.com_ |
| GitHub   | _https://github.com/1Dhrumil-P/ShopHub_ |

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, Vite, React Router, Axios |
| Backend  | Node.js, Express, MongoDB (Mongoose) |
| Auth     | JWT + bcrypt password hashing |
| Images   | Cloudinary (direct upload, URL stored in DB) |
| Payments | Razorpay (test mode with signature verification) |
| Deploy   | Render (backend) + Vercel (frontend) |

## Features

- **Role-based access control (enforced on backend)**
  - **Admin**: Manage all products, users & roles, all orders, sales stats
  - **Sales Person**: CRUD only their own products, view orders with their products
  - **User**: Browse/search/filter, wishlist, cart, checkout, order history
- Product search, category filter, price range filter
- Cloudinary image upload (no raw files on server)
- Razorpay checkout with server-side signature verification
- Responsive UI with role-adaptive navigation

## Test Credentials

| Role         | Email            | Password  |
|--------------|------------------|-----------|
| Admin        | admin@demo.com   | admin123  |
| Sales Person | sales@demo.com   | sales123  |
| User         | user@demo.com    | user123   |

> Run `npm run seed` in the backend to create these accounts and sample products.

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth guards, file upload
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   ├── utils/         # JWT, Cloudinary, Razorpay
│   │   ├── seed.js        # Demo data seeder
│   │   └── server.js      # Entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── api/
│   └── .env.example
└── README.md
```

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- [Cloudinary](https://cloudinary.com) account (free tier)
- [Razorpay](https://razorpay.com) test API keys

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd <repo-name>

cd backend && npm install
cd ../frontend && npm install
```

### 2. Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ecommerce
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Environment

```bash
cd frontend
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### 4. Seed Database

```bash
cd backend
npm run seed
```

### 5. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open http://localhost:5173

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register (user role) |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Auth | Current user |
| GET | `/api/products` | Public | List/search/filter products |
| POST | `/api/products` | Admin, Sales | Create product + image |
| PUT | `/api/products/:id` | Admin, Sales* | Update product |
| DELETE | `/api/products/:id` | Admin, Sales* | Delete product |
| GET | `/api/cart` | User, Admin | Get cart |
| POST | `/api/cart` | User, Admin | Add to cart |
| GET | `/api/wishlist` | User, Admin | Get wishlist |
| POST | `/api/orders/create-order` | User, Admin | Create Razorpay order |
| POST | `/api/orders/verify` | User, Admin | Verify payment signature |
| GET | `/api/orders/my` | User, Admin | User order history |
| GET | `/api/orders/sales` | Sales | Orders with seller's products |
| GET | `/api/orders/all` | Admin | All orders |
| GET | `/api/orders/stats` | Admin | Sales statistics |
| GET | `/api/users` | Admin | List users |
| PUT | `/api/users/:id/role` | Admin | Update user role |

*Sales can only modify their own products (403 otherwise)

## Deployment

### Backend → Render

1. Push code to GitHub
2. Create new **Web Service** on [Render](https://render.com)
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add all environment variables from `.env.example`
6. Use MongoDB Atlas connection string for `MONGODB_URI`
7. Set `CLIENT_URL` to your Vercel frontend URL

After deploy, run seed once via Render shell: `npm run seed`

### Frontend → Vercel

1. Import GitHub repo on [Vercel](https://vercel.com)
2. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Environment variables:
   - `VITE_API_URL` = `https://your-render-app.onrender.com/api`
   - `VITE_RAZORPAY_KEY_ID` = your Razorpay test key

### Verify Live Flow

1. Login as `user@demo.com`
2. Browse products → Add to cart
3. Checkout with Razorpay test card: `4100 2800 0000 1007`
4. Confirm order appears in My Orders
5. Login as admin → verify stats dashboard

## Razorpay Test Payment

Use these test details in Razorpay checkout:

- **Card**: 4100 2800 0000 1007
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **OTP**: Any 6 digits (test mode)

## Screenshots

Add screenshots to `docs/screenshots/`:

1. `home-products.png` - Product listing with filters
2. `admin-dashboard.png` - Admin stats and user management
3. `checkout-success.png` - Order confirmation after payment

## Git Workflow

Use a simple GitHub flow for all changes:

```bash
git checkout main
git pull origin main
git checkout -b feature/<short-name>
```

Make small, focused commits using conventional commit messages:

```bash
git add .
git commit -m "feat: add user registration flow"
git push -u origin feature/<short-name>
```

Suggested commit types:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation updates
- `refactor:` for code cleanup
- `chore:` for setup or maintenance

Before merging:

1. Open a Pull Request from your feature branch
2. Review the changes and test the app
3. Merge into `main` only after approval

> Avoid committing directly to `main`. Keep `main` stable and deploy only after a reviewed PR is merged.

## License

MIT
