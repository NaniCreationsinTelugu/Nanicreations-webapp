import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db/drizzle";
import { course } from "@/db/schema";
import { Plus, Video } from "lucide-react";
import Link from "next/link";

export default async function CoursesPage() {
    const courses = await db.select().from(course);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Courses</h1>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Course
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((c) => (
                    <Card key={c.id}>
                        <CardHeader>
                            <CardTitle>{c.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                {c.description}
                            </p>
                            <div className="flex items-center justify-between text-sm mb-4">
                                <span className="font-medium">₹{c.price}</span>
                                <span className="text-muted-foreground">{c.lessons} lessons</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/courses/${c.id}/videos`}>
                                        <Video className="mr-2 h-4 w-4" />
                                        Videos
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm">Edit</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {courses.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground">
                        No courses found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
