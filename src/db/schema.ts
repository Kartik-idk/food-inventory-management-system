import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  barcode: text('barcode').notNull().unique(),
  name: text('name').notNull(),
  category: text('category'),
  price: integer('price').notNull().default(0), // Using integer (cents) to avoid floating point issues
});

export const batches = sqliteTable('batches', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  batchId: text('batch_id').notNull().unique(), // The human-readable string for the QR code
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  expiryDate: text('expiry_date').notNull(), // Stored as ISO YYYY-MM-DD
  quantity: integer('quantity').notNull().default(0),
  status: text('status', { enum: ['ACTIVE', 'EXPIRED', 'DEPLETED'] }).notNull().default('ACTIVE'),
});

export const inventoryTransactions = sqliteTable('inventory_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  batchId: integer('batch_id').notNull().references(() => batches.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['ADD', 'SALE', 'UPDATE'] }).notNull(),
  quantity: integer('quantity').notNull(),
  date: text('date').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const wasteLogs = sqliteTable('waste_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  batchId: integer('batch_id').notNull().references(() => batches.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull(),
  reason: text('reason').notNull(),
  date: text('date').notNull().default(sql`CURRENT_TIMESTAMP`),
});
