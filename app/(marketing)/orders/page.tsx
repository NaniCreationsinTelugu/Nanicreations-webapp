"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { Loader2, ChevronDown, ChevronUp, Package, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

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

export default function UserOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
    const { isSignedIn } = useUser();

    useEffect(() => {
        if (isSignedIn) {
            fetchOrders();
        }
    }, [isSignedIn]);

    // Refetch orders when page becomes visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isSignedIn) {
                fetchOrders(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isSignedIn]);

    const fetchOrders = async (silent = false) => {
        if (!silent) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        try {
            const response = await fetch("/api/orders");
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchOrders(true);
    };

    const toggleOrderDetails = (orderId: number) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    if (!isSignedIn) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
                        <p className="text-muted-foreground mb-4">
                            Please sign in to view your orders
                        </p>
                        <Link href="/collections">
                            <Button>Continue Shopping</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">My Orders</h1>
                        <p className="text-muted-foreground">
                            Track and manage your orders
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>

                {orders.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                            <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
                            <p className="text-muted-foreground mb-6">
                                You haven't placed any orders yet
                            </p>
                            <Link href="/collections">
                                <Button>Start Shopping</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Card key={order.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">
                                                Order #{order.id}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric"
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <OrderStatusBadge status={order.status} />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleOrderDetails(order.id)}
                                            >
                                                {expandedOrder === order.id ? (
                                                    <>
                                                        <ChevronUp className="h-4 w-4 mr-2" />
                                                        Hide Details
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Order Summary */}
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                {order.items.length} item(s)
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {order.shippingMethod === "fast" ? "Express" : "Standard"} Shipping
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-primary">
                                                ₹{parseFloat(order.totalAmount).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Order Items Preview */}
                                    <div className="space-y-3">
                                        {order.items.slice(0, expandedOrder === order.id ? undefined : 2).map((item) => (
                                            <div key={item.id} className="flex gap-4">
                                                {item.productImage && (
                                                    <img
                                                        src={item.productImage}
                                                        alt={item.productName}
                                                        className="h-20 w-20 object-cover rounded-lg border"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.productName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Quantity: {item.quantity}
                                                    </p>
                                                    <p className="text-sm font-semibold mt-1">
                                                        ₹{parseFloat(item.price).toFixed(2)} each
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">
                                                        ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {!expandedOrder && order.items.length > 2 && (
                                            <p className="text-sm text-muted-foreground text-center">
                                                +{order.items.length - 2} more item(s)
                                            </p>
                                        )}
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedOrder === order.id && (
                                        <div className="mt-6 pt-6 border-t space-y-4">
                                            <div>
                                                <h3 className="font-semibold mb-2">Shipping Address</h3>
                                                <div className="bg-muted p-4 rounded-lg text-sm">
                                                    {JSON.parse(order.address || "{}").name && (
                                                        <p className="font-medium">{JSON.parse(order.address).name}</p>
                                                    )}
                                                    {JSON.parse(order.address || "{}").street && (
                                                        <p>{JSON.parse(order.address).street}</p>
                                                    )}
                                                    {JSON.parse(order.address || "{}").city && (
                                                        <p>
                                                            {JSON.parse(order.address).city}, {JSON.parse(order.address).zip}
                                                        </p>
                                                    )}
                                                    {JSON.parse(order.address || "{}").country && (
                                                        <p>{JSON.parse(order.address).country}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {order.razorpayOrderId && (
                                                <div>
                                                    <h3 className="font-semibold mb-2">Order Information</h3>
                                                    <div className="bg-muted p-4 rounded-lg text-sm space-y-1">
                                                        <p>
                                                            <span className="text-muted-foreground">Order ID:</span>{" "}
                                                            {order.razorpayOrderId}
                                                        </p>
                                                        {order.razorpayPaymentId && (
                                                            <p>
                                                                <span className="text-muted-foreground">Payment ID:</span>{" "}
                                                                {order.razorpayPaymentId}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
