# CipherSQLStudio

A browser-based SQL learning platform where students can practice SQL queries against pre-configured assignments with real-time execution and AI-powered hints.

> **Note:** This is NOT a database creation tool. Assignments and sample data are pre-inserted by administrators. The platform focuses entirely on the student experience of attempting and solving SQL assignments.

---

## Technology Choices & Rationale

| Layer | Technology | Why? |
|-------|-----------|------|
| **Frontend** | React.js + Vite + TypeScript | React for component-based UI, Vite for fast HMR and builds, TypeScript for type safety |
| **Styling** | Vanilla SCSS (mobile-first) | SCSS provides variables, mixins, nesting, and partials for scalable, maintainable CSS without framework overhead |
| **Code Editor** | Monaco Editor | The same editor powering VS Code — provides SQL syntax highlighting, auto-completion, and familiar developer UX |
| **Backend** | Node.js + Express.js | Lightweight, fast REST API server with a rich middleware ecosystem |
| **Sandbox DB** | PostgreSQL (Neon.tech) | Industry-standard relational database; Neon provides serverless PostgreSQL with a generous free tier |
| **Persistence DB** | MongoDB Atlas | Flexible document storage for assignments metadata, users, and query attempts; Atlas provides free cloud hosting |
| **LLM** | Google Gemini API | Fast, capable AI model for generating contextual SQL hints without revealing full solutions |
| **Auth** | JWT (jsonwebtoken + bcryptjs) | Stateless token-based authentication — no session storage needed on server |

---

## Features

### Core Features (90%)
1. **Assignment Listing Page** — Browse all SQL assignments with difficulty badges (Easy / Medium / Hard), titles, descriptions, and creation dates displayed in a responsive card grid
2. **Assignment Attempt Interface**
   - **Question Panel** — Displays the assignment question and expected output hints
   - **Sample Data Viewer** — Shows pre-loaded table schemas (column names + types) and sample data rows
   - **SQL Editor** — Monaco Editor configured for SQL with syntax highlighting, word wrap, and `Ctrl+Enter` keyboard shortcut to run queries
   - **Results Panel** — Displays query results in a formatted, scrollable table with column headers and row count + execution time
   - **LLM Hint Integration** — "Get Hint" button opens a slide-out panel; Gemini provides step-by-step guidance (never full solutions) based on the question, user's current query, and any error messages
3. **Query Execution Engine**
   - Executes user SQL against PostgreSQL in real-time
   - **Security**: Only `SELECT` and `WITH` (CTEs) queries are allowed; `DROP`, `DELETE`, `ALTER`, `INSERT`, `UPDATE`, `CREATE`, `TRUNCATE`, etc. are all blocked
   - 5-second query timeout to prevent resource abuse
   - Returns formatted results or clear error messages

### Optional Features (10%)
4. **User Authentication** — JWT-based signup and login with bcrypt password hashing, persistent sessions via localStorage
5. **Responsive Design** — Mobile-first layouts with breakpoints at 320px, 641px, 1024px, and 1281px using SCSS mixins

---

## Environment Variables

