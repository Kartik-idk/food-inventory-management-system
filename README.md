# Food Inventory Management System

[![Quality checks](https://github.com/Kartik-idk/food-inventory-management-system/actions/workflows/quality.yml/badge.svg)](https://github.com/Kartik-idk/food-inventory-management-system/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle%20ORM-336791.svg)](https://orm.drizzle.team/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com/)

> An end-to-end perishable inventory management platform built to prevent retail food shrinkage through batch-level tracking, First-Expired, First-Out (FEFO) automated allocation, dynamic discount intelligence, and POS synchronization.

---

## Application Interface

| Executive Inventory & Expiry Dashboard | Real-Time Point of Sale (POS) Terminal |
| :---: | :---: |
| ![Inventory & Expiry Dashboard](docs/images/inventory_dashboard_preview.png) | ![Point of Sale Terminal](docs/images/inventory_pos_preview.png) |
| *Real-time inventory valuation, batch expiry health, and category risk distribution* | *High-velocity checkout terminal with automatic FEFO batch depletion* |

---

## Problem Statement

Retail food stores and grocery chains operate on razor-thin margins where unsold expired stock directly erodes profitability:
1. **Aggregate SKU Blindness:** Standard inventory systems track total SKU quantities without distinguishing between batches arriving days apart, leading to newer stock being sold while older stock quietly expires on shelves.
2. **Delayed Markdown Action:** Time-sensitive perishables are often discounted too late or not at all, resulting in 100% loss through disposal rather than salvage sales.
3. **Unrecorded Shrinkage:** Spoiled goods are frequently thrown out without systematic categorization, obscuring supplier quality issues and improper storage temperatures.

**Food Inventory Management System** solves this by establishing batch-level provenance from the dock to the checkout counter, driving algorithmic FEFO fulfillment and dynamic markdown schedules.

---

## System Architecture & FEFO Flow

```mermaid
flowchart TD
    A["Store Delivery / Goods Receipt"] --> B["Batch Ingestion & QR Code Generation"]
    B --> C[("PostgreSQL via Drizzle ORM")]
    C --> D["Automated Expiry Risk Monitor"]
    D -->|Risk Detected| E["Dynamic Markdown Engine (Near-Expiry Discounts)"]
    D -->|Expired Threshold| F["Waste Logging & Reason Tracking"]
    G["POS Sale Checkout"] --> H{"FEFO Allocation Engine"}
    H -->|Queries Batches by 'expires_at ASC'| I["Deduct Oldest Non-Expired Batch"]
    I --> C
    I --> J["Real-Time Financial & Stock Ledger"]
```

### Key Engineering Decisions

- **Deterministic FEFO Allocation:** Sales transactions do not deduct arbitrary inventory counts. The POS engine queries available batches matching the SKU ordered by `expires_at ASC`, ensuring that items nearest to expiration are consumed first across multi-batch orders.
- **Type-Safe Persistence via Drizzle ORM:** Schema models enforce referential integrity between products, batches, sales transactions, and waste records, preventing orphaned stock entries.
- **QR Code Traceability:** Ingestion generates machine-readable QR codes encoding product ID, batch ID, and expiry timestamp, enabling one-click scanning during warehouse audits.
- **Structured Waste Accounting:** Discarded items require documented cause codes (`EXPIRED`, `DAMAGED_IN_TRANSIT`, `TEMPERATURE_ABUSE`, `PACKAGING_FAILURE`), empowering managers to hold distributors accountable.

---

## Core Capabilities

- **Batch-Level Inventory Tracking:** Manage granular batch metadata including lot numbers, supplier IDs, received dates, shelf-life thresholds, and aisle storage locations.
- **Expiry Risk Dashboard:** Real-time visual categorization into *Normal*, *Approaching Expiry* (< 7 days), and *Critically Expired* tiers.
- **Automated Discount Engine:** Simulates dynamic discount tiers (e.g., 20% markdown at 3 days, 50% markdown at 24 hours) to liquidate aging stock before total loss.
- **POS Simulation API:** High-velocity checkout interface with barcode search, automatic tax calculation, and atomic inventory depletion.
- **Analytical Reporting:** Track total inventory value, historical shrinkage rates, and revenue saved via proactive markdown campaigns.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework & Language** | Next.js 15, TypeScript 5, React 19 |
| **Styling & Icons** | Tailwind CSS, Lucide React |
| **Database & ORM** | PostgreSQL, Drizzle ORM (`drizzle-kit`) |
| **Data Visualization** | Recharts (Stock trends, shrinkage distribution) |
| **Code Quality & CI** | ESLint 9, TypeScript Strict Mode, GitHub Actions |

---

## Local Setup & Quick Start

### Prerequisites

- Node.js 20+ installed
- PostgreSQL instance running locally or hosted (e.g., Neon, Supabase, Railway)

### Installation

1. **Clone repository:**
   ```bash
   git clone https://github.com/Kartik-idk/food-inventory-management-system.git
   cd food-inventory-management-system
   ```

2. **Install dependencies:**
   ```bash
   npm ci
   ```

3. **Configure environment:**
   Create `.env.local` in the project root:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/food_inventory
   ```

4. **Initialize database schema & seed data:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Development & Maintenance Commands

```bash
npm run dev        # Launch local dev server (port 3000)
npm run lint       # Run ESLint quality checks
npm run build      # Execute type check and production Next.js build
npm run db:push    # Push schema modifications directly to database
npm run db:seed    # Seed sample categories, products, and multi-batch stock
npm run db:studio  # Launch Drizzle Studio web GUI for visual data inspection
```

---

## Project Structure

```text
src/
├── app/                  # Next.js App Router (Dashboard, Inventory, POS, Reports)
│   ├── api/              # REST endpoints for batch allocation and sales
│   ├── inventory/        # Batch management and intake forms
│   ├── pos/              # High-velocity POS checkout terminal
│   └── reports/          # Shrinkage analytics and financial reports
├── components/           # Reusable UI cards, tables, modals, and QR scanner
├── db/                   # Drizzle schema definitions, database client, and seed script
└── lib/                  # FEFO allocation algorithms, discount math, and validation
```
