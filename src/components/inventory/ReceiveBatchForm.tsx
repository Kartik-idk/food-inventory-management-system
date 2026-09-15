"use client";

import { useState } from "react";
import { createBatch, registerProduct } from "@/lib/actions";
import { PrintableQR } from "@/components/inventory/PrintableQR";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface Product {
  id: number;
  barcode: string;
  name: string;
  category: string | null;
  price: number;
}

export function ReceiveBatchForm({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // QR State
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);

  // Loading states
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  async function handleBatchSubmit(formData: FormData) {
    setIsSubmittingBatch(true);
    setError(null);
    const result = await createBatch(formData);
    setIsSubmittingBatch(false);

    if (result.success && result.qrPayload) {
      setGeneratedQR(result.qrPayload);
    } else {
      setError(result.error || "Failed to create batch.");
    }
  }

  async function handleProductSubmit(formData: FormData) {
    setIsSubmittingProduct(true);
    setError(null);
    const result = await registerProduct(formData);
    setIsSubmittingProduct(false);

    if (result.success && result.product) {
      setProducts([...products, result.product].sort((a, b) => a.name.localeCompare(b.name)));
      setIsNewProductOpen(false);
    } else {
      setError(result.error || "Failed to register product.");
    }
  }

  if (generatedQR) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Batch Created Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PrintableQR 
            qrPayload={generatedQR} 
            onDone={() => setGeneratedQR(null)} 
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Batch Details</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4 border border-destructive/20">
            {error}
          </div>
        )}
        <form action={handleBatchSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="productId">Product</Label>
              <Dialog open={isNewProductOpen} onOpenChange={setIsNewProductOpen}>
                <DialogTrigger className="text-primary text-sm font-medium flex items-center hover:underline">
                  <Plus className="h-3 w-3 mr-1" /> New Product
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Register New Product</DialogTitle>
                    <DialogDescription>
                      Add a new master product to the database. You will then be able to receive batches against it.
                    </DialogDescription>
                  </DialogHeader>
                  <form action={handleProductSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode (UPC/EAN)</Label>
                      <Input id="barcode" name="barcode" required placeholder="Scan or type barcode" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input id="name" name="name" required placeholder="e.g. Whole Milk 1Gal" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" name="category" placeholder="e.g. Dairy" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input id="price" name="price" type="number" step="0.01" min="0" required placeholder="0.00" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmittingProduct}>
                      {isSubmittingProduct ? "Registering..." : "Register Product"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <select
              id="productId"
              name="productId"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.barcode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Received</Label>
              <Input id="quantity" name="quantity" type="number" min="1" required placeholder="e.g. 10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiration Date</Label>
              <Input id="expiryDate" name="expiryDate" type="date" required />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" size="lg" disabled={isSubmittingBatch}>
              {isSubmittingBatch ? "Creating Batch & QR..." : "Create Batch & Print QR"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
