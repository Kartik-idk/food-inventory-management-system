import { getReports } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, AlertCircle, DollarSign } from "lucide-react";

export default async function ReportsPage() {
  const reports = await getReports();

  const metrics = [
    {
      title: "Total Inventory Units",
      value: reports.totalInventoryCount.toString(),
      icon: Package,
      color: "text-blue-500",
    },
    {
      title: "Total Inventory Value",
      value: `$${reports.totalInventoryValue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Expired Units in Stock",
      value: reports.expiredCount.toString(),
      icon: AlertTriangle,
      color: "text-status-warning",
    },
    {
      title: "Historical Wasted Units",
      value: reports.totalWasteCount.toString(),
      icon: AlertCircle,
      color: "text-status-waste",
    },
    {
      title: "Total Waste Financial Loss",
      value: `$${reports.totalWasteValue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-status-waste",
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground">
          High-level metrics derived from real-time database transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((m) => (
          <Card key={m.title} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {m.title}
              </CardTitle>
              <m.icon className={`h-5 w-5 ${m.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{m.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
