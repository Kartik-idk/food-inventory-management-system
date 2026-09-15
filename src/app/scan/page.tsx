'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scanner } from '@yudiel/react-qr-scanner';
import { getInternalIdByBatchId } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, ArrowLeft, QrCode } from 'lucide-react';
import Link from 'next/link';

export default function ScanPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [manualId, setManualId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const processBatchId = async (batchId: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      const internalId = await getInternalIdByBatchId(batchId);
      if (internalId) {
        router.push(`/inventory/${internalId}`);
      } else {
        setError(`Batch ID "${batchId}" not found in database.`);
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while looking up the batch.");
      setIsProcessing(false);
    }
  };

  const handleScan = (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0 && detectedCodes[0].rawValue) {
      const raw = detectedCodes[0].rawValue;
      try {
        const payload = JSON.parse(raw);
        if (payload.batchId) {
          processBatchId(payload.batchId);
        } else {
          setError("Invalid QR Code format. Missing batchId.");
        }
      } catch (e) {
        setError("Invalid QR Code format. Not a valid JSON payload.");
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    processBatchId(manualId.trim());
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-4">
      <div className="flex items-center space-x-2">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Scan QR Code</h1>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Point your camera at a batch QR sticker to instantly view its details and record waste or sales.
      </p>

      <div className="bg-muted/30 rounded-xl overflow-hidden border shadow-sm p-4 relative">
        <div className="rounded-lg overflow-hidden relative" style={{ aspectRatio: '1/1' }}>
          <Scanner 
            onScan={handleScan}
            onError={(err) => setError(err.message || "Failed to access camera.")}
          />
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive/20 text-destructive text-sm rounded-md p-4 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold leading-none">Scanning Error</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="bg-card border rounded-lg p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-medium flex items-center gap-2 text-foreground">
          <QrCode className="h-4 w-4" />
          Manual Fallback
        </h2>
        <p className="text-xs text-muted-foreground">
          If scanning fails, manually enter the Batch ID printed below the QR code.
        </p>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <Input 
            placeholder="e.g. BATCH-20260915-4848"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            disabled={isProcessing}
            required
          />
          <Button type="submit" disabled={isProcessing || !manualId.trim()}>
            {isProcessing ? "Loading..." : "Submit"}
          </Button>
        </form>
      </div>
    </div>
  );
}
