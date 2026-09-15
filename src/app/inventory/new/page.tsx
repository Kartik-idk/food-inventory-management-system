import { getProducts } from "@/lib/actions";
import { ReceiveBatchForm } from "@/components/inventory/ReceiveBatchForm";

export default async function NewBatchPage() {
  const products = await getProducts();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Receive New Batch</h1>
        <p className="text-sm text-muted-foreground">
          Register incoming stock, assign expiration dates, and print QR tracking labels.
        </p>
      </div>

      <ReceiveBatchForm initialProducts={products} />
    </div>
  );
}
