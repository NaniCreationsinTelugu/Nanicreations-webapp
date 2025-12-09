import { db } from "@/db/drizzle";
import { category } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

// GET all categories
export async function GET() {
    try {
        const categories = await db.select().from(category);
        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}

// POST create new category
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        const newCategory = await db
            .insert(category)
            .values({
                name,
                description: description || null,
            })
            .returning();

        return NextResponse.json(newCategory[0], { status: 201 });
    } catch (error: any) {
        console.error("Error creating category:", error);
        return NextResponse.json(
            { error: "Failed to create category" },
            { status: 500 }
        );
    }
}
