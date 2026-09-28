# SETU AI — Local Native Setup Guide (No Docker Required)

This guide documents the native setup process to run **SETU AI** completely on your local machine without containers or cloud lock-in.

---

## Prerequisites
- **Python**: Version 3.11+
- **Node.js**: Version 18+ (tested on Node 20 / 24)
- **Database**: 
  - *Default Zero-Friction Option*: In-tree async SQLite (`sqlite+aiosqlite:///./setu_ai.db`), ready out-of-the-box with no external installation.
  - *PostgreSQL Option (Optional Production)*: Locally installed PostgreSQL 15+ with `postgis` and `pgvector` extensions enabled.

---

## 1. Native Setup Steps

### Option A: Windows (PowerShell)

```powershell
# 1. Clone & Navigate
cd setu-ai

# 2. Create and Activate Virtual Environment
python -m venv .venv
.venv\Scripts\activate

# 3. Install Backend Dependencies
pip install -r backend\requirements.txt

# 4. Seed Database with Realistic Multilingual Demo Data
$env:PYTHONPATH="backend"
$env:PYTHONIOENCODING="utf-8"
python backend\seed.py

# 5. Run Backend Server (Terminal 1)
python -m uvicorn app.main:app --app-dir backend --reload --port 8000

# 6. Install Frontend & Run Dev Server (Terminal 2)
cd frontend
npm install
npm run dev -- --port 3000
```

### Option B: macOS / Linux (Bash)

```bash
# 1. Clone & Navigate
cd setu-ai

# 2. Create and Activate Virtual Environment
python3 -m venv .venv
source .venv/bin/activate

# 3. Install Backend Dependencies
pip install -r backend/requirements.txt

# 4. Seed Database with Realistic Multilingual Demo Data
export PYTHONPATH="backend"
python backend/seed.py

# 5. Run Backend Server (Terminal 1)
uvicorn app.main:app --app-dir backend --reload --port 8000

# 6. Install Frontend & Run Dev Server (Terminal 2)
cd frontend
npm install
npm run dev
```

---

## 2. PostgreSQL & PostGIS Setup (Optional Production DPG Mode)

If you wish to run against a full native PostgreSQL instance with PostGIS and pgvector:

1. Install PostgreSQL & extensions:
   - **macOS**: `brew install postgresql postgis pgvector`
   - **Ubuntu/Debian**: `sudo apt install postgresql-15 postgresql-15-postgis-3 postgresql-15-pgvector`
2. Create the database and enable extensions via `psql`:
   ```sql
   CREATE DATABASE setu_ai;
   \c setu_ai;
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Set your connection string in `backend/.env`:
   ```bash
   DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/setu_ai"
   ```
4. Run migrations and seed data:
   ```bash
   python backend/seed.py
   ```

---

## 3. Running Unit and Smoke Tests

Verify the explainable formula, HDBSCAN clustering, and end-to-end API smoke tests:

```bash
# Windows
.venv\Scripts\pytest.exe backend\tests -v

# macOS / Linux
pytest backend/tests -v
```

---

## 4. Demo Login Credentials (Ready to Test)

The database includes pre-seeded accounts for each role:

| Persona Role | Email / Username | Password | Jurisdiction / Scope |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@setu.ai` | `password123` | Maharashtra Rural Ward 4 |
| **Regional Official** | `official@setu.ai` | `password123` | Maharashtra State (IN-MH) |
| **National Admin** | `admin@setu.ai` | `password123` | Federal Commission (All BRICS) |
