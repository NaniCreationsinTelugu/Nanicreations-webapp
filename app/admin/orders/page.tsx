"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { Search, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type OrderItem = {
    id: number;
    productId: number;
    quantity: number;
    price: string;
    productName: string;
    productImage: string | null;
};

type Order = {
    id: number;
    userId: string;
    totalAmount: string;
    status: string;
    address: string;
    shippingMethod: string;
    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, searchTerm, statusFilter]);

    const fetchOrders = async () => {
        try {
            const response = await fetch("/api/admin/orders");
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast({
                title: "Error",
                description: "Failed to fetch orders",
            });
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = orders;

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter((order) => order.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (order) =>
                    order.id.toString().includes(searchTerm) ||
                    order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.razorpayOrderId?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredOrders(filtered);
    };

    const updateOrderStatus = async (orderId: number, newStatus: string) => {
        try {
            const response = await fetch(`/api/admin/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Order status updated",
                });
                fetchOrders();
            } else {
                throw new Error("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating order:", error);
            toast({
                title: "Error",
                description: "Failed to update order status",
            });
        }
    };

    const toggleOrderDetails = (orderId: number) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Orders Management</h1>
                <p className="text-muted-foreground">
                    Manage and track all customer orders
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by Order ID, User ID, or Razorpay Order ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Orders</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Orders ({filteredOrders.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No orders found
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredOrders.map((order) => (
                                <div key={order.id} className="border rounded-lg">
                                    <div className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleOrderDetails(order.id)}
                                                >
                                                    {expandedOrder === order.id ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <div>
                                                    <p className="font-semibold">Order #{order.id}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="font-semibold">₹{parseFloat(order.totalAmount).toFixed(2)}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {order.items.length} item(s)
                                                    </p>
                                                </div>
                                                <Select
                                                    value={order.status}
                                                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                                                >
                                                    <SelectTrigger className="w-[150px]">
                                                        <OrderStatusBadge status={order.status} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="paid">Paid</SelectItem>
                                                        <SelectItem value="shipped">Shipped</SelectItem>
                                                        <SelectItem value="delivered">Delivered</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedOrder === order.id && (
                                        <div className="border-t p-4 bg-muted/50">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* Order Items */}
                                                <div>
                                                    <h3 className="font-semibold mb-3">Order Items</h3>
                                                    <div className="space-y-2">
                                                        {order.items.map((item) => (
                                                            <div key={item.id} className="flex gap-3 bg-background p-3 rounded-lg">
                                                                {item.productImage && (
                                                                    <img
                                                                        src={item.productImage}
                                                                        alt={item.productName}
                                                                        className="h-16 w-16 object-cover rounded"
                                                                    />
                                                                )}
                                                                <div className="flex-1">
                                                                    <p className="font-medium">{item.productName}</p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Qty: {item.quantity} × ₹{parseFloat(item.price).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                                <p className="font-semibold">
                                                                    ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Shipping & Payment Info */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <h3 className="font-semibold mb-2">Shipping Address</h3>
                                                        <div className="bg-background p-3 rounded-lg text-sm">
                                                            {JSON.parse(order.address || "{}").name && (
                                                                <p>{JSON.parse(order.address).name}</p>
                                                            )}
                                                            {JSON.parse(order.address || "{}").street && (
                                                                <p>{JSON.parse(order.address).street}</p>
                                                            )}
                                                            {JSON.parse(order.address || "{}").city && (
                                                                <p>
                                                                    {JSON.parse(order.address).city}, {JSON.parse(order.address).zip}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h3 className="font-semibold mb-2">Payment Details</h3>
                                                        <div className="bg-background p-3 rounded-lg text-sm space-y-1">
                                                            <p>
                                                                <span className="text-muted-foreground">Shipping:</span>{" "}
                                                                {order.shippingMethod === "fast" ? "Express" : "Standard"}
                                                            </p>
                                                            {order.razorpayOrderId && (
                                                                <p>
                                                                    <span className="text-muted-foreground">Razorpay Order:</span>{" "}
                                                                    {order.razorpayOrderId}
                                                                </p>
                                                            )}
                                                            {order.razorpayPaymentId && (
                                                                <p>
                                                                    <span className="text-muted-foreground">Payment ID:</span>{" "}
                                                                    {order.razorpayPaymentId}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
