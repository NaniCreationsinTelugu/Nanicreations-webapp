"use server";

import { db } from "@/db/drizzle";
import { coupons, couponUsages } from "@/db/schema";
import { eq, and, gt, lt, desc, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCoupons() {
    return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
}

export async function saveCoupon(data: any) {
    if (data.id) {
        // Update
        const { id, ...updateData } = data;
        await db.update(coupons).set(updateData).where(eq(coupons.id, id));
    } else {
        // Create
        await db.insert(coupons).values(data);
    }
    revalidatePath("/admin/coupons");
    return { success: true };
}

export async function deleteCoupon(id: number) {
    await db.delete(coupons).where(eq(coupons.id, id));
    revalidatePath("/admin/coupons");
    return { success: true };
}

export async function validateCoupon(code: string, userId: string, cartTotal: number) {
    // 1. Find coupon
    const coupon = await db.query.coupons.findFirst({
        where: and(
            eq(coupons.code, code),
            eq(coupons.isActive, true)
        )
    });

    if (!coupon) {
        return { valid: false, message: "Invalid coupon code" };
    }

    // 2. Check dates
    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
        return { valid: false, message: "Coupon is not yet active" };
    }
    if (coupon.endDate && new Date(coupon.endDate) < now) {
        return { valid: false, message: "Coupon has expired" };
    }

    // 3. Check min cart value
    if (coupon.minCartValue && cartTotal < Number(coupon.minCartValue)) {
        return { valid: false, message: `Minimum cart value of ₹${coupon.minCartValue} required` };
    }

    // 4. Check global usage limit
    if (coupon.usageLimit) {
        const usageCount = await db.select({ count: count() }).from(couponUsages).where(eq(couponUsages.couponId, coupon.id));
        if (usageCount[0].count >= coupon.usageLimit) {
            return { valid: false, message: "Coupon usage limit exceeded" };
        }
    }

    // 5. Check per-user limit
    if (coupon.usageLimitPerUser) {
        const userUsage = await db.select({ count: count() }).from(couponUsages).where(
            and(
                eq(couponUsages.couponId, coupon.id),
                eq(couponUsages.userId, userId)
            )
        );
        if (userUsage[0].count >= coupon.usageLimitPerUser) {
            return { valid: false, message: "You have already used this coupon" };
        }
    }

    // 6. Calculate discount
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
        discountAmount = (cartTotal * Number(coupon.value)) / 100;
        if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
            discountAmount = Number(coupon.maxDiscount);
        }
    } else {
        discountAmount = Number(coupon.value);
    }

    // Ensure discount doesn't exceed total
    if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
    }

    return {
        valid: true,
        coupon,
        discountAmount: Number(discountAmount.toFixed(2)),
        message: "Coupon applied successfully"
    };
}

export async function recordCouponUsage(couponId: number, userId: string, orderId: number) {
    await db.insert(couponUsages).values({
        couponId,
        userId,
        orderId,
    });
}
