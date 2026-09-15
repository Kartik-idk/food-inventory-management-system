import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products, batches, inventoryTransactions } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getSettings } from '@/lib/actions';
import { createHash } from 'crypto';

export async function POST(request: Request) {
  try {
    const appSettings = await getSettings();
    if (!appSettings.posApiKeyHash) {
      return NextResponse.json({ success: false, error: 'Internal Server Error. POS API Key is not configured.' }, { status: 500 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Missing API Key.' }, { status: 401 });
    }

    const providedKey = authHeader.split(' ')[1];
    const providedHash = createHash('sha256').update(providedKey).digest('hex');

    if (providedHash !== appSettings.posApiKeyHash) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Invalid API Key.' }, { status: 401 });
    }

    const body = await request.json();
    const { barcode, quantity, timestamp } = body;

    if (!barcode || typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid request payload.' }, { status: 400 });
    }

    // 1. Resolve product by barcode
    const prodRes = await db.select().from(products).where(eq(products.barcode, barcode)).limit(1);
    if (!prodRes.length) {
      return NextResponse.json({ success: false, error: 'Product not found for the given barcode.' }, { status: 404 });
    }
    const product = prodRes[0];

    const allocations: { batchId: string; quantityDeducted: number }[] = [];

    // 2. Perform FEFO Allocation atomically
    await db.transaction(async (tx) => {
      // Query active batches, ordered by expiryDate (First Expiry, First Out)
      const activeBatches = await tx
        .select()
        .from(batches)
        .where(eq(batches.productId, product.id))
        .orderBy(asc(batches.expiryDate));

      const availableBatches = activeBatches.filter(b => b.status === 'ACTIVE' && b.quantity > 0);

      const totalAvailable = availableBatches.reduce((acc, b) => acc + b.quantity, 0);

      if (totalAvailable < quantity) {
        throw new Error(`Insufficient stock. Requested ${quantity}, but only ${totalAvailable} available.`);
      }

      let remainingToFulfill = quantity;
      
      for (const b of availableBatches) {
        if (remainingToFulfill <= 0) break;

        const amountToDeduct = Math.min(b.quantity, remainingToFulfill);
        const newQuantity = b.quantity - amountToDeduct;
        const newStatus = newQuantity === 0 ? 'DEPLETED' : 'ACTIVE';

        // Update batch
        await tx.update(batches)
          .set({ quantity: newQuantity, status: newStatus })
          .where(eq(batches.id, b.id));

        // Record transaction
        await tx.insert(inventoryTransactions).values({
          batchId: b.id,
          type: 'SALE',
          quantity: amountToDeduct,
          date: timestamp ? new Date(timestamp) : new Date(),
        });

        allocations.push({
          batchId: b.batchId,
          quantityDeducted: amountToDeduct
        });

        remainingToFulfill -= amountToDeduct;
      }

      if (remainingToFulfill > 0) {
        throw new Error("Failed to fulfill entire quantity due to a race condition or logic error.");
      }
    });

    try {
      revalidatePath('/');
      revalidatePath('/inventory');
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, allocations });

  } catch (error: unknown) {
    console.error("POS Sale API Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message || 'Internal Server Error' }, { status: 400 });
  }
}
