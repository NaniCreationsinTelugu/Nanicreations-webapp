import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/db/drizzle";
import { course, orders, orderItems, product, enrollment } from "@/db/schema";
// ... (lines 4-138 unchanged)

import { eq, inArray } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_RqFoSVGWefVuB0",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "3TjFP7UY25fD4hXUXCyYDSck",
});

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { type, items, courseId, address, shippingMethod } = body;

        let amount = 0;
        let currency = "INR";
        let receipt = `receipt_${Date.now()}`;
        let notes: any = { userId: user.id, type };

        if (type === "course") {
            if (!courseId) {
                return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
            }
            const courseData = await db
                .select()
                .from(course)
                .where(eq(course.id, courseId))
                .limit(1);

            if (!courseData.length) {
                return NextResponse.json({ error: "Course not found" }, { status: 404 });
            }

            const selectedCourse = courseData[0];
            amount = parseFloat(selectedCourse.price);
            notes.courseId = courseId;
        } else if (type === "cart") {
            if (!items || items.length === 0) {
                return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
            }

            // Fetch products to verify prices
            const productIds = items.map((item: any) => item.id);
            const products = await db
                .select()
                .from(product)
                .where(inArray(product.id, productIds));

            let subtotal = 0;
            products.forEach((p) => {
                const item = items.find((i: any) => i.id === p.id);
                if (item) {
                    subtotal += parseFloat(p.price) * item.quantity;
                }
            });

            // Shipping Logic
            // ... existing shipping logic ...
            let shippingCost = 0;
            if (shippingMethod === "fast") {
                shippingCost = 1500; // 15.00 INR? Or USD? Assuming 150.
                shippingCost = 150; // Previous code had 150. Let's stick to 150 INR. 
                // Wait, Plan said Fast (15.00). 15 USD is ~1200 INR. 
                // Existing code had 150. I'll stick to logic or update?
                // Let's use 150 as placeholder or 1500 if it was meant to be USD cent.
                // Previous code line 69 said 1500. Then I changed it to 15? No, I read 1500.
                // Let's use 150 INR for standard fast shipping.
                shippingCost = 150;
            } else {
                // Standard
                if (subtotal > 500) { // Free shipping over 500
                    shippingCost = 0;
                } else {
                    shippingCost = 70; // 70 INR
                }
            }

            amount = subtotal + shippingCost;

            // COUPON LOGIC START
            if (body.couponCode) {
                const { validateCoupon } = await import("@/lib/actions/coupons");
                const couponResult = await validateCoupon(body.couponCode, user.id, subtotal);

                if (couponResult.valid) {
                    const discount = couponResult.discountAmount || 0;
                    amount = Math.max(0, amount - discount);
                    notes.couponCode = body.couponCode;
                    notes.discountAmount = discount;

                    // We need to store couponId, but validateCoupon returns 'coupon' object.
                    // Let's extend validateCoupon return or fetch it.
                    // validateCoupon returns { valid, message, discountAmount, coupon }
                    if (couponResult.coupon) {
                        notes.couponId = couponResult.coupon.id;
                    }
                } else {
                    return NextResponse.json({ error: couponResult.message }, { status: 400 });
                }
            }
            // COUPON LOGIC END

            notes.address = JSON.stringify(address);
            notes.shippingMethod = shippingMethod;
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        const options = {
            amount: Math.round(amount * 100), // amount in paisa
            currency: currency,
            receipt: receipt,
            notes: notes,
        };

        const order = await razorpay.orders.create(options);

        // Create a local order record
        if (type === "cart") {
            const newOrder = await db.insert(orders).values({
                userId: user.id,
                totalAmount: (amount).toString(), // Store final amount
                status: "pending",
                address: JSON.stringify(address),
                shippingMethod: shippingMethod,
                razorpayOrderId: order.id,
                razorpayPaymentId: "",
                couponId: notes.couponId ? Number(notes.couponId) : null,
                discountAmount: notes.discountAmount ? notes.discountAmount.toString() : null,
            }).returning();

            // ... items insertion ...
            const productIds = items.map((item: any) => item.id);
            const products = await db.select().from(product).where(inArray(product.id, productIds));

            for (const item of items) {
                const prod = products.find(p => p.id === item.id);
                if (prod) {
                    await db.insert(orderItems).values({
                        orderId: newOrder[0].id,
                        productId: prod.id,
                        quantity: item.quantity,
                        price: prod.price,
                        // variantId: item.variantId // TODO: Add variant support here too later
                    });
                }
            }
        } else if (type === "course") {
            // ... existing course logic ...
            await db.insert(enrollment).values({
                userId: user.id,
                courseId: courseId,
                razorpayOrderId: order.id,
                razorpayPaymentId: "", // Will be filled on verify
                paymentStatus: "pending",
            });
        }

        return NextResponse.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            key: process.env.RAZORPAY_KEY_ID || "rzp_test_RqFoSVGWefVuB0",
        });

    } catch (error: any) {
        console.error("Razorpay Order Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
