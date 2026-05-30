# 🏦 Loan Management System (LMS)

A full-stack lending platform built with the MERN stack + Next.js and TypeScript. Borrowers can apply for loans through a multi-step portal, while internal executives manage the loan lifecycle through a role-based operations dashboard.

---

## 🔗 Live Demo

| | URL |
|---|---|
| **Frontend** | https://lms-loan-management.vercel.app |
| **Backend API** | https://lms-backend.onrender.com/api/health |

---

## 🔐 Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@lms.com | Admin@123 |
| Sales | sales@lms.com | Sales@123 |
| Sanction | sanction@lms.com | Sanction@123 |
| Disbursement | disburse@lms.com | Disburse@123 |
| Collection | collection@lms.com | Collection@123 |
| Borrower | borrower@lms.com | Borrower@123 |

---

## 🎥 Demo Video

[Watch the full walkthrough (3–5 min)](https://youtube.com/your-video-link)

> Shows: BRE pass & fail → Sanction → Disburse → Payment → Loan Close

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| Backend | Node.js + Express.js + TypeScript |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| File Upload | Multer (PDF/JPG/PNG, max 5MB) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 📁 Project Structure

```
lms/
├── client/                     # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/      # Login page
│   │   │   │   └── register/   # Borrower registration
│   │   │   ├── apply/
│   │   │   │   ├── personal/   # Step 1 — Personal details + BRE
│   │   │   │   ├── upload/     # Step 2 — Salary slip upload
│   │   │   │   ├── loan/       # Step 3 — Loan config + SI calculator
│   │   │   │   └── status/     # Loan status tracker
│   │   │   ├── dashboard/
│   │   │   │   ├── sales/      # Lead tracking
│   │   │   │   ├── sanction/   # Approve / reject loans
│   │   │   │   ├── disbursement/ # Release funds
│   │   │   │   ├── collection/ # Record payments
│   │   │   │   └── admin/      # Admin overview + stats
│   │   │   └── unauthorized/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   └── StepIndicator.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── lib/
│   │   │   └── api.ts          # Axios instance + interceptors
│   │   └── types/
│   │       └── index.ts
│   └── .env.local.example
│
└── server/                     # Express.js Backend
    ├── src/
    │   ├── config/
    │   │   └── db.ts           # MongoDB connection
    │   ├── controllers/
    │   │   ├── auth.controller.ts
    │   │   ├── borrower.controller.ts
    │   │   ├── sales.controller.ts
    │   │   ├── sanction.controller.ts
    │   │   ├── disbursement.controller.ts
    │   │   ├── collection.controller.ts
    │   │   └── admin.controller.ts
    │   ├── middleware/
    │   │   ├── auth.middleware.ts   # JWT verification
    │   │   └── rbac.middleware.ts   # Role-based access control
    │   ├── models/
    │   │   ├── User.ts
    │   │   ├── Application.ts
    │   │   ├── Loan.ts
    │   │   └── Payment.ts
    │   ├── routes/
    │   ├── utils/
    │   │   ├── bre.ts              # Business Rule Engine
    │   │   └── loanCalculator.ts   # Simple Interest formula
    │   ├── index.ts
    │   └── seed.ts
    └── .env.example
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Git

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/lms-loan-management.git
cd lms-loan-management
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Fill in your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/lms?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Seed the database:

```bash
npm run seed
```

Start the server:

```bash
npm run dev
```

> Server runs on http://localhost:5000

---

### 3. Frontend Setup

```bash
cd client
npm install
```

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

> App runs on http://localhost:3000

---

## 🗄️ Database Design

### Collections

**`users`**
```
name, email, password (hashed), role, createdAt
```

**`applications`**
```
userId, fullName, pan, dob, monthlySalary, employmentMode,
salarySlipUrl, breStatus, breRejectionReasons, createdAt
```

**`loans`**
```
applicationId, userId, principal, tenureInDays, interestRate,
simpleInterest, totalRepayment, totalPaid, outstandingBalance,
status, rejectionReason, sanctionedBy, sanctionedAt,
disbursedBy, disbursedAt, createdAt
```

**`payments`**
```
loanId, utrNumber (unique), amount, date, recordedBy, createdAt
```

---

## 🔄 Loan Status Lifecycle

```
APPLIED → SANCTIONED → DISBURSED → CLOSED
       ↘ REJECTED
```

| Transition | Who triggers it |
|---|---|
| → Applied | Borrower (submits application) |
| → Sanctioned | Sanction Executive |
| → Rejected | Sanction Executive (with reason) |
| → Disbursed | Disbursement Executive |
| → Closed | Auto (when totalPaid >= totalRepayment) |

---

## 🧠 Business Rule Engine (BRE)

Runs **server-side** on personal details submission. All 4 rules must pass:

| Rule | Condition |
|---|---|
| Age | Must be between 23 and 50 years |
| Salary | Monthly salary ≥ ₹25,000 |
| PAN | Must match regex `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/` |
| Employment | Must NOT be Unemployed |

If any rule fails → application blocked with clear error messages shown to borrower.

---

## 💰 Loan Calculator

**Formula:** Simple Interest

```
SI = (P × R × T) / (365 × 100)
Total Repayment = P + SI
```

Where:
- P = Principal (₹50,000 – ₹5,00,000)
- R = 12% per annum (fixed)
- T = Tenure in days (30 – 365)

---

## 🛡️ Role-Based Access Control (RBAC)

| Role | Module Access |
|---|---|
| **Borrower** | Apply portal only |
| **Sales** | Sales dashboard |
| **Sanction** | Sanction dashboard |
| **Disbursement** | Disbursement dashboard |
| **Collection** | Collection dashboard |
| **Admin** | All modules + stats |

RBAC is enforced on **both frontend and backend**:
- Frontend: route guards in layout components redirect unauthorized users
- Backend: `allowRoles()` middleware returns `403` for unauthorized API calls

---

## 📡 API Reference

### Auth
```
POST   /api/auth/register          Register new borrower
POST   /api/auth/login             Login (all roles)
GET    /api/auth/me                Get current user
```

### Borrower
```
POST   /api/borrower/personal-details    Submit details + run BRE
POST   /api/borrower/upload-slip         Upload salary slip
POST   /api/borrower/apply               Apply for loan
GET    /api/borrower/status              Get loan status
GET    /api/borrower/calculate           Live SI preview
```

### Sales
```
GET    /api/sales/leads                  All borrowers with funnel stage
```

### Sanction
```
GET    /api/sanction/loans               Applied loans
GET    /api/sanction/loans/:id           Loan details
PUT    /api/sanction/loans/:id/approve   Approve → Sanctioned
PUT    /api/sanction/loans/:id/reject    Reject with reason
```

### Disbursement
```
GET    /api/disbursement/loans           Sanctioned loans
PUT    /api/disbursement/loans/:id/disburse  Mark as disbursed
```

### Collection
```
GET    /api/collection/loans             Active loans
GET    /api/collection/loans/:id         Loan + payment history
POST   /api/collection/loans/:id/payment Record payment
```

### Admin
```
GET    /api/admin/loans                  All loans (filterable)
GET    /api/admin/users                  All users
GET    /api/admin/stats                  Dashboard statistics
```

---

## 🔒 Security

- Passwords hashed with **bcryptjs** (10 salt rounds)
- JWT tokens expire in **7 days**
- API rejects unauthorized requests with proper HTTP status codes (`401`, `403`)
- File uploads validated for type (PDF/JPG/PNG) and size (max 5MB)
- UTR numbers enforced as **globally unique** across all payments via MongoDB unique index

---

## 📦 Environment Variables

### Backend (`server/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `NODE_ENV` | `development` or `production` |

### Frontend (`client/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

---

## 🚀 Deployment

| Service | Platform | Config |
|---|---|---|
| Frontend | Vercel | Root: `client/`, auto-detected Next.js |
| Backend | Render | Root: `server/`, Build: `npm run build`, Start: `npm start` |
| Database | MongoDB Atlas | Free M0 cluster |

---

## 👤 Author

**Shreyansh**
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
