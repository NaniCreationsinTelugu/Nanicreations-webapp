import { db } from "@/db/drizzle";
import { product } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

// GET single product by ID
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paramId } = await params;
        const id = parseInt(paramId);

        if (isNaN(id)) {
            return NextResponse.json(
                { error: "Invalid product ID" },
                { status: 400 }
            );
        }

        const products = await db
            .select({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                images: product.images,
                categoryId: product.categoryId,
                stock: product.stock,
            })
            .from(product)
            .where(eq(product.id, id))
            .limit(1);

        if (!products || products.length === 0) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        const p = products[0];

        // Transform the response to match the expected format
        const transformedProduct = {
            id: p.id,
            title: p.name || "",
            description: p.description || "",
            price: parseFloat(p.price as string) || 0,
            images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ["/placeholder.jpg"],
            image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "/placeholder.jpg",
            category: p.categoryId?.toString() || "",
            inStock: p.stock > 0,
            stock: p.stock,
            // Default values for fields not in the schema
            rating: 0,
            reviews: 0,
            specifications: [],
            features: [],
        };

        return NextResponse.json(transformedProduct);
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json(
            { error: "Failed to fetch product" },
            { status: 500 }
        );
    }
}
