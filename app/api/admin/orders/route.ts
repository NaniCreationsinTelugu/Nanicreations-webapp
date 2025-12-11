import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { orders, orderItems, product } from "@/db/schema";
import { eq, sql, like, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const search = searchParams.get("search");

        // Build query conditions
        const conditions = [];

        if (status && status !== "all") {
            conditions.push(eq(orders.status, status));
        }

        if (search) {
            conditions.push(
                or(
                    like(orders.razorpayOrderId, `%${search}%`),
                    like(orders.userId, `%${search}%`)
                )
            );
        }

        // Fetch orders with conditions
        let allOrders;
        if (conditions.length > 0) {
            allOrders = await db
                .select()
                .from(orders)
                .where(sql`${sql.join(conditions, sql` AND `)}`)
                .orderBy(sql`${orders.createdAt} DESC`);
        } else {
            allOrders = await db
                .select()
                .from(orders)
                .orderBy(sql`${orders.createdAt} DESC`);
        }

        // Fetch order items for each order
        const ordersWithItems = await Promise.all(
            allOrders.map(async (order) => {
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
        console.error("Error fetching orders:", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}
