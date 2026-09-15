"use client";

import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import Link from "next/link";

interface PrintableQRProps {
  qrPayload: string; // JSON string
  onDone?: () => void;
}

export function PrintableQR({ qrPayload, onDone }: PrintableQRProps) {
  let parsedPayload: any = {};
  try {
    parsedPayload = JSON.parse(qrPayload);
  } catch (e) {
    console.error("Failed to parse QR payload", e);
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8 bg-white rounded-lg border border-border">
      {/* Hide everything except this section when printing via CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          @page {
            margin: 0;
            size: auto;
          }
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          /* Hide the print button itself */
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div id="print-area" className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg max-w-sm w-full">
        <h3 className="text-lg font-bold mb-4">{parsedPayload.batchId || "Unknown Batch"}</h3>
        
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 inline-block">
          <QRCode
            value={qrPayload}
            size={200}
            level="M"
          />
        </div>

        <div className="w-full space-y-2 text-sm text-center">
          <p><span className="font-semibold text-gray-500">Barcode:</span> <span className="font-mono">{parsedPayload.productBarcode || "N/A"}</span></p>
          <p><span className="font-semibold text-gray-500">Expiry:</span> <span className="font-semibold text-red-600">{parsedPayload.expiryDate || "N/A"}</span></p>
        </div>
      </div>

      <div className="no-print flex space-x-4">
        <Button onClick={handlePrint} size="lg" className="gap-2">
          <Printer className="h-4 w-4" /> Print Sticker
        </Button>
        {onDone ? (
          <Button variant="outline" size="lg" onClick={onDone}>
            Done
          </Button>
        ) : (
          <Link href="/inventory">
            <Button variant="outline" size="lg">
              Return to Inventory
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
