import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { product, category } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
      category: category.slug,
      inStock: product.inStock,
      rating: product.rating,
      reviews: product.reviewsCount,
      images: product.images,
      specifications: product.specifications,
      features: product.features,
    })
    .from(product)
    .leftJoin(category, eq(product.categoryId, category.id));

  const normalized = rows.map((r) => ({
    ...r,
    price: typeof r.price === "string" ? Number(r.price) : r.price,
  }));

  return NextResponse.json(normalized);
}
