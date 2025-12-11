"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { loadRazorpay } from "@/lib/razorpay";

export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, clear } = useCart();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"information" | "shipping" | "payment">("information");

    const [contactInfo, setContactInfo] = useState({
        email: "",
        phone: "",
    });

    const [shippingAddress, setShippingAddress] = useState({
        firstName: "",
        lastName: "",
        address: "",
        apartment: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
    });

    const [shippingMethod, setShippingMethod] = useState("standard");

    // Calculate costs in INR
    const shippingCost = shippingMethod === "fast" ? 150 : subtotal > 500 ? 0 : 50;
    const total = subtotal + shippingCost;

    const handleContinueToShipping = () => {
        if (!contactInfo.email || !shippingAddress.firstName || !shippingAddress.lastName ||
            !shippingAddress.address || !shippingAddress.city || !shippingAddress.pincode) {
            alert("Please fill in all required fields");
            return;
        }
        setStep("shipping");
    };

    const handleContinueToPayment = () => {
        setStep("payment");
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            const res = await loadRazorpay();
            if (!res) {
                alert("Razorpay SDK failed to load.");
                setLoading(false);
                return;
            }

            const response = await fetch('/api/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'cart',
                    items: items,
                    address: {
                        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
                        street: `${shippingAddress.address}, ${shippingAddress.apartment}`,
                        city: shippingAddress.city,
                        zip: shippingAddress.pincode,
                        country: shippingAddress.country,
                    },
                    shippingMethod
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                alert(data.error || "Something went wrong");
                setLoading(false);
                return;
            }

            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: "Nani Creations",
                description: "Product Purchase",
                order_id: data.id,
                handler: async function (response: any) {
                    const verifyRes = await fetch("/api/razorpay/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            type: 'cart'
                        }),
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyData.status === "success") {
                        clear();
                        alert("Order placed successfully!");
                        router.push("/collections");
                    } else {
                        alert("Payment verification failed");
                    }
                    setLoading(false);
                },
                prefill: {
                    name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
                    email: contactInfo.email,
                    contact: contactInfo.phone
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error(error);
            alert("Checkout failed");
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                    <Link href="/collections">
                        <Button>Continue Shopping</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/cart" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to cart
                    </Link>
                    <h1 className="text-3xl font-bold">Checkout</h1>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Forms */}
                    <div className="space-y-6">
                        {/* Contact Information */}
                        <div className="bg-card rounded-lg border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Contact Information</h2>
                                {step !== "information" && (
                                    <Button variant="ghost" size="sm" onClick={() => setStep("information")}>
                                        Edit
                                    </Button>
                                )}
                            </div>

                            {step === "information" ? (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={contactInfo.email}
                                            onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone (optional)</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={contactInfo.phone}
                                            onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    {contactInfo.email}
                                </div>
                            )}
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-card rounded-lg border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Shipping Address</h2>
                                {step === "payment" && (
                                    <Button variant="ghost" size="sm" onClick={() => setStep("information")}>
                                        Edit
                                    </Button>
                                )}
                            </div>

                            {step === "information" ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="firstName">First Name *</Label>
                                            <Input
                                                id="firstName"
                                                value={shippingAddress.firstName}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="lastName">Last Name *</Label>
                                            <Input
                                                id="lastName"
                                                value={shippingAddress.lastName}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="address">Address *</Label>
                                        <Input
                                            id="address"
                                            value={shippingAddress.address}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                                            placeholder="Street address"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                                        <Input
                                            id="apartment"
                                            value={shippingAddress.apartment}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, apartment: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="city">City *</Label>
                                            <Input
                                                id="city"
                                                value={shippingAddress.city}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="state">State</Label>
                                            <Input
                                                id="state"
                                                value={shippingAddress.state}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="pincode">PIN Code *</Label>
                                            <Input
                                                id="pincode"
                                                value={shippingAddress.pincode}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="country">Country</Label>
                                            <Input
                                                id="country"
                                                value={shippingAddress.country}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <Button onClick={handleContinueToShipping} className="w-full mt-6">
                                        Continue to Shipping
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                                    <p>{shippingAddress.address}</p>
                                    {shippingAddress.apartment && <p>{shippingAddress.apartment}</p>}
                                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}</p>
                                    <p>{shippingAddress.country}</p>
                                </div>
                            )}
                        </div>

                        {/* Shipping Method */}
                        {step !== "information" && (
                            <div className="bg-card rounded-lg border p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">Shipping Method</h2>
                                    {step === "payment" && (
                                        <Button variant="ghost" size="sm" onClick={() => setStep("shipping")}>
                                            Edit
                                        </Button>
                                    )}
                                </div>

                                {step === "shipping" ? (
                                    <div className="space-y-4">
                                        <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                                            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                                                <RadioGroupItem value="standard" id="standard" />
                                                <Label htmlFor="standard" className="flex-1 cursor-pointer">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="font-medium">Standard Shipping</p>
                                                            <p className="text-xs text-muted-foreground">5-7 business days</p>
                                                        </div>
                                                        <span className="font-semibold">
                                                            {subtotal > 500 ? "FREE" : "₹50.00"}
                                                        </span>
                                                    </div>
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                                                <RadioGroupItem value="fast" id="fast" />
                                                <Label htmlFor="fast" className="flex-1 cursor-pointer">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="font-medium">Express Shipping</p>
                                                            <p className="text-xs text-muted-foreground">1-2 business days</p>
                                                        </div>
                                                        <span className="font-semibold">₹150.00</span>
                                                    </div>
                                                </Label>
                                            </div>
                                        </RadioGroup>

                                        <Button onClick={handleContinueToPayment} className="w-full mt-6">
                                            Continue to Payment
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">
                                        {shippingMethod === "standard" ? "Standard Shipping (5-7 business days)" : "Express Shipping (1-2 business days)"}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payment */}
                        {step === "payment" && (
                            <div className="bg-card rounded-lg border p-6">
                                <h2 className="text-xl font-semibold mb-4">Payment</h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    All transactions are secure and encrypted.
                                </p>
                                <Button onClick={handlePayment} disabled={loading} className="w-full" size="lg">
                                    <Lock className="mr-2 h-4 w-4" />
                                    {loading ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Order Summary */}
                    <div>
                        <div className="bg-card rounded-lg border p-6 sticky top-8">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                            {/* Products */}
                            <div className="space-y-4 mb-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="h-16 w-16 rounded-lg object-cover border"
                                            />
                                            <span className="absolute -top-2 -right-2 bg-muted text-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center border">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{item.title}</p>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-4" />

                            {/* Totals */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="font-medium">
                                        {shippingCost === 0 ? "FREE" : `₹${shippingCost.toFixed(2)}`}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">₹{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
