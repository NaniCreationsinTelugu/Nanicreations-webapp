import { db } from "@/db/drizzle";
import { product, category } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

// GET all products with category information (public endpoint)
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

        // If no products found, return empty array
        if (!products || products.length === 0) {
            return NextResponse.json([]);
        }

        // Transform the response to match the expected format
        const transformedProducts = products.map((p) => ({
            id: p.id,
            title: p.name || "",
            description: p.description || "",
            price: parseFloat(p.price as string) || 0,
            image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "/placeholder.jpg",
            category: p.categoryName || "",
            categoryId: p.categoryId,
        }));

        return NextResponse.json(transformedProducts);
    } catch (error) {
        console.error("Error fetching products:", error);
        // Return empty array instead of error object to prevent frontend crashes
        return NextResponse.json([]);
    }
}
