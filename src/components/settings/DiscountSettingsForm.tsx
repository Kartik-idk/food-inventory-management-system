"use client";

import { useState } from "react";
import { updateDiscountSettings } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Percent, Loader2 } from "lucide-react";
import type { InferSelectModel } from "drizzle-orm";
import type { settings } from "@/db/schema";

type Settings = InferSelectModel<typeof settings>;

export function DiscountSettingsForm({ settings }: { settings: Settings }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [discount, setDiscount] = useState(settings.maxDiscountPercentage);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setMessage("");
    setError("");
    const res = await updateDiscountSettings(formData);
    if (res.success) {
      setMessage("Discount settings updated.");
    } else {
      setError(res.error || "Failed to update.");
    }
    setLoading(false);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5" /> Discount Configuration
        </CardTitle>
        <CardDescription>Set boundaries for the forecasting engine.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="maxDiscountPercentage">Maximum Automatic Discount</Label>
              <span className="font-semibold">{discount}%</span>
            </div>
            <input
              type="range"
              id="maxDiscountPercentage"
              name="maxDiscountPercentage"
              min={0}
              max={100}
              step={5}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              This sets the ceiling for mathematical elasticity estimation. The engine will never recommend a discount higher than this value.
            </p>
          </div>
          
          {message && <p className="text-sm text-status-normal">{message}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
