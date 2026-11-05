# Food Inventory Management System

> A full-stack inventory workflow for reducing food waste through batch tracking, expiry intelligence, QR-based operations, and POS integration.

This project helps a store team manage food inventory at the batch level: receive stock, monitor expiry risk, apply discount rules, record waste, and process sales using FEFO (first-expire, first-out) allocation.

## Features

- Batch-level inventory with product, barcode, quantity, and expiry records.
- Expiry-risk alerts and configurable notification settings.
- QR-code creation and scanning workflows.
- Waste recording with reason tracking.
- Discount simulation for time-sensitive inventory.
- POS API simulator that allocates sales using FEFO.
- Reporting for inventory value, expired stock, and waste cost.
- Database migrations and seed tooling through Drizzle ORM.

## Tech stack

- Next.js + React + TypeScript
- PostgreSQL + Drizzle ORM
- Tailwind CSS and component-based UI
- QR scanning and printable labels

## Run locally

### Prerequisites

- Node.js 20+
- A PostgreSQL database

### Setup

```bash
git clone https://github.com/Kartik-idk/food-inventory-management-system.git
cd food-inventory-management-system
npm install
```

Create `.env.local`:

```env
DATABASE_URL=your_postgresql_connection_string
```

Then initialise the database and start the app:

```bash
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available commands

```bash
npm run dev       # start the development server
npm run lint      # run ESLint
npm run build     # create a production build
npm run db:push   # apply the Drizzle schema
npm run db:seed   # load sample data
npm run db:studio # inspect the database
```

## Project structure

- `src/app/` — dashboard, inventory, POS, scanning, reports, settings, and API routes
- `src/components/` — inventory, waste, layout, and UI components
- `src/db/` — database connection, schema, migrations, and seed logic
- `src/lib/` — business rules for alerts, expiry, forecasting, and actions
- `drizzle/` — committed database migrations

## Status

A portfolio prototype demonstrating practical inventory operations and waste-reduction workflows. Configure secrets locally; do not commit `.env.local`.
