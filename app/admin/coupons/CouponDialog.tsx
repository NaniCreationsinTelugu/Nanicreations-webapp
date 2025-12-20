"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { saveCoupon } from "@/lib/actions/coupons";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface Coupon {
    id: number;
    code: string;
    type: "percentage" | "fixed";
    value: string;
    minCartValue?: string;
    maxDiscount?: string;
    startDate?: Date;
    endDate?: Date;
    usageLimit?: number;
    usageLimitPerUser?: number;
    isActive: boolean;
}

interface CouponDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    coupon?: Coupon | null;
    onSuccess: () => void;
}

export default function CouponDialog({
    open,
    onOpenChange,
    coupon,
    onSuccess,
}: CouponDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        type: "percentage",
        value: "",
        minCartValue: "",
        maxDiscount: "",
        startDate: "",
        endDate: "",
        usageLimit: "",
        usageLimitPerUser: "",
        isActive: true,
    });

    useEffect(() => {
        if (coupon) {
            setFormData({
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                minCartValue: coupon.minCartValue || "",
                maxDiscount: coupon.maxDiscount || "",
                startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : "",
                endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 16) : "",
                usageLimit: coupon.usageLimit?.toString() || "",
                usageLimitPerUser: coupon.usageLimitPerUser?.toString() || "",
                isActive: coupon.isActive,
            });
        } else {
            setFormData({
                code: "",
                type: "percentage",
                value: "",
                minCartValue: "",
                maxDiscount: "",
                startDate: "",
                endDate: "",
                usageLimit: "",
                usageLimitPerUser: "",
                isActive: true,
            });
        }
    }, [coupon, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await saveCoupon({
                id: coupon?.id,
                code: formData.code.toUpperCase(),
                type: formData.type as "percentage" | "fixed",
                value: formData.value,
                minCartValue: formData.minCartValue || null,
                maxDiscount: formData.maxDiscount || null,
                startDate: formData.startDate ? new Date(formData.startDate) : null,
                endDate: formData.endDate ? new Date(formData.endDate) : null,
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
                usageLimitPerUser: formData.usageLimitPerUser ? parseInt(formData.usageLimitPerUser) : null,
                isActive: formData.isActive,
            });

            toast.success(coupon ? "Coupon updated" : "Coupon created");
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to save coupon");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {coupon ? "Edit Coupon" : "Create Coupon"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Coupon Code</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="SUMMER2025"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Discount Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="value">Discount Value</Label>
                                <Input
                                    id="value"
                                    type="number"
                                    step="0.01"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    placeholder={formData.type === 'percentage' ? "10" : "100"}
                                    required
                                />
                            </div>
                            {formData.type === 'percentage' && (
                                <div className="space-y-2">
                                    <Label htmlFor="maxDiscount">Max Discount (₹)</Label>
                                    <Input
                                        id="maxDiscount"
                                        type="number"
                                        step="0.01"
                                        value={formData.maxDiscount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                        placeholder="Optional limit"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="minCartValue">Min Cart Value (₹)</Label>
                            <Input
                                id="minCartValue"
                                type="number"
                                step="0.01"
                                value={formData.minCartValue}
                                onChange={(e) => setFormData({ ...formData, minCartValue: e.target.value })}
                                placeholder="Optional"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="usageLimit">Total Usage Limit</Label>
                                <Input
                                    id="usageLimit"
                                    type="number"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    placeholder="Unlimited"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="usageLimitPerUser">Limit Per User</Label>
                                <Input
                                    id="usageLimitPerUser"
                                    type="number"
                                    value={formData.usageLimitPerUser}
                                    onChange={(e) => setFormData({ ...formData, usageLimitPerUser: e.target.value })}
                                    placeholder="Unlimited"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                            />
                            <Label htmlFor="isActive">Active</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : coupon ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
