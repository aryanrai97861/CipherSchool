# CipherSQLStudio

A browser-based SQL learning platform where students can practice SQL queries against pre-configured assignments with real-time execution and AI-powered hints.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite + TypeScript |
| Styling | Vanilla SCSS (mobile-first) |
| Code Editor | Monaco Editor |
| Backend | Node.js + Express.js |
| Sandbox DB | PostgreSQL (Neon.tech) |
| Persistence | MongoDB Atlas |
| LLM Integration | Google Gemini API |

## Features

### Core
- **Assignment Listing** — Browse SQL assignments with difficulty badges (Easy/Medium/Hard)
- **SQL Editor** — Monaco Editor with syntax highlighting, auto-complete, and Ctrl+Enter execution
- **Real-time Query Execution** — Execute SELECT queries against a PostgreSQL sandbox
- **Schema Viewer** — View table schemas and sample data for each assignment
- **AI Hints** — Get intelligent guidance (not solutions) from Gemini via a slide-out panel
- **Query Validation** — Only SELECT queries allowed; dangerous keywords blocked

### Optional
- **User Authentication** — JWT-based signup/login with persistent sessions
- **Responsive Design** — Mobile-first layouts at 320px, 641px, 1024px, 1281px breakpoints

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database ([Neon.tech](https://neon.tech) free tier)
- MongoDB database ([MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- [Gemini API Key](https://ai.google.dev/)

### 1. Clone and Install

```bash
# Install server dependencies
cd server
cp .env.example .env   # Then fill in your credentials
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Edit `server/.env` with your credentials:

```env
PORT=5000
NEON_DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ciphersqlstudio
GEMINI_API_KEY=your_key_here
JWT_SECRET=any_random_string
```

### 3. Seed the Database

```bash
cd server
npm run seed
```

This creates sample tables (`employees`, `departments`, `products`, `orders`, `order_items`) in PostgreSQL and 6 assignments in MongoDB.

### 4. Run the Application

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assignments` | List all assignments |
| GET | `/api/assignments/:id` | Get assignment details |
| POST | `/api/query/execute` | Execute SQL query |
| POST | `/api/hints` | Get AI hint |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/health` | Health check |

## Project Structure

```
cipherschool/
├── client/                    # React frontend
│   └── src/
│       ├── components/        # Reusable components
│       │   ├── Navbar/
│       │   └── Shared/
│       ├── pages/             # Page components
│       │   ├── AssignmentList/
│       │   ├── AssignmentAttempt/
│       │   └── Auth/
│       ├── services/          # API service layer
│       └── styles/            # SCSS design system
│           ├── _variables.scss
│           ├── _mixins.scss
│           ├── _reset.scss
│           ├── _typography.scss
│           ├── _base.scss
│           └── main.scss
├── server/                    # Express backend
│   └── src/
│       ├── config/            # DB connections
│       ├── models/            # MongoDB schemas
│       ├── routes/            # API routes
│       ├── middleware/        # Auth middleware
│       ├── seed.js            # Database seeder
│       └── index.js           # Server entry
└── README.md
```
