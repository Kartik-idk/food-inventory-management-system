import { getSettings } from "@/lib/actions";
import { StoreSettingsForm } from "@/components/settings/StoreSettingsForm";
import { AlertSettingsForm } from "@/components/settings/AlertSettingsForm";
import { DiscountSettingsForm } from "@/components/settings/DiscountSettingsForm";
import { PosSettingsForm } from "@/components/settings/PosSettingsForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">System Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your store details, alerting intelligence, and POS integration.
          </p>
        </div>
      </div>

      <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Authentication Pending (Phase 10)</AlertTitle>
        <AlertDescription>
          Currently, anyone with access to the dashboard can view and modify these settings. Multi-user authentication is scheduled for Phase 10. Do not use in a public network environment yet.
        </AlertDescription>
      </Alert>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <StoreSettingsForm settings={settings} />
          <AlertSettingsForm settings={settings} />
        </div>
        <div className="space-y-8">
          <DiscountSettingsForm settings={settings} />
          <PosSettingsForm settings={settings} />
        </div>
      </div>
    </div>
  );
}
