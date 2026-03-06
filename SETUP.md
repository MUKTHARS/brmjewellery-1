# BRM Jewellery — Local Setup Guide

This guide walks you through running the full project locally: backend API, frontend, PostgreSQL database, and Redis cache.

---

## Prerequisites

Install the following before starting:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 20 LTS or higher | https://nodejs.org |
| npm | comes with Node.js | — |
| Git | any recent version | https://git-scm.com |
| PostgreSQL | 15 or 16 | https://www.postgresql.org/download |
| Redis | 7 | see section below |

---

## Option A — Run Everything with Docker (Recommended)

If you have **Docker Desktop** installed this is the fastest path. It starts PostgreSQL, Redis, the backend, and the frontend all at once.

### 1. Install Docker Desktop

Download from: https://www.docker.com/products/docker-desktop

### 2. Clone the repository

```bash
git clone <repository-url>
cd brmjnew
```

### 3. Create the root `.env` file

Copy the example and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set at minimum:

```env
POSTGRES_DB=brm_jewellery
POSTGRES_USER=brm_user
POSTGRES_PASSWORD=yourStrongPassword

REDIS_PASSWORD=yourRedisPassword

JWT_ACCESS_SECRET=a_64_character_random_string_here
JWT_REFRESH_SECRET=another_64_character_random_string_here

FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost/api/v1
NEXT_PUBLIC_APP_URL=http://localhost

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM_EMAIL=your@gmail.com
SMTP_FROM_NAME=BRM Jewellery

METALS_API_KEY=your_metals_api_key
```

### 4. Start all services

```bash
docker compose up -d
```

This will:
- Start PostgreSQL on port 5432
- Start Redis on port 6379
- Build and start the backend API on port 4000
- Build and start the frontend on port 3000
- Start NGINX reverse proxy on port 80

### 5. Run database migrations and seed

Wait ~30 seconds for services to become healthy, then:

```bash
docker exec -it brm_backend npx prisma migrate deploy
docker exec -it brm_backend npx tsx prisma/seed.ts
```

### 6. Open the app

| URL | Description |
|-----|-------------|
| http://localhost | Main site (via NGINX) |
| http://localhost:3000 | Frontend direct |
| http://localhost:4000/api/v1/health | Backend health check |

---

## Option B — Run Manually (Without Docker)

Use this if you prefer to run each service directly on your machine.

---

### Step 1 — Install and Start Redis

#### Windows

Redis does not have an official Windows build. Use one of these options:

**Option 1 — WSL (Windows Subsystem for Linux) — recommended:**
```bash
# In PowerShell (run as Administrator)
wsl --install

# Then in the WSL terminal:
sudo apt update
sudo apt install redis-server -y
sudo service redis-server start

# Verify it is running:
redis-cli ping
# Should print: PONG
```

**Option 2 — Redis for Windows (Memurai, community port):**

Download from: https://github.com/microsoftarchive/redis/releases
Run `redis-server.exe` from the extracted folder.

#### macOS

```bash
# Install Homebrew if you don't have it:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install and start Redis:
brew install redis
brew services start redis

# Verify:
redis-cli ping
# Should print: PONG
```

#### Linux (Ubuntu / Debian)

```bash
sudo apt update
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Verify:
redis-cli ping
# Should print: PONG
```

---

### Step 2 — Install and Start PostgreSQL

#### Windows

Download the installer from: https://www.postgresql.org/download/windows/
Run the installer, set a password for the `postgres` user, keep the default port 5432.

#### macOS

```bash
brew install postgresql@16
brew services start postgresql@16
```

#### Linux

```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Create the database

```bash
# Connect to postgres
psql -U postgres

# Inside psql, run:
CREATE DATABASE brm_jewellery;
CREATE USER brm_user WITH PASSWORD 'yourPassword';
GRANT ALL PRIVILEGES ON DATABASE brm_jewellery TO brm_user;
\q
```

---

### Step 3 — Clone the repository

```bash
git clone <repository-url>
cd brmjnew
```

---

### Step 4 — Set up the Backend

#### 4a. Install dependencies

```bash
cd backend
npm install
```

#### 4b. Create the `.env` file

```bash
cp .env.example .env
```

Open `backend/.env` and update these required values:

```env
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database — must match what you created in Step 2
DATABASE_URL="postgresql://brm_user:yourPassword@localhost:5432/brm_jewellery?schema=public"

