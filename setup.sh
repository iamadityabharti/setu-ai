#!/usr/bin/env bash
# SETU AI — One-Click Native Environment Setup Script
set -e

echo "=========================================="
echo "SETU AI: Digital Public Good Local Setup"
echo "=========================================="

# 1. Backend Setup
echo "[1/4] Setting up Python virtual environment..."
python -m venv .venv

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source .venv/Scripts/activate
else
    source .venv/bin/activate
fi

echo "[2/4] Installing backend dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "[3/4] Initializing and seeding database..."
export PYTHONPATH="backend"
python backend/seed.py

# 2. Frontend Setup
echo "[4/4] Installing frontend dependencies & building..."
cd frontend
npm install
npm run build
cd ..

echo "=========================================="
echo "✅ Setup Complete!"
echo "To run the application locally:"
echo "Terminal 1 (Backend):"
echo "  source .venv/bin/activate (or .venv\\Scripts\\activate on Windows)"
echo "  uvicorn app.main:app --app-dir backend --reload --port 8000"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend && npm run dev"
echo "=========================================="
