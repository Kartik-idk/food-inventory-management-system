import { db } from "./src/db";
import { batches, inventoryTransactions } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  try {
    const productId = 1;
    const quantity = 10;
    const expiryDate = "2026-10-15";

    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const batchId = `BATCH-${dateStr}-${randomSuffix}`;

    console.log("Attempting to create batch:", batchId);

    const result = db.transaction((tx) => {
      // 1. Create Batch
      const newBatchArray = tx.insert(batches).values({
        batchId,
        productId,
        quantity,
        expiryDate,
        status: "ACTIVE",
      }).returning().all();
      
      const newBatch = newBatchArray[0];

      // 2. Log Transaction
      tx.insert(inventoryTransactions).values({
        batchId: newBatch.id,
        type: "ADD",
        quantity,
      }).run();

      return newBatch;
    });

    console.log("Success:", result);
  } catch (error) {
    console.error("Error creating batch:", error);
  }
}

run();
