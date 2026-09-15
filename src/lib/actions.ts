'use server';

import { db } from "@/db";
import { products, batches, inventoryTransactions, wasteLogs, notifications } from "@/db/schema";
import { eq, desc, sum, sql, and, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { calculateExpiryRisk } from "./expiry";
import { calculateBaseVelocity, predictBatchOutcome } from "./forecasting";

export async function getDashboardStats() {
  const allBatches = await db
    .select({
      id: batches.id,
      batchId: batches.batchId,
      quantity: batches.quantity,
      expiryDate: batches.expiryDate,
      status: batches.status,
      productName: products.name,
    })
    .from(batches)
    .innerJoin(products, eq(batches.productId, products.id))
    .where(eq(batches.status, "ACTIVE"));

  let totalActiveBatches = 0;
  let expiringSoonCount = 0; // 3-10 days
  let criticalCount = 0; // 0-2 days
  let expiredCount = 0; // < 0 days

  const priorityAlerts = [];

  for (const b of allBatches) {
    totalActiveBatches += 1;
    const { risk, days } = calculateExpiryRisk(b.expiryDate);

    if (risk === "EXPIRED") {
      expiredCount += 1;
      priorityAlerts.push({ ...b, risk, days });
    } else if (risk === "CRITICAL") {
      criticalCount += 1;
      priorityAlerts.push({ ...b, risk, days });
    } else if (risk === "HIGH" || risk === "MEDIUM") {
      expiringSoonCount += 1;
      priorityAlerts.push({ ...b, risk, days });
    }
  }

  // Sort alerts by days ascending
  priorityAlerts.sort((a, b) => a.days - b.days);

  // Take top 5 for dashboard
  const topAlerts = priorityAlerts.slice(0, 5);

  return {
    totalActiveBatches,
    expiringSoonCount,
    criticalCount,
    expiredCount,
    topAlerts,
  };
}

export async function getInventoryBatches() {
  const allBatches = await db
    .select({
      id: batches.id,
      batchId: batches.batchId,
      quantity: batches.quantity,
      expiryDate: batches.expiryDate,
      status: batches.status,
      productId: products.id,
      productName: products.name,
      productBarcode: products.barcode,
    })
    .from(batches)
    .innerJoin(products, eq(batches.productId, products.id))
    .orderBy(batches.expiryDate);
    
  return allBatches.map(b => {
    const { risk, days } = calculateExpiryRisk(b.expiryDate);
    return { ...b, risk, days };
  });
}

export async function getProducts() {
  return await db.select().from(products).orderBy(products.name);
}

export async function registerProduct(formData: FormData) {
  const barcode = formData.get("barcode") as string;
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const priceRaw = formData.get("price") as string;
  const price = Math.round(parseFloat(priceRaw) * 100); // Store in cents

  try {
    const result = await db.insert(products).values({
      barcode,
      name,
      category,
      price,
    }).returning();
    
    revalidatePath("/inventory/new");
    return { success: true, product: result[0] };
  } catch (error: unknown) {
    console.error("Error registering product:", error);
    // Best-effort check for constraint error in Postgres
    if (typeof error === 'object' && error !== null && 'code' in error && (error as {code: string}).code === '23505') {
      return { success: false, error: "A product with this barcode already exists." };
    }
    return { success: false, error: "Failed to register product." };
  }
}

export async function createBatch(formData: FormData) {
  const productId = parseInt(formData.get("productId") as string, 10);
  const quantity = parseInt(formData.get("quantity") as string, 10);
  const expiryDate = formData.get("expiryDate") as string;

  if (isNaN(productId) || isNaN(quantity) || !expiryDate) {
    return { success: false, error: "Invalid form data." };
  }

  // Generate unique human-readable batch ID (BATCH-YYYYMMDD-XXXX)
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
  const batchId = `BATCH-${dateStr}-${randomSuffix}`;

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Create Batch
      const newBatchArray = await tx.insert(batches).values({
        batchId,
        productId,
        quantity,
        expiryDate,
        status: "ACTIVE",
      }).returning();
      
      const newBatch = newBatchArray[0];

      // 2. Log Transaction
      await tx.insert(inventoryTransactions).values({
        batchId: newBatch.id,
        type: "ADD",
        quantity,
      });

      return newBatch;
    });

    // Fetch product barcode to include in QR Payload
    const prod = await db.select({ barcode: products.barcode }).from(products).where(eq(products.id, productId)).limit(1);

    try {
      revalidatePath("/");
      revalidatePath("/inventory");
    } catch {
      // Ignore Next.js cache errors outside of request context
    }

    return { 
      success: true, 
      batch: result, 
      qrPayload: JSON.stringify({
        batchId: result.batchId,
        productBarcode: prod[0]?.barcode || "",
        expiryDate: result.expiryDate
      })
    };
  } catch (error: unknown) {
    console.error("Error creating batch:", error);
    const msg = error instanceof Error ? error.message : "Failed to create batch.";
    return { success: false, error: msg };
  }
}

