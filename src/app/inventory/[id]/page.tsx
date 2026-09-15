import { getBatchDetails } from "@/lib/actions";
import { getBadgeVariant } from "@/lib/expiry";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const batch = await getBatchDetails(parseInt(resolvedParams.id, 10));

  if (!batch) {
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
    </div>
  );
}