# Redis — leave REDIS_PASSWORD blank if you didn't set one
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT — change both to long random strings (64+ characters)
JWT_ACCESS_SECRET=replace_this_with_a_long_random_string_64_chars_minimum
JWT_REFRESH_SECRET=replace_this_with_a_different_long_random_string_64_chars

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (use a Gmail app password or any SMTP provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM="BRM Jewellery <noreply@brmjewellery.co.uk>"

# Stripe (get keys from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Metals API (get a free key at https://metals-api.com)
METALS_API_KEY=your_metals_api_key

# Frontend
FRONTEND_URL=http://localhost:3000

# Admin account created during seed
ADMIN_EMAIL=admin@brmjewellery.co.uk
ADMIN_PASSWORD=Admin@BRM2024!

# File uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

#### 4c. Create the database schema

This creates all tables from the Prisma schema:

```bash
cd backend
npx prisma migrate deploy
```

If this is a fresh project and you see no migrations, run:

```bash
npx prisma migrate dev --name init
```

#### 4d. Generate the Prisma client

```bash
npx prisma generate
```

#### 4e. Seed the database

This creates the admin account, default categories, and sample data:

```bash
npm run prisma:seed
```

After seeding you can log in to the admin panel with:
- **Email:** `admin@brmjewellery.co.uk`
- **Password:** `Admin@BRM2024!`

#### 4f. Start the backend

```bash
npm run dev
```

The API will be available at: `http://localhost:5000/api/v1`

Health check: `http://localhost:5000/api/v1/health`

---

### Step 5 — Set up the Frontend

Open a **new terminal** and leave the backend running.

#### 5a. Install dependencies

```bash
cd frontend
npm install
```

#### 5b. Create the `.env.local` file

```bash
# In the frontend/ directory:
touch .env.local     # Mac/Linux
# On Windows: create the file manually or use:
# echo. > .env.local
```

Add the following content to `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> `NEXT_PUBLIC_API_URL` must point to your backend. If you changed the backend port, update it here.

#### 5c. Start the frontend

```bash
npm run dev
```

The site will be available at: `http://localhost:3000`

---

## Accessing the Application

| URL | Description |
|-----|-------------|
| http://localhost:3000 | User-facing website |
| http://localhost:3000/admin | Admin panel |
| http://localhost:3000/admin/login | Admin login page |
| http://localhost:5000/api/v1/health | Backend health check |
| http://localhost:5000/api/v1 | API root |

### Default Admin Credentials

```
Email:    admin@brmjewellery.co.uk
Password: Admin@BRM2024!
```

Change this password immediately after first login via the admin panel.

---

## Project Structure

```
brmjnew/
├── backend/                  # Express.js API
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema (all tables)
│   │   ├── migrations/       # SQL migration history
│   │   └── seed.ts           # Seed script (admin + sample data)
│   ├── src/
│   │   ├── routes/           # API route definitions
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/        # Auth, rate limiting, etc.
│   │   └── server.ts         # Entry point
│   ├── uploads/              # Uploaded product images (auto-created)
│   └── .env                  # Backend environment variables
│
├── frontend/                 # Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── (user)/       # User-facing pages
│   │   │   └── admin/        # Admin panel pages
│   │   ├── components/       # Reusable components
│   │   ├── api/              # API client functions
│   │   └── contexts/         # React context providers
│   ├── public/assets/        # Static UI images
│   └── .env.local            # Frontend environment variables
│
├── docker-compose.yml        # Full stack Docker setup
├── .env.example              # Root env template (for Docker)
└── SETUP.md                  # This file
```

---

## Useful Commands

### Backend

```bash
# Start in development (auto-reload)
npm run dev

# Open Prisma Studio (visual database browser)
npx prisma studio
# Opens at http://localhost:5555

# Re-run seed (resets sample data)
npm run prisma:seed

# Create a new database migration after schema changes
npx prisma migrate dev --name describe_your_change

# Apply existing migrations (production / fresh clone)
npx prisma migrate deploy
```

### Frontend

```bash
# Start in development
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type-check without building
npm run type-check
```

### Redis

```bash
# Check Redis is running
redis-cli ping

# Connect to Redis CLI
redis-cli

# Flush all cached data (useful during development)
redis-cli FLUSHALL
```

### PostgreSQL

```bash
# Connect to the database
psql -U brm_user -d brm_jewellery

# List all tables
\dt

# Exit psql
\q
```

---

## Troubleshooting

**`ECONNREFUSED` on backend startup**
PostgreSQL or Redis is not running. Start them first (see Step 1 and Step 2).

**`PrismaClientInitializationError`**
Your `DATABASE_URL` in `backend/.env` is wrong. Double-check the username, password, host, and database name.

**Product images not showing**
Make sure `NEXT_PUBLIC_API_URL` in `frontend/.env.local` is set to your backend URL (e.g. `http://localhost:5000`). Images are stored on the backend under `/uploads/`.

**Admin login shows blank page or redirects to `/admin/login` in a loop**
Clear `localStorage` in your browser DevTools and refresh. This resets any stale auth tokens.

**Port already in use**
Backend default is `5000`, frontend is `3000`. Change `PORT=` in `backend/.env` or pass a different port to `npm run dev -- -p XXXX` in the frontend.

**Gmail SMTP not working**
Use a Gmail **App Password** (not your regular password). Go to your Google Account → Security → 2-Step Verification → App passwords.

**Redis AUTH error**
If you started Redis without a password but set `REDIS_PASSWORD=something` in `.env`, either clear `REDIS_PASSWORD` in `.env` or restart Redis with `--requirepass yourPassword`.

---

## Environment Variables Reference

### `backend/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_HOST` | Yes | Redis hostname (usually `localhost`) |
| `REDIS_PORT` | Yes | Redis port (usually `6379`) |
| `REDIS_PASSWORD` | No | Redis password if set |
| `JWT_ACCESS_SECRET` | Yes | Secret for access tokens (64+ chars) |
| `JWT_REFRESH_SECRET` | Yes | Secret for refresh tokens (64+ chars) |
| `SMTP_HOST` | Yes | Email SMTP host |
| `SMTP_USER` | Yes | SMTP username / email |
| `SMTP_PASS` | Yes | SMTP password or app password |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (from Stripe dashboard) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `METALS_API_KEY` | No | Live metal price feed key |
| `ADMIN_EMAIL` | Yes | Email for the seeded admin account |
| `ADMIN_PASSWORD` | Yes | Password for the seeded admin account |

### `frontend/.env.local`

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend base URL (e.g. `http://localhost:5000`) |
| `NEXT_PUBLIC_APP_URL` | No | Frontend base URL |
