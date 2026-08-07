<div align="center">

# 🛣️ CRACK**WATCH** / INFRA**SIGHT**

### *AI-Powered Smart Infrastructure Command Center*

**Detecting damage before it becomes disaster.**

![Version](https://img.shields.io/badge/version-3.6.2-4EDEA3?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-5DE6FF?style=for-the-badge)
![Python](https://img.shields.io/badge/python-3.12%2B-FFD76B?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/react-19-A78BFA?style=for-the-badge&logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-4EDEA3?style=for-the-badge&logo=fastapi&logoColor=white)

---

*Built in 48 hours. Deployable to 1 billion people.*

</div>

---

## 🎯 The 30-Second Pitch

> Last year in Maharashtra alone, **3,275 people died** because of potholes on Indian roads.
> **73% of reported potholes are never fixed.** ₹33,000 crore is spent annually on road repairs, but manual inspection is slow, expensive, and dangerous.
>
> **CRACKWATCH / INFRASIGHT** doesn't just detect damage — it **predicts when infrastructure will fail, estimates repair costs in INR, structures a complete 3-role workflow (Citizen ➔ Inspector ➔ Contractor), and publicly ranks contractors by accountability**.
>
> Citizens report via the Web App or WhatsApp in under 3 seconds across 4 infrastructure categories (Roads, Buildings, Pipelines, Bridges).
> Inspectors review AI detections, rank complaints in a Priority Queue, register contractor accounts, and assign work orders.
> Contractors receive assigned tasks, update real-time progress, and upload repair proof photos for AI Before/After verification.
>
> **Detecting a pothole doesn't fix it. A watched government does.**

---

## 🏆 What Makes This Groundbreaking

<table>
<tr>
<td width="33%" align="center">

### 🔄 3-Role Workflow
**Citizen ➔ Inspector ➔ Contractor**
Complete end-to-end lifecycle. Citizens report, Inspectors prioritize and assign, Contractors repair and upload proof.

</td>
<td width="33%" align="center">

### 🤖 3-Model AI Pipeline
**Fully offline, 757ms per image.**
YOLOv8s-RDD + CrackSeg + OpenCV running in parallel. Zero cloud bills. Works across 4 infrastructure sectors.

</td>
<td width="33%" align="center">

### 🏛️ Multi-Sector Support
**Roads, Buildings, Pipelines, Bridges**
Unified intelligence platform covering potholes, structural cracks, water pipe leaks, spalling, and bridge distress.

</td>
</tr>
<tr>
<td width="33%" align="center">

### 🔮 Predictive Engine
**"This road fails in 18 days."**
Monsoon-adjusted damage progression model. Shows cost delta if repair is delayed.

</td>
<td width="33%" align="center">

### 🛡️ 5-Layer Fraud Detection
**No selfies reach the inspector.**
Image authenticity + GPS validation + content relevance + duplicate detection + rate limiting.

</td>
<td width="33%" align="center">

### 💬 WhatsApp Bot
**Zero app install needed.**
500M Indian WhatsApp users can report damage *right now* via photo + location share with automated AI replies.

</td>
</tr>
</table>

---

## 🏗️ Architecture & 3-Step Workflow

```
┌────────────────────────────────────────────────────────────────────────┐
│                          INFRASIGHT ECOSYSTEM                           │
│                                                                          │
│   ┌──────────────┐     ┌──────────────┐     ┌────────────────┐          │
│   │  Govt App    │     │  Citizen PWA │     │  WhatsApp Bot  │          │
│   │  React+Vite  │     │  React+Vite  │     │  (Twilio)      │          │
│   │  Port 5173   │     │  Port 5175   │     │  +14155238886  │          │
│   │  HTTPS       │     │  Phone-frame │     │  join code     │          │
│   └──────┬───────┘     └──────┬───────┘     └────────┬───────┘          │
│          │                    │                      │                   │
│          └──────────┬─────────┴──────────┬───────────┘                   │
│                     ▼                    ▼                               │
│            ┌───────────────┐    ┌───────────────┐                        │
│            │ HTTPS :8000   │    │ HTTP :8001    │                        │
│            │ Frontend API  │    │ ngrok tunnel  │                        │
│            └───────┬───────┘    └───────┬───────┘                        │
│                    │                    │                                │
│                    └──────────┬─────────┘                                │
│                               │                                          │
│                       ┌───────▼────────┐                                 │
│                       │   FastAPI      │                                 │
│                       │   (single app) │                                 │
│                       └───────┬────────┘                                 │
│                               │                                          │
│  ┌──────┬──────┬──────┬──────┼──────┬──────┬──────┬──────┐              │
│  ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼              │
│ YOLO  Crack  OpenCV Severity Cost  Fraud Predict Gamify Analytics       │
│ RDD   Seg    CV     Engine   INR   5-lyr X-days  XP/Lvl Wall of Shame   │
│                                                                          │
│                       ┌──────────────┐                                   │
│                       │ shared_store │ ← cross-process state sync        │
│                       │    .json     │                                   │
│                       └──────────────┘                                   │
└────────────────────────────────────────────────────────────────────────┘
```

### Complete 3-Step Infrastructure Workflow

```
┌─────────────────────────┐        ┌─────────────────────────┐        ┌─────────────────────────┐
│ 1. Citizen              │        │ 2. Inspector            │        │ 3. Contractor           │
│ • Select Sector         │ ──────►│ • Review Incoming Detections   │ ──────►│ • Login Credentials     │
│ • Photo/Video Upload    │        │ • Set Priority Queue    │        │ • View Work Orders      │
│ • AI Analysis Preview   │        │ • Register Contractor   │        │ • Update Status         │
│ • Track Report Status   │        │ • Assign Work Order     │        │ • Upload Repair Proof   │
└─────────────────────────┘        └─────────────────────────┘        └─────────────────────────┘
```

---

## ✨ Complete Feature List

### 📱 1. Citizen Portal / PWA

| Feature | What It Does |
|---------|--------------|
| 🏗️ **4-Sector Selection** | Choose between 🛣️ **Roads**, 🏢 **Buildings**, 🚰 **Pipelines**, 🌉 **Bridges** |
| 📸 **Photo & Video AI Scan** | Upload media → 3-model AI detects bounding boxes, severity %, and cost estimate in 757ms |
| 📋 **My Reports Tracker** | Real-time card status showing progression (`Submitted` ➔ `In Priority Queue` ➔ `Assigned` ➔ `Fixed`) |
| 🗺️ **Live Pothole Map** | Interactive Leaflet map color-coded by defect severity and status |
| ⬆️ **Upvote System** | Community voting to highlight urgent local damage reports |
| 🧭 **Pothole-Aware Navigation** | OSRM routing with safety scores, hazard markers, and "Avoid Potholes" toggle |
| 🏆 **Gamification Engine** | Earn XP, Civic Coins, 13 achievement badges, daily streaks, and Pothole Hunter leaderboard |
| 💬 **WhatsApp Integration** | Report damage directly from WhatsApp without app installation |

### 🏛️ 2. Inspector Command Center

| Feature | What It Does |
|---------|--------------|
| 📥 **Incoming Complaints** | Review incoming photo & video reports submitted by citizens across all 4 sectors |
| 🔍 **AI Verification Tool** | Inspect bounding boxes, severity score, image trust score, and fraud checks |
| ⚠️ **Priority Queue Manager** | Structure complaints into ranked priority queues (*Critical*, *High*, *Medium*, *Low*) |
| 👷 **Contractor Registration** | Register contractor accounts with Name, Company/Agency, Username, and Password |
| 📌 **Work Order Assignment** | Dispatch verified priority reports to registered contractors with target dates and notes |
| 🗺️ **Inspector Control Map** | Map view showing all active, assigned, and resolved infrastructure reports |
| 📊 **Advanced Analytics** | Access City Health Scores, Wall of Shame, Smart Heatmap, and Predictive Forecasts |
| 🛡️ **System & Fraud Settings** | Toggle 5-layer fraud detection and system parameters on/off |

### 👷 3. Contractor Portal

| Feature | What It Does |
|---------|--------------|
| 🔑 **Role-Based Auth** | Secure login using Inspector-generated credentials |
| 📋 **Assigned Work Orders** | View assigned repair jobs with priority badges, location, cost allocation, and deadlines |
| 🔄 **Status Progress Drawer** | Update job status sequentially (`Work Assigned` ➔ `In Progress` ➔ `Submitted Proof`) |
| 📸 **Proof of Fix Upload** | Upload "After Repair" photo for AI verification before task completion |
| 📊 **Performance Metrics** | Track active assignments, completed repair count, and efficiency stats |

---

## 🧰 Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### 🎯 AI / ML
- **YOLOv8s-RDD** — Road damage detection (72.6% mAP)
- **YOLOv8s-CrackSeg** — Building/wall crack segmentation (85%+)
- **OpenCV** — Supplementary CV (leaks, rust, spalling, moiré)
- **Ultralytics** — Inference framework
- **RDD2022 Dataset** — 4.8K Indian road images

### ⚙️ Backend
- **Python 3.12+**
- **FastAPI 0.115** — Async ASGI framework
- **Uvicorn 0.30** — ASGI server with HTTPS
- **Pillow** — Image decoding + EXIF extraction
- **python-dotenv** — Credentials management
- **Twilio SDK 9.3** — WhatsApp integration
- **JWT** — Stateless role-based authentication

</td>
<td valign="top" width="50%">

### 🎨 Frontend (Main App)
- **React 19** + **Vite 8**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **shadcn/ui** component primitives
- **Framer Motion** — Animations
- **Recharts** — Analytics charts
- **Leaflet** + **react-leaflet-cluster** — Maps
- **Lucide React** — Icons
- **Space Grotesk + Geist** — Typography

### 📱 Frontend (Public Citizen PWA)
- **React 19** + **Vite 8**
- **Leaflet Routing Machine** (OSRM) — Pothole-aware nav
- **Framer Motion** — Phone-frame animations

### 🔌 Integrations
- **Twilio WhatsApp Sandbox** — Messaging platform
- **ngrok** — HTTPS tunnel for webhooks
- **OpenStreetMap / Nominatim** — Geocoding

</td>
</tr>
</table>

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.12+**
- **Node.js 20+**
- **Git**

### 1. Clone the Repo

```bash
git clone https://github.com/aaryannighut/CrackZone.git
cd CrackZone
```

### 2. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies

```bash
# Main App
cd ..
npm install

# Public PWA
cd public-app
npm install
cd ..
```

### 4. Configure Environment

```bash
# .env (Main App)
VITE_API_URL=

# public-app/.env
VITE_API_URL=

# backend/.env (for WhatsApp)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### 5. Run Everything

```bash
# Terminal 1 — FastAPI Backend (HTTPS)
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 \
  --ssl-keyfile key.pem --ssl-certfile cert.pem

# Terminal 2 — Main Command Center App
npm run dev                # → https://localhost:5173

# Terminal 3 — Public Citizen PWA
cd public-app
npm run dev                # → https://localhost:5175
```

---

## 🔐 Demo Credentials

| Role | Username | Password | Access & Capabilities |
|------|----------|----------|-----------------------|
| 🏛️ **Inspector** | `inspector` | `inspector123` | Full Inspector Command Center (Review media, set Priority Queue, register Contractors, assign Work Orders) |
| 🏛️ **Inspector (Admin)** | `admin` | `admin123` | Full Inspector Command Center & System Settings |
| 👷 **Contractor** | `contractor` | `contractor123` | Contractor Portal (View assigned tasks, update status, upload repair proof) |
| 📱 **Citizen (Demo)** | `citizen` | `citizen123` | Citizen Portal across 4 sectors + report tracking |
| 📱 **Citizen (Pre-seeded)** | `saud` | `123` | Gamified citizen account (Lv.6, 3200 XP, 10 badges, #1 leaderboard) |

---

## 📖 API Reference

### Authentication & Contractor Management
```
POST /auth/login                 Role-based login (Citizen, Inspector, Contractor) → JWT
POST /auth/register              Citizen registration
POST /auth/register-contractor   Inspector registers a new contractor account
GET  /auth/me                    Verify token & return user payload
GET  /inspector/contractors      Inspector fetches all registered contractors
```

### Work Order & Contractor Assignment
```
POST /inspector/assign-work            Inspector assigns report to contractor with priority & target date
GET  /contractor/tasks                 Contractor fetches assigned work orders
POST /contractor/tasks/{id}/status     Contractor updates status & uploads repair proof image
```

### AI Detection & Sectors
```
POST /detect                     Upload image → 3-model AI pipeline (Road, Building, Pipeline, Bridge)
POST /detect/video               Video frame-by-frame AI analysis
POST /detect/frame               Single base64 frame (live camera stream)
GET  /sectors                    List available infrastructure sectors
```

### Citizen Reports
```
POST /public/report                Submit citizen report (photo/video + GPS)
GET  /public/reports/map           Lightweight map pin data
GET  /public/reports/map/detail    Full reports with image data
GET  /public/reports/{id}          Single report detail
POST /public/reports/{id}/upvote   Upvote a citizen report
```

### Analytics & System Settings
```
GET  /analytics/wall-of-shame       Contractor accountability leaderboard
GET  /analytics/heatmap             Geo-intensity damage map points
GET  /analytics/priority-queue      Top urgent repairs queue
GET  /analytics/city-health         Per-city health scores
GET  /analytics/forecast            Predictive maintenance forecast
POST /analytics/before-after       Compare before & after repair images
GET  /admin/settings               Read system settings
PATCH /admin/settings              Toggle fraud detection
```

### Gamification & WhatsApp
```
GET  /gamification/leaderboard     Top citizen leaderboard
GET  /gamification/profile/{id}    User profile & achievements
POST /whatsapp/webhook             Twilio incoming WhatsApp webhook
```

---

## 📜 License

MIT — Open-source infrastructure intelligence and accountability platform.

---

<div align="center">

*Detecting damage doesn't fix it. A watched government does.*

[⬆ back to top](#%EF%B8%8F-crackwatch--infrasight)

</div>
