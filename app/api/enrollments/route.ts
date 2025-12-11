import { db } from "@/db/drizzle";
import { enrollment } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

// GET user's enrollments (protected endpoint)
export async function GET() {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json([]);
        }

        const enrollments = await db
            .select()
            .from(enrollment)
            .where(
                and(
                    eq(enrollment.userId, user.id),
                    eq(enrollment.paymentStatus, "completed")
                )
            );

        return NextResponse.json(enrollments);
    } catch (error) {
        console.error("Error fetching enrollments:", error);
        // Return empty array instead of error object to prevent frontend crashes
        return NextResponse.json([]);
    }
}
