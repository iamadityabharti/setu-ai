# SETU AI — Phase A UI/UX Design Review & Wireframe Specification

> **Digital Public Good (DPG) Platform for Civic Infrastructure Allocation across BRICS Nations**  
> **Phase A Deliverable**: Persona briefs, wireframe architecture, layout rationale, and design token validation prior to full-stack implementation.

---

## 1. Executive Design Brief & Persona Mapping

SETU AI ("सेतु" = bridge in Hindi) bridges citizen grievances directly into sovereign capital planning. The UI architecture avoids the standard playful startup aesthetic in favor of an **institutional, high-dignity civic intelligence language** that respects both low-bandwidth citizens and senior infrastructure ministers.

| Persona | Role & Jurisdiction | Top Mission-Critical Task | Key Design Imperatives |
| :--- | :--- | :--- | :--- |
| **Citizen** | Rural & urban residents across BRICS (India, Brazil, etc.) | **Submit request via local dialect voice note or SMS & track live allocation timeline** | Large 48px+ tap targets, one-handed mobile ergonomic flow, zero technical jargon, multi-channel fallback (SMS/WhatsApp), privacy reassurance. |
| **Regional Official** | State & municipal infrastructure planning engineers | **Review clustered demand hotspots, audit ranked project queue & verify master plan alignment** | High-density 3-column command layout: interactive geospatial map + ranked queue + 100% explainable score breakdown + grounded policy RAG assistant. |
| **National Admin** | Federal Planning Commission & BRICS Ministry of Finance | **Equitable cross-region capital allocation & verifiable before/after physical impact tracking** | Comparative disparity table across states/countries, lifecycle status transitions tied to immutable audit logs, empirical sensor/citizen impact metric cards. |

---

## 2. Design Tokens & Visual Language Audit

Applied consistently across all four wireframe modules without deviation:

- **Institutional Trust Navy (`#132A4C` / `#0E1D33`)**: Dominant anchor establishing governmental legitimacy, state permanence, and data security.
- **Citizen Warmth Sand (`#E8DCC4` / `#F7F3EA`)**: Warm, accessible tactile undertones avoiding sterile clinical dashboards.
- **Signal Accent Terracotta-Red (`#C1502E`)**: **Strictly quarantined** to critical hazard urgency indicators and top priority score warnings — prohibited from decorative use elsewhere.
- **Typography**: Primary interface set in humanist sans (*Plus Jakarta Sans* / *IBM Plex Sans* with native multilingual rendering) paired with classical serif (*IBM Plex Serif*) strictly for public-facing landing headlines.

---

## 3. Screen-by-Screen Wireframe Specifications & Rationale

### Screen 1: Landing Page & Multilingual Gateway
![SETU AI Landing & Multilingual Gateway Wireframe](C:\Users\Aditya Bharti\.gemini\antigravity-ide\brain\0f4b7ecb-0e02-4d1f-abd3-c077522a3f76\landing_wireframe_1790609102537.jpg)

* **Interactive Prototype**: `design/wireframes/index.html` (Live at `http://localhost:8090/index.html`)
* **Layout & Visual Hierarchy**: Prominent header featuring the Hindi "से" emblem and instant language selector (English, हिन्दी, Português, Русский, 中文). A serif headline centers the civic mission, followed by a live multilingual text synthesizer demonstrating real-time translation across BRICS languages. Three primary portal cards provide direct gateways tailored to each persona, underscored by an audited national capital metric ribbon ($2.4B directed, 148,240 ingests).
* **Design Rationale**: Prioritizes transparent public trust and immediate multilingual accessibility. Citizens and visiting international delegates immediately recognize the platform's multi-nation sovereignty and Digital Public Good foundations before selecting their specific workspace.

---

### Screen 2: Citizen Voice Portal & Live Status Timeline
![Citizen Voice Portal & Live Status Timeline Wireframe](C:\Users\Aditya Bharti\.gemini\antigravity-ide\brain\0f4b7ecb-0e02-4d1f-abd3-c077522a3f76\citizen_wireframe_1790609132497.jpg)

