import { getWasteLogs, getInventoryBatches } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RecordWasteForm } from "@/components/waste/RecordWasteForm";

export default async function WasteLogPage() {
  const wasteLogs = await getWasteLogs();
  const activeBatches = (await getInventoryBatches()).filter(b => b.status === "ACTIVE");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Waste Log</h1>
        <p className="text-sm text-muted-foreground">
          Record and view all wasted inventory.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <RecordWasteForm activeBatches={activeBatches} />
        </div>

        <div className="md:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Recent Waste Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Batch ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wasteLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No waste records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      wasteLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs whitespace-nowrap">{new Date(log.date).toLocaleString()}</TableCell>
                          <TableCell className="font-mono text-xs">{log.batchId}</TableCell>
                          <TableCell>{log.productName}</TableCell>
                          <TableCell className="text-right font-medium text-status-waste">{log.quantity}</TableCell>
                          <TableCell>{log.reason}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
