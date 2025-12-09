import { db } from "@/db/drizzle";
import { product } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

// PUT update product
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paramId } = await params;
        const id = parseInt(paramId);
        const body = await request.json();
        const {
            name,
            description,
            price,
            images,
            categoryId,
            stock,
        } = body;

        if (!name || !description || !price || !images || !categoryId) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        const updatedProduct = await db
            .update(product)
            .set({
                name,
                description,
                price: price.toString(),
                images,
                categoryId: parseInt(categoryId),
                stock: parseInt(stock),
            })
            .where(eq(product.id, id))
            .returning();

        if (updatedProduct.length === 0) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedProduct[0]);
    } catch (error: any) {
        console.error("Error updating product:", error);
        return NextResponse.json(
            { error: "Failed to update product" },
            { status: 500 }
        );
    }
}

// DELETE product
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paramId } = await params;
        const id = parseInt(paramId);

        const deleted = await db
            .delete(product)
            .where(eq(product.id, id))
            .returning();

        if (deleted.length === 0) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
        );
    }
}
