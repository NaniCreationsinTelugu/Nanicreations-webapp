import { db } from "@/db/drizzle";
import { category } from "@/db/schema";
import { NextResponse } from "next/server";

// GET all categories (public endpoint)
export async function GET() {
    try {
        const categories = await db.select().from(category);

        // Transform categories to include slug
        const transformedCategories = categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
            description: cat.description,
        }));

        return NextResponse.json(transformedCategories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        // Return empty array instead of error object to prevent frontend crashes
        return NextResponse.json([]);
    }
}
