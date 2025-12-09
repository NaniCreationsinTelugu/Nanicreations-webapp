import { db } from "@/db/drizzle";
import { product as productTable, category } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";

interface Product {
    id: number;
    name: string;
    description: string | null;
    price: string;
    images: string[] | null;
    categoryId: number | null;
    stock: number;
}

async function getProduct(id: number) {
    try {
        const products = await db
            .select({
                id: productTable.id,
                name: productTable.name,
                description: productTable.description,
                price: productTable.price,
                images: productTable.images,
                categoryId: productTable.categoryId,
                categoryName: category.name,
                stock: productTable.stock,
            })
            .from(productTable)
            .leftJoin(category, eq(productTable.categoryId, category.id))
            .where(eq(productTable.id, id))
            .limit(1);

        if (!products || products.length === 0) {
            return null;
        }

        return products[0];
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

async function getRelatedProducts(categoryId: number, currentProductId: number) {
    try {
        const products = await db
            .select({
                id: productTable.id,
                name: productTable.name,
                description: productTable.description,
                price: productTable.price,
                images: productTable.images,
                categoryId: productTable.categoryId,
                categoryName: category.name,
                stock: productTable.stock,
            })
            .from(productTable)
            .leftJoin(category, eq(productTable.categoryId, category.id))
            .where(eq(productTable.categoryId, categoryId))
            .limit(5);

        // Filter out current product and limit to 4
        return products
            .filter(p => p.id !== currentProductId)
            .slice(0, 4)
            .map(p => ({
                id: p.id,
                title: p.name || "",
                description: p.description || "",
                price: parseFloat(p.price) || 0,
                image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "/placeholder.jpg",
                category: p.categoryName || "",
            }));
    } catch (error) {
        console.error("Error fetching related products:", error);
        return [];
    }
}

export default async function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: paramId } = await params;
    const productId = parseInt(paramId);

    if (isNaN(productId)) {
        notFound();
    }

    const product = await getProduct(productId);

    if (!product) {
        notFound();
    }

    const relatedProducts = product.categoryId
        ? await getRelatedProducts(product.categoryId, product.id)
        : [];

    // Transform product data to match client expectations
    const transformedProduct = {
        id: product.id,
        title: product.name || "",
        description: product.description || "",
        price: parseFloat(product.price) || 0,
        images: Array.isArray(product.images) && product.images.length > 0
            ? product.images
            : ["/placeholder.jpg"],
        image: Array.isArray(product.images) && product.images.length > 0
            ? product.images[0]
            : "/placeholder.jpg",
        category: product.categoryName || "Uncategorized",
        inStock: product.stock > 0,
        stock: product.stock,
        rating: 0,
        reviews: 0,
        specifications: [],
        features: [],
    };

    return <ProductDetailClient product={transformedProduct} relatedProducts={relatedProducts} />;
}
