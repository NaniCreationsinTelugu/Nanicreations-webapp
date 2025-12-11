import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { orders, orderItems, product } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Fetch user's orders
        const userOrders = await db
            .select()
            .from(orders)
            .where(eq(orders.userId, user.id))
            .orderBy(sql`${orders.createdAt} DESC`);

        // Fetch order items for each order
        const ordersWithItems = await Promise.all(
            userOrders.map(async (order) => {
                const items = await db
                    .select({
                        id: orderItems.id,
                        productId: orderItems.productId,
                        quantity: orderItems.quantity,
                        price: orderItems.price,
                        productName: product.name,
                        productImage: product.images,
                    })
                    .from(orderItems)
                    .leftJoin(product, eq(orderItems.productId, product.id))
                    .where(eq(orderItems.orderId, order.id));

                return {
                    ...order,
                    items: items.map(item => ({
                        ...item,
                        productImage: item.productImage?.[0] || null,
                    })),
                };
            })
        );

        return NextResponse.json(ordersWithItems);
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}
