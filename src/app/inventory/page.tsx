import { getInventoryBatches } from "@/lib/actions";
import { getBadgeVariant } from "@/lib/expiry";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function InventoryPage() {
  const batches = await getInventoryBatches();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Manage all active stock and incoming batches.
          </p>
        </div>
        <Link 
          href="/inventory/new"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" /> Receive Batch
        </Link>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>All Batches</CardTitle>
          <CardDescription>Sorted by expiration date.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Batch ID</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No batches found.
                    </TableCell>
                  </TableRow>
                ) : (
                  batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        <Link href={`/inventory/${batch.id}`} className="text-primary hover:underline">
                          {batch.batchId}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">{batch.productName}</TableCell>
                      <TableCell className="text-xs">{batch.productBarcode}</TableCell>
                      <TableCell>{batch.expiryDate} <span className="text-muted-foreground text-xs ml-1">({batch.days}d)</span></TableCell>
                      <TableCell className="text-right">{batch.quantity}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={batch.status === "ACTIVE" ? "border-status-normal text-status-normal" : "text-muted-foreground"}>
                          {batch.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={getBadgeVariant(batch.risk)}>
                          {batch.risk}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
