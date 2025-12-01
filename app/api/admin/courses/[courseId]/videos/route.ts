import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db/drizzle';
import { courseVideo } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId } = await params;
        const courseIdNum = parseInt(courseId);

        const videos = await db
            .select()
            .from(courseVideo)
            .where(eq(courseVideo.courseId, courseIdNum))
            .orderBy(courseVideo.order);

        return NextResponse.json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId } = await params;
        const courseIdNum = parseInt(courseId);
        const { title, youtubeUrl, duration, description, order } = await req.json();

        const newVideo = await db.insert(courseVideo).values({
            courseId: courseIdNum,
            title,
            youtubeUrl,
            duration: duration || null,
            description: description || null,
            order,
        }).returning();

        return NextResponse.json(newVideo[0]);
    } catch (error) {
        console.error('Error creating video:', error);
        return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, title, youtubeUrl, duration, description, order } = await req.json();

        const updatedVideo = await db
            .update(courseVideo)
            .set({
                title,
                youtubeUrl,
                duration: duration || null,
                description: description || null,
                order,
            })
            .where(eq(courseVideo.id, id))
            .returning();

        return NextResponse.json(updatedVideo[0]);
    } catch (error) {
        console.error('Error updating video:', error);
        return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const videoId = searchParams.get('id');

        if (!videoId) {
            return NextResponse.json({ error: 'Video ID required' }, { status: 400 });
        }

        await db.delete(courseVideo).where(eq(courseVideo.id, parseInt(videoId)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting video:', error);
        return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
    }
}
