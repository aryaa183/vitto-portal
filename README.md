# Vitto Loan Portal

A full-stack Loan Application Portal built for Vitto's operations team to track and manage borrower applications.

## Live URLs

- **Frontend:** https://vitto-portal-zeta.vercel.app
- **Backend API:** https://vitto-backend-mv7j.onrender.com

## Tech Stack

- **Frontend:** React.js (Vite)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (Neon)
- **Deployment:** Vercel (frontend) + Render (backend)

## Features

- Loan application form with client + server side validation
- Dashboard with stats bar (total apps, total amount, status breakdown)
- Status filter and search by name or mobile number
- Approve / Reject applications inline without page reload
- Language badge colors per preferred language
- Mobile responsive layout
- Reference number on successful submission (VTT-XXXXXXXX)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/applications | Submit a new loan application |
| GET | /api/applications | Get all applications (supports ?status= filter) |
| PATCH | /api/applications/:id/status | Update application status |
| GET | /api/summary | Get stats summary |

## Local Setup

### Prerequisites
- Node.js v18+
- A PostgreSQL database (Neon free tier recommended)

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:
PORT=5000
DATABASE_URL=your_postgresql_connection_string

Run the migration in your DB:
```sql
-- See migrations/001_init.sql
```

Start the server:
```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

## Deployment

- Backend deployed on **Render** (free tier) — note: spins down after inactivity, first request may take ~30s
- Frontend deployed on **Vercel**
- Database hosted on **Neon** (free tier PostgreSQL)

## Known Issues

- Render free tier sleeps after 15 mins of inactivity — cold start delay on first request
- No authentication — dashboard is publicly accessible (would add JWT auth in production)

## What I'd Improve Next

- Add JWT authentication for the dashboard
- Pagination on the dashboard for large datasets
- Email/SMS notification on status change
- Audit log tracking who approved/rejected and when
