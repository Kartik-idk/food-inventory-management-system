'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Percent, CheckCircle2 } from 'lucide-react';
import { simulateDiscount, predictBatchOutcome } from '@/lib/forecasting';

interface Props {
  currentStock: number;
  expiryDateStr: string;
  baseVelocity: number;
  productPrice: number;
  maxDiscount: number;
}

export function DiscountSimulator({ currentStock, expiryDateStr, baseVelocity, productPrice, maxDiscount }: Props) {
  const [discountPct, setDiscountPct] = useState(0);

  const currentWastage = predictBatchOutcome({
    currentStock,
    expiryDateStr,
    velocity: baseVelocity,
  }).expectedWastage;

  const simulatedVelocity = simulateDiscount(baseVelocity, discountPct, 2.0);
  const simulatedOutcome = predictBatchOutcome({
    currentStock,
    expiryDateStr,
    velocity: simulatedVelocity,
  });

  const wasteSaved = currentWastage - simulatedOutcome.expectedWastage;
  const financialValueSaved = (wasteSaved * productPrice) / 100;
  
  const originalPrice = productPrice / 100;
  const newPrice = originalPrice * (1 - (discountPct / 100));

  return (
    <Card className="shadow-sm border-blue-100 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Percent className="h-5 w-5 text-blue-600 dark:text-blue-400" /> 
          Discount Intervention Simulator
        </CardTitle>
        <CardDescription>
          Adjust the discount to estimate how it affects sell-out time and minimizes waste.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Discount Level: <Badge variant="secondary" className="ml-2">{discountPct}%</Badge></span>
            <span className="text-sm text-muted-foreground font-mono">
              ${originalPrice.toFixed(2)} → <strong className="text-foreground">${newPrice.toFixed(2)}</strong>
            </span>
          </div>
            <input
              type="range"
              min={0}
              max={maxDiscount}
              step={5}
            value={discountPct}
            onChange={(e) => setDiscountPct(Number(e.target.value))}
            className="w-full accent-blue-600 dark:accent-blue-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-background rounded-lg border flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Simulated Velocity</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{simulatedVelocity.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">units/day</span>
              {discountPct > 0 && <TrendingUp className="h-4 w-4 text-status-normal" />}
            </div>
          </div>
          
          <div className="p-3 bg-background rounded-lg border flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Expected Waste</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{Math.ceil(simulatedOutcome.expectedWastage)}</span>
              <span className="text-xs text-muted-foreground">units</span>
              {wasteSaved > 0 && <TrendingDown className="h-4 w-4 text-status-normal" />}
            </div>
          </div>
        </div>

        {wasteSaved > 0 && (
          <div className="p-3 bg-status-normal/10 text-status-normal rounded-lg border border-status-normal/20 flex items-start gap-3 text-sm">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Intervention Impact</p>
              <p>This discount is predicted to save <strong>{Math.floor(wasteSaved)} units</strong> (${financialValueSaved.toFixed(2)}) from expiration.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
