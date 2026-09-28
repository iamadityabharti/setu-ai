# SETU AI (सेतु)
### Multilingual Digital Public Good (DPG) for Civic Infrastructure Intelligence across BRICS Nations

> **"Setu" = Bridge in Hindi.**  
> SETU AI is a sovereign, interoperable Digital Public Good platform that bridges citizen voices directly into national capital expenditure planning across BRICS nations.

🌐 **Live Production Deployment**: [https://setu-ai.netlify.app](https://setu-ai.netlify.app)  
📦 **GitHub Repository**: [https://github.com/iamadityabharti/setu-ai](https://github.com/iamadityabharti/setu-ai)

---

## 1. Problem Statement & Mission

Traditional public infrastructure allocation across emerging economies suffers from severe structural bottlenecks:
1. **The Representation Gap**: Citizens in rural, semi-arid, or marginalized habitations lack access to formal grievance redressal systems due to illiteracy, dialect barriers, or absence of smartphones.
2. **The "Black Box" Allocation Trap**: Public investments are often directed based on political influence rather than empirical demand density and demographic vulnerability.
3. **The Disconnect from Ground Policy**: Municipal complaints remain isolated tickets rather than being grounded against pre-budgeted state masterplans and verified with before/after physical outcome tracking.

**SETU AI** solves this by:
- Ingesting citizen grievances across voice, SMS, WhatsApp, and web in native dialects (Hindi, Marathi, Portuguese, Russian, Mandarin).
- Synthesizing discrete complaints into localized **demand hotspots** using geospatial HDBSCAN clustering.
- Fusing hotspots with census vulnerability data and existing infrastructure deficit indexes.
- Generating a 100% **explainable priority score** for regional planners, coupled with a **Policy-Alignment Assistant (RAG)** that cites exact clauses in sovereign five-year investment plans.
- Providing federal commissions with cross-region equity dashboards and verifiable **Before/After Physical Impact Tracking**.

---

## 2. System Architecture

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                   MULTI-CHANNEL CITIZEN INGESTION                        │
│   [🎙️ Voice Notes]      [💬 WhatsApp Webhook]      [📱 2-Way SMS]       │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ (Normalizer & Dialect Detector)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           AI SERVICE LAYER                               │
│  ┌──────────────────────┐  ┌────────────────────┐  ┌──────────────────┐  │
│  │ Multilingual Whisper │  │   fasttext + NLU   │  │ HDBSCAN Spatial  │  │
│  │ STT & Transcribe     │  │ Intent/Urgency     │  │ Hotspot Cluster  │  │
│  └──────────────────────┘  └────────────────────┘  └──────────────────┘  │
│  ┌──────────────────────────────────────────────┐  ┌──────────────────┐  │
│  │ 100% Explainable Priority Scoring Engine     │  │ Grounded Policy  │  │
│  │ (35% Demand + 20% Urg + 20% Vuln + 15% Def)  │  │ RAG (pgvector)   │  │
│  └──────────────────────────────────────────────┘  └──────────────────┘  │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ (FastAPI Async ORM)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                        DATA & SOVEREIGNTY TIER                           │
│     [PostgreSQL 15+ / PostGIS / pgvector]  or  [Async In-Tree SQLite]    │
│  - users (RBAC)      - requests (anonymized)   - hotspots (GeoJSON)      │
│  - projects (audited)- investment_plans        - impact_snapshots        │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ (REST APIs + WebSockets /ws/dashboard)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                 INTERACTIVE REACT 18 + TS FRONTEND                       │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────┐    │
│  │ Citizen Voice      │  │ Regional Official  │  │ National Admin   │    │
│  │ Intake & Timeline  │  │ Command & Map      │  │ Leaderboard &    │    │
│  │                    │  │ + Policy RAG Box   │  │ Impact Tracker   │    │
│  └────────────────────┘  └────────────────────┘  └──────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. What Makes SETU AI Advanced (DPG Criteria)

1. **Design-Before-Build Discipline**: Complete Phase A UX wireframes created, audited with strict design tokens, and approved before backend implementation.
2. **100% Explainable AI Formula (Section 7)**:
   $$\text{Priority Score} = 0.35 \cdot V_{\text{demand}} + 0.20 \cdot U_{\text{urgency}} + 0.20 \cdot D_{\text{vuln}} + 0.15 \cdot I_{\text{deficit}} + 0.10 \cdot B_{\text{budget}}$$
   Visible as an interactive 5-segment breakdown bar in the UI.
3. **Retrieval-Augmented Policy Alignment (RAG)**: Uses 384-dimensional dense embeddings to retrieve matching policy articles from state masterplans, giving planners direct citations.
4. **Federated & Sovereign Data Architecture**: `country_code` natively on all region entities, allowing sovereign sharding per BRICS nation without code rewrites.
5. **Low-Bandwidth & Offline Ingestion**: Built-in SMS and WhatsApp webhook adapters allowing rural citizens without smartphones to register grievances.
6. **Open Data by Default**: Live read-only endpoint `/api/v1/public/hotspots` serving anonymized GeoJSON under open database license.
7. **Immutable Audit Trail**: Every project lifecycle status change writes an `audit_logs` record with user ID, timestamp, and JSON diff.

---

## 4. Native Local Setup (No Docker Required)

### 1. Backend Setup
```bash
# From workspace root
python -m venv .venv
source .venv/bin/activate    # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Seed realistic demo data (~150 citizen requests, 3 BRICS regions, RAG documents)
export PYTHONPATH="backend"
python backend/seed.py

# Start FastAPI backend server
uvicorn app.main:app --app-dir backend --reload --port 8000
```

### 2. Frontend Setup
```bash
# In a separate terminal
cd frontend
npm install
npm run dev -- --port 3000
```

Open `http://localhost:3000` in your browser.

---

## 5. Demo Credentials (For Evaluation)

The database includes pre-configured credentials across all three personas:

| Role | Username / Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@setu.ai` | `password123` | Submit audio/SMS grievances & track live 6-stage timeline |
| **Regional Official** | `official@setu.ai` | `password123` | Maharashtra State command, map, ranked queue & RAG assistant |
| **National Admin** | `admin@setu.ai` | `password123` | Cross-region BRICS leaderboard, audit log modals, impact tracker |

*(You can also click the quick-role buttons in the top navbar to instantly test any role).*

---

## 6. Testing & Quality Verification

Run the test suite covering priority formula math, spatial HDBSCAN clustering, and role smoke tests:

```bash
# Windows
.venv\Scripts\pytest.exe backend\tests -v

# macOS / Linux
pytest backend/tests -v
```

All 12 unit and smoke tests run with 100% pass rate.