Create a `server/.env` file (see `server/.env.example` for reference):

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `PORT` | Server port (default: `5000`) | Set any available port |
| `NEON_DATABASE_URL` | PostgreSQL connection string | [Neon.tech Console](https://console.neon.tech/) → Project → Connection Details |
| `MONGODB_URI` | MongoDB Atlas connection string | [MongoDB Atlas](https://cloud.mongodb.com/) → Database → Connect → Drivers |
| `GEMINI_API_KEY` | Google Gemini API key | [Google AI Studio](https://ai.google.dev/) → Get API Key |
| `JWT_SECRET` | Secret key for signing JWT tokens | Any random string (e.g., `openssl rand -hex 32`) |

**Example `.env`:**
```env
PORT=5000
NEON_DATABASE_URL=postgresql://user:password@ep-xyz.us-east-1.aws.neon.tech/neondb?sslmode=require
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?appName=Cluster0
GEMINI_API_KEY=AIzaSy...
JWT_SECRET=my_super_secret_key_here
```

> **⚠️ Important:** If your MongoDB password contains special characters like `@`, URL-encode them (e.g., `@` → `%40`).

---

## Installation & Setup Instructions

### Prerequisites
- **Node.js** 18+ ([download](https://nodejs.org/))
- **PostgreSQL** database — [Neon.tech](https://neon.tech) free tier recommended
- **MongoDB** database — [MongoDB Atlas](https://www.mongodb.com/atlas) free tier recommended
- **Gemini API Key** — [Google AI Studio](https://ai.google.dev/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/aryanrai97861/CipherSchool.git
cd CipherSchool
```

### Step 2: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### Step 3: Configure Environment Variables

```bash
cd server
cp .env.example .env
```

Open `server/.env` in your editor and fill in your actual credentials (see the [Environment Variables](#environment-variables) section above).

### Step 4: Set Up MongoDB Atlas Network Access

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) → **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (or add your specific IP)
4. Click **Confirm** and wait ~30 seconds for it to take effect

### Step 5: Seed the Database

```bash
cd server
npm run seed
```

This script:
- Creates 5 PostgreSQL tables: `departments`, `employees`, `products`, `orders`, `order_items`
- Populates them with realistic sample data (12 employees, 10 products, 8 orders, etc.)
- Creates 6 SQL assignments in MongoDB (2 Easy, 2 Medium, 2 Hard)

### Step 6: Run the Application

Open **two terminals**:

```bash
# Terminal 1 — Start Backend (port 5000)
cd server
npm run dev

# Terminal 2 — Start Frontend (port 5173)
cd client
npm run dev
```

### Step 7: Open in Browser

Navigate to [http://localhost:5173](http://localhost:5173)

---

## Available Scripts

### Server (`/server`)
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with auto-reload (watch mode) |
| `npm start` | Start production server |
| `npm run seed` | Seed PostgreSQL tables and MongoDB assignments |

### Client (`/client`)
| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build production bundle with TypeScript checks |
| `npm run preview` | Preview production build locally |

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | Health check | No |
| GET | `/api/assignments` | List all assignments (title, difficulty, description) | No |
| GET | `/api/assignments/:id` | Get full assignment details including schemas | No |
| POST | `/api/query/execute` | Execute a SQL query against PostgreSQL sandbox | No |
| POST | `/api/hints` | Get an AI hint from Gemini (not the full answer) | No |
| POST | `/api/auth/register` | Register a new user account | No |
| POST | `/api/auth/login` | Login with email and password | No |

---

## Project Structure

```
CipherSchool/
├── client/                          # React frontend (Vite + TypeScript)
│   ├── index.html                   # HTML entry point with SEO meta
│   ├── vite.config.ts               # Vite configuration
│   └── src/
│       ├── main.tsx                 # React DOM entry
│       ├── App.tsx                  # Root component with routing
│       ├── services/
│       │   └── api.ts              # Axios API service layer
│       ├── components/
│       │   ├── Navbar/             # App header with branding & auth buttons
│       │   └── Shared/             # Loader spinner, DifficultyBadge
│       ├── pages/
│       │   ├── AssignmentList/     # Assignment listing with card grid
│       │   ├── AssignmentAttempt/  # SQL editor + results + hints + schema
│       │   └── Auth/              # Login & Register forms
│       └── styles/                 # SCSS design system
│           ├── _variables.scss     # Colors, typography, spacing tokens
│           ├── _mixins.scss        # Responsive breakpoints, flex helpers
│           ├── _reset.scss         # CSS reset / normalize
│           ├── _typography.scss    # Google Fonts, heading scales
│           ├── _base.scss          # Global body & container styles
│           └── main.scss           # Imports all partials
│
├── server/                          # Express.js backend
│   ├── .env.example                # Environment variables template
│   ├── package.json                # Scripts: dev, start, seed
│   └── src/
│       ├── index.js                # Express app entry, middleware, routes
│       ├── seed.js                 # Database seeding script
│       ├── config/
│       │   └── db.js               # PostgreSQL pool + MongoDB connection
│       ├── models/
│       │   ├── Assignment.js       # Assignment schema (title, question, tables)
│       │   ├── User.js             # User schema with bcrypt hashing
│       │   └── QueryAttempt.js     # Query attempt tracking schema
│       ├── routes/
│       │   ├── assignments.js      # GET /api/assignments
│       │   ├── query.js            # POST /api/query/execute (SQL sandbox)
│       │   ├── hints.js            # POST /api/hints (Gemini integration)
│       │   └── auth.js             # POST /api/auth/register & login
│       └── middleware/
│           └── auth.js             # JWT verification middleware
│
├── .gitignore
└── README.md
```

---

## SCSS Architecture

The styling follows a **mobile-first** approach using vanilla SCSS with BEM naming convention:

- **`_variables.scss`** — Design tokens: dark theme color palette, font sizes, spacing scale, shadows, transitions
- **`_mixins.scss`** — Reusable mixins: `@include tablet`, `@include desktop`, `@include wide` breakpoints, flex helpers, glass effect, custom scrollbar
- **`_reset.scss`** — CSS reset for consistent cross-browser rendering
- **`_typography.scss`** — Google Fonts (Inter + Fira Code), heading hierarchy
- **`_base.scss`** — Global body, root, container, and selection styles

**Responsive breakpoints:**
| Breakpoint | Width | Target |
|-----------|-------|--------|
| Default | 320px+ | Mobile phones |
| `@include tablet` | 641px+ | Tablets |
| `@include desktop` | 1024px+ | Laptops / small desktops |
| `@include wide` | 1281px+ | Large monitors |

---

## Security Measures

- **SQL Injection Prevention** — Only `SELECT` and `WITH` queries permitted; all destructive keywords (`DROP`, `DELETE`, `ALTER`, `TRUNCATE`, `INSERT`, `UPDATE`, `CREATE`, etc.) are blocked via regex validation
- **Query Timeout** — 5-second statement timeout on all user queries
- **Password Hashing** — bcrypt with 12 salt rounds
- **JWT Authentication** — Stateless tokens with 7-day expiry
- **Input Validation** — express-validator on all POST routes
- **CORS** — Configured for cross-origin requests between frontend and backend
