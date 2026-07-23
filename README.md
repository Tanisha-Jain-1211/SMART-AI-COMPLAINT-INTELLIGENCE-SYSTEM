<!-- Introduces the project, stack, and local setup instructions for all services. -->
# Smart AI Complaint Intelligence System

Smart Complaint Intelligence System is a full-stack platform where citizens submit civic complaints and AI assists with category prediction, urgency scoring, and duplicate detection for faster resolution.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL
- **ML Service**: Python, FastAPI, Transformers ecosystem

## Setup Instructions

### 1) Backend API (`backend`)
```bash
cd backend
npm run dev
```

### 2) Frontend (`frontend`)
```bash
cd frontend
npm run dev
```

### 3) ML Service (`ml-service`)
```bash
cd ml-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Documentation
- Architecture: [`docs/architecture.md`](docs/architecture.md)
