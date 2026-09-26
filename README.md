# Invento — Smart Inventory Management System

A modular inventory management platform built for the Odoo Hackathon 2026.

> **Know what stock exists, where it is, what happened to it, and what needs attention.**

## 🎯 Features

- 🔐 **Auth** — Signup / Login with JWT
- 📊 **Dashboard** — Real-time KPIs, low-stock alerts, weekly activity chart
- 📦 **Products** — CRUD, search by SKU, reorder levels, per-location stock
- 📥 **Receipts** — Incoming stock from suppliers (+ stock on validate)
- 📤 **Deliveries** — Outgoing stock to customers (− stock on validate, no negative stock)
- 🔄 **Transfers** — Move stock between locations (total company stock unchanged)
- ⚙️ **Adjustments** — Physical count correction with live difference
- 📜 **Move History** — Complete audit trail of every stock movement
- 🏢 **Warehouses** — Multi-warehouse + nested location hierarchy
- 🌗 **Dark / Light Mode** — Theme toggle with persistence
- 📱 **Fully Responsive** — Desktop, tablet, mobile

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS v3 |
| UI Components | Custom (Lucide icons, Recharts) |
| Backend | FastAPI + Python |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Auth | JWT |

## 🚀 Quick Start

### Backend

\`\`\`bash
cd backend
python -m venv venv
.\\venv\\Scripts\\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
\`\`\`

Backend runs at: **http://127.0.0.1:8000**
API docs: **http://127.0.0.1:8000/docs**

### Frontend

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Frontend runs at: **http://localhost:3000**

### Seed Demo Data

\`\`\`bash
cd backend
python seed.py
\`\`\`

## 📁 Project Structure

\`\`\`
invento/
├── backend/
│   ├── api/
│   ├── models/
│   ├── services/
│   ├── main.py
│   ├── seed.py
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── operations/
│   │   │   ├── history/
│   │   │   └── settings/
│   │   └── login/
│   ├── components/
│   └── tailwind.config.ts
├── docs/
│   └── SMOKE_TEST.md
└── README.md
\`\`\`

## 🎬 Demo Path

\`\`\`
LOGIN → DASHBOARD → CREATE PRODUCT → RECEIPT → TRANSFER → DELIVERY → ADJUSTMENT → MOVE HISTORY
\`\`\`

## 👥 Team

- **Person 1** — Backend / Stock Engine
- **Person 2** — Frontend / Design
- **Person 3** — Operations UI / Integration
- **Person 4** — Dashboard / QA / Integration Lead

## 📄 License

Built for Odoo Hackathon 2026. Not for commercial use.
