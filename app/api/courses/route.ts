import { db } from "@/db/drizzle";
import { course } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

// GET all published courses (public endpoint)
export async function GET() {
    try {
        const courses = await db
            .select()
            .from(course)
            .where(eq(course.isPublished, true));

        return NextResponse.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        // Return empty array instead of error object to prevent frontend crashes
        return NextResponse.json([]);
    }
}
