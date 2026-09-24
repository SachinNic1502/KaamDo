"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Plus, Tag, Gift, TrendingUp } from "lucide-react";
import { useRef, useState } from "react";
import { api } from "@/lib/api-client";
import { usePromotions } from "@/hooks/use-api";

export default function PromotionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const promoCodeInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const discountTypeRef = useRef<HTMLSelectElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);
  const minOrderAmountInputRef = useRef<HTMLInputElement>(null);
  const maxDiscountInputRef = useRef<HTMLInputElement>(null);
  const startDateInputRef = useRef<HTMLInputElement>(null);
  const endDateInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = usePromotions({ search: searchQuery || undefined, limit: 50 });
  const promos = (data?.data ?? []) as Record<string, unknown>[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promotions</h1>
          <p className="text-muted-foreground">Manage promo codes and featured listings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" />
            Create Promo Code
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Promo Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Promo Code</Label>
                <Input placeholder="e.g., SUMMER30" ref={promoCodeInputRef} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Describe the offer" ref={descriptionTextareaRef} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Discount Type</Label>
                  <select className="w-full px-3 py-2 border rounded-md text-sm" ref={discountTypeRef}>
                    <option>Percentage</option>
                    <option>Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <Label>Value</Label>
                  <Input type="number" ref={valueInputRef} placeholder="e.g., 30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min Order Amount</Label>
                  <Input type="number" ref={minOrderAmountInputRef} placeholder="₹500" />
                </div>
                <div>
                  <Label>Max Discount</Label>
                  <Input type="number" ref={maxDiscountInputRef} placeholder="₹200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" ref={startDateInputRef} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" ref={endDateInputRef} />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  const code = promoCodeInputRef.current?.value || "";
                  const description = descriptionTextareaRef.current?.value || "";
                  const type = discountTypeRef.current?.value || "percentage";
                  const value = parseInt(valueInputRef.current?.value || "0", 10);
                  const minOrderAmount = parseInt(minOrderAmountInputRef.current?.value || "0", 10);
                  const maxDiscount = parseInt(maxDiscountInputRef.current?.value || "0", 10);
                  const startDate = startDateInputRef.current?.value || "";
                  const endDate = endDateInputRef.current?.value || "";
                  
                  if (!code || !description || !value) {
                    alert("Please fill in all required fields");
                    return;
                  }
                  
                  api.post("/api/promotions", {
                    code,
                    description,
                    type,
                    value,
                    minOrderAmount,
                    maxDiscount,
                    startDate,
                    endDate,
                  }).then(() => setIsDialogOpen(false)).catch(() => alert("Failed to create promo code"));
                }}
              >
                Create Promo Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Promos</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{Array.isArray(promos) ? promos.filter((p: Record<string, unknown>) => p.isActive).length : 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Promos</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{Array.isArray(promos) ? promos.length : 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{Array.isArray(promos) ? promos.reduce((sum: number, p: Record<string, unknown>) => sum + (p.usedCount as number || 0), 0) : 0}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Promo Codes</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search promo codes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(promos) ? promos : []).map((promo: Record<string, unknown>) => (
                <TableRow key={promo._id as string}>
                  <TableCell className="font-mono font-medium">{promo.code as string}</TableCell>
                  <TableCell>{promo.description as string}</TableCell>
                  <TableCell>
                    {promo.type === "percentage" ? `${promo.value}%` : `₹${promo.value}`}
                    {(promo.maxDiscount as number) > 0 && ` (max ₹${promo.maxDiscount})`}
                  </TableCell>
                  <TableCell>₹{promo.minOrderAmount as number}</TableCell>
                  <TableCell>{promo.usedCount as number}/{promo.usageLimit as number}</TableCell>
                  <TableCell>{String(promo.startDate).slice(0, 10)} → {String(promo.endDate).slice(0, 10)}</TableCell>
                  <TableCell>
                    <Badge variant={promo.isActive ? "default" : "secondary"}>
                      {promo.isActive ? "Active" : "Expired"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Featured Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Featured listings will appear here once workers subscribe to premium plans.</p>
        </CardContent>
      </Card>
    </div>
  );
}
