import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { course } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST - Create new course
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, price, imageUrl, isPublished, isFree } = body;

        if (!name || !price) {
            return NextResponse.json(
                { error: 'Name and price are required' },
                { status: 400 }
            );
        }

        const [newCourse] = await db.insert(course).values({
            name,
            description: description || null,
            price: price.toString(),
            imageUrl: imageUrl || null,
            isPublished: isPublished || false,
            isFree: isFree || false,
            videoCount: 0,
        }).returning();

        return NextResponse.json(newCourse);
    } catch (error) {
        console.error('Error creating course:', error);
        return NextResponse.json(
            { error: 'Failed to create course' },
            { status: 500 }
        );
    }
}

// PUT - Update existing course
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, description, price, imageUrl, isPublished, isFree } = body;

        if (!id || !name || !price) {
            return NextResponse.json(
                { error: 'ID, name, and price are required' },
                { status: 400 }
            );
        }

        const [updatedCourse] = await db
            .update(course)
            .set({
                name,
                description: description || null,
                price: price.toString(),
                imageUrl: imageUrl || null,
                isPublished: isPublished || false,
                isFree: isFree || false,
                updatedAt: new Date(),
            })
            .where(eq(course.id, id))
            .returning();

        if (!updatedCourse) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedCourse);
    } catch (error) {
        console.error('Error updating course:', error);
        return NextResponse.json(
            { error: 'Failed to update course' },
            { status: 500 }
        );
    }
}

// DELETE - Delete course
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Course ID is required' },
                { status: 400 }
            );
        }

        await db.delete(course).where(eq(course.id, parseInt(id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting course:', error);
        return NextResponse.json(
            { error: 'Failed to delete course' },
            { status: 500 }
        );
    }
}
