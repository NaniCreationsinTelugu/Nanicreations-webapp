import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db/drizzle";
import { enrollment, paymentSession } from "@/db/schema";
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

        const { sessionId, paymentSessionId } = await request.json();

        if (!sessionId || !paymentSessionId) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        // Verify the Stripe session
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== "paid") {
            return NextResponse.json(
                { error: "Payment not completed" },
                { status: 400 }
            );
        }

        // Get payment session from database
        const paymentSessionData = await db
            .select()
            .from(paymentSession)
            .where(eq(paymentSession.id, paymentSessionId))
            .limit(1);

        if (!paymentSessionData || paymentSessionData.length === 0) {
            return NextResponse.json(
                { error: "Payment session not found" },
                { status: 404 }
            );
        }

        const payment = paymentSessionData[0];

        // Verify user owns this payment session
        if (payment.userId !== user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if already enrolled
        const existingEnrollment = await db
            .select()
            .from(enrollment)
            .where(eq(enrollment.stripeSessionId, payment.sessionId))
            .limit(1);

        if (existingEnrollment && existingEnrollment.length > 0) {
            return NextResponse.json({
                success: true,
                courseId: payment.courseId,
                message: "Already enrolled",
            });
        }

        // Update payment session status
        await db
            .update(paymentSession)
            .set({
                status: "completed",
            })
            .where(eq(paymentSession.id, paymentSessionId));

        // Create enrollment
        await db.insert(enrollment).values({
            userId: user.id,
            courseId: payment.courseId,
            stripeSessionId: payment.sessionId,
            paymentStatus: "completed",
        });

        return NextResponse.json({
            success: true,
            courseId: payment.courseId,
            message: "Enrollment successful",
        });
    } catch (error: any) {
        console.error("Payment verification error:", error);
        return NextResponse.json(
            { error: error.message || "Payment verification failed" },
            { status: 500 }
        );
    }
}
