'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Terminal, ShoppingCart, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function POSSimulatorPage() {
  const [apiKey, setApiKey] = useState('');
  const [barcode, setBarcode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].split('.')[0]}] ${msg}`]);
  };

  const handleSimulateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      addLog('ERROR: API Key is required');
      return;
    }
    if (!barcode || quantity <= 0) return;

    setLoading(true);
    addLog(`Initiating sale for barcode: ${barcode}, qty: ${quantity}...`);

    try {
      const res = await fetch('/api/pos/sale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          barcode,
          quantity,
          timestamp: new Date().toISOString()
        })
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        addLog(`SUCCESS: Sale completed atomically.`);
        data.allocations.forEach((alloc: { batchId: string; quantityDeducted: number }) => {
          addLog(` -> Allocated ${alloc.quantityDeducted} units from ${alloc.batchId}`);
        });
        setBarcode('');
        setQuantity(1);
      } else {
        addLog(`ERROR: ${data.error || 'Request failed'}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`NETWORK ERROR: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">POS Integration Simulator</h1>
          <p className="text-sm text-muted-foreground">
            A software-only demonstration of the FEFO API endpoint for external Point-of-Sale systems.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cashier Register
            </CardTitle>
            <CardDescription>Simulate scanning a product barcode.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSimulateSale} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Integration API Key</Label>
                <Input 
                  id="apiKey" 
                  type="password"
                  placeholder="Paste your POS_API_KEY" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Product Barcode</Label>
                <Input 
                  id="barcode" 
                  placeholder="e.g. 0123456789" 
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity Sold</Label>
                <Input 
                  id="quantity" 
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !barcode || !apiKey}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Process Sale via API
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-zinc-950 text-zinc-50 border-zinc-800">
          <CardHeader className="pb-3 border-b border-zinc-800">
            <CardTitle className="text-sm font-mono flex items-center gap-2 text-zinc-300">
              <Terminal className="h-4 w-4" />
              Integration Log
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-48 overflow-y-auto font-mono text-xs space-y-1">
              {logs.length === 0 ? (
                <div className="text-zinc-600 italic">Waiting for incoming API requests...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={log.includes('ERROR') ? 'text-red-400' : log.includes('SUCCESS') ? 'text-green-400' : 'text-zinc-300'}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
