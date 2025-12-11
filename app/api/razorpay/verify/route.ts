import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db/drizzle";
import { enrollment, orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !type) {
            return NextResponse.json(
                { status: "failure", error: "Missing required parameters" },
                { status: 400 }
            );
        }

        const secret = process.env.RAZORPAY_KEY_SECRET || "3TjFP7UY25fD4hXUXCyYDSck";
        const generated_signature = crypto
            .createHmac("sha256", secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature === razorpay_signature) {
            // Payment verified
            if (type === "course") {
                // Check if enrollment exists
                const existingEnrollment = await db
                    .select()
                    .from(enrollment)
                    .where(eq(enrollment.razorpayOrderId, razorpay_order_id))
                    .limit(1);

                if (!existingEnrollment || existingEnrollment.length === 0) {
                    console.error("Enrollment not found for order:", razorpay_order_id);
                    return NextResponse.json(
                        { status: "failure", error: "Enrollment not found" },
                        { status: 404 }
                    );
                }

                // Update enrollment status
                await db
                    .update(enrollment)
                    .set({
                        paymentStatus: "completed",
                        razorpayPaymentId: razorpay_payment_id
                    })
                    .where(eq(enrollment.razorpayOrderId, razorpay_order_id));

                console.log("Course enrollment completed for order:", razorpay_order_id);
            } else if (type === "cart") {
                await db
                    .update(orders)
                    .set({
                        status: "paid",
                        razorpayPaymentId: razorpay_payment_id
                    })
                    .where(eq(orders.razorpayOrderId, razorpay_order_id));

                console.log("Cart order payment completed for order:", razorpay_order_id);
            }

            return NextResponse.json({ status: "success" });
        } else {
            console.error("Payment signature verification failed");
            return NextResponse.json(
                { status: "failure", error: "Invalid signature" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Verification Error:", error);
        return NextResponse.json(
            { status: "failure", error: "Verification failed" },
            { status: 500 }
        );
    }
}
