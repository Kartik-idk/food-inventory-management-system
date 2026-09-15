"use client";

import { useState } from "react";
import { generatePosApiKey, revokePosApiKey } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, Key, Trash2, CheckCircle2 } from "lucide-react";
import type { InferSelectModel } from "drizzle-orm";
import type { settings } from "@/db/schema";

type Settings = InferSelectModel<typeof settings>;

export function PosSettingsForm({ settings }: { settings: Settings }) {
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [error, setError] = useState("");
  
  const hasKey = !!settings.posApiKeyHash;

  const handleGenerate = async () => {
    if (!confirm("Generating a new API key will invalidate the old one. Continue?")) return;
    setLoading(true);
    setError("");
    const res = await generatePosApiKey();
    if (res.success) {
      setNewKey(res.key || "");
    } else {
      setError(res.error || "Failed to generate key.");
    }
    setLoading(false);
  };

  const handleRevoke = async () => {
    if (!confirm("Are you sure you want to revoke the POS API key? The integration will stop working immediately.")) return;
    setLoading(true);
    setError("");
    const res = await revokePosApiKey();
    if (res.success) {
      setNewKey("");
    } else {
      setError(res.error || "Failed to revoke key.");
    }
    setLoading(false);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" /> POS Integration API
        </CardTitle>
        <CardDescription>Manage credentials for the POS simulator/API.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {newKey ? (
          <div className="bg-status-normal/10 border border-status-normal/30 p-4 rounded-md space-y-3">
            <div className="flex items-center gap-2 text-status-normal font-semibold">
              <CheckCircle2 className="h-5 w-5" /> Key Generated Successfully
            </div>
            <p className="text-sm">Please copy this key now. For security reasons, it will never be displayed again.</p>
            <div className="bg-background p-3 rounded border font-mono text-sm break-all">
              {newKey}
            </div>
            <Button variant="outline" size="sm" onClick={() => setNewKey("")}>I have copied it</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${hasKey ? 'bg-status-normal' : 'bg-muted-foreground'}`} />
                <span className="text-sm font-medium">Status: {hasKey ? 'Configured' : 'Not Configured'}</span>
              </div>
              {hasKey && (
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleRevoke} disabled={loading}>
                  <Trash2 className="h-4 w-4 mr-2" /> Revoke
                </Button>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              The POS API key is stored securely as a one-way hash in the database.
            </p>
            
            {error && <p className="text-sm text-destructive">{error}</p>}
            
            <Button onClick={handleGenerate} disabled={loading} variant="outline" className="w-full">
              <Key className="h-4 w-4 mr-2" /> {hasKey ? "Regenerate Key" : "Generate Key"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
