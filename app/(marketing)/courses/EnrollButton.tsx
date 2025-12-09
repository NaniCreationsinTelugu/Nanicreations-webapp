'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";

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
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ courseId }),
            });

            const data = await response.json();

            if (response.ok && data.url) {
                // Redirect to Stripe checkout
                window.location.href = data.url;
            } else {
                alert(data.error || 'Failed to create checkout session');
                setLoading(false);
            }
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
