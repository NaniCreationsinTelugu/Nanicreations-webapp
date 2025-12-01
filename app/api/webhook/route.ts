import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { db } from '@/db/drizzle';
import { enrollment, paymentSession } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
        return NextResponse.json(
            { error: 'No signature provided' },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
        );
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        try {
            const courseId = parseInt(session.metadata?.courseId || '0');
            const userId = session.metadata?.userId;

            if (!courseId || !userId) {
                console.error('Missing metadata in session:', session.id);
                return NextResponse.json(
                    { error: 'Missing metadata' },
                    { status: 400 }
                );
            }

            // Update payment session status
            await db
                .update(paymentSession)
                .set({
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                })
                .where(eq(paymentSession.stripeSessionId, session.id));

            // Create enrollment record
            await db.insert(enrollment).values({
                userId: userId,
                courseId: courseId,
                enrolledAt: new Date().toISOString(),
                paymentSessionId: session.id,
            });

            console.log(`Enrollment created for user ${userId} in course ${courseId}`);
        } catch (error) {
            console.error('Error processing webhook:', error);
            return NextResponse.json(
                { error: 'Failed to process enrollment' },
                { status: 500 }
            );
        }
    }

    return NextResponse.json({ received: true });
}
