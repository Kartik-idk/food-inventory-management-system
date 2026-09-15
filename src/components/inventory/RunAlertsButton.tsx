'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function RunAlertsButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRunAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cron/alerts', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Alert Engine ran successfully. Generated ${data.alertsGenerated} new alert(s).`);
      } else {
        alert(`Failed to run alerts: ${data.error}`);
      }
    } catch {
      alert("Network error running alerts.");
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleRunAlerts} disabled={loading} className="bg-white/50 dark:bg-black/50">
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
      Trigger Engine
    </Button>
  );
}
