import { NextResponse } from 'next/server';
import { db } from '@/db';
import { batches, products, notifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getBatchForecast, getSettings } from '@/lib/actions';
import { sendAlertEmail } from '@/lib/email';
import { calculateExpiryRisk } from '@/lib/expiry';

export async function POST() {
  try {
    const appSettings = await getSettings();
    
    if (!appSettings.alertsEnabled) {
      return NextResponse.json({ success: true, message: 'Alerts disabled in settings.', alertsGenerated: 0 });
    }

    const activeBatches = await db.select({
      id: batches.id,
      batchId: batches.batchId,
      productId: batches.productId,
      quantity: batches.quantity,
      expiryDate: batches.expiryDate,
      productName: products.name,
    })
    .from(batches)
    .innerJoin(products, eq(batches.productId, products.id))
    .where(eq(batches.status, 'ACTIVE'));

    let alertsGenerated = 0;

    for (const b of activeBatches) {
      const { risk } = calculateExpiryRisk(b.expiryDate);
      
      // Check configured risk levels
      if (risk === 'EXPIRED' && !appSettings.alertExpired) continue;
      if (risk === 'CRITICAL' && !appSettings.alertCriticalRisk) continue;
      if (risk === 'HIGH' && !appSettings.alertHighRisk) continue;
      
      if (risk !== 'CRITICAL' && risk !== 'HIGH' && risk !== 'EXPIRED') continue;

      const forecast = await getBatchForecast(b.id);
      if (!forecast) continue;

      // Skip if it sells out normally
      if (forecast.recommendedAction === 'SELL_NORMALLY' && risk !== 'EXPIRED') continue;

      // Check if we already sent an alert for this exact risk level on this batch recently
      // For this phase, we'll just check if ANY pending or sent alert of this type exists for this batch
      const existing = await db.select().from(notifications).where(
        and(
          eq(notifications.batchId, b.id),
          eq(notifications.type, risk)
        )
      ).limit(1);

      if (existing.length > 0) continue; // Deduplication logic: already alerted for this state

      // 1. Log to notifications table
      await db.insert(notifications).values({
        batchId: b.id,
        type: risk,
        status: 'PENDING',
      });

      // 2. Generate Email Content
      let actionText = '';
      if (forecast.recommendedAction === 'DISCOUNT_RECOMMENDED') {
        actionText = `DISCOUNT RECOMMENDED: Apply a ${forecast.recommendedDiscount}% discount immediately.`;
      } else {
        actionText = `IMMEDIATE INTERVENTION REQUIRED. Batch unlikely to sell out normally.`;
      }

      const body = `
Expiry Alert: ${risk} RISK
Product: ${b.productName}
Batch ID: ${b.batchId}
Current Quantity: ${b.quantity}
Days to Expiry: ${forecast.daysToExpiry}
Predicted Waste: ${Math.ceil(forecast.expectedWastage)} units

ACTION: ${actionText}
      `.trim();

      // 3. Send Email
      const success = await sendAlertEmail({
        to: appSettings.ownerEmail,
        subject: `[${risk}] Expiry Alert for ${b.productName}`,
        body,
      });

      // 4. Update status
      await db.update(notifications)
        .set({ status: success ? 'SENT' : 'FAILED', sentAt: success ? new Date() : null })
        .where(and(eq(notifications.batchId, b.id), eq(notifications.type, risk)));

      if (success) alertsGenerated++;
    }

    return NextResponse.json({ success: true, alertsGenerated });
  } catch (error: unknown) {
    console.error("Alert Cron Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
