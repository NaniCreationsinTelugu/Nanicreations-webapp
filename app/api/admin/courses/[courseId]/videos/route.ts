import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { courseVideo, course } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

interface RouteContext {
    params: Promise<{
        courseId: string;
    }>;
}

// GET - Fetch all videos for a course
export async function GET(request: Request, context: RouteContext) {
    try {
        const { courseId } = await context.params;
        const courseIdNum = parseInt(courseId);

        if (isNaN(courseIdNum)) {
            return NextResponse.json(
                { error: 'Invalid course ID' },
                { status: 400 }
            );
        }

        const videos = await db
            .select()
            .from(courseVideo)
            .where(eq(courseVideo.courseId, courseIdNum))
            .orderBy(asc(courseVideo.order));

        return NextResponse.json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        return NextResponse.json(
            { error: 'Failed to fetch videos' },
            { status: 500 }
        );
    }
}

// POST - Create new video
export async function POST(request: Request, context: RouteContext) {
    try {
        const { courseId } = await context.params;
        const body = await request.json();
        const { title, youtubeUrl, duration, description, order } = body;

        if (!title || !youtubeUrl || !order) {
            return NextResponse.json(
                { error: 'Title, YouTube URL, and order are required' },
                { status: 400 }
            );
        }

        const courseIdNum = parseInt(courseId);
        if (isNaN(courseIdNum)) {
            return NextResponse.json(
                { error: 'Invalid course ID' },
                { status: 400 }
            );
        }

        const [newVideo] = await db.insert(courseVideo).values({
            title,
            youtubeUrl,
            duration: duration || null,
            description: description || null,
            order,
            courseId: courseIdNum,
        }).returning();

        // Update course video count
        const videoCount = await db
            .select()
            .from(courseVideo)
            .where(eq(courseVideo.courseId, courseIdNum));

        await db
            .update(course)
            .set({ videoCount: videoCount.length })
            .where(eq(course.id, courseIdNum));

        return NextResponse.json(newVideo);
    } catch (error) {
        console.error('Error creating video:', error);
        return NextResponse.json(
            { error: 'Failed to create video' },
            { status: 500 }
        );
    }
}

// PUT - Update existing video
export async function PUT(request: Request, context: RouteContext) {
    try {
        const { courseId } = await context.params;
        const body = await request.json();
        const { id, title, youtubeUrl, duration, description, order } = body;

        if (!id || !title || !youtubeUrl || !order) {
            return NextResponse.json(
                { error: 'ID, title, YouTube URL, and order are required' },
                { status: 400 }
            );
        }

        const courseIdNum = parseInt(courseId);
        if (isNaN(courseIdNum)) {
            return NextResponse.json(
                { error: 'Invalid course ID' },
                { status: 400 }
            );
        }

        const [updatedVideo] = await db
            .update(courseVideo)
            .set({
                title,
                youtubeUrl,
                duration: duration || null,
                description: description || null,
                order,
                updatedAt: new Date(),
            })
            .where(eq(courseVideo.id, id))
            .returning();

        if (!updatedVideo) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedVideo);
    } catch (error) {
        console.error('Error updating video:', error);
        return NextResponse.json(
            { error: 'Failed to update video' },
            { status: 500 }
        );
    }
}

// DELETE - Delete video
export async function DELETE(request: Request, context: RouteContext) {
    try {
        const { courseId } = await context.params;
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Video ID is required' },
                { status: 400 }
            );
        }

        const courseIdNum = parseInt(courseId);
        if (isNaN(courseIdNum)) {
            return NextResponse.json(
                { error: 'Invalid course ID' },
                { status: 400 }
            );
        }

        await db.delete(courseVideo).where(eq(courseVideo.id, parseInt(id)));

        // Update course video count
        const videoCount = await db
            .select()
            .from(courseVideo)
            .where(eq(courseVideo.courseId, courseIdNum));

        await db
            .update(course)
            .set({ videoCount: videoCount.length })
            .where(eq(course.id, courseIdNum));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting video:', error);
        return NextResponse.json(
            { error: 'Failed to delete video' },
            { status: 500 }
        );
    }
}
