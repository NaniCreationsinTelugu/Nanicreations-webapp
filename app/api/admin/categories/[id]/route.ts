import { db } from "@/db/drizzle";
import { category, product } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

// PUT update category
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paramId } = await params;
        const id = parseInt(paramId);
        const body = await request.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        const updatedCategory = await db
            .update(category)
            .set({ name, description: description || null })
            .where(eq(category.id, id))
            .returning();

        if (updatedCategory.length === 0) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedCategory[0]);
    } catch (error: any) {
        console.error("Error updating category:", error);
        return NextResponse.json(
            { error: "Failed to update category" },
            { status: 500 }
        );
    }
}

// DELETE category
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paramId } = await params;
        const id = parseInt(paramId);

        // Check if category has products
        const products = await db
            .select()
            .from(product)
            .where(eq(product.categoryId, id))
            .limit(1);

        if (products.length > 0) {
            return NextResponse.json(
                { error: "Cannot delete category with existing products" },
                { status: 400 }
            );
        }

        const deleted = await db
            .delete(category)
            .where(eq(category.id, id))
            .returning();

        if (deleted.length === 0) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json(
            { error: "Failed to delete category" },
            { status: 500 }
        );
    }
}
