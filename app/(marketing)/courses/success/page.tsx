'use client';

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [courseId, setCourseId] = useState<number | null>(null);
    const [message, setMessage] = useState('Processing your payment...');

    useEffect(() => {
        const processPayment = async () => {
            const sessionId = searchParams.get('session_id');
            const paymentSessionId = searchParams.get('payment_session_id');

            if (!sessionId || !paymentSessionId) {
                setStatus('error');
                setMessage('Invalid payment session');
                return;
            }

            try {
                const response = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sessionId,
                        paymentSessionId: parseInt(paymentSessionId),
                    }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    setStatus('success');
                    setMessage('Payment successful! You are now enrolled in the course.');
                    setCourseId(data.courseId);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Payment verification failed');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                setStatus('error');
                setMessage('An error occurred while verifying your payment');
            }
        };

        processPayment();
    }, [searchParams]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
                        <h1 className="mt-4 text-2xl font-bold">{message}</h1>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                        <h1 className="mt-4 text-2xl font-bold">Payment Successful!</h1>
                        <p className="mt-2 text-muted-foreground">{message}</p>
                        <div className="mt-6 flex flex-col gap-3">
                            {courseId && (
                                <Link href={`/courses/${courseId}`}>
                                    <Button className="w-full">Go to Course</Button>
                                </Link>
                            )}
                            <Link href="/courses">
                                <Button variant="outline" className="w-full">
                                    Browse All Courses
                                </Button>
                            </Link>
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="mx-auto h-16 w-16 text-red-500" />
                        <h1 className="mt-4 text-2xl font-bold">Payment Failed</h1>
                        <p className="mt-2 text-muted-foreground">{message}</p>
                        <div className="mt-6">
                            <Link href="/courses">
                                <Button className="w-full">Back to Courses</Button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function PaymentSuccess() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}
