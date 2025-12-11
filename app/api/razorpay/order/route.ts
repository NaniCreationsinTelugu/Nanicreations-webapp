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
            let shippingCost = 0;
            if (shippingMethod === "fast") {
                shippingCost = 1500; // 15.00 INR? Or USD? Assuming INR based on Razorpay context, let's stick to provided requirement: "Fast shipping"
                // Wait, user said "$15.00" in plan? No, user said "Standard Shipping; fast shipping".
                // In plan I wrote: Standard (Free > 50, else 5.99), Fast (15.00).
                // Since Razorpay is usually INR, let's assume the store currency is USD but we convert to INR for Razorpay?
                // Or is the store in INR?
                // The existing code for course checkout used "INR".
                // Existing cart code used "$" symbol.
                // I should probably convert USD to INR or just assume the store is now INR.
                // Given the keys are Test keys and usually Razorpay is INR, but supports others.
                // Let's assume 1 USD = 85 INR roughly if we need conversion, OR just treat the numbers as INR if the previous code was mixed.
                // Wait, `app/api/checkout/route.ts` (Stripe) used `currency: "inr"` but `unit_amount` was `selectedCourse.price * 100`.
                // `db/schema.ts` has price as decimal.
                // The Cart page `app/(marketing)/cart/page.tsx` displays `$`.
                // This is conflicting. I will assume the db values are in the currency displayed ($), but Razorpay needs INR (or we charge in USD if enabled).
                // Safest bet: Charge the amount in INR representing the USD value (simple 1:1 for number? No that's too cheap).
                // Or maybe just charge in INR.
                // Let's look at the previous Stripe code again...
                // `currency: "inr"`, `unit_amount: Math.round(parseFloat(selectedCourse.price) * 100)`
                // So a price of 200 (displaying as $) would handle as 200 INR. That's weird but that's what was there.
                // I will stick to INR for Razorpay.
                // If the user selects "Fast Shipping" ($15), I will add 15 to the total.

                shippingCost = 15;
            } else {
                // Standard
                if (subtotal > 50) {
                    shippingCost = 0;
                } else {
                    shippingCost = 5.99;
                }
            }

            amount = subtotal + shippingCost;
            notes.address = JSON.stringify(address);
            notes.shippingMethod = shippingMethod;
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        const options = {
            amount: Math.round(amount * 100), // amount in the smallest currency unit
            currency: currency,
            receipt: receipt,
            notes: notes,
        };

        const order = await razorpay.orders.create(options);

        // Create a local order record
        if (type === "cart") {
            const newOrder = await db.insert(orders).values({
                userId: user.id,
                totalAmount: amount.toString(),
                status: "pending",
                address: JSON.stringify(address),
                shippingMethod: shippingMethod,
                razorpayOrderId: order.id,
                razorpayPaymentId: "", // Will be filled on verify
            }).returning();

            // Create order items
            // We need to fetch product details again or use the ones we fetched
            // Ideally we should use the fetched products to ensure valid IDs
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
                    });
                }
            }
        } else if (type === "course") {
            // Create enrollment record with pending status
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
            key: process.env.RAZORPAY_KEY_ID || "rzp_test_RqFoSVGWefVuB0", // Send key to client
        });

    } catch (error: any) {
        console.error("Razorpay Order Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