export async function searchInventory(q: string) {
  if (!q) return [];
  const query = `%${q.toLowerCase()}%`;
  const results = await db
    .select({
      id: batches.id,
      batchId: batches.batchId,
      quantity: batches.quantity,
      expiryDate: batches.expiryDate,
      status: batches.status,
      productId: products.id,
      productName: products.name,
      productBarcode: products.barcode,
    })
    .from(batches)
    .innerJoin(products, eq(batches.productId, products.id))
    .where(
      sql`lower(${products.name}) LIKE ${query} OR lower(${batches.batchId}) LIKE ${query} OR lower(${products.barcode}) LIKE ${query}`
    )
    .orderBy(batches.expiryDate);

  return results.map(b => {
    const { risk, days } = calculateExpiryRisk(b.expiryDate);
    return { ...b, risk, days };
  });
}

export async function getBatchDetails(id: number) {
  const batchRes = await db
    .select({
      id: batches.id,
      batchId: batches.batchId,
      quantity: batches.quantity,
      expiryDate: batches.expiryDate,
      status: batches.status,
      productId: products.id,
      productName: products.name,
      productBarcode: products.barcode,
      price: products.price,
    })
    .from(batches)
    .innerJoin(products, eq(batches.productId, products.id))
    .where(eq(batches.id, id))
    .limit(1);

  if (!batchRes.length) return null;

  const b = batchRes[0];
  const { risk, days } = calculateExpiryRisk(b.expiryDate);
  return { ...b, risk, days };
}

export async function getInternalIdByBatchId(batchIdStr: string) {
  const res = await db.select({ id: batches.id }).from(batches).where(eq(batches.batchId, batchIdStr)).limit(1);
  if (res.length > 0) {
    return res[0].id;
  }
  return null;
}

export async function getWasteLogs() {
  return await db
    .select({
      id: wasteLogs.id,
      quantity: wasteLogs.quantity,
      reason: wasteLogs.reason,
      date: wasteLogs.date,
      batchId: batches.batchId,
      productName: products.name,
      price: products.price,
    })
    .from(wasteLogs)
    .innerJoin(batches, eq(wasteLogs.batchId, batches.id))
    .innerJoin(products, eq(batches.productId, products.id))
    .orderBy(desc(wasteLogs.date));
}

