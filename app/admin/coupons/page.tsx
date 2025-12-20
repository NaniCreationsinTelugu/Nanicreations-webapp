"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import CouponDialog from "./CouponDialog";
import { toast } from "sonner";
import { getCoupons, deleteCoupon } from "@/lib/actions/coupons";

// Fallback date formatter if date-fns is missing
const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
};

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<any | null>(null);

    const loadCoupons = async () => {
        setLoading(true);
        try {
            const data = await getCoupons();
            setCoupons(data);
        } catch (error) {
            toast.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoupons();
    }, []);

    const handleCreate = () => {
        setEditingCoupon(null);
        setDialogOpen(true);
    };

    const handleEdit = (coupon: any) => {
        setEditingCoupon(coupon);
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;

        try {
            await deleteCoupon(id);
            toast.success("Coupon deleted successfully");
            loadCoupons();
        } catch (error: any) {
            toast.error("Failed to delete coupon");
        }
    };

    const handleSuccess = () => {
        loadCoupons();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Coupons</h1>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Coupon
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {coupons.map((coupon) => (
                    <Card key={coupon.id} className={coupon.isActive ? "" : "opacity-60"}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {coupon.code}
                            </CardTitle>
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {coupon.type === "percentage" ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {coupon.minCartValue ? `Min Order: ₹${coupon.minCartValue}` : "No min order"}
                                {coupon.usageLimit ? ` • Limit: ${coupon.usageLimit}` : ""}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {coupon.endDate ? `Expires: ${formatDate(coupon.endDate)}` : "No expiry"}
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(coupon)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(coupon.id)} className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {coupons.length === 0 && !loading && (
                    <div className="col-span-full text-center text-muted-foreground py-10">
                        No coupons found. Create some to offer discounts!
                    </div>
                )}
            </div>

            <CouponDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                coupon={editingCoupon}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
