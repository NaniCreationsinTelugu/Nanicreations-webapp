import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { orders } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const { status } = await request.json();
        const orderId = parseInt(params.id);

        if (!status) {
            return NextResponse.json(
                { error: "Status is required" },
                { status: 400 }
            );
        }

        // Validate status
        const validStatuses = ["pending", "paid", "shipped", "delivered", "cancelled", "failed"];
        if (!validStatuses.includes(status.toLowerCase())) {
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 }
            );
        }

        // Update order status
        const updatedOrder = await db
            .update(orders)
            .set({
                status: status.toLowerCase(),
                updatedAt: sql`now()`
            })
            .where(eq(orders.id, orderId))
            .returning();

        if (!updatedOrder || updatedOrder.length === 0) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedOrder[0]);
    } catch (error) {
        console.error("Error updating order:", error);
        // Log the actual error message for debugging
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Error details:", errorMessage);
        return NextResponse.json(
            { error: "Failed to update order", details: errorMessage },
            { status: 500 }
        );
    }
}
