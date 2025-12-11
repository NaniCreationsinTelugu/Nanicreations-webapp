'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { loadRazorpay } from "@/lib/razorpay";

interface EnrollButtonProps {
    courseId: number;
}

export default function EnrollButton({ courseId }: EnrollButtonProps) {
    const [loading, setLoading] = useState(false);
    const { isSignedIn } = useUser();

    const handleEnroll = async () => {
        if (!isSignedIn) {
            return; // SignInButton will handle this
        }

        setLoading(true);
        try {
            // Load Razorpay script
            const res = await loadRazorpay();
            if (!res) {
                alert("Razorpay SDK failed to load. Are you online?");
                setLoading(false);
                return;
            }

            // Create Order
            const response = await fetch('/api/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'course', courseId }),
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
                description: "Course Enrollment",
                // image: "/logo.png", // Add logo if available
                order_id: data.id,
                handler: async function (response: any) {
                    // Verify Payment
                    const verifyRes = await fetch("/api/razorpay/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            type: 'course'
                        }),
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyData.status === "success") {
                        window.location.href = `/courses/${courseId}`; // Or success page
                    } else {
                        alert("Payment verification failed");
                    }
                    setLoading(false);
                },
                prefill: {
                    name: "", // Can fetch from User if available
                    email: "",
                    contact: ""
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error('Checkout error:', error);
            alert('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    if (!isSignedIn) {
        return (
            <SignInButton mode="modal">
                <Button className="w-full">
                    Sign In to Enroll
                </Button>
            </SignInButton>
        );
    }

    return (
        <Button
            className="w-full"
            onClick={handleEnroll}
            disabled={loading}
        >
            {loading ? 'Processing...' : 'Enroll Now'}
        </Button>
    );
}
