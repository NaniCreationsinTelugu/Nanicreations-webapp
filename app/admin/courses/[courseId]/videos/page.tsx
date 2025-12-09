import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db/drizzle";
import { course, courseVideo } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
// Component import
import VideoManagement from "./VideoManagement";

interface AdminCourseVideosPageProps {
    params: Promise<{
        courseId: string;
    }>;
}

export default async function AdminCourseVideosPage({ params }: AdminCourseVideosPageProps) {
    const user = await currentUser();
    const { courseId } = await params;

    if (!user) {
        redirect('/sign-in');
    }

    const courseIdNum = parseInt(courseId);
    if (isNaN(courseIdNum)) {
        redirect('/admin/courses');
    }

    // Fetch course details
    const [courseData] = await db
        .select()
        .from(course)
        .where(eq(course.id, courseIdNum))
        .limit(1);

    if (!courseData) {
        redirect('/admin/courses');
    }

    // Fetch existing videos
    const videos = await db
        .select()
        .from(courseVideo)
        .where(eq(courseVideo.courseId, courseIdNum))
        .orderBy(asc(courseVideo.order));

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Manage Course Videos</h1>
                    <p className="text-muted-foreground">
                        Course: {courseData.name}
                    </p>
                </div>

                <VideoManagement courseId={courseIdNum} initialVideos={videos} />
            </div>
        </div>
    );
}
