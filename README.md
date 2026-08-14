# SilverHands (SilverHands) 🤝👵

**AI-Powered Digital Livelihood Platform for Senior Citizens and Homemakers**

SilverHands connects senior citizens and homemakers in India with customers seeking trusted local services, tutoring, homemade products, traditional cooking, and flexible mentoring.

---

## 🏗️ Project Architecture (Monorepo)

```
silverhands/
├── client/                 # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components (Landing, Auth, Dashboard, etc.)
│   │   ├── services/      # API communication layer
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Helper functions
│   │   ├── contexts/      # Context providers (Auth, Language)
│   │   ├── App.jsx        # Routing configuration
│   │   └── main.jsx       # App entry point
│   ├── package.json
│   └── .env.example
│
├── server/                 # Node.js + Express + MongoDB Backend
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── models/        # Mongoose data models
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # Express API routes
│   │   ├── middleware/    # Auth & error handling middleware
│   │   ├── services/      # AI & Matching services
│   │   ├── utils/         # Backend helpers
│   │   └── server.js      # Server entry point
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## ⚡ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas / Mongoose
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Security**: Password hashing, input validation, CORS protection

---

## 🚀 Quick Start (Phase 1)

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017/silverhands` or MongoDB Atlas URI)

### 2. Backend Setup (`server/`)
```bash
cd server
npm install
copy .env.example .env
npm run dev
# Server will start on http://localhost:5000
```

### 3. Frontend Setup (`client/`)
```bash
cd client
npm install
copy .env.example .env
npm run dev
# Frontend will open at http://localhost:5173
```

---

## 🔒 Environment Variables

### Backend (`server/.env`)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for signing JWT tokens
- `AI_API_KEY` - LLM API key (kept strictly on server)
- `PORT` - Port number (default: 5000)

### Frontend (`client/.env`)
- `VITE_API_BASE_URL` - Backend API base endpoint (`http://localhost:5000/api`)
