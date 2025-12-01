import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db/drizzle';
import { course, paymentSession } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please sign in to enroll.' },
                { status: 401 }
            );
        }

        const { courseId } = await req.json();

        if (!courseId) {
            return NextResponse.json(
                { error: 'Course ID is required' },
                { status: 400 }
            );
        }

        // Fetch course details
        const [courseData] = await db
            .select()
            .from(course)
            .where(eq(course.id, courseId))
            .limit(1);

        if (!courseData) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr', // Changed to INR for Indian Stripe account
                        product_data: {
                            name: courseData.title,
                            description: courseData.description,
                            images: courseData.thumbnail ? [courseData.thumbnail] : [],
                        },
                        unit_amount: Math.round(parseFloat(courseData.price) * 100), // Convert to paise
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses?canceled=true`,
            metadata: {
                courseId: courseId.toString(),
                userId: user.id,
            },
        });

        // Store payment session in database
        await db.insert(paymentSession).values({
            stripeSessionId: session.id,
            userId: user.id,
            courseId: courseId,
            amount: courseData.price,
            status: 'pending',
            createdAt: new Date().toISOString(),
            completedAt: null,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
