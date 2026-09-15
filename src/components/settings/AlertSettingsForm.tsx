"use client";

import { useState } from "react";
import { updateAlertSettings } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Loader2 } from "lucide-react";
import type { InferSelectModel } from "drizzle-orm";
import type { settings } from "@/db/schema";

type Settings = InferSelectModel<typeof settings>;

export function AlertSettingsForm({ settings }: { settings: Settings }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [enabled, setEnabled] = useState(settings.alertsEnabled);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setMessage("");
    setError("");
    const res = await updateAlertSettings(formData);
    if (res.success) {
      setMessage("Alert settings updated.");
    } else {
      setError(res.error || "Failed to update.");
    }
    setLoading(false);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" /> Expiry Alerts
        </CardTitle>
        <CardDescription>Configure the proactive intelligence engine.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-y-0.5">
              <Label htmlFor="alertsEnabled" className="text-base">Enable Alerts</Label>
              <p className="text-sm text-muted-foreground">Master switch for the alert engine.</p>
            </div>
            <div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="alertsEnabled" value="true" className="sr-only peer" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div className={`space-y-4 ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <h4 className="text-sm font-medium">Risk Levels to Notify</h4>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="alertHighRisk" name="alertHighRisk" value="true" defaultChecked={settings.alertHighRisk} className="h-4 w-4 rounded border-gray-300" />
              <Label htmlFor="alertHighRisk" className="font-normal">HIGH Risk (3-10 days)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="alertCriticalRisk" name="alertCriticalRisk" value="true" defaultChecked={settings.alertCriticalRisk} className="h-4 w-4 rounded border-gray-300" />
              <Label htmlFor="alertCriticalRisk" className="font-normal">CRITICAL Risk (0-2 days)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="alertExpired" name="alertExpired" value="true" defaultChecked={settings.alertExpired} className="h-4 w-4 rounded border-gray-300" />
              <Label htmlFor="alertExpired" className="font-normal">EXPIRED (&lt; 0 days)</Label>
            </div>
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
