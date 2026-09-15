import { searchInventory } from "@/lib/actions";
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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const query = (resolvedParams.q as string) || "";
  const results = await searchInventory(query);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Search Results</h1>
        <p className="text-sm text-muted-foreground">
          Showing results for "{query}"
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Inventory Matches</CardTitle>
          <CardDescription>{results.length} found.</CardDescription>
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
                  <TableHead className="text-right">Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No matches found.
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium text-xs">
                        <Link href={`/inventory/${batch.id}`} className="text-primary hover:underline">
                          {batch.batchId}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">{batch.productName}</TableCell>
                      <TableCell className="text-xs">{batch.productBarcode}</TableCell>
                      <TableCell>{batch.expiryDate} <span className="text-muted-foreground text-xs ml-1">({batch.days}d)</span></TableCell>
                      <TableCell className="text-right">{batch.quantity}</TableCell>
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
