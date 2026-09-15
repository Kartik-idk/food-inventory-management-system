"use client";

import { useState } from "react";
import { recordWaste } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function RecordWasteForm({ activeBatches }: { activeBatches: { id: number; batchId: string; productName: string; quantity: number }[] }) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    const result = await recordWaste(formData);
    
    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
      // Optional: reset form
      (document.getElementById("waste-form") as HTMLFormElement)?.reset();
    } else {
      setError(result.error || "Failed to record waste.");
    }
  }

  return (
    <Card className="shadow-sm border-destructive/20">
      <CardHeader>
        <CardTitle className="text-destructive">Log Waste</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4 border border-destructive/20">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-status-normal/15 text-status-normal text-sm p-3 rounded-md mb-4 border border-status-normal/20">
            Waste recorded successfully.
          </div>
        )}
        <form id="waste-form" action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="batchId">Select Batch</Label>
            <select
              id="batchId"
              name="batchId"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select an active batch...</option>
              {activeBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batchId} - {b.productName} ({b.quantity} left)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Waste Quantity</Label>
            <Input id="quantity" name="quantity" type="number" min="1" required placeholder="e.g. 2" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Waste</Label>
            <select
              id="reason"
              name="reason"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a reason...</option>
              <option value="EXPIRED">Expired</option>
              <option value="DAMAGED">Damaged/Spoiled</option>
              <option value="THEFT">Theft/Lost</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <Button type="submit" variant="destructive" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Recording..." : "Record Waste"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
