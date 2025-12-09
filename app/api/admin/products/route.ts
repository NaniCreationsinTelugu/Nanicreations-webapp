import { db } from "@/db/drizzle";
import { product, category } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";

// GET all products with category information
export async function GET() {
    try {
        const products = await db
            .select({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                images: product.images,
                categoryId: product.categoryId,
                categoryName: category.name,
                stock: product.stock,
            })
            .from(product)
            .leftJoin(category, eq(product.categoryId, category.id));

        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

// POST create new product
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            name,
            description,
            price,
            images,
            categoryId,
            stock = 0,
        } = body;

        if (!name || !description || !price || !images || !categoryId) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        const newProduct = await db
            .insert(product)
            .values({
                name,
                description,
                price: price.toString(),
                images,
                categoryId: parseInt(categoryId),
                stock: parseInt(stock),
            })
            .returning();

        return NextResponse.json(newProduct[0], { status: 201 });
    } catch (error: any) {
        console.error("Error creating product:", error);
        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 }
        );
    }
}
