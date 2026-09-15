"use client";

import { useState } from "react";
import { updateStoreSettings } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Store, Loader2 } from "lucide-react";
import type { InferSelectModel } from "drizzle-orm";
import type { settings } from "@/db/schema";

type Settings = InferSelectModel<typeof settings>;

export function StoreSettingsForm({ settings }: { settings: Settings }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setMessage("");
    setError("");
    const res = await updateStoreSettings(formData);
    if (res.success) {
      setMessage("Store settings updated.");
    } else {
      setError(res.error || "Failed to update.");
    }
    setLoading(false);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" /> Store Profile
        </CardTitle>
        <CardDescription>Basic information about your business.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input id="storeName" name="storeName" defaultValue={settings.storeName} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerEmail">Owner Email Address</Label>
            <Input id="ownerEmail" name="ownerEmail" type="email" defaultValue={settings.ownerEmail} required />
            <p className="text-xs text-muted-foreground">Alerts will be sent to this address.</p>
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
