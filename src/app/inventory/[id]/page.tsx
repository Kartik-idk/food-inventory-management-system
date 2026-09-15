import { getBatchDetails, getBatchForecast, getSettings } from "@/lib/actions";
import { getBadgeVariant } from "@/lib/expiry";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DiscountSimulator } from "@/components/inventory/DiscountSimulator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const batchId = parseInt(resolvedParams.id, 10);
  const batch = await getBatchDetails(batchId);
  const forecast = await getBatchForecast(batchId);
  const settings = await getSettings();

  if (!batch || !forecast) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Batch Details</h1>
          <p className="text-sm text-muted-foreground">
            {batch.batchId}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{batch.productName}</CardTitle>
            <CardDescription>Barcode: {batch.productBarcode}</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Batch ID</dt>
                <dd className="mt-1 text-sm font-mono">{batch.batchId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  <Badge variant="outline" className={batch.status === "ACTIVE" ? "border-status-normal text-status-normal" : "text-muted-foreground"}>
                    {batch.status}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Quantity Remaining</dt>
                <dd className="mt-1 text-sm">{batch.quantity}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Price per Unit</dt>
                <dd className="mt-1 text-sm">${(batch.price / 100).toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Expiry Date</dt>
                <dd className="mt-1 text-sm">{batch.expiryDate}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Calculated Risk</dt>
                <dd className="mt-1">
                  <Badge className={getBadgeVariant(batch.risk)}>
                    {batch.risk} ({batch.days} days)
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card className="shadow-sm border-purple-100 dark:border-purple-900 bg-purple-50/30 dark:bg-purple-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-purple-900 dark:text-purple-300">Expiry Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground uppercase">Base Velocity</dt>
                  <dd className="mt-1 text-lg font-bold">{forecast.baseVelocity.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">units/day</span></dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground uppercase">Expected Waste</dt>
                  <dd className="mt-1 text-lg font-bold">{Math.ceil(forecast.expectedWastage)} <span className="text-xs font-normal text-muted-foreground">units</span></dd>
                </div>
                
                <div className="col-span-2 pt-2 border-t border-purple-200/50 dark:border-purple-800/50">
                  <dt className="text-xs font-medium text-muted-foreground uppercase">Recommended Action</dt>
                  <dd className="mt-2 text-sm">
                    {forecast.recommendedAction === 'SELL_NORMALLY' && (
                      <div className="text-status-normal font-semibold">
                        ✅ Sell Normally. 
                        <span className="block text-xs font-normal text-muted-foreground mt-1">On track to sell out safely before expiry.</span>
                      </div>
                    )}
                    {forecast.recommendedAction === 'DISCOUNT_RECOMMENDED' && (
                      <div className="text-status-warning font-semibold">
                        ⚠️ Discount Recommended: {forecast.recommendedDiscount}%
                        <span className="block text-xs font-normal text-muted-foreground mt-1">
                          Current velocity is too low. Applying a {forecast.recommendedDiscount}% discount is estimated using a basic elasticity formula to increase velocity enough to clear the stock before expiry.
                        </span>
                      </div>
                    )}
                    {forecast.recommendedAction === 'IMMEDIATE_INTERVENTION' && (
                      <div className="text-status-critical font-semibold">
                        🚨 Immediate Intervention Required
                        <span className="block text-xs font-normal text-muted-foreground mt-1">
                          {forecast.baseVelocity <= 0 ? 'No sales history exists.' : 'Even a maximum 50% discount will not clear this stock in time.'} Consider immediate manual markdown, donation, or disposal prep.
                        </span>
                      </div>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <DiscountSimulator 
            currentStock={batch.quantity}
            expiryDateStr={batch.expiryDate}
            baseVelocity={forecast.baseVelocity}
            productPrice={batch.price}
            maxDiscount={settings.maxDiscountPercentage}
          />
        </div>
      </div>
    </div>
  );
}
