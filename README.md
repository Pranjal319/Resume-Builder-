# CareerAI — AI-Powered Career & Resume Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791.svg?style=flat&logo=postgresql&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**CareerAI** is a comprehensive, production-quality career acceleration and resume intelligence platform engineered for students, new graduates, and software engineers. The platform combines vector semantic embeddings, deterministic ATS compliance parsing, skill gap analysis, and interactive 30/60/90-day learning roadmaps into an executive SaaS command center.

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Key Features](#key-features)
3. [System Architecture](#system-architecture)
4. [Tech Stack](#tech-stack)
5. [Database Setup](#database-setup)
6. [Environment Variables](#environment-variables)
7. [How to Run Locally](#how-to-run-locally)
8. [API Documentation](#api-documentation)
9. [Deployment Instructions](#deployment-instructions)
10. [Security & Production Hardening](#security--production-hardening)

---

## Platform Overview

Traditional job applications fail silently inside Applicant Tracking Systems (ATS) due to parsing errors, unquantified bullets, and missing keywords. **CareerAI** bridges the gap between candidate qualifications and employer expectations through:
- High-fidelity vector PDF generation (100% vector searchable, zero font rasterization).
- Deep ATS text extraction and multi-metric heuristic/AI scoring.
- Dense vector semantic matching against target job descriptions.
- Pedagogical dependency-ordered skill gap roadmaps with interactive progress tracking.
- An executive Candidate Readiness Index command center.

---

## Key Features

### 1. Unified Career Command Center (Dashboard)
- **Executive Readiness Index:** Composite 0–100% score weighting resume strength, ATS score, job match compatibility, and curriculum completion.
- **Radial Progress Gauges:** Lightweight, vector SVG gauges for key metrics.
- **Section Workspaces:** Dedicated views for Profile, Resumes, ATS Audits, Job Matches, Learning Curriculum, and Mock Interview drills.

### 2. Multi-Section AI Resume Builder
- **9 Structured Sections:** Personal Info, Professional Summary, Skills, Work Experience, Projects, Education, Certifications, Achievements, and Social Links.
- **Dual Professional Templates:**
  - *ATS-Friendly Template:* Clean, single-column, standard typography optimized for parsing bots.
  - *Modern Professional Template:* Dual-column, colored section dividers, and visual tags.
- **Debounced Autosave:** Local + remote persistence with live preview zoom controls.

### 3. Vector ATS-Compliant PDF Generation Engine
- **ReportLab Platypus Pipeline:** Generates multi-page vector PDFs dynamically from candidate data.
- **Flowable Spacing & Orphan Suppression:** Automatic page budgeting prevents headings from being stranded at page bottoms (`keepWithNext=True`).
- **Direct Browser Export:** Generates clean binary streams with proper `Content-Disposition` headers.

### 4. AI Resume Analyzer & ATS Scoring Engine
- **Multi-Format Extraction:** Streams and parses `.pdf` (via `pypdf`) and `.docx` (via `python-docx`) up to 10 MB.
- **100-Point Audit:** Evaluates quantifiable metrics, action verbs, contact completeness, formatting risks, and keyword density.
- **Schema-Validated Output:** Strict Pydantic responses prevent LLM hallucinations; automatic deterministic heuristic fallback ensures 100% uptime.

### 5. AI Job Description Semantic Matcher
- **Vector Semantic Similarity:** Gemini `text-embedding-004` (with TF-IDF cosine vectorizer fallback) calculates contextual similarity between resumes and job requirements.
- **Skills Matrix:** Explicit visual tagging of Matching ($\checkmark$) vs Missing ($\times$) technical skills.
- **Multi-Job Ranking:** Evaluates multiple target positions concurrently to recommend optimal role alignment.
- **Explainability Engine:** Generates natural language explanations detailing *why* the score was generated.

### 6. Skill Gap Analyzer & Learning Roadmap
- **Pedagogical Ordering:** Sequences missing technical skills in dependency order (e.g. `JavaScript` $\rightarrow$ `Node.js` $\rightarrow$ `Express` $\rightarrow$ `REST APIs` $\rightarrow$ `Docker` $\rightarrow$ `Capstone`).
- **Configurable Timelines:** 30 Days (Sprint), 60 Days (Standard), and 90 Days (Deep-Dive).
- **Interactive Progress Checklists:** Candidates check off finished phases; live progress percentage updates across the platform.

---

## System Architecture

```
                                 [ Web Browser / Client ]
                                             │
                        ┌────────────────────┴───────────────────┐
                        │                                        │
                        ▼                                        ▼
             [ Vite React 19 Frontend ]               [ Supabase Auth & DB ]
             ├── Tailwind CSS v4 Engine               ├── JWT Access Tokens
             ├── Protected Route Guards               ├── PostgreSQL 15+
             └── Executive SaaS Dashboard             └── Row Level Security (RLS)
                        │                                        │
                        └────────────────────┬───────────────────┘
                                             │ Bearer JWT / JSON
                                             ▼
                               [ FastAPI Backend Server ]
             ┌───────────────────────────────────────────────────────────┐
             │ ├── Security: PyJWT verification & token introspection    │
             │ ├── PDF Engine: ReportLab Platypus vector rendering      │
             │ ├── Parser: pypdf & python-docx stream text extractor     │
             │ ├── Matcher: Dense vector embeddings + TF-IDF cosine sim  │
             │ ├── Roadmap: Dependency graph & milestone partitioning    │
             │ └── Analytics: Unified dashboard summary aggregator       │
             └───────────────────────────────────────────────────────────┘
                                             │
                                             ▼
                           [ AI & Machine Learning Providers ]
                                 Google Gemini / OpenAI
```

---

## Tech Stack

### Frontend
- **Framework:** React 19 + Vite 6
- **Styling:** Tailwind CSS v4 (Glassmorphism & dark SaaS design system)
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Authentication Client:** `@supabase/supabase-js`

### Backend
- **Framework:** Python 3.11+ / FastAPI
- **Web Server:** Uvicorn (ASGI)
- **Validation:** Pydantic v2 + Pydantic-Settings
- **PDF Generation:** ReportLab Platypus
- **Document Parsers:** PyPDF, python-docx, python-multipart
- **Security:** PyJWT[crypto] (HS256 validation)

### Database & Cloud
- **Database:** PostgreSQL (Supabase)
- **Security:** Row Level Security (RLS) with `auth.uid()` tenant isolation
- **Vector Embeddings:** Google Gemini `text-embedding-004` (fallback: pure Python subword TF-IDF)

---

## Database Setup

1. Create a project on [Supabase](https://supabase.com).
2. Navigate to **SQL Editor** $\rightarrow$ **New Query**.
3. Copy and paste the entire contents of [`database/schema.sql`](file:///c:/Users/Pranjal%20Rai/OneDrive/Documents/Programming/.vscode/Resume%20Builder/database/schema.sql).
4. Run the script (`Ctrl + Enter`).
5. Verify that all 6 tables are created:
   - `public.profiles`
   - `public.resumes`
   - `public.resume_analyses`
   - `public.job_descriptions`
   - `public.job_matches`
   - `public.learning_roadmaps`

---

## Environment Variables

### Backend Configuration (`backend/.env`)

```ini
PROJECT_NAME="CareerAI API"
VERSION="1.0.0"
API_V1_STR="/api"

# CORS configuration (add production domain when deploying)
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]

# Supabase configuration (from Supabase Dashboard -> Settings -> API)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_JWT_SECRET="your-supabase-jwt-secret"

# AI Provider Keys
GEMINI_API_KEY="your-gemini-api-key"
OPENAI_API_KEY=""
```

### Frontend Configuration (`frontend/.env`)

```ini
# Supabase credentials for client authentication
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

*(Note: If you run CareerAI locally without Supabase keys, the platform includes a **1-Click Demo Mode** that allows immediate evaluation).*

---

## How to Run Locally

### Prerequisites
- Node.js 18+ & npm
- Python 3.11+ (Python 3.14 compatible)

### 1. Clone & Setup Backend
```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# macOS / Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API will be running at: `http://127.0.0.1:8000`  
Swagger Documentation: `http://127.0.0.1:8000/api/docs`

### 2. Setup Frontend
```powershell
# In a new terminal, navigate to frontend
cd frontend

# Install npm packages
npm install

# Start Vite dev server
npm run dev
```
Frontend web application will be running at: `http://localhost:5173`

---

## API Documentation

FastAPI automatically generates interactive OpenAPI documentation at `/api/docs`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend liveness and health check |
| `GET` | `/api/dashboard/summary` | Aggregated career readiness KPI summary |
| `POST` | `/api/resumes` | Create a new structured resume |
| `GET` | `/api/resumes` | List user resumes |
| `GET` | `/api/resumes/{id}` | Fetch a single resume |
| `PUT` | `/api/resumes/{id}` | Update resume content |
| `DELETE` | `/api/resumes/{id}` | Delete a resume |
| `GET` | `/api/resumes/{id}/pdf` | Generate and download vector PDF |
| `POST` | `/api/analysis/upload` | Upload PDF/DOCX for ATS audit |
| `GET` | `/api/analysis` | List candidate's past ATS reports |
| `POST` | `/api/matcher/match` | Evaluate resume against a job description |
| `POST` | `/api/matcher/jobs` | Save target job description |
| `GET` | `/api/matcher/matches` | List past job compatibility reports |
| `POST` | `/api/roadmap/generate` | Generate 30/60/90-day learning roadmap |
| `GET` | `/api/roadmap/active` | Fetch active roadmap and progress |
| `PATCH` | `/api/roadmap/{id}/milestones/{mid}` | Toggle milestone completion |

---

## Deployment Instructions

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Link your GitHub repository.
2. Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Backend (Render / Railway / Fly.io / AWS ECS)
1. Root Directory: `backend`
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:
   - `BACKEND_CORS_ORIGINS=["https://your-frontend-domain.vercel.app"]`
   - `SUPABASE_URL`
   - `SUPABASE_JWT_SECRET`
   - `GEMINI_API_KEY`

---

## Security & Production Hardening

- **Zero Hardcoded Secrets:** Strictly driven by `.env` configurations; `.gitignore` covers all secret and cache variants.
- **Row Level Security (RLS):** Every PostgreSQL table enforces tenant isolation via `auth.uid() = user_id`.
- **Filename Sanitization:** Uploaded files are stripped of directory traversal tokens (`os.path.basename` + regex filtering).
- **Graceful Error Masking:** Global exception handler returns sanitized JSON responses while logging server-side tracebacks.
- **Rollup Code Splitting:** Vendor chunks (`vendor-react`, `vendor-icons`, `vendor-supabase`) are partitioned under 250 kB for optimal CDN caching.
- **Dual Engine Reliability:** ATS analysis and semantic matching include deterministic offline fallback algorithms when cloud LLM APIs are unreachable.

---

*CareerAI — Engineered with precision for software engineering graduates and tech job seekers.*