export async function recordWaste(formData: FormData) {
  const batchId = parseInt(formData.get("batchId") as string, 10);
  const quantity = parseInt(formData.get("quantity") as string, 10);
  const reason = formData.get("reason") as string;

  if (isNaN(batchId) || isNaN(quantity) || quantity <= 0 || !reason) {
    return { success: false, error: "Invalid form data." };
  }

  try {
    await db.transaction(async (tx) => {
      const b = await tx.select().from(batches).where(eq(batches.id, batchId)).limit(1);
      if (!b.length) throw new Error("Batch not found.");
      if (b[0].quantity < quantity) throw new Error("Waste quantity exceeds available batch quantity.");

      const newQuantity = b[0].quantity - quantity;
      const newStatus = newQuantity === 0 ? "DEPLETED" : b[0].status;

      await tx.update(batches).set({ quantity: newQuantity, status: newStatus }).where(eq(batches.id, batchId));
      
      await tx.insert(inventoryTransactions).values({
        batchId,
        type: "UPDATE",
        quantity: -quantity,
      });

      await tx.insert(wasteLogs).values({
        batchId,
        quantity,
        reason,
      });
      
      return true;
    });

    try {
      revalidatePath("/waste");
      revalidatePath(`/inventory/${batchId}`);
      revalidatePath("/");
    } catch {
      // Ignore Next.js cache errors outside of request context
    }
    return { success: true };
  } catch (error: unknown) {
    console.error("Error recording waste:", error);
    const msg = error instanceof Error ? error.message : "Failed to record waste.";
    return { success: false, error: msg };
  }
}

export async function getReports() {
  const allBatches = await db.select({
    quantity: batches.quantity,
    status: batches.status,
    price: products.price
  })
  .from(batches)
  .innerJoin(products, eq(batches.productId, products.id));

  let totalInventoryCount = 0;
  let totalInventoryValue = 0;
  let expiredCount = 0;

  for (const b of allBatches) {
    totalInventoryCount += b.quantity;
    totalInventoryValue += b.quantity * b.price;
    if (b.status === "EXPIRED") {
      expiredCount += b.quantity;
    }
  }

  const allWaste = await db.select({
    quantity: wasteLogs.quantity,
    price: products.price
  })
  .from(wasteLogs)
  .innerJoin(batches, eq(wasteLogs.batchId, batches.id))
  .innerJoin(products, eq(batches.productId, products.id));

  let totalWasteCount = 0;
  let totalWasteValue = 0;

  for (const w of allWaste) {
    totalWasteCount += w.quantity;
    totalWasteValue += w.quantity * w.price;
  }

  return {
    totalInventoryCount,
    totalInventoryValue: totalInventoryValue / 100, // back to dollars
    expiredCount,
    totalWasteCount,
    totalWasteValue: totalWasteValue / 100
  };
}

export async function getBatchForecast(batchId: number) {
  // 1. Get the batch and product info
  const batchRes = await db
    .select({
      quantity: batches.quantity,
      expiryDate: batches.expiryDate,
      productId: batches.productId,
      price: products.price,
    })
    .from(batches)
    .innerJoin(products, eq(batches.productId, products.id))
    .where(eq(batches.id, batchId))
    .limit(1);

  if (!batchRes.length) return null;
  const b = batchRes[0];

  // 2. Fetch sales over the last 14 days for this product (across all batches)
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const salesRes = await db
    .select({ totalSold: sum(inventoryTransactions.quantity).mapWith(Number) })
    .from(inventoryTransactions)
    .innerJoin(batches, eq(inventoryTransactions.batchId, batches.id))
    .where(
      and(
        eq(batches.productId, b.productId),
        eq(inventoryTransactions.type, "SALE"),
        gte(inventoryTransactions.date, fourteenDaysAgo)
      )
    );

  const totalSoldInWindow = salesRes[0]?.totalSold || 0;
  
  // 3. Calculate base velocity (units/day)
  const baseVelocity = calculateBaseVelocity(totalSoldInWindow, 14);

  // 4. Predict outcome
  const outcome = predictBatchOutcome({
    currentStock: b.quantity,
    expiryDateStr: b.expiryDate,
    velocity: baseVelocity,
  });

  return {
    ...outcome,
    baseVelocity,
    productPrice: b.price, // stored in cents
  };
}

export async function getRecentAlerts() {
  const recent = await db.select({
    id: notifications.id,
    type: notifications.type,
    status: notifications.status,
    sentAt: notifications.sentAt,
    batchId: batches.batchId,
    internalId: batches.id,
    productName: products.name,
  })
  .from(notifications)
  .innerJoin(batches, eq(notifications.batchId, batches.id))
  .innerJoin(products, eq(batches.productId, products.id))
  .orderBy(desc(notifications.createdAt))
  .limit(5);
  
  return recent;
}