* **Interactive Prototype**: `design/wireframes/citizen.html` (Live at `http://localhost:8090/citizen.html`)
* **Layout & Visual Hierarchy**: A clean dual-mode interface. 
  - **Submit Grievance Tab**: Big icon category cards (Water, Roads, Power, Health, Schools, Sanitation) lead to a prominent Voice Recording Studio with animated soundwave feedback and live Whisper transcription preview. The terracotta signal accent appears *only* if the citizen designates a "Critical Hazard". A footer banner provides SMS/WhatsApp toll-free numbers for non-smartphone users.
  - **Live Timeline Tab**: Shows a vertical progress track with 6 discrete verification nodes (`Received` → `Clustered with 342 neighbors` → `Regional Review` → `Prioritized Rank #1` → `Funded` → `Completed`).
* **Design Rationale**: Minimizes cognitive friction and literacy barriers. Citizens who cannot type can simply press the large microphone to speak naturally in their dialect; the live timeline provides complete transparency into how their isolated complaint coalesced with neighbors to trigger real government budget allocation.

---

### Screen 3: Regional Official Command & Policy RAG Assistant
![Regional Official Command & RAG Assistant Wireframe](C:\Users\Aditya Bharti\.gemini\antigravity-ide\brain\0f4b7ecb-0e02-4d1f-abd3-c077522a3f76\official_wireframe_1790609370357.jpg)

* **Interactive Prototype**: `design/wireframes/official.html` (Live at `http://localhost:8090/official.html`)
* **Layout & Visual Hierarchy**: 3-column cockpit layout designed for rapid engineering triage:
  1. *Left*: Ranked project queue sorted by the explainable formula with mini 5-segment breakdown bars and live clustering trigger.
  2. *Center*: Geospatial density map with interactive HDBSCAN clusters, demographic vulnerability overlays, and pulsing urgency pins.
  3. *Right*: Deep dive panel presenting the exact mathematical score weights (35% demand volume, 20% urgency, 20% demographic vulnerability, 15% infrastructure deficit, 10% plan alignment) alongside the **Policy RAG Assistant** which queries uploaded state masterplans in `pgvector` and cites exact budget lines.
* **Design Rationale**: Replaces "black box AI" with 100% explainability. Planners can defend why a project is ranked #1 to auditors and elected officials, backed by direct semantic citations to official state policy documents.

---

### Screen 4: National Admin Leaderboard & Impact Tracker
![National Admin Leaderboard & Impact Tracker Wireframe](C:\Users\Aditya Bharti\.gemini\antigravity-ide\brain\0f4b7ecb-0e02-4d1f-abd3-c077522a3f76\admin_wireframe_1790609415774.jpg)

* **Interactive Prototype**: `design/wireframes/admin.html` (Live at `http://localhost:8090/admin.html`)
* **Layout & Visual Hierarchy**: Federal command header with open data export (`/api/v1/public/hotspots`).
  - *Tab 1 (Leaderboard)*: Comparative cross-region table across BRICS jurisdictions (Maharashtra, Minas Gerais, Bihar, Bahia) displaying population reached, capex allocation, and interactive lifecycle status triggers that spawn audit log confirmations.
  - *Tab 2 (Impact Tracker)*: Before/after physical impact cards comparing ground baseline measurements (e.g. Clean water access: 1.5h/day → 18.5h/day; Emergency transit time: 95m → 26m) paired with SMS-based citizen satisfaction sentiment verification.
* **Design Rationale**: Solves the critical governance gap where infrastructure projects are funded but never audited for actual citizen outcome. Gives federal ministers proof of physical return on public capital investment.

---

## 4. Phase A Review Checklist & Sign-off

- [x] All 3 persona design briefs & top tasks restated
- [x] Static click-through wireframes built in `design/wireframes/`
- [x] Strict palette applied: Deep navy `#132A4C`, warm sand `#E8DCC4`, terracotta `#C1502E` strictly for urgency
- [x] Explainable formula (Section 7) visibly incorporated into UI hierarchy
- [x] Retrieval-Augmented Generation (RAG) policy citation box specified
- [x] Live WebSocket and before/after impact tracking components drafted
- [x] Ready for Phase B full-stack implementation upon approval
