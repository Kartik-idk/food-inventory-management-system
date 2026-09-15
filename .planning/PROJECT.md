# Food Inventory Management System

## Overview
A modern, browser-based Next.js/React inventory management system designed for small food retailers and store owners. This project is a complete rebuild of a legacy Python CLI system, intended to preserve its core business logic and workflows while dramatically improving usability, reliability, data validation, and architecture.

## Core Domain Model
The system strictly separates product definitions from physical inventory stock:
- **Product:** The master record identifying an item (Product ID, unique barcode, name, category, price).
- **Batch:** A specific physical stock lot of a product (Batch ID, reference to Product, expiry date, quantity, status). Expiry tracking is strictly managed at the batch level, meaning one product can have multiple batches expiring on different dates.

## Hardware & Workflow Modernization
The legacy system's reliance on native webcam OCR and Tesseract for reading expiry dates has been completely removed.
It is replaced by a **QR Code System**:
1. When a new batch is created, the system generates a unique QR code containing structured data (Batch ID, Product barcode, Expiry date).
2. The retailer can print/display this QR code as a physical sticker for the batch packaging.
3. The web application features a browser-based camera scanner to read these QR codes, instantly retrieving the exact batch record from the database for fast stock adjustments or waste recording.

## Target Audience & Scope
- **Users:** Retail/store operators, small food retailers.
- **Scope (MVP):** Local operator system. 
- **Out of Scope:** Authentication, user roles, payment processing, external notifications (email/SMS), and cloud-hosted third-party integrations.

## Technology Stack
- **Frontend/Backend Framework:** Next.js (React)
- **Styling:** Tailwind CSS with shadcn/ui (customized for a premium, modern, clean visual identity)
- **Database:** SQLite with Drizzle ORM (strongly typed schema, Drizzle transactions for atomic operations)
- **Scanner integration:** HTML5 browser camera APIs
- **QR Printing:** Web-based label generation using native browser print (no dedicated PDF/sticker infrastructure)
