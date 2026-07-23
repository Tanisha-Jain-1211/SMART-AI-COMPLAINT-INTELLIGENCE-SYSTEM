# Smart Complaint Intelligence System - Deployment Guide

This guide describes how to deploy the 3-service Smart Complaint Intelligence System. The system consists of:
1. **Frontend**: React (Vite) client.
2. **Backend**: Express API Gateway.
3. **ML Service**: FastAPI ML inference engine.
4. **Database**: PostgreSQL.

---

## 1. Local Containerized Deployment (Docker Compose)

The easiest way to run the entire system locally with all services configured is using **Docker Compose**.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- [Docker Compose](https://docs.docker.com/compose/) v2+ installed.

### Step-by-Step Instructions

1. **Verify or create configuration files**:
   Ensure the following Docker files have been created in the workspace:
   - Root: [`docker-compose.yml`](docker-compose.yml)
   - Backend: [`backend/Dockerfile`](backend/Dockerfile) & [`backend/docker-entrypoint.sh`](backend/docker-entrypoint.sh)
   - ML Service: [`ml-service/Dockerfile`](ml-service/Dockerfile)
   - Frontend: [`frontend/Dockerfile`](frontend/Dockerfile) & [`frontend/nginx.conf`](frontend/nginx.conf)

2. **Spin Up the Containers**:
   From the root folder of the project (`smart-complaint-system`), run:
   ```bash
   docker compose up --build -d
   ```
   This will:
   - Start the PostgreSQL database container.
   - Build and start the `ml-service` container (which caches model weights in a persistent Docker volume).
   - Build, run database migrations, and start the `backend` server.
   - Compile the Vite frontend static files and serve them via Nginx on port `5173`.

3. **Seed the Database**:
   Once the containers are up and running, you can seed the database with initial departments, test users, and complaints:
   ```bash
   docker compose exec backend npm run seed
   ```
   *Note: This command runs the prisma seed script inside the active backend container.*

4. **Verify Deployment Ports**:
   - **Frontend**: [http://localhost:5173](http://localhost:5173) (Interactive client app)
   - **Backend API**: [http://localhost:5000/health](http://localhost:5000/health) (Express JSON API status)
   - **ML Service**: [http://localhost:8000/health](http://localhost:8000/health) (FastAPI JSON API status)
   - **Postgres DB**: `localhost:5432`

5. **Viewing Container Logs**:
   ```bash
   # See logs for all services
   docker compose logs -f

   # See logs for a specific service (e.g. backend or ml-service)
   docker compose logs -f backend
   docker compose logs -f ml-service
   ```

6. **Teardown & Cleanup**:
   To stop the containers without losing database data:
   ```bash
   docker compose down
   ```
   To stop the containers and delete all database data/volumes:
   ```bash
   docker compose down -v
   ```

---

## 2. Production Cloud Deployment Guide

To deploy the services to production hosting platforms, follow this service-by-service checklist.

### Step 2.1: PostgreSQL Database (Neon / Supabase)
Instead of running a local container, provision a managed cloud database:
1. Create a free PostgreSQL database on [Neon](https://neon.tech/) or [Supabase](https://supabase.com/).
2. Copy the Connection URI. Make sure to append `?sslmode=require` to enforce secure connections.
3. Save this connection string as `DATABASE_URL` (needed in **Step 2.3**).

---

### Step 2.2: ML Service (FastAPI) on Render / Railway
The ML Service must be deployed first so the Backend API can connect to it.

1. **Deployment Platform**: Render or Railway are recommended.
2. **Environment settings**:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. **Resources**: The ML Service downloads and runs the `all-MiniLM-L6-v2` transformer (~90MB weights).
   - Ensure the server has **at least 512MB RAM** (1GB recommended).
   - Configure a persistent disk/volume mounted at `/app/model_cache` if you want to avoid re-downloading model weights on every cold start.
4. **Environment Variables**:
   - `MODEL_CACHE_DIR`: `/app/model_cache`
   - `ALLOWED_ORIGINS`: Your production backend and frontend URLs (separated by commas). E.g. `https://your-backend.onrender.com,https://your-frontend.vercel.app`.
   - `DUPLICATE_THRESHOLD`: `0.85`
   - `MIN_CONFIDENCE`: `0.6`

---

### Step 2.3: Backend API (Node/Express) on Render / Railway

1. **Deployment Platform**: Render, Railway, or Fly.io.
2. **Prisma Schema Generation & Migrations**:
   The database tables must be created and the Prisma Client generated before the server boots.
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command / Pre-deploy Command**:
     On platforms like Render, configure a **Pre-Deploy command**:
     ```bash
     npx prisma migrate deploy
     ```
     Or combine it with the startup command:
     ```bash
     npx prisma migrate deploy && npm run start
     ```
3. **Environment Variables**:
   - `PORT`: Set automatically by the provider or `5000`.
   - `DATABASE_URL`: The Neon / Supabase URL from **Step 2.1**.
   - `JWT_SECRET`: A secure, randomly generated string.
   - `CLIENT_URL`: The URL of your deployed Frontend (e.g., `https://your-app.vercel.app`).
   - `ML_SERVICE_URL`: The URL of your deployed ML Service from **Step 2.2** (e.g., `https://your-ml-service.onrender.com`).
   - `EMAIL_USER` & `EMAIL_PASS`: SMTP credentials for email alerts.
   - `CLOUDINARY_URL`: Cloudinary connection credentials (if user uploads are saved to Cloudinary).

---

### Step 2.4: Frontend (React) on Vercel / Netlify

1. **Deployment Platform**: Vercel or Netlify.
2. **Root Directory**: `frontend`
3. **Build Settings**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables (IMPORTANT)**:
   Vite builds the static assets and hardcodes environmental URLs during the build step. **You must set these in the dashboard BEFORE triggering the build**:
   - `VITE_API_URL`: The URL of your deployed backend API + `/api` (E.g. `https://your-backend.onrender.com/api`).
   - `VITE_ML_URL`: The URL of your deployed ML Service (E.g. `https://your-ml-service.onrender.com`).

---

## 3. Environment Variables Reference

| Variable Name | Service | Purpose | Recommended Value |
|---|---|---|---|
| `DATABASE_URL` | Backend | DB connection URL | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Backend | JWT auth token signing | Strong random string |
| `CLIENT_URL` | Backend | CORS allowance for frontend | `http://localhost:5173` (Dev) / Production URL |
| `ML_SERVICE_URL` | Backend | API URL of ML service | `http://ml-service:8000` (Docker) / Cloud URL |
| `VITE_API_URL` | Frontend | Backend API endpoints base | `http://localhost:5000/api` (Dev) / Cloud URL |
| `VITE_ML_URL` | Frontend | ML Service endpoints base | `http://localhost:8000` (Dev) / Cloud URL |
| `MODEL_CACHE_DIR` | ML Service | Transformer cache directory | `./model_cache` |
| `ALLOWED_ORIGINS` | ML Service | CORS allowance | Comma-separated client URLs |
