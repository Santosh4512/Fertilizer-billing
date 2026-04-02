# Fertilizer Billing

A complete fertilizer shop billing solution with:

- Node.js + Express backend
- MongoDB (Atlas) for persistence
- React + Vite frontend dashboard
- User authentication (login/register)
- Secure change-password flow for logged-in admin
- Product management, invoice and stock reports
- Razorpay integration for payments

## Quick start

### Backend

1. `cd backend`
2. copy `.env.example` to `.env` and fill values
3. `npm install`
4. `npm run seed-admin` (creates/updates admin user from env)
5. `node server.js` (or `nodemon server.js`)

### Frontend

1. `cd frontend`
2. `npm install`
3. `npm run dev`

## API Endpoints

- `GET /` - server status
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/change-password` (requires bearer token)
- `GET /api/products`
- `POST /api/products` etc.

## Deployment

Deployed at: `https://fertilizer-billing.onrender.com`

## Notes

- Change frontend base URL in `frontend/src/services/api.js`.
- Keep `.env` secrets private.
