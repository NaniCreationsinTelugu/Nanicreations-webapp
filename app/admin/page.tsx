import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db/drizzle";
import { course, enrollment, paymentSession } from "@/db/schema";
import { sql } from "drizzle-orm";
import { BookOpen, Users, DollarSign } from "lucide-react";

export default async function AdminDashboard() {
    const [coursesCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(course);

    const [enrollmentsCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(enrollment);

    // Calculate total revenue (sum of amounts in paymentSession where status is completed)
    // Note: This is a simplified calculation.
    const [revenue] = await db
        .select({ total: sql<number>`sum(${paymentSession.amount})` })
        .from(paymentSession)
    // .where(eq(paymentSession.status, 'completed')); // Uncomment when status is reliably tracked

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹{revenue?.total || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Lifetime earnings
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{enrollmentsCount?.count || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Total students enrolled
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{coursesCount?.count || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Courses available
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
