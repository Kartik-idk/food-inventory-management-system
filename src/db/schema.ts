import { sql } from 'drizzle-orm';
import { text, integer, serial, pgTable, timestamp } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  barcode: text('barcode').notNull().unique(),
  name: text('name').notNull(),
  category: text('category'),
  price: integer('price').notNull().default(0), // Using integer (cents) to avoid floating point issues
});

export const batches = pgTable('batches', {
  id: serial('id').primaryKey(),
  batchId: text('batch_id').notNull().unique(), // The human-readable string for the QR code
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  expiryDate: text('expiry_date').notNull(), // Stored as ISO YYYY-MM-DD
  quantity: integer('quantity').notNull().default(0),
  status: text('status', { enum: ['ACTIVE', 'EXPIRED', 'DEPLETED'] }).notNull().default('ACTIVE'),
});

export const inventoryTransactions = pgTable('inventory_transactions', {
  id: serial('id').primaryKey(),
  batchId: integer('batch_id').notNull().references(() => batches.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['ADD', 'SALE', 'UPDATE'] }).notNull(),
  quantity: integer('quantity').notNull(),
  date: timestamp('date').notNull().defaultNow(),
});

export const wasteLogs = pgTable('waste_logs', {
  id: serial('id').primaryKey(),
  batchId: integer('batch_id').notNull().references(() => batches.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull(),
  reason: text('reason').notNull(),
  date: timestamp('date').notNull().defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  batchId: integer('batch_id').notNull().references(() => batches.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'CRITICAL_RISK', 'HIGH_RISK', 'IMMEDIATE_INTERVENTION'
  status: text('status').notNull().default('PENDING'), // 'PENDING', 'SENT', 'FAILED'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  sentAt: timestamp('sent_at'),
});
