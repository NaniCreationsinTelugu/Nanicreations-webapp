'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, useUser } from "@clerk/nextjs";

interface EnrollButtonProps {
    courseId: number;
}

export default function EnrollButton({ courseId }: EnrollButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { isSignedIn, user } = useUser();

    const handleEnroll = async () => {
        if (!isSignedIn) {
            return; // SignInButton will handle this
        }

        setLoading(true);
        try {
            const response = await fetch('/api/enroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ courseId }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to course page
                router.push(`/courses/${courseId}?success=true`);
                router.refresh();
            } else {
                alert(data.error || 'Failed to enroll');
                setLoading(false);
            }
        } catch (error) {
            console.error('Enrollment error:', error);
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
            {loading ? 'Enrolling...' : 'Enroll Now (Free)'}
        </Button>
    );
}
