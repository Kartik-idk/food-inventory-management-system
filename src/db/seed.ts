import { db } from './index';
import { products, batches, inventoryTransactions, wasteLogs } from './schema';

async function seed() {
  console.log('Clearing existing data...');
  db.delete(wasteLogs).run();
  db.delete(inventoryTransactions).run();
  db.delete(batches).run();
  db.delete(products).run();

  console.log('Seeding products...');
  
  const productsData = [
    { barcode: '8904417306231', name: 'Whole Milk 1Gal', category: 'Dairy', price: 450 },
    { barcode: '8906157900533', name: 'Fresh Spinach 1lb', category: 'Produce', price: 320 },
    { barcode: '1234567890123', name: 'Chicken Breast', category: 'Meat', price: 899 },
    { barcode: '1234567890124', name: 'Heavy Cream', category: 'Dairy', price: 550 },
    { barcode: '1234567890125', name: 'Sourdough Bread', category: 'Bakery', price: 600 },
    { barcode: '1234567890126', name: 'Avocado', category: 'Produce', price: 150 },
    { barcode: '1234567890127', name: 'Ground Beef', category: 'Meat', price: 750 },
    { barcode: '1234567890128', name: 'Eggs (Dozen)', category: 'Dairy', price: 300 },
    { barcode: '1234567890129', name: 'Tomatoes', category: 'Produce', price: 250 },
    { barcode: '1234567890130', name: 'Cheddar Cheese', category: 'Dairy', price: 420 },
  ];

  const insertedProducts = db.insert(products).values(productsData).returning().all();

  console.log('Seeding batches...');
  
  const today = new Date();
  const daysOffset = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const batchesData = [
    // EXPIRED (yesterday)
    { batchId: 'BATCH-20231025-0001', productId: insertedProducts[0].id, expiryDate: daysOffset(-1), quantity: 2, status: 'EXPIRED' as const },
    // CRITICAL (0 days)
    { batchId: 'BATCH-20231026-0002', productId: insertedProducts[1].id, expiryDate: daysOffset(0), quantity: 5, status: 'ACTIVE' as const },
    // CRITICAL (2 days)
    { batchId: 'BATCH-20231028-0003', productId: insertedProducts[2].id, expiryDate: daysOffset(2), quantity: 10, status: 'ACTIVE' as const },
    // HIGH (5 days)
    { batchId: 'BATCH-20231031-0004', productId: insertedProducts[3].id, expiryDate: daysOffset(5), quantity: 8, status: 'ACTIVE' as const },
    // MEDIUM (9 days)
    { batchId: 'BATCH-20231104-0005', productId: insertedProducts[4].id, expiryDate: daysOffset(9), quantity: 15, status: 'ACTIVE' as const },
    // LOW (15 days)
    { batchId: 'BATCH-20231110-0006', productId: insertedProducts[5].id, expiryDate: daysOffset(15), quantity: 30, status: 'ACTIVE' as const },
    // DEPLETED
    { batchId: 'BATCH-20231020-0007', productId: insertedProducts[6].id, expiryDate: daysOffset(20), quantity: 0, status: 'DEPLETED' as const },
  ];

  const insertedBatches = db.insert(batches).values(batchesData).returning().all();

  console.log('Seeding transactions...');
  const transactionsData: { batchId: number; type: "ADD" | "SALE" | "UPDATE"; quantity: number }[] = insertedBatches.map(b => ({
    batchId: b.id,
    type: 'ADD' as const,
    quantity: b.quantity + 2, // Added 2 more than current
  }));
  
  // Add some sales to make current quantity match
  insertedBatches.forEach(b => {
    transactionsData.push({
      batchId: b.id,
      type: 'SALE' as const,
      quantity: 2,
    });
  });

  db.insert(inventoryTransactions).values(transactionsData).run();

  console.log('Seeding waste logs...');
  db.insert(wasteLogs).values([
    { batchId: insertedBatches[0].id, quantity: 1, reason: 'Spoiled in fridge' },
    { batchId: insertedBatches[1].id, quantity: 2, reason: 'Damaged packaging' },
  ]).run();

  console.log('Seed complete!');
}

seed().catch(console.error);
