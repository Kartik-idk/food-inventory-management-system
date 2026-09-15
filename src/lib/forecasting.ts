import { differenceInDays, parseISO, startOfDay } from "date-fns";

export interface ForecastInput {
  currentStock: number;
  expiryDateStr: string;
  velocity: number; // units per day
}

export interface ForecastResult {
  velocity: number;
  daysToExpiry: number;
  predictedDaysToSellOut: number;
  predictedRemainingStock: number;
  expectedWastage: number;
  interventionRecommended: boolean;
}

export function calculateBaseVelocity(totalSales: number, daysBack: number): number {
  if (daysBack <= 0) return 0;
  return totalSales / daysBack;
}

export function predictBatchOutcome({ currentStock, expiryDateStr, velocity }: ForecastInput): ForecastResult {
  const expiryDate = startOfDay(parseISO(expiryDateStr));
  const today = startOfDay(new Date());
  const daysToExpiry = differenceInDays(expiryDate, today);

  const predictedDaysToSellOut = velocity > 0 ? currentStock / velocity : Infinity;
  
  // If already expired, or expires today, daysToExpiry <= 0
  const effectiveDaysToExpiry = Math.max(0, daysToExpiry);

  const predictedRemainingStock = currentStock - (velocity * effectiveDaysToExpiry);
  const expectedWastage = Math.max(0, predictedRemainingStock);
  const interventionRecommended = expectedWastage > 0;

  return {
    velocity,
    daysToExpiry,
    predictedDaysToSellOut,
    predictedRemainingStock,
    expectedWastage,
    interventionRecommended,
  };
}

export function simulateDiscount(
  baseVelocity: number, 
  discountPercentage: number, 
  elasticityFactor: number = 2.0
): number {
  // New Velocity = Base Velocity * (1 + (Discount% * Elasticity Factor))
  const multiplier = 1 + ((discountPercentage / 100) * elasticityFactor);
  return baseVelocity * multiplier;
}
