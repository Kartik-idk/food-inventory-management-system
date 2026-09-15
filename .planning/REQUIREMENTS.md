# Requirements Specification

## 1. Product Data
- Ability to register a new product and perform lookups.
- A Product must include: Product ID (internal), Unique Barcode, Product Name, Category, and Price.
- Barcode uniqueness must be strictly enforced.

## 2. Batch Data
- Ability to create, update, and manage inventory at the batch level.
- A Batch must include: Batch ID (system-generated), Product Reference, Expiry Date, Quantity, and Status.
- Batches are always tied to an existing product.
- Automatic and reliable status handling (e.g., transitions to expired or depleted).

## 3. QR Generation
- Upon batch creation, the system must generate a unique QR code.
- The QR code must contain structured data identifying the batch: Batch ID, Product Barcode, and Expiry Date.
- Provide a workflow for the retailer to display, print, or download this QR code as a physical sticker.

## 4. QR Scanning
- The web application must support asynchronous, browser-based camera scanning of the generated QR codes.
- Scanning a QR code must decode the data, identify the exact batch, retrieve its database record, and display the relevant batch/product information.
- A sensible manual fallback (e.g., manual entry of a Batch ID or barcode) must be provided if the camera/QR fails.

## 5. Inventory Transactions
- The system must provide a reliable audit trail for stock-changing operations.
- Operations like Add Stock and Sell/Remove Stock must log an `INVENTORY_TRANSACTION` with the batch reference, type (Add/Sale), quantity, and date.
- Direct quantity overrides (where appropriate) must also be handled securely.

## 6. Waste Tracking
- Ability to record wasted stock.
- Must log a `WASTE` record including the batch reference, wasted quantity, reason, and date.
- The financial value of the waste is calculated using the product's price.

## 7. Expiry/Risk Logic
- Expiry thresholds must be strictly preserved from the reference system:
  - **EXPIRED:** negative days remaining
  - **CRITICAL:** 0–2 days
  - **HIGH:** 3–5 days
  - **MEDIUM:** 6–10 days
  - **LOW:** > 10 days
- The system must use a 10-day expiry alert window.
- The system must use a 3-day notification threshold.
- Accurate expiry forecasting should leverage actual transaction history to project sales run-rate, rather than defaulting to zero sales.

## 8. Reporting
- Support for aggregate reporting concepts:
  - Total products
  - Total inventory/stock across all batches
  - Expired stock count
  - Products/batches expiring soon
  - Total wasted quantity
  - Waste by product
  - Estimated financial waste value (using product price * wasted quantity)

## 9. Dashboard
- A high-level overview screen showing critical alerts, expiring soon items, total inventory stats, and quick-action access.
- Must be clean, premium, modern, responsive, and optimized for both desktop and tablet environments in a retail setting.

## 10. Validation and Data Integrity
- **Input Validation:** Strict date format validation and numeric validation (e.g., preventing negative stock or negative price values).
- **Relational Integrity:** Enforce foreign-key constraints (e.g., preventing stock additions to a nonexistent batch).
- **Atomicity:** Multi-step database operations (like logging a transaction and decrementing batch stock) must be wrapped in atomic transactions.
- **UX/UI Polish:** Provide friendly validation messages, clear error handling, thoughtful empty states, and visual loading states. Do not reproduce the silent failures of the legacy system.
