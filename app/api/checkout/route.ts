import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db/drizzle";
import { course, paymentSession } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover",
});

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { courseId } = await request.json();

        if (!courseId) {
            return NextResponse.json(
                { error: "Course ID is required" },
                { status: 400 }
            );
        }

        // Get course details
        const courseData = await db
            .select()
            .from(course)
            .where(eq(course.id, courseId))
            .limit(1);

        if (!courseData || courseData.length === 0) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
        }

        const selectedCourse = courseData[0];

        // Create payment session record
        const newPaymentSession = await db
            .insert(paymentSession)
            .values({
                sessionId: "", // Will be updated after Stripe session creation
                userId: user.id,
                courseId: selectedCourse.id,
                amount: selectedCourse.price,
                status: "pending",
            })
            .returning();

        const paymentSessionId = newPaymentSession[0].id;

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: selectedCourse.name,
                            description: selectedCourse.description || "Course",
                        },
                        unit_amount: Math.round(parseFloat(selectedCourse.price as unknown as string) * 100), // Convert to paise
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/success?session_id={CHECKOUT_SESSION_ID}&payment_session_id=${paymentSessionId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses`,
            metadata: {
                courseId: selectedCourse.id.toString(),
                userId: user.id,
                paymentSessionId: paymentSessionId.toString(),
            },
        });

        // Update payment session with Stripe session ID
        await db
            .update(paymentSession)
            .set({ sessionId: session.id })
            .where(eq(paymentSession.id, paymentSessionId));

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
