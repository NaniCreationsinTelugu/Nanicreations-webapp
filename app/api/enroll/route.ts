import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db/drizzle';
import { course, enrollment } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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

        // Check if already enrolled
        const [existingEnrollment] = await db
            .select()
            .from(enrollment)
            .where(
                and(
                    eq(enrollment.userId, user.id),
                    eq(enrollment.courseId, courseId)
                )
            )
            .limit(1);

        if (existingEnrollment) {
            return NextResponse.json(
                { error: 'Already enrolled in this course' },
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

        // Get the next available ID
        const existingEnrollments = await db.select().from(enrollment);
        const maxId = existingEnrollments.length > 0
            ? Math.max(...existingEnrollments.map(e => e.id))
            : 0;
        const nextId = maxId + 1;

        // Create enrollment directly (no payment required)
        await db.insert(enrollment).values({
            id: nextId,
            userId: user.id,
            courseId: courseId,
            enrolledAt: new Date().toISOString(),
            paymentSessionId: null,
        });

        return NextResponse.json({
            success: true,
            message: 'Successfully enrolled in course',
            courseId: courseId
        });
    } catch (error) {
        console.error('Enrollment error:', error);
        return NextResponse.json(
            { error: 'Failed to enroll in course' },
            { status: 500 }
        );
    }
}
